import { Router, type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { z } from "zod";
import type { SettingValue } from "@studysmart/shared";
import { rateLimit } from "../../http/rate-limit.js";
import { requireAdmin } from "../settings/admin-auth.js";
import type { SettingsService } from "../settings/service.js";
import { ACCESS_COOKIE, type AccessService } from "./service.js";
import { renderGatePage } from "./gate-page.js";

const readAccessCookie = (req: Request): string | undefined => {
  for (const part of (req.headers.cookie ?? "").split(";")) { const i = part.indexOf("="); if (part.slice(0, i).trim() === ACCESS_COOKIE) return decodeURIComponent(part.slice(i + 1).trim()); }
  return undefined;
};

/** Closed only when the mode is "invite" AND the pause switch (access.inviteCodeRequired) is on. */
export const isGated = (v: Record<string, SettingValue>): boolean => v["access.mode"] === "invite" && v["access.inviteCodeRequired"] !== false;

export interface AccessOptions { service: AccessService; settings: SettingsService; secureCookie: boolean; headExtra?: () => string; redeemMax?: number }

/** Public: GET /status and POST /redeem (mounted at /api/access). */
export function accessRoutes(o: AccessOptions): Router {
  const r = Router();
  r.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  r.get("/status", async (req, res) => {
    const v = await o.settings.all();
    const gated = isGated(v);
    const granted = !gated || (await o.service.verifyCookie(readAccessCookie(req))) !== null;
    res.json({ mode: gated ? "invite" : "public", granted, message: v["access.gate.message"] });
  });
  r.post("/redeem", rateLimit({ windowMs: 10 * 60 * 1000, max: o.redeemMax ?? 10, message: "Too many tries. Please wait a few minutes and try again." }), async (req, res, next) => {
    try {
      const body = z.object({ code: z.string().min(1).max(60) }).safeParse(req.body);
      if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: "Send { code }" } });
      const result = await o.service.redeem(body.data.code);
      if (!result.ok) return void res.status(401).json({ error: { code: "invalid_code", message: "That code did not work. Check it, or ask for a new one." } });
      const days = Number((await o.settings.all())["access.cookieDays"]) || 30;
      res.append("Set-Cookie", `${ACCESS_COOKIE}=${encodeURIComponent(o.service.signCookie(result.codeId, days * 86400))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${days * 86400}${o.secureCookie ? "; Secure" : ""}`);
      res.json({ ok: true });
    } catch (e) { next(e); }
  });
  return r;
}

/** Admin: list / create / cancel codes (mounted at /api/v1/admin/access, same ADMIN_KEY as the rest of admin). */
export function adminAccessRoutes(service: AccessService, settings: SettingsService, adminKey: string | null, adminUserId?: string): Router {
  const r = Router();
  r.use(requireAdmin(adminKey, adminUserId));
  r.get("/codes", async (_req, res) => void res.set("Cache-Control", "no-store").json({ codes: await service.list() }));
  r.post("/codes", async (req, res, next) => {
    try {
      const body = z.object({
        label: z.string().trim().max(60).optional(),
        maxUses: z.number().int().min(0).max(100000).nullable().optional(), // 0 or null = unlimited
        expiresInDays: z.number().int().min(0).max(3650).nullable().optional(), // 0 or null = never
        expiresAt: z.string().datetime().nullable().optional(),
      }).safeParse(req.body ?? {});
      if (!body.success) return void res.status(400).json({ error: { code: "bad_request", message: "Check the label (max 60 letters), uses and expiry." } });
      const v = await settings.all();
      const b = body.data;
      const maxUses = b.maxUses === undefined ? Number(v["access.newCode.maxUses"]) : b.maxUses ?? 0;
      const days = b.expiresInDays === undefined ? Number(v["access.newCode.expiryDays"]) : b.expiresInDays ?? 0;
      const expiresAt = b.expiresAt ? new Date(b.expiresAt) : days > 0 ? new Date(Date.now() + days * 86400_000) : null;
      if (expiresAt && expiresAt.getTime() <= Date.now()) return void res.status(400).json({ error: { code: "bad_request", message: "The expiry must be in the future." } });
      res.status(201).json({ code: await service.create({ label: b.label, maxUses: maxUses > 0 ? maxUses : null, expiresAt }) });
    } catch (e) { next(e); }
  });
  r.post("/codes/:id/revoke", async (req, res, next) => {
    try {
      const id = z.string().uuid().safeParse(req.params.id);
      if (!id.success) return void res.status(400).json({ error: { code: "bad_request", message: "Bad code id" } });
      (await service.revoke(id.data)) ? res.json({ ok: true }) : res.status(404).json({ error: { code: "not_found", message: "No such active code" } });
    } catch (e) { next(e); }
  });
  return r;
}

const EXEMPT_TREES = ["/health", "/api/access", "/api/v1/admin", "/admin", "/assets"]; // the path itself and everything under it
const EXEMPT_FILES = ["/manifest.webmanifest", "/robots.txt", "/sitemap.xml", "/sw.js"];
const isExempt = (p: string) =>
  EXEMPT_TREES.some((x) => p === x || p.startsWith(`${x}/`)) || EXEMPT_FILES.includes(p) || /^\/(icon[\w.-]*|apple-touch-icon[\w.-]*|favicon[\w.-]*)$/.test(p);

/**
 * The door. While the site is Invitation only, anything except the exempt paths needs a valid access cookie.
 * API calls get 401 { code: "access_required" }; page loads get the invite-code page.
 * (/assets are the public program files; no lessons or questions are in them. /admin stays reachable so the owner can always switch back.)
 */
export function accessGate(o: AccessOptions): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isExempt(req.path)) return next();
      const v = await o.settings.all();
      if (!isGated(v)) return next();
      if ((await o.service.verifyCookie(readAccessCookie(req))) !== null) return next();
      res.set("Cache-Control", "no-store");
      if (req.path.startsWith("/api/")) return void res.status(401).json({ error: { code: "access_required", message: "This site is open by invitation only. Enter your invite code." } });
      res.status(200).type("html").send(renderGatePage(v["access.gate.message"] as { en: string; ta?: string }, o.headExtra?.() ?? ""));
    } catch (e) { next(e); }
  };
}
