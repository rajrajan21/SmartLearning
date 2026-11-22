import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const lesson = {
  board: "CBSE", classLevel: 3, subject: "maths", chapter: "fair-share", topic: "halves-and-quarters", status: "published", title: { en: "Halves and quarters" },
  objects: [{ kind: "circle", id: "whole", cx: 250, cy: 270, r: 160 }, { kind: "text", id: "t", x: 600, y: 100, text: "1 whole" }],
  steps: [
    { id: "a", narration: { en: "This is one whole." }, actions: [{ do: "draw", target: "whole", at: 0, ms: 100 }, { do: "write", target: "t", on: "one whole", ms: 100 }] },
    { id: "b", narration: { en: "Think about it." }, actions: [], check: { stem: { en: "How many quarters make one whole?" }, explanation: { en: "Four quarters make one whole." }, options: [{ id: "a", text: { en: "2" }, whyWrong: { en: "Only a half." } }, { id: "b", text: { en: "4" }, correct: true }] } },
  ],
};
let settings: Record<string, unknown> = {};
function mount(path: string) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.includes("/classroom/index")) return ok({ items: [{ board: "CBSE", classLevel: 3, subject: "maths", chapter: "fair-share", topic: "halves-and-quarters", title: lesson.title, steps: 2 }] });
    if (url.includes("/classroom/CBSE/3/maths/fair-share/halves-and-quarters") || url.includes("/classroom/cbse/3/maths/fair-share/halves-and-quarters")) return ok(lesson);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider waitForLatest><AccountProvider><Layout><Routes /></Layout></AccountProvider></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); settings = { "classroom.browserVoice": false }; vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })); });

describe("classroom", () => {
  it("lets the server choose the lesson voice when no preference is saved", async () => {
    const path = "/classroom/cbse/3/maths/fair-share/halves-and-quarters";
    mount(path);
    await screen.findByText("Halves and quarters", {}, { timeout: 3000 });
    expect(fetch).toHaveBeenCalledWith(`/api/v1${path}`);
  });
  it("lists the lessons on the hub", async () => {
    mount("/classroom");
    expect(await screen.findByText("Halves and quarters")).toBeTruthy();
  });
  it("combines Classroom filters and restores results when cleared", async () => {
    mount("/classroom");
    await screen.findByText("Halves and quarters");
    fireEvent.change(screen.getByRole("combobox", { name: "Class" }), { target: { value: "3" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Subject" }), { target: { value: "maths" } });
    const search = screen.getByRole("searchbox", { name: "Find a Classroom lesson" });
    fireEvent.change(search, { target: { value: "fair share" } });
    expect(screen.getByText("Halves and quarters")).toBeTruthy();
    fireEvent.change(search, { target: { value: "magnet" } });
    expect(screen.queryByText("Halves and quarters")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Halves and quarters")).toBeTruthy();
  });
  it("keeps chapter search visible when Activity Hub navigation is collapsed", async () => {
    settings = { ...settings, "layout.sitePreset": "activity", "search.header.show": true, "feature.search": true };
    mount("/classroom");
    const menu = await screen.findByRole("button", { name: /Menu/ });
    expect(menu.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(menu);
    expect(menu.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("searchbox", { name: "Search chapters and topics" })).toBeTruthy();
    fireEvent.click(menu);
    expect(menu.getAttribute("aria-expanded")).toBe("true");
  });
  it("opens browser install and bookmark help even without a native prompt", async () => {
    settings = { ...settings, "app.install.show": true };
    mount("/classroom");
    fireEvent.click(await screen.findByRole("button", { name: "Install app / bookmark" }));
    expect(screen.getByText(/bookmark this page/)).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText(/bookmark this page/)).toBeNull();
  });
  it("has its own heart: save, un-save, and it can be switched off", async () => {
    mount("/classroom/cbse/3/maths/fair-share/halves-and-quarters");
    await screen.findByText("Halves and quarters");
    fireEvent.click(screen.getByRole("button", { name: /Save to my notebook/ }));
    const all = JSON.parse(localStorage.getItem("ss_notebook_v1") ?? "{}") as Record<string, { href: string; removedAt?: number }>;
    expect(Object.values(all)[0]?.href).toBe("/classroom/cbse/3/maths/fair-share/halves-and-quarters");
    fireEvent.click(await screen.findByRole("button", { name: /Saved in my notebook/ }));
    expect(Object.values(JSON.parse(localStorage.getItem("ss_notebook_v1") ?? "{}") as Record<string, { removedAt?: number }>)[0]?.removedAt).toBeGreaterThan(0);
    cleanup(); settings = { "classroom.browserVoice": false, "notebook.enabled": false };
    mount("/classroom/cbse/3/maths/fair-share/halves-and-quarters");
    await screen.findByText("Halves and quarters");
    expect(screen.queryByRole("button", { name: /Save to my notebook/ })).toBeNull();
  });
  it("shows a start button, then the step and the caption", async () => {
    mount("/classroom/cbse/3/maths/fair-share/halves-and-quarters");
    await screen.findByText("Halves and quarters");
    fireEvent.click(screen.getAllByRole("button", { name: /Start the lesson/ })[0]!);
    expect(await screen.findByText(/Step 1 of 2/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Pause/ })).toBeTruthy();
  });
  it("pauses at the question until it is answered, explains a wrong answer, then continues", async () => {
    mount("/classroom/cbse/3/maths/fair-share/halves-and-quarters");
    await screen.findByText("Halves and quarters");
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    try {
      fireEvent.click(screen.getAllByRole("button", { name: /Start the lesson/ })[0]!);
      fireEvent.click(screen.getByRole("button", { name: /^Next/ }));
      act(() => { vi.advanceTimersByTime(5000); });
      expect(screen.getByText("How many quarters make one whole?")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(await screen.findByText(/Only a half/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    expect(await screen.findByText(/Four quarters make one whole/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Finish/ }));
    expect(await screen.findByText(/Lesson finished/)).toBeTruthy();
  });
  it("is hidden when the admin switches it off", async () => {
    settings = { "feature.classroom": false };
    mount("/classroom/cbse/3/maths/fair-share/halves-and-quarters");
    expect(await screen.findByText("404")).toBeTruthy();
  });
});
