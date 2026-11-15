# Malar Teacher – project notes (for resuming work in a new chat)

Give this file to Claude if a new conversation is started: "Read PROJECT_NOTES.md in my Malar Teacher folder and continue."

## Decisions made
- No outside AI services or API keys. Speech = our own local API (HeadTTS / Kokoro neural voices, MIT + Apache 2.0) run with Node.js on our own machine; it returns audio + Oculus viseme timings for exact lip-sync.
- Avatars = fully original, built from MakeHuman CC0 data (base mesh + macro targets from the MPFB2 repo, assets from the "MakeHuman system assets", "Visemes 02" and "Faceunits 01" packs). No Ready Player Me (shut down Jan 2026), no TalkingHead (needs an RPM-style skeleton; ours use morph targets only).
- First test = English on the laptop (i7-1360P, no GPU). Indian English / Tamil / Hindi / Tanglish come later (Piper, AI4Bharat VITS, or Indic Parler-TTS generated once at publish time and cached).
- 6 teachers, Indian professional style: malar, kavitha, priya (saree + bindi), arun, karthik, rajan (suit).

## What exists
- public/avatars/*.glb – six teachers. Morph targets: viseme_aa,E,I,O,U,PP,SS,TH,CH,FF,kk,nn,RR,DD, blink, browUp, browDown, smile, headYaw, headPitch, headRoll.
- public/avatar.js – three.js renderer (class Avatar: load(url), speak(timeline, clock), stop()).
- public/vendor – three.js r170 + GLTFLoader (local copies, no CDN).
- tools/build_avatars.py – the generator (numpy + Pillow). Needs: MPFB2 repo `src/mpfb/data` (base.obj, targets/macrodetails) and the unzipped asset packs. Paths A / D / OUT are at the top of the file.
- tools/version1_cartoon_player.html – first version (cartoon teacher, browser voice). Its lesson engine, chalkboard, check-ins, quiz and doubt-answering code is reused in the 3D player.
- _build/assets_subset.zip – the subset of MakeHuman assets used by the generator.

## Status (13 Nov 2026, later)
- DONE: server.mjs = own speech API on http://localhost:8080 (/api/health, /api/speak with disk cache + priority queue: sentences needed now jump ahead of background prefetch; /api/lookup = Simple English Wikipedia search for doubts not in the notes). Starts HeadTTS on port 8882 with cwd = its own folder (the first version used the project folder and the engine could not find its worker file).
- DONE: avatars now have MakeHuman's CC0 "game_engine" skeleton (55 bones, skin weights from MPFB2 data/rigs/standard). avatar.js: close-up "talk" scene and wide "board" scene (camera pulls back, right arm raised toward the board), hand gestures while talking, time-based smoothing.
- DONE in the player: non-repeating phrase picker with larger phrase lists, lookahead prefetch of the next 3 lesson steps, story mode ("Tell it as a story"), teach-back at the end of a lesson, student rough-work drawing board, "learn more" links.
- DONE (latest): layout is teacher LEFT, board RIGHT (left arm goes to the board). 5 lessons (Photosynthesis, Pythagoras, Fractions, Water Cycle, Nouns and Verbs). Each check-in offers: explain again / example / story / "think of it another way" (lateral) / doubt. PERSONA table in index.html gives each of the 6 teachers their own greeting, check-in, praise, correction and goodbye sentences.
- DONE (latest 2): board highlighting in step with speech (lesson steps carry hl cues; SVG parts carry data-k; uses word timings from the speech API), 3-4-5 worked figure, "Something to try myself" activities, breathing/weight-shift motion.
- REQUESTED, NOT STARTED: second voice engine option (Piper / AI4Bharat) for Indian English, Tamil, Hindi; motion-capture body animation (free only); more lifelike faces; finger posing (pointing index finger).
- DONE (latest 3): question types (multiple choice, true/false, yes/no, one-word typed or spoken, tap-on-the-picture), explanation level selector (Basic / Standard / Advanced, steps with level:2 are advanced-only), one joke per lesson, spoken answers routed through the mic (route()), finger curl on the hands.
- 13 Nov 07:17 UTC run: engine started without the old error and the model cache reached 293 MB, but 'Voice engine is ready' never appeared in 12 minutes and Claude could not reach http://localhost:8080 from the built-in browser. server.mjs now logs why it is not ready every 30 s. NEXT STEP: run the start file, wait 5 minutes, let Claude read server.log.
- NOT DONE, user asked: bulk CBSE class 3-7 (maths, science, social) and Matriculation 10 content. Claude will not bulk-copy textbooks or question papers from websites (copyright); plan is original lessons written chapter by chapter against the official syllabus list.
- 13 Nov 07:38 UTC: REAL VOICE ENGINE CONFIRMED WORKING on the laptop (Claude called /api/speak from the browser pane: audio + word and viseme timings returned; cache hit 16 ms). Problem: about 6.3 s to generate 4.2 s of speech with 1 thread, so first-time playback has gaps. server.mjs now uses 4 threads (takes effect at next start); the greeting is requested before any prefetch. Nobody has yet LISTENED to the voice.
- TESTED by Claude only with a stand-in speech engine. NOT yet confirmed: real Kokoro voice on Windows, Wikipedia lookup on a real network, arm poses on a real GPU. If something fails, send Claude server.log.
- Known limits: game-quality avatars (filmed-human realism is not possible with real-time 3D); English only; fingers do not move; the hand points at the board but does not touch the letters.
- Extra asset zips the user downloaded and Claude has NOT used yet: dress01/02/03, bodyparts05/06 (moustaches, beards), eyebrows01, eyelashes01, arms01, cheek01, ears01, haireditor. dress02, dress03 and bodyparts06 are CC-BY (need credit).
- 13 Nov (owner's test): the voice engine MUST run on cpu / fp32. The graphics-chip setting ("webgpu") and the lighter "q8" model were both much slower on this laptop. Do not try them again here.
- 14 Nov: Start Malar Teacher.bat fixed. It used to stop at "Press any key to continue" because the line that starts the server was missing; it now sets TTS_DEVICE=cpu and TTS_DTYPE=fp32 and runs `node server.mjs`. server.mjs also defaults to cpu / fp32 by itself (no webgpu attempt). Old copies are in _backup/.
- 14 Nov: PREPARE LESSON built (not yet run on the Windows engine). server.mjs: POST /api/prepare {texts, voice, speed, start, cancel} generates every missing sentence once into cache/ at background priority and reports {total, ready, missing, queued, busy, failed}. public/index.html: "Prepare a lesson" panel on the start screen (Prepare this lesson / Prepare all lessons / Stop, progress bar, time left); lessonTexts(L) lists every sentence a lesson can speak for the chosen teacher, voice, speed and student name; prepared lessons get a green tick. Changing voice, speed, teacher or student name means preparing again (only the changed sentences are made).
- 14 Nov: found the cause of the pause between sentences: the engine puts about 0.3 s of silence before and 0.5 s after every sentence. The player now trims that (trim() in index.html) and keeps a short breath (about 0.3 s).
- 14 Nov: server.mjs never asks for more threads than the machine has cores.
- The voice engine cannot be run from Claude's Linux sandbox (node_modules is a Windows install: "sharp" has no linux build there). Speech can only be generated by starting the .bat on Windows.
- 14 Nov: owner asked how to get close-to-real human teacher video with voice; Perplexity and ChatGPT were asked through Chrome. Summary and recommendation are in RESEARCH_REALISTIC_VIDEO.md. Owner's architecture: generate once, store clips per sentence, play by sentence so it feels interactive. NEXT: owner picks the face (real consenting teacher vs fictional AI face); 30 s comparison test; then build the clip store beside cache/.
- 14 Nov: the prepare job is slow when the browser is busy: about 10-15 s per sentence on this laptop (200 sentences for one lesson takes about 30 min). Close other heavy windows while preparing.
- 14 Nov DECISION (owner): NO filming of a real teacher. The teacher will be a FICTIONAL AI-generated face, made only with free/open-source models. Sentence clips are generated once (audio from our speech cache + video), stored, and played by sentence. Owner wants real engineering effort on making clips join seamlessly. Design and plan: PLAN_SEAMLESS_CLIPS.md.
- 14 Nov (night) STATE: Photosynthesis audio is fully prepared (200/200, voice af_heart, speed 1, name Kavin) and plays from cache; not yet listened to by the owner. Clip storage folder created by owner: D:\Malar Teacher Clips (connected; tools read CLIPS_DIR). tools/clips/*.py (contract, audio, conform, joincheck, makeloop, build_manifest, make_standin) are WRITTEN BUT NOT YET TESTED: the first run of make_standin.py hung inside write_video (ffmpeg itself works; suspect the rawvideo pipe + wav input, test with a temp file and timeouts). Not yet done: server /clips route with Range support (needs a server restart), public/clipplayer.js, index.html integration, notebooks/kaggle_render_DRAFT.py. The D: folder holds only a stand-in anchor.png and idle.mp4 (test pictures, NOT the teacher).

## Ideas received, not done yet
- Better realism: user may try an Avaturn avatar (check licence: free for non-commercial) or commission a custom Indian teacher GLB with the 15 Oculus viseme_* morphs; avatar.js already drives any GLB whose morph targets are named viseme_aa ... viseme_DD (blink / head morphs would need mapping to ARKit names or bones).
- Tamil / Hindi: Piper or AI4Bharat VITS on CPU, or generate with Indic Parler-TTS once at publish time and cache.
- Teaching: spaced repetition (FSRS), mastery model, misconception branches; content from NCERT / Samacheer Kalvi needs a rights check before reuse.

## Still to do
1. First real voice + lip-sync test on the laptop; tune from what is seen and heard.
2. More lessons; Tamil/Hindi voices; hosting.

## 14 Nov (night 2) - clip join tools verified on stand-in clips
- make_standin.py -> build_manifest.py -> joincheck.py ran end to end on 10 test clips in D:\Malar Teacher Clips: 10 PASS, idle loop WARN (worst MAD 1.43), 0 FAIL.
- Fix: joincheck compared clips to the raw PNG anchor, giving a constant ~2.2 MAD codec offset on every clip. contract.load_anchor() now passes the anchor through the same H.264 encode first (clips now ~0.5 MAD).
- NOT yet proven: that joincheck FAILs a bad clip (the deliberately un-eased test clip was not among the 10). Do this next.
- The VM cannot reach huggingface/pytorch/kaggle, so real models cannot run here. Real rendering needs a Kaggle GPU notebook (free ~30 GPU h/week, T4/P100 16 GB) or Colab.
- Face model licence: FLUX.1 [schnell] is Apache-2.0 (commercial OK); SDXL is OpenRAIL++-M; FLUX.1 [dev] is non-commercial - avoid.
- Other open-source models to try on Kaggle (apart from SadTalker/MuseTalk/EchoMimicV3-Flash): LatentSync (best open lip-sync quality, slow), Sonic (strong lip-sync scores), Hallo2/Hallo3, LongCat-Video-Avatar 1.5 (MIT), FLOAT, JoyVASA, LivePortrait. CHECK each licence file before use (several are non-commercial).
- Still to do: /clips route + CLIPS_DIR in server.mjs, public/clipplayer.js, notebooks/kaggle_render_DRAFT.py.
- Start Malar Teacher.bat now sets CLIPS_DIR=D:\Malar Teacher Clips (backup: _backup/Start_bat_before_clips.txt). server.mjs does not serve /clips yet.

## 14 Nov - realistic look decided + Kaggle notebook drafted
- Owner showed 4 Indian AI comedy Shorts (Tamil/Hindi): Pixar-style/semi-real characters in a classroom, with acting and lip-sync. The cartoon stand-in face is only a test fixture; the real look = Pixar-style Malar Teacher.
- Owner agreed: face with FLUX.1 [schnell] (Apache-2.0), animate with open-source talking-avatar/lip-sync models, human Indian voice.
- notebooks/kaggle_render_DRAFT.py (UNTESTED, no GPU here): FLUX schnell (SDXL fallback) -> 4 candidate faces; Indic Parler-TTS voices (ta/hi/en); SadTalker and Sonic renders; contact sheet. Hallo2/EchoMimicV3/LongCat left as stubs. Sonic licence is research/non-commercial - comparison only.
- Needs owner: Kaggle account (phone verified), Internet ON, GPU on.

## 14 Nov (evening) - v2 = original 3D teacher restored for testing
- public_v2/ is a frozen copy of the 3D teacher player (six MakeHuman avatars, 5 lessons: Photosynthesis, Pythagoras, Fractions, Water Cycle, Nouns and Verbs, Prepare-a-lesson panel). Start it with "Start Malar Teacher v2.bat" (sets PUBLIC_DIR=public_v2; same speech cache, so the prepared Photosynthesis audio plays at once). server.mjs now reads PUBLIC_DIR (default public). Backup: _backup/server_before_v2.mjs.
- Run only one start file at a time (both use ports 8080 and 8882). Realistic-video (Kaggle/SadTalker) work stays separate in notebooks/ and D:\Malar Teacher Clips.
- Kaggle sample clips A_sadtalker_en.mp4 / A_sadtalker_ta.mp4 are in the project folder (English and Tamil, SadTalker, placeholder MMS voice).
- 14 Nov (evening): v2 stopped after a few sentences because sentences not yet prepared (e.g. teacher Kavitha, voice af_bella) take 9-19 s each on the CPU engine and say() waited for each. public_v2/index.html say() now waits max 2 s for our voice, otherwise that sentence is spoken by the browser voice (lesson never stalls). Fully natural voice needs "Prepare this lesson" for the chosen teacher/voice/speed/name first (about 30 min per lesson).
