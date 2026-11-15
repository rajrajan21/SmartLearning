import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import type { TreeLike } from "../lib/browseStats";
import { suggestNext } from "../lib/browseStats";
import { subjectIcon } from "../lib/browseStats";
import { refreshProgress, useAllProgress } from "../lib/progress";
import { usePullRefresh } from "../lib/pull";
import { useRewards } from "../lib/streak";
import { dayNumber } from "../lib/streak";
import { factOfDay, quickQuestion } from "../lib/facts";
import { buzz } from "../lib/appview";
import { continueId, lessonsToday, pathNodes, recentLessons } from "../lib/round2";
import { BoardPath } from "./Tier1";
import { Groups } from "./TryIt";
import { BottomSheet } from "./BottomSheet";
import { Title } from "./bits";
import { store } from "../lib/storage";

const CLASS_KEY = "ss_class";
export const chosenClass = (open: number[]): number => { const c = Number(store.get(CLASS_KEY)); return open.includes(c) ? c : (open.length ? Math.min(...open) : 3); };

export function DidYouKnow({ tick = 0 }: { tick?: number }) {
  const s = useSettings();
  const f = factOfDay(dayNumber(Date.now()) + 0 * tick);
  return (
    <section className="dyk" aria-label={ui("dykTitle", s.lang)}>
      <span className="dyk-icon" aria-hidden="true">{f.icon}</span>
      <div><h2>{ui("dykTitle", s.lang)}</h2><p>{s.lang === "ta" ? f.ta : f.en}</p></div>
    </section>
  );
}

function QuickQuestion() {
  const s = useSettings();
  const [seed, setSeed] = useState(() => dayNumber(Date.now()));
  const q = useMemo(() => quickQuestion(seed), [seed]);
  const [picked, setPicked] = useState<number | null>(null);
  const ok = picked === q.answer;
  return (
    <div className="quick-q">
      <p className="big-q">{q.a} × {q.b} = ?</p>
      <div className="q-options" role="group" aria-label={`${q.a} × ${q.b}`}>
        {q.options.map((o) => (
          <button key={o} type="button" className={`btn big${picked === o ? (o === q.answer ? " right" : " wrong") : ""}`} aria-pressed={picked === o}
            onClick={() => { setPicked(o); if (o === q.answer && s.get("app.vibrate") === true) buzz(); }}>{o}</button>
        ))}
      </div>
      <p className={ok ? "try-msg yes" : "try-msg"} role="status">{picked === null ? "" : ok ? `🎉 ${ui("feedRight", s.lang)}` : ui("feedTryAgain", s.lang)}</p>
      {ok && <button type="button" className="btn ghost" onClick={() => { setSeed((n) => n + 1); setPicked(null); }}>{ui("feedNewOne", s.lang)}</button>}
    </div>
  );
}

/** Home for phones: one bite-sized card per screen, swipe up for the next (CSS scroll-snap). */
export function AppFeed({ tree, board }: { tree: TreeLike | null; board: string }) {
  const s = useSettings();
  const open = s.get<number[]>("catalog.openClasses");
  const [cls, setCls] = useState(() => chosenClass(open));
  const [sheet, setSheet] = useState(false);
  const [tick, setTick] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const { pull, state } = usePullRefresh(box, () => { refreshProgress(); setTick((n) => n + 1); }, s.get("app.feed.pullRefresh") === true);
  const progress = useAllProgress();
  const rewards = useRewards(s.get<number>("rewards.streak.graceDays"));
  const next = tree ? suggestNext(tree, progress, board, [cls]) : null;
  const path = tree ? pathNodes(tree, progress, board, [cls], 5) : [];
  const subjects = tree?.classes.find((c) => c.classLevel === cls)?.subjects ?? [];
  const goal = s.get<number>("rewards.dailyGoal.lessons"), doneToday = lessonsToday(progress);
  const started = next?.kind === "finish";
  const recent = tree && s.get("app.feed.recent.show") === true ? recentLessons(tree, progress, board, 3, continueId(tree, progress, board)).filter((r) => open.includes(r.classLevel)) : [];
  const ringPct = Math.min(100, Math.round((doneToday / Math.max(1, goal)) * 100));
  return (
    <div className="appfeed">
      <div className="feed-chips" role="toolbar" aria-label={ui("appHome", s.lang)}>
        {s.get("rewards.streak.enabled") === true && <span className="chip-static">🔥 {rewards.streak}</span>}
        {s.get("rewards.dailyGoal.enabled") === true && <span className={`chip-static${doneToday >= goal ? " met" : ""}`}>🎯 {Math.min(doneToday, goal)}/{goal}</span>}
        <button type="button" className="chip" onClick={() => setSheet(true)} aria-haspopup="dialog">{ui("feedClassChip", s.lang)} {cls} ▾</button>
        {subjects.map((sub) => <Link key={sub.slug} href={`/${board.toLowerCase()}/${cls}/${sub.slug}`} className="chip"><span aria-hidden="true">{subjectIcon(sub.slug)}</span> <Title name={sub.name} /></Link>)}
      </div>
      {s.get("app.feed.pullRefresh") === true && (
        <div className={`ptr${state === "pulling" || state === "ready" ? " pulling" : ""}${state === "done" ? " busy" : ""}`} style={{ height: state === "done" ? 30 : pull }} role="status" aria-live="polite">
          {state === "pulling" ? ui("pullRefresh", s.lang) : state === "ready" ? ui("pullRelease", s.lang) : state === "done" ? `✓ ${ui("pullDone", s.lang)}` : ""}
        </div>
      )}
      <div className="feed" ref={box} data-tick={tick} tabIndex={0} aria-label={ui("feedSwipe", s.lang)}>
        {recent.length > 0 && (
          <section className="fcard fc-recent" aria-label={ui("recentTitle", s.lang)}>
            <h2>{ui("recentTitle", s.lang)}</h2>
            <ul className="recent-list">
              {recent.map((r) => <li key={r.id}><Link href={r.href} className="recent-item"><b><Title name={r.topic} /></b><span className="small"><Title name={r.subject} /></span><span className="meter" aria-hidden="true"><span style={{ width: `${r.done ? 100 : r.total ? Math.round(((r.step + 1) / r.total) * 100) : 0}%` }} /></span></Link></li>)}
            </ul>
          </section>
        )}
        <section className="fcard fc-mission" aria-label={ui("feedMission", s.lang)}>
          <h2>{ui("feedMission", s.lang)}</h2>
          {s.get("app.feed.goalRing.show") === true && s.get("rewards.dailyGoal.enabled") === true && <div className="goal-ring" style={{ ["--pct" as string]: `${ringPct}%` }} role="img" aria-label={`${ui("goalChip", s.lang)}: ${Math.min(doneToday, goal)}/${goal}`}><span>{Math.min(doneToday, goal)}/{goal}</span></div>}
          {next ? (
            <>
              <span className="fc-pic" aria-hidden="true">{subjectIcon(subjects.find((x) => x.name.en === next.subject.en)?.slug ?? "")}</span>
              <p className="fc-title"><Title name={next.topic} /></p>
              <p className="small"><Title name={next.subject} /></p>
              <Link className="btn big" href={next.href}>{started ? ui("feedContinue", s.lang) : ui("feedStart", s.lang)} →</Link>
            </>
          ) : <p className="fc-title">{ui("nextAllDone", s.lang)}</p>}
          <p className="swipe-hint small" aria-hidden="true">⌃ {ui("feedSwipe", s.lang)}</p>
        </section>
        {path.length > 0 && <section className="fcard"><BoardPath nodes={path} streak={0} /></section>}
        {s.get("home.didYouKnow.show") === true && <section className="fcard"><DidYouKnow tick={tick} /></section>}
        {s.get("app.feed.quiz.show") === true && <section className="fcard" aria-label={ui("feedQuick", s.lang)}><h2>{ui("feedQuick", s.lang)}</h2><QuickQuestion /></section>}
        {s.get("app.feed.tryIt.show") === true && <section className="fcard" aria-label={ui("tryTitle", s.lang)}><h2>{ui("tryTitle", s.lang)}</h2><Groups target={{ groups: 3, per: 4 }} /></section>}
        <section className="fcard fc-end" aria-label={ui("feedCaughtUp", s.lang)}>
          <span className="fc-pic" aria-hidden="true">🌟</span>
          <h2>{ui("feedCaughtUp", s.lang)}</h2>
          <p>{ui("feedCaughtUpText", s.lang)}</p>
          <div className="actions"><Link className="btn" href="/explore">{ui("navExplore", s.lang)}</Link><Link className="btn ghost" href="/revise">{ui("navRevise", s.lang)}</Link></div>
        </section>
      </div>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={ui("feedPickClass", s.lang)}>
        <ul className="sheet-list">
          {[...open].sort((a, b) => a - b).map((c) => (
            <li key={c}><button type="button" className={c === cls ? "btn" : "btn ghost"} aria-pressed={c === cls} onClick={() => { setCls(c); store.set(CLASS_KEY, String(c)); setSheet(false); }}>{ui("classWord", s.lang)} {c}</button></li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}
