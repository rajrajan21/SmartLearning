"""Class 3/4 textbook-based lesson rewrite (NCERT Maths Mela / Our Wondrous World / Santoor).
Run with: python3 gen34_xxx.py  (writes straight into the project, ROOT = project folder).
D(cl,sub,key,terms,story,explain,ex,tb,summary,q,title=None)
 key: slug after 'cbse-<cl>-<sub>-' ; story=(title,text); explain=list of paragraphs;
 ex=(problem,[(step,why)]); tb=(prompt,[ideas],[misconceptions]); q=[("m",stem,right,[w1,w2],expl),("t",stmt,bool,expl)]
 Rewrites the lesson file (keeps path), appends NEW questions (n34-...) to the question file, quiz block uses the new ones.
 Off-book material is labelled '(additional, not in the textbook)'."""
import json, os, re, zlib
ROOT=os.environ.get("SS_ROOT") or os.path.abspath(os.path.join(os.path.dirname(__file__),"..",".."))
def L(t): return {"en":t}
def sents(paras):
    out=[]
    for p in paras:
        for s in re.split(r'(?<=[.!?])\s+',p.strip()):
            if s: out.append(s)
    return out
def _q(pre,q):
    out=[]
    for i,x in enumerate(q,1):
        rnd=1 if i<=2 else 2
        key=f"n34-{pre}-{i}"
        if x[0]=="m":
            opts=[{"id":"right","text":L(x[2]),"correct":True}]
            for j,w in enumerate(x[3]): opts.append({"id":f"o{j}","text":L(w),"correct":False,"whyWrong":L("Not quite. "+x[4])})
            # deterministic shuffle of option order
            r=zlib.crc32(key.encode())%len(opts); opts=opts[r:]+opts[:r]
            out.append({"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published","type":"mcq","stem":L(x[1]),"options":opts,"explanation":L(x[4])})
        else:
            out.append({"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published","type":"true_false","stem":L(x[1]),"answer":bool(x[2]),"explanation":L(x[3])})
    return out
def D(cl,sub,key,terms,story,explain,ex,tb,summary,q,title=None):
    f=f'{ROOT}/content/lessons/cbse-{cl}-{sub}-{key}.json'
    old=json.load(open(f,encoding="utf-8")); ol=old["lesson"]
    ss=sents(explain)[:24] if isinstance(explain,str) else sents(explain)[:24]
    nar=[]
    for i,s in enumerate(ss):
        low=s.lower(); t=next((x for x in terms if x.lower() in low),None)
        board=([{"op":"clear"}] if i==0 else [])+([{"op":"write","text":t}] if t else [])
        nar.append({"id":f"t{i+1}","text":L(s),"board":board})
    pre=f"{cl}{sub[0]}{zlib.crc32(key.encode())%99991}"
    nq=_q(pre,q)
    blocks=[
     {"id":"story","type":"story","provenance":"original","title":L(story[0]),"text":L(story[1])},
     {"id":"explain","type":"explanation","provenance":"original","keepEnglishTerms":terms,"text":L("\n".join(explain))},
     {"id":"teacher","type":"teacher_narration","provenance":"original","teacher":"malar","sentences":nar},
     {"id":"example","type":"worked_example","provenance":"original","problem":L(ex[0]),"steps":[{"text":L(a),"why":L(b)} for a,b in ex[1]]},
     {"id":"teachback","type":"teach_back","provenance":"original","prompt":L(tb[0]),"requiredIdeas":[L(x) for x in tb[1]],"commonMisconceptions":[L(x) for x in tb[2]]},
     {"id":"quiz","type":"quiz","provenance":"original","questionIds":[x["key"] for x in nq if x["round"]<=2][:6]},
     {"id":"summary","type":"summary","provenance":"original","points":[L(x) for x in summary]},
    ]
    old["lesson"]={"status":"published","title":L(title or ol["title"]["en"]),"blocks":blocks}
    json.dump(old,open(f,"w",encoding="utf-8"),ensure_ascii=False,indent=1)
    qf=f'{ROOT}/content/questions/cbse-{cl}-{sub}-{key}.json'
    qd=json.load(open(qf,encoding="utf-8"))
    qd["questions"]=[x for x in qd["questions"] if not x["key"].startswith("n34-")]+nq
    json.dump(qd,open(qf,"w",encoding="utf-8"),ensure_ascii=False,indent=1)
    if title and title!=ol["title"]["en"]:
        cp=f"{ROOT}/content/curriculum/cbse-2026-27.json"; d=json.load(open(cp,encoding="utf-8"))
        for c in d["classes"]:
            if c["classLevel"]!=cl: continue
            for sb in c["subjects"]:
                if sb["slug"]!=sub: continue
                for chh in sb["chapters"]:
                    if chh["slug"]!=old["chapter"]: continue
                    for t in chh.get("topics",[]):
                        if t["slug"]==old["topic"]: t["name"]["en"]=title
        json.dump(d,open(cp,"w",encoding="utf-8"),ensure_ascii=False,indent=2); open(cp,"a").write("\n")
    print("ok",cl,sub,key,len(ss),"lines")

def S(cl,sub,key,terms,story,expl,do,ask,summ,q,title=None):
    """Compact form. do=(problem,[step strings]); ask=(question,[ideas])."""
    ex=(do[0],[(s,"Step %d."%(i+1)) for i,s in enumerate(do[1])])
    tb=(ask[0],ask[1],["Check the lesson again before answering."])
    D(cl,sub,key,terms,story,expl,ex,tb,summ,q,title)
