import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs tool, no types
import { ageBand, bookId, classifyLicence, langCode, licenceAllowed, parseRobots, robotsAllows } from "../../../tools/library/lib.mjs";
// @ts-expect-error plain .mjs tool
import { candidateFromMetadata, pickPdf } from "../../../tools/library/adapters/internet-archive.mjs";
// @ts-expect-error plain .mjs tool
import { candidateFromPage } from "../../../tools/library/adapters/wikimedia-commons.mjs";
// @ts-expect-error plain .mjs tool
import { applyCommands, runHarvest } from "../../../tools/library/harvest.mjs";
// @ts-expect-error plain .mjs tool
import { probeSite } from "../../../tools/library/discover.mjs";

describe("library tool: licences, ages, languages", () => {
  it("reads Creative Commons links and short names; no-derivatives is never allowed", () => {
    expect(classifyLicence("https://creativecommons.org/licenses/by/4.0/")).toMatchObject({ code: "by" });
    expect(classifyLicence("http://creativecommons.org/licenses/by-sa/3.0/")).toMatchObject({ code: "by-sa" });
    expect(classifyLicence("https://creativecommons.org/licenses/by-nc-sa/4.0/")).toMatchObject({ code: "by-nc-sa" });
    expect(classifyLicence("https://creativecommons.org/publicdomain/zero/1.0/")).toMatchObject({ code: "cc0" });
    expect(classifyLicence("https://creativecommons.org/publicdomain/mark/1.0/")).toMatchObject({ code: "pdm" });
    expect(classifyLicence("CC BY-SA 4.0")).toMatchObject({ code: "by-sa" });
    expect(classifyLicence("Public domain")).toMatchObject({ code: "pdm" });
    expect(classifyLicence("https://creativecommons.org/licenses/by-nd/4.0/")?.code).toBe("nd");
    expect(classifyLicence("All rights reserved")).toBeNull();
    expect(classifyLicence("")).toBeNull();
    const nd = classifyLicence("https://creativecommons.org/licenses/by-nc-nd/4.0/");
    expect(licenceAllowed(nd, "nd,by,by-nc")).toBe(false);
    expect(licenceAllowed(classifyLicence("CC BY 4.0"), "cc0,pdm,by,by-sa")).toBe(true);
    expect(licenceAllowed(classifyLicence("CC BY-NC 4.0"), "cc0,pdm,by,by-sa")).toBe(false);
    expect(licenceAllowed(null, "by")).toBe(false);
  });
  it("puts a book in an age range: the source's words first, then a page-count guess", () => {
    expect(ageBand({ subjects: ["Picture books", "animals"], pages: 300 })).toEqual({ band: "4-6", source: "source" });
    expect(ageBand({ subjects: ["Young adult fiction"] })).toEqual({ band: "13+", source: "source" });
    expect(ageBand({ title: "A lullaby board book" }).band).toBe("0-3");
    expect(ageBand({ subjects: ["stories"], pages: 20 })).toEqual({ band: "4-6", source: "guess" });
    expect(ageBand({ subjects: ["stories"], pages: 120 })).toEqual({ band: "10-12", source: "guess" });
    expect(ageBand({})).toEqual({ band: "7-9", source: "guess" });
  });
  it("maps language names and codes, and makes safe ids", () => {
    expect(langCode("eng")).toBe("en"); expect(langCode("Tamil")).toBe("ta"); expect(langCode(["hin"])).toBe("hi"); expect(langCode("xx-yy")).toBe("xx"); expect(langCode("???")).toBe("");
    expect(bookId("internet-archive", "The Brave Sparrow!/../x")).toMatch(/^[a-z0-9-]+$/);
    expect(bookId("a", "b").length).toBeLessThanOrEqual(120);
  });
  it("understands robots.txt for our bot", () => {
    const g = parseRobots("User-agent: *\nDisallow: /private/\nAllow: /private/ok\n\nUser-agent: SharpStudyLibraryBot\nDisallow: /nope\n");
    expect(robotsAllows(g, "/nope/x")).toBe(false);
    expect(robotsAllows(g, "/private/x")).toBe(true); // our own group has no rule for it
    const h = parseRobots("User-agent: *\nDisallow: /private/\nAllow: /private/ok\n");
    expect(robotsAllows(h, "/private/x")).toBe(false);
    expect(robotsAllows(h, "/private/ok")).toBe(true);
    expect(robotsAllows(h, "/books")).toBe(true);
  });
});

describe("library tool: what the two readers accept", () => {
  it("Internet Archive: needs a clear Creative Commons licence and a real PDF, skips lending and restricted items", () => {
    const good = { metadata: { title: "The Brave Sparrow", creator: ["A", "B"], licenseurl: "https://creativecommons.org/licenses/by/4.0/", language: "eng", subject: ["children", "animals"], collection: ["opensource"] }, files: [{ name: "x_meta.xml", format: "Metadata", size: "10" }, { name: "x.pdf", format: "Text PDF", size: "12345", source: "original" }, { name: "x_text.pdf", format: "Text PDF", size: "999" }] };
    expect(candidateFromMetadata("x", good)).toMatchObject({ sourceId: "x", title: "The Brave Sparrow", language: "en", bytes: 12345, licence: { code: "by" }, pdfUrl: "https://archive.org/download/x/x.pdf" });
    expect(candidateFromMetadata("x", { ...good, metadata: { ...good.metadata, licenseurl: "" } })).toEqual({ skip: "no-clear-licence" });
    expect(candidateFromMetadata("x", { ...good, files: [] })).toEqual({ skip: "no-pdf" });
    expect(candidateFromMetadata("x", { ...good, metadata: { ...good.metadata, "access-restricted-item": "true" } })).toEqual({ skip: "restricted" });
    expect(candidateFromMetadata("x", { ...good, metadata: { ...good.metadata, collection: ["inlibrary"] } })).toEqual({ skip: "lending-library" });
    expect(pickPdf([{ name: "a_text.pdf", format: "Text PDF", size: "5" }])).toBeNull();
  });
  it("Wikimedia Commons: PDF only, licence read from the file's own data", () => {
    const page = { pageid: 7, title: "File:Fairy tales.pdf", imageinfo: [{ mime: "application/pdf", url: "https://upload.wikimedia.org/x.pdf", size: 5000, descriptionurl: "https://commons.wikimedia.org/wiki/File:Fairy_tales.pdf", extmetadata: { LicenseShortName: { value: "CC BY-SA 4.0" }, LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0" }, Artist: { value: "<a href='x'>Jane</a>" }, ObjectName: { value: "Fairy tales" } } }] };
    expect(candidateFromPage(page)).toMatchObject({ sourceId: "7", title: "Fairy tales", authors: ["Jane"], licence: { code: "by-sa" }, bytes: 5000 });
    expect(candidateFromPage({ ...page, imageinfo: [{ ...page.imageinfo[0], mime: "image/png" }] })).toEqual({ skip: "not-pdf" });
    expect(candidateFromPage({ ...page, imageinfo: [{ ...page.imageinfo[0], extmetadata: {} }] })).toEqual({ skip: "no-clear-licence" });
  });
});

// ---- the whole run, with a fake site and no internet ----
const pdfBytes = (n: number) => Buffer.from(`%PDF-1.4\n1 0 obj<</Type/Pages/Count ${n}/Kids[]>>endobj\n${"x".repeat(2000 + n)}\n%%EOF\n`);
function setup(extra: Record<string, unknown> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "harv-"));
  const cfg = { enabled: true, perRun: 3, perSiteMax: 0, siteOrder: "fake,other", licences: "cc0,pdm,by,by-sa", languages: "en,ta", ageBands: "0-3,4-6,7-9,10-12,13+", onlyTags: "", skipTags: "", minPages: 4, maxPages: 400, disabledSites: "", pauseSeconds: 0, maxBookMB: 5, reopenDays: 7, retryBlockedHours: 12, maxGB: 5, serverMaxGB: 50, useServerCap: false, browserMode: false, libraryDir: join(dir, "files"), catalog: join(dir, "catalog.json"), commandsFile: join(dir, "files", "commands.json"), ...extra };
  return { dir, cfg, statePath: join(dir, "state.json") };
}
const lic = (code: string) => ({ code, name: code, url: "https://creativecommons.org/licenses/by/4.0/" });
const cand = (n: number, over: Record<string, unknown> = {}) => ({ sourceId: `b${n}`, title: `Story ${n}`, authors: ["W"], licence: lic("by"), language: "en", subjects: ["picture books"], description: "", pdfUrl: `https://fake.test/${n}.pdf`, sourceUrl: `https://fake.test/b${n}`, bytes: 3000, ...over });
const fakeFetch = (blockedUrls: string[] = []) => (async (url: string) => {
  if (blockedUrls.includes(url)) return new Response("no", { status: 403 });
  const n = Number(/(\d+)\.pdf/.exec(url)?.[1] ?? 1);
  return new Response(pdfBytes(n + 3), { status: 200, headers: { "content-type": "application/pdf" } });
}) as unknown as typeof fetch;
const adapterOf = (cands: unknown[]) => ({ id: "fake", async *candidates() { for (const c of cands) yield c; } });
const noTools = { gs: null, qpdf: null, pdftoppm: null };
const sites = [{ id: "fake", name: "Fake Books", status: "ready" }];

describe("library tool: a harvest run", () => {
  it("keeps only allowed books, stops at the per-run limit, then carries on next run", async () => {
    const { cfg, statePath } = setup();
    const cands = [cand(1), cand(2, { licence: lic("nd") }), cand(3, { licence: lic("by-nc") }), cand(4, { language: "fr" }), cand(5), cand(6, { bytes: 99_000_000 }), cand(7), cand(8), cand(9)];
    const adapters = { fake: { id: "fake", async *candidates({ cursor }: { cursor: { i?: number } }) { for (let i = cursor.i ?? 0; i < cands.length; i++) { cursor.i = i + 1; yield cands[i]; } } } };
    const r1 = await runHarvest({ cfg, sites, adapters, fetchImpl: fakeFetch(), tools: noTools, log: () => {}, pauseFn: async () => {}, statePath });
    expect(r1.added.map((b: { title: string }) => b.title)).toEqual(["Story 1", "Story 5", "Story 7"]);
    expect(r1.stoppedBecause).toMatch(/reached 3/);
    const cat = JSON.parse(readFileSync(cfg.catalog, "utf8"));
    expect(cat.books).toHaveLength(3);
    expect(cat.books[0]).toMatchObject({ id: "fake-b1", language: "en", ageBand: "4-6", ageSource: "source", licence: { code: "by" }, source: { site: "fake" } });
    expect(existsSync(join(cfg.libraryDir, "pdf", "fake-b1.pdf"))).toBe(true);
    const r2 = await runHarvest({ cfg, sites, adapters, fetchImpl: fakeFetch(), tools: noTools, log: () => {}, pauseFn: async () => {}, statePath });
    expect(r2.added.map((b: { title: string }) => b.title)).toEqual(["Story 8", "Story 9"]);
    expect(r2.sitesDone).toEqual(["fake"]);
    // a finished site rests; nothing is fetched again
    const r3 = await runHarvest({ cfg, sites, adapters, fetchImpl: fakeFetch(), tools: noTools, log: () => {}, pauseFn: async () => {}, statePath });
    expect(r3.added).toHaveLength(0);
    expect(JSON.parse(readFileSync(cfg.catalog, "utf8")).books).toHaveLength(5);
  });
  it("skips duplicates, wrong subjects and ages, odd page counts, and files that are not PDFs", async () => {
    const { cfg, statePath } = setup({ perRun: 20, skipTags: "horror", onlyTags: "", ageBands: "4-6" });
    const cands = [cand(1), cand(2, { pdfUrl: "https://fake.test/1.pdf" }) /* same bytes as 1 */, cand(3, { subjects: ["horror stories"] }), cand(4, { subjects: ["young adult"] }), cand(5, { pdfUrl: "https://fake.test/html.pdf" })];
    const f = (async (url: string) => (url.includes("html") ? new Response("<html>login</html>", { status: 200 }) : fakeFetch()(url))) as unknown as typeof fetch;
    const r = await runHarvest({ cfg, sites, adapters: { fake: adapterOf(cands) }, fetchImpl: f, tools: noTools, log: () => {}, pauseFn: async () => {}, statePath });
    expect(r.added.map((b: { title: string }) => b.title)).toEqual(["Story 1"]);
    expect(existsSync(join(cfg.libraryDir, "pdf", "fake-b4.pdf"))).toBe(false); // wrong age: removed again
    expect(existsSync(join(cfg.libraryDir, "pdf", "fake-b5.pdf"))).toBe(false);
  });
  it("stops at the space cap, respects the per-site limit and the blocklist, and moves on when blocked", async () => {
    const full = setup({ maxGB: 1 });
    mkdirSync(join(full.cfg.libraryDir, "pdf"), { recursive: true });
    const r0 = await runHarvest({ cfg: { ...full.cfg, maxGB: 0.000001 }, sites, adapters: { fake: adapterOf([cand(1)]) }, fetchImpl: fakeFetch(), tools: noTools, log: () => {}, pauseFn: async () => {}, statePath: full.statePath });
    expect(r0.added).toHaveLength(1); // room for the first (cap is checked before each book)
    const r00 = await runHarvest({ cfg: { ...full.cfg, maxGB: 0.000001 }, sites: [{ ...sites[0], id: "fake" }], adapters: { fake: adapterOf([cand(2)]) }, fetchImpl: fakeFetch(), tools: noTools, log: () => {}, pauseFn: async () => {}, statePath: full.statePath });
    expect(r00.stoppedBecause).toMatch(/space cap/);

    const lim = setup({ perSiteMax: 1, perRun: 5 });
    const two = [{ id: "fake", name: "A", status: "ready" }, { id: "other", name: "B", status: "ready" }];
    const r1 = await runHarvest({ cfg: lim.cfg, sites: two, adapters: { fake: adapterOf([cand(1), cand(2)]), other: { id: "other", async *candidates() { yield cand(3); yield cand(4); } } }, fetchImpl: fakeFetch(), tools: noTools, log: () => {}, pauseFn: async () => {}, statePath: lim.statePath });
    expect(r1.added.map((b: { site: string }) => b.site)).toEqual(["fake", "other"]);

    const blk = setup({ perRun: 5 });
    writeFileSync(join(blk.dir, "x"), "");
    const r2 = await runHarvest({ cfg: blk.cfg, sites: two, adapters: { fake: adapterOf([cand(1), cand(2)]), other: { id: "other", async *candidates() { yield cand(3); } } }, fetchImpl: fakeFetch(["https://fake.test/1.pdf"]), tools: noTools, log: () => {}, pauseFn: async () => {}, statePath: blk.statePath });
    expect(r2.blocked).toEqual(["fake"]);
    expect(r2.added.map((b: { site: string }) => b.site)).toEqual(["other"]);
    // a blocked site is left alone for a while
    const r3 = await runHarvest({ cfg: blk.cfg, sites: two, adapters: { fake: adapterOf([cand(2)]), other: { id: "other", async *candidates() { yield cand(3); } } }, fetchImpl: fakeFetch(), tools: noTools, log: () => {}, pauseFn: async () => {}, statePath: blk.statePath });
    expect(r3.blocked).toEqual(["fake"]);
  });
  it("Admin commands reset a site and are used once", () => {
    const { cfg } = setup();
    mkdirSync(cfg.libraryDir, { recursive: true });
    writeFileSync(cfg.commandsFile, JSON.stringify({ commands: [{ action: "reset-site", site: "fake" }, { action: "clear-skipped" }] }));
    const state = { sites: { fake: { cursor: { i: 9 }, skipped: { a: "x" }, added: 4, done: true } } };
    expect(applyCommands(cfg.commandsFile, state, () => {})).toBe(2);
    expect(state.sites.fake).toEqual({ cursor: {}, skipped: {}, added: 4 });
    expect(existsSync(cfg.commandsFile)).toBe(false);
    expect(applyCommands(cfg.commandsFile, state, () => {})).toBe(0);
  });
});

describe("library tool: site discovery check", () => {
  it("reads robots, licence wording and PDF links from a home page", async () => {
    const f = (async (url: string) => (url.endsWith("/robots.txt") ? new Response("User-agent: *\nDisallow: /admin\n") : new Response('<a href="/a.pdf">a</a><a href="https://creativecommons.org/licenses/by/4.0/">CC</a>'))) as unknown as typeof fetch;
    const p = await probeSite("https://books.example/", { fetchImpl: f });
    expect(p).toMatchObject({ reachable: true, robotsAllowsUs: true, licenceHints: ["by"], pdfLinks: 1 });
    const g = (async () => new Response("no", { status: 403 })) as unknown as typeof fetch;
    expect((await probeSite("https://blocked.example/", { fetchImpl: g })).blocked).toBe(true);
  });
});
