import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

type Day = { views: number; visitors: string[]; signups: number; logins: number; questions: number; pages: Record<string, number>; errors: number; requests: number };
export interface StatsService {
  view(ip: string, ua: string, path: string): void;
  count(kind: "signups" | "logins" | "questions" | "errors" | "requests"): void;
  report(days: number): Report;
}
export interface Report {
  generatedAt: string;
  days: { date: string; views: number; visitors: number; signups: number; logins: number; questions: number }[];
  totals: { views: number; visitors: number; signups: number; logins: number; questions: number };
  topPages: { path: string; views: number }[];
  server: { startedAt: string; uptimeSeconds: number; memoryMb: number; node: string; requests: number; errors: number; platform: string };
}
const key = (d = new Date()) => d.toISOString().slice(0, 10);
const blank = (): Day => ({ views: 0, visitors: [], signups: 0, logins: 0, questions: 0, pages: {}, errors: 0, requests: 0 });

/** Small file-backed counters. Visitors are stored only as a one-way daily hash, never as an address. */
export function createStatsService(file: string | null): StatsService {
  const data: Record<string, Day> = {};
  const started = new Date();
  if (file && existsSync(file)) { try { Object.assign(data, JSON.parse(readFileSync(file, "utf8"))); } catch { /* start fresh */ } }
  let dirty = false;
  const today = () => (data[key()] ??= blank());
  const flush = () => { if (!file || !dirty) return; dirty = false; try { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(data)); } catch { /* best effort */ } };
  if (file) setInterval(flush, 30_000).unref();
  process.on("beforeExit", flush);
  return {
    view(ip, ua, path) {
      const d = today(); d.views++; dirty = true;
      const id = createHash("sha256").update(`${key()}|${ip}|${ua}`).digest("hex").slice(0, 16);
      if (!d.visitors.includes(id) && d.visitors.length < 50_000) d.visitors.push(id);
      const p = path.split("?")[0]!.slice(0, 120); if (Object.keys(d.pages).length < 500 || d.pages[p]) d.pages[p] = (d.pages[p] ?? 0) + 1;
    },
    count(kind) { const d = today(); d[kind]++; dirty = true; },
    report(days) {
      const out: Report["days"] = []; const pages: Record<string, number> = {};
      const uniq = new Set<string>();
      let requests = 0, errors = 0;
      for (let i = days - 1; i >= 0; i--) {
        const dt = new Date(Date.now() - i * 86400000), k = key(dt), d = data[k];
        out.push({ date: k, views: d?.views ?? 0, visitors: d?.visitors.length ?? 0, signups: d?.signups ?? 0, logins: d?.logins ?? 0, questions: d?.questions ?? 0 });
        if (d) { d.visitors.forEach((v) => uniq.add(v)); for (const [p, n] of Object.entries(d.pages)) pages[p] = (pages[p] ?? 0) + n; requests += d.requests; errors += d.errors; }
      }
      const sum = (f: (x: Report["days"][number]) => number) => out.reduce((a, x) => a + f(x), 0);
      return {
        generatedAt: new Date().toISOString(), days: out,
        totals: { views: sum((x) => x.views), visitors: uniq.size, signups: sum((x) => x.signups), logins: sum((x) => x.logins), questions: sum((x) => x.questions) },
        topPages: Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([path, views]) => ({ path, views })),
        server: { startedAt: started.toISOString(), uptimeSeconds: Math.round(process.uptime()), memoryMb: Math.round(process.memoryUsage().rss / 1048576), node: process.version, requests, errors, platform: process.platform },
      };
    },
  };
}
