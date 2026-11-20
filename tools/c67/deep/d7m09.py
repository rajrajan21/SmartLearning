import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">Multiplying and dividing integers: the sign rules</text>'
    b+='<line x1="30" y1="90" x2="400" y2="90" stroke="#333" stroke-width="2"/>'
    for i in range(-5,6):
        x=215+i*32; b+=f'<line x1="{x}" y1="84" x2="{x}" y2="96" stroke="#333"/><text x="{x-8 if i>=0 else x-12}" y="114" font-size="13">{i}</text>'
    b+='<circle cx="215" cy="90" r="6" fill="#1f618d"/><path d="M 215 80 Q 279 52 343 80" fill="none" stroke="#1e8449" stroke-width="2"/><text x="248" y="56" font-size="13" fill="#1e8449">+4</text>'
    b+='<path d="M 343 80 Q 311 56 279 80" fill="none" stroke="#c0392b" stroke-width="2"/><text x="296" y="64" font-size="13" fill="#c0392b">-2</text>'
    b+='<text x="30" y="140" font-size="14">Coin: first strike +4, second strike -2, so P = 4 + (-2) = 2</text>'
    b+='<text x="450" y="52" font-weight="bold" font-size="15">Sign of a product or quotient</text>'
    rows=[('positive × positive','positive'),('negative × negative','positive'),('positive × negative','negative'),('negative × positive','negative')]
    for i,(a,c) in enumerate(rows):
        b+=f'<text x="450" y="{82+i*26}" font-size="14">{a} = {c}</text>'
    b+='<text x="450" y="196" font-size="14">Division follows the same signs.</text>'
    b+='<text x="30" y="190" font-weight="bold" font-size="15">Number of negative factors</text><text x="30" y="214" font-size="14">even  -> product is positive</text><text x="30" y="238" font-size="14">odd   -> product is negative</text>'
    b+='<text x="30" y="270" font-size="14">1 × a = a    -1 × a = -a    a × b = b × a</text>'
    return b
svgfile('c7-maths-integer-signs.svg',700,290,d())
chapter(7,'maths','operations-with-integers','Operations with Integers',
 ('Rakesh\'s number puzzle','Rakesh says: I thought of two numbers; their sum is 25 and their difference is 11. Trying pairs, we find 18 and 7. If the difference is -11 instead, the numbers swap to 7 and 18. Puzzles like this use integers, so let us recall what we know and then learn to multiply and divide them.'),
 [('Recap: integers on the line and with tokens',[
   'A carrom coin starts at 0. If two strikes move it a and b units to the right, the final position is P = a + b.',
   'Let rightward movement be positive and leftward negative. Then 5 and -7 give 5 + (-7) = -2, so the coin is 2 units left of 0. The same formula P = a + b works for all directions.',
   'An integer carries two pieces of information: its magnitude, which is the distance, and its sign, which is the direction.',
   'In the token model a green token stands for +1 and a red token for -1. A green and a red token together make a zero pair.',
   'To compute 7 - 18 with tokens, add 11 zero pairs to 7 positives so that 18 positives can be removed. 11 negatives remain, so 7 - 18 = -11.',
   'Subtracting a number is the same as adding its additive inverse. The additive inverse of 18 is -18 and the additive inverse of -18 is 18, so 7 - 18 = 7 + (-18) and 4 - (-12) = 4 + 12.']),
  ('Multiplying integers with tokens',[
   'Start with an empty bag. When the multiplier is positive we place tokens into the bag that many times. When it is negative we remove tokens that many times.',
   'To get 4 × 2, place 2 positives four times: 8 positives, so 4 × 2 = 8. To get 4 × (-2), place 2 negatives four times: 8 negatives, so 4 × (-2) = -8.',
   'For (-4) × 2 we must remove 2 positives four times. The bag is empty, so first put in zero pairs, then remove the positives. 8 negatives remain, so (-4) × 2 = -8.',
   'For (-4) × (-2) we remove 2 negatives four times. Add zero pairs, take out the negatives, and 8 positives remain. So (-4) × (-2) = +8.',
   'Removing 2 positives is the same as adding 2 negatives, which is why (-4) × 2 can also be viewed as adding 2 negative tokens four times.']),
  ('Patterns in integer multiplication',[
   'Write the three times table downward: 3 × 3 = 9, 2 × 3 = 6, 1 × 3 = 3, 0 × 3 = 0. Each time the multiplier falls by 1, the product falls by 3.',
   'The pattern continues below zero: -1 × 3 = -3, -2 × 3 = -6. In the table with multiplicand -3, the products rise by 3 each time the multiplier falls by 1: 4 × (-3) = -12, 2 × (-3) = -6, 0 × (-3) = 0, and then -2 × (-3) = 6.',
   'Compare the four tables of 3, -3 for multipliers 3 and -3. The magnitude of the product does not change with the signs.',
   'The rules are: positive × positive is positive; negative × negative is positive; one positive and one negative gives negative.',
   'Also 1 × a = a for every integer a, and -1 × a = -a, the additive inverse of a. For a = -5, -1 × (-5) = 5.']),
  ('Properties of integer multiplication',[
   'Commutative: swapping the numbers does not change the product. For example -15 × (-8) = 120 = (-8) × (-15), and 14 × (-5) = -70 = (-5) × 14. The magnitude does not change and the sign rule gives the same sign either way.',
   'Associative: for three integers (a × b) × c = a × (b × c). For 5 × (-3) × 4, doing 5 × (-3) first gives -15, then -60; doing (-3) × 4 first gives -12 and then -60. Any order gives -60.',
   'Sign of many products: multiply -1 an even number of times and the result is positive; an odd number of times, negative. So a product with an even number of negative factors is positive, and with an odd number it is negative.',
   'Distributive: a × (b + c) = a × b + a × c. Check 5 × (4 + (-2)) = 5 × 2 = 10, and 5 × 4 + 5 × (-2) = 20 - 10 = 10.']),
  ('Brahmagupta and division',[
   'In 628 CE Brahmagupta wrote the first clear rules for multiplying and dividing positive and negative numbers, calling positives fortunes and negatives debts.',
   'The product or quotient of two fortunes is a fortune. Of two debts is a fortune. Of a debt and a fortune, or a fortune and a debt, is a debt.',
   'Division is the reverse of multiplication. To find (-100) ÷ 25 ask what must be multiplied with 25 to get -100. The answer is -4. For (-100) ÷ (-4) ask what multiplied with -4 gives -100: it is 25.',
   'So division has the same sign rules as multiplication: same signs give a positive quotient, different signs give a negative quotient. Division by zero is not defined.']),
  ('Using integers in real situations',[
   'A test gives 5 marks for each correct answer and takes away 2 marks for each wrong one. For 30 correct and 20 wrong answers the marks are 30 × 5 + 20 × (-2) = 150 - 40 = 110.',
   'A mine elevator moves at 3 metres per minute. Downward speed is -3. Starting at ground level and going down for 60 minutes, the position is 60 × (-3) = -180, that is 180 metres below the ground.',
   'If it starts at 15 metres above ground and descends for 45 minutes, the final position is 15 + 45 × (-3) = 15 - 135 = -120, which is 120 metres below the ground.',
   'A cooling process lowering the temperature by 5 degrees every hour from 32 degrees gives 32 + 10 × (-5) = -18 degrees after 10 hours.',
   'Whenever a quantity can go up or down, a profit or a loss, above or below, modelling with integers makes the answer come out with the right sign.'])],
 [('Find (-6) × (-3) and (-8) × 4.',[('(-6) × (-3): both are negative.','The product of two negatives is positive.'),('6 × 3 = 18, so (-6) × (-3) = 18.','Multiply the magnitudes.'),('(-8) × 4: one negative, one positive, so the product is negative: -32.','Different signs give a negative product.')]),
  ('Mala answers 30 questions correctly and 20 wrongly, with +5 for right and -2 for wrong. Find her marks.',[('Marks from correct answers = 30 × 5 = 150.','Positive marks.'),('Marks from wrong answers = 20 × (-2) = -40.','Each wrong answer takes away 2.'),('Total = 150 + (-40) = 110.','Add the two parts.')]),
  ('A lift starts 15 m above ground and goes down at 3 m per minute for 45 minutes. Where does it end?',[('Speed downward = -3 metres per minute.','Downward is negative.'),('Distance moved = 45 × (-3) = -135.','Multiply speed by time.'),('End position = 15 + (-135) = -120, which is 120 m below the ground.','Add to the starting position.')]),
  ('Find the value of (-36) ÷ 9 and (-48) ÷ (-6).',[('(-36) ÷ 9: different signs, so negative: -4.','36 ÷ 9 = 4.'),('(-48) ÷ (-6): same signs, so positive: 8.','48 ÷ 6 = 8.')])],
 ('Explain to a friend how to find the sign and value of the product or quotient of two integers, and why (-4) × (-2) = 8 using tokens.',['Multiply or divide the magnitudes, then give the sign by the rule: same signs positive, different signs negative.','Removing negative tokens from a bag after adding zero pairs leaves positive tokens.','Multiplication of integers is commutative, associative and distributive over addition.'],['Thinking the product of two negatives is negative.','Thinking -1 × a is always negative.','Dividing by zero.']),
 ['The product or quotient of two integers with the same sign is positive; with different signs it is negative.','1 × a = a and -1 × a = -a for every integer a.','Integer multiplication is commutative, associative and distributive over addition.','A product of many integers is positive if the number of negative factors is even, and negative if it is odd.','Division is the inverse of multiplication and follows the same sign rules; division by zero is undefined.','Integers help model gains and losses, above and below ground, and rising and falling temperatures.'],
 [mcq('1',1,'(-5) × (-4) =','20',[('-20','Two negatives give a positive product.'),('-9','That is -5 + (-4), not the product.')],'Same signs give a positive product.'),
  mcq('2',1,'(-7) × 3 =','-21',[('21','One factor is negative, so the product is negative.'),('-4','That is -7 + 3.')],'Different signs give a negative product.'),
  tf('3',1,'The product of a negative integer and zero is a negative integer.',False,'Anything multiplied by zero is zero.'),
  mcq('4',1,'(-48) ÷ (-6) =','8',[('-8','Same signs give a positive quotient.'),('54','That is 48 + 6.')],'48 ÷ 6 = 8 and the sign is positive.'),
  num('5',2,'Find 20 × (-3) × (-2).',120,'20 × (-3) = -60, and -60 × (-2) = 120.',[(-120,'Two negative factors give a positive result.'),(-30,'You added instead of multiplying.')]),
  mcq('6',2,'The product of five negative integers is','negative',[('positive','An odd number of negative factors gives a negative product.'),('zero','No factor is zero.')],'The sign is negative when the number of negative factors is odd.'),
  num('7',2,'An exam gives +4 for a correct answer and -2 for a wrong one. Find the score for 12 correct and 5 wrong.',38,'12 × 4 + 5 × (-2) = 48 - 10 = 38.',[(58,'You added the penalty instead of subtracting it.'),(28,'Check 12 × 4 = 48.')]),
  mcq('8',2,'Which property is shown by (-3) × 8 = 8 × (-3)?','commutative',[('associative','That needs three numbers.'),('distributive','That needs an addition inside brackets.')],'Swapping the two numbers keeps the product the same.'),
  num('9',3,'Temperature is 8 degrees and falls by 5 degrees every hour. What is it after 4 hours?',-12,'8 + 4 × (-5) = 8 - 20 = -12.',[(-20,'You forgot to add the starting temperature 8.'),(28,'The temperature falls, so the change is negative.')],'degrees'),
  mcq('10',3,'-1 × a equals','the additive inverse of a',[('a','That is 1 × a.'),('zero','That happens only when a = 0.')],'Multiplying by -1 changes the sign: -1 × a = -a.')],
 svgs=[('c7-maths-integer-signs','A number line showing a coin moving +4 then -2 and the sign rules for multiplying and dividing integers','Sign rules for integers')],
 keep=['integer','additive inverse','commutative','associative','distributive','Brahmagupta'])
