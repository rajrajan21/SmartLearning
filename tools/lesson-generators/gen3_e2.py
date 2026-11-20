import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=3,subj="evs",subj_file="evs")
T(M,"family-and-friends","friends-and-neighbours","Friends and neighbours","Meena's neighbour Rani lives next door. They walk to school together and share their lunch.\n\"A good friend helps,\" said Meena.",
 ["A friend is someone we like to play and share with. A neighbour is someone who lives near us.","Good friends are kind, share things and help each other. They say sorry when they make a mistake.","Neighbours help us in need, like when someone is ill. We should be polite to everyone around us."],
 ["friend","neighbour","kind"],("Name two ways to be a good friend.",[("Share what we have.","Sharing."),("Help when a friend needs us.","Helping."),("Say sorry for mistakes.","Sorry.")]),
 ("neighbours are strangers we should never talk to.",["Neighbours live near us and often help.","Be polite and careful with strangers."],["Mixing neighbours with strangers."]),
 ["Friends are kind and share.","Neighbours live near us."],
 ["m|A neighbour is someone who|lives near us|lives far away|is a stranger|Near.","t|Good friends share.|T|Yes.","m|A good friend|helps others|hits others|hides things|Help.","t|We say sorry after a mistake.|T|Yes.","m|Neighbours help when we are|in need|asleep|at school|Help.","s|Someone who lives next door is a ___ (one word).|neighbour;neighbor|Neighbour.","m|Sharing shows we are|kind|angry|lazy|Kind.","t|Neighbours never help.|F|They do."])
T(M,"going-to-the-mela","things-we-see-and-buy-at-a-fair","Things we see and buy at a fair","At the village fair there were toys, sweets, swings and bangles.\n\"I want to buy a balloon,\" said Raju.",
 ["A fair or mela is a place where many people meet. There are shops, games, rides and food stalls.","Shopkeepers sell things and we pay money to buy them. We must count our money carefully.","We should keep close to our family at a crowded fair and throw waste in the dustbin."],
 ["fair","shop","money"],("Raju has 20 rupees. A balloon costs 5 rupees. How much is left?",[("Money is 20.","Start."),("Balloon costs 5.","Cost."),("20 minus 5 is 15 rupees.","Left.")]),
 ("it is fine to wander away from the family at a fair.",["Stay with the family in a crowd.","We could get lost."],["Wandering off."]),
 ["A fair has shops and rides.","Stay with family."],
 ["m|A fair is a place where|many people meet|nobody goes|only animals live|Crowd.","t|We pay money to buy things.|T|Yes.","m|At a crowded fair we should|stay with family|run away|hide|Safe.","t|We should throw waste in the dustbin.|T|Yes.","m|A person who sells things is a|shopkeeper|doctor|pilot|Seller.","s|20 rupees minus 5 rupees is? Write only the number.|15|20-5.","m|A mela is another word for|fair|school|house|Fair.","t|At a fair we should wander alone.|F|Stay with family."])
T(M,"celebrating-festivals","festivals-of-different-religions","Festivals of different religions","Meena's family celebrates Pongal. Her friend Salma celebrates Eid and Joseph celebrates Christmas.\n\"We all share sweets,\" said Meena.",
 ["India has many festivals. Diwali, Pongal, Eid, Christmas, Onam and Gurupurab are celebrated by different people.","On festival days we wear new clothes, make special food and meet family and friends.","We can enjoy each other's festivals and respect all customs."],
 ["festival","celebrate","respect"],("Match a festival with the season: Pongal.",[("Pongal is a harvest festival.","Harvest."),("It comes in January.","Month."),("Farmers thank the sun and cattle.","Thanks.")]),
 ("we should only enjoy our own festival.",["We can enjoy all festivals.","We respect everyone's customs."],["Narrow view."]),
 ["India has many festivals.","Respect all customs."],
 ["m|Pongal is a|harvest festival|school day|sport|Harvest.","t|People of many religions live in India.|T|Yes.","m|On Eid people share|sweet dishes|homework|trash|Food.","t|We should respect all festivals.|T|Yes.","m|Christmas is celebrated by|Christians|only farmers|only children|Christians.","s|Which festival of lights comes in autumn? Write one word.|diwali|Diwali.","m|On festival days we wear|new clothes|school uniform only|nothing|New.","t|Only one festival is celebrated in India.|F|Many."])
T(M,"getting-to-know-plants","roots-stems-and-leaves","Roots, stems and leaves","Ravi pulled a small weed from the garden and saw its white roots.\n\"What do roots do?\" he asked.",
 ["Roots hold the plant in the soil and take in water. The stem holds the plant up and carries water to the leaves.","Leaves make food for the plant using sunlight. Flowers make seeds and fruits.","Some plants are small herbs, some are tall trees and some are creepers that climb."],
 ["root","stem","leaf"],("Which part carries water up the plant?",[("Roots take in water.","Roots."),("The stem carries it up.","Stem."),("The stem carries water to the leaves.","Answer.")]),
 ("leaves hold the plant in the soil.",["Roots hold the plant.","Leaves make food."],["Mixing roots and leaves."]),
 ["Roots hold and drink.","Stem carries water.","Leaves make food."],
 ["m|Roots take in|water|light|sound|Water.","t|Leaves make food.|T|Yes.","m|The stem|carries water|makes seeds|lives in water only|Carry.","t|Roots hold the plant in the soil.|T|Yes.","m|Which is a tall plant?|tree|grass|moss|Tall.","s|Which part makes food? Write one word.|leaf;leaves|Leaf.","m|A plant that climbs is a|creeper|tree|shrub|Climb.","t|Leaves hold the plant in the soil.|F|Roots."])
T(M,"plants-and-animals-live-together","animal-homes-and-food","Animal homes and food","A bird built a nest in the tree near Meera's window.\n\"Where do animals live?\" she asked.",
 ["Animals live in different homes. Birds live in nests, bees in hives, fish in water and rabbits in burrows.","Some animals eat plants and are called herbivores. Some eat other animals and are called carnivores. Some eat both and are omnivores.","Animals are safe in their homes and raise their young there."],
 ["herbivore","carnivore","home"],("Name an animal and its home.",[("A bird lives in a nest.","Bird."),("A bee lives in a hive.","Bee."),("A fish lives in water.","Fish.")]),
 ("all animals eat meat.",["Some eat plants, some meat, some both.","These are herbivores, carnivores and omnivores."],["One diet."]),
 ["Animals have homes.","Herbivore, carnivore, omnivore."],
 ["m|A bee lives in a|hive|nest|burrow|Hive.","t|Fish live in water.|T|Yes.","m|An animal that eats only plants|herbivore|carnivore|omnivore|Plants.","t|A bird builds a nest.|T|Yes.","m|A tiger is a|carnivore|herbivore|plant|Meat.","s|A rabbit lives in a ___ . One word.|burrow|Burrow.","m|An animal that eats plants and meat|omnivore|herbivore|carnivore|Both.","t|All animals eat meat.|F|Not all."])
T(M,"living-in-harmony","taking-care-of-plants-and-animals","Taking care of plants and animals","Asha waters the plants every morning and puts out water for the birds.\n\"They need care too,\" she said.",
 ["Plants need water, light and air. We should water them and not break their branches.","Animals need food, water and a safe place. We should not hurt them or throw stones at them.","Planting trees and keeping bowls of water for birds helps nature."],
 ["care","protect","nature"],("Name two ways to care for plants.",[("Water them.","Water."),("Do not break the branches.","Protect."),("Plant new ones.","Plant.")]),
 ("it is fun to throw stones at animals.",["Animals feel pain.","We should be kind."],["Hurting animals."]),
 ["Care for plants and animals.","Be kind to nature."],
 ["m|Plants need water and|light|plastic|noise|Light.","t|We should be kind to animals.|T|Yes.","m|We help birds by keeping|water|stones|noise|Help.","t|We should break branches.|F|No.","m|Planting trees helps|nature|nothing|only dogs|Nature.","s|Plants need water, light and ___. One word.|air|Air.","m|Animals need a safe|place|toy|book|Place.","t|Throwing stones at animals is kind.|F|No."])
T(M,"water-a-precious-gift","sources-and-uses-of-water","Sources and uses of water","Ravi's grandmother brings water from the hand pump near the village.\n\"Where does the water come from?\" he asked.",
 ["We get water from rivers, wells, ponds, lakes, rain and taps. Water from the sea is salty and we cannot drink it.","We use water to drink, cook, wash, bathe and water plants.","Water should be clean for drinking. We boil or filter it to make it safe."],
 ["river","well","safe water"],("Name three uses of water.",[("To drink.","Drink."),("To cook and wash.","Cook and wash."),("To water plants.","Plants.")]),
 ("sea water is good to drink.",["Sea water is salty.","We drink clean fresh water."],["Drinking salty water."]),
 ["Water comes from rivers, wells, rain.","Drink only clean water."],
 ["m|Which is a source of water?|river|stone|chair|River.","t|We use water to cook.|T|Yes.","m|Clean drinking water is|boiled or filtered|muddy|salty|Safe.","t|Sea water is good for drinking.|F|Salty.","m|Rain water falls from|clouds|ground|trees|Rain.","s|A hole dug to get water is a ___ . One word.|well|Well.","m|We use water to|drink and cook|only play|nothing|Uses.","t|Water from a pond may need cleaning before use.|T|Yes."])
T(M,"food-we-eat","where-our-food-comes-from","Where our food comes from","Meena's mother bought rice, vegetables and milk from the market.\n\"Where do these come from?\" asked Meena.",
 ["Food comes from plants and animals. Rice, wheat and vegetables come from plants. Milk and eggs come from animals.","Farmers grow crops in fields. Milk comes from cows and buffaloes. Fish come from rivers and the sea.","We should not waste food because many people work to bring it to us."],
 ["crop","farmer","grain"],("Name two foods from plants and two from animals.",[("Rice and vegetables from plants.","Plants."),("Milk and eggs from animals.","Animals."),("Both give us food.","Both.")]),
 ("milk comes from plants.",["Milk comes from animals.","Cows and buffaloes give milk."],["Wrong source."]),
 ["Food comes from plants and animals.","Do not waste food."],
 ["m|Rice comes from|plants|animals|metal|Plants.","t|Eggs come from animals.|T|Yes.","m|A person who grows crops|farmer|baker|driver|Farmer.","t|Milk comes from plants.|F|Animals.","m|Which comes from animals?|milk|wheat|beans|Milk.","s|Who gives us milk: cow or tree? Write one word.|cow|Cow.","m|We should not|waste food|eat food|grow food|Waste.","t|Wheat is a grain.|T|Yes."])
T(M,"staying-healthy-and-happy","good-habits-and-exercise","Good habits and exercise","Ravi wakes early, brushes his teeth, plays outside and sleeps on time.\n\"Good habits keep us strong,\" said his mother.",
 ["Good habits keep us healthy. We should brush our teeth twice a day, bathe daily and wash our hands before eating.","Playing and exercise make our body strong. We need 9 to 10 hours of sleep to rest.","We feel happy when we play, eat well and spend time with family."],
 ["habit","exercise","sleep"],("Name three good habits.",[("Brush teeth twice a day.","Teeth."),("Wash hands before eating.","Hands."),("Sleep on time.","Sleep.")]),
 ("we should not wash hands before eating.",["Washing removes germs.","It keeps us from falling ill."],["Skipping handwashing."]),
 ["Good habits keep us healthy.","Exercise and sleep matter."],
 ["m|We should brush our teeth|twice a day|never|once a week|Twice.","t|Exercise makes the body strong.|T|Yes.","m|Before eating we wash|hands|shoes|bags|Hands.","t|Sleep is not important.|F|Important.","m|Good habits keep us|healthy|sick|angry|Healthy.","s|We bathe every ___ . One word.|day|Daily.","m|We need to sleep about|9 to 10 hours|2 hours|20 hours|Enough.","t|Playing outside is good for us.|T|Yes."])
T(M,"this-world-of-things","materials-hard-soft-and-rough","Hard, soft and rough things","Meena touched a stone, a pillow and a piece of cloth.\n\"They all feel different,\" she said.",
 ["Things can be hard like stone or soft like cotton. Some are rough like sandpaper and some smooth like glass.","Some things float on water like wood and some sink like stone. Some are shiny like metal and some dull.","We pick the material that suits the use. A pillow is soft and a pot is made of metal."],
 ["hard","soft","float","sink"],("Does a stone float or sink?",[("A stone is heavy for its size.","Heavy."),("It goes down in water.","Sinks."),("A stone sinks.","Answer.")]),
 ("a pillow is made of stone.",["A pillow is soft.","Stone is hard."],["Wrong material."]),
 ["Things are hard, soft, rough or smooth.","Some float and some sink."],
 ["m|Which is soft?|cotton|stone|iron|Soft.","t|Wood floats on water.|T|Yes.","m|Which sinks?|stone|leaf|cork|Sinks.","t|Sandpaper is smooth.|F|Rough.","m|Glass is|smooth|rough|soft|Smooth.","s|Does a coin float or sink? Write one word.|sink|Sinks.","m|A pot is made of|metal|cotton|paper|Metal.","t|We choose materials that suit the use.|T|Yes."])
T(M,"making-things","making-a-clay-pot","Making a clay pot","A potter in Meena's village made pots from clay.\n\"How is it made?\" she asked.",
 ["A potter takes wet clay and shapes it on a wheel. The pot is dried in the sun.","Then it is baked in a hot kiln so it becomes hard and strong.","The pot can be painted and used to store water, which stays cool inside."],
 ["clay","wheel","kiln"],("List the steps of making a pot.",[("Shape wet clay on the wheel.","Shape."),("Dry it in the sun.","Dry."),("Bake it in the kiln.","Bake.")]),
 ("a pot is made without baking.",["Baking makes the pot hard.","Without it the pot would break."],["Skipping baking."]),
 ["Shape, dry, bake.","Clay pots keep water cool."],
 ["m|A pot is made from|clay|iron|paper|Clay.","t|A pot is baked in a kiln.|T|Yes.","m|First the potter|shapes wet clay|paints|sells|Shape.","t|Clay pots keep water cool.|T|Yes.","m|A potter's machine is the|wheel|pen|ball|Wheel.","s|Where is a pot baked? Write one word.|kiln|Kiln.","m|After shaping the pot is|dried|thrown|sold|Dry.","t|A pot is not baked.|F|It is baked."])
T(M,"taking-charge-of-waste","sorting-wet-and-dry-waste","Sorting wet and dry waste","Meena's school has two bins: a green one and a blue one.\n\"Why two bins?\" asked Raju.",
 ["Wet waste is food scraps, vegetable peels and leaves. Dry waste is paper, plastic, metal and glass.","We keep them in separate bins. Wet waste can be made into compost for plants.","Dry waste like paper and plastic can be sent for recycling."],
 ["wet waste","dry waste","compost"],("Sort: banana peel, paper, plastic bottle.",[("Banana peel is wet waste.","Wet."),("Paper is dry waste.","Dry."),("Plastic bottle is dry waste.","Dry.")]),
 ("all waste can go in one bin.",["Sorting helps recycling.","Wet waste makes compost."],["Mixing waste."]),
 ["Sort waste into wet and dry.","Compost wet waste."],
 ["m|A banana peel is|wet waste|dry waste|metal|Wet.","t|Paper is dry waste.|T|Yes.","m|Wet waste can become|compost|plastic|glass|Compost.","t|We should mix wet and dry waste.|F|Separate.","m|Plastic is|dry waste|wet waste|food|Dry.","s|Vegetable peels are ___ waste. One word.|wet|Wet.","m|Paper can be|recycled|eaten|drunk|Recycle.","t|Sorting waste is good.|T|Yes."])
