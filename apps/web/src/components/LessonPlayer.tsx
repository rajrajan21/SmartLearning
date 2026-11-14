import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import type { ContentBlock, TopicLesson } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { Board } from "./Board";
import { boardAt, hasBoard } from "../lib/board";
import { useDeviceVoice, useNarrator } from "../lib/narrator";
import { getProgress, saveProgress, clearProgress } from "../lib/progress";

export interface PlayerLinks { chapterHref: string; nextHref: string | null; nextLabel: string | null }

const paragraphs = (t: string) => t.split("\n").filter((p) => p.trim().length > 0);

function Narration({ block }: { block: Extract<ContentBlock, { type: "teacher_narration" }> }) {
  const s = useSettings();
  const { lang } = s;
  const voiceOn = s.get("feature.teacherNarration");
  const device = useDeviceVoice(lang, voiceOn && s.get("narration.browserVoice"));
  const n = useNarrator(block.sentences, { lang, autoAdvance: s.get("narration.autoAdvance"), initialRate: Number(s.get<string>("narration.defaultSpeed")), deviceVoice: device });
  const canSpeak = voiceOn && n.source !== "none";
  const showBoard = voiceOn && s.get("narration.showBoard") && hasBoard(block.sentences);
  const highlight = s.get("narration.highlight");
  const textVisible = s.get("lesson.narration.showText") || !canSpeak;
  const board = boardAt(block.sentences, n.playing || n.index > 0 ? n.index : block.sentences.length - 1);
  const rates = [["0.8", "slow"], ["1", "normal"], ["1.2", "fast"]] as const;
  return (
    <article className="blk narration">
      <h2>{s.text("narration.teacherName")}</h2>
      {canSpeak && (
        <div className="narr-controls">
          <button type="button" className="btn" onClick={() => (n.playing ? n.pause() : n.play())} aria-pressed={n.playing}>{n.playing ? `❚❚ ${ui("pause", lang)}` : `▶ ${ui("listen", lang)}`}</button>
          <button type="button" className="btn ghost" onClick={n.restart}>{ui("listenAgain", lang)}</button>
          {s.get("narration.speedControl") && (
            <label className="rate">{ui("speed", lang)}
              <select value={String(n.rate)} onChange={(e) => n.setRate(Number(e.target.value))}>
                {rates.map(([v, k]) => <option key={v} value={v}>{ui(k, lang)}</option>)}
              </select>
            </label>
          )}
        </div>
      )}
      {showBoard && <Board state={board} label={ui("boardLabel", lang)} />}
      {textVisible && (
        <ul className="bubbles">
          {block.sentences.map((x, i) => {
            const rec = x.audio[lang];
            const on = highlight && n.playing && n.index === i;
            const words = on && rec && rec.words.length > 0 ? rec.words : null;
            return (
              <li key={x.id} className={on ? "speaking" : undefined} aria-current={on ? "true" : undefined}>
                {words ? words.map((w, k) => <span key={k} className={k === n.wordIndex ? "word now" : "word"}>{w.w} </span>) : s.name(x.text)}
              </li>
            );
          })}
        </ul>
      )}
      {canSpeak && n.source === "device" && <p className="small">{ui("deviceVoiceNote", lang)}</p>}
    </article>
  );
}

function Block({ block }: { block: ContentBlock }) {
  const s = useSettings();
  const { lang } = s;
  const [shown, setShown] = useState(() => (s.get("lesson.example.stepByStep") ? 1 : 99));
  const [answer, setAnswer] = useState("");
  const [ideas, setIdeas] = useState(false);
  switch (block.type) {
    case "story":
      return (<article className="blk story"><h2>{s.name(block.title)}</h2>{paragraphs(s.name(block.text)).map((p, i) => <p key={i}>{p}</p>)}</article>);
    case "explanation":
      return (<article className="blk">{paragraphs(s.name(block.text)).map((p, i) => <p key={i}>{p}</p>)}</article>);
    case "worked_example": {
      const total = block.steps.length;
      return (
        <article className="blk example">
          <p className="problem"><b>{ui("problem", lang)}: </b>{s.name(block.problem)}</p>
          <ol className="ex-steps">
            {block.steps.slice(0, shown).map((st, i) => (
              <li key={i}><p>{s.name(st.text)}</p>{st.why && s.get("lesson.example.showWhy") && <p className="why"><b>{ui("whyLabel", lang)}</b> {s.name(st.why)}</p>}</li>
            ))}
          </ol>
          {shown < total && <button type="button" className="btn ghost" onClick={() => setShown((n) => n + 1)}>{ui("showNextStep", lang)} ({shown}/{total})</button>}
        </article>
      );
    }
    case "image":
    case "diagram":
      return (<figure className="blk"><img src={`/assets/lessons/${block.assetKey}`} alt={s.name(block.altText)} />{block.caption && <figcaption>{s.name(block.caption)}</figcaption>}</figure>);
    case "teacher_narration":
      return <Narration block={block} />;
    case "quiz":
      return (<article className="blk soon-note"><p>{ui("quizSoon", lang)}</p></article>);
    case "teach_back":
      return (
        <article className="blk teachback">
          <p className="problem">{s.name(block.prompt)}</p>
          <label htmlFor={`tb-${block.id}`}>{ui("yourAnswer", lang)}</label>
          <textarea id={`tb-${block.id}`} rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <p className="small">{ui("yourAnswerHint", lang)}</p>
          {!ideas ? <button type="button" className="btn ghost" onClick={() => setIdeas(true)}>{ui("showIdeas", lang)}</button> : (
            <div className="ideas">
              <h3>{ui("keyIdeas", lang)}</h3>
              <ul>{block.requiredIdeas.map((x, i) => <li key={i}>{s.name(x)}</li>)}</ul>
              {block.commonMisconceptions.length > 0 && <><h3>{ui("watchOut", lang)}</h3><ul>{block.commonMisconceptions.map((x, i) => <li key={i}>{s.name(x)}</li>)}</ul></>}
            </div>
          )}
        </article>
      );
    case "summary":
      return (
        <article className="blk summary">
          <h2>{ui("summary", lang)}</h2>
          <ul>{block.points.map((p, i) => <li key={i}>{s.name(p)}</li>)}</ul>
          {block.formulas.length > 0 && <ul className="formulas">{block.formulas.map((f, i) => <li key={i}><code>{f}</code></li>)}</ul>}
        </article>
      );
  }
}

export function LessonPlayer({ lesson, links }: { lesson: TopicLesson; links: PlayerLinks }) {
  const s = useSettings();
  const { lang } = s;
  const save = s.get("lesson.progress.save");
  const blocks = useMemo(() => lesson.blocks.filter((b) => (b.type !== "teach_back" || s.get("lesson.teachBack.show"))), [lesson, s]);
  const total = blocks.length;
  const scroll = s.get<string>("lesson.mode") === "scroll";
  const [step, setStep] = useState(() => {
    const p = save ? getProgress(lesson.topicId) : null;
    return p && !p.done ? Math.min(p.step, total - 1) : 0;
  });
  const [resumed, setResumed] = useState(() => step > 0);
  const [done, setDone] = useState(false);
  const head = useRef<HTMLHeadingElement>(null);

  useEffect(() => { if (save && !done) saveProgress(lesson.topicId, { step, total, done: false }); }, [save, step, total, done, lesson.topicId]);
  useEffect(() => { head.current?.focus({ preventScroll: false }); }, [step, done]);

  const finish = useCallback(() => { setDone(true); if (save) saveProgress(lesson.topicId, { step: total - 1, total, done: true }); }, [save, lesson.topicId, total]);
  const go = useCallback((d: number) => { setResumed(false); setStep((n) => { const x = n + d; return Math.max(0, Math.min(total - 1, x)); }); }, [total]);
  const onKey = s.get("lesson.keyboard") && !scroll;
  useEffect(() => {
    if (!onKey || done) return;
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") { if (step < total - 1) go(1); } else if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, [onKey, done, go, step, total]);

  if (total === 0) return <div className="paper lesson"><p className="soon-note">{ui("lessonsPreparing", lang)}</p></div>;
  if (done) {
    return (
      <div className="paper lesson done" aria-live="polite">
        <h1 ref={head} tabIndex={-1}>{ui("lessonDone", lang)}</h1>
        {s.get("lesson.celebrate") && <p className="party" aria-hidden="true">★ ★ ★</p>}
        <p className="lead">{s.text("lesson.complete.message")}</p>
        <div className="actions">
          {links.nextHref && <Link className="btn" href={links.nextHref}>{ui("nextTopic", lang)}{links.nextLabel ? `: ${links.nextLabel}` : ""}</Link>}
          <Link className="btn ghost" href={links.chapterHref}>{ui("backToChapter", lang)}</Link>
          <button type="button" className="btn ghost" onClick={() => { setDone(false); setStep(0); }}>{ui("reviewLesson", lang)}</button>
        </div>
      </div>
    );
  }

  const last = step === total - 1;
  const pct = Math.round(((scroll ? total : step + 1) / total) * 100);
  return (
    <div className="paper lesson">
      <div className="lesson-bar">
        <Link className="link" href={links.chapterHref}>← {ui("exitLesson", lang)}</Link>
        {save && step > 0 && <button type="button" className="link" onClick={() => { clearProgress(lesson.topicId); setStep(0); setResumed(false); }}>{ui("startOver", lang)}</button>}
      </div>
      <h1 ref={head} tabIndex={-1}>{s.name(lesson.title)}</h1>
      {s.get("lesson.progress.bar") && (
        <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={scroll ? total : step + 1} aria-label={`${ui("stepOf", lang)} ${step + 1} ${ui("ofWord", lang)} ${total}`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      )}
      {resumed && <p className="small" role="status">{ui("resumed", lang)}</p>}
      {scroll ? (
        <>
          {blocks.map((b) => <Block key={b.id} block={b} />)}
          <div className="lesson-nav"><span /><button type="button" className="btn" onClick={finish}>{ui("finish", lang)}</button></div>
        </>
      ) : (
        <>
          <p className="small step-count">{ui("stepOf", lang)} {step + 1} {ui("ofWord", lang)} {total}</p>
          <Block key={blocks[step]!.id} block={blocks[step]!} />
          <div className="lesson-nav">
            <button type="button" className="btn ghost" onClick={() => go(-1)} disabled={step === 0}>← {ui("back", lang)}</button>
            {last ? <button type="button" className="btn" onClick={finish}>{ui("finish", lang)}</button> : <button type="button" className="btn" onClick={() => go(1)}>{ui("next", lang)} →</button>}
          </div>
        </>
      )}
    </div>
  );
}
