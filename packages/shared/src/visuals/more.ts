import { AR, C, draw, fill, L, PA, PO, pulse, R, SE, show, spread, step, T, write, type Frag, type O } from "./kit.js";

/** a set of labelled picture cards that appear one by one (continents, oceans, weather elements ...) */
export function iconGrid(title: string, items: { e: string; label: string }[], intro: string, outro: string): Frag {
  const n = items.length, per = n <= 4 ? n : Math.ceil(n / 2), objs: O[] = [T("ttl", 450, 44, title, 34, "accent")];
  items.forEach((it, i) => { const row = Math.floor(i / per), col = i % per, inRow = Math.min(per, n - row * per), gap = 800 / inRow, x = 50 + gap / 2 + col * gap, y = n <= 4 ? 250 : 170 + row * 190; objs.push(R(`c${i}`, x - 80, y - 70, 160, 150, "#FFF3D6", "warm", 3, 14), T(`e${i}`, x, y + 10, it.e, 62, "ink"), T(`l${i}`, x, y + 55, it.label, 22, "ink")); });
  return { title, objects: objs, steps: [step(intro, [show("ttl", 0.1)]), step(`Here they are, one by one: ${items.map((x) => x.label).join(", ")}.`, items.flatMap((_, i) => [draw(`c${i}`, spread(n, i, 0.1, 0.85)), show(`e${i}`, spread(n, i, 0.12, 0.87)), write(`l${i}`, spread(n, i, 0.15, 0.9))])), step(outro, [pulse("c0", 0.2, undefined, "good")])] };
}

/** a shape folded along a line of symmetry */
export function symmetry(): Frag {
  return { title: "Line of symmetry", objects: [T("ttl", 450, 44, "Line of symmetry", 34, "accent"), PO("lf", [[450, 110], [330, 190], [300, 300], [380, 400], [450, 430]], "#A5D6A7", "good", 5), PO("rt", [[450, 110], [570, 190], [600, 300], [520, 400], [450, 430]], "#C8E6C9", "good", 5), L("ax", 450, 90, 450, 450, "warm", 4), T("tx", 700, 260, "Both halves match", 30, "warm")], steps: [
    step("Look at this leaf. If we fold it down the middle, the two halves match exactly. That middle line is called a line of symmetry.", [draw("lf", 0.2), draw("rt", 0.45), draw("ax", 0.7)]),
    step("The left half is the mirror image of the right half. Every point on one side has a matching point on the other side, at the same distance from the line.", [pulse("lf", 0.2, undefined, "accent"), pulse("rt", 0.5, undefined, "accent")]),
    step("Many things around us are symmetrical, like butterflies, leaves and the letter A.", [write("tx", 0.3)]),
  ] };
}

/** a balance for comparing weights */
export function balanceScale(): Frag {
  return { title: "Weighing", objects: [T("ttl", 450, 44, "Weighing with a balance", 34, "accent"), PO("bs", [[450, 190], [400, 420], [500, 420]], "#BCAAA4", "earth", 4), L("bm", 220, 190, 680, 190, "ink", 8), R("p1", 170, 190, 110, 12, "#90CAF9", "water", 3, 4), R("p2", 620, 190, 110, 12, "#90CAF9", "water", 3, 4), T("w1", 225, 150, "🍎🍎", 50), T("w2", 675, 150, "1 kg", 36, "warm"), T("eq", 450, 470, "Equal weight: the balance stays level", 26, "good")], steps: [
    step("To find out how heavy something is, we weigh it. A balance has two pans on a beam.", [draw("bs", 0.2), draw("bm", 0.4), draw("p1", 0.6), draw("p2", 0.7)]),
    step("We put the object in one pan and a standard weight in the other. A kilogram weight is written 1 kg, and one kilogram is the same as one thousand grams.", [show("w1", 0.2), write("w2", 0.6)]),
    step("When both pans are level, the object weighs the same as the weight.", [write("eq", 0.3), pulse("bm", 0.3, undefined, "good")]),
  ] };
}

/** a measuring jug for capacity */
export function jug(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "Measuring capacity", 34, "accent"), R("jg", 330, 110, 140, 320, undefined, "ink", 6, 10), R("wt", 336, 240, 128, 184, "#90CAF9", "water", 2, 8)];
  [1, 2, 3, 4].forEach((i) => objs.push(L(`m${i}`, 470, 430 - i * 70, 500, 430 - i * 70, "ink", 3), T(`n${i}`, 530, 440 - i * 70, `${i * 250} mL`, 22, "ink", "start")));
  objs.push(T("res", 700, 240, "500 mL", 48, "good"), T("lt", 700, 320, "1000 mL = 1 L", 30, "accent"));
  return { title: "Capacity", objects: objs, steps: [
    step("The amount of liquid a container can hold is its capacity. We measure it with a measuring jug.", [draw("jg", 0.3), ...[1, 2, 3, 4].map((i) => show(`m${i}`, 0.5 + i * 0.1)), ...[1, 2, 3, 4].map((i) => write(`n${i}`, 0.5 + i * 0.1))]),
    step("Liquid is measured in millilitres, written mL, and in litres, written L. The water level shows how much we have. Here it is five hundred millilitres.", [fill("wt", "water", 0.2), write("res", undefined, "five hundred")]),
    step("One litre is the same as one thousand millilitres. So this jug holds half a litre of water.", [write("lt", 0.3)]),
  ] };
}

/** the sieve of Eratosthenes up to 30 */
export function primeSieve(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "Finding prime numbers", 34, "accent")], isP = (n: number) => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d);
  for (let n = 1; n <= 30; n++) { const c = (n - 1) % 10, r = Math.floor((n - 1) / 10), x = 130 + c * 74, y = 150 + r * 90; objs.push(C(`c${n}`, x, y, 30, isP(n) ? "#FFE082" : undefined, isP(n) ? "warm" : "soft", 3), T(`t${n}`, x, y + 10, `${n}`, 28, isP(n) ? "ink" : "soft")); }
  return { title: "Prime numbers", objects: objs, steps: [
    step("A prime number has exactly two factors: one and itself. Let us find the primes up to thirty by crossing out the others.", Array.from({ length: 30 }, (_, i) => show(`t${i + 1}`, spread(30, i, 0.2, 0.9))).concat(Array.from({ length: 30 }, (_, i) => draw(`c${i + 1}`, spread(30, i, 0.2, 0.9), undefined, 200)))),
    step("The number one is not prime. Two is prime, and it is the only even prime number. All the other even numbers have the factor two, so they are not prime.", [pulse("c2", 0.2, undefined, "warm"), ...[1, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30].map((n, i) => pulse(`c${n}`, spread(15, i, 0.4, 0.9), undefined, "soft"))]),
    step("The numbers left shining are the primes: 2, 3, 5, 7, 11, 13, 17, 19, 23 and 29.", [2, 3, 5, 7, 11, 13, 17, 19, 23, 29].map((n, i) => fill(`c${n}`, "sun", spread(10, i, 0.15, 0.85))).flat()),
  ] };
}

/** factors of 12 shown as rectangles */
export function factorsOf12(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "Factors of 12", 34, "accent")], dims: [number, number][] = [[1, 12], [2, 6], [3, 4]], y0 = [110, 190, 290];
  dims.forEach(([a, b], k) => { for (let r = 0; r < a; r++) for (let c = 0; c < b; c++) objs.push(R(`f${k}x${r}x${c}`, 100 + c * 40, y0[k]! + r * 36, 36, 32, ["#FFD166", "#7BE0AD", "#6EC6FF"][k], "ink", 2, 4)); objs.push(T(`q${k}`, 640, y0[k]! + 40, `${a} × ${b} = 12`, 34, "accent", "start")); });
  const grp = (k: number, a: number, b: number) => Array.from({ length: a * b }, (_, i) => show(`f${k}x${Math.floor(i / b)}x${i % b}`, spread(a * b, i, 0.1, 0.7)));
  return { title: "Factors", objects: objs, steps: [
    step("A factor of a number divides it exactly. We can find factors by arranging twelve squares in equal rows. One row of twelve gives one and twelve.", [...grp(0, 1, 12), write("q0", 0.8)]),
    step("Two rows of six give two and six. Three rows of four give three and four.", [...grp(1, 2, 6), write("q1", 0.45), ...grp(2, 3, 4).map((a) => ({ ...a, at: 0.5 + (a.at ?? 0) * 0.4 })), write("q2", 0.95)]),
    step("So the factors of twelve are 1, 2, 3, 4, 6 and 12.", [pulse("q0", 0.2), pulse("q1", 0.4), pulse("q2", 0.6)]),
  ] };
}

/** the three angles of a triangle add up to 180 degrees */
export function triangleAngles(): Frag {
  return { title: "Angles of a triangle", objects: [T("ttl", 450, 44, "Angle sum of a triangle", 34, "accent"), PO("tr", [[250, 380], [650, 380], [420, 130]], "#FFF3D6", "ink", 6), T("a", 295, 365, "a", 34, "warm"), T("b", 600, 365, "b", 34, "accent"), T("c", 420, 190, "c", 34, "good"), T("sm", 450, 450, "a + b + c = 180°", 50, "accent")], steps: [
    step("A triangle has three angles. Let us call them a, b and c.", [draw("tr", 0.3), write("a", 0.5), write("b", 0.6), write("c", 0.7)]),
    step("If you cut out the three corners and put them side by side, they make a straight line. A straight line is one hundred and eighty degrees.", [pulse("a", 0.2, undefined, "warm"), pulse("b", 0.4, undefined, "accent"), pulse("c", 0.6, undefined, "good")]),
    step("So in every triangle, the three angles always add up to one hundred and eighty degrees.", [write("sm", 0.2)]),
  ] };
}

/** an equation as a balance: do the same to both sides */
export function equationBalance(): Frag {
  return { title: "Equations", objects: [T("ttl", 450, 44, "Solving an equation", 34, "accent"), L("bm", 150, 230, 750, 230, "ink", 8), PO("bs", [[450, 230], [405, 400], [495, 400]], "#BCAAA4", "earth", 4), T("l1", 270, 200, "x + 3", 56, "warm"), T("r1", 630, 200, "8", 56, "good"), T("l2", 270, 200, "x", 56, "warm"), T("r2", 630, 200, "5", 56, "good"), T("m3", 450, 120, "take away 3 from both sides", 26, "accent"), T("ans", 450, 450, "x = 5", 64, "accent")], steps: [
    step("An equation is like a balance. Both sides weigh the same. Here x plus three balances with eight.", [draw("bm", 0.2), draw("bs", 0.3), write("l1", 0.5), write("r1", 0.6)]),
    step("To find x, we do the same thing to both sides so that the balance stays level. Take away three from both sides.", [write("m3", 0.2), { do: "hide", target: "l1", at: 0.5 }, { do: "hide", target: "r1", at: 0.5 }, write("l2", 0.6), write("r2", 0.65)]),
    step("Now x is alone. So x is five. Check: five plus three is eight.", [write("ans", 0.2)]),
  ] };
}

/** matchstick squares: a rule with a variable */
export function matchstick(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "Patterns and variables", 34, "accent")];
  for (let k = 0; k < 3; k++) { const x0 = 90 + k * 270 - (k === 2 ? 0 : 0); for (let s = 0; s <= k; s++) objs.push(R(`sq${k}x${s}`, x0 + s * 56, 180, 56, 56, undefined, "warm", 5, 0)); objs.push(T(`ct${k}`, x0 + ((k + 1) * 56) / 2, 290, `${k + 1} square${k ? "s" : ""}: ${3 * (k + 1) + 1} sticks`, 22, "ink")); }
  objs.push(T("rl", 450, 380, "sticks = 3 × n + 1", 52, "accent"), T("nn", 450, 440, "n is the number of squares", 26, "soft"));
  return { title: "Variables", objects: objs, steps: [
    step("Make squares in a row with matchsticks. One square needs four sticks.", [0, 1, 2].flatMap((k) => Array.from({ length: k + 1 }, (_, s) => draw(`sq${k}x${s}`, spread(6, k * 2 + s, 0.1, 0.8)))).concat([0, 1, 2].map((k) => write(`ct${k}`, 0.5 + k * 0.15)))),
    step("Each extra square adds only three more sticks, because it shares one side. So the number of sticks is three times the number of squares, plus one.", [write("rl", 0.5)]),
    step("The letter n stands for any number of squares. A letter that can take different values is called a variable. With a variable, one rule covers every case.", [write("nn", 0.3), pulse("rl", 0.5)]),
  ] };
}

/** a line graph */
export function lineGraph(): Frag {
  const v = [20, 24, 30, 28, 22], objs: O[] = [T("ttl", 450, 44, "A line graph", 34, "accent"), L("ax", 120, 400, 780, 400, "ink", 5), L("ay", 120, 400, 120, 110, "ink", 5), T("yl", 70, 120, "°C", 22, "soft")];
  v.forEach((t, i) => { const x = 200 + i * 130, y = 400 - (t - 15) * 18; objs.push(C(`p${i}`, x, y, 9, "#FF8A65", "warm", 3), T(`x${i}`, x, 435, ["Mon", "Tue", "Wed", "Thu", "Fri"][i]!, 22, "ink")); if (i) objs.push(L(`s${i}`, 200 + (i - 1) * 130, 400 - (v[i - 1]! - 15) * 18, x, y, "accent", 5)); });
  return { title: "Line graph", objects: objs, steps: [
    step("A line graph shows how something changes over time. Here we record the temperature on five days.", [draw("ax", 0.3), draw("ay", 0.5), ...v.map((_, i) => write(`x${i}`, spread(5, i, 0.5, 0.9)))]),
    step("We put a dot for each day's value and join the dots with a line.", v.flatMap((_, i) => [show(`p${i}`, spread(5, i, 0.1, 0.8)), ...(i ? [draw(`s${i}`, spread(5, i, 0.15, 0.85))] : [])])),
    step("When the line goes up, the value is rising. When it goes down, it is falling. The highest point is on Wednesday.", [pulse("p2", 0.3, undefined, "good")]),
  ] };
}

/** the mean as levelling out */
export function meanLevel(): Frag {
  const v = [2, 6, 4], objs: O[] = [T("ttl", 450, 44, "The mean (average)", 34, "accent"), L("gl", 120, 400, 780, 400, "ink", 5)];
  v.forEach((h, i) => { objs.push(R(`b${i}`, 190 + i * 200, 400 - h * 40, 120, h * 40, ["#FFD166", "#FF8A65", "#7BE0AD"][i], "ink", 3, 4), R(`m${i}`, 190 + i * 200, 400 - 4 * 40, 120, 4 * 40, undefined, "good", 4, 4)); });
  objs.push(L("av", 140, 240, 760, 240, "good", 4), T("mn", 450, 450, "(2 + 6 + 4) ÷ 3 = 4", 40, "accent"));
  return { title: "Mean", objects: objs, steps: [
    step("Here are three towers of blocks, with two, six and four blocks.", v.map((_, i) => draw(`b${i}`, spread(3, i, 0.2, 0.8)))),
    step("To find the mean, we move blocks from the taller towers to the shorter ones until all towers are equally tall. Add them all up and share equally.", [draw("av", 0.2), ...v.map((_, i) => draw(`m${i}`, spread(3, i, 0.3, 0.8)))]),
    step("Each tower now has four blocks. So the mean of two, six and four is four.", [write("mn", 0.3)]),
  ] };
}

/** two triangles that match exactly */
export function congruent(): Frag {
  return { title: "Congruent shapes", objects: [T("ttl", 450, 44, "Congruent shapes", 34, "accent"), PO("t1", [[150, 380], [380, 380], [300, 190]], "#BBDEFB", "water", 5), PO("t2", [[520, 380], [750, 380], [670, 190]], "#BBDEFB", "accent", 5), T("eq", 450, 450, "Same shape and same size", 34, "good")], steps: [
    step("Look at these two triangles.", [draw("t1", 0.3), draw("t2", 0.6)]),
    step("If we could pick one up and place it on the other, it would fit exactly, with every side and every angle matching. We say the shapes are congruent.", [pulse("t1", 0.3, undefined, "good"), pulse("t2", 0.5, undefined, "good")]),
    step("Congruent shapes have the same shape and the same size.", [write("eq", 0.3)]),
  ] };
}

/** two parallel lines cut by a transversal */
export function transversal(): Frag {
  return { title: "Transversal", objects: [T("ttl", 450, 44, "Parallel lines and a transversal", 32, "accent"), L("p1", 120, 200, 780, 200, "ink", 6), L("p2", 120, 360, 780, 360, "ink", 6), L("tv", 300, 100, 600, 460, "warm", 6), SE("a1", 345, 200, 50, 90, 140, "#FFE082", "accent", 2), SE("a2", 480, 360, 50, 90, 140, "#FFE082", "accent", 2), T("t1", 395, 245, "x", 30, "ink"), T("t2", 530, 405, "x", 30, "ink"), T("em", 130, 450, "Equal corresponding angles", 28, "good", "start")], steps: [
    step("Two lines that never meet, however far we draw them, are parallel lines.", [draw("p1", 0.3), draw("p2", 0.5)]),
    step("A line that crosses both of them is called a transversal.", [draw("tv", 0.3)]),
    step("It makes angles at both crossings. The angles in the same position at the two crossings, called corresponding angles, are equal when the lines are parallel.", [draw("a1", 0.1), draw("a2", 0.3), write("t1", 0.5), write("t2", 0.6), write("em", 0.8)]),
  ] };
}

/** a 3D solid with its faces, edges and corners */
export function solidFaces(shape: "cube" | "cuboid" | "pyramid" | "cylinder" | "cone" | "sphere" = "cube"): Frag {
  const info: Record<string, [string, string, string]> = { cube: ["6", "12", "8"], cuboid: ["6", "12", "8"], pyramid: ["5", "8", "5"], cylinder: ["3", "2", "0"], cone: ["2", "1", "1"], sphere: ["1", "0", "0"] };
  const [f, e, c] = info[shape]!;
  const nm = shape === "pyramid" ? "square pyramid" : shape;
  return { title: `A ${nm}`, objects: [T("ttl", 450, 44, `A ${nm}`, 34, "accent"), { kind: "solid", id: "so", shape, x: 330, y: 290, size: 220, color: "accent" }, T("f", 700, 200, `${f} faces`, 38, "warm", "middle"), T("e", 700, 280, `${e} edges`, 38, "good"), T("c", 700, 360, `${c} corners`, 38, "accent")], steps: [
    step(`This is a ${nm}. It is a solid shape, so we can hold it. Drag the board to turn it round.`, [show("so", 0.2), { do: "spin", target: "so", at: 0.5, rate: 30 }]),
    step(`The flat or curved surfaces are its faces. A ${nm} has ${f} ${f === "1" ? "face" : "faces"}.`, [{ do: "mark", target: "so", at: 0.1, mode: "faces" }, write("f", 0.5)]),
    step(`Edges are where two faces meet, and corners are where edges meet. It has ${e} edges and ${c} corners.`, [{ do: "mark", target: "so", at: 0.1, mode: "edges" }, write("e", 0.3), { do: "mark", target: "so", at: 0.6, mode: "corners" }, write("c", 0.65)]),
  ] };
}

/** rounding to the nearest ten on a number line */
export function rounding(n = 47): Frag {
  const a = Math.floor(n / 10) * 10, b = a + 10, objs: O[] = [T("ttl", 450, 44, "Rounding to the nearest ten", 34, "accent"), L("ln", 100, 300, 800, 300, "ink", 5), T("la", 100, 350, `${a}`, 36, "warm"), T("lb", 800, 350, `${b}`, 36, "good"), L("ka", 100, 285, 100, 315, "ink", 4), L("kb", 800, 285, 800, 315, "ink", 4), L("km", 450, 288, 450, 312, "soft", 3), T("tm", 450, 350, `${a + 5}`, 28, "soft")];
  const x = 100 + ((n - a) / 10) * 700;
  objs.push(C("dt", x, 300, 14, "#FF8A65", "warm", 3), T("dn", x, 255, `${n}`, 38, "accent"), AR("hp", x, 280, b === 0 ? 800 : 780, 280, "good", 5), T("rs", 450, 440, `${n} is nearer to ${n - a >= 5 ? b : a}, so it rounds to ${n - a >= 5 ? b : a}`, 30, "good"));
  return { title: "Rounding", objects: objs, steps: [
    step(`To round a number to the nearest ten, we see which ten it is closest to. Look at ${n}. It lies between ${a} and ${b}.`, [draw("ln", 0.2), show("ka", 0.3), show("kb", 0.3), write("la", 0.4), write("lb", 0.5), show("dt", 0.7), write("dn", 0.75)]),
    step(`The middle point is ${a + 5}. A number that is ${a + 5} or more rounds up. A number below ${a + 5} rounds down.`, [draw("km", 0.2), write("tm", 0.3)]),
    step(`${n} is ${n - a >= 5 ? "past" : "before"} the middle, so it rounds ${n - a >= 5 ? "up" : "down"} to ${n - a >= 5 ? b : a}.`, [draw("hp", 0.1), write("rs", 0.4)]),
  ] };
}

/** litmus paper: acids and bases */
export function litmus(): Frag {
  return { title: "Acids and bases", objects: [T("ttl", 450, 44, "Testing with litmus paper", 34, "accent"), R("bl", 180, 150, 90, 150, "#64B5F6", "ink", 3, 4), T("bl2", 225, 330, "Blue litmus", 22, "ink"), R("rd", 630, 150, 90, 150, "#EF5350", "ink", 3, 4), T("rd2", 675, 330, "Red litmus", 22, "ink"), T("ac", 225, 400, "Acid: turns blue to red", 24, "warm"), T("bs", 675, 400, "Base: turns red to blue", 24, "accent"), R("tp", 405, 170, 90, 130, "#E57373", "ink", 3, 4), T("lm", 450, 330, "Blue litmus in lemon juice", 20, "ink")], steps: [
    step("How can we tell an acid from a base? We use an indicator, such as litmus paper. Litmus paper is red or blue.", [draw("bl", 0.2), write("bl2", 0.3), draw("rd", 0.5), write("rd2", 0.6)]),
    step("An acid, like lemon juice, turns blue litmus red.", [draw("tp", 0.3), write("lm", 0.4), write("ac", 0.7)]),
    step("A base, like soap solution, turns red litmus blue. Never taste or touch unknown liquids to test them.", [write("bs", 0.3)]),
  ] };
}

/** conduction, convection and radiation */
export function heatTransfer(): Frag {
  return { title: "How heat travels", objects: [T("ttl", 450, 44, "Three ways heat travels", 34, "accent"), R("sp", 60, 200, 230, 24, "#B0BEC5", "ink", 3, 12), T("fl", 40, 215, "🔥", 50), AR("ar1", 100, 160, 260, 160, "warm", 6), T("t1", 175, 320, "Conduction", 28, "warm"), T("t1b", 175, 355, "through solids", 20, "soft"),
    R("pot", 340, 220, 200, 120, "#B3E5FC", "water", 4, 12), AR("cv1", 380, 330, 380, 240, "warm", 5), AR("cv2", 500, 240, 500, 330, "water", 5), T("t2", 440, 400, "Convection", 28, "accent"), T("t2b", 440, 435, "in liquids and gases", 20, "soft"),
    T("sn", 750, 130, "☀️", 90), AR("rd1", 710, 190, 650, 300, "sun", 5), AR("rd2", 760, 190, 760, 300, "sun", 5), T("t3", 740, 400, "Radiation", 28, "good"), T("t3b", 740, 435, "through empty space", 20, "soft")], steps: [
    step("Heat always moves from a hotter place to a colder place. It can travel in three ways. In conduction, heat passes along a solid, like a metal spoon in hot tea, from the hot end to the cold end.", [show("fl", 0.1), draw("sp", 0.2), draw("ar1", 0.4), write("t1", 0.6), write("t1b", 0.7)]),
    step("In convection, a liquid or gas carries the heat. Hot water rises, cooler water sinks, and the water goes round and round.", [draw("pot", 0.2), draw("cv1", 0.4), draw("cv2", 0.5), write("t2", 0.6), write("t2b", 0.7)]),
    step("In radiation, heat travels as rays, even through empty space. This is how the Sun's heat reaches the Earth.", [show("sn", 0.1), draw("rd1", 0.3), draw("rd2", 0.4), write("t3", 0.6), write("t3b", 0.7)]),
  ] };
}

/** speed: a car at equal distances in equal times */
export function speedCars(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "Speed", 34, "accent"), L("rd", 80, 300, 820, 300, "ink", 6)];
  [0, 1, 2, 3].forEach((i) => objs.push(T(`c${i}`, 130 + i * 210, 280, "🚗", 64), L(`k${i}`, 130 + i * 210, 305, 130 + i * 210, 325, "ink", 4), T(`d${i}`, 130 + i * 210, 365, `${i * 60} m`, 28, "accent"), T(`s${i}`, 130 + i * 210, 215, `${i} s`, 28, "warm")));
  objs.push(T("sp", 450, 450, "Speed = distance ÷ time = 60 m ÷ 1 s = 60 m/s", 28, "good"));
  return { title: "Speed", objects: objs, steps: [
    step("Speed tells us how fast something moves. A moving car covers some distance in some time.", [draw("rd", 0.3)]),
    step("Here the car is at the start, after one second it has gone sixty metres, after two seconds one hundred and twenty metres, and after three seconds one hundred and eighty metres.", [0, 1, 2, 3].flatMap((i) => [show(`c${i}`, spread(4, i, 0.05, 0.85)), draw(`k${i}`, spread(4, i, 0.05, 0.85)), write(`d${i}`, spread(4, i, 0.1, 0.9)), write(`s${i}`, spread(4, i, 0.1, 0.9))])),
    step("Speed is the distance divided by the time. Sixty metres in one second is a speed of sixty metres per second. This is an example with easy numbers.", [write("sp", 0.3)]),
  ] };
}

/** a thermometer */
export function thermometer(): Frag {
  return { title: "Thermometer", objects: [T("ttl", 450, 44, "Measuring temperature", 34, "accent"), R("tb", 410, 100, 40, 280, undefined, "ink", 5, 20), C("bu", 430, 400, 40, "#EF5350", "warm", 5), R("hg", 421, 200, 18, 190, "#EF5350", "warm", 1, 8), ...[0, 1, 2, 3, 4].flatMap((i) => [L(`m${i}`, 460, 130 + i * 50, 490, 130 + i * 50, "ink", 3), T(`n${i}`, 505, 138 + i * 50, `${40 - i * 10}`, 24, "ink", "start")]), T("c", 600, 200, "°C", 40, "soft"), T("rs", 740, 300, "Reading: 30 °C", 30, "good")], steps: [
    step("We measure temperature, how hot or cold something is, with a thermometer. A thermometer has a glass tube with a bulb at the bottom, and a scale of numbers beside it.", [draw("tb", 0.2), draw("bu", 0.3), ...[0, 1, 2, 3, 4].map((i) => show(`m${i}`, 0.5 + i * 0.07)), ...[0, 1, 2, 3, 4].map((i) => write(`n${i}`, 0.5 + i * 0.07)), write("c", 0.9)]),
    step("The red liquid inside rises when it gets hotter and falls when it gets colder.", [fill("hg", "warm", 0.2), pulse("hg", 0.4)]),
    step("To read it, look straight at the top of the liquid. Here it is at thirty degrees Celsius.", [write("rs", 0.3)]),
  ] };
}

/** a plate with the food groups */
export function nutrientsPlate(): Frag {
  const parts: [string, string, string, string][] = [["Carbohydrates", "🍚", "#FFE082", "energy"], ["Proteins", "🥚", "#EF9A9A", "growth"], ["Fats", "🥜", "#FFCC80", "stored energy"], ["Vitamins & minerals", "🥕", "#A5D6A7", "protection"], ["Fibre & water", "🥬", "#90CAF9", "digestion"]];
  const objs: O[] = [T("ttl", 450, 44, "A balanced diet", 34, "accent"), C("pl", 300, 270, 190, "#FFFFFF", "ink", 6)];
  parts.forEach((p, i) => objs.push(SE(`s${i}`, 300, 270, 180, i * 72, (i + 1) * 72, p[2], "ink", 3), T(`e${i}`, 300 + 110 * Math.sin(((i + 0.5) * 72 * Math.PI) / 180), 270 - 110 * Math.cos(((i + 0.5) * 72 * Math.PI) / 180) + 16, p[1], 44, "ink"), T(`l${i}`, 545, 140 + i * 62, `${p[0]}: ${p[3]}`, 20, "ink", "start")));
  return { title: "A balanced diet", objects: objs, steps: [
    step("Our body needs different kinds of food to stay healthy. A balanced diet has all of them in the right amounts.", [draw("pl", 0.4)]),
    step("Carbohydrates give us energy. Proteins help us grow and repair the body. Fats give stored energy. Vitamins and minerals protect us from illness. Fibre and water help digestion.", parts.flatMap((_, i) => [draw(`s${i}`, spread(5, i, 0.05, 0.9), undefined, 400), show(`e${i}`, spread(5, i, 0.07, 0.92)), write(`l${i}`, spread(5, i, 0.1, 0.95))])),
    step("Eating a little of every group each day, with lots of water, keeps us strong and healthy.", [pulse("pl", 0.2, undefined, "good")]),
  ] };
}

/** a lever: effort, load, fulcrum */
export function lever(): Frag {
  return { title: "A lever", objects: [T("ttl", 450, 44, "A lever", 34, "accent"), PO("fu", [[450, 360], [410, 420], [490, 420]], "#BCAAA4", "earth", 4), L("bm", 150, 330, 750, 390, "ink", 10), T("ld", 220, 290, "📦", 70), AR("ef", 700, 200, 700, 330, "accent", 7), T("t1", 220, 225, "Load", 26, "warm"), T("t2", 700, 190, "Effort", 26, "accent"), T("t3", 450, 460, "Fulcrum", 26, "earth")], steps: [
    step("A lever is a simple machine: a stiff bar that turns about a point. It helps us lift heavy things more easily.", [draw("bm", 0.4)]),
    step("The point it turns on is the fulcrum, like the middle of a seesaw. The weight we want to move is the load.", [draw("fu", 0.2), write("t3", 0.3), show("ld", 0.5), write("t1", 0.6)]),
    step("We push down on the other end. This push is the effort. The farther the effort is from the fulcrum, the less effort we need.", [draw("ef", 0.2), write("t2", 0.4)]),
  ] };
}

/** layers of soil */
export function soilLayers(): Frag {
  return { title: "Soil layers", objects: [T("ttl", 450, 44, "Layers of soil", 34, "accent"), R("l1", 180, 110, 400, 80, "#5D4037", "ink", 3, 0), R("l2", 180, 190, 400, 90, "#8D6E63", "ink", 3, 0), R("l3", 180, 280, 400, 90, "#BCAAA4", "ink", 3, 0), R("l4", 180, 370, 400, 70, "#757575", "ink", 3, 0), T("a1", 620, 160, "Topsoil: dark, has humus", 22, "ink", "start"), T("a2", 620, 245, "Subsoil: less humus", 22, "ink", "start"), T("a3", 620, 335, "Weathered rock", 22, "ink", "start"), T("a4", 620, 410, "Bedrock: hard rock", 22, "ink", "start")], steps: [
    step("If we dig deep, we see that soil is made of layers. Each layer is different.", [draw("l1", 0.2), draw("l2", 0.35), draw("l3", 0.5), draw("l4", 0.65)]),
    step("The top layer is the topsoil. It is dark because it has humus, made from rotted plants and animals. Plants grow best in it.", [write("a1", 0.3)]),
    step("Below it are the subsoil and broken rocks, and at the bottom the hard bedrock.", [write("a2", 0.2), write("a3", 0.5), write("a4", 0.8)]),
  ] };
}

/** legislature, executive, judiciary */
export function threeOrgans(): Frag {
  return { title: "Three organs of government", objects: [T("ttl", 450, 44, "Three organs of government", 32, "accent"), ...[["Legislature", "🏛️", "makes the laws", 170], ["Executive", "🧑‍💼", "carries out the laws", 450], ["Judiciary", "⚖️", "settles disputes", 730]].flatMap(([n, e, d, x], i) => [R(`c${i}`, (x as number) - 120, 120, 240, 280, "#FFF3D6", "warm", 4, 16), T(`e${i}`, x as number, 220, e as string, 72, "ink"), T(`n${i}`, x as number, 290, n as string, 30, "accent"), T(`d${i}`, x as number, 345, d as string, 18, "ink")])], steps: [
    step("In a democracy, the work of government is shared between three organs, so that no one has all the power.", [show("ttl", 0.1)]),
    step("The legislature, such as Parliament, makes the laws. The executive, led by the Prime Minister and ministers, carries out the laws.", [draw("c0", 0.1), show("e0", 0.15), write("n0", 0.2), write("d0", 0.3), draw("c1", 0.5), show("e1", 0.55), write("n1", 0.6), write("d1", 0.7)]),
    step("The judiciary, the courts, decides disputes and checks that the laws follow the Constitution.", [draw("c2", 0.1), show("e2", 0.15), write("n2", 0.2), write("d2", 0.3)]),
  ] };
}

/** mountain, plateau, plain in profile */
export function landforms(): Frag {
  return { title: "Landforms", objects: [T("ttl", 450, 44, "Mountains, plateaus and plains", 32, "accent"), PA("pr", "M 40 420 L 160 420 L 260 150 L 360 420 L 430 320 L 600 320 L 660 420 L 860 420", "earth", 6, "#BCAAA4"), T("m1", 260, 120, "Mountain", 26, "accent"), T("m2", 515, 290, "Plateau", 26, "warm"), T("m3", 770, 395, "Plain", 26, "good"), L("gr", 40, 420, 860, 420, "ink", 3)], steps: [
    step("The land has different shapes, called landforms. Here is a side view.", [draw("pr", 0.5), draw("gr", 0.6)]),
    step("A mountain is very high land with a pointed top. A plateau is high land that is flat on top, like a table.", [write("m1", 0.3), write("m2", 0.7)]),
    step("A plain is a large flat area of low land. Plains are good for farming and for building towns.", [write("m3", 0.3)]),
  ] };
}

/** the seven stars of the Great Bear and the Pole Star */
export function saptarishi(): Frag {
  const s: [number, number][] = [[200, 330], [280, 310], [350, 290], [430, 290], [430, 370], [560, 380], [570, 300]];
  return { title: "Stars and constellations", objects: [T("ttl", 450, 44, "A constellation: the Great Bear", 32, "accent"), ...s.map(([x, y], i) => C(`s${i}`, x, y, 9, "#FFE082", "sun", 3)), ...[0, 1, 2, 3, 4, 5].map((i) => L(`l${i}`, s[i === 5 ? 5 : i]![0], s[i === 5 ? 5 : i]![1], ...((i === 3 ? s[4]! : i === 4 ? s[5]! : i === 5 ? s[6]! : s[i + 1]!)), "sun", 3)), L("l6", 570, 300, 430, 290, "sun", 3), AR("pt", 570, 380, 580, 110, "accent", 3), C("pl", 585, 95, 10, "#FFFFFF", "accent", 3), T("pn", 700, 100, "Pole Star", 26, "accent"), T("gb", 300, 440, "Seven stars: Saptarishi", 24, "sun")], steps: [
    step("On a clear night, we see many stars. People long ago joined groups of stars with imaginary lines to make pictures. Each group is a constellation.", [...s.map((_, i) => show(`s${i}`, spread(7, i, 0.1, 0.8)))]),
    step("This one is the Great Bear, also called the Big Dipper. In India its seven bright stars are known as Saptarishi.", [...[0, 1, 2, 3, 4, 5, 6].map((i) => draw(`l${i}`, spread(7, i, 0.1, 0.8), undefined, 300)), write("gb", 0.9)]),
    step("The two stars at the front of the bowl point towards the Pole Star. The Pole Star always shows the north, so travellers used it to find their way.", [draw("pt", 0.2), show("pl", 0.5), write("pn", 0.6)]),
  ] };
}

/** the globe with the equator and two hemispheres */
export function globeEquator(): Frag {
  return { title: "The globe", objects: [T("ttl", 450, 44, "The globe and the Equator", 32, "accent"), C("gl", 330, 265, 170, "#BBDEFB", "water", 5), PA("eq", "M 160 265 Q 330 320 500 265 Q 330 210 160 265", "warm", 5), L("ax", 330, 70, 330, 460, "soft", 3), T("nh", 330, 170, "Northern Hemisphere", 20, "ink"), T("sh", 330, 380, "Southern Hemisphere", 20, "ink"), T("eqt", 650, 270, "Equator", 34, "warm"), T("np", 330, 60, "North Pole", 20, "accent"), T("sp", 330, 478, "South Pole", 20, "accent")], steps: [
    step("A globe is a small model of the Earth. It turns on an imaginary line called the axis, which comes out at the North Pole and the South Pole.", [draw("gl", 0.3), draw("ax", 0.5), write("np", 0.7), write("sp", 0.8)]),
    step("The Equator is an imaginary circle round the middle of the Earth, the same distance from both poles.", [draw("eq", 0.3), write("eqt", 0.6)]),
    step("The Equator divides the Earth into two halves, the Northern Hemisphere and the Southern Hemisphere. India lies in the Northern Hemisphere.", [write("nh", 0.3), write("sh", 0.6)]),
  ] };
}
