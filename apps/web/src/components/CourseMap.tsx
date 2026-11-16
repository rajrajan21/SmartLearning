import { Link } from "wouter";
import type { Progress } from "../lib/progress";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { chapterFrac } from "../lib/browseStats";
import { Title } from "./bits";

interface Topic { id: string; slug: string; name: { en: string; ta?: string } }
interface Chapter { id: string; slug: string; position: number; name: { en: string; ta?: string }; topics: Topic[] }

/** The subject's chapters in order, one under another, each with its topics. Every row is a real link. */
export function CourseMap({ chapters, base, progress, lessonIds, showTopics, onPreview }: { chapters: Chapter[]; base: string; progress: Record<string, Progress>; lessonIds: Set<string>; showTopics: boolean; onPreview?: (id: string) => void }) {
  const s = useSettings();
  const next = chapters.findIndex((c) => c.topics.length > 0 && chapterFrac(c.topics, progress).pct < 100);
  return (
    <nav aria-label={ui("pathSubject", s.lang)} className="course-map">
      <h2 className="cm-h">{ui("pathSubject", s.lang)}</h2>
      <ol>
        {chapters.map((c, i) => {
          const f = chapterFrac(c.topics, progress), ready = c.topics.filter((t) => lessonIds.has(t.id)).length;
          const state = c.topics.length > 0 && f.pct === 100 ? "done" : i === next ? "now" : ready > 0 ? "open" : "soon";
          const label = state === "done" ? ui("cmDone", s.lang) : state === "now" ? ui("cmNext", s.lang) : ready > 0 ? `${ready} ${ui("cmLessons", s.lang)}` : ui("cmSoon", s.lang);
          return (
            <li key={c.id} className={`cm-${state}`}>
              <Link href={`${base}/${c.slug}`} className="cm-row" aria-label={`${ui("cmChapter", s.lang)} ${c.position}: ${s.name(c.name)}. ${label}`}>
                <span className="cm-num" aria-hidden="true">{state === "done" ? "✓" : c.position}</span>
                <span className="cm-title"><Title name={c.name} /></span>
                <span className="cm-state">{label}</span>
                {s.get("browse.chapterProgress.show") === true && s.get("feature.lessons") === true && c.topics.length > 0 && <span className={`ring${f.pct === 100 ? " full" : ""}`} style={{ ["--pct" as string]: `${f.pct}%` }} role="img" aria-label={`${f.pct}% ${ui("doneOf", s.lang)}`}>{f.pct === 100 ? "✓" : ""}</span>}
              </Link>
              {onPreview && c.topics.length > 0 && <button type="button" className="btn ghost sm cm-prev" onClick={() => onPreview(c.id)} aria-haspopup="dialog">{ui("previewBtn", s.lang)}</button>}
              {showTopics && c.topics.length > 0 && (
                <ul className="cm-topics">
                  {c.topics.map((t) => (
                    <li key={t.id} className={progress[t.id]?.done ? "t-done" : lessonIds.has(t.id) ? "t-ready" : "t-soon"}>
                      <Link href={`${base}/${c.slug}/${t.slug}`}><span className="cm-dot" aria-hidden="true">{progress[t.id]?.done ? "✓" : lessonIds.has(t.id) ? "▶" : "○"}</span><Title name={t.name} /></Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
