#!/usr/bin/env node
/**
 * Record clean 1280x720 UI screen clips from SharpStudy for the Google Flow teacher tour (Option B).
 * Free, local, deterministic. Never stores secrets in files (pass INVITE_CODE via env var if needed).
 *
 * Usage:
 *   node tools/tour/record-site-clips.mjs [--url http://localhost:3100] [--duration 8] [--only s2,s3] [--dry-run]
 *
 * Environment overrides:
 *   SITE_URL=https://sharpstudy.in
 *   INVITE_CODE=<optional-invite-code>
 *   CHROME_PATH=<optional-path-to-chrome-or-chromium>
 *
 * One-line Playwright install (if not installed yet):
 *   npm i --no-save playwright && npx playwright install chromium
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const DEFAULT_OUT = join(ROOT, ".codex-project", "tour-v2", "screens");

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const getOpt = (name, fallback) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
};

const SITE_URL = (getOpt("url", process.env.SITE_URL || "http://localhost:3100") || "").replace(/\/+$/, "");
const OUT_DIR = resolve(getOpt("out-dir", DEFAULT_OUT));
const DURATION_SEC = Math.max(4, Math.min(20, Number(getOpt("duration", "8")) || 8));
const ONLY = getOpt("only", "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const DRY_RUN = hasFlag("dry-run");
const INVITE_CODE = process.env.INVITE_CODE || "";
const CHROME_PATH = process.env.CHROME_PATH || "";

const VIEWPORT = { width: 1280, height: 720 };
const CLASSROOM_SOLAR = "/classroom/cbse/6/science/beyond-earth/our-solar-system-and-the-milky-way";
const CLASSROOM_FRACTIONS = "/classroom/cbse/8/maths/ch08-fractions-in-disguise/fractions-and-percentages";
const WORKSHEET_MAGNETS = "/worksheet/cbse/6/science/exploring-magnets";
const EXAM_MAGNETS = "/exam/cbse/6/science/exploring-magnets";

function hasCommand(cmd) {
  try {
    execFileSync(cmd, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function loadPlaywright() {
  const candidates = [
    "playwright",
    "playwright-core",
    pathToFileURL(join(ROOT, ".codex-project", "tour-v2", "node_modules", "playwright-core", "index.mjs")).href,
    pathToFileURL(join(ROOT, ".codex-project", "tour-v2", "node_modules", "playwright-core", "index.js")).href,
  ];
  for (const mod of candidates) {
    try {
      const m = await import(mod);
      const pw = m?.chromium ? m : m?.default;
      if (pw?.chromium) return pw;
    } catch {
      // try next
    }
  }
  return null;
}

function detectBrowserPath() {
  if (CHROME_PATH && existsSync(CHROME_PATH)) return CHROME_PATH;
  const defaults = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  return defaults.find((p) => existsSync(p)) || "";
}

async function dismissOverlays(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem("ss_tour_dismissed_v1", "1");
      localStorage.setItem("sharpstudy_spotlight_dismissed", "1");
      for (const p of ["home", "subject", "chapter", "lesson", "results"]) {
        localStorage.setItem(`sharpstudy.tour.dismissed.${p}`, "1");
      }
      sessionStorage.setItem("sharpstudy.tour.shown", "1");
    } catch {
      // ignore storage restrictions
    }
  });
  for (const sel of [
    'button:has-text("Skip")',
    'button:has-text("Skip tour")',
    'button:has-text("Got it")',
    'button:has-text("Close")',
    '[aria-label="Close"]',
  ]) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 400 })) {
        await btn.click({ timeout: 800 });
        await page.waitForTimeout(250);
      }
    } catch {
      // ignore
    }
  }
}

async function smoothScroll(page, totalPx, steps = 16, stepMs = 120) {
  const delta = Math.round(totalPx / steps);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(stepMs);
  }
}

async function tryClick(page, selectors, waitMs = 600) {
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 500 })) {
        await el.click({ timeout: 1000 });
        await page.waitForTimeout(waitMs);
        return true;
      }
    } catch {
      // try next selector
    }
  }
  return false;
}

async function waitForPageReady(page) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page
    .locator("text=/^Loading\\.{0,3}$/i")
    .first()
    .waitFor({ state: "hidden", timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(700);
}

async function getAuthStorageState(browser) {
  if (!INVITE_CODE) return undefined;
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  const page = await ctx.newPage();
  await page.goto(`${SITE_URL}/`, { waitUntil: "domcontentloaded", timeout: 25000 });
  await page.waitForTimeout(600);
  const input = page
    .locator('input[placeholder*="SHARP" i], input[type="password"], input[placeholder*="invite" i], input[name*="code" i], input[type="text"]')
    .first();
  if (await input.isVisible({ timeout: 2500 }).catch(() => false)) {
    await input.fill(INVITE_CODE);
    await tryClick(
      page,
      ['button:has-text("Continue")', 'button[type="submit"]', 'button:has-text("Enter")', 'button:has-text("Unlock")'],
      1800
    );
    await input.waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
    await waitForPageReady(page);
  }
  await dismissOverlays(page);
  const state = await ctx.storageState();
  await ctx.close();
  return state;
}

const CLIPS = [
  {
    id: "s2",
    file: "screen_s2_classroom.mp4",
    title: "Classroom board animating + timeline advancing (Class 6 Beyond Earth: Solar System)",
    route: CLASSROOM_SOLAR,
    async prepare(page) {
      await page.goto(`${SITE_URL}${CLASSROOM_SOLAR}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await waitForPageReady(page);
      await page.waitForTimeout(1000);
      await dismissOverlays(page);
      await tryClick(page, ['button:has-text("Picture it")', 'button:has-text("Learn")'], 500);
      await page.waitForTimeout(300);
    },
    async run(page, ms) {
      await page.waitForTimeout(400);
      await tryClick(page, [
        'button[aria-label*="Play" i]',
        'button:has-text("Play")',
        'button:has-text("Start")',
      ], 1800);
      await tryClick(page, ['button:has-text("Next")', 'button[aria-label*="Next" i]'], 2400);
      await tryClick(page, ['button:has-text("Next")', 'button[aria-label*="Next" i]'], Math.max(1800, ms - 4600));
    },
  },
  {
    id: "s3",
    file: "screen_s3_voice.mp4",
    title: "Classroom teacher voice picker + 0.85x speed switch (Class 8 Maths: Fractions & Percentages)",
    route: CLASSROOM_FRACTIONS,
    async prepare(page) {
      await page.goto(`${SITE_URL}${CLASSROOM_FRACTIONS}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await waitForPageReady(page);
      await page.waitForTimeout(1000);
      await dismissOverlays(page);
      await tryClick(page, ['button:has-text("Start the lesson")', 'button:has-text("Play")', 'button[aria-label*="Play" i]'], 600);
      await tryClick(page, ['button:has-text("Picture it")', 'button:has-text("Learn")'], 800);
      await page.waitForTimeout(400);
    },
    async run(page, ms) {
      await page.waitForTimeout(600);
      await tryClick(page, [
        'select[aria-label*="voice" i]',
        'button:has-text("Lakshmi")',
        'button:has-text("Teacher voice")',
        'button[aria-label*="Voice" i]',
      ], 900);
      const select = page.locator("select").filter({ hasText: /Lakshmi|Priya|Ram/i }).first();
      if (await select.isVisible({ timeout: 800 }).catch(() => false)) {
        const opts = await select.locator("option").allTextContents();
        for (const name of ["Priya", "Ram", "Lakshmi"]) {
          const match = opts.find((o) => o.toLowerCase().includes(name.toLowerCase()));
          if (match) {
            await select.selectOption({ label: match }).catch(() => {});
            await page.waitForTimeout(1000);
          }
        }
      } else {
        await tryClick(page, ['button:has-text("Priya")', '[role="option"]:has-text("Priya")'], 1000);
        await tryClick(page, ['button:has-text("Ram")', '[role="option"]:has-text("Ram")'], 1000);
        await tryClick(page, ['button:has-text("Lakshmi")', '[role="option"]:has-text("Lakshmi")'], 900);
      }
      await tryClick(page, [
        'button:has-text("0.85")',
        'button:has-text("0.85x")',
        'button:has-text("0.85×")',
        'button:has-text("Slower")',
      ], 900);
      await tryClick(page, [
        'button[aria-label*="Play" i]',
        'button:has-text("Play")',
        'button:has-text("Start")',
      ], 1600);
      await tryClick(page, ['button:has-text("Next")', 'button[aria-label*="Next" i]'], Math.max(1200, ms - 6000));
    },
  },
  {
    id: "s4",
    file: "screen_s4_practice.mp4",
    title: "Practice question interaction + Printable Worksheet + Chapter Test view",
    route: WORKSHEET_MAGNETS,
    async prepare(page) {
      await page.goto(`${SITE_URL}${WORKSHEET_MAGNETS}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await waitForPageReady(page);
      await page.waitForTimeout(800);
      await dismissOverlays(page);
    },
    async run(page) {
      await page.waitForTimeout(700);
      await smoothScroll(page, 620, 18, 160);
      await page.waitForTimeout(1200);
      await smoothScroll(page, 420, 12, 160);
      await page.waitForTimeout(1000);
    },
  },
  {
    id: "s5",
    file: "screen_s5_library_papers.mp4",
    title: "/papers Question Papers list + /library E-Library book reader",
    route: "/library",
    async prepare(page) {
      await page.goto(`${SITE_URL}/library`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await waitForPageReady(page);
      await page.waitForTimeout(800);
      await dismissOverlays(page);
    },
    async run(page) {
      await page.waitForTimeout(800);
      await smoothScroll(page, 520, 16, 150);
      await page.waitForTimeout(1000);
      await smoothScroll(page, 420, 14, 150);
      await page.waitForTimeout(1000);
    },
  },
  {
    id: "s6",
    file: "screen_s6_gk.mp4",
    title: "/gk Daily GK & Puzzle of the Day",
    route: "/gk",
    async prepare(page) {
      await page.goto(`${SITE_URL}/gk`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await waitForPageReady(page);
      await dismissOverlays(page);
    },
    async run(page) {
      await page.waitForTimeout(700);
      await smoothScroll(page, 480, 14, 130);
      await tryClick(page, [
        'button:has-text("Show answer")',
        'button:has-text("Reveal")',
        'button:has-text("Hint")',
        'a[href^="/gk/"]',
      ], 1400);
      await smoothScroll(page, 260, 8, 130);
      await page.waitForTimeout(900);
    },
  },
  {
    id: "s7",
    file: "screen_s7_parent.mp4",
    title: "Parent / Progress / Student Mode view",
    route: "/progress",
    async prepare(page) {
      await page.goto(`${SITE_URL}/progress`, { waitUntil: "domcontentloaded", timeout: 25000 });
      await waitForPageReady(page);
      await page.waitForTimeout(800);
      await dismissOverlays(page);
    },
    async run(page) {
      await page.waitForTimeout(800);
      await smoothScroll(page, 480, 16, 150);
      await page.waitForTimeout(1200);
      await smoothScroll(page, 320, 12, 150);
      await page.waitForTimeout(1000);
    },
  },
];

function convertWebmToMp4(webmPath, mp4Path, startSec, durationSec) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-ss",
      startSec.toFixed(2),
      "-i",
      webmPath,
      "-t",
      String(durationSec),
      "-vf",
      "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fps=30",
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "-movflags",
      "+faststart",
      mp4Path,
    ],
    { stdio: "inherit" }
  );
}

async function main() {
  const selected = ONLY.length ? CLIPS.filter((c) => ONLY.includes(c.id)) : CLIPS;
  if (!selected.length) {
    console.error(`No matching clips for --only ${ONLY.join(",")}. Valid IDs: ${CLIPS.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }

  const ffmpegOk = hasCommand("ffmpeg");
  const pw = await loadPlaywright();

  console.log(`[record-site-clips] SITE_URL=${SITE_URL}`);
  console.log(`[record-site-clips] OUT_DIR=${OUT_DIR}`);
  console.log(`[record-site-clips] DURATION=${DURATION_SEC}s | clips=${selected.map((c) => c.id).join(",")}`);
  console.log(`[record-site-clips] playwright=${pw ? "available" : "MISSING"} | ffmpeg=${ffmpegOk ? "available" : "MISSING"}`);

  if (DRY_RUN) {
    console.log("\nPlanned screen recordings:");
    for (const c of selected) {
      console.log(`  - ${c.id}: ${c.file} (${DURATION_SEC}s) -> ${c.route}`);
      console.log(`         ${c.title}`);
    }
    if (!pw) {
      console.log("\nInstall Playwright locally (one-time, Rs 0):");
      console.log("  npm i --no-save playwright && npx playwright install chromium");
    }
    if (!ffmpegOk) {
      console.log("\nInstall FFmpeg locally (one-time, Rs 0):");
      console.log("  winget install Gyan.FFmpeg");
    }
    console.log("\n[dry-run] OK");
    return;
  }

  if (!pw) {
    console.error("ERROR: Playwright is not installed.");
    console.error("Install once with: npm i --no-save playwright && npx playwright install chromium");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const tmpDir = join(OUT_DIR, "_tmp_webm");
  mkdirSync(tmpDir, { recursive: true });

  const launchOpts = {
    headless: true,
    args: ["--no-sandbox", "--disable-infobars", "--window-size=1280,720"],
  };
  const browserPath = detectBrowserPath();
  if (browserPath) launchOpts.executablePath = browserPath;

  const browser = await pw.chromium.launch(launchOpts);
  try {
    const authState = await getAuthStorageState(browser);
    for (const clip of selected) {
      const clipTmp = join(tmpDir, clip.id);
      rmSync(clipTmp, { recursive: true, force: true });
      mkdirSync(clipTmp, { recursive: true });

      console.log(`\n[record] ${clip.id}: ${clip.title}`);
      const ctxStarted = Date.now();
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 1,
        storageState: authState,
        recordVideo: { dir: clipTmp, size: VIEWPORT },
      });
      const page = await context.newPage();

      await clip.prepare(page);
      const readyOffsetSec = Math.max(0, (Date.now() - ctxStarted) / 1000);
      const started = Date.now();
      await clip.run(page, DURATION_SEC * 1000);
      const elapsed = Date.now() - started;
      const remaining = DURATION_SEC * 1000 - elapsed + 600;
      if (remaining > 0) await page.waitForTimeout(remaining);

      const video = page.video();
      await context.close();
      const rawWebm = video ? await video.path() : null;
      const foundWebm =
        rawWebm && existsSync(rawWebm)
          ? rawWebm
          : readdirSync(clipTmp)
              .map((f) => join(clipTmp, f))
              .find((p) => p.endsWith(".webm"));

      if (!foundWebm) {
        throw new Error(`No recorded video produced for ${clip.id}`);
      }

      const outMp4 = join(OUT_DIR, clip.file);
      if (ffmpegOk) {
        convertWebmToMp4(foundWebm, outMp4, readyOffsetSec, DURATION_SEC);
        const kb = Math.round(statSync(outMp4).size / 1024);
        console.log(`  saved ${outMp4} (${kb} KB, trimmed start=${readyOffsetSec.toFixed(1)}s)`);
      } else {
        const outWebm = outMp4.replace(/\.mp4$/i, ".webm");
        renameSync(foundWebm, outWebm);
        console.log(`  WARNING: ffmpeg not found on PATH; saved raw ${outWebm}`);
      }
      rmSync(clipTmp, { recursive: true, force: true });
    }
  } finally {
    await browser.close();
    rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log(`\nDONE: recorded ${selected.length} screen clip(s) into ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("[record-site-clips] FAILED:", err?.message || err);
  process.exit(1);
});
