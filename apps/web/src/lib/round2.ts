import type { Mastery } from "@studysmart/shared";
import type { UiKey } from "./i18n";
import type { Progress } from "./progress";
import { dayNumber } from "./streak";
import { findContinue, type TreeLike } from "./browseStats";

type Name = { en: string; ta?: string };

// ---- five-step mastery bar (Not started, Attempted, Familiar, Proficient, Mastered) ----
export const BAR_LEVELS = ["new", "learning", "practising", "strong", "mastered"] as const;
export const BAR_LABEL: Record<(typeof BAR_LEVELS)[number], UiKey> = { new: "mbNot", learning: "mbTry", practising: "mbFam", strong: "mbPro", mastered: "mbMas" };
/** How many topics sit at each step. Topics with no content yet are left out by the caller. */
export function levelCounts(list: Mastery[]): Record<(typeof BAR_LEVELS)[number], number> {
  const c = { new: 0, learning: 0, practising: 0, strong: 0, mastered: 0 };
  for (const m of list) c[m.level]++;
  return c;
}

// ---- finding lessons ----
interface Flat { id: string; href: string; topic: Name; subject: Name; chapter: Name; classLevel: number; subjectSlug: string; chapterSlug: string }
export function flatTopics(tree: TreeLike, board: string, openClasses?: number[]): Flat[] {
  const out: Flat[] = [];
  for (const c of tree.classes) {
    if (openClasses && !openClasses.includes(c.classLevel)) continue;
    for (const s of c.subjects) for (const ch of s.chapters) for (const t of ch.topics)
      out.push({ id: t.id, topic: t.name, subject: s.name, chapter: ch.name, classLevel: c.classLevel, subjectSlug: s.slug, chapterSlug: ch.slug, href: `/${board.toLowerCase()}/${c.classLevel}/${s.slug}/${ch.slug}/${t.slug}/learn` });
  }
  return out;
}

/** The first topic that has a lesson, for the sign-in-free 'Try a free lesson' button. */
export function firstLessonHref(tree: TreeLike, board: string, lessonIds: Set<string>, openClasses?: number[]): string | null {
  return flatTopics(tree, board, openClasses).find((f) => lessonIds.has(f.id))?.href ?? null;
}

/** Most recently touched lessons (finished or not), newest first. */
export function recentLessons(tree: TreeLike, progress: Record<string, Progress>, board: string, n: number, skipId?: string) {
  const byId = new Map(flatTopics(tree, board).map((f) => [f.id, f]));
  return Object.entries(progress).filter(([id, p]) => p.updatedAt > 0 && byId.has(id) && id !== skipId && (p.step > 0 || p.done)).sort((a, b) => b[1].updatedAt - a[1].updatedAt).slice(0, n)
    .map(([id, p]) => ({ ...byId.get(id)!, step: p.step, total: p.total, done: p.done }));
}
export const continueId = (tree: TreeLike, progress: Record<string, Progress>, board: string): string | undefined => {
  const c = findContinue(tree, progress, board);
  return c ? flatTopics(tree, board).find((f) => f.href === c.href)?.id : undefined;
};

// ---- game-board path ----
export interface PathNode { id: string; href: string; name: Name; subject: Name; state: "done" | "now" | "todo" }
/** A window of topics in curriculum order: the last couple finished, the current one, and what comes next. */
export function pathNodes(tree: TreeLike, progress: Record<string, Progress>, board: string, openClasses: number[] | undefined, length: number): PathNode[] {
  const flat = flatTopics(tree, board, openClasses);
  if (flat.length === 0) return [];
  const firstOpen = flat.findIndex((f) => !progress[f.id]?.done);
  const now = firstOpen < 0 ? flat.length : firstOpen;
  const start = Math.max(0, Math.min(now - 2, flat.length - length));
  return flat.slice(start, start + length).map((f, k) => ({ id: f.id, href: f.href, name: f.topic, subject: f.subject, state: start + k < now ? "done" : start + k === now ? "now" : "todo" }));
}

// ---- daily goal ----
/** Lessons finished today (the student's own calendar day). */
export function lessonsToday(progress: Record<string, Progress>, now = Date.now()): number {
  const today = dayNumber(now);
  return Object.values(progress).filter((p) => p.done && dayNumber(p.updatedAt) === today).length;
}
