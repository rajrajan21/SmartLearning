import { beforeAll, describe, expect, it } from "vitest";
import { CurriculumImport } from "@studysmart/shared";
import * as schema from "../src/db/schema.js";
import { createPgliteDb } from "../src/db/dev.js";
import { importCurriculum } from "../src/modules/curriculum/importer.js";
import type { CurriculumRepository } from "../src/modules/curriculum/repository.js";
import { authoredFixture, makeRepo, seedFile, shippedSeedFile } from "./helpers.js";

let repo: CurriculumRepository;
let db: Awaited<ReturnType<typeof makeRepo>>["db"];
beforeAll(async () => ({ repo, db } = await makeRepo()));

describe("seed file", () => {
  it("is valid and has the verified chapter counts", () => {
    const d = CurriculumImport.parse(shippedSeedFile());
    const subjects = d.classes.find((c) => c.classLevel === 3)!.subjects;
    expect(subjects.map((s) => [s.slug, s.chapters.length])).toEqual([["maths", 14], ["evs", 12], ["english", 15]]);
    expect(d.verifiedOn).toBeTruthy();
  });
});

describe("importer", () => {
  it("is idempotent", async () => {
    await importCurriculum(db, authoredFixture());
    expect(await db.select().from(schema.chapters)).toHaveLength(60);
    expect(await db.select().from(schema.textbooks)).toHaveLength(5);
    expect(await db.select().from(schema.topics)).toHaveLength(3);
    expect(await db.select().from(schema.objectives)).toHaveLength(2);
    expect(await db.select().from(schema.topicPrerequisites)).toHaveLength(2);
  });
  it("replaces objectives and prerequisites with the file's version", async () => {
    const d = authoredFixture();
    d.classes[0].subjects[0].chapters.find((c: { slug: string }) => c.slug === "toy-joy").topics[0].objectives = [{ text: { en: "Only one now" } }];
    const fresh = await makeRepo(d);
    expect(await fresh.db.select().from(schema.objectives)).toHaveLength(1);
  });
  it("rejects duplicate slugs, bad slugs, missing prerequisites and cycles", async () => {
    const dup = seedFile(); dup.classes[0].subjects[0].chapters[1].slug = dup.classes[0].subjects[0].chapters[0].slug;
    await expect(importCurriculum(db, dup)).rejects.toThrow(/duplicate chapter slug/);
    const badSlug = seedFile(); badSlug.classes[0].subjects[0].chapters[0].slug = "Not Kebab";
    await expect(importCurriculum(db, badSlug)).rejects.toThrow();
    const missing = authoredFixture(); missing.classes[0].subjects[0].chapters[1].topics[1].prerequisites = ["3/maths/toy-joy/ghost"];
    await expect(importCurriculum(db, missing)).rejects.toThrow(/does not exist/);
    const self = authoredFixture(); self.classes[0].subjects[0].chapters[1].topics[0].prerequisites = ["3/maths/toy-joy/counting-toys"];
    await expect(importCurriculum(db, self)).rejects.toThrow(/own prerequisite/);
    const cyc = authoredFixture(); cyc.classes[0].subjects[0].chapters[1].topics[0].prerequisites = ["3/maths/toy-joy/toy-patterns"];
    await expect(importCurriculum(db, cyc)).rejects.toThrow(/cycle/);
  });
  it("failed imports change nothing (transaction)", async () => {
    const fresh = await createPgliteDb();
    const bad = seedFile(); bad.classes[0].subjects[0].chapters[0].slug = "Bad Slug";
    await expect(importCurriculum(fresh, bad)).rejects.toThrow();
    expect(await fresh.select().from(schema.boards)).toHaveLength(0);
  });
});

describe("repository", () => {
  it("lists boards and years", async () => {
    expect(await repo.listBoards()).toEqual([{ boardCode: "CBSE", boardName: "CBSE", academicYear: "2026-27" }]);
    expect(await repo.listYears("cbse")).toEqual([{ academicYear: "2026-27", isCurrent: true }]);
    expect(await repo.listYears("nope")).toEqual([]);
  });
  it("returns the tree in textbook order with Tamil names and topics", async () => {
    const b = await repo.getBoard("cbse");
    const maths = b!.classes[0]!.subjects.find((s) => s.slug === "maths")!;
    expect(maths.name.ta).toBe("கணிதம்");
    expect(maths.chapters.map((c) => c.position)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    expect(maths.chapters.find((c) => c.slug === "toy-joy")!.topics.map((t) => t.slug)).toEqual(["counting-toys", "toy-patterns"]);
  });
  it("topic detail: objectives, prerequisites, unlocks, previous and next", async () => {
    const t = await repo.getTopic("CBSE", 3, "maths", "toy-joy", "toy-patterns");
    expect(t!.prerequisites.map((p) => p.topicSlug)).toEqual(["counting-toys"]);
    expect(t!.unlocks.map((p) => p.topicSlug)).toEqual(["flat-shapes"]);
    expect(t!.previous!.topicSlug).toBe("counting-toys");
    expect(t!.next!.topicSlug).toBe("flat-shapes");
    const first = await repo.getTopic("CBSE", 3, "maths", "toy-joy", "counting-toys");
    expect(first!.objectives).toEqual([{ text: { en: "Count up to 100 objects" }, competencyCode: "C-3.1" }, { text: { en: "Group objects in tens" } }]);
    expect(first!.previous).toBeNull();
    expect(await repo.getTopic("CBSE", 3, "maths", "toy-joy", "ghost")).toBeNull();
  });
  it("search finds English and Tamil, ranks prefix matches first, handles multiple words", async () => {
    expect((await repo.search("CBSE", "toy"))[0]!.name.en).toBe("Toy Joy"); // prefix match before "Counting toys"
    expect((await repo.search("CBSE", "toy")).map((h) => h.kind)).toContain("topic");
    expect((await repo.search("cbse", "கணிதம்")).map((h) => h.kind)).toEqual(["subject", "subject", "subject"]);
    expect((await repo.search("cbse", "house hundreds")).length).toBe(2);
    expect(await repo.search("cbse", "zzzz")).toEqual([]);
    expect(await repo.search("nope", "toy")).toEqual([]);
  });
  it("coverage shows what still needs authoring", async () => {
    const c = await repo.coverage("cbse");
    expect(c!.totals).toMatchObject({ chapters: 60, chaptersWithTopics: 2, topics: 3, topicsWithObjectives: 1, chaptersWithTamil: 0 });
  });
  it("serves the current year, keeps old years, and diffs them", async () => {
    const next = seedFile();
    next.academicYear = "2027-28";
    next.classes[0].subjects[0].textbook.title = "Maths Mela 2";
    next.classes[0].subjects[0].chapters = next.classes[0].subjects[0].chapters.slice(0, 3);
    next.classes[0].subjects[0].chapters.push({ slug: "brand-new", name: { en: "Brand New" } });
    await importCurriculum(db, next);
    expect((await repo.getBoard("cbse"))!.academicYear).toBe("2027-28");
    const old = await repo.getBoard("cbse", "2026-27");
    expect(old!.classes[0]!.subjects.find((s) => s.slug === "evs")!.chapters).toHaveLength(12);
    expect((await repo.listYears("cbse")).map((y) => y.academicYear)).toEqual(["2026-27", "2027-28"]);
    const d = await repo.diff("cbse", "2026-27", "2027-28");
    expect(d!.addedChapters).toEqual([{ classLevel: 3, subjectSlug: "maths", chapter: "Brand New" }]);
    expect(d!.removedChapters).toHaveLength(11);
    expect(d!.textbookChanges).toEqual([{ classLevel: 3, subjectSlug: "maths", from: "Maths Mela", to: "Maths Mela 2" }]);
    expect(await repo.diff("cbse", "2026-27", "1999-00")).toBeNull();
  });
});
