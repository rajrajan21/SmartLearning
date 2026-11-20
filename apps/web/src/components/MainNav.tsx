import { useActiveBoard } from "../lib/activeBoard";
import { Link, useLocation } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { gt } from "../lib/gk";
import { lt } from "../lib/library";

/** Clear top menu for wide screens. On phones the bottom tab bar does this job. */
export function MainNav() {
  const s = useSettings();
  const [loc] = useLocation();
  const board = useActiveBoard().toLowerCase();
  const open = s.get<number[]>("catalog.openClasses");
  const cls = open.length ? Math.min(...open) : 3;
  const mastery = s.get("feature.mastery") === true;
  const items: { href: string; label: string; on: boolean }[] = [{ href: "/", label: ui("home", s.lang), on: loc === "/" }, { href: `/${board}/${cls}`, label: ui("navSubjects", s.lang), on: loc.startsWith(`/${board}/`) }];
  if (s.get("browse.explore.enabled") === true) items.push({ href: "/explore", label: ui("navExplore", s.lang), on: loc.startsWith("/explore") });
  if (mastery && s.get("mastery.revision.enabled") === true) items.push({ href: "/revise", label: ui("navRevise", s.lang), on: loc.startsWith("/revise") });
  if (mastery && s.get("mastery.progressPage") === true) items.push({ href: "/progress", label: ui("myProgress", s.lang), on: loc.startsWith("/progress") });
  if (s.get("notebook.enabled") === true && s.get("feature.lessons") === true) items.push({ href: "/notebook", label: ui("navNotebook", s.lang), on: loc.startsWith("/notebook") });
  if (s.get("tour.enabled") === true && s.get("tour.nav.show") === true && s.get("tour.page.enabled") === true) items.push({ href: "/tour", label: s.text("tour.nav.label") || "How it works", on: loc.startsWith("/tour") });
  if (s.get("feature.gk") === true && s.get("gk.nav.show") !== false) items.push({ href: "/gk", label: s.text("gk.tab.label") || gt("title", s.lang), on: loc.startsWith("/gk") });
  if (s.get("feature.library") === true && s.get("library.nav.show") !== false) items.push({ href: "/library", label: lt("title", s.lang), on: loc.startsWith("/library") });
  if (s.get("feature.papers") === true && s.get("papers.nav.show") !== false) items.push({ href: "/papers", label: s.lang === "ta" ? "வினாத்தாள்கள்" : "Question papers", on: loc.startsWith("/papers") });
  return (
    <nav className="main-nav hide-sm" aria-label={ui("navTop", s.lang)}>
      {items.map((i) => <Link key={i.href} href={i.href} className={i.on ? "on" : ""} aria-current={i.on ? "page" : undefined}>{i.label}</Link>)}
    </nav>
  );
}
