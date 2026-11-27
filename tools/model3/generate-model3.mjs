#!/usr/bin/env node
/**
 * Model 3.0 ("Live On-Spot Chalkboard Teacher") Parallel Batch Generator
 *
 * Generates content/model3/<board>-<cls>-<subject>-<chapter>.json for every chapter
 * from curriculum + content/lessons/*.json + content/questions/*.json.
 * Includes Level 1 (Core Concepts + Interactive Lab) & Level 2 (Advanced + Interactive Lab),
 * timed on-spot chalk cues synced to beats, phonetic speakEn strings, and autoStop lab gates.
 *
 * Usage:
 *   node tools/model3/generate-model3.mjs [--filter cbse:3,4,6,7 | matric:9,10 | all] [--shard 0/6]
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const CUR_DIR = join(ROOT, "content", "curriculum");
const L_DIR = join(ROOT, "content", "lessons");
const Q_DIR = join(ROOT, "content", "questions");
const M3_DIR = join(ROOT, "content", "model3");
mkdirSync(M3_DIR, { recursive: true });

const args = process.argv.slice(2);
const filterArg = args.includes("--filter") ? args[args.indexOf("--filter") + 1] : "all";
const shardArg = args.includes("--shard") ? args[args.indexOf("--shard") + 1] : "0/1";
const [shardIdx, shardTotal] = shardArg.split("/").map(Number);

function clean(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function toSpeakEn(s) {
  return clean(s)
    .replace(/\bsq\.?\s*cm\b/gi, "square centimetres")
    .replace(/\bsq\.?\s*m\b/gi, "square metres")
    .replace(/\b(\d+)\s*cm\b/gi, "$1 centimetres")
    .replace(/\b(\d+)\s*m\b/gi, "$1 metres")
    .replace(/₹\s*(\d+)/g, "$1 rupees")
    .replace(/π/g, "pi")
    .replace(/÷/g, " divided by ")
    .replace(/×/g, " times ")
    .replace(/=/g, " equals ");
}

function pickLabType(subject, chapterSlug, title, classLevel) {
  const s = `${subject} ${chapterSlug} ${title}`.toLowerCase();
  if (subject === "maths" && /circle|pi\b|circumference|radius|diameter/.test(s)) return "circle-radius-slider";
  if (subject === "maths" && classLevel >= 4 && /area|perimeter|mensuration/.test(s)) return "area-perimeter-grid";
  if (subject === "maths" && /fraction|percent|ratio|proportion|decimal/.test(s)) return "fraction-explorer";
  if (subject === "science" && /electric|circuit|battery|bulb|switch/.test(s)) return "circuit-builder";
  return "concept-explorer";
}

function loadChapters() {
  const chapters = [];
  for (const f of readdirSync(CUR_DIR).filter((x) => x.endsWith(".json"))) {
    const cur = JSON.parse(readFileSync(join(CUR_DIR, f), "utf8"));
    const board = String(cur.board || f.split("-")[0]).toLowerCase();
    for (const cls of cur.classes || []) {
      const classLevel = Number(cls.classLevel ?? cls.grade ?? cls.number);
      for (const subj of cls.subjects || []) {
        for (const ch of subj.chapters || []) {
          chapters.push({
            board,
            classLevel,
            subject: subj.slug,
            chapter: ch.slug,
            title: clean(ch.name?.en || ch.slug.replace(/-/g, " ")),
            topics: (ch.topics || []).map((t) => ({ slug: t.slug, title: clean(t.name?.en || t.slug.replace(/-/g, " ")) })),
          });
        }
      }
    }
  }
  return chapters;
}

function matchesFilter(ch) {
  if (!filterArg || filterArg === "all") return true;
  for (const part of filterArg.split(";")) {
    const [b, clsStr] = part.split(":");
    if (ch.board === b.toLowerCase()) {
      const want = clsStr.split(",").map(Number);
      if (want.includes(ch.classLevel)) return true;
    }
  }
  return false;
}

function extractChapterContent(ch) {
  const concepts = [];
  const examples = [];
  const tips = [];
  for (const t of ch.topics) {
    const lf = join(L_DIR, `${ch.board}-${ch.classLevel}-${ch.subject}-${ch.chapter}-${t.slug}.json`);
    if (!existsSync(lf)) continue;
    try {
      const data = JSON.parse(readFileSync(lf, "utf8"));
      for (const b of data.lesson?.blocks || []) {
        if ((b.type === "explanation" || b.type === "remember") && b.text?.en) {
          concepts.push(clean(b.text.en));
        }
        if ((b.type === "example" || b.type === "worked") && (b.problem?.en || b.solution?.en)) {
          examples.push({ q: clean(b.problem?.en || t.title), sol: clean(b.solution?.en || b.answer?.en || "") });
        }
        if (b.type === "think" && b.text?.en) tips.push(clean(b.text.en));
        if (b.type === "teacher_narration" && Array.isArray(b.sentences)) {
          for (const s of b.sentences) {
            const txt = clean(s.text?.en || "");
            if (txt.length >= 28 && !/^hello!? today|^well done|^let us begin/i.test(txt)) {
              concepts.push(txt);
            }
          }
        }
      }
    } catch {}
    const qf = join(Q_DIR, `${ch.board}-${ch.classLevel}-${ch.subject}-${ch.chapter}-${t.slug}.json`);
    if (existsSync(qf)) {
      try {
        const qData = JSON.parse(readFileSync(qf, "utf8"));
        for (const q of qData.questions || []) {
          const stem = clean(q.stem?.en || "");
          const steps = (q.solutionSteps || []).map((s) => clean(s?.en || "")).filter(Boolean);
          const ans = clean(q.explanation?.en || "");
          if (stem && (steps.length || ans) && !/^complete the textbook statement|^true or false|^identify the correct/i.test(stem)) {
            examples.push({ q: stem, sol: steps[0] ? `${steps.join(" ")}` : ans, tier: q.tier || "textbook" });
          }
        }
      } catch {}
    }
  }
  return { concepts: [...new Set(concepts)], examples, tips };
}

function buildModel3(ch) {
  const { concepts, examples, tips } = extractChapterContent(ch);
  const c1 = concepts[0] || `Let us master ${ch.title} step by step with clear visual examples.`;
  const c2 = concepts[1] || `Always check units, definitions, and textbook conditions in ${ch.title}.`;
  const c3 = concepts[2] || `Connecting each step logically makes solving ${ch.title} problems effortless.`;
  const ex1 = examples.find((e) => e.tier !== "advanced") || examples[0] || { q: `Apply the core rule of ${ch.title}`, sol: c2 };
  const ex2 = examples.find((e) => e.tier === "advanced") || examples.find((e) => e !== ex1) || { q: `Solve a reverse problem in ${ch.title}`, sol: c3 };
  const labType = pickLabType(ch.subject, ch.chapter, ch.title, ch.classLevel);
  const textbookRef = `${ch.board.toUpperCase()} Class ${ch.classLevel} ${ch.subject} · ${ch.title}`;

  const doc = {
    id: `${ch.board}-${ch.classLevel}-${ch.subject}-${ch.chapter}`,
    model: "3.0",
    board: ch.board,
    classLevel: ch.classLevel,
    subject: ch.subject,
    chapter: ch.chapter,
    title: ch.title,
    textbookRef,
    levels: {
      "1": [
        {
          id: "l1-concept",
          pill: "1. Core Concept",
          kind: "chalkboard",
          textbookBox: {
            ref: `${textbookRef} · Foundation`,
            concept: c1.slice(0, 180),
          },
          tip: tips[0]?.slice(0, 140) || `Focus on the core rule of ${ch.title} first.`,
          beats: [
            { en: `Welcome to ${ch.title}. Today we will write every key step live on the chalkboard.`, speakEn: toSpeakEn(`Welcome to ${ch.title}. Today we will write every key step live on the chalkboard.`) },
            { en: c1.slice(0, 220), speakEn: toSpeakEn(c1.slice(0, 220)) },
            { en: c2.slice(0, 220), speakEn: toSpeakEn(c2.slice(0, 220)) },
          ],
          cues: [
            { b: 0, at: 0.15, type: ["c1-head", `Topic: ${ch.title}`, 900], color: "yellow" },
            { b: 1, at: 0.15, type: ["c1-rule", `Key Idea: ${c1.slice(0, 88)}`, 1400], color: "green" },
            { b: 2, at: 0.2, type: ["c1-note", `Remember: ${c2.slice(0, 88)}`, 1400], color: "cyan" },
          ],
        },
        {
          id: "l1-example",
          pill: "2. Worked Example",
          kind: "chalkboard",
          textbookBox: {
            ref: `${textbookRef} · Textbook Example`,
            concept: ex1.q.slice(0, 160),
            example: ex1.sol.slice(0, 120),
          },
          beats: [
            { en: `Let us solve a textbook example carefully: ${ex1.q.slice(0, 180)}`, speakEn: toSpeakEn(`Let us solve a textbook example carefully: ${ex1.q.slice(0, 180)}`) },
            { en: `Step by step: ${ex1.sol.slice(0, 200)}`, speakEn: toSpeakEn(`Step by step: ${ex1.sol.slice(0, 200)}`) },
          ],
          cues: [
            { b: 0, at: 0.15, type: ["ex1-q", `Given: ${ex1.q.slice(0, 85)}`, 1200], color: "yellow" },
            { b: 1, at: 0.2, type: ["ex1-s", `Solution: ${ex1.sol.slice(0, 95)}`, 1400], color: "green" },
          ],
        },
        {
          id: "l1-lab",
          pill: "3. Interactive Lab",
          kind: "interactive-lab",
          autoStop: true,
          confirmPrompt: "Done exploring this Level 1 Interactive Lab?",
          labType,
          labTitle: `${ch.title} · Live Explorer`,
          labParams: { defaultA: 6, defaultB: 4 },
          beats: [
            { en: `Now try the Interactive Chalkboard Lab! Adjust the sliders or switches yourself to see the rule in action.`, speakEn: `Now try the Interactive Chalkboard Lab! Adjust the sliders or switches yourself to see the rule in action.` },
          ],
          cues: [
            { b: 0, at: 0.1, type: ["lab1-h", `🧪 Interactive Lab: ${ch.title}`, 900], color: "pink" },
          ],
        },
      ],
      "2": [
        {
          id: "l2-reverse",
          pill: "1. Reverse & Trap",
          kind: "chalkboard",
          textbookBox: {
            ref: `${textbookRef} · Level 2 Challenge`,
            concept: ex2.q.slice(0, 170),
          },
          tip: "Watch out for common exam traps — double-check units and signs!",
          beats: [
            { en: `Welcome to Level 2 Advanced Mastery for ${ch.title}. Here we tackle reverse problems and common exam traps.`, speakEn: toSpeakEn(`Welcome to Level 2 Advanced Mastery for ${ch.title}. Here we tackle reverse problems and common exam traps.`) },
            { en: `${ex2.q.slice(0, 180)} → ${ex2.sol.slice(0, 160)}`, speakEn: toSpeakEn(`${ex2.q.slice(0, 180)}. ${ex2.sol.slice(0, 160)}`) },
          ],
          cues: [
            { b: 0, at: 0.15, type: ["l2-h", `Level 2 Challenge · ${ch.title}`, 1000], color: "pink" },
            { b: 1, at: 0.15, type: ["l2-q", `Problem: ${ex2.q.slice(0, 85)}`, 1300], color: "yellow" },
            { b: 1, at: 0.55, type: ["l2-s", `Check: ${ex2.sol.slice(0, 85)}`, 1200], color: "green" },
          ],
        },
        {
          id: "l2-lab",
          pill: "2. Level 2 Lab",
          kind: "interactive-lab",
          autoStop: true,
          confirmPrompt: "Done with the Level 2 Interactive Lab? Ready for Practice?",
          labType,
          labTitle: `${ch.title} · Level 2 Sandbox`,
          labParams: { defaultA: 9, defaultB: 5 },
          beats: [
            { en: `Test your mastery in this Level 2 Sandbox before moving on to the Practice, Worksheet, and Chapter Test tabs.`, speakEn: `Test your mastery in this Level 2 Sandbox before moving on to the Practice, Worksheet, and Chapter Test tabs.` },
          ],
          cues: [
            { b: 0, at: 0.1, type: ["lab2-h", `🧪 Level 2 Sandbox: ${ch.title}`, 900], color: "cyan" },
          ],
        },
      ],
    },
  };

  const outFile = join(M3_DIR, `${doc.id}.json`);
  writeFileSync(outFile, JSON.stringify(doc, null, 1) + "\n", "utf8");
  return doc.id;
}

const all = loadChapters().filter(matchesFilter);
const mine = all.filter((_, i) => i % shardTotal === shardIdx);
for (const ch of mine) buildModel3(ch);
console.log(`[model3 filter=${filterArg} shard=${shardIdx}/${shardTotal}] generated ${mine.length} chapters`);
