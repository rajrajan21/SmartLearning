import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="24" font-weight="bold">A circle, and a point 5 cm from both B and C</text>'
    b+='<circle cx="140" cy="130" r="80" fill="#eaf2f8" stroke="#1b4f72" stroke-width="3"/><circle cx="140" cy="130" r="4" fill="#c0392b"/>'
    b+='<line x1="140" y1="130" x2="220" y2="130" stroke="#c0392b" stroke-width="2"/><text x="128" y="152" font-size="14">P (centre)</text><text x="170" y="122" font-size="14">radius</text>'
    b+='<text x="40" y="240" font-size="14">Every point on the circle is the same distance from P</text>'
    b+='<circle cx="400" cy="170" r="90" fill="none" stroke="#7d3c98" stroke-width="2" stroke-dasharray="5 4"/><circle cx="490" cy="170" r="90" fill="none" stroke="#1e8449" stroke-width="2" stroke-dasharray="5 4"/>'
    b+='<circle cx="400" cy="170" r="4" fill="#333"/><circle cx="490" cy="170" r="4" fill="#333"/><circle cx="445" cy="92" r="5" fill="#c0392b"/>'
    b+='<text x="390" y="190" font-size="14">B</text><text x="486" y="190" font-size="14">C</text><text x="452" y="88" font-size="14">A</text>'
    b+='<text x="340" y="240" font-size="14">Arcs from B and C meet at A: AB = AC</text>'
    return b
svgfile('c6-maths-constructions.svg',640,260,dia())
chapter(6,'maths','playing-with-constructions','Playing with Constructions',
 ('Drawing with a ruler and compass','Can you draw a smiling face, a wavy line, or a house with a ruler and compass instead of guessing by eye? In this chapter we learn what a compass can do, why a circle is a set of points at the same distance from a centre, and how that single idea helps us construct exact squares, rectangles and other figures without trial and error.'),
 [('The compass and the circle',[
   'A compass has a fixed point that stays on the paper and a pencil end that moves. We open it against a ruler to set the distance between the two tips, and then turn it to draw a curve.',
   'If we mark every point that is 4 cm from a point P, they form a circle. P is called the centre and the distance from P to any point on the circle is the radius.',
   'Curves are shapes drawn without lifting the pencil. They include straight lines, circles and wavy shapes.',
   'Because the fixed tip does not move, every point drawn by the pencil is at the same distance, the radius, from the centre. That is why the compass draws a perfect circle.']),
  ('Making artwork',[
   'Many pictures are built from circles and parts of circles, called arcs. A wavy line along a central line AB of 8 cm can be drawn as half circles. Each half circle has a diameter on AB, so the radius is half of that part.',
   'The challenge in a drawing like A Person is deciding where to put the compass tip and what radius to use. You can fix the radius and try different positions of the tip, or estimate from the picture.',
   'Ruler and compass together make artwork neater than freehand, and you can design your own patterns by changing the centre and the radius.']),
  ('Squares and rectangles',[
   'In a rectangle ABCD, A, B, C and D are the corners, AB, BC, CD and DA are the sides, and the angles are angle A, B, C and D. AB and CD are a pair of opposite sides.',
   'A rectangle has two properties: R1, opposite sides are equal in length, and R2, all angles are 90 degrees. A square has S1, all sides equal, and S2, all angles 90 degrees.',
   'A rectangle can be named by going around its corners in order from any corner, so ABCD, BCDA and DCBA are valid names, but ABDC is not because it jumps across the figure.',
   'A square or rectangle tilted on the page is still a square or rectangle; rotating does not change its sides or angles.']),
  ('Constructing a rectangle',[
   'To construct a rectangle with sides of 5 cm and 3 cm, draw the side DC of 5 cm. At D and C construct lines perpendicular to DC, making 90 degree angles.',
   'On each perpendicular mark a point 3 cm from D and C. Rather than moving a ruler by trial, draw an arc of radius 3 cm from D and note where it cuts the perpendicular.',
   'Join the two new points and check R1 and R2: opposite sides should be equal and all angles 90 degrees.',
   'If a diagonal and a side are given, we use a circle. Draw DC, then a perpendicular at C. The point B on that line is at the diagonal length from D, so draw a circle or arc with centre D and radius equal to the diagonal; it cuts the line at B.',
   'Only the arc near the line is needed, not the whole circle. Finally construct perpendiculars at D and B; where they meet is the fourth corner A.']),
  ('Points equidistant from two points',[
   'In the house figure, every border line is 5 cm, so the point A must be 5 cm from both B and C. Finding it with a ruler needs trial and error.',
   'With a compass, draw an arc of radius 5 cm with centre B and another arc of 5 cm with centre C. The point where the arcs meet is exactly 5 cm from both, so it is A.',
   'We only need small arcs near the meeting point, not full circles. Then join A to B and A to C.',
   'This idea of using circles to find a point at a given distance from one or two points is the key trick of all constructions in this chapter.']),
  ('Checking a construction',[
   'After constructing, check by measuring. In a rectangle the opposite sides should match and every angle should read 90 degrees on the protractor.',
   'A rectangle whose diagonal divides the opposite angles into 45 and 45 degrees has equal sides, so it is a square.',
   'If a construction is not accurate, the usual cause is that the compass radius slipped, so keep the compass tight and re-check the radius against the ruler.'])],
 [('Construct a rectangle ABCD with DC = 5 cm and BC = 3 cm.',
   [('Draw DC = 5 cm with the ruler.','This is the base.'),
    ('At D and C construct perpendiculars to DC.','Rectangle corners are 90 degrees.'),
    ('With radius 3 cm, draw an arc from D and from C to cut the perpendiculars at A and B.','The compass gives equal lengths without trial and error.'),
    ('Join A and B and check.','Opposite sides are equal and all angles 90 degrees.')]),
  ('How do we find a point A that is 5 cm from both B and C?',
   [('Open the compass to 5 cm.','The radius is the required distance.'),
    ('Draw an arc with centre B and another with centre C.','Each arc is all points 5 cm from its centre.'),
    ('Mark the point where the arcs cross as A.','It lies on both arcs, so it is 5 cm from both.')]),
  ('Construct a rectangle with a side of 4 cm and a diagonal of 8 cm.',
   [('Draw side DC = 4 cm and a perpendicular at C.','Corner C is 90 degrees.'),
    ('With centre D and radius 8 cm draw an arc to cut the perpendicular at B.','DB is the diagonal.'),
    ('Draw perpendiculars at D and B; their meeting point is A.','This completes the rectangle ABCD.')]),
  ('What radius gives a half circle on AB = 8 cm if the wave is one half circle across the whole line?',
   [('The half circle runs from A to B, so its diameter is 8 cm.','Diameter is the width of the circle.'),
    ('Radius = 8 / 2 = 4 cm.','Radius is half the diameter.'),
    ('The centre X is the middle of AB, so AX = 4 cm.','The centre lies halfway along the line.')])],
 ('Explain how a compass draws a circle and how it helps find a point at a given distance.',
  ['The fixed tip is the centre and the pencil end is at a fixed distance, the radius.','All points on the circle are the same distance from the centre.','To find a point at a given distance from one or two points, draw circles or arcs of that radius and look where they meet.','This avoids trial and error with a ruler.'],
  ['Letting the compass radius change while drawing.','Drawing a full circle when only a small arc is needed.','Naming a rectangle with corners out of order.','Forgetting to check the 90 degree angles after drawing.']),
 ['A compass draws a circle: the fixed tip is the centre and the distance to the pencil is the radius.','All points on a circle are the same distance from its centre.','A rectangle has equal opposite sides and four 90 degree angles; a square has all sides equal and four 90 degree angles.','Corners of a figure are named in order around it, so ABCD is valid but ABDC is not.','To find a point at a given distance from a point, draw an arc of that radius.','The point where two arcs meet is the same distance from both centres, and this builds rectangles and other figures exactly.'],
 [mcq('1',1,'The distance from the centre of a circle to any point on it is called the','radius',[('diameter','The diameter goes across the circle through the centre.'),('perimeter','The perimeter is the length of the boundary.')],'The compass opening sets the radius.'),
  num('2',1,'A circle has a radius of 4 cm. How far is any point on it from the centre in cm?',4,'Every point is a radius away.',[(8,'8 cm is the diameter.'),(2,'2 cm is half of the radius.')],'cm'),
  tf('3',1,'All the points on a circle are the same distance from its centre.',True,'That is the definition of a circle.'),
  mcq('4',1,'Which of these is NOT a valid name for rectangle ABCD?','ABDC',[('BCDA','This follows the corners in order.'),('DCBA','This follows the corners in order, in reverse.')],'ABDC jumps across the figure.'),
  mcq('5',2,'Which property is true for every rectangle?','Opposite sides are equal and all angles are 90 degrees',[('All sides are equal','Only a square has all sides equal.'),('All angles are 60 degrees','A rectangle has right angles.')],'These are properties R1 and R2.'),
  num('6',2,'A wave on AB = 8 cm is one half circle. What radius, in cm, is used?',4,'Diameter 8, radius 4.',[(8,'8 cm is the diameter.'),(16,'16 cm is double the diameter.')],'cm'),
  mcq('7',2,'A point is 5 cm from B and also 5 cm from C. How do we find it with a compass?','Draw arcs of radius 5 cm from B and C and mark where they meet',[('Draw one circle of radius 10 cm','One circle gives points at one distance from one centre only.'),('Measure by ruler until it fits','Trial and error is slow and not exact.')],'The crossing point is on both arcs.'),
  tf('8',2,'If a diagonal splits a rectangle angle into 45 and 45 degrees, the rectangle is a square.',True,'Both adjacent sides then become equal.'),
  mcq('9',3,'To construct a rectangle with side 4 cm and diagonal 8 cm, the first arc is drawn with centre D and radius','8 cm',[('4 cm','4 cm gives only the side.'),('12 cm','12 is the sum, not the diagonal.')],'DB is the diagonal.'),
  mcq('10',3,'Why do we draw only a small arc rather than the full circle?','Only the part near the required point is needed',[('A compass cannot draw a full circle','A compass can draw complete circles.'),('Arcs are more accurate than circles','Both are equally exact; a small arc just saves effort.')],'The meeting point is all that matters.')],
 svgs=[('c6-maths-constructions','A circle with centre P and radius, and two arcs from B and C meeting at A','Circle and equidistant point')],
 keep=['compass','circle','radius','centre','arc','rectangle','perpendicular'])
