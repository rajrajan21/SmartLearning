import re,sys
def digest(path,maxw=1100):
    t=open(path,errors='ignore').read()
    t=re.sub(r'[ \t]+',' ',t); lines=[l.strip() for l in t.split('\n')]
    out=[];w=0;seen=set()
    key=re.compile(r'(is called|are called|is known as|is defined|means |we call|refers to|is the |are the |for example|therefore|law |formula|=)',re.I)
    for i,l in enumerate(lines):
        if len(l)<4 or re.match(r'^[\d\W]+$',l) or 'Reprint' in l or '.indd' in l: continue
        head = len(l)<60 and not l.endswith(('.',',',';')) and l[0].isupper() and len(l.split())<=8
        if head: s='## '+l
        elif key.search(l) and len(l)>40: s=l
        else: continue
        if s in seen: continue
        seen.add(s); out.append(s); w+=len(s.split())
        if w>maxw: break
    return '\n'.join(out)
if __name__=='__main__':
    for p in sys.argv[1:]: print('=====',p); print(digest(p))
