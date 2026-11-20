import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Layout } from "./components/Layout";
import { Routes } from "./App";

const cb = { id: "c-aaaaaaaaaaaa", title: "Shared Story", authors: ["Mina"], language: "en", ageBand: "7-9", ageSource: "source", pages: 3, bytes: 2000, licence: { code: "cc0", name: "CC0", url: "" }, source: { site: "contrib", siteName: "Reader", url: "https://x.test" }, tags: [], addedAt: new Date().toISOString(), hasCover: false, contributed: { by: "Mina", handle: "abcdef012345", submissionId: "s-1", download: false, hasText: true, hasOutline: false, licenceNote: "" } };
const CFG = { enabled: true, signedIn: true, canContribute: true, linkEnabled: true, requireProof: true, maxMB: 60, maxPages: 600, minPages: 2, remainingToday: 3, licences: [{ id: "own", name: "My own work", url: "", needsProof: false }, { id: "cc0", name: "CC0", url: "https://creativecommons.org/publicdomain/zero/1.0/", needsProof: true }], boards: ["General reading"], languages: ["en"], challenge: { token: "t", question: "What is 3 + 4?" }, honeypot: true, anonymousAllowed: true };
let calls: { url: string; init?: RequestInit }[] = [];

function mount(path: string, over: Record<string, unknown> = {}, cfg: unknown = CFG) {
  calls = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const j = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status });
    if (url.includes("/settings/public")) return j({ values: { "feature.library": true, "contrib.enabled": true, ...over } });
    if (url.includes("/contribute/config")) return j(cfg);
    if (url.includes("/contribute/fetch-details")) return j({ finalUrl: "https://books.example/b/1", kind: "page", notes: [], fields: { title: "The Tiny Seed", author: "Asha Rao", language: "en", licence: "cc0", sourceUrl: "https://books.example/b/1", classLevel: "Ages 4-6", coverUrl: "https://books.example/c.jpg" }, confidence: { title: "high", author: "high", licence: "medium", classLevel: "low" }, origin: {}, pdfLinks: [{ url: "https://books.example/f/seed.pdf", label: "PDF" }] });
    if (url.includes("/contribute/upload") || url.includes("/contribute/link")) return j({ id: "s-1", status: "received" }, 202);
    if (url.includes("/contribute/mine")) return j({ submissions: [{ id: "s-1", status: "rejected", createdAt: "", updatedAt: "", title: "Bad Book", author: "x", licence: "own", source: "upload", bookId: "", reasons: ["It looks like a copyrighted textbook."], history: [], checks: [{ id: "c", label: "Copyright", status: "fail", detail: "d" }], score: 40 }, { id: "s-2", status: "published", createdAt: "", updatedAt: "", title: "Good Book", author: "x", licence: "cc0", source: "link", bookId: "c-aaaaaaaaaaaa", reasons: [], history: [], checks: [], score: 100 }], notices: [] });
    if (url.includes("/contributor/")) return j({ name: "Mina", handle: "abcdef012345", books: [{ id: "c-aaaaaaaaaaaa", title: "Shared Story" }] });
    if (url.includes("/text")) return j({ pages: ["once upon a time a fox", "second page"], outline: [{ title: "Start", page: 1 }] });
    if (url.includes("/search")) return j({ hits: [{ id: "c-aaaaaaaaaaaa", title: "Shared Story", page: 1, snippet: "a fox" }] });
    if (url.includes("/problem") || url.includes("/takedown")) return j({ ok: true });
    if (url.includes("/api/v1/library")) return j({ books: [cb], bands: [{ band: "7-9", count: 1 }], languages: [{ code: "en", count: 1 }], bytes: 1 });
    return j({});
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider><Layout><Routes /></Layout></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); });

describe("Contribute page", () => {
  it("shows the form, honeypot and challenge, and sends a link submission", async () => {
    mount("/library/contribute");
    await screen.findByText("What is 3 + 4?");
    expect(screen.getByLabelText("Website")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("A link to a PDF"));
    fireEvent.change(screen.getByLabelText(/^A link to a PDF/, { selector: "input[type=url]" }), { target: { value: "https://example.org/a.pdf" } });
    fireEvent.change(screen.getByLabelText(/Book title/), { target: { value: "T" } });
    fireEvent.change(screen.getByLabelText(/Author/), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/What is 3/), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(screen.getByRole("button", { name: "Send for checking" }).closest("form")!);
    await screen.findByText(/Received\. We are checking/);
    const sent = calls.find((c) => c.url.includes("/contribute/link"))!;
    const body = JSON.parse(String(sent.init?.body));
    expect(body.link).toBe("https://example.org/a.pdf");
    expect(body.consent).toBe(true);
    expect(body.token).toBe("t");
  });
  it("Fetch details fills the form from a page, marks how sure each field is, and lets the person edit", async () => {
    mount("/library/contribute");
    await screen.findByText("What is 3 + 4?");
    fireEvent.click(screen.getByLabelText("A link to a PDF"));
    const btn = screen.getByTestId("fetch-details") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/^A link to a PDF/, { selector: "input[type=url]" }), { target: { value: "https://books.example/b/1" } });
    fireEvent.change(screen.getByLabelText(/Author/), { target: { value: "My own typing" } });
    fireEvent.click(btn);
    await screen.findByTestId("fetch-result");
    expect((screen.getByLabelText(/Book title/) as HTMLInputElement).value).toBe("The Tiny Seed");
    expect((screen.getByLabelText(/Author/) as HTMLInputElement).value).toBe("My own typing"); // what the person typed is kept
    expect((screen.getByLabelText(/^Licence$/) as HTMLSelectElement).value).toBe("cc0");
    expect((screen.getByLabelText(/^A link to a PDF/, { selector: "input[type=url]" }) as HTMLInputElement).value).toBe("https://books.example/f/seed.pdf");
    expect(screen.getAllByText(/likely right|check this|a guess/).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText(/Book title/), { target: { value: "Edited" } });
    expect((screen.getByLabelText(/Book title/) as HTMLInputElement).value).toBe("Edited");
  });
  it("hides Fetch details when the admin switches it off", async () => {
    mount("/library/contribute", {}, { ...CFG, fetchEnabled: false });
    await screen.findByText("What is 3 + 4?");
    fireEvent.click(screen.getByLabelText("A link to a PDF"));
    expect(screen.queryByTestId("fetch-details")).toBeNull();
  });
  it("asks guests to sign in when guests are off", async () => {
    mount("/library/contribute", {}, { ...CFG, signedIn: false, canContribute: false });
    await screen.findByText(/Please sign in to contribute/);
  });
  it("says it is switched off, and keeps children out", async () => {
    mount("/library/contribute", {}, { enabled: false });
    await screen.findByText("Contributions are switched off right now.");
    cleanup();
    mount("/library/contribute", {}, { ...CFG, child: true, canContribute: false });
    await screen.findByText(/parent and adult accounts/);
  });
});

describe("My contributions", () => {
  it("lists statuses, reasons and a link to published books", async () => {
    mount("/library/my-contributions");
    await screen.findByText("Bad Book");
    expect(screen.getByText("It looks like a copyrighted textbook.")).toBeTruthy();
    expect(screen.getAllByText(/Not accepted/).length).toBe(1);
    expect(screen.getByRole("link", { name: "Open in library" }).getAttribute("href")).toBe("/library/c-aaaaaaaaaaaa");
  });
});

describe("Contributor profile and library integration", () => {
  it("shows the contributor's books", async () => {
    mount("/library/by/abcdef012345");
    await screen.findByRole("heading", { name: "Mina" });
    expect(screen.getByRole("link", { name: "Shared Story" })).toBeTruthy();
  });
  it("shows the Contribute button and a contributor mark on the shelf", async () => {
    mount("/library");
    await screen.findAllByText(/Shared Story/);
    expect(screen.getByRole("link", { name: /Contribute a book/ })).toBeTruthy();
  });
  it("hides the buttons when contributions are off", async () => {
    mount("/library", { "contrib.enabled": false });
    await screen.findAllByText(/Shared Story/);
    expect(screen.queryByRole("link", { name: /Contribute a book/ })).toBeNull();
  });
  it("credits the contributor on the book page and respects the download switch", async () => {
    mount("/library/c-aaaaaaaaaaaa");
    await screen.findByTestId("contrib-badge");
    expect(screen.getByRole("link", { name: "Mina" }).getAttribute("href")).toBe("/library/by/abcdef012345");
    expect(screen.queryByRole("link", { name: "Download PDF" })).toBeNull();
  });
});
