import json,glob,os,re
Q="/tmp/ss-build/content/questions/"
def mk(sub,key,items):
    fs=glob.glob(Q+f"cbse-5-{sub}-*{key}.json")
    # exact: file name cbse-5-{sub}-{chapter}-{topic}; key is chapter-topic
    f=Q+f"cbse-5-{sub}-{key}.json"
    d=json.load(open(f)); out=[]
    for n,it in enumerate(items):
        t,r=it[0],it[1]; k=f"r{r}-tb{n}{abs(hash(key))%1000}"
        base=dict(key=k,round=r,hints=[],provenance="original",status="published")
        if t=="m":
            stem,right,w1,w2,ex=it[2:7]; opts=[("o0",w1,False),("o1",w2,False)]
            opts.insert(n%3,("right",right,True))
            options=[]
            for i,tx,c in opts:
                o=dict(id=i,text={"en":tx},correct=c)
                if not c:o["whyWrong"]={"en":"Not quite. Look again at the lesson."}
                options.append(o)
            out.append(dict(base,type="mcq",stem={"en":stem},options=options,explanation={"en":ex}))
        elif t=="t":
            out.append(dict(base,type="true_false",stem={"en":it[2]},answer=it[3],explanation={"en":it[4]}))
        else:
            out.append(dict(base,type="short",stem={"en":it[2]},accepted=it[3],wrongAnswers=[],explanation={"en":it[4]}))
    d["questions"]=out; json.dump(d,open(f,"w"),ensure_ascii=False,indent=1)
    return len(out)
