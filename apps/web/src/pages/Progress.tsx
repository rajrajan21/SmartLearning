import { useActiveBoard } from "../lib/activeBoard";
import { useState } from "react";
import { Link } from "wouter";
import { chapterPct, type Mastery, type MasteryLevel } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { ui, type UiKey } from "../lib/i18n";
import { useBoard, useRetry } from "../lib/curriculum";
import { useMastery } from "../lib/mastery";
import { useDueCount } from "../lib/revision";
import { ErrorBox, Loading, NotFound } from "../components/bits";
import { MasteryBar } from "../components/Tier1";
import { LevelCard } from "../components/RewardsPanel";
import { Badges, NextSuggestion, WeekCalendar } from "../components/RewardsPanel";

export const LEVEL_KEY: Record<MasteryLevel, UiKey> = { new: "lvlNew", learning: "lvlLearning", practising: "lvlPractising", strong: "lvlStrong", mastered: "lvlMastered" };
export function MasteryTag({ m }: { m: Mastery }) {
  const s = useSettings();
  return <span className={`mtag m-${m.level}`}>{ui(LEVEL_KEY[m.level], s.lang)}</span>;
}

export function ProgressPage() {
  const s = useSettings();
  const { lang } = s;
  const board = useActiveBoard();
  const [attempt, retry] = useRetry();
  const state = useBoard(board, attempt);
  const of = useMastery(true);
  const due = useDueCount();
  const open = s.get<number[]>("catalog.openClasses");
  const [tab, setTab] = useState<number | null>(null);
  if (s.get("feature.mastery") !== true || s.get("mastery.progressPage") !== true) return <NotFound />;
  if (state.status === "loading") return <Loading />;
  if (state.status === "error") return <ErrorBox onRetry={retry} />;
  const allClasses = state.data.classes.filter((c) => open.includes(c.classLevel));
  const cards = (s.get("progress.layout") as unknown) !== "list";
  const tabs = s.get("progress.classTabs") !== false && allClasses.length > 1;
  const cur = tab ?? allClasses[0]?.classLevel;
  const classes = tabs ? allClasses.filter((c) => c.classLevel === cur) : allClasses;
  const showEmpty = s.get("progress.showEmptyChapters") === true;
  let any = false;
  const levelOf = (ms: Mastery[]): MasteryLevel => ms.every((m) => m.level === "mastered") ? "mastered" : ms.every((m) => m.level === "mastered" || m.level === "strong") ? "strong" : ms.some((m) => m.level !== "new") ? "practising" : "new";
  return (
    <div className="paper progress">
      <h1>{ui("myProgress", lang)}</h1>
      <p className="lead">{ui("progressIntro", lang)}</p>
      {s.get("mastery.revision.enabled") === true && due > 0 && <p className="actions"><Link className="btn" href="/revise">{ui("reviseToday", lang)} ({due})</Link></p>}
      {(s.get("rewards.level.show") === true || s.get("rewards.certificate.show") === true) && <LevelCard level={s.get("rewards.level.show") === true} cert={s.get("rewards.certificate.show") === true} />}
      {s.get("progress.nextSuggestion.show") === true && <NextSuggestion tree={state.data as never} board={board} />}
      {s.get("rewards.weekCalendar.show") === true && <WeekCalendar />}
      {s.get("rewards.badges.enabled") === true && <Badges />}
      {tabs && <div className="p-tabs" role="tablist">{allClasses.map((c) => <button key={c.classLevel} type="button" role="tab" aria-selected={c.classLevel === cur} className={`p-tab${c.classLevel === cur ? " on" : ""}`} onClick={() => setTab(c.classLevel)}>{ui("classWord", lang)} {c.classLevel}</button>)}</div>}
      {cards && s.get("progress.legend.show") !== false && <ul className="p-key" aria-label="Colour key">{(["new", "learning", "practising", "strong", "mastered"] as MasteryLevel[]).map((l) => <li key={l}><i className={`m-${l}`} />{ui(LEVEL_KEY[l], lang)}</li>)}</ul>}
      {cards && classes.map((c) => (
        <section key={c.classLevel} className="p-class">
          {!tabs && <h2>{ui("classWord", lang)} {c.classLevel}</h2>}
          <div className="p-grid">
            {c.subjects.map((sub) => {
              const chs = sub.chapters.map((ch) => ({ ch, ms: ch.topics.map((t) => of(t.id)).filter((m): m is Mastery => m !== null) })).filter((x) => showEmpty || x.ms.length > 0);
              if (chs.length === 0) return null;
              any = true;
              const pcts = chs.map(({ ms }) => (ms.length ? chapterPct(ms) : 0));
              const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
              const done = chs.filter(({ ms }) => ms.length > 0 && levelOf(ms) === "mastered").length;
              return (
                <article key={sub.id} className="p-card">
                  <header className="p-card-h">
                    {s.get("progress.subjectRing.show") !== false && <div className="p-ring" style={{ ["--p" as string]: `${avg * 3.6}deg` }} role="img" aria-label={`${avg}%`}><b>{avg}%</b></div>}
                    <div><h3>{s.name(sub.name)}</h3><p className="small">{done} / {chs.length} {ui("progMastered", lang)}</p></div>
                  </header>
                  <ul className="p-tiles">
                    {chs.map(({ ch, ms }, n) => {
                      const pct = ms.length ? chapterPct(ms) : 0, lv = ms.length ? levelOf(ms) : "new";
                      return (
                        <li key={ch.id}>
                          <Link className={`p-tile m-${lv}`} href={`/${board.toLowerCase()}/${c.classLevel}/${sub.slug}/${ch.slug}`} title={`${s.name(ch.name)} · ${pct}%`}>
                            <span className="p-n">{n + 1}</span>
                            <span className="p-name">{s.name(ch.name)}</span>
                            <span className="p-pct">{pct}%</span>
                            <span className="p-fill" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={s.name(ch.name)} style={{ width: `${pct}%` }} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      ))}
      {!cards && classes.map((c) => (
        <section key={c.classLevel}>
          <h2>{ui("classWord", lang)} {c.classLevel}</h2>
          {c.subjects.map((sub) => {
            const chapters = sub.chapters.map((ch) => ({ ch, ms: ch.topics.map((t) => of(t.id)).filter((m): m is Mastery => m !== null) })).filter((x) => x.ms.length > 0);
            if (chapters.length === 0) return null;
            any = true;
            return (
              <div key={sub.id} className="p-subject">
                <h3>{s.name(sub.name)}</h3>
                <ul className="p-list">
                  {chapters.map(({ ch, ms }) => {
                    const pct = chapterPct(ms), best = ms.every((m) => m.level === "mastered") ? "mastered" : ms.every((m) => m.level === "mastered" || m.level === "strong") ? "strong" : ms.some((m) => m.level !== "new") ? "practising" : "new";
                    return (
                      <li key={ch.id}>
                        <Link href={`/${board.toLowerCase()}/${c.classLevel}/${sub.slug}/${ch.slug}`}>{s.name(ch.name)}</Link>
                        <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={s.name(ch.name)}><span style={{ width: `${pct}%` }} /></div>
                        <span className="small">{pct}% · <MasteryTag m={{ level: best, pct }} /></span>
                        {s.get("rewards.masteryBar.show") === true && <MasteryBar list={ms} label={ui("mbTitle", lang)} />}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>
      ))}
      {!any && <p className="soon-note">{ui("progressNone", lang)}</p>}
    </div>
  );
}
