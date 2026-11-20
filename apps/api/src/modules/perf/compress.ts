import { brotliCompress, constants, gzip } from "node:zlib";
import { promisify } from "node:util";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { perf } from "./config.js";

const gz = promisify(gzip);
const br = promisify(brotliCompress);
const MIN_BYTES = 1024;
const TEXTY = /^(text\/|application\/(json|javascript|xml|manifest\+json|ld\+json)|image\/svg\+xml)/i;
const STATIC_EXT = new Set([".js", ".mjs", ".css", ".html", ".svg", ".json", ".txt", ".webmanifest", ".xml", ".map"]);
const TYPES: Record<string, string> = { ".js": "application/javascript; charset=utf-8", ".mjs": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json", ".xml": "application/xml", ".map": "application/json" };

/** "br" or "gzip" when the browser accepts it (br preferred), else null. */
export function pickEncoding(header: string | undefined): "br" | "gzip" | null {
  if (!header) return null;
  const want = (name: string) => new RegExp(`(^|[,\\s])${name}\\s*(;\\s*q=([0-9.]+))?\\s*(,|$)`, "i").exec(header);
  const ok = (m: RegExpExecArray | null) => !!m && (m[3] === undefined || Number(m[3]) > 0);
  if (ok(want("br"))) return "br";
  if (ok(want("gzip"))) return "gzip";
  return null;
}

async function pack(enc: "br" | "gzip", data: Buffer, fast: boolean): Promise<Buffer> {
  return enc === "br"
    ? br(data, { params: { [constants.BROTLI_PARAM_QUALITY]: fast ? 4 : 9, [constants.BROTLI_PARAM_SIZE_HINT]: data.length } })
    : gz(data, { level: fast ? 5 : 9 });
}

/**
 * Makes API answers smaller on the wire (gzip or brotli) by wrapping res.json. Off when the admin switches
 * "perf.compress.enabled" off. Does not need an extra package.
 */
export function compressJson(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const original = res.json.bind(res);
    res.json = (body?: unknown) => {
      if (!perf().compress) return original(body);
      const enc = pickEncoding(req.headers["accept-encoding"] as string | undefined);
      if (!enc || res.getHeader("Content-Encoding") || req.method === "HEAD") return original(body);
      const text = JSON.stringify(body);
      if (text === undefined || text.length < MIN_BYTES) return original(body);
      void pack(enc, Buffer.from(text), true).then((buf) => {
        res.vary("Accept-Encoding");
        res.setHeader("Content-Encoding", enc);
        if (!res.getHeader("Content-Type")) res.type("application/json; charset=utf-8");
        res.send(buf);
      }).catch(() => original(body));
      return res;
    };
    next();
  };
}

interface Cached { mtimeMs: number; size: number; raw: Buffer; br?: Buffer; gzip?: Buffer; etag: string }
const cache = new Map<string, Cached>();
const MAX_CACHE_BYTES = 80 * 1024 * 1024;
let cacheBytes = 0;

/**
 * Serves the website's text files (js, css, html, svg, json) compressed. Each file is compressed once (best quality, brotli
 * or gzip) and kept in memory until it changes. Anything else falls through to the normal static handler.
 */
export function compressedStatic(dir: string): RequestHandler {
  const root = normalize(dir);
  return async (req, res, next) => {
    try {
      if ((req.method !== "GET" && req.method !== "HEAD") || !perf().compress) return next();
      const ext = extname(req.path).toLowerCase();
      if (!STATIC_EXT.has(ext)) return next();
      const enc = pickEncoding(req.headers["accept-encoding"] as string | undefined);
      if (!enc || req.headers.range) return next();
      const file = normalize(join(root, decodeURIComponent(req.path)));
      if (file !== root && !file.startsWith(root + sep)) return next();
      const st = await stat(file).catch(() => null);
      if (!st || !st.isFile() || st.size < MIN_BYTES) return next();
      let c = cache.get(file);
      if (!c || c.mtimeMs !== st.mtimeMs || c.size !== st.size) {
        if (c) cacheBytes -= c.raw.length;
        const raw = await readFile(file);
        c = { mtimeMs: st.mtimeMs, size: st.size, raw, etag: `W/"${st.size.toString(16)}-${Math.round(st.mtimeMs).toString(16)}"` };
        if (cacheBytes + raw.length > MAX_CACHE_BYTES) { cache.clear(); cacheBytes = 0; }
        cache.set(file, c); cacheBytes += raw.length;
      }
      const body = (c[enc] ??= await pack(enc, c.raw, false));
      if (body.length >= c.raw.length) return next();
      const norm = file.replace(/\\/g, "/");
      const hashed = /\/assets\//.test(norm);
      res.setHeader("Cache-Control", hashed ? "public, max-age=31536000, immutable" : "no-cache");
      res.setHeader("ETag", c.etag);
      res.vary("Accept-Encoding");
      if (req.fresh) return void res.status(304).end();
      res.setHeader("Content-Type", TYPES[ext] ?? "application/octet-stream");
      res.setHeader("Content-Encoding", enc);
      res.setHeader("Content-Length", String(body.length));
      if (req.method === "HEAD") return void res.end();
      res.end(body);
    } catch { next(); }
  };
}
export const isTextType = (t: string) => TEXTY.test(t);
