import json,glob,os,re,sys,unicodedata
def nrm(x): return ''.join(c for c in unicodedata.normalize('NFKD',x) if not unicodedata.combining(c))
H=os.path.expanduser('~/c67w/')
txt={6:open(H+'class-6_social-science.pdf.txt',encoding='utf-8',errors='ignore').read().lower()}
txt[7]=(open(H+'class-7_social-science-part-1.pdf.txt',encoding='utf-8',errors='ignore').read()+open(H+'class-7_social-science-part-2.pdf.txt',encoding='utf-8',errors='ignore').read()).lower()
for k in txt: txt[k]=nrm(txt[k]); txt[k]=re.sub(r'(?<=\d),(?=\d)','',txt[k]); txt[k]=re.sub(r'\s+',' ',txt[k])
def alltext(j):
    out=[]
    for b in j['lesson']['blocks']:
        if b['type']=='teacher_narration': out+= [s['text']['en'] for s in b['sentences']]
        elif b['type']=='worked_example':
            out.append(b['problem']['en']); out+=[s['text']['en']+' '+s['why']['en'] for s in b['steps']]
    return ' '.join(out)
res={}
for f in sorted(glob.glob('content/lessons/cbse-[67]-social-science-*whole-chapter.json')):
    cls=int(os.path.basename(f)[5]); j=json.load(open(f,encoding='utf-8')); t=alltext(j)
    t2=re.sub(r'(?<=\d),(?=\d)','',t)
    nums=set(re.findall(r'\b\d{2,4}\b',t2))
    miss=[n for n in nums if n not in txt[cls]]
    words=set(re.findall(r'(?<![.!?]\s)(?<!^)\b[A-Z][a-z]{3,}\b',t))
    mw=[w for w in words if w.lower() not in txt[cls]]
    res[os.path.basename(f)[10:-19]]=(sorted(miss),sorted(mw))
json.dump(res,open(H+'fc.json','w'))
tot=0
for k,(a,b) in res.items():
    print(k[:48],'| N:',','.join(a[:12]),'| W:',','.join(b[:10]))
