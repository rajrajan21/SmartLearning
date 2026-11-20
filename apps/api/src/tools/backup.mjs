// Saves the data that cannot be rebuilt (accounts and progress, problem reports, stats) plus the lesson content
// into backups/studysmart-YYYY-MM-DD.tgz, and deletes the oldest copies beyond BACKUP_KEEP (default 14).
// The big, re-downloadable folders (textbook PDFs and page pictures, audio) are NOT included.
//   node src/tools/backup.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = process.env.BACKUP_ROOT ?? resolve(here, "../../../..");
const outDir = process.env.BACKUP_DIR ?? join(repo, "backups");
const keep = Math.max(1, Number(process.env.BACKUP_KEEP ?? 14));

/** Which of the folders to save actually exist. */
export const pick = (root, list) => list.filter((p) => existsSync(join(root, p)));
const WANT = ["apps/api/.data", ".data", "data", "content/curriculum", "content/questions", "content/recipes", "content/classroom", "content/lessons", "content/coverage"];

/** Oldest first; everything beyond `keep` newest is returned for deletion. */
export const toDelete = (names, keep) => names.filter((n) => /^studysmart-\d{4}-\d{2}-\d{2}\.tgz$/.test(n)).sort().slice(0, Math.max(0, names.filter((n) => /^studysmart-\d{4}-\d{2}-\d{2}\.tgz$/.test(n)).length - keep));

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const items = pick(repo, WANT);
  if (items.length === 0) { console.log("Nothing to back up yet."); process.exit(0); }
  mkdirSync(outDir, { recursive: true });
  const name = `studysmart-${new Date().toISOString().slice(0, 10)}.tgz`;
  execFileSync("tar", ["-czf", join(outDir, name), "-C", repo, ...items], { stdio: "inherit" });
  console.log(`Saved ${name} (${Math.round(statSync(join(outDir, name)).size / 1024)} KB): ${items.join(", ")}`);
  for (const old of toDelete(readdirSync(outDir), keep)) { rmSync(join(outDir, old)); console.log("Removed old backup", old); }
  console.log(`Backups are in ${outDir}. Copy this folder to a USB drive or cloud drive now and then.`);
}
