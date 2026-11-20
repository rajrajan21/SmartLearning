import { describe, expect, it } from "vitest";
import { checkUrl, FetchError, guardedLookup, isPrivateIp, parseDomains, robotsAllows, safeFetch } from "../src/modules/contrib/ssrf.js";

const rules = { httpsOnly: true, allowDomains: [], denyDomains: ["scribd.com"] };
const pdf = Buffer.from("%PDF-1.4\n" + "x".repeat(200));
const opt = (transport: never, over = {}) => ({ rules, maxBytes: 1000, timeoutMs: 5000, maxRedirects: 3, respectRobots: false, lookup: (() => {}) as never, transport, ...over });
const ok = (body: Buffer = pdf, headers: Record<string, string> = { "content-type": "application/pdf" }) => ({ status: 200, headers, body });

describe("address rules", () => {
  it("blocks private, loopback, link-local, metadata and mapped addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fc00::1", "fd12::1", "::ffff:127.0.0.1", "::ffff:7f00:1", "224.0.0.1"]) expect(isPrivateIp(ip), ip).toBe(true);
    for (const ip of ["8.8.8.8", "93.184.216.34", "172.32.0.1", "2606:4700:4700::1111"]) expect(isPrivateIp(ip), ip).toBe(false);
  });
  it("checkUrl refuses odd schemes, credentials, ports, local names, number tricks and listed sites", () => {
    for (const u of ["ftp://a.com/x.pdf", "file:///etc/passwd", "https://user:pw@a.com/x", "https://a.com:8443/x", "https://localhost/x", "https://intranet/x", "https://printer.local/x", "https://127.0.0.1/x", "https://[::1]/x", "https://2130706433/x", "https://0x7f.1/x", "http://a.com/x.pdf", "https://www.scribd.com/doc/1", "not a url"]) expect(() => checkUrl(u, rules), u).toThrow(FetchError);
    expect(checkUrl("https://archive.org/download/x/x.pdf", rules).hostname).toBe("archive.org");
    expect(() => checkUrl("https://other.org/x.pdf", { ...rules, allowDomains: ["archive.org"] })).toThrow(/approved websites/);
    expect(checkUrl("https://sub.archive.org/x.pdf", { ...rules, allowDomains: ["archive.org"] })).toBeTruthy();
    expect(checkUrl("http://a.com/x.pdf", { ...rules, httpsOnly: false })).toBeTruthy();
  });
  it("parses domain lists", () => { expect(parseDomains("A.com, *.b.org  c.in;")).toEqual(["a.com", "b.org", "c.in"]); });
  it("the connection lookup refuses a name that resolves to a private address, even if one answer is public", async () => {
    const lookup = guardedLookup(async () => [{ address: "93.184.216.34", family: 4 }, { address: "127.0.0.1", family: 4 }]);
    const err = await new Promise<NodeJS.ErrnoException | null>((res) => lookup("rebind.example", {}, (e) => res(e)));
    expect(err?.code).toBe("EBLOCKED");
    const good = guardedLookup(async () => [{ address: "93.184.216.34", family: 4 }]);
    const addr = await new Promise<unknown>((res) => good("a.example", {}, (_e, a) => res(a)));
    expect(addr).toBe("93.184.216.34");
  });
});

describe("safe download", () => {
  it("returns the PDF for an ordinary link", async () => {
    const r = await safeFetch("https://archive.org/a.pdf", opt((async () => ok()) as never));
    expect(r.buffer.equals(pdf)).toBe(true);
  });
  it("re-checks every redirect: a hop to a private address is refused", async () => {
    let n = 0;
    const t = (async () => (n++ === 0 ? { status: 302, headers: { location: "https://169.254.169.254/latest/meta-data" }, body: Buffer.alloc(0) } : ok())) as never;
    await expect(safeFetch("https://archive.org/a.pdf", opt(t))).rejects.toMatchObject({ code: "private_host" });
    const t2 = (async () => ({ status: 302, headers: { location: "http://archive.org/b.pdf" }, body: Buffer.alloc(0) })) as never;
    await expect(safeFetch("https://archive.org/a.pdf", opt(t2))).rejects.toMatchObject({ code: "insecure" });
  });
  it("stops after too many redirects", async () => {
    const t = (async () => ({ status: 302, headers: { location: "https://archive.org/loop.pdf" }, body: Buffer.alloc(0) })) as never;
    await expect(safeFetch("https://archive.org/a.pdf", opt(t, { maxRedirects: 2 }))).rejects.toMatchObject({ code: "redirects" });
  });
  it("refuses an HTML page, a non-PDF body and an error status", async () => {
    await expect(safeFetch("https://a.org/x", opt((async () => ok(Buffer.from("<html>"), { "content-type": "text/html" })) as never))).rejects.toMatchObject({ code: "not_pdf" });
    await expect(safeFetch("https://a.org/x", opt((async () => ok(Buffer.from("hello world"), { "content-type": "application/octet-stream" })) as never))).rejects.toMatchObject({ code: "not_pdf" });
    await expect(safeFetch("https://a.org/x", opt((async () => ({ status: 404, headers: {}, body: Buffer.alloc(0) })) as never))).rejects.toMatchObject({ code: "http" });
  });
  it("obeys robots.txt when asked, and ignores a missing one", async () => {
    const t = ((u: URL) => Promise.resolve(u.pathname === "/robots.txt" ? { status: 200, headers: {}, body: Buffer.from("User-agent: *\nDisallow: /private/\n") } : ok())) as never;
    await expect(safeFetch("https://a.org/private/x.pdf", opt(t, { respectRobots: true }))).rejects.toMatchObject({ code: "robots" });
    expect((await safeFetch("https://a.org/public/x.pdf", opt(t, { respectRobots: true }))).buffer.length).toBeGreaterThan(0);
    const none = ((u: URL) => Promise.resolve(u.pathname === "/robots.txt" ? { status: 404, headers: {}, body: Buffer.alloc(0) } : ok())) as never;
    expect((await safeFetch("https://a.org/x.pdf", opt(none, { respectRobots: true }))).buffer.length).toBeGreaterThan(0);
  });
  it("parses robots groups, allow overrides and wildcards", () => {
    const rb = "User-agent: googlebot\nDisallow: /\n\nUser-agent: *\nDisallow: /files/\nAllow: /files/open/\nDisallow: /*.zip$\n";
    expect(robotsAllows(rb, "/files/a.pdf")).toBe(false);
    expect(robotsAllows(rb, "/files/open/a.pdf")).toBe(true);
    expect(robotsAllows(rb, "/a.zip")).toBe(false);
    expect(robotsAllows(rb, "/a.pdf")).toBe(true);
    expect(robotsAllows("User-agent: sharpstudybot\nDisallow: /", "/a.pdf")).toBe(false);
  });
});
