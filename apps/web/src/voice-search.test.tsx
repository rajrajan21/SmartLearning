import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { normalizeSearch, searchCost } from "@studysmart/shared";
import { VoiceSearchInput } from "./components/VoiceSearchInput";
import { SettingsProvider } from "./lib/settings";

afterEach(() => vi.unstubAllGlobals());

it("places final microphone speech in search and keeps the input usable", async () => {
  class Recognition {
    onresult?: (event: unknown) => void;
    onend?: () => void;
    start() { queueMicrotask(() => {
      const words = Object.assign([{ transcript: "magnet force" }], { isFinal: true });
      this.onresult?.({ results: [words] });
      this.onend?.();
    }); }
    stop() { this.onend?.(); }
    abort() {}
  }
  vi.stubGlobal("SpeechRecognition", Recognition);
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ values: {} })));
  const pick = vi.fn();
  render(<SettingsProvider><VoiceSearchInput aria-label="Search topics" onVoice={pick} /></SettingsProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Search by voice" }));
  await screen.findByRole("button", { name: "Search by voice" });
  expect(pick).toHaveBeenCalledWith("magnet force");
  expect(screen.getByRole("searchbox", { name: "Search topics" })).toBeTruthy();
});

it("ranks exact words ahead of close spellings and preserves Tamil vowel marks", () => {
  expect(searchCost(["fraction"], normalizeSearch("Fractions"))).toBe(0);
  expect(searchCost(["fracion"], normalizeSearch("Fractions"))).toBe(1);
  expect(searchCost(["fraction"], normalizeSearch("Electricity"))).toBe(Infinity);
  expect(normalizeSearch("Café பள்ளி")).toBe("cafe பள்ளி");
});
