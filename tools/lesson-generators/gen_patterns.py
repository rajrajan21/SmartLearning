"""Class 6 Maths, chapter 3: Patterns in Mathematics. Run: python3 gen_patterns.py"""
import json, os
OUT=os.environ.get("RECIPE_OUT","/tmp/ss-build/content/recipes/class6/cbse-6-patterns.json")
P=[];ST=[]
def part(*a): P.append(list(a))
def fit(t,s): return max(16,int(min(s,760/(len(t)*0.95))))
def L(t,id,y=455,s=34,c="#1F3B6E",x=450,a="middle"): part("label",id,{"text":t,"x":x,"y":y,"size":fit(t,s),"color":c,"anchor":a})
def RECT(id,x,y,w,h,fill="#E3F2FD",stroke="#1E88E5",lw=3): part("raw",id,{"kind":"rect","x":x,"y":y,"w":w,"h":h,"fill":fill,"stroke":stroke,"width":lw,"rx":8})
def LN(id,x1,y1,x2,y2,c="#16253F",w=5): part("raw",id,{"kind":"line","x1":x1,"y1":y1,"x2":x2,"y2":y2,"stroke":c,"width":w})
def AR(id,x1,y1,x2,y2,c="#1E88E5",w=5): part("raw",id,{"kind":"arrow","x1":x1,"y1":y1,"x2":x2,"y2":y2,"stroke":c,"width":w})
def step(id,sec,en,ta,do=None,q=None):
    s={"id":id,"section":sec,"say":[en,ta],"do":do or []}
    if q: s["q"]=q
    ST.append(s)
def qs(id,sec,en,ta,stem,ts,ok,opts,e,et): step(id,sec,en,ta,[CL],{"s":[stem,ts],"ok":ok,"o":opts,"e":[e,et]})
def O(a,t,w=None,tw=None): return [a,t,w,tw] if w else [a,t]
CL=["clear","","",{}]
def wr(ids,at=0.1,gap=0.12,ms=800): return [["write",i,round(at+k*gap,3),{"ms":ms}] for k,i in enumerate(ids)]
def sh(ids,at=0.1,gap=0.08,ms=300): return [["show",i,round(at+k*gap,3),{"ms":ms}] for k,i in enumerate(ids)]
def rows(prefix,texts,y0,gap,s=32,c="#1F3B6E",x=450):
    ids=[]
    for k,t in enumerate(texts):
        i=f"{prefix}{k}"; L(t,i,y=y0+k*gap,s=s,c=c if isinstance(c,str) else c[k%len(c)],x=x); ids.append(i)
    return ids
BL,OR,GR,RD,PU="#1E88E5","#E65100","#2E7D32","#C0392B","#8E24AA"


import math
S=["1 What is mathematics","2 Number sequences","3 Seeing number patterns","4 Sequences are related","5 Patterns in shapes","6 Shapes and numbers","7 More relations","8 Shape sequences","9 Math Talk","Mixed practice"]
def shg(ids,at=0.05,end=0.85,verb="show",ms=250):
    g=(end-at)/max(1,len(ids)); return [[verb,i,round(at+k*g,3),{"ms":ms}] for k,i in enumerate(ids)]
def DT(id,x,y,r=13,fill="#FFD166",stroke="#E65100"): part("raw",id,{"kind":"circle","cx":round(x,1),"cy":round(y,1),"r":r,"fill":fill,"stroke":stroke,"width":3})
COL=["#E53935","#FB8C00","#FDD835","#43A047","#1E88E5","#8E24AA"]
# triangular dots T1..T5
tri=[]
for n in range(1,6):
    ids=[]; x0=70+(n-1)*170 if False else 0
    ox=[90,210,370,550,750][n-1]; 
    for r in range(n):
        for c in range(r+1):
            i=f"tr{n}x{r}x{c}"; DT(i,ox+(c-r/2)*34,150+r*34,12); ids.append(i)
    tri.append(ids)
# squares 1..4 grids
sqr=[]
for n in range(1,5):
    ox=[120,250,430,650][n-1]; ids=[]
    for r in range(n):
        for c in range(n):
            i=f"sq{n}x{r}x{c}"; DT(i,ox+c*38,330+r*38-0,13,"#BBDEFB","#1E88E5"); ids.append(i)
    sqr.append(ids)
# odd L layers on 6x6 grid
oddl=[]
for k in range(6):
    ids=[]
    for r in range(6):
        for c in range(6):
            if max(r,c)==k:
                i=f"od{k}x{r}x{c}"; DT(i,420+c*58,90+r*58,20,COL[k],"#16253F"); ids.append(i)
    oddl.append(ids)
# up-down on 5x5 by anti-diagonal i+j
udd=[]
for d in range(9):
    ids=[]
    for r in range(5):
        for c in range(5):
            if r+c==d:
                i=f"ud{d}x{r}x{c}"; DT(i,300+c*60,100+r*60,22,["#E53935","#FB8C00","#FDD835","#43A047","#1E88E5","#43A047","#FDD835","#FB8C00","#E53935"][d],"#16253F"); ids.append(i)
    udd.append(ids)
# hexagonal rings
def hexpts(k):
    pts=[]
    for q in range(-k,k+1):
        for r in range(-k,k+1):
            s=-q-r
            if max(abs(q),abs(r),abs(s))==k: pts.append((q,r))
    return pts
hexr=[]
for k in range(3):
    ids=[]
    for j,(q,r) in enumerate(hexpts(k)):
        x=450+40*(q+r/2); y=250+40*(r*0.866); i=f"hx{k}x{j}"; DT(i,x,y,15,COL[k],"#16253F"); ids.append(i)
    hexr.append(ids)
# regular polygons
polys=[]
for n in range(3,9):
    cx=90+(n-3)*140; cy=250; pts=[[round(cx+55*math.sin(2*math.pi*k/n),1),round(cy-55*math.cos(2*math.pi*k/n),1)] for k in range(n)]
    part("raw",f"pg{n}",{"kind":"poly","points":pts,"fill":"#E3F2FD","stroke":"#1E88E5","width":4}); L(str(n),f"pn{n}",y=cy+100,s=28,c=RD,x=cx); polys.append(f"pg{n}")
# complete graphs
cg=[]
for n in range(2,7):
    cx=100+(n-2)*175; cy=250; pts=[(cx+50*math.sin(2*math.pi*k/n),cy-60*math.cos(2*math.pi*k/n)) for k in range(n)]
    ids=[]; m=0
    for a in range(n):
        for b in range(a+1,n):
            i=f"cg{n}l{m}"; part("raw",i,{"kind":"line","x1":round(pts[a][0],1),"y1":round(pts[a][1],1),"x2":round(pts[b][0],1),"y2":round(pts[b][1],1),"stroke":"#1E88E5","width":3}); ids.append(i); m+=1
    for k,(x,y) in enumerate(pts): i=f"cg{n}p{k}"; DT(i,x,y,8,"#E53935","#B71C1C"); ids.append(i)
    cg.append(ids); L(f"{n*(n-1)//2} lines",f"cn{n}",y=360,s=18,c=RD,x=cx)
for k,t in enumerate(["1, 1, 1, 1, 1, ...","1, 2, 3, 4, 5, ...","1, 3, 5, 7, 9, ...","2, 4, 6, 8, 10, ...","1, 3, 6, 10, 15, ...","1, 4, 9, 16, 25, ..."]):
    L(t,f"sq{k}t",y=110+k*60,s=30,c=[BL,GR,OR,PU,RD,"#00838F"][k],x=330); L(["all 1s","counting","odd","even","triangular","squares"][k],f"sq{k}n",y=110+k*60,s=24,c="#455A64",x=700)
L("Mathematics: finding patterns, and explaining why they are there","tM0",y=100,s=26,c=BL); L("Patterns are in nature, homes, games, the sun, moon and stars","tM1",y=180,s=24,c=GR); L("Pattern + reason = mathematics","tM2",y=270,s=34,c=RD)
L("Stars and planets: gravity, rockets to the Moon","tM3",y=360,s=28,c=OR); L("Genes: medicines for diseases","tM4",y=420,s=28,c=OR)
L("Number sequences with a rule:","tS0",y=100,s=26,c=BL); L("Virahanka: 1, 2, 3, 5, 8, 13, 21 (add the last two)","tS1",y=430,s=24,c=PU); L("Powers of 2: 1, 2, 4, 8, 16 (double each time)","tS2",y=470,s=24,c=RD)
L("Triangular numbers 1, 3, 6, 10, 15","tT0",y=70,s=28,c=RD); L("Add 2, then 3, then 4, then 5 ...","tT1",y=400,s=26,c=GR)
L("Square numbers 1, 4, 9, 16","tQ0",y=70,s=28,c=BL); L("n rows of n dots: n × n","tQ1",y=470,s=28,c=GR)
L("36 is both a triangle number and a square number","tQ2",y=470,s=28,c=RD)
L("Hexagonal numbers: 1, 7, 19, 37 ...","tH0",y=60,s=28,c=PU); L("Each ring adds 6, 12, 18 ... dots","tH1",y=470,s=28,c=GR)
L("1 + 3 = 4","tO1",y=110,s=28,c=RD,x=200); L("1 + 3 + 5 = 9","tO2",y=170,s=26,c=RD,x=200); L("1+3+5+7+9+11 = 36","tO3",y=230,s=18,c=RD,x=200); L("Each L-shape is the next odd number","tO4",y=470,s=28,c=GR)
L("Sum of the first 100 odd numbers = 100 × 100 = 10,000","tO5",y=110,s=28,c=RD); L("Sum of the first n odd numbers = n × n","tO6",y=190,s=32,c=GR)
L("1 + 2 + 3 + 4 + 5 + 4 + 3 + 2 + 1 = 25","tU1",y=40,s=18,c=RD); L("Up then down gives a square number","tU2",y=470,s=28,c=GR)
L("1 + 2 + ... + 100 + ... + 2 + 1 = 100 × 100 = 10,000","tU3",y=120,s=24,c=RD)
L("Two triangular numbers side by side make a square","tV1",y=110,s=28,c=BL); L("1 + 3 = 4,   3 + 6 = 9,   6 + 10 = 16","tV2",y=190,s=30,c=RD); L("Powers of 2 added up:  1, 3, 7, 15, 31","tV3",y=290,s=28,c=GR); L("Add 1 to each:  2, 4, 8, 16, 32","tV4",y=360,s=30,c=OR)
L("Regular polygons: equal sides and equal corners","tP0",y=70,s=26,c=BL); L("Sides: 3, 4, 5, 6, 7, 8 ... counting numbers from 3","tP1",y=420,s=26,c=GR); L("triangle, square, pentagon, hexagon, heptagon, octagon","tP2",y=470,s=22,c=OR)
L("Complete graph: every point joined to every other","tK0",y=70,s=26,c=BL); L("Lines: 1, 3, 6, 10, 15 are triangular numbers!","tK1",y=430,s=26,c=RD)
L("Number of sides = number of corners","tN0",y=130,s=32,c=BL); L("3, 4, 5, 6 ... both are counting numbers","tN1",y=210,s=28,c=GR); L("K2, K3, K4 ... lines follow the triangular numbers","tN2",y=290,s=28,c=RD); L("Shapes and numbers explain each other","tN3",y=370,s=32,c=PU)
def T(sec,id,en,ta,do): step(id,sec,en,ta,[CL]+do)
T(S[0],"q1-what","What is mathematics? Mathematics is, in large part, the search for patterns, and for the explanations of why those patterns exist. Patterns are all around us, in nature, in our homes and schools, in the motion of the sun, moon and stars, in shopping, cooking and games. Finding a pattern is fun and creative, which is why mathematicians call mathematics both an art and a science.","கணிதம் என்றால் என்ன? கணிதம் என்பது பெருமளவில் வடிவங்களைத் தேடுவதும், அவை ஏன் உள்ளன என்பதற்கான விளக்கங்களைத் தேடுவதும் ஆகும். வடிவங்கள் நம்மைச் சுற்றி எங்கும் உள்ளன: இயற்கையில், வீடுகளிலும் பள்ளிகளிலும், சூரியன், நிலா, விண்மீன்களின் இயக்கத்தில், கடைக்குச் செல்வதில், சமையலில், விளையாட்டுகளில். வடிவத்தைக் கண்டுபிடிப்பது சுவையானதும் படைப்பாற்றல் மிக்கதும் ஆகும், அதனால்தான் கணிதவியலாளர்கள் கணிதத்தைக் கலையாகவும் அறிவியலாகவும் கருதுகிறார்கள்.",wr(["tM0","tM1","tM2"],0.1,0.25))
T(S[0],"q1-use","Why do we explain patterns? Because the explanation can be used far beyond where it was found. Understanding patterns in the motion of stars and planets led to the theory of gravitation, which lets us launch satellites and rockets to the Moon and Mars. Understanding patterns in genes helps doctors cure diseases. The reason behind a pattern is as exciting as the pattern itself.","வடிவங்களை ஏன் விளக்குகிறோம்? ஏனெனில் விளக்கம் அது கண்டுபிடிக்கப்பட்ட இடத்தையும் தாண்டிப் பயன்படும். விண்மீன்கள், கோள்களின் இயக்க வடிவங்களைப் புரிந்துகொண்டதால் ஈர்ப்புக் கொள்கை உருவானது, அது செயற்கைக்கோள்களையும் நிலா, செவ்வாய்க்கு ராக்கெட்டுகளையும் ஏவ உதவுகிறது. மரபணு வடிவங்களைப் புரிந்துகொள்வது மருத்துவர்கள் நோய்களைக் குணப்படுத்த உதவுகிறது. ஒரு வடிவத்தின் காரணம் வடிவத்தைப் போலவே சுவையானது.",wr(["tM3","tM4","tM2"],0.1,0.3))
qs("q1-q1",S[0],"Mathematics searches for patterns and also for:","கணிதம் வடிவங்களைத் தேடுவதுடன் எதையும் தேடுகிறது?","Mathematics looks for patterns and their:","கணிதம் வடிவங்களையும் அவற்றின்:",1,[O("Colours","நிறங்கள்","Colours are not the goal of mathematics.","நிறங்கள் கணிதத்தின் குறிக்கோள் அல்ல."),O("Explanations","விளக்கங்கள்"),O("Prices","விலைகள்","Prices are not the goal of mathematics.","விலைகள் கணிதத்தின் குறிக்கோள் அல்ல.")],"We want to know why a pattern exists.","ஒரு வடிவம் ஏன் உள்ளது என்று அறிய விரும்புகிறோம்.")
T(S[1],"q2-seq","A number sequence is a list of numbers that follows a rule. Here are some famous ones. All 1s. Counting numbers 1, 2, 3. Odd numbers 1, 3, 5. Even numbers 2, 4, 6. Triangular numbers 1, 3, 6, 10, 15. Squares 1, 4, 9, 16, 25. Each has its own rule, and once we know the rule we can write the next numbers.","எண் தொடர்வரிசை என்பது ஒரு விதியைப் பின்பற்றும் எண்களின் பட்டியல். இதோ சில புகழ்பெற்றவை. எல்லாம் 1. எண்ணும் எண்கள் 1, 2, 3. ஒற்றை எண்கள் 1, 3, 5. இரட்டை எண்கள் 2, 4, 6. முக்கோண எண்கள் 1, 3, 6, 10, 15. வர்க்க எண்கள் 1, 4, 9, 16, 25. ஒவ்வொன்றுக்கும் தனி விதி உண்டு, விதி தெரிந்தால் அடுத்த எண்களை எழுதலாம்.",wr([f"sq{k}t" for k in range(6)],0.05,0.1,300)+wr([f"sq{k}n" for k in range(6)],0.1,0.1,300))
T(S[1],"q2-more","There are more sequences. Cubes: 1, 8, 27, 64, 125. Virahanka numbers: 1, 2, 3, 5, 8, 13, 21, where each number is the sum of the two before it. Powers of 2: 1, 2, 4, 8, 16, where each number is double the one before. Powers of 3: 1, 3, 9, 27, 81, where each is three times the last. Try writing the next three numbers of each sequence yourself.","மேலும் தொடர்வரிசைகள் உள்ளன. கன எண்கள்: 1, 8, 27, 64, 125. விராஹாங்க எண்கள்: 1, 2, 3, 5, 8, 13, 21, ஒவ்வொரு எண்ணும் அதன் முந்தைய இரண்டின் கூட்டுத்தொகை. 2 இன் அடுக்குகள்: 1, 2, 4, 8, 16, ஒவ்வொன்றும் முந்தையதன் இரு மடங்கு. 3 இன் அடுக்குகள்: 1, 3, 9, 27, 81, ஒவ்வொன்றும் முந்தையதன் மூன்று மடங்கு. ஒவ்வொரு தொடரின் அடுத்த மூன்று எண்களையும் நீங்களே எழுதிப் பாருங்கள்.",wr(["tS0","tS1","tS2"],0.1,0.3))
qs("q2-q1",S[1],"What comes next? 2, 4, 8, 16, ...","அடுத்து என்ன? 2, 4, 8, 16, ...","Doubling each time, the next number is:","ஒவ்வொரு முறையும் இரட்டிப்பு, அடுத்த எண்:",2,[O("18","18","That adds 2, but the rule is doubling.","அது 2 கூட்டுகிறது, விதி இரட்டிப்பு."),O("24","24","16 + 8 is not the rule; it doubles.","16 + 8 விதி அல்ல; அது இரட்டிப்பு."),O("32","32")],"16 × 2 = 32.","16 × 2 = 32.")
qs("q2-q2",S[1],"What comes next in 1, 2, 3, 5, 8, 13, ...?","1, 2, 3, 5, 8, 13, ... இல் அடுத்து என்ன?","Add the last two numbers: 8 + 13 =","கடைசி இரண்டையும் கூட்டுங்கள்: 8 + 13 =",0,[O("21","21"),O("18","18","Add the last two: 8 + 13.","கடைசி இரண்டைக் கூட்டுங்கள்: 8 + 13."),O("26","26","That doubles 13, but the rule adds the last two.","அது 13 ஐ இரட்டிப்பாக்குகிறது, விதி கடைசி இரண்டைக் கூட்டுவது.")],"Each number is the sum of the two before: 21.","ஒவ்வொரு எண்ணும் முந்தைய இரண்டின் கூட்டுத்தொகை: 21.")
T(S[2],"q3-tri","We can see sequences as pictures. Triangular numbers: 1 dot, then 3 dots in a triangle, then 6, then 10, then 15. Each new row adds one more dot than the row before. So we add 2, then 3, then 4, then 5. That is why they are called triangular numbers: the dots form triangles.","தொடர்வரிசைகளைப் படங்களாகக் காணலாம். முக்கோண எண்கள்: 1 புள்ளி, பிறகு முக்கோணத்தில் 3 புள்ளிகள், பிறகு 6, 10, 15. ஒவ்வொரு புதிய வரிசையும் முந்தைய வரிசையை விட ஒரு புள்ளி அதிகம். எனவே 2, பிறகு 3, 4, 5 சேர்க்கிறோம். அதனால்தான் அவை முக்கோண எண்கள் எனப்படுகின்றன: புள்ளிகள் முக்கோணங்களை உருவாக்குகின்றன.",wr(["tT0"],0.02,0)+[x for n in range(5) for x in shg(tri[n],0.1+n*0.15,0.2+n*0.15)]+wr(["tT1"],0.9,0))
T(S[2],"q3-sq","Square numbers: 1, 4, 9, 16. A square of n rows with n dots in each row has n times n dots. That is why they are called squares. Cubes work the same way in three dimensions: 1, 8, 27, 64, because n by n by n blocks make a cube.","வர்க்க எண்கள்: 1, 4, 9, 16. n வரிசைகள், ஒவ்வொன்றிலும் n புள்ளிகள் உள்ள சதுரத்தில் n × n புள்ளிகள். அதனால்தான் அவை வர்க்க எண்கள். கன எண்களும் மூன்று பரிமாணங்களில் அதே போல்: 1, 8, 27, 64, ஏனெனில் n × n × n கட்டைகள் ஒரு கனசதுரத்தை உருவாக்குகின்றன.",wr(["tQ0","tQ1"],0.02,0.3)+[x for n in range(4) for x in shg(sqr[n],0.1+n*0.2,0.25+n*0.2)])
T(S[2],"q3-both","Look at 36. You can arrange 36 dots in a perfect triangle with 8 rows, and also in a perfect square, 6 by 6. So 36 is both a triangular number and a square number. The same number can be pictured in different ways and can play different roles.","36 ஐப் பாருங்கள். 36 புள்ளிகளை 8 வரிசைகள் கொண்ட சரியான முக்கோணமாகவும், 6 × 6 சரியான சதுரமாகவும் அடுக்கலாம். எனவே 36 முக்கோண எண்ணும் வர்க்க எண்ணும் ஆகும். ஒரே எண்ணை வெவ்வேறு விதமாகப் படம் வரையலாம், அது வெவ்வேறு பங்குகளை ஏற்கலாம்.",wr(["tQ2"],0.5,0))
T(S[2],"q3-hex","Hexagonal numbers: 1, 7, 19, 37. Start with one dot in the centre. The next ring around it has 6 dots, giving 7. The next ring has 12 dots, giving 19. The next ring has 18, giving 37. Each ring adds 6 more than the last ring.","அறுகோண எண்கள்: 1, 7, 19, 37. மையத்தில் ஒரு புள்ளியுடன் தொடங்குங்கள். அதைச் சுற்றியுள்ள அடுத்த வளையத்தில் 6 புள்ளிகள், கூட்டினால் 7. அடுத்த வளையத்தில் 12 புள்ளிகள், கூட்டினால் 19. அடுத்த வளையத்தில் 18, கூட்டினால் 37. ஒவ்வொரு வளையமும் முந்தையதை விட 6 அதிகம்.",wr(["tH0"],0.02,0)+[x for k in range(3) for x in shg(hexr[k],0.1+k*0.25,0.3+k*0.25)]+wr(["tH1"],0.92,0))
qs("q3-q1",S[2],"What is the next triangular number after 1, 3, 6, 10, 15?","1, 3, 6, 10, 15 க்குப் பின் அடுத்த முக்கோண எண்?","15 + 6 =","15 + 6 =",1,[O("20","20","The numbers added grow: +2, +3, +4, +5, so next is +6.","கூட்டும் எண்கள் வளரும்: +2, +3, +4, +5, அடுத்தது +6."),O("21","21"),O("25","25","25 is a square number.","25 வர்க்க எண்.")],"Add 6 to 15 to get 21.","15 உடன் 6 கூட்டினால் 21.")
qs("q3-q2",S[2],"Why are 1, 4, 9, 16, 25 called square numbers?","1, 4, 9, 16, 25 ஏன் வர்க்க எண்கள் எனப்படுகின்றன?","Because their dots can be arranged:","ஏனெனில் அவற்றின் புள்ளிகளை அடுக்கலாம்:",0,[O("In a perfect square","சரியான சதுரமாக"),O("In a triangle only","முக்கோணமாக மட்டும்","Triangles give 1, 3, 6, 10.","முக்கோணங்கள் 1, 3, 6, 10 தரும்."),O("In a circle only","வட்டமாக மட்டும்","The name comes from squares.","பெயர் சதுரங்களிலிருந்து வந்தது.")],"n rows of n dots make a square.","n வரிசைகள், n புள்ளிகள் சதுரம் தரும்.")
T(S[3],"q4-odd","Sequences are related. What happens when we add odd numbers? 1 plus 3 is 4. 1 plus 3 plus 5 is 9. 1 plus 3 plus 5 plus 7 is 16. We get the square numbers! Why? A square of dots can be split into L-shapes. The first L is 1 dot, the next L has 3, then 5, then 7, then 9, then 11. Each L is the next odd number, and together they build the square.","தொடர்வரிசைகள் ஒன்றுடன் ஒன்று தொடர்புடையவை. ஒற்றை எண்களைக் கூட்டினால் என்ன நடக்கும்? 1 + 3 = 4. 1 + 3 + 5 = 9. 1 + 3 + 5 + 7 = 16. வர்க்க எண்கள் கிடைக்கின்றன! ஏன்? புள்ளிச் சதுரத்தை L வடிவங்களாகப் பிரிக்கலாம். முதல் L 1 புள்ளி, அடுத்த L 3, பிறகு 5, 7, 9, 11. ஒவ்வொரு L உம் அடுத்த ஒற்றை எண், அவை சேர்ந்து சதுரத்தை உருவாக்குகின்றன.",wr(["tO1","tO2","tO3"],0.02,0.05,300)+[x for k in range(6) for x in shg(oddl[k],0.12+k*0.12,0.2+k*0.12)]+wr(["tO4"],0.9,0))
T(S[3],"q4-hundred","Because such a picture can be drawn for a square of any size, the pattern goes on forever. The sum of the first n odd numbers is n times n. So the sum of the first 100 odd numbers is 100 times 100, which is 10,000, found without adding a hundred numbers.","எந்த அளவுச் சதுரத்துக்கும் இப்படிப் படம் வரையலாம் என்பதால் வடிவம் முடிவின்றித் தொடர்கிறது. முதல் n ஒற்றை எண்களின் கூட்டுத்தொகை n × n. எனவே முதல் 100 ஒற்றை எண்களின் கூட்டுத்தொகை 100 × 100 = 10,000, நூறு எண்களைக் கூட்டாமலே கிடைக்கிறது.",wr(["tO5","tO6","tU3"],0.1,0.4))
T(S[3],"q4-updown","Here is another pattern. 1 plus 2 plus 3 plus 4 plus 5 plus 4 plus 3 plus 2 plus 1 equals 25. Adding the counting numbers up and then down gives square numbers again. A 5 by 5 square of dots, cut into diagonal lines, has 1, 2, 3, 4, 5, then 4, 3, 2, 1 dots. So 1 plus 2 and so on up to 100 and back down is 100 times 100, which is 10,000.","இன்னொரு வடிவம். 1 + 2 + 3 + 4 + 5 + 4 + 3 + 2 + 1 = 25. எண்ணும் எண்களை ஏறி இறங்கிக் கூட்டினால் மீண்டும் வர்க்க எண்கள். 5 × 5 புள்ளிச் சதுரத்தை மூலைவிட்டக் கோடுகளாக வெட்டினால் 1, 2, 3, 4, 5, பிறகு 4, 3, 2, 1 புள்ளிகள். எனவே 1 + 2 என 100 வரை சென்று திரும்பி இறங்கினால் 100 × 100 = 10,000.",wr(["tU1"],0.02,0)+[x for d in range(9) for x in shg(udd[d],0.1+d*0.09,0.15+d*0.09)]+wr(["tU2"],0.92,0))
T(S[3],"q4-more","More relations. Add two triangular numbers that are next to each other: 1 plus 3 is 4, 3 plus 6 is 9, 6 plus 10 is 16. We get squares again, because two triangles make a square. Add up powers of 2: 1, 3, 7, 15, 31. Now add 1 to each: 2, 4, 8, 16, 32, the powers of 2 again. Patterns hide inside patterns.","மேலும் தொடர்புகள். அடுத்தடுத்த இரு முக்கோண எண்களைக் கூட்டுங்கள்: 1 + 3 = 4, 3 + 6 = 9, 6 + 10 = 16. மீண்டும் வர்க்க எண்கள், ஏனெனில் இரண்டு முக்கோணங்கள் ஒரு சதுரம் ஆகும். 2 இன் அடுக்குகளைக் கூட்டுங்கள்: 1, 3, 7, 15, 31. இப்போது ஒவ்வொன்றுடனும் 1 கூட்டுங்கள்: 2, 4, 8, 16, 32, மீண்டும் 2 இன் அடுக்குகள். வடிவங்களுக்குள் வடிவங்கள் மறைந்துள்ளன.",wr(["tV1","tV2","tV3","tV4"],0.05,0.2))
qs("q4-q1",S[3],"What is 1 + 3 + 5 + 7 + 9?","1 + 3 + 5 + 7 + 9 என்ன?","Sum of the first 5 odd numbers =","முதல் 5 ஒற்றை எண்களின் கூட்டுத்தொகை =",2,[O("20","20","Check: it is 5 × 5.","சோதியுங்கள்: அது 5 × 5."),O("30","30","Too large; use 5 × 5.","மிகப் பெரியது; 5 × 5 ஐப் பயன்படுத்துங்கள்."),O("25","25")],"The first 5 odd numbers add to 5 × 5 = 25.","முதல் 5 ஒற்றை எண்களின் கூட்டுத்தொகை 5 × 5 = 25.")
qs("q4-q2",S[3],"Sum of the first 10 odd numbers?","முதல் 10 ஒற்றை எண்களின் கூட்டுத்தொகை?","10 × 10 =","10 × 10 =",1,[O("55","55","That is the sum of the counting numbers to 10.","அது 10 வரை எண்ணும் எண்களின் கூட்டுத்தொகை."),O("100","100"),O("20","20","Use n × n, not n + n.","n × n ஐப் பயன்படுத்துங்கள், n + n அல்ல.")],"The sum of the first n odd numbers is n × n.","முதல் n ஒற்றை எண்களின் கூட்டுத்தொகை n × n.")
qs("q4-q3",S[3],"3 + 6 = 9. Which kind of number do two neighbouring triangular numbers add to?","3 + 6 = 9. அடுத்தடுத்த இரு முக்கோண எண்கள் எவ்வகை எண்ணாகக் கூடும்?","Two neighbouring triangular numbers add to a:","அடுத்தடுத்த இரு முக்கோண எண்களின் கூட்டுத்தொகை:",0,[O("Square number","வர்க்க எண்"),O("Cube","கன எண்","1 + 3 = 4, not a cube.","1 + 3 = 4, கன எண் அல்ல."),O("Power of 2 always","எப்போதும் 2 இன் அடுக்கு","3 + 6 = 9 is not a power of 2.","3 + 6 = 9, 2 இன் அடுக்கு அல்ல.")],"1+3=4, 3+6=9, 6+10=16: squares.","1+3=4, 3+6=9, 6+10=16: வர்க்க எண்கள்.")
T(S[4],"q5-shape","Shapes make sequences too. In the sequence of regular polygons, the sides are 3, 4, 5, 6, 7, 8, which are counting numbers starting from 3. That is why we have triangle, square, pentagon, hexagon, heptagon and octagon. Regular means all sides are equal and all corners look the same.","வடிவங்களும் தொடர்வரிசைகளை உருவாக்குகின்றன. ஒழுங்குப் பலகோணங்களின் வரிசையில் பக்கங்கள் 3, 4, 5, 6, 7, 8, அவை 3 இலிருந்து தொடங்கும் எண்ணும் எண்கள். அதனால்தான் முக்கோணம், சதுரம், ஐங்கோணம், அறுகோணம், எழுகோணம், எண்கோணம் உள்ளன. ஒழுங்கு என்றால் எல்லாப் பக்கங்களும் சமம், எல்லா மூலைகளும் ஒரே மாதிரி.",wr(["tP0"],0.02,0)+[x for n in range(6) for x in (["show",f"pg{n+3}",0.1+n*0.1,{"ms":300}],["show",f"pn{n+3}",0.12+n*0.1,{"ms":300}])]+wr(["tP1","tP2"],0.78,0.1))
T(S[4],"q5-graph","Another shape sequence is the complete graph. Put some points and join every point to every other point. Two points give 1 line. Three points give 3 lines. Four points give 6 lines. Five points give 10 lines. Six give 15. The numbers of lines are 1, 3, 6, 10, 15, the triangular numbers again!","இன்னொரு வடிவ வரிசை முழு வரைபடம். சில புள்ளிகளை வைத்து ஒவ்வொரு புள்ளியையும் மற்ற எல்லாப் புள்ளிகளுடனும் இணையுங்கள். இரண்டு புள்ளிகள் 1 கோடு. மூன்று புள்ளிகள் 3 கோடுகள். நான்கு புள்ளிகள் 6 கோடுகள். ஐந்து 10. ஆறு 15. கோடுகளின் எண்ணிக்கை 1, 3, 6, 10, 15, மீண்டும் முக்கோண எண்கள்!",wr(["tK0"],0.02,0)+[x for n in range(5) for x in shg(cg[n],0.1+n*0.15,0.18+n*0.15)]+wr([f"cn{n}" for n in range(2,7)],0.2,0.15,300)+wr(["tK1"],0.92,0))
qs("q5-q1",S[4],"A regular polygon has 9 sides. What is it called?","ஒரு ஒழுங்குப் பலகோணத்துக்கு 9 பக்கங்கள். அதன் பெயர்?","The sides go 3, 4, 5, 6, 7, 8, then 9:","பக்கங்கள் 3, 4, 5, 6, 7, 8, பிறகு 9:",1,[O("Octagon","எண்கோணம்","An octagon has 8 sides.","எண்கோணத்துக்கு 8 பக்கங்கள்."),O("Nonagon","ஒன்பதுகோணம்"),O("Decagon","பத்துகோணம்","A decagon has 10 sides.","பத்துகோணத்துக்கு 10 பக்கங்கள்.")],"Nine sides is a nonagon.","ஒன்பது பக்கங்கள் nonagon.")
qs("q5-q2",S[4],"How many lines join 6 points, every point to every other point?","6 புள்ளிகளையும் ஒவ்வொன்றும் மற்றவற்றுடன் இணைக்க எத்தனை கோடுகள்?","Complete graph with 6 points has:","6 புள்ளிகள் உள்ள முழு வரைபடத்தில்:",2,[O("10 lines","10 கோடுகள்","10 is for 5 points.","10 என்பது 5 புள்ளிகளுக்கு."),O("12 lines","12 கோடுகள்","Follow the triangular numbers: 10 then 15.","முக்கோண எண்களைப் பின்பற்றுங்கள்: 10 பிறகு 15."),O("15 lines","15 கோடுகள்")],"1, 3, 6, 10, 15: six points give 15 lines.","1, 3, 6, 10, 15: ஆறு புள்ளிகள் 15 கோடுகள்.")
T(S[5],"q6-link","Shapes and numbers explain each other. In a regular polygon the number of sides equals the number of corners, and both are the counting numbers 3, 4, 5 and so on. In complete graphs the number of lines follows the triangular numbers. Seeing a number sequence inside a shape sequence helps us understand both. Try finding your own patterns and explain them with a picture.","வடிவங்களும் எண்களும் ஒன்றையொன்று விளக்குகின்றன. ஒழுங்குப் பலகோணத்தில் பக்கங்களின் எண்ணிக்கை மூலைகளின் எண்ணிக்கைக்குச் சமம், இரண்டும் 3, 4, 5 எனும் எண்ணும் எண்கள். முழு வரைபடங்களில் கோடுகளின் எண்ணிக்கை முக்கோண எண்களைப் பின்பற்றுகிறது. வடிவ வரிசைக்குள் எண் தொடரைக் காண்பது இரண்டையும் புரிந்துகொள்ள உதவும். உங்கள் சொந்த வடிவங்களைக் கண்டுபிடித்துப் படத்துடன் விளக்கிப் பாருங்கள்.",wr(["tN0","tN1","tN2","tN3"],0.05,0.2))
qs("q6-q1",S[5],"In a regular polygon, how do the number of sides and corners compare?","ஒழுங்குப் பலகோணத்தில் பக்கங்களும் மூலைகளும் எவ்வாறு ஒப்பிடப்படும்?","Sides and corners are:","பக்கங்களும் மூலைகளும்:",0,[O("Equal in number","எண்ணிக்கையில் சமம்"),O("Corners are double","மூலைகள் இருமடங்கு","A triangle has 3 sides and 3 corners.","முக்கோணத்துக்கு 3 பக்கங்கள், 3 மூலைகள்."),O("Sides are double","பக்கங்கள் இருமடங்கு","A square has 4 sides and 4 corners.","சதுரத்துக்கு 4 பக்கங்கள், 4 மூலைகள்.")],"Each side ends in a corner, so the numbers match.","ஒவ்வொரு பக்கமும் ஒரு மூலையில் முடிகிறது, எண்ணிக்கை பொருந்தும்.")
step("qm-intro",S[6],"A few mixed questions to finish this chapter.","அத்தியாயத்தை முடிக்கச் சில கலவைக் கேள்விகள்.",[CL]+wr(["tM2"],0.1,0))
qs("qm1",S[6],"Next in 1, 4, 9, 16, 25, ...","1, 4, 9, 16, 25, ... இல் அடுத்தது","Next square number:","அடுத்த வர்க்க எண்:",1,[O("30","30","Squares: 6 × 6 = 36.","வர்க்கங்கள்: 6 × 6 = 36."),O("36","36"),O("49","49","49 is 7 × 7, which comes later.","49 என்பது 7 × 7, அது பிறகு வரும்.")],"6 × 6 = 36.","6 × 6 = 36.")
qs("qm2",S[6],"Next in 1, 3, 6, 10, 15, 21, ...","1, 3, 6, 10, 15, 21, ... இல் அடுத்தது","21 + 7 =","21 + 7 =",2,[O("26","26","Add 7, not 5.","7 கூட்டுங்கள், 5 அல்ல."),O("27","27","Add 7 to 21, not 6; 21 + 6 is 27.","21 உடன் 7 கூட்டுங்கள், 6 அல்ல; 21 + 6 = 27."),O("28","28")],"Triangular numbers: 28.","முக்கோண எண்கள்: 28.")
qs("qm3",S[6],"The sum of the first 7 odd numbers is:","முதல் 7 ஒற்றை எண்களின் கூட்டுத்தொகை:","7 × 7 =","7 × 7 =",0,[O("49","49"),O("14","14","That is 7 + 7; the rule needs 7 × 7.","அது 7 + 7; விதிக்கு 7 × 7 தேவை."),O("28","28","That is a triangular number, not this sum.","அது முக்கோண எண், இந்தக் கூட்டுத்தொகை அல்ல.")],"The sum of the first n odd numbers is n × n.","முதல் n ஒற்றை எண்களின் கூட்டுத்தொகை n × n.")
qs("qm4",S[6],"Each Virahanka number is:","ஒவ்வொரு விராஹாங்க எண்ணும்:","1, 2, 3, 5, 8, 13: each is:","1, 2, 3, 5, 8, 13: ஒவ்வொன்றும்:",1,[O("Double the last","முந்தையதன் இரு மடங்கு","That is for powers of 2.","அது 2 இன் அடுக்குகளுக்கு."),O("The sum of the two before it","முந்தைய இரண்டின் கூட்டுத்தொகை"),O("Odd","ஒற்றை","They are not all odd.","எல்லாம் ஒற்றை அல்ல.")],"3 + 5 = 8 and 5 + 8 = 13.","3 + 5 = 8, 5 + 8 = 13.")
qs("qm5",S[6],"How many dots does the third hexagonal number have?","மூன்றாவது அறுகோண எண்ணில் எத்தனை புள்ளிகள்?","1, 7, 19: the third is:","1, 7, 19: மூன்றாவது:",2,[O("12","12","12 is the number of dots in the second ring only.","12 இரண்டாம் வளையப் புள்ளிகள் மட்டும்."),O("7","7","7 is the second.","7 இரண்டாவது."),O("19","19")],"1 + 6 + 12 = 19.","1 + 6 + 12 = 19.")
# ---- gap fill: more relations
L("All 1s added up give 1, 2, 3, 4 ... (counting numbers)","mr1",y=90,s=24,c=BL); L("Counting numbers added up give 1, 3, 6, 10 ... (triangular)","mr2",y=140,s=24,c=GR)
L("1 = 1","mr3",y=210,s=28,c=RD); L("1 + 2 = 3","mr4",y=255,s=28,c=RD); L("1 + 2 + 3 = 6","mr5",y=300,s=28,c=RD); L("1 + 2 + 3 + 4 = 10","mr6",y=345,s=28,c=RD)
L("Triangular number × 6, then + 1:","mr7",y=90,s=26,c=BL); L("1 × 6 + 1 = 7","mr8",y=170,s=24,c=RD,x=215); L("3 × 6 + 1 = 19","mr9",y=230,s=24,c=RD,x=215); L("6 × 6 + 1 = 37","mr10",y=290,s=24,c=RD,x=215); L("10 × 6 + 1 = 61: the hexagonal numbers","mr11",y=450,s=24,c=GR)
L("Add up the hexagonal numbers:","mr12",y=60,s=24,c=BL); L("1 = 1","mr13",y=120,s=26,c=RD); L("1 + 7 = 8","mr14",y=165,s=26,c=RD); L("1 + 7 + 19 = 27","mr15",y=210,s=26,c=RD); L("1 + 7 + 19 + 37 = 64","mr16",y=255,s=26,c=RD); L("1, 8, 27, 64 are the cubes!","mr17",y=310,s=28,c=GR); L("Each hexagonal layer wraps the cube before it","mr18",y=350,s=20,c=PU)
L("Cubes: 1×1×1 = 1,  2×2×2 = 8,  3×3×3 = 27,  4×4×4 = 64","cb1",y=400,s=20,c=BL); L("A cube of side 3 has 3 layers, each 3 × 3 = 9 blocks","cb2",y=435,s=20,c=GR); L("The next cube number is 5 × 5 × 5 = 125","cb3",y=470,s=20,c=RD)
L("Powers of 2: 1, 2, 4, 8, 16 ...","pw1",y=70,s=26,c=BL); L("Each step doubles: the new bar copies all the old bars","pw2",y=450,s=22,c=GR)
for k,w in enumerate([1,2,4,8,16]):
    RECT(f"pwb{k}",100,110+k*55,w*28,40,fill=COL[k],stroke="#16253F",lw=2); L(str(w),f"pwn{k}",y=142+k*55,s=24,c="#16253F",x=100+w*28+30)
L("Sums of powers of 2: 1, 3, 7, 15, 31. Add 1: 2, 4, 8, 16, 32","pw3",y=400,s=22,c=RD)
T(S[6],"q7-counting","What do we get if we add up the All 1s sequence? 1, then 1 plus 1, then 1 plus 1 plus 1: the counting numbers. What if we add up the counting numbers? 1, then 1 plus 2, then 1 plus 2 plus 3: the triangular numbers, 1, 3, 6, 10. Adding a sequence up gives a new sequence.","எல்லாம் 1 தொடரைக் கூட்டினால் என்ன கிடைக்கும்? 1, பிறகு 1 + 1, பிறகு 1 + 1 + 1: எண்ணும் எண்கள். எண்ணும் எண்களைக் கூட்டினால்? 1, பிறகு 1 + 2, பிறகு 1 + 2 + 3: முக்கோண எண்கள் 1, 3, 6, 10. ஒரு தொடரைக் கூட்டிக்கொண்டே போனால் புதிய தொடர் கிடைக்கும்.",wr(["mr1","mr2"],0.02,0.08)+wr(["mr3","mr4","mr5","mr6"],0.3,0.15))
T(S[6],"q7-hex","Multiply each triangular number by 6 and add 1. 1 times 6 plus 1 is 7. 3 times 6 plus 1 is 19. 6 times 6 plus 1 is 37. These are the hexagonal numbers. Picture it: a hexagon of dots is made of six triangles around a centre dot.","ஒவ்வொரு முக்கோண எண்ணையும் 6 ஆல் பெருக்கி 1 கூட்டுங்கள். 1 × 6 + 1 = 7. 3 × 6 + 1 = 19. 6 × 6 + 1 = 37. இவை அறுகோண எண்கள். படமாகப் பாருங்கள்: ஒரு மையப் புள்ளியைச் சுற்றி ஆறு முக்கோணங்களால் ஆன புள்ளி அறுகோணம்.",wr(["mr7","mr8","mr9","mr10","mr11"],0.05,0.15)+[x for k in range(3) for x in shg(hexr[k],0.8,0.95)])
T(S[6],"q7-cube","Add up the hexagonal numbers: 1, then 1 plus 7 is 8, then 8 plus 19 is 27, then 27 plus 37 is 64. We get the cube numbers! Picture a cube built from layers: each new hexagonal shell wraps around the cube made so far and makes the next bigger cube. A cube of side 3 has 3 layers of 9 blocks, 27 blocks in all, and the next cube, side 5, has 125.","அறுகோண எண்களைக் கூட்டுங்கள்: 1, பிறகு 1 + 7 = 8, பிறகு 8 + 19 = 27, பிறகு 27 + 37 = 64. கன எண்கள் கிடைக்கின்றன! அடுக்குகளால் ஆன கனசதுரத்தை நினைத்துப் பாருங்கள்: ஒவ்வொரு புதிய அறுகோண உறையும் இதுவரை கட்டிய கனசதுரத்தைச் சுற்றி அடுத்த பெரிய கனசதுரத்தை உருவாக்குகிறது. பக்கம் 3 கனசதுரத்தில் 9 கட்டைகள் கொண்ட 3 அடுக்குகள், மொத்தம் 27; அடுத்த கனசதுரம் பக்கம் 5, 125.",wr(["mr12","mr13","mr14","mr15","mr16","mr17","mr18"],0.03,0.1)+wr(["cb1","cb2","cb3"],0.78,0.07))
T(S[6],"q7-pow","Powers of 2 as a picture: bars of length 1, 2, 4, 8, 16. Each bar is twice the one before, so each new bar can be made by copying all the old bars together and adding 1. That is why 1 plus 2 plus 4 plus 8 plus 1 is 16, and the sums 1, 3, 7, 15, 31 are always one less than the next power of 2.","2 இன் அடுக்குகளைப் படமாக: 1, 2, 4, 8, 16 நீளமுள்ள பட்டைகள். ஒவ்வொரு பட்டையும் முந்தையதன் இரு மடங்கு, எனவே பழைய பட்டைகளை எல்லாம் நகலெடுத்து 1 சேர்த்தால் புதிய பட்டை கிடைக்கும். அதனால்தான் 1 + 2 + 4 + 8 + 1 = 16, 1, 3, 7, 15, 31 கூட்டுத்தொகைகள் எப்போதும் அடுத்த 2 இன் அடுக்கை விட 1 குறைவு.",wr(["pw1"],0.02,0)+[x for k in range(5) for x in (["show",f"pwb{k}",0.1+k*0.14,{"ms":300}],["show",f"pwn{k}",0.12+k*0.14,{"ms":300}])]+wr(["pw3","pw2"],0.8,0.1))
qs("q7-q1",S[6],"1 + 7 + 19 + 37 = ?","1 + 7 + 19 + 37 = ?","The sum of hexagonal numbers is a:","அறுகோண எண்களின் கூட்டுத்தொகை:",1,[O("Square number","வர்க்க எண்","64 = 8 × 8 is a square too, but the pattern is cubes: 4 × 4 × 4.","64 = 8 × 8 வர்க்கமும் தான், ஆனால் இங்கு வடிவம் கனங்கள்: 4 × 4 × 4."),O("Cube number, 64","கன எண், 64"),O("Triangular number","முக்கோண எண்","64 is not a triangular number.","64 முக்கோண எண் அல்ல.")],"1, 8, 27, 64 are 1³, 2³, 3³, 4³.","1, 8, 27, 64 என்பவை 1³, 2³, 3³, 4³.")
qs("q7-q2",S[6],"10 × 6 + 1 =","10 × 6 + 1 =","The 4th triangular number times 6 plus 1:","4 ஆம் முக்கோண எண் × 6 + 1:",2,[O("60","60","Do not forget to add 1.","1 சேர்க்க மறக்காதீர்கள்."),O("62","62","10 × 6 = 60, plus 1 is 61.","10 × 6 = 60, 1 சேர்த்தால் 61."),O("61","61")],"This is the next hexagonal number after 37.","இது 37 க்குப் பின் அடுத்த அறுகோண எண்.")
qs("q7-q3",S[6],"1 + 2 + 4 + 8 + 16 = 31. What is 31 + 1?","1 + 2 + 4 + 8 + 16 = 31. 31 + 1 என்ன?","31 + 1 is the next power of 2:","31 + 1 அடுத்த 2 இன் அடுக்கு:",0,[O("32","32"),O("33","33","The next power of 2 after 16 is 32.","16 க்குப் பின் 2 இன் அடுக்கு 32."),O("64","64","64 is two powers later.","64 இரண்டு அடுக்குகள் பின்.")],"Sums of powers of 2 are one less than the next power.","2 இன் அடுக்குகளின் கூட்டுத்தொகை அடுத்த அடுக்கை விட ஒன்று குறைவு.")
# ---- shape sequences: stacked squares / triangles / Koch
import cmath
def koch(n):
    pts=[complex(280,360),complex(620,360),complex(450,66)]
    for _ in range(n):
        new=[]
        for i in range(3 if _==0 else len(pts)):
            a=pts[i]; b=pts[(i+1)%len(pts)]
            d=(b-a)/3; p1=a+d; p2=a+2*d; peak=p1+d*cmath.exp(1j*math.pi/3)
            new+= [a,p1,peak,p2]
        pts=new
    return pts
k1=[[round(z.real,1),round(z.imag,1)] for z in koch(1)]
part("raw","ko0",{"kind":"poly","points":[[round(z.real),round(z.imag)] for z in koch(0)],"fill":"#E3F2FD","stroke":"#1E88E5","width":4})
part("raw","ko1",{"kind":"poly","points":k1,"fill":"#E3F2FD","stroke":"#1E88E5","width":4})
k2=koch(2); d="M "+" L ".join(f"{round(z.real)} {round(z.imag)}" for z in k2)+" Z"
part("raw","ko2",{"kind":"path","d":d,"stroke":"#E65100","width":3})
L("Koch snowflake: replace each segment by a speed bump","ko3",y=40,s=22,c=BL); L("Segments: 3, 12, 48 ...  = 3 × 4, 3 × 4 × 4 ...","ko4",y=478,s=22,c=RD); L("3 times powers of 4","ko5",y=452,s=20,c=GR)
# stacked squares 1x1,2x2,3x3,4x4 and stacked triangle rows
for n in range(1,5):
    for r in range(n):
        for c in range(n): RECT(f"ss{n}x{r}x{c}",110+[0,70,190,350][n-1]+c*30,150+r*30,28,28,fill="#BBDEFB",stroke="#1E88E5",lw=2)
L("Stacked squares: 1, 4, 9, 16 little squares","ss0",y=90,s=26,c=BL); L("n rows of n squares = n × n: the square numbers","ss1",y=330,s=24,c=GR)
for n in range(1,5):
    ox=[170,340,540,780][n-1]
    for r in range(n):
        for c in range(r+1): DT(f"st{n}x{r}x{c}",ox+(c-r/2)*40,380+r*0+(r-n)*38+80,12,"#FFD166","#E65100")
L("Stacked triangles: 1, 3, 6, 10 little triangles","st0",y=360,s=26,c=BL) if False else None
L("Stacked triangles: rows of 1, 2, 3, 4 give 1, 3, 6, 10","st9",y=460,s=24,c=RD)
T(S[7],"q8-sq","Shape sequences and numbers. Stacked squares: the shapes have 1, 4, 9, 16 little squares. Each shape is n rows with n squares in each, so n times n: the square numbers. Stacked triangles: each new shape adds a row with one more triangle than the row before, so we count 1, then 1 plus 2, then 1 plus 2 plus 3: 1, 3, 6, 10, the triangular numbers.","வடிவ வரிசைகளும் எண்களும். அடுக்கிய சதுரங்கள்: வடிவங்களில் 1, 4, 9, 16 சிறு சதுரங்கள். ஒவ்வொரு வடிவமும் n வரிசைகள், ஒவ்வொன்றிலும் n சதுரங்கள், எனவே n × n: வர்க்க எண்கள். அடுக்கிய முக்கோணங்கள்: ஒவ்வொரு புதிய வடிவமும் முந்தைய வரிசையை விட ஒரு முக்கோணம் அதிகமுள்ள வரிசையைச் சேர்க்கிறது, எனவே 1, பிறகு 1 + 2, பிறகு 1 + 2 + 3: 1, 3, 6, 10, முக்கோண எண்கள்.",wr(["ss0"],0.02,0)+[x for n in range(1,5) for x in sh([f"ss{n}x{r}x{c}" for r in range(n) for c in range(n)],0.08+n*0.08,0.01)]+wr(["ss1"],0.48,0)+[x for n in range(1,5) for x in sh([f"st{n}x{r}x{c}" for r in range(n) for c in range(r+1)],0.55+n*0.07,0.01)]+wr(["st9"],0.9,0))
T(S[7],"q8-koch","The Koch snowflake. Start with a triangle of 3 line segments. Replace every segment by a speed bump, a segment with a small triangle on its middle third. Now there are 12 segments. Do it again: 48. Each time every segment becomes four, so the counts are 3, 12, 48, which is 3 times 4 each step: 3 times powers of 4. This sequence is not in Table 1, so it is a new one!","கோக் பனிந்துகள். 3 கோட்டுத்துண்டுகள் கொண்ட முக்கோணத்துடன் தொடங்குங்கள். ஒவ்வொரு துண்டையும் வேகத்தடையால் மாற்றுங்கள், அதாவது நடுமூன்றில் ஒரு பகுதியில் சிறு முக்கோணம் உள்ள துண்டு. இப்போது 12 துண்டுகள். மீண்டும் செய்தால் 48. ஒவ்வொரு முறையும் ஒவ்வொரு துண்டும் நான்காகிறது, எனவே எண்ணிக்கை 3, 12, 48, அதாவது ஒவ்வொரு படியும் 3 × 4: 3 மடங்கு 4 இன் அடுக்குகள். இந்த வரிசை அட்டவணை 1 இல் இல்லை, இது புதியது!",sh(["ko0"],0.05,0)+sh(["ko1"],0.3,0)+sh(["ko2"],0.55,0)+wr(["ko3","ko4","ko5"],0.7,0.1))
qs("q8-q1",S[7],"How many little squares are in the 5th stacked-squares shape?","5 ஆவது அடுக்கிய சதுர வடிவத்தில் எத்தனை சிறு சதுரங்கள்?","5 rows of 5 squares:","5 வரிசைகள், ஒவ்வொன்றிலும் 5 சதுரங்கள்:",2,[O("10","10","That is 5 + 5, not 5 × 5.","அது 5 + 5, 5 × 5 அல்ல."),O("20","20","That is not 5 rows of 5; use n × n.","அது 5 வரிசைகள் × 5 அல்ல; n × n ஐப் பயன்படுத்துங்கள்."),O("25","25")],"Square numbers: 25.","வர்க்க எண்கள்: 25.")
qs("q8-q2",S[7],"How many line segments does the Koch snowflake have after the third shape: 3, 12, 48, ...?","கோக் பனிந்துகளில் 3, 12, 48 க்குப் பின் அடுத்த எண்ணிக்கை?","Each time multiply by 4: 48 × 4 =","ஒவ்வொரு முறையும் 4 ஆல் பெருக்குங்கள்: 48 × 4 =",1,[O("96","96","That doubles 48; the rule is ×4.","அது 48 ஐ இரட்டிப்பாக்குகிறது; விதி ×4."),O("192","192"),O("144","144","That multiplies by 3, but the rule is ×4.","அது 3 ஆல் பெருக்குகிறது, விதி ×4.")],"3 × 4 × 4 × 4 = 192.","3 × 4 × 4 × 4 = 192.")
qs("q8-q3",S[7],"How many little triangles are in the 4th stacked-triangles shape?","4 ஆவது அடுக்கிய முக்கோண வடிவத்தில் எத்தனை சிறு முக்கோணங்கள்?","Rows of 1, 2, 3, 4:","1, 2, 3, 4 வரிசைகள்:",0,[O("10","10"),O("16","16","16 is a square number, not this count.","16 வர்க்க எண், இந்த எண்ணிக்கை அல்ல."),O("8","8","That adds only 4 + 4.","அது 4 + 4 மட்டும்.")],"1 + 2 + 3 + 4 = 10.","1 + 2 + 3 + 4 = 10.")
# ---- Math Talk
L("Math Talk 1: how does mathematics help in daily life?","mt1",y=100,s=22,c=BL); L("Shopping, cooking, building bridges, phones, trains, planes ...","mt2",y=150,s=22,c=GR)
L("Math Talk 2: what pictures can you make for powers of 3?","mt3",y=230,s=22,c=BL); L("Each step three copies: 1, 3, 9, 27, 81","mt4",y=280,s=22,c=GR)
L("Try: find your own patterns and explain them with a picture","mt5",y=360,s=24,c=RD)
T(S[8],"q9-talk","Math Talk. First: how does mathematics help us in everyday life? Think of shopping, cooking, building bridges and houses, making phones, trains and planes, running a country's economy. Second: how can we picture the powers of 3, 1, 3, 9, 27, 81? Each step makes three copies of everything before it. And finally the challenge: find your own patterns in the sequences and explain why they happen with a picture.","கலந்துரையாடல். முதலில்: அன்றாட வாழ்வில் கணிதம் எவ்வாறு உதவுகிறது? கடைக்குச் செல்வது, சமையல், பாலங்கள், வீடுகள் கட்டுவது, தொலைபேசிகள், ரயில்கள், விமானங்கள் செய்வது, நாட்டின் பொருளாதாரத்தை நடத்துவது பற்றி யோசியுங்கள். இரண்டாவது: 3 இன் அடுக்குகள் 1, 3, 9, 27, 81 ஐ எப்படிப் படமாக்கலாம்? ஒவ்வொரு படியும் அதற்கு முந்தையவற்றின் மூன்று நகல்களை உருவாக்குகிறது. கடைசியாக சவால்: வரிசைகளில் உங்கள் சொந்த வடிவங்களைக் கண்டுபிடித்து, அவை ஏன் நிகழ்கின்றன என்பதைப் படத்துடன் விளக்குங்கள்.",wr(["mt1","mt2","mt3","mt4","mt5"],0.05,0.17))

ST.sort(key=lambda s:S.index(s["section"]))
rec={"id":"cbse-6-maths-patterns-in-mathematics","class":6,"subject":"maths","chapter":"patterns-in-mathematics","topic":"number-and-shape-patterns","title":["Patterns in Mathematics","கணிதத்தில் வடிவங்கள்"],"bg":"#F6FAFF","titleColor":"#1F3B6E","parts":P,"steps":ST}
os.makedirs(os.path.dirname(OUT),exist_ok=True); json.dump(rec,open(OUT,"w"),ensure_ascii=False,indent=1)
print(len(P),"parts",len(ST),"steps",sum(1 for s in ST if "q" in s),"questions")
