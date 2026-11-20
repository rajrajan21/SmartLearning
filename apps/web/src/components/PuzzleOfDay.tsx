import { useState } from "react";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { puzzleFor } from "../lib/puzzles";

export function PuzzleOfDay({ now = new Date() }: { now?: Date }) {
  const s = useSettings();
  const [show, setShow] = useState(false);
  if (s.get("puzzle.show") !== true) return null;
  const p = puzzleFor(now);
  return (
    <section id="puzzle" className="paper-block puzzle" aria-label={ui("puzzleTitle", s.lang)}>
      <h2>🧩 {ui("puzzleTitle", s.lang)}</h2>
      <p className="problem">{p.q[s.lang]}</p>
      {s.get("puzzle.showAnswer") === true && (show ? <p className="puzzle-a" role="status"><b>{ui("puzzleAnswer", s.lang)}:</b> {p.a[s.lang]}</p> : <button type="button" className="btn ghost sm" onClick={() => setShow(true)}>{ui("puzzleShow", s.lang)}</button>)}
    </section>
  );
}
