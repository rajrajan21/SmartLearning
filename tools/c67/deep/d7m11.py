import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">Multiplying and dividing decimals</text>'
    b+='<text x="20" y="58" font-size="15">5.8 × 1.24</text><text x="20" y="84" font-size="14">58 × 124 = 7192</text><text x="20" y="108" font-size="14">1 + 2 = 3 digits after the point</text><text x="20" y="132" font-size="15" fill="#1e8449">so 5.8 × 1.24 = 7.192</text>'
    b+='<text x="20" y="176" font-weight="bold" font-size="15">Dividing by 10, 100, 1000</text><text x="20" y="200" font-size="14">move the point left by 1, 2, 3 places</text><text x="20" y="224" font-size="14">123 ÷ 10 = 12.3     678 ÷ 1000 = 0.678</text>'
    b+='<text x="380" y="58" font-weight="bold" font-size="15">Long division with regrouping</text>'
    b+='<text x="380" y="84" font-size="14">237 ÷ 8: 23 tens → 2 tens, 7 left</text><text x="380" y="106" font-size="14">77 ones → 9 ones, 5 left</text><text x="380" y="128" font-size="14">5 ones = 50 tenths → 6 tenths, 2 left</text><text x="380" y="150" font-size="14">20 hundredths → 2 hundredths, 4 left</text><text x="380" y="172" font-size="14">40 thousandths → 5, nothing left</text>'
    b+='<text x="380" y="204" font-size="15" fill="#1f618d">237 ÷ 8 = 29.625</text>'
    b+='<text x="380" y="236" font-size="14">Divisor a decimal: multiply both numbers by 10, 100 ...</text>'
    return b
svgfile('c7-maths-decimal-operations.svg',700,260,d())
chapter(7,'maths','another-peek-beyond-the-point','Another Peek Beyond the Point',
 ('Fractions you can write with a point','Jonali says a fraction and Pallabi gives the decimal. 250 g is a quarter of a kilogram and 0.25 kg. Decimals extend our place value system to tenths, hundredths and thousandths. In this chapter we learn to multiply and divide with them, using what we already know about fractions.'),
 [('Recap: decimals and powers of ten',[
   'A decimal like 27.53 has 2 tens, 7 ones, 5 tenths and 3 hundredths. Fractions with denominators 10, 100, 1000 and so on are easy to write as decimals.',
   'For example 254 over 1000 is 200/1000 + 50/1000 + 4/1000, which is 0.2 + 0.05 + 0.004 = 0.254.',
   'To divide a number by 10, 100 or 1000, write the number with a decimal point at the end, count the zeroes in the divisor and move the point that many places to the left, adding zeroes in front if needed.',
   'So 123 ÷ 10 = 12.3, 24 ÷ 100 = 0.24, 678 ÷ 1000 = 0.678, 12 ÷ 1000 = 0.012 and 12345 ÷ 1000 = 12.345.']),
  ('Multiplying decimals',[
   'Arshad buys 5 pens at ₹9.5 each. Adding 9.5 five times gives 47.5, so 9.5 × 5 = 47.5.',
   'A car runs 12.5 km on 1 litre. On 7.5 litres it covers 12.5 × 7.5 = 93.75 km.',
   'Ajay walks 827 m to school and 827 m back each day for 6 days. That is 827 × 2 × 6 = 9924 m, which is 9.924 km in a week.',
   'Multiplying decimals is the same as multiplying their fractions. 0.5 × 0.3 is 5/10 × 3/10 = 15/100 = 0.15. The numerators multiply and the denominators multiply, and a denominator that is 1 followed by zeroes stays of that form.',
   'The rule: remove the decimal points and multiply the two numbers as whole numbers. Then place the point so that the product has as many digits after it as the two factors together.',
   'For 5.8 × 1.24: 58 × 124 = 7192. 5.8 has 1 digit after the point and 1.24 has 2, so the product has 3, giving 7.192.',
   'If 596 × 248 = 147808, then 5.96 × 24.8 = 147.808, since 2 + 1 = 3 digits come after the point.']),
  ('Is the product always bigger?',[
   'With counting numbers the product is at least as big as both numbers. With decimals this is not always so.',
   'When both numbers are greater than 1, the product is greater than both: 3.4 × 6.5 = 22.1. When both are between 0 and 1, the product is smaller than both: 0.75 × 0.4 = 0.3.',
   'When one number is between 0 and 1 and the other is greater than 1, the product lies between them: 0.75 × 5 = 3.75, which is less than 5 and greater than 0.75.',
   'These facts help estimate answers without full calculation. Since 18 × 12 = 216, we know 1.8 × 1.2 = 2.16, and 0.18 × 0.12 = 0.0216 is less than 1.',
   'Trailing zeroes after the point do not change the value, so 56.50 is the same as 56.5, and 2.250 is 2.25. The price of 2.250 kg of oranges at ₹56.50 per kg is 56.5 × 2.25 = ₹127.125.']),
  ('Dividing a decimal by 10, 100, 1000',[
   'Anuja cuts a 3.9 m ribbon into 10 equal pieces. 3.9 is 39/10, and dividing by 10 is multiplying by 1/10, so each piece is 39/100 = 0.39 m.',
   'Cut into 100 pieces, each is 0.039 m, which is 3.9 cm or 39 mm.',
   'In general, when a decimal is divided by 1, 10, 100, 1000 and so on, the decimal point moves to the left by as many places as there are zeroes in the divisor.']),
  ('Dividing by a whole number using place value',[
   'Neenu shares 29 m of ribbon with Anu. 29 ÷ 2 is 14 m with 1 m left, and half a metre is 0.5 m, so each gets 14.5 m.',
   'Shared among 4 friends, each gets 29/4 m. To make the denominator 100 multiply top and bottom by 25: 725/100 = 7.25 m.',
   'This does not work for every division, so we use long division with regrouping. For 1325 ÷ 4 the hundreds, tens and ones give 331 with 1 one left. Regroup that one as 10 tenths: 2 tenths each and 2 left, which is 20 hundredths: 5 each. So 1325 ÷ 4 = 331.25.',
   'The rule is to put the decimal point in the quotient when we move from ones to tenths. For 237 ÷ 8: 2 tens, 9 ones, then 50 tenths gives 6, 20 hundredths gives 2 and 40 thousandths gives 5, so 237 ÷ 8 = 29.625.',
   'A shopkeeper packs 9.5 kg of sugar into 4 bags: 9.5 ÷ 4 = 2.375 kg each. And 0.06 ÷ 5 = 0.012: 6 hundredths is 1 hundredth each with 1 left, which regroups as 10 thousandths, 2 each.']),
  ('Dividing by a decimal; divisions that never end',[
   'Ravi rides 126 km in 2.5 hours. His speed is 126 ÷ 2.5. Multiply both numbers by 10 to get 1260 ÷ 25 = 50.4 km per hour.',
   'When the divisor is a decimal, multiply both the dividend and the divisor by 10, 100 or 1000 so that the divisor becomes a counting number. The quotient does not change.',
   'Dividing by a number smaller than 1 makes the quotient bigger than the dividend: 128 ÷ 0.4 = 1280 ÷ 4 = 320.',
   'Try 10 ÷ 3. Every step leaves a remainder of 1, and the digits go 3.333 on without end. Some divisions never finish in a finite decimal.',
   'For 1 ÷ 7 the quotient is 0.142857142857 and the remainders repeat in a cycle. The block 142857 is a cyclic number: multiplied by 2, 3, 4, 5 or 6 it returns the same digits in a rotated order. In 1927 Artin guessed there are infinitely many such numbers, and it is still unproved.'])],
 [('Find 5.8 × 1.24 and check the position of the point by estimating.',[('Remove the points: 58 × 124 = 7192.','Multiply as whole numbers.'),('5.8 has 1 digit and 1.24 has 2 digits after the point, so the product has 3.','Add the number of decimal digits.'),('5.8 × 1.24 = 7.192. Estimate: about 6 × 1.2 = 7.2.','The estimate matches.')]),
  ('A shopkeeper packs 9.5 kg of sugar equally in 4 bags. How much is in each bag?',[('Divide 9.5 by 4.','Equal sharing.'),('9 ones ÷ 4 = 2 ones, 1 left. Regroup with the point: 15 tenths ÷ 4 = 3 tenths, 3 left.','Place the point in the quotient before the tenths.'),('30 hundredths ÷ 4 = 7 hundredths, 2 left; 20 thousandths ÷ 4 = 5. So 2.375 kg.','Keep regrouping until nothing remains.')]),
  ('Ravi travels 126 km in 2.5 hours. Find his average speed.',[('Speed = distance ÷ time = 126 ÷ 2.5.','Use the speed formula.'),('Multiply both by 10: 1260 ÷ 25.','The divisor becomes a counting number.'),('1260 ÷ 25 = 50.4 km per hour.','Do long division.')]),
  ('Meenu buys 4 notebooks at ₹15.50 and 3 erasers at ₹2.75. How much does she spend?',[('Notebooks: 4 × 15.50 = 62.00.','Multiply the price by the number.'),('Erasers: 3 × 2.75 = 8.25.','Multiply again.'),('Total = 62 + 8.25 = ₹70.25.','Add the two costs.')])],
 ('Explain to a friend how to multiply 5.8 by 1.24 and how to divide 126 by 2.5, and when the product of two decimals is smaller than both numbers.',['Multiply as whole numbers and place the point using the total digits after the points.','Make the divisor a whole number by multiplying both numbers by 10 or 100, then use long division.','If both numbers lie between 0 and 1, the product is smaller than both.'],['Putting the decimal point in the wrong place.','Thinking a product is always larger than the factors.','Forgetting to multiply the dividend by the same number as the divisor.']),
 ['To multiply decimals, multiply them as whole numbers and put as many digits after the point as the factors have together.','Dividing by 10, 100, 1000 moves the decimal point to the left by 1, 2, 3 places.','In long division regroup ones into tenths, tenths into hundredths, and place the point in the quotient.','To divide by a decimal, multiply both numbers by 10, 100 or 1000 so the divisor is a counting number.','The product of two numbers between 0 and 1 is smaller than both; dividing by a number below 1 gives a larger quotient.','Some divisions never end, for example 10 ÷ 3 and 1 ÷ 7, where the digits repeat in a cycle.'],
 [mcq('1',1,'123 ÷ 10 =','12.3',[('1.23','That moves the point two places; dividing by 10 moves it one place.'),('1230','That is 123 × 10.')],'Move the decimal point one place left.'),
  mcq('2',1,'0.5 × 0.3 =','0.15',[('1.5','That ignores the number of decimal digits.'),('0.015','That has too many digits after the point.')],'5 × 3 = 15 and there are 2 digits after the points.'),
  tf('3',1,'The product of two numbers less than 1 is always smaller than both of them.',True,'For example 0.75 × 0.4 = 0.3 is smaller than both. Multiplying by a number below 1 shrinks the other.'),
  mcq('4',1,'Which is greater than 128?','128 ÷ 0.4',[('128 ÷ 4','That is smaller than 128.'),('128 × 0.4','That is smaller than 128.')],'Dividing by a number below 1 gives a bigger quotient, here 320.'),
  num('5',2,'Find 12.5 × 7.5.',93.75,'125 × 75 = 9375 and 2 digits after the points give 93.75.',[(937.5,'The point is one place too far to the right.'),(9.375,'The point is one place too far to the left.')]),
  num('6',2,'Find 237 ÷ 8.',29.625,'Long division gives 29 with remainder 5, then 0.625 more.',[(29.6,'Keep regrouping to the thousandths.'),(296.25,'The point is misplaced.')]),
  num('7',2,'Given 156 × 12 = 1872, find 15.6 × 1.2.',18.72,'Two digits after the points in total, so 18.72.',[(187.2,'Count both digits after the points.'),(1.872,'That has three decimal digits; there should be two.')]),
  num('8',2,'Find 126 ÷ 2.5.',50.4,'1260 ÷ 25 = 50.4.',[(5.04,'The point is one place too far to the left.'),(504,'The point is one place too far to the right.')]),
  num('9',3,'A rupee coin is 1.45 mm thick. What is the height of a stack of 36 coins in mm?',52.2,'36 × 1.45 = 52.2 mm.',[(5.22,'The point is misplaced.'),(522,'The point is misplaced.')],'mm'),
  mcq('10',3,'What happens when you divide 10 by 3 using long division?','The digits 3 repeat without end',[('It ends after two digits','Each step leaves a remainder of 1.'),('It ends at 3.5','3 × 3.5 = 10.5, not 10.')],'The remainder 1 keeps coming back, so the quotient is 3.333... without end.')],
 svgs=[('c7-maths-decimal-operations','Rules for multiplying decimals, dividing by powers of ten, and long division with regrouping','Decimal operations at a glance')],
 keep=['decimal','tenths','hundredths','quotient','dividend','divisor'])
