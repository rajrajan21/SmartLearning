import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def dia():
    b='<text x="20" y="24" font-weight="bold">Grade 7 journey: how the chapters connect</text>'
    nodes=[('Materials','acids, bases,','metals, non-metals',40,50,'#d6eaf8'),('Changes','physical, chemical,','heat transfer',230,50,'#fcf3cf'),('Living things','growing up, animals,','plants',420,50,'#d5f5e3'),('Time and motion','clocks, speed','',40,170,'#fadbd8'),('Light','sources, shadows,','reflection',230,170,'#e8daef'),('Earth and sky','rotation, Moon,','Sun, eclipses',420,170,'#fdebd0')]
    for t,l1,l2,x,y,c in nodes:
        b+=f'<rect x="{x}" y="{y}" width="160" height="80" rx="10" fill="{c}" stroke="#555" stroke-width="2"/><text x="{x+10}" y="{y+28}" font-size="15" font-weight="bold">{t}</text><text x="{x+10}" y="{y+50}" font-size="13">{l1}</text><text x="{x+10}" y="{y+68}" font-size="13">{l2}</text>'
    for (x1,y1,x2,y2) in [(200,90,230,90),(390,90,420,90),(200,210,230,210),(390,210,420,210),(120,130,120,170),(310,130,310,170),(500,130,500,170)]:
        b+=f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#1b4f72" stroke-width="3" marker-end="url(#a)"/>'
    b+='<defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#1b4f72"/></marker></defs>'
    b+='<text x="40" y="290" font-size="14">Everything is interconnected: an idea in one area helps us ask questions in another.</text>'
    return b
svgfile('c7-science-the-ever-evolving-world-of-science.svg',620,310,dia())
secs=[
 ('Science is a process of curiosity',[
  'Welcome to Grade 7 science. Science is not only a list of facts; it is a way of thinking that welcomes curiosity, asks questions and is open to the unknown.',
  'In Grade 6 we saw that science is a process. In Grade 7 we ask deeper questions: how do things work, why do events happen the way they do, and what patterns do we see in nature?',
  'To answer them we must step out of the book and sometimes out of the classroom, and learn through activities and experiments.',
  'Science is also about responsibility. Human activities are linked to what happens in nature, and science can help us solve environmental problems and build a more sustainable world.']),
 ('Everything is interconnected',[
  'The book covers physics, chemistry, biology and earth science. They look like different chapters, but they are all connected.',
  'An idea in one area often inspires a discovery in another, or at least allows us to ask a new question there.',
  'So as we go through the year, keep asking: where have I met this idea before, and where else could it be useful?']),
 ('A journey through the Grade 7 book: materials',[
  'We start with the properties of the materials around us, things we use daily but seldom question. Why are some fruits sour? What happens when we wash a haldi stain on our school uniform?',
  'This leads to the chapter on acidic, basic and neutral substances and to indicators that change colour.',
  'Then we play with batteries, lamps and wires to find other properties of materials. What kind of material must a lamp circuit contain to glow?',
  'This helps us classify materials by their properties, and we enter the world of metals and non-metals.']),
 ('A journey through the book: changes and heat',[
  'A torch battery eventually runs out and cannot be used again, but ice that melts can be frozen again. So we study the changes around us.',
  'Batteries run out, ice melts, fruits ripen and rocks break into pebbles. Some changes can be reversed and others cannot, and some happen faster when things are heated.',
  'So we look at how heat flows, whether in an ice cube melting in a glass or a glacier melting on a mountain.',
  'Water is everywhere. With the heat of the Sun it evaporates from the seas, falls as rain, and may trickle into the ground somewhere far away.']),
 ('A journey through the book: living things',[
  'Changes also happen inside us. Around the middle-school years our bodies change rapidly, and we ask why.',
  'Animals have life processes essential for survival. To grow we must eat and breathe, and the blood must carry nutrients from the food all over the body.',
  'Plants also need food to grow. How do they get it, and do they breathe too? Over the long time that life has evolved, it has found a beautiful and carefully balanced way of doing all this.']),
 ('A journey through the book: time, light and the sky',[
  'But what is time? A clock or a wrist watch tells us how time passes, yet we should ask how time is measured, and how fast something happens.',
  'Long before electric clocks, early humans watched the shadows of objects in the Sun and used the position of the shadow to tell the time.',
  'Light is useful for seeing, for shadow puppets and for telling the time. Today we have many ways to produce light so that we can read at night when the Sun is not shining.',
  'Asking questions about the nature of light has given us a very deep understanding of the universe.',
  'Even the Earth and the Moon cast shadows, which leads to eclipses. Day and night depend on light from the Sun.',
  'To understand all this we need to know how the Earth rotates about its axis, how the Moon goes around the Earth and the Earth around the Sun, and what these movements mean for life on our planet.']),
 ('How to learn: observe, experiment, think',[
  'In the chapters ahead you will make simple observations, do fun experiments and think carefully about topics that need careful thought.',
  'Each chapter builds on what you already know. Even an experiment that confirms what you expected may lead to new questions and more experiments.',
  'Think like a scientist: ask questions, explore and do hands-on work.']),
 ('Activity 1.1: Question the Answer',[
  'In school we are usually given questions and asked to find answers. Let us turn that around, because great scientists ask amazing questions.',
  'Last year the book said that to be a wise person you must be a whys person.',
  'In this activity, we are given an answer and must invent a curious, creative question that could lead to it. For the answer just make it half, the question could be how do we share a cake equally, or my essay is too long, or I cannot fit this in the envelope.',
  'Try it with the answers: just add some milk; because the cat\'s teeth were crooked; do not panic, I have my towel; and 42.',
  'The book asks for interesting, non-obvious questions, not an easy one like what is 32 plus 10. There are no wrong questions, so let your imagination run wild.'])]
ex=[
 ('Question the Answer: the answer is "Just add some milk." Invent three different questions it could answer.',
  [('Think of situations where milk is added to something.','Tea, coffee, cereal, a sauce, a face pack.'),
   ('Write each as a question.','How do I make my tea lighter? How can I make my sauce less spicy? What do I do to soften the dry cereal?'),
   ('Notice what makes a question interesting.','Different situations give different questions: that is what scientific curiosity does.')]),
 ('The answer is "Because the cat\'s teeth were crooked." Make a question that a scientist might also want to investigate.',
  [('Look for cause and effect in the answer.','The answer gives a reason, so the question starts with why.'),
   ('Write a question.','Why did the cat find it hard to chew its food?'),
   ('Extend it.','How do teeth help animals eat, and does shape depend on the food? This connects to the chapters on animals.')]),
 ('Use the book\'s chapter map to say which area of science a clock and a sundial belong to, and why.',
  [('Both measure something about time.','The book says early humans used shadows to tell time.'),
   ('Link the ideas.','Shadows belong to light, and measuring time with clocks belongs to time and motion.'),
   ('Conclude.','So one question connects two chapters: this is what interconnected science means.')])]
qs=[
 mcq('1',1,'According to the chapter, science is','a way of thinking that welcomes curiosity and questions',[('only a list of facts to remember','The chapter says science is a process and a way of thinking.'),('something done only in the classroom','The chapter says we must step out of the classroom too.')],'Science is a process of asking and exploring.'),
 tf('2',1,'The different areas of science, physics, chemistry, biology and earth science, are separate and unrelated.',False,'The chapter says they are all interconnected.'),
 mcq('3',1,'Which of these is NOT a topic the chapter says the book covers?','Computer programming',[('Heat transfer','Heat flow is one of the book\'s chapters.'),('Light and shadows','Light and shadows is a chapter of the book.')],'The book covers materials, changes, life processes, time, light and the Earth.'),
 mcq('4',1,'The book starts by studying the properties of','materials around us',[('stars and planets','That comes at the end of the book.'),('the human heart','Life processes come later.')],'We begin with materials such as sour fruits and haldi stains.'),
 mcq('5',2,'Which pair of changes is mentioned as different in the chapter?','Ice melting can be reversed, a battery running out cannot',[('Ice melting and rocks breaking are both reversible','Rocks breaking into pebbles is not easily reversed.'),('A battery running out can be reversed by heating','Heating does not recharge a battery.')],'Some changes can be reversed and others cannot.'),
 mcq('6',2,'Early humans told time using','the position of shadows in the Sun',[('electric clocks','Electric clocks came much later.'),('digital watches','Digital watches are modern.')],'Shadows move as the Sun moves.'),
 mcq('7',2,'Eclipses happen because','the Earth and the Moon cast shadows',[('the Sun switches off','The Sun does not switch off.'),('clouds cover the Sun forever','Eclipses are caused by shadows of the Earth or the Moon.')],'These shadows are part of the story of light and the Earth, Moon and Sun.'),
 mcq('8',2,'In Activity 1.1 we are asked to','think of a question for a given answer',[('answer a fixed question','The activity turns this around.'),('copy the answer from the book','We create questions.')],'Asking interesting questions is as important as answering them.'),
 tf('9',3,'Science also involves responsibility for how human activities affect nature.',True,'The chapter links human activity, nature and sustainability.'),
 mcq('10',3,'Which statement best matches "to be a wise person, you must be a whys person"?','Asking why questions makes us wise',[('We should avoid asking too many questions','The chapter encourages questions.'),('Only teachers should ask why','Everyone is a science explorer.')],'Curiosity drives learning.')]
chapter(7,'science','the-ever-evolving-world-of-science','The Ever-Evolving World of Science',
 ('What will you wonder about this year?','A sour fruit, a stain on a school shirt, a battery that dies, a shadow that moves across the floor, a Moon that seems to follow you. This year you will find out how all of these are connected, and you will learn to ask better questions about them.'),
 secs,ex,
 ('Explain, in your own words, why the chapters of the Grade 7 science book are interconnected, with one example linking two chapters.',
  ['Science is a way of thinking, not just facts.','Ideas in one area inspire questions in another.','Shadows link light and the measurement of time.','Heat links changes in materials and the water cycle.'],
  ['Thinking each chapter stands alone.','Thinking only answers matter, not questions.','Thinking experiments must always give the expected result.','Thinking science is only done in a laboratory.']),
 ['Science is a process that welcomes curiosity and questions.','The branches of science, physics, chemistry, biology and earth science, are interconnected.','The Grade 7 book covers materials, changes, heat, living things, time and motion, light, and the Earth, Moon and Sun.','Observations and experiments lead to deeper questions.','Science also carries responsibility: human activity and nature are linked.','Asking an interesting question is as important as finding the answer.'],
 qs,svgs=[('c7-science-the-ever-evolving-world-of-science','Six boxes showing how the Grade 7 chapters link together','The journey through the book')],
 keep=['science','experiment','observation','curiosity'])
