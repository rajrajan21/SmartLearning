import express, { type NextFunction, type Request, type Response } from "express";
import type { CurriculumRepository } from "./modules/curriculum/repository.js";
import { curriculumRoutes } from "./modules/curriculum/routes.js";
import { practiceRoutes } from "./modules/practice/routes.js";
import type { PracticeService } from "./modules/practice/service.js";
import { audioRoutes } from "./modules/audio/routes.js";
import type { AudioStore } from "./modules/audio/manifest.js";
import { lessonRoutes } from "./modules/lessons/routes.js";
import type { LessonService } from "./modules/lessons/service.js";
import { accountRoutes, readCookie } from "./modules/accounts/routes.js";
import type { AccountService } from "./modules/accounts/service.js";
import { adminSettingsRoutes, publicSettingsRoutes } from "./modules/settings/routes.js";
import type { SettingsService } from "./modules/settings/service.js";

export interface AppDeps {
  curriculum: CurriculumRepository;
  settings: SettingsService;
  lessons: LessonService;
  practice: PracticeService;
  /** parent accounts; omit to leave the account routes off */
  accounts?: AccountService;
  /** set the Secure flag on the session cookie (true in production behind HTTPS) */
  secureCookie?: boolean;
  /** recorded teacher speech; omit to disable the audio route */
  audio?: AudioStore;
  /** null = admin API disabled */
  adminKey: string | null;
}

export function createApp(deps: AppDeps) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // behind Caddy / Cloudflare: use the real client IP for rate limits
  app.use(express.json({ limit: "200kb" }));

  app.get("/health", (_req, res) => void res.json({ status: "ok", service: "studysmart-api" }));
  app.use("/api/v1/settings", publicSettingsRoutes(deps.settings));
  app.use("/api/v1/admin", adminSettingsRoutes(deps.settings, deps.adminKey));

  // Maintenance mode: public data routes answer 503 with a clear message (admin and settings stay available).
  app.use(["/api/v1/curriculum", "/api/v1/lessons", "/api/v1/audio", "/api/v1/practice", "/api/v1/account"], async (_req, res, next) => {
    const v = await deps.settings.all();
    if (v["site.maintenance.enabled"] === true) {
      return void res.status(503).set("Retry-After", "600").json({ error: { code: "maintenance", message: (v["site.maintenance.message"] as { en: string }).en } });
    }
    next();
  });
  app.use("/api/v1/curriculum", curriculumRoutes(deps.curriculum, async () => Number((await deps.settings.all())["site.cache.maxAgeSeconds"])));

  app.use("/api/v1/lessons", lessonRoutes(deps.lessons, async () => Number((await deps.settings.all())["site.cache.maxAgeSeconds"])));

  app.use("/api/v1/practice", practiceRoutes(deps.practice, async () => Number((await deps.settings.all())["site.cache.maxAgeSeconds"]), async (req) => (deps.accounts ? (await deps.accounts.session(readCookie(req)))?.studentId ?? null : null)));
  if (deps.accounts) app.use("/api/v1/account", accountRoutes(deps.accounts, deps.settings, deps.secureCookie ?? false));
  if (deps.audio) app.use("/api/v1/audio", audioRoutes(deps.audio));

  app.use((_req, res) => void res.status(404).json({ error: { code: "not_found", message: "Route not found" } }));

  // Centralised error handling: never leak internals or child data.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("unhandled_error", err instanceof Error ? err.message : "unknown");
    res.status(500).json({ error: { code: "internal", message: "Something went wrong" } });
  });
  return app;
}
