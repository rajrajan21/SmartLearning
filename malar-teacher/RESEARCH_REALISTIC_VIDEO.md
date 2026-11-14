# Realistic AI teacher video: research (14 Nov 2026)

Asked Perplexity (2 questions) and ChatGPT (1 question, with the owner's "make once, store, play by sentence" idea) through Chrome. Their answers agree on the points below. They are research answers, not tests: nobody has yet run any of these tools on our own lesson.

## The owner's idea is sound
Generate the teacher's video and voice ONE time, store each sentence as a clip, and let the site play the saved clips so it feels interactive with no live AI. ChatGPT called this a "pre-generated teacher video engine". Our "Prepare lesson" step already does this for audio (cache/ keyed by voice + speed + sentence). Video clips can use the same key.

## What decides whether it looks real
1. **Clips must join.** Sentences generated one by one change head position, hands and lighting, so the teacher "jumps". Fix: every clip starts and ends in the same neutral pose, same camera, light, clothes and background; play a 3-5 s idle loop (blinking, breathing) in gaps; join with a hard cut at the matched pose (a cross-fade of two talking faces ghosts); keep a little silence at both ends of each clip.
2. **Generate in paragraphs, not single sentences,** for explanations, so the acting stays continuous. Single-sentence clips are for reusable lines (greetings, praise, "let's try an example", corrections, transitions).
3. **Best-quality route: film one real, consenting teacher** (neutral, smile, one-hand explain, two-hand explain, pointing at board, thinking, surprised, idle), then re-render only the mouth for each new sentence with a lip-sync model (MuseTalk, or EchoMimicV3-Flash). Real eyes, skin and posture come from the recording.
4. **Draw the board separately** (slides / SVG / Manim) and put the teacher beside it. Video models cannot be trusted with correct maths text. Teacher on the left, board on the right matches the owner's layout.

## Tools, ranked for this project (both services, merged)
| Rank | Tool | Note |
|---|---|---|
| 1 | HeyGen (Avatar IV / V) | Best paid benchmark; Hindi and Tamil listed. Free plan: 3 watermarked videos a month, 1 minute each. Creator about $29 a month, 600 credits, roughly 12-19 minutes of video. |
| 2 | Synthesia | Good for structured lessons; Basic free allowance about 10 minutes a month; Starter about $19 a month. |
| open 1 | EchoMimicV3-Flash | Needs about 12 GB NVIDIA GPU; Apache-2.0. Best lighter open model. |
| open 2 | LongCat-Video-Avatar 1.5 (May 2026) | Most expressive open model reported; heavy GPU. |
| open 3 | InfiniteTalk, OmniAvatar, Wan2.2-S2V | Need 24 GB+ GPUs. InfiniteTalk drifts after about 1 minute, so cut into 15-30 s pieces. |
| open 4 | MuseTalk 1.5 | Lip-sync over an existing video; MIT code. Official setup is for NVIDIA GPUs. |
| other | Runway Act-Two | Copies a real actor's gestures, 30 s per go. Good for a few key moments only. |
| other | Hedra, D-ID, Veo, Kling, OmniHuman | Not a good fit for thousands of exact-script clips. |
| not available | Sora | Ended in 2026. |

## Our hardware
The i7-1360P laptop has no NVIDIA GPU, and the 2-core ARM Oracle server is too small. Neither can render this video. They are fine for the board, editing, encoding, the database and serving clips. Rendering needs a rented or borrowed GPU, used once during production.

## Free GPU, with the catches
- Kaggle notebooks: free NVIDIA GPU, roughly 30 hours a week (check current terms).
- Google Colab free: limited and not guaranteed; its terms prohibit creating deepfakes, so confirm that realistic-avatar work is allowed before relying on it.
- Hugging Face ZeroGPU: about 5 minutes a day on a free account, only good for tests.
- Cheap paid: Modal (about $30 a month of starter credit) or RunPod (rent a 24-48 GB GPU by the hour). Reported cost for one EchoMimicV3-Flash test: about $0.21 of GPU time for 3.8 s of video on a large GPU; our optimised cost is unknown.
- Do not make the website depend on a running Colab/Kaggle session. Render once, store the files.

## Storage and delivery (ChatGPT's estimate)
720p H.264 at about 1.5 Mbps: 10,000 sentences x 3 languages is about 28 GB; 50,000 is about 140 GB. Keep MP4 files in file/object storage, and only the sentence id, language, voice, clip path, duration, start/end pose and timings in the database. One MP4 per sentence plus a small play-list; preload the next clip. Make full lessons as HLS only if needed. A transparent teacher (WebM alpha) does not work the same on Safari: start with the teacher in a rectangle beside the board.

## Voices
- English: a real Indian-English teacher's recording is the most natural. Kokoro (used now) has American, British and a few "Indian tone" voices, not true Indian English.
- Tamil and Hindi: AI4Bharat IndicF5 (MIT; needs a reference voice with permission) and Indic Parler-TTS (Apache-2.0; covers Indian English, Tamil, Hindi). Newer "Indic-Speak" (Sep 2026) looks promising but is large; check its licence first.
- Keep the three languages sounding like one teacher (similar pitch, pace, warmth). A real teacher who speaks all three would be ideal.
- Voice cloning needs written consent that covers cloning, publishing and removal.

## Face and legal
Use either a real teacher who gives written consent, or a fictional AI-generated face made with a model whose licence allows it. Do not copy a real person's face. Put a short note on the site: "AI-generated presenter; lessons reviewed by an educator."

## Suggested next steps
1. Owner decides the face: film one consenting teacher (recommended), or an AI-generated fictional face.
2. 30-second test of the same passage in HeyGen free (or Synthesia free) and, if a GPU is available, EchoMimicV3-Flash or MuseTalk on Kaggle. Judge: native speakers for voice, the owner for look.
3. Claude builds the clip store: same sentence-hash key as the audio cache, a clips table, a player that plays video clips with idle loops, and the "Prepare lesson" button extended to also make clips.
4. Then scale lesson by lesson; each lesson reviewed by a teacher.
