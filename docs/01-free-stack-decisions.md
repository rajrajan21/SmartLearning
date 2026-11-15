# Zero-cost stack: decision for every capability

Status key: ✅ confirmed free · 🔎 must re-verify current free limits before we depend on it · 💰 optional paid (< ₹1000)

| Need | Primary (free) | Fallback (free) | Notes |
|---|---|---|---|
| Domain `sharpstudy.in` | You already chose it. `.in` is ~₹600–800/yr 💰 | Free subdomain on Cloudflare Pages / `*.pages.dev` until the domain is bought | The only expected spend. |
| Source control + CI | GitHub repo `SmartLearning` + GitHub Actions (free for public repos; 2000 min/month private) ✅ | | |
| Web hosting (static + PWA) | Cloudflare Pages ✅ | Same Oracle server behind Caddy | |
| API + DB hosting | Oracle Always Free Ampere A1 (2 OCPU / 12 GB you already have) ✅ | Local laptop during development | Shares with chennaideals.in; we cap memory (Postgres ~1 GB, API ~512 MB). |
| TLS / reverse proxy | Caddy (auto HTTPS, free) ✅ | Cloudflare proxy | |
| DNS / CDN / DDoS | Cloudflare free ✅ | | |
| Database | PostgreSQL 16 + pgvector in Docker ✅ | Neon / Supabase free (dev only, limited) 🔎 | |
| Queue / jobs | pg-boss on Postgres ✅ | BullMQ + Redis later | |
| File/media storage | Cloudflare R2 free 10 GB ✅ 🔎 | Oracle Object Storage 10 GB; MinIO on Oracle block volume (200 GB free) | Audio ~ 20–40 KB/sentence at 24 kbps Opus. |
| Auth | Better Auth (self-hosted) ✅ | Lucia-style own sessions | Child login = parent-created profile + PIN. |
| Email (parent verification, weekly report) | Brevo free 300/day 🔎 | Resend free tier 🔎, or Gmail SMTP app password for pilot | |
| Error tracking | GlitchTip self-host or Sentry free 🔎 | pino logs + Uptime Kuma | |
| Uptime monitor | Uptime Kuma self-host / UptimeRobot free ✅ | | |
| TTS (teacher voice) | Self-hosted Piper / Kokoro from the Malar Teacher project ✅ | Browser SpeechSynthesis as last resort | Pre-generate and cache per sentence. |
| Speech input | Browser Web Speech API ✅ | Typed answer | Support varies by browser; keep typing always available. |
| LLM for tutor/hints | Gateway tries in order: cached/pre-written answer → free-tier API (Gemini, Groq, OpenRouter free models) 🔎 → self-hosted small model (Ollama on Oracle A1, slow) | Canned hints only | Free-tier limits and terms change often. We check them at the AI module and wrap each in a quota counter. |
| Embeddings (pgvector retrieval) | Local `bge-small`/`multilingual-e5-small` via ONNX on CPU ✅ | Gemini free embeddings 🔎 | Tamil support matters: use multilingual model. |
| Illustrations | Original SVG (Claude-authored), Lottie, Canvas; open-licence assets (OpenMoji, unDraw, SVG Repo with licence check) ✅ | AI-generated images offline on laptop (FLUX schnell) | Record licence per asset. |
| Interactive simulations | Plain JS/React + Canvas, p5.js/Matter.js, GeoGebra embed (free, check terms) 🔎 | | |
| Maps | Static SVG maps of India / world; Leaflet + OSM only when needed ✅ | | |
| Analytics | Self-hosted Umami or Plausible CE ✅ | Postgres event table | Cookieless, child-friendly. |
| Search | PostgreSQL full-text (with Tamil `simple` config) ✅ | | |
| Payments | Not needed (free-first). Future: Razorpay (no setup fee) | | |
| Backups | `pg_dump` nightly → R2 + copy to laptop D: drive ✅ | | Restore drill on schedule. |
| CI/CD | GitHub Actions → SSH deploy to Oracle ✅ | Manual `docker compose pull` | |
| Video/animation (later) | Malar Teacher clips pipeline on Kaggle/Colab free GPU 🔎 | Audio + animated SVG | Deferred by your decision. |

## Rules to keep it free

1. Every external service sits behind an adapter interface (`StorageAdapter`, `EmailAdapter`, `LlmProvider`, `TtsProvider`). Swapping a provider is config, not a rewrite.
2. No feature may need a credit card to run. Sign-ups without a card only.
3. The product must degrade gracefully: no LLM → pre-written content still teaches; no email → parent sees consent codes in-app during pilot.
4. Free-tier numbers marked 🔎 are re-checked (web search / Perplexity cross-check) at the start of the module that depends on them, and recorded with the date in `docs/free-tier-log.md`.

## Capacity sanity check (Oracle 12 GB, 2 OCPU)

Postgres 1 GB + API 0.5 GB + Caddy 0.1 GB + pg-boss worker 0.3 GB + TTS worker (on demand, 1.5 GB, batch only) + chennaideals.in existing load. Comfortable for a pilot of 100s of students because lessons are cached static JSON and audio is static files served from the CDN.
