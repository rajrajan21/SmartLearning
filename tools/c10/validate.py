import json,glob,sys
cur=json.load(open('content/curriculum/cbse-2026-27.json'))
c=[x for x in cur['classes'] if x['classLevel']==10][0]
topics={(s['slug'],ch['slug'],t['slug']) for s in c['subjects'] for ch in s['chapters'] for t in ch['topics']}
bad=0;n=0
for f in sorted(glob.glob('content/lessons/cbse-10-*.json')):
    L=json.load(open(f)); q=json.load(open(f.replace('lessons','questions')))
    n+=1; k=(L['subject'],L['chapter'],L['topic'])
    if k not in topics: print('NOTOPIC',f); bad+=1
    keys=[x['key'] for x in q['questions']]
    if len(set(keys))!=len(keys): print('DUPKEY',f); bad+=1
    qb=[b for b in L['lesson']['blocks'] if b['type']=='quiz'][0]
    for i in qb['questionIds']:
        if i not in keys: print('MISSINGQ',f,i); bad+=1
    for x in q['questions']:
        if x['type']=='mcq':
            if not 2<=len(x['options'])<=5 or sum(o['correct'] for o in x['options'])!=1: print('MCQ',f,x['key']); bad+=1
            texts=[o['text']['en'] for o in x['options']]
            if len(set(texts))!=len(texts): print('DUPOPT',f,x['key']); bad+=1
        if x['type']=='number':
            if any(w['value']==x['answer'] for w in x['wrongAnswers']): print('NUMWRONG',f,x['key']); bad+=1
        if x['type']=='short' and any(len(a)>60 for a in x['accepted']): print('SHORT',f,x['key']); bad+=1
    if len(keys)<8: print('FEWQ',f)
print(n,'lessons, problems:',bad)
