import json,glob,os,sys,xml.dom.minidom,re
R=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
pat=sys.argv[1] if len(sys.argv)>1 else 'tnm-*'
bad=0
for f in sorted(glob.glob(f'{R}/content/lessons/{pat}.json')):
    n=os.path.basename(f); L=json.load(open(f,encoding='utf8')); Q=json.load(open(f'{R}/content/questions/{n}',encoding='utf8'))
    keys={q['key'] for q in Q['questions']}
    if len(keys)!=len(Q['questions']): print(n,'dup keys');bad+=1
    for q in Q['questions']:
        if q['type']=='mcq':
            if sum(o['correct'] for o in q['options'])!=1 or len(q['options'])<3: print(n,'mcq',q['key']);bad+=1
        if not q.get('explanation'): print(n,'noexp',q['key']);bad+=1
    for b in L['lesson']['blocks']:
        if b['type']=='quiz':
            for k in b['questionIds']:
                if k not in keys: print(n,'quiz id',k);bad+=1
        if b['type']=='diagram':
            p=f"{R}/apps/web/public/assets/lessons/{b['assetKey']}"
            try: xml.dom.minidom.parse(p)
            except Exception as e: print(n,'svg',e);bad+=1
        if b['type']=='teacher_narration' and len(b['sentences'])<6: print(n,'short narration');bad+=1
    if len(Q['questions'])<8: print(n,'few questions');bad+=1
print('checked',len(glob.glob(f'{R}/content/lessons/{pat}.json')),'problems',bad)
# stray '~' in option text
for f in glob.glob(f'{R}/content/questions/{pat}.json'):
    for q in json.load(open(f,encoding='utf8'))['questions']:
        for o in q.get('options',[]):
            if '~' in o['text']['en']: print(os.path.basename(f),'tilde in option',q['key'])
