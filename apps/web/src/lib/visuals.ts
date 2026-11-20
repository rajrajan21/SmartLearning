import type { PublicClassroom } from "@studysmart/shared";

interface SettingsLike { get(k: string): unknown }
const list = (v: unknown) => String(v ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);

/** What the admin's Visuals pages say should happen for this lesson. */
export function visualsPolicy(s: SettingsLike, l: { subject: string; classLevel: number }, reducedMotion: boolean) {
  const hide = (p: "visuals" | "visualpics") => list(s.get(`${p}.hideSubjects`)).includes(l.subject.toLowerCase()) || list(s.get(`${p}.hideClasses`)).includes(String(l.classLevel));
  const animations = s.get("visuals.animations") !== false && !hide("visuals");
  const calm = reducedMotion && s.get("visuals.reducedMotion") !== false;
  return {
    animations,
    generated: s.get("visuals.generated") !== false,
    autoplay: s.get("visuals.autoplay") !== false,
    motion: s.get("visuals.motion") !== false && !calm,
    speed: Number(s.get("visuals.speed")) || 1,
    pictures: s.get("visualpics.show") !== false && !hide("visualpics"),
    credits: s.get("visualpics.credits") !== false,
  };
}

/** Steps that came from a picture page ("Picture it") are dropped when animations are off for this lesson. */
export function withoutVisualSteps(l: PublicClassroom): PublicClassroom {
  const steps = l.steps.filter((st) => !st.id.startsWith("v-"));
  return steps.length === l.steps.length || steps.length === 0 ? l : { ...l, steps };
}

/** Steps of the boards built from the lesson text (ids d1, d2 ...) are dropped when the admin turns "generated boards" off. */
export function withoutGeneratedSteps(l: PublicClassroom): PublicClassroom {
  const steps = l.steps.filter((st) => !/^d\d+$/.test(st.id));
  return steps.length === l.steps.length || steps.length === 0 ? l : { ...l, steps };
}
