// Turns E-Library PDFs into small ready-made page pictures (WebP, thumbnail / normal / large) so the Book Reader never
// has to open the big PDF to show a page. Safe to stop and re-run: finished pictures are skipped.
//   node src/tools/build-library-pages.mjs [--id book-id] [--all] [--limit N]   (--id is what the site's background job uses)
//   env: LIBRARY_DIR (default data/library), LIB_PAGE_WIDTHS="160,700,1400", LIB_PAGE_QUALITY=72, LIB_PAGE_MAX=600, LIB_PAGE_DPR_CAP=1
import { createRequire } from "node:module";
import { createCanvas } from "@napi-rs/canvas";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const lib = process.env.LIBRARY_DIR ?? resolve(here, "../../../../data/library");
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const limit = Number(opt("limit") ?? 0);
const [wt, ws, wl] = (process.env.LIB_PAGE_WIDTHS ?? "160,700,1400").split(",").map((x) => Math.min(3000, Math.max(80, Number(x) || 0)));
const SIZES = { t: wt || 160, s: ws || 700, l: wl || 1400 };
const q = Math.min(95, Math.max(30, Number(process.env.LIB_PAGE_QUALITY ?? 72)));
const QUALITY = { t: Math.max(30, q - 12), s: q, l: Math.min(95, q + 2) };
const maxPages = Number(process.env.LIB_PAGE_MAX ?? 600);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const require = createRequire(import.meta.url);
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const stdFonts = join(dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts") + "/";
const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;

let ids = [];
if (opt("id")) ids = [opt("id")];
else if (existsSync(join(lib, "pdf"))) ids = readdirSync(join(lib, "pdf")).filter((f) => /\.pdf$/i.test(f)).map((f) => f.replace(/\.pdf$/i, ""));
ids = ids.filter((id) => ID.test(id));

let made = 0, failed = 0;
for (const id of ids) {
  const pdfPath = join(lib, "pdf", `${id}.pdf`);
  const outDir = join(lib, "pages", id);
  if (!existsSync(pdfPath)) { log("missing", id); continue; }
  mkdirSync(outDir, { recursive: true });
  const metaFile = join(outDir, "meta.json");
  let meta = null; try { meta = JSON.parse(readFileSync(metaFile, "utf8")); } catch { /* new */ }
  const same = meta && meta.sizes && meta.sizes.t === SIZES.t && meta.sizes.s === SIZES.s && meta.sizes.l === SIZES.l && meta.q === q;
  if (meta?.done && same) { log("ready", id); continue; }
  if (meta && !same) for (const f of readdirSync(outDir)) if (f.endsWith(".webp")) rmSync(join(outDir, f), { force: true }); // settings changed: draw again
  try {
    const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(pdfPath)), standardFontDataUrl: stdFonts, isEvalSupported: false, useSystemFonts: false, verbosity: 0 }).promise;
    if (maxPages > 0 && doc.numPages > maxPages) { writeFileSync(metaFile, JSON.stringify({ pages: doc.numPages, tooBig: true, done: false })); log("skip (too many pages)", id, doc.numPages); await doc.cleanup?.(); continue; }
    const first = await doc.getPage(1); const v1 = first.getViewport({ scale: 1 });
    const ratio = v1.width / v1.height;
    const have = new Set(readdirSync(outDir));
    log("opening", id, `(${doc.numPages} pages)`);
    let lastLog = Date.now();
    for (let n = 1; n <= doc.numPages; n++) {
      if (["t", "s", "l"].every((k) => have.has(`${n}-${k}.webp`))) continue;
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: SIZES.l / base.width });
      const f = doc.canvasFactory.create(Math.max(1, Math.round(vp.width)), Math.max(1, Math.round(vp.height)));
      f.context.fillStyle = "#fff"; f.context.fillRect(0, 0, f.canvas.width, f.canvas.height);
      await page.render({ canvasContext: f.context, viewport: vp, canvas: f.canvas }).promise;
      for (const k of ["l", "s", "t"]) {
        let c = f.canvas;
        if (k !== "l") { const w = SIZES[k], h = Math.max(1, Math.round((f.canvas.height * w) / f.canvas.width)); c = createCanvas(w, h); const x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(f.canvas, 0, 0, w, h); }
        const tmp = join(outDir, `.${n}-${k}.tmp`);
        writeFileSync(tmp, await c.encode("webp", QUALITY[k])); renameSync(tmp, join(outDir, `${n}-${k}.webp`)); // a half-written picture is never served
      }
      page.cleanup(); doc.canvasFactory.destroy(f); made++;
      if (Date.now() - lastLog > 15000) { log(`  ${id}: page ${n}/${doc.numPages}`); lastLog = Date.now(); }
      if (limit && made >= limit) break;
    }
    const complete = Array.from({ length: doc.numPages }, (_, i) => i + 1).every((n) => ["t", "s", "l"].every((k) => existsSync(join(outDir, `${n}-${k}.webp`))));
    writeFileSync(metaFile, JSON.stringify({ pages: doc.numPages, ratio, sizes: SIZES, q, done: complete, builtAt: new Date().toISOString() }));
    await doc.cleanup?.();
  } catch (e) { failed++; log("FAILED", id, String(e?.message ?? e).slice(0, 200)); writeFileSync(metaFile, JSON.stringify({ failed: true, done: false, at: new Date().toISOString() })); }
  if (limit && made >= limit) break;
}
log(`DONE: ${made} pages drawn${failed ? `, ${failed} book(s) could not be read` : ""}`);
process.exit(failed && !made && ids.length === 1 ? 2 : 0);
