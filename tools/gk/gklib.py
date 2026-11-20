"""Tiny helpers to write GK lessons compactly. Used by tools/gk/src/*.py, built by tools/gk/build.py."""
import re

LESSONS = []
CATEGORIES = []

def C(id, title, emoji, blurb, group="knowledge", order=50):
    CATEGORIES.append(dict(id=id, title=title, emoji=emoji, blurb=blurb, group=group, order=order))

def S(title, narration, points=None, vis=None):
    """narration: sentences separated by ' | '. points: 2-4 short slide bullets (auto if omitted)."""
    sents = [x.strip() for x in narration.split("|") if x.strip()]
    return dict(title=title, sentences=sents, points=points if points is not None else [], visual=vis)

def Q(q, options, answer, why):
    return dict(q=q, options=options, answer=answer, why=why)

def L(cat, id, age, title, summary, emoji, steps, facts=None, quiz=None, tags=None, asof=None, notes=None, kind="lesson", method=None):
    st = []
    for i, s in enumerate(steps, 1):
        pts = s["points"] or [s["sentences"][0][:130]]
        d = dict(id=f"s{i}", title=s["title"], sentences=s["sentences"], points=pts[:4])
        if s["visual"]:
            d["visual"] = s["visual"]
        st.append(d)
    d = dict(id=id, kind=kind, category=cat, age=age, title=title, summary=summary, emoji=emoji,
             tags=tags or [], steps=st, facts=facts or [], quiz=quiz or [])
    if asof: d["asOf"] = asof
    if notes: d["notes"] = notes
    if method: d["method"] = method
    LESSONS.append(d)

def P(cat, id, age, title, emoji, puzzle, think, method_name, method, answer, check, facts=None, tags=None, vis=None, more=None):
    """A puzzle lesson: the puzzle, how to think, the method, the answer; plus up to 3 practice questions.
    puzzle/think/method/answer are narration strings (sentences separated by ' | ')."""
    steps = [S("The puzzle", puzzle, [], vis),
             S("How to think about it", think, []),
             S("The method: " + method_name, method, []),
             S("The answer", answer, [])]
    quiz = [Q(*x) for x in (more or [])]
    L(cat, id, age, title, check, emoji, steps, facts=facts, quiz=quiz, tags=tags, kind="puzzle", method=method_name)
