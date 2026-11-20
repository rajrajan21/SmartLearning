import os
D='/tmp/ss-build/apps/web/public/assets/lessons/'
H='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="100%%" role="img"><rect width="%d" height="%d" fill="#ffffff"/><g font-family="sans-serif" font-size="16" fill="#222">'
def w(name,W,Hh,body): open(D+name,'w').write(H%(W,Hh,W,Hh)+body+'</g></svg>')
# compass rose
w('c5-compass-rose.svg',420,300,'''<line x1="210" y1="40" x2="210" y2="260" stroke="#333" stroke-width="3"/><line x1="100" y1="150" x2="320" y2="150" stroke="#333" stroke-width="3"/>
<polygon points="210,40 200,70 220,70" fill="#c0392b"/><polygon points="320,150 290,140 290,160" fill="#2471a3"/><polygon points="210,260 200,230 220,230" fill="#2471a3"/><polygon points="100,150 130,140 130,160" fill="#2471a3"/>
<text x="203" y="30" font-weight="bold">N</text><text x="330" y="156" font-weight="bold">E</text><text x="203" y="285" font-weight="bold">S</text><text x="70" y="156" font-weight="bold">W</text>
<text x="338" y="178" font-size="13">sun rises here</text><text x="40" y="178" font-size="13">sun sets here</text><circle cx="210" cy="150" r="6" fill="#f1c40f" stroke="#333"/>''')
# pictograph, scale 1 icon = 5
def row(y,label,n):
    s=f'<text x="20" y="{y+6}">{label}</text>'
    for i in range(n): s+=f'<circle cx="{150+i*34}" cy="{y}" r="13" fill="#f39c12" stroke="#333"/>'
    return s
w('c5-pictograph-scale.svg',560,230,'<text x="20" y="28" font-weight="bold">Toys sold (1 circle = 5 toys)</text>'+row(70,'Cars',4)+row(115,'Balls',6)+row(160,'Dolls',3)+'<text x="20" y="210" font-size="14">Cars 4 x 5 = 20, Balls 6 x 5 = 30, Dolls 3 x 5 = 15</text>')
# factor arrays of 12
def arr(x,y,r,c):
    s=''
    for i in range(r):
        for j in range(c): s+=f'<rect x="{x+j*22}" y="{y+i*22}" width="18" height="18" fill="#58d68d" stroke="#333"/>'
    return s
w('c5-arrays-12.svg',600,200,arr(20,30,1,12)+arr(20,70,2,6)+arr(330,70,3,4)+arr(330,160,1,1)[:0]+'<text x="20" y="22">1 x 12</text><text x="20" y="130">2 x 6</text><text x="330" y="62">3 x 4</text><text x="20" y="190">Factors of 12: 1, 2, 3, 4, 6, 12</text>')
# 12h to 24h strip
w('c5-24-hour-time.svg',640,200,'<line x1="30" y1="90" x2="610" y2="90" stroke="#333" stroke-width="3"/>'+''.join(f'<line x1="{30+i*24.17:.1f}" y1="80" x2="{30+i*24.17:.1f}" y2="100" stroke="#333"/>' for i in range(25))+'<text x="20" y="125">00:00</text><text x="262" y="125">12:00</text><text x="578" y="125">24:00</text><text x="30" y="60" font-size="14">a.m. : 12-hour and 24-hour clocks agree</text><text x="330" y="60" font-size="14">p.m. : add 12 (5:30 p.m. = 17:30)</text><text x="30" y="170" font-size="14">2:30 p.m. + 12 = 14:30 hours; 9:35 p.m. = 21:35 hours</text>')
