import { SITE } from "@studysmart/shared";
import { createApp } from "./app.js";
import { createPgliteDb, seedAll, seedStatusFile } from "./db/dev.js";
import type { Db } from "./db/client.js";
import { createDbCurriculumRepository } from "./modules/curriculum/db-repository.js";
import { createAudioStore } from "./modules/audio/manifest.js";
import { createClassroomService } from "./modules/classroom/service.js";
import { socialDir, gkDir, audioDir, libraryCatalog, libraryDir, papersDir, contribDir, booksDir, classroomDir, lessonsDir, questionsDir } from "./server-paths.js";
import { createBookStore } from "./modules/books/store.js";
import { createPaperStore } from "./modules/papers/store.js";
import { createLibraryStore } from "./modules/library/store.js";
import { createLibraryPages } from "./modules/library/pages.js";
import { createContribStore } from "./modules/contrib/store.js";
import { createContribService } from "./modules/contrib/service.js";
import { createSocialStore } from "./modules/social/store.js";
import { createSocialService } from "./modules/social/service.js";
import { createGkStore } from "./modules/gk/store.js";
import { createTutorService } from "./modules/tutor/service.js";
import { modelFromEnv } from "./modules/tutor/provider.js";
import { createStatsService } from "./modules/stats/service.js";
import { createMailService } from "./modules/mail/service.js";
import { startTimers } from "./modules/mail/timers.js";
import { createReportsService } from "./modules/stats/reports.js";
import { fileURLToPath } from "node:url";
import { createAccountService } from "./modules/accounts/service.js";
import { createPracticeService } from "./modules/practice/service.js";
import { createLessonService } from "./modules/lessons/service.js";
import { resolve, dirname } from "node:path";
import { resolveAdminKey, resolveAdminUserId } from "./modules/settings/admin-auth.js";
import { createAccessService, resolveAccessSecret } from "./modules/access/service.js";
import { createSettingsService } from "./modules/settings/service.js";
import { migrateEnablePapersJob, migrateEnableSections } from "./modules/settings/migrate-enable.js";

async function connect(): Promise<Db> {
  if (process.env.DATABASE_URL) {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { default: pg } = await import("pg");
    console.log("Database: PostgreSQL (DATABASE_URL)");
    return drizzle(new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 }), { schema: await import("./db/schema.js") }) as unknown as Db;
  }
  const dir = process.env.PGLITE_DIR ?? ".data/pglite";
  console.log(`Database: embedded PostgreSQL (PGlite) in ${dir}. Set DATABASE_URL to use a real server.`);
  const db = await createPgliteDb(dir);
  // Idempotent; keeps the database in step with content/. Only new or changed files are loaded (marks kept next to the database folder);
  // SEED_FORCE=1 loads everything again, SEED_VERBOSE=1 prints one line per file.
  await seedAll(db, { stateFile: seedStatusFile(dir), lenient: true, force: process.env.SEED_FORCE === "1", quiet: process.env.SEED_VERBOSE !== "1" });
  return db;
}

const adminKey = resolveAdminKey(process.env);
const port = Number(process.env.PORT ?? 3000);
const db = await connect();
const curriculum = createDbCurriculumRepository(db);
const audio = createAudioStore({ manifestPath: `${audioDir}/manifest.json`, voicesPath: `${audioDir}/voices.json`, phrasesPath: `${audioDir}/phrases.json`, filesDir: `${audioDir}/files` });
const lessonSvc = createLessonService(db, curriculum, audio);
const settingsSvc = createSettingsService(db);
await migrateEnableSections(settingsSvc, process.env.MIGRATIONS_DIR ? resolve(process.env.MIGRATIONS_DIR, "enable-sections-v1.json") : resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/migrations/enable-sections-v1.json"));
await migrateEnablePapersJob(settingsSvc, process.env.MIGRATIONS_DIR ? resolve(process.env.MIGRATIONS_DIR, "enable-papers-job-v1.json") : resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/migrations/enable-papers-job-v1.json"));
const mailSvc = createMailService(db, settingsSvc, process.env.MAIL_STATE_FILE ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/mail-state.json"));
startTimers(settingsSvc, mailSvc);
const socialStore = createSocialStore(socialDir);
const socialSvc = createSocialService({ store: socialStore, dirs: { lessonsDir, classroomDir, gkDir: `${gkDir}/lessons` }, settings: () => settingsSvc.all() as Promise<Record<string, unknown>>, audio: { ref: (t, l, x) => audio.ref(t, l, x), filePath: (f) => audio.filePath(f) } });
setInterval(() => { socialSvc.tick().catch((e) => console.error("social_tick_failed", e instanceof Error ? e.message : "error")); }, 5 * 60 * 1000).unref(); // does nothing unless Social posting AND "run on schedule from the website" are both on
const contribStore = createContribStore(contribDir, libraryDir);
const library = createLibraryStore(libraryCatalog, libraryDir, contribStore.dirs.contributed);
const libraryPages = createLibraryPages({ filesDir: libraryDir, settings: () => settingsSvc.all() as Promise<Record<string, unknown>>, log: (m) => console.warn(m) });
libraryPages.start();
const contribSvc = createContribService({ store: contribStore, settings: settingsSvc, library, onPublished: (id) => { void libraryPages.ensure(id, "added").catch(() => undefined); }, secret: resolveAccessSecret(process.env, adminKey), libraryFilesDir: libraryDir, log: (m) => console.warn(m) });
contribSvc.startSweeper();
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const classroomSvc = createClassroomService({ lessonsDir, questionsDir, classroomDir, cacheFile: process.env.CLASSROOM_CACHE ?? resolve(root, "data/cache/classroom-built.json"), codeDir: resolve(root, "packages/shared/src") }, audio);
const repo = resolve(lessonsDir, "../..");
const uploadsDir = process.env.UPLOADS_DIR ?? resolve(repo, "data/uploads");
const app = createApp({
  monitor: {
    paths: {
      content: resolve(repo, "content"), audio: resolve(audioDir), uploads: uploadsDir,
      backups: process.env.BACKUP_DIR ?? (process.platform === "win32" ? resolve(repo, "backups") : "/var/backups/studysmart"),
      jobState: process.env.JOB_REPORT_DIR ?? resolve(uploadsDir, "../job-reports"),
    },
    jobToken: process.env.JOB_REPORT_TOKEN,
  },
  libraryPages, perf: { seedStateFile: process.env.DATABASE_URL ? undefined : seedStatusFile(process.env.PGLITE_DIR ?? ".data/pglite") },  tourDir: process.env.TOUR_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/tour"), social: { service: socialSvc, store: socialStore }, mail: mailSvc, db, uploadsDir, reports: createReportsService(process.env.REPORTS_FILE ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/reports.json")), stats: createStatsService(process.env.STATS_FILE ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/stats.json")), books: createBookStore(booksDir), papers: createPaperStore(papersDir), papersDir, gk: createGkStore(gkDir, audio), library, contrib: { svc: contribSvc, store: contribStore }, classroom: classroomSvc, curriculum, lessons: lessonSvc, tutor: createTutorService(db, lessonSvc, modelFromEnv(process.env)), practice: createPracticeService(db, curriculum, audio), accounts: createAccountService(db), secureCookie: process.env.NODE_ENV === "production", audio, settings: settingsSvc, access: createAccessService(db, resolveAccessSecret(process.env, adminKey)), adminKey, adminUserId: resolveAdminUserId(process.env), webDir: process.env.WEB_DIR ? resolve(process.env.WEB_DIR) : undefined });
app.listen(port, () => {
  console.log(`${SITE.name} API listening on :${port}`);
  // build the classroom boards in the background just after start so the first visitor does not wait (Admin > Site and performance > Speed)
  setTimeout(() => { void settingsSvc.all().then((v) => { if (v["perf.prewarm"] === false) return; const r = classroomSvc.warm?.(); if (r) console.log(`classroom boards ready: ${r.lessons} lessons in ${(r.ms / 1000).toFixed(1)} s`); }).catch(() => undefined); }, 500).unref();
});
