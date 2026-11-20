"""Build content/gk/*.json from tools/gk/src/*.py and validate. Run: python3 tools/gk/build.py"""
import sys, glob, json, os, re
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
import gklib
for f in sorted(glob.glob(os.path.join(here, "src", "*.py"))):
    exec(compile(open(f, encoding="utf-8").read(), f, "exec"), {})
out = os.path.abspath(os.path.join(here, "..", "..", "content", "gk"))
VIS = set("solar-system moon-phases day-night seasons water-cycle plane-lift heartbeat photosynthesis eclipses tides states-of-matter pendulum sound-waves rainbow-prism plate-tectonics fibonacci number-sieve binary-counter circuit food-chain volcano atom pi-unroll clock-time".split())
cats = {c["id"] for c in gklib.CATEGORIES}
errs, seen = [], set()
for l in gklib.LESSONS:
    i = l["id"]
    if i in seen: errs.append(f"dup {i}")
    seen.add(i)
    if l["category"] not in cats: errs.append(f"{i}: unknown category {l['category']}")
    if not re.fullmatch(r"[a-z0-9-]+", i): errs.append(f"{i}: bad id")
    for s in l["steps"]:
        if s.get("visual") and s["visual"] not in VIS: errs.append(f"{i}: unknown visual {s['visual']}")
        for t in s["sentences"]:
            if len(t) > 300: errs.append(f"{i}/{s['id']}: sentence >300")
        if not 1 <= len(s["points"]) <= 4: errs.append(f"{i}/{s['id']}: points")
    for q in l["quiz"]:
        if not 0 <= q["answer"] < len(q["options"]): errs.append(f"{i}: quiz answer range: {q['q']}")
    if not l["quiz"]: errs.append(f"{i}: no quiz")
if errs:
    print("\n".join(errs)); sys.exit(1)
os.makedirs(os.path.join(out, "lessons"), exist_ok=True)
stale = []
for f in glob.glob(os.path.join(out, "lessons", "*.json")):
    try: os.remove(f)
    except OSError: stale.append(f)  # deleting can be blocked; files are simply overwritten below
for l in gklib.LESSONS:
    json.dump(l, open(os.path.join(out, "lessons", l["id"] + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump({"categories": gklib.CATEGORIES}, open(os.path.join(out, "categories.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
vis = {l["id"]: [s["visual"] for s in l["steps"] if s.get("visual")] for l in gklib.LESSONS}
used = sorted({v for x in vis.values() for v in x})
print(f"{len(gklib.LESSONS)} lessons ({sum(l['kind']=='puzzle' for l in gklib.LESSONS)} puzzles), {len(gklib.CATEGORIES)} categories, visuals used {len(used)}: {used}")
