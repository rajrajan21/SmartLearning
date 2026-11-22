import asyncio
import json
import os
import sys
import urllib.request

from importlib.machinery import SourceFileLoader

segmenter = SourceFileLoader("speaker", os.path.join(os.path.dirname(__file__), "speak-kani-queue.py")).load_module()
url = "http://127.0.0.1:18180"


async def speak(text, voice, speed):
    request = urllib.request.Request(url + "/api/speak", json.dumps({
        "text": text, "voice": voice, "speed": speed, "priority": "low",
    }).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=240) as response:
        answer = json.load(response)
    for key in ("words", "wtimes", "wdurations"):
        answer.setdefault(key, [])
    return answer


print(json.dumps(asyncio.run(segmenter.record(json.load(sys.stdin), speak))))
