/** The rule book (docs/18-lesson-authoring-standards.md) as checks. Errors stop a lesson being written; warnings are listed in the report. */
interface Step { id: string; narration: { en: string; ta?: string }; actions: unknown[]; check?: { stem: { en: string; ta?: string }; options: { id: string; text: { en: string; ta?: string }; correct?: boolean; whyWrong?: { en: string; ta?: string } }[]; explanation: { en: string; ta?: string } } }
interface Lesson { title: { en: string; ta?: string }; objects: { id: string; kind: string }[]; steps: Step[] }
export interface Findings { errors: string[]; warnings: string[] }

export function checkRules(l: Lesson): Findings {
  const errors: string[] = [], warnings: string[] = [];
  if (!l.title.ta) errors.push("the title needs Tamil");
  const checks = l.steps.filter((s) => s.check);
  if (checks.length === 0) errors.push("a lesson needs at least one question (check)");
  if (l.steps.length < 4) warnings.push(`only ${l.steps.length} steps; most lessons need 5 or more`);
  for (const s of l.steps) {
    if (!s.narration.ta) errors.push(`step ${s.id}: narration needs Tamil`);
    if (s.actions.length === 0) warnings.push(`step ${s.id}: nothing happens on the board`);
    if (s.narration.en.split(/\s+/).length > 60) warnings.push(`step ${s.id}: narration is long (keep steps short for young children)`);
    const c = s.check;
    if (!c) continue;
    if (!c.stem.ta) errors.push(`step ${s.id}: question needs Tamil`);
    if (!c.explanation.ta) errors.push(`step ${s.id}: explanation needs Tamil`);
    if (c.options.length < 3) warnings.push(`step ${s.id}: use 3 or 4 options`);
    const seen = new Set<string>();
    for (const o of c.options) {
      const k = o.text.en.trim().toLowerCase();
      if (seen.has(k)) errors.push(`step ${s.id}: two options say "${o.text.en}"`);
      seen.add(k);
      if (!o.text.ta) warnings.push(`step ${s.id}: option "${o.text.en}" has no Tamil`);
      if (!o.correct) {
        if (!o.whyWrong || o.whyWrong.en.trim().length < 12) errors.push(`step ${s.id}: option "${o.text.en}" needs a kind explanation of why it is wrong`);
        else if (!o.whyWrong.ta) errors.push(`step ${s.id}: the "why wrong" for "${o.text.en}" needs Tamil`);
      }
    }
  }
  const pos = checks.map((s) => s.check!.options.findIndex((o) => o.correct));
  if (pos.length >= 3 && new Set(pos).size === 1) warnings.push("the right answer is in the same place in every question; vary it");
  const textObjs = new Set(l.objects.filter((o) => o.kind === "text").map((o) => o.id));
  const used = new Set<string>();
  for (const s of l.steps) for (const a of s.actions as { target?: string }[]) if (a.target) used.add(a.target);
  for (const o of l.objects) if (o.id !== "bg" && !used.has(o.id)) warnings.push(`picture "${o.id}" is never shown`);
  void textObjs;
  return { errors, warnings };
}
