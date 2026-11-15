import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { ClassroomIndex, ClassroomLesson, PublicClassroom } from "@studysmart/shared";
import type { AudioStore } from "../audio/manifest.js";
import { composeAll } from "./compose-all.js";

export interface ClassroomService {
  index(): ClassroomIndex;
  get(board: string, classLevel: number, subject: string, chapter: string, topic: string, voice?: string): PublicClassroom | null;
}
export interface ClassroomDirs { lessonsDir: string; questionsDir?: string; classroomDir?: string }

const DEFAULT_VOICE = "malar";
const stampOf = (dirs: ClassroomDirs) => [dirs.lessonsDir, dirs.questionsDir, dirs.classroomDir].map((d) => (d && existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".json")).sort().map((f) => `${f}:${statSync(join(d, f)).mtimeMs}`).join("|") : "")).join("#");

/** Whole-lesson classroom boards, built from the lessons (re-built when a file changes), with the recorded voice added for the chosen teacher. */
export function createClassroomService(dirs: ClassroomDirs, audio?: AudioStore): ClassroomService {
  let stamp = "", cache: ClassroomLesson[] = [];
  const load = () => { const s = stampOf(dirs); if (s !== stamp) { stamp = s; cache = composeAll(dirs); } return cache; };
  const withAudio = (l: ClassroomLesson, voice: string): PublicClassroom => ({
    ...l,
    steps: l.steps.map((st) => ({
      ...st,
      audio: audio?.refs(voice, st.narration),
      checkAudio: st.check ? { stem: audio?.refs(voice, st.check.stem), explanation: audio?.refs(voice, st.check.explanation) } : undefined,
    })),
  });
  const words = (l: ClassroomLesson) => l.steps.reduce((n, s) => n + s.narration.en.split(/\s+/).length + (s.check ? s.check.stem.en.split(/\s+/).length : 0), 0);
  return {
    index() {
      const all = load(), first = all[0];
      const voices = (audio?.teachers() ?? []).map((t) => ({ ...t, ready: !!first && !!audio?.refs(t.id, first.steps[0]!.narration) }));
      return {
        voices, defaultVoice: DEFAULT_VOICE,
        items: all.map((l) => ({ board: l.board, classLevel: l.classLevel, subject: l.subject, chapter: l.chapter, topic: l.topic, title: l.title, steps: l.steps.length, minutes: Math.max(1, Math.round((words(l) * 0.43) / 60)) })),
      };
    },
    get(board, classLevel, subject, chapter, topic, voice) {
      const l = load().find((x) => x.board.toLowerCase() === board.toLowerCase() && x.classLevel === classLevel && x.subject === subject && x.chapter === chapter && x.topic === topic);
      if (!l) return null;
      const ok = (audio?.teachers() ?? []).some((t) => t.id === voice);
      return withAudio(l, ok ? voice! : DEFAULT_VOICE);
    },
  };
}
