import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";

/** Everything that can go wrong when fetching a link, with a message that is safe to show to the contributor. */
export class FetchError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

// ---------- address rules ----------
function v4ToNum(ip: string): number { return ip.split(".").reduce((a, b) => a * 256 + Number(b), 0); }
const V4_BLOCKS: [string, number][] = [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]];
/** True for any address that is not an ordinary public internet address. */
export function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const n = v4ToNum(ip);
    return V4_BLOCKS.some(([base, bits]) => { const size = 2 ** (32 - bits); const b = v4ToNum(base); return n >= b && n < b + size; });
  }
  if (v === 6) {
    const s = ip.toLowerCase().split("%")[0]!;
    if (s === "::" || s === "::1") return true;
    const mapped = s.match(/^(?:0{0,4}:){0,5}(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/) ?? s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped && isIP(mapped[1]!) === 4) return isPrivateIp(mapped[1]!);
    const hexMapped = s.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hexMapped) { const a = parseInt(hexMapped[1]!, 16), b = parseInt(hexMapped[2]!, 16); return isPrivateIp(`${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`); }
    const first = parseInt(s.split(":")[0] || "0", 16);
    if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link local
    if ((first & 0xff00) === 0xff00) return true; // multicast
    if (s.startsWith("2001:db8") || s.startsWith("64:ff9b") || s.startsWith("100::") || s.startsWith("2002:")) return true; // documentation, NAT64, discard, 6to4
    return false;
  }
  return true; // not an address at all: refuse
}

export interface LinkRules { httpsOnly: boolean; allowDomains: string[]; denyDomains: string[] }
export const parseDomains = (s: string): string[] => s.split(/[,;\s]+/).map((d) => d.trim().toLowerCase().replace(/^\*?\./, "")).filter((d) => /^[a-z0-9.-]+$/.test(d));
const matchesDomain = (host: string, list: string[]) => list.some((d) => host === d || host.endsWith("." + d));

/** Checks the shape of a link before any network call. Returns the parsed URL or throws FetchError. */
export function checkUrl(input: string, rules: LinkRules): URL {
  let u: URL;
  try { u = new URL(input.trim()); } catch { throw new FetchError("bad_url", "That does not look like a web link."); }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new FetchError("bad_scheme", "Only web links (https) are accepted.");
  if (rules.httpsOnly && u.protocol !== "https:") throw new FetchError("insecure", "Only secure (https) links are accepted.");
  if (u.username || u.password) throw new FetchError("credentials", "Links with a user name or password in them are not accepted.");
  if (u.port && !["80", "443"].includes(u.port)) throw new FetchError("port", "Links to unusual ports are not accepted.");
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan") || host.endsWith(".home") || !host.includes(".") && !isIP(host)) throw new FetchError("private_host", "That address is not on the public internet.");
  if (isIP(host) && isPrivateIp(host)) throw new FetchError("private_host", "That address is not on the public internet.");
  if (/^\d+$/.test(host.split(".").pop() ?? "") && !isIP(host)) throw new FetchError("private_host", "That address is not accepted."); // 0x7f.1, 2130706433 style
  if (matchesDomain(host, rules.denyDomains)) throw new FetchError("denied_domain", "Books from that website cannot be added here (it is on our blocked list).");
  if (rules.allowDomains.length && !matchesDomain(host, rules.allowDomains)) throw new FetchError("domain_not_allowed", "Only books from approved websites can be added by link. Please upload the PDF instead.");
  return u;
}

export type LookupFn = (host: string, opts: dns.LookupOptions, cb: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void) => void;
/** The lookup used for the real connection: it resolves, refuses private answers, and hands that exact address to the socket (so DNS cannot change between check and connect). */
export function guardedLookup(inner: (host: string) => Promise<dns.LookupAddress[]> = (h) => dns.promises.lookup(h, { all: true, verbatim: true })): LookupFn {
  return (host, opts, cb) => {
    inner(host).then((addrs) => {
      if (!addrs.length) return cb(Object.assign(new Error("no address"), { code: "ENOTFOUND" }) as NodeJS.ErrnoException, "", 4);
      const bad = addrs.find((a) => isPrivateIp(a.address));
      if (bad) return cb(Object.assign(new Error("blocked address"), { code: "EBLOCKED" }) as NodeJS.ErrnoException, "", 4);
      if (opts.all) return cb(null, addrs);
      cb(null, addrs[0]!.address, addrs[0]!.family);
    }, (e: NodeJS.ErrnoException) => cb(e, "", 4));
  };
}

export interface FetchOptions {
  rules: LinkRules;
  maxBytes: number;
  timeoutMs: number;
  maxRedirects: number;
  respectRobots: boolean;
  /** accepted content types; a server that says text/html is refused */
  accept?: RegExp;
  lookup?: LookupFn;
  userAgent?: string;
  /** test hook: replace the real network call */
  transport?: typeof httpGet;
}
export interface Fetched { buffer: Buffer; finalUrl: string; contentType: string }
const UA = "SharpStudyBot/1.0 (+https://sharpstudy.in/library/contribute)";

export interface RawResponse { status: number; headers: http.IncomingHttpHeaders; body: Buffer }
export function httpGet(u: URL, o: { maxBytes: number; deadline: number; lookup: LookupFn; ua: string; headOnly?: boolean; accept?: string }): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const mod = u.protocol === "https:" ? https : http;
    const left = o.deadline - Date.now();
    if (left <= 0) return reject(new FetchError("timeout", "The download took too long."));
    const req = mod.request(u, { method: "GET", lookup: o.lookup as never, headers: { "user-agent": o.ua, accept: o.accept ?? "application/pdf,*/*;q=0.1", "accept-encoding": "identity" }, timeout: Math.min(left, 15000) }, (res) => {
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400) { res.resume(); return resolve({ status, headers: res.headers, body: Buffer.alloc(0) }); }
      const declared = Number(res.headers["content-length"] ?? 0);
      if (declared > o.maxBytes) { req.destroy(); return reject(new FetchError("too_big", "That file is larger than the size limit.")); }
      const chunks: Buffer[] = []; let n = 0;
      const timer = setTimeout(() => { req.destroy(); reject(new FetchError("timeout", "The download took too long.")); }, Math.max(1, o.deadline - Date.now()));
      res.on("data", (c: Buffer) => { n += c.length; if (n > o.maxBytes) { clearTimeout(timer); req.destroy(); reject(new FetchError("too_big", "That file is larger than the size limit.")); } else chunks.push(c); });
      res.on("end", () => { clearTimeout(timer); resolve({ status, headers: res.headers, body: Buffer.concat(chunks) }); });
      res.on("error", () => { clearTimeout(timer); reject(new FetchError("network", "The download was interrupted.")); });
    });
    req.on("timeout", () => { req.destroy(); reject(new FetchError("timeout", "The website did not answer in time.")); });
    req.on("error", (e: NodeJS.ErrnoException) => {
      if (e instanceof FetchError) return reject(e);
      if (e.code === "EBLOCKED") return reject(new FetchError("private_host", "That address is not on the public internet."));
      if (e.code === "ENOTFOUND") return reject(new FetchError("dns", "We could not find that website."));
      reject(new FetchError("network", "We could not reach that website."));
    });
    req.end();
  });
}

/** Minimal robots.txt reading: does the `*` (or our own) group disallow this path? Allow wins when longer. */
export function robotsAllows(robots: string, path: string, ua = "sharpstudybot"): boolean {
  let applies = false, matched = false;
  const rules: { allow: boolean; p: string }[] = [];
  let groupHasAgent = false;
  for (const line of robots.split(/\r?\n/)) {
    const l = line.replace(/#.*/, "").trim();
    const m = l.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const k = m[1]!.toLowerCase(), v = m[2]!.trim();
    if (k === "user-agent") {
      if (!groupHasAgent) { applies = false; }
      groupHasAgent = true;
      const a = v.toLowerCase();
      if (a === "*" || ua.includes(a)) { applies = true; matched = true; }
    } else {
      groupHasAgent = false;
      if (applies && (k === "disallow" || k === "allow") && v) rules.push({ allow: k === "allow", p: v });
    }
  }
  if (!matched) return true;
  let best: { allow: boolean; len: number } | null = null;
  for (const r of rules) {
    const re = new RegExp("^" + r.p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
    if (re.test(path) && (!best || r.p.length > best.len || (r.p.length === best.len && r.allow))) best = { allow: r.allow, len: r.p.length };
  }
  return best ? best.allow : true;
}

/** Downloads a PDF from a public link with every protection: re-checks each redirect, validates the real connection address, caps size and time, reads robots.txt. */
export async function safeFetch(link: string, o: FetchOptions): Promise<Fetched> {
  const lookup = o.lookup ?? guardedLookup();
  const get = o.transport ?? httpGet;
  const ua = o.userAgent ?? UA;
  const deadline = Date.now() + o.timeoutMs;
  let u = checkUrl(link, o.rules);
  if (o.respectRobots) {
    try {
      const rb = await get(new URL("/robots.txt", u), { maxBytes: 200_000, deadline: Math.min(deadline, Date.now() + 8000), lookup, ua });
      if (rb.status === 200 && !robotsAllows(rb.body.toString("utf8"), u.pathname + u.search)) throw new FetchError("robots", "That website asks robots not to download this file, so we cannot fetch it. Please download it yourself and upload it, if its licence allows.");
    } catch (e) { if (e instanceof FetchError && e.code === "robots") throw e; /* no robots.txt or unreachable: carry on, the real fetch reports problems */ }
  }
  for (let hop = 0; hop <= o.maxRedirects; hop++) {
    const r = await get(u, { maxBytes: o.maxBytes, deadline, lookup, ua });
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.location;
      if (!loc) throw new FetchError("redirect", "The link redirected somewhere we cannot follow.");
      if (hop === o.maxRedirects) throw new FetchError("redirects", "The link redirected too many times.");
      u = checkUrl(new URL(loc, u).toString(), o.rules); // every hop is checked again
      continue;
    }
    if (r.status < 200 || r.status >= 300) throw new FetchError("http", `The website answered with an error (${r.status}).`);
    const ct = String(r.headers["content-type"] ?? "").toLowerCase().split(";")[0]!.trim();
    if (ct && !(o.accept ?? /^(application\/pdf|application\/x-pdf|application\/octet-stream|binary\/octet-stream)$/).test(ct)) throw new FetchError("not_pdf", "That link does not lead straight to a PDF file (it is a web page). Open the PDF, copy its direct link and try again.");
    if (r.body.subarray(0, 1024).indexOf("%PDF-") === -1) throw new FetchError("not_pdf", "That link did not give a PDF file.");
    return { buffer: r.body, finalUrl: u.toString(), contentType: ct };
  }
  throw new FetchError("redirects", "The link redirected too many times.");
}
