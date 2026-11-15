# Module roadmap (one at a time; "done" = built, tested, documented, saved)

| # | Module | Delivers | Exit check |
|---|---|---|---|
| 0 | Product definition | Spec review, free-stack decisions, architecture, data model, lesson schema (these docs) | You approve scope |
| 1 | Foundation | Monorepo, API skeleton, DB schema (curriculum + identity), shared lesson schema, web shell, CI, docker-compose | Typecheck + tests pass; API health + curriculum endpoint run |
| 2 | Curriculum + seed | Import CBSE Class 3 Maths/Science outline (map only), curriculum browse UI (dropdowns), admin import | Student can browse board→class→subject→chapter→topic |
| 3 | Lesson player | Block renderer, progress save, resume, mobile layout, offline cache | One complete topic flows on a phone |
| 4 | Teacher narration (audio) | Malar sentence player, pre-generated audio pipeline, board actions | Teacher speaks a lesson with board drawing |
| 5 | Question bank + practice rounds | 4 rounds, answer feedback contract, why-wrong explanations | Attempts reliable and idempotent |
| 6 | Auth, parent/child, consent | Better Auth, child PIN profiles, consent log | Role and consent tests pass |
| 7 | Mastery + revision | Evidence aggregation, misconceptions, spaced repetition, next-step recommender | Rules unit-tested |
| 8 | AI teacher | Gateway, grounding, hint ladder, teach-back, safety, quotas | Eval set passes accuracy/safety bar |
| 9 | Parent dashboard + reports | Progress, weak concepts, weekly email | Access boundaries tested |
| 10 | Exams, worksheets, games | Timed tests, printable worksheets, challenges | |
| 11 | Admin CMS + review workflow | Authoring UI, versions, approvals | |
| 12 | Pilot + launch | 20–30 students, DPDP review, performance and accessibility audit, sharpstudy.in live | Pilot targets met |
| Later | Video lip-sync teachers, 3D, TN State Board, Matriculation, Classes 8–12 | | |

## Definition of done (per module)

Acceptance criteria written · unit + integration tests pass · migrations verified · security reviewed · responsive on a 360 px phone · docs updated · committed and saved in the project folder · `REQUIREMENTS_STATUS.md` updated honestly.

## Free-tier checks scheduled

Module 4: TTS and R2 limits. Module 6: email provider limits. Module 8: LLM free-tier limits and terms, with Perplexity/ChatGPT cross-check. Module 12: domain, Cloudflare and Oracle limits.
