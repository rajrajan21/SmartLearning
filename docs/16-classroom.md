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

## Full-lesson classroom (update)
- `composeClassroom` turns every existing lesson into ONE continuous board (title, story, learn, examples, questions, recap) with voice-over for every step; compose time ≈ 0.5 ms/lesson.
- Teacher portrait (still SVG, mouth/glow while speaking) on the left, big board on the right.
- Voice picker: Malar/Meera (female US/UK), Arun/Kumar (male US/UK), Priya/Ravi (experimental Indian accent). Language: English only, or English + Tamil.
- Audio is generated once offline (`Generate-Lesson-Audio.bat`, optional `--all-voices`) and committed to content/audio; the live server only serves files, no per-lesson generation on Oracle.
- Backlog from the Perplexity handover: teaching state machine, interrupt-and-return, versioned approved packages, per-action accessible descriptions, misconception/teach-back steps, Indic Parler-TTS on Kaggle for Indian English/Tamil.

## Perplexity candidate lessons
content/classroom-candidates/adding-quarters.json: first Perplexity-written lesson (8 scenes, EN+TA, 2 checks). Passes ClassroomLesson schema first try; needs its topic added to the curriculum before it ships to content/classroom.

## Picture-first board (sync19)
No portrait. Board shows pictures (emoji scenes from packages/shared/src/illustrate.ts) for story, learn, examples, think, remember and questions; spoken words appear in a separate subtitle box on the right (setting classroom.showCaptions). Hand-made vector pages (content/classroom) and Perplexity lessons give richer drawings.

## Scene kit (tools/author_classroom_scenes.py)
Code-built friendly illustrations (sky, sun, clouds, hills, sea, rain, curved arrows, label boxes) as vector objects. First scene: The Water Cycle, inserted as the Picture it page of the Saving water lesson. New topics need their scene authored once with the kit (by Claude or from Perplexity JSON); no image files or outside service.

## Whiteboard + more scenes
Default board is now a light picture window (framed, white) (classroom.boardStyle=white; chalk still selectable). Scenes built with the kit: water cycle (saving-water), parts of a plant, healthy plate, reduce-reuse-recycle.

## Sync and timing (sync26)
- Picture timing finds the spoken words themselves in the recording's word list (not just the position), plus a 250 ms lead so a picture lands just after its word.
- Device-voice fallback follows the voice's own word-boundary events instead of a guessed clock, and the step ends when the voice ends.
- The recordings of the next two steps are loaded while the current one plays; pause between steps default 350 ms.
- Worked examples show "Step N" and a short topic line instead of repeating a picture; the question panel sits left of the picture window.
- A "Table of N: ..." sentence now becomes one full page of the table (1 x N ... 10 x N); each line is written as its number is spoken (action option `nth` picks the right occurrence of a repeated number).
- The browser voice for steps without a recording is OFF by default (it was often a man's voice). The subtitle box says when a step has no recording.

## Faster audio generation (Nov 2026)
Cause of slow runs: the speech server made one clip at a time on one engine (about 1.6x the speech length per clip on the laptop) and the build waited for each clip in turn. Now `Malar Teacher/server.mjs` starts `TTS_WORKERS` engines (default 3, `TTS_THREADS` threads each) and the audio build sends `--jobs 3` clips at once, retries a failed clip up to 4 times, and prints `[n/total]` with minutes left. Tune with `set TTS_WORKERS=4` before starting the server and `--jobs 4`. Next step if still too slow: batch generation on a free Kaggle GPU.

### Audio first full run (15 Nov 2026)
846 English clips = 55.0 min of speech made in 45.4 min (0.83x real time, 3.2 s per clip) with 3 engines x 3 jobs, versus about 1.6x before. Tamil lines are skipped (no Tamil voice yet: Kokoro has none; plan is Indic Parler-TTS on Kaggle). NOTE: `content/audio/manifest.json` and `content/audio/files/` are generated on the laptop and must never be overwritten by a source sync; sync tarballs exclude them.
