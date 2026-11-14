import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const topic = { topic: { id: "t1", slug: "sides", name: { en: "Sides and corners" } }, chapter: { slug: "shapes", position: 1, name: { en: "Shapes" } }, subject: { slug: "maths", name: { en: "Mathematics" } }, classLevel: 3, objectives: [], prerequisites: [], unlocks: [], previous: null, next: null };
const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [{ id: "s", slug: "maths", name: { en: "Mathematics" }, chapters: [{ id: "c", slug: "shapes", position: 1, name: { en: "Shapes" }, topics: [{ id: "t1", slug: "sides", name: { en: "Sides and corners" } }] }] }] }] };
const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
const qs = [
  { id: id(1), key: "a", round: 1, type: "true_false", stem: { en: "A square has 4 corners." }, hints: [{ en: "Count them." }] },
  { id: id(2), key: "b", round: 1, type: "mcq", stem: { en: "Which has 3 sides?" }, hints: [], options: [{ id: "tri", text: { en: "Triangle" } }, { id: "sq", text: { en: "Square" } }] },
  { id: id(3), key: "c", round: 2, type: "number", stem: { en: "How many sides on a square?" }, hints: [] },
];
const answers: unknown[] = [];

function mount(path: string, settings: Record<string, unknown> = {}) {
  answers.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: { "practice.audio.feedback": false, "practice.shuffleOptions": false, "practice.shuffleQuestions": false, ...settings } });
    if (url.includes("/practice/answers")) {
      const body = JSON.parse(String(init?.body)); answers.push(body);
      const correct = body.response.type === "true_false" ? body.response.value === true : body.response.type === "mcq" ? body.response.optionId === "tri" : body.response.value === 4;
      return ok({ attemptId: body.attemptId, questionId: body.questionId, correct, explanation: { en: "Because of the shape." }, correctAnswer: { en: "the right one" }, replay: false });
    }
    if (url.includes("/practice/available")) return ok({ topicIds: ["t1"] });
    if (url.includes("/practice/boards")) return ok({ topicId: "t1", questions: qs });
    if (url.includes("/lessons/available")) return ok({ topicIds: [] });
    if (url.includes("/lessons/boards")) return new Response("{}", { status: 404 });
    if (url.includes("/topics/")) return ok(topic);
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("practice", () => {
  it("topic page offers practice", async () => {
    mount("/cbse/3/maths/shapes/sides");
    expect(await screen.findByRole("link", { name: "Practice this topic" })).toBeTruthy();
  });

  it("plays a round: answers are graded by the server, shows feedback, scores and saves stars", async () => {
    mount("/cbse/3/maths/shapes/sides/practice");
    fireEvent.click((await screen.findAllByRole("button", { name: "Start" }))[0]!);
    await screen.findByText("A square has 4 corners.");
    fireEvent.click(screen.getByRole("radio", { name: "True" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await screen.findByText(/Correct!/);
    expect((answers[0] as { anonId: string; attemptId: string }).anonId).toMatch(/^[0-9a-f-]{36}$/);
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));
    await screen.findByText("Which has 3 sides?");
    fireEvent.click(screen.getByRole("radio", { name: "Square" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await screen.findByText("Not quite");
    expect(screen.getByText(/the right one/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "See my result" }));
    await screen.findByText(/You got 1 out of 2 \(50%\)/);
    expect(screen.getByText(/Not passed yet/)).toBeTruthy(); // below the 70% pass mark
    expect(JSON.parse(localStorage.getItem("ss_practice_v1")!).t1[1]).toMatchObject({ best: 50, passed: false });
  });

  it("keeps the next round locked until the first is passed", async () => {
    mount("/cbse/3/maths/shapes/sides/practice");
    await screen.findAllByRole("button", { name: "Start" });
    const start = screen.getAllByRole("button", { name: "Start" });
    expect((start[1] as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Pass the round before/)).toBeTruthy();
  });

  it("all rounds open when the admin chooses so, and hints can be switched off", async () => {
    mount("/cbse/3/maths/shapes/sides/practice", { "practice.unlock": "open", "practice.hints.enabled": false });
    await screen.findAllByRole("button", { name: "Start" });
    const start = screen.getAllByRole("button", { name: "Start" });
    expect((start[1] as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(start[0]!);
    await screen.findByText("A square has 4 corners.");
    expect(screen.queryByRole("button", { name: /hint/i })).toBeNull();
  });

  it("a hint is shown and counted", async () => {
    mount("/cbse/3/maths/shapes/sides/practice");
    fireEvent.click((await screen.findAllByRole("button", { name: "Start" }))[0]!);
    await screen.findByText("A square has 4 corners.");
    fireEvent.click(screen.getByRole("button", { name: "Give me a hint" }));
    expect(screen.getByText(/Count them/)).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "True" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await waitFor(() => expect((answers[0] as { hintsUsed: number }).hintsUsed).toBe(1));
  });

  it("practice switched off hides the page", async () => {
    mount("/cbse/3/maths/shapes/sides/practice", { "feature.practice": false });
    await screen.findByText(/could not find that page/i);
  });
});
