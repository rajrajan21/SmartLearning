export type CompletionActionId = "practice" | "exam" | "next" | "replay";

export interface CompletionProgressInput {
  hasPractice: boolean;
  practiceDone: boolean;
  hasExam: boolean;
  examDone: boolean;
  hasNext: boolean;
  adaptivePrimary: boolean;
}

export interface CompletionStripStep {
  id: "lesson" | "practice" | "exam" | "next";
  done: boolean;
  current: boolean;
}

export interface CompletionPlan {
  primary: CompletionActionId;
  steps: CompletionStripStep[];
}

export function hasPassedPractice(results: Record<number, { passed?: boolean }> | undefined): boolean {
  if (!results) return false;
  return Object.values(results).some((r) => r?.passed === true);
}

export function hasPassedExam(score: { best: number; tries: number } | undefined, passPercent: number): boolean {
  if (!score || score.tries <= 0) return false;
  return score.best >= passPercent;
}

/**
 * Picks the primary next action inside the Lesson Completion Hub and builds
 * the compact 1-line progress strip using existing learner progress (SITE-11).
 */
export function computeCompletionPlan(input: CompletionProgressInput): CompletionPlan {
  let primary: CompletionActionId;
  if (input.adaptivePrimary) {
    if (input.hasPractice && !input.practiceDone) primary = "practice";
    else if (input.hasExam && !input.examDone) primary = "exam";
    else if (input.hasNext) primary = "next";
    else primary = "replay";
  } else {
    if (input.hasPractice) primary = "practice";
    else if (input.hasExam) primary = "exam";
    else if (input.hasNext) primary = "next";
    else primary = "replay";
  }

  const steps: CompletionStripStep[] = [
    { id: "lesson", done: true, current: false },
  ];
  if (input.hasPractice) {
    steps.push({ id: "practice", done: input.practiceDone, current: primary === "practice" });
  }
  if (input.hasExam) {
    steps.push({ id: "exam", done: input.examDone, current: primary === "exam" });
  }
  if (input.hasNext) {
    steps.push({ id: "next", done: false, current: primary === "next" });
  }

  return { primary, steps };
}
