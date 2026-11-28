import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";

export const packs = {
  1: "/virtual-lab-files/sharpstudy-10-virtual-labs.html",
  2: "/virtual-lab-files/sharpstudy-virtual-lab-pack2.html",
  3: "/virtual-lab-files/sharpstudy-virtual-lab-pack3.html",
  4: "/virtual-lab-files/sharpstudy-virtual-lab-pack4.html",
  maths: "/virtual-lab-files/sharpstudy-math-lab-12.html",
};

export const labSubjects = [
  { id: "physics", name: "Physics", icon: "⚡", description: "Explore motion, light and electricity" },
  { id: "chemistry", name: "Chemistry", icon: "⚗️", description: "Investigate matter and reactions" },
  { id: "biology", name: "Biology", icon: "🌱", description: "Discover living systems" },
  { id: "maths", name: "Maths", icon: "📐", description: "Play with numbers, shapes and graphs" },
] as const;
export const mathsTopics = [
  { id: "numbers", name: "Numbers and fractions" },
  { id: "geometry", name: "Geometry and angles" },
  { id: "algebra", name: "Algebra and graphs" },
  { id: "trig3d", name: "Trigonometry, probability and 3D" },
] as const;
type Subject = typeof labSubjects[number]["id"];
type MathsTopic = typeof mathsTopics[number]["id"];
type Entry = { id: string; simulation: string; title: string } & (
  { subject: "maths"; pack: "maths"; topic: MathsTopic } |
  { subject: Exclude<Subject, "maths">; pack: Exclude<keyof typeof packs, "maths">; topic?: never }
);
export function packLabel(pack: keyof typeof packs) {
  return pack === "maths" ? "Maths Playground" : `Science Pack ${pack}`;
}
export const workbenches: Entry[] = [
  { id: "transformer", simulation: "transformer", title: "Transformer Playground", subject: "physics", pack: 1 },
  { id: "ohms-law", simulation: "ohms", title: "Ohm’s Law and Circuit Builder", subject: "physics", pack: 1 },
  { id: "convex-lens", simulation: "optics", title: "Ray Optics with a Convex Lens", subject: "physics", pack: 1 },
  { id: "pendulum", simulation: "pendulum", title: "Simple Pendulum and Gravity", subject: "physics", pack: 1 },
  { id: "alkali-metals", simulation: "metals", title: "Alkali Metals and Water", subject: "chemistry", pack: 1 },
  { id: "indicator", simulation: "ph", title: "Colour and pH / Acid–Base Titration", subject: "chemistry", pack: 1 },
  { id: "states-of-matter", simulation: "states", title: "States of Matter and Molecular Motion", subject: "chemistry", pack: 1 },
  { id: "photosynthesis", simulation: "photosynthesis", title: "Photosynthesis and Oxygen", subject: "biology", pack: 1 },
  { id: "heart", simulation: "heart", title: "Human Heart and Blood Flow", subject: "biology", pack: 1 },
  { id: "cell-explorer", simulation: "cell", title: "Plant and Animal Cell Explorer", subject: "biology", pack: 1 },
  { id: "electromagnet", simulation: "electromagnet", title: "Electromagnet and Magnetic Field", subject: "physics", pack: 2 },
  { id: "prism", simulation: "prism", title: "Prism and Light Dispersion", subject: "physics", pack: 2 },
  { id: "sound", simulation: "sound", title: "Sound Waves, Pitch and Loudness", subject: "physics", pack: 2 },
  { id: "newton", simulation: "newton", title: "Newton’s Laws and Motion", subject: "physics", pack: 2 },
  { id: "electrolysis", simulation: "electrolysis", title: "Electrolysis of Water", subject: "chemistry", pack: 2 },
  { id: "atom", simulation: "atom", title: "Atom Builder and Bohr Model", subject: "chemistry", pack: 2 },
  { id: "displacement", simulation: "displacement", title: "Metal Reactivity and Displacement", subject: "chemistry", pack: 2 },
  { id: "lungs", simulation: "lungs", title: "Human Lungs and Breathing", subject: "biology", pack: 2 },
  { id: "digestion", simulation: "digestion", title: "Human Digestive System", subject: "biology", pack: 2 },
  { id: "osmosis", simulation: "osmosis", title: "Osmosis and Plant Turgidity", subject: "biology", pack: 2 },
  { id: "buoyancy", simulation: "buoyancy", title: "Buoyancy and Archimedes’ Principle", subject: "physics", pack: 3 },
  { id: "eclipse", simulation: "eclipse", title: "Solar System Orbits and Eclipses", subject: "physics", pack: 3 },
  { id: "projectile", simulation: "projectile", title: "Projectile Motion and Gravity", subject: "physics", pack: 3 },
  { id: "circuits", simulation: "circuits", title: "Series and Parallel Circuits", subject: "physics", pack: 3 },
  { id: "kinetics", simulation: "kinetics", title: "Reaction Rate and Catalyst Energy", subject: "chemistry", pack: 3 },
  { id: "distillation", simulation: "distillation", title: "Distillation and Mixture Separation", subject: "chemistry", pack: 3 },
  { id: "bonding", simulation: "bonding", title: "Ionic and Covalent Bonding", subject: "chemistry", pack: 3 },
  { id: "reflex", simulation: "reflex", title: "Reflex Arc and Neuron Impulses", subject: "biology", pack: 3 },
  { id: "dna", simulation: "dna", title: "DNA Double Helix and Base Pairing", subject: "biology", pack: 3 },
  { id: "pollination", simulation: "pollination", title: "Flower Pollination and Fertilisation", subject: "biology", pack: 3 },
  { id: "roller-coaster-energy", simulation: "coaster", title: "Roller Coaster Energy", subject: "physics", pack: 4 },
  { id: "seesaw-torque", simulation: "lever", title: "Seesaw Lever and Torque", subject: "physics", pack: 4 },
  { id: "static-electricity", simulation: "static", title: "Static Electricity and Lightning", subject: "physics", pack: 4 },
  { id: "heat-transfer", simulation: "heat", title: "Heat Transfer", subject: "physics", pack: 4 },
  { id: "flame-test", simulation: "flame", title: "Flame Test Fireworks", subject: "chemistry", pack: 4 },
  { id: "fire-triangle", simulation: "fire", title: "Fire Triangle and Extinguishers", subject: "chemistry", pack: 4 },
  { id: "crystal-growing", simulation: "crystal", title: "Crystal Growing and Solubility", subject: "chemistry", pack: 4 },
  { id: "gas-laws", simulation: "gaslaw", title: "Gas Laws Syringe and Balloon", subject: "chemistry", pack: 4 },
  { id: "vision-corrector", simulation: "eye", title: "Human Eye and Vision Corrector", subject: "biology", pack: 4 },
  { id: "water-cycle", simulation: "watercycle", title: "Water Cycle and Cloud Maker", subject: "biology", pack: 4 },
  { id: "food-web", simulation: "foodweb", title: "Ecosystem and Food Web Balance", subject: "biology", pack: 4 },
  { id: "immune-system", simulation: "immune", title: "Immune System Defender", subject: "biology", pack: 4 },
  { id: "fraction-pizza", simulation: "pizza", title: "Fraction Pizza Chef", subject: "maths", pack: "maths", topic: "numbers" },
  { id: "integer-frog", simulation: "frog", title: "Number Line Frog Jump", subject: "maths", pack: "maths", topic: "numbers" },
  { id: "prime-factor", simulation: "prime", title: "Prime Factor Rocket Blaster", subject: "maths", pack: "maths", topic: "numbers" },
  { id: "angle-archer", simulation: "archer", title: "Angle Archer and Protractor Arena", subject: "maths", pack: "maths", topic: "geometry" },
  { id: "pythagoras", simulation: "pythagoras", title: "Pythagoras Square Builder", subject: "maths", pack: "maths", topic: "geometry" },
  { id: "circle-pi", simulation: "circlepi", title: "Circle Pi Unroller and Area Slicer", subject: "maths", pack: "maths", topic: "geometry" },
  { id: "algebra-balance", simulation: "algebra", title: "Algebra Balance Scale Ninja", subject: "maths", pack: "maths", topic: "algebra" },
  { id: "coordinate-rescue", simulation: "coords", title: "Coordinate Plane Space Rescue", subject: "maths", pack: "maths", topic: "algebra" },
  { id: "linear-slope", simulation: "slope", title: "Linear Slope Roller Coaster", subject: "maths", pack: "maths", topic: "algebra" },
  { id: "trig-lighthouse", simulation: "trig", title: "Trigonometry Wave and Unit Circle", subject: "maths", pack: "maths", topic: "trig3d" },
  { id: "probability-spinner", simulation: "prob", title: "Carnival Probability Spinner", subject: "maths", pack: "maths", topic: "trig3d" },
  { id: "volume-nets", simulation: "volume3d", title: "3D Volume and Net Folder Factory", subject: "maths", pack: "maths", topic: "trig3d" },
];

export function VirtualLabWorkbench({ entry, back }: { entry: Entry; back: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(980);
  const [, navigate] = useLocation();
  const query = useSearch();
  const params = new URLSearchParams(query);
  const subject = params.get("subject");
  const topic = params.get("topic");
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.source !== "sharpstudy-lab") return;
      const measured = event.data.height;
      if (typeof measured === "number" && Number.isInteger(measured) && measured >= 300 && measured <= 5000) setHeight(measured);
      const target = workbenches.find(candidate => candidate.pack === entry.pack && candidate.simulation === event.data.lab);
      if (target && target.id !== entry.id) {
        const selected = target.topic
          ? event.data.topic === target.topic ? "topic=" + target.topic : ""
          : event.data.subject === target.subject ? "subject=" + target.subject : "";
        navigate("/virtual-lab/" + target.id + (selected ? "?" + selected : ""));
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [entry, navigate]);
  const filter = entry.topic
    ? (topic === entry.topic ? "&topic=" + entry.topic : "")
    : (subject === entry.subject ? "&subject=" + entry.subject : "");
  const url = packs[entry.pack] + "?lab=" + entry.simulation + filter;
  return <section className="vl-workbench-page">
    <div className="vl-workbench-nav">
      <Link href={"/virtual-lab?subject=" + entry.subject + (entry.topic ? "&topic=" + entry.topic : "")}>← {back}</Link>
      <a href={url} target="_blank" rel="noopener">Open workbench in a new tab ↗</a>
    </div>
    <h1 className="sr">{entry.title}</h1>
    <iframe ref={frame} title={entry.title + " workbench"} className="vl-workbench-frame" style={{ height }}
      src={url + "&embedded=1"} referrerPolicy="no-referrer" />
    {(entry.id === "transformer" || entry.id === "indicator") &&
      <Link className="vl-compact-link" href={"/virtual-lab/" + entry.id + "?view=compact"}>Open compact lab view</Link>}
  </section>;
}
