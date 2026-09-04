/** Yönetici oturumu: imzalı, httpOnly bir JWT çerezi. Veritabanı gerektirmez. */
import type { CookieOptions, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import { ADMIN_ENV, isAllowedEmail } from "./env.js";

export const ADMIN_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const ISSUER = "onurinal-admin";

export type AdminSession = {
  email: string;
  name: string;
  picture?: string;
};

function secretKey() {
  if (!ADMIN_ENV.sessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET (veya JWT_SECRET) tanımlı değil");
  }
  return new TextEncoder().encode(ADMIN_ENV.sessionSecret);
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;
  const forwarded = req.headers["x-forwarded-proto"];
  const list = Array.isArray(forwarded) ? forwarded : forwarded?.split(",");
  return Boolean(list?.some((proto) => proto.trim().toLowerCase() === "https"));
}

/**
 * OAuth dönüşünde çerezin tarayıcıya ulaşabilmesi için sameSite "lax" olmalı;
 * "strict" olsaydı Google'dan gelen yönlendirmede çerez gönderilmezdi.
 */
export function adminCookieOptions(req: Request): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}

export async function issueAdminSession(res: Response, req: Request, session: AdminSession) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setSubject(session.email)
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SESSION_TTL_MS))
    .sign(secretKey());

  res.cookie(ADMIN_COOKIE, token, { ...adminCookieOptions(req), maxAge: SESSION_TTL_MS });
}

export function clearAdminSession(res: Response, req: Request) {
  res.clearCookie(ADMIN_COOKIE, { ...adminCookieOptions(req), maxAge: -1 });
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  return parseCookieHeader(header)[name];
}

/**
 * Çerezi doğrular. İmza geçerli olsa bile e-posta hâlâ izin listesinde olmalı;
 * böylece bir adres listeden çıkarıldığında eski çerezler de anında geçersizleşir.
 */
export async function readAdminSession(req: Request): Promise<AdminSession | null> {
  const token = readCookie(req, ADMIN_COOKIE);
  if (!token || !ADMIN_ENV.sessionSecret) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!isAllowedEmail(email)) return null;
    return {
      email,
      name: typeof payload.name === "string" ? payload.name : email,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch {
    return null;
  }
}
