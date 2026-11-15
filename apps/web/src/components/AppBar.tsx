import { useState } from "react";
import { useLocation } from "wouter";
import { useSettings } from "../lib/settings";
import { ui, type UiKey } from "../lib/i18n";
import { BottomSheet } from "./BottomSheet";
import { MeSettings } from "./MeSettings";

const TITLES: [string, UiKey][] = [["/progress", "myProgress"], ["/revise", "navRevise"], ["/explore", "navExplore"], ["/notebook", "navNotebook"], ["/account", "appMe"], ["/parent", "parentArea"], ["/classroom", "classroomTitle"]];
export const isTabRoot = (loc: string) => loc === "/" || ["/progress", "/account", "/revise", "/explore"].includes(loc) || /^\/[^/]+\/\d+$/.test(loc);

/** App top bar: Back button, page title, quick settings (opens a bottom sheet). Shown only in the app view. */
export function AppBar() {
  const s = useSettings();
  const [loc] = useLocation();
  const [sheet, setSheet] = useState(false);
  const root = isTabRoot(loc);
  const t = TITLES.find(([p]) => loc.startsWith(p))?.[1];
  return (
    <div className="appbar" role="banner">
      {root ? <span className="appbar-spacer" /> : <button type="button" className="appbar-back" onClick={() => history.back()} aria-label={ui("appBack", s.lang)}>←</button>}
      <p className="appbar-title">{t ? ui(t, s.lang) : s.get<string>("site.name")}</p>
      <button type="button" className="appbar-gear" onClick={() => setSheet(true)} aria-label={ui("appQuickSettings", s.lang)} aria-haspopup="dialog">⚙︎</button>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={ui("appQuickSettings", s.lang)}><MeSettings compact /></BottomSheet>
    </div>
  );
}
