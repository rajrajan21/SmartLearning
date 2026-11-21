#!/usr/bin/env python3
"""Render the SharpStudy tour video. Usage: render.py --lang en|ta [--work DIR] [--out DIR] [--fps 20] [--max-frames N]"""
import argparse, json, os, subprocess, sys, math, struct, wave, shutil
from pathlib import Path
from PIL import Image
HERE = Path(__file__).parent
ap = argparse.ArgumentParser()
ap.add_argument('--lang', default='en'); ap.add_argument('--work', default=str(HERE/'work'))
ap.add_argument('--out', default=str(HERE/'out')); ap.add_argument('--shots', default=str(HERE/'shots')); ap.add_argument('--publish', default='')
ap.add_argument('--fps', type=int, default=20); ap.add_argument('--max-frames', type=int, default=0)
ap.add_argument('--sample', default='')  # comma times to dump jpgs only
a = ap.parse_args()
L = a.lang
S = json.loads((HERE/'script.json').read_text(encoding='utf-8'))
T = json.loads((Path(a.work)/f'timings.{L}.json').read_text(encoding='utf-8'))
voiced = all(x.get('voiced') for x in T['lines'])
GAP, PAD_END = 0.45, 1.2
UI = {'en': dict(ask_head='Ask the teacher', who='Malar Teacher', ph='Type your doubt here…', badge='Available now',
                  q='Why do we carry a 1 when adding?', a='When ones add up to ten or more, ten ones become one ten, so we carry it to the tens place.',
                  tiles=[('🌍','GK'),('📝','Question papers'),('📚','E-Library')], explore='Explore more on SharpStudy',
                  title='How SharpStudy works', sub='A free place to learn sharp', outro='Start learning sharp', cta='Open SharpStudy'),
      'ta': dict(ask_head='ஆசிரியரிடம் கேளுங்கள்', who='மலர் டீச்சர்', ph='உங்கள் சந்தேகத்தை எழுதுங்கள்…', badge='இப்போதே கிடைக்கும்',
                  q='கூட்டும்போது ஏன் 1 ஐ எடுத்துச் செல்கிறோம்?', a='ஒன்றுகள் பத்தைத் தாண்டும்போது, பத்து ஒன்றுகள் ஒரு பத்தாகும்; அதனால் அதைப் பத்தாம் இடத்துக்கு எடுத்துச் செல்கிறோம்.',
                  tiles=[('🌍','பொது அறிவு'),('📝','வினாத்தாள்கள்'),('📚','மின்னூலகம்')], explore='ஷார்ப்ஸ்டடியில் மேலும் பாருங்கள்',
                  title='ஷார்ப்ஸ்டடி எப்படி வேலை செய்கிறது', sub='கூர்மையாகக் கற்க ஓர் இலவச இடம்', outro='இன்றே கூர்மையாகக் கற்கத் தொடங்குங்கள்', cta='ஷார்ப்ஸ்டடியைத் திற')}[L]
def shot(n):
    p = Path(a.shots)/f'{L}_{n}.png'
    if not p.exists(): p = Path(a.shots)/f'en_{n}.png'
    return str(p)
# per-line plan: kind + shot + camera + rings. coords in 1280-wide image space.
Z = lambda cx,cy,z0=1,z1=1.25: [dict(u=0,cx=640,cy=360 if z0==1 else cy,z=z0),dict(u=1,cx=cx,cy=cy,z=z1)]
PLAN = {
 1:dict(kind='title'),
 2:dict(kind='shot',shot='home',cam=Z(640,300,1,1.18),cursor=[dict(u=.2,x=900,y=560),dict(u=.8,x=700,y=400,click=1)]),
 3:dict(kind='shot',shot='class',cam=Z(640,330,1,1.2),cursor=[dict(u=.1,x=900,y=620),dict(u=.7,x=420,y=360,click=1)]),
 4:dict(kind='shot',shot='chapter',cam=Z(640,380,1,1.22),cursor=[dict(u=.2,x=1000,y=300),dict(u=.8,x=480,y=420,click=1)]),
 5:dict(kind='shot',shot='topic',cam=Z(640,360,1,1.15),cursor=[dict(u=.2,x=900,y=500),dict(u=.7,x=640,y=420,click=1)]),
 6:dict(kind='shot',shot='learn_play0',cam=Z(700,360,1,1.2),cursor=[dict(u=.2,x=900,y=620),dict(u=.7,x=1050,y=640,click=1)]),
 7:dict(kind='shot',shot='class_play1',cam=Z(640,360,1,1.1),cursor=[dict(u=.3,x=1000,y=500),dict(u=.8,x=800,y=400)]),
 8:dict(kind='shot',shot='prac_q',cam=Z(640,330,1,1.18),cursor=[dict(u=.2,x=900,y=560),dict(u=.7,x=560,y=430,click=1)]),
 9:dict(kind='shot',shot='revise',cam=Z(640,360,1,1.15),cursor=[dict(u=.2,x=900,y=500),dict(u=.7,x=640,y=420)]),
 10:dict(kind='ask'),
 11:dict(kind='shot',shot='progress',cam=Z(640,380,1,1.18),cursor=[dict(u=.2,x=900,y=300),dict(u=.8,x=500,y=450)]),
 12:dict(kind='shot',shot='home',cam=Z(900,200,1,1.3),cursor=[dict(u=.2,x=700,y=500),dict(u=.7,x=1100,y=60,click=1)]),
 13:dict(kind='shot',shot='parent',cam=Z(640,380,1,1.18),cursor=[dict(u=.2,x=900,y=300),dict(u=.8,x=500,y=420)]),
 14:dict(kind='soon'),
 15:dict(kind='outro'),
}
CHAPT = {sc['id']:sc['chapter'][L] for sc in S['scenes']}
lines = T['lines']
t = 0.5; scenes = []; cur = None
for ln in lines:
    n = ln['n']; dur = ln['dur']
    if cur is None or cur['id'] != ln['scene']:
        if cur: cur['t1'] = t; t += 0.0
        cur = dict(id=ln['scene'], chapter=CHAPT[ln['scene']], t0=t, segs=[], lines=[]); scenes.append(cur)
    p = PLAN[n]; sg = dict(p); sg['t0'] = t; sg['dur'] = dur + GAP
    ln['_t0'] = t + 0.15
    cur['lines'].append(dict(t0=t+0.15, t1=t+0.15+dur, text=ln['text'], n=n))
    if p['kind']=='shot':
        sp = shot(p['shot']); sg['shot'] = 'file://'+sp; sg['h'] = Image.open(sp).size[1]
        sg.pop('cursor',None); sg['cursor']=[dict(c) for c in p['cursor']]
        for c in sg['cursor']: pass
        sg['rings'] = []
    elif p['kind']=='title': sg.update(title=UI['title'], sub=UI['sub'])
    elif p['kind']=='outro': sg.update(title=UI['outro'], sub='SharpStudy', cta=UI['cta'])
    elif p['kind']=='ask': sg.update(head=UI['ask_head'], who=UI['who'], ph=UI['ph'], q=UI['q'], a=UI['a'])
    elif p['kind']=='soon': sg.update(head=UI['explore'], badge=UI['badge'], tiles=[dict(icon=i,name=nm) for i,nm in UI['tiles']])
    cur['segs'].append(sg); t += dur + GAP
cur['t1'] = t
total = t + PAD_END
# scene boundaries: next scene t0 equals prev t1
for i in range(len(scenes)-1): scenes[i]['t1'] = scenes[i+1]['t0']
scenes[-1]['t1'] = total
data = dict(total=total, scenes=scenes, burn=(not voiced))
fps = a.fps; nfr = int(total*fps)
print(f'[{L}] total {total:.1f}s frames {nfr} voiced={voiced}')
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
# ---- audio: voice track (if voiced) + music
sr = 24000
def music(dur):
    import random, numpy as np
    n = int(dur*sr); x = np.zeros(n, dtype=np.float32); tt = np.arange(n)/sr
    chords = [(261.6,329.6,392.0),(220.0,261.6,329.6),(174.6,220.0,261.6),(196.0,246.9,293.7)]
    beat = 2.4
    for i,c in enumerate(chords*int(dur/(beat*4)+2)):
        s = int(i*beat*sr)
        if s >= n: break
        e = min(n, s+int((beat+0.8)*sr)); k = np.arange(e-s)/sr
        env = np.minimum(1, k/0.5)*np.exp(-k/1.6)
        for f in c: x[s:e] += (np.sin(2*np.pi*f*k)+0.3*np.sin(2*np.pi*2*f*k))*env*0.05
        # soft pluck arpeggio
        for j,f in enumerate((c[0]*2,c[1]*2,c[2]*2,c[1]*2)):
            ss = s+int(j*beat/4*sr); ee = min(n, ss+int(0.6*sr)); kk = np.arange(ee-ss)/sr
            if ee>ss: x[ss:ee] += np.sin(2*np.pi*f*kk)*np.exp(-kk/0.18)*0.035
    fade = np.minimum(1, np.minimum(tt/1.5, (dur-tt)/2.5)); x *= fade
    return x
import numpy as np
mus = music(total)
gain = 0.55 if not voiced else 0.30
mix = mus*gain
if voiced:
    for ln in lines:
        w = wave.open(ln['wav']); fr = w.readframes(w.getnframes()); sr2 = w.getframerate(); ch = w.getnchannels(); w.close()
        v = np.frombuffer(fr, dtype=np.int16).astype(np.float32)/32768
        if ch>1: v = v.reshape(-1,ch).mean(1)
        if sr2 != sr:
            v = np.interp(np.arange(int(len(v)*sr/sr2))/sr*sr2, np.arange(len(v)), v)
        s = int(ln['_t0']*sr); e = min(len(mix), s+len(v)); mix[s:e] += v[:e-s]*0.95
mix = np.clip(mix, -1, 1)
wp = out/f'tour-{L}.wav'
with wave.open(str(wp),'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((mix*32767).astype(np.int16).tobytes())
# ---- vtt
def ts(x): h=int(x//3600); m=int(x%3600//60); s=x%60; return f'{h:02d}:{m:02d}:{s:06.3f}'
with open(out/f'tour-{L}.vtt','w',encoding='utf-8') as f:
    f.write('WEBVTT\n\n')
    for i,ln in enumerate([l for sc in scenes for l in sc['lines']]):
        f.write(f"{i+1}\n{ts(ln['t0'])} --> {ts(ln['t1']+0.2)}\n{ln['text']}\n\n")
(out/f'tour-{L}.chapters.json').write_text(json.dumps(dict(total=total, voiced=voiced, chapters=[dict(t=round(s['t0'],2), title=s['chapter']) for s in scenes]), ensure_ascii=False, indent=1), encoding='utf-8')
# ---- frames
from playwright.sync_api import sync_playwright
def run():
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or None, args=['--no-sandbox','--allow-file-access-from-files','--disable-web-security'])
        pg = b.new_page(viewport=dict(width=1280,height=720))
        pg.goto((HERE/'stage'/'stage.html').resolve().as_uri()); pg.wait_for_timeout(500)
        pg.evaluate('d=>window.init(d)', data); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(1200)
        if a.sample:
            for s in a.sample.split(','):
                pg.evaluate('t=>window.render(t)', float(s)); pg.wait_for_timeout(120)
                pg.screenshot(path=str(out)+f'/sample_{L}_{float(s):06.2f}.jpg', type='jpeg', quality=80)
            b.close(); return
        vid = out/f'tour-{L}.mp4'
        cmd = ['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(fps),'-c:v','mjpeg','-i','-','-i',str(wp),
               '-c:v','libx264','-preset','veryfast','-crf','27','-pix_fmt','yuv420p','-vf','scale=1280:720','-c:a','aac','-b:a','80k','-shortest','-movflags','+faststart',str(vid)]
        pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        N = a.max_frames or nfr
        for i in range(N):
            pg.evaluate('t=>window.render(t)', i/fps)
            pr.stdin.write(pg.screenshot(type='jpeg', quality=88))
        pr.stdin.close(); pr.wait(); b.close()
        pg2 = None
run()
if a.publish and not a.sample:
    pub = Path(a.publish); pub.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','2','-i',str(out/f'tour-{L}.mp4'),'-frames:v','1','-vf','scale=960:-1','-q:v','5',str(pub/f'poster-{L}.jpg')], check=True)
    for f in (f'tour-{L}.mp4', f'tour-{L}.vtt', f'tour-{L}.chapters.json'): shutil.copy(out/f, pub/f)
    print('published to', pub)
