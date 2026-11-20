import { Router, raw } from "express";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { requireAdmin } from "../settings/admin-auth.js";

/** The slots an admin can fill: a replacement video, cover picture and caption file for each language. */
export const SLOTS = ["video-en", "video-ta", "poster-en", "poster-ta", "vtt-en", "vtt-ta"] as const;
export type Slot = (typeof SLOTS)[number];
const FILE: Record<Slot, string> = { "video-en": "custom-en.mp4", "video-ta": "custom-ta.mp4", "poster-en": "custom-poster-en.jpg", "poster-ta": "custom-poster-ta.jpg", "vtt-en": "custom-en.vtt", "vtt-ta": "custom-ta.vtt" };
const TYPE: Record<string, string> = { mp4: "video/mp4", jpg: "image/jpeg", vtt: "text/vtt; charset=utf-8" };
const LIMIT: Record<string, number> = { video: 60 * 1024 * 1024, poster: 2 * 1024 * 1024, vtt: 256 * 1024 };
export const isSlot = (x: unknown): x is Slot => typeof x === "string" && (SLOTS as readonly string[]).includes(x);
/** Does the start of the file look like what the slot expects? */
export function looksRight(slot: Slot, b: Buffer): boolean {
  if (slot.startsWith("video")) return b.length > 1024 && b.subarray(4, 8).toString() === "ftyp";
  if (slot.startsWith("poster")) return b.length > 16 && b[0] === 0xff && b[1] === 0xd8;
  return b.subarray(0, 6).toString("utf8").replace(/^﻿/, "").startsWith("WEBVTT") || b.subarray(0, 9).toString("utf8").replace(/^﻿/, "").startsWith("WEBVTT");
}

/** Replacement tour videos chosen by the admin, stored as plain files under data/tour. Public GET serves them with range support. */
export function tourRoutes(dir: string, adminKey: string | null, adminUserId?: string) {
  const pub = Router(), adm = Router();
  const have = (s: Slot) => existsSync(join(dir, FILE[s]));
  pub.get("/status", (_req, res) => {
    res.set("Cache-Control", "no-cache").json({ en: { video: have("video-en"), poster: have("poster-en"), vtt: have("vtt-en") }, ta: { video: have("video-ta"), poster: have("poster-ta"), vtt: have("vtt-ta") } });
  });
  pub.get("/files/:name", (req, res) => {
    const name = String(req.params.name ?? "");
    if (!Object.values(FILE).includes(name) || !existsSync(join(dir, name))) return void res.status(404).end();
    res.set({ "Content-Type": TYPE[name.split(".").pop()!]!, "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes" });
    res.sendFile(join(dir, name), { headers: { "Content-Type": TYPE[name.split(".").pop()!]! } });
  });
  adm.use(requireAdmin(adminKey, adminUserId));
  adm.get("/", (_req, res) => {
    let files: { slot: Slot; name: string; bytes: number; at: string }[] = [];
    try { const present = new Set(readdirSync(dir)); files = SLOTS.filter((s) => present.has(FILE[s])).map((s) => { const st = statSync(join(dir, FILE[s])); return { slot: s, name: FILE[s], bytes: st.size, at: st.mtime.toISOString() }; }); } catch { /* nothing uploaded yet */ }
    res.set("Cache-Control", "no-store").json({ files, maxVideoMB: LIMIT.video! / 1048576 });
  });
  adm.put("/:slot", raw({ type: () => true, limit: LIMIT.video }), (req, res) => {
    const slot = req.params.slot;
    if (!isSlot(slot)) return void res.status(404).json({ error: { code: "not_found", message: "Unknown slot" } });
    const body = req.body as Buffer;
    const kind = slot.split("-")[0]!;
    if (!Buffer.isBuffer(body) || body.length > LIMIT[kind]! || !looksRight(slot, body)) return void res.status(400).json({ error: { code: "bad_file", message: kind === "video" ? "Please choose an MP4 video up to 60 MB." : kind === "poster" ? "Please choose a JPG picture up to 2 MB." : "Please choose a .vtt caption file." } });
    mkdirSync(dir, { recursive: true });
    const tmp = join(dir, `${FILE[slot]}.tmp-${process.pid}`);
    writeFileSync(tmp, body); renameSync(tmp, join(dir, FILE[slot]));
    res.json({ ok: true, bytes: body.length });
  });
  adm.delete("/:slot", (req, res) => { const s = req.params.slot; if (isSlot(s)) rmSync(join(dir, FILE[s]), { force: true }); res.status(204).end(); });
  return { pub, adm };
}
