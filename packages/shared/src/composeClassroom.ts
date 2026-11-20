import type { ClassroomLesson, ClassroomStep, BoardObject, ClassAction } from "./classroom.js";
import type { TopicLesson } from "./lesson.js";
import type { Question } from "./question.js";
import { picturesFor, expressionIn, SECTION_ICON, SHAPES } from "./illustrate.js";

/**
 * Builds a whole-lesson board presentation from a lesson that already exists (story, explanation, narration, worked
 * examples, summary) and its practice questions. Pure and fast: no AI, no network. The board keeps a running page
 * that is wiped when it is full or a new part of the lesson starts.
 */
export interface ComposeInput {
  meta: { board: string; classLevel: number; subject: string; chapter: string; topic: string };
  lesson: Pick<TopicLesson, "title" | "blocks">;
  questions?: Question[];
  /** a hand-made picture page (e.g. a 3D solid or a clock) slotted in after the first narration */
  insert?: Pick<ClassroomLesson, "objects" | "steps">;
}

const LEAD_INS = ["Let us try a question.", "Here is another question for you.", "Now you try this one.", "One more question. Take your time."];
/** story characters: shown for a moment while they are mentioned, then taken away */
const BRIEF = new Set(["grandfather", "grandmother", "mother", "father", "mom", "dad", "baby", "teacher", "doctor", "farmer"]);
const BOARD_TOP = 112, LINE_H = 44, BOARD_BOTTOM = 470;

/** Splits a paragraph into sentences. */
export function sentences(text: string): string[] {
  return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/).map((x) => x.trim()).filter(Boolean);
}
/** Groups sentences into short spoken chunks (at most two sentences and about 260 characters). */
export function chunks(text: string, maxChars = 260): string[] {
  const out: string[] = []; let cur = "";
  for (const s of sentences(text)) {
    if (cur && (cur.length + s.length + 1 > maxChars || cur.split(/(?<=[.!?])\s/).length >= 2)) { out.push(cur); cur = s; } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) out.push(cur);
  return out.flatMap((c) => (c.length <= 440 ? [c] : c.match(/.{1,400}(\s|$)/g)!.map((x) => x.trim())));
}
export function wrap(text: string, max: number): string[] {
  const lines: string[] = []; let cur = "";
  for (const w of text.split(/\s+/)) { if (cur && cur.length + w.length + 1 > max) { lines.push(cur); cur = w; } else cur = cur ? `${cur} ${w}` : w; }
  if (cur) lines.push(cur);
  return lines;
}
/** a short topic line for a step: its first clause, at a word boundary */
const topicOf = (t: string) => { const first = t.replace(/[.!?]+$/, "").split(/\s*(?:,|;| and | then )\s*/)[0]!.trim(); return first.length <= 48 ? first : first.slice(0, 48).replace(/\s+\S*$/, ""); };
const short = (t: string, n: number) => (t.length <= n ? t : t.slice(0, n - 1).trimEnd() + "…");

export function composeClassroom(inp: ComposeInput): ClassroomLesson {
  const objects: BoardObject[] = [];
  const steps: ClassroomStep[] = [];
  let page = 0, row = 0, figures = 0, uid = 0, wide = true, lead = 0;
  const id = (p: string) => `${p}${++uid}`;

  const shown = new Set<string>();
  const newPage = (label: string): ClassAction[] => {
    page++; row = 0; figures = 0;
    void label; shown.clear();
    return [{ do: "clear", at: 0 }];
  };
  const capacity = () => Math.floor((BOARD_BOTTOM - BOARD_TOP) / LINE_H) + 1;

  /** One spoken step: what is said, and the lines/shapes written while she says it. */
  const emit = (section: string, label: string, narration: string, lines: { text: string; color?: string; size?: number }[] = [], extra: (a: ClassAction[]) => void = () => {}, o: { fresh?: boolean; check?: ClassroomStep["check"] } = {}) => {
    const actions: ClassAction[] = [];
    const max = wide ? 46 : 28;
    const wrapped = lines.flatMap((l) => wrap(l.text, max).map((t, i) => ({ ...l, text: t, i })));
    const wantsFresh = o.fresh && (extra as { has?: boolean }).has !== false;
    if (page === 0 || wantsFresh || row + wrapped.length > capacity()) actions.push(...newPage(label));
    wrapped.forEach((l, k) => {
      const oid = id("l");
      objects.push({ kind: "text", id: oid, x: wide ? 60 : 40, y: BOARD_TOP + row * LINE_H, text: l.text, size: l.size ?? 30, color: (l.color as never) ?? "ink", anchor: "start" });
      actions.push({ do: "write", target: oid, at: Math.min(0.85, 0.12 + (0.7 * k) / Math.max(1, wrapped.length)) });
      row++;
    });
    extra(actions);
    const spokenParts = narration.length > 440 ? chunks(narration) : [narration];
    spokenParts.forEach((part, index) => {
      steps.push({
        id: `s${steps.length + 1}`,
        section,
        narration: { en: part },
        actions: index === 0 ? actions : [],
        ...(o.check && index === spokenParts.length - 1 ? { check: o.check } : {}),
      });
    });
  };


  /** Pictures instead of words: the things named in the sentence appear big, each as it is spoken. */
  const scene = (text: string, section: string, extraPics: string[] = [], spoken = text) => {
    const tp = tablePage(spoken);
    if (tp) { const f = tp as ((a: ClassAction[]) => void) & { has?: boolean }; f.has = true; return f; }
    const pics = picturesFor(text, 2).filter((p) => !shown.has(p.word)); const expr = expressionIn(text);
    const fn = ((a: ClassAction[]) => {
    const items: { emoji: string; word: string; count: number; at: string }[] = pics.length ? [...pics] : [];
    if (!items.length && extraPics.length === 0 && !expr) {
      // nothing relevant to draw: the board is simply cleared, never a leftover or unrelated picture
      return;
    }
    for (const e of extraPics) items.push({ emoji: e, word: "", count: 1, at: "" });
    for (const p of pics) shown.add(p.word);
    const n = Math.min(3, items.length), cellW = 800 / Math.max(1, n), size = [0, 120, 120, 100][n] ?? 100, cy = expr ? 215 : 255;
    items.slice(0, n).forEach((it, i) => {
      const cx = 50 + cellW * (i + 0.5); const phrase = it.at && spoken.includes(it.at) ? it.at : undefined;
      const when: Pick<ClassAction, "on" | "at"> = phrase ? { on: phrase } : { at: 0.1 + (0.5 * i) / n };
      const ids: string[] = [];
      if (it.count > 1) {
        const per = Math.min(5, it.count), rows = Math.ceil(it.count / per), sz = Math.min(64, (cellW - 20) / per);
        for (let k = 0; k < it.count; k++) {
          const o = id("p"); ids.push(o);
          objects.push({ kind: "text", id: o, x: cx + ((k % per) - (per - 1) / 2) * sz * 1.05, y: cy - ((rows - 1) / 2) * sz + Math.floor(k / per) * sz * 1.05 + sz * 0.3, text: it.emoji, size: sz, anchor: "middle" } as BoardObject);
        }
      } else if (SHAPES.has(it.word)) {
        const o = id("p"); const y = cy;
        const shape = it.word === "circle" ? { kind: "circle", cx, cy: y, r: 62 } : it.word === "square" ? { kind: "rect", x: cx - 62, y: y - 62, w: 124, h: 124 } : it.word === "rectangle" ? { kind: "rect", x: cx - 90, y: y - 55, w: 180, h: 110 } : it.word === "triangle" ? { kind: "poly", points: [[cx, y - 68], [cx + 72, y + 56], [cx - 72, y + 56]] } : { kind: "poly", points: [[cx, y - 72], [cx + 62, y], [cx, y + 72], [cx - 62, y]] };
        objects.push({ ...shape, id: o, stroke: "ink", fill: "#DDEBFF", width: 6 } as unknown as BoardObject);
        a.push({ do: "draw", target: o, ...(when.on ? { on: when.on } : { at: when.at }), ms: 800 } as ClassAction);
        const l = id("c"); objects.push({ kind: "text", id: l, x: cx, y: y + 100, text: it.word, size: 26, color: "soft", anchor: "middle" } as BoardObject); a.push({ do: "write", target: l, ...(when.on ? { on: when.on } : { at: when.at }), ms: 300 } as ClassAction);
        return;
      } else { const o = id("p"); ids.push(o); objects.push({ kind: "text", id: o, x: cx, y: cy + size * 0.35, text: it.emoji, size, anchor: "middle" } as BoardObject); }
      ids.forEach((o, k) => a.push({ do: "write", target: o, ...(when.on ? { on: when.on } : { at: (when.at ?? 0.1) + k * 0.02 }), ms: 350 } as ClassAction));
      let lab = ""; if (it.word) { const l = id("c"); lab = l; objects.push({ kind: "text", id: l, x: cx, y: cy + size * 0.35 + (it.count > 1 ? 70 : 52), text: it.word, size: 26, color: "soft", anchor: "middle" } as BoardObject); a.push({ do: "write", target: l, ...(when.on ? { on: when.on } : { at: when.at }), ms: 300 } as ClassAction); }
      if (BRIEF.has(it.word)) { for (const o of ids) a.push({ do: "hide", target: o, at: 0.62 } as ClassAction); if (lab) a.push({ do: "hide", target: lab, at: 0.62 } as ClassAction); }
      else if (n === 1 && it.count === 1) a.push({ do: "pulse", target: ids[0]!, at: 0.7 });
    });
    if (expr) { const e = id("x"); objects.push({ kind: "text", id: e, x: 450, y: 420, text: expr, size: 64, color: "accent", anchor: "middle" }); a.push({ do: "write", target: e, at: 0.5, ms: 900 }); }
    }) as ((a: ClassAction[]) => void) & { has?: boolean };
    fn.has = true;
    return fn;
  };


  /** "Table of 5: 5, 10, 15 ..." becomes one full page of the table, each line appearing as its number is spoken */
  const tablePage = (text: string): ((a: ClassAction[]) => void) | undefined => {
    const m = text.match(/table of (\d{1,2})\b/i); if (!m) return undefined;
    const n = Number(m[1]); const seq = [...text.matchAll(/\b\d+\b/g)].map((x) => Number(x[0]));
    const tableIdx = [...text.slice(0, (m.index ?? 0) + m[0].length).matchAll(/\b\d+\b/g)].length - 1;
    return (a) => {
      const t = id("tt"); objects.push({ kind: "text", id: t, x: 450, y: 62, text: `Table of ${n}`, size: 46, color: "accent", anchor: "middle" } as BoardObject); a.push({ do: "write", target: t, at: 0.02, ms: 500 });
      let seen = 0;
      for (let j = 1; j <= 10; j++) {
        const o = id("tr"), col = j <= 5 ? 0 : 1, row = (j - 1) % 5;
        objects.push({ kind: "text", id: o, x: 250 + col * 400, y: 150 + row * 66, text: `${j} × ${n} = ${j * n}`, size: 42, color: j % 2 ? "ink" : "good", anchor: "middle" } as BoardObject);
        const p = j * n;
        const at = seq.findIndex((x, i) => i > tableIdx && x === p);
        if (at > 0) a.push({ do: "write", target: o, on: String(p), nth: seq.slice(0, at + 1).filter((x) => x === p).length, ms: 450 } as ClassAction);
        else a.push({ do: "write", target: o, at: Math.min(0.9, 0.2 + (0.6 * seen++) / 10), ms: 450 } as ClassAction);
      }
    };
  };

  const title = inp.lesson.title.en;
  emit("Start", "Today's lesson", `Hello! Today's lesson is ${title}. Let us begin.`, [], (a) => {
    const t = id("t"); objects.push({ kind: "text", id: t, x: 450, y: 270, text: short(title, 34), size: 56, color: "accent", anchor: "middle" }); a.push({ do: "write", target: t, at: 0.25, ms: 1200 });
  });

  let inserted = false;
  const insertPicture = () => {
    if (inserted || !inp.insert) return; inserted = true;
    const P = (x: string) => `v${x}`.slice(0, 24);
    for (const o of inp.insert.objects) objects.push({ ...o, id: P(o.id) } as BoardObject);
    inp.insert.steps.forEach((st, i) => {
      const actions = st.actions.map((a) => ({ ...a, ...(a.target ? { target: P(a.target) } : {}) }));
      if (i === 0) actions.unshift({ do: "clear", at: 0 });
      steps.push({ ...st, id: `v-${st.id}`.slice(0, 31), section: "Picture it", actions });
    });
    page++; row = 99; // the next part starts on a clean board
  };

  let qn = 0;
  const byKey = new Map((inp.questions ?? []).map((q) => [q.key, q]));
  for (const b of inp.lesson.blocks) {
    if (b.type === "story") {
      chunks(b.text.en).forEach((c, i) => emit("Story", `Story: ${b.title.en}`, c, [], scene(c, "Story"), { fresh: true }));
    } else if (b.type === "explanation") {
      chunks(b.text.en).forEach((c, i) => emit("Learn", "Let us learn", c, [], scene(c, "Learn"), { fresh: true }));
    } else if (b.type === "teacher_narration") {
      wide = !b.sentences.some((s) => s.board.some((x) => x.op === "draw"));
      let first = true, lastShape: string | undefined;
      for (const sen of b.sentences) {
        const lines: { text: string; color?: string }[] = []; let fresh = first; first = false;
        const draws: Extract<ClassroomStep["actions"][number], object>[] = [];
        for (const op of sen.board) if (op.op === "clear") { fresh = true; figures = 0; }
        for (const op of sen.board) if (op.op === "write") lines.push({ text: op.text, color: "accent" });
        emit("Learn", "Let us learn", sen.spoken?.en ?? sen.text.en, lines, (acts) => {
          for (const op of sen.board) {
            if (op.op === "draw") {
              const col = figures % 2, rw = Math.floor(figures / 2) % 3, cx = 600 + col * 150, cy = 170 + rw * 135; figures++;
              const sid = id("f"); lastShape = sid;
              const o = op.shape === "circle" ? { kind: "circle", id: sid, cx, cy, r: 50, stroke: "ink", width: 5 } : op.shape === "rect" ? { kind: "rect", id: sid, x: cx - 55, y: cy - 38, w: 110, h: 76, stroke: "ink", width: 5 }
                : op.shape === "triangle" ? { kind: "poly", id: sid, points: [[cx, cy - 50], [cx + 55, cy + 40], [cx - 55, cy + 40]], stroke: "ink", width: 5 }
                : op.shape === "arrow" ? { kind: "arrow", id: sid, x1: cx - 55, y1: cy, x2: cx + 55, y2: cy, stroke: "ink", width: 5 } : { kind: "line", id: sid, x1: cx - 55, y1: cy, x2: cx + 55, y2: cy, stroke: "ink", width: 5 };
              objects.push(o as BoardObject); acts.push({ do: "draw", target: sid, at: 0.1, ms: 900 });
              if (op.label) { const lid = id("c"); objects.push({ kind: "text", id: lid, x: cx, y: cy + 78, text: short(op.label, 18), size: 22, color: "warm", anchor: "middle" }); acts.push({ do: "write", target: lid, at: 0.5, ms: 500 }); }
            } else if (op.op === "point" && lastShape) acts.push({ do: "pulse", target: lastShape, at: 0.4, color: "accent" });
          }
        }, { fresh });
        void draws;
      }
      wide = true;
      insertPicture();
    } else if (b.type === "worked_example") {
      emit("Example", "Worked example", `Let us work through an example. ${b.problem.en}`, [], scene(b.problem.en, "Example", [], `Let us work through an example. ${b.problem.en}`), { fresh: true });
      b.steps.forEach((st, i) => {
        const say = [`Step ${i + 1}. ${st.text.en}`, st.why?.en].filter(Boolean).join(" ");
        const parts = chunks(say);
        parts.forEach((c, k) => {
          const expr = expressionIn(c);
          if (k === 0) emit("Example", "Worked example", c, [{ text: `Step ${i + 1}`, color: "accent", size: 44 }, { text: topicOf(st.text.en), color: "ink", size: 32 }], expr ? scene(c, "Example") : undefined, { fresh: true });
          else emit("Example", "Worked example", c, [], expr ? scene(c, "Example") : undefined);
        });
      });
    } else if (b.type === "teach_back") {
      emit("Think", "Your turn to explain", b.prompt.en, [], scene(b.prompt.en, "Think"), { fresh: true });
    } else if (b.type === "summary") {
      emit("Remember", "Let us remember", "Let us remember what we learned.", [], undefined, { fresh: true });
      for (const p of b.points) emit("Remember", "Let us remember", p.en, [], scene(p.en, "Remember"), { fresh: true });
    } else if (b.type === "quiz") {
      for (const key of b.questionIds) {
        const q = byKey.get(key);
        if (!q || (q.type !== "mcq" && q.type !== "true_false")) continue;
        qn++;
        const stem = q.stem.en;
        const check: ClassroomStep["check"] = q.type === "mcq"
          ? { stem: q.stem, explanation: q.explanation, options: q.options.map((o) => ({ id: o.id, text: o.text, ...(o.correct ? { correct: true } : { whyWrong: o.whyWrong ?? q.explanation }) })) }
          : { stem: q.stem, explanation: q.explanation, options: [{ id: "t", text: { en: "True" }, ...(q.answer ? { correct: true } : { whyWrong: q.explanation }) }, { id: "f", text: { en: "False" }, ...(!q.answer ? { correct: true } : { whyWrong: q.explanation }) }] };
        emit("Practice", `Question ${qn}`, LEAD_INS[lead++ % LEAD_INS.length]!, [], scene(stem, "Practice", ["❓"], LEAD_INS[lead % LEAD_INS.length]!), { fresh: true, check });
      }
    }
  }
  insertPicture(); // lessons without a narration block still get the picture page
  emit("Done", "Well done", "That is the end of this lesson. Well done! You can watch it again, or try the practice questions.", [], (a) => {
    const t = id("t"); objects.push({ kind: "text", id: t, x: 450, y: 270, text: "Well done!", size: 70, color: "good", anchor: "middle" }); a.push({ do: "write", target: t, at: 0.2, ms: 900 });
  }, { fresh: true });

  return { ...inp.meta, status: "published", title: inp.lesson.title, objects, steps } as ClassroomLesson;
}
