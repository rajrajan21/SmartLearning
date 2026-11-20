# Batch jobs, manual jobs and what each change impacts

Keep this file current. **Before changing any job, script, setting or content format, read the "Impact matrix" (section 3) and update every job it lists.** All `.bat` files live in the main folder `D:\Smart Learning Website` (owner rule). Each writes a `*-report.txt` beside it; read the report when a job fails.

## 1. Windows batch jobs (run by the owner by double-click)
| Job | What it does | Runs | Inputs | Outputs | Depends on / breaks if |
|---|---|---|---|---|---|
| `Start-StudySmart-Local.bat` | Installs packages if missing, builds web, starts API+site locally (http://localhost:3000 or as printed) | on demand | whole repo, `content/` | running site | `pnpm install`, `apps/api/src/server.ts`, `apps/web` build, `server-paths.ts` env names |
| `Start-Malar-Teacher.bat` (and `-v2`) | Starts the Kokoro HeadTTS speech server (port 8080) from `Malar Teacher\`, `TTS_DEVICE=cpu` | before audio jobs | `Malar Teacher\server.mjs` | `/api/speak`, `/api/health` | Node, model files; the Malar Teacher folder cannot be mounted by Claude's shell |
| `Generate-Lesson-Audio.bat` | Step 1: `audio:build --jobs JOBS --voices VOICES` (Kokoro voices); Step 2: starts `tools\tamil-voice-trial\serve.py` (Parler, port 8090), waits for health, then `audio:build --jobs 1 --voices TAMILVOICES` | overnight, on demand | `content/lessons`, `content/questions`, `content/classroom`, `content/audio/voices.json`, `phrases.json`, servers 8080/8090 | `content/audio/files/*.mp3`, `manifest.json`, `generate-audio-report.txt`, `parler-server-log.txt` | any change to lesson/question/classroom **text** (re-generates changed sentences only); `voices.json` voice ids; `serve.py` voice names (`parler:woman`, `parler:man`, `parler:woman-ta`, `parler:man-ta`); `MAX_CHARS` sentence length limit in `build.ts`; manifest `LANGS` |
| `Download-Tamil-Voice-Model.bat` | One-time 4 GB Indic Parler-TTS download (needs a Hugging Face READ token typed by the owner; not saved) | once | HF token | `tools\tamil-voice-trial\model\` | token validity |
| `Try-Indian-Voices.bat` | Records one chapter (`CHAPTER=`) in several voices for comparison | trial | voices.json | `try-voices-report.txt`, audio | voice ids |
| `Try-Tamil-Teacher-Voice.bat` | Installs the Parler engine in `venv` and records 3 test lines | trial/one-time | python | `try-tamil-voice-report.txt` | python, `tools/tamil-voice-trial/trial.py` |
| `Build-Lessons.bat` | `lessons:build` – compiles recipes in `content/recipes` into `content/classroom` classroom scenes | after editing recipes | `content/recipes`, `apps/api/src/tools/lessonkit/rules.ts` | `content/classroom/*.json`, `build-lessons-report.txt` | recipe format, rule book, `packages/shared/src/classroom.ts` & `composeClassroom.ts` |
| `Download-Books.bat` | Downloads NCERT PDFs (classes 3–7) to `content/books/pdf/class-N` | once / when books change | `tools/download_books.py` | zips/PDFs | NCERT URLs |
| `Organize-Books.bat` (+ `-fixed`, `-v3` older variants) | Joins NCERT zip files into one PDF per book | after download | `tools/organize_books.py` | PDFs, `organize-books-report.txt` | file naming of downloads |
| `Add-Tamil-Books.bat` | `books:tamil` adds Tamil textbooks to the reader | after Tamil PDFs added | `apps/api/src/tools/add-tamil-books.mjs` | books index | |
| `Build-Book-Pages.bat` | `books:pages` makes page images for the reader (long; resumable) | after books added | `content/books` | page images, `build-book-pages-report.txt` | `build-book-pages.mjs` |
| `Backup-Now.bat` / `Backup-Now-Quiet.bat` | `pnpm backup` → accounts, progress, lessons zip in `backups\` | on demand / daily | `apps/api/src/tools/backup.mjs`, BACKUP_DIR, BACKUP_KEEP | `backups/*.zip` | DB/path changes |
| `Schedule-Backup.bat` | Windows scheduled task "SharpStudy Daily Backup" 3:00 AM running `Backup-Now-Quiet.bat` | once | | scheduled task | name/path of the quiet bat |
| `Publish-To-GitHub.bat` | Pushes the repo to `https://github.com/rajrajan21/SmartLearning.git` | owner only | git | `publish-github-report.txt` | **AI must not run it** |

## 2. Server-side jobs (Oracle, when deployed; scripts in `deploy/`)
| Job | What | Notes |
|---|---|---|
| `deploy/setup-server.sh` | One-time install of Node, pnpm, PostgreSQL, DB, systemd | prints DB password |
| `deploy/update.sh` | git pull, pnpm install, web build, `db:migrate`, `db:seed`, restart service, health check | run after each publish; **new content files need `db:seed`** (curriculum import) |
| `deploy/backup.sh` | `pg_dump` to `/var/backups/studysmart`, keeps 14 days | cron by owner |
| `studysmart.service`, `Caddyfile`, `studysmart.env.example` | systemd unit, reverse proxy, env (ADMIN_KEY, ADMIN_USER_ID, DATABASE_URL, PORT, WEB_DIR, TUTOR_API_*, ACCESS_COOKIE_SECRET) | |
| In-process timer (`modules/mail/timers.ts`) | every 30 min: weekly e-mail + daily backup (switch in Admin → Reports) | needs SMTP settings |
| In-process stats flush (`modules/stats/service.ts`) | every 30 s writes view counts to `STATS_FILE` | |

## 3. Manual / AI-run jobs (commands)
| Job | Command (from repo root) | Purpose |
|---|---|---|
| Validate all content | `cd apps/api && npx tsx src/tools/check-content.ts` | must show zero errors after ANY content change |
| Typecheck / tests | `pnpm -r typecheck`, `pnpm -r test` | after code changes |
| Lesson batches | `python tools/lesson-generators/genN_*.py` (needs paths fixed from `/tmp/ss-build`) | create/overwrite lessons, questions, curriculum topics |
| Mark off-book topics | `mark_add.mark(cls,subj,ch,[slugs])` | label "(additional, not in the textbook)" |
| Count topics / gaps | `/tmp/show.py CLASS SUBJECT` (sandbox helper; recreate if needed using `toc67.py`) | find slug collisions & uncovered textbook sections |
| Admin settings dump → PDF | `cd apps/api && npx tsx src/tools/dump-settings.ts > settings.json` then `python tools/make_admin_settings_pdf.py settings.json ADMIN_SETTINGS.pdf` | keep the PDF in sync |
| Curriculum import check | `pnpm --filter @studysmart/api curriculum:check`; `db:seed` | DB vs files |
| Classroom scenes | `tools/author_classroom*.py`, `Build-Lessons.bat` | picture-first lessons |
| Sandbox→PC sync (Claude only) | `/tmp/dosync.sh N PREV` → `syncN.tgz` + `manifest.txt` → committed to `_to_delete\syncN.tgz`, extracted over the project; files not in manifest moved to `_to_delete\old` | Another AI can ignore this and edit the PC folder directly. `manifest.txt` and `CHANGED_FILES.txt` in the root are sync leftovers. |

## 4. Impact matrix — "if you change X, you must also…"
| You change | Impacted jobs / files | Do this |
|---|---|---|
| Any sentence in `content/lessons`, `content/questions`, `content/classroom`, or `content/audio/phrases.json` | Audio (all voices) | run `Generate-Lesson-Audio.bat` (only changed text is regenerated; old clips stay until `--prune`) ; run check-content |
| Lesson/question JSON schema (`packages/shared/src/lesson.ts`, `question.ts`) | all generators (`kit2.py`, `textlesson.py`), `check-content`, web players, audio `collectJobs` in `build.ts`, tutor context, tests | update generators + schema + tests together |
| Topic or chapter slug / file naming `cbse-{cls}-{subj_file}-{chapter}-{topic}.json` | curriculum JSON, `audioKey` (text-based, unaffected), progress/mastery keys of users (they store topic ids), URLs, search, classroom file names | avoid renaming slugs; if unavoidable add redirects and migrate progress |
| `content/curriculum/cbse-2026-27.json` | `db:seed` on server, `curriculum:check`, search API, all pages, term papers, grade path | run seed on server after publish |
| `voices.json` (voice ids, speeds, `ta` entries) | `Generate-Lesson-Audio.bat`, audio manifest keys (hash includes voice+speed ⇒ changing speed regenerates everything), teacher picker in web, `serve.py` DESC names | keep ids identical in `voices.json`, `build-audio.ts` (`parler:` prefix routing), `serve.py` |
| `tools/tamil-voice-trial/serve.py` voices | `Generate-Lesson-Audio.bat`, `Try-Tamil-Teacher-Voice.bat`, port 8090 / `PARLER_URL` | |
| Malar Teacher server port/URL | `MALAR_URL`, `Generate-Lesson-Audio.bat` health checks (`:8080/api/health`), `Try-Indian-Voices.bat`, Start bats | |
| New setting in `packages/shared/src/settings.ts` | Admin UI (auto), public settings API, web code reading `s.get(key)`, `ADMIN_SETTINGS.pdf`, tests that count/lookup settings (e.g. `Admin.test.tsx` finds a switch by name) | add `dependsOn`, default, help; regenerate PDF; keep test selectors specific |
| `i18n.ts` UI strings | Tamil UI text (`ta` needs wording review) | add both `en` and `ta` |
| Class/board added (new `*-2026-27.json`) | importer (`modules/curriculum/importer.ts`), `catalog.defaultBoard`, board picker, search board param, deploy seed | |
| `server-paths.ts` or env var names | all bats, `deploy/*.sh`, `studysmart.env.example`, backup | |
| Books (`content/books`) | `Organize-Books`, `Add-Tamil-Books`, `Build-Book-Pages`, reader | |
| Recipes (`content/recipes`) or `lessonkit/rules.ts` | `Build-Lessons.bat`, classroom JSON, then audio | |
| DB schema (`db/schema.ts`) | `db:generate`, `db:migrate` on server (`update.sh`), backup/restore | |
| Admin auth / env keys | server env file, `/admin` login | owner sets keys |
| Mail/report settings | 30-min timer, SMTP env/settings, weekly email, daily backup | |

## 5. Update rule
When you add, rename, change or remove a job, edit sections 1–4 above in the same change, and add a dated line to the change log in `HANDOVER.md`.

- Class 5 content (gen5_*.py) is picked up by the existing lesson/audio/book jobs with no job change. Audio for the 105 Class 5 lessons has not been generated: the next Generate-Lesson-Audio.bat run will include them (extra run time).

- 2026-11-16 (sync 155): content-only change. New generators gen_gaps_m4.py and gen_gaps_eng.py (run from /tmp/ss-build style paths like other gen*.py). Audio: 23 new lessons need audio the next time Generate-Lesson-Audio.bat runs. No settings, scripts or .bat changed.
- 2026-11-17 (sync 156): Class 5 textbook-text job. All 111 Class 5 lessons (maths 45, EVS 30, English 36) rewritten from the textbook PDFs (NCERT Maths Mela, Our Wondrous World, Santoor) via tools/lesson-generators/tb5.py + gen5tb_*.py. Paraphrased, off-book items labelled '(additional, not in the textbook)'. Re-titled stubs that did not match their chapter: maths ch6 dividing and ch13 two lessons, EVS ch3, ch4, ch5, ch6, ch7-10 lessons, curriculum names updated. GAPS: fractions/figures/diagrams/worksheets are lost in PDF text extraction (maths ch2, 11-15 thinner); question banks in content/questions still belong to the old stub topics for re-titled lessons; EVS ch6 opening and ch10 end partly truncated in extraction; no Tamil text; audio not generated (run Generate-Lesson-Audio.bat); Hindi/Tamil/arts/PE Class 5 books have no lessons.

## Question papers collector (2026-11-17)
- What: PC job downloads free CBSE/Matric/State Board papers, turns them into interactive questions on /papers. 3 runs a day (Task Scheduler), 10+ papers per run, one site finished before the next.
- Impact: needs the PC on at run time; each run publishes only after Go-Live.bat. Storage about 20-60 KB per paper (gzip), capped by admin settings (default 300 MB / 5000 papers). Cost Rs 0. Politeness pauses (6 s) make a 10-paper run take a few minutes.
- Controls: Admin > Question papers (limits, schedule count, boards/classes/subjects/kinds, per-site on/off, thresholds, display options, hide/show, reset).

## E-Library collector (2026-11-17)
- What: PC job downloads free, openly licensed (CC0, public domain, CC BY, CC BY-SA) kids' PDF books from Internet Archive and Wikimedia Commons (more sites listed in tools/library/sites.json), compresses, de-duplicates by hash, classifies by age band, adds them to /library. One site finished before the next; polite pauses; robots.txt respected; never logs in, never bypasses CAPTCHAs/paywalls; copyrighted or no-redistribution sites are listed as not allowed.
- Default: OFF. 10 books per run, 3 runs a day once scheduled (Schedule-Library-Books.bat). Capability is 100+ per site per run (raise "Books per run").
- Impact: PC must be on; books are large, so they live in data/library (not git). Cap 5 GB now, 50 GB planned for the server (admin settings; warning at 80%). Catalogue JSON goes through git. Upload-Library-To-Server.bat copies files when the server exists. Cost Rs 0.
- Controls: Admin > E-Library (shelf options, reader speed options, collector limits/schedule/hours/licences/languages/age bands/tags/sites on-off, storage caps, hide/remove books, reset sites, status and run history).
- Takedown: Remove-Library-Book.bat <id> or Admin > E-Library > Remove (deletes files, blocks the id).

## Social auto-poster (2026-11-17)
- Manual/optional: Social-Post-Run.bat and Schedule-Social-Posts.bat (PC) or the website timer on the server. Posts 4 runs x 5 posts a day by default once enabled; media files in data/social (auto-cleaned), ffmpeg render is CPU-heavy for ~1 min per reel. Off by default; needs Meta keys.

## "How it works" tour video (2026-11-16)
- Free, local, one-click rebuild with Build-Tour-Video.bat (needs Python, ffmpeg; installs Pillow, numpy, playwright once). Videos are about 10 MB in total, served by the site itself (no extra hosting cost). Admin can hide it, move it, or upload a replacement.

- 2026-11-16: Class 5 round 2: 11 Maths + 2 EVS lessons enriched, 8 PE lessons new, 4 SVGs; no cost.

## Classroom visuals (2026-11-16, job #8)
- Build-Visuals.bat: regenerates `content/classroom/auto-*.json` + coverage report. Re-run after adding lessons. Output is deterministic, no network, Rs 0.
- Fetch-Lesson-Pictures.bat: downloads openly licensed pictures from Wikimedia Commons (free API, polite pauses, ~50 small WebP files, a few MB). Needs Python + Pillow. Never run by the sandbox. Safe to re-run.
- Impact: classroom lessons now have a "Picture it" page for almost every lesson (more narration = more audio to generate: re-run Generate-Lesson-Audio.bat). Admin can switch animations/pictures off per subject or class.

- 2026-11-17: GK section job #5 finished: 25 categories, 54 lessons, 54 puzzle sets, 21 browser-drawn animations, slides, quizzes, daily GK + puzzle, 4 admin pages, Build-GK.bat (see HANDOVER.md). Audio pending (Generate-Lesson-Audio.bat). No cost.

- 2026-11-17 (Matric gaps job, sync163): added Matric Class 9/10 English (42 lessons), Tamil (72), Science practicals (24) and computer units (6) with quizzes; board no longer fixed to CBSE in the web UI (src/lib/activeBoard.ts: admin default board or the signed-in child board). Gaps: Tamil lessons are English explanations with Tamil key terms (no full Tamil text); Maths/Science/Social deepening (splitting chapters) not done; one CBSE Class 5 lesson (weight-and-capacity-problems) fails the shared compose test (another job).

## Class 5 gap fork #2 (2026-11-17)
- Real lessons and question banks for 14 more Class 5 lessons plus 8 SVG diagrams. Cost 0.
- 2026-11-17: CBSE Class 11-12 lessons blocked: book folders empty.

- 2026-11-17 [CBSE Class 10 job]: sync-cbse10-1 extracted. Maths 28 + Science 25 lessons (NCERT 2025 books; 8 board-style questions each incl. assertion-reason), 11 SVG diagrams (apps/web/public/assets/lessons/c10-*.svg), curriculum merged via tools/c10/finalize.py (idempotent; run: python3 tools/c10/finalize.py "$PWD"). Not yet done: Social Science, English, Hindi, Tamil, 2nd Heredity lesson, tests not run on PC, no audio generated, no topic animations (visuals library not applied).

- 2026-11-17: CBSE Class 10 continuation job: +41 lessons (Social Science 22, English 18, Heredity 1). Class 10 now 94 lessons (Maths 28, Science 26, SS 22, English 18).

- 2026-11-17 CBSE 6-7 whole-chapter lessons: 49 new chapter lessons (Maths + Science, Classes 6 and 7), ~420 questions with explanations. Social, English and language subjects still to do.

- 2026-11-17 (misc fork): visuals follow-ups (generated-boards switch, coverage before/now columns, +24 pictures, plant-parts retry), GK navigation restored, tour files verified. Archive sync-misc-1.

- 2026-11-17 (Matric deepening restart, sync-matric-deep-3): Class 10 Social Science history deep lessons added from textbook text (depression/fascism, WWII, Cold War and China, reform movements, Palayakkarars). CBSE hard-coding already admin-driven (activeBoard.ts, Account.tsx fall back to CBSE only when admin default unset). Tamil: tesseract has no tam data on this machine, so Tamil OCR is a gap.
- 2026-11-17: CBSE Class 8 (57 lessons) and Class 9 Maths (14 lessons) on PC; catalog merged via tools/cbse89/merge_catalog.py. Gaps: Class 8-9 Hindi, Tamil, Sanskrit, arts, PE not built; no diagrams yet.
- 2026-11-17: c34 job: Class 4 EVS 10 lessons added (sync-cbse34-2).
- 2026-11-17: c34: Class 4 Maths ch1-6 added (sync-cbse34-2).

- 2026-11-17 (Matric deepening, sync-matric-deep-3/4/5): from the real Class 10 textbook text, added deep lessons: Social (Great Depression and Fascism, WWII, Cold War and China, reform movements, Palayakkarars, Globalization, Government and Taxes, Food Security) and Science (Nuclear Physics, Thermal Physics, Acoustics, Genetics monohybrid cross with Punnett SVG, Nervous System). Builders: tools/matric_deep/{h10_a,e10_a,p10_a,b10_a}.py. NOT done (gaps): Class 9 Social/Science deepening (no deep lessons yet), remaining Class 10 Social (geography, civics central/state, Gandhian/TN freedom chapters) and Science (periodic table, plant anatomy, transport, hormones, reproduction, evolution, breeding, health, environment), Tamil OCR (tesseract has no tam data), tests not run (no pnpm on PC shell).
- 2026-11-17: CBSE Class 9 Maths 14 + Science 12 lessons on PC. Gap: Science ch9 (corrupt PDF).
- 2026-11-17: c34: Class 4 Maths+EVS done (24 lessons), sync-cbse34-2.
- 2026-11-17 (cbse67 job 2): Class 6 Social Science whole-chapter lessons built for all 14 chapters from real textbook text (tools/c67/s6_ss01..14.py, archive _to_delete/sync-cbse67-2.tgz). Run Build-Visuals.bat then Generate-Lesson-Audio.bat.
- 2026-11-17: c34: +3 Class 3 Maths lessons; see tools/c34/GAPS.md; sync-cbse34-2.tgz.
- 2026-11-17: CBSE Class 9 now 45 lessons (Maths 14, Science 12, Social Science 15, English 4). Remaining: English units 5-8, Hindi, Science ch9 (corrupt PDF).

- 2026-11-17 (Matric deepening fork, sync-matric-deep-6): Class 10 Science deep lessons from textbook text: Periodic Classification/Metallurgy (3 lessons: periodic trends, ores and extraction, alloys and corrosion) and Plant Anatomy and Physiology (4 lessons: tissue systems, root/stem/leaf, photosynthesis, respiration), 8 SVG diagrams, 10 questions each. Checked with tools/matric_deep/check.py (python; zod check-content not run, no pnpm on this shell). Run pnpm check on PC.
- 2026-11-17: CBSE Class 8 (57) + Class 9 (49) lessons on PC; Class 9 Hindi, Science ch9, Class 8 Hindi/Urdu/Sanskrit are gaps.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-7): Class 10 Science deep lessons: Structural Organisation of Animals (leech, rabbit) and Transportation in Plants and Circulation in Animals (transport in plants, blood/vessels/blood groups, heart/circulation/BP): 5 lessons, 5 SVG diagrams, 10 questions each; python checker passed.
- 2026-11-17 (cbse67 job 2): Class 7 Social Science part 1 (12 chapters) added from real textbook text; archive _to_delete/sync-cbse67-3.tgz (includes all 26 Social Science lessons so far).

- 2026-11-17 (Matric deepening fork, sync-matric-deep-8): Class 10 Science deep lessons: Plant and Animal Hormones (3 lessons) and Reproduction in Plants and Animals (4 lessons: modes and flower, pollination and double fertilization, human reproductive system and menstrual cycle, pregnancy and reproductive health). 7 SVGs. Hygiene and UTI parts of the chapter only touched lightly (gap).
- 2026-11-17: CBSE 6-7 Social Science complete (34 chapters, Class 6: 14, Class 7: 20) in sync-cbse67-4.tgz; check.py 0 problems. English, Hindi and deeper Maths/Science pass NOT done (gaps). Run Build-Visuals.bat and Generate-Lesson-Audio.bat.
- 2026-11-17 [CBSE 3-4 continuation]: Class 3 Maths now 14/14 whole-chapter lessons (11 new: What's in a Name, Vacation with My Nani Maa, House of Hundreds I and II, Raksha Bandhan, Fair Share, Fun at Class Party, Filling and Lifting, Give and Take, Time Goes On, The Surajkund Fair), each 16-23 narration sentences, 3 worked examples, 12 questions, SVG diagrams where useful. Archive sync-cbse34-3.tgz. Tools tools/c34 (m3b..m3i).

- 2026-11-17 (Matric deepening fork, sync-matric-deep-9): Matric Class 10 Science: Evolution (3 lessons), Breeding and Biotechnology (3), Health and Diseases (3), Environmental Management (4) = 13 deep lessons with SVGs and 10 quiz questions each from textbook text; Class 10 Science chapters now deepened

- 2026-11-17 [CBSE 8-9 continuation, sync-cbse89-6]: Class 9 +16 lessons (8 English poems, 8 Science activity labs), 15 SVG diagrams attached to Class 8/9 Maths and Science, validators 0 problems; gaps in tools/cbse89/GAPS.md (ch9 PDF truncated, languages need OCR data, no Social Science visuals).

- 2026-11-17 (CBSE 6-7 depth upgrade): +3 Class 7 Maths chapters at full depth (sync-cbse67-deep-1). Remaining Class 6-7 Maths/Science chapters still to upgrade.

- 2026-11-17 [CBSE 6-7 English job]: sync-cbse67-5: Class 6 English Poorvi units 1-7 (Bottle of Dew, Raven and Fox, Rama to the Rescue, Unlikely Best Friends, A Friend's Prayer, The Chair, Neem Baba) as whole-chapter lessons built from the real textbook text (comic panels of Rama to the Rescue read by OCR). Builder tools/c67/e.py + l6_NN.py. In progress.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-10): Matric Class 10 Maths: Coordinate Geometry (area, slope, equations of a line), Mensuration (frustum, combined solids), Statistics (coefficient of variation), Algebra (3-variable systems, nature of roots, roots and coefficients, matrix operations), Geometry (angle bisector, Ceva and Menelaus) = 13 deep lessons with SVGs and 10 questions each
- 2026-11-17: CBSE 3-4 lessons: Class 3 EVS complete (12 chapters, full quality); archive sync-cbse34-4.tgz. Class 3/4 English in progress.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-11): Class 10 Social Geography: climate/monsoon/seasons, rainfall and natural vegetation, wildlife and biosphere reserves, agriculture (types of farming, soils, major crops, irrigation and projects) = 7 deep lessons with SVGs and 10 questions each

- 2026-11-17 (Matric deepening fork, sync-matric-deep-12): Class 10 History Gandhian Phase deep lessons (4: early satyagrahas/Rowlatt/Khilafat, Non-Cooperation/Swarajists/Simon, Civil Disobedience/Round Tables/Poona Pact, Revolutionaries/Left/Quit India) with timeline SVGs and 10 questions each from textbook text

- 2026-11-17 (Matric deepening fork, sync-matric-deep-13): Class 10 History Freedom Struggle in Tamil Nadu deep lessons (3: early nationalist stirrings, Swadeshi/revolutionaries/Home Rule, Justice Party and Congress movements) with timeline SVGs and 10 questions each

- 2026-11-17: CBSE 6-7 depth job: Class 7 Maths +3 chapters at full depth (sync-cbse67-deep-3).

- 2026-11-17 [CBSE 3-4 continuation]: Class 3 English chapters 6-12 added (paper-boats, the-big-laddoo, thank-god, madhus-wish, night, chanda-mama-counts-the-stars, chandrayaan): 28-32 narration sentences, 12 questions each, 1 SVG. Class 3 Maths 14/14 and EVS 12/12 already present; Class 3 English now 12/15 (3 grammar slugs are not book chapters). Archive sync-cbse34-5.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-14): Class 10 Civics Central Government deep lessons (2: President and Vice-President, Prime Minister/Council of Ministers/Parliament) with SVGs and 10 questions each; Supreme Court section still to deepen

- 2026-11-17 [CBSE 8-9 continuation 3]: Class 9 Science ch9 Atomic Foundations of Matter built from the re-supplied PDF: 3 lessons, 29 questions, 4 SVG diagrams. Class 9 now 68 lessons, Class 8 57; validator 0 problems. Archive sync-cbse89-7.tgz. Next in this job: Social Science maps/timelines, English grammar lessons, depth checks.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-15): Class 10 Civics Central Government: +2 deep lessons (Lok Sabha/Money Bill/Speaker, Attorney General and Supreme Court) with SVGs; Central Government chapter now has 4 deep lessons

- 2026-11-17 (Matric deepening fork, sync-matric-deep-16): Class 10 Civics State Government deep lessons (2: Governor, Chief Minister/Council of Ministers/State Legislature) with SVGs and 10 questions each

- 2026-11-17 (Matric deepening fork, sync-matric-deep-17): Class 10 Civics India's Foreign Policy deep lessons (2: objectives/Panchsheel/non-alignment, Cold War/nuclear policy/SAARC/new directions) with SVGs and 10 questions each

- 2026-11-17 (Matric deepening fork, sync-matric-deep-18): Class 10 Civics India's International Relations: deep lesson India and its neighbours with SVG and 10 questions

- 2026-11-17 [CBSE 6-7 English job, in progress]: written directly on the PC (tools/c67/l6_14-16.py, l7_01-05.py): Class 6 The Kites, Ila Sachani, National War Memorial; Class 7 The Day the River Spoke, Try Again, Three Days to See, Animals Birds and Dr Dolittle, A Funny Man (whole-chapter lessons, 10 questions each, check.py 0 problems). Remaining: Class 7 chapters 6-15, Social Science re-verification.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-19): fix wording in India and its neighbours summary

- 2026-11-17 (question-paper sites research, job #6): tools/papers/sites-research.json (disabled entries) and SITES_REPORT.md written. Top: cbseacademic.nic.in, dge.tn.gov.in, KV digital library. Nothing enabled or downloaded. Owner to approve community sites (kalvikavi/padasalai).

- 2026-11-17 [CBSE 8-9 continuation 3]: +9 SVG diagrams on Class 8/9 Social Science lessons (sync-cbse89-8.tgz).

- 2026-11-17 [CBSE 3-4 continuation 2]: Class 4 English units 1-12 added from the real NCERT text (together-we-can, the-tinkling-bells, be-smart-be-safe, one-thing-at-a-time, the-old-stag, braille, fit-body-fit-mind-fit-nation, the-lagori-champions, hekko, the-swing, a-journey-to-the-magical-mountains, maheshwar): 26-35 narration sentences, 12 questions each, SVGs for road safety, Braille alphabet and mountain landforms. Archive sync-cbse34-6.

- 2026-11-17 enable-sections: question-papers collector default switched OFF (papers.job.enabled=false); library collector already OFF. Sections themselves are ON for visitors; no scheduled job runs until the owner enables it in Admin.
- 2026-11-17: Class 7 Maths depth rewrites (geometric-twins, operations-with-integers, finding-common-ground, another-peek-beyond-the-point, connecting-the-dots, constructions-and-tilings, finding-the-unknown). Fixed classroom action 'at' >1: clamped to 0-1 in visuals/kit.ts helpers + final clamp in build-visuals.ts. Run Build-Visuals.bat to regenerate; pnpm test not run here.
- 2026-11-17: CBSE Class 4 EVS 'Our Sky' upgraded to full depth (37 narration sentences, 12 questions, shadow SVG). Remaining 9 Class 4 EVS chapters + Class 4 Maths/Class 3 upgrades still pending. Archive sync-cbse34-7.tgz.
- 2026-11-17: CBSE 8 English language-work lessons (units 1-3, 9 lessons) added; validator 0 problems; units 4-5 and Class 9 English language work pending.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-20): Class 10 Science deep lessons: gravitation/apparent weight, refraction-dispersion-scattering, human eye defects, thermal expansion, resistors in series/parallel, nuclear fission/fusion (6, each with SVG and 10 questions); added a third option and wrong-answer reasons to 13 two-option questions in earlier Class 10 Science lessons (fix_mcq.py)
- 2026-11-17: CBSE 6-7 fork: Class 6 English ch14-16 and Class 7 English ch1-15 whole-chapter lessons built from real book text (original paraphrases, 10 specific-explanation questions each); curriculum JSON incident repaired and register() made atomic; check.py 114 files 0 problems; archive sync-cbse67-english-1.tgz. Class 6-7 Social upgrades and grammar-topic deepening NOT yet done.
- 2026-11-17: Question-paper harvest approved for all researched sites (kalvikavi, padasalai included); sites.json merged, papers job default ON + migration, Sources admin controls and attribution done; owner runs Discover/Harvest/Schedule bats (see HANDOVER.md). Not run on real sites yet.

- 2026-11-17: CBSE 8-9 continuation: +3 Class 8 English Unit 5 language-work lessons (Class 8 now 68 lessons); topic-slug trailing-hyphen bug fixed in the builder and catalog.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-21): Class 10 Science chemistry deepened in place: mole concept/percent composition/Avogadro, types of chemical reactions, solubility and concentration, plus new lesson types of solutions/hydrated salts/deliquescence (each 11-13 narration sentences, SVG, 10 questions).

- 2026-11-17 (Matric deepening fork, sync-matric-deep-22): Class 10 Science: hydrocarbons deepened, homologous series and IUPAC added
- 2026-11-17: [cbse89] Class 9 Kaveri Unit 1 language work built (2 lessons: grandmother language work, Bharat Our Land language work; c9e_u1a/u1b.py). 142 lessons checked, 0 problems. Kaveri units 2-8 language work, listening transcripts, Maths/Social depth comparison, 3 thin Class 8 English lessons, real Social maps remain (see tools/cbse89/GAPS.md). Not archived; edits made directly on the PC. Nothing pushed.
- 2026-11-17: Class 3 depth pass: rebuilt Maths Fun with Shapes (33 sent.), EVS Family and Friends (32), Going to the Mela (28), Celebrating Festivals (26), Living in Harmony (30), Plants and Animals Live Together (30); each 12 questions + diagram; check.py 74 files, 0 problems. Remaining Class 3 to deepen: EVS 8, Maths 9, English 5 (tools/c34/GAPS.md).
- 2026-11-17 15:15 CT: HANDOVER.md status update appended (changes, content status, running/pending jobs, owner actions).

- 2026-11-17 [CBSE Class 4 depth job]: started upgrade of the 19 under-bar Class 4 whole-chapter lessons (see HANDOVER.md). No lesson files changed yet.

- 2026-11-17 (CBSE 6-7 Maths/Science depth fork, restart): verified from tools/c67/deep/done.txt: Class 7 Maths all 15 chapters and Class 6 Maths 8 of 10 chapters are at full depth (on the PC). Remaining: Class 6 Maths symmetry and the-other-side-of-zero, then Class 7 Science (12) and Class 6 Science (12). Nothing new written yet in this run; no archive needed (edits go directly on the PC).

- 2026-11-17 (Class 3 continuation fork): no new lessons written yet in this run; verified state (EVS 7, Maths 9, English 5 chapters still under the 30-sentence bar, plus Going to the Mela 28 and Celebrating Festivals 26). Textbook text extracted for work (evs/maths/english). Nothing lost; all earlier Class 3 work is already on the PC.

- 2026-11-17 (CBSE 6-7 English+Social job 3): audit pass only: English chapters complete (31); Social fact-check flags listed in HANDOVER.md; no new lessons yet.

2026-11-17 Contribute-to-E-Library (partial sync 1): backend (intake, SSRF guard, PDF scan, scored review, moderation API, takedown, audit) with 50 passing tests; web: Contribute page, My contributions, contributor profile, reader tools (BookTools), admin Contributions tabs. Setting contrib.enabled defaults OFF until reviewed. Still to do: run web tests, ADMIN_SETTINGS.pdf, pnpm test on PC.

2026-11-17 Contribute: web tests (contribute.test.tsx, 8) + library tests pass in sandbox; ADMIN_SETTINGS_CONTRIBUTE.pdf added (61 settings; main ADMIN_SETTINGS.pdf not regenerated - no generator found).

- 2026-11-17 (perf job): faster local start and page loads (cached content index, lazy pages, compression, skip unneeded install/build). Admin controls under Site and performance > Speed. Cost 0.

- 2026-11-17 (CBSE 6-7 English+Social job 3): English complete (31 chapters), Social fact-checked clean, 2 lessons improved; maps/timelines and listening checks remain gaps (tools/c67/GAPS.md).
- 2026-11-17: CBSE 6-7 depth fork: Class 6 Maths now all 10 chapters at full depth (added Symmetry, The Other Side of Zero); check.py 0 problems. Next: Class 7 Science.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-23): Class 10 Social: World War II deep rewrite (4 lessons: causes, Europe/N.Africa, Asia-Pacific, Holocaust/UN)

- 2026-11-17 (perf verification): sandbox benchmark, 2414 content files: first start ~149 s (one-time seed), every later start 7 s to /health (marks skip unchanged content; baseline reseeds everything each start). Built web assets 7.9 MB, lazy-loaded pages. No code changed.
- 2026-11-17: c67 fork: 3 Social civics diagrams attached.

- 2026-11-18 (Matric deepening fork): Class 10 Social Geography Unit 4 (India - Resources and Industries) deepened into 3 full lessons (minerals 16 narration lines, energy resources 18, industries 19; 10 questions each with specific wrong-option explanations, SVG diagrams) written directly to the PC via tools/matric_deep/g10_c.py; check.py passes. Still thin (7-8 narration lines, 6-8 questions): Geography population/transport/trade, TN physical and human geography, Civics international relations and state judiciary, Economics industrial clusters, History anti-colonial movements and TN social transformation; then Science, Maths, Class 9.
- 2026-11-18 job 'multi-board home + install message': settings catalog.boards.*, catalog.board.<code>.show/label, app.install.desktopText/otherText; migration migrate-boards (runs once at start, needs lessons loaded); no batch job changes.
- 2026-11-18 02:47: Class 9 English ch02 language-work lesson + 12 questions added; catalog verified.

- 2026-11-18 (E-Library fork): library books open in the Book Reader with pre-rendered WebP pages (library/pages.ts, tools/build-library-pages.mjs, Build-Library-Pages.bat; settings library.pages.*; admin card "Book Reader pictures"); Contribute "Fetch details" button (contrib/pagefetch.ts, POST /library/contribute/fetch-details, settings contrib.fetch.*). Restart site once. See ADMIN_SETTINGS_LIBRARY.pdf.

- 2026-11-18: Class 4 depth upgrade done in sandbox and synced (sync-cbse4-1..4): 9 thin chapters rebuilt to 30+ sentences (Maths Data Handling, Symmetry, Clocks, Transport Museum, Cleanest Village, Hide and Seek, Patterns; EVS Different Lands, How Things Are Made), 7 English units topped up, tools/c34/GAPS.md rewritten. No audio, no catalog change.

- 2026-11-20: Kani audio run (Generate-Edge-Audio.bat, JOBS=6, re-run until generated 0); Go-Live.bat for GitHub + server + audio copy. See HANDOVER.md section "HANDOVER TO CHATGPT" for the full open-work list.
