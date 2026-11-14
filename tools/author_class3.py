#!/usr/bin/env python3
"""Generates the Class 3 lessons and practice questions for four maths chapters (English; Tamil to be added after review).
Run from the project root:  python3 tools/author_class3.py   then   pnpm --filter @studysmart/api curriculum:check"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def L(en, ta=None): return {"en": en, **({"ta": ta} if ta else {})}

def mcq(key, rnd, stem, correct, wrongs, expl, hint=None, pos=0):
    opts = [{"id": f"o{i}", "text": L(t), "correct": False, "whyWrong": L(w)} for i, (t, w) in enumerate(wrongs)]
    opts.insert(pos, {"id": "right", "text": L(correct), "correct": True})
    for i, o in enumerate(opts):
        if not o["correct"]: o["id"] = f"o{i}"
    q = {"key": key, "type": "mcq", "round": rnd, "stem": L(stem), "options": opts, "hints": [L(hint)] if hint else [], "explanation": L(expl), "provenance": "original", "status": "published"}
    return q
def tf(key, rnd, stem, ans, expl, hint=None):
    return {"key": key, "type": "true_false", "round": rnd, "stem": L(stem), "answer": ans, "hints": [L(hint)] if hint else [], "explanation": L(expl), "provenance": "original", "status": "published"}
def num(key, rnd, stem, ans, expl, hint=None, unit=None, wrong=()):
    q = {"key": key, "type": "number", "round": rnd, "stem": L(stem), "answer": ans, "tolerance": 0, "wrongAnswers": [{"value": v, "why": L(w)} for v, w in wrong], "hints": [L(hint)] if hint else [], "explanation": L(expl), "provenance": "original", "status": "published"}
    if unit: q["unit"] = L(unit)
    return q
def short(key, rnd, stem, accepted, expl, hint=None):
    return {"key": key, "type": "short", "round": rnd, "stem": L(stem), "accepted": accepted, "wrongAnswers": [], "hints": [L(hint)] if hint else [], "explanation": L(expl), "provenance": "original", "status": "published"}
def order(key, rnd, stem, items, expl, hint=None):
    return {"key": key, "type": "order", "round": rnd, "stem": L(stem), "items": [{"id": f"i{i}", "text": L(t)} for i, t in enumerate(items)], "hints": [L(hint)] if hint else [], "explanation": L(expl), "provenance": "original", "status": "published"}

def lesson(title, story_title, story, explain, terms, narr, example, steps, teach, ideas, mis, quiz, summary):
    sents = []
    for i, (t, board) in enumerate(narr, 1):
        sents.append({"id": f"t{i}", "text": L(t), "board": board})
    return {"status": "published", "title": L(title), "blocks": [
        {"id": "story", "type": "story", "provenance": "original", "title": L(story_title), "text": L(story)},
        {"id": "explain", "type": "explanation", "provenance": "original", "keepEnglishTerms": terms, "text": L(explain)},
        {"id": "teacher", "type": "teacher_narration", "provenance": "original", "teacher": "malar", "sentences": sents},
        {"id": "example", "type": "worked_example", "provenance": "original", "problem": L(example), "steps": [{"text": L(a), "why": L(b)} for a, b in steps]},
        {"id": "teachback", "type": "teach_back", "provenance": "original", "prompt": L(teach), "requiredIdeas": [L(x) for x in ideas], "commonMisconceptions": [L(x) for x in mis]},
        {"id": "quiz", "type": "quiz", "provenance": "original", "questionIds": quiz},
        {"id": "summary", "type": "summary", "provenance": "original", "points": [L(x) for x in summary]},
    ]}
W = lambda t: {"op": "write", "text": t}
D = lambda s, l=None: {"op": "draw", "shape": s, **({"label": l} if l else {})}
CLR = {"op": "clear"}
TOPICS = []

# ---------------------------------------------------------------- Halves and quarters
TOPICS.append(dict(chapter="fair-share", topic="halves-and-quarters",
  name=L("Halves and quarters", "பாதிகளும் கால்பங்குகளும்"),
  objectives=["Say that a half is one of two equal parts and a quarter is one of four equal parts", "Tell how many halves or quarters make a whole", "Solve simple sharing problems with halves and quarters"],
  lesson=lesson("Halves and quarters", "Asha shares her roti",
    "Asha had one warm roti. Her friend Kabir came to play.\nAsha tore the roti into two pieces that were exactly the same size. \"One for you, one for me,\" she said.\nLater her cousins came too. Asha and Kabir tore each piece again, so there were four equal pieces for four children.\nHow much of the roti did each child get?",
    "A whole can be shared into equal parts.\nShare a whole into 2 equal parts: each part is one half.\nShare a whole into 4 equal parts: each part is one quarter.\nThe parts must be exactly equal. If one part is bigger, it is not a half.\n2 halves make 1 whole. 4 quarters make 1 whole. 2 quarters make 1 half.",
    ["half", "quarter", "whole"],
    [("Imagine a chapati. Fold it so both sides match exactly. Now you have two equal parts.", [CLR, D("circle", "whole"), W("2 equal parts = halves")]),
     ("Each part is one half. Two halves put together make one whole chapati.", [W("1/2 + 1/2 = 1 whole")]),
     ("Fold it once more. Now there are four equal parts. Each one is a quarter.", [D("line"), W("4 equal parts = quarters")]),
     ("Two quarters make a half. Four quarters make a whole. Remember: the parts must always be equal.", [W("2 quarters = 1 half"), W("4 quarters = 1 whole")])],
    "A pizza is cut into 4 equal slices. Ravi eats 1 slice. How much of the pizza has he eaten, and how much is left?",
    [("Count the equal slices. There are 4, so each slice is one quarter.", "Four equal parts are quarters."),
     ("Ravi ate 1 slice, so he ate one quarter of the pizza.", "He took 1 of the 4 equal parts."),
     ("Slices left: 4 take away 1 is 3 slices. Three quarters are left.", "What is left is the other 3 equal parts.")],
    "A friend says \"a half is the bigger piece when you break a roti.\" What would you tell your friend?",
    ["A half is one of TWO EQUAL parts.", "If the two parts are not equal, neither part is a half.", "Two halves make a whole."],
    ["Calling any piece a half, even when the pieces are not equal."],
    ["r1-two-equal", "r1-half-meaning", "r1-pizza-slice"],
    ["A half is one of 2 equal parts. A quarter is one of 4 equal parts.", "2 halves make a whole. 4 quarters make a whole. 2 quarters make a half.", "Parts must always be equal."]),
  questions=[
    mcq("r1-two-equal", 1, "A whole is shared into 2 equal parts. Each part is called a…", "half", [("quarter", "A quarter is one of 4 equal parts, not 2."), ("whole", "The whole is everything before it is shared."), ("tenth", "A tenth is one of 10 equal parts.")], "Two equal parts: each is a half.", "How many equal parts are there?", 0),
    tf("r1-half-meaning", 1, "A half is one of two equal parts.", True, "True. Half means one of two equal parts."),
    mcq("r1-pizza-slice", 1, "A pizza is cut into 4 equal slices. One slice is called a…", "quarter", [("half", "A half is one of 2 equal parts."), ("whole", "The whole pizza is all 4 slices together."), ("double", "Double means twice as much, which is not a part.")], "4 equal parts: each one is a quarter.", "Count the slices.", 1),
    tf("r2-unequal", 2, "A roti is torn into two pieces. One piece is big and one is small. Each piece is a half.", False, "False. Halves must be equal. Unequal pieces are not halves."),
    num("r2-quarters-whole", 2, "How many quarters make one whole?", 4, "4 equal quarters make a whole.", "Think of a pizza cut into equal slices.", wrong=[(2, "2 is the number of halves in a whole. Quarters are smaller, so more are needed.")]),
    num("r2-halves-whole", 2, "How many halves make one whole?", 2, "2 halves make a whole.", "Fold a paper in two equal parts."),
    num("r3-quarters-in-halves", 3, "2 quarters make 1 half. How many quarters make 2 halves?", 4, "Each half is 2 quarters. 2 halves is 2 + 2 = 4 quarters.", "2 + 2 = ?"),
    mcq("r3-sandwich", 3, "Rani's sandwich is cut into 4 equal pieces. She eats half of the sandwich. How many pieces does she eat?", "2 pieces", [("1 piece", "1 piece is only a quarter of the sandwich."), ("3 pieces", "3 pieces is more than a half."), ("4 pieces", "4 pieces is the whole sandwich.")], "Half of 4 pieces is 2 pieces.", "A half is 2 quarters.", 2),
    short("r3-two-quarters", 3, "Two quarters together make one ___ (write the word).", ["half", "a half", "one half", "1/2"], "2 quarters make a half.", "Fold the roti twice, then unfold one fold."),
    num("r4-cake", 4, "A cake is cut into 4 equal slices. Ravi eats 1 slice and Meena eats 1 slice. How many slices are left?", 2, "They ate 1 + 1 = 2 slices. 4 take away 2 leaves 2 slices.", "First find how many slices were eaten.", wrong=[(1, "That is only what one child ate."), (3, "That is what is left after only one slice.")]),
    mcq("r4-bigger", 4, "Which piece of the same roti is bigger?", "a half", [("a quarter", "A quarter is smaller: 4 of them make the whole, but only 2 halves do.")], "A half is 2 quarters, so it is bigger than one quarter.", "Which is made of more quarters?", 0),
    order("r4-order", 4, "Put these pieces of the same pizza in order, smallest first.", ["a quarter", "a half", "the whole pizza"], "A quarter is the smallest, a half is two quarters, and the whole is the biggest."),
  ]))

# ---------------------------------------------------------------- Reading the clock
TOPICS.append(dict(chapter="time-goes-on", topic="reading-the-clock",
  name=L("Reading the clock", "கடிகாரம் பார்த்தல்"),
  objectives=["Tell the hour hand from the minute hand", "Read o'clock and half past on a clock", "Know that there are 60 minutes in an hour, 24 hours in a day and 7 days in a week"],
  lesson=lesson("Reading the clock", "Kabir is late for school",
    "Kabir looked at the clock on the wall. The short hand pointed at 7 and the long hand pointed at 12.\n\"It is 7 o'clock!\" said Amma. \"School bus comes at half past 7.\"\nKabir wondered how long he had. He wanted to read the clock like a grown-up.\nCan you help him?",
    "A clock has two hands.\nThe short hand is the hour hand. It tells the hour.\nThe long hand is the minute hand.\nWhen the minute hand points at 12, it is o'clock. The hour hand tells which hour: hour hand on 7 means 7 o'clock.\nWhen the minute hand points at 6, it is half past. Hour hand just after 7 means half past 7.\nThere are 60 minutes in 1 hour, and half an hour is 30 minutes.\nThere are 24 hours in a day and 7 days in a week.",
    ["o'clock", "half past", "hour", "minute"],
    [("Look at a clock. The short hand is the hour hand. The long hand is the minute hand.", [CLR, D("circle", "clock"), W("short = hour, long = minute")]),
     ("When the long hand is on 12, we say o'clock. Short hand on 3 means 3 o'clock.", [W("long hand on 12 = o'clock")]),
     ("When the long hand is on 6, we say half past. Half an hour is 30 minutes.", [W("long hand on 6 = half past"), W("half hour = 30 minutes")]),
     ("One hour has 60 minutes. One day has 24 hours. One week has 7 days.", [W("1 hour = 60 minutes"), W("1 day = 24 hours")])],
    "The school bus comes at half past 7. It is 7 o'clock now. How many minutes must Kabir wait?",
    [("From 7 o'clock to half past 7, the minute hand goes from 12 to 6.", "o'clock is the minute hand on 12; half past is on 6."),
     ("Half an hour is 30 minutes.", "An hour has 60 minutes and half of 60 is 30."),
     ("So Kabir must wait 30 minutes for the bus.", "From 7:00 to 7:30 is 30 minutes.")],
    "Your younger brother mixes up the two hands of the clock. How will you explain them?",
    ["The short hand is the hour hand.", "The long hand is the minute hand.", "Long hand on 12 means o'clock; on 6 means half past."],
    ["Thinking the long hand tells the hour."],
    ["r1-short-hand", "r1-minutes-hour", "r1-oclock"],
    ["The short hand tells the hour and the long hand tells the minutes.", "Minute hand on 12 is o'clock; on 6 is half past.", "1 hour = 60 minutes, half an hour = 30 minutes, 1 day = 24 hours, 1 week = 7 days."]),
  questions=[
    mcq("r1-short-hand", 1, "Which hand of the clock is the hour hand?", "the short hand", [("the long hand", "The long hand is the minute hand."), ("the red second hand", "That is the seconds hand, not the hour hand.")], "The short hand shows the hour.", "Which hand moves slowly?", 0),
    num("r1-minutes-hour", 1, "How many minutes are there in one hour?", 60, "There are 60 minutes in one hour.", "Count by five all the way around the clock.", unit="minutes"),
    tf("r1-oclock", 1, "When the minute hand is on 12, it is o'clock.", True, "True. Minute hand on 12 means o'clock."),
    mcq("r2-half-past-3", 2, "The minute hand is on 6 and the hour hand is just after 3. What time is it?", "half past 3", [("3 o'clock", "At 3 o'clock the minute hand is on 12."), ("half past 4", "The hour hand is just after 3, so it is still the 3 o'clock hour."), ("6 o'clock", "The 6 is where the minute hand is, not the hour.")], "Minute hand on 6 means half past. The hour is 3.", "Minute hand on 6 means?", 1),
    num("r2-days-week", 2, "How many days are there in one week?", 7, "A week has 7 days.", "Say the names of the days.", unit="days"),
    tf("r2-half-hour", 2, "Half an hour is 30 minutes.", True, "True. Half of 60 minutes is 30 minutes."),
    num("r3-school", 3, "School starts at 8 in the morning and ends at 1 in the afternoon. For how many hours is the school open?", 5, "From 8 to 1 is 9, 10, 11, 12, 1: that is 5 hours.", "Count the hours on the clock: 9, 10, 11...", unit="hours"),
    num("r3-wakes", 3, "Ravi goes to bed at 9 at night and sleeps for 8 hours. At what time does he wake up? (type the hour)", 5, "9 plus 8 hours: 10, 11, 12, 1, 2, 3, 4, 5. He wakes at 5 in the morning.", "Count 8 hours forward from 9.", wrong=[(17, "On a clock we say 5, not 17.")]),
    order("r3-order", 3, "Put these in order from the shortest time to the longest time.", ["one hour", "one day", "one week"], "An hour is shorter than a day, and a day is shorter than a week.", "How many hours are in a day?"),
    num("r4-film", 4, "A film starts at half past 4 and lasts 1 hour. It ends at half past ___ (type the hour).", 5, "One hour later than half past 4 is half past 5.", "Add 1 to the hour.", wrong=[(4, "The film lasts an hour, so the hour changes.")]),
    num("r4-reads", 4, "Maya reads for half an hour each day. How many minutes does she read in 2 days?", 60, "Half an hour is 30 minutes. 30 + 30 = 60 minutes.", "First change half an hour into minutes.", unit="minutes", wrong=[(30, "That is only one day of reading.")]),
    mcq("r4-longest", 4, "Which of these takes the longest time?", "a school year", [("brushing your teeth", "That takes only a few minutes."), ("eating lunch", "That takes less than an hour."), ("a school day", "A school day is only some hours, much shorter than a year.")], "A school year lasts many months, much longer than the others.", "Think of months, days, hours and minutes.", 3),
  ]))

# ---------------------------------------------------------------- Litres and kilograms
TOPICS.append(dict(chapter="filling-and-lifting", topic="litres-and-kilograms",
  name=L("Litres and kilograms", "லிட்டரும் கிலோகிராமும்"),
  objectives=["Use litres to measure how much a container holds and kilograms to measure weight", "Know that 1 kilogram is 1000 grams", "Solve simple adding, taking away and sharing problems with litres and kilograms"],
  lesson=lesson("Litres and kilograms", "Amma goes shopping",
    "Amma went to the shop with Meena. \"Two kilograms of rice and one litre of oil, please,\" she said.\nMeena watched the shopkeeper pour oil into a bottle. Then he put the rice on the scale.\n\"Why do we say litre for the oil and kilogram for the rice?\" asked Meena.",
    "We use litres (L) to measure how much liquid a container can hold: milk, water, oil.\nWe use kilograms (kg) to measure how heavy something is: rice, sugar, a school bag.\nSmall weights are measured in grams (g). 1 kilogram is 1000 grams.\nHalf a kilogram is 500 grams.\nThe same unit can be added or taken away: 2 kg + 3 kg = 5 kg, and 5 L take away 2 L is 3 L.",
    ["litre", "kilogram", "gram"],
    [("When we want to know how much water a bucket holds, we measure in litres.", [CLR, D("rect", "bucket"), W("litre (L) = how much it holds")]),
     ("When we want to know how heavy a bag of rice is, we weigh it in kilograms.", [D("rect", "rice"), W("kilogram (kg) = how heavy")]),
     ("A kilogram is the same as one thousand grams. Half a kilogram is five hundred grams.", [W("1 kg = 1000 g"), W("half kg = 500 g")]),
     ("We can add and take away litres, and kilograms, just like numbers. Remember to keep the same unit.", [W("2 kg + 3 kg = 5 kg")])],
    "Amma buys 2 kg of rice and 3 kg of sugar. How many kilograms does she carry home?",
    [("Both are in kilograms, so we can add them.", "Only the same units can be added."),
     ("Add 2 + 3 = 5.", "Adding the two weights gives the total."),
     ("She carries 5 kg.", "Always write the unit with the answer.")],
    "Meena asks why oil is measured in litres but rice in kilograms. What will you tell her?",
    ["Litres tell how much a container holds, for liquids.", "Kilograms tell how heavy something is.", "1 kilogram is 1000 grams."],
    ["Using litres to measure how heavy something is."],
    ["r1-milk", "r1-rice", "r1-litre-half"],
    ["Litres measure how much liquid a container holds.", "Kilograms measure how heavy something is.", "1 kg = 1000 g, and the same units can be added or taken away."]),
  questions=[
    mcq("r1-milk", 1, "We measure how much milk a jug holds in…", "litres", [("kilograms", "Kilograms tell how heavy something is."), ("metres", "Metres measure length.")], "Liquids and what a container holds are measured in litres.", "Is it weight or how much it holds?", 0),
    mcq("r1-rice", 1, "We measure how heavy a bag of rice is in…", "kilograms", [("litres", "Litres are for how much liquid a container holds."), ("minutes", "Minutes measure time.")], "Weight is measured in kilograms.", "Is it weight or how much it holds?", 1),
    tf("r1-litre-half", 1, "1 litre of water is more than half a litre of water.", True, "True. A whole litre is twice half a litre."),
    num("r2-kg-g", 2, "1 kilogram is how many grams?", 1000, "1 kg = 1000 g.", "Think of a thousand.", unit="g", wrong=[(100, "100 is a tenth of it. A kilogram is 1000 grams.")]),
    num("r2-buckets", 2, "A bucket holds 10 litres. How many litres do 2 such buckets hold?", 20, "10 + 10 = 20 litres.", "Add the two buckets.", unit="L"),
    tf("r2-cotton-iron", 2, "One kilogram of cotton weighs less than one kilogram of iron.", False, "False. Both weigh the same: one kilogram. Cotton just takes more space."),
    num("r3-shopping", 3, "Amma buys 2 kg of rice and 3 kg of sugar. How many kilograms is that altogether?", 5, "2 + 3 = 5 kg.", "Add the weights.", unit="kg"),
    num("r3-jug", 3, "A jug has 5 litres of water. 2 litres are poured out. How many litres are left?", 3, "5 take away 2 is 3 litres.", "Take away.", unit="L", wrong=[(7, "Pouring out takes away; it does not add.")]),
    mcq("r3-heavier", 3, "Which is heavier?", "1 kg of apples", [("500 g of apples", "500 g is only half a kilogram.")], "1 kg is 1000 g. That is more than 500 g.", "1 kg is how many grams?", 0),
    num("r4-mugs", 4, "A tank holds 20 litres. A mug holds 2 litres. How many mugs of water fill the tank?", 10, "20 divided into groups of 2 gives 10 mugs.", "Count by twos up to 20.", wrong=[(40, "Multiplying gives too many. Share 20 into groups of 2.")]),
    num("r4-bags", 4, "Raju's bag weighs 3 kg. His sister's bag is 2 kg heavier. How many kilograms does his sister's bag weigh?", 5, "3 + 2 = 5 kg.", "Heavier means add.", unit="kg", wrong=[(1, "Heavier means more, so add.")]),
    short("r4-watermelon", 4, "Which unit would you use to weigh a watermelon: gram or kilogram?", ["kilogram", "kilograms", "kg"], "A watermelon is heavy, so we use kilograms.", "Is a watermelon light or heavy?"),
  ]))

# ---------------------------------------------------------------- Using rupees
TOPICS.append(dict(chapter="give-and-take", topic="using-rupees",
  name=L("Using rupees", "ரூபாய் பயன்படுத்துதல்"),
  objectives=["Know that 100 paise make 1 rupee", "Add prices and find the total cost", "Work out how much money is left or how much change to get back"],
  lesson=lesson("Using rupees", "Meena's lemon-juice stall",
    "Meena set up a little stall for her school fair. A glass of lemon juice cost 10 rupees.\nRiya gave her a 50 rupee note and bought one glass.\n\"How much do I get back?\" asked Riya.\nMeena had to think carefully about giving the right change.",
    "In India we use rupees (₹). Small money is paise: 100 paise make 1 rupee.\nWe use coins and notes.\nTo find the total cost, add the prices: a pencil for ₹5 and an eraser for ₹3 cost 5 + 3 = ₹8.\nTo find how much is left, take away what was spent.\nChange is the money we get back: money given take away the price.",
    ["rupee", "paise", "change"],
    [("Hundred paise make one rupee. We write rupees with this sign.", [CLR, W("100 paise = ₹1")]),
     ("If we buy two things, we add their prices to find the total.", [W("₹5 + ₹3 = ₹8")]),
     ("If we pay with more money than the price, the shopkeeper gives back change.", [W("change = given - price")]),
     ("Always check: the price plus the change should give the money you handed over.", [W("price + change = money given")])],
    "Riya pays with a 50 rupee note for a glass of lemon juice that costs ₹10. How much change does she get?",
    [("Money given is ₹50. Price is ₹10.", "Change uses the money given and the price."),
     ("Take away: 50 - 10 = 40.", "Change is what is left after paying the price."),
     ("Riya gets ₹40 change.", "Check: 10 + 40 = 50.")],
    "Your friend does not know how to find the change. What will you tell your friend?",
    ["Change is the money given take away the price.", "Check by adding price and change: it should equal the money given.", "100 paise make 1 rupee."],
    ["Adding the price to the money given instead of taking it away."],
    ["r1-paise", "r1-two-three", "r1-money-units"],
    ["100 paise make 1 rupee.", "Add prices to find the total, and take away to find what is left.", "Change = money given - price."]),
  questions=[
    mcq("r1-paise", 1, "How many paise make 1 rupee?", "100", [("10", "10 paise is only a tenth of a rupee."), ("50", "50 paise is half a rupee."), ("1000", "That is too many. 1000 paise is ten rupees.")], "100 paise make 1 rupee.", "Half a rupee is 50 paise.", 2),
    num("r1-two-three", 1, "Ravi has ₹2 and Asha gives him ₹3 more. How many rupees does he have now?", 5, "2 + 3 = 5 rupees.", "Add.", unit="rupees"),
    tf("r1-money-units", 1, "Rupees and paise are used to measure money.", True, "True. Money is counted in rupees and paise."),
    num("r2-notebooks", 2, "A notebook costs ₹20. How much do 2 notebooks cost?", 40, "20 + 20 = 40 rupees.", "Add the price two times.", unit="rupees"),
    num("r2-left", 2, "Meena has ₹50 and spends ₹20. How many rupees are left?", 30, "50 take away 20 is 30 rupees.", "Spending takes away.", unit="rupees", wrong=[(70, "Spending takes money away; it does not add.")]),
    tf("r2-more", 2, "₹10 is more than ₹5.", True, "True. 10 is greater than 5."),
    num("r3-change", 3, "Ravi buys a ball for ₹35 and pays with a ₹50 note. How much change does he get?", 15, "50 take away 35 is 15 rupees.", "Change is the money given take away the price.", unit="rupees", wrong=[(85, "Change is found by taking away, not adding.")]),
    num("r3-toffees", 3, "One toffee costs ₹2. How much do 6 toffees cost?", 12, "2 + 2 + 2 + 2 + 2 + 2 = 12 rupees.", "Count by twos six times.", unit="rupees"),
    order("r3-order", 3, "Put these prices in order from the smallest to the biggest.", ["₹9", "₹19", "₹25"], "9 is the smallest, then 19, then 25.", "Compare the tens first."),
    num("r4-shopping", 4, "Asha has ₹100. She buys a book for ₹45 and a pen for ₹20. How many rupees are left?", 35, "She spends 45 + 20 = 65 rupees. 100 take away 65 is 35 rupees.", "First find the total spent.", unit="rupees", wrong=[(65, "That is what she spent. Find what is left.")]),
    num("r4-biscuits", 4, "A packet of biscuits costs ₹10. Kabir buys 4 packets and pays ₹50. How much change does he get?", 10, "4 packets cost 10 + 10 + 10 + 10 = 40 rupees. 50 take away 40 is 10 rupees.", "Find the cost of 4 packets first.", unit="rupees", wrong=[(40, "That is what the 4 packets cost, not the change.")]),
    mcq("r4-afford", 4, "Rani has ₹30. Which one can she buy?", "a book for ₹28", [("a bag for ₹45", "₹45 is more than ₹30."), ("a toy for ₹35", "₹35 is more than ₹30."), ("a box for ₹31", "₹31 is more than ₹30, just by one rupee.")], "Only ₹28 is less than or equal to ₹30.", "Which price is not more than 30?", 3),
  ]))

def write(topics=None, subject="maths"):
    topics = TOPICS if topics is None else topics
    cur_path = os.path.join(ROOT, "content/curriculum/cbse-2026-27.json")
    cur = json.load(open(cur_path, encoding="utf8"))
    maths = next(s for c in cur["classes"] if c["classLevel"] == 3 for s in c["subjects"] if s["slug"] == subject)
    for t in topics:
        ch = next(c for c in maths["chapters"] if c["slug"] == t["chapter"])
        if not any(x["slug"] == t["topic"] for x in ch.get("topics", [])):
            ch.setdefault("topics", []).append({"slug": t["topic"], "name": t["name"], "objectives": [{"text": L(o)} for o in t["objectives"]]})
        key = f"cbse-3-{subject}-{t['chapter']}-{t['topic']}"
        json.dump({"board": "CBSE", "classLevel": 3, "subject": subject, "chapter": t["chapter"], "topic": t["topic"], "lesson": t["lesson"]}, open(os.path.join(ROOT, f"content/lessons/{key}.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
        json.dump({"board": "CBSE", "classLevel": 3, "subject": subject, "chapter": t["chapter"], "topic": t["topic"], "questions": t["questions"]}, open(os.path.join(ROOT, f"content/questions/{key}.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    json.dump(cur, open(cur_path, "w", encoding="utf8"), ensure_ascii=False, indent=2)
if __name__ == "__main__":
    write()
    print("written", len(TOPICS), "topics")
