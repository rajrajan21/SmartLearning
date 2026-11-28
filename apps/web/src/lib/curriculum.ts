import { useCallback, useEffect, useState } from "react";
import { BoardCurriculum, TopicDetail, SearchHit, TopicLesson } from "@studysmart/shared";
import { store } from "./storage";

import { publicResource } from "./publicResource";

const boards = publicResource<BoardCurriculum>();
const lessonIds = publicResource<string[]>();

export type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error" };

/** Curriculum tree: memory, then network (refreshing the saved copy), then the saved copy when offline. */
export function useBoard(board: string, attempt = 0): Load<BoardCurriculum> {
  const key = board.toUpperCase();
  const [response, setResponse] = useState<{ key: string; state: Load<BoardCurriculum> }>();
  useEffect(() => {
    let alive = true;
    boards.read(key, () => fetch(`/api/v1/curriculum/boards/${encodeURIComponent(board)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => {
        const tree = BoardCurriculum.parse(raw);
        store.setJson(`ss_tree_${key}`, tree);
        return tree;
      }), attempt > 0)
      .then((data) => { if (alive) setResponse({ key, state: { status: "ready", data } }); })
      .catch(() => {
        if (!alive) return;
        const recent = boards.peek(key);
        const saved = recent ?? store.getJson<unknown>(`ss_tree_${key}`);
        const parsed = BoardCurriculum.safeParse(saved);
        setResponse({ key, state: parsed.success ? { status: "ready", data: parsed.data } : { status: "error" } });
      });
    return () => { alive = false; };
  }, [board, key, attempt]);
  if (response?.key === key) return response.state;
  const cached = boards.peek(key);
  return cached ? { status: "ready", data: cached } : { status: "loading" };
}

export function useRetry(): [number, () => void] {
  const [n, setN] = useState(0);
  return [n, useCallback(() => setN((x) => x + 1), [])];
}

export function useTopic(board: string, cls: number, subject: string, chapter: string, topic: string): Load<TopicDetail> {
  const [state, setState] = useState<Load<TopicDetail>>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    fetch(`/api/v1/curriculum/boards/${board}/topics/${cls}/${subject}/${chapter}/${topic}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => { if (alive) setState({ status: "ready", data: TopicDetail.parse(raw) }); })
      .catch(() => { if (alive) setState({ status: "error" }); });
    return () => { alive = false; };
  }, [board, cls, subject, chapter, topic]);
  return state;
}

export function useSearch(board: string, query: string, limit: number, minChars: number) {
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const q = query.trim();
    if (q.length < minChars) { setHits([]); setBusy(false); return; }
    setBusy(true);
    const id = setTimeout(() => {
      fetch(`/api/v1/curriculum/boards/${board}/search?q=${encodeURIComponent(q)}&limit=${limit}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("x"))))
        .then((d: { hits: unknown[] }) => setHits(d.hits.map((h) => SearchHit.parse(h))))
        .catch(() => setHits([]))
        .finally(() => setBusy(false));
    }, 200);
    return () => clearTimeout(id);
  }, [board, query, limit, minChars]);
  return { hits, busy };
}

/** Keep a response tied to its request, including route changes and retries. */
export function useLessonRequest<T>(url: string, parse: (raw: unknown) => T, enabled: boolean, attempt = 0): Load<T | null> {
  const [response, setResponse] = useState<{ url: string; attempt: number; state: Load<T | null> } | null>(null);
  useEffect(() => {
    if (!enabled) { setResponse(null); return; }
    let alive = true;
    fetch(url)
      .then((r) => r.status === 404 ? null : r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
      .then((raw) => { if (alive) setResponse({ url, attempt, state: { status: "ready", data: raw === null ? null : parse(raw) } }); })
      .catch(() => { if (alive) setResponse({ url, attempt, state: { status: "error" } }); });
    return () => { alive = false; };
  }, [url, parse, enabled, attempt]);
  if (!enabled) return { status: "ready", data: null };
  return response?.url === url && response.attempt === attempt ? response.state : { status: "loading" };
}

/** Published lesson for a topic: null when the topic has none yet. */
export function useLesson(board: string, cls: number, subject: string, chapter: string, topic: string, enabled = true): Load<TopicLesson | null> {
  return useLessonRequest(`/api/v1/lessons/boards/${board}/${cls}/${subject}/${chapter}/${topic}`, TopicLesson.parse, enabled);
}

/** Ids of topics that have a published lesson (cached for offline). */
export function useLessonTopicIds(enabled: boolean): Set<string> {
  const [ids, setIds] = useState<Set<string>>(() => new Set(store.getJson<string[]>("ss_lesson_ids") ?? []));
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    lessonIds.read("all", () => fetch("/api/v1/lessons/available").then((r) => (r.ok ? r.json() : Promise.reject(new Error("x"))))
      .then((d: { topicIds: string[] }) => { store.setJson("ss_lesson_ids", d.topicIds); return d.topicIds; }))
      .then(ids => { if (alive) setIds(new Set(ids)); })
      .catch(() => { /* keep saved list */ });
    return () => { alive = false; };
  }, [enabled]);
  return ids;
}
