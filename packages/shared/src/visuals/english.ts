import { draw, pulse, show, step, T, write, type Frag, type O } from "./kit.js";

const HUE: Record<string, string> = { noun: "#D9531E", verb: "#1F4FD1", adjective: "#17785A", adverb: "#8E24AA", pronoun: "#E0A800", other: "#16253F" };

/** a sentence whose words light up by their job in the sentence */
export function sentenceParts(focus: "noun" | "verb" | "adjective" | "adverb" | "pronoun" = "noun"): Frag {
  const S: Record<string, { w: string; r: string }[]> = {
    noun: [{ w: "The", r: "other" }, { w: "girl", r: "noun" }, { w: "feeds", r: "verb" }, { w: "the", r: "other" }, { w: "cat", r: "noun" }],
    verb: [{ w: "The", r: "other" }, { w: "boy", r: "noun" }, { w: "runs", r: "verb" }, { w: "to", r: "other" }, { w: "school", r: "noun" }],
    adjective: [{ w: "The", r: "other" }, { w: "tall", r: "adjective" }, { w: "tree", r: "noun" }, { w: "gives", r: "verb" }, { w: "cool", r: "adjective" }, { w: "shade", r: "noun" }],
    adverb: [{ w: "The", r: "other" }, { w: "turtle", r: "noun" }, { w: "walks", r: "verb" }, { w: "slowly", r: "adverb" }],
    pronoun: [{ w: "Meena", r: "noun" }, { w: "is", r: "other" }, { w: "kind.", r: "other" }, { w: "She", r: "pronoun" }, { w: "helps", r: "verb" }, { w: "us.", r: "pronoun" }],
  };
  const words = S[focus]!, size = words.length > 5 ? 40 : 52, gap = size * 0.55, objs: O[] = [T("ttl", 450, 50, `The ${focus}`, 34, "accent")];
  const widths = words.map((x) => x.w.length * size * 0.55 + gap), total = widths.reduce((a, b) => a + b, 0);
  let x = 450 - total / 2;
  words.forEach((wd, i) => { objs.push(T(`w${i}`, x + widths[i]! / 2, 250, wd.w, size, wd.r === focus ? HUE[focus]! : "ink")); if (wd.r === focus) objs.push(T(`r${i}`, x + widths[i]! / 2, 305, focus, 24, HUE[focus]!)); x += widths[i]!; });
  const hit = words.map((w, i) => (w.r === focus ? i : -1)).filter((i) => i >= 0);
  const defs: Record<string, string> = { noun: "A noun is the name of a person, a place, an animal or a thing.", verb: "A verb is an action word. It tells us what someone does.", adjective: "An adjective is a describing word. It tells us more about a noun.", adverb: "An adverb tells us how, when or where something is done.", pronoun: "A pronoun is a word that takes the place of a noun, so we do not repeat the name." };
  return { title: `The ${focus}`, objects: objs, steps: [
    step(`Read this sentence slowly. ${words.map((w) => w.w).join(" ")}`, words.map((_, i) => write(`w${i}`, 0.1 + (i * 0.7) / words.length))),
    step(defs[focus]!, [show("ttl", 0.1)]),
    step(`In our sentence, the ${focus}${hit.length > 1 ? "s are" : " is"} ${hit.map((i) => words[i]!.w.replace(".", "")).join(" and ")}.`, [...hit.map((i) => pulse(`w${i}`, 0.3)), ...hit.map((i) => write(`r${i}`, 0.5))]),
  ] };
}
void draw;
