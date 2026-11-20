import json,sys,os
p=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..","content","curriculum","cbse-2026-27.json")
d=json.load(open(p,encoding="utf8")); s=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"pe_subject.json"),encoding="utf8"))
c=[x for x in d["classes"] if x["classLevel"]==5][0]
if not any(x["slug"]==s["slug"] for x in c["subjects"]):
    c["subjects"].append(s); json.dump(d,open(p,"w",encoding="utf8"),indent=2,ensure_ascii=False); print("added")
else: print("already present")
