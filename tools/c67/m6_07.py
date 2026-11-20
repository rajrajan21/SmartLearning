from lib import *
def fr():
    b='<text x="20" y="22" font-weight="bold">Equivalent fractions: 1/2 = 2/4 = 4/8</text>'
    for k,(n,x) in enumerate(((2,20),(4,20),(8,20))):
        y=50+k*45
        for i in range(8//(8//n) if False else n):
            w=360//n; fill='#f1c40f' if i<n//2 else '#fff'
            b+=f'<rect x="{x+i*w}" y="{y}" width="{w}" height="32" fill="{fill}" stroke="#333"/>'
    return b
svgfile('c6-maths-equivalent-fractions.svg',400,190,fr())
chapter(6,'maths','fractions','Fractions',
 ('Sharing a roti','Four friends share one roti. Each friend gets one quarter. If two friends share a roti, each gets a half. A half is bigger than a quarter, but how do we know? This chapter helps us compare, add and name parts of a whole.'),
 [('Fractional units and equal shares',['A fraction names an equal part of a whole. The bottom number, the denominator, tells how many equal parts the whole is cut into.','The top number, the numerator, tells how many of those parts we take.','The parts must be equal. A whole cut into unequal pieces does not give halves or quarters.']),
  ('Measuring with fractional units',['We can measure lengths with fractions. If a ruler is divided into quarters, a length of 3 quarters is three of those units, written 3 over 4.','Fractions also live on the number line between whole numbers. 1 over 2 sits halfway between 0 and 1.']),
  ('Mixed fractions',['A fraction greater than 1 can be written as a mixed fraction, with a whole number and a fraction. Seven halves is 3 and a half.','To change an improper fraction to a mixed number, divide the numerator by the denominator. The quotient is the whole part and the remainder is the new numerator.']),
  ('Equivalent fractions',['Equivalent fractions name the same amount. One half equals two quarters equals four eighths.','Multiply or divide the numerator and denominator by the same number to get an equivalent fraction.','A fraction is in its simplest form when the numerator and denominator have no common factor except 1.']),
  ('Comparing fractions',['With the same denominator, the fraction with the larger numerator is larger.','With the same numerator, the fraction with the smaller denominator is larger, because its parts are bigger.','With different denominators, change them to equivalent fractions with a common denominator, then compare.']),
  ('Adding and subtracting',['To add or subtract fractions with the same denominator, add or subtract the numerators and keep the denominator.','For unlike denominators, first find equivalent fractions with the same denominator.','Three eighths plus two eighths equals five eighths.']),
  ('A pinch of history',['Fractions were used long ago in India and Egypt. In India the way we write fractions with a bar was developed in ancient texts.'])],
 [('Compare 2 over 3 and 3 over 4.',[('Common denominator of 3 and 4 is 12.','LCM.'),('2 over 3 is 8 over 12 and 3 over 4 is 9 over 12, so 3 over 4 is larger.','Compare numerators.')]),
  ('Add 1 over 2 and 1 over 3.',[('Common denominator 6.','LCM.'),('3 over 6 plus 2 over 6 equals 5 over 6.','Add numerators.')])],
 ('Explain why 3/6 is the same as 1/2.',['Divide numerator and denominator by 3.','Both name half of the whole.'],['Thinking a larger denominator makes a larger fraction.','Adding denominators when adding fractions.']),
 ['A fraction names equal parts of a whole.','Mixed fractions have a whole and a fraction part.','Equivalent fractions name the same amount.','Same denominator: compare numerators.','Unlike denominators need a common denominator to add or compare.'],
 [mcq('f7-1',1,'In 3/8, the denominator is','8',[('3','3 is the numerator.'),('11','Do not add them.')],'The denominator is the number of equal parts.'),
  mcq('f7-2',1,'Which equals 1/2?','2/4',[('1/4','A quarter is half of a half.'),('3/4','Three quarters is more than half.')],'Doubling both gives 2/4.'),
  mcq('f7-3',1,'Which is larger?','3/4',[('1/4','Same denominator, smaller numerator.'),('1/2','Half is two quarters, which is less than three.')],'3 quarters beat 2 quarters.'),
  num('f7-4',1,'3/8 + 2/8 = ?/8',5,'Add numerators: 3 plus 2.',[(6,'3 times 2 is wrong; add.')]),
  mcq('f7-5',2,'7/2 as a mixed fraction is','3 and 1/2',[('2 and 1/2','2 and a half is 5/2.'),('3 and 1/7','Remainder 1 goes over the denominator 2.')],'7 divided by 2 is 3 remainder 1.'),
  tf('f7-6',2,'1/3 is bigger than 1/2.',False,'Thirds are smaller pieces than halves.'),
  mcq('f7-7',2,'Simplest form of 6/8 is','3/4',[('2/3','6 over 8 is not two thirds.'),('6/8','It can be divided by 2.')],'Divide both by 2.'),
  num('f7-8',2,'5/6 - 1/6 = ?/6',4,'Subtract numerators: 5 minus 1.',[(6,'Do not subtract the denominators.')]),
  num('f7-9',3,'1/2 + 1/3: the sum with denominator 6 has numerator',5,'3 over 6 plus 2 over 6 is 5 over 6.',[(2,'Add 3 and 2, not 1 and 1.')]),
  mcq('f7-10',3,'Which is the largest?','5/6',[('2/3','2/3 is 4/6.'),('1/2','1/2 is 3/6.')],'Write each over 6.')],
 svgs=[('c6-maths-equivalent-fractions','Bars showing 1/2, 2/4 and 4/8 shaded equally','Equivalent fractions name the same amount')],keep=['fraction','numerator','denominator','mixed'])
