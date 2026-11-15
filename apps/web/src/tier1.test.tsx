import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import { levelCounts, firstLessonHref, pathNodes, recentLessons, lessonsToday } from "./lib/round2";
import { MasteryBar } from "./components/Tier1";

const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [{ id: "s", slug: "maths", name: { en: "Maths" }, chapters: [{ id: "c", position: 1, slug: "shapes", name: { en: "Shapes" }, topics: ["a", "b", "c", "d", "e", "f"].map((x) => ({ id: x, slug: x, name: { en: `Topic ${x}` } })) }] }] }] };
const prog = (done: boolean, at: number, step = 1) => ({ step, total: 4, done, updatedAt: at });
const NOW = Date.now();

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.includes("/lessons/available")) return ok({ topicIds: ["b", "c"] });
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("tier 1 logic", () => {
  it("counts topics per mastery step", () => {
    expect(levelCounts([{ level: "new", pct: 0 }, { level: "mastered", pct: 100 }, { level: "mastered", pct: 95 }])).toEqual({ new: 1, learning: 0, practising: 0, strong: 0, mastered: 2 });
  });
  it("sample lesson is the first topic that has a lesson", () => {
    expect(firstLessonHref(tree, "CBSE", new Set(["c", "b"]))).toBe("/cbse/3/maths/shapes/b/learn");
    expect(firstLessonHref(tree, "CBSE", new Set())).toBeNull();
  });
  it("path windows around the current topic and colours by progress", () => {
    const p = { a: prog(true, 1), b: prog(true, 2), c: prog(true, 3), d: prog(false, 4) };
    const nodes = pathNodes(tree, p, "CBSE", undefined, 4);
    expect(nodes.map((n) => n.state)).toEqual(["done", "done", "now", "todo"].slice(0, 4).map((x, i) => (i === 2 ? "now" : x)));
    expect(nodes.find((n) => n.state === "now")!.id).toBe("d");
    expect(pathNodes(tree, {}, "CBSE", undefined, 3).map((n) => n.state)).toEqual(["now", "todo", "todo"]);
    expect(pathNodes({ classes: [] }, {}, "CBSE", undefined, 3)).toEqual([]);
  });
  it("recent lessons are newest first, skip the continue card's topic and unstarted ones", () => {
    const p = { a: prog(true, 5), b: prog(false, 9), c: { step: 0, total: 4, done: false, updatedAt: 20 }, d: prog(false, 7) };
    expect(recentLessons(tree, p, "CBSE", 5, "b").map((r) => r.id)).toEqual(["d", "a"]);
    expect(recentLessons(tree, p, "CBSE", 1).map((r) => r.id)).toEqual(["b"]);
  });
  it("daily goal counts only lessons finished today", () => {
    expect(lessonsToday({ a: prog(true, NOW), b: prog(true, NOW - 3 * 86_400_000), c: prog(false, NOW) }, NOW)).toBe(1);
  });
});

describe("tier 1 screens", () => {
  it("mastery bar has an accessible text summary", () => {
    render(<SettingsProvider><MasteryBar label="How well" list={[{ level: "new", pct: 0 }, { level: "strong", pct: 80 }]} /></SettingsProvider>);
    expect(screen.getByRole("img", { name: /How well: 1 Not started, 1 Proficient/ })).toBeTruthy();
  });
  it("home: free lesson button, path, recent row and goal chip", async () => {
    localStorage.setItem("ss_progress_v1", JSON.stringify({ a: prog(true, NOW), b: prog(false, NOW - 1000), c: prog(false, NOW - 5000) }));
    mount("/");
    const tryBtn = await screen.findByRole("link", { name: /Try a free lesson now/ });
    expect(tryBtn.getAttribute("href")).toBe("/cbse/3/maths/shapes/b/learn");
    expect(screen.getByRole("region", { name: "Your learning path" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Pick up where you left off" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(/Today's goal: 1\/1/);
  });
  it("home: each new block can be switched off", async () => {
    mount("/", { "home.tryLesson.show": false, "home.path.show": false, "rewards.dailyGoal.enabled": false, "home.continue.show": false });
    await screen.findByRole("heading", { level: 1 });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("link", { name: /Try a free lesson/ })).toBeNull();
    expect(screen.queryByRole("region", { name: "Your learning path" })).toBeNull();
    expect(screen.queryByText(/Today's goal/)).toBeNull();
  });
});
