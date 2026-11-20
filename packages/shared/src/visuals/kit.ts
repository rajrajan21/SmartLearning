import type { BoardObject, ClassAction } from "../classroom.js";

export type O = BoardObject;
export interface Frag { title: string; objects: O[]; steps: { narration: string; actions: ClassAction[] }[] }

export const T = (id: string, x: number, y: number, text: string, size = 30, color = "ink", anchor: "start" | "middle" | "end" = "middle"): O => ({ kind: "text", id, x, y, text, size, color, anchor });
export const C = (id: string, cx: number, cy: number, r: number, fill?: string, stroke = "ink", width = 4): O => ({ kind: "circle", id, cx, cy, r, ...(fill ? { fill } : {}), stroke, width });
export const R = (id: string, x: number, y: number, w: number, h: number, fill?: string, stroke = "ink", width = 4, rx = 0): O => ({ kind: "rect", id, x, y, w, h, rx, ...(fill ? { fill } : {}), stroke, width });
export const L = (id: string, x1: number, y1: number, x2: number, y2: number, stroke = "ink", width = 4): O => ({ kind: "line", id, x1, y1, x2, y2, stroke, width });
export const AR = (id: string, x1: number, y1: number, x2: number, y2: number, stroke = "accent", width = 5): O => ({ kind: "arrow", id, x1, y1, x2, y2, stroke, width });
export const PO = (id: string, points: [number, number][], fill?: string, stroke = "ink", width = 4): O => ({ kind: "poly", id, points, ...(fill ? { fill } : {}), stroke, width });
export const PA = (id: string, d: string, stroke = "ink", width = 4, fill?: string): O => ({ kind: "path", id, d, stroke, width, ...(fill ? { fill } : {}) });
export const SE = (id: string, cx: number, cy: number, r: number, from: number, to: number, fill?: string, stroke = "ink", width = 3): O => ({ kind: "sector", id, cx, cy, r, from, to, ...(fill ? { fill } : {}), stroke, width });

const cl01 = (v?: number) => Math.min(1, Math.max(0, v ?? 0));
export const show = (target: string, at?: number, on?: string): ClassAction => ({ do: "show", target, ...(on ? { on } : { at: cl01(at) }) });
export const draw = (target: string, at?: number, on?: string, ms?: number): ClassAction => ({ do: "draw", target, ...(on ? { on } : { at: cl01(at) }), ...(ms ? { ms } : {}) });
export const write = (target: string, at?: number, on?: string): ClassAction => ({ do: "write", target, ...(on ? { on } : { at: cl01(at) }) });
export const fill = (target: string, color: string, at?: number, on?: string): ClassAction => ({ do: "fill", target, color, ...(on ? { on } : { at: cl01(at) }) });
export const pulse = (target: string, at?: number, on?: string, color?: string): ClassAction => ({ do: "pulse", target, ...(on ? { on } : { at: cl01(at) }), ...(color ? { color } : {}) });
/** spread `n` things across the first part of a step */
export const spread = (n: number, i: number, from = 0.1, to = 0.8) => Math.min(1, from + ((to - from) * i) / Math.max(1, n));
export const step = (narration: string, actions: ClassAction[]) => ({ narration, actions });

/** shorten a phrase at a word boundary */
export const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n).replace(/\s+\S*$/, "")}…`);
/** split text into lines of at most `max` characters */
export const wrap = (s: string, max: number): string[] => {
  const out: string[] = []; let cur = "";
  for (const w of s.trim().split(/\s+/)) { if (!cur) cur = w; else if (cur.length + 1 + w.length <= max) cur += ` ${w}`; else { out.push(cur); cur = w; } }
  if (cur) out.push(cur);
  return out;
};
/** a block of text lines as separate text objects: ids `${id}0`, `${id}1` ... */
export const lines = (id: string, x: number, y: number, text: string, size = 22, max = 30, color = "ink", anchor: "start" | "middle" | "end" = "middle", maxLines = 3, lh = 1.25): O[] =>
  wrap(text, max).slice(0, maxLines).map((t, i) => T(`${id}${i}`, x, y + i * size * lh, t, size, color, anchor));
/** regular polygon with n corners around (cx, cy) */
export const regPoly = (cx: number, cy: number, r: number, n: number, rot = -90): [number, number][] => Array.from({ length: n }, (_, i) => { const a = ((rot + (360 * i) / n) * Math.PI) / 180; return [Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))] as [number, number]; });
