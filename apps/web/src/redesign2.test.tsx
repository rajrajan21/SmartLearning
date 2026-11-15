import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import { weekCalendar } from "./lib/streak";
import { computeBadges } from "./lib/badges";
import { suggestNext } from "./lib/browseStats";
import { themeVars } from "./lib/theme";
import { contrastOn } from "./components/HighContrast";
import { StepDots } from "./components/StepDots";
import { defaults, SETTINGS_BY_KEY } from "@studysmart/shared";

const tree = {
  classes: [{ classLevel: 3, subjects: [{ id: "s", slug: "maths", name: { en: "Maths" }, chapters: [{ id: "c", position: 1, slug: "shapes", name: { en: "Shapes" }, topics: [{ id: "t1", slug: "sides", name: { en: "Sides" } }, { id: "t2", slug: "corners", name: { en: "Corners" } }, { id: "t3", slug: "faces", name: { en: "Faces" } }] }] }] }],
};
const lesson = { topicId: "t1", version: 1, status: "published", title: { en: "Sides" }, blocks: [
  { id: "a", type: "explanation", provenance: "original", text: { en: "A side is a straight edge." } },
  { id: "b", type: "summary", provenance: "original", points: [{ en: "Triangle has 3." }] },
] };
function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.includes("/lessons/available")) return ok({ topicIds: ["t1"] });
    if (url.includes("/lessons/boards")) return ok(lesson);
    if (url.includes("/topics/")) return ok({ topic: { id: "t1", slug: "sides", name: { en: "Sides" } }, chapter: { slug: "shapes", position: 1, name: { en: "Shapes" } }, subject: { slug: "maths", name: { en: "Maths" } }, classLevel: 3, objectives: [], prerequisites: [], unlocks: [], previous: null, next: null });
    if (url.includes("/curriculum/boards/")) return ok({ boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", ...tree });
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); document.documentElement.removeAttribute("data-contrast"); });

describe("badges", () => {
  it("earn only from saved progress", () => {
    const none = computeBadges({ lessonsDone: 0, stars: 0, streak: 0, results: {} });
    expect(none.every((b) => !b.earned)).toBe(true);
    const some = computeBadges({ lessonsDone: 5, stars: 12, streak: 3, results: { a: { 1: { best: 100, passed: true }, 2: { best: 80, passed: true }, 3: { best: 70, passed: true }, 4: { best: 70, passed: true } } } });
    const got = some.filter((b) => b.earned).map((b) => b.id);
    expect(got).toEqual(expect.arrayContaining(["first-lesson", "five-lessons", "first-round", "stars-10", "perfect", "streak-3", "topic-master"]));
    expect(got).not.toContain("ten-lessons"); expect(got).not.toContain("streak-7");
  });
  it("shows progress towards a locked badge, capped at the target", () => {
    const b = computeBadges({ lessonsDone: 7, stars: 0, streak: 0, results: {} }).find((x) => x.id === "ten-lessons")!;
    expect(b).toMatchObject({ earned: false, have: 7, need: 10 });
    expect(computeBadges({ lessonsDone: 99, stars: 0, streak: 0, results: {} }).find((x) => x.id === "ten-lessons")!.have).toBe(10);
  });
});

describe("week calendar", () => {
  it("marks learned days, oldest first, with today last", () => {
    const c = weekCalendar([100, 98], 100);
    expect(c).toHaveLength(7);
    expect(c[0]!.day).toBe(94); expect(c[6]).toMatchObject({ day: 100, on: true, isToday: true });
    expect(c.filter((d) => d.on).map((d) => d.day)).toEqual([98, 100]);
    expect(weekCalendar([], 20000)[0]!.weekday).toBe(new Date((20000 - 6) * 86_400_000).getUTCDay());
  });
});

describe("what to learn next", () => {
  const p = (done: boolean, at: number, step = 1) => ({ step, total: 3, done, updatedAt: at });
  it("finishes a started lesson first", () => {
    expect(suggestNext(tree, { t2: p(false, 5) }, "CBSE")).toMatchObject({ kind: "finish", href: "/cbse/3/maths/shapes/corners/learn" });
  });
  it("continues after the most recently finished topic", () => {
    expect(suggestNext(tree, { t1: p(true, 9) }, "CBSE")).toMatchObject({ kind: "new", href: "/cbse/3/maths/shapes/corners/learn" });
    expect(suggestNext(tree, { t1: p(true, 5), t2: p(true, 9) }, "CBSE")?.href).toContain("/faces/");
  });
  it("wraps round to earlier unfinished topics, starts at the first when nothing is done, and ends with null", () => {
    expect(suggestNext(tree, { t3: p(true, 9), t2: p(true, 8) }, "CBSE")?.href).toContain("/sides/");
    expect(suggestNext(tree, {}, "CBSE")?.href).toContain("/sides/");
    expect(suggestNext(tree, { t1: p(true, 1), t2: p(true, 2), t3: p(true, 3) }, "CBSE")).toBeNull();
  });
  it("only looks at open classes", () => {
    expect(suggestNext(tree, {}, "CBSE", [4])).toBeNull();
  });
});

describe("settings and theme attributes", () => {
  it("every Round 2 setting exists, is public and has a sensible default", () => {
    const on = ["lesson.readable", "lesson.dots.show", "lesson.nextButton.big", "lesson.listen.stable", "rewards.badges.enabled", "rewards.weekCalendar.show", "progress.nextSuggestion.show", "parent.weeklySummary.show", "a11y.focus.strong", "a11y.targets.large", "a11y.highContrast.control", "ui.mobile.polish"];
    for (const k of on) { const d = SETTINGS_BY_KEY.get(k)!; expect(d.public).toBe(true); expect(d.default).toBe(true); }
    expect(SETTINGS_BY_KEY.get("a11y.highContrast.default")!.default).toBe(false);
  });
  it("turn into root attributes and can be switched off", () => {
    expect(themeVars(defaults(), false).attrs).toMatchObject({ "data-focus": "strong", "data-targets": "large", "data-mobile": "true" });
    expect(themeVars({ ...defaults(), "a11y.focus.strong": false, "a11y.targets.large": false, "ui.mobile.polish": false }, false).attrs).toMatchObject({ "data-focus": "normal", "data-targets": "normal", "data-mobile": "false" });
  });
  it("high contrast: device choice beats site default", () => {
    expect(contrastOn(null, false)).toBe(false); expect(contrastOn(null, true)).toBe(true);
    expect(contrastOn("1", false)).toBe(true); expect(contrastOn("0", true)).toBe(false);
  });
});

describe("components", () => {
  it("step dots mark done, current and later steps; hidden for long lessons", () => {
    const { container, rerender } = render(<StepDots total={4} step={1} lang="en" />);
    expect(container.querySelectorAll(".dot.done")).toHaveLength(1);
    expect(container.querySelector(".dot.now")?.getAttribute("aria-current")).toBe("step");
    expect(container.querySelectorAll(".dot.todo")).toHaveLength(2);
    rerender(<StepDots total={30} step={1} lang="en" />);
    expect(container.querySelector(".dots")).toBeNull();
  });
  it("lesson page: reading layout, dots and a big 'Next step' button; each can be switched off", async () => {
    const view = mount("/cbse/3/maths/shapes/sides/learn");
    await screen.findByText("A side is a straight edge.");
    expect(document.querySelector(".lesson.readable")).toBeTruthy();
    expect(document.querySelectorAll(".dots .dot")).toHaveLength(2);
    const next = screen.getByRole("button", { name: /Next step/ });
    expect(next.className).toContain("big");
    fireEvent.click(next);
    expect(await screen.findByRole("button", { name: "Finish" })).toBeTruthy();
    view.unmount(); cleanup(); localStorage.clear();
    mount("/cbse/3/maths/shapes/sides/learn", { "lesson.readable": false, "lesson.dots.show": false, "lesson.nextButton.big": false });
    await screen.findByText("A side is a straight edge.");
    expect(document.querySelector(".lesson.readable")).toBeNull();
    expect(document.querySelector(".dots")).toBeNull();
    expect(screen.getByRole("button", { name: /Next/ }).className).not.toContain("big");
  });
  it("high-contrast button toggles the root attribute and remembers the choice", async () => {
    mount("/");
    const btn = await screen.findByRole("button", { name: /high-contrast/i });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-contrast")).toBe("high");
    expect(localStorage.getItem("ss_contrast")).toBe("1");
    fireEvent.click(btn);
    expect(document.documentElement.hasAttribute("data-contrast")).toBe(false);
  });
  it("progress page shows next suggestion, week calendar and badges, each behind its own switch", async () => {
    mount("/progress");
    await screen.findByRole("heading", { name: "What to learn next" });
    expect(screen.getByRole("heading", { name: "This week" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /My badges/ })).toBeTruthy();
    expect(document.querySelectorAll(".badge").length).toBe(10);
    cleanup();
    mount("/progress", { "rewards.badges.enabled": false, "rewards.weekCalendar.show": false, "progress.nextSuggestion.show": false });
    await screen.findByRole("heading", { name: "My progress" });
    expect(screen.queryByRole("heading", { name: /My badges/ })).toBeNull();
    expect(screen.queryByRole("heading", { name: "This week" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "What to learn next" })).toBeNull();
  });
});
