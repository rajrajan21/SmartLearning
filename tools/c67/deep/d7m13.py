import sys,os,math
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">Perpendicular bisector with ruler and compass</text>'
    b+='<line x1="40" y1="150" x2="260" y2="150" stroke="#333" stroke-width="3"/><text x="28" y="172">X</text><text x="262" y="172">Y</text>'
    b+='<path d="M 150 60 A 130 130 0 0 1 250 150" fill="none" stroke="#1f618d" stroke-dasharray="4 3"/>'
    b+='<path d="M 150 240 A 130 130 0 0 0 250 150" fill="none" stroke="#1f618d" stroke-dasharray="4 3"/>'
    b+='<line x1="150" y1="50" x2="150" y2="250" stroke="#c0392b" stroke-width="2"/><text x="156" y="48" fill="#c0392b">A</text><text x="156" y="262" fill="#c0392b">B</text><text x="156" y="144" font-size="14">O</text>'
    b+='<text x="30" y="276" font-size="13">XA = YA = XB = YB, so AB is the perpendicular bisector of XY</text>'
    cx,cy,r=500,150,50
    pts=[(cx+r*math.cos(math.radians(60*k)),cy-r*math.sin(math.radians(60*k))) for k in range(6)]
    b+='<polygon points="'+' '.join(f'{x:.0f},{y:.0f}' for x,y in pts)+'" fill="#d6eaf8" stroke="#1f618d" stroke-width="2"/>'
    for k in range(3): b+=f'<line x1="{pts[k][0]:.0f}" y1="{pts[k][1]:.0f}" x2="{pts[k+3][0]:.0f}" y2="{pts[k+3][1]:.0f}" stroke="#1f618d"/>'
    b+='<text x="410" y="40" font-weight="bold" font-size="15">Regular hexagon = 6 equilateral triangles</text>'
    b+='<text x="420" y="222" font-size="14">6 × 60 degrees = 360 degrees at the centre</text>'
    b+='<text x="420" y="246" font-size="14">Tilings: triangles, squares, hexagons tile the plane</text>'
    b+='<text x="420" y="270" font-size="14">(no gaps, no overlaps)</text>'
    return b
svgfile('c7-maths-constructions-tilings.svg',700,290,d())
chapter(7,'maths','constructions-and-tilings','Constructions and Tilings',
 ('Drawing exactly, covering completely','In Grade 6 we drew an eye with two arcs. Now we ask why the construction works, and we use congruent triangles to prove it. Then we build 90, 45 and 60 degree angles, parallel lines, arches and a hexagon with just a ruler and compass, and finally we study how shapes can cover a floor without gaps.'),
 [('The perpendicular bisector',[
   'To draw an eye symmetrically we need two centres A and B so that the upper and lower arcs are mirror images in the line XY. Each arc passes through X and Y, so AX = AY and BX = BY.',
   'Draw arcs of the same radius from X and from Y above and below the line. The two crossing points A and B are at equal distances from X and from Y, so AX = AY = BX = BY. Join AB, meeting XY at O.',
   'Why is AB the perpendicular bisector? Triangles AOX and AOY have AX = AY, the side AO common, and AB is a line of symmetry. Using congruence, O is the midpoint of XY and the angles at O are equal; as they add to 180 degrees, each is 90 degrees.',
   'A perpendicular bisector divides a segment into two equal parts at a right angle. Any point at equal distance from X and Y lies on it. So any two such points C and D also lie on the line AB, and eyes of different shapes can be drawn by choosing other centres on AB.',
   'This needs only an unmarked ruler and a compass. It finds the midpoint of a segment more accurately than measuring with a scale.']),
  ('A 90 degree angle, and ropes in the Sulba-Sutras',[
   'The method for the perpendicular bisector gives a 90 degree angle at any point on a line. Mark equal distances on both sides of the point, draw arcs from these two points, and join the point to where the arcs cross.',
   'Ancient Indian texts called the Sulba-Sutras, which are part of the Vedangas, describe how to build fire altars. Their constructions use a rope as the compass, and the same rope stretched is the ruler.',
   'In the Katyayana Sulba-sutra, pegs are fixed at X and Y. A rope with loops at both ends is folded to find its midpoint, the loops are fastened on the pegs, and the midpoint is pulled taut above XY. The taut position A lies at equal distance from X and Y.']),
  ('Bisecting and copying angles',[
   'To make an 8-petalled figure we need 45 degree angles, half of a 90 degree angle. To bisect an angle with vertex O, cut equal arcs on the two arms at A and B, then draw arcs of equal radius from A and from B that meet at C. Join OC.',
   'The triangles OAC and OBC have OA = OB, AC = BC and OC common, so they are congruent by SSS. Hence angle AOC = angle BOC, and OC is the angle bisector.',
   'We can also copy an angle exactly. From the vertex A draw an arc cutting the arms at B and C. Draw the same arc on the new line from X to meet it at Y. Measure BC with the compass and transfer it on that arc from Y to Z. Triangles ABC and XYZ are congruent by SSS, so the angle at X equals the angle at A.',
   'Equal copies of an angle are needed for repeating designs. Copying an angle is also how we draw parallel lines.']),
  ('Parallel lines, arches and the 60 degree angle',[
   'To draw a line parallel to m through a point B, draw a transversal l through B, and construct at B an angle equal to the corresponding angle where l meets m. Equal corresponding angles mean the lines are parallel.',
   'Arches such as the one in the Diwan-i-Aam of the Red Fort are built by drawing support lines first. For the arch to be symmetrical, AB = CD and angles BAD and CDA are equal. Arcs from the support lines then complete the shape, and changing the radius gives a pointed arch.',
   'To construct a 60 degree angle at A on a line AX, draw an arc with centre A cutting the line at B, then draw an arc of the same radius from B to meet the first arc at C. Triangle ABC has three equal sides, so it is equilateral, and angle CAX = 60 degrees.']),
  ('The regular hexagon',[
   'A regular polygon has equal sides and equal angles. A regular triangle is equilateral and a regular quadrilateral is a square. A regular pentagon needs more theory, but a regular hexagon is within reach.',
   'Six equilateral triangles can meet at a point with no gap and no overlap because the angles around a point add to 360 degrees and six angles of 60 degrees make 360.',
   'Placing them together gives a hexagon with equal sides and each angle 60 + 60 = 120 degrees. Opposite corners joined, such as AD, BE and CF, are straight lines through the centre.',
   'To construct a regular hexagon of side 5 cm, make an equilateral triangle on the side and repeat around the centre. A 6-pointed star can be built from the same triangles.']),
  ('Tilings',[
   'Covering a region with shapes without gaps or overlaps is called tiling. A tangram is a Chinese puzzle of 7 pieces that can be rearranged into many figures.',
   'A 4 × 6 grid can be tiled with 2 × 1 tiles, which may be rotated, because each column has an even number of squares and can be covered by vertical tiles. A 5 × 7 grid has 35 squares, which is odd, and each tile covers 2 squares, so it cannot be tiled.',
   'If m and n are both even, an m × n grid can be tiled. If one is even, it can be tiled. If both are odd, the number of squares is odd and it cannot.',
   'Colour the squares black and white like a chessboard. Every 2 × 1 tile covers one black and one white square, so a tileable region must have equal numbers of both. A region with 8 white and 6 black squares can never be tiled.',
   'The entire plane can be tiled with equilateral triangles, squares or regular hexagons. Bees build hexagonal cells for their hives, which waste no space. Escher tiled the plane with animal shapes, and mathematicians are still exploring tilings.'])],
 [('Explain why the line through the two crossing points of the arcs bisects the segment XY at a right angle.',[('A and B are at equal distances from X and Y: AX = AY and BX = BY.','Equal arcs were drawn from X and from Y.'),('In triangles AOX and AOY, AX = AY, AO is common, and AB is a line of symmetry so angle XAO = angle YAO.','Use congruence.'),('So the triangles are congruent by SAS and OX = OY, and angle AOX = angle AOY.','Corresponding parts are equal.'),('The two angles add to 180 degrees, so each is 90 degrees.','They form a straight line.')]),
  ('How do you construct a 45 degree angle?',[('Construct a 90 degree angle at a point using the perpendicular construction.','The right angle is the starting point.'),('Bisect it: cut equal arcs on the two arms, then arcs of equal radius from those points to meet at C.','The bisector construction.'),('Join the vertex to C. Triangles formed are congruent by SSS, so each half is 45 degrees.','The angle bisector divides the angle equally.')]),
  ('Why do six equilateral triangles fit exactly around a point?',[('Each angle of an equilateral triangle is 60 degrees.','The three angles are equal and add to 180 degrees.'),('Six angles of 60 degrees add to 360 degrees.','6 × 60 = 360.'),('The angles around a point add to 360 degrees, so there is no gap or overlap.','So they form a regular hexagon.')]),
  ('Can a 5 × 7 grid be tiled with 2 × 1 tiles?',[('The grid has 5 × 7 = 35 squares.','Count the unit squares.'),('Each tile covers 2 squares, so the squares covered are always even.','Two squares per tile.'),('35 is odd, so the grid cannot be tiled.','The numbers do not match.')])],
 ('Explain to a friend how to construct the perpendicular bisector and why it works, and which regular polygons can tile the plane.',['Equal arcs from both ends give two points equally distant from X and Y; joining them gives the perpendicular bisector.','Congruent triangles show the midpoint and the right angle.','Equilateral triangles, squares and regular hexagons tile the plane because their angles fit around a point to make 360 degrees.'],['Using different radii for the two arcs on one side.','Thinking a tileable region needs no colour check.','Forgetting that angles around a point add up to 360 degrees.']),
 ['Any point equidistant from the ends of a segment lies on its perpendicular bisector.','The perpendicular bisector is constructed with a ruler and compass and proved using congruent triangles.','An angle can be bisected and copied using SSS congruence; 60 degrees comes from an equilateral triangle.','Six equilateral triangles meet at a point to form a regular hexagon.','Tiling covers a region with no gaps or overlaps; a chessboard colouring test shows when a 2 × 1 tiling is impossible.','Triangles, squares and regular hexagons can tile the plane.'],
 [mcq('1',1,'The perpendicular bisector of a segment','passes through its midpoint at right angles',[('is parallel to it','A parallel line never meets the segment.'),('is twice its length','The bisector is a line, with no fixed length.')],'It bisects and is perpendicular.'),
  mcq('2',1,'Each angle of an equilateral triangle is','60 degrees',[('90 degrees','Three right angles would add to 270.'),('120 degrees','Three such angles would add to 360.')],'180 ÷ 3 = 60.'),
  tf('3',1,'A point equidistant from X and Y lies on the perpendicular bisector of XY.',True,'That property is why the arc construction works.'),
  mcq('4',1,'Angles around a point add up to','360 degrees',[('180 degrees','That is the angle on a straight line.'),('90 degrees','That is one right angle.')],'A full turn is 360 degrees.'),
  num('5',2,'How many equilateral triangles fit around a point to form a regular hexagon?',6,'360 ÷ 60 = 6.',[(3,'Three would leave a gap of 180 degrees.'),(4,'Four would leave a gap of 120 degrees.')]),
  mcq('6',2,'Each interior angle of a regular hexagon is','120 degrees',[('60 degrees','That is the angle of one triangle; a corner has two triangles.'),('90 degrees','That is the angle of a square.')],'Two 60-degree angles meet at each corner.'),
  mcq('7',2,'Which grid can NOT be tiled with 2 × 1 tiles?','5 × 7',[('4 × 6','It has 24 squares and each column can take vertical tiles.'),('4 × 7','It has 28 squares and can be covered column by column.')],'35 squares is odd.'),
  mcq('8',2,'To bisect an angle, after cutting equal arcs on both arms we draw','arcs of equal radius from those two points to cross',[('a line parallel to an arm','That does not divide the angle.'),('a circle through the vertex','It does not locate the bisector.')],'The crossing point lies on the bisector.'),
  mcq('9',3,'A region has 8 white and 6 black squares in a chessboard colouring. It','cannot be tiled with 2 × 1 tiles',[('can be tiled','Each tile covers one white and one black square, so the counts must be equal.'),('can be tiled only with rotated tiles','Rotation does not change the colours covered.')],'Each tile covers one of each colour.'),
  mcq('10',3,'Which of these can tile the plane by itself?','a regular hexagon',[('a regular pentagon','Its angles of 108 degrees do not fit around a point.'),('a circle','Circles leave gaps between them.')],'Hexagon angles of 120 degrees fit three around a point.')],
 svgs=[('c7-maths-constructions-tilings','Perpendicular bisector construction with two arcs and a regular hexagon made of six triangles','Constructions and tilings')],
 keep=['perpendicular bisector','angle bisector','hexagon','tiling','congruent'])
