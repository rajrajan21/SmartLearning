// Turns each downloaded textbook PDF into small ready-made page pictures (WebP) plus a contents list, so the reader
// never has to open the big PDF to show a page. Safe to stop and re-run: finished pages are skipped.
//   node src/tools/build-book-pages.mjs [--class 6] [--book maths] [--toc] [--limit N]
import { createRequire } from "node:module";
import { createCanvas } from "@napi-rs/canvas";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = process.env.BOOKS_DIR ?? resolve(here, "../../../../content/books");
const curriculumFile = resolve(here, "../../../../content/curriculum/cbse-2026-27.json");
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const onlyClass = opt("class"), onlyBook = opt("book"), redoToc = args.includes("--toc"), limit = Number(opt("limit") ?? 0);
const SIZES = { t: 160, s: 700, l: 1400 }; // thumbnail, normal, large (pixels wide)
const QUALITY = { t: 60, s: 72, l: 74 };

const require = createRequire(import.meta.url);
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const stdFonts = join(dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts") + "/";

const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8")).books.filter((b) => b.status === "ok" && b.kind === "single" && (b.file || b.path)).map((b) => ({ ...b, file: b.file ?? basename(b.path) }));
const curriculum = existsSync(curriculumFile) ? JSON.parse(readFileSync(curriculumFile, "utf8")) : { classes: [] };
const overrides = existsSync(join(root, "toc-overrides.json")) ? JSON.parse(readFileSync(join(root, "toc-overrides.json"), "utf8")) : {};
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9஀-௿ ]+/g, " ").replace(/\s+/g, " ").trim();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function pageIndexOf(doc, dest) {
  try {
    const d = typeof dest === "string" ? await doc.getDestination(dest) : dest;
    if (!d) return null;
    const ref = d[0];
    return typeof ref === "object" ? (await doc.getPageIndex(ref)) + 1 : Number(ref) + 1;
  } catch { return null; }
}
async function outlineToc(doc) {
  const out = [];
  const walk = async (items, level) => {
    for (const it of items ?? []) {
      const page = await pageIndexOf(doc, it.dest);
      if (page && it.title?.trim()) out.push({ title: it.title.trim().replace(/\s+/g, " "), page, level });
      if (level < 2) await walk(it.items, level + 1);
    }
  };
  await walk(await doc.getOutline(), 0);
  return out;
}
/** No bookmarks in the PDF: find where each chapter of the curriculum starts by looking for its title near the top of a page. */
async function matchToc(doc, cls, textOf) {
  const cl = curriculum.classes.find((c) => c.classLevel === cls);
  if (!cl) return [];
  let best = [];
  for (const sub of cl.subjects) {
    const found = [];
    let from = 1;
    for (const ch of sub.chapters) {
      const want = norm(ch.name.en);
      if (want.length < 4) continue;
      for (let p = from; p <= doc.numPages; p++) {
        const head = norm(await textOf(p)).slice(0, 360);
        if (head.includes(want)) { found.push({ title: ch.name.en, page: p, level: 0 }); from = p + 1; break; }
      }
    }
    if (found.length > best.length) best = found;
  }
  return best.length >= 2 ? best : [];
}

/** Last resort: pages that open with "Chapter 3", "Unit 2" or "Lesson 5" and a title. */
async function headingToc(doc, textOf) {
  const out = [], seen = new Set();
  for (let p = 1; p <= doc.numPages; p++) {
    const head = (await textOf(p)).replace(/\s+/g, " ").trim().slice(0, 90);
    const m = head.match(/^(chapter|unit|lesson)\s+(\d{1,2}|[ivx]{1,4})\b[\s:.\-]*(.{0,50})/i);
    if (!m) continue;
    const key = `${m[1].toLowerCase()}${m[2].toLowerCase()}`;
    if (seen.has(key)) continue; seen.add(key);
    out.push({ title: `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2]}${m[3] ? ": " + m[3].trim().replace(/[\s.]+$/, "") : ""}`, page: p, level: 0 });
  }
  return out.length >= 3 ? out : [];
}

let done = 0;
for (const b of manifest) {
  if (onlyClass && String(b.class) !== onlyClass) continue;
  const stem = b.file.replace(/\.pdf$/i, "");
  if (onlyBook && stem !== onlyBook) continue;
  const outDir = join(root, "pages", `class-${b.class}`, stem);
  const metaFile = join(outDir, "meta.json");
  mkdirSync(outDir, { recursive: true });
  const pdfPath = join(root, "pdf", `class-${b.class}`, b.file);
  if (!existsSync(pdfPath)) { log("missing", pdfPath); continue; }
  const have = new Set(readdirSync(outDir));
  const todo = [];
  for (let n = 1; n <= b.pages; n++) for (const k of ["t", "s", "l"]) if (!have.has(`${n}-${k}.webp`)) todo.push([n, k]);
  const needToc = redoToc || !have.has("toc.json");
  if (!todo.length && !needToc && have.has("meta.json")) { log("ready", b.title); continue; }
  log("opening", `class ${b.class}`, b.title, `(${b.pages} pages, ${todo.length} pictures to make)`);
  const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(pdfPath)), standardFontDataUrl: stdFonts, isEvalSupported: false, useSystemFonts: false, verbosity: 0 }).promise;
  const first = await doc.getPage(1);
  const v1 = first.getViewport({ scale: 1 });
  writeFileSync(metaFile, JSON.stringify({ pages: doc.numPages, ratio: v1.width / v1.height, sizes: SIZES, builtAt: new Date().toISOString() }));
  let lastLog = Date.now();
  const pages = [...new Set(todo.map(([n]) => n))];
  for (const n of pages) {
    if (limit && done >= limit) break;
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: SIZES.l / base.width });
    const f = doc.canvasFactory.create(Math.max(1, Math.round(vp.width)), Math.max(1, Math.round(vp.height)));
    f.context.fillStyle = "#fff"; f.context.fillRect(0, 0, f.canvas.width, f.canvas.height);
    await page.render({ canvasContext: f.context, viewport: vp, canvas: f.canvas }).promise;
    for (const k of ["l", "s", "t"]) {
      if (have.has(`${n}-${k}.webp`)) continue;
      let c = f.canvas;
      if (k !== "l") { const w = SIZES[k], h = Math.max(1, Math.round((f.canvas.height * w) / f.canvas.width)); c = createCanvas(w, h); const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(f.canvas, 0, 0, w, h); }
      writeFileSync(join(outDir, `${n}-${k}.webp`), await c.encode("webp", QUALITY[k]));
    }
    page.cleanup(); doc.canvasFactory.destroy(f);
    done++;
    if (Date.now() - lastLog > 15000) { log(`  ${b.title}: page ${n}/${b.pages}`); lastLog = Date.now(); }
  }
  if (needToc) {
    const cache = new Map();
    const textOf = async (p) => { if (!cache.has(p)) { const t = await (await doc.getPage(p)).getTextContent(); cache.set(p, t.items.map((i) => i.str ?? "").join(" ")); } return cache.get(p); };
    let toc = overrides[`class-${b.class}/${stem}`] ?? [];
    if (!toc.length) {
      const named = await matchToc(doc, b.class, textOf).catch(() => []);
      const marks = (await outlineToc(doc).catch(() => [])).filter((e) => !/^[a-z]{3,5}\d{2,}$/i.test(e.title));
      const chapterMarks = marks.filter((e) => /^chapter\s*\d+$/i.test(e.title));
      if (named.length >= 4 || (named.length >= 2 && !marks.length)) toc = named; // clear chapter names from the curriculum
      else if (marks.length) toc = marks;
      else toc = named;
      if (!toc.length) toc = await headingToc(doc, textOf).catch(() => []);
      void chapterMarks;
    }
    toc.sort((x, y) => x.page - y.page || x.level - y.level);
    writeFileSync(join(outDir, "toc.json"), JSON.stringify(toc));
    log(`  contents: ${toc.length} entries`);
  }
  await doc.cleanup?.();
  if (limit && done >= limit) break;
}
log("DONE");
