import { VoiceSearchInput } from "../components/VoiceSearchInput";
import { useEffect, useMemo, useState } from "react";

interface Report {
  generatedAt: string;
  baseline?: { lessons: number; animations: number; anyVisual: number; keywordsOnly: number };
  totals: { lessons: number; before: number; animations: number; lessonBoards?: number; keywordCards: number; withPicture: number; anyVisual: number; keywordsOnly: number; none: number };
  bySubject: Record<string, { lessons: number; covered: number; lessonBoards?: number }>;
  animationRules: Record<string, number>;
  pictures: { src: string; lessons: number }[];
  none: string[];
  problems: string[];
}
type Credits = Record<string, { title?: string; author?: string; license?: string; source?: string; bytes?: number }>;

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

/** Admin > Visuals: coverage report. Reads the report made by Build-Visuals.bat (public/visuals/coverage.json) and the picture credits. */
export function VisualsAdmin() {
  const [rep, setRep] = useState<Report | null>(null), [credits, setCredits] = useState<Credits>({}), [err, setErr] = useState(""), [q, setQ] = useState("");
  useEffect(() => {
    void fetch("/visuals/coverage.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error("not built yet")))).then(setRep).catch(() => setErr("No report yet. Run Build-Visuals.bat on the PC, then reload this page."));
    void fetch("/pictures/credits.json", { cache: "no-store" }).then((r) => (r.ok ? r.json() : {})).then(setCredits).catch(() => setCredits({}));
  }, []);
  const rows = useMemo(() => Object.entries(rep?.bySubject ?? {}).sort(([a], [b]) => a.localeCompare(b)), [rep]);
  if (!rep) return <p className="small">{err || "Loading the report ..."}</p>;
  const t = rep.totals, b = rep.baseline, fetched = rep.pictures.filter((p) => credits[p.src]).length, pending = rep.pictures.filter((p) => !credits[p.src]);
  const none = rep.none.filter((x) => x.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="admin-visuals">
      <p className="small">Built {new Date(rep.generatedAt).toLocaleString()}. Run <b>Build-Visuals.bat</b> after new lessons are added, and <b>Fetch-Lesson-Pictures.bat</b> to download the real pictures.</p>
      <table className="table">
        <thead><tr><th>Measure</th><th>Before (baseline)</th><th>Now</th></tr></thead>
        <tbody>
          <tr><th scope="row">Lessons in the report</th><td>{b ? b.lessons : "-"}</td><td>{t.lessons}</td></tr>
          <tr><th scope="row">Topic animations (hand-made and library)</th><td>{b ? `${b.animations} (${pct(b.animations, b.lessons)}%)` : "-"}</td><td>{t.animations} ({pct(t.animations, t.lessons)}%)</td></tr>
          <tr><th scope="row">Boards built from the lesson text</th><td>0</td><td>{t.lessonBoards ?? 0} ({pct(t.lessonBoards ?? 0, t.lessons)}%)</td></tr>
          <tr><th scope="row">Lessons with any topic animation or picture</th><td>{b ? `${b.anyVisual} (${pct(b.anyVisual, b.lessons)}%)` : "-"}</td><td><b>{t.anyVisual}</b> ({pct(t.anyVisual, t.lessons)}%)</td></tr>
          <tr><th scope="row">Lessons with only the Key words card</th><td>{b ? `${b.keywordsOnly} (${pct(b.keywordsOnly, b.lessons)}%)` : "-"}</td><td>{t.keywordsOnly} ({pct(t.keywordsOnly, t.lessons)}%)</td></tr>
          <tr><th scope="row">Had a picture or diagram block before the visuals job</th><td colSpan={2}>{t.before} ({pct(t.before, t.lessons)}%)</td></tr>
          <tr><th scope="row">Lessons with a real picture planned</th><td colSpan={2}>{t.withPicture} ({fetched} of {rep.pictures.length} different pictures downloaded)</td></tr>
        </tbody>
      </table>
      <p className="small">The generated boards can be switched off on the Visuals: animations page ("Show the boards built automatically from each lesson's own text").</p>
      <h3>By class and subject</h3>
      <table className="table">
        <thead><tr><th>Class and subject</th><th>Lessons</th><th>With a topic visual</th><th>%</th><th>Of which built from lesson text</th></tr></thead>
        <tbody>{rows.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v.lessons}</td><td>{v.covered}</td><td>{pct(v.covered, v.lessons)}%</td><td>{v.lessonBoards ?? 0}</td></tr>)}</tbody>
      </table>
      <h3>Which animations are used</h3>
      <p className="small">{Object.entries(rep.animationRules).sort(([, a], [, b]) => b - a).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
      <h3>Pictures</h3>
      {rep.pictures.length === 0 ? <p className="small">No pictures are planned.</p> : (
        <table className="table">
          <thead><tr><th>Picture</th><th>Lessons</th><th>Status</th><th>Credit</th></tr></thead>
          <tbody>{rep.pictures.map((p) => { const c = credits[p.src]; return <tr key={p.src}><td>{p.src}</td><td>{p.lessons}</td><td>{c ? "downloaded" : "waiting for Fetch-Lesson-Pictures.bat"}</td><td>{c ? `${c.author ?? ""} · ${c.license ?? ""}` : ""}</td></tr>; })}</tbody>
        </table>
      )}
      {pending.length > 0 && <p className="small">{pending.length} pictures still show a labelled frame on the board until they are downloaded.</p>}
      <h3>Lessons with no topic animation or picture ({none.length})</h3>
      <label className="small">Search <VoiceSearchInput onVoice={setQ} value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <ul className="small" style={{ maxHeight: 280, overflow: "auto" }}>{none.slice(0, 400).map((x) => <li key={x}>{x}</li>)}</ul>
      {rep.problems.length > 0 && <><h3>Could not build</h3><ul className="small">{rep.problems.map((x) => <li key={x}>{x}</li>)}</ul></>}
    </div>
  );
}
