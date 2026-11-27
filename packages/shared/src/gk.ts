import { z } from "zod";

/**
 * GK (General Knowledge): lessons that are not tied to a school textbook chapter.
 * Files live in content/gk/lessons/<id>.json (made by tools/gk/build.py) and content/gk/categories.json.
 * Narration is a list of short sentences per step; the audio builder records exactly these sentences
 * (teacher "malar"), so the voice a student hears is the same text they read.
 */
export const GK_AGES = ["5-7", "8-10", "11-13", "14+"] as const;
export type GkAge = (typeof GK_AGES)[number];
export const GK_AGE_LABEL: Record<GkAge, string> = { "5-7": "Ages 5 to 7", "8-10": "Ages 8 to 10", "11-13": "Ages 11 to 13", "14+": "Ages 14 and up" };

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{1,60}$/);

export const GkStep = z.object({
  id: slug,
  title: z.string().min(2).max(80),
  /** what the teacher says, one short sentence each (the audio builder speaks these) */
  sentences: z.array(z.string().min(3).max(300)).min(1).max(10),
  /** the same idea as 2 to 4 short slide bullets */
  points: z.array(z.string().min(2).max(140)).max(4).default([]),
  /** id of a picture or animation drawn in the browser (apps/web/src/components/gk/visuals.tsx) */
  visual: z.string().regex(/^[a-z0-9-]{2,40}$/).optional(),
});
export type GkStep = z.infer<typeof GkStep>;

export const GkQuestion = z.object({
  q: z.string().min(5).max(300),
  options: z.array(z.string().min(1).max(120)).min(2).max(4),
  answer: z.number().int().min(0).max(3),
  why: z.string().min(5).max(400),
});
export type GkQuestion = z.infer<typeof GkQuestion>;

export const GkLesson = z
  .object({
    id: slug,
    kind: z.enum(["lesson", "puzzle"]),
    category: slug,
    age: z.enum(GK_AGES),
    title: z.string().min(3).max(90),
    summary: z.string().min(10).max(200),
    emoji: z.string().min(1).max(8),
    tags: z.array(z.string().min(2).max(30)).max(8).default([]),
    steps: z.array(GkStep).min(2).max(12),
    /** short surprising facts shown as "Did you know?" */
    facts: z.array(z.string().min(10).max(240)).max(6).default([]),
    quiz: z.array(GkQuestion).max(6).default([]),
    video: z.object({
      youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
      title: z.string().min(3).max(120),
      publisher: z.string().min(2).max(80),
      prompt: z.string().min(8).max(160),
    }).optional(),
    /** present for anything that can change with time, e.g. "as of November 2026" */
    asOf: z.string().max(40).optional(),
    /** where the facts come from / extra notes for parents and teachers */
    notes: z.string().max(400).optional(),
    /** puzzles: the thinking method this one teaches */
    method: z.string().max(80).optional(),
  })
  .superRefine((l, ctx) => {
    l.quiz.forEach((q, i) => {
      if (q.answer >= q.options.length) ctx.addIssue({ code: "custom", message: `quiz ${i + 1}: answer index outside the options`, path: ["quiz", i, "answer"] });
    });
    const ids = new Set<string>();
    l.steps.forEach((s, i) => { if (ids.has(s.id)) ctx.addIssue({ code: "custom", message: `duplicate step id ${s.id}`, path: ["steps", i, "id"] }); ids.add(s.id); });
  });
export type GkLesson = z.infer<typeof GkLesson>;

export const GkCategory = z.object({
  id: slug,
  title: z.string().min(2).max(40),
  emoji: z.string().min(1).max(8),
  blurb: z.string().min(5).max(140),
  /** "puzzles" categories are listed under Puzzles and brain training */
  group: z.enum(["knowledge", "thinking"]).default("knowledge"),
  order: z.number().int().min(0).max(99).default(50),
});
export type GkCategory = z.infer<typeof GkCategory>;
export const GkCategoryFile = z.object({ categories: z.array(GkCategory).min(1) });

/** What the list page needs (no step text, so the list stays small). */
export interface GkListItem {
  id: string; kind: "lesson" | "puzzle"; category: string; age: GkAge; title: string; summary: string; emoji: string;
  tags: string[]; method?: string; steps: number; hasAnimation: boolean; questions: number; minutes: number;
}
export interface GkIndex { categories: GkCategory[]; items: GkListItem[]; ages: GkAge[]; counts: { lessons: number; puzzles: number; animations: number } }

/** Which picture ids move (animations) and which are still drawings. Kept here so the list can show a "plays" badge. */
export const GK_ANIMATED_VISUALS = new Set<string>([
  "solar-system", "moon-phases", "day-night", "seasons", "water-cycle", "plane-lift", "heartbeat", "photosynthesis", "eclipses", "tides",
  "states-of-matter", "pendulum", "sound-waves", "rainbow-prism", "plate-tectonics", "fibonacci", "number-sieve", "binary-counter",
  "circuit", "food-chain", "volcano", "atom", "pi-unroll", "clock-time",
]);

/** Deterministic pick for "Daily GK" and "Puzzle of the day": the same for everyone on a given date (local date). */
export function dailyIndex(date: Date, size: number, salt = 0): number {
  if (size <= 0) return 0;
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return (((day * 7 + salt * 13) % size) + size) % size;
}

export const gkMinutes = (l: Pick<GkLesson, "steps" | "quiz">): number => {
  const words = l.steps.reduce((n, s) => n + s.sentences.join(" ").split(/\s+/).length, 0);
  return Math.max(2, Math.round(words / 130 + l.quiz.length * 0.4));
};
