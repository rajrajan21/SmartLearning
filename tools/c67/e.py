from lib import *
def E(cls,slug,title,story,secs,ex,tb,summ,qs,keep=(),svgs=()):
    """English lesson. qs: ('m',stem,right,[(wrong,why),..],expl) | ('t',stem,ans,expl) | ('s',stem,[accepted],expl)"""
    out=[]
    for i,q in enumerate(qs):
        r=1 if i<4 else 2 if i<8 else 3; k=f"q{i+1}"
        if q[0]=='m': out.append(mcq(k,r,q[1],q[2],q[3],q[4]))
        elif q[0]=='t': out.append(tf(k,r,q[1],q[2],q[3]))
        else: out.append(short(k,r,q[1],q[2],q[3]))
    chapter(cls,'english',slug,title,story,secs,ex,tb,summ,out,keep=keep,svgs=svgs)
