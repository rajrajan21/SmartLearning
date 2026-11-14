# Practice rounds (Module 5)

Four rounds per topic: 1 Warm-up (recognise), 2 Remember, 3 Apply, 4 Challenge. Questions live in `content/questions/<board>-<class>-<subject>-<chapter>-<topic>.json` (QuestionImport) and are imported by `pnpm seed` / the dev server.

## Question types
mcq (every wrong option needs `whyWrong`), true_false, number (tolerance, `wrongAnswers` slips), short (accepted spellings), order (items written in the correct order; students get them scrambled).

## How it works
- Students never receive answers. `POST /api/v1/practice/answers` grades on the server (`grade.ts` is the only decider) and returns correct/incorrect, why-wrong, explanation and the right answer.
- Each question shown gets a new `attemptId` (UUID); resending the same one is safe (no double count). `anonId` is a random UUID kept in the browser until accounts arrive (Module 6). Rate limit: 120 answers/min/IP.
- Rounds: pass mark and questions-per-round come from settings. A round's saved score is the first pass; "Try the missed ones again" is for learning only. Stars: 1 = passed, 2 = 90%+, 3 = 100%. Results are kept on the device (`ss_practice_v1`).
- Lessons: a `quiz` block shows its `questionIds` (question keys) inline as a quick check, using the same card (setting `practice.lessonCheckpoints`).

## Teacher voice in practice
Question stems, explanations, why-wrong lines and the stock praise/encouragement phrases in `content/audio/phrases.json` are all recorded in the one English voice (malar, af_heart, speed 0.92). Feedback plays a random praise or encouragement phrase, then the why-wrong line, then the explanation. No recording yet: the device voice is used if allowed.

## Audio quality (build tool)
`Generate-Lesson-Audio.bat` (Malar Teacher server must be running) generates only missing clips. Each clip is trimmed of silence, levelled to one comfortable loudness, faded at the edges and saved as 64 kbps mono MP3. Symbols and brackets are turned into speakable words (`speechText`). Add `"spoken": {"en": "..."}` to a lesson sentence to control exactly how it is read, and `pauseAfterMs` for a longer breath. A pause between sentences is set in Admin > Lessons (`narration.pauseBetweenMs`).

## Admin settings
Admin > Practice: questions per round, pass mark, unlock rule, shuffling, retries, stars, hints, why-wrong, show right answer, lesson checkpoints, teacher speaks questions/feedback.
