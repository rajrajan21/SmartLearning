// Builds animated explainers and picture pages for lessons that do not have a hand-made board, and a coverage report.
// Writes content/classroom/auto-<lesson>.json (hand-made boards are never touched), apps/web/public/visuals/coverage.json
// and tools/pictures/manifest.json (the list Fetch-Lesson-Pictures.bat downloads). Safe to run again: auto-* files are rebuilt.
// Usage: npx tsx src/tools/build-visuals.ts [--dry] [--list]
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ClassroomLesson, derive, LessonImport, matchLesson, ownText, PICTURES, type Frag, type LessonCtx, type LessonRef } from "@studysmart/shared";
import { classroomDir, lessonsDir } from "../server-paths.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const dry = process.argv.includes("--dry"), list = process.argv.includes("--list");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Block = { type: string; keepEnglishTerms?: string[]; text?: { en?: string } };
/** a "Key words" page built only from the lesson's own terms and its own sentences (never invented text) */
function keyWords(blocks: Block[], ref: LessonRef): Frag | null {
  const ex = blocks.find((b) => b.type === "explanation"), terms = [...new Set((ex?.keepEnglishTerms ?? []).filter((t) => t.length >= 3 && t.length <= 22))].slice(0, 5);
  if (terms.length < 3 || !ex?.text?.en) return null;
  const sentences = ex.text.en.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/);
  const objects: Frag["objects"] = [{ kind: "text", id: "ttl", x: 450, y: 50, text: "Key words", size: 38, anchor: "middle", color: "accent" }];
  const gap = 800 / terms.length;
  terms.forEach((t, i) => { const x = 50 + gap / 2 + i * gap; objects.push({ kind: "rect", id: `c${i}`, x: x - gap / 2 + 8, y: 150, w: gap - 16, h: 200, rx: 16, fill: "#FFF3D6", stroke: "warm", width: 4 }, { kind: "text", id: `w${i}`, x, y: 262, text: t, size: Math.min(34, Math.floor((gap - 30) / (t.length * 0.55))), anchor: "middle", color: "ink" }); });
  const list = terms.length > 1 ? `${terms.slice(0, -1).join(", ")} and ${terms[terms.length - 1]}` : terms[0]!;
  const steps: Frag["steps"] = [{ narration: `Here are the key words of this lesson: ${list}. Listen for them as we go.`, actions: [{ do: "show", target: "ttl", at: 0.05 }, ...terms.flatMap((t, i) => [{ do: "draw" as const, target: `c${i}`, on: t, ms: 500 }, { do: "write" as const, target: `w${i}`, on: t }])] }];
  void sentences;
  void ref; return { title: "Key words", objects, steps };
}

type AnyBlock = { type: string; keepEnglishTerms?: string[]; text?: { en?: string }; sentences?: { text: { en: string } }[]; points?: { en: string }[] };
/** the lesson's own key terms, sentences and summary points: the only material the lesson-based boards are made from */
function lessonCtx(ref: LessonRef, blocks: AnyBlock[], d: { board: string }): LessonCtx {
  const clean = (s: string) => s.replace(/\(additional, not in the textbook\)\s*/gi, "").trim();
  const ex = blocks.find((b) => b.type === "explanation"), tn = blocks.find((b) => b.type === "teacher_narration"), su = blocks.find((b) => b.type === "summary");
  const terms = [...new Set((ex?.keepEnglishTerms ?? []).map((t) => t.trim()).filter((t) => t.length >= 3 && t.length <= 30))];
  const sentences = (tn?.sentences?.length ? tn.sentences.map((s) => s.text.en) : (ex?.text?.en ?? "").replace(/\n+/g, " ").split(/(?<=[.!?])\s+/)).map(clean).filter((s) => s.length >= 8);
  return { board: d.board, classLevel: ref.classLevel, subject: ref.subject, chapter: ref.chapter, topic: ref.topic, title: ref.title, terms, sentences, summary: (su?.points ?? []).map((p) => clean(p.en)).filter((s) => s.length >= 8) };
}

const hand = new Set<string>();
for (const f of readdirSync(classroomDir).filter((x) => x.endsWith(".json"))) {
  if (f.startsWith("auto-")) { if (!dry) unlinkSync(join(classroomDir, f)); continue; }
  try { const h = JSON.parse(readFileSync(join(classroomDir, f), "utf8")); hand.add([h.board, h.classLevel, h.subject, h.chapter, h.topic].join("|").toLowerCase()); } catch { /* skipped */ }
}

type Row = { file: string; board: string; classLevel: number; subject: string; chapter: string; topic: string; title: string; before: boolean; animation: string | null; picture: string | null };
const rows: Row[] = [], problems: string[] = [], usedPics = new Map<string, number>();
for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json")).sort()) {
  const imp = LessonImport.safeParse(JSON.parse(readFileSync(join(lessonsDir, f), "utf8")));
  if (!imp.success || imp.data.lesson.status !== "published") continue;
  const d = imp.data, ref: LessonRef = { board: d.board, classLevel: d.classLevel, subject: d.subject, chapter: d.chapter, topic: d.topic, title: d.lesson.title.en };
  const hasHand = hand.has([d.board, d.classLevel, d.subject, d.chapter, d.topic].join("|").toLowerCase());
  const hasDiagram = d.lesson.blocks.some((b) => b.type === "diagram");
  const own = ownText(ref);
  let m = hasHand ? null : matchLesson(ref);
  if (!hasHand && !m) { const dv = derive(lessonCtx(ref, d.lesson.blocks as unknown as AnyBlock[], d)); if (dv) m = { rule: { id: dv.id, subjects: [], re: /./, make: () => dv.frag }, frag: dv.frag }; }
  if (!hasHand && !m) { const kw = keyWords(d.lesson.blocks as unknown as Block[], ref); if (kw) m = { rule: { id: "keywords", subjects: [], re: /./, make: () => kw }, frag: kw }; }
  const pic = PICTURES.find((p) => p.subjects.includes(ref.subject) && p.re.test(own)) ?? null;
  const row: Row = { file: f, ...ref, before: hasHand || hasDiagram, animation: hasHand ? "hand-made" : m?.rule.id ?? null, picture: pic?.src ?? null };
  rows.push(row);
  if (hasHand || (!m && !pic)) continue;
  const frag: Frag = m?.frag ?? { title: ref.title.slice(0, 40), objects: [], steps: [] };
  const objects = [...frag.objects], steps = [...frag.steps];
  if (pic) {
    usedPics.set(pic.src, (usedPics.get(pic.src) ?? 0) + 1);
    objects.push({ kind: "image", id: "pic", x: 150, y: 70, w: 600, h: 360, src: pic.src, alt: pic.alt, caption: pic.caption });
    steps.push({ narration: `Look at the picture on the board. ${pic.alt}. Pictures like this help us see what the words are describing.`, actions: [{ do: "clear", at: 0 }, { do: "show", target: "pic", at: 0.15, ms: 700 }] });
  }
  if (objects.some((o) => o.id === "ttl") && !steps.some((st) => st.actions.some((a) => a.target === "ttl")) && steps[0]) steps[0] = { ...steps[0], actions: [{ do: "show", target: "ttl", at: 0.05 }, ...steps[0].actions] };
  const lesson = { board: d.board, classLevel: d.classLevel, subject: d.subject, chapter: d.chapter, topic: d.topic, status: "published", title: { en: frag.title }, objects, steps: steps.map((s, i) => ({ id: i >= frag.steps.length ? "pic" : `${m?.rule.id.startsWith("d-") ? "d" : "s"}${i + 1}`, narration: { en: s.narration }, actions: s.actions })) };
  for (const st of lesson.steps as any[]) for (const a of st.actions ?? []) if (typeof a.at === "number") a.at = Math.min(1, Math.max(0, a.at));
  const ok = ClassroomLesson.safeParse(lesson);
  if (!ok.success) { problems.push(`${f}: ${ok.error.issues[0]?.path.join(".")} ${ok.error.issues[0]?.message}`); row.animation = null; row.picture = null; continue; }
  if (!dry) writeFileSync(join(classroomDir, `auto-${f}`), JSON.stringify(lesson, null, 1) + "\n");
}

const tally = (key: (r: Row) => string, pred: (r: Row) => boolean) => { const o: Record<string, { lessons: number; covered: number; lessonBoards: number }> = {}; for (const r of rows) { const k = key(r); (o[k] ??= { lessons: 0, covered: 0, lessonBoards: 0 }).lessons++; if (pred(r)) o[k]!.covered++; if (isLesson(r)) o[k]!.lessonBoards++; } return o; };
const isLesson = (r: Row) => !!r.animation?.startsWith("d-");
const covered = (r: Row) => !!((r.animation && r.animation !== "keywords") || r.picture);
const report = {
  generatedAt: new Date().toISOString(),
  /** the numbers before the lesson-based boards and the second set of topic boards were added (2026-11-17, 993 lessons) */
  baseline: { lessons: 993, animations: 302, anyVisual: 340, keywordsOnly: 653 },
  totals: { lessons: rows.length, before: rows.filter((r) => r.before).length, animations: rows.filter((r) => r.animation && r.animation !== "keywords" && !isLesson(r)).length, lessonBoards: rows.filter(isLesson).length, keywordCards: rows.filter((r) => r.animation === "keywords").length, withPicture: rows.filter((r) => r.picture).length, anyVisual: rows.filter((r) => (r.animation && r.animation !== "keywords") || r.picture).length, keywordsOnly: rows.filter((r) => r.animation === "keywords" && !r.picture).length, none: rows.filter((r) => !covered(r)).length },
  bySubject: tally((r) => `${r.board} ${r.classLevel} ${r.subject}`, covered),
  animationRules: Object.fromEntries([...new Set(rows.map((r) => r.animation).filter(Boolean) as string[])].map((k) => [k, rows.filter((r) => r.animation === k).length])),
  pictures: PICTURES.map((p) => ({ src: p.src, lessons: usedPics.get(p.src) ?? 0 })).filter((p) => p.lessons > 0),
  none: rows.filter((r) => !covered(r)).map((r) => `${r.board} ${r.classLevel} ${r.subject}: ${r.chapter} / ${r.topic}`),
  problems,
};
const manifest = { note: "Pictures to fetch from Wikimedia Commons. Run Fetch-Lesson-Pictures.bat. Only public domain, CC0, CC BY and CC BY-SA pictures are kept.", pictures: PICTURES.filter((p) => usedPics.has(p.src)).map(({ src, query, altQueries, files, alt, caption }) => ({ src, query, ...(altQueries?.length ? { altQueries } : {}), files: files ?? [], alt, caption, lessons: usedPics.get(src) })) };
if (!dry) {
  mkdirSync(join(root, "apps/web/public/visuals"), { recursive: true }); mkdirSync(join(root, "tools/pictures"), { recursive: true }); mkdirSync(join(root, "apps/web/public/pictures"), { recursive: true });
  writeFileSync(join(root, "apps/web/public/visuals/coverage.json"), JSON.stringify(report, null, 1) + "\n");
  writeFileSync(join(root, "tools/pictures/manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
  if (!existsSync(join(root, "apps/web/public/pictures/credits.json"))) writeFileSync(join(root, "apps/web/public/pictures/credits.json"), "{}\n");
}
console.log(JSON.stringify({ totals: report.totals, animationRules: report.animationRules, problems: problems.length }, null, 1));
if (problems.length) console.log(problems.slice(0, 15).join("\n"));
if (list) for (const r of rows) console.log(`${r.classLevel} ${r.subject} | ${r.chapter} | ${r.topic} -> ${r.animation ?? "-"} ${r.picture ?? ""}`);
