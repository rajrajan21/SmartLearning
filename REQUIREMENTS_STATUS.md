# Requirements status (updated 14 Nov 2026)

Legend: ⬜ not started · 🟨 designed / in progress · ✅ built and tested

| Area | Status | Notes |
|---|---|---|
| Spec review + free-stack decisions | ✅ | docs/00, 01 |
| Architecture, data model, lesson schema, roadmap | ✅ (docs) | docs/02–05 |
| Monorepo + API skeleton + DB schema (curriculum, identity) | ✅ | Module 1: typecheck + 6 API tests pass; first migration generated (not yet applied to a live DB) |
| Shared lesson schema (zod) | ✅ | Module 1: 4 tests |
| Web shell (Vite React, mobile-first) | ✅ | Module 1: board→class→subject→chapter dropdowns on sample data; 83 KB gzip JS |
| Curriculum import + browse | ⬜ | Module 2 |
| Lesson player | ⬜ | Module 3 |
| Malar Teacher audio narration | ⬜ | Module 4 (reuses Malar Teacher project voice) |
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
