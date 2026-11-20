import { describe, expect, it } from "vitest";
import { PROJECTS, projectFor } from "./projects";
describe("projects", () => {
  it("every project has both languages", () => { for (const p of PROJECTS) for (const f of [p.title, p.steps, p.share]) { expect(f.en.length).toBeGreaterThan(3); expect(f.ta.length).toBeGreaterThan(3); } });
  it("stays the same within a week and moves on", () => { const a = projectFor(new Date(2026, 10, 16)); expect(projectFor(new Date(2026, 10, 16))).toBe(a); expect(projectFor(new Date(2026, 10, 30))).not.toBe(a); });
});
