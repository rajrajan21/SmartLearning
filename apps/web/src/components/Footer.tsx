import { useActiveBoard } from "../lib/activeBoard";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { Logo } from "./Logo";
import { lt } from "../lib/library";
import { gt } from "../lib/gk";
import { TourFooter } from "./TourFooter";

/** Full footer: about, learn links, help and policy pages, contact. Pieces switch on and off in Admin > Privacy, terms and about. */
export function Footer() {
  const s = useSettings();
  const pagesOn = s.get("feature.sitePages") === true;
  const rich = pagesOn && s.get("pages.footerLinks") === true && s.get("pages.footerRich") === true;
  const board = useActiveBoard().toLowerCase();
  const open = s.get<number[]>("catalog.openClasses");
  const email = String(s.get("pages.contactEmail") ?? "").trim();
  const site = s.get<string>("site.name");
  const links: [string, string][] = [["/about", ui("aboutTitle", s.lang)], ["/faq", ui("faqTitle", s.lang)], ["/guidelines", ui("guidelinesTitle", s.lang)], ["/privacy", ui("privacyTitle", s.lang)], ["/terms", ui("termsTitle", s.lang)], ["/disclaimer", ui("disclaimerTitle", s.lang)], ["/grievance", ui("grievanceTitle", s.lang)], ["/contact", ui("contactTitle", s.lang)]];
  return (
    <footer className="foot">
      {rich && (
        <div className="foot-grid">
          <div className="foot-brand"><Logo size={44} /><b>{site}</b><p>{ui("footTagline", s.lang)}</p>{email && <p><a href={`mailto:${email}`}>{email}</a></p>}</div>
          <nav aria-label={ui("footExplore", s.lang)}><h2>{ui("footExplore", s.lang)}</h2><ul>
            {[...open].sort((a, b) => a - b).map((n) => <li key={n}><Link href={`/${board}/${n}`}>{ui("classWord", s.lang)} {n}</Link></li>)}
            {s.get("feature.gk") === true && s.get("gk.nav.show") !== false && <li><Link href="/gk">{s.text("gk.tab.label") || gt("title", s.lang)}</Link></li>}
            {s.get("feature.library") === true && s.get("library.nav.show") !== false && <li><Link href="/library">{lt("title", s.lang)}</Link></li>}
            {s.get("feature.textbooks") === true && <li><Link href="/books">Textbooks</Link></li>}
            {s.get("feature.papers") === true && s.get("papers.nav.show") !== false && <li><Link href="/papers">{s.lang === "ta" ? "வினாத்தாள்கள்" : "Question papers"}</Link></li>}
          </ul></nav>
          <nav aria-label={ui("footHelp", s.lang)}><h2>{ui("footHelp", s.lang)}</h2><ul>{links.map(([h, t]) => <li key={h}><Link href={h}>{t}</Link></li>)}</ul></nav>
        </div>
      )}
      <TourFooter />
      {s.get("site.disclaimer.show") === true && <aside className="parent-note" role="note"><b>{ui("parentNoteTitle", s.lang)}</b>{ui("parentNoteText", s.lang)}</aside>}
      <p>{s.text("home.footer.text")}</p>
      {pagesOn && !rich && s.get("pages.footerLinks") === true && <p className="small foot-links">{links.slice(3, 6).map(([h, t], i) => <span key={h}>{i > 0 && " · "}<Link href={h}>{t}</Link></span>)}</p>}
      {s.get("feature.offline") && <p className="small">{ui("offlineReady", s.lang)}</p>}
      {!s.online && <p className="small" role="status">Offline</p>}
    </footer>
  );
}
