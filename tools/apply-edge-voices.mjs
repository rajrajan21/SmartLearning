// Applies: header fix, per-lesson voice list, Kani + Arul voices. Safe to re-run; stops without changing a file if its text is not what it expects.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (...p) => join(root, ...p);
const problems = [];
const edits = [];

function edit(file, label, pairs, append) {
  const path = P(file);
  if (!existsSync(path)) { problems.push(`${file}: not found`); return; }
  let t = readFileSync(path, "utf8");
  const eol = t.includes("\r\n") ? "\r\n" : "\n";
  const n = (s) => s.replace(/\r?\n/g, eol);
  let changed = false;
  for (const [old, neu, done] of pairs) {
    if (t.includes(n(done))) continue; // already applied
    const i = t.indexOf(n(old));
    if (i < 0 || t.indexOf(n(old), i + 1) >= 0) { problems.push(`${file}: could not find a unique spot for "${label}" (${old.slice(0, 50)}...)`); return; }
    t = t.slice(0, i) + n(neu) + t.slice(i + n(old).length); changed = true;
  }
  if (append && !t.includes(append.marker)) { t = t.replace(/\s*$/, eol) + n(append.text); changed = true; }
  if (changed) edits.push({ path, text: t, file });
}

// 1) shared type: the lesson tells which voices have audio for THIS lesson
edit("packages/shared/src/classroom.ts", "public classroom fields", [[
  "export const PublicClassroom = ClassroomShape.extend({",
  "export const PublicClassroom = ClassroomShape.extend({\n  voicesReady: z.array(z.string()).optional(), voiceUsed: z.string().optional(),",
  "voicesReady: z.array(z.string()).optional()"]]);

// 2) server: work out the voices that really have audio for this lesson, and fall back to one that does
edit("apps/api/src/modules/classroom/service.ts", "get() voices", [[
  "      const ok = (audio?.teachers() ?? []).some((t) => t.id === voice);\n      return withAudio(l, ok ? voice! : DEFAULT_VOICE);",
  "      const ready = (audio?.teachers() ?? []).filter((t) => l.steps.some((st) => !!audio?.refs(t.id, st.narration))).map((t) => t.id);\n      const use = voice && ready.includes(voice) ? voice : (([\"kani\", DEFAULT_VOICE].find((v) => ready.includes(v)) ?? ready[0]) ?? DEFAULT_VOICE);\n      return { ...withAudio(l, use), voicesReady: ready, voiceUsed: use };",
  "voicesReady: ready, voiceUsed: use"]]);

// 3) lesson page: the voice list shows only voices that have audio for this lesson
edit("apps/web/src/pages/Classroom.tsx", "voice picker", [
  ["  const info = voices.find((v) => v.id === voice);",
   "  const info = voices.find((v) => v.id === voice);\n  const pickable = s.get(\"classroom.voicePicker.onlyRecorded\") !== false && lessonIn.voicesReady ? voices.filter((v) => lessonIn.voicesReady!.includes(v.id)) : voices;",
   "const pickable = s.get("],
  ["{voices.length > 1 && s.get(\"classroom.voicePicker\") === true && (", "{pickable.length > 1 && s.get(\"classroom.voicePicker\") === true && (", "{pickable.length > 1 && s.get("],
  ["<select value={voice} onChange={(e) => { stopVoice();", "<select value={lessonIn.voiceUsed ?? voice} onChange={(e) => { stopVoice();", "<select value={lessonIn.voiceUsed ?? voice}"],
  ["{voices.map((v) => <option key={v.id} value={v.id} disabled={!v.ready}>{v.label}{v.ready ? \"\" : ` – ${L(\"classroomNotRecorded\")}`}</option>)}", "{pickable.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}", "{pickable.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}"],
]);

// 4) admin setting for it
edit("packages/shared/src/settings.ts", "setting", [[
  "  bool(\"classroom.voicePicker\", \"classroom\", \"Voice\",",
  "  bool(\"classroom.voicePicker.onlyRecorded\", \"classroom\", \"Voice\", \"Show only the voices that have audio for this lesson\", true, { dependsOn: \"classroom.voicePicker\", help: \"On: the teacher list on a lesson shows only voices that are recorded for that lesson (nothing greyed out). Off: shows every voice, greying out the ones not recorded yet.\" }),\n  bool(\"classroom.voicePicker\", \"classroom\", \"Voice\",",
  "classroom.voicePicker.onlyRecorded"]]);

// 5) header: tabs never run over the logo; on a narrow screen they take their own row
edit("apps/web/src/styles.css", "header", [], { marker: "/* header-fit */", text: `
/* header-fit: the tabs never run over the logo. Wide screens: one row. Narrower: logo, search and buttons on row one, tabs on row two. */
@media (min-width: 900px) and (max-width: 1759px) {
  header.top { flex-wrap: wrap; row-gap: .15rem; }
  header.top .brand { order: 1; flex: 0 0 auto; }
  header.top .search.compact { order: 2; flex: 1 1 10rem; min-width: 7rem; }
  header.top .top-actions { order: 3; margin-left: auto; flex: 0 0 auto; }
  header.top .main-nav { order: 4; flex: 1 1 100%; justify-content: flex-start; flex-wrap: wrap; min-width: 0; }
}
@media (min-width: 1760px) { header.top .main-nav { justify-content: flex-start; } }
` });

if (problems.length) { console.error("STOPPED - nothing was changed:\n  " + problems.join("\n  ")); process.exit(1); }
for (const e of edits) { copyFileSync(e.path, e.path + ".before-edge-voices"); writeFileSync(e.path, e.text); console.log("updated", e.file); }

// 6) the voices: Kani (Neerja) and Arul (Prabhat); existing voices are kept
const vp = P("content", "audio", "voices.json");
if (existsSync(vp)) {
  const v = JSON.parse(readFileSync(vp, "utf8"));
  let add = 0;
  if (!v.kani) { v.kani = { label: "Kani", gender: "female", accent: "in", en: { voice: "edge:en-IN-NeerjaNeural", speed: 0.92 } }; add++; }
  if (!v.arul) { v.arul = { label: "Arul", gender: "male", accent: "in", en: { voice: "edge:en-IN-PrabhatNeural", speed: 0.92 } }; add++; }
  if (add) { copyFileSync(vp, vp + ".before-edge-voices"); writeFileSync(vp, JSON.stringify(v, null, 2) + "\n"); console.log("voices.json: added", add, "voice(s)"); } else console.log("voices.json: Kani and Arul already there");
} else console.log("content/audio/voices.json not found - add the voices later (see README).");
console.log("\nDone.");
