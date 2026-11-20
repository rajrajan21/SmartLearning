import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=4,subj="evs",subj_file="evs")
def L(ch,slug,en,story,exp,terms,ex,claim,summ,quiz): T(M,ch,slug,en,story,exp,terms,ex,claim,summ,quiz)
L("living-together","respecting-differences-and-equality","Respecting differences and treating everyone equally","Meena's class has children who speak different languages and eat different foods.\n\"We are different but equal,\" said her teacher.",
 ["People differ in language, food, clothes and religion. Some people also have special needs, such as difficulty seeing or walking.","Everyone deserves respect and equal chances. We should not tease or leave anyone out.","Helping a friend with special needs and including everyone makes a school kind."],
 ["respect","equal","include"],("How can we include a new classmate?",[("Greet them warmly.","Greet."),("Invite them to play.","Play."),("Help them settle in.","Help.")]),
 ("it is fine to tease someone who is different.",["Everyone deserves respect.","Teasing hurts."],["Unkindness."]),
 ["Respect differences.","Include everyone."],
 ["m|People are different in|language and food|nothing|everything is same|Different.","t|Everyone deserves respect.|T|Yes.","m|A new classmate should be|included|teased|ignored|Include.","t|It is fine to tease someone different.|F|No.","m|We help a friend with special needs by|being kind|laughing|leaving|Kind.","s|Treating everyone the same is called ___ . One word.|equality|Equality.","m|A kind school|includes everyone|leaves some out|fights|Kind.","t|We are different but equal.|T|Yes."])
L("exploring-our-neighbourhood","reading-a-simple-map","Reading a simple map","Ravi drew a map of the way from his house to school.\n\"A map shows places from above,\" he said.",
 ["A map is a drawing of a place as seen from above. It uses symbols for roads, houses, parks and shops.","A key tells what each symbol means. Directions north, south, east and west help us find places.","We can draw our own map with landmarks like the temple, the shop and the school."],
 ["map","symbol","key"],("What does a map key tell us?",[("It lists symbols.","Symbols."),("It explains each symbol.","Meaning."),("So we can read the map.","Use.")]),
 ("a map shows a place from the side.",["A map shows the view from above.","It uses symbols."],["Wrong view."]),
 ["A map shows places from above.","The key explains symbols."],
 ["m|A map shows a place from|above|below|inside|Above.","t|A key explains symbols.|T|Yes.","m|North, south, east, west are|directions|colours|names|Directions.","t|A map shows a place from the side.|F|Above.","m|We use ___ for a school on a map.|a symbol|a song|a smell|Symbol.","s|The sun rises in the ___ . One word.|east|East.","m|Landmarks help us|find places|sleep|eat|Find.","t|We can draw our own map.|T|Yes."])
L("nature-trail","animal-adaptations-and-habitats","Animals and where they live","The camel crossed the desert slowly and the polar bear walked on ice.\n\"They live in very different places,\" said Meena.",
 ["The place where an animal lives is its habitat. Camels live in deserts, fish in water and monkeys in forests.","Animals have body parts that help them live in their habitat. A camel stores fat in its hump and has wide feet for sand. A polar bear has thick fur against the cold.","If a habitat is destroyed, animals lose their homes."],
 ["habitat","desert","adapt"],("How does a camel suit the desert?",[("It stores fat in its hump.","Fat."),("It has wide feet for sand.","Feet."),("It can go without water for days.","Water.")]),
 ("a polar bear can live easily in a hot desert.",["Thick fur suits cold places.","Heat is unsuitable."],["Wrong habitat."]),
 ["Animals suit their habitats.","Protect habitats."],
 ["m|A camel lives in the|desert|sea|snow|Desert.","t|A habitat is where an animal lives.|T|Yes.","m|A polar bear has|thick fur|wings|gills|Cold.","t|A polar bear suits a hot desert.|F|Cold.","m|A fish lives in|water|sand|trees|Water.","s|The camel stores fat in its ___ . One word.|hump|Hump.","m|Destroying habitats|harms animals|helps them|does nothing|Harm.","t|Animals have parts that suit their home.|T|Yes."])
L("growing-up-with-nature","animal-life-cycles-compared","Animal life cycles compared","Raju saw a caterpillar become a butterfly.\n\"It changed so much!\" he said.",
 ["A butterfly goes from egg to caterpillar to pupa to butterfly. A frog goes from egg to tadpole to young frog to adult frog.","A hen lays eggs and a chick hatches. A dog gives birth to puppies that drink milk.","Different animals grow in different ways but all grow, reproduce and age."],
 ["egg","larva","pupa"],("Order the butterfly's life.",[("It starts as an egg.","Egg."),("It becomes a caterpillar then a pupa.","Middle."),("It becomes a butterfly.","End.")]),
 ("a tadpole becomes a butterfly.",["A tadpole becomes a frog.","A caterpillar becomes a butterfly."],["Mixing."]),
 ["Life cycles differ.","All living things grow."],
 ["m|A caterpillar becomes a|butterfly|frog|bird|Butterfly.","t|A tadpole becomes a frog.|T|Yes.","m|A hen lays|eggs|puppies|seeds|Eggs.","t|A tadpole becomes a butterfly.|F|Frog.","m|A puppy drinks|milk|nectar|nothing|Milk.","s|A butterfly's first stage is an ___ . One word.|egg|Egg.","m|The resting stage is the|pupa|egg|adult|Pupa.","t|All animals grow and change.|T|Yes."])
L("food-for-health","preserving-and-storing-food","Preserving and storing food","Asha's grandmother dried mangoes into pickles and papads.\n\"This keeps food from spoiling,\" she said.",
 ["Food spoils because tiny germs grow on it. Heat, moisture and time help them.","We keep food fresh by drying, salting, pickling, cooling in the fridge and covering it.","Do not eat food that smells bad or has mould."],
 ["spoil","preserve","fridge"],("Name three ways to keep food fresh.",[("Dry it in the sun.","Dry."),("Keep it in the fridge.","Cool."),("Pickle it with salt and oil.","Pickle.")]),
 ("food never spoils if left open.",["Open food gathers germs.","It spoils."],["Ignoring germs."]),
 ["Germs spoil food.","Dry, cool and cover to preserve."],
 ["m|Germs make food|spoil|taste better forever|vanish|Spoil.","t|A fridge keeps food cool.|T|Yes.","m|Pickling uses|salt and oil|ice|paper|Pickle.","t|Open food never spoils.|F|It does.","m|Mouldy food should be|thrown away|eaten|sold|Unsafe.","s|Drying mangoes uses the ___ . One word.|sun|Sun.","m|Covering food keeps off|germs and flies|rain only|nothing|Cover.","t|Papads are dried foods.|T|Yes."])
L("happy-and-healthy-living","first-aid-and-feeling-ill","First aid and feeling ill","Raju fell and scraped his knee in the playground.\n\"Wash it and tell the teacher,\" said Meena.",
 ["First aid is the first help given to an injured person. For a small cut we wash with clean water and cover it with a clean bandage.","We should tell an elder at once. For a serious hurt we call a doctor or the emergency number.","A first-aid box holds bandages, cotton, antiseptic and a thermometer."],
 ["first aid","bandage","doctor"],("What do we do for a small cut?",[("Wash with clean water.","Wash."),("Cover with a clean bandage.","Cover."),("Tell an elder.","Tell.")]),
 ("we should hide an injury from elders.",["Tell an elder at once.","Help comes sooner."],["Hiding."]),
 ["Wash and cover small cuts.","Tell an elder."],
 ["m|First aid is|first help|a game|a meal|Help.","t|A bandage covers a cut.|T|Yes.","m|For a small cut we first|wash it|ignore it|rub dirt|Clean.","t|We should hide an injury.|F|Tell.","m|A first-aid box has|bandages|toys only|sweets|Box.","s|We tell an ___ about an injury. One word.|elder|Elder.","m|Serious hurt needs a|doctor|nap|toy|Doctor.","t|Clean water washes a cut.|T|Yes."])
L("how-things-work","energy-and-everyday-machines","Energy and everyday machines","The ceiling fan turned when Meena pressed the switch.\n\"What makes it move?\" she asked.",
 ["Machines need energy to work. Electricity runs fans and lights. Fuel runs buses. Our body energy turns a cycle's pedals.","Sun, wind and water give clean energy. Wind turns a windmill and the sun heats a solar cooker.","We should save energy by switching off fans and lights when not needed."],
 ["energy","electricity","fuel"],("Name two sources of energy.",[("The sun gives light and heat.","Sun."),("Wind turns windmills.","Wind."),("Fuel runs vehicles.","Fuel.")]),
 ("machines run without any energy.",["Machines need energy.","Fans need electricity."],["No energy."]),
 ["Machines need energy.","Save energy."],
 ["m|A fan uses|electricity|stones|sand|Power.","t|The sun is a source of energy.|T|Yes.","m|A bus runs on|fuel|water only|air|Fuel.","t|Machines run without energy.|F|Need it.","m|Wind turns a|windmill|book|pencil|Wind.","s|We switch off lights to save ___ . One word.|energy|Energy.","m|A solar cooker uses|sunlight|ice|oil only|Sun.","t|We should save electricity.|T|Yes."])
L("how-things-are-made","making-paper-and-pottery","Making paper, pottery and bricks","Ravi visited a potter who shaped a pot on a wheel.\n\"It starts as clay,\" said the potter.",
 ["Paper is made from wood pulp or old paper that is mashed, spread flat and dried. Reusing paper saves trees.","A potter shapes wet clay on a wheel and bakes the pot in a kiln. Bricks are made from clay baked in a kiln.","Handmade things take skill and time."],
 ["pulp","kiln","clay"],("How is a clay pot made?",[("Wet clay is shaped.","Shape."),("It is dried.","Dry."),("It is baked in a kiln.","Bake.")]),
 ("pots are made of paper.",["Pots are made of clay.","Paper is made from pulp."],["Wrong material."]),
 ["Paper comes from pulp.","Clay is baked in a kiln."],
 ["m|Paper is made from|pulp|stone|oil|Pulp.","t|Clay pots are baked.|T|Yes.","m|A kiln is used to|bake clay|boil milk|cut wood|Kiln.","t|Pots are made of paper.|F|Clay.","m|Bricks are made of|clay|iron|glass|Clay.","s|The potter uses a ___ to shape a pot. One word.|wheel|Wheel.","m|Reusing paper saves|trees|sand|stones|Trees.","t|Handmade things need skill.|T|Yes."])
L("different-lands-different-lives","festivals-and-work-in-different-lands","Work and festivals in different lands","Asha's cousin in a fishing village goes out to sea, while her uncle in a hill village grows tea.\n\"Everyone works differently,\" said Asha.",
 ["People's work depends on where they live. Fishing in coastal areas, farming in plains, tea growing on hills and herding in deserts.","Places also have their own festivals and crafts. Coastal people celebrate boat festivals and hill people celebrate harvest.","All kinds of work are important."],
 ["coast","hills","plains"],("What work is common on the coast?",[("Fishing.","Fish."),("Boat making.","Boats."),("Selling the catch.","Selling.")]),
 ("people everywhere do the same work.",["Work depends on the place.","Coast, hills and plains differ."],["No difference."]),
 ["Work depends on place.","All work matters."],
 ["m|Fishing is common on the|coast|moon|desert|Coast.","t|Tea grows on hills.|T|Yes.","m|Farming is common on|plains|ice|oceans|Plains.","t|People everywhere do the same work.|F|Different.","m|All kinds of work are|important|useless|funny|Respect.","s|People who catch fish are called ___ . One word.|fishermen|Fishermen.","m|Herding is common in|deserts|oceans|cities only|Herd.","t|Festivals differ in places.|T|Yes."])
L("our-sky","planets-and-the-solar-system","The Sun, planets and the solar system","Meena saw a bright star at dusk that her teacher said was a planet.\n\"It was Venus,\" he said.",
 ["The Sun is a star at the centre of our solar system. Eight planets go around it, including Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.","Earth is the only planet known to have life. The Moon goes around Earth.","Planets do not make their own light; they shine by sunlight."],
 ["solar system","planet","star"],("Name the planet we live on.",[("We live on Earth.","Earth."),("It goes around the Sun.","Orbit."),("The Moon goes around it.","Moon.")]),
 ("the Sun is a planet.",["The Sun is a star.","Planets go around it."],["Mixing star and planet."]),
 ["The Sun is a star.","Eight planets orbit it."],
 ["m|The Sun is a|star|planet|moon|Star.","t|Earth goes around the Sun.|T|Yes.","m|Planets in our solar system|8|2|20|Eight.","t|The Sun is a planet.|F|Star.","m|The Moon goes around|Earth|Mars|Sun directly|Moon.","s|The planet we live on is ___ . One word.|Earth|Earth.","m|Planets shine by|sunlight|own fire|batteries|Reflect.","t|Earth has life.|T|Yes."])
