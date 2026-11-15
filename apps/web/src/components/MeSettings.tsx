import { useEffect, useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { detectPhone, resolveApp, setThemePref, setViewPref, useThemePref, useViewPref, type ThemePref } from "../lib/appview";
import { TextSize } from "./TextSize";
import { Link } from "wouter";
import { useNotebook } from "../lib/tier2";

interface InstallEvent extends Event { prompt: () => Promise<void> }
const isIos = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isStandalone = () => typeof matchMedia === "function" && matchMedia("(display-mode: standalone)").matches;

/** Install: Android/Chrome shows the real install prompt; iPhone gets the three Safari steps. */
export function InstallCard() {
  const s = useSettings();
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [done, setDone] = useState(isStandalone());
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e as InstallEvent); };
    const d = () => setDone(true);
    addEventListener("beforeinstallprompt", h); addEventListener("appinstalled", d);
    return () => { removeEventListener("beforeinstallprompt", h); removeEventListener("appinstalled", d); };
  }, []);
  if (s.get("app.install.show") !== true) return null;
  return (
    <section className="me-block install-card" aria-label={ui("installTitle", s.lang)}>
      <h3>{ui("installTitle", s.lang)}</h3>
      {done ? <p>{ui("installDone", s.lang)}</p> : evt ? (
        <button type="button" className="btn" onClick={() => { void evt.prompt(); setEvt(null); }}>{ui("installBtn", s.lang)}</button>
      ) : isIos() ? (
        <ol className="ios-steps"><li>{ui("installIos1", s.lang)}</li><li>{ui("installIos2", s.lang)}</li><li>{ui("installIos3", s.lang)}</li></ol>
      ) : <p className="small">{ui("installOther", s.lang)}</p>}
    </section>
  );
}

/** Colours (Light / Dark / Auto), text size, language and the app / full-website switch. */
export function MeSettings({ compact = false }: { compact?: boolean }) {
  const s = useSettings();
  const pref = useThemePref();
  const [view] = useViewPref();
  const app = resolveApp({ enabled: s.get("app.view.enabled") === true, auto: s.get("app.view.autoPhone") === true, pref: view, phone: detectPhone() });
  const current: ThemePref = pref ?? "auto";
  const notes = useNotebook();
  return (
    <div className="me-settings">
      {s.get("app.theme.control") === true && (
        <fieldset className="me-block seg-choice">
          <legend>{ui("themeTitle", s.lang)}</legend>
          {(["light", "dark", "auto"] as const).map((m) => (
            <label key={m} className={current === m ? "on" : ""}>
              <input type="radio" name="theme-pref" checked={current === m} onChange={() => setThemePref(m)} />
              <span>{m === "light" ? `☀️ ${ui("themeLight", s.lang)}` : m === "dark" ? `🌙 ${ui("themeDark", s.lang)}` : `🌗 ${ui("themeAuto", s.lang)}`}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="me-block me-row">
        <TextSize />
        {s.get("feature.languageToggle") && s.get("lang.tamil.enabled") && (
          <button type="button" className="btn ghost" lang={s.lang === "en" ? "ta" : "en"} onClick={() => s.setLang(s.lang === "en" ? "ta" : "en")}>{ui("switchTo", s.lang)}</button>
        )}
      </div>
      {s.get("app.view.enabled") === true && (
        <div className="me-block">
          <button type="button" className="btn ghost" onClick={() => setViewPref(app ? "site" : "app")}>{app ? ui("appViewSite", s.lang) : ui("appViewApp", s.lang)}</button>
        </div>
      )}
      {!compact && app && s.get("app.me.links.show") === true && (
        <ul className="me-links">
          {s.get("notebook.enabled") === true && s.get("feature.lessons") === true && <li><Link href="/notebook" className="btn ghost">📓 {ui("meNotebookLink", s.lang)} ({Object.keys(notes).length})</Link></li>}
          {s.get("feature.accounts") === true && s.get("feature.parentDashboard") === true && <li><Link href="/parent" className="btn ghost">👪 {ui("meParentLink", s.lang)}</Link></li>}
        </ul>
      )}
      {!compact && <InstallCard />}
    </div>
  );
}
