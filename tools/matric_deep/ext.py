import sys,re
f,a,b=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
L=open(f,encoding='utf8',errors='ignore').read().split('\n')[a-1:b]
out=[];
for l in L:
    s=re.sub(r'\s+',' ',l).strip()
    if len(s)<4 or 'indd' in s or 'tntextbooks' in s: continue
    out.append(s)
t=' '.join(out)
if len(sys.argv)>4: t=t[:int(sys.argv[4])]
print(t)
