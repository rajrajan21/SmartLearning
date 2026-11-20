"""Class 5 textbook-based lesson rewrite helper. Rewrites ONLY the lesson file of an existing Class 5 topic,
keeping its quiz block (question ids) and path. Text is paraphrased from the NCERT book (Maths Mela, Our Wondrous World,
Santoor); extra material is marked '(additional, not in the textbook)'.
spec: sub (maths|evs|english), key (chapter-topic slug part after 'cbse-5-<sub>-'), title, terms[], story(title,text),
explain[list of paragraphs], ex(problem,[(step,why)]), tb(prompt,[ideas],[misconceptions]), summary[]"""
import json, os, re
ROOT=os.environ.get("SS_ROOT","/tmp/ss-build")
def L(t): return {"en":t}
def sents(paras):
    out=[]
    for p in paras:
        for s in re.split(r'(?<=[.!?])\s+',p.strip()):
            if s: out.append(s)
    return out
def build(sp):
    f=f'{ROOT}/content/lessons/cbse-5-{sp["sub"]}-{sp["key"]}.json'
    old=json.load(open(f)); ol=old["lesson"]
    quiz=[b for b in ol["blocks"] if b["type"]=="quiz"][0]
    terms=sp["terms"]
    ss=sents(sp["explain"])[:22]
    nar=[]
    for i,s in enumerate(ss):
        low=s.lower(); t=next((x for x in terms if x.lower() in low),None)
        board=([{"op":"clear"}] if i==0 else [])+([{"op":"write","text":t}] if t else [])
        nar.append({"id":f"t{i+1}","text":L(s),"board":board})
    blocks=[
     {"id":"story","type":"story","provenance":"original","title":L(sp["story"][0]),"text":L(sp["story"][1])},
     {"id":"explain","type":"explanation","provenance":"original","keepEnglishTerms":terms,"text":L("\n".join(sp["explain"]))},
     {"id":"teacher","type":"teacher_narration","provenance":"original","teacher":"malar","sentences":nar},
     {"id":"example","type":"worked_example","provenance":"original","problem":L(sp["ex"][0]),"steps":[{"text":L(a),"why":L(b)} for a,b in sp["ex"][1]]},
     {"id":"teachback","type":"teach_back","provenance":"original","prompt":L(sp["tb"][0]),"requiredIdeas":[L(x) for x in sp["tb"][1]],"commonMisconceptions":[L(x) for x in sp["tb"][2]]},
     quiz,
     {"id":"summary","type":"summary","provenance":"original","points":[L(x) for x in sp["summary"]]},
    ]
    old["lesson"]={"status":"published","title":L(sp.get("title") or ol["title"]["en"]),"blocks":blocks}
    json.dump(old,open(f,"w"),ensure_ascii=False,indent=1)
    if sp.get("title"):
        cp=f"{ROOT}/content/curriculum/cbse-2026-27.json"; d=json.load(open(cp)); slug=old["topic"]; ch=old["chapter"]
        for c in d["classes"]:
            if c["classLevel"]!=5: continue
            for sb in c["subjects"]:
                if sb["slug"]!=sp["sub"]: continue
                for chh in sb["chapters"]:
                    if chh["slug"]!=ch: continue
                    for t in chh.get("topics",[]):
                        if t["slug"]==slug: t["name"]["en"]=sp["title"]
        json.dump(d,open(cp,"w"),ensure_ascii=False,indent=2); open(cp,"a").write("\n")
    print("ok",sp["key"],len(ss),"narration lines")
