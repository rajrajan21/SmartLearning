import { AR, C, clip, draw, L, lines, PA, PO, pulse, R, regPoly, SE, show, spread, step, T, wrap, write, type Frag, type O } from "./kit.js";
import { chain } from "./science.js";

/** More hand-written topic boards. Every fact on them is standard textbook content for the class that studies the topic. */

export interface Note { e: string; label: string; note: string; tag?: string }

/** cards, each introduced by its own spoken note */
export function notedGrid(title: string, items: Note[], intro: string, outro?: string): Frag {
  const n = items.length, per = n <= 4 ? n : Math.ceil(n / 2), objs: O[] = [T("ttl", 450, 44, title, 34, "accent")];
  items.forEach((it, i) => {
    const row = Math.floor(i / per), col = i % per, inRow = Math.min(per, n - row * per), gap = 840 / inRow, x = 30 + gap / 2 + col * gap, y = n <= 4 ? 250 : 165 + row * 205, cw = Math.min(230, gap - 20);
    objs.push(R(`c${i}`, x - cw / 2, y - 80, cw, 175, "#FFF3D6", "warm", 3, 14), T(`e${i}`, x, y - 12, it.e, 56, "ink"), T(`l${i}`, x, y + 32, clip(it.label, 22), it.label.length > 14 ? 20 : 24, "ink"));
    if (it.tag) objs.push(...lines(`g${i}x`, x, y + 60, it.tag, 17, Math.floor(cw / 8.6), "warm", "middle", 2));
  });
  const steps = [step(intro, [show("ttl", 0.1)])];
  items.forEach((it, i) => steps.push(step(it.note, [draw(`c${i}`, 0.08), show(`e${i}`, 0.12), write(`l${i}`, 0.18), ...objs.filter((o) => o.id.startsWith(`g${i}x`)).map((o) => write(o.id, 0.3))])));
  if (outro) steps.push(step(outro, [pulse("c0", 0.2, undefined, "good")]));
  return { title, objects: objs, steps };
}

const tbl = (title: string, rows: { a: string; b: string; c?: string }[], heads: [string, string, string?], intro: string, notes: string[], outro?: string): Frag => {
  const cols = heads[2] ? 3 : 2, xs = cols === 3 ? [170, 450, 730] : [250, 650], objs: O[] = [T("ttl", 450, 44, title, 34, "accent")];
  heads.forEach((h, i) => { if (h) objs.push(T(`h${i}`, xs[i]!, 100, h, 26, "accent")); });
  objs.push(L("hl", 40, 118, 860, 118, "ink", 3));
  rows.forEach((r, i) => [r.a, r.b, r.c].forEach((v, k) => { if (v !== undefined && k < cols) objs.push(T(`r${i}${k}`, xs[k]!, 170 + i * 62, v, 24, k === 0 ? "ink" : "warm")); }));
  const steps = [step(intro, [show("ttl", 0.05), ...heads.map((_, i) => (heads[i] ? write(`h${i}`, 0.2 + i * 0.1) : show("ttl", 0))), draw("hl", 0.5)])];
  rows.forEach((_, i) => steps.push(step(notes[i] ?? "", [...Array.from({ length: cols }, (_, k) => write(`r${i}${k}`, 0.15 + k * 0.2))])));
  if (outro) steps.push(step(outro, [pulse("hl", 0.2, undefined, "good")]));
  return { title, objects: objs, steps: steps.filter((s) => s.narration) };
};

// ---------------------------------------------------------------- maths
export function pointLineRay(): Frag {
  const cx = [120, 340, 560, 780], objs: O[] = [T("ttl", 450, 44, "Point, line segment, ray and line", 32, "accent"), C("pt", cx[0]!, 230, 7, "#FF8A65", "warm", 3), T("ptl", cx[0]!, 285, "A", 26, "accent"),
    L("sg", cx[1]! - 80, 230, cx[1]! + 80, 230, "ink", 5), C("sga", cx[1]! - 80, 230, 7, "#FF8A65", "warm", 3), C("sgb", cx[1]! + 80, 230, 7, "#FF8A65", "warm", 3), T("sgl", cx[1]!, 285, "A     B", 26, "accent"),
    L("ry", cx[2]! - 80, 230, cx[2]! + 75, 230, "ink", 5), AR("ryh", cx[2]! + 60, 230, cx[2]! + 100, 230, "ink", 5), C("rya", cx[2]! - 80, 230, 7, "#FF8A65", "warm", 3), T("ryl", cx[2]!, 285, "A", 26, "accent"),
    AR("l1", cx[3]!, 230, cx[3]! - 100, 230, "ink", 5), AR("l2", cx[3]!, 230, cx[3]! + 100, 230, "ink", 5), T("ll", cx[3]!, 285, "l", 26, "accent"),
    T("n1", cx[0]!, 360, "Point", 26, "ink"), T("n2", cx[1]!, 360, "Line segment", 26, "ink"), T("n3", cx[2]!, 360, "Ray", 26, "ink"), T("n4", cx[3]!, 360, "Line", 26, "ink"),
    ...lines("d1x", cx[0]!, 400, "an exact place", 18, 18, "warm"), ...lines("d2x", cx[1]!, 400, "two ends, fixed length", 18, 18, "warm"), ...lines("d3x", cx[2]!, 400, "one end, goes on one way", 18, 18, "warm"), ...lines("d4x", cx[3]!, 400, "no ends, goes on both ways", 18, 18, "warm")];
  return { title: "Point, line segment, ray and line", objects: objs, steps: [
    step("A point is an exact place. It has no length or width. We mark it with a dot and name it with a capital letter.", [show("ttl", 0.05), draw("pt", 0.3), write("ptl", 0.45), write("n1", 0.55), write("d1x0", 0.65)]),
    step("A line segment is a straight path between two points, its end points. It has a fixed length that we can measure.", [draw("sg", 0.2), draw("sga", 0.35), draw("sgb", 0.4), write("sgl", 0.5), write("n2", 0.6), write("d2x0", 0.7)]),
    step("A ray starts at one point and goes on and on in one direction. The arrow shows that it never stops.", [draw("rya", 0.2), draw("ry", 0.3), draw("ryh", 0.45), write("ryl", 0.5), write("n3", 0.6), write("d3x0", 0.7)]),
    step("A line goes on forever in both directions, so it has no end points. It is drawn with arrows at both ends.", [draw("l1", 0.2), draw("l2", 0.3), write("ll", 0.45), write("n4", 0.55), write("d4x0", 0.65)]),
  ] };
}

export function turns(): Frag {
  const xs = [170, 450, 730], defs: [string, number, string][] = [["¼ turn", 90, "90°"], ["½ turn", 180, "180°"], ["Full turn", 360, "360°"]], objs: O[] = [T("ttl", 450, 44, "Turns and angles", 34, "accent")];
  defs.forEach(([nm, deg, a], i) => objs.push(C(`c${i}`, xs[i]!, 240, 90, undefined, "soft", 4), SE(`s${i}`, xs[i]!, 240, 90, 0, deg >= 360 ? 359.9 : deg, "#FFE0B2", "warm", 4), AR(`a${i}`, xs[i]!, 240, xs[i]!, 150, "accent", 5), T(`n${i}`, xs[i]!, 380, nm, 28, "ink"), T(`d${i}`, xs[i]!, 420, a, 28, "warm")));
  return { title: "Turns and angles", objects: objs, steps: [
    step("When something turns, we can measure the turn in degrees. The arrow starts pointing up.", [show("ttl", 0.05), ...[0, 1, 2].map((i) => draw(`c${i}`, 0.3)), ...[0, 1, 2].map((i) => draw(`a${i}`, 0.5))]),
    step("A quarter turn is one fourth of a full turn. It makes a right angle, 90 degrees.", [draw("s0", 0.2, undefined, 1200), write("n0", 0.6), write("d0", 0.7)]),
    step("A half turn is two quarter turns. It makes 180 degrees, so the arrow points the opposite way.", [draw("s1", 0.2, undefined, 1400), write("n1", 0.6), write("d1", 0.7)]),
    step("A full turn brings the arrow back to where it began. It is 360 degrees.", [draw("s2", 0.2, undefined, 1800), write("n2", 0.65), write("d2", 0.75)]),
  ] };
}

export function bodmas(): Frag {
  const rows = [["1", "Brackets", "work out what is inside first"], ["2", "Orders", "powers and roots next"], ["3", "Division and multiplication", "left to right"], ["4", "Addition and subtraction", "left to right"]], objs: O[] = [T("ttl", 450, 44, "Order of operations", 34, "accent")];
  rows.forEach(([n, a, b], i) => objs.push(R(`r${i}`, 90, 85 + i * 62, 720, 52, "#FFF3D6", "warm", 3, 12), T(`n${i}`, 125, 120 + i * 62, n!, 30, "accent"), T(`a${i}`, 170, 120 + i * 62, a!, 26, "ink", "start"), T(`b${i}`, 790, 120 + i * 62, b!, 20, "warm", "end")));
  objs.push(T("ex", 450, 400, "3 + 4 × 2", 40, "ink"), T("ex2", 450, 445, "= 3 + 8 = 11", 40, "good"));
  return { title: "Order of operations", objects: objs, steps: [
    step("When a sum has more than one operation, we must do them in a fixed order, so that everybody gets the same answer.", [show("ttl", 0.05)]),
    step("First, anything inside brackets. Next, orders, which means powers and roots. Then division and multiplication, working from left to right. Last, addition and subtraction, also from left to right.", rows.flatMap((_, i) => [draw(`r${i}`, spread(4, i, 0.05, 0.8)), write(`n${i}`, spread(4, i, 0.07, 0.82)), write(`a${i}`, spread(4, i, 0.08, 0.83)), write(`b${i}`, spread(4, i, 0.1, 0.85))])),
    step("Try 3 plus 4 times 2. Multiplication comes before addition, so 4 times 2 is 8 first, and then 3 plus 8 is 11.", [write("ex", 0.2), pulse("r2", 0.4, undefined, "accent"), write("ex2", 0.6)]),
  ] };
}

export function hcfLcm(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "HCF and LCM of 12 and 18", 32, "accent"), T("f12", 450, 120, "Factors of 12: 1, 2, 3, 4, 6, 12", 26, "ink"), T("f18", 450, 165, "Factors of 18: 1, 2, 3, 6, 9, 18", 26, "ink"), T("cf", 450, 215, "Common factors: 1, 2, 3, 6", 26, "warm"), T("hcf", 450, 265, "HCF = 6 (the highest common factor)", 30, "good"),
    T("m12", 450, 335, "Multiples of 12: 12, 24, 36, 48 ...", 26, "ink"), T("m18", 450, 380, "Multiples of 18: 18, 36, 54 ...", 26, "ink"), T("lcm", 450, 440, "LCM = 36 (the lowest common multiple)", 30, "good")];
  return { title: "HCF and LCM", objects: objs, steps: [
    step("Let us find the HCF and the LCM of 12 and 18. First list the factors of each number.", [show("ttl", 0.05), write("f12", 0.35), write("f18", 0.7)]),
    step("The factors that appear in both lists are 1, 2, 3 and 6. The highest of these is 6, so the HCF of 12 and 18 is 6.", [write("cf", 0.2), pulse("f12", 0.35, undefined, "accent"), pulse("f18", 0.4, undefined, "accent"), write("hcf", 0.65)]),
    step("Now list the multiples. Multiples of 12 are 12, 24, 36 and 48. Multiples of 18 are 18, 36 and 54.", [write("m12", 0.3), write("m18", 0.65)]),
    step("The first number in both lists is 36. So the lowest common multiple, the LCM, is 36.", [pulse("m12", 0.2, undefined, "accent"), pulse("m18", 0.3, undefined, "accent"), write("lcm", 0.6)]),
  ] };
}

export function factorTree(): Frag {
  const nodes: [string, number, number, string, boolean][] = [["60", 450, 105, "", false], ["2", 330, 195, "", true], ["30", 570, 195, "", false], ["2", 480, 285, "", true], ["15", 660, 285, "", false], ["3", 590, 375, "", true], ["5", 730, 375, "", true]];
  const links: [number, number, number][] = [[0, 1, 0], [0, 2, 0], [2, 3, 0], [2, 4, 0], [4, 5, 0], [4, 6, 0]], objs: O[] = [T("ttl", 450, 44, "Prime factorisation of 60", 32, "accent")];
  links.forEach(([a, b], i) => objs.push(L(`k${i}`, nodes[a]![1], nodes[a]![2] + 24, nodes[b]![1], nodes[b]![2] - 24, "ink", 3)));
  nodes.forEach(([t, x, y, , prime], i) => objs.push(C(`n${i}`, x, y, 27, prime ? "#C8E6C9" : "#FFF3D6", prime ? "good" : "warm", 3), T(`t${i}`, x, y + 9, t, 26, "ink")));
  objs.push(T("res", 450, 450, "60 = 2 × 2 × 3 × 5", 36, "good"));
  const reveal = (ids: number[], at: number) => ids.flatMap((i, k) => [draw(`n${i}`, at + k * 0.08), write(`t${i}`, at + 0.03 + k * 0.08)]);
  return { title: "Prime factorisation", objects: objs, steps: [
    step("A factor tree breaks a number into smaller and smaller factors until only prime numbers are left. Let us break 60.", [show("ttl", 0.05), ...reveal([0], 0.4)]),
    step("60 is 2 times 30. The 2 is prime, so we stop there. 30 can be split again.", [draw("k0", 0.1), draw("k1", 0.15), ...reveal([1, 2], 0.3)]),
    step("30 is 2 times 15, and 2 is prime. Then 15 is 3 times 5, and both 3 and 5 are prime.", [draw("k2", 0.1), draw("k3", 0.15), ...reveal([3, 4], 0.25), draw("k4", 0.5), draw("k5", 0.55), ...reveal([5, 6], 0.6)]),
    step("The prime numbers at the ends of the branches give the prime factorisation: 60 equals 2 times 2 times 3 times 5.", [write("res", 0.4), ...[1, 3, 5, 6].map((i) => pulse(`n${i}`, 0.2, undefined, "good"))]),
  ] };
}

export function magicSquare(): Frag {
  const g = [[4, 9, 2], [3, 5, 7], [8, 1, 6]], x0 = 300, y0 = 95, s = 90, objs: O[] = [T("ttl", 450, 44, "A magic square", 34, "accent")];
  g.forEach((r, i) => r.forEach((v, j) => objs.push(R(`c${i}${j}`, x0 + j * s, y0 + i * s, s, s, "#FFF3D6", "warm", 3), T(`v${i}${j}`, x0 + j * s + s / 2, y0 + i * s + 58, String(v), 40, "ink"))));
  g.forEach((_, i) => objs.push(T(`s${i}`, x0 + 3 * s + 40, y0 + i * s + 58, "= 15", 30, "good")));
  objs.push(T("note", 450, 400, "Every row, every column and both diagonals add up to 15", 24, "accent"));
  return { title: "A magic square", objects: objs, steps: [
    step("A magic square is a grid of numbers in which every row, every column and both diagonals have the same sum. This one uses 1 to 9.", [show("ttl", 0.05), ...g.flatMap((r, i) => r.flatMap((_, j) => [draw(`c${i}${j}`, spread(9, i * 3 + j, 0.2, 0.9)), write(`v${i}${j}`, spread(9, i * 3 + j, 0.22, 0.92))]))]),
    step("Add the first row: 4 plus 9 plus 2 is 15. The second row, 3 plus 5 plus 7, is also 15, and so is the third, 8 plus 1 plus 6.", g.flatMap((_, i) => [pulse(`c${i}0`, 0.1 + i * 0.25, undefined, "accent"), pulse(`c${i}1`, 0.1 + i * 0.25, undefined, "accent"), pulse(`c${i}2`, 0.1 + i * 0.25, undefined, "accent"), write(`s${i}`, 0.15 + i * 0.25)])),
    step("The columns and both diagonals also add up to 15. That is why the square is called magic.", [write("note", 0.3), pulse("c00", 0.4, undefined, "good"), pulse("c11", 0.5, undefined, "good"), pulse("c22", 0.6, undefined, "good")]),
  ] };
}

export function signRules(): Frag {
  return tbl("Signs in multiplication", [{ a: "positive × positive", b: "positive" }, { a: "positive × negative", b: "negative" }, { a: "negative × positive", b: "negative" }, { a: "negative × negative", b: "positive" }], ["Multiply", "Answer"],
    "Here are the rules for the sign of a product of two integers.", [
      "A positive times a positive is positive. For example, 3 times 4 is 12.",
      "A positive times a negative is negative. For example, 3 times negative 4 is negative 12.",
      "A negative times a positive is also negative. Negative 3 times 4 is negative 12.",
      "A negative times a negative is positive. Negative 3 times negative 4 is 12.",
    ], "The same rules work for division. Same signs give a positive answer, and different signs give a negative answer.");
}

export function tilingAngles(): Frag {
  const items: [number, string, string, boolean][] = [[3, "Triangle", "60° × 6 = 360°", true], [4, "Square", "90° × 4 = 360°", true], [6, "Hexagon", "120° × 3 = 360°", true], [5, "Pentagon", "108° × 3 = 324°", false]], objs: O[] = [T("ttl", 450, 44, "Which regular polygons tile a floor?", 30, "accent")];
  items.forEach(([n, nm, eq, ok], i) => { const x = 120 + i * 220; objs.push(PO(`p${i}`, regPoly(x, 200, 65, n, n === 4 ? -135 : -90), ok ? "#C8E6C9" : "#FFCDD2", ok ? "good" : "accent", 4), T(`n${i}`, x, 320, nm, 26, "ink"), T(`q${i}`, x, 365, eq, 21, ok ? "good" : "accent"), T(`r${i}`, x, 410, ok ? "fits exactly" : "leaves a gap", 22, ok ? "good" : "accent")); });
  return { title: "Tiling with regular polygons", objects: objs, steps: [
    step("To cover a floor with tiles and no gaps, the angles that meet at a point must add up to 360 degrees.", [show("ttl", 0.05)]),
    step("Equilateral triangles have 60 degree angles, and six of them meet at a point: 6 times 60 is 360.", [draw("p0", 0.15), write("n0", 0.3), write("q0", 0.45), write("r0", 0.6)]),
    step("Squares have 90 degree angles, and four meet at a point: 4 times 90 is 360.", [draw("p1", 0.15), write("n1", 0.3), write("q1", 0.45), write("r1", 0.6)]),
    step("A regular hexagon has 120 degree angles, and three meet at a point: 3 times 120 is 360.", [draw("p2", 0.15), write("n2", 0.3), write("q2", 0.45), write("r2", 0.6)]),
    step("A regular pentagon has 108 degree angles. Three of them make only 324 degrees, which leaves a gap, so pentagons cannot tile a floor on their own.", [draw("p3", 0.15), write("n3", 0.3), write("q3", 0.45), write("r3", 0.6)]),
  ] };
}

export function congruenceRules(): Frag {
  return notedGrid("Triangles are congruent when ...", [
    { e: "📏", label: "SSS", tag: "three sides equal", note: "SSS. If all three sides of one triangle equal the three sides of another, the triangles are congruent." },
    { e: "📐", label: "SAS", tag: "two sides and the angle between", note: "SAS. If two sides and the angle between them are equal, the triangles are congruent." },
    { e: "🔺", label: "ASA", tag: "two angles and the side between", note: "ASA. If two angles and the side between them are equal, the triangles are congruent." },
    { e: "⊾", label: "RHS", tag: "right angle, hypotenuse, one side", note: "RHS. For right-angled triangles, if the hypotenuse and one other side are equal, the triangles are congruent." },
  ], "Two triangles are congruent if they match exactly. We do not need to compare all six parts. These conditions are enough.", "If any one of these conditions holds, we can say the triangles are congruent.");
}

export function angleBisector(): Frag {
  const O0: [number, number] = [230, 400], r = 330, pt = (deg: number): [number, number] => [Math.round(O0[0] + r * Math.cos((deg * Math.PI) / 180)), Math.round(O0[1] - r * Math.sin((deg * Math.PI) / 180))];
  const A = pt(0), B = pt(70), Cc = pt(35);
  return { title: "Angle bisector", objects: [T("ttl", 450, 44, "Bisecting an angle", 34, "accent"), L("oa", ...O0, ...A, "ink", 5), L("ob", ...O0, ...B, "ink", 5), L("oc", ...O0, ...Cc, "accent", 5), T("la", A[0] + 18, A[1] + 8, "A", 26, "ink"), T("lb", B[0], B[1] - 12, "B", 26, "ink"), T("lc", Cc[0] + 20, Cc[1] - 6, "C", 26, "accent"), T("lo", O0[0] - 20, O0[1] + 6, "O", 26, "ink"), T("t1", 640, 300, "35°", 28, "warm"), T("t2", 520, 230, "35°", 28, "warm"), T("tt", 450, 465, "∠AOB = 70°, so each half is 35°", 26, "good")], steps: [
    step("Here is an angle AOB of 70 degrees. The two arms meet at the point O.", [draw("oa", 0.2), draw("ob", 0.4), write("la", 0.55), write("lb", 0.6), write("lo", 0.65)]),
    step("The angle bisector is the ray that cuts the angle into two equal angles. Here the ray OC does that.", [draw("oc", 0.3), write("lc", 0.5)]),
    step("Each of the two angles is half of the whole. Half of 70 degrees is 35 degrees.", [write("t1", 0.2), write("t2", 0.3), write("tt", 0.55)]),
  ] };
}

export function triangleInequality(): Frag {
  const u = 36, objs: O[] = [T("ttl", 450, 44, "Can three sticks make a triangle?", 32, "accent")];
  const rowBars = (k: number, y: number, sides: number[], ok: boolean) => { let x = 120; sides.forEach((s, i) => { objs.push(R(`b${k}${i}`, x, y, s * u, 26, ["#BBDEFB", "#C8E6C9", "#FFE0B2"][i]!, "ink", 3, 5), T(`bl${k}${i}`, x + (s * u) / 2, y + 20, String(s), 20, "ink")); x += s * u + 16; }); objs.push(T(`rt${k}`, 450, y + 75, ok ? `${sides[0]} + ${sides[1]} = ${sides[0]! + sides[1]!}, which is more than ${sides[2]}: a triangle can be made` : `${sides[0]} + ${sides[1]} = ${sides[0]! + sides[1]!}, which is less than ${sides[2]}: no triangle`, 22, ok ? "good" : "accent")); };
  rowBars(0, 120, [3, 4, 5], true); rowBars(1, 290, [2, 3, 6], false);
  return { title: "Triangle inequality", objects: objs, steps: [
    step("The sum of any two sides of a triangle must be greater than the third side. Let us test this with sticks.", [show("ttl", 0.05)]),
    step("Sticks of 3, 4 and 5 units. The two shorter sticks together make 7, which is more than 5, so they can meet and form a triangle.", [...[0, 1, 2].map((i) => draw(`b0${i}`, 0.15 + i * 0.1)), ...[0, 1, 2].map((i) => write(`bl0${i}`, 0.2 + i * 0.1)), write("rt0", 0.7)]),
    step("Sticks of 2, 3 and 6 units. The two shorter sticks together make only 5, which is less than 6, so they can never reach each other. No triangle is possible.", [...[0, 1, 2].map((i) => draw(`b1${i}`, 0.15 + i * 0.1)), ...[0, 1, 2].map((i) => write(`bl1${i}`, 0.2 + i * 0.1)), write("rt1", 0.7)]),
  ] };
}

export function circleParts(): Frag {
  const cx = 450, cy = 255, r = 150, p = (deg: number): [number, number] => [Math.round(cx + r * Math.cos((deg * Math.PI) / 180)), Math.round(cy - r * Math.sin((deg * Math.PI) / 180))];
  const d1 = p(180), d2 = p(0), rr = p(50), c1 = p(250), c2 = p(310);
  return { title: "Parts of a circle", objects: [T("ttl", 450, 44, "Parts of a circle", 34, "accent"), C("ci", cx, cy, r, undefined, "ink", 5), C("ce", cx, cy, 6, "#FF8A65", "warm", 3), T("lo", cx - 18, cy + 28, "O", 26, "ink"), L("rad", cx, cy, ...rr, "accent", 5), T("lr", 560, 150, "radius", 24, "accent"), L("dia", ...d1, ...d2, "good", 5), T("ld", 360, 255 - 12, "diameter", 24, "good", "middle"), L("chd", ...c1, ...c2, "warm", 5), T("lch", 450, 450, "chord", 24, "warm")], steps: [
    step("A circle is the set of all points at the same distance from a fixed point, the centre. Here the centre is O.", [draw("ci", 0.2, undefined, 1500), draw("ce", 0.6), write("lo", 0.7)]),
    step("The radius is a line from the centre to a point on the circle. All radii of a circle are equal.", [draw("rad", 0.2), write("lr", 0.5)]),
    step("The diameter is a line across the circle through the centre. It is twice the radius.", [draw("dia", 0.2), write("ld", 0.5)]),
    step("A chord joins any two points on the circle. The diameter is the longest chord.", [draw("chd", 0.2), write("lch", 0.5)]),
  ] };
}

export function perpBisector(): Frag {
  return { title: "Perpendicular bisector", objects: [T("ttl", 450, 44, "Points equidistant from A and B", 30, "accent"), L("ab", 220, 340, 680, 340, "ink", 5), T("la", 200, 372, "A", 26, "ink"), T("lb", 700, 372, "B", 26, "ink"), C("m", 450, 340, 7, "#FF8A65", "warm", 3), L("pb", 450, 110, 450, 450, "accent", 4), PA("rt", "M 450 320 L 470 320 L 470 340", "accent", 3), C("pp", 450, 180, 8, "#FF8A65", "accent", 3), T("lp", 480, 175, "P", 26, "accent", "start"), L("pa", 450, 180, 220, 340, "warm", 3), L("pb2", 450, 180, 680, 340, "warm", 3), T("eq", 450, 470, "PA = PB", 30, "good")], steps: [
    step("Here is a line segment AB. Its midpoint is the point exactly halfway between A and B.", [draw("ab", 0.2), write("la", 0.4), write("lb", 0.45), draw("m", 0.6)]),
    step("A line through the midpoint, at a right angle to AB, is the perpendicular bisector of AB. It cuts AB into two equal halves.", [draw("pb", 0.2, undefined, 1200), draw("rt", 0.7)]),
    step("Pick any point P on this line. Its distance to A is the same as its distance to B. Every point on the perpendicular bisector is equidistant from A and B.", [draw("pp", 0.1), write("lp", 0.2), draw("pa", 0.35), draw("pb2", 0.5), write("eq", 0.7)]),
  ] };
}

export function triangleArea(): Frag {
  return { title: "Area of a triangle", objects: [T("ttl", 450, 44, "Area of a triangle", 34, "accent"), PO("tr", [[220, 370], [680, 370], [440, 130]], "#FFE0B2", "warm", 5), L("h", 440, 130, 440, 370, "accent", 4), T("lh", 400, 255, "h", 28, "accent"), T("lb", 450, 410, "base b", 26, "ink"), T("f", 450, 455, "Area = ½ × base × height", 30, "good"), T("ex", 790, 250, "b = 8 cm", 22, "ink"), T("ex2", 790, 285, "h = 5 cm", 22, "ink"), T("ex3", 790, 330, "area = 20 cm²", 22, "good")], steps: [
    step("This triangle has a base, and a height. The height is measured straight up from the base to the top corner, at a right angle.", [draw("tr", 0.2, undefined, 1200), write("lb", 0.6), draw("h", 0.7), write("lh", 0.85)]),
    step("A triangle is half of a rectangle with the same base and height. So its area is half of base times height.", [write("f", 0.4)]),
    step("For example, a base of 8 centimetres and a height of 5 centimetres give half of 8 times 5. That is 20 square centimetres.", [write("ex", 0.15), write("ex2", 0.3), write("ex3", 0.6)]),
  ] };
}

export function distanceTime(): Frag {
  return { title: "Distance-time graph", objects: [T("ttl", 450, 44, "A distance-time graph", 34, "accent"), AR("ya", 150, 420, 150, 90, "ink", 4), AR("xa", 150, 420, 800, 420, "ink", 4), T("yl", 90, 100, "Distance", 22, "ink"), T("xl", 790, 455, "Time", 22, "ink"), L("fast", 150, 420, 400, 150, "accent", 6), T("lf", 300, 190, "fast: steep line", 22, "accent", "end"), L("slow", 150, 420, 650, 290, "good", 6), T("ls", 690, 280, "slow: gentle line", 22, "good", "start"), L("rest", 400, 150, 700, 150, "warm", 6), T("lr", 720, 140, "stopped: flat line", 22, "warm", "start")], steps: [
    step("A distance-time graph shows how far something has gone as time passes. Time is along the bottom and distance is up the side.", [show("ttl", 0.05), draw("ya", 0.3), draw("xa", 0.4), write("yl", 0.6), write("xl", 0.7)]),
    step("A straight sloping line means the object covers equal distances in equal times, so it moves at a steady speed. A steeper line means a faster speed.", [draw("fast", 0.2), write("lf", 0.5), draw("slow", 0.6), write("ls", 0.8)]),
    step("A flat line means the distance does not change while time passes, so the object is at rest.", [draw("rest", 0.2), write("lr", 0.5)]),
  ] };
}

export function simpleInterest(): Frag {
  return { title: "Simple interest", objects: [T("ttl", 450, 44, "Simple interest", 34, "accent"), T("f", 450, 130, "I = P × R × T ÷ 100", 44, "accent"), T("p", 450, 190, "P = principal, the money borrowed or saved", 24, "ink"), T("r", 450, 228, "R = rate of interest per year, in per cent", 24, "ink"), T("t", 450, 266, "T = time in years", 24, "ink"), T("ex", 450, 335, "P = ₹1000, R = 5%, T = 2 years", 28, "ink"), T("i", 450, 385, "I = 1000 × 5 × 2 ÷ 100 = ₹100", 30, "good"), T("a", 450, 435, "Amount = 1000 + 100 = ₹1100", 28, "warm")], steps: [
    step("When we save or borrow money, the extra money paid for using it is called interest. Simple interest is worked out on the original sum every year.", [show("ttl", 0.05), write("f", 0.6)]),
    step("P is the principal, the money saved or borrowed. R is the rate, the interest for every hundred rupees in a year. T is the time in years.", [write("p", 0.2), write("r", 0.5), write("t", 0.8)]),
    step("For example, a principal of 1000 rupees at 5 per cent for 2 years. Interest is 1000 times 5 times 2, divided by 100, which is 100 rupees.", [write("ex", 0.2), write("i", 0.6)]),
    step("The amount to be paid back is the principal plus the interest: 1100 rupees.", [write("a", 0.4)]),
  ] };
}

export function lakhsCrores(): Frag {
  return tbl("Lakhs and crores", [{ a: "1,000", b: "one thousand" }, { a: "1,00,000", b: "one lakh = 100 thousand" }, { a: "1,00,00,000", b: "one crore = 100 lakh" }, { a: "10,00,000", b: "ten lakh = one million" }], ["Number", "In words"],
    "In India we write large numbers with commas in a special way: after the thousands, a comma comes after every two digits.", [
      "One thousand is written 1,000.", "One lakh is 1,00,000. It is a hundred thousand.", "One crore is 1,00,00,000. It is a hundred lakh.", "Ten lakh is 10,00,000, and that is the same as one million.",
    ]);
}

export function evenOddSums(): Frag {
  return tbl("Even and odd sums", [{ a: "even + even", b: "even", c: "4 + 6 = 10" }, { a: "odd + odd", b: "even", c: "3 + 5 = 8" }, { a: "even + odd", b: "odd", c: "4 + 3 = 7" }], ["Add", "Answer is", "Example"],
    "Even numbers are 2, 4, 6 and so on. Odd numbers are 1, 3, 5 and so on. What happens when we add them?", [
      "An even number plus an even number is always even. For example, 4 plus 6 is 10.", "An odd number plus an odd number is also even. For example, 3 plus 5 is 8.", "An even number plus an odd number is odd. For example, 4 plus 3 is 7.",
    ], "These patterns hold for every pair of whole numbers.");
}

export function collatz(): Frag {
  const seq = [6, 3, 10, 5, 16, 8, 4, 2, 1], objs: O[] = [T("ttl", 450, 44, "The Collatz sequence from 6", 32, "accent")];
  seq.forEach((v, i) => { const x = 90 + (i % 5) * 180, y = i < 5 ? 190 : 330; objs.push(C(`b${i}`, x, y, 38, v === 1 ? "#C8E6C9" : "#FFF3D6", "warm", 3), T(`t${i}`, x, y + 10, String(v), 28, "ink")); if (i < seq.length - 1 && i !== 4) objs.push(AR(`a${i}`, x + 42, y, x + 138, y, "accent", 4)); });
  objs.push(T("rule", 450, 440, "Even: halve it.   Odd: multiply by 3 and add 1.", 26, "good"));
  return { title: "Collatz sequence", objects: objs, steps: [
    step("Here is a number puzzle. Start with any whole number. If it is even, halve it. If it is odd, multiply it by 3 and add 1. Then repeat.", [show("ttl", 0.05), write("rule", 0.6)]),
    step("Start with 6. It is even, so half of it is 3. Then 3 is odd, so 3 times 3 plus 1 is 10. Half of 10 is 5, and 5 times 3 plus 1 is 16.", seq.slice(0, 5).flatMap((_, i) => [draw(`b${i}`, spread(5, i, 0.1, 0.85)), write(`t${i}`, spread(5, i, 0.12, 0.87)), ...(i < 4 ? [draw(`a${i}`, spread(5, i, 0.13, 0.88))] : [])])),
    step("Half of 16 is 8, then 4, then 2, then 1. Every starting number that people have tried ends at 1, but nobody has proved that it always does.", seq.slice(5).flatMap((_, i) => [draw(`b${i + 5}`, spread(4, i, 0.1, 0.85)), write(`t${i + 5}`, spread(4, i, 0.12, 0.87)), ...(i < 3 ? [draw(`a${i + 5}`, spread(4, i, 0.13, 0.88))] : [])])),
  ] };
}

export function quadProps(): Frag {
  return notedGrid("Squares and rectangles", [
    { e: "🟦", label: "Square", tag: "4 equal sides, 4 right angles", note: "A square has four equal sides and four right angles. Its diagonals are equal and cross each other at a right angle." },
    { e: "▭", label: "Rectangle", tag: "opposite sides equal, 4 right angles", note: "A rectangle has opposite sides equal and four right angles. Its two diagonals are equal in length." },
  ], "Let us see what makes a square and a rectangle special before we construct them.", "To construct either one, we use these properties: the right angles and the equal sides.");
}

export function rotationalSymmetry(): Frag {
  const items: [number, string, string][] = [[3, "Equilateral triangle", "looks the same 3 times in a full turn"], [4, "Square", "looks the same 4 times in a full turn"]], objs: O[] = [T("ttl", 450, 44, "Rotational symmetry", 34, "accent")];
  items.forEach(([n, nm, d], i) => { const x = 250 + i * 400; objs.push(PO(`p${i}`, regPoly(x, 220, 85, n, n === 4 ? -135 : -90), "#FFE0B2", "warm", 5), C(`c${i}`, x, 220, 6, "#FF8A65", "accent", 3), T(`n${i}`, x, 350, nm, 26, "ink"), T(`d${i}`, x, 390, d, 20, "warm"), T(`o${i}`, x, 430, `order ${n}`, 24, "good")); });
  return { title: "Rotational symmetry", objects: objs, steps: [
    step("A figure has rotational symmetry if it looks exactly the same after being turned about a point, the centre, by less than a full turn.", [show("ttl", 0.05)]),
    step("An equilateral triangle turned by 120 degrees fits on itself. In one full turn it looks the same 3 times, so its order of rotational symmetry is 3.", [draw("p0", 0.15), draw("c0", 0.35), write("n0", 0.45), write("d0", 0.6), write("o0", 0.75)]),
    step("A square turned by 90 degrees fits on itself. In a full turn it looks the same 4 times, so its order is 4.", [draw("p1", 0.15), draw("c1", 0.35), write("n1", 0.45), write("d1", 0.6), write("o1", 0.75)]),
  ] };
}

export function skipCount(ns: number[]): Frag {
  const objs: O[] = [T("ttl", 450, 44, ns.length > 1 ? `Tables of ${ns.join(" and ")}` : `The table of ${ns[0]}`, 34, "accent")];
  ns.forEach((n, k) => { const x = ns.length > 1 ? 250 + k * 400 : 450; for (let i = 1; i <= 10; i++) objs.push(T(`t${k}${i}`, x, 70 + i * 38, `${n} × ${i} = ${n * i}`, 24, i % 5 === 0 ? "good" : "ink")); });
  const one = ns.length === 1, n0 = ns[0]!;
  const half = (k: number, a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => write(`t${k}${a + i}`, spread(b - a + 1, i, 0.1, 0.9)));
  return { title: "Multiplication tables", objects: objs, steps: [
    step(one ? `Let us build the table of ${n0}. Each line adds ${n0} more to the one before.` : `Let us build the tables of ${ns.join(" and ")}. Each line adds the number once more.`, [show("ttl", 0.05)]),
    step(one ? `${n0} times 1 is ${n0}, and then we keep adding ${n0}: ${[1, 2, 3, 4, 5].map((i) => n0 * i).join(", ")}.` : `Count the first five lines of each table.`, ns.flatMap((_, k) => half(k, 1, 5))),
    step(one ? `And on to ${n0} times 10, which is ${n0 * 10}.` : `Then the next five lines, up to ten times.`, ns.flatMap((_, k) => half(k, 6, 10))),
    ...(one && n0 === 15 ? [step("A quick way: 15 is 10 plus 5, so 15 times a number is 10 times it plus 5 times it. For 15 times 4, that is 40 plus 20, which is 60.", [pulse("t04", 0.3, undefined, "accent")])] : ns.includes(5) && ns.includes(10) ? [step("Notice that the table of 10 always ends in 0, and the table of 5 ends in 0 or 5.", [pulse("t05", 0.2, undefined, "accent"), pulse("t110", 0.4, undefined, "accent")])] : []),
  ] };
}

export function orderNumbers(): Frag {
  const a = [47, 12, 85, 31], s = [...a].sort((x, y) => x - y), objs: O[] = [T("ttl", 450, 44, "Ordering numbers", 34, "accent"), T("l1", 450, 130, "Smallest to biggest: ascending", 26, "accent"), T("l2", 450, 300, "Biggest to smallest: descending", 26, "warm")];
  s.forEach((v, i) => objs.push(R(`u${i}`, 120 + i * 180, 160, 130, 80, "#C8E6C9", "good", 3, 12), T(`ut${i}`, 185 + i * 180, 213, String(v), 38, "ink"), R(`d${i}`, 120 + i * 180, 330, 130, 80, "#FFE0B2", "warm", 3, 12), T(`dt${i}`, 185 + i * 180, 383, String([...s].reverse()[i]), 38, "ink")));
  return { title: "Ordering numbers", objects: objs, steps: [
    step("Look at these four numbers: 47, 12, 85 and 31. We can put them in order.", [show("ttl", 0.05)]),
    step("Ascending order goes from the smallest to the biggest: 12, 31, 47, 85.", [write("l1", 0.1), ...s.flatMap((_, i) => [draw(`u${i}`, spread(4, i, 0.25, 0.85)), write(`ut${i}`, spread(4, i, 0.27, 0.87))])]),
    step("Descending order goes from the biggest to the smallest: 85, 47, 31, 12.", [write("l2", 0.1), ...s.flatMap((_, i) => [draw(`d${i}`, spread(4, i, 0.25, 0.85)), write(`dt${i}`, spread(4, i, 0.27, 0.87))])]),
  ] };
}

export function weekDays(): Frag {
  const d = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], objs: O[] = [T("ttl", 450, 44, "Days of the week", 34, "accent")];
  d.forEach((x, i) => objs.push(R(`c${i}`, 25 + i * 125, 130, 115, 100, i === 0 ? "#FFCDD2" : "#FFF3D6", "warm", 3, 12), T(`t${i}`, 82 + i * 125, 190, x, x.length > 7 ? 19 : 22, "ink")));
  objs.push(T("m1", 450, 310, "12 months: January, February, March, April, May, June,", 22, "ink"), T("m2", 450, 345, "July, August, September, October, November, December", 22, "ink"), T("n", 450, 425, "7 days make a week. 12 months make a year.", 28, "good"));
  return { title: "Days and months", objects: objs, steps: [
    step("There are seven days in a week. Look at them in order.", [show("ttl", 0.05), ...d.flatMap((_, i) => [draw(`c${i}`, spread(7, i, 0.2, 0.9)), write(`t${i}`, spread(7, i, 0.22, 0.92))])]),
    step("A year has twelve months. Here they are in order, from January to December.", [write("m1", 0.3), write("m2", 0.6)]),
    step("Remember: seven days make a week, and twelve months make a year.", [write("n", 0.3)]),
  ] };
}

export function punctuation(kind: "capital" | "comma"): Frag {
  const D = kind === "capital"
    ? { title: "Capital letters and full stops", a: "my friend ravi plays cricket", b: "My friend Ravi plays cricket.", i: "A sentence begins with a capital letter and ends with a full stop. Look at this sentence. It has neither.", n1: "We start the sentence with a capital letter. Names of people and places also begin with capital letters.", n2: "At the end of a telling sentence we put a full stop." }
    : { title: "Commas", a: "I bought apples bananas and mangoes.", b: "I bought apples, bananas and mangoes.", i: "A comma is a small pause mark. We use it to separate the things in a list. Look at this sentence.", n1: "We put a comma after each thing in the list, except before the word and.", n2: "Now the sentence is easy to read, because the commas show where each item ends." };
  return { title: D.title, objects: [T("ttl", 450, 44, D.title, 34, "accent"), T("a", 450, 170, D.a, 30, "accent"), T("b", 450, 300, D.b, 34, "good"), T("ar", 450, 235, "↓", 40, "ink")], steps: [
    step(D.i, [show("ttl", 0.05), write("a", 0.6)]), step(D.n1, [write("ar", 0.2), write("b", 0.5)]), step(D.n2, [pulse("b", 0.3, undefined, "good")]),
  ] };
}

// ---------------------------------------------------------------- english
export function tenses(): Frag {
  const rows = [{ a: "Simple", b: "plays", c: "played" }, { a: "Continuous", b: "is playing", c: "was playing" }, { a: "Perfect", b: "has played", c: "had played" }];
  const f = tbl("Tenses", rows.map((r) => ({ a: r.a, b: r.b, c: r.c })), ["Kind", "Present", "Past"], "A tense tells us when something happens. Here are three kinds of tense, shown with the verb play.", [
    "The simple tense tells of a habit or a fact: she plays, she played.", "The continuous tense tells of something going on: she is playing, she was playing.", "The perfect tense tells of something finished: she has played, she had played.",
  ], "For the future, we use will: she will play, she will be playing, she will have played.");
  return f;
}

export function passiveVoice(): Frag {
  return { title: "Active and passive voice", objects: [T("ttl", 450, 44, "Active and passive voice", 34, "accent"), R("b1", 100, 120, 700, 80, "#E3F2FD", "accent", 4, 14), T("a", 450, 172, "The cat chased the mouse.", 34, "ink"), T("l1", 450, 235, "Active: the doer comes first", 22, "accent"), AR("ar", 450, 255, 450, 305, "warm", 6), R("b2", 100, 320, 700, 80, "#FFF3D6", "warm", 4, 14), T("p", 450, 372, "The mouse was chased by the cat.", 34, "ink"), T("l2", 450, 435, "Passive: the receiver of the action comes first", 22, "warm")], steps: [
    step("In an active sentence the doer of the action comes first. In 'The cat chased the mouse', the cat is the doer.", [show("ttl", 0.05), draw("b1", 0.3), write("a", 0.5), write("l1", 0.75)]),
    step("In a passive sentence, the one the action is done to comes first, and the doer follows after by.", [draw("ar", 0.15), draw("b2", 0.3), write("p", 0.5), write("l2", 0.75)]),
    step("The verb changes to a form of be with the past participle: was chased. The meaning stays the same.", [pulse("p", 0.3, undefined, "accent")]),
  ] };
}

export function clauses(): Frag {
  const rows = [{ a: "Simple", b: "The dog barked." }, { a: "Compound", b: "I like tea, but she likes coffee." }, { a: "Complex", b: "I stayed home because it was raining." }];
  return tbl("Kinds of sentences", rows, ["Kind", "Example"], "Sentences can be built in different ways, depending on how many clauses they have.", [
    "A simple sentence has one clause: one subject and one verb group.", "A compound sentence joins two equal clauses with a joining word such as and, but or or.", "A complex sentence has a main clause and a clause that depends on it, joined by a word such as because, when or if.",
  ]);
}

export function conjunctions(): Frag {
  return notedGrid("Joining words", [
    { e: "➕", label: "and", tag: "adds an idea", note: "And joins two ideas that go together: I like tea and biscuits." },
    { e: "↔️", label: "but", tag: "shows a difference", note: "But shows a difference: I wanted to go, but it rained." },
    { e: "🔀", label: "or", tag: "gives a choice", note: "Or gives a choice: Will you walk or take the bus?" },
    { e: "❓", label: "because", tag: "gives a reason", note: "Because gives a reason: I stayed home because I was ill." },
  ], "A conjunction is a word that joins words, phrases or sentences. Here are four common ones.");
}

export function letterFormat(formal: boolean): Frag {
  const parts: [string, string][] = formal
    ? [["Sender's address and date", "top right"], ["Receiver's address", "on the left"], ["Salutation: Dear Sir/Madam,", "greets the reader"], ["Subject line", "says what it is about"], ["Body", "the message, in paragraphs"], ["Yours faithfully, and signature", "closes the letter"]]
    : [["Your address and the date", "top right"], ["Salutation: Dear ...,", "greets your friend"], ["Body", "the message, in paragraphs"], ["Yours lovingly, and name", "closes the letter"]];
  const n = parts.length, h = Math.min(62, 370 / n - 8), objs: O[] = [T("ttl", 450, 44, formal ? "A formal letter" : "An informal letter", 34, "accent")];
  parts.forEach(([a, b], i) => objs.push(R(`r${i}`, 120, 90 + i * (h + 8), 660, h, "#FFF3D6", "warm", 3, 10), T(`a${i}`, 140, 90 + i * (h + 8) + h * 0.62, a, 22, "ink", "start"), T(`b${i}`, 770, 90 + i * (h + 8) + h * 0.62, b, 18, "warm", "end")));
  return { title: formal ? "A formal letter" : "An informal letter", objects: objs, steps: [
    step(formal ? "A formal letter is written to someone we do not know well, like a principal or an editor. It follows a fixed layout." : "An informal letter is written to a friend or a relative. It still follows a simple layout.", [show("ttl", 0.05)]),
    step(`Here are the parts, from top to bottom: ${parts.map((p) => p[0]).join("; ")}.`, parts.flatMap((_, i) => [draw(`r${i}`, spread(n, i, 0.05, 0.85)), write(`a${i}`, spread(n, i, 0.07, 0.87)), write(`b${i}`, spread(n, i, 0.09, 0.89))])),
    step(formal ? "Keep the language polite and to the point in a formal letter." : "In an informal letter, the language can be friendly and personal.", [pulse("r0", 0.2, undefined, "accent")]),
  ] };
}

export function paragraphParts(): Frag {
  return notedGrid("A good paragraph", [
    { e: "🔑", label: "Topic sentence", tag: "says the main idea", note: "A paragraph begins with a topic sentence that tells the main idea." },
    { e: "🧱", label: "Supporting sentences", tag: "give details and examples", note: "Supporting sentences come next. They give details, reasons or examples for the main idea." },
    { e: "🏁", label: "Closing sentence", tag: "wraps up the idea", note: "A closing sentence finishes the paragraph and brings the idea to an end." },
  ], "A paragraph is a group of sentences about one idea. It has three parts.");
}

// ---------------------------------------------------------------- science
export function breezes(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "Sea breeze and land breeze", 34, "accent"), R("sea", 40, 340, 400, 100, "#BBDEFB", "water", 3), R("land", 440, 340, 420, 100, "#D7CCC8", "earth", 3), T("ls", 240, 400, "sea", 26, "water"), T("ll", 650, 400, "land", 26, "earth"),
    C("sun", 780, 110, 40, "#FFEE58", "sun", 4), T("day", 450, 95, "Day", 30, "warm"),
    AR("d1", 330, 320, 560, 320, "water", 6), AR("d2", 650, 320, 650, 180, "accent", 6), T("dt1", 450, 300, "cooler air from the sea", 20, "water"), T("dt2", 720, 250, "warm air rises", 20, "accent", "start"),
    T("night", 450, 95, "Night", 30, "warm"), AR("n1", 560, 320, 330, 320, "earth", 6), AR("n2", 240, 320, 240, 180, "accent", 6), T("nt1", 450, 300, "cooler air from the land", 20, "earth"), T("nt2", 260, 250, "warm air rises", 20, "accent", "start")];
  return { title: "Sea breeze and land breeze", objects: objs, steps: [
    step("Land and sea are heated differently. Land warms up and cools down faster than water.", [show("ttl", 0.05), draw("sea", 0.3), draw("land", 0.4), write("ls", 0.6), write("ll", 0.7)]),
    step("In the day the land becomes hotter than the sea. The air over the land gets warm and rises. Cooler air from the sea moves in to take its place. This is the sea breeze.", [draw("sun", 0.1), write("day", 0.15), draw("d2", 0.3), write("dt2", 0.4), draw("d1", 0.55), write("dt1", 0.65)]),
    step("At night the land cools faster, and the sea stays warmer. Now the air over the sea rises, and cooler air from the land blows towards the sea. This is the land breeze.", [{ do: "hide", target: "sun", at: 0.05 }, { do: "hide", target: "day", at: 0.05 }, { do: "hide", target: "d1", at: 0.05 }, { do: "hide", target: "d2", at: 0.05 }, { do: "hide", target: "dt1", at: 0.05 }, { do: "hide", target: "dt2", at: 0.05 }, write("night", 0.15), draw("n2", 0.3), write("nt2", 0.4), draw("n1", 0.55), write("nt1", 0.65)]),
  ] };
}

export function tides(): Frag {
  return { title: "Tides", objects: [T("ttl", 450, 44, "Why the sea has tides", 34, "accent"), C("moon", 120, 250, 42, "#ECEFF1", "soft", 4), T("lm", 120, 320, "Moon", 24, "ink"), PA("wat", "M 520 130 C 640 150 680 250 640 270 C 680 300 640 380 520 400 C 400 380 360 300 400 270 C 360 250 400 150 520 130", "water", 4, "#BBDEFB"), C("earth", 520, 265, 95, "#C8E6C9", "good", 4), T("le", 520, 270, "Earth", 26, "ink"), T("h1", 640, 270, "high tide", 22, "water", "start"), T("h2", 330, 270, "high tide", 22, "water", "end"), T("lo", 520, 455, "low tide on the sides in between", 22, "ink")], steps: [
    step("The sea level rises and falls about twice a day. These movements are called tides.", [show("ttl", 0.05)]),
    step("The main cause is the pull of the Moon on the Earth's water. The water on the side facing the Moon is pulled up, making a high tide there.", [draw("moon", 0.1), write("lm", 0.2), draw("earth", 0.3), write("le", 0.35), draw("wat", 0.5), write("h2", 0.7)]),
    step("There is a second high tide on the opposite side of the Earth. The places in between have low tide. As the Earth turns, a place goes through two high tides and two low tides each day.", [write("h1", 0.2), write("lo", 0.5)]),
  ] };
}

export function pendulum(): Frag {
  return { title: "A simple pendulum", objects: [T("ttl", 450, 44, "A simple pendulum", 34, "accent"), L("sup", 300, 90, 600, 90, "ink", 8), L("rest", 450, 90, 450, 360, "soft", 3), L("left", 450, 90, 330, 345, "warm", 3), L("right", 450, 90, 570, 345, "warm", 3), C("bob", 450, 380, 24, "#FF8A65", "warm", 4), C("bl", 330, 365, 20, "#FFE0B2", "warm", 3), C("br", 570, 365, 20, "#FFE0B2", "warm", 3), T("a", 310, 410, "A", 24, "ink"), T("b", 590, 410, "B", 24, "ink"), T("m", 450, 430, "mean position", 20, "ink"), T("n", 450, 470, "One oscillation: A to B and back to A", 24, "good")], steps: [
    step("A simple pendulum is a small heavy ball, the bob, hanging from a fixed support by a thread.", [draw("sup", 0.2), draw("rest", 0.4), draw("bob", 0.6), write("m", 0.8)]),
    step("Pull the bob to one side, to A, and let go. It swings to the other side, B, and back again.", [draw("left", 0.15), draw("bl", 0.25), write("a", 0.3), draw("right", 0.55), draw("br", 0.65), write("b", 0.7)]),
    step("The to and fro motion from A to B and back to A is one oscillation. The time taken for one oscillation is the time period of the pendulum.", [write("n", 0.3), pulse("bob", 0.5, undefined, "accent")]),
  ] };
}

export function speedFormula(): Frag {
  return { title: "Speed, distance and time", objects: [T("ttl", 450, 44, "Speed, distance and time", 34, "accent"), T("f1", 450, 130, "speed = distance ÷ time", 38, "accent"), T("f2", 450, 185, "distance = speed × time", 30, "ink"), T("f3", 450, 235, "time = distance ÷ speed", 30, "ink"), T("ex", 450, 320, "A bus goes 60 km in 2 hours.", 28, "ink"), T("r", 450, 375, "speed = 60 ÷ 2 = 30 km per hour", 32, "good"), T("r2", 450, 425, "In 3 hours it goes 30 × 3 = 90 km", 26, "warm")], steps: [
    step("Speed tells us how much distance something covers in one unit of time. We find it by dividing the distance by the time.", [show("ttl", 0.05), write("f1", 0.6)]),
    step("From this we also get distance, which is speed times time, and time, which is distance divided by speed.", [write("f2", 0.3), write("f3", 0.7)]),
    step("A bus goes 60 kilometres in 2 hours. Its speed is 60 divided by 2, which is 30 kilometres per hour.", [write("ex", 0.2), write("r", 0.6)]),
    step("At the same speed, in 3 hours the bus covers 30 times 3, which is 90 kilometres.", [write("r2", 0.4)]),
  ] };
}

export function metalsTable(): Frag {
  return tbl("Metals and non-metals", [{ a: "Shine", b: "shiny (lustre)", c: "usually dull" }, { a: "Hammering", b: "can be beaten into sheets", c: "break easily (brittle)" }, { a: "Heat and electricity", b: "good conductors", c: "poor conductors" }], ["Property", "Metals", "Non-metals"],
    "Metals and non-metals have different properties. Here is how they usually compare.", [
      "Metals have a shiny surface, which we call lustre. Most non-metals look dull.", "Metals can be hammered into thin sheets, which is called being malleable. Solid non-metals are usually brittle and break into pieces.", "Metals are good conductors of heat and electricity. Non-metals are usually poor conductors.",
    ], "There are a few exceptions, but these are the general properties.");
}

export function microsteps(title: string, nodes: [string, string, string][], intro: string, outro: string): Frag {
  return chain(title, nodes.map(([e, label, sayIt]) => ({ e, label, say: sayIt })), intro, outro);
}

// ---------------------------------------------------------------- the rules that use them (see rules.ts RULES2)
void wrap; void AR;
