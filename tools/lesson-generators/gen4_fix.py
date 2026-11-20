import json,os
os.chdir('/tmp/ss-build')
p='content/curriculum/cbse-2026-27.json'
c=json.load(open(p))
for cl in c['classes']:
  for s in cl['subjects']:
    for ch in s['chapters']:
      if ch['slug']=='the-transport-museum':
        ch['topics']=[t for t in ch['topics'] if t['slug']!='money-and-bills']
json.dump(c,open(p,'w'),ensure_ascii=False,indent=2)
for d in('lessons','questions'):
    f=f'content/{d}/cbse-4-maths-the-transport-museum-money-and-bills.json'
    if os.path.exists(f): os.remove(f)
import sys; sys.path.insert(0,'tools/lesson-generators')
from lessonkit import mk,qs
M=dict(cls=4,subj="maths",subj_file="maths")
mk(M,"the-transport-museum","times-10-and-times-5-tables","Times 10 and times 5 tables","10 மற்றும் 5 வாய்ப்பாடுகள்",["Skip count in tens and fives","Use the times-10 and times-5 tables to multiply"],
 ("Buses in the museum","In the transport museum, each toy bus tray held 10 buses. There were 6 trays.\n\"How many buses?\" asked Ravi. \"Six tens,\" said the guide, \"that is 60.\""),
 ["The times-10 table is made by counting in tens: 10, 20, 30, 40 and so on. 6 times 10 is 60, because 6 groups of 10 make 60. Every answer ends in 0.","The times-5 table is made by counting in fives: 5, 10, 15, 20, 25. Every answer ends in 0 or 5. 7 times 5 is 35.","A table helps us multiply quickly. Picture the groups as rows of pebbles: 4 rows of 5 pebbles make 20 pebbles."],
 ["times table","skip counting","groups"],
 [("Count in tens: 10, 20, 30, 40.","times 10"),("6 times 10 is 60.","6 x 10"),("Count in fives: 5, 10, 15, 20, 25.","times 5"),("Times-5 answers end in 0 or 5.","0 or 5")],
 ("A shelf holds 5 toy cars in a row. How many cars are in 8 rows?",[("There are 8 groups of 5.","Equal groups."),("Count in fives eight times: 5, 10, 15, 20, 25, 30, 35, 40.","Skip count."),("So 8 times 5 is 40.","Answer.")]),
 ("A friend says 6 times 10 is 16. How will you reply?",["6 groups of 10 are 60.","16 is 6 plus 10, not 6 times 10."],["Adding instead of multiplying."]),
 ["Times-10 answers end in 0.","Times-5 answers end in 0 or 5.","Multiplying means equal groups."],
 qs("a",[("m","7 times 10 is","70","17","7","Seven tens."),("t","Every answer in the times-5 table ends in 0 or 5.",True,"Yes."),("m","6 times 5 is","30","11","35","Count in fives six times."),("t","4 times 10 is 14.",False,"It is 40."),("m","The next number in 10, 20, 30 is","40","31","35","Add 10."),("s","What is 9 times 5? Write only the number.",["45"],"9 x 5 is 45."),("m","5 rows of 5 pebbles make","25","10","20","5 x 5."),("t","Times-10 answers end in 0.",True,"Yes.")]))
mk(M,"the-transport-museum","building-the-times-15-table","Building the times-15 table","15-ன் வாய்ப்பாட்டை உருவாக்குதல்",["Build a table from times-10 and times-5","Compare the times-15 and times-5 tables"],
 ("Fifteen seats","Each museum train had 15 seats. Meena wanted to know the seats in 4 trains.\n\"Fifteen is ten and five,\" said Meena. \"So I add the times-10 and times-5 answers.\""),
 ["We can build the times-15 table from two tables we know. 15 is 10 plus 5, so 4 times 15 is 4 times 10 plus 4 times 5. That is 40 plus 20, which is 60.","The times-15 table is 15, 30, 45, 60, 75. Each answer is 15 more than the one before.","Compare it with the times-5 table. The times-15 answers are 3 times the times-5 answers. 15 is 3 times 5, so 2 times 15 is 30, which is 3 times 10."],
 ["table","build","compare"],
 [("15 is 10 plus 5.","split"),("4 times 15 is 40 plus 20, which is 60.","4 x 15"),("The times-15 table goes 15, 30, 45, 60, 75.","table"),("Each answer is 15 more than the last.","pattern")],
 ("Find 3 times 15 using times 10 and times 5.",[("3 times 10 is 30.","Times 10."),("3 times 5 is 15.","Times 5."),("30 plus 15 is 45.","Add.")]),
 ("A friend says the times-15 table has nothing to do with the times-5 table. How will you reply?",["15 is 3 times 5.","Every times-15 answer is 3 times the times-5 answer."],["Not seeing the link between tables."]),
 ["Split 15 into 10 and 5.","Add the two answers.","Times-15 grows by 15 each step."],
 qs("b",[("m","2 times 15 is","30","25","20","15 + 15."),("t","15 is 10 plus 5.",True,"Yes."),("m","3 times 15 is","45","35","50","30 + 15."),("t","Times-15 answers go up by 5 each time.",False,"By 15."),("m","4 times 15 is","60","45","55","40 + 20."),("s","What is 5 times 15? Write only the number.",["75"],"60 + 15."),("m","The times-15 answers are ___ times the times-5 answers.","3","2","5","15 is 3 times 5."),("t","The times-15 table has 15, 30, 45, 60.",True,"Yes.")]))
mk(M,"elephants-tigers-and-leopards","adding-and-subtracting-animal-counts","Adding and subtracting animal counts","விலங்குகளின் எண்ணிக்கையைக் கூட்டலும் கழித்தலும்",["Add four-digit animal counts","Subtract to compare two counts"],
 ("The wildlife report","A report said Karnataka had 6,049 elephants and Assam had 5,719.\n\"How many in both?\" asked Gita. \"And how many more in Karnataka?\""),
 ["To add 6,049 and 5,719, line up the places and add from the ones. 9 plus 9 is 18, write 8 and carry 1. 4 tens plus 1 ten plus the carried 1 is 6 tens. Then 0 hundreds plus 7 hundreds is 7. Then 6 thousands plus 5 thousands is 11. The total is 11,768.","To find how many more, subtract. 6,049 minus 5,719 is 330, so Karnataka has 330 more elephants.","Check by adding: 5,719 plus 330 is 6,049."],
 ["total","how many more","check"],
 [("Add to find the total.","add"),("6,049 plus 5,719 is 11,768.","total"),("Subtract to find how many more.","subtract"),("Check by adding back.","check")],
 ("Kerala has 3,054 elephants and Assam has 5,719. How many in both?",[("Add the ones: 4 plus 9 is 13, write 3 carry 1.","Ones."),("Tens: 5 plus 1 plus 1 is 7. Hundreds: 0 plus 7 is 7. Thousands: 3 plus 5 is 8.","Other places."),("The total is 8,773.","Answer.")]),
 ("A friend says to find how many more we should add. How will you reply?",["How many more means find the difference.","We subtract the smaller from the larger."],["Adding when comparing."]),
 ["Add for the total.","Subtract for how many more.","Check by adding back."],
 qs("c",[("m","To find how many more we","subtract","add","multiply","Difference."),("t","We can check subtraction by adding back.",True,"Yes."),("m","1,200 plus 800 is","2,000","1,000","2,200","Add."),("t","6,049 is less than 5,719.",False,"It is more."),("m","5,000 minus 2,000 is","3,000","7,000","2,000","Subtract."),("s","What is 6,000 plus 3,000? Write only the number.",["9000","9,000"],"9,000."),("m","8,773 is the total of 3,054 and","5,719","5,000","6,000","Add back."),("t","For a total we add.",True,"Yes.")]))
mk(M,"elephants-tigers-and-leopards","numbers-and-their-reverse","Numbers and their reverse","எண்களும் அவற்றின் தலைகீழும்",["Add a number to its reverse","Find numbers that give a target sum"],
 ("Reverse puzzle","Aman wrote 14 and its reverse 41 and added them: 55.\n\"Which other numbers give 55?\" he asked."),
 ["The reverse of 23 is 32. Adding a number to its reverse gives a pattern: 23 plus 32 is 55. 14 plus 41 is also 55.","The numbers 14, 23, 32, 41 and 50 all give 55 when added to their reverse. Their digits always add up to 5.","So to get 88 we need digits that add up to 8. Examples are 17 plus 71, 26 plus 62 and 35 plus 53."],
 ["reverse","digits","sum"],
 [("The reverse of 23 is 32.","reverse"),("23 plus 32 is 55.","sum"),("Digits adding to 5 give 55.","pattern"),("Digits adding to 8 give 88.","88")],
 ("Does 26 plus its reverse give 88?",[("The reverse of 26 is 62.","Reverse."),("26 plus 62 is 88.","Add."),("Yes, it gives 88.","Answer.")]),
 ("A friend says only 14 and 41 give 55. How will you reply?",["23 plus 32 is also 55.","Many numbers give 55."],["Thinking only one pair works."]),
 ["Reverse swaps the digits.","Digits adding to 5 give 55.","Digits adding to 8 give 88."],
 qs("d",[("m","The reverse of 32 is","23","33","13","Swap digits."),("t","14 plus its reverse is 55.",True,"Yes."),("m","23 plus 32 is","55","44","65","Add."),("t","Only one number gives 55 with its reverse.",False,"Several do."),("m","35 plus 53 is","88","77","98","Add."),("s","What is 41 plus its reverse? Write only the number.",["55"],"41 plus 14."),("m","Digits adding to 5 give a sum of","55","88","66","Pattern."),("t","The reverse of 50 is 05.",True,"Yes, 5.")]))
mk(M,"hide-and-seek","views-and-maps","Views and maps","தோற்றங்களும் வரைபடங்களும்",["Describe an object from the top, front and side","Read a simple map with directions"],
 ("The view from above","Nila looked at a table from above and saw a square. From the side it looked like a thin line.\n\"The same thing looks different from different places,\" she said."),
 ["An object looks different from the top, the front and the side. A cup seen from above is a circle. Seen from the side it is a rectangle.","A map is a view from above. It uses small pictures and a key to show places. Directions on a map are north, south, east and west.","To find a hiding place, read the map: start at the gate, go east to the tree, then go north to the shed."],
 ["top view","front view","map","direction"],
 [("Objects look different from top, front and side.","views"),("A cup from above is a circle.","top view"),("A map is a view from above.","map"),("North, south, east, west show directions.","directions")],
 ("Start at the gate, go east to the tree, then north to the shed. In which order do you go?",[("First east.","Direction one."),("Then north.","Direction two."),("East then north.","Answer.")]),
 ("A friend says an object looks the same from every side. How will you reply?",["A cup is a circle from above.","It is a rectangle from the side."],["Thinking views never change."]),
 ["Views change with position.","A map is a top view.","Use directions to follow a path."],
 qs("e",[("m","A cup seen from above looks like a","circle","triangle","line","Top view."),("t","A map is a view from above.",True,"Yes."),("m","The direction opposite to north is","south","east","west","Opposite."),("t","An object looks the same from every side.",False,"It changes."),("m","A map uses a ___ to show places.","key","bell","pen","Key."),("s","Opposite of east? Write one word.",["west"],"West."),("m","From the side a cup looks like a","rectangle","circle","star","Side view."),("t","North, south, east and west are directions.",True,"Yes.")]))
