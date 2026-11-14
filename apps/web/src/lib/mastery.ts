import { useEffect, useState } from "react";
import { topicMastery, type Mastery, type SyncData } from "@studysmart/shared";
import { store } from "./storage";
import { useAllProgress } from "./progress";
import { useAllResults } from "./practice";
import { useLessonTopicIds } from "./curriculum";

/** Rounds that have questions, per topic (cached for offline). */
export function usePracticeRounds(enabled: boolean): Record<string, number[]> {
  const [r, setR] = useState<Record<string, number[]>>(() => store.getJson("ss_practice_rounds") ?? {});
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fetch("/api/v1/practice/available").then((x) => (x.ok ? x.json() : Promise.reject(new Error("x"))))
      .then((d: { rounds?: Record<string, number[]> }) => { if (alive && d.rounds) { setR(d.rounds); store.setJson("ss_practice_rounds", d.rounds); } })
      .catch(() => { /* keep the saved copy */ });
    return () => { alive = false; };
  }, [enabled]);
  return r;
}

/** Mastery of any topic from this device's saved progress; null when the topic has no lesson or questions yet. */
export function useMastery(enabled: boolean): (topicId: string) => Mastery | null {
  const lessons = useLessonTopicIds(enabled), rounds = usePracticeRounds(enabled);
  const progress = useAllProgress(), results = useAllResults();
  return (id) => {
    const available = rounds[id] ?? [], hasLesson = lessons.has(id);
    if (!hasLesson && available.length === 0) return null;
    return topicMastery({ lesson: progress[id], rounds: results[id] as never, available, hasLesson });
  };
}

/** Same measure, for a child's saved progress from the server (parent dashboard) instead of this device. */
export function useMasteryFor(data: SyncData, enabled: boolean): (topicId: string) => Mastery | null {
  const lessons = useLessonTopicIds(enabled), rounds = usePracticeRounds(enabled);
  return (id) => {
    const available = rounds[id] ?? [], hasLesson = lessons.has(id);
    if (!hasLesson && available.length === 0) return null;
    return topicMastery({ lesson: data.lesson[id], rounds: data.practice[id], available, hasLesson });
  };
}
