import { useActiveBoard } from "../lib/activeBoard";
import { Link, useLocation } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useApp } from "../lib/useApp";
import { gt } from "../lib/gk";

/** Thumb-friendly tab bar for phones. Hidden by CSS on wide screens. */
export function BottomNav() {
  const s = useSettings();
  const [loc] = useLocation();
  const { app } = useApp();
  if (s.get("ui.bottomNav.enabled") !== true && !app) return null;
  const board = useActiveBoard().toLowerCase();
  const open = s.get<number[]>("catalog.openClasses");
  const cls = open.length ? Math.min(...open) : 3;
  const mastery = s.get("feature.mastery") === true;
  const labels = s.get("ui.bottomNav.showLabels") === true;
  const items: { href: string; icon: string; label: string; on: boolean }[] = [
    { href: "/", icon: "🏠", label: ui("home", s.lang), on: loc === "/" },
    { href: `/${board}/${cls}`, icon: "📚", label: ui("navSubjects", s.lang), on: loc.startsWith(`/${board}/`) },
  ];
  if (mastery && s.get("mastery.revision.enabled") === true) items.push({ href: "/revise", icon: "🔁", label: ui("navRevise", s.lang), on: loc.startsWith("/revise") });
  if (mastery && s.get("mastery.progressPage") === true) items.push({ href: "/progress", icon: "⭐", label: ui("myProgress", s.lang), on: loc.startsWith("/progress") });
  if (s.get("feature.gk") === true && s.get("gk.nav.show") !== false) items.push({ href: "/gk", icon: "💡", label: s.text("gk.tab.label") || gt("title", s.lang), on: loc.startsWith("/gk") });
  if (s.get("feature.accounts") === true) items.push({ href: "/account", icon: "🙂", label: ui("account", s.lang), on: loc.startsWith("/account") });
  if (app) {
    const practice = mastery && s.get("mastery.revision.enabled") === true ? "/revise" : `/${board}/${cls}`;
    const tabs = [
      { href: "/", icon: "🏠", label: ui("appHome", s.lang), on: loc === "/" },
      { href: `/${board}/${cls}`, icon: "📚", label: ui("appLearn", s.lang), on: loc.startsWith(`/${board}/`) || loc.startsWith("/explore") },
      { href: practice, icon: "✏️", label: ui("appPractice", s.lang), on: loc.startsWith("/revise"), centre: true },
      { href: mastery ? "/progress" : "/", icon: "⭐", label: ui("appProgress", s.lang), on: loc.startsWith("/progress") },
      { href: "/account", icon: "🙂", label: ui("appMe", s.lang), on: loc.startsWith("/account") || loc.startsWith("/parent") },
    ];
    return (
      <nav className="tabbar app-tabs noprint" aria-label={ui("navMain", s.lang)}>
        <ul>
          {tabs.map((t) => (
            <li key={t.label} className={t.centre ? "centre" : undefined}>
              <Link href={t.href} aria-current={t.on ? "page" : undefined} className={t.on ? "on" : ""}>
                <span className="tb-icon" aria-hidden="true">{t.icon}</span><span className="tb-label">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
  return (
    <nav className="tabbar noprint" aria-label={ui("navMain", s.lang)}>
      <ul>
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} aria-current={i.on ? "page" : undefined} aria-label={labels ? undefined : i.label} className={i.on ? "on" : ""}>
              <span className="tb-icon" aria-hidden="true">{i.icon}</span>
              {labels && <span className="tb-label">{i.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
