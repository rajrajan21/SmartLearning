// Polite downloader: honours robots.txt, one request at a time per site with a pause, never tries to get past a challenge page.
export const UA = "SharpStudyBot/1.0 (+https://sharpstudy.in; free school question papers for students)";
const robotsCache = new Map();
const lastHit = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function parseRobots(txt, agent = "sharpstudybot") {
  const groups = []; let cur = null;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim(); if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/); if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "user-agent") { if (!cur || cur.rules.length) { cur = { agents: [], rules: [], delay: 0 }; groups.push(cur); } cur.agents.push(v.toLowerCase()); }
    else if (cur && (k === "allow" || k === "disallow")) cur.rules.push({ allow: k === "allow", path: v });
    else if (cur && k === "crawl-delay") cur.delay = Number(v) || 0;
  }
  const g = groups.find((x) => x.agents.some((a) => a !== "*" && agent.includes(a))) ?? groups.find((x) => x.agents.includes("*")) ?? { rules: [], delay: 0 };
  return {
    delay: g.delay,
    allowed(path) {
      let best = null;
      for (const r of g.rules) {
        if (!r.path) continue;
        const re = new RegExp("^" + r.path.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
        if (re.test(path) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
      }
      return !best || best.allow;
    },
  };
}

export async function robotsFor(origin, fetchImpl = fetch) {
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  let r = { delay: 0, allowed: () => true, found: false };
  try {
    const res = await fetchImpl(origin + "/robots.txt", { headers: { "user-agent": UA }, signal: AbortSignal.timeout(15000) });
    if (res.ok && /text|plain/i.test(res.headers.get("content-type") ?? "text/plain")) r = { ...parseRobots(await res.text()), found: true };
  } catch { /* no robots.txt reachable: treated as allowed, but the download itself may still fail */ }
  robotsCache.set(origin, r);
  return r;
}

const CHALLENGE = /just a moment|captcha|cf-chl|attention required|access denied|verify you are (a )?human|enable javascript and cookies/i;

/** @returns {{ok:boolean,status:number,buf?:Buffer,type?:string,blocked?:"robots"|"challenge"|"http"|"network",error?:string}} */
export async function get(url, { pauseMs = 6000, maxBytes = 25 * 1024 * 1024, fetchImpl = fetch, accept } = {}) {
  const u = new URL(url);
  const robots = await robotsFor(u.origin, fetchImpl);
  if (!robots.allowed(u.pathname + u.search)) return { ok: false, status: 0, blocked: "robots", error: "robots.txt does not allow " + u.pathname };
  const wait = Math.max(pauseMs, (robots.delay ?? 0) * 1000) - (Date.now() - (lastHit.get(u.host) ?? 0));
  if (wait > 0) await sleep(wait);
  lastHit.set(u.host, Date.now());
  try {
    const res = await fetchImpl(url, { headers: { "user-agent": UA, accept: accept ?? "text/html,application/pdf,*/*;q=0.8" }, redirect: "follow", signal: AbortSignal.timeout(60000) });
    const type = res.headers.get("content-type") ?? "";
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > maxBytes) return { ok: false, status: res.status, blocked: "http", error: `file too large (${len} bytes)` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > maxBytes) return { ok: false, status: res.status, blocked: "http", error: "file too large" };
    if (!res.ok) {
      const head = buf.subarray(0, 4000).toString("utf8");
      const challenge = [403, 429, 503].includes(res.status) && (CHALLENGE.test(head) || res.headers.has("cf-ray") || res.headers.get("server") === "cloudflare");
      return { ok: false, status: res.status, type, blocked: challenge ? "challenge" : "http", error: `HTTP ${res.status}` };
    }
    if (/text\/html/i.test(type) && CHALLENGE.test(buf.subarray(0, 3000).toString("utf8")) && buf.length < 20000) return { ok: false, status: res.status, type, blocked: "challenge", error: "challenge page" };
    return { ok: true, status: res.status, buf, type };
  } catch (e) { return { ok: false, status: 0, blocked: "network", error: String(e?.message ?? e) }; }
}
export const isPdf = (buf) => buf && buf.length > 1000 && buf.subarray(0, 5).toString("latin1") === "%PDF-";

export function links(html, base) {
  const out = []; const seen = new Set();
  for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let href; try { href = new URL(m[1].replace(/&amp;/g, "&").trim(), base).href; } catch { continue; }
    if (seen.has(href)) continue; seen.add(href);
    out.push({ href, text: m[2].replace(/<[^>]+>/g, " ").replace(/&nbsp;|&amp;/g, " ").replace(/\s+/g, " ").trim() });
  }
  return out;
}
export const pageTitle = (html) => (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim();
