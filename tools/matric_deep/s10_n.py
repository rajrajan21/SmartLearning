from lib import *
C=10;S='maths';A='algebra'
pl=svg(560,230,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Three planes: how can they meet?</text>'
 '<polygon points="30,130 130,100 160,150 60,180" fill="#d6eaf8" stroke="#333"/><polygon points="40,100 90,70 130,170 80,190" fill="#fadbd8" stroke="#333" opacity="0.8"/><polygon points="20,150 150,120 160,160 30,190" fill="#d5f5e3" stroke="#333" opacity="0.8"/><text x="95" y="215" text-anchor="middle" font-size="12">one common point: unique solution</text>'
 '<polygon points="210,130 300,100 330,150 240,180" fill="#d6eaf8" stroke="#333"/><polygon points="215,120 310,95 335,145 245,170" fill="#fadbd8" stroke="#333" opacity="0.8"/><text x="275" y="215" text-anchor="middle" font-size="12">common line: infinitely many</text>'
 '<polygon points="390,90 480,90 480,110 390,110" fill="#d6eaf8" stroke="#333"/><polygon points="390,125 480,125 480,145 390,145" fill="#fadbd8" stroke="#333"/><polygon points="390,160 480,160 480,180 390,180" fill="#d5f5e3" stroke="#333"/><text x="440" y="215" text-anchor="middle" font-size="12">parallel planes: no solution</text>')
dis=svg(560,250,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Discriminant D = b^2 - 4ac decides the roots</text>'
 '<line x1="20" y1="150" x2="180" y2="150" stroke="#555"/><path d="M40 60 Q100 260 160 60" fill="none" stroke="#1f618d" stroke-width="2"/><circle cx="64" cy="150" r="4" fill="#c0392b"/><circle cx="136" cy="150" r="4" fill="#c0392b"/><text x="100" y="205" text-anchor="middle" font-size="13">D &gt; 0: two real, unequal roots</text>'
 '<line x1="200" y1="150" x2="360" y2="150" stroke="#555"/><path d="M220 60 Q280 240 340 60" fill="none" stroke="#1f618d" stroke-width="2"/><circle cx="280" cy="150" r="4" fill="#c0392b"/><text x="280" y="205" text-anchor="middle" font-size="13">D = 0: real and equal roots</text>'
 '<line x1="380" y1="150" x2="540" y2="150" stroke="#555"/><path d="M400 100 Q460 200 520 100" fill="none" stroke="#1f618d" stroke-width="2"/><text x="460" y="205" text-anchor="middle" font-size="13">D &lt; 0: no real roots</text>')
rc=svg(560,230,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Roots and coefficients of ax^2 + bx + c = 0</text>'
 '<rect x="30" y="45" width="230" height="70" rx="10" fill="#d6eaf8" stroke="#333"/><text x="145" y="75" text-anchor="middle" font-size="15">Sum: alpha + beta = -b / a</text><text x="145" y="98" text-anchor="middle" font-size="12">coefficient of x with sign changed</text>'
 '<rect x="300" y="45" width="230" height="70" rx="10" fill="#d5f5e3" stroke="#333"/><text x="415" y="75" text-anchor="middle" font-size="15">Product: alpha beta = c / a</text><text x="415" y="98" text-anchor="middle" font-size="12">constant term over coefficient of x^2</text>'
 '<rect x="30" y="135" width="500" height="70" rx="10" fill="#fcf3cf" stroke="#333"/><text x="280" y="165" text-anchor="middle" font-size="14">Equation with roots alpha, beta:  x^2 - (alpha + beta) x + alpha beta = 0</text><text x="280" y="188" text-anchor="middle" font-size="13">alpha^2 + beta^2 = (alpha + beta)^2 - 2 alpha beta</text>')

lesson(C,S,A,'simultaneous-linear-equations-in-three-variables',"Linear equations in three variables","How GPS finds you",
"A GPS receiver uses three satellites to fix your latitude, longitude and altitude. Behind this is a system of three equations in three unknowns.",
["A linear equation in three variables has the form ax plus by plus cz plus d equals 0 and represents a plane in space. @ equation of a plane",
 "A system of three such equations can meet at one point, along a line, or not at all. @ three possibilities",
 "Step one: choose two equations and make the coefficient of one variable numerically equal. @ step 1",
 "Step two: eliminate that variable from two different pairs of equations to get two equations in two variables. @ step 2",
 "Step three: solve the two-variable system, then substitute to find the third variable. @ step 3",
 "If you reach a false statement like 0 = 1, there is no solution; if you reach an identity 0 = 0, there are infinitely many. @ special cases",
 "Word problems become systems when we name the unknowns and write one equation per condition. @ word problems"],
("Solve 3x - 2y + z = 2, 2x + 3y - z = 5, x + y + z = 6.",[("Add (1) and (2): 5x + y = 7. Add (2) and (3): 3x + 4y = 11.","z has been eliminated twice."),("Multiply 5x + y = 7 by 4: 20x + 4y = 28. Subtract 3x + 4y = 11.","The y terms match."),("We get 17x = 17, so x = 1.","Then y = 7 - 5 = 2."),("Put x = 1 and y = 2 in the third equation: 1 + 2 + z = 6, so z = 3.","Check in equation (1): 3 - 4 + 3 = 2."),("Solution: x = 1, y = 2, z = 3.","Unique point of intersection.")]),
("Interpret the result: while eliminating variables we obtain 0 = -1. What does it mean?",["The equations contradict each other","The three planes have no common point","The system is inconsistent and has no solution"],["Writing x = 0 as the answer"]),
["Eliminate one variable twice to get a 2 x 2 system.","0 = 0 means infinitely many solutions.","0 = false number means none.","Check by substituting."],
["n|Value of z in 3x - 2y + z = 2, 2x + 3y - z = 5, x + y + z = 6|3|Solution is (1, 2, 3).",
 "t|Each linear equation in three variables represents a plane.|True|In three dimensional space.",
 "m|If elimination gives 0 = -1 the system has|no solution|one solution~0 = -1 is false;two solutions~Linear systems cannot have exactly two;infinitely many~That is for 0 = 0|Inconsistent.",
 "m|If elimination gives 0 = 0 the system has|infinitely many solutions|no solution~That is for a false statement;exactly one solution~Not an identity;two solutions~Impossible|Dependent equations.",
 "n|Value of y in x + y + z = 3, x - y + z = 1, x + y - z = 1|1|Solution is (1, 1, 1).",
 "n|Number of first place finishers in the sports meet problem (24 prizes, 56 points)|4|Solution is 4, 8, 12.",
 "t|A system of three linear equations can have infinitely many solutions.|True|When the planes share a line.",
 "n|If x + y = 12 and 5x + 3y = 44 then x equals|4|3(x + y) = 36 so 2x = 8.",
 "m|GPS uses equations in|three variables|one variable~Not enough;two variables~Not enough;no variables~Not possible|Latitude, longitude, altitude.",
 "s|Solutions of a system of three equations correspond to the common point of three ____.|planes|Each equation is a plane."],
svg=(pl,"Three drawings showing planes meeting at a point along a line or never","Solutions of three equations"))

lesson(C,S,A,'nature-of-roots-and-discriminant',"Nature of roots and the discriminant","Does it touch the axis?",
"A ball is thrown and its height follows a quadratic equation. Will it reach a given height? The discriminant answers it without solving.",
["The roots of ax squared plus bx plus c equal 0 are given by the quadratic formula minus b plus or minus the square root of b squared minus 4ac, all over 2a. @ quadratic formula",
 "The expression b squared minus 4ac is called the discriminant D. @ discriminant",
 "If D is greater than 0, the roots are real and unequal and the parabola cuts the X axis twice. @ D positive",
 "If D equals 0, the roots are real and equal and the parabola touches the X axis once. @ D zero",
 "If D is less than 0, there are no real roots and the parabola does not meet the X axis. @ D negative",
 "To find an unknown k for given nature, form D in terms of k and use D = 0, D greater than 0 or D less than 0. @ finding k"],
("Find k for which kx^2 - (8k + 4)x + 81 = 0 has real and equal roots.",[("Here a = k, b = -(8k + 4), c = 81.","Identify the coefficients."),("D = 0 gives (8k + 4)^2 - 4 x k x 81 = 0.","Equal roots need D = 0."),("64k^2 + 64k + 16 - 324k = 0, so 64k^2 - 260k + 16 = 0.","Expand and collect."),("Divide by 4: 16k^2 - 65k + 4 = 0, so (16k - 1)(k - 4) = 0.","Factorise."),("Hence k = 1/16 or k = 4.","Two values of k.")]),
("Find the values of k so that (k + 9)x^2 + (k + 1)x + 1 = 0 has no real roots.",["a = k + 9, b = k + 1, c = 1","D less than 0: (k + 1)^2 - 4(k + 9) < 0","k^2 - 2k - 35 < 0, so (k + 5)(k - 7) < 0","Hence -5 < k < 7"],["Reversing the inequality"]),
["D = b^2 - 4ac.","D > 0 two real roots; D = 0 equal; D < 0 none.","For equal roots set D = 0 and solve for k.","Graph meets the X axis as many times as the number of real roots."],
["n|Discriminant of x^2 - x - 20 = 0|81|1 + 80.",
 "m|x^2 + 4x + 4 = 0 has|real and equal roots|real and unequal roots~D is 0, not positive;no real roots~D is not negative;imaginary roots only~D is 0|D = 16 - 16 = 0.",
 "n|Discriminant of 2x^2 - 5x + 3 = 0|1|25 - 24.",
 "t|If D is negative the equation has no real roots.|True|The square root of a negative number is not real.",
 "n|Positive value of k for which x^2 + kx + 9 = 0 has equal roots|6|k^2 = 36.",
 "n|Discriminant of 2x^2 - 2x + 9 = 0|-68|4 - 72.",
 "m|If D = 49 the roots are|real and unequal|equal~Needs D = 0;not real~Needs D < 0;complex~Not real|D > 0.",
 "t|A parabola with D = 0 touches the X axis at one point.|True|Equal roots.",
 "n|Number of integer values of k with -5 < k < 7 (no real roots case)|11|The integers -4 to 6 give 11 values.",
 "s|The expression b^2 - 4ac is called the ____.|discriminant|It discriminates between types of roots."],
svg=(dis,"Three parabolas showing two one and no intersections with the X axis for positive zero and negative discriminant","Discriminant and roots"))

lesson(C,S,A,'relation-between-roots-and-coefficients',"Roots and coefficients of a quadratic equation","Without solving",
"Can we say the sum and product of the roots of 3x^2 + 7x - 2 = 0 without finding the roots? Yes, the coefficients tell us directly.",
["If alpha and beta are the roots of ax squared plus bx plus c equals 0, then alpha plus beta equals minus b over a. @ sum of roots",
 "The product alpha times beta equals c over a. @ product of roots",
 "The quadratic equation with roots alpha and beta is x squared minus (sum) x plus (product) equals 0. @ forming an equation",
 "Alpha squared plus beta squared equals (alpha plus beta) squared minus 2 alpha beta. @ sum of squares",
 "Alpha minus beta equals the square root of (alpha plus beta) squared minus 4 alpha beta. @ difference of roots",
 "Alpha cubed plus beta cubed equals (alpha plus beta) cubed minus 3 alpha beta (alpha plus beta). @ sum of cubes",
 "If the constant term is zero, one root is zero and the other equals minus b over a. @ zero constant"],
("If alpha, beta are the roots of x^2 + 7x + 10 = 0, find alpha^2 + beta^2 and alpha/beta + beta/alpha.",[("Here a = 1, b = 7, c = 10, so alpha + beta = -7 and alpha x beta = 10.","Sum = -b/a, product = c/a."),("alpha^2 + beta^2 = (alpha + beta)^2 - 2 alpha beta = 49 - 20 = 29.","Use the identity."),("alpha/beta + beta/alpha = (alpha^2 + beta^2) / (alpha beta) = 29/10.","Common denominator."),("So the answers are 29 and 29/10.","Check with the roots -2 and -5: 4 + 25 = 29.")]),
("The difference between the roots of x^2 - 13x + k = 0 is 17. Find k.",["alpha + beta = 13 and alpha - beta = 17","Adding: 2 alpha = 30, so alpha = 15 and beta = -2","k = alpha x beta = 15 x (-2) = -30"],["Using the wrong sign for the sum"]),
["Sum = -b/a, product = c/a.","Equation: x^2 - (sum)x + product = 0.","Express symmetric expressions through sum and product.","Always check with simple roots."],
["n|Sum of the roots of 2x^2 - 7x + 3 = 0 (as decimal)|3.5|-b/a = 7/2.",
 "n|Product of the roots of 2x^2 - 7x + 3 = 0 (as decimal)|1.5|c/a = 3/2.",
 "n|alpha^2 + beta^2 for x^2 - 5x + 6 = 0|13|25 - 12.",
 "t|For x^2 + 7x + 10 = 0 the sum of the roots is -7.|True|-b/a.",
 "n|Value of k in x^2 - 13x + k = 0 when the difference of roots is 17|-30|Roots 15 and -2.",
 "m|Equation with roots 2 and 3 is|x^2 - 5x + 6 = 0|x^2 + 5x + 6 = 0~Signs wrong;x^2 - 6x + 5 = 0~Wrong;x^2 - x + 6 = 0~Wrong|Sum 5, product 6.",
 "n|If alpha, beta are roots of x^2 - 4x + 1 = 0 then alpha + beta equals|4|-b/a.",
 "m|Product of roots of 3x^2 + 7x - 2 = 0 is|-2/3|-7/3~That is the sum;2/3~Sign wrong;7/3~Sign and value wrong|c/a.",
 "t|If c = 0 in ax^2 + bx + c = 0 then one root is zero.|True|x(ax + b) = 0.",
 "s|The quadratic with sum S and product P of roots is x^2 - Sx + ____ = 0.|P|The product."],
svg=(rc,"Boxes showing sum and product of roots and how to form an equation","Roots and coefficients"))
print('ok')
