/**
 * Google ile yönetici girişi (Authorization Code + PKCE).
 *
 * Akış: /api/admin/login → Google onay ekranı → /api/admin/callback → çerez → /admin
 * Kimlik doğrulandıktan sonra e-posta ADMIN_EMAILS listesinde değilse giriş reddedilir.
 */
import crypto from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { ADMIN_ENV, adminConfigProblems, isAllowedEmail, redirectUri } from "./env.js";
import { clearAdminSession, issueAdminSession, readAdminSession } from "./session.js";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

const STATE_COOKIE = "admin_oauth_state";
const VERIFIER_COOKIE = "admin_oauth_verifier";
const HANDSHAKE_TTL_MS = 10 * 60 * 1000;

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

function base64Url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function handshakeCookieOptions(req: Request) {
  const forwarded = req.headers["x-forwarded-proto"];
  const list = Array.isArray(forwarded) ? forwarded : forwarded?.split(",");
  const secure = req.protocol === "https" || Boolean(list?.some((p) => p.trim().toLowerCase() === "https"));
  return { httpOnly: true, path: "/", sameSite: "lax" as const, secure, maxAge: HANDSHAKE_TTL_MS };
}

function readCookie(req: Request, name: string) {
  const header = req.headers.cookie;
  return header ? parseCookieHeader(header)[name] : undefined;
}

/** Hata sayfası yerine panele dönüp anlaşılır bir mesaj göstermek için. */
function failLogin(res: Response, reason: string) {
  res.redirect(302, `/admin?error=${encodeURIComponent(reason)}`);
}

export function registerAdminAuthRoutes(app: Express) {
  app.get("/api/admin/login", (req: Request, res: Response) => {
    const problems = adminConfigProblems();
    if (problems.length) {
      failLogin(res, `Sunucu yapılandırması eksik: ${problems.join(", ")}`);
      return;
    }

    // PKCE: doğrulayıcı yalnızca bu tarayıcıda kalır, kod çalınsa bile kullanılamaz.
    const verifier = base64Url(crypto.randomBytes(48));
    const challenge = base64Url(crypto.createHash("sha256").update(verifier).digest());
    const state = base64Url(crypto.randomBytes(24));

    const options = handshakeCookieOptions(req);
    res.cookie(STATE_COOKIE, state, options);
    res.cookie(VERIFIER_COOKIE, verifier, options);

    const url = new URL(AUTH_ENDPOINT);
    url.searchParams.set("client_id", ADMIN_ENV.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri(req));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("prompt", "select_account");
    // Tek bir hesaba kilitliyse Google doğrudan o hesabı önersin.
    if (ADMIN_ENV.allowedEmails.length === 1) {
      url.searchParams.set("login_hint", ADMIN_ENV.allowedEmails[0]);
    }

    res.redirect(302, url.toString());
  });

  app.get("/api/admin/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const expectedState = readCookie(req, STATE_COOKIE);
    const verifier = readCookie(req, VERIFIER_COOKIE);

    const clearOptions = { ...handshakeCookieOptions(req), maxAge: -1 };
    res.clearCookie(STATE_COOKIE, clearOptions);
    res.clearCookie(VERIFIER_COOKIE, clearOptions);

    if (typeof req.query.error === "string") {
      failLogin(res, `Google girişi iptal edildi (${req.query.error})`);
      return;
    }
    if (!code || !state || !verifier || !expectedState || state !== expectedState) {
      failLogin(res, "Giriş isteği doğrulanamadı, tekrar deneyin");
      return;
    }

    try {
      const tokenResponse = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ADMIN_ENV.googleClientId,
          client_secret: ADMIN_ENV.googleClientSecret,
          redirect_uri: redirectUri(req),
          grant_type: "authorization_code",
          code_verifier: verifier,
        }),
      });

      if (!tokenResponse.ok) {
        const detail = await tokenResponse.text().catch(() => tokenResponse.statusText);
        console.error("[Admin] Google token exchange failed:", detail);
        failLogin(res, "Google ile kod değişimi başarısız");
        return;
      }

      const tokens = (await tokenResponse.json()) as { id_token?: string };
      if (!tokens.id_token) {
        failLogin(res, "Google kimlik belgesi alınamadı");
        return;
      }

      const { payload } = await jwtVerify(tokens.id_token, googleJwks, {
        issuer: ISSUERS,
        audience: ADMIN_ENV.googleClientId,
      });

      const email = typeof payload.email === "string" ? payload.email : "";
      const emailVerified = payload.email_verified === true || payload.email_verified === "true";

      if (!email || !emailVerified) {
        failLogin(res, "Google hesabının e-postası doğrulanmamış");
        return;
      }
      if (!isAllowedEmail(email)) {
        console.warn("[Admin] Reddedilen giriş denemesi:", email);
        failLogin(res, "Bu hesabın yönetim paneline erişimi yok");
        return;
      }

      await issueAdminSession(res, req, {
        email,
        name: typeof payload.name === "string" ? payload.name : email,
        picture: typeof payload.picture === "string" ? payload.picture : undefined,
      });

      res.redirect(302, "/admin");
    } catch (error) {
      console.error("[Admin] Google callback error:", error);
      failLogin(res, "Giriş sırasında beklenmeyen bir hata oluştu");
    }
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    clearAdminSession(res, req);
    res.json({ success: true });
  });

  /** Panelin açılışta oturumu ve yapılandırmayı sorduğu uç. */
  app.get("/api/admin/session", async (req: Request, res: Response) => {
    const session = await readAdminSession(req);
    res.json({
      session,
      configured: adminConfigProblems().length === 0,
      missingConfig: adminConfigProblems(),
      storageReady: Boolean(ADMIN_ENV.blobToken),
    });
  });
}
