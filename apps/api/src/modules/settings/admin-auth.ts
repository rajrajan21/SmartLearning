import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

/**
 * Stop-gap admin protection until real accounts arrive in Module 6 (Better Auth + roles).
 * One secret (ADMIN_KEY) sent as the x-admin-key header. Wrong guesses are rate limited per IP.
 */
export function requireAdmin(adminKey: string | null) {
  const fails = new Map<string, { n: number; until: number }>();
  const LIMIT = 8, WINDOW_MS = 10 * 60 * 1000;
  return (req: Request, res: Response, next: NextFunction) => {
    if (!adminKey) return void res.status(403).json({ error: { code: "admin_disabled", message: "Admin access is not configured. Set ADMIN_KEY on the server." } });
    const ip = req.ip ?? "unknown";
    const rec = fails.get(ip);
    if (rec && rec.n >= LIMIT && rec.until > Date.now()) return void res.status(429).json({ error: { code: "too_many_attempts", message: "Too many wrong keys. Try again in a few minutes." } });
    const given = Buffer.from(String(req.header("x-admin-key") ?? ""));
    const want = Buffer.from(adminKey);
    if (given.length === want.length && timingSafeEqual(given, want)) { fails.delete(ip); return next(); }
    const n = rec && rec.until > Date.now() ? rec.n + 1 : 1;
    fails.set(ip, { n, until: Date.now() + WINDOW_MS });
    res.status(401).json({ error: { code: "unauthorized", message: "Wrong admin key." } });
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
