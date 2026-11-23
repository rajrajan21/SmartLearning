import { PresetContext, previewFrame, useSitePreset } from "../lib/sitePresets";
import "./sitePresets.css";
import { useActiveBoard } from "../lib/activeBoard";
import { SearchBox } from "./SearchBox";
import { InstallPopup, InstallTrigger } from "./InstallPopup";
import { ScrollAids } from "./ScrollAids";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useAccountOptional } from "../lib/account";
import { AVATAR_EMOJI } from "../pages/Account";
import { BottomNav } from "./BottomNav";
import { TextSize } from "./TextSize";
import { HighContrast } from "./HighContrast";
import { MainNav } from "./MainNav";
import { BoardRail } from "./BoardRail";
import { Footer } from "./Footer";
import { Logo } from "./Logo";
import { AppBar } from "./AppBar";
import { useApp } from "../lib/useApp";
import { setViewPref } from "../lib/appview";
import { useEffect } from "react";
import { useLocation } from "wouter";

/** A new page opens at its top, not wherever the last page was scrolled to. Links to a #section are left alone. */
function ScrollToTop() {
  const [path] = useLocation();
  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash) return;
    try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch { /* jsdom */ }
    document.getElementById("main")?.scrollTo?.(0, 0);
  }, [path]);
  return null;
}

export function Layout({ children }: { children: ReactNode }) {
  const s = useSettings();
  const activeBoard = useActiveBoard();
  const { lang } = s;
  const preset = useSitePreset();
  const site = s.get<string>("site.name");
  const maintenance = s.get("site.maintenance.enabled");
  const acct = useAccountOptional();
  const showAcct = s.get("feature.accounts") === true && s.get("accounts.showHeaderLink") === true;
  const { app, phone, pref } = useApp();
  const activity = preset === "activity";
  const headerSizing = activity ? {
    "--header-controls-scale": s.get<number>("layout.header.controlsPercent") / 100,
    "--header-nav-text-scale": s.get<number>("layout.header.navTextPercent") / 100,
  } as CSSProperties : undefined;
  const [menuOpen, setMenuOpen] = useState(true);
  const menuId = useId();
  const [loc] = useLocation();
  useEffect(() => { if (s.get("stats.enabled") === true && !previewFrame() && !loc.startsWith("/admin")) void fetch("/api/v1/track/view", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: loc }), keepalive: true }).catch(() => {}); }, [loc, s]);
  useEffect(() => { const r = document.documentElement; if (app) r.setAttribute("data-app", "true"); else r.removeAttribute("data-app"); return () => r.removeAttribute("data-app"); }, [app]);
  const picker = s.get<string>("layout.picker");
  const classroomLesson = loc.startsWith("/classroom/");
  const libraryReader = /^\/library\/(?!contribute(?:\/|$)|my-contributions(?:\/|$))[^/]+\/?$/.test(loc);
  const onLesson = libraryReader || classroomLesson || loc.endsWith("/learn") || loc.startsWith("/books/") || loc.startsWith("/play/");
  const banner = s.get("home.announcement.show") && s.text("home.announcement.text");
  return (
    <PresetContext.Provider value={preset}>
    <div className="shell" data-site-preset={preset} data-classroom-lesson={classroomLesson || undefined} data-route={loc.endsWith("/learn") || (preset !== "classic" && loc.startsWith("/classroom/")) ? "lesson" : preset !== "classic" && /^\/[^/]+\/\d+\/[^/]+$/.test(loc) ? "subject" : undefined}>
      <ScrollToTop />
      <ScrollAids />
      <InstallPopup />
      <a className="skip" href="#main">{ui("skip", lang)}</a>
      {app && <AppBar />}
      <header className={activity ? "top activity-header" : "top"} style={headerSizing}>
        <Link href="/" className="brand" aria-label={`${site} – ${ui("home", lang)}`}>
          <Logo size={42} />
          <span>{site}</span>
        </Link>
        {activity && <button type="button" className="btn ghost activity-menu" aria-controls={menuId} aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "▾" : "▸"} {lang === "ta" ? "பட்டியல்" : "Menu"}</button>}
        {preset !== "dashboard" && !activity && <MainNav />}
        {s.get("feature.search") === true && s.get("search.header.show") === true && !onLesson && !maintenance && <SearchBox board={activeBoard} compact />}
        {activity && s.get("feature.classroom") === true && <Link className="btn ghost activity-classroom" href="/classroom">{lang === "ta" ? "வகுப்பறை" : "View Classroom"}</Link>}
        <nav className="top-actions" aria-label="Site">
          <InstallTrigger />
          <TextSize />
          <HighContrast />
          {s.get("feature.languageToggle") && s.get("lang.tamil.enabled") && (
            <button type="button" className="btn ghost" lang={lang === "en" ? "ta" : "en"} onClick={() => s.setLang(lang === "en" ? "ta" : "en")} aria-label={ui("language", lang)}>
              {ui("switchTo", lang)}
            </button>
          )}
          {showAcct && (
            <Link href="/account" className="btn ghost acct-link">
              {acct?.me?.childMode && acct.active ? <><span aria-hidden="true">{AVATAR_EMOJI[acct.active.avatar] ?? "🙂"}</span> {acct.active.nickname}</> : acct?.me ? ui("account", lang) : ui("signIn", lang)}
            </Link>
          )}
        </nav>
        {activity && <div className="activity-nav" id={menuId} hidden={!menuOpen}><MainNav bare /></div>}
      </header>
      {banner && <div className={`banner tone-${s.get<string>("home.announcement.tone")}`} role="status">{s.text("home.announcement.text")}</div>}
      <div className="body-row" data-picker={picker}>
        {preset === "dashboard" && <MainNav />}
        {(picker === "left" || picker === "right") && !maintenance && !onLesson && <BoardRail />}
        <main id="main" className="page" tabIndex={-1}>
          {maintenance ? (
            <section className="notice">
              <h1>{ui("maintenance", lang)}</h1>
              <p>{s.text("site.maintenance.message")}</p>
            </section>
          ) : children}
        </main>
      </div>
      <Footer />
      {!app && phone && pref === "site" && <button type="button" className="app-pill noprint" onClick={() => setViewPref("app")}>📱 {ui("appViewApp", lang)}</button>}
      <BottomNav />
    </div>
    </PresetContext.Provider>
  );
}
