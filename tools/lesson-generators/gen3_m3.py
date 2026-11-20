import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=3,subj="maths",subj_file="maths")
T(M,"whats-in-a-name","number-names-and-ordering","Number names and ordering","Ravi's roll number is 12 and Anu's is 9.\n\"Who comes first?\" asked the teacher.",
 ["Every number has a name. 12 is twelve and 20 is twenty. We can arrange numbers from smallest to biggest, which is ascending order, or biggest to smallest, which is descending order.","Ordinal numbers tell position: first, second, third. Cardinal numbers tell how many: one, two, three.","Ravi is 12th and Anu is 9th, so Anu comes before Ravi."],
 ["ascending","descending","ordinal"],("Arrange 12, 9 and 15 from smallest to biggest.",[("Smallest is 9.","Find smallest."),("Next is 12.","Next."),("9, 12, 15.","Answer.")]),
 ("12 comes before 9 in ascending order.",["Ascending starts with the smallest.","9 is smaller than 12."],["Wrong order."]),
 ["Ascending is small to big.","Ordinals show position."],
 ["m|Ascending order starts with the|smallest|biggest|middle|Small first.","t|First, second, third are ordinal numbers.|T|Yes.","m|Smallest of 12, 9, 15|9|12|15|Smallest.","t|12 comes before 9 in ascending order.|F|9 first.","m|Descending starts with the|biggest|smallest|none|Big first.","s|Write twelve in digits.|12|Twelve.","m|Which tells position?|third|three|zero|Ordinal.","t|Cardinal numbers tell how many.|T|Yes."])
T(M,"toy-joy","comparing-solid-shapes-and-everyday-objects","Matching solids with everyday objects","Raju looked at a ball, a tin, a dice and a funnel.\n\"Which solid shape is each?\" he asked.",
 ["A ball is a sphere, a dice is a cube and a tin is a cylinder. A funnel is like a cone and a brick is like a cuboid.","A sphere rolls in every direction. A cylinder rolls only one way and can also stand. A cube and cuboid do not roll; they slide and stack.","We choose shapes by their use. We stack boxes because flat faces sit on each other."],
 ["sphere","cylinder","cone"],("Which solids can roll?",[("A sphere rolls everywhere.","Sphere."),("A cylinder rolls one way.","Cylinder."),("A cone rolls in a circle.","Cone.")]),
 ("a cube can roll like a ball.",["A cube has flat faces.","It does not roll."],["Mixing cube and sphere."]),
 ["Match objects to solids.","Flat faces stack."],
 ["m|A ball is a|sphere|cube|cone|Round.","t|A dice is a cube.|T|Yes.","m|A tin is a|cylinder|sphere|cone|Tin.","t|A cube can roll like a ball.|F|No.","m|A funnel is like a|cone|cube|sphere|Cone.","s|A brick is like a ___ . One word.|cuboid|Cuboid.","m|Shapes with flat faces can|stack|roll everywhere|float|Stack.","t|A sphere rolls in all directions.|T|Yes."])
T(M,"double-century","skip-counting-and-number-line-to-200","Skip counting and the number line to 200","Anu hopped along a number line in jumps of 10.\n\"10, 20, 30 ...\" she counted.",
 ["Skip counting means counting in jumps. Counting in 10s from 100 goes 100, 110, 120, 130. Counting in 5s from 100 goes 100, 105, 110, 115.","A number line shows numbers in order. Moving right makes a number bigger and moving left makes it smaller.","To find 50 more than 120 jump 5 tens to the right and land on 170."],
 ["skip counting","number line","jump"],("Count in 10s from 100 to 150.",[("Start at 100.","Start."),("Add 10 each jump.","Jump."),("100, 110, 120, 130, 140, 150.","Answer.")]),
 ("moving left on the number line makes a number bigger.",["Moving right makes it bigger.","Left makes it smaller."],["Reversed direction."]),
 ["Skip count in 5s and 10s.","Right is bigger."],
 ["m|Next in 100, 110, 120|130|125|140|Add 10.","t|Moving right makes numbers bigger.|T|Yes.","m|50 more than 120|170|130|70|Add 50.","t|Moving left makes numbers bigger.|F|Smaller.","m|Counting in 5s from 100: 100, 105,|110|106|120|Add 5.","s|What comes after 148? Write only the number.|149|Next.","m|A number line shows numbers in|order|a mess|circles|Order.","t|Skip counting uses jumps.|T|Yes."])
T(M,"vacation-with-my-nani-maa","word-problems-with-addition-and-subtraction","Word problems with addition and subtraction","Nani had 120 laddoos. She gave away 45 and made 30 more.\n\"How many now?\" asked Asha.",
 ["Read the problem slowly. Find what we know and what we must find. Words like more, altogether and in all mean add. Words like left, gave away and fewer mean subtract.","120 minus 45 is 75. Then 75 plus 30 is 105. So Nani has 105 laddoos.","Check by thinking: does the answer make sense?"],
 ["add","subtract","check"],("Nani had 60 mangoes, gave 25 and got 10 more. How many now?",[("60 minus 25 is 35.","Subtract."),("35 plus 10 is 45.","Add."),("She has 45 mangoes.","Answer.")]),
 ("gave away means add.",["Gave away means subtract.","The amount goes down."],["Wrong operation."]),
 ["Pick the operation from the words.","Solve in steps."],
 ["m|120 - 45 =|75|85|165|Subtract.","t|Altogether means add.|T|Yes.","m|75 + 30 =|105|95|45|Add.","t|Gave away means add.|F|Subtract.","m|60 - 25 + 10 =|45|75|35|Steps.","s|50 - 20 + 5 =? Write only the number.|35|30+5.","m|Left means|subtract|add|multiply|Remaining.","t|We should check if the answer makes sense.|T|Yes."])
T(M,"fun-with-shapes","drawing-shapes-and-making-pictures","Drawing shapes and making pictures","Meena drew a house using a square, a triangle and a rectangle.\n\"Shapes make pictures,\" she said.",
 ["We can build pictures from shapes. A square body, a triangle roof and a rectangle door make a house.","Triangle has 3 sides and 3 corners, square has 4 equal sides, rectangle has 4 sides with opposite sides equal and circle is round.","We can trace shapes, cut them and arrange them to make a boat, a robot or a flower."],
 ["triangle","square","rectangle"],("Which shapes make a simple house?",[("A square for the walls.","Square."),("A triangle for the roof.","Triangle."),("A rectangle for the door.","Rectangle.")]),
 ("a triangle has four sides.",["A triangle has three sides.","A square has four."],["Mixing triangle and square."]),
 ["Shapes make pictures.","Know sides and corners."],
 ["m|A triangle has how many sides?|3|4|5|Tri.","t|A square has 4 equal sides.|T|Yes.","m|The roof of the house is a|triangle|square|circle|Roof.","t|A triangle has four sides.|F|Three.","m|A door can be a|rectangle|circle|triangle|Door.","s|Corners of a square? Write only the number.|4;four|Four.","m|Shapes can be used to make|pictures|nothing|noise|Art.","t|A circle has no corners.|T|Yes."])
T(M,"house-of-hundreds-1","reading-and-writing-three-digit-numbers","Reading and writing three-digit numbers","Mina counted 2 hundreds, 6 tens and 4 ones in her blocks.\n\"That is two hundred sixty four,\" she said.",
 ["A three-digit number has hundreds, tens and ones. 264 is 2 hundreds, 6 tens and 4 ones, or 200 plus 60 plus 4.","Read it as two hundred sixty four. For 305 we say three hundred five because there are no tens.","Write the number by putting digits in the hundreds, tens and ones places. A zero holds a place."],
 ["hundreds","tens","ones"],("Write 4 hundreds, 0 tens and 7 ones.",[("4 hundreds is 400.","Hundreds."),("0 tens and 7 ones is 7.","Rest."),("The number is 407.","Answer.")]),
 ("305 is read as thirty five.",["305 is three hundred five.","The zero holds the tens place."],["Dropping the zero."]),
 ["Hundreds, tens, ones.","Zero holds a place."],
 ["m|2 hundreds, 6 tens, 4 ones is|264|246|624|Place value.","t|Zero holds a place.|T|Yes.","m|305 is read|three hundred five|thirty five|three fifty|Read.","t|305 is read as thirty five.|F|Hundred.","m|400 + 7 =|407|47|470|Add.","s|Write 300 + 40 + 2 as a number.|342|Add.","m|In 264 the tens digit is|6|2|4|Middle.","t|A three-digit number has hundreds.|T|Yes."])
T(M,"raksha-bandhan","division-as-sharing-and-grouping","Division as sharing and grouping","Asha had 15 rakhis. She put 5 in each plate.\n\"How many plates?\" asked her mother.",
 ["Division can mean sharing equally or making equal groups. 15 rakhis put 5 in each plate make 3 plates, so 15 divided by 5 is 3.","Division is the opposite of multiplication. Since 3 times 5 is 15, 15 divided by 5 is 3.","We use the division sign and write 15 / 5 = 3."],
 ["divide","group","opposite"],("Put 12 sweets in plates of 4. How many plates?",[("Make groups of 4.","Group."),("4, 8, 12 makes 3 groups.","Count."),("3 plates.","Answer.")]),
 ("division and multiplication are unrelated.",["Division undoes multiplication.","3 x 5 = 15 and 15 / 5 = 3."],["No link."]),
 ["Division shares or groups equally.","It is the opposite of multiplication."],
 ["m|15 / 5 =|3|10|20|Fact.","t|Division is the opposite of multiplication.|T|Yes.","m|12 sweets, 4 in a plate, plates?|3|4|8|12/4.","t|Division has no link to multiplication.|F|Linked.","m|3 x 5 = 15 so 15 / 3 =|5|3|8|Check.","s|What is 10 / 2? Write only the number.|5|Half.","m|Equal groups means|same in each|different|none|Equal.","t|We write division as /.|T|Yes."])
T(M,"fair-share","fractions-of-a-collection","Fractions of a collection","Mother had 8 laddoos and gave half to the guests.\n\"How many?\" asked Anu.",
 ["A fraction can show part of a group. Half of 8 is 4 because 8 shared in 2 equal groups is 4 each.","A quarter of 8 is 2 because 8 shared in 4 equal groups is 2 each.","Three quarters of 8 is 6 because 3 groups of 2 is 6."],
 ["half","quarter","group"],("Find a quarter of 12.",[("Make 4 equal groups.","Divide."),("12 / 4 = 3.","Share."),("A quarter of 12 is 3.","Answer.")]),
 ("half of 8 is 2.",["Half of 8 is 4.","Share into 2 equal groups."],["Wrong share."]),
 ["Half = 2 equal groups.","Quarter = 4 equal groups."],
 ["m|Half of 8 is|4|2|16|8/2.","t|A quarter of 8 is 2.|T|Yes.","m|A quarter of 12 is|3|6|4|12/4.","t|Half of 8 is 2.|F|4.","m|Three quarters of 8|6|2|4|3x2.","s|Half of 10? Write only the number.|5|10/2.","m|Half means ___ equal groups.|2|3|4|Two.","t|Fractions can show part of a group.|T|Yes."])
T(M,"house-of-hundreds-2","adding-with-regrouping-and-estimating","Adding with regrouping and estimating","The school shop sold 248 pencils on Monday and 175 on Tuesday.\n\"How many in all?\" asked the teacher.",
 ["Add from the ones. 8 plus 5 is 13: write 3 and carry 1 ten. Tens: 4 plus 7 plus 1 is 12: write 2 and carry 1 hundred. Hundreds: 2 plus 1 plus 1 is 4. The total is 423.","To estimate, round to the nearest ten: 250 plus 180 is about 430, which is close to 423.","Estimating helps check that an answer is sensible."],
 ["regroup","estimate","carry"],("Add 248 and 175.",[("Ones: 8 plus 5 is 13. Write 3, carry 1.","Ones."),("Tens: 4 plus 7 plus 1 is 12. Write 2, carry 1.","Tens."),("Hundreds: 2 plus 1 plus 1 is 4. Answer 423.","Hundreds.")]),
 ("estimating gives the exact answer.",["An estimate is close.","It checks the answer."],["Confusing the two."]),
 ["Carry when a place has ten or more.","Estimate to check."],
 ["m|248 + 175 =|423|413|323|Carry.","t|Estimating gives a close answer.|T|Yes.","m|250 + 180 is about|430|330|530|Round.","t|Estimating gives the exact answer.|F|Close.","m|8 + 5 = 13: write 3 and|carry 1|carry 3|nothing|Regroup.","s|What is 100 + 150? Write only the number.|250|Add.","m|We add from the|ones|hundreds|middle|Right.","t|Carrying moves ten to the next place.|T|Yes."])
T(M,"fun-at-class-party","measuring-with-a-ruler-and-tape","Measuring with a ruler and tape","Raju measured his notebook with a ruler.\n\"It is 21 centimetres long,\" he said.",
 ["To measure with a ruler, put the zero mark at one end of the object and read the number at the other end. Never start from the edge of the ruler if the zero is not there.","We use a metre scale or tape for longer things like a table and a measuring tape for the body.","We write the unit: cm for centimetres and m for metres."],
 ["ruler","measuring tape","unit"],("How do we measure a pencil?",[("Put zero at one end.","Start."),("Read the number at the other end.","Read."),("Write the unit cm.","Unit.")]),
 ("we can start measuring from any mark.",["Start at zero.","Otherwise the answer is wrong."],["Wrong start."]),
 ["Start at zero.","Write the unit."],
 ["m|We start measuring at|zero|any mark|ten|Zero.","t|We write the unit with the number.|T|Yes.","m|A long table is measured in|metres|millimetres|grams|Long.","t|We can start from any mark.|F|Zero.","m|A tape measures|length|weight|time|Length.","s|Short form of centimetre? Write two letters.|cm|cm.","m|A pencil is about 15|cm|m|km|Small.","t|A ruler has marks.|T|Yes."])
T(M,"filling-and-lifting","estimating-weights-and-capacities","Estimating weights and capacities","Meena lifted a bag of rice and a pencil box.\n\"Which is heavier?\" she asked.",
 ["We can estimate weight by lifting. A pencil weighs a few grams and a bag of rice weighs a kilogram or more.","We can estimate capacity by comparing containers. A glass holds about 200 ml and a bucket holds many litres.","After estimating we can check with a balance or a measuring jug."],
 ["estimate","heavier","capacity"],("Which holds more: a mug or a bucket?",[("A mug is small.","Small."),("A bucket is large.","Large."),("The bucket holds more.","Answer.")]),
 ("a pencil weighs 1 kilogram.",["A pencil weighs a few grams.","A kilogram is a lot."],["Wrong unit sense."]),
 ["Estimate then check.","Light things in grams."],
 ["m|A bucket holds|more than a mug|less than a mug|nothing|Big.","t|A pencil weighs a few grams.|T|Yes.","m|A bag of rice is about|1 kg|1 g|1 mg|Heavy.","t|A pencil weighs 1 kilogram.|F|Grams.","m|We check weight with a|balance|ruler|clock|Weigh.","s|A glass holds about 200 ___ . Write ml.|ml|Millilitres.","m|A jug measures|capacity|weight|length|Liquid.","t|Estimating is a good guess.|T|Yes."])
T(M,"give-and-take","adding-money-and-comparing-prices","Adding money and comparing prices","Ravi compared two pens: one cost 15 rupees and the other cost 20 rupees.\n\"Which is cheaper?\" he asked.",
 ["To compare prices, find which amount is smaller. 15 is less than 20, so the first pen is cheaper.","To add money, add the rupees. 15 plus 20 is 35 rupees.","Notes and coins: we have 1, 2, 5, 10 rupee coins and 10, 20, 50, 100 rupee notes."],
 ["cheaper","costlier","rupee"],("A pen costs 15 and a book costs 20. Find the total.",[("Add 15 and 20.","Add."),("15 plus 20 is 35.","Sum."),("The total is 35 rupees.","Answer.")]),
 ("a bigger number means cheaper.",["A smaller price is cheaper.","Compare numbers."],["Wrong idea."]),
 ["Smaller price is cheaper.","Add prices for total."],
 ["m|15 is ___ than 20.|less|more|equal|Smaller.","t|A smaller price is cheaper.|T|Yes.","m|15 + 20 =|35|25|45|Add.","t|A bigger price is cheaper.|F|Costlier.","m|A 10 rupee note and a 5 rupee coin make|15|105|50|Add.","s|What is 25 + 25 rupees? Write only the number.|50|Add.","m|Costlier means|higher price|lower price|free|More.","t|Coins and notes are money.|T|Yes."])
T(M,"time-goes-on","half-past-quarter-past-and-quarter-to","Half past, quarter past and quarter to","Ravi's class starts at quarter past eight.\n\"What does that mean?\" he asked.",
 ["When the minute hand is on 6, it is half past. 3:30 is half past three. When it is on 3, it is quarter past. 8:15 is quarter past eight. When it is on 9, it is quarter to the next hour. 8:45 is quarter to nine.","The hour hand moves slowly and the minute hand moves fast.","There are 60 minutes in an hour, so half an hour is 30 minutes and a quarter is 15 minutes."],
 ["half past","quarter past","quarter to"],("What time is quarter to nine?",[("Quarter to means 15 minutes before.","Meaning."),("15 minutes before 9 is 8:45.","Subtract."),("It is 8:45.","Answer.")]),
 ("quarter past eight is 8:45.",["Quarter past is 8:15.","8:45 is quarter to nine."],["Mixing past and to."]),
 ["Half past: 30. Quarter past: 15. Quarter to: 45.","60 minutes in an hour."],
 ["m|Half past 3 is|3:30|3:15|3:45|Half.","t|Quarter past 8 is 8:15.|T|Yes.","m|Quarter to 9 is|8:45|9:15|8:15|Before.","t|Quarter past eight is 8:45.|F|8:15.","m|Minutes in an hour|60|30|100|Sixty.","s|Minutes in half an hour? Write only the number.|30|Half.","m|The minute hand on 3 is|quarter past|half past|quarter to|Fifteen.","t|The minute hand moves faster than the hour hand.|T|Yes."])
T(M,"the-surajkund-fair","line-symmetry-and-folding","Line symmetry and folding","Meena folded a paper heart and cut it. When opened it was the same on both sides.\n\"That is symmetry,\" said her teacher.",
 ["A shape is symmetric if folding it along a line makes the two halves match. The fold line is the line of symmetry.","A butterfly, a leaf and the letter A are symmetric. A circle can be folded in many ways.","We can make symmetric patterns by folding paper, cutting and opening."],
 ["symmetry","fold","line of symmetry"],("Is the letter A symmetric?",[("Fold A down the middle.","Fold."),("Both halves match.","Match."),("Yes, A is symmetric.","Answer.")]),
 ("every shape is symmetric.",["Some shapes are not symmetric.","Halves must match when folded."],["Assuming all."]),
 ["Folding makes halves match.","Not every shape is symmetric."],
 ["m|A butterfly is|symmetric|not symmetric|a square|Wings.","t|The fold line is the line of symmetry.|T|Yes.","m|The letter A is|symmetric|not symmetric|a number|Middle.","t|Every shape is symmetric.|F|Not all.","m|When folded the halves|match|differ|vanish|Match.","s|The fold line is the line of ___ . One word.|symmetry|Symmetry.","m|A leaf can be|symmetric|only round|none|Leaf.","t|Folding paper helps make symmetry.|T|Yes."])
