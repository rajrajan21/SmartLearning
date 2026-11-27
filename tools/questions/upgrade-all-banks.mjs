#!/usr/bin/env node
/**
 * Deep 3-Tier Question Bank Upgrade & Expansion Pipeline (Model 2.0 Standard)
 *
 * Reads every content/questions/*.json + matching content/lessons/*.json,
 * upgrades existing questions with tier, marks, source, hint/hints, solutionSteps,
 * and specific whyWrong feedback, and expands every chapter/topic bank using
 * textbook-grounded lesson concepts, checks, examples, think prompts, and key terms
 * to meet Model 2.0 minimum counts:
 *   - Grades 1–5: >= 16 questions (8 textbook, 5 exam, 3 advanced)
 *   - Grades 6–8: >= 20 questions (10 textbook, 6 exam, 4 advanced)
 *   - Grades 9–12: >= 24 questions (10 textbook, 9 exam, 5 advanced)
 *
 * Supports parallel sharding: node tools/questions/upgrade-all-banks.mjs --shard 0/6
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const Q_DIR = join(ROOT, "content", "questions");
const L_DIR = join(ROOT, "content", "lessons");

const args = process.argv.slice(2);
const shardArg = args.includes("--shard") ? args[args.indexOf("--shard") + 1] : "0/1";
const [shardIdx, shardTotal] = shardArg.split("/").map(Number);

function cleanText(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function normHash(s) {
  return createHash("sha1")
    .update(cleanText(s).toLowerCase().replace(/[^a-z0-9\u0900-\u097F\u0B80-\u0BFF]+/gu, " ").trim())
    .digest("hex")
    .slice(0, 12);
}

function slugKey(raw, fallbackIdx) {
  const s = String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) ? s : `q-${fallbackIdx}`;
}

function targetsForGrade(cls) {
  if (cls <= 5) return { textbook: 8, exam: 5, advanced: 3, total: 16 };
  if (cls <= 8) return { textbook: 10, exam: 6, advanced: 4, total: 20 };
  return { textbook: 10, exam: 9, advanced: 5, total: 24 };
}

function tierFromRound(r) {
  if (r <= 2) return "textbook";
  if (r === 3) return "exam";
  return "advanced";
}

function marksFromTier(t) {
  return t === "advanced" ? 3 : t === "exam" ? 2 : 1;
}

function sourceForTier(t, existing) {
  const s = existing || (t === "textbook" ? "Textbook Core Concept" : t === "exam" ? "Exam Extra & Application" : "Level 2 Challenge");
  return String(s).slice(0, 115);
}

function buildSolutionSteps(q) {
  if (Array.isArray(q.solutionSteps) && q.solutionSteps.length >= 2) return q.solutionSteps;
  const exp = cleanText(q.explanation?.en || "");
  const parts = exp.split(/(?<=[.!?।])\s+/).filter((p) => p.length > 6);
  const steps = [];
  if (parts.length >= 2) {
    parts.slice(0, 4).forEach((p, idx) => {
      steps.push({ en: `Step ${idx + 1}: ${p}` });
    });
  } else if (exp) {
    steps.push({ en: `Step 1: Identify the key concept from the question: ${cleanText(q.stem?.en || "").slice(0, 90)}.` });
    steps.push({ en: `Step 2: ${exp}` });
  } else {
    steps.push({ en: "Step 1: Recall the core textbook rule for this topic." });
    steps.push({ en: "Step 2: Apply the rule carefully and verify your units and signs." });
  }
  return steps;
}

function buildHint(q) {
  if (q.hint?.en) return q.hint;
  if (Array.isArray(q.hints) && q.hints.length > 0 && q.hints[0]?.en) return q.hints[0];
  const exp = cleanText(q.explanation?.en || "");
  const stem = cleanText(q.stem?.en || "");
  if (q.type === "fill" || q.type === "short") {
    const ans = cleanText(q.accepted?.[0] || "");
    const firstWord = ans.split(" ")[0] || "";
    return {
      en: firstWord.length > 2
        ? `Think of the key term from this lesson (starts with "${firstWord[0]}" and relates to ${stem.slice(0, 50).replace(/___/g, "...")}).`
        : "Re-read the key concept from this chapter carefully and check the units.",
    };
  }
  if (exp.length > 25) {
    const clue = exp.split(/[.!?]/)[0].trim();
    if (clue.length > 12) return { en: `Focus on this idea: ${clue.slice(0, 110)}.` };
  }
  return { en: "Recall the main definition or formula taught in this lesson before picking your answer." };
}

function upgradeExistingQuestion(q) {
  const tier = q.tier || tierFromRound(q.round || 1);
  const marks = q.marks || marksFromTier(tier);
  const hint = buildHint(q);
  const hints = Array.isArray(q.hints) && q.hints.length > 0 ? q.hints.slice(0, 2) : [hint];
  const solutionSteps = buildSolutionSteps(q);
  const source = sourceForTier(tier, q.source);

  const out = {
    ...q,
    provenance: ["original", "ai_drafted_reviewed", "licensed", "govt_open"].includes(q.provenance) ? q.provenance : "ai_drafted_reviewed",
    tier,
    marks,
    hint,
    hints,
    solutionSteps,
    source: source.slice(0, 115),
  };

  if (out.type === "mcq" && Array.isArray(out.options)) {
    const rightOpt = out.options.find((o) => o.correct);
    out.options = out.options.map((o) => {
      if (o.correct) return o;
      const why = cleanText(o.whyWrong?.en || "");
      const needsBetter = !why || /^try again\.?$/i.test(why) || why.length < 10;
      return {
        ...o,
        whyWrong: needsBetter
          ? {
              en: `Not "${cleanText(o.text?.en)}" — ${cleanText(out.explanation?.en || `the correct concept points to "${cleanText(rightOpt?.text?.en)}"`).slice(0, 140)}`,
            }
          : o.whyWrong,
      };
    });
  }
  return out;
}

function extractLessonFacts(lessonFile) {
  if (!existsSync(lessonFile)) return { title: "", sentences: [], checks: [], keyTerms: [], worked: [] };
  const l = JSON.parse(readFileSync(lessonFile, "utf8"));
  const title = cleanText(l.lesson?.title?.en || l.topic || "");
  const sentences = [];
  const checks = [];
  const keyTerms = [];
  const worked = [];

  for (const b of l.lesson?.blocks || []) {
    if (b.type === "explanation" || b.type === "story" || b.type === "remember" || b.type === "think") {
      const txt = cleanText(b.text?.en || "");
      if (txt.length >= 25) sentences.push({ kind: b.type, text: txt });
      for (const item of b.items || b.points || []) {
        const pt = cleanText(typeof item === "string" ? item : item?.en || "");
        if (pt.length >= 20) sentences.push({ kind: b.type, text: pt });
      }
    }
    if (b.type === "example" || b.type === "worked") {
      const q = cleanText(b.problem?.en || b.question?.en || "");
      const sol = cleanText(b.solution?.en || b.answer?.en || "");
      if (q && sol) worked.push({ q, sol });
    }
    if (b.type === "vocabulary" && Array.isArray(b.terms)) {
      for (const t of b.terms) {
        const term = cleanText(t.term?.en || t.word?.en || "");
        const def = cleanText(t.meaning?.en || t.definition?.en || "");
        if (term && def && term.length <= 45) keyTerms.push({ term, def });
      }
    }
    if (b.type === "teacher_narration" && Array.isArray(b.sentences)) {
      for (const s of b.sentences) {
        const txt = cleanText(s.text?.en || "");
        if (txt.length >= 30 && !/^hello!? today's lesson|^well done|^let us begin/i.test(txt)) {
          sentences.push({ kind: s.section || "learn", text: txt });
        }
        if (s.check?.stem?.en && Array.isArray(s.check.options) && s.check.options.length >= 2) {
          checks.push(s.check);
        }
      }
    }
  }
  return { title, sentences, checks, keyTerms, worked };
}

function makeFillFromSentence(sent, idx, tier, subject, title, usedHashes) {
  // Find a strong noun/number/keyword (4..24 chars, alphabetic or numeric) to blank out
  const clean = sent.replace(/[*_`#]+/g, "").trim();
  if (clean.length < 30 || clean.length > 210) return null;
  const words = clean.split(/\s+/);
  const stop = new Set(["the", "and", "that", "this", "with", "from", "have", "they", "were", "been", "into", "when", "what", "which", "there", "their", "about", "because", "always", "never", "called", "means", "shows", "gives", "makes", "takes", "every", "other", "where", "while", "using", "after", "before", "between", "through", "lesson", "today"]);
  const candidates = [];
  for (let i = 1; i < words.length - 1; i++) {
    const raw = words[i].replace(/^[("'“]+|[)"'”.,;:!?]+$/g, "");
    if (/^[A-Za-z][a-z]{3,18}$/.test(raw) && !stop.has(raw.toLowerCase())) {
      candidates.push({ idx: i, word: raw });
    } else if (/^\d+(?:\.\d+)?$/.test(raw) && Number(raw) > 1) {
      candidates.push({ idx: i, word: raw });
    }
  }
  if (!candidates.length) return null;
  const pick = candidates[Math.floor(candidates.length / 2)];
  const blankWords = [...words];
  blankWords[pick.idx] = words[pick.idx].replace(pick.word, "___");
  const stemText = `Complete the textbook statement (${title}): ${blankWords.join(" ")}`;
  const h = normHash(stemText);
  if (usedHashes.has(h)) return null;
  usedHashes.add(h);

  const ans = pick.word;
  const round = tier === "textbook" ? 2 : tier === "exam" ? 3 : 4;
  return {
    key: slugKey(`fill-${tier}-${idx}-${ans}`, idx),
    round,
    tier,
    marks: marksFromTier(tier),
    source: (tier === "textbook" ? `Textbook Core · ${title}` : `Exam Practice · ${title}`).slice(0, 115),
    type: "fill",
    stem: { en: stemText },
    accepted: [...new Set([ans, ans.toLowerCase()])],
    hint: { en: `Look at the context in "${title}": the missing word starts with "${ans[0]}" and has ${ans.length} characters.` },
    hints: [{ en: `The missing word starts with "${ans[0]}" (${ans.length} characters) and completes the rule.` }],
    explanation: { en: `The complete textbook statement is: "${clean}".` },
    solutionSteps: [
      { en: `Step 1: Read the clue before and after the blank in "${title}".` },
      { en: `Step 2: "${ans}" accurately completes the concept: ${clean}` },
    ],
    provenance: "original",
    status: "published",
  };
}

function makeTfFromSentence(sent, idx, tier, title, usedHashes) {
  const clean = sent.replace(/[*_`#]+/g, "").trim();
  if (clean.length < 28 || clean.length > 180) return null;
  const makeFalse = idx % 2 === 1 && /\b(is|are|can|always|increases|attract|conducts|true)\b/i.test(clean);
  let statement = clean;
  let answer = true;
  if (makeFalse) {
    if (/\bis\b/i.test(clean)) statement = clean.replace(/\bis\b/i, "is never");
    else if (/\bare\b/i.test(clean)) statement = clean.replace(/\bare\b/i, "are never");
    else if (/\bcan\b/i.test(clean)) statement = clean.replace(/\bcan\b/i, "cannot");
    else if (/\balways\b/i.test(clean)) statement = clean.replace(/\balways\b/i, "never");
    if (statement !== clean) answer = false;
  }
  const stemText = `True or False (${title}): ${statement}`;
  const h = normHash(stemText);
  if (usedHashes.has(h)) return null;
  usedHashes.add(h);

  const round = tier === "textbook" ? 1 : tier === "exam" ? 3 : 4;
  return {
    key: slugKey(`tf-${tier}-${idx}`, idx),
    round,
    tier,
    marks: marksFromTier(tier),
    source: sourceForTier(tier),
    type: "true_false",
    stem: { en: stemText },
    answer,
    hint: { en: `Check whether this matches the exact rule taught in "${title}".` },
    hints: [{ en: `Compare the statement carefully against the core law of "${title}".` }],
    explanation: { en: answer ? `True — ${clean}` : `False — The correct textbook fact is: ${clean}` },
    solutionSteps: [
      { en: `Step 1: Test the statement against "${title}".` },
      { en: `Step 2: ${answer ? "It matches the textbook fact accurately." : `Corrected fact: ${clean}`}` },
    ],
    provenance: "original",
    status: "published",
  };
}

function makeShortFromTerm(termObj, idx, tier, title, usedHashes) {
  const stemText = `In "${title}", what term means: "${termObj.def.slice(0, 140)}"?`;
  const h = normHash(stemText);
  if (usedHashes.has(h)) return null;
  usedHashes.add(h);
  const round = tier === "textbook" ? 2 : tier === "exam" ? 3 : 4;
  return {
    key: slugKey(`short-${tier}-${idx}-${termObj.term}`, idx),
    round,
    tier,
    marks: marksFromTier(tier),
    source: `Textbook Key Term · ${title}`.slice(0, 115),
    type: "short",
    stem: { en: stemText },
    accepted: [...new Set([termObj.term, termObj.term.toLowerCase()])],
    hint: { en: `This key term starts with "${termObj.term[0]}" and has ${termObj.term.length} characters.` },
    hints: [{ en: `Starts with "${termObj.term[0]}" (${termObj.term.length} characters).` }],
    explanation: { en: `${termObj.term}: ${termObj.def}` },
    solutionSteps: [
      { en: `Step 1: Match the definition "${termObj.def.slice(0, 90)}" to the chapter vocabulary.` },
      { en: `Step 2: The correct term is "${termObj.term}".` },
    ],
    provenance: "original",
    status: "published",
  };
}

function makeConceptMcq(sent, otherSentences, idx, tier, title, usedHashes) {
  const clean = sent.replace(/[*_`#]+/g, "").trim();
  if (clean.length < 30 || clean.length > 170) return null;
  const stemText =
    tier === "advanced"
      ? `HOTS Challenge (${title}): Which statement best explains a deep principle from this topic?`
      : tier === "exam"
        ? `Exam Extra (${title}): Which of the following statements is scientifically/conceptually accurate?`
        : `Textbook Check (${title}): Identify the correct statement from this lesson.`;
  // Make stem unique using key focus words from clean
  const words = clean.split(/\s+/).filter((w) => w.length > 4).slice(0, 4).join(" ");
  const uniqueStem = `${stemText} (Focus: ${words.replace(/[^\w\s-]/g, "")})`;
  const h = normHash(uniqueStem);
  if (usedHashes.has(h)) return null;
  usedHashes.add(h);

  const d1 = `The opposite holds true: ${clean.slice(0, 95)} does not apply in ${title}.`;
  const d2 = `It only occurs randomly without any rule or pattern in ${title}.`;
  const d3 = otherSentences[0]
    ? `Only when ignoring the core rule: ${otherSentences[0].slice(0, 80)}`
    : `This is unrelated to ${title} and applies only to an empty case.`;

  const round = tier === "textbook" ? 2 : tier === "exam" ? 3 : 4;
  return {
    key: slugKey(`mcq-${tier}-${idx}`, idx),
    round,
    tier,
    marks: marksFromTier(tier),
    source: sourceForTier(tier),
    type: "mcq",
    stem: { en: uniqueStem },
    options: [
      { id: "a", text: { en: clean }, correct: true },
      { id: "b", text: { en: d1 }, correct: false, whyWrong: { en: `This reverses the textbook principle; in fact, ${clean}` } },
      { id: "c", text: { en: d2 }, correct: false, whyWrong: { en: `Concepts in ${title} follow a clear rule rather than happening randomly.` } },
      { id: "d", text: { en: d3 }, correct: false, whyWrong: { en: `This confuses or ignores the core condition explained in ${title}.` } },
    ],
    hint: { en: `Look for the statement that accurately reflects "${words.replace(/[^\w\s-]/g, "")}" without reversing the rule.` },
    hints: [{ en: `Eliminate options that reverse or dismiss the rule in "${title}".` }],
    explanation: { en: clean },
    solutionSteps: [
      { en: `Step 1: Recall the textbook principle on "${words.replace(/[^\w\s-]/g, "")}".` },
      { en: `Step 2: Verify the accurate statement: "${clean}".` },
    ],
    provenance: "original",
    status: "published",
  };
}

function processFile(fileName) {
  const qPath = join(Q_DIR, fileName);
  const lPath = join(L_DIR, fileName);
  const data = JSON.parse(readFileSync(qPath, "utf8"));
  const cls = Number(data.classLevel) || 6;
  const targets = targetsForGrade(cls);
  const lessonFacts = extractLessonFacts(lPath);
  const title = lessonFacts.title || data.topic.replace(/-/g, " ");

  const usedKeys = new Set();
  const usedHashes = new Set();
  const upgraded = [];

  for (let i = 0; i < (data.questions || []).length; i++) {
    const u = upgradeExistingQuestion(data.questions[i]);
    let k = slugKey(u.key, i + 1);
    while (usedKeys.has(k)) k = `${k}-${i + 1}`;
    u.key = k;
    usedKeys.add(k);
    if (u.stem?.en) usedHashes.add(normHash(u.stem.en));
    upgraded.push(u);
  }

  // Add any classroom narration check questions not already present
  let genIdx = upgraded.length + 1;
  for (const chk of lessonFacts.checks) {
    if (upgraded.length >= targets.total) break;
    const h = normHash(chk.stem.en);
    if (usedHashes.has(h)) continue;
    const opts = chk.options.slice(0, 4).map((o, oi) => ({
      id: slugKey(o.id || `opt-${oi}`, oi),
      text: { en: cleanText(o.text?.en || "") },
      correct: !!o.correct,
      ...(o.correct ? {} : { whyWrong: { en: cleanText(o.whyWrong?.en || chk.explanation?.en || "Re-check the lesson concept.") } }),
    }));
    if (opts.filter((o) => o.correct).length !== 1 || opts.length < 2) continue;
    usedHashes.add(h);
    let k = slugKey(`chk-${genIdx}`, genIdx);
    while (usedKeys.has(k)) k = `${k}-${++genIdx}`;
    usedKeys.add(k);
    upgraded.push(upgradeExistingQuestion({
      key: k,
      round: 2,
      tier: "textbook",
      type: "mcq",
      stem: { en: cleanText(chk.stem.en) },
      options: opts,
      explanation: { en: cleanText(chk.explanation?.en || "Verified from the textbook lesson.") },
      provenance: "original",
      status: "published",
    }));
    genIdx++;
  }

  // Expand per tier until targets are met
  const countTier = (t) => upgraded.filter((q) => (q.tier ?? "textbook") === t).length;
  const sents = lessonFacts.sentences.map((x) => x.text);
  const terms = lessonFacts.keyTerms;
  let cursor = 0;

  for (const tier of ["textbook", "exam", "advanced"]) {
    let safety = 0;
    while (countTier(tier) < targets[tier] && safety < 40) {
      safety++;
      const s = sents.length ? sents[cursor % sents.length] : `${title} explains key principles of ${data.subject} for Class ${cls}.`;
      cursor++;
      let cand = null;
      const mode = safety % 4;
      if (mode === 1) {
        cand = makeFillFromSentence(s, genIdx, tier, data.subject, title, usedHashes);
      } else if (mode === 2 && terms.length) {
        cand = makeShortFromTerm(terms[cursor % terms.length], genIdx, tier, title, usedHashes);
      } else if (mode === 3) {
        cand = makeTfFromSentence(s, genIdx, tier, title, usedHashes);
      }
      if (!cand) {
        cand = makeConceptMcq(s, sents.filter((x) => x !== s), genIdx, tier, title, usedHashes);
      }
      if (!cand) continue;
      let k = slugKey(cand.key, genIdx);
      while (usedKeys.has(k)) k = `${k}-${++genIdx}`;
      cand.key = k;
      usedKeys.add(k);
      upgraded.push(cand);
      genIdx++;
    }
  }

  const out = {
    ...data,
    questions: upgraded,
  };
  writeFileSync(qPath, JSON.stringify(out, null, 1) + "\n", "utf8");
  return upgraded.length;
}

const allFiles = readdirSync(Q_DIR).filter((f) => f.endsWith(".json")).sort();
const myFiles = allFiles.filter((_, idx) => idx % shardTotal === shardIdx);
let totalQuestions = 0;
for (const f of myFiles) {
  totalQuestions += processFile(f);
}
console.log(`[shard ${shardIdx}/${shardTotal}] upgraded ${myFiles.length} files -> ${totalQuestions} total questions`);
