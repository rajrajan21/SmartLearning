import { Router, type Request, type Response } from "express";
import { existsSync } from "node:fs";
import { z } from "zod";
import { requireAdmin } from "../settings/admin-auth.js";
import { isSecretField, type SocialStore } from "./store.js";
import type { SocialService } from "./service.js";

const fail = (res: Response, e: unknown, code = 400) => void res.status(code).json({ error: { code: "social_error", message: e instanceof Error ? e.message : "Something went wrong" } });

/** Public: the built pictures and reels, under random 24-letter names. Instagram has to download the reel from a public address; nothing else is served from here. */
export function socialMediaRoute(store: SocialStore): Router {
  const r = Router();
  r.get("/:name", (req: Request, res: Response) => {
    const name = String(req.params.name ?? "");
    if (!/^[a-f0-9]{24}\.(jpg|mp4)$/.test(name)) return void res.status(404).end();
    const p = store.mediaPath(name); if (!existsSync(p)) return void res.status(404).end();
    res.set("Cache-Control", "public, max-age=3600").set("X-Robots-Tag", "noindex").type(name.endsWith(".mp4") ? "video/mp4" : "image/jpeg").sendFile(p);
  });
  return r;
}

export function adminSocialRoutes(svc: SocialService, store: SocialStore, adminKey: string | null, adminUserId?: string): Router {
  const r = Router(); r.use(requireAdmin(adminKey, adminUserId));
  const wrap = (f: (req: Request, res: Response) => Promise<void> | void) => (req: Request, res: Response) => { Promise.resolve(f(req, res)).catch((e) => fail(res, e)); };
  r.get("/status", wrap(async (_q, res) => void res.set("Cache-Control", "no-store").json(await svc.status())));
  // keys: write-only. The page only learns whether each one is saved, never its value.
  r.get("/secrets", (_q, res) => void res.set("Cache-Control", "no-store").json({ saved: store.secretsStatus() }));
  r.put("/secrets", wrap((req, res) => {
    const body = z.record(z.string(), z.string().max(600)).safeParse(req.body);
    if (!body.success || Object.keys(body.data).length === 0) return void res.status(400).json({ error: { code: "bad_request", message: "Send { fbPageId, fbPageToken, igUserId, igToken, appId, appSecret } (only the ones you want to change; an empty text removes it)." } });
    const bad = Object.keys(body.data).filter((k) => !isSecretField(k)); if (bad.length) return void res.status(400).json({ error: { code: "bad_request", message: `Unknown field: ${bad[0]}` } });
    for (const [k, v] of Object.entries(body.data)) if (/(Id|appId)$/.test(k) && v.trim() && !/^\d{5,25}$/.test(v.trim())) return void res.status(400).json({ error: { code: "bad_request", message: `${k} must be the numeric id from Meta (digits only).` } });
    store.saveSecrets(body.data); res.json({ saved: store.secretsStatus() });
  }));
  r.delete("/secrets", (_q, res) => { store.clearSecrets(); res.json({ saved: store.secretsStatus() }); });
  r.post("/test-connection", wrap(async (_q, res) => void res.json(await svc.testConnection())));
  r.post("/preview", wrap(async (req, res) => {
    const options = z.object({ lessonId: z.string().regex(/^[a-z0-9-]{2,180}$/).optional() }).parse(req.body ?? {});
    const rec = await svc.run({ live: false, lessonId: options.lessonId });
    res.json({ run: rec, entries: svc.byRun(rec.id) });
  }));
  r.post("/run", wrap(async (req, res) => { const b = z.object({ auto: z.boolean().optional(), live: z.boolean().optional() }).safeParse(req.body ?? {}); res.json({ run: await svc.run({ auto: b.success ? !!b.data.auto : false, live: b.success ? !!b.data.live : false }) }); }));
  r.get("/history", wrap((req, res) => { const limit = z.coerce.number().int().min(1).max(500).catch(100).parse(req.query.limit); const st = typeof req.query.status === "string" ? req.query.status : undefined; res.set("Cache-Control", "no-store").json({ entries: svc.history(limit, st) }); }));
  r.post("/retry/:rid", wrap(async (req, res) => { const e = await svc.retry(String(req.params.rid)); if (!e) return void res.status(404).json({ error: { code: "not_found", message: "No such post, or it is already posted." } }); res.json({ entry: e }); }));
  r.post("/ledger/reset", wrap((req, res) => { const b = z.object({ scope: z.enum(["previews", "failed"]), confirm: z.literal(true) }).safeParse(req.body); if (!b.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send { scope: 'previews' | 'failed', confirm: true }" } }); res.json({ removed: svc.resetLedger(b.data.scope) }); }));
  r.post("/resume", (_q, res) => { svc.resume(); res.json({ ok: true }); });
  return r;
}
