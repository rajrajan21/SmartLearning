import json,html
OUT='apps/web/public/assets/lessons/'
def box(x,y,w,h,lines,fill,stroke='#334155',bold=True):
    s=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
    n=len(lines); 
    for i,l in enumerate(lines):
        ty=y+h/2+(i-(n-1)/2)*20+5
        wt='700' if (i==0 and bold) else '400'
        s+=f'<text x="{x+w/2}" y="{ty}" text-anchor="middle" font-family="Arial,sans-serif" font-size="{15 if i==0 else 13}" font-weight="{wt}" fill="#0f172a">{html.escape(l)}</text>'
    return s
def arrow(x1,y1,x2,y2,label=''):
    s=f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#475569" stroke-width="2.5" marker-end="url(#a)"/>'
    if label: s+=f'<text x="{(x1+x2)/2+6}" y="{(y1+y2)/2-4}" font-family="Arial" font-size="12" fill="#475569">{html.escape(label)}</text>'
    return s
def svg(w,h,title,body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img"><defs><marker id="a" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 z" fill="#475569"/></marker></defs>'
     f'<rect width="{w}" height="{h}" fill="#ffffff"/><text x="{w/2}" y="30" text-anchor="middle" font-family="Arial" font-size="19" font-weight="700" fill="#0f172a">{html.escape(title)}</text>{body}</svg>')
D={}
# 1 three organs
b=box(40,70,220,80,['Legislature','makes the laws'],'#dbeafe')+box(340,70,220,80,['Executive','carries out the laws'],'#dcfce7')+box(640,70,220,80,['Judiciary','courts settle disputes'],'#fef3c7')
b+=arrow(260,110,340,110)+arrow(560,110,640,110)
b+='<text x="450" y="185" text-anchor="middle" font-family="Arial" font-size="14" fill="#475569">Kept separate, working together: checks and balances</text>'
b+=box(60,215,230,50,['Centre (national level)'],'#e2e8f0',bold=False)+box(335,215,230,50,['State level'],'#e2e8f0',bold=False)+box(610,215,230,50,['Local level'],'#e2e8f0',bold=False)
D['c67-organs-government.svg']=(svg(900,290,'Three organs of government, three levels',b),
 'Diagram: legislature makes laws, executive carries them out, judiciary settles disputes; government works at Centre, State and local levels.',
 'The three organs of government and its three levels.','6-social-science-grassroots-democracy-part-1-governance')
# 2 panchayati raj
b=box(280,55,340,62,['Zila Parishad','district level'],'#fde68a')+box(280,145,340,62,['Panchayat Samiti','block level'],'#fed7aa')
b+=box(280,235,340,62,['Gram Panchayat','Sarpanch or Pradhan is its head'],'#bbf7d0')+box(280,325,340,62,['Gram Sabha','all adult voters of the village'],'#bae6fd')
b+=arrow(450,325,450,297,'elect members')+arrow(450,235,450,207,'coordinate')+arrow(450,145,450,117)
b+='<text x="640" y="268" font-family="Arial" font-size="13" fill="#475569">Patwari keeps land records</text>'
D['c67-panchayati-raj.svg']=(svg(900,410,'Panchayati Raj: the rural pyramid',b),
 'Diagram: Gram Sabha elects the Gram Panchayat headed by the Sarpanch, with Panchayat Samiti at block level and Zila Parishad at district level above.',
 'Levels of rural local government.','6-social-science-grassroots-democracy-part-2-local-government-in-rural-areas')
# 3 urban
b=box(50,70,240,110,['Municipal Corporation','cities over 10 lakh people','head: Mayor','e.g. Chennai, Indore'],'#fde68a')
b+=box(330,70,240,110,['Municipal Council','towns of 1 to 10 lakh','also called Nagar Palika'],'#fed7aa')
b+=box(610,70,240,110,['Nagar Panchayat','smaller places changing','from rural to urban'],'#bbf7d0')
b+=box(250,240,400,60,['Wards','each ward elects its councillor or corporator'],'#bae6fd')
b+=arrow(170,180,330,240)+arrow(450,180,450,240)+arrow(730,180,570,240)
D['c67-urban-bodies.svg']=(svg(900,330,'Urban local bodies by population',b),
 'Diagram: Municipal Corporation for cities over 10 lakh, Municipal Council for 1 to 10 lakh, Nagar Panchayat for small transitioning towns, all made of elected ward members.',
 'Kinds of urban local body and their ward base.','6-social-science-grassroots-democracy-part-3-local-government-in-urban-areas')
for k,(s,alt,cap,slug) in D.items():
    open(OUT+k,'w',encoding='utf8').write(s)
    f=f'content/lessons/cbse-{slug}-whole-chapter.json'
    d=json.load(open(f,encoding='utf8')); bl=d['lesson']['blocks']
    if any(x['type']=='diagram' for x in bl): continue
    i=next(j for j,x in enumerate(bl) if x['type']=='explanation')
    bl.insert(i+1,{"id":"diagram","type":"diagram","provenance":"original","assetKey":k,"altText":{"en":alt},"caption":{"en":cap}})
    json.dump(d,open(f,'w',encoding='utf8'),ensure_ascii=False,indent=2)
    print('attached',k)
