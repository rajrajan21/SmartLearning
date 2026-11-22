import { isDeepStrictEqual } from "node:util";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const app = "/opt/studysmart";
const { ClassroomLesson, LessonImport, QuestionImport, composeClassroom, sceneAt } = await import(app + "/packages/shared/src/index.ts");
const { speechText } = await import(app + "/apps/api/src/modules/audio/manifest.ts");
const [packet] = process.argv.slice(2);
if (!packet) throw Error("Specify the map packet");
const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const names = readdirSync(packet).filter(name => name.endsWith(".json"));
if (!names.length) throw Error("No map inserts in the packet");
// These obsolete timeline beats contain truncated narration or historical errors.
const removeTimeline = new Map([
  ["new-beginnings-cities-and-states", ["d4"]],
  ["empires-and-kingdoms-6th-to-10th-centuries", ["d3", "d4"]],
  ["turning-tides-11th-and-12th-centuries", ["d1", "d2", "d3", "d4"]],
]);
for (const name of names) {
  const stem = name.replace(/^auto-/, "");
  if (!/^cbse-[67]-social-science-[a-z0-9-]+-whole-chapter\.json$/.test(stem)) throw Error("Unexpected map filename " + name);
  const insert = ClassroomLesson.parse(read(join(packet, name)));
  const { board, classLevel, subject, chapter, topic } = insert;
  const meta = { board, classLevel, subject, chapter, topic };
  const inputs = LessonImport.parse(read(join(app, "content/lessons", stem)));
  if (insert.status !== "published" || Object.entries(meta).some(([key, value]) => inputs[key] !== value)) throw Error("Map does not match lesson " + name);
  const previousIDs = new Set<string>();
  const previous = [stem, "auto-" + stem].map(file => join(app, "content/classroom", file)).find(existsSync);
  if (previous) {
    const old = ClassroomLesson.parse(read(previous));
    const byId = new Map(insert.steps.map(step => [step.id, step]));
    const removed = classLevel === 7 ? removeTimeline.get(chapter) ?? [] : [];
    for (const step of old.steps) {
      previousIDs.add(step.id);
      if (removed.includes(step.id) && !byId.has(step.id)) continue;
      if (!isDeepStrictEqual(byId.get(step.id), step)) throw Error("Existing insert step changed: " + name + " " + step.id);
    }
  }
  const added = insert.steps.filter(step => !previousIDs.has(step.id));
  if (!added.length) throw Error("No new mapped steps for " + name);
  const questions = QuestionImport.parse(read(join(app, "content/questions", stem))).questions;
  const composed = ClassroomLesson.parse(composeClassroom({ meta, lesson: inputs.lesson, questions, insert }));
  for (const step of added) {
    const narration = speechText(step.narration.en, "en");
    if (narration.length > 480) throw Error("Narration too long in " + name + " " + step.id);
    const index = composed.steps.findIndex(item => item.narration.en === step.narration.en);
    if (index < 0) throw Error("A new map step did not reach the composed lesson " + name);
    sceneAt(composed, index, 99999, { durMs: 5000 });
  }
  console.log(JSON.stringify({ name, added: added.length, composed: composed.steps.length }));
}
