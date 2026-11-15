import { useEffect, useState } from "react";

/** Is the device asking for less motion, or is the site's own motion setting not "full"? */
export function reducedMotion(): boolean {
  if (typeof document !== "undefined") {
    const m = document.documentElement.getAttribute("data-motion");
    if (m && m !== "full") return true;
  }
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function useReducedMotion(): boolean {
  const [r, setR] = useState(reducedMotion);
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setR(reducedMotion());
    q.addEventListener?.("change", f);
    return () => q.removeEventListener?.("change", f);
  }, []);
  return r;
}

/** Group paragraphs into at most `max` step sections (keeps order; long lists are merged evenly). */
export function splitSections(paras: string[], min: number, max = 8): string[][] | null {
  if (paras.length < Math.max(2, min)) return null;
  if (paras.length <= max) return paras.map((p) => [p]);
  const out: string[][] = [];
  const size = Math.ceil(paras.length / max);
  for (let i = 0; i < paras.length; i += size) out.push(paras.slice(i, i + size));
  return out;
}

/** Which picture shows for section i of n, given k pictures (spread evenly, never out of range). */
export function pictureFor(i: number, n: number, k: number): number {
  if (k <= 0 || n <= 0) return -1;
  return Math.min(k - 1, Math.floor((i * k) / n));
}

/** Can this device watch scrolling? Without it the lesson shows plain paragraphs. */
export const canObserve = (): boolean => typeof IntersectionObserver === "function";
