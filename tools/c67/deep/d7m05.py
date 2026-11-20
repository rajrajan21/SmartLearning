import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">A transversal t crossing parallel lines l and m</text>'
    b+='<line x1="30" y1="95" x2="400" y2="95" stroke="#1f618d" stroke-width="3"/><line x1="30" y1="195" x2="400" y2="195" stroke="#1f618d" stroke-width="3"/>'
    b+='<text x="410" y="100">l</text><text x="410" y="200">m</text>'
    b+='<line x1="235" y1="40" x2="175" y2="250" stroke="#c0392b" stroke-width="3"/><text x="240" y="48" fill="#c0392b">t</text>'
    pos={1:(190,85),2:(222,85),3:(222,120),4:(185,120),5:(165,185),6:(200,185),7:(198,222),8:(158,222)}
    xs={1:(205,80),2:(225,80),3:(212,125),4:(170,125),5:(153,180),6:(185,180),7:(180,225),8:(138,225)}
    for k,(x,y) in xs.items(): b+=f'<text x="{x}" y="{y}" font-size="17">{k}</text>'
    b+='<text x="440" y="70" font-size="14">Corresponding: 1=5, 2=6, 3=7, 4=8</text>'
    b+='<text x="440" y="96" font-size="14">Alternate: 4=6, 3=5</text>'
    b+='<text x="440" y="122" font-size="14">Same-side interior: 4 + 5 = 180</text>'
    b+='<text x="440" y="148" font-size="14">3 + 6 = 180</text>'
    b+='<text x="440" y="190" font-size="14">Vertically opposite: 1=3, 2=4</text>'
    b+='<text x="440" y="216" font-size="14">Linear pair: 1 + 2 = 180</text>'
    return b
svgfile('c7-maths-transversal.svg',700,270,d())
chapter(7,'maths','parallel-and-intersecting-lines','Parallel and Intersecting Lines',
 ('Folds and creases','Take a square sheet of paper and fold it in any way you like. Now draw lines along the creases with a ruler. Some of the creases meet, some seem never to meet, and some cross at a perfect corner. Mathematics gives each of these relationships a name, and a few simple reasons explain why the angles always behave the same way.'),
 [('Intersecting lines and the angles they form',[
   'The tabletop, a sheet of paper and the blackboard are all plane surfaces. When two lines on a plane meet at a point we say they intersect.',
   'Two straight lines cannot meet at more than one point. When they intersect they form four angles.',
   'Suppose angle a is 120 degrees. Angles a and b together make a straight angle, which is 180 degrees, so b is 60 degrees.',
   'In the same way b and c make 180 degrees, so c is 120 degrees, and c and d make 180 degrees, so d is 60 degrees.',
   'So a equals c, and b equals d. Is this true only for 120 degrees? No. In general a + b = 180 and a + d = 180, so b = d. Similarly a = c.',
   'Neighbouring angles such as a and b that lie along a straight line are called a linear pair, and a linear pair always adds up to 180 degrees.',
   'Angles that face each other across the crossing, such as b and d, are called vertically opposite angles, and vertically opposite angles are always equal.']),
  ('Measuring versus reasoning',[
   'When we measure, linear pairs may not add up to exactly 180 degrees and vertically opposite angles may differ slightly.',
   'This happens because of measurement errors with the protractor and because drawn lines have thickness, while the ideal lines of geometry have none.',
   'In geometry we create ideal lines and reason about them. We know a straight angle is 180 degrees by reasoning, not by measuring.',
   'Our measurements come very close to what reasoning predicts, which is why geometry is so useful in physics, art and engineering.']),
  ('Perpendicular lines',[
   'Can two lines intersect with all four angles equal? Four equal angles that make a full turn of 360 degrees must each be 90 degrees.',
   'Lines that intersect at right angles are called perpendicular lines.',
   'We mark the right angle between perpendicular lines with a small square.']),
  ('Parallel lines',[
   'Look around: the opposite edges of a page, the rails of a railway track, the lines of a ruled notebook. They do not meet.',
   'Parallel lines are lines on the same plane that never meet however far they are extended at both ends.',
   'The words on the same plane matter. A line on a table and a line on a board may never meet but they are not parallel because they are not on the same plane.',
   'We mark parallel lines with arrow marks. If there is a second set of parallel lines, we use two arrows, and so on.']),
  ('Paper folding',[
   'Fold a square sheet in half horizontally. The crease is parallel to the top and bottom edges. Fold again and you get more parallel creases.',
   'A vertical fold is perpendicular to the horizontal edges. Adjacent edges of the square form right angles and opposite edges are parallel.',
   'Folding is a handy way to make parallel and perpendicular lines without any instrument.',
   'Sometimes it is hard to tell by eye whether two lines are parallel, as when they are drawn at a slant. We need a reliable test, and that test uses a transversal.']),
  ('Transversals and corresponding angles',[
   'A line that crosses two other lines is called a transversal. In the figure t is a transversal of lines l and m.',
   'A transversal forms eight angles. Number them 1 to 4 at line l and 5 to 8 at line m, in the same positions.',
   'Angles 1 and 3 are vertically opposite and equal. In all there are four pairs of vertically opposite angles, so there are at most four different angle measures.',
   'Angles in the same position at the two lines are called corresponding angles. 1 and 5, 2 and 6, 3 and 7, 4 and 8 are corresponding pairs.',
   'When l and m are parallel, corresponding angles are equal. And if the corresponding angles are equal, then l and m must be parallel. This is our test for parallel lines.']),
  ('Alternate and same-side interior angles',[
   'Angles between the two lines but on opposite sides of the transversal are called alternate angles. With parallel lines, alternate angles are equal.',
   'Why? Angle 3 equals angle 1 because they are vertically opposite. And angle 1 equals angle 5 because they are corresponding. So angle 3 equals angle 5.',
   'Angles between the two lines on the same side of the transversal are called interior angles on the same side. When the lines are parallel, they add up to 180 degrees.',
   'Why? Angle 4 and angle 5: angle 4 plus angle 3 is a linear pair, so it is 180. And angle 3 equals angle 5, so angle 4 plus angle 5 is 180 degrees.',
   'So if one angle at a crossing of a transversal with parallel lines is 70 degrees, every other angle is either 70 degrees or 110 degrees.'])],
 [('Two lines intersect and one angle is 120 degrees. Find the other three.',[('The neighbour forms a linear pair: 180 - 120 = 60 degrees.','A straight angle is 180 degrees.'),('The vertically opposite angle is also 120 degrees.','Vertically opposite angles are equal.'),('The remaining angle is 60 degrees, vertically opposite to the first 60.','It is the other vertically opposite pair.')]),
  ('A transversal crosses parallel lines l and m and angle 1 is 70 degrees. Find angles 3, 5 and 4.',[('Angle 3 = 70 degrees because it is vertically opposite angle 1.','Vertically opposite angles are equal.'),('Angle 5 = 70 degrees as corresponding to angle 1.','The lines are parallel.'),('Angle 4 = 180 - 70 = 110 degrees as it forms a linear pair with angle 3.','Linear pair adds to 180.')]),
  ('Two lines are cut by a transversal and a pair of corresponding angles are both 65 degrees. What can we say?',[('Corresponding angles are equal.','65 = 65.'),('So the two lines are parallel.','Equal corresponding angles are the test for parallel lines.')]),
  ('Interior angles on the same side are 2x and 3x between parallel lines. Find x.',[('They add up to 180 degrees.','Same-side interior angles of parallel lines.'),('2x + 3x = 180, so 5x = 180 and x = 36.','Solve the equation.'),('The angles are 72 and 108 degrees.','Check: 72 + 108 = 180.')])],
 ('Explain why vertically opposite angles are equal, and how a transversal can show two lines are parallel.',['Each of two vertically opposite angles forms a linear pair with the same neighbour, so they are equal.','If corresponding angles are equal, the lines are parallel.','For parallel lines alternate angles are equal and same-side interior angles add to 180.'],['Thinking linear pairs are equal rather than adding to 180.','Calling lines parallel just because they do not meet on the page.','Mixing up alternate angles with same-side interior angles.']),
 ['When two lines intersect, vertically opposite angles are equal and linear pairs add up to 180 degrees.','Perpendicular lines meet at 90 degrees; parallel lines on a plane never meet.','A transversal crossing two lines makes eight angles in two sets of four.','Corresponding angles are equal if and only if the lines are parallel.','For parallel lines, alternate angles are equal and same-side interior angles add up to 180 degrees.','Geometry uses ideal lines; measurements are close but not exact.'],
 [mcq('1',1,'Two lines intersect. Vertically opposite angles are','equal',[('supplementary','Linear pairs add to 180; vertically opposite angles are equal.'),('always 90 degrees','That is true only for perpendicular lines.')],'Each is supplementary to the same neighbouring angle.'),
  mcq('2',1,'A linear pair of angles always adds up to','180 degrees',[('90 degrees','That is a right angle, not a linear pair.'),('360 degrees','That is a full turn.')],'They together form a straight angle.'),
  tf('3',1,'Two straight lines can intersect at two different points.',False,'Two straight lines meet at only one point.'),
  mcq('4',1,'Lines on a plane that never meet however far extended are','parallel',[('perpendicular','Perpendicular lines meet at 90 degrees.'),('transversals','A transversal crosses other lines.')],'That is the definition of parallel lines.'),
  num('5',2,'Two lines intersect and one angle is 120 degrees. What is its neighbour in degrees?',60,'180 - 120 = 60.',[(120,'That is the vertically opposite angle.'),(240,'This is not part of a straight angle.')],'degrees'),
  num('6',2,'A transversal crosses parallel lines and one angle is 70 degrees. What is the corresponding angle?',70,'Corresponding angles are equal when lines are parallel.',[(110,'110 is its linear pair, not the corresponding angle.')],'degrees'),
  mcq('7',2,'Same-side interior angles between parallel lines add up to','180 degrees',[('90 degrees','Only if both angles are 45.'),('They are equal','Alternate angles are equal; same-side angles are supplementary.')],'They form a pair that together make a straight angle.'),
  mcq('8',2,'If a transversal makes equal corresponding angles with two lines, then the lines are','parallel',[('perpendicular','They would need 90-degree angles at the crossing.'),('intersecting on the paper','Equal corresponding angles mean they never meet.')],'This is the test for parallel lines.'),
  num('9',3,'Interior angles on the same side between parallel lines are 2x and 3x. Find x.',36,'2x + 3x = 180, so 5x = 180 and x = 36.',[(18,'Check: 2x + 3x is 5x, not 10x.'),(60,'That would make the angles 120 and 180.')]),
  mcq('10',3,'Why can measured vertically opposite angles differ slightly?','Because of measuring error and line thickness',[('Because the theorem is false sometimes','The theorem is always true for ideal lines.'),('Because angles change when measured','Angles do not change; instruments and drawing cause small errors.')],'Geometry talks about ideal lines of zero thickness.')],
 svgs=[('c7-maths-transversal','A transversal crossing two parallel lines with angles numbered 1 to 8','Angles formed by a transversal')],
 keep=['intersect','parallel','perpendicular','transversal','vertically opposite','linear pair'])
