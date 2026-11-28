import { z } from "zod";
import { LIBRARY_SETTINGS } from "./library-settings.js";
import { CONTRIB_SETTINGS } from "./contribute-settings.js";
import { TOUR_SETTINGS } from "./tour-settings.js";
import { SITE } from "./site.js";
import { GK_SETTINGS } from "./gk-settings.js";
import { VISUALS_SETTINGS } from "./visuals-settings.js";
import { PERF_SETTINGS } from "./perf-settings.js";
import { SOCIAL_SETTINGS } from "./social-settings.js";
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

export type PanelId = "features" | "lessons" | "practice" | "theme" | "home" | "languages" | "catalog" | "site" | "accounts" | "mastery" | "tutor" | "parent" | "tests" | "pages" | "classroom" | "layout" | "app" | "access" | "textbooks" | "papers" | "audiocover" | "library" | "gk" | "gkdaily" | "gkmedia" | "gktools" | "visuals" | "visualpics" | "visualcover" | "social" | "socialaccounts" | "socialplan" | "socialcontent" | "socialqueue" | "reports" | "tour" | "contrib" | "contribchecks" | "contribreader";
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
  { id: "papers", label: "Question papers", help: "Free question papers and quizzes collected automatically from the web: the scheduled collector job, which sites, boards and classes it may use, how many per run and the storage limit." },
  { id: "audiocover", label: "Audio coverage", help: "Which lessons, questions, classroom boards and GK lessons already have recorded teacher audio, and which do not: per voice, with the missing lines and a downloadable list." },
  { id: "tour", label: "How it works video", help: "The animated tour video: where it shows (home page, menu, own page), which language and video play, autoplay and sound, captions, speed, chapters and the words around it. Upload a replacement video here." },
  { id: "library", label: "E-Library", help: "Free, openly licensed kids' books gathered from sites around the world, grouped by age. The collector job (runs on the owner PC, switched OFF until you turn it on), which sites and licences it may use, how many books per run, the storage cap, and how fast the reader opens pages." },
  { id: "contrib", label: "E-Library: contributions", help: "Let visitors contribute books by upload or link: who may, daily limits, anti-abuse, the licences they may declare and which websites links may come from. The moderation queue, takedowns, blocked contributors, term lists and audit log are on this page too." },
  { id: "contribchecks", label: "E-Library: review checks", help: "The automatic checks every contributed book goes through (duplicates, copyright, personal data, unsafe content, quality): on or off, thresholds, auto-approval rules and how long files and reports are kept." },
  { id: "contribreader", label: "E-Library: reader and publishing", help: "What readers get on contributed books (search, contents, notes, night mode, read aloud), the Download button rule, credits, contributor pages and takedown requests." },
  { id: "visuals", label: "Visuals: animations", help: "Animated explainers on the classroom board: on or off, autoplay, speed, reduced motion, and which subjects and classes get them." },
  { id: "visualpics", label: "Visuals: pictures", help: "Openly licensed pictures on the board: on or off, credit lines, where they show, and the size limits used when pictures are downloaded." },
  { id: "visualcover", label: "Visuals: coverage report", help: "How many lessons have animations and pictures, which have none, and which pictures are still to be downloaded." },
  { id: "gk", label: "GK: the shelf", help: "The General Knowledge section: where it appears, which age ranges and categories are listed, filters, the look of the list, order, featured lessons and badges." },
  { id: "gkdaily", label: "GK: daily GK and puzzle", help: "Daily GK on the home page and the Puzzle of the day: how each day's pick is chosen, pinned items, age range, and when puzzle answers can be seen." },
  { id: "gkmedia", label: "GK: lessons, animations, slides, quiz", help: "How GK lessons play: animated explainers, the slides view, read-aloud voice, the quick quiz, facts, related lessons and printing." },
  { id: "gktools", label: "GK: content manager", help: "Tick categories and lessons on or off, feature or pin lessons, see a report of what content exists, reload content from disk, and reset parts of GK to the original values." },
  { id: "social", label: "Social: switches and safety", help: "Auto-posting to Facebook and Instagram: the master switch, preview-only mode, your approval, the kill switch, daily limits and safety checks. Everything is OFF until you open each gate." },
  { id: "socialaccounts", label: "Social: accounts and set-up", help: "Your Facebook Page and Instagram connection: save the keys (they are never shown again), test the connection and follow the step-by-step Meta set-up." },
  { id: "socialplan", label: "Social: schedule and rotation", help: "How many runs a day and posts per run, the time window (India time), fair rotation across classes and subjects, and which lessons may be posted." },
  { id: "socialcontent", label: "Social: captions and media", help: "Caption templates, hashtags, link tracking, the look of the pictures and the length of the reels." },
  { id: "socialqueue", label: "Social: queue and history", help: "Build a preview, see exactly what would be posted, the history of every post with its status, retry failed posts and reset the record of what was posted." },
  { id: "tests", label: "Tests, worksheets and games", help: "Timed chapter tests, printable worksheets and quick games built from the practice questions." },
  { id: "pages", label: "Privacy, terms and about", help: "The text of the privacy, terms and about pages, and the links in the footer." },
  { id: "access", label: "Site access", help: "Open to everyone, or invitation only: visitors must enter an invite code before they can see anything. Create and cancel codes on this page." },
  { id: "reports", label: "Reports", help: "Visitor, sign-up and server reports, and the switch that turns visitor counting on or off." },
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
  bool("search.header.show", "features", "Learning", "Search box in the top bar of every page", true, { dependsOn: "feature.search", help: "Lets students find any subject, chapter or topic from any page." }),
  bool("search.filter.show", "features", "Learning", "Filter box on subject, chapter and notebook lists", true, { dependsOn: "feature.search", help: "Type a word to narrow the list on the page you are on." }),
  bool("search.voice.enabled", "features", "Learning", "Microphone in search fields", true, { help: "Uses speech recognition provided by the browser. Typed search remains available." }),
  bool("search.shortcut.enabled", "features", "Learning", "Press / to jump to the search box", true, { dependsOn: "feature.search" }),
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
  bool("feature.papers", "features", "Learning", "Question papers and quizzes", true, { help: "The Question papers page: free sample, previous-year and model papers with answer boxes, multiple choice and a marking review." }),
  bool("feature.library", "features", "Learning", "E-Library (free kids' books)", true, { help: "Adds an E-Library tab with free, openly licensed children's books grouped by age. The tab only shows once at least one book has been collected (run Harvest-Library-Books.bat on the PC)." }),
  bool("feature.virtualLab", "features", "Learning", "Virtual Lab pilot", true, { help: "Interactive science simulations, guided tips and recorded narration. Turn off to hide the lab section." }),
  bool("feature.gk", "features", "Learning", "GK (General Knowledge) section", true, { help: "A GK tab with space, nature, history, the world, India, science and puzzles that build thinking skills, with animated explainers, slides and quizzes. Four admin pages (GK: ...) control it." }),
  planned("feature.adminEmails", "Admin e-mail notifications", "Off by default; added with accounts."),

  // ---------------- Question papers ----------------
  { key: "papers.list.defaultSort", panel: "papers", section: "Papers list page", label: "Default order", public: true, type: "select", default: "newest", options: [{ value: "newest", label: "Newest first" }, { value: "class", label: "By class, then subject" }, { value: "subject", label: "By subject, then class" }, { value: "questions", label: "Most questions first" }], dependsOn: "feature.papers" },
  { key: "papers.perPage", panel: "papers", section: "Papers list page", label: "Papers per page", public: true, type: "number", default: 24, min: 6, max: 100, step: 2, dependsOn: "feature.papers" },
  bool("papers.nav.show", "papers", "Where Question papers appear", "Question papers in the top menu and footer", true, { dependsOn: "feature.papers", help: "Adds a Question papers entry to the top menu on wide screens. The footer link and home page shortcut follow the same switch." }),
  bool("papers.home.show", "papers", "Where Question papers appear", "Question papers shortcut on the home page", true, { dependsOn: "feature.papers" }),
  bool("papers.list.showFilters", "papers", "Papers list page", "Show the filter boxes (board, class, subject, kind, search)", true, { dependsOn: "feature.papers" }),
  bool("papers.list.showLastScore", "papers", "Papers list page", "Show the student's last score on each paper card", true, { dependsOn: "feature.papers", help: "Kept on the student's own device only." }),
  bool("papers.list.showSource", "papers", "Papers list page", "Show the source website on each paper card", true, { dependsOn: "feature.papers", help: "Turning this off hides the credit on the list only; the source link always stays inside the paper." }),
  { key: "papers.list.minQuestions", panel: "papers", section: "Papers list page", label: "Hide papers with fewer questions than", public: true, type: "number", default: 5, min: 1, max: 100, step: 1, unit: "questions", dependsOn: "feature.papers" },
  bool("papers.list.onlyWithAnswers", "papers", "Papers list page", "Show only papers that have an answer key or marking scheme", false, { dependsOn: "feature.papers" }),
  bool("papers.show.kind.sample", "papers", "Which papers students can see", "Sample papers", true, { dependsOn: "feature.papers" }),
  bool("papers.show.kind.previous", "papers", "Which papers students can see", "Previous-year papers", true, { dependsOn: "feature.papers" }),
  bool("papers.show.kind.model", "papers", "Which papers students can see", "Model papers", true, { dependsOn: "feature.papers" }),
  bool("papers.show.kind.quiz", "papers", "Which papers students can see", "Quizzes", true, { dependsOn: "feature.papers" }),
  bool("papers.show.kind.worksheet", "papers", "Which papers students can see", "Worksheets", true, { dependsOn: "feature.papers" }),
  bool("papers.show.kind.test", "papers", "Which papers students can see", "Term and unit test papers", true, { dependsOn: "feature.papers" }),
  bool("papers.show.board.cbse", "papers", "Which papers students can see", "CBSE papers", true, { dependsOn: "feature.papers" }),
  bool("papers.show.board.matric", "papers", "Which papers students can see", "Matric papers", true, { dependsOn: "feature.papers" }),
  bool("papers.show.board.stateboard", "papers", "Which papers students can see", "State Board papers", true, { dependsOn: "feature.papers" }),
  bool("papers.show.board.ncert", "papers", "Which papers students can see", "NCERT papers", true, { dependsOn: "feature.papers" }),
  bool("papers.show.lang.hi", "papers", "Which papers students can see", "Hindi question papers (own tab on the Question papers page)", true, { dependsOn: "feature.papers", help: "Papers written in Hindi are kept out of the main list and shown under their own Hindi question papers tab. Turn off to hide them completely." }),
  { key: "papers.hiddenSites", panel: "papers", section: "Which papers students can see", label: "Hide all papers from these sources (words from the source name)", public: true, type: "text", maxLength: 300, default: "", dependsOn: "feature.papers", help: "Comma separated, e.g. \"kvs\". Case does not matter. Used by the Hide buttons on the Question papers admin page." },
  { key: "papers.hiddenIds", panel: "papers", section: "Which papers students can see", label: "Hidden papers (ids)", public: true, type: "text", maxLength: 4000, default: "", dependsOn: "feature.papers", help: "Filled in by the Hide / Show buttons on the Question papers admin page. Hidden papers stay stored but students cannot see them." },
  { key: "papers.copyrightNote", panel: "papers", section: "Credits and copyright", label: "Copyright note shown under every paper", public: true, type: "text", maxLength: 400, default: "Papers belong to their original authors and publishers. They are shown here free, for student practice, with a credit and a link to the original page. If you own a paper and want it taken down, tell us and it is hidden straight away.", dependsOn: "feature.papers", help: "Shown under the source line on every paper. Leave empty to hide the note." },
  { key: "papers.takedownContact", panel: "papers", section: "Credits and copyright", label: "Where rights holders can write (e-mail or page address)", public: true, type: "text", maxLength: 200, default: "", dependsOn: "feature.papers", help: "Shown at the end of the copyright note. To remove one website's papers at once use the Hide switch in the Sources table on the Question papers admin page." },
  bool("papers.taking.confirmSubmit", "papers", "Taking a paper", "Ask for confirmation before submitting when some questions are unanswered", true, { dependsOn: "feature.papers" }),
  bool("papers.taking.showMarksPerQuestion", "papers", "Taking a paper", "Show the marks next to each question", true, { dependsOn: "feature.papers" }),
  bool("papers.taking.showNotes", "papers", "Taking a paper", "Show the notes box under each question", true, { dependsOn: "feature.papers" }),
  bool("papers.taking.allowRetry", "papers", "Taking a paper", "Allow trying again after submitting", true, { dependsOn: "feature.papers" }),
  bool("papers.taking.allowPrint", "papers", "Taking a paper", "Show the Print button after submitting", true, { dependsOn: "feature.papers" }),
  bool("papers.taking.allowDownload", "papers", "Taking a paper", "Show the Download result button after submitting", true, { dependsOn: "feature.papers" }),
  bool("papers.review.enabled", "papers", "Marking and review", "Show the marking review after a paper is submitted", true, { dependsOn: "feature.papers", help: "Shows each answer next to the correct one, the student's notes and the marks." }),
  bool("papers.reviewer.enabled", "papers", "Marking and review", "Marking buttons for written answers (student, parent or teacher)", true, { dependsOn: "feature.papers", help: "Shows None / Half / Full buttons and a marks box under each written answer after the paper is submitted." }),
  bool("papers.showModelAnswers", "papers", "Marking and review", "Show model answers and marking-scheme answers in the review", true, { dependsOn: "feature.papers" }),
  { key: "papers.marking.negative", panel: "papers", section: "Marking and review", label: "Marks lost for a wrong multiple-choice answer (fraction of its marks)", public: true, type: "number", default: 0, min: 0, max: 1, step: 0.05, dependsOn: "feature.papers", help: "0 = no negative marking. 0.25 means a wrong answer to a 1-mark question loses 0.25. Unanswered questions never lose marks." },
  { key: "papers.marking.passPercent", panel: "papers", section: "Marking and review", label: "Pass mark", public: true, type: "number", default: 40, min: 0, max: 100, step: 5, unit: "%", dependsOn: "feature.papers", help: "Shown as a gentle \"Keep practising\" or \"Well done\" line under the score." },
  bool("papers.marking.showChapterBreakdown", "papers", "Marking and review", "Show the how-you-did-by-chapter bars", true, { dependsOn: "feature.papers" }),
  bool("papers.marking.showWrongLinks", "papers", "Marking and review", "Show quick links to the questions answered wrongly", true, { dependsOn: "feature.papers" }),
  bool("papers.job.enabled", "papers", "Collector job", "Collector job on", true, { dependsOn: "feature.papers", help: "Master switch, ON since 2026-11-17 (you approved every listed website). When off, Harvest-Question-Papers.bat does nothing. Nothing runs by itself until you start Harvest-Question-Papers.bat or Schedule-Question-Papers.bat on your PC. The PC job reads this page's values from the site at the start of every run (and uses tools/papers/config.json when the site cannot be reached)." }),
  { key: "papers.job.runsPerDay", panel: "papers", section: "Collector job", label: "Runs per day", public: true, type: "number", default: 4, min: 1, max: 12, step: 1, dependsOn: "papers.job.enabled", help: "Used by Schedule-Question-Papers.bat when it creates the Windows scheduled tasks (run that file again after changing this)." },
  { key: "papers.job.perRun", panel: "papers", section: "Collector job", label: "New papers per run", public: true, type: "number", default: 65, min: 1, max: 200, step: 1, dependsOn: "papers.job.enabled", help: "The job stops after this many new papers in one run and carries on at the same place next run." },
  { key: "papers.job.perSiteMax", panel: "papers", section: "Collector job", label: "Most papers from one website in one run", public: true, type: "number", default: 0, min: 0, max: 100, step: 1, dependsOn: "papers.job.enabled", help: "0 = no limit (finish one website before the next). Set a number to spread each run across websites." },
  { key: "papers.job.siteCaps", panel: "papers", section: "Collector job", label: "Most papers per website per day (id:number, comma separated)", public: true, type: "text", maxLength: 300, default: "", dependsOn: "papers.job.enabled", help: "Overrides the built-in daily cap of each website, e.g. \"kalvikavi:10, padasalai:10, cbse-academic:60\". 0 = no cap. The Sources table on the Question papers admin page edits this for you." },
  { key: "papers.job.boards", panel: "papers", section: "Collector job", label: "Boards to collect", public: true, type: "text", maxLength: 80, default: "cbse,matric,stateboard,ncert", dependsOn: "papers.job.enabled", help: "Comma separated: cbse, matric, stateboard, ncert." },
  { key: "papers.job.classes", panel: "papers", section: "Collector job", label: "Classes to collect", public: true, type: "numberlist", default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], dependsOn: "papers.job.enabled" },
  { key: "papers.job.subjects", panel: "papers", section: "Collector job", label: "Only these subjects (empty = all)", public: true, type: "text", maxLength: 200, default: "", dependsOn: "papers.job.enabled", help: "Comma separated words, e.g. \"science, maths\". A paper is collected when its subject contains one of them." },
  { key: "papers.job.kinds", panel: "papers", section: "Collector job", label: "Only these kinds (empty = all)", public: true, type: "text", maxLength: 80, default: "", dependsOn: "papers.job.enabled", help: "Comma separated: sample, previous, model, quiz, worksheet, test." },
  { key: "papers.job.disabledSites", panel: "papers", section: "Collector job", label: "Websites switched off (ids)", public: true, type: "text", maxLength: 300, default: "", dependsOn: "papers.job.enabled", help: "Comma separated ids from tools/papers/sites.json, e.g. cbse-academic. Those websites are skipped." },
  { key: "papers.job.enabledSites", panel: "papers", section: "Collector job", label: "Websites switched ON although off by default (ids)", public: true, type: "text", maxLength: 300, default: "", dependsOn: "papers.job.enabled", help: "For the aggregator websites that ship switched off, e.g. careers360-tn. Only add one after you have read its terms." },
  { key: "papers.job.extraSites", panel: "papers", section: "Collector job", label: "Extra websites to try (page addresses)", public: true, type: "text", maxLength: 600, default: "", dependsOn: "papers.job.enabled", help: "Comma separated page addresses that list free papers. The discovery step checks each (robots rules, PDFs found) before the collector uses it." },
  bool("papers.job.browserMode", "papers", "Collector job", "Use the real browser (Chrome) for websites that block plain downloads", false, { dependsOn: "papers.job.enabled", help: "Opens a normal Chrome window at human speed for websites marked needs-browser. Never used to get past a sign-in, CAPTCHA or a site's no-copying rules." }),
  { key: "papers.job.pauseSeconds", panel: "papers", section: "Collector job", label: "Pause between downloads", public: true, type: "number", default: 8, min: 2, max: 120, step: 1, unit: "seconds", dependsOn: "papers.job.enabled", help: "Politeness delay. Higher is kinder to the source website." },
  { key: "papers.job.maxFileMB", panel: "papers", section: "Collector job", label: "Largest PDF to download", public: true, type: "number", default: 15, min: 1, max: 100, step: 1, unit: "MB", dependsOn: "papers.job.enabled" },
  { key: "papers.job.recrawlHours", panel: "papers", section: "Collector job", label: "Look for new papers on each website every", public: true, type: "number", default: 24, min: 1, max: 720, step: 1, unit: "hours", dependsOn: "papers.job.enabled" },
  { key: "papers.job.retryHours", panel: "papers", section: "Collector job", label: "Try a failed download again after", public: true, type: "number", default: 6, min: 1, max: 168, step: 1, unit: "hours", dependsOn: "papers.job.enabled" },
  { key: "papers.job.minQuestions", panel: "papers", section: "Collector job", label: "Keep a paper only if it has at least this many questions", public: true, type: "number", default: 5, min: 1, max: 50, step: 1, unit: "questions", dependsOn: "papers.job.enabled", help: "Scanned pictures and unusual layouts give few questions and are skipped (and listed in the report)." },
  bool("papers.job.requireKey", "papers", "Collector job", "Keep only papers that came with an answer key or marking scheme", false, { dependsOn: "papers.job.enabled", help: "Turn on for a smaller library where every paper can be marked." }),
  { key: "papers.job.resetCounter", panel: "papers", section: "Collector job", label: "Collector memory reset counter", public: true, type: "number", default: 0, min: 0, max: 100000, step: 1, dependsOn: "papers.job.enabled", help: "Do not edit: the \"Reset collector memory\" button on the Question papers admin page adds 1. The PC job then forgets what it has already seen and looks again." },
  { key: "papers.storage.maxMB", panel: "papers", section: "Storage", label: "Maximum space for collected papers", public: true, type: "number", default: 300, min: 20, max: 5000, step: 10, unit: "MB", dependsOn: "papers.job.enabled", help: "The job stops adding papers when content/papers reaches this size. Papers are stored as small compressed files (about 2 to 30 KB each)." },
  { key: "papers.storage.maxPapers", panel: "papers", section: "Storage", label: "Maximum number of papers", public: true, type: "number", default: 5000, min: 10, max: 100000, step: 10, unit: "papers", dependsOn: "papers.job.enabled" },
  { key: "audio.coverage.voices", panel: "audiocover", section: "Audio coverage page", label: "Voices to check (ids from voices.json, comma separated; empty = all)", public: false, type: "text", maxLength: 120, default: "", help: "For example priya2,ravi2. A lesson counts as complete only when every listed voice has all its sentences." },
  { key: "audio.coverage.checkFiles", panel: "audiocover", section: "Audio coverage page", label: "Also check that each sound file exists on disk", public: false, type: "boolean", default: true, help: "Slower but catches a listed recording whose .mp3 file is missing." },
  { key: "audio.coverage.perPage", panel: "audiocover", section: "Audio coverage page", label: "Rows per page", public: false, type: "number", default: 50, min: 10, max: 500, step: 10 },
  { key: "audio.coverage.defaultFilter", panel: "audiocover", section: "Audio coverage page", label: "Show first", public: false, type: "select", default: "all", options: [{ value: "all", label: "Everything" }, { value: "none", label: "Only items with no audio" }, { value: "partial", label: "Only items with some audio" }, { value: "complete", label: "Only items with all audio" }] },
  { key: "audio.coverage.cacheSeconds", panel: "audiocover", section: "Audio coverage page", label: "Keep the result for", public: false, type: "number", default: 60, min: 0, max: 3600, step: 10, unit: "seconds", help: "Working it out reads every lesson, so the answer is kept briefly. The Check again button always recalculates." },

  // ---------------- Textbooks (book reader) ----------------
  bool("textbooks.nav.show", "textbooks", "Navigation", "Show Textbooks in the top navigation", true, { dependsOn: "feature.textbooks", help: "Controls the Textbooks link in the top navigation. Textbooks remain accessible within Subjects." }),
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
  bool("reader.fastPages", "textbooks", "Speed", "Use ready-made page pictures when they exist", true, { dependsOn: "feature.textbooks", help: "Run Build-Book-Pages.bat once on your PC. Pages then open instantly instead of being drawn from the big PDF. Switch off to always use the PDF." }),
  bool("reader.toc.show", "textbooks", "Contents", "Show the Contents button (chapters and sub-chapters)", true, { dependsOn: "feature.textbooks", help: "Lists the chapters of the book; tap one to jump to its first page." }),
  bool("reader.disclaimer.show", "textbooks", "Notice", "Show the textbook source notice", true, { dependsOn: "feature.textbooks", help: "A small notice in the reader saying the books come from ncert.nic.in and are for students' e-learning." }),
  { key: "reader.disclaimer.text", panel: "textbooks", section: "Notice", label: "Textbook source notice", help: "The wording of the notice shown in the reader (English and Tamil).", public: true, type: "localized", maxLength: 300, multiline: true, dependsOn: "reader.disclaimer.show", default: { en: "These textbooks are sourced from ncert.nic.in and are shown here only for students' e-learning.", ta: "இந்தப் பாடநூல்கள் ncert.nic.in தளத்திலிருந்து பெறப்பட்டவை; மாணவர்களின் இணையவழிக் கற்றலுக்காக மட்டுமே இங்கே காட்டப்படுகின்றன." } },
  bool("reader.showDownload", "textbooks", "Buttons", "Show the Download PDF button", true, { dependsOn: "feature.textbooks", help: "Lets readers save the whole textbook PDF to their device." }),
  bool("reader.showPrint", "textbooks", "Buttons", "Show the Print button", true, { dependsOn: "feature.textbooks", help: "Readers choose between printing the two pages they are looking at or the whole book." }),

  // ---------------- Classroom ----------------
  bool("classroom.autoAdvance", "classroom", "Playing", "Move on to the next step by itself", true, { dependsOn: "feature.classroom", help: "When off, students press Next after each step." }),
  { key: "classroom.stepPauseMs", panel: "classroom", section: "Playing", label: "Pause between steps", public: true, type: "number", default: 1000, min: 0, max: 5000, step: 100, unit: "ms", dependsOn: "classroom.autoAdvance" },
  { key: "classroom.speed", panel: "classroom", section: "Playing", label: "Starting speed", public: true, type: "select", default: "0.85", dependsOn: "feature.classroom",
    options: [
      { value: "0.7", label: "0.7× (Very Slow)" },
      { value: "0.8", label: "0.8× (Slow)" },
      { value: "0.85", label: "0.85× (Calm Default)" },
      { value: "0.9", label: "0.9× (Steady)" },
      { value: "1", label: "1× (Normal)" },
      { value: "1.1", label: "1.1× (Quick)" },
      { value: "1.25", label: "1.25× (Faster)" },
    ] },
  bool("classroom.showCaptions", "classroom", "Playing", "Show the teacher's words as captions", true, { dependsOn: "feature.classroom" }),
  bool("classroom.resume", "classroom", "Parts of the lesson", "Remember where each student stopped and tick finished parts", true, { dependsOn: "feature.classroom", help: "Shows a tick on finished parts, a Continue button on return, and a Next part button. Saved on the student's own device." }),
  bool("classroom.show3d", "classroom", "Board", "Show 3D shapes", true, { dependsOn: "feature.classroom", help: "Drawn by the site itself. Turn off for very old phones; flat drawings are shown instead." }),
  { key: "classroom.boardStyle", panel: "classroom", section: "Board", label: "Board look", public: true, type: "select", default: "white", dependsOn: "feature.classroom",
    options: [{ value: "chalk", label: "Green chalkboard" }, { value: "white", label: "Whiteboard" }] },
  bool("classroom.fitViewport", "classroom", "Board", "Fit board, timeline and controls on one screen", true, { dependsOn: "feature.classroom", help: "Keeps the lesson title, phase pills, drawing board, timeline bar and bottom playback buttons visible together on laptop screens without scrolling." }),
  bool("classroom.smartVisuals", "classroom", "Board", "Draw animated concept diagrams on explanation steps", true, { dependsOn: "feature.classroom", help: "Automatically draws animated percentage bars, layered stacks, side-by-side comparisons, process arrows and key-idea cards during explanations so the board is never blank." }),
  bool("classroom.model3.enabled", "classroom", "Model 2.0 Textbook Mode", "Enable Model 2.0 (Textbook Live Chalkboard) alongside Foundation mode", true, { dependsOn: "feature.classroom", help: "Adds Level 1 & Level 2 interactive chalkboard lessons with on-spot writing, mandatory lab auto-stop confirmation, and zero-lag audio." }),
  { key: "classroom.model3.defaultMode", panel: "classroom", section: "Model 2.0 Textbook Mode", label: "Default lesson mode when Model 2.0 is available", public: true, type: "select", default: "model3", dependsOn: "classroom.model3.enabled",
    options: [{ value: "model3", label: "Model 2.0 · Textbook (Live Chalkboard)" }, { value: "model1", label: "Foundation (Quick Classroom)" }] },
  bool("classroom.model3.darkBoard", "classroom", "Model 2.0 Textbook Mode", "Start Model 2.0 on dark chalkboard (#0b0f14)", true, { dependsOn: "classroom.model3.enabled", help: "Students can also switch between Dark Chalkboard and Light Board directly in the board header." }),
  bool("classroom.voicePicker.onlyRecorded", "classroom", "Voice", "Show only the voices that have audio for this lesson", true, { dependsOn: "classroom.voicePicker", help: "On: the teacher list on a lesson shows only voices that are recorded for that lesson (nothing greyed out). Off: shows every voice, greying out the ones not recorded yet." }),
  bool("classroom.voicePicker", "classroom", "Voice", "Let students choose the teacher voice", true, { dependsOn: "feature.classroom", help: "Shows a list of teacher voices (woman or man, American, British or Indian accent). Voices that have not been recorded yet are greyed out." }),
  { key: "audio.defaultVoice", panel: "classroom", section: "Voice", label: "Default natural English teacher voice (all pages)", public: true, type: "select", default: "maya",
    options: [
      { value: "kani", label: "Lakshmi (natural Indian English)" },
      { value: "maya", label: "Maya (natural English, Edge Neural)" },
      { value: "priya2", label: "Priya (natural English, Edge Neural)" },
      { value: "ravi2", label: "Ram (natural Indian English, Edge Neural)" },
      { value: "malar", label: "Malar (American English)" },
    ],
    help: "Used first across Games, Practice, Revision, Reading Lessons, GK, Praise Phrases and Classroom whenever recordings exist; falls back to another recorded voice if needed." },
  { key: "audio.defaultTamilVoice", panel: "classroom", section: "Voice", label: "Default natural Tamil teacher voice", public: true, type: "select", default: "valluvar",
    options: [
      { value: "valluvar", label: "Valluvar (natural Indian Tamil, Male)" },
      { value: "divya", label: "Divya (Parler natural Indian Tamil, Female)" },
      { value: "jaya", label: "Jaya (Parler Tamil Female)" },
      { value: "murali", label: "Murali (Parler Tamil Male)" },
    ],
    help: "Used first when playing Tamil lesson narration or the Tamil leg of bilingual Tamil -> English translation audio." },
  { key: "audio.defaultHindiVoice", panel: "classroom", section: "Voice", label: "Default natural Hindi teacher voice", public: true, type: "select", default: "swara",
    options: [
      { value: "swara", label: "Swara (natural Indian Hindi, Female)" },
      { value: "madhur", label: "Madhur (natural Indian Hindi, Male)" },
    ],
    help: "Used first when playing Hindi lesson narration or the Hindi leg of bilingual Hindi -> English translation audio." },
  { key: "classroom.language", panel: "classroom", section: "Voice", label: "Language", public: true, type: "select", default: "en", dependsOn: "feature.classroom",
    options: [
      { value: "en", label: "English only" },
      { value: "ta", label: "Tamil only (where Tamil is recorded)" },
      { value: "ta-en", label: "Tamil, then English translation (where recorded)" },
      { value: "both", label: "English, then Tamil (where Tamil is recorded)" },
    ] },
  { key: "classroom.tamilSubjectLanguage", panel: "classroom", section: "Voice", label: "Tamil subject lessons default language", public: true, type: "select", default: "ta-en", dependsOn: "feature.classroom",
    options: [
      { value: "ta-en", label: "Tamil, then English translation" },
      { value: "ta", label: "Tamil only" },
      { value: "both", label: "English, then Tamil" },
      { value: "en", label: "English only" },
    ],
    help: "Applied automatically when opening Tamil subject lessons so students hear natural Tamil paired with English translation." },
  { key: "classroom.hindiSubjectLanguage", panel: "classroom", section: "Voice", label: "Hindi subject lessons default language", public: true, type: "select", default: "hi-en", dependsOn: "feature.classroom",
    options: [
      { value: "hi-en", label: "Hindi, then English translation" },
      { value: "hi", label: "Hindi only" },
      { value: "en", label: "English only" },
    ],
    help: "Applied automatically when opening Hindi subject lessons so students hear natural Hindi paired with English translation." },
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
  bool("lesson.teachBack.speech", "lessons", "Content", "Let students speak their explain-it-yourself answer", false, { dependsOn: "lesson.teachBack.show", help: "Adds a microphone button. It uses the browser's own speech typing; on Chrome the browser may send the audio to its maker to turn it into text. That is why this is off until you choose to switch it on, and the privacy page should say so." }),
  bool("lesson.celebrate", "lessons", "Finish", "Show a celebration when a lesson is finished", true, { dependsOn: "feature.lessons" }),
  { key: "lesson.complete.message", panel: "lessons", section: "Finish", label: "Message after finishing", public: true, type: "localized", maxLength: 120, multiline: true, dependsOn: "feature.lessons",
    default: { en: "Well done! You finished this lesson.", ta: "நன்று! இந்தப் பாடத்தை முடித்துவிட்டீர்கள்." } },
  bool("lesson.completionHub.enabled", "lessons", "Finish", "Show the in-canvas lesson completion hub", true, { dependsOn: "feature.lessons", help: "Shows Start practice, Chapter test, Watch again and Back to the topic right inside the Well done! completion view on both Classroom and Reading lessons." }),
  bool("lesson.completionHub.progressStrip", "lessons", "Finish", "Show the one-line progress strip when a lesson finishes", true, { dependsOn: "lesson.completionHub.enabled", help: "Displays Lesson, Practice, Chapter test and Next topic status ticks in a single compact line inside the completion view." }),
  bool("lesson.completionHub.adaptivePrimary", "lessons", "Finish", "Automatically highlight the next uncompleted step", true, { dependsOn: "lesson.completionHub.enabled", help: "Promotes Start practice first, then Chapter test once practice is passed, and Next lesson once both are done." }),
  bool("lesson.completionHub.showWorksheet", "lessons", "Finish", "Show a Worksheet link in the completion hub", true, { dependsOn: "lesson.completionHub.enabled", help: "Adds a subtle Worksheet shortcut link below the main buttons when printable worksheets are enabled." }),
  bool("lesson.completionHub.showGames", "lessons", "Finish", "Show a Games link in the completion hub", true, { dependsOn: "lesson.completionHub.enabled", help: "Adds a subtle Games shortcut link below the main buttons when chapter games are enabled." }),
  bool("lesson.completionHub.showNextLesson", "lessons", "Finish", "Show a Next lesson link in the completion hub", true, { dependsOn: "lesson.completionHub.enabled", help: "Adds a Next lesson shortcut link when another topic follows in the curriculum." }),

  { key: "narration.teacherName", panel: "lessons", section: "Teacher voice", label: "Teacher name shown to students", public: true, type: "localized", maxLength: 30, dependsOn: "feature.teacherNarration", default: { en: "Malar Teacher", ta: "மலர் டீச்சர்" } },
  bool("narration.autoAdvance", "lessons", "Teacher voice", "Play the next sentence automatically", true, { dependsOn: "feature.teacherNarration" }),
  bool("narration.highlight", "lessons", "Teacher voice", "Highlight the sentence and word being spoken", true, { dependsOn: "feature.teacherNarration" }),
  bool("narration.showBoard", "lessons", "Teacher voice", "Show the teacher's drawing board", true, { dependsOn: "feature.teacherNarration", help: "Shapes and words the teacher writes while speaking." }),
  bool("narration.speedControl", "lessons", "Teacher voice", "Let students change the speaking speed", true, { dependsOn: "feature.teacherNarration" }),
  { key: "narration.defaultSpeed", panel: "lessons", section: "Teacher voice", label: "Starting speed", public: true, type: "select", default: "1", dependsOn: "feature.teacherNarration",
    options: [{ value: "0.8", label: "Slow" }, { value: "1", label: "Normal" }, { value: "1.2", label: "Fast" }] },
  { key: "narration.pauseBetweenMs", panel: "lessons", section: "Teacher voice", label: "Pause between sentences", public: true, type: "number", default: 350, min: 0, max: 2000, step: 50, unit: "ms", dependsOn: "feature.teacherNarration", help: "A short breath after each sentence makes the teacher sound calmer and easier to follow." },
  bool("narration.browserVoice", "lessons", "Teacher voice", "Use the device's own voice when no recorded voice exists", false, { dependsOn: "feature.teacherNarration", help: "Off by default so Games, Practice and Lessons use only natural recorded teacher voices. Switch on only for Tamil or device fallback." }),

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
  bool("practice.adaptive.enabled", "practice", "Adaptive difficulty", "Adjust difficulty inside a round", true, { dependsOn: "feature.practice", help: "After a few wrong answers in a row the next question comes from an easier round; after a few right in a row it comes from a harder one. The round score still counts every question." }),
  { key: "practice.adaptive.wrongStreak", panel: "practice", section: "Adaptive difficulty", label: "Wrong in a row before an easier question", public: true, type: "number", default: 2, min: 2, max: 4, step: 1, dependsOn: "practice.adaptive.enabled" },
  { key: "practice.adaptive.rightStreak", panel: "practice", section: "Adaptive difficulty", label: "Right in a row before a harder question", public: true, type: "number", default: 3, min: 2, max: 6, step: 1, dependsOn: "practice.adaptive.enabled" },
  bool("practice.diagnostic.enabled", "practice", "Topic quick check", "Offer a quick check on each topic that suggests which round to start at", true, { dependsOn: "feature.practice" }),
  { key: "practice.diagnostic.count", panel: "practice", section: "Topic quick check", label: "Questions in the topic quick check", public: true, type: "number", default: 6, min: 4, max: 12, step: 1, dependsOn: "practice.diagnostic.enabled" },
  bool("reports.enabled", "site", "Report a problem", "Let students and parents report a problem with a question or lesson", true, { help: "Shows a small 'Report a problem' button. Reports appear in Admin > Reports. No name or e-mail is asked for." }),
  bool("reports.onQuestions", "site", "Report a problem", "Show the button after each practice answer", true, { dependsOn: "reports.enabled" }),
  bool("reports.onLessons", "site", "Report a problem", "Show the button at the bottom of lessons and classroom pages", true, { dependsOn: "reports.enabled" }),
  bool("reports.logServerErrors", "site", "Report a problem", "Also list server errors in Admin > Reports", true, { dependsOn: "reports.enabled", help: "A one-line note (what failed and where) so you can spot problems early. No stack trace, no personal data." }),
  { key: "reports.maxKept", panel: "site", section: "Report a problem", label: "Most reports kept", public: false, type: "number", default: 500, min: 50, max: 5000, step: 50, dependsOn: "reports.enabled" },
  bool("practice.type.multi", "practice", "Question types", "Allow 'choose all that apply' questions", true, { dependsOn: "feature.practice", help: "Questions of this type are skipped when switched off." }),
  bool("practice.type.match", "practice", "Question types", "Allow matching and diagram-labelling questions", true, { dependsOn: "feature.practice" }),
  bool("practice.type.long", "practice", "Question types", "Allow written-answer questions (marked by key points)", true, { dependsOn: "feature.practice" }),
  bool("practice.passage.show", "practice", "Question types", "Show the passage on case-based questions", true, { dependsOn: "feature.practice" }),
  bool("practice.audio.feedback", "practice", "Teacher voice", "Teacher speaks the feedback after each answer", true, { dependsOn: "feature.practice", help: "Praise or encouragement, then the explanation. Students can switch it off on their own device." }),

  // ---------------- Accounts ----------------
  bool("accounts.signup", "accounts", "Signing up", "Allow new parents to create accounts", true, { dependsOn: "feature.accounts", help: "Switch off to stop new sign-ups; existing parents can still sign in." }),
  { key: "accounts.passwordMinLength", panel: "accounts", section: "Signing up", label: "Shortest password", public: true, type: "number", default: 8, min: 6, max: 30, step: 1, dependsOn: "feature.accounts" },
  { key: "accounts.maxChildren", panel: "accounts", section: "Signing up", label: "Most children per parent", public: true, type: "number", default: 5, min: 1, max: 10, step: 1, dependsOn: "feature.accounts" },
  { key: "accounts.sessionDays", panel: "accounts", section: "Signing in", label: "Stay signed in for", public: true, type: "number", default: 30, min: 1, max: 365, step: 1, unit: "days", dependsOn: "feature.accounts" },
  bool("accounts.method.email", "accounts", "Parent sign-up and sign-in methods", "E-mail and password", true, { dependsOn: "feature.accounts", help: "The usual way: a parent signs up with an e-mail address and a password." }),
  bool("accounts.method.google", "accounts", "Parent sign-up and sign-in methods", "Google sign-in", false, { dependsOn: "feature.accounts", help: "Needs the Google client ID below. Create it free at console.cloud.google.com (APIs and services, Credentials, OAuth client, Web) and add your site address as an allowed origin." }),
  { key: "accounts.google.clientId", panel: "accounts", section: "Parent sign-up and sign-in methods", label: "Google client ID", public: true, type: "text", maxLength: 200, default: "not set", dependsOn: "accounts.method.google", help: "Looks like 1234-abc.apps.googleusercontent.com. This is not a secret." },
  bool("accounts.method.facebook", "accounts", "Parent sign-up and sign-in methods", "Facebook sign-in", false, { dependsOn: "feature.accounts", help: "Needs the Facebook app ID below. Create a free app at developers.facebook.com and add Facebook Login." }),
  { key: "accounts.facebook.appId", panel: "accounts", section: "Parent sign-up and sign-in methods", label: "Facebook app ID", public: true, type: "text", maxLength: 60, default: "not set", dependsOn: "accounts.method.facebook", help: "The numeric App ID. This is not a secret." },
  bool("accounts.method.mobile", "accounts", "Parent sign-up and sign-in methods", "Mobile number with a one-time code", false, { availability: "planned", help: "Needs a paid SMS provider, so it is not active yet. The switch is here for when you add one." }),
  bool("accounts.parentEmails", "accounts", "Signing up", "Ask for the father's and mother's e-mail (for progress reports)", true, { dependsOn: "feature.accounts", help: "Both are optional for the parent. They are kept with the account so reports can be sent to them." }),
  bool("accounts.child.chooseBoard", "accounts", "Signing up", "Parents choose the board for each child (CBSE, Tamil Nadu State Board, Matric)", false, { dependsOn: "feature.accounts", help: "Off: every child is on the board selected under Classes and boards. On: the parent picks from the boards switched on below. Existing children stay on their board." }),
  bool("accounts.child.board.cbse", "accounts", "Signing up", "Board choice: CBSE", true, { dependsOn: "accounts.child.chooseBoard" }),
  bool("accounts.child.board.tnstate", "accounts", "Signing up", "Board choice: Tamil Nadu State Board", false, { dependsOn: "accounts.child.chooseBoard", help: "Only switch on once its lessons are in." }),
  bool("accounts.child.board.tnmatric", "accounts", "Signing up", "Board choice: Tamil Nadu Matriculation", false, { dependsOn: "accounts.child.chooseBoard", help: "Class 9 and 10 lessons are in." }),
  { key: "accounts.maxClassesPerChild", panel: "accounts", section: "Signing up", label: "Most classes one child can study", public: true, type: "number", default: 3, min: 1, max: 6, step: 1, dependsOn: "feature.accounts", help: "A child has a main class and can add more, for example to revise an earlier class." },
  bool("accounts.child.login", "accounts", "Child sign-in", "Let children sign in themselves", true, { dependsOn: "feature.accounts", help: "On the sign-in page a child enters the parent's e-mail and their own name, plus a PIN or a secret answer instead of a password." }),
  bool("accounts.child.pin", "accounts", "Child sign-in", "Allow a 6-digit PIN", true, { dependsOn: "accounts.child.login" }),
  bool("accounts.child.secret", "accounts", "Child sign-in", "Allow a secret question and answer", true, { dependsOn: "accounts.child.login" }),
  bool("accounts.whyNote", "accounts", "Signing up", "Show the note that sign-in is only needed to track progress", true, { dependsOn: "feature.accounts" }),
  bool("accounts.showHeaderLink", "accounts", "Signing in", "Show the account link in the header", true, { dependsOn: "feature.accounts" }),
  { key: "accounts.consentText", panel: "accounts", section: "Privacy", label: "Parent agreement shown when signing up", public: true, type: "localized", maxLength: 400, multiline: true, dependsOn: "feature.accounts",
    default: { en: `I am the parent or guardian. I agree that ${SITE.name} keeps my child's nickname, class and learning progress so it can be saved across devices. I can delete it at any time.`, ta: "நான் பெற்றோர் அல்லது பாதுகாவலர். என் குழந்தையின் புனைப்பெயர், வகுப்பு, கற்றல் முன்னேற்றம் சாதனங்களுக்கிடையே சேமிக்கப்பட இதை ஒப்புக்கொள்கிறேன். நான் எப்போது வேண்டுமானாலும் அழிக்கலாம்." } },

  // ---------------- Mastery and revision ----------------
  bool("mastery.badges", "mastery", "Showing progress", "Show how well each topic is known on chapter pages", true, { dependsOn: "feature.mastery" }),
  bool("mastery.homeCard", "mastery", "Showing progress", "Show the daily revision card on the home page", true, { dependsOn: "feature.mastery" }),
  bool("mastery.progressPage", "mastery", "Showing progress", "Show the 'My progress' page", true, { dependsOn: "feature.mastery" }),
  { key: "progress.layout", panel: "mastery", section: "Showing progress", label: "Progress page layout", public: true, type: "select", default: "cards", dependsOn: "mastery.progressPage",
    help: "Cards: one card per subject with a tile for each chapter. List: the plain list of chapters.",
    options: [{ value: "cards", label: "Cards (subjects as cards, chapters as coloured tiles)" }, { value: "list", label: "List (one row per chapter)" }] },
  bool("progress.classTabs", "mastery", "Showing progress", "Show one class at a time with class tabs", true, { dependsOn: "mastery.progressPage", help: "When off, every open class is shown one after another." }),
  bool("progress.legend.show", "mastery", "Showing progress", "Show the colour key above the cards", true, { dependsOn: "mastery.progressPage" }),
  bool("progress.subjectRing.show", "mastery", "Showing progress", "Show the percentage ring on each subject card", true, { dependsOn: "mastery.progressPage" }),
  bool("progress.showEmptyChapters", "mastery", "Showing progress", "Also show chapters that have no questions yet", false, { dependsOn: "mastery.progressPage" }),
  bool("mistakes.enabled", "mastery", "Mistake notebook", "Keep a notebook of questions answered wrongly", true, { dependsOn: "feature.mastery", help: "Stored on the student's device and synced with their account. Wrong answers are saved with the right answer and explanation." }),
  { key: "mistakes.max", panel: "mastery", section: "Mistake notebook", label: "Most mistakes kept", public: true, type: "number", default: 60, min: 10, max: 200, step: 10, dependsOn: "mistakes.enabled" },
  bool("mistakes.removeWhenRight", "mastery", "Mistake notebook", "Remove a mistake once the student gets it right in the notebook", true, { dependsOn: "mistakes.enabled" }),
  bool("flashcards.enabled", "mastery", "Flashcards", "Allow flip flashcards from the mistake notebook", true, { dependsOn: "mistakes.enabled" }),
  bool("mistakes.homeLink.show", "mastery", "Mistake notebook", "Show a link to the notebook on the revise page", true, { dependsOn: "mistakes.enabled" }),
  bool("mastery.revision.enabled", "mastery", "Revision", "Bring questions back for revision", true, { dependsOn: "feature.mastery", help: "Questions answered correctly return after longer and longer gaps; wrong ones return the next day." }),
  { key: "mastery.revision.dailyLimit", panel: "mastery", section: "Revision", label: "Most questions in one revision", public: true, type: "number", default: 10, min: 3, max: 30, step: 1, dependsOn: "mastery.revision.enabled" },
  { key: "mastery.revision.intervals", panel: "mastery", section: "Revision", label: "Days before each question comes back", public: true, type: "numberlist", default: [1, 3, 7, 14, 30], options: [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60], dependsOn: "mastery.revision.enabled", help: "Up to five steps, from the first return to the last (sorted automatically). Fewer steps means the last gap repeats." },

  // ---------------- Ask the teacher ----------------
  bool("tutor.inLessons", "tutor", "Where it appears", "Show 'Ask Malar Teacher' inside lessons", true, { dependsOn: "feature.aiTutor" }),
  bool("tutor.inPractice", "tutor", "Where it appears", "Show 'Ask Malar Teacher' after answering a practice question", true, { dependsOn: "feature.aiTutor" }),
  bool("tutor.useAI", "tutor", "Answers", "Use the AI model when one is set up on the server", true, { dependsOn: "feature.aiTutor", help: "Off = answers are always taken straight from the lesson. Nothing is sent to any AI service when this is off or no key is set." }),
  bool("tutor.feedback.show", "tutor", "Answers", "Ask 'Was this helpful?' under each answer", true, { dependsOn: "feature.aiTutor", help: "A 'not helpful' answer is sent to Admin > Reports (needs 'Report a problem' on). No name is sent." }),
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
  bool("exams.diagnostic.enabled", "tests", "Quick check", "Offer a quick check that tells the student which practice round to start at", true, { dependsOn: "feature.exams", help: "A short untimed mixed check (easy to hard). It is not saved as a test score." }),
  { key: "exams.diagnostic.count", panel: "tests", section: "Quick check", label: "Questions in the quick check", public: true, type: "number", default: 8, min: 4, max: 16, step: 1, dependsOn: "exams.diagnostic.enabled" },
  { key: "exams.diagnostic.passPercent", panel: "tests", section: "Quick check", label: "Percent right to skip a round", public: true, type: "number", default: 70, min: 40, max: 100, step: 5, dependsOn: "exams.diagnostic.enabled" },
  bool("browse.crossGrade.show", "home", "Learning path across classes", "Offer a 'Path across classes' view on each subject", true, { dependsOn: "feature.browse", help: "Shows the same subject from the lowest to the highest open class, so a student can see what came before and what comes next." }),
  bool("browse.topicTabs.show", "home", "Topic page tabs", "Show Learn, Practice, Worksheet and Test tabs on every topic", true, { help: "One row of tabs so a student can move between the four ways to study. A tab is greyed out when that part is not available yet." }),
  bool("terms.enabled", "tests", "Term papers", "Offer quarterly, half-yearly and annual practice papers on each subject page", true, { dependsOn: "feature.practice", help: "Each paper is built from the chapters that term covers, using the questions already on the site. It is a practice paper, not the school's own paper." }),
  { key: "terms.quarterly.percent", panel: "tests", section: "Term papers", label: "Quarterly paper covers this much of the book (%)", public: true, type: "number", default: 25, min: 10, max: 100, step: 5, dependsOn: "terms.enabled", help: "The first chapters, by share of the book. Match your school's syllabus split." },
  { key: "terms.halfyearly.percent", panel: "tests", section: "Term papers", label: "Half-yearly paper covers this much (%)", public: true, type: "number", default: 50, min: 10, max: 100, step: 5, dependsOn: "terms.enabled" },
  { key: "terms.annual.percent", panel: "tests", section: "Term papers", label: "Annual paper covers this much (%)", public: true, type: "number", default: 100, min: 10, max: 100, step: 5, dependsOn: "terms.enabled" },
  { key: "terms.questionCount", panel: "tests", section: "Term papers", label: "Questions in a term paper", public: true, type: "number", default: 20, min: 8, max: 40, step: 2, dependsOn: "terms.enabled" },
  { key: "terms.minutes", panel: "tests", section: "Term papers", label: "Time allowed (minutes)", public: true, type: "number", default: 90, min: 20, max: 240, step: 10, dependsOn: "terms.enabled" },
  bool("exams.markForReview", "tests", "Chapter tests", "Let students flag questions to look at again", true, { dependsOn: "feature.exams", help: "A flag button during the test; flagged questions are marked in the review." }),
  { key: "exams.blueprint", panel: "tests", section: "Chapter tests", label: "How questions are chosen", public: true, type: "select", default: "balanced", dependsOn: "feature.exams", help: "Balanced takes an equal share from every round, easy to hard, like a real paper. Random picks any.", options: [{ value: "balanced", label: "Balanced across rounds (easy to hard)" }, { value: "random", label: "Random" }] },
  bool("exams.studentChoosesLength", "tests", "Chapter tests", "Let students choose how many questions", false, { dependsOn: "feature.exams", help: "Offers 5, 10, 15 or 20 questions (never more than the chapter has)." }),
  bool("exams.paper.enabled", "tests", "Printable exam paper", "Offer a printable exam paper with marks and an answer key", true, { dependsOn: "feature.worksheets" }),
  { key: "exams.paper.title", panel: "tests", section: "Printable exam paper", label: "Heading on the paper", public: true, type: "text", maxLength: 60, default: "Chapter Test", dependsOn: "exams.paper.enabled" },
  { key: "exams.paper.minutes", panel: "tests", section: "Printable exam paper", label: "Time allowed (minutes)", public: true, type: "number", default: 40, min: 10, max: 180, step: 5, dependsOn: "exams.paper.enabled" },
  { key: "exams.paper.marksObjective", panel: "tests", section: "Printable exam paper", label: "Marks for each objective question", public: true, type: "number", default: 1, min: 1, max: 5, step: 1, dependsOn: "exams.paper.enabled" },
  { key: "exams.paper.marksWritten", panel: "tests", section: "Printable exam paper", label: "Marks for each written question", public: true, type: "number", default: 3, min: 1, max: 10, step: 1, dependsOn: "exams.paper.enabled" },
  { key: "exams.paper.instructions", panel: "tests", section: "Printable exam paper", label: "Instructions line", public: true, type: "text", maxLength: 160, default: "Answer all questions. Write neatly.", dependsOn: "exams.paper.enabled" },
  bool("exams.showReview", "tests", "Chapter tests", "Show a review of every answer at the end", true, { dependsOn: "feature.exams", help: "Shows the right answer and the explanation for each question after the test is marked." }),
  { key: "worksheets.questionCount", panel: "tests", section: "Worksheets", label: "Questions on a worksheet", public: true, type: "number", default: 10, min: 5, max: 30, step: 1, dependsOn: "feature.worksheets" },
  bool("worksheets.answerKey", "tests", "Worksheets", "Answer key for signed-in parents", true, { dependsOn: "feature.worksheets", help: "Signed-in parents can show the answers beside a worksheet. Students who are not signed in never see them." }),
  bool("worksheets.nameLine", "tests", "Worksheets", "Name and date lines at the top", true, { dependsOn: "feature.worksheets" }),
  { key: "worksheets.footer", panel: "tests", section: "Worksheets", label: "Footer printed on every worksheet", public: true, type: "localized", maxLength: 100, dependsOn: "feature.worksheets", default: { en: `${SITE.domain} · free learning for every child`, ta: `${SITE.domain} · ஒவ்வொரு குழந்தைக்கும் இலவசக் கற்றல்` } },
  bool("assessment.hints.enabled", "tests", "Self-study & grading", "Allow on-demand hints in Practice", true, { dependsOn: "feature.practice", help: "Shows a 'Need a Hint?' button before answering when a question has hints." }),
  bool("assessment.solutions.showAfterAnswer", "tests", "Self-study & grading", "Show step-by-step solutions after answering", true, { dependsOn: "feature.practice", help: "Automatically reveals worked solution steps alongside the explanation after a student submits an answer." }),
  bool("assessment.solutions.allowRevealBefore", "tests", "Self-study & grading", "Allow students to reveal step-by-step solutions before answering", true, { dependsOn: "feature.practice", help: "Lets self-study learners inspect a worked solution before locking in an answer." }),
  bool("assessment.tiers.textbookFirst", "tests", "Self-study & grading", "Prioritise official Textbook exercises first", true, { dependsOn: "feature.practice", help: "Orders Textbook questions ahead of Extra Exam and Advanced questions in Practice, Worksheets and Chapter Tests." }),
  bool("assessment.onlineBank.includeHarvested", "tests", "Self-study & grading", "Include online harvested exam questions", true, { dependsOn: "feature.practice", help: "Includes approved school-exam and board-paper questions enriched from online question papers." }),
  bool("worksheet.interactive.enabled", "tests", "Worksheets", "Allow students to solve worksheets online", true, { dependsOn: "feature.worksheets", help: "Lets learners click MCQ options or type Fill-in-the-Blank answers directly on screen and auto-grade with marks." }),
  bool("worksheet.answerKey.allowToggle", "tests", "Worksheets", "Allow Show/Hide Answer Key & Solutions toggle on worksheets", true, { dependsOn: "feature.worksheets", help: "Adds a self-study Answer Key & Solutions toggle for checking printed or online worksheets." }),
  { key: "exam.marks.byTier", panel: "tests", section: "Chapter tests", label: "Default marks by tier (Textbook/Exam/Advanced)", public: true, type: "text", maxLength: 20, default: "1/2/3", dependsOn: "feature.exams", help: "Slash-separated marks for Textbook, Exam Extra, and Advanced questions (e.g. 1/2/3)." },
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
  { key: "pages.disclaimer", panel: "pages", section: "Disclaimer", label: "Disclaimer text", public: true, type: "localized", maxLength: 4000, multiline: true, dependsOn: "feature.sitePages", default: { en: `${SITE.name} is a free learning aid. Lessons, questions and the AI-assisted teacher are written to follow the school syllabus, but they can contain mistakes and are not a substitute for your school, textbook or teacher.\n\nNCERT and other school textbooks belong to their publishers. We link to or show them only for study.\n\nWe never ask for card details, OTPs or payments from students. If anyone asks you for money in our name, do not pay and tell us.` } },
  { key: "pages.grievance", panel: "pages", section: "Grievance officer", label: "Grievance redressal text", public: true, type: "localized", maxLength: 3000, multiline: true, dependsOn: "feature.sitePages", help: "Fill in the officer's real name and address before launch.", default: { en: `If you have a complaint about any content, a child's data or the way the site works, write to our Grievance Officer. We acknowledge complaints within 48 hours and try to resolve them within 15 days.\n\nGrievance Officer: (add name here)` } },
  { key: "pages.contact", panel: "pages", section: "Contact", label: "Contact page text", public: true, type: "localized", maxLength: 2000, multiline: true, dependsOn: "feature.sitePages", default: { en: `Questions, a mistake in a lesson, or a suggestion? Write to us and a person will read it.` } },
  { key: "pages.faq", panel: "pages", section: "FAQ", label: "FAQ text", public: true, type: "localized", maxLength: 6000, multiline: true, dependsOn: "feature.sitePages", default: { en: `Is it free? Yes. There are no ads and no fees.\n\nWhich classes are available? The classes ticked as open in the admin panel, starting with CBSE Class 3 and Class 6.\n\nDo I need an account? No. A parent account only saves progress across devices.\n\nWhy is a lesson not there yet? We add new lessons regularly. Chapters marked "coming up" are being prepared.` } },
  { key: "pages.guidelines", panel: "pages", section: "Community guidelines", label: "Guidelines text", public: true, type: "localized", maxLength: 4000, multiline: true, dependsOn: "feature.sitePages", default: { en: `Be kind. Ask honest questions. Do not share personal details such as phone numbers or addresses. Do not post anything that is unsafe, rude or not meant for children.\n\nThe question helper only answers school questions.` } },
  bool("pages.footerRich", "pages", "Footer", "Show the full footer (about, help, policies, classes)", true, { dependsOn: "feature.sitePages" }),
  { key: "pages.grievanceEmail", panel: "pages", section: "Grievance officer", label: "Grievance e-mail", public: true, type: "text", maxLength: 80, dependsOn: "feature.sitePages", default: `grievance@${SITE.domain}` },
  bool("mail.weekly.enabled", "reports", "Weekly parent e-mail", "Send each parent a weekly summary by e-mail", false, { help: "Off until you enter the mail keys below. Parents get one short note a week: days studied and questions right for each child." }),
  { key: "mail.weekly.day", panel: "reports", section: "Weekly parent e-mail", label: "Day of the week", public: false, type: "select", default: "0", options: [{ value: "0", label: "Sunday" }, { value: "1", label: "Monday" }, { value: "2", label: "Tuesday" }, { value: "3", label: "Wednesday" }, { value: "4", label: "Thursday" }, { value: "5", label: "Friday" }, { value: "6", label: "Saturday" }], dependsOn: "mail.weekly.enabled" },
  { key: "mail.weekly.hour", panel: "reports", section: "Weekly parent e-mail", label: "Send after this hour (server time, 0-23)", public: false, type: "number", default: 18, min: 0, max: 23, step: 1, dependsOn: "mail.weekly.enabled" },
  { key: "mail.weekly.maxPerRun", panel: "reports", section: "Weekly parent e-mail", label: "Most e-mails in one weekly run", public: false, type: "number", default: 200, min: 10, max: 2000, step: 10, dependsOn: "mail.weekly.enabled", help: "Free mail services limit how many you can send a day. Keep this under that limit." },
  { key: "mail.smtp.host", panel: "reports", section: "Mail keys (SMTP)", label: "Mail server", public: false, type: "text", maxLength: 100, default: "not set", help: "For example smtp.gmail.com, smtp-relay.brevo.com or smtp.zoho.in. Fill this in when you have set up a free mail account." },
  { key: "mail.smtp.port", panel: "reports", section: "Mail keys (SMTP)", label: "Port", public: false, type: "number", default: 465, min: 1, max: 65535, step: 1, help: "465 for Secure (SSL), 587 for STARTTLS." },
  { key: "mail.smtp.secure", panel: "reports", section: "Mail keys (SMTP)", label: "Connection type", public: false, type: "select", default: "ssl", options: [{ value: "ssl", label: "Secure (SSL), port 465" }, { value: "starttls", label: "STARTTLS, port 587" }] },
  { key: "mail.smtp.user", panel: "reports", section: "Mail keys (SMTP)", label: "User name", public: false, type: "text", maxLength: 120, default: "not set" },
  { key: "mail.smtp.pass", panel: "reports", section: "Mail keys (SMTP)", label: "Password or app key", public: false, type: "text", maxLength: 200, default: "not set", help: "Use an app password, not your main password. Kept on your server only; it is never sent to visitors." },
  { key: "mail.smtp.from", panel: "reports", section: "Mail keys (SMTP)", label: "From address", public: false, type: "text", maxLength: 120, default: "not set", help: "For example SharpStudy <hello@sharpstudy.in>." },
  bool("backup.enabled", "reports", "Daily backup", "Make a backup copy of accounts, progress and lessons each day", true, { help: "Runs inside the server while it is on. A backup file appears in the backups folder." }),
  { key: "backup.hour", panel: "reports", section: "Daily backup", label: "Backup after this hour (server time, 0-23)", public: false, type: "number", default: 3, min: 0, max: 23, step: 1, dependsOn: "backup.enabled" },
  { key: "backup.keep", panel: "reports", section: "Daily backup", label: "Backups kept", public: false, type: "number", default: 14, min: 1, max: 90, step: 1, dependsOn: "backup.enabled" },
  bool("stats.enabled", "reports", "Counting", "Count page views and visitors (no personal data is kept)", true, { help: "Visitors are stored only as a one-way daily code, never an address. Switch off to stop counting." }),
  { key: "pages.grievanceName", panel: "pages", section: "Grievance officer", label: "Grievance officer name and title", public: true, type: "text", maxLength: 80, dependsOn: "feature.sitePages", help: "Shown on the Grievance page. Set it when you have appointed someone.", default: "To be announced" },
  { key: "brand.logoVersion", panel: "site", section: "Logo and banner", label: "Logo picture version", public: true, type: "number", default: 0, min: 0, max: 1000000000, step: 1, help: "Set automatically when you upload a logo below. 0 means the built-in logo. Save after uploading." },
  { key: "brand.bannerVersion", panel: "site", section: "Logo and banner", label: "Banner picture version", public: true, type: "number", default: 0, min: 0, max: 1000000000, step: 1, help: "Set automatically when you upload a banner below. 0 means no banner. Save after uploading." },
  bool("home.banner.show", "site", "Logo and banner", "Show the banner on the home page", true, { help: "Only shows once a banner picture has been uploaded." }),
  { key: "brand.bannerHeight", panel: "site", section: "Logo and banner", label: "Banner height (pixels)", public: true, type: "number", default: 200, min: 80, max: 500, step: 10 },
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
  { key: "layout.style", panel: "theme", section: "Layout style", label: "Layout style (look of the whole site)", public: true, type: "select", default: "grand",
    help: "How rich the page layout feels: banners, cards, headings and spacing. Works with any theme and palette.",
    options: [{ value: "classic", label: "Classic (simple, as before)" }, { value: "grand", label: "Grand (rich banner, deep cards) - recommended" }, { value: "royal", label: "Royal (serif headings, gold touches)" }, { value: "vibrant", label: "Vibrant (colourful tiles, big rounded cards)" }, { value: "aurora", label: "Aurora (glass panels on a soft glow)" }, { value: "gallery", label: "Gallery (airy, large clean cards)" }] },
  bool("layout.scrollBar", "theme", "Scrolling", "Show a reading-progress line at the top", true, { help: "A thin line that fills as the page is scrolled." }),
  bool("layout.backToTop", "theme", "Scrolling", "Show a back-to-top button", true, { help: "Appears after scrolling down a little." }),
  { key: "layout.width", panel: "theme", section: "Layout style", label: "Page width", public: true, type: "select", default: "wide",
    help: "How much of a wide screen the main content uses. Wide or Full use the empty space on the right.",
    options: [{ value: "standard", label: "Standard (narrow)" }, { value: "wide", label: "Wide - recommended" }, { value: "full", label: "Full (uses most of the screen)" }] },
  { key: "layout.sitePreset", panel: "layout", section: "Site-wide layout", label: "Active layout", public: true, type: "select", default: "classic", options: [{"value": "classic", "label": "Classic"}, {"value": "classroom", "label": "Classroom"}, {"value": "path", "label": "Study Path"}, {"value": "explorer", "label": "Subject Explorer"}, {"value": "dashboard", "label": "Student Dashboard"}, {"value": "activity", "label": "Activity Hub"}, {"value": "reading", "label": "Reading Room"}] },
  { key: "layout.picker", panel: "theme", section: "Layout style", label: "Board and class chooser", public: true, type: "select", default: "left",
    help: "Where the Board, Class and Subject chooser panel sits on wide screens. Bottom keeps only the in-page chooser and the phone tab bar.",
    options: [{ value: "left", label: "Left side - recommended" }, { value: "right", label: "Right side" }, { value: "bottom", label: "Bottom only (no side panel)" }] },
  { key: "layout.header.controlsPercent", panel: "layout", section: "Header sizing", label: "Top-row control size (%)", public: true, type: "number", default: 80, min: 70, max: 125, step: 5, help: "Scales the buttons and search field in the Activity Hub header on pointer devices. Use 100 to restore the original size." },
  { key: "layout.header.navTextPercent", panel: "layout", section: "Header sizing", label: "Navigation text size (%)", public: true, type: "number", default: 120, min: 85, max: 150, step: 5, help: "Changes the text size of the Activity Hub navigation links below the top row. Use 100 to restore the original size." },
  { key: "text.accent.style", panel: "theme", section: "Colourful words", label: "How *starred* words look", public: true, type: "select", default: "gradient",
    help: "In any text you can edit in the admin, words between *stars* get this look. Headlines of pages can also take it.",
    options: [{ value: "gradient", label: "Rainbow gradient text" }, { value: "colour", label: "Solid colours (alternating)" }, { value: "highlight", label: "Highlighter marker" }, { value: "underline", label: "Wavy underline" }, { value: "plain", label: "Plain (no effect)" }] },
  { key: "text.accent.c1", panel: "theme", section: "Colourful words", label: "Accent colour 1", public: true, type: "color", default: "#E8590C" },
  { key: "text.accent.c2", panel: "theme", section: "Colourful words", label: "Accent colour 2", public: true, type: "color", default: "#7C3AED" },
  { key: "text.accent.c3", panel: "theme", section: "Colourful words", label: "Accent colour 3", public: true, type: "color", default: "#0EA5A4" },
  { key: "text.heading.style", panel: "theme", section: "Colourful words", label: "Page headings", public: true, type: "select", default: "colourful",
    help: "Headings (H1, H2) across the site.", options: [{ value: "plain", label: "Plain ink colour" }, { value: "colourful", label: "Colourful gradient" }, { value: "brand", label: "Brand colour" }] },
  { key: "text.heading.weight", panel: "theme", section: "Colourful words", label: "Heading weight", public: true, type: "select", default: "800", options: [{ value: "500", label: "Light" }, { value: "700", label: "Bold" }, { value: "800", label: "Extra bold" }] },
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
  bool("ui.textSize.control", "layout", "Reading comfort", "Text-size buttons in the header (A- / A+)", false, { help: "Students can make text bigger on their own device." }),
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
  bool("parent.share.show", "parent", "Share the weekly summary", "Let a parent copy or share the weekly summary", true, { dependsOn: "feature.parentDashboard", help: "A free alternative to a weekly e-mail: the parent taps Copy or Share and sends it to family or a teacher by WhatsApp or any app. Nothing is sent by the site." }),
  bool("parent.share.whatsapp", "parent", "Share the weekly summary", "Offer a WhatsApp share button", true, { dependsOn: "parent.share.show" }),
  bool("parent.weeklySummary.show", "layout", "Parent weekly summary", "Simple weekly summary at the top of the parent view", true, { dependsOn: "feature.parentDashboard", help: "Plain-language summary of time, topics finished and topics that need another look. Can be printed." }),
  // ---- Round 2: accessibility and phones ----
  bool("a11y.focus.strong", "layout", "Accessibility", "Extra-visible keyboard focus outline", true),
  bool("a11y.targets.large", "layout", "Accessibility", "Make every button and link at least 44 pixels tall", true),
  bool("a11y.highContrast.control", "layout", "Accessibility", "High-contrast button in the header", true, { help: "Lets a student switch to black-on-white (or white-on-black) colours on their own device." }),
  bool("a11y.highContrast.default", "layout", "Accessibility", "High contrast on by default for new visitors", false, { dependsOn: "a11y.highContrast.control" }),
  bool("ui.mobile.polish", "layout", "Phones", "Extra tidy layout for very small phones (360 pixels wide)", true, { help: "Smaller header, two-column tiles and tighter spacing on Home and Browse." }),
  // ---- Round 2b: richer home, browse, lesson, progress, notebook ----
  bool("home.tryLesson.classroom", "layout", "Home dashboard", "Showcase the interactive magnets sample", true, { public: true, dependsOn: "home.tryLesson.show", help: "Uses the narrated Classroom sample when it is available. Otherwise the home page offers an available lesson." }),
  bool("home.tryLesson.show", "layout", "Home dashboard", "'Try a free lesson now' button (no sign-in)", true, { dependsOn: "feature.lessons", help: "Opens a sample lesson straight away. Lessons never need an account." }),
  bool("home.tryLesson.pill", "layout", "Home dashboard", "Use a compact, rounded sample lesson button", true, { dependsOn: "home.tryLesson.show" }),
  bool("home.path.show", "layout", "Home dashboard", "Game-board learning path on the home page", true, { dependsOn: "feature.lessons", help: "A winding path of the next topics, in order, coloured by progress." }),
  { key: "home.path.length", panel: "layout", section: "Home dashboard", label: "Steps shown on the home path", public: true, type: "number", default: 7, min: 3, max: 12, step: 1, dependsOn: "home.path.show" },
  { key: "home.recent.count", panel: "layout", section: "Home dashboard", label: "Recent lessons in 'Pick up where you left off'", public: true, type: "number", default: 3, min: 1, max: 5, step: 1, dependsOn: "home.continue.show" },
  bool("daily.enabled", "home", "Today's short session", "Show a short daily session on the home page", true, { help: "A small checklist: revise what is due, learn one lesson, try the puzzle. Ticks fill in as the student does each part." }),
  { key: "daily.minutes", panel: "home", section: "Today's short session", label: "Minutes shown in the heading", public: true, type: "number", default: 10, min: 5, max: 30, step: 5, dependsOn: "daily.enabled" },
  bool("daily.revise", "home", "Today's short session", "Include 'revise what is due'", true, { dependsOn: "daily.enabled" }),
  bool("daily.lesson", "home", "Today's short session", "Include the next lesson", true, { dependsOn: "daily.enabled" }),
  bool("daily.puzzle", "home", "Today's short session", "Include the puzzle of the day", true, { dependsOn: "daily.enabled" }),
  bool("browse.mindmap.show", "pages", "Chapter map", "Show the chapter map", true, { help: "Each map item opens its topic." }),
  { key: "browse.mindmap.layout", panel: "pages", section: "Chapter map", label: "Map layout", public: true, type: "select", default: "compact", options: [{ value: "compact", label: "Compact overview" }, { value: "radial", label: "Map with branches" }], dependsOn: "browse.mindmap.show" },
  bool("browse.mindmap.expanded", "pages", "Chapter map", "Open the map by default", false, { dependsOn: "browse.mindmap.show" }),
  { key: "browse.topics.layout", panel: "pages", section: "Chapter topics", label: "Topic layout", public: true, type: "select", default: "cards", options: [{ value: "cards", label: "Lesson cards" }, { value: "list", label: "Compact list" }], dependsOn: "feature.chapterTopics" },
  bool("browse.topics.search", "pages", "Chapter topics", "Show search in chapters with more than four topics", true, { dependsOn: "feature.chapterTopics" }),
  bool("browse.mindmap.colourDone", "pages", "Chapter map", "Colour topics the student has finished", true, { dependsOn: "browse.mindmap.show" }),
  { key: "browse.mindmap.maxTopics", panel: "pages", section: "Chapter map", label: "Maximum topics in the map", public: true, type: "number", default: 10, min: 4, max: 16, step: 1, dependsOn: "browse.mindmap.show", help: "The Topics section shows every topic in the chapter." },
  bool("project.show", "home", "Home project of the week", "Show a hands-on project of the week on the home page", true, { help: "A short activity using only things at home. Changes every week, the same for everyone." }),
  bool("project.showShare", "home", "Home project of the week", "Show the 'tell someone' question", true, { dependsOn: "project.show" }),
  bool("share.link.show", "pages", "Share a chapter", "Show a 'Share this chapter' button on chapter pages", true, { help: "For teachers, mentors and parents to send a chapter link to a class or a child. It shares only the page link, nothing about any student." }),
  bool("share.link.whatsapp", "pages", "Share a chapter", "Add a WhatsApp button", true, { dependsOn: "share.link.show" }),
  { key: "share.link.intro", panel: "pages", section: "Share a chapter", label: "Opening line of the shared message", public: true, type: "text", maxLength: 100, default: "Study this free on SharpStudy:", dependsOn: "share.link.show" },
  bool("puzzle.show", "home", "Puzzle of the day", "Show a puzzle of the day on the home page", true, { help: "One brain-teaser a day, the same for everyone. The answer is hidden until the student taps 'Show answer'. No score, no ranking." }),
  bool("puzzle.showAnswer", "home", "Puzzle of the day", "Allow 'Show answer'", true, { dependsOn: "puzzle.show" }),
  bool("home.didYouKnow.show", "layout", "Home dashboard", "'Did you know?' daily card", true, { help: "One friendly fact a day from a small list stored in the site." }),
  bool("reminder.enabled", "home", "Study reminder", "Show a gentle 'time to study' reminder on the home page", false, { dependsOn: "rewards.dailyGoal.enabled", help: "Appears only while the site is open, after the reminder time, when today's goal is not met. Not shown in quiet hours. Students can dismiss it for the day." }),
  { key: "reminder.hour", panel: "home", section: "Study reminder", label: "Reminder time (hour, 24-hour clock)", public: true, type: "number", default: 17, min: 0, max: 23, step: 1, dependsOn: "reminder.enabled" },
  { key: "reminder.quietStart", panel: "home", section: "Study reminder", label: "Quiet hours start (hour)", public: true, type: "number", default: 21, min: 0, max: 23, step: 1, dependsOn: "reminder.enabled", help: "No reminder from this hour..." },
  { key: "reminder.quietEnd", panel: "home", section: "Study reminder", label: "Quiet hours end (hour)", public: true, type: "number", default: 7, min: 0, max: 23, step: 1, dependsOn: "reminder.enabled", help: "...until this hour." },
  bool("rewards.dailyGoal.enabled", "layout", "Daily goal", "Daily goal chip (finish lessons each day)", true, { dependsOn: "rewards.streak.enabled" }),
  { key: "rewards.dailyGoal.lessons", panel: "layout", section: "Daily goal", label: "Lessons to finish each day", public: true, type: "number", default: 1, min: 1, max: 5, step: 1, dependsOn: "rewards.dailyGoal.enabled" },
  bool("rewards.masteryBar.show", "layout", "Badges and progress", "Five-step mastery bar (Not started to Mastered)", true, { dependsOn: "feature.mastery", help: "A segmented bar per chapter on the Progress and chapter pages." }),
  bool("rewards.level.show", "layout", "Badges and progress", "Show a friendly level (grows with lessons and stars)", true, { dependsOn: "feature.mastery" }),
  bool("rewards.certificate.show", "layout", "Badges and progress", "Printable 'what I learned' certificate", true, { dependsOn: "feature.mastery" }),
  bool("notebook.enabled", "layout", "My notebook", "'My notebook': save favourite lessons (the heart button)", true, { dependsOn: "feature.lessons", help: "Saved in the browser. When a child is signed in, the saved lessons are also kept in their own account so they appear on their other devices. Nothing is public. The heart shows on the topic page, the step lesson and the classroom board lesson." }),
  bool("browse.syllabus.show", "layout", "Subjects and chapters", "Syllabus preview on each chapter (topics and rough minutes)", true),
  bool("browse.missionWording.show", "layout", "Subjects and chapters", "Call chapters 'Missions' on the chapter page", true),
  bool("browse.path.show", "layout", "Subjects and chapters", "Visual learning path on each subject page", true, { dependsOn: "feature.lessons" }),
  { key: "browse.path.style", panel: "layout", section: "Subjects and chapters", label: "How the learning path looks", public: true, type: "select", default: "map", dependsOn: "browse.path.show",
    help: "Course map: chapters in order down the page with their topics listed under each. Zig-zag: the older winding path of numbered circles.",
    options: [{ value: "map", label: "Course map (ordered list with topics)" }, { value: "zigzag", label: "Zig-zag path" }] },
  bool("site.disclaimer.show", "layout", "Subjects and chapters", "Parent note: please check chapters match the school syllabus (footer and subject pages)", true, { help: "A free site cannot track every textbook, chapter or question-paper change, so parents are asked to review the content once before their child studies from it." }),
  { key: "site.disclaimer.perDay", panel: "layout", section: "Subjects and chapters", label: "How often 'A note for parents' shows on subject pages", public: true, type: "select", default: "1", options: [{ value: "0", label: "Never on subject pages" }, { value: "1", label: "Once a day" }, { value: "2", label: "Twice a day" }, { value: "99", label: "Every time" }], dependsOn: "site.disclaimer.show", help: "Counted per device. The note in the page footer and the Disclaimer page are not affected." },
  bool("site.disclaimer.closable", "layout", "Subjects and chapters", "Add a close (✕) button to the parent note on subject pages", true, { dependsOn: "site.disclaimer.show", help: "The student or parent can hide the note for that visit. How often it appears each day is set just above." }),
  bool("browse.journey.show", "layout", "Subjects and chapters", "Journey road above the chapter list (every chapter and whether it is complete, in progress or not started)", true, { dependsOn: "feature.lessons", help: "A winding road of all chapters in order on every class and subject page. Green = complete, orange = in progress, blue = not started, grey = coming soon." }),
  bool("browse.path.topics", "layout", "Subjects and chapters", "Show each chapter's topics under it on the course map", true, { dependsOn: "browse.path.show", help: "Lets students jump straight to a topic or lesson without opening the chapter first." }),
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

  // ---- Guided spotlight tour & Help Hub (SITE-01 upgrade) ----
  bool("ux.spotlightTour.enabled", "layout", "Guided tour and help hub", "Interactive spotlight navigation tour", true, { help: "Highlights key buttons on Home, Subject, Chapter, Classroom/Lesson and Practice/Exam results pages with short step-by-step cards." }),
  bool("ux.spotlightTour.autoOpen", "layout", "Guided tour and help hub", "Auto-open the spotlight tour on first visit to each page type", true, { dependsOn: "ux.spotlightTour.enabled", help: "Opens once per page type for new visitors, remembers Skip or Got it permanently, and never interrupts active Classroom audio." }),
  { key: "ux.spotlightTour.maxAutoPerSession", panel: "layout", section: "Guided tour and help hub", label: "Most tours that may auto-open in one session", public: true, type: "number", default: 1, min: 0, max: 5, step: 1, dependsOn: "ux.spotlightTour.autoOpen", help: "Anti-fatigue limit per browser session. 0 disables automatic popups while keeping manual replay available." },
  { key: "ux.spotlightTour.autoDelayMs", panel: "layout", section: "Guided tour and help hub", label: "Delay before auto-opening the spotlight tour", public: true, type: "number", default: 900, min: 0, max: 5000, step: 100, unit: "ms", dependsOn: "ux.spotlightTour.autoOpen", help: "Gives the page a moment to settle before showing the first-visit spotlight." },
  bool("ux.spotlightTour.pages.home", "layout", "Guided tour and help hub", "Spotlight tour on the Home page", true, { dependsOn: "ux.spotlightTour.enabled", help: "Guides students through the Board/Class picker, Today's widgets, E-Library and Question papers." }),
  bool("ux.spotlightTour.pages.subject", "layout", "Guided tour and help hub", "Spotlight tour on Subject pages", true, { dependsOn: "ux.spotlightTour.enabled", help: "Guides students through chapter progress rings, search/filter, Term papers and Study Path." }),
  bool("ux.spotlightTour.pages.chapter", "layout", "Guided tour and help hub", "Spotlight tour on Chapter pages", true, { dependsOn: "ux.spotlightTour.enabled", help: "Upgrades the chapter onboarding guide to cover Topics, Practice, Chapter test/Worksheets/Games and Next chapter." }),
  bool("ux.spotlightTour.pages.lesson", "layout", "Guided tour and help hub", "Spotlight tour on Classroom and Reading lesson pages", true, { dependsOn: "ux.spotlightTour.enabled", help: "Guides students through the timeline seek bar, 0.85x speed and Teacher voice controls, and Done screen next steps." }),
  bool("ux.spotlightTour.pages.results", "layout", "Guided tour and help hub", "Spotlight tour on Practice and Exam results screens", true, { dependsOn: "ux.spotlightTour.enabled", help: "Highlights answer explanations/mistake review and the next-step jump to Chapter test or Next chapter." }),
  bool("ux.helpHub.enabled", "layout", "Guided tour and help hub", "Show the persistent ? Help Hub button", true, { help: "Places a small floating ? button in the corner on supported pages to replay the page tour or jump to key study actions." }),
  bool("ux.helpHub.quickJumps", "layout", "Guided tour and help hub", "Show quick-jump shortcuts in the ? Help Hub", true, { dependsOn: "ux.helpHub.enabled", help: "Adds direct links to Topics, Practice, Chapter test, Worksheet, Games and Next chapter inside the Help Hub menu." }),
  { key: "ux.helpHub.position", panel: "layout", section: "Guided tour and help hub", label: "? Help Hub corner position", public: true, type: "select", default: "right", dependsOn: "ux.helpHub.enabled",
    options: [{ value: "right", label: "Bottom-right" }, { value: "left", label: "Bottom-left" }],
    help: "Choose which bottom corner shows the floating ? Help Hub button." },
  { key: "ux.helpHub.title", panel: "layout", section: "Guided tour and help hub", label: "Help Hub menu heading", public: true, type: "localized", maxLength: 40, dependsOn: "ux.helpHub.enabled",
    default: { en: "Study help", ta: "படிப்பு உதவி" }, help: "Heading shown at the top of the ? Help Hub popup menu." },

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
  { key: "app.install.desktopText", panel: "app", section: "Install", label: "Message on a computer (cannot install there)", public: true, type: "localized", maxLength: 200, multiline: true, dependsOn: "app.install.show",
    default: { en: "To install the app, open this site in a mobile browser: Chrome on Android or Safari on iPhone.", ta: "செயலியை நிறுவ, இந்தத் தளத்தை கைபேசி உலாவியில் திறக்கவும்: ஆண்ட்ராய்டில் குரோம், ஐபோனில் சஃபாரி." }, help: "Shown in the Me area on desktop and laptop browsers." },
  { key: "app.install.otherText", panel: "app", section: "Install", label: "Message on a phone browser that cannot install", public: true, type: "localized", maxLength: 200, multiline: true, dependsOn: "app.install.show",
    default: { en: "Open this page in Chrome (Android) or Safari (iPhone) to add it to your home screen.", ta: "முகப்புத் திரையில் சேர்க்க இந்தப் பக்கத்தை ஆண்ட்ராய்டில் குரோம் அல்லது ஐபோனில் சஃபாரியில் திறக்கவும்." }, help: "Shown on a phone or tablet whose browser has no install button (for example an in-app browser)." },
  bool("app.install.popup.show", "app", "Install", "Show an 'Install the app' pop-up on phones", true, { help: "A small sheet at the bottom of the screen: one tap to install on Android, and the Add to Home Screen steps on iPhone. It never shows once the app is installed." }),
  { key: "app.install.popup.delaySeconds", panel: "app", section: "Install", label: "Show the pop-up after (seconds)", public: true, type: "number", default: 20, min: 3, max: 300, step: 1, dependsOn: "app.install.popup.show" },
  { key: "app.install.popup.snoozeDays", panel: "app", section: "Install", label: "After 'Not now', ask again after (days)", public: true, type: "number", default: 7, min: 1, max: 90, step: 1, dependsOn: "app.install.popup.show" },
  bool("app.install.popup.mobileOnly", "app", "Install", "Only on phones and tablets", true, { dependsOn: "app.install.popup.show" }),
  bool("app.install.popup.ios", "app", "Install", "Also show the steps on iPhone and iPad", true, { dependsOn: "app.install.popup.show" }),

  // ---------------- Home page ----------------
  bool("home.hero.show", "home", "Top of the page", "Show the headline", true),
  { key: "home.hero.lead", panel: "home", section: "Top of the page", label: "Headline: first word(s) in their own block", public: true, type: "localized", maxLength: 40, dependsOn: "home.hero.show",
    help: "Set on the left, with the headline lines starting beside it. Example: *Students,*  (clear this box to drop the block).", default: { en: "*Students,*", ta: "*மாணவர்களே,*" } },
  { key: "home.hero.line1", panel: "home", section: "Top of the page", label: "Headline: first line", public: true, type: "localized", maxLength: 100, dependsOn: "home.hero.show",
    help: "Put *stars* around words to make them colourful. Example: Get *Sharp* knowledge of every *Chapter* to", default: { en: "Get *Sharp* knowledge of every *Chapter* to", ta: "ஒவ்வொரு பாடத்திலும் *கூர்மையான* அறிவைப் பெற்று" } },
  { key: "home.hero.line2", panel: "home", section: "Top of the page", label: "Headline: second line", public: true, type: "localized", maxLength: 100, dependsOn: "home.hero.show",
    help: "Starts exactly under the first line's first word. Example: *MASTER* it !!", default: { en: "*MASTER* it !!", ta: "*தேர்ச்சி* பெறுங்கள் !!" } },
  { key: "home.hero.title", panel: "home", section: "Top of the page", label: "Headline (single piece, only used if the three boxes above are empty)", public: true, type: "localized", maxLength: 160, dependsOn: "home.hero.show",
    help: "Put *stars* around words to make them colourful, for example: Get *Sharp* knowledge of every *Chapter*. Type | (bar) for a new line, and || to set the first words in their own block with the other lines beside it, for example: Students,||Get *Sharp* knowledge of every *Chapter* to|*MASTER* it !!", default: { en: "Students,||Get *Sharp* knowledge of every *Chapter* to|*MASTER* it !!", ta: "ஒவ்வொரு பாடத்திலும் *கூர்மையான* அறிவு பெற்று *தேர்ச்சி* அடையுங்கள்" } },
  { key: "home.hero.subtitle", panel: "home", section: "Top of the page", label: "Line under the headline", public: true, type: "localized", maxLength: 160, multiline: true, dependsOn: "home.hero.show", help: "Put *stars* around words to colour them.",
    default: { en: "Free lessons and practice for all school students. Pick your class to begin.", ta: "அனைத்துப் பள்ளி மாணவர்களுக்கான இலவச பாடங்களும் பயிற்சியும். தொடங்க உங்கள் வகுப்பைத் தேர்ந்தெடுங்கள்." } },
  { key: "home.hero.size", panel: "home", section: "Top of the page", label: "Headline size", public: true, type: "select", default: "m", dependsOn: "home.hero.show", help: "How big the headline is. Smaller sizes fit on two lines.",
    options: [{ value: "s", label: "Small" }, { value: "m", label: "Medium" }, { value: "l", label: "Large" }] },
  { key: "home.cta.label", panel: "home", section: "Top of the page", label: "Sample lesson button text", public: true, type: "localized", maxLength: 40, help: "The words on the big button under the headline.", default: { en: "Try a sample lesson now", ta: "மாதிரிப் பாடத்தை இப்போதே முயற்சி" } },
  { key: "home.cta.note", panel: "home", section: "Top of the page", label: "Note next to the button", public: true, type: "localized", maxLength: 160, multiline: true, help: "The small note to the right of the button. Put *stars* around words to colour them.", default: { en: "No sign-in required. Sign up is needed only for tracking student progress and reporting.", ta: "உள்நுழைவு தேவையில்லை. மாணவர் முன்னேற்றத்தைக் கண்காணிக்கவும் அறிக்கைக்கும் மட்டுமே பதிவு தேவை." } },
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
  bool("lang.tamil.enabled", "languages", "Tamil", "Enable Tamil site interface", true, { help: "Turn off to use English navigation and hide the Tamil switch on desktop and mobile. Tamil subjects and lesson narration remain available." }),
  { key: "lang.default", panel: "languages", section: "Default", label: "Language when a student first arrives", public: true, type: "select", default: "en",
    options: [{ value: "en", label: "English" }, { value: "ta", label: "தமிழ் (Tamil)" }] },
  bool("lang.fallbackToEnglish", "languages", "Default", "Show the English title when a Tamil one is missing", true),
  bool("lang.showBothTitles", "languages", "Default", "Show the other language under each chapter title", false),

  // ---------------- Classes and boards ----------------
  { key: "catalog.openClasses", panel: "catalog", section: "Classes", label: "Classes open to students", public: true, type: "numberlist", default: [3, 4, 5, 6, 7], options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    help: "Other classes appear as 'coming soon'. A class opens only when its content is ready." },
  bool("catalog.showComingSoon", "catalog", "Boards", "Show boards that are not ready yet as 'coming soon'", true),
  { key: "catalog.defaultBoard", panel: "catalog", section: "Boards", label: "Default board (the one students see first)", public: true, type: "select", default: "CBSE",
    options: [{ value: "CBSE", label: "CBSE" }, { value: "TNSTATE", label: "Tamil Nadu State Board" }, { value: "TNMATRIC", label: "Tamil Nadu Matriculation" }],
    help: "The board students land on the first time. With 'Show every board that has lessons' switched on, students can switch to any other board that has lessons; with it off, this is the only board shown (the old behaviour)." },
  bool("catalog.boards.showAll", "catalog", "Boards", "Show every board that has lessons", true, { help: "On: the home page, the side panel and the pickers list every board that has published lessons (for example CBSE and Tamil Nadu Matriculation), each with its own classes and subjects. Off: students see only the default board." }),
  bool("catalog.boards.hideEmpty", "catalog", "Boards", "Hide boards that have no lessons yet", true, { dependsOn: "catalog.boards.showAll", help: "A board with no published lessons is not listed as a choice. With 'coming soon' switched on above, a known board without lessons is shown greyed out instead." }),
  bool("catalog.boards.showCounts", "catalog", "Boards", "Show the number of lessons on each board button", true, { dependsOn: "catalog.boards.showAll" }),
  bool("catalog.boards.remember", "catalog", "Boards", "Remember the board a student chose on this device", true, { dependsOn: "catalog.boards.showAll", help: "Off: every visit starts on the default board." }),
  bool("catalog.boards.showOthers", "catalog", "Boards", "Also show any other board that has lessons", true, { dependsOn: "catalog.boards.showAll", help: "Boards loaded later (not CBSE, Tamil Nadu State Board or Tamil Nadu Matriculation) appear on their own with the name they were loaded with." }),
  { key: "catalog.boards.order", panel: "catalog", section: "Boards", label: "Board order", public: true, type: "text", maxLength: 80, default: "CBSE,TNMATRIC,TNSTATE", dependsOn: "catalog.boards.showAll",
    help: "Board codes separated by commas, first one listed first: CBSE, TNMATRIC, TNSTATE. Boards not listed come after." },
  bool("catalog.board.cbse.show", "catalog", "Show or hide each board", "CBSE", true, { dependsOn: "catalog.boards.showAll" }),
  bool("catalog.board.tnmatric.show", "catalog", "Show or hide each board", "Tamil Nadu Matriculation", true, { dependsOn: "catalog.boards.showAll" }),
  bool("catalog.board.tnstate.show", "catalog", "Show or hide each board", "Tamil Nadu State Board", true, { dependsOn: "catalog.boards.showAll" }),
  { key: "catalog.board.cbse.label", panel: "catalog", section: "Board names", label: "Name shown for CBSE", public: true, type: "localized", maxLength: 60, default: { en: "CBSE", ta: "சிபிஎஸ்இ" } },
  { key: "catalog.board.tnmatric.label", panel: "catalog", section: "Board names", label: "Name shown for Tamil Nadu Matriculation", public: true, type: "localized", maxLength: 60, default: { en: "Tamil Nadu Matriculation", ta: "தமிழ்நாடு மெட்ரிகுலேஷன்" } },
  { key: "catalog.board.tnstate.label", panel: "catalog", section: "Board names", label: "Name shown for Tamil Nadu State Board", public: true, type: "localized", maxLength: 60, default: { en: "Tamil Nadu State Board", ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம்" } },

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
  ...GK_SETTINGS,
  ...VISUALS_SETTINGS,
  ...PERF_SETTINGS,
  ...SOCIAL_SETTINGS,
];

SETTINGS.push(...TOUR_SETTINGS); // How it works video (see tour-settings.ts)
SETTINGS.push(...LIBRARY_SETTINGS); // E-Library (see library-settings.ts)
SETTINGS.push(...CONTRIB_SETTINGS); // E-Library contributions (see contribute-settings.ts)
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
      const t = z.string().trim().min(d.default === "" ? 0 : 1).max(d.maxLength).safeParse(value);
      return t.success ? t.data : fail(`must be ${d.default === "" ? 0 : 1} to ${d.maxLength} characters`);
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
