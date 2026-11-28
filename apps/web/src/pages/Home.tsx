import { sample, matchesSample } from "../lib/sampleLesson";
import { usePreset } from "../lib/sitePresets";
import { Link } from "wouter";
import { useActiveBoard } from "../lib/activeBoard";
import { BoardChips } from "../components/BoardChips";
import { bandLabel, lt } from "../lib/library";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { SearchBox } from "../components/SearchBox";
import { useBoard, useRetry } from "../lib/curriculum";
import { useDueCount } from "../lib/revision";
import { useClassroomIndex } from "../lib/classroom";
import { Loading, ErrorBox } from "../components/bits";
import { useAllProgress } from "../lib/progress";
import { useRewards } from "../lib/streak";
import { findContinue } from "../lib/browseStats";
import { Title } from "../components/bits";
import { BoardPath } from "../components/Tier1";
import { continueId, firstLessonHref, lessonsToday, pathNodes, recentLessons } from "../lib/round2";
import { useLessonTopicIds } from "../lib/curriculum";
import { useApp } from "../lib/useApp";
import { AppFeed, DidYouKnow } from "../components/AppFeed";
import { Reminder } from "../components/Reminder";
import { DailyChallenge } from "../components/DailyChallenge";
import { PuzzleOfDay } from "../components/PuzzleOfDay";
import { Rich } from "../components/Rich";
import { WaterCycle } from "../components/TryIt";
import { gt } from "../lib/gk";
import { lazy, Suspense, useMemo } from "react";
import { usePageTour } from "../components/SpotlightTour";
import type { HelpQuickJump } from "../lib/spotlightTour";
const GkTodayCards = lazy(() => import("./Gk").then((m) => ({ default: m.GkTodayCards }))); // the GK page code is loaded only when the cards are shown

const COMING_BOARDS = [
  { code: "TNSB", en: "Tamil Nadu State Board", ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம்" },
  { code: "TNMB", en: "Tamil Nadu Matriculation", ta: "தமிழ்நாடு மெட்ரிகுலேஷன்" },
];

export function Home() {
  const s = useSettings();
  const preset = usePreset();
  const board = useActiveBoard();
  const [attempt, retry] = useRetry();
  const state = useBoard(board, attempt);
  const open = new Set(s.get<number[]>("catalog.openClasses"));
  const due = useDueCount();
  const mastery = s.get("feature.mastery") === true;
  const classOn = s.get("feature.classroom") === true;
  const classIdx = useClassroomIndex(classOn);
  const classCount = classIdx.status === "ready" ? classIdx.data.items.length : 0;
  const progress = useAllProgress();
  const rewards = useRewards(s.get<number>("rewards.streak.graceDays"));
  const cont = s.get("home.continue.show") === true && s.get("feature.lessons") === true && state.status === "ready" ? findContinue(state.data as never, progress, board) : null;
  const lessonIds = useLessonTopicIds(s.get("feature.lessons") === true);
  const tree = state.status === "ready" ? (state.data as never) : null;
  const openList = [...open];
  const sampleReady = s.get("home.tryLesson.show") === true && classOn && open.has(sample.classLevel)
    && s.get("home.tryLesson.classroom") !== false && classIdx.status === "ready" && classIdx.data.items.some(matchesSample);
  const tryHref = sampleReady ? sample.href : s.get("home.tryLesson.show") === true && tree ? firstLessonHref(tree, board, lessonIds, openList) : null;
  const recent = s.get("home.continue.show") === true && tree ? recentLessons(tree, progress, board, s.get<number>("home.recent.count"), continueId(tree, progress, board)) : [];
  const path = s.get("home.path.show") === true && s.get("feature.lessons") === true && tree ? pathNodes(tree, progress, board, openList, s.get<number>("home.path.length")) : [];
  const goalOn = s.get("rewards.dailyGoal.enabled") === true && s.get("rewards.streak.enabled") === true;
  const goal = s.get<number>("rewards.dailyGoal.lessons"), doneToday = lessonsToday(progress);
  const streakOn = s.get("rewards.streak.enabled") === true;
  const maxStreak = s.get<number>("rewards.streak.maxShown");
  const { app } = useApp();
  const firstClass = Math.min(...(open.size ? [...open] : [3]));
  const quick: { href: string; icon: string; label: string }[] = [{ href: `/${board.toLowerCase()}/${firstClass}`, icon: "📚", label: ui("navSubjects", s.lang) }];
  if (classOn && classCount > 0) quick.push({ href: "/classroom", icon: "🎓", label: ui("classroomTitle", s.lang) });
  if (mastery && s.get("mastery.revision.enabled") === true) quick.push({ href: "/revise", icon: "🔁", label: ui("navRevise", s.lang) });
  if (mastery && s.get("mastery.progressPage") === true) quick.push({ href: "/progress", icon: "⭐", label: ui("myProgress", s.lang) });
  if (s.get("browse.explore.enabled") === true) quick.push({ href: "/explore", icon: "🎨", label: ui("navExplore", s.lang) });
  if (s.get("notebook.enabled") === true && s.get("feature.lessons") === true) quick.push({ href: "/notebook", icon: "📓", label: ui("navNotebook", s.lang) });
  if (s.get("feature.gk") === true && s.get("gk.nav.show") !== false) quick.push({ href: "/gk", icon: "💡", label: s.text("gk.tab.label") || gt("title", s.lang) });
  if (s.get("feature.library") === true && s.get("library.nav.show") !== false) quick.push({ href: "/library", icon: "📖", label: lt("title", s.lang) });
  if (s.get("feature.textbooks") === true) quick.push({ href: "/books", icon: "📚", label: ui("textbooks", s.lang) });
  if (s.get("feature.papers") === true && s.get("papers.home.show") !== false) quick.push({ href: "/papers", icon: "📝", label: s.lang === "ta" ? "வினாத்தாள்கள்" : "Question papers" });
  const lead = s.text("home.hero.lead").trim(), l1 = s.text("home.hero.line1").trim(), l2 = s.text("home.hero.line2").trim();
  const heroTitle = l1 || l2 ? `${lead ? `${lead}||` : ""}${l1}${l1 && l2 ? "|" : ""}${l2}` : s.text("home.hero.title");
  const challenge = <DailyChallenge due={mastery ? due : 0} next={path.find((n) => n.state === "now") ?? path.find((n) => n.state === "todo")} lessonsToday={doneToday} />;
  const gkEnabled = s.get("feature.gk") === true && s.get("gk.home.show") !== false;
  const gk = gkEnabled && <Suspense fallback={null}><GkTodayCards home /></Suspense>;
  const activityGk = gkEnabled ? <Suspense fallback={<PuzzleOfDay />}><GkTodayCards home preferPuzzle /></Suspense> : <PuzzleOfDay />;
  const homeQuickJumps = useMemo<HelpQuickJump[]>(
    () => quick.slice(0, 6).map((q, idx) => ({ id: `home-${idx}`, href: q.href, icon: q.icon, label: q.label })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quick.map((q) => `${q.href}:${q.label}`).join("|")],
  );
  usePageTour(app && s.get("app.feed.enabled") === true ? null : { pageType: "home", quickJumps: homeQuickJumps });
  const libraryBands = String(s.get("library.ageBands") ?? "0-3,4-6,7-9,10-12,13+")
    .split(",").map((band) => band.trim()).filter((band) => /^(0-3|4-6|7-9|10-12|13\+)$/.test(band));
  const library = s.get("feature.library") === true && s.get("library.nav.show") !== false && (
        <section className="revise-card" aria-label={lt("title", s.lang)}>
          <div>
            <h2>📖 {lt("title", s.lang)}</h2><p>{lt("intro", s.lang)}</p>
            <div className="lib-ages">
              {libraryBands.map((band) =>
                <Link key={band} className="chip" href={`/library?age=${encodeURIComponent(band)}`}>{bandLabel(band, s.lang)}</Link>)}
            </div>
          </div>
          <Link className="btn" href="/library">{lt("back", s.lang)}</Link>
        </section>
      );
  if (app && s.get("app.feed.enabled") === true) return <AppFeed tree={tree} board={board} sampleHref={sampleReady ? sample.href : undefined} dailyGk={gk} library={library} />;
  const fact = s.get("home.didYouKnow.show") === true && <DidYouKnow />;
  const today = (
    <details className="preset-today" data-tour="home-today" open={["classroom", "dashboard", "activity"].includes(preset)}>
      <summary>{s.lang === "ta" ? "இன்றைய செயல்பாடுகள்" : "Today's activities"}</summary>
      {preset === "activity" ? <div className="today-items activity-rows">
        {challenge}{fact}{activityGk}
      </div> : <div className="today-items">{challenge}{gk}<PuzzleOfDay />{fact}</div>}
    </details>
  );
  const headline = <h1 data-size={String(s.get("home.hero.size") ?? "m")}><Rich text={preset === "activity" ? heroTitle.replace(/\s*\|+\s*/g, " ") : heroTitle} /></h1>;
  const quickLinks = s.get("home.quickLinks.show") === true && quick.length > 1 && (
        <nav className="quick" aria-label={ui("quickLinks", s.lang)} data-tour="home-library-papers">
          {quick.map((q) => <Link key={q.href} href={q.href} className="quick-tile"><span aria-hidden="true">{q.icon}</span><b>{q.label}</b></Link>)}
        </nav>
      );
  return (
    <div className="paper home">
      <div className="home-top">
      {s.get("home.banner.show") === true && Number(s.get("brand.bannerVersion") ?? 0) > 0 && <img className="site-banner" src={`/uploads/banner?v=${Number(s.get("brand.bannerVersion"))}`} alt={s.get<string>("site.name")} style={{ height: Number(s.get("brand.bannerHeight") ?? 200) }} />}
      {preset === "activity" && s.get("home.hero.show") && <div className="activity-headline">{headline}</div>}
      {s.get("home.hero.show") && (
        <section className="hero">
          {preset !== "activity" && headline}
          <p className="lead"><Rich text={s.text("home.hero.subtitle")} /></p>
          {tryHref && <p className="actions"><Link className={s.get("home.tryLesson.pill") ? "btn try-btn pill" : "btn big try-btn"} href={tryHref}>▶ {s.text("home.cta.label") || ui("tryLesson", s.lang)}</Link><span className="small">{sampleReady && <><b>{s.name(sample.title)}</b><br /></>}<Rich text={s.text("home.cta.note") || ui("tryLessonHelp", s.lang)} /></span></p>}
        </section>
      )}
        <div className="home-side">
      {cont && (
        <section className="continue-card" aria-label={ui("continueTitle", s.lang)}>
          <div>
            <h2>{ui("continueTitle", s.lang)}</h2>
            <p><b><Title name={cont.topic} /></b> · <Title name={cont.subject} /> · {ui("continueStep", s.lang)} {cont.step}/{cont.total}</p>
          </div>
          <Link className="btn" href={cont.href}>{ui("continueGo", s.lang)}</Link>
        </section>
      )}
      {goalOn && (
        <p className={doneToday >= goal ? "goal-chip met" : "goal-chip"} role="status">
          <span aria-hidden="true">{doneToday >= goal ? "✔" : "🎯"}</span> {ui("goalChip", s.lang)}: {Math.min(doneToday, goal)}/{goal} {ui("goalLessons", s.lang)}{doneToday >= goal ? ` · ${ui("goalMet", s.lang)}` : ""}
        </p>
      )}
        </div>
      </div>
      {recent.length > 0 && (
        <section className="recent-row" aria-label={ui("recentTitle", s.lang)}>
          <h2>{ui("recentTitle", s.lang)}</h2>
          <ul>
            {recent.map((r) => (
              <li key={r.id}><Link href={r.href} className="recent-item">
                <b><Title name={r.topic} /></b><span className="small"><Title name={r.subject} /></span>
                <span className="meter" aria-hidden="true"><span style={{ width: `${r.done ? 100 : r.total ? Math.round(((r.step + 1) / r.total) * 100) : 0}%` }} /></span>
                <span className="small">{r.done ? `✔ ${ui("pathDone", s.lang)}` : `${ui("continueStep", s.lang)} ${r.step}/${r.total}`}</span>
              </Link></li>
            ))}
          </ul>
        </section>
      )}
      {preset === "activity" && <div className="activity-browse">{today}{quickLinks}</div>}
      <BoardPath nodes={path} streak={streakOn ? rewards.streak : 0} />
      {s.get("home.rewards.show") === true && (streakOn || rewards.stars > 0) && (
        <section className="rewards" aria-label={ui("rewardsTitle", s.lang)}>
          {streakOn && (
            <div className="reward">
              <b className="reward-n">🔥 {Math.min(rewards.streak, maxStreak)}</b>
              <span>{ui("streakDays", s.lang)}</span>
              <ol className="week" aria-hidden="true">{rewards.week.map((on, i) => <li key={i} className={on ? "on" : ""} />)}</ol>
              <span className="small">{rewards.activeToday ? ui("streakToday", s.lang) : rewards.streak > 0 ? ui("streakKeep", s.lang) : ui("streakStart", s.lang)}</span>
            </div>
          )}
          <div className="reward"><b className="reward-n">⭐ {rewards.stars}</b><span>{ui("starsEarned", s.lang)}</span></div>
        </section>
      )}
      {preset !== "activity" && quickLinks}
      {preset === "classic" ? <div data-tour="home-today">
      <DailyChallenge due={mastery ? due : 0} next={path.find((n) => n.state === "now") ?? path.find((n) => n.state === "todo")} lessonsToday={doneToday} />
      <Reminder goalMet={doneToday >= goal} />
      {s.get("feature.gk") === true && s.get("gk.home.show") !== false && <Suspense fallback={null}><GkTodayCards home /></Suspense>}
      <PuzzleOfDay />
      {s.get("home.didYouKnow.show") === true && <DidYouKnow />}
      </div> : <>
        {preset !== "activity" && today}
        <Reminder goalMet={doneToday >= goal} />
      </>}
      {s.get("explore.tryIt.show") === true && <section className="paper-block"><WaterCycle /></section>}
      {mastery && s.get("mastery.homeCard") === true && s.get("mastery.revision.enabled") === true && due > 0 && (
        <section className="revise-card" aria-label={ui("reviseToday", s.lang)}>
          <div><h2>{ui("reviseToday", s.lang)}</h2><p>{due} {ui("reviseCount", s.lang)}</p></div>
          <Link className="btn" href="/revise">{ui("reviseStart", s.lang)}</Link>
        </section>
      )}
      {classOn && classCount > 0 && (
        <section className="revise-card" aria-label={ui("classroomTitle", s.lang)}>
          <div><h2>🎓 {ui("classroomTitle", s.lang)}</h2><p>{ui("classroomIntro", s.lang)}</p></div>
          <Link className="btn" href="/classroom">{ui("classroomStart", s.lang)}</Link>
        </section>
      )}
      {library}
      {s.get("home.search.show") && s.get("feature.search") && <SearchBox board={board} />}
      {s.get("home.boardPicker.show") && (
        <section className={preset === "classic" ? undefined : "preset-boards"} aria-labelledby="boards-h" data-tour={!s.get("home.classPicker.show") ? "home-pickers" : undefined}>
          <h2 id="boards-h">{ui("board", s.lang)}</h2>
          <BoardChips />
        </section>
      )}
      {s.get("home.classPicker.show") && (
        <section className={preset === "classic" ? undefined : "preset-classes"} aria-labelledby="classes-h" data-tour="home-pickers">
          <h2 id="classes-h">{ui("classWord", s.lang)}</h2>
          {state.status === "loading" && <Loading />}
          {state.status === "error" && <ErrorBox onRetry={retry} />}
          {state.status === "ready" && (
            <ul className="classes">
              {Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => n <= 7 || open.has(n)).map((n) => {
                const has = state.data.classes.some((c) => c.classLevel === n && c.subjects.length > 0);
                const ok = open.has(n) && has;
                return (
                  <li key={n}>
                    {ok ? <Link className="class-tab on" href={`/${board.toLowerCase()}/${n}`}><b>{n}</b><span>{ui("classWord", s.lang)}</span></Link>
                      : <span className="class-tab off" aria-disabled="true"><b>{n}</b><span>{ui("soon", s.lang)}</span></span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
