import { useEffect, useState } from "react";
import { PublicQuestion } from "@studysmart/shared";
import type { Load } from "./curriculum";
import { store } from "./storage";

const pendingPools = new Map<string, Promise<PublicQuestion[]>>();
function chapterQuestions(url: string): Promise<PublicQuestion[]> {
  const pending = pendingPools.get(url);
  if (pending) return pending;
  const request = fetch(url)
    .then(r => r.status === 404 ? { questions: [] } : r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
    .then(raw => PublicQuestion.array().parse(raw.questions))
    .finally(() => pendingPools.delete(url));
  pendingPools.set(url, request);
  return request;
}

/** Every published practice question in a chapter (all its topics together). */
export function useChapterPool(board: string, cls: string, subject: string, chapter: string, enabled: boolean): Load<PublicQuestion[]> {
  const [result, setResult] = useState<{ url: string; state: Load<PublicQuestion[]> }>();
  const url = `/api/v1/practice/boards/${board}/${cls}/${subject}/${chapter}`;
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setResult(undefined);
    chapterQuestions(url)
      .then((questions) => { if (alive) setResult({ url, state: { status: "ready", data: questions } }); })
      .catch(() => { if (alive) setResult({ url, state: { status: "error" } }); });
    return () => { alive = false; };
  }, [url, enabled]);
  if (!enabled) return { status: "ready", data: [] };
  return result?.url === url ? result.state : { status: "loading" };
}

export interface BestScore { best: number; last: number; tries: number }
const KEY = "ss_tests_v1";
const read = (): Record<string, BestScore> => store.getJson<Record<string, BestScore>>(KEY) ?? {};
export const scopeKey = (kind: string, board: string, cls: string, subject: string, chapter: string) => `${kind}:${board}/${cls}/${subject}/${chapter}`;
export function saveScore(scope: string, value: number): { best: number; isNewBest: boolean } {
  const all = read(), old = all[scope];
  const best = Math.max(old?.best ?? 0, value);
  all[scope] = { best, last: value, tries: (old?.tries ?? 0) + 1 };
  store.setJson(KEY, all);
  return { best, isNewBest: value > (old?.best ?? -1) && value > 0 };
}
export const getScore = (scope: string): BestScore | undefined => read()[scope];
