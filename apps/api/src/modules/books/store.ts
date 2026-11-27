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
  aliases?: string[];
  publisher?: string;
  bytes: number;
  pages: number | null;
  /** where the PDF is served from; null for a book that only exists as separate chapter files */
  url: string | null;
  chapters?: BookChapter[];
  /** ready-made page pictures (built by books:pages); the reader uses them instead of opening the PDF */
  fast?: { pages: number; ratio: number; base: string } | null;
  /** chapters and sub-chapters with the page they start on */
  toc?: { title: string; page: number; level: number }[];
}
export interface BookList { books: Book[]; classes: { classLevel: number; subjects: { subject: string; books: Book[] }[] }[] }
export interface BookStore {
  list(): BookList;
  /** absolute path of a servable PDF, or null (unknown, unsafe or missing) */
  filePath(classLevel: string, name: string, chapter?: string): string | null;
  /** absolute path of a ready-made page picture, or null */
  pagePath(classLevel: string, book: string, file: string): string | null;
}

const CLASS = /^(?:[1-9]|1[0-2])$/;
/** one plain file or folder name: no slashes, no leading dot, nothing but letters, digits, dot, dash, underscore */
const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/;
const isPdfName = (n: string) => NAME.test(n) && /\.pdf$/i.test(n) && !n.includes("..");
const isDirName = (n: string) => NAME.test(n) && !n.includes("..");

interface Row { title?: unknown; class?: unknown; classLevel?: unknown; subject?: unknown; language?: unknown; file?: unknown; path?: unknown; kind?: unknown; pages?: unknown; bytes?: unknown; chapterFiles?: unknown; status?: unknown; sha256?: unknown; aliases?: unknown; publisher?: unknown; source?: unknown }

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
      const publisher = typeof r.publisher === "string" && r.publisher.trim()
        ? r.publisher.trim().slice(0, 160)
        : typeof r.source === "string" && /^ncert\b/i.test(r.source) ? "NCERT" : undefined;
      const credit = publisher ? { publisher } : {};
      const chaptersDir = r.kind === "chapters" || Array.isArray(r.chapterFiles) || (relPath !== "" && !/\.pdf$/i.test(relPath) && relPath.includes("/_chapters/"));
      if (r.status === "partial" && !chaptersDir) continue;
      if (!chaptersDir) {
        let name = typeof r.file === "string" && r.file ? r.file : basename(relPath);
        if (name && !/\.pdf$/i.test(name)) name += ".pdf";
        if (!isPdfName(name)) continue;
        const bytes = sizeOf(safe(`class-${level}`, name));
        if (bytes === null) continue; // listed but not on disk
        const id = `${level}/${name}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const stem = name.replace(/\.pdf$/i, "");
        const pdir = join(dir, "pages", `class-${level}`, stem);
        let fast: Book["fast"] = null, toc: Book["toc"];
        try {
          const m = JSON.parse(readFileSync(join(pdir, "meta.json"), "utf8")) as { pages?: number; ratio?: number; ready?: boolean; sourceSha256?: string };
          const validSource = typeof r.sha256 !== "string" || !m.sourceSha256 || r.sha256 === m.sourceSha256;
          const count = m.pages ?? 0;
          const validCount = Number.isInteger(count) && count > 0 && count <= 10000 && (base.pages === null || count === base.pages);
          const files = validSource && validCount && m.ready !== false ? new Set(readdirSync(pdir)) : new Set<string>();
          if (m.pages && Array.from({ length: validCount && files.size ? count : 0 }, (_, i) => i + 1).every(page =>
            ["t", "s", "l"].every(size => files.has(`${page}-${size}.webp`))) && files.size) fast = { pages: m.pages, ratio: Number(m.ratio) || 0.75, base: `/api/books/pages/${level}/${encodeURIComponent(stem)}/` };
        } catch { /* not built yet */ }
        try { const t = JSON.parse(readFileSync(join(pdir, "toc.json"), "utf8")); if (Array.isArray(t)) toc = t.filter((e) => e && typeof e.title === "string" && Number.isInteger(e.page) && e.page > 0 && (base.pages === null || e.page <= base.pages)).map((e) => ({ title: String(e.title).slice(0, 120), page: e.page, level: e.level === 1 || e.level === 2 ? e.level : 0 })); } catch { /* no contents list */ }
        const aliases = Array.isArray(r.aliases) ? r.aliases.filter((alias): alias is string =>
          typeof alias === "string" && alias !== name && isPdfName(alias)) : [];
        books.push({ id, ...base, ...credit, file: name, ...(aliases.length ? { aliases } : {}), bytes, url: `/api/books/file/${level}/${encodeURIComponent(name)}`, fast, ...(toc && toc.length ? { toc } : {}) });
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
        books.push({ id, ...base, ...credit, pages: null, file: folder, bytes: chapters.reduce((a, c) => a + c.bytes, 0), url: null, chapters });
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

  function list() {
      let mtimeMs = -1;
      try { mtimeMs = statSync(manifestPath).mtimeMs; } catch { /* missing */ }
      // re-read when the manifest changes, and at least every 30 seconds (files may be added or removed by hand)
      if (!cache || cache.mtimeMs !== mtimeMs || Date.now() - cache.at > 30_000) cache = { mtimeMs, at: Date.now(), list: mtimeMs < 0 || !existsSync(root) ? { books: [], classes: [] } : read() };
      return cache.list;
  }

  return {
    list,
    pagePath(classLevel, book, file) {
      if (!CLASS.test(classLevel) || !isDirName(book) || !/^\d{1,4}-[tsl]\.webp$/.test(file)) return null;
      const p = resolve(dir, "pages", `class-${classLevel}`, book, file);
      const base = resolve(dir, "pages") + sep;
      return p.startsWith(base) && existsSync(p) ? p : null;
    },
    filePath(classLevel, name, chapter) {
      if (!CLASS.test(classLevel)) return null;
      let p: string | null;
      if (chapter === undefined) {
        if (!isPdfName(name)) return null;
        const books = list().books;
        const canonical = books.find(b => String(b.classLevel) === classLevel && b.file === name)
          ?? books.find(b => String(b.classLevel) === classLevel && b.aliases?.includes(name));
        p = safe(`class-${classLevel}`, canonical?.file ?? name);
      }
      else { if (!isDirName(name) || !isPdfName(chapter)) return null; p = safe(`class-${classLevel}`, "_chapters", name, chapter); }
      return sizeOf(p) === null ? null : p;
    },
  };
}
