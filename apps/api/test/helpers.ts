import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createPgliteDb } from "../src/db/dev.js";
import { importCurriculum } from "../src/modules/curriculum/importer.js";
import { createDbCurriculumRepository } from "../src/modules/curriculum/db-repository.js";
import { createLessonService } from "../src/modules/lessons/service.js";
import { createAccountService } from "../src/modules/accounts/service.js";
import { createTutorService } from "../src/modules/tutor/service.js";
import type { ModelCall } from "../src/modules/tutor/provider.js";
import { createPracticeService } from "../src/modules/practice/service.js";
import { createSettingsService } from "../src/modules/settings/service.js";
import { curriculumDir } from "../src/server-paths.js";

export const seedFile = () => JSON.parse(readFileSync(join(curriculumDir, "cbse-2026-27.json"), "utf8"));

/** The real seed plus a few authored topics, objectives and prerequisites. */
export function authoredFixture() {
  const d = seedFile();
  const maths = d.classes[0].subjects.find((s: { slug: string }) => s.slug === "maths");
  const toy = maths.chapters.find((c: { slug: string }) => c.slug === "toy-joy");
  const shapes = maths.chapters.find((c: { slug: string }) => c.slug === "fun-with-shapes");
  toy.topics = [
    { slug: "counting-toys", name: { en: "Counting toys", ta: "பொம்மைகளை எண்ணுதல்" }, objectives: [{ text: { en: "Count up to 100 objects" }, competencyCode: "C-3.1" }, { text: { en: "Group objects in tens" } }] },
    { slug: "toy-patterns", name: { en: "Toy patterns" }, prerequisites: ["3/maths/toy-joy/counting-toys"] },
  ];
  shapes.topics = [{ slug: "flat-shapes", name: { en: "Flat shapes" }, prerequisites: ["3/maths/toy-joy/toy-patterns"] }];
  return d;
}

export async function makeRepo(data: unknown = authoredFixture(), ai: ModelCall | null = null) {
  const db = await createPgliteDb(); // in-memory real PostgreSQL
  await importCurriculum(db, data);
  const repo = createDbCurriculumRepository(db);
  return { db, repo, settings: createSettingsService(db), lessons: createLessonService(db, repo), practice: createPracticeService(db, repo), accounts: createAccountService(db), tutor: createTutorService(db, createLessonService(db, repo), ai) };
}
