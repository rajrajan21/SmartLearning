"""Deep Matric lessons: several topic lessons per chapter. Builds into SS_ROOT (default: the project folder, 3 levels up)."""
import os, sys, json, zlib
HERE = os.path.dirname(os.path.abspath(__file__))
os.environ.setdefault("SS_ROOT", os.path.abspath(os.path.join(HERE, "..", "..")))
sys.path.insert(0, HERE)
from kit2 import _q, sents
from lessonkit import mk

def DEEP(cls, subj, ch, topic, title, story, explain, terms, ex, claim, summ, quiz, extra=None):
    """explain: 4-5 paragraphs; terms: 3-4 key terms; ex=(problem,[steps]); claim=(wrong claim,[ideas]);
    quiz: 6 items 'm|stem|right|w1|w2|why' / 't|stmt|T/F|why' / 's|q|ans;alt|why'.
    extra: if the topic is not in the textbook text, pass '(additional, not in the textbook)'."""
    S = dict(cls=cls, subj=subj, subj_file=subj, board="TNMATRIC")
    nm = title + (" " + extra if extra else "")
    ss = [x for p in explain for x in sents(p)][:9]
    narr = [(x, terms[i % len(terms)]) for i, x in enumerate(ss)]
    pre = topic[:3] + str(zlib.crc32((ch + topic).encode()) % 97)
    steps = [(x, "Step %d." % (i + 1)) for i, x in enumerate(ex[1])]
    mk(S, ch, topic, nm, nm, ["Understand " + title, "Solve textbook-style problems on " + title],
       ("A short story", story), explain, terms, narr, (ex[0], steps),
       ("A friend says " + claim[0] + " How will you reply?", claim[1], ["Check the idea again."]), summ, _q(pre, quiz))
