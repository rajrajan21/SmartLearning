import re,sys
def clean(path):
    t=open(path,errors='ignore').read()
    t=re.sub(r'[ \t]+',' ',t); return [l.strip() for l in t.split('\n')]
def digest(path,maxw=1000,per=2):
    L=clean(path); out=[]; w=0; i=0
    hd=re.compile(r'^(\d+\.\d+(\.\d+)?)\s+[A-Z]')
    key=re.compile(r'(is called|are called|is known as|is defined|we call|called |theorem|formula|property|Remember|Note that|means )',re.I)
    sec=None;buf=[]
    def flush():
        nonlocal w
        if sec is None: return
        txt=' '.join(buf); sents=re.split(r'(?<=[.?!])\s+',txt)
        pick=[s for s in sents if 25<len(s)<260][:per]
        extra=[s for s in sents if key.search(s) and 25<len(s)<260 and s not in pick][:2]
        s='## '+sec+'\n'+' '.join(pick+extra); out.append(s); w+=len(s.split())
    for l in L:
        if not l or 'Reprint' in l or '.indd' in l: continue
        if hd.match(l) and len(l)<80 and not l.endswith('.'):
            flush(); sec=l; buf=[]
        elif sec is not None and len(buf)<60: buf.append(l)
        if w>maxw: break
    flush()
    if not out:
        return digest_fb(path,maxw)
    return '\n'.join(out)
def digest_fb(path,maxw):
    import digest as d; return d.digest(path,maxw)
if __name__=='__main__':
    mw=int(sys.argv[1]);
    for p in sys.argv[2:]: print('=====',p); print(digest(p,mw))
