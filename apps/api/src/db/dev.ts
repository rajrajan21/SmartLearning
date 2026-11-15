import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

export async function seedAll(db: Db): Promise<void> {
  for (const f of readdirSync(curriculumDir).filter((x) => x.endsWith(".json")).sort()) {
    const summary = await importCurriculum(db, JSON.parse(readFileSync(join(curriculumDir, f), "utf8")));
    console.log("imported", f, JSON.stringify(summary));
  }
  await seedLessons(db);
  await seedQuestions(db);
}

export async function seedQuestions(db: Db): Promise<void> {
  if (!existsSync(questionsDir)) return;
  const practice = createPracticeService(db, createDbCurriculumRepository(db));
  for (const f of readdirSync(questionsDir).filter((x) => x.endsWith(".json")).sort()) {
    console.log("questions", f, JSON.stringify(await practice.importQuestions(JSON.parse(readFileSync(join(questionsDir, f), "utf8")))));
  }
}

export async function seedLessons(db: Db): Promise<void> {
  if (!existsSync(lessonsDir)) return;
  const lessons = createLessonService(db, createDbCurriculumRepository(db));
  for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json")).sort()) {
    console.log("lesson", f, JSON.stringify(await lessons.importLesson(JSON.parse(readFileSync(join(lessonsDir, f), "utf8")))));
  }
}
