import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within, act, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { ScrollySections } from "./components/Scrolly";
import { Routes } from "./App";
import { splitSections, pictureFor, reducedMotion } from "./lib/scrolly";
import { pullDistance, PULL_TRIGGER, PULL_MAX } from "./lib/pull";
import { exploreItems } from "./lib/tier2";
import { DEFAULT_SETTINGS_KEYS } from "./round2d.keys";

const tree = { boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27", classes: [{ classLevel: 3, subjects: [
  { id: "s1", slug: "evs", name: { en: "EVS" }, chapters: [{ id: "c1", position: 1, slug: "water", name: { en: "Water Gift" }, topics: [{ id: "w1", slug: "saving-water", name: { en: "Saving water", ta: "நீர்" } }, { id: "w2", slug: "rain", name: { en: "Rain" } }] }] }] }] };
const topic = { topic: { id: "w1", slug: "saving-water", name: { en: "Saving water" } }, chapter: { slug: "water", position: 1, name: { en: "Water Gift" } }, subject: { slug: "evs", name: { en: "EVS" } }, classLevel: 3, objectives: [], prerequisites: [], unlocks: [], previous: null, next: null };
const long = "One.\nTwo.\nThree.\nFour.";
const lesson = (extra: unknown[] = []) => ({ topicId: "w1", version: 1, status: "published", title: { en: "Saving water" }, blocks: [
  { id: "a", type: "explanation", provenance: "original", text: { en: long } },
  { id: "i", type: "image", provenance: "original", assetKey: "x.png", altText: { en: "A tap" } },
  ...extra] });
const narr = { id: "n", type: "teacher_narration", provenance: "original", teacher: "malar", sentences: [{ id: "s1", text: { en: "Look." }, audio: { en: { url: "/a.mp3", durationMs: 800, words: [] } } }] };

function mount(path: string, settings: Record<string, unknown> = {}, les = lesson()) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
    if (url.includes("/settings/public")) return ok({ values: settings });
    if (url.includes("/lessons/available")) return ok({ topicIds: ["w1"] });
    if (url.includes("/lessons/boards")) return ok(les);
    if (url.includes("/topics/")) return ok(topic);
    if (url.includes("/curriculum/boards/")) return ok(tree);
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider waitForLatest><Layout><Routes /></Layout></SettingsProvider></Router>);
}
class IO { static all: IO[] = []; cb: IntersectionObserverCallback; els: Element[] = []; constructor(cb: IntersectionObserverCallback) { this.cb = cb; IO.all.push(this); } observe(e: Element) { this.els.push(e); } disconnect() { this.els = []; } unobserve() {} takeRecords() { return []; } }
beforeEach(() => { cleanup(); localStorage.clear(); IO.all = []; });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("round 2d pure helpers", () => {
  it("splits long explanations only when there are enough paragraphs", () => {
    expect(splitSections(["a", "b"], 3)).toBeNull();
    expect(splitSections(["a", "b", "c"], 3)).toEqual([["a"], ["b"], ["c"]]);
    expect(splitSections(Array.from({ length: 12 }, (_, i) => String(i)), 3)!.length).toBeLessThanOrEqual(8);
  });
  it("spreads pictures over sections and never goes out of range", () => {
    expect(pictureFor(0, 4, 0)).toBe(-1);
    expect([0, 1, 2, 3].map((i) => pictureFor(i, 4, 2))).toEqual([0, 0, 1, 1]);
    expect(pictureFor(9, 4, 2)).toBe(1);
  });
  it("pull distance is rubber-banded and capped", () => {
    expect(pullDistance(-20)).toBe(0); expect(pullDistance(80)).toBe(40); expect(pullDistance(9999)).toBe(PULL_MAX);
    expect(PULL_TRIGGER).toBeLessThan(PULL_MAX);
  });
  it("reduced motion is detected from the site setting", () => {
    document.documentElement.setAttribute("data-motion", "reduced"); expect(reducedMotion()).toBe(true);
    document.documentElement.setAttribute("data-motion", "full"); expect(reducedMotion()).toBe(false);
    document.documentElement.removeAttribute("data-motion");
  });
  it("language filter keeps only topics with a Tamil name", () => {
    expect(exploreItems(tree, "CBSE", [3], { tamil: true }).map((i) => i.id)).toEqual(["w1"]);
    expect(exploreItems(tree, "CBSE", [3]).length).toBe(2);
  });
  it("every new switch exists", () => { expect(DEFAULT_SETTINGS_KEYS.length).toBe(6); });
});

describe("scroll sections", () => {
  it("turns a long explanation into step sections and follows the observer", () => {
    vi.stubGlobal("IntersectionObserver", IO);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ values: {} }))));
    render(<SettingsProvider><ScrollySections paras={long.split("\n")} pictures={[]} min={3} /></SettingsProvider>);
    const secs = screen.getAllByRole("region", { name: /^Part \d/ });
    expect(secs.length).toBe(4);
    const io = IO.all[IO.all.length - 1]!;
    act(() => io.cb([{ isIntersecting: true, target: secs[2]! } as unknown as IntersectionObserverEntry], io as unknown as IntersectionObserver));
    expect(document.querySelector(".scrolly")!.getAttribute("data-active")).toBe("2");
    expect(secs[2]!.className).toMatch(/on/);
  });
  it("falls back to plain paragraphs without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ values: {} }))));
    render(<SettingsProvider><ScrollySections paras={long.split("\n")} pictures={[]} min={3} /></SettingsProvider>);
    expect(screen.getByText("Three.")).toBeTruthy();
    expect(document.querySelector(".scrolly-pic")).toBeNull();
    expect(document.querySelector(".scrolly.live")).toBeNull();
  });
  it("can be switched off", async () => {
    vi.stubGlobal("IntersectionObserver", IO);
    mount("/cbse/3/evs/water/saving-water/learn", { "lesson.scrolly.enabled": false });
    await screen.findByText("Three.");
    expect(document.querySelector(".scrolly")).toBeNull();
  });
  it("min paragraphs setting is respected", async () => {
    vi.stubGlobal("IntersectionObserver", IO);
    mount("/cbse/3/evs/water/saving-water/learn", { "lesson.scrolly.minParagraphs": 6 });
    await screen.findByText("Three.");
    expect(document.querySelector(".scrolly")).toBeNull();
  });
});

describe("Listen in the bottom bar", () => {
  const withNarr = () => lesson([narr]);
  it("reserves a bar slot on every step and enables Listen on the narration step", async () => {
    mount("/cbse/3/evs/water/saving-water/learn", {}, withNarr());
    await screen.findByText("Three.");
    const bar = document.querySelector(".lesson-nav")!;
    const slot = bar.querySelector(".bar-slot")!;
    expect(slot).toBeTruthy();
    expect((slot.querySelector("button") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /Next step/ }));
    fireEvent.click(screen.getByRole("button", { name: /Next step/ }));
    const btn = await within(bar as HTMLElement).findByRole("button", { name: "Listen" });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });
  it("is off with its switch, and absent when the lesson has no narration", async () => {
    mount("/cbse/3/evs/water/saving-water/learn", { "lesson.listen.inBar": false }, withNarr());
    await screen.findByText("Three.");
    expect(document.querySelector(".bar-slot")).toBeNull();
    cleanup();
    mount("/cbse/3/evs/water/saving-water/learn");
    await screen.findByText("Three.");
    expect(document.querySelector(".bar-slot")).toBeNull();
  });
});

describe("Explore filters sheet and language chip", () => {
  it("opens a bottom sheet with class and subject filters and a language chip", async () => {
    mount("/explore");
    const open = await screen.findByRole("button", { name: /Filters/ });
    fireEvent.click(open);
    const dlg = screen.getByRole("dialog", { name: "Filters" });
    fireEvent.change(within(dlg).getByLabelText("Class"), { target: { value: "3" } });
    fireEvent.click(within(dlg).getByRole("button", { name: /Has Tamil/ }));
    expect(within(dlg).getByRole("button", { name: /Show topics \(1\)/ })).toBeTruthy();
    fireEvent.click(within(dlg).getByRole("button", { name: /Clear all/ }));
    expect(within(dlg).getByRole("button", { name: /Show topics \(2\)/ })).toBeTruthy();
  });
  it("switches work: no sheet button when off; no language chip when off", async () => {
    mount("/explore", { "browse.explore.sheet": false, "browse.explore.langChip": false });
    await screen.findByRole("region", { name: "Water" });
    expect(screen.queryByRole("button", { name: /Filters/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Has Tamil/ })).toBeNull();
  });
});

describe("pull to refresh", () => {
  const touch = (el: Element, type: string, y: number) => { const t = { clientX: 50, clientY: y, identifier: 1, target: el } as unknown as Touch; const e = new Event(type, { bubbles: true }) as Event & { touches: Touch[] }; e.touches = type === "touchend" ? [] : [t]; el.dispatchEvent(e); };
  const feedMount = (settings: Record<string, unknown> = {}) => {
    Object.defineProperty(window, "ontouchstart", { value: null, configurable: true });
    localStorage.setItem("ss_view", "app");
    return mount("/", settings);
  };
  afterEach(() => { delete (window as unknown as Record<string, unknown>).ontouchstart; });
  it("a long pull at the top re-reads progress and shows Updated", async () => {
    feedMount();
    const feed = await screen.findByLabelText("Swipe up for more");
    act(() => { touch(feed, "touchstart", 0); touch(feed, "touchmove", 60); });
    act(() => { touch(feed, "touchmove", 200); });
    expect(screen.getByText("Let go to refresh")).toBeTruthy();
    act(() => { touch(feed, "touchend", 200); });
    expect(screen.getByText(/Updated/)).toBeTruthy();
    expect(feed.getAttribute("data-tick")).toBe("1");
  });
  it("a short pull does nothing, and it can be switched off", async () => {
    feedMount();
    const feed = await screen.findByLabelText("Swipe up for more");
    act(() => { touch(feed, "touchstart", 0); touch(feed, "touchmove", 40); touch(feed, "touchend", 40); });
    expect(feed.getAttribute("data-tick")).toBe("0");
    cleanup();
    feedMount({ "app.feed.pullRefresh": false });
    const f2 = await screen.findByLabelText("Swipe up for more");
    await waitFor(() => expect(document.querySelector(".ptr")).toBeNull());
    act(() => { touch(f2, "touchstart", 0); touch(f2, "touchmove", 300); touch(f2, "touchend", 300); });
    expect(f2.getAttribute("data-tick")).toBe("0");
    expect(document.querySelector(".ptr")).toBeNull();
  });
});
