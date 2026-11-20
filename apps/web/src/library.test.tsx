import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const book = (id: string, title: string, ageBand: string, language = "en") => ({ id, title, authors: ["A. Writer"], language, ageBand, ageSource: "source", pages: 12, bytes: 200000, licence: { code: "cc0", name: "CC0", url: "" }, source: { site: "ia", siteName: "Internet Archive", url: "https://archive.org/x" }, tags: [], addedAt: "2026-01-01T00:00:00Z", hasCover: true });
const LIST = { books: [book("a", "Little Fox", "4-6"), book("b", "Space Atlas", "10-12"), book("c", "Tamil Tales", "4-6", "ta")], bands: [{ band: "4-6", count: 2 }, { band: "10-12", count: 1 }], languages: [{ code: "en", count: 2 }, { code: "ta", count: 1 }], bytes: 600000 };

function mount(path: string, settings: Record<string, unknown> = {}, list: unknown = LIST) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => (url.includes("/settings/public") ? new Response(JSON.stringify({ values: settings })) : url.includes("/api/v1/library") ? new Response(JSON.stringify(list)) : new Response("{}", { status: 404 }))));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("E-Library page", () => {
  it("lists books and filters by the chosen age range", async () => {
    mount("/library");
    await screen.findAllByText("Little Fox");
    expect(screen.getAllByText("Space Atlas").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "10-12" }));
    expect(screen.queryAllByText("Little Fox").length).toBe(0);
    expect(screen.getAllByText("Space Atlas").length).toBeGreaterThan(0);
  });
  it("searches by title", async () => {
    mount("/library");
    await screen.findAllByText("Little Fox");
    fireEvent.change(screen.getByLabelText("Search books"), { target: { value: "atlas" } });
    expect(screen.queryAllByText("Little Fox").length).toBe(0);
    expect(screen.getAllByText("Space Atlas").length).toBeGreaterThan(0);
  });
  it("shows a friendly message when the shelf is empty", async () => {
    mount("/library", {}, { books: [], bands: [], languages: [], bytes: 0 });
    await screen.findByText("No books here yet. Check back soon.");
  });
  it("is not found when the feature is switched off", async () => {
    mount("/library", { "feature.library": false });
    await screen.findByText("We could not find that page.");
  });
  it("shows the licence and source on a book page", async () => {
    mount("/library/a");
    await screen.findByRole("heading", { name: "Little Fox" });
    expect(document.querySelector(".lib-credit")?.textContent).toContain("CC0");
    expect(screen.getByRole("link", { name: "Internet Archive" })).toBeTruthy();
  });
  it("opens a book in the Book Reader when ready-made pages exist, and keeps the credits below", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => (url.includes("/settings/public") ? new Response(JSON.stringify({ values: {} })) : url.endsWith("/a/info") ? new Response(JSON.stringify({ reader: true, fallbackPdf: true, state: "ready", fast: { pages: 12, ratio: 0.7, base: "/api/v1/library/a/pages/" } })) : url.includes("/api/v1/library") ? new Response(JSON.stringify(LIST)) : new Response("{}"))));
    const { hook } = memoryLocation({ path: "/library/a", static: false });
    render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
    await screen.findByRole("heading", { name: "Little Fox" });
    await waitFor(() => expect(document.querySelector(".rd-wrap")).toBeTruthy());
    expect(document.querySelector(".lib-credit")?.textContent).toContain("CC0");
  });
  it("shows the plain PDF view when the admin switches the reader off", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => (url.includes("/settings/public") ? new Response(JSON.stringify({ values: {} })) : url.endsWith("/a/info") ? new Response(JSON.stringify({ reader: false, fallbackPdf: true, state: "off", fast: null })) : url.includes("/api/v1/library") ? new Response(JSON.stringify(LIST)) : new Response("{}"))));
    const { hook } = memoryLocation({ path: "/library/a", static: false });
    render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
    await screen.findByRole("heading", { name: "Little Fox" });
    expect(document.querySelector(".rd-wrap")).toBeNull();
  });
});
