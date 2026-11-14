import { Link } from "wouter";
import { chapterPct, type Mastery, type MasteryLevel } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui, type UiKey } from "../lib/i18n";
import { useBoard, useRetry } from "../lib/curriculum";
import { useMastery } from "../lib/mastery";
import { useDueCount } from "../lib/revision";
import { ErrorBox, Loading, NotFound } from "../components/bits";

export const LEVEL_KEY: Record<MasteryLevel, UiKey> = { new: "lvlNew", learning: "lvlLearning", practising: "lvlPractising", strong: "lvlStrong", mastered: "lvlMastered" };
export function MasteryTag({ m }: { m: Mastery }) {
  const s = useSettings();
  return <span className={`mtag m-${m.level}`}>{ui(LEVEL_KEY[m.level], s.lang)}</span>;
}

export function ProgressPage() {
  const s = useSettings();
  const { lang } = s;
  const board = s.get<string>("catalog.defaultBoard");
  const [attempt, retry] = useRetry();
  const state = useBoard(board, attempt);
  const of = useMastery(true);
  const due = useDueCount();
  const open = s.get<number[]>("catalog.openClasses");
  if (s.get("feature.mastery") !== true || s.get("mastery.progressPage") !== true) return <NotFound />;
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  const classes = state.data.classes.filter((c) => open.includes(c.classLevel));
  let any = false;
  return (
    <div className="paper progress">
      <h1>{ui("myProgress", lang)}</h1>
      <p className="lead">{ui("progressIntro", lang)}</p>
      {s.get("mastery.revision.enabled") === true && due > 0 && <p className="actions"><Link className="btn" href="/revise">{ui("reviseToday", lang)} ({due})</Link></p>}
      {classes.map((c) => (
        <section key={c.classLevel}>
          <h2>{ui("classWord", lang)} {c.classLevel}</h2>
          {c.subjects.map((sub) => {
            const chapters = sub.chapters.map((ch) => ({ ch, ms: ch.topics.map((t) => of(t.id)).filter((m): m is Mastery => m !== null) })).filter((x) => x.ms.length > 0);
            if (chapters.length === 0) return null;
            any = true;
            return (
              <div key={sub.id} className="p-subject">
                <h3>{s.name(sub.name)}</h3>
                <ul className="p-list">
                  {chapters.map(({ ch, ms }) => {
                    const pct = chapterPct(ms), best = ms.every((m) => m.level === "mastered") ? "mastered" : ms.every((m) => m.level === "mastered" || m.level === "strong") ? "strong" : ms.some((m) => m.level !== "new") ? "practising" : "new";
                    return (
                      <li key={ch.id}>
                        <Link href={`/${board.toLowerCase()}/${c.classLevel}/${sub.slug}/${ch.slug}`}>{s.name(ch.name)}</Link>
                        <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={s.name(ch.name)}><span style={{ width: `${pct}%` }} /></div>
                        <span className="small">{pct}% · <MasteryTag m={{ level: best, pct }} /></span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
      {!any && <p className="soon-note">{ui("progressNone", lang)}</p>}
    </div>
  );
}
