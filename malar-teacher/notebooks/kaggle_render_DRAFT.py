# Malar Teacher - Kaggle sample renderer  (DRAFT, UNTESTED - written without a GPU)
# Goal: make a Pixar-style Malar Teacher, speak 3 sentences (Tamil / Hindi / English) in a human voice,
# and animate them with SEVERAL open-source models so the owner can compare the results.
#
# HOW TO RUN (once):
#  1. kaggle.com -> Create -> New Notebook. Right side: Settings -> Accelerator = GPU T4 x2 (or P100), Internet = ON
#     (Internet needs a phone-verified account).
#  2. Paste each "# %%" block below into its own cell and run them in order. If a block fails, send me the error text.
#  3. Results appear in /kaggle/working/samples (download the .mp4 files and the compare.jpg).
#
# Licences: SDXL base = CreativeML OpenRAIL++-M; Indic Parler-TTS = Apache-2.0; SadTalker = Apache-2.0 (check repo);
# Sonic = non-commercial research licence (CHECK BEFORE USE) - it is here only to compare quality.

# %% 1. install
import subprocess, sys, os, json, textwrap, shutil, glob
def sh(cmd, cwd=None, check=True):
    print('$', cmd); r = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True)
    print((r.stdout or '')[-1500:], (r.stderr or '')[-1500:])
    if check and r.returncode: raise RuntimeError(f'failed: {cmd}')
    return r
sh('pip -q install diffusers transformers accelerate safetensors sentencepiece soundfile')
sh('pip -q install git+https://github.com/huggingface/parler-tts.git')
OUT = '/kaggle/working/samples'; os.makedirs(OUT, exist_ok=True)

# %% 2. the Pixar-style teacher (one image, reused by every model)
import torch
# FLUX.1 [schnell] (Apache-2.0, commercial OK, 4 steps). 12B model: on a 16 GB T4 it needs CPU offload (slow but works).
# If it runs out of memory, set USE_FLUX = False to fall back to SDXL.
USE_FLUX = True
if USE_FLUX:
    from diffusers import FluxPipeline
    pipe = FluxPipeline.from_pretrained('black-forest-labs/FLUX.1-schnell', torch_dtype=torch.bfloat16)
    pipe.enable_model_cpu_offload()
else:
    from diffusers import StableDiffusionXLPipeline
    pipe = StableDiffusionXLPipeline.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', torch_dtype=torch.float16, variant='fp16').to('cuda')
PROMPT = ('3D animated film character, Pixar style, a friendly young Indian woman teacher in her late 20s, warm brown skin, '
          'big expressive eyes, kind smile, black hair in a neat braid with jasmine flowers, red bindi, cream and green cotton saree, '
          'standing in a bright Indian school classroom with a green chalkboard behind her, front view, upper body, looking at the camera, '
          'mouth closed, neutral relaxed pose, soft studio lighting, highly detailed, 4k')
NEG = 'photo, realistic, deformed, extra fingers, text, watermark, open mouth, side view, blurry'
if USE_FLUX:   # schnell takes no negative prompt; ask for the closed mouth in the prompt itself
    imgs = [pipe(PROMPT, width=768, height=1024, num_inference_steps=4, guidance_scale=0.0, max_sequence_length=256,
                 generator=torch.Generator('cpu').manual_seed(s)).images[0] for s in (1, 2, 3, 4)]
else:
    imgs = [pipe(PROMPT, negative_prompt=NEG, width=896, height=1152, num_inference_steps=30, guidance_scale=6.5,
                 generator=torch.Generator('cuda').manual_seed(s)).images[0] for s in (1, 2, 3, 4)]
for i, im in enumerate(imgs): im.save(f'{OUT}/teacher_candidate_{i+1}.png')
del pipe; torch.cuda.empty_cache()
TEACHER = f'{OUT}/teacher_candidate_1.png'    # change the number if another one looks better, then re-run from block 3
print('look at teacher_candidate_1..4.png and pick the best; set TEACHER above')

# %% 3. human-sounding Indian voice (Indic Parler-TTS: Tamil, Hindi, English)
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer
import soundfile as sf
tts = ParlerTTSForConditionalGeneration.from_pretrained('ai4bharat/indic-parler-tts').to('cuda')
tok = AutoTokenizer.from_pretrained('ai4bharat/indic-parler-tts'); dtok = AutoTokenizer.from_pretrained(tts.config.text_encoder._name_or_path)
LINES = {
 'ta': ('வணக்கம் குழந்தைகளே! இன்று நாம் ஒளிச்சேர்க்கை பற்றி கற்றுக்கொள்ளப் போகிறோம்.', 'Divya'),
 'hi': ('नमस्ते बच्चों! आज हम प्रकाश संश्लेषण के बारे में सीखेंगे।', 'Divya'),
 'en': ('Hello children! Today we are going to learn how plants make their own food.', 'Divya'),
}
def say(lang):
    text, spk = LINES[lang]
    desc = (f"{spk}'s voice is warm, expressive and friendly, a kind teacher speaking clearly at a moderate pace, "
            "with very clear audio and no background noise.")
    d = dtok(desc, return_tensors='pt').to('cuda'); p = tok(text, return_tensors='pt').to('cuda')
    g = tts.generate(input_ids=d.input_ids, attention_mask=d.attention_mask, prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
    path = f'{OUT}/voice_{lang}.wav'; sf.write(path, g.cpu().numpy().squeeze(), tts.config.sampling_rate); return path
VOICES = {l: say(l) for l in LINES}
print(VOICES)
del tts; torch.cuda.empty_cache()

# %% 4a. renderer A: SadTalker  (image + audio -> talking head; fast; may struggle with cartoon faces)
if not os.path.exists('/kaggle/working/SadTalker'):
    sh('git clone -q https://github.com/OpenTalker/SadTalker', cwd='/kaggle/working')
    sh('pip -q install -r requirements.txt', cwd='/kaggle/working/SadTalker', check=False)
    sh('bash scripts/download_models.sh', cwd='/kaggle/working/SadTalker', check=False)
def sadtalker(lang):
    d = f'/kaggle/working/st_{lang}'; shutil.rmtree(d, ignore_errors=True)
    sh(f'python inference.py --driven_audio {VOICES[lang]} --source_image {TEACHER} --result_dir {d} --still --preprocess full --size 512 --expression_scale 1.2',
       cwd='/kaggle/working/SadTalker', check=False)
    f = sorted(glob.glob(f'{d}/**/*.mp4', recursive=True))
    if f: shutil.copy(f[-1], f'{OUT}/A_sadtalker_{lang}.mp4')
for l in LINES: sadtalker(l)

# %% 4b. renderer B: Sonic (image + audio -> expressive head + movement; research licence)
if not os.path.exists('/kaggle/working/Sonic'):
    sh('git clone -q https://github.com/jixiaozhong/Sonic', cwd='/kaggle/working')
    sh('pip -q install -r requirements.txt', cwd='/kaggle/working/Sonic', check=False)
    sh('pip -q install -U "huggingface_hub[cli]"', check=False)
    sh('huggingface-cli download LeonJoe13/Sonic --local-dir checkpoints', cwd='/kaggle/working/Sonic', check=False)
    sh('huggingface-cli download stabilityai/stable-video-diffusion-img2vid-xt --local-dir checkpoints/stable-video-diffusion-img2vid-xt', cwd='/kaggle/working/Sonic', check=False)
    sh('huggingface-cli download openai/whisper-tiny --local-dir checkpoints/whisper-tiny', cwd='/kaggle/working/Sonic', check=False)
for l in LINES:
    sh(f'python demo.py {TEACHER} {VOICES[l]} {OUT}/B_sonic_{l}.mp4', cwd='/kaggle/working/Sonic', check=False)

# %% 4c. renderer C: Hallo2 / EchoMimicV3-Flash / LongCat-Video-Avatar  -> add the same way (clone, download weights, run on TEACHER + VOICES[l]).
# Left as a stub on purpose: each needs its own weights and a GPU test first. Tell me which of A/B looks closest and I will add the next one.

# %% 5. contact sheet so everything can be compared at a glance
import cv2, numpy as np
rows = []
for f in sorted(glob.glob(f'{OUT}/*.mp4')):
    cap = cv2.VideoCapture(f); n = int(cap.get(7)); cap.set(1, n // 2); ok, fr = cap.read(); cap.release()
    if ok: cv2.putText(fr, os.path.basename(f), (10, 30), cv2.FONT_HERSHEY_SIMPLEX, .8, (0, 255, 255), 2); rows.append(cv2.resize(fr, (320, 400)))
if rows: cv2.imwrite(f'{OUT}/compare.jpg', np.hstack(rows[:6]))
print(sorted(os.listdir(OUT)))
