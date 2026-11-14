import { Router } from "express";
import { z } from "zod";
import type { CurriculumRepository } from "./repository.js";

const BoardParam = z.object({ board: z.string().regex(/^[A-Za-z0-9_-]{1,20}$/) });

export function curriculumRoutes(repo: CurriculumRepository): Router {
  const r = Router();

  r.get("/boards", async (_req, res) => {
    res.json({ boards: await repo.listBoards() });
  });

  r.get("/boards/:board", async (req, res) => {
    const parsed = BoardParam.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: { code: "bad_request", message: "Invalid board code" } });
      return;
    }
    const board = await repo.getBoard(parsed.data.board);
    if (!board) {
      res.status(404).json({ error: { code: "not_found", message: "Board not found" } });
      return;
    }
    res.json(board);
  });

  return r;
}
