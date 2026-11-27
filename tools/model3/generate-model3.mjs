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

function clipWord(s, maxLen) {
  const txt = clean(s);
  if (txt.length <= maxLen) return txt;
  const sub = txt.slice(0, maxLen);
  const dot = Math.max(sub.lastIndexOf(". "), sub.lastIndexOf("! "), sub.lastIndexOf("? "));
  if (dot >= Math.floor(maxLen * 0.45)) return sub.slice(0, dot + 1).trim();
  const sp = sub.lastIndexOf(" ");
  return (sp > 20 ? sub.slice(0, sp) : sub).trim();
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

function pickVisual(ch, stage, items) {
  const s = `${ch.subject} ${ch.chapter} ${ch.title}`.toLowerCase();
  const list = (items || []).map((x) => clipWord(x, 22)).filter(Boolean);
  const safeItems = list.length ? list : [clipWord(ch.title, 22), "Core Rule", "Example"];

  if (stage === "overview") {
    if (ch.subject === "maths" && /shape|geometry|symmetry|angle|triangle|polygon/.test(s)) {
      return { kind: "shapes-gallery", title: `${ch.title} · Key Shapes`, items: safeItems };
    }
    if (ch.subject === "maths" && /circle|pi\b|circumference|radius|diameter/.test(s)) {
      return { kind: "circle-pi", title: `${ch.title} · Circle Explorer`, items: safeItems };
    }
    return { kind: "concept-map", title: clipWord(ch.title, 26), items: safeItems };
  }

  if (stage === "part2" && ch.subject === "maths" && /shape|solid|cube|cone|cylinder|3d|net/.test(s)) {
    return { kind: "solid-3d", title: "Solid Shapes (3D): Faces, Edges & Corners", items: safeItems };
  }
  if (ch.subject === "maths" && /circle|pi\b|circumference|radius|diameter/.test(s)) {
    return { kind: "circle-pi", title: "Circle: Radius, Diameter & Circumference", items: safeItems };
  }
  if (ch.subject === "maths" && /shape|geometry|symmetry|angle|triangle|polygon/.test(s)) {
    return { kind: "shapes-gallery", title: "Flat Shapes: Sides & Corners", items: safeItems };
  }
  if (ch.subject === "maths" && ch.classLevel >= 4 && /area|perimeter|mensuration/.test(s)) {
    return { kind: "area-grid", title: "Area & Perimeter Grid", items: safeItems };
  }
  if (ch.subject === "maths" && /fraction|percent|ratio|decimal/.test(s)) {
    return { kind: "fraction-bar", title: "Fractions & Parts of a Whole", items: safeItems };
  }
  if (ch.subject === "maths" && /algebra|equation|expression|polynomial|linear|quadratic/.test(s)) {
    return { kind: "algebra-balance", title: "Step-by-Step Algebra Balance", items: safeItems };
  }
  if (ch.subject === "maths" && /number|integer|addition|subtraction|multipl|division|time|place/.test(s)) {
    return { kind: "number-line", title: "Number Line & Jumps", items: safeItems };
  }
  if (ch.subject === "science" && /electric|circuit|current|magnet/.test(s)) {
    return { kind: "circuit", title: "Electric Circuit Diagram", items: safeItems };
  }
  if (stage === "example" || stage === "part2") {
    return { kind: "flow-diagram", title: `${ch.title} · Step Flow`, items: safeItems };
  }
  return { kind: "concept-map", title: clipWord(ch.title, 26), items: safeItems };
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
  const stories = [];
  const concepts = [];
  const summaries = [];
  const examples = [];
  const tips = [];
  for (const t of ch.topics) {
    const lf = join(L_DIR, `${ch.board}-${ch.classLevel}-${ch.subject}-${ch.chapter}-${t.slug}.json`);
    if (existsSync(lf)) {
      try {
        const data = JSON.parse(readFileSync(lf, "utf8"));
        for (const b of data.lesson?.blocks || []) {
          if (b.type === "story" && b.text?.en) stories.push(clean(b.text.en));
          if ((b.type === "explanation" || b.type === "remember") && b.text?.en) {
            for (const line of String(b.text.en).split(/\n+/)) {
              const c = clean(line);
              if (c.length >= 20) concepts.push(c);
            }
          }
          if (b.type === "summary" && b.text?.en) summaries.push(clean(b.text.en));
          if ((b.type === "example" || b.type === "worked") && (b.problem?.en || b.solution?.en)) {
            examples.push({ q: clean(b.problem?.en || t.title), sol: clean(b.solution?.en || b.answer?.en || ""), tier: "textbook" });
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
    }
    const qf = join(Q_DIR, `${ch.board}-${ch.classLevel}-${ch.subject}-${ch.chapter}-${t.slug}.json`);
    if (existsSync(qf)) {
      try {
        const qData = JSON.parse(readFileSync(qf, "utf8"));
        for (const q of qData.questions || []) {
          const stem = clean(q.stem?.en || "");
          const steps = (q.solutionSteps || []).map((s) => clean(s?.en || "")).filter((x) => x && !/^identify the key concept/i.test(x));
          const ans = clean(q.explanation?.en || "");
          const sol = steps.length ? steps.join(" ") : ans;
          if (stem && sol && !/^complete the textbook statement|^true or false|^identify the correct/i.test(stem)) {
            examples.push({ q: stem, sol, tier: q.tier || "textbook" });
          }
        }
      } catch {}
    }
  }
  return {
    stories: [...new Set(stories)],
    concepts: [...new Set(concepts)],
    summaries: [...new Set(summaries)],
    examples,
    tips: [...new Set(tips)],
  };
}

function buildModel3(ch) {
  const { stories, concepts, summaries, examples, tips } = extractChapterContent(ch);
  const topicLabels = ch.topics.filter((t) => t.slug !== "whole-chapter").map((t) => t.title);
  const s0 = stories[0] || `Let us explore ${ch.title} with real-life examples, drawings, and step-by-step explanations.`;
  const c1 = concepts[0] || `Start with the foundational definition of ${ch.title} and observe every detail carefully.`;
  const c2 = concepts[1] || `Notice how the properties and patterns in ${ch.title} connect together.`;
  const c3 = concepts[2] || `Look at how the textbook applies these ideas to shapes, models, and real objects.`;
  const c4 = concepts[3] || summaries[0] || `Always verify your answer step by step using the core rule of ${ch.title}.`;
  const c5 = concepts[4] || concepts[1] || `Check units, labels, and conditions carefully before finalizing your solution.`;
  const ex1 = examples.find((e) => e.tier !== "advanced") || examples[0] || { q: `Apply the core rule of ${ch.title}`, sol: c2 };
  const ex2 = examples.find((e) => e !== ex1 && e.tier !== "advanced") || examples.find((e) => e !== ex1) || { q: `Solve a multi-step textbook problem in ${ch.title}`, sol: c3 };
  const ex3 = examples.find((e) => e.tier === "advanced") || examples.find((e) => e !== ex1 && e !== ex2) || ex2;
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
          id: "l1-overview",
          pill: "1. Chapter Overview",
          kind: "chalkboard",
          visual: pickVisual(ch, "overview", topicLabels),
          textbookBox: {
            ref: `${textbookRef} · Chapter Map`,
            concept: clipWord(s0, 200),
          },
          tip: clipWord(tips[0] || `Look at how all parts of ${ch.title} connect together.`, 140),
          beats: [
            { en: `Welcome to ${ch.title}. Today we will cover the full chapter step by step with visual drawings on the chalkboard.`, speakEn: toSpeakEn(`Welcome to ${ch.title}. Today we will cover the full chapter step by step with visual drawings on the chalkboard.`) },
            { en: clipWord(s0, 220), speakEn: toSpeakEn(clipWord(s0, 220)) },
          ],
          cues: [
            { b: 0, at: 0.12, type: ["ov-h", `Topic: ${ch.title}`, 900], color: "yellow" },
            { b: 1, at: 0.15, type: ["ov-s", clipWord(s0, 110), 1200], color: "green" },
          ],
        },
        {
          id: "l1-core-1",
          pill: "2. Core Concepts (1)",
          kind: "chalkboard",
          visual: pickVisual(ch, "part1", topicLabels),
          textbookBox: {
            ref: `${textbookRef} · Textbook Concepts`,
            concept: clipWord(c1, 200),
          },
          tip: `Look closely at the diagram on the board as we explain each property.`,
          beats: [
            { en: clipWord(c1, 220), speakEn: toSpeakEn(clipWord(c1, 220)) },
            { en: clipWord(c2, 220), speakEn: toSpeakEn(clipWord(c2, 220)) },
          ],
          cues: [
            { b: 0, at: 0.15, type: ["c1-a", `Key Concept: ${clipWord(c1, 95)}`, 1200], color: "green" },
            { b: 1, at: 0.2, type: ["c1-b", `Rule: ${clipWord(c2, 95)}`, 1200], color: "cyan" },
          ],
        },
        {
          id: "l1-core-2",
          pill: "3. Core Concepts (2)",
          kind: "chalkboard",
          visual: pickVisual(ch, "part2", [topicLabels[0] || "Observe", topicLabels[1] || "Compare", topicLabels[2] || "Apply"]),
          textbookBox: {
            ref: `${textbookRef} · Deeper Textbook Ideas`,
            concept: clipWord(c3, 200),
          },
          beats: [
            { en: clipWord(c3, 220), speakEn: toSpeakEn(clipWord(c3, 220)) },
            { en: clipWord(c4, 220), speakEn: toSpeakEn(clipWord(c4, 220)) },
          ],
          cues: [
            { b: 0, at: 0.15, type: ["c2-a", clipWord(c3, 100), 1200], color: "yellow" },
            { b: 1, at: 0.2, type: ["c2-b", clipWord(c4, 100), 1200], color: "green" },
          ],
        },
        {
          id: "l1-example",
          pill: "4. Worked Example",
          kind: "chalkboard",
          visual: pickVisual(ch, "example", ["Read Problem", "Apply Rule", "Verify Answer"]),
          textbookBox: {
            ref: `${textbookRef} · Textbook Example 1`,
            concept: clipWord(ex1.q, 180),
            example: clipWord(ex1.sol, 160),
          },
          beats: [
            { en: `Let us solve a textbook example carefully: ${clipWord(ex1.q, 200)}`, speakEn: toSpeakEn(`Let us solve a textbook example carefully: ${clipWord(ex1.q, 200)}`) },
            { en: `Step by step: ${clipWord(ex1.sol, 220)}`, speakEn: toSpeakEn(`Step by step: ${clipWord(ex1.sol, 220)}`) },
          ],
          cues: [
            { b: 0, at: 0.15, type: ["ex1-q", `Given: ${clipWord(ex1.q, 95)}`, 1100], color: "yellow" },
            { b: 1, at: 0.2, type: ["ex1-s", `Step 1: ${clipWord(ex1.sol, 105)}`, 1400], color: "green" },
          ],
        },
        {
          id: "l1-lab",
          pill: "5. Interactive Lab",
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
          id: "l2-example-2",
          pill: "1. Example 2 & Method",
          kind: "chalkboard",
          visual: pickVisual(ch, "part1", ["Identify Data", "Choose Method", "Check Result"]),
          textbookBox: {
            ref: `${textbookRef} · Level 2 Worked Example`,
            concept: clipWord(ex2.q, 180),
            example: clipWord(ex2.sol, 160),
          },
          tip: `Break multi-step textbook problems into small steps on the board.`,
          beats: [
            { en: `Welcome to Level 2 Advanced Mastery for ${ch.title}. Let us work through a deeper textbook problem.`, speakEn: toSpeakEn(`Welcome to Level 2 Advanced Mastery for ${ch.title}. Let us work through a deeper textbook problem.`) },
            { en: `Problem: ${clipWord(ex2.q, 200)}`, speakEn: toSpeakEn(`Problem: ${clipWord(ex2.q, 200)}`) },
            { en: `Solution: ${clipWord(ex2.sol, 220)}`, speakEn: toSpeakEn(`Solution: ${clipWord(ex2.sol, 220)}`) },
          ],
          cues: [
            { b: 0, at: 0.12, type: ["l2-e-h", `Level 2 · ${ch.title}`, 900], color: "pink" },
            { b: 1, at: 0.15, type: ["l2-e-q", `Given: ${clipWord(ex2.q, 95)}`, 1100], color: "yellow" },
            { b: 2, at: 0.2, type: ["l2-e-s", `Step 1: ${clipWord(ex2.sol, 105)}`, 1400], color: "green" },
          ],
        },
        {
          id: "l2-reverse",
          pill: "2. Reverse & Exam Trap",
          kind: "chalkboard",
          visual: pickVisual(ch, "example", ["Spot the Trap", "Work Backwards", "Verify"]),
          textbookBox: {
            ref: `${textbookRef} · Exam Challenge`,
            concept: clipWord(ex3.q, 180),
            example: clipWord(ex3.sol, 160),
          },
          tip: "Watch out for common exam traps — double-check units, labels, and signs!",
          beats: [
            { en: `Let us test our understanding with a challenge problem: ${clipWord(ex3.q, 200)}`, speakEn: toSpeakEn(`Let us test our understanding with a challenge problem: ${clipWord(ex3.q, 200)}`) },
            { en: `Check carefully: ${clipWord(ex3.sol, 220)}`, speakEn: toSpeakEn(`Check carefully: ${clipWord(ex3.sol, 220)}`) },
          ],
          cues: [
            { b: 0, at: 0.15, type: ["l2-q", `Challenge: ${clipWord(ex3.q, 95)}`, 1200], color: "yellow" },
            { b: 1, at: 0.2, type: ["l2-s", `Step 1: ${clipWord(ex3.sol, 105)}`, 1300], color: "green" },
          ],
        },
        {
          id: "l2-recap",
          pill: "3. Chapter Recap",
          kind: "chalkboard",
          visual: pickVisual(ch, "part2", topicLabels),
          textbookBox: {
            ref: `${textbookRef} · Complete Summary`,
            concept: clipWord(c5, 200),
          },
          beats: [
            { en: `Let us review the key takeaway from ${ch.title}: ${clipWord(c5, 210)}`, speakEn: toSpeakEn(`Let us review the key takeaway from ${ch.title}: ${clipWord(c5, 210)}`) },
          ],
          cues: [
            { b: 0, at: 0.15, type: ["l2-recap", `Summary: ${clipWord(c5, 105)}`, 1200], color: "cyan" },
          ],
        },
        {
          id: "l2-lab",
          pill: "4. Level 2 Lab",
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
