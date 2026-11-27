import { useEffect, useMemo, useRef, useState } from "react";
import { defaultMarksFor, type AnswerFeedback, type AnswerResponse, type PublicQuestion, type QuestionTier } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard } from "../lib/curriculum";
import { fetchStudyKey, formatStudentAnswer, sendAnswer, shuffled, usePractice, type StudyKeyItem } from "../lib/practice";
import { saveScore, scopeKey, useChapterPool } from "../lib/chapterTools";
import { recordMistake } from "../lib/mistakes";
import { useAccount } from "../lib/account";
import { QuestionCard } from "./QuestionCard";
import { Loading } from "./bits";

type Attempts = Map<string, { response: string; id: string }>;
function useGradingAttempts() {
  const attempts = useRef<Attempts>(new Map());
  return {
    reset: () => attempts.current.clear(),
    send: (questionId: string, response: AnswerResponse) => {
      const signature = JSON.stringify(response);
      const prior = attempts.current.get(questionId);
      const id = prior?.response === signature ? prior.id : crypto.randomUUID();
      attempts.current.set(questionId, { response: signature, id });
      return sendAnswer(questionId, id, 0, response);
    },
  };
}

async function gradeAll<T>(pending: Promise<T>[]): Promise<T[]> {
  const results = await Promise.allSettled(pending);
  return results.map(result => {
    if (result.status === "rejected") throw result.reason;
    return result.value;
  });
}

export type LessonTab = "lesson" | "practice" | "worksheet" | "exam";

const TIER_ORDER: Record<string, number> = { textbook: 0, exam: 1, advanced: 2 };
const TIER_META: Record<QuestionTier, { badge: string; heading: string; sub: string }> = {
  textbook: { badge: "📘 Textbook", heading: "Part A — Textbook Questions", sub: "Core textbook & NCERT exercises" },
  exam: { badge: "📝 Exam Extra", heading: "Part B — Extra Exam & Online Questions", sub: "School test & board-style practice" },
  advanced: { badge: "🚀 Advanced", heading: "Part C — Level 2 Challenge / HOTS", sub: "Reverse & multi-step thinking problems" },
};

function pickBalanced(all: PublicQuestion[], count: number): PublicQuestion[] {
  const hasTiers = all.some((q) => q.tier);
  if (!hasTiers) return shuffled(all).slice(0, count);
  const tb = shuffled(all.filter((q) => (q.tier ?? "textbook") === "textbook"));
  const ex = shuffled(all.filter((q) => q.tier === "exam"));
  const adv = shuffled(all.filter((q) => q.tier === "advanced"));
  const wTb = Math.min(tb.length, Math.max(2, Math.ceil(count * 0.45)));
  const wEx = Math.min(ex.length, Math.max(1, Math.ceil(count * 0.35)));
  const wAdv = Math.min(adv.length, Math.max(1, count - wTb - wEx));
  let picked = [...tb.slice(0, wTb), ...ex.slice(0, wEx), ...adv.slice(0, wAdv)];
  if (picked.length < Math.min(count, all.length)) {
    const used = new Set(picked.map((q) => q.id));
    picked = [...picked, ...shuffled(all.filter((q) => !used.has(q.id))).slice(0, count - picked.length)];
  }
  return picked.sort((a, b) => (TIER_ORDER[a.tier ?? "textbook"] ?? 0) - (TIER_ORDER[b.tier ?? "textbook"] ?? 0));
}

export function LessonAssessments({
  tab,
  board,
  cls,
  subject,
  chapter,
  topic,
}: {
  tab: Exclude<LessonTab, "lesson">;
  board: string;
  cls: number;
  subject: string;
  chapter: string;
  topic: string;
}) {
  const s = useSettings();
  const { lang } = s;
  const practiceOn = s.get("feature.practice") === true;
  const topicSet = usePractice(board, cls, subject, chapter, topic, practiceOn && tab === "practice");
  const tree = useBoard(board, 0);
  const topics = useMemo(() => {
    if (tree.status !== "ready") return [];
    return tree.data.classes.find((c) => c.classLevel === cls)?.subjects.find((x) => x.slug === subject)?.chapters.find((c) => c.slug === chapter)?.topics.map((t) => t.slug) ?? [];
  }, [tree, cls, subject, chapter]);
  const pool = useChapterPool(board, String(cls), subject, chapter, topics, practiceOn && tree.status === "ready");

  if (!practiceOn) return null;
  if (tab === "practice") {
    if (topicSet.status === "loading" && pool.status === "loading") return <Loading />;
    const qs = (topicSet.status === "ready" && topicSet.data?.questions.length ? topicSet.data.questions : pool.status === "ready" ? pool.data : []);
    return <PracticeSheetPanel questions={qs} />;
  }
  if (pool.status === "loading") return <Loading />;
  const all = pool.status === "ready" ? pool.data : [];
  if (tab === "worksheet") return <WorksheetPanel all={all} count={s.get<number>("worksheets.questionCount") || 12} lang={lang} />;
  return <ChapterTestPanel all={all} count={s.get<number>("exams.questionCount") || 10} board={board} cls={String(cls)} subject={subject} chapter={chapter} />;
}

function PracticeSheetPanel({ questions }: { questions: PublicQuestion[] }) {
  const [tierFilter, setTierFilter] = useState<"all" | QuestionTier>("all");
  const counts = {
    all: questions.length,
    textbook: questions.filter((q) => (q.tier ?? "textbook") === "textbook").length,
    exam: questions.filter((q) => q.tier === "exam").length,
    advanced: questions.filter((q) => q.tier === "advanced").length,
  };
  const visible = (tierFilter === "all" ? questions : questions.filter((q) => (q.tier ?? "textbook") === tierFilter))
    .slice()
    .sort((a, b) => (TIER_ORDER[a.tier ?? "textbook"] ?? 0) - (TIER_ORDER[b.tier ?? "textbook"] ?? 0) || a.round - b.round);

  return (
    <section className="assess-panel" aria-label="Self-Study Practice">
      <div className="assess-head">
        <div>
          <h2>Self-Study Practice · MCQ + Fill-in-the-Blank</h2>
          <p className="small">Use <b>💡 Need a Hint?</b> or <b>👁 Step-by-Step Solution</b> anytime while practising.</p>
        </div>
        <div className="tier-chips" role="group" aria-label="Filter questions by tier">
          {([
            ["all", `All (${counts.all})`],
            ["textbook", `📘 Textbook First (${counts.textbook})`],
            ["exam", `📝 Exam Extra (${counts.exam})`],
            ["advanced", `🚀 Advanced (${counts.advanced})`],
          ] as const).filter(([k]) => k === "all" || counts[k] > 0).map(([k, label]) => (
            <button key={k} type="button" className={`chip${tierFilter === k ? " on" : ""}`} aria-pressed={tierFilter === k} onClick={() => setTierFilter(k)}>{label}</button>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="soon-note">Questions for this lesson are being added soon.</p>
      ) : (
        <div className="assess-list">
          {visible.map((q, i) => (
            <div key={q.id} className="assess-item">
              <div className="assess-qnum">Q{i + 1}</div>
              <QuestionCard q={q} compact inline onDone={() => {}} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WorksheetPanel({ all, count, lang }: { all: PublicQuestion[]; count: number; lang: "en" | "ta" }) {
  const s = useSettings();
  const acct = useAccount();
  const [paper, setPaper] = useState<PublicQuestion[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AnswerResponse>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, AnswerFeedback> | null>(null);
  const [studyKey, setStudyKey] = useState<Record<string, StudyKeyItem> | null>(null);
  const [busy, setBusy] = useState(false);
  const [gradingError, setGradingError] = useState(false);
  const grader = useGradingAttempts();

  const rebuild = () => {
    grader.reset();
    setGradingError(false);
    setPaper(pickBalanced(all, count));
    setDrafts({});
    setTexts({});
    setGraded(null);
    setStudyKey(null);
  };

  useEffect(() => { if (all.length > 0) rebuild(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [all.length]);

  const toggleAnswerKey = async () => {
    if (studyKey) { setStudyKey(null); return; }
    try {
      setStudyKey(await fetchStudyKey(paper.map((q) => q.id)));
    } catch { /* ignore */ }
  };

  const checkAll = async () => {
    if (!paper.length || busy) return;
    setBusy(true);
    setGradingError(false);
    try {
      const results = await gradeAll(paper.map(async (q) => {
        const res = drafts[q.id];
        if (!res) return [q.id, null] as const;
        const fb = await grader.send(q.id, res);
        if (!fb.correct && s.get("feature.mastery") === true && s.get("mistakes.enabled") === true) recordMistake(q, fb, s.get<number>("mistakes.max") || 60);
        return [q.id, fb] as const;
      }));
      const map: Record<string, AnswerFeedback> = {};
      for (const [id, fb] of results) if (fb) map[id] = fb;
      setGraded(map);
      if (!studyKey) void toggleAnswerKey();
    } catch {
      setGradingError(true);
    } finally {
      setBusy(false);
    }
  };

  const totalMarks = paper.reduce((sum, q) => sum + defaultMarksFor(q), 0);
  const earnedMarks = graded ? paper.reduce((sum, q) => sum + (graded[q.id]?.marksAwarded ?? (graded[q.id]?.correct ? defaultMarksFor(q) : 0)), 0) : 0;
  const groups = (["textbook", "exam", "advanced"] as const).map((t) => ({ tier: t, items: paper.filter((q) => (q.tier ?? "textbook") === t) })).filter((g) => g.items.length > 0);
  const answerVisible = !!studyKey || !!graded;

  const learnerName = acct.me?.profiles.find((p) => p.id === acct.me?.activeProfileId)?.nickname;
  return (
    <section className="assess-panel" aria-label="Printable Worksheet">
      <div className="assess-head no-print">
        <div>
          <h2>Chapter Printable Worksheet · {paper.length} Questions ({totalMarks} Marks)</h2>
          <p className="small">Solve interactively below or print cleanly for pen-and-paper practice.{learnerName ? ` Learner: ${learnerName}` : ""}</p>
        </div>
        <div className="assess-actions">
          <button type="button" className="btn" onClick={() => void checkAll()} disabled={busy || paper.length === 0}>{busy ? "Checking…" : "✓ Check Worksheet"}</button>
          <button type="button" className="btn ghost" onClick={() => void toggleAnswerKey()}>{studyKey ? "🙈 Hide Answer Key" : "👁 Show Answer Key"}</button>
          <button type="button" className="btn ghost" onClick={() => window.print()}>🖨 {ui("print", lang)}</button>
          <button type="button" className="btn ghost" onClick={rebuild}>↻ New Mix</button>
        </div>
      </div>

      {gradingError && <p role="alert">We could not check the worksheet. Your answers are still here. Try again.</p>}
      {graded && (
        <div className="score-banner">
          <strong>Worksheet Score: {earnedMarks} / {totalMarks} marks ({totalMarks ? Math.round((earnedMarks / totalMarks) * 100) : 0}%)</strong>
        </div>
      )}

      {paper.length === 0 ? (
        <p className="soon-note">Worksheet questions are being added soon.</p>
      ) : (
        groups.map((g) => (
          <div key={g.tier} className="ws-group">
            <h3 className="ws-group-title">{TIER_META[g.tier].heading} <span className="small">· {TIER_META[g.tier].sub}</span></h3>
            {g.items.map((q) => {
              const qNum = paper.indexOf(q) + 1;
              const marks = defaultMarksFor(q);
              const fb = graded?.[q.id];
              const ans = studyKey?.[q.id];
              const picked = drafts[q.id];
              return (
                <article key={q.id} className="ws-qcard">
                  <div className="ws-qhead">
                    <strong>Q{qNum}. {s.name(q.stem)}</strong>
                    <span className="q-badge marks">{marks} {marks === 1 ? "mark" : "marks"}</span>
                  </div>
                  {q.type === "mcq" && (
                    <div className="opts no-print">
                      {q.options.map((o) => {
                        const isPicked = picked?.type === "mcq" && picked.optionId === o.id;
                        return (
                          <button key={o.id} type="button" className={`opt${isPicked ? " on" : ""}`} disabled={busy || !!graded}
                            onClick={() => setDrafts((d) => ({ ...d, [q.id]: { type: "mcq", optionId: o.id } }))}>{s.name(o.text)}</button>
                        );
                      })}
                    </div>
                  )}
                  {(q.type === "fill" || q.type === "short" || q.type === "number") && (
                    <div className="typed-row no-print">
                      <input className="fill-in" value={texts[q.id] ?? ""} disabled={busy || !!graded} placeholder="Type your answer…"
                        onChange={(e) => {
                          const val = e.target.value;
                          setTexts((t) => ({ ...t, [q.id]: val }));
                          if (!val.trim() || (q.type === "number" && !Number.isFinite(Number(val)))) {
                            setDrafts(({ [q.id]: _old, ...rest }) => rest);
                            return;
                          }
                          if (q.type === "number" && Number.isFinite(Number(val))) setDrafts((d) => ({ ...d, [q.id]: { type: "number", value: Number(val) } }));
                          else if (q.type === "fill") setDrafts((d) => ({ ...d, [q.id]: { type: "fill", text: val.trim() } }));
                          else setDrafts((d) => ({ ...d, [q.id]: { type: "short", text: val.trim() } }));
                        }} />
                    </div>
                  )}
                  {q.type === "true_false" && (
                    <div className="opts row no-print">
                      {([true, false] as const).map((v) => {
                        const isPicked = picked?.type === "true_false" && picked.value === v;
                        return (
                          <button key={String(v)} type="button" className={`opt${isPicked ? " on" : ""}`} disabled={busy || !!graded}
                            onClick={() => setDrafts((d) => ({ ...d, [q.id]: { type: "true_false", value: v } }))}>{v ? "True" : "False"}</button>
                        );
                      })}
                    </div>
                  )}
                  {!answerVisible && <div className="print-lines" aria-hidden="true" />}
                  {fb && (
                    <p className={`ws-fb ${fb.correct ? "yes" : "no"}`}>
                      {fb.correct ? "✓ Correct" : `✗ Incorrect · Answer: ${s.name(fb.correctAnswer)}`} — {s.name(fb.explanation)}
                    </p>
                  )}
                  {ans && !fb && (
                    <div className="solution-box">
                      <p><b>Answer:</b> {s.name(ans.answer)}</p>
                      {ans.solutionSteps?.length ? <ol className="solution-steps">{ans.solutionSteps.map((st, idx) => <li key={idx}>{s.name(st)}</li>)}</ol> : <p>{s.name(ans.explanation)}</p>}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ))
      )}
    </section>
  );
}

function ChapterTestPanel({ all, count, board, cls, subject, chapter }: { all: PublicQuestion[]; count: number; board: string; cls: string; subject: string; chapter: string }) {
  const s = useSettings();
  const [paper, setPaper] = useState<PublicQuestion[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AnswerResponse>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<{ q: PublicQuestion; response?: AnswerResponse; fb: AnswerFeedback | null }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [gradingError, setGradingError] = useState(false);
  const grader = useGradingAttempts();

  const rebuild = () => {
    grader.reset();
    setGradingError(false);
    setPaper(pickBalanced(all, count));
    setDrafts({});
    setTexts({});
    setMarked(null);
  };
  useEffect(() => { if (all.length > 0) rebuild(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [all.length]);

  const submitTest = async () => {
    if (!paper.length || busy) return;
    setBusy(true);
    setGradingError(false);
    try {
      const res = await gradeAll(paper.map(async (q) => {
        const response = drafts[q.id];
        if (!response) return { q, response, fb: null };
        const fb = await grader.send(q.id, response);
        if (!fb.correct && s.get("feature.mastery") === true && s.get("mistakes.enabled") === true) recordMistake(q, fb, s.get<number>("mistakes.max") || 60);
        return { q, response, fb };
      }));
      setMarked(res);
      const totM = res.reduce((acc, m) => acc + defaultMarksFor(m.q), 0);
      const earnM = res.reduce((acc, m) => acc + (m.fb?.marksAwarded ?? (m.fb?.correct ? defaultMarksFor(m.q) : 0)), 0);
      if (totM > 0) saveScore(scopeKey("exam", board, cls, subject, chapter), Math.round((earnM / totM) * 100));
    } catch {
      setGradingError(true);
    } finally {
      setBusy(false);
    }
  };

  const totalMarks = paper.reduce((sum, q) => sum + defaultMarksFor(q), 0);

  if (marked) {
    const earnedMarks = marked.reduce((sum, m) => sum + (m.fb?.marksAwarded ?? (m.fb?.correct ? defaultMarksFor(m.q) : 0)), 0);
    const pct = totalMarks ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const badge = pct >= 85 ? "🏆 Mastered" : pct >= 65 ? "👍 Good Progress" : "📘 Needs Revision";
    const tiers = (["textbook", "exam", "advanced"] as const).map((t) => {
      const g = marked.filter((m) => (m.q.tier ?? "textbook") === t);
      const tot = g.reduce((a, m) => a + defaultMarksFor(m.q), 0);
      const earn = g.reduce((a, m) => a + (m.fb?.marksAwarded ?? (m.fb?.correct ? defaultMarksFor(m.q) : 0)), 0);
      return { tier: t, count: g.length, pct: tot ? Math.round((earn / tot) * 100) : 0, earn, tot };
    }).filter((x) => x.count > 0);

    return (
      <section className="assess-panel" aria-label="Chapter Test Report Card">
        <div className="score-banner">
          <div>
            <h2>Chapter Test Complete · {badge}</h2>
            <p>Score: <strong>{earnedMarks} / {totalMarks} marks ({pct}%)</strong></p>
          </div>
          <button type="button" className="btn" onClick={rebuild}>↻ Retake Test (New Mix)</button>
        </div>
        <div className="tier-bars">
          {tiers.map((t) => (
            <div key={t.tier} className="tier-bar-card">
              <div className="tier-bar-head"><span>{TIER_META[t.tier].badge}</span><span>{t.earn}/{t.tot} ({t.pct}%)</span></div>
              <div className="tier-bar-track"><div className="tier-bar-fill" style={{ width: `${t.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="assess-list">
          {marked.map((m, idx) => (
            <article key={m.q.id} className={`ws-qcard ${m.fb?.correct ? "right" : "wrong"}`}>
              <div className="ws-qhead">
                <strong>Q{idx + 1}. {s.name(m.q.stem)}</strong>
                <span className="q-badge marks">{m.fb?.marksAwarded ?? (m.fb?.correct ? defaultMarksFor(m.q) : 0)}/{defaultMarksFor(m.q)}</span>
              </div>
              <p className="small"><b>Your answer:</b> {m.response ? formatStudentAnswer(m.q, m.response, s.name) : "Skipped"}{m.fb && !m.fb.correct ? ` · Correct: ${s.name(m.fb.correctAnswer)}` : ""}</p>
              {m.fb && <p className="small">{s.name(m.fb.explanation)}</p>}
              {m.fb?.solutionSteps?.length ? <ol className="solution-steps">{m.fb.solutionSteps.map((st, i) => <li key={i}>{s.name(st)}</li>)}</ol> : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="assess-panel" aria-label="Chapter Test">
      <div className="assess-head">
        <div>
          <h2>Chapter Test (MCQ + Fill-in Auto-Graded)</h2>
          <p className="small">{paper.length} questions · {totalMarks} marks total · Hints &amp; solutions appear after you submit.</p>
        </div>
        <button type="button" className="btn" onClick={() => void submitTest()} disabled={busy || paper.length === 0}>{busy ? "Grading…" : "🏆 Submit Chapter Test"}</button>
      </div>
      {gradingError && <p role="alert">We could not grade the test. Your answers are still here. Try submitting again.</p>}
      {paper.length === 0 ? (
        <p className="soon-note">Chapter test questions are being added soon.</p>
      ) : (
        <div className="assess-list">
          {paper.map((q, idx) => {
            const picked = drafts[q.id];
            return (
              <article key={q.id} className="ws-qcard">
                <div className="ws-qhead">
                  <strong>Q{idx + 1}. {s.name(q.stem)}</strong>
                  <span className="q-badge marks">{defaultMarksFor(q)} {defaultMarksFor(q) === 1 ? "mark" : "marks"}</span>
                </div>
                {q.type === "mcq" && (
                  <div className="opts">
                    {q.options.map((o) => {
                      const isPicked = picked?.type === "mcq" && picked.optionId === o.id;
                      return (
                        <button key={o.id} type="button" className={`opt${isPicked ? " on" : ""}`} disabled={busy}
                          onClick={() => setDrafts((d) => ({ ...d, [q.id]: { type: "mcq", optionId: o.id } }))}>{s.name(o.text)}</button>
                      );
                    })}
                  </div>
                )}
                {(q.type === "fill" || q.type === "short" || q.type === "number") && (
                  <div className="typed-row">
                    <input className="fill-in" value={texts[q.id] ?? ""} disabled={busy} placeholder="Type your answer…"
                      onChange={(e) => {
                        const val = e.target.value;
                        setTexts((t) => ({ ...t, [q.id]: val }));
                        if (!val.trim() || (q.type === "number" && !Number.isFinite(Number(val)))) {
                          setDrafts(({ [q.id]: _old, ...rest }) => rest);
                          return;
                        }
                        if (q.type === "number" && Number.isFinite(Number(val))) setDrafts((d) => ({ ...d, [q.id]: { type: "number", value: Number(val) } }));
                        else if (q.type === "fill") setDrafts((d) => ({ ...d, [q.id]: { type: "fill", text: val.trim() } }));
                        else setDrafts((d) => ({ ...d, [q.id]: { type: "short", text: val.trim() } }));
                      }} />
                  </div>
                )}
                {q.type === "true_false" && (
                  <div className="opts row">
                    {([true, false] as const).map((v) => {
                      const isPicked = picked?.type === "true_false" && picked.value === v;
                      return (
                        <button key={String(v)} type="button" className={`opt${isPicked ? " on" : ""}`} disabled={busy}
                          onClick={() => setDrafts((d) => ({ ...d, [q.id]: { type: "true_false", value: v } }))}>{v ? "True" : "False"}</button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
          <div className="assess-foot">
            <button type="button" className="btn" onClick={() => void submitTest()} disabled={busy}>{busy ? "Grading…" : "🏆 Submit Chapter Test"}</button>
          </div>
        </div>
      )}
    </section>
  );
}
