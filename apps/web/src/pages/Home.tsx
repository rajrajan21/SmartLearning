import { Link } from "wouter";
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
import { WaterCycle } from "../components/TryIt";

const COMING_BOARDS = [
  { code: "TNSB", en: "Tamil Nadu State Board", ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம்" },
  { code: "TNMB", en: "Tamil Nadu Matriculation", ta: "தமிழ்நாடு மெட்ரிகுலேஷன்" },
];

export function Home() {
  const s = useSettings();
  const board = s.get<string>("catalog.defaultBoard");
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
  const tryHref = s.get("home.tryLesson.show") === true && tree ? firstLessonHref(tree, board, lessonIds, openList) : null;
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
  if (app && s.get("app.feed.enabled") === true) return <AppFeed tree={tree} board={board} />;
  return (
    <div className="paper home">
      <div className="home-top">
      {s.get("home.hero.show") && (
        <section className="hero">
          <h1>{s.text("home.hero.title")}</h1>
          <p className="lead">{s.text("home.hero.subtitle")}</p>
          {tryHref && <p className="actions"><Link className="btn big try-btn" href={tryHref}>▶ {ui("tryLesson", s.lang)}</Link><span className="small">{ui("tryLessonHelp", s.lang)}</span></p>}
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
      {s.get("home.quickLinks.show") === true && quick.length > 1 && (
        <nav className="quick" aria-label={ui("quickLinks", s.lang)}>
          {quick.map((q) => <Link key={q.href} href={q.href} className="quick-tile"><span aria-hidden="true">{q.icon}</span><b>{q.label}</b></Link>)}
        </nav>
      )}
      {s.get("home.didYouKnow.show") === true && <DidYouKnow />}
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
      {s.get("home.search.show") && s.get("feature.search") && <SearchBox board={board} />}
      {s.get("home.boardPicker.show") && (
        <section aria-labelledby="boards-h">
          <h2 id="boards-h">{ui("board", s.lang)}</h2>
          <ul className="chips">
            <li><span className="chip on" aria-current="true">CBSE</span></li>
            {s.get("catalog.showComingSoon") && COMING_BOARDS.map((b) => (
              <li key={b.code}><span className="chip off" aria-disabled="true">{s.lang === "ta" ? b.ta : b.en} · {ui("soon", s.lang)}</span></li>
            ))}
          </ul>
        </section>
      )}
      {s.get("home.classPicker.show") && (
        <section aria-labelledby="classes-h">
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
