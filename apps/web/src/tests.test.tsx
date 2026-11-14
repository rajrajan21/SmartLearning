import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [{ id: "s", slug: "maths", name: { en: "Mathematics" }, chapters: [{ id: "c", slug: "shapes", position: 1, name: { en: "Shapes" }, topics: [{ id: "t1", slug: "sides", name: { en: "Sides and corners" } }] }] }] }] };
const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
const qs = [
  { id: id(1), key: "a", round: 1, type: "true_false", stem: { en: "A square has 4 corners." }, hints: [] },
  { id: id(2), key: "b", round: 1, type: "mcq", stem: { en: "Which has 3 sides?" }, hints: [], options: [{ id: "tri", text: { en: "Triangle" } }, { id: "sq", text: { en: "Square" } }] },
  { id: id(3), key: "c", round: 2, type: "number", stem: { en: "How many sides on a square?" }, hints: [] },
];
const sent: { questionId: string }[] = [];
let signedIn = false;

function mount(path: string, settings: Record<string, unknown> = {}) {
  sent.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const ok = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
    if (url.includes("/settings/public")) return ok({ values: { "practice.audio.feedback": false, "practice.shuffleOptions": false, ...settings } });
    if (url.endsWith("/account/me")) return ok(signedIn ? { user: { id: "u", email: "m@e.com" }, profiles: [], activeProfileId: null } : null);
    if (url.includes("/practice/answer-key")) return ok({ answers: qs.map((q) => ({ id: q.id, answer: { en: "KEY-" + q.key } })) });
    if (url.includes("/practice/answers")) {
      const body = JSON.parse(String(init?.body)); sent.push(body);
      return ok({ attemptId: body.attemptId, questionId: body.questionId, correct: true, explanation: { en: "Because of the shape." }, correctAnswer: { en: "the right one" }, replay: false });
    }
    if (url.includes("/practice/available")) return ok({ topicIds: ["t1"], rounds: {} });
    if (url.includes("/practice/boards")) return ok({ topicId: "t1", questions: qs });
    if (url.includes("/lessons/")) return new Response("{}", { status: 404 });
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><AccountProvider><Layout><Routes /></Layout></AccountProvider></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); signedIn = false; });

/** answer whatever question is showing, then save */
async function answerOne() {
  await screen.findByRole("button", { name: "Save answer" });
  const t = screen.queryByRole("radio", { name: "True" }), m = screen.queryByRole("radio", { name: "Triangle" }), n = screen.queryByLabelText("Type a number");
  if (t) fireEvent.click(t); else if (m) fireEvent.click(m); else if (n) fireEvent.change(n, { target: { value: "4" } });
  fireEvent.click(screen.getByRole("button", { name: "Save answer" }));
}

describe("chapter tests, worksheets and games", () => {
  it("the chapter page links to all four", async () => {
    mount("/cbse/3/maths/shapes");
    expect(await screen.findByRole("link", { name: "Worksheet" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Quick Fire" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Three Lives" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "Chapter test" }).length).toBeGreaterThan(0);
  });

  it("the admin can hide each one", async () => {
    mount("/cbse/3/maths/shapes", { "feature.worksheets": false, "games.survival": false });
    await screen.findByRole("link", { name: "Quick Fire" });
    expect(screen.queryByRole("link", { name: "Worksheet" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Three Lives" })).toBeNull();
  });

  it("a test keeps answers private until the end, then marks them on the server and shows the review", async () => {
    mount("/exam/cbse/3/maths/shapes");
    fireEvent.click(await screen.findByRole("button", { name: "Start the test" }));
    for (let i = 0; i < 3; i++) { await answerOne(); if (i < 2) await waitFor(() => expect(screen.getByText(`Question ${i + 2} of 3`)).toBeTruthy()); }
    await screen.findByText(/You got 3 out of 3/);
    expect(sent).toHaveLength(3);
    expect(screen.getByText("Passed. Well done!", { exact: false })).toBeTruthy();
    expect(screen.getAllByText("Because of the shape.").length).toBe(3);
  });

  it("skipped questions are not sent and count as not answered", async () => {
    mount("/exam/cbse/3/maths/shapes");
    fireEvent.click(await screen.findByRole("button", { name: "Start the test" }));
    for (let i = 0; i < 3; i++) { fireEvent.click(await screen.findByRole("button", { name: "Skip" })); }
    await screen.findByText(/You got 0 out of 3/);
    expect(sent).toHaveLength(0);
    expect(screen.getAllByText("Not answered")).toHaveLength(3);
  });

  it("tests are unavailable when switched off", async () => {
    mount("/exam/cbse/3/maths/shapes", { "feature.exams": false });
    await screen.findByText("We could not find that page.");
  });

  it("a worksheet prints questions without answers; the key needs a signed-in parent", async () => {
    mount("/worksheet/cbse/3/maths/shapes");
    await screen.findByText("Which has 3 sides?");
    expect(screen.getByText("Sign in as a parent to see the answer key.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Show answer key" })).toBeNull();
    expect(screen.queryByText(/KEY-/)).toBeNull();
  });

  it("a signed-in parent can show and hide the answer key", async () => {
    signedIn = true;
    mount("/worksheet/cbse/3/maths/shapes");
    fireEvent.click(await screen.findByRole("button", { name: "Show answer key" }));
    await screen.findAllByText(/KEY-/);
    fireEvent.click(screen.getByRole("button", { name: "Hide answer key" }));
    expect(screen.queryByText(/KEY-/)).toBeNull();
  });

  it("Quick Fire starts with a score and a clock", async () => {
    mount("/play/quickfire/cbse/3/maths/shapes");
    fireEvent.click(await screen.findByRole("button", { name: "Play" }));
    await screen.findByText("Score: 0");
    expect(screen.getByRole("timer")).toBeTruthy();
  });

  it("a game that is switched off is not found", async () => {
    mount("/play/survival/cbse/3/maths/shapes", { "games.survival": false });
    await screen.findByText("We could not find that page.");
  });
});
