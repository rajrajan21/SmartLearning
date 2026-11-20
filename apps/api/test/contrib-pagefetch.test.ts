import { describe, expect, it } from "vitest";
import { extractDetails, fetchDetails, langCode, licenceId } from "../src/modules/contrib/pagefetch.js";

const rules = { httpsOnly: true, allowDomains: [], denyDomains: ["scribd.com"] };
const opt = (transport: never, over = {}) => ({ rules, maxBytes: 100_000, timeoutMs: 5000, maxRedirects: 3, respectRobots: false, lookup: (() => {}) as never, transport, ...over });
const page = (html: string, ct = "text/html; charset=utf-8") => ({ status: 200, headers: { "content-type": ct }, body: Buffer.from(html) });

const ld = `<html lang="en-GB"><head><title>The Tiny Seed | Story Weaver</title>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Book","name":"The Tiny Seed","author":[{"@type":"Person","name":"Asha Rao"}],"inLanguage":"ta","datePublished":"2019-05-01","publisher":{"@type":"Organization","name":"Pratham Books"},"license":"https://creativecommons.org/licenses/by/4.0/","image":"/img/seed.jpg","description":"A story for ages 4-6 about a seed."}</script>
<meta property="og:title" content="Other title"><meta property="og:site_name" content="Story Weaver">
<link rel="canonical" href="https://storyweaver.example/books/tiny-seed">
</head><body><a href="/files/tiny-seed.pdf">Download PDF</a><a href="https://scribd.com/doc/1.pdf">scribd</a><a href="/about">About</a></body></html>`;

describe("extractDetails", () => {
  it("prefers JSON-LD, maps language / licence, finds cover, suggestions and PDF links", () => {
    const d = extractDetails(ld, "https://storyweaver.example/books/tiny-seed?x=1", { rules });
    expect(d.fields).toMatchObject({ title: "The Tiny Seed", author: "Asha Rao", language: "ta", year: "2019", publisher: "Pratham Books", licence: "by", coverUrl: "https://storyweaver.example/img/seed.jpg", sourceUrl: "https://storyweaver.example/books/tiny-seed", classLevel: "Ages 4-6", subject: "Stories" });
    expect(d.confidence.title).toBe("high");
    expect(d.confidence.licence).toBe("medium");
    expect(d.fields.licenceProof).toContain("creativecommons.org/licenses/by/4.0");
    expect(d.pdfLinks.map((l) => l.url)).toEqual(["https://storyweaver.example/files/tiny-seed.pdf"]); // the blocked site is not offered
  });
  it("falls back to citation / OpenGraph / page title with lower confidence", () => {
    const d = extractDetails(`<html lang="hi"><head><title>Chhota Beej - Library X</title><meta name="citation_author" content="Meena K"><meta property="og:site_name" content="Library X"><meta name="citation_pdf_url" content="https://lib.example/p/1.pdf"></head><body><h1>Chhota Beej</h1></body></html>`, "https://lib.example/b/1", { rules });
    expect(d.fields).toMatchObject({ title: "Chhota Beej", author: "Meena K", language: "hi", publisher: "Library X" });
    expect(d.confidence.author).toBe("high"); expect(d.confidence.language).toBe("medium"); expect(d.confidence.title).toBe("low");
    expect(d.pdfLinks[0]?.url).toBe("https://lib.example/p/1.pdf");
  });
  it("does not guess an unsupported licence, and ignores broken JSON-LD", () => {
    const d = extractDetails(`<head><script type="application/ld+json">{oops</script><link rel="license" href="https://creativecommons.org/licenses/by-nd/4.0/"></head>`, "https://a.example/x", { rules });
    expect(d.fields.licence).toBeUndefined();
    expect(d.notes.join(" ")).toMatch(/No title/);
  });
  it("maps licence links and language names", () => {
    const all = ["pd", "cc0", "by", "by-sa", "by-nc", "by-nc-sa"];
    expect(licenceId("https://creativecommons.org/publicdomain/zero/1.0/", all)).toBe("cc0");
    expect(licenceId("https://creativecommons.org/licenses/by-nc-sa/3.0/", all)).toBe("by-nc-sa");
    expect(licenceId("https://creativecommons.org/licenses/by-nc-nd/4.0/", all)).toBeNull();
    expect(licenceId("This work is in the public domain", all)).toBe("pd");
    expect(langCode("Tamil", ["ta", "en"])).toBe("ta"); expect(langCode("en_US", ["en"])).toBe("en"); expect(langCode("fr", ["en"])).toBeNull();
  });
});

describe("fetchDetails", () => {
  it("reads a page, following a redirect that is checked again", async () => {
    const calls: string[] = [];
    const t = (async (u: URL) => { calls.push(u.toString()); return u.pathname === "/a" ? { status: 302, headers: { location: "/b" }, body: Buffer.alloc(0) } : page(ld); }) as never;
    const d = await fetchDetails("https://storyweaver.example/a", opt(t));
    expect(d.kind).toBe("page"); expect(d.fields.title).toBe("The Tiny Seed"); expect(calls).toEqual(["https://storyweaver.example/a", "https://storyweaver.example/b"]);
  });
  it("refuses private hosts, listed sites and redirects to them without any network call", async () => {
    const t = (async () => { throw new Error("must not be called"); }) as never;
    await expect(fetchDetails("https://127.0.0.1/x", opt(t))).rejects.toMatchObject({ code: "private_host" });
    await expect(fetchDetails("https://scribd.com/x", opt(t))).rejects.toMatchObject({ code: "denied_domain" });
    const redir = (async () => ({ status: 302, headers: { location: "https://10.0.0.5/admin" }, body: Buffer.alloc(0) })) as never;
    await expect(fetchDetails("https://a.example/x", opt(redir))).rejects.toMatchObject({ code: "private_host" });
  });
  it("obeys robots.txt and stops at non-pages", async () => {
    const robots = (async (u: URL) => (u.pathname === "/robots.txt" ? { status: 200, headers: {}, body: Buffer.from("User-agent: *\nDisallow: /private") } : page(ld))) as never;
    await expect(fetchDetails("https://a.example/private/x", opt(robots, { respectRobots: true }))).rejects.toMatchObject({ code: "robots" });
    expect((await fetchDetails("https://a.example/public", opt(robots, { respectRobots: true }))).fields.title).toBe("The Tiny Seed");
    await expect(fetchDetails("https://a.example/x", opt((async () => page("x", "image/png")) as never))).rejects.toMatchObject({ code: "not_page" });
  });
  it("a direct PDF link gives only a file-name hint and a note, without downloading it", async () => {
    const t = (async () => { throw new Error("no fetch"); }) as never;
    const d = await fetchDetails("https://a.example/files/the_tiny_seed.pdf", opt(t));
    expect(d).toMatchObject({ kind: "pdf", fields: { title: "The Tiny Seed" } }); expect(d.notes[0]).toMatch(/straight to a PDF/);
    const t2 = (async () => ({ status: 200, headers: { "content-type": "application/pdf" }, body: Buffer.from("%PDF-1.4") })) as never;
    expect((await fetchDetails("https://a.example/download?id=3", opt(t2))).kind).toBe("pdf");
  });
});
