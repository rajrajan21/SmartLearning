import sys; sys.path.insert(0,'/tmp/ss-build/tools/c10')
from lib10 import *
R="Both A and R are true and R explains A"
def M(k,r,stem,right,w1,w2,ex):
    return mcq(k,r,stem,right,[(w1,"This does not match the text."),(w2,"This does not match the text.")],ex)
def AR(k,r,a,rs,ex):
    return mcq(k,r,f"Assertion (A): {a} Reason (R): {rs}",R,[("A is true but R is false","R is stated in the story."),("A is false but R is true","A matches the story.")],ex)
def lesson(S,pre,bookname,i,title,story,expl,ex,tb,summ,qs):
    build(S,f'{pre}-{i}',slug(title),title,story[0],story[1],expl,ex,tb,summ,qs,cname=f'{bookname} {i}: {title}',tname=title)
