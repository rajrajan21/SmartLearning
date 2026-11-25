import type { Frag } from "./kit.js";
import * as M from "./maths.js";
import * as S from "./science.js";
import * as So from "./social.js";
import * as E from "./english.js";
import * as X from "./more.js";
import { RULES2, RULES_FIRST } from "./rules2.js";

export interface LessonRef { board: string; classLevel: number; subject: string; chapter: string; topic: string; title: string }
export interface Rule { id: string; subjects: string[]; re: RegExp; not?: RegExp; classes?: number[]; /** matching this stops the search: no topic board is better than a wrong one */ block?: boolean; /** match against the chapter name as well (single-chapter lessons in classes 9 and 10) */ byChapter?: boolean; make: (l: LessonRef, text: string) => Frag }

const num = (text: string, def: number, lo: number, hi: number) => { const m = text.match(/\b(\d{1,3})\b/); const v = m ? Number(m[1]) : def; return v >= lo && v <= hi ? v : def; };

/** first matching rule wins. Precision matters more than coverage: a wrong picture is worse than none, so each rule names the topic itself. */
export const ownText = (l: LessonRef) => (/^full chapter/.test(l.topic.replace(/-/g, " ")) ? `${l.chapter} ${l.title}` : `${l.topic} ${l.title}`).toLowerCase().replace(/[-_]+/g, " ");

export const RULES: Rule[] = [
  { id: "clock", subjects: ["maths", "evs"], re: /\b(clocks?|o clock|seconds minutes and hours|telling (the )?time|reading (the )?(clocks?|time)|time and calendar|half past|quarter past|am pm|24 hour|time goes on|time (intervals|problems)|duration)\b/, make: (l) => M.clockTime(l.classLevel <= 3 ? 3 : 4, l.classLevel <= 3 ? 30 : 15) },
  { id: "money", subjects: ["maths"], re: /\b(money|rupees?|coins?|prices?|profit|loss)\b/, make: (_l, t) => M.money(/profit|loss/.test(t) ? [50, 20, 10] : [10, 5, 2, 1]) },
  { id: "fraction", subjects: ["maths"], re: /\b(fractions?|fractional|halves|half|quarters?|thirds?|parts of a whole|equal parts)\b/, not: /decimal/, make: (_l, t) => /quarter|fourth/.test(t) ? M.fractionPie(3, 4) : /third/.test(t) ? M.fractionPie(2, 3) : /half|halves/.test(t) ? M.fractionPie(1, 2) : M.fractionPie(3, 8) },
  { id: "decimal", subjects: ["maths"], re: /\b(decimals?|percent(age)?s?|tenths|hundredths)\b/, make: (_l, t) => M.tenthsBar(/percent/.test(t) ? 7 : 3) },
  { id: "rounding", subjects: ["maths"], re: /\b(rounding|round off|nearest ten)\b/, make: () => X.rounding(47) },

  { id: "placevalue", subjects: ["maths"], re: /\b(place value|hundreds|thousands|tens and ones|expanded form|digits?|large numbers|big numbers|number names|numbers \d+ to \d+|numbers up to|three digit|two digit|4 digit|3 digit)\b/, not: /decimal|divid|multipl|word problems/, make: (l) => M.placeValue(l.classLevel <= 3 ? 342 : 538) },
  { id: "numberline", subjects: ["maths"], re: /\b(number lines?|integers?|negative numbers?|other side of zero)\b/, not: /multipl|divid|brahmagupta/, make: (_l, t) => /integer|negative|zero/.test(t) ? M.numberLine(2, 5, true, -4, 4) : M.numberLine(4, 3, false, 0, 10) },
  { id: "subtract", subjects: ["maths"], re: /\b(subtraction|subtracting|subtract|minus|take away)\b/, not: /add|large|fraction|decimal|integer|money/, make: () => M.numberLine(9, 4, true, 0, 10) },
  { id: "add", subjects: ["maths"], re: /\b(addition|adding|add)\b/, not: /subtract|large|fraction|decimal|integer|money|regroup/, make: () => M.numberLine(4, 3, false, 0, 10) },
  { id: "multiply", subjects: ["maths"], re: /\b(multiplication|multiplying|multiply|times tables?|multiplication tables?|tables of|arrays?|groups of)\b/, not: /decimal|fraction|integer|milk/, make: (_l, t) => M.arrayMul(/seven|7/.test(t) ? 7 : 3, /four|4/.test(t) ? 4 : 5) },
  { id: "divide", subjects: ["maths"], re: /\b(division|dividing|divide|sharing|remainders?|equal groups)\b/, not: /decimal|fraction|integer/, make: () => M.divideShare(12, 3) },
  { id: "angle", subjects: ["maths"], re: /\b(angles?|right angles?|acute|obtuse|degrees)\b/, not: /triangle|construct|transversal/, make: (_l, t) => M.angle(/obtuse/.test(t) ? 120 : /acute/.test(t) ? 45 : 90) },
  { id: "perimeter", subjects: ["maths"], re: /\b(perimeter|area)\b/, not: /triangle|circle/, make: (_l, t) => M.perimeterArea(5, 3, /perimeter/.test(t) && !/area/.test(t) ? "perimeter" : /area/.test(t) && !/perimeter/.test(t) ? "area" : "both") },
  { id: "shapes", subjects: ["maths"], re: /\b(flat shapes?|shapes?|triangles?|squares?|rectangles?|polygons?|pentagon|hexagon|quadrilaterals?|sides and corners)\b/, not: /congruen|construct|tessellat|similar|solid|inequality|picture|exterior|types of|area|perimeter|number|magic|tiling|parity|symmetr|grids|reflection|angle sum/, make: (_l, t) => /pentagon/.test(t) ? M.shapeSides("pentagon") : /hexagon/.test(t) ? M.shapeSides("hexagon") : /rectangle|quadrilateral/.test(t) ? M.shapeSides("rectangle") : /square/.test(t) ? M.shapeSides("square") : M.shapeSides("triangle") },
  { id: "measure", subjects: ["maths"], re: /\b(centimet\w*|metres?|kilomet\w*|ruler|measuring length|length)\b/, not: /weight|capacity|litre|gram|estimat|jumps/, make: () => M.ruler(7) },
  { id: "data", subjects: ["maths"], re: /\b(data|graphs?|pictographs?|tally|pie charts?)\b/, not: /mean|median|mode|tall tales|line graph/, make: () => M.barGraph() },
  { id: "pattern", subjects: ["maths"], re: /\b(patterns?|sequences?)\b/, not: /lcm|hcf|factor|puzzle|algebra|year review|collatz|history|integer|product|divisib|letters|brahmagupta|exact|frame/, make: () => M.pattern() },

  { id: "watercycle", subjects: ["science", "evs"], re: /\b(water cycle|evaporat\w*|condens\w*|rain|rainwater|clouds?|ice water and vapour)\b/, make: () => S.waterCycle() },
  { id: "states", subjects: ["science", "evs"], re: /\b(states of matter|solids liquids|particles|melting|freezing|boiling|states of water)\b/, not: /chemical/, make: () => S.states() },
  { id: "magnet", subjects: ["science", "evs"], re: /\b(magnets?|magnetic|poles|attraction)\b/, not: /separation|handpicking/, make: () => S.magnetPoles() },
  { id: "circuit", subjects: ["science", "evs"], re: /\b(electric\w*|circuits?|bulb|battery|conductors?|insulators?)\b/, not: /sources|heat|conduction|malleab/, make: () => S.circuit() },
  { id: "light", subjects: ["science", "evs"], re: /\b(shadows?|reflection|mirror|pinhole|transparent|opaque|translucent)\b/, make: (_l, t) => /reflect|mirror/.test(t) ? S.reflection() : S.shadow() },
  { id: "sound", subjects: ["science", "evs"], re: /\b(sound|vibrat\w*|echo|pitch|noise)\b/, not: /energy/, make: () => S.sound() },
  { id: "force", subjects: ["science", "evs"], re: /\b(forces?|push|pull|friction|gravity)\b/, make: () => S.forces() },
  { id: "moon", subjects: ["science", "evs", "social-science"], re: /\b(moon|phases|eclipses?)\b/, not: /tides/, make: () => S.earthMoon() },
  { id: "solar", subjects: ["science", "evs", "social-science"], re: /\b(solar system|planets|milky way|universe|night sky)\b/, make: () => S.solarSystem() },
  { id: "daynight", subjects: ["science", "evs", "social-science"], re: /\b(day and night|rotation|revolution)\b/, make: (_l, t) => /rotation|day and night/.test(t) ? S.dayNight() : S.seasons() },
  { id: "seasons", subjects: ["science", "evs", "social-science"], re: /\b(seasons?|monsoon)\b/, not: /crops|farming|food|irrigation/, make: () => S.seasons() },
  { id: "foodchain", subjects: ["science", "evs"], re: /\b(food chains?|food webs?|producers?|consumers?|herbivores?|carnivores?|ecosystems?)\b/, make: (_l, t) => S.foodChain(/pond|water|fish/.test(t) ? "pond" : "grass") },
  { id: "lifecycle", subjects: ["science", "evs"], re: /\b(life cycles?|butterfl\w*|frogs?|metamorphosis|mosquito\w*|germination|seeds?)\b/, not: /adolescen/, make: (_l, t) => /butterfl|insect/.test(t) ? S.lifeCycle("butterfly") : /frog/.test(t) ? S.lifeCycle("frog") : /mosquito/.test(t) ? S.lifeCycle("mosquito") : /hen|chick/.test(t) ? S.lifeCycle("chicken") : S.lifeCycle("plant") },
  { id: "plant", subjects: ["science", "evs"], re: /\b(parts of a plant|roots?|stems?|leaf|leaves|photosynthesis|transpiration)\b/, make: () => S.plantParts() },
  { id: "heart", subjects: ["science", "evs"], re: /\b(heart|blood|circulat\w*|pulse)\b/, make: () => S.bloodLoop() },
  { id: "digest", subjects: ["science", "evs"], re: /\b(digest\w*|what happens to food|stomach|food in our body)\b/, make: () => S.processChain("How food travels in the body", [{ e: "👄", label: "Mouth", say: "" }, { e: "🫃", label: "Stomach", say: "The food goes down a tube to the stomach, where it is churned and mixed." }, { e: "🌀", label: "Small intestine", say: "In the small intestine, the useful parts of the food pass into the blood." }, { e: "🚽", label: "Waste out", say: "What the body cannot use leaves as waste." }], "Digestion starts in the mouth, where teeth chew the food and saliva softens it.", "This journey is digestion. It turns food into the energy and the materials our body needs.") },
  { id: "waste", subjects: ["science", "evs"], re: /\b(waste|recycl\w*|reduce reuse|composting|garbage|dustbin)\b/, make: () => S.processChain("Reduce, reuse, recycle", [{ e: "♻️", label: "Reduce", say: "" }, { e: "🔁", label: "Reuse", say: "Next, reuse: use things again, like a jar for storing things." }, { e: "🏭", label: "Recycle", say: "Finally, recycle: turn old paper, glass and metal into new things." }], "We make a lot of waste, but we can look after the Earth. First, reduce: use only what we need.", "Remember the three Rs: reduce, reuse and recycle. Small habits protect our planet.", true) },

  // ---- more maths ----
  { id: "symmetry", subjects: ["maths"], re: /\b(symmetr\w*|mirror lines?|mirror images?|line symmetry)\b/, not: /rotation/, make: () => X.symmetry() },
  { id: "weight", subjects: ["maths", "science", "evs"], re: /\b(kilograms?|grams?|weighing|weights?)\b/, not: /litre|capacity|milli|estimat|food|diet|nutrient|hygiene/, make: () => X.balanceScale() },
  { id: "capacity", subjects: ["maths"], re: /\b(litres?|millilitres?|capacity)\b/, not: /estimat|weight/, make: () => X.jug() },
  { id: "primes", subjects: ["maths"], re: /\b(prime numbers?|sieve)\b/, not: /factorisation|hcf|lcm/, make: () => X.primeSieve() },
  { id: "factors", subjects: ["maths"], re: /\b(factors?|divisibility|multiples)\b/, not: /prime|hcf|lcm|common|co prime|jumps/, make: () => X.factorsOf12() },
  { id: "tri-angles", subjects: ["maths"], re: /\b(triangle angle sum|angle sum|types of triangles|exterior angle)\b/, make: () => X.triangleAngles() },
  { id: "equation", subjects: ["maths"], re: /\b(simple equations?|solving equations?|balancing|equations?)\b/, make: () => X.equationBalance() },
  { id: "variable", subjects: ["maths"], re: /\b(variables?|expressions?|algebraic|matchstick)\b/, not: /brackets|order of operations/, make: () => X.matchstick() },
  { id: "linegraph", subjects: ["maths"], re: /\b(line graphs?)\b/, make: () => X.lineGraph() },
  { id: "mean", subjects: ["maths"], re: /\b(mean|average)\b/, make: () => X.meanLevel() },
  { id: "congruence", subjects: ["maths"], re: /\b(congruen\w*|congruent)\b/, not: /condition|testing|guarantee/, make: () => X.congruent() },
  { id: "transversal", subjects: ["maths"], re: /\b(transversals?|parallel|perpendicular)\b/, make: () => X.transversal() },
  { id: "solids", subjects: ["maths"], re: /\b(solid shapes?|faces edges and corners|faces edges|solids)\b/, make: (_l, t) => X.solidFaces(/cylinder/.test(t) ? "cylinder" : /cone/.test(t) ? "cone" : /sphere/.test(t) ? "sphere" : /pyramid/.test(t) ? "pyramid" : /cuboid/.test(t) ? "cuboid" : "cube") },
  // ---- more science / evs ----
  { id: "litmus", subjects: ["science"], re: /\b(acids?|bases?|indicators?|litmus|neutralisation)\b/, make: () => X.litmus() },
  { id: "heat", subjects: ["science"], re: /\b(conduction|convection|radiation|heat flow|hot cold and heat)\b/, make: () => X.heatTransfer() },
  { id: "speed", subjects: ["science"], re: /\b(speed)\b/, not: /problems|graphs/, make: () => X.speedCars() },
  { id: "thermo", subjects: ["science"], re: /\b(thermometers?|measuring temperature|temperature)\b/, not: /rainfall|weather/, make: () => X.thermometer() },
  { id: "nutrients", subjects: ["science", "evs"], re: /\b(balanced diet|food groups|nutrients?|food and nutrients)\b/, make: () => X.nutrientsPlate() },
  { id: "lever", subjects: ["science", "evs"], re: /\b(levers?|simple machines?|pulleys?)\b/, make: () => X.lever() },
  { id: "soil", subjects: ["science", "evs", "social-science"], re: /\b(soil)\b/, not: /government|role|saving/, make: () => X.soilLayers() },
  { id: "stars", subjects: ["science", "evs"], re: /\b(constellations?|stars patterns|stars and)\b/, make: () => X.saptarishi() },
  { id: "chemical", subjects: ["science"], re: /\b(chemical changes?|rusting|burning)\b/, make: () => S.processChain("A change that cannot be undone", [{ e: "📄", label: "Paper", say: "" }, { e: "🔥", label: "Burning", say: "When paper burns, a chemical change takes place." }, { e: "⚫", label: "Ash and smoke", say: "New things, ash and smoke, are made, and we cannot get the paper back." }], "Some changes make something completely new.", "A change that makes a new substance and cannot easily be reversed is a chemical change. Rusting, cooking and burning are chemical changes.") },
  // ---- more social ----
  { id: "organs", subjects: ["social-science"], re: /\b(three organs|organs of government|levels and organs|how a government works)\b/, make: () => X.threeOrgans() },
  { id: "panchayat", subjects: ["social-science"], re: /\b(panchayati raj|gram sabha|panchayats?)\b/, make: () => S.processChain("Three tiers of Panchayati Raj", [{ e: "🏘️", label: "Gram Panchayat", say: "" }, { e: "🏢", label: "Panchayat Samiti", say: "Several villages together form a block, which has a Panchayat Samiti." }, { e: "🏛️", label: "Zila Parishad", say: "At the district level there is the Zila Parishad." }], "Village people take part in local government through the Gram Panchayat, which works for one village.", "So the Panchayati Raj has three tiers: village, block and district. The Gram Sabha, all the adult villagers, chooses the Panchayat.") },
  { id: "sectors", subjects: ["social-science"], re: /\b(primary secondary|economic activit\w*|sectors?)\b/, not: /non economic/, make: () => S.processChain("Three kinds of economic activity", [{ e: "🌾", label: "Primary", say: "" }, { e: "🏭", label: "Secondary", say: "Secondary activities turn raw materials into goods, like making cloth or bread in a factory." }, { e: "🛒", label: "Tertiary", say: "Tertiary activities are services, like teaching, banking and transport." }], "Primary activities use natural resources directly, like farming, fishing and mining.", "Together these three kinds of activity make up the economy.") },
  { id: "plate-tectonics", subjects: ["social-science", "science"], re: /\b(plate tectonics|tectonic plates?|lithospher\w*|plate boundaries)\b/, make: () => X.plateTectonics() },
  { id: "landforms", subjects: ["social-science"], re: /\b(mountains?|plateaus?|plains?|landforms?)\b/, not: /sacred|pilgrimage|life on/, make: () => X.landforms() },
  { id: "globe", subjects: ["social-science"], re: /\b(globe|equator|hemispheres?)\b/, make: () => X.globeEquator() },
  { id: "continents", subjects: ["social-science"], re: /\b(seven continents|continents)\b/, make: () => X.iconGrid("The seven continents", [{ e: "🐘", label: "Asia" }, { e: "🦁", label: "Africa" }, { e: "🏔️", label: "North America" }, { e: "🌴", label: "South America" }, { e: "🐧", label: "Antarctica" }, { e: "🏰", label: "Europe" }, { e: "🦘", label: "Australia" }], "The land on the Earth is divided into very large pieces called continents.", "There are seven continents. Asia is the largest, and we live in Asia.") },
  { id: "oceans", subjects: ["social-science"], re: /\b(oceans?)\b/, not: /life|disasters|landforms|continents/, make: () => X.iconGrid("The five oceans", [{ e: "🌊", label: "Pacific" }, { e: "🐋", label: "Atlantic" }, { e: "🐠", label: "Indian" }, { e: "🧊", label: "Southern" }, { e: "❄️", label: "Arctic" }], "Most of the Earth is covered by water, and the largest bodies of salt water are called oceans.", "There are five oceans. The Pacific is the largest, and the Indian Ocean touches the southern coast of India.") },
  { id: "weather", subjects: ["social-science", "science"], re: /\b(elements of weather|weather stations|weather and forecasts|measuring weather)\b/, make: () => X.iconGrid("Elements of weather", [{ e: "🌡️", label: "Temperature" }, { e: "🌧️", label: "Rainfall" }, { e: "💨", label: "Wind" }, { e: "💧", label: "Humidity" }, { e: "🌥️", label: "Cloud cover" }], "Weather is how the air is at a place at a certain time: hot or cold, wet or dry, still or windy.", "Weather stations measure these elements every day, and forecasters use them to tell us what the weather will be.") },

  { id: "compass", subjects: ["social-science", "evs", "maths"], re: /\b(directions?|compass)\b/, make: () => So.compass() },
  { id: "map", subjects: ["social-science", "evs", "maths"], re: /\b(maps?|atlas|map symbols?|map scale|grid|finding our way|landmarks?)\b/, not: /imaginary|farm|distance/, make: () => So.mapGrid() },

  { id: "noun", subjects: ["english"], re: /\b(nouns?|naming words?)\b/, make: () => E.sentenceParts("noun") },
  { id: "verb", subjects: ["english"], re: /\b(verbs?|action words?)\b/, make: () => E.sentenceParts("verb") },
  { id: "adjective", subjects: ["english"], re: /\b(adjectives?|describing words?)\b/, make: () => E.sentenceParts("adjective") },
  { id: "adverb", subjects: ["english"], re: /\b(adverbs?)\b/, make: () => E.sentenceParts("adverb") },
  { id: "pronoun", subjects: ["english"], re: /\b(pronouns?)\b/, make: () => E.sentenceParts("pronoun") },
];

export const ALL_RULES: Rule[] = [...RULES_FIRST, ...RULES, ...RULES2];

export const matchLesson = (l: LessonRef): { rule: Rule; frag: Frag } | null => {
  const own = ownText(l), text = `${l.subject} ${own}`;
  for (const r of ALL_RULES) if (r.subjects.includes(l.subject) && (!r.classes || r.classes.includes(l.classLevel)) && (r.byChapter ? r.re.test(`${own} ${l.chapter.replace(/-/g, " ")}`) : r.re.test(own)) && !(r.not && r.not.test(own))) return r.block ? null : { rule: r, frag: r.make(l, text) };
  return null;
};
