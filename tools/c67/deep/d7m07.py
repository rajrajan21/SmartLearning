import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">Constructing a triangle with sides 4 cm, 5 cm, 6 cm using a compass</text>'
    b+='<line x1="60" y1="200" x2="160" y2="200" stroke="#333" stroke-width="3"/>'
    b+='<path d="M 117.0 88.8 A 125 125 0 0 0 32.1 78.1" fill="none" stroke="#1f618d" stroke-dasharray="4 3"/>'
    b+='<path d="M 123.4 54.5 A 150 150 0 0 0 38.4 112.0" fill="none" stroke="#c0392b" stroke-dasharray="4 3"/>'
    b+='<line x1="60" y1="200" x2="75.6" y2="76" stroke="#333" stroke-width="3"/><line x1="160" y1="200" x2="75.6" y2="76" stroke="#333" stroke-width="3"/>'
    b+='<text x="40" y="218">A</text><text x="164" y="218">B</text><text x="70" y="68">C</text>'
    b+='<text x="100" y="216" font-size="13">4 cm</text><text x="100" y="46" font-size="13" fill="#1f618d">arc 5 cm from A</text><text x="20" y="108" font-size="13" fill="#c0392b">arc 6 from B</text>'
    b+='<text x="260" y="70" font-weight="bold" font-size="15">Triangle inequality: each side &lt; sum of the other two</text>'
    b+='<text x="260" y="100" font-size="15">4, 5, 6: 6 &lt; 9, 5 &lt; 10, 4 &lt; 11  -> triangle exists</text>'
    b+='<text x="260" y="128" font-size="15">10, 15, 30: 30 is not less than 25  -> no triangle</text>'
    b+='<text x="260" y="170" font-weight="bold" font-size="15">Angle sum of a triangle = 180 degrees</text>'
    b+='<text x="260" y="198" font-size="15">acute: all angles &lt; 90 | right: one = 90 | obtuse: one &gt; 90</text>'
    b+='<text x="260" y="226" font-size="15">equilateral 3 equal sides | isosceles 2 | scalene none</text>'
    return b
svgfile('c7-maths-triangle-construction.svg',680,250,d())
chapter(7,'maths','a-tale-of-three-intersecting-lines','A Tale of Three Intersecting Lines',
 ('Three lines make a closed shape','Three straight lines that cross each other pairwise can enclose a small region: a triangle. It is the most basic closed shape, and it is strong, which is why bridges and cranes are built from triangles. But not every three lengths can form a triangle. How do we know, and how do we build one with a compass?'),
 [('Triangles and their parts',[
   'A triangle has three corner points called vertices, and three line segments called sides that join pairs of vertices.',
   'The three sides meeting at the corners make three angles. In triangle ABC the angles are angle CAB, angle ABC and angle BCA, which we write as angle A, angle B and angle C.',
   'We name a triangle by its vertices, for example triangle ABC. What if the three vertices lie on a straight line? Then no region is enclosed, so there is no triangle.']),
  ('Equilateral triangles',[
   'An equilateral triangle has all its sides equal. It is the most symmetric of all triangles.',
   'To draw one with sides 4 cm, first draw the base AB of 4 cm. Trying to place C with only a marked ruler needs many trials, because AC and BC must both be exactly 4 cm.',
   'With a compass it is easy. Step 1: from A draw an arc of radius 4 cm. Step 2: from B draw another arc of radius 4 cm. The arcs meet at C.',
   'Step 3: join AC and BC. Since C lies on both arcs, both AC and BC are 4 cm, and the triangle is equilateral.']),
  ('Constructing a triangle from three sides',[
   'To construct a triangle with sides 4 cm, 5 cm and 6 cm, choose one side as the base, say 4 cm, and call its ends A and B.',
   'The point C is 5 cm from A, so it lies on a circle of radius 5 cm around A. It is also 6 cm from B, so it lies on a circle of radius 6 cm around B.',
   'The required point is where these two circles meet. A full circle is not needed; two arcs that cross are enough.',
   'Steps: draw AB = 4 cm. From A draw an arc of radius 5 cm. From B draw an arc of radius 6 cm to cross it. Join the crossing point to A and B.',
   'A triangle with all sides equal is equilateral. With exactly two equal sides it is isosceles. With three different side lengths it is scalene.']),
  ('Are triangles possible for any lengths?',[
   'Try to construct a triangle with sides 3 cm, 4 cm and 8 cm. The two arcs never meet. Try 2 cm, 3 cm and 6 cm. Again it fails.',
   'So some sets of lengths make a triangle and others do not. Trying every case by construction is slow. Let us find a quicker test.',
   'Imagine a tent, a tree and a pole. Going straight from the tent to the tree is shorter than going to the pole first and then to the tree. The straight path is always the shortest.',
   'Suppose a triangle with sides 10 cm, 15 cm and 30 cm existed. Between the vertices joined by the 30 cm side, the roundabout path via the third vertex is 10 + 15 = 25 cm, which is shorter than the direct 30 cm. That is absurd, so there is no such triangle.']),
  ('The triangle inequality',[
   'For a triangle to exist, each side must be less than the sum of the other two sides. This is called the triangle inequality.',
   'It is enough to compare the longest side with the sum of the other two. If the longest is shorter than the sum of the others, the other comparisons hold automatically.',
   'For 4, 5, 6 we find 6 < 4 + 5 = 9, so a triangle exists. For 3, 3, 7 we find 7 > 3 + 3 = 6, so there is no triangle.',
   'The converse is also true: if three lengths satisfy the triangle inequality, a triangle can be constructed with those sides.']),
  ('Angles in a triangle',[
   'Cut out the three corners of any paper triangle and put them side by side. They always fit along a straight line, making 180 degrees.',
   'The sum of the three angles of a triangle is always 180 degrees. We can also reason with parallel lines: draw a line through one vertex parallel to the opposite side, and the alternate angles show that the three angles make a straight angle.',
   'So if two angles are 50 degrees and 60 degrees, the third is 180 - 110 = 70 degrees.',
   'Triangles are also classified by their angles. An acute-angled triangle has all angles less than 90 degrees. A right-angled triangle has one angle of 90 degrees. An obtuse-angled triangle has one angle greater than 90 degrees.',
   'A triangle can have at most one right angle or obtuse angle, because two such angles already make 180 degrees or more.']),
  ('Altitudes and other constructions',[
   'An altitude of a triangle is a perpendicular line segment from a vertex to the opposite side. A triangle has three altitudes.',
   'We can also construct a triangle when two sides and the angle between them are given, or when two angles and the side between them are given.',
   'For two sides and the included angle, draw one side, make the given angle at one end with a protractor, mark the second side along it and join the free ends.',
   'For two angles and the included side, draw the side, make the two angles at its ends, and the arms meet at the third vertex.'])],
 [('Decide whether a triangle exists with sides 8 cm, 10 cm and 17 cm.',[('The longest side is 17 cm.','Compare the longest with the sum of the other two.'),('8 + 10 = 18, and 17 < 18.','The longest is less than the sum of the other two.'),('So a triangle exists.','The triangle inequality is satisfied.')]),
  ('Two angles of a triangle are 50 degrees and 60 degrees. Find the third and classify the triangle.',[('Angle sum is 180 degrees.','Triangle angle sum property.'),('180 - 50 - 60 = 70 degrees.','Subtract the two known angles.'),('All angles are less than 90, so it is an acute-angled triangle.','Classification by angles.')]),
  ('Construct a triangle with sides 3 cm, 4 cm and 5 cm. What kind of triangle is it?',[('Draw AB = 4 cm.','Choose any side as base.'),('Arc of radius 3 cm from A and arc of radius 5 cm from B cross at C.','C is 3 cm from A and 5 cm from B.'),('Join AC and BC. The angle at A is 90 degrees, so it is right-angled and scalene.','Measure with a protractor.')]),
  ('Can a triangle have sides 3 cm, 3 cm and 7 cm?',[('Longest side is 7 cm.','Compare with the sum of the others.'),('3 + 3 = 6, and 7 is not less than 6.','The inequality fails.'),('So no triangle exists.','The arcs would not meet.')])],
 ('Explain to a friend how to decide if three lengths can make a triangle, and why the angles of a triangle add up to 180 degrees.',['The longest side must be less than the sum of the other two.','The direct path between two points is shorter than any roundabout path.','Corners of a triangle fit along a straight line, which is 180 degrees.'],['Thinking any three lengths make a triangle.','Checking only the sum and not the longest side.','Thinking an obtuse-angled triangle can have two obtuse angles.']),
 ['A triangle has three vertices, three sides and three angles.','Using a compass makes constructions easy: the third vertex lies where two arcs meet.','A triangle exists only if each side is less than the sum of the other two (the triangle inequality).','The angles of a triangle always add up to 180 degrees.','Equilateral, isosceles and scalene triangles are classified by sides; acute, right-angled and obtuse by angles.','An altitude is the perpendicular from a vertex to the opposite side.'],
 [mcq('1',1,'A triangle with all three sides of different lengths is','scalene',[('isosceles','Isosceles has two equal sides.'),('equilateral','Equilateral has three equal sides.')],'No two sides are equal.'),
  mcq('2',1,'The sum of the angles of a triangle is','180 degrees',[('90 degrees','That is a right angle.'),('360 degrees','That is for a quadrilateral.')],'The three corners make a straight angle.'),
  tf('3',1,'A triangle can have two right angles.',False,'Two right angles already add up to 180 degrees, leaving nothing for the third angle.'),
  mcq('4',1,'Which tool makes the third vertex of a triangle easy to find?','compass',[('set square only','It does not measure equal distances for the arcs.'),('eraser','Not a drawing instrument for arcs.')],'Two arcs cross at the third vertex.'),
  mcq('5',2,'A triangle exists with sides','4 cm, 5 cm, 6 cm',[('3 cm, 4 cm, 8 cm','8 is greater than 3 + 4.'),('2 cm, 3 cm, 6 cm','6 is greater than 2 + 3.')],'6 < 4 + 5.'),
  num('6',2,'Two angles of a triangle are 50 and 60 degrees. What is the third?',70,'180 - 50 - 60 = 70.',[(110,'That is 50 + 60, not the third angle.'),(130,'Subtract both angles from 180.')],'degrees'),
  mcq('7',2,'3 cm, 3 cm and 7 cm cannot form a triangle because','7 is greater than 3 + 3',[('two sides are equal','Isosceles triangles are fine.'),('7 is odd','Parity does not decide this.')],'The longest side must be less than the sum of the other two.'),
  mcq('8',2,'A triangle with one angle greater than 90 degrees is','obtuse-angled',[('acute-angled','All angles would be less than 90.'),('right-angled','One angle would be exactly 90.')],'It has one obtuse angle.'),
  num('9',3,'A triangle has angles 90 degrees and 35 degrees. Find the third angle.',55,'180 - 90 - 35 = 55.',[(45,'That would be for 45 degrees as the second angle.'),(125,'You added instead of subtracting.')],'degrees'),
  mcq('10',3,'Why must the sum of two sides always be greater than the third?','The straight path is the shortest',[('Because triangles have 3 sides','That is just the count of sides.'),('Because angles add to 180','That is a different property.')],'Going via the third vertex cannot be shorter than going directly.')],
 svgs=[('c7-maths-triangle-construction','Compass construction of a triangle with sides 4 5 6 cm and triangle rules','Triangle construction and rules')],
 keep=['triangle','vertex','equilateral','isosceles','scalene','altitude'])
