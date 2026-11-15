# Review of the ChatGPT specification, and what we change

Source: `Student_Learning_Platform_Master_Product_and_Technical_Specification.docx` (v1.0, 14 Nov 2026) plus the two earlier ChatGPT briefs.
Rule for this project: **every feature must have a ₹0 path.** A paid item is allowed only if it is under ₹500–1000 one-time and clearly key (the domain `sharpstudy.in` is the expected one).

## What we keep from the spec (it is good)

- Philosophy: Understand → Explore → Practise → Explain → Master. Not a video library, not a chatbot.
- Curriculum as data: Board → Academic Year → Class → Subject → Textbook → Edition → Chapter → Lesson → Topic → Objective. Nothing hardcoded, no page per chapter.
- Structured, versioned lesson blocks rendered by one lesson engine.
- Mastery from several evidence types (recognition, recall, application, reasoning, teach-back, delayed retention). Never from one quiz.
- Modular monolith, strict TypeScript, content states (draft → review → approved → published → archived), audit logs, parent consent, DPDP review.
- AI grounded in approved content; AI provider replaceable behind a gateway.
- Build module by module, tests before "done".

## What we change, and why

| Spec says | We do | Reason |
|---|---|---|
| Redis + BullMQ | **pg-boss** (queue inside PostgreSQL) first; Redis only if a measured need appears | Server is 2 OCPU / 12 GB shared with chennaideals.in. One fewer service to run, back up and secure. |
| Prisma or Drizzle | **Drizzle ORM** | No native engine binary, so it behaves well on the ARM (Ampere) Oracle server and in Docker. SQL-first suits pgvector. |
| Managed Postgres | **Self-hosted PostgreSQL 16 + pgvector in Docker** on Oracle Always Free | Managed Postgres costs money. Neon/Supabase free tiers are a fallback for dev only (they pause/limit). |
| S3 storage + CDN | **Cloudflare R2 free tier (10 GB, no egress fees) + Cloudflare CDN**; Oracle Object Storage (10 GB free) as second option; local disk in dev | Both are free. Same S3 API, so we can swap. |
| Video HLS, 2D/3D animation, video lessons | **Phase later.** Audio-first: narrated text + SVG/Lottie/Canvas + interactive diagrams. | Your decision: audio now, lip-sync/video later. Also the cheapest on bandwidth. |
| React SPA only | **Vite React PWA for the app, plus pre-rendered public pages** (home, board/class/subject/chapter outline) | A free site lives on Google search traffic; an empty SPA shell ranks badly. Pre-rendering is free. |
| Sentry + OpenTelemetry | **pino structured logs + GlitchTip/Sentry free tier**; OpenTelemetry added only when there is something to trace | Avoid operational weight early. |
| Better Auth | Keep | Open source, self-hosted, free. |
| AI gateway with paid providers | Gateway with **ordered free providers + self-hosted fallback + pre-written content** (see 01) | Platform must work with zero AI calls (your earlier "runs without AI keys" rule). AI is an enhancement. |
| 32 modules at once | **Learning loop first**, mastery second, AI third, parent/teacher later | Spec itself warns about feature overload. |
| Teach-back "oral assessment" with paid speech APIs | Browser Web Speech API (free, on-device on Android/Chrome) for input; self-hosted Piper/Kokoro (from Malar Teacher) for output | ₹0. |

## Things the spec missed that we add

1. **Content-first pipeline.** The platform is only as good as its lessons. Add an authoring workflow where Claude drafts a lesson into the structured schema, a validator checks it, and you (or a teacher friend) approve it. Content volume is the real bottleneck, not code.
2. **Offline-first PWA** (service worker + IndexedDB) for slow Chennai mobile data; progress syncs later.
3. **Tamil + English from day one in the data model** (`translations` per block, `term_keep_english` flag for academic terms). Colloquial-Tamil teacher style from the Malar project is a content style, stored as a `teacher_style` variant.
4. **Malar Teacher player as a block type** (`teacher_narration`): a script split into sentences, each with a pre-generated audio file (cached forever), board actions (write/draw/point), and checkpoint questions. Audio now; lip-sync video clips plug into the same sentence IDs later.
5. **Pre-generated audio, not live TTS.** Each approved sentence → audio once → stored → reused by all students. Zero per-student cost, instant response.
6. **Cost guard.** Quotas per learner per day, global daily AI budget (free-tier request counters), automatic fallback to canned hints.
7. **Content provenance field** on every block: `original | ai_drafted_human_reviewed | licensed | govt_open`. Needed for the copyright risk the spec flags.
8. **Question bank deduplication + difficulty calibration** from real attempt data (item difficulty, discrimination) instead of guessing.
9. **Student login without email** for children (parent creates a child profile with a nickname + PIN under the parent's account). Minimises child data (DPDP).
10. **Printable worksheets via HTML→print CSS** (free) instead of a PDF service.
11. **Public lesson sharing / WhatsApp-friendly links**: free growth channel in India.
12. **Low-end Android budget**: first load under ~150 KB JS for the home route, fonts self-hosted, images AVIF/WebP, Tamil font subset.

## Copyright position (important)

NCERT/State Board textbooks are not ours to republish. The platform stores **our own original explanations, examples and questions mapped to the official chapter/topic/learning objective**, never copied textbook text or images. Government PDFs may be used by us as *reference to map the syllabus*, not as published content. Your Malar Teacher note about downloading textbooks is fine for private mapping only. A lawyer/teacher check before public launch is on the roadmap.
