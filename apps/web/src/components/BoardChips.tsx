import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { setChosenBoard, useVisibleBoards } from "../lib/boards";
import { useActiveBoard } from "../lib/activeBoard";

/** Every board that has lessons as a button, with its lesson count; boards still to come are greyed out. Choosing one switches the classes and subjects below. */
export function BoardChips() {
  const s = useSettings();
  const { ready, soon } = useVisibleBoards();
  const board = useActiveBoard();
  const counts = s.get("catalog.boards.showCounts") !== false;
  return (
    <ul className="chips board-chips">
      {ready.map((b) => (
        <li key={b.code}>
          {b.code === board
            ? <span className="chip on" aria-current="true">{b.label}{counts && b.lessons > 0 && <small> · {b.lessons} {ui("boardLessons", s.lang)}</small>}</span>
            : <button type="button" className="chip" onClick={() => setChosenBoard(b.code)}>{b.label}{counts && b.lessons > 0 && <small> · {b.lessons} {ui("boardLessons", s.lang)}</small>}</button>}
        </li>
      ))}
      {soon.map((b) => <li key={b.code}><span className="chip off" aria-disabled="true">{b.label} · {ui("soon", s.lang)}</span></li>)}
    </ul>
  );
}

/** Same list for the side panel (links to the board's first class that has lessons). */
export function BoardRailList() {
  const s = useSettings();
  const { ready, soon } = useVisibleBoards();
  const board = useActiveBoard();
  return (
    <ul className="rail-boards">
      {ready.map((b) => {
        const first = b.classes.find((c) => c.lessons > 0)?.classLevel;
        return (
          <li key={b.code}>
            {b.code === board
              ? <span className="rail-board on" aria-current="true">{b.label}</span>
              : <Link href={first ? `/${b.code.toLowerCase()}/${first}` : "/"} className="rail-board" onClick={() => setChosenBoard(b.code)}>{b.label}</Link>}
          </li>
        );
      })}
      {soon.map((b) => <li key={b.code}><span className="rail-board off" aria-disabled="true">{b.label}<small>{ui("soon", s.lang)}</small></span></li>)}
    </ul>
  );
}
