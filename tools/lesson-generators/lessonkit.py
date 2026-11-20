from textlesson import build
def mk(S,ch,topic,en,ta,obj,story,explain,terms,narr,ex,tb,summary,q):
    build(dict(S,ch=ch,topic=topic,name_en=en,name_ta=ta,objectives=obj,story=story,explain=explain,terms=terms,narr=narr,ex=ex,tb=tb,summary=summary,q=q))
def qs(p,items):
    out=[]
    for i,it in enumerate(items):
        r=i//2+1; k=f"r{r}-{p}{i}"
        if it[0]=="m": out.append(("mcq",r,k,it[1],it[2],[(it[3],"Try again."),(it[4],"Try again.")],it[5]))
        elif it[0]=="t": out.append(("tf",r,k,it[1],it[2],it[3]))
        else: out.append(("short",r,k,it[1],it[2],it[3]))
    return out
