"""Builds a text lesson + practice questions + curriculum topic from a compact spec.
Spec keys: cls, subj, subj_file, ch (chapter slug), topic (slug), name_en, name_ta, objectives[],
story (title,text), explain (lines), terms[], narr [(sentence, board text)], ex (problem, [(step, why)]),
tb (prompt, [ideas], [misconceptions]), summary[], q [ (kind, round, key, ...) ]
Question tuples: ("mcq", round, key, stem, right, [(wrong, why)...], explanation)
                 ("tf", round, key, stem, True/False, explanation)
                 ("short", round, key, stem, [accepted...], explanation)"""
import json, os, hashlib
ROOT=os.environ.get("SS_ROOT","/tmp/ss-build")
def L(t): return {"en":t}
def build(sp):
    BD=sp.get("board","CBSE"); PF={"CBSE":"cbse","TNMATRIC":"tnm"}[BD]; CF={"CBSE":"cbse-2026-27.json","TNMATRIC":"tn-matric-2026-27.json"}[BD]
    pre=f'{PF}-{sp["cls"]}-{sp["subj_file"]}-{sp["ch"]}-{sp["topic"]}'
    blocks=[
     {"id":"story","type":"story","provenance":"original","title":L(sp["story"][0]),"text":L(sp["story"][1])},
     {"id":"explain","type":"explanation","provenance":"original","keepEnglishTerms":sp["terms"],"text":L("\n".join(sp["explain"]))},
     {"id":"teacher","type":"teacher_narration","provenance":"original","teacher":"malar","sentences":[
        {"id":f"t{i+1}","text":L(s),"board":([{"op":"clear"}] if i==0 else [])+[{"op":"write","text":b}]} for i,(s,b) in enumerate(sp["narr"])]},
     {"id":"example","type":"worked_example","provenance":"original","problem":L(sp["ex"][0]),"steps":[{"text":L(a),"why":L(b)} for a,b in sp["ex"][1]]},
     {"id":"teachback","type":"teach_back","provenance":"original","prompt":L(sp["tb"][0]),"requiredIdeas":[L(x) for x in sp["tb"][1]],"commonMisconceptions":[L(x) for x in sp["tb"][2]]},
    ]
    qs=[];ids=[]
    for q in sp["q"]:
        k,rd,key=q[0],q[1],q[2]
        base={"key":key,"round":rd,"hints":[],"provenance":"original","status":"published"}
        if k=="mcq":
            _,_,_,stem,right,wrongs,ex=q
            opts=[{"id":"right","text":L(right),"correct":True}]+[{"id":f"o{i}","text":L(w),"correct":False,"whyWrong":L(y)} for i,(w,y) in enumerate(wrongs)]
            h=int(hashlib.md5(key.encode()).hexdigest(),16)%len(opts); opts=opts[1:h+1]+[opts[0]]+opts[h+1:] if h else opts
            qs.append({**base,"type":"mcq","stem":L(stem),"options":opts,"explanation":L(ex)})
        elif k=="tf":
            _,_,_,stem,ans,ex=q; qs.append({**base,"type":"true_false","stem":L(stem),"answer":ans,"explanation":L(ex)})
        else:
            _,_,_,stem,acc,ex=q; qs.append({**base,"type":"short","stem":L(stem),"accepted":acc,"wrongAnswers":[],"explanation":L(ex)})
        if rd==1: ids.append(key)
    blocks+= [{"id":"quiz","type":"quiz","provenance":"original","questionIds":ids},
              {"id":"summary","type":"summary","provenance":"original","points":[L(x) for x in sp["summary"]]}]
    head={"board":BD,"classLevel":sp["cls"],"subject":sp["subj"],"chapter":sp["ch"],"topic":sp["topic"]}
    json.dump({**head,"lesson":{"status":"published","title":L(sp["name_en"]),"blocks":blocks}},open(f"{ROOT}/content/lessons/{pre}.json","w"),ensure_ascii=False,indent=1)
    json.dump({**head,"questions":qs},open(f"{ROOT}/content/questions/{pre}.json","w"),ensure_ascii=False,indent=1)
    # curriculum topic
    cp=f"{ROOT}/content/curriculum/{CF}"; d=json.load(open(cp))
    for c in d["classes"]:
        if c["classLevel"]!=sp["cls"]: continue
        for s in c["subjects"]:
            if s["slug"]!=sp["subj"]: continue
            for ch in s["chapters"]:
                if ch["slug"]!=sp["ch"]: continue
                if not any(t["slug"]==sp["topic"] for t in ch.setdefault("topics",[])):
                    ch["topics"].append({"slug":sp["topic"],"name":{"en":sp["name_en"],"ta":sp["name_ta"]},"objectives":[{"text":L(o)} for o in sp["objectives"]]})
    json.dump(d,open(cp,"w"),ensure_ascii=False,indent=2); open(cp,"a").write("\n")
    print("built",pre,len(qs),"questions")
