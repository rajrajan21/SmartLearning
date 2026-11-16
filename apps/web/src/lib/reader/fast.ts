import type { PdfBook } from "./pdf";
import type { Sentence } from "./sentences";

export interface FastInfo { pages: number; ratio: number; base: string }

/**
 * A book whose pages were turned into small pictures ahead of time (tools: books:pages). Showing a page is then
 * just loading a picture, so there is no waiting for the big PDF. The PDF is only opened when the reader asks
 * for the words on a page (read aloud).
 */
export function openFast(info: FastInfo, pdfUrl: string | null): PdfBook {
  const loaded = new Map<string, Promise<string>>();
  const done = new Set<string>();
  let dead = false;
  let pdf: Promise<PdfBook> | null = null;
  const url = (n: number, k: "t" | "s" | "l") => `${info.base}${n}-${k}.webp`;
  const load = (n: number, k: "t" | "s" | "l"): Promise<string> => {
    const u = url(n, k);
    let p = loaded.get(u);
    if (!p) {
      p = new Promise<string>((ok, bad) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => { done.add(u); ok(u); };
        img.onerror = () => { loaded.delete(u); bad(new Error("picture missing")); };
        img.src = u;
      });
      p.catch(() => { /* reported to whoever asked */ });
      loaded.set(u, p);
    }
    return p;
  };
  const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= info.pages;
  const kind = (w: number) => (w <= 760 ? "s" : "l") as "s" | "l";
  const texts = () => (pdf ??= import("./pdf").then((m) => m.openBook(pdfUrl as string)));
  const sentences = new Map<number, Sentence[]>();
  return {
    numPages: info.pages,
    ratio: info.ratio,
    image: (n, width) => (!ok(n) || dead ? Promise.reject(new Error("no such page")) : load(n, kind(width))),
    ready(n, width) {
      const want = url(n, width ? kind(width) : "l");
      if (done.has(want)) return want;
      for (const k of ["l", "s", "t"] as const) if (done.has(url(n, k))) return url(n, k);
      return null;
    },
    thumb: (n) => (ok(n) ? load(n, "t") : Promise.reject(new Error("no such page"))),
    async text(n) {
      if (!ok(n) || !pdfUrl) return [];
      const hit = sentences.get(n); if (hit) return hit;
      try { const list = await (await texts()).text(n); sentences.set(n, list); return list; } catch { return []; }
    },
    textReady: (n) => sentences.get(n) ?? null,
    destroy() { dead = true; if (pdf) void pdf.then((b) => b.destroy(), () => {}); loaded.clear(); done.clear(); },
  };
}
