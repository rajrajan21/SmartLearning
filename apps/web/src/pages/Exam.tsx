import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import type { AnswerFeedback, AnswerResponse, PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard, useRetry } from "../lib/curriculum";
import { sendAnswer, shuffled } from "../lib/practice";
import { saveScore, scopeKey, useChapterPool, getScore } from "../lib/chapterTools";
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
  const [saved, setSaved] = useState<{ best: number; isNewBest: boolean } | null>(null);
  const scope = scopeKey("exam", sc.board, sc.cls, sc.subject, sc.chapter);
  const timed = s.get("exams.timed") === true;

  const questions = pool.status === "ready" ? pool.data : [];
  const count = Math.min(s.get<number>("exams.questionCount"), questions.length);

  const start = () => {
    answers.current = {};
    setPaper(shuffled(questions).slice(0, count)); setAt(0); setTimeUp(false); setFailed(false); setSaved(null); setMarked([]);
    setLeft(count * s.get<number>("exams.secondsPerQuestion")); setPhase("running");
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
      setSaved(saveScore(scope, Math.round((right / Math.max(1, out.length)) * 100)));
      setPhase("done");
    } catch { setFailed(true); setPhase("done"); }
  };

  useEffect(() => {
    if (phase !== "running" || !timed) return;
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
      <div className="actions"><button type="button" className="btn" onClick={start}>{ui("startTest", lang)}</button><Link className="btn ghost" href={sc.back}>{ui("backToChapter", lang)}</Link></div>
    </div>
  );

  if (phase === "running") {
    const q = paper[at]!;
    const next = () => { if (at + 1 >= paper.length) void finish(paper); else setAt(at + 1); };
    return (
      <div className="paper exam">
        <div className="exam-bar" role="group">
          <b>{ui("questionNofM", lang).replace("{a}", String(at + 1)).replace("{b}", String(paper.length))}</b>
          {timed && <span role="timer" className={left < 30 ? "timer low" : "timer"}>{ui("testTimeLeft", lang)}: {fmt(Math.max(0, left))}</span>}
        </div>
        <QuestionCard key={q.id} q={q} collect={(r) => { answers.current[q.id] = r; next(); }} onDone={() => undefined} />
        {s.get("exams.allowSkip") === true && <p><button type="button" className="btn ghost" onClick={next}>{ui("skipQuestion", lang)}</button></p>}
      </div>
    );
  }

  if (phase === "marking") return <div className="paper"><p role="status">{ui("markingTest", lang)}</p></div>;

  if (failed) return <div className="paper"><ErrorBox onRetry={() => void finish(paper)} /></div>;
  const right = marked.filter((m) => m.fb?.correct).length, pct = Math.round((right / Math.max(1, marked.length)) * 100), pass = pct >= s.get<number>("exams.passPercent");
  return (
    <div className="paper exam">
      <h1>{ui("chapterTest", lang)}: {name}</h1>
      <p className="lead" role="status">{ui("testScore", lang).replace("{a}", String(right)).replace("{b}", String(marked.length))} ({pct}%)</p>
      <p>{pass ? `🎉 ${ui("testPassed", lang)}` : ui("testTryAgain", lang)}{saved?.isNewBest ? ` ${ui("newBest", lang)}` : ""}</p>
      {timeUp && <p className="small">{ui("timeUp", lang)}</p>}
      {s.get("exams.showReview") === true && (
        <ol className="review">
          {marked.map((m) => (
            <li key={m.q.id} className={m.fb?.correct ? "ok" : "miss"}>
              <p className="problem">{s.name(m.q.stem)}</p>
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
      <div className="actions"><button type="button" className="btn" onClick={start}>{ui("testAgain", lang)}</button><Link className="btn ghost" href={sc.back}>{ui("backToChapter", lang)}</Link></div>
    </div>
  );
}
