import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    pr={2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97}
    b='<text x="20" y="24" font-weight="bold">Sieve of Eratosthenes: the 25 primes up to 100 (green)</text>'
    for n in range(1,101):
        r,c=divmod(n-1,10); x=30+c*50; y=40+r*32
        fw=' font-weight="bold"' if n in pr else ''
        f='#c8f0c8' if n in pr else ('#dddddd' if n==1 else '#ffffff')
        b+=f'<rect x="{x}" y="{y}" width="48" height="30" fill="{f}" stroke="#999"/><text x="{x+24}" y="{y+21}" font-size="15" text-anchor="middle"{fw}>{n}</text>'
    return b
svgfile('c6-maths-sieve.svg',560,375,dia())
chapter(6,'maths','prime-time','Prime Time',
 ('The idli-vada game','Children sit in a circle and count from 1. Whoever gets a multiple of 3 says idli instead of the number, whoever gets a multiple of 5 says vada, and whoever gets a number that is both says idli-vada. Who says idli-vada first? The answer is 15. This simple game hides big ideas: common multiples, common factors, prime numbers, and the surprising fact that every number is built from primes in only one way.'),
 [('Multiples and common multiples',[
   'In the idli-vada game, idli is said at 3, 6, 9, 12 and so on, and vada at 5, 10, 15 and so on. The numbers that are multiples of both 3 and 5 are called common multiples, and the first of them is 15.',
   'From 1 to 90, idli (including idli-vada) is said 30 times, vada 18 times, and idli-vada 6 times, at 15, 30, 45, 60, 75 and 90. The tenth idli-vada comes at 150.',
   'Every common multiple of 3 and 5 is a multiple of 15. If the game is played to 900, idli-vada is said 60 times, vada 180 times and idli is said 300 times.',
   'In the Jump Jackpot game, Grumpy hides a treasure on a number, and Jumpy jumps in equal steps from 0 to reach it. He lands on the treasure only if the jump size is a factor of that number.']),
  ('Factors and common factors',[
   'A number is a factor of another if it divides it exactly. The factors of 12 are 1, 2, 3, 4, 6 and 12. Each pair of factors multiplies to give 12, such as 3 x 4.',
   'Common factors are the factors shared by two numbers. The common factors of 20 and 28 are 1, 2 and 4, and those of 35 and 50 are 1 and 5.',
   'Guna wants to arrange 12 figs in a rectangle and he can do it in several ways because 12 has several factors. Anshu has 7 figs and can only make a single row, because 7 has only the factors 1 and 7.']),
  ('Prime and composite numbers',[
   'A number with exactly two factors, 1 and itself, is called a prime number. The first primes are 2, 3, 5, 7, 11, 13, 17 and 19.',
   'A number with more than two factors is called a composite number, for example 4, 6, 8, 9, 10 and 12. The number 1 has only one factor, so it is neither prime nor composite.',
   'The number 2 is the only even prime, because every other even number is divisible by 2 and so has at least three factors. Between 21 and 30 there are 2 primes, 23 and 29, and 8 composite numbers.',
   'The Sieve of Eratosthenes finds primes. Cross out 1, circle 2 and cross out its multiples, circle the next uncrossed number 3 and cross out its multiples, and continue. The circled numbers are the primes, and there are 25 of them up to 100.']),
  ('Co-prime numbers',[
   'Two numbers are called co-prime if they have no common factor other than 1. In the treasure game with two treasures, a pair is safe from Jumpy only if the numbers are co-prime.',
   'The pair 12 and 26 is not safe, because a jump of 2 reaches both. The pair 4 and 9 is safe. Among 15 and 39, 4 and 15, 18 and 29, and 20 and 55, the safe pairs are 4 and 15, and 18 and 29.',
   'Two primes are always co-prime, and a prime and any number that it does not divide are co-prime. Two even numbers are never co-prime, as both are divisible by 2.']),
  ('Prime factorisation',[
   'Anshu wrote 56 = 14 x 4 and 63 = 21 x 3 and claimed there is no common factor, so they are co-prime. But Guna wrote 56 = 7 x 8 and 63 = 9 x 7 and found the common factor 7. A single factorisation does not list all the factors.',
   'A reliable method is prime factorisation: keep breaking composite factors until only primes are left. For 56 we get 56 = 4 x 14 = 2 x 2 x 2 x 7. Each prime in it is called a prime factor.',
   'Every number greater than 1 has a prime factorisation. A prime is its own factorisation, and 1 has none. For 36 we can start from 2 x 18, 3 x 12, 4 x 9 or 6 x 6 and always end with two 2s and two 3s.',
   'There is only one prime factorisation of a number, apart from the order of the factors. This is why 30 = 2 x 3 x 5 whichever order we multiply in.',
   'With prime factorisations, co-prime checking is easy. 56 = 2 x 2 x 2 x 7 and 63 = 3 x 3 x 7 share the prime 7, so they are not co-prime, while 80 = 2 x 2 x 2 x 2 x 5 and 63 = 3 x 3 x 7 share none, so they are co-prime.']),
  ('Divisibility tests',[
   'We can check divisibility without long division. A number is divisible by 10 if it ends in 0, by 5 if it ends in 0 or 5, and by 2 if it ends in 0, 2, 4, 6 or 8. So 8560 is divisible by 10, 5 and 2.',
   'For 4 the last digit is not enough, since 12 is a multiple of 4 but 22 is not. Instead look at the last two digits: a number is divisible by 4 if the number formed by its last two digits is. So 8536 is divisible by 4 because 36 is.',
   'For 8 look at the last three digits. 8536 is divisible by 8 because 536 = 8 x 67, and 8560 is divisible by 8 because 560 = 8 x 70.',
   'The reason is that 100 is a multiple of 4 and 1000 is a multiple of 8, so only the last few digits can affect divisibility. Tests for 3, 6, 7 and 9 come in later classes.']),
  ('Fun with primes',[
   'Leap years show divisibility at work. A year is a leap year if it is a multiple of 4, except century years, which must be multiples of 400. So 2024 is a leap year, and 2100 is not.',
   'In a prime puzzle grid you fill the cells with primes so that each row product and column product match the given numbers, which is a nice use of prime factorisation.',
   'A perfect number equals the sum of its factors other than itself. The factors of 6 are 1, 2 and 3, which add to 6, so 6 is the smallest perfect number, and 28 is the next one.'])],
 [('Write the prime factorisation of 84 and tell whether 84 and 55 are co-prime.',
   [('Break 84 = 4 x 21 = 2 x 2 x 3 x 7.','Keep splitting until only primes are left.'),
    ('Break 55 = 5 x 11.','55 splits into two primes.'),
    ('84 has primes 2, 3, 7 and 55 has primes 5, 11, so there is no common prime and the numbers are co-prime.','Numbers with no common prime factor are co-prime.')]),
  ('Is 56 co-prime to 63? Check by prime factorisation, and explain why 56 = 14 x 4 and 63 = 21 x 3 is not a good check.',
   [('56 = 2 x 2 x 2 x 7 and 63 = 3 x 3 x 7.','Factorise fully into primes.'),
    ('Both have the prime 7, so 7 is a common factor and the numbers are not co-prime.','A common prime factor means they are not co-prime.'),
    ('14 x 4 and 21 x 3 only show some factors, so we cannot be sure there is no common factor.','Only a complete prime factorisation shows all the factors.')]),
  ('Is 8536 divisible by 4 and by 8? Is 8560 divisible by 4, 5 and 8?',
   [('For 4 look at the last two digits: 36 is divisible by 4, so 8536 is divisible by 4.','The last two digits decide divisibility by 4.'),
    ('For 8 look at the last three digits: 536 = 8 x 67, so 8536 is divisible by 8.','The last three digits decide divisibility by 8.'),
    ('For 8560: 60 is divisible by 4, the last digit 0 means divisible by 5, and 560 = 8 x 70 means divisible by 8.','Use the test for each number in turn.')]),
  ('Find the number whose prime factorisation has one 2, two 3s and one 11.',
   [('Write the product 2 x 3 x 3 x 11.','Use each prime as many times as given.'),
    ('2 x 3 x 3 = 18.','Multiply the small numbers first.'),
    ('18 x 11 = 198.','198 is the number.')])],
 ('Explain how to check if two numbers are co-prime and why prime factorisation helps.',
  ['Co-prime numbers have no common factor other than 1.','Write the prime factorisation of each number.','If no prime appears in both, the numbers are co-prime; otherwise they are not.','One single factorisation can miss common factors, so we need the complete prime factorisation.'],
  ['Thinking 1 is a prime number.','Thinking that two numbers are co-prime because they look different in a single factorisation.','Believing all odd numbers are prime, for example 9 and 15 are not.','Using the last digit to test divisibility by 4.']),
 ['A common multiple is a multiple of two numbers, and a common factor divides both.','A prime has exactly two factors; a composite has more than two; 1 is neither.','The Sieve of Eratosthenes lists primes; there are 25 primes up to 100.','Co-prime numbers share no factor other than 1.','Every number greater than 1 has exactly one prime factorisation, apart from the order.','Divisibility tests: 2, 5 and 10 by the last digit, 4 by the last two digits, 8 by the last three digits.'],
 [mcq('1',1,'A number with exactly two factors, 1 and itself, is called a','prime number',[('composite number','A composite number has more than two factors.'),('co-prime number','Co-prime describes a pair of numbers, not one number.')],'Examples are 2, 3, 5, 7 and 11.'),
  num('2',1,'How many prime numbers are there from 1 to 100?',25,'The sieve leaves 25 primes up to 100.',[(26,'26 counts 1, but 1 is not a prime.'),(24,'You missed one prime; list them again.')]),
  num('3',1,'What is the first common multiple of 4 and 6?',12,'Multiples of 4 are 4, 8, 12 and multiples of 6 are 6, 12, so the first common one is 12.',[(24,'24 is a common multiple but not the first one.'),(10,'10 is the sum of 4 and 6, not a common multiple.')]),
  mcq('4',2,'Which pair of numbers is co-prime?','4 and 15',[('12 and 26','Both are divisible by 2.'),('15 and 39','Both are divisible by 3.')],'4 = 2 x 2 and 15 = 3 x 5 have no common prime.'),
  num('5',2,'What number has the prime factorisation 2 x 3 x 3 x 11?',198,'2 x 3 x 3 = 18 and 18 x 11 = 198.',[(66,'66 = 2 x 3 x 11 has only one 3.'),(396,'396 has an extra factor of 2.')]),
  tf('6',2,'The number 1 is a prime number.',False,'1 has only one factor, so it is neither prime nor composite.'),
  num('7',2,'In the idli-vada game played from 1 to 90, how many times is idli-vada said?',6,'It is said at 15, 30, 45, 60, 75 and 90.',[(30,'30 is the number of times idli is said, including idli-vada.'),(18,'18 is the number of times vada is said, including idli-vada.')]),
  mcq('8',3,'Is 8536 divisible by 8?','Yes, because the last three digits 536 are divisible by 8',[('No, because the last digit 6 is not divisible by 8','Only for 2, 5 and 10 does the last digit decide.'),('No, because 36 is not divisible by 8','For 8 the last three digits matter, not two.')],'536 = 8 x 67.'),
  num('9',3,'What is the largest prime factor of 105?',7,'105 = 3 x 5 x 7, and the largest prime among them is 7.',[(35,'35 = 5 x 7 is not a prime.'),(5,'5 is a prime factor but 7 is larger.')]),
  mcq('10',3,'Every route to the prime factorisation of 36 gives','two 2s and two 3s',[('three 2s and one 3','2 x 2 x 2 x 3 = 24, not 36.'),('one 2 and three 3s','2 x 3 x 3 x 3 = 54, not 36.')],'2 x 2 x 3 x 3 = 36 whichever way we break it down.')],
 svgs=[('c6-maths-sieve','The numbers 1 to 100 with the 25 primes shaded','Sieve of Eratosthenes')],
 keep=['multiple','factor','prime number','composite number','co-prime','prime factorisation','Sieve of Eratosthenes'])
