import json,glob,os,sys
sys.path.insert(0,os.path.dirname(__file__))
from lib import ROOT,T
FIX={
'r1-m10sc678-3':('audible sound','Audible sound lies between 20 Hz and 20 kHz.'),
'r3-m10sc678-7':('1 s','Sound needs only about 0.1 s of gap to be heard as a separate echo, not a whole second.'),
'r1-m10sc771-1':('Hugo de Vries','De Vries rediscovered Mendel\'s laws; he is not called the Father of Genetics.'),
'r2-m10sc771-4':('9 : 3 : 3 : 1','That is the dihybrid ratio, not the monohybrid one.'),
'r3-m10sc771-8':('fruit flies','Fruit flies were used later by Morgan, not by Mendel.'),
'r1-m10sc286-1':('nephron','The nephron is the unit of the kidney.'),
'r1-m10sc286-3':('axon','The axon is the long fibre that carries the impulse away from the cell body.'),
'r3-m10sc286-7':('respiration','Respiration is a different life process.'),
'r3-m10sc286-8':('chemical energy only','Impulses are carried as electrical signals along the neuron and chemical signals across the synapse.'),
'r2-m10sc642-5':('an electron changes orbit','That does not change the nucleus.'),
'r3-m10sc642-8':('beta particles','Beta particles penetrate more than alpha but far less than gamma rays.'),
'r2-m10sc761-4':('degree Fahrenheit','Fahrenheit is not an SI unit.'),
'r3-m10sc761-8':('tensor quantity','Temperature has only magnitude, so it is a scalar.'),
}
n=0
for f in glob.glob(f'{ROOT}/content/questions/tnm-10-science-*.json'):
    d=json.load(open(f,encoding='utf8')); ch=False
    for q in d['questions']:
        if q['key'] in FIX and q['type']=='mcq' and len(q['options'])<3:
            t,w=FIX[q['key']]; q['options'].append({"id":"o9","text":T(t),"correct":False,"whyWrong":T(w)}); ch=True; n+=1
    if ch: json.dump(d,open(f,'w',encoding='utf8'),indent=2,ensure_ascii=False)
print('fixed',n)
