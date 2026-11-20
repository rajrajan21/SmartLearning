import sys; sys.path.insert(0,'/tmp/ss-build/tools/c5_gaps')
from svgs import w
def rect(x,y,wd,h,f='#aed6f1'): return f'<rect x="{x}" y="{y}" width="{wd}" height="{h}" fill="{f}" stroke="#333"/>'
def t(x,y,s,sz=14,b=False): return f'<text x="{x}" y="{y}" font-size="{sz}"'+(' font-weight="bold"' if b else '')+f'>{s}</text>'
# kg/g double number line
b=t(20,24,'Double number line: kg above, g below (x 1000)',15,True)
b+='<line x1="40" y1="70" x2="600" y2="70" stroke="#333" stroke-width="3"/><line x1="40" y1="130" x2="600" y2="130" stroke="#333" stroke-width="3"/>'
for i,(k,g) in enumerate([(0,'0'),(1,'1,000'),(2,'2,000'),(3,'3,000'),(4,'4,000')]):
    x=40+i*140
    b+=f'<line x1="{x}" y1="60" x2="{x}" y2="80" stroke="#333"/><line x1="{x}" y1="120" x2="{x}" y2="140" stroke="#333"/>'+t(x-12,52,f'{k} kg',14,True)+t(x-18,160,f'{g} g',14,True)+(f'<line x1="{x}" y1="80" x2="{x}" y2="120" stroke="#c0392b" stroke-dasharray="4"/>')
b+=t(40,190,'3 kg 500 g = 3,500 g      2 kg 250 g = 2,250 g',15)
w('c5-kg-g-double-line.svg',640,205,b)
# jug
b=t(20,24,'Measuring jug: 1 litre = 1,000 millilitres',15,True)
b+='<rect x="60" y="40" width="110" height="220" fill="#fff" stroke="#333" stroke-width="3"/>'+rect(61,130,108,129,'#85c1e9')
for i,(y,s) in enumerate([(40,'1 l'),(95,'750 ml'),(150,'500 ml'),(205,'250 ml')]):
    b+=f'<line x1="170" y1="{y+0}" x2="195" y2="{y}" stroke="#333"/>'+t(200,y+5,s)
b+=t(60,290,'Water is at 500 ml (half a litre)',14)
b+=rect(380,150,70,110,'#f9e79f')+t(360,140,'1 l bottle',14)+rect(480,200,45,60,'#f9e79f')+t(465,190,'500 ml',14)+rect(550,225,30,35,'#f9e79f')+t(540,215,'200 ml',14)
w('c5-capacity-jug.svg',640,305,b)
# unit ladder
b=t(20,24,'From tiny to big',15,True)
for i,(a,c) in enumerate([('1,000 mg','= 1 g'),('1,000 g','= 1 kg'),('100 kg','= 1 quintal'),('10 quintals','= 1 tonne (1,000 kg)')]):
    y=45+i*55; b+=rect(60+i*20,y,420-i*20,42,['#fad7a0','#a9dfbf','#aed6f1','#d7bde2'][i])+t(75+i*20,y+27,a+'  '+c,16,True)
w('c5-weight-unit-ladder.svg',560,270,b)
# fraction bars >1
b=t(20,24,'5/2 parathas = 2 and 1/2 parathas',15,True)
for i in range(3):
    for j in range(2):
        b+=rect(20+i*180+j*85,50,85,60,'#f9e79f' if (i*2+j)<5 else '#fff')+t(40+i*180+j*85,86,'1/2')
b+=t(20,150,'5 halves = 1 + 1 + 1/2 : two whole parathas and one half',14)
b+=t(20,185,'Same numerator: 4/5 > 4/6 (fifths are bigger pieces than sixths)',14)
b+=rect(20,200,200,26,'#fff')+rect(20,200,160,26,'#82e0aa')+t(230,219,'4/5')+rect(320,200,200,26,'#fff')+rect(320,200,133,26,'#82e0aa')+t(530,219,'4/6')
w('c5-fractions-bars.svg',600,250,b)
# symmetric letters
def letter_lines():
    b=t(20,24,'Lines of symmetry in letters',15,True)
    # A vertical
    b+='<polygon points="70,150 100,60 130,150 115,150 100,100 85,150" fill="#aed6f1" stroke="#333"/><line x1="100" y1="45" x2="100" y2="165" stroke="#c0392b" stroke-dasharray="5"/>'+t(80,190,'A: 1 line')
    # H both
    b+='<rect x="190" y="60" width="16" height="90" fill="#aed6f1" stroke="#333"/><rect x="254" y="60" width="16" height="90" fill="#aed6f1" stroke="#333"/><rect x="206" y="97" width="48" height="16" fill="#aed6f1" stroke="#333"/><line x1="230" y1="45" x2="230" y2="165" stroke="#c0392b" stroke-dasharray="5"/><line x1="175" y1="105" x2="285" y2="105" stroke="#c0392b" stroke-dasharray="5"/>'+t(195,190,'H: 2 lines')
    # E horizontal
    b+='<rect x="350" y="60" width="16" height="90" fill="#aed6f1" stroke="#333"/><rect x="366" y="60" width="40" height="14" fill="#aed6f1" stroke="#333"/><rect x="366" y="98" width="30" height="14" fill="#aed6f1" stroke="#333"/><rect x="366" y="136" width="40" height="14" fill="#aed6f1" stroke="#333"/><line x1="335" y1="105" x2="420" y2="105" stroke="#c0392b" stroke-dasharray="5"/>'+t(345,190,'E: horizontal')
    # N none (rotational)
    b+='<rect x="470" y="60" width="14" height="90" fill="#aed6f1" stroke="#333"/><rect x="530" y="60" width="14" height="90" fill="#aed6f1" stroke="#333"/><polygon points="484,60 498,60 530,150 516,150" fill="#aed6f1" stroke="#333"/>'+t(455,190,'N: no line, but turns')
    return b
w('c5-letter-symmetry.svg',640,210,letter_lines())
# pinwheel
import math
b=t(20,24,'Windmill (firki): looks the same after 1/4, 1/2, 3/4 and full turn',15,True)
for k,(cx,lab) in enumerate([(100,'start'),(280,'1/4 turn'),(460,'1/2 turn')]):
    for a in range(4):
        ang=math.radians(a*90+k*90)
        x1,y1=cx,120; x2=cx+60*math.cos(ang); y2=y1+60*math.sin(ang)
        x3=cx+60*math.cos(ang+math.pi/2)*0.6+30*math.cos(ang); y3=y1+60*math.sin(ang+math.pi/2)*0.6+30*math.sin(ang)
        b+=f'<polygon points="{x1},{y1} {x2:.0f},{y2:.0f} {x3:.0f},{y3:.0f}" fill="{["#f1948a","#82e0aa","#85c1e9","#f7dc6f"][a]}" stroke="#333"/>'
    b+=f'<circle cx="{cx}" cy="120" r="4" fill="#333"/>'+t(cx-25,210,lab)
w('c5-pinwheel-turns.svg',560,230,b)
# grids: same area diff perimeter
def grid(x,y,cells,col):
    return ''.join(rect(x+i*24,y+j*24,24,24,col) for i,j in cells)
b=t(20,24,'Same area, different perimeter (each square = 1 sq unit)',15,True)
A=[(i,j) for i in range(6) for j in range(2)]; B=[(i,j) for i in range(4) for j in range(3)]
b+=grid(20,50,A,'#aed6f1')+t(20,125+15,'6 x 2: area 12, perimeter 16')+grid(250,50,B,'#a9dfbf')+t(250,140,'4 x 3: area 12, perimeter 14')
C=[(i,j) for i in range(12) for j in range(1)]
b+=grid(20,170,C,'#f9e79f')+t(20,215,'12 x 1: area 12, perimeter 26')
w('c5-area-perimeter.svg',640,235,b)
# map grid
b=t(20,24,'Finding places on a grid: column letter first, then row number',15,True)
for i in range(5):
    b+=t(75+i*70,52,'ABCDE'[i],15,True)
    b+=t(30,95+i*50,str(i+1),15,True)
    for j in range(5): b+=rect(60+i*70,60+j*50,70,50,'#fdfefe')
b+=t(85,100,'School')+rect(215,170,40,30,'#f5b7b1')+t(222,190,'Park')+t(360,290,'Well',14)
b+=t(430,100,'School is at A1',13)+t(430,125,'Park is at C3',13)+t(430,150,'Well is at E5',13)
w('c5-map-grid.svg',640,330,b)
