import re,sys
def clean(t):
    t=re.sub(r'^.*\.indd.*$','',t,flags=re.M)
    t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    return t
def lessons(path):
    t=clean(open(path,encoding='utf-8',errors='ignore').read())
    parts=re.split(r'(?=Let us do these activities before we read)',t)
    return parts
def lang(part):
    i=part.find('Let us learn')
    return part[i:] if i>=0 else ''
if __name__=='__main__':
    p=lessons(sys.argv[1]); k=int(sys.argv[2])
    print(len(p)); print(p[k][:200].replace('\n',' | ')); print('-----'); print(lang(p[k])[:int(sys.argv[3])])
