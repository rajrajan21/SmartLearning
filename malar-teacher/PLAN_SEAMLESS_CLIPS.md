# Plan: fictional AI teacher, sentence clips that join seamlessly

Owner decision (14 Nov 2026): no filming of a real person. The teacher is a fictional AI-generated face, made only with free/open-source models. Each sentence is generated ONCE (audio from our speech cache + video), stored, and played by sentence so the lesson feels live with no AI running.

## The seamless-join idea: ONE ANCHOR FRAME
Every clip is built so that its FIRST frame and its LAST frame are the same neutral frame, the "anchor" (clips/anchor.png): same camera, crop, light, clothes, background, head position, mouth closed, eyes open.
- Any clip can follow any other clip (or the idle loop) with a hard cut that shows no jump, because both sides of the cut are the same picture.
- Checking is one comparison per clip against the anchor, not one per pair of clips.
- Cross-fading two talking faces is NOT used (it ghosts). We cut at the anchor.

## Rules (the "pose contract", tools/clips/contract.py)
1. 576 x 720 pixels, 25 frames a second, H.264 yuv420p, keyframe every 25 frames, keyframe at frame 0. Audio AAC 48 kHz mono.
2. Audio of each clip: 0.15 s of silence, the sentence, 0.35 s of silence, padded to a whole number of frames, 8 ms fade in and out (no clicks).
3. Anchor easing: the first 5 and last 5 frames of every clip are blended toward the anchor so frame 0 and the last frame equal the anchor exactly (conform.py). The blend is the same face, so there is no double-face ghosting.
4. Idle loop (idle.mp4, about 2 s): tiny breathing and blinking only. Frame 0 = anchor, and every idle frame stays within a small distance of the anchor, so the player may cut from idle to a sentence at ANY moment (no waiting for the loop to end).
5. Gestures and expressions are separate "pose clips" (smile, nod, raised brows, thinking, hand gesture) that also start and end on the anchor. Acting = choosing which clip to play.
6. Explanations are rendered as whole paragraphs when possible (continuous acting); one-sentence clips are for reusable lines (greetings, praise, "let's try an example").

## Automatic checks (tools/clips/joincheck.py)
- First and last frame of every clip against the anchor: mean pixel difference and SSIM. PASS / WARN / FAIL.
- Every idle frame against the anchor (so cuts from idle are safe).
- First and last 10 ms of audio are quiet (no click).
- Frame count equals audio length (no drift between sound and picture).
A lesson is only published when joincheck has no FAIL.

## Playback (public/clipplayer.js)
Two clip <video> elements plus an idle <video>. The next clip is loaded in the hidden element while the current one plays. At the end of a clip the next one starts at once and becomes visible on its first painted frame. If nothing is queued, the idle loop shows. If a sentence has no clip, the existing 3D teacher speaks it (so partial coverage still works).

## Making the video (needs a GPU; not possible on the i7 laptop)
1. Face: generate a fictional Indian woman teacher portrait with an open image model (Stable Diffusion XL base, OpenRAIL++-M licence). Review it; make sure it does not resemble a real person.
2. Idle loop and pose clips from that image (image-to-video / portrait animation).
3. Per sentence: lip-sync from our already-trimmed audio over the idle video frames (MuseTalk, MIT) or audio-driven animation of the face image (SadTalker, Apache-2.0, first test; EchoMimicV3-Flash later).
4. conform.py: trim, snap to anchor, encode. joincheck.py: verify. build_manifest.py: write clips/manifest.json (key = same SHA-1 as the audio cache).
Free GPU: Kaggle notebook (about 30 h a week, check current terms). Colab's terms forbid deepfakes, so avoid it. notebooks/kaggle_render_DRAFT.py is a first untested draft.

## Licence notes to check before publishing
LivePortrait's face-detection files (InsightFace) are research/non-commercial. SDXL, SadTalker, MuseTalk code are permissive, but check every weight file. Put a line on the site: "AI-generated teacher; lessons reviewed by an educator."

## Storage
About 28 GB for 10,000 sentences x 3 languages at 1.5 Mbps. The C: drive has only about 10 GB free: set CLIPS_DIR to a folder on D: (or the server) when the clips grow.
