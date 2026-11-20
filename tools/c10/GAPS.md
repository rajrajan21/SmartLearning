# CBSE Class 10 gaps (2026-11-17)
- Done: Maths 28, Science 26 (2 Heredity lessons), Social Science 22 (Geography 7, Economics 5, History 5, Political Science 5; one lesson per chapter), English 18 (First Flight prose 9, Footprints without Feet 9).
- Not done: First Flight poems (10), Words and Expressions 2 workbook (grammar/writing practice), Health and Physical Education (jehp, 13 chapters; textbook present).
- Hindi: no Class 10 Hindi textbook in content/books/pdf/class-10 (only English, Maths, Science, Social Science, PE and a Tamil State Board PDF). Needs the books first.
- Tamil: the PDF there is the Tamil Nadu State Board Class 10 Tamil book (not CBSE); its text layer is garbled (doubled Tamil glyphs) and there is no tam OCR model in the VM. Left for the Matric/State Board job.
- Social Science lessons are one lesson per chapter (more compact than Maths/Science); History/Economics/Civics facts checked against the book text only where noted; split into more lessons later if wanted.
- English lessons summarise in our own words (no textbook text reproduced); exercises/grammar sections are not covered.
- Tests: pnpm/vitest cannot run from the Linux VM (Windows node_modules links). Run pnpm test on the PC. Only the validator tools/c10/validate.py (0 problems, 94 lessons) was run.
- Not generated: audio (run Generate-Lesson-Audio.bat) and classroom animations (run Build-Visuals.bat so the new lessons get auto-*.json pages).
