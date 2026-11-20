import json, os, re
import sys
ROOT=sys.argv[1] if len(sys.argv)>1 else '/tmp/ss-build'
P=ROOT+'/content/curriculum/cbse-2026-27.json'
SUBJ={"maths":("Mathematics","கணிதம்","Mathematics","NCERT"),"science":("Science","அறிவியல்","Science","NCERT"),
 "social-science":("Social Science","சமூக அறிவியல்","Social Science (History, Geography, Economics, Political Science)","NCERT"),
 "english":("English","ஆங்கிலம்","First Flight / Footprints Without Feet / Words and Expressions 2","NCERT")}
reg=json.load(open(ROOT+'/tools/c10/registry.json'))
d=json.load(open(P))
c=[x for x in d['classes'] if x['classLevel']==10]
if c: c=c[0]
else:
    c={"classLevel":10,"subjects":[]}; d['classes'].append(c); d['classes'].sort(key=lambda x:x['classLevel'])
for s,chs in reg.items():
    sub=[x for x in c['subjects'] if x['slug']==s]
    if sub: sub=sub[0]
    else:
        n=SUBJ[s]; sub={"slug":s,"name":{"en":n[0],"ta":n[1]},"textbook":{"title":n[2],"publisher":n[3],"edition":"2026-27","sourceRef":"https://ncert.nic.in/textbook.php"},"chapters":[]}; c['subjects'].append(sub)
    have={x['slug']:x for x in sub['chapters']}
    for cs,cv in chs.items():
        ch=have.get(cs)
        if not ch:
            ch={"slug":cs,"name":{"en":cv['name']},"topics":[]}; sub['chapters'].append(ch)
        tl={t['slug']:t for t in ch['topics']}
        for ts,tv in cv['topics'].items():
            if ts not in tl:
                ch['topics'].append({"slug":ts,"name":{"en":tv['name'],"ta":tv['name']},"objectives":[{"text":{"en":o}} for o in tv['obj']]})
json.dump(d,open(P,'w'),indent=2,ensure_ascii=False)
print({s:sum(len(v['topics']) for v in ch.values()) for s,ch in reg.items()})
