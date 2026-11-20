# Matric (TN) deepening helpers. Run any author_*.py from here: python3 author_x.py
import json, os, re
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(os.path.join(HERE,'..','..'))
CUR=os.path.join(ROOT,'content','curriculum','tn-matric-2026-27.json')
SVGD=os.path.join(ROOT,'apps','web','public','assets','lessons')
def T(s): return {"en": s}
def _q(spec,key,rnd):
    k,rest=spec.split('|',1); p=rest.split('|')
    base={"key":key,"round":rnd,"hints":[],"provenance":"original","status":"published"}
    if k=='m':
        stem,right,wr,ex=p[:4]; opts=[{"id":"right","text":T(right),"correct":True}]
        for i,w in enumerate([x for x in wr.split(';') if x]):
            why=None
            if '~' in w: w,why=w.split('~',1)
            o={"id":f"o{i}","text":T(w.strip()),"correct":False,"whyWrong":T(why or "Not quite - read the explanation and try the working again.")}; opts.append(o)
        base.update(type="mcq",stem=T(stem),options=opts,explanation=T(ex))
    elif k=='t':
        stem,ans,ex=p[:3]; base.update(type="true_false",stem=T(stem),answer=(ans.strip().lower()=='true'),explanation=T(ex))
    elif k=='n':
        stem,ans,ex=p[:3]; v=float(ans); v=int(v) if v==int(v) else v
        base.update(type="number",stem=T(stem),answer=v,tolerance=0 if isinstance(v,int) else 0.01,wrongAnswers=[],explanation=T(ex))
    elif k=='s':
        stem,acc,ex=p[:3]; base.update(type="short",stem=T(stem),accepted=[a.strip() for a in acc.split('/')],wrongAnswers=[],explanation=T(ex))
    else: raise ValueError(spec)
    return base
def lesson(cls,subj,chap,topic,title,story_title,story,expl,example,teachback,summary,qs,svg=None,tname=None):
    """expl: list of 'sentence @ boardword'. example=(problem,[(step,why)]). teachback=(prompt,[ideas],[misc]). qs: compact specs."""
    ex=[]
    for e in expl:
        a,_,b=e.partition(' @ '); ex.append((a.strip(),b.strip() or None))
    keep=[]
    for _,w in ex:
        if w and w not in keep: keep.append(w)
    pre=f"tnm{cls}{subj[:2]}{abs(hash(topic))%9000+1000}"
    pre=f"m{cls}{subj[:2]}{sum(ord(c) for c in topic)%900+100}"
    questions=[]
    for i,s in enumerate(qs,1):
        rnd=1 if i<=3 else (2 if i<=6 else 3)
        questions.append(_q(s,f"r{rnd}-{pre}-{i}",rnd))
    blocks=[{"id":"story","type":"story","provenance":"original","title":T(story_title),"text":T(story)},
      {"id":"explain","type":"explanation","provenance":"original","keepEnglishTerms":keep[:8],"text":T("\n".join(x for x,_ in ex))}]
    if svg:
        os.makedirs(SVGD,exist_ok=True); fn=f"tnm-{cls}-{topic}.svg"
        open(os.path.join(SVGD,fn),'w',encoding='utf8').write(svg[0]); 
        blocks.append({"id":"diagram","type":"diagram","provenance":"original","assetKey":fn,"altText":T(svg[1]),"caption":T(svg[2])})
    sents=[]
    for i,(x,w) in enumerate(ex,1):
        b=[]
        if i==1: b.append({"op":"clear"})
        if w: b.append({"op":"write","text":w})
        sents.append({"id":f"t{i}","text":T(x),"board":b})
    blocks.append({"id":"teacher","type":"teacher_narration","provenance":"original","teacher":"malar","sentences":sents})
    blocks.append({"id":"example","type":"worked_example","provenance":"original","problem":T(example[0]),"steps":[{"text":T(a),"why":T(b)} for a,b in example[1]]})
    blocks.append({"id":"teachback","type":"teach_back","provenance":"original","prompt":T(teachback[0]),"requiredIdeas":[T(x) for x in teachback[1]],"commonMisconceptions":[T(x) for x in teachback[2]]})
    blocks.append({"id":"quiz","type":"quiz","provenance":"original","questionIds":[q["key"] for q in questions if q["round"]<=2][:6]})
    blocks.append({"id":"summary","type":"summary","provenance":"original","points":[T(x) for x in summary]})
    L={"board":"TNMATRIC","classLevel":cls,"subject":subj,"chapter":chap,"topic":topic,"lesson":{"status":"published","title":T(title),"blocks":blocks}}
    n=f"tnm-{cls}-{subj}-{chap}-{topic}.json"
    json.dump(L,open(os.path.join(ROOT,'content','lessons',n),'w',encoding='utf8'),indent=2,ensure_ascii=False)
    json.dump({"board":"TNMATRIC","classLevel":cls,"subject":subj,"chapter":chap,"topic":topic,"questions":questions},open(os.path.join(ROOT,'content','questions',n),'w',encoding='utf8'),indent=2,ensure_ascii=False)
    register(cls,subj,chap,topic,tname or title)
def register(cls,subj,chap,topic,name):
    d=json.load(open(CUR,encoding='utf8'))
    c=[x for x in d['classes'] if x['classLevel']==cls][0]; s=[x for x in c['subjects'] if x['slug']==subj][0]
    ch=[x for x in s['chapters'] if x['slug']==chap][0]
    if not any(t['slug']==topic for t in ch['topics']):
        ch['topics'].append({"slug":topic,"name":T(name),"objectives":[{"text":T("Understand "+name)},{"text":T("Use it to answer textbook-style questions")}]})
        json.dump(d,open(CUR,'w',encoding='utf8'),indent=2,ensure_ascii=False)
# ---- svg helpers ----
def svg(w,h,body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" role="img"><rect width="{w}" height="{h}" fill="#ffffff"/><g font-family="sans-serif" font-size="16" fill="#222">{body}</g></svg>'
def venn(a,b,inter,la='A',lb='B'):
    return svg(460,240,f'<circle cx="170" cy="120" r="85" fill="#aed6f1" fill-opacity=".6" stroke="#333"/><circle cx="290" cy="120" r="85" fill="#f9e79f" fill-opacity=".6" stroke="#333"/><text x="100" y="125" text-anchor="middle">{a}</text><text x="230" y="125" text-anchor="middle">{inter}</text><text x="350" y="125" text-anchor="middle">{b}</text><text x="120" y="35" font-weight="bold">{la}</text><text x="320" y="35" font-weight="bold">{lb}</text>')
def numline(lo,hi,marks,note=''):
    W=520;x=lambda v:30+(v-lo)*(W-60)/(hi-lo); s=f'<line x1="30" y1="100" x2="{W-30}" y2="100" stroke="#333" stroke-width="2"/>'
    for v in range(lo,hi+1): s+=f'<line x1="{x(v)}" y1="94" x2="{x(v)}" y2="106" stroke="#333"/><text x="{x(v)}" y="126" text-anchor="middle" font-size="13">{v}</text>'
    for v,l in marks: s+=f'<circle cx="{x(v)}" cy="100" r="6" fill="#e74c3c"/><text x="{x(v)}" y="78" text-anchor="middle" font-size="14">{l}</text>'
    return svg(W,170,s+f'<text x="30" y="155" font-size="14">{note}</text>')
def grid(pts,lo=-5,hi=5,lines=()):
    S=34;O=190;s=''
    for v in range(lo,hi+1): s+=f'<line x1="{O+v*S}" y1="{O+lo*S}" x2="{O+v*S}" y2="{O+hi*S}" stroke="#e5e8e8"/><line x1="{O+lo*S}" y1="{O-v*S}" x2="{O+hi*S}" y2="{O-v*S}" stroke="#e5e8e8"/>'
    s+=f'<line x1="{O+lo*S}" y1="{O}" x2="{O+hi*S}" y2="{O}" stroke="#333" stroke-width="2"/><line x1="{O}" y1="{O-hi*S}" x2="{O}" y2="{O-lo*S}" stroke="#333" stroke-width="2"/><text x="{O+hi*S+4}" y="{O+16}">x</text><text x="{O+6}" y="{O-hi*S-4}">y</text>'
    for (x1,y1,x2,y2) in lines: s+=f'<line x1="{O+x1*S}" y1="{O-y1*S}" x2="{O+x2*S}" y2="{O-y2*S}" stroke="#2471a3" stroke-width="2.5"/>'
    for (px,py,l) in pts: s+=f'<circle cx="{O+px*S}" cy="{O-py*S}" r="5" fill="#e74c3c"/><text x="{O+px*S+7}" y="{O-py*S-7}" font-size="14">{l}</text>'
    return svg(2*O+30,2*O+10,s)
def tri(pts,labels,extra=''):
    (ax,ay),(bx,by),(cx,cy)=pts; s=f'<polygon points="{ax},{ay} {bx},{by} {cx},{cy}" fill="#d5f5e3" stroke="#333" stroke-width="2"/>'
    for (px,py),l in zip(pts,labels): s+=f'<text x="{px+(8 if px>200 else -22)}" y="{py+(18 if py>150 else -8)}" font-weight="bold">{l}</text>'
    return svg(460,300,s+extra)
def bars(items,title=''):
    m=max(v for _,v in items); s=f'<text x="20" y="26" font-weight="bold">{title}</text>'
    for i,(l,v) in enumerate(items):
        h=v*180/m; x=40+i*(380//len(items)); s+=f'<rect x="{x}" y="{240-h}" width="{380//len(items)-14}" height="{h}" fill="#5dade2" stroke="#333"/><text x="{x+4}" y="{236-h}" font-size="13">{v}</text><text x="{x}" y="262" font-size="13">{l}</text>'
    return svg(460,280,s)
