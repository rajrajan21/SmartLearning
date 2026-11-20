"""Merge Class 8/9 catalog entries (tools/cbse89/catalog_89.json) into content/curriculum/cbse-2026-27.json of the given root.
Re-reads the target right before writing; keeps other classes untouched; keeps existing topics of other builds."""
import json,sys,os
root=sys.argv[1] if len(sys.argv)>1 else '.'
src=json.load(open(os.path.join(root,'tools/cbse89/catalog_89.json')))
P=os.path.join(root,'content/curriculum/cbse-2026-27.json')
d=json.load(open(P))
by={c['classLevel']:c for c in d['classes']}
for c in src['classes']:
    if not any(ch['topics'] for sb in c['subjects'] for ch in sb['chapters']): continue
    for sb in c['subjects']: sb['chapters']=[ch for ch in sb['chapters'] if ch['topics']]
    c['subjects']=[sb for sb in c['subjects'] if sb['chapters']]
    by[c['classLevel']]=c
d['classes']=[by[k] for k in sorted(by)]
json.dump(d,open(P,'w'),ensure_ascii=False,indent=2); open(P,'a').write("\n")
print("merged classes",[k for k in sorted(by)])
