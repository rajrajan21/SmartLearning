import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => (url.includes("/settings/public") ? new Response(JSON.stringify({ values: settings })) : new Response("{}", { status: 404 }))));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => cleanup());

describe("site pages", () => {
  it("shows the privacy notice from the settings, split into paragraphs, with the contact e-mail", async () => {
    mount("/privacy", { "pages.privacy": { en: "First part.\n\nSecond part." }, "pages.showContact": true, "pages.contactEmail": "help@sharpstudy.in" });
    await screen.findByRole("heading", { name: "Privacy" });
    expect(screen.getByText("First part.")).toBeTruthy();
    expect(screen.getByText("Second part.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "help@sharpstudy.in" })).toBeTruthy();
  });
  it("the footer links to the three pages and can be hidden", async () => {
    mount("/about");
    await screen.findByRole("heading", { name: "About SharpStudy" });
    expect(screen.getAllByRole("link", { name: "Terms of use" }).length).toBeGreaterThan(0);
    cleanup();
    mount("/about", { "pages.footerLinks": false });
    await screen.findByRole("heading", { name: "About SharpStudy" });
    expect(screen.queryByRole("link", { name: "Terms of use" })).toBeNull();
  });
  it("is not found when the pages are switched off", async () => {
    mount("/terms", { "feature.sitePages": false });
    await screen.findByText("We could not find that page.");
  });
});
