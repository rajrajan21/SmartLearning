import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Router } from "express";
import { z } from "zod";
import { Model3Lesson } from "@studysmart/shared";
import type { CurriculumRepository } from "../curriculum/repository.js";
import type { ClassroomService } from "./service.js";
import { classroomDir } from "../../server-paths.js";

const code = z.string().regex(/^[A-Za-z0-9_-]{1,20}$/);
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);

export function classroomRoutes(svc: ClassroomService, enabled: () => Promise<boolean>, maxAge: () => Promise<number>, curriculum: CurriculumRepository): Router {
  const r = Router();
  r.use(async (_req, res, next) => {
    if (!(await enabled())) return void res.status(404).json({ error: { code: "disabled", message: "Classroom lessons are switched off" } });
    const age = await maxAge();
    res.set("Cache-Control", age > 0 ? `public, max-age=${Math.min(age, 60)}` : "no-store");
    next();
  });
  r.get("/index", (_req, res) => void res.json(svc.index()));
  r.get("/model3/:board/:classLevel/:subject/:chapter", (req, res) => {
    const q = z.object({ board: code, classLevel: z.coerce.number().int().min(1).max(12), subject: slug, chapter: slug }).safeParse(req.params);
    if (!q.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid path" } });
    const file = join(resolve(classroomDir, "../model3"), `${q.data.board.toLowerCase()}-${q.data.classLevel}-${q.data.subject}-${q.data.chapter}.json`);
    if (!existsSync(file)) return void res.status(404).json({ error: { code: "not_found", message: "Model 3.0 lesson not found" } });
    try {
      const parsed = Model3Lesson.safeParse(JSON.parse(readFileSync(file, "utf8")));
      if (!parsed.success) return void res.status(500).json({ error: { code: "invalid_model3", message: "Invalid Model 3.0 lesson" } });
      return void res.json(parsed.data);
    } catch {
      return void res.status(404).json({ error: { code: "not_found", message: "Model 3.0 lesson not found" } });
    }
  });
  r.get("/:board/:classLevel/:subject/:chapter/:topic", async (req, res, next) => {
    const q = z.object({ board: code, classLevel: z.coerce.number().int().min(1).max(12), subject: slug, chapter: slug, topic: slug }).safeParse(req.params);
    if (!q.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid path" } });
    const v = typeof req.query.voice === "string" && /^[a-z0-9-]{1,20}$/.test(req.query.voice) ? req.query.voice : undefined;
    const l = svc.get(q.data.board, q.data.classLevel, q.data.subject, q.data.chapter, q.data.topic, v);
    if (!l) return void res.status(404).json({ error: { code: "not_found", message: "Classroom lesson not found" } });
    try {
      const detail = await curriculum.getTopic(l.board, l.classLevel, l.subject, l.chapter, l.topic);
      res.json({ ...l, topicId: detail?.topic.id });
    } catch (error) { next(error); }
  });
  return r;
}
