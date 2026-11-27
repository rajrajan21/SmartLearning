import { buzz } from "../lib/appview";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnswerFeedback, AnswerResponse, LangAudio, PublicQuestion } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui, type Lang } from "../lib/i18n";
import { AskTeacher } from "./AskTeacher";
import { recordReview } from "../lib/revision";
import { recordMistake } from "../lib/mistakes";
import { ReportProblem } from "./ReportProblem";
import { fetchSolution, sendAnswer, shuffled, usePhrases, type StudyKeyItem } from "../lib/practice";

const TIER_LABEL: Record<string, string> = { textbook: "📘 Textbook", exam: "📝 Exam Extra", advanced: "🚀 Advanced" };
const FORMAT_LABEL: Record<string, string> = { mcq: "MCQ", fill: "Fill in the blank", true_false: "True / False", number: "Numeric", short: "Short Answer", multi: "Multi-Select", match: "Match", order: "Order", long: "Long Answer" };

interface Part { audio?: LangAudio; text: string }

/** Plays recorded clips one after another; falls back to the device voice when a clip is missing. */
function useSpeaker(lang: Lang, deviceFallback: boolean) {
  const run = useRef(0);
  const el = useRef<HTMLAudioElement | null>(null);
  const stop = useCallback(() => {
    run.current++;
    if (el.current) { el.current.pause(); el.current.onended = null; el.current = null; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) speechSynthesis.cancel();
  }, []);
  const say = useCallback((parts: Part[]) => {
    stop();
    const id = run.current;
    const next = (i: number) => {
      if (run.current !== id || i >= parts.length) return;
      const p = parts[i]!, rec = p.audio?.[lang];
      if (rec) { const a = new Audio(rec.url); el.current = a; a.onended = () => next(i + 1); a.onerror = () => next(i + 1); void a.play().catch(() => next(i + 1)); }
      else if (deviceFallback && p.text && typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined") {
        const u = new SpeechSynthesisUtterance(p.text); u.lang = lang === "ta" ? "ta-IN" : "en-IN"; u.onend = () => next(i + 1); u.onerror = () => next(i + 1); speechSynthesis.speak(u);
      } else next(i + 1);
    };
    next(0);
  }, [lang, deviceFallback, stop]);
  useEffect(() => stop, [stop]);
  return { say, stop };
}

export interface CardResult { correct: boolean; hintsUsed: number }

/** collect: test mode, the answer is kept for marking at the end and nothing is shown. quick: game mode, moves on by itself. inline: multi-question sheet mode, hides the Next button. */
export function QuestionCard({ q, onDone, nextLabel, compact, collect, quick, inline }: { q: PublicQuestion; onDone: (r: CardResult) => void; nextLabel?: string; compact?: boolean; collect?: (r: AnswerResponse) => void; quick?: boolean; inline?: boolean }) {
  const s = useSettings();
  const { lang } = s;
  const attemptId = useRef(crypto.randomUUID()); // one per question shown, so a resend never counts twice
  const [pick, setPick] = useState<string | boolean | null>(null);
  const [text, setText] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [hints, setHints] = useState(0);
  const [fb, setFb] = useState<AnswerFeedback | null>(null);
  const [revealedSol, setRevealedSol] = useState<StudyKeyItem | null>(null);
  const [solOpen, setSolOpen] = useState(false);
  const [solBusy, setSolBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const voiceFb = s.get("practice.audio.feedback"), voiceQ = s.get("practice.audio.questions");
  const speaker = useSpeaker(lang, s.get("narration.browserVoice"));
  const phrases = usePhrases(voiceFb);
  const options = useMemo(() => (q.type === "mcq" && s.get("practice.shuffleOptions") ? shuffled(q.options) : q.type === "mcq" ? q.options : []), [q, s]);
  const items = q.type === "order" ? q.items : [];
  const hintsEnabled = s.get("practice.hints.enabled") !== false && s.get("assessment.hints.enabled") !== false;
  const hintMax = !collect && !quick && hintsEnabled ? Math.min(q.hints.length, Math.max(1, s.get<number>("practice.hints.max") || 2)) : 0;
  const allowRevealBefore = !collect && !quick && s.get("assessment.solutions.allowRevealBefore") !== false;
  const showSolutionsAfter = s.get("assessment.solutions.showAfterAnswer") !== false;
  const locked = fb !== null;
  const [multi, setMulti] = useState<string[]>([]);
  const [pairs, setPairs] = useState<Record<string, string>>({});

  const response: AnswerResponse | null =
    q.type === "mcq" ? (typeof pick === "string" ? { type: "mcq", optionId: pick } : null)
    : q.type === "true_false" ? (typeof pick === "boolean" ? { type: "true_false", value: pick } : null)
    : q.type === "number" ? (text.trim() !== "" && Number.isFinite(Number(text.replace(",", "."))) ? { type: "number", value: Number(text.replace(",", ".")) } : null)
    : q.type === "short" ? (text.trim() ? { type: "short", text: text.trim() } : null)
    : q.type === "fill" ? (text.trim() ? { type: "fill", text: text.trim() } : null)
    : q.type === "multi" ? (multi.length ? { type: "multi", ids: multi } : null)
    : q.type === "match" ? (q.lefts.every((l) => pairs[l.id]) ? { type: "match", pairs: q.lefts.map((l) => ({ left: l.id, right: pairs[l.id]! })) } : null)
    : q.type === "long" ? (text.trim().length >= 3 ? { type: "long", text: text.trim() } : null)
    : chosen.length === items.length && items.length > 0 ? { type: "order", ids: chosen } : null;

  const toggleRevealSolution = async () => {
    if (solOpen) { setSolOpen(false); return; }
    if (revealedSol) { setSolOpen(true); return; }
    setSolBusy(true);
    try {
      const sol = await fetchSolution(q.id);
      setRevealedSol(sol);
      setSolOpen(true);
    } catch { /* ignore if disabled on server */ } finally { setSolBusy(false); }
  };

  const check = async () => {
    if (!response || busy || locked) return;
    if (collect) { collect(response); return; }
    setBusy(true); setErr(false);
    try {
      const f = await sendAnswer(q.id, attemptId.current, hints, response);
      setFb(f);
      if (!quick && s.get("feature.mastery") === true && s.get("mistakes.enabled") === true) recordMistake(q, f, s.get<number>("mistakes.max") || 60);
      if (f.correct && s.get("app.vibrate") === true) buzz();
      if (s.get("feature.mastery") === true && s.get("mastery.revision.enabled") === true) recordReview(q.id, f.correct, s.get<number[]>("mastery.revision.intervals"));
      if (voiceFb) {
        const list = f.correct ? phrases.praise : phrases.tryAgain;
        const phrase = list && list.length ? list[Math.floor(Math.random() * list.length)] : undefined;
        const parts: Part[] = [];
        if (phrase) parts.push({ audio: phrase.audio, text: s.name(phrase.text) });
        if (!f.correct && f.whyWrong && s.get("practice.showWhyWrong")) parts.push({ audio: f.audio?.whyWrong, text: s.name(f.whyWrong) });
        parts.push({ audio: f.audio?.explanation, text: s.name(f.explanation) });
        speaker.say(parts);
      }
    } catch { setErr(true); } finally { setBusy(false); }
  };

  useEffect(() => {
    if (!quick || !fb) return;
    const t = setTimeout(() => onDone({ correct: fb.correct, hintsUsed: hints }), fb.correct ? 700 : 1800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fb, quick]);

  const stem = s.name(q.stem);
  const label = (id: string) => items.find((i) => i.id === id);
  return (
    <section className={`qcard${compact ? " compact" : ""}`} aria-label={stem}>
      <div className="q-meta">
        {q.tier && <span className={`q-badge tier-${q.tier}`}>{TIER_LABEL[q.tier] ?? q.tier}</span>}
        <span className="q-badge fmt">{FORMAT_LABEL[q.type] ?? q.type}</span>
        {typeof q.marks === "number" && <span className="q-badge marks">{q.marks} {q.marks === 1 ? "mark" : "marks"}</span>}
      </div>
      <div className="q-stem">
        <p className="problem">{stem}</p>
        {voiceQ && <button type="button" className="btn ghost sm" onClick={() => speaker.say([{ audio: q.audio?.stem, text: stem }])}>🔊 {ui("listenQuestion", lang)}</button>}
      </div>
      {q.passage && s.get("practice.passage.show") !== false && <blockquote className="q-passage">{s.name(q.passage)}</blockquote>}
      {q.image && <img className="q-img" src={`/assets/questions/${q.image.assetKey}`} alt={s.name(q.image.altText)} />}

      {q.type === "mcq" && (
        <div className="opts" role="radiogroup" aria-label={stem}>
          {options.map((o) => (
            <button key={o.id} type="button" role="radio" aria-checked={pick === o.id} disabled={locked} className={`opt${pick === o.id ? " on" : ""}`} onClick={() => setPick(o.id)}>{s.name(o.text)}</button>
          ))}
        </div>
      )}
      {q.type === "true_false" && (
        <div className="opts row" role="radiogroup" aria-label={stem}>
          {([[true, "trueWord"], [false, "falseWord"]] as const).map(([v, k]) => (
            <button key={k} type="button" role="radio" aria-checked={pick === v} disabled={locked} className={`opt${pick === v ? " on" : ""}`} onClick={() => setPick(v)}>{ui(k, lang)}</button>
          ))}
        </div>
      )}
      {(q.type === "number" || q.type === "short" || q.type === "fill") && (
        <div className="typed">
          <label htmlFor={`a-${q.id}`}>{q.type === "number" ? ui("typeNumber", lang) : q.type === "fill" ? "Fill in the blank" : ui("typeAnswer", lang)}</label>
          <div className="typed-row">
            <input id={`a-${q.id}`} inputMode={q.type === "number" ? "decimal" : "text"} autoComplete="off" value={text} disabled={locked} maxLength={q.type === "number" ? 20 : 80}
              placeholder={q.type === "fill" ? "Type your answer…" : undefined}
              onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void check(); }} />
            {(q.type === "number" || q.type === "short" || q.type === "fill") && q.unit && <span className="unit">{s.name(q.unit)}</span>}
          </div>
        </div>
      )}
      {q.type === "multi" && (
        <div className="opts" role="group" aria-label={stem}>
          <p className="small">{ui("multiHelp", lang)}</p>
          {q.options.map((o) => (
            <button key={o.id} type="button" role="checkbox" aria-checked={multi.includes(o.id)} disabled={locked} className={`opt${multi.includes(o.id) ? " on" : ""}`} onClick={() => setMulti((m) => m.includes(o.id) ? m.filter((x) => x !== o.id) : [...m, o.id])}>{multi.includes(o.id) ? "☑ " : "☐ "}{s.name(o.text)}</button>
          ))}
        </div>
      )}
      {q.type === "match" && (
        <div className="match">
          <p className="small">{ui("matchHelp", lang)}</p>
          {q.lefts.map((l) => (
            <div key={l.id} className="match-row">
              <span className="match-left">{s.name(l.text)}</span>
              <select aria-label={s.name(l.text)} disabled={locked} value={pairs[l.id] ?? ""} onChange={(e) => setPairs((p) => ({ ...p, [l.id]: e.target.value }))}>
                <option value="">{ui("matchPick", lang)}</option>
                {q.rights.map((r) => <option key={r.id} value={r.id}>{s.name(r.text)}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
      {q.type === "long" && (
        <div className="typed">
          <label htmlFor={`a-${q.id}`}>{ui("longHelp", lang)}</label>
          <textarea id={`a-${q.id}`} rows={4} maxLength={600} value={text} disabled={locked} onChange={(e) => setText(e.target.value)} />
          <p className="small">{ui("longTips", lang)}</p>
        </div>
      )}
      {q.type === "order" && (
        <div className="order">
          <p className="small">{ui("orderHelp", lang)}</p>
          <ol className="picked" aria-label={ui("orderHelp", lang)}>{chosen.map((id) => <li key={id}>{s.name(label(id)!.text)}</li>)}</ol>
          <div className="opts">
            {items.filter((i) => !chosen.includes(i.id)).map((i) => <button key={i.id} type="button" className="opt" disabled={locked} onClick={() => setChosen((c) => [...c, i.id])}>{s.name(i.text)}</button>)}
          </div>
          {chosen.length > 0 && !locked && <button type="button" className="link" onClick={() => setChosen([])}>{ui("clearOrder", lang)}</button>}
        </div>
      )}

      {hints > 0 && <ul className="hints">{q.hints.slice(0, hints).map((h, i) => <li key={i}>💡 {s.name(h)}</li>)}</ul>}

      {!locked && solOpen && revealedSol && (
        <div className="solution-box" role="region" aria-label="Step-by-Step Solution">
          <p><b>{ui("rightAnswerIs", lang)}:</b> {s.name(revealedSol.answer)}</p>
          {revealedSol.solutionSteps?.length ? (
            <ol className="solution-steps">{revealedSol.solutionSteps.map((st, idx) => <li key={idx}>{s.name(st)}</li>)}</ol>
          ) : (
            <p>{s.name(revealedSol.explanation)}</p>
          )}
        </div>
      )}

      {!locked && (
        <div className="q-actions">
          <button type="button" className="btn" disabled={!response || busy} onClick={() => void check()}>{collect ? ui("saveAnswer", lang) : ui("checkAnswer", lang)}</button>
          {hints < hintMax && <button type="button" className="btn ghost" onClick={() => setHints((h) => h + 1)}><span aria-hidden="true">💡 </span>{ui("hint", lang)}</button>}
          {allowRevealBefore && <button type="button" className="btn ghost" disabled={solBusy} onClick={() => void toggleRevealSolution()}>👁 {solOpen ? "Hide Solution" : "Step-by-Step Solution"}</button>}
        </div>
      )}
      {err && <p className="err" role="alert">{ui("practiceOnline", lang)}</p>}

      {fb && (
        <div className={`feedback ${fb.correct ? "yes" : "no"}`} role="status" aria-live="polite">
          <h3>
            {fb.correct ? `✓ ${ui("correct", lang)}` : ui("notQuite", lang)}
            {typeof fb.maxMarks === "number" && <span className="marks-pill"> · {fb.marksAwarded ?? (fb.correct ? fb.maxMarks : 0)}/{fb.maxMarks} {fb.maxMarks === 1 ? "mark" : "marks"}</span>}
          </h3>
          {!fb.correct && fb.whyWrong && s.get("practice.showWhyWrong") && <p>{s.name(fb.whyWrong)}</p>}
          {!fb.correct && s.get("practice.showCorrectAnswer") && <p><b>{ui("rightAnswerIs", lang)}:</b> {s.name(fb.correctAnswer)}</p>}
          <p>{s.name(fb.explanation)}</p>
          {showSolutionsAfter && fb.solutionSteps && fb.solutionSteps.length > 0 && (
            <div className="solution-box">
              <p className="small"><b>Step-by-Step Solution</b></p>
              <ol className="solution-steps">{fb.solutionSteps.map((st, idx) => <li key={idx}>{s.name(st)}</li>)}</ol>
            </div>
          )}
          {!quick && s.get("feature.aiTutor") === true && s.get("tutor.inPractice") === true && <AskTeacher questionId={q.id} about={stem} afterAnswer />}
          {!quick && !collect && <ReportProblem kind="question" about={`${q.key} (${q.id})`} where="onQuestions" />}
          {!inline && <button type="button" className="btn" onClick={() => { speaker.stop(); onDone({ correct: fb.correct, hintsUsed: hints }); }}>{nextLabel ?? ui("nextQuestion", lang)}</button>}
        </div>
      )}
    </section>
  );
}
