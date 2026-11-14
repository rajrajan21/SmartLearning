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
