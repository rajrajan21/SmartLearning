import { useEffect, useState } from "react";
import { store } from "../storage";

/** One textbook as GET /api/books lists it. */
export interface BookChapter { file: string; bytes: number; url: string }
export interface Book { id: string; classLevel: number; subject: string; title: string; language: string; file: string; bytes: number; pages: number | null; url: string | null; chapters?: BookChapter[]; fast?: { pages: number; ratio: number; base: string } | null; toc?: { title: string; page: number; level: number }[] }
export interface BooksState { status: "loading" | "ready"; books: Book[] }

const TTL = 60_000;
let cache: { at: number; promise: Promise<Book[]> } | null = null;
/** for tests */
export function resetBooksCache() { cache = null; }

export function loadBooks(): Promise<Book[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.promise;
  const promise = fetch("/api/books")
    .then((r) => (r.ok ? r.json() : { books: [] }))
    .then((d: { books?: unknown }) => (Array.isArray(d?.books) ? (d.books as Book[]).filter((b) => b && typeof b.title === "string" && Number.isInteger(b.classLevel)) : []))
    .catch(() => [] as Book[]); // offline, switched off, or not there: simply no textbooks
  cache = { at: Date.now(), promise };
  return promise;
}

/** The downloaded textbooks. `enabled` false (feature switched off) never asks the server. */
export function useBooks(enabled: boolean): BooksState {
  const [state, setState] = useState<BooksState>({ status: enabled ? "loading" : "ready", books: [] });
  useEffect(() => {
    if (!enabled) { setState({ status: "ready", books: [] }); return; }
    let alive = true;
    void loadBooks().then((books) => { if (alive) setState({ status: "ready", books }); });
    return () => { alive = false; };
  }, [enabled]);
  return state;
}

export const booksOfClass = (books: Book[], level: number) => books.filter((b) => b.classLevel === level);
/** where a book opens in the reader */
export const readerHref = (b: Book, chapter?: BookChapter) => (b.chapters ? `/books/${b.classLevel}/${encodeURIComponent(b.file)}/${encodeURIComponent((chapter ?? b.chapters[0]!).file)}` : `/books/${b.classLevel}/${encodeURIComponent(b.file)}`);
export const shelfHref = (level: number) => `/books?class=${level}`;
export const prettySize = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(bytes >= 10485760 ? 0 : 1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

// ---- what the reader remembers on this device ----
const K = { page: "ss_reader_page_", mark: "ss_reader_mark_", lang: "ss_reader_lang_", style: "ss_reader_style", night: "ss_reader_night", rate: "ss_reader_rate", voice: "ss_reader_voice_", auto: "ss_reader_autoturn" };
export const readerStore = {
  page: (id: string) => Number(store.get(K.page + id)) || 0,
  setPage: (id: string, p: number) => store.set(K.page + id, String(p)),
  mark: (id: string) => Number(store.get(K.mark + id)) || 0,
  setMark: (id: string, p: number) => store.set(K.mark + id, String(p)),
  lang: (id: string) => { const v = store.get(K.lang + id); return v === "ta" || v === "en" ? v : null; },
  setLang: (id: string, l: "en" | "ta") => store.set(K.lang + id, l),
  style: () => { const v = store.get(K.style); return v === "a" || v === "b" || v === "c" ? v : null; },
  setStyle: (v: "a" | "b" | "c") => store.set(K.style, v),
  night: () => store.get(K.night) === "1",
  setNight: (on: boolean) => store.set(K.night, on ? "1" : "0"),
  rate: () => { const v = store.get(K.rate); return v === null ? null : Number(v); },
  setRate: (r: number) => store.set(K.rate, String(r)),
  voice: (l: "en" | "ta") => store.get(K.voice + l),
  setVoice: (l: "en" | "ta", name: string) => store.set(K.voice + l, name),
  autoTurn: () => { const v = store.get(K.auto); return v === null ? null : v === "1"; },
  setAutoTurn: (on: boolean) => store.set(K.auto, on ? "1" : "0"),
};
