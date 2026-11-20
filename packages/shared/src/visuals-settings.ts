import type { SettingDef, PanelId } from "./settings.js";

/**
 * Admin settings for classroom visuals (animated explainers and pictures). Spread into SETTINGS (settings.ts).
 * Three admin pages: "visuals" (animations), "visualpics" (openly licensed pictures and credits) and
 * "visualcover" (a coverage report built by `pnpm visuals:build`; its own screen in apps/web/src/admin/VisualsAdmin.tsx).
 * Lists are comma separated. Subject ids look like maths, science, evs, social-science, english.
 */
const bool = (key: string, panel: PanelId, section: string, label: string, def: boolean, o: Partial<SettingDef> = {}): SettingDef =>
  ({ key, panel, section, label, public: true, type: "boolean", default: def, dependsOn: "feature.classroom", ...o }) as SettingDef;
const text = (key: string, panel: PanelId, section: string, label: string, def: string, maxLength: number, o: Partial<SettingDef> = {}): SettingDef =>
  ({ key, panel, section, label, public: true, type: "text", default: def, maxLength, dependsOn: "feature.classroom", ...o }) as SettingDef;

export const VISUALS_SETTINGS: SettingDef[] = [
  bool("visuals.animations", "visuals", "Animated explainers", "Show the animated explainers on the classroom board", true, { help: "The 'Picture it' pages: fractions, water cycle, solar system, circuits and more. Off removes them from every lesson; the narration and story still play." }),
  bool("visuals.generated", "visuals", "Animated explainers", "Show the boards built automatically from each lesson's own text", true, { dependsOn: "visuals.animations", help: "Concept maps, key-term webs and step lists that Build-Visuals.bat makes from the lesson text for lessons without a hand-made or topic animation. Off keeps only the hand-made and topic animations. A lesson whose only board is a generated one still shows it." }),
  bool("visuals.autoplay", "visuals", "Animated explainers", "Start each animation by itself", true, { dependsOn: "visuals.animations", help: "When off, the board keeps still until the student presses Play or Next." }),
  bool("visuals.motion", "visuals", "Animated explainers", "Keep things moving (orbits, waves, falling drops)", true, { dependsOn: "visuals.animations", help: "Off draws the same pictures without continuous motion. Good for slow phones." }),
  { key: "visuals.speed", panel: "visuals", section: "Animated explainers", label: "Speed of the moving parts", public: true, type: "select", default: "1", dependsOn: "visuals.motion", options: [{ value: "0.5", label: "Slow" }, { value: "1", label: "Normal" }, { value: "1.5", label: "Fast" }] } as SettingDef,
  bool("visuals.reducedMotion", "visuals", "Comfort", "Respect the device's 'reduce motion' setting", true, { dependsOn: "visuals.animations", help: "Students who have asked their phone or computer for less motion see still pictures and instant drawing." }),
  text("visuals.hideSubjects", "visuals", "Where animations show", "Subjects with no animated explainers (ids, comma separated)", "", 120, { dependsOn: "visuals.animations", help: "For example: english,evs. Leave empty to show them in every subject." }),
  text("visuals.hideClasses", "visuals", "Where animations show", "Classes with no animated explainers (numbers, comma separated)", "", 40, { dependsOn: "visuals.animations", help: "For example: 3,4. Leave empty to show them in every class." }),
  bool("visualpics.show", "visualpics", "Pictures", "Show real pictures on the classroom board", true, { help: "Openly licensed photographs and drawings (public domain, CC0, CC BY, CC BY-SA). Where a picture has not been downloaded yet, the board shows a labelled frame instead." }),
  bool("visualpics.credits", "visualpics", "Pictures", "Show the credit line under each picture", true, { dependsOn: "visualpics.show", help: "Author and licence, as the licence requires. Keep this on for CC BY and CC BY-SA pictures." }),
  text("visualpics.hideSubjects", "visualpics", "Where pictures show", "Subjects with no pictures (ids, comma separated)", "", 120, { dependsOn: "visualpics.show" }),
  text("visualpics.hideClasses", "visualpics", "Where pictures show", "Classes with no pictures (numbers, comma separated)", "", 40, { dependsOn: "visualpics.show" }),
  { key: "visualpics.maxKb", panel: "visualpics", section: "Picture downloads", label: "Largest picture file", public: true, type: "number", default: 90, min: 20, max: 400, step: 10, unit: "KB", help: "Used by Fetch-Lesson-Pictures.bat on your PC (it reads this from the running site, or tools/pictures/config.json when the site is not running). Bigger pictures are shrunk until they fit." } as SettingDef,
  { key: "visualpics.maxWidth", panel: "visualpics", section: "Picture downloads", label: "Widest picture", public: true, type: "number", default: 900, min: 300, max: 1600, step: 50, unit: "px", help: "Pictures are scaled down to this width before saving as WebP." } as SettingDef,
  { key: "visualpics.delayMs", panel: "visualpics", section: "Picture downloads", label: "Pause between downloads", public: true, type: "number", default: 1500, min: 500, max: 10000, step: 100, unit: "ms", help: "Be polite to Wikimedia: one request at a time with this pause." } as SettingDef,
];
