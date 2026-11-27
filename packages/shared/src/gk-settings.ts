import type { SettingDef, PanelId } from "./settings.js";

/**
 * Admin settings for the GK (General Knowledge) section. Spread into SETTINGS (settings.ts).
 * Four admin pages: "gk" (the shelf: what is listed and how), "gkdaily" (Daily GK and Puzzle of the day),
 * "gkmedia" (lessons, animations, slides, quizzes, read-aloud) and "gktools" (content manager with the per-lesson and
 * per-category controls, a content report, reload and reset actions; its own screen in apps/web/src/admin/GkAdmin.tsx).
 * List-type settings are comma separated ids. To empty a list use "Reset" (the save box does not accept blanks).
 */
const bool = (key: string, panel: PanelId, section: string, label: string, def: boolean, o: Partial<SettingDef> = {}): SettingDef =>
  ({ key, panel, section, label, public: true, type: "boolean", default: def, dependsOn: "feature.gk", ...o }) as SettingDef;
const num = (key: string, panel: PanelId, section: string, label: string, def: number, min: number, max: number, o: Partial<SettingDef> & { unit?: string; step?: number } = {}): SettingDef =>
  ({ key, panel, section, label, public: true, type: "number", default: def, min, max, step: 1, dependsOn: "feature.gk", ...o }) as SettingDef;
const text = (key: string, panel: PanelId, section: string, label: string, def: string, maxLength: number, o: Partial<SettingDef> = {}): SettingDef =>
  ({ key, panel, section, label, public: true, type: "text", default: def, maxLength, dependsOn: "feature.gk", ...o }) as SettingDef;
const sel = (key: string, panel: PanelId, section: string, label: string, def: string, options: { value: string; label: string }[], o: Partial<SettingDef> = {}): SettingDef =>
  ({ key, panel, section, label, public: true, type: "select", default: def, options, dependsOn: "feature.gk", ...o }) as SettingDef;

const AGE_OPTS = [{ value: "any", label: "Any age" }, { value: "5-7", label: "Ages 5 to 7" }, { value: "8-10", label: "Ages 8 to 10" }, { value: "11-13", label: "Ages 11 to 13" }, { value: "14+", label: "Ages 14 and up" }];

export const GK_SETTINGS: SettingDef[] = [
  // ============ Page 1: GK shelf ============
  bool("gk.nav.show", "gk", "Where GK appears", "GK in the top menu, phone tab bar and footer", true, { help: "Adds a GK entry next to Subjects and Explore." }),
  bool("gk.home.show", "gk", "Where GK appears", "GK card on the home page", true, { help: "A card on the home page with today's GK fact, today's puzzle and a button to open the GK section." }),
  { key: "gk.tab.label", panel: "gk", section: "Where GK appears", label: "Name of the section", public: true, type: "localized", default: { en: "GK", ta: "பொது அறிவு" }, maxLength: 24, dependsOn: "feature.gk", help: "Shown in the menu and as the page title, for example GK, General Knowledge or Brain Gym." } as SettingDef,
  { key: "gk.intro", panel: "gk", section: "Where GK appears", label: "Line under the page title", public: true, type: "localized", default: { en: "Space, nature, history, the world and puzzles that make you think sharper.", ta: "" }, maxLength: 160, multiline: false, dependsOn: "feature.gk" } as SettingDef,
  bool("gk.showSearch", "gk", "Filters on the GK page", "Search box", true),
  bool("gk.showAgeFilter", "gk", "Filters on the GK page", "Age range picker", true, { help: "Readers pick Ages 5 to 7, 8 to 10, 11 to 13 or 14 and up to see lessons made for that age." }),
  bool("gk.showCategoryFilter", "gk", "Filters on the GK page", "Category chips", true),
  bool("gk.showKindFilter", "gk", "Filters on the GK page", "Lessons / Puzzles switch", true),
  bool("gk.showCounts", "gk", "Filters on the GK page", "Show how many lessons are in each category and age range", true),
  text("gk.ageBands", "gk", "Age ranges", "Age ranges offered in the picker", "5-7,8-10,11-13,14+", 40, { help: "Comma separated, from: 5-7, 8-10, 11-13, 14+. Leave out a range to hide its lessons from the picker (they stay reachable by link)." }),
  sel("gk.defaultAge", "gk", "Age ranges", "Which age range is selected when the page opens", "any", AGE_OPTS, { help: "Any age shows everything until the reader picks a range. A parent's choice is remembered in their browser." }),
  bool("gk.rememberAge", "gk", "Age ranges", "Remember the reader's age choice on their device", true),
  sel("gk.view.default", "gk", "How the list looks", "Starting view", "categories", [{ value: "categories", label: "By category (shelves)" }, { value: "list", label: "One list of cards" }, { value: "ages", label: "By age range" }]),
  sel("gk.cards.style", "gk", "How the list looks", "Card size", "roomy", [{ value: "roomy", label: "Roomy (picture, summary, badges)" }, { value: "compact", label: "Compact (title and badges only)" }]),
  num("gk.perPage", "gk", "How the list looks", "Cards per page (list view)", 24, 6, 120, { step: 2 }),
  num("gk.shelf.size", "gk", "How the list looks", "Lessons shown per category shelf before 'See all'", 6, 2, 24),
  sel("gk.sort", "gk", "Order", "Order of lessons inside a category", "curated", [{ value: "curated", label: "Curated (easy to harder, as written)" }, { value: "az", label: "A to Z" }, { value: "short", label: "Shortest first" }, { value: "age", label: "Youngest age first" }]),
  text("gk.categoryOrder", "gk", "Order", "Categories to list first (ids, comma separated)", "space,earth,body,nature,india", 200, { help: "Category ids in the order you want; the rest follow in their usual order. See ids on the GK content manager page." }),
  text("gk.categoriesHidden", "gk", "Order", "Categories switched off (ids)", "none", 200, { help: "Comma separated category ids. Their lessons are not listed. 'none' means nothing is hidden. Use the GK content manager page to tick categories instead of typing." }),
  text("gk.featured", "gk", "Featured", "Featured lessons (ids)", "none", 400, { help: "Lessons pinned to the top of the GK page, in this order. 'none' means no featured row. Easier to pick on the GK content manager page." }),
  num("gk.featured.max", "gk", "Featured", "Most featured lessons to show", 6, 1, 12),
  text("gk.lessonsHidden", "gk", "Featured", "Individual lessons switched off (ids)", "none", 600, { help: "These lessons are not listed or opened. 'none' means every lesson is available." }),
  bool("gk.showNew", "gk", "Badges on cards", "'New' badge on recently added lessons", true),
  bool("gk.showMinutes", "gk", "Badges on cards", "Show reading time (for example 4 min)", true),
  bool("gk.showAgeBadge", "gk", "Badges on cards", "Show the age range on each card", true),
  bool("gk.showAnimBadge", "gk", "Badges on cards", "Show the 'plays' badge on lessons with an animation", true, { dependsOn: "gk.anim.enabled" }),
  bool("gk.showDone", "gk", "Badges on cards", "Tick lessons the reader has finished (on their device)", true, { dependsOn: "gk.progress.track" }),

  // ============ Page 2: Daily GK and puzzle ============
  bool("gk.daily.enabled", "gkdaily", "Daily GK", "Daily GK on", true, { help: "One lesson highlighted each day, the same for everyone." }),
  bool("gk.daily.showOnHome", "gkdaily", "Daily GK", "Show Daily GK on the home page", true, { dependsOn: "gk.daily.enabled" }),
  sel("gk.daily.mode", "gkdaily", "Daily GK", "How today's GK is chosen", "rotate", [{ value: "rotate", label: "Rotate through all lessons" }, { value: "featured", label: "Rotate through featured lessons only" }, { value: "category", label: "Rotate inside one category" }, { value: "pinned", label: "Always the pinned lesson" }], { dependsOn: "gk.daily.enabled" }),
  text("gk.daily.category", "gkdaily", "Daily GK", "Category for 'inside one category' (id)", "space", 40, { dependsOn: "gk.daily.enabled" }),
  text("gk.daily.pinnedId", "gkdaily", "Daily GK", "Pinned lesson (id)", "none", 80, { dependsOn: "gk.daily.enabled", help: "Used when the choice above is 'the pinned lesson'." }),
  sel("gk.daily.age", "gkdaily", "Daily GK", "Age range for Daily GK", "any", AGE_OPTS, { dependsOn: "gk.daily.enabled", help: "Any age picks from every range. The reader's own age choice is used when 'Remember age' is on and they picked one." }),
  num("gk.daily.shuffle", "gkdaily", "Daily GK", "Reshuffle number", 0, 0, 999, { dependsOn: "gk.daily.enabled", help: "Change this number to reshuffle the order in which days pick lessons." }),
  bool("gk.daily.showFact", "gkdaily", "Daily GK", "Show one 'Did you know?' fact from today's lesson on the home page", true, { dependsOn: "gk.daily.enabled" }),
  num("gk.daily.count", "gkdaily", "Daily GK", "How many daily lessons to show (1 to 3)", 1, 1, 3, { dependsOn: "gk.daily.enabled" }),
  bool("gk.puzzle.enabled", "gkdaily", "Puzzle of the day", "Puzzle of the day on", true, { help: "One brain-teaser a day from the GK puzzle lessons, with the thinking method explained after." }),
  bool("gk.puzzle.showOnHome", "gkdaily", "Puzzle of the day", "Show the GK puzzle on the home page", true, { dependsOn: "gk.puzzle.enabled" }),
  sel("gk.puzzle.mode", "gkdaily", "Puzzle of the day", "How today's puzzle is chosen", "rotate", [{ value: "rotate", label: "Rotate through all puzzle lessons" }, { value: "pinned", label: "Always the pinned puzzle" }, { value: "method", label: "Rotate inside one method" }], { dependsOn: "gk.puzzle.enabled" }),
  text("gk.puzzle.pinnedId", "gkdaily", "Puzzle of the day", "Pinned puzzle (id)", "none", 80, { dependsOn: "gk.puzzle.enabled" }),
  text("gk.puzzle.method", "gkdaily", "Puzzle of the day", "Method for 'inside one method' (for example Work backwards)", "none", 60, { dependsOn: "gk.puzzle.enabled" }),
  sel("gk.puzzle.age", "gkdaily", "Puzzle of the day", "Age range for the puzzle", "any", AGE_OPTS, { dependsOn: "gk.puzzle.enabled" }),
  num("gk.puzzle.shuffle", "gkdaily", "Puzzle of the day", "Reshuffle number", 0, 0, 999, { dependsOn: "gk.puzzle.enabled" }),
  sel("gk.puzzle.reveal", "gkdaily", "Puzzle of the day", "When the answer can be seen", "after-think", [{ value: "after-think", label: "After the reader has tried (a think-time button)" }, { value: "button", label: "Any time (a Show answer button)" }, { value: "after-tries", label: "After a number of wrong tries" }, { value: "never", label: "Not on the home page: only inside the lesson" }], { dependsOn: "gk.puzzle.enabled" }),
  num("gk.puzzle.tries", "gkdaily", "Puzzle of the day", "Wrong tries before the answer shows", 2, 1, 5, { dependsOn: "gk.puzzle.enabled" }),
  num("gk.puzzle.thinkSeconds", "gkdaily", "Puzzle of the day", "Think time before the answer button wakes up", 20, 0, 180, { unit: "seconds", dependsOn: "gk.puzzle.enabled", help: "Gives the reader time to think first. 0 shows the button at once." }),
  bool("gk.puzzle.showMethod", "gkdaily", "Puzzle of the day", "Show the thinking-method name on the puzzle card", true, { dependsOn: "gk.puzzle.enabled" }),
  bool("gk.puzzle.showHint", "gkdaily", "Puzzle of the day", "Offer a hint (the 'how to think' step) before the answer", true, { dependsOn: "gk.puzzle.enabled" }),

  // ============ Page 3: lessons, animations, slides, quizzes ============
  bool("gk.anim.enabled", "gkmedia", "Animations and pictures", "Animated explainers", true, { help: "Lightweight animations drawn in the browser (the moon's phases, planets orbiting, the water cycle ...). Turn off for the old or slow phones: the lesson then shows the still diagram or nothing." }),
  bool("gk.anim.autoplay", "gkmedia", "Animations and pictures", "Start animations by themselves", true, { dependsOn: "gk.anim.enabled", help: "Off: the reader presses Play. Animations always stay still for visitors whose device asks for reduced motion." }),
  sel("gk.anim.speed", "gkmedia", "Animations and pictures", "Animation speed", "normal", [{ value: "slow", label: "Slow (easy to follow)" }, { value: "normal", label: "Normal" }, { value: "fast", label: "Fast" }], { dependsOn: "gk.anim.enabled" }),
  bool("gk.anim.controls", "gkmedia", "Animations and pictures", "Play / pause and speed buttons on animations", true, { dependsOn: "gk.anim.enabled" }),
  bool("gk.anim.caption", "gkmedia", "Animations and pictures", "Caption under each picture", true, { dependsOn: "gk.anim.enabled" }),
  text("gk.anim.disabledIds", "gkmedia", "Animations and pictures", "Animations switched off (picture ids)", "none", 300, { dependsOn: "gk.anim.enabled", help: "Comma separated picture ids, for example solar-system,tides. They show a still picture instead. 'none' keeps all on." }),
  bool("gk.slides.enabled", "gkmedia", "Slides (presentation view)", "Slides view", true, { help: "Each lesson can also be played as slides: one idea per slide with big words, the picture and the teacher's voice." }),
  sel("gk.slides.default", "gkmedia", "Slides (presentation view)", "Lesson opens as", "lesson", [{ value: "lesson", label: "Lesson (scrolling steps)" }, { value: "slides", label: "Slides" }], { dependsOn: "gk.slides.enabled" }),
  bool("gk.slides.autoAdvance", "gkmedia", "Slides (presentation view)", "Move to the next slide when the narration ends", true, { dependsOn: "gk.slides.enabled" }),
  bool("gk.slides.bullets", "gkmedia", "Slides (presentation view)", "Show the short points on each slide", true, { dependsOn: "gk.slides.enabled" }),
  bool("gk.slides.fullscreen", "gkmedia", "Slides (presentation view)", "Full screen button", true, { dependsOn: "gk.slides.enabled" }),
  bool("gk.slides.keys", "gkmedia", "Slides (presentation view)", "Arrow keys and space move through slides", true, { dependsOn: "gk.slides.enabled" }),
  bool("gk.audio.enabled", "gkmedia", "Read aloud (teacher voice)", "Listen button on lessons", true, { help: "Plays the teacher's recorded voice (made by Generate-Lesson-Audio.bat). Sentences without a recording are read by the device's own voice when allowed below." }),
  bool("gk.audio.deviceVoice", "gkmedia", "Read aloud (teacher voice)", "Let the device read sentences that have no recording yet", false, { dependsOn: "gk.audio.enabled", help: "Off by default so GK lessons play natural recorded teacher audio instead of the browser voice." }),
  bool("gk.audio.autoplay", "gkmedia", "Read aloud (teacher voice)", "Start reading as soon as a lesson opens", false, { dependsOn: "gk.audio.enabled" }),
  sel("gk.audio.rate", "gkmedia", "Read aloud (teacher voice)", "Starting speed of the voice", "1", [{ value: "0.85", label: "Slower" }, { value: "1", label: "Normal" }, { value: "1.15", label: "Faster" }], { dependsOn: "gk.audio.enabled" }),
  bool("gk.video.youtube.enabled", "gkmedia", "Lesson videos", "Play curated YouTube videos inside GK lessons", false, { help: "Enable after designating SharpStudy as child-directed with YouTube in Google Search Console. The privacy-enhanced player loads only when a reader chooses Watch video." }),
  bool("gk.quiz.enabled", "gkmedia", "Quiz after the lesson", "Quick quiz after every lesson", true),
  num("gk.quiz.max", "gkmedia", "Quiz after the lesson", "Most questions in a quiz", 4, 1, 6, { dependsOn: "gk.quiz.enabled" }),
  bool("gk.quiz.shuffle", "gkmedia", "Quiz after the lesson", "Shuffle the answer choices", true, { dependsOn: "gk.quiz.enabled" }),
  bool("gk.quiz.showWhy", "gkmedia", "Quiz after the lesson", "Explain why the answer is right (after each question)", true, { dependsOn: "gk.quiz.enabled" }),
  bool("gk.quiz.retry", "gkmedia", "Quiz after the lesson", "Let the reader try a quiz again", true, { dependsOn: "gk.quiz.enabled" }),
  num("gk.quiz.passPercent", "gkmedia", "Quiz after the lesson", "Score that earns a star", 60, 10, 100, { unit: "%", dependsOn: "gk.quiz.enabled" }),
  bool("gk.facts.enabled", "gkmedia", "Extras on a lesson", "'Did you know?' facts", true),
  num("gk.facts.max", "gkmedia", "Extras on a lesson", "Most facts shown", 3, 1, 6, { dependsOn: "gk.facts.enabled" }),
  bool("gk.notes.show", "gkmedia", "Extras on a lesson", "Notes and sources for parents and teachers", true),
  bool("gk.asOf.show", "gkmedia", "Extras on a lesson", "Show 'as of <date>' on facts that can change", true),
  bool("gk.related.show", "gkmedia", "Extras on a lesson", "Related lessons at the end", true),
  num("gk.related.max", "gkmedia", "Extras on a lesson", "Most related lessons shown", 3, 1, 6, { dependsOn: "gk.related.show" }),
  bool("gk.progress.track", "gkmedia", "Extras on a lesson", "Remember finished lessons on the reader's device", true, { help: "Stored only in the browser (nothing is sent to the server)." }),
  bool("gk.share.show", "gkmedia", "Extras on a lesson", "Share link button", true),
  bool("gk.print.enabled", "gkmedia", "Extras on a lesson", "Print button (clean one-page print of the lesson)", true),
];
