import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=3,subj="maths",subj_file="maths")
T(M,"whats-in-a-name","counting-the-letters-in-names","Counting the letters in names","Anu counted the letters in her name: A, N, U. That made 3. Her friend Meenakshi has 9 letters.\n\"Whose name is longer?\" asked Anu.",
 ["Every name can be counted letter by letter. Anu has 3 letters and Ravi has 4 letters.","To compare names, count the letters in each. The name with more letters is longer.","We can also make a tally or a picture graph of how many letters each name has."],
 ["count","longer","shorter"],("Whose name is longer: Ravi or Meena?",[("Ravi has 4 letters.","Count."),("Meena has 5 letters.","Count."),("5 is more than 4, so Meena is longer.","Compare.")]),
 ("the longer name is always the better name.",["A name is longer only when it has more letters.","Length does not make a name better."],["Mixing length with value."]),
 ["Count letters one by one.","More letters means a longer name."],
 ["m|How many letters are in the name Anu?|3|2|4|A N U.","t|Meenakshi is longer than Anu.|T|It has more letters.","m|Which is the shortest?|Om|Ravi|Meena|Two letters.","t|We can make a graph of name lengths.|T|Yes.","m|Ravi has how many letters?|4|3|5|R A V I.","s|How many letters in Meena? Write only the number.|5;five|M E E N A.","m|The longer name has|more letters|fewer letters|no letters|Count.","t|A name with 2 letters is longer than one with 5.|F|5 is more."])
T(M,"toy-joy","counting-and-sorting-toys","Counting and sorting toys","Ravi had a box of toys: 5 balls, 3 cars and 4 dolls.\n\"How many toys are there altogether?\" asked his sister.",
 ["We can sort toys into groups by kind. Balls go with balls and cars go with cars.","To find how many in all, add the groups. 5 balls plus 3 cars plus 4 dolls is 12 toys.","We can also compare groups. There are more balls than cars because 5 is more than 3."],
 ["sort","group","altogether"],("Find the total of 5 balls, 3 cars and 4 dolls.",[("Add 5 and 3 to get 8.","First two."),("Add 4 more to get 12.","Next."),("There are 12 toys.","Total.")]),
 ("we cannot add different toys together.",["We add any things we count.","Different kinds are added to find the total."],["Thinking only same things can be added."]),
 ["Sort into groups.","Add the groups for the total."],
 ["m|5 balls and 3 cars make how many toys?|8|7|2|5+3.","t|We can sort toys into groups.|T|Yes.","m|Which group is bigger: 5 balls or 3 cars?|5 balls|3 cars|Same|5>3.","t|4 dolls and 4 balls make 8.|T|4+4.","m|5 + 3 + 4 =|12|11|13|Add.","s|2 cars and 6 balls make how many toys? Write only the number.|8;eight|2+6.","m|Sorting means putting things in|groups|lines only|bags only|Groups.","t|We cannot add different toys.|F|We can."])
T(M,"double-century","numbers-100-to-200-reading-and-writing","Reading and writing numbers 100 to 200","Raju counted the steps to the temple: one hundred and twenty five.\n\"How do I write that?\" he asked. \"125,\" said the teacher.",
 ["Numbers from 100 to 199 start with one hundred. 100 plus 25 is 125, read as one hundred twenty five.","We can break a number into parts: 148 is 100 plus 40 plus 8.","A number before 150 is smaller than 150, and a number after it is bigger. 149 comes just before 150."],
 ["hundred","expanded","before and after"],("Write 100 + 60 + 3 as one number.",[("Hundreds: 100.","Hundreds."),("Tens: 60 and ones: 3.","Tens and ones."),("So the number is 163.","Answer.")]),
 ("120 is bigger than 150.",["150 is bigger than 120.","Compare tens after hundreds."],["Not comparing tens."]),
 ["100 plus the rest.","Read as hundred and the number."],
 ["m|100 + 25 =|125|152|25|Hundred and twenty five.","t|149 comes just before 150.|T|Yes.","m|Which is bigger?|150|120|110|Compare tens.","t|148 is 100 + 40 + 8.|T|Yes.","m|One hundred and ten is|110|101|1100|Write.","s|Write 100 + 70 + 2 as one number.|172|100+70+2 is 172.","m|The number after 199 is|200|190|100|Next.","t|120 is bigger than 150.|F|150 is bigger."])
T(M,"vacation-with-my-nani-maa","adding-and-subtracting-two-digit-numbers","Adding and subtracting two-digit numbers","Nani gave Asha 45 mangoes and Ravi 38. \"How many mangoes in all?\" asked Nani.\nAsha added the tens and ones.",
 ["To add 45 and 38, add the ones first: 5 plus 8 is 13. Write 3 and carry 1 ten. Then add the tens: 4 plus 3 plus 1 is 8. So the answer is 83.","To subtract 38 from 45, take the ones first. 5 is smaller than 8, so borrow 1 ten. 15 minus 8 is 7 and 3 tens minus 3 tens is 0. The answer is 7.","Check subtraction by adding the answer to the small number: 7 plus 38 is 45."],
 ["carry","borrow","check"],("Find 56 + 27.",[("Ones: 6 plus 7 is 13. Write 3, carry 1.","Ones."),("Tens: 5 plus 2 plus 1 is 8.","Tens."),("So 56 + 27 = 83.","Answer.")]),
 ("we do not need to carry when adding.",["We carry when ones make ten or more.","The carry goes to the tens."],["Forgetting to carry."]),
 ["Start from the ones.","Carry when adding.","Borrow when subtracting."],
 ["m|45 + 38 =|83|73|82|Carry.","t|We start adding from the ones.|T|Yes.","m|56 + 27 =|83|73|79|Carry.","t|We borrow when the top digit is smaller.|T|Yes.","m|45 - 38 =|7|17|83|Borrow.","s|What is 30 + 25? Write only the number.|55|3 tens plus 2 tens plus 5.","m|7 + 38 =|45|35|52|Check.","t|We never check subtraction.|F|We can check by adding."])
T(M,"raksha-bandhan","multiplication-tables-of-2-5-and-10","Tables of 2, 5 and 10","Asha tied 5 rakhis on each of 4 brothers' wrists across the day.\n\"How many rakhis?\" asked her mother. \"4 fives,\" said Asha.",
 ["The table of 2 goes 2, 4, 6, 8, 10. Each answer is 2 more than the one before. The table of 5 goes 5, 10, 15, 20, and the table of 10 goes 10, 20, 30.","Multiplying is adding the same number again and again. 4 times 5 is 5 plus 5 plus 5 plus 5, which is 20.","We write 4 groups of 5 as 4 x 5 = 20. The order does not change the answer: 5 x 4 is also 20."],
 ["times","table","groups of"],("Find 3 x 5.",[("3 groups of 5.","Groups."),("5 plus 5 plus 5.","Repeated addition."),("That is 15.","Answer.")]),
 ("4 x 5 is different from 5 x 4.",["Both are 20.","Order does not change the answer."],["Thinking order matters."]),
 ["Times means groups of.","Count in 2s, 5s and 10s."],
 ["m|4 x 5 =|20|9|25|Four fives.","t|5 x 4 = 4 x 5.|T|Yes.","m|The table of 2 goes|2, 4, 6, 8|2, 3, 4, 5|2, 5, 10, 15|Add 2.","t|3 x 10 = 30.|T|Yes.","m|3 x 5 =|15|8|10|5+5+5.","s|What is 6 x 2? Write only the number.|12|2 six times.","m|Count in tens: 10, 20,|30|25|40|Add 10.","t|4 x 5 is different from 5 x 4.|F|Same."])
T(M,"fair-share","sharing-equally-and-dividing","Sharing equally and dividing","Mother had 12 laddoos to share equally among 4 children.\n\"How many for each?\" she asked. The children counted.",
 ["To share equally every person gets the same number. 12 laddoos among 4 children gives 3 each.","We write this as 12 divided by 4 equals 3. Division is sharing into equal groups.","We can check with multiplication: 4 times 3 is 12."],
 ["share","divide","equal"],("Share 10 sweets equally among 5 children.",[("10 shared by 5.","Divide."),("5 children get 2 each.","Count."),("Check: 5 x 2 = 10.","Check.")]),
 ("equal sharing means one gets more.",["Equal means everyone gets the same.","Unequal sharing is not fair."],["Unequal sharing."]),
 ["Equal sharing gives the same to all.","Check with multiplication."],
 ["m|12 shared among 4 gives|3|4|8|12/4.","t|Equal sharing means the same for each.|T|Yes.","m|10 shared among 5 gives|2|5|10|10/5.","t|4 x 3 = 12.|T|Check.","m|8 shared among 2 gives|4|2|6|8/2.","s|Share 15 among 5. Write only the number.|3;three|15/5.","m|Division means|sharing equally|adding|taking away|Equal groups.","t|Unequal sharing is fair.|F|Not equal."])
T(M,"house-of-hundreds-1","place-value-and-comparing-numbers","Place value and comparing numbers","Mina had 3 hundreds, 4 tens and 5 ones in her counting blocks.\n\"That makes 345,\" she said.",
 ["In a three-digit number the left digit is hundreds, the middle is tens and the right is ones. In 345 the 3 is 300, the 4 is 40 and the 5 is 5.","To compare numbers, compare the hundreds first. If equal, compare tens, then ones. So 345 is greater than 341.","We use greater than, less than and equal to when we compare."],
 ["hundreds","tens","ones","greater"],("Which is greater, 345 or 354?",[("Hundreds are equal.","Compare."),("Tens: 4 and 5. 5 is greater.","Tens."),("So 354 is greater.","Answer.")]),
 ("the last digit decides which number is bigger.",["Start from the hundreds.","Ones matter only if all else is equal."],["Comparing from the right."]),
 ["Hundreds, tens, ones.","Compare from the left."],
 ["m|In 345 the 4 is in the|tens place|ones place|hundreds place|Middle.","t|Compare hundreds first.|T|Yes.","m|Greater of 345 and 354|354|345|Same|Tens.","t|In 345 the 5 means 5 ones.|T|Yes.","m|300 + 40 + 5 =|345|354|435|Add.","s|Which is smaller, 210 or 201? Write the number.|201|Tens.","m|Compare numbers from the|left|right|middle only|Hundreds first.","t|We compare ones first.|F|Hundreds first."])
T(M,"house-of-hundreds-2","subtracting-three-digit-numbers","Subtracting three-digit numbers","The school had 458 books. 235 were given to the library.\n\"How many are left?\" asked the teacher.",
 ["To subtract 235 from 458 start with the ones: 8 minus 5 is 3. Then tens: 5 minus 3 is 2. Then hundreds: 4 minus 2 is 2. The answer is 223.","When the top digit is smaller, borrow from the next place. 342 minus 117: 2 is smaller than 7, so borrow a ten and do 12 minus 7.","Check by adding the answer to the number taken away."],
 ["borrow","difference","check"],("Find 342 - 117.",[("Ones: borrow, 12 minus 7 is 5.","Ones."),("Tens: 3 minus 1 is 2.","Tens."),("Hundreds: 3 minus 1 is 2. The answer is 225.","Hundreds.")]),
 ("we subtract from the hundreds first.",["Start from the ones.","Borrow when needed."],["Starting at hundreds."]),
 ["Start from ones.","Borrow when the top is smaller."],
 ["m|458 - 235 =|223|233|693|Subtract.","t|We start from the ones.|T|Yes.","m|342 - 117 =|225|235|215|Borrow.","t|We can check by adding.|T|Yes.","m|500 - 200 =|300|700|400|Hundreds.","s|What is 250 - 100? Write only the number.|150|2 hundreds minus 1.","m|Difference means|subtraction answer|sum|product|Taking away.","t|We never borrow.|F|We borrow."])
T(M,"fun-at-class-party","metres-and-centimetres","Metres and centimetres","The class measured the party ribbon: 2 metres and 50 centimetres long.\n\"How many centimetres is that?\" asked Raju.",
 ["We measure short lengths in centimetres (cm) and longer lengths in metres (m). 100 cm make 1 m.","2 m 50 cm is 200 plus 50, which is 250 cm.","We measure with a ruler for small things and a measuring tape for long things."],
 ["centimetre","metre","ruler"],("Change 1 m 20 cm into centimetres.",[("1 m is 100 cm.","Convert."),("Add 20 cm.","Add."),("120 cm.","Answer.")]),
 ("a pencil is measured in metres.",["A pencil is short.","We use centimetres."],["Wrong unit."]),
 ["100 cm = 1 m.","Short: cm. Long: m."],
 ["m|1 m is how many cm?|100|10|1000|100 cm.","t|A ruler measures short lengths.|T|Yes.","m|2 m 50 cm in cm|250|25|205|200+50.","t|A pencil is measured in metres.|F|cm.","m|The room's width is measured in|metres|millimetres|grams|Long.","s|How many cm in 3 m? Write only the number.|300|3x100.","m|A tape measures|long lengths|weights|time|Length.","t|100 cm make 1 m.|T|Yes."])
T(M,"filling-and-lifting","comparing-weights-and-capacities","Comparing weights and capacities","Meena carried 2 kg of rice and 1 litre of milk home.\n\"Which is heavier?\" asked her brother.",
 ["We measure weight in grams and kilograms. 1000 grams make 1 kilogram. We measure how much liquid in millilitres and litres. 1000 ml make 1 litre.","We use a balance to compare weights and a measuring jug for liquids.","Half a kilogram is 500 grams and half a litre is 500 millilitres."],
 ["kilogram","litre","balance"],("How many grams are in 2 kg?",[("1 kg is 1000 g.","Fact."),("2 x 1000 is 2000.","Multiply."),("2 kg is 2000 g.","Answer.")]),
 ("we measure milk in kilograms.",["Milk is a liquid.","We use litres."],["Wrong unit."]),
 ["1 kg = 1000 g.","1 litre = 1000 ml."],
 ["m|1 kg is how many g?|1000|100|10|1000.","t|Half a litre is 500 ml.|T|Yes.","m|We measure milk in|litres|kilometres|minutes|Liquid.","t|A balance compares weights.|T|Yes.","m|Half a kg is|500 g|50 g|5 g|Half.","s|How many ml in 1 litre? Write only the number.|1000|Fact.","m|A jug measures|liquids|weights|length|Capacity.","t|We measure milk in kilograms.|F|Litres."])
T(M,"give-and-take","making-bills-and-change","Making bills and change","Ravi bought a pen for 12 rupees and a book for 25 rupees. He gave 50 rupees.\n\"How much change?\" asked the shopkeeper.",
 ["To find the total bill, add the prices. 12 plus 25 is 37 rupees.","To find change, subtract the bill from the money given. 50 minus 37 is 13 rupees.","Rupees and paise: 100 paise make 1 rupee."],
 ["bill","change","rupee"],("Bill is 37 rupees. Ravi gives 50 rupees. Find the change.",[("Money given is 50.","Given."),("Subtract 50 minus 37.","Subtract."),("Change is 13 rupees.","Answer.")]),
 ("the change is bill plus money given.",["Change is money given minus the bill.","We subtract."],["Adding instead."]),
 ["Add for the bill.","Subtract for change."],
 ["m|12 + 25 =|37|27|47|Add.","t|100 paise make 1 rupee.|T|Yes.","m|Bill 37, given 50. Change is|13|87|23|50-37.","t|Change is found by subtracting.|T|Yes.","m|Bill 20, given 50. Change is|30|70|20|Subtract.","s|Bill 45, given 50. Change? Write only the number.|5|50-45.","m|A bill is the|total price|change|coin|Total.","t|Change is bill plus money given.|F|Subtract."])
T(M,"time-goes-on","days-weeks-and-months","Days, weeks and months","Anu's birthday is in a month. \"How many days is that?\" asked her friend.\nAnu looked at the calendar.",
 ["There are 7 days in a week and 12 months in a year. The days are Sunday, Monday, Tuesday, Wednesday, Thursday, Friday and Saturday.","Some months have 30 days and some have 31. February has 28 days, or 29 in a leap year.","A calendar shows days, weeks and months. We can find a date by counting along the row."],
 ["week","month","calendar"],("How many days are in 2 weeks?",[("1 week is 7 days.","Fact."),("2 x 7 is 14.","Multiply."),("2 weeks is 14 days.","Answer.")]),
 ("a week has 10 days.",["A week has 7 days.","The week repeats."],["Wrong number."]),
 ["7 days = 1 week.","12 months = 1 year."],
 ["m|Days in a week|7|5|10|Seven.","t|There are 12 months in a year.|T|Yes.","m|Days in 2 weeks|14|7|10|2 x 7.","t|February has 31 days.|F|28.","m|The day after Monday is|Tuesday|Sunday|Wednesday|Next.","s|How many months in a year? Write only the number.|12;twelve|Fact.","m|A calendar shows|days and months|only weeks|only years|Dates.","t|A week has 10 days.|F|7."])
T(M,"the-surajkund-fair","making-patterns-with-shapes-and-numbers","Making patterns with shapes and numbers","At the fair, Meena saw a border: circle, triangle, circle, triangle.\n\"What comes next?\" asked her friend. \"A circle,\" said Meena.",
 ["A pattern repeats in a fixed way. In circle, triangle, circle, triangle the unit that repeats is circle, triangle.","Number patterns follow a rule. 2, 4, 6, 8 adds 2 each time, so the next is 10.","We can make our own patterns with colours, shapes and numbers."],
 ["pattern","repeat","rule"],("Find the next number in 5, 10, 15, 20.",[("The numbers go up by 5.","Rule."),("20 plus 5 is 25.","Apply."),("The next is 25.","Answer.")]),
 ("patterns have no rule.",["Every pattern has a rule.","The rule tells what comes next."],["Random view."]),
 ["A pattern repeats.","Find the rule to continue."],
 ["m|Next in 2, 4, 6, 8|10|9|12|Add 2.","t|Patterns follow a rule.|T|Yes.","m|Next: circle, triangle, circle,|triangle|square|circle|Repeat.","t|The unit repeats.|T|Yes.","m|Next in 10, 20, 30|40|35|50|Add 10.","s|Next in 5, 10, 15, 20? Write only the number.|25|Add 5.","m|A pattern needs a|rule|key|bell|Rule.","t|Patterns have no rule.|F|They do."])
