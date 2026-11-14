import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { makeRepo, seedFile } from "./helpers.js";

describe("serving the web app from the API server", () => {
  it("serves the page shell, hashed assets, and falls back to it for app routes but not for the API", async () => {
    const dir = mkdtempSync(join(tmpdir(), "web-"));
    mkdirSync(join(dir, "assets"));
    writeFileSync(join(dir, "index.html"), "<html>SHELL</html>");
    writeFileSync(join(dir, "sw.js"), "// worker");
    writeFileSync(join(dir, "assets", "app-abc.js"), "console.log(1)");
    const m = await makeRepo(seedFile());
    const app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, adminKey: null, webDir: dir });
    const home = await request(app).get("/cbse/3/maths").expect(200);
    expect(home.text).toContain("SHELL");
    expect(home.headers["cache-control"]).toBe("no-cache");
    expect((await request(app).get("/assets/app-abc.js").expect(200)).headers["cache-control"]).toContain("immutable");
    expect((await request(app).get("/sw.js").expect(200)).headers["cache-control"]).toBe("no-cache");
    await request(app).get("/api/v1/nothing").expect(404).expect((r) => expect(r.body.error.code).toBe("not_found"));
    await request(app).get("/health").expect(200);
  });
  it("does not serve a site when no web folder is set", async () => {
    const m = await makeRepo(seedFile());
    const app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, adminKey: null });
    await request(app).get("/cbse/3/maths").expect(404);
  });
});
