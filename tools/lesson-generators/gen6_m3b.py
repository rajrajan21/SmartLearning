import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=6,subj="maths",subj_file="maths")
def L(ch,slug,en,story,exp,terms,ex,claim,summ,quiz): T(M,ch,slug,en,story,exp,terms,ex,claim,summ,quiz)
L("perimeter-and-area","area-of-squares-and-rectangles-with-tiles","Area of rectangles and squares","Meena covered her rectangular table with square tiles.\n\"I used 6 rows of 4,\" she said.",
 ["Area is the surface covered by a shape. We measure it in square units such as cm squared and m squared.","Area of a rectangle is length times breadth. Area of a square is side times side.","A rectangle 6 cm long and 4 cm wide has area 24 cm squared, and its perimeter is 20 cm."],
 ["area","square unit","breadth"],("Find the area of a rectangle 7 m by 3 m.",[("Area is length times breadth.","Formula."),("7 times 3.","Multiply."),("21 square metres.","Answer.")]),
 ("area and perimeter are the same thing.",["Perimeter is the distance around.","Area is the surface covered."],["Same idea."]),
 ["Area is length times breadth.","Perimeter and area differ."],
 ["m|Area of 6 cm by 4 cm|24 cm squared|20 cm|10 cm|6x4.","t|Area uses square units.|T|Yes.","m|Area of a square of side 5|25|20|10|5x5.","t|Area and perimeter are the same.|F|Different.","m|Perimeter of 6 by 4 rectangle|20|24|10|2(6+4).","s|Area of a 3 by 3 square? Write only the number.|9|3x3.","m|Area is measured in|square units|metres only|grams|Units.","t|Area is length times breadth.|T|Yes."])
L("fractions","equivalent-fractions-and-comparing-parts","Equivalent fractions and comparing","Meena ate 2 of 4 equal parts of a roti and Ravi ate 1 of 2 parts.\n\"We ate the same amount,\" she said.",
 ["Equivalent fractions show the same amount. 1/2 equals 2/4 equals 3/6. We multiply or divide top and bottom by the same number.","To compare fractions with the same denominator, the larger numerator is bigger. With different denominators, first make them equal. 1/2 is 3/6 and 2/3 is 4/6 so 2/3 is bigger.","A mixed number has a whole part and a fraction, like 1 and 1/2."],
 ["equivalent","denominator","mixed number"],("Which is bigger, 1/2 or 2/3?",[("Common denominator is 6.","Common."),("1/2 is 3/6 and 2/3 is 4/6.","Convert."),("2/3 is bigger.","Answer.")]),
 ("1/3 is bigger than 1/2.",["Both have numerator 1.","A bigger denominator means smaller parts."],["Denominator confusion."]),
 ["Equivalent fractions are equal.","Use a common denominator to compare."],
 ["m|1/2 equals|2/4|1/4|3/4|Double.","t|Equivalent fractions show the same amount.|T|Yes.","m|Bigger: 1/2 or 2/3|2/3|1/2|equal|4/6.","t|1/3 is bigger than 1/2.|F|Smaller.","m|3/6 equals|1/2|1/3|2/3|Half.","s|4/8 as a fraction with denominator 2? Write 1/2.|1/2|Half.","m|1 and 1/2 is a|mixed number|decimal|prime|Whole and part.","t|We multiply top and bottom by the same number.|T|Yes."])
L("symmetry","mirror-lines-and-turning-symmetry","Reflection and rotational symmetry","Anu placed a mirror along the line of a paper butterfly.\n\"The reflection completes the picture,\" she said.",
 ["A mirror line shows reflection. A shape with a line of symmetry matches its mirror image.","Rotational symmetry means a shape looks the same after turning less than a full turn. A square has rotational symmetry of order 4 and a rectangle has order 2.","Some shapes have both kinds. An equilateral triangle has 3 lines of symmetry and rotational order 3."],
 ["reflection","order","line of symmetry"],("How many lines of symmetry does a square have?",[("Two through the middle of the sides.","Sides."),("Two along the diagonals.","Diagonals."),("So it has 4.","Answer.")]),
 ("a rectangle has 4 lines of symmetry.",["A rectangle has 2.","Only the square has 4."],["Square vs rectangle."]),
 ["Reflection gives a mirror image.","Rotational symmetry has an order."],
 ["m|A square has ___ lines of symmetry.|4|2|1|Four.","t|A rectangle has 2 lines of symmetry.|T|Yes.","m|A rectangle's rotational order is|2|4|1|Half turn.","t|A rectangle has 4 lines of symmetry.|F|2.","m|An equilateral triangle has ___ lines|3|1|6|Three.","s|Lines of symmetry of a circle? Write many.|many|Infinite.","m|Reflection gives a|mirror image|longer shape|smaller shape|Mirror.","t|Some shapes have both kinds of symmetry.|T|Yes."])