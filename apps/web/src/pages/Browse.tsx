import { Link, useParams } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useBoard, useLesson, useLessonTopicIds, useRetry, useTopic } from "../lib/curriculum";
import { useAllProgress, useTopicProgress } from "../lib/progress";
import { usePractice, usePracticeResults } from "../lib/practice";
import { useMastery } from "../lib/mastery";
import { MasteryTag } from "./Progress";
import { LessonPlayer } from "../components/LessonPlayer";
import { subjectVar } from "../lib/theme";
import { Crumbs, ErrorBox, Loading, NotFound, Title } from "../components/bits";

function useCurriculum() {
  const { board = "cbse", cls = "0" } = useParams<{ board: string; cls: string }>();
  const [attempt, retry] = useRetry();
  const state = useBoard(board, attempt);
  const s = useSettings();
  const level = Number(cls);
  const allowed = Number.isInteger(level) && (s.get<number[]>("catalog.openClasses")).includes(level);
  return { board, level, allowed, state, retry };
}

export function ClassPage() {
  const s = useSettings();
  const { board, level, allowed, state, retry } = useCurriculum();
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  const cls = state.data.classes.find((c) => c.classLevel === level);
  if (!allowed || !cls) return <NotFound />;
  return (
    <div className="paper">
      <Crumbs items={[{ href: "/", label: ui("home", s.lang) }, { label: `${state.data.boardCode} · ${ui("classWord", s.lang)} ${level}` }]} />
      <h1>{ui("classWord", s.lang)} {level}</h1>
      <h2 className="sr">{ui("subjects", s.lang)}</h2>
      <ul className="notebooks">
        {cls.subjects.map((sub) => (
          <li key={sub.id}>
            <Link className="notebook" href={`/${board}/${level}/${sub.slug}`} style={{ ["--cover" as string]: subjectVar(sub.slug) }}>
              <span className="nb-title"><Title name={sub.name} /></span>
              <span className="nb-meta">{sub.chapters.length} {ui("chapters", s.lang)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SubjectPage() {
  const s = useSettings();
  const { subject = "" } = useParams<{ subject: string }>();
  const { board, level, allowed, state, retry } = useCurriculum();
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  const sub = state.data.classes.find((c) => c.classLevel === level)?.subjects.find((x) => x.slug === subject);
  if (!allowed || !sub) return <NotFound />;
  return (
    <div className="paper" style={{ ["--cover" as string]: subjectVar(sub.slug) }}>
      <Crumbs items={[{ href: "/", label: ui("home", s.lang) }, { href: `/${board}/${level}`, label: `${ui("classWord", s.lang)} ${level}` }, { label: s.name(sub.name) }]} />
      <h1 className="cover-title"><Title name={sub.name} /></h1>
      {s.get("home.footer.showSources") && sub.textbook && <p className="small">{ui("textbook", s.lang)}: {sub.textbook.title}{sub.textbook.publisher ? ` (${sub.textbook.publisher})` : ""}</p>}
      <ol className="chapters">
        {sub.chapters.map((ch) => (
          <li key={ch.id}>
            <Link href={`/${board}/${level}/${sub.slug}/${ch.slug}`}>
              <span className="num" aria-hidden="true">{ch.position}</span>
              <span className="ch-name"><Title name={ch.name} /></span>
              {ch.topics.length > 0 && <span className="count">{ch.topics.length} {ui("topicsCount", s.lang)}</span>}
            </Link>
          </li>
        ))}
      </ol>
      {s.get("feature.printView") && <button type="button" className="btn ghost noprint" onClick={() => window.print()}>{ui("print", s.lang)}</button>}
    </div>
  );
}

export function ChapterPage() {
  const s = useSettings();
  const progress = useAllProgress();
  const lessonIds = useLessonTopicIds(s.get("feature.lessons"));
  const masteryOf = useMastery(s.get("feature.mastery") === true);
  const { subject = "", chapter = "" } = useParams<{ subject: string; chapter: string }>();
  const { board, level, allowed, state, retry } = useCurriculum();
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  const sub = state.data.classes.find((c) => c.classLevel === level)?.subjects.find((x) => x.slug === subject);
  const idx = sub?.chapters.findIndex((c) => c.slug === chapter) ?? -1;
  if (!allowed || !sub || idx < 0) return <NotFound />;
  const ch = sub.chapters[idx]!;
  const prev = sub.chapters[idx - 1], next = sub.chapters[idx + 1];
  const base = `/${board}/${level}/${sub.slug}`;
  return (
    <div className="paper" style={{ ["--cover" as string]: subjectVar(sub.slug) }}>
      <Crumbs items={[{ href: "/", label: ui("home", s.lang) }, { href: `/${board}/${level}`, label: `${ui("classWord", s.lang)} ${level}` }, { href: base, label: s.name(sub.name) }, { label: s.name(ch.name) }]} />
      <p className="small">{ui("chapter", s.lang)} {ch.position}</p>
      <h1 className="cover-title"><Title name={ch.name} /></h1>
      {s.get("feature.chapterTopics") && (
        ch.topics.length === 0 ? <p className="soon-note">{ui("lessonsPreparing", s.lang)}</p> : (
          <>
            <h2>{ui("topics", s.lang)}</h2>
            <ul className="topics">
              {ch.topics.map((t) => (
                <li key={t.id}>
                  <Link href={`${base}/${ch.slug}/${t.slug}`}><Title name={t.name} /></Link>
                  {s.get("feature.lessons") && lessonIds.has(t.id) && <span className="tag">{ui("hasLesson", s.lang)}</span>}
                  {s.get("feature.mastery") === true && s.get("mastery.badges") === true && (() => { const m = masteryOf(t.id); return m && m.level !== "new" ? <MasteryTag m={m} /> : null; })()}
                  {s.get("lesson.progress.showTicks") && progress[t.id]?.done && <span className="tick" title={ui("lessonTick", s.lang)} role="img" aria-label={ui("lessonTick", s.lang)}>✓</span>}
                </li>
              ))}
            </ul>
          </>
        )
      )}
      {ch.topics.length > 0 && s.get("feature.practice") === true && (s.get("feature.exams") === true || s.get("feature.worksheets") === true || s.get("feature.games") === true) && (
        <>
          <h2>{ui("chapterTest", s.lang)}</h2>
          <div className="actions">
            {s.get("feature.exams") === true && <Link className="btn" href={`/exam/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("chapterTest", s.lang)}</Link>}
            {s.get("feature.worksheets") === true && <Link className="btn ghost" href={`/worksheet/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("worksheetWord", s.lang)}</Link>}
            {s.get("feature.games") === true && s.get("games.quickfire") === true && <Link className="btn ghost" href={`/play/quickfire/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("quickFire", s.lang)}</Link>}
            {s.get("feature.games") === true && s.get("games.survival") === true && <Link className="btn ghost" href={`/play/survival/${board}/${level}/${sub.slug}/${ch.slug}`}>{ui("survival", s.lang)}</Link>}
          </div>
        </>
      )}
      <nav className="pager" aria-label="Chapters">
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
  const practice = usePractice(board, level, subject, chapter, topic, practiceOn);
  const pres = usePracticeResults(practice.status === "ready" ? practice.data?.topicId : undefined);
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
      {lessonOn && lesson.status === "ready" && lesson.data && (
        <p className="actions">
          <Link className="btn" href={`${link({ classLevel: level, subjectSlug: d.subject.slug, chapterSlug: d.chapter.slug, topicSlug: d.topic.slug })}/learn`}>
            {prog?.done ? ui("reviewLesson", s.lang) : prog && prog.step > 0 ? ui("continueLesson", s.lang) : ui("startLesson", s.lang)}
          </Link>
          {prog?.done && s.get("lesson.progress.showTicks") && <span className="tick" role="img" aria-label={ui("lessonTick", s.lang)}>✓</span>}
        </p>
      )}
      {practiceOn && practice.status === "ready" && practice.data && (
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
  if (!allowed || !lessonOn) return <NotFound />;
  if (detail.status === "loading" || lesson.status === "loading") return <Loading />;
  if (detail.status === "error" || lesson.status === "error" || !lesson.data) return <NotFound />;
  const d = detail.data;
  const base = `/${board}/${level}/${d.subject.slug}`;
  const next = d.next;
  return (
    <div style={{ ["--cover" as string]: subjectVar(d.subject.slug) }}>
      <LessonPlayer
        key={lesson.data.topicId}
        lesson={lesson.data}
        questions={checkpoints.status === "ready" && checkpoints.data ? checkpoints.data.questions : []}
        links={{
          chapterHref: `${base}/${d.chapter.slug}`,
          nextHref: next ? `/${board}/${next.classLevel}/${next.subjectSlug}/${next.chapterSlug}/${next.topicSlug}` : null,
          nextLabel: next ? s.name(next.name) : null,
        }}
      />
    </div>
  );
}
