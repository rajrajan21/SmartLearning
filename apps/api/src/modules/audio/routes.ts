import { Router } from "express";
import type { AudioStore } from "./manifest.js";

/** Recorded teacher speech. File names are content hashes, so they can be cached for a year. */
export function audioRoutes(store: AudioStore): Router {
  const r = Router();
  r.get("/phrases", (_req, res) => void res.set("Cache-Control", "public, max-age=300").json(store.phrases()));
  r.get("/:file", (req, res) => {
    const p = store.filePath(String(req.params.file));
    if (!p) return void res.status(404).json({ error: { code: "not_found", message: "Audio not found" } });
    res.set("Cache-Control", "public, max-age=31536000, immutable").type("audio/mpeg").sendFile(p); // sendFile handles Range requests (needed for seeking and Safari)
  });
  return r;
}
