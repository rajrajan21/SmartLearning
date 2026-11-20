import { describe, it, expect, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { indexEntry, type Paper } from "@studysmart/shared";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const paper: Paper = {
  v: 1, id: "cbse-10-science-sample-abc123", title: "CBSE Class 10 Science Sample paper", board: "cbse", cls: 10, subject: "Science", kind: "sample", maxMarks: 6,
  source: { site: "CBSE Academic Unit", url: "https://cbseacademic.nic.in/x.pdf" }, hash: "a",
  sections: [{ title: "Section A", questions: [
    { n: "1", text: "Which gas is released in photosynthesis?", marks: 1, type: "mcq", options: ["CO2", "Oxygen", "N2", "H2"], answer: "B", model: "Oxygen" },
    { n: "2", text: "Explain respiration.", marks: 4, type: "long", model: "Glucose is broken down." },
  ] }],
};
function mount(path: string, settings: Record<string, unknown> = {}) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.includes("/settings/public")) return new Response(JSON.stringify({ values: settings }));
    if (url.endsWith("/api/v1/papers")) return new Response(JSON.stringify({ updated: "x", papers: [indexEntry(paper, "2026-11-16")] }));
    if (url.includes("/api/v1/papers/")) return new Response(JSON.stringify(paper));
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("question papers pages", () => {
  it("lists papers with their source and filters by board", async () => {
    mount("/papers");
    await screen.findByText("CBSE Class 10 Science Sample paper");
    expect(screen.getByText(/CBSE Academic Unit/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Board"), { target: { value: "matric" } });
    await screen.findByText("No papers match these filters.");
  });
  it("lets a student answer, submit, and see automatic marks plus reviewer marks", async () => {
    mount("/papers/cbse-10-science-sample-abc123");
    await screen.findByText("Which gas is released in photosynthesis?");
    fireEvent.click(screen.getByLabelText(/Oxygen/));
    fireEvent.change(screen.getByLabelText("Answer to question 2"), { target: { value: "Plants use oxygen" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit and check/ }));
    await screen.findByText(/Your marks: 1 \/ 5/);
    expect(screen.getByText(/Correct answer/)).toBeTruthy();
    expect(screen.getByText(/Glucose is broken down/)).toBeTruthy();
    fireEvent.change(await screen.findByLabelText("Marks given for question 2"), { target: { value: "3" } });
    await screen.findByText(/Your marks: 4 \/ 5/);
    expect(JSON.parse(localStorage.getItem("papers.attempt.cbse-10-science-sample-abc123") ?? "{}").given["0.1"]).toBe(3);
  });
  it("is not found when the feature is switched off", async () => {
    mount("/papers", { "feature.papers": false });
    await screen.findByText("We could not find that page.");
  });
});
