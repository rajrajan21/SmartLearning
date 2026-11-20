import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Router, type Response } from "express";
import { z } from "zod";
import type { PaperIndex, PaperIndexEntry, SettingValue } from "@studysmart/shared";
import { requireAdmin } from "../settings/admin-auth.js";
import type { SettingsService } from "../settings/service.js";
import type { PaperStore } from "./store.js";

const notFound = (res: Response) => void res.status(404).json({ error: { code: "not_found", message: "Paper not found" } });
const csv = (v: SettingValue | undefined) => String(v ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);

/** What students may see, from the Admin > Question papers settings. */
export function isVisible(e: PaperIndexEntry, v: Record<string, SettingValue>): boolean {
  if (v[`papers.show.kind.${e.kind}`] === false || v[`papers.show.board.${e.board}`] === false) return false;
  const lang = (e as { lang?: string }).lang ?? "en";
  if (lang === "hi" && v["papers.show.lang.hi"] === false) return false;
  if (csv(v["papers.hiddenIds"]).includes(e.id)) return false;
  const src = e.source.site.toLowerCase();
  if (csv(v["papers.hiddenSites"]).some((w) => src.includes(w))) return false;
  if (e.questions < Number(v["papers.list.minQuestions"] ?? 1)) return false;
  if (v["papers.list.onlyWithAnswers"] === true && e.keyed === 0) return false;
  return true;
}

/** Question papers: the list and one paper. Marking happens in the browser; nothing a student writes is sent here. */
export function paperRoutes(store: PaperStore, settings: SettingsService): Router {
  const r = Router();
  r.use(async (_req, res, next) => { try { if ((await settings.all())["feature.papers"] !== true) return notFound(res); next(); } catch (e) { next(e); } });
  r.get("/", async (req, res, next) => {
    try {
      const v = await settings.all(); const idx = store.list();
      // ?lang=hi gives only Hindi papers, ?lang=en only the others; with no lang every paper is returned (each carries its own lang field).
      const want = String(req.query.lang ?? "").toLowerCase();
      const langOf = (e: PaperIndexEntry) => (e as { lang?: string }).lang ?? "en";
      const out: PaperIndex = { updated: idx.updated, papers: idx.papers.filter((e) => isVisible(e, v) && (!want || langOf(e) === want)) };
      res.set("Cache-Control", "no-cache").json(out);
    } catch (e) { next(e); }
  });
  r.get("/:id", async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const v = await settings.all();
      const e = store.list().papers.find((x) => x.id === id);
      if (!e || !isVisible(e, v)) return notFound(res);
      const p = store.get(id);
      if (!p) return notFound(res);
      res.set("Cache-Control", "public, max-age=300").json(p);
    } catch (e) { next(e); }
  });
  return r;
}

/** Admin page data and buttons (mounted at /api/v1/admin/papers): status, hide/show, reset the collector's memory. */
export function adminPaperRoutes(store: PaperStore, dir: string, settings: SettingsService, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  const actor = (req: { header(n: string): string | undefined }) => decodeURIComponent(String(req.header("x-admin-user") ?? "admin")) || "admin";
  const tally = (xs: string[]) => Object.entries(xs.reduce<Record<string, number>>((a, k) => ((a[k] = (a[k] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
  r.get("/status", async (_req, res, next) => {
    try {
      const v = await settings.all(); const idx = store.list();
      let job: unknown = null;
      try { job = JSON.parse(readFileSync(join(dir, "job-status.json"), "utf8")); } catch { /* the collector has not run yet */ }
      const hiddenIds = csv(v["papers.hiddenIds"]);
      let sites: unknown[] = [];
      try { sites = (JSON.parse(readFileSync(join(dir, "sites-list.json"), "utf8")) as { sites?: unknown[] }).sites ?? []; } catch { /* the collector has not listed its websites yet */ }
      const config = { disabledSites: String(v["papers.job.disabledSites"] ?? ""), enabledSites: String(v["papers.job.enabledSites"] ?? ""), hiddenSites: String(v["papers.hiddenSites"] ?? ""), siteCaps: String(v["papers.job.siteCaps"] ?? "") };
      res.set("Cache-Control", "no-store").json({
        total: idx.papers.length, visible: idx.papers.filter((e) => isVisible(e, v)).length, updated: idx.updated,
        byBoard: tally(idx.papers.map((p) => p.board)), byClass: tally(idx.papers.map((p) => `Class ${p.cls}`)), bySubject: tally(idx.papers.map((p) => p.subject)).slice(0, 30), byLanguage: tally(idx.papers.map((p) => ((p as { lang?: string }).lang ?? "en") === "hi" ? "Hindi" : "English")), byKind: tally(idx.papers.map((p) => p.kind)), bySite: tally(idx.papers.map((p) => p.source.site)),
        questions: idx.papers.reduce((a, p) => a + p.questions, 0), withAnswers: idx.papers.filter((p) => p.keyed > 0).length,
        hiddenIds, job, sites, config, papers: idx.papers.slice().sort((a, b) => b.added.localeCompare(a.added)).slice(0, 400).map((p) => ({ id: p.id, title: p.title, board: p.board, cls: p.cls, subject: p.subject, kind: p.kind, questions: p.questions, keyed: p.keyed, site: p.source.site, added: p.added, hidden: hiddenIds.includes(p.id) })),
      });
    } catch (e) { next(e); }
  });
  const ids = z.object({ ids: z.array(z.string().regex(/^[a-z0-9][a-z0-9-]{3,100}$/)).min(1).max(200) });
  const setHidden = (hide: boolean) => async (req: Parameters<Parameters<typeof r.post>[1]>[0], res: Response, next: (e?: unknown) => void) => {
    try {
      const b = ids.safeParse(req.body); if (!b.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send a list of paper ids." } });
      const cur = new Set(csv((await settings.all())["papers.hiddenIds"]));
      for (const id of b.data.ids) hide ? cur.add(id) : cur.delete(id);
      const text = [...cur].join(",");
      if (text.length > 4000) return void res.status(400).json({ error: { code: "too_long", message: "Too many hidden papers; show some again first." } });
      await settings.update({ "papers.hiddenIds": text }, actor(req), hide ? "papers.hide" : "papers.show");
      res.json({ hidden: [...cur] });
    } catch (e) { next(e); }
  };
  r.post("/hide", setHidden(true));
  r.post("/show", setHidden(false));
  r.post("/reset-collector", async (req, res, next) => {
    try {
      const n = Number((await settings.all())["papers.job.resetCounter"] ?? 0) + 1;
      await settings.update({ "papers.job.resetCounter": n }, actor(req), "papers.resetCollector");
      res.json({ resetCounter: n });
    } catch (e) { next(e); }
  });
  return r;
}
