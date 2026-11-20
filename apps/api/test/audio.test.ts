import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { buildAudio, readWav, wavToMp3, type Speak } from "../src/modules/audio/build.js";
import { audioKey, createAudioStore } from "../src/modules/audio/manifest.js";
import { createLessonService } from "../src/modules/lessons/service.js";
import { makeRepo } from "./helpers.js";

/** A real 16-bit mono WAV (a quiet tone) like the speech engine returns. */
function tone(ms: number, rate = 24000): Buffer {
  const n = Math.round((ms / 1000) * rate), pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) pcm.writeInt16LE(Math.round(Math.sin((i / rate) * 2 * Math.PI * 220) * 8000), i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
const calls: string[] = [];
const fakeSpeak: Speak = async (text) => { calls.push(text); return { audio: tone(900).toString("base64"), words: text.split(" "), wtimes: text.split(" ").map((_, i) => i * 200), wdurations: text.split(" ").map(() => 180) }; };

const lesson = (text = "Look at the corner of your book.") => ({
  board: "CBSE", classLevel: 3, subject: "maths", chapter: "toy-joy", topic: "counting-toys",
  lesson: { status: "published", title: { en: "T" }, blocks: [
    { id: "n", type: "teacher_narration", provenance: "original", teacher: "malar", sentences: [
      { id: "s1", text: { en: text, ta: "தமிழ் வரி" }, board: [{ op: "draw", shape: "rect", label: "book" }] },
      { id: "s2", text: { en: "Count four corners." } }] }] },
});
const setup = () => {
  const dir = mkdtempSync(join(tmpdir(), "ss-audio-")), lessons = join(dir, "lessons"), audio = join(dir, "audio");
  mkdirSync(lessons); mkdirSync(audio);
  writeFileSync(join(audio, "voices.json"), JSON.stringify({ malar: { en: { voice: "af_heart", speed: 1 } } }));
  return { dir, lessons, audio };
};

describe("audio encoding", () => {
  it("turns a WAV into a small MP3 with the right length", () => {
    const wav = tone(1500);
    expect(readWav(wav).sampleRate).toBe(24000);
    const { mp3, durationMs } = wavToMp3(wav);
    expect(durationMs).toBe(1500);
    expect(mp3.length).toBeGreaterThan(1000);
    expect(mp3.length).toBeLessThan(wav.length / 4);
    expect(mp3[0] === 0xff || mp3.toString("ascii", 0, 3) === "ID3").toBe(true); // MP3 frame sync or tag
  });
  it("rejects non-WAV input", () => expect(() => readWav(Buffer.from("nope"))).toThrow(/WAV/));
});

describe("audio build tool", () => {
  it("generates only what is missing, skips languages without a voice, and prunes unused files", async () => {
    const { lessons, audio } = setup();
    writeFileSync(join(lessons, "a.json"), JSON.stringify(lesson()));
    const first = await buildAudio({ lessonsDir: lessons, audioDir: audio, speak: fakeSpeak });
    expect(first).toMatchObject({ wanted: 2, generated: 2, reused: 0 });
    expect(first.skipped.some((s) => s.includes("no ta voice"))).toBe(true);
    const again = await buildAudio({ lessonsDir: lessons, audioDir: audio, speak: fakeSpeak });
    expect(again).toMatchObject({ generated: 0, reused: 2 });
    expect(calls.length).toBe(2);
    writeFileSync(join(lessons, "a.json"), JSON.stringify(lesson("A brand new sentence.")));
    const changed = await buildAudio({ lessonsDir: lessons, audioDir: audio, speak: fakeSpeak, prune: true });
    expect(changed).toMatchObject({ generated: 1, reused: 1, pruned: 1 });
    const m = JSON.parse(readFileSync(join(audio, "manifest.json"), "utf8"));
    expect(Object.keys(m.entries)).toHaveLength(2);
    const e = Object.values(m.entries as Record<string, { words: { w: string }[]; file: string }>)[0]!;
    expect(e.words.length).toBeGreaterThan(0);
    expect(existsSync(join(audio, "files", e.file))).toBe(true);
  });
  it("skips sentences too long for the speech engine instead of failing", async () => {
    const { lessons, audio } = setup();
    writeFileSync(join(lessons, "a.json"), JSON.stringify(lesson("x".repeat(500))));
    const r = await buildAudio({ lessonsDir: lessons, audioDir: audio, speak: fakeSpeak });
    expect(r.skipped.some((s) => s.includes("longer than 480"))).toBe(true);
  });
});

describe("serving recorded speech", () => {
  let app: ReturnType<typeof createApp>;
  const dirs = setup();
  beforeAll(async () => {
    writeFileSync(join(dirs.lessons, "a.json"), JSON.stringify(lesson()));
    await buildAudio({ lessonsDir: dirs.lessons, audioDir: dirs.audio, speak: fakeSpeak });
    const m = await makeRepo();
    const store = createAudioStore({ manifestPath: join(dirs.audio, "manifest.json"), voicesPath: join(dirs.audio, "voices.json"), phrasesPath: join(dirs.audio, "phrases.json"), filesDir: join(dirs.audio, "files") });
    const lessons = createLessonService(m.db, m.repo, store);
    await lessons.importLesson(lesson());
    app = createApp({ curriculum: m.repo, settings: m.settings, lessons, practice: m.practice, audio: store, adminKey: null });
  });
  it("adds audio to sentences that have a recording, per language", async () => {
    const res = await request(app).get("/api/v1/lessons/boards/CBSE/3/maths/toy-joy/counting-toys").expect(200);
    const [s1, s2] = res.body.blocks[0].sentences;
    expect(s1.audio.en.url).toMatch(/^\/api\/v1\/audio\/[a-f0-9]{16}\.mp3$/);
    expect(s1.audio.en.durationMs).toBe(900);
    expect(s1.audio.en.words.length).toBeGreaterThan(2);
    expect(s1.audio.ta).toBeUndefined(); // no Tamil voice yet
    expect(s2.audio.en).toBeTruthy();
  });
  it("streams the file with caching headers and supports range requests", async () => {
    const lesson = await request(app).get("/api/v1/lessons/boards/CBSE/3/maths/toy-joy/counting-toys");
    const url = lesson.body.blocks[0].sentences[0].audio.en.url as string;
    const full = await request(app).get(url).expect(200);
    expect(full.headers["content-type"]).toMatch(/audio\/mpeg/);
    expect(full.headers["cache-control"]).toMatch(/immutable/);
    await request(app).get(url).set("Range", "bytes=0-99").expect(206);
  });
  it("rejects bad file names and unknown files", async () => {
    await request(app).get("/api/v1/audio/..%2Fmanifest.json").expect(404);
    await request(app).get("/api/v1/audio/0000000000000000.mp3").expect(404);
  });
  it("keys depend on text, voice, speed and language", () => {
    const a = audioKey({ lang: "en", voice: "v", speed: 1, text: "Hi" });
    expect(audioKey({ lang: "en", voice: "v", speed: 1, text: "Hi" })).toBe(a);
    for (const other of [{ lang: "ta" as const, voice: "v", speed: 1, text: "Hi" }, { lang: "en" as const, voice: "w", speed: 1, text: "Hi" }, { lang: "en" as const, voice: "v", speed: 1.1, text: "Hi" }, { lang: "en" as const, voice: "v", speed: 1, text: "Hi!" }]) expect(audioKey(other)).not.toBe(a);
  });
});

describe("natural-sounding polish and full coverage", () => {
  it("trims silence, levels loudness and keeps clips short", async () => {
    const { polish } = await import("../src/modules/audio/build.js");
    const rate = 24000, quiet = new Int16Array(rate * 2);
    for (let i = rate * 0.5; i < rate * 1.5; i++) quiet[i] = Math.round(Math.sin(i / 20) * 1500);
    const p = polish(quiet, rate);
    expect(p.samples.length).toBeLessThan(quiet.length * 0.65); // leading/trailing silence removed
    expect(p.headTrimMs).toBeGreaterThan(300);
    const peak = Math.max(...Array.from(p.samples, Math.abs));
    expect(peak).toBeGreaterThan(1500 * 1.5); // quiet speech brought up
    expect(peak).toBeLessThanOrEqual(32768 * 0.9); // never clips
  });

  it("speaks question stems, explanations, why-wrong lines and phrases, once each", async () => {
    const { audio } = setup();
    const lessons = join(audio, "..", "lessons"), questions = join(audio, "..", "questions");
    mkdirSync(questions, { recursive: true });
    writeFileSync(join(audio, "..", "lessons", "x.json"), JSON.stringify(lesson()));
    writeFileSync(join(audio, "..", "questions", "q.json"), JSON.stringify({
      board: "CBSE", classLevel: 3, subject: "maths", chapter: "toy-joy", topic: "counting-toys",
      questions: [{ key: "a", type: "true_false", round: 1, status: "published", stem: { en: "A square has 4 corners." }, answer: true, explanation: { en: "Yes, four corners." }, provenance: "original" }],
    }));
    writeFileSync(join(audio, "phrases.json"), JSON.stringify({ praise: [{ text: { en: "Well done!" } }, { text: { en: "Well done!" } }] }));
    calls.length = 0;
    const r = await buildAudio({ lessonsDir: lessons, questionsDir: questions, audioDir: audio, speak: fakeSpeak, langs: ["en"] });
    expect(calls).toContain("Well done!");
    expect(calls.filter((c) => c === "Well done!")).toHaveLength(1); // duplicate phrase recorded once
    expect(calls.some((c) => c.includes("square has 4 corners"))).toBe(true);
    expect(r.generated).toBe(r.wanted);
  });
});

import { onlyJobs } from "../src/modules/audio/build.js";
describe("onlyJobs", () => {
  it("keeps one chapter, ignoring case, or everything when empty", () => {
    const jobs = [{ where: "cbse-6-science-magnets.json t1" }, { where: "cbse-6-maths-primes.json t1" }];
    expect(onlyJobs(jobs, "MAGNETS")).toHaveLength(1);
    expect(onlyJobs(jobs, "")).toHaveLength(2);
    expect(onlyJobs(jobs, undefined)).toHaveLength(2);
  });
});
