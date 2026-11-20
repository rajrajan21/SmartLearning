import re,sys
sys.path.insert(0,'.')
from digest3 import *
U={1:["The Wit that Won Hearts","A Concrete Example","Wisdom Paves the Way"],2:["A Tale of Valour","Somebody’s Mother","Verghese Kurien"],3:["The Case of the Fifth Word","The Magic Brush of Dreams","Spectacular Wonders"],4:["The Cherry Tree","Harvest Hymn","Waiting for the Rain"],5:["Feathered Friend","Magnifying Glass","Bibha Chowdhuri"]}
for u,ts in U.items():
    t=open(f'_text/hepr10{u}.txt',errors='ignore').read()
    pos=[]
    for x in ts:
        m=[mm.start() for mm in re.finditer(re.escape(x),t)]
        pos.append(m[0] if m else -1)
    print('unit',u,pos,len(t))
    pos2=[p for p in pos if p>=0]+[len(t)]
    for i,x in enumerate(ts):
        if pos[i]<0: continue
        end=min([p for p in pos+[len(t)] if p>pos[i]] or [len(t)])
        seg=t[pos[i]:end]
        open(f'_text/piece_{u}_{i+1}.txt','w').write(seg)
        print(u,i+1,x,len(seg.split()))
