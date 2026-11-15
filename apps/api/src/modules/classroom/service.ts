import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ClassroomLesson, type ClassroomIndex, type PublicClassroom } from "@studysmart/shared";
import type { AudioStore } from "../audio/manifest.js";

export interface ClassroomService {
  index(): ClassroomIndex;
  get(board: string, classLevel: number, subject: string, chapter: string, topic: string): PublicClassroom | null;
}

/** Reads content/classroom/*.json (re-read when a file changes), keeps published ones, and adds the recorded voice to every spoken part. */
export function createClassroomService(dir: string, audio?: AudioStore): ClassroomService {
  let stamp = "", cache: ClassroomLesson[] = [];
  const load = () => {
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : [];
    const s = files.map((f) => `${f}:${statSync(join(dir, f)).mtimeMs}`).join("|");
    if (s !== stamp) {
      stamp = s;
      cache = [];
      for (const f of files) {
        const r = ClassroomLesson.safeParse(JSON.parse(readFileSync(join(dir, f), "utf8")));
        if (r.success && r.data.status === "published") cache.push(r.data);
        else if (!r.success) console.warn(`classroom: skipped ${f}: ${r.error.issues[0]?.message}`);
      }
    }
    return cache;
  };
  const withAudio = (l: ClassroomLesson): PublicClassroom => ({
    ...l,
    steps: l.steps.map((st) => ({
      ...st,
      audio: audio?.refs("malar", st.narration),
      checkAudio: st.check ? { stem: audio?.refs("malar", st.check.stem), explanation: audio?.refs("malar", st.check.explanation) } : undefined,
    })),
  });
  return {
    index: () => ({ items: load().map((l) => ({ board: l.board, classLevel: l.classLevel, subject: l.subject, chapter: l.chapter, topic: l.topic, title: l.title, steps: l.steps.length })) }),
    get: (board, classLevel, subject, chapter, topic) => {
      const l = load().find((x) => x.board.toLowerCase() === board.toLowerCase() && x.classLevel === classLevel && x.subject === subject && x.chapter === chapter && x.topic === topic);
      return l ? withAudio(l) : null;
    },
  };
}
