import { and, asc, eq, inArray } from "drizzle-orm";
import { AnswerFeedback, AnswerRequest, PracticeSet, Question, QuestionImport, type PublicQuestion } from "@studysmart/shared";
import type { Db } from "../../db/client.js";
import * as s from "../../db/schema.js";
import type { CurriculumRepository } from "../curriculum/repository.js";
import type { AudioStore } from "../audio/manifest.js";
import { correctAnswerOf, grade, toPublic } from "./grade.js";

export class PracticeError extends Error { constructor(message: string, readonly status: 400 | 404 | 409 = 400) { super(message); } }

const pickAudio = (audio: AudioStore | undefined, text: { en?: string; ta?: string } | undefined) =>
  audio?.refsPreferred ? audio.refsPreferred("malar", text) : audio?.refs("malar", text);

export interface PracticeService {
  importQuestions(raw: unknown): Promise<{ topicId: string; added: number; updated: number; unchanged: number }>;
  getPractice(board: string, classLevel: number, subject: string, chapter: string, topic: string): Promise<PracticeSet | null>;
  publishedTopicIds(): Promise<string[]>;
  /** which rounds have published questions, per topic (used to measure mastery) */
  roundsByTopic(): Promise<Record<string, number[]>>;
  /** questions by id, for the revision set (published only, answers never included) */
  getByIds(ids: string[]): Promise<PublicQuestion[]>;
  /** right answers for a worksheet (only ever called for a signed-in parent) */
  answerKey(ids: string[]): Promise<{ id: string; answer: { en: string; ta?: string } }[]>;
  answer(req: AnswerRequest, studentId?: string | null): Promise<AnswerFeedback>;
  /** Share of correct first answers per question, for calibrating difficulty (used by Module 7+). */
  stats(topicId: string): Promise<{ key: string; attempts: number; correct: number }[]>;
}

export function createPracticeService(db: Db, curriculum: CurriculumRepository, audio?: AudioStore): PracticeService {
  const published = (topicId: string) =>
    db.select().from(s.questions).where(and(eq(s.questions.topicId, topicId), eq(s.questions.status, "published"))).orderBy(asc(s.questions.round), asc(s.questions.key));

  return {
    async importQuestions(raw) {
      const d = QuestionImport.parse(raw);
      const detail = await curriculum.getTopic(d.board, d.classLevel, d.subject, d.chapter, d.topic);
      if (!detail) throw new PracticeError(`No topic ${d.classLevel}/${d.subject}/${d.chapter}/${d.topic} in ${d.board}. Add the topic to the curriculum file first.`, 404);
      const topicId = detail.topic.id;
      let added = 0, updated = 0, unchanged = 0;
      await db.transaction(async (tx) => {
        for (const q of d.questions) {
          const body = JSON.stringify(q);
          const [have] = await tx.select().from(s.questions).where(and(eq(s.questions.topicId, topicId), eq(s.questions.key, q.key)));
          if (!have) {
            await tx.insert(s.questions).values({ topicId, key: q.key, type: q.type, round: q.round, status: q.status, bodyJson: body });
            added++;
          } else if (have.bodyJson === body) {
            unchanged++;
          } else {
            // content changed: bump the version so old attempts still point at what the student actually saw
            await tx.update(s.questions).set({ type: q.type, round: q.round, status: q.status, bodyJson: body, version: have.version + 1, updatedAt: new Date() }).where(eq(s.questions.id, have.id));
            updated++;
          }
        }
      });
      return { topicId, added, updated, unchanged };
    },

    async getPractice(board, classLevel, subject, chapter, topic) {
      const detail = await curriculum.getTopic(board, classLevel, subject, chapter, topic);
      if (!detail) return null;
      const rows = await published(detail.topic.id);
      if (rows.length === 0) return null;
      const questions: PublicQuestion[] = rows.map((r) => {
        const q = Question.parse(JSON.parse(r.bodyJson));
        const pub = toPublic(r.id, q);
        const stem = pickAudio(audio, q.stem);
        return stem ? { ...pub, audio: { stem } } : pub;
      });
      return PracticeSet.parse({ topicId: detail.topic.id, questions });
    },

    async publishedTopicIds() {
      const rows = await db.selectDistinct({ id: s.questions.topicId }).from(s.questions).where(eq(s.questions.status, "published"));
      return rows.map((r) => r.id);
    },

    async roundsByTopic() {
      const rows = await db.selectDistinct({ topicId: s.questions.topicId, round: s.questions.round }).from(s.questions).where(eq(s.questions.status, "published"));
      const out: Record<string, number[]> = {};
      for (const r of rows) (out[r.topicId] ??= []).push(r.round);
      for (const k of Object.keys(out)) out[k]!.sort();
      return out;
    },

    async getByIds(ids) {
      if (ids.length === 0) return [];
      const rows = await db.select().from(s.questions).where(and(inArray(s.questions.id, ids), eq(s.questions.status, "published")));
      return rows.map((r) => {
        const q = Question.parse(JSON.parse(r.bodyJson));
        const pub = toPublic(r.id, q), stem = pickAudio(audio, q.stem);
        return stem ? { ...pub, audio: { stem } } : pub;
      });
    },

    async answerKey(ids) {
      if (ids.length === 0) return [];
      const rows = await db.select().from(s.questions).where(and(inArray(s.questions.id, ids), eq(s.questions.status, "published")));
      return rows.map((r) => ({ id: r.id, answer: correctAnswerOf(Question.parse(JSON.parse(r.bodyJson))) }));
    },

    async answer(req, studentId) {
      const [row] = await db.select().from(s.questions).where(eq(s.questions.id, req.questionId));
      if (!row || row.status !== "published") throw new PracticeError("Question not found", 404);
      const q = Question.parse(JSON.parse(row.bodyJson));

      const [prior] = await db.select().from(s.questionAttempts).where(eq(s.questionAttempts.attemptId, req.attemptId));
      if (prior) {
        // Same attempt sent again (double tap, flaky network): answer exactly as before, count nothing twice.
        if (prior.questionId !== req.questionId || prior.anonId !== req.anonId) throw new PracticeError("That attempt id was already used for something else", 409);
        const g = grade(q, JSON.parse(prior.responseJson));
        if ("error" in g) throw new PracticeError(g.error);
        return build(req.attemptId, req.questionId, q, g, true, audio);
      }

      const g = grade(q, req.response);
      if ("error" in g) throw new PracticeError(g.error);
      await db.insert(s.questionAttempts).values({
        attemptId: req.attemptId, questionId: row.id, questionVersion: row.version, anonId: req.anonId, studentId: studentId ?? null,
        responseJson: JSON.stringify(req.response), correct: g.correct, hintsUsed: req.hintsUsed,
      }).onConflictDoNothing(); // two simultaneous sends: the first wins
      return build(req.attemptId, req.questionId, q, g, false, audio);
    },

    async stats(topicId) {
      const rows = await db.select({ key: s.questions.key, id: s.questions.id }).from(s.questions).where(eq(s.questions.topicId, topicId));
      const out: { key: string; attempts: number; correct: number }[] = [];
      for (const r of rows) {
        const at = await db.select({ correct: s.questionAttempts.correct }).from(s.questionAttempts).where(eq(s.questionAttempts.questionId, r.id));
        out.push({ key: r.key, attempts: at.length, correct: at.filter((a) => a.correct).length });
      }
      return out;
    },
  };
}

function build(attemptId: string, questionId: string, q: Question, g: Exclude<ReturnType<typeof grade>, { error: string }>, replay: boolean, audio?: AudioStore): AnswerFeedback {
  const explanation = pickAudio(audio, q.explanation);
  const whyWrong = g.whyWrong ? pickAudio(audio, g.whyWrong) : undefined;
  const clips = { ...(explanation ? { explanation } : {}), ...(whyWrong ? { whyWrong } : {}) };
  return AnswerFeedback.parse({ attemptId, questionId, correct: g.correct, explanation: q.explanation, ...(g.whyWrong ? { whyWrong: g.whyWrong } : {}), correctAnswer: g.correctAnswer, replay, ...(Object.keys(clips).length ? { audio: clips } : {}) });
}
