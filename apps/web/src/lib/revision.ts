import { useEffect, useState } from "react";
import { dayNumber, nextReview, type ReviewItem } from "@studysmart/shared";
import { store } from "./storage";

const KEY = "ss_revision_v1";
type All = Record<string, ReviewItem>;
const listeners = new Set<() => void>();
const readAll = (): All => store.getJson<All>(KEY) ?? {};
export const readAllRevision = readAll;
export function replaceAllRevision(all: All): void { store.setJson(KEY, all); listeners.forEach((l) => l()); }
export function onRevisionChange(l: () => void): () => void { listeners.add(l); return () => { listeners.delete(l); }; }

/** Called after every graded answer: schedules when the question should come back. */
export function recordReview(questionId: string, correct: boolean, intervals: number[]): void {
  const all = readAll(), today = dayNumber();
  const n = nextReview(all[questionId], correct, today, intervals.length ? intervals : undefined);
  all[questionId] = { ...n, updatedAt: Date.now() };
  replaceAllRevision(all);
}

/** Ids due today or earlier, oldest first. */
export function dueIds(all: All, limit: number, today = dayNumber()): string[] {
  return Object.entries(all).filter(([, v]) => v.due <= today).sort((a, b) => a[1].due - b[1].due).slice(0, limit).map(([id]) => id);
}
export function useRevision(): All {
  const [all, setAll] = useState<All>(readAll);
  useEffect(() => { const l = () => setAll(readAll()); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return all;
}
export function useDueCount(limit = 99): number { return dueIds(useRevision(), limit).length; }
