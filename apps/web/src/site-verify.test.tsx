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

const booksPayload = {
  books: [
    { id: "ncert-3-maths", classLevel: 3, subject: "Mathematics", title: "Maths Mela", language: "English", publisher: "NCERT", file: "cemm101", url: "/books/3/cemm101.pdf", pages: 120, bytes: 2048000 },
  ],
};

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
      if (url.includes("/settings/public")) return ok({ values: { "ux.spotlightTour.enabled": false, ...settings } });
      if (url.includes("/api/books")) return ok(booksPayload);
      if (url.includes("/curriculum/boards/")) return ok({ boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [] });
      if (url.includes("/classroom/index")) return ok({ items: [], voices: [], defaultVoice: "kani" });
      if (url.includes("/lessons/available")) return ok({ topicIds: [] });
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
