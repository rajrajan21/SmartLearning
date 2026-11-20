import { AR, C, draw, L, pulse, R, show, spread, step, T, write, type Frag, type O } from "./kit.js";

/** the four main directions and the sun */
export function compass(): Frag {
  return { title: "Directions", objects: [T("ttl", 450, 44, "The four directions", 34, "accent"), C("cc", 450, 265, 130, undefined, "soft", 4), AR("n", 450, 265, 450, 120, "accent", 7), AR("s", 450, 265, 450, 410, "warm", 7), AR("e", 450, 265, 600, 265, "good", 7), AR("w", 450, 265, 300, 265, "water", 7), T("tn", 450, 110, "North", 32, "accent"), T("ts", 450, 445, "South", 32, "warm"), T("te", 660, 275, "East", 32, "good"), T("tw", 240, 275, "West", 32, "water"), T("sn", 790, 130, "☀️", 80), T("sr", 790, 200, "Sun rises in the east", 20, "sun"), C("mid", 450, 265, 10, "#FF8A65", "warm", 3)], steps: [
    step("To find a place, we use directions. There are four main directions.", [show("mid", 0.2), draw("cc", 0.5)]),
    step("The Sun rises in the east. If you stand facing the sunrise, the east is in front of you.", [show("sn", 0.1), draw("e", 0.3), write("te", undefined, "east"), write("sr", 0.7)]),
    step("The west is behind you, the north is on your left and the south is on your right. Then north, east, south and west make a full compass.", [draw("w", 0.1), write("tw", 0.15), draw("n", 0.35), write("tn", 0.4), draw("s", 0.6), write("ts", 0.65)]),
  ] };
}

/** reading a map with a grid and a key */
export function mapGrid(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "Reading a map", 34, "accent"), R("mp", 80, 100, 480, 340, "#E8F5E9", "ink", 5, 6)];
  for (let i = 1; i < 4; i++) objs.push(L(`v${i}`, 80 + i * 120, 100, 80 + i * 120, 440, "soft", 2));
  for (let j = 1; j < 3; j++) objs.push(L(`h${j}`, 80, 100 + j * 113, 560, 100 + j * 113, "soft", 2));
  objs.push(R("lake", 330, 130, 130, 80, "#90CAF9", "water", 3, 30), T("lt", 395, 178, "Lake", 20, "ink"), T("hs", 170, 360, "🏫", 50), T("hp", 450, 340, "🏥", 50), T("tr", 270, 250, "🌳", 44), L("rd", 80, 290, 560, 290, "earth", 8), T("kt", 700, 140, "Key", 30, "accent"), T("k1", 640, 195, "🏫 School", 24, "ink", "start"), T("k2", 640, 245, "🏥 Hospital", 24, "ink", "start"), T("k3", 640, 295, "🌳 Park", 24, "ink", "start"), T("sc", 700, 400, "A map shows a place from above", 20, "soft"));
  return { title: "Reading a map", objects: objs, steps: [
    step("A map is a drawing of a place as seen from above. It uses small pictures and lines to show things.", [draw("mp", 0.3), draw("rd", 0.6), draw("lake", 0.8), write("lt", 0.9)]),
    step("The key tells us what each picture means. A map has a key so that anyone can read it.", [write("kt", undefined, "key"), write("k1", 0.4), write("k2", 0.55), write("k3", 0.7), show("hs", 0.5), show("hp", 0.6), show("tr", 0.7)]),
    step("The grid lines help us find a place. We say how far across and how far down it is.", [...[1, 2, 3].map((i) => draw(`v${i}`, 0.1 + i * 0.1)), ...[1, 2].map((j) => draw(`h${j}`, 0.4 + j * 0.1)), pulse("hs", 0.7)]),
  ] };
}

/** a timeline: a line with dated events the lesson names */
export function timeline(title: string, events: { when: string; what: string }[]): Frag {
  const n = events.length, gap = 760 / Math.max(1, n - 1), objs: O[] = [T("ttl", 450, 44, title, 34, "accent"), L("ax", 60, 260, 840, 260, "ink", 6)];
  events.forEach((e, i) => { const x = n === 1 ? 450 : 70 + i * gap; objs.push(C(`d${i}`, x, 260, 13, "#FF8A65", "warm", 3), T(`w${i}`, x, 235 - (i % 2) * 0, e.when, 26, "warm"), T(`t${i}`, x, 320 + (i % 2) * 70, e.what, 22, "ink")); });
  return { title, objects: objs, steps: [
    step("A timeline puts events in order, from the oldest on the left to the newest on the right.", [draw("ax", 0.4)]),
    ...events.map((e, i) => step(`${e.when}: ${e.what}.`, [draw(`d${i}`, 0.15), write(`w${i}`, 0.3), write(`t${i}`, 0.5)])),
  ] };
}
