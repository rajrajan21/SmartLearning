import os,glob,json,re
R=os.path.expanduser('~/mnt/d/Smart Learning Website')
OUT=R+'/apps/web/public/assets/lessons/'; LES=R+'/content/lessons/'
def svg(body,h=320):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 {h}" width="100%" role="img"><rect width="520" height="{h}" fill="#ffffff"/><g font-family="sans-serif" font-size="13" fill="#222" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'
def T(x,y,s,c="#222",sz=13,a="start",w="normal"): return f'<text x="{x}" y="{y}" font-size="{sz}" fill="{c}" text-anchor="{a}" font-weight="{w}">{s}</text>'
def Ln(x1,y1,x2,y2,c="#333",w=2,d=""): return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"'+(f' stroke-dasharray="{d}"' if d else '')+'/>'
def Ci(x,y,r,f="none",c="#333",w=2): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}" stroke="{c}" stroke-width="{w}"/>'
def Rc(x,y,w,h,f="none",c="#333",sw=2,rx=6): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{f}" stroke="{c}" stroke-width="{sw}"/>'
def Pg(pts,f="none",c="#333",w=2): return f'<polygon points="{pts}" fill="{f}" stroke="{c}" stroke-width="{w}"/>'
def Ar(x1,y1,x2,y2,c="#333",w=2):
    import math
    a=math.atan2(y2-y1,x2-x1); s=9
    p=f"{x2},{y2} {x2-s*math.cos(a-0.4):.1f},{y2-s*math.sin(a-0.4):.1f} {x2-s*math.cos(a+0.4):.1f},{y2-s*math.sin(a+0.4):.1f}"
    return Ln(x1,y1,x2-4*math.cos(a),y2-4*math.sin(a),c,w)+f'<polygon points="{p}" fill="{c}"/>'
def box(x,y,w,h,lines,f="#eaf4fb",c="#2874a6",tc="#222",sz=13,bold_first=True):
    s=Rc(x,y,w,h,f,c,2)
    n=len(lines); lh=sz+4; y0=y+h/2-(n-1)*lh/2+4
    for i,l in enumerate(lines): s+=T(x+w/2,y0+i*lh,l,tc,sz,"middle","bold" if (i==0 and bold_first) else "normal")
    return s
RED="#c0392b"; BLU="#2874a6"; GRN="#1e8449"; LB="#eaf4fb"; LY="#fdf2d0"; LG="#d5f5e3"; LR="#fadbd8"; GY="#555"
D={}
def timeline(title,rows,h=None):
    h=h or 60+len(rows)*30
    b=T(260,24,title,BLU,15,"middle","bold")+Ln(150,44,150,h-14,"#999",3)
    for i,(yr,tx) in enumerate(rows):
        y=64+i*30
        b+=T(138,y+4,yr,RED,14,"end","bold")+Ci(150,y,6,BLU,BLU,1)+T(165,y+4,tx,"#222",13)
    return svg(b,h)
D['freedom-timeline']=timeline("India's road to independence",[("1858","British Crown takes direct control after 1857"),("1885","Indian National Congress founded, Bombay"),("1905","Partition of Bengal (annulled 1911)"),("1915","Gandhi returns from South Africa"),("1920–22","Non-Cooperation Movement"),("1929","Lahore session demands Purna Swaraj"),("1930","Dandi Salt March, Civil Disobedience"),("1942","Quit India Movement"),("1947","15 August: independence and Partition")])
D['colonial-timeline']=timeline("The colonial era in India",[("1498","Vasco da Gama finds the sea route to India"),("1600","English East India Company begins"),("1741","Travancore defeats the Dutch at Colachel"),("1757","Battle of Plassey won by the Company"),("1764","Battle of Buxar won by the Company"),("1857","The revolt of 1857"),("1858","The Crown takes over: the British Raj begins")])
# resources
b=T(260,24,"Classifying natural resources",BLU,15,"middle","bold")+box(180,40,160,34,["Natural resources"],LY,"#b7950b")
b+=Ln(260,74,260,92,GY,1.5)+Ln(120,92,400,92,GY,1.5)+Ln(120,92,120,104,GY,1.5)+Ln(400,92,400,104,GY,1.5)
b+=box(30,104,180,30,["By renewability"],LB)+box(310,104,180,30,["By origin"],LB)
for x,items in ((20,[("Renewable","sunlight, wind","can be replaced",LG,GRN),("Non-renewable","coal, petroleum","get used up",LR,RED)]),(300,[("Biotic","forests, fish","from living things",LG,GRN),("Abiotic","minerals, water","non-living",LR,RED)])):
    for j,(n,e,d,f,c) in enumerate(items):
        b+=Ln(x+100,134,x+(50 if j==0 else 150),160,GY,1.5)+box(x+(0 if j==0 else 100),160,100,80,[n,e,d],f,c,sz=11)
b+=T(260,275,"Sustainable use: meet today's needs without harming future generations",GY,12,"middle")
D['resource-classes']=svg(b,295)
# parliament
b=T(260,22,"The Indian parliamentary system",BLU,15,"middle","bold")+box(170,32,180,28,["Government: three organs"],LY,"#b7950b")
for x,t,s_,f in ((10,"Legislature","makes laws",LB),(185,"Executive","carries out laws",LG),(360,"Judiciary","interprets laws",LR)):
    b+=Ln(260,60,x+75,78,GY,1.5)+box(x,78,150,40,[t,s_],f)
b+=Ln(85,118,85,136,GY,1.5)+box(10,136,240,96,["Parliament","President","Lok Sabha: House of the People","(directly elected, five-year term)","Rajya Sabha: Council of States","(permanent; one-third retire every 2 years)"],"#fff",BLU,sz=11)
b+=Ln(260,118,260,127,GY,1.5)+Ln(260,127,390,127,GY,1.5)+Ln(390,127,390,136,GY,1.5)+box(270,136,240,96,["Real and nominal executive","President: head of state (nominal)","Prime Minister + Council of Ministers","= the real executive"],"#fff",GRN,sz=11)
b+=Ar(270,184,252,184,RED,2.5)+T(260,254,"The Council of Ministers is collectively responsible to the Lok Sabha",RED,12,"middle")
b+=T(260,274,"The party or alliance with a majority in the Lok Sabha forms the government",GY,12,"middle")
D['parliament']=svg(b,292)
# elections
steps=[("Electoral roll","Eligible voters are listed"),("Constituencies","The country is divided into constituencies"),("Candidates","Parties and candidates follow the Model Code of Conduct"),("Voting on EVMs","Secret ballot, one vote each, no proxy voting"),("First past the post","In each constituency the candidate with most votes wins")]
b=T(260,24,"How an election works",BLU,15,"middle","bold")
for i,(a_,c_) in enumerate(steps):
    y=40+i*46
    b+=Rc(20,y,480,34,LB,BLU,2,6)+T(32,y+22,str(i+1),RED,15,"start","bold")+T(60,y+15,a_,"#222",13,"start","bold")+T(60,y+29,c_,GY,11)
    if i<4: b+=Ar(260,y+34,260,y+46,GY,1.5)
b+=Rc(20,274,480,40,LG,GRN,2,6)+T(260,292,"The Election Commission of India, an independent body,",GRN,12,"middle","bold")+T(260,308,"conducts free and fair elections",GRN,12,"middle","bold")
b+=T(260,336,"Universal adult franchise: every citizen aged 18 or above has one vote of equal value",GY,11,"middle")
D['election-steps']=svg(b,352)
# atmosphere
b=T(260,22,"Layers of the atmosphere",BLU,15,"middle","bold")
layers=[("Exosphere","#f4f6f7"),("Thermosphere","#e8eef4"),("Mesosphere","#d6e6f4"),("Stratosphere","#bcd9f0"),("Troposphere","#8fc3ea")]
hs=[40,40,42,50,70]; y=38; ys={}
for (n,f),h in zip(layers,hs):
    b+=Rc(60,y,170,h,f,BLU,1.5,0)+T(145,y+h/2+4,n,'#222',13,"middle","bold"); ys[n]=y+h/2; y+=h
b+=T(60,y+16,"Earth's surface",GY,12)
b+=Ar(250,ys["Troposphere"],236,ys["Troposphere"],GRN,1.5)+T(256,ys["Troposphere"]+4,"weather happens here",GRN,12)
b+=Ar(250,ys["Stratosphere"],236,ys["Stratosphere"],RED,1.5)+T(256,ys["Stratosphere"]+4,"ozone layer absorbs UV rays",RED,12)
y2=y+42
b+=T(60,y2,"Air is mostly:",'#222',13,"start","bold")
b+=Rc(60,y2+8,343,22,"#aed6f1",BLU,1,0)+T(231,y2+24,"Nitrogen about 78%",'#222',12,"middle")
b+=Rc(403,y2+8,92,22,"#f9e79f","#b7950b",1,0)+T(449,y2+24,"Oxygen about 21%",'#222',11,"middle")
b+=T(60,y2+50,"with small amounts of argon, carbon dioxide and water vapour",GY,12)
D['atmosphere-layers']=svg(b,y2+66)
# plate boundaries
b=T(260,22,"What plates do at their boundaries",BLU,15,"middle","bold")
def plates(x,kind):
    if kind=="tra":
        s=Rc(x,56,55,36,"#e59866","#a04000",1.5,0)+Rc(x+65,76,55,36,"#e59866","#a04000",1.5,0)
        return s+Ar(x+27,50,x+27,36,RED,2.5)+Ar(x+92,118,x+92,132,RED,2.5)
    s=Rc(x,66,55,36,"#e59866","#a04000",1.5,0)+Rc(x+65,66,55,36,"#e59866","#a04000",1.5,0)
    if kind=="div": s+=Ar(x-4,84,x-20,84,RED,2.5)+Ar(x+124,84,x+140,84,RED,2.5)
    if kind=="con": s+=Ar(x-20,84,x-4,84,RED,2.5)+Ar(x+140,84,x+124,84,RED,2.5)
    return s
b+=plates(40,"div")+plates(215,"con")+plates(390,"tra")
b+=T(100,160,"Move apart",'#222',14,"middle","bold")+T(275,160,"Collide",'#222',14,"middle","bold")+T(450,160,"Slide past",'#222',14,"middle","bold")
b+=T(260,200,"These movements cause earthquakes, volcanoes and mountain building.",'#333',13,"middle")
b+=T(260,222,"Plates are pieces of the lithosphere moving slowly over the softer layer below.",GY,12,"middle")
D['plate-boundaries']=svg(b,238)
# early civilisations
steps=[["Hunting and","gathering"],["Stone tools","and fire"],["Farming and","animal rearing"],["Settled","villages"],["River-valley","cities"],["Writing for","records"]]
pos=[(10,40),(180,40),(350,40),(350,110),(180,110),(10,110)]
b=T(260,22,"From early humans to civilisations",BLU,15,"middle","bold")
for i,(l,(x,y)) in enumerate(zip(steps,pos)):
    b+=box(x,y,160,44,l,LB if i<4 else LG,BLU if i<4 else GRN,sz=12,bold_first=False)
b+=Ar(170,62,180,62,GY,1.5)+Ar(340,62,350,62,GY,1.5)+Ar(430,84,430,110,GY,1.5)+Ar(350,132,340,132,GY,1.5)+Ar(180,132,170,132,GY,1.5)
b+=T(260,196,"Early civilisations grew along rivers",'#222',14,"middle","bold")
for x,t,s_ in ((20,"Indus","Indian subcontinent"),(190,"Nile","Egypt"),(360,"Tigris and Euphrates","Mesopotamia")):
    b+=box(x,210,140,50,[t,s_],LY,"#b7950b",sz=11)
b+=Ln(160,235,190,235,RED,2,"4")+Ln(330,235,360,235,RED,2,"4")
b+=T(260,290,"Civilisations traded: Indus beads and seals have been found in Mesopotamia",RED,12,"middle")
b+=T(260,310,"Their cities had planned streets, drains, trade and craft work.",GY,12,"middle")
D['early-civilisations']=svg(b,326)
# demand supply
b=T(260,20,"Demand, supply and market equilibrium",BLU,15,"middle","bold")
b+=Ar(80,250,470,250,"#333",2)+Ar(80,250,80,34,"#333",2)+T(470,270,"Quantity",'#222',12,"end")+T(80,30,"Price",'#222',12,"middle")
b+=Ln(120,70,440,220,BLU,3)+T(446,226,"Demand",BLU,13,"start","bold")+Ln(120,220,440,70,GRN,3)+T(446,66,"Supply",GRN,13,"start","bold")
b+=Ci(280,145,6,RED,RED,1)+T(292,175,"Equilibrium",RED,13,"start","bold")+Ln(80,145,280,145,RED,1.5,"4")+Ln(280,145,280,250,RED,1.5,"4")
b+=T(76,149,"P*",RED,12,"end","bold")+T(280,266,"Q*",RED,12,"middle","bold")
b+=Ln(173,95,387,95,"#b7950b",2.5)+T(280,88,"surplus: sellers cut the price",'#b7950b',12,"middle")
b+=Ln(173,195,387,195,"#8e44ad",2.5)+T(280,214,"shortage: the price rises",'#8e44ad',12,"middle")
D['demand-supply']=svg(b,284)
os.makedirs(OUT,exist_ok=True)
for k,v in D.items(): open(OUT+f'c89-{k}.svg','w',encoding='utf-8').write(v)
M=[('8','ch09-','freedom-timeline','Timeline of India\'s road to independence from 1858 to 1947','Key dates on the road to independence'),
('8','ch04-','colonial-timeline','Timeline of the colonial era from 1498 to 1858','Key dates of the colonial era'),
('8','ch01-','resource-classes','Tree classifying natural resources by renewability and by origin','Types of natural resources'),
('8','ch06-','parliament','The three organs of government and the structure of Parliament and the executive','How the parliamentary system is organised'),
('8','ch05-','election-steps','Five steps of an election and the role of the Election Commission','How an election works'),
('9','ch03-','atmosphere-layers','Five layers of the atmosphere and the composition of air','Layers and composition of the atmosphere'),
('9','ch02-','plate-boundaries','Plates moving apart, colliding and sliding past each other','Three kinds of plate boundary'),
('9','ch04-','early-civilisations','From early humans to river-valley civilisations','The path from hunting to civilisations'),
('9','ch09-','demand-supply','Demand and supply curves meeting at the equilibrium point','Market equilibrium')]
n=0
for cl,ch,key,alt,cap in M:
    fs=[f for f in sorted(glob.glob(LES+f'cbse-{cl}-social-science-{ch}*.json'))]
    if not fs: print('MISSING',cl,ch); continue
    f=fs[0]; d=json.load(open(f)); bl=d['lesson']['blocks']
    if any(b_.get('assetKey')==f'c89-{key}.svg' for b_ in bl): continue
    idx=[k for k,b_ in enumerate(bl) if b_['type']=='diagram']
    i=(idx[-1] if idx else [k for k,b_ in enumerate(bl) if b_['type']=='explanation'][0])
    bl.insert(i+1,{"id":"diagram" if not idx else f"diagram{len(idx)+1}","type":"diagram","provenance":"original","assetKey":f"c89-{key}.svg","altText":{"en":alt},"caption":{"en":cap}})
    json.dump(d,open(f,'w'),indent=2,ensure_ascii=False); n+=1
print('svgs',len(D),'attached',n)
