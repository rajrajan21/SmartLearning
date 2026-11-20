import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    names=['Jalebi','Gulab jamun','Gujiya','Barfi','Rasgulla']; vals=[6,9,13,3,7]; cols=['#e67e22','#8e44ad','#2980b9','#27ae60','#c0392b']
    b='<text x="20" y="26" font-weight="bold">Sweet preferences of students (1 unit = 1 student)</text>'
    x0,y0,H=70,270,220
    for v in range(0,15,2):
        y=y0-v*H/14
        b+=f'<line x1="{x0}" y1="{y}" x2="590" y2="{y}" stroke="#ddd"/><text x="{x0-28}" y="{y+5}" font-size="13">{v}</text>'
    b+=f'<line x1="{x0}" y1="{y0}" x2="590" y2="{y0}" stroke="#333"/><line x1="{x0}" y1="{y0-H-6}" x2="{x0}" y2="{y0}" stroke="#333"/>'
    for i,(n,v) in enumerate(zip(names,vals)):
        x=x0+25+i*100; h=v*H/14
        b+=f'<rect x="{x}" y="{y0-h}" width="60" height="{h}" fill="{cols[i]}"/><text x="{x+22}" y="{y0-h-6}" font-size="14" font-weight="bold">{v}</text><text x="{x-2}" y="{y0+20}" font-size="13">{n}</text>'
    b+='<text x="300" y="312" font-size="14">Sweets</text><text x="8" y="150" font-size="13" transform="rotate(-90 14,150)">Students</text>'
    return b
svgfile('c6-maths-sweets-bargraph.svg',620,330,dia())
chapter(6,'maths','data-handling-and-presentation','Data Handling and Presentation',
 ('Which game is the most popular?','Navya and Naresh want to know the most popular game in their class. Naresh thinks it is cricket, Navya thinks it is hockey, and nobody is sure. They cannot settle it by guessing, so they ask every classmate and write down the answers. That list is called data. In this chapter we learn how to collect data, organise it in a table, and then show it as a pictograph or a bar graph so that the answer can be seen at a glance.'),
 [('What is data and how do we collect it',[
   'Any collection of facts, numbers, measures or observations that tells us something about things is called data. A list of favourite colours is data, and so are the weights of all the students in your class.',
   'Navya and Naresh went to each classmate and noted the favourite game. This is data collection, and it is needed only when the answer is not already known. We do not need to collect data to find the capital of India, but we do need it to find the most popular TV show in a class.',
   'A raw list of names and games is hard to read. In their list Kabaddi, Hockey, Satoliya, Football, Cricket and Badminton all appear many times, so we must organise the list before we can see which game wins.']),
  ('Tally marks and frequency tables',[
   'To organise data, write each category in one column and put a tally mark for each answer. A single vertical line stands for one, and when the count reaches five, the fifth line is drawn across the previous four.',
   'Shri Nilesh asked students about sweets for a new year celebration. The tally gave 6 for jalebi, 9 for gulab jamun, 13 for gujiya, 3 for barfi and 7 for rasgulla, which makes 38 students in all.',
   'The number of times a category occurs is called its frequency. The table that lists each category with its frequency is a frequency table, and Shri Nilesh used it to buy exactly the right number of each sweet.',
   'A tally mark table tells how many students chose each sweet, but it does not tell which student chose which. If he had to hand out the sweets name by name, he would need the original list as well.']),
  ('Arranging data in order',[
   'Sandhya noted the shoe sizes of 27 students: 3, 4, 5, 6 and 7 appeared in a jumbled order. Writing them in ascending order puts the 3s first and the 7 last.',
   'In the ordered list there are 3 students of size 3, 9 of size 4, 10 of size 5, 4 of size 6 and 1 of size 7. The smallest size is 3 and the largest is 7.',
   'To find how many students wear a size larger than 4, we add the counts for 5, 6 and 7: 10 + 4 + 1 = 15. Arranging in order makes such questions easy because equal values sit together.']),
  ('Pictographs',[
   'A pictograph shows data using pictures or symbols, without writing numbers for each category. At a glance we see which category has the most symbols and which has the least.',
   'Every pictograph needs a key that says what one symbol means. Sometimes one symbol means one student, and sometimes it means 5 or 10 or even more.',
   'In Nand Kishor survey of sleeping hours, one symbol stands for 10 children. Five symbols for Always give 5 x 10 = 50 children. Two and a half symbols for Sometimes give 20 + 5 = 25 children, and four symbols for Never give 40 children.',
   'Lakhanpal showed absent students with one symbol per student, which works when numbers are small. For present students (20 to 35 in each class), Jarina used one symbol for 5 students so that the picture was not too long.',
   'Sangita chose one symbol for 10 students and used half a symbol for 5. But if a class had 33 or 27 students, a key of 5 or 10 cannot show the exact number, which is the main weakness of large pictographs.']),
  ('Bar graphs',[
   'A bar graph uses bars of equal width, equally spaced, drawn on a base line. The length or height of each bar shows the number it stands for. Bars can be horizontal or vertical.',
   'To read a bar graph, look at the scale on the side. In Lakhanpal graph of absent students, one unit of length is one student, so a bar 5 units high means 5 absent students. Class 5 has no bar because nobody was absent.',
   'The traffic police counted vehicles at a Delhi crossing every hour from 6 a.m. to 12 noon with one unit of length standing for 100 vehicles. The longest bar, for 7 to 8 a.m., shows about 1200 vehicles. The shortest bar, for 6 to 7 a.m., shows about 150.',
   'To find the total for 8 to 10 a.m., add the two bars: 1000 + 800 = 1800 vehicles. A bar graph helps us compare quickly and also ask why, for example why traffic is heaviest at school and office time.',
   'The population of India in crores for each census from 1951 to 2001 was 36, 44, 54, 68, 84 and 102. Over those 50 years it grew by 102 - 36 = 66 crores.']),
  ('Drawing a bar graph',[
   'To draw a bar graph, first draw a horizontal and a vertical line. Write the categories at equal gaps along the horizontal line and write the numbers along the vertical line.',
   'Next choose a scale, that is, how many items one unit of length stands for. For the sweets data the highest frequency is 13, so one unit for one student fits well on the paper.',
   'Then draw each bar up to its frequency: 6 for jalebi, 9 for gulab jamun, 13 for gujiya, 3 for barfi and 7 for rasgulla. Finally give the graph a title and label both axes.',
   'When numbers are big, one unit per item is tiring. Smriti scored 80, 50, 10, 100, 90, 0, 90 and 50 runs in 8 matches. Using one unit for 10 runs, the bars are 8, 5, 1, 10, 9, 0, 9 and 5 units high.',
   'Choosing the scale is a decision. Use a scale that makes all the values easy to mark and keeps the largest bar on your paper, and use the same scale for every bar.']),
  ('Making graphs clear and attractive',[
   'A good graph fits the space, has a title, labelled sides, a clear scale, and bars of the same width with equal gaps between them. These choices make the data easy and pleasant to read.',
   'The tallest mountain on each continent is a good example: Everest 8848 m, Aconcagua 6962 m, Denali 6194 m, Kilimanjaro 5895 m, Elbrus 5642 m, Vinson Massif 4892 m and Kosciuszko 2228 m. In a table of numbers it is hard to see how Everest compares with Kosciuszko, but in a graph the difference of 6620 m is obvious.',
   'Heights are measured upward from the ground, so a vertical bar graph, also called a column graph, shows them best. Lengths that run along the ground, such as the lengths of rivers, are shown better by horizontal bars.',
   'Pictographs, bar graphs and column graphs are all ways to present the same data. Choose the one that makes the question you want to answer easiest to see.'])],
 [('Make a frequency table for the shoe sizes 3, 4, 5, 4, 5, 6, 4, 5, 3, 4 and tell which size is worn by most students.',
   [('Write each size in a column and tally every answer: 3 appears 2 times, 4 appears 4 times, 5 appears 3 times and 6 appears 1 time.','A tally table counts how often each size occurs.'),
    ('Check the total: 2 + 4 + 3 + 1 = 10, the same as the number of answers.','The frequencies must add up to the number of data items.'),
    ('The size with the greatest frequency is 4, worn by 4 students.','The category with the most tally marks is the most common.')]),
  ('In a pictograph one symbol stands for 10 children. Always has 5 symbols, Sometimes has 2 and a half symbols and Never has 4 symbols. How many children are there in all?',
   [('Always: 5 x 10 = 50 children.','Multiply the symbols by the value of the key.'),
    ('Sometimes: 2 x 10 + half of 10 = 20 + 5 = 25 children.','A half symbol is half the value of a full symbol.'),
    ('Never: 4 x 10 = 40 children. Total = 50 + 25 + 40 = 115 children.','Add all the categories for the total.')]),
  ('Smriti scored 80, 50, 10, 100, 90, 0, 90 and 50 runs. With a scale of 1 unit = 10 runs, what are the bar heights and what are her total runs?',
   [('Divide each score by 10: 8, 5, 1, 10, 9, 0, 9 and 5 units.','Bar height = value divided by the number of items for one unit.'),
    ('A score of 0 gives no bar, since its height is 0 units.','A zero value shows as a missing bar.'),
    ('Total runs = 80 + 50 + 10 + 100 + 90 + 0 + 90 + 50 = 470.','Add all the values for the total.')]),
  ('The bar graph of India population shows 36 crores in 1951 and 102 crores in 2001. By how many crores did the population grow, and what is the average growth per decade?',
   [('Growth = 102 - 36 = 66 crores over 50 years.','Subtract the earlier value from the later value.'),
    ('There are 5 decades between 1951 and 2001.','From 1951 to 2001 is 5 steps of ten years.'),
    ('Average growth per decade = 66 / 5 = 13.2 crores.','Divide the total growth by the number of decades.')])],
 ('Explain to a friend how to take a list of answers and turn it into a graph.',
  ['Collect the data, then organise it with tally marks into a frequency table.','Choose a scale that fits the largest value and mark equally spaced categories.','Draw bars of equal width with heights from the frequencies, and add a title and labels.','Read the graph to find the most, the least and comparisons between categories.'],
  ['Thinking tally marks are written as five separate lines; the fifth line crosses the four.','Forgetting to read the scale and treating each bar height as the actual number.','Drawing bars of different widths or with unequal gaps.','Using a pictograph key of 10 and still trying to show exactly 27 or 33.']),
 ['Data is a collection of facts or measurements; collect it when the answer is not already known.','Tally marks and a frequency table organise data; every fifth tally crosses the previous four.','Arranging data in ascending order groups equal values and makes counting easier.','A pictograph uses symbols with a key; a bar graph uses equal-width bars with a scale.','Choose the scale so the largest value fits, and use the same scale for every bar.','Vertical bars (column graphs) suit heights, and horizontal bars suit lengths along the ground.'],
 [num('1',1,'In the shoe-size data of 27 students, 3 students wear size 3, 9 wear size 4, 10 wear size 5, 4 wear size 6 and 1 wears size 7. How many students wear size 5?',10,'The frequency of size 5 is 10.',[(9,'9 is the number of students wearing size 4.'),(27,'27 is the total number of students.')]),
  num('2',1,'How many of those 27 students wear a shoe size larger than 4?',15,'Add the students for sizes 5, 6 and 7: 10 + 4 + 1 = 15.',[(10,'This counts only size 5 and leaves out sizes 6 and 7.'),(12,'You may have added 10 + 1 + 1; size 6 has 4 students.')]),
  num('3',1,'In a pictograph one symbol stands for 10 children. How many children do 3 and a half symbols stand for?',35,'3 symbols are 30 children and a half symbol is 5 children, so 35.',[(40,'A half symbol is 5 children, not 10.'),(3.5,'You forgot to multiply by the key of 10.')]),
  mcq('4',1,'Why do we choose a scale before drawing a bar graph?','So that the bars fit on the paper and are easy to mark and read',[('To make the graph more colourful','Colour is a decoration; the scale decides the bar length.'),('So that we do not need to label the graph','Every graph still needs a title and labels.')],'The scale tells how many items one unit of bar length stands for.'),
  tf('5',1,'In tally marks, the fifth mark is drawn across the previous four marks.',True,'Tally marks are grouped in fives: four straight lines and a fifth line crossing them.'),
  num('6',2,'With a scale of 1 unit = 10 runs, how many units high is the bar for 90 runs?',9,'90 divided by 10 is 9 units.',[(90,'That would be the bar for a scale of 1 unit = 1 run.'),(10,'10 is the number of runs for one unit, not the bar height.')]),
  num('7',2,'The population of India was 36 crores in 1951 and 102 crores in 2001. By how many crores did it grow?',66,'102 - 36 = 66 crores.',[(138,'138 is the sum of 36 and 102; growth needs subtraction.'),(54,'54 is the population in 1971, not the growth between 1951 and 2001.')]),
  mcq('8',2,'Which graph is best to show the heights of the tallest mountains on the continents?','A vertical bar graph (column graph)',[('A horizontal bar graph only','Heights go upward, so vertical bars give the natural picture.'),('A tally table only','A tally table cannot compare the heights at a glance.')],'Heights are measured upward from the ground, so columns suit them.'),
  num('9',3,'In the sweets data the frequencies are 6, 9, 13, 3 and 7. How many students answered in all?',38,'6 + 9 + 13 + 3 + 7 = 38.',[(13,'13 is only the number who chose gujiya.'),(36,'Check the addition; the total is 38.')]),
  num('10',3,'In the same sweets data, how many more students chose gujiya than barfi?',10,'Gujiya has 13 and barfi has 3, and 13 - 3 = 10.',[(16,'16 is 13 + 3; the difference needs subtraction.'),(3,'3 is the number who chose barfi.')])],
 svgs=[('c6-maths-sweets-bargraph','A bar graph of sweet preferences: jalebi 6, gulab jamun 9, gujiya 13, barfi 3 and rasgulla 7','Bar graph of sweet preferences')],
 keep=['data','frequency','tally marks','pictograph','bar graph','scale','column graph'])
