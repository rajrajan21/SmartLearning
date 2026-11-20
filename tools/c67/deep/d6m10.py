import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="24" font-weight="bold">Bela\'s Building of Fun and the number line</text>'
    fl=[(6,'Floor +3 Book Store'),(5,'Floor +2 Art Centre'),(4,'Floor +1 Food Court'),(3,'Floor 0 Ground'),(2,'Floor -1 Toy Store'),(1,'Floor -2 Video Games')]
    for i,(k,t) in enumerate(fl):
        y=40+i*34
        col='#d5f5e3' if i<3 else ('#fcf3cf' if i==3 else '#fadbd8')
        b+=f'<rect x="20" y="{y}" width="230" height="30" fill="{col}" stroke="#555"/><text x="30" y="{y+20}" font-size="14">{t}</text>'
    b+='<text x="270" y="130" font-size="14">(+2) + (-3) = -1</text><text x="270" y="155" font-size="14">(-1) - (-2) = +1</text>'
    y=270
    b+=f'<line x1="30" y1="{y}" x2="570" y2="{y}" stroke="#1b4f72" stroke-width="3"/>'
    for n in range(-5,6):
        x=300+n*48
        b+=f'<line x1="{x}" y1="{y-7}" x2="{x}" y2="{y+7}" stroke="#1b4f72" stroke-width="2"/><text x="{x-8 if n>=0 else x-12}" y="{y+26}" font-size="13">{n}</text>'
    b+=f'<text x="40" y="{y-14}" font-size="13" fill="#c0392b">negative numbers (left)</text><text x="400" y="{y-14}" font-size="13" fill="#1e8449">positive numbers (right)</text>'
    return b
svgfile('c6-maths-the-other-side-of-zero.svg',600,320,dia())
secs=[
 ('Bela\'s Building of Fun: floors above and below zero',[
  'Bela\'s Building of Fun has lifts with two buttons marked plus and minus. Pressing plus takes you up and pressing minus takes you down.',
  'The ground floor is Floor 0. The floors above it are numbered +1 Food Court, +2 Art Centre and +3 Book Store.',
  'The floors below the ground are numbered -1 Toy Store and -2 Video Games, and so on downwards.',
  'Numbers marked with plus are positive numbers and numbers marked with minus are negative numbers. Zero is neither positive nor negative.',
  'Where have you already seen negative numbers? A basement, a bank balance, or a very cold temperature all use them.']),
 ('Adding means moving: Starting Floor plus Movement equals Target Floor',[
  'Suppose you are on the Food Court floor, which is +1, and you press +2. You go up two floors and reach +3, the Book Store.',
  'We write this as an expression: (+1) + (+2) = +3. The rule is Starting Floor + Movement = Target Floor.',
  'Now suppose Gurmit is on Floor +2 and presses -3. He goes down three floors and reaches Floor -1, the Toy Store, so (+2) + (-3) = -1.',
  'What if you press +3 and then -3? You come back to where you started, so (+3) + (-3) = 0. The numbers +3 and -3 are inverses of each other.',
  'Adding a number and its inverse always gives zero, because the second movement undoes the first.']),
 ('Comparing numbers on the floors',[
  'A floor higher up is a bigger number. So +3 is greater than +2, and +4 is greater than +3.',
  'Every negative number is smaller than zero, and zero is smaller than every positive number: negative < 0 < positive.',
  'Among negative floors, the one closer to the ground is bigger. So -3 is greater than -4, and we write -4 < -3.',
  'A common mistake is to think that -4 is bigger than -3 because 4 is bigger than 3. Look at the floors: -4 is lower in the basement, so it is smaller.']),
 ('Subtracting means finding the movement needed',[
  'Subtraction can be seen as finding the missing number to add. For 3 + ? = 5 we find the missing number by 5 - 3 = 2.',
  'In the lift, Starting Floor + Movement needed = Target Floor. If the movement is unknown, then Movement needed = Target Floor - Starting Floor.',
  'Your starting floor is the Art Centre (+2) and your target is the Sports Centre (+5). You need to go three floors up, so you press +3, and (+5) - (+2) = +3.',
  'If the target is -1 and the start is -2, you go one floor up: (-1) - (-2) = +1.',
  'If the target is -1 and the start is +3, you go four floors down: (-1) - (+3) = -4.',
  'If the target is +2 and the start is -2, you go four floors up: (+2) - (-2) = +4. Notice that the answer can be positive or negative, depending on which way you must go.']),
 ('Larger numbers: the mineshaft and the infinite lift',[
  'In a mine, a lift moves between levels above and below the ground. Levels are marked in metres, with 0 at the ground.',
  'The same rule works there. For example (+40) + (+60) = +100 and (-90) + (-55) = -145.',
  'The subtraction rule works too: (+40) - (-50) = +90 and (-90) - (+40) = -130.',
  'Positive numbers +1, +2, +3, ... go on without end, and negative numbers -1, -2, -3, ... also go on without end. Together with zero they are called integers.',
  'We can even imagine an infinite lift. To go from -200 to +2000 we press +200 to reach zero and +2000 more, so (+2000) - (-200) = +2200.',
  'Notice that (+2000) + (+200) is also +2200. Subtracting a negative number is the same as adding the corresponding positive number.']),
 ('Back to the number line',[
  'If you turn the infinite lift by 90 degrees, it becomes a number line. We complete the number ray by putting negative numbers to the left of zero.',
  'Positive numbers are to the right of zero. To the right is the forward direction and to the left is the backward direction.',
  'Smaller numbers are to the left of bigger numbers. So 2 < 5, -3 < 2 and -5 < -3.',
  'From 5 to 9 you travel 4 steps forward: 5 + 4 = 9 and 9 - 5 = 4.',
  'From 9 to 3 you travel 6 steps back: 9 + (-6) = 3 and 3 - 9 = -6.',
  'From 3 to -2 you travel 5 steps back: 3 + (-5) = -2 and -2 - 3 = -5.']),
 ('The unmarked number line',[
  'For big numbers we do not need to mark every number. An unmarked number line shows only the position of zero, and we imagine the rest.',
  'To find 85 + (-60), start at 85 and move 60 steps to the left. You land at 25.',
  'To find (-100) - (+250), think of the missing addend: 250 + ? = -100. From 250 you must go 350 to the left to reach -100, so the answer is -350.']),
 ('Turning subtraction into addition',[
  'To go from 2 to -3 we can break the journey in two parts: from 2 to 0 is -2, and from 0 to -3 is -3. Together -3 + (-2) = -5.',
  'So -3 - 2 gives the same result as -3 + (-2), and there is no subtraction in the second expression.',
  'Subtracting a number is the same as adding its inverse. For example (+7) - (+5) = (+7) + (-5) and (+8) - (-2) = (+8) + (+2).',
  'In the same way, adding a number can always be changed into subtracting its inverse.']),
 ('The token model',[
  'The lift attendant keeps positive (green) and negative (red) tokens. Pressing plus gives him a positive token and pressing minus gives him a negative token.',
  'A positive token and a negative token together make a zero pair, because their value together is zero.',
  'If he has 5 positive and 3 negative tokens, he removes 3 zero pairs and is left with 2 positive tokens, so (+5) + (-3) = +2.',
  'To add +5 and -8, remove five zero pairs and 3 negative tokens remain, so (+5) + (-8) = -3.']),
 ('Subtracting with tokens',[
  'To subtract, put down the first number as tokens and take away the second. For (+5) - (+4), take 4 positives from 5 positives and +1 is left.',
  'For (-7) - (-5), take 5 negatives out of 7 negatives, leaving -2.',
  'For (+5) - (+6) there are not enough positives to take out. We add a zero pair, which does not change the value, and now we can take out 6 positives. One negative is left, so the answer is -1.',
  'For +4 - (-6) we need 6 negatives but have none. Put in 6 zero pairs, take out the 6 negatives, and 10 positives remain, so +4 - (-6) = +10.',
  'For -3 - (+5), add 5 zero pairs, take out 5 positives, and 8 negatives remain, so the answer is -8.']),
 ('Integers in other places: money, heights and temperatures',[
  'In a bank passbook, a credit is a positive number and a debit is a negative number. Your balance is the total of all of them.',
  'Start with 100 rupees, add a credit of 60 to get 160, a debit of 30 to get 130, and a debit of 150 to get -20. The balance can become negative, and some banks charge a fee for that.',
  'Another credit of 200 then gives -20 + 200 = 180 rupees. In general it is better to keep a positive balance.',
  'On a geographical cross section, heights are measured from sea level, which is 0 metres. Heights above sea level are positive and below sea level are negative.',
  'Temperature is measured in degrees Celsius, and places like Leh in Ladakh can have temperatures below 0 degrees Celsius in winter, such as -4 degrees Celsius.'])]
ex=[
 ('Find (+5) - (+6) using tokens and using the number line.',
  [('Tokens: put down 5 positives and add one zero pair.','Now there are 6 positives and 1 negative.'),
   ('Take away 6 positives.','One negative token is left.'),
   ('Check on the number line: from 6 to 5 is one step back.','So the answer is -1.')]),
 ('Evaluate (+8) - (-2) and write it as an addition.',
  [('Subtracting a number is the same as adding its inverse.','The inverse of -2 is +2.'),
   ('Rewrite the expression.','(+8) + (+2).'),
   ('Add.','The answer is +10.')]),
 ('A bank account has 100 rupees. Credits of 60 and 200 and debits of 30 and 350 are made. Find the balance.',
  [('Add the credits.','60 + 200 = 260, so credits total +260.'),
   ('Add the debits as negatives.','-30 + (-350) = -380.'),
   ('Total with the opening balance.','100 + 260 + (-380) = -20. The balance is -20 rupees.')]),
 ('Leh was 14 degrees Celsius at 2 p.m. and fell to -4 degrees Celsius at 11 p.m. How much did the temperature change?',
  [('Movement needed = Target - Starting.','(-4) - (14).'),
   ('Go from 14 down to 0, then from 0 down to -4.','-14 and then -4, so -14 + (-4).'),
   ('Add.','-18: the temperature fell by 18 degrees Celsius.')])]
qs=[
 mcq('1',1,'On the floors of Bela\'s Building of Fun, which is the smallest number?','-2',[('0','Zero is greater than every negative number.'),('+1','Positive numbers are greater than negative ones.')],'The lowest floor has the smallest number.'),
 num('2',1,'(+2) + (-3) = ?',-1,'Start at +2 and move 3 floors down.',[(1,'That moves 1 floor the wrong way; pressing -3 goes down three floors, past zero.'),(5,'That adds the numbers without using the sign.')]),
 tf('3',1,'Zero is a positive number.',False,'Zero is neither positive nor negative.'),
 mcq('4',1,'Which is true?','-4 < -3',[('-4 > -3','-4 is lower than -3 on the number line.'),('-3 < -4','-3 is to the right of -4, so it is bigger.')],'The number further to the left is smaller.'),
 num('5',2,'(-1) - (+3) = ?',-4,'The movement from +3 to -1 is four floors down.',[(4,'Check the direction: the target is below the start.'),(-2,'That is -1 + 3 = 2 with the wrong sign; the movement is -4.')]),
 num('6',2,'(+8) - (-2) = ?',10,'Subtracting -2 is the same as adding +2.',[(6,'That would be 8 - 2.'),(-10,'The answer is positive.')]),
 mcq('7',2,'Subtracting a negative number is the same as','adding the corresponding positive number',[('subtracting the positive number','Subtracting a negative changes direction, not the same as subtracting a positive.'),('adding the negative number','That would make the result smaller, not larger.')],'(+8) - (-2) = (+8) + (+2).'),
 num('8',2,'On an unmarked number line, 85 + (-60) = ?',25,'Start at 85 and move 60 steps left.',[(145,'That adds instead of moving left.'),(-25,'The result stays positive because 85 is bigger than 60.')]),
 num('9',3,'A bank balance is 100 rupees. Credits are 60 and 200 and debits are 30 and 350. What is the balance in rupees?',-20,'100 + 60 - 30 - 350 + 200 = -20.',[(20,'That ignores that the balance went negative.'),(180,'That leaves out the 350 debit.')],'rupees'),
 mcq('10',3,'(-3) - (+5) using tokens needs how many zero pairs, and what is the result?','5 zero pairs, -8',[('3 zero pairs, -5','You need 5 positives to take away, so 5 zero pairs.'),('5 zero pairs, +2','After taking out 5 positives only negatives remain.')],'8 negatives remain.')]
chapter(6,'maths','the-other-side-of-zero','The Other Side of Zero',
 ('Have you ever ridden a lift to a basement?','Pressing a button marked minus takes you below the ground floor. Numbers can go below zero too. In this chapter we use lifts, tokens, a number line, bank passbooks and thermometers to understand negative numbers and to add and subtract them with confidence.'),
 secs,ex,
 ('Explain in your own words why (+8) - (-2) equals (+8) + (+2), using the lift or tokens.',
  ['Movement needed = Target - Starting.','Adding a number and its inverse gives zero.','Subtracting a negative equals adding the positive.','On the number line, left is smaller and right is bigger.'],
  ['Thinking -4 is bigger than -3.','Treating zero as a positive number.','Writing -2 - (-5) = -7 by ignoring the signs of the second number.','Forgetting that a balance can become negative.']),
 ['Positive and negative numbers, with zero, are called integers.','Starting + Movement = Target, so Movement = Target - Starting.','A positive number and its negative are inverses, and their sum is zero.','Subtracting a number is the same as adding its inverse.','On the number line smaller numbers are to the left of bigger numbers.','Integers are used for floors, bank credits and debits, heights above and below sea level and temperatures.'],
 qs,svgs=[('c6-maths-the-other-side-of-zero','Floors of the Building of Fun from +3 to -2 next to a number line from -5 to 5','Floors and the number line')],
 keep=['integers','zero pair','inverse','number line','negative'])
