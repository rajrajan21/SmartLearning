import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="26" font-weight="bold">Kaprekar routine: 6382 reaches 6174 in 3 rounds</text>'
    rows=[('6382','8632','2368','6264'),('6264','6642','2466','4176'),('4176','7641','1467','6174')]
    for i,(s,a,bb,c) in enumerate(rows):
        x=30+i*190
        b+=f'<rect x="{x}" y="50" width="170" height="170" rx="8" fill="#fef9e7" stroke="#b9770e"/>'
        b+=f'<text x="{x+12}" y="76" font-weight="bold">Start {s}</text><text x="{x+12}" y="108">A = {a} (largest)</text><text x="{x+12}" y="134">B = {bb} (smallest)</text>'
        b+=f'<text x="{x+12}" y="172" font-weight="bold" fill="#c0392b">C = A - B = {c}</text>'
        if i<2: b+=f'<text x="{x+172}" y="140" font-size="22">→</text>'
    b+='<text x="30" y="256" font-size="14">Any 4-digit number with at least two different digits reaches 6174, the Kaprekar constant.</text>'
    return b
svgfile('c6-maths-kaprekar-route.svg',620,280,dia())
chapter(6,'maths','number-play','Number Play',
 ('The magic of 6174','Take any 4-digit number with at least two different digits, say 6382. Arrange its digits to make the biggest number and the smallest number, and subtract. Repeat with the answer. Strangely, you always land on the same number, 6174. D. R. Kaprekar, a school teacher from Devlali in Maharashtra, found this in 1949. In this chapter we play with numbers: reading what they say, spotting patterns, estimating, and winning games with strategy.'),
 [('Numbers can tell us things',[
   'Numbers do much more than count. A group of children in a line each says the number of taller neighbours they have. 0 means no taller neighbour, 1 means one, and 2 means both neighbours are taller.',
   'From such numbers we can reason about the arrangement. For example, the two children at the ends can never say 2, because an end child has only one neighbour. The tallest child always says 0.',
   'Computational thinking means setting up clear rules like this and using them to find patterns or answers.']),
  ('Supercells',[
   'In a table of numbers, a cell is a supercell if its number is greater than all its neighbouring cells. In a row, the neighbours are the cells immediately to the left and right. In a grid, they are the cells to the left, right, above and below.',
   'In the row 200, 577, 626, 345, 790, 694, 109, 198, the number 626 is a supercell because it is larger than 577 and 345, while 198 is a supercell because its only neighbour is 109. The largest number in a table is always a supercell, and the smallest number can never be one.',
   'We can fill a table to get as many supercells as possible by alternating large and small numbers. It is not possible to have no supercells if no number repeats, because the largest number always qualifies.']),
  ('Number lines and large numbers',[
   'On a number line from 1000 to 10,000, we can place numbers such as 2180, 2754, 5030 and 9950 by finding which thousand they are between and how far along.',
   'To read marked numbers on a line, look at the gap between two known marks and work out the equal step, then label the other positions.',
   'Counting digits: there are 9 one-digit numbers (1 to 9), 90 two-digit numbers (10 to 99), 900 three-digit numbers, 9000 four-digit numbers and 90,000 five-digit numbers.']),
  ('Playing with digits',[
   'The digit sum of a number is the sum of its digits. The digit sum of 68 is 14, and so is that of 176 (1 + 7 + 6) and 545 (5 + 4 + 5).',
   'The smallest number with digit sum 14 is 59, and the largest 5-digit number with digit sum 14 is 95,000. For three consecutive digits like 345, 456 or 567, the digit sum is 3 times the middle digit.',
   'Digit detectives: among the numbers 1 to 100, the digit 7 appears 20 times (ten in the units place and ten in the tens place), and among 1 to 1000 it appears 300 times.']),
  ('Palindromes',[
   'A palindrome reads the same from left to right and right to left, like 66, 848, 575 and 1111. A 3-digit palindrome is of the form aba. Using only the digits 1, 2 and 3 there are 3 × 3 = 9 of them, such as 121, 313 and 222.',
   'Reverse and add: start with 68. Add its reverse 86 to get 154. Add 451 to get 605. Add 506 to get 1111, a palindrome. Starting with a 2-digit number, repeating this always gives a palindrome. For 3-digit numbers nobody knows, and it is suspected that 196 never reaches a palindrome.',
   'Puzzle: a 5-digit palindrome is odd, its tens digit is double its units digit, and its hundreds digit is double its tens digit. The units digit is odd, so it is 1 (3 would make the hundreds digit 12). Hence the number is 12421, twelve thousand four hundred twenty-one.']),
  ('The magic number of Kaprekar',[
   'Take a 4-digit number with at least two different digits. Make the largest number A and the smallest number B from its digits, and find C = A - B. Repeat with C.',
   'Start with 6382: A = 8632, B = 2368, C = 6264. Then A = 6642, B = 2466, C = 4176. Then A = 7641, B = 1467, C = 6174. After that 7641 - 1467 gives 6174 again.',
   'Every such number reaches 6174, the Kaprekar constant. For 3-digit numbers the repeating number is 495. Some numbers take more rounds: 5683 takes 7 rounds.']),
  ('Clock, calendar and mental maths',[
   'On a 12-hour clock there are special times: 4:44 repeats a digit, 10:10 repeats a pair, and 12:21 is a palindrome. Dates can also be patterned: 20/12/2012 repeats the digits 2, 0, 1, 2, and 11/02/2011 reads the same both ways.',
   'Mental maths: break a total into parts. 38,800 = 25,000 + 400 × 2 + 13,000, and 3400 = 1500 + 1500 + 400. We can also subtract: 39,800 = 40,000 - 800 + 300 + 300.',
   'Sums can change the number of digits: 5-digit + 5-digit can give a 5-digit or a 6-digit number, but a 4-digit number + 2-digit number gives a 4-digit number or sometimes a 5-digit number, never a 6-digit number.']),
  ('Patterns for quick adding, and the Collatz conjecture',[
   'When numbers are arranged in a pattern, such as 4 rows of 5 equal numbers, do not add one by one: multiply the number of equal numbers by their value, or pair them up.',
   'The Collatz rule: start with any whole number. If it is even, halve it. If it is odd, multiply by 3 and add 1. Repeat. For 12 we get 12, 6, 3, 10, 5, 16, 8, 4, 2, 1.',
   'Every starting number tried so far reaches 1. In 1937 Lothar Collatz guessed it always happens, but nobody has proved it. It is one of the most famous unsolved problems in mathematics. For powers of 2 it is easy: halving 64 gives 32, 16, 8, 4, 2, 1.']),
  ('Estimation and winning strategies',[
   'An estimate is a good guess when an exact number is not needed. Paromita knew her class sections had 32, 29 and 35 children, so she estimated about 100 in her class. With 5 classes in her school she estimated about 500 students.',
   'In the game 21, players take turns adding 1, 2 or 3 to the number said, and whoever reaches 21 wins. The winning numbers are 21, 17, 13, 9, 5 and 1, which go down by 4 each time. So the first player should say 1, and afterwards always add 4 minus what the other player added.',
   'In the game with numbers 1 to 10 and target 99, the winning numbers are the multiples of 11: 11, 22, ..., 99. The second player wins, because whatever the first says, the second adds enough to reach 11, then 22, and so on.'])],
 [('Use the Kaprekar steps on 6382 and show that it reaches 6174.',[('Make the biggest and smallest numbers: A = 8632, B = 2368.','Arrange digits in decreasing and increasing order.'),('C = 8632 - 2368 = 6264. Repeat on 6264: A = 6642, B = 2466, C = 4176.','Second round.'),('Repeat on 4176: A = 7641, B = 1467, C = 6174.','Third round reaches the constant.')]),
  ('Start with 68 and reverse and add until you get a palindrome.',[('68 + 86 = 154, not a palindrome.','Add the number to its reverse.'),('154 + 451 = 605, not a palindrome.','Repeat with the new number.'),('605 + 506 = 1111, a palindrome.','Stop: it takes 3 steps.')]),
  ('Write the Collatz sequence for 6 and say how many steps it takes to reach 1.',[('6 is even, so halve it: 3.','Rule for even numbers.'),('3 is odd: 3 × 3 + 1 = 10, then 5, then 16, 8, 4, 2, 1.','Rule for odd numbers is 3n + 1.'),('The sequence 6, 3, 10, 5, 16, 8, 4, 2, 1 takes 8 steps.','Count the arrows.')]),
  ('In the game of 21, how can the first player always win?',[('The winning numbers are 21, 17, 13, 9, 5, 1.','Work backward: if you say 17, the opponent can only reach 18, 19 or 20, and then you say 21.'),('The first player says 1.','So the first player starts on a winning number.'),('After that, whatever the other player adds (1, 2 or 3), the first player adds 3, 2 or 1 so each turn adds up to 4.','This keeps the first player on 5, 9, 13, 17 and finally 21.')])],
 ('Explain to a friend what a palindrome is, how the Kaprekar routine works, and one game strategy you learnt.',['A palindrome reads the same forwards and backwards, like 575.','In the Kaprekar routine we subtract the smallest from the largest arrangement of the digits and repeat until we reach 6174.','In the game of 21 the first player says 1 and then always completes a sum of 4 with the opponent.'],['Thinking a pattern is a proof; nobody has proved the Collatz conjecture.','Forgetting that digit-rearrangement numbers like 0558 count as 558.','Thinking all sums of two 5-digit numbers have 5 digits.']),
 ['Numbers can convey information, form patterns, help us estimate, pose puzzles and play games.','A supercell is a cell whose number is greater than all its neighbours.','Digit sums, palindromes and the Kaprekar routine are patterns hidden in numbers; every 4-digit number with two different digits reaches 6174.','The Collatz conjecture says repeating halve-or-3n+1 always reaches 1; it is still unsolved.','Estimation gives quick, useful answers when the exact number is not needed.','Winning strategies come from working backward from the target number.'],
 [num('1',1,'How many two-digit numbers are there?',90,'The two-digit numbers go from 10 to 99, which is 99 - 10 + 1 = 90.',[(99,'That counts from 1, but two-digit numbers start at 10.'),(100,'100 is a three-digit number.')]),
  num('2',1,'What is the smallest number whose digits add up to 14?',59,'A two-digit number has the smallest value when its tens digit is small, so 5 and 9 give 59.',[(95,'95 is larger than 59 with the same digits.'),(77,'7 + 7 = 14, but 77 is bigger than 59.')]),
  mcq('3',1,'Every 4-digit number with at least two different digits reaches which number in the Kaprekar routine?','6174',[('495','495 is the number reached by 3-digit numbers.'),('1111','1111 is a palindrome, not the Kaprekar constant.')],'This is the Kaprekar constant.'),
  num('4',1,'Start with 68. Add its reverse 86 and keep reversing and adding. What palindrome do you reach?',1111,'68 + 86 = 154, 154 + 451 = 605, 605 + 506 = 1111.',[(154,'154 is not a palindrome.'),(605,'605 is not a palindrome.')]),
  num('5',2,'How many times does the digit 7 appear when writing the numbers 1 to 100?',20,'It appears 10 times as units digit (7, 17, ..., 97) and 10 times as tens digit (70 to 79).',[(10,'You counted only the units digit.'),(19,'You may have counted the numbers with a 7 and counted 77 once.')]),
  num('6',2,'How many steps does the Collatz sequence for 6 take to reach 1?',8,'6, 3, 10, 5, 16, 8, 4, 2, 1: that is 8 steps.',[(9,'9 is the number of terms, not steps.'),(7,'Count the arrows again; there are 8.')]),
  num('7',2,'A 5-digit palindrome is odd, its tens digit is double its units digit and its hundreds digit is double its tens digit. What is it?',12421,'The units digit is 1, tens 2, hundreds 4, so the number is 12421.',[(13631,'The tens digit 3 is not double the units digit 1.'),(12321,'The hundreds digit 3 is not double the tens digit 2.')]),
  mcq('8',2,'In the game of 21 (add 1, 2 or 3, reach 21 to win), the first player should start by saying','1',[('3','From 3, the other player can reach 5 and then control the game.'),('2','From 2, the other player can reach 5 and then control the game.')],'The winning numbers are 1, 5, 9, 13, 17 and 21.'),
  mcq('9',3,'In the game where numbers 1 to 10 are added and the target is 99, who always wins?','The second player',[('The first player','The first player cannot say 11, a multiple of 11, on the first turn.'),('Neither player','The second player can always reach multiples of 11.')],'The second player aims for the multiples of 11: 11, 22, ..., 99.'),
  tf('10',3,'Mathematicians have proved that every starting number in the Collatz sequence reaches 1.',False,'The Collatz conjecture is still unsolved, although every number tried so far reaches 1.')],
 svgs=[('c6-maths-kaprekar-route','The Kaprekar steps for 6382: 6264, then 4176, then 6174','Kaprekar routine')],
 keep=['digit sum','palindrome','Kaprekar constant','supercell','Collatz conjecture','estimate'])
