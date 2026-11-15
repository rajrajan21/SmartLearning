import type { UiKey } from "./i18n";
import { flatTopics } from "./round2";
import type { TreeLike } from "./browseStats";
import { store } from "./storage";
import { useEffect, useState } from "react";

type Name = { en: string; ta?: string };

// ---- themes (colour galleries). Matching is by English words in the topic or chapter name. ----
export interface ThemeDef { id: string; icon: string; colour: string; label: UiKey; words: string[] }
export const THEMES: ThemeDef[] = [
  { id: "animals", icon: "🐘", colour: "#B45309", label: "themeAnimals", words: ["animal", "bird", "insect", "pet", "fish", "zoo"] },
  { id: "plants", icon: "🌱", colour: "#15803D", label: "themePlants", words: ["plant", "tree", "seed", "leaf", "leaves", "flower", "garden", "fruit"] },
  { id: "water", icon: "💧", colour: "#0E7490", label: "themeWater", words: ["water", "rain", "river", "sea", "pond"] },
  { id: "food", icon: "🍎", colour: "#BE123C", label: "themeFood", words: ["food", "health", "healthy", "clean", "eat", "hygiene", "happy"] },
  { id: "numbers", icon: "🔢", colour: "#1D4ED8", label: "themeNumbers", words: ["number", "hundred", "add", "adding", "subtract", "multipl", "divid", "count", "rupee", "money", "half", "quarter", "share", "give", "time", "clock", "litre", "kilogram", "measure", "name", "double", "century"] },
  { id: "shapes", icon: "🔷", colour: "#7E22CE", label: "themeShapes", words: ["shape", "corner", "side", "pattern", "symmetry", "solid", "toy"] },
  { id: "earth", icon: "🌍", colour: "#4D7C0F", label: "themeEarth", words: ["waste", "recycle", "reuse", "reduce", "environment", "earth", "soil", "air"] },
  { id: "people", icon: "🧑‍🤝‍🧑", colour: "#C2410C", label: "themePeople", words: ["family", "friend", "festival", "mela", "community", "village", "helper"] },
];
export const THEME_MORE: ThemeDef = { id: "more", icon: "✨", colour: "#475569", label: "themeMore", words: [] };
export function themeOf(...names: string[]): ThemeDef {
  const text = names.join(" ").toLowerCase();
  return THEMES.find((t) => t.words.some((w) => text.includes(w))) ?? THEME_MORE;
}

export interface ExploreItem { id: string; href: string; topic: Name; subject: Name; subjectSlug: string; classLevel: number; theme: ThemeDef }
export function exploreItems(tree: TreeLike, board: string, open: number[] | undefined, f: { cls?: number; subject?: string; theme?: string; tamil?: boolean } = {}): ExploreItem[] {
  return flatTopics(tree, board, open)
    .map((x) => ({ id: x.id, href: x.href.replace(/\/learn$/, ""), topic: x.topic, subject: x.subject, subjectSlug: x.subjectSlug, classLevel: x.classLevel, theme: themeOf(x.topic.en, x.chapter.en) }))
    .filter((x) => (!f.cls || x.classLevel === f.cls) && (!f.subject || x.subjectSlug === f.subject) && (!f.theme || x.theme.id === f.theme) && (!f.tamil || !!x.topic.ta));
}

// ---- syllabus ----
/** A friendly rough guess, shown as "about N minutes". */
export const MINUTES_PER_TOPIC = 6;
export const roughMinutes = (topics: number): number => Math.max(0, topics) * MINUTES_PER_TOPIC;

// ---- level (grows with finished lessons and stars) ----
export function levelOf(lessonsDone: number, stars: number): { level: number; toNext: number; pct: number } {
  const xp = lessonsDone * 10 + stars * 5, step = 50;
  return { level: 1 + Math.floor(xp / step), toNext: step - (xp % step), pct: Math.round(((xp % step) / step) * 100) };
}

// ---- my notebook: favourite lessons, saved on this device only ----
export interface NoteEntry { id: string; href: string; title: Name; subject: Name; savedAt: number }
const KEY = "ss_notebook_v1";
const listeners = new Set<() => void>();
export const readNotebook = (): Record<string, NoteEntry> => store.getJson<Record<string, NoteEntry>>(KEY) ?? {};
export function toggleNote(e: Omit<NoteEntry, "savedAt">): boolean {
  const all = readNotebook();
  const saved = !all[e.id];
  if (saved) all[e.id] = { ...e, savedAt: Date.now() }; else delete all[e.id];
  store.setJson(KEY, all);
  listeners.forEach((l) => l());
  return saved;
}
export function useNotebook(): Record<string, NoteEntry> {
  const [all, setAll] = useState(readNotebook);
  useEffect(() => { const l = () => setAll(readNotebook()); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return all;
}
