from gen5_common import *
S=dict(cls=5,subj="maths",subj_file="maths")
def M(*a): L(S,*a)
M("grandmothers-quilt","area-by-counting-squares","Area by counting squares","Grandmother stitched a quilt from square patches.\n\"How many patches cover it?\" asked Asha.",
 ["Area is the amount of surface a shape covers. We can find it by counting unit squares.","A rectangle 4 squares long and 3 squares wide has 12 squares, so its area is 12 square units.","Area is measured in square units such as square centimetres (sq cm)."],
 ["area","square unit","cover"],("Find the area of a 4 by 3 rectangle of squares.",["Count the squares in one row: 4.","There are 3 rows.","4 times 3 is 12 square units."]),
 ("area means the distance around.",["Distance around is perimeter.","Area is the surface covered."]),["Area is surface covered.","Count unit squares."],
 [("Area of a 4 by 3 rectangle","12 square units","7 square units","14 square units"),("Area is measured in","square units","metres only","litres"),("Perimeter is the distance","around","inside","above"),("A quilt covering uses","area","weight","volume")],
 ("Area is the space a shape covers.","Area is the distance around a shape."),("A 5 by 2 rectangle has area? Number only.","10"))
M("grandmothers-quilt","area-of-rectangles-and-squares","Area of rectangles and squares","Ravi measured his quilt: 6 patches long and 5 patches wide.\n\"That is 30 patches,\" he said.",
 ["The area of a rectangle is length times width. A rectangle of 6 cm by 5 cm has an area of 30 square cm.","A square has equal sides, so its area is side times side. A square of side 4 cm has area 16 square cm.","Do not mix up area and perimeter: perimeter adds the sides, area multiplies them."],
 ["length","width","area"],("Find the area of a rectangle 8 cm by 5 cm.",["Area is length times width.","8 times 5 is 40.","The area is 40 square cm."]),
 ("area of a square of side 4 is 8.",["Side times side is 4 times 4.","That is 16."]),["Rectangle area = length x width.","Square area = side x side."],
 [("Area of 8 cm by 5 cm","40 sq cm","26 sq cm","13 sq cm"),("Area of a square of side 4 cm","16 sq cm","8 sq cm","12 sq cm"),("Area is found by","multiplying","only adding","subtracting"),("Square of side 3 has area","9 sq cm","6 sq cm","12 sq cm")],
 ("Area of a rectangle is length x width.","Area of a square is side + side."),("Side 5 square area? Number only.","25"))
M("grandmothers-quilt","perimeter-and-quilt-borders","Perimeter and quilt borders","Asha sewed a lace border around the quilt.\n\"How much lace?\" she asked.",
 ["The border length around a shape is its perimeter. Add all the sides.","A rectangle 6 m by 4 m has perimeter 6 plus 4 plus 6 plus 4, which is 20 m. A square of side 5 m has perimeter 20 m.","Perimeter is in simple units like cm or m. Area is in square units."],
 ["perimeter","border","side"],("Find the perimeter of a rectangle 6 m by 4 m.",["Add all four sides.","6 plus 4 plus 6 plus 4.","The perimeter is 20 m."]),
 ("perimeter is measured in square units.",["Perimeter is plain length units.","Area uses square units."]),["Perimeter is the distance around.","Add all sides."],
 [("Perimeter of 6 m by 4 m","20 m","24 m","10 m"),("Square of side 5, perimeter","20","10","25"),("Perimeter is measured in","cm or m","square cm","litres"),("A border goes","around","inside","above")],
 ("Perimeter is the distance around a shape.","Perimeter is the surface a shape covers."),("Perimeter of a square of side 3? Number only.","12"))
M("racing-seconds","seconds-minutes-and-hours","Seconds, minutes and hours","Ravi timed a race on the school ground.\n\"It took 45 seconds,\" said the coach.",
 ["Time is measured in seconds, minutes and hours. 60 seconds make 1 minute and 60 minutes make 1 hour.","A stopwatch measures short times, and a clock measures longer times.","To convert, 2 minutes is 120 seconds and 3 hours is 180 minutes."],
 ["second","minute","stopwatch"],("How many seconds in 2 minutes?",["1 minute is 60 seconds.","Multiply 2 by 60.","So 120 seconds."]),
 ("1 minute is 100 seconds.",["1 minute is 60 seconds.","A clock uses 60."]),["60 s = 1 min.","60 min = 1 hour."],
 [("1 minute =","60 seconds","100 seconds","30 seconds"),("1 hour =","60 minutes","100 minutes","24 minutes"),("2 minutes =","120 seconds","60 seconds","200 seconds"),("A stopwatch measures","short times","length","weight")],
 ("60 seconds make a minute.","60 minutes make a day."),("Minutes in 3 hours? Number only.","180"))
M("racing-seconds","reading-clocks-and-24-hour-time","Reading clocks and 24-hour time","The train leaves at 15:30 by the station board.\n\"That is half past three,\" said Asha.",
 ["The 24-hour clock counts hours from 0 to 24. After 12 noon, we add 12. So 3 pm is 15:00.","12 noon is 12:00 and midnight is 00:00.","To go back to a 12-hour time, subtract 12 from hours above 12. 18:00 is 6 pm."],
 ["24-hour clock","noon","midnight"],("Write 3:30 pm in 24-hour time.",["3 pm is 3 plus 12.","That is 15.","So 15:30."]),
 ("15:00 is 5 pm.",["15 minus 12 is 3.","So 15:00 is 3 pm."]),["After noon add 12.","Midnight is 00:00."],
 [("3:30 pm in 24-hour time","15:30","13:30","03:30"),("18:00 is","6 pm","8 pm","6 am"),("Noon is","12:00","00:00","24:00"),("Midnight is","00:00","12:00","06:00")],
 ("20:00 is 8 pm.","Noon is 00:00."),("21:00 as pm: write only the hour number.","9"))
M("racing-seconds","duration-and-time-problems","Duration and time problems","Asha's race started at 4:10 and ended at 4:40.\n\"How long did it last?\" asked Ravi.",
 ["Duration is how long something takes. Subtract the start time from the end time. 4:40 minus 4:10 is 30 minutes.","If a film runs from 5:45 to 7:15, count to 6:00 (15 min), then to 7:00 (60 min), then 15 min more, which is 1 hour 30 minutes.","Always check am and pm."],
 ["duration","start","end"],("A film runs from 5:45 to 7:15. How long?",["5:45 to 6:00 is 15 minutes.","6:00 to 7:00 is 60 minutes, then 15 more.","Total 1 hour 30 minutes."]),
 ("to find duration we add start and end.",["We subtract start from end.","Adding gives a meaningless number."]),["Duration = end - start.","Check am and pm."],
 [("4:40 - 4:10 =","30 minutes","50 minutes","1 hour"),("5:45 to 7:15 is","1 hour 30 minutes","2 hours","1 hour"),("Duration means","how long","how heavy","how far"),("To find duration we","subtract","multiply","ignore")],
 ("Duration is how long something takes.","Duration is the start time."),("Minutes from 2:00 to 2:45? Number only.","45"))
M("animal-jumps","comparing-lengths-of-jumps","Comparing lengths of jumps","A frog jumped 90 cm and a kangaroo jumped 7 m.\n\"Which went farther?\" asked Ravi.",
 ["To compare lengths, use the same unit. 7 m is 700 cm and the frog jumped 90 cm, so the kangaroo went farther.","The difference is 700 minus 90, which is 610 cm.","A table helps us line up animals with their jumps."],
 ["compare","jump","difference"],("Compare 90 cm and 7 m.",["Change 7 m to 700 cm.","Compare 700 and 90.","700 is greater."]),
 ("90 cm is more than 7 m.",["7 m is 700 cm.","So 7 m is more."]),["Use the same unit.","Subtract for the difference."],
 [("7 m in cm","700 cm","70 cm","7,000 cm"),("700 - 90 =","610","790","610 m"),("Farther","7 m","90 cm","same"),("Before comparing we","use the same unit","add","guess")],
 ("700 cm is more than 90 cm.","7 m is less than 90 cm."),("2 m in cm? Number only.","200"))
M("animal-jumps","equal-jumps-and-multiples","Equal jumps and multiples","A rabbit jumps 3 steps each time.\n\"After 4 jumps I will be at 12,\" Ravi said.",
 ["Equal jumps on a number line give multiples. Jumping 3 each time lands on 3, 6, 9, 12 and so on.","The number of jumps times the jump length gives the distance. 5 jumps of 4 steps is 20 steps.","To find how many jumps reach a number, divide. 20 divided by 4 is 5 jumps."],
 ["multiple","jump","number line"],("How many jumps of 4 steps reach 20?",["Divide 20 by 4.","20 divided by 4 is 5.","So 5 jumps."]),
 ("3 jumps of 5 reach 8.",["3 times 5 is 15.","Jumps are multiplied, not added."]),["Equal jumps give multiples.","Divide to find the number of jumps."],
 [("5 jumps of 4 reach","20","9","25"),("Multiples of 3","3, 6, 9","3, 4, 5","1, 2, 3"),("20 / 4 =","5","4","16"),("3 jumps of 5 reach","15","8","35")],
 ("Equal jumps land on multiples.","3 jumps of 5 reach 8."),("5 jumps of 6 = ? Number only.","30"))
M("animal-jumps","jump-data-and-simple-tables","Jump data and simple tables","The class recorded jumps of animals in a table.\n\"A table is neat!\" said Asha.",
 ["A table lists information in rows and columns. We can compare easily.","To read a table, find the row, then the column. If the table shows frog 90 cm, rabbit 150 cm and kangaroo 700 cm, we see the greatest and the least.","We can order the animals from the smallest jump to the largest."],
 ["table","row","column"],("Which jump is smallest: 90 cm, 150 cm, 700 cm?",["Compare the numbers.","90 is the smallest.","So the frog jumped the least."]),
 ("a table cannot show numbers.",["Tables list data.","Numbers fit well in tables."]),["Tables have rows and columns.","Compare numbers to order them."],
 [("Smallest of 90, 150, 700","90","150","700"),("Greatest of 90, 150, 700","700","150","90"),("Data in a table is in","rows and columns","only a circle","a song"),("A rabbit jump 150 cm is","more than a frog 90 cm","less than 90 cm","equal to 700")],
 ("Tables organise data.","Tables have no rows."),("Greater: 150 or 90? Number only.","150"))
M("maps-and-locations","reading-simple-maps","Reading simple maps","Asha looked at a map of her town.\n\"Here is my school,\" she said.",
 ["A map is a drawing of a place from above. It uses symbols and a key to show buildings and roads.","A key explains what each symbol means. A scale tells how a short length on the map matches the real distance.","Maps usually show north at the top."],
 ["map","key","scale"],("What does a map key show?",["It lists symbols.","It tells what each means.","It helps us read the map."]),
 ("north is at the bottom of most maps.",["North is usually at the top.","South is at the bottom."]),["A key explains symbols.","North is at the top."],
 [("A key explains","symbols","time","money"),("North is usually at the","top","bottom","centre"),("A scale shows","real distance","colours","names only"),("A map is a drawing from","above","below","inside")],
 ("A map shows a place from above.","A map has no symbols."),("Which direction is at the top of a map? Write one word.","north"))
M("maps-and-locations","grids-and-finding-locations","Grids and finding locations","Ravi's map had letters across and numbers down.\n\"The park is at B3,\" he said.",
 ["A grid puts letters on one side and numbers on the other. A square like B3 names a location.","Find the letter, then the number. The place is where they meet.","Grids help us find places quickly in a city map or a game."],
 ["grid","location","letter"],("How do we find B3 on a grid?",["Go to column B.","Go down to row 3.","The meeting square is B3."]),
 ("B3 and 3B always mean different squares on every grid.",["The order follows the map rule.","Read the map instructions."]),["Letter and number meet at a location.","Grids help find places."],
 [("B3 is found using","letter and number","colour","sound"),("A grid helps us find","locations","food","songs"),("The square where B and 3 meet is","B3","3A","A1"),("A grid has letters and","numbers","animals","shapes only")],
 ("A grid helps find places.","A grid has no labels."),("Letter in B3? Write one letter.","B"))
M("maps-and-locations","directions-and-routes-on-maps","Directions and routes on maps","Asha planned a route from home to school on the map.\n\"Go east, then north,\" she said.",
 ["The four main directions are north, south, east and west. A compass shows them.","A route is a path from one place to another. We can describe it using directions and landmarks.","Between the main directions are north-east, north-west, south-east and south-west."],
 ["direction","route","compass"],("Opposite of east?",["East is to the right of north.","West is the opposite.","So west."]),
 ("east is opposite north.",["South is opposite north.","West is opposite east."]),["North, south, east and west.","A route lists steps."],
 [("Opposite of north","south","east","west"),("A compass shows","directions","time","weight"),("Between north and east is","north-east","south","west"),("A route is a","path","number","colour")],
 ("A compass shows directions.","East is opposite north."),("Opposite of west? One word.","east"))
M("data-through-pictures","pictographs","Pictographs","The class used a smiley for each student who likes mangoes.\n\"Each picture means 2 students,\" said the teacher.",
 ["A pictograph shows data using pictures. A key tells how many each picture stands for.","If one picture stands for 2 and there are 5 pictures, the count is 10.","Pictographs make data easy to see at a glance."],
 ["pictograph","key","data"],("One picture stands for 2. There are 5 pictures. How many?",["Multiply 5 by 2.","5 times 2 is 10.","So 10."]),
 ("each picture always stands for 1.",["The key decides.","Read the key first."]),["Read the key first.","Count pictures and multiply."],
 [("5 pictures x 2 =","10","7","25"),("The key tells","what a picture stands for","colours","time"),("A pictograph shows data with","pictures","only words","sounds"),("3 pictures stand for 5 each: total","15","8","35")],
 ("A pictograph uses pictures.","A pictograph has no key."),("4 pictures with value 3 each = ? Number only.","12"))
M("data-through-pictures","reading-bar-graphs","Reading bar graphs","Ravi drew bars for the fruits his friends like.\n\"The mango bar is tallest,\" he said.",
 ["A bar graph uses bars to show data. The taller the bar, the greater the number.","Read the labels and the scale on the side. If each line is 2 units, a bar at the 3rd line is 6.","We can compare bars to find the most and the least."],
 ["bar graph","scale","bar"],("Which is the most liked fruit if mango has the tallest bar?",["The tallest bar is the greatest.","The mango bar is tallest.","So mango."]),
 ("a short bar means a greater number.",["A tall bar means a greater number.","Short bars mean less."]),["Taller bars are greater.","Read the scale."],
 [("Tallest bar shows","the greatest","the least","nothing"),("A bar graph uses","bars","pictures only","songs"),("A bar at 3 lines of 2 is","6","5","3"),("Shortest bar shows","the least","the most","same")],
 ("Bar graphs help compare data.","A short bar always means more."),("A bar reaches 4 lines of 5. Value? Number only.","20"))
M("data-through-pictures","collecting-and-showing-data","Collecting and showing data","Asha asked her friends their favourite sport.\n\"Let me record it with tally marks,\" she said.",
 ["We collect data by asking questions or observing. Tally marks help us count: four lines and a slash make 5.","A table records the counts. Then we can make a pictograph or bar graph.","Picking a sensible scale makes the graph neat."],
 ["tally","collect","record"],("What do 5 tally marks look like?",["Four lines.","A slash across them.","That makes 5."]),
 ("tally marks are used for drawing.",["Tally marks help count.","They are quick to write."]),["Tally marks count quickly.","Tables record data."],
 [("Tally of 5 is","four lines and a slash","two dots","a circle"),("To record counts we use a","table","song","dance"),("After collecting data we can make a","graph","cloud","road"),("Tally marks help","count","paint","sing")],
 ("We can collect data with questions.","Tally marks are used for weighing."),("Tally marks: five groups of 5 make? Number only.","25"))
