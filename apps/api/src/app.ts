import { existsSync } from "node:fs";
import { join } from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import type { CurriculumRepository } from "./modules/curriculum/repository.js";
import { curriculumRoutes } from "./modules/curriculum/routes.js";
import { practiceRoutes } from "./modules/practice/routes.js";
import type { PracticeService } from "./modules/practice/service.js";
import { audioRoutes } from "./modules/audio/routes.js";
import type { AudioStore } from "./modules/audio/manifest.js";
import { lessonRoutes } from "./modules/lessons/routes.js";
import type { LessonService } from "./modules/lessons/service.js";
import { classroomRoutes } from "./modules/classroom/routes.js";
import type { ClassroomService } from "./modules/classroom/service.js";
import { tutorRoutes } from "./modules/tutor/routes.js";
import type { createTutorService } from "./modules/tutor/service.js";
import { accountRoutes, readCookie } from "./modules/accounts/routes.js";
import type { AccountService } from "./modules/accounts/service.js";
import { adminSettingsRoutes, publicSettingsRoutes } from "./modules/settings/routes.js";
import type { SettingsService } from "./modules/settings/service.js";
import { SITE } from "@studysmart/shared";
import { accessGate, accessRoutes, adminAccessRoutes, isGated } from "./modules/access/routes.js";
import type { AccessService } from "./modules/access/service.js";
import { bookRoutes } from "./modules/books/routes.js";
import type { BookStore } from "./modules/books/store.js";
import type { StatsService } from "./modules/stats/service.js";
import { adminStatsRoutes, statsBeacon } from "./modules/stats/routes.js";
import { uploadRoutes } from "./modules/stats/uploads.js";

export interface AppDeps {
  curriculum: CurriculumRepository;
  settings: SettingsService;
  lessons: LessonService;
  practice: PracticeService;
  /** parent accounts; omit to leave the account routes off */
  accounts?: AccountService;
  /** the question helper; omit to leave it off */
  tutor?: ReturnType<typeof createTutorService>;
  /** set the Secure flag on the session cookie (true in production behind HTTPS) */
  secureCookie?: boolean;
  /** board lessons; omit to leave them off */
  classroom?: ClassroomService;
  /** recorded teacher speech; omit to disable the audio route */
  audio?: AudioStore;
  /** downloaded textbooks (content/books); omit to leave the Textbooks API off */
  books?: BookStore;
  /** folder with the built web app (apps/web/dist); when set, this server also serves the site itself */
  webDir?: string;
  /** invite-code access mode (codes, cookie, the door); omit to leave the whole feature off */
  access?: AccessService;
  /** accept at most this many code tries per IP per 10 minutes (default 10) */
  accessRedeemMax?: number;
  /** null = admin API disabled */
  adminKey: string | null;
  /** When set, admin sign-in also needs this user id (x-admin-user header, case-insensitive). server.ts always sets it. */
  adminUserId?: string;
  /** visitor / sign-up / server counters; omit to leave reports off */
  stats?: StatsService;
  /** for tests: replaces fetch when checking Google/Facebook tokens */
  fetcher?: import("./modules/accounts/social.js").Fetcher;
  /** where admin-uploaded logo and banner pictures are kept; omit to leave uploads off */
  uploadsDir?: string;
}

export function createApp(deps: AppDeps) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1); // behind Caddy / Cloudflare: use the real client IP for rate limits
  app.use(express.json({ limit: "200kb" }));
  if (deps.uploadsDir) { const u = uploadRoutes(deps.uploadsDir, deps.adminKey, deps.adminUserId); app.use("/uploads", u.pub); app.use("/api/v1/admin/upload", u.adm); }
  if (deps.stats) {
    const st = deps.stats;
    app.use((req, res, next) => {
      res.on("finish", async () => {
        if (!req.path.startsWith("/api/")) return;
        st.count("requests"); if (res.statusCode >= 500) st.count("errors");
        if (req.method !== "POST") return;
        if (req.originalUrl.startsWith("/api/v1/account/register") && res.statusCode === 201) st.count("signups");
        else if (req.originalUrl.startsWith("/api/v1/account/login") && res.statusCode === 200) st.count("logins");
        else if (/^\/api\/v1\/practice\/answers/.test(req.originalUrl) && res.statusCode < 300) st.count("questions");
      });
      next();
    });
    app.use("/api/v1/track", statsBeacon(st, deps.settings));
    app.use("/api/v1/admin/stats", adminStatsRoutes(st, deps.adminKey, deps.adminUserId));
  }

  app.get("/health", (_req, res) => void res.json({ status: "ok", service: "studysmart-api" }));

  if (deps.access) {
    const ao = { service: deps.access, settings: deps.settings, secureCookie: deps.secureCookie ?? false, redeemMax: deps.accessRedeemMax };
    app.use("/api/access", accessRoutes(ao));
    app.use("/api/v1/admin/access", adminAccessRoutes(deps.access, deps.settings, deps.adminKey, deps.adminUserId));
    app.use(accessGate(ao)); // Invitation only: everything below needs the access cookie (health, access, admin, icons are let through)
  }

  // Search engines: robots.txt and sitemap.xml come from the one SITE constant (pages are shut to crawlers while Invitation only).
  app.get("/robots.txt", async (_req, res) => {
    const closed = isGated(await deps.settings.all());
    res.type("text/plain").set("Cache-Control", "no-cache").send(closed ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
  });
  app.get("/sitemap.xml", (_req, res) => {
    const urls = ["/", "/about", "/privacy", "/terms"].map((p) => `  <url><loc>${SITE.url}${p === "/" ? "/" : p}</loc></url>`).join("\n");
    res.type("application/xml").set("Cache-Control", "no-cache").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  });

  app.use("/api/v1/settings", publicSettingsRoutes(deps.settings));
  app.use("/api/v1/admin", adminSettingsRoutes(deps.settings, deps.adminKey, deps.adminUserId));

  // Maintenance mode: public data routes answer 503 with a clear message (admin and settings stay available).
  app.use(["/api/v1/curriculum", "/api/v1/lessons", "/api/v1/classroom", "/api/v1/audio", "/api/v1/practice", "/api/v1/account", "/api/v1/tutor", "/api/books"], async (_req, res, next) => {
    const v = await deps.settings.all();
    if (v["site.maintenance.enabled"] === true) {
      return void res.status(503).set("Retry-After", "600").json({ error: { code: "maintenance", message: (v["site.maintenance.message"] as { en: string }).en } });
    }
    next();
  });
  app.use("/api/v1/curriculum", curriculumRoutes(deps.curriculum, async () => Number((await deps.settings.all())["site.cache.maxAgeSeconds"])));

  app.use("/api/v1/lessons", lessonRoutes(deps.lessons, async () => Number((await deps.settings.all())["site.cache.maxAgeSeconds"])));

  if (deps.classroom) app.use("/api/v1/classroom", classroomRoutes(deps.classroom, async () => (await deps.settings.all())["feature.classroom"] === true, async () => Number((await deps.settings.all())["site.cache.maxAgeSeconds"])));

  app.use("/api/v1/practice", practiceRoutes(deps.practice, async () => Number((await deps.settings.all())["site.cache.maxAgeSeconds"]), async (req) => (deps.accounts ? (await deps.accounts.session(readCookie(req)))?.studentId ?? null : null), async (req) => {
    if (!deps.accounts) return false;
    const v = await deps.settings.all();
    return v["feature.worksheets"] === true && v["worksheets.answerKey"] === true && (await deps.accounts.session(readCookie(req))) !== null;
  }));
  if (deps.accounts) app.use("/api/v1/account", accountRoutes(deps.accounts, deps.settings, deps.secureCookie ?? false, deps.fetcher));
  if (deps.tutor) app.use("/api/v1/tutor", tutorRoutes(deps.tutor, deps.settings, async (req) => (deps.accounts ? (await deps.accounts.session(readCookie(req)))?.studentId ?? null : null)));
  if (deps.audio) app.use("/api/v1/audio", audioRoutes(deps.audio));
  if (deps.books) app.use("/api/books", bookRoutes(deps.books, async () => (await deps.settings.all())["feature.textbooks"] === true));

  if (deps.webDir && existsSync(join(deps.webDir, "index.html"))) {
    const dir = deps.webDir;
    app.use(express.static(dir, {
      index: false,
      setHeaders(res, file) {
        // hashed files never change; the page shell and the service worker must always be re-checked so updates reach everyone
        res.setHeader("Cache-Control", /\/assets\//.test(file.replace(/\\/g, "/")) ? "public, max-age=31536000, immutable" : "no-cache");
      },
    }));
    app.get(/^\/(?!api\/|health).*/, (_req, res) => void res.set("Cache-Control", "no-cache").sendFile(join(dir, "index.html")));
  }

  app.use((_req, res) => void res.status(404).json({ error: { code: "not_found", message: "Route not found" } }));

  // Centralised error handling: never leak internals or child data.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("unhandled_error", err instanceof Error ? err.message : "unknown");
    res.status(500).json({ error: { code: "internal", message: "Something went wrong" } });
  });
  return app;
}
