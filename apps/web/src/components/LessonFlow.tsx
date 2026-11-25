import { useRef, useState, type RefObject } from "react";
import { Link } from "wouter";
import type { BoardCurriculum } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { usePractice, usePracticeResults } from "../lib/practice";
import { getScore, scopeKey } from "../lib/chapterTools";
import { computeCompletionPlan, hasPassedExam, hasPassedPractice } from "../lib/completionHub";
import { ui } from "../lib/i18n";
import "./lesson-flow.css";

export type NextLink = { href: string; label: string };

export function nextChapter(tree: BoardCurriculum, board: string, level: number, subject: string, chapter: string, label: string): NextLink | undefined {
  const chapters = tree.classes.find(c => c.classLevel === level)?.subjects.find(s => s.slug === subject)?.chapters;
  const index = chapters?.findIndex(c => c.slug === chapter) ?? -1;
  const next = index < 0 ? undefined : chapters?.slice(index + 1).find(c => c.topics.length > 0);
  return next ? { href: `/${board}/${level}/${subject}/${next.slug}`, label } : undefined;
}

export function NextStep({ action }: { action: NextLink }) {
  const { lang } = useSettings();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return <Link className="btn ghost lesson-next-link" href={action.href}>{action.label} →</Link>;
  return <aside className="lesson-next" aria-label={lang === "ta" ? "அடுத்த படி" : "What to do next"}>
    <div>{lang === "ta" ? "அடுத்த படி" : "Up next"}</div>
    <Link className="btn" href={action.href}>{action.label} →</Link>
    <button type="button" className="lesson-next-close" aria-label={lang === "ta" ? "மூடு" : "Dismiss next-step tip"} onClick={() => setDismissed(true)}>×</button>
  </aside>;
}

export function LessonPractice({ topicHref, fallback }: { topicHref: string; fallback?: NextLink }) {
  const s = useSettings();
  const [, board = "", level = "", subject = "", chapter = "", topic = ""] = topicHref.split("/");
  const enabled = s.get("feature.practice") === true;
  const practice = usePractice(board, Number(level), subject, chapter, topic, enabled);
  const chapterTest = s.get("feature.exams") === true
    ? { href: `/exam/${board}/${level}/${subject}/${chapter}`, label: ui("chapterTest", s.lang) }
    : undefined;
  if (enabled && practice.status === "loading") return null;
  const practiceLink = enabled && practice.status === "ready" && practice.data?.questions.length
    ? { href: `${topicHref}/practice`, label: s.lang === "ta" ? "பயிற்சியைத் தொடங்கு" : "Start practice" }
    : undefined;
  const action = practiceLink ?? chapterTest ?? fallback;
  if (!action) return null;
  return <>
    <NextStep action={action} />
    {practiceLink && chapterTest && <Link className="btn ghost lesson-next-link" href={chapterTest.href}>{chapterTest.label}</Link>}
  </>;
}

export interface LessonCompletionHubProps {
  mode: "classroom" | "reading";
  topicId?: string;
  topicHref?: string;
  chapterHref: string;
  nextHref?: string | null;
  nextLabel?: string | null;
  heading: string;
  headingRef?: RefObject<HTMLHeadingElement | null>;
  message?: string;
  celebrate?: boolean;
  onReplay: () => void;
}

export function LessonCompletionHub({
  mode,
  topicId,
  topicHref,
  chapterHref,
  nextHref,
  nextLabel,
  heading,
  headingRef,
  message,
  celebrate,
  onReplay,
}: LessonCompletionHubProps) {
  const s = useSettings();
  const { lang } = s;
  const ta = lang === "ta";

  const hubEnabled = s.get("lesson.completionHub.enabled") !== false;
  const showStrip = s.get("lesson.completionHub.progressStrip") !== false;
  const adaptivePrimary = s.get("lesson.completionHub.adaptivePrimary") !== false;
  const showWorksheet = s.get("lesson.completionHub.showWorksheet") !== false;
  const showGames = s.get("lesson.completionHub.showGames") !== false;
  const showNextLesson = s.get("lesson.completionHub.showNextLesson") !== false;

  const [, board = "", level = "", subject = "", chapter = "", topic = ""] = (topicHref ?? "").split("/");
  const hasRouteParts = Boolean(board && level && subject && chapter);
  const practiceFeature = s.get("feature.practice") === true;
  const practice = usePractice(board, Number(level), subject, chapter, topic, hubEnabled && practiceFeature && Boolean(topicHref && topic));
  const resolvedTopicId = topicId ?? (practice.status === "ready" ? practice.data?.topicId : undefined);
  const practiceResults = usePracticeResults(resolvedTopicId);
  const practiceDone = hasPassedPractice(practiceResults);

  const examsFeature = practiceFeature && s.get("feature.exams") === true;
  const worksheetsFeature = practiceFeature && s.get("feature.worksheets") === true;
  const quickFireFeature = practiceFeature && s.get("feature.games") === true && s.get("games.quickfire") === true;
  const survivalFeature = practiceFeature && s.get("feature.games") === true && s.get("games.survival") === true;

  const examScore = hasRouteParts ? getScore(scopeKey("exam", board, level, subject, chapter)) : undefined;
  const examPassMark = Number(s.get("exams.passPercent") ?? 60);
  const examDone = hasPassedExam(examScore, examPassMark);

  const practiceHref = practiceFeature && practice.status === "ready" && (practice.data?.questions.length ?? 0) > 0 && topicHref
    ? `${topicHref}/practice`
    : undefined;
  const examHref = examsFeature && hasRouteParts ? `/exam/${board}/${level}/${subject}/${chapter}` : undefined;
  const worksheetHref = showWorksheet && worksheetsFeature && hasRouteParts ? `/worksheet/${board}/${level}/${subject}/${chapter}` : undefined;
  const gamesHref = showGames && (quickFireFeature || survivalFeature) && hasRouteParts
    ? `/play/${quickFireFeature ? "quickfire" : "survival"}/${board}/${level}/${subject}/${chapter}`
    : undefined;
  const nextLessonHref = showNextLesson && nextHref ? nextHref : undefined;

  const replayLabel = mode === "classroom" ? ui("classroomAgain", lang) : ui("reviewLesson", lang);
  const backHref = mode === "classroom" ? (topicHref ?? chapterHref) : chapterHref;
  const backLabel = mode === "classroom" ? ui("classroomBack", lang) : ui("backToChapter", lang);
  const practiceLabel = ta ? "பயிற்சியைத் தொடங்கு" : "Start practice";
  const examLabel = ui("chapterTest", lang);
  const nextLessonText = nextLabel
    ? `${ui("nextTopic", lang)}: ${nextLabel}`
    : (ta ? "அடுத்த பாடம்" : "Next lesson");

  if (!hubEnabled) {
    if (mode === "classroom") {
      return (
        <div className="class-done" role="status">
          <b>{heading}</b>
          <div className="chips-row">
            <button type="button" className="btn" onClick={onReplay}>{replayLabel}</button>
            <Link className="btn ghost" href={backHref}>{backLabel}</Link>
          </div>
        </div>
      );
    }
    return (
      <>
        <h1 ref={headingRef} tabIndex={-1}>{heading}</h1>
        {celebrate && <p className="party" aria-hidden="true">★ ★ ★</p>}
        {message && <p className="lead">{message}</p>}
        <div className="actions">
          {nextHref && <Link className="btn" href={nextHref}>{nextLessonText}</Link>}
          <Link className="btn ghost" href={chapterHref}>{backLabel}</Link>
          <button type="button" className="btn ghost" onClick={onReplay}>{replayLabel}</button>
        </div>
      </>
    );
  }

  const plan = computeCompletionPlan({
    hasPractice: Boolean(practiceHref),
    practiceDone,
    hasExam: Boolean(examHref),
    examDone,
    hasNext: Boolean(nextLessonHref),
    adaptivePrimary,
  });

  const promoteNextIntoMain = plan.primary === "next" && Boolean(nextLessonHref);
  const stripLabels: Record<"lesson" | "practice" | "exam" | "next", string> = {
    lesson: ta ? "பாடம்" : "Lesson",
    practice: ta ? "பயிற்சி" : "Practice",
    exam: ui("chapterTest", lang),
    next: ui("nextTopic", lang),
  };

  const inner = (
    <>
      {mode === "classroom" ? (
        <b className="completion-heading">{heading}</b>
      ) : (
        <>
          <h1 ref={headingRef} tabIndex={-1}>{heading}</h1>
          {celebrate && <p className="party" aria-hidden="true">★ ★ ★</p>}
          {message && <p className="lead">{message}</p>}
        </>
      )}

      {showStrip && (
        <ol className="completion-strip" aria-label={ta ? "பாட முன்னேற்றம்" : "Lesson progress"}>
          {plan.steps.map((st, idx) => (
            <li key={st.id} className={`completion-step${st.done ? " done" : ""}${st.current ? " current" : ""}`}>
              {idx > 0 && <span className="completion-sep" aria-hidden="true">·</span>}
              <span>
                {stripLabels[st.id]}
                {st.done ? " ✓" : ""}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="completion-actions" role="group" aria-label={ta ? "அடுத்த படிகள்" : "Next steps"}>
        {practiceHref && (
          <Link className={plan.primary === "practice" ? "btn" : "btn ghost"} href={practiceHref}>
            {practiceLabel}{practiceDone ? " ✓" : plan.primary === "practice" ? " →" : ""}
          </Link>
        )}
        {examHref && (
          <Link className={plan.primary === "exam" ? "btn" : "btn ghost"} href={examHref}>
            {examLabel}{examDone ? " ✓" : plan.primary === "exam" ? " →" : ""}
          </Link>
        )}
        {promoteNextIntoMain && nextLessonHref && (
          <Link className="btn" href={nextLessonHref}>
            {nextLessonText} →
          </Link>
        )}
        <button type="button" className={plan.primary === "replay" ? "btn" : "btn ghost"} onClick={onReplay}>
          {replayLabel}
        </button>
        <Link className="btn ghost" href={backHref}>
          {backLabel}
        </Link>
      </div>

      {(worksheetHref || gamesHref || (nextLessonHref && !promoteNextIntoMain)) && (
        <nav className="completion-extras" aria-label={ta ? "மேலும் விருப்பங்கள்" : "More options"}>
          {worksheetHref && <Link className="completion-extra-link" href={worksheetHref}>{ui("worksheetWord", lang)}</Link>}
          {gamesHref && <Link className="completion-extra-link" href={gamesHref}>{ui("gamesWord", lang)}</Link>}
          {nextLessonHref && !promoteNextIntoMain && (
            <Link className="completion-extra-link completion-extra-next" href={nextLessonHref}>{nextLessonText} →</Link>
          )}
        </nav>
      )}
    </>
  );

  if (mode === "classroom") {
    return (
      <div className="class-done completion-hub completion-hub-canvas" role="status" data-tour="lesson-done-hub">
        {inner}
      </div>
    );
  }
  return (
    <section className="completion-hub completion-hub-reading" data-tour="lesson-done-hub">
      {inner}
    </section>
  );
}

export function Timeline({ value, max, step = "any", describe, onSeek }: {
  value: number; max: number; step?: number | "any"; describe: (at: number) => string; onSeek: (at: number) => void;
}) {
  const { lang } = useSettings();
  const [preview, setPreview] = useState<number | null>(null);
  const dragging = useRef(false);
  const title = lang === "ta" ? "பாடத்தின் பகுதி" : "Lesson timeline";
  const at = Math.max(0, Math.min(max, preview ?? value));
  const clearPreview = () => { dragging.current = false; setPreview(null); };
  return <div className="lesson-timeline" data-tour="lesson-timeline">
    <label>
      <span>{title}</span>
      <span>{describe(at)}</span>
      <input type="range" min={0} max={max} step={step} value={at} disabled={!max} aria-label={title} aria-valuetext={describe(at)}
        onPointerDown={() => { dragging.current = true; }}
        onChange={e => { const next = e.currentTarget.valueAsNumber; if (dragging.current) setPreview(next); else onSeek(next); }}
        onPointerUp={e => { if (dragging.current) onSeek(e.currentTarget.valueAsNumber); clearPreview(); }}
        onPointerCancel={clearPreview}
        onBlur={clearPreview} />
    </label>
  </div>;
}
