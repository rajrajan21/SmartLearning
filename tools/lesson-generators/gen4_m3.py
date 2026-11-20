import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=4,subj="maths",subj_file="maths")
def L(ch,slug,en,story,exp,terms,ex,claim,summ,quiz): T(M,ch,slug,en,story,exp,terms,ex,claim,summ,quiz)
L("shapes-around-us","nets-and-building-solids","Nets and building solids","Meena cut out a cross-shaped paper and folded it into a box.\n\"That flat shape is a net,\" said her teacher.",
 ["A net is a flat pattern that folds into a solid. A cube has a net of 6 squares.","A cuboid net has 6 rectangles. A cylinder net has 2 circles and 1 rectangle.","Counting the faces of a net tells us which solid it makes."],
 ["net","fold","face"],("How many squares are in a cube net?",[("A cube has 6 faces.","Faces."),("Each face is a square.","Shape."),("So the net has 6 squares.","Answer.")]),
 ("a cube net has 4 squares.",["A cube has 6 faces.","So 6 squares are needed."],["Wrong count."]),
 ["A net folds into a solid.","A cube net has 6 squares."],
 ["m|A net is a|flat pattern|solid ball|sound|Flat.","t|A cube net has 6 squares.|T|Yes.","m|A cylinder net has|2 circles and a rectangle|6 squares|4 triangles|Cylinder.","t|A cube net has 4 squares.|F|Six.","m|Folding a net makes a|solid|line|dot|Fold.","s|Faces of a cube? Write only the number.|6;six|Six.","m|A cuboid net has 6|rectangles|circles|stars|Cuboid.","t|Counting faces helps identify a solid.|T|Yes."])
L("hide-and-seek","giving-and-following-directions","Giving and following directions","Ravi told his friend, \"Go straight, turn left at the tree and the park is on your right.\"\n\"That is easy,\" said his friend.",
 ["We use left, right, straight, forward, behind, near and far to give directions. Landmarks like a tree or a shop help.","A turn to the left or right is a quarter turn. Two quarter turns face us the other way.","Giving clear steps helps someone reach a place without getting lost."],
 ["left","right","landmark"],("Give directions from school to the park.",[("Go straight to the shop.","Straight."),("Turn left at the shop.","Turn."),("The park is on the right.","Arrive.")]),
 ("left and right mean the same.",["They are opposite sides.","Mixing them gets us lost."],["Confusing sides."]),
 ["Use landmarks and turns.","Left and right differ."],
 ["m|A tree or shop used in directions is a|landmark|pencil|net|Landmark.","t|Left and right are opposite.|T|Yes.","m|Two quarter turns make a|half turn|full turn|no turn|Two.","t|Left and right mean the same.|F|Opposite.","m|Go ___ means keep moving ahead.|straight|behind|back|Straight.","s|Opposite of left? One word.|right|Right.","m|Clear steps help us|reach a place|get lost|sleep|Clear.","t|Landmarks help in directions.|T|Yes."])
L("pattern-around-us","finding-rules-in-patterns","Finding rules in patterns","Asha saw the pattern 3, 6, 9, 12 on a bus ticket.\n\"Each number is 3 more,\" she said.",
 ["A pattern follows a rule. In 3, 6, 9, 12 the rule is add 3. In 100, 90, 80 the rule is subtract 10.","To find a rule, look at the difference between neighbouring numbers. If it is the same each time, we can extend the pattern.","Shape patterns repeat too, such as circle, square, circle, square."],
 ["pattern","rule","extend"],("Find the rule: 5, 10, 15, 20.",[("10 minus 5 is 5.","Difference."),("15 minus 10 is 5.","Same."),("The rule is add 5.","Rule.")]),
 ("the rule in 2, 4, 8 is add 2.",["2 to 4 is add 2 but 4 to 8 is add 4.","The difference is not constant."],["Not constant."]),
 ["Find the difference.","Use the rule to extend."],
 ["m|Rule for 3, 6, 9, 12|add 3|add 2|subtract 3|Gap.","t|A pattern follows a rule.|T|Yes.","m|Next in 5, 10, 15|20|25|30|Add 5.","t|2, 4, 8 has the rule add 2.|F|No.","m|Rule for 100, 90, 80|subtract 10|add 10|add 100|Down.","s|Next after 20, 30, 40? Write only the number.|50|Add 10.","m|Circle, square, circle, square repeats|two shapes|nothing|one shape|Repeat.","t|Equal differences give a number pattern.|T|Yes."])
L("thousands-around-us","rounding-and-expanding-numbers","Rounding and expanding numbers","A school bought 4,382 books.\n\"About how many?\" asked Ravi. \"About 4,400,\" said the teacher.",
 ["Expanded form splits a number by place value. 4,382 is 4000 plus 300 plus 80 plus 2.","To round to the nearest ten, look at the ones digit. If it is 5 or more, round up. 4,382 rounds to 4,380.","To round to the nearest hundred, look at the tens digit. 4,382 rounds to 4,400."],
 ["expanded form","round","nearest"],("Round 4,382 to the nearest hundred.",[("Look at the tens digit 8.","Tens."),("8 is 5 or more so round up.","Up."),("The answer is 4,400.","Answer.")]),
 ("4,382 rounds to 4,300 for the nearest hundred.",["The tens digit is 8, so round up.","The answer is 4,400."],["Not rounding up."]),
 ["Expand by place value.","5 or more rounds up."],
 ["m|4000 + 300 + 80 + 2 =|4382|4328|4832|Expanded.","t|Round up if the digit is 5 or more.|T|Yes.","m|4382 to the nearest hundred|4400|4300|4000|Round.","t|4382 rounds to 4300 for nearest hundred.|F|4400.","m|4382 to the nearest ten|4380|4390|4400|Ones 2.","s|Round 76 to the nearest ten. Write only the number.|80|Up.","m|Expanded form shows|place values|colours|sounds|Place.","t|Rounding gives an approximate number.|T|Yes."])
L("sharing-and-measuring","fractions-on-the-number-line","Fractions on a number line","Meena marked half on a ruler between 0 and 1.\n\"Fractions live between whole numbers,\" said her teacher.",
 ["A number line from 0 to 1 can be divided into equal parts. Divide into 4 parts and the marks are one quarter, two quarters, three quarters and one whole.","Two quarters is the same as one half. Fractions that show the same amount are equivalent.","The bigger the numerator for the same denominator, the larger the fraction."],
 ["numerator","denominator","equivalent"],("Is two quarters equal to a half?",[("Divide 0 to 1 in 4 parts.","Parts."),("Two quarters is halfway.","Half."),("Yes, they are equal.","Answer.")]),
 ("one third is bigger than one half.",["Larger denominator means smaller parts.","One half is bigger."],["Denominator confusion."]),
 ["Fractions lie between whole numbers.","Equivalent fractions are equal."],
 ["m|Two quarters equals|one half|one whole|one third|Half.","t|Fractions can be placed on a number line.|T|Yes.","m|The bottom number is the|denominator|numerator|sum|Bottom.","t|One third is bigger than one half.|F|Smaller.","m|3/4 is larger than|1/4|4/4|5/4|Same parts.","s|2/4 equals what half? Write 1/2.|1/2|Half.","m|Equal parts are needed to|show fractions|make noise|add|Equal.","t|Equivalent fractions show the same amount.|T|Yes."])
L("measuring-length","perimeter-and-measuring-around","Measuring around shapes","Raju walked along the edge of the rectangular park.\n\"How far did I walk?\" he asked.",
 ["The distance around a shape is its perimeter. Add the lengths of all the sides.","A rectangle 8 metres long and 5 metres wide has a perimeter of 8 plus 5 plus 8 plus 5, which is 26 metres.","A square with side 6 cm has a perimeter of 6 plus 6 plus 6 plus 6, which is 24 cm."],
 ["perimeter","side","around"],("Find the perimeter of a rectangle 8 m by 5 m.",[("Add all four sides.","Add."),("8 plus 5 plus 8 plus 5.","Sum."),("The perimeter is 26 m.","Answer.")]),
 ("perimeter is the space inside a shape.",["Perimeter is the distance around.","Space inside is area."],["Perimeter vs area."]),
 ["Perimeter is distance around.","Add all sides."],
 ["m|Perimeter is the distance|around a shape|inside a shape|up|Around.","t|We add all sides to find perimeter.|T|Yes.","m|Square side 6 cm perimeter|24 cm|12 cm|36 cm|4 x 6.","t|Perimeter is the space inside.|F|Around.","m|Rectangle 8 m by 5 m perimeter|26 m|13 m|40 m|Add all.","s|Square side 3 cm perimeter in cm? Write only the number.|12|4 x 3.","m|A square has ___ equal sides.|4|3|5|Four.","t|Perimeter uses units of length.|T|Yes."])
L("the-cleanest-village","estimating-sums-and-differences","Estimating sums and differences","The village planted 4,980 trees in one year and 3,020 in another.\n\"About 8,000 in all,\" said the sarpanch.",
 ["To estimate, round each number first and then add or subtract. 4,980 rounds to 5,000 and 3,020 to 3,000. So the total is about 8,000.","An estimate is quick and tells us whether an exact answer is sensible.","Exact: 4,980 plus 3,020 is 8,000 and is close to the estimate."],
 ["estimate","round","sensible"],("Estimate 6,030 minus 2,980.",[("Round to 6,000 and 3,000.","Round."),("6,000 minus 3,000 is 3,000.","Subtract."),("About 3,000.","Answer.")]),
 ("an estimate is always exactly right.",["An estimate is close, not exact.","It checks the exact answer."],["Estimate vs exact."]),
 ["Round first.","Estimate to check."],
 ["m|Estimate 4,980 + 3,020|8,000|7,000|9,000|Round.","t|Estimates are close not exact.|T|Yes.","m|Round 6,030 to the nearest thousand|6,000|7,000|5,000|Down.","t|An estimate is always exactly right.|F|Close.","m|Estimating helps to|check answers|waste time|sleep|Check.","s|Estimate 1,990 + 2,010. Write only the number.|4000|Round.","m|We round before we|estimate|sleep|sing|Estimate.","t|Estimating is quick.|T|Yes."])
L("weigh-it-pour-it","comparing-and-converting-units","Comparing and converting units","Asha bought 2 kg of rice and 500 g of dal.\n\"Which is heavier?\" asked her mother.",
 ["1 kilogram is 1000 grams and 1 litre is 1000 millilitres. To compare, change both amounts to the same unit.","2 kg is 2000 g, which is more than 500 g.","Heavier things have more weight; things that hold more liquid have more capacity."],
 ["kilogram","gram","litre"],("Which is more: 2 kg or 1500 g?",[("2 kg is 2000 g.","Convert."),("2000 is more than 1500.","Compare."),("2 kg is more.","Answer.")]),
 ("1 kg is 100 g.",["1 kg is 1000 g.","Convert carefully."],["Wrong factor."]),
 ["1 kg = 1000 g.","1 L = 1000 ml."],
 ["m|1 kg =|1000 g|100 g|10 g|Thousand.","t|1 litre is 1000 ml.|T|Yes.","m|2 kg in grams|2000|200|20|x1000.","t|1 kg is 100 g.|F|1000.","m|More: 2 kg or 500 g|2 kg|500 g|equal|2000 g.","s|3 L in ml? Write only the number.|3000|x1000.","m|To compare we use the|same unit|different units|no unit|Same.","t|2000 g equals 2 kg.|T|Yes."])
L("equal-groups","multiplication-word-problems-and-arrays","Multiplication word problems and arrays","Ravi arranged his marbles in 4 rows of 6.\n\"That is 24,\" he said.",
 ["An array is objects arranged in rows and columns. 4 rows of 6 make 24 so 4 times 6 is 24.","A multiplication story such as 5 bags with 8 apples each is 5 times 8, which is 40.","We can turn the array to see that 6 times 4 is also 24."],
 ["array","row","column"],("5 bags have 8 apples each. How many apples?",[("Equal groups of 8.","Groups."),("5 times 8.","Multiply."),("40 apples.","Answer.")]),
 ("4 x 6 is different from 6 x 4.",["Both are 24.","Order does not change the product."],["Order confusion."]),
 ["Arrays show multiplication.","Order does not change the product."],
 ["m|4 rows of 6 make|24|10|64|4x6.","t|4 x 6 equals 6 x 4.|T|Yes.","m|5 bags of 8 apples|40|13|45|5x8.","t|4 x 6 is different from 6 x 4.|F|Same.","m|An array has rows and|columns|circles|lines only|Array.","s|3 x 7? Write only the number.|21|Table.","m|Equal groups suggest|multiplication|subtraction|nothing|Groups.","t|Arrays help see multiplication.|T|Yes."])
L("elephants-tigers-and-leopards","comparing-numbers-in-word-problems","Comparing numbers in word problems","There are 2,967 tigers in one state and 1,800 in another.\n\"How many more?\" asked Meena.",
 ["To find how many more, subtract the smaller from the bigger. 2,967 minus 1,800 is 1,167.","To find the total, add. 2,967 plus 1,800 is 4,767.","Read whether the question wants more, fewer or in all."],
 ["more","fewer","total"],("How many more tigers: 2,967 and 1,800?",[("Bigger minus smaller.","Plan."),("2,967 minus 1,800.","Subtract."),("1,167 more.","Answer.")]),
 ("how many more means add.",["More than means find the difference.","We subtract."],["Wrong operation."]),
 ["More means subtract.","Total means add."],
 ["m|2967 - 1800 =|1167|4767|1267|Subtract.","t|In all means add.|T|Yes.","m|2967 + 1800 =|4767|1167|3767|Add.","t|How many more means add.|F|Subtract.","m|Fewer means|less|more|equal|Less.","s|500 + 300? Write only the number.|800|Add.","m|To compare numbers we use|subtraction|nothing|colours|Difference.","t|We read the question carefully.|T|Yes."])
L("fun-with-symmetry","rotation-and-turns","Rotation and turns","Raju turned the paper windmill and it looked the same again after a quarter turn.\n\"It has rotational symmetry,\" said the teacher.",
 ["A shape can be turned around a point. If it looks the same after a turn, it has rotational symmetry.","A square looks the same after a quarter turn. A windmill with four blades matches after each quarter turn.","Line symmetry is folding. Rotational symmetry is turning."],
 ["rotation","turn","quarter turn"],("Does a square look the same after a quarter turn?",[("Turn the square one quarter.","Turn."),("The corners swap places.","Match."),("Yes, it looks the same.","Answer.")]),
 ("rotation means folding.",["Rotation means turning.","Folding is line symmetry."],["Mixing the two."]),
 ["Rotation means turning.","Line symmetry means folding."],
 ["m|A square matches after a|quarter turn|fold only|nothing|Square.","t|Rotation means turning.|T|Yes.","m|Folding shows|line symmetry|rotation|sound|Fold.","t|Rotation means folding.|F|Turning.","m|A four-blade windmill matches after|a quarter turn|no turn|a throw|Windmill.","s|A full turn is ___ quarter turns. Write the number.|4|Four.","m|A shape turns around a|point|word|sound|Point.","t|Some shapes have both kinds.|T|Yes."])
L("ticking-clocks-and-turning-calendar","am-pm-and-24-hour-time","AM, PM and the calendar year","The train leaves at 6 in the evening.\n\"That is 6 PM,\" said Anu.",
 ["AM means before noon and PM means after noon. 7 AM is morning and 7 PM is evening.","A day has 24 hours. Midnight is 12 AM and noon is 12 PM.","A year has 12 months and 365 days; a leap year has 366 days."],
 ["AM","PM","leap year"],("Is school at 8 in the morning AM or PM?",[("Morning is before noon.","Time."),("Before noon is AM.","Mark."),("It is 8 AM.","Answer.")]),
 ("7 PM is in the morning.",["PM is after noon.","7 PM is evening."],["AM vs PM."]),
 ["AM is before noon.","A year has 12 months."],
 ["m|Morning time is|AM|PM|none|Before noon.","t|A day has 24 hours.|T|Yes.","m|A leap year has|366 days|365 days|300 days|Leap.","t|7 PM is in the morning.|F|Evening.","m|Noon is|12 PM|12 AM|6 AM|Noon.","s|Months in a year? Write only the number.|12|Twelve.","m|Hours in a day|24|12|60|Day.","t|PM means after noon.|T|Yes."])
L("the-transport-museum","tables-of-6-7-8-and-9","Multiplication tables of 6, 7, 8 and 9","At the museum, Meena counted 6 wheels on each of 7 old carts.\n\"6 times 7 is 42,\" she said.",
 ["We can build tables by adding. 6, 12, 18, 24 and so on. The 9 table has a trick: digits of each answer add to 9, like 18 and 27.","7 times 8 is 56 and 8 times 9 is 72.","We can use known facts: 7 times 8 is 7 times 4 doubled."],
 ["table","product","double"],("What is 7 times 8?",[("Think 7 times 4 is 28.","Half."),("Double 28 is 56.","Double."),("7 times 8 is 56.","Answer.")]),
 ("6 x 7 is 36.",["6 x 6 is 36.","6 x 7 is 42."],["Off by one group."]),
 ["Build tables by adding.","Use doubling and tricks."],
 ["m|6 x 7 =|42|36|48|Table.","t|The digits of 9 x 3 = 27 add to 9.|T|Yes.","m|7 x 8 =|56|54|63|Double.","t|6 x 7 is 36.|F|42.","m|8 x 9 =|72|64|81|Table.","s|9 x 4? Write only the number.|36|Table.","m|9 x 2 =|18|27|9|Table.","t|Doubling helps in tables.|T|Yes."])
L("data-handling","collecting-data-and-making-tables","Collecting data and making tables","Meena asked 20 classmates about their favourite fruit and noted it down.\n\"Now I can make a table,\" she said.",
 ["Data is information we collect. We can ask questions, count and record in tally marks.","A table lists items and counts in rows. We can then draw a bar graph from it.","Reading a table tells us which is most popular and which is least."],
 ["data","tally","table"],("Favourite fruit: mango 8, apple 5, banana 7. Which is most popular?",[("Compare 8, 5 and 7.","Compare."),("8 is biggest.","Biggest."),("Mango is most popular.","Answer.")]),
 ("data is only numbers on a clock.",["Data is any information collected.","Counts and tallies are data."],["Narrow idea."]),
 ["Collect, tally, tabulate.","Read the table for answers."],
 ["m|Data is|collected information|a clock|noise|Info.","t|A table lists counts.|T|Yes.","m|Most popular fruit is the one with the|highest count|lowest count|none|Highest.","t|Data is only numbers on a clock.|F|Any info.","m|Tally marks group in|fives|tens only|ones only|Five.","s|8 minus 5 = ? Write only the number.|3|Subtract.","m|A bar graph is drawn from a|table|dream|song|Table.","t|We can ask questions to collect data.|T|Yes."])
