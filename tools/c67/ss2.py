from lib import *
def L2(cls,slug,title,story,secs,ex,tb,summ,qs,keep=(),svgs=(),subj='social-science'):
    out=[]
    for i,q in enumerate(qs):
        r=1 if i<4 else 2 if i<8 else 3; k=f"{slug[:6]}{i+1}"
        if q[0]=='m': out.append(mcq(k,r,q[1],q[2],q[3],q[4]))
        elif q[0]=='t': out.append(tf(k,r,q[1],q[2],q[3]))
        elif q[0]=='n': out.append(num(k,r,q[1],q[2],q[3],q[4] if len(q)>4 else (),q[5] if len(q)>5 else None))
        else: out.append(short(k,r,q[1],q[2],q[3],q[4] if len(q)>4 else ()))
    chapter(cls,subj,slug,title,story,secs,ex,tb,summ,out,svgs=svgs,keep=keep)
