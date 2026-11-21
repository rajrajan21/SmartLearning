import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { GK_ANIMATED_VISUALS } from "@studysmart/shared";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import { GK_VISUAL_IDS } from "./components/gk/visuals";
import { dailyPick } from "./lib/gk.pick";

const item = (id: string, title: string, category: string, age: string, kind = "lesson") => ({ id, kind, category, age, title, summary: `About ${title} for curious learners`, emoji: "🌍", tags: [], steps: 2, hasAnimation: id === "moon", questions: 1, minutes: 3 });
const INDEX = {
  categories: [{ id: "space", title: "Space", emoji: "🚀", blurb: "Stars and planets", group: "knowledge", order: 1 }, { id: "logic", title: "Logic", emoji: "🧩", blurb: "Think sharp", group: "thinking", order: 2 }],
  items: [item("moon", "Phases of the Moon", "space", "8-10"), item("sun", "Our Sun", "space", "11-13"), item("riddle", "The two doors", "logic", "8-10", "puzzle")],
  ages: ["8-10", "11-13"], counts: { lessons: 2, puzzles: 1, animations: 1 },
};
const LESSON = {
  ...INDEX.items[0], steps: [
    { id: "a", title: "Look up", sentences: ["The Moon shines by sunlight."], points: ["Sunlight bounces off"], visual: "moon-phases", audio: [null] },
    { id: "b", title: "Phases", sentences: ["We see different amounts of the lit half."], points: [], audio: [null] },
  ],
  facts: ["The Moon is slowly drifting away from Earth."], quiz: [{ q: "What lights the Moon?", options: ["The Sun", "A lamp"], answer: 0, why: "Sunlight reflects off it." }], notes: "Source: general astronomy.", asOf: "November 2026",
};
function mount(path: string, settings: Record<string, unknown> = {}, index: unknown = INDEX) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.includes("/settings/public")) return new Response(JSON.stringify({ values: settings }));
    if (url.includes("/api/v1/gk/index")) return new Response(JSON.stringify(index));
    if (url.includes("/api/v1/gk/lessons/moon")) return new Response(JSON.stringify(LESSON));
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider waitForLatest><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("GK page", () => {
  it("lists lessons by category and filters by age and type", async () => {
    mount("/gk", { "gk.daily.enabled": false, "gk.puzzle.enabled": false });
    await screen.findAllByText("Phases of the Moon");
    expect(screen.getAllByText("The two doors").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /^11-13/ }));
    expect(screen.queryAllByText("Phases of the Moon").length).toBe(0);
    expect(screen.getAllByText("Our Sun").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Any age" }));
    fireEvent.click(screen.getByRole("button", { name: "Puzzles" }));
    expect(screen.queryAllByText("Our Sun").length).toBe(0);
    expect(screen.getAllByText("The two doors").length).toBeGreaterThan(0);
  });
  it("searches", async () => {
    mount("/gk", { "gk.daily.enabled": false, "gk.puzzle.enabled": false });
    await screen.findAllByText("Our Sun");
    fireEvent.change(screen.getByLabelText("Search GK"), { target: { value: "doors" } });
    expect(screen.queryAllByText("Our Sun").length).toBe(0);
    expect(screen.getAllByText("The two doors").length).toBeGreaterThan(0);
  });
  it("hides categories and lessons the admin switched off", async () => {
    mount("/gk", { "gk.daily.enabled": false, "gk.puzzle.enabled": false, "gk.categoriesHidden": "logic", "gk.lessonsHidden": "sun" });
    await screen.findAllByText("Phases of the Moon");
    expect(screen.queryAllByText("The two doors").length).toBe(0);
    expect(screen.queryAllByText("Our Sun").length).toBe(0);
  });
  it("is not found when GK is switched off", async () => {
    mount("/gk", { "feature.gk": false });
    await screen.findByText("We could not find that page.");
  });
  it("shows the section name chosen by the admin in the menu", async () => {
    mount("/", { "gk.tab.label": { en: "Brain Gym", ta: "x" } });
    await waitFor(() => expect(screen.getAllByText("Brain Gym").length).toBeGreaterThan(0));
  });
});

describe("GK lesson", () => {
  it("shows steps, the picture, facts, a quiz that explains, and the as-of date", async () => {
    mount("/gk/moon");
    await screen.findByRole("heading", { name: /Phases of the Moon/ });
    expect(screen.getByText("The Moon shines by sunlight.")).toBeTruthy();
    expect(screen.getByTestId("gk-visual-moon-phases")).toBeTruthy();
    expect(screen.getByText(/drifting away/)).toBeTruthy();
    expect(screen.getByText(/November 2026/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "The Sun" }));
    expect(await screen.findByText(/Sunlight reflects off it/)).toBeTruthy();
  });
  it("plays as slides and moves with the buttons", async () => {
    mount("/gk/moon");
    await screen.findByRole("heading", { name: /Phases of the Moon/ });
    fireEvent.click(screen.getByRole("button", { name: "Slides" }));
    expect(screen.getByTestId("gk-slides")).toBeTruthy();
    expect(screen.getByText("1 / 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByText("2 / 2")).toBeTruthy();
  });
  it("hides the picture's animation controls when animations are off", async () => {
    mount("/gk/moon", { "gk.anim.enabled": false });
    await screen.findByRole("heading", { name: /Phases of the Moon/ });
    expect(screen.queryByRole("button", { name: /Pause|Play/ })).toBeNull();
  });
});

describe("GK pictures", () => {
  it("has a drawing for every picture id the content can name", () => {
    for (const id of GK_ANIMATED_VISUALS) expect(GK_VISUAL_IDS, id).toContain(id);
  });
});
describe("Daily pick", () => {
  it("is the same all day and moves from day to day", () => {
    const a = dailyPick(10, new Date(2026, 10, 16, 8), 0), b = dailyPick(10, new Date(2026, 10, 16, 22), 0), c = dailyPick(10, new Date(2026, 10, 17, 8), 0);
    expect(a).toBe(b); expect(c).not.toBe(a);
  });
});
