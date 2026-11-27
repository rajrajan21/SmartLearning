import { useCallback, useEffect, useMemo, useState } from "react";
import { AnswerFeedback, PhraseSet, PracticeSet, type AnswerResponse, type LocalizedText, type PublicQuestion, type QuestionTier } from "@studysmart/shared";
import { store } from "./storage";
import { useSettings } from "./settings";
import type { Load } from "./curriculum";

export interface StudyKeyItem {
  id: string;
  answer: { en: string; ta?: string };
  explanation: LocalizedText;
  solutionSteps?: LocalizedText[];
  marks: number;
  tier?: QuestionTier;
}

export async function fetchStudyKey(ids: string[]): Promise<Record<string, StudyKeyItem>> {
  const r = await fetch("/api/v1/practice/study-key", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids }) });
  if (!r.ok) throw new Error(String(r.status));
  const d = (await r.json()) as { answers: StudyKeyItem[] };
  return Object.fromEntries(d.answers.map((a) => [a.id, a]));
}

export async function fetchSolution(questionId: string): Promise<StudyKeyItem> {
  const r = await fetch(`/api/v1/practice/solution/${questionId}`);
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as StudyKeyItem;
}

export function formatStudentAnswer(q: PublicQuestion, r: AnswerResponse | undefined, name: (t: LocalizedText) => string): string {
  if (!r) return "Not answered";
  switch (r.type) {
    case "mcq": {
      if (q.type !== "mcq") return r.optionId;
      const opt = q.options.find((o) => o.id === r.optionId);
      return opt ? name(opt.text) : r.optionId;
    }
    case "true_false": return r.value ? "True" : "False";
    case "number": return q.type === "number" && q.unit ? `${r.value} ${name(q.unit)}` : String(r.value);
    case "short":
    case "fill":
    case "long": return r.text;
    case "multi": {
      if (q.type !== "multi") return r.ids.join(", ");
      return r.ids.map((id) => { const o = q.options.find((x) => x.id === id); return o ? name(o.text) : id; }).join(", ");
    }
    case "order": {
      if (q.type !== "order") return r.ids.join(" → ");
      return r.ids.map((id) => { const it = q.items.find((x) => x.id === id); return it ? name(it.text) : id; }).join(" → ");
    }
    case "match": {
      if (q.type !== "match") return `${r.pairs.length} pairs`;
      return r.pairs.map((p) => {
        const l = q.lefts.find((x) => x.id === p.left);
        const rt = q.rights.find((x) => x.id === p.right);
        return `${l ? name(l.text) : p.left} = ${rt ? name(rt.text) : p.right}`;
      }).join("; ");
    }
  }
}

/** Random id kept on this device until accounts arrive (Module 6). Holds no personal data. */
export function anonId(): string {
  let id = store.get("ss_anon_v1");
  if (!id) { id = crypto.randomUUID(); store.set("ss_anon_v1", id); }
  return id;
}

/** The practice set for a topic: null when the topic has no questions yet. */
export function usePractice(board: string, cls: number, subject: string, chapter: string, topic: string, enabled = true): Load<PracticeSet | null> {
  const [raw0, setState] = useState<Load<PracticeSet | null>>({ status: "loading" });
  const st = useSettings();
  const state = useMemo<Load<PracticeSet | null>>(() => (raw0.status === "ready" && raw0.data ? { status: "ready", data: { ...raw0.data, questions: allowedTypes(raw0.data.questions, (k) => st.get(k)) } } : raw0), [raw0, st]);
  useEffect(() => {
    if (!enabled) { setState({ status: "ready", data: null }); return; }
    let alive = true;
    setState({ status: "loading" });
    fetch(`/api/v1/practice/boards/${board}/${cls}/${subject}/${chapter}/${topic}`)
      .then((r) => (r.status === 404 ? null : r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => { if (alive) setState({ status: "ready", data: raw ? PracticeSet.parse(raw) : null }); })
      .catch(() => { if (alive) setState({ status: "error" }); });
    return () => { alive = false; };
  }, [board, cls, subject, chapter, topic, enabled]);
  return state;
}

export function usePracticeTopicIds(enabled: boolean): Set<string> {
  const [ids, setIds] = useState<Set<string>>(() => new Set(store.getJson<string[]>("ss_practice_ids") ?? []));
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetch("/api/v1/practice/available").then((r) => (r.ok ? r.json() : Promise.reject(new Error("x"))))
      .then((d: { topicIds: string[] }) => { if (alive) { setIds(new Set(d.topicIds)); store.setJson("ss_practice_ids", d.topicIds); } })
      .catch(() => { /* keep saved list */ });
    return () => { alive = false; };
  }, [enabled]);
  return ids;
}

/** Stock praise / encouragement phrases (recorded in the teacher's voice when available). */
let phraseCache: PhraseSet | null = null;
export function usePhrases(enabled: boolean): PhraseSet {
  const [p, setP] = useState<PhraseSet>(phraseCache ?? {});
  useEffect(() => {
    if (!enabled || phraseCache) return;
    let alive = true;
    fetch("/api/v1/audio/phrases").then((r) => (r.ok ? r.json() : Promise.reject(new Error("x"))))
      .then((raw) => { const d = PhraseSet.parse(raw); phraseCache = d; if (alive) setP(d); })
      .catch(() => { /* feedback still works without stock phrases */ });
    return () => { alive = false; };
  }, [enabled]);
  return p;
}

export async function sendAnswer(questionId: string, attemptId: string, hintsUsed: number, response: AnswerResponse): Promise<AnswerFeedback> {
  const post = () => fetch("/api/v1/practice/answers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attemptId, anonId: anonId(), questionId, hintsUsed, response }) });
  let r = await post();
  if (!r.ok && r.status >= 500) r = await post(); // same attemptId: safe to resend, never double counted
  if (!r.ok) throw new Error(String(r.status));
  return AnswerFeedback.parse(await r.json());
}

// ---------- results kept on this device ----------
export interface RoundResult { best: number; stars: number; passed: boolean; tries: number }
type Results = Record<string, Record<number, RoundResult>>;
const KEY = "ss_practice_v1";
const listeners = new Set<() => void>();
const readAll = (): Results => store.getJson<Results>(KEY) ?? {};
export const starsFor = (pct: number, pass: number) => (pct >= 100 ? 3 : pct >= 90 && pct >= pass ? 2 : pct >= pass ? 1 : 0);
export function saveRound(topicId: string, round: number, pct: number, pass: number): RoundResult {
  const all = readAll(), prev = all[topicId]?.[round];
  const r: RoundResult = { best: Math.max(prev?.best ?? 0, pct), stars: Math.max(prev?.stars ?? 0, starsFor(pct, pass)), passed: (prev?.passed ?? false) || pct >= pass, tries: (prev?.tries ?? 0) + 1 };
  all[topicId] = { ...(all[topicId] ?? {}), [round]: r };
  store.setJson(KEY, all); listeners.forEach((l) => l());
  return r;
}
export function usePracticeResults(topicId: string | undefined): Record<number, RoundResult> {
  const [all, setAll] = useState<Results>(readAll);
  useEffect(() => { const l = () => setAll(readAll()); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return (topicId && all[topicId]) || {};
}

export const shuffled = <T,>(a: T[]): T[] => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };
/** Drops question types the admin has switched off. */
export const allowedTypes = (qs: PublicQuestion[], get: (k: string) => unknown): PublicQuestion[] =>
  qs.filter((q) => (q.type !== "multi" || get("practice.type.multi") !== false) && (q.type !== "match" || get("practice.type.match") !== false) && (q.type !== "long" || get("practice.type.long") !== false));
export const pickRound = (qs: PublicQuestion[], round: number, per: number, mix: boolean) => { const r = qs.filter((q) => q.round === round); return (mix ? shuffled(r) : r).slice(0, per); };
export const usePlay = () => useCallback((url: string | undefined) => { if (!url) return; try { void new Audio(url).play().catch(() => {}); } catch { /* no audio available */ } }, []);

export const readAllResults = (): Results => readAll();
export function replaceAllResults(all: Results): void { store.setJson(KEY, all); listeners.forEach((l) => l()); }
export function onResultsChange(l: () => void): () => void { listeners.add(l); return () => { listeners.delete(l); }; }
export function useAllResults(): Results {
  const [all, setAll] = useState<Results>(readAll);
  useEffect(() => { const l = () => setAll(readAll()); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return all;
}
