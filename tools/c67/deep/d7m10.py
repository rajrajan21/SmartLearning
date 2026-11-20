import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">HCF and LCM from prime factors</text>'
    b+='<text x="20" y="58" font-size="15">84 = 2 × 2 × 3 × 7</text><text x="20" y="84" font-size="15">108 = 2 × 2 × 3 × 3 × 3</text>'
    b+='<rect x="18" y="42" width="150" height="50" fill="none" stroke="#1f618d" stroke-dasharray="4 3"/>'
    b+='<text x="20" y="118" font-size="15" fill="#1f618d">HCF: common primes, fewest times  =  2 × 2 × 3 = 12</text>'
    b+='<text x="20" y="146" font-size="15" fill="#c0392b">LCM: every prime, most times = 2 × 2 × 3 × 3 × 3 × 7 = 756</text>'
    b+='<text x="20" y="190" font-weight="bold" font-size="15">HCF × LCM = product of the two numbers</text>'
    b+='<text x="20" y="216" font-size="14">12 × 756 = 9072 = 84 × 108</text>'
    b+='<rect x="400" y="40" width="64" height="64" fill="#d6eaf8" stroke="#1f618d"/><text x="420" y="78" font-size="15">4 ft</text>'
    b+='<text x="400" y="128" font-size="14">Room 12 ft × 16 ft</text><text x="400" y="150" font-size="14">largest square tile = HCF(12,16) = 4 ft</text><text x="400" y="172" font-size="14">tiles needed = 3 × 4 = 12</text>'
    b+='<text x="400" y="206" font-size="14">Toran: strips 6 cm and 8 cm</text><text x="400" y="228" font-size="14">shortest equal length = LCM(6,8) = 24 cm</text>'
    return b
svgfile('c7-maths-hcf-lcm.svg',700,250,d())
chapter(7,'maths','finding-common-ground','Finding Common Ground',
 ('Tiling a room without breaking a tile','Sameeksha\'s main room is 12 ft by 16 ft. She wants square tiles of one size, a whole number of feet on each side, and as few tiles as possible. What size tile should she choose? The answer lies in finding common ground between 12 and 16.'),
 [('Common factors and the HCF',[
   'For square tiles to fit the 12 ft breadth exactly, the side must be a factor of 12. To fit the 16 ft length exactly, it must be a factor of 16. So the side is a common factor of both.',
   'The factors of 12 are 1, 2, 3, 4, 6, 12 and the factors of 16 are 1, 2, 4, 8, 16. The common factors are 1, 2 and 4.',
   'The largest tile means the fewest tiles, so she picks 4 ft. She needs 3 tiles along the breadth and 4 along the length, which is 12 tiles.',
   'The highest of the common factors is called the Highest Common Factor, or HCF. It is also called the Greatest Common Divisor. Here HCF(12, 16) = 4.',
   'Lekhana packs 84 kg and 108 kg of rice into bags of equal whole-number weight. The common factors of 84 and 108 include 1, 2, 3, 4, 6 and 12, and the highest is 12. So each bag holds 12 kg, and she uses 7 + 9 = 16 bags.']),
  ('Prime factorisation makes it faster',[
   'Listing all the factors is slow and we may miss some, as with 30 and 50 or 28 and 42. Prime factorisation makes the job easier and more reliable.',
   'A prime has only 1 and itself as factors. Every number can be written as a product of primes, for example 90 = 2 × 3 × 3 × 5. Even if we start with 3 × 30 or 2 × 45, we reach the same primes, just in a different order.',
   'In the division method we divide repeatedly by a prime. For 1200 we get 2, 2, 2, 2, 3, 5, 5, so 1200 = 2 × 2 × 2 × 2 × 3 × 5 × 5. It is quicker than breaking it as 40 × 30.',
   'Any subpart of a prime factorisation is a factor. For 840 = 2 × 2 × 2 × 3 × 5 × 7, the number 2 × 2 × 7 = 28 is a factor, and it times 2 × 3 × 5 = 30 gives 840.',
   'To list all the factors of 225 = 3 × 3 × 5 × 5, form every subpart: 3, 5, 9, 15, 25, 45, 75, 225 and also 1. So there are 9 factors.',
   'Anshu claims that a larger number always has a longer prime factorisation. A single counterexample disproves a claim, and one exists: 16 = 2 × 2 × 2 × 2 has four primes, but the larger prime number 17 has only one.']),
  ('Finding the HCF by prime factorisation',[
   'To find the HCF of 45 = 3 × 3 × 5 and 75 = 3 × 5 × 5, take the largest subpart common to both. It is 3 × 5 = 15, so the HCF is 15.',
   'For 112 = 2 × 2 × 2 × 2 × 7 and 84 = 2 × 2 × 3 × 7, the common subpart is 2 × 2 × 7 = 28. For 96 and 275 there is no common prime, so the only common factor and the HCF is 1.',
   'The rule: pick each common prime the minimum number of times it occurs in the factorisations. For 30 and 72 we get 2 × 3 = 6. For 225 = 3 × 3 × 5 × 5 and 750 = 2 × 3 × 5 × 5 × 5, we take one 3 and two 5s, so the HCF is 3 × 5 × 5 = 75.',
   'The same method works for three or more numbers. Factorising into composites such as 72 = 6 × 12 can hide common primes, so always reduce to primes before comparing.']),
  ('Common multiples and the LCM',[
   'Anshu makes a toran from 6 cm strips and Guna from 8 cm strips. Anshu\'s lengths are 6, 12, 18, 24, 30, ... and Guna\'s are 8, 16, 24, 32, ... The torans can be equal only at a common multiple, such as 24 cm or 48 cm.',
   'The lowest common multiple, the LCM, is 24 cm. There is no largest common multiple because the multiples go on without end.',
   'Kabamai gets free gajak every 7 days (every Monday) and visits every 10 days. The first day she can get it is the LCM of 7 and 10, which is 70 days.',
   'To find the LCM from prime factors, take every prime that appears and use it the maximum number of times it occurs in either number. For 14 = 2 × 7 and 35 = 5 × 7 the LCM is 2 × 5 × 7 = 70.',
   'For 96 = 2 × 2 × 2 × 2 × 2 × 3 and 360 = 2 × 2 × 2 × 3 × 3 × 5, take five 2s, two 3s and one 5: LCM = 32 × 9 × 5 = 1440.']),
  ('Patterns and properties',[
   'The HCF of 6 and 18 is 6. When one number is a factor of the other, the HCF is the smaller number and the LCM is the larger number. In algebra the pair n and 5n always works, since 5n is a multiple of n.',
   'If both numbers are doubled, each gets an extra factor 2, so the HCF doubles. Doubling 270 and 50 gives 540 and 100, and the HCF changes from 10 to 20.',
   'There is a quick division procedure: divide both numbers by a common prime in a column and write the quotients below, stopping when no common prime remains. The product of the divisors on the left is the HCF, and the divisors times the remaining quotients give the LCM.',
   'We may divide by any common factor, not only a prime. For 630 and 770 divide by 10 and then 7: HCF = 70, and LCM = 10 × 7 × 9 × 11 = 6930.',
   'The LCM is never greater than the product of the numbers, because the product is itself a common multiple.']),
  ('A neat relation between HCF, LCM and the product',[
   'Take 105 = 3 × 5 × 7 and 95 = 5 × 19. The HCF is 5 and the LCM is 3 × 5 × 7 × 19 = 1995. Their product is 105 × 95 = 9975.',
   'Check: HCF × LCM = 5 × 1995 = 9975, the same as the product. This holds for every pair of numbers: HCF × LCM = the product of the two numbers.',
   'The reason is that the common primes taken once in the LCM and the common primes taken once in the HCF together use each prime exactly as many times as the two numbers do together.',
   'It lets us find a missing number. If the HCF of two numbers is 6, their LCM is 84 and one number is 12, the other is 6 × 84 divided by 12 = 42.'])],
 [('Find the HCF and the LCM of 84 and 108.',[('84 = 2 × 2 × 3 × 7 and 108 = 2 × 2 × 3 × 3 × 3.','Prime factorise both.'),('HCF: two 2s and one 3 give 2 × 2 × 3 = 12.','Common primes, the fewest times.'),('LCM: two 2s, three 3s and one 7 give 4 × 27 × 7 = 756.','All primes, the most times.'),('Check: 12 × 756 = 9072 = 84 × 108.','HCF × LCM equals the product.')]),
  ('Two bells ring every 12 minutes and every 15 minutes. If they ring together now, when do they ring together next?',[('They ring together at common multiples of 12 and 15.','Together means a common multiple.'),('12 = 2 × 2 × 3 and 15 = 3 × 5.','Prime factorise.'),('LCM = 2 × 2 × 3 × 5 = 60.','Use the maximum occurrence of each prime.'),('They ring together again after 60 minutes.','The next common time is the lowest common multiple.')]),
  ('Find the largest tile of whole-number side that exactly covers a 180 cm by 150 cm floor, and the number of tiles.',[('The side must be a common factor of 180 and 150.','It must fit both sides exactly.'),('180 = 2 × 2 × 3 × 3 × 5 and 150 = 2 × 3 × 5 × 5. HCF = 2 × 3 × 5 = 30.','Largest common factor.'),('Tiles along the length: 180 ÷ 30 = 6, along the breadth: 150 ÷ 30 = 5.','Divide each side by the tile side.'),('Number of tiles = 6 × 5 = 30.','Multiply the two counts.')]),
  ('The HCF of two numbers is 6, their LCM is 84 and one number is 12. Find the other.',[('HCF × LCM = product of the two numbers.','This relation always holds.'),('6 × 84 = 504.','Multiply HCF and LCM.'),('Other number = 504 ÷ 12 = 42.','Divide by the known number.')])],
 ('Explain to a friend how to find the HCF and LCM of two numbers from their prime factors, and when you would use each in real life.',['For the HCF take common primes the minimum number of times; for the LCM take all primes the maximum number of times.','Use the HCF to cut or pack things into the largest equal pieces; use the LCM to find when repeating events meet.','HCF × LCM equals the product of the two numbers.'],['Using the maximum number of times for the HCF.','Listing only some of the factors.','Forgetting that the HCF of numbers with no common prime is 1.']),
 ['The HCF of two numbers is their highest common factor; the LCM is their lowest common multiple.','Prime factorisation gives a reliable way to find both: HCF uses the common primes the fewest times, LCM uses every prime the most times.','Any subpart of a prime factorisation is a factor of the number.','If one number is a factor of the other, the HCF is the smaller number and the LCM is the larger one.','HCF × LCM = the product of the two numbers.','The HCF solves problems about equal pieces; the LCM solves problems about events that repeat together.'],
 [mcq('1',1,'The HCF of 12 and 16 is','4',[('2','2 is a common factor but not the highest.'),('48','48 is the LCM.')],'4 is the highest number dividing both.'),
  mcq('2',1,'The LCM of 6 and 8 is','24',[('48','48 is a common multiple but not the lowest.'),('2','2 is the HCF.')],'24 is the smallest number divisible by both.'),
  tf('3',1,'The LCM of two numbers can be larger than their product.',False,'The product is itself a common multiple, so the LCM is never greater than it.'),
  mcq('4',1,'The prime factorisation of 90 is','2 × 3 × 3 × 5',[('2 × 5 × 9','9 is not a prime.'),('3 × 30','30 is not a prime.')],'All the factors must be primes.'),
  num('5',2,'Find the HCF of 45 and 75.',15,'45 = 3 × 3 × 5 and 75 = 3 × 5 × 5, so the HCF is 3 × 5 = 15.',[(5,'You missed the common prime 3.'),(225,'That is not a factor of both.')]),
  num('6',2,'Find the LCM of 14 and 35.',70,'14 = 2 × 7 and 35 = 5 × 7. LCM = 2 × 5 × 7 = 70.',[(7,'That is the HCF.'),(490,'That is the product, not the lowest common multiple.')]),
  mcq('7',2,'Two numbers have no common prime factor. Their HCF is','1',[('0','The HCF cannot be zero.'),('their product','That is the LCM in this case.')],'1 divides every number.'),
  num('8',2,'The HCF of two numbers is 6 and their LCM is 84. One number is 12. Find the other.',42,'6 × 84 ÷ 12 = 42.',[(7,'That is 84 ÷ 12.'),(504,'That is HCF × LCM, the product of both numbers.')]),
  num('9',3,'Find the LCM of 96 and 360.',1440,'96 = 2^5 × 3 and 360 = 2^3 × 3^2 × 5. LCM = 32 × 9 × 5 = 1440.',[(24,'That is the HCF.'),(34560,'That is the product of the two numbers.')]),
  mcq('10',3,'Why does doubling both numbers double their HCF?','Each number gets an extra factor 2 that becomes part of the common subpart',[('Because the numbers become even','Even numbers need not double the HCF by that fact alone.'),('Because the LCM halves','The LCM also doubles.')],'The extra 2 appears in both factorisations, so it joins the highest common subpart.')],
 svgs=[('c7-maths-hcf-lcm','HCF and LCM from prime factors with the tile and toran examples','HCF and LCM at a glance')],
 keep=['HCF','LCM','prime','factor','multiple'])
