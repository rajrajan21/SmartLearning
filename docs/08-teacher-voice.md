# Teacher voice and board (Module 4)

## How the voice works
1. Lessons contain `teacher_narration` blocks: sentences with English (and Tamil) text and optional board actions (write, draw, point, clear).
2. **Audio is recorded once, ahead of time**, by your own Malar Teacher speech engine (Kokoro, runs on the laptop, no keys, no internet). Run `Generate-Lesson-Audio.bat` (with `Start Malar Teacher.bat` already running). It makes a small mono MP3 (about 6 KB per second) per sentence in `content/audio/files/` and records timings in `content/audio/manifest.json`.
3. It is incremental: a sentence is generated only when its text, voice, speed or language changed. `--prune` removes clips no lesson uses any more.
4. The API adds `audio` (URL, length, word timings) to each sentence when serving a lesson, so recording audio never changes a lesson's version. Clips are served from `/api/v1/audio/<hash>.mp3` with a one-year immutable cache and range support.

## Teachers and voices
`content/audio/voices.json` maps a lesson's `teacher` id to the engine voice per language. Today: `malar` -> English `af_heart`. Add Tamil here (`"ta": { "voice": "...", "speed": 1 }`) when a Tamil engine exists, then run the audio bat again. More teachers later = more entries.

## Tamil today
The Malar engine is English-only. Until Tamil recordings exist, the player offers the **device's own voice** (browser speech, language ta-IN) when the student's phone has a Tamil voice; otherwise Tamil students read the text. This is an admin switch (Lessons panel > "Use the device's own voice...").

## In the player
Listen / Pause / From the start, speed control, automatic next sentence, highlight of the sentence and the word being spoken, and the teacher's chalkboard that draws and writes in step with the speech (with a dashed ring on what she points at). All can be switched off per site in Admin > Lessons.

## Storage and cost
About 6 KB per second of speech: a 3-minute lesson is about 1 MB per language. 1,000 lessons is about 1 GB; Cloudflare R2's free 10 GB covers this. Files are in git for now (fine up to a few hundred MB); move `content/audio/files` to R2 before that.

## Known gaps
- Offline playback of recordings is not cached yet (text and lessons are).
- Tamil recordings and Hindi: need an engine (Module 4b; candidates AI4BHarat/Indic Parler-TTS, Piper), generated once at publish time.
- Lip-sync video is a later module; the word timings are already stored for it.
