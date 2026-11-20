import type { BoardCurriculum, CoverageReport, SearchHit, TopicDetail, YearDiff } from "@studysmart/shared";

/** Public interface of the curriculum module. Other modules depend on this, never on its tables. */
export interface CurriculumRepository {
  listBoards(): Promise<{ boardCode: string; boardName: string; academicYear: string }[]>;
  listYears(boardCode: string): Promise<{ academicYear: string; isCurrent: boolean }[]>;
  /** year omitted = the current academic year */
  getBoard(boardCode: string, year?: string): Promise<BoardCurriculum | null>;
  getTopic(boardCode: string, classLevel: number, subject: string, chapter: string, topic: string): Promise<TopicDetail | null>;
  search(boardCode: string, query: string, limit?: number): Promise<SearchHit[]>;
  diff(boardCode: string, from: string, to: string): Promise<YearDiff | null>;
  coverage(boardCode: string, year?: string): Promise<CoverageReport | null>;
  /** forget the in-memory copy (called after content is loaded; optional so test doubles need not provide it) */
  invalidate?(): void;
}
