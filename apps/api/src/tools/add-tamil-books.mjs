// Adds the Tamil textbooks you put in content/books/pdf/class-N/Tamil/ to the book reader.
// For each PDF it makes a clean copy (class-N/tamil-term1.pdf ...), counts the pages and adds it to manifest.json.
// Safe to re-run: books already added are skipped. Your own files in the Tamil folders are never changed.
//   node src/tools/add-tamil-books.mjs
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = process.env.BOOKS_DIR ?? resolve(here, "../../../../content/books");
const require = createRequire(import.meta.url);
const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const stdFonts = join(dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts") + "/";

/** "Term 1", "Term_I", "Term_II", "Term 3", "Term_III" -> 1, 2, 3 (or null for a whole-year book). */
export function termOf(name) {
  const m = name.match(/term[\s_-]*(iii|ii|i|1|2|3)(?![a-z0-9])/i);
  if (!m) return null;
  return { i: 1, ii: 2, iii: 3, 1: 1, 2: 2, 3: 3 }[m[1].toLowerCase()];
}

const manifestFile = join(root, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
const have = new Set(manifest.books.map((b) => b.path));
let added = 0;
for (const dir of readdirSync(join(root, "pdf")).filter((d) => /^class-\d+$/.test(d)).sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)))) {
  const tdir = join(root, "pdf", dir, "Tamil");
  if (!existsSync(tdir)) continue;
  const cls = Number(dir.slice(6));
  const pdfs = readdirSync(tdir).filter((f) => /\.pdf$/i.test(f)).sort();
  for (const f of pdfs) {
    const term = termOf(f);
    const file = term ? `tamil-term${term}.pdf` : pdfs.length === 1 ? "tamil.pdf" : `tamil-${createHash("md5").update(f).digest("hex").slice(0, 6)}.pdf`;
    const rel = `content/books/pdf/${dir}/${file}`;
    if (have.has(rel)) { console.log("already added", rel); continue; }
    const dest = join(root, "pdf", dir, file);
    if (!existsSync(dest)) copyFileSync(join(tdir, f), dest);
    let pages = 0;
    try {
      const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(dest)), standardFontDataUrl: stdFonts, isEvalSupported: false, useSystemFonts: false, verbosity: 0 }).promise;
      pages = doc.numPages; await doc.destroy();
    } catch (e) { console.log("could not read", f, String(e.message ?? e)); continue; }
    manifest.books.push({
      title: `Tamil${term ? ` - Term ${term}` : ""}`, class: cls, subject: "Tamil", language: "Tamil", file, path: rel, kind: "single", status: "ok",
      source: "tntextbooks (added by you)", pages, bytes: statSync(dest).size, sha256: createHash("sha256").update(readFileSync(dest)).digest("hex"),
    });
    added++;
    console.log("added", `class ${cls}`, file, `${pages} pages`);
  }
}
if (added) writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
console.log(added ? `${added} Tamil book(s) added.` : "Nothing new to add.");
