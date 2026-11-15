import { createHash, timingSafeEqual } from "node:crypto";
import { DEFAULT_ADMIN_USER_ID } from "@studysmart/shared";
import type { NextFunction, Request, Response } from "express";

export { DEFAULT_ADMIN_USER_ID };

/**
 * Stop-gap admin protection until real accounts arrive in Module 6 (Better Auth + roles).
 * Sign-in is a user id (ADMIN_USER_ID, sent as x-admin-user, compared case-insensitively) plus the secret ADMIN_KEY (x-admin-key).
 * Both are checked in constant time and every wrong try counts towards the same per-IP lockout.
 * When no user id is configured (adminUserId undefined) only the key is checked, as before.
 */

const digest = (s: string) => createHash("sha256").update(s).digest();
/** Constant-time string equality (hashes first so length does not leak). */
export function safeEqual(a: string, b: string): boolean { return timingSafeEqual(digest(a), digest(b)); }

function userHeader(req: Request): string {
  const raw = String(req.header("x-admin-user") ?? "");
  try { return decodeURIComponent(raw); } catch { return raw; }
}

export function requireAdmin(adminKey: string | null, adminUserId?: string | null) {
  const fails = new Map<string, { n: number; until: number }>();
  const LIMIT = 8, WINDOW_MS = 10 * 60 * 1000;
  return (req: Request, res: Response, next: NextFunction) => {
    if (!adminKey) return void res.status(403).json({ error: { code: "admin_disabled", message: "Admin access is not configured. Set ADMIN_KEY on the server." } });
    const ip = req.ip ?? "unknown";
    const rec = fails.get(ip);
    if (rec && rec.n >= LIMIT && rec.until > Date.now()) return void res.status(429).json({ error: { code: "too_many_attempts", message: "Too many wrong tries. Try again in a few minutes." } });
    const keyOk = safeEqual(String(req.header("x-admin-key") ?? ""), adminKey);
    const userOk = adminUserId ? safeEqual(userHeader(req).trim().toLowerCase(), adminUserId.trim().toLowerCase()) : true;
    if (keyOk && userOk) { fails.delete(ip); return next(); }
    const n = rec && rec.until > Date.now() ? rec.n + 1 : 1;
    fails.set(ip, { n, until: Date.now() + WINDOW_MS });
    res.status(401).json({ error: { code: "unauthorized", message: adminUserId ? "Wrong user id or admin key." : "Wrong admin key." } });
  };
}

/** Production must use a long random key; refuse to start otherwise. */
export function resolveAdminKey(env: NodeJS.ProcessEnv): string | null {
  const key = env.ADMIN_KEY?.trim();
  if (env.NODE_ENV === "production") {
    if (!key || key.length < 24) throw new Error("ADMIN_KEY must be set to at least 24 characters in production");
    return key;
  }
  if (key) return key;
  console.warn("ADMIN_KEY not set: using the development key 'dev-admin-key'. Never deploy like this.");
  return "dev-admin-key";
}

/** The user id that may sign in to /admin. ADMIN_USER_ID in the environment, else the owner's address. */
export function resolveAdminUserId(env: NodeJS.ProcessEnv): string {
  return env.ADMIN_USER_ID?.trim() || DEFAULT_ADMIN_USER_ID;
}
