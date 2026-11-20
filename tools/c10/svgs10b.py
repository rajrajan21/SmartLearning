import json,os
D='/tmp/ss-build/apps/web/public/assets/lessons/'
def esc(t): return t.replace('&','&amp;').replace('<','&lt;')
def svg(n,W,H,body):
    open(D+n,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" role="img"><rect width="{W}" height="{H}" fill="#ffffff"/><g font-family="sans-serif" font-size="15" fill="#222">{body}</g></svg>')
def timeline(n,title,ev):
    W=720;H=60+len(ev)*58
    b=f'<text x="20" y="28" font-size="18" font-weight="bold">{esc(title)}</text><line x1="150" y1="50" x2="150" y2="{H-10}" stroke="#555" stroke-width="3"/>'
    for i,(y,t) in enumerate(ev):
        yy=75+i*58
        b+=f'<circle cx="150" cy="{yy}" r="8" fill="#c0392b"/><text x="20" y="{yy+5}" font-weight="bold" fill="#c0392b">{esc(y)}</text><text x="172" y="{yy+5}">{esc(t)}</text>'
    svg(n,W,H,b)
def boxes(n,title,top,kids,colors=('#d6eaf8','#fdebd0','#d5f5e3','#f9e79f','#fadbd8')):
    W=720;H=250
    b=f'<text x="20" y="28" font-size="18" font-weight="bold">{esc(title)}</text><rect x="260" y="45" width="200" height="44" rx="8" fill="#ebdef0" stroke="#333"/><text x="360" y="73" text-anchor="middle" font-weight="bold">{esc(top)}</text>'
    k=len(kids); w=(W-40)/k
    for i,(h,sub) in enumerate(kids):
        x=20+i*w; cx=x+w/2
        b+=f'<line x1="360" y1="89" x2="{cx}" y2="135" stroke="#555" stroke-width="2"/><rect x="{x+6}" y="135" width="{w-12}" height="95" rx="8" fill="{colors[i%5]}" stroke="#333"/><text x="{cx}" y="160" text-anchor="middle" font-weight="bold">{esc(h)}</text>'
        for j,l in enumerate(sub.split('|')): b+=f'<text x="{cx}" y="{182+j*18}" text-anchor="middle" font-size="13">{esc(l)}</text>'
    svg(n,W,H,b)
timeline('c10-timeline-salt-march.svg','Road to freedom: key dates',[('1919','Rowlatt Act; Jallianwala Bagh (13 April)'),('1920-22','Non-Cooperation Movement; ends after Chauri Chaura'),('1927','Simon Commission arrives, boycotted'),('Dec 1929','Lahore Congress demands Purna Swaraj'),('1930','Salt March, Sabarmati to Dandi; Civil Disobedience'),('1931-32','Gandhi-Irwin Pact; Poona Pact')])
timeline('c10-timeline-unification.svg','Nationalism in Europe',[('1789','French Revolution: nation and citizen'),('1804','Napoleonic Code'),('1815','Treaty of Vienna restores conservative rule'),('1834','Zollverein: German customs union'),('1861','Italy united under Victor Emmanuel II'),('1871','Germany united under Prussia')])
boxes('c10-resource-classification.svg','Classification of resources','Resources',[('Origin','Biotic|Abiotic'),('Exhaustibility','Renewable|Non-renewable'),('Ownership','Individual|Community|National|International'),('Development','Potential|Developed|Stock|Reserves')])
boxes('c10-three-sectors.svg','Three sectors of the economy','Economy',[('Primary','Agriculture|Dairy|Mining'),('Secondary','Factories|Making goods'),('Tertiary','Banking|Transport|Teaching')])
boxes('c10-three-lists.svg','Division of powers in India','Constitution',[('Union List','Defence|Foreign affairs|Currency'),('State List','Police|Agriculture|Trade'),('Concurrent List','Education|Marriage|Forests')])
boxes('c10-cropping-seasons.svg','Cropping seasons','Crops',[('Rabi','Sown in winter|Wheat, gram'),('Kharif','Sown with monsoon|Rice, maize'),('Zaid','Between rabi and kharif|Watermelon, cucumber')])
boxes('c10-power-sharing-forms.svg','Forms of power sharing','Power sharing',[('Horizontal','Legislature|Executive|Judiciary'),('Vertical','Union|State|Local'),('Social groups','Community|Reservation'),('Parties','Coalition|Movements')])
boxes('c10-consumer-courts.svg','Consumer courts (COPRA 1986)','Consumer complaint',[('District','District Forum'),('State','State Commission'),('National','National Commission')])
boxes('c10-story-plot.svg','Plot of a story','Story',[('Beginning','Characters|Setting'),('Problem','Conflict|Rising action'),('Climax','Turning point'),('End','Resolution|Message')])
print('svgs done')
M={('social-science','geo-resources-and-development','resources-and-development'):('c10-resource-classification.svg','Tree chart of four ways to classify resources','Classification of resources'),
('social-science','hist-nationalism-in-india','nationalism-in-india'):('c10-timeline-salt-march.svg','Timeline from 1919 to 1932','Key dates of the national movement'),
('social-science','hist-rise-of-nationalism-in-europe','rise-of-nationalism-in-europe'):('c10-timeline-unification.svg','Timeline of nationalism in Europe','1789 to 1871'),
('social-science','eco-sectors-of-the-indian-economy','sectors-of-the-indian-economy'):('c10-three-sectors.svg','Primary, secondary and tertiary sectors','Three sectors'),
('social-science','civ-federalism','federalism'):('c10-three-lists.svg','Union, State and Concurrent lists','Three lists'),
('social-science','geo-agriculture','agriculture'):('c10-cropping-seasons.svg','Rabi, kharif and zaid seasons','Cropping seasons'),
('social-science','civ-power-sharing','power-sharing'):('c10-power-sharing-forms.svg','Four forms of power sharing','Forms of power sharing'),
('social-science','eco-consumer-rights','consumer-rights'):('c10-consumer-courts.svg','District, State and National consumer commissions','Three-tier courts')}
for i in range(1,10):
    pass
for (s,c,t),(a,alt,cap) in M.items():
    f=f'/tmp/ss-build/content/lessons/cbse-10-{s}-{c}-{t}.json'; d=json.load(open(f)); bl=d['lesson']['blocks']
    if any(b['type']=='diagram' for b in bl): continue
    i=[k for k,b in enumerate(bl) if b['type']=='explanation'][0]
    bl.insert(i+1,{"id":"diagram","type":"diagram","provenance":"original","assetKey":a,"altText":{"en":alt},"caption":{"en":cap}})
    json.dump(d,open(f,'w'),indent=2,ensure_ascii=False)
import glob
for f in glob.glob('/tmp/ss-build/content/lessons/cbse-10-english-*.json'):
    d=json.load(open(f)); bl=d['lesson']['blocks']
    if any(b['type']=='diagram' for b in bl): continue
    i=[k for k,b in enumerate(bl) if b['type']=='explanation'][0]
    bl.insert(i+1,{"id":"diagram","type":"diagram","provenance":"original","assetKey":"c10-story-plot.svg","altText":{"en":"Plot diagram: beginning, problem, climax, end"},"caption":{"en":"Follow the plot of the story"}})
    json.dump(d,open(f,'w'),indent=2,ensure_ascii=False)
print('attached')
