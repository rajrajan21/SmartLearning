import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { JourneyMap, journeyState } from "./components/JourneyMap";

const ch = (id: string, n: number, topics: string[]) => ({ id, slug: id, position: n, name: { en: `Chapter ${id}` }, topics: topics.map((t) => ({ id: t, slug: t, name: { en: t } })) });
describe("journey map", () => {
  const chapters = [ch("a", 1, ["a1", "a2"]), ch("b", 2, ["b1", "b2"]), ch("c", 3, ["c1"]), ch("d", 4, ["d1"])];
  const progress = { a1: { step: 3, total: 3, done: true, updatedAt: 1 }, a2: { step: 3, total: 3, done: true, updatedAt: 1 }, b1: { step: 2, total: 5, done: false, updatedAt: 1 } };
  const lessons = new Set(["a1", "a2", "b1", "b2", "c1"]);
  it("tells complete, in progress, not started and coming soon apart", () => {
    expect(chapters.map((c) => journeyState(c, progress, lessons))).toEqual(["done", "doing", "todo", "soon"]);
  });
  it("draws every chapter once with its state in the label", () => {
    const { hook } = memoryLocation({ path: "/" });
    render(<Router hook={hook}><SettingsProvider><JourneyMap chapters={chapters} base="/cbse/6/maths" progress={progress} lessonIds={lessons} /></SettingsProvider></Router>);
    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Chapter 1: Chapter a\. Complete/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Chapter 2: Chapter b\. In progress/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Chapter 3: Chapter c\. Not started/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Chapter 4: Chapter d\. Coming soon/ })).toBeTruthy();
    expect(document.querySelector(".jn-sum")?.textContent).toMatch(/1 \/ 4 chapters complete.*1 in progress/);
  });
});
