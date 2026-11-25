import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { GkCategoryFile, GkLesson, GK_AGES, GK_ANIMATED_VISUALS, gkMinutes, type GkAge, type GkCategory, type GkIndex, type GkListItem } from "@studysmart/shared";
import type { AudioStore } from "../audio/manifest.js";

/** What the lesson page gets: the lesson plus, for every sentence, the teacher recording when one exists. */
export type GkLessonOut = Omit<GkLesson, "steps"> & { steps: (GkLesson["steps"][number] & { audio: ({ en?: { url: string; durationMs: number; words?: { w: string; t: number; d: number }[] } } | null)[] })[] };

export interface GkReport {
  generatedAt: string; lessons: number; puzzles: number; animations: number; sentences: number; recorded: number; invalid: string[];
  byCategory: { id: string; title: string; lessons: number; puzzles: number }[];
  byAge: { age: GkAge; lessons: number; puzzles: number }[];
  unknownCategories: string[]; ids: { id: string; category: string; kind: string; age: string; title: string }[];
}
export interface GkStore {
  index(): GkIndex;
  lesson(id: string, teacher?: string): GkLessonOut | null;
  report(): GkReport;
  reload(): void;
}

/** Reads content/gk once, re-reads when files change (so new lessons appear without a restart). */
export function createGkStore(dir: string, audio?: Pick<AudioStore, "refs" | "refsPreferred">): GkStore {
  let cats: GkCategory[] = [], lessons = new Map<string, GkLesson>(), invalid: string[] = [], stamp = "", checkedAt = 0;
  const lessonsDir = join(dir, "lessons");
  const signature = (): string => {
    const parts: string[] = [];
    for (const p of [join(dir, "categories.json"), lessonsDir]) if (existsSync(p)) parts.push(String(statSync(p).mtimeMs));
    if (existsSync(lessonsDir)) { const fs = readdirSync(lessonsDir); parts.push(String(fs.length)); let newest = 0; for (const f of fs) newest = Math.max(newest, statSync(join(lessonsDir, f)).mtimeMs); parts.push(String(newest)); }
    return parts.join("|");
  };
  const load = (): void => {
    invalid = []; lessons = new Map(); cats = [];
    const cf = join(dir, "categories.json");
    if (existsSync(cf)) {
      const r = GkCategoryFile.safeParse(JSON.parse(readFileSync(cf, "utf8")));
      if (r.success) cats = [...r.data.categories].sort((a, b) => a.order - b.order);
      else invalid.push("categories.json");
    }
    if (existsSync(lessonsDir)) {
      for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json")).sort()) {
        try {
          const r = GkLesson.safeParse(JSON.parse(readFileSync(join(lessonsDir, f), "utf8")));
          if (r.success) lessons.set(r.data.id, r.data); else invalid.push(`${f}: ${r.error.issues[0]?.message ?? "invalid"}`);
        } catch { invalid.push(`${f}: not valid JSON`); }
      }
    }
    stamp = signature();
  };
  const fresh = (): void => { const now = Date.now(); if (stamp && now - checkedAt < 5000) return; checkedAt = now; if (stamp !== signature()) load(); };
  load(); checkedAt = Date.now();

  const hasAnim = (l: GkLesson) => l.steps.some((s) => s.visual && GK_ANIMATED_VISUALS.has(s.visual));
  const item = (l: GkLesson): GkListItem => ({ id: l.id, kind: l.kind, category: l.category, age: l.age, title: l.title, summary: l.summary, emoji: l.emoji, tags: l.tags, ...(l.method ? { method: l.method } : {}), steps: l.steps.length, hasAnimation: hasAnim(l), questions: l.quiz.length, minutes: gkMinutes(l) });

  return {
    index() {
      fresh();
      const all = [...lessons.values()];
      const known = new Set(cats.map((c) => c.id));
      const items = all.filter((l) => known.has(l.category)).map(item);
      const anims = new Set<string>(); for (const l of all) for (const s of l.steps) if (s.visual && GK_ANIMATED_VISUALS.has(s.visual)) anims.add(s.visual);
      const used = new Set(items.map((i) => i.category));
      return { categories: cats.filter((c) => used.has(c.id)), items, ages: GK_AGES.filter((a) => items.some((i) => i.age === a)), counts: { lessons: items.filter((i) => i.kind === "lesson").length, puzzles: items.filter((i) => i.kind === "puzzle").length, animations: anims.size } };
    },
    lesson(id, teacher) {
      fresh();
      const l = lessons.get(id);
      if (!l) return null;
      const pick = (text: string) => (teacher ? audio?.refs(teacher, { en: text }) : (audio?.refsPreferred?.("malar", { en: text }) ?? audio?.refs("malar", { en: text })))?.en;
      return { ...l, steps: l.steps.map((s) => ({ ...s, audio: s.sentences.map((t) => { const a = pick(t); return a ? { en: a } : null; }) })) } as GkLessonOut;
    },
    report() {
      fresh();
      const all = [...lessons.values()];
      let sentences = 0, recorded = 0;
      const pick = (text: string) => (audio?.refsPreferred?.("malar", { en: text }) ?? audio?.refs("malar", { en: text }))?.en;
      for (const l of all) for (const s of l.steps) for (const t of s.sentences) { sentences++; if (pick(t)) recorded++; }
      const anims = new Set<string>(); for (const l of all) for (const s of l.steps) if (s.visual && GK_ANIMATED_VISUALS.has(s.visual)) anims.add(s.visual);
      const known = new Set(cats.map((c) => c.id));
      return {
        generatedAt: new Date().toISOString(), lessons: all.filter((l) => l.kind === "lesson").length, puzzles: all.filter((l) => l.kind === "puzzle").length, animations: anims.size, sentences, recorded, invalid,
        byCategory: cats.map((c) => ({ id: c.id, title: c.title, lessons: all.filter((l) => l.category === c.id && l.kind === "lesson").length, puzzles: all.filter((l) => l.category === c.id && l.kind === "puzzle").length })),
        byAge: GK_AGES.map((a) => ({ age: a, lessons: all.filter((l) => l.age === a && l.kind === "lesson").length, puzzles: all.filter((l) => l.age === a && l.kind === "puzzle").length })),
        unknownCategories: [...new Set(all.map((l) => l.category).filter((c) => !known.has(c)))],
        ids: all.map((l) => ({ id: l.id, category: l.category, kind: l.kind, age: l.age, title: l.title })),
      };
    },
    reload() { load(); checkedAt = Date.now(); },
  };
}
