import { Router, type Request, type Response } from "express";
import type { BookStore } from "./store.js";

const notFound = (res: Response) => void res.status(404).json({ error: { code: "not_found", message: "Book not found" } });

/**
 * Textbooks: the list for the Textbooks pages and the PDF files for the reader.
 * (The invite-code door in app.ts sits in front of these routes like every other /api route.)
 */
export function bookRoutes(store: BookStore, enabled: () => Promise<boolean>): Router {
  const r = Router();
  r.use(async (_req, res, next) => {
    try { if (!(await enabled())) return notFound(res); next(); } catch (e) { next(e); }
  });
  r.get("/", (_req, res) => void res.set("Cache-Control", "no-cache").json(store.list()));

  const send = (req: Request, res: Response, p: string | null, name: string) => {
    if (!p) return notFound(res);
    const kind = req.query.download === "1" ? "attachment" : "inline";
    const ascii = name.replace(/[^A-Za-z0-9._-]/g, "_");
    res.sendFile(p, {
      acceptRanges: true, // pdf.js reads big books a piece at a time
      dotfiles: "deny",
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${kind}; filename="${ascii}"`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    }, (err) => {
      if (!err || res.headersSent) return;
      // a range past the end of the file is the reader's mistake (416); anything else: say nothing about the disk
      if ((err as { status?: number }).status === 416) return void res.status(416).json({ error: { code: "range", message: "Range not satisfiable" } });
      notFound(res);
    });
  };
  r.get("/pages/:cls/:book/:file", (req, res) => {
    const p = store.pagePath(String(req.params.cls), String(req.params.book), String(req.params.file));
    if (!p) return notFound(res);
    res.sendFile(p, { dotfiles: "deny", headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=604800, immutable", "X-Content-Type-Options": "nosniff" } }, (err) => { if (err && !res.headersSent) notFound(res); });
  });
  r.get("/file/:cls/:name", (req, res) => send(req, res, store.filePath(String(req.params.cls), String(req.params.name)), String(req.params.name)));
  r.get("/file/:cls/:book/:chapter", (req, res) => send(req, res, store.filePath(String(req.params.cls), String(req.params.book), String(req.params.chapter)), `${String(req.params.book)}-${String(req.params.chapter)}`));
  return r;
}
