import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { basename, join, resolve, sep } from "node:path";

/**
 * Downloaded textbooks. tools/download_books.py saves the PDFs to <dir>/pdf/class-N/<file>.pdf and writes
 * <dir>/manifest.json. The PDFs are never in git; when nothing was downloaded the list is simply empty.
 */
export interface BookChapter { file: string; bytes: number; url: string }
export interface Book {
  id: string;
  classLevel: number;
  subject: string;
  title: string;
  language: string;
  /** file name inside class-N (for a chapters-only book: the folder name inside class-N/_chapters) */
  file: string;
  bytes: number;
  pages: number | null;
  /** where the PDF is served from; null for a book that only exists as separate chapter files */
  url: string | null;
  chapters?: BookChapter[];
}
export interface BookList { books: Book[]; classes: { classLevel: number; subjects: { subject: string; books: Book[] }[] }[] }
export interface BookStore {
  list(): BookList;
  /** absolute path of a servable PDF, or null (unknown, unsafe or missing) */
  filePath(classLevel: string, name: string, chapter?: string): string | null;
}

const CLASS = /^(?:[1-9]|1[0-2])$/;
/** one plain file or folder name: no slashes, no leading dot, nothing but letters, digits, dot, dash, underscore */
const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;
const isPdfName = (n: string) => NAME.test(n) && /\.pdf$/i.test(n) && !n.includes("..");
const isDirName = (n: string) => NAME.test(n) && !n.includes("..");

interface Row { title?: unknown; class?: unknown; classLevel?: unknown; subject?: unknown; language?: unknown; file?: unknown; path?: unknown; kind?: unknown; pages?: unknown; bytes?: unknown; chapterFiles?: unknown; status?: unknown }

const natural = (a: string, b: string) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });

export function createBookStore(dir: string): BookStore {
  const root = resolve(dir, "pdf");
  const manifestPath = join(dir, "manifest.json");
  let cache: { mtimeMs: number; at: number; list: BookList } | null = null;

  /** Resolve inside the pdf folder only; refuses anything that escapes it (also through a symlink). */
  function safe(...parts: string[]): string | null {
    const p = resolve(root, ...parts);
    if (!p.startsWith(root + sep)) return null;
    try {
      const real = realpathSync(p), realRoot = realpathSync(root);
      if (real !== realRoot && !real.startsWith(realRoot + sep)) return null;
      return real;
    } catch { return null; }
  }
  const sizeOf = (p: string | null): number | null => { try { const st = p ? statSync(p) : null; return st && st.isFile() ? st.size : null; } catch { return null; } };

  function read(): BookList {
    let rows: Row[] = [];
    try {
      const j = JSON.parse(readFileSync(manifestPath, "utf8")) as { books?: unknown } | unknown[];
      const b = Array.isArray(j) ? j : (j as { books?: unknown }).books;
      if (Array.isArray(b)) rows = b as Row[];
    } catch { /* no manifest yet, or unreadable: no books */ }
    const books: Book[] = [];
    const seen = new Set<string>();
    for (const r of rows) {
      if (!r || typeof r !== "object") continue;
      const level = Number(r.classLevel ?? r.class);
      if (!CLASS.test(String(level)) || typeof r.title !== "string" || typeof r.subject !== "string") continue;
      if (r.status === "failed") continue;
      const relPath = typeof r.path === "string" ? r.path.replace(/\\/g, "/") : "";
      const base = { classLevel: level, subject: r.subject, title: r.title, language: typeof r.language === "string" ? r.language : "English", pages: typeof r.pages === "number" && r.pages > 0 ? r.pages : null };
      const chaptersDir = r.kind === "chapters" || Array.isArray(r.chapterFiles) || (relPath !== "" && !/\.pdf$/i.test(relPath) && relPath.includes("/_chapters/"));
      if (!chaptersDir) {
        let name = typeof r.file === "string" && r.file ? r.file : basename(relPath);
        if (name && !/\.pdf$/i.test(name)) name += ".pdf";
        if (!isPdfName(name)) continue;
        const bytes = sizeOf(safe(`class-${level}`, name));
        if (bytes === null) continue; // listed but not on disk
        const id = `${level}/${name}`;
        if (seen.has(id)) continue;
        seen.add(id);
        books.push({ id, ...base, file: name, bytes, url: `/api/books/file/${level}/${encodeURIComponent(name)}` });
      } else {
        const folder = basename(relPath) || (typeof r.file === "string" ? r.file : "");
        if (!isDirName(folder)) continue;
        const d = safe(`class-${level}`, "_chapters", folder);
        if (!d) continue;
        let names: string[] = [];
        try { names = readdirSync(d).filter(isPdfName).sort(natural); } catch { continue; }
        const chapters: BookChapter[] = [];
        for (const n of names) {
          const bytes = sizeOf(safe(`class-${level}`, "_chapters", folder, n));
          if (bytes !== null) chapters.push({ file: n, bytes, url: `/api/books/file/${level}/${encodeURIComponent(folder)}/${encodeURIComponent(n)}` });
        }
        const id = `${level}/${folder}/`;
        if (chapters.length === 0 || seen.has(id)) continue;
        seen.add(id);
        books.push({ id, ...base, pages: null, file: folder, bytes: chapters.reduce((a, c) => a + c.bytes, 0), url: null, chapters });
      }
    }
    books.sort((a, b) => a.classLevel - b.classLevel || natural(a.subject, b.subject) || natural(a.title, b.title));
    const classes: BookList["classes"] = [];
    for (const b of books) {
      let c = classes.find((x) => x.classLevel === b.classLevel);
      if (!c) classes.push((c = { classLevel: b.classLevel, subjects: [] }));
      let s = c.subjects.find((x) => x.subject === b.subject);
      if (!s) c.subjects.push((s = { subject: b.subject, books: [] }));
      s.books.push(b);
    }
    return { books, classes };
  }

  return {
    list() {
      let mtimeMs = -1;
      try { mtimeMs = statSync(manifestPath).mtimeMs; } catch { /* missing */ }
      // re-read when the manifest changes, and at least every 30 seconds (files may be added or removed by hand)
      if (!cache || cache.mtimeMs !== mtimeMs || Date.now() - cache.at > 30_000) cache = { mtimeMs, at: Date.now(), list: mtimeMs < 0 || !existsSync(root) ? { books: [], classes: [] } : read() };
      return cache.list;
    },
    filePath(classLevel, name, chapter) {
      if (!CLASS.test(classLevel)) return null;
      let p: string | null;
      if (chapter === undefined) { if (!isPdfName(name)) return null; p = safe(`class-${classLevel}`, name); }
      else { if (!isDirName(name) || !isPdfName(chapter)) return null; p = safe(`class-${classLevel}`, "_chapters", name, chapter); }
      return sizeOf(p) === null ? null : p;
    },
  };
}
