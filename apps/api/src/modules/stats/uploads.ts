import { Router, raw } from "express";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { requireAdmin } from "../settings/admin-auth.js";

const KINDS = ["logo", "banner"] as const;
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MAGIC: Record<string, (b: Buffer) => boolean> = {
  "image/png": (b) => b.subarray(0, 4).toString("hex") === "89504e47",
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8,
  "image/webp": (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP",
};

/** Logo and banner pictures chosen by the admin: stored as plain files, served as images only. */
export function uploadRoutes(dir: string, adminKey: string | null, adminUserId?: string) {
  const pub = Router(), adm = Router();
  const path = (k: string) => join(dir, `${k}.bin`), meta = (k: string) => join(dir, `${k}.type`);
  pub.get("/:kind", (req, res) => {
    const k = req.params.kind as string;
    if (!(KINDS as readonly string[]).includes(k) || !existsSync(path(k))) return void res.status(404).end();
    res.set({ "Content-Type": readFileSync(meta(k), "utf8"), "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'" }).send(readFileSync(path(k)));
  });
  adm.use(requireAdmin(adminKey, adminUserId));
  adm.put("/:kind", raw({ type: Object.keys(TYPES), limit: "2mb" }), (req, res) => {
    const k = req.params.kind as string, type = String(req.header("content-type") ?? "").split(";")[0]!;
    if (!(KINDS as readonly string[]).includes(k)) return void res.status(404).end();
    const body = req.body as Buffer;
    if (!TYPES[type] || !Buffer.isBuffer(body) || body.length < 16 || !MAGIC[type]!(body)) return void res.status(400).json({ error: { code: "bad_image", message: "Please choose a PNG, JPG or WebP picture up to 2 MB." } });
    mkdirSync(dir, { recursive: true }); writeFileSync(path(k), body); writeFileSync(meta(k), type);
    res.json({ version: Math.floor(Date.now() / 1000) });
  });
  adm.delete("/:kind", (req, res) => { const k = req.params.kind as string; if ((KINDS as readonly string[]).includes(k)) { rmSync(path(k), { force: true }); rmSync(meta(k), { force: true }); } res.status(204).end(); });
  return { pub, adm };
}
