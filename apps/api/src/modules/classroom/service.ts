import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ClassroomIndex, ClassroomLesson, PublicClassroom } from "@studysmart/shared";
import type { AudioStore } from "../audio/manifest.js";
import { perf } from "../perf/config.js";
import { throttled } from "../perf/throttle.js";
import { composeAll, composeIncremental, emptyComposeCache, type ComposeCache } from "./compose-all.js";

export interface ClassroomService {
  index(): ClassroomIndex;
  get(board: string, classLevel: number, subject: string, chapter: string, topic: string, voice?: string): PublicClassroom | null;
  /** build everything now (called shortly after start so the first visitor does not wait) */
  warm?(): { lessons: number; ms: number; reused: number; built: number };
  /** forget what was built and build again from the files (Admin > Site and performance > rebuild) */
  rebuild?(): { lessons: number; ms: number };
  status?(): { lessons: number; builtAt: string | null; lastBuildMs: number; fromDiskCache: boolean; incremental: boolean };
}
export interface ClassroomDirs {
  lessonsDir: string; questionsDir?: string; classroomDir?: string;
  /** where to keep the built lessons between starts (omit = keep in memory only) */
  cacheFile?: string;
  /** source folder whose change should discard the saved build (the shared package: it contains the board composer) */
  codeDir?: string;
}

const DEFAULT_VOICE = "malar";
const names = (d?: string) => (d && existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".json")) : []);
/** cheap "did anything change?" mark: file names with size and time, for the three content folders */
const mtimeOf = (p: string) => { try { const st = statSync(p); return `${st.size}:${Math.floor(st.mtimeMs)}`; } catch { return "gone"; } };
const stampOf = (dirs: ClassroomDirs) => [dirs.lessonsDir, dirs.questionsDir, dirs.classroomDir].map((d) => (d ? names(d).sort().map((f) => `${f}:${mtimeOf(join(d, f))}`).join("|") : "")).join("#");
const walk = (dir: string, out: string[] = []): string[] => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, e.name); if (e.isDirectory()) walk(p, out); else if (/\.(ts|json)$/.test(e.name)) out.push(p); } return out; };
/** a short mark of the source folder: file count, total size and newest time. Any edit to the board composer changes it. */
const codeSig = (dir?: string): string => {
  try {
    if (!dir || !existsSync(dir)) return "";
    let n = 0, size = 0, newest = 0;
    for (const p of walk(dir)) { const st = statSync(p); n++; size += st.size; newest = Math.max(newest, Math.floor(st.mtimeMs)); }
    return `${n}:${size}:${newest}`;
  } catch { return ""; }
};
const CACHE_VERSION = 1;

/** Whole-lesson classroom boards, built from the lessons (only changed lessons are built again), with the recorded voice added for the chosen teacher. */
export function createClassroomService(dirs: ClassroomDirs, audio?: AudioStore): ClassroomService {
  let stamp = "", cache: ClassroomLesson[] = [], byKey = new Map<string, ClassroomLesson>();
  let builtAt: string | null = null, lastBuildMs = 0, fromDisk = false;
  let items: ClassroomIndex["items"] = [];
  let voicesKey = "", voices: ClassroomIndex["voices"] = [];
  let compose: ComposeCache = emptyComposeCache();
  let loadedDisk = false;
  const key = (l: { board: string; classLevel: number; subject: string; chapter: string; topic: string }) => `${l.board.toLowerCase()}|${l.classLevel}|${l.subject}|${l.chapter}|${l.topic}`;
  const words = (l: ClassroomLesson) => l.steps.reduce((n, s) => n + s.narration.en.split(/\s+/).length + (s.check ? s.check.stem.en.split(/\s+/).length : 0), 0);

  const readDisk = () => {
    loadedDisk = true;
    if (!dirs.cacheFile || !existsSync(dirs.cacheFile)) return;
    try {
      const j = JSON.parse(readFileSync(dirs.cacheFile, "utf8")) as { v: number; code: string; compose: ComposeCache };
      if (j.v === CACHE_VERSION && j.code === codeSig(dirs.codeDir) && j.code !== "") { compose = j.compose; fromDisk = true; }
    } catch { /* a damaged cache is simply rebuilt */ }
  };
  const writeDisk = () => {
    if (!dirs.cacheFile) return;
    const code = codeSig(dirs.codeDir);
    if (!code) return;
    try { mkdirSync(dirname(dirs.cacheFile), { recursive: true }); writeFileSync(`${dirs.cacheFile}.tmp`, JSON.stringify({ v: CACHE_VERSION, code, compose })); renameSync(`${dirs.cacheFile}.tmp`, dirs.cacheFile); } catch (e) { console.warn("classroom: could not save the build:", (e as Error).message); }
  };
  const build = (s: string) => {
    const t0 = Date.now();
    if (!perf().classroomLazy) { cache = composeAll(dirs); compose = emptyComposeCache(); }
    else {
      if (!loadedDisk) readDisk();
      const r = composeIncremental(dirs, compose);
      cache = r.lessons;
      if (r.changed) writeDisk();
      lastBuildMs = Date.now() - t0;
    }
    if (!perf().classroomLazy) lastBuildMs = Date.now() - t0;
    stamp = s; builtAt = new Date().toISOString();
    byKey = new Map(); for (const l of cache) if (!byKey.has(key(l))) byKey.set(key(l), l);
    items = cache.map((l) => ({ board: l.board, classLevel: l.classLevel, subject: l.subject, chapter: l.chapter, topic: l.topic, title: l.title, steps: l.steps.length, minutes: Math.max(1, Math.round((words(l) * 0.43) / 60)) }));
    voicesKey = "";
  };
  const currentStamp = throttled(() => stampOf(dirs));
  const load = () => { const s = currentStamp(); if (s !== stamp) build(s); return cache; };
  const withAudio = (l: ClassroomLesson, voice: string): PublicClassroom => ({
    ...l,
    steps: l.steps.map((st) => ({
      ...st,
      audio: audio?.refs(voice, st.narration),
      checkAudio: st.check ? { stem: audio?.refs(voice, st.check.stem), explanation: audio?.refs(voice, st.check.explanation) } : undefined,
    })),
  });
  return {
    index() {
      const all = load();
      // a voice is "ready" when it has been recorded for at least one lesson (not just the first lesson in the list); worked out again only when the lessons or the recordings change
      const vk = `${stamp}#${audio?.version?.() ?? Date.now()}`;
      if (vk !== voicesKey) { voices = (audio?.teachers() ?? []).map((t) => ({ ...t, ready: all.some((l) => !!l.steps[0] && !!audio?.refs(t.id, l.steps[0].narration)) })); voicesKey = vk; }
      const pref = perf().defaultAudioVoice || "kani";
      return { voices, defaultVoice: voices.some((v) => v.id === pref) ? pref : DEFAULT_VOICE, items };
    },
    get(board, classLevel, subject, chapter, topic, voice) {
      load();
      const l = byKey.get(key({ board, classLevel, subject, chapter, topic }));
      if (!l) return null;
      const ready = (audio?.teachers() ?? []).filter((t) => l.steps.some((st) => !!audio?.refs(t.id, st.narration))).map((t) => t.id);
      const pref = perf().defaultAudioVoice || "kani";
      const use = voice && ready.includes(voice) ? voice : (([...new Set([pref, "kani", "priya2", DEFAULT_VOICE])].find((v) => ready.includes(v)) ?? ready[0]) ?? DEFAULT_VOICE);
      return { ...withAudio(l, use), voicesReady: ready, voiceUsed: use };
    },
    warm() {
      const t0 = Date.now(); stamp = ""; const before = Object.keys(compose.lessons).length; load();
      return { lessons: cache.length, ms: Date.now() - t0, reused: before, built: Math.max(0, cache.length - before) };
    },
    rebuild() { const t0 = Date.now(); compose = emptyComposeCache(); loadedDisk = true; stamp = ""; fromDisk = false; load(); return { lessons: cache.length, ms: Date.now() - t0 }; },
    status() { return { lessons: cache.length, builtAt, lastBuildMs, fromDiskCache: fromDisk, incremental: perf().classroomLazy }; },
  };
}
