import type { BoardCurriculum } from "@studysmart/shared";

/** Public interface of the curriculum module. A Postgres-backed implementation replaces the in-memory one in Module 2. */
export interface CurriculumRepository {
  listBoards(): Promise<{ boardCode: string; boardName: string; academicYear: string }[]>;
  getBoard(boardCode: string): Promise<BoardCurriculum | null>;
}
