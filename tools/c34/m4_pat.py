from h34 import *
M=mcq;F=tf;S=short;N=num
b='<text x="360" y="26" text-anchor="middle" font-size="18" font-weight="bold">Odd and even: pairing up</text>'
for i in range(1,11):
    x=40+(i-1)*66
    dots=''
    for k in range(i):
        cx=x+14+(k%2)*24; cy=70+(k//2)*28
        paired=(k<i-(i%2))
        dots+=f'<circle cx="{cx}" cy="{cy}" r="10" fill="{"#2e86ab" if paired else "#d1495b"}"/>'
    b+=dots+f'<text x="{x+26}" y="190" text-anchor="middle" font-size="18" font-weight="bold">{i}</text><text x="{x+26}" y="212" text-anchor="middle" font-size="13">{"odd" if i%2 else "even"}</text>'
b+='<text x="360" y="250" text-anchor="middle" font-size="15" fill="#555">Blue dots are in pairs. An odd number always has one red dot left alone.</text>'
svgfile('c4m-pat-evenodd.svg',720,270,b)
chapter(4,'maths','pattern-around-us','Patterns Around Us',
 ('Count the coconuts the clever way','Gundappa has a field of tall coconut trees and plucks 5 coconuts from each tree. Do we have to count one coconut at a time? No! Smart counting uses patterns. In this chapter we count by grouping, make patterns with money, and discover a pattern that splits every number into odd or even.'),
 [('Counting in groups',['Gundappa’s land has coconut trees planted in rows. Instead of counting the trees one by one, we count the number in one row and then count the rows.','If there are 4 rows with 6 trees in each row, we count 6, 12, 18, 24 by skipping, or multiply 4 × 6 = 24.','He plucks 5 coconuts from each tree. If we know the number of trees, we skip count in fives or multiply.','Grouping makes counting faster and helps us see a pattern.','Try counting the windows of your school building in the same way, by rows and groups.']),
  ('Counting laddoos in trays',['Muniamma arranges coconut laddoos and milk pedas in trays, and all the trays have the same arrangement.','The trays are placed one above the other. We count what is in one tray and then multiply by the number of trays.','For example, if each tray has 6 laddoos and 4 pedas, then 3 trays have 3 × 6 = 18 laddoos and 3 × 4 = 12 pedas.','Different children may group in different ways, and all correct ways give the same total.']),
  ('Patterns with money',['Shirley and Shiv arrange play money in neat patterns of notes and coins of 1, 2, 5 and 10 rupees.','To count the money, we add the same coins together, count in tens first and then fives, twos and ones.','For ₹36 we can use 3 coins of ₹10, one coin of ₹5 and one coin of ₹1, which gives 30 + 5 + 1 = 36.','Arranging coins in order of value makes it easy to count quickly, and a friend can guess the amount.']),
  ('Two ways of arranging',['Shirley and Shiv arrange coins in two different ways. Shiv puts them in pairs, two by two.','Shirley’s arrangement always leaves one coin alone. So there is one extra.','When objects can be paired up with none left over, the number is called an even number. Shiv’s numbers are even.','When one object is left without a partner, the number is called an odd number. Shirley’s numbers are odd.']),
  ('Even and odd up to 20',['The even numbers up to 20 are 2, 4, 6, 8, 10, 12, 14, 16, 18 and 20.','The odd numbers up to 20 are 1, 3, 5, 7, 9, 11, 13, 15, 17 and 19.','They come one after the other, even, odd, even, odd, so the pattern goes on and on.','All the numbers in the times-2 table are even, because they are made of pairs of 2.']),
  ('Telling odd from even by the ones digit',['To tell if a big number is even or odd, we look only at the ones digit.','If the ones digit is 0, 2, 4, 6 or 8, the number is even. If it is 1, 3, 5, 7 or 9, the number is odd.','So 30, 78, 300, 46 and 154 are even, and 415, 67 and 99 are odd.','This works because the tens and hundreds are made of groups of ten, and 10 can be paired up evenly.']),
  ('Even-odd patterns and more',['Shirley finds that page numbers of a book have a pattern. Left pages have even numbers and right pages have odd numbers.','The number before and after an odd number is always even, and the number before and after an even number is always odd.','If we write ten numbers in a row, the even and odd numbers keep alternating.','Between 1 and 100, there are 50 odd numbers and 50 even numbers, so there are the same number of each.','Using the digits 1 and 6 we can make 16 and 61. 16 is even and 61 is odd. For an even number we must keep an even digit like 6 at the ones place.'])],
 [('Is 154 even or odd? Explain.',[('Look at the ones digit of 154, which is 4.','Only the ones digit matters.'),('4 is in the list 0, 2, 4, 6, 8, so 4 ones can be paired up.','The 15 tens are made of 10s, which pair up evenly.'),('So 154 is an even number.','Check: 154 = 77 pairs.')]),
  ('Make two 2-digit numbers with digits 1 and 6, no repeats. Which is even?',[('Put 1 first and 6 second to get 16. Put 6 first and 1 second to get 61.','Both digits must be used.'),('16 ends in 6, so it is even. 61 ends in 1, so it is odd.','Look at the ones digit.'),('So 16 is even and 61 is odd.','The ones digit decides.')])],
 ('Explain what even and odd numbers are and how to tell them apart.',['Even numbers can be paired with none left','Odd numbers leave one extra without a pair','The ones digit tells us if a number is even or odd','Even and odd numbers alternate'],['Odd numbers can be paired without leftover','We must look at the tens digit','The times-2 table has odd numbers']),
 ['We count quickly by grouping and skip counting.','Money can be arranged in patterns to count it quickly.','Even numbers pair up with none left over; odd numbers leave one extra.','The ones digit tells us whether a number is even or odd.','Even and odd numbers alternate on the number line.'],
 [M('1',1,'Which of these is an even number?','46',[('67','67 ends in 7, which is odd'),('99','99 ends in 9, which is odd')],'46 ends in 6.'),
  M('2',1,'An odd number always has one object left when we make ___.','pairs',[('groups of 5','Pairs decide odd or even'),('rows of 10','Pairs decide odd or even')],'It cannot be paired fully.'),
  M('3',1,'The ones digit of an even number can be ___.','0, 2, 4, 6 or 8',[('1, 3, 5, 7 or 9','Those are odd'),('any digit','Only some digits make an even number')],'Even numbers end in 0, 2, 4, 6, 8.'),
  M('4',1,'Which numbers are all in the times-2 table?','Even numbers',[('Odd numbers','2 times a number is always a pair'),('Both even and odd','Only even')],'2 × anything is paired up.'),
  M('5',2,'Which number is odd?','415',[('300','300 ends in 0, which is even'),('78','78 ends in 8, which is even')],'415 ends in 5.'),
  M('6',2,'What is the number after the odd number 17?','18',[('19','19 is odd; the next number is even'),('16','16 comes before 17')],'After odd comes even.'),
  M('7',2,'How can ₹36 be made?','3 coins of ₹10, 1 of ₹5 and 1 of ₹1',[('3 coins of ₹10 and 2 of ₹5','That makes ₹40'),('2 coins of ₹10 and 1 of ₹5','That makes ₹25')],'30 + 5 + 1 = 36.'),
  M('8',2,'There are 4 trays with 6 laddoos in each tray. How many laddoos are there?','24',[('10','That adds 4 + 6'),('64','We multiply, not write side by side')],'4 × 6 = 24.'),
  N('9',2,'How many even numbers are there between 1 and 20?',10,'2, 4, 6, 8, 10, 12, 14, 16, 18, 20.',[(9,'Count again, 20 is also an even number'),(20,'That is all the numbers, odd and even')],'numbers'),
  M('10',2,'Which pair of numbers is made from the digits 1 and 6?','16 and 61',[('11 and 66','Digits must not repeat'),('6 and 1','They should be 2-digit numbers')],'16 is even, 61 is odd.'),
  F('11',2,'The number before and after an odd number is even.',True,'Even and odd alternate.'),
  F('12',3,'We have to look at the tens digit to tell odd from even.',False,'Only the ones digit matters.')],
 svgs=[('c4m-pat-evenodd','Dots for the numbers 1 to 10 grouped in pairs, with odd numbers having one left over.','Even numbers pair up fully, odd numbers leave one extra.')],
 keep=['even','odd','pattern'])
