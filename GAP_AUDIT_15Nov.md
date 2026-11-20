# Gap audit against the spec and our own notes (15 Nov 2026)

Method: the 184-item feature catalogue in the ChatGPT specification (section 11), the spec's required screens and
the notes we kept (REDESIGN_NOTES.md, REQUIREMENTS_STATUS.md), compared with what is in the code (settings
registry, routes, question and lesson types). A grep result of zero means "not found in the code".
NOT FOUND: the list of reference websites you gave me earlier is not in any file or past chat I can reach.
The only references on record are the themes in REDESIGN_NOTES.md (Duolingo, Khan, Codecademy, Code.org,
MasterClass, Skillshare, Coursera, Canvas, Notion). Please re-send the list so I can check feature by feature.

## Built (all behind admin switches)
Onboarding, parent and child profiles, consent, sign-in (email, Google, Facebook), progress sync, board and class
catalogue, search, breadcrumbs, prerequisites, recently viewed, saved lessons (heart), lesson blocks (explanation,
story, worked example, summary, diagram, teach-back, quiz), narration and read-aloud, classroom board lessons,
4 practice rounds with hints and why-wrong, true/false, number, order and short answers, timed chapter tests with
review, printable worksheets with parent key, two games, mastery bar and badges, spaced revision, parent
dashboard and weekly summary, grounded AI helper with safety screen and daily limit, textbook reader (3 styles,
read aloud, print, download), invite-code access, themes and palettes, phone app view, streak, certificate,
explore page, journey road, Tamil/English, accessibility (text size, high contrast, reduced motion), admin
console with audit log and backup, parent disclaimer, admin search.

## Not built yet (in the spec or in your instructions)
1. Flashcards and a mistake notebook (items 128-129).
2. Question types: multi-select, matching, diagram labelling, long answer, case-based (items 84, 89-93).
3. Topic diagnostic test, adaptive difficulty, custom exam blueprint, mark-for-review in exams, printable exam
   paper (items 103, 108, 110, 113, 123).
4. School exam papers per term (quarterly, half-yearly, annual) for each subject: your standing instruction.
5. Per-lesson quiz, practice and worksheet tabs for every lesson (only some topics have them).
6. Content report/correction button for students and parents (item 168) and a human review workflow (116, 163).
7. Notification preferences and quiet hours, weekly parent e-mail (needs a free mail service) (142-143, 137).
8. Cross-board concept mapping, learning path across grades (21, 133).
9. Mind maps, science simulations, maps and timelines, project and creative challenges, puzzle of the day,
   daily 10-minute challenge (36, 42-43, 152-156).
10. Teach-back by speech, read-aloud of AI answers, AI answer feedback button (70, 75, 81).
11. Teacher/mentor sharing and portal (146, release 2). Authoring UI/CMS beyond settings.
12. Cost and usage analytics (184), error monitoring (183), real backup schedule on the server (181).
13. Video lessons and lip-sync teacher clips (deferred by your decision); Tamil audio for lessons.
14. Content: all CBSE 3-8, TN Matric and State Board lessons; Tamil text review; subject-teacher review.
15. Deployment on Oracle, DPDP legal read of the privacy text, pilot with 20-30 students.
