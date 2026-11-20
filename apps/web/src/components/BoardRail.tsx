import { useActiveBoard } from "../lib/activeBoard";
import { BoardRailList } from "./BoardChips";
import { Link, useLocation } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard } from "../lib/curriculum";

const COMING = [{ code: "TNSB", en: "Tamil Nadu State Board", ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம்" }, { code: "TNMB", en: "Tamil Nadu Matriculation", ta: "தமிழ்நாடு மெட்ரிகுலேஷன்" }];
const NAMES: Record<string, string> = { maths: "➗", evs: "🌱", english: "📖", tamil: "🔤", science: "🔬", "social-science": "🌍" };

/** Side panel: pick the board, the class, then jump to a subject or chapter. Shown beside the page on wide screens. */
export function BoardRail() {
  const s = useSettings();
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
    <aside className="rail hide-sm" aria-label={ui("board", s.lang) + " / " + ui("classWord", s.lang)}>
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
        <h2 className="rail-h">{ui("classWord", s.lang)} {curCls}</h2>
        <ul className="rail-subjects">
          {cls.subjects.map((sub) => {
            const on = curSub === sub.slug;
            return (<li key={sub.id}>
              <Link href={`/${board}/${curCls}/${sub.slug}`} className={`rail-sub${on ? " cur" : ""}`}><span aria-hidden="true">{NAMES[sub.slug] ?? "📘"}</span>{s.name(sub.name)}</Link>
              {on && <ol className="rail-chapters">{sub.chapters.map((c) => <li key={c.id}><Link href={`/${board}/${curCls}/${sub.slug}/${c.slug}`} className={parts[3] === c.slug ? "cur" : ""}>{s.name(c.name)}</Link></li>)}</ol>}
            </li>);
          })}
        </ul>
      </>)}
    </aside>
  );
}
