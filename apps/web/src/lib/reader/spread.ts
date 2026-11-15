/**
 * Which pages are on screen. A book opens like a real one: the front cover (page 1) sits alone on the right,
 * then pages 2-3, 4-5 ... and, when the page count is even, the back cover sits alone on the left.
 * On phones (single = true) every page is shown alone.
 */
export const clampPage = (p: number, n: number) => Math.max(1, Math.min(Math.max(1, n), Math.round(p) || 1));
export const leftOf = (p: number) => { const s = Math.floor(p / 2); return 2 * s >= 1 ? 2 * s : 0; };
export const rightOf = (p: number, n: number) => { const s = Math.floor(p / 2); return 2 * s + 1 <= n ? 2 * s + 1 : 0; };
export const viewIndex = (p: number, single: boolean) => (single ? p : Math.floor(p / 2));

export function visiblePages(p: number, n: number, single: boolean): number[] {
  if (single) return [p];
  return [leftOf(p), rightOf(p, n)].filter((x) => x > 0);
}
/** the page to go to for one step forward (d = 1) or back (d = -1) */
export function stepTarget(p: number, d: 1 | -1, n: number, single: boolean): number {
  if (single) return clampPage(p + d, n);
  const s = Math.floor(p / 2);
  return d > 0 ? Math.min(n, (s + 1) * 2) : Math.max(1, (s - 1) * 2 + (p >= 4 ? 0 : 1));
}
export type Position = "front" | "inside" | "back";
export function positionOf(p: number, n: number, single: boolean): Position {
  const vis = visiblePages(p, n, single);
  if (p < 2) return "front";
  return vis[vis.length - 1] === n && (single || vis.length === 1) ? "back" : "inside";
}
