import json,re,os
ROOT='/tmp/ss-build'; CL=9
CAT=ROOT+'/tools/cbse89/catalog_89.json'
T=lambda s:{"en":s}
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def mcq(key,rnd,stem,right,wrongs,expl,hint=None):
    o=[{"id":"right","text":T(right),"correct":True}]
    for i,w in enumerate(wrongs):
        t,why=(w if isinstance(w,(tuple,list)) else (w,"This does not match the working in the explanation."))
        o.append({"id":f"o{i}","text":T(t),"correct":False,"whyWrong":T(why)})
    return {"key":key,"round":rnd,"hints":[T(hint)] if hint else [],"provenance":"original","status":"published","type":"mcq","stem":T(stem),"options":o,"explanation":T(expl)}
def tf(key,rnd,stem,ans,expl): return {"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published","type":"true_false","stem":T(stem),"answer":ans,"explanation":T(expl)}
def num(key,rnd,stem,ans,expl,wrong=(),unit=None):
    d={"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published","type":"number","stem":T(stem),"answer":ans,"tolerance":0,"wrongAnswers":[{"value":v,"why":T(w)} for v,w in wrong],"explanation":T(expl)}
    if unit: d["unit"]=T(unit)
    return d
def short(key,rnd,stem,acc,expl,wrong=()): return {"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published","type":"short","stem":T(stem),"accepted":acc,"wrongAnswers":[{"text":a,"why":T(w)} for a,w in wrong],"explanation":T(expl)}
def build(sub,chn,tname,title,story_title,story,expl,example,teachback,summary,qs,off_book=False):
    cat=json.load(open(CAT)); c=[x for x in cat['classes'] if x['classLevel']==CL][0]
    s=[x for x in c['subjects'] if x['slug']==sub][0]; ch=[x for x in s['chapters'] if x['slug'].startswith(f"ch{chn:02d}-")][0]
    ts=slug(tname)[:60].strip('-')
    if not any(t['slug']==ts for t in ch['topics']):
        ch['topics'].append({"slug":ts,"name":{"en":tname,"ta":tname},"objectives":[{"text":{"en":f"Understand {title.lower()}"}},{"text":{"en":"Answer questions on it with reasons"}}]})
        json.dump(cat,open(CAT,'w'),indent=1,ensure_ascii=False)
    keep=sorted({w for _,w in expl if w})
    blocks=[{"id":"story","type":"story","provenance":"original","title":T(story_title),"text":T(story)},
     {"id":"explain","type":"explanation","provenance":"original","keepEnglishTerms":keep[:8],"text":T("\n".join(x for x,_ in expl))}]
    sents=[]
    for i,(x,w) in enumerate(expl,1):
        b=[]
        if i==1: b.append({"op":"clear"})
        if w: b.append({"op":"write","text":w})
        sents.append({"id":f"t{i}","text":T(x),"board":b})
    blocks.append({"id":"teacher","type":"teacher_narration","provenance":"original","teacher":"malar","sentences":sents})
    blocks.append({"id":"example","type":"worked_example","provenance":"original","problem":T(example[0]),"steps":[{"text":T(a),"why":T(b)} for a,b in example[1]]})
    blocks.append({"id":"teachback","type":"teach_back","provenance":"original","prompt":T(teachback[0]),"requiredIdeas":[T(x) for x in teachback[1]],"commonMisconceptions":[T(x) for x in teachback[2]]})
    blocks.append({"id":"quiz","type":"quiz","provenance":"original","questionIds":[q["key"] for q in qs if q["round"]<=2][:6]})
    blocks.append({"id":"summary","type":"summary","provenance":"original","points":[T(x) for x in summary]})
    L={"board":"CBSE","classLevel":CL,"subject":sub,"chapter":ch['slug'],"topic":ts,"lesson":{"status":"published","title":T(title),"blocks":blocks}}
    fn=f"cbse-{CL}-{sub}-{ch['slug']}-{ts}.json"
    json.dump(L,open(f"{ROOT}/content/lessons/{fn}",'w'),indent=2,ensure_ascii=False)
    json.dump({"board":"CBSE","classLevel":CL,"subject":sub,"chapter":ch['slug'],"topic":ts,"questions":qs},open(f"{ROOT}/content/questions/{fn}",'w'),indent=2,ensure_ascii=False)
