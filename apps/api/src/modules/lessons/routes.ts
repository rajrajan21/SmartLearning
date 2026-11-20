import { Router } from "express";
import { z } from "zod";
import type { LessonService } from "./service.js";

const code = z.string().regex(/^[A-Za-z0-9_-]{1,20}$/);
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);

export function lessonRoutes(svc: LessonService, maxAge: () => Promise<number>): Router {
  const r = Router();
  r.use(async (_req, res, next) => {
    const age = await maxAge();
    res.set("Cache-Control", age > 0 ? `public, max-age=${age}, stale-while-revalidate=${age * 12}` : "no-store");
    next();
  });
  // Which topics have a published lesson (the web app matches these ids to its curriculum tree).
  // Every board with its published-lesson counts (home page board switcher).
  r.get("/board-summary", async (_req, res) => void res.json({ boards: await svc.boardSummary() }));
  r.get("/available", async (_req, res) => void res.json({ topicIds: await svc.publishedTopicIds() }));

  r.get("/boards/:board/:classLevel/:subject/:chapter/:topic", async (req, res) => {
    const q = z.object({ board: code, classLevel: z.coerce.number().int().min(1).max(12), subject: slug, chapter: slug, topic: slug }).safeParse(req.params);
    if (!q.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid path" } });
    const lesson = await svc.getPublished(q.data.board, q.data.classLevel, q.data.subject, q.data.chapter, q.data.topic);
    if (!lesson) return void res.status(404).json({ error: { code: "not_found", message: "Lesson not found" } });
    res.json(lesson);
  });
  return r;
}
