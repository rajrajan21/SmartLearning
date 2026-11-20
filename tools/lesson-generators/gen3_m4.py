import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
from mark_add import mark
S=dict(cls=3,subj="maths",subj_file="maths")
def L(ch,slug,en,story,exp,terms,ex,claim,summ,quiz): T(S,ch,slug,en,story,exp,terms,ex,claim,summ,quiz)
L("toy-joy","numbers-up-to-99-and-which-is-greater","Numbers up to 99 and which is greater","Toya has 47 marbles and Raju has 52.\n\"Who has more?\" she asked.",
 ["Numbers up to 99 have tens and ones. 47 is 4 tens and 7 ones.","To compare, look at the tens first. 52 has 5 tens and 47 has 4 tens, so 52 is greater.","If the tens are the same, compare the ones. 63 is greater than 61."],
 ["tens","ones","greater"],("Which is greater, 47 or 52?",[("Tens of 47 are 4.","Tens."),("Tens of 52 are 5.","Tens."),("So 52 is greater.","Answer.")]),
 ("47 is greater than 52 because 7 is more than 2.",["Compare the tens first.","5 tens is more than 4 tens."],["Wrong order."]),
 ["Compare tens first, then ones.","52 > 47."],
 ["m|Which is greater?|52|47|40|Tens.","t|63 is greater than 61.|T|Ones.","m|45 has how many tens?|4|5|9|Tens.","t|47 is greater than 52.|F|52 is.","m|Compare the ___ first.|tens|ones|none|Order.","s|How many tens in 83? Write the number.|8|Eight.","m|Which is smaller?|28|82|90|Small.","t|99 is the greatest two-digit number.|T|Yes."])
L("toy-joy","toy-counting-and-sorting-up-to-99","Counting and grouping toys up to 99","Toya packed her toys into bundles of ten.\n\"Now counting is easy,\" she said.",
 ["Group toys in tens to count faster. 3 bundles of ten and 4 loose toys make 34.","Count by tens: 10, 20, 30, 40 and then add ones.","Write the number and say its name: thirty-four."],
 ["bundle","count","name"],("How many toys are 2 tens and 5 ones?",[("2 tens are 20.","Tens."),("Add 5 ones.","Ones."),("20 + 5 = 25.","Answer.")]),
 ("3 tens and 4 ones make 43.",["3 tens are 30.","30 and 4 make 34."],["Digits swapped."]),
 ["Group in tens.","Add the loose ones."],
 ["m|3 tens and 4 ones are|34|43|7|Place.","t|Counting in tens is faster.|T|Yes.","m|10, 20, 30, 40 skip by|10|5|2|Skip.","t|3 tens and 4 ones make 43.|F|34.","m|2 tens 5 ones =|25|52|7|Count.","s|4 tens = ? Write the number.|40|Forty.","m|Thirty-four is|34|43|304|Name.","t|We can write number names.|T|Yes."])
L("fun-with-shapes","flat-and-solid-shapes-lines-and-symmetry","Flat and solid shapes, kinds of lines and symmetry","Shapes were everywhere on the school playground.\n\"Look, a circle on the ground,\" said Toya.",
 ["Flat shapes like circles, triangles and squares can be drawn on paper. Solid shapes like cubes, cones and spheres can be held.","Lines can be straight or curved. A straight line does not bend.","A shape has symmetry if folding it in half makes both sides match."],
 ["flat shape","solid shape","symmetry"],("Is a ball flat or solid?",[("You can hold it.","Hold."),("It takes space.","Space."),("It is a solid shape.","Answer.")]),
 ("a circle is a solid shape.",["A circle is flat.","A sphere is solid."],["Mixed."]),
 ["Flat shapes are drawn.","Symmetry matches both halves."],
 ["m|A ball is a|solid shape|flat shape|line|Sphere.","t|A square is a flat shape.|T|Yes.","m|A straight line|does not bend|is curved|is round|Line.","t|A circle is a solid shape.|F|Flat.","m|Folding a shape in half and matching shows|symmetry|noise|none|Fold.","s|A cube has how many faces? Write number.|6|Six.","m|A cone is|solid|flat|a line|Cone.","t|A curved line bends.|T|Yes."])
L("fun-at-class-party","tally-marks-tables-and-picture-graphs","Tally marks, tables and picture graphs","The class party had four kinds of snacks.\n\"Let us count who likes what,\" said the teacher.",
 ["Data is information we collect. We make a mark for each answer. Tally marks are drawn in groups of five: four lines and a fifth line across them.","We put the counts into a table with a name and a number for each snack.","A picture graph uses a picture for each count so we can compare quickly."],
 ["tally","table","picture graph"],("5 children like cake. How do we show it with tally marks?",[("Draw four lines.","Four."),("Cross them with a fifth.","Five."),("That makes one group of five.","Answer.")]),
 ("a tally group has six lines.",["A group has five marks.","Four lines and one across."],["Wrong."]),
 ["Tally marks count in fives.","Graphs help us compare."],
 ["m|A tally group of five has|4 lines and a cross|6 lines|1 line|Five.","t|Tables list counts.|T|Yes.","m|A picture graph uses|pictures|only words|only noise|Graph.","t|A tally group has six lines.|F|Five.","m|Data is|collected information|a toy|a song|Info.","s|Two groups of five tally marks are ___ . Write the number.|10|Ten.","m|To find who likes most we|compare counts|guess|sleep|Compare.","t|We can show data in a table.|T|Yes."])
L("the-surajkund-fair","patterns-and-year-review","Patterns and a review of the year","At the Surajkund fair Toya saw rows of colourful flags.\n\"They repeat,\" she said.",
 ["A pattern repeats in order. Red, blue, red, blue is a pattern with two items.","To continue a pattern, find the part that repeats and extend it. Number patterns grow by adding the same number each time: 2, 4, 6, 8.","Review: we have learnt numbers, adding, subtracting, shapes, time and money, and used them in the fair."],
 ["pattern","repeat","review"],("What comes next? 2, 4, 6, 8, ?",[("Each number grows by 2.","Rule."),("8 + 2 = 10.","Add."),("So the next is 10.","Answer.")]),
 ("the pattern 2, 4, 6, 8 grows by 3.",["It grows by 2.","Each step adds 2."],["Wrong rule."]),
 ["Patterns repeat.","Find the rule first."],
 ["m|Next after 2, 4, 6, 8|10|9|12|Add 2.","t|A pattern repeats in order.|T|Yes.","m|Red, blue, red, blue, ?|red|green|none|Repeat.","t|2, 4, 6, 8 grows by 3.|F|By 2.","m|To extend a pattern find the|rule|colour|noise|Rule.","s|5, 10, 15, ___ . Write the number.|20|Twenty.","m|Flags in a row can form a|pattern|house|river|Flags.","t|Maths is used at a fair.|T|Yes."])
for ch,sl in [("toy-joy",["solid-shapes-faces-edges-corners","comparing-solid-shapes-and-everyday-objects"]),("fun-at-class-party",["units-of-length","metres-and-centimetres","measuring-with-a-ruler-and-tape"])]:
    try: mark(3,"maths",ch,sl)
    except Exception as e: print(ch,e)
