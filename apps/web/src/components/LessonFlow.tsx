import { useRef, useState } from "react";
import { Link } from "wouter";
import type { BoardCurriculum } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { usePractice } from "../lib/practice";
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

export function Timeline({ value, max, step = "any", describe, onSeek }: {
  value: number; max: number; step?: number | "any"; describe: (at: number) => string; onSeek: (at: number) => void;
}) {
  const { lang } = useSettings();
  const [preview, setPreview] = useState<number | null>(null);
  const dragging = useRef(false);
  const title = lang === "ta" ? "பாடத்தின் பகுதி" : "Lesson timeline";
  const at = Math.max(0, Math.min(max, preview ?? value));
  const clearPreview = () => { dragging.current = false; setPreview(null); };
  return <div className="lesson-timeline">
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
