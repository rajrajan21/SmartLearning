import sys,json; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
def L(S,ch,slug,en,story,exp,terms,ex,claim,summ,facts,tf,sa):
    """facts: 4 x (stem,right,w1,w2); tf: (true stmt,false stmt); sa: (question,answer)"""
    f=facts
    quiz=["m|%s|%s|%s|%s|Think again."%f[0],"t|%s|T|Yes."%tf[0],"m|%s|%s|%s|%s|Think again."%f[1],"t|%s|F|Not so."%tf[1],
      "m|%s|%s|%s|%s|Think again."%f[2],"s|%s|%s|Check the lesson."%sa,"m|%s|%s|%s|%s|Think again."%f[3],"t|We learn best by trying examples.|T|Yes."]
    steps=[(x,"Step %d."%(i+1)) for i,x in enumerate(ex[1])]
    T(S,ch,slug,en,story,exp,terms,(ex[0],steps),(claim[0],claim[1],["Check the idea again."]),summ,quiz)
def add_class5():
    P='content/curriculum/cbse-2026-27.json'; d=json.load(open(P))
    if any(c['classLevel']==5 for c in d['classes']): return
    tb=lambda t:{"title":t,"publisher":"NCERT","edition":"2026-27","sourceRef":"https://ncert.nic.in/textbook.php"}
    def subj(slug,en,ta,t,chs): return {"slug":slug,"name":{"en":en,"ta":ta},"textbook":tb(t),"chapters":[{"slug":s,"name":{"en":n},"topics":[]} for s,n in chs]}
    from gen5_chapters import MATHS,EVS,ENG
    d['classes'].append({"classLevel":5,"subjects":[subj("maths","Mathematics","கணிதம்","Maths Mela",MATHS),subj("evs","Environmental Studies (The World Around Us)","சுற்றுச்சூழல் அறிவியல்","Our Wondrous World",EVS),subj("english","English","ஆங்கிலம்","Santoor",ENG)]})
    d['classes'].sort(key=lambda c:c['classLevel'])
    json.dump(d,open(P,'w'),ensure_ascii=False,indent=2); open(P,'a').write("\n")
