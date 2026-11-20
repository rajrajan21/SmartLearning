import sys,os,math
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="26" font-weight="bold">Types of angles by their degree measure</text>'
    items=[('Acute',40,'less than 90°'),('Right',90,'exactly 90°'),('Obtuse',135,'90° to 180°'),('Straight',180,'exactly 180°'),('Reflex',250,'180° to 360°')]
    for i,(n,th,d) in enumerate(items):
        cx=70+i*115; cy=150; L=55
        r=math.radians(th); ex=cx+L*math.cos(r); ey=cy-L*math.sin(r)
        b+=f'<line x1="{cx}" y1="{cy}" x2="{cx+L}" y2="{cy}" stroke="#222" stroke-width="3"/><line x1="{cx}" y1="{cy}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="#c0392b" stroke-width="3"/>'
        R=22; ax=cx+R*math.cos(r); ay=cy-R*math.sin(r); large=1 if th>180 else 0
        b+=f'<path d="M {cx+R} {cy} A {R} {R} 0 {large} 0 {ax:.1f} {ay:.1f}" fill="none" stroke="#2980b9" stroke-width="2"/>'
        b+=f'<text x="{cx-30}" y="{cy+48}" font-weight="bold">{n}</text><text x="{cx-30}" y="{cy+68}" font-size="13">{d}</text>'
    b+='<text x="20" y="262" font-size="14">A full turn is 360°, a half turn (straight angle) is 180°, a quarter turn (right angle) is 90°.</text>'
    return b
svgfile('c6-maths-angle-types.svg',600,285,dia())
chapter(6,'maths','lines-and-angles','Lines and Angles',
 ('Vidya opens her book','Vidya opens the cover of her book a little, then more, then flat on the table, then all the way around. At every stage the cover and the first page make an angle, and the angle keeps growing. How can we name such an angle, compare it with another, and give it a number? That is what we find out in this chapter, starting from the simplest ideas of geometry: points, lines and rays.'),
 [('Point, line segment, line and ray',[
   'A point is a precise location. It has no length, breadth or height. The tip of a sharpened pencil or a needle gives an idea of a point, and we name points with capital letters like Z, P and T.',
   'Fold a paper and unfold it. The crease shows a line segment. The shortest path from point A to point B, including A and B, is the line segment AB, and A and B are its end points.',
   'If we extend the segment AB beyond both ends without stopping, we get a line. We can never draw a complete line, because it goes on forever in both directions. A line is written as line AB or with a small letter like l or m.',
   'Any two points determine exactly one line passing through both. Through a single point, however, we can draw as many lines as we like.',
   'A ray is a part of a line that starts at one point and goes on forever in one direction, like a beam of light from a torch. A ray starting at A and passing through P is written as ray AP. Ray OA and ray AO are different rays, because their starting points are different.']),
  ('Angles: vertex, arms and naming',[
   'An angle is formed by two rays with a common starting point. The common starting point is the vertex and the two rays are the arms.',
   'For rays BD and BE with vertex B, we write angle DBE or angle EBD, using the symbol ∠. The vertex is always the middle letter. When more than one angle meets at a point, we cannot call it just angle B, so ∠APB cannot be shortened to ∠P.',
   'The size of an angle is the amount of rotation, or turn, needed about the vertex to move the first arm onto the second. Open a book cover a little and the angle is small; turn it more and the angle gets larger.',
   'The size of an angle does not depend on how long the arms are. Drawing longer arms does not make an angle bigger.',
   'Angles appear when we open a pair of scissors, a divider or a pair of spectacles. In each, the joint is the vertex and the two blades or arms are the arms of the angle.']),
  ('Comparing angles',[
   'To compare two angles, trace one and place it over the other so that the vertices coincide and one arm lies on the same line. This is called superimposition. The angle whose second arm lies outside is the larger one.',
   'If both vertices and both pairs of arms lie exactly on top of each other, the angles are equal, because the same amount of rotation is needed in both.',
   'We can also compare angles without superimposing them, by using a transparent circle. Place the centre on the vertex of an angle, mark where the arms cut the circle, then place it on the second angle and see which arc is larger.',
   'Make rotating arms from two paper straws and a paper clip. A rotating arm passes through a slit only if the angle of the slit equals the angle between the straws; the lengths of the straws do not matter, as long as they are short enough.']),
  ('Straight, right, acute, obtuse and reflex angles',[
   'Turn the book cover through a half turn so it lies flat. The two arms now lie on one straight line, and the angle is called a straight angle.',
   'Fold the paper so one arm falls on the other arm. The crease divides the straight angle into two equal angles. Each of these is a right angle, so a straight angle contains two right angles, and a right angle is a quarter turn. Two lines that meet at a right angle are called perpendicular lines.',
   'An angle smaller than a right angle is acute (sharp). An angle bigger than a right angle but smaller than a straight angle is obtuse (blunt). An angle between a straight angle and a full turn is called reflex.']),
  ('Measuring angles in degrees',[
   'To give an angle a number, mathematicians divided the angle at the centre of a circle into 360 equal parts. The size of each part is 1 degree, written 1°. The measure of an angle is the number of 1° parts inside it.',
   'A full turn is 360°. A straight angle, half a turn, is 180°. A right angle, a quarter turn, is 90°. An acute angle is between 0° and 90°, an obtuse angle between 90° and 180°, and a reflex angle between 180° and 360°.',
   'Why 360? The ancient Rigveda mentions a wheel with 360 spokes, and old calendars counted 360 days in a year. Practically, 360 can be divided evenly by every number from 1 to 10 except 7, and by 12 and 24, so a circle can be cut into many equal parts using whole degrees.',
   'A protractor is a half circle divided into 180 equal parts. To measure an angle, place the centre of the protractor on the vertex and make one arm pass through the 0° mark. Then read the number where the other arm crosses the scale, using the scale that starts from 0 on that arm. If the arm does not start at 0, subtract the two readings.',
   'We can fold a paper circle to make our own protractor. Folding in half gives 180°, folding again gives 90°, and folding again gives 45° and 135°. The line that divides an angle into two equal parts is called its angle bisector.']),
  ('Drawing angles and angles in life',[
   'To draw ∠TIN of 30°, draw ray IN, place the protractor centre at I with IN on the 0° line, count 30° from 0, mark T, and join I to T.',
   'Angles appear in clocks. At 1 o\'clock the hands make 30° because the clock face is 360° and is divided into 12 equal hours; 360 ÷ 12 = 30. At 3 o\'clock the angle is 90° and at 6 o\'clock it is 180°.',
   'Angles also describe how far a door is open, the slope of a slide, the height of a swing, and how much an insect has rotated. Measure the three angles of any triangle and add them: you will find the sum close to 180° every time, which we will explain in a later year.'])],
 [('In the figure ∠TER = 80° and ∠REB is a straight angle. Find ∠BET.',[('A straight angle measures 180°, so ∠REB = 180°.','Use the definition of a straight angle.'),('∠REB is made of ∠TER and ∠BET together.','The ray ET divides the straight angle into two parts.'),('∠BET = 180° - 80° = 100°.','It is an obtuse angle.')]),
  ('What is the angle between the hands of a clock at 4 o\'clock?',[('One hour mark covers 360° ÷ 12 = 30°.','A full turn of the clock face is 360°.'),('At 4 o\'clock the hands are 4 hour marks apart.','The hour hand is at 4 and the minute hand at 12.'),('Angle = 4 × 30° = 120°.','This is an obtuse angle.')]),
  ('The Ashoka Chakra has 24 spokes. Find the angle between two neighbouring spokes and the largest acute angle between any two spokes.',[('The full turn is 360° divided equally among 24 spokes.','The spokes are equally spaced.'),('360° ÷ 24 = 15°.','Angle between two neighbouring spokes.'),('The largest acute angle is below 90°. 5 gaps give 75° and 6 gaps give 90°, which is a right angle, so the answer is 75°.','Count the number of 15° gaps that stay under 90°.')]),
  ('How many lines and how many angles can you name from four points A, B, C, D, no three on one line?',[('Each pair of points makes a line: AB, AC, AD, BC, BD, CD.','4 points give 6 pairs.'),('At each point, two of the other three points make an angle with it: 3 angles at each point.','For example at A: ∠BAC, ∠BAD, ∠CAD.'),('4 × 3 = 12 angles.','So 6 lines and 12 angles.')])],
 ('Explain to a friend what an angle is, how its size is measured in degrees, and how to use a protractor to measure it.',['An angle is two rays with a common starting point, and its size is the amount of turn between the arms.','A full turn is 360 degrees, a half turn is 180 degrees and a right angle is 90 degrees.','Place the protractor centre on the vertex, put one arm on the 0 line, and read the scale where the other arm crosses.'],['Thinking longer arms make a bigger angle.','Reading the wrong scale of the protractor.','Calling ∠APB just ∠P when other angles share the vertex.']),
 ['A point shows a location, a line segment is the shortest path between two points, a line goes on forever both ways, and a ray starts at a point and goes on forever one way.','An angle is made by two rays with a common starting point called the vertex; the vertex is the middle letter when naming it.','The size of an angle is the amount of turn between its arms, not the length of the arms.','A full turn is 360°, a straight angle is 180° and a right angle is 90°.','Acute angles are less than 90°, obtuse between 90° and 180°, and reflex between 180° and 360°.','A protractor measures angles; an angle bisector divides an angle into two equal angles.'],
 [mcq('1',1,'Which of these has no end points at all?','a line',[('a line segment','A line segment has two end points A and B.'),('a ray','A ray has one starting point, even though it never ends in one direction.')],'A line extends forever in both directions.'),
  mcq('2',1,'In ∠DBE, the vertex is','B',[('D','D is a point on one arm, written first.'),('E','E is a point on the other arm, written last.')],'The vertex is always the middle letter.'),
  tf('3',1,'The size of an angle depends on the length of its arms.',False,'It depends only on the amount of turn between the arms.'),
  num('4',1,'How many degrees are there in a straight angle?',180,'A straight angle is half of a full turn of 360°.',[(90,'That is a right angle, a quarter turn.'),(360,'That is a full turn.')],'degrees'),
  num('5',2,'∠TER = 80° and ∠REB is a straight angle. Find ∠BET in degrees.',100,'180° - 80° = 100°.',[(80,'That is ∠TER, not ∠BET.'),(10,'You subtracted 80 from 90, but ∠REB is 180°.')],'degrees'),
  num('6',2,'What is the angle between the hands of a clock at 4 o\'clock?',120,'Each hour mark is 360° ÷ 12 = 30°, and 4 × 30° = 120°.',[(30,'That is the angle at 1 o\'clock.'),(90,'That is the angle at 3 o\'clock.')],'degrees'),
  num('7',2,'The Ashoka Chakra has 24 equally spaced spokes. What is the angle between two neighbouring spokes?',15,'360° ÷ 24 = 15°.',[(24,'That is the number of spokes, not the angle.'),(30,'30° would be the angle if the wheel had 12 spokes.')],'degrees'),
  num('8',2,'How many lines can be drawn by joining four points, no three on one line?',6,'Each pair of points gives a line: AB, AC, AD, BC, BD, CD.',[(4,'That is the number of points, not the pairs.'),(12,'12 is the number of angles, not lines.')]),
  mcq('9',3,'An angle of 135° is','obtuse',[('acute','Acute angles are less than 90°.'),('reflex','Reflex angles are more than 180°.')],'It is more than 90° and less than 180°.'),
  mcq('10',3,'Why is 360 a useful number for dividing a circle?','It can be divided evenly by 1 to 10 except 7, and by 12 and 24',[('It is the only number divisible by 7','360 is not divisible by 7.'),('It equals the number of months in a year','The number of months is 12, which is unrelated to the total of 360.')],'This lets us cut the circle into many equal parts using whole degrees.')],
 svgs=[('c6-maths-angle-types','Five angles: acute, right, obtuse, straight and reflex, with their degree ranges','Types of angles')],
 keep=['angle','vertex','ray','degree','protractor','acute','obtuse','reflex'])
