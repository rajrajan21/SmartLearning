from lib import *
C=10;S='maths';G='geometry'
ab=svg(560,250,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Angle bisector theorem: BD / DC = AB / AC</text>'
 '<polygon points="80,200 480,200 200,50" fill="#d6eaf8" stroke="#333" stroke-width="2"/><line x1="200" y1="50" x2="320" y2="200" stroke="#c0392b" stroke-width="2"/>'
 '<circle cx="320" cy="200" r="4" fill="#c0392b"/><text x="70" y="218" font-size="14">B</text><text x="486" y="218" font-size="14">C</text><text x="195" y="44" font-size="14">A</text><text x="316" y="220" font-size="14">D</text>'
 '<text x="200" y="215" font-size="12" text-anchor="middle">x</text><text x="400" y="218" font-size="12" text-anchor="middle">y</text>'
 '<text x="500" y="90" font-size="12" text-anchor="end">AD bisects angle A</text><text x="500" y="112" font-size="12" text-anchor="end">so BD : DC = AB : AC</text>')
cv=svg(560,250,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Ceva and Menelaus</text>'
 '<polygon points="40,200 240,200 140,50" fill="#d5f5e3" stroke="#333" stroke-width="2"/><line x1="140" y1="50" x2="140" y2="200" stroke="#c0392b"/><line x1="40" y1="200" x2="190" y2="125" stroke="#c0392b"/><line x1="240" y1="200" x2="90" y2="125" stroke="#c0392b"/><circle cx="140" cy="150" r="4" fill="#1f618d"/>'
 '<text x="140" y="228" text-anchor="middle" font-size="13">Ceva: concurrent cevians</text><text x="140" y="244" text-anchor="middle" font-size="12">BD/DC x CE/EA x AF/FB = 1</text>'
 '<polygon points="330,200 500,200 400,60" fill="#fcf3cf" stroke="#333" stroke-width="2"/><line x1="320" y1="170" x2="520" y2="150" stroke="#c0392b"/>'
 '<text x="420" y="228" text-anchor="middle" font-size="13">Menelaus: collinear points</text><text x="420" y="244" text-anchor="middle" font-size="12">BP/PC x CQ/QA x AR/RB = 1 (lengths)</text>')
lesson(C,S,G,'angle-bisector-theorem',"Angle bisector theorem","Dividing the base",
"A bisector from the apex of a triangle splits the opposite side not in half but in the ratio of the other two sides. Let us see why this is useful.",
["Thales theorem: a line parallel to one side of a triangle divides the other two sides in the same ratio. @ Thales theorem",
 "Converse: if a line divides two sides in the same ratio, it is parallel to the third side. @ converse",
 "Angle bisector theorem: the internal bisector of an angle of a triangle divides the opposite side in the ratio of the sides containing the angle. @ statement",
 "In triangle ABC with bisector AD, BD over DC equals AB over AC. @ formula",
 "The converse is also true: if BD over DC equals AB over AC, then AD bisects angle A. @ converse of bisector theorem",
 "Use it to find unknown lengths and to prove that bisectors meet at the incentre. @ applications"],
("In triangle ABC, AB = 6, AC = 9, BC = 10 and AD bisects angle A with D on BC. Find BD and DC.",[("By the angle bisector theorem BD/DC = AB/AC = 6/9 = 2/3.","The ratio is 2 : 3."),("Let BD = 2k and DC = 3k with 2k + 3k = 10.","BD + DC = BC."),("So k = 2, BD = 4 and DC = 6.","Check: 4/6 = 2/3.")]),
("Why does the bisector theorem not give BD = DC?",["BD : DC equals AB : AC","BD = DC only when AB = AC","That is the isosceles case"],["Thinking every cevian is a median"]),
["BD/DC = AB/AC for bisector AD.","Its converse also holds.","Thales: a parallel line divides the sides proportionally.","Use ratio then sum to find lengths."],
["n|BD when AB = 6, AC = 9, BC = 10 and AD bisects angle A|4|Ratio 2:3, so 4 and 6.",
 "n|DC when AB = 6, AC = 9, BC = 10|6|The remaining part.",
 "t|If AB = AC then the bisector from A meets BC at its midpoint.|True|BD/DC = 1.",
 "m|The internal bisector theorem states BD/DC equals|AB/AC|AC/AB~Inverted;AD/AB~Wrong sides;BC/AC~Wrong sides|The sides containing the angle.",
 "n|If AB = 5, AC = 10 and BC = 12 then BD equals|4|BD:DC = 1:2.",
 "t|If a line divides two sides of a triangle in the same ratio it is parallel to the third side.|True|Converse of Thales.",
 "m|Thales theorem is also called|Basic Proportionality Theorem|Pythagoras theorem~Different;Ceva theorem~Different;Menelaus theorem~Different|BPT.",
 "n|If DE is parallel to BC, AD = 3, DB = 6 and AE = 2 then EC equals|4|AD/DB = AE/EC.",
 "s|Thales was a famous ____ mathematician.|Greek|From about 640 to 540 BCE.",
 "m|The point where angle bisectors of a triangle meet is the|incentre|centroid~Medians;orthocentre~Altitudes;circumcentre~Perpendicular bisectors|Centre of the incircle."],
svg=(ab,"A triangle ABC with the bisector AD dividing the side BC in the ratio AB to AC","Angle bisector theorem"))

lesson(C,S,G,'ceva-and-menelaus-theorems',"Concurrency theorems of Ceva and Menelaus","Italian engineer's theorem",
"When do three lines drawn from the vertices of a triangle meet at one point? Giovanni Ceva gave a simple test in 1678.",
["A cevian is a line segment from a vertex of a triangle to the opposite side; medians, altitudes and angle bisectors are special cevians. @ cevian",
 "Ceva's theorem: cevians AD, BE, CF are concurrent if and only if BD/DC times CE/EA times AF/FB equals 1. @ Ceva's theorem",
 "Medians are concurrent because each ratio equals 1; the point of concurrence is the centroid. @ medians",
 "Menelaus theorem: points P, Q, R on the sides BC, CA, AB are collinear if and only if BP/PC times CQ/QA times AR/RB equals -1 for directed lengths. @ Menelaus theorem",
 "With ordinary lengths the product for collinear points is 1. @ product of lengths",
 "Ceva is used to show that the angle bisectors, medians and altitudes are concurrent. @ applications"],
("In triangle ABC, AB = 13, AC = 14, BC = 15. Points D, E, F lie on BC, CA, AB with AF/FB = 2/5 and CE/EA = 5/8. If AD, BE, CF are concurrent, find BD and DC.",[("By Ceva: (BD/DC) x (CE/EA) x (AF/FB) = 1.","Insert the given ratios."),("(BD/DC) x (5/8) x (2/5) = 1 gives (BD/DC) x (1/4) = 1.","10/40 = 1/4."),("So BD = 4 DC. Also BD + DC = 15.","BC = 15."),("DC = 3 and BD = 12.","Check: 12/3 = 4.")]),
("Trees P, Q, R are on lines BC, AC, AB with BP = 2, PC = 6, CQ = 3, QA = 5, RA = 10, RB = 2. Are they collinear?",["Product = (2/6)(3/5)(10/2)","= (1/3)(3/5)(5) = 1","The product is 1, so by Menelaus they are collinear"],["Using Ceva for collinear points"]),
["Ceva: product of three ratios = 1 for concurrency.","Menelaus: product = 1 (lengths) for collinearity.","Medians satisfy Ceva trivially.","Centroid is the meeting point of medians."],
["m|Ceva's theorem tests for|concurrent cevians|parallel lines~Thales;perpendicular lines~Pythagoras;equal angles~Congruence|Lines meeting at a point.",
 "n|If AF/FB = 1 and CE/EA = 2 and the cevians are concurrent then BD/DC equals (as decimal)|0.5|Product must be 1.",
 "t|Medians of a triangle are concurrent.|True|Each ratio is 1.",
 "m|The point of concurrence of the medians is the|centroid|incentre~Angle bisectors;orthocentre~Altitudes;circumcentre~Perpendicular bisectors|Centre of mass.",
 "n|BD in the example with BC = 15 and BD/DC = 4|12|4 parts of 5.",
 "t|Menelaus theorem is about collinear points.|True|On the sides or their extensions.",
 "n|Product (2/6)(3/5)(10/2) for trees P, Q, R|1|So they are collinear.",
 "s|A line segment from a vertex to the opposite side is called a ____.|cevian|Named after Ceva.",
 "m|Giovanni Ceva published his theorem in|1678|1486~Not the year;1750~Not the year;1900~Not the year|He was a professor at Mantua.",
 "t|A median, an altitude and an angle bisector are all cevians.|True|Special cevians."],
svg=(cv,"A triangle with three concurrent cevians and another triangle with a line cutting its sides","Ceva and Menelaus"))
print('ok')
