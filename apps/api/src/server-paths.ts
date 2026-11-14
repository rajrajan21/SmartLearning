import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const curriculumDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/curriculum");
export const lessonsDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/lessons");
export const audioDir = process.env.AUDIO_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/audio");
export const questionsDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/questions");
