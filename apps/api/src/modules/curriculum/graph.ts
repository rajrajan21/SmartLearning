import {
  BoardCurriculum, CoverageReport, SearchHit, TopicDetail, YearDiff,
  type LocalizedText, type TopicRef,
} from "@studysmart/shared";

/** A fully loaded board + academic year. All curriculum queries are pure functions over this, so they are easy to test. */
export interface GTopic { id: string; slug: string; position: number; name: LocalizedText; objectives: { text: LocalizedText; competencyCode?: string }[]; prerequisiteIds: string[] }
export interface GChapter { id: string; slug: string; position: number; name: LocalizedText; topics: GTopic[] }
export interface GSubject { id: string; classLevel: number; slug: string; name: LocalizedText; textbook?: { title: string; edition?: string; sourceRef?: string }; chapters: GChapter[] }
export interface Graph { boardCode: string; boardName: string; academicYear: string; subjects: GSubject[] }

export function toBoardCurriculum(g: Graph): BoardCurriculum {
  const levels = [...new Set(g.subjects.map((s) => s.classLevel))].sort((a, b) => a - b);
  return BoardCurriculum.parse({
    boardCode: g.boardCode,
    boardName: g.boardName,
    academicYear: g.academicYear,
    classes: levels.map((classLevel) => ({
      classLevel,
      subjects: g.subjects
        .filter((s) => s.classLevel === classLevel)
        .map((s) => ({
          id: s.id, slug: s.slug, name: s.name, textbook: s.textbook,
          chapters: s.chapters.map((c) => ({
            id: c.id, slug: c.slug, position: c.position, name: c.name,
            topics: c.topics.map((t) => ({ id: t.id, slug: t.slug, name: t.name })),
          })),
        })),
    })),
  });
}

interface Located { subject: GSubject; chapter: GChapter; topic: GTopic }
function allTopics(g: Graph): Located[] {
  return g.subjects.flatMap((subject) => subject.chapters.flatMap((chapter) => chapter.topics.map((topic) => ({ subject, chapter, topic }))));
}
const ref = (l: Located): TopicRef => ({ classLevel: l.subject.classLevel, subjectSlug: l.subject.slug, chapterSlug: l.chapter.slug, topicSlug: l.topic.slug, name: l.topic.name });

export function topicDetail(g: Graph, classLevel: number, subjectSlug: string, chapterSlug: string, topicSlug: string): TopicDetail | null {
  const all = allTopics(g);
  const here = all.find((l) => l.subject.classLevel === classLevel && l.subject.slug === subjectSlug && l.chapter.slug === chapterSlug && l.topic.slug === topicSlug);
  if (!here) return null;
  const byId = new Map(all.map((l) => [l.topic.id, l]));
  const sameSubject = all.filter((l) => l.subject.id === here.subject.id); // already in chapter/topic order
  const i = sameSubject.findIndex((l) => l.topic.id === here.topic.id);
  return TopicDetail.parse({
    topic: { id: here.topic.id, slug: here.topic.slug, name: here.topic.name },
    chapter: { slug: here.chapter.slug, position: here.chapter.position, name: here.chapter.name },
    subject: { slug: here.subject.slug, name: here.subject.name },
    classLevel,
    objectives: here.topic.objectives,
    prerequisites: here.topic.prerequisiteIds.map((id) => byId.get(id)).filter((x): x is Located => !!x).map(ref),
    unlocks: all.filter((l) => l.topic.prerequisiteIds.includes(here.topic.id)).map(ref),
    previous: i > 0 && sameSubject[i - 1] ? ref(sameSubject[i - 1]!) : null,
    next: i >= 0 && sameSubject[i + 1] ? ref(sameSubject[i + 1]!) : null,
  });
}

const norm = (s: string) => s.toLocaleLowerCase("en").normalize("NFC");

export function search(g: Graph, query: string, limit = 20): SearchHit[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const hits: { hit: SearchHit; score: number }[] = [];
  const consider = (name: LocalizedText, make: () => SearchHit) => {
    const hay = norm(`${name.en} ${name.ta ?? ""}`);
    if (!tokens.every((t) => hay.includes(t))) return;
    const starts = norm(name.en).startsWith(tokens[0]!) || norm(name.ta ?? "").startsWith(tokens[0]!);
    hits.push({ hit: make(), score: starts ? 0 : 1 });
  };
  for (const s of g.subjects) {
    consider(s.name, () => SearchHit.parse({ kind: "subject", classLevel: s.classLevel, subjectSlug: s.slug, name: s.name, context: `Class ${s.classLevel}` }));
    for (const c of s.chapters) {
      consider(c.name, () => SearchHit.parse({ kind: "chapter", classLevel: s.classLevel, subjectSlug: s.slug, chapterSlug: c.slug, name: c.name, context: `Class ${s.classLevel} · ${s.name.en}` }));
      for (const t of c.topics) {
        consider(t.name, () => SearchHit.parse({ kind: "topic", classLevel: s.classLevel, subjectSlug: s.slug, chapterSlug: c.slug, topicSlug: t.slug, name: t.name, context: `Class ${s.classLevel} · ${s.name.en} · ${c.name.en}` }));
      }
    }
  }
  return hits.sort((a, b) => a.score - b.score).slice(0, Math.min(limit, 50)).map((h) => h.hit);
}

/** Release diff between two academic years (what changed in the textbooks). */
export function diffYears(a: Graph, b: Graph): YearDiff {
  const chapterKeys = (g: Graph) => new Map(g.subjects.flatMap((s) => s.chapters.map((c) => [`${s.classLevel}|${s.slug}|${c.name.en}`, { classLevel: s.classLevel, subjectSlug: s.slug, chapter: c.name.en }] as const)));
  const ka = chapterKeys(a), kb = chapterKeys(b);
  const tb = (g: Graph) => new Map(g.subjects.map((s) => [`${s.classLevel}|${s.slug}`, s.textbook?.title ?? null] as const));
  const ta = tb(a), tbb = tb(b);
  const textbookChanges: YearDiff["textbookChanges"] = [];
  for (const key of new Set([...ta.keys(), ...tbb.keys()])) {
    const from = ta.get(key) ?? null, to = tbb.get(key) ?? null;
    if (from !== to) { const [lvl, slug] = key.split("|"); textbookChanges.push({ classLevel: Number(lvl), subjectSlug: slug!, from, to }); }
  }
  return YearDiff.parse({
    boardCode: b.boardCode, from: a.academicYear, to: b.academicYear,
    addedChapters: [...kb].filter(([k]) => !ka.has(k)).map(([, v]) => v),
    removedChapters: [...ka].filter(([k]) => !kb.has(k)).map(([, v]) => v),
    textbookChanges,
  });
}

/** Authoring progress: shows which chapters still need topics, objectives and Tamil. */
export function coverage(g: Graph): CoverageReport {
  const chapters = g.subjects.flatMap((s) => s.chapters);
  const topics = chapters.flatMap((c) => c.topics);
  return CoverageReport.parse({
    boardCode: g.boardCode,
    academicYear: g.academicYear,
    totals: {
      chapters: chapters.length,
      chaptersWithTopics: chapters.filter((c) => c.topics.length > 0).length,
      topics: topics.length,
      topicsWithObjectives: topics.filter((t) => t.objectives.length > 0).length,
      chaptersWithTamil: chapters.filter((c) => !!c.name.ta).length,
    },
    subjects: g.subjects.map((s) => ({ classLevel: s.classLevel, subjectSlug: s.slug, chapters: s.chapters.length, chaptersWithTopics: s.chapters.filter((c) => c.topics.length > 0).length })),
  });
}
