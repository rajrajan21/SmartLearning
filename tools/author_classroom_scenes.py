"""Scene kit: builds friendly picture scenes (sky, sun, clouds, hills, sea, rain, arrows, label boxes) from code and
writes picture-style classroom lessons. Run:  python tools/author_classroom_scenes.py
Everything is vector data on the 900x500 board - no image files, no outside service."""
import json, math, os
OUT = os.path.join(os.path.dirname(__file__), "..", "content", "classroom")
def T(en, ta=None): return {"en": en, **({"ta": ta} if ta else {})}
def act(do, target=None, **k): return {"do": do, **({"target": target} if target else {}), **k}

# ----------------------------------------------------------------------------- the kit
class Scene:
    def __init__(s): s.objs = []; s.n = 0
    def add(s, o, name=None):
        s.n += 1; o["id"] = name or f"o{s.n}"; s.objs.append(o); return o["id"]
    def poly(s, pts, fill, stroke=None, w=3, name=None): return s.add({"kind": "poly", "points": [[round(x, 1), round(y, 1)] for x, y in pts], "fill": fill, **({"stroke": stroke, "width": w} if stroke else {})}, name)
    def circle(s, cx, cy, r, fill, stroke=None, w=3, name=None): return s.add({"kind": "circle", "cx": cx, "cy": cy, "r": r, "fill": fill, **({"stroke": stroke, "width": w} if stroke else {})}, name)
    def path(s, d, fill=None, stroke=None, w=4, name=None): return s.add({"kind": "path", "d": d, **({"fill": fill} if fill else {}), **({"stroke": stroke, "width": w} if stroke else {})}, name)
    def rect(s, x, y, w, h, fill, stroke=None, rx=0, sw=3, name=None): return s.add({"kind": "rect", "x": x, "y": y, "w": w, "h": h, "rx": rx, "fill": fill, **({"stroke": stroke, "width": sw} if stroke else {})}, name)
    def text(s, x, y, t, size=26, color="ink", anchor="middle", name=None): return s.add({"kind": "text", "x": x, "y": y, "text": t, "size": size, "color": color, "anchor": anchor}, name)
    def line(s, x1, y1, x2, y2, color="#3A4A5C", w=3, name=None): return s.add({"kind": "line", "x1": x1, "y1": y1, "x2": x2, "y2": y2, "stroke": color, "width": w}, name)
    def sector(s, cx, cy, r, a0, a1, fill, stroke="#FFFFFF", w=4, name=None): return s.add({"kind": "sector", "cx": cx, "cy": cy, "r": r, "from": a0, "to": a1, "fill": fill, "stroke": stroke, "width": w}, name)
    def leaf(s, x, y, dx, dy, fill="#43A047"): return s.path(f"M{x} {y} C{x + dx * .3} {y - dy} {x + dx * .8} {y - dy} {x + dx} {y - dy * .1} C{x + dx * .8} {y + dy * .5} {x + dx * .3} {y + dy * .5} {x} {y} Z", fill, "#2E7D32", 3)
    def flower(s, cx, cy, r, petal="#F06292"):
        ids = [s.circle(cx + math.cos(a) * r * 1.25, cy + math.sin(a) * r * 1.25, r * .8, petal, "#C2185B", 2) for a in [i * math.pi / 3 for i in range(6)]]
        ids.append(s.circle(cx, cy, r * .75, "#FFD54F", "#F9A825", 3)); return ids
    # --- pieces
    def sun(s, cx, cy, r, tag="sun"):
        ids = [s.poly([(cx + math.cos(a) * r * 1.15, cy + math.sin(a) * r * 1.15), (cx + math.cos(a + .13) * r * 1.75, cy + math.sin(a + .13) * r * 1.75), (cx + math.cos(a + .26) * r * 1.15, cy + math.sin(a + .26) * r * 1.15)], "#FFC83D") for a in [i * math.pi / 6 for i in range(12)]]
        ids.append(s.circle(cx, cy, r, "#FFD93B", "#F4A300", 4)); return ids
    def cloud(s, cx, cy, k=1.0, fill="#FFFFFF", edge="#BCD8EE"):
        parts = [(-46, 10, 30), (-16, -8, 38), (24, -4, 34), (52, 12, 26), (4, 14, 34)]
        return [s.circle(cx + x * k, cy + y * k, r * k, fill, edge, 2) for x, y, r in parts]
    def hill(s, x0, x1, top, base, fill, bump=0.5):
        mid = (x0 + x1) / 2; return s.path(f"M{x0} {base} C{x0 + (mid - x0) * bump:.0f} {top} {mid + (x1 - mid) * (1 - bump):.0f} {top} {x1} {base} Z", fill)
    def mountain(s, cx, base, h, w):
        a = s.poly([(cx - w, base), (cx, base - h), (cx + w, base)], "#7C8A9A", "#5F6B7A", 3)
        b = s.poly([(cx - w * .26, base - h * .74), (cx, base - h), (cx + w * .26, base - h * .74), (cx + w * .1, base - h * .68), (cx - w * .05, base - h * .76)], "#FFFFFF"); return [a, b]
    def tree(s, x, y, k=1.0):
        return [s.rect(x - 4 * k, y, 8 * k, 20 * k, "#8B5A2B"), s.poly([(x - 22 * k, y + 6 * k), (x, y - 36 * k), (x + 22 * k, y + 6 * k)], "#2E9E4F")]
    def drops(s, x0, y0, x1, y1, cols, rows):
        d = []
        for r in range(rows):
            for c in range(cols):
                x = x0 + (x1 - x0) * (c + (r % 2) * .5) / cols; y = y0 + (y1 - y0) * r / max(1, rows - 1)
                d.append(f"M{x:.0f} {y:.0f} L{x - 5:.0f} {y + 14:.0f}")
        return [s.path(" ".join(d), None, "#2F8FE8", 5)]
    def flow(s, x, y, ln, count=7, speed=.9, spread=0, size=7, color="#2F8FE8", name=None): return s.add({"kind": "flow", "x": x, "y": y, "len": ln, "count": count, "speed": speed, "spread": spread, "size": size, "color": color}, name)
    def curved_arrow(s, p0, p1, p2, color="#1E3FAE", w=8):
        (x0, y0), (cx, cy), (x1, y1) = p0, p1, p2
        a = math.atan2(y1 - cy, x1 - cx)
        line = s.path(f"M{x0} {y0} Q{cx} {cy} {x1} {y1}", None, color, w)
        head = s.poly([(x1 + math.cos(a) * 18, y1 + math.sin(a) * 18), (x1 + math.cos(a + 2.5) * 20, y1 + math.sin(a + 2.5) * 20), (x1 + math.cos(a - 2.5) * 20, y1 + math.sin(a - 2.5) * 20)], color)
        return [line, head]
    def label(s, x, y, w, title, sub, fill, edge):
        b = s.rect(x, y, w, 74, fill, edge, 16, 4)
        t = s.text(x + w / 2, y + 30, title, 27, "ink"); u = s.text(x + w / 2, y + 56, sub, 19, "soft")
        return [b, t, u]

# ----------------------------------------------------------------------------- the water cycle
def water_cycle():
    s = Scene()
    sky = s.rect(0, 0, 900, 500, "#BFE6FF", name="sky")
    sun = s.sun(105, 95, 46)
    far = s.hill(120, 560, 255, 400, "#8CCB6A", .45); near = s.hill(380, 900, 300, 430, "#5DB04B", .4)
    mtn = s.mountain(740, 410, 190, 150)
    trees = s.tree(300, 360) + s.tree(335, 372, .8) + s.tree(560, 340, .9) + s.tree(842, 392, .8)
    river = s.path("M722 300 C700 340 735 360 700 400 C680 425 640 430 600 445", None, "#4FA8EE", 12, name="river")
    sea = s.path("M0 392 C70 372 130 412 200 392 C270 372 330 412 400 392 C470 372 540 412 610 396 L700 500 L0 500 Z", "#2F8FDE", name="sea")
    foam = s.path("M20 430 C60 420 90 440 130 430 M220 450 C260 440 290 460 330 450", None, "#CFE9FF", 4, name="foam")
    base = [sky] + [far, near] + mtn + trees + [river, sea, foam]
    up = [s.path(f"M{x} 360 C{x - 16} 335 {x + 16} 315 {x} 285", None, "#3C8CE8", 7) for x in (70, 125, 180)]
    upheads = [s.poly([(x, 270), (x - 11, 292), (x + 11, 292)], "#3C8CE8") for x in (70, 125, 180)]
    vapour = up + upheads
    cloud = s.cloud(440, 140, 1.3)
    c2 = s.curved_arrow((195, 195), (240, 150), (350, 140))
    rain = s.cloud(715, 135, 1.35, "#6B7685", "#4C5561")
    c3 = s.curved_arrow((540, 135), (595, 120), (635, 160))
    drops = [s.flow(655, 195, 120, 5, .8, 15, 8, "#2F8FE8"), s.flow(700, 200, 110, 5, 1.0, 15, 8, "#2F8FE8"), s.flow(745, 195, 120, 5, .9, 15, 8, "#2F8FE8")]
    # tap at home (animated flowing water)
    twall = s.rect(0, 0, 900, 500, "#E6F0F7", name="twall"); ttile = s.rect(0, 380, 900, 120, "#CFDDE8", name="ttile")
    tbasin = s.path("M250 400 L650 400 L610 480 L290 480 Z", "#FFFFFF", "#9BB0C4", 5, name="tbasin")
    tpipe = s.rect(430, 90, 40, 120, "#B0BEC5", "#78909C", 6, 4, name="tpipe"); tspout = s.path("M450 90 L450 70 L560 70 L560 130 L535 130 L535 95 L470 95 Z", "#B0BEC5", "#78909C", 4, name="tspout")
    thandle = s.rect(405, 52, 90, 16, "#E53935", "#B71C1C", 6, 3, name="thandle")
    tflow = s.flow(547, 135, 255, 9, 1.4, 10, 9, "#2F8FE8", name="tflow"); tdrip = s.flow(547, 140, 150, 1, .35, 0, 8, "#2F8FE8", name="tdrip")
    tpool = s.path("M300 470 C380 450 520 450 600 470 Z", "#6EC6FF", None, 3, name="tpool")
    ttitle = s.text(450, 36, "Water from a tap", 34, "#1E3FAE", name="ttitle"); tsave = s.text(450, 450, "Close the tap. Save every drop!", 32, "#17785A", name="tsave")
    ttick = s.circle(760, 120, 44, "#43A047", "#2E7D32", 4, name="ttick"); ttick2 = s.path("M738 120 L755 140 L788 98", None, "#FFFFFF", 10, name="ttick2")
    c4 = s.curved_arrow((650, 440), (610, 470), (520, 460))
    c5 = s.curved_arrow((420, 470), (320, 478), (240, 440))
    b1 = s.label(20, 175, 200, "1. Evaporation", "Sun heats water", "#FFF1D6", "#F2A93B")
    b2 = s.label(335, 205, 205, "2. Condensation", "Vapour makes clouds", "#E3F3FF", "#4AA3E8")
    b3 = s.label(668, 8, 215, "3. Precipitation", "Rain, snow or hail", "#EFE2FF", "#9B6BE0")
    b4 = s.label(655, 400, 235, "4. Collection", "Water gathers again", "#E3F8DD", "#4DB04A")
    b5 = s.label(250, 405, 235, "5. It starts again!", "The cycle continues", "#FFE3EE", "#E0608F")
    title = s.text(420, 42, "The Water Cycle", 38, "#1E3FAE", name="title")
    sub = s.text(420, 72, "Same water. A never-ending journey!", 21, "#1E3FAE", name="subt")
    obj = s.objs
    A = lambda ids, do, on, ms=700, **k: [act(do, i, on=on, ms=ms, **k) for i in ids]
    steps = [
      {"id": "wc-intro", "section": "Picture it", "narration": T("Look at this big picture. It shows how water travels around our Earth, again and again. Let us follow the water on its journey.", "இந்தப் பெரிய படத்தைப் பாருங்க. தண்ணீர் நம்ம பூமியைச் சுத்தி திரும்பத் திரும்ப எப்படிப் பயணம் பண்ணுதுன்னு இது காட்டுது. வாங்க, தண்ணீரோட பயணத்தைப் பின்தொடரலாம்."),
       "actions": [act("clear", at=0)] + [act("show", i, at=0.02, ms=300) for i in base] + [act("write", "title", on="big picture", ms=800), act("write", "subt", on="again and again", ms=800)]},
      {"id": "wc-evap", "section": "Picture it", "narration": T("The sun shines on the sea, the rivers and the lakes. The warm water slowly rises into the air as invisible water vapour. This is called evaporation.", "சூரியன் கடல், ஆறு, ஏரி மேல ஒளி வீசுது. சூடான தண்ணீர் மெதுவா கண்ணுக்குத் தெரியாத நீராவியா மேல போகுது. இதுக்குப் பேரு ஆவியாதல்."),
       "actions": A(sun, "show", "The sun", 500) + A(vapour, "draw", "rises into the air", 1200) + A(b1, "show", "called evaporation", 500)},
      {"id": "wc-cond", "section": "Picture it", "narration": T("High up in the sky, the air is cold. The vapour cools down and turns into tiny water drops. Many tiny drops together make a cloud. This is called condensation.", "வானத்துல உயரமா காத்து குளிர்ச்சியா இருக்கும். நீராவி குளிர்ந்து சின்னச் சின்ன நீர்த்துளிகளா மாறுது. நிறைய துளிகள் சேர்ந்து மேகம் ஆகுது. இதுக்குப் பேரு குளிர்ந்து திரவமாதல்."),
       "actions": A(c2, "draw", "High up in the sky", 900) + A(cloud, "show", "make a cloud", 700) + A(b2, "show", "called condensation", 500)},
      {"id": "wc-rain", "section": "Picture it", "narration": T("When the cloud gets heavy, the water drops fall down as rain. In very cold places they fall as snow or hail. This is called precipitation.", "மேகம் கனமாகும்போது நீர்த்துளிகள் மழையா கீழ விழுது. ரொம்பக் குளிரான இடங்கள்ல பனியாவோ ஆலங்கட்டியாவோ விழும். இதுக்குப் பேரு மழைப்பொழிவு."),
       "actions": A(c3, "draw", "When the cloud gets heavy", 700) + A(rain, "show", "When the cloud gets heavy", 600) + A(drops, "show", "fall down as rain", 900) + A(b3, "show", "called precipitation", 500)},
      {"id": "wc-collect", "section": "Picture it", "narration": T("The rain runs down the mountain into rivers and then into the sea. Some water also soaks into the ground. This is called collection.", "மழைத்தண்ணீர் மலையிலிருந்து ஆறுகள்ல ஓடி கடல்ல போய்ச் சேருது. கொஞ்சம் தண்ணீர் மண்ணுக்குள்ளயும் போகுது. இதுக்குப் பேரு சேகரிப்பு."),
       "actions": [act("pulse", "river", on="runs down the mountain", ms=1500, color="#1E5FD0")] + A(c4, "draw", "into the sea", 900) + A(b4, "show", "called collection", 500)},
      {"id": "wc-again", "section": "Picture it", "narration": T("Then the sun warms the water again, and the journey starts over. That is why we call it the water cycle.", "அப்புறம் சூரியன் திரும்பத் தண்ணீரைச் சூடாக்குது, பயணம் மறுபடி தொடங்குது. அதனாலதான் இதை நீர்ச்சுழற்சின்னு சொல்றோம்."),
       "actions": A(c5, "draw", "journey starts over", 900) + A(b5, "show", "journey starts over", 600) + [act("pulse", "sea", on="water cycle", ms=1400, color="#1E5FD0")]},
      {"id": "wc-q1", "section": "Picture it", "narration": T("Now a question. What makes the water rise up into the air?", "இப்போ ஒரு கேள்வி. தண்ணீரை மேல காத்துல எழுப்புறது எது?"),
       "actions": [act("pulse", ids, on="What makes", ms=1200) for ids in sun[-1:]],
       "check": {"stem": T("What makes the water rise up into the air?", "தண்ணீரை மேல எழுப்புறது எது?"), "explanation": T("The sun heats the water, and it rises as vapour.", "சூரியன் தண்ணீரைச் சூடாக்குது, அது நீராவியா மேல போகுது."),
         "options": [{"id": "a", "text": T("The Moon"), "whyWrong": T("The Moon does not give enough heat to lift water.")}, {"id": "b", "text": T("The Sun"), "correct": True}, {"id": "c", "text": T("The wind"), "whyWrong": T("Wind moves clouds, but the sun's heat lifts the water.")}]}},
      {"id": "wc-q2", "section": "Picture it", "narration": T("One more. What falls from the clouds?", "இன்னொண்ணு. மேகத்திலிருந்து என்ன விழுது?"),
       "actions": [act("pulse", rain[0], on="What falls", ms=1200)],
       "check": {"stem": T("What falls from the clouds?", "மேகத்திலிருந்து என்ன விழுது?"), "explanation": T("Rain, snow and hail all fall from clouds.", "மழை, பனி, ஆலங்கட்டி எல்லாமே மேகத்திலிருந்து விழும்."),
         "options": [{"id": "a", "text": T("Only snow"), "whyWrong": T("Snow is one kind, but rain falls too.")}, {"id": "b", "text": T("Only rain"), "whyWrong": T("Rain is one kind, but snow and hail fall too.")}, {"id": "c", "text": T("Rain, snow or hail"), "correct": True}]}},
    ]

    tap = [twall, ttile, tbasin, tpipe, tspout, thandle]
    steps += [
      {"id": "wc-tap1", "section": "Save water", "narration": T("Now look at a tap at home. When the tap is open, clean water keeps flowing out. If we leave it open while we brush our teeth, a lot of water is wasted.", "இப்போ வீட்டுல இருக்கிற ஒரு குழாயைப் பாருங்க. குழாயைத் திறந்தா சுத்தமான தண்ணீர் ஓடிக்கிட்டே இருக்கும். பல் தேய்க்கும்போது திறந்து விட்டா நிறைய தண்ணீர் வீணாகும்."),
       "actions": [act("clear", at=0)] + [act("show", i, at=0.02, ms=300) for i in tap] + [act("write", "ttitle", on="tap at home", ms=800), act("show", "tpool", on="clean water", ms=600), act("show", "tflow", on="keeps flowing", ms=500), act("pulse", "thandle", on="open", ms=1200, color="#E53935")]},
      {"id": "wc-tap2", "section": "Save water", "narration": T("Turn the tap off when you are not using it. Even one slow drip, drip, drip wastes water all day. Close the tap. Save every drop!", "பயன்படுத்தாதப்போ குழாயை மூடுங்க. மெதுவா சொட்டுச் சொட்டா விழுந்தாலும் நாள் முழுக்க தண்ணீர் வீணாகும். குழாயை மூடுங்க. ஒவ்வொரு துளியையும் சேமிங்க!"),
       "actions": [act("hide", "tflow", on="Turn the tap off", ms=500), act("show", "tdrip", on="drip, drip", ms=500), act("show", "ttick", on="Close the tap", ms=500), act("draw", "ttick2", on="Close the tap", ms=700), act("write", "tsave", on="Save every drop", ms=1000)]},
      {"id": "wc-q3", "section": "Save water", "narration": T("Question time. What should we do with a tap we are not using?", "கேள்வி நேரம். பயன்படுத்தாத குழாயை என்ன செய்யணும்?"),
       "actions": [act("pulse", "thandle", on="Question time", ms=1200, color="#E53935")],
       "check": {"stem": T("What should we do with a tap we are not using?", "பயன்படுத்தாத குழாயை என்ன செய்யணும்?"), "explanation": T("Close it, so that no water is wasted.", "மூடிடணும், அப்போ தண்ணீர் வீணாகாது."),
         "options": [{"id": "a", "text": T("Leave it open"), "whyWrong": T("An open tap keeps wasting clean water.")}, {"id": "b", "text": T("Close it properly"), "correct": True}, {"id": "c", "text": T("Open it a little more"), "whyWrong": T("Opening it more wastes even more water.")}]}},
    ]
    obj = s.objs
    return obj, steps


def write(chapter, topic, title, ta, subject, obj, steps, cls=3):
    d = {"board": "CBSE", "classLevel": cls, "subject": subject, "chapter": chapter, "topic": topic, "status": "published", "title": T(title, ta), "objects": obj, "steps": steps}
    with open(os.path.join(OUT, f"cbse-{cls}-{subject}-{chapter}-{topic}.json"), "w", encoding="utf8") as f: json.dump(d, f, ensure_ascii=False, indent=1)
    print(topic, len(obj), "objects", len(steps), "steps")
def Q(stem_en, stem_ta, opts, expl_en, expl_ta=None):
    return {"stem": T(stem_en, stem_ta), "explanation": T(expl_en, expl_ta), "options": [{"id": "abc"[i], "text": T(t), **({"correct": True} if ok else {"whyWrong": T(w)})} for i, (t, ok, w) in enumerate(opts)]}
A = lambda ids, do, on, ms=700, **k: [act(do, i, on=on, ms=ms, **k) for i in ids]

# ----------------------------------------------------------------------------- parts of a plant
def plant():
    s = Scene()
    sky = s.rect(0, 0, 900, 500, "#EAF6FF", name="sky"); sunv = s.sun(80, 80, 34)
    ground = s.rect(0, 335, 900, 165, "#B98A5A", name="ground"); top = s.rect(0, 335, 900, 22, "#8D6238", name="topsoil")
    roots = [s.path("M330 352 C320 400 290 420 250 450", None, "#7A4B22", 7), s.path("M330 352 C335 410 345 440 350 480", None, "#7A4B22", 7), s.path("M330 352 C350 395 400 415 440 440", None, "#7A4B22", 7), s.path("M320 380 C290 385 260 380 235 385", None, "#7A4B22", 5)]
    water = [s.circle(x, y, 7, "#4FA8EE") for x, y in ((235, 430), (460, 455), (270, 470))]
    stem = s.rect(322, 160, 16, 190, "#4CAF50", "#2E7D32", 6, 3, name="stem")
    leaves = [s.leaf(322, 260, -110, 50), s.leaf(338, 225, 110, 50)]
    fl = s.flower(330, 125, 20)
    def box(y, title, sub, fill, edge, tx, ty):
        b = s.label(560, y, 300, title, sub, fill, edge); l = s.line(560, y + 37, tx, ty, edge, 4); return b + [l]
    b1 = box(40, "Flower", "Makes seeds and fruit", "#FCE4EC", "#E91E63", 372, 125)
    b2 = box(130, "Leaves", "Make food from sunlight", "#E8F5E9", "#43A047", 448, 225)
    b3 = box(220, "Stem", "Carries water up", "#F1F8E9", "#7CB342", 340, 260)
    b4 = box(380, "Roots", "Drink water from soil", "#FFF3E0", "#EF6C00", 400, 420)
    title = s.text(330, 38, "A plant has parts", 34, "#1E3FAE", name="title")
    base = [sky, ground, top] + sunv + [stem] + roots
    steps = [
     {"id": "pl-intro", "section": "Picture it", "narration": T("Here is a plant growing in the soil. Every part of a plant has its own special job. Let us meet the parts one by one.", "மண்ணுல வளருற ஒரு செடி இங்க இருக்கு. செடியோட ஒவ்வொரு பகுதிக்கும் ஒரு தனி வேலை இருக்கு. ஒவ்வொண்ணாப் பார்க்கலாம் வாங்க."),
      "actions": [act("clear", at=0)] + [act("show", i, at=0.02, ms=300) for i in base] + [act("write", "title", on="special job", ms=700)]},
     {"id": "pl-roots", "section": "Picture it", "narration": T("Under the ground are the roots. The roots hold the plant tightly in the soil. They also drink water from the soil.", "மண்ணுக்கு அடியில வேர்கள் இருக்கு. வேர்கள் செடியை மண்ணுல இறுக்கமாப் பிடிச்சுக்குது. மண்ணுல இருந்து தண்ணீரையும் குடிக்குது."),
      "actions": A(roots, "draw", "Under the ground", 900) + A(water, "show", "drink water", 500) + A(b4, "show", "hold the plant", 500)},
     {"id": "pl-stem", "section": "Picture it", "narration": T("The stem stands tall above the ground. It carries the water from the roots up to every part of the plant.", "தண்டு தரைக்கு மேல உயரமா நிக்குது. வேர்கள் குடிச்ச தண்ணீரைச் செடியோட எல்லாப் பகுதிக்கும் மேல கொண்டு போகுது."),
      "actions": [act("pulse", "stem", on="stands tall", ms=1200, color="#2E7D32")] + A(b3, "show", "carries the water", 500)},
     {"id": "pl-leaves", "section": "Picture it", "narration": T("The green leaves catch sunlight. With sunlight, air and water, the leaves make food for the plant.", "பச்சை இலைகள் சூரிய ஒளியைப் பிடிக்குது. சூரிய ஒளி, காத்து, தண்ணீர் மூலமா இலைகள் செடிக்கான உணவைத் தயாரிக்குது."),
      "actions": A(leaves, "draw", "green leaves", 900) + A(b2, "show", "make food", 500)},
     {"id": "pl-flower", "section": "Picture it", "narration": T("At the top, many plants have a flower. The flower later makes seeds and fruit. New plants grow from those seeds.", "மேல பல செடிகள்ல பூ இருக்கும். பூ பிற்பாடு விதைகளையும் பழத்தையும் உருவாக்குது. அந்த விதைகளிலிருந்து புதுச் செடிகள் வளருது."),
      "actions": A(fl, "show", "a flower", 500) + A(b1, "show", "seeds and fruit", 500)},
     {"id": "pl-q1", "section": "Picture it", "narration": T("Question time. Which part of the plant drinks water from the soil?", "கேள்வி நேரம். மண்ணுல இருந்து தண்ணீர் குடிக்கிற செடியோட பகுதி எது?"), "actions": [act("pulse", "ground", on="Which part", ms=1200, color="#EF6C00")],
      "check": Q("Which part of the plant drinks water from the soil?", "மண்ணுல இருந்து தண்ணீர் குடிக்கிற பகுதி எது?", [("The flower", False, "The flower makes seeds. It does not drink water from the soil."), ("The roots", True, ""), ("The leaves", False, "Leaves make food. Roots drink the water.")], "Roots drink water from the soil.", "வேர்கள்தான் மண்ணுல இருந்து தண்ணீர் குடிக்குது.")},
     {"id": "pl-q2", "section": "Picture it", "narration": T("One more. Which part makes food using sunlight?", "இன்னொண்ணு. சூரிய ஒளியைப் பயன்படுத்தி உணவு தயாரிக்கிற பகுதி எது?"), "actions": [act("pulse", leaves[0], on="Which part", ms=1200, color="#2E7D32")],
      "check": Q("Which part makes food using sunlight?", "சூரிய ஒளியால உணவு தயாரிக்கிற பகுதி எது?", [("The roots", False, "Roots hold the plant and drink water."), ("The stem", False, "The stem carries water up."), ("The leaves", True, "")], "Leaves make food from sunlight, air and water.", "இலைகள் சூரிய ஒளி, காத்து, தண்ணீரால உணவு தயாரிக்குது.")},
    ]
    return s.objs, steps

# ----------------------------------------------------------------------------- healthy food plate
def plate():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#FFF8EC", name="bg"); title = s.text(450, 38, "A healthy plate", 34, "#B45309", name="title")
    cx, cy, R, dx = 450, 270, 185, 150
    rim = s.circle(cx, cy, R + 14, "#FFFFFF", "#CFD8DC", 6)
    veg = s.sector(cx, cy, R, 0, 90, "#DDF3D4"); fruit = s.sector(cx, cy, R, 90, 180, "#FFD9D9"); grain = s.sector(cx, cy, R, 180, 270, "#FFE9BF"); prot = s.sector(cx, cy, R, 270, 360, "#FFF3A8")
    carrot = [s.poly([(360 + dx, 150), (405 + dx, 165), (338 + dx, 225)], "#FB8C00", "#E65100", 2), s.leaf(405 + dx, 165, 30, 14, "#43A047"), s.circle(420 + dx, 230, 22, "#66BB6A", "#2E7D32", 3), s.circle(380 + dx, 250, 18, "#66BB6A", "#2E7D32", 3)]
    roti = [s.circle(215 + dx, 335, 38, "#F6C77B", "#D79A3C", 3), s.circle(255 + dx, 395, 32, "#F6C77B", "#D79A3C", 3), s.circle(170 + dx, 395, 26, "#FFFFFF", "#D79A3C", 3)]
    egg = [s.circle(215 + dx, 190, 30, "#FFFFFF", "#9E9E9E", 3), s.circle(215 + dx, 190, 13, "#FFB300"), s.circle(270 + dx, 150, 20, "#C48A4A", "#8D5A2B", 2), s.circle(285 + dx, 200, 18, "#C48A4A", "#8D5A2B", 2)]
    apple = [s.circle(400 + dx, 340, 32, "#E53935", "#B71C1C", 3), s.leaf(400 + dx, 310, 26, 12, "#43A047"), s.circle(355 + dx, 395, 24, "#FDD835", "#F9A825", 3), s.circle(430 + dx, 395, 22, "#FB8C00", "#E65100", 3)]
    milk = [s.rect(290, 105, 34, 58, "#FFFFFF", "#90A4AE", 7, 3), s.rect(293, 128, 28, 31, "#EEF3F6")]
    def box(side, y, title, sub, fill, edge, tx, ty):
        x = 10 if side == "L" else 640
        b = s.label(x, y, 250, title, sub, fill, edge); l = s.line(260 if side == "L" else 640, y + 37, tx, ty, edge, 4); return b + [l]
    bP = box("L", 60, "Dal, egg and milk", "Help us grow strong", "#FFF7BF", "#C9A100", 395, 165)
    bG = box("L", 340, "Rice and roti", "Give us energy", "#FFF0D2", "#F59E0B", 400, 345)
    bV = box("R", 60, "Vegetables", "Keep us healthy", "#E4F6DD", "#43A047", 560, 190)
    bF = box("R", 340, "Fruits", "Give us vitamins", "#FFE3E3", "#E53935", 570, 345)
    plates = [rim, veg, grain, prot, fruit]
    steps = [
     {"id": "fd-intro", "section": "Picture it", "narration": T("Look at this plate. A healthy meal has many kinds of food, not just one. Let us see what each part of the plate does for our body.", "இந்தத் தட்டைப் பாருங்க. ஆரோக்கியமான சாப்பாட்டுல நிறைய வகை உணவு இருக்கணும், ஒரே ஒண்ணு இல்ல. தட்டுல ஒவ்வொரு பகுதியும் நம்ம உடம்புக்கு என்ன செய்யுதுன்னு பார்ப்போம்."),
      "actions": [act("clear", at=0), act("show", "bg", at=0.02, ms=200), act("write", "title", on="this plate", ms=700)] + A(plates, "show", "this plate", 600)},
     {"id": "fd-grain", "section": "Picture it", "narration": T("Rice, roti and bread give us energy. We need energy to run, play and study.", "சாதம், ரொட்டி, பிரெட் நமக்கு சக்தி தருது. ஓடவும் விளையாடவும் படிக்கவும் சக்தி வேணும்."),
      "actions": A(roti, "show", "Rice, roti", 500) + A(bG, "show", "give us energy", 500)},
     {"id": "fd-veg", "section": "Picture it", "narration": T("Vegetables like carrots and beans keep our body healthy and strong against illness.", "கேரட், பீன்ஸ் மாதிரி காய்கறிகள் நோய் வராம நம்ம உடம்பை ஆரோக்கியமா வச்சிருக்கும்."),
      "actions": A(carrot, "show", "carrots", 500) + A(bV, "show", "keep our body healthy", 500)},
     {"id": "fd-prot", "section": "Picture it", "narration": T("Dal, eggs and milk help our body grow strong. They build our muscles and bones.", "பருப்பு, முட்டை, பால் நம்ம உடம்பு வலுவா வளர உதவும். தசைகளையும் எலும்புகளையும் உருவாக்கும்."),
      "actions": A(egg, "show", "Dal, eggs", 500) + A(milk, "show", "milk", 500) + A(bP, "show", "grow strong", 500)},
     {"id": "fd-fruit", "section": "Picture it", "narration": T("Fruits are sweet and full of vitamins. Eat a fruit every day.", "பழங்கள் இனிப்பா இருக்கும், வைட்டமின்கள் நிறைய இருக்கும். தினமும் ஒரு பழம் சாப்பிடுங்க."),
      "actions": A(apple, "show", "Fruits", 500) + A(bF, "show", "vitamins", 500)},
     {"id": "fd-q", "section": "Picture it", "narration": T("Question time. Which food gives us energy to run and play?", "கேள்வி நேரம். ஓடவும் விளையாடவும் சக்தி தர்ற உணவு எது?"), "actions": [act("pulse", "p0", on="Which food", ms=100)][:0] + [act("pulse", roti[0], on="Which food", ms=1200, color="#D79A3C")],
      "check": Q("Which food gives us energy to run and play?", "ஓடவும் விளையாடவும் சக்தி தர்ற உணவு எது?", [("Rice, roti and bread", True, ""), ("Only carrots", False, "Vegetables keep us healthy, but grains give the main energy."), ("Only milk", False, "Milk helps us grow strong. Grains give the energy.")], "Rice, roti and bread are grains. They give us energy.", "சாதம், ரொட்டி, பிரெட் தானியங்கள். அவை நமக்கு சக்தி தரும்.")},
    ]
    return s.objs, steps

# ----------------------------------------------------------------------------- reduce, reuse, recycle
def three_r():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#F1FAF1", name="bg"); title = s.text(450, 48, "Reduce, Reuse, Recycle", 38, "#1B7F3B", name="title")
    cols = [(150, "#E3F6E8", "#43A047"), (450, "#E3F0FF", "#1E88E5"), (750, "#FFF1D9", "#F59E0B")]
    cards = [s.rect(x - 130, 90, 260, 300, f, e, 22, 5) for x, f, e in cols]
    # reduce: big pile of bags -> one cloth bag
    r_icon = [s.rect(60, 200, 50, 62, "#BDBDBD", "#757575", 8, 3), s.rect(115, 200, 50, 62, "#BDBDBD", "#757575", 8, 3), s.rect(85, 140, 50, 62, "#BDBDBD", "#757575", 8, 3), s.line(175, 200, 205, 200, "#43A047", 6), s.rect(205, 180, 55, 70, "#66BB6A", "#2E7D32", 10, 4), s.path("M218 180 C218 150 247 150 247 180", None, "#2E7D32", 5)]
    # reuse: bottle -> pot with plant
    u_icon = [s.rect(380, 190, 36, 70, "#90CAF9", "#1565C0", 8, 3), s.rect(390, 165, 16, 28, "#90CAF9", "#1565C0", 4, 3), s.line(430, 220, 462, 220, "#1E88E5", 6), s.poly([(470, 215), (535, 215), (525, 265), (480, 265)], "#C0703A", "#7A4B22", 4), s.rect(495, 175, 8, 42, "#4CAF50"), s.leaf(499, 195, 30, 14), s.leaf(499, 205, -30, 14)]
    # recycle: three arrows in a triangle
    c = lambda x0, y0, x1, y1, qx, qy: s.curved_arrow((x0, y0), (qx, qy), (x1, y1), "#2E9E4F", 8)
    y_icon = c(700, 255, 740, 160, 690, 190) + c(760, 150, 815, 245, 815, 180) + c(800, 262, 715, 270, 760, 295)
    lab = [s.text(150, 325, "Reduce", 32, "#2E7D32"), s.text(150, 357, "Use less", 22, "soft"), s.text(450, 325, "Reuse", 32, "#1565C0"), s.text(450, 357, "Use it again", 22, "soft"), s.text(750, 325, "Recycle", 32, "#B45309"), s.text(750, 357, "Make it new", 22, "soft")]
    foot = s.text(450, 450, "Think before you throw!", 32, "#1B7F3B", name="foot")
    steps = [
     {"id": "r-intro", "section": "Picture it", "narration": T("We make a lot of waste. Three small words can help us make less. They are reduce, reuse and recycle.", "நாம நிறைய குப்பை உண்டாக்குறோம். மூணு சின்ன வார்த்தைகள் அதைக் குறைக்க உதவும். அவை குறை, மறுபயன்படுத்து, மறுசுழற்சி."),
      "actions": [act("clear", at=0), act("show", "bg", at=0.02, ms=200), act("write", "title", on="Three small words", ms=800)] + A(cards, "show", "reduce, reuse", 600)},
     {"id": "r-reduce", "section": "Picture it", "narration": T("Reduce means use less. Instead of taking many plastic bags, carry one cloth bag again and again.", "குறைன்னா குறைவாப் பயன்படுத்தறது. நிறைய பிளாஸ்டிக் பைகளுக்குப் பதிலா, ஒரே துணிப்பையைத் திரும்பத் திரும்பப் பயன்படுத்துங்க."),
      "actions": A(r_icon, "show", "Reduce means", 500) + [act("write", lab[0], on="use less", ms=500), act("write", lab[1], on="use less", ms=500)]},
     {"id": "r-reuse", "section": "Picture it", "narration": T("Reuse means use again. An old bottle can become a pot for a little plant. We do not throw it away.", "மறுபயன்பாடுன்னா மறுபடி பயன்படுத்தறது. பழைய பாட்டில் ஒரு சின்னச் செடிக்கான தொட்டியா மாறலாம். தூக்கி எறிய வேண்டாம்."),
      "actions": A(u_icon, "show", "Reuse means", 500) + [act("write", lab[2], on="use again", ms=500), act("write", lab[3], on="use again", ms=500)]},
     {"id": "r-recycle", "section": "Picture it", "narration": T("Recycle means make something new from old things. Old paper can be turned into new paper.", "மறுசுழற்சின்னா பழைய பொருட்களிலிருந்து புதுசு தயாரிக்கிறது. பழைய காகிதத்தை புதுக் காகிதமா மாத்தலாம்."),
      "actions": A(y_icon, "draw", "Recycle means", 800) + [act("write", lab[4], on="something new", ms=500), act("write", lab[5], on="something new", ms=500), act("write", "foot", on="new paper", ms=900)]},
     {"id": "r-q", "section": "Picture it", "narration": T("Question time. An old jar becomes a pen stand. Which one is this: reduce, reuse or recycle?", "கேள்வி நேரம். பழைய ஜாடி பேனா ஸ்டாண்டா மாறுது. இது குறை, மறுபயன்பாடு, மறுசுழற்சி இதுல எது?"), "actions": [act("pulse", cards[1], on="Question time", ms=100)][:0] + [act("pulse", u_icon[0], on="old jar", ms=1200, color="#1565C0")],
      "check": Q("An old jar becomes a pen stand. Which one is this?", "பழைய ஜாடி பேனா ஸ்டாண்டா மாறுது. இது எது?", [("Reduce", False, "Reduce means using less. Here the jar is used again."), ("Reuse", True, ""), ("Recycle", False, "Recycle breaks things down to make something new. The jar stays the same jar.")], "We use the same jar again in a new way. That is reuse.", "அதே ஜாடியைப் புதுவிதமாக் மறுபடி பயன்படுத்தறோம். இதுதான் மறுபயன்பாடு.")},
    ]
    return s.objs, steps


# ----------------------------------------------------------------------------- multiplication as equal groups (plates of rakhis)
def groups():
    s = Scene()
    bg = s.rect(0, 0, 900, 500, "#FFF6EA", name="bg"); title = s.text(450, 44, "Equal groups", 38, "#B45309", name="title")
    def plate(cx, cy, n, col):
        pl = s.circle(cx, cy, 72, "#FFFFFF", "#D9B382", 6)
        items = [s.circle(cx + math.cos(2 * math.pi * k / n - math.pi / 2) * 38, cy + math.sin(2 * math.pi * k / n - math.pi / 2) * 38, 13, col, "#7A3E00", 2) for k in range(n)]
        return pl, items
    P = [plate(170 + 280 * k, 175, 5, c) for k, c in enumerate(("#F06292", "#FFB300", "#42A5F5"))]
    lab = s.text(450, 300, "3 groups of 5", 34, "#7A3E00", name="lab")
    add = s.text(450, 370, "5 + 5 + 5 = 15", 46, "#1E3FAE", name="add")
    mul = s.text(450, 450, "3 × 5 = 15", 56, "#B91C1C", name="mul")
    steps1 = [
     {"id": "m-groups", "section": "Picture it", "narration": T("Meena has three plates. On each plate there are five rakhis. Let us count the rakhis on the first plate, then the second plate, then the third.", "மீனாகிட்ட மூணு தட்டு இருக்கு. ஒவ்வொரு தட்டுலயும் அஞ்சு ராக்கி இருக்கு. முதல் தட்டு, ரெண்டாவது தட்டு, மூணாவது தட்டுல ராக்கிகளை எண்ணலாம்."),
      "actions": [act("clear", at=0), act("show", "bg", at=0.01, ms=200), act("write", "title", on="three plates", ms=600),
                  act("show", P[0][0], on="three plates", ms=500), act("show", P[1][0], on="three plates", ms=500), act("show", P[2][0], on="three plates", ms=500)] + [act("show", i, on="five rakhis", ms=400) for i in P[0][1]] + [act("show", i, on="second plate", ms=400) for i in P[1][1]] + [act("show", i, on="third", ms=400) for i in P[2][1]]},
     {"id": "m-add", "section": "Picture it", "narration": T("Each plate has the same number. Five and five and five. Let us count by fives: five, ten, fifteen. Three plates have fifteen rakhis.", "எல்லாத் தட்டுலயும் ஒரே எண்ணிக்கை. அஞ்சு, அஞ்சு, அஞ்சு. அஞ்சு அஞ்சா எண்ணலாம்: அஞ்சு, பத்து, பதினைஞ்சு. மூணு தட்டுல பதினைஞ்சு ராக்கி."),
      "actions": [act("pulse", P[0][0], on="Five and five", ms=800, color="#E65100"), act("pulse", P[1][0], on="and five", ms=800, color="#E65100"), act("pulse", P[2][0], on="five. Let us", ms=800, color="#E65100"), act("write", "add", on="five, ten, fifteen", ms=1400)][:4]},
     {"id": "m-times", "section": "Picture it", "narration": T("When every group is the same size, there is a short way to write it. Three groups of five is written three times five equals fifteen.", "எல்லாக் குழுவும் ஒரே அளவுன்னா, அதை எழுத ஒரு குறுக்கு வழி இருக்கு. அஞ்சு அஞ்சா மூணு குழுவை மூணு பெருக்கல் அஞ்சு சமம் பதினைஞ்சுன்னு எழுதுவோம்."),
      "actions": [act("write", "lab", on="Three groups of five", ms=900), act("write", "mul", on="three times five", ms=1200), act("pulse", "mul", on="equals fifteen", ms=900, color="#B91C1C")]},
    ]
    # the table of five, built line by line as the numbers are said
    t = Scene(); t.n = 100
    tb = t.rect(0, 0, 900, 500, "#FFF6EA", name="tbg"); tt = t.text(450, 56, "Table of 5", 46, "#B45309", name="ttitle")
    rows = []
    for j in range(1, 11):
        col, row = (0 if j <= 5 else 1), (j - 1) % 5
        rows.append(t.text(250 + col * 400, 150 + row * 66, f"{j} × 5 = {j * 5}", 42, "#16253F" if j % 2 else "#17785A", name=f"tr{j}"))
    words = ["Five", "Ten", "Fifteen", "Twenty", "Twenty-five", "Thirty", "Thirty-five", "Forty", "Forty-five", "Fifty"]
    steps2 = [
     {"id": "m-table", "section": "Picture it", "narration": T("Now let us make the table of five. Each new plate adds five more. Count by fives and watch the table fill. Five, Ten, Fifteen, Twenty, Twenty-five, Thirty, Thirty-five, Forty, Forty-five, Fifty.", "இப்போ அஞ்சாம் வாய்ப்பாட்டை உருவாக்கலாம். ஒவ்வொரு புது தட்டும் அஞ்சு கூட்டும். அஞ்சு அஞ்சா எண்ணுங்க, வாய்ப்பாடு நிறையுறதைப் பாருங்க."),
      "actions": [act("clear", at=0), act("show", "tbg", at=0.01, ms=200), act("write", "ttitle", on="table of five", ms=600)] + [act("write", r, on=w, ms=450) for r, w in zip(rows, words)]},
     {"id": "m-pattern", "section": "Picture it", "narration": T("Look at the last number of each answer. It goes five, zero, five, zero. Every answer in the table of five ends in five or zero.", "ஒவ்வொரு விடையோட கடைசி எண்ணைப் பாருங்க. அஞ்சு, பூஜ்யம், அஞ்சு, பூஜ்யம்னு வருது. அஞ்சாம் வாய்ப்பாட்டுல எல்லா விடையும் அஞ்சுல அல்லது பூஜ்யத்துல முடியும்."),
      "actions": [act("pulse", r, at=0.3 + 0.05 * k, ms=900, color="#B91C1C") for k, r in enumerate(rows)]},
     {"id": "m-q1", "section": "Picture it", "narration": T("Question time. There are four plates with five rakhis on each plate. How many rakhis are there?", "கேள்வி நேரம். நாலு தட்டு, ஒவ்வொரு தட்டுலயும் அஞ்சு ராக்கி. மொத்தம் எத்தனை ராக்கி?"), "actions": [act("pulse", rows[3], on="four plates", ms=1200, color="#1E3FAE")],
      "check": Q("Four plates, five rakhis on each plate. How many rakhis?", "நாலு தட்டு, ஒவ்வொண்ணுலயும் அஞ்சு ராக்கி. மொத்தம் எத்தனை?", [("9", False, "That adds four and five. We need four groups of five: 5 + 5 + 5 + 5."), ("20", True, ""), ("45", False, "That is nine groups of five. We have only four plates.")], "Four groups of five is twenty: 4 × 5 = 20.", "நாலு குழு, அஞ்சு அஞ்சு: இருபது. 4 × 5 = 20.")},
     {"id": "m-q2", "section": "Picture it", "narration": T("One more. What is two times five?", "இன்னொண்ணு. ரெண்டு பெருக்கல் அஞ்சு எவ்வளவு?"), "actions": [act("pulse", rows[1], on="two times five", ms=1200, color="#1E3FAE")],
      "check": Q("What is 2 × 5?", "2 × 5 எவ்வளவு?", [("7", False, "That is 2 + 5. Multiplying means two groups of five: 5 + 5."), ("10", True, ""), ("25", False, "That is 5 × 5. We need only two groups of five.")], "Two groups of five: 5 + 5 = 10.", "ரெண்டு குழு அஞ்சு: 5 + 5 = 10.")},
    ]
    return s.objs + t.objs, steps1 + steps2

o, st = groups(); write("raksha-bandhan", "multiplication-as-groups", "Multiplication as equal groups", "சம குழுக்களாகப் பெருக்கல்", "maths", o, st)

o, st = water_cycle()
write("water-a-precious-gift", "saving-water", "The Water Cycle", "நீர்ச்சுழற்சி", "evs", o, st)
o, st = plant(); write("getting-to-know-plants", "parts-of-a-plant", "Parts of a plant", "செடியின் பகுதிகள்", "evs", o, st)
o, st = plate(); write("food-we-eat", "healthy-food", "A healthy plate", "ஆரோக்கியமான தட்டு", "evs", o, st)
o, st = three_r(); write("taking-charge-of-waste", "reduce-reuse-recycle", "Reduce, Reuse, Recycle", "குறை, மறுபயன்படுத்து, மறுசுழற்சி", "evs", o, st)
