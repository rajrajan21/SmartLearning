import { PALETTES } from "@studysmart/shared";
import { accountPaletteOwner, useAccountOptional } from "../lib/account";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { detectPhone, resolveApp, setThemePref, setViewPref, useThemePref, useViewPref, type ThemePref } from "../lib/appview";
import { TextSize } from "./TextSize";
import { Link } from "wouter";
import { useNotebook } from "../lib/tier2";

import { InstallTrigger } from "./InstallPopup";

export function InstallCard() {
  const s = useSettings();
  if (s.get("app.install.show") !== true) return null;
  const mobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  return <section className="me-block install-card" aria-label={ui("installTitle", s.lang)}>
    <h3>{ui("installTitle", s.lang)}</h3>
    <InstallTrigger />
    <p className="small">{s.text(mobile ? "app.install.otherText" : "app.install.desktopText")}</p>
  </section>;
}

/** Colours (Light / Dark / Auto), text size, language and the app / full-website switch. */
export function MeSettings({ compact = false }: { compact?: boolean }) {
  const s = useSettings();
  const me = useAccountOptional()?.me;
  const parent = me?.childMode === false;
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
      {me && s.paletteOwner === accountPaletteOwner(me) && s.get("app.theme.control") === true && <div className="me-block">
        <label>{s.lang === "ta" ? "வண்ணத் தொகுப்பு" : "Colour palette"}{" "}
          <select value={s.palette} onChange={e => s.setPalette(e.target.value)}>
            <option value="">{s.lang === "ta" ? "தளத்தின் இயல்புநிலை" : "Site default"}</option>
            {PALETTES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
        <p className="small">{s.lang === "ta" ? "இந்த உலாவியில் உங்கள் கணக்கிற்கு மட்டும்." : "Saved for your account on this browser."}</p>
      </div>}
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
          {parent && s.get("feature.accounts") === true && s.get("feature.parentDashboard") === true && <li><Link href="/parent" className="btn ghost">👪 {ui("meParentLink", s.lang)}</Link></li>}
        </ul>
      )}
      {compact ? <InstallTrigger /> : <InstallCard />}
    </div>
  );
}
