# Small local speech server for the Tamil-teacher Indian English voices (Indic Parler-TTS, free, offline).
# Same /api/speak shape as the Malar Teacher server, so Generate-Lesson-Audio.bat can use both. Port 8090.
import sys, os, io, json, base64, wave, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
here = os.path.dirname(os.path.abspath(__file__))
loc = os.path.join(here, "model", "indic"); t5 = os.path.join(here, "model", "t5tok")
os.environ["HF_HUB_OFFLINE"] = "1"
import torch, numpy as np
from transformers import AutoTokenizer, PreTrainedTokenizerFast
from parler_tts import ParlerTTSForConditionalGeneration
torch.set_num_threads(max(1, (os.cpu_count() or 4) - 2))
model = ParlerTTSForConditionalGeneration.from_pretrained(loc)
def load_tok(d, pad):
    f = os.path.join(d, "tokenizer.json")
    return PreTrainedTokenizerFast(tokenizer_file=f, pad_token=pad, eos_token="</s>", unk_token="<unk>")
tok = load_tok(loc, "<unk>"); dtok = load_tok(t5, "<pad>")
DESC = {
 "parler:woman": "Jaya speaks in a clear, warm, friendly Indian English accent like a Tamil school teacher, at a slow and steady pace, with very clear pronunciation. The recording is very high quality with no background noise.",
 "parler:woman-ta": "Jaya speaks Tamil in a clear, warm, friendly voice like a Tamil school teacher, at a slow and steady pace, with very clear pronunciation. The recording is very high quality with no background noise.",
 "parler:divya-ta": "Divya speaks Tamil with natural warmth, conversational expression, and clear Tamil Nadu classroom diction, close-sounding studio recording with no background noise.",
 "parler:man-ta": "Karthik speaks Tamil in a clear, calm, friendly voice like a Tamil school teacher, at a slow and steady pace, with very clear pronunciation. The recording is very high quality with no background noise.",
 "parler:man": "A male Indian teacher speaks in a clear, calm, friendly Indian English accent like a Tamil school teacher, at a slow and steady pace, with very clear pronunciation. The recording is very high quality with no background noise.",
}
lock = threading.Lock()
def speak(text, voice):
    d = dtok(DESC[voice], return_tensors="pt"); p = tok(text, return_tensors="pt")
    with lock:
        torch.manual_seed(7)  # same seed: the same teacher voice for every sentence
        g = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask, prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
    a = g.cpu().numpy().squeeze().astype("float32")
    a = np.clip(a, -1, 1); pcm = (a * 32767).astype("<i2")
    sr = model.config.sampling_rate
    b = io.BytesIO()
    with wave.open(b, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
    dur_ms = max(1, int(round(len(pcm) / sr * 1000)))
    words = [w for w in text.split() if w]
    step = dur_ms / max(1, len(words))
    return {
        "audio": base64.b64encode(b.getvalue()).decode(),
        "words": words,
        "wtimes": [int(round(i * step)) for i in range(len(words))],
        "wdurations": [int(round(step)) for _ in words],
    }
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, obj):
        s = json.dumps(obj).encode(); self.send_response(code); self.send_header("content-type", "application/json"); self.send_header("content-length", str(len(s))); self.end_headers(); self.wfile.write(s)
    def do_GET(self):
        self._send(200, {"tts": True, "engine": "indic-parler-tts"})
    def do_POST(self):
        try:
            n = int(self.headers.get("content-length", "0")); req = json.loads(self.rfile.read(n))
            v = req.get("voice", "parler:divya-ta")
            if v not in DESC: return self._send(400, {"error": "unknown voice"})
            self._send(200, speak(req["text"], v))
        except Exception as e:
            self._send(500, {"error": str(e)})
print("Tamil-teacher voices ready on port 8090", flush=True)
ThreadingHTTPServer(("127.0.0.1", 8090), H).serve_forever()
