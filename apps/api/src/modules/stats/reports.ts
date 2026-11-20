import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../../http/rate-limit.js";
import { requireAdmin } from "../settings/admin-auth.js";
import type { SettingsService } from "../settings/service.js";

export const ReportIn = z.object({
  kind: z.enum(["question", "lesson", "page", "other"]),
  about: z.string().max(200), // what it is about: a question id, a lesson path, a page
  text: z.string().trim().min(3).max(600),
});
export interface ProblemReport { id: string; kind: string; about: string; text: string; at: string; status: "new" | "seen" | "fixed" }
export interface ReportsService { add(i: z.infer<typeof ReportIn>, max: number): ProblemReport; list(): ProblemReport[]; setStatus(id: string, s: ProblemReport["status"]): boolean }

/** "Report a problem" notes from students and parents, kept in a small file (no personal data is asked for). */
export function createReportsService(file: string | null): ReportsService {
  let rows: ProblemReport[] = [];
  if (file && existsSync(file)) { try { rows = JSON.parse(readFileSync(file, "utf8")) as ProblemReport[]; } catch { rows = []; } }
  const save = () => { if (!file) return; try { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(rows)); } catch { /* best effort */ } };
  return {
    add(i, max) { const r: ProblemReport = { id: randomUUID(), ...i, at: new Date().toISOString(), status: "new" }; rows = [r, ...rows].slice(0, max); save(); return r; },
    list() { return rows; },
    setStatus(id, s) { const r = rows.find((x) => x.id === id); if (!r) return false; r.status = s; save(); return true; },
  };
}

export function reportRoutes(svc: ReportsService, settings: SettingsService, adminKey: string | null, adminUserId?: string): { pub: Router; adm: Router } {
  const pub = Router();
  pub.post("/", rateLimit({ windowMs: 60_000, max: 6 }), async (req, res) => {
    const all = await settings.all();
    if (all["reports.enabled"] !== true) { res.status(404).json({ error: "off" }); return; }
    const p = ReportIn.safeParse(req.body);
    if (!p.success) { res.status(400).json({ error: "Please write a few words about the problem." }); return; }
    svc.add(p.data, Number(all["reports.maxKept"]) || 500);
    res.status(201).json({ ok: true });
  });
  const adm = Router();
  adm.use(requireAdmin(adminKey, adminUserId));
  adm.get("/", (_req, res) => void res.json({ reports: svc.list() }));
  adm.patch("/:id", (req, res) => {
    const s = z.enum(["new", "seen", "fixed"]).safeParse((req.body as { status?: string } | undefined)?.status);
    if (!s.success || !svc.setStatus(String(req.params.id), s.data)) { res.status(400).json({ error: "bad request" }); return; }
    res.json({ ok: true });
  });
  return { pub, adm };
}
