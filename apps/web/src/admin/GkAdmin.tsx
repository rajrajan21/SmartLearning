import { VoiceSearchInput } from "../components/VoiceSearchInput";
import { useCallback, useEffect, useMemo, useState } from "react";
import { admin, adminKey, adminUser } from "./api";

interface Report {
  generatedAt: string; lessons: number; puzzles: number; animations: number; sentences: number; recorded: number; invalid: string[];
  byCategory: { id: string; title: string; lessons: number; puzzles: number }[];
  byAge: { age: string; lessons: number; puzzles: number }[];
  unknownCategories: string[];
  ids: { id: string; category: string; kind: string; age: string; title: string }[];
}

async function call<T>(method: string, path: string): Promise<T> {
  const res = await fetch(`/api/v1/admin/gk${path}`, { method, headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: { message?: string } }).error?.message ?? `Request failed (${res.status})`);
  return data as T;
}
const list = (v: unknown): string[] => String(v ?? "").split(",").map((x) => x.trim()).filter((x) => x && x !== "none");
const pack = (a: string[]): string => (a.length ? a.join(",") : "none");

/** GK content manager: what is built, and tick boxes for categories, lessons and featured lessons (saved at once). */
export function GkAdmin() {
  const [r, setR] = useState<Report | null>(null);
  const [vals, setVals] = useState<Record<string, unknown>>({});
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");
  const load = useCallback(() => {
    Promise.all([call<Report>("GET", "/report"), admin.load()]).then(([rep, d]) => { setR(rep); setVals(d.values); setErr(""); }, (e: Error) => setErr(e.message));
  }, []);
  useEffect(load, [load]);
  const hiddenCats = list(vals["gk.categoriesHidden"]), hiddenLessons = list(vals["gk.lessonsHidden"]), featured = list(vals["gk.featured"]);
  const save = async (changes: Record<string, string>, ok: string) => {
    try { const x = await admin.save(changes as never); setVals(x.values); setMsg(ok); setErr(""); } catch (e) { setErr((e as Error).message); }
  };
  const toggle = (key: string, cur: string[], id: string, on: boolean, ok: string) => void save({ [key]: pack(on ? [...new Set([...cur, id])] : cur.filter((x) => x !== id)) }, ok);
  const rows = useMemo(() => (r?.ids ?? []).filter((x) => !q.trim() || `${x.id} ${x.title} ${x.category}`.toLowerCase().includes(q.trim().toLowerCase())), [r, q]);
  if (err && !r) return <p className="error" role="alert">{err}</p>;
  if (!r) return <p className="loading">Loading…</p>;
  const pct = r.sentences ? Math.round((r.recorded / r.sentences) * 100) : 0;
  return (
    <section className="group gk-admin" data-testid="gk-admin">
      <h3>What is built</h3>
      <p><b>{r.lessons}</b> lessons · <b>{r.puzzles}</b> puzzle sets · <b>{r.animations}</b> animated pictures · <b>{r.sentences}</b> narration sentences, <b>{r.recorded}</b> with a teacher recording ({pct}%).{pct < 100 && <> Run <code>Generate-Lesson-Audio.bat</code> to record the rest.</>}</p>
      <p className="small">By age: {r.byAge.map((a) => `${a.age}: ${a.lessons} lessons, ${a.puzzles} puzzles`).join(" · ")}</p>
      {r.invalid.length > 0 && <div className="notice" role="alert"><b>These files were skipped (fix them and reload):</b><ul>{r.invalid.map((x) => <li key={x}>{x}</li>)}</ul></div>}
      {r.unknownCategories.length > 0 && <p className="error">Lessons use categories that are not in categories.json: {r.unknownCategories.join(", ")}</p>}
      <p>
        <button type="button" className="btn ghost sm" onClick={() => { call("POST", "/reload").then(() => { setMsg("Reloaded from the content folder."); load(); }, (e: Error) => setErr(e.message)); }}>↻ Reload content files</button>{" "}
        <button type="button" className="btn ghost sm" onClick={() => { void admin.reset(["gk.categoriesHidden", "gk.lessonsHidden", "gk.featured"]).then((x) => { setVals(x.values); setMsg("Switches reset: everything is on, nothing is featured."); }, (e: Error) => setErr(e.message)); }}>Reset switches</button>
      </p>
      {msg && <p role="status" className="ok">{msg}</p>}
      {err && <p className="error" role="alert">{err}</p>}
      <h3>Categories</h3>
      <p className="small">Untick a category to hide all its lessons from the GK page and from Daily GK.</p>
      <ul className="gk-admin-list">
        {r.byCategory.map((c) => (
          <li key={c.id}><label><input type="checkbox" checked={!hiddenCats.includes(c.id)} onChange={(e) => toggle("gk.categoriesHidden", hiddenCats, c.id, !e.target.checked, `${c.title} ${e.target.checked ? "shown" : "hidden"}.`)} /> {c.title} <span className="small">({c.id}) · {c.lessons} lessons, {c.puzzles} puzzles</span></label></li>
        ))}
      </ul>
      <h3>Lessons</h3>
      <p className="small">“On” lists the lesson. “★” pins it to the Featured row at the top (up to the limit in the GK page settings). Ids are shown so you can use them in the other GK settings.</p>
      <VoiceSearchInput onVoice={setQ} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons" aria-label="Search lessons" />
      <table className="gk-admin-table">
        <thead><tr><th>On</th><th>★</th><th>Lesson</th><th>Type</th><th>Age</th><th>Category</th></tr></thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id}>
              <td><input type="checkbox" aria-label={`Show ${x.title}`} checked={!hiddenLessons.includes(x.id)} onChange={(e) => toggle("gk.lessonsHidden", hiddenLessons, x.id, !e.target.checked, `${x.title} ${e.target.checked ? "on" : "off"}.`)} /></td>
              <td><input type="checkbox" aria-label={`Feature ${x.title}`} checked={featured.includes(x.id)} onChange={(e) => toggle("gk.featured", featured, x.id, e.target.checked, `${x.title} ${e.target.checked ? "featured" : "not featured"}.`)} /></td>
              <td>{x.title}<br /><span className="small">{x.id}</span></td><td>{x.kind}</td><td>{x.age}</td><td>{x.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Adding more</h3>
      <p className="small">Write new topics in <code>tools/gk/src</code> (copy a lesson from any file there), then double-click <code>Build-GK.bat</code> and press Reload above. Then run <code>Generate-Lesson-Audio.bat</code> to add the teacher's voice.</p>
    </section>
  );
}
