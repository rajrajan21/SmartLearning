// Usage: pnpm --filter @studysmart/api lessons:build [-- --check] [--only <recipe-id>]
// Turns every recipe in content/recipes into a classroom lesson in content/classroom, applying the rule book.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { classroomDir } from "../../server-paths.js";
import { compileRecipe, type Recipe } from "./compile.js";
import { checkRules } from "./rules.js";

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const checkOnly = args.includes("--check");
const outDir = args.includes("--out") ? args[args.indexOf("--out") + 1]! : classroomDir;
const recipesDir = join(dirname(classroomDir), "recipes");

const walk = (d: string): string[] => (!existsSync(d) ? [] : readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : n.endsWith(".json") ? [p] : []; }));
let written = 0, failed = 0, warned = 0;
mkdirSync(outDir, { recursive: true });
for (const file of walk(recipesDir).sort()) {
  let list: Recipe[];
  try { const j = JSON.parse(readFileSync(file, "utf8")) as Recipe | Recipe[]; list = Array.isArray(j) ? j : [j]; } catch (e) { console.log(`FAILED  ${file}: not valid JSON (${(e as Error).message})`); failed++; continue; }
  for (const r of list) {
    if (only && r.id !== only) continue;
    const { lesson, problems } = compileRecipe(r);
    const f = problems.length ? { errors: [] as string[], warnings: [] as string[] } : checkRules(lesson as Parameters<typeof checkRules>[0]);
    const errors = [...problems, ...f.errors];
    if (errors.length) { failed++; console.log(`FAILED  ${r.id}`); for (const e of errors) console.log(`   - ${e}`); continue; }
    if (f.warnings.length) { warned++; console.log(`WARN    ${r.id}`); for (const w of f.warnings) console.log(`   - ${w}`); }
    if (!checkOnly) { writeFileSync(join(outDir, `${r.id}.json`), JSON.stringify(lesson, null, 1) + "\n"); written++; console.log(`OK      ${r.id}`); }
    else console.log(`OK      ${r.id} (checked, not written)`);
  }
}
console.log(`\n${written} lesson(s) written, ${failed} failed, ${warned} with warnings.`);
process.exit(failed ? 1 : 0);
