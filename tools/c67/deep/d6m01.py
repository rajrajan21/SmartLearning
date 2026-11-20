import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="26" font-weight="bold">Why 1 + 3 + 5 + 7 + 9 + 11 = 36 (a 6 × 6 square of dots)</text>'
    cols=['#c0392b','#e67e22','#f1c40f','#27ae60','#2980b9','#8e44ad']
    s=34; x0=40; y0=50
    for r in range(6):
        for c in range(6):
            k=max(r,c)
            b+=f'<circle cx="{x0+c*s}" cy="{y0+r*s}" r="11" fill="{cols[k]}"/>'
    labs=['1','3','5','7','9','11']
    for i,l in enumerate(labs):
        b+=f'<rect x="300" y="{44+i*34}" width="18" height="18" fill="{cols[i]}"/><text x="326" y="{58+i*34}" font-size="15">layer {i+1} has {l} dots</text>'
    b+='<text x="40" y="270" font-size="14">Each new L-shaped layer adds the next odd number, so the first n odd numbers add up to n × n.</text>'
    return b
svgfile('c6-maths-odd-sum-squares.svg',600,290,dia())
chapter(6,'maths','patterns-in-mathematics','Patterns in Mathematics',
 ('Why is 36 special?','Count 36 dots. You can arrange them in a perfect triangle, and you can also arrange them in a perfect 6 by 6 square. Very few numbers do both. Mathematicians love such surprises, because mathematics is the search for patterns and for the reasons why they exist. In this chapter we find patterns in numbers and shapes, and then we ask why they happen.'),
 [('What is mathematics?',[
   'Mathematics is, in large part, the search for patterns and for explanations of why those patterns exist.',
   'Patterns are everywhere: in nature, in our homes and schools, in the movement of the sun, moon and stars, and in cooking, shopping, games and weather.',
   'Finding a pattern is only half the job. Mathematicians also want to know why the pattern happens, because the reason can then be used far beyond the place where it was first noticed.',
   'For example, understanding patterns in the motion of planets led to the theory of gravitation, which lets us launch satellites and send rockets to the Moon and Mars. Patterns in genomes help doctors diagnose and cure diseases.']),
  ('Patterns in numbers',[
   'The most basic patterns are patterns of whole numbers: 0, 1, 2, 3, 4 and so on. The branch of mathematics that studies them is called number theory.',
   'A number sequence is a list of numbers that follows a rule. Some famous ones are all 1s, the counting numbers, odd numbers, even numbers, triangular numbers 1, 3, 6, 10, 15, squares 1, 4, 9, 16, 25, and cubes 1, 8, 27, 64, 125.',
   'Two more are the Virahanka numbers 1, 2, 3, 5, 8, 13, 21 where each number is the sum of the two before it, and the powers of 2, which are 1, 2, 4, 8, 16, 32 and double every time. The powers of 3 are 1, 3, 9, 27, 81 and triple every time.',
   'To describe a sequence, say its rule in your own words and then use the rule to write the next three numbers. For 1, 3, 6, 10, 15, the gaps are 2, 3, 4, 5, so the next gap is 6 and the next number is 21.']),
  ('Visualising number sequences',[
   'Pictures make patterns visible. Triangular numbers are dots arranged in a triangle with rows of 1, 2, 3, 4 and so on, which is why 1, 3, 6, 10, 15 are called triangular.',
   'Square numbers are dots in a square grid: 1 by 1, 2 by 2, 3 by 3. Cube numbers are small cubes stacked into a bigger cube: 1, 8, 27, 64.',
   'The number 36 is both triangular (rows of 1 to 8 add up to 36) and square (6 by 6). So the same number can play different roles depending on the picture we draw.',
   'The numbers 1, 7, 19, 37 are called hexagonal numbers, because they are dots arranged in rings around a centre in the shape of a hexagon. The gaps are 6, 12, 18, so the next gap is 24 and the next hexagonal number is 61.']),
  ('Relations among number sequences',[
   'Sequences are related in surprising ways. Add the odd numbers: 1 = 1, 1 + 3 = 4, 1 + 3 + 5 = 9, 1 + 3 + 5 + 7 = 16, 1 + 3 + 5 + 7 + 9 = 25. We get the square numbers every time.',
   'Why does it happen forever? A picture explains it. Take a square grid of dots and split it into L-shaped layers. The first layer is 1 dot, the next 3, then 5, then 7, and so on. So a square with n dots on each side is the sum of the first n odd numbers.',
   'The picture works for a square of any size, so the first 10 odd numbers add to 10 × 10 = 100, and the first 100 odd numbers add to 100 × 100 = 10,000, without adding them one by one.',
   'Another pattern: 1, then 1 + 2 + 1, then 1 + 2 + 3 + 2 + 1, then 1 + 2 + 3 + 4 + 3 + 2 + 1 give 1, 4, 9, 16. Adding the counting numbers up and then down also gives the squares. For example 1 + 2 + ... + 100 + ... + 2 + 1 = 100 × 100 = 10,000.',
   'More relations to explore: two consecutive triangular numbers add up to a square, for example 3 + 6 = 9 and 6 + 10 = 16. Adding powers of 2 from 1 gives 1, 3, 7, 15, 31, and adding 1 to each gives the powers of 2 again. Six times a triangular number plus 1 gives the hexagonal numbers, and adding hexagonal numbers 1, 1 + 7, 1 + 7 + 19 gives the cubes 1, 8, 27.']),
  ('Patterns in shapes',[
   'Shapes also form patterns. The branch of mathematics that studies shapes is called geometry. A shape sequence is a list of shapes that follows a rule.',
   'Examples are regular polygons (triangle, quadrilateral, pentagon, hexagon, heptagon, octagon, nonagon, decagon), complete graphs K2, K3, K4, K5, stacked squares, stacked triangles and the Koch snowflake.',
   'The word regular means all the sides are equal in length and all the corners look the same. We will study angles in the next chapter.']),
  ('Shapes meet numbers',[
   'Shape sequences are linked to number sequences. The number of sides in the regular polygons goes 3, 4, 5, 6, 7, 8, 9, 10, the counting numbers from 3. The number of corners is the same, because each side joins two corners and the polygon closes up.',
   'In a complete graph, every point is joined to every other point by a line. K2, K3, K4, K5 have 1, 3, 6, 10 lines, which are the triangular numbers, because a new point is joined to all the earlier points, adding 1, then 2, then 3, then 4 lines.',
   'Stacked squares have 1, 4, 9, 16 little squares, the square numbers. Stacked triangles have rows with 1, 3, 5, 7 little triangles, so the totals 1, 4, 9, 16 are again squares.',
   'In the Koch snowflake, every line segment is replaced by a speed bump of four smaller segments. The number of segments goes 3, 12, 48, 192, which is 3 times the powers of 4. The shapes get more and more detailed, but the pattern in the numbers stays simple.'])],
 [('Find the sum of the first 15 odd numbers without adding them one by one.',[('Use the L-shaped layers picture: the first n odd numbers fill an n by n square.','The pattern explains the shortcut.'),('Here n = 15, so the sum is 15 × 15.','Square of the number of terms.'),('15 × 15 = 225.','So 1 + 3 + 5 + ... + 29 = 225.')]),
  ('Show that 36 is both a triangular number and a square number.',[('Triangular numbers are 1, 1 + 2, 1 + 2 + 3, ... Add rows: 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 = 36.','Eight rows of dots make a triangle of 36 dots.'),('Square numbers are n × n. 6 × 6 = 36.','Six rows of six dots make a square.'),('Hence 36 is in both lists.','The same dots can be arranged in two different patterns.')]),
  ('Find the next hexagonal number after 1, 7, 19, 37.',[('Look at the gaps: 7 - 1 = 6, 19 - 7 = 12, 37 - 19 = 18.','Find how the sequence grows.'),('The gaps go up by 6 each time, so the next gap is 24.','The gap sequence 6, 12, 18, 24 is a pattern too.'),('37 + 24 = 61.','Check: 6 × 10 + 1 = 61, using the fourth triangular number 10.')]),
  ('How many line segments are there in the 4th Koch snowflake shape if the first three have 3, 12 and 48?',[('Each segment is replaced by 4 smaller ones, so the count is multiplied by 4 every time.','This is the rule of the speed bump.'),('The 4th shape has 48 × 4 line segments.','Multiply the previous count by 4.'),('48 × 4 = 192.','The numbers are 3 times the powers of 4: 3, 12, 48, 192.')])],
 ('Explain to a friend how a picture shows that adding the first n odd numbers gives n × n, and give one example of a shape pattern linked to a number sequence.',['Square dots split into L-shaped layers of 1, 3, 5, 7, and so on dots.','The picture works for any size of square, so the pattern never stops.','For example, the number of lines in complete graphs K2, K3, K4, K5 is 1, 3, 6, 10, the triangular numbers.'],['Thinking a pattern is proved after checking a few cases.','Confusing square numbers with the sequence of odd numbers.','Thinking regular polygons only have equal sides, not equal corners.']),
 ['Mathematics is the search for patterns and for the reasons why they happen.','Number sequences include counting numbers, odd and even numbers, triangular numbers, squares, cubes, Virahanka numbers and powers of 2 and 3.','Pictures help us see and explain patterns: the first n odd numbers add up to n × n.','Adding the counting numbers up and then down also gives the squares.','Shape sequences such as regular polygons, complete graphs, stacked squares, stacked triangles and the Koch snowflake match number sequences.'],
 [mcq('1',1,'The next number in 1, 3, 6, 10, 15 is','21',[('20','The gaps are 2, 3, 4, 5, 6, so we add 6 to get 21, not 5.'),('25','25 is the next square number, not the next triangular number.')],'Triangular numbers grow by 2, 3, 4, 5, 6; 15 + 6 = 21.'),
  mcq('2',1,'The Virahanka numbers 1, 2, 3, 5, 8, 13 are formed by','adding the two numbers before',[('adding 2 each time','The gaps are 1, 1, 2, 3, 5, so the gap is not constant.'),('doubling each time','Doubling gives 1, 2, 4, 8, 16, the powers of 2.')],'3 = 1 + 2, 5 = 2 + 3, 8 = 3 + 5.'),
  tf('3',1,'The number 36 is both a triangular number and a square number.',True,'36 = 1 + 2 + ... + 8 and 36 = 6 × 6.'),
  num('4',2,'Without adding one by one, find the sum of the first 12 odd numbers.',144,'The first n odd numbers add up to n × n, so 12 × 12 = 144.',[(24,'You doubled 12; the sum is 12 × 12.'),(78,'That is the sum 1 + 2 + ... + 12, not the odd numbers.')]),
  num('5',2,'Find the value of 1 + 2 + 3 + ... + 49 + 50 + 49 + ... + 3 + 2 + 1.',2500,'Adding up and then down to n gives n × n, so 50 × 50 = 2500.',[(1275,'That is only the up part 1 + 2 + ... + 50.'),(100,'You added the two ends 50 + 50; the answer is 50 × 50.')]),
  num('6',2,'The hexagonal numbers go 1, 7, 19, 37. What is the next one?',61,'The gaps are 6, 12, 18, so the next gap is 24 and 37 + 24 = 61.',[(55,'The gaps are not 18; the gap after 18 is 24.'),(49,'49 is a square number, not the next hexagonal number.')]),
  num('7',2,'How many lines does the complete graph K5 have?',10,'K2, K3, K4, K5 have 1, 3, 6, 10 lines, the triangular numbers.',[(5,'That is the number of points, not the lines joining them.'),(15,'15 lines belong to K6, not K5.')]),
  num('8',3,'Add 1 to the sum 1 + 2 + 4 + 8 + 16. What number do you get?',32,'1 + 2 + 4 + 8 + 16 = 31, and adding 1 gives 32, the next power of 2.',[(31,'31 is the sum before adding 1.'),(16,'16 is the last number added, not the total plus 1.')]),
  num('9',3,'Koch snowflake shapes have 3, 12, 48 line segments. How many does the next shape have?',192,'Each segment becomes 4 segments, so 48 × 4 = 192.',[(96,'You doubled 48; every segment is replaced by 4, not 2.'),(60,'You added 12; the rule is to multiply by 4.')]),
  mcq('10',3,'Which sequence do you get by adding consecutive odd numbers starting from 1 (1, 1 + 3, 1 + 3 + 5, ...)?','Square numbers 1, 4, 9, 16',[('Triangular numbers 1, 3, 6, 10','Triangular numbers come from adding the counting numbers 1, 2, 3, ...'),('Cube numbers 1, 8, 27, 64','Cubes come from adding the hexagonal numbers.')],'L-shaped layers of 1, 3, 5, 7 dots build bigger and bigger squares.')],
 svgs=[('c6-maths-odd-sum-squares','A 6 by 6 square of dots split into L-shaped layers of 1, 3, 5, 7, 9 and 11 dots','Odd numbers add up to squares')],
 keep=['sequence','triangular numbers','square numbers','hexagonal numbers','number theory','geometry'])
