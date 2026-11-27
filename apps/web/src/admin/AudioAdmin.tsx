import { VoiceSearchInput } from "../components/VoiceSearchInput";
import { useCallback, useEffect, useMemo, useState } from "react";
import { admin, type AudioCoverage, type AudioCoverageRow } from "./api";

const KIND: Record<string, string> = { lesson: "Lessons", question: "Questions", classroom: "Classroom boards", gk: "GK", phrases: "Stock phrases" };
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "-");

/** Admin > Audio coverage: which lessons have teacher audio, which are partly done and which have none. Settings are the fields above. */
export function AudioAdmin({ perPage = 50, defaultFilter = "all" }: { perPage?: number; defaultFilter?: string }) {
  const [d, setD] = useState<AudioCoverage | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState("lesson");
  const [status, setStatus] = useState(defaultFilter);
  const [cls, setCls] = useState(""); const [subject, setSubject] = useState(""); const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const load = useCallback(async (refresh = false) => {
    setBusy(true); setMsg(null);
    try { setD(await admin.audioCoverage(refresh)); } catch (e) { setMsg(e instanceof Error ? e.message : "Could not load."); } finally { setBusy(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const ofKind = useMemo(() => (d?.rows ?? []).filter((r) => r.kind === kind), [d, kind]);
  const rows = useMemo(() => ofKind.filter((r) => (!status || status === "all" || r.status === status) && (!cls || String(r.cls) === cls) && (!subject || r.subject === subject) && (!q || r.item.toLowerCase().includes(q.toLowerCase()))), [ofKind, status, cls, subject, q]);
  useEffect(() => setPage(0), [kind, status, cls, subject, q]);
  if (!d) return <p>{msg ?? "Working out audio coverage… (the first time can take a minute)"}</p>;
  const sum = (list: AudioCoverageRow[]) => ({ n: list.length, complete: list.filter((r) => r.status === "complete").length, partial: list.filter((r) => r.status === "partial").length, none: list.filter((r) => r.status === "none").length });
  const classes = [...new Set(ofKind.map((r) => r.cls).filter((x): x is number => x != null))].sort((a, b) => a - b);
  const subjects = [...new Set(ofKind.map((r) => r.subject).filter(Boolean))].sort();
  const shown = rows.slice(page * perPage, page * perPage + perPage), pages = Math.max(1, Math.ceil(rows.length / perPage));
  const download = (everything = false) => {
    const head = ["kind", "item", "class", "subject", "status", "sentences", ...d.voices.map((v) => `have_${v}`)];
    const body = (everything ? d.rows : rows).map((r) => [r.kind, r.item, r.cls ?? "", r.subject, r.status, r.total, ...r.have]);
    const csvText = [head, ...body].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csvText], { type: "text/csv" })); a.download = everything ? "audio-coverage-all.csv" : "audio-coverage.csv"; a.click();
  };
  return (
    <fieldset className="group" aria-label="Audio coverage">
      <legend>Audio coverage: which lessons have audio</legend>
      {msg && <p role="alert">{msg}</p>}
      <p>
        Voices checked: <b>{d.voices.map((v) => d.voiceLabels[v] ?? v).join(", ") || "none"}</b>. Recordings listed: <b>{d.manifestClips}</b>
        {d.checkedFiles ? <> ({d.manifestMissingFiles} listed but the sound file is missing)</> : null}. Worked out {new Date(d.generatedAt).toLocaleString()}.{" "}
        <button type="button" className="btn ghost sm" disabled={busy} onClick={() => void load(true)}>{busy ? "Checking…" : "Check again"}</button>
      </p>
      {d.skippedNoVoice.length > 0 && <p role="status">No voice set up in voices.json for: {d.skippedNoVoice.join(", ")}.</p>}
      <table><thead><tr><th>Type</th><th>Items</th><th>All audio</th><th>Some audio</th><th>No audio</th></tr></thead>
        <tbody>{(Object.keys(KIND)).map((k) => { const s = sum(d.rows.filter((r) => r.kind === k)); return s.n ? <tr key={k}><td><button type="button" className="link" onClick={() => setKind(k)}>{KIND[k]}</button></td><td>{s.n}</td><td>{s.complete} ({pct(s.complete, s.n)})</td><td>{s.partial}</td><td>{s.none}</td></tr> : null; })}</tbody></table>
      <h4>{KIND[kind]}</h4>
      <div className="papers-filters">
        <select aria-label="Show" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All</option><option value="none">No audio</option><option value="partial">Some audio</option><option value="complete">All audio</option></select>
        {classes.length > 0 && <select aria-label="Class" value={cls} onChange={(e) => setCls(e.target.value)}><option value="">All classes</option>{classes.map((c) => <option key={c} value={c}>Class {c}</option>)}</select>}
        {subjects.length > 0 && <select aria-label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">All subjects</option>{subjects.map((s) => <option key={s}>{s}</option>)}</select>}
        <VoiceSearchInput aria-label="Search" placeholder="Search name" onVoice={setQ} value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="btn ghost sm" onClick={() => download()}>Download this list (CSV)</button>
        <button type="button" className="btn ghost sm" onClick={() => download(true)}>Download everything (CSV)</button>
      </div>
      <p>{rows.length} shown of {ofKind.length}.</p>
      {rows.length === 0 ? <p>Nothing matches.</p> : (
        <table><thead><tr><th>Name</th><th>Class</th><th>Subject</th><th>Sentences</th>{d.voices.map((v) => <th key={v}>{d.voiceLabels[v] ?? v}</th>)}<th>Status</th><th>Missing (first lines)</th></tr></thead>
          <tbody>{shown.map((r) => (
            <tr key={r.kind + r.item}><td>{r.item.replace(/\.json$/, "")}</td><td>{r.cls ?? ""}</td><td>{r.subject}</td><td>{r.total}</td>
              {r.have.map((h, i) => <td key={i}>{h}/{r.total}</td>)}
              <td>{r.status === "complete" ? "All audio" : r.status === "partial" ? "Some audio" : "No audio"}</td>
              <td>{r.missing.join(" | ")}</td></tr>
          ))}</tbody></table>
      )}
      {pages > 1 && <p><button type="button" className="btn ghost sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button> Page {page + 1} of {pages} <button type="button" className="btn ghost sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Next</button></p>}
    </fieldset>
  );
}
