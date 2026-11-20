from lib import *
C=10;S='maths'
CG='coordinate-geometry'
def axes(ox,oy,u,x0,x1,y0,y1):
    t=f'<line x1="{ox+x0*u}" y1="{oy}" x2="{ox+x1*u}" y2="{oy}" stroke="#555"/><line x1="{ox}" y1="{oy-y1*u}" x2="{ox}" y2="{oy-y0*u}" stroke="#555"/>'
    return t
def P(ox,oy,u,x,y,lab,dx=6,dy=-6):
    return f'<circle cx="{ox+x*u}" cy="{oy-y*u}" r="3.5" fill="#c0392b"/><text x="{ox+x*u+dx}" y="{oy-y*u+dy}" font-size="12">{lab}</text>'
def L(ox,oy,u,x1,y1,x2,y2,c='#1f618d'):
    return f'<line x1="{ox+x1*u}" y1="{oy-y1*u}" x2="{ox+x2*u}" y2="{oy-y2*u}" stroke="{c}" stroke-width="2"/>'
# triangle area diagram: A(-3,5),B(5,-2),C(5,6) scaled
ox,oy,u=200,170,22
tri=svg(560,260,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Triangle A(-3,5), B(5,-2), C(5,6): area 32 sq. units</text>'
 +axes(ox,oy,u,-6,7,-4,7)+L(ox,oy,u,-3,5,5,-2)+L(ox,oy,u,5,-2,5,6)+L(ox,oy,u,5,6,-3,5)
 +P(ox,oy,u,-3,5,'A(-3,5)',-30,-8)+P(ox,oy,u,5,-2,'B(5,-2)',6,14)+P(ox,oy,u,5,6,'C(5,6)',6,-4)
 +'<text x="440" y="90" font-size="13">Take vertices</text><text x="440" y="108" font-size="13">anticlockwise</text><text x="440" y="136" font-size="13">Area =</text><text x="440" y="154" font-size="13">1/2 |(x1y2+x2y3+x3y1)</text><text x="440" y="172" font-size="13">-(x2y1+x3y2+x1y3)|</text>')
ox,oy,u=130,190,20
sl=svg(560,260,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Slope m = tan(theta) = (y2 - y1) / (x2 - x1)</text>'
 +axes(ox,oy,u,-1,10,-1,8)+L(ox,oy,u,1,1,9,7)+f'<line x1="{ox+1*u}" y1="{oy-1*u}" x2="{ox+9*u}" y2="{oy-1*u}" stroke="#999" stroke-dasharray="4"/><line x1="{ox+9*u}" y1="{oy-1*u}" x2="{ox+9*u}" y2="{oy-7*u}" stroke="#999" stroke-dasharray="4"/>'
 +P(ox,oy,u,1,1,'A(x1,y1)',-10,16)+P(ox,oy,u,9,7,'B(x2,y2)',-30,-8)
 +'<text x="400" y="80" font-size="13">m &gt; 0: rises left to right</text><text x="400" y="104" font-size="13">m &lt; 0: falls left to right</text><text x="400" y="128" font-size="13">parallel lines: m1 = m2</text><text x="400" y="152" font-size="13">perpendicular: m1 m2 = -1</text><text x="400" y="176" font-size="13">vertical line: undefined</text>')
frm=svg(560,260,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Forms of the equation of a straight line</text>'
 +''.join(f'<rect x="20" y="{40+i*38}" width="520" height="32" rx="6" fill="{c}" stroke="#333"/><text x="30" y="{61+i*38}" font-size="13" font-weight="bold">{a}</text><text x="220" y="{61+i*38}" font-size="13">{b}</text>' for i,(c,a,b) in enumerate([('#fadbd8','Slope-intercept','y = mx + c   (slope m, y-intercept c)'),('#fdebd0','Point-slope','y - y1 = m (x - x1)'),('#fcf3cf','Two-point','(y - y1)/(y2 - y1) = (x - x1)/(x2 - x1)'),('#d5f5e3','Intercept','x/a + y/b = 1'),('#d6eaf8','General','ax + by + c = 0  (slope -a/b)'),('#ebdef0','Axes parallels','y = b (parallel to X axis); x = c (parallel to Y axis)')])))

lesson(C,S,CG,'area-of-triangle-and-quadrilateral',"Area of a triangle and quadrilateral from coordinates","The floor tiles",
"A hall floor is covered by 110 identical triangular tiles. One tile has vertices at (-3, 2), (-1, -1) and (1, 2). How do we find the floor area just from coordinates?",
["The area of a triangle with vertices (x1,y1), (x2,y2), (x3,y3) is half the absolute value of the difference of two sums. @ area formula",
 "Write the vertices column-wise in counter-clockwise order and repeat the first column at the end. @ the shoe-lace arrangement",
 "Add the products going down to the right: x1 y2 plus x2 y3 plus x3 y1. @ downward products",
 "Subtract the products going up: x2 y1 plus x3 y2 plus x1 y3, then take half and keep the answer positive. @ upward products",
 "If the area is zero, the three points are collinear, which lies on a single straight line. @ collinearity",
 "For a quadrilateral, split along a diagonal into two triangles, or use the same arrangement with four columns. @ quadrilateral",
 "Area is never negative, so we always take the positive value in square units. @ positive area"],
("Find the area of the triangle with vertices A(-3,5), B(5,-2), C(5,6).",[("Take them in counter-clockwise order: A(-3,5), B(5,-2), C(5,6).","x1,y1 = -3,5; x2,y2 = 5,-2; x3,y3 = 5,6."),("Downward sum: (-3)(-2) + 5(6) + 5(5) = 6 + 30 + 25 = 61.","x1y2 + x2y3 + x3y1."),("Upward sum: 5(5) + 5(-2) + (-3)(6) = 25 - 10 - 18 = -3.","x2y1 + x3y2 + x1y3."),("Area = 1/2 |61 - (-3)| = 1/2 x 64 = 32 sq. units.","Check: the right side BC is 8 long and the height is 8, giving 32.")]),
("Show that P(-1.5, 3), Q(6, -2), R(-3, 4) are collinear.",["Downward sum: (-1.5)(-2) + 6(4) + (-3)(3) = 3 + 24 - 9 = 18","Upward sum: 6(3) + (-3)(-2) + (-1.5)(4) = 18 + 6 - 6 = 18","Area = 1/2 (18 - 18) = 0, so the points are collinear"],["Forgetting to take vertices in a consistent order"]),
["Area of triangle = 1/2 |(x1y2+x2y3+x3y1) - (x2y1+x3y2+x1y3)|.","Zero area means collinear points.","Quadrilateral: add two triangles.","Area is always positive."],
["n|Area (sq. units) of triangle with vertices (0,0), (4,0), (0,6)|12|Half of 4 times 6.",
 "t|Three points with area of triangle zero are collinear.|True|They lie on one line.",
 "n|Value of k if area of triangle A(-1,2), B(k,-2), C(7,4) is 22|5|2k + 34 = 44 gives k = 5.",
 "m|The area of a triangle is always|positive|negative~Area cannot be negative;zero~Only if collinear;imaginary~Not possible|Take the absolute value.",
 "n|Area of quadrilateral with vertices (8,6), (5,11), (-5,12), (-4,3)|79|Half of 158.",
 "n|Number of tiles of area 6 sq. units needed to cover 660 sq. units|110|660 / 6.",
 "t|The vertices should be written in counter-clockwise order in the formula.|True|Otherwise the sign changes but the magnitude is the same after the modulus.",
 "n|Area of quadrilateral formed by (a,a), (-a,a), (a,-a), (-a,-a) with a = 4|64|A square of side 8.",
 "m|If the area of triangle PQR is 0, then P, Q, R are|collinear|vertices of a right triangle~Area would not be zero;vertices of an equilateral triangle~Area not zero;concyclic~Unrelated|On one straight line.",
 "s|If three points have area zero, we say they are ____.|collinear|They lie on a line."],svg=(tri,"Triangle on a coordinate plane with its area formula","Area of a triangle"))

lesson(C,S,CG,'slope-parallel-and-perpendicular-lines',"Slope of a line, parallel and perpendicular lines","How steep is the road?",
"Engineers must know how steep a road or staircase is before building it. In mathematics, steepness is measured by the slope of a line.",
["The slope or gradient of a non-vertical line is m equals tan theta, where theta is the angle of inclination with the positive X axis. @ definition of slope",
 "For two points (x1,y1) and (x2,y2), the slope is the difference in y divided by the difference in x. @ slope formula",
 "If theta is acute the slope is positive and the line rises; if theta is obtuse the slope is negative and the line falls. @ sign of the slope",
 "A horizontal line has slope zero, and the slope of a vertical line is undefined. @ special lines",
 "Two non-vertical lines are parallel if and only if their slopes are equal. @ parallel lines",
 "Two non-vertical lines are perpendicular if and only if the product of their slopes is minus one. @ perpendicular lines",
 "Three points are collinear if the slope of AB equals the slope of BC. @ collinearity by slope"],
("Find the slope of the line through (2,3) and (6,11), and the slope of a line perpendicular to it.",[("Slope m = (11 - 3)/(6 - 2) = 8/4 = 2.","Rise 8 over run 4."),("For a perpendicular line, m1 x m2 = -1.","So 2 x m2 = -1."),("Therefore m2 = -1/2.","A negative reciprocal.")]),
("Show that A(1,2), B(3,6), C(5,10) are collinear using slopes.",["Slope AB = (6-2)/(3-1) = 2","Slope BC = (10-6)/(5-3) = 2","Equal slopes and common point B, so A, B, C are collinear"],["Using slopes of unrelated pairs"]),
["m = tan theta = (y2-y1)/(x2-x1).","Parallel: m1 = m2.","Perpendicular: m1 m2 = -1.","Vertical line: slope undefined."],
["n|Slope of the line through (1,1) and (3,5)|2|4 divided by 2.",
 "n|Slope of a line making 45 degrees with the X axis|1|tan 45 = 1.",
 "t|Parallel lines have equal slopes.|True|Corresponding angles are equal.",
 "n|Slope of a line perpendicular to a line of slope 4 (answer as decimal)|-0.25|Negative reciprocal.",
 "m|A line with negative slope|falls from left to right|rises from left to right~That is a positive slope;is horizontal~Slope zero;is vertical~Undefined|theta between 90 and 180 degrees.",
 "t|The slope of a vertical line is zero.|False|It is undefined.",
 "n|Value of k so that the line through (2,5) and (4,k) has slope 3|11|(k - 5)/2 = 3.",
 "m|Slope of the X axis|0|1~tan 45;undefined~Vertical line;-1~Perpendicular slope|Horizontal line.",
 "s|The measure of steepness of a line is called its ____.|slope|Also gradient.",
 "t|Lines with slopes 2 and -1/2 are perpendicular.|True|Product is -1."],
svg=(sl,"A line through two points showing rise and run with slope facts","Slope of a line"))

lesson(C,S,CG,'equations-of-a-straight-line',"Equations of a straight line","Celsius to Fahrenheit",
"The rule F = 9C/5 + 32 is the equation of a straight line with slope 1.8 and y-intercept 32. Every straight line can be written as an equation.",
["Any first degree equation ax plus by plus c equals 0, with a and b not both zero, represents a straight line. @ general form",
 "The X axis is y equals 0 and the Y axis is x equals 0; a line parallel to the X axis is y equals b and parallel to the Y axis is x equals c. @ axes and parallel lines",
 "Slope-intercept form: y equals mx plus c, where m is the slope and c is the y-intercept. @ slope-intercept form",
 "Point-slope form: y minus y1 equals m times (x minus x1). @ point-slope form",
 "Two-point form: (y minus y1) over (y2 minus y1) equals (x minus x1) over (x2 minus x1). @ two-point form",
 "Intercept form: x over a plus y over b equals one, where a and b are the intercepts. @ intercept form",
 "In the general form ax plus by plus c equals 0, slope is minus a over b, the x-intercept is minus c over a and the y-intercept is minus c over b. @ reading the general form",
 "A line parallel to ax plus by plus c = 0 is ax plus by plus k = 0; a line perpendicular to it is bx minus ay plus k = 0. @ parallel and perpendicular lines"],
("Find the equation of the line through (5,-3) and (7,-4).",[("Use the two point form: (y + 3)/(-4 + 3) = (x - 5)/(7 - 5).","(y - y1)/(y2 - y1) = (x - x1)/(x2 - x1)."),("So (y + 3)/(-1) = (x - 5)/2.","Cross-multiply."),("2(y + 3) = -(x - 5), so 2y + 6 = -x + 5.","Simplify."),("Hence x + 2y + 1 = 0.","The required equation.")]),
("Find the slope and y-intercept of 8x - 7y + 6 = 0.",["Rewrite as 7y = 8x + 6","y = (8/7)x + 6/7","Slope 8/7 and y-intercept 6/7"],["Mixing the sign of the slope"]),
["Know the five forms and when to use each.","General form slope = -a/b.","Parallel: same a, b; perpendicular: swap and change sign.","Intercept form uses both intercepts."],
["m|Equation of a line parallel to the X axis through (5,7)|y = 7|x = 5~Parallel to Y axis;y = x + 2~Not parallel;y = 5~Wrong point|Same y coordinate.",
 "n|Slope of the line 2x + y - 7 = 0|-2|Slope is -a/b = -2/1.",
 "n|Y-intercept of y = 5x - 9|-9|The constant term.",
 "t|The equation x/a + y/b = 1 is the intercept form.|True|Intercepts a and b.",
 "s|The equation of the Y axis is x = ____.|0|Every point has x coordinate 0.",
 "n|Slope of a line with inclination 45 degrees and y-intercept 11|1|tan 45 = 1 so y = x + 11.",
 "m|Equation of the line with slope 2 through the origin|y = 2x|y = x + 2~Wrong form;y = 2~Parallel to X;x = 2~Vertical|Passes through (0,0).",
 "n|Value of y when x = 25 in y = (9/5)x + 32|77|45 + 32.",
 "t|A line perpendicular to 3x + 4y = 5 has slope 4/3.|True|-1 divided by -3/4.",
 "n|X-intercept of the line 3x + 4y - 12 = 0|4|Put y = 0: x = 4."],
svg=(frm,"Six rows listing the forms of the equation of a straight line","Forms of a line"))
print('ok')
