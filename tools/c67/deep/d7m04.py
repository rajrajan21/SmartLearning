import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="26" font-weight="bold">Matchstick Ls: matchsticks = 2 x n (written 2n)</text>'
    for n in range(1,5):
        x0=30+(n-1)*125
        for k in range(n):
            x=x0+k*26
            b+=f'<line x1="{x}" y1="48" x2="{x}" y2="88" stroke="#b9770e" stroke-width="5"/><line x1="{x}" y1="88" x2="{x+16}" y2="88" stroke="#b9770e" stroke-width="5"/>'
        b+=f'<text x="{x0}" y="120" font-size="15">n = {n}: 2n = {2*n}</text>'
    b+='<text x="30" y="160" font-weight="bold">Letter-numbers stand for numbers that can change</text>'
    b+='<text x="30" y="188" font-size="16">Aftab is a years old: Shabnam is a + 3     (a = 23 gives 26)</text>'
    b+='<text x="30" y="214" font-size="16">Coconuts c at 35 rupees, jaggery j kg at 60: total 35c + 60j</text>'
    b+='<text x="30" y="240" font-size="16">l + b + l + b = 2l + 2b  (same value, simpler form)    5c + 3c + 10c = 18c</text>'
    return b
svgfile('c7-maths-letter-numbers.svg',560,262,d())
chapter(7,'maths','expressions-using-letter-numbers','Expressions Using Letter-Numbers',
 ('Shabnam and Aftab','Shabnam is 3 years older than her friend Aftab. When Aftab is 10, Shabnam is 13. When Aftab is 18, Shabnam is 21. Whatever Aftab\'s age, the rule is the same: add 3. Can we write this rule once, for every age at once? That is exactly what letter-numbers let us do.'),
 [('The notion of letter-numbers',[
   'In this chapter we learn a short way to write rules and patterns, and to explain why they hold.',
   'Shabnam is 3 years older than Aftab. If Aftab is 4, Shabnam is 4 + 3. If Aftab is 10, Shabnam is 10 + 3. If Aftab is 23, Shabnam is 23 + 3.',
   'Instead of writing a new line for every age, we use a letter, say a, for Aftab\'s age. Shabnam\'s age is then a + 3.',
   'Letters that stand for numbers are called letter-numbers. An expression that contains letter-numbers, like a + 3, is called an algebraic expression.',
   'If a is 23, we replace a by 23 and get 23 + 3 = 26 years. If we know Shabnam\'s age s, then Aftab is 3 years younger, so his age is s - 3. If s is 20, Aftab is 17.']),
  ('Writing expressions for patterns',[
   'Parthiv makes a pattern with matchstick Ls, each L needing 2 matchsticks. 5 Ls need 5 x 2 and 45 Ls need 45 x 2.',
   'So the number of matchsticks is 2 times the number of Ls. If n is the number of Ls, the expression is 2 x n.',
   'Now Ketaki buys coconuts at 35 rupees each and jaggery at 60 rupees a kilogram. For 10 coconuts and 5 kg jaggery she pays 10 x 35 + 5 x 60 = 650 rupees.',
   'For 8 coconuts and 9 kg of jaggery she pays 8 x 35 + 9 x 60 = 280 + 540 = 820 rupees.',
   'With c coconuts and j kilograms of jaggery, the amount is 35 x c + 60 x j. Different values of c and j give different amounts, but the pattern is the same.',
   'A relation written with letter-numbers that we can use again and again is often called a formula. The perimeter of a square with side q is 4 x q, so for a side of 7 cm the perimeter is 28 cm.',
   'The perimeter of an equilateral triangle with side a is 3 x a, and of a regular pentagon with side a is 5 x a.']),
  ('Revisiting arithmetic expressions',[
   'Before using letters in bigger ways, recall how we evaluate arithmetic expressions. First write the terms, then work out each term, then add them.',
   'For 23 - 10 x 2 the terms are 23 and -(10 x 2). So the value is 23 + (-20) = 3.',
   'Swapping and grouping terms makes some sums easier, and brackets after a minus sign change the signs inside.',
   'The same rules work when the terms contain letter-numbers, because letter-numbers stand for numbers. To find the value of an algebraic expression, replace each letter by its number.']),
  ('Leaving out the multiplication sign',[
   'Look at the multiples of 4: 4, 8, 12, 16, and so on. The third term is 4 x 3 and the 29th term is 4 x 29.',
   'The nth term is 4 x n. As a standard practice we write 4n, leaving out the multiplication sign. The number is written first and then the letter.',
   'The value of 7k when k = 4 is 7 x 4 = 28. The value of 5m + 3 when m = 2 is 5 x 2 + 3 = 13.',
   'Take care: 5m means 5 times m, not 5 and m side by side as digits. The 29th term of the multiples of 4 is 4 x 29 = 116.',
   'Mind the mistake: if h = 5 and n = 6 then h - (3 - n) is 5 - (3 - 6) = 5 + 3 = 8, not 4. Always replace the letters carefully and obey the bracket rule.']),
  ('Simplifying algebraic expressions',[
   'The perimeter of a rectangle is length + breadth + length + breadth. Using l and b this is l + b + l + b.',
   'Since terms can be added in any order, we write l + l + b + b. Now l + l is 2l and b + b is 2b, so the perimeter is 2l + 2b.',
   'The two forms look different but take the same value for every l and b. For l = 3 and b = 4, both give 14. 2l + 2b is the simplified form.',
   'A shopkeeper sells 5, 3 and 10 pencils on three days at c rupees each. The money is 5c + 3c + 10c. Here c is added (5 + 3 + 10) times, so the total is 18c.',
   'Terms with the same letter-number, like 5c, 3c and 10c, can be combined by adding their numbers. But terms with different letters, like 5c and 3d, cannot be combined.',
   'In the calendar, pick a 2 by 3 grid of dates. If the bottom middle date is w, the date above it is w - 7, the one to its left is w - 1 and the one to its right is w + 1.',
   'Algebra can say in a few symbols what takes many words. That is its great advantage.'])],
 [('Matchstick Ls need 2 sticks each. Write an expression for n Ls and find the sticks for 45 Ls.',[('Number of sticks = 2 x n = 2n.','Each L needs 2 sticks.'),('For n = 45, 2n = 90.','Replace n by 45.')]),
  ('Ketaki buys c coconuts at 35 rupees and j kg jaggery at 60 rupees a kg. Write the total and find it for c = 8, j = 9.',[('Total = 35c + 60j.','Price of coconuts plus price of jaggery.'),('35 x 8 + 60 x 9 = 280 + 540 = 820 rupees.','Replace c by 8 and j by 9.')]),
  ('Simplify l + b + l + b and check with l = 3, b = 4.',[('Rearrange: l + l + b + b.','Terms can be added in any order.'),('= 2l + 2b.','l + l = 2l and b + b = 2b.'),('Check: 3 + 4 + 3 + 4 = 14 and 2 x 3 + 2 x 4 = 14.','Both forms give the same value.')]),
  ('A mill takes 10 seconds to start and 8 seconds for each kg of grain. Write the time to grind y kg and find it for 25 kg.',[('Time = 10 + 8y seconds.','Start time plus time per kg.'),('For y = 25: 10 + 8 x 25 = 10 + 200 = 210 seconds.','Replace y by 25.')])],
 ('Explain what a letter-number is and why 5c + 3c + 10c can be written as 18c but 5c + 3d cannot be made shorter.',['A letter-number stands for a number that can change.','5c + 3c + 10c adds c a total of 5 + 3 + 10 = 18 times.','c and d are different numbers so their terms cannot be combined.'],['Thinking that a letter must stand for one fixed number.','Reading 5m as 5 and m written side by side.','Adding 5c and 3d to get 8cd.']),
 ['Letter-numbers (letters that stand for numbers) let us write rules for all values at once.','An expression with letter-numbers is an algebraic expression; replacing letters by numbers gives its value.','The multiplication sign is omitted: 4 x n is written 4n, number first.','Formulas like 4q (perimeter of a square) and 2l + 2b (perimeter of a rectangle) are algebraic expressions.','Simplifying combines like terms: 5c + 3c + 10c = 18c; terms with different letters cannot be combined.','The rules for arithmetic expressions (swapping, grouping, brackets) apply to algebraic expressions as well.'],
 [mcq('1',1,'Shabnam is 3 years older than Aftab, whose age is a. Shabnam\'s age is','a + 3',[('a - 3','That would make Shabnam younger.'),('3a','That multiplies the age by 3.')],'Add 3 to Aftab\'s age.'),
  mcq('2',1,'How is 4 x n written in algebra?','4n',[('n4','The number is written first.'),('4 + n','That is addition, not multiplication.')],'We omit the multiplication sign and write the number first.'),
  tf('3',1,'An expression with letters like 2l + 2b is called an algebraic expression.',True,'It contains letter-numbers.'),
  num('4',1,'Find the value of 7k when k = 4.',28,'7k means 7 times k: 7 x 4 = 28.',[(11,'7k is not 7 + k.'),(74,'7k is not the digits 7 and 4 side by side.')]),
  num('5',2,'Find 5m + 3 when m = 2.',13,'5 x 2 + 3 = 13.',[(10,'Remember to add the 3.'),(53,'5m does not mean 5 and 2 side by side.')]),
  num('6',2,'A mill takes 10 seconds to start and 8 seconds per kg. How long to grind 25 kg?',210,'10 + 8 x 25 = 210.',[(200,'You forgot the 10 seconds to start.'),(33,'The 8 seconds is for each kg, so multiply by 25.')],'s'),
  mcq('7',2,'Simplify 5c + 3c + 10c.','18c',[('18','The letter c must remain.'),('5c3c10c','Terms of the same letter are added, not joined.')],'c is added 5 + 3 + 10 = 18 times.'),
  mcq('8',2,'Which can be simplified into a single term?','7y + 2y',[('7y + 2x','y and x are different letter-numbers.'),('7 + 2y','7 and 2y are different kinds of terms.')],'7y + 2y = 9y.'),
  num('9',3,'The perimeter of a rectangle is 2l + 2b. Find it for l = 8 and b = 5.',26,'2 x 8 + 2 x 5 = 16 + 10 = 26.',[(13,'You found l + b only.'),(40,'That is the area l x b.')]),
  mcq('10',3,'In a calendar the bottom middle date of a 2 by 3 grid is w. What is the date directly above it?','w - 7',[('w - 1','That is the date to its left.'),('w + 7','That is the date below it, outside the grid.')],'Dates in the row above are 7 less.')],
 svgs=[('c7-maths-letter-numbers','Matchstick Ls and examples of letter-number expressions','Expressions using letter-numbers')],
 keep=['letter-number','algebraic expression','formula','simplify'])
