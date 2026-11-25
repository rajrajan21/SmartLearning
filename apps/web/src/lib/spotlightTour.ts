import { store } from "./storage";
import { dismissLessonGuide } from "./lesson-guide";

export type TourPageType = "home" | "subject" | "chapter" | "lesson" | "results";

export interface TourStep {
  id: string;
  selector: string;
  title: { en: string; ta?: string };
  body: { en: string; ta?: string };
  placement?: "top" | "bottom" | "auto";
}

export interface HelpQuickJump {
  id: string;
  href: string;
  icon: string;
  label: string;
}

const STORAGE_KEY = "ss_spotlight_tour_v1";
const SESSION_KEY = "ss_spotlight_auto_count_v1";

interface TourStorageState {
  seen: Partial<Record<TourPageType, boolean>>;
}

let memorySessionCount = 0;
let classroomAudioActive = false;

function readState(): TourStorageState {
  const saved = store.getJson<TourStorageState>(STORAGE_KEY);
  return {
    seen: saved?.seen && typeof saved.seen === "object" ? saved.seen : {},
  };
}

export function isTourDismissed(pageType: TourPageType): boolean {
  return readState().seen[pageType] === true;
}

export function markTourDismissed(pageType: TourPageType): void {
  const current = readState();
  store.setJson(STORAGE_KEY, {
    seen: { ...current.seen, [pageType]: true },
  });
  if (pageType === "chapter") {
    dismissLessonGuide();
  }
}

export function getSessionAutoCount(): number {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (raw === null) return memorySessionCount;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : memorySessionCount;
  } catch {
    return memorySessionCount;
  }
}

export function incrementSessionAutoCount(): number {
  const next = getSessionAutoCount() + 1;
  memorySessionCount = next;
  try {
    window.sessionStorage.setItem(SESSION_KEY, String(next));
  } catch {
    /* sessionStorage may be blocked */
  }
  return next;
}

export function resetSpotlightTourState(): void {
  memorySessionCount = 0;
  classroomAudioActive = false;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    if (typeof document !== "undefined") {
      delete document.documentElement.dataset.classroomPlaying;
    }
  } catch {
    /* ignore */
  }
}

export function setClassroomAudioPlaying(active: boolean): void {
  classroomAudioActive = active;
  if (typeof document !== "undefined") {
    if (active) document.documentElement.dataset.classroomPlaying = "true";
    else delete document.documentElement.dataset.classroomPlaying;
  }
}

export function isClassroomAudioPlaying(): boolean {
  if (classroomAudioActive) return true;
  if (typeof document !== "undefined" && document.documentElement.dataset.classroomPlaying === "true") return true;
  if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis?.speaking) return true;
  return false;
}

export interface AutoOpenCheck {
  pageType: TourPageType;
  tourEnabled: boolean;
  pageEnabled: boolean;
  autoOpen: boolean;
  maxAutoPerSession: number;
  isPreview?: boolean;
  isMaintenance?: boolean;
  audioPlaying?: boolean;
}

export function canAutoOpenTour(opts: AutoOpenCheck): boolean {
  if (!opts.tourEnabled || !opts.pageEnabled || !opts.autoOpen) return false;
  if (opts.maxAutoPerSession <= 0) return false;
  if (opts.isPreview || opts.isMaintenance) return false;
  if (opts.audioPlaying ?? isClassroomAudioPlaying()) return false;
  if (isTourDismissed(opts.pageType)) return false;
  if (getSessionAutoCount() >= opts.maxAutoPerSession) return false;
  return true;
}

export function pageSettingKey(pageType: TourPageType): string {
  return `ux.spotlightTour.pages.${pageType}`;
}

const TOURS: Record<TourPageType, TourStep[]> = {
  chapter: [
    {
      id: "chapter-topics",
      selector: '[data-tour="chapter-topics"], .chapter-topics, #chapter-first-lesson',
      title: { en: "Start with Topics", ta: "தலைப்புகளிலிருந்து தொடங்கு" },
      body: {
        en: "Pick any topic below to open its interactive lesson. Green ticks track every topic you finish.",
        ta: "கீழே உள்ள எந்தத் தலைப்பையும் தொட்டு பாடத்தைத் தொடங்குங்கள். முடித்த தலைப்புகளுக்கு பச்சை குறி வரும்.",
      },
    },
    {
      id: "chapter-practice",
      selector: '[data-tour="chapter-practice"], .mindmap, .syllabus, .chapter-topic-link',
      title: { en: "Practice & Revise", ta: "பயிற்சியும் மீள்பார்வையும்" },
      body: {
        en: "Open any topic or the chapter map to practise rounds, earn stars, and review tricky ideas.",
        ta: "தலைப்பு அல்லது பாட வரைபடத்தைத் திறந்து பயிற்சி செய்து நட்சத்திரங்கள் பெறுங்கள்.",
      },
    },
    {
      id: "chapter-tools",
      selector: '[data-tour="chapter-tools"]',
      title: { en: "Chapter Test, Worksheets & Games", ta: "பாடத் தேர்வு, பணித்தாள் & விளையாட்டு" },
      body: {
        en: "Take the timed Chapter test, print a Worksheet, or play Quick Fire and Three Lives to check your mastery.",
        ta: "பாடத் தேர்வு எழுதலாம், பணித்தாளை அச்சிடலாம், அல்லது விரைவு விளையாட்டுகள் ஆடலாம்.",
      },
    },
    {
      id: "chapter-pager",
      selector: '[data-tour="chapter-pager"], .pager',
      title: { en: "Move to Next Chapter", ta: "அடுத்த பாடத்திற்குச் செல்" },
      body: {
        en: "Once you feel confident, jump straight to the next chapter using this navigation bar.",
        ta: "இந்தப் பாடம் முடிந்ததும், கீழுள்ள இணைப்பால் நேராக அடுத்த பாடத்திற்குச் செல்லலாம்.",
      },
    },
  ],
  lesson: [
    {
      id: "lesson-timeline",
      selector: '[data-tour="lesson-timeline"], .class-rail, .lesson-timeline',
      title: { en: "Phase Pills & Timeline Seek", ta: "பகுதிகளும் காலக்கோடும்" },
      body: {
        en: "Tap any section pill or drag the timeline slider to jump directly to a part or replay any moment.",
        ta: "எந்தப் பகுதிக்கும் தாவ அல்லது ஒரு பகுதியை மீண்டும் கேட்க காலக்கோட்டை இழுக்கவும்.",
      },
    },
    {
      id: "lesson-controls",
      selector: '[data-tour="lesson-controls"], .class-controls, .narr-controls',
      title: { en: "0.85× Speed & Teacher Voice", ta: "0.85× வேகம் & ஆசிரியர் குரல்" },
      body: {
        en: "Slow narration to 0.85× for tricky steps, pick a recorded teacher voice, or switch on English + Tamil captions.",
        ta: "கடினமான படிகளுக்கு 0.85× வேகத்தைத் தேர்ந்தெடுத்து, ஆசிரியர் குரல் மற்றும் தமிழ் வசனங்களை இயக்கலாம்.",
      },
    },
    {
      id: "lesson-done",
      selector: '[data-tour="lesson-stage"], .class-stage, .lesson-nav',
      title: { en: "Done Screen Next Steps", ta: "முடிவுத் திரையின் அடுத்த படிகள்" },
      body: {
        en: "When the lesson finishes, Start practice, Chapter test, Worksheet, and Next lesson appear right inside the window.",
        ta: "பாடம் முடிந்ததும் பயிற்சி, பாடத் தேர்வு, பணித்தாள் மற்றும் அடுத்த பாடம் இங்கேயே தோன்றும்.",
      },
    },
  ],
  subject: [
    {
      id: "subject-progress",
      selector: '[data-tour="subject-progress"], .journey, .course-map, .chapters',
      title: { en: "Chapter Progress", ta: "பாட முன்னேற்றம்" },
      body: {
        en: "Progress rings and colours show at a glance which chapters are complete, in progress, or ready to start.",
        ta: "நிறங்களும் முன்னேற்ற வளையங்களும் முடித்த மற்றும் தொடர வேண்டிய பாடங்களைக் காட்டும்.",
      },
    },
    {
      id: "subject-filter",
      selector: '[data-tour="subject-filter"], .filter-box',
      title: { en: "Filter & Search", ta: "வடிகட்டித் தேடு" },
      body: {
        en: "Type any chapter or topic keyword here to find the exact lesson in seconds.",
        ta: "எந்தப் பாடம் அல்லது தலைப்பையும் இங்கே தட்டச்சு செய்து உடனே கண்டறியலாம்.",
      },
    },
    {
      id: "subject-paths",
      selector: '[data-tour="subject-paths"]',
      title: { en: "Term Papers & Study Path", ta: "பருவத் தேர்வுத்தாள்கள் & கற்றல் பாதை" },
      body: {
        en: "Generate printable Term papers for exam revision or open the Study Path to see how topics build across classes.",
        ta: "தேர்வு பயிற்சிக்கு பருவத் தேர்வுத்தாள்களையும், வகுப்புகள் வழிப் பாதையையும் இங்கே திறக்கலாம்.",
      },
    },
  ],
  results: [
    {
      id: "results-review",
      selector: '[data-tour="results-review"], .review, .roundend',
      title: { en: "Explanations & Mistakes Review", ta: "விளக்கங்களும் தவறு திருத்தமும்" },
      body: {
        en: "Read each answer explanation and retry missed questions so tricky concepts stick.",
        ta: "ஒவ்வொரு பதிலின் விளக்கத்தையும் படித்து, தவறிய கேள்விகளை மீண்டும் முயற்சிக்கவும்.",
      },
    },
    {
      id: "results-next",
      selector: '[data-tour="results-next"], .lesson-next, .roundend .actions',
      title: { en: "Next-Step Jump", ta: "அடுத்த படிக்குத் தாவு" },
      body: {
        en: "Jump directly to the next round, take the Chapter test, or move ahead to the Next chapter.",
        ta: "அடுத்த சுற்று, பாடத் தேர்வு அல்லது அடுத்த பாடத்திற்கு ஒரே தொடுதலில் செல்லலாம்.",
      },
    },
  ],
  home: [
    {
      id: "home-pickers",
      selector: '[data-tour="home-pickers"], .preset-classes, .classes, .preset-boards',
      title: { en: "Board & Class Picker", ta: "பாடத்திட்டம் & வகுப்பு தேர்வு" },
      body: {
        en: "Choose your school board (CBSE, Matric, or State Board) and tap your class to open subjects.",
        ta: "உங்கள் பாடத்திட்டத்தையும் வகுப்பையும் தேர்ந்தெடுத்து பாடங்களைத் திறக்கவும்.",
      },
    },
    {
      id: "home-today",
      selector: '[data-tour="home-today"], .preset-today, .daily, .continue-card',
      title: { en: "Today's Study Widgets", ta: "இன்றைய கற்றல் கருவிகள்" },
      body: {
        en: "Use Today's short session, Daily GK, and Puzzle of the day to build a steady daily streak.",
        ta: "இன்றைய சிறு பயிற்சி, தினசரி GK மற்றும் புதிர் மூலம் உங்கள் தொடர்ச்சியை வளர்க்கலாம்.",
      },
    },
    {
      id: "home-library-papers",
      selector: '[data-tour="home-library-papers"], .quick',
      title: { en: "E-Library & Question Papers", ta: "மின்-நூலகம் & வினாத்தாள்கள்" },
      body: {
        en: "Explore free E-Library books, downloadable Textbooks, and real Question papers from these shortcuts.",
        ta: "இலவச மின்-நூலகப் புத்தகங்கள், பாடநூல்கள் மற்றும் வினாத்தாள்களை இங்கிருந்து திறக்கலாம்.",
      },
    },
  ],
};

export function getTourSteps(pageType: TourPageType): TourStep[] {
  return TOURS[pageType];
}
