import { useEffect, useState } from "react";
import { Link } from "wouter";
import { defaultMarksFor, type AnswerFeedback, type AnswerResponse, type PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { useAccount } from "../lib/account";
import { ui } from "../lib/i18n";
import { fetchStudyKey, formatStudentAnswer, sendAnswer, shuffled, type StudyKeyItem } from "../lib/practice";
import { recordMistake } from "../lib/mistakes";
import { useChapterPool } from "../lib/chapterTools";
import { ErrorBox, Loading, NotFound } from "../components/bits";
import { useChapterScope } from "./Exam";

const PART_INFO: Record<string, { title: string; subtitle: string }> = {
  textbook: { title: "Part A — Textbook Questions", subtitle: "Core textbook & NCERT exercises" },
  exam: { title: "Part B — Extra Exam & Online Questions", subtitle: "School test & board-style practice" },
  advanced: { title: "Part C — Advanced Challenge", subtitle: "Multi-step HOTS & Olympiad problems" },
};

const TIER_ORDER: Record<string, number> = { textbook: 0, exam: 1, advanced: 2 };

export function WorksheetPage() {
  const s = useSettings();
  const { lang } = s;
  const acct = useAccount();
  const sc = useChapterScope();
  const on = s.get("feature.worksheets") === true && s.get("feature.practice") === true;
  const pool = useChapterPool(sc.board, sc.cls, sc.subject, sc.chapter, sc.topics, on && sc.tree.status === "ready");
  const [paper, setPaper] = useState<PublicQuestion[]>([]);
  const [key, setKey] = useState<Record<string, { en: string; ta?: string }> | null>(null);
  const [studyKey, setStudyKey] = useState<Record<string, StudyKeyItem> | null>(null);
  const [keyErr, setKeyErr] = useState(false);
  const [asPaper, setAsPaper] = useState(false);

  // Interactive online worksheet state
  const [drafts, setDrafts] = useState<Record<string, AnswerResponse>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [graded, setGraded] = useState<Record<string, AnswerFeedback> | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkErr, setCheckErr] = useState(false);

  const all = pool.status === "ready" ? pool.data : [];
  const n = s.get<number>("worksheets.questionCount");

  const make = () => {
    const hasTiers = all.some((q) => q.tier);
    let picked: PublicQuestion[];
    if (hasTiers) {
      const tb = shuffled(all.filter((q) => (q.tier ?? "textbook") === "textbook"));
      const ex = shuffled(all.filter((q) => q.tier === "exam"));
      const adv = shuffled(all.filter((q) => q.tier === "advanced"));
      const wantTb = Math.min(tb.length, Math.max(2, Math.ceil(n * 0.45)));
      const wantEx = Math.min(ex.length, Math.max(1, Math.ceil(n * 0.35)));
      const wantAdv = Math.min(adv.length, Math.max(1, n - wantTb - wantEx));
      picked = [...tb.slice(0, wantTb), ...ex.slice(0, wantEx), ...adv.slice(0, wantAdv)];
      if (picked.length < Math.min(n, all.length)) {
        const used = new Set(picked.map((q) => q.id));
        picked = [...picked, ...shuffled(all.filter((q) => !used.has(q.id))).slice(0, n - picked.length)];
      }
      picked.sort((a, b) => (TIER_ORDER[a.tier ?? "textbook"] ?? 0) - (TIER_ORDER[b.tier ?? "textbook"] ?? 0));
    } else {
      picked = shuffled(all).slice(0, n);
    }
    setPaper(picked);
    setKey(null);
    setStudyKey(null);
    setKeyErr(false);
    setDrafts({});
    setTexts({});
    setGraded(null);
    setCheckErr(false);
  };
  useEffect(() => { if (pool.status === "ready" && all.length > 0) make(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pool.status, all.length]);

  const showKey = async () => {
    setKeyErr(false);
    const r = await fetch("/api/v1/practice/answer-key", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: paper.map((q) => q.id) }) });
    if (!r.ok) { setKeyErr(true); return; }
    const d = (await r.json()) as { answers: { id: string; answer: { en: string; ta?: string } }[] };
    setKey(Object.fromEntries(d.answers.map((a) => [a.id, a.answer])));
  };

  const toggleStudyKey = async () => {
    if (studyKey) { setStudyKey(null); return; }
    setKeyErr(false);
    try {
      const map = await fetchStudyKey(paper.map((q) => q.id));
      setStudyKey(map);
    } catch {
      setKeyErr(true);
    }
  };

  const setTextAnswer = (q: PublicQuestion, val: string) => {
    setTexts((prev) => ({ ...prev, [q.id]: val }));
    const trimmed = val.trim();
    setDrafts((prev) => {
      const next = { ...prev };
      if (!trimmed) { delete next[q.id]; return next; }
      if (q.type === "number") {
        const num = Number(trimmed.replace(/,/g, ""));
        if (Number.isFinite(num)) next[q.id] = { type: "number", value: num };
        else delete next[q.id];
      } else if (q.type === "fill") {
        next[q.id] = { type: "fill", text: trimmed };
      } else if (q.type === "short") {
        next[q.id] = { type: "short", text: trimmed };
      } else if (q.type === "long") {
        if (trimmed.length >= 3) next[q.id] = { type: "long", text: trimmed };
        else delete next[q.id];
      }
      return next;
    });
  };

  const checkWorksheet = async () => {
    setChecking(true);
    setCheckErr(false);
    try {
      const out: Record<string, AnswerFeedback> = {};
      for (const q of shown) {
        const r = drafts[q.id];
        if (!r) continue;
        const fb = await sendAnswer(q.id, crypto.randomUUID(), 0, r);
        out[q.id] = fb;
        if (s.get("feature.mastery") === true && s.get("mistakes.enabled") === true) {
          recordMistake(q, fb, s.get<number>("mistakes.max") || 60);
        }
      }
      setGraded(out);
    } catch {
      setCheckErr(true);
    } finally {
      setChecking(false);
    }
  };

  if (!on) return <NotFound />;
  if (sc.tree.status === "loading" || pool.status === "loading") return <Loading />;
  if (sc.tree.status === "error" || pool.status === "error") return <ErrorBox onRetry={sc.retry} />;
  if (!sc.ch) return <NotFound />;
  if (all.length === 0) return <div className="paper"><h1>{ui("worksheetWord", lang)}</h1><p className="soon-note">{ui("noQuestionsYet", lang)}</p><Link className="btn" href={sc.back}>{ui("backToChapter", lang)}</Link></div>;

  const keyOn = s.get("worksheets.answerKey") === true;
  const studyKeyOn = s.get("worksheet.answerKey.allowToggle") !== false;
  const interactiveOn = s.get("worksheet.interactive.enabled") !== false;
  const paperOn = s.get("exams.paper.enabled") === true;
  const objective = (q: PublicQuestion) => q.type === "mcq" || q.type === "true_false" || q.type === "multi" || q.type === "match" || q.type === "order";
  const mo = s.get<number>("exams.paper.marksObjective"), mw = s.get<number>("exams.paper.marksWritten");
  const hasTiers = paper.some((q) => q.tier);
  const shown = asPaper ? [...paper.filter(objective), ...paper.filter((q) => !objective(q))] : paper;
  const marksOf = (q: PublicQuestion) => (asPaper ? (objective(q) ? mo : mw) : (q.marks ?? defaultMarksFor(q)));
  const totalMarks = shown.reduce((t, q) => t + marksOf(q), 0);

  const answeredCount = shown.filter((q) => Boolean(drafts[q.id])).length;
  const earnedMarks = graded ? shown.reduce((sum, q) => {
    const fb = graded[q.id];
    if (!fb) return sum;
    return sum + (fb.marksAwarded ?? (fb.correct ? marksOf(q) : 0));
  }, 0) : 0;
  const scorePct = graded ? Math.round((earnedMarks / Math.max(1, totalMarks)) * 100) : 0;

  return (
    <div className="paper worksheet">
      <div className="actions noprint">
        <button type="button" className="btn" onClick={() => window.print()}>🖨 {ui("printWorksheet", lang)}</button>
        <button type="button" className="btn ghost" onClick={make}>{ui("newWorksheet", lang)}</button>
        {studyKeyOn && (
          <button type="button" className="btn ghost" onClick={() => void toggleStudyKey()}>
            👁 {studyKey ? "Hide Answer Key & Solutions" : "Show Answer Key & Solutions"}
          </button>
        )}
        {keyOn && acct.me && (key ? <button type="button" className="btn ghost" onClick={() => setKey(null)}>{ui("hideKey", lang)}</button> : <button type="button" className="btn ghost" onClick={() => void showKey()}>{ui("showKey", lang)}</button>)}
        {paperOn && <button type="button" className="btn ghost" aria-pressed={asPaper} onClick={() => setAsPaper((v) => !v)}>{asPaper ? ui("worksheetBack", lang) : ui("examPaperWord", lang)}</button>}
        <Link className="btn ghost" href={sc.back}>{ui("backToChapter", lang)}</Link>
      </div>
      {keyOn && !acct.me && <p className="small noprint">{ui("keySignIn", lang)}</p>}
      {keyErr && <p className="err noprint" role="alert">{ui("keySignIn", lang)}</p>}

      <h1>{asPaper ? `${s.get<string>("exams.paper.title")}: ` : `${ui("worksheetWord", lang)}: `}{s.name(sc.ch.name)}</h1>
      <p className="sheet-lines">
        <span>{ui("paperClass", lang)} {sc.cls}</span>
        <span>{ui("paperMarks", lang)}: {totalMarks}</span>
        {asPaper && <span>{ui("paperTime", lang)}: {s.get<number>("exams.paper.minutes")} {ui("paperMin", lang)}</span>}
      </p>
      {asPaper && <p className="small">{s.get<string>("exams.paper.instructions")}</p>}
      {s.get("worksheets.nameLine") === true && <p className="sheet-lines"><span>{ui("nameLine", lang)}: ____________________</span><span>{ui("dateLine", lang)}: ____________</span></p>}

      {graded && (
        <div className="ws-summary noprint" role="status" aria-live="polite">
          <h2>Worksheet Score: {earnedMarks} / {totalMarks} marks ({scorePct}%)</h2>
          <p className="small">
            {Object.values(graded).filter((f) => f.correct).length} of {shown.length} correct
            {answeredCount < shown.length ? ` · ${shown.length - answeredCount} unanswered` : ""}
          </p>
        </div>
      )}

      <ol className="sheet">
        {shown.map((q, qi) => {
          const tier = q.tier ?? "textbook";
          const prevTier = qi > 0 ? (shown[qi - 1]!.tier ?? "textbook") : null;
          const showPartHeader = !asPaper && hasTiers && (qi === 0 || tier !== prevTier);
          const qMarks = marksOf(q);
          const fb = graded?.[q.id];
          const sk = studyKey?.[q.id];
          const draft = drafts[q.id];
          return (
            <li key={q.id} className={fb ? (fb.correct ? "ws-ok" : "ws-miss") : undefined}>
              {asPaper && (qi === 0 || objective(q) !== objective(shown[qi - 1]!)) && <p className="sheet-sec"><b>{objective(q) ? ui("paperSecA", lang) : ui("paperSecB", lang)}</b></p>}
              {showPartHeader && PART_INFO[tier] && (
                <p className="sheet-sec">
                  <b>{PART_INFO[tier]!.title}</b> <span className="small">— {PART_INFO[tier]!.subtitle}</span>
                </p>
              )}
              {q.passage && <blockquote className="q-passage">{s.name(q.passage)}</blockquote>}
              <p className="problem">
                {s.name(q.stem)} <span className="q-marks">[{qMarks} {qMarks === 1 ? "mark" : "marks"}]</span>
              </p>

              {q.type === "mcq" && (
                <>
                  {interactiveOn ? (
                    <div className="ws-opts noprint" role="radiogroup" aria-label={s.name(q.stem)}>
                      {q.options.map((o) => {
                        const selected = draft?.type === "mcq" && draft.optionId === o.id;
                        return (
                          <button key={o.id} type="button" role="radio" aria-checked={selected} disabled={Boolean(graded)}
                            className={`opt sm${selected ? " on" : ""}`}
                            onClick={() => setDrafts((p) => ({ ...p, [q.id]: { type: "mcq", optionId: o.id } }))}>
                            {s.name(o.text)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  <ul className={`sheet-opts${interactiveOn ? " print-only" : ""}`}>{q.options.map((o) => <li key={o.id}>◯ {s.name(o.text)}</li>)}</ul>
                </>
              )}

              {q.type === "true_false" && (
                <>
                  {interactiveOn ? (
                    <div className="ws-opts row noprint" role="radiogroup" aria-label={s.name(q.stem)}>
                      {([[true, "trueWord"], [false, "falseWord"]] as const).map(([v, k]) => {
                        const selected = draft?.type === "true_false" && draft.value === v;
                        return (
                          <button key={k} type="button" role="radio" aria-checked={selected} disabled={Boolean(graded)}
                            className={`opt sm${selected ? " on" : ""}`}
                            onClick={() => setDrafts((p) => ({ ...p, [q.id]: { type: "true_false", value: v } }))}>
                            {ui(k, lang)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  <p className={`sheet-opts${interactiveOn ? " print-only" : ""}`}>◯ {ui("trueWord", lang)} &nbsp;&nbsp; ◯ {ui("falseWord", lang)}</p>
                </>
              )}

              {q.type === "multi" && <ul className="sheet-opts">{q.options.map((o) => <li key={o.id}>☐ {s.name(o.text)}</li>)}</ul>}
              {q.type === "match" && <div className="sheet-match"><ul>{q.lefts.map((l) => <li key={l.id}>{s.name(l.text)} → ______</li>)}</ul><ul>{q.rights.map((r, i) => <li key={r.id}>{String.fromCharCode(97 + i)}. {s.name(r.text)}</li>)}</ul></div>}
              {q.type === "order" && <ul className="sheet-opts">{q.items.map((i) => <li key={i.id}>▫ {s.name(i.text)}</li>)}</ul>}

              {(q.type === "number" || q.type === "short" || q.type === "fill") && (
                <>
                  {interactiveOn && (
                    <div className="ws-typed noprint">
                      <input
                        aria-label={`Answer for ${s.name(q.stem)}`}
                        inputMode={q.type === "number" ? "decimal" : "text"}
                        placeholder={q.type === "fill" ? "Fill in the blank…" : "Type your answer…"}
                        disabled={Boolean(graded)}
                        value={texts[q.id] ?? ""}
                        onChange={(e) => setTextAnswer(q, e.target.value)}
                      />
                      {q.unit && <span className="unit">{s.name(q.unit)}</span>}
                    </div>
                  )}
                  <p className={`blank${interactiveOn ? " print-only" : ""}`}>{ui("answerLabel", lang)}: ______________________{q.unit ? ` ${s.name(q.unit)}` : ""}</p>
                </>
              )}

              {q.type === "long" && <p className="blank">_______________________________________________<br />_______________________________________________</p>}
              {q.type === "order" && <p className="blank">{ui("answerLabel", lang)}: ______________________</p>}

              {fb && (
                <div className={`ws-fb ${fb.correct ? "yes" : "no"} noprint`}>
                  <p>
                    <b>{fb.correct ? `✓ ${ui("correct", lang)}` : `✗ ${ui("notQuite", lang)}`}</b>
                    {" · "}<b>{fb.marksAwarded ?? (fb.correct ? qMarks : 0)}/{fb.maxMarks ?? qMarks}</b>
                    {!fb.correct && <> · <b>{ui("rightAnswerIs", lang)}:</b> {s.name(fb.correctAnswer)}</>}
                  </p>
                  {draft && !fb.correct && <p className="small">Your answer: {formatStudentAnswer(q, draft, s.name)}</p>}
                  <p className="small">{s.name(fb.explanation)}</p>
                  {fb.solutionSteps && fb.solutionSteps.length > 0 && (
                    <ol className="solution-steps">{fb.solutionSteps.map((st, idx) => <li key={idx}>{s.name(st)}</li>)}</ol>
                  )}
                </div>
              )}

              {!fb && key?.[q.id] && <p className="key-line"><b>{ui("rightAnswerIs", lang)}:</b> {s.name(key[q.id]!)}</p>}
              {!fb && sk && (
                <div className="key-line solution-box">
                  <p><b>{ui("rightAnswerIs", lang)}:</b> {s.name(sk.answer)}</p>
                  <p className="small">{s.name(sk.explanation)}</p>
                  {sk.solutionSteps && sk.solutionSteps.length > 0 && (
                    <ol className="solution-steps">{sk.solutionSteps.map((st, idx) => <li key={idx}>{s.name(st)}</li>)}</ol>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {interactiveOn && !graded && (
        <div className="actions noprint">
          <button type="button" className="btn" disabled={checking || answeredCount === 0} onClick={() => void checkWorksheet()}>
            {checking ? "Checking…" : `Check Worksheet (${answeredCount}/${shown.length} answered)`}
          </button>
          {checkErr && <p className="err" role="alert">{ui("practiceOnline", lang)}</p>}
        </div>
      )}
      {interactiveOn && graded && (
        <div className="actions noprint">
          <button type="button" className="btn" onClick={make}>Try New Worksheet</button>
          <button type="button" className="btn ghost" onClick={() => { setGraded(null); setDrafts({}); setTexts({}); }}>Reset Answers</button>
        </div>
      )}

      <p className="small sheet-foot">{s.name(s.get("worksheets.footer"))}</p>
    </div>
  );
}
