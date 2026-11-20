import re,sys
def facts(f,n=22,minlen=45,maxlen=230):
    t=open(f,errors='ignore').read()
    t=re.sub(r'-\n','',t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n(?=[a-z(])',' ',t)
    out=[];seen=set()
    key=re.compile(r'\b(is called|are called|is known as|are known as|is defined as|we call|is the (?:process|ability|ratio|rate|force)|states that|law of|SI unit|is given by|can be classified|are of two|consists of|is made up|are responsible)\b',re.I)
    for l in t.split('\n'):
        l=l.strip()
        h=re.match(r'^\d{1,2}\.\d{1,2} [A-Z][^.]{4,70}$',l)
        if h and l not in seen: out.append('## '+l); seen.add(l); continue
        for s in re.split(r'(?<=[.:])\s+',l):
            if minlen<len(s)<maxlen and key.search(s) and s not in seen and '?' not in s and not re.match(r'^\(?[ivx]+\)|Activity|Fig',s):
                out.append(s); seen.add(s)
    return '\n'.join(out[:n*3])
if __name__=='__main__':
    for p in sys.argv[1:]: print('=====',p); print(facts(p)[:2600])
