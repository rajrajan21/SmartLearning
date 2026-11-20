// Triggers one Social posting run on a SharpStudy site (the site does the work: builds pictures/reels, checks every safety gate, posts, records the ledger).
// Usage:  node tools/social/run.mjs [--site https://sharpstudy.in] [--live] [--preview] [--status]
//   default            = ask the site for its scheduled run ("auto": only if a slot is due, and only if every gate is open)
//   --preview          = build a preview only (never posts)
//   --live             = run now for real (still blocked unless: Social ON, Preview-only OFF, Approved ON, platform ON, keys saved, kill switch OFF)
// The admin sign-in is read from environment variables (never typed here, never saved by this tool):
//   SOCIAL_ADMIN_KEY (or ADMIN_KEY) and SOCIAL_ADMIN_USER (or ADMIN_USER_ID).
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const site = (val("--site", process.env.SOCIAL_SITE || "https://sharpstudy.in")).replace(/\/$/, "");
const key = process.env.SOCIAL_ADMIN_KEY || process.env.ADMIN_KEY || "";
const user = process.env.SOCIAL_ADMIN_USER || process.env.ADMIN_USER_ID || "";
const stamp = () => new Date().toISOString();
if (!key) { console.log(`${stamp()} STOPPED: no admin key. Set SOCIAL_ADMIN_KEY (and SOCIAL_ADMIN_USER) in Windows environment variables, then run again. The key is never stored by this tool.`); process.exit(2); }
const call = async (method, path, body) => {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20 * 60 * 1000);
  try {
    const res = await fetch(`${site}/api/v1/admin/social${path}`, { method, signal: ctl.signal, headers: { "x-admin-key": key, "x-admin-user": encodeURIComponent(user), ...(body ? { "content-type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${res.status} ${(data.error && data.error.message) || "request failed"}`);
    return data;
  } finally { clearTimeout(t); }
};
try {
  if (has("--status")) {
    const s = await call("GET", "/status"); console.log(JSON.stringify({ liveReady: s.liveReady, paused: s.paused, today: s.today, lessons: s.lessons, counts: s.counts }, null, 1));
  } else if (has("--preview")) {
    const r = await call("POST", "/preview", {}); console.log(`${stamp()} PREVIEW built: ${r.entries.length} posts (nothing published). Open Admin > Social: queue and history.`);
  } else {
    const r = await call("POST", "/run", { auto: !has("--live"), live: has("--live") });
    const run = r.run; console.log(`${stamp()} DONE mode=${run.mode} planned=${run.planned} posted=${run.posted} failed=${run.failed} held=${run.held}${run.note ? " note=" + run.note : ""}`);
  }
} catch (e) { console.log(`${stamp()} STOPPED: ${e.message}`); process.exit(1); }
