/** Yönetim paneline özel ortam değişkenleri. Hiçbiri istemciye sızmaz. */
import type { Request } from "express";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const ADMIN_ENV = {
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  /** Virgülle ayrılmış izinli e-posta listesi. Boşsa hiç kimse giremez. */
  allowedEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
  /** Oturum çerezini imzalayan gizli anahtar. */
  sessionSecret: process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || "",
  /** OAuth dönüş adresi için site kökü, örn. https://onurinal.vercel.app */
  baseUrl: trimTrailingSlash(process.env.ADMIN_BASE_URL ?? ""),
  blobToken: process.env.BLOB_READ_WRITE_TOKEN ?? "",
};

/** Panelin çalışması için gereken her şey tanımlı mı? */
export function adminConfigProblems(): string[] {
  const problems: string[] = [];
  if (!ADMIN_ENV.googleClientId) problems.push("GOOGLE_CLIENT_ID");
  if (!ADMIN_ENV.googleClientSecret) problems.push("GOOGLE_CLIENT_SECRET");
  if (!ADMIN_ENV.allowedEmails.length) problems.push("ADMIN_EMAILS");
  if (!ADMIN_ENV.sessionSecret) problems.push("ADMIN_SESSION_SECRET");
  return problems;
}

/**
 * Sitenin kökü. ADMIN_BASE_URL tanımlıysa o kullanılır; değilse isteğin
 * kendisinden türetilir (yerel geliştirmede pratik olsun diye).
 */
export function resolveBaseUrl(req: Request): string {
  if (ADMIN_ENV.baseUrl) return ADMIN_ENV.baseUrl;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(",")[0]?.trim() || req.protocol;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  const hostValue = Array.isArray(host) ? host[0] : host;
  return trimTrailingSlash(`${proto}://${hostValue ?? "localhost:3000"}`);
}

export function redirectUri(req: Request) {
  return `${resolveBaseUrl(req)}/api/admin/callback`;
}

export function isAllowedEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_ENV.allowedEmails.includes(email.trim().toLowerCase());
}
