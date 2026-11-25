import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_PRESETS, THEMES } from "@studysmart/shared";
import { presets } from "./lib/sitePresets";
import { SettingsProvider } from "./lib/settings";
import { resetBooksCache } from "./lib/reader/books";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import "./pages/Classroom";

const booksPayload = {
  books: [
    { id: "ncert-3-maths", classLevel: 3, subject: "Mathematics", title: "Maths Mela", language: "English", publisher: "NCERT", file: "cemm101", url: "/books/3/cemm101.pdf", pages: 120, bytes: 2048000 },
  ],
};

const sampleLessonId = "75038abb-a746-43ef-86a4-486e6f214543";
const sampleClassroom = {
  topicId: sampleLessonId,
  board: "CBSE",
  classLevel: 6,
  subject: "science",
  chapter: "exploring-magnets",
  topic: "magnetic-and-non-magnetic",
  status: "published",
  title: { en: "Magnetic and non-magnetic things" },
  voiceUsed: "kani",
  voicesReady: ["kani"],
  objects: [{ kind: "text", id: "t", x: 100, y: 100, text: "Magnets" }],
  steps: [{ id: "s1", section: "Intro", narration: { en: "Iron and steel are magnetic." }, actions: [] }],
};

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
      if (url.includes("/settings/public")) return ok({ values: { "ux.spotlightTour.enabled": false, ...settings } });
      if (url.includes("/api/books")) return ok(booksPayload);
      if (url.includes("/curriculum/boards/")) return ok({
        boardCode: "CBSE",
        boardName: "CBSE",
        academicYear: "2026-27",
        classes: [{
          classLevel: 6,
          subjects: [{
            id: "sci6",
            slug: "science",
            name: { en: "Science" },
            chapters: [{
              id: "ch6",
              slug: "exploring-magnets",
              position: 1,
              name: { en: "Exploring Magnets" },
              topics: [{ id: sampleLessonId, slug: "magnetic-and-non-magnetic", name: { en: "Magnetic and non-magnetic things" } }],
            }],
          }],
        }],
      });
      if (url.includes("/classroom/index")) return ok({
        items: [{ board: "CBSE", classLevel: 6, subject: "science", chapter: "exploring-magnets", topic: "magnetic-and-non-magnetic", title: sampleClassroom.title, steps: 1 }],
        voices: [{ id: "kani", label: "Lakshmi", gender: "female", accent: "in", langs: ["en"], ready: true }],
        defaultVoice: "kani",
      });
      if (url.toLowerCase().includes("/classroom/cbse/6/science/exploring-magnets/magnetic-and-non-magnetic")) return ok(sampleClassroom);
      if (url.includes("/topics/")) return ok({
        topic: { id: sampleLessonId, slug: "magnetic-and-non-magnetic", name: { en: "Magnetic and non-magnetic things" } },
        chapter: { slug: "exploring-magnets", position: 1, name: { en: "Exploring Magnets" } },
        subject: { slug: "science", name: { en: "Science" } },
        classLevel: 6, objectives: [], prerequisites: [], unlocks: [], previous: null, next: null,
      });
      if (url.includes("/phrases")) return ok({ phrases: {} });
      if (url.includes("/lessons/available")) return ok({ topicIds: [sampleLessonId] });
      return new Response("{}", { status: 404 });
    }),
  );
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider waitForLatest><Layout><Routes /></Layout></SettingsProvider></Router>);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  resetBooksCache();
  vi.stubGlobal("scrollTo", vi.fn());
});

describe("LIB-05 textbook links and study-only notice", () => {
  it("renders bottom personal-study notice on /books and respects reader.disclaimer.show", async () => {
    mount("/books");
    await screen.findByText(/only for students' e-learning|personal study only/i);
    expect(screen.getAllByRole("link", { name: /Textbooks/i }).length).toBeGreaterThan(0);

    cleanup();
    mount("/books", { "reader.disclaimer.show": false });
    await screen.findByRole("heading", { name: /Textbooks/i });
    await waitFor(() => expect(screen.queryByText(/only for students' e-learning|personal study only/i)).toBeNull());
  });
});

describe("SITE-02..SITE-05 layouts, editorial theme, and scroll aids", () => {
  it("supports Official Editorial theme, preset layouts, and sidebar dashboard navigation", async () => {
    expect(THEMES.some((t) => t.id === "editorial")).toBe(true);
    expect(presets.map((p) => p.id)).toEqual(expect.arrayContaining(["classic", "classroom", "path", "explorer", "dashboard", "activity", "reading"]));
    expect(THEME_PRESETS.length).toBeGreaterThanOrEqual(4);

    mount("/", { "theme.preset": "editorial", "layout.sitePreset": "dashboard", "layout.scrollBar": true, "layout.backToTop": true });
    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("editorial");
      expect(document.querySelector('[data-site-preset="dashboard"]')).toBeTruthy();
      expect(document.querySelector(".body-row > .preset-menu")).toBeTruthy();
      expect(document.querySelector(".scroll-track")).toBeTruthy();
      expect(screen.getByRole("button", { name: /Top/i })).toBeTruthy();
    });
  });
});

describe("CONTENT-07 featured sample Classroom lesson", () => {
  it("links Home CTA to the Class 6 magnets sample and renders its sample intro on Classroom", async () => {
    mount("/", { "catalog.openClasses": [3, 6], "home.tryLesson.show": true, "home.tryLesson.classroom": true });
    await waitFor(() => {
      const cta = document.querySelector("a.try-btn") as HTMLAnchorElement | null;
      expect(cta).toBeTruthy();
      expect(cta!.getAttribute("href")).toBe("/classroom/cbse/6/science/exploring-magnets/magnetic-and-non-magnetic?sample");
    });

    cleanup();
    mount("/classroom/cbse/6/science/exploring-magnets/magnetic-and-non-magnetic", { "catalog.openClasses": [3, 6] });
    await screen.findByRole("heading", { name: /Magnetic and non-magnetic things/i });
    expect((await screen.findAllByRole("button", { name: /Start the lesson/i })).length).toBeGreaterThan(0);
  });
});
