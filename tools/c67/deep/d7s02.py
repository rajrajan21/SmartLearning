import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="26" font-weight="bold">How indicators show acidic, basic and neutral</text>'
    hdr=[('Indicator',20),('Acidic',190),('Basic',320),('Neutral',450)]
    for t,x in hdr: b+=f'<text x="{x}" y="58" font-weight="bold" font-size="15">{t}</text>'
    rows=[('Blue litmus paper','#e74c3c','red','#2e86c1','stays blue','#2e86c1','stays blue'),
          ('Red litmus paper','#e74c3c','stays red','#2e86c1','turns blue','#e74c3c','stays red'),
          ('Red rose extract','#e74c3c','red','#27ae60','green','#c0392b','no change'),
          ('Turmeric paper','#f1c40f','stays yellow','#c0392b','turns red','#f1c40f','stays yellow')]
    y=70
    for n,c1,t1,c2,t2,c3,t3 in rows:
        b+=f'<text x="20" y="{y+30}" font-size="14">{n}</text>'
        for x,c,t in ((190,c1,t1),(320,c2,t2),(450,c3,t3)):
            b+=f'<rect x="{x}" y="{y}" width="115" height="44" rx="8" fill="{c}" fill-opacity="0.85" stroke="#555"/><text x="{x+8}" y="{y+27}" font-size="13" fill="#fff" font-weight="bold">{t}</text>'
        y+=56
    b+='<text x="20" y="318" font-size="14">Acid + Base gives Salt + Water + Heat (neutralisation)</text>'
    return b
svgfile('c7-science-exploring-substances-acidic-basic-and-neutral.svg',600,335,dia())
secs=[
 ('The science fair mystery',[
  'Ashwin and Keerthi visit a science fair. When a liquid is sprayed on blank sheets of paper, the words Welcome to the Wonderful World of Science appear.',
  'They are excited and want to know how this happened. At the Colourful World of Substances stall they see many colour changes when different substances are mixed, and they decide to explore.',
  'By the end of the chapter we will be able to explain the trick ourselves, so keep the mystery in mind.']),
 ('Litmus as an indicator',[
  'In Activity 2.1 we collect lemon juice, soap solution, amla juice, tamarind water, vinegar, baking soda solution, lime water, tap water, washing powder solution, sugar solution and salt solution.',
  'We put one drop of each sample on small pieces of blue litmus paper laid on a clean dry white tile, using a dropper, and then repeat with red litmus paper, recording what we see in Table 2.1.',
  'Lime water is a solution of calcium hydroxide in water. It is made by mixing lime, which is chuna or calcium oxide, in water, leaving it for about an hour and filtering the liquid. Do not confuse lime water with the lime fruit, which is similar to a lemon.',
  'Now we sort the samples into three groups. Group A turns blue litmus red. Group B turns red litmus blue. Group C changes neither.',
  'Litmus is a natural substance obtained from lichens. It comes as a solution and as litmus paper strips, in two colours, blue and red.',
  'Substances that turn blue litmus red are acidic. Substances that turn red litmus blue are basic. Because litmus shows different colours in acidic and basic solutions, it is called an acid-base indicator.',
  'Group A contains lemon juice, amla juice, tamarind water and vinegar, so they are acidic. Group B contains soap solution, baking soda solution, lime water and washing powder solution, so they are basic. Group C contains tap water, sugar solution and salt solution. They are neither acidic nor basic, so they are called neutral.',
  'A lichen is formed when two living organisms, a fungus and an alga, live together. Lichens grow on rocks and trees where there is plenty of rain and clean air.']),
 ('Taste and touch: relating acids and bases to daily life',[
  'In Activity 2.2 we notice that all the edible substances of Group A taste sour. So sour-tasting substances tend to contain acids.',
  'Caution: never taste anything unless you are asked to, and never taste an unknown substance.',
  'The common acids in food are citric acid in lemon, ascorbic acid which is vitamin C along with citric acid in some fruits, tartaric acid in tamarind, and lactic acid in curd. Vinegar contains acetic acid.',
  'Rub a little baking soda solution between your fingers. It feels soapy or slippery. Bases are generally slippery to touch and generally taste bitter.',
  'But not everything bitter is a base. Bitter gourd, or karela, tastes bitter but is not basic. So taste and touch are only clues, and we must use an indicator to be sure.']),
 ('A red rose as an indicator',[
  'If litmus is not available, other natural substances can act as indicators. In Activity 2.3 we make one from red rose petals. It is better not to pluck flowers, so we collect petals that have fallen on the ground.',
  'Wash a fistful of petals, crush them with a mortar and pestle, and put them in a glass tumbler. Pour in enough hot water to cover the petals, under adult supervision, and cover the glass with a lid.',
  'After five to ten minutes the water becomes coloured. Filter it. The liquid that passes through the filter is called the filtrate, and here it is the red rose extract.',
  'In Activity 2.4 we put ten to twenty drops of extract in two small bottles, A and B. We add twenty to thirty drops of lemon juice to A and of soap solution to B, and record the colours in Table 2.3.',
  'The samples that turn the extract a shade of red are the same as those that turned blue litmus red, so they are acidic. The samples that turn it green are the same as those that turned red litmus blue, so they are basic. Samples that do not change it are neutral.',
  'So red rose extract is another acid-base indicator. It gives red in acidic solutions and green in basic solutions.',
  'You can repeat this with beetroot, purple cabbage, turmeric, Indian blackberry or jamun, and red hibiscus or gudhal flowers. They can also act as indicators.',
  'Hydrangea is a plant of cooler places in the Himalayan region and the North-eastern states. Its flowers are blue in acidic soil and pink or red in basic soil.']),
 ('Turmeric as an indicator',[
  'In Activity 2.5 we make turmeric paper. Mix a spoonful of turmeric or haldi with a little water into a paste, or grind fresh turmeric. Dip a piece of filter paper in the paste until it is yellow, let it dry and cut it into thin strips. Take care and ask an adult to supervise.',
  'Put a drop of each sample on separate strips and record the colours in Table 2.4.',
  'Only the basic samples change the colour of turmeric paper, turning it red. Acidic and neutral samples leave it yellow.',
  'So turmeric paper can test for bases, but it cannot tell an acidic substance from a neutral one.',
  'This explains why a curry stain on a white shirt turns red when soap is applied: soap is basic.',
  'Turmeric is a member of the ginger family and is grown in India and other countries. In the Ayurvedic system it is considered to have many health benefits and is used in many home remedies.',
  'Ashwin made a greeting card for Guru Purnima by painting turmeric paste on white paper and letting it dry. He wrote with a basic solution, such as soap solution, and the message appeared in red.']),
 ('Olfactory indicators',[
  'Some substances change their smell in an acidic or basic medium. They are called olfactory indicators.',
  'In Activity 2.6 we leave finely chopped onions in a closed container overnight with strips of clean cotton cloth or filter paper. Next day we smell two strips, put a few drops of tamarind water on one and baking soda solution on the other, and smell them again.',
  'The onion smell on the basic strip goes away, while on the acidic strip it remains. Onion is therefore an olfactory indicator.',
  'This is useful for people who cannot see colour changes, because they can use smell instead.']),
 ('Know a scientist: Acharya P. C. Ray',[
  'Acharya Prafulla Chandra Ray is known as the Father of Modern Indian Chemistry. He earned a doctorate in chemistry in the United Kingdom and returned to India to advance scientific research.',
  'He established India\'s first pharmaceutical company in 1901, and he wrote on the history of chemistry in India, showing the achievements of ancient Indian scientists to the modern world.',
  'He was also a social reformer who advocated teaching in the mother tongue.']),
 ('What happens when an acid meets a base?',[
  'In Activity 2.7 we put one drop of lemon juice in a test tube, add about twenty drops of water, and then a drop of blue litmus solution. The solution turns red.',
  'Now we slowly add lime water drop by drop and swirl. At one stage the colour changes from red to blue. The solution is no longer acidic, because the lime water has cancelled the effect of the acid.',
  'If we add one more drop of lemon juice, the colour goes back to red.',
  'When an acid solution and a base solution are mixed in the right amounts, the result is neither acidic nor basic. This is called a neutralisation reaction.',
  'In neutralisation, a salt and water are formed and heat is released. We write: Acid plus Base gives Salt plus Water plus Heat.']),
 ('Neutralisation in daily life',[
  'Situation 1, ant bite. When a red ant bites, it injects formic acid into the skin, which causes red, stinging pain. Rubbing moist baking soda, which is a base, neutralises the acid and relieves the pain.',
  'Situation 2, acidic soil. Too much chemical fertiliser can make soil acidic so that plants do not grow well. Adding lime, a base, neutralises it. If soil is basic, organic matter such as manure and composted leaves releases acids and neutralises it. Sometimes the soil is neutral but plants are still unhealthy because it lacks nutrients.',
  'Situation 3, factory waste. If factory waste is acidic and flows into a lake, fish can die. The waste should be neutralised by adding a basic substance before it is released.',
  'These examples show that the same idea of neutralisation helps in the home, in farming and in protecting the environment.']),
 ('Solving the science fair mystery',[
  'Now we can explain the trick. Turmeric solution was sprayed on paper, and the message had been written earlier with soap solution, which is basic.',
  'Where the soap solution touched the turmeric it turned red, so the words appeared on the yellow paper.'])]
ex=[
 ('A solution turns red litmus blue. Excess of which of these would reverse the change: lime water, baking soda, vinegar, common salt solution?',
  [('Work out what the solution is.','Turning red litmus blue means it is basic.'),
   ('Decide what reverses a base.','An acid neutralises a base, and an excess makes the solution acidic.'),
   ('Pick the acid.','Vinegar is acidic, so excess vinegar reverses the change.')]),
 ('Solution A turns red litmus blue. Solution B turns turmeric red. Solution C turns red rose extract green. Give the nature of A, B and C.',
  [('Read each result.','Red litmus turning blue shows a base. Turmeric turning red shows a base. Red rose turning green shows a base.'),
   ('Combine them.','All three tests point the same way.'),
   ('Conclude.','A, B and C are all basic.')]),
 ('A sample leaves red litmus and turmeric unchanged but turns blue litmus red. What is it?',
  [('Use blue litmus.','Blue litmus turning red means the sample is acidic.'),
   ('Check with the others.','Red litmus does not change in an acid, and turmeric does not change in an acid.'),
   ('Conclude.','The liquid is acidic, and all three results agree.')]),
 ('Manya is blindfolded and must test two unknown solutions. Which indicator can she use?',
  [('She cannot see colours.','So colour indicators such as litmus will not help.'),
   ('Use another sense.','An olfactory indicator such as chopped onion changes smell in a base.'),
   ('Conclude.','She can use onion strips and smell them after adding a drop of each solution.')])]
qs=[
 mcq('1',1,'Litmus is obtained from','lichens',[('turmeric','Turmeric makes a different indicator, turmeric paper.'),('red roses','Red roses give rose extract, not litmus.')],'Litmus is a natural substance from lichens, which are a fungus and an alga living together.'),
 mcq('2',1,'A substance that turns blue litmus red is','acidic',[('basic','Bases turn red litmus blue.'),('neutral','Neutral substances change neither.')],'Acids turn blue litmus red.'),
 mcq('3',1,'Which of these is neutral?','Salt solution',[('Lemon juice','Lemon juice is acidic.'),('Soap solution','Soap solution is basic.')],'Tap water, sugar solution and salt solution change neither litmus.'),
 tf('4',1,'Bases generally feel soapy or slippery.',True,'Baking soda solution feels slippery between the fingers.'),
 mcq('5',2,'Red rose extract gives which colour in a basic solution?','Green',[('Red','Red is the colour in acidic solutions.'),('Yellow','Turmeric is yellow, not red rose extract.')],'Red rose extract is red in acid and green in base.'),
 mcq('6',2,'Turmeric paper turns red when a drop of this is put on it:','soap solution',[('lemon juice','Acids do not change turmeric paper.'),('sugar solution','Neutral substances do not change it.')],'Only bases turn turmeric red.'),
 tf('7',2,'Turmeric paper can tell an acidic substance from a neutral one.',False,'Both leave it yellow, so it can only test for bases.'),
 mcq('8',2,'The smell of onion disappears in a base. Onion is therefore an','olfactory indicator',[('acid','Onion is used to test, it is not an acid here.'),('neutral salt','It is an indicator, not a salt.')],'Substances whose odour changes in acidic or basic medium are olfactory indicators.'),
 mcq('9',2,'In a neutralisation reaction the products are','salt, water and heat',[('only salt','Water and heat are also produced.'),('acid and base again','Acid and base react and are used up.')],'Acid plus base gives salt plus water plus heat.'),
 mcq('10',2,'Moist baking soda is rubbed on a red ant bite because','it is a base that neutralises the formic acid',[('it is acidic','Adding an acid would not help.'),('it is neutral','A neutral substance would not neutralise the acid.')],'Ant venom contains formic acid, and a base relieves it.'),
 mcq('11',3,'Acidic soil can be treated with','lime',[('vinegar','Vinegar would make it more acidic.'),('lemon juice','Lemon juice is an acid.')],'Lime is a base, so it neutralises acidic soil.'),
 mcq('12',3,'Basic soil can be treated with','manure and composted leaves',[('lime','Lime would make it more basic.'),('soap solution','Soap solution is basic.')],'Organic matter releases acids that neutralise basic soil.'),
 mcq('13',3,'Grape juice with red rose extract turns reddish. If baking soda is added, the colour will','turn towards green',[('turn deeper red','Baking soda is a base, not an acid.'),('stay exactly the same','The base neutralises the acid, so the colour changes.')],'The base neutralises the acid in grape juice and then makes the extract basic, which is green.'),
 mcq('14',3,'A farmer\'s plants grow badly after heavy use of chemical fertiliser. A likely reason is','the soil has become acidic',[('the soil has become a salt','This is not what the chapter says.'),('the sun is too bright','The chapter points to the soil.')],'Too much chemical fertiliser can make soil acidic.'),
 mcq('15',3,'Why is lime water NOT the same as lime fruit juice?','Lime water is calcium hydroxide in water, a base',[('They are the same','The words are similar but the substances differ.'),('Lime water is an acid','Lime water is basic.')],'Lime water is made from chuna, calcium oxide, while the lime fruit is a citrus fruit.')]
chapter(7,'science','exploring-substances-acidic-basic-and-neutral','Exploring Substances: Acidic, Basic, and Neutral',
 ('How did the words appear on blank paper?','Blank sheets of paper, a spray bottle, and suddenly a message appears. This is the mystery at the science fair. By the end of the chapter you will be able to do this yourself, using nothing more than kitchen things.'),
 secs,ex,
 ('Explain how you would find out whether an unknown liquid is acidic, basic or neutral, and how you could write a secret message.',
  ['Use an indicator: litmus, red rose extract or turmeric paper.','Acids turn blue litmus red and rose extract red.','Bases turn red litmus blue, rose extract green and turmeric red.','Neutral substances change none of them.','A secret message can be written with soap solution and revealed with turmeric.'],
  ['Thinking taste is a safe test for acids.','Thinking everything bitter is a base.','Thinking turmeric can detect acids.','Thinking neutralisation gives only water.']),
 ['Substances can be acidic, basic or neutral.','Litmus, red rose extract and turmeric are natural indicators.','Acids turn blue litmus red, bases turn red litmus blue.','Red rose extract is red in acid and green in base.','Turmeric turns red only in bases.','Acid plus base gives salt plus water plus heat.','Neutralisation helps with ant bites, soil and factory waste.'],
 qs,svgs=[('c7-science-exploring-substances-acidic-basic-and-neutral','A chart of colours given by litmus, red rose extract and turmeric in acidic, basic and neutral solutions','How indicators behave')],
 keep=['litmus','indicator','acid','base','neutral','neutralisation'])
