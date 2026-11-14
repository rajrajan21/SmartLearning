import { z } from "zod";

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

export type PanelId = "features" | "lessons" | "practice" | "theme" | "home" | "languages" | "catalog" | "site" | "accounts" | "mastery" | "tutor" | "parent";
export const PANELS: { id: PanelId; label: string; help: string }[] = [
  { id: "features", label: "Features", help: "Switch whole parts of the site on or off." },
  { id: "lessons", label: "Lessons", help: "How lessons play, save progress and reveal." },
  { id: "practice", label: "Practice", help: "Practice rounds, hints, pass marks and feedback." },
  { id: "theme", label: "Look and feel", help: "Colours, fonts, sizes and style presets." },
  { id: "home", label: "Home page", help: "What visitors see first." },
  { id: "languages", label: "Languages", help: "Tamil and English behaviour." },
  { id: "catalog", label: "Classes and boards", help: "Which classes and boards are open to students." },
  { id: "accounts", label: "Accounts", help: "Parent sign-in, child profiles and saving progress across devices." },
  { id: "mastery", label: "Mastery and revision", help: "How progress is measured and how old questions come back to be remembered." },
  { id: "tutor", label: "Ask the teacher", help: "The question helper: where it appears, daily limits and safety." },
  { id: "parent", label: "Parent dashboard", help: "What parents can see about their children and download." },
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
  planned("feature.exams", "Exams and worksheets", "Module 10"),
  planned("feature.games", "Games and challenges", "Module 10"),
  planned("feature.adminEmails", "Admin e-mail notifications", "Off by default; added with accounts."),

  // ---------------- Lessons ----------------
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
    default: { en: "I am the parent or guardian. I agree that StudySmart keeps my child's nickname, class and learning progress so it can be saved across devices. I can delete it at any time.", ta: "நான் பெற்றோர் அல்லது பாதுகாவலர். என் குழந்தையின் புனைப்பெயர், வகுப்பு, கற்றல் முன்னேற்றம் சாதனங்களுக்கிடையே சேமிக்கப்பட இதை ஒப்புக்கொள்கிறேன். நான் எப்போது வேண்டுமானாலும் அழிக்கலாம்." } },

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

  // ---------------- Parent dashboard ----------------
  bool("parent.showAccuracy", "parent", "What parents see", "Show how many answers were right", true, { dependsOn: "feature.parentDashboard" }),
  bool("parent.showActivity", "parent", "What parents see", "Show the daily activity chart", true, { dependsOn: "feature.parentDashboard" }),
  bool("parent.showWeakSpots", "parent", "What parents see", "Show questions the child often gets wrong", true, { dependsOn: "feature.parentDashboard" }),
  { key: "parent.weakSpotsCount", panel: "parent", section: "What parents see", label: "Most tricky questions listed", public: true, type: "number", default: 5, min: 1, max: 10, step: 1, dependsOn: "parent.showWeakSpots" },
  { key: "parent.weeklyGoalDays", panel: "parent", section: "Goals", label: "Weekly goal: days of learning", public: true, type: "number", default: 4, min: 1, max: 7, step: 1, dependsOn: "feature.parentDashboard", help: "Shown to parents as a gentle target (days a child practised or learned this week)." },
  bool("parent.showStreak", "parent", "Goals", "Show the learning streak", true, { dependsOn: "feature.parentDashboard" }),
  bool("parent.export", "parent", "Downloads", "Allow printing, CSV and full data download", true, { dependsOn: "feature.parentDashboard", help: "Parents can always delete their data; this controls the report and the download." }),

  // ---------------- Theme ----------------
  { key: "theme.mode", panel: "theme", section: "Mode", label: "Light or dark", public: true, type: "select", default: "light",
    options: [{ value: "light", label: "Always light" }, { value: "dark", label: "Always dark" }, { value: "auto", label: "Follow the device" }] },
  color("theme.color.paper", "Page background", "#F4F8FC", "Notebook colours", { help: "The notebook paper.", contrastAgainst: "theme.color.ink" }),
  color("theme.color.surface", "Panels and rows", "#FFFFFF", "Notebook colours", { contrastAgainst: "theme.color.ink" }),
  color("theme.color.ink", "Text", "#16253F", "Notebook colours", { help: "Main reading colour.", contrastAgainst: "theme.color.paper" }),
  color("theme.color.muted", "Secondary text", "#51617D", "Notebook colours", { contrastAgainst: "theme.color.paper" }),
  color("theme.color.brand", "Brand and buttons", "#1F4FD1", "Notebook colours", { contrastAgainst: "theme.color.paper" }),
  color("theme.color.margin", "Margin line", "#D9444F", "Notebook colours", { help: "The red line down the page, like a school notebook." }),
  color("theme.color.rule", "Ruled lines", "#D3E1F0", "Notebook colours"),
  color("theme.color.success", "Done / correct", "#17785A", "Status colours", { contrastAgainst: "theme.color.paper" }),
  color("theme.color.warning", "Needs attention", "#9A5B00", "Status colours", { contrastAgainst: "theme.color.paper" }),
  color("theme.dark.paper", "Dark mode: background", "#0F1A2B", "Dark mode colours", { contrastAgainst: "theme.dark.ink" }),
  color("theme.dark.surface", "Dark mode: panels", "#18273F", "Dark mode colours", { contrastAgainst: "theme.dark.ink" }),
  color("theme.dark.ink", "Dark mode: text", "#E8EEF8", "Dark mode colours", { contrastAgainst: "theme.dark.paper" }),
  color("theme.subject.maths", "Mathematics notebook", "#2D5BE3", "Subject notebook covers"),
  color("theme.subject.evs", "Environmental Studies notebook", "#178F63", "Subject notebook covers"),
  color("theme.subject.english", "English notebook", "#C2410C", "Subject notebook covers"),
  color("theme.subject.tamil", "Tamil notebook", "#7C3AED", "Subject notebook covers"),
  color("theme.subject.science", "Science notebook", "#0E7C86", "Subject notebook covers"),
  color("theme.subject.social", "Social Science notebook", "#A16207", "Subject notebook covers"),
  color("theme.subject.other", "Other subjects", "#475569", "Subject notebook covers"),
  { key: "theme.font.heading", panel: "theme", section: "Type", label: "Heading font", public: true, type: "select", default: "baloo",
    options: [{ value: "baloo", label: "Baloo Thambi 2 (rounded, friendly)" }, { value: "system", label: "Device default" }] },
  { key: "theme.font.body", panel: "theme", section: "Type", label: "Reading font", public: true, type: "select", default: "mukta",
    options: [{ value: "mukta", label: "Mukta Malar (clear Tamil and English)" }, { value: "system", label: "Device default" }] },
  { key: "theme.font.scale", panel: "theme", section: "Type", label: "Text size", public: true, type: "select", default: "1",
    options: [{ value: "0.9", label: "Small" }, { value: "1", label: "Normal" }, { value: "1.12", label: "Large" }, { value: "1.25", label: "Extra large" }] },
  { key: "theme.radius", panel: "theme", section: "Shape and spacing", label: "Corner style", public: true, type: "select", default: "soft",
    options: [{ value: "sharp", label: "Sharp" }, { value: "soft", label: "Soft" }, { value: "round", label: "Round" }] },
  { key: "theme.density", panel: "theme", section: "Shape and spacing", label: "Spacing", public: true, type: "select", default: "comfortable",
    options: [{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }, { value: "roomy", label: "Roomy (easier to tap)" }] },
  bool("theme.paper.rules", "theme", "Notebook details", "Ruled lines on the page", true),
  bool("theme.paper.margin", "theme", "Notebook details", "Red margin line", true),
  { key: "theme.motion", panel: "theme", section: "Motion", label: "Animation", public: true, type: "select", default: "full",
    options: [{ value: "full", label: "Normal" }, { value: "reduced", label: "Reduced" }, { value: "off", label: "None" }] },

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

  // ---------------- Site ----------------
  bool("site.maintenance.enabled", "site", "Maintenance", "Maintenance mode", false, { help: "Shows a friendly message instead of the site. Admin stays available." }),
  { key: "site.maintenance.message", panel: "site", section: "Maintenance", label: "Maintenance message", public: true, type: "localized", maxLength: 200, multiline: true, dependsOn: "site.maintenance.enabled",
    default: { en: "StudySmart is being updated. Please come back in a little while.", ta: "StudySmart புதுப்பிக்கப்படுகிறது. சிறிது நேரம் கழித்து வாருங்கள்." } },
  { key: "site.name", panel: "site", section: "Identity", label: "Site name", public: true, type: "text", maxLength: 30, default: "StudySmart" },
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
  return out;
}

export function publicSettings(values: Record<string, SettingValue>): Record<string, SettingValue> {
  return Object.fromEntries(SETTINGS.filter((d) => d.public).map((d) => [d.key, values[d.key] ?? d.default]));
}

// ---------------- Accessibility: colour contrast (WCAG 2.1) ----------------
function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

// ---------------- Style presets (apply, then fine-tune) ----------------
export interface ThemePreset { id: string; label: string; description: string; values: Record<string, SettingValue> }
export const THEME_PRESETS: ThemePreset[] = [
  { id: "notebook", label: "Blue notebook", description: "The default: ruled paper, blue ink, red margin.", values: {} },
  { id: "chalkboard", label: "Chalkboard", description: "A dark green board with chalk-white text.", values: {
    "theme.mode": "dark", "theme.dark.paper": "#12302A", "theme.dark.surface": "#1B4036", "theme.dark.ink": "#F2F5EE", "theme.color.brand": "#2F8F6B", "theme.color.margin": "#E3B04B", "theme.paper.rules": false } },
  { id: "sunrise", label: "Sunrise", description: "A warm yellow page with deep purple ink.", values: {
    "theme.mode": "light", "theme.color.paper": "#FFF8E6", "theme.color.surface": "#FFFFFF", "theme.color.ink": "#2D1B4E", "theme.color.muted": "#5E4B7A", "theme.color.brand": "#6D28D9", "theme.color.margin": "#E8590C", "theme.color.rule": "#F3E3B3", "theme.radius": "round" } },
  { id: "high-contrast", label: "High contrast", description: "Black and white with strong colours, for easier reading.", values: {
    "theme.mode": "light", "theme.color.paper": "#FFFFFF", "theme.color.surface": "#FFFFFF", "theme.color.ink": "#000000", "theme.color.muted": "#2B2B2B", "theme.color.brand": "#0033CC", "theme.color.margin": "#C00000", "theme.color.rule": "#BFBFBF", "theme.font.scale": "1.12", "theme.motion": "reduced" } },
];
