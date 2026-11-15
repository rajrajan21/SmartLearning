# Module 12: Classroom board lessons

An animated lesson where Malar Teacher talks while the board draws, writes and turns 3D shapes step by step. There is **no video**: each lesson is a small JSON file, and the site plays it. Everything is drawn by the site itself (no 3D library, no outside website, no AI service).

## What a student sees
- Open **Classroom** from the home page (or "Watch in the classroom" on a topic page).
- Press **Start the lesson**. The teacher speaks; the board follows her words. Controls: Pause/Play, Replay this step, Back, Next, Restart, Speed, Voice on/off. Space plays or pauses; arrow keys change step.
- 3D shapes turn by themselves and can be dragged to turn.
- A **quick question** pauses the lesson. A wrong answer explains why; the right answer is explained, then the lesson continues.

## How sync works
The board is a pure function of "which step, how many milliseconds in" (`sceneAt` in `packages/shared/src/classroom.ts`). The clock is the **audio position** when a recording plays, so drawing, writing and highlighting can never drift from the voice. An action can start `on` a phrase ("on": "one quarter"), found in the recording's word times, or at a fraction (`at`) of the narration. Pause, seek, replay and going back always show the right picture.

Without a recording the lesson still plays on an estimated clock, and (setting `classroom.browserVoice`) with the browser's own voice. Recorded Malar Teacher audio is always used first.

## Lesson file (`content/classroom/<board>-<class>-<subject>-<chapter>-<topic>.json`)
- `objects`: things on a 900x500 board, each with an `id`: `circle line arrow rect sector poly path text clock solid`. Colours are names (`ink accent warm good soft water earth sun`) or `#rrggbb`; names change with the board style.
- `solid` shapes: `cube cuboid cylinder cone sphere pyramid`.
- `steps`: `{ id, narration: {en}, actions: [...], check? }`.
- actions (`do`): `draw show hide write fill pulse time mark spin clear`. `write` reveals text letter by letter; `time` moves a clock's hands (hour, minute); `mark` shows a cube's `faces`, `edges` or `corners`; `pulse` highlights (a clock needs `part: hour|minute`).
- `check`: a question that pauses the lesson (exactly one correct option; each wrong option needs `whyWrong`).
- Validation rejects unknown targets, a phrase not in the narration, writing on non-text, etc. (`pnpm --filter @studysmart/api test`).
- Authoring: edit `tools/author_classroom.py` and run `python tools/author_classroom.py`.

## Voice
Narration, questions, explanations and why-wrong lines are included in `Generate-Lesson-Audio.bat` (it now reads `content/classroom`). Keep narration to about three short sentences; write numbers as words. Without recordings, turn on the browser voice setting or just read the captions.

## Admin settings (panel "Classroom boards")
`feature.classroom`, `classroom.autoAdvance`, `classroom.stepPauseMs`, `classroom.speed`, `classroom.showCaptions`, `classroom.show3d` (off = flat front view), `classroom.boardStyle` (chalk|white), `classroom.browserVoice`.

## API
`GET /api/v1/classroom/index`, `GET /api/v1/classroom/:board/:class/:subject/:chapter/:topic` (404 when the feature is off).

## Four review samples (Class 3)
Halves and quarters; How water travels in a plant; Solid shapes you can hold (3D cube faces/edges/corners, cylinder, cone, sphere); Reading the clock.

## Later
Tamil narration + Tamil voice; more lessons per chapter; teacher-written steps from the existing lesson blocks; mid-lesson "ask the teacher".
