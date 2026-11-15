import { dayNumber } from "@studysmart/shared";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const id1 = "00000000-0000-4000-8000-000000000001";
const day = dayNumber();
const me = { user: { id: "u1", email: "mum@example.com" }, profiles: [{ id: id1, nickname: "Riya", classLevel: 3, avatar: "fox", language: "en" }], activeProfileId: id1 };
const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [
  { id: "s1", slug: "evs", name: { en: "EVS" }, chapters: [{ id: "c1", position: 1, slug: "water", name: { en: "Water" }, topics: [{ id: "w1", slug: "saving", name: { en: "Saving water" } }] }] },
  { id: "s2", slug: "maths", name: { en: "Maths" }, chapters: [{ id: "c2", position: 1, slug: "money", name: { en: "Money" }, topics: [{ id: "m1", slug: "rupees", name: { en: "Using rupees" } }] }] }] }] };
const dash = { children: [{ profile: me.profiles[0],
  progress: { lesson: { w1: { step: 2, total: 2, done: true, updatedAt: Date.now() } }, practice: { m1: { "1": { best: 20, stars: 0, passed: false, tries: 2 } } }, revision: {} },
  activeDays: [day, day - 1], daily: { [day]: { n: 8, right: 6 } }, attempts: 8, correct: 6, weak: [] }] };

function mount(settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.endsWith("/account/me")) return ok(me);
    if (url.includes("/account/dashboard")) return ok(dash);
    if (url.includes("/lessons/available")) return ok({ topicIds: ["w1"] });
    if (url.includes("/practice/available")) return ok({ topicIds: ["m1"], rounds: { m1: [1] } });
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path: "/parent", static: false });
  return render(<Router hook={hook}><SettingsProvider><AccountProvider><Layout><Routes /></Layout></AccountProvider></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("parent view round 2", () => {
  it("weekly summary uses plain words and names topics", async () => {
    mount();
    const box = await screen.findByRole("region", { name: "This week at a glance" });
    expect(box.textContent).toMatch(/Riya was active on 2 of the last 7 days/);
    expect(box.textContent).toMatch(/About 8 minutes/); // 8 answers x 0.5 + 1 lesson x 4
    expect(within(box).getByText("Saving water")).toBeTruthy();
    expect(within(box).getByText(/Using rupees/)).toBeTruthy();
    expect(within(box).getByRole("button", { name: "Print this summary" })).toBeTruthy();
  });
  it("one card per subject with recent and tricky topics", async () => {
    mount();
    const cards = await screen.findByRole("region", { name: "By subject" });
    const items = within(cards).getAllByRole("listitem");
    expect(items.length).toBe(2);
    expect(items[0]!.textContent).toMatch(/EVS/); expect(items[0]!.textContent).toMatch(/Finished this week: Saving water/);
    expect(items[1]!.textContent).toMatch(/Needs another look: Using rupees/);
  });
  it("summary and cards can be switched off", async () => {
    mount({ "parent.weeklySummary.show": false, "parent.subjectCards.show": false });
    await screen.findByText(/learned on 2 of the last 7 days/);
    expect(screen.queryByRole("region", { name: "This week at a glance" })).toBeNull();
    expect(screen.queryByRole("region", { name: "By subject" })).toBeNull();
  });
});
