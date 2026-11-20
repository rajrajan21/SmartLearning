from lib import *
def L(cls,subj,slug,title,story,secs,ex,tb,summ,qs,keep=()):
    out=[]
    for i,q in enumerate(qs):
        r=1 if i<4 else 2 if i<8 else 3; k=f"{slug[:6]}{i+1}"
        if q[0]=='m': out.append(mcq(k,r,q[1],q[2],[(q[3],"Not correct. "+q[5]),(q[4],"Not correct. "+q[5])],q[5]))
        elif q[0]=='t': out.append(tf(k,r,q[1],q[2],q[3]))
        else: out.append(num(k,r,q[1],q[2],q[3]))
    chapter(cls,subj,slug,title,story,secs,ex,tb,summ,out,keep=keep)
