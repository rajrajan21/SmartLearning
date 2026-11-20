"""Enrich an already-rewritten Class 5 lesson with extra textbook paragraphs recovered from rendered pages, and optionally
a locally generated SVG diagram (saved to apps/web/public/assets/lessons/, referenced by a diagram block)."""
import json,os
ROOT=os.environ.get("SS_ROOT","/tmp/ss-build")
ASSET=f"{ROOT}/apps/web/public/assets/lessons"
os.makedirs(ASSET,exist_ok=True)
import re
def sents(paras):
    out=[]
    for p in paras:
        for s in re.split(r'(?<=[.!?])\s+',p.strip()):
            if s: out.append(s)
    return out
def enrich(sub,key,add,diagram=None,terms=None):
    f=f'{ROOT}/content/lessons/cbse-5-{sub}-{key}.json'
    d=json.load(open(f)); bl=d["lesson"]["blocks"]
    ex=[b for b in bl if b["type"]=="explanation"][0]
    if add and add[0] in ex["text"]["en"]: return "skip"
    ex["text"]["en"]+="\n"+"\n".join(add)
    nar=[b for b in bl if b["type"]=="teacher_narration"][0]
    n=len(nar["sentences"])
    for s in sents(add)[:14]:
        n+=1; nar["sentences"].append({"id":f"t{n}","text":{"en":s},"board":[]})
    if diagram:
        fn,svg,alt,cap=diagram
        open(f"{ASSET}/{fn}","w").write(svg)
        i=[j for j,b in enumerate(bl) if b["type"]=="explanation"][0]
        bl.insert(i+1,{"id":"diagram","type":"diagram","provenance":"original","assetKey":fn,"altText":{"en":alt},"caption":{"en":cap}})
    json.dump(d,open(f,"w"),ensure_ascii=False,indent=1); return "ok"
# ---------- SVG helpers (plain text, no external resources)
W=640
def svg(h,body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="100%" role="img"><rect width="{W}" height="{h}" fill="#ffffff"/><g font-family="sans-serif" font-size="16" fill="#222">{body}</g></svg>'
def frac_bars(rows):
    """rows: list of (num,den) shown as bars of same length"""
    y=20;b=""
    for n,d in rows:
        w=480/d
        for i in range(d):
            b+=f'<rect x="{80+i*w:.1f}" y="{y}" width="{w:.1f}" height="30" fill="{"#f4c542" if i<n else "#fff"}" stroke="#b5651d"/>'
        b+=f'<text x="20" y="{y+21}">{n}/{d}</text>'; y+=44
    return svg(y+4,b)
def numline(maxv,den,labels=None,h=90):
    """number line 0..maxv with ticks every 1/den; labels dict tick_index->text"""
    x0,x1=40,600; steps=int(maxv*den); b=f'<line x1="{x0}" y1="40" x2="{x1}" y2="40" stroke="#222" stroke-width="2"/>'
    for i in range(steps+1):
        x=x0+(x1-x0)*i/steps; major=(i%den==0)
        b+=f'<line x1="{x:.1f}" y1="{30 if major else 34}" x2="{x:.1f}" y2="46" stroke="#222"/>'
        t=(labels or {}).get(i, (str(i//den) if major else f"{i}/{den}"))
        b+=f'<text x="{x:.1f}" y="68" text-anchor="middle" font-size="13">{t}</text>'
    return svg(h,b)
def grid(rows,cols,shade=(),cell=34,label=None):
    b=""
    for r in range(rows):
        for c in range(cols):
            b+=f'<rect x="{20+c*cell}" y="{20+r*cell}" width="{cell}" height="{cell}" fill="{"#8fd18f" if (r,c) in shade else "#fff"}" stroke="#555"/>'
    h=rows*cell+60
    if label: b+=f'<text x="20" y="{h-14}">{label}</text>'
    return svg(h,b)
