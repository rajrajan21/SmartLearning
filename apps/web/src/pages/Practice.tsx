import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import type { PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui, type UiKey } from "../lib/i18n";
import { useBoard, useRetry, useTopic } from "../lib/curriculum";
import { pickRound, saveRound, starsFor, usePractice, usePracticeResults } from "../lib/practice";
import { QuestionCard } from "../components/QuestionCard";
import { subjectVar } from "../lib/theme";
import { Crumbs, ErrorBox, Loading, NotFound, Title } from "../components/bits";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(3 - n);

export function PracticePage() {
  const s = useSettings();
  const { board = "cbse", cls = "0", subject = "", chapter = "", topic = "" } = useParams<{ board: string; cls: string; subject: string; chapter: string; topic: string }>();
  const level = Number(cls);
  const [attempt, retry] = useRetry();
  useBoard(board, attempt);
  const allowed = s.get<number[]>("catalog.openClasses").includes(level);
  const detail = useTopic(board, level, subject, chapter, topic);
  const on = s.get("feature.practice");
  const set = usePractice(board, level, subject, chapter, topic, on);
  const results = usePracticeResults(set.status === "ready" ? set.data?.topicId : undefined);
  const [round, setRoundState] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const setRound = (r: number | null) => { setRoundState(r); setRun((n) => n + 1); }; // a new run always remounts, so "play again" reshuffles
  if (!allowed || !on) return <NotFound />;
  if (detail.status === "loading" || set.status === "loading") return <Loading />;
  if (detail.status === "error" || set.status === "error") return <ErrorBox onRetry={retry} />;
  const d = detail.data, base = `/${board}/${level}/${d.subject.slug}`, topicHref = `${base}/${d.chapter.slug}/${d.topic.slug}`;
  const crumbs = [{ href: "/", label: ui("home", s.lang) }, { href: base, label: s.name(d.subject.name) }, { href: `${base}/${d.chapter.slug}`, label: s.name(d.chapter.name) }, { href: topicHref, label: s.name(d.topic.name) }, { label: ui("practiceTitle", s.lang) }];
  if (!set.data) return <div className="paper"><Crumbs items={crumbs} /><h1 className="cover-title"><Title name={d.topic.name} /></h1><p className="soon-note">{ui("practiceSoon", s.lang)}</p></div>;

  const pass = s.get<number>("practice.passMark"), per = s.get<number>("practice.questionsPerRound");
  const rounds = [1, 2, 3, 4].filter((r) => set.data!.questions.some((q) => q.round === r));
  const open = (r: number) => s.get<string>("practice.unlock") === "open" || rounds.indexOf(r) === 0 || results[rounds[rounds.indexOf(r) - 1]!]?.passed === true;
  return (
    <div className="paper" style={{ ["--cover" as string]: subjectVar(d.subject.slug) }}>
      <Crumbs items={crumbs} />
      <h1 className="cover-title"><Title name={d.topic.name} /></h1>
      {round === null ? (
        <>
          <ul className="rounds">
            {rounds.map((r) => {
              const res = results[r], unlocked = open(r);
              return (
                <li key={r} className={`round${unlocked ? "" : " locked"}`}>
                  <div><h2>{ui("roundWord", s.lang)} {r}: {ui(`round${r}` as UiKey, s.lang)}</h2>
                    {res && <p className="small">{ui("bestScore", s.lang)}: {res.best}%{s.get("practice.stars") && <span className="stars" role="img" aria-label={`${res.stars} ${ui("starsLabel", s.lang)}`}> {stars(res.stars)}</span>}{res.passed && <span className="tick"> ✓</span>}</p>}
                    {!unlocked && <p className="small">🔒 {ui("roundLocked", s.lang)}</p>}</div>
                  <button type="button" className="btn" disabled={!unlocked} onClick={() => setRound(r)}>{res && s.get("practice.allowRetry") ? ui("playAgain", s.lang) : ui("startRound", s.lang)}</button>
                </li>
              );
            })}
          </ul>
          <p><Link className="link" href={topicHref}>← {s.name(d.topic.name)}</Link></p>
        </>
      ) : (
        <Round key={`${round}-${run}`} topicId={set.data.topicId} round={round} pool={set.data.questions} per={per} pass={pass} nextRound={rounds[rounds.indexOf(round) + 1] ?? null}
          onExit={() => setRound(null)} onNext={(r) => setRound(r)} lessonHref={`${topicHref}/learn`} />
      )}
    </div>
  );
}

function Round({ topicId, round, pool, per, pass, nextRound, onExit, onNext, lessonHref }: { topicId: string; round: number; pool: PublicQuestion[]; per: number; pass: number; nextRound: number | null; onExit: () => void; onNext: (r: number) => void; lessonHref: string }) {
  const s = useSettings();
  const mix = s.get("practice.shuffleQuestions");
  const [list, setList] = useState<PublicQuestion[]>(() => pickRound(pool, round, per, mix));
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [missed, setMissed] = useState<PublicQuestion[]>([]);
  const [first, setFirst] = useState(true); // the saved score is the first pass through the round; retries are for learning
  const [score, setScore] = useState<{ pct: number; stars: number; got: number; total: number } | null>(null);
  const total = list.length;

  const answered = (q: PublicQuestion, correct: boolean) => {
    const nr = right + (correct ? 1 : 0), nm = correct ? missed : [...missed, q];
    setRight(nr); setMissed(nm);
    if (i === total - 1 && first) {
      const pct = Math.round((nr / Math.max(1, total)) * 100);
      const res = saveRound(topicId, round, pct, pass);
      setScore({ pct, stars: starsFor(pct, pass), got: nr, total });
      void res;
    }
    setI(i + 1);
  };

  if (i >= total && score) {
    const passed = score.pct >= pass;
    return (
      <div className="roundend" aria-live="polite">
        <h2>{passed ? ui("passedRound", s.lang) : ui("roundWord", s.lang) + " " + round}</h2>
        <p className="lead">{ui("roundScore", s.lang)} {score.got} {ui("outOf", s.lang)} {score.total} ({score.pct}%)</p>
        {s.get("practice.stars") && <p className="stars big" role="img" aria-label={`${score.stars} ${ui("starsLabel", s.lang)}`}>{stars(score.stars)}</p>}
        {!passed && <p className="soon-note">{ui("notYetPassed", s.lang)}</p>}
        <div className="actions">
          {missed.length > 0 && s.get("practice.allowRetry") && <button type="button" className="btn" onClick={() => { setList(missed); setMissed([]); setI(0); setRight(0); setFirst(false); }}>{ui("retryMissed", s.lang)}</button>}
          {passed && nextRound && <button type="button" className="btn" onClick={() => onNext(nextRound)}>{ui("nextRound", s.lang)}</button>}
          {!passed && <Link className="btn ghost" href={lessonHref}>{ui("reviewLesson", s.lang)}</Link>}
          {s.get("practice.allowRetry") && <button type="button" className="btn ghost" onClick={() => onNext(round)}>{ui("playAgain", s.lang)}</button>}
          <button type="button" className="btn ghost" onClick={onExit}>{ui("allRounds", s.lang)}</button>
        </div>
      </div>
    );
  }
  if (i >= total) { // finished a retry of the missed ones
    return (
      <div className="roundend" aria-live="polite">
        <p className="lead">{ui("roundScore", s.lang)} {right} {ui("outOf", s.lang)} {total}</p>
        <div className="actions">
          {missed.length > 0 && <button type="button" className="btn" onClick={() => { setList(missed); setMissed([]); setI(0); setRight(0); }}>{ui("retryMissed", s.lang)}</button>}
          <button type="button" className="btn ghost" onClick={() => onNext(round)}>{ui("playAgain", s.lang)}</button>
          <button type="button" className="btn ghost" onClick={onExit}>{ui("allRounds", s.lang)}</button>
        </div>
      </div>
    );
  }
  const q = list[i]!;
  return (
    <div>
      <p className="small step-count">{ui("roundWord", s.lang)} {round} · {ui("questionOf", s.lang)} {i + 1} {ui("ofWord", s.lang)} {total}</p>
      <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i}><span style={{ width: `${(i / total) * 100}%` }} /></div>
      <QuestionCard key={`${q.id}-${i}-${first}`} q={q} nextLabel={i === total - 1 ? ui("seeResults", s.lang) : undefined} onDone={(r) => answered(q, r.correct)} />
    </div>
  );
}
