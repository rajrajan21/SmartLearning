import { Router } from "express";
import { z } from "zod";
import type { ClassroomService } from "./service.js";

const code = z.string().regex(/^[A-Za-z0-9_-]{1,20}$/);
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);

export function classroomRoutes(svc: ClassroomService, enabled: () => Promise<boolean>, maxAge: () => Promise<number>): Router {
  const r = Router();
  r.use(async (_req, res, next) => {
    if (!(await enabled())) return void res.status(404).json({ error: { code: "disabled", message: "Classroom lessons are switched off" } });
    const age = await maxAge();
    res.set("Cache-Control", age > 0 ? `public, max-age=${Math.min(age, 60)}` : "no-store");
    next();
  });
  r.get("/index", (_req, res) => void res.json(svc.index()));
  r.get("/:board/:classLevel/:subject/:chapter/:topic", (req, res) => {
    const q = z.object({ board: code, classLevel: z.coerce.number().int().min(1).max(12), subject: slug, chapter: slug, topic: slug }).safeParse(req.params);
    if (!q.success) return void res.status(400).json({ error: { code: "bad_request", message: "Invalid path" } });
    const v = typeof req.query.voice === "string" && /^[a-z0-9-]{1,20}$/.test(req.query.voice) ? req.query.voice : undefined;
    const l = svc.get(q.data.board, q.data.classLevel, q.data.subject, q.data.chapter, q.data.topic, v);
    if (!l) return void res.status(404).json({ error: { code: "not_found", message: "Classroom lesson not found" } });
    res.json(l);
  });
  return r;
}
