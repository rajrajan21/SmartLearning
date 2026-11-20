import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">Dot plot: heights in Poovizhi\'s family (cm)</text>'
    b+='<line x1="30" y1="150" x2="640" y2="150" stroke="#333" stroke-width="2"/>'
    X=lambda h:40+(h-110)*8
    for h in range(110,181,10):
        b+=f'<line x1="{X(h)}" y1="144" x2="{X(h)}" y2="156" stroke="#333"/><text x="{X(h)-10}" y="174" font-size="13">{h}</text>'
    for h,c in [(118,'#c0392b'),(165,'#1f618d'),(170,'#1f618d'),(173,'#1f618d'),(175,'#1f618d')]:
        b+=f'<circle cx="{X(h)}" cy="130" r="9" fill="{c}"/>'
    b+=f'<line x1="{X(160.2)}" y1="60" x2="{X(160.2)}" y2="150" stroke="#e67e22" stroke-width="2" stroke-dasharray="5 4"/><text x="{X(160.2)-70}" y="56" font-size="14" fill="#e67e22">mean 160.2</text>'
    b+=f'<line x1="{X(170)}" y1="70" x2="{X(170)}" y2="150" stroke="#1e8449" stroke-width="2" stroke-dasharray="5 4"/><text x="{X(170)-8}" y="66" font-size="14" fill="#1e8449">median 170</text>'
    b+='<text x="60" y="108" font-size="13" fill="#c0392b">outlier 118</text>'
    b+='<text x="30" y="206" font-size="14">The outlier pulls the mean down, but the median stays near most of the values.</text>'
    b+='<text x="30" y="232" font-size="14">Mean = total ÷ number of values.   Median = middle value of the sorted data.</text>'
    b+='<text x="30" y="258" font-size="14">Range = maximum - minimum.</text>'
    return b
svgfile('c7-maths-mean-median-dotplot.svg',700,280,d())
chapter(7,'maths','connecting-the-dots','Connecting the Dots',
 ('Who is the better batter?','Two players score runs in a series of matches. One friend says the first player is better because of the third match, another says the second because of the total. A single number that represents a whole group would settle such arguments. This chapter is about finding and using such numbers and about seeing data in pictures.'),
 [('Statistical questions and statements',[
   'Suppose your teacher is meeting two childhood friends, one 5 feet tall and one 6 feet tall. You may guess that the first is a woman and the second a man. You can be wrong, but men are more often taller than women. That is statistical thinking.',
   'A statistical statement is a claim or summary about something, in terms of numbers, proportions, probabilities or predictions.',
   'A statistical question can be answered by collecting data that is expected to vary. How tall are the Grade 7 students in our school? Typically, are onions costlier in one town or another? Both are statistical questions.',
   'What is the price of a tennis ball in India is not so clear-cut, because the answer varies with shops, whereas the age of the dogs on a street is a statistical question. Statistics is the study of collecting, organising, analysing, interpreting and presenting data.']),
  ('The arithmetic mean',[
   'Comparing two batters is hard. One scored more in the first match, the other in the third. Totals are unfair when the number of matches differs.',
   'A representative value balances the highs and lows. Add all the values and divide by the number of values. This is the average, or arithmetic mean.',
   'Yashasvi scored 96 runs in 4 matches, so his average is 96 ÷ 4 = 24 runs per match.',
   'The mean is also a fair share. Shreyas\'s five friends collected 3, 8, 10, 5 and 4 guavas, a total of 30. Shared equally, each gets 30 ÷ 5 = 6 guavas. Parag\'s six friends collected 5, 4, 6, 3, 4 and 8, also 30, so each gets 30 ÷ 6 = 5.',
   'If 2, 7, 9, 4 and 3 hibiscus flowers bloomed on five days, the total is 25 and the average is 5 flowers a day. It tells how many would bloom each day if the same number bloomed daily.',
   'Ancient Indian mathematicians called the mean samamiti, the equal measure. Brahmagupta, Mahavira, Sripati and Bhaskara all used terms meaning equalising or levelling.',
   'The school enrolment over six years was 1555, 1670, 1750, 2013, 2040 and 2126. The total is 11154, so the mean is 11154 ÷ 6 = 1859 students.']),
  ('Describing and comparing data',[
   'Onion prices for twelve months at two towns can be compared in many ways: the highest price, the total, month-by-month comparison, or the difference between the highest and the lowest.',
   'The minimum, the maximum, the total, the mean and the range, which is the maximum minus the minimum, all describe data. In one town the range is 59 - 24 = 35 and in the other 60 - 17 = 43, so the second town\'s prices vary more.',
   'A dot plot puts each data value as a dot above a number line. It shows the minimum, maximum, range, and where the values cluster or spread out.',
   'A dot plot sorts the data, but it loses the original order, for example which month a price belongs to. It lets us group data as we like, such as counting values between 11 and 20.',
   'Looking at variation raises new questions: do prices follow the seasons? Good statistics begins with curiosity.']),
  ('The median and outliers',[
   'The mean is simple and widely used, in sports, economics, biology and daily life: the average rainfall in a month, the mileage of a vehicle, the number of times people check their phones.',
   'But the mean can mislead. Poovizhi\'s family heights are 170, 173, 165, 118, 175 cm. The mean is 801 ÷ 5 = 160.2 cm, lower than four of the five members because one child is much shorter.',
   'A value far from the rest, like 118 here, is called an outlier. It pulls the mean towards it.',
   'The median is the middle value of the sorted data. Sorted, the heights are 118, 165, 170, 173, 175, and the middle is 170 cm. It represents this family better.',
   'If the number of values is even there are two middle values, and the median is their average. For Yaangba\'s family, the sorted heights are 155, 160, 164, 165, 169, 173, so the median is (164 + 165) ÷ 2 = 164.5 cm, close to the mean 164.3.',
   'When an outlier is low, the mean drops below the median. When an outlier is high, the mean rises above the median. When the data is balanced, the mean and median are close.',
   'The mean and median are called measures of central tendency, because values tend to pile up around them.']),
  ('Reading data from graphs',[
   'To answer how tall a class is, draw dot plots for the whole class, the boys and the girls. Boys\' heights range from 128 to 158 cm and girls\' from 136 to 156 cm.',
   'The mean height of boys, 142.94 cm, is less than the median 144 cm, showing a small influence of low values. For girls, the mean 146.9 cm is less than the median 148 cm.',
   'The girls\' average is higher than the boys\', so in this class the girls are taller on average. That does not mean every girl is taller than every boy.',
   'A clustered bar graph shows several groups side by side for each category or period, so we can compare across categories and across time at once.',
   'To describe a data set well, give its centre (mean and median), its spread (minimum, maximum and range) and any outliers, and then ask what could explain the pattern.'])],
 [('The runs scored by Yashasvi in 4 matches total 96. Find his average. Another player scored 105 in 5 matches. Who has the higher average?',[('Yashasvi: 96 ÷ 4 = 24 runs per match.','Mean = total ÷ number of values.'),('Other player: 105 ÷ 5 = 21 runs per match.','Same method.'),('Yashasvi has the higher average.','24 is greater than 21.')]),
  ('Find the mean and the median of 170, 173, 165, 118 and 175, and say which represents the data better.',[('Mean = (170 + 173 + 165 + 118 + 175) ÷ 5 = 801 ÷ 5 = 160.2.','Add and divide by 5.'),('Sorted: 118, 165, 170, 173, 175. Median = middle value = 170.','Sort, then take the middle.'),('The median is better, since 118 is an outlier that pulls the mean down.','The median is not much affected by outliers.')]),
  ('Find the median of 155, 160, 164, 165, 169 and 173.',[('There are 6 values, an even number.','Two values lie in the middle.'),('The middle values are 164 and 165.','Third and fourth in the sorted list.'),('Median = (164 + 165) ÷ 2 = 164.5.','Average the two middle values.')]),
  ('A group of 5 friends collected 3, 8, 10, 5 and 4 guavas. How many does each get if they share equally?',[('Total = 3 + 8 + 10 + 5 + 4 = 30.','Add the values.'),('Equal share = 30 ÷ 5 = 6.','Divide by the number of friends.'),('Each friend gets 6 guavas, the mean.','The mean is a fair share.')])],
 ('Explain to a friend what the mean and the median are, when the median is a better summary than the mean, and what a dot plot shows.',['The mean is the total divided by the number of values; the median is the middle value of sorted data.','An outlier changes the mean a lot but the median very little.','A dot plot shows the minimum, maximum, range and how values are clustered or spread.'],['Thinking the mean must be one of the values.','Forgetting to sort before finding the median.','Using the total to compare groups of different sizes.']),
 ['The arithmetic mean is the total of the values divided by the number of values; it is also a fair share.','The median is the middle value of sorted data; for an even count it is the average of the two middle values.','An outlier can pull the mean away, while the median stays steady.','Range = maximum - minimum; minimum, maximum and range describe spread.','Dot plots and clustered bar graphs help compare data across groups and categories.','Looking closely at data leads to new questions.'],
 [mcq('1',1,'The mean of 4, 6, 8, 10 and 12 is','8',[('6','6 is not the total divided by 5; the total is 40.'),('40','That is the total.')],'40 ÷ 5 = 8.'),
  mcq('2',1,'The median is the','middle value of sorted data',[('largest value','That is the maximum.'),('most common value','That is the mode, not the median.')],'Arrange in order and pick the middle.'),
  tf('3',1,'An outlier has no effect on the mean.',False,'An outlier changes the total, so it changes the mean.'),
  mcq('4',1,'Range is','maximum - minimum',[('maximum + minimum','Adding does not measure spread.'),('the middle value','That is the median.')],'It tells how far apart the extremes are.'),
  num('5',2,'Find the median of 3, 7, 5 and 9.',6,'Sorted: 3, 5, 7, 9. Median = (5 + 7) ÷ 2 = 6.',[(5,'Take both middle values and average them.'),(7,'Take both middle values and average them.')]),
  num('6',2,'Find the mean of 12, 14, 15, 13 and 90.',28.8,'The total is 144 and 144 ÷ 5 = 28.8.',[(14,'That is the median.'),(144,'That is the total.')]),
  mcq('7',2,'In the data 12, 14, 15, 13, 90 the better summary of the typical value is','the median 14',[('the mean 28.8','The outlier 90 pulls the mean far above most values.'),('the maximum 90','The maximum is the highest value, not the typical value.')],'The median is hardly affected by 90.'),
  num('8',2,'Five friends collected 3, 8, 10, 5 and 4 guavas and share equally. How many does each get?',6,'30 ÷ 5 = 6.',[(30,'That is the total.'),(5,'That is the number of friends.')]),
  num('9',3,'Enrolment over six years: 1555, 1670, 1750, 2013, 2040, 2126. Find the mean.',1859,'11154 ÷ 6 = 1859.',[(11154,'That is the total.'),(1900,'Divide the exact total by 6.')]),
  mcq('10',3,'If there is a very high outlier, then the mean is','greater than the median',[('less than the median','A high outlier pulls the mean upward.'),('always equal to the median','They are equal only for balanced data.')],'The mean shifts towards the outlier.')],
 svgs=[('c7-maths-mean-median-dotplot','A dot plot of five heights with the mean, the median and an outlier marked','Mean, median and outlier on a dot plot')],
 keep=['mean','median','outlier','range','dot plot'])
