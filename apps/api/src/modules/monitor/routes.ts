import { Router } from "express";
import { opendir, lstat, statfs, readFile, mkdir, writeFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { cpus, freemem, loadavg, totalmem, uptime } from "node:os";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { rateLimit } from "../../http/rate-limit.js";
import { requireAdmin, safeEqual } from "../settings/admin-auth.js";
import type { Db } from "../../db/client.js";
import type { ReportsService } from "../stats/reports.js";
import type { StatsService } from "../stats/service.js";

export interface MonitorPaths { content: string; audio: string; uploads: string; backups: string; jobState: string }
type Size = { bytes: number; files: number; complete: boolean; recentBackups: { at: string; bytes: number }[] };
const sources = z.enum(["oracle", "windows"]);
const job = z.object({
  phase: z.string().regex(/^[a-z0-9-]{1,70}$/).nullable(),
  status: z.enum(["running", "complete", "partial", "failed", "unknown"]),
  completed: z.number().int().min(0).max(100_000_000).nullable(),
  total: z.number().int().min(1).max(100_000_000).nullable(),
  updatedAt: z.string().datetime(),
  error: z.enum(["speech", "process", "skipped"]).nullable(),
}).strict().refine((item) => item.completed === null || (item.total !== null && item.completed <= item.total));

async function size(path: string, excluded?: string, includeBackups = false): Promise<Size | null> {
  const deadline = Date.now() + 5_000;
  const dirs = [path];
  const result: Size = { bytes: 0, files: 0, complete: true, recentBackups: [] };
  let visited = 0;
  try {
    if (!(await lstat(path)).isDirectory()) return null;
    for (const dir of dirs) {
      for await (const entry of await opendir(dir)) {
        if (++visited > 180_000 || Date.now() > deadline) return { ...result, complete: false };
        const file = join(dir, entry.name);
        if (file === excluded) continue;
        if (entry.isDirectory()) dirs.push(file);
        if (!entry.isFile()) continue;
        try {
          const info = await lstat(file);
          if (!info.isFile()) continue;
          result.bytes += info.size;
          result.files++;
          if (includeBackups && /^studysmart-.*\.(?:tgz|sql\.gz)$/.test(entry.name)) {
            result.recentBackups.push({ at: info.mtime.toISOString(), bytes: info.size });
            result.recentBackups.sort((a, b) => b.at.localeCompare(a.at));
            if (result.recentBackups.length > 5) result.recentBackups.pop();
          }
        } catch { result.complete = false; }
      }
    }
    return result;
  } catch { return null; }
}

async function databaseBytes(db?: Db) {
  if (!db) return null;
  try {
    const result = await db.execute(sql.raw("select pg_database_size(current_database())::text as bytes"));
    const value = Number((result as { rows?: { bytes: string }[] }).rows?.[0]?.bytes);
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  } catch { return null; }
}

function cpuTimes() {
  return cpus().reduce(([idle, total], { times }) => [
    idle + times.idle, total + Object.values(times).reduce((sum, n) => sum + n, 0),
  ] as [number, number], [0, 0] as [number, number]);
}

async function storage(paths: MonitorPaths, db?: Db) {
  const [disk, content, audio, uploads, backups, database, lessons, questions, classrooms] = await Promise.all([
    statfs(paths.content).then((d) => d.blocks ? { free: d.bavail * d.bsize, total: d.blocks * d.bsize } : null).catch(() => null),
    size(paths.content, paths.audio), size(paths.audio), size(paths.uploads), size(paths.backups, undefined, true), databaseBytes(db),
    size(join(paths.content, "lessons")), size(join(paths.content, "questions")), size(join(paths.content, "classroom")),
  ]);
  return { disk, content, audio, uploads, backups, database, lessons, questions, classrooms, measuredAt: new Date().toISOString() };
}

export function monitorRoutes(deps: {
  paths: MonitorPaths; adminKey: string | null; adminUserId?: string; db?: Db;
  stats?: StatsService; reports?: ReportsService; jobToken?: string;
  coverage?: () => { recordings: number; complete: number; partial: number; missing: number; generatedAt: string } | null;
}) {
  const router = Router();
  const recentErrors: { at: string; status: number }[] = [];
  let cached: ReturnType<typeof storage> | undefined;
  let sampled = 0;
  let previous = cpuTimes(), cpu: number | null = null, lastCpu = Date.now();
  const writes = new Map<string, Promise<void>>();
  const location = (source: string) => join(deps.paths.jobState, source + ".json");
  const getJob = async (source: string) => {
    try {
      const data = job.parse(JSON.parse(await readFile(location(source), "utf8")));
      return { ...data, stale: data.status === "running" && Date.now() - Date.parse(data.updatedAt) > 15 * 60_000 };
    } catch { return null; }
  };
  router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  router.post("/jobs/:source", rateLimit({ max: 30, windowMs: 60_000 }), async (req, res, next) => {
    if (!deps.jobToken || deps.jobToken.length < 24 || !safeEqual(req.header("authorization") ?? "", "Bearer " + deps.jobToken)) {
      return void res.status(401).json({ error: { message: "Reporting authentication required." } });
    }
    const source = sources.safeParse(req.params.source);
    const update = job.safeParse(req.body);
    if (!source.success || !update.success || Date.parse(update.data.updatedAt) > Date.now() + 60_000) {
      return void res.status(400).json({ error: { message: "Invalid job update." } });
    }
    const id = source.data;
    const prior = writes.get(id) ?? Promise.resolve();
    const pending = prior.catch(() => {}).then(async () => {
      const old = await getJob(id);
      if (old && Date.parse(old.updatedAt) >= Date.parse(update.data.updatedAt)) return;
      await mkdir(deps.paths.jobState, { recursive: true, mode: 0o700 });
      const temp = join(deps.paths.jobState, randomUUID() + ".tmp");
      try {
        await writeFile(temp, JSON.stringify(update.data), { mode: 0o600, flag: "wx" });
        await rename(temp, location(id));
      } finally { await rm(temp, { force: true }).catch(() => {}); }
    });
    writes.set(id, pending);
    try { await pending; res.status(204).end(); } catch (error) { next(error); }
    finally { if (writes.get(id) === pending) writes.delete(id); }
  });
  router.use(requireAdmin(deps.adminKey, deps.adminUserId));
  router.get("/jobs", async (_req, res) => {
    const [oracle, windows] = await Promise.all([getJob("oracle"), getJob("windows")]);
    res.json({ oracle, windows });
  });
  router.get("/", async (_req, res) => {
    if (!cached || Date.now() - sampled > 120_000) {
      sampled = Date.now();
      cached = storage(deps.paths, deps.db);
    }
    const files = await cached;
    if (Date.now() - lastCpu >= 1000) {
      const current = cpuTimes();
      const total = current[1] - previous[1];
      cpu = total > 0 ? Math.min(100, Math.max(0, Math.round(100 * (1 - (current[0] - previous[0]) / total)))) : null;
      previous = current;
      lastCpu = Date.now();
    }
    const stats = deps.stats?.report(14);
    const reports = deps.reports?.list();
    res.json({
      service: "Online", uptime: Math.floor(process.uptime()), hostUptime: Math.floor(uptime()),
      cpu, load: process.platform === "win32" ? null : loadavg(), memory: { free: freemem(), total: totalmem(), process: process.memoryUsage().rss },
      ...files, traffic: stats ? { ...stats.totals, requests: stats.server.requests, errors: stats.server.errors, days: stats.days } : null,
      coverage: deps.coverage?.() ?? null,
      reports: reports ? { total: reports.length, open: reports.filter((item) => item.status === "new").length } : null,
      recentErrors,
    });
  });
  return { router, record(status: number) {
    if (status < 500) return;
    recentErrors.unshift({ at: new Date().toISOString(), status });
    if (recentErrors.length > 12) recentErrors.pop();
  } };
}
