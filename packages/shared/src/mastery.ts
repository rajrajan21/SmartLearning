import type { LessonProgress, RoundResult } from "./sync.js";

export type MasteryLevel = "new" | "learning" | "practising" | "strong" | "mastered";
export interface Mastery { level: MasteryLevel; pct: number }

/**
 * How well a child knows a topic, from what they did (never from a guess):
 *  - new: nothing yet           - learning: started or finished the lesson, no round passed
 *  - practising: some rounds passed - strong: every round passed - mastered: every round passed with 2+ stars (90%+)
 * pct blends the lesson (20%) with the best score of every available round (80%).
 */
export function topicMastery(o: { lesson?: LessonProgress | null; rounds?: Record<string, RoundResult> | null; available: number[]; hasLesson: boolean }): Mastery {
  const rounds = o.rounds ?? {};
  const avail = o.available.length ? o.available : [];
  const lessonDone = o.lesson?.done === true, lessonStarted = !!o.lesson && (o.lesson.step > 0 || lessonDone);
  const touched = Object.values(rounds).some((r) => r.tries > 0);
  if (!lessonStarted && !touched) return { level: "new", pct: 0 };
  const roundPct = avail.length ? avail.reduce((a, r) => a + (rounds[String(r)]?.best ?? 0), 0) / avail.length : 0;
  const lessonPct = lessonDone ? 100 : lessonStarted ? 40 : 0;
  const pct = avail.length ? Math.round(o.hasLesson ? lessonPct * 0.2 + roundPct * 0.8 : roundPct) : Math.round(lessonPct);
  const passed = avail.filter((r) => rounds[String(r)]?.passed).length;
  if (avail.length && passed === avail.length) return { level: avail.every((r) => (rounds[String(r)]?.stars ?? 0) >= 2) ? "mastered" : "strong", pct };
  if (passed > 0 || touched) return { level: "practising", pct };
  return { level: "learning", pct };
}

/** Average of the topics that have something to learn (topics without content yet are left out). */
export const chapterPct = (list: Mastery[]): number => (list.length ? Math.round(list.reduce((a, m) => a + m.pct, 0) / list.length) : 0);

// ---- spaced revision (Leitner boxes): right answers come back later and later, wrong ones come back tomorrow ----
export const DEFAULT_INTERVALS = [1, 3, 7, 14, 30];
/** Days since 1970, in the child's own day (so "due today" matches their calendar). */
export const dayNumber = (d = new Date()): number => Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / 86_400_000);
export function nextReview(prev: { box: number; due: number } | undefined, correct: boolean, today: number, intervals: number[] = DEFAULT_INTERVALS): { box: number; due: number } {
  const iv = (b: number) => intervals[Math.min(b, intervals.length) - 1] ?? 1;
  if (!correct) return { box: 1, due: today + iv(1) };
  if (!prev) return { box: 2, due: today + iv(2) }; // first time seen and right: already a step up
  if (prev.due > today) return prev; // already reviewed ahead of schedule today: a repeat does not inflate the box
  const box = Math.min(5, prev.box + 1);
  return { box, due: today + iv(box) };
}
