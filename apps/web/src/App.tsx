import { useEffect, useState } from "react";
import { BoardCurriculum } from "@studysmart/shared";

type BoardRow = { boardCode: string; boardName: string; academicYear: string };

export function App() {
  const [boards, setBoards] = useState<BoardRow[]>([]);
  const [board, setBoard] = useState<BoardCurriculum | null>(null);
  const [classLevel, setClassLevel] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/curriculum/boards")
      .then((r) => r.json())
      .then((d: { boards: BoardRow[] }) => setBoards(d.boards))
      .catch(() => setError("Could not load boards. Is the API running?"));
  }, []);

  async function pickBoard(code: string) {
    setClassLevel(null); setSubjectId(null); setChapterId(null);
    if (!code) { setBoard(null); return; }
    const res = await fetch(`/api/v1/curriculum/boards/${encodeURIComponent(code)}`);
    setBoard(BoardCurriculum.parse(await res.json()));
  }

  const cls = board?.classes.find((c) => c.classLevel === classLevel);
  const subject = cls?.subjects.find((s) => s.id === subjectId);
  const chapter = subject?.chapters.find((c) => c.id === chapterId);

  return (
    <>
      <header>
        <h1>StudySmart</h1>
        <p>Understand every chapter. Practise until you master it.</p>
      </header>
      <main>
        {error && <p role="alert">{error}</p>}
        <label htmlFor="board">Board</label>
        <select id="board" onChange={(e) => void pickBoard(e.target.value)} defaultValue="">
          <option value="">Choose board</option>
          {boards.map((b) => <option key={b.boardCode} value={b.boardCode}>{b.boardName} ({b.academicYear})</option>)}
        </select>

        {board && (
          <>
            <label htmlFor="class">Class</label>
            <select id="class" value={classLevel ?? ""} onChange={(e) => { setClassLevel(Number(e.target.value) || null); setSubjectId(null); setChapterId(null); }}>
              <option value="">Choose class</option>
              {board.classes.map((c) => <option key={c.classLevel} value={c.classLevel}>Class {c.classLevel}</option>)}
            </select>
          </>
        )}
        {cls && (
          <>
            <label htmlFor="subject">Subject</label>
            <select id="subject" value={subjectId ?? ""} onChange={(e) => { setSubjectId(e.target.value || null); setChapterId(null); }}>
              <option value="">Choose subject</option>
              {cls.subjects.map((s) => <option key={s.id} value={s.id}>{s.name.en}</option>)}
            </select>
          </>
        )}
        {subject && (
          <>
            <label htmlFor="chapter">Chapter</label>
            <select id="chapter" value={chapterId ?? ""} onChange={(e) => setChapterId(e.target.value || null)}>
              <option value="">Choose chapter</option>
              {subject.chapters.map((c) => <option key={c.id} value={c.id}>{c.position}. {c.name.en}</option>)}
            </select>
          </>
        )}
        {chapter && (
          <section className="card" aria-label="Topics">
            <h2>{chapter.name.en}</h2>
            <ul>{chapter.topics.map((t) => <li key={t.id}>{t.name.en}</li>)}</ul>
            <p>Lessons arrive in Module 3.</p>
          </section>
        )}
      </main>
    </>
  );
}
