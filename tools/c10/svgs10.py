import os,json
D='/tmp/ss-build/apps/web/public/assets/lessons/'
H='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="100%%" role="img"><rect width="%d" height="%d" fill="#ffffff"/><g font-family="sans-serif" font-size="16" fill="#222" stroke-linecap="round">'
def w(n,W,Hh,b): open(D+n,'w').write(H%(W,Hh,W,Hh)+b+'</g></svg>')
L=lambda x1,y1,x2,y2,c="#333",s=2:f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{s}"/>'
T=lambda x,y,t,sz=16,c="#222":f'<text x="{x}" y="{y}" font-size="{sz}" fill="{c}">{t}</text>'
# parabola with zeroes
pts=' '.join(f'{300+ (x*40):.0f},{40+ (0.5*(x*x-4))*-1*(-30):.0f}' for x in [i/4 for i in range(-12,13)])
pts=' '.join(f'{300+x*50:.0f},{200-(x*x-4)*(-20):.0f}' for x in [i/4 for i in range(-12,13)])
w('c10-parabola-zeroes.svg',600,300,L(30,150,570,150)+L(300,20,300,280)+f'<polyline points="{" ".join(f"{300+x*60:.0f},{150+(x*x-4)*20:.0f}" for x in [i/4 for i in range(-10,11)])}" fill="none" stroke="#c0392b" stroke-width="3"/>'+'<circle cx="180" cy="150" r="6" fill="#2471a3"/><circle cx="420" cy="150" r="6" fill="#2471a3"/>'+T(150,175,'zero: x = -2')+T(400,175,'zero: x = 2')+T(320,40,'y = x^2 - 4  (a parabola)')+T(310,270,'Zeroes = x-coordinates where the graph cuts the x-axis'))
# BPT
w('c10-bpt.svg',520,320,'<polygon points="260,30 60,280 460,280" fill="#eaf4fb" stroke="#333" stroke-width="2"/>'+L(160,155,360,155,"#c0392b",3)+T(255,22,'A')+T(40,295,'B')+T(465,295,'C')+T(135,160,'D')+T(367,160,'E')+T(150,230,'DE || BC',16,"#c0392b")+T(150,310,'AD/DB = AE/EC  (Basic Proportionality Theorem)',15))
# right triangle trig
w('c10-trig-ratios.svg',520,320,'<polygon points="60,260 380,260 380,60" fill="#eafaf1" stroke="#333" stroke-width="2"/>'+'<rect x="360" y="240" width="20" height="20" fill="none" stroke="#333"/>'+T(40,282,'A')+T(385,282,'B')+T(388,55,'C')+T(215,285,'adjacent (to A)')+T(388,165,'opposite')+T(170,145,'hypotenuse')+T(80,250,'θ',16)+T(20,25,'sin A = opposite / hypotenuse',15)+T(20,45,'cos A = adjacent / hypotenuse',15)+T(300,25,'tan A = opposite / adjacent',15))
# tangent
w('c10-tangent-radius.svg',520,320,'<circle cx="200" cy="160" r="100" fill="#fef9e7" stroke="#333" stroke-width="2"/>'+L(300,40,300,290,"#c0392b",3)+L(200,160,300,160)+'<circle cx="200" cy="160" r="4"/><circle cx="300" cy="160" r="5" fill="#c0392b"/>'+'<rect x="288" y="148" width="12" height="12" fill="none" stroke="#333"/>'+T(185,150,'O')+T(310,150,'P')+T(240,180,'r')+T(310,60,'tangent')+T(20,300,'Tangent ⟂ radius at the point of contact',15))
# sector
w('c10-sector.svg',520,320,'<circle cx="200" cy="170" r="110" fill="#fff" stroke="#333" stroke-width="2"/><path d="M200,170 L310,170 A110,110 0 0 0 255,75 Z" fill="#f9e79f" stroke="#c0392b" stroke-width="2"/>'+T(215,150,'θ')+T(250,185,'r')+T(300,255,'Area = θ/360 × π r²',16)+T(300,280,'Arc = θ/360 × 2π r',16))
# concave mirror
w('c10-concave-mirror.svg',560,300,L(20,150,540,150)+'<path d="M470,30 Q420,150 470,270" fill="none" stroke="#2471a3" stroke-width="4"/>'+'<circle cx="395" cy="150" r="4"/><circle cx="320" cy="150" r="4"/>'+T(388,172,'F')+T(313,172,'C')+T(455,172,'P')+L(120,150,120,90,"#27ae60",4)+L(120,90,470,90,"#c0392b")+L(470,90,395,150,"#c0392b")+L(120,90,470,150,"#8e44ad")+T(105,80,'Object',14)+T(20,290,'Ray parallel to the axis passes through F after reflection',14))
# eye
w('c10-human-eye.svg',560,320,'<ellipse cx="280" cy="160" rx="160" ry="110" fill="#fdfefe" stroke="#333" stroke-width="2"/>'+'<path d="M150,110 Q120,160 150,210" fill="none" stroke="#2471a3" stroke-width="4"/><ellipse cx="190" cy="160" rx="14" ry="38" fill="#d6eaf8" stroke="#2471a3"/>'+'<path d="M420,100 Q450,160 420,220" fill="none" stroke="#c0392b" stroke-width="5"/>'+T(60,100,'Cornea')+T(150,260,'Lens')+T(300,165,'Vitreous humour')+T(430,90,'Retina')+T(250,40,'Iris and pupil: control the light')+T(440,240,'Optic nerve'))
# circuit series parallel
def res(x,y):return f'<rect x="{x}" y="{y-9}" width="50" height="18" fill="#fff" stroke="#333" stroke-width="2"/>'
w('c10-series-parallel.svg',620,300,T(20,25,'Series: I same, R = R1 + R2',15)+L(30,70,60,70)+res(60,70)+L(110,70,150,70)+res(150,70)+L(200,70,240,70)+T(75,55,'R1')+T(165,55,'R2')+T(300,25,'Parallel: V same, 1/R = 1/R1 + 1/R2',15)+L(320,200,360,200)+L(360,160,360,240)+L(360,160,390,160)+res(390,160)+L(440,160,470,160)+L(360,240,390,240)+res(390,240)+L(440,240,470,240)+L(470,160,470,240)+L(470,200,520,200)+T(400,150,'R1')+T(400,258,'R2'))
# food chain pyramid
w('c10-energy-pyramid.svg',560,300,'<polygon points="280,30 180,100 380,100" fill="#f5b7b1" stroke="#333"/><polygon points="180,100 380,100 430,170 130,170" fill="#f9e79f" stroke="#333"/><polygon points="130,170 430,170 490,240 70,240" fill="#abebc6" stroke="#333"/>'+T(240,80,'Tertiary: 10 J')+T(215,140,'Secondary: 100 J',15)+T(205,210,'Primary: 1000 J',15)+T(205,262,'Producers: 10000 J  (10% rule)',15))
# reflex arc
w('c10-reflex-arc.svg',560,300,'<rect x="40" y="120" width="100" height="40" fill="#fadbd8" stroke="#333"/>'+T(55,145,'Receptor (skin)',13)+'<rect x="240" y="40" width="110" height="40" fill="#d6eaf8" stroke="#333"/>'+T(250,65,'Spinal cord',14)+'<rect x="420" y="120" width="100" height="40" fill="#d5f5e3" stroke="#333"/>'+T(435,145,'Effector (muscle)',12)+L(140,140,240,65,"#2471a3",3)+L(350,65,420,140,"#27ae60",3)+T(150,85,'sensory neuron',13)+T(380,85,'motor neuron',13)+T(150,250,'Reflex arc: receptor → sensory neuron → spinal cord → motor neuron → effector',14))
# pH scale
cols=['#e74c3c','#e67e22','#f1c40f','#f7dc6f','#82e0aa','#27ae60','#48c9b0','#5dade2','#3498db','#2e86c1','#5b2c6f']
w('c10-ph-scale.svg',640,200,''.join(f'<rect x="{20+i*41}" y="60" width="41" height="50" fill="{cols[min(i//1,len(cols)-1)] if i<11 else "#4a235a"}" stroke="#fff"/>'+T(32+i*41,130,str(i),14) for i in range(15))+T(20,40,'Acidic  (pH < 7)',16)+T(260,40,'Neutral = 7',16)+T(440,40,'Basic  (pH > 7)',16)+T(20,180,'Lower pH = stronger acid; higher pH = stronger base',15))
print(len(os.listdir(D)))
