/**
 * The only file that touches pdf.js. Everything is local: the library, its worker and its helper files
 * (fonts, colour profiles, image decoders) are part of the site build, and the only network request is for
 * the book's own PDF on this server. Loaded on demand, so pages without a book never download it.
 */
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { pageSentences, type PdfTextItem, type Sentence } from "./sentences";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
/** copied from the pdfjs-dist package by the build (see vite.config.ts) */
const ASSETS = `${import.meta.env.BASE_URL}assets/pdfjs/${pdfjs.version}/`;

export interface PdfBook {
  numPages: number;
  /** width / height of the first page */
  ratio: number;
  /** a picture of page n, at least `width` device pixels wide (object URL); cached */
  image(n: number, width: number, priority?: number): Promise<string>;
  /** the best picture of page n that is ready right now, or null */
  ready(n: number, width?: number): string | null;
  /** a small picture of page n */
  thumb(n: number): Promise<string>;
  /** the sentences on page n with their highlight boxes; an empty list for a scanned (picture-only) page */
  text(n: number): Promise<Sentence[]>;
  textReady(n: number): Sentence[] | null;
  destroy(): void;
}

const BUCKETS = [600, 900, 1300, 1800, 2400];
export const bucketFor = (w: number) => BUCKETS.find((b) => b >= w) ?? BUCKETS[BUCKETS.length - 1]!;
const THUMB_W = 132;
const MAX_FULL = 26; // rendered full-size pages kept in memory

export async function openBook(url: string): Promise<PdfBook> {
  const task = pdfjs.getDocument({
    url,
    cMapUrl: `${ASSETS}cmaps/`, cMapPacked: true,
    standardFontDataUrl: `${ASSETS}standard_fonts/`,
    wasmUrl: `${ASSETS}wasm/`,
    iccUrl: `${ASSETS}iccs/`,
    disableAutoFetch: true, // big textbooks: fetch only the parts needed for the pages being read
    disableStream: true,
    rangeChunkSize: 262144,
    enableXfa: false,
  });
  const doc = await task.promise;
  const first = await doc.getPage(1);
  const v1 = first.getViewport({ scale: 1 });
  const ratio = v1.width > 0 && v1.height > 0 ? v1.width / v1.height : 0.75;
  let dead = false;

  // one render at a time, most urgent first
  interface Job { pr: number; run: () => Promise<void> }
  const queue: Job[] = [];
  let busy = false;
  const pump = () => {
    if (busy || dead) return;
    const job = queue.shift();
    if (!job) return;
    busy = true;
    void job.run().finally(() => { busy = false; pump(); });
  };
  const enqueue = <T,>(pr: number, fn: () => Promise<T>) => new Promise<T>((resolve, reject) => {
    const job: Job = { pr, run: () => fn().then(resolve, reject) };
    const at = queue.findIndex((q) => q.pr > pr);
    if (at < 0) queue.push(job); else queue.splice(at, 0, job);
    pump();
  });

  async function draw(n: number, width: number, quality: number): Promise<string> {
    if (dead) throw new Error("closed");
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    try {
      await page.render({ canvas, viewport, background: "#ffffff" }).promise;
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
      if (!blob) throw new Error("no image");
      return URL.createObjectURL(blob);
    } finally { canvas.width = canvas.height = 0; page.cleanup(); }
  }

  const full = new Map<string, { url?: string; promise: Promise<string> }>(); // insertion order = least recently used first
  const touch = (key: string) => { const e = full.get(key); if (e) { full.delete(key); full.set(key, e); } };
  const trim = () => {
    for (const [key, e] of full) {
      if (full.size <= MAX_FULL) break;
      if (!e.url) continue;
      full.delete(key);
      const url = e.url;
      setTimeout(() => URL.revokeObjectURL(url), 30_000); // a page turn in progress may still be showing it
    }
  };
  const thumbs = new Map<number, { url?: string; promise: Promise<string> }>();
  const texts = new Map<number, { list?: Sentence[]; promise: Promise<Sentence[]> }>();
  const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= doc.numPages;

  return {
    numPages: doc.numPages,
    ratio,
    image(n, width, priority = 1) {
      if (!ok(n)) return Promise.reject(new Error("no such page"));
      const b = bucketFor(width), key = `${n}@${b}`;
      const hit = full.get(key);
      if (hit) { touch(key); return hit.promise; }
      const entry: { url?: string; promise: Promise<string> } = { promise: Promise.resolve("") };
      entry.promise = enqueue(priority, () => draw(n, b, 0.9)).then((url) => { entry.url = url; trim(); return url; }, (e) => { full.delete(key); throw e; });
      entry.promise.catch(() => { /* reported to whoever asked */ });
      full.set(key, entry);
      return entry.promise;
    },
    ready(n, width) {
      const want = width ? bucketFor(width) : 0;
      let best: string | null = null, bestB = -1;
      for (const b of BUCKETS) {
        const e = full.get(`${n}@${b}`);
        if (!e?.url) continue;
        if (want && b === want) { touch(`${n}@${b}`); return e.url; }
        if (b > bestB) { best = e.url; bestB = b; }
      }
      return best ?? thumbs.get(n)?.url ?? null;
    },
    thumb(n) {
      if (!ok(n)) return Promise.reject(new Error("no such page"));
      const hit = thumbs.get(n);
      if (hit) return hit.promise;
      const entry: { url?: string; promise: Promise<string> } = { promise: Promise.resolve("") };
      entry.promise = enqueue(5, () => draw(n, THUMB_W * Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1))), 0.8)).then((url) => { entry.url = url; return url; }, (e) => { thumbs.delete(n); throw e; });
      entry.promise.catch(() => { /* reported to whoever asked */ });
      thumbs.set(n, entry);
      return entry.promise;
    },
    text(n) {
      if (!ok(n)) return Promise.resolve([]);
      const hit = texts.get(n);
      if (hit) return hit.promise;
      const entry: { list?: Sentence[]; promise: Promise<Sentence[]> } = { promise: Promise.resolve([]) };
      entry.promise = (async () => {
        try {
          const page = await doc.getPage(n);
          const vp = page.getViewport({ scale: 1 });
          const content = await page.getTextContent();
          const items = content.items.filter((it): it is typeof it & PdfTextItem => typeof (it as { str?: unknown }).str === "string");
          entry.list = pageSentences(items as PdfTextItem[], vp.transform as number[], vp.width, vp.height);
        } catch { entry.list = []; } // a page whose text cannot be read is treated like a scanned page
        return entry.list;
      })();
      texts.set(n, entry);
      return entry.promise;
    },
    textReady: (n) => texts.get(n)?.list ?? null,
    destroy() {
      dead = true;
      queue.length = 0;
      for (const e of full.values()) if (e.url) URL.revokeObjectURL(e.url);
      for (const e of thumbs.values()) if (e.url) URL.revokeObjectURL(e.url);
      full.clear(); thumbs.clear(); texts.clear();
      void task.destroy();
    },
  };
}

/** The first page of a book as a small picture (for the shelf). Opens the PDF, draws one page, closes it. */
const covers = new Map<string, Promise<string>>();
export function coverOf(url: string, width = 360): Promise<string> {
  let p = covers.get(url);
  if (!p) {
    p = (async () => {
      const book = await openBook(url);
      try {
        const src = await book.image(1, width, 0);
        const blob = await (await fetch(src)).blob(); // keep a copy that survives closing the book
        return URL.createObjectURL(blob);
      } finally { book.destroy(); }
    })();
    p.catch(() => covers.delete(url));
    covers.set(url, p);
  }
  return p;
}
