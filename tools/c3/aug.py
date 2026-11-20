"""Class 3 depth upgrade helper (fork job 2026-11-17). Appends new, textbook-based sections, examples, diagrams and questions to an existing whole-chapter lesson. Original wording."""
import json, os, re, sys
sys.path.insert(0, os.path.expanduser("~/mnt/d/Smart Learning Website/tools/c34"))
from lib import ROOT, T, mcq, tf, num, short, svgfile
M, F, S, N = mcq, tf, short, num
TXT = os.path.expanduser("~/c3z/t")
def src(name, n=100000):
    s = open(f"{TXT}/{name}.txt", encoding="utf8").read()
    return re.sub(r"\s+", " ", s)[:n]
def dump(cls, subj, ch):
    base = f"cbse-{cls}-{subj}-{ch}-whole-chapter.json"
    L = json.load(open(f"{ROOT}/content/lessons/{base}")); Q = json.load(open(f"{ROOT}/content/questions/{base}"))
    b = L["lesson"]["blocks"]
    print("TITLE", L["lesson"]["title"]["en"])
    for x in b:
        if x["type"] == "teacher_narration": print("NARR:", " | ".join(s["text"]["en"] for s in x["sentences"]))
        if x["type"] == "worked_example": print("EX:", x["problem"]["en"][:90])
        if x["type"] == "diagram": print("DG:", x["assetKey"])
    print("Q:", " || ".join(f'{q["key"][-6:]}:{q["stem"]["en"][:60]}' for q in Q["questions"]))
def aug(cls, subj, ch, sections=(), examples=(), qs=(), svgs=(), summary=(), teachback=None):
    """sections: [(heading,[sentences])] appended to the teacher narration; examples: [(problem,[(step,why)])];
    qs: new questions (mcq/tf/num/short, rounds 1-3); svgs: [(assetKey, alt, caption)] inserted before the narration (files written by caller);
    summary: extra summary points; teachback: optional (prompt,[ideas],[misconceptions]) replacing the old one."""
    base = f"cbse-{cls}-{subj}-{ch}-whole-chapter.json"
    pl = f"{ROOT}/content/lessons/{base}"; pq = f"{ROOT}/content/questions/{base}"
    L = json.load(open(pl)); Q = json.load(open(pq)); b = L["lesson"]["blocks"]
    pref = f"c{cls}{subj[:2]}-{''.join(w[0] for w in ch.split('-'))}-"
    have = {q["key"] for q in Q["questions"]}
    for q in qs:
        if not q["key"].startswith(pref): q["key"] = pref + q["key"]
        assert q["key"] not in have, q["key"]
        have.add(q["key"])
    nar = next(x for x in b if x["type"] == "teacher_narration")
    n = len(nar["sentences"])
    for h, ss in sections:
        for j, s in enumerate(ss):
            n += 1; nar["sentences"].append({"id": f"t{n}", "text": T(s), "board": [{"op": "write", "text": h}] if j == 0 else []})
    ex = next(x for x in b if x["type"] == "explanation")
    if sections: ex["text"]["en"] += "\n" + "\n".join(" ".join(s) for _, s in sections)
    ni = max([int(re.sub(r"\D", "", x["id"]) or 0) for x in b if x["type"] == "worked_example"] + [0])
    last_ex = max([i for i, x in enumerate(b) if x["type"] == "worked_example"] + [next(i for i, x in enumerate(b) if x["type"] == "teacher_narration")])
    for k, (p, steps) in enumerate(examples, 1):
        last_ex += 1
        b.insert(last_ex, {"id": f"example{ni+k}", "type": "worked_example", "provenance": "original", "problem": T(p), "steps": [{"text": T(a), "why": T(w)} for a, w in steps]})
    nd = len([x for x in b if x["type"] == "diagram"])
    ti = next(i for i, x in enumerate(b) if x["type"] == "teacher_narration")
    for k, (key, alt, cap) in enumerate(svgs, 1):
        b.insert(ti, {"id": f"diagram{nd+k}", "type": "diagram", "provenance": "original", "assetKey": key if key.endswith(".svg") else key + ".svg", "altText": T(alt), "caption": T(cap)}); ti += 1
    if teachback:
        tb = next(x for x in b if x["type"] == "teach_back")
        tb["prompt"] = T(teachback[0]); tb["requiredIdeas"] = [T(x) for x in teachback[1]]; tb["commonMisconceptions"] = [T(x) for x in teachback[2]]
    Q["questions"] += list(qs)
    qb = next(x for x in b if x["type"] == "quiz")
    qb["questionIds"] = [q["key"] for q in Q["questions"] if q["round"] <= 2][:10]
    sm = next(x for x in b if x["type"] == "summary")
    for s in summary: sm["points"].append(T(s))
    for p, d in ((pl, L), (pq, Q)):
        json.dump(d, open(p + ".tmp", "w", encoding="utf8"), indent=2, ensure_ascii=False); os.replace(p + ".tmp", p)
    print("aug", base, "narration", len([1 for x in b if x["type"] == "teacher_narration" for _ in x["sentences"]]), "questions", len(Q["questions"]))
