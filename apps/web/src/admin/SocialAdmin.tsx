import { useCallback, useEffect, useState } from "react";
import { adminKey, adminUser } from "./api";

interface Gate { id: string; label: string; open: boolean; why: string }
interface Entry { rid: string; lessonId: string; platform: string; status: string; board: string; cls: number; subject: string; title: string; createdAt: string; postedAt?: string; remoteId?: string; remoteUrl?: string; image?: string; video?: string; deliveryPending?: boolean; caption: string; alt: string; needsAudio?: boolean; hold?: string; error?: string; attempts: number }
interface Status {
  gates: Gate[]; liveReady: boolean; times: string[]; today: { date: string; posted: number; slotsDone: string[] }; paused: string | null;
  lessons: { total: number; withBoard: number; posted: number; left: number }; secrets: Record<string, boolean>; ffmpeg: boolean;
  runs: { id: string; at: string; mode: string; planned: number; posted: number; failed: number; held: number; note?: string }[];
  counts: Record<string, number>;
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/v1/admin/social${path}`, {
    method,
    headers: { "x-admin-key": adminKey.get(), "x-admin-user": encodeURIComponent(adminUser.get()), ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: { message?: string } }).error?.message ?? `Request failed (${res.status})`);
  return data as T;
}

const FIELDS: { key: string; label: string; secret: boolean; hint: string }[] = [
  { key: "fbPageId", label: "Facebook Page id", secret: false, hint: "Digits only. Page > About > Page transparency, or the Page's 'Page ID' in Meta Business Suite." },
  { key: "fbPageToken", label: "Facebook Page access token (long-lived)", secret: true, hint: "Never shown again after you save it." },
  { key: "igToken", label: "Instagram publishing token (optional)", secret: true, hint: "Supply a Graph API token for the linked professional account. Leave this blank to use the Facebook Page token." },
  { key: "igUserId", label: "Instagram Business account id", secret: false, hint: "Digits only. Comes from the Graph API Explorer (step 6 below)." },
  { key: "appId", label: "Meta app id", secret: false, hint: "Digits only. From the app's Settings > Basic page." },
  { key: "appSecret", label: "Meta app secret", secret: true, hint: "Never shown again after you save it." },
];

function Gates({ s }: { s: Status }) {
  return (
    <>
      <h3>Safety gates <small>{s.liveReady ? "(all open: live posting is possible)" : "(closed: nothing can be published)"}</small></h3>
      <ul className="social-gates">{s.gates.map((g) => <li key={g.id}><span aria-hidden="true">{g.open ? "✅" : "⛔"}</span> <b>{g.label}</b>{!g.open && <span className="small"> — {g.why}</span>}</li>)}</ul>
      {s.paused && <p className="error" role="alert">Posting is paused: {s.paused}</p>}
    </>
  );
}

const HELP = [
  "Open developers.facebook.com, log in with the Facebook account that owns the SharpStudy Page, and choose My Apps > Create App. Pick the 'Business' type and name it SharpStudy Posting.",
  "In the app, add the product 'Facebook Login for Business' (or 'Facebook Login') and keep the app in Development mode. Use an account with the required app and Page roles for testing. Check the app dashboard for any permission or App Review requirements before enabling live posting.",
  "Make sure the Instagram account is a Business or Creator account (Instagram app > Settings > Account type), and link it to the Facebook Page (Page > Settings > Linked accounts > Instagram).",
  "Open the Graph API Explorer (developers.facebook.com/tools/explorer). Choose your app, then 'Get User Access Token' and tick: pages_show_list, pages_read_engagement, pages_manage_posts, instagram_basic, instagram_content_publish, business_management. Generate it.",
  "Make the token long-lived: in the Access Token Debugger press 'Extend Access Token' (or exchange it with the app id and secret). Then call GET /me/accounts: the answer lists your Page with its id and a Page access token. Use that Page token here and verify its scopes and expiry before enabling posting.",
  "Call GET /{page-id}?fields=instagram_business_account: the 'id' inside is your Instagram Business account id.",
  "Paste the Facebook Page id, Page access token, Instagram id, app id and app secret in the boxes above and press Save. Then press 'Test connection'. Both should say connected.",
  "Instagram downloads each reel from the public address of this website, so the website must be reachable on the internet over https (the live server, not your PC). Check 'Public address of this website' above.",
  "Go to 'Social: switches and safety'. Keep 'Preview only' ticked first, press 'Build a preview' on the queue page, and look at the posts. When you are happy, untick 'Preview only', tick 'Approve live posting' and the platform you want. The kill switch stops everything at once.",
];

/** The Social admin pages' live parts. The settings themselves are the fields above. */
export function SocialAdmin({ mode }: { mode: "gates" | "accounts" | "queue" }) {
  const [s, setS] = useState<Status | null>(null);
  const [hist, setHist] = useState<Entry[]>([]);
  const [filter, setFilter] = useState("");
  const [previewLesson, setPreviewLesson] = useState("");
  const [err, setErr] = useState(""); const [msg, setMsg] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    call<Status>("GET", "/status").then((x) => { setS(x); setErr(""); }, (e: Error) => setErr(e.message));
    if (mode === "queue") call<{ entries: Entry[] }>("GET", `/history?limit=200${filter ? `&status=${filter}` : ""}`).then((x) => setHist(x.entries), () => undefined);
  }, [mode, filter]);
  useEffect(load, [load]);
  const act = async (fn: () => Promise<unknown>, ok: string) => { setBusy(true); setMsg(""); setErr(""); try { await fn(); if (ok) setMsg(ok); load(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };
  if (err && !s) return <p className="error" role="alert">{err}</p>;
  if (!s) return <p className="loading">Loading…</p>;
  return (
    <section className="group social-admin" data-testid={`social-admin-${mode}`}>
      {mode === "gates" && (
        <>
          <Gates s={s} />
          <h3>Today</h3>
          <p>{s.today.posted} posted today ({s.today.date}) · run times (India time): {s.times.length ? s.times.join(", ") : "none"} · runs done today: {s.today.slotsDone.length}</p>
          <p>Lessons that can be posted: {s.lessons.left} unposted of {s.lessons.total} ({s.lessons.withBoard} have a classroom picture/animation). Already posted: {s.lessons.posted}. Video tool (ffmpeg): {s.ffmpeg ? "found" : "NOT found: reels cannot be made until it is installed"}.</p>
          {s.paused && <p><button type="button" className="btn" disabled={busy} onClick={() => void act(() => call("POST", "/resume"), "Posting resumed.")}>Resume after the pause</button></p>}
        </>
      )}
      {mode === "accounts" && (
        <>
          <h3>Account ids and keys</h3>
          <p className="small">They are saved on the server only, never shown again, never logged and never put in git. Fill only the boxes you want to change. Blank fields keep existing values.</p>
          {FIELDS.map((f) => (
            <p key={f.key}>
              <label>{f.label}{" "}
                <input type={f.secret ? "password" : "text"} autoComplete="off" spellCheck={false} value={vals[f.key] ?? ""} placeholder={s.secrets[f.key] ? "saved (hidden)" : "not saved"} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
              </label>{" "}<span className="small">{s.secrets[f.key] ? "✅ saved" : "—"} {f.hint}</span>
            </p>
          ))}
          <p className="actions">
            <button type="button" className="btn" disabled={busy || Object.values(vals).every((v) => !v.trim())} onClick={() => void act(async () => { await call("PUT", "/secrets", Object.fromEntries(Object.entries(vals).filter(([, v]) => v.trim()))); setVals({}); }, "Saved.")}>Save</button>{" "}
            <button type="button" className="btn" disabled={busy} onClick={() => void act(async () => { const r = await call<{ facebook: string; instagram: string }>("POST", "/test-connection"); setMsg(`Facebook: ${r.facebook} · Instagram: ${r.instagram}`); }, "")}>Test connection</button>{" "}
            <button type="button" className="btn" disabled={busy} onClick={() => { if (window.confirm("Remove every saved Social key from the server?")) void act(() => call("DELETE", "/secrets"), "All saved keys removed."); }}>Remove all keys</button>
          </p>
          <h3>Step-by-step Meta set-up</h3>
          <ol className="social-help">{HELP.map((h, i) => <li key={i}>{h}</li>)}</ol>
          <p className="small">Nothing is posted by saving keys. Posting also needs every safety gate on 'Social: switches and safety' to be open.</p>
        </>
      )}
      {mode === "queue" && (
        <>
          <Gates s={s} />
          <p>Posts on record: {Object.entries(s.counts).map(([k, v]) => `${k} ${v}`).join(" · ") || "none yet"}.</p>
          <p className="actions">
            <label>Specific lesson ID (optional) <input value={previewLesson} onChange={(event) => setPreviewLesson(event.target.value)} placeholder="For example, gk-why-moon-changes-shape" /></label>{" "}
            <button type="button" className="btn" disabled={busy} onClick={() => void act(async () => {
              const result = await call<{ run: { note?: string; planned: number } }>("POST", "/preview", { lessonId: previewLesson.trim() || undefined });
              setMsg(result.run.note || `Built ${result.run.planned} previews.`);
            }, "")}>Build a preview</button>{" "}
            <button type="button" className="btn" disabled={busy || !s.liveReady} title={s.liveReady ? "" : "Open every safety gate first"} onClick={() => { if (window.confirm("Run now for real? This publishes posts to your Facebook Page / Instagram.")) void act(() => call("POST", "/run", { live: true }), "Run finished."); }}>Run now (live)</button>{" "}
            <label>Show <select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">all</option><option value="preview">previews</option><option value="posted">posted</option><option value="failed">failed</option><option value="held">held back</option></select></label>
          </p>
          {s.runs.length > 0 && <details><summary>Recent runs ({s.runs.length})</summary><ul>{s.runs.map((r) => <li key={r.id}>{r.at} · {r.mode} · planned {r.planned}, posted {r.posted}, failed {r.failed}, held {r.held}{r.note ? ` · ${r.note}` : ""}</li>)}</ul></details>}
          <h3>Posts ({hist.length})</h3>
          {hist.length === 0 ? <p className="small">Nothing yet. Press 'Build a preview'.</p> : (
            <table className="lib-table"><thead><tr><th>When</th><th>Where</th><th>Lesson</th><th>Status</th><th>Caption / note</th><th /></tr></thead>
              <tbody>{hist.map((e) => (
                <tr key={e.rid}>
                  <td>{new Date(e.postedAt ?? e.createdAt).toLocaleString()}</td><td>{e.platform}</td>
                  <td>{e.board.toUpperCase()} · Class {e.cls} · {e.subject}<br />{e.title}<br /><small>{e.lessonId}</small></td>
                  <td>{e.deliveryPending ? "Delivery unconfirmed" : e.status}{e.needsAudio ? " · captions only" : ""}{e.attempts > 1 ? ` · ${e.attempts} tries` : ""}</td>
                  <td><details><summary>{e.error ?? e.hold ?? "caption"}</summary><pre className="small">{e.caption}</pre><p className="small">Alt text: {e.alt}</p>{e.remoteUrl && <p><a href={e.remoteUrl} target="_blank" rel="noreferrer">View on {e.platform}</a></p>}
                    {e.deliveryPending && e.remoteId && <p>Meta reference {e.remoteId}</p>}
                    {e.video && e.status !== "posted" && <video controls preload="none" src={`/social-media/${e.video}`} width={180} aria-label={`Video preview for ${e.title}`} />}
                    {e.image && e.status !== "posted" && <img src={`/social-media/${e.image}`} alt={e.alt} width={180} loading="lazy" />}
                    </details></td>
                  <td>{!e.deliveryPending && (e.status === "failed" || e.status === "held") && <button type="button" className="btn" disabled={busy} onClick={() => void act(() => call("POST", `/retry/${e.rid}`), "Retry done.")}>Retry</button>}</td>
                </tr>
              ))}</tbody></table>
          )}
          <h3>Clear drafts and failed posts</h3>
          <p className="small">Published lessons and unconfirmed deliveries stay in the history to prevent duplicates.</p>
          <p className="actions">
            {(["previews", "failed"] as const).map((sc) => <span key={sc}><button type="button" className="btn" disabled={busy} onClick={() => { if (window.confirm(`Clear ${sc}?`)) void act(async () => { const r = await call<{ removed: number }>("POST", "/ledger/reset", { scope: sc, confirm: true }); setMsg(`Removed ${r.removed}.`); }, ""); }}>{sc === "previews" ? "Clear previews" : "Clear failed"}</button>{" "}</span>)}
          </p>
        </>
      )}
      {msg && <p role="status">{msg}</p>}
      {err && <p className="error" role="alert">{err}</p>}
    </section>
  );
}
