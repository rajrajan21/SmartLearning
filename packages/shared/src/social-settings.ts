import type { SettingDef, PanelId } from "./settings.js";

/**
 * Admin settings for the Social auto-poster (Facebook photo posts, Instagram reels). Spread into SETTINGS (settings.ts).
 * Five admin pages: "social" (switches and safety), "socialaccounts" (Meta account set-up and keys, with the step-by-step help),
 * "socialplan" (how many runs and posts, time window, rotation, what may be posted), "socialcontent" (captions, hashtags, links, picture and reel look)
 * and "socialqueue" (preview queue, history, retry, reset). Everything is OFF by default and nothing is ever visible to students (all admin-only).
 * The account ids and keys are NOT settings: they live server-side in data/social/secrets.json (write-only in the admin page, never shown, never in git).
 */
const D = "social.enabled";
const bool = (key: string, panel: PanelId, section: string, label: string, def: boolean, o: Partial<SettingDef> = {}): SettingDef =>
  ({ key, panel, section, label, public: false, type: "boolean", default: def, ...o }) as SettingDef;
const num = (key: string, panel: PanelId, section: string, label: string, def: number, min: number, max: number, o: Partial<SettingDef> & { unit?: string; step?: number } = {}): SettingDef =>
  ({ key, panel, section, label, public: false, type: "number", default: def, min, max, step: 1, ...o }) as SettingDef;
const text = (key: string, panel: PanelId, section: string, label: string, def: string, maxLength: number, o: Partial<SettingDef> = {}): SettingDef =>
  ({ key, panel, section, label, public: false, type: "text", default: def, maxLength, ...o }) as SettingDef;
const sel = (key: string, panel: PanelId, section: string, label: string, def: string, options: { value: string; label: string }[], o: Partial<SettingDef> = {}): SettingDef =>
  ({ key, panel, section, label, public: false, type: "select", default: def, options, ...o }) as SettingDef;

export const SOCIAL_DEFAULT_FB_CAPTION = "{title}\n\n{summary}\n\n📚 {board} · Class {grade} · {subject}\n👉 Learn it free, with the teacher explaining step by step: {link}\n\n{hashtags}";
export const SOCIAL_DEFAULT_IG_CAPTION = "{title} 🎓\n\n{summary}\n\nWatch the full lesson free: {link}\n\n{hashtags}";

export const SOCIAL_SETTINGS: SettingDef[] = [
  // ============ Page 1: switches and safety ============
  bool("social.enabled", "social", "Master switch", "Social posting", false, { help: "Everything on the Social pages is OFF until you turn this on. Even then nothing is published until you also untick 'Preview only', tick 'Approve live posting', switch a platform on and save its keys." }),
  bool("social.dryRunOnly", "social", "Safety gates (all must be open to publish)", "Preview only (build the posts but never publish)", true, { dependsOn: D, help: "While this is ticked the poster builds the pictures, reels and captions and shows them in 'Social: queue and history', but publishes nothing. Untick it only when you are happy with the previews." }),
  bool("social.approved", "social", "Safety gates (all must be open to publish)", "Approve live posting", false, { dependsOn: D, help: "Your explicit go-ahead. Live posting needs this ticked, Preview only unticked, the platform switched on below, its keys saved and the kill switch off." }),
  bool("social.killswitch", "social", "Safety gates (all must be open to publish)", "Kill switch (stop all posting now)", false, { help: "Tick to stop every run at once. It also stops automatically after repeated failures (see below). The file data/social/KILL (made by Social-Kill.bat) does the same even when this page is not reachable." }),
  bool("social.fb.enabled", "social", "Platforms", "Facebook Page publishing", false, { dependsOn: D, help: "Posts vertical lesson reels by default. Choose photo posts in the format field below. Enter the Page ID and Page token in Social accounts." }),
  sel("social.fb.format", "social", "Platforms", "Facebook lesson format", "reel", [{ value: "reel", label: "Vertical lesson reel" }, { value: "photo", label: "Lesson diagram photo" }], { dependsOn: "social.fb.enabled" }),
  bool("social.ig.enabled", "social", "Platforms", "Instagram: short video reels", false, { dependsOn: D, help: "A 9:16 reel (animation or slides plus the teacher's voice) with a caption. Needs an Instagram Business or Creator account linked to your Facebook Page, its ID and a publishing token. You can use the Facebook Page token if it has the required Instagram permissions." }),
  num("social.maxPostsPerDay", "social", "Limits", "Most posts per day (all platforms)", 20, 1, 200, { dependsOn: D, help: "A hard daily ceiling, whatever the schedule says. Facebook and Instagram can limit accounts that post too much." }),
  num("social.minSecondsBetweenPosts", "social", "Limits", "Wait between two posts", 90, 10, 3600, { dependsOn: D, unit: "seconds", help: "Slows each run down so it never looks like a flood." }),
  num("social.stopAfterFailures", "social", "Limits", "Pause automatically after this many failures in a row", 3, 1, 20, { dependsOn: D, help: "A bad key or a Meta block makes every post fail. After this many in a row the poster pauses itself (the Social status page shows why; press Resume there after fixing it) so nothing keeps retrying." }),
  bool("social.requireAlt", "social", "Safety checks", "Every picture and reel must have alt text", true, { dependsOn: D, help: "Describes the picture for people who use screen readers. A post without alt text is held back." }),
  bool("social.onlyOwnLinks", "social", "Safety checks", "Captions may only link to this website", true, { dependsOn: D, help: "Blocks any web address that is not this site, so no deal, referral or outside links are ever posted." }),
  bool("social.noStudentData", "social", "Safety checks", "Never include student or account details", true, { dependsOn: D, help: "Posts are built only from the published lessons and diagrams. This tick is a reminder: nothing about children, accounts or progress is ever used." }),

  // ============ Page 2: accounts ============
  text("social.graph.version", "socialaccounts", "Meta connection", "Graph API version", "v27.0", 12, { dependsOn: D, help: "The Meta Graph API version used for every call, for example v27.0. Change it only if Meta retires this one." }),
  text("social.media.publicBase", "socialaccounts", "Meta connection", "Public address of this website (for Instagram)", "https://sharpstudy.in", 120, { dependsOn: D, help: "Instagram does not accept uploaded files: it downloads the reel from a public address. The poster publishes the reel under <this address>/social-media/<random name>. It must be reachable from the internet, so Instagram posts need the site on the server (a PC at home is not enough). Facebook media uploads use the local file directly." }),
  num("social.ig.pollSeconds", "socialaccounts", "Meta connection", "Instagram: how long to wait for Meta to process a reel", 180, 30, 900, { dependsOn: D, unit: "seconds" }),
  num("social.request.timeoutSeconds", "socialaccounts", "Meta connection", "Timeout for each Meta request", 60, 10, 300, { dependsOn: D, unit: "seconds" }),

  // ============ Page 3: schedule and rotation ============
  num("social.runsPerDay", "socialplan", "How often", "Runs per day", 4, 1, 12, { dependsOn: D, help: "Evenly spread through the time window below, unless you type exact times." }),
  num("social.postsPerRun", "socialplan", "How often", "Lessons posted in each run", 5, 1, 20, { dependsOn: D, help: "One distinct lesson per post across Facebook and Instagram. With both platforms connected, the planner alternates them." }),
  num("social.window.startHour", "socialplan", "How often", "Earliest run (hour, India time)", 7, 0, 23, { dependsOn: D, help: "India Standard Time (IST), 24-hour clock." }),
  num("social.window.endHour", "socialplan", "How often", "Latest run (hour, India time)", 21, 1, 24, { dependsOn: D }),
  text("social.runTimes", "socialplan", "How often", "Exact run times (optional, India time)", "", 80, { dependsOn: D, help: "Comma separated 24-hour times such as 08:00,12:30,17:00,20:00. When filled, it replaces 'Runs per day' and the window. Leave empty to spread the runs evenly." }),
  num("social.jitterMinutes", "socialplan", "How often", "Random shift of each run time", 10, 0, 60, { dependsOn: D, unit: "minutes", help: "Moves each run a few minutes either way so posts do not land at the exact same minute every day." }),
  bool("social.schedule.inServer", "socialplan", "How often", "Run on schedule from the website itself", false, { dependsOn: D, help: "For the server: the website checks every few minutes whether a run is due. Leave OFF on your PC and use Schedule-Social-Posts.bat (Windows Task Scheduler) instead. Never switch both on." }),
  bool("social.rotate.avoidSameGrade", "socialplan", "Rotation (different grades and subjects)", "Do not post the same class twice in a row", true, { dependsOn: D, help: "Rotation is fair: every class and subject gets its turn, the one that waited longest goes first." }),
  bool("social.rotate.avoidSameSubject", "socialplan", "Rotation (different grades and subjects)", "Do not post the same subject twice in a row", true, { dependsOn: D }),
  num("social.rotate.minGapPosts", "socialplan", "Rotation (different grades and subjects)", "A class and subject must not return within this many posts", 6, 0, 60, { dependsOn: D, help: "Works as far as there are enough different classes and subjects to choose from." }),
  bool("social.pick.preferPictures", "socialplan", "What may be posted", "Prefer lessons that have a classroom picture or animation", true, { dependsOn: D, help: "Lessons with a classroom board (such as the water cycle) make the best pictures and reels. Others get a clean branded lesson card." }),
  text("social.pick.featuredLessons", "socialplan", "What may be posted", "Featured lesson IDs (optional)", "", 900, { dependsOn: D, help: "Place preferred lesson IDs first for their grade and subject. Use commas between IDs. Published or reserved lessons remain ineligible." }),
  bool("social.pick.onlyPublished", "socialplan", "What may be posted", "Only published lessons", true, { dependsOn: D }),
  bool("social.source.lessons", "socialplan", "What may be posted", "Include school lessons (CBSE, Matric)", true, { dependsOn: D }),
  bool("social.source.gk", "socialplan", "What may be posted", "Include GK lessons", true, { dependsOn: D, help: "Used when the GK section has lessons." }),
  text("social.include.boards", "socialplan", "What may be posted", "Boards to post (ids, comma separated)", "all", 120, { dependsOn: D, help: "all, or for example cbse,tn-matric. Board ids are the first part of a lesson address." }),
  text("social.include.classes", "socialplan", "What may be posted", "Classes to post", "all", 60, { dependsOn: D, help: "all, or for example 3,4,5,6." }),
  text("social.include.subjects", "socialplan", "What may be posted", "Subjects to post (ids)", "all", 200, { dependsOn: D, help: "all, or for example maths,evs,science." }),
  text("social.exclude.subjects", "socialplan", "What may be posted", "Subjects never posted (ids)", "none", 200, { dependsOn: D }),
  text("social.exclude.lessons", "socialplan", "What may be posted", "Lessons never posted (ids)", "none", 600, { dependsOn: D, help: "A lesson id is the lesson file name without .json. The queue page shows each lesson's id." }),

  // ============ Page 4: captions and media ============
  text("social.brand.name", "socialcontent", "Brand", "Name on pictures and reels", "SharpStudy", 30, { dependsOn: D }),
  text("social.brand.tagline", "socialcontent", "Brand", "Line under the name", "Free lessons for every student", 60, { dependsOn: D }),
  text("social.caption.fb", "socialcontent", "Captions", "Facebook caption template", SOCIAL_DEFAULT_FB_CAPTION, 900, { dependsOn: D, help: "Use {title} {summary} {board} {grade} {subject} {chapter} {link} {hashtags} {brand}. Line breaks are kept." }),
  text("social.caption.ig", "socialcontent", "Captions", "Instagram caption template", SOCIAL_DEFAULT_IG_CAPTION, 900, { dependsOn: D, help: "Same variables. Instagram does not make links clickable in a caption, so the address is shown as text; put your link in the profile too." }),
  num("social.caption.summarySentences", "socialcontent", "Captions", "Sentences of the lesson used in {summary}", 2, 1, 5, { dependsOn: D }),
  num("social.caption.maxLength", "socialcontent", "Captions", "Longest caption", 1800, 200, 2200, { dependsOn: D, unit: "characters" }),
  text("social.caption.blockWords", "socialcontent", "Captions", "Words that hold a post back (comma separated)", "none", 300, { dependsOn: D, help: "A post whose caption contains one of these is held back and shown in the queue with the reason." }),
  text("social.hashtags.base", "socialcontent", "Hashtags", "Hashtags on every post", "#SharpStudy #FreeLearning #StudyTips #CBSE #TamilNadu", 200, { dependsOn: D }),
  bool("social.hashtags.perSubject", "socialcontent", "Hashtags", "Add hashtags for the subject and class", true, { dependsOn: D, help: "For example #Maths and #Class5." }),
  num("social.hashtags.max", "socialcontent", "Hashtags", "Most hashtags per post", 10, 0, 30, { dependsOn: D, help: "Instagram allows 30; fewer, well chosen tags work better." }),
  bool("social.link.utm", "socialcontent", "Link", "Add tracking tags to the lesson link", true, { dependsOn: D, help: "Adds ?utm_source=facebook (or instagram) so you can see which posts bring visitors." }),
  text("social.link.utmCampaign", "socialcontent", "Link", "Campaign name in the tracking tag", "lesson-of-the-day", 40, { dependsOn: "social.link.utm" }),
  sel("social.image.style", "socialcontent", "Picture", "Picture style", "auto", [{ value: "auto", label: "Auto: classroom picture when there is one, otherwise a lesson card" }, { value: "board", label: "Classroom picture only (skip lessons without one)" }, { value: "card", label: "Lesson card only" }], { dependsOn: D }),
  sel("social.image.size", "socialcontent", "Picture", "Picture size", "1080x1350", [{ value: "1080x1350", label: "Portrait 4:5 (best on phones)" }, { value: "1080x1080", label: "Square" }, { value: "1200x630", label: "Wide (link-preview shape)" }], { dependsOn: D }),
  sel("social.image.theme", "socialcontent", "Picture", "Colours", "bright", [{ value: "bright", label: "Bright (sky blue and sunny yellow)" }, { value: "paper", label: "Paper (warm, calm)" }, { value: "night", label: "Night (dark blue)" }], { dependsOn: D }),
  bool("social.image.showEmoji", "socialcontent", "Picture", "Show big emoji pictures on lesson cards", true, { dependsOn: D }),
  text("social.alt.template", "socialcontent", "Picture", "Alt text template", "{title}: a {subject} lesson for class {grade} with a diagram, from {brand}", 200, { dependsOn: D }),
  num("social.reel.seconds", "socialcontent", "Vertical lesson reels", "Reel length", 30, 10, 90, { dependsOn: D, unit: "seconds", help: "Length of the lesson excerpt. Increase it if the recorded narration needs more time." }),
  num("social.reel.maxMb", "socialcontent", "Vertical lesson reels", "Largest reel file", 12, 2, 100, { dependsOn: D, unit: "MB", help: "Reels are compressed to stay under this; it also keeps storage small." }),
  bool("social.reel.captions", "socialcontent", "Vertical lesson reels", "Show the teacher's words as captions on the reel", true, { dependsOn: D }),
  bool("social.reel.requireAudio", "socialcontent", "Vertical lesson reels", "Require recorded voice for every reel", false, { dependsOn: D, help: "Off allows captioned videos when matching recordings are missing or longer than the reel. On holds those videos for review." }),
  // ============ Page 5: queue and history ============
  num("social.queue.previewCount", "socialqueue", "Preview", "Posts built in one preview", 5, 1, 20, { dependsOn: D, help: "How many lessons 'Build a preview now' prepares." }),
  num("social.history.keepDays", "socialqueue", "Housekeeping", "Keep failed and held records for", 365, 30, 3650, { dependsOn: D, unit: "days", help: "The permanent history of posted and unconfirmed lessons prevents duplicate posts." }),
  num("social.media.keepDays", "socialqueue", "Housekeeping", "Delete built pictures and reels after", 14, 1, 365, { dependsOn: D, unit: "days", help: "Pictures and reels are only needed until posted. This keeps storage small." }),
  bool("social.history.showErrors", "socialqueue", "Housekeeping", "Show the error text of failed posts", true, { dependsOn: D }),
];
