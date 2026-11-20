from h34 import *
M=mcq;F=tf;S=short;N=num
base={'a':[1],'b':[1,2],'c':[1,4],'d':[1,4,5],'e':[1,5],'f':[1,2,4],'g':[1,2,4,5],'h':[1,2,5],'i':[2,4],'j':[2,4,5]}
pat=dict(base)
for l,s in zip('klmnopqrst','abcdefghij'): pat[l]=base[s]+[3]
for l,s in zip('uvxyz','abcde'): pat[l]=base[s]+[3,6]
pat['w']=base['j']+[6]
pos={1:(0,0),2:(0,1),3:(0,2),4:(1,0),5:(1,1),6:(1,2)}
body='<text x="360" y="22" text-anchor="middle" font-weight="bold">The Braille alphabet (dots 1-2-3 down the left, 4-5-6 down the right)</text>'
for i,l in enumerate('abcdefghijklmnopqrstuvwxyz'):
    r,c=divmod(i,9); x=30+c*78; y=40+r*100
    body+=f'<text x="{x+12}" y="{y+80}" text-anchor="middle" font-weight="bold">{l}</text>'
    for d in range(1,7):
        dx,dy=pos[d]; on=d in pat[l]
        body+=f'<circle cx="{x+dx*24}" cy="{y+dy*18+8}" r="6" fill="{"#222" if on else "#fff"}" stroke="#888"/>'
svgfile('c4en-braille-alphabet.svg',720,340,body)
chapter(4,'english','braille','Braille',
 ('A blind boy who taught the world to read','Louis Braille was a little boy in France who lost his sight in an accident. At school for blind children he learned about a difficult dot code made for soldiers, and he simplified it into the Braille alphabet. In this chapter you will read his story, see how the Braille alphabet works, practise the sound spl, use was and were for things that were happening in the past, and think about how to protect our eyes and help friends with low vision.'),
 [('Louis loses his sight',['Long ago in France, a boy named Louis Braille was playing outside his home when he was three years old.','His father was a blacksmith and was working nearby, and Louis began to play with the sharp tools around him.','Suddenly a sharp tool pierced his eye, and he cried out in pain.','Within a few days he became blind in that eye, and then the other eye was also affected, until he was completely blind.']),
  ('Learning and inventing',['In 1819, when Louis was ten years old, he joined the Royal Institute for Young Blind Persons in Paris.','There he learnt letters by using wood, cloth or pins arranged on pincushions.','At that time an army man named Captain Charles Barbier had invented Night Writing, an alphabet of raised dots and dashes that soldiers could read with their fingers in the dark.','It was too difficult and not a success, but Louis, now a teenager, became interested in it and simplified it.','He gave the world the Braille alphabet. So a blind person taught the world to see.']),
  ('How Braille works',['Braille is a method of reading by touch. Each letter is made from raised dots in a small cell of up to six dots.','There is one Braille symbol for each of the twenty-six letters of the English alphabet.','The first ten letters, a to j, use only the upper four dots. The next ten, k to t, add the third dot. Most of the last letters add the sixth dot too.','Braille needs more space because the letters cannot be written too close together, so a Braille book is thicker than a printed book.','Braille is not only for people who cannot see. People with sight can learn it too and write small poems and stories in Braille.']),
  ('New words',['A blacksmith is a person who makes things out of hot iron. Blind means unable to see.','Pincushions are small soft pads where pins are stuck. Invented means made something new for the first time.']),
  ('Sounds and speaking',['Say the words that start with spl: splinter, split, splendid and splash, stressing the spl sound.','To describe an object by touch, close your eyes, pick an object and tell its shape, whether it is longer or shorter than your forefinger, and what it is.','The white cane used by people who cannot see is white so that other people notice it easily and make way.']),
  ('Was and were',['To tell about an action that was going on in the past we use was or were with an action word ending in -ing.','For one person or animal we use was. The student was writing in his notebook.','For more than one we use were. The students were writing in their notebooks.','Change present to past: I am sleeping becomes I was sleeping. The dogs are barking becomes The dogs were barking. Sheeba is writing a letter becomes Sheeba was writing a letter.','Words like long ago, yesterday and last night tell us that the sentence is about the past.']),
  ('Eyes and friends',['Louis lost his sight in an accident, so we should protect our eyes. Keep away from sharp tools and crackers, never look straight at the sun, and wear safety glasses when needed.','A child with low vision can be helped by a printout in large letters, a seat near the board and a kind friend.','You can feel raised shapes: press hard on paper with a pencil to draw a circle, turn the paper over, close your eyes and trace the raised line with your finger.','Find out where the nearest resource centre for people with blindness is.'])],
 [('Change to past: The man is using his hands to push his wheelchair.',[('The subject is the man, one person.','One person uses was.'),('Change is using to was using.','Keep the action word with -ing.'),('So: The man was using his hands to push his wheelchair.','For many people use were.')]),
  ('Which letter has only dot 1 in Braille?',[('Look at the alphabet picture.','Each letter has its own pattern.'),('The pattern with only the top left dot is a.','All other letters have two or more dots.'),('So the letter is a.','a is the first Braille letter.')])],
 ('Tell the story of Louis Braille and explain how Braille helps blind people.',['Louis lost his sight as a child','He learned Night Writing at school','He simplified it into Braille','Braille is read by touch'],['Louis was born blind','Night Writing was a success']),
 ['Louis Braille became blind as a child but invented a reading method by touch.','Braille letters are raised dots in a cell of up to six dots.','Braille books are thicker because letters need more space.','Use was with one and were with more than one for past actions in progress.','We should protect our eyes and help friends with low vision.'],
 [M('1',1,'How did Louis Braille become blind?','A sharp tool pierced his eye',[('He was born blind','He lost his sight at three'),('He read too much','It was an accident')],'He was playing with his father\'s tools.'),
  M('2',1,'What was Night Writing?','An alphabet of raised dots and dashes for soldiers',[('A poem about night','It was a dot code'),('A game','It was a code')],'Soldiers read it by touch in the dark.'),
  M('3',1,'Why was Night Writing not a success?','It was too difficult',[('Soldiers did not use it','It was hard to learn'),('It was too short','It was too difficult')],'Louis simplified it.'),
  M('4',1,'What did Louis do to make reading easier for the blind?','He simplified the code into the Braille alphabet',[('He built a school','He made an alphabet'),('He wrote a book on soldiers','He simplified the code')],'He gave the world Braille.'),
  M('5',2,'Why is a Braille book thicker than a printed book?','Braille letters need more space',[('The pages are heavier','Space is the reason'),('It has more pictures','Space is the reason')],'The dots cannot be too close.'),
  M('6',2,'How many letters of the alphabet does Braille have symbols for?','26',[('20','There are 26 letters'),('10','There are 26 letters')],'One for each English letter.'),
  M('7',2,'What is a blacksmith?','A person who makes things from hot iron',[('A doctor','Not the meaning'),('A soldier','Not the meaning')],'Louis\' father was a blacksmith.'),
  M('8',2,'Fill in: The students ___ writing in their notebooks.','were',[('was','Students is more than one'),('is','That is present')],'Plural past uses were.'),
  M('9',2,'Fill in: The student ___ writing in his notebook.','was',[('were','One student uses was'),('are','That is present')],'Singular past uses was.'),
  M('10',2,'Which word starts with spl?','Splash',[('Spoon','Starts with sp'),('Space','Starts with sp')],'Splash begins with spl.'),
  F('11',2,'Only blind people can learn Braille.',False,'Anyone can learn it.'),
  S('12',3,'In which country was Louis Braille born?',['france'],'He lived in France.')],
 svgs=[('c4en-braille-alphabet','The 26 Braille letters drawn as dot patterns.','Each Braille letter is a pattern of raised dots in a six-dot cell.')],
 keep=['Braille','blacksmith'])
