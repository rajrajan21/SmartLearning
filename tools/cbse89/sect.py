import re,sys
def sect(f,per=380,maxs=9):
    t=open(f,errors='ignore').read()
    t=re.sub(r'-\n','',t); t=re.sub(r'[ \t]+',' ',t)
    L=[l.strip() for l in t.split('\n')]
    out=[];i=0
    while i<len(L) and len(out)<maxs:
        if re.match(r'^\d{1,2}\.\d{1,2} [A-Z][^.]{4,70}$',L[i]):
            body=[];j=i+1
            while j<len(L) and len(' '.join(body))<per and not re.match(r'^\d{1,2}\.\d{1,2} [A-Z]',L[j]):
                x=L[j]
                if len(x)>35 and not re.match(r'^(Fig|Activity|Table|y |Think|Let)',x): body.append(x)
                j+=1
            out.append(L[i]+' :: '+' '.join(body)[:per]); i=j
        else: i+=1
    return '\n'.join(out)
for p in sys.argv[1:]: print('=====',p); print(sect(p))
