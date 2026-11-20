import { store } from "./storage";
import type { AnswerFeedback, PublicQuestion } from "@studysmart/shared";

export interface Mistake { id: string; stem: { en: string; ta?: string }; answer: { en: string; ta?: string }; why: { en: string; ta?: string }; at: number; removedAt?: number }
const KEY = "ss_mistakes_v1";
const raw = (): Mistake[] => store.getJson<Mistake[]>(KEY) ?? [];
const read = (): Mistake[] => raw().filter((m) => !m.removedAt);
const listeners = new Set<() => void>();
/** Keeps "learned it" marks (so other devices learn about them), newest 200 of those. */
const write = (live: Mistake[], gone: Mistake[] = raw().filter((m) => m.removedAt)) => { store.setJson(KEY, [...live, ...gone.filter((g) => !live.some((m) => m.id === g.id)).sort((a, b) => (b.removedAt ?? 0) - (a.removedAt ?? 0)).slice(0, 200)]); listeners.forEach((l) => l()); };
const tomb = (m: Mistake): Mistake => ({ ...m, removedAt: Date.now() });

/** Saves a wrongly answered question (newest first); the same question is kept once. */
export function recordMistake(q: PublicQuestion, fb: AnswerFeedback, max: number): void {
  const rest = read().filter((m) => m.id !== q.id);
  const was = read().find((m) => m.id === q.id);
  if (fb.correct) { if (was) write(rest, [tomb(was), ...raw().filter((m) => m.removedAt && m.id !== q.id)]); return; }
  write([{ id: q.id, stem: q.stem, answer: fb.correctAnswer, why: fb.explanation, at: Date.now() }, ...rest].slice(0, max));
}
export const readMistakes = read;
export function removeMistake(id: string): void { const was = read().find((m) => m.id === id); if (was) write(read().filter((m) => m.id !== id), [tomb(was), ...raw().filter((m) => m.removedAt && m.id !== id)]); }
/** For account sync: everything including "learned it" marks, keyed by question id. */
export const readAllMistakes = (): Record<string, Mistake> => Object.fromEntries(raw().map((m) => [m.id, m]));
export function replaceAllMistakes(all: Record<string, Mistake>): void { store.setJson(KEY, Object.values(all).sort((a, b) => Math.max(b.at, b.removedAt ?? 0) - Math.max(a.at, a.removedAt ?? 0))); listeners.forEach((l) => l()); }
export function onMistakesChange(l: () => void): () => void { listeners.add(l); return () => { listeners.delete(l); }; }
