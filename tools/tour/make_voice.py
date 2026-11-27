#!/usr/bin/env python3
"""Tour voice-over: one WAV per script line + timings.json. Free and offline.
  python make_voice.py --lang en --work <dir> [--engine auto|malar|kokoro|parler|translate]
engines: malar  = the Malar Teacher speech server on :8080 (same Kokoro voice as the lessons; used on the owner PC)
         kokoro = kokoro-onnx with the model files in <dir>/models (kokoro.onnx, voices.bin) (used when no server is running)
         parler = the Tamil-teacher server on :8090 (Tamil). Without it the Tamil video is built with captions and music only (voice pending).
         translate = online Google Translate speech, converted to mono WAV with FFmpeg.
"""
import argparse, base64, io, json, os, subprocess, sys, textwrap, wave, urllib.parse, urllib.request

ap = argparse.ArgumentParser()
ap.add_argument("--lang", default="en"); ap.add_argument("--work", required=True); ap.add_argument("--engine", default="auto")
ap.add_argument("--script", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json"))
a = ap.parse_args()
script = json.load(open(a.script, encoding="utf8"))
out = os.path.join(a.work, "audio", a.lang); os.makedirs(out, exist_ok=True)

def up(url):
    try:
        with urllib.request.urlopen(url, timeout=4) as r: return json.loads(r.read()).get("tts") is True
    except Exception: return False

def post(url, body):
    rq = urllib.request.Request(url, json.dumps(body).encode(), {"content-type": "application/json"})
    with urllib.request.urlopen(rq, timeout=600) as r: return json.loads(r.read())

engine = a.engine
if engine == "auto":
    if a.lang == "ta": engine = "parler" if up("http://localhost:8090/api/health") else "none"
    else: engine = "malar" if up("http://localhost:8080/api/health") else "kokoro"
print(f"[voice] lang={a.lang} engine={engine}")

cfg = script["voice"].get("en", {})
k = None
def speak(text):
    global k
    if engine == "translate":
        wav = io.BytesIO()
        with wave.open(wav, "wb") as target:
            target.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            for phrase in textwrap.wrap(text, 160, break_long_words=False, break_on_hyphens=False):
                query = urllib.parse.urlencode({"ie": "UTF-8", "client": "tw-ob", "tl": a.lang, "q": phrase})
                request = urllib.request.Request("https://translate.google.com/translate_tts?" + query, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(request, timeout=30) as response:
                    encoded = response.read()
                pcm = subprocess.run(
                    ["ffmpeg", "-v", "error", "-i", "pipe:0", "-ac", "1", "-ar", "24000", "-f", "s16le", "pipe:1"],
                    input=encoded, stdout=subprocess.PIPE, check=True,
                ).stdout
                target.writeframes(pcm)
        return wav.getvalue()
    if engine == "malar": return base64.b64decode(post("http://localhost:8080/api/speak", {"text": text, "voice": cfg["voice"], "speed": cfg["speed"]})["audio"])
    if engine == "parler": return base64.b64decode(post("http://localhost:8090/api/speak", {"text": text, "voice": "parler:divya-ta"})["audio"])
    if engine == "kokoro":
        import soundfile as sf
        from kokoro_onnx import Kokoro
        if k is None: k = Kokoro(os.path.join(a.work, "models", "kokoro.onnx"), os.path.join(a.work, "models", "voices.bin"))
        s, sr = k.create(text, voice=cfg["voice"], speed=cfg["speed"], lang="en-us")
        b = io.BytesIO(); sf.write(b, s, sr, format="WAV", subtype="PCM_16"); return b.getvalue()
    return None

def dur(raw):
    with wave.open(io.BytesIO(raw)) as w: return w.getnframes() / w.getframerate()

lines, n = [], 0
for sc in script["scenes"]:
    for i, ln in enumerate(sc["lines"]):
        text = ln.get(a.lang, "").strip(); n += 1
        path = os.path.join(out, f"{n:02d}.wav"); d = None
        if engine != "none" and text:
            if not os.path.exists(path) or os.path.getsize(path) < 1000 or os.path.exists(path + ".stale"):
                raw = speak(text); open(path, "wb").write(raw)
            d = dur(open(path, "rb").read())
        else:
            # no voice: reading-pace placeholder so captions still time well (about 2.3 words a second, Tamil about 1.7)
            words = max(1, len(text.split())); d = words / (1.7 if a.lang == "ta" else 2.3); path = None
        lines.append({"scene": sc["id"], "idx": i, "n": n, "text": text, "wav": path, "dur": round(d, 3), "voiced": path is not None})
        print(f"  {n:02d} {d:5.1f}s  {text[:60]}")
json.dump({"lang": a.lang, "engine": engine, "lines": lines}, open(os.path.join(a.work, f"timings.{a.lang}.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
