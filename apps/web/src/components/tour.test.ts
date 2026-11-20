import { describe, expect, it } from "vitest";
import { parseChapters } from "./TourPlayer";

describe("tour chapters", () => {
  it("reads time=name pairs", () => { expect(parseChapters("0:00=Welcome; 1:05 = Practice")).toEqual([{ t: 0, title: "Welcome" }, { t: 65, title: "Practice" }]); });
  it("skips junk", () => { expect(parseChapters("hello;;5=x")).toEqual([]); });
});
