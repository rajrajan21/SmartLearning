import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";

export const packs = {
  1: "/virtual-lab-files/sharpstudy-10-virtual-labs.html",
  2: "/virtual-lab-files/sharpstudy-virtual-lab-pack2.html",
  3: "/virtual-lab-files/sharpstudy-virtual-lab-pack3.html",
};

type Subject = "physics" | "chemistry" | "biology";
type Entry = { id: string; simulation: string; title: string; subject: Subject; pack: keyof typeof packs };
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
];

export function VirtualLabWorkbench({ entry, back }: { entry: Entry; back: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(980);
  const [, navigate] = useLocation();
  const query = useSearch();
  const subject = new URLSearchParams(query).get("subject");
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.source !== "sharpstudy-lab") return;
      const measured = event.data.height;
      if (typeof measured === "number" && Number.isInteger(measured) && measured >= 300 && measured <= 5000) setHeight(measured);
      const target = workbenches.find(candidate => candidate.pack === entry.pack && candidate.simulation === event.data.lab);
      if (target && target.id !== entry.id) {
        const carry = event.data.subject === target.subject ? "?subject=" + target.subject : "";
        navigate("/virtual-lab/" + target.id + carry);
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [entry, navigate]);
  const filter = subject === entry.subject ? "&subject=" + entry.subject : "";
  const url = packs[entry.pack] + "?lab=" + entry.simulation + filter;
  return <section className="vl-workbench-page">
    <div className="vl-workbench-nav">
      <Link href={"/virtual-lab?subject=" + entry.subject}>← {back}</Link>
      <a href={url} target="_blank" rel="noopener">Open workbench in a new tab ↗</a>
    </div>
    <h1 className="sr">{entry.title}</h1>
    <iframe ref={frame} title={entry.title + " workbench"} className="vl-workbench-frame" style={{ height }}
      src={url + "&embedded=1"} referrerPolicy="no-referrer" />
    {(entry.id === "transformer" || entry.id === "indicator") &&
      <Link className="vl-compact-link" href={"/virtual-lab/" + entry.id + "?view=compact"}>Open compact lab view</Link>}
  </section>;
}
