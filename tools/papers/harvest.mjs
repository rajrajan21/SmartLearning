#!/usr/bin/env node
// SharpStudy question-paper collector. Run by Harvest-Question-Papers.bat (3 times a day) on the owner PC.
//   node tools/papers/harvest.mjs [--max 10] [--site cbse-academic] [--dry] [--local <folder> --board cbse]
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./lib/config.mjs";
import { get } from "./lib/http.mjs";
import { crawlSite, ingest, planCandidates } from "./lib/core.mjs";
import { PAPERS_DIR, dirSizeMB, readIndex, loadState, saveState, sha } from "./lib/store.mjs";
import { chapterMatcher, loadCurriculum } from "./lib/match.mjs";
import { inferMeta } from "./lib/parse.mjs";
import { pdfToText } from "./lib/pdf.mjs";
import { browserAvailable, browserClose, browserGet } from "./lib/browser.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k) => { const i = process.argv.indexOf("--" + k); return i < 0 ? undefined : (process.argv[i + 1]?.startsWith("--") ? true : process.argv[i + 1] ?? true); };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const cfg = await loadConfig();
const max = Number(arg("max") ?? cfg.perRun);
log(`SharpStudy question-paper collector. Settings from: ${cfg.from}. Up to ${max} new papers this run.`);
if (!cfg.enabled && !arg("force")) { log("The collector job is switched off (Admin > Question papers). Nothing to do."); process.exit(0); }
if (dirSizeMB() >= cfg.maxMB) { log(`Storage limit reached (${dirSizeMB().toFixed(1)} MB of ${cfg.maxMB} MB). Nothing added.`); process.exit(0); }

const state = loadState(); state.seen ??= {}; state.sites ??= {}; state.hashes ??= {};
if ((cfg.resetCounter ?? 0) > (state.resetCounter ?? 0)) { state.seen = {}; state.hashes = {}; state.sites = {}; state.resetCounter = cfg.resetCounter; log("Collector memory was reset in Admin: every site will be read again from scratch (duplicates are still skipped by content)."); }
const indexCount = () => readIndex().papers.length;
if (indexCount() >= cfg.maxPapers) { log(`Paper limit reached (${indexCount()} of ${cfg.maxPapers}). Nothing added.`); process.exit(0); }
const siteRows = {};
const curr = loadCurriculum();
const matcherFor = (cls, subject) => chapterMatcher(curr, cls, subject);
const pauseMs = cfg.pauseSeconds * 1000;
const summary = { startedAt: new Date().toISOString(), saved: [], skipped: [], blocked: [], failed: [], duplicate: 0 };
const useBrowser = cfg.browserMode && (await browserAvailable());
if (cfg.browserMode && !useBrowser) log("Browser mode is on but playwright-core is not installed: run Install-Papers-Browser.bat. Continuing without it.");

// ---- local folder mode: ingest PDFs the owner already has ----
if (arg("local")) {
  const folder = String(arg("local")); const board = String(arg("board") ?? "cbse");
  const site = { id: "local", name: `Local files (${basename(folder)})`, board, license: "Added by the site owner." };
  for (const f of readdirSync(folder).filter((x) => /\.pdf$/i.test(x))) {
    if (summary.saved.length >= max) break;
    const meta = inferMeta(f); if (!meta.cls || !meta.subject) { summary.skipped.push(`${f}: class or subject not in the file name`); continue; }
    const buf = readFileSync(join(folder, f)); const text = { text: await pdfToText(buf) };
    const r = await ingest({ url: "https://sharpstudy.in/papers#local-" + sha(f).slice(0, 8), name: f, meta, key: null }, site, { fetcher: null, matcherFor, dir: PAPERS_DIR, text });
    (r.result === "saved" ? summary.saved : summary.skipped).push(`${f}: ${r.detail}`); log(f, r.result, r.detail);
  }
  writeFileSync(join(here, "last-run.json"), JSON.stringify(summary, null, 1)); process.exit(0);
}

const sites = JSON.parse(readFileSync(join(here, "sites.json"), "utf8")).sites;
for (const u of cfg.extraSites ?? []) { try { const h = new URL(u).host; sites.push({ id: "extra-" + sha(u).slice(0, 6), name: h, board: cfg.boards[0] ?? "stateboard", tier: "extra", enabled: true, entries: [u], follow: "question|paper|sample|model|worksheet|quiz", depth: 1, license: "Added by the site owner." }); } catch { /* ignore bad address */ } }
const only = arg("site");
const today = new Date().toISOString().slice(0, 10);
const siteCaps = Object.fromEntries(String(cfg.siteCaps ?? "").split(",").map((x) => x.trim().split(/\s*[:=]\s*/)).filter((x) => x[0] && x[1] !== undefined && !Number.isNaN(Number(x[1]))).map(([k, v]) => [k.toLowerCase(), Number(v)]));
const capOf = (site) => siteCaps[site.id.toLowerCase()] ?? site.dailyCap ?? 0; // 0 = no daily cap
/** The list of websites for the Admin > Question papers > Sources table (rewritten on every run). */
const writeSitesList = () => { try { mkdirSync(PAPERS_DIR, { recursive: true }); writeFileSync(join(PAPERS_DIR, "sites-list.json"), JSON.stringify({ updated: new Date().toISOString(), sites: sites.map((s) => ({ id: s.id, name: s.name, board: s.board, tier: s.tier ?? "", defaultOn: !!s.enabled, hideKey: s.hideKey ?? s.id, dailyCap: s.dailyCap ?? 0, pauseSeconds: s.pauseSeconds ?? 0, license: s.license ?? "", status: state.sites[s.id]?.status ?? s.status ?? "seed" })) })); } catch { /* admin list only */ } };
writeSitesList();
const fetcherFor = (site) => async (url, o) => {
  const stat = state.sites[site.id]?.status;
  const pm = Math.max(pauseMs, (site.pauseSeconds ?? 0) * 1000);
  if (useBrowser && stat === "needs-browser") return browserGet(url, { pauseMs: pm });
  const r = await get(url, { pauseMs: pm, ...o });
  if (!r.ok && r.blocked === "challenge" && useBrowser) return browserGet(url, { pauseMs: pm });
  return r;
};

outer:
for (const site of sites) {
  if (only && site.id !== only) continue;
  if ((!site.enabled && !cfg.enabledSites.includes(site.id)) || cfg.disabledSites.includes(site.id)) { siteRows[site.id] = { id: site.id, name: site.name, status: "switched off", added: 0 }; continue; }
  const before = summary.saved.length;
  if (!cfg.boards.includes(site.board)) continue;
  const st = (state.sites[site.id] ??= { status: site.status ?? "seed" });
  if (["blocked-robots", "not-allowed"].includes(st.status) && Date.now() - Date.parse(st.checkedAt ?? 0) < 7 * 864e5) { log(`${site.id}: skipped (blocked/not allowed by the site, checked ${st.checkedAt?.slice(0, 10)})`); continue; }
  if (st.status === "needs-browser" && !useBrowser) { log(`${site.id}: needs the real browser (turn on Browser mode in Admin and run Install-Papers-Browser.bat). Skipped.`); continue; }
  const fetcher = fetcherFor(site);
  // (re)read the site's PDF list at most once a day; the list is kept in state so a big site can be finished over several runs
  if (!st.items || Date.now() - Date.parse(st.crawledAt ?? 0) > cfg.recrawlHours * 36e5) {
    log(`${site.id}: reading the site's pages...`);
    const c = await crawlSite(site, { fetcher });
    st.crawledAt = new Date().toISOString(); st.checkedAt = st.crawledAt; st.pages = c.pages; st.pdfs = c.candidates.length;
    if (!c.pages && c.blocked) { st.status = c.blocked === "robots" ? "blocked-robots" : "needs-browser"; summary.blocked.push(`${site.id}: ${c.blocked} (${c.errors[0] ?? ""})`); saveState(state); log(`${site.id}: ${c.blocked}`); continue; }
    if (!c.pages) { st.status = "unreachable"; summary.failed.push(`${site.id}: ${c.errors[0] ?? "no pages"}`); saveState(state); log(`${site.id}: could not be reached (${c.errors[0]})`); continue; }
    st.status = c.candidates.length ? "ok" : "no-pdfs";
    st.items = planCandidates(c.candidates, site, cfg).map((p) => ({ url: p.url, name: p.name, meta: p.meta, key: p.key ?? null, skip: p.skip ?? null }));
    log(`${site.id}: ${c.pages} pages read, ${c.candidates.length} PDFs found, ${st.items.filter((i) => !i.skip).length} usable.`);
  }
  if (st.day?.date !== today) st.day = { date: today, n: 0 };
  const retryOk = (i) => !st.failed?.[sha(i.url)] || Date.now() - Date.parse(st.failed[sha(i.url)]) > cfg.retryHours * 36e5;
  const pending = (st.items ?? []).filter((i) => !i.skip && !state.seen[sha(i.url)] && retryOk(i));
  log(`${site.id}: ${pending.length} papers not collected yet.`);
  for (const item of pending) {
    if (summary.saved.length >= max) break outer;
    if (cfg.perSiteMax && summary.saved.length - before >= cfg.perSiteMax) { log(`${site.id}: reached the per-site limit for this run.`); break; }
    if (capOf(site) && st.day.n >= capOf(site)) { log(`${site.id}: reached today's cap of ${capOf(site)} papers for this site.`); break; }
    if (indexCount() >= cfg.maxPapers) { log("Paper limit reached."); break outer; }
    if (dirSizeMB() >= cfg.maxMB) { log("Storage limit reached."); break outer; }
    if (arg("dry")) { log(`[dry run] would collect ${item.url}`); summary.saved.push(item.url); continue; }
    const r = await ingest(item, site, { fetcher, matcherFor, dir: PAPERS_DIR, cfg });
    const mark = (res) => (state.seen[sha(item.url)] = { res, at: new Date().toISOString(), url: item.url });
    if (r.result === "saved") { if (state.hashes[r.hash]) { summary.duplicate++; } state.hashes[r.hash] = item.url; mark("saved"); summary.saved.push(r.detail); st.day.n++; }
    else if (r.result === "duplicate") { mark("duplicate"); summary.duplicate++; }
    else if (r.result === "blocked") { summary.blocked.push(`${item.url}: ${r.detail}`); mark("blocked"); if (/robots/.test(r.detail)) continue; }
    else if (r.result === "failed") { summary.failed.push(`${item.url}: ${r.detail}`); (st.failed ??= {})[sha(item.url)] = new Date().toISOString(); /* tried again after the retry hours */ }
    else { summary.skipped.push(`${item.url}: ${r.detail}`); mark("skipped"); }
    log(`${r.result}: ${item.name} - ${r.detail}`);
    saveState(state);
  }
  if (!(st.items ?? []).some((i) => !i.skip && !state.seen[sha(i.url)])) log(`${site.id}: finished (every paper on the site has been collected or skipped). Moving on.`);
  saveState(state);
  const left = (st.items ?? []).filter((i) => !i.skip && !state.seen[sha(i.url)]).length;
  siteRows[site.id] = { id: site.id, name: site.name, status: st.status === "ok" ? (left ? `${left} papers still to collect` : "finished") : st.status, added: summary.saved.length - before, note: st.pdfs != null ? `${st.pdfs} PDFs found on ${st.pages} pages` : "" };
}
await browserClose();
writeSitesList();
summary.finishedAt = new Date().toISOString();
summary.storageMB = Number(dirSizeMB().toFixed(2));
writeFileSync(join(here, "last-run.json"), JSON.stringify(summary, null, 1));
for (const site of sites) if (!siteRows[site.id] && state.sites[site.id]) siteRows[site.id] = { id: site.id, name: site.name, status: state.sites[site.id].status, added: 0 };
if (!arg("dry")) writeFileSync(join(PAPERS_DIR, "job-status.json"), JSON.stringify({ startedAt: summary.startedAt, finishedAt: summary.finishedAt, added: summary.saved.length, skipped: summary.skipped.length, failed: summary.failed.length, configSource: cfg.from, storageMB: summary.storageMB, sites: Object.values(siteRows), log: [...summary.blocked, ...summary.failed].slice(0, 20) }));
saveState(state);
log(`DONE. New papers: ${summary.saved.length}. Skipped: ${summary.skipped.length}. Blocked/not allowed: ${summary.blocked.length}. Failed (will retry): ${summary.failed.length}. Storage: ${summary.storageMB} MB.`);
if (summary.saved.length) log("Next: run Go-Live.bat (or Publish-To-GitHub.bat) to put the new papers on the site.");
