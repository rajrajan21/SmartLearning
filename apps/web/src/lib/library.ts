import { useEffect, useState } from "react";
import type { Lang } from "./i18n";

export interface LibBook {
  id: string; title: string; authors: string[]; language: string; ageBand: string; ageSource: "source" | "guess";
  pages: number | null; bytes: number; licence: { code: string; name: string; url: string };
  source: { site: string; siteName: string; url: string }; tags: string[]; addedAt: string; hasCover: boolean;
  toc?: { title: string; page: number; level: number }[];
  contributed?: { by: string; handle: string; submissionId: string; download: boolean; hasText: boolean; hasOutline: boolean; licenceNote: string };
}
export interface LibList { books: LibBook[]; bands: { band: string; count: number }[]; languages: { code: string; count: number }[]; bytes: number }

export function useLibrary(on: boolean): { state: "loading" | "off" | "error" | "ready"; data: LibList | null } {
  const [r, setR] = useState<{ state: "loading" | "off" | "error" | "ready"; data: LibList | null }>({ state: "loading", data: null });
  useEffect(() => {
    if (!on) { setR({ state: "off", data: null }); return; }
    let alive = true;
    fetch("/api/v1/library").then(async (res) => {
      if (res.status === 404) return alive && setR({ state: "off", data: null });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as LibList;
      if (alive) setR({ state: "ready", data });
    }).catch(() => alive && setR({ state: "error", data: null }));
    return () => { alive = false; };
  }, [on]);
  return r;
}

export const fileUrl = (id: string) => `/api/v1/library/${encodeURIComponent(id)}/file`;
export const coverUrl = (id: string) => `/api/v1/library/${encodeURIComponent(id)}/cover`;
export const mb = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

const T = {
  title: { en: "E-Library", ta: "மின்நூலகம்" },
  intro: { en: "Free story and learning books for children, collected from around the world. Pick an age range.", ta: "உலகெங்கும் இருந்து சேகரித்த குழந்தைகளுக்கான இலவச கதை மற்றும் கற்றல் நூல்கள். வயது வரம்பைத் தேர்ந்தெடுக்கவும்." },
  all: { en: "All ages", ta: "அனைத்து வயது" },
  age: { en: "Age", ta: "வயது" },
  lang: { en: "Language", ta: "மொழி" },
  anyLang: { en: "Any language", ta: "எந்த மொழியும்" },
  search: { en: "Search books", ta: "நூல்களைத் தேடு" },
  sort: { en: "Order", ta: "வரிசை" },
  sNew: { en: "Newest", ta: "புதியவை" }, sTitle: { en: "A to Z", ta: "அ முதல்" }, sShort: { en: "Shortest", ta: "சிறியவை" },
  none: { en: "No books here yet. Check back soon.", ta: "இங்கே இன்னும் நூல்கள் இல்லை. விரைவில் பாருங்கள்." },
  noMatch: { en: "No book matches. Try another age range or word.", ta: "பொருந்தும் நூல் இல்லை. வேறு வயது வரம்பு அல்லது சொல்லை முயலுங்கள்." },
  newBadge: { en: "New", ta: "புதியது" },
  pages: { en: "pages", ta: "பக்கங்கள்" },
  by: { en: "by", ta: "ஆசிரியர்" },
  licence: { en: "Licence", ta: "உரிமம்" },
  source: { en: "Source", ta: "மூலம்" },
  download: { en: "Download PDF", ta: "PDF பதிவிறக்கு" },
  back: { en: "All books", ta: "அனைத்து நூல்கள்" },
  page: { en: "Page", ta: "பக்கம்" },
  ageGuess: { en: "Age range is our estimate", ta: "வயது வரம்பு எங்கள் மதிப்பீடு" },
  loadFail: { en: "Could not open this book. Try again.", ta: "இந்த நூலைத் திறக்க முடியவில்லை. மீண்டும் முயலுங்கள்." },
  credit: { en: "Shared under the licence shown; credit the author when you reuse it.", ta: "காட்டப்பட்ட உரிமத்தின் கீழ் பகிரப்படுகிறது; மறுபயன்பாட்டில் ஆசிரியருக்கு நன்றி கூறுங்கள்." },
} as const;
export const lt = (k: keyof typeof T, lang: Lang) => (T[k] as Record<string, string>)[lang] ?? T[k].en;
export const bandLabel = (b: string, lang: Lang) => (b === "all" ? lt("all", lang) : b);
