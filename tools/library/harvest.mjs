// The E-Library collector. Run by Harvest-Library-Books.bat (by hand or by the Windows scheduled task, 3 times a day).
// One site at a time, finished before the next. Stops after "books per run" new books, or when the space cap is reached.
import { existsSync, mkdirSync, rmSync, statSync, statfsSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { ADAPTERS } from "./adapters/index.mjs";
import { AGE_BANDS, Blocked, GB, HERE, ROOT, TooBig, ageBand, bookId, capBytes, compressPdf, dirBytes, download, jitter, langCode, licenceAllowed, loadConfig, looksLikePdf, makeCover, pageCount, parseList, pdfTools, readJson, sha256, sleep, writeJsonAtomic } from "./lib.mjs";


export async function runHarvest({ cfg, sites, adapters = ADAPTERS, fetchImpl = fetch, tools = pdfTools(), log = console.log, pauseFn = sleep, browser = null, now = () => new Date(), statePath = join(HERE, "state", "state.json") }) {
  const result = { added: [], skipped: 0, blocked: [], sitesDone: [], stoppedBecause: "", sites: {} };
  const files = cfg.libraryDir;
  const catalog = readJson(cfg.catalog, { version: 1, books: [] });
  if (!Array.isArray(catalog.books)) catalog.books = [];
  const have = new Set([...catalog.books.map((b) => b.id), ...(readJson(join(dirname(cfg.catalog), "blocklist.json"), { ids: [] }).ids ?? [])]); // blocklist = books an admin removed: never fetched again
  const hashes = new Set(catalog.books.map((b) => b.sha256).filter(Boolean));
  const state = readJson(statePath, { sites: {} });
  state.sites ||= {};
  const disabled = new Set(parseList(cfg.disabledSites));
  const REOPEN_DAYS = Number(cfg.reopenDays) || 7;
  const BLOCK_HOURS = Number(cfg.retryBlockedHours) || 12;
  const wantBands = new Set(parseList(cfg.ageBands));
  const onlyTags = parseList(cfg.onlyTags), skipTags = parseList(cfg.skipTags);
  const hasWord = (list, text) => list.some((w) => text.includes(w));
  const order = parseList(cfg.siteOrder);
  sites = [...sites].sort((a, b) => { const ia = order.indexOf(a.id), ib = order.indexOf(b.id); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); });
  const perSiteMax = Math.max(0, Math.floor(Number(cfg.perSiteMax) || 0));
  applyCommands(cfg.commandsFile, state, log);
  const wantLang = new Set(parseList(cfg.languages));
  const maxBytes = Math.round(Number(cfg.maxBookMB) * 1024 * 1024);
  const perRun = Math.max(1, Math.floor(Number(cfg.perRun) || 10));
  const pause = () => pauseFn(jitter(Number(cfg.pauseSeconds) * 1000));
  const saveCatalog = () => { catalog.updated = now().toISOString(); writeJsonAtomic(cfg.catalog, catalog); };
  const saveState = () => writeJsonAtomic(statePath, state);
  const tmpDir = join(HERE, ".tmp");
  mkdirSync(tmpDir, { recursive: true });
  const spaceLeft = () => capBytes(cfg) - dirBytes(files);

  if (spaceLeft() <= 0) { result.stoppedBecause = `space cap reached (${cfg.useServerCap ? cfg.serverMaxGB : cfg.maxGB} GB)`; log(result.stoppedBecause); return result; }

  for (const site of sites) {
    if (result.added.length >= perRun) break;
    if (site.status !== "ready" || !adapters[site.id]) continue;
    if (disabled.has(site.id)) { log(`[${site.id}] switched off in Admin`); continue; }
    const st = (state.sites[site.id] ||= { cursor: {}, skipped: {}, added: 0 });
    if (st.done) {
      const ageDays = (now() - new Date(st.doneAt || 0)) / 86400000;
      if (ageDays < REOPEN_DAYS) { log(`[${site.id}] finished ${st.doneAt}; next look in ${Math.ceil(REOPEN_DAYS - ageDays)} day(s)`); continue; }
      st.done = false; st.cursor = {};
    }
    if (st.blockedAt && !(cfg.browserMode && browser) && (now() - new Date(st.blockedAt)) / 3600000 < BLOCK_HOURS) { log(`[${site.id}] was blocked at ${st.blockedAt}; skipped for now`); result.blocked.push(site.id); continue; }
    let siteAdded = 0;
    log(`[${site.id}] starting${st.cursor && Object.keys(st.cursor).length ? " (continuing)" : ""}`);
    let exhausted = false;
    try {
      const it = adapters[site.id].candidates({ cfg, cursor: st.cursor, fetchImpl, pause });
      for (;;) {
        if (result.added.length >= perRun) { result.stoppedBecause = `reached ${perRun} new books`; break; }
        if (perSiteMax && siteAdded >= perSiteMax) { log(`[${site.id}] reached ${perSiteMax} books for this run; the next site is next`); break; }
        if (spaceLeft() <= 0) { result.stoppedBecause = "space cap reached"; break; }
        const nx = await it.next();
        if (nx.done) { exhausted = true; break; }
        let c = nx.value;
        const sid = c.sourceId;
        const id = bookId(site.id, sid);
        if (have.has(id) || st.skipped[sid]) continue;
        const skip = (why) => { st.skipped[sid] = why; result.skipped++; const keys = Object.keys(st.skipped); if (keys.length > 6000) for (const k of keys.slice(0, 1000)) delete st.skipped[k]; };
        if (c.lazy) c = await c.lazy();
        if (c.skip) { skip(c.skip); continue; }
        if (!licenceAllowed(c.licence, cfg.licences)) { skip(`licence ${c.licence?.code ?? "unclear"} not allowed`); continue; }
        const lang = c.language || "";
        if (wantLang.size && lang && !wantLang.has(lang)) { skip(`language ${lang}`); continue; }
        if (wantLang.size && !lang && !wantLang.has("en")) { skip("language unknown"); continue; }
        if (maxBytes && c.bytes > maxBytes) { skip("too big"); continue; }
        const words = [...(c.subjects ?? []), c.title, c.description ?? ""].join(" | ").toLowerCase();
        if (onlyTags.length && !hasWord(onlyTags, words)) { skip("not in the wanted subjects"); continue; }
        if (skipTags.length && hasWord(skipTags, words)) { skip("unwanted subject word"); continue; }
        if (!c.title) { skip("no title"); continue; }
        // ---- download, check, shrink ----
        const raw = join(tmpDir, `${id}.raw.pdf`), out = join(files, "pdf", `${id}.pdf`);
        try {
          try { await download(c.pdfUrl, raw, { maxBytes, fetchImpl }); }
          catch (e) {
            if (e instanceof Blocked && cfg.browserMode && browser) { log(`[${site.id}] plain download blocked, trying the real browser`); await browser.downloadFile(c.pdfUrl, raw, { maxBytes }); }
            else throw e;
          }
          if (!looksLikePdf(raw)) { skip("not a pdf"); continue; }
          const digest = sha256(raw);
          if (hashes.has(digest)) { skip("duplicate file"); continue; }
          const packed = compressPdf(raw, out, tools);
          const pages = pageCount(out, tools);
          const coverOk = makeCover(out, join(files, "cover", `${id}.jpg`), tools);
          const age = ageBand({ subjects: c.subjects, title: c.title, description: c.description, pages });
          if (pages && (pages < Number(cfg.minPages) || pages > Number(cfg.maxPages))) { skip(`${pages} pages is outside the allowed range`); rmSync(out, { force: true }); rmSync(join(files, "cover", `${id}.jpg`), { force: true }); continue; }
          if (wantBands.size && !wantBands.has(age.band)) { skip(`age range ${age.band} not wanted`); rmSync(out, { force: true }); rmSync(join(files, "cover", `${id}.jpg`), { force: true }); continue; }
          catalog.books.push({
            id, title: c.title.slice(0, 200), authors: (c.authors ?? []).slice(0, 6), language: lang || "en", ageBand: age.band, ageSource: age.source, pages, bytes: packed.bytes, originalBytes: statSync(raw).size, sha256: digest,
            licence: c.licence, source: { site: site.id, siteName: site.name, url: c.sourceUrl }, tags: (c.subjects ?? []).slice(0, 8).map((t) => String(t).slice(0, 40)), addedAt: now().toISOString(), cover: coverOk, packed: packed.steps,
          });
          have.add(id); hashes.add(digest); st.added++; siteAdded++;
          saveCatalog(); saveState();
          result.added.push({ id, title: c.title, site: site.id, bytes: packed.bytes, from: statSync(raw).size });
          log(`+ ${c.title}  [${age.band}${age.source === "guess" ? "?" : ""}] ${lang || "en"} ${(packed.bytes / 1024).toFixed(0)} KB (was ${(statSync(raw).size / 1024).toFixed(0)} KB) ${c.licence.name}`);
        } catch (e) {
          if (e instanceof TooBig) { skip("too big"); continue; }
          if (e instanceof Blocked) throw e;
          skip(`download failed: ${String(e.message ?? e).slice(0, 80)}`);
          rmSync(out, { force: true });
        } finally { rmSync(raw, { force: true }); }
        await pause();
      }
    } catch (e) {
      if (e instanceof Blocked) { st.blockedAt = now().toISOString(); result.blocked.push(site.id); log(`[${site.id}] ${e.message} - moving to the next site (turn on the real-browser option in Admin to try again with Chrome)`); }
      else { log(`[${site.id}] stopped: ${String(e.message ?? e)}`); }
    }
    if (exhausted) { st.done = true; st.doneAt = now().toISOString(); result.sitesDone.push(site.id); log(`[${site.id}] finished: every book on this site has been looked at`); }
    result.sites[site.id] = { added: st.added, done: !!st.done, thisRun: siteAdded };
    saveState();
    if (!exhausted && !result.stoppedBecause && !st.blockedAt) result.stoppedBecause = "site stopped early";
  }
  if (!result.stoppedBecause) result.stoppedBecause = result.added.length >= perRun ? `reached ${perRun} new books` : "nothing more to collect right now";
  return result;
}

/** Requests made on the Admin > E-Library page (written next to the book files); applied at the start of a run, then cleared. */
export function applyCommands(file, state, log = () => {}) {
  const j = readJson(file, null);
  if (!j || !Array.isArray(j.commands) || !j.commands.length) return 0;
  for (const c of j.commands) {
    if (c.action === "reset-site" && state.sites[c.site]) { state.sites[c.site] = { cursor: {}, skipped: {}, added: state.sites[c.site].added ?? 0 }; log(`Admin: ${c.site} will be read again from the start`); }
    else if (c.action === "clear-skipped") { for (const st of Object.values(state.sites)) st.skipped = {}; log("Admin: the list of skipped books was cleared"); }
    else if (c.action === "reset-all") { for (const k of Object.keys(state.sites)) state.sites[k] = { cursor: {}, skipped: {}, added: state.sites[k].added ?? 0 }; log("Admin: every site will be read again from the start"); }
  }
  rmSync(file, { force: true });
  return j.commands.length;
}

/** What the Admin > E-Library page shows: the sites, how far each got, and the last runs. Kept next to the catalogue so it travels with it. */
export function writeStatus(cfg, sites, state, result, extra = {}) {
  const old = readJson(cfg.statusFile, { runs: [] });
  const runs = [{ at: new Date().toISOString(), added: result.added.length, skipped: result.skipped, blocked: result.blocked, stoppedBecause: result.stoppedBecause, books: result.added.slice(0, 20).map((b) => b.title), ...extra }, ...(old.runs ?? [])].slice(0, 30);
  const out = {
    updatedAt: new Date().toISOString(), runs,
    sites: sites.map((s) => { const st = state.sites?.[s.id] ?? {}; return { id: s.id, name: s.name, home: s.home, status: s.status, licence: s.licence, terms: s.terms, needsBrowser: !!s.needsBrowser, added: st.added ?? 0, skipped: Object.keys(st.skipped ?? {}).length, done: !!st.done, doneAt: st.doneAt ?? null, blockedAt: st.blockedAt ?? null }; }),
  };
  writeJsonAtomic(cfg.statusFile, out);
}

function insideWindow(cfg, d = new Date()) {
  const h = d.getHours(), a = Number(cfg.startHour) || 0, b = Number(cfg.endHour) || 24;
  return a <= b ? h >= a && h < b : h >= a || h < b;
}

// ---------------- command line ----------------
async function main() {
  const args = new Set(process.argv.slice(2));
  const logFile = join(ROOT, "library-harvest-report.txt");
  const lines = [];
  const log = (m) => { const l = `${new Date().toISOString().replace("T", " ").slice(0, 19)}  ${m}`; console.log(l); lines.push(l); };
  const cfg = await loadConfig();
  log(`E-Library collector. Settings from ${cfg.source}.`);
  if (!cfg.enabled && !args.has("--force")) {
    log("The collector job is OFF (Admin > E-Library > Collector job on). Nothing done.");
    writeFileSync(logFile, lines.join("\n") + "\n");
    return;
  }
  if (!insideWindow(cfg) && !args.has("--force")) { log(`Outside the allowed hours (${cfg.startHour} to ${cfg.endHour}). Nothing done.`); writeFileSync(logFile, lines.join("\n") + "\n"); return; }
  try { const fs = statfsSync(cfg.libraryDir && existsSync(cfg.libraryDir) ? cfg.libraryDir : ROOT); const freeGB = (fs.bavail * fs.bsize) / GB; if (freeGB < Number(cfg.minFreeDiskGB) && !args.has("--force")) { log(`Only ${freeGB.toFixed(1)} GB free on the drive (needs ${cfg.minFreeDiskGB}). Nothing done.`); writeFileSync(logFile, lines.join("\n") + "\n"); return; } } catch { /* cannot read free space: carry on */ }
  const sitesFile = readJson(join(HERE, "sites.json"), { sites: [] });
  let browser = null;
  if (cfg.browserMode) {
    try { browser = await (await import("./browser.mjs")).openBrowser(log); } catch (e) { log(`Real-browser mode is on but could not start: ${e.message}`); }
  }
  const tools = pdfTools();
  log(`Tools: Ghostscript ${tools.gs ? "yes" : "NO"}, qpdf ${tools.qpdf ? "yes" : "NO"}, pdftoppm ${tools.pdftoppm ? "yes" : "NO"} ${tools.gs && tools.qpdf ? "" : "(books are stored with less shrinking; install Ghostscript and qpdf for the smallest files)"}`);
  const before = dirBytes(cfg.libraryDir);
  log(`Library size ${(before / GB).toFixed(2)} GB of ${cfg.useServerCap ? cfg.serverMaxGB : cfg.maxGB} GB allowed. Books per run: ${cfg.perRun}.`);
  const r = await runHarvest({ cfg, sites: sitesFile.sites, tools, log, browser });
  if (browser) await browser.close();
  log(`Done: ${r.added.length} new, ${r.skipped} skipped, blocked: ${r.blocked.join(", ") || "none"}. Stopped because: ${r.stoppedBecause}. Library now ${(dirBytes(cfg.libraryDir) / GB).toFixed(2)} GB.`);
  writeJsonAtomic(join(HERE, "state", "last-run.json"), { at: new Date().toISOString(), ...r });
  writeStatus(cfg, sitesFile.sites, readJson(join(HERE, "state", "state.json"), { sites: {} }), r, { libraryGB: +(dirBytes(cfg.libraryDir) / GB).toFixed(3) });
  appendFileSync(logFile, ""); writeFileSync(logFile, lines.join("\n") + "\n");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error(e); process.exit(1); });
