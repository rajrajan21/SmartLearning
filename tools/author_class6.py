"""Class 6 picture classroom lessons (NCERT 2026-27: Ganita Prakash, Curiosity, Exploring Society). Run: python tools/author_class6.py
Original drawings and wording; every board picture is vector data. Tamil lines are drafts for a native-speaker review."""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
import author_classroom_scenes as K
from author_classroom_scenes import Scene, act, T, Q, write

def seq(ids, do, on, ms=600, **k): return [act(do, i, on=on, ms=ms, **k) for i in ids]
INK = "#16253F"

# ============================================================ maths: types of angles
def angles():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#F4F8FF", name="bg"); title = s.text(450, 52, "Angles", 40, "#1E3FAE", name="title")
    ox = [60, 340, 690]; oy = 400; L = 175
    base = [s.line(x, oy, x + L, oy, "#16253F", 6) for x in ox]
    def ray(x, ang):  # ang: degrees above the base ray, counter-clockwise
        a = math.radians(ang); return s.line(x, oy, x + L * math.cos(a), oy - L * math.sin(a), "#D9531E", 6)
    r1, r2, r3 = ray(ox[0], 45), ray(ox[1], 90), ray(ox[2], 135)
    arcs = [s.sector(ox[0], oy, 70, 45, 90, "#FFD166", "#F4A300", 3), s.sector(ox[1], oy, 70, 0, 90, "#7BE0AD", "#17785A", 3), s.sector(ox[2], oy, 70, 315, 90, "#C9A7FF", "#7B4DD6", 3)]
    sq = s.rect(ox[1], oy - 28, 28, 28, None, "#17785A", 0, 4, name="sq") if False else s.poly([(ox[1], oy), (ox[1] + 28, oy), (ox[1] + 28, oy - 28), (ox[1], oy - 28)], None, "#17785A", 4)
    dots = [s.circle(x, oy, 9, "#1E3FAE") for x in ox]
    l1 = s.text(ox[0] + 90, 140, "Acute angle", 30, "#B45309", name="l1"); d1 = s.text(ox[0] + 90, 178, "less than 90°", 24, "soft", name="d1")
    l2 = s.text(ox[1] + 90, 140, "Right angle", 30, "#17785A", name="l2"); d2 = s.text(ox[1] + 90, 178, "exactly 90°", 24, "soft", name="d2")
    l3 = s.text(ox[2] - 10, 140, "Obtuse angle", 30, "#7B4DD6", name="l3"); d3 = s.text(ox[2] - 10, 178, "more than 90°", 24, "soft", name="d3")
    steps = [
     {"id": "an-intro", "section": "Picture it", "narration": T("An angle is made when two straight lines meet at one point. That point is called the vertex. Look at these three angles. They are not all the same size.", "இரண்டு நேர்க்கோடுகள் ஒரு புள்ளியில் சந்திச்சா கோணம் உருவாகுது. அந்தப் புள்ளிக்குப் பேரு முனை. இந்த மூணு கோணங்களையும் பாருங்க. எல்லாம் ஒரே அளவு இல்ல."),
      "actions": [act("clear", at=0), act("show", bg, at=0.01, ms=200), act("write", "title", on="An angle", ms=700)] + seq(base, "show", "two straight lines", 500) + seq(dots, "show", "one point", 500)},
     {"id": "an-acute", "section": "Picture it", "narration": T("The first angle is small and sharp. An angle smaller than a right angle is called an acute angle. It measures less than ninety degrees.", "முதல் கோணம் சின்னதா, கூர்மையா இருக்கு. செங்கோணத்தை விடச் சின்னக் கோணத்துக்குப் பேரு குறுங்கோணம். இது தொண்ணூறு டிகிரிக்குக் குறைவு."),
      "actions": [act("show", r1, on="first angle", ms=700), act("fill", arcs[0], on="small and sharp", ms=500, color="#FFD166"), act("show", arcs[0], on="small and sharp", ms=500), act("write", "l1", on="acute angle", ms=700), act("write", "d1", on="less than ninety", ms=700)]},
     {"id": "an-right", "section": "Picture it", "narration": T("The second angle is like the corner of a book. This is a right angle. It measures exactly ninety degrees. We mark it with a small square.", "ரெண்டாவது கோணம் புத்தகத்தோட மூலை மாதிரி இருக்கு. இது செங்கோணம். இது சரியா தொண்ணூறு டிகிரி. சின்ன சதுரத்தால குறிப்போம்."),
      "actions": [act("show", r2, on="second angle", ms=700), act("show", arcs[1], on="corner of a book", ms=500), act("draw", sq, on="small square", ms=700), act("write", "l2", on="right angle", ms=700), act("write", "d2", on="exactly ninety", ms=700)]},
     {"id": "an-obtuse", "section": "Picture it", "narration": T("The third angle is wide open. An angle bigger than a right angle is called an obtuse angle. It measures more than ninety degrees.", "மூணாவது கோணம் அகலமா விரிஞ்சிருக்கு. செங்கோணத்தை விடப் பெரிய கோணத்துக்குப் பேரு விரிகோணம். இது தொண்ணூறு டிகிரிக்கு அதிகம்."),
      "actions": [act("show", r3, on="wide open", ms=700), act("show", arcs[2], on="wide open", ms=500), act("write", "l3", on="obtuse angle", ms=700), act("write", "d3", on="more than ninety", ms=700)]},
     {"id": "an-q1", "section": "Picture it", "narration": T("Question time. An angle that is smaller than a right angle has a special name. What is it?", "கேள்வி நேரம். செங்கோணத்தை விடச் சின்ன கோணத்துக்கு ஒரு தனிப் பேரு இருக்கு. அது என்ன?"),
      "actions": [act("pulse", arcs[0], on="Question time", ms=1200, color="#E65100")],
      "check": Q("An angle smaller than a right angle is called…", "செங்கோணத்தை விடச் சின்ன கோணம்…", [("An obtuse angle", False, "An obtuse angle is bigger than a right angle."), ("An acute angle", True, ""), ("A right angle", False, "A right angle is exactly 90°, not smaller.")], "Less than 90° makes an acute angle.", "90°க்குக் குறைவா இருந்தா குறுங்கோணம்.")},
     {"id": "an-q2", "section": "Picture it", "narration": T("One more. How many degrees does a right angle measure?", "இன்னொண்ணு. செங்கோணம் எத்தனை டிகிரி?"),
      "actions": [act("pulse", arcs[1], on="One more", ms=1200, color="#17785A")],
      "check": Q("How many degrees is a right angle?", "செங்கோணம் எத்தனை டிகிரி?", [("45°", False, "45° is half of a right angle."), ("90°", True, ""), ("180°", False, "180° is a straight line, twice a right angle.")], "A right angle is exactly 90°.", "செங்கோணம் சரியா 90°.")},
    ]
    return s.objs, steps

# ============================================================ maths: fractions
def fractions():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#FFF8EC", name="bg"); title = s.text(450, 52, "Fractions: parts of a whole", 38, "#B45309", name="title")
    cx = [160, 450, 740]; cy = 255; r = 115
    whole = s.circle(cx[0], cy, r, "#FFD98A", "#C98A1B", 5, name="whole")
    halves = [s.sector(cx[0], cy, r, 0, 180, "#FFFFFF", "#C98A1B", 5), s.sector(cx[0], cy, r, 180, 360, "#FFFFFF", "#C98A1B", 5)]
    q = [s.sector(cx[1], cy, r, a, a + 90, "#FFFFFF", "#2F7D32", 5) for a in (0, 90, 180, 270)]
    e = [s.sector(cx[2], cy, r, a * 45, a * 45 + 45, "#FFFFFF", "#7B4DD6", 4) for a in range(8)]
    t1 = s.text(cx[0], 430, "1/2", 54, "#C2570C", name="t1"); t2 = s.text(cx[1], 430, "3/4", 54, "#2F7D32", name="t2"); t3 = s.text(cx[2], 430, "3/8", 54, "#7B4DD6", name="t3")
    s1 = s.text(cx[0], 120, "2 equal parts", 26, "soft", name="s1"); s2 = s.text(cx[1], 120, "4 equal parts", 26, "soft", name="s2"); s3 = s.text(cx[2], 120, "8 equal parts", 26, "soft", name="s3")
    steps = [
     {"id": "fr-intro", "section": "Picture it", "narration": T("Here is a whole chapati. When we share it equally, each share is a fraction of the whole. Fractions tell us how many equal parts we are talking about.", "இது ஒரு முழுச் சப்பாத்தி. இதைச் சமமாப் பகிர்ந்தா, ஒவ்வொரு பங்கும் முழுசுல ஒரு பின்னம். எத்தனை சமபாகங்கள்னு பின்னம் சொல்லுது."),
      "actions": [act("clear", at=0), act("show", bg, at=0.01, ms=200), act("write", "title", on="Here is a whole", ms=700), act("show", whole, on="whole chapati", ms=700)]},
     {"id": "fr-half", "section": "Picture it", "narration": T("Cut it into two equal parts. Each part is one half. We write one half like this.", "அதை ரெண்டு சம பாகமா வெட்டுங்க. ஒவ்வொரு பாகமும் ஒரு பாதி. ஒரு பாதியை இப்படி எழுதுவோம்."),
      "actions": [act("hide", whole, on="two equal parts", ms=300)] + seq(halves, "show", "two equal parts", 500) + [act("write", "s1", on="two equal parts", ms=700), act("fill", halves[0], on="one half", ms=700, color="#FFB74D"), act("write", "t1", on="one half like this", ms=800)]},
     {"id": "fr-quarter", "section": "Picture it", "narration": T("Now cut another chapati into four equal parts. Each part is one quarter. Take three of the four parts. That is three quarters.", "இப்போ இன்னொரு சப்பாத்தியை நாலு சம பாகமா வெட்டுங்க. ஒவ்வொண்ணும் கால் பங்கு. நாலுல மூணு பாகம் எடுங்க. அது முக்கால் பங்கு."),
      "actions": seq(q, "show", "four equal parts", 400) + [act("write", "s2", on="four equal parts", ms=600)] + [act("fill", q[0], on="Take three", ms=500, color="#81C784"), act("fill", q[1], on="three of the four", ms=500, color="#81C784"), act("fill", q[2], on="three of the four", ms=500, color="#81C784"), act("write", "t2", on="three quarters", ms=800)]},
     {"id": "fr-eighth", "section": "Picture it", "narration": T("A third chapati is cut into eight equal parts. If we eat three of them, we have eaten three eighths. The bottom number tells how many equal parts. The top number tells how many we take.", "மூணாவது சப்பாத்தி எட்டு சம பாகமா வெட்டப்படுது. அதுல மூணு சாப்பிட்டா, எட்டுல மூணு பங்கு. கீழ இருக்கிற எண் எத்தனை சம பாகம்னு சொல்லும். மேல இருக்கிற எண் எத்தனை எடுத்தோம்னு சொல்லும்."),
      "actions": seq(e, "show", "eight equal parts", 250) + [act("write", "s3", on="eight equal parts", ms=600)] + [act("fill", e[i], on="three of them", ms=400, color="#B39DDB") for i in range(3)] + [act("write", "t3", on="three eighths", ms=800), act("pulse", "t3", on="top number", ms=900, color="#7B4DD6")]},
     {"id": "fr-q1", "section": "Picture it", "narration": T("Question time. A chapati is cut into four equal parts and you take one part. Which fraction is that?", "கேள்வி நேரம். ஒரு சப்பாத்தி நாலு சம பாகமா வெட்டி, ஒரு பாகம் எடுக்கிறீங்க. அது என்ன பின்னம்?"),
      "actions": [act("pulse", q[3], on="Question time", ms=1200, color="#2E7D32")],
      "check": Q("One of four equal parts is written as…", "நாலு சம பாகத்துல ஒண்ணை எழுதுவது…", [("1/2", False, "1/2 means one of two equal parts."), ("1/4", True, ""), ("4/1", False, "4/1 would mean four whole chapatis.")], "One of four equal parts is one quarter, 1/4.", "நாலுல ஒரு பாகம் கால் பங்கு, 1/4.")},
     {"id": "fr-q2", "section": "Picture it", "narration": T("One more. A pizza is cut into eight equal slices and you eat three. What fraction did you eat?", "இன்னொண்ணு. ஒரு பீட்சா எட்டு சம துண்டுகளா வெட்டி, மூணு சாப்பிடறீங்க. எவ்வளவு பின்னம் சாப்பிட்டீங்க?"),
      "actions": [act("pulse", e[1], on="One more", ms=1200, color="#7B4DD6")],
      "check": Q("You eat 3 of 8 equal slices. The fraction is…", "8 சம துண்டுல 3 சாப்பிடுறீங்க. பின்னம்…", [("8/3", False, "The bottom number is the number of equal parts, which is 8."), ("3/8", True, ""), ("5/8", False, "5/8 is the part that is left, not the part you ate.")], "3 parts out of 8 equal parts is 3/8.", "8ல 3 பாகம் என்பது 3/8.")},
    ]
    return s.objs, steps

# ============================================================ maths: integers
def integers():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#F3FAFF", name="bg"); title = s.text(450, 52, "The other side of zero", 38, "#1E3FAE", name="title")
    zx, gap, ly = 450, 72, 300
    axis = s.line(40, ly, 860, ly, "#16253F", 6, name="axis")
    ticks, labs = {}, {}
    for v in range(-5, 6):
        x = zx + v * gap
        ticks[v] = s.line(x, ly - 14, x, ly + 14, "#16253F", 4)
        labs[v] = s.text(x, ly + 52, str(v) if v >= 0 else f"−{abs(v)}", 30, "#17785A" if v > 0 else "#D9531E" if v < 0 else "#1E3FAE", name=f"n{v + 5}")
    zero = s.circle(zx, ly, 15, "#FFD166", "#F4A300", 4, name="zero")
    right = s.arrow(zx, 200, zx + 3 * gap, 200, "#17785A", 8) if hasattr(s, "arrow") else s.add({"kind": "arrow", "x1": zx, "y1": 200, "x2": zx + 3 * gap, "y2": 200, "stroke": "#17785A", "width": 8}, "right")
    left = s.add({"kind": "arrow", "x1": zx, "y1": 200, "x2": zx - 2 * gap, "y2": 200, "stroke": "#D9531E", "width": 8}, "left")
    pl = s.text(zx + 1.5 * gap, 160, "+3", 40, "#17785A", name="pl"); mi = s.text(zx - gap, 160, "−2", 40, "#D9531E", name="mi")
    pos = s.text(zx + 3 * gap, 415, "Positive numbers", 28, "#17785A", name="pos"); neg = s.text(zx - 3 * gap, 415, "Negative numbers", 28, "#D9531E", name="neg")
    steps = [
     {"id": "ng-intro", "section": "Picture it", "narration": T("Here is a number line. Zero is in the middle. Numbers to the right of zero are bigger and numbers to the left are smaller.", "இது ஒரு எண் கோடு. நடுவுல பூஜ்யம் இருக்கு. பூஜ்யத்துக்கு வலப்பக்கம் இருக்கிற எண்கள் பெரியவை. இடப்பக்கம் இருக்கிறவை சின்னவை."),
      "actions": [act("clear", at=0), act("show", bg, at=0.01, ms=200), act("write", "title", on="number line", ms=700), act("draw", axis, on="number line", ms=900), act("show", zero, on="Zero is in the middle", ms=500)] + [act("show", ticks[v], at=0.25 + 0.03 * (v + 5), ms=250) for v in range(-5, 6)] + [act("write", labs[v], at=0.3 + 0.03 * (v + 5), ms=250) for v in range(-5, 6)]},
     {"id": "ng-pos", "section": "Picture it", "narration": T("Start at zero and jump three steps to the right. We land on plus three. Numbers on the right side are positive numbers.", "பூஜ்யத்துல இருந்து வலப்பக்கம் மூணு படி தாவுங்க. நாம போய் நிக்கிறது பிளஸ் மூணு. வலப்பக்க எண்கள் நேர் எண்கள்."),
      "actions": [act("draw", "right", on="jump three steps", ms=1100), act("write", "pl", on="plus three", ms=700), act("write", "pos", on="positive numbers", ms=800), act("pulse", labs[3], on="plus three", ms=1000, color="#17785A")]},
     {"id": "ng-neg", "section": "Picture it", "narration": T("Now start at zero and jump two steps to the left. We land on minus two. Numbers on the left side are negative numbers. They are smaller than zero.", "இப்போ பூஜ்யத்துல இருந்து இடப்பக்கம் ரெண்டு படி தாவுங்க. நாம போய் நிக்கிறது மைனஸ் ரெண்டு. இடப்பக்க எண்கள் எதிர் எண்கள். இவை பூஜ்யத்தை விடச் சின்னவை."),
      "actions": [act("draw", "left", on="two steps to the left", ms=1100), act("write", "mi", on="minus two", ms=700), act("write", "neg", on="negative numbers", ms=800), act("pulse", labs[-2], on="minus two", ms=1000, color="#D9531E")]},
     {"id": "ng-q1", "section": "Picture it", "narration": T("Question time. Which of these numbers is smaller than zero?", "கேள்வி நேரம். இதுல எந்த எண் பூஜ்யத்தை விடச் சின்னது?"),
      "actions": [act("pulse", "zero", on="Question time", ms=1200, color="#F4A300")],
      "check": Q("Which number is smaller than zero?", "பூஜ்யத்தை விடச் சின்ன எண் எது?", [("3", False, "3 is on the right of zero, so it is bigger than zero."), ("−3", True, ""), ("5", False, "5 is far to the right of zero, so it is bigger than zero.")], "Numbers to the left of zero, like −3, are smaller than zero.", "பூஜ்யத்துக்கு இடப்பக்கம் இருக்கிற −3 போன்ற எண்கள் சின்னவை.")},
     {"id": "ng-q2", "section": "Picture it", "narration": T("One more. Which is smaller, minus four or minus one?", "இன்னொண்ணு. மைனஸ் நாலு, மைனஸ் ஒண்ணு இதுல எது சின்னது?"),
      "actions": [act("pulse", labs[-4], on="minus four", ms=1200, color="#D9531E")],
      "check": Q("Which is smaller?", "எது சின்னது?", [("−1", False, "−1 is closer to zero, so it is bigger than −4."), ("−4", True, ""), ("0", False, "0 is bigger than every negative number.")], "−4 is further to the left, so it is smaller than −1.", "−4 இன்னும் இடப்பக்கம் இருக்கு, அதனால −1 ஐ விடச் சின்னது.")},
    ]
    return s.objs, steps

# ============================================================ science: states of water
def states():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#EAF6FF", name="bg"); title = s.text(450, 50, "Three states of water", 38, "#1E3FAE", name="title")
    # ice
    ice = [s.rect(70 + 70 * (i % 2) + 12 * (i // 2), 300 - 70 * (i // 2), 66, 66, "#DDF2FF", "#8EC9EE", 8, 4) for i in range(4)]
    shine = [s.line(82, 312, 96, 298, "#FFFFFF", 4), s.line(150, 312, 164, 298, "#FFFFFF", 4)]
    # water glass
    glass = s.path("M375 190 L395 400 L505 400 L525 190", None, "#16253F", 5, name="glass")
    water = s.path("M383 250 C410 238 440 262 450 250 C470 238 500 262 517 250 L506 395 L396 395 Z", "#4FA8EE", None, 3, name="water")
    drip = s.flow(100, 372, 40, 3, .8, 20, 7, "#4FA8EE", name="drip")
    pour = s.flow(450, 215, 70, 5, 1.1, 10, 7, "#2F8FE8", name="pour")
    # vapour: kettle with steam
    kettle = [s.rect(650, 290, 130, 110, "#B0BEC5", "#78909C", 14, 4), s.path("M780 330 L830 305 L835 318 L785 355", "#B0BEC5", "#78909C", 4), s.path("M660 290 C660 250 770 250 770 290", None, "#78909C", 7)]
    steam = s.flow(715, 270, 140, 6, .7, 50, 9, "#C9D9E6", name="steam", up=True)
    fire = [s.poly([(670, 440), (690, 405), (705, 438)], "#FF7043"), s.poly([(705, 438), (725, 400), (745, 440)], "#FFB300")]
    c1 = s.curved_arrow((235, 330), (300, 270), (360, 300), "#D9531E", 7); c2 = s.curved_arrow((540, 300), (600, 250), (640, 280), "#D9531E", 7)
    k1 = s.text(300, 235, "heat", 28, "#D9531E", name="k1"); k2 = s.text(600, 225, "more heat", 28, "#D9531E", name="k2")
    n1 = s.text(150, 450, "Solid", 34, "#1E3FAE", name="n1"); n2 = s.text(450, 450, "Liquid", 34, "#1E3FAE", name="n2"); n3 = s.text(715, 475, "Gas", 34, "#1E3FAE", name="n3")
    steps = [
     {"id": "st-intro", "section": "Picture it", "narration": T("Water can be found in three states. In the first picture water is ice. Ice is a solid. It keeps its shape and we can hold it in our hand.", "தண்ணீர் மூணு நிலைகள்ல இருக்கும். முதல் படத்துல தண்ணீர் ஐஸ். ஐஸ் ஒரு திடப்பொருள். அது அதோட வடிவத்தை மாத்தாது, கையால பிடிக்கலாம்."),
      "actions": [act("clear", at=0), act("show", bg, at=0.01, ms=200), act("write", "title", on="three states", ms=700)] + seq(ice, "show", "water is ice", 400) + seq(shine, "show", "water is ice", 400) + [act("write", "n1", on="Ice is a solid", ms=700)]},
     {"id": "st-melt", "section": "Picture it", "narration": T("When ice gets heat, it melts and becomes water. Water is a liquid. It has no shape of its own. It takes the shape of the glass.", "ஐஸ்க்கு சூடு கிடைச்சா உருகி தண்ணீர் ஆகும். தண்ணீர் ஒரு திரவம். அதுக்குத் தனி வடிவம் இல்ல. டம்ளரோட வடிவத்தை எடுத்துக்கும்."),
      "actions": [act("show", "drip", on="melts", ms=500), *seq(c1, "draw", "gets heat", 800), act("write", "k1", on="gets heat", ms=500), act("draw", "glass", on="Water is a liquid", ms=700), act("show", "water", on="Water is a liquid", ms=800), act("show", "pour", on="takes the shape", ms=500), act("write", "n2", on="Water is a liquid", ms=700)]},
     {"id": "st-boil", "section": "Picture it", "narration": T("If we heat water more, it boils and turns into water vapour. Water vapour is a gas. We cannot hold it, and it spreads in the air.", "தண்ணீரை இன்னும் சூடாக்கினா கொதிச்சு நீராவி ஆகும். நீராவி ஒரு வாயு. அதைப் பிடிக்க முடியாது, காத்துல பரவிடும்."),
      "actions": seq(kettle, "show", "heat water more", 500) + seq(fire, "show", "heat water more", 500) + [*seq(c2, "draw", "boils", 800), act("write", "k2", on="boils", ms=500), act("show", "steam", on="water vapour", ms=600), act("write", "n3", on="is a gas", ms=700)]},
     {"id": "st-q1", "section": "Picture it", "narration": T("Question time. What do we call ice changing into water?", "கேள்வி நேரம். ஐஸ் தண்ணீராக மாறுவதை என்ன சொல்வோம்?"),
      "actions": [act("pulse", "drip", on="Question time", ms=1200)],
      "check": Q("Ice changing into water is called…", "ஐஸ் தண்ணீராக மாறுவது…", [("Evaporation", False, "Evaporation is water changing into vapour."), ("Melting", True, ""), ("Freezing", False, "Freezing is water changing into ice, the other way round.")], "Ice becomes water when it melts.", "ஐஸ் உருகும்போது தண்ணீர் ஆகுது.")},
     {"id": "st-q2", "section": "Picture it", "narration": T("One more. Water vapour is water in which state?", "இன்னொண்ணு. நீராவி தண்ணீரோட எந்த நிலை?"),
      "actions": [act("pulse", "steam", on="One more", ms=1200)],
      "check": Q("Water vapour is water as a…", "நீராவி தண்ணீரோட…", [("Solid", False, "A solid keeps its shape, like ice."), ("Liquid", False, "A liquid flows, like the water in a glass."), ("Gas", True, "")], "Water vapour is a gas.", "நீராவி ஒரு வாயு.")},
    ]
    return s.objs, steps

# ============================================================ science: magnets
def magnets():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#FFF9EE", name="bg"); title = s.text(450, 48, "Magnets", 40, "#B71C1C", name="title")
    mag = [s.rect(300, 80, 150, 70, "#E53935", "#7F1D1D", 6, 4), s.rect(450, 80, 150, 70, "#1E88E5", "#0D47A1", 6, 4)]
    nS = [s.text(375, 128, "N", 44, "#FFFFFF", name="pN"), s.text(525, 128, "S", 44, "#FFFFFF", name="pS")]
    mid = 450
    # magnetic items (left) and non-magnetic (right), drawn as simple shapes
    nail = [s.rect(165, 300, 16, 90, "#90A4AE", "#546E7A", 4, 3), s.circle(173, 296, 14, "#90A4AE", "#546E7A", 3)]
    clip = s.path("M270 300 L270 380 C270 400 305 400 305 380 L305 320 C305 305 285 305 285 320 L285 370", None, "#78909C", 6, name="clip")
    key = [s.circle(60, 330, 26, "#B0BEC5", "#607D8B", 4), s.rect(78, 322, 90, 14, "#B0BEC5", "#607D8B", 3, 3)]
    pencil = [s.rect(520, 330, 150, 26, "#FBC02D", "#F57F17", 4, 3), s.poly([(670, 330), (700, 343), (670, 356)], "#F5D6A3", "#B8864A", 3)]
    rub = s.rect(560, 395, 80, 42, "#F48FB1", "#C2185B", 10, 3, name="rub")
    spoon = [s.circle(780, 350, 28, "#80CBC4", "#00695C", 3), s.rect(773, 375, 14, 80, "#80CBC4", "#00695C", 5, 3)]
    pullL = [s.add({"kind": "arrow", "x1": x, "y1": 290, "x2": 400 + (x - 170) * 0.15, "y2": 170, "stroke": "#17785A", "width": 5}) for x in (173, 285)]
    crossR = [s.line(x - 22, 285 - 22 + 22, x + 22, 285 + 22 + 22, "#D32F2F", 7) for x in (595, 780)] + [s.line(x + 22, 285 - 22 + 22, x - 22, 285 + 22 + 22, "#D32F2F", 7) for x in (595, 780)]
    yes = s.text(220, 455, "Magnetic: pulled by a magnet", 26, "#17785A", name="yes"); no = s.text(670, 475, "Not magnetic: not pulled", 26, "#D32F2F", name="no")
    steps = [
     {"id": "mg-intro", "section": "Picture it", "narration": T("This is a bar magnet. A magnet has two ends called poles. One end is the north pole. The other end is the south pole.", "இது ஒரு தண்டு காந்தம். காந்தத்துக்கு ரெண்டு முனைகள் இருக்கு, அதுக்குப் பேரு துருவங்கள். ஒரு முனை வடதுருவம், மற்றொண்ணு தென்துருவம்."),
      "actions": [act("clear", at=0), act("show", bg, at=0.01, ms=200), act("write", "title", on="bar magnet", ms=700)] + seq(mag, "show", "bar magnet", 500) + [act("write", "pN", on="north pole", ms=600), act("write", "pS", on="south pole", ms=600), act("pulse", mag[0], on="north pole", ms=900, color="#E53935"), act("pulse", mag[1], on="south pole", ms=900, color="#1E88E5")]},
     {"id": "mg-yes", "section": "Picture it", "narration": T("A magnet pulls things made of iron, like a nail, a paper clip or a key. These are called magnetic materials.", "காந்தம் இரும்புல செஞ்ச பொருட்களை இழுக்கும், ஆணி, காகிதக் கிளிப், சாவி மாதிரி. இவற்றை காந்தப் பொருட்கள்னு சொல்வோம்."),
      "actions": seq(nail, "show", "a nail", 500) + [act("show", "clip", on="paper clip", ms=500)] + seq(key, "show", "a key", 500) + seq(pullL, "draw", "pulls things", 900) + [act("write", "yes", on="magnetic materials", ms=800)]},
     {"id": "mg-no", "section": "Picture it", "narration": T("But a magnet does not pull a pencil, a rubber or a plastic spoon. These are non-magnetic materials.", "ஆனா பென்சில், ரப்பர், பிளாஸ்டிக் ஸ்பூனை காந்தம் இழுக்காது. இவை காந்தம் இல்லாப் பொருட்கள்."),
      "actions": seq(pencil, "show", "a pencil", 500) + [act("show", "rub", on="a rubber", ms=500)] + seq(spoon, "show", "plastic spoon", 500) + seq(crossR, "draw", "does not pull", 700) + [act("write", "no", on="non-magnetic materials", ms=800)]},
     {"id": "mg-q1", "section": "Picture it", "narration": T("Question time. Which of these will a magnet pull towards it?", "கேள்வி நேரம். இதுல எதை காந்தம் இழுக்கும்?"),
      "actions": [act("pulse", mag[0], on="Question time", ms=1200, color="#E53935")],
      "check": Q("A magnet pulls…", "காந்தம் இழுப்பது…", [("a wooden pencil", False, "Wood is not magnetic."), ("an iron nail", True, ""), ("a rubber", False, "Rubber is not magnetic.")], "Iron is a magnetic material, so a magnet pulls a nail.", "இரும்பு ஒரு காந்தப் பொருள், அதனால ஆணியை இழுக்கும்.")},
     {"id": "mg-q2", "section": "Picture it", "narration": T("One more. What happens when two north poles are brought close together?", "இன்னொண்ணு. ரெண்டு வடதுருவங்களை நெருக்கமா கொண்டு வந்தா என்ன ஆகும்?"),
      "actions": [act("pulse", mag[0], on="two north poles", ms=1200, color="#E53935")],
      "check": Q("Two north poles brought close together will…", "ரெண்டு வடதுருவங்களை நெருக்கமா வச்சா…", [("attract each other", False, "Opposite poles attract. Two same poles do not."), ("push each other away", True, ""), ("do nothing", False, "Magnets always push or pull when their poles are close.")], "Like poles push each other away.", "ஒரே துருவங்கள் ஒண்ணை ஒண்ணு தள்ளும்.")},
    ]
    return s.objs, steps

# ============================================================ science: sun, earth, moon
def space():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#0B1B3A", name="bg")
    stars = [s.circle(x, y, 2.2, "#FFFFFF") for x, y in ((60, 60), (820, 70), (140, 430), (760, 440), (420, 40), (860, 250), (30, 250), (600, 470), (300, 470))]
    sunr = s.sun(150, 250, 62)
    sunbody = sunr[-1]
    orbit = s.circle(150, 250, 330, None, "#6C8EBF", 3, name="orbit")
    earth = s.add({"kind": "solid", "shape": "sphere", "x": 480, "y": 250, "size": 110, "color": "#2F8FDE"}, "earth")
    morbit = s.circle(480, 250, 100, None, "#9AA9BF", 3, name="morbit")
    moon = s.add({"kind": "solid", "shape": "sphere", "x": 600, "y": 160, "size": 60, "color": "#C9CED6"}, "moon")
    a1 = s.curved_arrow((330, 120), (480, 60), (640, 90), "#FFD166", 6)
    t1 = s.text(150, 400, "Sun", 34, "#FFD166", name="t1"); t2 = s.text(480, 410, "Earth", 34, "#6EC6FF", name="t2"); t3 = s.text(690, 130, "Moon", 30, "#C9CED6", name="t3")
    steps = [
     {"id": "sp-intro", "section": "Picture it", "narration": T("Far out in space, the Sun is a huge, hot star. It gives us light and heat. Everything in our solar system moves around the Sun.", "விண்வெளியில் சூரியன் ஒரு பெரிய, சூடான நட்சத்திரம். அது நமக்கு ஒளியையும் வெப்பத்தையும் தருது. நம்ம சூரியக் குடும்பத்துல எல்லாமே சூரியனைச் சுத்தி வருது."),
      "actions": [act("clear", at=0), act("show", bg, at=0.01, ms=200)] + seq(stars, "show", "Far out in space", 400) + seq(sunr, "show", "huge, hot star", 600) + [act("write", "t1", on="the Sun", ms=600)]},
     {"id": "sp-earth", "section": "Picture it", "narration": T("The Earth is our home. It goes around the Sun in a path called an orbit. One trip around the Sun takes one year.", "பூமி நம்ம வீடு. அது சூரியனைச் சுத்தி ஒரு பாதையில வருது, அதுக்குப் பேரு சுற்றுப்பாதை. சூரியனை ஒரு தடவை சுத்த ஒரு வருஷம் ஆகும்."),
      "actions": [act("draw", "orbit", on="orbit", ms=1500), act("show", "earth", on="Earth is our home", ms=700), act("spin", "earth", on="goes around", rate=30), act("write", "t2", on="our home", ms=600), *seq(a1, "draw", "one year", 900)]},
     {"id": "sp-moon", "section": "Picture it", "narration": T("The Moon goes around the Earth. The Moon does not make its own light. It shines because the Sun's light falls on it.", "நிலா பூமியைச் சுத்தி வருது. நிலா சொந்தமா ஒளி தராது. சூரிய ஒளி அதுமேல விழறதால தான் மின்னுது."),
      "actions": [act("draw", "morbit", on="goes around the Earth", ms=1300), act("show", "moon", on="The Moon", ms=600), act("write", "t3", on="The Moon", ms=600), act("pulse", "sunbody_placeholder", on="Sun's light", ms=900, color="#FFD166")]},
     {"id": "sp-q1", "section": "Picture it", "narration": T("Question time. What does the Earth go around?", "கேள்வி நேரம். பூமி எதைச் சுத்தி வருது?"),
      "actions": [act("pulse", "orbit", on="Question time", ms=1200, color="#FFD166")],
      "check": Q("The Earth goes around…", "பூமி சுத்துவது…", [("the Moon", False, "The Moon goes around the Earth, not the other way."), ("the Sun", True, ""), ("a star far away", False, "The Earth stays with the Sun, which is our nearest star.")], "The Earth goes around the Sun in one year.", "பூமி ஒரு வருஷத்துல சூரியனைச் சுத்துது.")},
     {"id": "sp-q2", "section": "Picture it", "narration": T("One more. Which one goes around the Earth?", "இன்னொண்ணு. பூமியைச் சுத்தி வருவது எது?"),
      "actions": [act("pulse", "moon", on="One more", ms=1200, color="#C9CED6")],
      "check": Q("Which one goes around the Earth?", "பூமியைச் சுத்தி வருவது எது?", [("The Sun", False, "The Earth goes around the Sun."), ("The Moon", True, ""), ("A cloud", False, "Clouds float in our air. They do not orbit the Earth.")], "The Moon goes around the Earth.", "நிலா பூமியைச் சுத்தி வருது.")},
    ]
    for st in steps:
        for a in st["actions"]:
            if a.get("target") == "sunbody_placeholder": a["target"] = sunbody
    return s.objs, steps

# ============================================================ social: locating places on earth
def globe():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#EAF4FF", name="bg"); title = s.text(450, 46, "Locating places on the Earth", 36, "#1E3FAE", name="title")
    cx, cy, r = 450, 270, 190
    ball = s.circle(cx, cy, r, "#8EC9EE", "#1E3FAE", 5, name="ball")
    land = [s.path("M360 180 C390 150 440 170 430 210 C420 250 380 250 360 230 Z", "#6DBE6A", None, 3), s.path("M470 290 C510 260 560 290 540 340 C520 380 480 370 470 330 Z", "#6DBE6A", None, 3)]
    eq = s.line(cx - r, cy, cx + r, cy, "#D9531E", 6, name="eq")
    lats = [s.line(cx - 160, cy - 95, cx + 160, cy - 95, "#7B4DD6", 4), s.line(cx - 160, cy + 95, cx + 160, cy + 95, "#7B4DD6", 4)]
    longs = [s.path(f"M{cx} {cy - r} C{cx + d} {cy - 100} {cx + d} {cy + 100} {cx} {cy + r}", None, "#17785A", 4) for d in (-110, 0, 110)]
    pm = s.path(f"M{cx} {cy - r} L{cx} {cy + r}", None, "#17785A", 6, name="pm")
    pt = s.circle(570, 215, 11, "#E53935", "#7F1D1D", 3, name="pt")
    l1 = s.text(cx + 250, cy + 8, "Equator 0°", 28, "#D9531E", name="l1"); l2 = s.text(cx + 250, cy - 95, "Parallels of latitude", 24, "#7B4DD6", name="l2"); l3 = s.text(cx - 250, cy - 130, "Meridians of longitude", 24, "#17785A", name="l3")
    steps = [
     {"id": "gl-intro", "section": "Picture it", "narration": T("This is a globe, a small model of the Earth. To find any place on it, we draw imaginary lines. These lines make a net of squares over the globe.", "இது ஒரு உருண்டை, பூமியோட சின்ன மாதிரி. இதுல எந்த இடத்தையும் கண்டுபிடிக்க கற்பனைக் கோடுகளை வரைவோம். இந்தக் கோடுகள் உருண்டை மேல ஒரு வலை மாதிரி அமையும்."),
      "actions": [act("clear", at=0), act("show", bg, at=0.01, ms=200), act("write", "title", on="a globe", ms=700), act("show", ball, on="a globe", ms=800)] + seq(land, "show", "small model", 500)},
     {"id": "gl-eq", "section": "Picture it", "narration": T("The line around the middle of the Earth is the Equator. It divides the Earth into two equal halves. Its value is zero degrees.", "பூமியோட நடுவுல சுத்தி வர்ற கோடு நிலநடுக்கோடு. அது பூமியை ரெண்டு சம பாதியா பிரிக்குது. அதோட மதிப்பு பூஜ்ய டிகிரி."),
      "actions": [act("draw", eq, on="middle of the Earth", ms=1100), act("write", "l1", on="Equator", ms=700), act("pulse", eq, on="zero degrees", ms=900, color="#D9531E")]},
     {"id": "gl-lat", "section": "Picture it", "narration": T("Lines parallel to the Equator are called parallels of latitude. They tell us how far a place is north or south of the Equator.", "நிலநடுக்கோட்டுக்கு இணையா இருக்கிற கோடுகள் அட்சக்கோடுகள். ஒரு இடம் நிலநடுக்கோட்டுக்கு வடக்கா தெற்கான்னு எவ்வளவு தூரம்னு அவை சொல்லும்."),
      "actions": seq(lats, "draw", "parallel to the Equator", 900) + [act("write", "l2", on="parallels of latitude", ms=800)]},
     {"id": "gl-long", "section": "Picture it", "narration": T("Lines that run from the North Pole to the South Pole are called meridians of longitude. The Prime Meridian is the line of zero degrees longitude. It tells us how far a place is east or west.", "வடதுருவத்துல இருந்து தென்துருவம் வரை போற கோடுகள் தீர்க்கக்கோடுகள். முதன்மைத் தீர்க்கக்கோடு பூஜ்ய டிகிரி. ஒரு இடம் கிழக்கா மேற்கான்னு அது சொல்லும்."),
      "actions": seq(longs, "draw", "North Pole to the South Pole", 700) + [act("draw", "pm", on="Prime Meridian", ms=900), act("write", "l3", on="meridians of longitude", ms=800), act("show", "pt", on="how far a place", ms=600), act("pulse", "pt", on="east or west", ms=1000, color="#E53935")]},
     {"id": "gl-q1", "section": "Picture it", "narration": T("Question time. Which line divides the Earth into two equal halves?", "கேள்வி நேரம். பூமியை ரெண்டு சம பாதியாப் பிரிக்கிற கோடு எது?"),
      "actions": [act("pulse", eq, on="Question time", ms=1200, color="#D9531E")],
      "check": Q("The line that divides the Earth into two equal halves is the…", "பூமியை ரெண்டு சம பாதியாப் பிரிக்கும் கோடு…", [("Prime Meridian", False, "The Prime Meridian runs from pole to pole, dividing the Earth into east and west."), ("Equator", True, ""), ("a meridian of longitude", False, "Meridians run from pole to pole.")], "The Equator divides the Earth into the Northern and Southern Hemispheres.", "நிலநடுக்கோடு பூமியை வடக்கு, தெற்கு அரைக்கோளங்களா பிரிக்கும்.")},
     {"id": "gl-q2", "section": "Picture it", "narration": T("One more. Lines of latitude tell us how far a place is in which directions?", "இன்னொண்ணு. அட்சக்கோடுகள் ஒரு இடம் எந்தத் திசையில எவ்வளவு தூரம்னு சொல்லும்?"),
      "actions": [act("pulse", lats[0], on="One more", ms=1200, color="#7B4DD6")],
      "check": Q("Latitude tells us how far a place is…", "அட்சக்கோடு சொல்வது…", [("east or west of the Prime Meridian", False, "That is longitude."), ("north or south of the Equator", True, ""), ("above the sea", False, "That is height above sea level, not latitude.")], "Latitude measures distance north or south of the Equator.", "அட்சக்கோடு நிலநடுக்கோட்டுக்கு வடக்கா தெற்கா தூரத்தை அளக்கும்.")},
    ]
    return s.objs, steps

o, st = angles(); write("lines-and-angles", "types-of-angles", "Types of angles", "கோணங்களின் வகைகள்", "maths", o, st, cls=6)
o, st = fractions(); write("fractions", "parts-of-a-whole", "Fractions: parts of a whole", "பின்னங்கள்: முழுசின் பகுதிகள்", "maths", o, st, cls=6)
o, st = integers(); write("the-other-side-of-zero", "numbers-on-a-number-line", "Numbers on a number line", "எண் கோட்டில் எண்கள்", "maths", o, st, cls=6)
o, st = states(); write("a-journey-through-states-of-water", "ice-water-and-vapour", "Ice, water and vapour", "ஐஸ், தண்ணீர், நீராவி", "science", o, st, cls=6)
o, st = magnets(); write("exploring-magnets", "magnetic-and-non-magnetic", "Magnetic and non-magnetic things", "காந்தம் மற்றும் காந்தமில்லாப் பொருட்கள்", "science", o, st, cls=6)
o, st = space(); write("beyond-earth", "sun-earth-and-moon", "The Sun, the Earth and the Moon", "சூரியன், பூமி, நிலா", "science", o, st, cls=6)
o, st = globe(); write("locating-places-on-the-earth", "latitudes-and-longitudes", "Latitudes and longitudes", "அட்சக்கோடுகள், தீர்க்கக்கோடுகள்", "social-science", o, st, cls=6)
