import type { NextFunction, Request, Response } from "express";

/** Small in-memory per-IP limiter (one server process). Replace with a shared store if we ever run several. */
export function rateLimit(opts: { windowMs: number; max: number; message?: string }) {
  const hits = new Map<string, { n: number; reset: number }>();
  let last = Date.now();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (now - last > opts.windowMs) { for (const [k, v] of hits) if (v.reset < now) hits.delete(k); last = now; } // keep the map small
    const ip = req.ip ?? "unknown";
    const rec = hits.get(ip);
    if (!rec || rec.reset < now) { hits.set(ip, { n: 1, reset: now + opts.windowMs }); return next(); }
    if (++rec.n > opts.max) {
      res.set("Retry-After", String(Math.ceil((rec.reset - now) / 1000)));
      return void res.status(429).json({ error: { code: "rate_limited", message: opts.message ?? "Too many requests. Please slow down." } });
    }
    next();
  };
}
