# StudySmart (studysmart.in) – project notes for resuming

**Goal:** free, original, AI-assisted learning site for Indian school students (start CBSE Classes 3–7; TN State Board and Matriculation next). Philosophy: Understand → Explore → Practise → Explain → Master.

**Ground rules (from the owner)**
- ₹0 build. Free sign-ups OK; no paid subscriptions. A one-time cost under ₹500–1000 is allowed only for a key feature (domain).
- Audio teacher first (Malar Teacher voice/board); video/lip-sync later.
- For each feature, look for a free alternative (cross-check with ChatGPT/Perplexity) and record it in docs/01 and docs/free-tier-log.md.
- Build module by module; save to this folder after each module; do not mark done until tested.
- Original content only; no copied textbook text.

**Where things are**
- Project folder: `D:\Smart Learning Website`
- Spec: `Student_Learning_Platform_Master_Product_and_Technical_Specification.docx`
- Docs: `docs/00`–`05`; status: `REQUIREMENTS_STATUS.md`
- Malar Teacher project (separate): `C:\Users\itsme\Documents\Malar Teacher`, clips on `D:\Malar Teacher Clips`
- GitHub repo: `SmartLearning` (owner username to be confirmed; remote not yet connected)

**Run (after Module 1)**
```
corepack enable
pnpm install
pnpm -r typecheck
pnpm -r test
pnpm --filter api dev      # http://localhost:3000/health
pnpm --filter web dev      # http://localhost:5173
```

**Current module:** 1 – Foundation. See docs/05-roadmap.md.


## Status: Module 2 complete (curriculum + settings + web)
- Curriculum API (DB-backed, PGlite for dev/tests), CBSE Class 3 Maths + EVS chapter lists seeded.
- Settings registry + admin page at /admin (see docs/06-settings-and-admin.md).
- Web: notebook design, Tamil/English, search, offline (service worker), settings-driven theme.
- Tests: shared 12, API 29, web 9 (all passing). Next: Module 3 (lesson player).
- Needs review: Tamil UI strings in apps/web/src/lib/i18n.ts by a native speaker.


## Status: Module 3 complete (lesson player)
- Lesson content files + importer + versioning + API; step-by-step player with resume, ticks, 11 admin settings.
- First original lesson: Class 3 Maths > Fun with Shapes > Sides and corners (English + Tamil).
- Tests: shared 12, API 36, web 15 (all passing). Next: Module 4 (Malar narration audio).


## Status: Module 4 complete (teacher voice, English)
- Audio pipeline: Generate-Lesson-Audio.bat -> content/audio (mp3 + manifest + voices.json); API serves clips and adds them to lesson sentences.
- Player: Listen/Pause, speed, word highlight, chalkboard board actions, device-voice fallback (Tamil).
- Tests: shared 12, API 44, web 21. USER TODO: run Start Malar Teacher.bat then Generate-Lesson-Audio.bat to record the first lesson.
- Tamil recordings need a Tamil speech engine (not in Malar yet).

## Status: Module 5 complete (practice rounds, natural single-voice audio)
- Practice: 4 rounds, 5 question types, server-side grading, hints, why-wrong, stars, pass mark, lesson checkpoints (docs/09-practice.md). 12 questions for Sides and corners.
- Audio: one English voice (malar / af_heart, speed 0.92); clips trimmed, levelled, 64 kbps; lesson sentences, question stems, explanations, why-wrong lines and stock praise phrases are all covered by Generate-Lesson-Audio.bat.
- Tests: shared 12, API 61, web 27 (all passing). Next: Module 6 (accounts).

## Status: Module 6 complete (accounts)
- Parent accounts + child profiles, per-child progress sync across devices, delete account, admin switches (docs/10-accounts.md). Migration 0003.
- Tests: shared 13, API 72, web 33 (all passing). Next: Module 7 (mastery and revision).
- Pending: password reset by e-mail needs an e-mail service (none yet); ADMIN_KEY must be set in production.

## Status: Module 7 complete (mastery and revision)
- Mastery levels per topic/chapter, My progress page, chapter badges, spaced daily revision (/revise), home card, sync of revision data (docs/11-mastery.md). No new migration (revision uses student_progress).
- Tests: shared 21, API 74, web 40 (all passing). Next: Module 8 (AI tutor; needs a free-tier model key from the owner).

## Status: Module 8 complete (ask the teacher / AI tutor)
- Safety-screened, lesson-grounded question helper; works with no key; optional OpenAI-compatible model via TUTOR_API_URL/KEY/MODEL (docs/12-ask-teacher.md). Migration 0004 (tutor_usage).
- Tests: shared 21, API 88, web 44 (all passing). Next: Module 9 (parent dashboard).

## Module 9 - Parent dashboard (done)
`/parent` page, `/api/v1/account/dashboard` and `/export`, panel `parent` in settings, docs/13. Tests: shared 24, API 95, web 49. Next: Module 10 (exams, worksheets, games; feature.exams / feature.games are still planned).
