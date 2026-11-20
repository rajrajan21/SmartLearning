// Loads all lessons and questions into a throw-away database and lists anything that is refused.
import { createPgliteDb, seedAll } from "../db/dev.js";
const db = await createPgliteDb();
const log = console.log; const bad: string[] = [];
console.log = (...a: unknown[]) => { const s = a.map(String).join(" "); if (/cbse-6-(science|social)/.test(s) || /reject|error|fail|invalid/i.test(s)) bad.push(s); };
await seedAll(db);
console.log = log;
for (const b of bad) console.log(b.slice(0, 300));
console.log(`checked; ${bad.length} lines about class 6 science/social or problems`);
process.exit(0);
