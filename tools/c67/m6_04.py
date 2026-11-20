from lib import *
def bar():
    b='<text x="20" y="22" font-weight="bold">Books read this month</text><line x1="60" y1="30" x2="60" y2="200" stroke="#333"/><line x1="60" y1="200" x2="420" y2="200" stroke="#333"/>'
    for i,(n,v) in enumerate((('Asha',4),('Ravi',6),('Meena',3),('John',5))):
        x=80+i*85; b+=f'<rect x="{x}" y="{200-v*25}" width="50" height="{v*25}" fill="#3498db" stroke="#333"/><text x="{x}" y="220">{n}</text><text x="{x+18}" y="{195-v*25}">{v}</text>'
    for k in range(0,7,2): b+=f'<text x="35" y="{205-k*25}">{k}</text>'
    return b
svgfile('c6-maths-bar-graph.svg',440,235,bar())
chapter(6,'maths','data-handling-and-presentation','Data Handling and Presentation',
 ('Which snack?','Ms Rao asks her class which snack they like most. She gets forty different answers shouted at once! To make sense of them, she collects them, organises them in a table and draws a picture. That is data handling.'),
 [('Collecting and organising data',['Data means facts and numbers we collect to answer a question.','First decide the question. Then collect answers, for example by asking each classmate or counting.','Keep a tally mark for each answer and count in groups of five by drawing a line across four marks.','Write the counts in a table. A table makes it easy to find the largest, the smallest and the total.']),
  ('Pictographs',['A pictograph uses small pictures or symbols to show numbers.','Every pictograph has a key that tells how many things one picture stands for, such as one picture for 5 children.','If a picture is cut in half, it stands for half of the number in the key.','Pictographs are quick to read but can be hard to draw when the numbers are large.']),
  ('Bar graphs',['A bar graph uses bars of different heights or lengths to compare things.','The axis along the bottom names the categories. The axis along the side has a number scale.','Choose a scale that fits all the numbers. For example one square for 2 books if the data go up to 20.','Equal gaps between bars and equal widths keep the graph fair and easy to read.']),
  ('Drawing a bar graph',['Step one: draw two axes. Step two: label them. Step three: choose a scale and mark it.','Step four: draw each bar to its height. Step five: give the graph a title.','To read a bar graph, look at the top of a bar, then move across to the scale.']),
  ('Making it clear',['A good graph has a title, labels, a scale and a key if needed.','Neat colours and equal spacing help others understand your data quickly.'])],
 [('A bar graph shows Asha 4 books, Ravi 6, Meena 3, John 5. How many books in all?',[('Add the bars.','Total is the sum.'),('4 plus 6 plus 3 plus 5 equals 18.','Add carefully.')]),
  ('In a pictograph, one star means 5 pupils. There are 7 stars. How many pupils?',[('Look at the key: one star is 5.','Key first.'),('7 times 5 is 35 pupils.','Multiply stars by the key.')])],
 ('A friend drew a bar graph with no scale. What would you tell them?',['Without a scale we cannot read the exact values.','Add a number scale and a title.'],['Thinking only the colour of the bar matters.','Choosing a scale too small to fit the tallest bar.']),
 ['Collect data, organise it in a table, then show it in a picture.','A pictograph needs a key.','A bar graph needs labels, a scale and a title.','Pick a scale that fits all the numbers.'],
 [mcq('d4-1',1,'What does the key of a pictograph tell us?','How many things one picture stands for',[('The colour of the picture','Colour is decoration; the key gives the number.'),('The title of the graph','The title is separate from the key.')],'Without the key the pictures have no number meaning.'),
  mcq('d4-2',1,'Which graph uses bars to compare numbers?','Bar graph',[('Pictograph','A pictograph uses symbols.'),('Tally chart','A tally chart uses marks.')],'Bar height shows the amount.'),
  num('d4-3',1,'One apple picture stands for 4 apples. How many apples are shown by 6 pictures?',24,'6 times 4 is 24.',[(10,'That adds 4 and 6; we must multiply.')]),
  tf('d4-4',1,'A bar graph should have a title.',True,'A title tells the reader what the graph is about.'),
  mcq('d4-5',2,'A half picture on a pictograph where one picture is 10 stands for','5',[('10','That is a whole picture.'),('1','Half of 10 is 5.')],'Half of the key number.'),
  num('d4-6',2,'In a graph the bar for Ravi reaches 6 and Asha 4. How many more did Ravi read?',2,'6 minus 4 is 2.',[(10,'That adds them.')]),
  mcq('d4-7',2,'Data go up to 20. Which scale fits best on a small page?','1 square for 2',[('1 square for 1000','The bars would be too tiny to see.'),('1 square for 50','All the bars would be invisible.')],'The scale should fit the biggest value.'),
  mcq('d4-8',2,'Tally marks: four lines with one across means','5',[('4','The fifth line crosses the four, so it makes 5.'),('1','Each line is 1, but the group is 5.')],'Counting in fives is quick.'),
  num('d4-9',3,'A bar graph shows 5, 8, 3 and 4. What is the total?',20,'5 plus 8 plus 3 plus 4 is 20.',[(8,'That is only the largest bar.')]),
  mcq('d4-10',3,'To make a fair comparison the bars must have','the same width and equal gaps',[('different widths','Wider bars can look bigger than they are.'),('no labels','Labels are needed to know what each bar is.')],'Fair graphs are drawn equally.')],
 svgs=[('c6-maths-bar-graph','Bar graph of books read by four children','A simple bar graph with labelled axes')],keep=['pictograph','bar graph','scale','key'])
