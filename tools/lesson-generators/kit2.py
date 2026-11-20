import re
from lessonkit import mk,qs
def _q(prefix,items):
    out=[]
    for s in items:
        p=s.split("|")
        if p[0]=="m": out.append(("m",p[1],p[2],p[3],p[4],p[5]))
        elif p[0]=="t": out.append(("t",p[1],p[2]=="T",p[3]))
        else: out.append(("s",p[1],p[2].split(";"),p[3]))
    return qs(prefix,out)
def sents(txt): return [x.strip() for x in re.split(r'(?<=[.!?])\s+',txt) if x.strip()]
def T(S,ch,slug,en,story,explain,terms,ex,claim,summary,quiz,obj=None,ta=None):
    """explain: 3 paragraphs; terms: list; ex: (problem,[(text,why),...]); claim: (wrong claim, [ideas], [misconception])"""
    ss=[x for p in explain for x in sents(p)][:4]
    narr=[(x,terms[i%len(terms)]) for i,x in enumerate(ss)]
    import zlib; pre=slug[:3]+str(zlib.crc32(slug.encode())%97)
    mk(S,ch,slug,en,ta or en,obj or ["Understand "+en.lower(),"Use it in simple problems"],("A short story",story),explain,terms,narr,ex,
       ("A friend says "+claim[0]+" How will you reply?",claim[1],claim[2]),summary,_q(pre,quiz))
