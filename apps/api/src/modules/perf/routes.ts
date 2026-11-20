import { existsSync, readFileSync, rmSync } from "node:fs";
import { Router, type NextFunction, type Request, type Response } from "express";
import type { ClassroomService } from "../classroom/service.js";
import type { CurriculumRepository } from "../curriculum/repository.js";
import type { SettingsService } from "../settings/service.js";
import { requireAdmin } from "../settings/admin-auth.js";
import { setPerf } from "./config.js";

/** Copies the admin "perf.*" settings into the speed config on each request (the settings are cached in memory, so this costs next to nothing). */
export function perfConfigMiddleware(settings: SettingsService) {
  return async (_req: Request, _res: Response, next: NextFunction) => { try { setPerf(await settings.all()); } catch { /* keep the previous values */ } next(); };
}

export interface PerfAdminDeps { classroom?: ClassroomService; curriculum: CurriculumRepository; seedStateFile?: string }

/** Admin only: what the speed-ups are doing, and buttons to rebuild them. */
export function adminPerfRoutes(d: PerfAdminDeps, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  const seed = () => {
    if (!d.seedStateFile || !existsSync(d.seedStateFile)) return null;
    try {
      const j = JSON.parse(readFileSync(d.seedStateFile, "utf8")) as { files: Record<string, string>; counts: unknown; failed: Record<string, string>; savedAt: string };
      const n = (p: string) => Object.keys(j.files).filter((k) => k.startsWith(p)).length;
      return { savedAt: j.savedAt, curriculumFiles: n("curriculum/"), lessonFiles: n("lessons/"), questionFiles: n("questions/"), counts: j.counts, skipped: Object.entries(j.failed ?? {}).slice(0, 50).map(([file, why]) => ({ file, why })), skippedTotal: Object.keys(j.failed ?? {}).length };
    } catch { return null; }
  };
  const status = () => ({ classroom: d.classroom?.status?.() ?? null, startup: seed(), nodeMemoryMb: Math.round(process.memoryUsage().rss / 1048576), uptimeSeconds: Math.round(process.uptime()) });
  r.get("/", (_req, res) => void res.json(status()));
  r.post("/rebuild-classroom", (_req, res) => { const out = d.classroom?.rebuild?.() ?? null; res.json({ ...status(), rebuilt: out }); });
  r.post("/clear-curriculum-cache", (_req, res) => { d.curriculum.invalidate?.(); res.json(status()); });
  r.post("/reload-all-next-start", (_req, res) => {
    // removing the "already loaded" marks makes the next start load every lesson and question again
    let removed = false;
    if (d.seedStateFile && existsSync(d.seedStateFile)) { try { rmSync(d.seedStateFile); removed = true; } catch { /* leave it */ } }
    res.json({ ...status(), removed });
  });
  return r;
}
