import os,glob,json,re
R=os.path.expanduser('~/mnt/d/Smart Learning Website')
OUT=R+'/apps/web/public/assets/lessons/'; LES=R+'/content/lessons/'
def svg(body,h=320):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 {h}" width="100%" role="img"><rect width="520" height="{h}" fill="#ffffff"/><g font-family="sans-serif" font-size="14" fill="#222" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'
def subs(s): return re.sub(r'(?<=[A-Za-z\)])(\d+)',lambda m:m.group(1).translate(str.maketrans('0123456789','₀₁₂₃₄₅₆₇₈₉')),s)
def T(x,y,s,c="#222",sz=14,a="start",w="normal"): s=subs(s); return f'<text x="{x}" y="{y}" font-size="{sz}" fill="{c}" text-anchor="{a}" font-weight="{w}">{s}</text>'
def Ln(x1,y1,x2,y2,c="#333",w=2,d=""): return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"'+(f' stroke-dasharray="{d}"' if d else '')+'/>'
def Ci(x,y,r,f="none",c="#333",w=2): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}" stroke="{c}" stroke-width="{w}"/>'
def Rc(x,y,w,h,f="none",c="#333",sw=2,rx=0): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{f}" stroke="{c}" stroke-width="{sw}"/>'
def Pg(pts,f="none",c="#333",w=2): return f'<polygon points="{pts}" fill="{f}" stroke="{c}" stroke-width="{w}"/>'
def Ar(x1,y1,x2,y2,c="#333",w=2): return Ln(x1,y1,x2,y2,c,w)+f'<polygon points="{x2},{y2} {x2-9 if x2>x1 else x2+9},{y2-5} {x2-9 if x2>x1 else x2+9},{y2+5}" fill="{c}"/>'
RED="#c0392b"; BLU="#2874a6"; GRN="#1e8449"; LB="#eaf4fb"; LY="#fdf2d0"
D={}
# 1 mass conservation
def flask(cx,top=70):
    return Pg(f"{cx-14},{top} {cx+14},{top} {cx+14},{top+40} {cx+55},{top+120} {cx-55},{top+120} {cx-14},{top+40}","#eaf4fb","#333",2)
b=T(130,24,"Set-up 1: open flask",BLU,15,"middle","bold")+T(390,24,"Set-up 2: balloon tied on",BLU,15,"middle","bold")
b+=flask(130)+T(130,170,"vinegar +",'#333',12,"middle")+T(130,186,"baking soda",'#333',12,"middle")
for i,x in enumerate((112,130,148)):
    b+=Ar(x,64,x,36-0,RED,1.5) if False else Ln(x,66,x,44,RED,1.5)+f'<polygon points="{x},40 {x-4},47 {x+4},47" fill="{RED}"/>'
b+=T(130,214,"CO2 escapes into the air",RED,13,"middle")+T(130,236,"Final reading is LOWER",RED,14,"middle","bold")
b+=flask(390)+T(390,170,"vinegar +",'#333',12,"middle")+T(390,186,"baking soda",'#333',12,"middle")
b+=Ci(390,52,22,"#d5f5e3",GRN,2)+Ln(390,74,390,70,GRN,2)+T(390,56,"CO2",GRN,12,"middle")
b+=T(390,214,"gas is trapped in the balloon",GRN,13,"middle")+T(390,236,"Final reading is the SAME",GRN,14,"middle","bold")
b+=T(260,285,"Mass is conserved either way: the gas in set-up 1 simply left the balance.",'#333',13,"middle")
D['mass-conservation']=svg(b,305)
# 2 covalent bonds
def dots(pts,c): return "".join(Ci(x,y,3,c,c,1) for x,y in pts)
b=T(260,22,"Covalent bonds: atoms share pairs of electrons",BLU,15,"middle","bold")
b+=Ci(110,80,36,LB)+Ci(170,80,36,LB)+T(88,85,"H",'#222',15,"middle","bold")+T(192,85,"H",'#222',15,"middle","bold")+dots([(140,73),(140,87)],RED)+T(140,140,"H2   H–H   single bond",'#222',13,"middle")
b+=Ci(330,80,40,LB)+Ci(400,80,40,LB)+T(308,85,"O",'#222',15,"middle","bold")+T(422,85,"O",'#222',15,"middle","bold")
b+=dots([(361,68),(369,68),(361,92),(369,92)],RED)+dots([(322,38),(338,38),(322,122),(338,122),(392,38),(408,38),(392,122),(408,122)],BLU)+T(365,152,"O2   O=O   double bond",'#222',13,"middle")
b+=Ci(92,232,28,LB)+Ci(150,232,40,LB)+Ci(208,232,28,LB)+T(80,237,"H",'#222',14,"middle","bold")+T(150,237,"O",'#222',15,"middle","bold")+T(220,237,"H",'#222',14,"middle","bold")
b+=dots([(115,226),(115,238),(185,226),(185,238)],RED)+dots([(142,194),(158,194),(142,272),(158,272)],BLU)+T(150,300,"H2O   oxygen shares one pair with each H",'#222',13,"middle")
b+=Ci(330,232,28,LB)+Ci(392,232,40,LB)+T(318,237,"H",'#222',14,"middle","bold")+T(392,237,"Cl",'#222',15,"middle","bold")
b+=dots([(355,226),(355,238)],RED)+dots([(384,194),(400,194),(384,272),(400,272),(430,226),(430,238)],BLU)+T(380,300,"HCl   H–Cl   single bond",'#222',13,"middle")
b+=T(260,322,"red dots = shared pair   blue dots = electrons not shared",'#555',12,"middle")
D['covalent-bonds']=svg(b,336)
# 3 ionic NaCl
b=T(260,22,"Ionic bond in sodium chloride: electron transfer",BLU,15,"middle","bold")
b+=Ci(70,100,32,LB)+T(70,104,"Na",'#222',15,"middle","bold")+T(70,150,"2, 8, 1",'#555',12,"middle")
b+=Ci(200,100,22,"#fdebd0",RED)+T(200,105,"Na+",RED,14,"middle","bold")+T(200,150,"2, 8",'#555',12,"middle")
b+=Ci(330,100,32,LB)+T(330,104,"Cl",'#222',15,"middle","bold")+T(330,150,"2, 8, 7",'#555',12,"middle")
b+=Ci(460,100,38,"#d6eaf8",BLU)+T(460,105,"Cl–",BLU,14,"middle","bold")+T(460,156,"2, 8, 8",'#555',12,"middle")
b+=Ar(105,100,172,100,'#555',1.5)+T(138,92,"loses 1 e–",RED,12,"middle")
b+=Ar(365,100,418,100,'#555',1.5)+T(392,92,"gains 1 e–",BLU,12,"middle")
b+=Ln(110,58,300,58,RED,1.5,"5")+f'<polygon points="300,58 292,54 292,62" fill="{RED}"/>'+T(205,52,"the electron moves to chlorine",RED,12,"middle")
b+=Ci(215,235,22,"#fdebd0",RED)+T(215,240,"Na+",RED,14,"middle","bold")+Ci(275,235,38,"#d6eaf8",BLU)+T(275,240,"Cl–",BLU,14,"middle","bold")
b+=T(260,292,"Opposite charges attract: the electrostatic attraction is the ionic bond (NaCl)",'#333',13,"middle")
D['ionic-nacl']=svg(b,310)
# 4 criss-cross
b=T(260,22,"Criss-cross the charges to write the formula",BLU,15,"middle","bold")
def block(x,a,ca,b_,cb,res,note,col):
    s=T(x,60,a,'#222',20,"middle","bold")+T(x+110,60,b_,'#222',20,"middle","bold")
    s+=T(x,96,ca,BLU,17,"middle")+T(x+110,96,cb,RED,17,"middle")
    s+=Ln(x+4,104,x+98,160,BLU,1.5)+Ln(x+106,104,x+12,160,RED,1.5)
    s+=T(x+55,195,res,col,24,"middle","bold")+T(x+55,222,note,'#555',12,"middle")
    return s
b+=block(70,"Al","3+","O","2–","Al2O3","3 and 2 swap places",GRN)
b+=block(330,"Mg","2+","O","2–","Mg2O2 → MgO","divide by common factor 2",GRN)
b+=T(260,262,"Use brackets for repeated polyatomic ions, e.g. Al2(SO4)3 and Mg(OH)2",'#333',13,"middle")
D['criss-cross']=svg(b,280)
os.makedirs(OUT,exist_ok=True)
for k,v in D.items(): open(OUT+f'c89-{k}.svg','w',encoding='utf-8').write(v)
M=[('laws-of-chemical','mass-conservation','Two flasks: with the flask open the reading falls because carbon dioxide escapes; with the balloon tied on the reading is unchanged','Why the open flask loses mass but the closed one does not'),
('how-atoms-combine','covalent-bonds','Electron-sharing diagrams for H2, O2, H2O and HCl','Covalent bonds by sharing electron pairs'),
('how-atoms-combine','ionic-nacl','Sodium loses one electron to become Na+ and chlorine gains it to become Cl-, then the ions attract','Ionic bond in sodium chloride'),
('chemical-formulae','criss-cross','Criss-cross of charges for aluminium oxide and magnesium oxide','Writing formulae by criss-crossing'),]
n=0
for part,key,alt,cap in M:
    fs=glob.glob(LES+f'cbse-9-science-ch09-*{part}*.json')
    if not fs: print('MISSING',part); continue
    f=fs[0]; d=json.load(open(f)); bl=d['lesson']['blocks']
    if any(b_.get('assetKey')==f'c89-{key}.svg' for b_ in bl): continue
    idx=[k for k,b_ in enumerate(bl) if b_['type']=='diagram']
    i=(idx[-1] if idx else [k for k,b_ in enumerate(bl) if b_['type']=='explanation'][0])
    bl.insert(i+1,{"id":"diagram" if not idx else f"diagram{len(idx)+1}","type":"diagram","provenance":"original","assetKey":f"c89-{key}.svg","altText":{"en":alt},"caption":{"en":cap}})
    json.dump(d,open(f,'w'),indent=2,ensure_ascii=False); n+=1
print('svgs',len(D),'attached',n)
