# Records a few lessons lines with Indic Parler-TTS (free, offline) so you can hear a Tamil-oriented Indian English teacher.
import sys, time, os
here = os.path.dirname(os.path.abspath(__file__))
loc = os.path.join(here, "model", "indic"); t5 = os.path.join(here, "model", "t5tok")
if os.path.isdir(loc): os.environ["HF_HUB_OFFLINE"] = "1"
import torch, soundfile as sf
from transformers import AutoTokenizer, PreTrainedTokenizerFast
from parler_tts import ParlerTTSForConditionalGeneration

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
name = loc if os.path.isdir(loc) else "ai4bharat/indic-parler-tts"
dev = "cuda" if torch.cuda.is_available() else "cpu"
model = ParlerTTSForConditionalGeneration.from_pretrained(name).to(dev)
def load_tok(d, pad):
    f = os.path.join(d, "tokenizer.json")
    if os.path.isfile(f):
        return PreTrainedTokenizerFast(tokenizer_file=f, pad_token=pad, eos_token="</s>", unk_token="<unk>")
    return AutoTokenizer.from_pretrained(d)
tok = load_tok(name, "<unk>")
dtok = load_tok(t5 if os.path.isdir(t5) else model.config.text_encoder._name_or_path, "<pad>")

LINES = [
    "Asha dropped a steel pin in a heap of sand. She could not see it anywhere.",
    "A magnet attracts some things. Things that a magnet attracts are called magnetic.",
    "Iron, steel, nickel and cobalt are magnetic. Plastic, wood, paper and glass are not.",
]
VOICES = {
    "woman": "Jaya speaks in a clear, warm, friendly Indian English accent like a Tamil school teacher, at a slow and steady pace, with very clear pronunciation. The recording is very high quality with no background noise.",
    "man": "A male Indian teacher speaks in a clear, calm, friendly Indian English accent like a Tamil school teacher, at a slow and steady pace, with very clear pronunciation. The recording is very high quality with no background noise.",
}
for vid, desc in VOICES.items():
    for i, text in enumerate(LINES, 1):
        t0 = time.time()
        d = dtok(desc, return_tensors="pt").to(dev)
        p = tok(text, return_tensors="pt").to(dev)
        g = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask, prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
        sf.write(os.path.join(out, f"{vid}-{i}.wav"), g.cpu().numpy().squeeze(), model.config.sampling_rate)
        print(f"{vid} line {i}: {time.time() - t0:.0f} seconds", flush=True)
print("Done. Listen to the .wav files in", out)
