import { describe, it, expect } from "vitest";
import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrateEnablePapersJob, migrateEnableSections } from "./migrate-enable.js";

function fake(values: Record<string, unknown>) {
  const calls: Record<string, unknown>[] = [];
  return { calls, svc: { all: async () => values, update: async (c: Record<string, unknown>) => { calls.push(c); Object.assign(values, c); return values; } } as never };
}
describe("enable-sections migration", () => {
  it("switches the sections on once and then leaves later admin choices alone", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mig-")), marker = join(dir, "m", "enable.json");
    const f = fake({ "feature.library": false, "feature.papers": true, "feature.gk": false, "tour.footer.show": false });
    const first = await migrateEnableSections(f.svc, marker);
    expect(first.sort()).toEqual(["feature.gk", "feature.library", "tour.footer.show"]);
    expect(existsSync(marker)).toBe(true);
    const g = fake({ "feature.library": false });
    expect(await migrateEnableSections(g.svc, marker)).toEqual([]);
    expect(g.calls.length).toBe(0);
  });
});

describe("papers collector job migration", () => {
  it("switches the job on once and then respects a later admin choice", async () => {
    const dir = mkdtempSync(join(tmpdir(), "mig-")), marker = join(dir, "m", "papers.json");
    const f = fake({ "papers.job.enabled": false });
    expect(await migrateEnablePapersJob(f.svc, marker)).toEqual(["papers.job.enabled"]);
    const g = fake({ "papers.job.enabled": false });
    expect(await migrateEnablePapersJob(g.svc, marker)).toEqual([]);
    expect(g.calls.length).toBe(0);
  });
});
