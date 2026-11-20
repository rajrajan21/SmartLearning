import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { createPgliteDb } from "../../db/dev.js";
import { createSettingsService } from "../settings/service.js";
import { adminUsageRoutes } from "./usage.js";

describe("usage report (real database)", () => {
  it("answers with zeros on an empty site", async () => {
    const db = await createPgliteDb();
    const app = express(); app.use("/u", adminUsageRoutes(db, createSettingsService(db), "k", undefined));
    const r = await request(app).get("/u?days=7").set("x-admin-key", "k");
    expect(r.status).toBe(200); expect(r.body.days).toHaveLength(7); expect(r.body.totalAi).toBe(0); expect(r.body.accounts).toBe(0);
  });
});
