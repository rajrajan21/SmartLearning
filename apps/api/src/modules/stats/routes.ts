import { Router } from "express";
import { rateLimit } from "../../http/rate-limit.js";
import { requireAdmin } from "../settings/admin-auth.js";
import type { SettingsService } from "../settings/service.js";
import type { StatsService } from "./service.js";

/** Page-view beacon (public, rate limited, off when stats.enabled is false). */
export function statsBeacon(stats: StatsService, settings: SettingsService): Router {
  const r = Router();
  r.post("/view", rateLimit({ windowMs: 60_000, max: 120 }), async (req, res) => {
    if ((await settings.all())["stats.enabled"] === true) stats.view(req.ip ?? "", String(req.header("user-agent") ?? ""), String((req.body as { path?: string } | undefined)?.path ?? "/"));
    res.status(204).end();
  });
  return r;
}
export function adminStatsRoutes(stats: StatsService, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  r.get("/", (req, res) => { const d = Math.min(90, Math.max(1, Number(req.query.days) || 14)); res.json(stats.report(d)); });
  return r;
}
