import { useEffect, useState } from "react";
import { store } from "./storage";

/** Phones only: never tablets or computers. Pure so it can be tested. */
export function isPhone(ua: string, width: number, touch: boolean): boolean {
  if (/iPad|Tablet|PlayBook|Silk|Kindle|Nexus 7|Nexus 9/i.test(ua)) return false;
  if (/Android/i.test(ua)) return /Mobile/i.test(ua);
  if (/iPhone|iPod|Windows Phone|IEMobile|Opera Mini|BlackBerry/i.test(ua)) return true;
  if (/Macintosh/i.test(ua)) return false; // iPadOS pretends to be a Mac
  return touch && width <= 600 && /Mobile/i.test(ua);
}

export type ViewPref = "app" | "site" | null;
const KEY = "ss_view";
const listeners = new Set<() => void>();
export const getViewPref = (): ViewPref => { const v = store.get(KEY); return v === "app" || v === "site" ? v : null; };
export function setViewPref(v: ViewPref): void { if (v) store.set(KEY, v); else store.set(KEY, ""); listeners.forEach((l) => l()); }

/** What the student sees: the saved choice wins, then the phone check. */
export function resolveApp(o: { enabled: boolean; auto: boolean; pref: ViewPref; phone: boolean }): boolean {
  if (!o.enabled) return false;
  if (o.pref === "site") return false;
  if (o.pref === "app") return true;
  return o.auto && o.phone;
}

export function detectPhone(): boolean {
  if (typeof navigator === "undefined") return false;
  return isPhone(navigator.userAgent, typeof innerWidth === "number" ? innerWidth : 1024, "ontouchstart" in globalThis || navigator.maxTouchPoints > 0);
}

export function useViewPref(): [ViewPref, (v: ViewPref) => void] {
  const [pref, set] = useState<ViewPref>(getViewPref);
  useEffect(() => { const l = () => set(getViewPref()); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return [pref, setViewPref];
}

// ---- Light / Dark / Auto, chosen on this device ----
export type ThemePref = "light" | "dark" | "auto" | null;
const TKEY = "ss_theme_pref";
const tl = new Set<() => void>();
export const getThemePref = (): ThemePref => { const v = store.get(TKEY); return v === "light" || v === "dark" || v === "auto" ? v : null; };
export function setThemePref(v: ThemePref): void { if (v) store.set(TKEY, v); else store.set(TKEY, ""); tl.forEach((l) => l()); }
export function useThemePref(): ThemePref {
  const [p, set] = useState<ThemePref>(getThemePref);
  useEffect(() => { const l = () => set(getThemePref()); tl.add(l); return () => { tl.delete(l); }; }, []);
  return p;
}

/** Small buzz on a right answer, only where the phone supports it. */
export function buzz(ms = 25): void {
  try { if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(ms); } catch { /* not supported */ }
}
