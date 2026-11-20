from gen5_common import *
import mark_add
S=dict(cls=4,subj="maths",subj_file="maths")
def M(*a): L(S,*a)
# --- Ch 10 Elephants, Tigers and Leopards (estimation, hundreds/thousands, ordering)
M("elephants-tigers-and-leopards","estimating-to-nearest-tens-and-hundreds","Estimating to the nearest ten and hundred",
 "At the elephant park, Meena counted 478 visitors.\n\"About how many?\" asked the guard. \"About 480,\" said Meena, \"or about 500.\"",
 ["Estimating means finding a number that is close to the real number. To round to the nearest ten, look at the ones digit. If it is 5 or more, go up to the next ten. If it is less than 5, stay at the lower ten.","So 478 is about 480 to the nearest ten. To round to the nearest hundred, look at the tens digit. 478 has 7 tens, so it goes up to 500. 421 has 2 tens, so it goes down to 400.","Estimates help us check answers quickly. 398 plus 203 is about 400 plus 200, which is 600."],
 ["estimate","round","nearest ten","nearest hundred"],
 ("Round 635 to the nearest ten and to the nearest hundred.",["The ones digit is 5, so round up to 640.","For hundreds look at the tens digit, 3. It is less than 5, so stay at 600.","So 635 is about 640 and about 600."]),
 ("rounding 478 to the nearest hundred gives 400.",["Look at the tens digit, 7.","7 is 5 or more, so 478 goes up to 500."]),
 ["An estimate is close to the real number.","Look at the digit to the right to round.","5 or more rounds up."],
 [("478 rounded to the nearest ten","480","470","500"),("421 rounded to the nearest hundred","400","500","420"),("A ones digit of 5 or more makes us round","up","down","to zero"),("398 + 203 is about","600","500","700")],
 ("Estimating finds a number close to the real number.","Rounding 349 to the nearest hundred gives 400."),("Round 76 to the nearest ten. Number only.","80"))
M("elephants-tigers-and-leopards","adding-subtracting-and-multiplying-in-hundreds-and-thousands","Adding, subtracting and multiplying in hundreds and thousands",
 "Ria read that one forest had 1,200 elephants and another had 800.\n\"How many in all?\" she asked her teacher.",
 ["We can add and subtract numbers in hundreds and thousands by treating them as groups. 1,200 plus 800 is 12 hundreds plus 8 hundreds, which is 20 hundreds or 2,000.","For subtraction, 3,000 minus 1,200 is 30 hundreds minus 12 hundreds, which is 18 hundreds or 1,800.","For multiplication, 300 times 4 is 3 hundreds times 4, which is 12 hundreds or 1,200. Always keep the zeros in the right place."],
 ["hundreds","thousands","group"],
 ("A forest has 1,200 elephants and another has 800. How many in all?",["Think 12 hundreds plus 8 hundreds.","12 plus 8 is 20, so 20 hundreds.","20 hundreds is 2,000 elephants."]),
 ("300 times 4 is 120.",["3 hundreds times 4 is 12 hundreds.","12 hundreds is 1,200."]),
 ["Treat hundreds and thousands as groups.","Add, subtract or multiply the groups.","Keep the zeros in place."],
 [("1,200 + 800","2,000","1,000","2,200"),("3,000 - 1,200","1,800","2,200","1,200"),("300 x 4","1,200","120","12,000"),("500 x 2","1,000","100","700")],
 ("20 hundreds make 2,000.","400 x 5 is 200."),("What is 600 + 700? Number only.","1300;1,300"))
M("elephants-tigers-and-leopards","ordering-numbers-ascending-and-descending","Ordering numbers: ascending and descending",
 "Raju listed the number of leopards in four parks: 320, 1,050, 87 and 645.\n\"Arrange them from smallest to biggest,\" said his teacher.",
 ["Ascending order means arranging numbers from the smallest to the greatest. Descending order means from the greatest to the smallest.","To order numbers, first compare the number of digits. A number with more digits is greater. If the digits are equal, compare from the left, place by place.","So 87, 320, 645, 1,050 is ascending order, and 1,050, 645, 320, 87 is descending order."],
 ["ascending","descending","compare"],
 ("Arrange 320, 1,050, 87 and 645 in ascending order.",["Fewest digits first: 87 is the smallest.","Next compare the 3-digit numbers: 320 is less than 645.","The order is 87, 320, 645, 1,050."]),
 ("645 is greater than 1,050 because 6 is more than 1.",["1,050 has four digits.","A number with more digits is greater."]),
 ["Ascending is smallest to greatest.","Descending is greatest to smallest.","More digits means a greater number."],
 [("The smallest of 87, 320 and 645","87","320","645"),("Ascending order goes from","smallest to greatest","greatest to smallest","the middle outwards"),("The greatest of 87, 320 and 1,050","1,050","320","87"),("Descending order of 20, 5 and 12 is","20, 12, 5","5, 12, 20","12, 5, 20")],
 ("A 4-digit number is greater than a 3-digit number.","Ascending order means greatest to smallest."),("Smallest of 45, 405 and 54? Number only.","45"))
# --- Ch 11 Fun with Symmetry (views, mirror images)
M("fun-with-symmetry","top-front-and-side-views","Top, front and side views",
 "Asha placed a toy house on the table.\n\"From the front it looks like a square with a triangle on top,\" she said.",
 ["An object looks different when we see it from different sides. We call these the top view, the front view and the side view.","A tin can looks like a circle from the top and like a rectangle from the front and the side. A ball looks like a circle from every side.","To draw a view, imagine you are looking at the object from that side only, and draw the outline you see."],
 ["top view","front view","side view"],
 ("What does a tin can look like from the top and from the front?",["From the top we see the round lid.","So the top view is a circle.","From the front we see a rectangle."]),
 ("an object looks the same from every side.",["A tin can is a circle from the top.","From the front it is a rectangle."]),
 ["Objects look different from different sides.","Name the view: top, front or side.","Draw the outline you see."],
 [("A tin can seen from the top looks like a","circle","rectangle","triangle"),("A ball seen from any side looks like a","circle","square","triangle"),("A tin can seen from the front looks like a","rectangle","circle","triangle"),("The view from above is called the","top view","side view","front view")],
 ("An object can look different from different sides.","A ball looks like a square from the top."),("A ball looks like what shape from every side? One word.","circle"))
M("fun-with-symmetry","mirror-images-and-symmetric-patterns","Mirror images and symmetric patterns",
 "Anita held a paper butterfly in front of a mirror.\n\"The mirror shows the same butterfly!\" she said.",
 ["A mirror image is what we see in a mirror. It looks like the object but is flipped, so left and right change places.","A shape is symmetric if a fold line splits it into two parts that match exactly. Paper folding shows this: if the two halves fit on each other, the fold is a line of symmetry.","On a grid we can make a symmetric pattern by colouring squares on one side of a line and the matching squares on the other side at the same distance from the line."],
 ["mirror image","symmetry","line of symmetry"],
 ("Is the letter A symmetric? Find a line of symmetry.",["Imagine a vertical line through the middle of A.","The left half matches the right half.","So A is symmetric with a vertical line of symmetry."]),
 ("the letter F is symmetric.",["Try folding F in any direction.","The halves never match, so F is not symmetric."]),
 ["A mirror image is flipped.","A line of symmetry makes matching halves.","Matching squares lie at equal distance from the line."],
 [("A fold line that makes two matching halves is a line of","symmetry","length","area"),("A mirror image is","flipped left to right","exactly the same side","bigger"),("A butterfly's wings are","symmetric","unmatched","square only"),("In a symmetric grid pattern, matching squares are","at equal distance from the line","at different distances","all on one side")],
 ("A mirror image changes left and right.","A shape with a line of symmetry has unequal halves."),("How many lines of symmetry does a square have? Number only.","4;four"))
# --- Ch 12 Ticking Clocks and Turning Calendar
M("ticking-clocks-and-turning-calendar","time-intervals-and-daily-life-problems","Time intervals and daily-life problems",
 "Ravi's school starts at 8:30 a.m. and ends at 2:30 p.m.\n\"How long is the school day?\" asked his sister.",
 ["The time between a start time and an end time is called the interval or duration. From 8:30 a.m. to 2:30 p.m. is 6 hours.","To find an interval, count on to the next hour and then add the minutes. From 9:15 to 10:00 is 45 minutes and from 10:00 to 10:45 is 45 more, so the interval is 1 hour 30 minutes.","We can also find the end time by adding. A film starts at 4:00 p.m. and runs for 2 hours 30 minutes, so it ends at 6:30 p.m. Remember that 1 hour is 60 minutes."],
 ["interval","duration","a.m. and p.m."],
 ("A film starts at 4:00 p.m. and lasts 2 hours 30 minutes. When does it end?",["Add 2 hours to 4:00 p.m. to get 6:00 p.m.","Now add the 30 minutes.","The film ends at 6:30 p.m."]),
 ("from 9:15 to 10:45 is 1 hour 15 minutes.",["9:15 to 10:00 is 45 minutes.","Add 45 more to reach 10:45. The total is 1 hour 30 minutes."]),
 ["The interval is the time between two times.","Count on to the hour, then the minutes.","1 hour is 60 minutes."],
 [("8:30 a.m. to 2:30 p.m. is","6 hours","5 hours","7 hours"),("1 hour is","60 minutes","100 minutes","30 minutes"),("9:15 to 10:45 is","1 hour 30 minutes","1 hour 15 minutes","2 hours"),("A show starts at 5:00 p.m. and lasts 1 hour 20 minutes. It ends at","6:20 p.m.","6:00 p.m.","5:20 p.m.")],
 ("The time between a start and an end is called the interval.","1 hour has 100 minutes."),("How many minutes are in 2 hours? Number only.","120"))
# --- Ch 13 The Transport Museum (0,1,10,100; hundreds/thousands; distance & money)
M("the-transport-museum","multiplying-and-dividing-with-0-1-10-and-100","Multiplying and dividing with 0, 1, 10 and 100",
 "At the Transport Museum, Meena saw 6 shelves with 10 toy cars on each.\n\"That is 6 times 10,\" she said.",
 ["Any number times 1 stays the same, and any number times 0 is 0. So 7 times 1 is 7 and 7 times 0 is 0.","To multiply by 10, put one zero at the end, so 6 times 10 is 60. To multiply by 100, put two zeros, so 6 times 100 is 600.","Division undoes multiplication. 60 divided by 10 is 6 and 600 divided by 100 is 6. Any number divided by 1 stays the same, and 0 divided by any number is 0."],
 ["multiply","divide","zero"],
 ("Find 35 times 10 and 600 divided by 100.",["To multiply by 10 add one zero: 350.","To divide by 100 take away two zeros: 6.","So the answers are 350 and 6."]),
 ("5 times 0 is 5.",["Zero groups of 5 is nothing.","So 5 times 0 is 0."]),
 ["Times 1 stays the same; times 0 is 0.","Times 10 adds a zero; times 100 adds two zeros.","Division undoes multiplication."],
 [("9 x 0","0","9","90"),("6 x 100","600","60","6,000"),("800 / 10","80","8","800"),("25 / 1","25","1","0")],
 ("Any number times 1 stays the same.","Any number times 0 is the number itself."),("What is 40 x 10? Number only.","400"))
M("the-transport-museum","multiplying-and-dividing-hundreds-and-thousands","Multiplying and dividing hundreds and thousands",
 "The Transport Museum has 4 halls, and each hall shows 300 old vehicle photos.\n\"How many photos in all?\" asked Mira.",
 ["To multiply a number in hundreds, multiply the digits and keep the zeros. 4 times 300 is 4 times 3 hundreds, which is 12 hundreds or 1,200.","For thousands, 3 times 2,000 is 3 times 2 thousands, which is 6 thousands or 6,000.","For division, 1,200 divided by 4 is 12 hundreds shared into 4 groups, which is 3 hundreds or 300. Check by multiplying back: 4 times 300 is 1,200."],
 ["hundreds","thousands","share equally"],
 ("Find 4 times 300 and 1,200 divided by 4.",["4 times 3 hundreds is 12 hundreds, or 1,200.","12 hundreds shared by 4 is 3 hundreds.","So 1,200 divided by 4 is 300."]),
 ("4 times 300 is 120.",["4 times 3 is 12.","300 is 3 hundreds, so 12 hundreds is 1,200."]),
 ["Multiply the digits and keep the zeros.","Divide the hundreds or thousands as groups.","Check division by multiplying back."],
 [("4 x 300","1,200","120","12,000"),("3 x 2,000","6,000","600","5,000"),("1,200 / 4","300","30","3,000"),("900 / 3","300","30","3")],
 ("4 x 300 = 1,200.","3 x 2,000 = 600."),("What is 2 x 500? Number only.","1000;1,000"))
M("the-transport-museum","word-problems-on-distance-and-money","Word problems on distance and money",
 "Ria's class planned a trip to the Transport Museum.\nThe bus ride was 25 km each way and each ticket cost 50 rupees.",
 ["For distance problems, read what is asked. If the museum is 25 km from school, the round trip there and back is 25 plus 25, which is 50 km.","For money problems, 1 rupee is 100 paise. If one ticket costs 50 rupees, 6 tickets cost 6 times 50, which is 300 rupees.","To solve a word problem, first find what we know, then decide whether to add, subtract, multiply or divide, then write the answer with its unit, such as km or rupees."],
 ["round trip","rupee","paise"],
 ("Tickets cost 50 rupees each. What is the cost for 6 children?",["Each ticket is 50 rupees.","Multiply 6 by 50.","The cost is 300 rupees."]),
 ("a round trip of 25 km each way is 25 km.",["Round trip means there and back.","25 plus 25 is 50 km."]),
 ["Decide which operation to use.","A round trip is there and back.","Write the unit in the answer."],
 [("A round trip of 25 km each way","50 km","25 km","100 km"),("6 tickets at 50 rupees each","300 rupees","56 rupees","200 rupees"),("1 rupee is","100 paise","10 paise","1,000 paise"),("A bill of 300 rupees is shared by 3 children. Each pays","100 rupees","900 rupees","30 rupees")],
 ("A round trip means going there and coming back.","1 rupee is 10 paise."),("Cost of 4 tickets at 20 rupees each? Number only.","80"))
# --- Ch 14 Data Handling
M("data-handling","organising-data-and-drawing-inferences","Organising data and drawing inferences",
 "Mira asked 20 classmates for their favourite fruit and wrote the answers in a table.\n\"Now we can see which fruit wins,\" she said.",
 ["Data is information we collect. We can organise it in a table, with a tally mark for each answer. Counting the tally marks tells how many chose each item.","We can show a table as a pictograph, where a picture stands for a number, or as a bar graph, where the height of a bar shows the number.","To draw an inference, read the graph and say what it tells us: which has the most, which has the least, and how much more one is than another."],
 ["data","table","bar graph"],
 ("In a survey, 8 chose mango, 5 chose banana and 7 chose apple. Which is the favourite, and by how many does it lead banana?",["Compare 8, 5 and 7. 8 is the greatest.","So mango is the favourite.","8 minus 5 is 3, so mango leads banana by 3."]),
 ("a graph tells us nothing new.",["We read graphs to find the most and the least.","They help us compare and decide."]),
 ["Collect, organise and show data.","Bars and pictures show numbers.","Read a graph to draw inferences."],
 [("A table with tally marks shows","how many chose each item","only colours","the weather"),("In a bar graph the height of a bar shows","the number","the name only","the colour"),("The least of 8, 5 and 7 is","5","7","8"),("A picture that stands for a number is used in a","pictograph","calendar","clock")],
 ("A bar graph helps us compare numbers.","Data can only be shown in a table."),("If 8 chose mango and 5 chose banana, how many more chose mango? Number only.","3"))
# --- Old lessons that are not in the Maths Mela chapter outline stay, but are labelled
mark_add.mark(4,"maths","elephants-tigers-and-leopards",["numbers-and-their-reverse"])
mark_add.mark(4,"maths","fun-with-symmetry",["rotation-and-turns"])
mark_add.mark(4,"maths","the-transport-museum",["building-the-times-15-table","tables-of-6-7-8-and-9","times-10-and-times-5-tables"])
