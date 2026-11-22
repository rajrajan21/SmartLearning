import { useActiveBoard } from "../lib/activeBoard";
import { BoardRailList } from "./BoardChips";
import { Link, useLocation } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard } from "../lib/curriculum";
import { useId, useState } from "react";

const NAMES: Record<string, string> = { maths: "➗", evs: "🌱", english: "📖", tamil: "🔤", science: "🔬", "social-science": "🌍" };

/** Catalog navigation is a sidebar on wide screens and a disclosure above the page on narrow screens. */
export function BoardRail() {
  const s = useSettings();
  const panelId = useId();
  const [expanded, setExpanded] = useState(false);
  const [loc] = useLocation();
  const board = useActiveBoard().toLowerCase();
  const open = new Set(s.get<number[]>("catalog.openClasses"));
  const state = useBoard(board);
  const parts = loc.split("/").filter(Boolean);
  const inBoard = parts[0] === board && /^\d+$/.test(parts[1] ?? "");
  const curCls = inBoard ? Number(parts[1]) : 0, curSub = inBoard ? parts[2] : undefined;
  const data = state.status === "ready" ? state.data : null;
  const cls = data?.classes.find((c) => c.classLevel === curCls);
  return (
    <aside className="rail" aria-label={s.lang === "ta" ? "பாடத்திட்டம் மற்றும் வகுப்புகள்" : "Curriculum navigation"}>
      <button className="rail-toggle" type="button" aria-controls={panelId} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        {s.lang === "ta" ? "பாடத்திட்டம், வகுப்பு மற்றும் பாடங்கள்" : "Board, class and subjects"}
        <span aria-hidden="true">{expanded ? "▴" : "▾"}</span>
      </button>
      <div className="rail-content" id={panelId} data-expanded={expanded}>
        <h2 className="rail-h">{ui("board", s.lang)}</h2>
        <BoardRailList />
        <h2 className="rail-h">{ui("classWord", s.lang)}</h2>
        <ul className="rail-classes">
          {Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => n <= 7 || open.has(n)).map((n) => {
            const ok = open.has(n) && !!data?.classes.some((c) => c.classLevel === n && c.subjects.length > 0);
            return <li key={n}>{ok
              ? <Link href={`/${board}/${n}`} className={`rail-class${curCls === n ? " cur" : ""}`} aria-current={curCls === n ? "page" : undefined}><b>{n}</b></Link>
              : <span className="rail-class off" aria-disabled="true"><b>{n}</b><small>{ui("soon", s.lang)}</small></span>}</li>;
          })}
        </ul>
        {cls && (<>
          <h2 className="rail-h">{ui("classWord", s.lang)} {curCls} · {ui("subjects", s.lang)}</h2>
          <ul className="rail-subjects">
            {cls.subjects.map((sub) => {
              const on = curSub === sub.slug;
              return (<li key={sub.id}>
                <Link href={`/${board}/${curCls}/${sub.slug}`} onClick={() => setExpanded(false)} className={`rail-sub${on ? " cur" : ""}`}><span aria-hidden="true">{NAMES[sub.slug] ?? "📘"}</span>{s.name(sub.name)}</Link>
                {on && <ol className="rail-chapters">{sub.chapters.map((c) => <li key={c.id}><Link href={`/${board}/${curCls}/${sub.slug}/${c.slug}`} onClick={() => setExpanded(false)} className={parts[3] === c.slug ? "cur" : ""}>{s.name(c.name)}</Link></li>)}</ol>}
              </li>);
            })}
          </ul>
        </>)}
      </div>
    </aside>
  );
}
