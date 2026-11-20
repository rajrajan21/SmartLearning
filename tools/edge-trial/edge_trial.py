#!/usr/bin/env python3
"""
SharpStudy - Edge voice TRIAL (read-only for your content; writes only into tools/edge-trial/out).

Makes one lesson's narration in two Indian English voices (Neerja, Prabhat) and builds compare.html so you can
listen to the existing clip (from content/audio) next to the new ones. Nothing in content/ is changed.

  py tools\\edge-trial\\edge_trial.py                 (picks a CBSE 6 lesson that already has full audio)
  py tools\\edge-trial\\edge_trial.py --lesson cbse-6-maths-xxx.json --max 12
"""
import argparse, asyncio, html, json, re, sys, time, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LESSONS = ROOT / "content" / "lessons"
AUDIO = ROOT / "content" / "audio"
VOICES = {"neerja": "en-IN-NeerjaNeural", "prabhat": "en-IN-PrabhatNeural"}

def speech_text(text: str) -> str:
    """Same clean-up as the site's audio builder (symbols become words, sentence ends with punctuation)."""
    t = unicodedata.normalize("NFC", text)
    t = re.sub(r"[*_`#>]+", "", t); t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\s*→\s*", ", then ", t); t = re.sub(r"\s*=\s*", " equals ", t)
    t = re.sub(r"\s*×\s*", " times ", t); t = re.sub(r"\s*÷\s*", " divided by ", t)
    t = re.sub(r"(\d)\s*\+\s*(\d)", r"\1 plus \2", t); t = re.sub(r"(\d)\s*[−]\s*(\d)", r"\1 minus \2", t)
    t = re.sub(r"(\d)\s+-\s+(\d)", r"\1 minus \2", t); t = re.sub(r"(\d)\s*%", r"\1 percent", t)
    t = re.sub(r"\s*&\s*", " and ", t); t = re.sub(r"\be\.g\.", "for example", t, flags=re.I); t = re.sub(r"\bi\.e\.", "that is", t, flags=re.I)
    t = re.sub(r"\s*\(([^)]*)\)", r", \1,", t); t = re.sub(r",\s*,", ",", t); t = re.sub(r",\s*([.!?])", r"\1", t)
    t = re.sub(r"\s+([,.!?])", r"\1", t); t = re.sub(r"\s+", " ", t).strip()
    if t and not re.search(r"[.!?…।]$", t): t += "."
    return t

def loose(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", s.lower())

def sentences(path: Path):
    d = json.loads(path.read_text(encoding="utf8"))
    out = []
    for b in d["lesson"]["blocks"]:
        if b.get("type") == "teacher_narration":
            for s in b["sentences"]:
                en = ((s.get("spoken") or {}).get("en") or (s.get("text") or {}).get("en") or "").strip()
                if en: out.append((s["id"], en))
    return out

def load_existing():
    mp = AUDIO / "manifest.json"
    if not mp.exists(): return {}
    m = json.loads(mp.read_text(encoding="utf8"))
    by_text = {}
    for key, e in m.get("entries", {}).items():
        if e.get("lang") == "en" and (AUDIO / "files" / e["file"]).exists():
            by_text.setdefault(loose(e.get("text", "")), []).append(e)
    return by_text

def find_existing(by_text, text, prefer="hf_beta"):
    es = by_text.get(loose(speech_text(text))) or by_text.get(loose(text)) or []
    es = sorted(es, key=lambda e: e.get("voice") != prefer)
    return es[0] if es else None

def pick_lesson(by_text, lo=10):
    best = None
    for f in sorted(LESSONS.glob("cbse-6-*.json")):
        try: ss = sentences(f)
        except Exception: continue
        if len(ss) < lo: continue
        have = sum(1 for _, t in ss if find_existing(by_text, t))
        if have == len(ss): return f
        if best is None or have / len(ss) > best[0]: best = (have / len(ss), f)
    return best[1] if best else None

async def make(edge_tts, jobs, rate, conc):
    sem = asyncio.Semaphore(conc); done = 0; fails = []
    async def one(text, voice, path):
        nonlocal done
        async with sem:
            for n in range(1, 4):
                try:
                    await edge_tts.Communicate(text, voice, rate=rate).save(str(path)); done += 1; return
                except Exception as e:
                    if n == 3: fails.append((path.name, str(e)[:120]))
                    else: await asyncio.sleep(2 * n)
    await asyncio.gather(*[one(*j) for j in jobs])
    return done, fails

def duration(path):
    try:
        from mutagen.mp3 import MP3
        return MP3(str(path)).info.length
    except Exception: return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lesson", help="lesson file name in content/lessons (default: auto-pick a CBSE 6 lesson with full audio)")
    ap.add_argument("--max", type=int, default=12, help="how many sentences to make (default 12)")
    ap.add_argument("--rate", default="-10%", help="speaking speed, e.g. -16%% slower, +0%% normal (default -10%%)")
    ap.add_argument("--conc", type=int, default=4)
    a = ap.parse_args()
    try: import edge_tts
    except ImportError: sys.exit("Missing package. Run:  py -m pip install edge-tts mutagen")

    by_text = load_existing()
    if not by_text: print("Note: content/audio/manifest.json not found or empty - the page will show the new voices only.")
    f = (LESSONS / a.lesson) if a.lesson else pick_lesson(by_text)
    if not f or not f.exists(): sys.exit("No lesson found. Pass --lesson <file name from content/lessons>.")
    ss = sentences(f)[: a.max]
    name = f.stem
    out = ROOT / "tools" / "edge-trial" / "out" / name
    for v in VOICES: (out / v).mkdir(parents=True, exist_ok=True)
    print(f"Lesson: {name}\nSentences: {len(ss)}   voices: {', '.join(VOICES.values())}   speed: {a.rate}")

    jobs = [(speech_text(t), vid, out / v / f"{i+1:02d}.mp3") for i, (_, t) in enumerate(ss) for v, vid in VOICES.items()]
    t0 = time.time()
    done, fails = asyncio.run(make(edge_tts, jobs, a.rate, a.conc))
    secs = max(0.1, time.time() - t0)
    print(f"Made {done}/{len(jobs)} clips in {secs:.0f}s  (about {done/secs*3600:,.0f} clips an hour at this pace)")
    for n, e in fails: print("FAILED", n, e)

    rows = []
    for i, (sid, t) in enumerate(ss):
        ex = find_existing(by_text, t)
        cells = []
        if ex: cells.append(("Existing (" + ex["voice"] + ")", f"../../../../content/audio/files/{ex['file']}"))
        else: cells.append(("Existing: not found", None))
        for v in VOICES:
            p = out / v / f"{i+1:02d}.mp3"
            if p.exists():
                d = duration(p); cells.append((v.title() + (f" {d:.1f}s" if d else ""), f"{v}/{p.name}"))
        td = "".join(f"<td><div class=l>{html.escape(l)}</div>" + (f"<audio controls preload=none src='{s}'></audio>" if s else "") + "</td>" for l, s in cells)
        rows.append(f"<tr><td class=s>{i+1}. {html.escape(t)}</td>{td}</tr>")
    page = ("<!doctype html><meta charset=utf-8><title>Edge voice trial</title><style>body{font:15px system-ui;margin:24px;max-width:1200px}"
            "td{padding:8px;border-bottom:1px solid #ddd;vertical-align:top}.s{width:32%}.l{font-size:12px;color:#555}audio{width:230px}</style>"
            f"<h2>Edge voice trial: {html.escape(name)}</h2><p>Listen to each row: existing clip, then Neerja, then Prabhat. Speed {html.escape(a.rate)}.</p><table>" + "".join(rows) + "</table>")
    (out / "compare.html").write_text(page, encoding="utf8")
    print(f"\nOpen this page to compare:\n  {out / 'compare.html'}")

if __name__ == "__main__":
    main()
