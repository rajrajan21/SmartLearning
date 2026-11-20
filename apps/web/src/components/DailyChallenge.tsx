import { useState } from "react";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { dailySteps } from "../lib/daily";
import type { PathNode } from "../lib/round2";

const key = (d: Date) => `ss_daily_puzzle_${d.toISOString().slice(0, 10)}`;
const read = (d: Date) => { try { return localStorage.getItem(key(d)) === "1"; } catch { return false; } };

/** "Today's 10 minutes": revise, one lesson, one puzzle. Each part and the minutes are admin settings. */
export function DailyChallenge({ due, next, lessonsToday, now = new Date() }: { due: number; next: PathNode | undefined; lessonsToday: number; now?: Date }) {
  const s = useSettings();
  const [pz, setPz] = useState(() => read(now));
  if (s.get("daily.enabled") !== true) return null;
  const steps = dailySteps({ revise: s.get("daily.revise") === true, lesson: s.get("daily.lesson") === true, puzzle: s.get("daily.puzzle") === true }, due, next, lessonsToday, pz);
  if (steps.length === 0) return null;
  const done = steps.filter((x) => x.done).length;
  const label = (x: (typeof steps)[number]) => x.id === "revise" ? `${ui("dailyRevise", s.lang)} (${x.n})` : x.id === "lesson" ? `${ui("dailyLesson", s.lang)}: ${s.name(x.node!.name)}` : ui("dailyPuzzle", s.lang);
  const markPuzzle = () => { setPz(true); try { localStorage.setItem(key(now), "1"); } catch { /* ignore */ } };
  return (
    <section className="paper-block daily" aria-label={ui("dailyTitle", s.lang)}>
      <h2>⏱ {ui("dailyTitle", s.lang).replace("{m}", String(s.get<number>("daily.minutes")))}</h2>
      <ul className="daily-steps">
        {steps.map((x) => (
          <li key={x.id} className={x.done ? "on" : ""}>
            <span aria-hidden="true">{x.done ? "✔" : "○"}</span>{" "}
            {x.id === "puzzle" ? <a href="#puzzle" onClick={markPuzzle}>{label(x)}</a> : <Link href={x.href}>{label(x)}</Link>}
            <span className="sr-only"> {x.done ? ui("dailyDone", s.lang) : ""}</span>
          </li>
        ))}
      </ul>
      <p className="small">{done === steps.length ? ui("dailyAll", s.lang) : `${done}/${steps.length}`}</p>
    </section>
  );
}
