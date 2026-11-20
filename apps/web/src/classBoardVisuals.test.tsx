import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClassroomLesson, sceneAt } from "@studysmart/shared";
import { ClassBoard } from "./components/ClassBoard";
import { visualsPolicy, withoutGeneratedSteps, withoutVisualSteps } from "./lib/visuals";

const lesson = ClassroomLesson.parse({
  board: "CBSE", classLevel: 6, subject: "science", chapter: "x", topic: "y", title: { en: "T" },
  objects: [
    { kind: "orbit", id: "o1", cx: 450, cy: 250, r: 100, period: 8, size: 10, color: "accent" },
    { kind: "wave", id: "w1", x: 100, y: 400, len: 600, amp: 20, cycles: 3, speed: 0.5 },
    { kind: "image", id: "pic", x: 150, y: 70, w: 300, h: 200, src: "taj-mahal", alt: "The Taj Mahal", caption: "The Taj Mahal" },
  ],
  steps: [{ id: "s1", narration: { en: "Look." }, actions: [{ do: "show", target: "o1", at: 0 }, { do: "show", target: "w1", at: 0 }, { do: "show", target: "pic", at: 0 }] }, { id: "v-x", narration: { en: "More." }, actions: [] }],
});

describe("ClassBoard visuals", () => {
  const scene = sceneAt(lesson, 0, 3000, { durMs: 4000, instant: true });
  it("draws orbits, waves and a picture frame with its alt text, and the orbit moves with the clock", () => {
    const { container, rerender } = render(<ClassBoard objects={lesson.objects} scene={scene} style="white" show3d={false} clock={0} yaw={0} label="t" />);
    expect(container.querySelector("ellipse")).toBeTruthy();
    expect(container.querySelector("path[stroke]")).toBeTruthy();
    expect(container.textContent).toContain("The Taj Mahal");
    const first = container.querySelector("circle")!.getAttribute("cx");
    rerender(<ClassBoard objects={lesson.objects} scene={scene} style="white" show3d={false} clock={2} yaw={0} label="t" />);
    expect(container.querySelector("circle")!.getAttribute("cx")).not.toBe(first);
  });
  it("pictures can be switched off: only the labelled frame shows", () => {
    const { container } = render(<ClassBoard objects={lesson.objects} scene={scene} style="white" show3d={false} clock={0} yaw={0} label="t" visuals={{ pictures: false, credits: false }} />);
    expect(container.querySelector("image")).toBeNull();
  });
});

describe("visuals policy", () => {
  const s = (o: Record<string, unknown>) => ({ get: (k: string) => o[k] as never });
  it("follows the admin switches", () => {
    expect(visualsPolicy(s({}), { subject: "maths", classLevel: 5 }, false).animations).toBe(true);
    expect(visualsPolicy(s({ "visuals.animations": false }), { subject: "maths", classLevel: 5 }, false).animations).toBe(false);
    expect(visualsPolicy(s({ "visuals.hideSubjects": "evs, maths" }), { subject: "maths", classLevel: 5 }, false).animations).toBe(false);
    expect(visualsPolicy(s({ "visuals.hideClasses": "3,5" }), { subject: "science", classLevel: 5 }, false).animations).toBe(false);
    expect(visualsPolicy(s({ "visualpics.hideSubjects": "science" }), { subject: "science", classLevel: 5 }, false).pictures).toBe(false);
    expect(visualsPolicy(s({}), { subject: "maths", classLevel: 5 }, true).motion).toBe(false);
    expect(visualsPolicy(s({ "visuals.reducedMotion": false }), { subject: "maths", classLevel: 5 }, true).motion).toBe(true);
  });
  it("the generated-boards switch drops only the d-steps built from lesson text", () => {
    expect(visualsPolicy(s({}), { subject: "maths", classLevel: 5 }, false).generated).toBe(true);
    expect(visualsPolicy(s({ "visuals.generated": false }), { subject: "maths", classLevel: 5 }, false).generated).toBe(false);
    const l = { steps: [{ id: "d1" }, { id: "d2" }, { id: "pic" }] };
    expect(withoutGeneratedSteps(l as never).steps.map((x) => x.id)).toEqual(["pic"]);
    expect(withoutGeneratedSteps({ steps: [{ id: "s1" }, { id: "d1" }] } as never).steps.map((x) => x.id)).toEqual(["s1"]);
  });
  it("drops the picture-it steps when animations are off", () => {
    expect(withoutVisualSteps(lesson as never).steps.map((x) => x.id)).toEqual(["s1"]);
  });
});
