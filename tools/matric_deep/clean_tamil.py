"""Cleans the text layer of the TN Tamil textbooks (doubled vowel signs / stray U+FFFD from the PDF font) and writes content/books/text/matric-tamil-<cls>.txt (one page per block).
Usage: python3 clean_tamil.py   (needs pdftotext)"""
import re, subprocess, os, glob
ROOT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
SIGNS='ாிீுூெேைொோௌ்'
def clean(t):
    t=t.replace('�','').replace('​','')
    t=re.sub('(['+SIGNS+'])\\1+',r'\1',t)         # doubled signs
    t=re.sub('ொ([ோொ])',r'ொ',t)
    return t
out=os.path.join(ROOT,'content','books','text'); os.makedirs(out,exist_ok=True)
for cls,pat in ((9,'9th Class/Class_9_Tamil*.pdf'),(10,'10th Class/Class_10_Tamil*.pdf')):
    for f in glob.glob(os.path.join(ROOT,'content','books','pdf','Matric',pat)):
        raw=subprocess.run(['pdftotext','-layout',f,'-'],capture_output=True,text=True).stdout
        pages=raw.split('\f'); txt='\n'.join(f'=== page {i+1} ===\n'+clean(p) for i,p in enumerate(pages))
        open(os.path.join(out,f'matric-tamil-{cls}.txt'),'w',encoding='utf8').write(txt); print(cls,len(pages),'pages',len(txt),'chars')
