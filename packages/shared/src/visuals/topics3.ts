import { AR, C, clip, draw, L, PA, PO, pulse, R, SE, show, spread, step, T, write, type Frag, type O } from "./kit.js";
import { notedGrid } from "./topics2.js";

/** Boards for secondary-school chapters (classes 9 and 10): standard textbook diagrams and formulas only. */

const ptOn = (cx: number, cy: number, r: number, deg: number): [number, number] => [Math.round(cx + r * Math.cos((deg * Math.PI) / 180)), Math.round(cy - r * Math.sin((deg * Math.PI) / 180))];

export function coordPlane(): Frag {
  const ox = 450, oy = 265, u = 60;
  return { title: "The coordinate plane", objects: [T("ttl", 450, 36, "The coordinate plane", 32, "accent"), AR("xa", 130, oy, 790, oy, "ink", 4), AR("ya", ox, 460, ox, 60, "ink", 4), T("xl", 810, oy + 8, "x", 26, "ink"), T("yl", ox + 22, 70, "y", 26, "ink"), T("o", ox - 18, oy + 24, "O", 22, "ink"),
    T("q1", 700, 100, "I (+, +)", 22, "good"), T("q2", 200, 100, "II (−, +)", 22, "warm"), T("q3", 200, 440, "III (−, −)", 22, "good"), T("q4", 700, 440, "IV (+, −)", 22, "warm"),
    L("gx", ox + 3 * u, oy, ox + 3 * u, oy - 2 * u, "soft", 3), L("gy", ox, oy - 2 * u, ox + 3 * u, oy - 2 * u, "soft", 3), C("pt", ox + 3 * u, oy - 2 * u, 8, "#FF8A65", "accent", 3), T("lp", ox + 3 * u + 14, oy - 2 * u - 12, "P (3, 2)", 24, "accent", "start"), T("x3", ox + 3 * u, oy + 26, "3", 22, "ink"), T("y2", ox - 18, oy - 2 * u + 8, "2", 22, "ink")], steps: [
    step("Two number lines cross at right angles. The horizontal one is the x axis and the vertical one is the y axis. They meet at the origin, O.", [show("ttl", 0.05), draw("xa", 0.25), draw("ya", 0.45), write("xl", 0.6), write("yl", 0.65), write("o", 0.75)]),
    step("The two axes divide the plane into four quadrants. Both numbers are positive in the first quadrant. The signs of x and y are different in the second and the fourth, and both are negative in the third.", [write("q1", 0.15), write("q2", 0.35), write("q3", 0.55), write("q4", 0.75)]),
    step("A point is described by an ordered pair, x first and then y. To plot P, three units along the x axis and two units up, we write P as 3 comma 2.", [draw("gx", 0.15), draw("gy", 0.35), draw("pt", 0.55), write("lp", 0.65), write("x3", 0.7), write("y2", 0.75)]),
  ] };
}

export function trigRatios(): Frag {
  const A: [number, number] = [220, 410], B: [number, number] = [640, 410], Cc: [number, number] = [640, 150];
  return { title: "Trigonometric ratios", objects: [T("ttl", 450, 40, "Trigonometric ratios", 32, "accent"), PO("tr", [A, B, Cc], "#FFF3D6", "warm", 5), PA("rt", "M 620 410 L 620 390 L 640 390", "ink", 3), T("th", 290, 400, "θ", 30, "accent"), T("op", 668, 285, "opposite", 22, "good", "start"), T("ad", 430, 440, "adjacent", 22, "water"), T("hy", 400, 260, "hypotenuse", 22, "warm", "end"),
    T("f1", 40, 110, "sin θ = opposite ÷ hypotenuse", 22, "ink", "start"), T("f2", 40, 150, "cos θ = adjacent ÷ hypotenuse", 22, "ink", "start"), T("f3", 40, 190, "tan θ = opposite ÷ adjacent", 22, "ink", "start"), T("ex", 450, 480, "In a 3-4-5 triangle: sin θ = 3/5, cos θ = 4/5, tan θ = 3/4", 20, "good")], steps: [
    step("Take a right-angled triangle and mark one of its acute angles, theta. The side facing theta is the opposite side, the side next to it is the adjacent side, and the longest side is the hypotenuse.", [show("ttl", 0.05), draw("tr", 0.15), draw("rt", 0.3), write("th", 0.4), write("op", 0.5), write("ad", 0.6), write("hy", 0.7)]),
    step("Sine of theta is opposite over hypotenuse. Cosine is adjacent over hypotenuse. Tangent is opposite over adjacent.", [write("f1", 0.15), write("f2", 0.4), write("f3", 0.65)]),
    step("For a triangle with opposite side 3, adjacent side 4 and hypotenuse 5, sine is 3 over 5, cosine is 4 over 5 and tangent is 3 over 4.", [write("ex", 0.3)]),
  ] };
}

export function elevation(): Frag {
  return { title: "Angle of elevation", objects: [T("ttl", 450, 40, "Angle of elevation", 32, "accent"), L("gr", 80, 420, 820, 420, "earth", 5), L("tw", 680, 420, 680, 150, "ink", 8), C("top", 680, 150, 8, "#FF8A65", "warm", 3), C("ob", 160, 405, 12, "#BBDEFB", "water", 3), L("hz", 160, 405, 560, 405, "soft", 3), L("sight", 160, 405, 680, 150, "accent", 4), PA("arc", "M 260 405 C 262 385 258 380 250 370", "warm", 4), T("ae", 275, 365, "angle of elevation", 22, "warm", "start"), T("lh", 500, 435, "horizontal", 20, "ink", "end"), T("ls", 400, 245, "line of sight", 22, "accent", "end"), T("lt", 712, 290, "height", 22, "ink", "start"), T("lo", 160, 445, "observer", 22, "water")], steps: [
    step("Here an observer stands on level ground and looks up at the top of a tower.", [draw("gr", 0.1), draw("tw", 0.3), draw("top", 0.45), draw("ob", 0.6), write("lo", 0.7), write("lt", 0.8)]),
    step("The line from the eye to the top of the tower is the line of sight. The level line from the eye is the horizontal.", [draw("sight", 0.2), write("ls", 0.4), draw("hz", 0.55), write("lh", 0.7)]),
    step("The angle between the horizontal and the line of sight, when we look up at something, is the angle of elevation. With this angle and the distance, we can find the height using the tangent ratio.", [draw("arc", 0.2), write("ae", 0.4)]),
  ] };
}

export function quadratic(): Frag {
  return { title: "Quadratic equations", objects: [T("ttl", 450, 40, "Quadratic equations", 32, "accent"), T("f", 450, 110, "ax² + bx + c = 0   (a ≠ 0)", 38, "accent"), T("e", 450, 175, "Example: x² − 5x + 6 = 0", 30, "ink"), T("e2", 450, 220, "(x − 2)(x − 3) = 0", 30, "ink"), T("e3", 450, 265, "x = 2 or x = 3", 32, "good"),
    T("q", 450, 330, "x = (−b ± √(b² − 4ac)) ÷ 2a", 32, "warm"), T("d", 450, 380, "Discriminant b² − 4ac:", 24, "ink"), T("d1", 450, 415, "more than 0: two different real roots", 22, "good"), T("d2", 450, 445, "equal to 0: two equal roots", 22, "warm"), T("d3", 450, 475, "less than 0: no real roots", 22, "accent")], steps: [
    step("A quadratic equation has the form a x squared plus b x plus c equals zero, where a is not zero.", [show("ttl", 0.05), write("f", 0.5)]),
    step("One way to solve it is by factorising. For x squared minus 5 x plus 6, the factors are x minus 2 and x minus 3. The product is zero when one factor is zero, so x is 2 or x is 3.", [write("e", 0.15), write("e2", 0.4), write("e3", 0.7)]),
    step("Another way is the quadratic formula, which works for every quadratic equation.", [write("q", 0.5)]),
    step("The part under the square root, b squared minus 4 a c, is the discriminant. It tells us the kind of roots. If it is more than zero there are two different real roots, if it is zero the roots are equal, and if it is less than zero there are no real roots.", [write("d", 0.1), write("d1", 0.3), write("d2", 0.55), write("d3", 0.8)]),
  ] };
}

export function apBoard(): Frag {
  const v = [2, 5, 8, 11], objs: O[] = [T("ttl", 450, 40, "Arithmetic progression", 32, "accent")];
  v.forEach((x, i) => { objs.push(R(`b${i}`, 90 + i * 170, 90, 110, 70, "#FFF3D6", "warm", 3, 12), T(`t${i}`, 145 + i * 170, 137, String(x), 34, "ink")); if (i < 3) objs.push(AR(`a${i}`, 205 + i * 170, 125, 255 + i * 170, 125, "accent", 4), T(`d${i}`, 230 + i * 170, 100, "+3", 20, "accent")); });
  objs.push(T("f", 450, 230, "aₙ = a + (n − 1)d", 36, "accent"), T("e1", 450, 285, "a = 2, d = 3: the 10th term = 2 + 9 × 3 = 29", 26, "ink"), T("s", 450, 355, "Sₙ = n/2 × [2a + (n − 1)d]", 34, "warm"), T("e2", 450, 410, "Sum of the first 10 terms = 5 × (4 + 27) = 155", 26, "ink"));
  return { title: "Arithmetic progression", objects: objs, steps: [
    step("An arithmetic progression, or AP, is a list of numbers in which each term is got by adding the same number, the common difference d, to the term before it. Here the first term is 2 and d is 3.", [show("ttl", 0.05), ...v.flatMap((_, i) => [draw(`b${i}`, spread(4, i, 0.15, 0.8)), write(`t${i}`, spread(4, i, 0.17, 0.82)), ...(i < 3 ? [draw(`a${i}`, spread(4, i, 0.2, 0.85)), write(`d${i}`, spread(4, i, 0.22, 0.87))] : [])])]),
    step("The n-th term is a plus n minus 1 times d. For the 10th term, 2 plus 9 times 3 gives 29.", [write("f", 0.3), write("e1", 0.7)]),
    step("The sum of the first n terms is n over 2, times 2 a plus n minus 1 times d. For 10 terms, that is 5 times 31, which is 155.", [write("s", 0.3), write("e2", 0.7)]),
  ] };
}

export function tangentCircle(): Frag {
  const cx = 330, cy = 265, r = 140, P = ptOn(cx, cy, r, 40), dir: [number, number] = [Math.sin((40 * Math.PI) / 180), Math.cos((40 * Math.PI) / 180)];
  const Q: [number, number] = [cx + 360, cy], a = (Math.acos(r / 360) * 180) / Math.PI, T1 = ptOn(cx, cy, r, a), T2 = ptOn(cx, cy, r, -a);
  const tn = [Math.round(P[0] - dir[0] * 130), Math.round(P[1] - dir[1] * 130), Math.round(P[0] + dir[0] * 130), Math.round(P[1] + dir[1] * 130)] as const;
  return { title: "Tangent to a circle", objects: [T("ttl", 450, 36, "Tangent to a circle", 32, "accent"), C("ci", cx, cy, r, undefined, "ink", 5), C("ce", cx, cy, 5, "#FF8A65", "warm", 3), T("lo", cx - 16, cy + 26, "O", 24, "ink"), L("rad", cx, cy, ...P, "good", 4), C("cp", ...P, 7, "#FF8A65", "accent", 3), L("tan", ...tn, "accent", 5), T("lp", P[0] + 12, P[1] - 16, "P", 24, "accent", "start"), T("rp", 560, 120, "tangent: touches at one point", 22, "accent", "start"), T("pr", 40, 90, "radius ⟂ tangent at P", 22, "good", "start"),
    C("q", ...Q, 7, "#FF8A65", "warm", 3), T("lq", Q[0] + 16, Q[1] + 8, "Q", 24, "warm", "start"), L("q1", ...Q, ...T1, "warm", 4), L("q2", ...Q, ...T2, "warm", 4), T("eq", 700, 430, "QA = QB", 28, "good")], steps: [
    step("A tangent is a line that touches a circle at exactly one point, called the point of contact. Here the tangent touches the circle at P.", [draw("ci", 0.1, undefined, 1200), draw("ce", 0.4), write("lo", 0.45), draw("tan", 0.55), draw("cp", 0.7), write("lp", 0.75), write("rp", 0.85)]),
    step("The radius drawn to the point of contact is perpendicular to the tangent.", [draw("rad", 0.2), write("pr", 0.5)]),
    step("From a point outside the circle we can draw two tangents. The two tangent segments are equal in length.", [{ do: "hide", target: "tan", at: 0.05 }, { do: "hide", target: "rp", at: 0.05 }, { do: "hide", target: "pr", at: 0.05 }, { do: "hide", target: "rad", at: 0.05 }, { do: "hide", target: "cp", at: 0.05 }, { do: "hide", target: "lp", at: 0.05 }, draw("q", 0.2), write("lq", 0.25), draw("q1", 0.4), draw("q2", 0.55), write("eq", 0.75)]),
  ] };
}

export function circleAreas(): Frag {
  return { title: "Circle measures", objects: [T("ttl", 450, 40, "Measures of a circle", 32, "accent"), C("ci", 250, 250, 120, undefined, "ink", 5), SE("sec", 250, 250, 120, 0, 90, "#FFE0B2", "warm", 4), T("th", 280, 215, "θ = 90°", 22, "accent"), T("r", 250, 395, "radius r", 22, "ink"),
    T("f1", 640, 120, "Circumference = 2πr", 28, "ink"), T("f2", 640, 170, "Area = πr²", 28, "ink"), T("f3", 640, 240, "Arc length = (θ/360) × 2πr", 26, "warm"), T("f4", 640, 290, "Sector area = (θ/360) × πr²", 26, "warm"), T("e", 640, 365, "r = 7 cm, θ = 90°, π = 22/7", 22, "ink"), T("e1", 640, 400, "arc length = 11 cm", 24, "good"), T("e2", 640, 435, "sector area = 38.5 cm²", 24, "good")], steps: [
    step("The distance around a circle is its circumference, 2 pi r. The space inside is its area, pi r squared.", [draw("ci", 0.1, undefined, 1200), write("r", 0.5), write("f1", 0.6), write("f2", 0.8)]),
    step("A sector is a slice of the circle between two radii. If its angle is theta degrees, it is theta over 360 of the whole circle.", [draw("sec", 0.2), write("th", 0.5)]),
    step("So the arc length is theta over 360 times 2 pi r, and the area of the sector is theta over 360 times pi r squared.", [write("f3", 0.25), write("f4", 0.6)]),
    step("For radius 7 centimetres and angle 90 degrees, a quarter of the circle, the arc is 11 centimetres and the sector area is 38 point 5 square centimetres.", [write("e", 0.2), write("e1", 0.5), write("e2", 0.75)]),
  ] };
}

export function bpt(): Frag {
  const A: [number, number] = [450, 70], B: [number, number] = [210, 410], Cc: [number, number] = [690, 410], t = 0.4, D: [number, number] = [Math.round(A[0] + t * (B[0] - A[0])), Math.round(A[1] + t * (B[1] - A[1]))], E: [number, number] = [Math.round(A[0] + t * (Cc[0] - A[0])), Math.round(A[1] + t * (Cc[1] - A[1]))];
  return { title: "Basic proportionality theorem", objects: [T("ttl", 450, 36, "Basic proportionality theorem", 30, "accent"), PO("tr", [A, B, Cc], undefined, "ink", 5), L("de", ...D, ...E, "accent", 5), T("la", A[0], A[1] - 14, "A", 26, "ink"), T("lb", B[0] - 18, B[1] + 8, "B", 26, "ink"), T("lc", Cc[0] + 18, Cc[1] + 8, "C", 26, "ink"), T("ld", D[0] - 22, D[1], "D", 26, "accent"), T("le", E[0] + 22, E[1], "E", 26, "accent"), T("par", 450, 440, "DE ∥ BC", 26, "accent"), T("r1", 30, 150, "AD/DB = AE/EC", 30, "good", "start"), T("r2", 30, 195, "e.g. AD = 2, DB = 3", 22, "ink", "start"), T("r3", 30, 228, "then AE : EC = 2 : 3", 22, "ink", "start")], steps: [
    step("Take a triangle ABC. Draw a line DE parallel to the side BC, cutting the other two sides at D and E.", [draw("tr", 0.1, undefined, 1200), write("la", 0.5), write("lb", 0.55), write("lc", 0.6), draw("de", 0.7), write("ld", 0.8), write("le", 0.85)]),
    step("The line divides the two sides in the same ratio. A D over D B equals A E over E C. This is the basic proportionality theorem.", [write("par", 0.2), write("r1", 0.6)]),
    step("So if A D is 2 and D B is 3, then A E to E C is also 2 to 3.", [write("r2", 0.3), write("r3", 0.7)]),
  ] };
}

export const mensurationFormulas = (): Frag => notedGrid("Surface area and volume", [
  { e: "📦", label: "Cuboid", tag: "V = lbh", note: "A cuboid has volume l times b times h. Its total surface area is 2 times lb plus bh plus hl." },
  { e: "🎲", label: "Cube", tag: "V = a³", note: "A cube of side a has volume a cubed and total surface area 6 a squared." },
  { e: "🥫", label: "Cylinder", tag: "V = πr²h", note: "A cylinder has volume pi r squared h. Its curved surface area is 2 pi r h, and the total surface area is 2 pi r times r plus h." },
  { e: "🍦", label: "Cone", tag: "V = ⅓πr²h", note: "A cone has volume one third pi r squared h. Its curved surface area is pi r l, where l is the slant height." },
  { e: "⚽", label: "Sphere", tag: "V = 4/3 πr³", note: "A sphere has volume four thirds pi r cubed and surface area 4 pi r squared." },
  { e: "🥣", label: "Hemisphere", tag: "V = 2/3 πr³", note: "A hemisphere is half a sphere. Its volume is two thirds pi r cubed, its curved surface area is 2 pi r squared, and its total surface area is 3 pi r squared." },
], "Solid shapes have a surface area, which we measure in square units, and a volume, which we measure in cubic units.", "These formulas let us find the surface area and the volume of everyday objects.");

export function probabilityBoard(): Frag {
  return { title: "Probability", objects: [T("ttl", 450, 40, "Probability", 34, "accent"), T("f", 450, 110, "P(event) = favourable outcomes ÷ all outcomes", 30, "accent"), T("c", 450, 180, "Toss a coin: P(head) = 1/2", 28, "ink"), T("d", 450, 235, "Roll a die: P(an even number) = 3/6 = 1/2", 28, "ink"), T("s", 450, 300, "Sure event: probability 1", 26, "good"), T("i", 450, 345, "Impossible event (a 7 on a die): probability 0", 26, "warm"), T("r", 450, 410, "Probability always lies between 0 and 1", 28, "accent")], steps: [
    step("Probability measures how likely an event is. It is the number of outcomes we want divided by the number of all possible outcomes.", [show("ttl", 0.05), write("f", 0.5)]),
    step("A coin has two equally likely outcomes, so the probability of a head is one half. A die has six outcomes, three of them even, so the probability of an even number is three sixths, which is also one half.", [write("c", 0.25), write("d", 0.7)]),
    step("An event that is certain has probability 1, and an impossible event has probability 0. So a probability is never less than 0 or more than 1.", [write("s", 0.2), write("i", 0.5), write("r", 0.8)]),
  ] };
}

export function meanMedianMode(): Frag {
  const v = [2, 3, 3, 5, 7], objs: O[] = [T("ttl", 450, 40, "Mean, median and mode", 32, "accent")];
  v.forEach((x, i) => objs.push(R(`b${i}`, 150 + i * 120, 100, 100, 70, "#FFF3D6", "warm", 3, 12), T(`t${i}`, 200 + i * 120, 147, String(x), 34, "ink")));
  objs.push(T("m1", 450, 245, "Mean = (2 + 3 + 3 + 5 + 7) ÷ 5 = 20 ÷ 5 = 4", 28, "good"), T("m2", 450, 305, "Median = the middle value = 3", 28, "water"), T("m3", 450, 365, "Mode = the value that occurs most often = 3", 28, "warm"));
  return { title: "Mean, median and mode", objects: objs, steps: [
    step("Here is a small set of data: 2, 3, 3, 5 and 7. Three measures can describe the centre of the data.", [show("ttl", 0.05), ...v.flatMap((_, i) => [draw(`b${i}`, spread(5, i, 0.2, 0.85)), write(`t${i}`, spread(5, i, 0.22, 0.87))])]),
    step("The mean is the sum of the values divided by how many there are. The sum is 20 and there are 5 values, so the mean is 4.", [write("m1", 0.4)]),
    step("The median is the middle value when the data is in order. The middle of these five numbers is 3.", [pulse("b2", 0.2, undefined, "accent"), write("m2", 0.5)]),
    step("The mode is the value that appears most often. The number 3 appears twice, so the mode is 3.", [pulse("b1", 0.2, undefined, "accent"), pulse("b2", 0.3, undefined, "accent"), write("m3", 0.6)]),
  ] };
}

export function numberSets(): Frag {
  const objs: O[] = [T("ttl", 450, 34, "The number system", 30, "accent"), R("re", 30, 70, 840, 410, "#F3E5F5", "ink", 4, 20), T("lre", 450, 98, "Real numbers", 24, "ink"), R("ra", 60, 115, 500, 345, "#E3F2FD", "accent", 4, 18), T("lra", 310, 143, "Rational numbers (p/q)", 22, "accent"), R("zi", 90, 160, 380, 275, "#C8E6C9", "good", 3, 16), T("lzi", 280, 188, "Integers", 22, "good"), R("wh", 120, 205, 260, 200, "#FFF3D6", "warm", 3, 14), T("lwh", 250, 232, "Whole numbers", 22, "warm"), R("na", 150, 250, 200, 130, "#FFE0B2", "warm", 3, 12), T("lna", 250, 285, "Natural numbers", 22, "ink"), T("n1", 250, 325, "1, 2, 3 ...", 22, "ink"),
    R("ir", 590, 115, 250, 345, "#FFCDD2", "accent", 4, 18), T("lir", 715, 143, "Irrational numbers", 22, "accent"), T("i1", 715, 230, "√2", 30, "ink"), T("i2", 715, 290, "π", 30, "ink"), T("i3", 715, 350, "√3", 30, "ink")];
  return { title: "The number system", objects: objs, steps: [
    step("Numbers are grouped in sets. Start with the natural numbers: 1, 2, 3 and so on.", [show("ttl", 0.05), draw("na", 0.3), write("lna", 0.5), write("n1", 0.7)]),
    step("Add zero and we get the whole numbers. Add the negative numbers as well and we get the integers.", [draw("wh", 0.2), write("lwh", 0.35), draw("zi", 0.55), write("lzi", 0.7)]),
    step("Numbers that can be written as a fraction p over q, with q not zero, are the rational numbers. Every integer is rational.", [draw("ra", 0.25), write("lra", 0.5)]),
    step("Numbers that cannot be written as such a fraction, like the square root of 2 and pi, are irrational. Rational and irrational numbers together make the real numbers.", [draw("ir", 0.2), write("lir", 0.35), write("i1", 0.5), write("i2", 0.6), write("i3", 0.7), draw("re", 0.8), write("lre", 0.9)]),
  ] };
}

export function euclid(): Frag {
  return { title: "Euclid's division", objects: [T("ttl", 450, 40, "Euclid's division lemma", 32, "accent"), T("f", 450, 110, "a = bq + r, where 0 ≤ r < b", 38, "accent"), T("e", 450, 170, "17 = 5 × 3 + 2", 30, "ink"), T("h", 450, 240, "HCF of 225 and 135", 26, "ink"), T("s1", 450, 285, "225 = 135 × 1 + 90", 26, "warm"), T("s2", 450, 325, "135 = 90 × 1 + 45", 26, "warm"), T("s3", 450, 365, "90 = 45 × 2 + 0", 26, "warm"), T("r", 450, 425, "The last divisor is the HCF: 45", 30, "good")], steps: [
    step("Euclid's division lemma says that for two positive numbers a and b, we can write a as b times q plus r, where the remainder r is at least zero and less than b.", [show("ttl", 0.05), write("f", 0.5)]),
    step("For example, 17 equals 5 times 3 plus 2. The remainder 2 is less than 5.", [write("e", 0.4)]),
    step("We can use it again and again to find the HCF. Divide 225 by 135, then 135 by the remainder, and continue until the remainder is zero.", [write("h", 0.15), write("s1", 0.35), write("s2", 0.55), write("s3", 0.75)]),
    step("The divisor at the last step, 45, is the HCF of 225 and 135.", [write("r", 0.4), pulse("s3", 0.2, undefined, "good")]),
  ] };
}

export function venn(): Frag {
  return { title: "Sets and Venn diagrams", objects: [T("ttl", 450, 38, "Sets and Venn diagrams", 32, "accent"), C("a", 340, 250, 140, "#BBDEFB", "accent", 4), C("b", 560, 250, 140, "#FFE0B2", "warm", 4), T("la", 250, 130, "A", 28, "accent"), T("lb", 650, 130, "B", 28, "warm"), T("a1", 270, 245, "1, 2", 28, "ink"), T("m", 450, 245, "3, 4", 28, "ink"), T("b1", 630, 245, "5, 6", 28, "ink"), T("u1", 450, 430, "A ∩ B = {3, 4}      A ∪ B = {1, 2, 3, 4, 5, 6}", 26, "good")], steps: [
    step("A set is a collection of things. Here A is the set 1, 2, 3, 4, and B is the set 3, 4, 5, 6. A Venn diagram shows them as circles.", [draw("a", 0.2), write("la", 0.4), draw("b", 0.55), write("lb", 0.75)]),
    step("The part where the circles overlap holds the elements that are in both sets, 3 and 4. This is the intersection, A intersection B.", [write("a1", 0.15), write("m", 0.35), write("b1", 0.55), pulse("m", 0.7, undefined, "accent")]),
    step("The union, A union B, has all the elements that are in A or in B or in both: 1, 2, 3, 4, 5 and 6.", [write("u1", 0.4)]),
  ] };
}

export function identitySquare(): Frag {
  const x0 = 270, y0 = 80, a = 190, b = 110;
  return { title: "An algebraic identity", objects: [T("ttl", 450, 36, "(a + b)² = a² + 2ab + b²", 32, "accent"), R("s1", x0, y0, a, a, "#BBDEFB", "accent", 3), T("t1", x0 + a / 2, y0 + a / 2 + 10, "a²", 32, "ink"), R("s2", x0 + a, y0, b, a, "#C8E6C9", "good", 3), T("t2", x0 + a + b / 2, y0 + a / 2 + 10, "ab", 30, "ink"), R("s3", x0, y0 + a, a, b, "#C8E6C9", "good", 3), T("t3", x0 + a / 2, y0 + a + b / 2 + 10, "ab", 30, "ink"), R("s4", x0 + a, y0 + a, b, b, "#FFE0B2", "warm", 3), T("t4", x0 + a + b / 2, y0 + a + b / 2 + 10, "b²", 30, "ink"), T("la", x0 + a / 2, y0 - 8, "a", 24, "ink"), T("lb", x0 + a + b / 2, y0 - 8, "b", 24, "ink"), T("ex", 450, 475, "Check: (2 + 3)² = 25 = 4 + 12 + 9", 24, "good")], steps: [
    step("Take a big square whose side is a plus b. Its area is a plus b, all squared.", [show("ttl", 0.05), write("la", 0.3), write("lb", 0.4)]),
    step("Cut it into four parts: a square of side a, a square of side b, and two rectangles with sides a and b.", [draw("s1", 0.1), write("t1", 0.2), draw("s2", 0.35), write("t2", 0.45), draw("s3", 0.55), write("t3", 0.65), draw("s4", 0.8), write("t4", 0.9)]),
    step("Adding the areas of the four parts: a squared, plus two a b, plus b squared. This is the identity. For example, with a equal to 2 and b equal to 3, both sides give 25.", [write("ex", 0.5)]),
  ] };
}

export function linearPairs(): Frag {
  const px = [150, 450, 750], objs: O[] = [T("ttl", 450, 36, "Two linear equations, three possibilities", 28, "accent")];
  px.forEach((x, i) => objs.push(R(`f${i}`, x - 130, 80, 260, 260, undefined, "soft", 3, 12)));
  objs.push(L("a1", 40, 300, 260, 120, "accent", 5), L("a2", 40, 130, 260, 290, "warm", 5), C("pt", 150, 211, 8, "#FF8A65", "good", 3),
    L("b1", 340, 300, 560, 130, "accent", 5), L("b2", 340, 330, 560, 160, "warm", 5),
    L("c1", 640, 300, 860, 120, "accent", 8), L("c2", 640, 300, 860, 120, "warm", 3));
  objs.push(T("n0", px[0]!, 375, "Lines cross", 24, "ink"), T("s0", px[0]!, 410, "one solution", 24, "good"), T("n1", px[1]!, 375, "Parallel lines", 24, "ink"), T("s1", px[1]!, 410, "no solution", 24, "accent"), T("n2", px[2]!, 375, "Same line", 24, "ink"), T("s2", px[2]!, 410, "infinitely many solutions", 22, "warm"));
  return { title: "Pairs of linear equations", objects: objs, steps: [
    step("Each linear equation in two variables is a straight line. When we have two of them, the lines can be placed in three ways.", [show("ttl", 0.05), ...px.map((_, i) => draw(`f${i}`, 0.3 + i * 0.1))]),
    step("If the lines cross, they meet at exactly one point. That point is the one solution.", [draw("a1", 0.15), draw("a2", 0.3), draw("pt", 0.5), write("n0", 0.6), write("s0", 0.75)]),
    step("If the lines are parallel, they never meet, so there is no solution.", [draw("b1", 0.15), draw("b2", 0.3), write("n1", 0.6), write("s1", 0.75)]),
    step("If the two lines are the same line, every point on it is a solution, so there are infinitely many.", [draw("c1", 0.15), draw("c2", 0.3), write("n2", 0.6), write("s2", 0.75)]),
  ] };
}

export function functionMap(): Frag {
  const objs: O[] = [T("ttl", 450, 38, "A function as a mapping", 32, "accent"), C("dom", 250, 250, 120, "#E3F2FD", "accent", 4), C("ran", 650, 250, 120, "#FFF3D6", "warm", 4), T("ld", 250, 110, "Domain", 24, "accent"), T("lr", 650, 110, "Range", 24, "warm"), T("fx", 450, 140, "f(x) = 2x", 30, "good")];
  [1, 2, 3].forEach((x, i) => { const y = 190 + i * 60; objs.push(T(`x${i}`, 250, y + 10, String(x), 30, "ink"), T(`y${i}`, 650, y + 10, String(x * 2), 30, "ink"), AR(`m${i}`, 285, y, 615, y, "accent", 4)); });
  objs.push(T("n", 450, 450, "Each input has exactly one output", 26, "good"));
  return { title: "Relations and functions", objects: objs, steps: [
    step("A relation links the elements of one set to the elements of another. A function is a special relation.", [show("ttl", 0.05), draw("dom", 0.3), write("ld", 0.5), draw("ran", 0.6), write("lr", 0.8)]),
    step("Here the rule is f of x equals 2 x. The input 1 goes to 2, 2 goes to 4, and 3 goes to 6.", [write("fx", 0.1), ...[0, 1, 2].flatMap((i) => [write(`x${i}`, 0.2 + i * 0.2), draw(`m${i}`, 0.3 + i * 0.2), write(`y${i}`, 0.4 + i * 0.2)])]),
    step("In a function, every input in the domain is linked to exactly one output. The set of outputs is the range.", [write("n", 0.4)]),
  ] };
}

export const newtonLaws = (): Frag => notedGrid("Newton's laws of motion", [
  { e: "🛑", label: "First law", tag: "inertia", note: "The first law: an object stays at rest, or keeps moving in a straight line at a constant speed, unless an unbalanced force acts on it. This property is called inertia." },
  { e: "🚀", label: "Second law", tag: "F = m × a", note: "The second law: the force on an object equals its mass times its acceleration. The same force gives a lighter object a bigger acceleration." },
  { e: "🤝", label: "Third law", tag: "action and reaction", note: "The third law: for every action there is an equal and opposite reaction. They act on two different objects." },
], "Isaac Newton described the way things move in three laws.", "These three laws explain the motion of everything from a ball to a rocket.");

export function convexLens(): Frag {
  const ys = [170, 360], objs: O[] = [T("ttl", 450, 36, "A convex lens", 32, "accent"), PA("lens", "M 450 110 C 510 200 510 330 450 420 C 390 330 390 200 450 110", "water", 5, "#E3F2FD"), L("ax", 80, 265, 840, 265, "ink", 3), C("f1", 330, 265, 6, "#FF8A65", "warm", 3), C("f2", 570, 265, 6, "#FF8A65", "warm", 3), T("tf1", 330, 295, "F", 24, "warm"), T("tf2", 570, 295, "F", 24, "warm"), T("tp", 450, 450, "optical centre", 20, "ink")];
  ys.forEach((y, i) => { const ex = 640, ey = y + ((265 - y) / 120) * 190; objs.push(AR(`r${i}`, 120, y, 450, y, "accent", 4), L(`q${i}`, 450, y, ex, Math.round(ey), "accent", 4)); });
  objs.push(AR("rm", 120, 265, 740, 265, "accent", 4), T("tr", 700, 200, "rays meet at the focus", 22, "good", "start"));
  return { title: "A convex lens", objects: objs, steps: [
    step("A convex lens is thicker in the middle than at the edges. The straight line through its centre is the principal axis.", [draw("lens", 0.2, undefined, 1200), draw("ax", 0.6), write("tp", 0.8)]),
    step("Rays of light that come in parallel to the axis bend as they pass through the lens, and all of them meet at one point on the other side. This point is the principal focus, F.", [...ys.map((_, i) => draw(`r${i}`, 0.1 + i * 0.1)), draw("rm", 0.3), ...ys.map((_, i) => draw(`q${i}`, 0.5 + i * 0.1)), draw("f2", 0.75), write("tf2", 0.8), write("tr", 0.9)]),
    step("A convex lens has a focus on each side, at the same distance from the centre. Because it brings parallel rays together, it is called a converging lens.", [draw("f1", 0.2), write("tf1", 0.3), pulse("f2", 0.5, undefined, "accent")]),
  ] };
}

export const fluidsGrid = (): Frag => notedGrid("Pressure in fluids", [
  { e: "📌", label: "Pressure", tag: "P = F ÷ A", note: "Pressure is the force acting on each unit of area. The same force on a smaller area gives a bigger pressure, which is why a sharp nail goes in easily." },
  { e: "🛟", label: "Buoyancy", tag: "upthrust", note: "A fluid pushes up on an object placed in it. This upward force is called upthrust, or buoyant force." },
  { e: "⚖️", label: "Archimedes", tag: "weight of fluid displaced", note: "Archimedes' principle: the upthrust on an object equals the weight of the fluid that it pushes aside." },
  { e: "🏗️", label: "Pascal's law", tag: "equal in all directions", note: "Pascal's law: pressure applied to an enclosed fluid is passed on equally in all directions. A hydraulic lift works this way." },
], "Liquids and gases are called fluids. They press on whatever is in them.", "These ideas explain how ships float and how hydraulic machines work.");

export const siUnits = (): Frag => notedGrid("Measuring with SI units", [
  { e: "📏", label: "Length", tag: "metre (m)", note: "In the SI system, length is measured in metres." },
  { e: "⚖️", label: "Mass", tag: "kilogram (kg)", note: "Mass is measured in kilograms." },
  { e: "⏱️", label: "Time", tag: "second (s)", note: "Time is measured in seconds." },
  { e: "🌡️", label: "Temperature", tag: "kelvin (K)", note: "Temperature is measured in kelvin." },
  { e: "⚡", label: "Current", tag: "ampere (A)", note: "Electric current is measured in amperes." },
], "To compare measurements, everyone must use the same units. The SI system gives one set of units for the whole world.", "Using SI units, scientists everywhere can share their results.");

export function atomModel(): Frag {
  const objs: O[] = [T("ttl", 450, 38, "A carbon atom", 32, "accent"), C("nuc", 450, 265, 34, "#FFCDD2", "accent", 4), T("nt", 450, 272, "6p 6n", 22, "ink"),
    { kind: "orbit", id: "o1", cx: 450, cy: 265, r: 90, period: 6, size: 9, color: "water", ring: true, phase: 0 }, { kind: "orbit", id: "o2", cx: 450, cy: 265, r: 90, period: 6, size: 9, color: "water", phase: 180 },
    ...[0, 90, 180, 270].map((p, i) => ({ kind: "orbit" as const, id: `e${i}`, cx: 450, cy: 265, r: 160, period: 10, size: 9, color: "water", phase: p, ...(i === 0 ? { ring: true } : {}) })),
    T("l1", 760, 130, "nucleus: protons (+) and neutrons", 20, "accent", "end"), T("l2", 760, 170, "electrons (−) in shells", 20, "water", "end"), T("l3", 760, 440, "shells hold 2, 8, ... electrons", 20, "ink", "end"), T("l4", 150, 440, "carbon: 2 + 4 electrons", 20, "ink", "start")];
  return { title: "Atomic structure", objects: objs, steps: [
    step("An atom has a tiny centre, the nucleus, which holds protons and neutrons. Protons carry a positive charge and neutrons carry none. Here is a carbon atom with 6 protons and 6 neutrons.", [show("ttl", 0.05), draw("nuc", 0.3), write("nt", 0.5), write("l1", 0.7)]),
    step("Electrons, which carry a negative charge, move around the nucleus in shells. A carbon atom has 6 electrons, the same number as protons, so the atom is neutral.", [draw("o1", 0.1), draw("o2", 0.2), draw("e0", 0.4), draw("e1", 0.45), draw("e2", 0.5), draw("e3", 0.55), write("l2", 0.7), write("l4", 0.85)]),
    step("The first shell holds up to 2 electrons and the next shell up to 8. Carbon has 2 electrons in the first shell and 4 in the second.", [write("l3", 0.3)]),
  ] };
}

export const bondingGrid = (): Frag => notedGrid("Chemical bonding", [
  { e: "🧂", label: "Ionic bond", tag: "Na⁺ and Cl⁻ attract", note: "In an ionic bond, one atom gives electrons to another. Sodium gives one electron to chlorine, so they become the ions sodium plus and chloride minus, which attract each other. This makes sodium chloride, common salt." },
  { e: "💧", label: "Covalent bond", tag: "H + H share a pair", note: "In a covalent bond, atoms share electrons. Two hydrogen atoms share a pair of electrons to make a hydrogen molecule, H two." },
], "Atoms join together by forming bonds, so that each atom gets a full outer shell of electrons.", "Atoms form ionic bonds by giving and taking electrons, and covalent bonds by sharing them.");

export function periodicGrid(): Frag {
  const objs: O[] = [T("ttl", 450, 34, "The periodic table in outline", 30, "accent")], w = 42, h = 40, x0 = 70, y0 = 80;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 18; c++) { const grp = c === 0 ? "#FFE0B2" : c === 16 ? "#C8E6C9" : c === 17 ? "#BBDEFB" : "#FAFAFA"; objs.push(R(`c${r}x${c}`, x0 + c * w, y0 + r * h, w - 2, h - 2, grp, "soft", 1, 3)); }
  objs.push(T("g1", x0 + w / 2, y0 - 10, "1", 20, "ink"), T("g17", x0 + 16.5 * w, y0 - 10, "17", 20, "ink"), T("g18", x0 + 17.5 * w, y0 - 10, "18", 20, "ink"), T("gl", 450, 380, "Columns are groups (1 to 18)", 24, "ink"), T("pl", 450, 415, "Rows are periods (1 to 7)", 24, "ink"), T("n1", 450, 455, "Group 1: alkali metals · Group 17: halogens · Group 18: noble gases", 20, "warm"));
  return { title: "The periodic table", objects: objs, steps: [
    step("The periodic table arranges the elements in order of their atomic number, in rows and columns.", [show("ttl", 0.05), ...objs.filter((o) => o.id.startsWith("c0x")).map((o, i) => draw(o.id, 0.1 + i * 0.03))]),
    step("The seven horizontal rows are called periods. The eighteen vertical columns are called groups.", [...objs.filter((o) => /^c[1-6]x/.test(o.id)).map((o) => show(o.id, 0.2)), write("gl", 0.5), write("pl", 0.75)]),
    step("Elements in the same group have similar properties. Group 1 holds the alkali metals, group 17 the halogens and group 18 the noble gases.", [write("g1", 0.1), write("g17", 0.2), write("g18", 0.3), write("n1", 0.5)]),
  ] };
}

export function methane(): Frag {
  const hs: [number, number][] = [[450, 120], [450, 410], [270, 265], [630, 265]], objs: O[] = [T("ttl", 450, 36, "Methane, CH₄", 32, "accent")];
  hs.forEach(([x, y], i) => objs.push(L(`k${i}`, 450, 265, x, y, "ink", 5), C(`h${i}`, x, y, 26, "#E3F2FD", "water", 3), T(`ht${i}`, x, y + 9, "H", 26, "ink")));
  objs.push(C("c", 450, 265, 36, "#CFD8DC", "ink", 4), T("ct", 450, 275, "C", 32, "ink"), T("n", 790, 440, "each line = a shared pair of electrons", 20, "ink", "end"));
  return { title: "Methane", objects: objs, steps: [
    step("Carbon has four electrons in its outer shell, so it can form four covalent bonds. In methane, a carbon atom is bonded to four hydrogen atoms.", [show("ttl", 0.05), draw("c", 0.3), write("ct", 0.4)]),
    step("Each line is one covalent bond, a pair of electrons shared between carbon and hydrogen. The formula is C H four.", [...hs.flatMap((_, i) => [draw(`k${i}`, spread(4, i, 0.1, 0.7)), draw(`h${i}`, spread(4, i, 0.15, 0.75)), write(`ht${i}`, spread(4, i, 0.18, 0.78))]), write("n", 0.85)]),
  ] };
}

export const solutionsGrid = (): Frag => notedGrid("Solutions", [
  { e: "🧂", label: "Solute", tag: "what dissolves", note: "The solute is the substance that dissolves, like the salt in salt water." },
  { e: "💧", label: "Solvent", tag: "does the dissolving", note: "The solvent is the substance that does the dissolving, usually the larger part. Water is the solvent in salt water." },
  { e: "🥛", label: "Solution", tag: "an even mixture", note: "A solution is an even mixture of a solute in a solvent. It looks the same throughout." },
  { e: "🧪", label: "Saturated", tag: "cannot hold more", note: "A saturated solution cannot dissolve any more solute at that temperature." },
], "When one substance dissolves completely in another, we get a solution.", "Solute plus solvent make the solution.");

export const reactionTypes = (): Frag => notedGrid("Types of chemical reactions", [
  { e: "🔗", label: "Combination", tag: "2H₂ + O₂ → 2H₂O", note: "In a combination reaction, two or more substances join to form one. Hydrogen and oxygen combine to form water." },
  { e: "✂️", label: "Decomposition", tag: "CaCO₃ → CaO + CO₂", note: "In a decomposition reaction, one substance breaks into two or more. Calcium carbonate breaks into calcium oxide and carbon dioxide on heating." },
  { e: "🔄", label: "Displacement", tag: "Fe + CuSO₄ → FeSO₄ + Cu", note: "In a displacement reaction, a more reactive element takes the place of a less reactive one in a compound. Iron displaces copper from copper sulphate solution." },
  { e: "🔀", label: "Double displacement", tag: "AgNO₃ + NaCl → AgCl + NaNO₃", note: "In a double displacement reaction, two compounds swap their partners. Silver nitrate and sodium chloride form silver chloride, a white solid, and sodium nitrate." },
], "In a chemical reaction, new substances are made. There are several types.", "A chemical equation shows what goes in and what comes out.");

export const nuclearGrid = (): Frag => notedGrid("Nuclear reactions", [
  { e: "💥", label: "Fission", tag: "a heavy nucleus splits", note: "In nuclear fission, a heavy nucleus such as uranium splits into two lighter nuclei after being hit by a neutron, and a great deal of energy is released." },
  { e: "☀️", label: "Fusion", tag: "light nuclei join", note: "In nuclear fusion, two light nuclei such as hydrogen join to form a heavier nucleus, and energy is released. This is how the Sun makes its energy." },
], "The nucleus of an atom holds a huge amount of energy. It can be released in two ways.", "Nuclear reactors use fission to make electricity.");

export function neuron(): Frag {
  return { title: "A neuron", objects: [T("ttl", 450, 36, "A neuron", 32, "accent"), L("d1", 130, 160, 250, 235, "ink", 4), L("d2", 120, 250, 250, 250, "ink", 4), L("d3", 130, 340, 250, 270, "ink", 4), C("cb", 300, 250, 55, "#FFE0B2", "warm", 4), C("nu", 300, 250, 18, "#FF8A65", "warm", 3), L("ax", 355, 250, 700, 250, "ink", 6), R("tm", 700, 225, 70, 50, "#BBDEFB", "water", 3, 8), T("l1", 140, 130, "dendrites", 22, "accent", "middle"), T("l2", 300, 340, "cell body (nucleus)", 22, "warm"), T("l3", 530, 225, "axon", 22, "good"), T("l4", 735, 305, "axon terminal", 22, "water"), AR("dir", 420, 400, 640, 400, "accent", 5), T("l5", 530, 435, "the message travels this way", 20, "ink")], steps: [
    step("The nervous system is made of nerve cells called neurons. Each neuron has a cell body, which contains the nucleus.", [draw("cb", 0.2), draw("nu", 0.4), write("l2", 0.6)]),
    step("Short branches called dendrites receive messages from other cells and pass them to the cell body.", [draw("d1", 0.2), draw("d2", 0.3), draw("d3", 0.4), write("l1", 0.6)]),
    step("A long fibre, the axon, carries the message away from the cell body to the axon terminal, which passes it to the next cell.", [draw("ax", 0.2), write("l3", 0.4), draw("tm", 0.55), write("l4", 0.65), draw("dir", 0.75), write("l5", 0.85)]),
  ] };
}

export function photosynthesis(): Frag {
  return { title: "Photosynthesis", objects: [T("ttl", 450, 36, "Photosynthesis", 32, "accent"), C("sun", 450, 100, 30, "#FFEE58", "sun", 4), T("ls", 540, 108, "light", 22, "sun", "start"), T("a", 150, 250, "6CO₂", 32, "ink"), T("p1", 230, 250, "+", 32, "ink"), T("b", 320, 250, "6H₂O", 32, "ink"), AR("ar", 400, 250, 500, 250, "good", 6), T("c", 600, 250, "C₆H₁₂O₆", 32, "good"), T("p2", 690, 250, "+", 32, "ink"), T("d", 770, 250, "6O₂", 32, "ink"), T("la", 150, 300, "carbon dioxide", 20, "ink"), T("lb", 320, 300, "water", 20, "ink"), T("lc", 600, 300, "glucose (food)", 20, "good"), T("ld", 770, 300, "oxygen", 20, "ink"), T("ch", 450, 380, "in the green chlorophyll of the leaf", 24, "good")], steps: [
    step("Green plants make their own food by photosynthesis. They need light from the Sun.", [draw("sun", 0.2), write("ls", 0.4)]),
    step("The leaves take in carbon dioxide from the air, and the roots take in water from the soil.", [write("a", 0.15), write("la", 0.25), write("p1", 0.35), write("b", 0.45), write("lb", 0.55)]),
    step("Using light energy, which the green pigment chlorophyll traps, the plant changes them into glucose, its food, and releases oxygen.", [draw("ar", 0.15), write("c", 0.3), write("lc", 0.4), write("p2", 0.5), write("d", 0.6), write("ld", 0.7), write("ch", 0.85)]),
  ] };
}

export function punnett(): Frag {
  const x0 = 330, y0 = 150, s = 100, cells = [["TT", "Tt"], ["Tt", "tt"]], objs: O[] = [T("ttl", 450, 36, "A monohybrid cross: Tt × Tt", 30, "accent"), T("pa", 450, 100, "Gametes of one parent", 22, "ink"), T("pb", 200, 255, "Gametes of the other", 20, "ink")];
  ["T", "t"].forEach((g, i) => objs.push(T(`ga${i}`, x0 + s / 2 + i * s, y0 - 10, g, 30, "accent"), T(`gb${i}`, x0 - 30, y0 + s / 2 + 10 + i * s, g, 30, "accent")));
  cells.forEach((r, i) => r.forEach((v, j) => objs.push(R(`c${i}${j}`, x0 + j * s, y0 + i * s, s, s, v === "tt" ? "#FFE0B2" : "#C8E6C9", "ink", 3), T(`v${i}${j}`, x0 + j * s + s / 2, y0 + i * s + s / 2 + 12, v, 34, "ink"))));
  objs.push(T("r1", 450, 400, "Genotype ratio TT : Tt : tt = 1 : 2 : 1", 24, "good"), T("r2", 450, 440, "Tall (TT, Tt) : dwarf (tt) = 3 : 1", 24, "warm"));
  return { title: "Mendel's monohybrid cross", objects: objs, steps: [
    step("Mendel crossed pea plants that had the gene T for tall and t for dwarf. Each parent here is Tt, and it passes on either T or t in its gametes.", [show("ttl", 0.05), write("pa", 0.3), ...[0, 1].map((i) => write(`ga${i}`, 0.5 + i * 0.1)), write("pb", 0.7), ...[0, 1].map((i) => write(`gb${i}`, 0.75 + i * 0.05))]),
    step("A Punnett square shows every possible pairing. We get T T, T t, T t and t t.", cells.flatMap((r, i) => r.flatMap((_, j) => [draw(`c${i}${j}`, spread(4, i * 2 + j, 0.1, 0.8)), write(`v${i}${j}`, spread(4, i * 2 + j, 0.12, 0.82))]))),
    step("The genotypes come in the ratio 1 to 2 to 1. Because T is dominant over t, three offspring are tall and one is dwarf. This 3 to 1 ratio is the phenotype ratio.", [write("r1", 0.2), write("r2", 0.6)]),
  ] };
}

export const microbesGrid = (): Frag => notedGrid("The world of microbes", [
  { e: "🦠", label: "Bacteria", tag: "single-celled", note: "Bacteria are tiny single-celled organisms. Some are helpful, like those that turn milk into curd, and some cause diseases." },
  { e: "🧬", label: "Viruses", tag: "tinier still", note: "Viruses are much smaller than bacteria. They can multiply only inside the cells of a living thing." },
  { e: "🍄", label: "Fungi", tag: "yeast, moulds", note: "Fungi include yeast, moulds and mushrooms. Yeast is used in making bread." },
  { e: "🔬", label: "Protozoa", tag: "single-celled, animal-like", note: "Protozoa are single-celled organisms that live in water and in other living things. Amoeba is an example, and the malaria parasite is a protozoan." },
  { e: "🌿", label: "Algae", tag: "make their own food", note: "Algae are simple green organisms that live in water and make their food by photosynthesis." },
], "Microbes are living things so small that we need a microscope to see them. There are several groups.", "Many microbes are useful, and a few cause disease.");

export function atmosphereLayers(): Frag {
  const L5 = [["Exosphere", "merges into space"], ["Thermosphere", "very thin air"], ["Mesosphere", "meteors burn up"], ["Stratosphere", "ozone layer"], ["Troposphere", "weather happens here"]], cols = ["#E8EAF6", "#D1C4E9", "#B3E5FC", "#B2DFDB", "#C8E6C9"], objs: O[] = [T("ttl", 450, 34, "Layers of the atmosphere", 30, "accent")];
  L5.forEach(([a, b], i) => objs.push(R(`r${i}`, 150, 70 + i * 76, 600, 70, cols[i]!, "soft", 2, 8), T(`a${i}`, 180, 112 + i * 76, a!, 26, "ink", "start"), T(`b${i}`, 730, 112 + i * 76, b!, 20, "warm", "end")));
  return { title: "The atmosphere", objects: objs, steps: [
    step("The atmosphere is the blanket of air around the Earth. It has five layers, one above the other.", [show("ttl", 0.05)]),
    step("We start with the lowest layer, the troposphere. This is where we live, and where clouds, rain and weather happen.", [draw("r4", 0.2), write("a4", 0.4), write("b4", 0.6)]),
    step("Above it is the stratosphere, which holds the ozone layer. Ozone protects us from the Sun's harmful ultraviolet rays.", [draw("r3", 0.2), write("a3", 0.4), write("b3", 0.6)]),
    step("Next comes the mesosphere, where most meteors burn up, then the thermosphere with very thin air, and last the exosphere, which fades into space.", [draw("r2", 0.1), write("a2", 0.2), write("b2", 0.25), draw("r1", 0.4), write("a1", 0.5), write("b1", 0.55), draw("r0", 0.7), write("a0", 0.8), write("b0", 0.85)]),
  ] };
}

export function earthLayers(): Frag {
  return { title: "Inside the Earth", objects: [T("ttl", 450, 34, "Layers inside the Earth", 30, "accent"), C("crust", 330, 265, 190, "#D7CCC8", "earth", 4), C("mantle", 330, 265, 160, "#FFCC80", "warm", 4), C("oc", 330, 265, 100, "#FF8A65", "accent", 4), C("ic", 330, 265, 48, "#FFEE58", "sun", 4),
    T("l1", 640, 120, "Crust: the thin outer skin", 22, "earth", "start"), T("l2", 640, 190, "Mantle: hot, thick, rocky layer", 22, "warm", "start"), T("l3", 640, 260, "Outer core: liquid metal", 22, "accent", "start"), T("l4", 640, 330, "Inner core: solid metal", 22, "sun", "start")], steps: [
    step("The Earth is made of layers, like an onion. We cannot dig into them, but scientists study earthquake waves to learn about them.", [show("ttl", 0.05)]),
    step("On the outside is the crust, a thin, hard layer. We live on it.", [draw("crust", 0.2), write("l1", 0.5)]),
    step("Below it is the mantle, a thick layer of hot rock.", [draw("mantle", 0.2), write("l2", 0.5)]),
    step("At the centre is the core. The outer core is liquid metal, mostly iron and nickel, and the inner core is solid.", [draw("oc", 0.15), write("l3", 0.35), draw("ic", 0.55), write("l4", 0.75)]),
  ] };
}

export const hazardsGrid = (): Frag => notedGrid("Natural hazards", [
  { e: "🌍", label: "Earthquake", tag: "drop, cover, hold on", note: "In an earthquake, drop down, take cover under a strong table, and hold on until the shaking stops." },
  { e: "🌊", label: "Flood", tag: "move to higher ground", note: "In a flood, move to higher ground and keep away from flowing water." },
  { e: "🌀", label: "Cyclone", tag: "stay indoors", note: "In a cyclone, stay indoors, away from windows, and listen to official warnings." },
  { e: "🏜️", label: "Drought", tag: "save water", note: "A drought is a long time without enough rain. Saving water is very important then." },
  { e: "⛰️", label: "Landslide", tag: "slopes give way", note: "In a landslide, soil and rocks slide down a slope. Move away from the path of the slide." },
  { e: "🌋", label: "Tsunami", tag: "move inland and up", note: "A tsunami is a series of huge sea waves caused by an undersea earthquake. Move inland and to high ground." },
], "A natural event that harms people and property is a natural hazard. Knowing what to do saves lives.", "Being prepared before a disaster is the best protection.");

export const taxesGrid = (): Frag => notedGrid("Taxes", [
  { e: "💼", label: "Direct tax", tag: "paid by the person", note: "A direct tax is paid directly to the government by the person or company it is charged on. Income tax is an example." },
  { e: "🛒", label: "Indirect tax", tag: "included in the price", note: "An indirect tax is included in the price of goods and services. Goods and Services Tax, GST, is an example." },
], "Governments collect taxes to pay for roads, schools, hospitals and other public services.", "The money from taxes is spent for the good of everyone.");

export const ancientCivs = (): Frag => notedGrid("River valley civilisations", [
  { e: "🌾", label: "Mesopotamia", tag: "Tigris and Euphrates", note: "Mesopotamia grew between the rivers Tigris and Euphrates." },
  { e: "🔺", label: "Egypt", tag: "the Nile", note: "Egyptian civilisation grew along the river Nile." },
  { e: "🏙️", label: "Indus Valley", tag: "the Indus", note: "The Indus Valley civilisation grew along the river Indus and its neighbours." },
  { e: "🏯", label: "China", tag: "the Yellow River", note: "Chinese civilisation grew along the Yellow River, also called the Huang He." },
], "Many early civilisations grew up beside great rivers, where the land was fertile and water was easy to get.", "Rivers gave early people water, food and a way to travel.");
