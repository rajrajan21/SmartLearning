import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSettings } from "../lib/settings";
import { ui, type UiKey } from "../lib/i18n";
import { BottomSheet } from "./BottomSheet";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import { SearchBox } from "./SearchBox";
import { useActiveBoard } from "../lib/activeBoard";
import { MeSettings } from "./MeSettings";

const TITLES: [string, UiKey][] = [["/progress", "myProgress"], ["/revise", "navRevise"], ["/explore", "navExplore"], ["/notebook", "navNotebook"], ["/account", "appMe"], ["/parent", "parentArea"], ["/classroom", "classroomTitle"]];
export const isTabRoot = (loc: string) => loc === "/" || ["/progress", "/account", "/revise", "/explore"].includes(loc) || /^\/[^/]+\/\d+$/.test(loc);

/** App top bar: Back button, page title, quick settings (opens a bottom sheet). Shown only in the app view. */
export function AppBar() {
  const s = useSettings();
  const [loc] = useLocation();
  const board = useActiveBoard();
  const [sheet, setSheet] = useState(false);
  const root = isTabRoot(loc);
  const t = TITLES.find(([p]) => loc.startsWith(p))?.[1];
  return (
    <div className="appbar" role="banner">
      {root ? <span className="appbar-spacer" /> : <button type="button" className="appbar-back" onClick={() => history.back()} aria-label={ui("appBack", s.lang)}>←</button>}
      <Link href="/" className="appbar-brand" aria-label={ui("home", s.lang)}><Logo size={30} /></Link>
      <p className="appbar-title">{t ? ui(t, s.lang) : s.get<string>("site.name")}</p>
      <button type="button" className="appbar-gear" onClick={() => setSheet(true)} aria-label={ui("appQuickSettings", s.lang)} aria-haspopup="dialog">⚙︎</button>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={ui("appQuickSettings", s.lang)}>
        <div onClick={(event) => { if ((event.target as HTMLElement).closest("a,.install-trigger")) setSheet(false); }}>
          {s.get("feature.search") === true && s.get("search.header.show") === true && <SearchBox compact board={board} />}
          <div className="appbar-links"><MainNav bare /></div>
          <MeSettings compact />
        </div>
      </BottomSheet>
    </div>
  );
}
