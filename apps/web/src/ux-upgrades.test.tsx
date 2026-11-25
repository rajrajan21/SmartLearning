import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import "./pages/Classroom";
import { computeCompletionPlan, hasPassedExam, hasPassedPractice } from "./lib/completionHub";
import {
  canAutoOpenTour,
  isTourDismissed,
  markTourDismissed,
  resetSpotlightTourState,
  setClassroomAudioPlaying,
} from "./lib/spotlightTour";

const topicId = "752e3212-58ce-4c0f-98bc-890d594339ca";
const tree = {
  boardCode: "CBSE",
  boardName: "CBSE",
  academicYear: "2026-27",
  classes: [
    {
      classLevel: 3,
      subjects: [
        {
          id: "s1",
          slug: "maths",
          name: { en: "Mathematics" },
          chapters: [
            {
              id: "c1",
              slug: "fair-share",
              position: 1,
              name: { en: "Fair Share" },
              topics: [{ id: topicId, slug: "halves-and-quarters", name: { en: "Halves and quarters" } }],
            },
            {
              id: "c2",
              slug: "patterns",
              position: 2,
              name: { en: "Patterns" },
              topics: [{ id: "t2", slug: "repeating", name: { en: "Repeating" } }],
            },
            {
              id: "c3",
              slug: "shapes",
              position: 3,
              name: { en: "Shapes" },
              topics: [{ id: "t3", slug: "corners", name: { en: "Corners" } }],
            },
            {
              id: "c4",
              slug: "time",
              position: 4,
              name: { en: "Time" },
              topics: [{ id: "t4", slug: "clocks", name: { en: "Clocks" } }],
            },
          ],
        },
      ],
    },
  ],
};

const topicDetail = {
  topic: { id: topicId, slug: "halves-and-quarters", name: { en: "Halves and quarters" } },
  chapter: { slug: "fair-share", position: 1, name: { en: "Fair Share" } },
  subject: { slug: "maths", name: { en: "Mathematics" } },
  classLevel: 3,
  objectives: [],
  prerequisites: [],
  unlocks: [],
  previous: null,
  next: { classLevel: 3, subjectSlug: "maths", chapterSlug: "patterns", topicSlug: "repeating", name: { en: "Repeating" } },
};

const readingLesson = {
  topicId,
  version: 1,
  status: "published",
  title: { en: "Halves and quarters" },
  blocks: [{ id: "a", type: "summary", provenance: "original", points: [{ en: "Four quarters make a whole." }] }],
};

const classroomLesson = {
  topicId,
  board: "CBSE",
  classLevel: 3,
  subject: "maths",
  chapter: "fair-share",
  topic: "halves-and-quarters",
  status: "published",
  title: { en: "Halves and quarters" },
  objects: [{ kind: "text", id: "t", x: 100, y: 100, text: "Whole" }],
  steps: [
    {
      id: "only",
      section: "Intro",
      narration: { en: "One whole." },
      actions: [],
      check: {
        stem: { en: "How many halves make a whole?" },
        explanation: { en: "Two halves make a whole." },
        options: [
          { id: "no", text: { en: "1" }, whyWrong: { en: "One half is not a whole." } },
          { id: "ok", text: { en: "2" }, correct: true },
        ],
      },
    },
  ],
};

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
      if (url.includes("/settings/public")) {
        return ok({ values: { "classroom.browserVoice": false, "ux.spotlightTour.autoDelayMs": 20, ...settings } });
      }
      if (url.includes("/practice/boards")) {
        return ok({
          topicId,
          questions: [{ id: topicId, key: "q1", round: 1, type: "true_false", stem: { en: "2 halves = 1 whole." }, hints: [] }],
        });
      }
      if (url.includes("/classroom/index")) {
        return ok({
          items: [
            { board: "CBSE", classLevel: 3, subject: "maths", chapter: "fair-share", topic: "halves-and-quarters", title: classroomLesson.title, steps: 1 },
            { board: "CBSE", classLevel: 3, subject: "maths", chapter: "patterns", topic: "repeating", title: { en: "Repeating" }, steps: 2 },
          ],
        });
      }
      if (url.includes("/classroom/cbse/3/maths/fair-share/halves-and-quarters") || url.includes("/classroom/CBSE/3/maths/fair-share/halves-and-quarters")) return ok(classroomLesson);
      if (url.includes("/lessons/available")) return ok({ topicIds: [topicId] });
      if (url.includes("/lessons/boards")) return ok(readingLesson);
      if (url.includes("/topics/")) return ok(topicDetail);
      if (url.includes("/curriculum/boards/")) return ok(tree);
      return new Response("{}", { status: 404 });
    }),
  );
  const { hook } = memoryLocation({ path, static: false });
  return render(
    <Router hook={hook}>
      <SettingsProvider waitForLatest>
        <AccountProvider>
          <Layout>
            <Routes />
          </Layout>
        </AccountProvider>
      </SettingsProvider>
    </Router>,
  );
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  resetSpotlightTourState();
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("reduce"),
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
});

describe("adaptive completion hub logic", () => {
  it("promotes Start practice first, then Chapter test, then Next lesson, then Replay", () => {
    const step1 = computeCompletionPlan({
      hasPractice: true,
      practiceDone: false,
      hasExam: true,
      examDone: false,
      hasNext: true,
      adaptivePrimary: true,
    });
    expect(step1.primary).toBe("practice");
    expect(step1.steps).toEqual([
      { id: "lesson", done: true, current: false },
      { id: "practice", done: false, current: true },
      { id: "exam", done: false, current: false },
      { id: "next", done: false, current: false },
    ]);

    const step2 = computeCompletionPlan({
      hasPractice: true,
      practiceDone: true,
      hasExam: true,
      examDone: false,
      hasNext: true,
      adaptivePrimary: true,
    });
    expect(step2.primary).toBe("exam");
    expect(step2.steps.find((s) => s.id === "practice")?.done).toBe(true);
    expect(step2.steps.find((s) => s.id === "exam")?.current).toBe(true);

    const step3 = computeCompletionPlan({
      hasPractice: true,
      practiceDone: true,
      hasExam: true,
      examDone: true,
      hasNext: true,
      adaptivePrimary: true,
    });
    expect(step3.primary).toBe("next");

    const step4 = computeCompletionPlan({
      hasPractice: true,
      practiceDone: true,
      hasExam: true,
      examDone: true,
      hasNext: false,
      adaptivePrimary: true,
    });
    expect(step4.primary).toBe("replay");
  });

  it("checks practice and exam pass helpers accurately", () => {
    expect(hasPassedPractice(undefined)).toBe(false);
    expect(hasPassedPractice({ 1: { passed: false } })).toBe(false);
    expect(hasPassedPractice({ 1: { passed: true } })).toBe(true);
    expect(hasPassedExam(undefined, 60)).toBe(false);
    expect(hasPassedExam({ best: 50, tries: 1 }, 60)).toBe(false);
    expect(hasPassedExam({ best: 80, tries: 1 }, 60)).toBe(true);
  });
});

describe("in-canvas lesson completion hub UI", () => {
  async function finishClassroom(settings: Record<string, unknown> = {}) {
    mount("/classroom/cbse/3/maths/fair-share/halves-and-quarters", { "ux.spotlightTour.autoOpen": false, ...settings });
    await screen.findByText("Halves and quarters");
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    try {
      fireEvent.click(screen.getAllByRole("button", { name: /Start the lesson/ })[0]!);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
    } finally {
      vi.useRealTimers();
    }
    fireEvent.click(await screen.findByRole("button", { name: "2" }));
    fireEvent.click(await screen.findByRole("button", { name: /Finish/ }));
    await screen.findByText(/Lesson finished/);
  }

  it("shows Start practice, Chapter test, Watch again, Back to the topic, progress strip, and secondary links inside Classroom Done", async () => {
    await finishClassroom();
    const practice = await screen.findByRole("link", { name: /Start practice/ });
    const exam = screen.getByRole("link", { name: /Chapter test/ });
    expect(practice.className).toBe("btn");
    expect(exam.className).toContain("ghost");
    expect(screen.getByRole("button", { name: "Watch again" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Back to the topic/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Worksheet" }).getAttribute("href")).toBe("/worksheet/cbse/3/maths/fair-share");
    expect(screen.getByRole("link", { name: "Games" }).getAttribute("href")).toBe("/play/quickfire/cbse/3/maths/fair-share");
    expect(screen.getByRole("link", { name: /Next topic: Repeating/ }).getAttribute("href")).toBe(
      "/classroom/cbse/3/maths/patterns/repeating",
    );
    expect(screen.queryByRole("complementary", { name: "What to do next" })).toBeNull();
  });

  it("promotes Chapter test to primary when practice is already passed", async () => {
    localStorage.setItem("ss_practice_v1", JSON.stringify({ [topicId]: { 1: { best: 90, stars: 2, passed: true, tries: 1 } } }));
    await finishClassroom();
    const exam = await screen.findByRole("link", { name: /Chapter test →/ });
    expect(exam.className).toBe("btn");
    expect(screen.getByRole("link", { name: /Start practice ✓/ }).className).toContain("ghost");
    expect(screen.getByRole("list", { name: "Lesson progress" }).textContent).toContain("Practice ✓");
  });

  it("applies the same completion hub to Reading lessons (/learn) and respects admin toggles", async () => {
    mount("/cbse/3/maths/fair-share/halves-and-quarters/learn", {
      "lesson.preferClassroom": false,
      "ux.spotlightTour.autoOpen": false,
      "lesson.completionHub.showGames": false,
    });
    fireEvent.click(await screen.findByRole("button", { name: "Finish" }));
    await screen.findByText("Lesson finished");
    expect((await screen.findByRole("link", { name: /Start practice/ })).getAttribute("href")).toBe(
      "/cbse/3/maths/fair-share/halves-and-quarters/practice",
    );
    expect(screen.getByRole("link", { name: /Chapter test/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Worksheet" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Games" })).toBeNull();
    expect(screen.getByRole("link", { name: /Next topic: Repeating/ })).toBeTruthy();
    expect(screen.getByRole("list", { name: "Lesson progress" }).textContent).toContain("Lesson ✓");
  });
});

describe("spotlight navigation tour & persistent ? help hub", () => {
  it("auto-opens on first visit to Chapter page, steps with buttons and keyboard, and permanently dismisses on Got it!/Skip", async () => {
    mount("/cbse/3/maths/fair-share");
    const dialog = await screen.findByRole("dialog", { name: "Start with Topics" });
    expect(dialog).toBeTruthy();
    expect(screen.getByText(/1 of \d+/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);

    // Step forward via button and keyboard
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(/2 of \d+/)).toBeTruthy();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText(/1 of \d+/)).toBeTruthy();

    // Dismiss with Skip -> permanently saved
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(screen.queryByRole("dialog", { name: "Start with Topics" })).toBeNull();
    expect(isTourDismissed("chapter")).toBe(true);
  });

  it("enforces anti-fatigue: max 1 auto-popup per session and never auto-opens while Classroom audio plays", async () => {
    mount("/cbse/3/maths/fair-share");
    await screen.findByRole("dialog", { name: "Start with Topics" });
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));

    // Second page type in same session should NOT auto-open
    cleanup();
    mount("/cbse/3/maths");
    await screen.findByRole("heading", { name: "Mathematics" });
    await new Promise((r) => setTimeout(r, 80));
    expect(screen.queryByRole("dialog", { name: "Chapter Progress" })).toBeNull();

    // Audio playing check
    resetSpotlightTourState();
    setClassroomAudioPlaying(true);
    expect(
      canAutoOpenTour({
        pageType: "lesson",
        tourEnabled: true,
        pageEnabled: true,
        autoOpen: true,
        maxAutoPerSession: 1,
      }),
    ).toBe(false);
    setClassroomAudioPlaying(false);
    expect(
      canAutoOpenTour({
        pageType: "lesson",
        tourEnabled: true,
        pageEnabled: true,
        autoOpen: true,
        maxAutoPerSession: 1,
      }),
    ).toBe(true);
  });

  it("persistent ? Help Hub replays the page tour even after dismissal and offers quick jumps", async () => {
    markTourDismissed("chapter");
    mount("/cbse/3/maths/fair-share");
    await screen.findByRole("heading", { name: "Fair Share" });

    // Open ? Help Hub
    fireEvent.click(await screen.findByRole("button", { name: "Help and page tour" }));
    const helpDialog = screen.getByRole("dialog", { name: "Study help" });
    expect(helpDialog).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Quick jumps" }).textContent).toContain("Chapter test");
    expect(screen.getByRole("navigation", { name: "Quick jumps" }).textContent).toContain("Next chapter");

    // Replay page tour manually
    fireEvent.click(screen.getByRole("button", { name: /Replay page tour/ }));
    expect(await screen.findByRole("dialog", { name: "Start with Topics" })).toBeTruthy();

    // Escape closes it cleanly
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Start with Topics" })).toBeNull());
  });

  it("respects Admin switches to hide Help Hub and disable Spotlight Tour", async () => {
    mount("/cbse/3/maths/fair-share", { "ux.spotlightTour.enabled": false, "ux.helpHub.enabled": false });
    await screen.findByRole("heading", { name: "Fair Share" });
    await new Promise((r) => setTimeout(r, 60));
    expect(screen.queryByRole("button", { name: "Help and page tour" })).toBeNull();
    expect(screen.queryByRole("dialog", { name: "Start with Topics" })).toBeNull();
  });
});
