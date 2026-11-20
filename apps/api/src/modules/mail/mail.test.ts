import { describe, expect, it } from "vitest";
import { addrOf, bodyOf, buildMessage, oneLine, subjectOf } from "./smtp.js";
import { isDue, readSmtp, weeklyBody } from "./weekly.js";
import { backupDue } from "./timers.js";

describe("smtp helpers", () => {
  it("strips line breaks from headers", () => { expect(oneLine("a\r\nBcc: x")).toBe("a Bcc: x"); });
  it("dot-stuffs the body", () => { expect(bodyOf("hi\n.x")).toBe("hi\r\n..x"); });
  it("encodes non-ascii subjects", () => { expect(subjectOf("வார")).toMatch(/^=\?UTF-8\?B\?/); expect(subjectOf("Plain")).toBe("Plain"); });
  it("finds the address", () => { expect(addrOf("Sharp <a@b.in>")).toBe("a@b.in"); expect(addrOf("a@b.in")).toBe("a@b.in"); });
  it("builds a message with base64 body", () => {
    const m = buildMessage({ host: "h", port: 465, user: "", pass: "", from: "A <a@b.in>", secure: "ssl" }, { to: "p@q.in", subject: "S", text: "hello" });
    expect(m).toContain("To: p@q.in"); expect(m).toContain(Buffer.from("hello").toString("base64"));
  });
});
describe("weekly e-mail", () => {
  it("writes each child line", () => {
    const b = weeklyBody([{ nickname: "Mala", lang: "en", answered: 10, correct: 8, days: 3 }, { nickname: "Ravi", lang: "en", answered: 0, correct: 0, days: 0 }], "SharpStudy", "en");
    expect(b.text).toContain("Mala: studied on 3 days; 8 of 10 questions right (80%)"); expect(b.text).toContain("Ravi: no practice");
  });
  it("is due once on the chosen day after the hour", () => {
    const d = new Date(2026, 10, 15, 19, 0); // Sunday
    expect(isDue(d, 0, 18, null)).toBe(true);
    expect(isDue(d, 0, 20, null)).toBe(false);
    expect(isDue(d, 1, 18, null)).toBe(false);
    expect(isDue(d, 0, 18, d.toISOString().slice(0, 10))).toBe(false);
  });
  it("needs a server and a from address", () => {
    expect(readSmtp({})).toBeNull();
    expect(readSmtp({ "mail.smtp.host": "smtp.x.com", "mail.smtp.from": "a@b.in", "mail.smtp.port": 587, "mail.smtp.secure": "starttls", "mail.smtp.user": "u", "mail.smtp.pass": "p" })).toMatchObject({ port: 587, secure: "starttls", user: "u" });
  });
  it("backup runs once a day after its hour", () => {
    const n = new Date(2026, 10, 16, 4, 0);
    expect(backupDue(n, 3, null)).toBe(true); expect(backupDue(n, 5, null)).toBe(false); expect(backupDue(n, 3, n.toISOString().slice(0, 10))).toBe(false);
  });
});
