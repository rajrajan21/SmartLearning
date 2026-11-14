# Lessons (Module 3)

## Authoring
Write one JSON file per topic in `content/lessons/` (see `cbse-3-maths-fun-with-shapes-sides-and-corners.json`). It names the topic by path (board, classLevel, subject, chapter, topic) and holds `lesson: { status, title, blocks }`. The topic must exist in `content/curriculum/*.json` first.
Block types: story, explanation, worked_example (steps with optional "why"), image/diagram (alt text required), teacher_narration (text now, audio in Module 4), quiz (questions arrive in Module 5), teach_back, summary. Every block carries `provenance` (original / ai_drafted_reviewed / licensed / govt_open). Tamil (`ta`) is optional per text; English is shown when Tamil is missing.
Check files without a database: `pnpm --filter @studysmart/api curriculum:check`.

## Publishing and versions
`seed` (and dev start) imports lessons idempotently: unchanged content adds nothing, changed content adds the next version. Only the newest `published` version is served; `draft`/`review` are never public. (Approval workflow arrives with the CMS in Module 11.)

## API
- `GET /api/v1/lessons/boards/:board/:class/:subject/:chapter/:topic` -> lesson, 404 if none published.
- `GET /api/v1/lessons/available` -> `{ topicIds }` (used for "Lesson" badges).
Maintenance mode and the cache-time setting apply to lessons too.

## Player (web)
Route `/:board/:class/:subject/:chapter/:topic/learn`. One step per block (or a single scrolling page), progress bar, arrow keys, worked examples revealing one step at a time, "explain it yourself" box (answer stays on the device), finish screen with next topic. Progress is saved per device in the browser (resume, start over, ticks on the chapter list); accounts in Module 6 will sync it. Works offline for lessons already opened (service worker data cache).

## Admin settings (panel "Lessons")
Mode (steps/scroll), progress bar, arrow keys, save progress, ticks, example step-by-step, show "why", teacher text, explain-it-yourself, celebration, finish message; plus `feature.lessons` to hide everything.

## Known gaps (tracked)
Practice questions (quiz blocks show a "coming soon" note) -> Module 5. Voice and board drawing -> Module 4. Only one Class 3 lesson authored so far; more content is authored topic by topic. Tamil wording to be reviewed by a native speaker.
