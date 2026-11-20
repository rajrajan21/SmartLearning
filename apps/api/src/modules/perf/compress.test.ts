import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer, request, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync, brotliDecompressSync } from "node:zlib";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { compressedStatic, compressJson, pickEncoding } from "./compress.js";
import { setPerf } from "./config.js";

let server: Server | undefined;
const dirs: string[] = [];
afterEach(() => { setPerf({}); server?.close(); server = undefined; while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });

const get = (port: number, path: string, headers: Record<string, string> = {}) => new Promise<{ status: number; headers: Record<string, unknown>; body: Buffer }>((resolve, reject) => {
  const r = request({ port, path, headers }, (res) => { const parts: Buffer[] = []; res.on("data", (c) => parts.push(c)); res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(parts) })); });
  r.on("error", reject); r.end();
});
const listen = (app: express.Express) => new Promise<number>((ok) => { server = createServer(app).listen(0, () => ok((server!.address() as { port: number }).port)); });

describe("pickEncoding", () => {
  it("prefers br, then gzip, and respects q=0", () => {
    expect(pickEncoding("gzip, deflate, br")).toBe("br");
    expect(pickEncoding("gzip, deflate")).toBe("gzip");
    expect(pickEncoding("br;q=0, gzip")).toBe("gzip");
    expect(pickEncoding("identity")).toBeNull();
    expect(pickEncoding(undefined)).toBeNull();
  });
});

describe("compressJson", () => {
  const big = { items: Array.from({ length: 200 }, (_, i) => ({ id: i, name: `lesson number ${i}` })) };
  it("sends big answers compressed when switched on, and untouched when off", async () => {
    const app = express(); app.use(compressJson()); app.get("/big", (_q, r) => void r.json(big)); app.get("/small", (_q, r) => void r.json({ a: 1 }));
    const port = await listen(app);
    setPerf({ "perf.compress.enabled": true });
    const a = await get(port, "/big", { "Accept-Encoding": "gzip" });
    expect(a.headers["content-encoding"]).toBe("gzip");
    expect(JSON.parse(gunzipSync(a.body).toString())).toEqual(big);
    const b = await get(port, "/big", { "Accept-Encoding": "br" });
    expect(JSON.parse(brotliDecompressSync(b.body).toString())).toEqual(big);
    const s = await get(port, "/small", { "Accept-Encoding": "gzip" });
    expect(s.headers["content-encoding"]).toBeUndefined();
    const none = await get(port, "/big");
    expect(none.headers["content-encoding"]).toBeUndefined();
    expect(JSON.parse(none.body.toString())).toEqual(big);
    setPerf({ "perf.compress.enabled": false });
    const off = await get(port, "/big", { "Accept-Encoding": "gzip" });
    expect(off.headers["content-encoding"]).toBeUndefined();
  });
});

describe("compressedStatic", () => {
  it("serves text files compressed with an ETag and answers 304, and ignores paths outside the folder", async () => {
    const dir = mkdtempSync(join(tmpdir(), "cs-")); dirs.push(dir); mkdirSync(join(dir, "assets"));
    const js = "console.log('hello world');\n".repeat(200);
    writeFileSync(join(dir, "assets", "app-abc.js"), js);
    const app = express(); app.use(compressedStatic(dir)); app.use((_q, r) => void r.status(404).end("fallthrough"));
    const port = await listen(app);
    setPerf({ "perf.compress.enabled": true });
    const a = await get(port, "/assets/app-abc.js", { "Accept-Encoding": "br, gzip" });
    expect(a.headers["content-encoding"]).toBe("br");
    expect(brotliDecompressSync(a.body).toString()).toBe(js);
    expect(String(a.headers["cache-control"])).toContain("immutable");
    const again = await get(port, "/assets/app-abc.js", { "Accept-Encoding": "br", "If-None-Match": String(a.headers.etag) });
    expect(again.status).toBe(304);
    const out = await get(port, "/..%2f..%2fetc/passwd.json", { "Accept-Encoding": "gzip" });
    expect(out.status).toBe(404);
    const plain = await get(port, "/assets/app-abc.js");
    expect(plain.body.toString()).toBe("fallthrough");
  });
});
