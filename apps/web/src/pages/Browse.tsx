import { ShareLink } from "../components/ShareLink";
import { ChapterLessonGuide } from "../components/ChapterLessonGuide";
import { usePageTour } from "../components/SpotlightTour";
import type { HelpQuickJump } from "../lib/spotlightTour";
import { ParentNote } from "../components/ParentNote";
import { MindMap } from "../components/MindMap";
import { TopicTabs } from "../components/TopicTabs";
import { ReportProblem } from "../components/ReportProblem";
import { Link, Redirect, useParams } from "wouter";
import { useClassroomIndex } from "../lib/classroom";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard, useLesson, useLessonTopicIds, useRetry, useTopic } from "../lib/curriculum";
import { useAllProgress, useTopicProgress } from "../lib/progress";
import { usePractice, usePracticeResults } from "../lib/practice";
import { useMastery } from "../lib/mastery";
import { MasteryTag } from "./Progress";
import { AskTeacher } from "../components/AskTeacher";
import { subjectVar } from "../lib/theme";
import { chapterFrac, subjectFrac, subjectIcon } from "../lib/browseStats";
import { BoardPath, MasteryBar } from "../components/Tier1";
import { CourseMap } from "../components/CourseMap";
import { JourneyMap } from "../components/JourneyMap";
import { roughMinutes, THEMES, toggleNote, useNotebook } from "../lib/tier2";
import { BottomSheet } from "../components/BottomSheet";
import { useApp } from "../lib/useApp";
import { lazy, useMemo, useState } from "react";
import { FilterBox, matches } from "../components/SearchBox";
import { Crumbs, ErrorBox, Loading, NotFound, Title } from "../components/bits";
import { TextbookEntry } from "../components/reader/TextbookEntry";

const LessonPlayer = lazy(() => import("../components/LessonPlayer").then(module => ({ default: module.LessonPlayer })));

function useCurriculum() {
  const { board = "cbse", cls = "0" } = useParams<{ board: string; cls: string }>();
  const [attempt, retry] = useRetry();
  const state = useBoard(board, attempt);
  const s = useSettings();
  const level = Number(cls);
  const allowed = Number.isInteger(level) && (s.get<number[]>("catalog.openClasses")).includes(level);
  return { board, level, allowed, state, retry };
}

function ColourTiles() {
  const s = useSettings();
  return (
    <section className="colour-tiles" aria-label={ui("colourTiles", s.lang)}>
      <h2>{ui("colourTiles", s.lang)}</h2>
      <ul>{THEMES.map((t) => <li key={t.id}><Link href={`/explore?theme=${t.id}`} className="ctile" style={{ ["--tc" as string]: t.colour }}><span aria-hidden="true">{t.icon}</span><b>{ui(t.label, s.lang)}</b></Link></li>)}</ul>
    </section>
  );
}

export function ClassPage() {
  const s = useSettings();
  const { app } = useApp();
  const progress = useAllProgress();
  const { board, level, allowed, state, retry } = useCurriculum();
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  const cls = state.data.classes.find((c) => c.classLevel === level);
  if (!allowed || !cls) return <NotFound />;
  return (
    <div className="paper">
      <Crumbs items={[{ href: "/", label: ui("home", s.lang) }, { label: `${state.data.boardCode} · ${ui("classWord", s.lang)} ${level}` }]} />
      <h1>{ui("classWord", s.lang)} {level}</h1>
      {app && s.get("app.learn.colourTiles.show") === true && s.get("browse.explore.enabled") === true && <ColourTiles />}
      <h2 className="sr">{ui("subjects", s.lang)}</h2>
      <ul className="notebooks">
        {cls.subjects.map((sub) => (
          <li key={sub.id}>
            <Link className="notebook" href={`/${board}/${level}/${sub.slug}`} style={{ ["--cover" as string]: subjectVar(sub.slug) }}>
              {s.get("browse.subjectIcons.show") === true && <span className="nb-icon" aria-hidden="true">{subjectIcon(sub.slug)}</span>}
              <span className="nb-title"><Title name={sub.name} /></span>
              <span className="nb-meta">{sub.chapters.length} {ui("chapters", s.lang)}</span>
              {s.get("browse.subjectProgress.show") === true && s.get("feature.lessons") === true && (() => { const f = subjectFrac(sub.chapters, progress); return f.total > 0 ? (
                <span className="nb-prog"><span className="nb-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={f.pct} aria-label={`${f.pct}% ${ui("doneOf", s.lang)}`}><span style={{ width: `${f.pct}%` }} /></span><span className="nb-pct">{f.done}/{f.total} {ui("chaptersDone", s.lang)}</span></span>) : null; })()}
            </Link>
          </li>
        ))}
        <TextbookEntry level={level} />
      </ul>
    </div>
  );
}

export function SubjectPage() {
  const s = useSettings();
  const { app } = useApp();
  const masteryOf = useMastery(s.get("feature.mastery") === true);
  const [preview, setPreview] = useState<string | null>(null);
  const [fq, setFq] = useState("");
  const progress = useAllProgress();
  const lessonIds = useLessonTopicIds(s.get("feature.lessons"));
  const mapOn = s.get("browse.path.show") === true && s.get<string>("browse.path.style") !== "zigzag";
  const { subject = "" } = useParams<{ subject: string }>();
  const { board, level, allowed, state, retry } = useCurriculum();
  const sub = state.status === "ready" ? state.data.classes.find((c) => c.classLevel === level)?.subjects.find((x) => x.slug === subject) : undefined;
  const subjectQuickJumps = useMemo<HelpQuickJump[]>(() => {
    if (!allowed || !sub) return [];
    const items: HelpQuickJump[] = [];
    const firstCh = sub.chapters.find((c) => c.topics.length > 0) ?? sub.chapters[0];
    if (firstCh) items.push({ id: "topics", href: `/${board}/${level}/${sub.slug}/${firstCh.slug}`, icon: "📚", label: `${ui("chapter", s.lang)} 1: ${s.name(firstCh.name)}` });
    if (s.get("terms.enabled") === true && s.get("feature.practice") === true && sub.chapters.length > 0) {
      items.push({ id: "term", href: `/term/${board}/${level}/${sub.slug}`, icon: "📝", label: ui("termPapers", s.lang) });
    }
    if (s.get("browse.crossGrade.show") === true && sub.chapters.length > 0) {
      items.push({ id: "path", href: `/path/${board}/${sub.slug}`, icon: "🧭", label: ui("gradePathLink", s.lang) });
    }
    items.push({ id: "class", href: `/${board}/${level}`, icon: "🏫", label: `${ui("classWord", s.lang)} ${level}` });
    return items;
  }, [allowed, board, level, s, sub]);
  usePageTour(allowed && sub ? { pageType: "subject", quickJumps: subjectQuickJumps } : null);
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  if (!allowed || !sub) return <NotFound />;
  return (
    <div className="paper" style={{ ["--cover" as string]: subjectVar(sub.slug) }}>
      <Crumbs items={[{ href: "/", label: ui("home", s.lang) }, { href: `/${board}/${level}`, label: `${ui("classWord", s.lang)} ${level}` }, { label: s.name(sub.name) }]} />
      <h1 className="cover-title"><Title name={sub.name} /></h1>
      {s.get("home.footer.showSources") && sub.textbook && <p className="small">{ui("textbook", s.lang)}: {sub.textbook.title}{sub.textbook.publisher ? ` (${sub.textbook.publisher})` : ""}</p>}
      <ParentNote />
      {((s.get("browse.crossGrade.show") === true || (s.get("terms.enabled") === true && s.get("feature.practice") === true)) && sub.chapters.length > 0) && (
        <div data-tour="subject-paths">
          {s.get("browse.crossGrade.show") === true && <p className="actions"><Link className="btn ghost" href={`/path/${board}/${sub.slug}`}>🧭 {ui("gradePathLink", s.lang)}</Link></p>}
          {s.get("terms.enabled") === true && s.get("feature.practice") === true && <p className="actions"><Link className="btn ghost" href={`/term/${board}/${level}/${sub.slug}`}>📝 {ui("termPapers", s.lang)}</Link></p>}
        </div>
      )}
      <div data-tour="subject-progress">
        {s.get("browse.journey.show") === true && s.get("feature.lessons") === true && sub.chapters.length > 0 && <JourneyMap chapters={sub.chapters} base={`/${board}/${level}/${sub.slug}`} progress={progress} lessonIds={lessonIds} />}
        {mapOn && <CourseMap chapters={sub.chapters} base={`/${board}/${level}/${sub.slug}`} progress={progress} lessonIds={lessonIds} showTopics={s.get("browse.path.topics") === true} onPreview={app && s.get("app.learn.chapterSheet.show") === true ? setPreview : undefined} />}
        {!mapOn && s.get("browse.journey.show") !== true && s.get("browse.path.show") === true && s.get("feature.lessons") === true && sub.chapters.some((c) => c.topics.length > 0) && (() => {
          const fr = sub.chapters.map((c) => chapterFrac(c.topics, progress));
          const nowIdx = fr.findIndex((x, i) => sub.chapters[i]!.topics.length > 0 && x.pct < 100);
          const nodes = sub.chapters.map((c, i) => ({ id: c.id, href: `/${board}/${level}/${sub.slug}/${c.slug}`, name: c.name, subject: sub.name, state: (c.topics.length > 0 && fr[i]!.pct === 100 ? "done" : i === nowIdx ? "now" : "todo") as "done" | "now" | "todo" }));
          return <BoardPath nodes={nodes} streak={0} title="pathSubject" />;
        })()}
      </div>
      {sub.chapters.length > 3 && <div data-tour="subject-filter"><FilterBox value={fq} onChange={setFq} /></div>}
      {!mapOn && fq && !sub.chapters.some((c) => matches(fq, c.name.en, c.name.ta, ...c.topics.flatMap((x) => [x.name.en, x.name.ta]))) && <p className="filter-none" role="status">{ui("filterNone", s.lang)}</p>}
      {!mapOn && <ol className="chapters">
        {sub.chapters.filter((c) => matches(fq, c.name.en, c.name.ta, ...c.topics.flatMap((x) => [x.name.en, x.name.ta]))).map((ch) => (
          <li key={ch.id}>
            <Link href={`/${board}/${level}/${sub.slug}/${ch.slug}`}>
              <span className="num" aria-hidden="true">{s.get("browse.subjectIcons.show") === true ? subjectIcon(sub.slug) : ch.position}</span>
              <span className="ch-name"><Title name={ch.name} /></span>
              {s.get("browse.chapterProgress.show") === true && s.get("feature.lessons") === true && ch.topics.length > 0 && (() => { const f = chapterFrac(ch.topics, progress); return <span className={`ring${f.pct === 100 ? " full" : ""}`} style={{ ["--pct" as string]: `${f.pct}%` }} role="img" aria-label={`${f.pct}% ${ui("doneOf", s.lang)}`}>{f.pct === 100 ? "✓" : ""}</span>; })()}
              {ch.topics.length > 0 && <span className="count">{ch.topics.length} {ui("topicsCount", s.lang)}</span>}
            </Link>
            {app && s.get("app.learn.chapterSheet.show") === true && ch.topics.length > 0 && (
              <>
                {s.get("rewards.masteryBar.show") === true && s.get("feature.mastery") === true && <MasteryBar list={ch.topics.map((t) => masteryOf(t.id)).filter((m): m is NonNullable<typeof m> => m !== null)} label={ui("mbTitle", s.lang)} />}
                <button type="button" className="btn ghost sm" onClick={() => setPreview(ch.id)} aria-haspopup="dialog">{ui("previewBtn", s.lang)}</button>
              </>
            )}
          </li>
        ))}
      </ol>}
      {sub.chapters.filter((c) => c.id === preview).map((ch) => (
        <BottomSheet key={ch.id} open onClose={() => setPreview(null)} title={s.name(ch.name)}>
          <p className="syl-meta"><b>{ui("syllabusTopics", s.lang).replace("{n}", String(ch.topics.length))}</b> · {ui("syllabusMinutes", s.lang).replace("{n}", String(roughMinutes(ch.topics.length)))}</p>
          <ol className="sheet-topics">{ch.topics.map((t) => <li key={t.id}><Link href={`/${board}/${level}/${sub.slug}/${ch.slug}/${t.slug}`}><Title name={t.name} /></Link>{progress[t.id]?.done && <span className="tick" aria-label={ui("lessonTick", s.lang)}>✓</span>}</li>)}</ol>
          <Link className="btn" href={`/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("feedStart", s.lang)} →</Link>
        </BottomSheet>
      ))}
      {s.get("feature.printView") && <button type="button" className="btn ghost noprint" onClick={() => window.print()}>{ui("print", s.lang)}</button>}
    </div>
  );
}

export function ChapterPage() {
  const s = useSettings();
  const progress = useAllProgress();
  const lessonIds = useLessonTopicIds(s.get("feature.lessons"));
  const masteryOf = useMastery(s.get("feature.mastery") === true);
  const [tq, setTq] = useState("");
  const [topicQuery, setTopicQuery] = useState("");
  const { subject = "", chapter = "" } = useParams<{ subject: string; chapter: string }>();
  const { board, level, allowed, state, retry } = useCurriculum();
  const sub = state.status === "ready" ? state.data.classes.find((c) => c.classLevel === level)?.subjects.find((x) => x.slug === subject) : undefined;
  const idx = sub?.chapters.findIndex((c) => c.slug === chapter) ?? -1;
  const ch = idx >= 0 && sub ? sub.chapters[idx] : undefined;
  const prev = idx > 0 && sub ? sub.chapters[idx - 1] : undefined;
  const next = idx >= 0 && sub ? sub.chapters[idx + 1] : undefined;
  const base = sub ? `/${board}/${level}/${sub.slug}` : "";
  const chapterPath = ch ? `${base}/${ch.slug}` : "";
  const chapterQuickJumps = useMemo<HelpQuickJump[]>(() => {
    if (!allowed || !sub || !ch) return [];
    const items: HelpQuickJump[] = [];
    const firstTopic = ch.topics[0];
    if (firstTopic) {
      items.push({ id: "topics", href: `${chapterPath}/${firstTopic.slug}`, icon: "📚", label: ui("topics", s.lang) });
    }
    if (ch.topics.length > 0 && s.get("feature.practice") === true) {
      if (firstTopic) items.push({ id: "practice", href: `${chapterPath}/${firstTopic.slug}/practice`, icon: "✏️", label: ui("practice", s.lang) });
      if (s.get("feature.exams") === true) items.push({ id: "exam", href: `/exam/${board}/${level}/${sub.slug}/${ch.slug}`, icon: "📝", label: ui("chapterTest", s.lang) });
      if (s.get("feature.worksheets") === true) items.push({ id: "worksheet", href: `/worksheet/${board}/${level}/${sub.slug}/${ch.slug}`, icon: "📄", label: ui("worksheetWord", s.lang) });
      if (s.get("feature.games") === true && (s.get("games.quickfire") === true || s.get("games.survival") === true)) {
        const mode = s.get("games.quickfire") === true ? "quickfire" : "survival";
        items.push({ id: "games", href: `/play/${mode}/${board}/${level}/${sub.slug}/${ch.slug}`, icon: "🎮", label: ui("gamesWord", s.lang) });
      }
    }
    if (next) items.push({ id: "next", href: `${base}/${next.slug}`, icon: "➡️", label: ui("nextChapter", s.lang) });
    return items;
  }, [allowed, base, board, ch, chapterPath, level, next, s, sub]);
  usePageTour(allowed && sub && ch ? { pageType: "chapter", quickJumps: chapterQuickJumps } : null);
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  if (!allowed || !sub || !ch) return <NotFound />;
  const showTopicSearch = s.get("browse.topics.search") === true && ch.topics.length > 4;
  const visibleTopics = showTopicSearch ? ch.topics.filter((t) => matches(topicQuery, t.name.en, t.name.ta)) : ch.topics;
  const guideTopic = s.get("feature.lessons") && !topicQuery ? visibleTopics.find((topic) => lessonIds.has(topic.id)) : undefined;
  const progressCount = Object.keys(progress).length;
  const legacyGuide = s.get("ux.spotlightTour.enabled") !== true;
  return (
    <div className="paper" style={{ ["--cover" as string]: subjectVar(sub.slug) }}>
      <Crumbs items={[{ href: "/", label: ui("home", s.lang) }, { href: `/${board}/${level}`, label: `${ui("classWord", s.lang)} ${level}` }, { href: base, label: s.name(sub.name) }, { label: s.name(ch.name) }]} />
      <p className="small">{s.get("browse.missionWording.show") === true ? `${ui("missionWord", s.lang)} ${ch.position}` : `${ui("chapter", s.lang)} ${ch.position}`}</p>
      <h1 className="cover-title"><Title name={ch.name} /></h1>
      {s.get("browse.syllabus.show") === true && ch.topics.length > 0 && (
        <section className="syllabus" aria-label={ui("missionYour", s.lang)}>
          <h2>{ui("missionYour", s.lang)}</h2>
          <p className="syl-meta"><b>{ui("syllabusTopics", s.lang).replace("{n}", String(ch.topics.length))}</b> · {ui("syllabusMinutes", s.lang).replace("{n}", String(roughMinutes(ch.topics.length)))}</p>
          <h3>{ui("syllabusLearn", s.lang)}</h3>
          {ch.topics.length > 4 && <FilterBox value={tq} onChange={setTq} />}
          <ol>
            {ch.topics.filter((t) => matches(tq, t.name.en, t.name.ta)).map((t) => (
              <li key={t.id} className={progress[t.id]?.done ? "done" : ""}>
                <Link className="syl-topic" href={`${chapterPath}/${t.slug}`}>
                  <span className="syl-mark" aria-hidden="true">{progress[t.id]?.done ? "✔" : ""}</span>
                  <span><Title name={t.name} />
                    {progress[t.id]?.done ? <span className="small"> · {ui("syllabusDone", s.lang)}</span> : lessonIds.has(t.id) ? <span className="small"> · {ui("syllabusLesson", s.lang)}</span> : null}
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
      <ShareLink what={`${ui("classWord", s.lang)} ${level} ${s.name(sub.name)}: ${s.name(ch.name)}`} />
      {s.get("feature.chapterTopics") && (
        ch.topics.length === 0 ? <p className="soon-note">{ui("lessonsPreparing", s.lang)}</p> : (
          <section className="chapter-topics" aria-labelledby="chapter-topics-heading" data-tour="chapter-topics">
            <h2 id="chapter-topics-heading">{ui("topics", s.lang)}</h2>
            {s.get("rewards.masteryBar.show") === true && s.get("feature.mastery") === true && <MasteryBar list={ch.topics.map((t) => masteryOf(t.id)).filter((m): m is NonNullable<typeof m> => m !== null)} label={ui("mbTitle", s.lang)} />}
            {showTopicSearch && <FilterBox value={topicQuery} onChange={setTopicQuery} />}
            {visibleTopics.length === 0 && <p role="status">{s.lang === "ta" ? "பொருந்தும் தலைப்புகள் இல்லை." : "No matching topics."}</p>}
            <ul className={`chapter-topic-list ${s.get<string>("browse.topics.layout") === "list" ? "rows" : "cards"}`}>
              {visibleTopics.map((t) => (
                <li key={t.id}>
                  {legacyGuide && guideTopic?.id === t.id && <ChapterLessonGuide key={chapterPath} chapter={chapterPath} progressCount={progressCount} targetId="chapter-first-lesson" tamil={s.lang === "ta"} />}
                  <Link id={guideTopic?.id === t.id ? "chapter-first-lesson" : undefined} className="chapter-topic-link" href={`${chapterPath}/${t.slug}`}>
                    <Title name={t.name} /><span aria-hidden="true">→</span>
                  </Link>
                  {s.get("feature.lessons") && lessonIds.has(t.id) && <span className="tag">{ui("hasLesson", s.lang)}</span>}
                  {s.get("feature.mastery") === true && s.get("mastery.badges") === true && (() => { const m = masteryOf(t.id); return m && m.level !== "new" ? <MasteryTag m={m} /> : null; })()}
                  {s.get("lesson.progress.showTicks") && progress[t.id]?.done && <span className="tick" title={ui("lessonTick", s.lang)} role="img" aria-label={ui("lessonTick", s.lang)}>✓</span>}
                </li>
              ))}
            </ul>
          </section>
        )
      )}
      <div data-tour="chapter-practice">
        <MindMap title={s.name(ch.name)} topics={ch.topics.map((t) => ({ id: t.id, label: s.name(t.name), href: `${base}/${ch.slug}/${t.slug}`, done: progress[t.id]?.done === true }))} />
      </div>
      {ch.topics.length > 0 && s.get("feature.practice") === true && (s.get("feature.exams") === true || s.get("feature.worksheets") === true || s.get("feature.games") === true) && (
        <section data-tour="chapter-tools">
          <h2>{ui("chapterTest", s.lang)}</h2>
          <div className="actions">
            {s.get("feature.exams") === true && <Link className="btn" href={`/exam/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("chapterTest", s.lang)}</Link>}
            {s.get("feature.worksheets") === true && <Link className="btn ghost" href={`/worksheet/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("worksheetWord", s.lang)}</Link>}
            {s.get("feature.games") === true && s.get("games.quickfire") === true && <Link className="btn ghost" href={`/play/quickfire/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("quickFire", s.lang)}</Link>}
            {s.get("feature.games") === true && s.get("games.survival") === true && <Link className="btn ghost" href={`/play/survival/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("survival", s.lang)}</Link>}
          </div>
        </section>
      )}
      <nav className="pager" aria-label="Chapters" data-tour="chapter-pager">
        {prev ? <Link href={`${base}/${prev.slug}`}>← {ui("prevChapter", s.lang)}: {s.name(prev.name)}</Link> : <span />}
        {next ? <Link href={`${base}/${next.slug}`}>{ui("nextChapter", s.lang)}: {s.name(next.name)} →</Link> : <span />}
      </nav>
    </div>
  );
}

export function TopicPage() {
  const s = useSettings();
  const { subject = "", chapter = "", topic = "" } = useParams<{ subject: string; chapter: string; topic: string }>();
  const { board, level, allowed } = useCurriculum();
  const state = useTopic(board, level, subject, chapter, topic);
  const lessonOn = s.get("feature.lessons");
  const lesson = useLesson(board, level, subject, chapter, topic, lessonOn);
  const [prog] = useTopicProgress(lesson.status === "ready" ? lesson.data?.topicId : undefined);
  const practiceOn = s.get("feature.practice");
  const classOn = s.get("feature.classroom") === true;
  const classIdx = useClassroomIndex(classOn);
  const hasClass = classOn && classIdx.status === "ready" && classIdx.data.items.some((i) => i.classLevel === level && i.subject === subject && i.chapter === chapter && i.topic === topic);
  const preferClass = hasClass && s.get("lesson.preferClassroom") === true;
  const pres = usePracticeResults(state.status === "ready" ? state.data.topic.id : undefined);
  const notes = useNotebook();
  if (!allowed) return <NotFound />;
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <NotFound />;
  const d = state.data;
  const link = (r: { classLevel: number; subjectSlug: string; chapterSlug: string; topicSlug: string }) => `/${board}/${r.classLevel}/${r.subjectSlug}/${r.chapterSlug}/${r.topicSlug}`;
  const base = `/${board}/${level}/${d.subject.slug}`;
  return (
    <div className="paper" style={{ ["--cover" as string]: subjectVar(d.subject.slug) }}>
      <Crumbs items={[{ href: "/", label: ui("home", s.lang) }, { href: base, label: s.name(d.subject.name) }, { href: `${base}/${d.chapter.slug}`, label: s.name(d.chapter.name) }, { label: s.name(d.topic.name) }]} />
      <h1 className="cover-title"><Title name={d.topic.name} /></h1>
      {lesson.status === "ready" && lesson.data && s.get("feature.aiTutor") === true && s.get("tutor.inLessons") === true &&
        <AskTeacher key={lesson.data.topicId} topicId={lesson.data.topicId} about={s.name(d.topic.name)} />}
      <TopicTabs base={base} chapter={d.chapter.slug} topic={d.topic.slug} board={board} level={level} subject={d.subject.slug} current="learn" has={{ learn: (lessonOn && lesson.status === "ready" && !!lesson.data) || hasClass }} />
      {s.get("notebook.enabled") === true && <p className="actions"><button type="button" className="link heart" aria-pressed={!!notes[d.topic.id]} onClick={() => toggleNote({ id: d.topic.id.slice(0, 60), href: `${base}/${d.chapter.slug}/${d.topic.slug}`, title: d.topic.name, subject: d.subject.name })}><span aria-hidden="true">{notes[d.topic.id] ? "❤️" : "🤍"}</span> {notes[d.topic.id] ? ui("nbSaved", s.lang) : ui("nbSave", s.lang)}</button></p>}
      {hasClass && <p className="actions"><Link className="btn" href={`/classroom/${board}/${level}/${subject}/${chapter}/${topic}`}>🎓 {preferClass ? ui("startLesson", s.lang) : ui("classroomOpen", s.lang)}</Link></p>}
      {lessonOn && lesson.status === "ready" && lesson.data && (
        <p className="actions">
          <Link className="btn" href={`${link({ classLevel: level, subjectSlug: d.subject.slug, chapterSlug: d.chapter.slug, topicSlug: d.topic.slug })}/learn${preferClass ? "?steps" : ""}`}>
            {preferClass ? ui("stepLesson", s.lang) : prog?.done ? ui("reviewLesson", s.lang) : prog && prog.step > 0 ? ui("continueLesson", s.lang) : ui("startLesson", s.lang)}
          </Link>
          {prog?.done && s.get("lesson.progress.showTicks") && <span className="tick" role="img" aria-label={ui("lessonTick", s.lang)}>✓</span>}
        </p>
      )}
      {practiceOn === true && (
        <p className="actions">
          <Link className="btn ghost" href={`${link({ classLevel: level, subjectSlug: d.subject.slug, chapterSlug: d.chapter.slug, topicSlug: d.topic.slug })}/practice`}>{ui("startPractice", s.lang)}</Link>
          {s.get("practice.stars") && Object.keys(pres).length > 0 && <span className="stars" role="img" aria-label={`${Object.values(pres).reduce((a, r) => a + r.stars, 0)} ${ui("starsLabel", s.lang)}`}>{"★".repeat(Object.values(pres).reduce((a, r) => a + r.stars, 0))}</span>}
        </p>
      )}
      {d.objectives.length > 0 && (<><h2>{ui("learnGoals", s.lang)}</h2><ul className="goals">{d.objectives.map((o, i) => <li key={i}>{s.name(o.text)}</li>)}</ul></>)}
      {d.prerequisites.length > 0 && (<><h2>{ui("needFirst", s.lang)}</h2><ul className="topics">{d.prerequisites.map((r) => <li key={r.topicSlug}><Link href={link(r)}>{s.name(r.name)}</Link></li>)}</ul></>)}
      {d.unlocks.length > 0 && (<><h2>{ui("leadsTo", s.lang)}</h2><ul className="topics">{d.unlocks.map((r) => <li key={r.topicSlug}><Link href={link(r)}>{s.name(r.name)}</Link></li>)}</ul></>)}
      <nav className="pager" aria-label="Topics">
        {d.previous ? <Link href={link(d.previous)}>← {s.name(d.previous.name)}</Link> : <span />}
        {d.next ? <Link href={link(d.next)}>{s.name(d.next.name)} →</Link> : <span />}
      </nav>
    </div>
  );
}

export function LessonPage() {
  const s = useSettings();
  const { subject = "", chapter = "", topic = "" } = useParams<{ subject: string; chapter: string; topic: string }>();
  const { board, level, allowed } = useCurriculum();
  const detail = useTopic(board, level, subject, chapter, topic);
  const lessonOn = s.get("feature.lessons");
  const lesson = useLesson(board, level, subject, chapter, topic, lessonOn);
  const checkpoints = usePractice(board, level, subject, chapter, topic, s.get("feature.practice") === true && s.get("practice.lessonCheckpoints") === true);
  const classOn = s.get("feature.classroom") === true && s.get("lesson.preferClassroom") === true;
  const classIdx = useClassroomIndex(classOn);
  const forced = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("steps");
  if (classOn && !forced && classIdx.status === "loading") return <Loading />;
  if (classOn && !forced && classIdx.status === "ready" && classIdx.data.items.some((i) => i.classLevel === level && i.subject === subject && i.chapter === chapter && i.topic === topic)) return <Redirect to={`/classroom/${board}/${level}/${subject}/${chapter}/${topic}`} replace />;
  if (!allowed || !lessonOn) return <NotFound />;
  if (detail.status === "loading" || lesson.status === "loading") return <Loading />;
  if (detail.status === "error" || lesson.status === "error" || !lesson.data) return <NotFound />;
  const d = detail.data;
  const base = `/${board}/${level}/${d.subject.slug}`;
  const next = d.next;
  return (
    <div className="preset-lesson" style={{ ["--cover" as string]: subjectVar(d.subject.slug) }}>
      <LessonPlayer
        key={lesson.data.topicId}
        lesson={lesson.data}
        questions={checkpoints.status === "ready" && checkpoints.data ? checkpoints.data.questions : []}
        links={{
          chapterHref: `${base}/${d.chapter.slug}`,
          topicHref: `${base}/${d.chapter.slug}/${d.topic.slug}`,
          nextHref: next ? `/${board}/${next.classLevel}/${next.subjectSlug}/${next.chapterSlug}/${next.topicSlug}` : null,
          nextLabel: next ? s.name(next.name) : null,
          note: { href: `${base}/${d.chapter.slug}/${d.topic.slug}/learn`, subject: d.subject.name },
        }}
      />
      <ReportProblem kind="lesson" about={`${base}/${d.chapter.slug}/${d.topic.slug}`} where="onLessons" />
    </div>
  );
}
