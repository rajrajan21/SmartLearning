import { useEffect, useMemo, useState } from "react";
import type { NarrationSentence } from "@studysmart/shared";
import { dailyIndex, type GkAge, type GkCategory, type GkIndex, type GkLesson, type GkListItem } from "@studysmart/shared";
import type { Lang } from "./i18n";
import { store } from "./storage";

export type GkStepOut = GkLesson["steps"][number] & { audio: ({ en: unknown } | null)[] };
export type GkLessonOut = Omit<GkLesson, "steps"> & { steps: GkStepOut[] };

type Load<T> = { state: "loading" | "off" | "error" | "ready"; data: T | null };

function useGet<T>(url: string | null): Load<T> & { retry: () => void } {
  const [r, setR] = useState<Load<T>>({ state: "loading", data: null });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!url) { setR({ state: "off", data: null }); return; }
    let alive = true;
    setR({ state: "loading", data: null });
    fetch(url).then(async (res) => {
      if (res.status === 404) return alive && setR({ state: "off", data: null });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as T;
      if (alive) setR({ state: "ready", data });
    }).catch(() => alive && setR({ state: "error", data: null }));
    return () => { alive = false; };
  }, [url, n]);
  return { ...r, retry: () => setN((x) => x + 1) };
}
export const useGkIndex = (on: boolean) => useGet<GkIndex>(on ? "/api/v1/gk/index" : null);
export const useGkLesson = (id: string, on: boolean) => useGet<GkLessonOut>(on ? `/api/v1/gk/lessons/${encodeURIComponent(id)}` : null);

export const csv = (v: unknown): string[] => String(v ?? "").split(",").map((x) => x.trim()).filter((x) => x && x !== "none");

/** Apply the admin's switches (hidden categories and lessons, age bands) to the list. */
export function visibleItems(ix: GkIndex, o: { hiddenCats: string[]; hiddenLessons: string[] }): GkListItem[] {
  return ix.items.filter((i) => !o.hiddenCats.includes(i.category) && !o.hiddenLessons.includes(i.id));
}
export function orderCategories(cats: GkCategory[], first: string[]): GkCategory[] {
  const rank = (id: string) => { const i = first.indexOf(id); return i < 0 ? 999 : i; };
  return [...cats].sort((a, b) => rank(a.id) - rank(b.id) || a.order - b.order);
}
export function sortItems(items: GkListItem[], how: string): GkListItem[] {
  if (how === "az") return [...items].sort((a, b) => a.title.localeCompare(b.title));
  if (how === "short") return [...items].sort((a, b) => a.minutes - b.minutes);
  if (how === "age") { const o = ["5-7", "8-10", "11-13", "14+"]; return [...items].sort((a, b) => o.indexOf(a.age) - o.indexOf(b.age)); }
  return items;
}

/** Daily GK / puzzle of the day: the same item for everyone on a date. */
export function pickDaily(items: GkListItem[], date: Date, salt: number, count = 1): GkListItem[] {
  if (!items.length) return [];
  const out: GkListItem[] = [];
  const start = dailyIndex(date, items.length, salt);
  for (let i = 0; i < Math.min(count, items.length); i++) out.push(items[(start + i) % items.length]!);
  return out;
}

const KEY = "ss_gk_done";
export const gkDone = (): string[] => store.getJson<string[]>(KEY) ?? [];
export function markGkDone(id: string): void { const d = gkDone(); if (!d.includes(id)) store.setJson(KEY, [...d, id]); }
const AGE_KEY = "ss_gk_age";
export const savedAge = (): GkAge | "" => (store.get(AGE_KEY) as GkAge | null) ?? "";
export const saveAge = (a: string): void => store.set(AGE_KEY, a);

/** Flatten a lesson's steps into the narrator's sentence list (ids stay stable). */
export function narrationOf(l: GkLessonOut): { all: NarrationSentence[]; stepStart: number[] } {
  const all: NarrationSentence[] = []; const stepStart: number[] = [];
  for (const st of l.steps) {
    stepStart.push(all.length);
    st.sentences.forEach((t, i) => {
      const a = st.audio?.[i];
      all.push({ id: `${l.id}:${st.id}:${i}`, text: { en: t, ta: t }, audioKey: null, audio: a ? { en: a.en } : {}, videoKey: null, board: [], checkpointQuestionId: null } as unknown as NarrationSentence);
    });
  }
  return { all, stepStart };
}

export function useNow(): Date { return useMemo(() => new Date(), []); }

const T = {
  title: { en: "GK", ta: "பொது அறிவு" },
  kindAll: { en: "All", ta: "அனைத்தும்" }, kindLesson: { en: "Lessons", ta: "பாடங்கள்" }, kindPuzzle: { en: "Puzzles", ta: "புதிர்கள்" },
  search: { en: "Search GK", ta: "தேடு" },
  age: { en: "Age", ta: "வயது" }, anyAge: { en: "Any age", ta: "எந்த வயதும்" },
  cat: { en: "Category", ta: "பிரிவு" },
  all: { en: "All", ta: "அனைத்தும்" },
  none: { en: "Nothing here yet.", ta: "இங்கே இன்னும் எதுவும் இல்லை." },
  noMatch: { en: "No match. Try another word or age.", ta: "பொருந்தவில்லை. வேறு சொல் அல்லது வயதை முயலுங்கள்." },
  seeAll: { en: "See all", ta: "அனைத்தும்" },
  featured: { en: "Featured", ta: "சிறப்பு" },
  daily: { en: "Daily GK", ta: "இன்றைய பொது அறிவு" },
  puzzleDay: { en: "Puzzle of the day", ta: "இன்றைய புதிர்" },
  plays: { en: "Plays", ta: "அசையும்" },
  min: { en: "min", ta: "நிமிடம்" },
  doneBadge: { en: "Done", ta: "முடிந்தது" },
  newBadge: { en: "New", ta: "புதியது" },
  open: { en: "Open", ta: "திற" },
  back: { en: "All GK", ta: "அனைத்து GK" },
  lessonView: { en: "Lesson", ta: "பாடம்" }, slidesView: { en: "Slides", ta: "ஸ்லைடுகள்" },
  listen: { en: "Listen", ta: "கேள்" }, pause: { en: "Pause", ta: "நிறுத்து" },
  prev: { en: "Back", ta: "பின்" }, next: { en: "Next", ta: "அடுத்து" },
  fullscreen: { en: "Full screen", ta: "முழுத்திரை" },
  facts: { en: "Did you know?", ta: "உங்களுக்குத் தெரியுமா?" },
  quiz: { en: "Quick quiz", ta: "சிறு வினாடி வினா" },
  check: { en: "Check", ta: "சரிபார்" },
  right: { en: "Right!", ta: "சரி!" }, wrong: { en: "Not quite.", ta: "இல்லை." },
  score: { en: "You got", ta: "நீங்கள் பெற்றது" }, outOf: { en: "out of", ta: "இல் " },
  again: { en: "Try again", ta: "மீண்டும்" },
  star: { en: "Star earned!", ta: "நட்சத்திரம் கிடைத்தது!" },
  notes: { en: "For parents and teachers", ta: "பெற்றோர் மற்றும் ஆசிரியர்களுக்கு" },
  asOf: { en: "Facts as of", ta: "தகவல் நிலை" },
  related: { en: "Keep exploring", ta: "மேலும் அறிய" },
  share: { en: "Copy link", ta: "இணைப்பை நகலெடு" }, copied: { en: "Link copied", ta: "நகலெடுக்கப்பட்டது" },
  print: { en: "Print", ta: "அச்சிடு" },
  method: { en: "Thinking method", ta: "சிந்தனை முறை" },
  think: { en: "Think first", ta: "முதலில் யோசி" },
  showAnswer: { en: "Show answer", ta: "விடை காட்டு" },
  hint: { en: "Hint", ta: "குறிப்பு" },
  play: { en: "Play", ta: "இயக்கு" }, stop: { en: "Pause", ta: "நிறுத்து" },
  speed: { en: "Speed", ta: "வேகம்" },
  finish: { en: "Finish", ta: "முடி" },
  ageLabel: { en: "Ages", ta: "வயது" },
  items: { en: "lessons and puzzles", ta: "பாடங்களும் புதிர்களும்" },
  more: { en: "Show more", ta: "மேலும் காட்டு" },
  openLesson: { en: "Open the lesson", ta: "பாடத்தைத் திற" },
  gotoGk: { en: "Open GK", ta: "GK திற" },
} as const;
export const gt = (k: keyof typeof T, lang: Lang): string => (T[k] as Record<string, string>)[lang] ?? T[k].en;
