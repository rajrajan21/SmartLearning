import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "./lib/settings";
import { AccountProvider } from "./lib/account";
import { Layout } from "./components/Layout";
import { Routes } from "./App";
import "./pages/Classroom";

const topicId = "752e3212-58ce-4c0f-98bc-890d594339ca";
const tree = {
  boardCode: "CBSE",
  boardName: "CBSE",
  academicYear: "2026-27",
  classes: [
    {
      classLevel: 3,
      subjects: [
        {
          id: "s1",
          slug: "maths",
          name: { en: "Mathematics" },
          chapters: [
            {
              id: "c1",
              slug: "fair-share",
              position: 1,
              name: { en: "Fair Share" },
              topics: [{ id: topicId, slug: "halves-and-quarters", name: { en: "Halves and quarters" } }],
            },
          ],
        },
      ],
    },
  ],
};

function makeLesson(withRecordedAudio: boolean) {
  return {
    topicId,
    board: "CBSE",
    classLevel: 3,
    subject: "maths",
    chapter: "fair-share",
    topic: "halves-and-quarters",
    status: "published",
    title: { en: "Halves and quarters" },
    ...(withRecordedAudio ? { voiceUsed: "kani", voicesReady: ["kani"] } : {}),
    objects: [{ kind: "text", id: "t", x: 100, y: 100, text: "Whole" }],
    steps: [
      {
        id: "s1",
        section: "Intro",
        narration: { en: "One whole pie." },
        ...(withRecordedAudio ? { audio: { en: { url: "/api/v1/audio/kani/s1.mp3", durationMs: 4000, words: [] } } } : {}),
        actions: [],
      },
      {
        id: "s2",
        section: "Learn",
        narration: { en: "Two equal halves." },
        ...(withRecordedAudio ? { audio: { en: { url: "/api/v1/audio/kani/s2.mp3", durationMs: 4000, words: [] } } } : {}),
        actions: [],
      },
    ],
  };
}

function mount(lesson: ReturnType<typeof makeLesson>, settings: Record<string, unknown> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      const ok = (b: unknown) => new Response(JSON.stringify(b), { status: 200 });
      if (url.includes("/settings/public")) {
        return ok({ values: { "classroom.browserVoice": true, "ux.spotlightTour.enabled": false, ...settings } });
      }
      if (url.includes("/phrases")) return ok({ phrases: {} });
      if (url.includes("/lessons/board-summary")) return ok({ topics: [] });
      if (url.includes("/classroom/index")) return ok({ items: [], voices: [{ id: "kani", label: "Lakshmi", gender: "female", accent: "in", langs: ["en"], ready: true }], defaultVoice: "kani" });
      if (url.toLowerCase().includes("/classroom/cbse/3/maths/fair-share/halves-and-quarters")) return ok(lesson);
      if (url.includes("/topics/")) return ok({ topic: { id: topicId, slug: "halves-and-quarters", name: { en: "Halves and quarters" } }, chapter: { slug: "fair-share", position: 1, name: { en: "Fair Share" } }, subject: { slug: "maths", name: { en: "Mathematics" } }, classLevel: 3, objectives: [], prerequisites: [], unlocks: [], previous: null, next: null });
      if (url.includes("/curriculum/boards/")) return ok(tree);
      if (url.includes("/lessons/available")) return ok({ topicIds: [topicId] });
      return new Response("{}", { status: 404 });
    }),
  );
  const { hook } = memoryLocation({ path: "/classroom/cbse/3/maths/fair-share/halves-and-quarters", static: false });
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

describe("AUDIO-03 Classroom playback rate synchronization", () => {
  it("applies 0.85x speed to recorded audio and updates mid-step without restarting clip", async () => {
    const audioInstances: { src: string; playbackRate: number; currentTime: number; playCount: number; pause: ReturnType<typeof vi.fn>; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> }[] = [];
    vi.stubGlobal("Audio", class {
      src = "";
      playbackRate = 1;
      currentTime = 0;
      playCount = 0;
      pause = vi.fn();
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      play = vi.fn(() => { this.playCount++; return Promise.resolve(); });
      constructor(url = "") { this.src = url; audioInstances.push(this); }
    });
    mount(makeLesson(true));

    const startBtns1 = await screen.findAllByRole("button", { name: /Start the lesson/i });
    const speed = screen.getByLabelText(/Speed/i) as HTMLSelectElement;
    fireEvent.change(speed, { target: { value: "0.85" } });
    fireEvent.click(startBtns1[0]!);

    await waitFor(() => {
      expect(audioInstances.length).toBeGreaterThan(0);
      expect(audioInstances[0]!.playbackRate).toBeCloseTo(0.85, 2);
      expect(audioInstances[0]!.playCount).toBe(1);
    });

    const audio = audioInstances[0]!;
    audio.currentTime = 1.6;
    const instancesBefore = audioInstances.length;

    fireEvent.change(speed, { target: { value: "1.25" } });
    await waitFor(() => {
      expect(audio.playbackRate).toBeCloseTo(1.25, 2);
    });
    expect(audio.currentTime).toBeCloseTo(1.6, 2);
    expect(audio.playCount).toBe(1);
    expect(audioInstances.length).toBe(instancesBefore);
  });

  it("applies 0.85x and restarts browser speechSynthesis on mid-step rate change", async () => {
    const spoken: { text: string; rate: number }[] = [];
    const cancel = vi.fn();
    const speak = vi.fn((u: { text: string; rate: number }) => spoken.push({ text: u.text, rate: u.rate }));
    vi.stubGlobal("speechSynthesis", { cancel, speak, pause: vi.fn(), resume: vi.fn(), getVoices: () => [] });
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      text: string;
      rate = 1;
      lang = "";
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onboundary: ((e: unknown) => void) | null = null;
      constructor(t: string) { this.text = t; }
    });

    mount(makeLesson(false), { "classroom.browserVoice": true });
    const startBtns1 = await screen.findAllByRole("button", { name: /Start the lesson/i });
    const speed = screen.getByLabelText(/Speed/i) as HTMLSelectElement;
    fireEvent.change(speed, { target: { value: "0.85" } });
    fireEvent.click(startBtns1[0]!);

    await waitFor(() => {
      expect(spoken.length).toBeGreaterThan(0);
      expect(spoken[spoken.length - 1]!.rate).toBeCloseTo(0.85, 2);
    });

    const cancelsBefore = cancel.mock.calls.length;
    fireEvent.change(speed, { target: { value: "1.5" } });

    await waitFor(() => {
      expect(cancel.mock.calls.length).toBeGreaterThan(cancelsBefore);
      expect(spoken[spoken.length - 1]!.rate).toBeCloseTo(1.5, 2);
    });
  });
});
