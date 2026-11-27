import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, existsSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import express from "express";
import request from "supertest";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
vi.setConfig({ testTimeout: 240000 });
import { SETTINGS } from "@studysmart/shared";
import { buildCaption, captionProblem, dueSlot, loadCandidates, pickLessons, runTimes, bucketKey, eligible } from "./engine.js";
import { renderImage, renderReel, loadBoard, ffmpegAvailable } from "./render.js";
import { createSocialStore, type SocialStore } from "./store.js";
import { createSocialService } from "./service.js";
import { adminSocialRoutes, socialMediaRoute } from "./routes.js";
import type { LedgerEntry, SocialState } from "./types.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../../content");
const dirs = { lessonsDir: join(root, "lessons"), classroomDir: join(root, "classroom"), gkDir: join(root, "gk", "lessons") };
const defaults = () => Object.fromEntries(SETTINGS.map((d) => [d.key, d.default])) as Record<string, unknown>;
const empty = (): SocialState => ({ bucketUsed: {}, counter: 0, recent: [], slotsDone: [], consecutiveFailures: 0 });
const out = process.env.SOCIAL_TEST_OUT; // set to a folder to keep the sample pictures and reels for looking at

describe("social: everything is off by default", () => {
  it("every Social setting is admin-only and the gates start closed", () => {
    const s = SETTINGS.filter((d) => d.key.startsWith("social."));
    expect(s.length).toBeGreaterThan(40);
    expect(s.every((d) => d.public === false)).toBe(true);
    const v = defaults();
    expect(v["social.enabled"]).toBe(false); expect(v["social.approved"]).toBe(false); expect(v["social.dryRunOnly"]).toBe(true);
    expect(v["social.fb.enabled"]).toBe(false); expect(v["social.ig.enabled"]).toBe(false); expect(v["social.killswitch"]).toBe(false);
    expect(v["social.runsPerDay"]).toBe(4); expect(v["social.postsPerRun"]).toBe(5);
    expect(v["social.fb.format"]).toBe("reel"); expect(v["social.maxPostsPerDay"]).toBe(20);
  });
});

describe("social: schedule", () => {
  it("spreads 4 runs across the India-time window, honours exact times, and finds the due slot", () => {
    expect(runTimes(defaults())).toEqual(["07:00", "11:40", "16:20", "21:00"]);
    expect(runTimes({ ...defaults(), "social.runTimes": "20:00, 08:30,bad" })).toEqual(["08:30", "20:00"]);
    const s = defaults();
    const at = (h: number, m: number) => Date.UTC(2026, 10, 20, h, m) - 5.5 * 3600000; // 20 Nov 2026 h:m IST
    expect(dueSlot(at(6, 0), s, [])).toBeNull();
    expect(dueSlot(at(7, 5), s, [])).toBe("2026-11-20@07:00");
    expect(dueSlot(at(7, 5), s, ["2026-11-20@07:00"])).toBeNull();
    expect(dueSlot(at(12, 0), s, ["2026-11-20@07:00"])).toBe("2026-11-20@11:40");
    expect(dueSlot(at(11, 0), s, ["2026-11-20@07:00"])).toBeNull(); // 07:00 is more than 3 hours ago, 11:40 not yet
  });
});

describe("social: lessons, rotation and the never-posted ledger", () => {
  const cands = loadCandidates(dirs, defaults());
  it("reads the real lessons and finds the ones with a classroom picture", () => {
    expect(cands.length).toBeGreaterThan(100);
    expect(cands.some((c) => c.hasBoard)).toBe(true);
    expect(cands.every((c) => c.path.startsWith("/") && c.title)).toBe(true);
  });
  it("picks different classes and subjects, never the same one twice in a row, and never repeats a lesson across runs", () => {
    const s = defaults(); let state = empty(); const ledger: LedgerEntry[] = []; const seen = new Set<string>(); let prev: { cls: number; subject: string } | null = null;
    for (let run = 0; run < 12; run++) {
      const r = pickLessons({ candidates: cands, ledger, state, settings: s, count: 5, platforms: ["facebook"] });
      expect(r.picks.length).toBe(5); state = r.state;
      for (const c of r.picks) {
        expect(seen.has(c.id)).toBe(false); seen.add(c.id);
        if (prev) { expect(c.cls !== prev.cls || c.subject !== prev.subject).toBe(true); if (new Set(cands.map((x) => x.cls)).size > 1) expect(c.cls === prev.cls && c.subject === prev.subject).toBe(false); }
        prev = c;
        ledger.push({ rid: c.id, lessonId: c.id, platform: "facebook", status: "posted", board: c.board, cls: c.cls, subject: c.subject, title: c.title, createdAt: new Date().toISOString(), postedAt: new Date().toISOString(), caption: "", alt: "", attempts: 1 });
      }
    }
    // one run of 5 touches several different class/subject buckets
    const one = pickLessons({ candidates: cands, ledger: [], state: empty(), settings: s, count: 5, platforms: [] }).picks;
    expect(new Set(one.map(bucketKey)).size).toBe(5);
    expect(new Set(one.map((c) => c.cls)).size).toBeGreaterThan(1);
  });
  it("previews and held posts do not count as posted; failed lessons are only skipped when asked", () => {
    const c = cands[0]!; const base = { lessonId: c.id, platform: "facebook" as const, board: c.board, cls: c.cls, subject: c.subject, title: c.title, createdAt: "x", caption: "", alt: "", attempts: 1 };
    const l: LedgerEntry[] = [{ ...base, rid: "1", status: "preview" }, { ...base, rid: "2", status: "held" }];
    const r = pickLessons({ candidates: [c], ledger: l, state: empty(), settings: defaults(), count: 1, platforms: [] });
    expect(r.picks.length).toBe(1);
    const r2 = pickLessons({ candidates: [c], ledger: [{ ...base, rid: "3", status: "posted", postedAt: new Date().toISOString() }], state: empty(), settings: defaults(), count: 1, platforms: [] });
    expect(r2.picks.length).toBe(0); expect(r2.exhausted).toBe(true);
    const r3 = pickLessons({ candidates: [c], ledger: [{ ...base, rid: "3", status: "posted", postedAt: "2020-01-01T00:00:00Z" }], state: empty(), settings: { ...defaults(), "social.recycle.enabled": true, "social.recycle.afterDays": 30 }, count: 1, platforms: [] });
    expect(r3.picks.length).toBe(0);
  });
  it("applies include / exclude filters", () => {
    const c = cands.find((x) => x.cls === 5)!;
    expect(eligible(c, { ...defaults(), "social.include.classes": "3,4" })).toBe(false);
    expect(eligible(c, { ...defaults(), "social.include.classes": "5" })).toBe(true);
    expect(eligible(c, { ...defaults(), "social.exclude.subjects": c.subject })).toBe(false);
    expect(eligible(c, { ...defaults(), "social.exclude.lessons": c.id })).toBe(false);
  });
});

describe("social: captions are safe", () => {
  const c = loadCandidates(dirs, defaults()).find((x) => x.hasBoard)!;
  it("fills the template with the lesson, a tracked link to this site and hashtags", () => {
    const cap = buildCaption(c, defaults(), "facebook", "https://sharpstudy.in");
    expect(cap).toContain(c.title); expect(cap).toContain("https://sharpstudy.in/"); expect(cap).toContain("utm_source=facebook"); expect(cap).toContain("#SharpStudy");
    expect(cap).not.toMatch(/\{\w+\}/); expect(cap.length).toBeLessThanOrEqual(1800);
    expect(captionProblem(cap, defaults(), "https://sharpstudy.in")).toBe("");
    expect(buildCaption(c, defaults(), "instagram", "https://sharpstudy.in")).toContain("utm_source=instagram");
  });
  it("refuses links to other websites and blocked words", () => {
    expect(captionProblem("Great deal https://amazon.in/x?tag=abc", defaults(), "https://sharpstudy.in")).toContain("another website");
    expect(captionProblem("see www.example.com", defaults(), "https://sharpstudy.in")).toContain("another website");
    expect(captionProblem("Learn at https://www.sharpstudy.in/x", defaults(), "https://sharpstudy.in")).toBe("");
    expect(captionProblem("hello bad word", { ...defaults(), "social.caption.blockWords": "bad word" }, "https://sharpstudy.in")).toContain("blocked word");
  });
  it("keeps the link and hashtags when the caption is too long", () => {
    const cap = buildCaption(c, { ...defaults(), "social.caption.maxLength": 260 }, "facebook", "https://sharpstudy.in");
    expect(cap.length).toBeLessThanOrEqual(260); expect(cap).toContain("https://sharpstudy.in/"); expect(cap).toContain("#");
  });
});

describe("social: pictures and reels are drawn locally", () => {
  const cands = loadCandidates(dirs, defaults());
  const withBoard = cands.find((c) => c.id === "cbse-6-science-a-journey-through-states-of-water-the-water-cycle") ?? cands.find((c) => c.hasBoard)!;
  const plain = cands.find((c) => !c.hasBoard && c.cls === 5)!;
  let tmp: string; beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), "social-")); }); afterEach(() => rmSync(tmp, { recursive: true, force: true }));
  const keep = (name: string, buf: Buffer | string) => { if (!out) return; mkdirSync(out, { recursive: true }); typeof buf === "string" ? copyFileSync(buf, join(out, name)) : writeFileSync(join(out, name), buf); };
  it("draws a classroom picture and a lesson card as JPEG in the chosen size", () => {
    const board = loadBoard(dirs.classroomDir, withBoard.boardFile!)!; expect(board).not.toBeNull();
    const a = renderImage({ cand: withBoard, board, settings: defaults(), siteUrl: "https://sharpstudy.in" });
    const b = renderImage({ cand: plain, board: null, settings: defaults(), siteUrl: "https://sharpstudy.in" });
    for (const x of [a, b]) { expect(x[0]).toBe(0xff); expect(x[1]).toBe(0xd8); expect(x.length).toBeGreaterThan(20000); expect(x.length).toBeLessThan(600000); }
    keep("board-picture.jpg", a); keep("lesson-card.jpg", b);
    keep("card-wide-night.jpg", renderImage({ cand: plain, board: null, settings: { ...defaults(), "social.image.size": "1200x630", "social.image.theme": "night" }, siteUrl: "https://sharpstudy.in" }));
  });
  it("builds a 9:16 reel (silent when there is no audio) that is small", async () => {
    if (!(await ffmpegAvailable())) return;
    const board = loadBoard(dirs.classroomDir, withBoard.boardFile!)!;
    for (const [name, cand, b] of [["reel-board.mp4", withBoard, board], ["reel-card.mp4", plain, null]] as const) {
      const outFile = join(tmp, name);
      const r = await renderReel({ cand, board: b, settings: { ...defaults(), "social.reel.seconds": 20 }, siteUrl: "https://sharpstudy.in", out: outFile });
      expect(r.error).toBeUndefined(); expect(r.ok).toBe(true); expect(r.hasAudio).toBe(false);
      expect(statSync(outFile).size).toBeGreaterThan(10000); expect(statSync(outFile).size).toBeLessThan(12 * 1024 * 1024);
      const pr = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height,codec_name,duration,r_frame_rate,sample_rate,channels", "-of", "csv=p=0", outFile], { encoding: "utf8" });
      if (pr.status === 0) { expect(pr.stdout).toContain("1080,1920"); expect(pr.stdout).toContain("h264"); expect(pr.stdout).toContain("30/1"); expect(pr.stdout).toContain("48000"); }
      keep(name, outFile);
    }
  }, 120000);
  it("keeps matching recordings on their own slides and preserves the full reel duration", async () => {
    if (!(await ffmpegAvailable())) return;
    const tone = join(tmp, "voice-fixture.wav");
    expect(spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=1", tone]).status).toBe(0);
    const outFile = join(tmp, "voiced.mp4");
    const result = await renderReel({
      cand: withBoard, board: loadBoard(dirs.classroomDir, withBoard.boardFile!),
      settings: { ...defaults(), "social.reel.seconds": 12 }, siteUrl: "https://sharpstudy.in",
      out: outFile, audio: () => ({ file: tone, ms: 1000 }),
    });
    expect(result, result.error).toMatchObject({ ok: true, seconds: 12, hasAudio: true });
  }, 120000);
});

/* ---------- the service end to end, with a pretend Meta ---------- */
function setup(over: Record<string, unknown> = {}, withKeys = true) {
  const dir = mkdtempSync(join(tmpdir(), "social-svc-")); const store: SocialStore = createSocialStore(dir);
  if (withKeys) store.saveSecrets({ fbPageId: "123456789", fbPageToken: "TOKEN-SECRET-VALUE-xyz", igUserId: "987654321", appSecret: "APP-SECRET-VALUE" });
  const calls: { url: string; method: string; auth: string | null; phase?: string }[] = [];
  let failAll = false, uncertain = false;
  const fetchImpl = (async (url: string, init: RequestInit) => {
    const phase = init.body instanceof URLSearchParams ? init.body.get("upload_phase") ?? undefined : undefined;
    calls.push({ url: String(url), method: String(init.method), auth: new Headers(init.headers).get("authorization"), phase });
    if (failAll) return new Response(JSON.stringify({ error: { message: "Invalid OAuth access token TOKEN-SECRET-VALUE-xyz", code: 190 } }), { status: 400 });
    const u = String(url);
    if (u.includes("/video_reels")) {
      if (phase === "start") return Response.json({ video_id: "12342", upload_url: "https://rupload.facebook.com/video-upload/v27.0/12342" });
      if (uncertain) throw new Error("Connection closed after Meta received the request");
      return Response.json({ success: true });
    }
    if (u.startsWith("https://rupload.facebook.com/")) return Response.json({ success: true });
    if (u.includes("/photos")) return new Response(JSON.stringify({ id: "11", post_id: "123_" + calls.length }));
    if (u.includes("/media_publish")) return new Response(JSON.stringify({ id: "ig-m" + calls.length }));
    if (u.includes("/media?") || u.endsWith("/media")) return new Response(JSON.stringify({ id: "container" + calls.length }));
    if (u.includes("status_code")) return new Response(JSON.stringify({ status_code: "FINISHED" }));
    return new Response(JSON.stringify({ permalink: "https://www.instagram.com/reel/abc/", name: "SharpStudy", username: "sharpstudy" }));
  }) as unknown as typeof fetch;
  const settings = { ...defaults(), "social.enabled": true, "social.minSecondsBetweenPosts": 10, "social.fb.format": "photo", ...over };
  const svc = createSocialService({ store, dirs, settings: async () => settings, fetchImpl, sleep: async () => undefined, renderVideo: async ({ out }) => {
    writeFileSync(out, "fixture video", "utf8");
    return { ok: true, seconds: 30, bytes: 13, hasAudio: false };
  } });

  return { dir, store, svc, calls, settings, fail: () => { failAll = true; }, timeoutOnPublish: () => { uncertain = true; } };
}

describe("social service: nothing is published unless every gate is open", () => {
  const dirsToClean: string[] = []; afterEach(() => { while (dirsToClean.length) rmSync(dirsToClean.pop()!, { recursive: true, force: true }); });
  it("switched off: does nothing at all", async () => {
    const t = setup({ "social.enabled": false }); dirsToClean.push(t.dir);
    const r = await t.svc.run({ live: true }); expect(r.planned).toBe(0); expect(t.calls.length).toBe(0);
  });
  it("preview only (default): builds the posts, publishes nothing, even if asked to go live", async () => {
    const t = setup({ "social.fb.enabled": true }); dirsToClean.push(t.dir);
    const r = await t.svc.run({ live: true }); expect(r.mode).toBe("preview"); expect(r.planned).toBeGreaterThan(0); expect(t.calls.length).toBe(0);
    const h = t.svc.history(50); expect(h.length).toBeGreaterThan(0); expect(h.every((e) => e.status === "preview" || e.status === "held")).toBe(true);
    const fb = h.filter((e) => e.platform === "facebook"); expect(fb.length).toBe(5); expect(fb.every((e) => e.status === "preview" && e.image && existsSync(t.store.mediaPath(e.image!)) && e.alt && e.caption.includes("sharpstudy.in"))).toBe(true);
    expect(new Set(fb.map((e) => e.lessonId)).size).toBe(5);
    // a second preview replaces the first (no pile-up), still no posting
    await t.svc.run({ live: false }); expect(t.svc.history(100, "preview").filter((e) => e.platform === "facebook").length).toBe(5);
  });
  it("approved but kill switch on / not approved / platform off: nothing is published", async () => {
    for (const over of [{ "social.dryRunOnly": false, "social.approved": false, "social.fb.enabled": true }, { "social.dryRunOnly": false, "social.approved": true, "social.killswitch": true, "social.fb.enabled": true }, { "social.dryRunOnly": false, "social.approved": true }]) {
      const t = setup(over); dirsToClean.push(t.dir);
      const r = await t.svc.run({ live: true }); expect(r.mode === "preview" || r.posted === 0).toBe(true); expect(t.calls.length).toBe(0);
    }
  });
  it("no keys saved: Facebook is held, never attempted", async () => {
    const t = setup({ "social.dryRunOnly": false, "social.approved": true, "social.fb.enabled": true }, false); dirsToClean.push(t.dir);
    const r = await t.svc.run({ live: true }); expect(t.calls.length).toBe(0); expect(r.posted).toBe(0); expect(t.svc.history(20).every((e) => e.status === "held")).toBe(true);
  });
  it("the KILL file stops a live run", async () => {
    const t = setup({ "social.dryRunOnly": false, "social.approved": true, "social.fb.enabled": true }); dirsToClean.push(t.dir);
    writeFileSync(join(t.dir, "KILL"), "stop"); const r = await t.svc.run({ live: true }); expect(r.mode).toBe("preview"); expect(t.calls.length).toBe(0);
  });
});

describe("social service: live posting with a pretend Meta", () => {
  const dirsToClean: string[] = []; afterEach(() => { while (dirsToClean.length) rmSync(dirsToClean.pop()!, { recursive: true, force: true }); });
  const live = { "social.dryRunOnly": false, "social.approved": true, "social.fb.enabled": true };
  it("posts 5 different lessons to Facebook, remembers them, and the next run posts 5 new ones; the token is never stored", async () => {
    const t = setup(live); dirsToClean.push(t.dir);
    const r1 = await t.svc.run({ live: true }); expect(r1.mode).toBe("live"); expect(r1.posted).toBe(5);
    const posted1 = t.svc.history(50, "posted"); expect(posted1.length).toBe(5); expect(new Set(posted1.map((e) => bucketKey({ board: e.board, cls: e.cls, subject: e.subject }))).size).toBe(5);
    expect(t.calls.filter((c) => c.url.includes("/photos")).length).toBe(5);
    expect(t.calls.every((c) => c.auth === "Bearer TOKEN-SECRET-VALUE-xyz" && !c.url.includes("TOKEN-SECRET"))).toBe(true); // the token is in the header, never in the address
    expect(t.calls[0]!.url).toContain("appsecret_proof=");
    const r2 = await t.svc.run({ live: true }); expect(r2.posted).toBe(5);
    const all = t.svc.history(50, "posted"); expect(new Set(all.map((e) => e.lessonId)).size).toBe(10);
    const files = readdirSync(t.dir).filter((f) => f.endsWith(".json")); for (const f of files) { const txt = readFileSync(join(t.dir, f), "utf8"); if (f !== "secrets.json") { expect(txt).not.toContain("TOKEN-SECRET"); expect(txt).not.toContain("APP-SECRET"); } }
    if (process.platform !== "win32") expect(statSync(join(t.dir, "secrets.json")).mode & 0o077).toBe(0);
  });
  it("alternates platforms across a five-lesson reel batch and uses a separate Instagram token", async () => {
    const t = setup({ ...live, "social.fb.format": "reel", "social.ig.enabled": true }); dirsToClean.push(t.dir);
    t.store.saveSecrets({ igToken: "IG-TEST-TOKEN", fbPageToken: "FB-TEST-TOKEN" });
    const run = await t.svc.run({ live: true });
    expect(run).toMatchObject({ posted: 5, planned: 5 });
    const entries = t.svc.byRun(run.id);
    expect(entries.map((e) => e.platform)).toEqual(["facebook", "instagram", "facebook", "instagram", "facebook"]);
    expect(new Set(entries.map((e) => e.lessonId)).size).toBe(5);
    expect(new Set(entries.map((e) => e.cls)).size).toBe(5);
    expect(new Set(entries.map((e) => e.subject)).size).toBe(5);
    expect(t.calls.filter((c) => c.phase === "finish")).toHaveLength(3);
    expect(t.calls.filter((c) => c.url.startsWith("https://rupload.facebook.com/")).every((c) => c.auth === "OAuth FB-TEST-TOKEN")).toBe(true);
    expect(t.calls.filter((c) => c.url.includes("/987654321/")).every((c) => c.auth === "Bearer IG-TEST-TOKEN")).toBe(true);
  });
  it("holds uncertain deliveries across restarts, failed-post cleanup and retries", async () => {
    const t = setup({ ...live, "social.fb.format": "reel", "social.postsPerRun": 1 }); dirsToClean.push(t.dir);
    t.timeoutOnPublish();
    const first = await t.svc.run({ live: true });
    expect(first.held).toBe(1);
    const held = t.svc.byRun(first.id)[0]!;
    expect(held).toMatchObject({ status: "held", deliveryPending: true, remoteId: "12342" });
    t.svc.resetLedger("failed");
    await expect(t.svc.retry(held.rid)).rejects.toThrow("unconfirmed delivery");
    const again = await t.svc.run({ live: true });
    expect(t.svc.byRun(again.id)[0]!.lessonId).not.toBe(held.lessonId);
  });
  it("uses the existing water-cycle board in a targeted preview with publishing off", async () => {
    const t = setup({ "social.enabled": false }, false); dirsToClean.push(t.dir);
    const lessonId = "cbse-6-science-a-journey-through-states-of-water-the-water-cycle";
    const run = await t.svc.run({ live: false, lessonId });
    expect(t.svc.byRun(run.id)).toMatchObject([{ lessonId, status: "preview" }]);
    expect(t.calls).toHaveLength(0);
  });
  it("respects the daily limit and the posts-per-run setting", async () => {
    const t = setup({ ...live, "social.postsPerRun": 3, "social.maxPostsPerDay": 4 }); dirsToClean.push(t.dir);
    expect((await t.svc.run({ live: true })).posted).toBe(3); expect((await t.svc.run({ live: true })).posted).toBe(1); expect((await t.svc.run({ live: true })).posted).toBe(0);
  });
  it("Instagram needs the public address and a voice-over: otherwise the reel is held ('needs audio'), nothing is posted", async () => {
    const t = setup({ ...live, "social.fb.enabled": false, "social.ig.enabled": true, "social.reel.requireAudio": true, "social.postsPerRun": 2 }); dirsToClean.push(t.dir);
    const r = await t.svc.run({ live: true }); expect(r.posted).toBe(0);
    const h = t.svc.history(10); expect(h.length).toBe(2); expect(h.every((e) => e.status === "held" && (e.needsAudio === true || !!e.hold))).toBe(true);
    if (h[0]!.video) expect(h[0]!.hold).toContain("Needs audio");
    expect(t.calls.length).toBe(0);
  }, 120000);
  it("Instagram reel is published through container, status check and publish once audio is not required", async () => {
    const t = setup({ ...live, "social.fb.enabled": false, "social.ig.enabled": true, "social.postsPerRun": 1, "social.reel.requireAudio": false, "social.reel.seconds": 12 }); dirsToClean.push(t.dir);
    const r = await t.svc.run({ live: true });
    const failed = t.svc.history(1)[0];
    expect(r.posted, failed?.hold ?? failed?.error ?? r.note).toBe(1);
    const e = t.svc.history(5, "posted")[0]!; expect(e.platform).toBe("instagram"); expect(e.video).toMatch(/^[a-f0-9]{24}\.mp4$/); expect(e.needsAudio).toBe(true);
    const mediaCall = t.calls.find((c) => c.url.includes("/987654321/media") && c.method === "POST")!; expect(mediaCall).toBeTruthy();
    expect(t.calls.some((c) => c.url.includes("media_publish"))).toBe(true);
  }, 120000);
  it("pauses itself after repeated failures, never echoes the token in the error, and Resume re-opens it", async () => {
    const t = setup(live); dirsToClean.push(t.dir); t.fail();
    const r = await t.svc.run({ live: true }); expect(r.posted).toBe(0); expect(r.failed).toBe(3);
    const f = t.svc.history(20, "failed"); expect(f.length).toBe(3); expect(f.every((e) => !(e.error ?? "").includes("TOKEN-SECRET"))).toBe(true);
    expect(((await t.svc.status()) as { paused: string | null }).paused).toContain("Paused after 3");
    const before = t.calls.length; await t.svc.run({ live: true }); expect(t.calls.length).toBe(before); // paused: no further calls
    t.svc.resume(); expect(((await t.svc.status()) as { paused: string | null }).paused).toBeNull();
  });
  it("auto runs only when a time slot is due, once per slot", async () => {
    const dir = mkdtempSync(join(tmpdir(), "social-svc-")); dirsToClean.push(dir); const store = createSocialStore(dir);
    const settings = { ...defaults(), "social.enabled": true, "social.runTimes": "08:00", "social.jitterMinutes": 0 };
    let nowMs = Date.UTC(2026, 10, 20, 8, 5) - 5.5 * 3600000 - 3 * 3600000 * 0; const svc = createSocialService({ store, dirs, settings: async () => settings, now: () => nowMs, sleep: async () => undefined, renderVideo: async ({ out }) => {
      writeFileSync(out, "video fixture"); return { ok: true, seconds: 30, bytes: 13, hasAudio: false };
    } });
    nowMs = Date.UTC(2026, 10, 20, 2, 0); // 07:30 IST: not due
    expect((await svc.run({ auto: true })).note).toBe("No run is due now.");
    nowMs = Date.UTC(2026, 10, 20, 2, 45); // 08:15 IST: due
    const r = await svc.run({ auto: true }); expect(r.slot).toBe("2026-11-20@08:00"); expect(r.planned).toBeGreaterThan(0);
    expect((await svc.run({ auto: true })).note).toBe("No run is due now.");
  });
  it("clears drafts without purging previously published lessons", async () => {
    const t = setup(live); dirsToClean.push(t.dir);
    await t.svc.run({ live: true });
    await t.svc.run({ live: false });
    expect(t.svc.resetLedger("previews")).toBeGreaterThan(0);
    expect(t.svc.history(100, "preview")).toHaveLength(0);
    t.svc.resetLedger("failed");
    expect(t.svc.history(100, "posted")).toHaveLength(5);
  });
});

describe("social routes: keys are write-only and the admin is protected", () => {
  it("never returns a saved key, rejects bad ids, needs the admin key, and serves only random-named media", async () => {
    const dir = mkdtempSync(join(tmpdir(), "social-rt-")); const store = createSocialStore(dir);
    const svc = createSocialService({ store, dirs, settings: async () => ({ ...defaults(), "social.enabled": true }) });
    const app = express(); app.use(express.json()); app.use("/social-media", socialMediaRoute(store)); app.use("/api/v1/admin/social", adminSocialRoutes(svc, store, "ADMIN-KEY-1234567890-ABCDEFGH", undefined));
    const H = { "x-admin-key": "ADMIN-KEY-1234567890-ABCDEFGH" };
    expect((await request(app).get("/api/v1/admin/social/status")).status).toBe(401);
    expect((await request(app).put("/api/v1/admin/social/secrets").set(H).send({ fbPageId: "abc" })).status).toBe(400);
    expect((await request(app).put("/api/v1/admin/social/secrets").set(H).send({ nonsense: "1" })).status).toBe(400);
    const put = await request(app).put("/api/v1/admin/social/secrets").set(H).send({ fbPageId: "123456789", fbPageToken: "SUPER-SECRET-TOKEN" });
    expect(put.status).toBe(200); expect(put.body.saved.fbPageToken).toBe(true); expect(JSON.stringify(put.body)).not.toContain("SUPER-SECRET");
    const get = await request(app).get("/api/v1/admin/social/secrets").set(H); expect(JSON.stringify(get.body)).not.toContain("SUPER-SECRET"); expect(JSON.stringify(get.body)).not.toContain("123456789");
    const st = await request(app).get("/api/v1/admin/social/status").set(H); expect(st.status).toBe(200); expect(JSON.stringify(st.body)).not.toContain("SUPER-SECRET");
    expect((await request(app).post("/api/v1/admin/social/ledger/reset").set(H).send({ scope: "all" })).status).toBe(400); // needs confirm
    writeFileSync(store.mediaPath("aaaaaaaaaaaaaaaaaaaaaaaa.jpg"), Buffer.from([0xff, 0xd8, 0xff]));
    expect((await request(app).get("/social-media/aaaaaaaaaaaaaaaaaaaaaaaa.jpg")).status).toBe(200);
    expect((await request(app).get("/social-media/secrets.json")).status).toBe(404); expect((await request(app).get("/social-media/..%2Fsecrets.json")).status).toBe(404);
    expect(readdirSync(dir)).toContain("secrets.json"); rmSync(dir, { recursive: true, force: true });
  });
});
