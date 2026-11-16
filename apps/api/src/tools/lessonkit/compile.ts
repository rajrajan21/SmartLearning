import { ClassroomLesson } from "@studysmart/shared";
import { COMPONENTS, cap, type Obj, type Params } from "./components.js";

/** A lesson recipe: the short form we write. See docs/19-lesson-recipes.md. */
export interface Recipe {
  id: string; board?: string; class: number; subject: string; chapter: string; topic: string;
  title: [string, string?]; bg?: string; titleColor?: string;
  /** pictures: ["numberline", "nl", {from:-5,to:5}] (a library piece), ["label", "tAnswer", {x,y,text,...}] (a text), ["raw", "myId", {kind:"circle",...}] */
  parts: [string, string, Params?][];
  steps: RStep[];
}
export interface RStep {
  id: string; section?: string; say: [string, string?];
  /** ["draw","nl:axis","number line"]  [verb, target, phrase-or-fraction, {color, ms, nth, hour, minute, mode, rate, part}]; target "nl:*" means every piece of nl */
  do?: (string | number | Params | undefined)[][];
  /** a question: s = stem, o = options [text, tamil, whyWrong, whyWrongTamil], ok = index of the right one, e = explanation */
  q?: { s: [string, string?]; o: [string, string?, string?, string?][]; ok: number; e: [string, string?] };
}
export interface Compiled { lesson: unknown; problems: string[] }

const loc = (t: [string, string?] | (string | undefined)[]) => (t[1] ? { en: t[0], ta: t[1] } : { en: t[0] });
const ACTIONS = ["draw", "show", "hide", "write", "fill", "pulse", "time", "mark", "spin", "clear"];

export function compileRecipe(r: Recipe): Compiled {
  const problems: string[] = [];
  const objects: Obj[] = [];
  const groups = new Map<string, string[]>();
  const add = (o: Obj, group?: string) => {
    if (objects.some((x) => x.id === o.id)) return void problems.push(`duplicate object id "${o.id}"`);
    objects.push(o);
    if (group) groups.set(group, [...(groups.get(group) ?? []), o.id]);
  };
  if (r.bg !== "none") add({ kind: "rect", id: "bg", x: 0, y: 0, w: 900, h: 500, rx: 0, fill: r.bg ?? "#FFF8EC" });
  add({ kind: "text", id: "title", x: 450, y: 38, text: r.title[0], size: 34, color: r.titleColor ?? "#B45309", anchor: "middle" });
  for (const [kind, id, p = {}] of r.parts) {
    if (kind === "label") add({ kind: "text", id, x: 450, y: 450, size: 30, anchor: "middle", color: "#16253F", ...p } as Obj);
    else if (kind === "raw") add({ ...p, id } as Obj);
    else if (COMPONENTS[kind]) for (const o of COMPONENTS[kind]!(id, p)) add(o, id);
    else problems.push(`unknown picture piece "${kind}"`);
  }
  const ids = new Set(objects.map((o) => o.id));
  const resolve = (t: string): string[] => {
    if (ids.has(t)) return [t];
    const [g, name] = t.split(":");
    if (g && name === "*" && groups.has(g)) return groups.get(g)!;
    if (g && name && ids.has(`${g}${cap(name)}`)) return [`${g}${cap(name)}`];
    problems.push(`unknown picture "${t}"`);
    return [];
  };

  const steps = r.steps.map((s, si) => {
    const actions: Record<string, unknown>[] = [];
    if (si === 0) { if (ids.has("bg")) actions.push({ do: "show", target: "bg", at: 0.01, ms: 200 }); actions.push({ do: "write", target: "title", at: 0.04, ms: 700 }); }
    for (const a of s.do ?? []) {
      const [verb, target, when, opt] = a as [string, string, string | number | Params | undefined, Params | undefined];
      if (!ACTIONS.includes(verb)) { problems.push(`step ${s.id}: unknown action "${verb}"`); continue; }
      const extra = (typeof when === "object" && when ? when : opt) ?? {};
      const start: Record<string, unknown> = typeof when === "string" ? { on: when } : typeof when === "number" ? { at: when } : {};
      if (verb === "clear") { actions.push({ do: "clear", at: 0 }); if (ids.has("bg")) actions.push({ do: "show", target: "bg", at: 0.005, ms: 200 }); actions.push({ do: "write", target: "title", at: 0.02, ms: 500 }); continue; }
      const list = resolve(String(target));
      list.forEach((t, k) => actions.push({ do: verb, target: t, ...(start.at !== undefined && list.length > 1 ? { at: Math.min(0.98, (start.at as number) + k * 0.03) } : start), ...extra }));
    }
    const step: Record<string, unknown> = { id: s.id, ...(s.section ? { section: s.section } : {}), narration: loc(s.say), actions };
    if (s.q) {
      step.check = {
        stem: loc(s.q.s), explanation: loc(s.q.e),
        options: s.q.o.map((o, k) => ({ id: "abcd"[k], text: loc([o[0], o[1]]), ...(k === s.q!.ok ? { correct: true } : { whyWrong: loc([o[2] ?? "", o[3]]) }) })),
      };
    }
    return step;
  });

  const lesson = { board: r.board ?? "CBSE", classLevel: r.class, subject: r.subject, chapter: r.chapter, topic: r.topic, status: "published", title: loc(r.title), objects, steps };
  const parsed = ClassroomLesson.safeParse(lesson);
  if (!parsed.success) for (const i of parsed.error.issues) problems.push(`${i.path.join(".") || "lesson"}: ${i.message}`);
  return { lesson: parsed.success ? parsed.data : lesson, problems };
}
