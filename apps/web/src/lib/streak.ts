import { useMemo } from "react";
import { useAllProgress } from "./progress";
import { useAllResults } from "./practice";

const DAY = 86_400_000;
/** Local calendar day number (so midnight is the student's midnight, not UTC). */
export const dayNumber = (ts: number): number => { const d = new Date(ts); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / DAY); };

/**
 * Consecutive learning days ending today (or yesterday: today is not over yet).
 * `grace` missed days in a row are forgiven, so one bad day does not erase a streak.
 * Forgiven days do not add to the count.
 */
export function computeStreak(days: Iterable<number>, today: number, grace: number): number {
  const set = new Set(days);
  let cursor = set.has(today) ? today : today - 1;
  let count = 0, misses = 0;
  // start from the most recent active day within reach
  while (!set.has(cursor)) { misses++; if (misses > grace) return 0; cursor--; }
  misses = 0;
  while (true) {
    if (set.has(cursor)) { count++; misses = 0; }
    else { misses++; if (misses > grace) break; }
    cursor--;
    if (count > 3650 || cursor < today - 4000) break;
  }
  return count;
}

export function totalStars(results: Record<string, Record<string, { stars?: number }>>): number {
  let n = 0;
  for (const rounds of Object.values(results)) for (const r of Object.values(rounds ?? {})) n += r?.stars ?? 0;
  return n;
}

export function useRewards(grace: number, now = Date.now()): { streak: number; stars: number; activeToday: boolean; week: boolean[]; activeDays: number[] } {
  const progress = useAllProgress();
  const results = useAllResults();
  return useMemo(() => {
    const days = new Set<number>();
    for (const p of Object.values(progress)) if (p?.updatedAt) days.add(dayNumber(p.updatedAt));
    const today = dayNumber(now);
    const week = Array.from({ length: 7 }, (_, i) => days.has(today - 6 + i));
    return { streak: computeStreak(days, today, grace), stars: totalStars(results as never), activeToday: days.has(today), week, activeDays: [...days] };
  }, [progress, results, grace, now]);
}

export interface CalDay { day: number; on: boolean; isToday: boolean; weekday: number }
/** The last `count` days, oldest first, each marked as learned or not. weekday: 0 = Sunday. */
export function weekCalendar(activeDays: Iterable<number>, today: number, count = 7): CalDay[] {
  const set = new Set(activeDays);
  return Array.from({ length: count }, (_, i) => { const day = today - (count - 1 - i); return { day, on: set.has(day), isToday: day === today, weekday: new Date(day * 86_400_000).getUTCDay() }; });
}
