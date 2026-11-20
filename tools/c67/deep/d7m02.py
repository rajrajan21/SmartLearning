import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="26" font-weight="bold">Terms are the parts joined by + (subtraction becomes adding the inverse)</text>'
    def box(x,y,w,t,c): return f'<rect x="{x}" y="{y}" width="{w}" height="34" rx="5" fill="{c}" stroke="#555"/><text x="{x+8}" y="{y+23}" font-size="18">{t}</text>'
    b+=box(20,44,60,'30','#d6eaf8')+'<text x="90" y="68" font-size="22">+</text>'+box(110,44,90,'5 x 4','#fdebd0')+'<text x="210" y="68" font-size="18">= 30 + 20 = 50</text>'
    b+=box(20,100,60,'83','#d6eaf8')+'<text x="90" y="124" font-size="22">+</text>'+box(110,100,90,'(-14)','#fadbd8')+'<text x="210" y="124" font-size="18">83 - 14 has terms 83 and -14</text>'
    b+='<text x="20" y="178" font-weight="bold">Brackets after a minus sign: signs inside change</text>'
    b+='<text x="20" y="206" font-size="18">500 - (250 - 100) = 500 - 250 + 100 = 350</text>'
    b+='<text x="20" y="234" font-size="18">200 - (40 + 3) = 200 - 40 - 3 = 157</text>'
    b+='<text x="20" y="266" font-size="15" fill="#c0392b">Brackets NOT after a minus sign keep their signs: 28 + (35 - 10) = 28 + 35 - 10</text>'
    return b
svgfile('c7-maths-terms-brackets.svg',560,290,d())
chapter(7,'maths','arithmetic-expressions','Arithmetic Expressions',
 ('Who got the right answer?','Mallesh brought 30 marbles to the playground. Arun brought 5 bags with 4 marbles in each bag. Purna wrote 30 + 5 x 4 and got 140. Mallesh got 50. Both used the same expression, but only one is right. Why do the same symbols give two answers, and how do brackets and terms settle the argument?'),
 [('Expressions and their values',[
   'A phrase like 13 + 2, 20 - 4, 12 x 5 or 18 divided by 3 is called an arithmetic expression. Every expression has a value, the number it evaluates to.',
   'The value of 13 + 2 is 15. We link an expression and its value with the equals sign.',
   'If Mallika spends 25 rupees on lunch each day, her weekly lunch cost is the expression 5 x 25, read as five times twenty-five or the product of 5 and 25.',
   'Different expressions can have the same value. For example 12 can be written as 7 + 5, 20 - 8, 3 x 4 or 36 divided by 3.']),
  ('Comparing expressions by reasoning',[
   'We compare expressions with equals, greater than and less than, using their values.',
   'We can often compare without calculating, by imagining a story. Which is greater, 1023 + 125 or 1022 + 128?',
   'Raja had 1023 marbles and got 125 more. Joy had 1022 and got 128 more. Raja started with 1 more, but Joy received 3 more, so Joy ends with 2 more.',
   'Now take 113 - 25 and 112 - 24. Raja has 1 marble more but loses 1 more, so they are left with the same number. The two expressions are equal.']),
  ('Brackets settle confusion',[
   'In a sentence, a comma can change the meaning. In mathematics, brackets do that job.',
   'In 30 + 5 x 4 it is not clear what to do first. Purna added 30 and 5 first and got 140. Mallesh multiplied first and got 50, which matches the story.',
   'When an expression has brackets, we first find the value inside the bracket, then do the rest.',
   'Irfan buys biscuits for 15 rupees and dal for 56 rupees and pays 100 rupees. The change is 100 - (15 + 56). Inside the bracket we get 71, so the change is 29 rupees.',
   'Without the bracket, 100 - 15 + 56 gives 141, which is absurd because he would receive more money than he paid. Brackets protect the meaning.']),
  ('Terms of an expression',[
   'Terms are the parts of an expression separated by plus signs. In 12 + 7 the terms are 12 and 7.',
   'Subtracting a number is the same as adding its inverse. So 83 - 14 is 83 + (-14), and its terms are 83 and -14.',
   'A product like 6 x 5 or 4 x 6 is one single term because it has no plus sign inside it.',
   'To evaluate an expression, first work out each term, then add the terms. So 30 + 5 x 4 has terms 30 and 5 x 4, which are 30 and 20, and the value is 50.',
   'For 5 x (3 + 2) + 7 x 8 + 3, the terms are 5 x (3 + 2), 7 x 8 and 3. They are 25, 56 and 3, so the value is 84.']),
  ('Swapping and grouping terms',[
   'A drone goes 6 metres up and 4 metres down. We can write 6 + (-4) = 2, and swapping the terms gives (-4) + 6 = 2. Swapping does not change the sum.',
   'This is called the commutative property of addition. It works even when terms are negative.',
   'With three terms, (-7) + 10 + (-11) gives the same result whether we add the first two first or the last two first. This is the associative property of addition.',
   'So when an expression is written as a sum of terms, we may add them in any order or grouping. If Manasa forgets the fourth number in a long list she can simply add it at the end.',
   'Not everything can be swapped in daily life. Hat and shoes can be worn in any order, but socks and shoes cannot. Mathematics tells us exactly when order matters.']),
  ('Removing brackets',[
   'Take 200 - (40 + 3). The bracket equals 43, so the value is 157. But it is simpler to subtract 40 and then subtract 3, which also gives 157.',
   'So 200 - (40 + 3) = 200 - 40 - 3. When brackets preceded by a minus sign are removed, the signs of the terms inside change.',
   'Check with 500 - (250 - 100). The bracket is 150, so the value is 350. If we wrote 500 - 250 - 100 we would get 150, which is wrong. The correct form is 500 - 250 + 100 = 350.',
   'If the brackets are not preceded by a minus sign, the signs stay. Hira has 28 coins and 35 coins and gifts away 10: 28 + (35 - 10) = 28 + 35 - 10 = 53.',
   'You do not need to memorise this. Think about what the bracket means: subtracting a bracket subtracts everything inside it.']),
  ('The distributive property',[
   'Lhamo and Norbu each order a cutlet at 43 rupees and a rasgulla at 24 rupees. Together they pay 2 x (43 + 24) = 2 x 67 = 134 rupees.',
   'We can also find 2 x 43 + 2 x 24 = 86 + 48 = 134 rupees. The two expressions are equal.',
   'In general, a number multiplied by a sum equals the sum of the number multiplied by each term. This is the distributive property.',
   'It also works for subtraction: 14 x 10 - 6 x 10 = (14 - 6) x 10 = 80.',
   'It gives quick tricks. 97 x 25 = (100 - 3) x 25 = 2500 - 75 = 2425. And if 53 x 18 = 954, then 63 x 18 = 954 + 10 x 18 = 1134.',
   'Be careful: 5 x 4 + 3 is 23, but 5 x (4 + 3) is 35. Brackets change what is multiplied.'])],
 [('Find the value of 39 - 2 x 6 + 11 by writing its terms.',[('Terms: 39, -(2 x 6) and 11, that is 39, -12 and 11.','2 x 6 is one term, and subtraction becomes adding the inverse.'),('39 + (-12) + 11 = 38.','Add the terms in any order.')]),
  ('Compare 1023 + 125 and 1022 + 128 without finding the values.',[('1023 is 1 more than 1022.','Compare the first numbers.'),('128 is 3 more than 125.','Compare the second numbers.'),('The second sum gains 3 and loses 1, so it is 2 more. 1022 + 128 is greater.','Net difference is 3 - 1 = 2.')]),
  ('Remove the brackets: 500 - (250 - 100), and check the value.',[('The brackets follow a minus sign, so inside signs change: 500 - 250 + 100.','Subtracting a bracket subtracts the whole bracket.'),('Value: 500 - 250 = 250, then 250 + 100 = 350.','Or evaluate the bracket first: 500 - 150 = 350.')]),
  ('Use the distributive property to find 97 x 25.',[('97 = 100 - 3.','Pick a nearby easy number.'),('97 x 25 = 100 x 25 - 3 x 25.','Distribute the product over the difference.'),('2500 - 75 = 2425.','Subtract the two products.')])],
 ('Explain to a friend why 30 + 5 x 4 is 50 and not 140, and what happens to signs when you remove brackets after a minus sign.',['Terms are separated by plus signs, so 5 x 4 is a single term and is worked out first.','Brackets tell us which part to evaluate first.','When brackets after a minus sign are removed, every term inside changes its sign.'],['Evaluating strictly from left to right.','Thinking 200 - (40 + 3) equals 200 - 40 + 3.','Thinking 5 x 4 + 3 equals 5 x (4 + 3).']),
 ['An arithmetic expression has a value; different expressions can have the same value.','Terms are the parts joined by plus signs; subtraction means adding the inverse.','Brackets are evaluated first; terms are evaluated before adding.','Terms can be swapped (commutative) and grouped (associative) when added.','Removing brackets after a minus sign changes the signs inside; after a plus sign it does not.','The distributive property: a x (b + c) = a x b + a x c.'],
 [mcq('1',1,'What is the value of 30 + 5 x 4?','50',[('140','That adds 30 and 5 first. Multiplication belongs to a term, so 5 x 4 = 20 is found first.'),('35','This ignores the multiplication by 4.')],'5 x 4 is a single term equal to 20, and 30 + 20 = 50.'),
  mcq('2',1,'What are the terms of 83 - 14?','83 and -14',[('83 and 14','Subtraction is adding the inverse, so the second term is -14.'),('97 and 14','That is not what the expression splits into.')],'83 - 14 = 83 + (-14).'),
  tf('3',1,'6 x 5 + 4 x 6 has two terms.',True,'The terms are 6 x 5 and 4 x 6 because only one plus sign separates them.'),
  mcq('4',1,'Which property says 3 + 8 = 8 + 3?','Commutative property of addition',[('Associative property of addition','Associative is about grouping, not swapping.'),('Distributive property','Distributive links multiplication with addition.')],'Swapping terms does not change the sum.'),
  num('5',2,'Find the value of 48 - 10 x 2 + 16 / 2.',36,'Terms are 48, -20 and 8, and 48 - 20 + 8 = 36.',[(76,'That is not finding each term first.'),(28,'Check the sign of the last term.')]),
  mcq('6',2,'Which equals 200 - (40 + 3)?','200 - 40 - 3',[('200 - 40 + 3','The sign of 3 must change because the bracket follows a minus sign.'),('200 + 40 + 3','This changes the first operation.')],'Removing brackets after a minus sign changes the sign of each term.'),
  num('7',2,'What is 500 - (250 - 100)?',350,'Evaluate the bracket: 150. Then 500 - 150 = 350.',[(150,'That is 500 - 250 - 100, which is not the same.')]),
  mcq('8',2,'Using the distributive property, 97 x 25 =','100 x 25 - 3 x 25',[('100 x 25 + 3 x 25','97 is 3 less than 100, so we subtract 3 x 25.'),('97 x 20 + 5','This is not a correct split of the product.')],'= 2500 - 75 = 2425.'),
  num('9',3,'If 53 x 18 = 954, what is 63 x 18?',1134,'63 is 10 more than 53, so add 10 x 18 = 180 to 954.',[(1044,'That adds 90, not 180.'),(954,'The product changes when one number increases.')]),
  mcq('10',3,'Raja has 1023 + 125 marbles and Joy has 1022 + 128 marbles. Who has more?','Joy, by 2 marbles',[('Raja, by 2','Raja started with 1 more but Joy got 3 more.'),('They have equal marbles','The net difference is 3 - 1 = 2, not 0.')],'Joy gains 3 and loses 1 in comparison, so she has 2 more.')],
 svgs=[('c7-maths-terms-brackets','Terms of expressions and what happens to signs when brackets are removed','Terms and bracket rules')],
 keep=['expression','terms','brackets','commutative','associative','distributive'])
