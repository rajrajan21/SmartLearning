import type { PathNode } from "./round2";

export interface DailyStep { id: "revise" | "lesson" | "puzzle"; href: string; done: boolean; node?: PathNode; n?: number }
export interface DailyOpts { revise: boolean; lesson: boolean; puzzle: boolean }

/** The few things that make up today's short session. Revise only when something is due; lesson only when a next topic exists. */
export function dailySteps(o: DailyOpts, due: number, next: PathNode | undefined, lessonsToday: number, puzzleDone: boolean): DailyStep[] {
  const out: DailyStep[] = [];
  if (o.revise && due > 0) out.push({ id: "revise", href: "/revise", done: false, n: due });
  if (o.lesson && next) out.push({ id: "lesson", href: next.href, done: lessonsToday > 0, node: next });
  if (o.puzzle) out.push({ id: "puzzle", href: "#puzzle", done: puzzleDone });
  return out;
}
