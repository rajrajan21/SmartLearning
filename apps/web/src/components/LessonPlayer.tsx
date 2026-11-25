import { SpeakAnswer } from "./SpeakAnswer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recordLessonOpened } from "../lib/lesson-guide";
import { Link } from "wouter";
import type { ContentBlock, PublicQuestion, TopicLesson } from "@studysmart/shared";
import { AskTeacher } from "./AskTeacher";
import { QuestionCard } from "./QuestionCard";
import { useSettings } from "../lib/settings";
import { ui, type UiKey } from "../lib/i18n";
import { Board } from "./Board";
import { boardAt, hasBoard } from "../lib/board";
import { useDeviceVoice, useNarrator } from "../lib/narrator";
import { toggleNote, useNotebook } from "../lib/tier2";
import { StepDots } from "./StepDots";
import { ScrollySections, type ScrollyPic } from "./Scrolly";
import { getProgress, saveProgress, clearProgress } from "../lib/progress";

const KIND: Record<ContentBlock["type"], UiKey> = { story: "kindStory", explanation: "kindIdea", worked_example: "kindExample", image: "kindPicture", diagram: "kindPicture", teacher_narration: "kindTeacher", quiz: "kindCheck", teach_back: "kindExplain", summary: "kindSummary" };
export interface BarListen { playing: boolean; toggle: () => void }
import { LessonCompletionHub, Timeline } from "./LessonFlow";
import { usePageTour } from "./SpotlightTour";
import type { HelpQuickJump } from "../lib/spotlightTour";

export interface PlayerLinks { topicHref?: string; chapterHref: string; nextHref: string | null; nextLabel: string | null; note?: { href: string; subject: { en: string; ta?: string } } }

const paragraphs = (t: string) => t.split("\n").filter((p) => p.trim().length > 0);

function Narration({ block, register }: { block: Extract<ContentBlock, { type: "teacher_narration" }>; register?: (c: BarListen | null) => void }) {
  const s = useSettings();
  const { lang } = s;
  const voiceOn = s.get("feature.teacherNarration");
  const device = useDeviceVoice(lang, voiceOn && s.get("narration.browserVoice"));
  const n = useNarrator(block.sentences, { lang, autoAdvance: s.get("narration.autoAdvance"), initialRate: Number(s.get<string>("narration.defaultSpeed")), deviceVoice: device, pauseMs: s.get<number>("narration.pauseBetweenMs") });
  const canSpeak = voiceOn && n.source !== "none";
  const showBoard = voiceOn && s.get("narration.showBoard") && hasBoard(block.sentences);
  const highlight = s.get("narration.highlight");
  const textVisible = s.get("lesson.narration.showText") || !canSpeak;
  const board = boardAt(block.sentences, n.playing || n.index > 0 ? n.index : block.sentences.length - 1);
  const latest = useRef(n); latest.current = n;
  useEffect(() => { if (register && canSpeak) register({ playing: n.playing, toggle: () => (latest.current.playing ? latest.current.pause() : latest.current.play()) }); }, [register, canSpeak, n.playing]);
  useEffect(() => () => register?.(null), [register]);
  const rates = [["0.8", "slow"], ["1", "normal"], ["1.2", "fast"]] as const;
  return (
    <article className="blk narration">
      <h2>{s.text("narration.teacherName")}</h2>
      {canSpeak && (
        <div className={s.get("lesson.listen.stable") === true ? "narr-controls stable" : "narr-controls"} data-tour="lesson-controls">
          <button type="button" className="btn listen-btn" onClick={() => (n.playing ? n.pause() : n.play())} aria-pressed={n.playing}>{n.playing ? `❚❚ ${ui("pause", lang)}` : `▶ ${ui("listen", lang)}`}</button>
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

/** Quick-check questions inside the lesson: same cards and same server grading as the practice rounds. */
function Checkpoint({ questions }: { questions: PublicQuestion[] }) {
  const s = useSettings();
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  if (i >= questions.length) return (<article className="blk checkpoint" aria-live="polite"><h2>{ui("checkpoint", s.lang)}</h2><p className="lead">{ui("roundScore", s.lang)} {right} {ui("outOf", s.lang)} {questions.length}</p></article>);
  return (
    <article className="blk checkpoint">
      <h2>{ui("checkpoint", s.lang)} <span className="small">{i + 1} {ui("ofWord", s.lang)} {questions.length}</span></h2>
      <QuestionCard key={questions[i]!.id} q={questions[i]!} compact nextLabel={i === questions.length - 1 ? ui("seeResults", s.lang) : undefined} onDone={(r) => { if (r.correct) setRight((n) => n + 1); setI((n) => n + 1); }} />
    </article>
  );
}

function Block({ block, questions, pictures, register }: { block: ContentBlock; questions: PublicQuestion[]; pictures: ScrollyPic[]; register?: (c: BarListen | null) => void }) {
  const s = useSettings();
  const { lang } = s;
  const [shown, setShown] = useState(() => (s.get("lesson.example.stepByStep") ? 1 : 99));
  const [answer, setAnswer] = useState("");
  const [ideas, setIdeas] = useState(false);
  switch (block.type) {
    case "story":
      return (<article className="blk story"><h2>{s.name(block.title)}</h2>{paragraphs(s.name(block.text)).map((p, i) => <p key={i}>{p}</p>)}</article>);
    case "explanation": {
      const paras = paragraphs(s.name(block.text));
      return (<article className="blk">{s.get("lesson.scrolly.enabled") === true ? <ScrollySections paras={paras} pictures={pictures} min={s.get<number>("lesson.scrolly.minParagraphs")} /> : paras.map((p, i) => <p key={i}>{p}</p>)}</article>);
    }
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
      return <Narration block={block} register={register} />;
    case "quiz": {
      const mine = s.get("feature.practice") && s.get("practice.lessonCheckpoints") ? block.questionIds.map((k) => questions.find((q) => q.key === k)).filter((q): q is PublicQuestion => !!q) : [];
      return mine.length > 0 ? <Checkpoint questions={mine} /> : (<article className="blk soon-note"><p>{ui("quizSoon", lang)}</p></article>);
    }
    case "teach_back":
      return (
        <article className="blk teachback">
          <p className="problem">{s.name(block.prompt)}</p>
          <label htmlFor={`tb-${block.id}`}>{ui("yourAnswer", lang)}</label>
          <textarea id={`tb-${block.id}`} rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <p className="small">{ui("yourAnswerHint", lang)}</p>
          <SpeakAnswer value={answer} onText={setAnswer} />
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

export function LessonPlayer({ lesson, links, questions = [] }: { lesson: TopicLesson; links: PlayerLinks; questions?: PublicQuestion[] }) {
  useEffect(() => { recordLessonOpened(lesson.topicId); }, [lesson.topicId]);
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
  const sections = useRef<Array<HTMLDivElement | null>>([]);
  const timeline = useRef<HTMLDivElement>(null);
  const notes = useNotebook();
  const [listen, setListen] = useState<BarListen | null>(null);
  const register = useCallback((c: BarListen | null) => setListen((prev) => (c === null ? (prev === null ? prev : null) : prev && prev.playing === c.playing ? prev : c)), []);
  const pictures = useMemo<ScrollyPic[]>(() => lesson.blocks.filter((b): b is Extract<ContentBlock, { type: "image" | "diagram" }> => b.type === "image" || b.type === "diagram").map((b) => ({ src: `/assets/lessons/${b.assetKey}`, alt: s.name(b.altText) })), [lesson, s]);
  const noteOn = s.get("notebook.enabled") === true && !!links.note;
  const saved = !!notes[lesson.topicId];

  useEffect(() => { if (save && !done) saveProgress(lesson.topicId, { step, total, done: false }); }, [save, step, total, done, lesson.topicId]);
  useEffect(() => { if (!timeline.current?.contains(document.activeElement)) head.current?.focus(); }, [step, done]);

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

  const [, routeBoard = "", routeCls = "", routeSubject = "", routeChapter = ""] = (links.topicHref ?? "").split("/");
  const hasRouteParts = Boolean(routeBoard && routeCls && routeSubject && routeChapter);
  const quickJumps = useMemo<HelpQuickJump[]>(() => {
    const ta = lang === "ta";
    const items: HelpQuickJump[] = [{ id: "topics", href: links.chapterHref, icon: "📚", label: ui("topics", lang) }];
    if (s.get("feature.practice") === true) {
      if (links.topicHref) items.push({ id: "practice", href: `${links.topicHref}/practice`, icon: "✏️", label: ta ? "பயிற்சியைத் தொடங்கு" : "Start practice" });
      if (hasRouteParts && s.get("feature.exams") === true) items.push({ id: "exam", href: `/exam/${routeBoard}/${routeCls}/${routeSubject}/${routeChapter}`, icon: "📝", label: ui("chapterTest", lang) });
      if (hasRouteParts && s.get("feature.worksheets") === true) items.push({ id: "worksheet", href: `/worksheet/${routeBoard}/${routeCls}/${routeSubject}/${routeChapter}`, icon: "📄", label: ui("worksheetWord", lang) });
      if (hasRouteParts && s.get("feature.games") === true && (s.get("games.quickfire") === true || s.get("games.survival") === true)) {
        const mode = s.get("games.quickfire") === true ? "quickfire" : "survival";
        items.push({ id: "games", href: `/play/${mode}/${routeBoard}/${routeCls}/${routeSubject}/${routeChapter}`, icon: "🎮", label: ui("gamesWord", lang) });
      }
    }
    if (links.nextHref) items.push({ id: "next", href: links.nextHref, icon: "➡️", label: links.nextLabel ? `${ui("nextTopic", lang)}: ${links.nextLabel}` : ui("nextTopic", lang) });
    return items;
  }, [hasRouteParts, lang, links.chapterHref, links.nextHref, links.nextLabel, links.topicHref, routeBoard, routeChapter, routeCls, routeSubject, s]);
  usePageTour(total > 0 ? { pageType: "lesson", tourActive: !done && step === 0, quickJumps } : null);

  if (total === 0) return <div className="paper lesson"><p className="soon-note">{ui("lessonsPreparing", lang)}</p></div>;
  if (done) {
    return (
      <div className="paper lesson done" aria-live="polite">
        <LessonCompletionHub
          mode="reading"
          topicId={lesson.topicId}
          topicHref={links.topicHref}
          chapterHref={links.chapterHref}
          nextHref={links.nextHref}
          nextLabel={links.nextLabel}
          heading={ui("lessonDone", lang)}
          headingRef={head}
          celebrate={s.get("lesson.celebrate") === true}
          message={s.text("lesson.complete.message")}
          onReplay={() => { setDone(false); setStep(0); }}
        />
      </div>
    );
  }

  const last = step === total - 1;
  const ask = s.get("feature.aiTutor") === true && s.get("tutor.inLessons") === true ? <AskTeacher topicId={lesson.topicId} about={s.name(lesson.title)} /> : null;
  const readable = s.get("lesson.readable") === true, bigNext = s.get("lesson.nextButton.big") === true;
  const split = s.get("lesson.split.enabled") === true && !scroll;
  const barListen = s.get("lesson.listen.inBar") === true && s.get("feature.teacherNarration") === true && blocks.some((b) => b.type === "teacher_narration");
  return (
    <div className={`paper lesson${barListen ? " has-bar-listen" : ""}${readable ? " readable" : ""}${split ? " split" : ""}`}>
      <div className="lesson-bar">
        <Link className="link" href={links.chapterHref}>← {ui("exitLesson", lang)}</Link>
        {noteOn && <button type="button" className="link heart" aria-pressed={saved} onClick={() => toggleNote({ id: lesson.topicId, href: links.note!.href, title: lesson.title, subject: links.note!.subject })}><span aria-hidden="true">{saved ? "❤️" : "🤍"}</span> {saved ? ui("nbSaved", lang) : ui("nbSave", lang)}</button>}
        {save && step > 0 && <button type="button" className="link" onClick={() => { clearProgress(lesson.topicId); setStep(0); setResumed(false); }}>{ui("startOver", lang)}</button>}
      </div>
      <h1 ref={head} tabIndex={-1}>{s.name(lesson.title)}</h1>
      {s.get("lesson.progress.bar") && (
        <div ref={timeline}>
          <Timeline value={step} max={total - 1} step={1}
            describe={at => `${ui("stepOf", lang)} ${at + 1} ${ui("ofWord", lang)} ${total} · ${ui(KIND[blocks[at]!.type], lang)}`}
            onSeek={at => {
              setResumed(false);
              setStep(at);
              if (scroll) sections.current[at]?.scrollIntoView({ block: "start" });
            }} />
        </div>
      )}
      {!scroll && s.get("lesson.dots.show") === true && <StepDots total={total} step={step} lang={lang} />}
      {resumed && <p className="small" role="status">{ui("resumed", lang)}</p>}
      {scroll ? (
        <>
          {blocks.map((b, i) => <div key={b.id} ref={el => { sections.current[i] = el; }}><Block block={b} questions={questions} pictures={pictures} /></div>)}
          {ask}
          <div className="lesson-nav"><span /><button type="button" className="btn" onClick={finish}>{ui("finish", lang)}</button></div>
        </>
      ) : (
        <div className={split ? "lesson-grid" : undefined}>
         <div className="lesson-main">
          {!s.get("lesson.progress.bar") && <p className="small step-count">{ui("stepOf", lang)} {step + 1} {ui("ofWord", lang)} {total}</p>}
          <Block key={blocks[step]!.id} block={blocks[step]!} questions={questions} pictures={pictures} register={register} />
          {!split && ask}
          <div className={bigNext ? "lesson-nav big-next" : "lesson-nav"} data-tour="lesson-stage">
            <button type="button" className="btn ghost back-btn" onClick={() => go(-1)} disabled={step === 0}>← {ui("back", lang)}</button>
            {barListen && (
              <span className="bar-slot">
                <button type="button" className="btn bar-listen" disabled={!listen} aria-hidden={!listen} tabIndex={listen ? 0 : -1} aria-pressed={listen?.playing ?? false} onClick={() => listen?.toggle()} aria-label={listen?.playing ? ui("pause", lang) : ui("listen", lang)}>
                  <span aria-hidden="true">{listen?.playing ? "❚❚" : "▶"}</span><span className="bl-txt">{listen?.playing ? ui("pause", lang) : ui("listen", lang)}</span>
                </button>
              </span>
            )}
            {last ? <button type="button" className={bigNext ? "btn big" : "btn"} onClick={finish}>{ui("finish", lang)}</button> : <button type="button" className={bigNext ? "btn big" : "btn"} onClick={() => go(1)}>{bigNext ? ui("nextStep", lang) : ui("next", lang)} →</button>}
          </div>
         </div>
         {split && (
           <aside className="lesson-side" aria-label={ui("outlineTitle", lang)}>
             <h2>{ui("outlineTitle", lang)}</h2>
             <ol className="outline">
               {blocks.map((b, i) => (
                 <li key={b.id}><button type="button" className={i === step ? "on" : i < step ? "past" : ""} aria-current={i === step ? "step" : undefined} onClick={() => { setResumed(false); setStep(i); }}>
                   <span className="o-n" aria-hidden="true">{i < step ? "✔" : i + 1}</span> {ui(KIND[b.type], lang)}
                 </button></li>
               ))}
             </ol>
             {ask}
           </aside>
         )}
        </div>
      )}
    </div>
  );
}
