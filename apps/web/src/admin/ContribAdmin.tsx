import { useCallback, useEffect, useState } from "react";
import { adminKey, adminUser } from "./api";

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/v1/admin/contrib${path}`, {
    method,
    headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()), ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: { message?: string } }).error?.message ?? `Request failed (${res.status})`);
  return data as T;
}
interface Row { id: string; status: string; createdAt: string; title: string; author: string; licence: string; source: string; bytes: number; score: number | null; outcome: string | null; fails?: unknown }
interface Detail { id: string; status: string; reasons: string[]; adminNote: string; sourceLink: string; meta: Record<string, string>; displayName: string; contributorHandle: string; report: { checks: { id: string; label: string; status: string; detail: string }[]; score: number; outcome: string; reasons: string[] } | null; history: { at: string; status: string; note: string }[] }
type Tab = "queue" | "takedowns" | "problems" | "books" | "blocked" | "terms" | "audit";
const TABS: [Tab, string][] = [["queue", "Review queue"], ["takedowns", "Takedowns"], ["problems", "Problem reports"], ["books", "Contributed books"], ["blocked", "Blocked"], ["terms", "Word lists"], ["audit", "Audit log"]];

/** Moderation pages for contributed books. The switches and limits are the setting fields on the other contribution panels. */
export function ContribAdmin() {
  const [tab, setTab] = useState<Tab>("queue");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [canned, setCanned] = useState<Record<string, string>>({});
  useEffect(() => { call<{ stats: Record<string, number>; cannedReasons: Record<string, string> }>("GET", "/overview").then((o) => { setStats(o.stats); setCanned(o.cannedReasons); }, (e: Error) => setErr(e.message)); }, [msg]);
  const act = async (m: string, p: string, b: unknown, ok: string, after?: () => void) => { try { await call(m, p, b); setMsg(ok); setErr(""); after?.(); } catch (e) { setErr((e as Error).message); } };
  return (
    <section className="group contrib-admin" data-testid="contrib-admin">
      <h3>Contributions</h3>
      {stats && <p className="small">{Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
      <div className="tabs" role="tablist">{TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={`chip${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>{label}</button>)}</div>
      {tab === "queue" && <Queue canned={canned} act={act} />}
      {tab === "takedowns" && <Takedowns act={act} />}
      {tab === "problems" && <Problems act={act} />}
      {tab === "books" && <Books act={act} />}
      {tab === "blocked" && <Blocked act={act} />}
      {tab === "terms" && <Terms act={act} />}
      {tab === "audit" && <Audit />}
      <p className="actions"><a className="btn" href="/api/v1/admin/contrib/export" onClick={(e) => { e.preventDefault(); fetch("/api/v1/admin/contrib/export", { headers: { "x-admin-key": adminKey.get() } }).then((r) => r.blob()).then((b) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "contributions.csv"; a.click(); }); }}>Export CSV</a>{" "}
        <button type="button" className="btn" onClick={() => void act("POST", "/sweep", {}, "Sweep done: old rejected files deleted.")}>Run clean-up now</button></p>
      {msg && <p role="status">{msg}</p>}{err && <p className="error" role="alert">{err}</p>}
    </section>
  );
}
type Act = (m: string, p: string, b: unknown, ok: string, after?: () => void) => Promise<void>;

function Queue({ canned, act }: { canned: Record<string, string>; act: Act }) {
  const [status, setStatus] = useState("in_review");
  const [items, setItems] = useState<Row[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [open, setOpen] = useState<Detail | null>(null);
  const [reason, setReason] = useState("");
  const [cn, setCn] = useState("");
  const load = useCallback(() => { call<{ items: Row[] }>("GET", `/submissions?status=${status}`).then((r) => setItems(r.items), () => setItems([])); }, [status]);
  useEffect(load, [load]);
  const decide = (id: string, action: string) => act("POST", `/submissions/${id}/decision`, { action, reason, canned: cn }, `Done: ${action}.`, () => { setOpen(null); load(); });
  return (
    <div>
      <label>Show <select value={status} onChange={(e) => setStatus(e.target.value)}>{["in_review", "all", "checking", "published", "rejected", "changes_requested", "withdrawn", "failed"].map((s) => <option key={s}>{s}</option>)}</select></label>
      {sel.length > 0 && <p>{sel.length} selected: <button type="button" onClick={() => void act("POST", "/submissions/bulk", { ids: sel, action: "approve" }, "Approved.", () => { setSel([]); load(); })}>Approve</button> <button type="button" onClick={() => void act("POST", "/submissions/bulk", { ids: sel, action: "reject", reason }, "Rejected.", () => { setSel([]); load(); })}>Reject</button></p>}
      <table><thead><tr><th /><th>Title</th><th>By</th><th>Licence</th><th>Score</th><th>Outcome</th><th>Status</th><th /></tr></thead><tbody>
        {items.map((r) => <tr key={r.id}><td><input type="checkbox" aria-label={`Select ${r.title}`} checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} /></td><td>{r.title}</td><td>{r.author}</td><td>{r.licence}</td><td>{r.score ?? "–"}</td><td>{r.outcome ?? "–"}</td><td>{r.status}</td>
          <td><button type="button" onClick={() => void call<Detail>("GET", `/submissions/${r.id}`).then(setOpen)}>Open</button></td></tr>)}
      </tbody></table>
      {items.length === 0 && <p className="small">Nothing here.</p>}
      {open && (
        <div className="group" role="dialog" aria-label="Submission">
          <h4>{open.meta.title} <small>({open.id})</small></h4>
          <p className="small">By {open.displayName || "anonymous"} · licence {open.meta.licence}{open.meta.sourceUrl ? <> · source {open.meta.sourceUrl}</> : null}{open.meta.licenceProof ? <> · proof: {open.meta.licenceProof}</> : null}{open.sourceLink ? <> · link {open.sourceLink}</> : null}</p>
          {open.report && <><p>Score {open.report.score}/100, outcome {open.report.outcome}</p><ul>{open.report.checks.map((c) => <li key={c.id}>{c.status === "fail" ? "✖" : c.status === "warn" ? "⚠" : "✔"} {c.label}: {c.detail}</li>)}</ul></>}
          <p><a href={`/api/v1/admin/contrib/submissions/${open.id}/preview?page=1`} onClick={(e) => { e.preventDefault(); void fetch(`/api/v1/admin/contrib/submissions/${open.id}/preview?page=1`, { headers: { "x-admin-key": adminKey.get() } }).then((r) => r.json()).then((j: { text?: string }) => window.alert((j.text ?? "").slice(0, 1500))); }}>Preview page 1 text</a></p>
          <label>Reason (shown to the contributor) <input value={reason} onChange={(e) => setReason(e.target.value)} /></label>
          <label>Standard reason <select value={cn} onChange={(e) => setCn(e.target.value)}><option value="">–</option>{Object.entries(canned).map(([k, v]) => <option key={k} value={k}>{v.slice(0, 70)}</option>)}</select></label>
          <p className="actions"><button type="button" className="btn" onClick={() => void decide(open.id, "approve")}>Approve</button> <button type="button" className="btn" onClick={() => void decide(open.id, "changes")}>Ask for changes</button> <button type="button" className="btn" onClick={() => void decide(open.id, "reject")}>Reject</button> <button type="button" onClick={() => setOpen(null)}>Close</button></p>
          <label>Private note <input defaultValue={open.adminNote} onBlur={(e) => void act("PUT", `/submissions/${open.id}/note`, { note: e.target.value }, "Note saved.")} /></label>
          <button type="button" onClick={() => void act("POST", "/blocked", { submissionId: open.id, kind: "user", note: "blocked from review" }, "Contributor blocked.")}>Block this contributor</button>
        </div>
      )}
    </div>
  );
}
function useList<T>(path: string, dep: unknown) { const [items, set] = useState<T[]>([]); const [n, setN] = useState(0); useEffect(() => { call<{ items: T[] }>("GET", path).then((r) => set(r.items), () => set([])); }, [path, dep, n]); return [items, () => setN((x) => x + 1)] as const; }
function Takedowns({ act }: { act: Act }) {
  const [items, reload] = useList<{ id: string; bookId: string; at: string; name: string; email: string; relationship: string; message: string; status: string }>("/takedowns", 0);
  return <table><thead><tr><th>When</th><th>Book</th><th>From</th><th>Message</th><th>Status</th><th /></tr></thead><tbody>{items.map((t) => <tr key={t.id}><td>{t.at.slice(0, 10)}</td><td>{t.bookId}</td><td>{t.name} ({t.relationship}) {t.email}</td><td>{t.message}</td><td>{t.status}</td>
    <td>{t.status === "open" && <><button type="button" onClick={() => void act("POST", `/takedowns/${t.id}`, { decision: "upheld" }, "Upheld: book removed.", reload)}>Uphold</button> <button type="button" onClick={() => void act("POST", `/takedowns/${t.id}`, { decision: "dismissed" }, "Dismissed: book shown again.", reload)}>Dismiss</button></>}</td></tr>)}</tbody></table>;
}
function Problems({ act }: { act: Act }) {
  const [items, reload] = useList<{ id: string; bookId: string; at: string; kind: string; message: string; status: string }>("/problems", 0);
  return <table><thead><tr><th>When</th><th>Book</th><th>Kind</th><th>Message</th><th /></tr></thead><tbody>{items.map((p) => <tr key={p.id}><td>{p.at.slice(0, 10)}</td><td>{p.bookId}</td><td>{p.kind}</td><td>{p.message}</td><td>{p.status === "open" ? <button type="button" onClick={() => void act("POST", `/problems/${p.id}/done`, {}, "Marked done.", reload)}>Done</button> : "done"}</td></tr>)}</tbody></table>;
}
function Books({ act }: { act: Act }) {
  const [items, reload] = useList<{ id: string; title: string; hidden: boolean; addedAt: string; by: string }>("/books", 0);
  return <table><thead><tr><th>Title</th><th>By</th><th>Added</th><th /></tr></thead><tbody>{items.map((b) => <tr key={b.id}><td>{b.title}{b.hidden ? " (hidden)" : ""}</td><td>{b.by}</td><td>{String(b.addedAt).slice(0, 10)}</td><td><button type="button" onClick={() => void act("POST", `/books/${b.id}/${b.hidden ? "show" : "hide"}`, {}, b.hidden ? "Shown." : "Hidden.", reload)}>{b.hidden ? "Show" : "Hide"}</button></td></tr>)}</tbody></table>;
}
function Blocked({ act }: { act: Act }) {
  const [items, reload] = useList<{ key: string; kind: string; at: string; note: string }>("/blocked", 0);
  return <div><p className="small">Block a person from a submission in the review queue. Remove a block here.</p><ul>{items.map((b) => <li key={b.kind + b.key}>{b.kind} {b.key.slice(0, 10)}… {b.note} <button type="button" onClick={() => void act("DELETE", `/blocked/${b.kind}/${b.key}`, undefined, "Unblocked.", reload)}>Unblock</button></li>)}</ul></div>;
}
function Terms({ act }: { act: Act }) {
  const [t, setT] = useState<Record<string, string[]> | null>(null);
  useEffect(() => { call<Record<string, string[]>>("GET", "/terms").then(setT, () => setT(null)); }, []);
  if (!t) return <p className="small">Loading…</p>;
  return <div><p className="small">One word or phrase per line. Used by the copyright and unsafe-content checks. Edits apply to the next submission.</p>
    {Object.entries(t).map(([k, v]) => <label key={k}>{k}<textarea rows={4} defaultValue={v.join("\n")} onBlur={(e) => setT({ ...t, [k]: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} /></label>)}
    <button type="button" className="btn" onClick={() => void act("PUT", "/terms", t, "Word lists saved.")}>Save word lists</button></div>;
}
function Audit() {
  const [items] = useList<{ at: string; actor: string; action: string; target: string; note: string }>("/audit?limit=200", 0);
  return <table><thead><tr><th>When</th><th>Who</th><th>What</th><th>Target</th><th>Note</th></tr></thead><tbody>{items.map((a, i) => <tr key={i}><td>{a.at.slice(0, 16)}</td><td>{a.actor}</td><td>{a.action}</td><td>{a.target}</td><td>{a.note}</td></tr>)}</tbody></table>;
}
