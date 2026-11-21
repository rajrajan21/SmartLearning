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
import { createAccessService } from "../src/modules/access/service.js";
import { curriculumDir } from "../src/server-paths.js";

export const shippedSeedFile = () => JSON.parse(readFileSync(join(curriculumDir, "cbse-2026-27.json"), "utf8"));

/** Keep the subjects and topics used by the API fixtures independent of new curriculum releases. */
export const seedFile = () => {
  const d = shippedSeedFile();
  const subjectSlugs: Record<number, string[]> = { 3: ["maths", "evs"], 4: ["maths", "evs"], 6: ["maths"] };
  d.classes = d.classes.filter((c: { classLevel: number }) => subjectSlugs[c.classLevel]);
  for (const c of d.classes) c.subjects = c.subjects.filter((s: { slug: string }) => subjectSlugs[c.classLevel]!.includes(s.slug));
  for (const c of d.classes) for (const sub of c.subjects) for (const ch of sub.chapters) if (ch.slug !== "fun-with-shapes") ch.topics = [];
  return d;
};
/** One fixed content file (the shapes topic) from a content folder, whatever else is authored. */
export const shapesJson = (dir: string) => JSON.parse(readFileSync(join(dir, "cbse-3-maths-fun-with-shapes-sides-and-corners.json"), "utf8"));

/** The fixture seed plus a few authored topics, objectives and prerequisites. */
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
  return { db, repo, settings: createSettingsService(db), lessons: createLessonService(db, repo), practice: createPracticeService(db, repo), accounts: createAccountService(db), access: createAccessService(db, "test-access-secret-0123456789"), tutor: createTutorService(db, createLessonService(db, repo), ai) };
}
