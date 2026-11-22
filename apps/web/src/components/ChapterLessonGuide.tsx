import { useEffect, useRef, useState, type MouseEvent } from "react";
import { dismissLessonGuide, recordGuideImpression, shouldOfferLessonGuide } from "../lib/lesson-guide";
import "./chapter-lesson-guide.css";

export function ChapterLessonGuide({ chapter, progressCount, targetId, tamil }: {
  chapter: string;
  progressCount: number;
  targetId: string;
  tamil: boolean;
}) {
  const [offered] = useState(() => shouldOfferLessonGuide(chapter, progressCount));
  const [visible, setVisible] = useState(true);
  const guide = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = guide.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        recordGuideImpression(chapter);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [chapter]);

  if (!offered || !visible) return null;
  const focusTopic = (event: MouseEvent<HTMLAnchorElement>) => {
    const topic = document.getElementById(targetId);
    if (!topic) return;
    event.preventDefault();
    recordGuideImpression(chapter);
    topic.focus();
  };

  return <aside className="chapter-lesson-guide" aria-label={tamil ? "பாட வழிகாட்டி" : "Lesson guide"}>
    <div ref={guide} className="chapter-lesson-guide-bubble">
      <a href={`#${targetId}`} onClick={focusTopic}>{tamil ? "உங்கள் பாடத்தை இங்கே தொடங்குங்கள்" : "Start your lesson here"}</a>
      <button type="button" aria-label={tamil ? "பாட வழிகாட்டியை மூடு" : "Dismiss lesson guide"} onClick={() => {
        dismissLessonGuide();
        setVisible(false);
      }}>×</button>
    </div>
  </aside>;
}
