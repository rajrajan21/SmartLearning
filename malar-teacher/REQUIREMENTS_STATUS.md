# Malar Teacher – requirements and status

Written by Claude on 13 Nov 2026. Read together with PROJECT_NOTES.md (technical notes for resuming work).

Status words: **Done** = built and checked by Claude with a stand-in voice. **Built, unconfirmed** = built but never seen or heard working on the laptop. **Partial**. **Not started**. **Not possible as asked**.

## 1. Requirements and status

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | Teacher model with voice-over explaining concepts in English | Working, not yet listened to | Engine confirmed generating speech on the laptop 13 Nov; owner must judge the sound |
| 2 | No dependence on outside AI services or AI keys | Done | Speech runs from our own server on the laptop; lessons, questions and doubts are rule-based |
| 3 | Interactive: stops, asks if understood, answers doubts from the notes | Done | Check-ins, explain again, example, story, another way, activity, doubts |
| 4 | Friendly, casual, says "good question", not robotic | Done | If asked directly, she says she is a computer teacher |
| 5 | Phrases should not repeat | Done | A phrase is not reused until the rest of its list is used |
| 6 | Each teacher has their own words for the same meaning | Done | Six personalities; only Malar's was exercised in a test |
| 7 | Small jokes to make students comfortable | Done | One joke per lesson |
| 8 | Animated human-like teacher, not a cartoon | Partial | Six original 3D teachers; game-character quality |
| 9 | Looks like a filmed person / video call | Not possible as asked | Live 3D cannot look filmed; needs recorded video or GPU video generation |
| 10 | Lip-sync matching the voice exactly | Built, unconfirmed | Mouth shapes are timed by the speech engine's own data |
| 11 | Natural voice, natural accent | Built, unconfirmed | American, British and trial "Indian tone" voices |
| 12 | Indian English (fluent / regular / Tamil-teacher), Tamil, Hindi, Tanglish | Not started | Needs a second engine (Piper, AI4Bharat) |
| 13 | Multiple male and female voices to choose | Built, unconfirmed | 13 voices in the menu |
| 14 | Customisable avatars, men and women, 5–10 Indian teacher styles | Done | 3 women in sarees, 3 men in suits |
| 15 | More lifelike faces | Not started | Free route: Avaturn avatars made by the owner |
| 16 | Teacher name changeable | Done | |
| 17 | Greets by time of day and by student name | Done | |
| 18 | Studio / classroom setting, teacher left, board right | Done | |
| 19 | Board: titles, notes, calculations, drawing | Done | |
| 20 | Shows pictures and flows | Partial | Hand-drawn diagrams per lesson; no photos |
| 21 | Arms and hands move; zoom out to the board and back | Done | Open-source skeleton; two camera views |
| 22 | Finger points at the board and at each side of a figure | Partial | Board parts light up in step with speech in 4 of 5 lessons (not Nouns and Verbs, which has no figure); the hand is a fist, not a pointing finger |
| 23 | More natural body movement | Partial | Breathing and weight shift; talking hand gesture switched off 13 Nov because it moved wrongly; no motion-capture clips |
| 24 | Speech generated instantly | Partial | Measured: 6.3 s to make 4.2 s of new speech (1 thread); repeats 16 ms from cache. 4 threads set for next start |
| 25 | Background job preparing the next minute while she talks | Built, unconfirmed | Urgent sentences jump the queue |
| 26 | Fetch content from online sites and videos | Partial | Wikipedia lookup for unknown doubts (untested on a real network); "learn more" links |
| 27 | Teacher asks questions back: multiple choice, true/false, yes/no, one word, tap on picture | Done | All types ran in the Pythagoras lesson |
| 28 | Basic / standard / advanced explanation levels | Done | |
| 29 | Lateral-thinking explanations | Done | "Think of it another way" in all 5 lessons |
| 30 | Story time, practical example to try | Done | In all lessons, for all teachers |
| 31 | Student drawing board | Done | |
| 32 | Teach-back (student explains, teacher checks) | Done | |
| 33 | Microphone: student speaks, teacher answers | Built, unconfirmed | Works only in Chrome/Edge on our own page; uses Google's speech recognition |
| 34 | Grade-based speed / voice level options | Done | Class-level selector and speed slider |
| 35 | Smarter than Siri / Gemini | Not possible as asked | Without AI she only knows what is in the lesson notes |
| 36 | More lessons | Partial | 5 lessons: Photosynthesis, Pythagoras, Fractions, Water Cycle, Nouns and Verbs |
| 37 | CBSE classes 3–7 maths, science, social science, English, Tamil; every chapter and topic | Not started | One book downloaded (fecu1dd.zip, believed Class 6 Science) |
| 38 | Matriculation 10th, same subjects, every chapter and topic | Not started | |
| 39 | Question papers, book pages and pictures copied from websites | Will not do | Copyright; lessons are written fresh, with links to the official pages |
| 40 | A way to test before putting it on the website | Done | Start Malar Teacher.bat and the Tester panel |
| 41 | End-to-end test by Claude on the laptop | Not done | The browser pane could not reach localhost:8080 |
| 42 | Test on Android phone | Not started | |
| 43 | Free only | Done | Everything used so far is free and open-source |
| 44 | Put it on the real website / hosting | Not started | |

## 2. What was done, in order
1. Version 1: a single web page with a cartoon teacher, browser voice, board, check-ins, quizzes and doubts.
2. Decision: our own speech server on the laptop (HeadTTS / Kokoro), fully original avatars from MakeHuman open-source data.
3. Built a generator that makes 3D teachers with speech mouth shapes; made six Indian-style teachers; added sarees, bindi, suits.
4. Built the speech server (cache, priority queue, Wikipedia lookup) and the 3D classroom player.
5. Added the skeleton, arm gestures, two camera views, teacher-left layout.
6. Added personalities, non-repeating phrases, three more lessons, lateral thinking, stories, activities, teach-back, drawing board.
7. Added board highlighting in step with speech, new question types, explanation levels, jokes, spoken answers, finger curl.
8. Fixed the voice-engine start-up bug found in server.log; added logging of why the engine is not ready.
9. Downloaded the first NCERT book through the browser.

## 3. What only the owner can do
1. **Run the voice test.** Close all black windows, double-click Start Malar Teacher.bat, wait five minutes, tell Claude. Then listen and say which voices sound acceptable.
2. **Judge the look.** Watch the teachers on the real screen and say what is not acceptable.
3. **Decide the realism route.** Keep the open-source faces, or create Avaturn avatars (free for non-commercial use; check their terms), or commission a model.
4. **Decide the content order.** Which class and subject first; confirm that "Matriculation 10th" means the Tamil Nadu state board; English or Tamil medium.
5. **Review lessons.** A teacher or the owner should read each lesson before children use it.
6. **Permissions.** Ask publishers if any textbook text, pictures or question papers are to appear on the site.
7. **Hosting.** Choose and pay for (or sign up to a free tier of) the server for the public site, and the GPU server if Indian-language voices need one.
8. **Phone test.** Try it on an Android phone.

## 4. What Claude can continue with
- Fix whatever the next server.log shows.
- Second voice engine for Indian English, Tamil and Hindi.
- Board highlight cues for the other four lessons; a proper pointing finger.
- Download the remaining NCERT books and write lessons chapter by chapter.
- Wire in more lifelike avatar files once they exist.
