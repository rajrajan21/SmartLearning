import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../settings/admin-auth.js";
import type { GkStore } from "./store.js";

const id = z.string().regex(/^[a-z0-9][a-z0-9-]{1,60}$/);

/** GK: the list (filters are done in the browser) and one lesson with its teacher recordings. Nothing a reader does is sent here. */
export function gkRoutes(store: GkStore, enabled: () => Promise<boolean>): Router {
  const r = Router();
  r.use(async (_req, res, next) => { try { if (!(await enabled())) return void res.status(404).json({ error: { code: "not_found", message: "GK is switched off" } }); next(); } catch (e) { next(e); } });
  r.get("/index", (_req, res) => void res.set("Cache-Control", "no-cache").json(store.index()));
  r.get("/lessons/:id", (req, res) => {
    const q = id.safeParse(req.params.id);
    const teacher = req.query.teacher === undefined ? { success: true as const, data: undefined } : z.string().regex(/^[a-z0-9_-]{1,20}$/).safeParse(req.query.teacher);
    const l = q.success && teacher.success ? store.lesson(q.data, teacher.data) : null;
    if (!l) return void res.status(404).json({ error: { code: "not_found", message: "Lesson not found" } });
    res.set("Cache-Control", "public, max-age=120").json(l);
  });
  return r;
}

/** Admin only: what content exists, and re-read content/gk without restarting. */
export function adminGkRoutes(store: GkStore, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  r.get("/report", (_req, res) => void res.json(store.report()));
  r.post("/reload", (_req, res) => { store.reload(); res.json(store.report()); });
  return r;
}
