import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, cleanup, act } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { SettingsProvider } from "./lib/settings";
import { Site } from "./App";
import { Reader } from "./components/reader/Reader";
import { resetBooksCache, readerHref, type Book } from "./lib/reader/books";
import type { PdfBook } from "./lib/reader/pdf";
import { groupSentences, itemsToRuns, pageSentences, type PdfTextItem, type Run } from "./lib/reader/sentences";
import { bookReadLang, hasVoiceFor, pickVoice, preferredLang, voiceLabel, voiceRank, voicesFor, type VoiceLike } from "./lib/reader/voices";
import { positionOf, stepTarget, visiblePages } from "./lib/reader/spread";
import { UI } from "./lib/i18n";

// ---------------------------------------------------------------- sentences
/** an A5 page like the test book: 420 x 595 points, y axis flipped by the viewport */
const VT = [1, 0, 0, -1, 0, 595], W = 420, H = 595;
const item = (str: string, x: number, y: number, size = 12, width = str.length * size * 0.5, hasEOL = false): PdfTextItem => ({ str, transform: [size, 0, 0, size, x, y], width, height: size, hasEOL });

describe("reader: grouping page text into sentences", () => {
  it("places text items on the page as fractions, top-left origin", () => {
    const [r] = itemsToRuns([item("Hello", 42, 500, 10, 30)], VT, W, H);
    expect(r!.x).toBeCloseTo(0.1, 3);
    expect(r!.w).toBeCloseTo(30 / 420, 4);
    expect(r!.y).toBeGreaterThan((595 - 500 - 10) / 595 - 0.005); // the box starts a little above the baseline height
    expect(r!.y).toBeLessThan((595 - 500) / 595);
    expect(r!.y + r!.h).toBeGreaterThan((595 - 500) / 595); // and reaches below the baseline for g, y, p
    expect(itemsToRuns([{ str: "x", transform: [1, 2], width: 1, height: 1 } as PdfTextItem], VT, W, H)).toEqual([]);
    expect(itemsToRuns([item("x", 1, 1)], VT, 0, 0)).toEqual([]);
  });
  it("splits a paragraph into sentences that carry their own boxes, across line breaks", () => {
    const s = pageSentences([
      item("Each crate holds exactly ten mangoes. Meenu fills one crate,", 44, 480, 12, 330, true),
      item("then another. Three mangoes are left over.", 44, 462, 12, 230, true),
    ], VT, W, H);
    expect(s.map((x) => x.t)).toEqual(["Each crate holds exactly ten mangoes.", "Meenu fills one crate, then another.", "Three mangoes are left over."]);
    expect(s[0]!.r).toHaveLength(1);
    expect(s[1]!.r).toHaveLength(2); // the sentence runs over two lines: two boxes
    expect(s[2]!.r).toHaveLength(1);
    const [first, second] = s[1]!.r;
    expect(first![0]).toBeGreaterThan(s[0]!.r[0]![0] + s[0]!.r[0]![2] - 0.03); // starts where the first sentence ends
    expect(second![1]).toBeGreaterThan(first![1]); // second box is on the lower line
    expect(second![0]).toBeCloseTo(s[0]!.r[0]![0], 2); // and starts at the left margin
    for (const x of s) for (const b of x.r) { expect(b[0]).toBeGreaterThanOrEqual(0); expect(b[0] + b[2]).toBeLessThanOrEqual(1.0001); expect(b[1] + b[3]).toBeLessThanOrEqual(1.0001); }
  });
  it("keeps a heading apart from the paragraph under it, and joins pieces on one line", () => {
    const s = pageSentences([
      item("Counting in tens", 44, 525, 20, 150, true),
      item("Meenu sells ", 44, 480, 12, 66), item("mangoes", 110, 480, 12, 48), item(" at the market.", 158, 480, 12, 80, true),
    ], VT, W, H);
    expect(s.map((x) => x.t)).toEqual(["Counting in tens", "Meenu sells mangoes at the market."]);
    expect(s[1]!.r).toHaveLength(1);
  });
  it("does not stop at abbreviations, initials, decimals or web addresses, and keeps closing quotes", () => {
    const text = (str: string) => groupSentences([{ str, x: 0.1, y: 0.2, w: 0.8, h: 0.02 }]).map((x) => x.t);
    expect(text("Mr. Ravi buys 3.5 kg of mangoes for Rs. 120. Is that a fair price?")).toEqual(["Mr. Ravi buys 3.5 kg of mangoes for Rs. 120.", "Is that a fair price?"]);
    expect(text("Dr. A. P. J. Abdul Kalam was a scientist. He loved children!")).toEqual(["Dr. A. P. J. Abdul Kalam was a scientist.", "He loved children!"]);
    expect(text("Visit www.ncert.nic.in today. Bye.")).toEqual(["Visit www.ncert.nic.in today.", "Bye."]);
    expect(text("She said, “Come here.” Then she smiled.")).toEqual(["She said, “Come here.”", "Then she smiled."]);
    expect(text("What?! Really... yes.")).toEqual(["What?!", "Really... yes."]);
    expect(text("यह एक वाक्य है। यह दूसरा है।")).toEqual(["यह एक वाक्य है।", "यह दूसरा है।"]);
    expect(text("இது ஒரு வாக்கியம். இது இரண்டாவது.")).toEqual(["இது ஒரு வாக்கியம்.", "இது இரண்டாவது."]);
  });
  it("joins a word broken by a hyphen at the line end, drops page numbers and symbol-only text", () => {
    const runs: Run[] = [
      { str: "This is a num-", x: 0.1, y: 0.2, w: 0.3, h: 0.02, eol: true },
      { str: "ber line.", x: 0.1, y: 0.23, w: 0.2, h: 0.02, eol: true },
      { str: "* * *", x: 0.4, y: 0.6, w: 0.1, h: 0.02, eol: true },
      { str: "17", x: 0.5, y: 0.95, w: 0.03, h: 0.015 },
    ];
    expect(groupSentences(runs).map((x) => x.t)).toEqual(["This is a number line."]);
  });
  it("cuts a very long sentence at a comma so the voice never gets one huge piece", () => {
    const long = `${Array.from({ length: 30 }, (_, i) => `word${i} and more words here`).join(", ")}.`;
    const out = groupSentences([{ str: long, x: 0.05, y: 0.1, w: 0.9, h: 0.02 }], { maxChars: 120 });
    expect(out.length).toBeGreaterThan(3);
    for (const x of out) expect(x.t.length).toBeLessThanOrEqual(121);
    expect(out.map((x) => x.t).join(" ")).toBe(long);
  });
  it("gives an empty list for a scanned page (no text items at all)", () => {
    expect(pageSentences([], VT, W, H)).toEqual([]);
    expect(pageSentences([item("   ", 10, 10)], VT, W, H)).toEqual([]);
  });
  it("still speaks sideways text but gives it no highlight box", () => {
    const s = pageSentences([{ str: "Sideways label.", transform: [0, 12, -12, 0, 30, 100], width: 80, height: 12 }], VT, W, H);
    expect(s).toEqual([{ t: "Sideways label.", r: [] }]);
  });
});

// ---------------------------------------------------------------- voices
const V = (name: string, lang: string): VoiceLike => ({ name, lang });
describe("reader: choosing the voice", () => {
  const all = [V("Hans", "de-DE"), V("Sam", "en-US"), V("Emma", "en-GB"), V("Heera", "en-IN"), V("Valluvar", "ta-IN"), V("Kala", "ta-LK")];
  it("English prefers en-IN, then en-GB, then any English", () => {
    expect(pickVoice(all, "en-IN")!.name).toBe("Heera");
    expect(pickVoice(all.filter((v) => v.lang !== "en-IN"), "en-IN")!.name).toBe("Emma");
    expect(pickVoice([V("Hans", "de-DE"), V("Sam", "en-US"), V("Kylie", "en-AU")], "en-IN")!.name).toBe("Kylie"); // any English, by name
    expect(voicesFor(all, "en-IN").map((v) => v.name)).toEqual(["Heera", "Emma", "Sam"]);
    expect(voicesFor([V("B", "en_GB"), V("A", "en_in")], "en-IN").map((v) => v.name)).toEqual(["A", "B"]); // Android writes en_IN
  });
  it("the admin's preferred accent comes first, then the usual order", () => {
    expect(voicesFor(all, "en-US").map((v) => v.name)).toEqual(["Sam", "Heera", "Emma"]);
    expect(preferredLang("en", "en-GB")).toBe("en-GB");
    expect(preferredLang("en", "ta-IN")).toBe("en-IN"); // a Tamil setting never turns English reading into Tamil
    expect(preferredLang("en", undefined)).toBe("en-IN");
    expect(preferredLang("ta", "en-GB")).toBe("ta-IN");
  });
  it("Tamil prefers ta-IN, then any Tamil, and never falls back to another language", () => {
    expect(pickVoice(all, "ta-IN")!.name).toBe("Valluvar");
    expect(pickVoice(all.filter((v) => v.lang !== "ta-IN"), "ta-IN")!.name).toBe("Kala");
    expect(pickVoice(all.filter((v) => !v.lang.startsWith("ta")), "ta-IN")).toBeNull();
    expect(voiceRank(V("Heera", "en-IN"), "ta-IN")).toBe(Infinity);
    expect(hasVoiceFor(all, "ta")).toBe(true);
    expect(hasVoiceFor(all.filter((v) => !v.lang.startsWith("ta")), "ta")).toBe(false);
  });
  it("with no voices installed nothing is chosen (and nothing is invented)", () => {
    expect(pickVoice([], "en-IN")).toBeNull();
    expect(pickVoice([], "ta-IN")).toBeNull();
    expect(voicesFor([], "en-IN")).toEqual([]);
    expect(pickVoice([V("Hans", "de-DE")], "en-IN")).toBeNull();
  });
  it("keeps the reader's own earlier choice while the device still has it", () => {
    expect(pickVoice(all, "en-IN", "Sam")!.name).toBe("Sam");
    expect(pickVoice(all, "en-IN", "Gone Voice")!.name).toBe("Heera");
    expect(pickVoice(all, "ta-IN", "Sam")!.name).toBe("Valluvar"); // a saved English voice is not used for Tamil
  });
  it("knows a Tamil book and labels voices plainly", () => {
    expect(bookReadLang("Tamil", "Maths")).toBe("ta");
    expect(bookReadLang("English", "Tamil")).toBe("ta");
    expect(bookReadLang("தமிழ்", null)).toBe("ta");
    expect(bookReadLang("English", "Maths")).toBe("en");
    expect(bookReadLang("Hindi", "Hindi")).toBe("en");
    expect(voiceLabel(V("Microsoft Heera - English (India)", "en_in"))).toBe("Heera - English (India) (en-IN)");
  });
});

describe("reader: which pages are on screen", () => {
  it("covers stand alone, the rest come in pairs", () => {
    expect(visiblePages(1, 8, false)).toEqual([1]);
    expect(visiblePages(2, 8, false)).toEqual([2, 3]);
    expect(visiblePages(3, 8, false)).toEqual([2, 3]);
    expect(visiblePages(8, 8, false)).toEqual([8]);
    expect(visiblePages(7, 7, false)).toEqual([6, 7]);
    expect(visiblePages(5, 8, true)).toEqual([5]);
    expect([stepTarget(1, 1, 8, false), stepTarget(3, 1, 8, false), stepTarget(7, 1, 8, false), stepTarget(8, 1, 8, false)]).toEqual([2, 4, 8, 8]);
    expect([stepTarget(8, -1, 8, false), stepTarget(4, -1, 8, false), stepTarget(2, -1, 8, false), stepTarget(1, -1, 8, false)]).toEqual([6, 2, 1, 1]);
    expect([stepTarget(1, -1, 8, true), stepTarget(8, 1, 8, true), stepTarget(4, 1, 8, true)]).toEqual([1, 8, 5]);
    expect([positionOf(1, 8, false), positionOf(4, 8, false), positionOf(8, 8, false), positionOf(7, 7, false)]).toEqual(["front", "inside", "back", "inside"]);
  });
});

// ---------------------------------------------------------------- pages
const tree = {
  boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27",
  classes: [{ classLevel: 3, subjects: [
    { id: "s1", slug: "maths", name: { en: "Mathematics" }, chapters: [{ id: "c1", slug: "shapes", position: 1, name: { en: "Shapes" }, topics: [{ id: "t1", slug: "sides", name: { en: "Sides" } }] }] },
    { id: "s2", slug: "evs", name: { en: "EVS" }, chapters: [] },
  ] }],
};
const BOOKS: Book[] = [
  { id: "3/maths.pdf", classLevel: 3, subject: "Maths", title: "Maths Mela", language: "English", file: "maths.pdf", bytes: 5_000_000, pages: 120, url: "/api/books/file/3/maths.pdf" },
  { id: "3/tamil.pdf", classLevel: 3, subject: "Tamil", title: "Tamil Reader", language: "Tamil", file: "tamil.pdf", bytes: 900_000, pages: 40, url: "/api/books/file/3/tamil.pdf" },
  { id: "4/evs/", classLevel: 4, subject: "EVS", title: "Our World", language: "English", file: "evs", bytes: 2000, pages: null, url: null, chapters: [{ file: "ch1.pdf", bytes: 1000, url: "/api/books/file/4/evs/ch1.pdf" }, { file: "ch2.pdf", bytes: 1000, url: "/api/books/file/4/evs/ch2.pdf" }] },
];
let asked: string[] = [];
function mount(path: string, settings: Record<string, unknown> = {}, books: Book[] | number = BOOKS) {
  asked = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    asked.push(String(url));
    if (url.includes("/settings/public")) return new Response(JSON.stringify({ values: settings }), { status: 200 });
    if (url.toLowerCase().includes("/curriculum/boards/cbse")) return new Response(JSON.stringify(tree), { status: 200 });
    if (url === "/api/books") return typeof books === "number" ? new Response("{}", { status: books }) : new Response(JSON.stringify({ books, classes: [] }), { status: 200 });
    return new Response("{}", { status: 404 });
  }));
  const { hook } = memoryLocation({ path, static: false });
  return render(<Router hook={hook}><SettingsProvider override={settings as never}><Site /></SettingsProvider></Router>);
}
beforeEach(() => { cleanup(); localStorage.clear(); resetBooksCache(); });
afterEach(() => { vi.unstubAllGlobals(); });

describe("class page: the Textbooks entry", () => {
  it("is the last entry after the subjects and opens that class's shelf", async () => {
    mount("/cbse/3");
    const entry = await screen.findByTestId("textbook-entry");
    expect(entry.getAttribute("href")).toBe("/books?class=3");
    expect(entry.textContent).toContain("Textbooks");
    expect(entry.textContent).toContain("See the textbook");
    const tiles = [...document.querySelectorAll(".notebooks > li")];
    expect(tiles).toHaveLength(3); // two subjects, then the textbooks tile
    expect(tiles[tiles.length - 1]!.contains(entry)).toBe(true);
  });
  it("speaks Tamil when the site is in Tamil", async () => {
    localStorage.setItem("ss_lang", "ta");
    mount("/cbse/3");
    const entry = await screen.findByTestId("textbook-entry");
    expect(entry.textContent).toContain(UI.textbooks.ta);
    expect(entry.textContent).toContain(UI.seeTextbook.ta);
  });
  it("is hidden, and the server is not even asked, when the feature is switched off", async () => {
    mount("/cbse/3", { "feature.textbooks": false });
    await screen.findByText("Mathematics");
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByTestId("textbook-entry")).toBeNull();
    expect(asked).not.toContain("/api/books");
  });
  it("is hidden when no book of this class was downloaded, or the list cannot be read", async () => {
    mount("/cbse/3", {}, BOOKS.filter((b) => b.classLevel !== 3));
    await screen.findByText("Mathematics");
    await waitFor(() => expect(asked).toContain("/api/books"));
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByTestId("textbook-entry")).toBeNull();
    cleanup(); resetBooksCache();
    mount("/cbse/3", {}, 404);
    await screen.findByText("Mathematics");
    await waitFor(() => expect(asked).toContain("/api/books"));
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByTestId("textbook-entry")).toBeNull();
    cleanup(); resetBooksCache();
    mount("/cbse/3", {}, []);
    await screen.findByText("Mathematics");
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByTestId("textbook-entry")).toBeNull();
  });
});

describe("textbook shelf", () => {
  it("lists the class's books as covers that open the reader", async () => {
    mount("/books?class=3");
    await screen.findAllByText("Maths Mela");
    const links = [...document.querySelectorAll<HTMLAnchorElement>(".bk-link")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/books/3/maths.pdf", "/books/3/tamil.pdf"]);
    expect(screen.getByText(/120 pages/).textContent).toContain("4.8 MB");
    expect(screen.queryByText("Our World")).toBeNull(); // class 4 is not open and not asked for
    expect(readerHref(BOOKS[2]!)).toBe("/books/4/evs/ch1.pdf");
  });
  it("says so when there is nothing, and is not there at all when switched off", async () => {
    mount("/books?class=3", {}, []);
    await screen.findByText(UI.booksNone.en);
    cleanup(); resetBooksCache();
    mount("/books", { "feature.textbooks": false });
    await screen.findByText(UI.notFound.en);
  });
});

// ---------------------------------------------------------------- the reader itself (with a made-up book instead of pdf.js)
function fakeBook(pages = 8, textless: number[] = []): PdfBook {
  return {
    numPages: pages, ratio: 0.75,
    image: async (n) => `blob:page-${n}`, ready: (n) => `blob:page-${n}`, thumb: async (n) => `blob:thumb-${n}`,
    text: async (n) => (textless.includes(n) ? [] : [{ t: `First sentence of page ${n}.`, r: [[0.1, 0.1, 0.5, 0.03]] }, { t: `Second sentence of page ${n}.`, r: [[0.1, 0.15, 0.5, 0.03]] }]),
    textReady: () => null, destroy: () => { /* nothing */ },
  };
}
const BOOK = { id: "3/maths.pdf", title: "Maths Mela", subtitle: "Maths, Class 3", url: "/api/books/file/3/maths.pdf", fileName: "maths.pdf", language: "English", subject: "Maths", backHref: "/books?class=3" };
interface Said { text: string; lang: string; voice: string | null; rate: number }
function fakeSpeech(voices: VoiceLike[]) {
  const said: Said[] = [];
  let current: { onend?: () => void } | null = null;
  const synth = { speaking: false, pending: false, getVoices: () => voices, cancel: () => { current = null; synth.speaking = false; }, addEventListener: () => { /* */ }, removeEventListener: () => { /* */ },
    speak: (u: { text: string; lang: string; voice: VoiceLike | null; rate: number; onend?: () => void }) => { said.push({ text: u.text, lang: u.lang, voice: u.voice?.name ?? null, rate: u.rate }); current = u; synth.speaking = true; } };
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", function (this: { text: string; lang: string; voice: null; rate: number }, text: string) { this.text = text; this.lang = ""; this.voice = null; this.rate = 1; });
  return { said, finish: () => { const u = current; current = null; synth.speaking = false; u?.onend?.(); } };
}
function mountReader(settings: Record<string, unknown> = {}, book = BOOK, pdf = fakeBook()) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ values: settings }), { status: 200 })));
  const open = async () => pdf;
  const { hook } = memoryLocation({ path: "/books/3/maths.pdf", static: false });
  return render(<Router hook={hook}><SettingsProvider override={settings as never}><Reader book={book} open={open} /></SettingsProvider></Router>);
}
const counter = () => document.querySelector("[data-r=counter]")!.textContent;
const click = (sel: string) => fireEvent.click(document.querySelector(sel)!);

describe("book reader", () => {
  beforeEach(() => { Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true }); });

  it("opens in style C by default, on the cover, and turns to the first spread", async () => {
    mountReader();
    await waitFor(() => expect(counter()).toBe("Front cover, page 1 of 8"));
    expect(document.querySelector(".rd-wrap")!.className).toContain("rd-c");
    expect(document.querySelector(".rd-reader")!.getAttribute("data-pos")).toBe("front");
    expect(document.querySelector(".rd-pg.rd-r img")!.getAttribute("src")).toBe("blob:page-1");
    expect(document.querySelector(".rd-pg.rd-l")!.className).toContain("rd-empty");
    expect((document.querySelector("[data-act=prev]") as HTMLButtonElement).disabled).toBe(true);
    click(".rd-open");
    expect(counter()).toBe("Pages 2–3 of 8");
    expect(document.querySelector(".rd-pg.rd-l img")!.getAttribute("src")).toBe("blob:page-2");
    expect(document.querySelector(".rd-pg.rd-r img")!.getAttribute("src")).toBe("blob:page-3");
    fireEvent.keyDown(document, { key: "End" });
    expect(counter()).toBe("Back cover, page 8 of 8");
    expect((document.querySelector(".rd-bnext") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(counter()).toBe("Pages 6–7 of 8");
  });
  it("goes to a typed page, refuses a page that does not exist, and remembers the last page for this book", async () => {
    const first = mountReader();
    await waitFor(() => expect(counter()).toBe("Front cover, page 1 of 8"));
    const input = document.querySelector("[data-r=gotoInput]") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.submit(document.querySelector("[data-r=goto]")!);
    expect(counter()).toBe("Pages 4–5 of 8");
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.submit(document.querySelector("[data-r=goto]")!);
    expect(counter()).toBe("Pages 4–5 of 8");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(localStorage.getItem("ss_reader_page_3/maths.pdf")).toBe("5");
    first.unmount();
    mountReader();
    await waitFor(() => expect(counter()).toBe("Pages 4–5 of 8"));
    fireEvent.change(document.querySelector("[data-r=slider]")!, { target: { value: "2" } });
    expect(counter()).toBe("Pages 2–3 of 8");
  });
  it("shows one page at a time on a phone", async () => {
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    mountReader();
    await waitFor(() => expect(counter()).toBe("Page 1 of 8"));
    click(".rd-bnext");
    expect(counter()).toBe("Page 2 of 8");
    expect(document.querySelector(".rd-book")!.className).toContain("rd-single");
  });
  it("uses the admin's style, lets the reader switch between all three and remembers it; no switch when that is turned off", async () => {
    const a = mountReader({ "reader.style": "a" });
    await waitFor(() => expect(counter()).toContain("page 1"));
    expect(document.querySelector(".rd-wrap")!.className).toContain("rd-a");
    const pick = document.querySelector("[data-r=style]") as HTMLSelectElement;
    expect([...pick.options].map((o) => o.textContent)).toEqual(["A Hardcover", "B Digital", "C Library"]);
    fireEvent.change(pick, { target: { value: "b" } });
    expect(document.querySelector(".rd-wrap")!.className).toContain("rd-b");
    expect(document.querySelector("[data-r=thumbs]")!.querySelectorAll("button")).toHaveLength(8);
    expect(localStorage.getItem("ss_reader_style")).toBe("b");
    a.unmount();
    mountReader({ "reader.style": "a", "reader.allowStylePicker": false });
    await waitFor(() => expect(counter()).toContain("page 1"));
    expect(document.querySelector(".rd-wrap")!.className).toContain("rd-a"); // the remembered choice no longer applies
    expect(document.querySelector("[data-r=style]")).toBeNull();
  });
  it("offers the real PDF to download and both print choices; the buttons follow the settings", async () => {
    const a = mountReader({ "reader.style": "a" });
    await waitFor(() => expect(counter()).toContain("page 1"));
    const dl = document.querySelector("[data-r=download]") as HTMLAnchorElement;
    expect(dl.getAttribute("href")).toBe("/api/books/file/3/maths.pdf?download=1");
    expect(dl.getAttribute("download")).toBe("maths.pdf");
    click("[data-act=print]");
    expect(screen.getByRole("dialog").textContent).toContain(UI.rdPrintTitle.en);
    expect(document.querySelector("[data-act=print-spread]")).not.toBeNull();
    expect(document.querySelector("[data-act=print-book]")!.textContent).toContain("All 8 pages");
    const print = vi.fn(); vi.stubGlobal("print", print);
    click("[data-act=print-book]");
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(document.querySelector("iframe.rd-bookframe")!.getAttribute("src")).toMatch(/^\/api\/books\/file\/3\/maths\.pdf\?print=/));
    expect(print).not.toHaveBeenCalled(); // the whole book prints from the PDF frame, not from this page
    expect(document.querySelector("body > .rd-print-area")!.querySelectorAll("img")).toHaveLength(1);
    a.unmount();
    mountReader({ "reader.showDownload": false, "reader.showPrint": false, "reader.readAloud": false });
    await waitFor(() => expect(counter()).toContain("page 1"));
    expect(document.querySelector("[data-r=download]")).toBeNull();
    expect(document.querySelector("[data-act=print]")).toBeNull();
    expect(document.querySelector("[data-r=ttsPanel]")).toBeNull();
  });
  it("reads aloud sentence by sentence with the en-IN voice, highlights on the page and turns the page by itself", async () => {
    const sp = fakeSpeech([V("Sam", "en-US"), V("Heera", "en-IN"), V("Emma", "en-GB")]);
    mountReader();
    await waitFor(() => expect(counter()).toContain("page 1"));
    click(".rd-open");
    await waitFor(() => expect(document.querySelectorAll(".rd-sent")).toHaveLength(4));
    expect((document.querySelector("[data-r=voice]") as HTMLSelectElement).value).toBe("Heera");
    expect([...(document.querySelector("[data-r=voice]") as HTMLSelectElement).options].map((o) => o.value)).toEqual(["Heera", "Emma", "Sam"]);
    click("[data-act=play]");
    expect(sp.said).toEqual([{ text: "First sentence of page 2.", lang: "en-IN", voice: "Heera", rate: 0.9 }]);
    expect(document.querySelector(".rd-reader")!.getAttribute("data-tts")).toBe("playing");
    expect(document.querySelector("[data-r=ttsStatus]")!.textContent).toBe("Reading sentence 1 of 4");
    expect(document.querySelectorAll(".rd-pg.rd-l .rd-hl i")).toHaveLength(1);
    expect(document.querySelectorAll(".rd-pg.rd-r .rd-hl i")).toHaveLength(0);
    expect(document.querySelector(".rd-sent.rd-on")!.textContent).toContain("First sentence of page 2.");
    act(() => sp.finish()); act(() => sp.finish());
    expect(sp.said[2]!.text).toBe("First sentence of page 3.");
    expect(document.querySelectorAll(".rd-pg.rd-r .rd-hl i")).toHaveLength(1);
    click("[data-act=play]"); // pause
    expect(document.querySelector(".rd-reader")!.getAttribute("data-tts")).toBe("paused");
    click("[data-act=play]"); // resume the same sentence
    expect(sp.said[3]!.text).toBe("First sentence of page 3.");
    act(() => sp.finish()); act(() => sp.finish()); // end of the spread: the page turns and reading goes on
    await waitFor(() => expect(sp.said[5]?.text).toBe("First sentence of page 4."));
    expect(counter()).toBe("Pages 4–5 of 8");
    click("[data-act=stop]");
    expect(document.querySelector(".rd-reader")!.getAttribute("data-tts")).toBe("idle");
    expect(document.querySelectorAll(".rd-hl i")).toHaveLength(0);
  });
  it("starts at the admin's speed and remembers the reader's own voice", async () => {
    localStorage.setItem("ss_reader_voice_en", "Emma");
    const sp = fakeSpeech([V("Heera", "en-IN"), V("Emma", "en-GB")]);
    mountReader({ "reader.defaultSpeed": 1.2, "reader.autoTurn": false });
    await waitFor(() => expect(document.querySelectorAll(".rd-sent").length).toBeGreaterThan(0));
    expect((document.querySelector("[data-r=autoturn]") as HTMLInputElement).checked).toBe(false);
    click("[data-act=play]");
    expect(sp.said[0]).toMatchObject({ voice: "Emma", lang: "en-GB", rate: 1.2 });
    fireEvent.change(document.querySelector("[data-r=voice]")!, { target: { value: "Heera" } });
    expect(localStorage.getItem("ss_reader_voice_en")).toBe("Heera");
    await waitFor(() => expect(sp.said[sp.said.length - 1]!.voice).toBe("Heera"));
  });
  it("says so when a page has no readable text (a scanned page)", async () => {
    fakeSpeech([V("Heera", "en-IN")]);
    mountReader({}, BOOK, fakeBook(8, [1, 2, 3]));
    await waitFor(() => expect(document.querySelector("[data-r=ttsStatus]")!.textContent).toBe(UI.rdNoText.en));
    expect(document.querySelector("[data-r=transcript]")!.textContent).toBe(UI.rdNoTextLong.en);
  });
  it("a Tamil book asks for a Tamil voice; with none installed it explains how to get one and never pretends", async () => {
    const sp = fakeSpeech([V("Heera", "en-IN"), V("Sam", "en-US")]);
    mountReader({}, { ...BOOK, id: "3/tamil.pdf", language: "Tamil", subject: "Tamil" });
    await waitFor(() => expect(counter()).toContain("page 1"));
    expect((document.querySelector("[data-r=readLang]") as HTMLSelectElement).value).toBe("ta");
    const voice = document.querySelector("[data-r=voice]") as HTMLSelectElement;
    expect([...voice.options].map((o) => o.textContent)).toEqual([UI.rdNoTaVoice.en]); // no English voice is passed off as Tamil
    const help = document.querySelector("[data-r=tamilHelp]")!;
    expect(help.textContent).toContain("Android: Settings > Text-to-speech > Google > install Tamil voice data");
    expect(help.textContent).toContain("Windows 11: Settings > Time & language > Speech > Add voices > Tamil");
    expect(help.textContent).toContain("Settings > Accessibility > Spoken Content > Voices > Tamil");
    expect(help.textContent).toContain("Chrome and Edge also list online voices");
    click("[data-act=testvoice]");
    expect(sp.said[0]).toMatchObject({ lang: "ta-IN", voice: null });
    expect(document.querySelector(".rd-testmsg")!.textContent).toBe(UI.rdTestNoTa.en);
    // the reader may still choose English for this book, and that is remembered
    fireEvent.change(document.querySelector("[data-r=readLang]")!, { target: { value: "en" } });
    expect(document.querySelector("[data-r=tamilHelp]")).toBeNull();
    expect((document.querySelector("[data-r=voice]") as HTMLSelectElement).value).toBe("Heera");
    expect(localStorage.getItem("ss_reader_lang_3/tamil.pdf")).toBe("en");
  });
  it("uses the Tamil voice when the device has one, and the help box can be switched off", async () => {
    const sp = fakeSpeech([V("Heera", "en-IN"), V("Valluvar", "ta-IN")]);
    const a = mountReader({}, { ...BOOK, id: "3/tamil.pdf", language: "Tamil", subject: "Tamil" });
    await waitFor(() => expect(document.querySelectorAll(".rd-sent").length).toBeGreaterThan(0));
    expect(document.querySelector("[data-r=tamilHelp]")).toBeNull();
    expect((document.querySelector("[data-r=voice]") as HTMLSelectElement).value).toBe("Valluvar");
    click("[data-act=play]");
    expect(sp.said[0]).toMatchObject({ lang: "ta-IN", voice: "Valluvar" });
    a.unmount();
    fakeSpeech([V("Heera", "en-IN")]);
    mountReader({ "reader.tamilVoiceHelp": false }, { ...BOOK, id: "3/tamil.pdf", language: "Tamil", subject: "Tamil" });
    await waitFor(() => expect(counter()).toContain("page 1"));
    expect(document.querySelector("[data-r=tamilHelp]")).toBeNull();
    expect((document.querySelector("[data-r=voice]") as HTMLSelectElement).options[0]!.textContent).toBe(UI.rdNoTaVoice.en);
  });
  it("has Tamil interface text", async () => {
    localStorage.setItem("ss_lang", "ta");
    mountReader();
    await waitFor(() => expect(counter()).toBe("முன் அட்டை, பக்கம் 1 / 8"));
    expect(document.querySelector(".rd-open")!.textContent).toBe(UI.rdOpen.ta);
    expect(document.querySelector("[data-r=ttsPanel] summary")!.textContent).toBe(UI.rdAloud.ta);
  });
  it("every reader string exists in English and Tamil", () => {
    for (const [k, v] of Object.entries(UI)) if (/^(rd[A-Z]|books|textbooks|seeTextbook)/.test(k)) { expect(v.en.trim(), k).not.toBe(""); expect(v.ta.trim(), k).not.toBe(""); }
  });
});
