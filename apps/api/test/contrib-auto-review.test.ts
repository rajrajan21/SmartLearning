import { expect, it } from "vitest";
import { reviewSubmission, type ReviewInput } from "../src/modules/contrib/review.js";
const pages = ["CC BY 4.0. A bird sat on a tall tree.", "The little bird looked for its nest.", "The wind blew across the green hill."];
const input: ReviewInput = {
  meta: { title: "Bird on a Hill", author: "A Writer", board: "", classLevel: "", subject: "", language: "en", licence: "by", sourceUrl: "", licenceProof: "", attribution: "name" },
  scan: { ok: true, blockers: [], notes: [], names: {}, encrypted: false, bytes: 500, streamsInflated: 0 },
  ex: { engine: true, pages, pageCount: 3, outline: [], info: { title: "", author: "" }, coverJpeg: null },
  terms: { blockedPublishers: [], blockedTitles: [], blockedPhrases: [], adult: [], hate: [], violence: [], spam: [], indic: [], childSexual: [], childTerms: [] },
  values: { "contrib.autoApprove.enabled": true, "contrib.autoApprove.licences": "by" },
  sha256: "fixture", bytes: 500, existing: [],
};
it("auto-approves eligible short books and respects independent source settings", () => {
  const values = { ...input.values, "contrib.autoApprove.links": false };
  expect(reviewSubmission({ ...input, values, source: "upload" }).outcome).toBe("approve");
  expect(reviewSubmission({ ...input, values, source: "link" }).outcome).toBe("review");
  expect(reviewSubmission({ ...input, values: { ...input.values, "contrib.autoApprove.uploads": false }, source: "upload" }).outcome).toBe("review");
});
it("leaves incomplete scans in review and rejects known unsafe structure", () => {
  expect(reviewSubmission({ ...input, ex: { ...input.ex, pageCount: 4 } }).outcome).toBe("review");
  expect(reviewSubmission({ ...input, scan: { ...input.scan, ok: false, blockers: [{ code: "invalid", message: "Invalid PDF" }] } }).outcome).toBe("reject");
});
