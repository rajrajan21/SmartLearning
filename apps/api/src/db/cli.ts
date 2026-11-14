// Usage: pnpm --filter @studysmart/api db:migrate | db:seed | curriculum:check   (migrate/seed need DATABASE_URL)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CurriculumImport, LessonImport } from "@studysmart/shared";
import { curriculumDir, lessonsDir } from "../server-paths.js";

const cmd = process.argv[2];

if (cmd === "check") {
  // Validate every curriculum file (schema, slugs, prerequisites, cycles) without a database.
  let failed = false;
  for (const f of readdirSync(curriculumDir).filter((x) => x.endsWith(".json")).sort()) {
    const r = CurriculumImport.safeParse(JSON.parse(readFileSync(join(curriculumDir, f), "utf8")));
    if (r.success) {
      const chapters = r.data.classes.flatMap((c) => c.subjects.flatMap((s) => s.chapters));
      console.log(`OK    ${f}: ${chapters.length} chapters, ${chapters.reduce((n, c) => n + c.topics.length, 0)} topics`);
    } else {
      failed = true;
      console.log(`FAIL  ${f}`);
      for (const i of r.error.issues) console.log(`      ${i.path.join(".")}: ${i.message}`);
    }
  }
  for (const f of existsSync(lessonsDir) ? readdirSync(lessonsDir).filter((x) => x.endsWith(".json")).sort() : []) {
    const r = LessonImport.safeParse(JSON.parse(readFileSync(join(lessonsDir, f), "utf8")));
    if (r.success) console.log(`OK    lessons/${f}: ${r.data.lesson.blocks.length} blocks`);
    else { failed = true; console.log(`FAIL  lessons/${f}`); for (const i of r.error.issues) console.log(`      ${i.path.join(".")}: ${i.message}`); }
  }
  process.exit(failed ? 1 : 0);
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required for migrate/seed");
const { drizzle } = await import("drizzle-orm/node-postgres");
const { migrate } = await import("drizzle-orm/node-postgres/migrator");
const { default: pg } = await import("pg");
const { importCurriculum } = await import("../modules/curriculum/importer.js");
const schema = await import("./schema.js");
const { seedLessons } = await import("./dev.js");
const pool = new pg.Pool({ connectionString: url, max: 2 });
const db = drizzle(pool, { schema });

if (cmd === "migrate") {
  await migrate(db, { migrationsFolder: join(import.meta.dirname, "../../drizzle") });
  console.log("migrations applied");
} else if (cmd === "seed") {
  for (const f of readdirSync(curriculumDir).filter((x) => x.endsWith(".json")).sort()) {
    console.log("imported", f, await importCurriculum(db as never, JSON.parse(readFileSync(join(curriculumDir, f), "utf8"))));
  }
  await seedLessons(db as never);
} else {
  throw new Error("usage: cli.ts check|migrate|seed");
}
await pool.end();
