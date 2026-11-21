import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

function mount(settings: Record<string, unknown> = {}, path = "/") {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => (url.includes("/settings/public") ? new Response(JSON.stringify({ values: settings })) : new Response(JSON.stringify({}), { status: 404 }))));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("E-Library, Question papers, GK and the tour video are on by default", () => {
  it("shows them in the top menu and the tour video in the footer", async () => {
    mount();
    await screen.findAllByText(/GK|General Knowledge/i);
    const hrefs = Array.from(document.querySelectorAll("nav.main-nav a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/library");
    expect(hrefs).toContain("/papers");
    expect(hrefs).toContain("/gk");
    expect(screen.getByTestId("tour-footer")).toBeTruthy();
  });
  it("hides each one when the admin switches it off", async () => {
    mount({ "library.nav.show": false, "papers.nav.show": false, "tour.footer.show": false });
    await screen.findAllByText(/GK|General Knowledge/i);
    const hrefs = Array.from(document.querySelectorAll("nav.main-nav a")).map((a) => a.getAttribute("href"));
    expect(hrefs).not.toContain("/library");
    expect(hrefs).not.toContain("/papers");
    expect(screen.queryByTestId("tour-footer")).toBeNull();
  });
  it("can show only a button in the footer", async () => {
    mount({ "tour.footer.style": "link" });
    await screen.findAllByText(/GK|General Knowledge/i);
    expect(screen.getByTestId("tour-footer")).toBeTruthy();
    expect(within(screen.getByTestId("tour-footer")).queryByTestId("tour-player")).toBeNull();
  });
  it("shows a single player on the dedicated tour page", async () => {
    mount({ "tour.footer.show": true, "tour.page.enabled": true }, "/tour");
    await screen.findByTestId("tour-page");
    expect(screen.getAllByTestId("tour-player")).toHaveLength(1);
    expect(screen.getByTestId("tour-player").querySelector("video")?.getAttribute("src")).toMatch(/^\/tour-video\/tour-en\.mp4\?v=/);
    expect(screen.queryByTestId("tour-footer")).toBeNull();
  });
});
