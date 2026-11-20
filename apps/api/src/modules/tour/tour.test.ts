import { describe, expect, it } from "vitest";
import { isSlot, looksRight } from "./routes.js";

describe("tour upload checks", () => {
  it("knows its slots", () => { expect(isSlot("video-en")).toBe(true); expect(isSlot("../x")).toBe(false); expect(isSlot(undefined)).toBe(false); });
  it("accepts an mp4 by its ftyp box", () => {
    const b = Buffer.alloc(2048); b.write("ftypisom", 4);
    expect(looksRight("video-ta", b)).toBe(true);
    expect(looksRight("video-ta", Buffer.alloc(2048))).toBe(false);
  });
  it("accepts a jpeg poster and a vtt file only", () => {
    expect(looksRight("poster-en", Buffer.from([0xff, 0xd8, ...new Array(32).fill(1)]))).toBe(true);
    expect(looksRight("poster-en", Buffer.from("not a picture at all, sorry"))).toBe(false);
    expect(looksRight("vtt-en", Buffer.from("WEBVTT\n\n1\n00:00:00.000 --> 00:00:01.000\nHi\n"))).toBe(true);
    expect(looksRight("vtt-en", Buffer.from("hello"))).toBe(false);
  });
});
