import { createRequire } from "node:module";
import { dirname, join } from "node:path";

/**
 * Reads text, contents list, title/author and the first page picture out of a PDF with pdf.js (the same engine the reader uses).
 * pdf.js never runs scripts in this mode (no eval, no XFA). Everything is optional: if pdf.js or the canvas library is missing
 * on a machine, `engine` is false and the review says so honestly instead of guessing.
 */
export interface Extracted {
  engine: boolean;
  pageCount: number;
  pages: string[];
  outline: { title: string; page: number; level: number }[];
  info: { title: string; author: string };
  coverJpeg: Buffer | null;
  /** page widths/heights in points (first 3 pages), used for a sanity check */
  error?: string;
}
export interface ExtractOptions { maxPages: number; maxMs: number; cover: boolean; charsPerPage?: number }

type Pdfjs = { getDocument(o: unknown): { promise: Promise<any>; destroy?: () => void } };
let pdfjsP: Promise<{ pdfjs: Pdfjs; fonts: string } | null> | null = null;
function loadPdfjs() {
  pdfjsP ??= (async () => {
    try {
      const require = createRequire(import.meta.url);
      const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as unknown as Pdfjs;
      const fonts = join(dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts") + "/";
      return { pdfjs, fonts };
    } catch { return null; }
  })();
  return pdfjsP;
}

async function pageIndexOf(doc: any, dest: unknown): Promise<number | null> {
  try {
    const d = typeof dest === "string" ? await doc.getDestination(dest) : dest;
    if (!Array.isArray(d)) return null;
    const ref = d[0];
    return typeof ref === "object" && ref ? (await doc.getPageIndex(ref)) + 1 : typeof ref === "number" ? ref + 1 : null;
  } catch { return null; }
}

export async function extractPdf(buf: Buffer, o: ExtractOptions): Promise<Extracted> {
  const empty: Extracted = { engine: false, pageCount: 0, pages: [], outline: [], info: { title: "", author: "" }, coverJpeg: null };
  const lib = await loadPdfjs();
  if (!lib) return { ...empty, error: "The PDF reading engine is not installed on this server." };
  const started = Date.now();
  let task: ReturnType<Pdfjs["getDocument"]> | null = null;
  try {
    task = lib.pdfjs.getDocument({ data: new Uint8Array(buf), standardFontDataUrl: lib.fonts, isEvalSupported: false, useSystemFonts: false, enableXfa: false, verbosity: 0, disableAutoFetch: true, stopAtErrors: false });
    const doc = await task.promise;
    const pageCount: number = doc.numPages;
    const out: Extracted = { ...empty, engine: true, pageCount };
    try {
      const meta = await doc.getMetadata();
      out.info = { title: String(meta?.info?.Title ?? "").slice(0, 200), author: String(meta?.info?.Author ?? "").slice(0, 200) };
    } catch { /* no metadata */ }
    const limit = Math.min(pageCount, o.maxPages);
    const cap = o.charsPerPage ?? 20000;
    for (let p = 1; p <= limit; p++) {
      if (Date.now() - started > o.maxMs) { out.error = `Only the first ${p - 1} pages were read (time limit).`; break; }
      try {
        const page = await doc.getPage(p);
        const tc = await page.getTextContent();
        let s = "";
        for (const it of tc.items as { str?: string; hasEOL?: boolean }[]) { if (typeof it.str === "string") s += it.str + (it.hasEOL ? "\n" : " "); if (s.length > cap) break; }
        out.pages.push(s.replace(/[ \t\u00a0]+/g, " ").replace(/ ?\n ?/g, "\n").slice(0, cap));
        page.cleanup?.();
      } catch { out.pages.push(""); }
    }
    try {
      const walk = async (items: any[] | null, level: number) => {
        for (const it of items ?? []) {
          if (out.outline.length >= 300) return;
          const page = await pageIndexOf(doc, it.dest);
          const title = String(it.title ?? "").trim().replace(/\s+/g, " ").slice(0, 160);
          if (page && title) out.outline.push({ title, page, level });
          if (level < 2) await walk(it.items, level + 1);
        }
      };
      await walk(await doc.getOutline(), 0);
    } catch { /* no outline */ }
    if (o.cover) {
      try {
        const { createCanvas } = await import("@napi-rs/canvas");
        const page = await doc.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: 520 / base.width });
        const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
        out.coverJpeg = await canvas.encode("jpeg", 78);
      } catch { /* no cover: the library shows a default one */ }
    }
    return out;
  } catch (e) {
    return { ...empty, error: (e as Error)?.message?.slice(0, 160) || "The PDF could not be read." };
  } finally {
    try { await task?.destroy?.(); } catch { /* ignore */ }
  }
}
