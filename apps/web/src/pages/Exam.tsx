import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import type { AnswerFeedback, AnswerResponse, PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard, useRetry } from "../lib/curriculum";
import { sendAnswer, shuffled } from "../lib/practice";
import { saveScore, scopeKey, useChapterPool, getScore } from "../lib/chapterTools";
import { NextStep, nextChapter } from "../components/LessonFlow";
import { QuestionCard } from "../components/QuestionCard";
import { ErrorBox, Loading, NotFound } from "../components/bits";

type Phase = "intro" | "running" | "marking" | "done";
interface Marked { q: PublicQuestion; fb: AnswerFeedback | null }

export function useChapterScope() {
  const { board = "", cls = "", subject = "", chapter = "" } = useParams<{ board: string; cls: string; subject: string; chapter: string }>();
  const [attempt, retry] = useRetry();
  const tree = useBoard(board, attempt);
  const ch = tree.status === "ready" ? tree.data.classes.find((c) => String(c.classLevel) === cls)?.subjects.find((x) => x.slug === subject)?.chapters.find((c) => c.slug === chapter) : undefined;
  const topics = useMemo(() => ch?.topics.map((t) => t.slug) ?? [], [ch]);
  return { board, cls, subject, chapter, tree, ch, topics, retry, back: `/${board}/${cls}/${subject}/${chapter}` };
}

/** Balanced: an equal share from every round (easy to hard), then shuffled, like a real paper. */
export function chooseQuestions(all: PublicQuestion[], n: number, balanced: boolean): PublicQuestion[] {
  if (!balanced) return shuffled(all).slice(0, n);
  const by = [1, 2, 3, 4].map((r) => shuffled(all.filter((q) => q.round === r)));
  const out: PublicQuestion[] = [];
  while (out.length < Math.min(n, all.length)) { let moved = false; for (const g of by) { const q = g.shift(); if (q && out.length < n) { out.push(q); moved = true; } } if (!moved) break; }
  return out.sort((a, b) => a.round - b.round);
}

/** First round where the student got less than the pass share right; they start there. */
function startAt(marked: Marked[], pass: number, lang: "en" | "ta"): string {
  for (const r of [1, 2, 3, 4]) {
    const g = marked.filter((m) => m.q.round === r);
    if (g.length && (g.filter((m) => m.fb?.correct).length / g.length) * 100 < pass) return ui("startAtRound", lang).replace("{n}", String(r));
  }
  return ui("startAtChallenge", lang);
}

function fmt(sec: number) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }

export function ExamPage() {
  const s = useSettings();
  const { lang } = s;
  const sc = useChapterScope();
  const on = s.get("feature.exams") === true && s.get("feature.practice") === true;
  const pool = useChapterPool(sc.board, sc.cls, sc.subject, sc.chapter, sc.topics, on && sc.tree.status === "ready");
  const [phase, setPhase] = useState<Phase>("intro");
  const [paper, setPaper] = useState<PublicQuestion[]>([]);
  const [at, setAt] = useState(0);
  const answers = useRef<Record<string, AnswerResponse>>({});
  const [left, setLeft] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [marked, setMarked] = useState<Marked[]>([]);
  const [failed, setFailed] = useState(false);
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState(0);
  const [diag, setDiag] = useState(false);
  const [saved, setSaved] = useState<{ best: number; isNewBest: boolean } | null>(null);
  const scope = scopeKey("exam", sc.board, sc.cls, sc.subject, sc.chapter);
  const timed = s.get("exams.timed") === true;

  const questions = pool.status === "ready" ? pool.data : [];
  const count = Math.min(s.get("exams.studentChoosesLength") === true && pick ? pick : s.get<number>("exams.questionCount"), questions.length);

  const start = (quick = false) => {
    setDiag(quick === true);
    answers.current = {};
    setFlags(new Set());
    const n = quick === true ? Math.min(s.get<number>("exams.diagnostic.count"), questions.length) : count;
    setPaper(chooseQuestions(questions, n, quick === true ? true : (s.get("exams.blueprint") as unknown) !== "random")); setAt(0); setTimeUp(false); setFailed(false); setSaved(null); setMarked([]);
    setLeft(n * s.get<number>("exams.secondsPerQuestion")); setPhase("running");
  };

  const finish = async (paperNow: PublicQuestion[]) => {
    setPhase("marking");
    try {
      const out: Marked[] = [];
      for (const q of paperNow) {
        const r = answers.current[q.id];
        out.push({ q, fb: r ? await sendAnswer(q.id, crypto.randomUUID(), 0, r) : null });
      }
      const right = out.filter((m) => m.fb?.correct).length;
      setMarked(out);
      if (!diag) setSaved(saveScore(scope, Math.round((right / Math.max(1, out.length)) * 100)));
      setPhase("done");
    } catch { setFailed(true); setPhase("done"); }
  };

  useEffect(() => {
    if (phase !== "running" || !timed || diag) return;
    if (left <= 0) { setTimeUp(true); void finish(paper); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left, timed]);

  if (!on) return <NotFound />;
  if (sc.tree.status === "loading" || pool.status === "loading") return <Loading />;
  if (sc.tree.status === "error" || pool.status === "error") return <ErrorBox onRetry={sc.retry} />;
  if (!sc.ch) return <NotFound />;
  const name = s.name(sc.ch.name), best = getScore(scope);

  if (questions.length === 0) return <div className="paper"><h1>{ui("chapterTest", lang)}: {name}</h1><p className="soon-note">{ui("noQuestionsYet", lang)}</p><Link className="btn" href={sc.back}>{ui("backToChapter", lang)}</Link></div>;

  if (phase === "intro") return (
    <div className="paper">
      <h1>{ui("chapterTest", lang)}: {name}</h1>
      <p className="lead">{ui("testIntro", lang).replace("{n}", String(count))}</p>
      <p className="small">{timed ? `${ui("testTimeLeft", lang)}: ${fmt(count * s.get<number>("exams.secondsPerQuestion"))}` : ui("untimed", lang)}{best ? ` · ${ui("bestScore", lang)}: ${best.best}%` : ""}</p>
      {s.get("exams.studentChoosesLength") === true && <p className="actions" role="group" aria-label={ui("howManyQuestions", lang)}>{[5, 10, 15, 20].filter((k) => k <= questions.length).map((k) => <button key={k} type="button" className={`btn ghost${count === k ? " on" : ""}`} onClick={() => setPick(k)}>{k}</button>)}</p>}
      <div className="actions"><button type="button" className="btn" onClick={() => start()}>{ui("startTest", lang)}</button>{s.get("exams.diagnostic.enabled") === true && <button type="button" className="btn ghost" onClick={() => start(true)}>{ui("quickCheck", lang)}</button>}<Link className="btn ghost" href={sc.back}>{ui("backToChapter", lang)}</Link></div>
    </div>
  );

  if (phase === "running") {
    const q = paper[at]!;
    const next = () => { if (at + 1 >= paper.length) void finish(paper); else setAt(at + 1); };
    return (
      <div className="paper exam">
        <div className="exam-bar" role="group">
          <b>{ui("questionNofM", lang).replace("{a}", String(at + 1)).replace("{b}", String(paper.length))}</b>
          {timed && !diag && <span role="timer" className={left < 30 ? "timer low" : "timer"}>{ui("testTimeLeft", lang)}: {fmt(Math.max(0, left))}</span>}
        </div>
        <QuestionCard key={q.id} q={q} collect={(r) => { answers.current[q.id] = r; next(); }} onDone={() => undefined} />
        {s.get("exams.markForReview") === true && <p><button type="button" className="btn ghost" aria-pressed={flags.has(q.id)} onClick={() => setFlags((f) => { const n = new Set(f); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n; })}>{flags.has(q.id) ? "🚩 " : "⚑ "}{ui("flagQuestion", lang)}</button></p>}
        {s.get("exams.allowSkip") === true && <p><button type="button" className="btn ghost" onClick={next}>{ui("skipQuestion", lang)}</button></p>}
      </div>
    );
  }

  if (phase === "marking") return <div className="paper"><p role="status">{ui("markingTest", lang)}</p></div>;

  if (failed) return <div className="paper"><ErrorBox onRetry={() => void finish(paper)} /></div>;
  const next = nextChapter(sc.tree.data, sc.board, Number(sc.cls), sc.subject, sc.chapter, ui("nextChapter", lang));
  const right = marked.filter((m) => m.fb?.correct).length, pct = Math.round((right / Math.max(1, marked.length)) * 100), pass = pct >= s.get<number>("exams.passPercent");
  return (
    <div className="paper exam">
      <h1>{ui("chapterTest", lang)}: {name}</h1>
      <p className="lead" role="status">{ui("testScore", lang).replace("{a}", String(right)).replace("{b}", String(marked.length))} ({pct}%)</p>
      {diag && <p className="lead" role="status">{startAt(marked, s.get<number>("exams.diagnostic.passPercent"), lang)}</p>}
      {!diag && <p>{pass ? `🎉 ${ui("testPassed", lang)}` : ui("testTryAgain", lang)}{saved?.isNewBest ? ` ${ui("newBest", lang)}` : ""}</p>}
      {timeUp && <p className="small">{ui("timeUp", lang)}</p>}
      {!diag && next && <NextStep action={next} />}
      {s.get("exams.showReview") === true && (
        <ol className="review">
          {marked.map((m) => (
            <li key={m.q.id} className={m.fb?.correct ? "ok" : "miss"}>
              <p className="problem">{flags.has(m.q.id) ? "🚩 " : ""}{s.name(m.q.stem)}</p>
              {!m.fb ? <p className="small">{ui("notAnswered", lang)}</p> : (
                <>
                  <p><b>{m.fb.correct ? `✓ ${ui("correct", lang)}` : ui("notQuite", lang)}</b></p>
                  {!m.fb.correct && <p><b>{ui("rightAnswerIs", lang)}:</b> {s.name(m.fb.correctAnswer)}</p>}
                  <p className="small">{s.name(m.fb.explanation)}</p>
                </>
              )}
            </li>
          ))}
        </ol>
      )}
      <div className="actions"><button type="button" className="btn" onClick={() => start(diag)}>{ui("testAgain", lang)}</button><Link className="btn ghost" href={sc.back}>{ui("backToChapter", lang)}</Link></div>
    </div>
  );
}
