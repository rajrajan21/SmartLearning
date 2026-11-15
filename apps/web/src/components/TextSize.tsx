import { useEffect, useState } from "react";
import { store } from "../lib/storage";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

const KEY = "ss_text_pct";
export const clampPct = (n: number, max: number) => Math.min(max, Math.max(100, Math.round(n / 10) * 10));

/** A- / A+ buttons. The choice is kept on this device and multiplies the site's text scale. */
export function TextSize() {
  const s = useSettings();
  const max = s.get<number>("ui.textSize.maxPercent");
  const [pct, setPct] = useState<number>(() => clampPct(Number(store.get(KEY)) || 100, 200));
  const eff = clampPct(pct, max);
  useEffect(() => { document.documentElement.style.setProperty("--user-scale", String(eff / 100)); }, [eff]);
  if (s.get("ui.textSize.control") !== true) return null;
  const set = (n: number) => { const v = clampPct(n, max); setPct(v); store.set(KEY, String(v)); };
  return (
    <span className="textsize" role="group" aria-label={ui("textBigger", s.lang)}>
      <button type="button" className="btn ghost sm" onClick={() => set(eff - 10)} disabled={eff <= 100} aria-label={ui("textSmaller", s.lang)}>A−</button>
      <button type="button" className="btn ghost sm" onClick={() => set(eff + 10)} disabled={eff >= max} aria-label={ui("textBigger", s.lang)}>A+</button>
    </span>
  );
}
