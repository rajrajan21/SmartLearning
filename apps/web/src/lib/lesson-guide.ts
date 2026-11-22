import { store } from "./storage";

const key = "ss_lesson_guide_v1";
const limit = 3;
interface GuideState {
  dismissed: boolean;
  chapters: string[];
  lessons: string[];
}

function readGuide(): GuideState {
  const saved = store.getJson<GuideState>(key);
  return {
    dismissed: saved?.dismissed === true,
    chapters: Array.isArray(saved?.chapters) ? saved.chapters : [],
    lessons: Array.isArray(saved?.lessons) ? saved.lessons : [],
  };
}

export function shouldOfferLessonGuide(chapter: string, progressCount: number) {
  const state = readGuide();
  return !state.dismissed && progressCount < limit && state.lessons.length < limit &&
    state.chapters.length < limit && !state.chapters.includes(chapter);
}

export function recordGuideImpression(chapter: string) {
  const state = readGuide();
  if (!state.chapters.includes(chapter) && state.chapters.length < limit) {
    store.setJson(key, { ...state, chapters: [...state.chapters, chapter] });
  }
}

export function recordLessonOpened(lesson: string) {
  const state = readGuide();
  if (!state.dismissed && !state.lessons.includes(lesson) && state.lessons.length < limit) {
    store.setJson(key, { ...state, lessons: [...state.lessons, lesson] });
  }
}

export function dismissLessonGuide() {
  store.setJson(key, { ...readGuide(), dismissed: true });
}
