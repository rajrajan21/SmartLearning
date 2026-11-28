import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, statfsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { AGE_BANDS, HERE, UA, classifyLicence, dirBytes, findTool, makeCover, parseList, parseRobots, robotsAllows, sleep, writeJsonAtomic } from "./lib.mjs";

const LIMIT = 10_000_000_000;
const PUBLISHER = "https://www.storybookscanada.globalstorybooks.net";
const MANIFEST = join(HERE, "reviewed-books.json");
const read = (path, fallback) => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback;

async function publicResponse(url, type, fetcher, robots) {
  const address = new URL(url);
  if (address.origin !== PUBLISHER || address.username || address.password || address.search || address.hash) throw new Error("Unexpected publisher address.");
  if (robots && !robotsAllows(robots, address.pathname)) throw new Error("Publisher robots rules disallow this path.");
  const response = await fetcher(address, {
    redirect: "error",
    headers: { "User-Agent": UA, Accept: type },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Publisher HTTP ${response.status}. This source is paused for this batch.`);
  return response;
}

function exactBook(b) {
  const id = String(b.id);
  if (!/^\d{4}$/.test(id) || b.source !== `${PUBLISHER}/stories/en/${id}/` ||
      !b.pdfUrl.startsWith(`${PUBLISHER}/pdf/en/en-${id}_`) || !/^[a-f0-9]{64}$/.test(b.sha256) ||
      !/^https:\/\/creativecommons\.org\/licenses\/by\/[34]\.0\/$/.test(b.licence) ||
      !AGE_BANDS.includes(b.ageBand) || !b.title || !b.authors?.length || !Number.isInteger(b.pages) || b.pages < 1) {
    throw new Error(`Unreviewed or invalid entry ${id}.`);
  }
}

async function bytesFrom(response, maximum) {
  const length = Number(response.headers.get("content-length"));
  if (length > maximum || !response.body) throw new Error("Publisher file exceeds its limits.");
  const chunks = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.byteLength;
    if (total > maximum) throw new Error("Publisher file exceeds its limits.");
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/** The automated importer only redistributes exact editions screened for licence, text and illustrations. */
export async function importReviewed({ dir, values = {}, initial = false, fetcher = fetch, pause = sleep, log = console.log }) {
  if (!initial && (values["feature.library"] !== true || values["library.job.enabled"] !== true)) return { added: 0, note: "Collector is off." };
  mkdirSync(dir, { recursive: true });
  const disk = statfsSync(dir);
  if (disk.bavail * disk.bsize < (Number(values["library.job.minFreeDiskGB"] ?? 2) * 1_000_000_000)) throw new Error("Low free disk space.");
  const qpdf = findTool(["qpdf"]);
  const coverTool = findTool(["pdftoppm"]);
  if (!qpdf) throw new Error("qpdf is required to validate and optimise the downloaded PDFs.");
  const roots = join(dir, "collector");
  mkdirSync(roots, { recursive: true });
  const catalogPath = join(roots, "catalog.json");
  const statusPath = join(roots, "status.json");
  const run = { at: new Date().toISOString(), added: 0, skipped: 0, blocked: [], books: [], stoppedBecause: "" };
  const books = read(MANIFEST, []);
  const old = read(catalogPath, { version: 1, books: [] });
  const consider = (key, d) => Number(values[key] ?? d);
  const max = initial ? 11 : Math.min(500, Math.max(1, consider("library.job.perRun", 11)));
  const perSite = Math.max(0, consider("library.job.perSiteMax", 0));
  const bands = parseList(values["library.job.ageBands"]);
  const langs = parseList(values["library.job.languages"]);
  const disabled = parseList(values["library.job.disabledSites"]);
  const include = parseList(values["library.job.onlyTags"]);
  const exclude = parseList(values["library.job.skipTags"]);
  const licenses = parseList(values["library.job.licences"] ?? "cc0,by,by-sa");
  const cap = Math.min(LIMIT, (consider(values["library.storage.useServerCap"] ? "library.storage.serverMaxGB" : "library.storage.maxGB", 10) || 10) * 1_000_000_000);
  const listed = new Set(old.books.map(b => b.id));
  const blockedIds = () => new Set(read(join(roots, "moderation.json"), { removed: [] }).removed ?? []);
  const site = { id: "storybookscanada", name: "Storybooks Canada", status: "ready", home: PUBLISHER, licence: "Per edition: verified CC BY 3.0 or 4.0", terms: "Exact reviewed public PDFs" };
  const eligible = books.filter(b => {
    const words = b.title.toLowerCase();
    return (!bands.length || bands.includes(b.ageBand)) && (!include.length || include.some(w => words.includes(w))) && !exclude.some(w => words.includes(w)) &&
      b.pages >= consider("library.job.minPages", 4) && b.pages <= consider("library.job.maxPages", 400);
  });
  try {
    if (disabled.includes(site.id) || (langs.length && !langs.includes("en")) || !licenses.includes("by")) {
      run.stoppedBecause = "Source, English or CC BY is disabled.";
      return run;
    }
    const commands = join(dir, "commands.json");
    // The reviewed edition inventory is checked on each run. Admin requests never clear takedowns.
    if (existsSync(commands)) rmSync(commands);
    const retired = blockedIds();
    const idFor = b => `sbc-en-${b.id}`;
    const pending = eligible.filter(b => !listed.has(idFor(b)) && !retired.has(idFor(b)));
    if (!pending.length) { run.stoppedBecause = "Reviewed editions exhausted."; return run; }
    const robotsResponse = await fetcher(`${PUBLISHER}/robots.txt`, { redirect: "error", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
    if (!robotsResponse.ok && robotsResponse.status !== 404) throw Error(`Publisher robots.txt HTTP ${robotsResponse.status}.`);
    const robots = robotsResponse.ok ? parseRobots(await robotsResponse.text()) : [];
    for (const b of pending) {
      if (run.added >= max || (perSite > 0 && run.added >= perSite)) break;
      exactBook(b);
      const id = idFor(b);
      const html = (await bytesFrom(await publicResponse(b.source, "text/html", fetcher, robots), 1_000_000)).toString("utf8");
      const licences = new Set([...html.matchAll(/rel="license" href="(https:\/\/creativecommons\.org\/licenses\/[^"]+)"/g)].map(m => m[1]));
      if (licences.size !== 1 || !licences.has(b.licence) || !html.includes(new URL(b.pdfUrl).pathname)) {
        log(`Held ${b.title}: publisher licence or edition changed.`); run.skipped++; continue;
      }
      const downloadBytes = Math.min(60_000_000, consider("library.job.maxBookMB", 60) * 1_000_000);
      const pdf = await bytesFrom(await publicResponse(b.pdfUrl, "application/pdf", fetcher, robots), downloadBytes);
      if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-")) || createHash("sha256").update(pdf).digest("hex") !== b.sha256) {
        log(`Held ${b.title}: exact reviewed PDF changed.`); run.skipped++; continue;
      }
      if (dirBytes(dir) + pdf.length * 2 > cap) { run.stoppedBecause = "Library storage cap reached."; break; }
      const raw = join(roots, `.${id}.source.pdf`), packed = join(roots, `.${id}.packed.pdf`);
      const out = join(dir, "pdf", `${id}.pdf`);
      mkdirSync(dirname(out), { recursive: true });
      try {
        rmSync(raw, { force: true });
        rmSync(packed, { force: true });
        writeFileSync(raw, pdf, { flag: "wx" });
        const args = ["--linearize", "--object-streams=generate", "--compress-streams=y", "--recompress-flate", raw, packed];
        const r = spawnSync(qpdf, args, { timeout: 60000, encoding: "utf8" });
        const checked = r.status === 0 && spawnSync(qpdf, ["--check", packed], { timeout: 60000 }).status === 0;
        const actual = checked && spawnSync(qpdf, ["--show-npages", packed], { timeout: 30000, encoding: "utf8" });
        if (!actual || actual.status !== 0 || Number(actual.stdout) !== b.pages) { log(`Held ${b.title}: PDF verification failed.`); run.skipped++; continue; }
        if (blockedIds().has(id)) continue;
        const bytes = statSync(packed).size;
        if (dirBytes(dir) > cap) { run.stoppedBecause = "Library storage cap reached."; break; }
        renameSync(packed, out);
        const cover = join(dir, "cover", `${id}.jpg`);
        if (coverTool && dirBytes(dir) + 1_000_000 < cap) makeCover(out, cover, { pdftoppm: coverTool });
        old.books.push({
          id, title: b.title, authors: b.authors, language: "en", ageBand: b.ageBand, ageSource: "guess",
          pages: b.pages, bytes, originalBytes: pdf.length, sha256: b.sha256,
          licence: classifyLicence(b.licence), source: { site: site.id, siteName: site.name, url: b.source },
          tags: ["picture book", `reading level ${b.level}`], addedAt: new Date().toISOString(),
          toc: [{ title: "Cover", page: 1, level: 0 }, { title: "Story", page: 2, level: 0 }, { title: "Credits and licence", page: b.pages, level: 0 }],
        });
        writeJsonAtomic(catalogPath, old);
        run.added++; run.books.push(b.title);
      } finally {
        rmSync(raw, { force: true }); rmSync(packed, { force: true });
      }
      await pause(Math.max(1000, consider("library.job.pauseSeconds", 4) * 1000));
    }
    run.stoppedBecause ||= run.added >= max ? "Batch size reached." : "Reviewed source checked.";
  } catch (err) {
    run.stoppedBecause = String(err.message ?? err).slice(0, 240);
    run.blocked.push(site.id);
    log(run.stoppedBecause);
  } finally {
    const prev = read(statusPath, { runs: [] });
    writeJsonAtomic(statusPath, {
      updatedAt: new Date().toISOString(),
      runs: [run, ...prev.runs].slice(0, 30),
      sites: [{ ...site, added: old.books.length, done: eligible.every(b => old.books.some(row => row.id === `sbc-en-${b.id}`)) }],
    });
  }
  return run;
}

export async function runReviewed({ dir, values, initial = false }) {
  const lock = join(dir, "collector", "worker.pid");
  mkdirSync(dirname(lock), { recursive: true });
  if (existsSync(lock)) {
    const owner = Number(readFileSync(lock, "utf8"));
    try {
      if (!Number.isSafeInteger(owner) || owner < 1) return { added: 0, stoppedBecause: "Collector lock exists." };
      process.kill(owner, 0);
      return { added: 0, stoppedBecause: "Another collector run is active." };
    } catch (err) {
      if (err.code !== "ESRCH") throw err;
      rmSync(lock, { force: true });
    }
  }
  try { writeFileSync(lock, String(process.pid), { flag: "wx" }); }
  catch (err) { if (err.code === "EEXIST") return { added: 0, stoppedBecause: "Another collector run is active." }; throw err; }
  try { return await importReviewed({ dir, values, initial }); }
  finally { rmSync(lock, { force: true }); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.env.LIBRARY_DIR;
  if (!dir) throw new Error("Set LIBRARY_DIR to the deployment library path.");
  const values = JSON.parse(process.env.LIBRARY_JOB_SETTINGS ?? "{}");
  console.log(JSON.stringify(await runReviewed({ dir, values, initial: process.argv.includes("--initial-import") })));
}
