/**
 * Picture-first teaching: turns a spoken sentence into a handful of big pictures (emoji drawn on the board) so a child
 * sees the idea instead of reading it. Pure, instant, no network. Unknown words simply get no picture.
 */
const RAW: Record<string, string> = {
  // nature and plants
  plant: "🌱", seed: "🌰", root: "🥕", stem: "🌿", leaf: "🍃", flower: "🌸", fruit: "🍎", tree: "🌳", forest: "🌲", grass: "🌾", garden: "🌻", sun: "☀️", sunlight: "☀️", moon: "🌙", star: "⭐", cloud: "☁️", rain: "🌧️", wind: "💨", storm: "⛈️", snow: "❄️", rainbow: "🌈", mountain: "⛰️", river: "🏞️", sea: "🌊", ocean: "🌊", wave: "🌊", water: "💧", drop: "💧", fire: "🔥", earth: "🌍", soil: "🟫", rock: "🪨", sand: "🏖️", air: "💨", season: "🍂",
  // animals
  animal: "🐾", dog: "🐶", cat: "🐱", cow: "🐄", buffalo: "🐃", goat: "🐐", sheep: "🐑", horse: "🐴", elephant: "🐘", lion: "🦁", tiger: "🐅", monkey: "🐒", bird: "🐦", parrot: "🦜", peacock: "🦚", crow: "🐦‍⬛", hen: "🐔", chicken: "🐔", duck: "🦆", fish: "🐟", frog: "🐸", snake: "🐍", turtle: "🐢", butterfly: "🦋", bee: "🐝", ant: "🐜", spider: "🕷️", insect: "🐛", worm: "🪱", mouse: "🐭", rabbit: "🐰", deer: "🦌", camel: "🐪", egg: "🥚", nest: "🪹",
  // food
  food: "🍽️", meal: "🍽️", dosa: "🥞", idli: "🍚", rice: "🍚", roti: "🫓", chapati: "🫓", bread: "🍞", cake: "🍰", chocolate: "🍫", sweet: "🍬", candy: "🍬", laddu: "🟠", milk: "🥛", tea: "🍵", juice: "🧃", apple: "🍎", banana: "🍌", mango: "🥭", orange: "🍊", grape: "🍇", watermelon: "🍉", lemon: "🍋", coconut: "🥥", tomato: "🍅", potato: "🥔", carrot: "🥕", onion: "🧅", vegetable: "🥦", pizza: "🍕", sandwich: "🥪", cookie: "🍪", biscuit: "🍪", ice: "🧊", salt: "🧂", honey: "🍯", curd: "🥣", bowl: "🥣", plate: "🍽️", spoon: "🥄", glass: "🥛", bottle: "🍼", cup: "☕",
  // people, body, health
  boy: "👦", girl: "👧", child: "🧒", children: "🧒", kid: "🧒", man: "👨", woman: "👩", mother: "👩", mom: "👩", father: "👨", dad: "👨", baby: "👶", grandmother: "👵", grandfather: "👴", teacher: "👩‍🏫", doctor: "🧑‍⚕️", farmer: "🧑‍🌾", friend: "🧑‍🤝‍🧑", family: "👪", people: "👥", eye: "👁️", ear: "👂", nose: "👃", mouth: "👄", tongue: "👅", hand: "✋", finger: "☝️", foot: "🦶", leg: "🦵", heart: "❤️", brain: "🧠", tooth: "🦷", teeth: "🦷", bone: "🦴", skin: "🖐️", soap: "🧼", wash: "🧼", clean: "🧹", brush: "🪥", sleep: "😴", bed: "🛏️", sick: "🤒", medicine: "💊", exercise: "🏃", run: "🏃", walk: "🚶", jump: "🤸", play: "⚽", swim: "🏊", dance: "💃", sing: "🎤", laugh: "😄", smile: "😊", cry: "😢", angry: "😠", happy: "😊", sad: "😢", think: "🤔", dream: "💭",
  // home, school, things
  house: "🏠", home: "🏠", school: "🏫", room: "🚪", door: "🚪", window: "🪟", roof: "🏠", wall: "🧱", brick: "🧱", kitchen: "🍳", bag: "🎒", book: "📖", notebook: "📓", pencil: "✏️", pen: "🖊️", paper: "📄", page: "📄", scissors: "✂️", cut: "✂️", glue: "🧴", paint: "🎨", colour: "🎨", color: "🎨", crayon: "🖍️", ruler: "📏", clock: "🕒", time: "⏰", watch: "⌚", calendar: "📅", map: "🗺️", flag: "🚩", bell: "🔔", lamp: "💡", light: "💡", fan: "🪭", chair: "🪑", table: "🪑", box: "📦", gift: "🎁", ball: "⚽", kite: "🪁", toy: "🧸", balloon: "🎈", drum: "🥁", music: "🎵", song: "🎵", phone: "📱", computer: "💻", camera: "📷", key: "🔑", lock: "🔒", umbrella: "☂️", shoe: "👟", shirt: "👕", dress: "👗", cap: "🧢", hat: "👒", money: "💰", coin: "🪙", rupee: "💰", shop: "🏪", market: "🛒", basket: "🧺", bucket: "🪣", tap: "🚰", pot: "🍲", trash: "🗑️", dustbin: "🗑️", plastic: "♻️", recycle: "♻️", reuse: "♻️", reduce: "♻️", waste: "🗑️", paper_: "📄",
  // travel
  bus: "🚌", car: "🚗", train: "🚆", bicycle: "🚲", cycle: "🚲", boat: "⛵", ship: "🚢", aeroplane: "✈️", plane: "✈️", road: "🛣️", bridge: "🌉", village: "🏘️", city: "🏙️", temple: "🛕", hospital: "🏥", park: "🏞️", farm: "🚜", tractor: "🚜",
  // shapes and maths
  circle: "⚪", square: "🟦", triangle: "🔺", rectangle: "🟩", diamond: "🔷", cube: "🧊", sphere: "🔮", cone: "🔺", pyramid: "🔺", cylinder: "🥫", dice: "🎲", corner: "📐", edge: "📏", side: "📏", shape: "🔷", half: "◐", quarter: "◔", pizza_: "🍕", number: "🔢", count: "🔢", add: "➕", plus: "➕", minus: "➖", subtract: "➖", multiply: "✖️", divide: "➗", equal: "🟰", share: "🤝", group: "👥", pair: "👫", coins: "🪙",
  // science
  magnet: "🧲", magnets: "🧲", iron: "🔩", nail: "🔩", screw: "🔩", pin: "📌", needle: "🪡", wood: "🪵", compass: "🧭", battery: "🔋", cell: "🔋", bulb: "💡", wire: "🔌", plug: "🔌", electricity: "⚡", lightning: "⚡", spark: "⚡", mirror: "🪞", lens: "🔍", microscope: "🔬", telescope: "🔭", thermometer: "🌡️", flame: "🔥", candle: "🕯️", rocket: "🚀", planet: "🪐", saturn: "🪐", satellite: "🛰️", volcano: "🌋", desert: "🏜️", island: "🏝️", fossil: "🦴", dinosaur: "🦕", bat: "🦇", owl: "🦉", bear: "🐻", whale: "🐋", dolphin: "🐬", shark: "🦈", crab: "🦀", snail: "🐌", lizard: "🦎", crocodile: "🐊", fox: "🦊", scale: "⚖️", balance: "⚖️", thread: "🧵", string: "🧵", wheel: "🛞", gear: "⚙️", tool: "🔧", hammer: "🔨", steam: "♨️", kettle: "🫖", cotton: "☁️", wheat: "🌾", sugarcane: "🎋", seedling: "🌱", petal: "🌸", pollen: "🌼", cactus: "🌵", lotus: "🪷", mushroom: "🍄", bean: "🫘", nut: "🥜", magnetic: "🧲", spring: "🌀", pulley: "⚙️", lever: "⚖️", ramp: "📐", sound: "🔊", speaker: "🔊", radio: "📻", television: "📺", torch: "🔦", sunglasses: "🕶️", shadow: "🌑", eclipse: "🌘", comet: "☄️", galaxy: "🌌", sky: "🌤️", dust: "🌫️", smoke: "💨", 
  // social science and history
  king: "👑", queen: "👑", crown: "👑", castle: "🏰", fort: "🏰", palace: "🏯", mosque: "🕌", church: "⛪", globe: "🌐", parliament: "🏛️", court: "⚖️", vote: "🗳️", election: "🗳️", police: "👮", soldier: "🪖", scroll: "📜", pottery: "🏺", jewel: "💎", gold: "🪙", silver: "🪙", arrow: "🏹", sword: "⚔️", shield: "🛡️", trade: "🛒", harvest: "🌾", crop: "🌾", field: "🌾", canal: "🏞️", well: "🪣", pond: "💧", lake: "🏞️", waterfall: "🏞️", coast: "🏖️", beach: "🏖️", hill: "⛰️", valley: "🏞️", plateau: "⛰️", plain: "🌾", monument: "🏛️", statue: "🗿", newspaper: "📰", letter: "✉️", post: "📮", tower: "🗼", ladder: "🪜", tent: "⛺", cave: "🕳️",
};
// words that are not worth a picture on their own: ideas, actions and feelings are said, not drawn
const SKIP = new Set(["plastic", "pot", "cell", "scale", "post", "field", "well", "spring", "sky", "sound", "cotton", "side", "edge", "corner", "number", "count", "time", "light", "air", "shape", "group", "pair", "share", "add", "plus", "minus", "subtract", "multiply", "divide", "equal", "season", "people", "plastic", "waste", "reduce", "reuse", "colour", "color", "page", "drop", "play", "think", "laugh", "smile", "happy", "sad", "angry", "cry", "dream", "cut", "wash", "clean", "run", "walk", "jump", "sing", "dance", "swim", "exercise", "sleep", "sick", "wave", "half", "quarter", "key", "ice", "wind", "wall", "skin", "pen", "map", "bell", "state", "family", "friend", "child", "children", "kid", "man", "woman", "boy", "girl", "finger", "hand", "foot", "eye", "ear", "nose", "mouth", "book", "paper", "table", "chair", "box", "ball", "root", "cone", "pyramid", "cylinder", "iron", "pulley", "lever", "court", "plain", "arrow", "market", "bat", "plane", "cycle", "train", "park", "orange", "salt", "crown", "seed"]);
// Require an explicit sense for words that otherwise produce a misleading picture.
function pictureFor(word: string, context: string): string | undefined {
  if (word !== "letter") return RAW[word];
  if (/\b(?:alphabet|vowels?|consonants?|spell(?:ing)?|[a-z]+case|letters? (?:in|of|make)|(?:count|counting|most|fewest|capital|small) (?:the )?letters?|names? (?:are|is) made of letters?)\b/i.test(context)) return "A B C";
  if (/\b(?:envelopes?|post(?:al|man|box| office)|mail(?:ed|ing|box)|(?:send|sent|write|wrote|receive|received) (?:a |the )?letters?)\b/i.test(context)) return RAW.letter;
  return undefined;
}
const STOP = new Set(["the", "a", "an", "and", "of", "to", "in", "is", "are"]);
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** shapes are drawn as real vector shapes, not emoji */
export const SHAPES = new Set(["circle", "square", "triangle", "rectangle", "diamond"]);
export interface Pic { emoji: string; word: string; count: number; at: string }
const stem = (w: string) => (w.endsWith("ies") ? w.slice(0, -3) + "y" : w.endsWith("es") && RAW[w.slice(0, -2)] ? w.slice(0, -2) : w.endsWith("s") && RAW[w.slice(0, -1)] ? w.slice(0, -1) : w);

/** Up to `max` pictures for the sentence, in the order the words are spoken. A number before a noun ("five apples") repeats it. */
export function picturesFor(text: string, max = 2): Pic[] {
  const toks = text.replace(/[^\p{L}\p{N}' -]/gu, " ").split(/\s+/).filter(Boolean);
  const out: Pic[] = []; const seen = new Set<string>();
  for (let i = 0; i < toks.length; i++) {
    const raw = toks[i]!; const w = stem(raw.toLowerCase());
    if (STOP.has(w) || SKIP.has(w) || seen.has(w)) continue;
    const emoji = pictureFor(w, toks.slice(Math.max(0, i - 7), i + 8).join(" "));
    if (!emoji || out.some((x) => x.emoji === emoji)) continue;
    seen.add(w);
    const prev = toks[i - 1]?.toLowerCase() ?? ""; const n = /^\d+$/.test(prev) ? Number(prev) : WORDS.indexOf(prev);
    out.push({ emoji, word: w, count: w !== "letter" && n >= 2 && n <= 10 && !SHAPES.has(w) ? n : 1, at: raw });
    if (out.length >= max) break;
  }
  return out;
}
/** A sum such as "3 + 4 = 7" spoken or written in the sentence, if any. */
export function expressionIn(text: string): string | undefined {
  const m = text.match(/\d+(?:\s*[+\-×x÷*/=]\s*\d+)+/); return m?.[0]?.replace(/\s*\*\s*/g, " × ").replace(/\s+/g, " ");
}
export const SECTION_ICON: Record<string, string> = { Story: "📖", Learn: "💡", Example: "✏️", Think: "🤔", Remember: "⭐", Practice: "❓", Start: "🎒", Done: "🎉" };
