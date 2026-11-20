import os,glob,json,math
R=os.path.expanduser('~/mnt/d/Smart Learning Website')
OUT=R+'/apps/web/public/assets/lessons/'
LES=R+'/content/lessons/'
def svg(body,h=320):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 {h}" width="100%" role="img"><rect width="520" height="{h}" fill="#ffffff"/><g font-family="sans-serif" font-size="15" fill="#222" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'
def T(x,y,s,c="#222",sz=15,a="start"): return f'<text x="{x}" y="{y}" font-size="{sz}" fill="{c}" text-anchor="{a}">{s}</text>'
def Ln(x1,y1,x2,y2,c="#333",w=2,d=""): return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"'+(f' stroke-dasharray="{d}"' if d else '')+'/>'
def Pg(pts,f="none",c="#333",w=2): return f'<polygon points="{pts}" fill="{f}" stroke="{c}" stroke-width="{w}"/>'
def Ci(x,y,r,f="none",c="#333",w=2): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}" stroke="{c}" stroke-width="{w}"/>'
def Rc(x,y,w,h,f="none",c="#333",sw=2): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{f}" stroke="{c}" stroke-width="{sw}"/>'
RED="#c0392b"; BLU="#2874a6"; GRN="#1e8449"; LB="#eaf4fb"
D={}
# 1 Cartesian plane
b=Ln(60,160,480,160)+Ln(270,20,270,300)+T(485,164,"x")+T(262,16,"y")+T(275,176,"O")
for k in range(-3,4):
    if k: b+=Ln(270+k*50,155,270+k*50,165,w=1)+Ln(265,160-k*40,275,160-k*40,w=1)
b+=T(380,70,"Quadrant I (+, +)",BLU)+T(70,70,"Quadrant II (-, +)",BLU)+T(70,260,"Quadrant III (-, -)",BLU)+T(380,260,"Quadrant IV (+, -)",BLU)
b+=Ci(370,80,5,RED,RED)+T(378,100,"P(2, 2)",RED)+Ln(370,80,370,160,RED,1.5,"4")+Ln(270,80,370,80,RED,1.5,"4")
D['cartesian-plane']=svg(b)
# 2 circle chord
b=Ci(260,185,105)+Ci(260,185,3,"#333")+T(250,175,"O")
b+=Ln(192,265,328,265,RED,3)+T(176,285,"A")+T(330,285,"B")+Ln(260,185,260,265,BLU,2)+Rc(260,253,12,12,"none",BLU,1.5)+T(266,283,"M")
b+=T(40,28,"A perpendicular from the centre to a chord bisects the chord:",BLU,15)+T(40,50,"OM ⊥ AB  ⇒  AM = MB",RED,16)
D['circle-chord']=svg(b)
# 3 circle area and circumference
b=Ci(180,150,100,LB)+Ln(180,150,280,150,RED,3)+Ci(180,150,3,"#333")+T(222,140,"r",RED,16)
b+=T(330,110,"Circumference = 2πr",BLU,17)+T(330,150,"Area = πr²",BLU,17)+T(330,190,"π ≈ 3.14 (or 22/7)",GRN,14)
b+=T(60,290,"r = radius; the circumference is the distance around the circle.",'#222',14)
D['circle-area']=svg(b)
# 4 midpoint theorem
b=Pg("260,30 60,280 460,280",LB)+Ln(160,155,360,155,RED,3)+T(255,22,"A")+T(40,296,"B")+T(465,296,"C")+T(135,160,"D")+T(367,160,"E")
b+=T(20,70,"D, E are the midpoints",BLU,14)+T(20,90,"of AB and AC",BLU,14)+T(150,232,"DE ∥ BC",RED,16)+T(150,308,"DE = ½ BC  (Midpoint Theorem)",'#222',15)
D['midpoint-theorem']=svg(b)
# 5 cuboid and cylinder
b=Pg("40,130 180,130 180,230 40,230","#fdf2e9")+Pg("40,130 80,100 220,100 180,130","#fae5d3")+Pg("180,130 220,100 220,200 180,230","#f6ddcc")
b+=T(100,255,"l",'#222')+T(196,265,"b")+T(228,165,"h")+T(30,290,"Cuboid: V = l × b × h",BLU,14)+T(30,312,"TSA = 2(lb + bh + hl)",BLU,14)
b+=f'<ellipse cx="400" cy="90" rx="60" ry="18" fill="#d6eaf8" stroke="#333" stroke-width="2"/><path d="M340 90 L340 210 A60 18 0 0 0 460 210 L460 90" fill="#eaf4fb" stroke="#333" stroke-width="2"/>'
b+=Ln(400,90,460,90,RED,2)+T(420,84,"r",RED)+Ln(470,90,470,210,GRN,2)+T(478,155,"h",GRN)
b+=T(310,265,"Cylinder: V = πr²h",BLU,14)+T(310,287,"CSA = 2πrh",BLU,14)+T(310,309,"TSA = 2πr(r + h)",BLU,14)
D['solids']=svg(b)
# 6 Pythagoras
b=Pg("190,230 310,230 190,70",LB)+Rc(190,230,120,120,"#fdebd0",RED,1.5)+Rc(30,70,160,160,"#d5f5e3",GRN,1.5)
b+=Pg("190,70 310,230 470,110 350,-50","#e8daef","#7d3c98",1.5)
b+=T(250,295,"3\u00b2 = 9",RED,15,"middle")+T(110,155,"4\u00b2 = 16",GRN,15,"middle")+T(330,95,"5\u00b2 = 25",'#7d3c98',15,"middle")
b+=T(260,385,"3\u00b2 + 4\u00b2 = 5\u00b2   (a\u00b2 + b\u00b2 = c\u00b2)",BLU,16,"middle")
D['pythagoras']=svg(b,420).replace('viewBox="0 0 520 420"','viewBox="0 -60 520 480"')
# 7 trapezium
b=Pg("100,220 400,220 340,90 170,90",LB)+Ln(170,90,170,220,RED,1.5,"5")+T(120,80,"a (parallel)",BLU)+T(210,245,"b (parallel)",BLU)+T(176,160,"h",RED)
b+=T(60,285,"Area of a trapezium = ½ × (a + b) × h",'#222',16)+T(60,308,"a and b are the parallel sides; h is the distance between them.",'#555',13)
D['trapezium']=svg(b)
# 8 position-time graph
b=Ln(60,260,260,260)+Ln(60,260,60,40)+T(150,285,"time",'#222',13)+T(20,40,"position",'#222',13)+Ln(60,260,240,90,BLU,3)+T(90,70,"Straight line: uniform velocity",BLU,13)
b+=Ln(300,260,500,260)+Ln(300,260,300,40)+T(390,285,"time",'#222',13)+f'<path d="M300 260 Q400 250 480 70" fill="none" stroke="{RED}" stroke-width="3"/>'+T(305,60,"Curve: velocity changes",RED,13)
D['position-time']=svg(b)
# 9 cells
b=f'<ellipse cx="130" cy="150" rx="100" ry="85" fill="#fdebd0" stroke="#333" stroke-width="2"/>'+Ci(120,150,26,"#d6eaf8",BLU,1.5)+T(112,155,"nucleus",BLU,11)+T(70,60,"animal cell",'#222',14)
b+=T(130,262,"cell membrane, cytoplasm, nucleus",'#555',12,"middle")+T(130,278,"(no cell wall, no chloroplasts)",'#555',12,"middle")
b+=Rc(300,70,200,160,"#e9f7ef",GRN,3)+Rc(307,77,186,146,"none","#333",1.5)+Ci(360,150,30,"#d6eaf8",BLU,1.5)+T(342,154,"nucleus",BLU,11)
b+=f'<ellipse cx="450" cy="150" rx="28" ry="45" fill="#d5f5e3" stroke="{GRN}" stroke-width="1.5"/>'+T(450,154,"vacuole",GRN,11,"middle")+Ci(330,90,8,"#82e0aa",GRN,1.5)+Ci(330,205,8,"#82e0aa",GRN,1.5)+T(345,208,"chloroplast",GRN,11)
b+=T(400,60,"plant cell",'#222',14,"middle")+T(400,262,"cell wall, membrane, nucleus, large vacuole,",'#555',12,"middle")+T(400,278,"chloroplasts",'#555',12,"middle")
D['cells']=svg(b)
# 10 pendulum
b=Ln(130,40,390,40,"#333",3)+Ln(260,40,140,200,"#555",1.5)+Ln(260,40,260,230,"#999",1.5,"5")+Ln(260,40,380,200,"#555",1.5)
b+=Ci(140,200,16,"#f5b7b1",RED)+Ci(260,230,16,"#abebc6",GRN)+Ci(380,200,16,"#f5b7b1",RED)+T(120,235,"A",'#222',15)+T(256,262,"B",'#222',15)+T(396,235,"C",'#222',15)
b+=T(20,268,"A and C: highest points",RED,13)+T(20,285,"potential energy maximum",RED,12)+T(20,300,"kinetic energy zero",RED,12)+T(300,268,"B: lowest point",GRN,13)+T(300,285,"kinetic energy maximum",GRN,12)+T(300,300,"potential energy least",GRN,12)
D['pendulum']=svg(b,315)
# 11 atom
b=Ci(260,160,70,"none","#aaa",1.5)+Ci(260,160,120,"none","#aaa",1.5)+Ci(260,160,20,"#f5b7b1",RED)+T(260,164,"p n",RED,13,"middle")
for ang in (30,210): b+=Ci(260+70*math.cos(math.radians(ang)),160-70*math.sin(math.radians(ang)),7,BLU,BLU)
for ang in (20,110,200,290): b+=Ci(260+120*math.cos(math.radians(ang)),160-120*math.sin(math.radians(ang)),7,BLU,BLU)
b+=T(20,40,"Nucleus: protons (+) and neutrons",RED,13)+T(20,58,"Electrons (-) in shells K and L",BLU,13)+T(20,300,"Example: carbon has 6 protons, 6 neutrons and 6 electrons (2 in K, 4 in L)",'#222',12)
D['atom']=svg(b)
# 12 sound wave
b=Ln(40,160,480,160,"#999",1,"4")
xs=[60,70,80,90,100,150,170,190,200,210,260,270,280,290,300,350,370,390,400,410]
for x in xs: b+=Ln(x,110,x,210,BLU,2)
b+=T(80,95,"Compression",RED,13,"middle")+T(180,95,"Rarefaction",GRN,13,"middle")+T(280,95,"Compression",RED,13,"middle")+T(380,95,"Rarefaction",GRN,13,"middle")
b+=Ln(80,235,280,235,"#333",1.5)+T(180,255,"wavelength",'#222',14,"middle")+T(260,300,"Sound is a longitudinal wave: particles vibrate parallel to the wave's direction",'#222',12,"middle")
D['sound-wave']=svg(b)
# 13 reflection
b=Ln(60,230,460,230,"#333",4)+Ln(260,230,260,60,"#777",1.5,"6")+Ln(110,80,260,230,RED,2.5)+Ln(260,230,410,80,BLU,2.5)
b+=T(268,70,"normal",'#555',13)+T(15,110,"incident ray",RED,13)+T(400,110,"reflected ray",BLU,13)+T(200,205,"i",RED,15)+T(300,205,"r",BLU,15)+T(210,262,"plane mirror",'#555',13)+T(150,298,"Law of reflection: angle i = angle r",'#222',15)
D['reflection']=svg(b)
# 14 circuit
b=Ln(100,80,225,80)+Ln(265,80,420,80)+Ln(100,80,100,150)+Ln(100,175,100,240)+Ln(100,240,420,240)+Ln(420,80,420,138)+Ln(420,182,420,240)
b+=Rc(70,150,60,20,"#ffffff","#ffffff",0)+Ln(80,155,120,155,"#333",3)+Ln(90,168,110,168,"#333",5)+T(135,150,"+",RED,16)+T(135,175,"-",BLU,16)+T(30,165,"cell",'#222',13)
b+=Ln(200,80,200,80)+Ln(230,74,260,56,"#333",2)+Ci(225,80,4,"#333","#333",1)+Ci(265,80,4,"#333","#333",1)+T(225,45,"switch",'#222',13)
b+=Ci(420,160,22,"#fcf3cf","#333",2)+Ln(408,148,432,172,"#333",1.5)+Ln(432,148,408,172,"#333",1.5)+T(445,164,"bulb",'#222',13)
b+=T(180,115,"current flows from + terminal",GRN,12)+T(180,133,"around the loop to the - terminal",GRN,12)+T(120,280,"A complete closed path lets current flow; opening the switch breaks it.",'#222',12)
D['circuit']=svg(b,300)
# 15 convex lens
b=Ln(40,160,490,160,"#999",1,"4")+'<path d="M270 70 Q300 160 270 250 Q240 160 270 70" fill="#d6eaf8" stroke="#333" stroke-width="2"/>'
for y in (110,135,185,210): b+=Ln(40,y,270,y,RED,2)+Ln(270,y,420,160,RED,2)
b+=Ci(420,160,5,BLU,BLU)+T(412,185,"F",BLU,15)+Ci(120,160,5,BLU,BLU)+T(112,185,"F",BLU,15)+Ln(270,160,420,160,GRN,1.5)+T(340,150,"f",GRN,15)
b+=T(30,30,"Rays parallel to the principal axis meet at the focus F",'#222',14)+T(30,50,"after passing through a convex lens",'#222',14)
D['convex-lens']=svg(b)
# 16 quadrilateral family
def box(x,y,w,t,c=LB): return Rc(x,y,w,34,c,"#333",1.5)+T(x+w/2,y+22,t,'#222',13,"middle")
b=box(190,15,140,"Quadrilateral")+box(60,85,140,"Parallelogram","#d5f5e3")+box(330,85,110,"Kite","#fdebd0")+box(15,160,110,"Rectangle")+box(170,160,100,"Rhombus")+box(100,235,110,"Square","#f9e79f")
b+=Ln(260,49,140,85,"#555",1.5)+Ln(260,49,385,85,"#555",1.5)+Ln(110,119,70,160,"#555",1.5)+Ln(150,119,220,160,"#555",1.5)+Ln(70,194,140,235,"#555",1.5)+Ln(220,194,170,235,"#555",1.5)
b+=T(300,215,"A square is both a rectangle",'#555',12)+T(300,232,"and a rhombus",'#555',12)
D['quadrilaterals']=svg(b,290)
os.makedirs(OUT,exist_ok=True)
for k,v in D.items(): open(OUT+f'c89-{k}.svg','w',encoding='utf-8').write(v)
# attach
M=[('9','maths','ch01-','cartesian-plane','Cartesian plane with four quadrants and the point P(2, 2)','Coordinates and quadrants'),
('9','maths','ch05-','circle-chord','A circle with a chord AB and a perpendicular from the centre O meeting it at M','Perpendicular from the centre bisects a chord'),
('9','maths','ch06-','circle-area','A circle with radius r','Circumference 2 pi r and area pi r squared'),
('9','maths','ch12-','midpoint-theorem','Triangle ABC with D and E the midpoints of AB and AC','Midpoint theorem'),
('9','maths','ch14-','solids','A cuboid and a cylinder with their formulas','Surface area and volume formulas'),
('8','maths','ch09-','pythagoras','Right triangle with squares on its three sides','3-4-5 example of the Pythagoras theorem'),
('8','maths','ch14-','trapezium','Trapezium with parallel sides a and b and height h','Area of a trapezium'),
('8','maths','ch04-','quadrilaterals','Family tree of quadrilaterals','How quadrilaterals are related'),
('9','science','ch04-','position-time','Position-time graphs for uniform and changing velocity','Reading position-time graphs'),
('9','science','ch02-','cells','Plant cell and animal cell compared','Plant and animal cells'),
('9','science','ch07-','pendulum','A pendulum with extreme positions A and C and lowest position B','Energy changes in a pendulum'),
('9','science','ch08-','atom','Atom with nucleus and electron shells','Structure of an atom'),
('9','science','ch10-','sound-wave','Compressions and rarefactions in a sound wave','Sound as a longitudinal wave'),
('8','science','ch10-','reflection','Incident ray, normal and reflected ray at a plane mirror','Law of reflection'),
('8','science','ch10-','convex-lens','Parallel rays meeting at the focus of a convex lens','Convex lens focus'),
('8','science','ch04-','circuit','A simple electric circuit with cell, switch and bulb','A complete circuit')]
n=0
for cl,sub,ch,key,alt,cap in M:
    fs=[f for f in sorted(glob.glob(LES+f'cbse-{cl}-{sub}-{ch}*.json')) if 'activities-and-experiments' not in f]
    if not fs: print('MISSING',cl,sub,ch); continue
    f=fs[0]; d=json.load(open(f)); bl=d['lesson']['blocks']
    if any(b['type']=='diagram' for b in bl): continue
    i=[k for k,b in enumerate(bl) if b['type']=='explanation'][0]
    bl.insert(i+1,{"id":"diagram","type":"diagram","provenance":"original","assetKey":f"c89-{key}.svg","altText":{"en":alt},"caption":{"en":cap}})
    json.dump(d,open(f,'w'),indent=2,ensure_ascii=False); n+=1
print('svgs',len(D),'attached',n)
