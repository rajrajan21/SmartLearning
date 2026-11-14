import { useCallback, useEffect, useState } from "react";
import { store } from "./storage";

export interface Progress { step: number; total: number; done: boolean; updatedAt: number }
const KEY = "ss_progress_v1";
type All = Record<string, Progress>;
const listeners = new Set<() => void>();

const readAll = (): All => store.getJson<All>(KEY) ?? {};
export const getProgress = (topicId: string): Progress | null => readAll()[topicId] ?? null;
export function saveProgress(topicId: string, p: Omit<Progress, "updatedAt">): void {
  const all = readAll();
  all[topicId] = { ...p, updatedAt: Date.now() };
  store.setJson(KEY, all);
  listeners.forEach((l) => l());
}
export function clearProgress(topicId: string): void {
  const all = readAll(); delete all[topicId]; store.setJson(KEY, all); listeners.forEach((l) => l());
}

/** All saved progress, refreshing when any lesson saves. */
export function useAllProgress(): All {
  const [all, setAll] = useState<All>(readAll);
  useEffect(() => { const l = () => setAll(readAll()); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return all;
}
export function useTopicProgress(topicId: string | undefined): [Progress | null, () => void] {
  const all = useAllProgress();
  const clear = useCallback(() => { if (topicId) clearProgress(topicId); }, [topicId]);
  return [topicId ? (all[topicId] ?? null) : null, clear];
}

/** Used by account sync: read everything, or replace everything (then tell the screens). */
export const readAllProgress = (): All => readAll();
export function replaceAllProgress(all: All): void { store.setJson(KEY, all); listeners.forEach((l) => l()); }
export function onProgressChange(l: () => void): () => void { listeners.add(l); return () => { listeners.delete(l); }; }
