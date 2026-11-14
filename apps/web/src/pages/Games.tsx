import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import type { PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { shuffled } from "../lib/practice";
import { saveScore, scopeKey, useChapterPool, getScore } from "../lib/chapterTools";
import { QuestionCard } from "../components/QuestionCard";
import { ErrorBox, Loading, NotFound } from "../components/bits";
import { useChapterScope } from "./Exam";

type Mode = "quickfire" | "survival";

export function GamePage() {
  const s = useSettings();
  const { lang } = s;
  const { mode = "" } = useParams<{ mode: string }>();
  const sc = useChapterScope();
  const m = mode as Mode;
  const valid = m === "quickfire" || m === "survival";
  const on = s.get("feature.games") === true && s.get("feature.practice") === true && valid && s.get(`games.${m}`) === true;
  const pool = useChapterPool(sc.board, sc.cls, sc.subject, sc.chapter, sc.topics, on && sc.tree.status === "ready");
  const [running, setRunning] = useState(false);
  const [deck, setDeck] = useState<PublicQuestion[]>([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(0);
  const [left, setLeft] = useState(0);
  const [over, setOver] = useState<{ best: number; isNewBest: boolean } | null>(null);
  const scope = scopeKey(`game-${mode}`, sc.board, sc.cls, sc.subject, sc.chapter);

  const questions = pool.status === "ready" ? pool.data : [];
  // quick formats first: tap-to-answer questions keep the game fast; fall back to everything if there are too few
  const fast = useMemo(() => { const f = questions.filter((q) => q.type === "mcq" || q.type === "true_false"); return f.length >= 4 ? f : questions; }, [questions]);

  const start = () => {
    setDeck(shuffled(fast)); setI(0); setScore(0); setOver(null);
    setLives(s.get<number>("games.lives")); setLeft(s.get<number>("games.quickfireSeconds")); setRunning(true);
  };
  const end = (finalScore: number) => { setRunning(false); setOver(saveScore(scope, finalScore)); };

  useEffect(() => {
    if (!running || m !== "quickfire") return;
    if (left <= 0) { end(score); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, left, m]);

  if (!on) return <NotFound />;
  if (sc.tree.status === "loading" || pool.status === "loading") return <Loading />;
  if (sc.tree.status === "error" || pool.status === "error") return <ErrorBox onRetry={sc.retry} />;
  if (!sc.ch) return <NotFound />;
  const title = m === "quickfire" ? ui("quickFire", lang) : ui("survival", lang);
  const help = m === "quickfire" ? ui("quickFireHelp", lang) : ui("survivalHelp", lang);
  if (fast.length === 0) return <div className="paper"><h1>{title}</h1><p className="soon-note">{ui("noQuestionsYet", lang)}</p><Link className="btn" href={sc.back}>{ui("backToChapter", lang)}</Link></div>;

  if (running) {
    const q = deck[i % deck.length]!;
    return (
      <div className="paper game">
        <div className="exam-bar">
          <b>{ui("gameScore", lang)}: {score}</b>
          {m === "quickfire" ? <span role="timer" className={left < 10 ? "timer low" : "timer"}>{ui("testTimeLeft", lang)}: {left}s</span> : <span aria-label={`${ui("livesLeft", lang)}: ${lives}`}>{"❤️".repeat(lives)}</span>}
        </div>
        <QuestionCard key={`${i}-${q.id}`} q={q} quick compact nextLabel={ui("nextQuestion", lang)}
          onDone={(r) => {
            const sc2 = score + (r.correct ? 1 : 0), l2 = lives - (r.correct ? 0 : 1);
            setScore(sc2);
            if (m === "survival") { setLives(l2); if (l2 <= 0) { end(sc2); return; } }
            setI(i + 1);
          }} />
      </div>
    );
  }
  const best = getScore(scope);
  return (
    <div className="paper game">
      <h1>{title}: {s.name(sc.ch.name)}</h1>
      {over ? <><p className="lead" role="status">{ui("gameOver", lang)}. {ui("gameScore", lang)}: {score}. {over.isNewBest ? ui("newBest", lang) : `${ui("bestScore", lang)}: ${over.best}`}</p></> : <p className="lead">{help}</p>}
      {!over && best && <p className="small">{ui("bestScore", lang)}: {best.best}</p>}
      <div className="actions"><button type="button" className="btn" onClick={start}>{over ? ui("playAgain", lang) : ui("playNow", lang)}</button><Link className="btn ghost" href={sc.back}>{ui("backToChapter", lang)}</Link></div>
    </div>
  );
}
