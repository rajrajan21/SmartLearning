import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const curriculumDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/curriculum");
export const lessonsDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/lessons");
export const audioDir = process.env.AUDIO_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/audio");
export const questionsDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/questions");
export const classroomDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/classroom");
export const booksDir = process.env.BOOKS_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/books");
/** GK (General Knowledge): lessons, puzzles and categories. */
export const gkDir = process.env.GK_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/gk");
export const papersDir = process.env.PAPERS_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/papers");
/** E-Library: the small catalogue (kept in git) and the big book files (never in git; copy them to the server with Upload-Library-To-Server.bat). */
export const libraryCatalog = process.env.LIBRARY_CATALOG ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../content/library/catalog.json");
export const libraryDir = process.env.LIBRARY_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/library");

/** Social auto-poster: ledger, rotation memory, run log, built media and the saved Meta keys (never in git). */
export const socialDir = process.env.SOCIAL_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/social");
/** "Contribute to the E-Library": quarantine folder (never served), submissions, reports and the books people sent in (never in git). */
export const contribDir = process.env.CONTRIB_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../../data/contrib");
