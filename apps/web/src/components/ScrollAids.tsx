import { useEffect, useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

/** A thin reading-progress line under the top of the screen and a "back to top" button (both can be switched off in Admin > Look and feel > Scrolling). */
export function ScrollAids() {
  const s = useSettings();
  const bar = s.get("layout.scrollBar") !== false, top = s.get("layout.backToTop") !== false;
  const [pct, setPct] = useState(0);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!bar && !top) return;
    const f = () => {
      const y = window.scrollY || 0;
      const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setPct(Math.min(100, Math.max(0, (y / h) * 100)));
      setShown(y > 260);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    window.addEventListener("resize", f);
    return () => { window.removeEventListener("scroll", f); window.removeEventListener("resize", f); };
  }, [bar, top]);
  if (!bar && !top) return null;
  return (
    <>
      {bar && <div className="scroll-track" aria-hidden="true"><div className="scroll-fill" style={{ width: `${pct.toFixed(1)}%` }} /></div>}
      {top && (
        <button type="button" className={`scroll-top-fab${shown ? " visible" : ""}`} tabIndex={shown ? 0 : -1} aria-label={ui("backToTop", s.lang)}
          onClick={() => { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { window.scrollTo(0, 0); } }}>
          ↑ {ui("backToTop", s.lang)}
        </button>
      )}
    </>
  );
}
