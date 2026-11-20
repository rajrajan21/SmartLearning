import { AR, C, draw, fill, L, PO, pulse, R, SE, show, spread, step, T, write, type Frag, type O } from "./kit.js";

const PART: Record<number, string> = { 2: "half", 3: "third", 4: "quarter", 5: "fifth", 6: "sixth", 8: "eighth", 10: "tenth", 12: "twelfth" };
const COL = ["accent", "warm", "good", "water", "sun", "earth"];

/** a round roti or pizza cut into equal parts, some of them coloured */
export function fractionPie(n = 1, d = 4): Frag {
  const cx = 330, cy = 275, r = 150, objs: O[] = [T("ttl", 450, 48, "Fractions", 36, "accent"), C("whole", cx, cy, r + 8, "#F6D7A0", "warm", 6)];
  for (let i = 0; i < d; i++) objs.push(SE(`p${i}`, cx, cy, r, (360 / d) * i, (360 / d) * (i + 1), undefined, "ink", 4));
  objs.push(T("frac", 700, 255, `${n}/${d}`, 110, "accent"), L("bar", 620, 270, 780, 270, "ink", 6), T("say", 700, 400, `${n} of ${d} equal parts`, 26, "soft"));
  const pn = PART[d] ?? `1/${d} part`;
  return { title: "Fractions", objects: objs, steps: [
    step("A fraction tells us how many equal parts of a whole we are talking about. Here is one whole roti.", [draw("whole", 0.35)]),
    step(`Now cut the roti into ${d} equal parts. Each part is one ${pn}. All the parts must be exactly the same size.`, Array.from({ length: d }, (_, i) => draw(`p${i}`, spread(d, i, 0.25, 0.85), undefined, 500))),
    step(`Colour ${n} of the ${d} parts. We write this as ${n} over ${d}. The number below the line says how many equal parts, and the number above says how many we took.`, [...Array.from({ length: n }, (_, i) => fill(`p${i}`, COL[0]!, spread(n, i, 0.05, 0.3))), write("frac", undefined, `${n} over ${d}`), draw("bar", 0.5)]),
  ] };
}

/** place value blocks for a number up to 999 */
export function placeValue(num = 342): Frag {
  const h = Math.floor(num / 100) % 10, t = Math.floor(num / 10) % 10, o = num % 10, objs: O[] = [T("ttl", 450, 48, `Place value of ${num}`, 34, "accent")];
  const cols: [string, number, string, number, string][] = [["Hundreds", 170, "warm", h, "H"], ["Tens", 450, "water", t, "T"], ["Ones", 730, "good", o, "O"]];
  for (const [name, x, c, k] of cols) {
    objs.push(T(`h${name[0]}`, x, 105, name, 30, c), R(`c${name[0]}`, x - 120, 125, 240, 270, undefined, "soft", 3, 12), T(`n${name[0]}`, x, 440, `${k}`, 60, c));
    for (let i = 0; i < k; i++) {
      if (name === "Hundreds") objs.push(R(`b${name[0]}${i}`, x - 100 + (i % 3) * 68, 140 + Math.floor(i / 3) * 80, 62, 72, c === "warm" ? "#FFCCBC" : undefined, c, 3, 6));
      else if (name === "Tens") objs.push(R(`b${name[0]}${i}`, x - 100 + (i % 5) * 42, 140 + Math.floor(i / 5) * 130, 30, 118, "#BBDEFB", c, 3, 4));
      else objs.push(R(`b${name[0]}${i}`, x - 100 + (i % 5) * 42, 140 + Math.floor(i / 5) * 48, 34, 34, "#C8E6C9", c, 3, 4));
    }
  }
  const grp = (p: string, k: number, from: number, to: number) => Array.from({ length: k }, (_, i) => show(`b${p}${i}`, spread(k, i, from, to)));
  return { title: `Place value of ${num}`, objects: objs, steps: [
    step(`Every digit in a number has a place. Look at the number ${num}. We split it into hundreds, tens and ones.`, [show("hH", 0.3), show("hT", 0.4), show("hO", 0.5), draw("cH", 0.3), draw("cT", 0.4), draw("cO", 0.5)]),
    step(`There are ${h} hundreds. A hundred is a big square block, worth one hundred.`, [...grp("H", h, 0.3, 0.8), write("nH", 0.85)]),
    step(`There are ${t} tens. A ten is a long stick, worth ten. And there are ${o} ones, the small cubes, worth one each.`, [...grp("T", t, 0.1, 0.4), write("nT", 0.45), ...grp("O", o, 0.55, 0.85), write("nO", 0.9)]),
  ] };
}

/** hops on a number line: addition goes right, subtraction goes left */
export function numberLine(start = 3, hop = 4, sub = false, lo?: number, hi?: number): Frag {
  const end = sub ? start - hop : start + hop, a = lo ?? Math.min(start, end, 0) - 1, b = hi ?? Math.max(start, end) + 1, n = b - a, x0 = 80, W = 740, px = (v: number) => x0 + ((v - a) / n) * W;
  const objs: O[] = [T("ttl", 450, 48, sub ? "Subtract on the number line" : "Add on the number line", 34, "accent"), L("ln", x0 - 20, 300, x0 + W + 20, 300, "ink", 5)];
  for (let v = a; v <= b; v++) objs.push(L(`k${v - a}`, px(v), 288, px(v), 312, "ink", 3), T(`l${v - a}`, px(v), 345, `${v}`, n > 14 ? 20 : 26, v === start ? "warm" : v === end ? "good" : "ink"));
  const sgn = sub ? -1 : 1;
  for (let i = 0; i < hop; i++) objs.push(PA_hop(`j${i}`, px(start + sgn * i), px(start + sgn * (i + 1))));
  objs.push(T("eq", 450, 440, `${start} ${sub ? "−" : "+"} ${hop} = ${end}`, 56, "accent"), C("dot", px(start), 300, 14, "#FF8A65", "warm", 3));
  return { title: "Number line", objects: objs, steps: [
    step(`A number line is like a ruler for numbers. Numbers get bigger as we go to the right, and smaller as we go to the left. We start at ${start}.`, [draw("ln", 0.3), ...Array.from({ length: n + 1 }, (_, i) => show(`l${i}`, spread(n + 1, i, 0.35, 0.75))), show("dot", 0.8)]),
    step(`${sub ? "To subtract" : "To add"} ${hop}, we take ${hop} hops to the ${sub ? "left" : "right"}, one hop for each number. Count with me.`, Array.from({ length: hop }, (_, i) => draw(`j${i}`, spread(hop, i, 0.3, 0.85), undefined, 600))),
    step(`We land on ${end}. So ${start} ${sub ? "minus" : "plus"} ${hop} equals ${end}.`, [pulse(`l${end - a}`, 0.2, undefined, "good"), write("eq", undefined, `equals ${end}`)]),
  ] };
}
const PA_hop = (id: string, x1: number, x2: number): O => ({ kind: "path", id, d: `M ${x1} 296 Q ${(x1 + x2) / 2} 220 ${x2} 296`, stroke: "accent", width: 5 });

/** rows x columns array: multiplication as equal groups */
export function arrayMul(rows = 3, cols = 4): Frag {
  const objs: O[] = [T("ttl", 450, 48, `${rows} × ${cols}`, 36, "accent")], gx = Math.min(70, 520 / cols), gy = Math.min(66, 320 / rows), x0 = 100, y0 = 120;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) objs.push(C(`d${r}x${c}`, x0 + c * gx + 30, y0 + r * gy + 30, 22, COL[r % COL.length] === "accent" ? "#FFD166" : "#9DD6C0", "ink", 3));
  objs.push(T("eq", 740, 270, `${rows} × ${cols}`, 50, "accent"), T("ans", 740, 345, `= ${rows * cols}`, 64, "good"));
  const row = (r: number, a: number, b: number) => Array.from({ length: cols }, (_, c) => show(`d${r}x${c}`, spread(cols, c, a, b)));
  return { title: "Multiplication", objects: objs, steps: [
    step(`Multiplication means equal groups. Here are ${rows} rows, and every row has ${cols} dots.`, Array.from({ length: rows }, (_, r) => row(r, 0.15 + (0.7 * r) / rows, 0.15 + (0.7 * (r + 1)) / rows)).flat()),
    step(`${rows} groups of ${cols} is the same as ${rows} times ${cols}. We write it as ${rows} × ${cols}.`, [write("eq", undefined, `times ${cols}`)]),
    step(`Count all the dots. There are ${rows * cols} dots in all. So ${rows} times ${cols} is ${rows * cols}.`, [write("ans", undefined, `is ${rows * cols}`)]),
  ] };
}

/** sharing equally: division */
export function divideShare(total = 12, groups = 3): Frag {
  const each = Math.floor(total / groups), objs: O[] = [T("ttl", 450, 48, `${total} ÷ ${groups}`, 36, "accent")], gw = 800 / groups;
  for (let g = 0; g < groups; g++) objs.push(R(`g${g}`, 50 + g * gw + 10, 250, gw - 20, 170, undefined, "soft", 4, 14), T(`gl${g}`, 50 + g * gw + gw / 2, 450, `Group ${g + 1}`, 22, "soft"));
  for (let i = 0; i < total; i++) { const g = i % groups, k = Math.floor(i / groups); objs.push(C(`c${i}`, 50 + g * gw + 40 + (k % 4) * 44, 285 + Math.floor(k / 4) * 50, 18, "#FFD166", "warm", 3)); }
  objs.push(T("ans", 450, 130, `${total} ÷ ${groups} = ${each}`, 60, "good"));
  return { title: "Division", objects: objs, steps: [
    step(`Division means sharing equally. We have ${total} sweets to share among ${groups} children.`, [...Array.from({ length: groups }, (_, g) => draw(`g${g}`, spread(groups, g, 0.4, 0.8))), ...Array.from({ length: groups }, (_, g) => show(`gl${g}`, spread(groups, g, 0.4, 0.8)))]),
    step(`Give one sweet to each child, again and again, until all the sweets are shared.`, Array.from({ length: total }, (_, i) => show(`c${i}`, spread(total, i, 0.1, 0.9)))),
    step(`Each child gets ${each} sweets. So ${total} divided by ${groups} is ${each}.`, [write("ans", undefined, `is ${each}`)]),
  ] };
}

/** an angle opening up */
export function angle(deg = 90): Frag {
  const cx = 300, cy = 380, len = 250, rad = (deg * Math.PI) / 180, x2 = cx + len * Math.cos(rad), y2 = cy - len * Math.sin(rad);
  const kind = deg < 90 ? "an acute angle, smaller than a right angle" : deg === 90 ? "a right angle, like the corner of a book" : deg < 180 ? "an obtuse angle, bigger than a right angle" : "a straight angle, which looks like a straight line";
  const from = 90 - deg, arcs: O[] = from >= 0 ? [SE("arc", cx, cy, 70, from, 90, "#FFE082", "accent", 3)] : [SE("arc", cx, cy, 70, 360 + from, 360, "#FFE082", "accent", 3), SE("arc2", cx, cy, 70, 0, 90, "#FFE082", "accent", 3)];
  return { title: "Angles", objects: [T("ttl", 450, 48, "Angles", 36, "accent"), L("a1", cx, cy, cx + len, cy, "ink", 6), L("a2", cx, cy, x2, y2, "warm", 6), ...arcs, C("vx", cx, cy, 9, "#FF8A65", "warm", 3), T("dg", 640, 250, `${deg}°`, 90, "accent"), T("nm", 640, 330, deg < 90 ? "acute" : deg === 90 ? "right" : deg < 180 ? "obtuse" : "straight", 36, "good")], steps: [
    step("An angle is made when two lines meet at a point. The meeting point is called the vertex.", [draw("a1", 0.2), draw("a2", 0.45), show("vx", 0.7)]),
    step(`The wider the lines open, the bigger the angle. We measure it in degrees. This one is ${deg} degrees.`, [...arcs.map((a) => fill(a.id, "sun", 0.1)), write("dg", undefined, `${deg} degrees`), pulse("a2", 0.5)]),
    step(`That makes it ${kind}.`, [write("nm", 0.3)]),
  ] };
}

/** a plane shape with its sides and corners counted */
export function shapeSides(shape: "triangle" | "square" | "rectangle" | "pentagon" | "hexagon" = "triangle"): Frag {
  const cx = 300, cy = 270, pts: Record<string, [number, number][]> = {
    triangle: [[cx, 120], [cx + 150, 400], [cx - 150, 400]], square: [[cx - 120, 150], [cx + 120, 150], [cx + 120, 390], [cx - 120, 390]], rectangle: [[cx - 170, 170], [cx + 170, 170], [cx + 170, 370], [cx - 170, 370]],
    pentagon: Array.from({ length: 5 }, (_, i) => [cx + 150 * Math.sin((i * 2 * Math.PI) / 5), cy - 150 * Math.cos((i * 2 * Math.PI) / 5)] as [number, number]), hexagon: Array.from({ length: 6 }, (_, i) => [cx + 150 * Math.sin((i * 2 * Math.PI) / 6), cy - 150 * Math.cos((i * 2 * Math.PI) / 6)] as [number, number]),
  };
  const p = pts[shape]!, n = p.length, objs: O[] = [T("ttl", 450, 48, `A ${shape}`, 36, "accent"), PO("sh", p, "#FFF3D6", "ink", 6)];
  for (let i = 0; i < n; i++) objs.push(L(`e${i}`, p[i]![0], p[i]![1], p[(i + 1) % n]![0], p[(i + 1) % n]![1], "warm", 9), C(`v${i}`, p[i]![0], p[i]![1], 11, "#1F4FD1", "accent", 3));
  objs.push(T("ns", 700, 220, `${n} sides`, 44, "warm"), T("nc", 700, 300, `${n} corners`, 44, "accent"));
  return { title: shape, objects: objs, steps: [
    step(`This is a ${shape}. Let us look at it carefully.`, [draw("sh", 0.4)]),
    step(`The straight lines around the shape are its sides. Count them with me. A ${shape} has ${n} sides.`, [...Array.from({ length: n }, (_, i) => draw(`e${i}`, spread(n, i, 0.2, 0.7))), write("ns", undefined, `${n} sides`)]),
    step(`The points where two sides meet are the corners. A ${shape} has ${n} corners too.`, [...Array.from({ length: n }, (_, i) => show(`v${i}`, spread(n, i, 0.2, 0.7))), write("nc", undefined, `${n} corners`)]),
  ] };
}

/** perimeter as the walk round the edge, area as squares inside */
export function perimeterArea(w = 5, h = 3, focus: "perimeter" | "area" | "both" = "both"): Frag {
  const s = Math.min(70, 440 / w, 280 / h), x0 = 80, y0 = 110, objs: O[] = [T("ttl", 450, 48, focus === "area" ? "Area" : focus === "perimeter" ? "Perimeter" : "Perimeter and area", 36, "accent"), R("rc", x0, y0, w * s, h * s, undefined, "ink", 6)];
  for (let i = 1; i < w; i++) objs.push(L(`gv${i}`, x0 + i * s, y0, x0 + i * s, y0 + h * s, "soft", 2));
  for (let j = 1; j < h; j++) objs.push(L(`gh${j}`, x0, y0 + j * s, x0 + w * s, y0 + j * s, "soft", 2));
  objs.push(AR("w1", x0, y0 - 22, x0 + w * s, y0 - 22, "warm", 5), AR("h1", x0 + w * s + 22, y0, x0 + w * s + 22, y0 + h * s, "warm", 5), T("wl", x0 + (w * s) / 2, y0 - 32, `${w} units`, 24, "warm"), T("hl", x0 + w * s + 40, y0 + (h * s) / 2, `${h}`, 26, "warm", "start"), T("pe", 700, 230, `P = ${2 * (w + h)}`, 52, "accent"), T("ar", 700, 340, `A = ${w * h}`, 52, "good"), R("fa", x0, y0, w * s, h * s, "#C8E6C9", "good", 2));
  const mkGrid = [...Array.from({ length: w - 1 }, (_, i) => show(`gv${i + 1}`, spread(w, i, 0.1, 0.5))), ...Array.from({ length: h - 1 }, (_, j) => show(`gh${j + 1}`, spread(h, j, 0.5, 0.8)))];
  const st = [step(`Here is a rectangle, ${w} units long and ${h} units wide.`, [draw("rc", 0.3), draw("w1", 0.55), write("wl", 0.6), draw("h1", 0.75), write("hl", 0.8)])];
  if (focus !== "area") st.push(step(`The perimeter is the distance all the way round the edge. Walk round: ${w} plus ${h} plus ${w} plus ${h} makes ${2 * (w + h)} units.`, [pulse("rc", 0.1, undefined, "warm"), write("pe", undefined, `makes ${2 * (w + h)}`)]));
  if (focus !== "perimeter") st.push(step(`The area is the space inside. Cover it with unit squares: ${h} rows of ${w} squares. That is ${w} times ${h}, which is ${w * h} square units.`, [...mkGrid, fill("fa", "good", 0.82), write("ar", undefined, `${w * h} square`)]));
  return { title: "Perimeter and area", objects: objs, steps: st };
}

/** reading the clock */
export function clockTime(h = 3, m = 0): Frag {
  const say = m === 0 ? `${h} o'clock` : m === 30 ? `half past ${h}` : m === 15 ? `quarter past ${h}` : m === 45 ? `quarter to ${h % 12 + 1}` : `${h}:${String(m).padStart(2, "0")}`;
  return { title: "Telling the time", objects: [T("ttl", 450, 48, "Telling the time", 36, "accent"), { kind: "clock", id: "ck", cx: 300, cy: 280, r: 170 }, T("dig", 710, 270, `${h}:${String(m).padStart(2, "0")}`, 80, "good"), T("tw", 710, 340, say, 30, "soft")], steps: [
    step("A clock has two hands. The short hand shows the hour. The long hand shows the minutes.", [draw("ck", 0.3), pulse("ck", 0.55, undefined, "accent")]),
    step(`Watch the hands move. The short hand points to ${h}, and the long hand points to ${m === 0 ? "12" : m / 5}.`, [{ do: "time", target: "ck", hour: h, minute: m, at: 0.1, ms: 2200 }]),
    step(`So the time is ${say}.`, [write("dig", 0.2), write("tw", 0.5)]),
  ] };
}

/** coins and notes adding up */
export function money(parts: number[] = [10, 5, 2, 1]): Frag {
  const objs: O[] = [T("ttl", 450, 48, "Money", 36, "accent")], total = parts.reduce((a, b) => a + b, 0), gap = Math.min(150, 760 / parts.length);
  parts.forEach((v, i) => { const x = 450 - ((parts.length - 1) * gap) / 2 + i * gap; objs.push(v >= 10 ? R(`m${i}`, x - 60, 170, 120, 70, "#C8E6C9", "good", 4, 8) : C(`m${i}`, x, 205, 42, "#FFE082", "warm", 5), T(`v${i}`, x, 215, `₹${v}`, v >= 10 ? 32 : 28, "ink")); });
  objs.push(T("tot", 450, 380, `₹${parts.join(" + ")} = ₹${total}`, 46, "accent"));
  return { title: "Money", objects: objs, steps: [
    step("We pay for things with coins and notes. The rupee is the money we use in India.", [show("ttl", 0.1)]),
    step(`Here are ${parts.length} pieces of money. Let us add their values one by one.`, parts.flatMap((_, i) => [draw(`m${i}`, spread(parts.length, i, 0.15, 0.8)), show(`v${i}`, spread(parts.length, i, 0.2, 0.85))])),
    step(`Add them all together. The total is ${total} rupees.`, [write("tot", undefined, `${total} rupees`)]),
  ] };
}

/** a bar graph whose bars grow */
export function barGraph(labels = ["Mon", "Tue", "Wed", "Thu"], vals = [3, 5, 2, 4], title = "Bar graph"): Frag {
  const n = vals.length, max = Math.max(...vals), bw = Math.min(90, 560 / n - 20), x0 = 150, base = 400, unit = 250 / max, objs: O[] = [T("ttl", 450, 48, title, 36, "accent"), L("ax", x0 - 20, base, x0 + n * (bw + 24) + 10, base, "ink", 5), L("ay", x0 - 20, base, x0 - 20, 130, "ink", 5)];
  vals.forEach((v, i) => { const x = x0 + i * (bw + 24); objs.push(R(`b${i}`, x, base - v * unit, bw, v * unit, ["#FFD166", "#FF8A65", "#7BE0AD", "#6EC6FF"][i % 4], "ink", 3, 4), T(`x${i}`, x + bw / 2, base + 32, labels[i] ?? "", 24, "ink"), T(`n${i}`, x + bw / 2, base - v * unit - 12, `${v}`, 28, "accent")); });
  const hi = vals.indexOf(max);
  return { title, objects: objs, steps: [
    step("A bar graph shows numbers as bars, so we can compare them at a glance. The bottom line names the things we count.", [draw("ax", 0.3), draw("ay", 0.5), ...labels.slice(0, n).map((_, i) => write(`x${i}`, spread(n, i, 0.55, 0.9)))]),
    step("Each bar is as tall as its number. Watch the bars grow.", vals.flatMap((_, i) => [draw(`b${i}`, spread(n, i, 0.1, 0.7), undefined, 700), write(`n${i}`, spread(n, i, 0.2, 0.8))])),
    step(`The tallest bar is ${labels[hi]}, with ${max}. Reading a graph is as easy as comparing heights.`, [pulse(`b${hi}`, 0.2, undefined, "good")]),
  ] };
}

/** a ruler measuring an object */
export function ruler(cm = 7): Frag {
  const x0 = 80, u = 60, objs: O[] = [T("ttl", 450, 48, "Measuring length", 36, "accent"), R("rl", x0 - 10, 270, 12 * u + 20, 70, "#FFF3D6", "warm", 4, 6)];
  for (let i = 0; i <= 12; i++) objs.push(L(`t${i}`, x0 + i * u, 270, x0 + i * u, i % 5 === 0 ? 312 : 300, "ink", 3), T(`r${i}`, x0 + i * u, 335, `${i}`, 22, "ink"));
  objs.push(R("pen", x0, 190, cm * u, 36, "#FFB74D", "warm", 4, 18), T("res", 450, 140, `${cm} cm`, 56, "good"), T("cmu", 745, 363, "cm", 22, "soft"));
  return { title: "Measuring length", objects: objs, steps: [
    step("To measure length we use a ruler. The numbers show centimetres, written cm.", [draw("rl", 0.3), ...Array.from({ length: 13 }, (_, i) => show(`t${i}`, spread(13, i, 0.35, 0.85))), ...Array.from({ length: 13 }, (_, i) => show(`r${i}`, spread(13, i, 0.35, 0.85))), show("cmu", 0.9)]),
    step("Place the object so that one end touches the zero mark. This is very important.", [draw("pen", 0.3)]),
    step(`Now read the number where the other end stops. It is at ${cm}. So the pencil is ${cm} centimetres long.`, [pulse(`r${cm}`, 0.2, undefined, "warm"), write("res", undefined, `${cm} centimetres`)]),
  ] };
}

/** tenths and hundredths: decimals and percent */
export function tenthsBar(k = 3): Frag {
  const objs: O[] = [T("ttl", 450, 48, "Decimals", 36, "accent")], w = 70;
  for (let i = 0; i < 10; i++) objs.push(R(`t${i}`, 100 + i * w, 150, w, 120, undefined, "ink", 3), T(`c${i}`, 100 + i * w + w / 2, 300, i === 9 ? "1.0" : `0.${i + 1}`, 20, "soft"));
  objs.push(T("fr", 450, 390, `${k}/10 = 0.${k}`, 60, "accent"), T("pc", 450, 450, `= ${k * 10}%`, 36, "good"));
  return { title: "Decimals", objects: objs, steps: [
    step("Let us cut one whole into ten equal parts, like a chocolate bar with ten pieces. Each part is one tenth.", Array.from({ length: 10 }, (_, i) => draw(`t${i}`, spread(10, i, 0.3, 0.9), undefined, 300))),
    step(`Colour ${k} of the ten pieces. That is ${k} tenths. As a decimal we write it as zero point ${k}.`, [...Array.from({ length: k }, (_, i) => fill(`t${i}`, "accent", spread(k, i, 0.05, 0.4))), write("fr", undefined, "decimal")]),
    step(`Out of one hundred, that is ${k * 10}. So ${k} tenths is ${k * 10} percent. Fractions, decimals and percentages are three ways of writing the same amount.`, [write("pc", undefined, "percent")]),
  ] };
}

/** a repeating pattern that grows */
export function pattern(): Frag {
  const objs: O[] = [T("ttl", 450, 48, "Patterns", 36, "accent")], cols = ["#FF8A65", "#6EC6FF", "#FF8A65", "#6EC6FF", "#FF8A65", "#6EC6FF", "#FF8A65", "#6EC6FF"];
  cols.forEach((c, i) => objs.push(i % 2 ? PO(`s${i}`, [[70 + i * 95, 250], [130 + i * 95, 250], [100 + i * 95, 190]], c, "ink", 3) : C(`s${i}`, 100 + i * 95, 220, 32, c, "ink", 3)));
  objs.push(T("q", 100 + 8 * 95, 235, "?", 60, "warm"), T("say", 450, 400, "circle, triangle, circle, triangle ...", 34, "good"));
  return { title: "Patterns", objects: objs, steps: [
    step("A pattern is something that repeats again and again in the same order. Look at these shapes.", cols.slice(0, 4).map((_, i) => draw(`s${i}`, spread(4, i, 0.3, 0.9)))),
    step("Circle, triangle, circle, triangle. The pattern repeats after every two shapes, so we can guess what comes next.", [...cols.slice(4).map((_, i) => draw(`s${i + 4}`, spread(4, i, 0.4, 0.9))), write("say", 0.2)]),
    step("The next shape after a triangle is a circle. Finding the rule of a pattern lets us predict what comes next.", [pulse("q", 0.1, undefined, "warm"), write("q", 0.15)]),
  ] };
}
