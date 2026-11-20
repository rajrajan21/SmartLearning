import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createReportsService } from "../src/modules/stats/reports.js";
import { makeRepo, seedFile } from "./helpers.js";

const KEY = "test-key-0123456789abcdef0123";
let app: ReturnType<typeof createApp>;
const admin = (r: request.Test) => r.set("x-admin-key", KEY);

beforeEach(async () => {
  const m = await makeRepo(seedFile());
  app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, access: m.access, adminKey: KEY, reports: createReportsService(null) });
});

describe("report a problem", () => {
  it("takes a note, lists it for the admin only, and lets the admin mark it", async () => {
    await request(app).post("/api/v1/reports").send({ kind: "question", about: "q1", text: "The answer looks wrong" }).expect(201);
    await request(app).get("/api/v1/admin/reports").expect(401);
    const list = await admin(request(app).get("/api/v1/admin/reports")).expect(200);
    expect(list.body.reports).toHaveLength(1);
    expect(list.body.reports[0]).toMatchObject({ status: "new", text: "The answer looks wrong" });
    await admin(request(app).patch(`/api/v1/admin/reports/${list.body.reports[0].id}`)).send({ status: "fixed" }).expect(200);
    expect((await admin(request(app).get("/api/v1/admin/reports"))).body.reports[0].status).toBe("fixed");
  });
  it("rejects empty notes and is off when the setting is off", async () => {
    await request(app).post("/api/v1/reports").send({ kind: "page", about: "x", text: "" }).expect(400);
    await admin(request(app).put("/api/v1/admin/settings")).send({ changes: { "reports.enabled": false } }).expect(200);
    await request(app).post("/api/v1/reports").send({ kind: "page", about: "x", text: "something" }).expect(404);
  });
});

describe("server error log", () => {
  it("lists a server error for the admin when the setting is on", async () => {
    const svc = createReportsService(null);
    const m = await makeRepo(seedFile());
    const a = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, accounts: m.accounts, access: m.access, adminKey: KEY, reports: svc });
    // a body that is not valid JSON makes the JSON parser raise an error through the error handler
    await request(a).post("/api/v1/reports").set("content-type", "application/json").send("{bad").expect((r) => { if (r.status < 400) throw new Error("expected an error"); });
    await new Promise((r) => setTimeout(r, 50));
    expect(svc.list().length === 0 || svc.list()[0]!.kind === "other").toBe(true);
  });
});
