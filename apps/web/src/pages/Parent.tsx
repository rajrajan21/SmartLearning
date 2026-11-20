import { useActiveBoard } from "../lib/activeBoard";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { chapterPct, dayNumber, daysInLastWeek, lastDays, ParentDashboard, PublicQuestion, streakOf, weeklySummary, type ChildReport, type Mastery } from "@studysmart/shared";
import { useSettings } from "../lib/settings";
import { useAccount } from "../lib/account";
import { ui } from "../lib/i18n";
import { useBoard, useRetry } from "../lib/curriculum";
import { useMasteryFor } from "../lib/mastery";
import { AVATAR_EMOJI } from "./Account";
import { MasteryTag } from "./Progress";
import { MasteryBar } from "../components/Tier1";
import { subjectIcon } from "../lib/browseStats";
import { ErrorBox, Loading, NotFound } from "../components/bits";

type Board = ReturnType<typeof useBoard>;

/** The week as plain text a parent can paste anywhere. */
export function weekText(lang: "en" | "ta", name: string, w: ReturnType<typeof weeklySummary>, nm: (id: string) => string): string {
  const L = [ui("wsTitle", lang), ui("wsDays", lang).replace("{name}", name).replace("{n}", String(w.daysLearned)), ui("wsTime", lang).replace("{n}", String(w.estMinutes)),
    w.accuracyPct === null ? ui("wsNoAnswers", lang) : ui("wsAnswers", lang).replace("{n}", String(w.answers)).replace("{p}", String(w.accuracyPct))];
  if (w.topicsDone.length) L.push(`${ui("wsDone", lang)}: ${w.topicsDone.map(nm).join(", ")}`);
  if (w.weakTopics.length) L.push(`${ui("wsWeak", lang)}: ${w.weakTopics.slice(0, 5).map((t) => nm(t.topicId)).join(", ")}`);
  return L.join("\n");
}

function ShareWeek({ text, whatsapp }: { text: string; whatsapp: boolean }) {
  const s = useSettings();
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* the text is also shown for selecting */ } };
  return (
    <p className="actions noprint">
      <button type="button" className="btn ghost sm" onClick={() => void copy()}>{copied ? ui("shareCopied", s.lang) : ui("shareCopy", s.lang)}</button>
      {whatsapp && <a className="btn ghost sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(text)}`}>{ui("shareWhatsapp", s.lang)}</a>}
    </p>
  );
}

function Chart({ days }: { days: { day: number; n: number; right: number }[] }) {
  const s = useSettings();
  const max = Math.max(1, ...days.map((d) => d.n)), w = 20, h = 80;
  return (
    <div>
      <svg viewBox={`0 0 ${days.length * w} ${h + 4}`} role="img" aria-label={ui("activity14", s.lang)} className="chart">
        {days.map((d, i) => (
          <g key={d.day}>
            <rect x={i * w + 3} y={h - (d.n / max) * h} width={w - 6} height={Math.max(d.n > 0 ? 2 : 0, (d.n / max) * h)} className="bar"><title>{`${d.n}`}</title></rect>
            <rect x={i * w + 3} y={h - (d.right / max) * h} width={w - 6} height={(d.right / max) * h} className="bar right" />
          </g>
        ))}
        <line x1="0" x2={days.length * w} y1={h} y2={h} className="axis" />
      </svg>
      <details className="small"><summary>{ui("showTable", s.lang)}</summary>
        <table className="mini"><thead><tr><th>{ui("dayWord", s.lang)}</th><th>{ui("answersGiven", s.lang)}</th><th>{ui("rightAnswers", s.lang)}</th></tr></thead>
          <tbody>{days.map((d) => <tr key={d.day}><td>{new Date(d.day * 86_400_000).toISOString().slice(5, 10)}</td><td>{d.n}</td><td>{d.right}</td></tr>)}</tbody></table>
      </details>
    </div>
  );
}

function topicNames(board: Board): Map<string, { en: string; ta?: string }> {
  const m = new Map<string, { en: string; ta?: string }>();
  if (board.status === "ready") for (const c of board.data.classes) for (const sub of c.subjects) for (const ch of sub.chapters) for (const t of ch.topics) m.set(t.id, t.name);
  return m;
}

/** Plain-language week at a glance: time, topics finished, topics that need another look. Printable. */
function WeeklySummaryCard({ child, board, today }: { child: ChildReport; board: Board; today: number }) {
  const s = useSettings();
  const { lang } = s;
  const w = weeklySummary(child, today, (ts) => dayNumber(new Date(ts)));
  const names = topicNames(board);
  const nm = (id: string) => { const n = names.get(id); return n ? s.name(n) : id; };
  const cap = s.get<number>("parent.weakSpotsCount");
  return (
    <section className="week-summary" aria-label={ui("wsTitle", lang)}>
      <h3>{ui("wsTitle", lang)}</h3>
      <ul className="ws-list">
        <li>{ui("wsDays", lang).replace("{name}", child.profile.nickname).replace("{n}", String(w.daysLearned))}</li>
        <li>{ui("wsTime", lang).replace("{n}", String(w.estMinutes))}</li>
        <li>{w.accuracyPct === null ? ui("wsNoAnswers", lang) : ui("wsAnswers", lang).replace("{n}", String(w.answers)).replace("{p}", String(w.accuracyPct))}</li>
      </ul>
      <h4>{ui("wsDone", lang)}</h4>
      {w.topicsDone.length > 0 ? <ul>{w.topicsDone.map((id) => <li key={id}>{nm(id)}</li>)}</ul> : <p className="small">{ui("wsDoneNone", lang)}</p>}
      <h4>{ui("wsWeak", lang)}</h4>
      {w.weakTopics.length > 0 ? (
        <><ul>{w.weakTopics.slice(0, cap).map((t) => <li key={t.topicId}>{nm(t.topicId)} <span className="small">({t.best}%)</span></li>)}</ul><p className="small">{ui("wsWeakHelp", lang)}</p></>
      ) : <p className="small">{ui("wsWeakNone", lang)}</p>}
      {s.get("parent.share.show") === true && <ShareWeek text={weekText(lang, child.profile.nickname, w, nm)} whatsapp={s.get("parent.share.whatsapp") === true} />}
      <p className="small">{ui("wsNote", lang)}</p>
      <p className="noprint"><button type="button" className="btn ghost" onClick={() => window.print()}>{ui("wsPrint", lang)}</button></p>
    </section>
  );
}

/** One card per subject: progress, work finished this week, topics that need another look. */
function SubjectCards({ child, board, of, today }: { child: ChildReport; board: Board; of: (id: string) => Mastery | null; today: number }) {
  const s = useSettings();
  const { lang } = s;
  if (board.status !== "ready") return null;
  const w = weeklySummary(child, today, (ts) => dayNumber(new Date(ts)));
  const cls = board.data.classes.find((c) => c.classLevel === child.profile.classLevel) ?? board.data.classes.find((c) => s.get<number[]>("catalog.openClasses").includes(c.classLevel));
  if (!cls) return null;
  const done = new Set(w.topicsDone), weak = new Set(w.weakTopics.map((x) => x.topicId));
  return (
    <section className="subject-cards" aria-label={ui("pcTitle", lang)}>
      <h3>{ui("pcTitle", lang)}</h3>
      <ul>
        {cls.subjects.map((sub) => {
          const topics = sub.chapters.flatMap((ch) => ch.topics);
          const ms = topics.map((t) => of(t.id)).filter((m): m is Mastery => m !== null);
          const pct = chapterPct(ms);
          const recent = topics.filter((t) => done.has(t.id)), tricky = topics.filter((t) => weak.has(t.id));
          return (
            <li key={sub.id} className="sc" style={{ ["--cover" as string]: `var(--subject-${["maths", "evs", "english", "tamil", "science", "social"].includes(sub.slug) ? sub.slug : "other"})` }}>
              <h4><span aria-hidden="true">{subjectIcon(sub.slug)}</span> {s.name(sub.name)}</h4>
              <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={s.name(sub.name)}><span style={{ width: `${pct}%` }} /></div>
              <p className="small">{pct}%</p>
              <MasteryBar list={ms} label={s.name(sub.name)} />
              <p><b>{ui("pcRecent", lang)}:</b> {recent.length ? recent.map((t) => s.name(t.name)).join(", ") : <span className="small">{ui("pcNothing", lang)}</span>}</p>
              <p><b>{ui("pcWeak", lang)}:</b> {tricky.length ? tricky.map((t) => s.name(t.name)).join(", ") : <span className="small">{ui("pcNothing", lang)}</span>}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function csvOf(child: ChildReport, board: Board, of: (id: string) => Mastery | null): string {
  const rows = [["class", "subject", "chapter", "topic", "level", "percent", "lesson_finished", "best_round_1", "best_round_2", "best_round_3", "best_round_4"]];
  if (board.status === "ready") for (const c of board.data.classes) for (const sub of c.subjects) for (const ch of sub.chapters) for (const t of ch.topics) {
    const m = of(t.id); if (!m) continue;
    const r = child.progress.practice[t.id] ?? {};
    rows.push([String(c.classLevel), sub.name.en, ch.name.en, t.name.en, m.level, String(m.pct), child.progress.lesson[t.id]?.done ? "yes" : "no", ...(["1", "2", "3", "4"] as const).map((k) => (r[k] ? String(r[k]!.best) : ""))]);
  }
  return rows.map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(",")).join("\n");
}
function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type })), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function Report({ child, board, stems }: { child: ChildReport; board: Board; stems: Record<string, string> }) {
  const s = useSettings();
  const { lang } = s;
  const of = useMasteryFor(child.progress, true);
  const today = dayNumber();
  const week = daysInLastWeek(child.activeDays, today), goal = s.get<number>("parent.weeklyGoalDays");
  const streak = streakOf(child.activeDays, today);
  const due = Object.values(child.progress.revision).filter((r) => r.due <= today).length;
  const allMastery = board.status === "ready" ? board.data.classes.flatMap((c) => c.subjects.flatMap((sub) => sub.chapters.flatMap((ch) => ch.topics.map((t) => of(t.id))))).filter((m): m is Mastery => m !== null) : [];
  const mastered = allMastery.filter((m) => m.level === "mastered").length;
  const quiet = child.attempts === 0 && child.activeDays.length === 0 && Object.keys(child.progress.lesson).length === 0;
  const open = s.get<number[]>("catalog.openClasses");
  return (
    <section className="report" aria-label={child.profile.nickname}>
      <h2><span aria-hidden="true">{AVATAR_EMOJI[child.profile.avatar] ?? "🙂"}</span> {child.profile.nickname} <span className="small">{ui("classWord", lang)} {child.profile.classLevel}</span></h2>
      {quiet ? <p className="soon-note">{ui("noActivityYet", lang)}</p> : (
        <>
          {s.get("parent.weeklySummary.show") === true && <WeeklySummaryCard child={child} board={board} today={today} />}
          {s.get("parent.subjectCards.show") === true && <SubjectCards child={child} board={board} of={of} today={today} />}
          <p className="lead">{child.profile.nickname} {ui("learnedDays", lang).replace("{n}", String(week))}.</p>
          <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(week, goal)} aria-label={`${ui("weeklyGoal", lang)}: ${Math.min(week, goal)} / ${goal}`}><span style={{ width: `${Math.min(100, (week / goal) * 100)}%` }} /></div>
          <p className="small">{ui("weeklyGoal", lang)}: {Math.min(week, goal)} / {goal}</p>
          <ul className="stats">
            {s.get("parent.showStreak") === true && <li><b>{streak}</b><span>{ui("streakDays", lang)}</span></li>}
            <li><b>{child.attempts}</b><span>{ui("answersGiven", lang)}</span></li>
            {s.get("parent.showAccuracy") === true && child.attempts > 0 && <li><b>{Math.round((child.correct / child.attempts) * 100)}%</b><span>{ui("rightAnswers", lang)}</span></li>}
            <li><b>{due}</b><span>{ui("dueRevision", lang)}</span></li>
            <li><b>{mastered}</b><span>{ui("topicsMastered", lang)}</span></li>
          </ul>
          {s.get("parent.showActivity") === true && <><h3>{ui("activity14", lang)}</h3><Chart days={lastDays(child.daily, today, 14)} /></>}
          {board.status === "ready" && (
            <>
              <h3>{ui("progressByChapter", lang)}</h3>
              <ul className="p-list">
                {board.data.classes.filter((c) => open.includes(c.classLevel)).flatMap((c) => c.subjects.flatMap((sub) => sub.chapters.map((ch) => ({ c, sub, ch, ms: ch.topics.map((t) => of(t.id)).filter((m): m is Mastery => m !== null) })))).filter((x) => x.ms.length > 0 && x.ms.some((m) => m.level !== "new")).map(({ c, sub, ch, ms }) => {
                  const pct = chapterPct(ms), level = ms.every((m) => m.level === "mastered") ? "mastered" : ms.every((m) => m.level === "mastered" || m.level === "strong") ? "strong" : "practising";
                  return <li key={ch.id}><span>{s.name(sub.name)} · {s.name(ch.name)} <span className="small">({ui("classWord", lang)} {c.classLevel})</span></span><div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={s.name(ch.name)}><span style={{ width: `${pct}%` }} /></div><span className="small">{pct}% · <MasteryTag m={{ level, pct }} /></span></li>;
                })}
              </ul>
            </>
          )}
          {s.get("parent.showWeakSpots") === true && child.weak.length > 0 && (
            <>
              <h3>{ui("trickyTitle", lang)}</h3>
              <p className="small">{ui("trickyHelp", lang)}</p>
              <ul className="tricky">{child.weak.slice(0, s.get<number>("parent.weakSpotsCount")).map((w) => <li key={w.questionId}>{stems[w.questionId] ?? "…"} <span className="small">({w.wrong} {ui("wrongOf", lang)} / {w.total})</span></li>)}</ul>
            </>
          )}
        </>
      )}
      {s.get("parent.export") === true && (
        <div className="actions noprint">
          <button type="button" className="btn ghost" onClick={() => window.print()}>{ui("printReport", lang)}</button>
          <button type="button" className="btn ghost" onClick={() => download(`${child.profile.nickname}-progress.csv`, csvOf(child, board, of), "text/csv")}>{ui("downloadCsv", lang)}</button>
        </div>
      )}
    </section>
  );
}

export function ParentPage() {
  const s = useSettings();
  const { lang } = s;
  const acct = useAccount();
  const [attempt, retry] = useRetry();
  const activeBoard = useActiveBoard();
  const board = useBoard(activeBoard, attempt);
  const [data, setData] = useState<ParentDashboard | null | "error">(null);
  const [stems, setStems] = useState<Record<string, string>>({});
  const [sel, setSel] = useState(0);
  const on = s.get("feature.parentDashboard") === true;

  useEffect(() => {
    if (!on || !acct.me) return;
    let alive = true;
    fetch(`/api/v1/account/dashboard?tz=${new Date().getTimezoneOffset()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(async (raw) => {
        const d = ParentDashboard.parse(raw);
        if (!alive) return;
        setData(d);
        const ids = [...new Set(d.children.flatMap((c) => c.weak.map((w) => w.questionId)))].slice(0, 30);
        if (ids.length) {
          const r = await fetch("/api/v1/practice/by-ids", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids }) });
          if (r.ok && alive) setStems(Object.fromEntries(PublicQuestion.array().parse((await r.json()).questions).map((q) => [q.id, s.name(q.stem)])));
        }
      })
      .catch(() => { if (alive) setData("error"); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, acct.me?.user.id, attempt]);

  const kids = useMemo(() => (data && data !== "error" ? data.children : []), [data]);
  if (!on) return <NotFound />;
  if (acct.me === undefined) return <Loading />;
  if (!acct.me) return <div className="paper"><h1>{ui("parentArea", lang)}</h1><p>{ui("parentSignIn", lang)}</p><Link className="btn" href="/account">{ui("signIn", lang)}</Link></div>;
  if (data === "error") return <ErrorBox onRetry={retry} />;
  if (data === null) return <Loading />;
  const child = kids[Math.min(sel, kids.length - 1)];
  return (
    <div className="paper parent">
      <h1>{ui("parentArea", lang)}</h1>
      {kids.length > 1 && (
        <div className="tabs noprint" role="tablist">
          {kids.map((k, i) => <button key={k.profile.id} type="button" role="tab" aria-selected={i === sel} className={i === sel ? "tab on" : "tab"} onClick={() => setSel(i)}>{AVATAR_EMOJI[k.profile.avatar] ?? "🙂"} {k.profile.nickname}</button>)}
        </div>
      )}
      {child && <Report child={child} board={board} stems={stems} />}
      {s.get("parent.export") === true && (
        <p className="noprint"><button type="button" className="btn ghost" onClick={async () => { const r = await fetch("/api/v1/account/export"); if (r.ok) download("sharpstudy-data.json", JSON.stringify(await r.json(), null, 2), "application/json"); }}>{ui("downloadAll", lang)}</button></p>
      )}
      <p className="noprint"><Link className="link" href="/account">← {ui("account", lang)}</Link></p>
    </div>
  );
}
