import { z } from "zod";
import { LocalizedText } from "./curriculum.js";
import { ContentStatus, LangAudio } from "./lesson.js";

/** The classroom board is always this size (viewBox); content coordinates use it. */
export const BOARD_W = 900;
export const BOARD_H = 500;

const Id = z.string().regex(/^[a-z][a-zA-Z0-9]{0,23}$/, "object ids start with a lowercase letter, letters and digits only");
/** a palette name (ink, accent, warm, good, soft, water, earth, sun) or a #rrggbb colour */
const Colour = z.string().regex(/^(ink|accent|warm|good|soft|water|earth|sun|#[0-9a-fA-F]{6})$/);
const N = z.number().min(-2000).max(2000);
const common = { id: Id, stroke: Colour.optional(), fill: Colour.optional(), width: z.number().min(1).max(20).optional() };

const CircleO = z.object({ kind: z.literal("circle"), ...common, cx: N, cy: N, r: z.number().min(1).max(1000) });
const LineO = z.object({ kind: z.literal("line"), ...common, x1: N, y1: N, x2: N, y2: N });
const ArrowO = z.object({ kind: z.literal("arrow"), ...common, x1: N, y1: N, x2: N, y2: N });
const RectO = z.object({ kind: z.literal("rect"), ...common, x: N, y: N, w: z.number().min(1).max(2000), h: z.number().min(1).max(2000), rx: z.number().min(0).max(100).optional() });
/** a slice of a circle; angles in degrees, 0 = straight up, going clockwise */
const SectorO = z.object({ kind: z.literal("sector"), ...common, cx: N, cy: N, r: z.number().min(1).max(1000), from: z.number().min(0).max(360), to: z.number().min(0).max(360) });
const PolyO = z.object({ kind: z.literal("poly"), ...common, points: z.array(z.tuple([N, N])).min(3).max(40) });
const PathO = z.object({ kind: z.literal("path"), ...common, d: z.string().max(600).regex(/^[MmLlCcQqZzHhVvSsTt0-9 .,\-]+$/, "path data may only use M L H V C S Q T Z commands") });
const TextO = z.object({ kind: z.literal("text"), id: Id, x: N, y: N, text: z.string().min(1).max(120), size: z.number().min(10).max(120).optional(), anchor: z.enum(["start", "middle", "end"]).optional(), color: Colour.optional() });
const ClockO = z.object({ kind: z.literal("clock"), id: Id, cx: N, cy: N, r: z.number().min(40).max(250) });
/** a 3D solid drawn by the site itself (no 3D library, no outside website) */
const FlowO = z.object({ kind: z.literal("flow"), id: Id, x: N, y: N, len: z.number().min(20).max(500), count: z.number().int().min(1).max(20).optional(), speed: z.number().min(0.1).max(3).optional(), spread: z.number().min(0).max(200).optional(), size: z.number().min(3).max(20).optional(), up: z.boolean().optional(), color: Colour.optional() });
const SolidO = z.object({ kind: z.literal("solid"), id: Id, shape: z.enum(["cube", "cuboid", "cylinder", "cone", "sphere", "pyramid"]), x: N, y: N, size: z.number().min(60).max(420), color: Colour.optional() });
export const BoardObject = z.discriminatedUnion("kind", [CircleO, LineO, ArrowO, RectO, SectorO, PolyO, PathO, TextO, ClockO, SolidO, FlowO]);
export type BoardObject = z.infer<typeof BoardObject>;

export const ActionKind = z.enum(["draw", "show", "hide", "write", "fill", "pulse", "time", "mark", "spin", "clear"]);
export const ClassAction = z.object({
  do: ActionKind,
  target: Id.optional(),
  /** starts when the teacher says this phrase (it must appear in the narration) */
  on: z.string().min(1).max(80).optional(),
  /** which occurrence of the phrase (1 = first); for a list such as 5, 10, 15 where the same number can appear twice */
  nth: z.number().int().min(1).max(40).optional(),
  /** or starts at this fraction (0 to 1) of the narration */
  at: z.number().min(0).max(1).optional(),
  ms: z.number().int().min(0).max(8000).optional(),
  color: Colour.optional(),
  hour: z.number().int().min(1).max(12).optional(),
  minute: z.number().int().min(0).max(59).optional(),
  part: z.enum(["hour", "minute"]).optional(),
  mode: z.enum(["faces", "edges", "corners", "none"]).optional(),
  rate: z.number().min(-180).max(180).optional(),
});
export type ClassAction = z.infer<typeof ClassAction>;

export const ClassroomCheck = z.object({
  stem: LocalizedText,
  options: z.array(z.object({ id: z.string().regex(/^[a-z0-9]{1,12}$/), text: LocalizedText, correct: z.boolean().optional(), whyWrong: LocalizedText.optional() })).min(2).max(4),
  explanation: LocalizedText,
});

export const ClassroomStep = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]{0,30}$/),
  /** the part of the lesson this step belongs to (shown in the lesson rail), e.g. "Story" */
  section: z.string().max(30).optional(),
  narration: LocalizedText,
  actions: z.array(ClassAction).max(80).default([]),
  check: ClassroomCheck.optional(),
});
export type ClassroomStep = z.infer<typeof ClassroomStep>;

const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const ClassroomShape = z.object({
  board: z.string().min(1).max(30), classLevel: z.number().int().min(1).max(12), subject: Slug, chapter: Slug, topic: Slug,
  status: ContentStatus.default("published"),
  title: LocalizedText,
  objects: z.array(BoardObject).max(700),
  steps: z.array(ClassroomStep).min(1).max(160),
});

export const VoiceInfo = z.object({ id: z.string(), label: z.string(), gender: z.enum(["female", "male"]), accent: z.enum(["us", "uk", "in"]), langs: z.array(z.enum(["en", "ta"])), ready: z.boolean() });
export type VoiceInfo = z.infer<typeof VoiceInfo>;

const needs: Record<z.infer<typeof ActionKind>, string[] | "any" | "none"> = {
  draw: ["circle", "line", "arrow", "rect", "sector", "poly", "path", "clock"],
  show: "any", hide: "any", write: ["text"], fill: ["circle", "rect", "sector", "poly", "path", "solid"],
  pulse: "any", time: ["clock"], mark: ["solid"], spin: ["solid"], clear: "none",
};

export const ClassroomLesson = ClassroomShape.superRefine((l, ctx) => {
  const kinds = new Map<string, string>();
  for (const o of l.objects) { if (kinds.has(o.id)) ctx.addIssue({ code: "custom", message: `duplicate object id "${o.id}"` }); kinds.set(o.id, o.kind); }
  l.steps.forEach((s, si) => {
    s.actions.forEach((a, ai) => {
      const at = (m: string) => ctx.addIssue({ code: "custom", path: ["steps", si, "actions", ai], message: m });
      const rule = needs[a.do];
      if (rule === "none") { if (a.target) at("clear takes no target"); }
      else {
        if (!a.target) return at(`"${a.do}" needs a target`);
        const k = kinds.get(a.target);
        if (!k) return at(`unknown object "${a.target}"`);
        if (rule !== "any" && !rule.includes(k)) at(`"${a.do}" cannot be used on a ${k}`);
      }
      if (a.do === "fill" && !a.color) at("fill needs a colour");
      if (a.do === "time" && a.hour === undefined) at("time needs an hour");
      if (a.do === "mark" && !a.mode) at("mark needs a mode");
      if (a.on && !s.narration.en.toLowerCase().includes(a.on.toLowerCase())) at(`the phrase "${a.on}" is not in this step's narration`);
      if (a.on && a.at !== undefined) at("use either on or at, not both");
    });
    if (s.check) {
      const right = s.check.options.filter((o) => o.correct).length;
      if (right !== 1) ctx.addIssue({ code: "custom", path: ["steps", si, "check"], message: "a check needs exactly one correct option" });
      for (const o of s.check.options) if (!o.correct && !o.whyWrong) ctx.addIssue({ code: "custom", path: ["steps", si, "check"], message: `option "${o.id}" needs a whyWrong` });
    }
  });
});
export type ClassroomLesson = z.infer<typeof ClassroomLesson>;

/** What the site sends to students: the lesson plus the recorded voice for each spoken part. */
export const PublicClassroom = ClassroomShape.extend({
  steps: z.array(ClassroomStep.extend({ audio: LangAudio.optional(), checkAudio: z.object({ stem: LangAudio.optional(), explanation: LangAudio.optional() }).optional() })),
});
export type PublicClassroom = z.infer<typeof PublicClassroom>;
export const ClassroomIndex = z.object({ voices: z.array(VoiceInfo).default([]), defaultVoice: z.string().default("malar"), items: z.array(z.object({ board: z.string(), classLevel: z.number(), subject: z.string(), chapter: z.string(), topic: z.string(), title: LocalizedText, steps: z.number(), minutes: z.number().optional() })) });
export type ClassroomIndex = z.infer<typeof ClassroomIndex>;

/* ------------------------------------------------------------------ timeline ----
 * The board is a pure function of "which step, how many milliseconds into it".
 * Pausing, replaying, going back or jumping to a step therefore always shows the right picture. */

export interface ObjState {
  vis: number;      // 0 hidden .. 1 fully visible
  draw: number;     // 0..1 how much of the outline is drawn
  fill: string | null; fillA: number;
  chars: number;    // 0..1 how much of a text is written
  pulse: number; pulseColor: string | null; pulsePart: "hour" | "minute" | null;
  tot: number;      // clocks: minutes after 12:00
  mark: "none" | "faces" | "edges" | "corners";
  spin: number;     // degrees per second (3D solids)
}
const blank = (): ObjState => ({ vis: 0, draw: 0, fill: null, fillA: 0, chars: 0, pulse: 0, pulseColor: null, pulsePart: null, tot: 0, mark: "none", spin: 0 });

const DEFAULT_MS: Record<z.infer<typeof ActionKind>, number> = { draw: 900, show: 400, hide: 400, write: 0, fill: 500, pulse: 1400, time: 1500, mark: 0, spin: 0, clear: 0 };
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const estimateDurationMs = (text: string) => Math.max(2000, text.trim().split(/\s+/).length * 430 + 700);

export interface WordTime { w: string; t: number; d?: number }
/** when (ms into the step) an action starts */
export function startMs(a: ClassAction, narration: string, durMs: number, words?: WordTime[]): number {
  if (a.at !== undefined) return a.at * durMs;
  if (a.on) {
    const hay = narration.toLowerCase(), needle = a.on.toLowerCase(), nth = a.nth ?? 1;
    let idx = -1;
    for (let n = 0, from = 0; n < nth; n++) { idx = hay.indexOf(needle, from); if (idx < 0) break; from = idx + 1; }
    if (idx < 0) return 0;
    const LAG = 250; // the picture lands a moment AFTER the word is heard, never before it
    const tokens = narration.trim().split(/\s+/).length, before = narration.slice(0, idx).trim();
    const k = before ? before.split(/\s+/).length : 0;
    if (words && words.length > 0) {
      // find the spoken words themselves (not just the position), so a small difference in how the voice split the words cannot shift the picture
      const norm = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      const want = a.on.split(/\s+/).map(norm).filter(Boolean), have = words.map((w) => norm(w.w));
      const hits: number[] = [];
      for (let i = 0; want.length > 0 && i <= have.length - want.length; i++) if (want.every((x, j) => have[i + j] === x)) hits.push(i);
      if (hits.length > 0) {
        const pick = a.nth !== undefined ? hits[Math.min(a.nth, hits.length) - 1]! : hits.reduce((m, h) => (Math.abs(h - k) < Math.abs(m - k) ? h : m), hits[0]!);
        return words[pick]!.t + LAG;
      }
      if (Math.abs(words.length - tokens) <= 2 && words[Math.min(k, words.length - 1)]) return words[Math.min(k, words.length - 1)]!.t + LAG;
    }
    return Math.min(durMs * 0.95, (idx / Math.max(1, narration.length)) * durMs + LAG);
  }
  return 0;
}

/** Everything on the board after steps 0..stepIndex-1 are finished and the current step is tMs in. */
export function sceneAt(lesson: Pick<ClassroomLesson, "objects" | "steps">, stepIndex: number, tMs: number, opts: { durMs: number; words?: WordTime[]; instant?: boolean; lang?: "en" | "ta" }): Record<string, ObjState> {
  const scene: Record<string, ObjState> = {};
  for (const o of lesson.objects) scene[o.id] = blank();
  const textLen = new Map(lesson.objects.filter((o) => o.kind === "text").map((o) => [o.id, (o as { text: string }).text.length]));

  const run = (a: ClassAction, p: number) => {
    const targets = a.do === "clear" ? Object.keys(scene) : [a.target!];
    for (const id of targets) {
      const prev = { ...scene[id]! }, st = scene[id]!;
      switch (a.do) {
        case "draw": st.vis = 1; st.draw = p; if (p >= 1) st.fillA = prev.fillA; break;
        case "show": st.vis = Math.max(prev.vis, p); st.draw = 1; st.chars = 1; break;
        case "hide": st.vis = prev.vis * (1 - p); break;
        case "clear": st.vis = 0; st.pulse = 0; st.spin = 0; break;
        case "write": st.vis = 1; st.chars = p; break;
        case "fill": st.vis = 1; st.draw = 1; st.fill = a.color!; st.fillA = prev.fill === a.color ? Math.max(prev.fillA, p) : p; break;
        case "pulse": st.pulse = p >= 1 ? 0 : Math.sin(Math.PI * p); st.pulseColor = a.color ?? null; st.pulsePart = a.part ?? null; break;
        case "time": { const target = (a.hour! % 12) * 60 + (a.minute ?? 0); const dest = prev.tot > target ? target + 720 * Math.ceil((prev.tot - target) / 720) : target; st.tot = prev.tot + (dest - prev.tot) * ease(p); st.vis = Math.max(st.vis, 1); break; }
        case "mark": st.mark = a.mode === "none" ? "none" : a.mode!; break;
        case "spin": st.spin = a.rate ?? 40; break;
      }
    }
  };

  for (let si = 0; si <= stepIndex && si < lesson.steps.length; si++) {
    const step = lesson.steps[si]!, current = si === stepIndex;
    const narration = step.narration[opts.lang ?? "en"] ?? step.narration.en;
    const dur = current ? opts.durMs : 1;
    const timed = step.actions.map((a, i) => {
      const ms = a.ms ?? (a.do === "write" ? Math.min(3000, Math.max(400, ((textLen.get(a.target ?? "") ?? 8) * 55))) : DEFAULT_MS[a.do]);
      return { a, i, ms, start: current ? startMs(a, step.narration.en, dur, opts.words) : 0 };
    }).sort((x, y) => x.start - y.start || x.i - y.i);
    for (const { a, ms, start } of timed) {
      if (!current) { run(a, 1); continue; }
      if (tMs < start) continue;
      const raw = ms === 0 || opts.instant ? 1 : clamp01((tMs - start) / ms);
      run(a, a.do === "write" || a.do === "pulse" || a.do === "time" ? raw : ease(raw));
    }
    void narration;
  }
  return scene;
}

/** clock hand angles in degrees from 12 o'clock, clockwise */
export const clockAngles = (tot: number) => ({ minute: (tot % 60) * 6, hour: (tot * 0.5) % 360 });
