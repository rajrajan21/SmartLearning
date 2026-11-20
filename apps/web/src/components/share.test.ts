import { describe, expect, it } from "vitest";
import { shareText } from "./ShareLink";
describe("shareText", () => { it("puts the link on its own line", () => { expect(shareText(" Study: ", "Class 6 Maths: Fractions", "https://x/y")).toBe("Study: Class 6 Maths: Fractions\nhttps://x/y"); }); });
