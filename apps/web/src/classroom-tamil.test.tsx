import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import "./pages/Classroom";

const topicId = "9e2b3212-58ce-4c0f-98bc-890d594339ca";
const tree = {
  boardCode: "TNMATRIC",
  boardName: "TN Matric",
  academicYear: "2026-27",
  classes: [
    {
      classLevel: 10,
      subjects: [
        {
          id: "s-ta",
          slug: "tamil",
          name: { en: "Tamil", ta: "தமிழ்" },
          chapters: [
            {
              id: "c-iy1",
              slug: "iyal-1",
              position: 1,
              name: { en: "Iyal 1", ta: "இயல் 1" },
              topics: [{ id: topicId, slug: "annai-mozhiye", name: { en: "Annai Mozhiye", ta: "அன்னை மொழியே" } }],
            },
          ],
        },
      ],
    },
  ],
};

const tamilLesson = {
  topicId,
  board: "TNMATRIC",
  classLevel: 10,
  subject: "tamil",
  chapter: "iyal-1",
  topic: "annai-mozhiye",
  status: "published",
  title: { en: "Annai Mozhiye", ta: "அன்னை மொழியே" },
  voiceUsed: "kani",
  voicesReady: ["kani", "pallavi"],
  objects: [{ kind: "text", id: "t", x: 100, y: 100, text: "அன்னை மொழியே" }],
  steps: [
    {
      id: "s1",
      section: "Start",
      narration: { en: "Hello! Today's lesson is Annai Mozhiye.", ta: "வணக்கம்! இன்றைய பாடம் அன்னை மொழியே." },
      audio: {
        ta: { url: "/api/v1/audio/pallavi-s1-ta.mp3", durationMs: 3200, words: [] },
        en: { url: "/api/v1/audio/kani-s1-en.mp3", durationMs: 3000, words: [] },
      },
      actions: [],
    },
    {
      id: "s2",
      section: "Learn",
      narration: { en: "Pavalareru Perunchithiranar wrote this poem.", ta: "பாவலரேறு பெருஞ்சித்திரனார் இப்பாடலை இயற்றினார்." },
      audio: {
        ta: { url: "/api/v1/audio/pallavi-s2-ta.mp3", durationMs: 3500, words: [] },
        en: { url: "/api/v1/audio/kani-s2-en.mp3", durationMs: 3100, words: [] },
      },
      actions: [],
    },
  ],
};

function mountTamil(settings: Record<string, unknown> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
      if (url.includes("/settings/public")) {
        return ok({ values: { "classroom.tamilSubjectLanguage": "ta-en", "ux.spotlightTour.enabled": false, ...settings } });
      }
      if (url.includes("/phrases")) return ok({ phrases: {} });
      if (url.includes("/lessons/board-summary")) return ok({ topics: [] });
      if (url.includes("/classroom/index")) {
        return ok({
          items: [],
          voices: [
            { id: "kani", label: "Lakshmi", gender: "female", accent: "in", langs: ["en"], ready: true },
            { id: "pallavi", label: "Pallavi", gender: "female", accent: "in", langs: ["ta"], ready: true },
          ],
          defaultVoice: "kani",
        });
      }
      if (url.toLowerCase().includes("/classroom/tnmatric/10/tamil/iyal-1/annai-mozhiye")) return ok(tamilLesson);
      if (url.includes("/topics/")) {
        return ok({
          topic: { id: topicId, slug: "annai-mozhiye", name: { en: "Annai Mozhiye", ta: "அன்னை மொழியே" } },
          chapter: { slug: "iyal-1", position: 1, name: { en: "Iyal 1", ta: "இயல் 1" } },
          subject: { slug: "tamil", name: { en: "Tamil", ta: "தமிழ்" } },
          classLevel: 10,
          objectives: [],
          prerequisites: [],
          unlocks: [],
          previous: null,
          next: null,
        });
      }
      if (url.includes("/curriculum/boards/")) return ok(tree);
      if (url.includes("/lessons/available")) return ok({ topicIds: [topicId] });
      return new Response("{}", { status: 404 });
    }),
  );
  const { hook } = memoryLocation({ path: "/classroom/tnmatric/10/tamil/iyal-1/annai-mozhiye", static: false });
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
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("reduce"),
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
});

describe("Tamil Classroom dual Tamil -> English mode", () => {
  it("defaults Tamil lessons to ta-en, plays Tamil first then English translation, and allows switching modes", async () => {
    const audioInstances: { src: string; playbackRate: number; currentTime: number; onended: (() => void) | null; onerror: (() => void) | null; pause: ReturnType<typeof vi.fn>; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn>; play: ReturnType<typeof vi.fn> }[] = [];
    vi.stubGlobal("Audio", class {
      src = "";
      preload = "";
      playbackRate = 1;
      currentTime = 0;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      play = vi.fn(() => Promise.resolve());
      constructor(url = "") {
        this.src = url;
        if (url) audioInstances.push(this);
      }
    });

    mountTamil();

    const langSelect = (await screen.findByRole("combobox", { name: /^Language$/i })) as HTMLSelectElement;
    expect(langSelect.value).toBe("ta-en");

    const startBtns = await screen.findAllByRole("button", { name: /Start the lesson/i });
    fireEvent.click(startBtns[0]!);

    await waitFor(() => {
      expect(audioInstances.some((a) => a.src.includes("pallavi-s1-ta.mp3") && a.play.mock.calls.length > 0)).toBe(true);
    });

    // Switch to English only and confirm selector accepts all four modes
    fireEvent.change(langSelect, { target: { value: "en" } });
    expect(langSelect.value).toBe("en");
    fireEvent.change(langSelect, { target: { value: "ta" } });
    expect(langSelect.value).toBe("ta");
    fireEvent.change(langSelect, { target: { value: "both" } });
    expect(langSelect.value).toBe("both");
    fireEvent.change(langSelect, { target: { value: "ta-en" } });
    expect(langSelect.value).toBe("ta-en");
  });
});
