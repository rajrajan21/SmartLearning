import { Link, useLocation } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

/** Clear top menu for wide screens. On phones the bottom tab bar does this job. */
export function MainNav() {
  const s = useSettings();
  const [loc] = useLocation();
  const board = s.get<string>("catalog.defaultBoard").toLowerCase();
  const open = s.get<number[]>("catalog.openClasses");
  const cls = open.length ? Math.min(...open) : 3;
  const mastery = s.get("feature.mastery") === true;
  const items: { href: string; label: string; on: boolean }[] = [{ href: "/", label: ui("home", s.lang), on: loc === "/" }, { href: `/${board}/${cls}`, label: ui("navSubjects", s.lang), on: loc.startsWith(`/${board}/`) }];
  if (s.get("browse.explore.enabled") === true) items.push({ href: "/explore", label: ui("navExplore", s.lang), on: loc.startsWith("/explore") });
  if (mastery && s.get("mastery.revision.enabled") === true) items.push({ href: "/revise", label: ui("navRevise", s.lang), on: loc.startsWith("/revise") });
  if (mastery && s.get("mastery.progressPage") === true) items.push({ href: "/progress", label: ui("myProgress", s.lang), on: loc.startsWith("/progress") });
  if (s.get("notebook.enabled") === true && s.get("feature.lessons") === true) items.push({ href: "/notebook", label: ui("navNotebook", s.lang), on: loc.startsWith("/notebook") });
  return (
    <nav className="main-nav hide-sm" aria-label={ui("navTop", s.lang)}>
      {items.map((i) => <Link key={i.href} href={i.href} className={i.on ? "on" : ""} aria-current={i.on ? "page" : undefined}>{i.label}</Link>)}
    </nav>
  );
}
