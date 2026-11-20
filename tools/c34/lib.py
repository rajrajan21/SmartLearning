"""CBSE Class 6/7 whole-chapter lesson builder (fork job 2026-11-17). Original wording, written from the NCERT textbook chapter.
Usage: from lib import *; chapter(...). Output: content/lessons + content/questions (topic 'whole-chapter'), registers curriculum topic via register()."""
import json, os, re
ROOT = os.environ.get("SS_ROOT", os.path.expanduser("~/mnt/d/Smart Learning Website"))
TOPIC = "whole-chapter"
def T(s): return {"en": s}
def mcq(key, rnd, stem, right, wrongs, expl, hint=None):
    opts = [{"id": "right", "text": T(right), "correct": True}]
    for i, (w, why) in enumerate(wrongs): opts.append({"id": f"o{i}", "text": T(w), "correct": False, "whyWrong": T(why)})
    return {"key": key, "round": rnd, "hints": [T(hint)] if hint else [], "provenance": "original", "status": "published", "type": "mcq", "stem": T(stem), "options": opts, "explanation": T(expl)}
def tf(key, rnd, stem, ans, expl):
    return {"key": key, "round": rnd, "hints": [], "provenance": "original", "status": "published", "type": "true_false", "stem": T(stem), "answer": ans, "explanation": T(expl)}
def num(key, rnd, stem, ans, expl, wrong=(), unit=None):
    d = {"key": key, "round": rnd, "hints": [], "provenance": "original", "status": "published", "type": "number", "stem": T(stem), "answer": ans, "tolerance": 0, "wrongAnswers": [{"value": v, "why": T(w)} for v, w in wrong], "explanation": T(expl)}
    if unit: d["unit"] = T(unit)
    return d
def short(key, rnd, stem, acc, expl, wrong=()):
    return {"key": key, "round": rnd, "hints": [], "provenance": "original", "status": "published", "type": "short", "stem": T(stem), "accepted": acc, "wrongAnswers": [{"text": a, "why": T(w)} for a, w in wrong], "explanation": T(expl)}
def svgfile(name, W, H, body):
    d = f"{ROOT}/apps/web/public/assets/lessons/"; os.makedirs(d, exist_ok=True)
    open(d + name, "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" role="img"><rect width="{W}" height="{H}" fill="#ffffff"/><g font-family="sans-serif" font-size="16" fill="#222">{body}</g></svg>')
def chapter(cls, subj, ch, title, story, sections, examples, teachback, summary, qs, svgs=(), keep=()):
    """sections: [(heading, [sentence,...])]; each section's first sentence writes the heading on the board.
    examples: [(problem,[(step,why)])]; teachback=(prompt,[ideas],[misconceptions]); qs: list of questions (rounds 1-3)."""
    pref = f"c{cls}{subj[:2]}-{''.join(w[0] for w in ch.split('-'))}-"
    for q in qs:
        if not q["key"].startswith(pref): q["key"] = pref + q["key"]
    blocks = [{"id": "story", "type": "story", "provenance": "original", "title": T(story[0]), "text": T(story[1])}]
    blocks.append({"id": "explain", "type": "explanation", "provenance": "original", "keepEnglishTerms": list(keep)[:8],
                   "text": T("\n".join(" ".join(s) for _, s in sections))})
    for i, (k, alt, cap) in enumerate(svgs, 1):
        blocks.append({"id": f"diagram{i}", "type": "diagram", "provenance": "original", "assetKey": (k if k.endswith('.svg') else k+'.svg'), "altText": T(alt), "caption": T(cap)})
    sents = []; n = 0
    for h, ss in sections:
        for j, x in enumerate(ss):
            n += 1; b = []
            if n == 1: b.append({"op": "clear"})
            if j == 0: b.append({"op": "write", "text": h})
            sents.append({"id": f"t{n}", "text": T(x), "board": b})
    blocks.append({"id": "teacher", "type": "teacher_narration", "provenance": "original", "teacher": "malar", "sentences": sents})
    for i, (p, steps) in enumerate(examples, 1):
        blocks.append({"id": f"example{i}", "type": "worked_example", "provenance": "original", "problem": T(p), "steps": [{"text": T(a), "why": T(b)} for a, b in steps]})
    blocks.append({"id": "teachback", "type": "teach_back", "provenance": "original", "prompt": T(teachback[0]), "requiredIdeas": [T(x) for x in teachback[1]], "commonMisconceptions": [T(x) for x in teachback[2]]})
    blocks.append({"id": "quiz", "type": "quiz", "provenance": "original", "questionIds": [q["key"] for q in qs if q["round"] <= 2][:8]})
    blocks.append({"id": "summary", "type": "summary", "provenance": "original", "points": [T(x) for x in summary]})
    L = {"board": "CBSE", "classLevel": cls, "subject": subj, "chapter": ch, "topic": TOPIC, "lesson": {"status": "published", "title": T(title), "blocks": blocks}}
    base = f"cbse-{cls}-{subj}-{ch}-{TOPIC}.json"
    json.dump(L, open(f"{ROOT}/content/lessons/{base}", "w"), indent=2, ensure_ascii=False)
    json.dump({"board": "CBSE", "classLevel": cls, "subject": subj, "chapter": ch, "topic": TOPIC, "questions": qs}, open(f"{ROOT}/content/questions/{base}", "w"), indent=2, ensure_ascii=False)
    register(cls, subj, ch, title)
    print("wrote", base, len(sents), "sentences", len(qs), "questions")
def register(cls, subj, ch, title):
    p = f"{ROOT}/content/curriculum/cbse-2026-27.json"
    c = json.load(open(p))
    for cl in c["classes"]:
        if cl["classLevel"] != cls: continue
        for s in cl["subjects"]:
            if s["slug"] != subj: continue
            for chp in s["chapters"]:
                if chp["slug"] != ch: continue
                if any(t["slug"] == TOPIC for t in chp["topics"]): return
                chp["topics"].insert(0, {"slug": TOPIC, "name": T("Whole chapter: " + title), "objectives": [{"text": T("Follow the whole chapter the way the textbook teaches it")}, {"text": T("Check yourself with questions that explain every answer")}]})
                json.dump(c, open(p, "w"), indent=2, ensure_ascii=False); return
    print("WARN chapter not in curriculum", cls, subj, ch)
