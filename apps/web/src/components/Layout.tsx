import { type ReactNode } from "react";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useAccountOptional } from "../lib/account";
import { AVATAR_EMOJI } from "../pages/Account";
import { BottomNav } from "./BottomNav";
import { TextSize } from "./TextSize";
import { HighContrast } from "./HighContrast";
import { MainNav } from "./MainNav";
import { AppBar } from "./AppBar";
import { useApp } from "../lib/useApp";
import { setViewPref } from "../lib/appview";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  const s = useSettings();
  const { lang } = s;
  const site = s.get<string>("site.name");
  const maintenance = s.get("site.maintenance.enabled");
  const acct = useAccountOptional();
  const showAcct = s.get("feature.accounts") === true && s.get("accounts.showHeaderLink") === true;
  const { app, phone, pref } = useApp();
  const [loc] = useLocation();
  useEffect(() => { const r = document.documentElement; if (app) r.setAttribute("data-app", "true"); else r.removeAttribute("data-app"); return () => r.removeAttribute("data-app"); }, [app]);
  const banner = s.get("home.announcement.show") && s.text("home.announcement.text");
  return (
    <div className="shell" data-route={loc.endsWith("/learn") ? "lesson" : undefined}>
      <a className="skip" href="#main">{ui("skip", lang)}</a>
      {app && <AppBar />}
      <header className="top">
        <Link href="/" className="brand" aria-label={`${site} – ${ui("home", lang)}`}>
          <span className="brand-mark" aria-hidden="true">✎</span>
          <span>{site}</span>
        </Link>
        <MainNav />
        <nav className="top-actions" aria-label="Site">
          <TextSize />
          <HighContrast />
          {s.get("feature.languageToggle") && s.get("lang.tamil.enabled") && (
            <button type="button" className="btn ghost" lang={lang === "en" ? "ta" : "en"} onClick={() => s.setLang(lang === "en" ? "ta" : "en")} aria-label={ui("language", lang)}>
              {ui("switchTo", lang)}
            </button>
          )}
          {showAcct && (
            <Link href="/account" className="btn ghost acct-link">
              {acct?.active ? <><span aria-hidden="true">{AVATAR_EMOJI[acct.active.avatar] ?? "🙂"}</span> {acct.active.nickname}</> : acct?.me ? ui("account", lang) : ui("signIn", lang)}
            </Link>
          )}
        </nav>
      </header>
      {banner && <div className={`banner tone-${s.get<string>("home.announcement.tone")}`} role="status">{s.text("home.announcement.text")}</div>}
      <main id="main" className="page" tabIndex={-1}>
        {maintenance ? (
          <section className="notice">
            <h1>{ui("maintenance", lang)}</h1>
            <p>{s.text("site.maintenance.message")}</p>
          </section>
        ) : children}
      </main>
      <footer className="foot">
        <p>{s.text("home.footer.text")}</p>
        {s.get("feature.sitePages") === true && s.get("pages.footerLinks") === true && (
          <p className="small foot-links"><Link href="/about">{ui("aboutTitle", lang)}</Link> · <Link href="/privacy">{ui("privacyTitle", lang)}</Link> · <Link href="/terms">{ui("termsTitle", lang)}</Link>{s.get("feature.accounts") === true && s.get("parent.link.show") === true && <> · <Link href={s.get("feature.parentDashboard") === true ? "/parent" : "/account"}>{ui("navParent", lang)}</Link></>}</p>
        )}
        {s.get("feature.offline") && <p className="small">{ui("offlineReady", lang)}</p>}
        {!s.online && <p className="small" role="status">Offline</p>}
      </footer>
      {!app && phone && pref === "site" && <button type="button" className="app-pill noprint" onClick={() => setViewPref("app")}>📱 {ui("appViewApp", lang)}</button>}
      <BottomNav />
    </div>
  );
}
