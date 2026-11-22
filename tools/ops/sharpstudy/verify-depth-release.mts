import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";

const app = "/opt/studysmart";
const live = "/srv/studysmart/audio";
const dir = join(app, "content");
const { createAudioStore } = await import(app + "/apps/api/src/modules/audio/manifest.ts");
const { createClassroomService } = await import(app + "/apps/api/src/modules/classroom/service.ts");
const audio = createAudioStore({
  manifestPath: join(live, "manifest.json"),
  voicesPath: join(live, "voices.json"),
  phrasesPath: join(live, "phrases.json"),
  filesDir: join(live, "files"),
});
const service = createClassroomService({
  lessonsDir: join(dir, "lessons"),
  questionsDir: join(dir, "questions"),
  classroomDir: join(dir, "classroom"),
}, audio);
const names = process.argv.slice(2);
if (!names.length) throw Error("No released lesson paths provided");
const samples = new Map<number, string>();
const verified = new Set<string>();
let playable = 0;
for (const name of names) {
  const doc = JSON.parse(readFileSync(join(app, name), "utf8"));
  const key = [doc.board, doc.classLevel, doc.subject, doc.chapter, doc.topic].join("|");
  if (verified.has(key)) continue;
  verified.add(key);
  const board = service.get(doc.board, doc.classLevel, doc.subject, doc.chapter, doc.topic, "kani");
  if (board?.voiceUsed !== "kani" || !board.steps.length) throw Error("Lakshmi is unavailable for " + name);
  for (const step of board.steps) {
    const url = step.audio?.en?.url;
    if (!url || !audio.filePath(basename(url))) throw Error("Missing recording for " + name + " " + step.id);
    samples.set(doc.classLevel, basename(url));
    playable++;
  }
}
for (const file of samples.values()) {
  const duration = Number(execFileSync("/home/ubuntu/sharpstudy-audio-worker/.venv/bin/python", [
    "-c", "import miniaudio, sys; a=miniaudio.decode_file(sys.argv[1]); print(a.num_frames/a.sample_rate)",
    join(live, "files", file),
  ], { encoding: "utf8" }).trim());
  if (!(duration > 0)) throw Error("Recording could not be decoded");
}
console.log(JSON.stringify({ lessons: verified.size, playableSteps: playable, sampledGrades: [...samples.keys()] }));
