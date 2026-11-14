import { Router, type Response } from "express";
import { z } from "zod";
import type { CurriculumRepository } from "./repository.js";

const code = z.string().regex(/^[A-Za-z0-9_-]{1,20}$/);
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);
const year = z.string().regex(/^\d{4}-\d{2}$/);
const bad = (res: Response, message: string) => res.status(400).json({ error: { code: "bad_request", message } });
const missing = (res: Response, what: string) => res.status(404).json({ error: { code: "not_found", message: `${what} not found` } });

export function curriculumRoutes(repo: CurriculumRepository, maxAge: () => Promise<number>): Router {
  const r = Router();
  r.use(async (_req, res, next) => {
    const age = await maxAge();
    res.set("Cache-Control", age > 0 ? `public, max-age=${age}, stale-while-revalidate=${age * 12}` : "no-store");
    next();
  });
  const cache = (res: Response) => res;

  r.get("/boards", async (_req, res) => {
    cache(res).json({ boards: await repo.listBoards() });
  });

  r.get("/boards/:board/years", async (req, res) => {
    const b = code.safeParse(req.params.board);
    if (!b.success) return void bad(res, "Invalid board code");
    const years = await repo.listYears(b.data);
    if (years.length === 0) return void missing(res, "Board");
    cache(res).json({ years });
  });

  r.get("/boards/:board", async (req, res) => {
    const q = z.object({ board: code, year: year.optional() }).safeParse({ board: req.params.board, year: req.query.year });
    if (!q.success) return void bad(res, "Invalid board code or year");
    const board = await repo.getBoard(q.data.board, q.data.year);
    if (!board) return void missing(res, "Board");
    cache(res).json(board);
  });

  r.get("/boards/:board/topics/:classLevel/:subject/:chapter/:topic", async (req, res) => {
    const q = z.object({ board: code, classLevel: z.coerce.number().int().min(1).max(12), subject: slug, chapter: slug, topic: slug }).safeParse(req.params);
    if (!q.success) return void bad(res, "Invalid path");
    const detail = await repo.getTopic(q.data.board, q.data.classLevel, q.data.subject, q.data.chapter, q.data.topic);
    if (!detail) return void missing(res, "Topic");
    cache(res).json(detail);
  });

  r.get("/boards/:board/search", async (req, res) => {
    const q = z.object({ board: code, q: z.string().trim().min(1).max(80), limit: z.coerce.number().int().min(1).max(50).default(20) }).safeParse({ board: req.params.board, q: req.query.q, limit: req.query.limit });
    if (!q.success) return void bad(res, "Provide a search term of 1 to 80 characters");
    cache(res).json({ hits: await repo.search(q.data.board, q.data.q, q.data.limit) });
  });

  r.get("/boards/:board/diff", async (req, res) => {
    const q = z.object({ board: code, from: year, to: year }).safeParse({ board: req.params.board, from: req.query.from, to: req.query.to });
    if (!q.success) return void bad(res, "Provide from and to academic years like 2025-26");
    const diff = await repo.diff(q.data.board, q.data.from, q.data.to);
    if (!diff) return void missing(res, "One of the academic years");
    cache(res).json(diff);
  });

  r.get("/boards/:board/coverage", async (req, res) => {
    const q = z.object({ board: code, year: year.optional() }).safeParse({ board: req.params.board, year: req.query.year });
    if (!q.success) return void bad(res, "Invalid board code or year");
    const report = await repo.coverage(q.data.board, q.data.year);
    if (!report) return void missing(res, "Board");
    cache(res).json(report);
  });

  return r;
}
