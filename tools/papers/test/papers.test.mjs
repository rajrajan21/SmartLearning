import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { applyKey, inferMeta, pairKey, parseKey, parsePaper, splitOptions } from "../lib/parse.mjs";
import { parseRobots } from "../lib/http.mjs";
import { crawlSite, ingest, isCollectionGrade, planCandidates } from "../lib/core.mjs";
import { pdfToText } from "../lib/pdf.mjs";
import { readIndex, savePaper, validate } from "../lib/store.mjs";
import { chapterMatcher } from "../lib/match.mjs";

const fx = (f) => join(dirname(fileURLToPath(import.meta.url)), "../fixtures", f);

test("options on one line and on separate lines", () => {
  assert.deepEqual(splitOptions("Pick one\n(a) red (b) green (c) blue (d) pink").options, ["red", "green", "blue", "pink"]);
  assert.deepEqual(splitOptions("Pick\n(A) one\n(B) two\ncontinued\n(C) three").options, ["one", "two continued", "three"]);
  assert.equal(splitOptions("What is (a) in algebra?").options.length, 0);
});

test("parse a paper: sections, MCQ, true/false, fill, marks; general instructions are not questions", async () => {
  const p = parsePaper(await pdfToText(readFileSync(fx("sample-paper.pdf"))));
  assert.equal(p.sections.length, 2);
  assert.equal(p.sections[0].questions.length, 4);
  assert.deepEqual(p.sections[0].questions.map((q) => q.type), ["mcq", "mcq", "tf", "fill"]);
  assert.equal(p.sections[0].questions[1].options.length, 4);
  assert.equal(p.sections[1].questions[1].text.includes("name the gas formed"), true);
  assert.equal(p.sections[1].questions[0].marks, 3);
  assert.equal(p.meta.maxMarks, 40); assert.equal(p.meta.minutes, 180);
  assert.equal(JSON.stringify(p).includes("SAMPLE SCHOOL BOARD"), false);
});

test("marking scheme gives letters and model answers", async () => {
  const p = parsePaper(await pdfToText(readFileSync(fx("sample-paper.pdf"))));
  const k = parseKey(await pdfToText(readFileSync(fx("sample-marking-scheme.pdf"))));
  assert.ok(applyKey(p, k) >= 7);
  const q = p.sections[0].questions;
  assert.deepEqual([q[0].answer, q[1].answer, q[2].answer], ["B", "C", "A"]);
  assert.match(p.sections[1].questions[1].model, /Zn/);
});

test("file names: class, subject, year, kind, key pairing", () => {
  assert.deepEqual(inferMeta("Class X Science sample paper 2025-26 SQP"), { cls: 10, subject: "Science", year: "2025-26", kind: "sample" });
  assert.equal(inferMeta("12th Mathematics Previous Year 2024.pdf").cls, 12);
  assert.equal(pairKey("Science-SQP-MS.pdf") === pairKey("Science-SQP.pdf"), true);
});

test("robots.txt rules, longest match wins", () => {
  const r = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/ok\nCrawl-delay: 4");
  assert.equal(r.allowed("/a"), true); assert.equal(r.allowed("/private/x"), false); assert.equal(r.allowed("/private/ok/x"), true); assert.equal(r.delay, 4);
  assert.equal(parseRobots("User-agent: *\nDisallow: /").allowed("/x"), false);
});

test("validation rejects a broken paper; storage dedupes", () => {
  assert.ok(validate({ v: 1, id: "x" }).length > 0);
});

test("end to end: crawl listing -> pair marking scheme -> parse -> store -> dedupe (offline)", async () => {
  const dir = mkdtempSync(join(tmpdir(), "papers-test-"));
  try {
    const html = `<html><title>Sample Papers 2025-26</title><a href="/files/Class-X-Science-SQP-2025-26.pdf">Science (Class X)</a> <a href="/files/Class-X-Science-SQP-2025-26-MS.pdf">Science Marking Scheme</a> <a href="https://other.example/x">Previous Year Question Papers</a></html>`;
    const fetcher = async (u) => u.endsWith("-MS.pdf") ? { ok: true, buf: readFileSync(fx("sample-marking-scheme.pdf")), type: "application/pdf" } : u.endsWith(".pdf") ? { ok: true, buf: readFileSync(fx("sample-paper.pdf")), type: "application/pdf" } : { ok: true, buf: Buffer.from(html), type: "text/html" };
    const site = { id: "t", name: "Test Board", board: "cbse", entries: ["https://t.example/sqp.html"], follow: "sqp", depth: 1, license: "free" };
    const c = await crawlSite(site, { fetcher });
    assert.equal(c.candidates.length, 2); assert.equal(c.outbound[0].host, "other.example");
    const plan = planCandidates(c.candidates, site, { classes: [10] });
    assert.equal(plan.length, 1); assert.ok(plan[0].key.endsWith("-MS.pdf")); assert.equal(plan[0].meta.cls, 10);
    const curr = [{ board: "cbse", cls: 10, subject: "Science", chapters: [{ name: "Life Processes", words: new Set(["life", "process", "photosynthesi", "respiration", "plant"]), title: new Set(["life", "process"]) }, { name: "Electricity", words: new Set(["electric", "current", "ampere", "volt"]), title: new Set(["electricity"]) }] }];
    const r = await ingest(plan[0], site, { fetcher, matcherFor: (cl, s) => chapterMatcher(curr, cl, s), dir });
    assert.equal(r.result, "saved");
    const idx = readIndex(dir); assert.equal(idx.papers.length, 1); assert.equal(idx.papers[0].questions, 7); assert.equal(idx.papers[0].mcq, 3);
    const file = readdirSync(dir).find((f) => f.endsWith(".json.gz"));
    const paper = JSON.parse(gunzipSync(readFileSync(join(dir, file))).toString());
    assert.equal(paper.source.site, "Test Board"); assert.equal(paper.sections[0].questions[0].answer, "B");
    assert.ok(paper.sections[0].questions.some((q) => q.chapter) || paper.sections[1].questions.some((q) => q.chapter), "at least one question matched a chapter");
    assert.ok(readFileSync(join(dir, file)).length < 2500, "stored paper is tiny");
    assert.equal((await ingest(plan[0], site, { fetcher, matcherFor: () => () => undefined, dir })).result, "duplicate");
    assert.equal(savePaper(paper, dir), "duplicate");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("a scanned or unreadable PDF is skipped, not stored", async () => {
  const dir = mkdtempSync(join(tmpdir(), "papers-test-"));
  try {
    const r = await ingest({ url: "https://t.example/a.pdf", name: "a.pdf", meta: { cls: 10, subject: "Science", kind: "sample" }, key: null }, { name: "T", board: "cbse" }, { fetcher: null, matcherFor: null, dir, text: { text: "just a title and a diagram" } });
    assert.equal(r.result, "skipped"); assert.equal(readdirSync(dir).length, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

import { driveDirect } from "../lib/core.mjs";
test("public Google Drive file links become direct downloads; folders, shorteners and chat links are ignored", async () => {
  assert.equal(driveDirect("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view?usp=sharing"), "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUv");
  assert.equal(driveDirect("https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQrStUv"), "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUv");
  assert.equal(driveDirect("https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUv"), null);
  assert.equal(driveDirect("https://example.com/file/d/1AbCdEfGhIjKlMnOpQrStUv"), null);
  const html = `<title>Papers</title><a href="https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view">10th Science Quarterly 2024 English Medium</a><a href="https://bit.ly/xyz">10th Maths</a><a href="https://t.me/group">join</a><a href="/a/b.pdf">8th Maths Half Yearly</a>`;
  const c = await crawlSite({ entries: ["https://blog.example/p"], depth: 0 }, { fetcher: async () => ({ ok: true, buf: Buffer.from(html), type: "text/html" }) });
  assert.deepEqual(c.candidates.map((x) => x.url).sort(), ["https://blog.example/a/b.pdf", "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUv"]);
  assert.equal(c.candidates.find((x) => x.drive).pageUrl, "https://blog.example/p");
});
test("term and year are read from the title; a Drive sign-in page is skipped, not bypassed", async () => {
  assert.equal(inferMeta("10th Science Quarterly Exam 2024-25 English Medium").term, "quarterly");
  assert.equal(inferMeta("Class 9 Maths Half Yearly 2023").term, "half-yearly");
  assert.equal(inferMeta("Class 12 Chemistry Pre-Board 2026").term, "pre-board");
  const r = await ingest({ url: "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUv", pageUrl: "https://blog.example/p", drive: true, name: "x", meta: { cls: 10, subject: "Science", kind: "test" }, key: null }, { name: "T", board: "stateboard" }, { fetcher: async () => ({ ok: true, buf: Buffer.from("<html>" + " ".repeat(1200) + "<a href='https://accounts.google.com/ServiceLogin'>Sign in</a></html>"), type: "text/html" }), matcherFor: null, dir: mkdtempSync(join(tmpdir(), "pp-")) });
  assert.equal(r.result, "skipped"); assert.match(r.detail, /never bypassed/);
});

test("scheduled collection limits new papers to Grades 3–10", () => {
  const candidates = [2, 3, 10, 11, 12].map((grade) => ({
    url: `https://example.test/Class-${grade}-Maths-Model-Paper.pdf`,
    text: `Class ${grade} Maths Model Paper`,
    page: "",
  }));
  const plan = planCandidates(candidates, {}, { classes: [2, 3, 10, 11, 12] });
  assert.deepEqual(plan.filter((item) => !item.skip).map((item) => item.meta.cls), [3, 10]);
  assert.deepEqual([2, 3, 10, 11, 12].filter(isCollectionGrade), [3, 10]);
});
