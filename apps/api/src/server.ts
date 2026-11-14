import { createApp } from "./app.js";
import { createPgliteDb, seedAll } from "./db/dev.js";
import type { Db } from "./db/client.js";
import { createDbCurriculumRepository } from "./modules/curriculum/db-repository.js";
import { createAudioStore } from "./modules/audio/manifest.js";
import { audioDir } from "./server-paths.js";
import { createTutorService } from "./modules/tutor/service.js";
import { modelFromEnv } from "./modules/tutor/provider.js";
import { createAccountService } from "./modules/accounts/service.js";
import { createPracticeService } from "./modules/practice/service.js";
import { createLessonService } from "./modules/lessons/service.js";
import { resolveAdminKey } from "./modules/settings/admin-auth.js";
import { createSettingsService } from "./modules/settings/service.js";

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
  await seedAll(db); // idempotent; keeps dev data in step with content/curriculum/*.json
  return db;
}

const port = Number(process.env.PORT ?? 3000);
const db = await connect();
const curriculum = createDbCurriculumRepository(db);
const audio = createAudioStore({ manifestPath: `${audioDir}/manifest.json`, voicesPath: `${audioDir}/voices.json`, phrasesPath: `${audioDir}/phrases.json`, filesDir: `${audioDir}/files` });
const lessonSvc = createLessonService(db, curriculum, audio);
const app = createApp({ curriculum, lessons: lessonSvc, tutor: createTutorService(db, lessonSvc, modelFromEnv(process.env)), practice: createPracticeService(db, curriculum, audio), accounts: createAccountService(db), secureCookie: process.env.NODE_ENV === "production", audio, settings: createSettingsService(db), adminKey: resolveAdminKey(process.env) });
app.listen(port, () => console.log(`StudySmart API listening on :${port}`));
