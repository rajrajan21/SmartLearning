import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { composeAll, composeIncremental, type ComposeCache } from "../classroom/compose-all.js";
import { perf, PERF_DEFAULTS, setPerf } from "./config.js";
import { throttled } from "./throttle.js";

const contentDir = resolve(import.meta.dirname, "../../../../../content");
const tmp: string[] = [];
afterEach(() => { setPerf({}); while (tmp.length) rmSync(tmp.pop()!, { recursive: true, force: true }); });

describe("perf config", () => {
  it("keeps the old behaviour until settings are read, then follows the admin settings", () => {
    setPerf({});
    expect(perf()).toEqual(PERF_DEFAULTS);
    setPerf({ "perf.fileCheck.seconds": 7, "perf.classroom.lazy": true, "perf.curriculumCache.seconds": 60 });
    expect(perf().fileCheckSeconds).toBe(7);
    expect(perf().classroomLazy).toBe(true);
    expect(perf().curriculumCacheSeconds).toBe(60);
  });
  it("throttles a check to once per interval, and not at all when the interval is 0", () => {
    let n = 0; const check = throttled(() => ++n);
    setPerf({ "perf.fileCheck.seconds": 0 });
    check(); check(); expect(n).toBe(2);
    setPerf({ "perf.fileCheck.seconds": 30 });
    const before = n; check(); check(); check();
    expect(n - before).toBeLessThanOrEqual(1);
  });
});

describe("incremental classroom compose", () => {
  it("gives the same lessons as composeAll, and rebuilds only a changed file", () => {
    const dir = mkdtempSync(join(tmpdir(), "perf-"));
    tmp.push(dir);
    const lessonsSrc = join(contentDir, "lessons");
    if (!existsSync(lessonsSrc)) return;
    const lessonsDir = join(dir, "lessons"); mkdirSync(lessonsDir);
    for (const f of readdirSync(lessonsSrc).filter((x) => x.endsWith(".json")).slice(0, 5)) cpSync(join(lessonsSrc, f), join(lessonsDir, f));
    const dirs = { lessonsDir };
    const full = composeAll(dirs);
    const cache: ComposeCache = { lessons: {}, hands: {} };
    const first = composeIncremental(dirs, cache).lessons;
    expect(first.length).toBe(full.length);
    expect(first.map((l) => l.topic).sort()).toEqual(full.map((l) => l.topic).sort());
    const again = composeIncremental(dirs, cache);
    expect(again.lessons.length).toBe(full.length);
    expect(again.stats.read).toBe(0);
    expect(again.changed).toBe(false);
    const f = readdirSync(lessonsDir)[0]!;
    const t = new Date(Date.now() + 5000);
    utimesSync(join(lessonsDir, f), t, t);
    writeFileSync(join(dir, "x.txt"), "x");
    const touched = composeIncremental(dirs, cache);
    expect(touched.lessons.length).toBe(full.length);
    expect(touched.stats.read).toBe(1);
  });
});
