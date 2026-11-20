import { existsSync, readFileSync, rmSync, writeFileSync, mkdirSync, renameSync, statfsSync } from "node:fs";
import { dirname, join } from "node:path";
import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../settings/admin-auth.js";
import type { SettingsService } from "../settings/service.js";
import type { LibraryStore } from "./store.js";
import type { LibraryPages } from "./pages.js";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;
const GB = 1024 * 1024 * 1024;
const readJson = <T,>(p: string, d: T): T => { try { return JSON.parse(readFileSync(p, "utf8")) as T; } catch { return d; } };
function writeJson(p: string, data: unknown) { mkdirSync(dirname(p), { recursive: true }); const t = `${p}.tmp-${process.pid}`; writeFileSync(t, JSON.stringify(data, null, 1) + "\n"); renameSync(t, p); }

interface Row { id?: unknown; title?: unknown; hidden?: unknown; ageBand?: unknown; language?: unknown; addedAt?: unknown; licence?: { code?: unknown }; source?: { site?: unknown }; bytes?: unknown }

/**
 * Admin > E-Library: storage use against the cap, what is on the shelf by age / language / site / licence, the site list
 * and run history the collector wrote (status.json), and the few actions that need the files: remove or hide a book,
 * and ask the collector to re-read a site. Everything is admin-only.
 */
export function libraryAdminRoutes(store: LibraryStore, settings: SettingsService, adminKey: string | null, adminUserId?: string, pages?: LibraryPages): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  const catalogPath = store.paths.catalog, filesDir = store.paths.files;
  const statusPath = join(dirname(catalogPath), "status.json");
  const blockPath = join(dirname(catalogPath), "blocklist.json");
  const commandsPath = join(filesDir, "commands.json");

  r.get("/", async (_req, res) => {
    const v = await settings.all();
    const list = store.list();
    const cat = readJson<{ books?: Row[] }>(catalogPath, {});
    const rows = (cat.books ?? []).filter((b) => typeof b?.id === "string");
    const useServer = v["library.storage.useServerCap"] === true;
    const capGB = Number(useServer ? v["library.storage.serverMaxGB"] : v["library.storage.maxGB"]) || 5;
    const shown = new Map(list.books.map((b) => [b.id, b]));
    const here = rows.filter((b) => b.hidden === true || shown.has(String(b.id))); // rows whose files are on this machine
    const tally = (f: (b: Row) => string) => { const m = new Map<string, number>(); for (const b of here) { const k = f(b) || "unknown"; m.set(k, (m.get(k) ?? 0) + 1); } return [...m].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count); };
    let free: number | null = null;
    try { const fs = statfsSync(existsSync(filesDir) ? filesDir : dirname(catalogPath)); free = fs.bavail * fs.bsize; } catch { /* not readable here */ }
    res.set("Cache-Control", "no-store").json({
      usage: { bytes: list.bytes, books: list.books.length, hidden: rows.filter((b) => b.hidden === true).length, missingFiles: rows.filter((b) => b.hidden !== true && !shown.has(String(b.id))).length, capGB, plannedServerCapGB: Number(v["library.storage.serverMaxGB"]) || 50, usingServerCap: useServer, usedPercent: Math.min(100, Math.round((list.bytes / (capGB * GB)) * 1000) / 10), warnPercent: Number(v["library.storage.warnPercent"]) || 80, diskFreeBytes: free },
      by: { age: tally((b) => String(b.ageBand ?? "")), language: tally((b) => String(b.language ?? "")), site: tally((b) => String(b.source?.site ?? "")), licence: tally((b) => String(b.licence?.code ?? "")) },
      job: { enabled: v["library.job.enabled"] === true, perRun: v["library.job.perRun"], runsPerDay: v["library.job.runsPerDay"] },
      status: readJson<unknown>(statusPath, null),
      pendingCommands: readJson<{ commands?: unknown[] }>(commandsPath, {}).commands ?? [],
      blocked: readJson<{ ids?: string[] }>(blockPath, {}).ids?.length ?? 0,
      books: rows.slice(-600).reverse().map((b) => ({ id: String(b.id), title: String(b.title ?? ""), site: String(b.source?.site ?? ""), ageBand: String(b.ageBand ?? ""), language: String(b.language ?? ""), licence: String(b.licence?.code ?? ""), bytes: shown.get(String(b.id))?.bytes ?? 0, addedAt: String(b.addedAt ?? ""), hidden: b.hidden === true, onDisk: shown.has(String(b.id)) || b.hidden === true })),
    });
  });

  r.post("/remove", (req, res) => {
    const body = z.object({ id: z.string().regex(ID) }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send { id }" } });
    const { id } = body.data;
    for (const p of [join(filesDir, "pdf", `${id}.pdf`), join(filesDir, "cover", `${id}.jpg`)]) { try { rmSync(p, { force: true }); } catch { /* already gone */ } }
    pages?.remove(id);
    const cat = readJson<{ books?: Row[] }>(catalogPath, { books: [] });
    writeJson(catalogPath, { ...cat, books: (cat.books ?? []).filter((b) => b.id !== id) });
    const block = readJson<{ ids: string[] }>(blockPath, { ids: [] });
    if (!block.ids.includes(id)) block.ids.push(id);
    writeJson(blockPath, block);
    res.json({ ok: true });
  });

  r.post("/hide", (req, res) => {
    const body = z.object({ id: z.string().regex(ID), hidden: z.boolean() }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send { id, hidden }" } });
    const cat = readJson<{ books?: Row[] }>(catalogPath, { books: [] });
    let hit = false;
    for (const b of cat.books ?? []) if (b.id === body.data.id) { b.hidden = body.data.hidden || undefined; hit = true; }
    if (!hit) return void res.status(404).json({ error: { code: "not_found", message: "Book not found" } });
    writeJson(catalogPath, cat);
    res.json({ ok: true });
  });

  /** Asks the collector (on the PC that holds the files) to re-read a site or forget what it skipped; done at the start of its next run. */
  r.post("/command", (req, res) => {
    const body = z.object({ action: z.enum(["reset-site", "clear-skipped", "reset-all"]), site: z.string().regex(/^[a-z0-9-]{1,40}$/).optional() }).safeParse(req.body);
    if (!body.success || (body.data.action === "reset-site" && !body.data.site)) return void res.status(400).json({ error: { code: "bad_request", message: "Send { action, site? }" } });
    const cur = readJson<{ commands: unknown[] }>(commandsPath, { commands: [] });
    cur.commands.push({ ...body.data, at: new Date().toISOString() });
    writeJson(commandsPath, cur);
    res.json({ ok: true, pending: cur.commands.length });
  });
  // Book Reader page pictures: how much is cached, and draw / redraw / clear
  r.get("/pages", (_req, res) => void res.set("Cache-Control", "no-store").json(pages ? { available: true, ...pages.stats() } : { available: false }));
  r.post("/pages/build", async (req, res, next) => {
    try {
      if (!pages) return void res.status(404).json({ error: { code: "off", message: "Page pictures are not available." } });
      const b = z.object({ id: z.string().regex(ID).optional(), redo: z.boolean().optional() }).safeParse(req.body ?? {});
      if (!b.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send { id? , redo? }" } });
      if (b.data.id) { if (b.data.redo) pages.remove(b.data.id); res.json({ state: await pages.ensure(b.data.id, "open") }); }
      else res.json({ queued: await pages.sweep() });
    } catch (e) { next(e); }
  });
  r.post("/pages/clear", (_req, res) => { if (!pages) return void res.status(404).json({ error: { code: "off", message: "Page pictures are not available." } }); const { removed } = pages.trim(0); res.json({ removed }); });
  return r;
}
