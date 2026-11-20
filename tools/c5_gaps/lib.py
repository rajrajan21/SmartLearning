import json, os
ROOT='/tmp/ss-build'
def T(s): return {"en": s}
def lesson_path(s,c,t): return f"{ROOT}/content/lessons/cbse-5-{s}-{c}-{t}.json"
def q_path(s,c,t): return f"{ROOT}/content/questions/cbse-5-{s}-{c}-{t}.json"
def mcq(key,rnd,stem,right,wrongs,expl,hint=None):
    opts=[{"id":"right","text":T(right),"correct":True}]
    for i,(w,why) in enumerate(wrongs): opts.append({"id":f"o{i}","text":T(w),"correct":False,"whyWrong":T(why)})
    return {"key":key,"round":rnd,"hints":[T(hint)] if hint else [],"provenance":"original","status":"published","type":"mcq","stem":T(stem),"options":opts,"explanation":T(expl)}
def tf(key,rnd,stem,ans,expl):
    return {"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published","type":"true_false","stem":T(stem),"answer":ans,"explanation":T(expl)}
def num(key,rnd,stem,ans,expl,wrong=(),unit=None):
    d={"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published","type":"number","stem":T(stem),"answer":ans,"tolerance":0,"wrongAnswers":[{"value":v,"why":T(w)} for v,w in wrong],"explanation":T(expl)}
    if unit: d["unit"]=T(unit)
    return d
def short(key,rnd,stem,acc,expl,wrong=()):
    return {"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published","type":"short","stem":T(stem),"accepted":acc,"wrongAnswers":[{"text":a,"why":T(w)} for a,w in wrong],"explanation":T(expl)}
def build(s,c,t,title,story_title,story,expl,example,teachback,summary,qs,svg=None,old_title_keep=False):
    """expl: list of (sentence, boardword|None). example=(problem,[(step,why)]). teachback=(prompt,[ideas],[misc])"""
    keep=sorted({w for _,w in expl if w})
    blocks=[{"id":"story","type":"story","provenance":"original","title":T(story_title),"text":T(story)},
      {"id":"explain","type":"explanation","provenance":"original","keepEnglishTerms":keep[:8],"text":T("\n".join(x for x,_ in expl))}]
    if svg:
        blocks.append({"id":"diagram","type":"diagram","provenance":"original","assetKey":svg[0],"altText":T(svg[1]),"caption":T(svg[2])})
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
    L={"board":"CBSE","classLevel":5,"subject":s,"chapter":c,"topic":t,"lesson":{"status":"published","title":T(title),"blocks":blocks}}
    json.dump(L,open(lesson_path(s,c,t),'w'),indent=2,ensure_ascii=False)
    json.dump({"board":"CBSE","classLevel":5,"subject":s,"chapter":c,"topic":t,"questions":qs},open(q_path(s,c,t),'w'),indent=2,ensure_ascii=False)
