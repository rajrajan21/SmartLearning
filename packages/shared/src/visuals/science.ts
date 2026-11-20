import { AR, C, draw, fill, L, PA, PO, pulse, R, show, spread, step, T, write, type Frag, type O } from "./kit.js";

export interface Node { e: string; label: string; say?: string }

/** a chain of things that lead to one another with arrows: food chains, life cycles, digestion, recycling ... */
export function chain(title: string, nodes: Node[], intro: string, outro: string, loop = false): Frag {
  const n = nodes.length, objs: O[] = [T("ttl", 450, 44, title, 34, "accent")];
  const pos = (i: number): [number, number] => {
    if (loop) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [450 + 270 * Math.cos(a), 262 + 122 * Math.sin(a)]; }
    const per = n <= 4 ? n : Math.ceil(n / 2), row = Math.floor(i / per), col = i % per, gap = 800 / per; return [50 + gap / 2 + col * gap, n <= 4 ? 260 : 170 + row * 200];
  };
  nodes.forEach((nd, i) => { const [x, y] = pos(i); objs.push(C(`b${i}`, x, y, 52, "#FFF3D6", "warm", 4), T(`e${i}`, x, y + 20, nd.e, 56, "ink"), T(`l${i}`, x, y + 84, nd.label, 22, "ink")); });
  for (let i = 0; i < n - (loop ? 0 : 1); i++) { const [x1, y1] = pos(i), [x2, y2] = pos((i + 1) % n), dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy); if (d < 120) continue; objs.push(AR(`a${i}`, x1 + (dx / d) * 62, y1 + (dy / d) * 62, x2 - (dx / d) * 62, y2 - (dy / d) * 62, "accent", 5)); }
  const steps = [step(intro, [show("ttl", 0.1), draw("b0", 0.4), show("e0", 0.45), write("l0", 0.5)])];
  for (let i = 1; i < n; i++) steps.push(step(nodes[i]!.say ?? `Next comes ${nodes[i]!.label}.`, [...(objs.some((o) => o.id === `a${i - 1}`) ? [draw(`a${i - 1}`, 0.15)] : []), draw(`b${i}`, 0.35), show(`e${i}`, 0.4), write(`l${i}`, 0.5)]));
  steps.push(step(outro, [...(loop && objs.some((o) => o.id === `a${n - 1}`) ? [draw(`a${n - 1}`, 0.2)] : []), pulse("b0", 0.3, undefined, "good")]));
  return { title, objects: objs, steps };
}

export const foodChain = (kind: "land" | "pond" | "grass" = "grass") => kind === "pond"
  ? chain("A pond food chain", [{ e: "🌿", label: "Water plant", say: "" }, { e: "🐛", label: "Insect" }, { e: "🐟", label: "Fish" }, { e: "🦢", label: "Bird" }], "Every living thing needs food. A food chain shows who eats whom. It starts with a green plant, which makes its own food using sunlight.", "The arrows show the way energy travels: from the plant, to the insect, to the fish, to the bird.")
  : chain("A food chain", [{ e: "🌱", label: "Grass" }, { e: "🦌", label: "Deer" }, { e: "🐅", label: "Tiger" }], "Every living thing needs food. A food chain shows who eats whom. It starts with a green plant, the producer, which makes its own food using sunlight.", "The arrows show how energy moves: from the grass to the deer to the tiger. Plants are producers and animals are consumers.");

export const lifeCycle = (kind: "butterfly" | "frog" | "plant" | "chicken" | "mosquito" = "butterfly") => ({
  butterfly: () => chain("Life cycle of a butterfly", [{ e: "🥚", label: "Egg", say: "" }, { e: "🐛", label: "Caterpillar", say: "The egg hatches into a caterpillar, which eats leaves and grows." }, { e: "🛌", label: "Pupa", say: "The caterpillar makes a hard shell and rests inside it. This stage is called the pupa." }, { e: "🦋", label: "Butterfly", say: "A butterfly comes out of the shell and flies away." }], "A butterfly begins life as a tiny egg laid on a leaf.", "Then the butterfly lays new eggs, and the cycle goes round again. That is why it is called a life cycle.", true),
  frog: () => chain("Life cycle of a frog", [{ e: "🥚", label: "Eggs" }, { e: "🐟", label: "Tadpole", say: "The eggs hatch into tadpoles that swim with a tail and breathe with gills." }, { e: "🐸", label: "Young frog", say: "The tadpole grows legs and its tail gets shorter." }, { e: "🐸", label: "Adult frog", say: "At last it becomes an adult frog that can live on land and in water." }], "A frog starts as jelly-like eggs laid in water.", "The adult frog lays eggs in water, and the cycle starts again.", true),
  plant: () => chain("Life cycle of a plant", [{ e: "🌰", label: "Seed" }, { e: "🌱", label: "Seedling", say: "With water, warmth and air the seed germinates, and a tiny shoot comes out." }, { e: "🌿", label: "Young plant", say: "The shoot grows roots, a stem and leaves." }, { e: "🌻", label: "Flower", say: "The plant flowers, and the flower makes new seeds." }], "A plant begins as a seed.", "The new seeds fall to the ground and can grow into new plants.", true),
  chicken: () => chain("Life cycle of a hen", [{ e: "🥚", label: "Egg" }, { e: "🐣", label: "Chick", say: "After about three weeks, a chick hatches from the egg." }, { e: "🐔", label: "Hen", say: "The chick grows feathers and becomes a hen or a cock." }], "A hen lays eggs.", "The hen lays new eggs and the cycle continues.", true),
  mosquito: () => chain("Life cycle of a mosquito", [{ e: "🥚", label: "Eggs" }, { e: "🪱", label: "Larva", say: "The eggs hatch in still water into wriggling larvae." }, { e: "🫧", label: "Pupa", say: "The larva changes into a pupa that floats on the water." }, { e: "🦟", label: "Mosquito", say: "An adult mosquito comes out and flies away. Removing stagnant water stops this cycle." }], "A mosquito lays its eggs on still water.", "That is why we should never leave water standing in pots and tyres.", true),
}[kind]());

export const processChain = chain;

/** the water cycle with moving drops */
export function waterCycle(): Frag {
  return { title: "The water cycle", objects: [
    T("ttl", 450, 44, "The water cycle", 34, "accent"), T("sun", 790, 100, "☀️", 80), R("sea", 40, 380, 400, 90, "#90CAF9", "water", 3, 6), T("sl", 240, 430, "Sea", 28, "ink"),
    PO("mt", [[470, 470], [640, 230], [810, 470]], "#BCAAA4", "earth", 4), T("cl", 330, 150, "☁️", 120), T("cl2", 430, 130, "☁️", 90),
    { kind: "flow", id: "ev", x: 260, y: 370, len: 190, count: 6, speed: 0.5, spread: 140, size: 6, up: true, color: "water" }, { kind: "flow", id: "rn", x: 340, y: 200, len: 170, count: 9, speed: 0.9, spread: 120, size: 7, color: "water" },
    AR("a1", 140, 360, 220, 220, "warm", 4), T("t1", 30, 330, "Evaporation", 24, "warm", "start"), T("t2", 30, 70, "Condensation", 24, "accent", "start"), T("t3", 520, 270, "Rain", 28, "water", "start"),
  ], steps: [
    step("Water is always on the move. The Sun warms the sea, rivers and ponds.", [show("sun", 0.1), draw("sea", 0.3), write("sl", 0.4)]),
    step("The warm water turns into invisible water vapour and rises into the air. This is called evaporation.", [draw("a1", 0.15), show("ev", 0.2), write("t1", undefined, "evaporation")]),
    step("High up, the air is cold. The vapour cools and becomes tiny drops of water that make clouds. This is called condensation.", [show("cl", 0.3), show("cl2", 0.4), write("t2", undefined, "condensation")]),
    step("When the clouds hold too much water, it falls down as rain. Then the water runs back to the rivers and the sea, and the cycle begins again.", [draw("mt", 0.1), show("rn", 0.2), write("t3", undefined, "rain")]),
  ] };
}

/** the Sun with planets going round it */
export function solarSystem(planets = 8): Frag {
  const P = [["Mercury", 46, 5, "#B0A090", 4.5], ["Venus", 68, 9, "#E8C170", 6], ["Earth", 92, 12, "#4FA3E0", 6.5], ["Mars", 114, 16, "#E0623C", 5], ["Jupiter", 152, 26, "#D9A86C", 13], ["Saturn", 188, 36, "#E6D29A", 11], ["Uranus", 218, 48, "#8EDCE6", 8], ["Neptune", 246, 60, "#4F6FE0", 8]] as const;
  const objs: O[] = [T("ttl", 450, 40, "Our Solar System", 34, "accent"), C("su", 450, 255, 28, "#FFCA28", "sun", 4)];
  P.slice(0, planets).forEach(([nm, r, per, c, sz], i) => objs.push({ kind: "orbit", id: `o${i}`, cx: 450, cy: 255, r: r * 1.4, period: per, size: Math.max(5, sz * 0.9), color: c, tilt: 0.56, phase: i * 47 }, T(`n${i}`, 30 + i * 108, 484, `● ${nm}`, 16, "ink", "start")));
  const st = [step("The Sun is a star at the centre of our Solar System. It gives us light and heat.", [draw("su", 0.4)]),
    step("Planets travel round the Sun in paths called orbits. The planets close to the Sun take only a short time to go round, and the far ones take very long.", P.slice(0, planets).map((_, i) => draw(`o${i}`, spread(planets, i, 0.1, 0.8)))),
    step("From the Sun outwards the planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. Earth is the only one we know where living things are found.", P.slice(0, planets).map((_, i) => write(`n${i}`, spread(planets, i, 0.05, 0.9))))];
  return { title: "Our Solar System", objects: objs, steps: st };
}

/** the Moon going round the Earth */
export function earthMoon(): Frag {
  return { title: "Earth and Moon", objects: [T("ttl", 450, 44, "The Moon goes round the Earth", 34, "accent"), C("er", 450, 265, 60, "#4FA3E0", "water", 4), T("eT", 450, 275, "🌍", 70), { kind: "orbit", id: "mn", cx: 450, cy: 265, r: 170, period: 10, size: 16, emoji: "🌕", tilt: 0.6 }, T("sy", 450, 460, "About one month for one trip", 26, "soft")], steps: [
    step("The Earth is our home. It is a ball of rock, with oceans and air.", [draw("er", 0.4), show("eT", 0.5)]),
    step("The Moon goes round the Earth. We say the Moon is a satellite of the Earth. It takes about one month to go all the way round.", [draw("mn", 0.2), write("sy", 0.6)]),
    step("The Moon does not make its own light. We see it shine because it reflects the light of the Sun.", [pulse("mn", 0.3, undefined, "sun")]),
  ] };
}

/** day and night: Earth spinning in sunlight */
export function dayNight(): Frag {
  return { title: "Day and night", objects: [T("ttl", 450, 44, "Day and night", 34, "accent"), T("su", 130, 270, "☀️", 110), ...[0, 1, 2, 3, 4].map((i) => L(`ry${i}`, 210, 210 + i * 30, 360, 210 + i * 30, "sun", 3)), C("er", 520, 270, 130, "#4FA3E0", "water", 4), SE_half("nt"), { kind: "orbit", id: "sp", cx: 520, cy: 270, r: 130, period: 12, size: 12, emoji: "📍", tilt: 1, ring: false }, T("dl", 455, 270, "Day", 30, "ink"), T("nl", 590, 270, "Night", 30, "#FFFFFF"), AR("ro", 520, 108, 600, 108, "warm", 4), T("rt", 520, 90, "Earth spins", 22, "warm")], steps: [
    step("The Sun is a star that gives us light. Only the half of the Earth that faces the Sun gets light, and there it is day.", [show("su", 0.1), ...[0, 1, 2, 3, 4].map((i) => draw(`ry${i}`, 0.2 + i * 0.05)), draw("er", 0.5), write("dl", 0.8)]),
    step("The other half faces away from the Sun, so it is dark. There it is night.", [draw("nt", 0.2), write("nl", 0.5)]),
    step("The Earth spins round like a top, once in about twenty-four hours. As it spins, a place on Earth goes into the light, then into the dark, and day and night follow each other.", [draw("ro", 0.1), write("rt", 0.2), show("sp", 0.3)]),
  ] };
}
const SE_half = (id: string): O => ({ kind: "sector", id, cx: 520, cy: 270, r: 126, from: 0, to: 180, fill: "#1B2A4A", stroke: "ink", width: 2 });

/** seasons: the tilted Earth on its path round the Sun */
export function seasons(): Frag {
  return { title: "Seasons", objects: [T("ttl", 450, 44, "Why we have seasons", 34, "accent"), C("su", 450, 265, 38, "#FFCA28", "sun", 4), { kind: "orbit", id: "er", cx: 450, cy: 265, r: 170, period: 14, size: 15, emoji: "🌍", tilt: 0.55 }, T("t1", 450, 470, "One trip round the Sun takes one year", 24, "soft")], steps: [
    step("The Earth goes round the Sun once every year.", [draw("su", 0.2), draw("er", 0.4)]),
    step("The Earth is tilted a little. As it travels, sometimes our part leans towards the Sun and gets more heat, and sometimes it leans away and gets less.", [pulse("er", 0.2, undefined, "warm"), write("t1", 0.7)]),
    step("This change in heat gives us the seasons: summer, rainy season, autumn, winter and spring.", [show("ttl", 0.1)]),
  ] };
}

/** particles in solid, liquid and gas */
export function states(): Frag {
  const objs: O[] = [T("ttl", 450, 44, "Three states of matter", 34, "accent")], box = [["Solid", 40, "#BBDEFB"], ["Liquid", 320, "#B3E5FC"], ["Gas", 600, "#E1F5FE"]] as const;
  box.forEach(([nm, x, c]) => objs.push(R(`bx${nm}`, x, 110, 260, 280, c, "ink", 4, 10), T(`t${nm}`, x + 130, 430, nm, 32, "accent")));
  for (let i = 0; i < 16; i++) objs.push(C(`s${i}`, 80 + (i % 4) * 52, 180 + Math.floor(i / 4) * 52, 18, "#1E88E5", "ink", 2));
  for (let i = 0; i < 12; i++) objs.push(C(`l${i}`, 370 + (i % 4) * 46 + ((i * 17) % 9), 270 + Math.floor(i / 4) * 40 + ((i * 11) % 7), 17, "#29B6F6", "ink", 2));
  for (let i = 0; i < 8; i++) objs.push({ kind: "orbit", id: `g${i}`, cx: 730, cy: 250, r: 20 + (i * 17) % 70, period: 2 + (i % 4), size: 13, color: "#81D4FA", tilt: 0.9, phase: i * 45, ring: false });
  return { title: "Three states of matter", objects: objs, steps: [
    step("Everything around us is matter, and matter comes in three states: solid, liquid and gas.", ["Solid", "Liquid", "Gas"].flatMap((n, i) => [draw(`bx${n}`, 0.2 + i * 0.2), write(`t${n}`, 0.25 + i * 0.2)])),
    step("In a solid, the tiny particles are packed tightly in fixed places. So a solid keeps its shape, like a stone or a book.", Array.from({ length: 16 }, (_, i) => show(`s${i}`, spread(16, i, 0.3, 0.9)))),
    step("In a liquid the particles are close but can slide past each other. So a liquid flows and takes the shape of its container. In a gas, the particles are far apart and move about freely in every direction, so a gas fills the whole space.", [...Array.from({ length: 12 }, (_, i) => show(`l${i}`, spread(12, i, 0.05, 0.4))), ...Array.from({ length: 8 }, (_, i) => show(`g${i}`, spread(8, i, 0.5, 0.9)))]),
  ] };
}

/** a push or a pull, with friction */
export function forces(): Frag {
  return { title: "Force", objects: [T("ttl", 450, 44, "Push and pull", 34, "accent"), R("bx", 380, 230, 140, 110, "#FFCC80", "warm", 5, 8), L("gr", 80, 345, 820, 345, "earth", 6), T("bt", 450, 295, "Box", 30, "ink"), AR("pu", 140, 285, 370, 285, "accent", 9), T("pl", 255, 255, "Push", 30, "accent"), AR("pl2", 760, 285, 530, 285, "good", 9), T("pl3", 645, 255, "Pull", 30, "good"), AR("fr", 520, 372, 400, 372, "warm", 7), T("ft", 460, 410, "Friction", 26, "warm")], steps: [
    step("A force is a push or a pull. A force can make things move, stop, or change direction.", [draw("gr", 0.2), draw("bx", 0.4), write("bt", 0.5)]),
    step("Here we push the box from the left. The bigger the push, the faster it moves. And here we pull it with a rope from the right.", [draw("pu", undefined, "push"), write("pl", undefined, "push"), draw("pl2", undefined, "pull"), write("pl3", undefined, "pull")]),
    step("When the box slides, the rough ground rubs against it and slows it down. This force is called friction, and it acts in the opposite direction.", [draw("fr", 0.2), write("ft", 0.4)]),
  ] };
}

/** light travelling in straight lines and casting a shadow */
export function shadow(): Frag {
  return { title: "Light and shadow", objects: [T("ttl", 450, 44, "Light travels in straight lines", 32, "accent"), T("lm", 110, 250, "💡", 90), ...[-1, 0, 1].map((k, i) => AR(`r${i}`, 170, 250 + k * 15, 430, 250 + k * 15 + (k * 0), "sun", 4)), R("ob", 440, 190, 50, 120, "#8D6E63", "ink", 4, 6), T("obt", 465, 335, "Opaque object", 20, "ink"), R("sc", 780, 130, 24, 260, "#ECEFF1", "ink", 3), PO("sh", [[784, 190], [800, 190], [800, 310], [784, 310]], "#37474F", "ink", 2), T("sht", 700, 430, "Shadow", 30, "ink")], steps: [
    step("Light travels in straight lines. It goes out from a bright source, like a lamp, in every direction.", [show("lm", 0.1), ...[0, 1, 2].map((i) => draw(`r${i}`, 0.3 + i * 0.1))]),
    step("When light meets an opaque object, one that light cannot pass through, the light is blocked.", [draw("ob", 0.3), write("obt", 0.6)]),
    step("The dark area behind the object, where the light cannot reach, is the shadow.", [draw("sc", 0.1), draw("sh", 0.4), write("sht", 0.6)]),
  ] };
}

/** a sound wave: pitch and loudness */
export function sound(): Frag {
  return { title: "Sound", objects: [T("ttl", 450, 44, "Sound is a vibration", 34, "accent"), T("sp", 100, 250, "🔔", 90), { kind: "wave", id: "w1", x: 180, y: 250, len: 640, amp: 30, cycles: 5, speed: 0.8, color: "accent", width: 5 }, T("lb", 500, 340, "A soft, low sound", 28, "soft"), { kind: "wave", id: "w2", x: 180, y: 250, len: 640, amp: 55, cycles: 12, speed: 1.4, color: "warm", width: 5 }, T("lb2", 500, 430, "A loud, high sound", 28, "warm")], steps: [
    step("Sound is made when something vibrates, that is, moves quickly to and fro. A bell, a drum and our own throat all vibrate when they make a sound.", [show("sp", 0.1)]),
    step("The vibration travels through the air as waves, until it reaches our ears. Here is a gentle wave. The waves are far apart, so the sound is low.", [show("w1", 0.3), write("lb", 0.7)]),
    step("A bigger vibration makes a louder sound, and faster vibrations make a higher sound. See how the waves are taller and closer now.", [show("w2", 0.2), write("lb2", 0.6)]),
  ] };
}

/** a simple electric circuit with a lit bulb */
export function circuit(): Frag {
  return { title: "An electric circuit", objects: [T("ttl", 450, 44, "A simple electric circuit", 34, "accent"), R("bat", 170, 220, 70, 60, "#EF9A9A", "warm", 5, 6), T("bt", 205, 258, "🔋", 38), T("bl", 120, 258, "Cell", 22, "ink"), PA("w1", "M 205 220 L 205 130 L 450 130", "ink", 6), PA("w2", "M 450 130 L 700 130 L 700 220", "ink", 6), PA("w3", "M 700 340 L 700 400 L 205 400 L 205 280", "ink", 6), C("bu", 700, 280, 50, "#FFF9C4", "sun", 5), T("bu2", 700, 295, "💡", 56), T("bn", 790, 285, "Bulb", 22, "ink", "start"), R("sw", 400, 112, 100, 36, undefined, "soft", 3, 6), T("swt", 450, 100, "Switch", 22, "soft"), AR("d1", 260, 130, 340, 130, "sun", 5), AR("d2", 700, 150, 700, 200, "sun", 5), AR("d3", 640, 400, 560, 400, "sun", 5), AR("d4", 205, 360, 205, 310, "sun", 5)], steps: [
    step("An electric circuit is a closed path through which electricity can flow. It needs a cell, wires and a bulb.", [draw("bat", 0.2), show("bt", 0.3), write("bl", 0.4), draw("bu", 0.6), show("bu2", 0.7), write("bn", 0.8)]),
    step("The wires join the cell to the bulb and back again, making a complete loop.", [draw("w1", 0.1), draw("w2", 0.35), draw("w3", 0.6)]),
    step("When the switch is closed the circuit is complete, and electricity flows round it. The bulb glows. If the loop is broken anywhere, the bulb goes out.", [draw("sw", 0.1), write("swt", 0.15), fill("bu", "sun", 0.5), draw("d1", 0.55), draw("d2", 0.65), draw("d3", 0.75), draw("d4", 0.85)]),
  ] };
}

/** bar magnet: poles and the rule for attract and repel */
export function magnetPoles(): Frag {
  return { title: "Magnets", objects: [T("ttl", 450, 44, "Poles of a magnet", 34, "accent"), R("mn", 250, 200, 400, 90, undefined, "ink", 5, 6), R("mnN", 250, 200, 200, 90, "#EF5350", "ink", 5, 6), R("mnS", 450, 200, 200, 90, "#42A5F5", "ink", 5, 6), T("nn", 350, 260, "N", 60, "ink"), T("ss", 550, 260, "S", 60, "ink"), AR("at", 250, 380, 440, 380, "good", 6), AR("at2", 650, 380, 460, 380, "good", 6), T("att", 450, 430, "Unlike poles attract", 28, "good"), T("rep", 450, 120, "Like poles repel", 28, "warm")], steps: [
    step("A magnet has two ends, called poles. One is the north pole and the other is the south pole.", [draw("mnN", 0.2), draw("mnS", 0.35), write("nn", 0.5), write("ss", 0.6)]),
    step("The north pole of one magnet pulls the south pole of another towards it. Unlike poles attract each other.", [draw("at", 0.2), draw("at2", 0.3), write("att", 0.5)]),
    step("But two north poles, or two south poles, push each other away. Like poles repel.", [write("rep", 0.3), pulse("mn", 0.3, undefined, "warm")]),
  ] };
}

/** parts of a plant, labelled */
export function plantParts(): Frag {
  return { title: "Parts of a plant", objects: [T("ttl", 450, 44, "Parts of a plant", 34, "accent"), R("gd", 200, 360, 300, 100, "#A1887F", "earth", 4, 4), PA("st", "M 350 360 L 350 190", "good", 9), PA("rt", "M 350 360 L 310 430 M 350 360 L 350 445 M 350 360 L 390 430", "earth", 5), PA("lf1", "M 350 290 Q 280 240 250 280 Q 290 320 350 290", "good", 4, "#7BE0AD"), PA("lf2", "M 350 250 Q 420 200 450 240 Q 410 280 350 250", "good", 4, "#7BE0AD"), C("fl", 350, 165, 34, "#FFD166", "warm", 4), T("fl2", 350, 175, "🌸", 52), T("tf", 590, 165, "Flower: makes seeds", 26, "warm", "start"), T("tl", 590, 265, "Leaf: makes food", 26, "good", "start"), T("ts", 590, 330, "Stem: holds the plant", 26, "good", "start"), T("tr", 590, 425, "Roots: take in water", 26, "earth", "start")], steps: [
    step("Most plants have four main parts. Let us grow one. First the roots under the ground.", [draw("gd", 0.2), draw("rt", 0.5), write("tr", 0.7)]),
    step("The roots hold the plant firmly and take in water and minerals from the soil. The stem carries the water up to every part of the plant and holds it up.", [draw("st", 0.3), write("ts", 0.6)]),
    step("The leaves use sunlight, air and water to make food for the plant. And the flower makes seeds, which can grow into new plants.", [draw("lf1", 0.1), draw("lf2", 0.2), write("tl", 0.35), draw("fl", 0.5), show("fl2", 0.55), write("tf", 0.7)]),
  ] };
}

/** the heart pumping: blood going round the body */
export function bloodLoop(): Frag {
  return { title: "The heart and blood", objects: [T("ttl", 450, 44, "The heart pumps blood round the body", 32, "accent"), T("ht", 450, 275, "❤️", 120), { kind: "orbit", id: "bl", cx: 450, cy: 265, r: 215, period: 5, size: 11, color: "#E53935", tilt: 0.62 }, { kind: "orbit", id: "bl2", cx: 450, cy: 265, r: 215, period: 5, size: 11, color: "#E53935", tilt: 0.62, phase: 180, ring: false }, T("lg", 160, 420, "Lungs: oxygen in", 24, "water"), T("bd", 740, 420, "Body: oxygen used", 24, "warm")], steps: [
    step("The heart is a strong muscle about the size of your fist. It beats all day and all night.", [show("ht", 0.1), pulse("ht", 0.3)]),
    step("With every beat it pumps blood through tubes called blood vessels to every part of the body.", [show("bl", 0.1), show("bl2", 0.15)]),
    step("The blood picks up oxygen in the lungs and carries it, with food, to the whole body. Then it returns to the heart to start again.", [write("lg", 0.3), write("bd", 0.6)]),
  ] };
}

/** simple ray reflection in a mirror */
export function reflection(): Frag {
  return { title: "Reflection of light", objects: [T("ttl", 450, 44, "Reflection of light", 34, "accent"), L("mr", 200, 380, 700, 380, "ink", 8), L("nm", 450, 380, 450, 150, "soft", 3), AR("in", 250, 160, 440, 375, "sun", 5), AR("rf", 460, 375, 650, 160, "warm", 5), T("ti", 270, 150, "Incident ray", 24, "sun"), T("tr", 640, 150, "Reflected ray", 24, "warm"), T("tm", 450, 425, "Mirror", 26, "ink")], steps: [
    step("When light falls on a shiny surface such as a mirror, it bounces back. This is called reflection.", [draw("mr", 0.2), write("tm", 0.4)]),
    step("The ray that comes towards the mirror is the incident ray.", [draw("in", 0.2), write("ti", 0.5)]),
    step("The ray that bounces off is the reflected ray. The dotted line standing straight up from the mirror is the normal, and the two rays make equal angles with it.", [draw("nm", 0.1), draw("rf", 0.35), write("tr", 0.6)]),
  ] };
}
