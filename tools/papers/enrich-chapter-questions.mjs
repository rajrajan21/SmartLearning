#!/usr/bin/env node
/**
 * Online Question Expansion Pipeline (Model 1.0 Assessments)
 *
 * Reads harvested papers from content/papers/*.json.gz (and optional curated bank JSONs),
 * maps eligible Grade 3–10 questions to board + class + subject + chapter, assigns tier
 * ("textbook" | "exam" | "advanced"), deduplicates by normalized question stem hash,
 * validates required fields, preserves source attribution & admin hide-by-source rules,
 * and writes questions-enrich-report.txt.
 *
 * Usage:
 *   node tools/papers/enrich-chapter-questions.mjs [--dry-run] [--apply] [--board cbse] [--class 6] [--hide-source "site"]
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const PAPERS_DIR = join(ROOT, "content", "papers");
const QUESTIONS_DIR = join(ROOT, "content", "questions");
const CURRICULUM_DIR = join(ROOT, "content", "curriculum");
const REPORT_FILE = join(ROOT, "questions-enrich-report.txt");

const BOARD_MAP = { cbse: "CBSE", matric: "TNMATRIC", stateboard: "TNMATRIC", ncert: "CBSE" };
const SUBJECT_MAP = {
  mathematics: "maths",
  maths: "maths",
  math: "maths",
  science: "science",
  english: "english",
  "social science": "social",
  social: "social",
  tamil: "tamil",
  hindi: "hindi",
};

const INSTRUCTION_PATTERNS = [
  /^this question paper contains/i,
  /^this question paper is divided/i,
  /^in section [a-e]/i,
  /^all questions are compulsory/i,
  /^general instructions/i,
  /^read the following instructions/i,
  /^maximum marks\s*:/i,
  /^time allowed\s*:/i,
];

/** Normalizes a question stem for deduplication. */
export function normalizeStem(stem) {
  return String(stem || "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^a-z0-9\u0B80-\u0BFF]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Deterministic SHA-1 hash of a normalized stem. */
export function normalizeStemHash(stem) {
  return createHash("sha1").update(normalizeStem(stem)).digest("hex").slice(0, 12);
}

/** Returns true if the text looks like a paper instruction line rather than a real question. */
export function isInstructionNoise(text) {
  const s = String(text || "").trim();
  if (s.length < 16 || s.length > 1200) return true;
  if (INSTRUCTION_PATTERNS.some((rx) => rx.test(s))) return true;
  // Filter garbled PDF extraction with excessive replacement or non-printable chars
  if ((s.match(/\uFFFD/g) || []).length > 2) return true;
  return false;
}

/** Determines question tier from paper metadata and marks. */
export function inferTier(paper, q) {
  const src = `${paper.title || ""} ${paper.source?.site || ""}`.toLowerCase();
  if (/ncert\s+exemplar|ncert\s+textbook/i.test(src)) return "textbook";
  if ((q.marks ?? 0) >= 4 || /\bhots\b|\bchallenge\b|\bolympiad\b/i.test(src)) return "advanced";
  return "exam";
}

/** Converts one harvested PaperQuestion into a SharpStudy Question object, or null if not auto-gradable / noisy. */
export function convertPaperQuestion(paper, q, index) {
  if (!q || isInstructionNoise(q.text)) return null;
  const stemEn = String(q.text).replace(/\s+/g, " ").trim();
  const tier = inferTier(paper, q);
  const marks = tier === "advanced" ? 3 : tier === "exam" ? 2 : 1;
  const round = tier === "textbook" ? 1 : tier === "advanced" ? 4 : 3;
  const hash = normalizeStemHash(stemEn);
  const key = `ext-${hash}-${index}`;
  const source = `${paper.source?.site || "Online Exam Bank"}${paper.year ? ` (${paper.year})` : ""}`.slice(0, 120);
  const sourceUrl = paper.source?.url ? String(paper.source.url).slice(0, 300) : undefined;
  const explanationEn = q.model && String(q.model).trim().length >= 8
    ? String(q.model).replace(/\s+/g, " ").trim().slice(0, 800)
    : `From ${source}: verify your answer step by step.`;

  const base = {
    key,
    round,
    tier,
    marks,
    stem: { en: stemEn },
    hints: [],
    explanation: { en: explanationEn },
    source,
    ...(sourceUrl ? { sourceUrl } : {}),
    provenance: "adapted",
    status: "published",
  };

  if (q.type === "mcq" && Array.isArray(q.options) && q.options.length >= 2 && q.options.length <= 5 && q.answer) {
    const letter = String(q.answer).trim().toUpperCase().replace(/[^A-E]/g, "");
    const idx = letter ? letter.charCodeAt(0) - 65 : -1;
    if (idx < 0 || idx >= q.options.length) return null;
    const options = q.options.map((opt, oi) => ({
      id: `opt-${oi + 1}`,
      text: { en: String(opt).replace(/^[A-E][).:\s]+/i, "").trim() || String(opt).trim() },
      correct: oi === idx,
    }));
    if (options.some((o) => !o.text.en)) return null;
    return { ...base, type: "mcq", options };
  }

  if (q.type === "tf" && q.answer) {
    const a = String(q.answer).trim().toLowerCase();
    if (a !== "true" && a !== "false" && a !== "t" && a !== "f") return null;
    return { ...base, type: "true_false", answer: a === "true" || a === "t" };
  }

  if ((q.type === "fill" || q.type === "short") && q.answer) {
    const ans = String(q.answer).trim();
    if (!ans || ans.length > 80) return null;
    return {
      ...base,
      type: q.type === "fill" || stemEn.includes("___") ? "fill" : "short",
      accepted: [ans],
      wrongAnswers: [],
    };
  }

  return null;
}

/**
 * Deduplicates incoming questions against existing questions using normalized stem hash.
 * Returns { kept, duplicates }.
 */
export function dedupeQuestions(existingQuestions, incomingQuestions) {
  const seen = new Set(existingQuestions.map((q) => normalizeStemHash(q?.stem?.en ?? "")));
  const kept = [];
  let duplicates = 0;
  for (const q of incomingQuestions) {
    const h = normalizeStemHash(q?.stem?.en ?? "");
    if (!h || seen.has(h)) {
      duplicates++;
      continue;
    }
    seen.add(h);
    kept.push(q);
  }
  return { kept, duplicates };
}

function loadCurriculumIndex() {
  const map = new Map(); // key: BOARD|class|subject -> [{ slug, title, words, defaultTopic }]
  if (!existsSync(CURRICULUM_DIR)) return map;
  for (const f of readdirSync(CURRICULUM_DIR).filter((x) => x.endsWith(".json"))) {
    const doc = JSON.parse(readFileSync(join(CURRICULUM_DIR, f), "utf8"));
    const board = String(doc.boardCode || doc.board || "").toUpperCase();
    for (const c of doc.classes || []) {
      for (const s of c.subjects || []) {
        const key = `${board}|${c.classLevel}|${s.slug}`;
        const list = map.get(key) || [];
        for (const ch of s.chapters || []) {
          const title = ch.title?.en || ch.slug;
          const words = normalizeStem(title).split(" ").filter((w) => w.length >= 4);
          const defaultTopic = ch.topics?.[0]?.slug || "whole-chapter";
          list.push({ slug: ch.slug, title, words, defaultTopic });
        }
        map.set(key, list);
      }
    }
  }
  return map;
}

function matchChapter(chapters, q) {
  if (!chapters?.length) return null;
  if (q.chapter) {
    const target = normalizeStem(q.chapter);
    const exact = chapters.find((c) => normalizeStem(c.title) === target || c.slug === target.replace(/\s+/g, "-"));
    if (exact) return exact;
  }
  const stem = normalizeStem(q.text);
  let best = null;
  let bestHits = 0;
  for (const ch of chapters) {
    const hits = ch.words.filter((w) => stem.includes(w)).length;
    if (hits > bestHits && hits >= Math.min(2, ch.words.length || 2)) {
      bestHits = hits;
      best = ch;
    }
  }
  return best;
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const dryRun = !apply || args.includes("--dry-run");
  const getArg = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const filterBoard = getArg("--board")?.toLowerCase();
  const filterClass = getArg("--class") ? Number(getArg("--class")) : undefined;
  const hiddenSources = args
    .flatMap((a, i) => (a === "--hide-source" && args[i + 1] ? [args[i + 1].toLowerCase()] : []));

  const curriculum = loadCurriculumIndex();
  const paperFiles = existsSync(PAPERS_DIR)
    ? readdirSync(PAPERS_DIR).filter((f) => f.endsWith(".json.gz")).sort()
    : [];

  const buckets = new Map(); // targetFile -> { meta, questions[] }
  const stats = {
    papersScanned: 0,
    papersSkippedHidden: 0,
    papersSkippedGrade: 0,
    questionsScanned: 0,
    questionsEligible: 0,
    questionsAdded: 0,
    questionsDeduped: 0,
    filesTouched: 0,
  };

  for (const pf of paperFiles) {
    stats.papersScanned++;
    const paper = JSON.parse(gunzipSync(readFileSync(join(PAPERS_DIR, pf))).toString("utf8"));
    const siteLower = String(paper.source?.site || "").toLowerCase();
    if (hiddenSources.some((h) => siteLower.includes(h))) {
      stats.papersSkippedHidden++;
      continue;
    }
    if (paper.cls < 3 || paper.cls > 10) {
      stats.papersSkippedGrade++;
      continue;
    }
    if (filterBoard && paper.board !== filterBoard) continue;
    if (filterClass && paper.cls !== filterClass) continue;

    const board = BOARD_MAP[paper.board] || paper.board.toUpperCase();
    const subject = SUBJECT_MAP[String(paper.subject || "").toLowerCase().trim()];
    if (!subject) continue;
    const chapters = curriculum.get(`${board}|${paper.cls}|${subject}`);
    if (!chapters?.length) continue;

    let idx = 0;
    for (const sec of paper.sections || []) {
      for (const q of sec.questions || []) {
        stats.questionsScanned++;
        idx++;
        const converted = convertPaperQuestion(paper, q, idx);
        if (!converted) continue;
        const ch = matchChapter(chapters, q);
        if (!ch) continue;
        stats.questionsEligible++;

        const fileName = `${board.toLowerCase()}-${paper.cls}-${subject}-${ch.slug}-${ch.defaultTopic}.json`;
        const targetPath = join(QUESTIONS_DIR, fileName);
        if (!buckets.has(targetPath)) {
          buckets.set(targetPath, {
            meta: { board, classLevel: paper.cls, subject, chapter: ch.slug, topic: ch.defaultTopic },
            incoming: [],
          });
        }
        buckets.get(targetPath).incoming.push(converted);
      }
    }
  }

  const lines = [
    `SharpStudy Online Question Enrichment Report`,
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${dryRun ? "DRY-RUN (pass --apply to write files)" : "APPLY"}`,
    `------------------------------------------------------------`,
  ];

  for (const [targetPath, bucket] of buckets.entries()) {
    const existingDoc = existsSync(targetPath)
      ? JSON.parse(readFileSync(targetPath, "utf8"))
      : { ...bucket.meta, questions: [] };
    const { kept, duplicates } = dedupeQuestions(existingDoc.questions || [], bucket.incoming);
    stats.questionsDeduped += duplicates;
    stats.questionsAdded += kept.length;
    if (kept.length > 0) {
      stats.filesTouched++;
      lines.push(`+ ${basename(targetPath)}: +${kept.length} new (${duplicates} dupes skipped)`);
      if (!dryRun) {
        mkdirSync(QUESTIONS_DIR, { recursive: true });
        existingDoc.questions = [...(existingDoc.questions || []), ...kept];
        writeFileSync(targetPath, JSON.stringify(existingDoc, null, 2) + "\n", "utf8");
      }
    }
  }

  lines.push(
    `------------------------------------------------------------`,
    `Papers scanned:        ${stats.papersScanned}`,
    `Skipped (hidden src):  ${stats.papersSkippedHidden}`,
    `Skipped (outside 3-10):${stats.papersSkippedGrade}`,
    `Questions scanned:     ${stats.questionsScanned}`,
    `Eligible & mapped:     ${stats.questionsEligible}`,
    `New unique questions:  ${stats.questionsAdded}`,
    `Duplicates skipped:    ${stats.questionsDeduped}`,
    `Question files touched:${stats.filesTouched}`,
    ``
  );

  writeFileSync(REPORT_FILE, lines.join("\n"), "utf8");
  console.log(lines.join("\n"));
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
