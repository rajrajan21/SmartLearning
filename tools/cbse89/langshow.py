import sys,re
from langx import *
f,k=sys.argv[1],int(sys.argv[2]); L=int(sys.argv[3]) if len(sys.argv)>3 else 4500
p=lessons(f); l=lang(p[k])
a=l.find('Let us listen'); learn=l[:a] if a>0 else l[:L]
out=learn[:L]
for key in ('Let us speak','Let us write'):
    i=l.find(key)
    if i>=0: out+="\n["+key+"] "+re.sub(r'\n',' ',l[i+len(key):i+len(key)+650])
print(out)
