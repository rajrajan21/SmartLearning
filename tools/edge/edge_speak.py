#!/usr/bin/env python3
"""
Speaks one sentence with a Microsoft Edge neural voice and prints JSON the SharpStudy audio builder understands:
  {"audio": <base64 WAV>, "words": [...], "wtimes": [ms...], "wdurations": [ms...]}
Input (stdin, JSON): {"text": "...", "voice": "en-IN-NeerjaNeural", "speed": 0.92}
Needs:  py -m pip install edge-tts miniaudio
"""
import asyncio, base64, io, json, sys, wave

def mp3_to_wav_b64(mp3: bytes) -> str:
    import miniaudio
    d = miniaudio.decode(mp3, output_format=miniaudio.SampleFormat.SIGNED16, nchannels=1, sample_rate=24000)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(d.sample_rate); w.writeframes(d.samples.tobytes())
    return base64.b64encode(buf.getvalue()).decode("ascii")

async def speak(text: str, voice: str, speed: float) -> dict:
    import edge_tts
    pct = int(round((speed - 1.0) * 100))
    rate = f"{pct:+d}%"
    try: com = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    except TypeError: com = edge_tts.Communicate(text, voice, rate=rate)
    mp3, words, wt, wd = bytearray(), [], [], []
    async for ch in com.stream():
        if ch["type"] == "audio": mp3 += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append(ch["text"]); wt.append(round(ch["offset"] / 10000)); wd.append(round(ch["duration"] / 10000))
    if not mp3: raise RuntimeError("no audio came back from the voice service")
    return {"audio": mp3_to_wav_b64(bytes(mp3)), "words": words, "wtimes": wt, "wdurations": wd}

def main():
    req = json.loads(sys.stdin.read())
    out = asyncio.run(speak(req["text"], req["voice"], float(req.get("speed", 1))))
    sys.stdout.write(json.dumps(out))

if __name__ == "__main__":
    try: main()
    except Exception as e:
        sys.stderr.write(f"{type(e).__name__}: {e}\n"); sys.exit(1)
