import { useEffect, useState } from "react";
import { store } from "../lib/storage";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

const KEY = "ss_contrast";
/** What the device saved, else the site's default. Pure so it can be tested. */
export const contrastOn = (saved: string | null | undefined, siteDefault: boolean): boolean => (saved === "1" ? true : saved === "0" ? false : siteDefault);

/** High-contrast switch. The choice stays on this device. */
export function HighContrast() {
  const s = useSettings();
  const control = s.get("a11y.highContrast.control") === true;
  const def = control && s.get("a11y.highContrast.default") === true;
  const [saved, setSaved] = useState<string | null>(() => store.get(KEY));
  const on = control && contrastOn(saved, def);
  useEffect(() => {
    const r = document.documentElement;
    if (on) r.setAttribute("data-contrast", "high"); else r.removeAttribute("data-contrast");
  }, [on]);
  if (!control) return null;
  return (
    <button type="button" className={on ? "btn sm contrast-btn" : "btn ghost sm contrast-btn"} aria-pressed={on} aria-label={ui("contrastLabel", s.lang)}
      onClick={() => { const v = on ? "0" : "1"; setSaved(v); store.set(KEY, v); }}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M10 2a8 8 0 0 1 0 16z" fill="currentColor" /></svg><span className="hide-xs"> {ui("contrastOn", s.lang)}</span>
    </button>
  );
}
