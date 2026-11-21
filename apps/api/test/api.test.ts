import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { makeRepo } from "./helpers.js";

let app: ReturnType<typeof createApp>;
beforeAll(async () => { const m = await makeRepo(); app = createApp({ curriculum: m.repo, settings: m.settings, lessons: m.lessons, practice: m.practice, adminKey: "test-key-0123456789abcdef0123" }); });
const base = "/api/v1/curriculum";

describe("API", () => {
  it("health", async () => {
    expect((await request(app).get("/health")).body.status).toBe("ok");
  });
  it("boards + years", async () => {
    expect((await request(app).get(`${base}/boards`)).body.boards[0].boardCode).toBe("CBSE");
    expect((await request(app).get(`${base}/boards/cbse/years`)).body.years).toHaveLength(1);
  });
  it("returns the Class 3 tree, case-insensitive, cacheable", async () => {
    const res = await request(app).get(`${base}/boards/cbse`);
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toMatch(/max-age/);
    const subjects = res.body.classes[0].subjects;
    expect(subjects.map((s: { textbook: { title: string } }) => s.textbook.title).sort()).toEqual(["Maths Mela", "Our Wondrous World"]);
  });
  it("year filter", async () => {
    expect((await request(app).get(`${base}/boards/cbse?year=2026-27`)).status).toBe(200);
    expect((await request(app).get(`${base}/boards/cbse?year=1999-00`)).status).toBe(404);
    expect((await request(app).get(`${base}/boards/cbse?year=bad`)).status).toBe(400);
  });
  it("topic detail", async () => {
    const res = await request(app).get(`${base}/boards/cbse/topics/3/maths/toy-joy/toy-patterns`);
    expect(res.status).toBe(200);
    expect(res.body.prerequisites[0].topicSlug).toBe("counting-toys");
    expect((await request(app).get(`${base}/boards/cbse/topics/3/maths/toy-joy/ghost`)).status).toBe(404);
    expect((await request(app).get(`${base}/boards/cbse/topics/99/maths/toy-joy/x`)).status).toBe(400);
  });
  it("search validates and finds", async () => {
    const { body } = await request(app).get(`${base}/boards/cbse/search?q=shapes`).expect(200);
    expect(body.hits).toEqual(expect.arrayContaining([expect.objectContaining({ name: expect.objectContaining({ en: "Fun with Shapes" }) })]));
    expect((await request(app).get(`${base}/boards/cbse/search`)).status).toBe(400);
    expect((await request(app).get(`${base}/boards/cbse/search?q=${"a".repeat(81)}`)).status).toBe(400);
  });
  it("coverage and diff", async () => {
    expect((await request(app).get(`${base}/boards/cbse/coverage`)).body.totals.chapters).toBe(60);
    expect((await request(app).get(`${base}/boards/cbse/diff?from=2026-27`)).status).toBe(400);
    expect((await request(app).get(`${base}/boards/cbse/diff?from=2026-27&to=2030-31`)).status).toBe(404);
  });
  it("errors", async () => {
    expect((await request(app).get(`${base}/boards/XYZ`)).status).toBe(404);
    expect((await request(app).get(`${base}/boards/a%20b;drop`)).status).toBe(400);
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("not_found");
  });
});
