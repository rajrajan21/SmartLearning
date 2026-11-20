// One-off: adds the language ("hi" or "en") to every paper already in content/papers/index.json.
// Run:  node tools/papers/Tag-Paper-Languages.mjs   (safe to run again)
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { PAPERS_DIR, readIndex, detectLang } from "./lib/store.mjs";
const idx = readIndex(); let hi = 0, en = 0, miss = 0;
for (const e of idx.papers) {
  try { const p = JSON.parse(gunzipSync(readFileSync(join(PAPERS_DIR, `${e.id}.json.gz`))).toString("utf8")); e.lang = detectLang(p); e.lang === "hi" ? hi++ : en++; } catch { miss++; }
}
writeFileSync(join(PAPERS_DIR, "index.tmp"), JSON.stringify(idx)); renameSync(join(PAPERS_DIR, "index.tmp"), join(PAPERS_DIR, "index.json"));
console.log(`Tagged ${hi} Hindi and ${en} other papers (${miss} could not be read).`);
