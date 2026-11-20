import type { SettingDef } from "./settings.js";

/**
 * Admin settings for speed ("Site and performance" page, section "Speed"). Spread into SETTINGS (settings.ts).
 * None of these are public: only the server reads them. Defaults are safe: behaviour is identical, only faster.
 */
const num = (key: string, label: string, def: number, min: number, max: number, step: number, unit: string, help: string): SettingDef =>
  ({ key, panel: "site", section: "Speed", label, public: false, type: "number", default: def, min, max, step, unit, help }) as SettingDef;
const bool = (key: string, label: string, def: boolean, help: string): SettingDef =>
  ({ key, panel: "site", section: "Speed", label, public: false, type: "boolean", default: def, help }) as SettingDef;

export const PERF_SETTINGS: SettingDef[] = [
  bool("perf.classroom.lazy", "Build classroom boards only when a lesson changes", true,
    "On: the classroom boards are built once, saved to data/cache, and only lessons that were added or edited are built again. Off: every board is rebuilt whenever any lesson file changes (the old way; slower once there are many lessons)."),
  bool("perf.prewarm", "Prepare the classroom boards right after the site starts", true,
    "The first visitor does not have to wait while the boards are made. Uses a few seconds of the computer right after start-up."),
  num("perf.fileCheck.seconds", "Look for changed content files every", 5, 0, 60, 1, "seconds",
    "How often the site checks the lesson, classroom, GK, library and audio folders for changes. A new lesson or recording appears within this time. 0 checks on every request (slow when there are thousands of files)."),
  num("perf.curriculumCache.seconds", "Keep the curriculum in memory for", 300, 0, 3600, 30, "seconds",
    "The list of boards, classes, subjects, chapters and topics is kept in memory instead of being worked out again for every page. 0 turns this off."),
  bool("perf.compress.enabled", "Send pages and data compressed", true,
    "Website files and the site's data answers are sent in a compressed form (brotli or gzip) that browsers unpack by themselves. Pages open much faster, especially on slow connections. Turn off only if you see strange characters instead of pages."),
  num("perf.static.cacheSeconds", "Browsers keep lesson pictures for", 86400, 0, 31536000, 3600, "seconds",
    "Pictures in /pictures are downloaded once per visitor and then reused for this long. 0 makes the browser check every time."),
];
