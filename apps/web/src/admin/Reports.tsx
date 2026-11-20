import { useEffect, useState } from "react";
import { admin, type StatsReport } from "./api";

const fmt = (n: number) => n.toLocaleString("en-IN");
const up = (s: number) => { const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return `${d ? d + "d " : ""}${h}h ${m}m`; };

type Prob = { id: string; kind: string; about: string; text: string; at: string; status: "new" | "seen" | "fixed" };
/** Notes sent with "Report a problem". Mark each as seen or fixed. */
function Problems() {
  const [rows, setRows] = useState<Prob[] | null>(null);
  const load = () => admin.problemReports().then((d) => setRows(d.reports)).catch(() => setRows([]));
  useEffect(() => { void load(); }, []);
  if (!rows) return null;
  return (
    <>
      <h3>Problem reports ({rows.filter((r) => r.status === "new").length} new)</h3>
      {rows.length === 0 ? <p>No reports yet.</p> : (
        <ul className="rep-probs">{rows.slice(0, 50).map((r) => (
          <li key={r.id} className={`prob ${r.status}`}>
            <p><b>{r.kind}</b> · <code>{r.about}</code> · {r.at.slice(0, 10)}</p>
            <p>{r.text}</p>
            <p>{(["new", "seen", "fixed"] as const).map((st) => <button key={st} type="button" className="btn ghost sm" aria-pressed={r.status === st} onClick={() => void admin.setReportStatus(r.id, st).then(load)}>{st}</button>)}</p>
          </li>
        ))}</ul>
      )}
    </>
  );
}

/** Try the mail keys, or send this week's summary now. Save the settings first. */
function MailBox() {
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [last, setLast] = useState<string>("");
  useEffect(() => { admin.mailStatus().then((d) => setLast(d.lastSent ? `Last run ${d.lastSent}: ${d.lastResult ?? ""}` : "Not sent yet.")).catch(() => undefined); }, []);
  const act = async (f: () => Promise<string>) => { setMsg("Working…"); try { setMsg(await f()); } catch (e) { setMsg(e instanceof Error ? e.message : "Failed."); } };
  return (
    <>
      <h3>Weekly e-mail</h3>
      <p>{last} Save your mail keys first (Mail keys section above), then try them here.</p>
      <p>
        <input type="email" aria-label="Send a test e-mail to" placeholder="you@example.com" value={to} onChange={(e) => setTo(e.target.value)} />{" "}
        <button type="button" className="btn ghost sm" onClick={() => void act(async () => { await admin.mailTest(to); return "Test e-mail sent. Check your inbox."; })}>Send test e-mail</button>{" "}
        <button type="button" className="btn ghost sm" onClick={() => void act(async () => { const r = await admin.mailRun(); return r.skipped ?? `Sent ${r.sent}, failed ${r.failed}.`; })}>Send this week's summary now</button>
      </p>
      <p role="status">{msg}</p>
    </>
  );
}

/** AI helper use and totals, to see whether the free quota is enough. */
function Usage() {
  const [u, setU] = useState<Awaited<ReturnType<typeof admin.usage>> | null>(null);
  useEffect(() => { admin.usage(14).then(setU).catch(() => setU(null)); }, []);
  if (!u) return null;
  const max = Math.max(1, u.busiestAi);
  return (
    <>
      <h3>Usage (last 14 days)</h3>
      <ul className="rep-tiles">{([["AI answers", u.totalAi], ["Busiest day", u.busiestAi], ["Daily average", u.avgAi], ["Parent accounts", u.accounts], ["Children", u.children], ["Questions answered (all time)", u.answers]] as [string, number][]).map(([k, v]) => <li key={k}><b>{fmt(v)}</b><span>{k}</span></li>)}</ul>
      <ol className="rep-bars" aria-label="AI answers per day">{u.days.map((d) => <li key={d.day} title={`${d.aiAnswers}`}><i style={{ height: `${Math.round((d.aiAnswers / max) * 100)}%` }} /></li>)}</ol>
      <p className="small">{u.costNote} Each child may ask {u.limitPerChild} AI questions a day (Admin → AI helper → Limits).</p>
    </>
  );
}

/** Visitors, sign-ups and server health, from the site's own counters. */
export function Reports() {
  const [days, setDays] = useState(14);
  const [r, setR] = useState<StatsReport | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { setErr(""); admin.stats(days).then(setR).catch((e) => setErr(e instanceof Error ? e.message : "Could not load the report.")); }, [days]);
  if (err) return <p role="alert">{err}</p>;
  if (!r) return <p>Loading the report…</p>;
  const max = Math.max(1, ...r.days.map((d) => d.views));
  const csv = () => { const rows = ["date,views,visitors,signups,logins,questions", ...r.days.map((d) => `${d.date},${d.views},${d.visitors},${d.signups},${d.logins},${d.questions}`)].join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows], { type: "text/csv" })); a.download = `sharpstudy-report-${days}d.csv`; a.click(); };
  const tiles: [string, number][] = [["Page views", r.totals.views], ["Visitors", r.totals.visitors], ["Sign-ups", r.totals.signups], ["Sign-ins", r.totals.logins], ["Questions answered", r.totals.questions]];
  return (
    <section className="reports" aria-label="Reports">
      <div className="a-head"><div><h2>Reports</h2><p>Last {days} days. Visitors are counted as anonymous daily codes.</p></div>
        <div className="rep-ctl"><select aria-label="Period" value={days} onChange={(e) => setDays(Number(e.target.value))}>{[7, 14, 30, 90].map((d) => <option key={d} value={d}>{d} days</option>)}</select> <button type="button" className="btn ghost sm" onClick={csv}>Download CSV</button></div></div>
      <ul className="rep-tiles">{tiles.map(([k, v]) => <li key={k}><b>{fmt(v)}</b><span>{k}</span></li>)}</ul>
      <h3>Visitors report</h3>
      <div className="rep-bars" role="img" aria-label="Page views per day">{r.days.map((d) => <span key={d.date} title={`${d.date}: ${d.views} views, ${d.visitors} visitors`} style={{ height: `${Math.max(3, (d.views / max) * 100)}%` }} />)}</div>
      <h3>Daily numbers</h3>
      <div className="rep-scroll"><table className="rep-table"><thead><tr><th>Date</th><th>Views</th><th>Visitors</th><th>Sign-ups</th><th>Sign-ins</th><th>Questions</th></tr></thead>
        <tbody>{[...r.days].reverse().map((d) => <tr key={d.date}><td>{d.date}</td><td>{d.views}</td><td>{d.visitors}</td><td>{d.signups}</td><td>{d.logins}</td><td>{d.questions}</td></tr>)}</tbody></table></div>
      <h3>Most visited pages</h3>
      <ol className="rep-pages">{r.topPages.length ? r.topPages.map((p) => <li key={p.path}><code>{p.path}</code> <b>{p.views}</b></li>) : <li>No visits yet.</li>}</ol>
      <h3>Server report</h3>
      <ul className="rep-tiles"><li><b>{up(r.server.uptimeSeconds)}</b><span>Running for</span></li><li><b>{r.server.memoryMb} MB</b><span>Memory</span></li><li><b>{fmt(r.server.requests)}</b><span>API requests</span></li><li><b>{fmt(r.server.errors)}</b><span>Server errors</span></li><li><b>{r.server.node}</b><span>{r.server.platform}</span></li></ul>
      <Problems />
      <Usage />
      <MailBox />
    </section>
  );
}
