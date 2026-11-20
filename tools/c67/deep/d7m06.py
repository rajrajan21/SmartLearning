import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">A 3 x 3 magic square: every row, column and diagonal adds to 15</text>'
    g=[[8,1,6],[3,5,7],[4,9,2]]
    for i in range(3):
        for j in range(3):
            c='#fdebd0' if (i+j)%2==0 else '#d6eaf8'
            b+=f'<rect x="{40+j*60}" y="{44+i*60}" width="60" height="60" fill="{c}" stroke="#333"/><text x="{62+j*60}" y="{84+i*60}" font-size="22">{g[i][j]}</text>'
        b+=f'<text x="236" y="{84+i*60}" font-size="16" fill="#c0392b">= 15</text>'
    for j in range(3): b+=f'<text x="{58+j*60}" y="236" font-size="16" fill="#c0392b">15</text>'
    b+='<text x="300" y="70" font-size="15">Centre is 5, always.</text><text x="300" y="96" font-size="15">Corners: even numbers (8, 6, 4, 2).</text><text x="300" y="122" font-size="15">Edges: odd numbers (1, 3, 7, 9).</text>'
    b+='<text x="300" y="164" font-weight="bold" font-size="15">Parity (even or odd)</text><text x="300" y="190" font-size="15">even + even = even, odd + odd = even</text><text x="300" y="216" font-size="15">even + odd = odd</text>'
    b+='<text x="300" y="242" font-size="15">nth even = 2n, nth odd = 2n - 1</text>'
    return b
svgfile('c7-maths-magic-square.svg',600,260,d())
chapter(7,'maths','number-play','Number Play',
 ('Which number does each child call out?','The children from last year\'s textbook line up again. This time each child calls out a number, the number of taller children standing in front of them. The first child says 0, the second says 1. Without seeing the heights, we can already say many things about the line. Numbers can tell us a lot. In this chapter we play with numbers and find hidden reasons.'),
 [('Numbers tell us things',[
   'Each child calls out the number of children in front of them who are taller. The tallest child always says zero, because nobody taller stands in front.',
   'But a child who says zero is not always the tallest in the whole group. The child at the front always says zero too, whatever their height.',
   'The shortest person need not call out the largest number. The number depends on who stands in front, and so on the arrangement of the line.',
   'The largest number possible in a group of 8 people is 7, when all the other seven stand in front and are taller.']),
  ('Picking parity',[
   'Kishor must put 5 number cards into 5 boxes so that they sum to 30. Do we need to try every selection? Parity can answer the question.',
   'An even number can be arranged in pairs with nothing left over. Adding any number of even numbers gives an even number.',
   'An odd number is one more than a collection of pairs, or one less than a collection of pairs.',
   'Two odd numbers have two leftovers that make a new pair, so the sum of two odd numbers is even. Three odd numbers give an odd sum. Four odd numbers give an even sum. The sum is even when the number of odd numbers is even.',
   'Kishor has 5 boxes. If all five cards were odd, the sum of five odd numbers would be odd, so it could never be 30. This is how we prove it is impossible without trying every case.',
   'The word parity describes the property of being even or odd. Even plus odd is always odd, because the odd one leaves a leftover.']),
  ('Solving puzzles with parity',[
   'Martin and Maria were born exactly one year apart. Maria says the sum of their ages is 112. Their ages are consecutive numbers.',
   'In any two consecutive numbers, one is even and one is odd. So their sum is odd. 112 is even, so it is impossible.',
   'Lakpa has an odd number of 1 rupee coins, an odd number of 5 rupee coins and an even number of 10 rupee coins. He says the total is 205 rupees.',
   'The 1 rupee coins give an odd amount, the 5 rupee coins give an odd amount and the 10 rupee coins give an even amount. Odd plus odd plus even is even, but 205 is odd, so he made a mistake.',
   'For products, an even number times any number is even, and an odd number times an odd number is odd. So a grid with an odd number of rows and an odd number of columns has an odd number of small squares, otherwise even.']),
  ('Parity of expressions and nth terms',[
   'The expression 100p is always even and 48w - 2 is always even. The expression 3n + 4 is sometimes even and sometimes odd, depending on n.',
   'What is the nth even number? The multiples of 2 are 2, 4, 6, so the nth term is 2 x n, written 2n.',
   'The odd numbers 1, 3, 5, 7 are each 1 less than the even numbers 2, 4, 6, 8. So the nth odd number is 2n - 1.',
   'The 100th even number is 200 and the 100th odd number is 199. These formulas let us list all even numbers and all odd numbers.']),
  ('Explorations in grids and magic squares',[
   'Fill a 3 x 3 grid with 1 to 9 without repeating any number. The circled numbers outside show the row and column sums.',
   'Some sum patterns are impossible. The smallest row sum is 1 + 2 + 3 = 6 and the largest is 7 + 8 + 9 = 24. A circled number like 5 or 26 can never be a row sum.',
   'The three row sums together must equal the sum of all the numbers from 1 to 9, which is 45. The same is true for the three column sums.',
   'A magic square is a grid in which each row, each column and each diagonal adds up to the same number.',
   'In a 3 x 3 magic square made of 1 to 9, the three equal row sums add to 45, so each row sum is 15.',
   'Can 9 be in the centre? Then 8 must be somewhere with 9 in a line, and 8 + 9 + something = 15 is impossible. By similar reasoning only 5 can be at the centre.',
   'There are 3,62,880 ways to fill a 3 x 3 grid with 1 to 9, so guessing is hopeless. Reasoning step by step makes the magic square appear.']),
  ('Virahanka numbers and cryptarithms',[
   'Long ago, poets in India counted the ways to make a line of poetry from short and long beats. A short beat has one count and a long beat has two.',
   'The number of ways to fill 1 count is 1, for 2 counts is 2, for 3 counts is 3, then 5, 8, 13, 21, 34, 55. Each number is the sum of the two before it.',
   'This is the Virahanka sequence, found in history through poetry and the arts. Later it became known as the Fibonacci sequence.',
   'In cryptarithms, digits are replaced by letters and we must find which digit each letter hides. Parity and reasoning about carrying are our detective tools.'])],
 [('Show that five odd numbers cannot add up to 30.',[('Two odd numbers add to an even number, so four odd numbers add to even.','Pair them up.'),('Five odd numbers are four plus one more odd number: even + odd = odd.','The fifth one breaks the pairing.'),('30 is even, so it is impossible.','Parity does not match.')]),
  ('Can two people whose ages differ by 1 year have ages that sum to 112?',[('Ages are consecutive: one even and one odd.','Consecutive numbers alternate.'),('Even + odd is odd, but 112 is even.','Parity mismatch.'),('So it is impossible.','No pair of consecutive numbers sums to an even number.')]),
  ('Find the 50th odd number and the 50th even number.',[('The nth even number is 2n, so the 50th is 100.','Multiples of 2.'),('The nth odd number is 2n - 1, so the 50th is 99.','One less than the even number at the same position.')]),
  ('Why must the centre of a 3 x 3 magic square of 1 to 9 be 5, and what is the magic sum?',[('Row sums total 45 and are equal, so each is 15.','45 divided by 3 rows.'),('The centre lies on 4 lines. Putting 9 or 1 there fails because 8 + 9 would need a number above 15.','Check lines through the centre.'),('Only 5 works: 5 is the middle of 1 to 9.','The centre number must pair up around 15.')])],
 ('Explain to a friend how parity shows that some sums are impossible, and why every 3 x 3 magic square of 1 to 9 has 15 as its magic sum.',['Even + even and odd + odd are even; even + odd is odd.','If the parities do not match, the total is impossible.','The three equal row sums add to 45, so each is 15.'],['Thinking five odd numbers can add to an even number.','Thinking the shortest person must call the biggest number.','Thinking magic squares must be found by trial and error only.']),
 ['Numbers can describe arrangements, like each child counting taller children in front.','Parity means even or odd: odd + odd = even, even + odd = odd, even + even = even.','The nth even number is 2n and the nth odd number is 2n - 1.','Parity can prove that some puzzles are impossible without trying all cases.','The row sums of a 3 x 3 grid of 1 to 9 add to 45; a magic square of 1 to 9 has magic sum 15 and centre 5.','The Virahanka (Fibonacci) sequence 1, 2, 3, 5, 8, 13, 21, ... comes from counting poetic metres.','Cryptarithms replace digits with letters for us to decode.'],
 [mcq('1',1,'What is the parity of the sum of two odd numbers?','even',[('odd','Two odd numbers leave two single leftovers, which make a pair.'),('Cannot be said','It is always even.')],'7 + 5 = 12 is even.'),
  mcq('2',1,'The nth odd number is','2n - 1',[('2n + 1','That is the (n+1)th odd number.'),('2n','That is the nth even number.')],'Subtract 1 from the nth even number.'),
  tf('3',1,'The sum of two consecutive numbers is always odd.',True,'One is even and the other is odd.'),
  num('4',1,'What is the 100th odd number?',199,'2 x 100 - 1 = 199.',[(200,'That is the 100th even number.'),(201,'That is the 101st odd number.')]),
  mcq('5',2,'Five cards are to be chosen from odd-numbered cards so the sum is 30. This is','impossible',[('possible with careful choice','Five odd numbers always add to an odd number.'),('possible only for large numbers','The size does not matter, only the parity.')],'Odd count of odd numbers gives an odd sum.'),
  mcq('6',2,'Lakpa has an odd number of Rs 1 coins, an odd number of Rs 5 coins and an even number of Rs 10 coins. His total can be','even',[('odd','Odd + odd + even is even.'),('205','205 is odd, so his total cannot be 205.')],'Odd + odd + even = even.'),
  num('7',2,'What is the sum of each row of a 3 x 3 magic square using 1 to 9?',15,'The row sums add to 45 and are equal, so each is 45 / 3 = 15.',[(45,'That is the sum of the entire grid.'),(9,'That is just the largest number.')]),
  mcq('8',2,'Which number is always at the centre of a 3 x 3 magic square of 1 to 9?','5',[('9','8 and 9 in a line would need a third number above 15.'),('1','1 and 2 in a line would need a number above 15 to reach 15.')],'Only 5 can be at the centre.'),
  num('9',3,'Next in the Virahanka sequence 1, 2, 3, 5, 8, 13, ...?',21,'Add the previous two: 8 + 13 = 21.',[(18,'Add 8 and 13, not 5 and 13.'),(26,'This doubles 13 and misses the rule.')]),
  mcq('10',3,'Why can the circled sum 26 not be a row sum in a 3 x 3 grid of 1 to 9?','The largest row sum is 24',[('26 is an even number','Even sums are fine, such as 10.'),('26 is bigger than 45','The grid total is 45, but a single row cannot exceed 24.')],'The largest possible row is 7 + 8 + 9 = 24.')],
 svgs=[('c7-maths-magic-square','A 3 by 3 magic square with magic sum 15 and notes on parity','Magic square and parity')],
 keep=['parity','even','odd','magic square','Virahanka'])
