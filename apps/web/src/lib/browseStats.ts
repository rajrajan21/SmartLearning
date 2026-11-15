import type { Progress } from "./progress";

type TopicRef = { id: string };
export interface Frac { done: number; total: number; pct: number }
export const frac = (done: number, total: number): Frac => ({ done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) });

export function chapterFrac(topics: TopicRef[], progress: Record<string, Progress>): Frac {
  return frac(topics.filter((t) => progress[t.id]?.done).length, topics.length);
}
export function subjectFrac(chapters: { topics: TopicRef[] }[], progress: Record<string, Progress>): Frac {
  const all = chapters.flatMap((c) => c.topics);
  return chapterFrac(all, progress);
}

/** Picture for a subject notebook; a neutral book for anything unknown. */
const ICONS: Record<string, string> = { maths: "🔢", evs: "🌿", english: "📖", tamil: "அ", science: "🔬", social: "🌏", hindi: "ह" };
export const subjectIcon = (slug: string): string => ICONS[slug] ?? "📘";

/** The most recently touched lesson that is started but not finished, found in the curriculum tree. */
export interface TreeLike { classes: { classLevel: number; subjects: { slug: string; name: { en: string; ta?: string }; chapters: { slug: string; name: { en: string; ta?: string }; topics: { id: string; slug: string; name: { en: string; ta?: string } }[] }[] }[] }[] }
export function findContinue(tree: TreeLike, progress: Record<string, Progress>, board: string) {
  const open = Object.entries(progress).filter(([, p]) => !p.done && p.step > 0).sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  for (const [id, p] of open) {
    for (const c of tree.classes) for (const s of c.subjects) for (const ch of s.chapters) for (const t of ch.topics) {
      if (t.id === id) return { href: `/${board.toLowerCase()}/${c.classLevel}/${s.slug}/${ch.slug}/${t.slug}/learn`, topic: t.name, subject: s.name, step: p.step, total: p.total };
    }
  }
  return null;
}

/**
 * What to learn next: finish a lesson that was started; otherwise the next unfinished topic after the one
 * finished most recently (in curriculum order); otherwise the first unfinished topic. null when all are done.
 */
export function suggestNext(tree: TreeLike, progress: Record<string, Progress>, board: string, openClasses?: number[]) {
  const flat: { id: string; href: string; topic: { en: string; ta?: string }; subject: { en: string; ta?: string } }[] = [];
  for (const c of tree.classes) {
    if (openClasses && !openClasses.includes(c.classLevel)) continue;
    for (const s of c.subjects) for (const ch of s.chapters) for (const t of ch.topics) flat.push({ id: t.id, topic: t.name, subject: s.name, href: `/${board.toLowerCase()}/${c.classLevel}/${s.slug}/${ch.slug}/${t.slug}/learn` });
  }
  const cont = findContinue(tree, progress, board);
  if (cont) return { kind: "finish" as const, href: cont.href, topic: cont.topic, subject: cont.subject };
  const lastDone = flat.map((f, i) => ({ i, at: progress[f.id]?.done ? progress[f.id]!.updatedAt : -1 })).filter((x) => x.at >= 0).sort((a, b) => b.at - a.at)[0];
  const order = lastDone ? [...flat.slice(lastDone.i + 1), ...flat.slice(0, lastDone.i)] : flat;
  const next = order.find((f) => !progress[f.id]?.done);
  return next ? { kind: "new" as const, href: next.href, topic: next.topic, subject: next.subject } : null;
}
