import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, createEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AccountProvider } from "./lib/account";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import { isPhone, resolveApp, buzz, getThemePref } from "./lib/appview";
import { quickQuestion, factOfDay, FACTS } from "./lib/facts";
import { BottomSheet } from "./components/BottomSheet";
import { Groups, WaterCycle } from "./components/TryIt";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
const PIXEL = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36";
const TABLET = "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const IPAD = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15";

const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [{ id: "s", slug: "maths", name: { en: "Maths" }, chapters: [{ id: "c", position: 1, slug: "shapes", name: { en: "Shapes" }, topics: [{ id: "a", slug: "sides", name: { en: "Sides" } }, { id: "b", slug: "corners", name: { en: "Corners" } }] }] }] }] };
function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.includes("/lessons/available")) return ok({ topicIds: ["a"] });
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider waitForLatest><AccountProvider><Layout><Routes /></Layout></AccountProvider></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); document.documentElement.removeAttribute("data-app"); });

describe("phone detection", () => {
  it("phones yes; tablets and computers no", () => {
    expect(isPhone(IPHONE, 390, true)).toBe(true);
    expect(isPhone(PIXEL, 360, true)).toBe(true);
    expect(isPhone(TABLET, 800, true)).toBe(false);
    expect(isPhone(IPAD, 820, true)).toBe(false);
    expect(isPhone(MAC, 1440, false)).toBe(false);
  });
  it("saved choice beats detection; the master switch beats everything", () => {
    const base = { enabled: true, auto: true, pref: null, phone: true } as const;
    expect(resolveApp(base)).toBe(true);
    expect(resolveApp({ ...base, pref: "site" })).toBe(false);
    expect(resolveApp({ ...base, phone: false })).toBe(false);
    expect(resolveApp({ ...base, phone: false, pref: "app" })).toBe(true);
    expect(resolveApp({ ...base, auto: false })).toBe(false);
    expect(resolveApp({ ...base, enabled: false, pref: "app" })).toBe(false);
  });
  it("vibration is guarded", () => {
    expect(() => buzz()).not.toThrow();
    const v = vi.fn(); Object.defineProperty(navigator, "vibrate", { value: v, configurable: true });
    buzz(30); expect(v).toHaveBeenCalledWith(30);
    Object.defineProperty(navigator, "vibrate", { value: undefined, configurable: true });
  });
});

describe("facts and quick question", () => {
  it("one fact a day, wrapping; Tamil text exists for all", () => {
    expect(factOfDay(0)).toBe(FACTS[0]); expect(factOfDay(FACTS.length)).toBe(FACTS[0]); expect(factOfDay(-1)).toBe(FACTS[FACTS.length - 1]);
    expect(FACTS.every((f) => f.en && f.ta)).toBe(true);
  });
  it("question is stable per seed, has the answer once and three distinct options", () => {
    for (let seed = 1; seed < 60; seed++) {
      const q = quickQuestion(seed);
      expect(q).toEqual(quickQuestion(seed));
      expect(q.answer).toBe(q.a * q.b);
      expect(new Set(q.options).size).toBe(3);
      expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
    }
  });
});

describe("try-it components", () => {
  it("equal-groups puzzle checks the target", () => {
    render(<SettingsProvider><Groups target={{ groups: 2, per: 2 }} /></SettingsProvider>);
    fireEvent.click(screen.getByRole("button", { name: "More groups" }));
    fireEvent.click(screen.getByRole("button", { name: "More in each" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status").textContent).toMatch(/Perfect! 2 × 2 = 4/);
    fireEvent.click(screen.getByRole("button", { name: "More groups" }));
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByRole("status").textContent).toMatch(/Not yet/);
  });
  it("explorer updates the sum at once", () => {
    render(<SettingsProvider><Groups /></SettingsProvider>);
    expect(screen.getByLabelText("3 × 4 = 12")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "More groups" }));
    expect(screen.getByLabelText("4 × 4 = 16")).toBeTruthy();
  });
  it("scrub slider steps the water cycle", () => {
    render(<SettingsProvider><WaterCycle /></SettingsProvider>);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "2" } });
    expect(screen.getByText(/rain falls down/)).toBeTruthy();
  });
});

describe("bottom sheet", () => {
  it("opens as a dialog, closes with Escape and the Close button", () => {
    const close = vi.fn();
    render(<SettingsProvider><BottomSheet open onClose={close} title="Pick">hello</BottomSheet></SettingsProvider>);
    expect(screen.getByRole("dialog", { name: "Pick" })).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" }); expect(close).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Close" })); expect(close).toHaveBeenCalledTimes(2);
  });
  it("drag down past the threshold closes it", () => {
    const close = vi.fn();
    const { container } = render(<SettingsProvider><BottomSheet open onClose={close} title="Pick">x</BottomSheet></SettingsProvider>);
    const h = container.querySelector(".sheet-handle")!;
    const ptr = (type: "pointerDown" | "pointerMove", y: number) => { const e = createEvent[type](h, { pointerId: 1 }); Object.defineProperty(e, "clientY", { value: y }); fireEvent(h, e); };
    ptr("pointerDown", 100); ptr("pointerMove", 260); fireEvent.pointerUp(h);
    expect(close).toHaveBeenCalled();
  });
  it("renders nothing when closed", () => {
    const { container } = render(<SettingsProvider><BottomSheet open={false} onClose={() => {}} title="x">x</BottomSheet></SettingsProvider>);
    expect(container.querySelector(".sheet")).toBeNull();
  });
});

describe("app view screens", () => {
  it("normal website by default on a computer", async () => {
    mount("/");
    await screen.findByRole("heading", { level: 1 });
    expect(document.querySelector(".appfeed")).toBeNull();
    expect(document.documentElement.hasAttribute("data-app")).toBe(false);
  });
  it("saved app choice: feed with mission, cards, end card, app tab bar and app bar", async () => {
    localStorage.setItem("ss_view", "app");
    mount("/");
    const mission = await screen.findByRole("region", { name: "Today's mission" });
    expect(within(mission).getByRole("link", { name: /Start/ }).getAttribute("href")).toBe("/cbse/3/maths/shapes/sides/learn");
    expect(screen.getByRole("region", { name: "Did you know?" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Quick question" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Try it: equal groups" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "You're all caught up!" })).toBeTruthy();
    expect(document.documentElement.getAttribute("data-app")).toBe("true");
    const tabs = screen.getByRole("navigation", { name: "Main menu" });
    expect(within(tabs).getAllByRole("link").map((a) => a.textContent)).toEqual(["🏠Home", "📚Learn", "✏️Practice", "⭐Progress", "🙂Me"]);
    expect(tabs.querySelector("li.centre")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Quick settings" })).toBeTruthy();
  });
  it("feed cards each have a switch", async () => {
    localStorage.setItem("ss_view", "app");
    mount("/", { "app.feed.quiz.show": false, "app.feed.tryIt.show": false, "home.didYouKnow.show": false, "app.feed.recent.show": false });
    await screen.findByRole("region", { name: "Today's mission" });
    expect(screen.queryByRole("region", { name: "Quick question" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Try it: equal groups" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Did you know?" })).toBeNull();
  });
  it("feed: class chip opens a sheet; pick-up card lists recent lessons", async () => {
    localStorage.setItem("ss_view", "app");
    localStorage.setItem("ss_progress_v1", JSON.stringify({ a: { step: 1, total: 3, done: false, updatedAt: Date.now() - 5000 }, b: { step: 3, total: 3, done: true, updatedAt: Date.now() - 9000 } }));
    mount("/");
    const recent = await screen.findByRole("region", { name: "Pick up where you left off" });
    expect(within(recent).getByText("Corners")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Class 3/ }));
    expect(screen.getByRole("dialog", { name: "Pick your class" })).toBeTruthy();
  });
  it("quick question: right answer shows praise", async () => {
    localStorage.setItem("ss_view", "app");
    mount("/");
    const card = await screen.findByRole("region", { name: "Quick question" });
    const heading = within(card).getByText(/× \d = \?/).textContent!;
    const [a, b] = heading.match(/\d+/g)!.map(Number);
    fireEvent.click(within(card).getByRole("button", { name: String(a! * b!) }));
    expect(within(card).getByRole("status").textContent).toMatch(/Well done/);
  });
  it("Me: choose Light/Dark/Auto (remembered), and switch to the full website and back", async () => {
    localStorage.setItem("ss_view", "app");
    mount("/account");
    fireEvent.click(await screen.findByRole("radio", { name: /Dark/ }));
    expect(getThemePref()).toBe("dark");
    expect(document.documentElement.getAttribute("data-mode")).toBe("dark");
    fireEvent.click(screen.getByRole("radio", { name: /Auto/ }));
    expect(document.documentElement.getAttribute("data-mode")).toBe("light");
    fireEvent.click(screen.getByRole("button", { name: "View the full website" }));
    expect(localStorage.getItem("ss_view")).toBe("site");
    expect(document.documentElement.hasAttribute("data-app")).toBe(false);
  });
  it("Me shows the install help and notebook link", async () => {
    localStorage.setItem("ss_view", "app");
    mount("/account");
    expect(await screen.findByRole("region", { name: "Install SharpStudy" })).toBeTruthy();
    expect(within(document.querySelector(".me-links") as HTMLElement).getByRole("link", { name: /My notebook/ })).toBeTruthy();
  });
  it("Learn tab: colour tiles, chapter preview sheet and mastery bar in the app view only", async () => {
    localStorage.setItem("ss_view", "app");
    mount("/cbse/3");
    const tiles = await screen.findByRole("region", { name: "Explore by colour" });
    expect(within(tiles).getAllByRole("link").length).toBeGreaterThan(5);
    cleanup();
    mount("/cbse/3/maths");
    fireEvent.click(await screen.findByRole("button", { name: "Preview" }));
    const dlg = screen.getByRole("dialog", { name: "Shapes" });
    expect(dlg.textContent).toMatch(/2 topics · about 12 minutes/);
    cleanup(); localStorage.setItem("ss_view", "site");
    mount("/cbse/3/maths");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("button", { name: "Preview" })).toBeNull();
  });
  it("master switch turns the app view off even for a saved choice", async () => {
    localStorage.setItem("ss_view", "app");
    mount("/", { "app.view.enabled": false });
    await screen.findByRole("heading", { level: 1 });
    expect(document.querySelector(".appfeed")).toBeNull();
  });
  it("manifest is valid, installable and has shortcuts and PNG icons", () => {
    const m = JSON.parse(readFileSync(join(process.cwd(), "public/manifest.webmanifest"), "utf8"));
    expect(m.display).toBe("standalone");
    expect(m.icons.some((i: { sizes: string; type: string }) => i.sizes === "512x512" && i.type === "image/png")).toBe(true);
    expect(m.shortcuts.map((s: { name: string }) => s.name)).toEqual(["Practice", "Continue lesson"]);
    const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
    expect(html).toContain("apple-touch-icon"); expect(html).toContain("viewport-fit=cover");
  });
});
