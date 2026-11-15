# Requirements status (updated 14 Nov 2026)

Legend: ⬜ not started · 🟨 designed / in progress · ✅ built and tested

| Area | Status | Notes |
|---|---|---|
| Spec review + free-stack decisions | ✅ | docs/00, 01 |
| Architecture, data model, lesson schema, roadmap | ✅ (docs) | docs/02–05 |
| Monorepo + API skeleton + DB schema (curriculum, identity) | 🟨 | Module 1 |
| Shared lesson schema (zod) | 🟨 | Module 1 |
| Web shell (Vite React, mobile-first) | 🟨 | Module 1 |
| Curriculum import + browse | ⬜ | Module 2 |
| Lesson player | ⬜ | Module 3 |
| Malar Teacher audio narration | ✅ English | Modules 4-5 (one English voice; Tamil needs another engine) |
| Question bank, 4 practice rounds | ⬜ | Module 5 |
| Auth, parent/child, consent | ⬜ | Module 6 |
| Mastery, revision | ⬜ | Module 7 |
| AI teacher | ⬜ | Module 8 |
| Parent dashboard | ⬜ | Module 9 |
| Exams, worksheets, games | ⬜ | Module 10 |
| Admin CMS | ⬜ | Module 11 |
| Pilot, DPDP review, launch on studysmart.in | ⬜ | Module 12 |
| Video / lip-sync teachers, 3D | ⬜ | Deferred by decision |

## Only you can do

- Confirm GitHub account/username and give this PC access to push to the `SmartLearning` repo (see PROJECT_NOTES.md).
- Own/register `studysmart.in` (~₹600–800/yr, only expected spend) and point DNS to Cloudflare (free).
- Free sign-ups when their module starts: Cloudflare, (later) Brevo, an LLM free-tier key.
- Subject-teacher review of lessons before public release.
- Parent/student pilot recruitment.


## Module 2 (done)
- [x] Curriculum model, import format, importer, API
- [x] Browse UI (class > subject > chapter > topic), search, breadcrumbs, print view
- [x] Tamil/English toggle (UI strings need native review)
- [x] Offline/PWA basics (service worker, manifest)
- [x] Admin settings page, registry-driven, with audit log, presets, backup
- [ ] Topics/objectives content authoring for Class 3 (Module 3 onward)


## Module 3 (done)
- [x] Block renderer for all lesson block types, mobile-first layout
- [x] Progress save + resume (device only until Module 6), ticks on chapter lists
- [x] Offline for opened lessons (service worker)
- [x] Lesson import, versions, published-only serving, admin settings
- [x] Practice questions (Module 5), voice (Modules 4-5)
- [ ] More lessons and questions (ongoing authoring)


## Module 4 (done, English)
- [x] Pre-generated audio pipeline using our own Malar engine (no keys, no cost)
- [x] Sentence player with speed, highlight, board drawing in step with speech
- [x] Device-voice fallback for Tamil
- [ ] YOU: run the two .bat files once to record the first lesson's audio
- [ ] Tamil / Hindi recordings (needs a Tamil engine), lip-sync video, offline audio cache

## Module 5 (done)
Practice rounds with 5 question types, server grading, hints, stars, checkpoints in lessons, question/feedback audio, polished audio build. Pending: run Generate-Lesson-Audio.bat to record the new clips; Tamil wording review.

## Module 6 (done)
Parent accounts, child profiles, progress sync, consent, account deletion, admin controls. Pending: password reset (needs e-mail), parent dashboard (Module 9).

## Module 7 (done)
Mastery levels, My progress, daily spaced revision, admin controls. Parent-facing views come in Module 9.

## Module 8 (done)
Question helper with safety screening, daily limits, lesson-only answers, optional free-tier model. Owner action: choose and set the three TUTOR_* variables when ready. Content gap: add more hints to practice questions.

- Module 9 Parent dashboard: DONE (weekly goal, streak, accuracy, activity chart, chapter mastery, tricky questions, print, CSV, data export; all switchable).
- Module 10 Tests, worksheets, games: DONE (timed chapter test with review, printable worksheet with parent-only key, Quick Fire and Three Lives; all switchable).
- Module 11: privacy/terms/about pages DONE; deployment pack DONE (needs owner to run it); password help without e-mail DONE (admin tool); Class 3 maths content: 5 topics of ~30 (English; Tamil text and audio pending).
- Still open: Tamil review, more content (rest of Class 3, Classes 4-7, TN boards), real e-mail password reset (needs a free mail service), audio generation run by owner, legal read of privacy text.
- Content: 10 Class 3 topics now (5 maths, 5 EVS), English; Tamil text, chapter-fit check and audio pending.
- Content: 13 Class 3 topics (8 maths, 5 EVS).

- Classroom board lessons (animated, voiced, 3D shapes, pause-for-answer): BUILT (4 review samples). Needs Generate-Lesson-Audio.bat for the teacher voice; Tamil narration later.
