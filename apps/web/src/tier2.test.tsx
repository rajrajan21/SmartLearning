import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import { themeOf, exploreItems, roughMinutes, levelOf, toggleNote, readNotebook } from "./lib/tier2";

const topics = [["w1", "saving-water", "Saving water", "Water Gift"], ["p1", "parts", "Parts of a plant", "Plants"], ["n1", "count", "Counting rupees", "Money"]];
const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [
  { id: "s1", slug: "evs", name: { en: "EVS" }, chapters: [{ id: "c1", position: 1, slug: "water", name: { en: "Water Gift" }, topics: [{ id: "w1", slug: "saving-water", name: { en: "Saving water" } }] }, { id: "c2", position: 2, slug: "plants", name: { en: "Plants" }, topics: [{ id: "p1", slug: "parts", name: { en: "Parts of a plant" } }] }] },
  { id: "s2", slug: "maths", name: { en: "Maths" }, chapters: [{ id: "c3", position: 1, slug: "money", name: { en: "Money" }, topics: [{ id: "n1", slug: "count", name: { en: "Counting rupees" } }] }] }] }] };
const lesson = { topicId: "w1", version: 1, status: "published", title: { en: "Saving water" }, blocks: [{ id: "a", type: "explanation", provenance: "original", text: { en: "Close the tap." } }] };
void topics;

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.includes("/lessons/available")) return ok({ topicIds: ["w1"] });
    if (url.includes("/lessons/boards")) return ok(lesson);
    if (url.includes("/topics/")) return ok({ topic: { id: "w1", slug: "saving-water", name: { en: "Saving water" } }, chapter: { slug: "water", position: 1, name: { en: "Water Gift" } }, subject: { slug: "evs", name: { en: "EVS" } }, classLevel: 3, objectives: [], prerequisites: [], unlocks: [], previous: null, next: null });
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider waitForLatest><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("tier 2 logic", () => {
  it("sorts topics into colour themes by keyword, with a catch-all", () => {
    expect(themeOf("Saving water").id).toBe("water");
    expect(themeOf("Parts of a plant", "Getting to Know Plants").id).toBe("plants");
    expect(themeOf("Counting rupees").id).toBe("numbers");
    expect(themeOf("Zzz").id).toBe("more");
  });
  it("filters explore items by class, subject and theme", () => {
    expect(exploreItems(tree, "CBSE", [3]).length).toBe(3);
    expect(exploreItems(tree, "CBSE", [3], { subject: "evs" }).map((i) => i.id)).toEqual(["w1", "p1"]);
    expect(exploreItems(tree, "CBSE", [3], { theme: "numbers" }).map((i) => i.id)).toEqual(["n1"]);
    expect(exploreItems(tree, "CBSE", [3], { cls: 4 })).toEqual([]);
    expect(exploreItems(tree, "CBSE", [4])).toEqual([]);
  });
  it("minutes and level are simple and predictable", () => {
    expect(roughMinutes(4)).toBe(24); expect(roughMinutes(-1)).toBe(0);
    expect(levelOf(0, 0)).toEqual({ level: 1, toNext: 50, pct: 0 });
    expect(levelOf(3, 4)).toEqual({ level: 2, toNext: 0 + 50 - 0, pct: 0 }); // 30 + 20 = 50 points
    expect(levelOf(2, 1)).toMatchObject({ level: 1, toNext: 25, pct: 50 });
  });
  it("notebook saves and removes on this device only", () => {
    const e = { id: "w1", href: "/x", title: { en: "A" }, subject: { en: "B" } };
    expect(toggleNote(e)).toBe(true); expect(Object.keys(readNotebook())).toEqual(["w1"]);
    expect(toggleNote(e)).toBe(false); expect(readNotebook()).toEqual({});
  });
});

describe("tier 2 screens", () => {
  it("explore page groups by theme and filters", async () => {
    mount("/explore");
    const water = await screen.findByRole("region", { name: "Water" });
    expect(within(water).getByRole("link", { name: /Saving water/ }).getAttribute("href")).toBe("/cbse/3/evs/water/saving-water");
    fireEvent.click(screen.getByRole("button", { name: /Numbers and money/ }));
    expect(screen.queryByRole("region", { name: "Water" })).toBeNull();
    expect(screen.getByRole("region", { name: "Numbers and money" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "3" } });
    expect(screen.getByRole("region", { name: "Numbers and money" })).toBeTruthy();
  });
  it("explore page can be switched off", async () => {
    mount("/explore", { "browse.explore.enabled": false });
    await screen.findByText(/could not find that page/i);
  });
  it("chapter page: mission wording and syllabus preview, each switchable", async () => {
    mount("/cbse/3/evs/water");
    const syl = await screen.findByRole("region", { name: "Your mission" });
    expect(syl.textContent).toMatch(/1 topics · about 6 minutes/);
    expect(screen.getByText("Mission 1")).toBeTruthy();
    cleanup();
    mount("/cbse/3/evs/water", { "browse.syllabus.show": false, "browse.missionWording.show": false });
    await screen.findByText("Chapter 1");
    expect(screen.queryByRole("region", { name: "Your mission" })).toBeNull();
  });
  it("subject page shows the learning path of chapters", async () => {
    mount("/cbse/3/evs");
    const path = await screen.findByRole("navigation", { name: "Your path through this subject" });
    expect(within(path).getAllByRole("link").length).toBeGreaterThanOrEqual(2);
    cleanup();
    mount("/cbse/3/evs", { "browse.path.show": false });
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("navigation", { name: "Your path through this subject" })).toBeNull();
  });
  it("lesson heart saves to my notebook, which lists it and lets it be removed", async () => {
    mount("/cbse/3/evs/water/saving-water/learn");
    fireEvent.click(await screen.findByRole("button", { name: /Save to my notebook/ }));
    expect(readNotebook()["w1"]?.href).toBe("/cbse/3/evs/water/saving-water/learn");
    cleanup();
    mount("/notebook");
    expect(await screen.findByRole("link", { name: /Saving water/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Remove from notebook/ }));
    expect(await screen.findByText(/Nothing saved yet/)).toBeTruthy();
  });
  it("the topic page has a heart too, so every topic can be saved", async () => {
    mount("/cbse/3/evs/water/saving-water");
    fireEvent.click(await screen.findByRole("button", { name: /Save to my notebook/ }));
    expect(Object.values(readNotebook())[0]?.href).toBe("/cbse/3/evs/water/saving-water");
  });
  it("notebook can be switched off (no heart in lessons)", async () => {
    mount("/cbse/3/evs/water/saving-water/learn", { "notebook.enabled": false });
    await screen.findByText("Close the tap.");
    expect(screen.queryByRole("button", { name: /Save to my notebook/ })).toBeNull();
  });
  it("progress page: level and certificate, switchable", async () => {
    localStorage.setItem("ss_progress_v1", JSON.stringify({ w1: { step: 1, total: 1, done: true, updatedAt: Date.now() } }));
    mount("/progress");
    expect(await screen.findByText("Level 1")).toBeTruthy();
    expect(screen.getByText("Certificate of Learning")).toBeTruthy();
    expect(screen.getByText(/has finished 1 lessons/)).toBeTruthy();
    cleanup();
    mount("/progress", { "rewards.level.show": false, "rewards.certificate.show": false });
    await screen.findByRole("heading", { name: "My progress" });
    expect(screen.queryByText("Certificate of Learning")).toBeNull();
  });
  it("top menu lists the main pages on wide screens", async () => {
    mount("/");
    const nav = await screen.findByRole("navigation", { name: "Pages" });
    expect(within(nav).getAllByRole("link").map((a) => a.textContent)).toEqual(expect.arrayContaining(["Home", "Subjects", "Explore", "My notebook"]));
  });
});
