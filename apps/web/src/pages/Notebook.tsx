import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard, useRetry } from "../lib/curriculum";
import { useAllProgress } from "../lib/progress";
import { useAllResults } from "../lib/practice";
import { totalStars } from "../lib/streak";
import { flatTopics } from "../lib/round2";
import { levelOf, toggleNote, useNotebook } from "../lib/tier2";
import { useAccountOptional } from "../lib/account";
import { NotFound, Title } from "../components/bits";

/** Saved favourite lessons (device only) and a printable "what I learned" sheet. */
export function NotebookPage() {
  const s = useSettings();
  const board = s.get<string>("catalog.defaultBoard");
  const [attempt] = useRetry();
  const state = useBoard(board, attempt);
  const notes = useNotebook();
  const progress = useAllProgress(), results = useAllResults();
  const acct = useAccountOptional();
  if (s.get("notebook.enabled") !== true || s.get("feature.lessons") !== true) return <NotFound />;
  const saved = Object.values(notes).sort((a, b) => b.savedAt - a.savedAt);
  const finished = state.status === "ready" ? flatTopics(state.data as never, board).filter((f) => progress[f.id]?.done) : [];
  const stars = totalStars(results as never);
  const lv = levelOf(Object.values(progress).filter((p) => p.done).length, stars);
  return (
    <div className="paper notebook-page">
      <h1>{ui("nbTitle", s.lang)}</h1>
      <p className="lead">{ui("nbIntro", s.lang)}</p>
      {saved.length === 0 ? <p className="soon-note">{ui("nbEmpty", s.lang)}</p> : (
        <ul className="nb-list noprint">
          {saved.map((n) => (
            <li key={n.id}>
              <Link href={n.href} className="nb-link"><span aria-hidden="true">❤️</span> <b><Title name={n.title} /></b> <span className="small"><Title name={n.subject} /></span></Link>
              <button type="button" className="btn ghost sm" onClick={() => toggleNote(n)} aria-label={`${ui("nbRemove", s.lang)}: ${s.name(n.title)}`}>✕</button>
            </li>
          ))}
        </ul>
      )}
      <section className="learned-sheet" aria-label={ui("learnedTitle", s.lang)}>
        <h2>{ui("learnedTitle", s.lang)}{acct?.active ? ` - ${acct.active.nickname}` : ""}</h2>
        <p className="small">{ui("levelWord", s.lang)} {lv.level} · ⭐ {stars}</p>
        {finished.length === 0 ? <p className="small">{ui("learnedNone", s.lang)}</p> : (
          <ul>{finished.map((f) => <li key={f.id}>✔ <Title name={f.topic} /> <span className="small">(<Title name={f.subject} />)</span></li>)}</ul>
        )}
        <p className="noprint"><button type="button" className="btn" onClick={() => window.print()}>{ui("printSheet", s.lang)}</button></p>
      </section>
    </div>
  );
}
