import json,os
SUF=" (additional, not in the textbook)"
def mark(cls,subj,ch,slugs,subj_file=None):
    subj_file=subj_file or subj
    p='/tmp/ss-build/content/curriculum/cbse-2026-27.json'
    c=json.load(open(p))
    for cl in c['classes']:
      if cl['classLevel']!=cls: continue
      for s in cl['subjects']:
        if s['slug']!=subj: continue
        for x in s['chapters']:
          if x['slug']!=ch: continue
          for t in x['topics']:
            if t['slug'] in slugs and not t['name']['en'].endswith(SUF):
              t['name']['en']+=SUF
    json.dump(c,open(p,'w'),ensure_ascii=False,indent=2)
    for sl in slugs:
      f=f'/tmp/ss-build/content/lessons/cbse-{cls}-{subj_file}-{ch}-{sl}.json'
      if os.path.exists(f):
        l=json.load(open(f)); t=l['lesson']['title']
        if not t['en'].endswith(SUF): t['en']+=SUF
        json.dump(l,open(f,'w'),ensure_ascii=False,indent=2)
