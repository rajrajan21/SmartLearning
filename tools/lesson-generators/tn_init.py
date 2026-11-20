import json,sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
from tn_chapters import *
P='/tmp/ss-build/content/curriculum/tn-matric-2026-27.json'
import os
d=json.load(open(P)) if os.path.exists(P) else {"boardCode":"TNMATRIC","boardName":"Tamil Nadu Matriculation","academicYear":"2026-27","isCurrent":True,"verifiedOn":"2026-11-16","verificationNote":"Chapter titles read from the contents pages of the Tamil Nadu State Board (TNSCERT) English-medium textbooks supplied by the owner. Lessons are original explanations of the textbook units, not copied text.","classes":[]}
for cl,subs in CLASSES.items():
    c=next((x for x in d['classes'] if x['classLevel']==cl),None)
    if not c: c={"classLevel":cl,"subjects":[]}; d['classes'].append(c)
    for sl_,(en,chs,ta,ed) in subs.items():
        if any(s['slug']==sl_ for s in c['subjects']): continue
        c['subjects'].append({"slug":sl_,"name":{"en":en,"ta":ta},"textbook":TB(cl,en,ed),"chapters":[{"slug":s,"name":{"en":n},"topics":[]} for s,n in chs]})
d['classes'].sort(key=lambda c:c['classLevel'])
json.dump(d,open(P,'w'),ensure_ascii=False,indent=2); open(P,'a').write("\n")
print({c['classLevel']:{s['slug']:len(s['chapters']) for s in c['subjects']} for c in d['classes']})
