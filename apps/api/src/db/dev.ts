import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { importCurriculum } from "../modules/curriculum/importer.js";
import { createDbCurriculumRepository } from "../modules/curriculum/db-repository.js";
import { createLessonService } from "../modules/lessons/service.js";
import { createPracticeService } from "../modules/practice/service.js";
import { curriculumDir, lessonsDir, questionsDir } from "../server-paths.js";
import type { Db } from "./client.js";
import * as schema from "./schema.js";

const migrationsFolder = join(import.meta.dirname, "../../drizzle");

/** Embedded PostgreSQL (PGlite): no Docker or install needed. dataDir omitted = in memory (tests). */
export async function createPgliteDb(dataDir?: string): Promise<Db> {
  if (dataDir) mkdirSync(dataDir, { recursive: true }); // PGlite creates only the last folder, so make the parents too
  const db = drizzle(new PGlite(dataDir), { schema });
  await migrate(db, { migrationsFolder });
  return db as unknown as Db;
}

/**
 * What was already loaded into the database: one "size:modified" mark per content file, plus row counts so that a
 * deleted or replaced database is noticed (then everything is loaded again). Kept next to the database folder.
 */
export interface SeedState { v: 1; files: Record<string, string>; counts: { topics: number; versions: number; questions: number }; failed: Record<string, string>; savedAt: string }
export interface SeedOptions {
  /** where to keep the "already loaded" marks; omit to load everything every time (tests, one-off tools) */
  stateFile?: string;
  /** a lesson or question file whose topic is not in the curriculum yet is skipped with a warning instead of stopping the start-up */
  lenient?: boolean;
  /** ignore the marks and load everything again */
  force?: boolean;
  /** print only a summary line instead of one line per file */
  quiet?: boolean;
}
export interface SeedReport { loaded: number; skipped: number; failed: number; ms: number; fullReload: boolean }

const mark = (p: string) => { const st = statSync(p); return `${st.size}:${Math.floor(st.mtimeMs)}`; };
const jsonIn = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((x) => x.endsWith(".json")).sort() : []);

async function dbCounts(db: Db): Promise<SeedState["counts"]> {
  const r = (await db.execute(sql`select (select count(*) from topics)::int as t, (select count(*) from topic_versions)::int as v, (select count(*) from questions)::int as q`)) as unknown as { rows: { t: number; v: number; q: number }[] };
  const row = r.rows[0]!;
  return { topics: Number(row.t), versions: Number(row.v), questions: Number(row.q) };
}
function readState(file: string): SeedState | null {
  try { const j = JSON.parse(readFileSync(file, "utf8")) as SeedState; return j && j.v === 1 && j.files ? j : null; } catch { return null; }
}
function writeState(file: string, st: SeedState) {
  try { writeFileSync(`${file}.tmp`, JSON.stringify(st)); renameSync(`${file}.tmp`, file); } catch (e) { console.warn("seed: could not save the start-up marks:", (e as Error).message); }
}
export const seedStatusFile = (pgliteDir: string) => `${pgliteDir}.seed-state.json`;

export async function seedAll(db: Db, opts: SeedOptions = {}): Promise<SeedReport> {
  const t0 = Date.now();
  let state: SeedState | null = null, fullReload = true;
  if (opts.stateFile && !opts.force) {
    const saved = readState(opts.stateFile);
    if (saved) {
      const now = await dbCounts(db);
      if (now.topics === saved.counts.topics && now.versions === saved.counts.versions && now.questions === saved.counts.questions && now.topics > 0) { state = saved; fullReload = false; }
    }
  }
  const files: Record<string, string> = state ? { ...state.files } : {};
  const failed: Record<string, string> = {};
  const rep: SeedReport = { loaded: 0, skipped: 0, failed: 0, ms: 0, fullReload };
  const log = (...a: unknown[]) => { if (!opts.quiet) console.log(...a); };
  const stale = (key: string, path: string) => { const m = mark(path); if (files[key] === m) return null; return m; };

  for (const f of jsonIn(curriculumDir)) {
    const key = `curriculum/${f}`, m = stale(key, join(curriculumDir, f));
    if (m === null) { rep.skipped++; continue; }
    const summary = await importCurriculum(db, JSON.parse(readFileSync(join(curriculumDir, f), "utf8")));
    files[key] = m; rep.loaded++;
    log("imported", f, JSON.stringify(summary));
  }
  // one repository for the whole run keeps the curriculum graph in memory (see db-repository.ts) instead of re-reading it for every file
  const repo = createDbCurriculumRepository(db);
  repo.invalidate?.();
  const lessons = createLessonService(db, repo);
  const practice = createPracticeService(db, repo);
  const one = async (kind: "lessons" | "questions", dir: string, load: (raw: unknown) => Promise<unknown>) => {
    if (!existsSync(dir)) return;
    for (const f of jsonIn(dir)) {
      const key = `${kind}/${f}`, m = stale(key, join(dir, f));
      if (m === null) { rep.skipped++; continue; }
      try {
        const out = await load(JSON.parse(readFileSync(join(dir, f), "utf8")));
        files[key] = m; rep.loaded++;
        log(kind === "lessons" ? "lesson" : "questions", f, JSON.stringify(out));
      } catch (e) {
        if (!opts.lenient) throw e;
        rep.failed++; failed[key] = (e as Error).message.slice(0, 200);
        delete files[key];
      }
    }
  };
  await one("lessons", lessonsDir, (raw) => lessons.importLesson(raw));
  await one("questions", questionsDir, (raw) => practice.importQuestions(raw));
  if (rep.failed) {
    const first = Object.entries(failed).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(" | ");
    console.warn(`seed: ${rep.failed} content file(s) were skipped because their topic is not in the curriculum yet (they will be tried again at the next start). ${first}`);
  }
  repo.invalidate?.();
  rep.ms = Date.now() - t0;
  if (opts.stateFile) writeState(opts.stateFile, { v: 1, files, counts: await dbCounts(db), failed, savedAt: new Date().toISOString() });
  console.log(`seed: ${rep.fullReload ? "loaded all content" : "loaded only new or changed content"}: ${rep.loaded} loaded, ${rep.skipped} unchanged, ${rep.failed} skipped, ${(rep.ms / 1000).toFixed(1)} s`);
  return rep;
}

export async function seedQuestions(db: Db): Promise<void> {
  if (!existsSync(questionsDir)) return;
  const practice = createPracticeService(db, createDbCurriculumRepository(db));
  for (const f of jsonIn(questionsDir)) {
    console.log("questions", f, JSON.stringify(await practice.importQuestions(JSON.parse(readFileSync(join(questionsDir, f), "utf8")))));
  }
}

export async function seedLessons(db: Db): Promise<void> {
  if (!existsSync(lessonsDir)) return;
  const lessons = createLessonService(db, createDbCurriculumRepository(db));
  for (const f of jsonIn(lessonsDir)) {
    console.log("lesson", f, JSON.stringify(await lessons.importLesson(JSON.parse(readFileSync(join(lessonsDir, f), "utf8")))));
  }
}
