import express, { type NextFunction, type Request, type Response } from "express";
import type { CurriculumRepository } from "./modules/curriculum/repository.js";
import { curriculumRoutes } from "./modules/curriculum/routes.js";

export interface AppDeps {
  curriculum: CurriculumRepository;
}

export function createApp(deps: AppDeps) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "studysmart-api" });
  });

  app.use("/api/v1/curriculum", curriculumRoutes(deps.curriculum));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "not_found", message: "Route not found" } });
  });

  // Centralised error handling: never leak internals or child data.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("unhandled_error", err instanceof Error ? err.message : "unknown");
    res.status(500).json({ error: { code: "internal", message: "Something went wrong" } });
  });

  return app;
}
