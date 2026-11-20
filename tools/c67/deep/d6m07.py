import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="24" font-weight="bold">Fractions on a strip and on the number line</text>'
    for i in range(4):
        f='#f9e79f' if i<3 else '#fdfefe'
        b+=f'<rect x="{40+i*100}" y="50" width="100" height="40" fill="{f}" stroke="#7d6608" stroke-width="2"/>'
    b+='<text x="120" y="76" font-size="14">3 x 1/4 = 3/4 of the strip</text>'
    b+='<line x1="40" y1="170" x2="440" y2="170" stroke="#333" stroke-width="2"/>'
    for i in range(5):
        b+=f'<line x1="{40+i*100}" y1="162" x2="{40+i*100}" y2="178"/><text x="{34+i*100}" y="196" font-size="13">{i}/4</text>'
    b+='<text x="40" y="150" font-size="14">0</text><text x="436" y="150" font-size="14">1</text>'
    b+='<rect x="480" y="50" width="140" height="40" fill="#fdfefe" stroke="#1b4f72" stroke-width="2"/><rect x="480" y="50" width="70" height="40" fill="#aed6f1" stroke="#1b4f72" stroke-width="2"/><text x="490" y="76" font-size="13">1/2 = 2/4</text>'
    b+='<text x="40" y="236" font-size="14">1/4 + 1/3 = 3/12 + 4/12 = 7/12 (same fractional unit first)</text>'
    return b
svgfile('c6-maths-fractions.svg',640,260,dia())
chapter(6,'maths','fractions','Fractions',
 ('Sharing one roti','Shabnam and Mukta share a roti. If two children share it, each gets half a roti. If four children share the same roti, each gets a quarter, which is smaller. Fractions tell us how much each share is, and in this chapter we see how to name them, mark them on a number line, compare them, and add and subtract them using a method described by Brahmagupta in the year 628.'),
 [('Fractional units and equal shares',[
   'When one whole is divided into several equal parts, each part is called a fractional unit, also called a unit fraction. Examples are 1/2, 1/3, 1/4, 1/5 and 1/100.',
   'The more parts a whole is divided into, the smaller each part is. So 1/9 is smaller than 1/5, and 1/200 is smaller than 1/100. Beni warns that thinking 9 is bigger than 5 so 1/9 is bigger is a common mistake.',
   'Three guavas weighing 1 kg together weigh about 1/3 kg each, and four equal packets from 1 kg of rice weigh 1/4 kg each. Four friends sharing 3 glasses of juice get 3/4 of a glass each.',
   'Fractions are old in India. The Rig Veda calls three quarters tri-pada, which is like teen paav in Hindi and mukkaal in Tamil.']),
  ('Fractions as parts of a whole',[
   'Equal parts must be equal in size, not necessarily equal in shape. A chikki cut into 6 equal pieces in different ways still gives pieces of 1/6 each, even though their shapes differ.',
   'We name a piece by the fractional unit it makes. If a whole chikki is broken into 4 equal parts and a bigger piece holds three of them, that piece is 3/4 of the chikki.',
   'To measure a fractional quantity, collect fractional units. Three times 1/4 is 3/4, and 4 times 1/4 is 4/4, which is one whole.',
   'In the fraction 5/6, the numerator is 5 and the denominator is 6. Reading 3/4 as three times one quarter shows both the unit and how many of them there are.']),
  ('Fractions on the number line',[
   'The distance from 0 to 1 is one unit. Dividing it into 4 equal parts marks 1/4, 2/4, 3/4 and 4/4, and the last point is 1 itself.',
   'Each fraction is a length from 0. For 3/5, divide the unit into 5 equal parts and count 3 parts from 0. A distance of 1 unit divided into 10 parts marks 1/10, 3/10 and so on.',
   'There are many fractions between 0 and 1. If we cut the parts into smaller equal parts we get even more, so there is no end to them.']),
  ('Mixed fractions and fractions greater than 1',[
   'A fraction like 7/4 has a numerator larger than its denominator. It is more than 1 because 4/4 makes a whole and 3/4 more remains, so 7/4 = 1 and 3/4. Such a number is called a mixed fraction.',
   'To change an improper fraction to a mixed number, divide the numerator by the denominator: 10/7 is 1 whole and 3/7 left, so 10/7 = 1 and 3/7. To go back, multiply the whole by the denominator and add the numerator.']),
  ('Equivalent fractions and comparing',[
   'Different fractions can name the same amount. Folding a strip, 1/2 is the same length as 2/4 and 4/8. Multiplying the numerator and denominator by the same number gives an equivalent fraction.',
   'A fraction is in lowest terms when its numerator and denominator have no common factor except 1. Divide both by their biggest common factor, so 3/6 becomes 1/2.',
   'To compare fractions with the same denominator, the one with the greater numerator is greater. For different denominators, first change them into equivalent fractions with a common denominator.']),
  ('Adding fractions',[
   'Meena ate 1/2 of a chikki and her brother ate 1/4. To add, make the fractional units alike: 1/2 = 2/4, so the two together ate 2/4 + 1/4 = 3/4, and 1/4 remains.',
   'With the same denominator, add the numerators and keep the denominator. 2/5 + 1/5 = 3/5, and 4/7 + 6/7 = 10/7 = 1 and 3/7.',
   'With different denominators, Brahmagupta method has three steps. First find equivalent fractions with a common fractional unit, such as a common multiple of the denominators. Next add the numerators and keep the denominator. Last write the answer in lowest terms.',
   'For 1/4 + 1/3 use 12: 1/4 = 3/12 and 1/3 = 4/12, so the sum is 7/12. For 2/3 + 1/5 use 15: 10/15 + 3/15 = 13/15. For 1/6 + 1/3 use 6: 1/6 + 2/6 = 3/6 = 1/2.']),
  ('Subtracting fractions',[
   'With the same fractional unit, remove parts. 6/7 - 4/7 = 2/7 because 4 of the 6 shaded parts are taken away.',
   'With different units, convert first, then subtract the numerators. 3/4 - 2/3 = 9/12 - 8/12 = 1/12.',
   'Brahmagupta method for subtraction has the same three steps: equal fractional units, subtract the numerators keeping the denominator, and simplify to lowest terms. We choose the multipliers so that both fractions get the same denominator, 12 in this case.'])],
 [('Add 2/3 and 1/5.',
   [('The denominators are 3 and 5; the common multiple is 15.','Fractional units must match before adding.'),
    ('2/3 = 10/15 and 1/5 = 3/15.','Multiply numerator and denominator by the same number.'),
    ('Sum = 10/15 + 3/15 = 13/15.','Add the numerators and keep the denominator.')]),
  ('Subtract 2/3 from 3/4.',
   [('Common denominator is 12.','4 x 3 = 12.'),
    ('3/4 = 9/12 and 2/3 = 8/12.','Both are changed to twelfths.'),
    ('9/12 - 8/12 = 1/12.','Subtract the numerators.')]),
  ('Add 1/6 and 1/3 and write the answer in lowest terms.',
   [('1/3 = 2/6.','Use 6 as the common denominator.'),
    ('1/6 + 2/6 = 3/6.','Add the numerators.'),
    ('3/6 divided by 3 on top and bottom = 1/2.','Divide by the biggest common factor 3.')]),
  ('Change 10/7 to a mixed number.',
   [('Divide 10 by 7.','The quotient is the whole number part.'),
    ('10 = 7 x 1 + 3.','The remainder is 3.'),
    ('So 10/7 = 1 and 3/7.','Whole 1 and remaining 3 sevenths.')])],
 ('Explain how to add 1/4 and 1/3 and why we first change the fractions.',
  ['Fractional units 1/4 and 1/3 are different sizes, so we cannot just count them together.','Find a common multiple of 4 and 3, which is 12.','1/4 = 3/12 and 1/3 = 4/12, so the sum is 7/12.','The method for adding any number of fractions was described by Brahmagupta.'],
  ['Adding numerators and denominators both, to get 2/7.','Thinking a bigger denominator means a bigger fraction.','Forgetting to reduce the answer to lowest terms.','Changing only the denominator and not the numerator.']),
 ['A fractional unit like 1/4 is one of several equal parts of a whole; more parts means a smaller unit.','A fraction like 3/4 means 3 times 1/4; the numerator counts the parts and the denominator names the unit.','Fractions are marked on a number line by dividing each unit into equal parts.','A fraction with numerator larger than denominator is more than 1 and can be written as a mixed fraction.','Equivalent fractions are made by multiplying or dividing numerator and denominator by the same number.','To add or subtract, first make the fractional units alike, then add or subtract the numerators and simplify.'],
 [num('1',1,'Four friends share 1 kg of rice equally. How many kg does each get? Enter the number of quarters kg as a decimal.',0.25,'Each gets 1/4 kg which is 0.25 kg.',[(4,'4 is the number of friends, not the share.'),(0.4,'0.4 is 2/5, not 1/4.')],'kg'),
  mcq('2',1,'Which fraction is greater?','1/5',[('1/9','The whole is cut into more parts in 1/9, so each part is smaller.'),('They are equal','Different fractional units have different sizes.')],'1/5 is greater than 1/9.'),
  num('3',1,'How many times 1/8 make one whole?',8,'Eight eighths make one whole.',[(1,'1 is the numerator of the unit, not how many make a whole.'),(4,'4 times 1/8 is only a half.')]),
  num('4',1,'What is the numerator of 5/6?',5,'The top number is the numerator.',[(6,'6 is the denominator.'),(1,'1 is the numerator of the fractional unit 1/6, not of 5/6.')]),
  num('5',2,'1/2 + 1/4 is how many quarters? Give the number of quarters.',3,'1/2 = 2/4, so the total is 3/4, which is 3 quarters.',[(2,'2 quarters is only the half.'),(4,'4 quarters would be a whole.')]),
  mcq('6',2,'The sum 2/5 + 1/5 is','3/5',[('3/10','The denominator stays 5 because the fractional unit is the same.'),('2/5','1/5 was not added.')],'Add the numerators, keep the denominator.'),
  mcq('7',2,'10/7 written as a mixed number is','1 and 3/7',[('1 and 10/7','The whole number is taken out of the fraction.'),('3 and 1/7','10 divided by 7 gives 1 whole, not 3.')],'10 = 7 x 1 + 3.'),
  tf('8',2,'To add 1/4 and 1/3 we can simply add numerators and denominators to get 2/7.',False,'The units are different. The answer is 7/12.'),
  mcq('9',3,'3/4 - 2/3 equals','1/12',[('1/1','Numerators and denominators cannot be subtracted separately.'),('5/12','5/12 is 3/4 - 1/3, not 3/4 - 2/3.')],'9/12 - 8/12 = 1/12.'),
  mcq('10',3,'1/6 + 1/3 in lowest terms is','1/2',[('3/6','3/6 is correct but not in lowest terms.'),('2/9','Denominators are not added.')],'1/6 + 2/6 = 3/6 = 1/2.')],
 svgs=[('c6-maths-fractions','A paper strip divided into quarters with three shaded, a number line marked in quarters, and 1/4 + 1/3 worked as twelfths','Fractional units, number line and addition')],
 keep=['fractional unit','numerator','denominator','mixed fraction','equivalent fractions','lowest terms','Brahmagupta'])
