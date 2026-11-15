import { z } from "zod";
import { SITE } from "./site.js";
import { CUSTOM_PALETTE, DEFAULT_PALETTE, DEFAULT_THEME, PALETTES, THEMES } from "./look.js";

/**
 * Platform settings registry. EVERY configurable thing on the site is declared here once:
 * type, limits, default, who may read it (public or admin-only) and which admin panel shows it.
 * The admin page is generated from this list, and each module adds its own settings when it ships.
 */
export type SettingValue = boolean | number | string | number[] | { en: string; ta?: string };

interface Base {
  key: string;
  panel: PanelId;
  section: string;
  label: string;
  help?: string;
  /** true = sent to every visitor's browser (never put anything private here) */
  public: boolean;
  /** "planned" = the module is not built yet; shown in the admin page but cannot be changed */
  availability?: "live" | "planned";
  /** only active while this boolean setting is on */
  dependsOn?: string;
}
export type SettingDef = Base &
  (
    | { type: "boolean"; default: boolean }
    | { type: "number"; default: number; min: number; max: number; step?: number; unit?: string }
    | { type: "select"; default: string; options: { value: string; label: string }[] }
    | { type: "color"; default: string; contrastAgainst?: string }
    | { type: "text"; default: string; maxLength: number }
    | { type: "localized"; default: { en: string; ta?: string }; maxLength: number; multiline?: boolean }
    | { type: "numberlist"; default: number[]; options: number[] }
  );

export type PanelId = "features" | "lessons" | "practice" | "theme" | "home" | "languages" | "catalog" | "site" | "accounts" | "mastery" | "tutor" | "parent" | "tests" | "pages" | "classroom" | "layout" | "app" | "access" | "textbooks";
export const PANELS: { id: PanelId; label: string; help: string }[] = [
  { id: "features", label: "Features", help: "Switch whole parts of the site on or off." },
  { id: "lessons", label: "Lessons", help: "How lessons play, save progress and reveal." },
  { id: "practice", label: "Practice", help: "Practice rounds, hints, pass marks and feedback." },
  { id: "theme", label: "Look and feel", help: "Colours, fonts, sizes and style presets." },
  { id: "layout", label: "Layout and navigation", help: "Phone tab bar, text-size buttons, the home dashboard, daily streak and the look of subject and chapter lists." },
  { id: "app", label: "Phone app view", help: "The app-style view that phones get automatically: swipe feed, big tab bar, bottom sheets, dark mode, install button." },
  { id: "home", label: "Home page", help: "What visitors see first." },
  { id: "languages", label: "Languages", help: "Tamil and English behaviour." },
  { id: "catalog", label: "Classes and boards", help: "Which classes and boards are open to students." },
  { id: "accounts", label: "Accounts", help: "Parent sign-in, child profiles and saving progress across devices." },
  { id: "mastery", label: "Mastery and revision", help: "How progress is measured and how old questions come back to be remembered." },
  { id: "tutor", label: "Ask the teacher", help: "The question helper: where it appears, daily limits and safety." },
  { id: "parent", label: "Parent dashboard", help: "What parents can see about their children and download." },
  { id: "classroom", label: "Classroom boards", help: "Animated board lessons: the teacher talks while the board draws, writes and turns 3D shapes step by step." },
  { id: "textbooks", label: "Textbooks", help: "The book reader for the school textbooks you downloaded: which reader look students get, read aloud, download and print." },
  { id: "tests", label: "Tests, worksheets and games", help: "Timed chapter tests, printable worksheets and quick games built from the practice questions." },
  { id: "pages", label: "Privacy, terms and about", help: "The text of the privacy, terms and about pages, and the links in the footer." },
  { id: "access", label: "Site access", help: "Open to everyone, or invitation only: visitors must enter an invite code before they can see anything. Create and cancel codes on this page." },
  { id: "site", label: "Site and performance", help: "Maintenance mode, caching and search limits." },
];

const bool = (key: string, panel: PanelId, section: string, label: string, def: boolean, o: Partial<Base> = {}): SettingDef =>
  ({ key, panel, section, label, public: true, type: "boolean", default: def, ...o }) as SettingDef;
const color = (key: string, label: string, def: string, section: string, o: Partial<Base> & { contrastAgainst?: string } = {}): SettingDef =>
  ({ key, panel: "theme", section, label, public: true, type: "color", default: def, ...o }) as SettingDef;
const planned = (key: string, label: string, help: string): SettingDef =>
  bool(key, "features", "Coming in later modules", label, false, { help, availability: "planned" });

export const SETTINGS: SettingDef[] = [
  // ---------------- Features ----------------
  bool("feature.browse", "features", "Learning", "Browse classes, subjects and chapters", true, { help: "The main curriculum browser." }),
  bool("feature.search", "features", "Learning", "Search", true, { help: "Search box for chapters and topics." }),
  bool("feature.breadcrumbs", "features", "Learning", "Breadcrumb trail", true),
  bool("feature.chapterTopics", "features", "Learning", "Show topics and learning goals on chapter pages", true),
  bool("feature.offline", "features", "Reliability", "Work offline (installable app)", true, { help: "Keeps the curriculum available without internet after the first visit." }),
  bool("feature.languageToggle", "features", "Reliability", "Tamil / English switch in the header", true),
  bool("feature.teacherNarration", "features", "Learning", "Teacher voice and board", true, { dependsOn: "feature.lessons", help: "Listen buttons, the teacher's voice and the drawing board inside lessons." }),
  bool("feature.practice", "features", "Learning", "Practice rounds", true, { help: "Four practice rounds on every topic that has questions." }),
  bool("feature.accounts", "features", "Learning", "Parent accounts and child profiles", true, { help: "Lets a parent sign in, add children and keep progress across devices. Students can still learn without signing in." }),
  bool("feature.mastery", "features", "Learning", "Mastery and daily revision", true, { help: "Shows how well each topic and chapter is known, and a daily revision set of questions to remember." }),
  bool("feature.aiTutor", "features", "Learning", "Ask the teacher (question helper)", true, { help: "Students can ask Malar Teacher questions about a lesson. Answers come only from that lesson; a language model is used only if a key is set on the server." }),
  bool("feature.parentDashboard", "features", "Learning", "Parent dashboard", true, { dependsOn: "feature.accounts", help: "Signed-in parents see each child's progress, activity and tricky questions, and can print or download a report." }),
  bool("feature.lessons", "features", "Learning", "Lessons", true, { help: "Step-by-step lessons on topic pages. Turn off to hide all lessons." }),
  bool("feature.printView", "features", "Reliability", "Print-friendly chapter list", true),
  bool("feature.exams", "features", "Learning", "Chapter tests", true, { help: "A timed test on a whole chapter, marked at the end with a review of every answer." }),
  bool("feature.sitePages", "features", "Reliability", "Privacy, terms and about pages", true, { help: "Pages and footer links for the privacy notice, terms of use and about text. Edit the wording in the \"Privacy, terms and about\" panel." }),
  bool("feature.worksheets", "features", "Learning", "Printable worksheets", true, { help: "A chapter worksheet to print or write on, with an answer key for signed-in parents." }),
  bool("feature.games", "features", "Learning", "Quick games", true, { help: "Quick Fire and Three Lives games made from a chapter's practice questions." }),
  bool("feature.classroom", "features", "Learning", "Classroom board lessons", true, { help: "Animated board lessons with the teacher's voice, step-by-step writing and 3D shapes." }),
  bool("feature.textbooks", "features", "Learning", "Textbooks (book reader)", true, { help: "Adds a Textbooks entry to every class page and opens the downloaded textbook PDFs in the page-turning reader. Nothing is shown for a class until its books are in content/books (run Download-Books.bat on the server PC)." }),
  planned("feature.adminEmails", "Admin e-mail notifications", "Off by default; added with accounts."),

  // ---------------- Textbooks (book reader) ----------------
  { key: "reader.style", panel: "textbooks", section: "Look", label: "Reader style", public: true, type: "select", default: "c", dependsOn: "feature.textbooks",
    help: "The look every student starts with. All three work the same way (page turning, zoom, read aloud); only the surroundings change.",
    options: [{ value: "a", label: "A Hardcover (a cloth-bound book on a wooden desk)" }, { value: "b", label: "B Digital (bright, flat, with a strip of page thumbnails)" }, { value: "c", label: "C Library (a reading nook with a bookmark ribbon and night reading)" }] },
  bool("reader.allowStylePicker", "textbooks", "Look", "Let readers switch between the three styles", true, { dependsOn: "feature.textbooks", help: "Shows a small A / B / C switch inside the reader so you and the students can try all three. The choice is remembered on that device only. Turn off to keep everyone on the style chosen above." }),
  bool("reader.readAloud", "textbooks", "Read aloud", "Read aloud", true, { dependsOn: "feature.textbooks", help: "Reads the page sentence by sentence with the voice built into the phone or computer, and highlights each sentence on the page. Nothing is sent to any server. Scanned pages that are only pictures cannot be read." }),
  { key: "reader.voiceLang", panel: "textbooks", section: "Read aloud", label: "Preferred voice", public: true, type: "select", default: "en-IN", dependsOn: "reader.readAloud",
    help: "Which voice is picked first for English books. If the device does not have it, the next closest English voice is used. Books marked Tamil always try a Tamil voice first, and the reader can change the voice at any time.",
    options: [{ value: "en-IN", label: "English, Indian accent (then British, then any English)" }, { value: "en-GB", label: "English, British accent" }, { value: "en-US", label: "English, American accent" }, { value: "ta-IN", label: "Tamil (India)" }] },
  bool("reader.tamilVoiceHelp", "textbooks", "Read aloud", "Explain how to install a Tamil voice when the device has none", true, { dependsOn: "reader.readAloud", help: "When Tamil is chosen and the device reports no Tamil voice, a help box lists the steps for Android, Windows 11 and iPhone, with a Test voice button." }),
  bool("reader.autoTurn", "textbooks", "Read aloud", "Turn the page by itself while reading aloud", true, { dependsOn: "reader.readAloud", help: "The starting position of the \"Turn the page for me\" tick box. Readers can change it." }),
  { key: "reader.defaultSpeed", panel: "textbooks", section: "Read aloud", label: "Starting reading speed", public: true, type: "number", default: 0.9, min: 0.5, max: 1.5, step: 0.1, unit: "x", dependsOn: "reader.readAloud", help: "1 is the normal speed of the voice. 0.9 is a little slower, which suits young readers. Each reader's own choice is remembered on their device." },
  bool("reader.showDownload", "textbooks", "Buttons", "Show the Download PDF button", true, { dependsOn: "feature.textbooks", help: "Lets readers save the whole textbook PDF to their device." }),
  bool("reader.showPrint", "textbooks", "Buttons", "Show the Print button", true, { dependsOn: "feature.textbooks", help: "Readers choose between printing the two pages they are looking at or the whole book." }),

  // ---------------- Classroom ----------------
  bool("classroom.autoAdvance", "classroom", "Playing", "Move on to the next step by itself", true, { dependsOn: "feature.classroom", help: "When off, students press Next after each step." }),
  { key: "classroom.stepPauseMs", panel: "classroom", section: "Playing", label: "Pause between steps", public: true, type: "number", default: 350, min: 0, max: 5000, step: 100, unit: "ms", dependsOn: "classroom.autoAdvance" },
  { key: "classroom.speed", panel: "classroom", section: "Playing", label: "Starting speed", public: true, type: "select", default: "1", dependsOn: "feature.classroom",
    options: [{ value: "0.75", label: "Slower" }, { value: "1", label: "Normal" }, { value: "1.25", label: "Faster" }] },
  bool("classroom.showCaptions", "classroom", "Playing", "Show the teacher's words as captions", true, { dependsOn: "feature.classroom" }),
  bool("classroom.show3d", "classroom", "Board", "Show 3D shapes", true, { dependsOn: "feature.classroom", help: "Drawn by the site itself. Turn off for very old phones; flat drawings are shown instead." }),
  { key: "classroom.boardStyle", panel: "classroom", section: "Board", label: "Board look", public: true, type: "select", default: "white", dependsOn: "feature.classroom",
    options: [{ value: "chalk", label: "Green chalkboard" }, { value: "white", label: "Whiteboard" }] },
  bool("classroom.voicePicker", "classroom", "Voice", "Let students choose the teacher voice", true, { dependsOn: "feature.classroom", help: "Shows a list of teacher voices (woman or man, American, British or Indian accent). Voices that have not been recorded yet are greyed out." }),
  { key: "classroom.language", panel: "classroom", section: "Voice", label: "Language", public: true, type: "select", default: "en", dependsOn: "feature.classroom",
    options: [{ value: "en", label: "English only" }, { value: "both", label: "English, then Tamil (where Tamil is recorded)" }] },
  bool("classroom.browserVoice", "classroom", "Voice", "Use the browser voice when no recording exists", false, { dependsOn: "feature.classroom", help: "Off by default: the browser voice is often a man's voice and does not match the teacher. Recorded teacher audio is always used first." }),

  // ---------------- Lessons ----------------
  bool("lesson.preferClassroom", "lessons", "Playing", "Open the picture classroom first", true, { dependsOn: "feature.lessons", help: "When a lesson has a picture classroom (big window with drawings, 3D shapes and subtitles), the Start lesson button and lesson links open it. The one-step-at-a-time view stays available as \"Read it step by step\"." }),
  { key: "lesson.mode", panel: "lessons", section: "Playing", label: "How a lesson is shown", public: true, type: "select", default: "steps", dependsOn: "feature.lessons",
    options: [{ value: "steps", label: "One step at a time (best for young children)" }, { value: "scroll", label: "Everything on one scrolling page" }] },
  bool("lesson.progress.bar", "lessons", "Playing", "Show a progress bar", true, { dependsOn: "feature.lessons" }),
  bool("lesson.keyboard", "lessons", "Playing", "Arrow keys move between steps", true, { dependsOn: "feature.lessons" }),
  bool("lesson.progress.save", "lessons", "Progress", "Remember where each student stopped (on this device)", true, { dependsOn: "feature.lessons", help: "Saved in the browser only. Accounts in a later module will keep it across devices." }),
  bool("lesson.progress.showTicks", "lessons", "Progress", "Show a tick next to finished topics", true, { dependsOn: "feature.lessons" }),
  bool("lesson.example.stepByStep", "lessons", "Content", "Reveal worked-example steps one at a time", true, { dependsOn: "feature.lessons" }),
  bool("lesson.example.showWhy", "lessons", "Content", "Show the 'why' under each worked-example step", true, { dependsOn: "feature.lessons" }),
  bool("lesson.narration.showText", "lessons", "Content", "Show the teacher's words as text", true, { dependsOn: "feature.lessons", help: "Voice arrives with Malar Teacher in a later module; text stays useful for reading and for the deaf." }),
  bool("lesson.teachBack.show", "lessons", "Content", "Include 'explain it yourself' activities", true, { dependsOn: "feature.lessons" }),
  bool("lesson.celebrate", "lessons", "Finish", "Show a celebration when a lesson is finished", true, { dependsOn: "feature.lessons" }),
  { key: "lesson.complete.message", panel: "lessons", section: "Finish", label: "Message after finishing", public: true, type: "localized", maxLength: 120, multiline: true, dependsOn: "feature.lessons",
    default: { en: "Well done! You finished this lesson.", ta: "நன்று! இந்தப் பாடத்தை முடித்துவிட்டீர்கள்." } },

  { key: "narration.teacherName", panel: "lessons", section: "Teacher voice", label: "Teacher name shown to students", public: true, type: "localized", maxLength: 30, dependsOn: "feature.teacherNarration", default: { en: "Malar Teacher", ta: "மலர் டீச்சர்" } },
  bool("narration.autoAdvance", "lessons", "Teacher voice", "Play the next sentence automatically", true, { dependsOn: "feature.teacherNarration" }),
  bool("narration.highlight", "lessons", "Teacher voice", "Highlight the sentence and word being spoken", true, { dependsOn: "feature.teacherNarration" }),
  bool("narration.showBoard", "lessons", "Teacher voice", "Show the teacher's drawing board", true, { dependsOn: "feature.teacherNarration", help: "Shapes and words the teacher writes while speaking." }),
  bool("narration.speedControl", "lessons", "Teacher voice", "Let students change the speaking speed", true, { dependsOn: "feature.teacherNarration" }),
  { key: "narration.defaultSpeed", panel: "lessons", section: "Teacher voice", label: "Starting speed", public: true, type: "select", default: "1", dependsOn: "feature.teacherNarration",
    options: [{ value: "0.8", label: "Slow" }, { value: "1", label: "Normal" }, { value: "1.2", label: "Fast" }] },
  { key: "narration.pauseBetweenMs", panel: "lessons", section: "Teacher voice", label: "Pause between sentences", public: true, type: "number", default: 350, min: 0, max: 2000, step: 50, unit: "ms", dependsOn: "feature.teacherNarration", help: "A short breath after each sentence makes the teacher sound calmer and easier to follow." },
  bool("narration.browserVoice", "lessons", "Teacher voice", "Use the device's own voice when no recorded voice exists", true, { dependsOn: "feature.teacherNarration", help: "Needed for Tamil until recorded Tamil voices are added. Quality depends on the device." }),

  // ---------------- Practice ----------------
  { key: "practice.questionsPerRound", panel: "practice", section: "Rounds", label: "Questions in each round", public: true, type: "number", default: 5, min: 3, max: 15, step: 1, dependsOn: "feature.practice", help: "If a round has fewer questions written, all of them are used." },
  { key: "practice.passMark", panel: "practice", section: "Rounds", label: "Pass mark", public: true, type: "number", default: 70, min: 50, max: 100, step: 5, unit: "%", dependsOn: "feature.practice" },
  { key: "practice.unlock", panel: "practice", section: "Rounds", label: "Opening the next round", public: true, type: "select", default: "sequential", dependsOn: "feature.practice",
    options: [{ value: "sequential", label: "Pass a round to open the next" }, { value: "open", label: "All rounds open from the start" }] },
  bool("practice.shuffleQuestions", "practice", "Rounds", "Mix up the question order", true, { dependsOn: "feature.practice" }),
  bool("practice.shuffleOptions", "practice", "Rounds", "Mix up the answer choices", true, { dependsOn: "feature.practice" }),
  bool("practice.allowRetry", "practice", "Rounds", "Let students try a round again", true, { dependsOn: "feature.practice" }),
  bool("practice.stars", "practice", "Rewards", "Give stars for each round", true, { dependsOn: "feature.practice" }),
  bool("practice.hints.enabled", "practice", "Help", "Allow hints", true, { dependsOn: "feature.practice" }),
  { key: "practice.hints.max", panel: "practice", section: "Help", label: "Most hints per question", public: true, type: "number", default: 2, min: 1, max: 2, step: 1, dependsOn: "practice.hints.enabled" },
  bool("practice.showWhyWrong", "practice", "Help", "Explain why a wrong answer is wrong", true, { dependsOn: "feature.practice", help: "Switch off for a quiz-like feel." }),
  bool("practice.showCorrectAnswer", "practice", "Help", "Show the right answer after a mistake", true, { dependsOn: "feature.practice" }),
  bool("practice.lessonCheckpoints", "practice", "Help", "Show checkpoint questions inside lessons", true, { dependsOn: "feature.practice" }),
  bool("practice.audio.questions", "practice", "Teacher voice", "Let students listen to each question", true, { dependsOn: "feature.practice", help: "Uses the recorded teacher voice when it exists, otherwise the device voice." }),
  bool("practice.audio.feedback", "practice", "Teacher voice", "Teacher speaks the feedback after each answer", true, { dependsOn: "feature.practice", help: "Praise or encouragement, then the explanation. Students can switch it off on their own device." }),

  // ---------------- Accounts ----------------
  bool("accounts.signup", "accounts", "Signing up", "Allow new parents to create accounts", true, { dependsOn: "feature.accounts", help: "Switch off to stop new sign-ups; existing parents can still sign in." }),
  { key: "accounts.passwordMinLength", panel: "accounts", section: "Signing up", label: "Shortest password", public: true, type: "number", default: 8, min: 6, max: 30, step: 1, dependsOn: "feature.accounts" },
  { key: "accounts.maxChildren", panel: "accounts", section: "Signing up", label: "Most children per parent", public: true, type: "number", default: 5, min: 1, max: 10, step: 1, dependsOn: "feature.accounts" },
  { key: "accounts.sessionDays", panel: "accounts", section: "Signing in", label: "Stay signed in for", public: true, type: "number", default: 30, min: 1, max: 365, step: 1, unit: "days", dependsOn: "feature.accounts" },
  bool("accounts.showHeaderLink", "accounts", "Signing in", "Show the account link in the header", true, { dependsOn: "feature.accounts" }),
  { key: "accounts.consentText", panel: "accounts", section: "Privacy", label: "Parent agreement shown when signing up", public: true, type: "localized", maxLength: 400, multiline: true, dependsOn: "feature.accounts",
    default: { en: `I am the parent or guardian. I agree that ${SITE.name} keeps my child's nickname, class and learning progress so it can be saved across devices. I can delete it at any time.`, ta: "நான் பெற்றோர் அல்லது பாதுகாவலர். என் குழந்தையின் புனைப்பெயர், வகுப்பு, கற்றல் முன்னேற்றம் சாதனங்களுக்கிடையே சேமிக்கப்பட இதை ஒப்புக்கொள்கிறேன். நான் எப்போது வேண்டுமானாலும் அழிக்கலாம்." } },

  // ---------------- Mastery and revision ----------------
  bool("mastery.badges", "mastery", "Showing progress", "Show how well each topic is known on chapter pages", true, { dependsOn: "feature.mastery" }),
  bool("mastery.homeCard", "mastery", "Showing progress", "Show the daily revision card on the home page", true, { dependsOn: "feature.mastery" }),
  bool("mastery.progressPage", "mastery", "Showing progress", "Show the 'My progress' page", true, { dependsOn: "feature.mastery" }),
  bool("mastery.revision.enabled", "mastery", "Revision", "Bring questions back for revision", true, { dependsOn: "feature.mastery", help: "Questions answered correctly return after longer and longer gaps; wrong ones return the next day." }),
  { key: "mastery.revision.dailyLimit", panel: "mastery", section: "Revision", label: "Most questions in one revision", public: true, type: "number", default: 10, min: 3, max: 30, step: 1, dependsOn: "mastery.revision.enabled" },
  { key: "mastery.revision.intervals", panel: "mastery", section: "Revision", label: "Days before each question comes back", public: true, type: "numberlist", default: [1, 3, 7, 14, 30], options: [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60], dependsOn: "mastery.revision.enabled", help: "Up to five steps, from the first return to the last (sorted automatically). Fewer steps means the last gap repeats." },

  // ---------------- Ask the teacher ----------------
  bool("tutor.inLessons", "tutor", "Where it appears", "Show 'Ask Malar Teacher' inside lessons", true, { dependsOn: "feature.aiTutor" }),
  bool("tutor.inPractice", "tutor", "Where it appears", "Show 'Ask Malar Teacher' after answering a practice question", true, { dependsOn: "feature.aiTutor" }),
  bool("tutor.useAI", "tutor", "Answers", "Use the AI model when one is set up on the server", true, { dependsOn: "feature.aiTutor", help: "Off = answers are always taken straight from the lesson. Nothing is sent to any AI service when this is off or no key is set." }),
  bool("tutor.showAiNote", "tutor", "Answers", "Tell students when an answer was written by AI", true, { dependsOn: "feature.aiTutor" }),
  { key: "tutor.dailyLimit", panel: "tutor", section: "Limits", label: "AI answers per child per day", public: true, type: "number", default: 20, min: 1, max: 200, step: 1, dependsOn: "tutor.useAI", help: "Protects a free model quota. Answers taken straight from the lesson are not counted." },
  { key: "tutor.maxQuestionChars", panel: "tutor", section: "Limits", label: "Longest question", public: true, type: "number", default: 250, min: 50, max: 500, step: 10, dependsOn: "feature.aiTutor", unit: "characters" },
  bool("tutor.requireSignIn", "tutor", "Limits", "Only signed-in children can ask", false, { dependsOn: "feature.aiTutor", help: "Gives each child their own daily limit. Needs accounts to be on." }),
  { key: "tutor.greeting", panel: "tutor", section: "Wording", label: "Invitation shown above the question box", public: true, type: "localized", maxLength: 100, dependsOn: "feature.aiTutor",
    default: { en: "Stuck? Ask me about this lesson.", ta: "புரியவில்லையா? இந்தப் பாடத்தைப் பற்றி என்னிடம் கேள்." } },


  // ---------------- Tests, worksheets and games ----------------
  { key: "exams.questionCount", panel: "tests", section: "Chapter tests", label: "Questions in a test", public: true, type: "number", default: 10, min: 5, max: 30, step: 1, dependsOn: "feature.exams" },
  bool("exams.timed", "tests", "Chapter tests", "Time limit", true, { dependsOn: "feature.exams", help: "When off, students take as long as they like." }),
  { key: "exams.secondsPerQuestion", panel: "tests", section: "Chapter tests", label: "Time for each question", public: true, type: "number", default: 60, min: 20, max: 300, step: 10, unit: "seconds", dependsOn: "exams.timed" },
  { key: "exams.passPercent", panel: "tests", section: "Chapter tests", label: "Pass mark", public: true, type: "number", default: 60, min: 30, max: 100, step: 5, unit: "%", dependsOn: "feature.exams" },
  bool("exams.allowSkip", "tests", "Chapter tests", "Allow skipping a question", true, { dependsOn: "feature.exams" }),
  bool("exams.showReview", "tests", "Chapter tests", "Show a review of every answer at the end", true, { dependsOn: "feature.exams", help: "Shows the right answer and the explanation for each question after the test is marked." }),
  { key: "worksheets.questionCount", panel: "tests", section: "Worksheets", label: "Questions on a worksheet", public: true, type: "number", default: 10, min: 5, max: 30, step: 1, dependsOn: "feature.worksheets" },
  bool("worksheets.answerKey", "tests", "Worksheets", "Answer key for signed-in parents", true, { dependsOn: "feature.worksheets", help: "Signed-in parents can show the answers beside a worksheet. Students who are not signed in never see them." }),
  bool("worksheets.nameLine", "tests", "Worksheets", "Name and date lines at the top", true, { dependsOn: "feature.worksheets" }),
  { key: "worksheets.footer", panel: "tests", section: "Worksheets", label: "Footer printed on every worksheet", public: true, type: "localized", maxLength: 100, dependsOn: "feature.worksheets", default: { en: `${SITE.domain} · free learning for every child`, ta: `${SITE.domain} · ஒவ்வொரு குழந்தைக்கும் இலவசக் கற்றல்` } },
  bool("games.quickfire", "tests", "Games", "Quick Fire (beat the clock)", true, { dependsOn: "feature.games" }),
  { key: "games.quickfireSeconds", panel: "tests", section: "Games", label: "Quick Fire length", public: true, type: "number", default: 60, min: 30, max: 180, step: 10, unit: "seconds", dependsOn: "games.quickfire" },
  bool("games.survival", "tests", "Games", "Three Lives (keep going until lives run out)", true, { dependsOn: "feature.games" }),
  { key: "games.lives", panel: "tests", section: "Games", label: "Lives", public: true, type: "number", default: 3, min: 1, max: 5, step: 1, dependsOn: "games.survival" },

  // ---------------- Parent dashboard ----------------
  // ---------------- Privacy, terms and about ----------------
  { key: "pages.privacy", panel: "pages", section: "Privacy notice", label: "Privacy notice text", public: true, type: "localized", maxLength: 6000, multiline: true, dependsOn: "feature.sitePages", help: "Separate paragraphs with a blank line. Have the wording checked before launch.", default: { en: `Short version: ${SITE.name} is free, has no adverts and does not sell or share anything about children.\n\nWhat we keep. Children can learn without signing in, and then nothing leaves their device except the answers they check, which are marked on our server without a name. If a parent creates an account we keep: the parent's e-mail address, a scrambled (hashed) password, each child's nickname, class, picture and language, the child's learning progress and answers, and the agreement the parent gave. We never ask for a child's real name, photo, school, phone number or address, and the question helper refuses to take such details.\n\nWhat we do with it. Only to run the site: to save progress across devices, to show parents how their children are doing, and to keep the service safe. We do not show adverts, do not use trackers and do not sell or share data.\n\nCookies and storage. One cookie keeps a parent signed in. The browser also saves progress, settings and downloaded lessons on the device so the site works offline. Neither is used to follow anyone.\n\nThe question helper. When a child asks Malar Teacher a question, the text is checked for personal details and unsafe content. If a language model service is configured for the site, the question and the lesson text it is about may be sent to that service to write an answer, without any name or e-mail address.\n\nYour choices. A parent can download everything we hold about their children and delete a child or the whole account at any time from the Account page. Deleting removes the data.\n\nQuestions or a request about your data: write to the contact address on this page.` } },
  { key: "pages.terms", panel: "pages", section: "Terms of use", label: "Terms of use text", public: true, type: "localized", maxLength: 6000, multiline: true, dependsOn: "feature.sitePages", default: { en: `${SITE.name} is a free learning site for school students. By using it you agree to these simple terms.\n\nLearning only. Lessons and practice are made to help children learn. They are not a replacement for a school, teacher or tutor, and we do our best to be correct but cannot promise there are no mistakes. Tell us if you find one.\n\nChildren. Children under 18 should use the site with a parent or guardian's permission. A parent or guardian creates and looks after the account.\n\nFair use. Do not try to break the site, overload it, or look at other people's accounts. Do not enter personal details about anyone in the question helper.\n\nContent. The lessons, questions and voice on this site belong to ${SITE.name}. You may use them for your own learning and print worksheets for your own class or family, but please do not copy the site or sell its content.\n\nChanges and availability. The site is free and may change, pause or stop. We may update these terms and will show the new version here.` } },
  { key: "pages.about", panel: "pages", section: "About", label: "About text", public: true, type: "localized", maxLength: 3000, multiline: true, dependsOn: "feature.sitePages", default: { en: `${SITE.name} is a free, ad-free learning site for school students in India. It starts with CBSE Class 3 and will grow to more classes and State boards, in English and Tamil.\n\nEvery lesson, question and explanation is written for children, with a patient teacher voice, four rounds of practice, daily revision, and clear help for parents.` } },
  bool("pages.showContact", "pages", "Contact", "Show a contact e-mail on the privacy and terms pages", false, { dependsOn: "feature.sitePages", help: "Switch on after you have a working address (set below)." }),
  { key: "pages.contactEmail", panel: "pages", section: "Contact", label: "Contact e-mail", public: true, type: "text", maxLength: 80, dependsOn: "pages.showContact", default: `contact@${SITE.domain}` },
  bool("pages.footerLinks", "pages", "Footer", "Show links to these pages in the footer", true, { dependsOn: "feature.sitePages" }),

  bool("parent.showAccuracy", "parent", "What parents see", "Show how many answers were right", true, { dependsOn: "feature.parentDashboard" }),
  bool("parent.showActivity", "parent", "What parents see", "Show the daily activity chart", true, { dependsOn: "feature.parentDashboard" }),
  bool("parent.showWeakSpots", "parent", "What parents see", "Show questions the child often gets wrong", true, { dependsOn: "feature.parentDashboard" }),
  { key: "parent.weakSpotsCount", panel: "parent", section: "What parents see", label: "Most tricky questions listed", public: true, type: "number", default: 5, min: 1, max: 10, step: 1, dependsOn: "parent.showWeakSpots" },
  { key: "parent.weeklyGoalDays", panel: "parent", section: "Goals", label: "Weekly goal: days of learning", public: true, type: "number", default: 4, min: 1, max: 7, step: 1, dependsOn: "feature.parentDashboard", help: "Shown to parents as a gentle target (days a child practised or learned this week)." },
  bool("parent.showStreak", "parent", "Goals", "Show the learning streak", true, { dependsOn: "feature.parentDashboard" }),
  bool("parent.export", "parent", "Downloads", "Allow printing, CSV and full data download", true, { dependsOn: "feature.parentDashboard", help: "Parents can always delete their data; this controls the report and the download." }),

  // ---------------- Theme ----------------
  { key: "theme.preset", panel: "theme", section: "Theme and colour palette", label: "Theme (page style)", public: true, type: "select", default: DEFAULT_THEME,
    help: "How the whole site is built: page background, panels, borders, shadows, buttons, headings. Works with any palette.",
    options: THEMES.map((t) => ({ value: t.id, label: t.label })) },
  { key: "theme.palette", panel: "theme", section: "Theme and colour palette", label: "Colour palette", public: true, type: "select", default: DEFAULT_PALETTE,
    help: "All the site colours in one choice, with a matching dark version. Choose Custom to use the individual colour pickers further down.",
    options: [...PALETTES.map((p) => ({ value: p.id, label: p.label })), { value: CUSTOM_PALETTE, label: "Custom (my own colours)" }] },
  { key: "theme.mode", panel: "theme", section: "Mode", label: "Light or dark", public: true, type: "select", default: "light",
    options: [{ value: "light", label: "Always light" }, { value: "dark", label: "Always dark" }, { value: "auto", label: "Follow the device" }] },
  color("theme.color.paper", "Page background", "#F4F8FC", "Custom colours", { help: "Used only when the colour palette is Custom. The page background.", contrastAgainst: "theme.color.ink" }),
  color("theme.color.surface", "Panels and rows", "#FFFFFF", "Custom colours", { contrastAgainst: "theme.color.ink" }),
  color("theme.color.ink", "Text", "#16253F", "Custom colours", { help: "Main reading colour.", contrastAgainst: "theme.color.paper" }),
  color("theme.color.muted", "Secondary text", "#51617D", "Custom colours", { contrastAgainst: "theme.color.paper" }),
  color("theme.color.brand", "Brand and buttons", "#1F4FD1", "Custom colours", { contrastAgainst: "theme.color.paper" }),
  color("theme.color.margin", "Margin line", "#D9444F", "Custom colours", { help: "The red line down the page, like a school notebook." }),
  color("theme.color.rule", "Ruled lines", "#D3E1F0", "Custom colours"),
  color("theme.color.success", "Done / correct", "#17785A", "Custom colours: status", { contrastAgainst: "theme.color.paper" }),
  color("theme.color.warning", "Needs attention", "#9A5B00", "Custom colours: status", { contrastAgainst: "theme.color.paper" }),
  color("theme.dark.paper", "Dark mode: background", "#0F1A2B", "Custom colours: dark mode", { contrastAgainst: "theme.dark.ink" }),
  color("theme.dark.surface", "Dark mode: panels", "#18273F", "Custom colours: dark mode", { contrastAgainst: "theme.dark.ink" }),
  color("theme.dark.ink", "Dark mode: text", "#E8EEF8", "Custom colours: dark mode", { contrastAgainst: "theme.dark.paper" }),
  color("theme.subject.maths", "Mathematics notebook", "#2D5BE3", "Custom colours: subjects"),
  color("theme.subject.evs", "Environmental Studies notebook", "#178F63", "Custom colours: subjects"),
  color("theme.subject.english", "English notebook", "#C2410C", "Custom colours: subjects"),
  color("theme.subject.tamil", "Tamil notebook", "#7C3AED", "Custom colours: subjects"),
  color("theme.subject.science", "Science notebook", "#0E7C86", "Custom colours: subjects"),
  color("theme.subject.social", "Social Science notebook", "#A16207", "Custom colours: subjects"),
  color("theme.subject.other", "Other subjects", "#475569", "Custom colours: subjects"),
  { key: "theme.font.heading", panel: "theme", section: "Type", label: "Heading font", public: true, type: "select", default: "theme",
    options: [{ value: "theme", label: "Follow the theme" }, { value: "baloo", label: "Baloo Thambi 2 (rounded, friendly)" }, { value: "system", label: "Device default" }] },
  { key: "theme.font.body", panel: "theme", section: "Type", label: "Reading font", public: true, type: "select", default: "mukta",
    options: [{ value: "mukta", label: "Mukta Malar (clear Tamil and English)" }, { value: "system", label: "Device default" }] },
  { key: "theme.font.scale", panel: "theme", section: "Type", label: "Text size", public: true, type: "select", default: "1",
    options: [{ value: "0.9", label: "Small" }, { value: "1", label: "Normal" }, { value: "1.12", label: "Large" }, { value: "1.25", label: "Extra large" }] },
  { key: "theme.radius", panel: "theme", section: "Shape and spacing", label: "Corner style", public: true, type: "select", default: "theme",
    options: [{ value: "theme", label: "Follow the theme" }, { value: "sharp", label: "Sharp" }, { value: "soft", label: "Soft" }, { value: "round", label: "Round" }] },
  { key: "theme.density", panel: "theme", section: "Shape and spacing", label: "Spacing", public: true, type: "select", default: "comfortable",
    options: [{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }, { value: "roomy", label: "Roomy (easier to tap)" }] },
  bool("theme.paper.rules", "theme", "Notebook details", "Ruled lines on the page", true, { help: "Only used by the Notebook theme." }),
  bool("theme.paper.margin", "theme", "Notebook details", "Red margin line", true, { help: "Only used by the Notebook theme." }),
  { key: "theme.motion", panel: "theme", section: "Motion", label: "Animation", public: true, type: "select", default: "full",
    options: [{ value: "full", label: "Normal" }, { value: "reduced", label: "Reduced" }, { value: "off", label: "None" }] },

  // ---------------- Layout and navigation (redesign) ----------------
  bool("ui.bottomNav.enabled", "layout", "Navigation", "Tab bar at the bottom on phones", true, { help: "Big, thumb-friendly buttons for Home, Subjects, Revise, Progress and Account. Only shown on narrow screens." }),
  bool("ui.bottomNav.showLabels", "layout", "Navigation", "Show words under the tab-bar icons", true, { dependsOn: "ui.bottomNav.enabled", help: "Icons alone are hard for young children; keep this on." }),
  bool("ui.textSize.control", "layout", "Reading comfort", "Text-size buttons in the header (A- / A+)", true, { help: "Students can make text bigger on their own device." }),
  { key: "ui.textSize.maxPercent", panel: "layout", section: "Reading comfort", label: "Largest text size a student can choose", public: true, type: "number", default: 140, min: 110, max: 200, step: 10, unit: "%", dependsOn: "ui.textSize.control" },
  bool("home.continue.show", "layout", "Home dashboard", "Show 'Continue where you stopped' on the home page", true, { dependsOn: "feature.lessons" }),
  bool("home.quickLinks.show", "layout", "Home dashboard", "Show big shortcut tiles (Subjects, Classroom, Revise, Progress)", true),
  bool("home.rewards.show", "layout", "Home dashboard", "Show the streak and stars card", true),
  bool("rewards.streak.enabled", "layout", "Daily streak", "Count a daily learning streak", true, { help: "Days in a row on which the student finished or moved forward in a lesson. Stored on the device only." }),
  { key: "rewards.streak.graceDays", panel: "layout", section: "Daily streak", label: "Missed days forgiven before the streak resets", public: true, type: "number", default: 1, min: 0, max: 3, step: 1, unit: "days", dependsOn: "rewards.streak.enabled", help: "Kind to children: one missed day does not wipe out a long streak." },
  { key: "rewards.streak.maxShown", panel: "layout", section: "Daily streak", label: "Highest streak number shown", public: true, type: "number", default: 99, min: 7, max: 365, step: 1, unit: "days", dependsOn: "rewards.streak.enabled" },
  bool("browse.subjectIcons.show", "layout", "Subjects and chapters", "Picture icon on each subject notebook", true),
  bool("browse.subjectProgress.show", "layout", "Subjects and chapters", "Progress bar on each subject notebook", true, { dependsOn: "feature.lessons" }),
  bool("browse.chapterProgress.show", "layout", "Subjects and chapters", "Progress ring on each chapter in a subject", true, { dependsOn: "feature.lessons" }),
  bool("parent.link.show", "layout", "Parents", "Parent link in the footer", true, { dependsOn: "feature.accounts" }),

  // ---- Round 2: lesson page ----
  bool("lesson.readable", "layout", "Lesson page", "Clear one-column reading layout", true, { dependsOn: "feature.lessons", help: "One narrow column, bigger text and calm colours so young children can read without distraction." }),
  bool("lesson.dots.show", "layout", "Lesson page", "Step dots (one dot per step)", true, { dependsOn: "feature.lessons", help: "Shows where the child is in the lesson. Lessons with more than 12 steps show the bar only." }),
  bool("lesson.nextButton.big", "layout", "Lesson page", "Big 'Next step' button", true, { dependsOn: "feature.lessons", help: "A wide, easy-to-tap button at the bottom of every step." }),
  bool("lesson.listen.stable", "layout", "Lesson page", "Keep the Listen button in a fixed place", true, { dependsOn: "feature.teacherNarration", help: "The Listen button stays at the top of the teacher box and does not change size or move when the lesson plays." }),
  // ---- Round 2: progress and rewards ----
  bool("rewards.badges.enabled", "layout", "Badges and progress", "Friendly badges on the Progress page", true, { dependsOn: "feature.mastery", help: "Badges are earned only from progress already saved on the device (lessons finished, stars, streak). Nothing is sent anywhere." }),
  bool("rewards.weekCalendar.show", "layout", "Badges and progress", "Weekly streak calendar", true, { dependsOn: "feature.mastery", help: "Seven days with a tick on each day the student learned." }),
  bool("progress.nextSuggestion.show", "layout", "Badges and progress", "'What to learn next' suggestion", true, { dependsOn: "feature.mastery", help: "Suggests the next unfinished topic in order." }),
  // ---- Round 2: parent view ----
  bool("parent.weeklySummary.show", "layout", "Parent weekly summary", "Simple weekly summary at the top of the parent view", true, { dependsOn: "feature.parentDashboard", help: "Plain-language summary of time, topics finished and topics that need another look. Can be printed." }),
  // ---- Round 2: accessibility and phones ----
  bool("a11y.focus.strong", "layout", "Accessibility", "Extra-visible keyboard focus outline", true),
  bool("a11y.targets.large", "layout", "Accessibility", "Make every button and link at least 44 pixels tall", true),
  bool("a11y.highContrast.control", "layout", "Accessibility", "High-contrast button in the header", true, { help: "Lets a student switch to black-on-white (or white-on-black) colours on their own device." }),
  bool("a11y.highContrast.default", "layout", "Accessibility", "High contrast on by default for new visitors", false, { dependsOn: "a11y.highContrast.control" }),
  bool("ui.mobile.polish", "layout", "Phones", "Extra tidy layout for very small phones (360 pixels wide)", true, { help: "Smaller header, two-column tiles and tighter spacing on Home and Browse." }),
  // ---- Round 2b: richer home, browse, lesson, progress, notebook ----
  bool("home.tryLesson.show", "layout", "Home dashboard", "'Try a free lesson now' button (no sign-in)", true, { dependsOn: "feature.lessons", help: "Opens a sample lesson straight away. Lessons never need an account." }),
  bool("home.path.show", "layout", "Home dashboard", "Game-board learning path on the home page", true, { dependsOn: "feature.lessons", help: "A winding path of the next topics, in order, coloured by progress." }),
  { key: "home.path.length", panel: "layout", section: "Home dashboard", label: "Steps shown on the home path", public: true, type: "number", default: 7, min: 3, max: 12, step: 1, dependsOn: "home.path.show" },
  { key: "home.recent.count", panel: "layout", section: "Home dashboard", label: "Recent lessons in 'Pick up where you left off'", public: true, type: "number", default: 3, min: 1, max: 5, step: 1, dependsOn: "home.continue.show" },
  bool("home.didYouKnow.show", "layout", "Home dashboard", "'Did you know?' daily card", true, { help: "One friendly fact a day from a small list stored in the site." }),
  bool("rewards.dailyGoal.enabled", "layout", "Daily goal", "Daily goal chip (finish lessons each day)", true, { dependsOn: "rewards.streak.enabled" }),
  { key: "rewards.dailyGoal.lessons", panel: "layout", section: "Daily goal", label: "Lessons to finish each day", public: true, type: "number", default: 1, min: 1, max: 5, step: 1, dependsOn: "rewards.dailyGoal.enabled" },
  bool("rewards.masteryBar.show", "layout", "Badges and progress", "Five-step mastery bar (Not started to Mastered)", true, { dependsOn: "feature.mastery", help: "A segmented bar per chapter on the Progress and chapter pages." }),
  bool("rewards.level.show", "layout", "Badges and progress", "Show a friendly level (grows with lessons and stars)", true, { dependsOn: "feature.mastery" }),
  bool("rewards.certificate.show", "layout", "Badges and progress", "Printable 'what I learned' certificate", true, { dependsOn: "feature.mastery" }),
  bool("notebook.enabled", "layout", "My notebook", "'My notebook': save favourite lessons on this device", true, { dependsOn: "feature.lessons", help: "Saved only in the browser. No accounts, no uploads, no sharing, nothing public." }),
  bool("browse.syllabus.show", "layout", "Subjects and chapters", "Syllabus preview on each chapter (topics and rough minutes)", true),
  bool("browse.missionWording.show", "layout", "Subjects and chapters", "Call chapters 'Missions' on the chapter page", true),
  bool("browse.path.show", "layout", "Subjects and chapters", "Visual learning path on each subject page", true, { dependsOn: "feature.lessons" }),
  bool("browse.explore.enabled", "layout", "Subjects and chapters", "Explore page with filters (class, subject, theme)", true),
  bool("lesson.split.enabled", "layout", "Lesson page", "Side panel on wide screens (steps outline, Ask the teacher); stacked on phones", true, { dependsOn: "feature.lessons" }),
  bool("lesson.scrolly.enabled", "layout", "Lesson page", "Long explanations become step sections with a picture that changes as the child scrolls", true, { dependsOn: "feature.lessons", help: "Only for explanations with several paragraphs. Falls back to plain paragraphs if the device cannot track scrolling. No animation when the device asks for less motion." }),
  { key: "lesson.scrolly.minParagraphs", panel: "layout", section: "Lesson page", label: "Paragraphs needed before an explanation becomes step sections", public: true, type: "number", default: 3, min: 2, max: 10, step: 1, dependsOn: "lesson.scrolly.enabled" },
  bool("lesson.listen.inBar", "layout", "Lesson page", "Listen button inside the bottom bar on phones (next to Next step)", true, { dependsOn: "feature.teacherNarration", help: "The slot is always reserved, so the bar never jumps when a step has no voice." }),
  bool("browse.explore.sheet", "layout", "Subjects and chapters", "Explore filters open in a bottom sheet on phones", true, { dependsOn: "browse.explore.enabled" }),
  bool("browse.explore.langChip", "layout", "Subjects and chapters", "Language filter chip on Explore (topics that have a Tamil name)", true, { dependsOn: "browse.explore.enabled" }),
  bool("parent.subjectCards.show", "layout", "Parent weekly summary", "One card per subject in the parent view", true, { dependsOn: "feature.parentDashboard" }),
  bool("explore.tryIt.show", "layout", "Try-it activities", "Tiny interactive 'try it' activities (groups, scrub slider)", true, { help: "Plain tap-and-drag activities with no scores sent anywhere." }),
  bool("ui.pageTransition", "layout", "Phones", "Gentle fade when a page opens (off when the device asks for less motion)", true),

  // ---------------- Phone app view ----------------
  bool("app.view.enabled", "app", "App view", "Offer the phone app view", true, { help: "Master switch. Off = everyone always sees the normal website." }),
  bool("app.view.autoPhone", "app", "App view", "Phones get the app view automatically", true, { dependsOn: "app.view.enabled", help: "Only phones, never tablets or computers. A student can switch to the full website in Me, and the choice is remembered on that device." }),
  bool("app.feed.enabled", "app", "Learning feed", "Home is a swipe feed (one card per screen) in the app view", true, { dependsOn: "app.view.enabled" }),
  bool("app.feed.quiz.show", "app", "Learning feed", "Quick practice question card", true, { dependsOn: "app.feed.enabled", help: "A tiny multiplication question made on the device. Nothing is sent anywhere." }),
  bool("app.feed.tryIt.show", "app", "Learning feed", "Try-it puzzle card (equal groups)", true, { dependsOn: "app.feed.enabled" }),
  bool("app.feed.recent.show", "app", "Learning feed", "'Pick up where you left off' card at the top of the feed", true, { dependsOn: "app.feed.enabled" }),
  bool("app.feed.goalRing.show", "app", "Learning feed", "Daily goal ring on the mission card", true, { dependsOn: "app.feed.enabled" }),
  bool("app.learn.colourTiles.show", "app", "Learn tab", "Colour/theme tiles on the Learn tab", true, { dependsOn: "app.view.enabled", help: "Tiles that open the Explore page filtered by theme." }),
  bool("app.learn.chapterSheet.show", "app", "Learn tab", "Chapter preview in a bottom sheet (topics, rough minutes) and mastery bars on chapter rows", true, { dependsOn: "app.view.enabled" }),
  bool("app.me.links.show", "app", "Me tab", "My notebook and Parent area links under Me", true, { dependsOn: "app.view.enabled" }),
  bool("app.feed.pullRefresh", "app", "Learning feed", "Pull down to refresh the Home feed (re-reads progress and the daily card on the device)", true, { dependsOn: "app.feed.enabled" }),
  bool("app.vibrate", "app", "Feel", "Small vibration on a right answer (phones that support it)", true, { dependsOn: "app.view.enabled" }),
  bool("app.theme.control", "app", "Look", "Light / Dark / Auto choice in Me", true, { help: "Auto follows the phone's own light or dark setting." }),
  bool("app.install.show", "app", "Install", `Install ${SITE.name} button in Me`, true, { dependsOn: "app.view.enabled" }),

  // ---------------- Home page ----------------
  bool("home.hero.show", "home", "Top of the page", "Show the headline", true),
  { key: "home.hero.title", panel: "home", section: "Top of the page", label: "Headline", public: true, type: "localized", maxLength: 90, dependsOn: "home.hero.show",
    default: { en: "Understand every chapter. Practise until you master it.", ta: "ஒவ்வொரு பாடத்தையும் புரிந்துகொள்ளுங்கள். தேர்ச்சி பெறும் வரை பயிற்சி செய்யுங்கள்." } },
  { key: "home.hero.subtitle", panel: "home", section: "Top of the page", label: "Line under the headline", public: true, type: "localized", maxLength: 160, multiline: true, dependsOn: "home.hero.show",
    default: { en: "Free lessons and practice for school students. Pick your class to begin.", ta: "பள்ளி மாணவர்களுக்கான இலவச பாடங்களும் பயிற்சியும். தொடங்க உங்கள் வகுப்பைத் தேர்ந்தெடுங்கள்." } },
  bool("home.classPicker.show", "home", "Sections", "Class picker", true),
  bool("home.boardPicker.show", "home", "Sections", "Board picker", true),
  bool("home.search.show", "home", "Sections", "Search box on the home page", true, { dependsOn: "feature.search" }),
  bool("home.announcement.show", "home", "Announcement banner", "Show a banner", false),
  { key: "home.announcement.text", panel: "home", section: "Announcement banner", label: "Banner text", public: true, type: "localized", maxLength: 200, multiline: true, dependsOn: "home.announcement.show", default: { en: "" } },
  { key: "home.announcement.tone", panel: "home", section: "Announcement banner", label: "Banner colour", public: true, type: "select", default: "info", dependsOn: "home.announcement.show",
    options: [{ value: "info", label: "Blue (information)" }, { value: "success", label: "Green (good news)" }, { value: "warning", label: "Amber (important)" }] },
  { key: "home.footer.text", panel: "home", section: "Footer", label: "Footer message", public: true, type: "localized", maxLength: 200, multiline: true,
    default: { en: "Free for every student. Made in Chennai.", ta: "ஒவ்வொரு மாணவருக்கும் இலவசம். சென்னையில் உருவாக்கப்பட்டது." } },
  bool("home.footer.showSources", "home", "Footer", "Show textbook source note on chapter lists", true, { help: "Tells students which official textbook each subject follows." }),

  // ---------------- Languages ----------------
  bool("lang.tamil.enabled", "languages", "Tamil", "Offer Tamil", true),
  { key: "lang.default", panel: "languages", section: "Default", label: "Language when a student first arrives", public: true, type: "select", default: "en",
    options: [{ value: "en", label: "English" }, { value: "ta", label: "தமிழ் (Tamil)" }] },
  bool("lang.fallbackToEnglish", "languages", "Default", "Show the English title when a Tamil one is missing", true),
  bool("lang.showBothTitles", "languages", "Default", "Show the other language under each chapter title", false),

  // ---------------- Classes and boards ----------------
  { key: "catalog.openClasses", panel: "catalog", section: "Classes", label: "Classes open to students", public: true, type: "numberlist", default: [3], options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    help: "Other classes appear as 'coming soon'. A class opens only when its content is ready." },
  bool("catalog.showComingSoon", "catalog", "Boards", "Show boards that are not ready yet as 'coming soon'", true),
  { key: "catalog.defaultBoard", panel: "catalog", section: "Boards", label: "Board selected by default", public: true, type: "select", default: "CBSE",
    options: [{ value: "CBSE", label: "CBSE" }] },

  // ---------------- Site access (invite-only mode) ----------------
  { key: "access.mode", panel: "access", section: "Who can enter", label: "Who can open the site", public: false, type: "select", default: "public",
    options: [{ value: "public", label: "Everyone (public)" }, { value: "invite", label: "Invitation only (visitors need an invite code)" }],
    help: "Invitation only: every visitor sees a code page first. The admin page stays open so you can switch back." },
  bool("access.inviteCodeRequired", "access", "Who can enter", "Ask for the invite code (while Invitation only is chosen)", true, { public: false,
    help: "A quick pause switch. Off = the site stays open even though Invitation only is chosen, and your codes are kept. Turn it back on to close the doors again." }),
  { key: "access.cookieDays", panel: "access", section: "Invite codes", label: "How long a visitor stays let in", public: false, type: "number", default: 30, min: 1, max: 365, step: 1, unit: "days",
    help: "After entering a valid code the browser is remembered this long. Cancelling a code lets that person out straight away." },
  { key: "access.newCode.maxUses", panel: "access", section: "Invite codes", label: "New codes: how many people can use one code", public: false, type: "number", default: 10, min: 0, max: 10000, step: 1, unit: "people",
    help: "Starting value for new codes. 0 = no limit. You can change it for each code when you create it." },
  { key: "access.newCode.expiryDays", panel: "access", section: "Invite codes", label: "New codes: stop working after", public: false, type: "number", default: 0, min: 0, max: 3650, step: 1, unit: "days",
    help: "Starting value for new codes. 0 = never expires. Only stops new people using the code; people already let in stay in until you cancel the code." },
  { key: "access.gate.message", panel: "access", section: "Invite page", label: "Message on the invite page", public: false, type: "localized", maxLength: 200, multiline: true,
    default: { en: "This site is open by invitation only. Please enter your invite code.", ta: "இந்தத் தளம் அழைப்பின் மூலம் மட்டுமே திறந்திருக்கிறது. உங்கள் அழைப்புக் குறியீட்டை உள்ளிடுங்கள்." } },

  // ---------------- Site ----------------
  bool("site.maintenance.enabled", "site", "Maintenance", "Maintenance mode", false, { help: "Shows a friendly message instead of the site. Admin stays available." }),
  { key: "site.maintenance.message", panel: "site", section: "Maintenance", label: "Maintenance message", public: true, type: "localized", maxLength: 200, multiline: true, dependsOn: "site.maintenance.enabled",
    default: { en: `${SITE.name} is being updated. Please come back in a little while.`, ta: `${SITE.name} புதுப்பிக்கப்படுகிறது. சிறிது நேரம் கழித்து வாருங்கள்.` } },
  { key: "site.name", panel: "site", section: "Identity", label: "Site name", public: true, type: "text", maxLength: 30, default: SITE.name },
  { key: "site.cache.maxAgeSeconds", panel: "site", section: "Performance", label: "Curriculum cache time", public: false, type: "number", default: 300, min: 0, max: 86400, step: 30, unit: "seconds",
    help: "How long browsers and the CDN keep curriculum data. Lower = changes appear faster." },
  { key: "site.search.maxResults", panel: "site", section: "Performance", label: "Most search results to show", public: true, type: "number", default: 20, min: 5, max: 50, step: 5, dependsOn: "feature.search" },
  { key: "site.search.minChars", panel: "site", section: "Performance", label: "Letters needed before searching", public: true, type: "number", default: 2, min: 1, max: 5, step: 1, dependsOn: "feature.search" },
];

export const SETTINGS_BY_KEY = new Map(SETTINGS.map((d) => [d.key, d]));

export function defaults(): Record<string, SettingValue> {
  return Object.fromEntries(SETTINGS.map((d) => [d.key, d.default]));
}

const HEX = /^#[0-9a-fA-F]{6}$/;
/** Validates one value against its definition. Returns the cleaned value or throws a readable error. */
export function parseSetting(key: string, value: unknown): SettingValue {
  const d = SETTINGS_BY_KEY.get(key);
  if (!d) throw new Error(`Unknown setting: ${key}`);
  if (d.availability === "planned") throw new Error(`${d.label} is not built yet and cannot be changed`);
  const fail = (m: string) => { throw new Error(`${d.label}: ${m}`); };
  switch (d.type) {
    case "boolean": return typeof value === "boolean" ? value : fail("must be on or off");
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) return fail("must be a number");
      if (value < d.min || value > d.max) return fail(`must be between ${d.min} and ${d.max}`);
      return value;
    }
    case "select": return typeof value === "string" && d.options.some((o) => o.value === value) ? value : fail("choose one of the listed options");
    case "color": return typeof value === "string" && HEX.test(value) ? value.toUpperCase() : fail("must be a colour like #1F4FD1");
    case "text": {
      const t = z.string().trim().min(1).max(d.maxLength).safeParse(value);
      return t.success ? t.data : fail(`must be 1 to ${d.maxLength} characters`);
    }
    case "localized": {
      const t = z.object({ en: z.string().trim().max(d.maxLength), ta: z.string().trim().max(d.maxLength).optional() }).strict().safeParse(value);
      if (!t.success) return fail(`each language must be at most ${d.maxLength} characters`);
      return { en: t.data.en, ...(t.data.ta ? { ta: t.data.ta } : {}) };
    }
    case "numberlist": {
      if (!Array.isArray(value) || !value.every((n) => typeof n === "number" && d.options.includes(n))) return fail("choose from the listed values");
      return [...new Set(value as number[])].sort((a, b) => a - b);
    }
  }
}

/** Merge stored overrides over defaults. Stored values that no longer validate fall back to the default. */
export function resolveSettings(overrides: Record<string, unknown>): Record<string, SettingValue> {
  const out = defaults();
  for (const [k, v] of Object.entries(overrides)) {
    try { out[k] = parseSetting(k, v); } catch { /* ignore stale or invalid stored value */ }
  }
  // A site whose admin picked individual colours before palettes existed keeps exactly that look (Notebook theme + Custom palette).
  const hadColours = Object.keys(overrides).some((k) => /^theme\.(color|dark|subject)\./.test(k));
  if (hadColours && !("theme.palette" in overrides)) out["theme.palette"] = CUSTOM_PALETTE;
  if (hadColours && !("theme.preset" in overrides)) out["theme.preset"] = "notebook";
  return out;
}

export function publicSettings(values: Record<string, SettingValue>): Record<string, SettingValue> {
  return Object.fromEntries(SETTINGS.filter((d) => d.public).map((d) => [d.key, values[d.key] ?? d.default]));
}

export { contrastRatio } from "./color.js";

// ---------------- Style presets (apply, then fine-tune) ----------------
export interface ThemePreset { id: string; label: string; description: string; values: Record<string, SettingValue> }
export const THEME_PRESETS: ThemePreset[] = [
  { id: "notebook", label: "Blue notebook", description: "Original blue ink and red margin colours (uses the Notebook theme and Custom palette).", values: {} },
  { id: "chalkboard", label: "Chalkboard", description: "A dark green board with chalk-white text.", values: {
    "theme.mode": "dark", "theme.dark.paper": "#12302A", "theme.dark.surface": "#1B4036", "theme.dark.ink": "#F2F5EE", "theme.color.brand": "#2F8F6B", "theme.color.margin": "#E3B04B", "theme.paper.rules": false } },
  { id: "sunrise", label: "Sunrise", description: "A warm yellow page with deep purple ink.", values: {
    "theme.mode": "light", "theme.color.paper": "#FFF8E6", "theme.color.surface": "#FFFFFF", "theme.color.ink": "#2D1B4E", "theme.color.muted": "#5E4B7A", "theme.color.brand": "#6D28D9", "theme.color.margin": "#E8590C", "theme.color.rule": "#F3E3B3", "theme.radius": "round" } },
  { id: "high-contrast", label: "High contrast", description: "Black and white with strong colours, for easier reading.", values: {
    "theme.mode": "light", "theme.color.paper": "#FFFFFF", "theme.color.surface": "#FFFFFF", "theme.color.ink": "#000000", "theme.color.muted": "#2B2B2B", "theme.color.brand": "#0033CC", "theme.color.margin": "#C00000", "theme.color.rule": "#BFBFBF", "theme.font.scale": "1.12", "theme.motion": "reduced" } },
];
