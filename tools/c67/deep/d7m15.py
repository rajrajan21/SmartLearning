import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="26" font-weight="bold">3/4 × 2/5 on a unit square: 5 rows × 4 columns = 20 equal parts</text>'
    cs=44; x0=70; y0=44
    for r in range(5):
        for c in range(4):
            top=r<2; left=c<3
            fill='#27ae60' if (top and left) else ('#f9d29b' if left else ('#aed6f1' if top else '#ffffff'))
            b+=f'<rect x="{x0+c*cs}" y="{y0+r*cs}" width="{cs}" height="{cs}" fill="{fill}" stroke="#555"/>'
    b+=f'<text x="{x0-60}" y="{y0+50}" font-size="14" fill="#1f618d">2/5 of the height</text>'
    b+=f'<text x="{x0}" y="{y0+5*cs+22}" font-size="14" fill="#b9770e">3/4 of the width (3 of 4 columns)</text>'
    b+=f'<text x="270" y="80" font-size="15" fill="#1e8449" font-weight="bold">Green cells = 6</text><text x="270" y="102">Whole = 5 × 4 = 20 cells</text>'
    b+='<text x="270" y="140" font-weight="bold">3/4 × 2/5 = (3 × 2)/(4 × 5)</text><text x="270" y="164">= 6/20 = 3/10</text>'
    b+='<text x="270" y="204" font-size="14">Area of a rectangle with fractional</text><text x="270" y="224" font-size="14">sides = product of its sides.</text>'
    return b
svgfile('c7-maths-fraction-area.svg',560,300,dia())
chapter(7,'maths','working-with-fractions','Working with Fractions',
 ('A tortoise that walks at fraction speed','Aaron walks 3 kilometres in one hour, so in 5 hours he covers 5 × 3 = 15 km. His pet tortoise is much slower: it walks only 1/4 km in an hour. How far will the tortoise go in 3 hours? And, stranger still, how far will it go in half an hour? Today we learn to multiply and divide fractions so that questions like these have clear answers, the way mathematicians in India worked them out many centuries ago.'),
 [('Multiplying a fraction by a whole number',[
   'Let us begin with the tortoise. It walks 1/4 km in 1 hour, so in 3 hours the distance is 3 × 1/4 km, which is 1/4 + 1/4 + 1/4 = 3/4 km.',
   'Multiplication works the same way even when the distance in one hour is a fraction. We simply add the same amount again and again.',
   'Now let the time be a fraction. Aaron walks 3 km in 1 hour. How far in 1/5 of an hour? We divide 3 km into 5 equal parts, which gives 3/5 km.',
   'So 1/5 × 3 = 3/5. How far in 2/5 of an hour? Twice that amount: first divide by the denominator 5, then multiply by the numerator 2, which gives 6/5 km.',
   'This is the rule to remember: to multiply a fraction by a whole number, divide the whole number by the denominator and then multiply the result by the numerator. So 2/5 × 3 = 6/5.',
   'Example: 1 hour of internet costs ₹8. What is the cost of 1 1/4 hours? Write 1 1/4 as 5/4. Then 5/4 × 8 = 5 × 2 = 10, so the cost is ₹10.']),
  ('Multiplying two fractions with a unit square',[
   'What happens when both numbers are fractions? The tortoise walks 1/4 km in an hour. How far in half an hour? That is 1/2 × 1/4.',
   'We draw a unit square to stand for one whole and shade 1/4 of it. Then we divide that shaded part into 2 equal parts. The whole is now cut into 8 equal parts, and one of them is our answer.',
   'So 1/2 × 1/4 = 1/8 km. A unit square is a picture of the whole, and dividing a part of the whole is exactly what multiplying by a fraction means.',
   'Take a faster tortoise that walks 2/5 km in an hour. How far in 3/4 of an hour? First find 1/4 of 2/5. The square has 5 rows and 4 columns, which makes 5 × 4 = 20 equal parts, and 2 of them are shaded, so 1/4 × 2/5 = 2/20.',
   'Then multiply by 3 for the three quarters: 3 × 2/20 = 6/20, which simplifies to 3/10. So 3/4 × 2/5 = 6/20 = 3/10 km.',
   'Look at the diagram. A rectangle with sides 1/2 and 1/4 has area 1/8, because 8 such rectangles fill the unit square. In general, the area of a rectangle with fractional sides equals the product of its sides.']),
  ('Brahmagupta’s rule: numerators and denominators',[
   'When two unit fractions are multiplied, such as 1/18 × 1/12, the whole is divided into 18 rows and 12 columns, so the product is 1/(18 × 12) = 1/216.',
   'For any fractions, we multiply numerators together and denominators together: a/b × c/d = (a × c)/(b × d). For example, 5/12 × 7/18 = 35/216.',
   'This formula was stated in general form by Brahmagupta in his Brahmasphutasiddhanta in 628 CE. In his own words, the product of fractions is the product of the numerators divided by the product of the denominators.',
   'The rule also works for whole numbers. Write the whole number with denominator 1, so 3/4 × 3 = 3/4 × 3/1 = 9/4.',
   'The order does not matter: a/b × c/d = c/d × a/b. We can see it from a rectangle, whose area stays the same when its length and breadth are swapped.']),
  ('Cancelling common factors before multiplying',[
   'Multiplying big numbers and simplifying afterwards is slow. Take 12/7 × 5/24. Instead of computing 60/168, notice that 12 is a factor of both the numerator 12 and the denominator 24.',
   'We divide both by 12 and get 1/7 × 5/2 = 5/14. This step is called cancelling common factors, and it gives the answer in lowest terms directly.',
   'Another case: 14/15 × 25/42. Cancel 14 with 42 (leaving 1 and 3) and 25 with 15 (leaving 5 and 3). We get 1/3 × 5/3 = 5/9.',
   'Reducing a fraction to lowest terms was called apavartana in India. It was so well known that the Jaina scholar Umasvati used it as a simile around 150 CE.']),
  ('Is the product always bigger?',[
   'When we multiply two counting numbers bigger than 1, such as 3 × 5 = 15, the product is greater than both numbers. With fractions this is not always true.',
   'Multiply 1/4 × 8 = 2. The product is greater than 1/4 but less than 8. Multiply 3/4 × 2/5 = 6/20. This is less than both 3/4 and 2/5.',
   'Here is the pattern. If both numbers are greater than 1, the product is greater than both. If both are between 0 and 1, the product is smaller than both. If one is between 0 and 1 and the other is greater than 1, the product lies between them.',
   'In short: multiplying by a number between 0 and 1 makes the other number smaller, and multiplying by a number greater than 1 makes it larger.']),
  ('Dividing fractions and the reciprocal',[
   'Division can be turned into multiplication. 12 ÷ 4 = 3 because 4 × 3 = 12. In the same way, 1/3 ÷ 2 asks: what should be multiplied by 2 to get 1/3? The answer is 1/6, since 2 × 1/6 = 1/3.',
   'Now try 1 ÷ 2/3. We need a number which, when multiplied by 2/3, gives 1. That number is 3/2, because 2/3 × 3/2 = 1. So 1 ÷ 2/3 = 3/2.',
   'Next, 2/3 ÷ 3/5. First find what multiplies 3/5 to give 1: it is 5/3. Then multiply by the dividend 2/3 to get 2/3 × 5/3 = 10/9.',
   'The number 5/3 is called the reciprocal of 3/5, obtained by swapping numerator and denominator. A fraction multiplied by its reciprocal always gives 1.',
   'So to divide by a fraction: find the reciprocal of the divisor and multiply it by the dividend. In symbols, a/b ÷ c/d = a/b × d/c = (a × d)/(b × c). Brahmagupta stated this rule in 628 CE and Bhaskara II’s Lilavati made it clearer in 1150 CE using the word reciprocal.',
   'When the divisor is between 0 and 1, the quotient is bigger than the dividend: 6 ÷ 1/4 = 24 and 1/8 ÷ 1/4 = 1/2. When the divisor is greater than 1, the quotient is smaller than the dividend.']),
  ('Problems from everyday life and from history',[
   'Leena used 1/4 litre of milk for 5 cups of tea. Milk in each cup is 1/4 ÷ 5. The reciprocal of 5 is 1/5, so each cup has 1/5 × 1/4 = 1/20 litre.',
   'In Baudhayana’s Shulbasutra (about 800 BCE), the problem is to cover 7 1/2 square units with square bricks of side 1/5 unit. One brick has area 1/5 × 1/5 = 1/25. The number of bricks is 15/2 ÷ 1/25 = 15/2 × 25 = 375/2.',
   'Chaturveda Prithudakasvami (about 860 CE) asked about four fountains that fill a cistern in 1 day, 1/2 day, 1/4 day and 1/5 day. In one day they fill it 1 + 2 + 4 + 5 = 12 times, so together they need 1/12 of a day.',
   'Bhaskara II’s Lilavati has the miser who gave a beggar 1/2 of 2/3 of 3/4 of 1/5 of 1/16 of 1/4 of a dramma. The product is 6/7680, which is 1/1280, and since 1 dramma is 1280 cowrie shells, the beggar got just one cowrie. The poet is joking about the miser.',
   'Fractions as we use them today, with all four operations, developed largely in India, passed to the Arab world through scholars like al-Hassar of Morocco, and reached Europe only around the 17th century.'])],
 [('Multiply 4/5 × 3 and write the result as a mixed fraction.',[('Divide the whole number by the denominator: 3 ÷ 5 = 3/5, then multiply by the numerator 4.','That is the rule for fraction × whole number.'),('4 × 3/5 = 12/5.','The numerator becomes 4 × 3 = 12 and the denominator stays 5.'),('12/5 = 2 2/5.','12 ÷ 5 is 2 with remainder 2.')]),
  ('A tap fills 7/10 of a tank in 1 hour. How much of the tank is filled in 3/4 of an hour? For how long should it run to fill the tank?',[('Multiply: 3/4 × 7/10 = (3 × 7)/(4 × 10) = 21/40.','Numerators times numerators, denominators times denominators.'),('For a full tank we need a time t with t × 7/10 = 1, so t = 1 ÷ 7/10.','Turn the question into a division.'),('1 ÷ 7/10 = 1 × 10/7 = 10/7 = 1 3/7 hours.','Multiply by the reciprocal of 7/10.')]),
  ('Divide 2/3 by 3/5 and check the answer.',[('The reciprocal of 3/5 is 5/3.','Swap numerator and denominator of the divisor.'),('2/3 × 5/3 = 10/9.','Multiply the dividend by the reciprocal.'),('Check: 10/9 × 3/5 = 30/45 = 2/3.','Quotient × divisor should give the dividend.')]),
  ('Somu gives 1/6 of her land to a road. Of the rest she gives half to Krishna and a third to Bora. What part does she keep?',[('Land left after the road: 1 - 1/6 = 5/6.','Subtract from the whole.'),('Krishna gets 1/2 × 5/6 = 5/12 and Bora gets 1/3 × 5/6 = 5/18.','Half of 5/6 and a third of 5/6 are measured against the original land, because 5/6 is already a part of it.'),('Somu keeps 5/6 - 5/12 - 5/18 = 30/36 - 15/36 - 10/36 = 5/36.','Use the common denominator 36.')])],
 ('Explain to a friend how to multiply and how to divide two fractions, and why the product of 3/4 and 2/5 is smaller than both.',['Multiply numerators together and denominators together, cancelling common factors first.','To divide, multiply by the reciprocal of the divisor.','A fraction between 0 and 1 takes only a part of the other number, so the product becomes smaller than both.'],['Thinking that multiplication always makes a number bigger.','Taking the reciprocal of the dividend instead of the divisor.','Adding denominators when multiplying fractions.']),
 ['To multiply a fraction by a whole number, divide the whole number by the denominator and multiply by the numerator.','a/b × c/d = (a × c)/(b × d), as stated by Brahmagupta in 628 CE; cancel common factors first.','The area of a rectangle with fractional sides is the product of its sides, and the order of multiplication does not matter.','The reciprocal of a/b is b/a, and a fraction times its reciprocal is 1.','To divide by a fraction, multiply by its reciprocal: a/b ÷ c/d = a/b × d/c.','Multiplying by a number between 0 and 1 gives a smaller result; dividing by such a number gives a larger one.'],
 [mcq('1',1,'What is 2/5 × 3?','6/5',[('6/15','The whole number is multiplied by the numerator only; the denominator does not get multiplied.'),('2/15','This divides 2/5 by 3 instead of multiplying.')],'Divide 3 by 5 to get 3/5, then multiply by 2 to get 6/5.'),
  mcq('2',1,'What is the reciprocal of 3/5?','5/3',[('3/5','That is the same number, not its reciprocal.'),('-3/5','The reciprocal swaps numerator and denominator; it does not change the sign.')],'Swap numerator and denominator.'),
  mcq('3',1,'The value of 1/2 × 1/4 is','1/8',[('1/6','Denominators are multiplied, not added: 2 × 4 = 8.'),('3/4','This is 1/2 + 1/4, an addition.')],'The unit square is cut into 2 × 4 = 8 equal parts.'),
  tf('4',1,'When two fractions less than 1 are multiplied, the product is smaller than both of them.',True,'Taking a part of a part gives something smaller, for example 3/4 × 2/5 = 3/10.'),
  num('5',2,'Multiply 12/7 × 5/24 and write the answer in lowest terms. What is its numerator?',5,'Cancelling 12 gives 1/7 × 5/2 = 5/14, so the numerator is 5.',[(60,'That is the numerator before cancelling the common factor 12.'),(1,'You cancelled but forgot to multiply by 5.')]),
  num('6',2,'A rectangle has sides 3 3/4 ft and 9 3/5 ft. Find its area in square feet.',36,'15/4 × 48/5 = 720/20 = 36 square feet.',[(13.5,'That adds the sides instead of multiplying them.'),(72,'You did not cancel the factor 20; 720/20 is 36.')],'square feet'),
  num('7',2,'A baker needs 1/6 kg of flour for a loaf. How many loaves can he make from 5 kg?',30,'5 ÷ 1/6 = 5 × 6 = 30.',[(5/6,'That is 5 × 1/6; the question asks how many 1/6 kg portions fit in 5 kg.'),(1,'You wrote the flour per loaf instead of the number of loaves.')],'loaves'),
  num('8',2,'Which is heavier: 12/15 of 500 g or 3/20 of 4 kg? Enter the heavier mass in grams.',600,'12/15 of 500 g = 400 g and 3/20 of 4000 g = 600 g, so 600 g is heavier.',[(400,'This is the smaller mass, 12/15 of 500 g.'),(4000,'You used the whole 4 kg and not 3/20 of it.')],'grams'),
  num('9',3,'Four fountains fill a cistern in 1, 1/2, 1/4 and 1/5 of a day. How many times do they fill it together in one day?',12,'1 + 2 + 4 + 5 = 12 times, so together they need 1/12 of a day.',[(4,'That counts the fountains, not how many times each fills the cistern.'),(1,'1 is the work of only the first fountain.')]),
  mcq('10',3,'Moon sets 5/6 hour later each day. If it sets at 10 pm on Monday, when does it set on Thursday?','2 1/2 hours after 10 pm',[('5/6 hours after 10 pm','Three days have passed, so 3 × 5/6 hours are needed.'),('3 hours after 10 pm','3 × 5/6 = 15/6 = 2 1/2 hours, not 3.')],'From Monday to Thursday is 3 days, and 3 × 5/6 = 15/6 = 2 1/2 hours.')],
 svgs=[('c7-maths-fraction-area','A unit square of 5 rows and 4 columns showing 3/4 × 2/5 = 6/20','Area model of fraction multiplication')],
 keep=['reciprocal','numerator','denominator','unit square','lowest terms'])
