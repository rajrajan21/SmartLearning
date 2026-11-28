// Shared helpers for the E-Library collector. Plain Node 20+, no packages. Everything here is testable without the internet.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, "../..");
export const UA = "SharpStudyLibraryBot/1.0 (free kids library for Indian students; https://sharpstudy.in)";
export const AGE_BANDS = ["0-3", "4-6", "7-9", "10-12", "13+"];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const jitter = (baseMs) => Math.round(baseMs * (0.75 + Math.random() * 0.6));

// ---------- licences: only openly redistributable ones, never "no derivatives" ----------
const NAMES = { cc0: "CC0 1.0 (public domain)", pdm: "Public Domain Mark", by: "CC BY", "by-sa": "CC BY-SA", "by-nc": "CC BY-NC", "by-nc-sa": "CC BY-NC-SA" };
/** Reads a licence URL or short text. Returns { code, name, url } or null when it is unclear. code "nd" = never allowed. */
export function classifyLicence(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const s = raw.toLowerCase();
  let m = s.match(/creativecommons\.org\/publicdomain\/(zero|mark)\/([0-9.]+)/);
  if (m) return { code: m[1] === "zero" ? "cc0" : "pdm", name: m[1] === "zero" ? NAMES.cc0 : NAMES.pdm, url: raw.startsWith("http") ? raw : `https://creativecommons.org/publicdomain/${m[1]}/${m[2]}/` };
  m = s.match(/creativecommons\.org\/licenses\/(by(?:-nc)?(?:-sa|-nd)?)\/([0-9.]+)/);
  if (m) {
    const code = /nd/.test(m[1]) ? "nd" : m[1];
    return { code, name: code === "nd" ? "CC (no derivatives)" : `${NAMES[code]} ${m[2]}`, url: raw.startsWith("http") ? raw : `https://creativecommons.org/licenses/${m[1]}/${m[2]}/` };
  }
  // short text, as Wikimedia Commons writes it
  if (/^(cc0|cc[- ]?zero)/.test(s)) return { code: "cc0", name: NAMES.cc0, url: "https://creativecommons.org/publicdomain/zero/1.0/" };
  if (/^public domain|^pd[- ]|^pd$/.test(s)) return { code: "pdm", name: NAMES.pdm, url: "https://creativecommons.org/publicdomain/mark/1.0/" };
  m = s.match(/^cc[- ]by(-nc)?(-sa|-nd)?[- ]?([0-9.]+)?/);
  if (m) {
    const code = ["by", m[1] ? "nc" : "", m[2] ? m[2].slice(1) : ""].filter(Boolean).join("-");
    const v = m[3] || "4.0";
    return { code: /nd/.test(code) ? "nd" : code, name: /nd/.test(code) ? "CC (no derivatives)" : `${NAMES[code] ?? code} ${v}`, url: `https://creativecommons.org/licenses/${code}/${v}/` };
  }
  return null;
}
export const parseList = (v) => String(v ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
export function licenceAllowed(lic, allowed) {
  if (!lic || lic.code === "nd") return false;
  return parseList(allowed).includes(lic.code);
}

// ---------- languages ----------
const LANG3 = { eng: "en", tam: "ta", hin: "hi", tel: "te", mal: "ml", kan: "kn", ben: "bn", mar: "mr", guj: "gu", pan: "pa", urd: "ur", ori: "or", ory: "or", san: "sa", asm: "as", fra: "fr", fre: "fr", spa: "es", deu: "de", ger: "de", por: "pt", ara: "ar", swa: "sw", zul: "zu", xho: "xh", afr: "af", nep: "ne" };
const LANGNAME = { english: "en", tamil: "ta", hindi: "hi", telugu: "te", malayalam: "ml", kannada: "kn", bengali: "bn", marathi: "mr", gujarati: "gu", punjabi: "pa", urdu: "ur", french: "fr", spanish: "es", german: "de", swahili: "sw", zulu: "zu" };
export function langCode(v) {
  const s = String(Array.isArray(v) ? v[0] : v ?? "").trim().toLowerCase();
  if (!s) return "";
  if (LANG3[s]) return LANG3[s];
  if (LANGNAME[s]) return LANGNAME[s];
  if (/^[a-z]{2}(-[a-z]+)?$/.test(s)) return s.slice(0, 2);
  return "";
}

// ---------- age band: the source's own words first, otherwise a plain rule of thumb ----------
const BAND_RULES = [
  ["0-3", /\b(ages?\s*0\s*[-–to]+\s*[1-3]\b|baby|babies|toddler|board book|nursery rhyme|lullab|bedtime board)/],
  ["4-6", /\b(ages?\s*[3-6]\s*[-–to]+\s*[5-8]\b|preschool|pre-school|kindergarten|picture book|early reader|beginning reader|level\s*1\b|grade\s*(k|1|2)\b|first reader|read aloud|read-aloud)/],
  ["7-9", /\b(ages?\s*[6-9]\s*[-–to]+\s*(9|1[0-2])\b|chapter book|grade\s*(3|4)\b|early chapter|fairy tale|folk\s?tale)/],
  ["10-12", /\b(ages?\s*(9|10|11)\s*[-–to]+\s*1[2-4]\b|middle grade|tween|grade\s*(5|6|7)\b|juvenile fiction|adventure stor)/],
  ["13+", /\b(young adult|\bya\b|teen|teenager|ages?\s*1[2-4]\s*\+|ages?\s*13|grade\s*(8|9|10|11|12)\b)/],
];
/** { subjects, title, description, pages } -> { band, source: "source" | "guess" } */
export function ageBand({ subjects = [], title = "", description = "", pages = null } = {}) {
  const text = [...(Array.isArray(subjects) ? subjects : [subjects]), title, description].join(" | ").toLowerCase().slice(0, 4000);
  for (const [band, re] of BAND_RULES) if (re.test(text)) return { band, source: "source" };
  const n = Number(pages) || 0;
  if (n > 0) return { band: n <= 24 ? "4-6" : n <= 64 ? "7-9" : n <= 180 ? "10-12" : "13+", source: "guess" };
  return { band: "7-9", source: "guess" };
}

// ---------- ids and text ----------
export const slug = (s, max = 60) => String(s ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max) || "book";
export const bookId = (site, sourceId) => `${slug(site, 12)}-${slug(sourceId, 80)}`.slice(0, 120);
export const stripHtml = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
export const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
export const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

// ---------- robots.txt (tiny parser: the rules for our name, else for *) ----------
export function parseRobots(text) {
  const groups = [];
  let cur = null, lastWasAgent = false;
  for (const line0 of String(text ?? "").split(/\r?\n/)) {
    const line = line0.replace(/#.*/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "user-agent") { if (!lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(v.toLowerCase()); lastWasAgent = true; continue; }
    lastWasAgent = false;
    if (cur && (k === "allow" || k === "disallow")) cur.rules.push({ allow: k === "allow", path: v });
  }
  return groups;
}
export function robotsAllows(groups, path, agent = "sharpstudylibrarybot") {
  const mine = groups.filter((g) => g.agents.some((a) => a !== "*" && agent.includes(a)));
  const use = mine.length ? mine : groups.filter((g) => g.agents.includes("*"));
  let best = null;
  for (const g of use) for (const r of g.rules) {
    if (!r.path) continue;
    const re = new RegExp("^" + r.path.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
    if (re.test(path) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }
  return best ? best.allow : true;
}

// ---------- fetching, politely ----------
export class Blocked extends Error { constructor(status, url) { super(`blocked (${status}) ${url}`); this.name = "Blocked"; this.status = status; this.url = url; } }
export async function fetchRetry(url, { tries = 3, timeoutMs = 45000, headers = {}, fetchImpl = fetch, pauseMs = 1500 } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), timeoutMs);
      const res = await fetchImpl(url, { headers: { "User-Agent": UA, Accept: "*/*", ...headers }, signal: ctl.signal, redirect: "follow" });
      clearTimeout(t);
      if (res.status === 403 || res.status === 401 || res.status === 451) throw new Blocked(res.status, url);
      if (res.status === 429 || res.status >= 500) { last = new Error(`HTTP ${res.status}`); await sleep(pauseMs * (i + 1) * 3); continue; }
      return res;
    } catch (e) {
      if (e instanceof Blocked) throw e;
      last = e;
      await sleep(pauseMs * (i + 1));
    }
  }
  throw last ?? new Error("fetch failed");
}
export async function fetchJson(url, opts) {
  const res = await fetchRetry(url, { ...opts, headers: { Accept: "application/json", ...(opts?.headers ?? {}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}
/** Streams a download to disk, refusing anything bigger than maxBytes. Returns the byte count. */
export async function download(url, dest, { maxBytes, fetchImpl = fetch, timeoutMs = 180000 } = {}) {
  const res = await fetchRetry(url, { fetchImpl, timeoutMs, tries: 2 });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} for ${url}`);
  const len = Number(res.headers.get("content-length") || 0);
  if (maxBytes && len > maxBytes) throw new TooBig(len);
  mkdirSync(dirname(dest), { recursive: true });
  let got = 0;
  const out = createWriteStream(dest);
  const src = Readable.fromWeb(res.body);
  src.on("data", (c) => { got += c.length; if (maxBytes && got > maxBytes) src.destroy(new TooBig(got)); });
  try { await pipeline(src, out); } catch (e) { rmSync(dest, { force: true }); throw e; }
  return got;
}
export class TooBig extends Error { constructor(n) { super(`file too big (${n} bytes)`); this.bytes = n; } }
export function looksLikePdf(path) {
  try { const b = readFileSync(path).subarray(0, 1024).toString("latin1"); return b.includes("%PDF-"); } catch { return false; }
}

// ---------- PDF tools (all optional: without them the original file is stored as it is) ----------
export function findTool(names) {
  const probe = process.platform === "win32" ? "where" : "which";
  for (const n of names) { const r = spawnSync(probe, [n], { encoding: "utf8" }); if (r.status === 0 && r.stdout.trim()) return r.stdout.split(/\r?\n/)[0].trim(); }
  return null;
}
export function pdfTools() {
  return { gs: findTool(["gswin64c", "gswin32c", "gs"]), qpdf: findTool(["qpdf"]), pdftoppm: findTool(["pdftoppm"]) };
}
/**
 * Makes the PDF small and "fast web view" (linearized, so a reader can ask for just page 1 first).
 * Tries Ghostscript (smaller images) then qpdf; keeps whichever result is smallest and still a valid PDF.
 * Returns { path, bytes, steps }.
 */
export function compressPdf(src, dest, tools = pdfTools()) {
  const steps = [];
  const cands = [{ path: src, tag: "original" }];
  const tmp1 = `${dest}.gs.pdf`, tmp2 = `${dest}.q.pdf`, tmp3 = `${dest}.gq.pdf`;
  if (tools.gs) {
    const r = spawnSync(tools.gs, ["-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.5", "-dPDFSETTINGS=/ebook", "-dColorImageResolution=130", "-dGrayImageResolution=130", "-dMonoImageResolution=300", "-dDetectDuplicateImages=true", "-dNOPAUSE", "-dQUIET", "-dBATCH", `-sOutputFile=${tmp1}`, src], { encoding: "utf8", timeout: 240000 });
    if (r.status === 0 && existsSync(tmp1) && looksLikePdf(tmp1) && statSync(tmp1).size > 500) { cands.push({ path: tmp1, tag: "gs" }); steps.push("gs"); }
  }
  const best = () => cands.reduce((a, b) => (statSync(b.path).size < statSync(a.path).size ? b : a));
  if (tools.qpdf) {
    const from = best().path;
    const r = spawnSync(tools.qpdf, ["--linearize", "--object-streams=generate", "--compress-streams=y", "--recompress-flate", from, tmp2], { encoding: "utf8", timeout: 120000 });
    // qpdf exits 3 for warnings but still writes a usable file
    if ((r.status === 0 || r.status === 3) && existsSync(tmp2) && looksLikePdf(tmp2)) { cands.push({ path: tmp2, tag: "qpdf" }); steps.push("qpdf"); }
  }
  void tmp3;
  const pick = best();
  const linearized = tools.qpdf && pick.tag === "qpdf";
  // a linearized file is worth a few percent of size (fast first page): prefer it if within 8% of the smallest
  const q = cands.find((c) => c.tag === "qpdf");
  const chosen = q && statSync(q.path).size <= statSync(pick.path).size * 1.08 ? q : pick;
  mkdirSync(dirname(dest), { recursive: true });
  if (chosen.path !== dest) { rmSync(dest, { force: true }); writeFileSync(dest, readFileSync(chosen.path)); }
  for (const c of cands) if (c.path !== src && c.path !== dest) rmSync(c.path, { force: true });
  void linearized;
  return { path: dest, bytes: statSync(dest).size, steps: [...steps, chosen.tag] };
}
export function pageCount(path, tools = pdfTools()) {
  if (tools.qpdf) { const r = spawnSync(tools.qpdf, ["--show-npages", path], { encoding: "utf8" }); const n = parseInt(r.stdout, 10); if (n > 0) return n; }
  try { const t = readFileSync(path).toString("latin1"); const m = [...t.matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)/g)].map((x) => +x[1]); if (m.length) return Math.max(...m); } catch { /* unreadable */ }
  return null;
}
/** First page as a small JPEG (needs pdftoppm or Ghostscript). Returns true when written. Without a tool the website draws the cover itself. */
export function makeCover(pdf, dest, tools = pdfTools()) {
  mkdirSync(dirname(dest), { recursive: true });
  if (tools.pdftoppm) {
    const base = dest.replace(/\.jpg$/i, "");
    const r = spawnSync(tools.pdftoppm, ["-jpeg", "-jpegopt", "quality=72", "-f", "1", "-l", "1", "-scale-to-x", "360", "-scale-to-y", "-1", "-singlefile", pdf, base], { timeout: 60000 });
    if (r.status === 0 && existsSync(`${base}.jpg`)) return true;
  }
  if (tools.gs) {
    const r = spawnSync(tools.gs, ["-sDEVICE=jpeg", "-dJPEGQ=72", "-r45", "-dFirstPage=1", "-dLastPage=1", "-dNOPAUSE", "-dQUIET", "-dBATCH", `-sOutputFile=${dest}`, pdf], { timeout: 60000 });
    if (r.status === 0 && existsSync(dest)) return true;
  }
  return false;
}

// ---------- catalogue, state, storage ----------
export function readJson(path, fallback) { try { return JSON.parse(readFileSync(path, "utf8")); } catch { return fallback; } }
export function writeJsonAtomic(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(data, null, 1) + "\n");
  renameSync(tmp, path);
}
export function dirBytes(dir) {
  let n = 0;
  if (!existsSync(dir)) return 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) n += dirBytes(p); else { try { n += statSync(p).size; } catch { /* vanished */ } }
  }
  return n;
}
export const GB = 1024 * 1024 * 1024;
/** The space cap in force: the current cap, or the planned server cap once the owner switches over. */
export function capBytes(cfg) { return Math.min(10_000_000_000, (cfg.useServerCap ? cfg.serverMaxGB : cfg.maxGB) * 1_000_000_000); }

/** Settings, defaults mirrored from packages/shared/src/library-settings.ts. The site's own values (Admin > E-Library) win when it can be reached. */
export const DEFAULTS = { enabled: false, runsPerDay: 3, perRun: 11, perSiteMax: 0, siteOrder: "internet-archive,wikimedia-commons", licences: "cc0,pdm,by,by-sa", languages: "en,ta,hi", ageBands: "0-3,4-6,7-9,10-12,13+", onlyTags: "", skipTags: "", minPages: 4, maxPages: 400, disabledSites: "", extraSites: "", browserMode: false, pauseSeconds: 4, maxBookMB: 60, reopenDays: 7, retryBlockedHours: 12, startHour: 0, endHour: 24, minFreeDiskGB: 2, maxGB: 10, serverMaxGB: 10, useServerCap: false };
// config name -> site setting key
const MAP = { enabled: "job.enabled", runsPerDay: "job.runsPerDay", perRun: "job.perRun", perSiteMax: "job.perSiteMax", siteOrder: "job.siteOrder", licences: "job.licences", languages: "job.languages", ageBands: "job.ageBands", onlyTags: "job.onlyTags", skipTags: "job.skipTags", minPages: "job.minPages", maxPages: "job.maxPages", disabledSites: "job.disabledSites", extraSites: "job.extraSites", browserMode: "job.browserMode", pauseSeconds: "job.pauseSeconds", maxBookMB: "job.maxBookMB", reopenDays: "job.reopenDays", retryBlockedHours: "job.retryBlockedHours", startHour: "job.startHour", endHour: "job.endHour", minFreeDiskGB: "job.minFreeDiskGB", maxGB: "storage.maxGB", serverMaxGB: "storage.serverMaxGB", useServerCap: "storage.useServerCap" };
export async function loadConfig({ fetchImpl = fetch, file = join(HERE, "config.json") } = {}) {
  const local = readJson(file, {});
  const cfg = { ...DEFAULTS, ...(local.settings ?? {}), siteUrls: local.siteUrls ?? ["http://localhost:3100", "https://sharpstudy.in"], libraryDir: local.libraryDir ?? join(ROOT, "data", "library"), catalog: local.catalog ?? join(ROOT, "content", "library", "catalog.json"), source: "config.json" };
  cfg.statusFile = local.statusFile ?? join(dirname(cfg.catalog), "status.json");
  cfg.commandsFile = local.commandsFile ?? join(cfg.libraryDir, "commands.json");
  for (const base of cfg.siteUrls) {
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
      const res = await fetchImpl(`${base.replace(/\/$/, "")}/api/v1/settings/public`, { signal: ctl.signal, headers: { "User-Agent": UA } });
      clearTimeout(t);
      if (!res.ok) continue;
      const v = (await res.json()).values ?? {};
      for (const [name, key] of Object.entries(MAP)) if (v[`library.${key}`] !== undefined) cfg[name] = v[`library.${key}`];
      cfg.source = `site ${base}`;
      break;
    } catch { /* try the next address, then fall back to config.json */ }
  }
  return cfg;
}
