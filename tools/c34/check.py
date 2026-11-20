import json,glob,os,sys
R=os.path.expanduser("~/mnt/d/Smart Learning Website")
bad=0;n=0
for f in sorted(glob.glob(R+'/content/lessons/cbse-[34]-*-whole-chapter.json')):
    L=json.load(open(f)); q=json.load(open(f.replace('/lessons/','/questions/')))
    n+=1; keys={x['key'] for x in q['questions']}; ids=set()
    for b in L['lesson']['blocks']:
        if b['id'] in ids: print('dup block',f); bad+=1
        ids.add(b['id'])
        if b['type']=='quiz':
            for k in b['questionIds']:
                if k not in keys: print('missing q',k,f); bad+=1
        if b['type']=='diagram' and not os.path.exists(R+'/apps/web/public/assets/lessons/'+b['assetKey']): print('no svg',f); bad+=1
    for x in q['questions']:
        if x['type']=='mcq' and sum(o['correct'] for o in x['options'])!=1: print('mcq',x['key']); bad+=1
    if len(keys)!=len(q['questions']): print('dup keys',f); bad+=1
print(n,'files, problems',bad)
