import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;
export const PAGE_FILE = /^(\d{1,4})-(t|s|l)\.webp$/;
type Vals = Record<string, unknown>;
export interface PageInfo { pages: number; ratio: number }
export type PageState = "ready" | "building" | "queued" | "none" | "failed" | "off";

/**
 * Ready-made page pictures for E-Library books (<library>/pages/<id>/{n}-{t,s,l}.webp + meta.json), drawn by
 * tools/build-library-pages.mjs in a separate process so a big book never slows the site. Books are drawn when they
 * are added (a periodic sweep notices new ones), or on the first open; the folder is a cache that is trimmed to a size cap.
 */
export interface LibraryPages {
  dir(id: string): string;
  /** the picture set when it is complete, else null (never partial) */
  info(id: string): PageInfo | null;
  state(id: string): PageState;
  /** ask for a book's pictures to be drawn (no-op when already there, queued or switched off) */
  ensure(id: string, why?: "open" | "added"): Promise<PageState>;
  /** draw pictures for every book that has none (called at start-up and now and then) */
  sweep(): Promise<number>;
  remove(id: string): void;
  trim(maxMB: number): { removed: number; bytes: number };
  stats(): { books: number; bytes: number; queued: number; building: string | null; failed: number };
  start(): () => void;
}
export interface PagesDeps {
  filesDir: string;
  settings: () => Promise<Vals>;
  /** test hook: replaces the child process */
  run?: (id: string, env: Record<string, string>) => Promise<boolean>;
  log?: (m: string) => void;
}
const here = dirname(fileURLToPath(import.meta.url));
const TOOL = join(here, "../../tools/build-library-pages.mjs");

export function dirBytes(d: string): number { let n = 0; try { for (const f of readdirSync(d)) { try { n += statSync(join(d, f)).size; } catch { /* gone */ } } } catch { /* none */ } return n; }

export function createLibraryPages(d: PagesDeps): LibraryPages {
  const root = join(d.filesDir, "pages");
  const dir = (id: string) => join(root, id);
  const queue: string[] = []; const failed = new Map<string, number>(); let current: string | null = null; let draining = false;
  const log = d.log ?? (() => undefined);
  const readMeta = (id: string): { pages?: number; ratio?: number; done?: boolean; failed?: boolean; tooBig?: boolean } | null => { try { return JSON.parse(readFileSync(join(dir(id), "meta.json"), "utf8")); } catch { return null; } };
  const info = (id: string): PageInfo | null => {
    if (!ID.test(id)) return null;
    const m = readMeta(id);
    return m?.done && Number(m.pages) > 0 && Number(m.ratio) > 0 ? { pages: Number(m.pages), ratio: Number(m.ratio) } : null;
  };
  const state = (id: string): PageState => {
    if (info(id)) return "ready";
    if (current === id) return "building";
    if (queue.includes(id)) return "queued";
    if (failed.has(id) || readMeta(id)?.failed || readMeta(id)?.tooBig) return "failed";
    return "none";
  };
  const defaultRun = (id: string, env: Record<string, string>) => new Promise<boolean>((ok) => {
    const p = spawn(process.execPath, [TOOL, "--id", id], { env: { ...process.env, ...env, LIBRARY_DIR: d.filesDir }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let tail = ""; const keep = (b: Buffer) => { tail = (tail + b.toString()).slice(-400); };
    p.stdout.on("data", keep); p.stderr.on("data", keep);
    const kill = setTimeout(() => p.kill(), 20 * 60_000); // a book that takes 20 minutes is stuck
    p.on("error", () => { clearTimeout(kill); ok(false); });
    p.on("close", (code) => { clearTimeout(kill); if (code !== 0) log(`library pages: ${id} failed: ${tail.trim().split("\n").pop() ?? ""}`); ok(code === 0); });
  });
  const run = d.run ?? defaultRun;
  async function drain() {
    if (draining) return; draining = true;
    try {
      while (queue.length) {
        const id = queue.shift()!; current = id;
        let v: Vals = {}; try { v = await d.settings(); } catch { /* defaults */ }
        const env = { LIB_PAGE_WIDTHS: `${num(v["library.pages.widthThumb"], 160, 80, 400)},${num(v["library.pages.widthNormal"], 700, 300, 1400)},${num(v["library.pages.widthLarge"], 1400, 600, 3000)}`, LIB_PAGE_QUALITY: String(num(v["library.pages.quality"], 72, 30, 95)), LIB_PAGE_MAX: String(num(v["library.pages.maxPages"], 600, 0, 5000)) };
        const ok = await run(id, env).catch(() => false);
        if (!ok || !info(id)) failed.set(id, Date.now()); else failed.delete(id);
        current = null;
      }
    } finally { draining = false; current = null; }
    try { const v = await d.settings(); const cap = num(v["library.pages.cacheMB"], 4096, 0, 500000); if (cap > 0) trim(cap); } catch { /* next time */ }
  }
  const num = (x: unknown, def: number, min: number, max: number) => { const n = Number(x); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; };
  const pdfOf = (id: string) => join(d.filesDir, "pdf", `${id}.pdf`);

  async function ensure(id: string, why: "open" | "added" = "open"): Promise<PageState> {
    if (!ID.test(id)) return "none";
    const s = state(id); if (s === "ready" || s === "building" || s === "queued") return s;
    const v = await d.settings();
    if (v["library.pages.enabled"] === false) return "off";
    if (why === "added" && v["library.pages.preRender"] === false) return "none";
    if (!existsSync(pdfOf(id))) return "none";
    const last = failed.get(id); if (last && Date.now() - last < 3_600_000) return "failed"; // do not retry a broken file every minute
    if (readMeta(id)?.failed || readMeta(id)?.tooBig) return "failed";
    queue.push(id); void drain();
    return "queued";
  }
  async function sweep(): Promise<number> {
    const v = await d.settings();
    if (v["feature.library"] !== true || v["library.pages.enabled"] === false || v["library.pages.preRender"] === false) return 0;
    let ids: string[] = []; try { ids = readdirSync(join(d.filesDir, "pdf")).filter((f) => /\.pdf$/i.test(f)).map((f) => f.slice(0, -4)); } catch { return 0; }
    let n = 0;
    try { const have = new Set(ids); for (const id of readdirSync(root)) if (ID.test(id) && !have.has(id) && id !== current) rmSync(dir(id), { recursive: true, force: true }); } catch { /* no cache yet */ } // a removed book's pictures go too
    for (const id of ids) { if (state(id) === "none" && ID.test(id)) { queue.push(id); n++; } if (n >= 200) break; }
    if (n) void drain();
    return n;
  }
  function trim(maxMB: number) {
    let ids: string[] = []; try { ids = readdirSync(root); } catch { return { removed: 0, bytes: 0 }; }
    const rows = ids.filter((id) => ID.test(id) && id !== current).map((id) => { let t = 0; try { t = statSync(join(dir(id), ".used")).mtimeMs; } catch { try { t = statSync(join(dir(id), "meta.json")).mtimeMs; } catch { /* none */ } } return { id, t, b: dirBytes(dir(id)) }; });
    let total = rows.reduce((a, r) => a + r.b, 0), removed = 0;
    for (const r of rows.sort((a, b) => a.t - b.t)) { if (total <= maxMB * 1048576) break; rmSync(dir(r.id), { recursive: true, force: true }); total -= r.b; removed++; }
    return { removed, bytes: total };
  }
  return {
    dir, info, state, ensure, sweep, trim,
    remove(id) { if (ID.test(id)) { const i = queue.indexOf(id); if (i >= 0) queue.splice(i, 1); failed.delete(id); try { rmSync(dir(id), { recursive: true, force: true }); } catch { /* gone */ } } },
    stats() { let books = 0, bytes = 0; try { for (const id of readdirSync(root)) if (ID.test(id)) { books++; bytes += dirBytes(dir(id)); } } catch { /* none yet */ } return { books, bytes, queued: queue.length, building: current, failed: failed.size }; },
    start() {
      const first = setTimeout(() => void sweep().catch(() => undefined), 20_000);
      const t = setInterval(() => void sweep().catch(() => undefined), 5 * 60_000);
      t.unref?.(); first.unref?.();
      return () => { clearTimeout(first); clearInterval(t); };
    },
  };
}
/** marks a book as used just now (the cache trims the least recently used first) */
export function touchUsed(pagesDir: string) { try { const f = join(pagesDir, ".used"); mkdirSync(pagesDir, { recursive: true }); if (!existsSync(f)) writeFileSync(f, ""); const n = new Date(); utimesSync(f, n, n); } catch { /* not important */ } }
