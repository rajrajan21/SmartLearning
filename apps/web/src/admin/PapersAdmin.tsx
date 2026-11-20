import { useCallback, useEffect, useMemo, useState } from "react";
import { admin, type PapersSiteRow, type PapersStatus } from "./api";

const when = (s?: string) => (s ? new Date(s).toLocaleString() : "never");
const ids = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const capsOf = (s: string) => Object.fromEntries(ids(s).map((x) => x.split(/\s*[:=]\s*/)).filter((x) => x[0] && x[1] !== undefined).map(([k = "", v]) => [k.toLowerCase(), Number(v)]));
const Tally = ({ title, rows }: { title: string; rows: [string, number][] }) => (
  <div><b>{title}</b><ul>{rows.length ? rows.map(([k, n]) => <li key={k}>{k}: {n}</li>) : <li>none yet</li>}</ul></div>
);

/** Question Papers admin page: last run, counts, per-site status, hide/show papers, reset the collector's memory. Settings themselves are the fields above. */
export function PapersAdmin() {
  const [st, setSt] = useState<PapersStatus | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<Set<string>>(new Set());
  const load = useCallback(async () => {
    try { setSt(await admin.papersStatus()); } catch (e) { setMsg({ kind: "err", text: e instanceof Error ? e.message : "Could not load." }); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const rows = useMemo(() => (st?.papers ?? []).filter((p) => !q || `${p.title} ${p.site} ${p.subject}`.toLowerCase().includes(q.toLowerCase())), [st, q]);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); setMsg({ kind: "ok", text: ok }); setPick(new Set()); await load(); } catch (e) { setMsg({ kind: "err", text: e instanceof Error ? e.message : "Failed." }); }
  };
  const toggle = (id: string) => setPick((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  if (!st) return <p>{msg?.text ?? "Loading…"}</p>;
  const job = st.job;
  const cfg = st.config;
  const siteOn = (s: PapersSiteRow) => !ids(cfg.disabledSites).includes(s.id) && (s.defaultOn || ids(cfg.enabledSites).includes(s.id));
  const siteHidden = (s: PapersSiteRow) => ids(cfg.hiddenSites.toLowerCase()).includes(s.hideKey.toLowerCase());
  const papersFrom = (s: PapersSiteRow) => st.bySite.filter(([n]) => n.toLowerCase().includes(s.hideKey.toLowerCase())).reduce((a, [, n]) => a + n, 0);
  const save = (changes: Record<string, string>, ok: string) => run(() => admin.save(changes), ok);
  const setCollect = (s: PapersSiteRow, on: boolean) => {
    const dis = new Set(ids(cfg.disabledSites)); const en = new Set(ids(cfg.enabledSites));
    if (on) { dis.delete(s.id); if (!s.defaultOn) en.add(s.id); } else { en.delete(s.id); dis.add(s.id); }
    return save({ "papers.job.disabledSites": [...dis].join(", "), "papers.job.enabledSites": [...en].join(", ") }, `${s.name}: collecting ${on ? "on" : "off"}.`);
  };
  const setHidden = (s: PapersSiteRow, hide: boolean) => {
    const h = new Set(ids(cfg.hiddenSites)); const k = s.hideKey.toLowerCase();
    if (hide) h.add(k); else for (const x of [...h]) if (x.toLowerCase() === k) h.delete(x);
    return save({ "papers.hiddenSites": [...h].join(", ") }, hide ? `All papers from ${s.name} are now hidden from students.` : `Papers from ${s.name} are shown again.`);
  };
  const setCap = (s: PapersSiteRow, n: number) => {
    const caps = capsOf(cfg.siteCaps); caps[s.id.toLowerCase()] = n;
    return save({ "papers.job.siteCaps": Object.entries(caps).map(([k, v]) => `${k}:${v}`).join(", ") }, `${s.name}: daily cap ${n || "none"}.`);
  };
  const caps = capsOf(cfg.siteCaps);
  return (
    <fieldset className="group" aria-label="Question papers status">
      <legend>Question papers: status and control</legend>
      {msg && <p role={msg.kind === "err" ? "alert" : "status"}>{msg.text}</p>}
      <p>
        <b>{st.total}</b> papers ({st.visible} shown to students), <b>{st.questions}</b> questions, <b>{st.withAnswers}</b> with an answer key. Last change: {when(st.updated)}.
      </p>
      <h4>Collector (runs on your PC)</h4>
      {job ? (
        <>
          <p>Last run: {when(job.startedAt)} to {when(job.finishedAt)}. Added {job.added ?? 0}, skipped {job.skipped ?? 0}, failed {job.failed ?? 0}. Settings read from: {job.configSource ?? "unknown"}. {job.storageMB != null && <>Storage: {job.storageMB} MB.</>}</p>
          {job.sites && job.sites.length > 0 && (
            <table><thead><tr><th>Site</th><th>Status</th><th>Added</th><th>Note</th></tr></thead>
              <tbody>{job.sites.map((s, i) => <tr key={s.id ?? i}><td>{s.name ?? s.id}</td><td>{s.status}</td><td>{s.added ?? 0}</td><td>{s.note}</td></tr>)}</tbody></table>
          )}
        </>
      ) : <p>The collector has not reported yet. On your PC run Harvest-Question-Papers.bat, then publish with Go-Live.bat.</p>}
      <p>
        <button type="button" className="btn ghost sm" onClick={() => { if (confirm("Make the collector forget which papers it has seen? It will re-check every site next run (duplicates are still skipped by content).")) void run(admin.papersResetCollector, "Collector memory will be cleared on its next run."); }}>Reset collector memory</button>{" "}
        <button type="button" className="btn ghost sm" onClick={() => void load()}>Refresh</button>
      </p>
      <h4>Sources (websites the collector reads)</h4>
      <p><small>Papers belong to their original publishers and are shown free for student practice, with a credit and a link to the original page on every paper. If a rights holder asks, use <b>Hide papers</b>: that website's papers disappear from the student pages at once (they stay stored). Edit the public copyright note under Question papers &gt; Credits and copyright.</small></p>
      {st.sites.length ? (
        <table><thead><tr><th>Website</th><th>Type</th><th>Papers</th><th>Collect</th><th>Daily cap</th><th>Hide papers (on request)</th><th>Last check</th></tr></thead>
          <tbody>{st.sites.map((s) => (
            <tr key={s.id}><td>{s.name}</td><td>{s.tier || s.board}</td><td>{papersFrom(s)}</td>
              <td><input type="checkbox" aria-label={`Collect from ${s.name}`} checked={siteOn(s)} onChange={(e) => void setCollect(s, e.target.checked)} /></td>
              <td><input type="number" min={0} max={500} aria-label={`Daily cap for ${s.name}`} defaultValue={caps[s.id.toLowerCase()] ?? s.dailyCap} style={{ width: "5rem" }} onBlur={(e) => { const n = Math.max(0, Math.min(500, Number(e.target.value) || 0)); if (n !== (caps[s.id.toLowerCase()] ?? s.dailyCap)) void setCap(s, n); }} /></td>
              <td><input type="checkbox" aria-label={`Hide papers from ${s.name}`} checked={siteHidden(s)} onChange={(e) => void setHidden(s, e.target.checked)} /> {siteHidden(s) ? "Hidden" : "Shown"}</td>
              <td>{s.status}</td></tr>
          ))}</tbody></table>
      ) : <p>The list of websites appears after the first Discover or Harvest run on your PC.</p>}
      <h4>Library</h4>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <Tally title="By board" rows={st.byBoard} /><Tally title="By class" rows={st.byClass} /><Tally title="By kind" rows={st.byKind} /><Tally title="By site" rows={st.bySite} /><Tally title="Top subjects" rows={st.bySubject.slice(0, 10)} />
      </div>
      <h4>Papers (newest 400)</h4>
      <p>
        <input aria-label="Search papers" placeholder="Search title, site, subject" value={q} onChange={(e) => setQ(e.target.value)} />{" "}
        <button type="button" disabled={!pick.size} className="btn sm" onClick={() => void run(() => admin.papersHide([...pick]), `Hidden ${pick.size}.`)}>Hide selected</button>{" "}
        <button type="button" disabled={!pick.size} className="btn ghost sm" onClick={() => void run(() => admin.papersShow([...pick]), `Showing ${pick.size} again.`)}>Show selected</button>
      </p>
      <table><thead><tr><th /><th>Title</th><th>Class</th><th>Subject</th><th>Qs</th><th>Key</th><th>Site</th><th>State</th></tr></thead>
        <tbody>{rows.map((p) => (
          <tr key={p.id}><td><input type="checkbox" aria-label={`Select ${p.title}`} checked={pick.has(p.id)} onChange={() => toggle(p.id)} /></td><td>{p.title}</td><td>{p.cls}</td><td>{p.subject}</td><td>{p.questions}</td><td>{p.keyed}</td><td>{p.site}</td><td>{p.hidden ? "Hidden" : "Shown"}</td></tr>
        ))}</tbody></table>
    </fieldset>
  );
}
