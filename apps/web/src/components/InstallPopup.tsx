import { useEffect, useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { store } from "../lib/storage";

interface InstallEvent extends Event { prompt: () => Promise<void> }
let saved: InstallEvent | null = null;
// the browser can fire this before any component is on screen, so it is caught once, here
if (typeof window !== "undefined") window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); saved = e as InstallEvent; });

const OPEN_INSTALL = "ss-open-install";
export function InstallTrigger() {
  const s = useSettings();
  if (s.get("app.install.show") !== true || isStandalone()) return null;
  return <button type="button" className="btn ghost install-trigger" onClick={() => window.dispatchEvent(new Event(OPEN_INSTALL))}>
    {s.lang === "ta" ? "செயலியைச் சேர்" : "Install app"}
  </button>;
}

const KEY = "ss_install_v1";
export interface InstallMemory { until?: number; never?: boolean }
export const snoozed = (m: InstallMemory, now: number): boolean => m.never === true || (m.until !== undefined && now < m.until);
const isIos = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isStandalone = () => typeof matchMedia === "function" && (matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true);
const isMobile = () => typeof matchMedia === "function" && matchMedia("(max-width: 900px) and (pointer: coarse)").matches;

/** A bottom sheet that offers to install the site as an app. Android gets the real install button, iPhone the Safari steps. */
export function InstallPopup() {
  const s = useSettings();
  const [evt, setEvt] = useState<InstallEvent | null>(saved);
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const on = s.get("app.install.popup.show") === true;
  const delay = s.get<number>("app.install.popup.delaySeconds");
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); saved = e as InstallEvent; setEvt(saved); };
    const d = () => { saved = null; setEvt(null); setOpen(false); setManual(false); };
    const request = () => { if (!isStandalone()) setManual(true); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); setManual(false); } };
    window.addEventListener("keydown", escape);
    window.addEventListener(OPEN_INSTALL, request);
    window.addEventListener("beforeinstallprompt", h); window.addEventListener("appinstalled", d);
    return () => { window.removeEventListener("beforeinstallprompt", h); window.removeEventListener("appinstalled", d); window.removeEventListener(OPEN_INSTALL, request); window.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => {
    if (!on || isStandalone()) return;
    if (s.get("app.install.popup.mobileOnly") === true && !isMobile()) return;
    const mem = store.getJson<InstallMemory>(KEY) ?? {};
    if (snoozed(mem, Date.now())) return;
    const t = setTimeout(() => setOpen(true), Math.max(1, delay) * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, delay]);
  const ios = isIos();
  if (!manual && (!open || !on || (!evt && !(ios && s.get("app.install.popup.ios") === true)))) return null;
  const close = () => { setManual(false); setOpen(false); };
  const later = () => { store.setJson(KEY, { until: Date.now() + s.get<number>("app.install.popup.snoozeDays") * 86400000 } satisfies InstallMemory); close(); };
  const never = () => { store.setJson(KEY, { never: true } satisfies InstallMemory); close(); };
  return (
    <aside className="install-pop" role="dialog" aria-label={ui("installPopupTitle", s.lang)}>
      <img src="/icon-192.png" alt="" width="48" height="48" />
      <div className="install-pop-body">
        <b>{ui("installPopupTitle", s.lang)}</b>
        <p className="small">{ui("installPopupText", s.lang)}</p>
        {evt ? (
          <div className="q-actions">
            <button type="button" className="btn sm" onClick={() => { void evt.prompt().catch(() => setManual(true)); saved = null; setEvt(null); close(); }}>{ui("installBtn", s.lang)}</button>
            <button type="button" className="btn ghost sm" onClick={later}>{ui("installNotNow", s.lang)}</button>
          </div>
        ) : (
          <>
            {ios ? <ol className="ios-steps"><li>{ui("installIos1", s.lang)}</li><li>{ui("installIos2", s.lang)}</li><li>{ui("installIos3", s.lang)}</li></ol>
              : <p className="small">{s.lang === "ta" ? "உலாவிப் பட்டியலில் ‘முகப்புத் திரையில் சேர்’ என்பதைத் தேர்ந்தெடுக்கவும். அது இல்லையெனில் இந்தப் பக்கத்தைப் புக்மார்க் செய்யவும்." : "Open your browser menu and choose Install app or Add to Home screen. If these are unavailable, bookmark this page."}</p>}
            <div className="q-actions"><button type="button" className="btn ghost sm" onClick={later}>{ui("installNotNow", s.lang)}</button></div>
          </>
        )}
        {!manual && <button type="button" className="link small" onClick={never}>{ui("installNever", s.lang)}</button>}
      </div>
    </aside>
  );
}
