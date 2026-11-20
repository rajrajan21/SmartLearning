import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def sysdiag():
    b='<text x="20" y="28" font-weight="bold">The same number in two naming systems: 9876501234</text>'
    b+='<text x="20" y="62" font-weight="bold" fill="#c0392b">Indian system (3-2-2-2 from the right)</text>'
    ind=[('9','arab',60),('87','crore',130),('65','lakh',215),('01','thousand',300),('234','ones',395)]
    for t,n,x in ind:
        b+=f'<rect x="{x-25}" y="72" width="80" height="34" rx="5" fill="#fdebd0" stroke="#c0392b"/><text x="{x}" y="95" font-size="18">{t}</text><text x="{x-18}" y="124" font-size="13">{n}</text>'
    b+='<text x="20" y="165" font-weight="bold" fill="#1f618d">International system (3-3-3 from the right)</text>'
    intl=[('9','billion',60),('876','million',150),('501','thousand',270),('234','ones',385)]
    for t,n,x in intl:
        b+=f'<rect x="{x-25}" y="175" width="90" height="34" rx="5" fill="#d6eaf8" stroke="#1f618d"/><text x="{x}" y="198" font-size="18">{t}</text><text x="{x-18}" y="227" font-size="13">{n}</text>'
    b+='<text x="20" y="262" font-size="14">1 lakh = 1,00,000 | 1 crore = 1,00,00,000 = 10 million | 1 arab = 100 crore = 1 billion</text>'
    return b
svgfile('c7-maths-indian-vs-international.svg',540,280,sysdiag())
chapter(7,'maths','large-numbers-around-us','Large Numbers Around Us',
 ('A lakh varieties of rice','Eshwarappa, a farmer from Chintamani in Karnataka, overheard two people at the seed market. Our country once had about a lakh varieties of rice, they said. His son Estu wondered: if I tasted a new variety every day, could I taste them all in my whole life? In this chapter we learn how big a lakh really is, and then travel on to crores and arabs.'),
 [('How big is one lakh?',[
   'Let us begin with a pattern. The largest 3-digit number is 999, and when we add 1 we reach 1,000, the smallest 4-digit number.',
   'The largest 4-digit number is 9,999, and one more gives 10,000, the smallest 5-digit number.',
   'The largest 5-digit number is 99,999, and one more gives 1,00,000, the smallest 6-digit number. We read it as one lakh.',
   'Estu asked: if I eat one variety of rice every day for 100 years, how many varieties will I taste? There are 365 days in a year, so 100 years have 36,500 days.',
   'So even in a whole life, one variety a day reaches only 36,500, far below a lakh. With 2 varieties a day we reach 73,000, still short.',
   'With 3 varieties a day we reach 1,09,500, which is more than one lakh. So three varieties a day for 100 years would finish all of them.',
   'Another way to feel a lakh: one lakh days is about 274 years, because a lakh divided by 365 is close to 274.']),
  ('Reading and writing large numbers',[
   'In the Indian system we place commas to read big numbers easily. The first comma comes after the hundreds place, then after every two digits.',
   'Take 12,78,830. We read it as twelve lakh seventy-eight thousand eight hundred thirty.',
   'Take 15,75,000. In words it is fifteen lakh seventy-five thousand.',
   'To write a number from its name, think of the places. Four lakh seven thousand seven hundred and four is 4,07,704, with a zero where no thousands-tens are said.',
   'Fifty lakh five thousand and fifty is 50,05,050. Notice how each missing place is filled by a zero.']),
  ('Building numbers with calculator buttons',[
   'Creative Chitti is a calculator with buttons +1, +10, +100, +1000, +10,000, +1,00,000 and +10,00,000. We can reach a number by pressing buttons many times.',
   'To get 5072 we can press +100 fifty times, +10 seven times and +1 two times, which we write as (50 x 100) + (7 x 10) + (2 x 1).',
   'Another way is (3 x 1000) + (20 x 100) + (72 x 1). Both give 5072, so there are many ways.',
   'Systematic Sippy asks a different question: what is the fewest number of presses? The best way is to press each button as many times as the digit at that place.',
   'For 5072 that is +1000 five times, +10 seven times and +1 two times, which is 5 + 0 + 7 + 2 = 14 presses.',
   'The least-press expression is exactly the place value notation: 5 thousands, 0 hundreds, 7 tens and 2 ones.',
   'What if we press +10,00,000 ten times? We get 100 lakhs, which is called one crore. One crore is 1 followed by seven zeroes: 1,00,00,000.']),
  ('Lakhs and crores versus millions and billions',[
   'Two systems are used in the world. The Indian system uses thousand, lakh, crore, arab. The International or American system uses thousand, million, billion.',
   'In the Indian system digits are grouped 3-2-2-2 from the right. In the International system they are grouped 3-3-3 from the right.',
   'One lakh is 1 followed by 5 zeroes. One crore is 1 followed by 7 zeroes. One arab is 1 followed by 9 zeroes, which equals 100 crore.',
   'One million is 1,000,000, which is ten lakh. One crore is therefore ten million. One billion is 1,000,000,000, the same as one arab.',
   'The words lakh and crore come from the Sanskrit words laksha and koti. The Indian system is also used in Nepal, Bhutan, Sri Lanka, Pakistan, Bangladesh, Maldives, Afghanistan and Myanmar.',
   'Let us read 9876501234. Placing Indian commas gives 9,87,65,01,234: 9 arab 87 crore 65 lakh 1 thousand 234.',
   'Placing International commas gives 9,876,501,234: 9 billion 876 million 501 thousand 234. The same number, two ways of reading it.']),
  ('Exact and approximate values',[
   'Very often we do not need the exact number. The 2011 census gave Chintamani a population of 76,068, but saying about 75,000 is enough to picture its size.',
   'Sometimes we round up, so the approximate number is more than the real one. A school with 732 people may order 750 sweets so nobody is left out.',
   'Sometimes we round down, so the approximate number is less than the real one. A shopkeeper may say an item costing 470 rupees is around 450 rupees.',
   'The nearest neighbours of a number are its roundings to the nearest ten, hundred, thousand, ten thousand, lakh and crore.',
   'Take 6,72,85,183. To the nearest thousand it is 6,72,85,000. To the nearest ten thousand it is 6,72,90,000. To the nearest lakh it is 6,73,00,000. To the nearest crore it is 7,00,00,000.',
   'The rule is simple: look at the digit to the right of the place you round to. If it is 5 or more, round up. Otherwise round down.',
   'Estimation also helps us check answers. If a sum of two numbers is near 8,00,000 and a little more, we can quickly say whether it is above or below 8,50,000.']),
  ('Patterns in products',[
   'To multiply by 10, 100, 1000, we only attach one, two or three zeroes. So 45 x 100 = 4500.',
   'Multiplying by 5 is the same as dividing by 2 and multiplying by 10. To find 72 x 5, half of 72 is 36, then 36 x 10 = 360.',
   'Multiplying by 25 is dividing by 4 and multiplying by 100. Multiplying by 125 is dividing by 8 and multiplying by 1000.',
   'So 72 x 125 = 72,000 divided by 8, which is 9,000. The reason is that 125 = 1000 divided by 8.',
   'How many digits does a product have? Take two 2-digit numbers. The smallest product is 10 x 10 = 100, which has 3 digits. The largest is 99 x 99 = 9,801, which has 4 digits.',
   'So the product of two 2-digit numbers always has 3 or 4 digits. In the same way, two 3-digit numbers give a product of 5 or 6 digits.',
   'We found this without trying every pair. We looked at the smallest and the largest case, and that is a powerful way to think in mathematics.']),
  ('Did you ever wonder?',[
   'Estu asked: could the entire population of Mumbai fit into 1 lakh buses? Suppose each bus holds 50 people.',
   'Then 1 lakh buses hold 1,00,000 x 50 = 50,00,000 people, which is 50 lakh. Mumbai has more than 1 crore 24 lakh people, so the answer is no.',
   'Roxie asked: if I walk 100 kilometres every day, can I reach the Moon in 10 years? The Moon is about 3,84,400 km away.',
   'In one year she covers 100 x 365 = 36,500 km. In 10 years she covers 3,65,000 km, which is less than 3,84,400 km. She is about 19,400 km short.',
   'Questions like these use big numbers to answer real curiosity. We make reasonable assumptions, calculate in stages, and then compare.',
   'Large numbers are also in nature: a blue whale can eat up to 3,500 kg of krill a day, and one gram of healthy soil can hold 100 million or more bacteria.'])],
 [('How many days are there in 100 years, and can one taste a lakh varieties at 3 varieties a day? (ignore leap years)',[('100 x 365 = 36,500 days.','A year has 365 days.'),('3 x 36,500 = 1,09,500.','Three varieties each day for all the days.'),('1,09,500 is more than 1,00,000, so yes.','Compare the total with one lakh.')]),
  ('Write 20,05,030 in words and write its International-system form.',[('Twenty lakh five thousand thirty.','Read the lakh part, then the thousand part, then the rest.'),('2,005,030, which is two million five thousand thirty.','International commas group the digits in threes: 2,005,030.')]),
  ('Find the fewest button presses (using +1, +10, +100, +1000, +10000, +1,00,000) to reach 4,06,082.',[('4 lakh needs +1,00,000 four times, that is 4 presses.','The digit 4 is in the lakh place.'),('0 ten-thousands, 6 thousands, 0 hundreds, 8 tens, 2 ones need 6 + 8 + 2 = 16 presses.','Each digit tells how many presses of that button.'),('Total 4 + 16 = 20 presses.','Add all the presses.')]),
  ('Round 3,84,400 (the Moon distance in km) to the nearest lakh and to the nearest ten thousand.',[('Nearest lakh: the digits after the lakh place are 84,400, which is more than 50,000, so round up to 4,00,000.','Compare the remaining part with half a lakh.'),('Nearest ten thousand: 4,400 is less than 5,000, so round down to 3,80,000.','Compare the digit to the right with 5.')])],
 ('Explain to a friend why 72 x 125 can be done in your head, and how many digits the product of two 3-digit numbers can have.',['125 is 1000 divided by 8, so multiply by 1000 and divide by 8.','The product of two 3-digit numbers has 5 or 6 digits, found from the smallest 100 x 100 and the largest 999 x 999.','Check the smallest and largest cases instead of trying every pair.'],['Thinking that one crore is 1 followed by 6 zeroes (that is one million).','Using commas every three digits in the Indian system.','Believing the product of two 3-digit numbers can have only 6 digits.']),
 ['1 lakh = 1,00,000 (5 zeroes); 1 crore = 100 lakh = 1,00,00,000 (7 zeroes); 1 arab = 100 crore (9 zeroes).','The Indian system groups digits 3-2-2-2; the International system groups them 3-3-3 and uses million and billion.','1 crore = 10 million and 1 arab = 1 billion.','We round up or round down to the nearest ten, hundred, thousand, lakh or crore when an exact value is not needed.','Multiplying by 5, 25 and 125 can be done by dividing by 2, 4 and 8 and then attaching zeroes.','A product of an m-digit number and an n-digit number has m + n - 1 or m + n digits.','Big-number questions are answered by assuming sensible values and calculating in stages.'],
 [mcq('1',1,'How many zeroes are in one crore?','7',[('5','One lakh has 5 zeroes; a crore is 100 times bigger.'),('6','One million has 6 zeroes, not one crore.')],'1 crore = 1,00,00,000 has seven zeroes.'),
  mcq('2',1,'The smallest 6-digit number is','1,00,000',[('99,999','That is the largest 5-digit number.'),('10,000','That is the smallest 5-digit number.')],'It is one lakh.'),
  mcq('3',1,'One crore is the same as','10 million',[('1 million','A million is ten lakh, not a hundred lakh.'),('100 million','A hundred million is ten crore.')],'1 crore = 100 lakh = 10 million.'),
  tf('4',1,'In the Indian system digits are grouped 3-2-2-2 from the right.',True,'The first group has three digits and each next group has two.'),
  num('5',2,'How many days are there in 100 years if we ignore leap years?',36500,'100 times 365 is 36,500.',[(3650,'That is 10 years.'),(365000,'That is 1000 years.')]),
  num('6',2,'A bus holds 50 people. How many people can 1 lakh buses hold? Give the answer in lakhs.',50,'1 lakh x 50 = 50 lakh.',[(5,'5 lakh would be for only 10,000 buses.')],'lakh'),
  mcq('7',2,'Round 6,72,85,183 to the nearest lakh.','6,73,00,000',[('6,72,00,000','The part after the lakh place is 85,183, which is more than half a lakh, so we round up.'),('7,00,00,000','That is rounding to the nearest crore.')],'85,183 is above 50,000, so round the lakh digit up.'),
  mcq('8',2,'Which statement about 72 x 125 is correct?','It equals 72,000 divided by 8',[('It equals 72 x 100 + 25','125 is not 100 + 25 in this sense; 72 x 125 = 9,000.'),('It equals 72 divided by 125','Division is not the same as multiplication.')],'125 = 1000 divided by 8, so 72 x 125 = 72,000 / 8 = 9,000.'),
  mcq('9',3,'The product of two 3-digit numbers can have how many digits?','5 or 6',[('Only 6','100 x 100 = 10,000 has 5 digits.'),('4 or 5','The smallest product is 10,000, which has 5 digits.')],'Between 100 x 100 = 10,000 and 999 x 999 = 998,001.'),
  num('10',3,'If Roxie walks 100 km each day for 10 years (365 days a year), how many kilometres does she cover?',365000,'100 x 365 = 36,500 km in a year; 10 years give 3,65,000 km.',[(36500,'That is only one year.'),(384400,'That is the distance to the Moon, not what she covers.')],'km')],
 svgs=[('c7-maths-indian-vs-international','The number 9876501234 grouped in the Indian system and in the International system','Indian grouping 3-2-2-2 and International grouping 3-3-3')],
 keep=['lakh','crore','arab','million','billion','estimate'])
