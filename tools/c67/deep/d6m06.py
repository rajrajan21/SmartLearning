import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="24" font-weight="bold">Perimeter goes around; area fills inside; a diagonal halves a rectangle</text>'
    b+='<rect x="40" y="60" width="240" height="160" fill="#fef9e7" stroke="#b9770e" stroke-width="3"/>'
    b+='<text x="130" y="50">length = 12 cm</text><text x="288" y="145">breadth = 8 cm</text>'
    b+='<text x="40" y="250" font-size="14">Perimeter = 2 x (12 + 8) = 40 cm</text><text x="40" y="272" font-size="14">Area = 12 x 8 = 96 sq cm</text>'
    b+='<rect x="400" y="60" width="200" height="160" fill="#eaf2f8" stroke="#2874a6" stroke-width="3"/>'
    b+='<polygon points="400,220 600,60 600,220" fill="#aed6f1" stroke="#2874a6" stroke-width="3"/><line x1="400" y1="220" x2="600" y2="60" stroke="#c0392b" stroke-width="3" stroke-dasharray="6 4"/>'
    b+='<text x="480" y="205" font-size="14">triangle</text><text x="410" y="120" font-size="13">other triangle</text>'
    b+='<text x="400" y="250" font-size="14">Each triangle = half of the rectangle</text><text x="400" y="272" font-size="14">200 x 160 half = 100 x 80 scale units</text>'
    return b
svgfile('c6-maths-perimeter-area.svg',640,290,dia())
chapter(6,'maths','perimeter-and-area','Perimeter and Area',
 ('Akshi and Toshi on the track','Akshi runs 5 rounds on a rectangular outer track and Toshi runs 7 rounds on the inner track. Who ran farther? To answer, we need the distance around each track, which is its perimeter. Later, to cover a floor with tiles or plan a garden, we need the space inside a shape, which is its area. This chapter shows how perimeter and area are measured, how they are different, and how a rectangle helps us find the area of a triangle.'),
 [('Perimeter',[
   'The perimeter of a closed plane figure is the distance covered along its boundary when we go around it once. For a polygon it is the sum of the lengths of all its sides.',
   'A rectangle has equal opposite sides, so its perimeter is length + breadth + length + breadth, which equals 2 x (length + breadth). For a rectangle 12 cm by 8 cm it is 2 x (12 + 8) = 40 cm.',
   'A square has four equal sides, so its perimeter is 4 times the side. Debojeet needs 4 m of coloured tape for a square frame of side 1 m.',
   'For a triangle, add the three sides. If the perimeter is 55 cm and two sides are 20 cm and 14 cm, the third side is 55 - 20 - 14 = 21 cm.',
   'A regular polygon has all sides equal, so its perimeter is the number of sides times the length of one side. A string of 36 cm can make a square of side 9 cm, an equilateral triangle of side 12 cm, or a regular hexagon of side 6 cm.']),
  ('Using perimeter in real life',[
   'Akshi track is a rectangle of 70 m by 40 m, so one round is 2 x (70 + 40) = 220 m, and 5 rounds are 1100 m. Toshi inner track gives 180 m a round, so 7 rounds are 1260 m. Toshi ran farther even though Akshi has the longer track.',
   'To fence a rectangular park 150 m by 120 m, the perimeter is 2 x (150 + 120) = 540 m. At Rs 40 a metre the fence costs 540 x 40 = Rs 21,600.',
   'When the perimeter is known we can find a missing side. A rectangle of perimeter 14 cm and breadth 2 cm has length 14 / 2 - 2 = 5 cm, and a square of perimeter 20 cm has side 5 cm.',
   'In races on square tracks the finishing line is common, so runners on the outer track start ahead. This is why the starting points of different lanes are staggered.']),
  ('Area and its units',[
   'Area is the amount of surface inside a closed figure. We measure it by counting unit squares that cover the figure without gaps or overlaps. A unit square of side 1 cm has an area of 1 sq cm.',
   'The area of a rectangle is length x breadth. For a garden 25 m long with an area of 300 sq m, the width is 300 / 25 = 12 m.',
   'The area of a square is side x side. Square units are used for area, such as sq cm, sq m and sq km, and plain units like cm and m are used for perimeter.',
   'Using area we can find costs and counts. Tiling a rectangle 500 m by 200 m at Rs 8 for each 100 sq m costs 100,000 / 100 x 8 = Rs 8000. A grove 100 m by 50 m has 5000 sq m, so at 25 sq m a tree it holds 200 trees.']),
  ('Splitting shapes into rectangles',[
   'Many shapes are not rectangles, but we can cut them into rectangles, find each area and add. An L shaped figure is split into two rectangles in this way.',
   'We can also subtract. A floor of 5 m by 4 m has an area of 20 sq m, and a 3 m square carpet covers 9 sq m, so 11 sq m is not carpeted. A garden of 15 m by 12 m has area 180 sq m, and four beds of 2 m by 1 m take 8 sq m, leaving 172 sq m for the lawn.',
   'Charan house plan is a rectangular plot divided into rooms. The area of the whole plot is the sum of the areas of the rooms, and the missing sides are found from the known sides.']),
  ('Area of a triangle',[
   'Draw a rectangle and cut along a diagonal. The two triangles fit exactly on each other, so each is half of the rectangle. The area of a right triangle is half of the area of the rectangle on its two shorter sides.',
   'For any triangle ABE standing on the side AB of a rectangle ABCD whose top vertex E is on side CD, drop the perpendicular EF. The triangle splits into two right triangles, each half of a smaller rectangle, so the whole triangle is half of rectangle ABCD.',
   'We can therefore find the area of a triangle on grid paper by building a rectangle around it and taking half. More shapes can be handled by splitting them into rectangles and triangles.']),
  ('Same area, different perimeter',[
   'Shapes with the same area need not have the same perimeter. With 9 unit squares joined edge to edge, a 3 by 3 square has the smallest perimeter, 12 units, and a long strip of 9 by 1 has the largest, 20 units.',
   'A perimeter of 18 units can be made with several different shapes, so perimeter alone does not decide the shape.',
   'Adding a square to a figure can increase, decrease or leave the perimeter unchanged depending on where it is attached. If it touches one side the perimeter does not change, if it touches two sides it decreases by 2 units, and if it touches only a corner or one edge from outside it increases by 2.',
   'When a square paper is cut along the fold into two rectangles, the two perimeters together are 1.5 times the square perimeter, but the total area stays the same.'])],
 [('A rectangular park is 150 m long and 120 m wide. Find the cost of fencing it at Rs 40 a metre, and the area of the park.',
   [('Perimeter = 2 x (150 + 120) = 2 x 270 = 540 m.','Fencing goes around, so use the perimeter.'),
    ('Cost = 540 x 40 = Rs 21,600.','Multiply the length by the rate per metre.'),
    ('Area = 150 x 120 = 18,000 sq m.','Area is length times breadth, in square units.')]),
  ('A wire is bent into a rectangle 5 cm by 3 cm. It is then straightened and bent into a square. Find the side of the square.',
   [('Length of wire = perimeter = 2 x (5 + 3) = 16 cm.','The wire length equals the perimeter.'),
    ('A square has 4 equal sides, so each side = 16 / 4.','Divide the perimeter by 4.'),
    ('Side = 4 cm.','The wire length is the same, so the perimeter is unchanged.')]),
  ('A floor 5 m long and 4 m wide has a square carpet of side 3 m laid on it. How much floor is not carpeted?',
   [('Floor area = 5 x 4 = 20 sq m.','Area of a rectangle.'),
    ('Carpet area = 3 x 3 = 9 sq m.','Area of a square.'),
    ('Uncovered area = 20 - 9 = 11 sq m.','Subtract the part that is covered.')]),
  ('A rectangle is 12 cm by 8 cm. A diagonal cuts it into two triangles. Find the area of each triangle.',
   [('Area of rectangle = 12 x 8 = 96 sq cm.','Find the area of the whole rectangle first.'),
    ('The diagonal makes two triangles that fit exactly on each other.','They are equal in area.'),
    ('Area of each triangle = 96 / 2 = 48 sq cm.','Each triangle is half the rectangle.')])],
 ('Explain the difference between perimeter and area, and how you can find the area of a triangle.',
  ['Perimeter is the distance around a shape; area is the surface inside.','Perimeter uses units like cm and m; area uses square units like sq cm and sq m.','A rectangle has area length x breadth and perimeter 2 x (length + breadth).','A triangle on a rectangle uses half the rectangle area.'],
  ['Using the perimeter formula to find the area, or the other way round.','Writing area in plain cm instead of sq cm.','Thinking that bigger area always means bigger perimeter.','Forgetting to halve when finding the area of a triangle from a rectangle.']),
 ['Perimeter is the total length of the boundary: for a rectangle 2 x (length + breadth), for a square 4 x side.','Area is the surface inside a figure, measured in square units; a rectangle has area length x breadth.','Complex shapes are cut into rectangles and the areas are added or subtracted.','A diagonal cuts a rectangle into two triangles of equal area, so a right triangle has half the area of the rectangle.','Two shapes can have the same area but different perimeters.','Use perimeter for fencing and borders, and area for tiling, painting and covering.'],
 [num('1',1,'A rectangle has length 12 cm and breadth 8 cm. What is its perimeter in cm?',40,'2 x (12 + 8) = 40 cm.',[(96,'96 is the area, found by multiplying length and breadth.'),(20,'20 is the sum of length and breadth; the perimeter is twice that.')],'cm'),
  num('2',1,'What is the perimeter of a square of side 15 cm?',60,'4 x 15 = 60 cm.',[(225,'225 is the area, 15 x 15.'),(30,'30 is 2 x 15, only two sides.')],'cm'),
  num('3',1,'A wire bent into a rectangle 5 cm by 3 cm is made into a square. What is the side of the square in cm?',4,'The wire is 16 cm long, and 16 / 4 = 4 cm.',[(8,'8 is half of the wire length; a square has four sides.'),(16,'16 is the whole wire, which is the perimeter.')],'cm'),
  num('4',1,'The area of a garden 25 m long is 300 sq m. What is its width in m?',12,'Width = 300 / 25 = 12 m.',[(275,'275 comes from subtracting 25 from 300; area needs division.'),(7500,'7500 comes from multiplying instead of dividing.')],'m'),
  mcq('5',2,'A diagonal divides a rectangle into two triangles. The area of each triangle is','half the area of the rectangle',[('equal to the area of the rectangle','Two triangles together make the rectangle, so each is half.'),('twice the area of the rectangle','A part cannot be bigger than the whole.')],'The two triangles fit exactly on each other.'),
  num('6',2,'A park 150 m by 120 m is fenced at Rs 40 a metre. What is the cost in rupees?',21600,'Perimeter = 540 m and 540 x 40 = 21,600.',[(720000,'720,000 uses the area 18,000 instead of the perimeter.'),(10800,'10,800 uses only half the perimeter.')]),
  num('7',2,'A floor 5 m by 4 m has a 3 m square carpet. How many sq m are not carpeted?',11,'20 - 9 = 11 sq m.',[(9,'9 is the area of the carpet.'),(20,'20 is the area of the whole floor.')],'sq m'),
  tf('8',2,'Two shapes with the same area must have the same perimeter.',False,'A 3 by 3 square and a 9 by 1 strip both have area 9 sq units but perimeters of 12 and 20 units.'),
  num('9',3,'A rectangular grove is 100 m by 50 m. Each tree needs 25 sq m. How many trees can be planted?',200,'Area = 5000 sq m and 5000 / 25 = 200 trees.',[(300,'300 adds the sides instead of using area.'),(20,'20 is the number of trees for a 500 sq m area.')]),
  mcq('10',3,'Using 9 joined unit squares, the smallest possible perimeter is','12 units',[('9 units','9 is the area; the perimeter of 9 squares is larger.'),('20 units','20 is the largest perimeter, from a 9 by 1 strip.')],'A 3 by 3 square has perimeter 4 x 3 = 12.')],
 svgs=[('c6-maths-perimeter-area','A rectangle of 12 cm by 8 cm with its perimeter and area, and another rectangle cut by a diagonal into two equal triangles','Perimeter, area and the diagonal')],
 keep=['perimeter','area','rectangle','square','triangle','diagonal','unit square'])
