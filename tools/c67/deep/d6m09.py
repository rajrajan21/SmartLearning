import sys,os,math
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="24" font-weight="bold">Lines of symmetry of a square, and three radial arms 120 degrees apart</text>'
    x0,y0,s=40,50,160
    b+=f'<rect x="{x0}" y="{y0}" width="{s}" height="{s}" fill="#d6eaf8" stroke="#1b4f72" stroke-width="3"/>'
    for (a,c,d,e) in [(x0+s/2,y0-10,x0+s/2,y0+s+10),(x0-10,y0+s/2,x0+s+10,y0+s/2),(x0-10,y0-10,x0+s+10,y0+s+10),(x0+s+10,y0-10,x0-10,y0+s+10)]:
        b+=f'<line x1="{a}" y1="{c}" x2="{d}" y2="{e}" stroke="#c0392b" stroke-width="2" stroke-dasharray="6 4"/>'
    b+=f'<text x="{x0}" y="{y0+s+32}" font-size="14">Square: 4 lines of symmetry</text>'
    cx,cy,r=400,130,80
    cols=['#e67e22','#27ae60','#8e44ad']
    for i in range(3):
        ang=math.radians(-90+120*i)
        b+=f'<line x1="{cx}" y1="{cy}" x2="{cx+r*math.cos(ang):.1f}" y2="{cy+r*math.sin(ang):.1f}" stroke="{cols[i]}" stroke-width="8" stroke-linecap="round"/>'
        b+=f'<circle cx="{cx+r*math.cos(ang):.1f}" cy="{cy+r*math.sin(ang):.1f}" r="12" fill="{cols[i]}"/>'
    b+=f'<circle cx="{cx}" cy="{cy}" r="5" fill="#222"/><text x="{cx+10}" y="{cy+4}" font-size="13">centre</text>'
    b+=f'<text x="300" y="{y0+s+32}" font-size="14">Angles of symmetry: 120, 240, 360 degrees</text>'
    return b
svgfile('c6-maths-symmetry.svg',600,260,dia())
secs=[
 ('Symmetry: parts that repeat in a pattern',[
  'Look around you and you will meet beautiful things: a flower, a butterfly, a rangoli, a pinwheel, the Taj Mahal, a temple gopuram.',
  'What makes them so pleasing? Some part of each figure is repeated, and the repetition follows a definite pattern.',
  'In the rangoli, the red petals come back onto themselves when the whole flower is turned by 90 degrees about the centre.',
  'The pinwheel has a different kind of repetition: one small shape is stuck on each side of a hexagon, and it repeats as we move around the boundary.',
  'Now look at a picture of clouds. There is no repeating pattern at all, so we say the clouds are not symmetrical.',
  'So a figure is symmetrical when it has a part or parts that repeat in some definite pattern, and in this chapter we study two kinds of symmetry.']),
 ('Line of symmetry',[
  'Take a blue triangle with a dotted line through it. Fold along the dotted line and one half covers the other half exactly. We call these mirror halves.',
  'Now take a figure made of four puzzle pieces with a dotted line down the middle. When we fold it, the left half does not fit over the right half, so these are not mirror halves.',
  'A line that cuts a figure into two parts that overlap exactly when folded along it is called a line of symmetry of the figure.',
  'In the figures at the start of the chapter, the flower has 6 lines of symmetry, the rangoli has 4 and the butterfly has 1. The pinwheel and the clouds have none.']),
 ('More than one line of symmetry',[
  'Does a square have only one line of symmetry? Take a square piece of paper and fold it to find out.',
  'Fold it in half vertically, then horizontally, and open it out: those are two lines of symmetry. Fold it along one diagonal, then along the other diagonal: two more.',
  'No other fold makes the two halves overlap, so a square has exactly 4 lines of symmetry.',
  'What about a rectangle that is not a square? Its two lines through the middle of opposite sides work, but its diagonal does not. Folding along the diagonal leaves parts sticking out, so a rectangle has only 2 lines of symmetry.']),
 ('Reflection',[
  'When we fold along a line of symmetry, we can also say that each side of the figure is reflected by the line onto the other side.',
  'Label the corners of a square A, B, C, D. Reflect it in the vertical line of symmetry and A and B swap places, while D and C swap places.',
  'Reflect it along the diagonal from A to C and A and C stay where they are, but B and D swap. A figure with a line of symmetry is therefore said to have reflection symmetry.']),
 ('Making symmetric shapes by folding',[
  'There are fun ways to make symmetric figures. For an ink blot, fold paper in half, drop a little ink on one half, press the halves together and open it. The fold is the line of symmetry.',
  'For paper cutting, fold a sheet and cut along some shape. When you unfold it, the fold line becomes a line of symmetry and the cut appears on both sides.',
  'In the punching game, you punch holes in a folded square sheet. Each hole you punch appears again on the other side of the fold, at the same distance from it.',
  'To get a square hole in the centre, fold the paper horizontally and then vertically so the centre is at a closed corner, and cut a small square there.']),
 ('Rotational symmetry',[
  'A paper windmill looks symmetrical, yet it has no line of symmetry: folding it does not make the halves overlap. But turn it by 90 degrees about its centre and it looks exactly the same. This is rotational symmetry.',
  'The fixed point we turn about is called the centre of rotation, and an angle through which a figure can be turned to look exactly the same is called an angle of symmetry.',
  'The windmill has angles of symmetry 90, 180, 270 and 360 degrees. Every figure looks the same after a full turn of 360 degrees, so 360 is always an angle of symmetry.',
  'A square also has 4 angles of symmetry: a 90 degree turn takes A to B, B to C, C to D and D back to A.',
  'A figure has rotational symmetry only if it has an angle of symmetry strictly between 0 and 360 degrees. A strip that matches itself only after a full turn has no rotational symmetry.']),
 ('Figures with radial arms',[
  'A figure with 4 radial arms, 90 degrees apart, has 4 angles of symmetry. Change the arms so only opposite ones match and it has just 2 angles of symmetry.',
  'Can we get exactly 3 angles of symmetry with 3 arms? If the arms are not equally spaced, only the full turn works. For all three to overlap their rotated copies, the three angles must be equal.',
  'The full turn of 360 degrees is shared equally, so each angle is 360 divided by 3, which is 120 degrees. Now the angles of symmetry are 120, 240 and 360 degrees.',
  'With 5 equally spaced arms, the smallest angle is 360 divided by 5, which is 72 degrees, so the angles are 72, 144, 216, 288 and 360. With 6 arms they are 60, 120, 180, 240, 300 and 360.',
  'With 7 arms the smallest angle is 360 divided by 7, which is not a whole number: it is 51 and 3 sevenths of a degree.']),
 ('Patterns in angles of symmetry',[
  'List the angles for 2, 3 and 4 angles of symmetry: 180 and 360; 120, 240 and 360; 90, 180, 270 and 360. In each case they are all multiples of the smallest angle.',
  'The number of angles of symmetry of a figure is also called its order of rotational symmetry.',
  'If the smallest angle of symmetry is a whole number of degrees, then it is a factor of 360, because the repeated turns must add up exactly to one full turn.',
  'So a figure can have a smallest angle of 45 degrees, since 45 times 8 is 360. It cannot have 17 degrees, because 360 is not a multiple of 17.']),
 ('The circle, and lines and angles together',[
  'The circle is the most symmetric figure. Rotate it about its centre by any angle and it looks the same, so every angle is an angle of symmetry.',
  'Every diameter is a line of symmetry of the circle, so it has too many lines of symmetry to count.',
  'Fans, flowers and wheels all show rotational symmetry. The Ashoka Chakra has 24 lines of symmetry and 24 angles of symmetry.',
  'Some figures have lines of symmetry but no angles, some have angles but no lines, and some have both. A parallelogram that is not a rectangle has rotational symmetry (180 degrees) but no line of symmetry.',
  'The new Parliament building in Delhi has 3 lines of symmetry and angles of symmetry 120, 240 and 360 degrees.'])]
ex=[
 ('How many lines of symmetry does a rectangle that is not a square have, and does its diagonal count?',
  [('Fold the rectangle in half through the middles of opposite sides, both ways.','Each fold makes mirror halves, so these are 2 lines of symmetry.'),
   ('Try folding along a diagonal.','The two parts do not overlap exactly, so the diagonal is not a line of symmetry.'),
   ('Count the lines.','A rectangle has exactly 2 lines of symmetry.')]),
 ('Find the smallest angle of symmetry and all angles for a figure with 6 equally spaced radial arms.',
  [('Share the full turn equally among the 6 arms.','The smallest angle is 360 / 6 = 60 degrees.'),
   ('List the multiples of 60 up to 360.','All angles of symmetry are multiples of the smallest one.'),
   ('Write the answer.','60, 120, 180, 240, 300 and 360 degrees: 6 angles of symmetry.')]),
 ('A figure has 60 degrees as an angle of symmetry and two angles of symmetry smaller than 60 degrees. What is its smallest angle?',
  [('Angles of symmetry are multiples of the smallest angle.','So 60 is a multiple of the smallest angle.'),
   ('The figure has two smaller angles, so 60 is the third multiple.','Angles come as 1 times, 2 times, 3 times the smallest.'),
   ('Divide.','60 / 3 = 20 degrees.')]),
 ('Is it possible to have a figure whose smallest angle of symmetry is 17 degrees?',
  [('Angles of symmetry are multiples of the smallest angle, and 360 must be one of them.','A full turn is always an angle of symmetry.'),
   ('Check if 360 is a multiple of 17.','17 times 21 is 357 and 17 times 22 is 374, so it is not.'),
   ('Conclude.','No such figure exists, but 45 degrees is possible because 360 / 45 = 8.')])]
qs=[
 mcq('1',1,'A figure has a line of symmetry when','folding along the line makes the two parts overlap exactly',[('it has two equal sides','Equal sides alone do not guarantee mirror halves.'),('it looks the same after a full turn','Every figure does that; it is rotational symmetry, not a fold.')],'Mirror halves are the test for a line of symmetry.'),
 num('2',1,'How many lines of symmetry does a square have?',4,'Vertical, horizontal and two diagonals.',[(2,'2 counts only the vertical and horizontal lines.'),(1,'A square has more than one.')]),
 tf('3',1,'The diagonal of a rectangle that is not a square is a line of symmetry.',False,'Folding along the diagonal leaves parts that do not overlap.'),
 num('4',1,'How many lines of symmetry does the butterfly in the chapter have?',1,'A butterfly has one line down its body.',[(0,'It does have one line.'),(2,'Only one fold makes both wings match.')]),
 mcq('5',2,'The smallest angle of symmetry of a figure with 5 equally spaced radial arms is','72 degrees',[('60 degrees','60 is for 6 arms.'),('90 degrees','90 is for 4 arms.')],'360 divided by 5 is 72.'),
 num('6',2,'A figure has 3 equally spaced radial arms. What is its smallest angle of symmetry in degrees?',120,'360 divided by 3.',[(60,'60 would be for 6 arms.'),(90,'90 is for 4 arms.')],'degrees'),
 tf('7',2,'Every figure has 360 degrees as an angle of symmetry.',True,'A full turn brings any figure back to itself.'),
 mcq('8',2,'Which figure has every angle as an angle of symmetry?','A circle',[('A square','A square works only for multiples of 90 degrees.'),('A windmill','The paper windmill works for multiples of 90 degrees.')],'A circle looks the same after any turn about its centre.'),
 num('9',3,'A figure has 60 degrees as its smallest angle of symmetry. How many angles of symmetry (including 360) does it have?',6,'60, 120, 180, 240, 300, 360.',[(5,'5 forgets the full turn of 360 degrees.'),(3,'That counts only up to 180.')]),
 mcq('10',3,'Which could be the smallest angle of symmetry of a figure?','45 degrees',[('17 degrees','360 is not a multiple of 17.'),('50 degrees','360 is not a multiple of 50.')],'The smallest angle must divide 360 exactly.')]
chapter(6,'maths','symmetry','Symmetry',
 ('Why does a butterfly look so balanced?','Hold a butterfly picture next to a mirror and the wings look the same on both sides. A rangoli looks the same after you turn it a quarter of the way round. A cloud, on the other hand, looks different from every side. Today we learn the two kinds of symmetry that make some figures so pleasing, and how to count them.'),
 secs,ex,
 ('Explain the difference between line symmetry and rotational symmetry with one example of each.',
  ['A line of symmetry splits a figure into two mirror halves that overlap when folded.','Rotational symmetry means the figure looks the same after turning it through an angle about a fixed centre.','The angles of symmetry are multiples of the smallest angle and always include 360 degrees.','A figure can have only lines, only angles, or both.'],
  ['Thinking every diagonal of a rectangle is a line of symmetry.','Forgetting that 360 degrees is also an angle of symmetry.','Believing a figure with a line of symmetry must have rotational symmetry.','Counting the angles of symmetry from 0 degrees instead of up to 360.']),
 ['A symmetrical figure has parts that repeat in a definite pattern.','A line of symmetry splits a figure into two parts that overlap exactly when folded.','A figure can have many lines of symmetry: a square has 4, a rectangle that is not a square has 2.','A figure has rotational symmetry if it looks the same after a turn about its centre of rotation by an angle between 0 and 360 degrees.','Angles of symmetry are multiples of the smallest angle, and 360 degrees is always one.','A circle has every angle as an angle of symmetry and every diameter as a line of symmetry.'],
 qs,svgs=[('c6-maths-symmetry','A square with 4 dashed lines of symmetry and a 3-arm figure with arms 120 degrees apart','Line and rotational symmetry')],
 keep=['symmetry','line of symmetry','rotational symmetry','angle of symmetry','centre of rotation','reflection'])
