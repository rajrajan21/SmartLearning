import re,sys
def paras(path):
    t=open(path,errors='ignore').read()
    t=re.sub(r'[ \t]+',' ',t)
    P=[re.sub(r'\s*\n\s*',' ',p).strip() for p in re.split(r'\n\s*\n',t)]
    P=[p for p in P if len(p)>180 and 'Reprint' not in p and '.indd' not in p and p.count('_')<4]
    return P
def pick(path,words=800):
    P=paras(path); tot=sum(len(p.split()) for p in P)
    if tot<=words: return P
    step=tot/words; out=[];acc=0.0;w=0
    for p in P:
        acc+=len(p.split())
        if acc>=step: 
            out.append(p[:520]); w+=len(out[-1].split()); acc=0
        if w>=words: break
    return out
if __name__=='__main__':
    wd=int(sys.argv[1])
    for p in sys.argv[2:]:
        print('=====',p.split('/')[-1]); print('\n'.join(pick(p,wd)))
