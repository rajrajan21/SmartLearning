import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const topic = { topic: { id: "t1", slug: "sides", name: { en: "Sides and corners" } }, chapter: { slug: "shapes", position: 1, name: { en: "Shapes" } }, subject: { slug: "maths", name: { en: "Mathematics" } }, classLevel: 3, objectives: [], prerequisites: [], unlocks: [], previous: null, next: null };
const lesson = { topicId: "00000000-0000-4000-8000-0000000000f1", version: 1, status: "published", title: { en: "Sides and corners" }, blocks: [{ id: "a", type: "explanation", provenance: "original", text: { en: "A side is a straight edge." } }] };
const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [{ id: "s", slug: "maths", name: { en: "Mathematics" }, chapters: [{ id: "c", slug: "shapes", position: 1, name: { en: "Shapes" }, topics: [{ id: "t1", slug: "sides", name: { en: "Sides and corners" } }] }] }] }] };
const asked: Record<string, unknown>[] = [];
let reply: { status: number; body: unknown } = { status: 200, body: { answer: "A corner is where two sides meet.", source: "ai", remaining: 19 } };

function mount(settings: Record<string, unknown> = {}) {
  asked.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    const ok = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.includes("/tutor/ask")) { asked.push(JSON.parse(String(init?.body))); return ok(reply.body, reply.status); }
    if (url.includes("/lessons/available")) return ok({ topicIds: ["t1"] });
    if (url.includes("/lessons/boards")) return ok(lesson);
    if (url.includes("/practice/")) return new Response("{}", { status: 404 });
    if (url.includes("/topics/")) return ok(topic);
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path: "/cbse/3/maths/shapes/sides/learn", static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); reply = { status: 200, body: { answer: "A corner is where two sides meet.", source: "ai", remaining: 19 } }; });

describe("Sharp Teacher AI", () => {
  it("asks about the lesson, shows the answer labelled as AI, and the remaining count", async () => {
    mount();
    fireEvent.click(await screen.findByRole("button", { name: /Ask Sharp Teacher AI/ }));
    fireEvent.change(screen.getByPlaceholderText("Type your question"), { target: { value: "What is a corner?" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));
    await screen.findByText("A corner is where two sides meet.");
    expect(screen.getByText(/Written by AI from this lesson/)).toBeTruthy();
    expect(screen.getByText(/AI answers left today: 19/)).toBeTruthy();
    expect(asked[0]).toMatchObject({ topicId: lesson.topicId, question: "What is a corner?", mode: "free", lang: "en", history: [] });
  });
  it("lesson-sourced answers carry no AI label, and 'Explain again' uses the lesson title when nothing is typed", async () => {
    reply = { status: 200, body: { answer: "From your lesson:\nA side is a straight edge.", source: "lesson", remaining: null } };
    mount();
    fireEvent.click(await screen.findByRole("button", { name: /Ask Sharp Teacher AI/ }));
    fireEvent.click(screen.getByRole("button", { name: "Explain again" }));
    await screen.findByText(/A side is a straight edge/);
    expect(screen.queryByText(/Written by AI/)).toBeNull();
    expect(asked[0]).toMatchObject({ question: "Sides and corners", mode: "explain" });
  });
  it("shows friendly messages for rate limits and sign-in requirements", async () => {
    reply = { status: 429, body: { error: { message: "x" } } };
    mount();
    fireEvent.click(await screen.findByRole("button", { name: /Ask Sharp Teacher AI/ }));
    fireEvent.click(screen.getByRole("button", { name: "Give an example" }));
    await screen.findByText(/asking very fast/);
  });
  it("is absent when the admin hides it in lessons or switches the tutor off", async () => {
    mount({ "tutor.inLessons": false });
    await screen.findByText("A side is a straight edge.");
    expect(screen.queryByRole("button", { name: /Ask Sharp Teacher AI/ })).toBeNull();
    cleanup();
    mount({ "feature.aiTutor": false });
    await screen.findByText("A side is a straight edge.");
    expect(screen.queryByRole("button", { name: /Ask Sharp Teacher AI/ })).toBeNull();
  });
});
