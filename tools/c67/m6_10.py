from lib import *
def nl():
    b='<line x1="30" y1="70" x2="530" y2="70" stroke="#333" stroke-width="3"/><text x="20" y="25" font-weight="bold">Integer number line</text>'
    for i,v in enumerate(range(-5,6)):
        x=55+i*45; b+=f'<line x1="{x}" y1="60" x2="{x}" y2="80" stroke="#333"/><text x="{x-8 if v>=0 else x-12}" y="105">{v}</text>'
    b+='<circle cx="280" cy="70" r="7" fill="#c0392b"/><text x="262" y="50">0</text><text x="60" y="140" fill="#2471a3">negative integers</text><text x="360" y="140" fill="#27ae60">positive integers</text>'
    return b
svgfile('c6-maths-integer-line.svg',560,160,nl())
chapter(6,'maths','the-other-side-of-zero','The Other Side of Zero',
 ('Bela\'s building','Bela lives in a building with floors above and below the ground. In the lift she presses 3 to go up and -2 to go down to the basement. Numbers can go on both sides of zero, and that is what we explore here.'),
 [('Numbers below zero',['Numbers greater than zero are positive and numbers less than zero are negative. We write a minus sign before a negative number.','Together, positive numbers, negative numbers and zero are called integers.','Negative numbers help us describe temperatures below freezing, basements, debts and losses.']),
  ('The token model',['Think of red tokens as negative one each and yellow tokens as positive one each.','A pair of one red and one yellow token adds to zero and cancels out.','To add integers, put the tokens together and cancel pairs. 5 yellow and 3 red leave 2 yellow, so 5 plus -3 equals 2.','Subtracting means taking tokens away. If there are not enough tokens, add zero pairs first.']),
  ('Integers on the number line',['On a number line, positive integers lie to the right of zero and negative integers to the left.','A number to the right is always greater, so 2 is greater than -5.','To add a positive number, move right. To add a negative number, move left.','The distance of a number from zero is the same for 4 and -4.']),
  ('Explorations',['Adding opposites, such as 6 and -6, always gives zero.','Subtracting a number is the same as adding its opposite. 5 minus 3 equals 5 plus -3.','Where do integers appear? In temperature, elevation above and below sea level, and bank balances.']),
  ('A pinch of history',['Indian mathematician Brahmagupta wrote rules for working with negative numbers and zero more than 1,400 years ago.'])],
 [('Find 7 plus -4 with tokens.',[('7 yellow tokens and 4 red tokens.','Show both.'),('Cancel 4 pairs; 3 yellow remain, so the answer is 3.','Cancel to zero.')]),
  ('Which is greater, -3 or -8?',[('Place both on a number line.','-3 is closer to zero.'),('-3 is to the right, so -3 is greater.','Numbers further right are greater.')])],
 ('Explain to a friend why -2 is greater than -7.',['Show both on a number line.','The number further right is greater.'],['Thinking -7 is greater because 7 is greater.','Forgetting to cancel opposite tokens.']),
 ['Integers are positive numbers, negative numbers and zero.','Opposite tokens cancel to zero.','On the number line, right is greater.','Adding a negative number moves left.'],
 [mcq('z10-1',1,'Which is the smallest?','-9',[('-2','-2 is to the right of -9.'),('0','Zero is larger than any negative number.')],'It lies furthest left.'),
  num('z10-2',1,'5 + (-5) = ?',0,'Opposites cancel to zero.',[(10,'That is 5 plus 5.')]),
  tf('z10-3',1,'Zero is a negative number.',False,'Zero is neither positive nor negative.'),
  mcq('z10-4',1,'The temperature falls from 3 degrees to -2 degrees. It fell by','5 degrees',[('1 degree','3 to 0 is 3 and then 2 more.'),('2 degrees','That is only the negative part.')],'3 minus -2 equals 5.'),
  num('z10-5',2,'7 + (-4) = ?',3,'7 yellow minus 4 red leaves 3 yellow.',[(11,'That is 7 plus 4.')]),
  mcq('z10-6',2,'Which is greater?','-1',[('-5','-5 is further left.'),('-10','-10 is further left.')],'-1 is closest to zero.'),
  num('z10-7',2,'-3 + 8 = ?',5,'Start at -3 and move 8 right.',[(-11,'Adding a positive moves right.')]),
  mcq('z10-8',2,'Subtracting 3 is the same as adding','-3',[('3','That would increase the number.'),('0','That changes nothing.')],'Subtraction is adding the opposite.'),
  num('z10-9',3,'A lift goes from 2nd floor to basement -1. How many floors does it go down?',3,'From 2 to 0 is 2 and 0 to -1 is 1: total 3.',[(1,'You forgot the floors above ground.')]),
  mcq('z10-10',3,'The opposite of -6 is','6',[('-6','That is the number itself.'),('0','Zero is its own opposite only.')],'Opposites are the same distance on either side.')],
 svgs=[('c6-maths-integer-line','Number line from -5 to 5','Integers on the number line')],keep=['integer','negative','positive'])
