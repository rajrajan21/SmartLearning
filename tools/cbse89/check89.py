import json,glob,os,re
R=os.path.expanduser("~/mnt/d/Smart Learning Website")
slug=re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
cat=json.load(open(R+'/content/curriculum/cbse-2026-27.json'))
topics=set()
for c in cat['classes']:
    for s in c['subjects']:
        for ch in s['chapters']:
            for t in ch['topics']: topics.add((c['classLevel'],s['slug'],ch['slug'],t['slug']))
bad=n=0
for f in sorted(glob.glob(R+'/content/lessons/cbse-[89]-*.json')):
    L=json.load(open(f,encoding='utf-8')); n+=1
    for k in('subject','chapter','topic'):
        if not slug.match(L[k]): print('slug',f,k); bad+=1
    if (L['classLevel'],L['subject'],L['chapter'],L['topic']) not in topics: print('not in catalog',os.path.basename(f)); bad+=1
    qf=f.replace('/lessons/','/questions/')
    if not os.path.exists(qf): print('no questions',f); bad+=1; continue
    q=json.load(open(qf,encoding='utf-8')); keys=[x['key'] for x in q['questions']]
    if len(keys)!=len(set(keys)): print('dup keys',f); bad+=1
    ids=set()
    for b in L['lesson']['blocks']:
        if b['id'] in ids: print('dup block',f); bad+=1
        ids.add(b['id'])
        if b['type']=='quiz':
            for k in b['questionIds']:
                if k not in keys: print('missing q',k,f); bad+=1
        if b['type']=='teacher_narration' and len(b['sentences'])<8: print('thin narration',os.path.basename(f)); 
    for x in q['questions']:
        if x['type']=='mcq':
            if sum(o['correct'] for o in x['options'])!=1: print('mcq correct count',f,x['key']); bad+=1
print(n,'lessons checked, problems',bad)
