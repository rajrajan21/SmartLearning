import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import { getProgress } from "./lib/progress";

const topic = { topic: { id: "t1", slug: "sides", name: { en: "Sides and corners" } }, chapter: { slug: "shapes", position: 1, name: { en: "Shapes" } }, subject: { slug: "maths", name: { en: "Mathematics" } }, classLevel: 3, objectives: [], prerequisites: [], unlocks: [], previous: null, next: { classLevel: 3, subjectSlug: "maths", chapterSlug: "shapes", topicSlug: "other", name: { en: "Other topic" } } };
const lesson = { topicId: "t1", version: 1, status: "published", title: { en: "Sides and corners" }, blocks: [
  { id: "a", type: "explanation", provenance: "original", text: { en: "A side is a straight edge." } },
  { id: "b", type: "worked_example", provenance: "original", problem: { en: "Count a triangle." }, steps: [{ text: { en: "Walk the sides." }, why: { en: "Edges are sides." } }, { text: { en: "Count 3." } }] },
  { id: "c", type: "summary", provenance: "original", points: [{ en: "Triangle has 3." }] },
] };
const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [{ id: "s", slug: "maths", name: { en: "Mathematics" }, chapters: [{ id: "c", slug: "shapes", position: 1, name: { en: "Shapes" }, topics: [{ id: "t1", slug: "sides", name: { en: "Sides and corners" } }] }] }] }] };

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.includes("/lessons/available")) return ok({ topicIds: ["t1"] });
    if (url.includes("/lessons/boards")) return ok(lesson);
    if (url.includes("/topics/")) return ok(topic);
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("lesson player", () => {
  it("topic page offers the lesson; steps through, reveals example steps, finishes and saves", async () => {
    mount("/cbse/3/maths/shapes/sides/learn");
    await screen.findByText("A side is a straight edge.");
    expect(screen.getByText(/Step 1 of 3/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    await screen.findByText(/Count a triangle/);
    expect(screen.queryByText("Count 3.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Show next step/ }));
    expect(screen.getByText("Count 3.")).toBeTruthy();
    expect(getProgress("t1")).toMatchObject({ step: 1, done: false });
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Finish" }));
    await screen.findByText("Lesson finished");
    expect(getProgress("t1")?.done).toBe(true);
    expect(screen.getByText(/Next topic: Other topic/)).toBeTruthy();
  });
  it("resumes where the student stopped and can start over", async () => {
    localStorage.setItem("ss_progress_v1", JSON.stringify({ t1: { step: 1, total: 3, done: false, updatedAt: 1 } }));
    mount("/cbse/3/maths/shapes/sides/learn");
    await screen.findByText(/Count a triangle/);
    expect(screen.getByText(/Continuing where you stopped/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start over" }));
    await screen.findByText("A side is a straight edge.");
  });
  it("arrow keys move between steps", async () => {
    mount("/cbse/3/maths/shapes/sides/learn");
    await screen.findByText("A side is a straight edge.");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    await screen.findByText(/Count a triangle/);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    await screen.findByText("A side is a straight edge.");
  });
  it("settings change behaviour: scroll mode shows everything, progress saving can be off", async () => {
    mount("/cbse/3/maths/shapes/sides/learn", { "lesson.mode": "scroll", "lesson.progress.save": false });
    await screen.findByText("A side is a straight edge.");
    expect(screen.getByText(/Count a triangle/)).toBeTruthy();
    expect(screen.getByText("Triangle has 3.")).toBeTruthy();
    expect(getProgress("t1")).toBeNull();
  });
  it("turning lessons off hides the lesson and its start button", async () => {
    mount("/cbse/3/maths/shapes/sides/learn", { "feature.lessons": false });
    await waitFor(() => expect(screen.getByText("404")).toBeTruthy());
    cleanup();
    mount("/cbse/3/maths/shapes/sides");
    await screen.findByRole("heading", { name: "Sides and corners" });
    expect(screen.queryByRole("link", { name: /Start lesson/ })).toBeNull();
  });
  it("topic page shows Start lesson, and the chapter list marks finished topics", async () => {
    mount("/cbse/3/maths/shapes/sides");
    await screen.findByRole("link", { name: "Start lesson" });
    cleanup();
    localStorage.setItem("ss_progress_v1", JSON.stringify({ t1: { step: 2, total: 3, done: true, updatedAt: 1 } }));
    mount("/cbse/3/maths/shapes");
    await screen.findByRole("img", { name: "Finished" });
  });
});

import { boardAt } from "./lib/board";
import { useNarrator } from "./lib/narrator";
import { renderHook, act } from "@testing-library/react";

describe("teacher board", () => {
  const S = (board: object[]) => ({ board }) as never;
  it("builds up while she speaks, points at things, and clears", () => {
    const sens = [S([{ op: "draw", shape: "rect", label: "book" }, { op: "write", text: "side = straight edge" }]), S([{ op: "point", target: "BOOK" }]), S([{ op: "clear" }, { op: "write", text: "new" }])];
    const a = boardAt(sens, 0); expect(a.items).toHaveLength(2); expect(a.pointed).toBeNull();
    const b = boardAt(sens, 1); expect(b.pointed).toBe(a.items[0]!.id);
    const c = boardAt(sens, 2); expect(c.items).toHaveLength(1); expect(c.pointed).toBeNull();
  });
  it("keeps only the newest lines when the board fills up", () => {
    const sens = [S(Array.from({ length: 9 }, (_, i) => ({ op: "write", text: `line ${i}` })))];
    const st = boardAt(sens, 0);
    expect(st.items).toHaveLength(6);
    expect(st.items[0]).toMatchObject({ text: "line 3" });
  });
});

describe("narrator", () => {
  const sentences = [
    { id: "a", text: { en: "One", ta: "ஒன்று" }, audioKey: null, videoKey: null, board: [], checkpointQuestionId: null, audio: { en: { url: "/a.mp3", durationMs: 500, words: [{ w: "One", t: 0, d: 400 }] } } },
    { id: "b", text: { en: "Two" }, audioKey: null, videoKey: null, board: [], checkpointQuestionId: null, audio: { en: { url: "/b.mp3", durationMs: 500, words: [] } } },
  ] as never;
  const played: string[] = [];
  class FakeAudio {
    onended: (() => void) | null = null; ontimeupdate: (() => void) | null = null; onerror: (() => void) | null = null; playbackRate = 1; currentTime = 0;
    constructor(public src: string) {}
    play() { played.push(this.src); setTimeout(() => this.onended?.(), 0); return Promise.resolve(); }
    pause() {}
  }
  beforeEach(() => { played.length = 0; vi.stubGlobal("Audio", FakeAudio); });

  it("plays recorded sentences in order and stops at the end", async () => {
    const { result } = renderHook(() => useNarrator(sentences, { lang: "en", autoAdvance: true, initialRate: 1, deviceVoice: false }));
    expect(result.current.source).toBe("recorded");
    act(() => result.current.play());
    await waitFor(() => expect(played).toEqual(["/a.mp3", "/b.mp3"]));
    await waitFor(() => expect(result.current.playing).toBe(false));
  });
  it("without auto-advance it stops after one sentence", async () => {
    const { result } = renderHook(() => useNarrator(sentences, { lang: "en", autoAdvance: false, initialRate: 1, deviceVoice: false }));
    act(() => result.current.play());
    await waitFor(() => expect(result.current.playing).toBe(false));
    expect(played).toEqual(["/a.mp3"]);
  });
  it("Tamil without recordings or a device voice cannot speak", () => {
    const { result } = renderHook(() => useNarrator(sentences, { lang: "ta", autoAdvance: true, initialRate: 1, deviceVoice: false }));
    expect(result.current.source).toBe("none");
  });
});

describe("narration in the lesson", () => {
  it("shows Listen and the board when recorded audio exists; hides them when the feature is off", async () => {
    const withAudio = { ...lesson, blocks: [{ id: "n", type: "teacher_narration", provenance: "original", teacher: "malar", sentences: [
      { id: "s1", text: { en: "Look at the book." }, board: [{ op: "draw", shape: "rect", label: "book" }], audio: { en: { url: "/a.mp3", durationMs: 800, words: [] } } }] }] };
    const go = (settings: Record<string, unknown>) => {
      vi.stubGlobal("fetch", vi.fn(async (url: string) => {
        const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
        if (url.includes("/settings/public")) return ok({ values: settings });
        if (url.includes("/lessons/boards")) return ok(withAudio);
        if (url.includes("/topics/")) return ok(topic);
        if (url.includes("/curriculum/boards/")) return ok(tree);
        return new Response("{}", { status: 404 });
      }));
      const { hook } = memoryLocation({ path: "/cbse/3/maths/shapes/sides/learn", static: false });
      return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
    };
    go({});
    await screen.findByRole("button", { name: /Listen/ });
    expect(screen.getByRole("img", { name: "Teacher's board" })).toBeTruthy();
    cleanup();
    go({ "feature.teacherNarration": false });
    await screen.findByText("Look at the book.");
    expect(screen.queryByRole("button", { name: /Listen/ })).toBeNull();
    expect(screen.queryByRole("img", { name: "Teacher's board" })).toBeNull();
  });
});
