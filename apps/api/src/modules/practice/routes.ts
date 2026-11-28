import { Router, type Request } from "express";
import { z } from "zod";
import { AnswerRequest } from "@studysmart/shared";
import { rateLimit } from "../../http/rate-limit.js";
import { PracticeError, type PracticeService } from "./service.js";

const code = z.string().regex(/^[A-Za-z0-9_-]{1,20}$/);
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);

export interface PracticeRouteOpts {
  allowStudyKey?: () => Promise<boolean>;
  allowRevealSolution?: () => Promise<boolean>;
}

export function practiceRoutes(svc: PracticeService, maxAge: () => Promise<number>, studentOf?: (req: Request) => Promise<string | null>, mayReadKey?: (req: Request) => Promise<boolean>, opts?: PracticeRouteOpts): Router {
  const r = Router();
  r.get("/available", async (_req, res) => {
    const age = await maxAge();
    res.set("Cache-Control", age > 0 ? `public, max-age=${age}` : "no-store").json({ topicIds: await svc.publishedTopicIds(), rounds: await svc.roundsByTopic() });
  });

  r.get("/boards/:board/:classLevel/:subject/:chapter/:topic", async (req, res) => {
    const q = z.object({ board: code, classLevel: z.coerce.number().int().min(1).max(12), subject: slug, chapter: slug, topic: slug }).safeParse(req.params);
    if (!q.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid path" } });
    const set = await svc.getPractice(q.data.board, q.data.classLevel, q.data.subject, q.data.chapter, q.data.topic);
    if (!set) return void res.status(404).json({ error: { code: "not_found", message: "No practice questions for this topic yet" } });
    const age = await maxAge();
    res.set("Cache-Control", age > 0 ? `public, max-age=${age}` : "no-store").json(set);
  });

  r.get("/boards/:board/:classLevel/:subject/:chapter", async (req, res) => {
    const q = z.object({ board: code, classLevel: z.coerce.number().int().min(1).max(12), subject: slug, chapter: slug }).safeParse(req.params);
    if (!q.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid path" } });
    const questions = await svc.getChapterQuestions(q.data.board, q.data.classLevel, q.data.subject, q.data.chapter);
    if (!questions) return void res.status(404).json({ error: { code: "not_found", message: "Chapter not found" } });
    const age = await maxAge();
    res.set("Cache-Control", age > 0 ? `public, max-age=${age}` : "no-store").json({ questions });
  });

  // The revision set: questions the child answered before, fetched by id (at most 30 at a time).
  r.post("/by-ids", rateLimit({ windowMs: 60_000, max: 60 }), async (req, res) => {
    const b = z.object({ ids: z.array(z.string().uuid()).min(1).max(30) }).safeParse(req.body);
    if (!b.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid ids" } });
    res.set("Cache-Control", "no-store").json({ questions: await svc.getByIds(b.data.ids) });
  });

  // Worksheet answer key: only for a signed-in parent, and only while the admin allows it.
  r.post("/answer-key", rateLimit({ windowMs: 60_000, max: 30 }), async (req, res) => {
    if (!mayReadKey || !(await mayReadKey(req))) return void res.status(403).json({ error: { code: "forbidden", message: "Sign in as a parent to see the answer key." } });
    const b = z.object({ ids: z.array(z.string().uuid()).min(1).max(30) }).safeParse(req.body);
    if (!b.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid ids" } });
    res.set("Cache-Control", "no-store").json({ answers: await svc.answerKey(b.data.ids) });
  });

  // Self-study worksheet Answer Key & Solutions toggle (gated by Admin > Tests > worksheet.answerKey.allowToggle).
  r.post("/study-key", rateLimit({ windowMs: 60_000, max: 30 }), async (req, res) => {
    if (opts?.allowStudyKey && !(await opts.allowStudyKey())) {
      return void res.status(403).json({ error: { code: "forbidden", message: "Self-study answer key toggle is turned off." } });
    }
    const b = z.object({ ids: z.array(z.string().uuid()).min(1).max(50) }).safeParse(req.body);
    if (!b.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid ids" } });
    res.set("Cache-Control", "no-store").json({ answers: await svc.answerKey(b.data.ids) });
  });

  // On-demand Step-by-Step Solution reveal in Practice mode (gated by Admin > Tests > assessment.solutions.allowRevealBefore).
  r.get("/solution/:questionId", rateLimit({ windowMs: 60_000, max: 60 }), async (req, res) => {
    if (opts?.allowRevealSolution && !(await opts.allowRevealSolution())) {
      return void res.status(403).json({ error: { code: "forbidden", message: "Revealing solutions before answering is turned off." } });
    }
    const id = z.string().uuid().safeParse(req.params.questionId);
    if (!id.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid question id" } });
    const sol = await svc.getSolution(id.data);
    if (!sol) return void res.status(404).json({ error: { code: "not_found", message: "Question not found" } });
    res.set("Cache-Control", "no-store").json(sol);
  });

  // 120 answers a minute per IP is far more than a classroom behind one router needs per student, and stops scripts.
  r.post("/answers", rateLimit({ windowMs: 60_000, max: 120, message: "Too many answers too fast. Wait a moment." }), async (req, res) => {
    const body = AnswerRequest.safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid answer", details: body.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) } });
    try {
      res.set("Cache-Control", "no-store").json(await svc.answer(body.data, studentOf ? await studentOf(req) : null));
    } catch (e) {
      if (e instanceof PracticeError) return void res.status(e.status).json({ error: { code: e.status === 404 ? "not_found" : e.status === 409 ? "conflict" : "bad_request", message: e.message } });
      throw e;
    }
  });
  return r;
}
