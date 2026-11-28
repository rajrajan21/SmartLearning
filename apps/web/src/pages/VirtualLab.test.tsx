import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router, Route } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "../lib/settings";
import { CompactVirtualLabPage, VirtualLabHub, VirtualLabPage } from "./VirtualLab";
import { nominalPh, transformer } from "./virtualLabData";

vi.mock("./virtualLabScene", () => ({ LabScene: () => null }));
function mount(path: string, compact = false) {
  const { hook } = memoryLocation({ path });
  return render(<SettingsProvider><Router hook={hook}>
    <Route path="/virtual-lab" component={VirtualLabHub} />
    <Route path="/virtual-lab/:id" component={compact ? CompactVirtualLabPage : VirtualLabPage} />
  </Router></SettingsProvider>);
}
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ values: {} }))));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("Virtual Lab pilot", () => {
  it("models an ideal turns ratio, zero sustained DC output, and dilution towards neutral", () => {
    expect(transformer(true, 10, 4, 8)).toBe(20);
    expect(transformer(true, 10, 4, 2)).toBe(5);
    expect(transformer(false, 10, 4, 8)).toBe(0);
    expect(nominalPh(2, 90)).toBeCloseTo(3);
    expect(nominalPh(10, 90)).toBeCloseTo(9);
    expect(nominalPh(7, 90)).toBe(7);
  });
  it("links to each lab and changes the catalogue with the subject filter", async () => {
    mount("/virtual-lab");
    expect((await screen.findByRole("link", { name: /Transformer playground/i })).getAttribute("href")).toBe("/virtual-lab/transformer");
    fireEvent.change(screen.getByLabelText("Show labs"), { target: { value: "chemistry" } });
    expect(screen.queryByRole("link", { name: /Transformer playground/i })).toBeNull();
    expect(screen.getByRole("link", { name: /Colour and pH/i }).getAttribute("href")).toBe("/virtual-lab/indicator");
  });
  it("can dismiss or reopen the walkthrough and test the transformer controls", async () => {
    mount("/virtual-lab/transformer", true);
    const guide = await screen.findByRole("complementary", { name: "Lab walkthrough" });
    fireEvent.click(within(guide).getByRole("button", { name: "Dismiss walkthrough" }));
    expect(screen.queryByRole("complementary", { name: "Lab walkthrough" })).toBeNull();
    fireEvent.input(screen.getByRole("slider", { name: "Secondary coil turns" }), { target: { value: "2" } });
    expect(screen.getByText(/Challenge complete/)).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /Steady direct current/ }));
    expect(within(screen.getByRole("region", { name: "Transformer simulation" })).getByText("0.0 V")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "How to use" }));
    expect(screen.getByRole("complementary", { name: "Lab walkthrough" })).toBeTruthy();
  });
});