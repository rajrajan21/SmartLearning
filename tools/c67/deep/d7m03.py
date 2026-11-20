import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def ruler():
    b='<text x="20" y="26" font-weight="bold">A unit split into 10 tenths: the screw is 2.7 cm long</text>'
    b+='<rect x="40" y="60" width="480" height="40" fill="#fef9e7" stroke="#555"/>'
    for i in range(31):
        x=40+i*16; h=22 if i%10==0 else 12
        b+=f'<line x1="{x}" y1="60" x2="{x}" y2="{60+h}" stroke="#333"/>'
    for n in range(4): b+=f'<text x="{36+n*160}" y="124" font-size="15">{n}</text>'
    b+='<rect x="40" y="150" width="432" height="16" rx="8" fill="#b9770e"/><text x="480" y="164" font-size="14">screw</text>'
    b+='<line x1="472" y1="140" x2="472" y2="100" stroke="#c0392b" stroke-width="2"/><text x="400" y="185" fill="#c0392b" font-size="16">2 units and 7 tenths = 2.7</text>'
    b+='<text x="20" y="226" font-size="15">1 unit = 10 tenths = 100 hundredths = 1000 thousandths</text>'
    b+='<text x="20" y="252" font-size="15">70.5 = 7 tens + 0 ones + 5 tenths  |  7.05 = 7 ones + 0 tenths + 5 hundredths</text>'
    return b
svgfile('c7-maths-decimal-ruler.svg',560,270,ruler())
chapter(7,'maths','a-peek-beyond-the-point','A Peek Beyond the Point',
 ('Two screws that look the same','Sonu was helping his mother fix a toy. The first screw did not fit, so she brought another from the box. Both screws looked the same, yet when Sonu measured them closely, they had slightly different lengths. A whole-number scale could not tell them apart. What smaller units do we need, and how do we write them?'),
 [('The need for smaller units',[
   'Sonu measured the screws against a ruler. Between two whole numbers the ruler is divided into 10 equal parts.',
   'To get the length 2.7 cm we go from 0 to 2 and then take seven of the ten small parts. So the screw is 2 cm and 7 tenths of a centimetre.',
   'We read it as two and seven-tenth centimetres. The 3.2 cm screw is three and two-tenth centimetres.',
   'When exact measures are needed, we split a unit into smaller equal parts. This is why smaller units were invented.']),
  ('A tenth part',[
   'One tenth is one of ten equal parts of a unit. A pencil of length 3 units and 4 tenths can be written as 34 tenths, because 10 tenths make 1 unit and three units are 30 tenths.',
   'So 41 tenths is read forty-one tenths, which is 4 units and 1 tenth.',
   'To add 2 units 7 tenths and 3 units 6 tenths, add the units: 2 + 3 = 5. Add the tenths: 7 + 6 = 13 tenths.',
   '13 tenths is 1 unit and 3 tenths, so the total is 6 units and 3 tenths. We can also add 27 tenths and 36 tenths to get 63 tenths, which is 6 units 3 tenths.',
   'In subtraction we start from the tenths. To take 7 tenths from 4 tenths is not possible, so we break one unit from 12 units into 10 tenths. Now we have 11 units and 14 tenths.',
   'Then 14 tenths minus 7 tenths is 7 tenths, and 11 units minus 6 units is 5 units. The difference is 5 units and 7 tenths.']),
  ('A hundredth part',[
   'Suppose a folded paper ends between two marks of the tenths scale. We split each tenth into 10 equal parts, giving hundredths.',
   'A unit has 10 tenths, and each tenth has 10 hundredths, so a unit has 100 hundredths.',
   'How many hundredths make one tenth? Ten. So 4 units and 4 tenths and 5 hundredths can also be said as 4 units and 45 hundredths.',
   'One and one-tenth and four-hundredths is 1 and 14 hundredths. Different readings of the same length are all correct.',
   'Adding and subtracting hundredths works just like whole numbers, one place at a time, carrying 10 hundredths to make 1 tenth.']),
  ('Decimal place value',[
   'Why do we split into 10 parts every time? Because in the Indian place value system each place is 10 times the one on its right.',
   'In 281, the 2 means hundreds, the 8 means tens and the 1 means ones. Each place is 10 times bigger than the place to its right and 10 times smaller than the place to its left.',
   'Extending this to the right, a unit divides into 10 tenths, each tenth into 10 hundredths, each hundredth into 10 thousandths. A thousand thousandths make one unit.',
   'This is called the decimal system, from the Latin decem, which is related to the Sanskrit dasha, meaning ten.',
   'To show where the whole part ends and the fraction begins, we place a decimal point.',
   'So 70.5 means 7 tens, 0 ones and 5 tenths. And 7.05 means 7 ones, 0 tenths and 5 hundredths. They are very different numbers.',
   'We read 70.5 as seventy point five. We read 7.05 as seven point zero five. And 0.274 is read zero point two seven four, never two hundred seventy-four.',
   'To write 234 hundredths as a decimal, 234 hundredths is 2 units and 34 hundredths, which is 2.34. And 105 tenths is 10 units and 5 tenths, which is 10.5.']),
  ('Units of measurement',[
   'We know that 1 cm = 10 mm, so 1 mm = 0.1 cm. A length of 5.6 cm is 5 cm and 6 mm, which is 56 mm.',
   'Also 1 m = 100 cm, so each cm is one hundredth of a metre. Therefore 15 cm = 0.15 m.',
   'Many small creatures are measured in decimals. A hummingbird egg is about 1.3 cm long, and the smallest land snail shell is about 0.7 mm across.',
   'In weight, 1 kg = 1000 g, so each gram is one thousandth of a kilogram. 254 g = 0.254 kg.',
   'Also 1 g = 1000 mg, so 1 mg = 0.001 g.',
   'In money, 100 paise make 1 rupee, so one paisa is one hundredth of a rupee. 25 paise is 0.25 rupee.']),
  ('Locating and comparing decimals',[
   'To find 1.4 on the number line, divide the space from 1 to 2 into 10 equal parts and take 4 of them. So 1.4 lies 4 tenths after 1.',
   'To compare decimals, compare from the left. First compare the whole parts. If they are the same, compare tenths, then hundredths, then thousandths.',
   'So 3.45 is greater than 3.4, because 3.45 has 4 tenths and 5 hundredths and 3.4 has 4 tenths and 0 hundredths. A longer decimal is not always bigger: 0.9 is greater than 0.45.',
   'Writing zeros at the end of a decimal does not change its value. 2.5 and 2.50 are the same length: 5 tenths is 50 hundredths.'])],
 [('Add 2.7 cm and 3.6 cm using tenths.',[('27 tenths + 36 tenths = 63 tenths.','Convert each length to tenths and add.'),('63 tenths = 6 units and 3 tenths = 6.3 cm.','10 tenths make one unit.')]),
  ('Find 12.4 minus 6.7.',[('We cannot take 7 tenths from 4 tenths, so break 1 unit into 10 tenths.','Regroup from the unit place.'),('Now it is 11 units and 14 tenths, minus 6 units and 7 tenths.','The value is unchanged.'),('14 - 7 = 7 tenths and 11 - 6 = 5 units, so the answer is 5.7.','Subtract each place separately.')]),
  ('Write 105 tenths and 234 hundredths in decimal form.',[('105 tenths = 100 tenths + 5 tenths = 10 units and 5 tenths = 10.5.','10 tenths make 1 unit.'),('234 hundredths = 200 + 34 hundredths = 2 units and 34 hundredths = 2.34.','100 hundredths make 1 unit.')]),
  ('Convert 5.6 cm to millimetres and 254 g to kilograms.',[('1 cm = 10 mm, so 5.6 cm = 5 x 10 + 6 = 56 mm.','Each tenth of a cm is 1 mm.'),('1 g = 0.001 kg, so 254 g = 0.254 kg.','Each gram is a thousandth of a kg.')])],
 ('Explain to a friend why 7.05 and 70.5 are not the same number, and why 0.274 is read zero point two seven four.',['The place of the decimal point decides each digit place value.','7.05 is 7 ones and 5 hundredths; 70.5 is 7 tens and 5 tenths.','After the point we read each digit separately.'],['Reading 0.274 as zero point two hundred seventy-four.','Thinking 0.9 is smaller than 0.45 because 45 is bigger than 9.','Thinking 4.5 and 4.05 are the same.']),
 ['A unit can be split into 10 tenths, 100 hundredths or 1000 thousandths.','Each place in the decimal system is 10 times the place to its right.','The decimal point separates the whole part from the fractional part.','Decimals are read as the whole part, then point, then each digit.','1 cm = 10 mm, 1 m = 100 cm, 1 kg = 1000 g, 1 g = 1000 mg, 1 rupee = 100 paise.','Compare decimals place by place from the left; add and subtract like whole numbers, regrouping when needed.'],
 [mcq('1',1,'How many tenths make 1 unit?','10',[('100','100 hundredths make 1 unit, not tenths.'),('1000','1000 thousandths make 1 unit.')],'A unit is divided into 10 equal tenths.'),
  mcq('2',1,'Which is read "seven point zero five"?','7.05',[('70.5','That is seventy point five.'),('0.75','That is zero point seven five.')],'7 ones, 0 tenths and 5 hundredths.'),
  num('3',1,'How many millimetres are in 5.6 cm?',56,'1 cm = 10 mm, so 5.6 cm = 56 mm.',[(5.6,'This is the length in cm.'),(560,'That would be 56 cm.')],'mm'),
  tf('4',1,'2.5 and 2.50 have the same value.',True,'5 tenths equal 50 hundredths.'),
  num('5',2,'Add 2.7 and 3.6.',6.3,'27 tenths + 36 tenths = 63 tenths = 6.3.',[(5.13,'You added tenths as if hundredths. Carry 10 tenths to a unit.'),(5.3,'7 + 6 tenths is 13 tenths, so 1 unit carries over.')]),
  num('6',2,'What is 12.4 - 6.7?',5.7,'Regroup: 11 units 14 tenths minus 6 units 7 tenths = 5 units 7 tenths.',[(6.3,'You subtracted the smaller digit from the larger.'),(6.7,'This is the number being subtracted.')]),
  mcq('7',2,'Which is the greatest?','3.45',[('3.4','3.45 has an extra 5 hundredths.'),('3.045','Its tenths digit is 0, so it is smaller.')],'3.4 equals 3.40, and 3.45 is more than 3.40.'),
  mcq('8',2,'234 hundredths written as a decimal is','2.34',[('23.4','That would be 234 tenths.'),('0.234','That would be 234 thousandths.')],'100 hundredths make 1, so 234 hundredths = 2.34.'),
  num('9',3,'Write 254 g in kilograms.',0.254,'Each gram is 0.001 kg, so 254 g = 0.254 kg.',[(2.54,'That is 2540 g.'),(25.4,'That is 25,400 g.')],'kg'),
  mcq('10',3,'Why is 0.9 greater than 0.45?','9 tenths is more than 4 tenths',[('Because 9 is greater than 45','The number of digits does not decide; compare tenths first.'),('Because it has fewer digits','Fewer digits is not a rule for being bigger.')],'Compare from the left: 9 tenths is greater than 4 tenths.')],
 svgs=[('c7-maths-decimal-ruler','A ruler with tenths showing a length of 2.7 cm and the decimal place values','Tenths on a ruler and place value')],
 keep=['decimal','tenth','hundredth','thousandth','decimal point'])
