import { useCallback, useEffect, useState } from "react";
import { adminKey, adminUser } from "./api";

interface Tally { key: string; count: number }
interface Book { id: string; title: string; hidden?: boolean; ageBand?: string; language?: string; bytes?: number; site?: string; licence?: string }
interface Data {
  usage: { bytes: number; books: number; hidden: number; missingFiles: number; capGB: number; plannedServerCapGB: number; usingServerCap: boolean; usedPercent: number; warnPercent: number; diskFreeBytes: number | null };
  by: { age: Tally[]; language: Tally[]; site: Tally[]; licence: Tally[] };
  job: Record<string, unknown>;
  status: { updatedAt?: string; runs?: { at: string; added: number; skipped: number; blocked?: number; stoppedBecause?: string; books?: string[] }[]; sites?: { id: string; name: string; status: string; added: number; skipped: number; done: boolean; doneAt: string | null; blockedAt: string | null }[] } | null;
  pendingCommands: { action: string; site?: string; at?: string }[];
  blocked: number;
  books: Book[];
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/v1/admin/library${path}`, {
    method,
    headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()), ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: { message?: string } }).error?.message ?? `Request failed (${res.status})`);
  return data as T;
}
const gb = (b: number) => `${(b / 1073741824).toFixed(2)} GB`;

function Tallies({ title, rows }: { title: string; rows: Tally[] }) {
  return <div className="lib-tally"><b>{title}</b>{rows.length === 0 ? <span className="small"> none yet</span> : <ul>{rows.map((r) => <li key={r.key}>{r.key}: {r.count}</li>)}</ul>}</div>;
}

interface PageStats { available: boolean; books?: number; bytes?: number; queued?: number; building?: string | null; failed?: number }
const mbs = (b: number) => `${(b / 1048576).toFixed(b >= 10485760 ? 0 : 1)} MB`;

/** Book Reader page pictures: how many books are drawn, space used, and draw / clear buttons. */
function PagePictures({ total, onMsg, onErr }: { total: number; onMsg: (m: string) => void; onErr: (m: string) => void }) {
  const [p, setP] = useState<PageStats | null>(null);
  const load = useCallback(() => { call<PageStats>("GET", "/pages").then(setP, () => setP({ available: false })); }, []);
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);
  if (!p) return null;
  if (!p.available) return <><h3>Book Reader pictures</h3><p className="small">Not available in this site build.</p></>;
  const run = (path: string, body: unknown, ok: (r: Record<string, unknown>) => string) => call<Record<string, unknown>>("POST", path, body).then((r) => { onMsg(ok(r)); load(); }, (e: Error) => onErr(e.message));
  return (
    <>
      <h3>Book Reader pictures</h3>
      <p>{p.books ?? 0} of {total} books drawn · {mbs(p.bytes ?? 0)} used{p.queued ? ` · ${p.queued} waiting` : ""}{p.building ? ` · drawing now: ${p.building}` : ""}{p.failed ? ` · ${p.failed} could not be drawn (they open as PDF)` : ""}</p>
      <p className="actions">
        <button type="button" className="btn" onClick={() => void run("/pages/build", {}, (r) => `Started drawing ${String(r.queued ?? 0)} book(s) in the background.`)}>Draw all books that have none</button>{" "}
        <button type="button" className="btn" onClick={() => { if (window.confirm("Delete every page picture? Books open as PDF until they are drawn again.")) void run("/pages/clear", {}, (r) => `Deleted the pictures of ${String(r.removed ?? 0)} book(s).`); }}>Clear all pictures</button>
      </p>
      <p className="small">Pictures are drawn automatically when a book is added or first opened. Sizes, quality and the space cap are in the settings above. To draw everything at once on the PC, run Build-Library-Pages.bat.</p>
    </>
  );
}

/** Storage, books, collector status and run history for the E-Library. Settings themselves are the fields above. */
export function LibraryAdmin() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => { call<Data>("GET", "").then((x) => { setD(x); setErr(""); }, (e: Error) => setErr(e.message)); }, []);
  useEffect(load, [load]);
  const act = async (path: string, body: unknown, ok: string) => { try { await call("POST", path, body); setMsg(ok); load(); } catch (e) { setErr((e as Error).message); } };
  if (err && !d) return <p className="error" role="alert">{err}</p>;
  if (!d) return <p className="loading">Loading…</p>;
  const u = d.usage;
  const warn = u.usedPercent >= u.warnPercent;
  return (
    <section className="group lib-admin" data-testid="library-admin">
      <h3>Storage</h3>
      <p>
        <b>{gb(u.bytes)}</b> of <b>{u.capGB} GB</b> used ({u.usedPercent}%) · {u.books} books on the shelf{u.hidden ? ` · ${u.hidden} hidden` : ""}{u.missingFiles ? ` · ${u.missingFiles} catalogue rows without a file here` : ""}
        {u.diskFreeBytes != null && <> · {gb(u.diskFreeBytes)} free on this disk</>}
      </p>
      <progress max={100} value={Math.min(100, u.usedPercent)} aria-label="Storage used" />
      <p className="small">Now: {u.usingServerCap ? "server cap" : "PC cap"} in use. PC cap 5 GB by default; the planned server cap is {u.plannedServerCapGB} GB (switch it on above once the site is on the server).</p>
      {warn && <p className="error" role="alert">Storage is above {u.warnPercent}%. Raise the cap or remove books.</p>}
      <h3>What is on the shelf</h3>
      <div className="lib-tallies"><Tallies title="Age range" rows={d.by.age} /><Tallies title="Language" rows={d.by.language} /><Tallies title="Website" rows={d.by.site} /><Tallies title="Licence" rows={d.by.licence} /></div>
      <PagePictures total={u.books} onMsg={setMsg} onErr={setErr} />
      <h3>Collector job <small>({d.job.enabled ? "ON" : "OFF"}, {String(d.job.runsPerDay)} runs a day, {String(d.job.perRun)} books a run)</small></h3>
      {d.status ? (
        <>
          {d.status.runs?.[0] && <p>Last run {d.status.runs[0].at}: added {d.status.runs[0].added}, skipped {d.status.runs[0].skipped}{d.status.runs[0].stoppedBecause ? `, stopped: ${d.status.runs[0].stoppedBecause}` : ""}.</p>}
          {d.status.sites && d.status.sites.length > 0 && <table className="lib-table"><thead><tr><th>Site</th><th>Plan</th><th>Added</th><th>Skipped</th><th>State</th></tr></thead><tbody>{d.status.sites.map((s) => <tr key={s.id}><td>{s.name}</td><td>{s.status}</td><td>{s.added}</td><td>{s.skipped}</td><td>{s.blockedAt ? `blocked ${s.blockedAt}` : s.done ? `finished ${s.doneAt ?? ""}` : "in progress"}</td></tr>)}</tbody></table>}
          {d.status.runs && d.status.runs.length > 0 && <details><summary>Run history ({d.status.runs.length})</summary><ul>{d.status.runs.map((h, i) => <li key={i}>{h.at}: added {h.added}, skipped {h.skipped}{h.books?.length ? ` (${h.books.join("; ")})` : ""}</li>)}</ul></details>}
        </>
      ) : <p className="small">The collector has not run yet. Run Harvest-Library-Books.bat on the PC, or turn the schedule on.</p>}
      {d.pendingCommands.length > 0 && <p className="small">Waiting for the next run: {d.pendingCommands.map((c) => `${c.action}${c.site ? " " + c.site : ""}`).join(", ")}</p>}
      <p className="actions">
        <button type="button" className="btn" onClick={() => void act("/command", { action: "clear-skipped" }, "Skipped list will be cleared at the next run.")}>Clear skipped lists</button>{" "}
        <button type="button" className="btn" onClick={() => { if (window.confirm("Start every site again from the beginning at the next run? Books you already have are kept.")) void act("/command", { action: "reset-all" }, "All sites will restart at the next run."); }}>Reset all sites</button>
        {d.by.site.map((s) => <span key={s.key}> <button type="button" className="btn" onClick={() => void act("/command", { action: "reset-site", site: s.key }, `${s.key} will restart at the next run.`)}>Reset {s.key}</button></span>)}
      </p>
      <h3>Books ({d.books.length} latest)</h3>
      <p className="small">Removing a book deletes its files and stops it coming back. Hiding keeps the files.</p>
      <table className="lib-table"><thead><tr><th>Title</th><th>Age</th><th>Lang</th><th>Site</th><th>Licence</th><th /></tr></thead><tbody>
        {d.books.map((b) => (
          <tr key={b.id}><td>{b.title}{b.hidden ? " (hidden)" : ""}</td><td>{b.ageBand}</td><td>{b.language}</td><td>{b.site}</td><td>{b.licence}</td>
            <td><button type="button" onClick={() => void act("/hide", { id: b.id, hidden: !b.hidden }, b.hidden ? "Shown again." : "Hidden.")}>{b.hidden ? "Show" : "Hide"}</button>{" "}
              <button type="button" onClick={() => { if (window.confirm(`Delete "${b.title}" for good?`)) void act("/remove", { id: b.id }, "Removed."); }}>Remove</button></td></tr>
        ))}
      </tbody></table>
      {msg && <p role="status">{msg}</p>}{err && <p className="error" role="alert">{err}</p>}
    </section>
  );
}
