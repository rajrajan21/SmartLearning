import { describe, expect, it } from "vitest";
import { DEFAULT_TERMS, detectLanguage, dice, hamming, isbnValid, luhn, maskPii, scanContent, scanCopyright, scanPii, simhash, verhoeff } from "../src/modules/contrib/detectors.js";

/** Builds a valid Aadhaar-style number (Verhoeff check digit) for tests, so no real number is ever written down. */
function withVerhoeff(base: string) { for (let d = 0; d < 10; d++) if (verhoeff(base + d)) return base + d; throw new Error("none"); }

describe("check digits", () => {
  it("Verhoeff accepts a valid number and rejects a one-digit slip", () => {
    const ok = withVerhoeff("23456789012");
    expect(verhoeff(ok)).toBe(true);
    const bad = ok.slice(0, 5) + String((Number(ok[5]) + 1) % 10) + ok.slice(6);
    expect(verhoeff(bad)).toBe(false);
    expect(verhoeff("12ab")).toBe(false);
  });
  it("Luhn accepts the published test card and rejects a changed digit", () => {
    expect(luhn("4111111111111111")).toBe(true);
    expect(luhn("4111111111111112")).toBe(false);
    expect(luhn("12345")).toBe(false);
  });
  it("ISBN-13 and ISBN-10 validate", () => {
    expect(isbnValid("978-0-306-40615-7")).toBe(true);
    expect(isbnValid("0-306-40615-2")).toBe(true);
    expect(isbnValid("978-0-306-40615-8")).toBe(false);
  });
});

describe("personal data scan", () => {
  const aadhaar = withVerhoeff("23456789012");
  const page = [
    `Name: Ravi. Aadhaar ${aadhaar.slice(0, 4)} ${aadhaar.slice(4, 8)} ${aadhaar.slice(8)}. PAN ABCPE1234F. Mobile 9876543210, mail ravi.kumar@example.com.`,
    "Card number 4111 1111 1111 1111 expires 12/30. UPI ravi@okaxis. A/c No: 123456789012 IFSC SBIN0001234. DOB: 12/05/2010",
    "Passport No. K1234567 issued at Chennai. Password: hunter2hunter2",
    "Just a story about a fox and 12 apples and ISBN 978-0-306-40615-7.",
  ];
  const r = scanPii(page);
  it("finds each kind with the right count and page", () => {
    expect(r.counts.aadhaar).toBe(1);
    expect(r.counts.pan).toBe(1);
    expect(r.counts.phone).toBe(1);
    expect(r.counts.email).toBe(1);
    expect(r.counts.card).toBe(1);
    expect(r.counts.upi).toBe(1);
    expect(r.counts.bank).toBe(1);
    expect(r.counts.ifsc).toBe(1);
    expect(r.counts.dob).toBe(1);
    expect(r.counts.passport).toBe(1);
    expect(r.counts.secret).toBe(1);
    expect(r.pages.aadhaar).toEqual([1]);
    expect(r.pages.card).toEqual([2]);
    expect(r.counts.card).toBe(1); // the ISBN on page 4 is not a card
  });
  it("never keeps a detected value, only masked samples", () => {
    const blob = JSON.stringify(r);
    for (const v of [aadhaar, "ABCPE1234F", "9876543210", "ravi.kumar", "4111111111111111", "4111 1111", "K1234567", "hunter2", "123456789012"]) expect(blob).not.toContain(v);
    expect(r.samples.aadhaar![0]).toMatch(/^X+\d{4}$/);
  });
  it("does not flag an ordinary number, a random 12 digits, or a year", () => {
    const s = scanPii(["The population was 123456789012 in 2024. Call 100 for the police. Roll 5 of 12.", "ISBN 9780306406157 and 4111 1111 1111 1112"]);
    expect(s.counts.aadhaar ?? 0).toBe(0);
    expect(s.counts.card ?? 0).toBe(0);
  });
  it("spots a mark sheet and a medical record by their form labels", () => {
    const s = scanPii(["Student Name: A. Roll No: 12. Father's Name: B. Marks obtained 80. Total marks 100", "Patient name: X Diagnosis: fever Prescription: rest Lab report attached"]);
    expect(s.counts.idcard).toBe(1);
    expect(s.counts.medical).toBe(1);
    expect(scanPii(["Student Name: A. Roll No: 12. Father's Name: B."], { marksheets: false }).counts.idcard).toBeUndefined();
  });
  it("masks values for an admin preview", () => {
    const m = maskPii(page[0]!);
    expect(m).not.toContain(aadhaar.slice(0, 4));
    expect(m).not.toContain("9876543210");
    expect(m).not.toContain("example.com");
    expect(m).toContain("[hidden]");
  });
});

describe("copyright scan", () => {
  it("finds notices, ISBNs, publishers, licences and textbook markers", () => {
    const pages = ["© 2020 Oxford University Press. All rights reserved. ISBN 978-0-306-40615-7. No part of this publication may be reproduced.", "NCERT textbook for class 6", "This work is licensed under https://creativecommons.org/licenses/by-sa/4.0/ ."];
    const r = scanCopyright(pages, "Maths", DEFAULT_TERMS);
    expect(r.copyrightNotice && r.allRightsReserved).toBe(true);
    expect(r.isbnCount).toBe(1);
    expect(r.publisherHits).toContain("oxford university press");
    expect(r.phraseHits.length).toBeGreaterThan(0);
    expect(r.textbookMarkers.length).toBeGreaterThan(0);
    expect(r.detectedLicences).toContain("by-sa");
  });
  it("detects CC0, public domain and Gutenberg, and not 'not public domain'", () => {
    expect(scanCopyright(["Released under CC0"], "t", DEFAULT_TERMS).detectedLicences).toContain("cc0");
    expect(scanCopyright(["This book is in the public domain."], "t", DEFAULT_TERMS).detectedLicences).toContain("pd");
    expect(scanCopyright(["This is not public domain."], "t", DEFAULT_TERMS).detectedLicences).not.toContain("pd");
    expect(scanCopyright(["Project Gutenberg eBook"], "t", DEFAULT_TERMS).detectedLicences).toContain("pd");
  });
  it("uses the admin's blocked titles", () => {
    const t = { ...DEFAULT_TERMS, blockedTitles: ["secret diary"] };
    expect(scanCopyright(["hello"], "My Secret Diary", t).titleHits).toEqual(["secret diary"]);
  });
});

describe("content scan", () => {
  it("scores a spam page and passes a normal story", () => {
    const spam = Array(5).fill("Click here to earn money. Join telegram t.me/x. Buy now http://a.com http://b.com http://c.com http://d.com http://e.com http://f.com").join(" ");
    expect(scanContent([spam], DEFAULT_TERMS, 6).score).toBeGreaterThanOrEqual(25);
    expect(scanContent(["The little fox went to the river and drank water. ".repeat(30)], DEFAULT_TERMS, 6).score).toBe(0);
  });
  it("applies the hard child-safety rule only when both kinds of term share a page", () => {
    expect(scanContent(["an underage schoolgirl and pornographic pictures"], DEFAULT_TERMS, 6).childSafety).toBe(true);
    expect(scanContent(["a schoolgirl at school", "pornographic site warning"], DEFAULT_TERMS, 6).childSafety).toBe(false);
  });
  it("catches transliterated Hindi and Tamil terms from the editable list", () => {
    expect(scanContent(["you are a chutiya and a thevidiya"], DEFAULT_TERMS, 6).categories.indic).toBe(2);
  });
});

describe("language and similarity", () => {
  it("detects scripts", () => {
    expect(detectLanguage("இது ஒரு தமிழ் புத்தகம்").code).toBe("ta");
    expect(detectLanguage("यह एक हिंदी किताब है").code).toBe("hi");
    expect(detectLanguage("This is an English book").code).toBe("en");
  });
  it("simhash is close for a lightly edited text and far for a different one", () => {
    const words = (n: number, seed: number) => { let x = seed * 2654435761 % 4294967296; return Array.from({ length: n }, () => { x = (x * 1664525 + 1013904223) % 4294967296; return `w${x % 400}x`; }).join(" "); };
    const a = words(6000, 1), b = a.replace(/w7x/, "other"), c = words(6000, 5);
    expect(hamming(simhash(a), simhash(b))).toBeLessThanOrEqual(6);
    expect(hamming(simhash(a), simhash(c))).toBeGreaterThan(14);
    expect(simhash("too short")).toBe("");
  });
  it("dice similarity tolerates small title changes", () => {
    expect(dice("Wonders of the Sky", "wonders of the  sky!")).toBeGreaterThan(0.95);
    expect(dice("Wonders of the Sky", "Cooking at home")).toBeLessThan(0.4);
  });
});
