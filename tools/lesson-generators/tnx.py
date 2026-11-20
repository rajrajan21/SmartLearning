import sys,os,zlib,json; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators'); os.chdir('/tmp/ss-build')
from kit2 import _q,sents
from lessonkit import mk
from tn_chapters import TB
P='/tmp/ss-build/content/curriculum/tn-matric-2026-27.json'
SUBJ={'english':('English','ஆங்கிலம்','2024'),'tamil':('Tamil','தமிழ்','2025')}
def reg(cls,subj,ch,chname):
    d=json.load(open(P)); c=next(x for x in d['classes'] if x['classLevel']==cls)
    s=next((x for x in c['subjects'] if x['slug']==subj),None)
    if not s:
        en,ta,ed=SUBJ[subj]; tb=TB(cls,en,ed)
        if subj=="tamil": tb["title"]=f"Tamil Nadu State Board Standard {cls} Tamil"
        s={"slug":subj,"name":{"en":en,"ta":ta},"textbook":tb,"chapters":[]}; c['subjects'].append(s)
    if not any(x['slug']==ch for x in s['chapters']): s['chapters'].append({"slug":ch,"name":{"en":chname},"topics":[]})
    json.dump(d,open(P,'w'),ensure_ascii=False,indent=2); open(P,'a').write("\n")
def TX(cls,subj,ch,chname,topic,name,story,explain,terms,ex,claim,summ,quiz,ta=None):
    reg(cls,subj,ch,chname)
    ss=[x for p in explain for x in sents(p)][:8]
    narr=[(x,terms[i%len(terms)]) for i,x in enumerate(ss)]
    pre=topic[:3]+str(zlib.crc32(topic.encode())%97)
    S=dict(cls=cls,subj=subj,subj_file=subj,board="TNMATRIC")
    mk(S,ch,topic,name,ta or name,["Understand the main ideas of "+name,"Answer comprehension and vocabulary questions on it"],("A short story",story),explain,terms,narr,ex,
       ("A friend says "+claim[0]+" How will you reply?",claim[1],["Read the text again."]),summ,_q(pre,quiz))
def EN(cls,unit,uname,slug,name,hook,plot,theme,lang,terms,claim,quiz,note=""):
    """one English selection lesson. plot/theme/lang: short paragraphs in my own words."""
    steps=[(x,"Step %d."%(i+1)) for i,x in enumerate(sents(plot)[:3])]
    TX(cls,'english',f'unit-{unit}',uname,slug,name,hook,[plot,theme,lang+(" "+note if note else "")],terms,
       (f"Retell '{name}' in three sentences.",steps),claim,
       [sents(plot)[0],theme.split('. ')[0].rstrip('.')+'.',"Key words: "+", ".join(terms[:4])+".","Answer comprehension questions in your own words."],quiz)
def TA(cls,iy,iyname,slug,name,hook,a,b,c,terms,claim,quiz):
    """Tamil-language subject lesson (English explanation with Tamil key text). a=what it is, b=message, c=language/exam focus."""
    TX(cls,'tamil',f'iyal-{iy}',iyname,slug,name,hook,[a,b,c],terms,
       (f"Say in your own words what '{name}' is about.",[(x,"Step %d."%(i+1)) for i,x in enumerate(sents(a)[:2]+sents(b)[:1])]),claim,
       [sents(a)[0],sents(b)[0],"Remember the key Tamil terms: "+", ".join(terms[:4])+".","Practise the textbook questions in your own words."],quiz)
