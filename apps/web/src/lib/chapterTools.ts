import { useEffect, useState } from "react";
import { PracticeSet, type PublicQuestion } from "@studysmart/shared";
import type { Load } from "./curriculum";
import { store } from "./storage";

/** Every published practice question in a chapter (all its topics together). */
export function useChapterPool(board: string, cls: string, subject: string, chapter: string, topicSlugs: string[], enabled: boolean): Load<PublicQuestion[]> {
  const [state, setState] = useState<Load<PublicQuestion[]>>({ status: "loading" });
  const key = topicSlugs.join("|");
  useEffect(() => {
    if (!enabled) { setState({ status: "ready", data: [] }); return; }
    let alive = true;
    setState({ status: "loading" });
    Promise.all(topicSlugs.map((t) =>
      fetch(`/api/v1/practice/boards/${board}/${cls}/${subject}/${chapter}/${t}`)
        .then((r) => (r.status === 404 ? null : r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((raw) => (raw ? PracticeSet.parse(raw).questions : []))))
      .then((lists) => { if (alive) setState({ status: "ready", data: lists.flat() }); })
      .catch(() => { if (alive) setState({ status: "error" }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, cls, subject, chapter, key, enabled]);
  return state;
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
