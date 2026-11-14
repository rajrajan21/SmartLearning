# Architecture (modular monolith, free-tier friendly)

```
Browser (PWA, Tamil/English)            Cloudflare (DNS, CDN, free)
  React 19 + Vite + Tailwind  ───────►  static app + pre-rendered public pages
        │  JSON over HTTPS                audio/media (R2) cached at the edge
        ▼
Caddy (TLS) ─► Node 22 + Express 5 API (TypeScript strict)       [Oracle A1]
                 ├─ identity      (Better Auth, parents, child profiles, consent)
                 ├─ curriculum    (board→…→objective, versions, prerequisites)
                 ├─ content       (lesson blocks, assets, review workflow)
                 ├─ learning      (sessions, progress, bookmarks)
                 ├─ assessment    (questions, quizzes, exams, attempts)
                 ├─ mastery       (evidence, misconceptions, revision schedule)
                 ├─ ai            (gateway, grounding, safety, quotas)
                 ├─ media         (audio/TTS jobs, asset registry)
                 ├─ parent        (dashboards, reports)
                 └─ admin         (CMS, audit, flags)
                 │
                 ├─ PostgreSQL 16 + pgvector   (source of truth, also pg-boss queue)
                 ├─ Object storage adapter     (R2 / Oracle / local disk)
                 └─ Workers (pg-boss): TTS batch, reports, embeddings
```

## Repository layout

```
apps/api        Express 5 API, Drizzle schema + migrations, modules/*
apps/web        Vite React PWA (student, parent, admin routes)
packages/shared zod schemas + TS types shared by api & web (lesson schema lives here)
content/        Authored lesson/question JSON (git-versioned seed, imported into DB)
docs/           This documentation
deploy/         docker-compose, Caddyfile, backup scripts
```

## Module rules

- Each module exposes a `index.ts` public interface; other modules never import its internals or touch its tables directly.
- All input validated with zod at the route boundary; student/parent IDs come from the session, never from the request body.
- Attempt submission, scoring and mastery update run in one DB transaction; submissions carry idempotency keys.
- Content is immutable once published: edits create a new `version`; progress links to the version the student saw.
- Every external dependency (LLM, TTS, email, storage) is an interface with a free default and a swappable alternative.
- No secrets in the frontend, no child free-text in logs.

## Content flow

`author draft (Claude/human) → schema validation → review → approved → published → (audio job) → served as static JSON + audio`

Generated and approved content are distinguishable by `provenance` and `status`.

## Lesson delivery for low bandwidth

The lesson is one compact JSON document per topic version (gzip/brotli, cacheable at the edge). Audio files per sentence are fetched lazily, ahead of the current sentence. The service worker keeps the last lessons offline.

## Auth and roles

Roles: `student`, `parent`, `teacher` (later), `reviewer`, `admin`. Children have no email: a parent creates a child profile (nickname, class, PIN). Parent consent is recorded (purpose, version of text, timestamp) before any AI or analytics feature is enabled for the child.

## Deployment

Docker Compose on Oracle A1 (arm64 images): `caddy`, `api`, `worker`, `postgres`. Static web on Cloudflare Pages. GitHub Actions builds and deploys by SSH. Nightly `pg_dump` to R2 and to the laptop.
