import { useEffect, useRef, useState, type RefObject } from "react";

export const PULL_MAX = 72;
export const PULL_TRIGGER = 56;
/** Rubber-band: the finger moves further than the indicator. Never negative, never beyond max. */
export const pullDistance = (dy: number, max = PULL_MAX): number => Math.max(0, Math.min(max, dy * 0.5));

export type PullState = "idle" | "pulling" | "ready" | "done";

/** Pull-to-refresh for a scroll box. Touch events only; starts only when the box is at the very top. */
export function usePullRefresh(box: RefObject<HTMLElement | null>, onRefresh: () => void, enabled: boolean): { pull: number; state: PullState } {
  const [pull, setPull] = useState(0);
  const [state, setState] = useState<PullState>("idle");
  const cb = useRef(onRefresh); cb.current = onRefresh;
  useEffect(() => {
    const el = box.current;
    if (!enabled || !el || typeof window === "undefined" || !("ontouchstart" in window)) return;
    let y0: number | null = null, x0 = 0, cur = 0, timer: ReturnType<typeof setTimeout> | undefined;
    const reset = () => { y0 = null; cur = 0; setPull(0); setState("idle"); };
    const start = (e: TouchEvent) => { if (e.touches.length === 1 && el.scrollTop <= 0) { y0 = e.touches[0]!.clientY; x0 = e.touches[0]!.clientX; } else y0 = null; };
    const move = (e: TouchEvent) => {
      if (y0 === null) return;
      if (e.touches.length !== 1 || el.scrollTop > 0) { reset(); return; }
      const dy = e.touches[0]!.clientY - y0, dx = Math.abs(e.touches[0]!.clientX - x0);
      if (dy <= 0 || dx > dy) { if (cur) reset(); return; }
      cur = pullDistance(dy);
      setPull(cur); setState(cur >= PULL_TRIGGER ? "ready" : "pulling");
    };
    const end = () => {
      if (y0 === null) return;
      const fire = cur >= PULL_TRIGGER;
      y0 = null; cur = 0; setPull(0);
      if (fire) { try { cb.current(); } catch { /* refresh must never break the page */ } setState("done"); timer = setTimeout(() => setState("idle"), 900); } else setState("idle");
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", reset);
    return () => { el.removeEventListener("touchstart", start); el.removeEventListener("touchmove", move); el.removeEventListener("touchend", end); el.removeEventListener("touchcancel", reset); if (timer) clearTimeout(timer); };
  }, [box, enabled]);
  return { pull, state };
}
