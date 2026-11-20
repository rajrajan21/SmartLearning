import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";

export type TabKey = "learn" | "practice" | "worksheet" | "test";
/** One row of tabs on a topic: Learn, Practice, Worksheet, Test. Missing parts are greyed out, never hidden. */
export function TopicTabs({ base, chapter, topic, board, level, subject, current, has }: { base: string; chapter: string; topic: string; board: string; level: number; subject: string; current: TabKey; has: { learn: boolean; practice: boolean } }) {
  const s = useSettings();
  if (s.get("browse.topicTabs.show") !== true) return null;
  const topicHref = `${base}/${chapter}/${topic}`;
  const tabs: { key: TabKey; label: string; href: string | null }[] = [
    { key: "learn", label: ui("tabLearn", s.lang), href: has.learn ? `${topicHref}/learn` : null },
    { key: "practice", label: ui("tabPractice", s.lang), href: s.get("feature.practice") === true && has.practice ? `${topicHref}/practice` : null },
    { key: "worksheet", label: ui("tabWorksheet", s.lang), href: s.get("feature.worksheets") === true && s.get("feature.practice") === true && has.practice ? `/worksheet/${board}/${level}/${subject}/${chapter}` : null },
    { key: "test", label: ui("tabTest", s.lang), href: s.get("feature.exams") === true && s.get("feature.practice") === true && has.practice ? `/exam/${board}/${level}/${subject}/${chapter}` : null },
  ];
  return (
    <nav className="topic-tabs" aria-label="Ways to study this topic">
      {tabs.map((t) => t.href
        ? <Link key={t.key} href={t.href} className={`ttab${t.key === current ? " on" : ""}`} aria-current={t.key === current ? "page" : undefined}>{t.label}</Link>
        : <span key={t.key} className="ttab off" aria-disabled="true">{t.label}</span>)}
    </nav>
  );
}
