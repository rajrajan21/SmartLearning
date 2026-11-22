import asyncio
import base64
import io
import json
import re
import sys
import wave

sys.path.insert(0, "/opt/studysmart/tools/edge")
from edge_speak import speak


def chunks(text):
    while len(text) > 440:
        breaks = list(re.finditer(r'[.!?;]\s+', text[:440]))
        cut = breaks[-1].end() if breaks and breaks[-1].end() >= 200 else text.rfind(" ", 0, 440)
        if cut <= 0:
            cut = 440
        yield text[:cut].strip()
        text = text[cut:].lstrip()
    if text:
        yield text


async def record(request, voice_engine=speak):
    texts = list(chunks(request["text"]))
    if len(texts) == 1:
        return await voice_engine(texts[0], request["voice"], request["speed"])
    result = {"words": [], "wtimes": [], "wdurations": []}
    output = io.BytesIO()
    frames = 0
    with wave.open(output, "wb") as writer:
        writer.setnchannels(1)
        writer.setsampwidth(2)
        writer.setframerate(24000)
        for text in texts:
            part = await voice_engine(text, request["voice"], request["speed"])
            with wave.open(io.BytesIO(base64.b64decode(part["audio"]))) as clip:
                if (clip.getnchannels(), clip.getsampwidth(), clip.getframerate()) != (1, 2, 24000):
                    raise ValueError("Unexpected voice audio format")
                writer.writeframesraw(clip.readframes(clip.getnframes()))
                offset = round(frames / 24)
                frames += clip.getnframes()
            result["words"].extend(part["words"])
            result["wtimes"].extend(offset + time for time in part["wtimes"])
            result["wdurations"].extend(part["wdurations"])
    result["audio"] = base64.b64encode(output.getvalue()).decode("ascii")
    return result


if __name__ == "__main__":
    print(json.dumps(asyncio.run(record(json.load(sys.stdin)))))
