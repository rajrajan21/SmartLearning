import type { UiKey } from "./i18n";

export interface BadgeInput {
  lessonsDone: number;
  stars: number;
  streak: number;
  /** practice results saved on this device: topic -> round -> result */
  results: Record<string, Record<string, { best?: number; stars?: number; passed?: boolean } | undefined> | undefined>;
}
export interface Badge { id: string; icon: string; title: UiKey; desc: UiKey; earned: boolean; have: number; need: number }

const def = (id: string, icon: string, title: UiKey, desc: UiKey, have: number, need: number): Badge => ({ id, icon, title, desc, earned: have >= need, have: Math.min(have, need), need });

/** Badges come only from progress already saved on this device. Nothing is sent anywhere. */
export function computeBadges(i: BadgeInput): Badge[] {
  const rounds = Object.values(i.results).flatMap((r) => Object.values(r ?? {})).filter((r): r is NonNullable<typeof r> => !!r);
  const passed = rounds.filter((r) => r.passed).length;
  const perfect = rounds.filter((r) => (r.best ?? 0) >= 100).length;
  const masterTopics = Object.values(i.results).filter((r) => ["1", "2", "3", "4"].every((k) => r?.[k]?.passed)).length;
  return [
    def("first-lesson", "📗", "badgeFirstLesson", "badgeFirstLessonD", i.lessonsDone, 1),
    def("five-lessons", "🧭", "badgeFiveLessons", "badgeFiveLessonsD", i.lessonsDone, 5),
    def("ten-lessons", "🏆", "badgeTenLessons", "badgeTenLessonsD", i.lessonsDone, 10),
    def("first-round", "✏️", "badgeFirstRound", "badgeFirstRoundD", passed, 1),
    def("stars-10", "⭐", "badgeStars10", "badgeStars10D", i.stars, 10),
    def("stars-30", "🌟", "badgeStars30", "badgeStars30D", i.stars, 30),
    def("perfect", "💯", "badgePerfect", "badgePerfectD", perfect, 1),
    def("streak-3", "🔥", "badgeStreak3", "badgeStreak3D", i.streak, 3),
    def("streak-7", "🌈", "badgeStreak7", "badgeStreak7D", i.streak, 7),
    def("topic-master", "🎓", "badgeTopicMaster", "badgeTopicMasterD", masterTopics, 1),
  ];
}
