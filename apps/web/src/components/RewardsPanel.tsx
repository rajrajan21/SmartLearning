import { Link } from "wouter";
import { useSettings } from "../lib/settings";
import { ui } from "../lib/i18n";
import { useAllProgress } from "../lib/progress";
import { useAllResults } from "../lib/practice";
import { dayNumber, totalStars, useRewards, weekCalendar } from "../lib/streak";
import { computeBadges } from "../lib/badges";
import { suggestNext, type TreeLike } from "../lib/browseStats";
import { Title } from "./bits";
import { levelOf } from "../lib/tier2";
import { useAccountOptional } from "../lib/account";

export function WeekCalendar() {
  const s = useSettings();
  const r = useRewards(s.get<number>("rewards.streak.graceDays"));
  const days = weekCalendar(r.activeDays, dayNumber(Date.now()));
  const n = days.filter((d) => d.on).length;
  const fmt = new Intl.DateTimeFormat(s.lang === "ta" ? "ta-IN" : "en-IN", { weekday: "short", timeZone: "UTC" });
  return (
    <section className="week-cal" aria-label={ui("weekTitle", s.lang)}>
      <h2>{ui("weekTitle", s.lang)}</h2>
      <ol>
        {days.map((d) => (
          <li key={d.day} className={`${d.on ? "on" : ""}${d.isToday ? " today" : ""}`.trim()}>
            <span className="wd">{d.isToday ? ui("today", s.lang) : fmt.format(new Date(d.day * 86_400_000))}</span>
            <span className="mark" aria-hidden="true">{d.on ? "✔" : ""}</span>
            <span className="sr">{d.on ? ui("learnedDay", s.lang) : ui("noLearnDay", s.lang)}</span>
          </li>
        ))}
      </ol>
      <p className="small">{ui("weekLearnedOf", s.lang).replace("{n}", String(n))}</p>
    </section>
  );
}

export function Badges() {
  const s = useSettings();
  const progress = useAllProgress(), results = useAllResults();
  const r = useRewards(s.get<number>("rewards.streak.graceDays"));
  const lessonsDone = Object.values(progress).filter((p) => p.done).length;
  const badges = computeBadges({ lessonsDone, stars: totalStars(results as never), streak: r.streak, results: results as never });
  const got = badges.filter((b) => b.earned).length;
  return (
    <section className="badges" aria-label={ui("badgesTitle", s.lang)}>
      <h2>{ui("badgesTitle", s.lang)} <span className="small">{got}/{badges.length} {ui("badgesCount", s.lang)}</span></h2>
      <ul>
        {badges.map((b) => (
          <li key={b.id} className={b.earned ? "badge got" : "badge"}>
            <span className="b-icon" aria-hidden="true">{b.icon}</span>
            <b>{ui(b.title, s.lang)}</b>
            <span className="small">{ui(b.desc, s.lang)}</span>
            <span className="b-state">{b.earned ? `✔ ${ui("badgeEarned", s.lang)}` : `${b.have}/${b.need} · ${ui("badgeLocked", s.lang)}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function NextSuggestion({ tree, board }: { tree: TreeLike; board: string }) {
  const s = useSettings();
  const progress = useAllProgress();
  const next = suggestNext(tree, progress, board, s.get<number[]>("catalog.openClasses"));
  return (
    <section className="next-card" aria-label={ui("nextTitle", s.lang)}>
      <h2>{ui("nextTitle", s.lang)}</h2>
      {next ? (
        <>
          <p><b><Title name={next.topic} /></b> · <Title name={next.subject} /> <span className="small">({next.kind === "finish" ? ui("nextFinish", s.lang) : ui("nextStartNew", s.lang)})</span></p>
          <Link className="btn big" href={next.href}>{ui("nextGo", s.lang)} →</Link>
        </>
      ) : <p>{ui("nextAllDone", s.lang)}</p>}
    </section>
  );
}

/** Friendly level plus a printable certificate. Built only from progress saved on this device. */
export function LevelCard({ level, cert }: { level: boolean; cert: boolean }) {
  const s = useSettings();
  const progress = useAllProgress(), results = useAllResults();
  const acct = useAccountOptional();
  const done = Object.values(progress).filter((p) => p.done).length, stars = totalStars(results as never);
  const lv = levelOf(done, stars);
  return (
    <section className="level-card" aria-label={ui("levelWord", s.lang)}>
      {level && (
        <div className="lv">
          <b className="lv-n">{ui("levelWord", s.lang)} {lv.level}</b>
          <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={lv.pct} aria-label={ui("levelWord", s.lang)}><span style={{ width: `${lv.pct}%` }} /></div>
          <span className="small">{ui("levelNext", s.lang).replace("{n}", String(lv.toNext))}</span>
        </div>
      )}
      {cert && (
        <div className="certificate">
          <h2>{ui("certTitle", s.lang)}</h2>
          <p className="cert-name">{acct?.active?.nickname ?? ui("certName", s.lang)}</p>
          <p>{ui("certLine", s.lang).replace("{n}", String(done)).replace("{s}", String(stars))}</p>
          <p className="small">{new Date().toLocaleDateString(s.lang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="noprint"><button type="button" className="btn ghost" onClick={() => window.print()}>{ui("certPrint", s.lang)}</button></p>
        </div>
      )}
    </section>
  );
}
