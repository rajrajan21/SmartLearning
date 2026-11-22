import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2];
if (!root) throw new Error("Provide the private queue directory");
const app = "/opt/studysmart";
const live = "/srv/studysmart/audio";
const stage = "/home/ubuntu/sharpstudy-audio-worker/staging";
const { collectJobs } = await import(app + "/apps/api/src/modules/audio/build.ts");
const { audioKey, speechText, VoiceMap } = await import(app + "/apps/api/src/modules/audio/manifest.ts");
const json = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const source = (dir: string) => json(join(dir, "manifest.json")).entries;
const id = process.env.SHARPSTUDY_VOICE_ID ?? "kani";
const config = VoiceMap.parse(json(join(live, "voices.json")))[id]?.en;
if (!config) throw new Error("English voice missing: " + id);
const has = (entries, dir: string, key: string, text?: string) => {
  const e = entries[key], file = join(dir, "files", key + ".mp3");
  return e?.file === key + ".mp3" && (!text || (e.text === text && e.voice === config.voice && e.lang === "en"))
    && e.bytes > 0 && existsSync(file) && statSync(file).size === e.bytes;
};
const published = source(live), staged = source(stage);
const phases = new Map<number, string[]>([6, 7, 3, 4, 9, 10, 5, 8].map(grade => [grade, []]));
const keys = new Set<string>();
const exceptions: { where: string; reason: string; length: number }[] = [];
const rows = new Map<number, { live: number; staged: number; missing: number }>();
for (const grade of phases.keys()) rows.set(grade, { live: 0, staged: 0, missing: 0 });
const jobs = collectJobs({
  lessonsDir: app + "/content/lessons", questionsDir: app + "/content/questions",
  classroomDir: app + "/content/classroom", audioDir: stage,
}, ["en"]);
const byGrade = new Map<number, typeof jobs>();
for (const job of jobs) {
  const match = /^(?:cbse|tnm|classroom)-(\d+)-/i.exec(job.where);
  if (!match || !phases.has(Number(match[1])) || !["malar", "kani"].includes(job.teacher)) continue;
  const grade = Number(match[1]);
  let list = byGrade.get(grade);
  if (!list) { list = []; byGrade.set(grade, list); }
  list.push(job);
}
for (const [grade, list] of phases) {
  const row = rows.get(grade)!;
  for (const job of byGrade.get(grade) ?? []) {
    const text = speechText(job.text, "en");
    if (!text) continue;
    const key = audioKey({ lang: "en", ...config, text });
    if (keys.has(key)) continue;
    keys.add(key);
    if (has(published, live, key)) { row.live++; continue; }
    if (!/[a-z]/i.test(text) && /\p{Script=Tamil}/u.test(text)) {
      exceptions.push({ where: job.where, reason: "tamil-in-english-field", length: text.length });
      continue;
    }
    if (has(staged, stage, key, text)) row.staged++;
    else row.missing++;
    list.push(job.text);
  }
  const dir = join(root, "grade-" + grade);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "worked-step-lines.json"), JSON.stringify(list));
}
const report = { checkedAt: new Date().toISOString(), total: keys.size,
  phases: [...rows].map(([grade, row]) => ({ grade, ...row })), exceptions };
writeFileSync(join(root, "coverage.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ total: report.total, phases: report.phases, exceptionCount: exceptions.length }));
