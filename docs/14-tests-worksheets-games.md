# Module 10: chapter tests, worksheets and games

All three are built from the practice questions of a chapter (every published question across its topics), so new questions appear in them automatically. Links sit on each chapter page.

## Chapter test - `/exam/:board/:class/:subject/:chapter`
- N random questions (default 10), optional time limit (default 60 s per question).
- Answers are kept in the browser and are NOT marked while the test runs. At the end (or when time is up) each is sent to the normal server grading, so the results also count in the parent dashboard.
- Result: score, pass mark, and a review of every question with the right answer and explanation. Skipping can be switched off. Best score is saved on the device.

## Worksheet - `/worksheet/:board/:class/:subject/:chapter`
- Printable page (menus hidden when printing) with name/date lines, answer spaces and a footer.
- Answer key: `POST /api/v1/practice/answer-key` works only for a signed-in parent and only while `worksheets.answerKey` is on. Visitors who are not signed in never receive answers.

## Games - `/play/quickfire/...` and `/play/survival/...`
- Quick Fire: beat the clock (default 60 s). Three Lives: play until the lives run out. Tap-to-answer questions are used first to keep play fast.
- Answers are graded by the server like practice. Best scores are kept on the device.

## Admin switches (panel "Tests, worksheets and games")
feature.exams, feature.worksheets, feature.games; exams.questionCount, exams.timed, exams.secondsPerQuestion, exams.passPercent, exams.allowSkip, exams.showReview; worksheets.questionCount, worksheets.answerKey, worksheets.nameLine, worksheets.footer; games.quickfire, games.quickfireSeconds, games.survival, games.lives.

## Notes
- Best scores are per device (not synced to the account yet).
- Games send one answer per question; the practice rate limit (120 a minute) is far above what a child can play.
