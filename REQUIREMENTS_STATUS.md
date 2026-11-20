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
| Pilot, DPDP review, launch on sharpstudy.in | ⬜ | Module 12 |
| Video / lip-sync teachers, 3D | ⬜ | Deferred by decision |

## Only you can do

- Confirm GitHub account/username and give this PC access to push to the `SmartLearning` repo (see PROJECT_NOTES.md).
- Own/register `sharpstudy.in` (~₹600–800/yr, only expected spend) and point DNS to Cloudflare (free).
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


## Update 15 Nov 2026 (gap audit follow-up, see GAP_AUDIT_15Nov.md)
Built now (each with admin switches): new question types (choose-all, matching/diagram labelling, written answers by key points, case passage); mistake notebook and flashcards; progress page as subject cards with chapter tiles; exam extras (flag for review, balanced blueprint, student-chosen length) and a printable exam paper with marks and answer key.
Also built: quick-check diagnostic (chapter and topic, suggests the round to start at) and adaptive difficulty inside practice rounds. Also built: Report a problem (student/parent button, admin review list with new/seen/fixed, admin switches). Also built: Learn/Practice/Worksheet/Test tabs on every topic page; term papers (quarterly, half-yearly, annual) as printable practice papers from the questions on the site (the school's own papers are not included). Still pending: notification preferences, quiet hours, weekly e-mail; cross-grade path; mind maps, puzzles, daily challenge, projects; teach-back by speech, AI read-aloud, AI feedback; teacher sharing; usage/cost analytics, error log, scheduled backup; 13 video and Tamil audio; 14 remaining lessons and Tamil/teacher review; 15 Oracle deploy, DPDP legal read, pilot.

Also built (later 15 Nov): AI answer feedback (helpful / not helpful, sent to problem reports); study reminder with quiet hours (home page, off by default); install-the-app pop-up (Android install button, iPhone steps, snooze); labelled short buttons on the phone book reader; Tamil textbooks added to the book reader list (run Build-Book-Pages.bat).
Also built: puzzle of the day (12 original bilingual puzzles, admin switch); "Path across classes" view per subject (item 8 cross-grade path). Still pending: weekly parent e-mail, daily 10-minute challenge, mind maps, projects, speech teach-back, teacher sharing, usage/cost analytics, error log, scheduled backup, cross-board concept map; then 13, 14, 15.
Also built (16 Nov): copy / WhatsApp share of the parent weekly summary (the free alternative to a weekly e-mail; no mail service needed); server errors listed as one-line notes in Admin > Reports (switch in Report a problem). Still pending: real weekly e-mail (needs a mail service), daily 10-minute challenge, mind maps, projects, speech teach-back, teacher sharing, usage/cost analytics, scheduled backup, cross-board concept map; then 13, 14, 15.

## Update (16 Nov, sync97)
- Built: weekly parent e-mail (own small SMTP sender, off by default; keys in Admin > Reports > Mail keys; Send test / Send now buttons; weekly day, hour and daily limit are settings).
- Built: daily backup (server timer + Backup-Now.bat + Schedule-Backup.bat; Admin > Reports > Daily backup: on/off, hour, copies kept). Saves accounts DB, data/, and lesson content; not textbook pictures or audio.
- Not verified against a real mail server yet (needs your keys). The mail password is stored in the site settings database (admin only).
- Still pending: daily 10-minute challenge, mind maps, simulations/maps/timelines, project challenges, teach-back by speech, teacher/mentor sharing, usage/cost analytics, cross-board concept map, items 13-15.

## Update (16 Nov, sync98)
- Built: "Today's 10 minutes" card on Home (revise due, next lesson, puzzle; ticks; admin: on/off, minutes, each part).
- Built: chapter mind map on each chapter page (admin: on/off, colour finished, most topics). Topic branches only; no sub-points yet.
- Still pending: simulations/maps/timelines, project challenges, teach-back by speech, teacher/mentor sharing, usage/cost analytics, cross-board concept map, items 13-15.

## Update (16 Nov, sync99)
- Built: usage report in Admin > Reports (AI answers per day, busiest/average, parent accounts, children, answers; checked on a real database). No names or questions are shown. There is no money cost to track: the site is free to run.

## Update (16 Nov, sync100)
- Built: teach-back by speech (microphone button on "explain it yourself"; admin switch, OFF by default because Chrome's speech typing may send audio to the browser maker; mention it on the privacy page if you switch it on). Only checked with simple tests, not with a real microphone.
- Built: weekly hands-on project on Home (9 home-only activities, Tamil/English; admin: on/off, share question).
- Still pending: science simulations/maps/timelines, teacher/mentor sharing + authoring UI, cross-board concept map, items 13-15.

## Update (16 Nov, sync101)
- Built (basic): teacher/mentor/parent sharing = "Share this chapter" button (link + WhatsApp, admin: on/off, WhatsApp, opening line). NOT built: teacher accounts, classes, teachers writing their own lessons/questions (authoring UI).
- Still pending: science simulations/maps/timelines, cross-board concept map (needs TN/State content first), authoring UI, items 13-15.

## Update (16 Nov, sync102)
- Built: mistake notebook now syncs to the child's account (shared model, server storage, merge; "learned it" on one device clears it on the others). Tested on the shared merge, the server round trip, and the notebook itself. Old accounts keep working (the new field defaults to empty).

## Update (16 Nov, sync103)
- "A note for parents" on subject pages now shows once a day by default (Admin > Layout > Subjects and chapters: never / once / twice / every time; counted per device). The footer note keeps its own switch.

## Update (16 Nov, sync104) - Class 6 science text lessons, batch 1
- Parent note on subject pages is now two lines.
- New text lessons + 8 practice questions each (English; Tamil topic names only): Class 6 Science - Magnets, Ice/water/vapour, Sun/Earth/Moon, Measuring length. Checked by loading all into a test database (nothing refused). Not yet reviewed by a teacher; Tamil lesson text and classroom board animations still to do.
- Tools: tools/lesson-generators/textlesson.py + gen_sci_b1.py; apps/api/src/tools/check-content.ts (run: pnpm exec tsx src/tools/check-content.ts inside apps/api).
- Class 6 science still without lessons: wonderful world of science, diversity in living world, mindful eating, materials around us, temperature, methods of separation, living creatures, nature's treasures, motion (2nd topic). Social science: 14 chapters (latitudes/longitudes has a topic but no lesson).

## Update (16 Nov, sync105) - Class 6 science batch 2
- Added lessons + 8 questions each: Sorting materials, Measuring temperature, Separating mixtures, Food and nutrients (all loaded into a test database without problems; English only; no teacher review yet).
- Class 6 science still without lessons: wonderful world of science, diversity in the living world, living creatures, nature's treasures, motion. Social science: all 14 chapters.

## Update (16 Nov, sync106) - Class 6 science: all 12 chapters now have a lesson
- Batch 3 added: How scientists find out, Grouping living things, How animals suit their homes, Natural resources, Types of motion (+8 questions each; loaded into a test database without problems; English only; no teacher review).
- Each science chapter has ONE lesson for now; more topics per chapter, Tamil lesson text, classroom board animations, pictures and Tamil audio are still to do.
- Class 6 Social Science: all 14 chapters still without lessons.

## Update (16 Nov, sync107) - Class 6 social science batch 1
- Added lessons + 8 questions each: Latitudes and longitudes, Oceans and continents, Mountains/plateaus/plains, How we know about the past (loaded into a test database without problems; English only; no teacher review).
- Class 6 social science still without lessons: India that is Bharat, beginnings of Indian civilisation, India's cultural roots, unity in diversity, family and community, grassroots democracy 1-3, value of work, economic activities.

## Update (16 Nov, sync108) - social science batch 2 + Indian-English voices
- Added lessons + 8 questions each: Names and geography of Bharat, The Indus Valley cities, Roots of Indian culture, Many people one country (checked in a test database; English only; no teacher review).
- Generate-Lesson-Audio.bat now records three voices (VOICES at the top of the file): malar (American woman), priya (Indian-English woman), ravi (Indian-English man). priya2 / ravi2 are second choices to compare. All four voice files were already downloaded in Malar Teacher\voices. These are Kokoro's Hindi voices speaking English, so I could not check how natural they sound; listen to them and tell me which pair to keep.
- Class 6 social science still without lessons: family and community, grassroots democracy 1-3, value of work, economic activities.

## Update (16 Nov, sync109) - voice trial
- Try-Indian-Voices.bat records ONE chapter (Class 6 Science, Magnets) in 5 voices (malar, priya, ravi, priya2, ravi2) so you can listen before the full run. New option --only <part of a file name> on audio:build (never prunes). Listen in the Classroom page voice list.

## Update (16 Nov, sync110) - parent note
- Parent note on subject pages: three-line wording (EN/TA), a close (X) button (Admin > Layout > Subjects and chapters: on/off), and the once/twice-a-day setting from sync103. The screenshot still showed the old long wording because sync103-104 had not been loaded yet: restart Start-StudySmart-Local.bat and hard-refresh (Ctrl+F5).

## Update (16 Nov, sync111) - Class 6 social science: all 14 chapters now have a lesson
- Added: Family and community life, Governance and democracy, The village panchayat, The city municipality, Why work matters, Kinds of economic activity (+8 questions each; checked in a test database; English only; no teacher review; please check facts against the NCERT book, especially the panchayat and municipality details).
- Class 6 now has one text lesson in every science and social science chapter. Still to do for item 14: more topics per chapter, Tamil lesson text, classroom board animations, pictures; Class 7; remaining Class 3/4/5/8; TN Matric and State Board.
- Sync 112-116: voice list now shows a voice if recorded for any lesson; lesson-board pictures reworked (characters shown briefly, no leftover/unrelated pictures, ~200 science/social picture words added, applies to every chapter); Indian-English trial voices Asha/Kiran (British) added; Generate-Lesson-Audio.bat now records malar,priya2,ravi2; Tamil-oriented teacher voice trial (Try-Tamil-Teacher-Voice.bat, Indic Parler-TTS) awaiting owner's listening; Class 6 text lessons now 56 in total: +Maths symmetry, +8 Science second topics, +7 Social second topics. Honest gap: Class 6 chapters still have only 1-2 topics each; Tamil text/audio, board pictures for new lessons are emoji-based, Class 7+ pending.
- Sync 118-123: +8 Class 6 topics (science: plant parts, filtration/evaporation, stars, solids-liquids-gases; social: continents, rivers/coasts, calendars, dignity of labour) and +8 more (food habits, thermometer use, forests, making a magnet; children's rights, money, early humans/farming, languages and dress); CLASS 7 STARTED: Science (all 12 Curiosity chapters), Social Science Part 1 (all 12 chapters), Maths (12 of 15 Ganita Prakash chapters: Part 1 ch 1-8, Part 2 ch 1-4), one full lesson + 8 questions per chapter, English only. Honest gaps: Class 7 Maths has 3 chapters not yet added (chapter names not found), Social Science Part 2 (8 chapters) pending, every Class 7 chapter has only one topic so far, Tamil text/audio, pictures, cross-check against the textbooks pending.

## Sync 125-127 (CBSE lessons, Class 3/4/7 completion)
- Class 7: Social Science Part 2 (8 chapters) and Maths chapters 13-15 added, one lesson each; Class 7 now has a lesson in every chapter (Science 12, Social Science 20, Maths 15).
- Class 3: the 13 chapters that had no lesson now have one (Maths 6, EVS 7).
- Class 4 (new): Maths Mela 14 chapters and Our Wondrous World EVS 10 chapters, one lesson each, English only.
- Honest gaps: lessons are written from chapter titles, syllabus summaries and subject knowledge, NOT from the textbook text. Chapter content is unverified for: Class 3 Maths "Toy Joy" (sources disagree: 3D shapes vs numbers to 99), Class 4 Maths "Hide and Seek" (chapters "Elephants, Tigers and Leopards" to "Data Handling" were re-aligned to the syllabus topics in sync 155), Class 4 Maths ch.10 title (one site says "Play with Patterns"), Class 4 EVS ch.9 title (one site says "Changing Families"). Check against the textbooks.
- One lesson per chapter only; Tamil text and audio not yet done.

Sync 128 (Class 4 maths verification): Transport Museum is a multiplication-tables chapter (times 10, times 5, times 15), so the money lesson was removed and two tables lessons added; Elephants, Tigers and Leopards got two more lessons (adding/subtracting counts, numbers and their reverse); Hide and Seek got a views-and-maps lesson. Sources disagree on the Hide and Seek content (views/maps vs four-digit place value); both ideas now covered. Still not checked against the textbook text itself.

Sync 129 (English, Classes 3, 4, 6, 7): 15 grammar and writing lessons added as an English subject (Santoor for 3 and 4, Poorvi for 6 and 7). Honest gap: they are grammar/skill lessons, NOT chapter-by-chapter lessons of the reading texts (stories/poems), because the full chapter lists were incomplete or conflicting online and the texts are copyrighted. Class 3 Santoor chapters seen: Colours, Badal and Moti, Best Friends, Out in the Garden, Talking Toys, Paper Boats, The Big Laddoo, Night, Chanda Mama Counts the Stars, Chandrayaan. Class 4 Santoor: Together We Can, The Tinkling Bells, Be Smart Be Safe, One Thing at a Time, The Old Stag, Braille, The Swing, A Journey to the Magical Mountains, Maheshwar.

Sync 130-133: Tamil-teacher voices (jaya, murali via tools/tamil-voice-trial/serve.py on port 8090, used by Generate-Lesson-Audio.bat as a second step; NOT yet run). Second topic added to every Class 3, 4, 6, 7 maths/EVS/science/social chapter that had only one (about 70 new lessons). Honest gap: most chapters now have 2 topics, not the 3 to 6 a full chapter needs; topic lists are from subject knowledge and syllabus summaries, not the textbook text; Class 7 and 6 science/social topic choices not yet checked against the textbooks.

Sync 134 (pictures for hand-made Class 3 and 6 maths boards): added tool apps/api/src/tools/add-board-pictures.ts (adds a relevant emoji only into empty board space, only when the thing is named, never people or story characters, never things the board already draws). Result: nothing needed adding. The hand boards already draw what the teacher names (roti = circle, plates = circles, bags = rectangles, solids = 3D solids, clock = clock); extra emoji would duplicate or clutter them. Three Class 6 boards (lines-and-angles, patterns, constructions) use freehand paths whose size cannot be measured, so they are skipped. The 6 dense Class 6 boards have no free space.

## Textbook verification (syncs 141-145)
- Class 6 and 7 maths, science and social science: chapter titles and section lists checked against NCERT 2026-27 (via public indexes). Chapters now have 4-5 topics each. Lessons are written in our own words from section titles and subject knowledge, not copied from the textbook.
- Topics that are not in the textbook were kept and labelled "(additional, not in the textbook)".
- Class 3 and 4 maths: chapter titles match Maths Mela. Class 3 chapters whose content differed (Toy Joy, Fun with Shapes, Fun at Class Party, Surajkund Fair) got textbook-aligned topics.
- Class 3 English (Santoor): all 12 story and poem chapters added as theme, vocabulary and retelling lessons. Detailed plot summaries were not available, so these lessons are theme-level only.
- Still open: Class 3 EVS (Our Wondrous World) and Class 4 EVS/English chapter checks; English story chapters for Classes 4, 6, 7; Class 4 maths 10-14 content; Tamil for new lessons.

## Textbook verification, part 2 (syncs 146-149)
- Search added: top-bar search box on every page except lessons, "/" shortcut, and filter boxes on subject, chapter, notebook and mistakes lists. Admin switches are in Features. Searching lesson text and reports is not built yet.
- Class 3 EVS (Our Wondrous World, 12 chapters) and Class 4 EVS (10 chapters): chapter titles match the NCERT listings, except Class 3 chapters 4, 9 and 11 which were not confirmed. One textbook-aligned topic was added to each chapter.
- English story and poem chapters added as theme and vocabulary lessons only: Class 4 Santoor (12 chapters), Class 6 Poorvi (16), Class 7 Poorvi (15). Chapter titles are verified, but lessons do not retell the stories because the text was not read.
- Still open: Class 6 and 7 English chapter lists don't have grammar mapped to the Poorvi units, so grammar chapters stay as extra; Tamil for new lessons; Class 4 maths 10-14 content.
