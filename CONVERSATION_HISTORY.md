# Conversation history and decisions (for another AI)

**Honesty note:** this is a written summary, not a word-for-word transcript. Claude's session was compacted several times, so only summaries of the early work are available to it. The original chat remains in the owner's Claude account (session https://claude.ai/code/session_01BNcM96MS9foG5WxjZ4TWPZ) and may be exported by the owner from claude.ai (Settings → Privacy → Export data). Append new decisions at the bottom.

## Owner and way of working
- Owner: itsme.rajrajan@gmail.com, Chennai. Works with Claude (builder) and Perplexity/ChatGPT (research, redesign ideas, lesson drafts) in parallel. Prefers short milestone messages, no waiting for approval, no repeated questions. Publishes to GitHub himself and sets up all accounts/keys/passwords himself.
- Token/usage budget has always been tight; asked to save progress into the project folder frequently so work can resume.

## Project decisions (chronological, abbreviated)
1. Free website for CBSE / State Board / Matric students; Malar Teacher explains by voice on a classroom board; no AI keys or paid APIs at runtime.
2. Started from a ChatGPT-written "Master Product and Technical Specification"; Claude reviewed it and built module by module (docs 00–19). Zero-cost rule (domain only).
3. Teacher model: first cartoon/MakeHuman avatars rejected; decided on audio-first teacher with picture-first board (no teacher portrait, board shows pictures, subtitles in a separate box). Video/lip-sync (Pixar-style faces from FLUX.1 schnell + open-source talking-avatar models, Kaggle GPU) postponed; left face English, middle English, right Tamil focus later.
4. Voice: Kokoro HeadTTS on CPU (port 8080). Owner wants natural Indian-English male+female teachers; Hindi-trained voices mispronounce; liked Priya 2 / Ravi 2 best; then asked for Tamil-teacher-accent English → Indic Parler-TTS (jaya, murali) on port 8090. Tamil teacher should use colloquial Tamil with English words.
5. Naming/hosting: StudySmart → SharpStudy; domain sharpstudy.in (Spaceship). vidyapark idea dropped. Host later on a separate Oracle Always Free server (wife's name); public vs invite-code access modes.
6. Textbook reader: NCERT PDFs per class/subject, two-page book style, 3 selectable styles (default C library), read-aloud incl. Tamil voice for Tamil subjects.
7. Lessons: full teacher-style chapter lessons with narration; quizzes must have plausible distractors; quiz question shows only visual on the board; add practice, worksheets, school term papers (quarterly/half-yearly/annual); programmatic animation wherever possible; board picture only when relevant.
8. Build order: CBSE Class 3 → 6 → 7 → 4 → 5, then Matric. Later narrowed: finish CBSE Classes 3, 4, 6, 7 (maths, EVS/science, social science, English), skip Hindi/Tamil/Sanskrit for now, then **Tamil Nadu Matric 9 and 10**.
9. Standing rule: every feature must have admin settings (on/off + options).
10. Depth pass (this session): raise every chapter from 3 topics to 4–5 based on NCERT 2026-27 sections; **verify against textbooks** and report gaps honestly; do **not** remove topics that are not in the book — keep them and label "(additional, not in the textbook)" ("it will be useful somehow"). Tamil translation of the new lessons deferred.
11. Textbook verification findings: Class 3 maths = Maths Mela (14 ch), Class 4 maths = Maths Mela (14 ch), Class 3/4 EVS = "Our Wondrous World", Class 3/4 English = Santoor (12 ch each), Class 6 English = Poorvi (16 ch), Class 7 English = Poorvi (15 ch), Class 6/7 maths = Ganita Prakash, science = Curiosity, social = Exploring Society. Lesson text is our own wording (textbook text is copyrighted).
12. 16 Nov: owner asked for search boxes wherever useful (added), then asked Claude to check the Tamil-teacher voices will generate in tonight's audio job (plan checked; real test needs his PC), then for this handover because his Claude Pro subscription may end tonight. Owner wants: handover doc, admin-settings PDF, batch/manual jobs impact doc, conversation history, all kept updated in the project folder; and Tamil voice lessons for Tamil subjects.

## Things the owner asked to be told at the end (carry over)
- What is pending at his end (see HANDOVER.md §10) and what the next AI should do (§9).

## Log of new decisions after the handover (append below, dated)

## Class 5 background job (16 Nov 2026, night)
Owner asked for Class 5 lessons for all subjects as a background job. NCERT Class 5 books for 2026-27: Maths Mela (15 ch), Santoor (10 ch), Our Wondrous World EVS (10 ch). Built 105 lessons (gen5_*.py), opened Class 5 in catalog.openClasses. Gaps: EVS ch 3/4/7 titles via links; maths/EVS from titles not textbook text; English theme-level; no Hindi.

## Gap job (2026-11-16 night)
Class 5 built (sync 154). Then textbook gaps closed where verifiable: titles of Class 3 EVS ch 4/9/11 and Class 5 EVS ch 3/4/7 confirmed; Class 4 maths ch 10-14 aligned to syllabus; 13 English in-brief lessons; grammar chapters labelled additional. Sync 155.
- 2026-11-17: Owner asked to complete 'Textbook text' gap; Class 5 lessons rewritten from textbook PDFs (111 of 111), sync156.

- 2026-11-17: Owner asked for an automated free question-paper/quiz collector (discovery of sites, 3 runs/day harvest, interactive answer boxes, review and marking framework, compressed storage, admin control, PC browser mode if blocked). Built as background job #3; see HANDOVER.md entry "question-paper job".

- 2026-11-17: Owner asked for an E-Library tab with free kids' books from world sites, age-range picker, batch collector (OFF by default), fast direct-PDF reader. Built as background job #4 (see HANDOVER). Coordinator added: storage cap 5 GB now / 50 GB planned, and deep admin customisation with a dedicated admin panel; both done.

## 2026-11-17
- Owner asked for go-live bats: created Go-Live, Server-First-Time-Setup, Server-Restart, Server-Status, Server-Backup-Download, _common.cmd, deploy/first-time.sh. Server blocked by Oracle capacity. Seven parallel jobs started (Class 5 gaps, Matric 9-10, question papers, E-Library, GK, social posts, tour video).

- 2026-11-17: Social auto-poster job #6 finished (sync160): 5 admin pages, ledger/rotation, FB picture + IG reel dry-run, Social-Post-Run.bat, Schedule-Social-Posts.bat. All off by default.

- 2026-11-16: Tour video job #7 finished (sync162): EN video with voice (1:23), TA video captions+music (1:36, Tamil voice pending), player on home + /tour, admin panel with upload, Build-Tour-Video.bat, storyboard doc.

- 2026-11-16: Class 5 gaps round 2 (sync161 content, see HANDOVER.md): Maths ch12-15 rewritten, EVS ch6/ch10 fixed, PE subject added (8 lessons).

- 2026-11-16: Owner felt lessons have too few animations and asked for relevant animations, diagrams and openly licensed pictures on the classroom board, left to my judgement. Done as job #8 (see HANDOVER.md "Classroom visuals"). Pictures still need Fetch-Lesson-Pictures.bat.

- 2026-11-17: GK section built (content/gk, tools/gk, pages/Gk.tsx, admin GkAdmin.tsx, Build-GK.bat); see HANDOVER.md.

- 2026-11-17 (Matric gaps job, sync163): added Matric Class 9/10 English (42 lessons), Tamil (72), Science practicals (24) and computer units (6) with quizzes; board no longer fixed to CBSE in the web UI (src/lib/activeBoard.ts: admin default board or the signed-in child board). Gaps: Tamil lessons are English explanations with Tamil key terms (no full Tamil text); Maths/Science/Social deepening (splitting chapters) not done; one CBSE Class 5 lesson (weight-and-capacity-problems) fails the shared compose test (another job).
- 2026-11-17: Class 5 gap fork #2 (sync175): rebuilt 11 Maths lessons from the textbook (Weight and Capacity x3, Fractions comparing and greater than 1, Symmetrical Designs x3, Grandmother's Quilt x3, map grids) with 8 new SVGs and 12-question banks; PE ch5 has 3 new game lessons (rules of 12 games); Ocr-Tamil-Hindi-Books.bat added. Tour video files verified present.

- 2026-11-17 [CBSE Class 10 job]: sync-cbse10-1 extracted. Maths 28 + Science 25 lessons (NCERT 2025 books; 8 board-style questions each incl. assertion-reason), 11 SVG diagrams (apps/web/public/assets/lessons/c10-*.svg), curriculum merged via tools/c10/finalize.py (idempotent; run: python3 tools/c10/finalize.py "$PWD"). Not yet done: Social Science, English, Hindi, Tamil, 2nd Heredity lesson, tests not run on PC, no audio generated, no topic animations (visuals library not applied).

- 2026-11-17: Class 10 Social Science and English lessons built from the textbooks (sync-cbse10-2).

- 2026-11-17: Fork built CBSE Class 6-7 Maths and Science whole-chapter lessons (49), archive sync-cbse67-1.tgz; Social/English left for the next run.

- 2026-11-17 (misc fork): see HANDOVER.md misc fork line; GK menu entries restored; visuals admin extended.

- 2026-11-17 (Matric deepening restart, sync-matric-deep-3): Class 10 Social Science history deep lessons added from textbook text (depression/fascism, WWII, Cold War and China, reform movements, Palayakkarars). CBSE hard-coding already admin-driven (activeBoard.ts, Account.tsx fall back to CBSE only when admin default unset). Tamil: tesseract has no tam data on this machine, so Tamil OCR is a gap.
- 2026-11-17: Class 8 lessons and Class 9 Maths lessons added (CBSE 8-9 job).
- 2026-11-17: CBSE 3-4 job restarted; Class 4 EVS whole-chapter lessons done.

- 2026-11-17 (Matric deepening, sync-matric-deep-3/4/5): from the real Class 10 textbook text, added deep lessons: Social (Great Depression and Fascism, WWII, Cold War and China, reform movements, Palayakkarars, Globalization, Government and Taxes, Food Security) and Science (Nuclear Physics, Thermal Physics, Acoustics, Genetics monohybrid cross with Punnett SVG, Nervous System). Builders: tools/matric_deep/{h10_a,e10_a,p10_a,b10_a}.py. NOT done (gaps): Class 9 Social/Science deepening (no deep lessons yet), remaining Class 10 Social (geography, civics central/state, Gandhian/TN freedom chapters) and Science (periodic table, plant anatomy, transport, hormones, reproduction, evolution, breeding, health, environment), Tamil OCR (tesseract has no tam data), tests not run (no pnpm on PC shell).
- 2026-11-17: Class 9 Science lessons added.
- 2026-11-17: Class 6 Social Science (14 lessons) added by the CBSE 6-7 job.
- 2026-11-17: CBSE 3-4 job paused: gaps in tools/c34/GAPS.md
- 2026-11-17: Class 9 Social Science and English units 1-4 added.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-6): Class 10 Science deep lessons from textbook text: Periodic Classification/Metallurgy (3 lessons: periodic trends, ores and extraction, alloys and corrosion) and Plant Anatomy and Physiology (4 lessons: tissue systems, root/stem/leaf, photosynthesis, respiration), 8 SVG diagrams, 10 questions each. Checked with tools/matric_deep/check.py (python; zod check-content not run, no pnpm on this shell). Run pnpm check on PC.
- 2026-11-17: CBSE 8-9 lessons job finished (sync-cbse89-1..5).

- 2026-11-17 (Matric deepening fork, sync-matric-deep-7): Class 10 Science deep lessons: Structural Organisation of Animals (leech, rabbit) and Transportation in Plants and Circulation in Animals (transport in plants, blood/vessels/blood groups, heart/circulation/BP): 5 lessons, 5 SVG diagrams, 10 questions each; python checker passed.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-8): Class 10 Science deep lessons: Plant and Animal Hormones (3 lessons) and Reproduction in Plants and Animals (4 lessons: modes and flower, pollination and double fertilization, human reproductive system and menstrual cycle, pregnancy and reproductive health). 7 SVGs. Hygiene and UTI parts of the chapter only touched lightly (gap).
- 2026-11-17: CBSE 6-7 Social Science complete (34 chapters, Class 6: 14, Class 7: 20) in sync-cbse67-4.tgz; check.py 0 problems. English, Hindi and deeper Maths/Science pass NOT done (gaps). Run Build-Visuals.bat and Generate-Lesson-Audio.bat.
- 2026-11-17: CBSE 3-4 fork: Class 3 Maths finished from the real NCERT text (sync-cbse34-3.tgz).

- 2026-11-17 (Matric deepening fork, sync-matric-deep-9): Matric Class 10 Science: Evolution (3 lessons), Breeding and Biotechnology (3), Health and Diseases (3), Environmental Management (4) = 13 deep lessons with SVGs and 10 quiz questions each from textbook text; Class 10 Science chapters now deepened

- 2026-11-17: CBSE 8-9 continuation job added Class 9 English poems, Science activity labs and 16 diagrams (see HANDOVER.md).

- 2026-11-17: CBSE 6-7 depth upgrade job started; first 3 Class 7 Maths chapters done.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-10): Matric Class 10 Maths: Coordinate Geometry (area, slope, equations of a line), Mensuration (frustum, combined solids), Statistics (coefficient of variation), Algebra (3-variable systems, nature of roots, roots and coefficients, matrix operations), Geometry (angle bisector, Ceva and Menelaus) = 13 deep lessons with SVGs and 10 questions each
- 2026-11-17: CBSE 3-4 lessons: Class 3 EVS complete (12 chapters, full quality); archive sync-cbse34-4.tgz. Class 3/4 English in progress.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-11): Class 10 Social Geography: climate/monsoon/seasons, rainfall and natural vegetation, wildlife and biosphere reserves, agriculture (types of farming, soils, major crops, irrigation and projects) = 7 deep lessons with SVGs and 10 questions each

- 2026-11-17 (Matric deepening fork, sync-matric-deep-12): Class 10 History Gandhian Phase deep lessons (4: early satyagrahas/Rowlatt/Khilafat, Non-Cooperation/Swarajists/Simon, Civil Disobedience/Round Tables/Poona Pact, Revolutionaries/Left/Quit India) with timeline SVGs and 10 questions each from textbook text

- 2026-11-17 (Matric deepening fork, sync-matric-deep-13): Class 10 History Freedom Struggle in Tamil Nadu deep lessons (3: early nationalist stirrings, Swadeshi/revolutionaries/Home Rule, Justice Party and Congress movements) with timeline SVGs and 10 questions each

- 2026-11-17 (Matric deepening fork, sync-matric-deep-14): Class 10 Civics Central Government deep lessons (2: President and Vice-President, Prime Minister/Council of Ministers/Parliament) with SVGs and 10 questions each; Supreme Court section still to deepen

- 2026-11-17: Class 9 Science chapter 9 re-supplied by the owner and built into three lessons.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-15): Class 10 Civics Central Government: +2 deep lessons (Lok Sabha/Money Bill/Speaker, Attorney General and Supreme Court) with SVGs; Central Government chapter now has 4 deep lessons

- 2026-11-17 (Matric deepening fork, sync-matric-deep-16): Class 10 Civics State Government deep lessons (2: Governor, Chief Minister/Council of Ministers/State Legislature) with SVGs and 10 questions each

- 2026-11-17 (Matric deepening fork, sync-matric-deep-17): Class 10 Civics India's Foreign Policy deep lessons (2: objectives/Panchsheel/non-alignment, Cold War/nuclear policy/SAARC/new directions) with SVGs and 10 questions each

- 2026-11-17 (Matric deepening fork, sync-matric-deep-18): Class 10 Civics India's International Relations: deep lesson India and its neighbours with SVG and 10 questions

- 2026-11-17 (Matric deepening fork, sync-matric-deep-19): fix wording in India and its neighbours summary

- 2026-11-17: Owner asked to turn ON E-Library, Question papers and GK and show the tour video at the bottom of the site; done via the enable-sections job (see HANDOVER.md). Collectors stay OFF.
- 2026-11-17: Class 7 Maths depth rewrites (geometric-twins, operations-with-integers, finding-common-ground, another-peek-beyond-the-point, connecting-the-dots, constructions-and-tilings, finding-the-unknown). Fixed classroom action 'at' >1: clamped to 0-1 in visuals/kit.ts helpers + final clamp in build-visuals.ts. Run Build-Visuals.bat to regenerate; pnpm test not run here.
- 2026-11-17: CBSE Class 4 EVS 'Our Sky' upgraded to full depth (37 narration sentences, 12 questions, shadow SVG). Remaining 9 Class 4 EVS chapters + Class 4 Maths/Class 3 upgrades still pending. Archive sync-cbse34-7.tgz.
- 2026-11-17: CBSE 8 English language-work lessons (units 1-3, 9 lessons) added; validator 0 problems; units 4-5 and Class 9 English language work pending.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-20): Class 10 Science deep lessons: gravitation/apparent weight, refraction-dispersion-scattering, human eye defects, thermal expansion, resistors in series/parallel, nuclear fission/fusion (6, each with SVG and 10 questions); added a third option and wrong-answer reasons to 13 two-option questions in earlier Class 10 Science lessons (fix_mcq.py)
- 2026-11-17: CBSE 6-7 fork: Class 6 English ch14-16 and Class 7 English ch1-15 whole-chapter lessons built from real book text (original paraphrases, 10 specific-explanation questions each); curriculum JSON incident repaired and register() made atomic; check.py 114 files 0 problems; archive sync-cbse67-english-1.tgz. Class 6-7 Social upgrades and grammar-topic deepening NOT yet done.
- 2026-11-17: Owner approved harvesting question papers from all researched sites including kalvikavi.com and padasalai.net; harvest setup completed (see HANDOVER.md steps).

- 2026-11-17: CBSE 8-9 low-priority fork added Poorvi Unit 5 language-work lessons and fixed the trailing-hyphen topic slugs; Kaveri (Class 9) language sections next.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-21): Class 10 Science chemistry deepened in place: mole concept/percent composition/Avogadro, types of chemical reactions, solubility and concentration, plus new lesson types of solutions/hydrated salts/deliquescence (each 11-13 narration sentences, SVG, 10 questions).

- 2026-11-17 (Matric deepening fork, sync-matric-deep-22): Class 10 Science: hydrocarbons deepened, homologous series and IUPAC added
- 2026-11-17: [cbse89] Class 9 Kaveri Unit 1 language work built (2 lessons: grandmother language work, Bharat Our Land language work; c9e_u1a/u1b.py). 142 lessons checked, 0 problems. Kaveri units 2-8 language work, listening transcripts, Maths/Social depth comparison, 3 thin Class 8 English lessons, real Social maps remain (see tools/cbse89/GAPS.md). Not archived; edits made directly on the PC. Nothing pushed.
- 2026-11-17: Class 3 depth pass: rebuilt Maths Fun with Shapes (33 sent.), EVS Family and Friends (32), Going to the Mela (28), Celebrating Festivals (26), Living in Harmony (30), Plants and Animals Live Together (30); each 12 questions + diagram; check.py 74 files, 0 problems. Remaining Class 3 to deepen: EVS 8, Maths 9, English 5 (tools/c34/GAPS.md).

- 2026-11-17: Class 4 depth job (fork) restarted after a server restart; working through the under-bar Class 4 lessons with tools/c34/lib.py.

- 2026-11-17 (Class 3 continuation fork): no new lessons written yet in this run; verified state (EVS 7, Maths 9, English 5 chapters still under the 30-sentence bar, plus Going to the Mela 28 and Celebrating Festivals 26). Textbook text extracted for work (evs/maths/english). Nothing lost; all earlier Class 3 work is already on the PC.

- 2026-11-17: CBSE 6-7 English+Social job 3 started: audited English and Social lessons, added tools/c67/factcheck_social.py.

2026-11-17 Fork: built E-Library Contribute feature (partial sync 1, switched off by default).

- 2026-11-17: perf job synced (sync-perf-1): faster Start-StudySmart-Local, lazy pages, compression, seed/classroom caches.

- 2026-11-17: CBSE 6-7 English+Social job 3 finished its run: audit, fact check script, National War Memorial and Rani Abbakka fixes.

- 2026-11-17 (Matric deepening fork, sync-matric-deep-23): Class 10 Social: World War II deep rewrite (4 lessons: causes, Europe/N.Africa, Asia-Pacific, Holocaust/UN)

- 2026-11-17 (perf verification): sandbox benchmark, 2414 content files: first start ~149 s (one-time seed), every later start 7 s to /health (marks skip unchanged content; baseline reseeds everything each start). Built web assets 7.9 MB, lazy-loaded pages. No code changed.
- 2026-11-17: c67 fork: 3 Social civics diagrams attached.

- 2026-11-18 (Matric deepening fork): Class 10 Social Geography Unit 4 (India - Resources and Industries) deepened into 3 full lessons (minerals 16 narration lines, energy resources 18, industries 19; 10 questions each with specific wrong-option explanations, SVG diagrams) written directly to the PC via tools/matric_deep/g10_c.py; check.py passes. Still thin (7-8 narration lines, 6-8 questions): Geography population/transport/trade, TN physical and human geography, Civics international relations and state judiciary, Economics industrial clusters, History anti-colonial movements and TN social transformation; then Science, Maths, Class 9.
- 2026-11-18 Owner: home page must show all boards with lessons (not only CBSE) and the desktop install message must point to a mobile browser. Done as multi-board controls; default board kept.
- 2026-11-18 02:47: Fork verified catalog registration for all CBSE files; wrote c9e_u2a language-work lesson.

- 2026-11-18: E-Library fork added Book Reader for library books and Fetch details in Contribute (sync-lib-1/2).

- 2026-11-18: Class 4 depth upgrade done in sandbox and synced (sync-cbse4-1..4): 9 thin chapters rebuilt to 30+ sentences (Maths Data Handling, Symmetry, Clocks, Transport Museum, Cleanest Village, Hide and Seek, Patterns; EVS Different Lands, How Things Are Made), 7 English units topped up, tools/c34/GAPS.md rewritten. No audio, no catalog change.
