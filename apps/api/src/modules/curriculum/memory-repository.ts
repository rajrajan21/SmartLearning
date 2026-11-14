import { BoardCurriculum } from "@studysmart/shared";
import type { CurriculumRepository } from "./repository.js";

/** Development seed. Names only (no textbook text). Real mapping is imported in Module 2. */
const seed: BoardCurriculum[] = [
  BoardCurriculum.parse({
    boardCode: "CBSE",
    boardName: "CBSE",
    academicYear: "2026-27",
    classes: [
      {
        classLevel: 3,
        subjects: [
          {
            id: "cbse-3-maths",
            slug: "maths",
            name: { en: "Mathematics", ta: "கணிதம்" },
            chapters: [
              {
                id: "cbse-3-maths-fractions",
                slug: "fractions",
                position: 1,
                name: { en: "Fractions", ta: "பின்னங்கள்" },
                topics: [{ id: "t-fractions-half", slug: "half-and-quarter", name: { en: "Half and quarter" } }],
              },
            ],
          },
        ],
      },
    ],
  }),
];

export function createMemoryCurriculumRepository(data: BoardCurriculum[] = seed): CurriculumRepository {
  return {
    async listBoards() {
      return data.map(({ boardCode, boardName, academicYear }) => ({ boardCode, boardName, academicYear }));
    },
    async getBoard(code) {
      return data.find((b) => b.boardCode.toLowerCase() === code.toLowerCase()) ?? null;
    },
  };
}
