import { z } from "zod";

/** What a device keeps for one child, and what the server stores. One shared merge rule so both sides always agree. */
export const LessonProgress = z.object({ step: z.number().int().min(0).max(500), total: z.number().int().min(0).max(500), done: z.boolean(), updatedAt: z.number().int().min(0) });
export const RoundResult = z.object({ best: z.number().min(0).max(100), stars: z.number().int().min(0).max(3), passed: z.boolean(), tries: z.number().int().min(0).max(100000) });
const topicId = z.string().min(1).max(60);
export const SyncData = z.object({
  lesson: z.record(topicId, LessonProgress).default({}),
  practice: z.record(topicId, z.record(z.enum(["1", "2", "3", "4"]), RoundResult)).default({}),
}).superRefine((d, ctx) => {
  if (Object.keys(d.lesson).length > 2000 || Object.keys(d.practice).length > 2000) ctx.addIssue({ code: "custom", message: "too many topics" });
});
export type LessonProgress = z.infer<typeof LessonProgress>;
export type RoundResult = z.infer<typeof RoundResult>;
export type SyncData = z.infer<typeof SyncData>;
export const emptySync = (): SyncData => ({ lesson: {}, practice: {} });

/** Finished stays finished; otherwise the most recently worked-on lesson wins. */
export function mergeLesson(a: LessonProgress | undefined, b: LessonProgress | undefined): LessonProgress | undefined {
  if (!a || !b) return a ?? b;
  const [old, recent] = a.updatedAt <= b.updatedAt ? [a, b] : [b, a];
  return old.done && !recent.done ? { ...old, updatedAt: recent.updatedAt } : recent;
}
/** Best score, most stars, passed stays passed, tries add up to the higher count. */
export function mergeRound(a: RoundResult | undefined, b: RoundResult | undefined): RoundResult | undefined {
  if (!a || !b) return a ?? b;
  return { best: Math.max(a.best, b.best), stars: Math.max(a.stars, b.stars), passed: a.passed || b.passed, tries: Math.max(a.tries, b.tries) };
}
export function mergeSync(a: SyncData, b: SyncData): SyncData {
  const out = emptySync();
  for (const id of new Set([...Object.keys(a.lesson), ...Object.keys(b.lesson)])) { const m = mergeLesson(a.lesson[id], b.lesson[id]); if (m) out.lesson[id] = m; }
  for (const id of new Set([...Object.keys(a.practice), ...Object.keys(b.practice)])) {
    const rounds: Record<string, RoundResult> = {};
    for (const r of ["1", "2", "3", "4"] as const) { const m = mergeRound(a.practice[id]?.[r], b.practice[id]?.[r]); if (m) rounds[r] = m; }
    out.practice[id] = rounds;
  }
  return out;
}

export const AVATARS = ["owl", "fox", "panda", "lion", "rabbit", "turtle", "parrot", "elephant"] as const;
export type Avatar = (typeof AVATARS)[number];

export const Register = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(1).max(200), // length rule comes from the admin setting
  consent: z.literal(true), // a parent or guardian agrees to keep the child's learning progress
  child: z.object({ nickname: z.string().trim().min(1).max(20), classLevel: z.number().int().min(1).max(12), avatar: z.enum(AVATARS).default("owl"), language: z.enum(["en", "ta"]).default("en") }),
});
export const Login = z.object({ email: z.string().trim().toLowerCase().email().max(120), password: z.string().min(1).max(200) });
export const ChildInput = z.object({ nickname: z.string().trim().min(1).max(20), classLevel: z.number().int().min(1).max(12), avatar: z.enum(AVATARS).default("owl"), language: z.enum(["en", "ta"]).default("en") });
export const PublicProfile = z.object({ id: z.string(), nickname: z.string(), classLevel: z.number(), avatar: z.string(), language: z.string() });
export const Me = z.object({ user: z.object({ id: z.string(), email: z.string() }), profiles: z.array(PublicProfile), activeProfileId: z.string().nullable() });
export type Me = z.infer<typeof Me>;
export type PublicProfile = z.infer<typeof PublicProfile>;
