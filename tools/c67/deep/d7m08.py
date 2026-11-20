import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">Congruent triangles: which facts are enough?</text>'
    b+='<polygon points="40,150 140,150 100,80" fill="#d6eaf8" stroke="#1f618d" stroke-width="2"/><polygon points="200,150 300,150 260,80" fill="#d6eaf8" stroke="#1f618d" stroke-width="2"/>'
    b+='<text x="34" y="168">A</text><text x="138" y="168">B</text><text x="96" y="72">C</text><text x="194" y="168">X</text><text x="298" y="168">Y</text><text x="256" y="72">Z</text>'
    b+='<text x="105" y="196" font-size="14" fill="#1f618d">triangle ABC is congruent to triangle XYZ</text>'
    b+='<text x="370" y="52" font-weight="bold" font-size="15" fill="#1e8449">Guarantee congruence</text>'
    for i,t in enumerate(['SSS: three sides equal','SAS: two sides and the angle between them','ASA: two angles and the side between them','AAS: two angles and a side not between them','RHS: right angle, hypotenuse and one side']):
        b+=f'<text x="370" y="{78+i*26}" font-size="14">{t}</text>'
    b+='<text x="370" y="222" font-weight="bold" font-size="15" fill="#c0392b">Do NOT guarantee</text>'
    b+='<text x="370" y="246" font-size="14">SSA (two sides and a non-included angle)</text><text x="370" y="270" font-size="14">AAA (three angles: same shape, any size)</text>'
    b+='<text x="40" y="230" font-size="14">Equal sides lie opposite equal angles</text><text x="40" y="254" font-size="14">Equilateral triangle: every angle = 60 degrees</text>'
    return b
svgfile('c7-maths-congruence-conditions.svg',680,290,d())
chapter(7,'maths','geometric-twins','Geometric Twins',
 ('Copying a signboard exactly','A signboard symbol must be recreated on another board. Tracing works for a small symbol, but for a big one we need measurements. Which measurements are enough to build an exact copy? The answer leads to one of the most useful ideas in geometry, congruence.'),
 [('Congruent figures',[
   'Take two arm lengths AB = 4 cm and BC = 8 cm of the symbol. Many different symbols can be drawn with those two lengths, because the arms can open to different angles.',
   'Add the angle ABC = 80 degrees. Now the two arm lengths and the angle between them fix the shape and size completely.',
   'Figures that are exact copies of each other, with the same shape and size, are called congruent. Congruent figures can be superimposed so that one fits exactly over the other.',
   'While checking, a figure may be rotated or flipped before superimposing. So a flipped copy is still congruent.',
   'To test two circles, compare their radii. To test two rectangles, compare length and breadth. Fixing the right measurements decides congruence.']),
  ('Congruence of triangles: the SSS condition',[
   'Meera and Rabia must copy a big triangular frame with sides 40 cm, 60 cm and 80 cm. Meera says the angles are not needed. Is she right?',
   'Scale it down to 4 cm, 6 cm and 8 cm. Draw the 6 cm base AB, then draw arcs of radius 4 cm and 8 cm from its ends. The arcs meet at two points E and F, giving triangles ABE and ABF.',
   'These two triangles are mirror images across AB, so they are congruent. Hence every triangle with these three sides is congruent to the original.',
   'This is the SSS condition: if two triangles have the same three side lengths, they are congruent. Meera was right.']),
  ('Naming congruent triangles',[
   'When triangle ABC fits over triangle XYZ, A lies over X, B over Y and C over Z. These are corresponding vertices. Sides AB and XY, BC and YZ, AC and XZ correspond, and so do the angles A and X, B and Y, C and Z.',
   'We write triangle ABC is congruent to triangle XYZ using the sign ≅. The first vertex matches the first, the second matches the second, and the third matches the third.',
   'So writing triangle ACB ≅ triangle XYZ is wrong for this pair, but triangle ACB ≅ triangle XZY is correct, because the order of both names changes in the same way.',
   'In rectangle ABCD, triangles ABD and CDB are congruent by SSS: AB = CD, AD = CB, and BD is common. The correct correspondence is A to C, B to D, D to B, so triangle ABD ≅ triangle CDB.',
   'A common side shared by two triangles is equal to itself. Remember to use it as one pair of equal sides.']),
  ('Measuring the angles only: AAA is not enough',[
   'Suppose the angles are 30, 70 and 80 degrees. Many triangles with these angles can be drawn, small and large.',
   'They have the same shape but not the same size. So equal angles alone do not make triangles congruent.']),
  ('SAS condition',[
   'Take triangles ABC and XYZ with AB = XY = 6 cm, AC = XZ = 5 cm and angle A = angle X = 30 degrees. The angle is between the two sides, so it is the included angle.',
   'Construct it: draw AB, make 30 degrees at A, mark 5 cm on that arm and join. Every classmate will get a congruent triangle.',
   'So two sides and the included angle equal means the triangles are congruent. This is the SAS (Side Angle Side) condition.']),
  ('SSA fails, ASA and AAS work',[
   'Now take two sides and a non-included angle: PQ = 6 cm, angle P = 30 degrees and QR = 4 cm. Draw PQ, make 30 degrees at P, and cut an arc of radius 4 cm from Q on the line.',
   'The arc meets the line at two points R and S, giving two different triangles with the same measurements. So SSA does not guarantee congruence.',
   'For two angles and the included side, BC = 5 cm, angle B = 50 and angle C = 30 degrees, the construction gives only one triangle. This is the ASA (Angle Side Angle) condition, and it guarantees congruence.',
   'Take two angles and a non-included side: angle A = 35, angle C = 75 and BC = 4 cm. The third angle B = 180 - 35 - 75 = 70 degrees, and the same holds for the other triangle, so ASA applies. This is the AAS (Angle Angle Side) condition, and it also guarantees congruence.',
   'Whenever two angles are known, the third angle is known too, so AAS can always be turned into ASA.']),
  ('RHS condition',[
   'In a right-angled triangle, the side opposite to the right angle is the hypotenuse. It is the longest side.',
   'Take BC = 4 cm, right angle at B and hypotenuse AC = 5 cm. Draw QR = 4 cm, draw a perpendicular at Q, and cut an arc of radius 5 cm from R on it. The arc also meets the perpendicular below QR, but that triangle is a mirror image and so is congruent.',
   'So a right angle, the hypotenuse and one other side equal gives congruence. This is the RHS (Right angle, Hypotenuse, Side) condition.',
   'The conditions that guarantee congruence are SSS, SAS, ASA, AAS and RHS. SSA in general and AAA do not.']),
  ('Angles of isosceles and equilateral triangles',[
   'Congruence helps us discover facts. In triangle ABC with AB = AC, draw the altitude AD from A to BC.',
   'Triangles ADB and ADC have AB = AC, a right angle at D, and the common side AD. So they are congruent by RHS, and angle B = angle C, being corresponding angles.',
   'So in a triangle, angles opposite to equal sides are equal. In an isosceles triangle with the apex angle 80 degrees, the other two angles are (180 - 80) divided by 2 = 50 degrees each.',
   'In an equilateral triangle every pair of sides is equal, so all three angles are equal. Three equal angles add to 180 degrees, so each angle is 60 degrees.',
   'We found this just by using congruence. Congruent triangles appear in bridges, pyramids, domes and rangoli designs, because equal triangles make strong, repeating patterns.'])],
 [('Triangles PQR and XYZ have PQ = XY, QR = YZ and angle Q = angle Y. Are they congruent? Write the congruence.',[('PQ = XY, angle Q = angle Y and QR = YZ. Angle Q lies between PQ and QR.','Check whether the equal angle is between the two equal sides.'),('So SAS holds.','Two sides and the included angle are equal.'),('Triangle PQR ≅ triangle XYZ.','The first, second and third vertices correspond in that order.')]),
  ('In the figure, O is the midpoint of AD and of BC. Show that AB = CD.',[('AO = OD and BO = OC.','O is the midpoint of both segments.'),('Angle AOB = angle DOC.','They are vertically opposite angles.'),('So triangle AOB ≅ triangle DOC by SAS.','Two sides and the included angle are equal.'),('AB and DC are corresponding sides, so AB = CD.','Corresponding parts of congruent triangles are equal.')]),
  ('In triangle ABC, AB = AC and angle A = 40 degrees. Find angles B and C.',[('AB = AC, so angle B = angle C.','Angles opposite equal sides are equal.'),('Angle B + angle C = 180 - 40 = 140 degrees.','The angle sum of a triangle is 180 degrees.'),('Each is 70 degrees.','Divide 140 by 2.')]),
  ('Triangle ABC has angle A = 35, angle C = 75 and BC = 4 cm, and triangle XYZ has angle X = 35, angle Z = 75 and YZ = 4 cm. Show they are congruent.',[('Angle B = 180 - 35 - 75 = 70 degrees. Likewise angle Y = 70 degrees.','The angle sum of a triangle is 180.'),('Angle B = angle Y, BC = YZ and angle C = angle Z.','Two angles and the included side are equal.'),('So triangle ABC ≅ triangle XYZ by ASA.','Hence congruent.')])],
 ('Explain to a friend which measurements are enough to copy a triangle exactly and which are not, and why the angles of an equilateral triangle are 60 degrees.',['Three sides (SSS), two sides and the included angle (SAS), two angles and a side (ASA, AAS) and RHS are enough.','Three angles alone (AAA) and two sides with a non-included angle (SSA) are not enough.','In a triangle, angles opposite equal sides are equal; an equilateral triangle has three equal angles adding to 180 degrees, so each is 60 degrees.'],['Thinking equal angles are enough to make triangles congruent.','Matching vertices in the wrong order when writing the congruence.','Thinking SSA always works.']),
 ['Figures with the same shape and size are congruent; they fit exactly over each other, even when rotated or flipped.','Two triangles are congruent by SSS, SAS, ASA, AAS or RHS.','SSA (non-included angle) and AAA do not guarantee congruence.','Corresponding vertices, sides and angles are named in the same order when writing the congruence.','Angles opposite equal sides of a triangle are equal.','Each angle of an equilateral triangle is 60 degrees.'],
 [mcq('1',1,'Figures that have the same shape and size are called','congruent',[('similar','Similar figures have the same shape but may differ in size.'),('parallel','Parallel describes lines, not figures.')],'Congruent figures fit exactly over each other.'),
  mcq('2',1,'Which condition needs the equal angle to be between the two equal sides?','SAS',[('SSS','SSS uses only the three sides.'),('RHS','RHS uses a right angle, the hypotenuse and a side.')],'In SAS the angle is the included angle.'),
  tf('3',1,'Two triangles with the same three angles are always congruent.',False,'They may have the same shape but different sizes, so AAA does not guarantee congruence.'),
  mcq('4',1,'Each angle of an equilateral triangle is','60 degrees',[('90 degrees','That would make a right angle in every corner, which cannot add to 180.'),('45 degrees','Three 45-degree angles add to 135, not 180.')],'180 divided by 3 = 60.'),
  mcq('5',2,'Triangle ABC ≅ triangle XYZ. The side corresponding to BC is','YZ',[('XY','XY corresponds to AB.'),('XZ','XZ corresponds to AC.')],'The second and third vertices are B and C, which match Y and Z.'),
  mcq('6',2,'Which of these does NOT guarantee that two triangles are congruent?','SSA with a non-included angle',[('SAS','Two sides and the included angle fix the triangle.'),('ASA','Two angles and the included side fix the triangle.')],'Two different triangles can be drawn with SSA, as the arc meets the line in two points.'),
  num('7',2,'In triangle ABC, AB = AC and angle A = 80 degrees. Find angle B.',50,'(180 - 80) divided by 2 = 50.',[(100,'That is 180 - 80, the sum of B and C.'),(80,'Angle B is not equal to angle A here.')],'degrees'),
  mcq('8',2,'In the rectangle ABCD, triangle ABD and triangle CDB are congruent by SSS because','AB = CD, AD = CB and BD is common',[('all angles are 90 degrees','The triangles have one right angle each, and equal angles alone do not give SSS.'),('they share a vertex','Sharing a vertex does not give equal sides.')],'Opposite sides of a rectangle are equal and BD is shared.'),
  mcq('9',3,'O is the midpoint of AD and BC. Triangle AOB ≅ triangle DOC by','SAS',[('SSS','Only two pairs of sides are equal and AB and CD are not known.'),('RHS','There is no right angle.')],'AO = OD, BO = OC and the vertically opposite angles at O are equal.'),
  mcq('10',3,'Why is triangle ACB ≅ triangle XYZ wrong when triangle ABC ≅ triangle XYZ is right?','The order of the vertices does not match',[('Because ACB is not a triangle','ACB names the same triangle with the vertices in a different order.'),('Because XYZ cannot be changed','The pair can be rewritten if both names change together, as ACB ≅ XZY.')],'The first vertex must match the first, the second the second, and the third the third.')],
 svgs=[('c7-maths-congruence-conditions','Two congruent triangles with the conditions SSS, SAS, ASA, AAS and RHS that guarantee congruence, and SSA and AAA that do not','Which facts are enough for congruence')],
 keep=['congruent','SSS','SAS','ASA','AAS','RHS','hypotenuse'])
