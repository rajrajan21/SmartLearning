import sys,os,zlib,json; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators'); os.chdir('/tmp/ss-build')
from kit2 import _q,sents
from lessonkit import mk
from tn_chapters import sl
def TN(cls,subj,ch,story,explain,terms,ex,claim,summ,quiz,title=None):
    """ch=chapter slug; explain: 4-5 paragraphs; terms: key terms (board text); ex: (problem,[steps]); claim: (wrong claim,[ideas]); quiz: 8 items in kit2 'm|stem|right|w1|w2|why' 't|stmt|T/F|why' 's|q|ans;alt|why' format"""
    P='/tmp/ss-build/content/curriculum/tn-matric-2026-27.json'; d=json.load(open(P))
    nm=next(c['name']['en'] for x in d['classes'] if x['classLevel']==cls for s in x['subjects'] if s['slug']==subj for c in s['chapters'] if c['slug']==ch)
    S=dict(cls=cls,subj=subj,subj_file=subj,board="TNMATRIC")
    ss=[x for p in explain for x in sents(p)][:8]
    narr=[(x,terms[i%len(terms)]) for i,x in enumerate(ss)]
    pre=ch[:3]+str(zlib.crc32(ch.encode())%97)
    steps=[(x,"Step %d."%(i+1)) for i,x in enumerate(ex[1])]
    mk(S,ch,"full-chapter-lesson",title or nm,title or nm,["Understand the main ideas of "+nm,"Use them to answer textbook-style questions"],("A short story",story),explain,terms,narr,(ex[0],steps),("A friend says "+claim[0]+" How will you reply?",claim[1],["Check the idea again."]),summ,_q(pre,quiz))
