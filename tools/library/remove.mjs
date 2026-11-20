// Removes one book (takedown or mistake): deletes its files, drops it from the catalogue and blocks it from coming back.
//   node tools/library/remove.mjs <book-id> [<book-id> ...]
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { HERE, loadConfig, readJson, writeJsonAtomic } from "./lib.mjs";

const ids = process.argv.slice(2);
if (!ids.length) { console.log("Usage: Remove-Library-Book.bat <book-id>   (the id is in the book's web address: /library/<id>)"); process.exit(1); }
const cfg = await loadConfig({ fetchImpl: async () => { throw new Error("offline"); } });
const cat = readJson(cfg.catalog, { version: 1, books: [] });
const blockFile = join(dirname(cfg.catalog), "blocklist.json");
const block = readJson(blockFile, { ids: [] });
for (const id of ids) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/.test(id)) { console.log(`skip ${id}: not a valid id`); continue; }
  for (const p of [join(cfg.libraryDir, "pdf", `${id}.pdf`), join(cfg.libraryDir, "cover", `${id}.jpg`)]) if (existsSync(p)) rmSync(p, { force: true });
  cat.books = cat.books.filter((b) => b.id !== id);
  if (!block.ids.includes(id)) block.ids.push(id);
  console.log(`removed ${id}`);
}
writeJsonAtomic(cfg.catalog, cat);
writeJsonAtomic(blockFile, block);
