import { describe, expect, it } from "vitest";
import { ClassroomLesson, PICTURES, RULES, matchLesson, sceneAt } from "../src/index.js";
import * as M from "../src/visuals/maths.js";
import * as S from "../src/visuals/science.js";
import * as X from "../src/visuals/more.js";

const wrap = (f: { title: string; objects: unknown[]; steps: { narration: string; actions: unknown[] }[] }) => ({
  board: "CBSE", classLevel: 5, subject: "maths", chapter: "test", topic: "test", status: "published", title: { en: f.title },
  objects: f.objects, steps: f.steps.map((s, i) => ({ id: `s${i + 1}`, narration: { en: s.narration }, actions: s.actions })),
});
const ref = (subject: string, topic: string) => ({ board: "CBSE", classLevel: 5, subject, chapter: "x", topic, title: topic.replace(/-/g, " ") });

describe("visual library", () => {
  it("every template builds a valid classroom page", () => {
    const frags = [M.fractionPie(3, 4), M.fractionPie(1, 2), M.placeValue(342), M.numberLine(4, 3), M.numberLine(2, 5, true, -4, 4), M.arrayMul(3, 4), M.divideShare(12, 3), M.angle(45), M.angle(90), M.angle(135), M.angle(180),
      M.shapeSides("triangle"), M.shapeSides("hexagon"), M.perimeterArea(5, 3, "both"), M.perimeterArea(4, 2, "area"), M.clockTime(3, 30), M.money([10, 5, 2]), M.barGraph(), M.ruler(7), M.tenthsBar(3), M.pattern(),
      S.foodChain("grass"), S.foodChain("pond"), S.lifeCycle("butterfly"), S.lifeCycle("frog"), S.lifeCycle("plant"), S.lifeCycle("chicken"), S.lifeCycle("mosquito"), S.waterCycle(), S.solarSystem(), S.earthMoon(), S.dayNight(), S.seasons(), S.states(), S.forces(), S.shadow(), S.sound(), S.circuit(), S.magnetPoles(), S.plantParts(), S.bloodLoop(), S.reflection(),
      X.symmetry(), X.balanceScale(), X.jug(), X.primeSieve(), X.factorsOf12(), X.triangleAngles(), X.equationBalance(), X.matchstick(), X.lineGraph(), X.meanLevel(), X.congruent(), X.transversal(), X.solidFaces("cube"), X.solidFaces("cone"), X.rounding(47), X.rounding(42), X.litmus(), X.heatTransfer(), X.speedCars(), X.thermometer(), X.nutrientsPlate(), X.lever(), X.soilLayers(), X.threeOrgans(), X.landforms(), X.saptarishi(), X.globeEquator()];
    for (const f of frags) {
      const r = ClassroomLesson.safeParse(wrap(f));
      expect(r.success, `${f.title}: ${r.success ? "" : r.error.issues[0]?.message}`).toBe(true);
    }
  });

  it("every rule produces a valid page for a lesson it matches", () => {
    const samples: Record<string, [string, string]> = { clock: ["maths", "reading-the-clock"], money: ["maths", "using-rupees"], fraction: ["maths", "fractions-as-equal-parts"], decimal: ["maths", "decimals-and-place-value"], numberline: ["maths", "integers-on-a-number-line"], placevalue: ["maths", "three-digit-numbers"], subtract: ["maths", "subtraction-stories"], add: ["maths", "addition-stories"], multiply: ["maths", "times-tables"], divide: ["maths", "division-as-sharing"], angle: ["maths", "turns-and-right-angles"], perimeter: ["maths", "perimeter-and-area"], shapes: ["maths", "two-dimensional-shapes"], measure: ["maths", "metres-and-centimetres"], data: ["maths", "reading-bar-graphs"], pattern: ["maths", "finding-rules-in-patterns"] };
    let hit = 0;
    for (const [id, [subject, topic]] of Object.entries(samples)) { const m = matchLesson(ref(subject, topic)); if (m) { hit++; expect(m.rule.id, topic).toBe(id); expect(ClassroomLesson.safeParse(wrap(m.frag)).success).toBe(true); } }
    expect(hit).toBeGreaterThan(10);
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length);
  });

  it("does not attach a visual to a lesson about something else", () => {
    expect(matchLesson(ref("social-science", "kingdoms-of-the-south"))).toBeNull();
    expect(matchLesson(ref("evs", "balanced-diet-and-heartbeat-stories"))?.rule.id).not.toBe("heart");
    expect(matchLesson(ref("maths", "collecting-data-and-making-tables"))?.rule.id).not.toBe("multiply");
    expect(matchLesson(ref("science", "saving-water-and-soil"))?.rule.id).not.toBe("soil");
  });

  it("moving parts depend on the clock only, so pausing and stepping always show the right picture", () => {
    const f = S.solarSystem(), l = ClassroomLesson.parse(wrap(f));
    const a = sceneAt(l, 1, 5000, { durMs: 8000 }), b = sceneAt(l, 1, 5000, { durMs: 8000 });
    expect(a).toEqual(b);
    expect(a.o0!.vis).toBeGreaterThan(0);
  });

  it("pictures: unique ids, alt text and caption, only places, nature, space, things (no people)", () => {
    expect(new Set(PICTURES.map((p) => p.src)).size).toBe(PICTURES.length);
    for (const p of PICTURES) {
      expect(p.alt.length, p.src).toBeGreaterThan(5); expect(p.caption.length, p.src).toBeGreaterThan(3); expect(p.query.length).toBeGreaterThan(3);
      expect(/portrait|selfie|child|boy|girl|woman|\bman\b|student|people|minister|gandhi|nehru/i.test(`${p.src} ${p.query} ${p.alt}`), p.src).toBe(false);
      expect(p.src).toMatch(/^[a-z0-9][a-z0-9-]{0,80}$/);
    }
  });

  it("an image object needs alt text and a safe file id", () => {
    const base = { kind: "image", id: "pic", x: 10, y: 10, w: 200, h: 100 };
    const ok = (o: object) => ClassroomLesson.safeParse({ ...wrap({ title: "t", objects: [o], steps: [{ narration: "Look.", actions: [{ do: "show", target: "pic", at: 0 }] }] }) }).success;
    expect(ok({ ...base, src: "taj-mahal", alt: "The Taj Mahal" })).toBe(true);
    expect(ok({ ...base, src: "../secret", alt: "x" })).toBe(false);
    expect(ok({ ...base, src: "taj-mahal" })).toBe(false);
  });
});
