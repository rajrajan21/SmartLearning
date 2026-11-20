import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=4,subj="evs",subj_file="evs")
T(M,"living-together","rules-rights-and-responsibilities","Rules and responsibilities","In Anu's school, everyone lines up, keeps the class clean and helps the new student.\n\"Rules help everyone,\" said the teacher.",
 ["Rules help people live together peacefully. Every home, school and village has rules.","Each person has rights, such as the right to learn and play, and responsibilities, such as caring for shared places.","When we follow rules, share and help, our community becomes happy and safe."],
 ["rule","right","responsibility"],("Name a right and a responsibility of a student.",[("Right: to learn.","Right."),("Responsibility: keep the class clean.","Duty."),("Both matter.","Both.")]),
 ("rules only limit us and do not help.",["Rules keep everyone safe.","They help us live together."],["Rules as only limits."]),
 ["Rules help us live together.","Rights come with responsibilities."],
 ["m|Rules help us|live peacefully|fight|waste time|Peace.","t|Every school has rules.|T|Yes.","m|A student's right is to|learn|litter|fight|Learn.","t|We have responsibilities too.|T|Yes.","m|Keeping the class clean is a|responsibility|rule of the sea|game|Duty.","s|Something we must do for others is a ___. One word.|responsibility;duty|Duty.","m|Rules keep people|safe|angry|lost|Safe.","t|Rules are useless.|F|Useful."])
T(M,"exploring-our-neighbourhood","local-helpers-and-services","Local helpers and services","Raju saw the postman, the doctor and the vegetable seller on his street.\n\"They all help us,\" he said.",
 ["Many people serve our neighbourhood: the postman brings letters, the doctor treats us, the teacher teaches and the sweeper cleans.","Places like the hospital, school, post office and market give us services.","We should thank helpers and respect their work."],
 ["helper","service","neighbourhood"],("Match helper and work: postman.",[("The postman brings letters.","Work."),("He works for the post office.","Place."),("We thank him.","Thanks.")]),
 ("only doctors are real helpers.",["Every worker helps.","All jobs are important."],["Ranking jobs."]),
 ["Helpers serve us.","Thank and respect them."],
 ["m|The postman brings|letters|milk|doctors|Letters.","t|A sweeper helps keep the street clean.|T|Yes.","m|A doctor|treats illness|delivers mail|teaches maths|Doctor.","t|Only doctors are helpers.|F|All are.","m|A hospital gives|treatment|letters|food|Care.","s|Who brings letters? Write one word.|postman|Postman.","m|We should ___ helpers.|thank|ignore|laugh at|Thank.","t|All jobs are important.|T|Yes."])
T(M,"nature-trail","trees-birds-and-insects-we-see","Trees, birds and insects we see","On the nature trail Anu saw a neem tree, a crow and many ants.\n\"Write what you see,\" said the teacher.",
 ["On a nature trail we look carefully at trees, birds and insects. We note leaves, bark and flowers of trees.","Birds have feathers and beaks. Insects have six legs and three body parts.","We should not pluck flowers or disturb nests. We observe quietly and leave nature as it was."],
 ["trail","observe","insect"],("How many legs does an insect have?",[("An ant is an insect.","Example."),("It has six legs.","Count."),("All insects have 6 legs.","Answer.")]),
 ("a spider is an insect.",["Insects have six legs.","Spiders have eight."],["Mixing spiders and insects."]),
 ["Observe quietly.","Insects have 6 legs."],
 ["m|An insect has|6 legs|4 legs|8 legs|Six.","t|Birds have feathers.|T|Yes.","m|A neem is a|tree|bird|insect|Tree.","t|We should pluck flowers on a trail.|F|No.","m|On a trail we|observe|shout|litter|Observe.","s|Legs of an ant? Write only the number.|6;six|Six.","m|Birds use a ___ to eat.|beak|trunk|fin|Beak.","t|Spiders have 8 legs.|T|Yes."])
T(M,"growing-up-with-nature","seeds-and-how-they-travel","Seeds and how they travel","Anu blew on a dandelion and the seeds flew away.\n\"How do seeds go far?\" she asked.",
 ["A seed grows into a new plant when it gets water, air and warmth. Plants make seeds in their fruits and flowers.","Seeds travel by wind like the dandelion, by water like the coconut, by animals who carry them and by bursting pods.","Travelling far gives each new plant space to grow."],
 ["seed","germinate","disperse"],("How does a coconut travel?",[("A coconut floats on water.","Floats."),("The water carries it far.","Travel."),("Coconut travels by water.","Answer.")]),
 ("seeds never move from the parent plant.",["Seeds travel by wind, water and animals.","They grow far away."],["Seeds do not travel."]),
 ["Seeds need water, air and warmth.","Seeds travel in many ways."],
 ["m|A coconut travels by|water|wind|animals|Floats.","t|Dandelion seeds travel by wind.|T|Yes.","m|A seed needs|water|plastic|iron|Water.","t|Seeds never travel.|F|They do.","m|Some seeds stick to|animals|stones|sand only|Animals.","s|Seeds grow into new ___ . One word.|plants;plant|Plants.","m|Pods that burst throw seeds|far|nowhere|inside|Far.","t|Seeds come from fruits and flowers.|T|Yes."])
T(M,"food-for-health","food-hygiene-and-safe-water","Food hygiene and safe water","Raju washed the fruit before eating it and covered the leftover food.\n\"Clean food keeps us healthy,\" said Mother.",
 ["Dirty food and water can cause illness. We wash hands, fruits and vegetables before eating.","We cover cooked food, store it safely and drink boiled or filtered water.","Food left too long gets spoiled. We should not eat stale food."],
 ["hygiene","germs","stale"],("Name three ways to keep food safe.",[("Wash hands and fruit.","Wash."),("Cover cooked food.","Cover."),("Drink safe water.","Water.")]),
 ("it is fine to eat food left open for days.",["Stale food can make us ill.","Cover and store food."],["Eating stale food."]),
 ["Wash and cover food.","Drink safe water."],
 ["m|We wash fruit to remove|germs|colour|taste|Germs.","t|Cover cooked food.|T|Yes.","m|Safe drinking water is|boiled or filtered|muddy|salty|Safe.","t|Stale food is safe.|F|No.","m|Dirty food can cause|illness|growth|sleep|Ill.","s|We wash our ___ before eating. One word.|hands|Hands.","m|Food kept open for days becomes|stale|fresh|new|Stale.","t|Hygiene keeps us healthy.|T|Yes."])
T(M,"happy-and-healthy-living","safety-at-home-road-and-play","Safety at home, on the road and at play","Meena looked both ways before crossing the road with her father.\n\"Stay safe,\" he said.",
 ["At home we keep sharp things and medicines away and never touch switches with wet hands.","On the road we walk on the footpath, cross at the zebra crossing and look both ways. Red means stop and green means go.","While playing we avoid pushing and follow the game rules."],
 ["safety","zebra crossing","traffic light"],("What do the traffic light colours mean?",[("Red means stop.","Red."),("Yellow means get ready.","Yellow."),("Green means go.","Green.")]),
 ("we can cross the road anywhere.",["Cross at the zebra crossing.","Look both ways."],["Careless crossing."]),
 ["Look both ways.","Red stop, green go."],
 ["m|Red light means|stop|go|run|Stop.","t|We cross at the zebra crossing.|T|Yes.","m|Before crossing we|look both ways|run|close eyes|Look.","t|We touch switches with wet hands.|F|Never.","m|We walk on the|footpath|road|track|Footpath.","s|Green light means? Write one word.|go|Go.","m|Keep sharp things|away|near babies|in bed|Away.","t|Follow rules while playing.|T|Yes."])
T(M,"how-things-work","levers-wheels-and-pulleys","Levers, wheels and pulleys","Ravi used a long stick to lift a heavy stone easily.\n\"A lever helps,\" said his uncle.",
 ["A lever is a bar that turns on a fixed point. A seesaw and a crowbar are levers. They make work easier.","A wheel and axle helps things roll. A cart, a bicycle and a car use wheels.","A pulley is a wheel with a rope used to lift things up, like drawing water from a well."],
 ["lever","wheel","pulley"],("Which machine draws water from a well?",[("A rope goes over a wheel.","Pulley."),("Pulling down lifts the bucket.","Lift."),("It is a pulley.","Answer.")]),
 ("machines make work harder.",["Machines make work easier.","They need less effort."],["Wrong idea."]),
 ["Levers, wheels and pulleys help us.","Machines make work easier."],
 ["m|A seesaw is a|lever|pulley|wheel|Lever.","t|A pulley lifts things.|T|Yes.","m|A bicycle uses|wheels|a pulley|a seesaw|Wheels.","t|Machines make work harder.|F|Easier.","m|A crowbar is a|lever|gear|rope|Lever.","s|A rope over a wheel to lift is a ___. One word.|pulley|Pulley.","m|We draw water using a|pulley|fan|balloon|Pulley.","t|A cart has wheels.|T|Yes."])
T(M,"how-things-are-made","from-cotton-to-cloth","From cotton to cloth","Anu's shirt was made of cotton.\n\"Where does cotton come from?\" she asked.",
 ["Cotton grows on a plant. Farmers pick the cotton bolls and send them to a mill.","At the mill the cotton is cleaned and spun into thread. The thread is woven into cloth on a loom.","The cloth is dyed, cut and stitched by tailors into clothes."],
 ["cotton","thread","loom"],("List the steps from cotton to shirt.",[("Pick cotton from the plant.","Pick."),("Spin it into thread and weave it into cloth.","Spin and weave."),("A tailor stitches the shirt.","Stitch.")]),
 ("cloth comes straight from the shop.",["It is made in steps.","From plant to thread to cloth."],["Skipping the steps."]),
 ["Cotton, thread, cloth, shirt.","Many people make clothes."],
 ["m|Cotton grows on a|plant|animal|stone|Plant.","t|Thread is woven into cloth.|T|Yes.","m|Cloth is woven on a|loom|wheel|pot|Loom.","t|Cloth comes from the shop without work.|F|It is made.","m|A tailor|stitches clothes|grows cotton|drives|Stitch.","s|Cotton is spun into ___ . One word.|thread|Thread.","m|First the farmer|picks cotton|weaves|stitches|Pick.","t|Clothes can be dyed.|T|Yes."])
T(M,"different-lands-different-lives","homes-food-and-clothes-in-different-places","Homes, food and clothes in different places","Anu read about a family in the desert and a family in the hills.\n\"They live differently,\" she said.",
 ["People live differently in different places. In hot deserts people wear light loose clothes and cover their heads.","In cold hills people wear woollen clothes and build homes with sloping roofs for snow.","In coastal areas many people eat fish and rice. Food and clothes depend on the weather and what grows nearby."],
 ["desert","hills","coast"],("Why do hill people wear woollen clothes?",[("Hills are cold.","Cold."),("Wool keeps us warm.","Warm."),("So they wear wool.","Answer.")]),
 ("everyone eats and dresses the same everywhere.",["People adapt to their place.","Weather and land decide."],["One way fits all."]),
 ["Life differs with the place.","Weather shapes homes, food and clothes."],
 ["m|In cold hills people wear|woollen clothes|thin cotton|nothing|Warm.","t|Coastal people often eat fish.|T|Yes.","m|Sloping roofs help with|snow|sand|wind only|Snow.","t|Everyone lives the same way.|F|Differs.","m|Desert people cover their heads against|sun|snow|rain|Sun.","s|Cold hills need ___ clothes. One word.|woollen;woolen;warm|Warm.","m|Food depends on|what grows nearby|the date|a toy|Nearby.","t|Weather affects how we live.|T|Yes."])
T(M,"our-sky","day-night-and-the-phases-of-the-moon","Day, night and the phases of the moon","Meera watched the Moon each night and drew its shape.\n\"It changes!\" she said.",
 ["Day and night happen because the Earth spins. The side facing the Sun has day, the other has night.","The Moon does not make its own light. It shines by sunlight. Its shape seems to change over a month, from a thin crescent to a full moon and back.","The new moon night is when we cannot see it. The full moon is round and bright."],
 ["rotate","crescent","full moon"],("Why do we have day and night?",[("The Earth spins.","Spin."),("The side facing the Sun has day.","Day."),("The other side has night.","Night.")]),
 ("the Moon makes its own light.",["The Moon reflects sunlight.","It does not shine by itself."],["Moon as a source of light."]),
 ["Earth spinning gives day and night.","The Moon shines by sunlight."],
 ["m|Day and night happen because Earth|spins|stops|melts|Spins.","t|The Moon shines by sunlight.|T|Yes.","m|A round bright Moon is the|full moon|new moon|crescent|Full.","t|The Moon makes its own light.|F|No.","m|The Sun is a|star|planet|moon|Star.","s|The thin Moon shape is a ___ . One word.|crescent|Crescent.","m|The side facing the Sun has|day|night|snow|Day.","t|The Moon's shape seems to change.|T|Yes."])
