from lib import *
C=10;S='maths';A='algebra'
mx=svg(560,250,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Matrix multiplication: row times column</text>'
 '<text x="40" y="70" font-size="20">A =</text><text x="90" y="62" font-size="18">1  2</text><text x="90" y="86" font-size="18">3  4</text><text x="170" y="70" font-size="20">B =</text><text x="220" y="62" font-size="18">5  6</text><text x="220" y="86" font-size="18">7  8</text>'
 '<rect x="82" y="44" width="62" height="24" fill="none" stroke="#c0392b" stroke-width="2"/><rect x="215" y="44" width="30" height="46" fill="none" stroke="#1f618d" stroke-width="2"/>'
 '<text x="40" y="140" font-size="16">AB =</text><text x="95" y="132" font-size="16">1x5+2x7   1x6+2x8</text><text x="95" y="156" font-size="16">3x5+4x7   3x6+4x8</text>'
 '<text x="40" y="195" font-size="16">AB =</text><text x="95" y="187" font-size="16">19  22</text><text x="95" y="211" font-size="16">43  50</text>'
 '<text x="300" y="100" font-size="13">Rule: columns of A = rows of B</text><text x="300" y="124" font-size="13">A is m x n, B is n x p, AB is m x p</text><text x="300" y="148" font-size="13">In general AB is not equal to BA</text><text x="300" y="172" font-size="13">A I = I A = A</text>')
lesson(C,S,A,'matrix-operations',"Operations on matrices","Factory workers table",
"Three factories record the number of men and women workers. When the numbers of two months are added, we add the matrices.",
["Two matrices of the same order can be added or subtracted by adding or subtracting corresponding elements. @ addition and subtraction",
 "Multiplying a matrix by a scalar k multiplies every element by k. @ scalar multiplication",
 "Matrix addition is commutative and associative; the zero matrix is the additive identity and minus A is the additive inverse. @ properties of addition",
 "Matrix A of order m by n can be multiplied with B of order n by p, and the product has order m by p. @ condition for multiplication",
 "The element in row i and column j of AB is the sum of products of row i of A with column j of B. @ row times column",
 "Multiplication is generally not commutative: AB need not equal BA. @ non-commutative",
 "The identity matrix satisfies A I = I A = A, and the transpose of AB equals B transpose times A transpose. @ identity and transpose"],
("For A = [[1,2],[3,4]] and B = [[5,6],[7,8]] find A + B, 2A, AB and BA.",[("A + B adds corresponding entries: [[6,8],[10,12]].","1+5, 2+6, 3+7, 4+8."),("2A doubles every entry: [[2,4],[6,8]].","Scalar multiplication."),("AB: first row times columns gives 1x5+2x7 = 19 and 1x6+2x8 = 22; second row gives 3x5+4x7 = 43 and 3x6+4x8 = 50. So AB = [[19,22],[43,50]].","Row by column."),("BA: 5x1+6x3 = 23, 5x2+6x4 = 34, 7x1+8x3 = 31, 7x2+8x4 = 46. So BA = [[23,34],[31,46]].","Different from AB.")]),
("A is of order 2 x 3 and B of order 3 x 4. Is AB defined? What is its order?",["Columns of A = 3 = rows of B, so AB is defined","The order of AB is 2 x 4","BA is not defined because 4 is not equal to 2"],["Assuming AB = BA"]),
["Add matrices of the same order only.","AB needs columns of A = rows of B.","AB is not usually equal to BA.","A I = A."],
["n|Sum of all elements of A + B for A = [[1,2],[3,4]], B = [[5,6],[7,8]]|36|6 + 8 + 10 + 12.",
 "n|Element in the first row, second column of 2A for A = [[1,2],[3,4]]|4|2 x 2.",
 "n|Element in row 1, column 1 of AB for A = [[1,2],[3,4]], B = [[5,6],[7,8]]|19|1x5 + 2x7.",
 "n|Element in row 2, column 2 of AB for A = [[2,0],[1,3]], B = [[1,4],[0,2]]|10|1x4 + 3x2.",
 "t|Matrix multiplication is always commutative.|False|AB and BA can differ.",
 "n|Number of elements in the product of a 2 x 3 and a 3 x 4 matrix|8|Order 2 x 4.",
 "m|Matrices A (order 3 x 2) and B (order 3 x 2): which is defined?|A + B|AB~Columns of A not equal to rows of B;BA~Same reason;A x B with order 3 x 3~Not defined|Same order is needed for addition.",
 "t|A I = A for a suitable identity matrix I.|True|Identity matrix.",
 "m|The additive identity for matrices is|the zero matrix|the identity matrix~That is the multiplicative identity;the transpose~Different idea;the scalar 1~Not a matrix|A + O = A.",
 "s|The product of an m x n and n x p matrix has order m x ____.|p|Rows of the first, columns of the second."],
svg=(mx,"Two matrices with a row of A and a column of B highlighted and the product worked out","Matrix multiplication"))
print('ok')
