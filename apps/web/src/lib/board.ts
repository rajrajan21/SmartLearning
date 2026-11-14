import type { NarrationSentence } from "@studysmart/shared";

export type Shape = "circle" | "rect" | "line" | "triangle" | "arrow";
export type BoardItem =
  | { kind: "text"; id: number; text: string }
  | { kind: "shape"; id: number; shape: Shape; label?: string };
export interface BoardState { items: BoardItem[]; pointed: number | null }

const MAX_TEXTS = 6, MAX_SHAPES = 6;

/** What the teacher's board shows after speaking sentences 0..upTo. Pure, so it is easy to test. */
export function boardAt(sentences: Pick<NarrationSentence, "board">[], upTo: number): BoardState {
  let items: BoardItem[] = [], pointed: number | null = null, next = 1;
  for (let i = 0; i <= upTo && i < sentences.length; i++) {
    pointed = null;
    for (const a of sentences[i]!.board) {
      if (a.op === "clear") { items = []; pointed = null; }
      else if (a.op === "write") items.push({ kind: "text", id: next++, text: a.text });
      else if (a.op === "draw") items.push({ kind: "shape", id: next++, shape: a.shape, ...(a.label ? { label: a.label } : {}) });
      else if (a.op === "point") {
        const t = a.target.trim().toLowerCase();
        const hit = [...items].reverse().find((it) => (it.kind === "shape" ? it.label : it.text)?.toLowerCase().includes(t));
        pointed = hit ? hit.id : null;
      }
    }
    // keep the board readable: drop the oldest when it fills up
    const texts = items.filter((x) => x.kind === "text"), shapes = items.filter((x) => x.kind === "shape");
    const drop = new Set([...texts.slice(0, Math.max(0, texts.length - MAX_TEXTS)), ...shapes.slice(0, Math.max(0, shapes.length - MAX_SHAPES))].map((x) => x.id));
    if (drop.size) { items = items.filter((x) => !drop.has(x.id)); if (pointed !== null && drop.has(pointed)) pointed = null; }
  }
  return { items, pointed };
}

export const hasBoard = (sentences: Pick<NarrationSentence, "board">[]) => sentences.some((s) => s.board.length > 0);
