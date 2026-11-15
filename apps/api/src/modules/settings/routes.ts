import { Router, type Response } from "express";
import { z } from "zod";
import { PANELS, SETTINGS, THEME_PRESETS } from "@studysmart/shared";
import { requireAdmin } from "./admin-auth.js";
import { SettingsError, type SettingsService } from "./service.js";

const ACTOR = "admin"; // replaced by the signed-in user's id in Module 6
const fail = (res: Response, e: unknown) =>
  e instanceof SettingsError ? void res.status(400).json({ error: { code: "invalid_setting", message: e.message } }) : void res.status(500).json({ error: { code: "internal", message: "Something went wrong" } });

export function publicSettingsRoutes(svc: SettingsService): Router {
  const r = Router();
  r.get("/public", async (req, res) => {
    const { values, version } = await svc.getPublic();
    res.set("ETag", `"${version}"`).set("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    if (req.header("if-none-match") === `"${version}"`) return void res.status(304).end();
    res.json({ version, values });
  });
  return r;
}

export function adminSettingsRoutes(svc: SettingsService, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  r.get("/session", (_req, res) => void res.json({ ok: true }));

  r.get("/settings", async (_req, res) => {
    res.set("Cache-Control", "no-store").json({ panels: PANELS, definitions: SETTINGS, presets: THEME_PRESETS, values: await svc.all(), overridden: await svc.overrides() });
  });

  r.put("/settings", async (req, res) => {
    const body = z.object({ changes: z.record(z.string(), z.unknown()).refine((c) => Object.keys(c).length > 0 && Object.keys(c).length <= 200, "send 1 to 200 changes") }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send { changes: { key: value } }" } });
    try { res.json({ values: await svc.update(body.data.changes, ACTOR), overridden: await svc.overrides() }); } catch (e) { fail(res, e); }
  });

  r.post("/settings/reset", async (req, res) => {
    const body = z.object({ keys: z.array(z.string()).min(1).max(200) }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send { keys: [...] }" } });
    try { res.json({ values: await svc.reset(body.data.keys, ACTOR), overridden: await svc.overrides() }); } catch (e) { fail(res, e); }
  });

  r.get("/settings/export", async (_req, res) => {
    res.set("Content-Disposition", 'attachment; filename="sharpstudy-settings.json"').json(await svc.exportAll());
  });

  r.post("/settings/import", async (req, res) => {
    const body = z.object({ values: z.record(z.string(), z.unknown()) }).safeParse(req.body);
    if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send the exported file contents: { values: {...} }" } });
    try { res.json({ values: await svc.update(body.data.values, ACTOR, "import"), overridden: await svc.overrides() }); } catch (e) { fail(res, e); }
  });

  r.get("/settings/audit", async (req, res) => {
    const limit = z.coerce.number().int().min(1).max(200).catch(50).parse(req.query.limit);
    res.set("Cache-Control", "no-store").json({ entries: await svc.audit(limit) });
  });
  return r;
}
