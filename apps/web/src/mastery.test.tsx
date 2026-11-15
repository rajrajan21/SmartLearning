import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { dayNumber } from "@studysmart/shared";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [{ id: "s", slug: "maths", name: { en: "Mathematics" }, chapters: [
  { id: "c1", slug: "shapes", position: 1, name: { en: "Shapes" }, topics: [{ id: "t1", slug: "sides", name: { en: "Sides and corners" } }, { id: "t2", slug: "more", name: { en: "More shapes" } }] },
  { id: "c2", slug: "numbers", position: 2, name: { en: "Numbers" }, topics: [{ id: "t3", slug: "count", name: { en: "Counting" } }] }] }] }] };
const question = { id: id(1), key: "a", round: 1, type: "true_false", stem: { en: "A square has 4 corners." }, hints: [] };
const posted: unknown[] = [];

function mount(path: string, settings: Record<string, unknown> = {}) {
  posted.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: { "practice.audio.feedback": false, ...settings } });
    if (url.includes("/practice/by-ids")) { posted.push(JSON.parse(String(init?.body))); return ok({ questions: [question] }); }
    if (url.includes("/practice/answers")) { const b = JSON.parse(String(init?.body)); return ok({ attemptId: b.attemptId, questionId: b.questionId, correct: b.response.value === true, explanation: { en: "Yes." }, correctAnswer: { en: "True" }, replay: false }); }
    if (url.includes("/practice/available")) return ok({ topicIds: ["t1", "t2"], rounds: { t1: [1, 2], t2: [1] } });
    if (url.includes("/lessons/available")) return ok({ topicIds: ["t1"] });
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
const today = () => dayNumber();
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("daily revision", () => {
  it("home shows how many questions are due, and nothing when none are", async () => {
    localStorage.setItem("ss_revision_v1", JSON.stringify({ [id(1)]: { box: 1, due: today(), updatedAt: 1 }, [id(2)]: { box: 3, due: today() + 5, updatedAt: 1 } }));
    mount("/");
    await screen.findByText(/1 questions to remember today/);
    cleanup(); localStorage.clear();
    mount("/");
    await screen.findAllByText("Class");
    expect(screen.queryByText(/to remember today/)).toBeNull();
  });

  it("revises the due questions, schedules the right one for later and the wrong one for tomorrow", async () => {
    localStorage.setItem("ss_revision_v1", JSON.stringify({ [id(1)]: { box: 2, due: today() - 2, updatedAt: 1 } }));
    mount("/revise");
    await screen.findByText("A square has 4 corners.");
    expect((posted[0] as { ids: string[] }).ids).toEqual([id(1)]);
    fireEvent.click(screen.getByRole("radio", { name: "False" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await screen.findByText("Not quite");
    expect(JSON.parse(localStorage.getItem("ss_revision_v1")!)[id(1)]).toMatchObject({ box: 1, due: today() + 1 });
    fireEvent.click(screen.getByRole("button", { name: "See my result" }));
    await screen.findByText(/You remembered 0 out of 1/);
  });

  it("a right answer climbs a box; a first-ever right answer from practice enters the schedule", async () => {
    localStorage.setItem("ss_revision_v1", JSON.stringify({ [id(1)]: { box: 2, due: today(), updatedAt: 1 } }));
    mount("/revise");
    await screen.findByText("A square has 4 corners.");
    fireEvent.click(screen.getByRole("radio", { name: "True" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await screen.findByText(/Correct!/);
    expect(JSON.parse(localStorage.getItem("ss_revision_v1")!)[id(1)]).toMatchObject({ box: 3, due: today() + 7 });
  });

  it("says so when nothing is due, and the page disappears when the admin turns revision off", async () => {
    mount("/revise");
    await screen.findByText(/Nothing to revise today/);
    cleanup();
    mount("/revise", { "mastery.revision.enabled": false });
    await screen.findByText(/could not find that page/i);
  });
});

describe("mastery", () => {
  it("my progress measures chapters from what was done, leaves out topics with no content, and links to the chapter", async () => {
    localStorage.setItem("ss_progress_v1", JSON.stringify({ t1: { step: 3, total: 3, done: true, updatedAt: 1 } }));
    localStorage.setItem("ss_practice_v1", JSON.stringify({ t1: { 1: { best: 100, stars: 3, passed: true, tries: 1 }, 2: { best: 100, stars: 3, passed: true, tries: 1 } } }));
    mount("/progress");
    await screen.findByText("Shapes");
    expect(screen.queryByText("Numbers")).toBeNull(); // no lesson or questions yet: not measured
    // t1 is mastered (100%); t2 has questions but nothing done (0%): chapter average 50%
    expect(screen.getByRole("progressbar", { name: "Shapes" }).getAttribute("aria-valuenow")).toBe("50");
  });

  it("chapter page tags topics by mastery, and the admin can switch the badges off", async () => {
    localStorage.setItem("ss_progress_v1", JSON.stringify({ t1: { step: 3, total: 3, done: true, updatedAt: 1 } }));
    localStorage.setItem("ss_practice_v1", JSON.stringify({ t1: { 1: { best: 80, stars: 1, passed: true, tries: 1 }, 2: { best: 80, stars: 1, passed: true, tries: 1 } } }));
    mount("/cbse/3/maths/shapes");
    await screen.findByText("Strong");
    cleanup();
    mount("/cbse/3/maths/shapes", { "mastery.badges": false });
    await screen.findAllByText("Sides and corners");
    expect(screen.queryByText("Strong")).toBeNull();
  });

  it("everything mastery-related is hidden when the feature is off", async () => {
    mount("/progress", { "feature.mastery": false });
    await screen.findByText(/could not find that page/i);
    expect(screen.queryByRole("link", { name: "My progress" })).toBeNull();
  });
});
