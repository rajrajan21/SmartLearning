import json,os
def prune(cls,subj,ch,slugs,subj_file=None):
    subj_file=subj_file or subj
    p='/tmp/ss-build/content/curriculum/cbse-2026-27.json'
    c=json.load(open(p))
    for cl in c['classes']:
      if cl['classLevel']!=cls: continue
      for s in cl['subjects']:
        if s['slug']!=subj: continue
        for x in s['chapters']:
          if x['slug']==ch:
            x['topics']=[t for t in x['topics'] if (t if isinstance(t,str) else t['slug']) not in slugs]
    json.dump(c,open(p,'w'),ensure_ascii=False,indent=2)
    for sl in slugs:
      for d in('lessons','questions'):
        f=f'/tmp/ss-build/content/{d}/cbse-{cls}-{subj_file}-{ch}-{sl}.json'
        if os.path.exists(f): os.remove(f)
