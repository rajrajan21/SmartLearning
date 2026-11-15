import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import { computeStreak, dayNumber, totalStars } from "./lib/streak";
import { chapterFrac, subjectFrac, findContinue, subjectIcon } from "./lib/browseStats";
import { clampPct } from "./components/TextSize";
import { SETTINGS_BY_KEY } from "@studysmart/shared";

const tree = {
  boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27",
  classes: [{ classLevel: 3, subjects: [{ id: "s1", slug: "maths", name: { en: "Mathematics" }, textbook: { title: "Maths Mela" },
    chapters: [{ id: "c1", slug: "shapes", position: 1, name: { en: "Shapes" }, topics: [{ id: "t1", slug: "sides", name: { en: "Sides" } }, { id: "t2", slug: "corners", name: { en: "Corners" } }] }] }] }],
};

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.includes("/settings/public")) return new Response(JSON.stringify({ values: settings }), { status: 200 });
    if (url.toLowerCase().includes("/curriculum/boards/cbse")) return new Response(JSON.stringify(tree), { status: 200 });
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); document.documentElement.style.removeProperty("--user-scale"); });

describe("streak", () => {
  const t = 20000;
  it("counts consecutive days ending today or yesterday", () => {
    expect(computeStreak([t, t - 1, t - 2], t, 0)).toBe(3);
    expect(computeStreak([t - 1, t - 2], t, 0)).toBe(2);
    expect(computeStreak([], t, 1)).toBe(0);
  });
  it("forgives missed days up to the grace limit", () => {
    expect(computeStreak([t, t - 2, t - 3], t, 1)).toBe(3);
    expect(computeStreak([t, t - 2, t - 3], t, 0)).toBe(1);
    expect(computeStreak([t - 5], t, 1)).toBe(0);
  });
  it("sums stars and maps days locally", () => {
    expect(totalStars({ a: { 1: { stars: 2 }, 2: { stars: 3 } }, b: { 1: { stars: 1 } } })).toBe(6);
    expect(dayNumber(Date.now())).toBeGreaterThan(20000);
  });
});

describe("browse stats", () => {
  const prog = { t1: { step: 3, total: 3, done: true, updatedAt: 5 }, t2: { step: 1, total: 4, done: false, updatedAt: 9 } };
  it("computes fractions", () => {
    expect(chapterFrac(tree.classes[0]!.subjects[0]!.chapters[0]!.topics, prog).pct).toBe(50);
    expect(subjectFrac([], prog).pct).toBe(0);
    expect(subjectIcon("maths")).toBe("🔢"); expect(subjectIcon("zzz")).toBe("📘");
  });
  it("finds the most recent unfinished lesson", () => {
    const c = findContinue(tree as never, prog, "CBSE");
    expect(c?.href).toBe("/cbse/3/maths/shapes/corners/learn");
    expect(findContinue(tree as never, { t1: prog.t1 }, "cbse")).toBeNull();
  });
  it("clamps text size", () => { expect(clampPct(155, 140)).toBe(140); expect(clampPct(50, 140)).toBe(100); });
});

describe("settings registry", () => {
  it("every new feature has an on/off switch and limits", () => {
    for (const k of ["ui.bottomNav.enabled", "ui.textSize.control", "home.continue.show", "home.rewards.show", "rewards.streak.enabled", "browse.chapterProgress.show", "browse.subjectProgress.show"]) expect(SETTINGS_BY_KEY.get(k)?.type).toBe("boolean");
    for (const k of ["ui.textSize.maxPercent", "rewards.streak.graceDays", "rewards.streak.maxShown"]) { const d = SETTINGS_BY_KEY.get(k) as { type: string; min: number; max: number }; expect(d.type).toBe("number"); expect(d.max).toBeGreaterThan(d.min); }
  });
});

describe("redesigned pages", () => {
  it("shows the bottom tab bar and can switch it off", async () => {
    mount("/");
    await waitFor(() => expect(screen.getByRole("navigation", { name: "Main menu" })).toBeTruthy());
    cleanup();
    mount("/", { "ui.bottomNav.enabled": false });
    await waitFor(() => expect(document.querySelector("a.class-tab.on")).toBeTruthy());
    expect(screen.queryByRole("navigation", { name: "Main menu" })).toBeNull();
  });
  it("text size buttons change the scale and respect the limit", async () => {
    mount("/", { "ui.textSize.maxPercent": 110 });
    const bigger = await screen.findByRole("button", { name: "Bigger text" });
    fireEvent.click(bigger);
    expect(document.documentElement.style.getPropertyValue("--user-scale")).toBe("1.1");
    expect((bigger as HTMLButtonElement).disabled).toBe(true);
  });
  it("home offers to continue an unfinished lesson and shows the streak", async () => {
    localStorage.setItem("ss_progress_v1", JSON.stringify({ t2: { step: 1, total: 4, done: false, updatedAt: Date.now() } }));
    mount("/");
    const link = await screen.findByRole("link", { name: "Continue" });
    expect(link.getAttribute("href")).toBe("/cbse/3/maths/shapes/corners/learn");
    expect(document.querySelector(".rewards")?.textContent).toContain("1");
    cleanup();
    mount("/", { "home.continue.show": false, "home.rewards.show": false });
    await waitFor(() => expect(document.querySelector("a.class-tab.on")).toBeTruthy());
    expect(document.querySelector(".continue-card")).toBeNull();
    expect(document.querySelector(".rewards")).toBeNull();
  });
  it("subject notebooks show an icon and progress; chapters show a ring", async () => {
    localStorage.setItem("ss_progress_v1", JSON.stringify({ t1: { step: 3, total: 3, done: true, updatedAt: Date.now() } }));
    mount("/cbse/3");
    await waitFor(() => expect(document.querySelector(".nb-icon")).toBeTruthy());
    expect(document.querySelector(".nb-bar")?.getAttribute("aria-valuenow")).toBe("50");
    cleanup();
    mount("/cbse/3/maths");
    await waitFor(() => expect(document.querySelector(".ring")).toBeTruthy());
    expect(document.querySelector(".ring")?.getAttribute("aria-label")).toBe("50% done");
  });
});
