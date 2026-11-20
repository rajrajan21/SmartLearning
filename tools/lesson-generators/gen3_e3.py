import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=3,subj="evs",subj_file="evs")
def L(ch,slug,en,story,exp,terms,ex,claim,summ,quiz):
    T(M,ch,slug,en,story,exp,terms,ex,claim,summ,quiz)
L("family-and-friends","families-big-and-small","Families big and small","Anu lives with her parents. Her friend Ravi lives with his grandparents, aunt and cousins.\n\"Our families are different,\" said Anu.",
 ["A family is a group of people who live together and care for each other. Some families are small and some are big.","A nuclear family has parents and children. A joint family also has grandparents, uncles, aunts and cousins.","Every family is special. Family members share work and look after one another."],
 ["family","joint family","care"],("Who may live in a joint family?",[("Parents and children.","Core."),("Grandparents too.","Elders."),("Uncles, aunts and cousins as well.","Relatives.")]),
 ("only big families are real families.",["Small families are families too.","What matters is care."],["Size confusion."]),
 ["Families can be big or small.","Family members care for each other."],
 ["m|A family is a group who|care for each other|never meet|are strangers|Care.","t|Some families are big.|T|Yes.","m|A joint family has|grandparents too|only one person|no children|Joint.","t|Only big families are real families.|F|All are.","m|Family members should|help each other|fight|ignore|Help.","s|Your mother's mother is your ___ . One word.|grandmother|Nani or Paati.","m|A small family has|parents and children|forty people|nobody|Small.","t|Every family is special.|T|Yes."])
L("going-to-the-mela","crowd-safety-and-staying-together","Staying safe in a crowd","Meena held her father's hand tightly at the crowded fair.\n\"If I get lost, what do I do?\" she asked.",
 ["In a crowd we should hold the hand of an elder and stay close. We should remember our parents' names and phone number.","If we get lost we should stand still, not go with strangers, and ask a policeman, a shopkeeper or a woman with children for help.","Helpers in uniform such as police are safe people to ask."],
 ["crowd","lost","police"],("What should you do if you are lost at a fair?",[("Stay calm and do not wander.","Calm."),("Do not go with a stranger.","Careful."),("Ask a policeman for help.","Help.")]),
 ("go with any friendly stranger if lost.",["Do not go with strangers.","Ask a policeman or a trusted helper."],["Trusting strangers."]),
 ["Hold an elder's hand.","Ask a policeman if lost."],
 ["m|In a crowd we should|hold an elder's hand|run|hide|Safe.","t|We should remember our parents' phone number.|T|Yes.","m|If lost we ask a|policeman|stranger who offers a ride|nobody|Safe.","t|We can go with any stranger.|F|No.","m|If lost we should|stay calm|panic and run|sleep|Calm.","s|Who wears a uniform and helps us? One word.|police|Police.","m|A crowd has|many people|one person|no one|Crowd.","t|Staying close to elders is safe.|T|Yes."])
L("celebrating-festivals","festival-foods-and-clothes","Festival foods, clothes and decorations","On Diwali Asha's house was full of lamps and sweets.\n\"Every festival has its own look,\" said her mother.",
 ["Festivals have special foods, clothes and decorations. We light lamps at Diwali, draw kolam at Pongal and make cakes at Christmas.","Foods differ across India because of places and crops. Sharing the food brings people together.","We should not waste food or cause pollution with too many crackers."],
 ["decoration","kolam","share"],("Name a festival and one thing we do.",[("Diwali has lamps.","Lamps."),("Pongal has kolam.","Kolam."),("Christmas has cake.","Cake.")]),
 ("festivals mean we should waste food.",["We should not waste food.","Share with others."],["Waste."]),
 ["Festivals have special food and clothes.","Do not waste or pollute."],
 ["m|At Diwali we light|lamps|ice|trees|Light.","t|Pongal has kolam.|T|Yes.","m|Christmas has|cake|kolam|crackers only|Cake.","t|We should waste food at festivals.|F|No.","m|Sharing food brings|people together|trouble|sleep|Together.","s|Drawing at the door with rice flour is called ___ . One word.|kolam|Kolam.","m|Too many crackers cause|pollution|rain|snow|Smoke.","t|Foods differ in different places.|T|Yes."])
L("getting-to-know-plants","flowers-fruits-and-seeds","Flowers, fruits and seeds","Raju cut open a mango and found a big seed inside.\n\"Will this grow into a tree?\" he asked.",
 ["Flowers grow into fruits. Fruits protect seeds and many are food for us. A seed can grow into a new plant when it gets water, warmth and soil.","Seeds travel by wind, water and animals. A coconut floats on water and a dandelion seed flies on the wind.","We can plant a seed in soil, water it and wait for a small plant to come up."],
 ["flower","fruit","seed"],("What does a seed need to grow?",[("Soil to hold it.","Soil."),("Water to wake it.","Water."),("Warmth and light.","Warmth.")]),
 ("seeds grow without water.",["Seeds need water to sprout.","Warmth also helps."],["Skipping water."]),
 ["Flowers become fruits.","Seeds need water to grow."],
 ["m|Flowers grow into|fruits|roots|stones|Fruit.","t|Seeds are inside many fruits.|T|Yes.","m|A seed needs|water|plastic|metal|Water.","t|Seeds grow without water.|F|Water needed.","m|Wind carries a|dandelion seed|stone|brick|Fly.","s|What grows from a seed? One word.|plant|Plant.","m|A coconut travels by|water|rope|rocket|Float.","t|We can grow a plant from a seed.|T|Yes."])
L("plants-and-animals-live-together","food-chains-simple","Who eats whom: a simple food chain","A grasshopper ate the grass and a frog ate the grasshopper.\n\"Everyone is eating someone,\" laughed Raju.",
 ["Plants make their own food using sunlight. Animals cannot make food, so they eat plants or other animals.","A food chain shows who eats whom: grass, grasshopper, frog, snake, eagle.","Every link in the chain matters. If one disappears, others suffer."],
 ["food chain","producer","eat"],("Make a food chain with grass.",[("Grass is eaten by a grasshopper.","Link one."),("The grasshopper is eaten by a frog.","Link two."),("The frog is eaten by a snake.","Link three.")]),
 ("animals make their own food like plants.",["Plants make food using sunlight.","Animals must eat."],["Mixing roles."]),
 ["A food chain shows who eats whom.","Plants make food."],
 ["m|Who makes food from sunlight?|plants|frogs|snakes|Plants.","t|A food chain starts with a plant.|T|Yes.","m|A frog eats a|grasshopper|rock|cloud|Insect.","t|Animals make their own food.|F|They eat.","m|After grass comes|grasshopper|moon|car|Chain.","s|A snake may eat a ___ . One word.|frog|Frog.","m|If one link is lost|others suffer|nothing changes|all vanish happily|Link.","t|Every link matters.|T|Yes."])
L("living-in-harmony","saving-trees-and-birds","Saving trees and helping birds","Meena hung a bowl of water on the balcony and saw a sparrow drink.\n\"Birds are thirsty in summer,\" she said.",
 ["Trees give shade, fruits, wood and clean air. Cutting too many trees harms birds and animals.","We can plant saplings, not waste paper and keep water for birds in summer.","Small acts together help nature."],
 ["tree","sapling","water bowl"],("How can you help birds in summer?",[("Keep a bowl of water.","Water."),("Put a few grains.","Food."),("Do not disturb nests.","Nests.")]),
 ("cutting trees never harms anyone.",["Trees give homes and clean air.","Cutting harms birds."],["Ignoring harm."]),
 ["Plant trees.","Give water to birds."],
 ["m|Trees give|shade|smoke|noise|Shade.","t|We can keep water for birds.|T|Yes.","m|A small young tree is a|sapling|brick|toy|Young.","t|Cutting trees never harms anyone.|F|Harms.","m|Saving paper saves|trees|sand|rain|Paper.","s|We plant a ___ to grow a tree. One word.|sapling|Sapling.","m|In summer birds need|water|crackers|rocks|Thirst.","t|Small acts help nature.|T|Yes."])
L("water-a-precious-gift","uses-of-water-and-saving-it","Uses of water and saving it","Ravi left the tap running while brushing.\n\"That wastes water,\" said his mother.",
 ["We use water for drinking, bathing, cooking, washing and growing plants. Animals and plants also need water.","We can save water by closing taps, fixing leaks and reusing water for plants.","Water is limited, so we must not waste it."],
 ["drink","save","leak"],("Name three ways to save water.",[("Close the tap when brushing.","Tap."),("Fix leaking pipes.","Leak."),("Reuse washing water for plants.","Reuse.")]),
 ("water never finishes so we can waste it.",["Fresh water is limited.","We must save it."],["Wasting."]),
 ["Water has many uses.","Close taps and fix leaks."],
 ["m|We should close the tap while|brushing|sleeping only|never|Save.","t|Water is limited.|T|Yes.","m|A leaking tap|wastes water|saves water|makes food|Leak.","t|We can waste water because it never ends.|F|Save.","m|Water is used for|drinking|nothing|only play|Use.","s|Dripping tap is called a ___ . One word.|leak|Leak.","m|We can reuse water for|plants|nothing|cars only|Reuse.","t|Plants need water.|T|Yes."])
L("food-we-eat","healthy-eating-and-food-groups","Healthy eating and food groups","Meena's lunchbox had rice, dal, a vegetable and a fruit.\n\"That is a balanced meal,\" said her teacher.",
 ["Food gives us energy and helps us grow. Cereals like rice and wheat give energy. Pulses and milk help us grow strong. Fruits and vegetables keep us healthy.","A balanced meal has all kinds of food. We should not eat too many sweets or fried snacks.","Wash hands before eating and wash fruits before eating."],
 ["balanced","energy","vegetable"],("Pick a balanced lunch.",[("Rice gives energy.","Energy."),("Dal helps growth.","Growth."),("Vegetables and fruit keep us healthy.","Health.")]),
 ("sweets alone make a balanced meal.",["A balanced meal has many foods.","Sweets only is not balanced."],["Only sweets."]),
 ["Eat a balanced meal.","Wash hands and fruits."],
 ["m|Rice gives us|energy|colour|sound|Cereal.","t|Fruits and vegetables keep us healthy.|T|Yes.","m|A balanced meal has|many foods|only sweets|nothing|Balance.","t|Sweets alone make a balanced meal.|F|Many foods.","m|Before eating we|wash hands|play in mud|run|Clean.","s|Dal and milk help us grow ___ . One word.|strong|Strong.","m|Too many fried snacks are|not healthy|very healthy|a medicine|Limit.","t|We should wash fruits.|T|Yes."])
L("staying-healthy-and-happy","hygiene-exercise-and-sleep","Hygiene, exercise and sleep","Asha bathes daily, plays in the evening and sleeps early.\n\"That is why I feel happy,\" she said.",
 ["To stay healthy we keep clean: bathe, brush teeth, cut nails and wash hands. We play and exercise so the body is strong.","We need enough sleep, about nine to eleven hours for children. Good food, clean water and a happy mind help too.","If we feel ill, we tell an elder and visit a doctor."],
 ["hygiene","exercise","sleep"],("List three healthy habits.",[("Wash hands often.","Clean."),("Play outside daily.","Exercise."),("Sleep early.","Rest.")]),
 ("we never need sleep if we eat well.",["Sleep helps the body rest.","Children need nine to eleven hours."],["Skipping sleep."]),
 ["Keep clean, play and sleep well.","Tell elders when ill."],
 ["m|We wash hands to|stay clean|get dirty|waste water|Hygiene.","t|Exercise makes the body strong.|T|Yes.","m|Children need about|nine to eleven hours of sleep|two hours|no sleep|Rest.","t|We never need sleep if we eat well.|F|We do.","m|If we feel ill we|tell an elder|hide it|ignore|Honest.","s|Brushing teeth keeps them ___ . One word.|clean|Clean.","m|A happy mind helps|health|nothing|only toys|Happy.","t|Playing outside is healthy.|T|Yes."])
L("this-world-of-things","materials-and-their-uses","Materials and their uses","Raju looked at his school bag, glass bottle and steel plate.\n\"Everything is made of something,\" he said.",
 ["Things are made of materials such as wood, metal, glass, plastic, cloth and paper.","A material is chosen for its use. Glass is clear so we make windows from it. Metal is strong so we make vessels. Cloth is soft so we wear it.","Some materials float on water and some sink. Some bend and some break."],
 ["material","wood","metal"],("Why are windows made of glass?",[("Glass is clear.","Clear."),("We can see through it.","See."),("It lets light in.","Light.")]),
 ("all materials are soft.",["Metal and stone are hard.","Cloth is soft."],["Same for all."]),
 ["Things are made of materials.","Materials are chosen for their use."],
 ["m|A window is made of|glass|cloth|paper|Clear.","t|Metal is strong.|T|Yes.","m|A shirt is made of|cloth|stone|glass|Soft.","t|All materials are soft.|F|Some hard.","m|A vessel is made of|metal|water|air|Strong.","s|Which material is clear? One word.|glass|Glass.","m|A chair may be made of|wood|fog|steam|Wood.","t|Some materials float.|T|Yes."])
L("making-things","making-things-from-clay-and-paper","Making things from clay, paper and waste","Meena made a pot from clay and a boat from paper.\n\"I made a toy from waste, too,\" she said.",
 ["We can make useful and beautiful things with our hands. Potters shape clay and bake pots. Paper can be folded into boats and cut into flowers.","Waste like old bottles and boxes can become pencil stands and toys, so we reuse them.","Making things needs patience and careful work."],
 ["clay","paper","reuse"],("How can an old bottle be reused?",[("Cut it neatly.","Cut."),("Decorate it.","Decorate."),("Use it as a pencil stand.","Use.")]),
 ("waste can never be used again.",["Waste can be reused.","This reduces garbage."],["Throwing away."]),
 ["We can make things with our hands.","Reuse waste."],
 ["m|A potter shapes|clay|water|air|Pot.","t|Paper can be folded into a boat.|T|Yes.","m|An old bottle can become a|pencil stand|rocket|house|Reuse.","t|Waste can never be reused.|F|It can.","m|Reusing reduces|garbage|friends|water|Less waste.","s|Making things needs ___ . One word starting with p.|patience|Patience.","m|Clay pots are|baked|frozen|eaten|Baked.","t|We can make toys from waste.|T|Yes."])
L("taking-charge-of-waste","reduce-reuse-recycle","Reduce, reuse and recycle","Raju threw plastic and vegetable peels in separate bins.\n\"That is right,\" said the teacher.",
 ["Waste is what we throw away. We can sort waste into wet waste like peels and dry waste like paper, plastic and metal.","Reduce means use less. Reuse means use again. Recycle means turn old things into new things.","Wet waste can be made into compost for plants. We should never litter."],
 ["reduce","reuse","recycle"],("Sort these: banana peel, paper, plastic bottle.",[("Banana peel is wet waste.","Wet."),("Paper is dry waste.","Dry."),("Plastic bottle is dry waste.","Dry.")]),
 ("we should throw all waste in one place and on the road.",["Do not litter.","Sort waste into bins."],["Littering."]),
 ["Reduce, reuse, recycle.","Sort wet and dry waste."],
 ["m|Banana peel is|wet waste|dry waste|metal|Peel.","t|Paper is dry waste.|T|Yes.","m|Using things again is|reuse|reduce|rot|Reuse.","t|We should litter on the road.|F|Never.","m|Wet waste can become|compost|plastic|glass|Compost.","s|Using less is called ___ . One word.|reduce|Reduce.","m|Recycling turns old things into|new things|nothing|noise|Recycle.","t|We should sort waste.|T|Yes."])
