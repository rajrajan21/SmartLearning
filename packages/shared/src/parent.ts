import { z } from "zod";
import { PublicProfile, SyncData } from "./sync.js";

/** What a parent sees about one child. Activity is bucketed by the parent's own calendar days. */
export const ChildReport = z.object({
  profile: PublicProfile,
  progress: SyncData,
  /** local day numbers (days since 1970) with any practice or lesson activity, last 60 days */
  activeDays: z.array(z.number().int()),
  /** answers and right answers per local day, last 60 days */
  daily: z.record(z.string(), z.object({ n: z.number().int(), right: z.number().int() })),
  attempts: z.number().int(),
  correct: z.number().int(),
  /** questions this child often gets wrong (2+ tries, under 60% right), worst first */
  weak: z.array(z.object({ questionId: z.string(), wrong: z.number().int(), total: z.number().int() })),
});
export type ChildReport = z.infer<typeof ChildReport>;
export const ParentDashboard = z.object({ children: z.array(ChildReport) });
export type ParentDashboard = z.infer<typeof ParentDashboard>;

// ---- small helpers the dashboard uses (days are "days since 1970" in the parent's own time zone) ----
/** Days in a row with learning, counting back from today (or from yesterday if today has no learning yet). */
export function streakOf(activeDays: number[], today: number): number {
  const set = new Set(activeDays);
  let d = set.has(today) ? today : today - 1, n = 0;
  while (set.has(d)) { n++; d--; }
  return n;
}
/** Days of learning in the last 7 days, including today. */
export const daysInLastWeek = (activeDays: number[], today: number): number => new Set(activeDays.filter((d) => d > today - 7 && d <= today)).size;
/** The last n days, oldest first, with answers and right answers for each. */
export function lastDays(daily: ChildReport["daily"], today: number, n: number): { day: number; n: number; right: number }[] {
  return Array.from({ length: n }, (_, i) => { const day = today - (n - 1 - i); return { day, n: daily[String(day)]?.n ?? 0, right: daily[String(day)]?.right ?? 0 }; });
}

// ---- weekly summary for parents (plain language, built only from data we already hold) ----
const DAY_MS = 86_400_000;
export interface WeeklySummary {
  daysLearned: number;
  answers: number;
  right: number;
  accuracyPct: number | null;
  /** rough guess: about half a minute per answer plus a few minutes for each lesson worked on this week */
  estMinutes: number;
  topicsDone: string[];
  weakTopics: { topicId: string; best: number }[];
}
/** `dayOf` turns a time stamp into the parent's local day number (defaults to UTC days). */
export function weeklySummary(child: ChildReport, today: number, dayOf: (ts: number) => number = (ts) => Math.floor(ts / DAY_MS)): WeeklySummary {
  const inWeek = (day: number) => day > today - 7 && day <= today;
  const days = lastDays(child.daily, today, 7);
  const answers = days.reduce((a, d) => a + d.n, 0), right = days.reduce((a, d) => a + d.right, 0);
  const touched = Object.entries(child.progress.lesson).filter(([, l]) => l.updatedAt > 0 && inWeek(dayOf(l.updatedAt)));
  const topicsDone = touched.filter(([, l]) => l.done).map(([id]) => id);
  const weakTopics: WeeklySummary["weakTopics"] = [];
  for (const [topicId, rounds] of Object.entries(child.progress.practice)) {
    const tried = Object.values(rounds).filter((r) => r.tries > 0);
    const stuck = tried.filter((r) => !r.passed && r.best < 60);
    if (stuck.length > 0) weakTopics.push({ topicId, best: Math.min(...stuck.map((r) => r.best)) });
  }
  weakTopics.sort((a, b) => a.best - b.best || a.topicId.localeCompare(b.topicId));
  return {
    daysLearned: daysInLastWeek(child.activeDays, today),
    answers, right,
    accuracyPct: answers > 0 ? Math.round((right / answers) * 100) : null,
    estMinutes: Math.round(answers * 0.5 + touched.length * 4),
    topicsDone, weakTopics,
  };
}
