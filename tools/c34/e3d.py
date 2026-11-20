from h34 import *
M=mcq;F=tf;S=short;N=num
def plant(name):
    b='<text x="380" y="24" text-anchor="middle" font-size="18" font-weight="bold">Parts of a plant</text>'
    b+='<rect x="0" y="190" width="760" height="130" fill="#d9b48f"/>'
    b+='<path d="M380 190 L380 70" stroke="#3a7d2c" stroke-width="10"/>'
    b+='<ellipse cx="335" cy="120" rx="42" ry="18" fill="#58a83c" stroke="#2f6b1f" stroke-width="2" transform="rotate(-25 335 120)"/><ellipse cx="428" cy="140" rx="42" ry="18" fill="#58a83c" stroke="#2f6b1f" stroke-width="2" transform="rotate(25 428 140)"/>'
    b+='<circle cx="380" cy="62" r="14" fill="#ffd23f" stroke="#c08a00" stroke-width="2"/><circle cx="432" cy="104" r="12" fill="#e63946" stroke="#9b1c27" stroke-width="2"/>'
    for x1,x2,y2 in [(380,300,290),(380,350,300),(380,410,300),(380,470,285),(380,380,310)]:
        b+=f'<path d="M380 190 L{x1} 205 L{x2} {y2}" stroke="#6b3e1c" stroke-width="4" fill="none"/>'
    lab=[(130,60,'flower',350,62),(130,120,'leaf',290,120),(560,100,'fruit',445,104),(560,160,'stem',392,160),(130,270,'roots',300,270)]
    for x,y,t,tx,ty in lab:
        b+=f'<text x="{x}" y="{y}" font-size="17" fill="#222">{t}</text><line x1="{x+ (len(t)*9 if x<300 else -6)}" y1="{y-5}" x2="{tx}" y2="{ty}" stroke="#555" stroke-width="1.5"/>'
    svgfile(name,760,320,b)
plant('c3-plant-parts.svg')
chapter(3,'evs','getting-to-know-plants','Getting to Know Plants',
 ('Gopu, Simmi and Raj on the way to school','Gopu, Simmi and Raj walk to school and notice plants of many sizes and shapes: tiny, large, bushy, thin, curvy and tall. They touch rough and smooth leaves, smell them and remember the jamun tree whose tiny white flowers turn into green, then red, then purple fruits. They learn that plants can be sorted into trees, shrubs, herbs, grasses, climbers and creepers.'),
 [('Trees and shrubs',['Trees have a big trunk made of wood and many branches that spread out with leaves. Their roots go deep down into the soil.','Mango, coconut, khejri, jackfruit, banyan, amaltas, peepal and chinar are trees.','Shrubs are medium-sized plants with several woody stems and branches that grow close to the ground. They look bushy.','Hibiscus, rose, tulsi (holy basil) and curry leaf are shrubs.','The pulses (dal) we eat, such as toor, masoor, moong and urad, are the seeds of shrubs.']),
  ('Herbs and grasses',['Herbs are smaller plants with soft green stems that do not become woody. Mint, tomato, coriander and mustard are herbs.','Grasses are a type of herb. Their leaves are long, thin and flat, and their stems are hollow.','The grains we eat, such as paddy (rice), wheat, bajra, jowar and ragi, are seeds of large grasses.','Sugarcane and bamboo are tall grasses. Bamboo is a special grass that lives longer than one year.']),
  ('Climbers and creepers',['Climbers and creepers have thin and flexible stems that cannot stand up by themselves.','A climber winds up another plant or a wall to get support. The money plant, jasmine and bottle gourd are climbers.','A creeper spreads along the ground. Watermelon and pumpkin are creepers.','Some plants behave as climbers or creepers depending on whether they find support. A climber that finds nothing to climb on will creep on the ground.']),
  ('Parts of a plant',['A plant has roots, a stem, leaves, flowers, fruits and seeds. The roots are in the soil, the stem holds the plant up and the leaves are on the stem.','Roots take in water from the soil and hold the plant firmly. The stem carries water to other parts and holds up the leaves and flowers.','Leaves have different colours, shapes and sizes, and many have different smells. The leaves of tulsi, coriander, curry leaf, mint and lemon grass all smell different.','The bark is the hard outer covering of a tree trunk. We can make a bark rubbing with paper and crayon to see its pattern.','Rafflesia in Mizoram is the biggest flower, as big as an umbrella.']),
  ('Making friends with a plant',['We can choose one plant, name it, water it and watch it over days. We note how many leaves, flowers and fruits it has and how it changes.','If we find new leaves growing, old brown leaves falling and flowers or fruits appearing, we have found out how a plant changes during the seasons.','We can smell a fruit with our eyes closed. Cut fruit can be smelled from farther away than a whole fruit.'])],
 [('A plant has a thin stem that cannot stand by itself and winds up a pole. Is it a climber or a creeper?',[('The plant needs support and goes up.','Climbers use support to grow upwards.'),('It winds up a pole, so it is a climber.','A creeper would spread on the ground.'),('Examples are the money plant and jasmine.','They climb walls and trees.')]),
  ('Why do we call a tulsi plant a shrub?',[('Tulsi is a medium-sized bushy plant.','Shrubs are not as tall as trees.'),('It has several woody stems close to the ground.','A shrub has many stems.'),('So it is a shrub.','A tree has one big trunk.')])],
 ('Tell the difference between a tree, a shrub and a herb.',['Tree has a big woody trunk','Shrub has many woody stems','Herb has soft green stems','Give an example of each'],['All plants are trees','Grass is not a plant']),
 ['Plants can be trees, shrubs, herbs, grasses, climbers or creepers.','A tree has a big trunk, a shrub has many woody stems, and a herb has soft stems.','Many grains and pulses are the seeds of grasses and shrubs.','A plant has roots, stem, leaves, flowers, fruits and seeds.','We can observe a plant to learn how it changes.'],
 [M('1',1,'Which plant is a tree?','Mango',[('Mint','Mint is a herb'),('Tulsi','Tulsi is a shrub')],'Mango has a large wooden trunk.'),
  M('2',1,'Which plant is a shrub?','Hibiscus',[('Peepal','Peepal is a tree'),('Wheat','Wheat is a grass')],'Hibiscus is a bushy shrub.'),
  M('3',1,'Which plant is a herb?','Mint',[('Banyan','Banyan is a tree'),('Rose','Rose is a shrub')],'Mint has soft green stems.'),
  M('4',1,'Which of these is a climber?','Money plant',[('Pumpkin','Pumpkin is a creeper'),('Watermelon','Watermelon is a creeper')],'The money plant climbs.'),
  M('5',2,'Which is a creeper?','Pumpkin',[('Jasmine','Jasmine is a climber'),('Tulsi','Tulsi is a shrub')],'Pumpkin spreads along the ground.'),
  F('6',2,'Wheat and rice are seeds of large grasses.',True,'Cereals are seeds of grasses.'),
  F('7',2,'Moong and urad dal are seeds of shrubs.',True,'Pulses come from shrubs.'),
  M('8',2,'What is the bark of a tree?','Hard outer covering of the trunk',[('The root','The root is in the soil'),('A leaf','A leaf is separate')],'The bark protects the trunk.'),
  M('9',2,'Which part of a plant holds it in the soil?','Roots',[('Flowers','Flowers make fruits'),('Leaves','Leaves are on the stem')],'Roots anchor the plant.'),
  S('10',2,'What is the biggest flower called?',['rafflesia','Rafflesia'],'Rafflesia in Mizoram is the biggest flower.'),
  M('11',3,'Which grass lives for more than one year?','Bamboo',[('Wheat','Wheat is yearly'),('Paddy','Paddy is a seasonal crop')],'Bamboo is a special grass that lives longer.'),
  M('12',3,'How can we recognise a fruit with our eyes closed?','By its smell',[('By its colour','Colour needs eyes'),('By its shadow','Shadow needs eyes')],'Smell tells us a lot.')],
 svgs=[('c3-plant-parts','A plant with its roots, stem, leaf, flower and fruit labelled','The parts of a plant.')],
 keep=['tree','shrub','herb','climber','creeper'])
