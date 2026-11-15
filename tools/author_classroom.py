"""Writes the classroom board lessons (content/classroom/*.json).
Run:  python tools/author_classroom.py
Each lesson is plain data: objects on a 900x500 board, and steps of narration + board actions.
Narration is what Malar Teacher says; keep it to about three short sentences and spell numbers out in words."""
import json, os

OUT = os.path.join(os.path.dirname(__file__), "..", "content", "classroom")
os.makedirs(OUT, exist_ok=True)

def T(en, ta=None): return {"en": en, **({"ta": ta} if ta else {})}
def act(do, target=None, **k): return {"do": do, **({"target": target} if target else {}), **k}
def step(id, narration, actions=(), check=None):
    s = {"id": id, "narration": T(narration), "actions": list(actions)}
    if check: s["check"] = check
    return s
def check(stem, opts, explanation):
    return {"stem": T(stem), "explanation": T(explanation), "options": [
        {"id": i, "text": T(t), **({"correct": True} if ok else {"whyWrong": T(w)})} for i, t, ok, w in opts]}
def lesson(cls, subject, chapter, topic, title, ta, objects, steps):
    d = {"board": "CBSE", "classLevel": cls, "subject": subject, "chapter": chapter, "topic": topic, "status": "published", "title": T(title, ta), "objects": objects, "steps": steps}
    with open(os.path.join(OUT, f"cbse-{cls}-{subject}-{chapter}-{topic}.json"), "w", encoding="utf8") as f:
        json.dump(d, f, ensure_ascii=False, indent=1)

def text(id, x, y, t, size=36, color="ink", anchor="middle"): return {"kind": "text", "id": id, "x": x, "y": y, "text": t, "size": size, "color": color, "anchor": anchor}

# ---------------------------------------------------------------- A: halves and quarters
A = [
 {"kind": "circle", "id": "whole", "cx": 250, "cy": 270, "r": 160, "stroke": "ink", "width": 6},
 {"kind": "sector", "id": "half", "cx": 250, "cy": 270, "r": 160, "from": 0, "to": 180, "stroke": "ink"},
 {"kind": "line", "id": "cutV", "x1": 250, "y1": 110, "x2": 250, "y2": 430, "stroke": "ink", "width": 5},
 {"kind": "line", "id": "cutH", "x1": 90, "y1": 270, "x2": 410, "y2": 270, "stroke": "ink", "width": 5},
 {"kind": "sector", "id": "q1", "cx": 250, "cy": 270, "r": 160, "from": 0, "to": 90, "stroke": "ink"},
 {"kind": "sector", "id": "q2", "cx": 250, "cy": 270, "r": 160, "from": 90, "to": 180, "stroke": "ink"},
 {"kind": "sector", "id": "q3", "cx": 250, "cy": 270, "r": 160, "from": 180, "to": 270, "stroke": "ink"},
 {"kind": "sector", "id": "q4", "cx": 250, "cy": 270, "r": 160, "from": 270, "to": 360, "stroke": "ink"},
 text("tWhole", 670, 110, "1 whole", 48, "accent"),
 text("tHalf", 670, 230, "½", 90, "accent"),
 text("tQuarter", 670, 230, "¼", 90, "warm"),
 text("tSum", 670, 350, "¼ + ¼ = 2/4 = ½", 42, "good"),
 text("tCount", 670, 440, "4 quarters = ?", 44, "accent"),
]
lesson(3, "maths", "fair-share", "halves-and-quarters", "Halves and quarters", "பாதிகளும் கால்பங்குகளும்", A, [
 step("whole", "This round roti is one whole. Let us share it fairly.", [act("draw", "whole", at=0, ms=1400), act("write", "tWhole", on="one whole")]),
 step("half", "Cut it down the middle into two equal parts. Each part is called one half.", [act("draw", "cutV", on="Cut it", ms=900), act("fill", "half", on="Each part", color="accent"), act("write", "tHalf", on="one half", ms=500), act("pulse", "half", on="one half", color="accent")]),
 step("quarter", "Now cut each half again. We get four equal parts. Each part is one quarter.", [act("hide", "half", at=0), act("hide", "tHalf", at=0), act("draw", "cutH", on="cut each half", ms=900), act("fill", "q1", on="one quarter", color="warm"), act("write", "tQuarter", on="one quarter", ms=500), act("pulse", "q1", on="one quarter", color="warm")]),
 step("two", "Shade another quarter next to it. One quarter plus one quarter makes two quarters. Two quarters make one half.", [act("fill", "q2", on="Shade", color="warm"), act("write", "tSum", on="makes two quarters", ms=1800), act("pulse", "q2", on="Two quarters make", color="warm")]),
 step("count", "Colour the last two parts too. Count all the equal parts in the whole circle. Now it is your turn to think.", [act("fill", "q3", at=0.1, color="warm"), act("fill", "q4", at=0.3, color="warm"), act("write", "tCount", at=0.6, ms=800)],
  check("How many quarters make one whole?", [("a", "2", False, "Two quarters make only one half."), ("b", "3", False, "Three quarters is not the whole circle yet. One more part is left."), ("c", "4", True, ""), ("d", "8", False, "Eight is too many. Look at the circle again and count the parts.")], "Four quarters make one whole. That is why we call each part a quarter.")),
])

# ---------------------------------------------------------------- B: parts of a plant
leaf = lambda id, d: {"kind": "path", "id": id, "d": d, "stroke": "good", "fill": "good", "width": 4}
B = [
 {"kind": "rect", "id": "soil", "x": 0, "y": 380, "w": 900, "h": 120, "stroke": "earth", "fill": "earth", "width": 2},
 {"kind": "circle", "id": "sun", "cx": 790, "cy": 85, "r": 42, "stroke": "sun", "fill": "sun", "width": 4},
 {"kind": "path", "id": "rootL", "d": "M450 380 Q420 430 340 465", "stroke": "ink", "width": 8},
 {"kind": "path", "id": "rootM", "d": "M450 380 L450 485", "stroke": "ink", "width": 8},
 {"kind": "path", "id": "rootR", "d": "M450 380 Q480 430 560 465", "stroke": "ink", "width": 8},
 {"kind": "path", "id": "stem", "d": "M450 380 L450 150", "stroke": "good", "width": 14},
 leaf("leafL", "M450 250 Q340 190 310 250 Q370 305 450 250 Z"),
 leaf("leafR", "M450 200 Q560 140 590 200 Q530 255 450 200 Z"),
 {"kind": "arrow", "id": "wRoot", "x1": 330, "y1": 462, "x2": 425, "y2": 400, "stroke": "water", "width": 6},
 {"kind": "arrow", "id": "wUp", "x1": 450, "y1": 372, "x2": 450, "y2": 262, "stroke": "water", "width": 6},
 {"kind": "arrow", "id": "wL", "x1": 450, "y1": 262, "x2": 385, "y2": 250, "stroke": "water", "width": 6},
 {"kind": "arrow", "id": "wR", "x1": 450, "y1": 232, "x2": 515, "y2": 205, "stroke": "water", "width": 6},
 text("tRoot", 250, 450, "Roots", 40, "warm", "end"),
 text("tStem", 500, 330, "Stem", 40, "good", "start"),
 text("tLeaf", 630, 185, "Leaves", 40, "good", "start"),
 text("tFood", 640, 270, "food", 36, "accent", "start"),
]
lesson(3, "evs", "getting-to-know-plants", "parts-of-a-plant", "How water travels in a plant", "செடியில் தண்ணீர் எப்படிப் பயணிக்கிறது", B, [
 step("meet", "Look at this plant. It has roots, a stem and leaves.", [act("show", "soil", at=0), act("draw", "rootL", on="roots", ms=700), act("draw", "rootM", on="roots", ms=700), act("draw", "rootR", on="roots", ms=700), act("draw", "stem", on="stem", ms=900), act("show", "leafL", on="leaves"), act("show", "leafR", on="leaves")]),
 step("roots", "The roots grow under the soil. They hold the plant firmly and drink water.", [act("write", "tRoot", on="roots"), act("pulse", "rootL", on="roots", color="warm"), act("pulse", "rootM", on="roots", color="warm"), act("pulse", "rootR", on="roots", color="warm"), act("draw", "wRoot", on="drink water", ms=1200)]),
 step("stem", "The stem is like a long straw. It carries the water up to the leaves.", [act("write", "tStem", on="stem"), act("pulse", "stem", on="long straw", color="accent"), act("draw", "wUp", on="carries", ms=1800)]),
 step("leaves", "The leaves use the water and the sunlight to make food for the plant.", [act("write", "tLeaf", at=0), act("draw", "wL", at=0, ms=800), act("draw", "wR", at=0.05, ms=800), act("show", "sun", on="sunlight", ms=900), act("pulse", "leafL", on="make food", color="accent"), act("pulse", "leafR", on="make food", color="accent"), act("write", "tFood", on="food")]),
 step("think", "Now think about how the water travels. It starts in the soil and ends in the leaves.", [act("pulse", "wRoot", on="soil", color="accent"), act("pulse", "wUp", at=0.5, color="accent")],
  check("Which part takes in water from the soil?", [("a", "Root", True, ""), ("b", "Stem", False, "The stem carries water up. It does not take water in from the soil."), ("c", "Leaf", False, "The leaves are high up in the air, far from the soil.")], "The roots drink water from the soil. Then the stem carries it up to the leaves.")),
])

# ---------------------------------------------------------------- C: solid shapes
C = [
 {"kind": "solid", "id": "cube", "shape": "cube", "x": 260, "y": 265, "size": 270, "color": "water"},
 text("t0", 260, 60, "A solid shape", 40, "accent"),
 text("tFaces", 660, 150, "6 faces", 56, "accent"),
 text("tEdges", 660, 260, "12 edges", 56, "warm"),
 text("tCorners", 660, 370, "8 corners", 56, "good"),
 {"kind": "solid", "id": "cyl", "shape": "cylinder", "x": 170, "y": 250, "size": 210, "color": "warm"},
 {"kind": "solid", "id": "cone", "shape": "cone", "x": 450, "y": 250, "size": 210, "color": "good"},
 {"kind": "solid", "id": "ball", "shape": "sphere", "x": 730, "y": 250, "size": 210, "color": "accent"},
 text("tCyl", 170, 440, "cylinder", 38, "warm"),
 text("tCone", 450, 440, "cone", 38, "good"),
 text("tBall", 730, 440, "sphere", 38, "accent"),
]
lesson(3, "maths", "fun-with-shapes", "sides-and-corners", "Solid shapes you can hold", "கையில் பிடிக்கக்கூடிய திண்ம வடிவங்கள்", C, [
 step("solid", "Some shapes are not flat. They are solid, and you can hold them in your hand.", [act("show", "cube", at=0, ms=800), act("spin", "cube", at=0.1, rate=28), act("write", "t0", on="solid")]),
 step("faces", "This is a cube. Look at its flat sides. They are called faces. A cube has six faces.", [act("mark", "cube", on="faces", mode="faces"), act("write", "tFaces", on="six faces", ms=700)]),
 step("edges", "Where two faces meet, we get an edge. A cube has twelve edges.", [act("mark", "cube", at=0, mode="edges"), act("write", "tEdges", on="twelve edges", ms=700)]),
 step("corners", "The pointed places are called corners. A cube has eight corners.", [act("mark", "cube", at=0, mode="corners"), act("write", "tCorners", on="eight corners", ms=700)],
  ),
 step("recall", "Look at the cube again and think about what you saw.", [act("mark", "cube", at=0, mode="faces"), act("pulse", "cube", at=0.3, color="accent")],
  check("How many faces does a cube have?", [("a", "4", False, "A cube has more than four. Count the flat sides again, including the top and the bottom."), ("b", "6", True, ""), ("c", "8", False, "Eight is the number of corners, not faces."), ("d", "12", False, "Twelve is the number of edges, not faces.")], "A cube has six faces, twelve edges and eight corners.")),
 step("others", "Now meet some other solid shapes. A cylinder can roll and stand. A cone has one pointed tip. A sphere is round like a ball.", [act("clear"), act("show", "cyl", on="cylinder"), act("write", "tCyl", on="cylinder"), act("show", "cone", on="cone"), act("write", "tCone", on="cone"), act("show", "ball", on="sphere"), act("write", "tBall", on="sphere"), act("spin", "cyl", on="cylinder", rate=30), act("spin", "cone", on="cone", rate=30), act("spin", "ball", on="sphere", rate=30)]),
])

# ---------------------------------------------------------------- D: reading the clock
D = [
 {"kind": "clock", "id": "clk", "cx": 260, "cy": 255, "r": 185},
 text("tHour", 650, 120, "short hand = hour", 38, "accent"),
 text("tMin", 650, 200, "long hand = minutes", 38, "warm"),
 text("tOclock", 650, 310, "3 o'clock", 60, "good"),
 text("tHalf", 650, 410, "half past 3  (3:30)", 48, "accent"),
]
lesson(3, "maths", "time-goes-on", "reading-the-clock", "Reading the clock", "கடிகாரத்தைப் படித்தல்", D, [
 step("face", "This is a clock. It tells us the time. Look, it has twelve numbers.", [act("draw", "clk", at=0, ms=1800)]),
 step("hour", "The short hand is the hour hand. It tells us the hour.", [act("pulse", "clk", on="hour hand", part="hour", color="accent", ms=1800), act("write", "tHour", on="It tells")]),
 step("minute", "The long hand is the minute hand. It tells us the minutes.", [act("pulse", "clk", on="minute hand", part="minute", color="warm", ms=1800), act("write", "tMin", on="It tells")]),
 step("oclock", "When the minute hand points to twelve and the hour hand points to three, it is three o'clock.", [act("time", "clk", at=0, hour=3, minute=0, ms=2600), act("write", "tOclock", on="three o'clock", ms=900)]),
 step("half", "Now watch. The minute hand goes half way round the clock. That is thirty minutes. It is half past three.", [act("time", "clk", on="minute hand", hour=3, minute=30, ms=3000), act("write", "tHalf", on="half past three", ms=1200)]),
 step("ask", "Look at the clock carefully before you answer.", [act("pulse", "clk", at=0.4, part="minute", color="warm", ms=1200)],
  check("What time does the clock show?", [("a", "Three o'clock", False, "At three o'clock the minute hand points to twelve. Here it points to six."), ("b", "Half past three", True, ""), ("c", "Half past four", False, "The hour hand is just after three, so the hour is still three.")], "The minute hand is on six and the hour hand is just past three, so it is half past three.")),
])
print("wrote", len(os.listdir(OUT)), "classroom lessons")
