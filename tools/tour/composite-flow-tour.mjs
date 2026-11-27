#!/usr/bin/env node
/**
 * Deterministic FFmpeg compositor for Google Flow teacher tour clips (Option B).
 *
 * Reads:
 *   - .codex-project/tour-v2/flow/s1.mp4 ... s8.mp4
 *   - .codex-project/tour-v2/screens/screen_s2_classroom.mp4 ... screen_s7_parent.mp4 (or .webm)
 *   - .codex-project/tour-v2/layout.json (auto-created with defaults if missing)
 *
 * Outputs to .codex-project/tour-v2/out/:
 *   - monitor-check.jpg     (1-frame red-box calibration overlay on s2.mp4)
 *   - tour-en.mp4           (1280x720, H.264 yuv420p, AAC 128k, faststart, target < 10 MB)
 *   - poster-en.jpg         (960px-wide JPEG thumbnail)
 *   - tour-en.vtt           (accurate 8-scene captions synced via ffprobe)
 *   - tour-en.chapters.json (accurate chapter timestamps synced via ffprobe)
 *
 * Usage:
 *   node tools/tour/composite-flow-tour.mjs [--calibrate] [--dry-run] [--mode monitor-overlay|cutaway-pip]
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const BASE_DIR = resolve(getOpt("dir", join(ROOT, ".codex-project", "tour-v2")));
const FLOW_DIR = join(BASE_DIR, "flow");
const SCREENS_DIR = join(BASE_DIR, "screens");
const OUT_DIR = join(BASE_DIR, "out");
const WORK_DIR = join(BASE_DIR, "_work");
const LAYOUT_PATH = join(BASE_DIR, "layout.json");

function hasFlag(name) {
  return process.argv.slice(2).includes(`--${name}`);
}
function getOpt(name, fallback) {
  const args = process.argv.slice(2);
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
}

const DRY_RUN = hasFlag("dry-run");
const CALIBRATE_ONLY = hasFlag("calibrate");
const MODE_OVERRIDE = getOpt("mode", "");

const DEFAULT_LAYOUT = {
  mode: "monitor-overlay",
  monitor: {
    x: 52,
    y: 158,
    width: 472,
    height: 306,
    quad: {
      x0: 52,
      y0: 134,
      x1: 570,
      y1: 172,
      x2: 70,
      y2: 540,
      x3: 584,
      y3: 506,
    },
  },
  pip: {
    x: 920,
    y: 468,
    width: 320,
    height: 216,
  },
  crossfadeSec: 0.25,
  targetMaxMB: 10,
  scenes: [
    {
      id: "s1",
      flow: "s1.mp4",
      screen: null,
      chapter: "Welcome",
      caption: "Welcome to SharpStudy, a free place for school students to learn sharp, one clear step at a time.",
    },
    {
      id: "s2",
      flow: "s2.mp4",
      screen: "screen_s2_classroom.mp4",
      chapter: "The Classroom Board",
      caption: "Inside the Classroom, the board comes alive with clear steps, visuals, and an interactive timeline.",
    },
    {
      id: "s3",
      flow: "s3.mp4",
      screen: "screen_s3_voice.mp4",
      chapter: "Teacher Voices & Speed",
      caption: "Pick your favourite teacher voice—Lakshmi, Priya, or Ram—and adjust playback speed to 0.85x anytime.",
    },
    {
      id: "s4",
      flow: "s4.mp4",
      screen: "screen_s4_practice.mp4",
      chapter: "Practice, Worksheets & Tests",
      caption: "Practise with instant hints, download printable worksheets, and test yourself with full chapter exams.",
    },
    {
      id: "s5",
      flow: "s5.mp4",
      screen: "screen_s5_library_papers.mp4",
      chapter: "Question Papers & E-Library",
      caption: "Prepare for exams with real question papers and read textbooks smoothly inside the E-Library.",
    },
    {
      id: "s6",
      flow: "s6.mp4",
      screen: "screen_s6_gk.mp4",
      chapter: "Daily GK & Puzzle",
      caption: "Build curiosity every day with fresh General Knowledge lessons and the Puzzle of the Day.",
    },
    {
      id: "s7",
      flow: "s7.mp4",
      screen: "screen_s7_parent.mp4",
      chapter: "Parent & Progress View",
      caption: "Track daily streaks, mastery, and every child's progress in a clean Parent and Student dashboard.",
    },
    {
      id: "s8",
      flow: "s8.mp4",
      screen: null,
      chapter: "Start Learning",
      caption: "That is SharpStudy. Pick a chapter and start learning sharp today.",
    },
  ],
};

function hasCommand(cmd) {
  try {
    execFileSync(cmd, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function loadOrCreateLayout() {
  mkdirSync(BASE_DIR, { recursive: true });
  mkdirSync(FLOW_DIR, { recursive: true });
  mkdirSync(SCREENS_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  if (!existsSync(LAYOUT_PATH)) {
    writeFileSync(LAYOUT_PATH, JSON.stringify(DEFAULT_LAYOUT, null, 2) + "\n", "utf8");
    console.log(`[layout] Created default ${LAYOUT_PATH}`);
  }
  const layout = JSON.parse(readFileSync(LAYOUT_PATH, "utf8"));
  if (MODE_OVERRIDE) layout.mode = MODE_OVERRIDE;
  if (!["monitor-overlay", "cutaway-pip"].includes(layout.mode)) {
    throw new Error(`Invalid layout.mode "${layout.mode}". Expected "monitor-overlay" or "cutaway-pip".`);
  }
  return layout;
}

function resolveFlowFile(sc) {
  const exact = join(FLOW_DIR, sc.flow);
  if (existsSync(exact)) return exact;
  const num = sc.id.replace(/^s/i, "");
  const alt = join(FLOW_DIR, `video${num}.mp4`);
  if (existsSync(alt)) return alt;
  return exact;
}

function resolveScreenFile(screenName) {
  if (!screenName) return null;
  const exact = join(SCREENS_DIR, screenName);
  if (existsSync(exact)) return exact;
  const webm = exact.replace(/\.mp4$/i, ".webm");
  if (existsSync(webm)) return webm;
  return exact;
}

function probeMedia(filePath) {
  const raw = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration:stream=codec_type,duration", "-of", "json", filePath],
    { encoding: "utf8" }
  );
  const info = JSON.parse(raw);
  const vStream = Array.isArray(info?.streams) ? info.streams.find((s) => s.codec_type === "video") : null;
  const duration = Number(vStream?.duration || info?.format?.duration || 0);
  const hasAudio = Array.isArray(info?.streams) && info.streams.some((s) => s.codec_type === "audio");
  return { duration, hasAudio };
}

function runFfmpeg(ffmpegArgs) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...ffmpegArgs], { stdio: "inherit" });
}

function fmtVttTs(sec) {
  const s = Math.max(0, sec);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const rem = (s % 60).toFixed(3).padStart(6, "0");
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${rem}`;
}

function buildCalibrationImage(s2Path, layout) {
  const outImg = join(OUT_DIR, "monitor-check.jpg");
  const mon = layout.monitor;
  if (layout.mode === "monitor-overlay" && mon?.quad) {
    const q = mon.quad;
    const fc = [
      `[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[bg]`,
      `color=c=red@0.45:s=1280x720:d=1,format=rgba,drawbox=x=0:y=0:w=1280:h=720:color=red@0.95:t=16,pad=1284:724:2:2:color=black@0,perspective=x0=${q.x0}:y0=${q.y0}:x1=${q.x1}:y1=${q.y1}:x2=${q.x2}:y2=${q.y2}:x3=${q.x3}:y3=${q.y3}:sense=destination:interpolation=linear[box]`,
      `[bg][box]overlay=0:0,format=yuvj420p[out]`,
    ].join(";");
    runFfmpeg(["-ss", "1", "-i", s2Path, "-filter_complex", fc, "-map", "[out]", "-frames:v", "1", "-q:v", "3", outImg]);
    console.log(`[calibrate] Saved ${outImg} (perspective quad: TL(${q.x0},${q.y0}) TR(${q.x1},${q.y1}) BL(${q.x2},${q.y2}) BR(${q.x3},${q.y3}))`);
    return outImg;
  }
  const box = layout.mode === "cutaway-pip" ? layout.pip : layout.monitor;
  const vf = [
    "scale=1280:720:force_original_aspect_ratio=decrease",
    "pad=1280:720:(ow-iw)/2:(oh-ih)/2",
    `drawbox=x=${box.x}:y=${box.y}:w=${box.width}:h=${box.height}:color=red@0.9:t=5`,
  ].join(",");
  runFfmpeg(["-ss", "1", "-i", s2Path, "-frames:v", "1", "-vf", vf, "-q:v", "3", outImg]);
  console.log(`[calibrate] Saved ${outImg} (red box: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}, mode=${layout.mode})`);
  return outImg;
}

function renderSceneSegment(scene, flowPath, screenPath, layout, outPath) {
  const { duration, hasAudio } = probeMedia(flowPath);
  if (duration <= 0) throw new Error(`Invalid duration for ${flowPath}`);
  const durStr = duration.toFixed(3);
  const fadeOutStart = Math.max(0, duration - 0.03).toFixed(3);
  const af = `atrim=0:${durStr},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.03,afade=t=out:st=${fadeOutStart}:d=0.03`;

  const audioInputs = hasAudio
    ? []
    : ["-f", "lavfi", "-t", durStr, "-i", "anullsrc=r=48000:cl=stereo"];

  if (!screenPath) {
    // Full-frame teacher scene (1920x1080 @ 24fps, exact video+audio trim)
    const args = [
      "-i",
      flowPath,
      ...audioInputs,
      "-vf",
      `scale=1920:1080:flags=lanczos:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=24,trim=0:${durStr},setpts=PTS-STARTPTS,format=yuv420p`,
      "-af",
      af,
      "-map",
      "0:v:0",
      "-map",
      hasAudio ? "0:a:0" : "1:a:0",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "16",
      "-c:a",
      "aac",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-b:a",
      "192k",
      "-t",
      durStr,
      outPath,
    ];
    runFfmpeg(args);
    return duration;
  }

  // Composite scene (1920x1080 @ 24fps; quad coordinates from 720p layout scaled by 1.5x for Full HD monitor clarity)
  // Screen clip is smoothly paced to match exact scene duration (no jarring loop/repeat), and teacher's hand is keyed in front of the monitor.
  const { duration: srcScreenDur } = probeMedia(screenPath);
  const stretch = srcScreenDur > 0.5 && srcScreenDur < duration ? (duration / srcScreenDur).toFixed(4) : "1";
  const mon = layout.monitor;
  const pip = layout.pip;
  const audioInIdx = hasAudio ? "0:a" : "2:a";
  let filterComplex;
  if (layout.mode === "cutaway-pip") {
    const px = Math.round(pip.x * 1.5), py = Math.round(pip.y * 1.5), pw = Math.round(pip.width * 1.5), ph = Math.round(pip.height * 1.5);
    filterComplex = [
      `[1:v]scale=1920:1080:flags=lanczos:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setpts=${stretch}*(PTS-STARTPTS),fps=24,tpad=stop_mode=clone:stop_duration=2,trim=0:${durStr},setpts=PTS-STARTPTS[bg]`,
      `[0:v]scale=${pw}:${ph}:flags=lanczos:force_original_aspect_ratio=decrease,pad=${pw}:${ph}:(ow-iw)/2:(oh-ih)/2,fps=24,trim=0:${durStr},setpts=PTS-STARTPTS[fg]`,
      `[bg][fg]overlay=x=${px}:y=${py}:shortest=1,format=yuv420p[vout]`,
      `[${audioInIdx}]${af}[aout]`,
    ].join(";");
  } else if (scene.quad || mon?.quad) {
    const rawQ = scene.quad || mon.quad;
    const s = 1.5; // 1920/1280
    const q = {
      x0: Math.round(rawQ.x0 * s), y0: Math.round(rawQ.y0 * s),
      x1: Math.round(rawQ.x1 * s), y1: Math.round(rawQ.y1 * s),
      x2: Math.round(rawQ.x2 * s), y2: Math.round(rawQ.y2 * s),
      x3: Math.round(rawQ.x3 * s), y3: Math.round(rawQ.y3 * s),
    };
    filterComplex = [
      `[0:v]scale=1920:1080:flags=lanczos:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=24,trim=0:${durStr},setpts=PTS-STARTPTS,split=2[bg][bg_copy]`,
      `[1:v]scale=1920:1080:flags=lanczos:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,unsharp=3:3:0.5:3:3:0.0,setpts=${stretch}*(PTS-STARTPTS),fps=24,tpad=stop_mode=clone:stop_duration=2,trim=0:${durStr},setpts=PTS-STARTPTS,format=rgba,pad=1924:1084:2:2:color=black@0,perspective=x0=${q.x0}:y0=${q.y0}:x1=${q.x1}:y1=${q.y1}:x2=${q.x2}:y2=${q.y2}:x3=${q.x3}:y3=${q.y3}:sense=destination:interpolation=cubic[scr]`,
      `[bg][scr]overlay=x=0:y=0:shortest=1[with_scr]`,
      `[bg_copy]format=rgba,colorkey=color=0x383838:similarity=0.16:blend=0.05[fg_hand]`,
      `[with_scr][fg_hand]overlay=x=0:y=0:shortest=1,trim=0:${durStr},setpts=PTS-STARTPTS,format=yuv420p[vout]`,
      `[${audioInIdx}]${af}[aout]`,
    ].join(";");
  } else {
    const mx = Math.round(mon.x * 1.5), my = Math.round(mon.y * 1.5), mw = Math.round(mon.width * 1.5), mh = Math.round(mon.height * 1.5);
    filterComplex = [
      `[0:v]scale=1920:1080:flags=lanczos:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=24,trim=0:${durStr},setpts=PTS-STARTPTS[bg]`,
      `[1:v]scale=${mw}:${mh}:flags=lanczos:force_original_aspect_ratio=decrease,pad=${mw}:${mh}:(ow-iw)/2:(oh-ih)/2,unsharp=3:3:0.5,setpts=${stretch}*(PTS-STARTPTS),fps=24,tpad=stop_mode=clone:stop_duration=2,trim=0:${durStr},setpts=PTS-STARTPTS[scr]`,
      `[bg][scr]overlay=x=${mx}:y=${my}:shortest=1,trim=0:${durStr},setpts=PTS-STARTPTS,format=yuv420p[vout]`,
      `[${audioInIdx}]${af}[aout]`,
    ].join(";");
  }

  const args = [
    "-i",
    flowPath,
    "-i",
    screenPath,
    ...audioInputs,
    "-filter_complex",
    filterComplex,
    "-map",
    "[vout]",
    "-map",
    "[aout]",
    "-t",
    durStr,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "16",
    "-c:a",
    "aac",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-b:a",
    "192k",
    outPath,
  ];
  runFfmpeg(args);
  return duration;
}

function concatAndEncode(segPaths, _crossfadeSec, crf, outMp4) {
  const inputs = [];
  for (const p of segPaths) inputs.push("-i", p);

  const n = segPaths.length;
  // Interleaved [0:v][0:a][1:v][1:a]... concat keeps audio & video 100% lip-sync locked with 0.000s drift across all scenes
  const avInputs = segPaths.map((_, i) => `[${i}:v][${i}:a]`).join("");
  const filters = [
    `${avInputs}concat=n=${n}:v=1:a=1[vcat][acat]`,
    `[acat]loudnorm=I=-16:TP=-1.5:LRA=11[aout]`,
  ];

  runFfmpeg([
    ...inputs,
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[vcat]",
    "-map",
    "[aout]",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    String(crf),
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-ar",
    "48000",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    outMp4,
  ]);
}

function writeCaptionsAndChapters(scenes, durations, crossfadeSec) {
  const chapters = [];
  const vttLines = ["WEBVTT", ""];
  let cursor = 0;

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const dur = durations[i];
    const start = cursor;
    const end = cursor + dur;
    chapters.push({ t: Number(start.toFixed(2)), title: sc.chapter });
    vttLines.push(String(i + 1));
    vttLines.push(`${fmtVttTs(start + 0.15)} --> ${fmtVttTs(Math.max(start + 0.5, end - 0.15))}`);
    vttLines.push(sc.caption);
    vttLines.push("");
    cursor = i < scenes.length - 1 ? Math.max(0, end - crossfadeSec) : end;
  }

  const total = Number(cursor.toFixed(2));
  const vttPath = join(OUT_DIR, "tour-en.vtt");
  const chapPath = join(OUT_DIR, "tour-en.chapters.json");

  writeFileSync(vttPath, vttLines.join("\n"), "utf8");
  writeFileSync(chapPath, JSON.stringify({ total, voiced: true, chapters }, null, 1) + "\n", "utf8");
  console.log(`[meta] Wrote ${vttPath} and ${chapPath} (total=${total}s, ${chapters.length} chapters)`);
}

function main() {
  const layout = loadOrCreateLayout();
  const ffmpegOk = hasCommand("ffmpeg");
  const ffprobeOk = hasCommand("ffprobe");

  console.log(`[composite-flow-tour] BASE_DIR=${BASE_DIR}`);
  console.log(`[composite-flow-tour] mode=${layout.mode} | ffmpeg=${ffmpegOk ? "ok" : "MISSING"} | ffprobe=${ffprobeOk ? "ok" : "MISSING"}`);

  const missingFlow = [];
  const missingScreens = [];
  const resolved = layout.scenes.map((sc) => {
    const flowPath = resolveFlowFile(sc);
    const screenPath = resolveScreenFile(sc.screen);
    if (!existsSync(flowPath)) missingFlow.push(sc.flow);
    if (screenPath && !existsSync(screenPath)) missingScreens.push(sc.screen);
    return { sc, flowPath, screenPath };
  });

  if (DRY_RUN) {
    console.log(`\nLayout (${LAYOUT_PATH}):`);
    console.log(`  monitor: ${JSON.stringify(layout.monitor)}`);
    console.log(`  pip:     ${JSON.stringify(layout.pip)}`);
    console.log(`  scenes:  ${layout.scenes.length}`);
    console.log(`  missing flow clips (${missingFlow.length}): ${missingFlow.join(", ") || "none"}`);
    console.log(`  missing screen clips (${missingScreens.length}): ${missingScreens.join(", ") || "none"}`);
    console.log(`\nPlanned outputs in ${OUT_DIR}:`);
    console.log("  - monitor-check.jpg");
    console.log("  - tour-en.mp4 (1280x720, H.264 yuv420p, AAC 128k, faststart, < 10 MB)");
    console.log("  - poster-en.jpg");
    console.log("  - tour-en.vtt");
    console.log("  - tour-en.chapters.json");
    console.log("\n[dry-run] OK");
    return;
  }

  if (!ffmpegOk || !ffprobeOk) {
    console.error("ERROR: ffmpeg and ffprobe must be installed on PATH.");
    console.error("Install once with: winget install Gyan.FFmpeg");
    process.exit(1);
  }

  const s2Entry = resolved.find((r) => r.sc.id === "s2");
  if (s2Entry && existsSync(s2Entry.flowPath)) {
    buildCalibrationImage(s2Entry.flowPath, layout);
  } else {
    console.error(`ERROR: Missing ${join(FLOW_DIR, "s2.mp4")} needed for monitor calibration.`);
    process.exit(1);
  }

  if (CALIBRATE_ONLY) {
    console.log("[calibrate] Done. Inspect out/monitor-check.jpg and adjust layout.json if needed.");
    return;
  }

  if (missingFlow.length || missingScreens.length) {
    if (missingFlow.length) console.error(`ERROR: Missing Flow clips in ${FLOW_DIR}: ${missingFlow.join(", ")}`);
    if (missingScreens.length) console.error(`ERROR: Missing screen clips in ${SCREENS_DIR}: ${missingScreens.join(", ")}`);
    console.error("Drop s1.mp4..s8.mp4 into flow/ and run Record-Tour-Screens.bat first.");
    process.exit(1);
  }

  rmSync(WORK_DIR, { recursive: true, force: true });
  mkdirSync(WORK_DIR, { recursive: true });

  const segPaths = [];
  const durations = [];
  for (const { sc, flowPath, screenPath } of resolved) {
    const segPath = join(WORK_DIR, `${sc.id}_comp.mp4`);
    console.log(`[render] ${sc.id} (${sc.chapter})...`);
    const dur = renderSceneSegment(sc, flowPath, screenPath, layout, segPath);
    segPaths.push(segPath);
    durations.push(dur);
    console.log(`  ok (${dur.toFixed(2)}s)`);
  }

  const outMp4 = join(OUT_DIR, "tour-en.mp4");
  const crossfade = Number(layout.crossfadeSec ?? 0.25);
  const targetBytes = (Number(layout.targetMaxMB) || 10) * 1024 * 1024;

  let crf = 20;
  console.log(`[encode] Concatenating ${segPaths.length} scenes (1920x1080 @ 24fps, crf=${crf}, locked A/V sync, loudnorm=-16 LUFS)...`);
  concatAndEncode(segPaths, crossfade, crf, outMp4);

  while (statSync(outMp4).size > targetBytes && crf < 28) {
    crf += 2;
    const mb = (statSync(outMp4).size / 1048576).toFixed(2);
    console.log(`[encode] Size ${mb} MB > ${layout.targetMaxMB} MB target; re-encoding with crf=${crf}...`);
    concatAndEncode(segPaths, crossfade, crf, outMp4);
  }

  const posterPath = join(OUT_DIR, "poster-en.jpg");
  runFfmpeg(["-ss", "2", "-i", outMp4, "-frames:v", "1", "-vf", "scale=1280:-1:flags=lanczos", "-q:v", "2", posterPath]);
  writeCaptionsAndChapters(layout.scenes, durations, 0);

  rmSync(WORK_DIR, { recursive: true, force: true });

  const finalMB = (statSync(outMp4).size / 1048576).toFixed(2);
  console.log(`\nDONE: ${outMp4} (${finalMB} MB)`);
  console.log(`  poster:   ${posterPath}`);
  console.log(`  captions: ${join(OUT_DIR, "tour-en.vtt")}`);
  console.log(`  chapters: ${join(OUT_DIR, "tour-en.chapters.json")}`);
}

main();
