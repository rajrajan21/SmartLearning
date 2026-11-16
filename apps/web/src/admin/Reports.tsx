import { useEffect, useState } from "react";
import { admin, type StatsReport } from "./api";

const fmt = (n: number) => n.toLocaleString("en-IN");
const up = (s: number) => { const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60); return `${d ? d + "d " : ""}${h}h ${m}m`; };

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
    </section>
  );
}
