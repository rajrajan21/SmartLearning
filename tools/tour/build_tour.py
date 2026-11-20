#!/usr/bin/env python3
"""One-shot rebuild of the tour video: voice-over (English), render both languages, publish into apps/web/public/tour-video.
Run through Build-Tour-Video.bat (it checks the tools first). Usage: build_tour.py [--langs en,ta] [--engine auto]"""
import argparse, os, subprocess, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
ap = argparse.ArgumentParser(); ap.add_argument('--langs', default='en,ta'); ap.add_argument('--engine', default='auto')
a = ap.parse_args()
work = HERE/'work'; work.mkdir(exist_ok=True)
pub = ROOT/'apps'/'web'/'public'/'tour-video'
for lang in a.langs.split(','):
    t0 = time.time()
    print(f'== {lang}: voice-over'); subprocess.run([sys.executable, str(HERE/'make_voice.py'), '--lang', lang, '--work', str(work), '--engine', a.engine], check=True)
    print(f'== {lang}: render (about 3 to 8 minutes)'); subprocess.run([sys.executable, str(HERE/'render.py'), '--lang', lang, '--work', str(work), '--publish', str(pub)], check=True)
    print(f'== {lang}: done in {time.time()-t0:.0f}s')
print('DONE: videos are in', pub, ' - publish the site as usual.')
