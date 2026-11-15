import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import { themeVars } from "./lib/theme";
import { defaults } from "@studysmart/shared";

const tree = {
  boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27",
  classes: [{ classLevel: 3, subjects: [{ id: "s1", slug: "maths", name: { en: "Mathematics", ta: "கணிதம்" }, textbook: { title: "Maths Mela" },
    chapters: [{ id: "c1", slug: "whats-in-a-name", position: 1, name: { en: "What's in a Name?" }, topics: [] }, { id: "c2", slug: "toy-joy", position: 2, name: { en: "Toy Joy" }, topics: [] }] }] }],
};

function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.includes("/settings/public")) return new Response(JSON.stringify({ values: settings }), { status: 200 });
    if (url.includes("/curriculum/boards/CBSE") || url.includes("/curriculum/boards/cbse")) return new Response(JSON.stringify(tree), { status: 200 });
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}

beforeEach(() => { cleanup(); localStorage.clear(); });

describe("web app", () => {
  it("home shows open class and coming-soon classes", async () => {
    mount("/");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(/Understand every chapter/);
    await waitFor(() => expect(document.querySelector("a.class-tab.on")?.textContent).toContain("3"));
    expect(document.querySelectorAll(".class-tab.off").length).toBeGreaterThan(0);
  });
  it("lists chapters of a subject", async () => {
    mount("/cbse/3/maths");
    await waitFor(() => expect(screen.getByText("Toy Joy")).toBeTruthy());
    expect(screen.getByText(/Maths Mela/)).toBeTruthy();
  });
  it("closed class gives not-found", async () => {
    mount("/cbse/5");
    await waitFor(() => expect(screen.getByText("404")).toBeTruthy());
  });
  it("language toggle switches to Tamil and can be hidden by settings", async () => {
    mount("/");
    fireEvent.click(screen.getByRole("button", { name: /Language/i }));
    await waitFor(() => expect(document.documentElement.lang).toBe("ta"));
    cleanup();
    mount("/", { "feature.languageToggle": false });
    await waitFor(() => expect(screen.queryByRole("button", { name: /Language/i })).toBeNull());
  });
  it("maintenance mode replaces the page", async () => {
    mount("/", { "site.maintenance.enabled": true });
    await waitFor(() => expect(screen.getByText("Back soon")).toBeTruthy());
  });
});

describe("theme", () => {
  const custom = { ...defaults(), "theme.palette": "custom", "theme.preset": "notebook" };
  it("turns settings into css variables (Custom palette passes the individual colours straight through)", () => {
    const { vars, attrs } = themeVars({ ...custom, "theme.radius": "round", "theme.mode": "dark" }, false);
    expect(vars["--radius"]).toBe("22px");
    expect(attrs["data-mode"]).toBe("dark");
    expect(vars["--paper"]).toBe(defaults()["theme.dark.paper"]);
    expect(vars["--brand"]).toBe(defaults()["theme.color.brand"]);
    const light = themeVars({ ...custom, "theme.color.brand": "#AA0000", "theme.color.margin": "#00AA00" }, false);
    expect(light.vars["--brand"]).toBe("#AA0000");
    expect(light.vars["--margin"]).toBe("#00AA00");
    expect(light.attrs["data-rules"]).toBe("true");
  });
  it("a palette sets the colours and a theme sets structure; the default is the recommended pair", () => {
    const d = themeVars(defaults(), false);
    expect(d.attrs["data-theme"]).toBe("playful");
    expect(d.attrs["data-palette"]).toBe("indigo-dawn");
    expect(d.attrs["data-rules"]).toBe("false"); // notebook-only decoration
    expect(d.vars["--radius"]).toBe("18px");
    const mint = themeVars({ ...defaults(), "theme.palette": "mint-fresh", "theme.preset": "brutalist" }, false);
    expect(mint.attrs["data-theme"]).toBe("brutalist");
    expect(mint.vars["--brand"]).not.toBe(d.vars["--brand"]);
    expect(mint.vars["--radius"]).toBe("6px");
    expect(themeVars({ ...defaults(), "theme.radius": "sharp" }, false).vars["--radius"]).toBe("4px");
    expect(themeVars({ ...defaults(), "theme.font.heading": "system" }, false).vars["--font-heading"]).toMatch(/^system-ui/);
  });
  it("the Notebook theme keeps ruled lines and the margin line", () => {
    const n = themeVars({ ...defaults(), "theme.preset": "notebook", "theme.palette": "notebook-blue" }, false);
    expect(n.attrs["data-rules"]).toBe("true");
    expect(n.attrs["data-margin"]).toBe("true");
    expect(n.vars["--brand"]).toBe("#1F4FD1");
    expect(n.vars["--paper"]).toBe("#F4F8FC");
  });
});
