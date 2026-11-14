import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createMemoryCurriculumRepository } from "../src/modules/curriculum/memory-repository.js";

const app = createApp({ curriculum: createMemoryCurriculumRepository() });

describe("API", () => {
  it("health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
  it("lists boards", async () => {
    const res = await request(app).get("/api/v1/curriculum/boards");
    expect(res.status).toBe(200);
    expect(res.body.boards[0].boardCode).toBe("CBSE");
  });
  it("returns a board hierarchy, case-insensitive", async () => {
    const res = await request(app).get("/api/v1/curriculum/boards/cbse");
    expect(res.status).toBe(200);
    expect(res.body.classes[0].subjects[0].chapters[0].topics.length).toBeGreaterThan(0);
  });
  it("404 for unknown board", async () => {
    const res = await request(app).get("/api/v1/curriculum/boards/XYZ");
    expect(res.status).toBe(404);
  });
  it("400 for malformed board code", async () => {
    const res = await request(app).get("/api/v1/curriculum/boards/a%20b;drop");
    expect(res.status).toBe(400);
  });
  it("404 for unknown route with JSON error", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("not_found");
  });
});
