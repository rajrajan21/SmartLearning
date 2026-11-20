from gklib import L, S, Q
L("science","solid-liquid-gas","5-7","Solid, Liquid or Gas?","Three states of matter, and how heating and cooling change one into another.","🧊",[
 S("Three states","Everything around us is made of matter, and matter comes in three common states. | A solid keeps its shape, like a stone. | A liquid flows and takes the shape of its container, like water, and a gas spreads out to fill all the space, like air.",["Solid keeps its shape","Liquid flows","Gas spreads out"],"states-of-matter"),
 S("Tiny particles","All matter is made of tiny particles. | In a solid they are packed close and only wiggle in place. | In a liquid they slide past each other, and in a gas they zoom around far apart.",["Solid: packed tight","Liquid: slide past","Gas: far apart"],"states-of-matter"),
 S("Change by heating","When you heat ice, it melts into water. | When you heat water, it boils and becomes steam. | When you cool steam it condenses to water, and when you cool water enough it freezes to ice.",["Melting","Boiling","Condensing","Freezing"],"states-of-matter"),
 S("Try it at home","Put an ice cube in a bowl and watch it melt. | Notice the puddle of water it makes. | With an adult's help, watch a covered pot of hot water make drops on the lid, that is condensation.",["Watch ice melt","Always have an adult near heat"]),
],facts=["Water is unusual because ice floats on water.","Steam itself is invisible: the white cloud you see above a kettle is tiny drops of water.","Most of the visible universe, like the Sun, is made of a fourth state called plasma."],
quiz=[Q("Which state of matter keeps its own shape?",["Solid","Liquid","Gas"],0,"A solid keeps its shape."),
Q("What is it called when water turns to ice?",["Melting","Freezing","Boiling"],1,"Freezing is liquid becoming solid."),
Q("In which state are the particles farthest apart?",["Solid","Liquid","Gas"],2,"In a gas the particles are far apart and move freely.")],tags=["matter","states"])

L("science","electric-circuits","8-10","Electric Circuits","How a battery, wires and a bulb make a closed loop, and why a switch works.","💡",[
 S("A loop for electricity","Electricity needs a complete path to flow, called a circuit. | A simple circuit has a battery or cell, wires and a bulb. | When the loop is closed the bulb lights, and when there is a gap the bulb stays dark.",["Circuit = complete path","Battery, wires, bulb"],"circuit"),
 S("Switches","A switch opens or closes the loop. | When the switch is off, there is a gap, so the electricity cannot flow. | When it is on, the gap is closed and the bulb glows.",["Switch off: open circuit","Switch on: closed circuit"],"circuit"),
 S("Conductors and insulators","Materials that let electricity pass easily are called conductors, such as copper and iron. | Materials that do not let it pass are called insulators, such as rubber, plastic and wood. | Wires are copper inside for flow and covered with plastic for safety.",["Conductors let it flow","Insulators stop it"]),
 S("Staying safe","Never put anything into a plug socket, and never touch electrical things with wet hands. | Household electricity is very strong and can be dangerous. | Practice with small batteries only, under the eye of an adult.",["Never touch sockets","Use batteries only for experiments"]),
],facts=["The electricity in our homes in India is at 230 volts, much stronger than a torch battery of 1.5 volts.","Metals such as copper and silver are very good conductors.","Lightning is a huge natural spark of electricity."],
quiz=[Q("What must a circuit have for a bulb to glow?",["A complete loop","A gap","A cover"],0,"The path must be closed all the way round."),
Q("Which material is an insulator?",["Copper","Plastic","Iron"],1,"Plastic does not let electricity pass."),
Q("What does a switch do?",["Makes or breaks the loop","Makes light","Cools wires"],0,"A switch opens or closes the circuit.")],tags=["electricity","circuit"])

L("science","atoms-the-tiny-builders","11-13","Atoms: The Tiny Builders","Everything is made of atoms. See what is inside one, and what elements are.","⚛️",[
 S("Smaller than small","All matter is made of tiny particles called atoms. | A single atom is so small that several hundred thousand of them would fit across the width of a human hair. | Atoms join together to make everything, from air to your body.",["Everything is made of atoms","Extremely tiny"],"atom"),
 S("Inside an atom","At the centre of an atom is the nucleus, made of protons and neutrons. | Protons have a positive charge, and neutrons have no charge. | Tiny electrons with a negative charge move around the nucleus.",["Nucleus: protons and neutrons","Electrons move around it"],"atom"),
 S("Elements","An element is a substance made of only one kind of atom, such as hydrogen, oxygen, iron or gold. | The number of protons decides which element an atom is. | The periodic table arranges all the known elements, and there are 118 of them.",["One kind of atom","Number of protons decides","118 known elements"]),
 S("Molecules","Atoms can join to form molecules. | Two hydrogen atoms and one oxygen atom make one molecule of water, H2O. | Changing how atoms join is what happens in a chemical reaction.",["Atoms join to make molecules","Water is H2O"]),
],facts=["Most of an atom is empty space.","The periodic table was first organised by Dmitri Mendeleev in 1869.","About ninety percent of the atoms in the Universe are hydrogen."],
quiz=[Q("What is at the centre of an atom?",["Electron","Nucleus","Molecule"],1,"The nucleus is at the centre."),
Q("Which particle has a negative charge?",["Proton","Neutron","Electron"],2,"Electrons are negative."),
Q("Water is made of...",["Two hydrogen atoms and one oxygen atom","One hydrogen and two oxygen","Only oxygen"],0,"The formula H2O means two hydrogen and one oxygen.")],tags=["atom","element","chemistry"],notes="118 is the number of elements confirmed at the time of writing; a new element would be a major discovery.")

L("maths","the-magic-of-fibonacci","11-13","The Magic of Fibonacci Numbers","1, 1, 2, 3, 5, 8, 13 ... a simple pattern that appears in flowers, shells and art.","🐚",[
 S("The sequence","Start with 1 and 1. | To get the next number, add the last two: 1 plus 1 is 2, then 1 plus 2 is 3, then 2 plus 3 is 5. | The sequence goes 1, 1, 2, 3, 5, 8, 13, 21, 34 and so on.",["Add the last two numbers","1, 1, 2, 3, 5, 8, 13, 21 ..."],"fibonacci"),
 S("Spirals","Draw squares with sides 1, 1, 2, 3, 5, 8 side by side. | Join the corners with a smooth curve and you get a spiral. | Spirals like this look similar to the shape of some shells and the heads of some flowers.",["Squares make a spiral","Similar to some shells"],"fibonacci"),
 S("In nature","The number of petals on many flowers is a Fibonacci number: lilies have 3, buttercups 5, and some daisies 34 or 55. | The seeds of a sunflower grow in spirals, and the counts of these spirals are often Fibonacci numbers. | Not everything in nature follows it exactly, but it appears often.",["Petal counts","Sunflower seed spirals"]),
 S("The golden ratio","If you divide a Fibonacci number by the one before it, you get closer and closer to about 1.618. | This number is called the golden ratio. | Artists and architects have used it for centuries, though some stories about it are exaggerated.",["Ratios approach 1.618","Golden ratio"]),
],facts=["The sequence is named after Leonardo of Pisa, known as Fibonacci, who wrote about it in 1202, though Indian mathematicians such as Pingala and Hemachandra described it earlier.","The 10th Fibonacci number is 55.","A pineapple's scales form Fibonacci-number spirals."],
quiz=[Q("What is the next number: 1, 1, 2, 3, 5, 8, ...?",["11","12","13"],2,"5 plus 8 is 13."),
Q("How do you get each Fibonacci number?",["Add the last two","Multiply by 2","Subtract 1"],0,"Each number is the sum of the two before it."),
Q("What does the ratio of neighbouring Fibonacci numbers approach?",["About 1.618","About 2","About 3.14"],0,"It approaches the golden ratio, about 1.618.")],tags=["fibonacci","patterns","nature"])

L("maths","primes-and-the-sieve","11-13","Prime Numbers and the Sieve","What primes are, why they matter and how a 2,000-year-old trick finds them.","🔢",[
 S("What is a prime?","A prime number has exactly two factors: 1 and itself. | The first primes are 2, 3, 5, 7, 11 and 13. | The number 1 is not a prime, and 2 is the only even prime.",["Exactly two factors","2, 3, 5, 7, 11, 13","2 is the only even prime"],"number-sieve"),
 S("The Sieve of Eratosthenes","Write the numbers from 2 to 50. | Circle 2 and cross out every multiple of 2. | Move to the next number that is not crossed out, 3, circle it and cross out its multiples, and keep going. The numbers left standing are primes.",["Circle a prime","Cross out its multiples","Repeat"],"number-sieve"),
 S("Why stop early?","You only need to sieve with primes up to the square root of the largest number. | For numbers up to 50 you only need 2, 3, 5 and 7. | Any number left after that cannot have a smaller factor.",["Stop at the square root"]),
 S("Why primes matter","Every whole number bigger than 1 is either a prime or can be built by multiplying primes in only one way. | That makes primes the building blocks of numbers. | Very large primes keep our online messages and bank details secret.",["Building blocks","Used in online security"]),
],facts=["Eratosthenes was a Greek scholar who lived about 2,200 years ago and also measured the size of the Earth.","There are infinitely many primes: Euclid proved this more than 2,000 years ago.","The largest known primes have tens of millions of digits."],
quiz=[Q("Which of these is a prime?",["9","11","15"],1,"11 has only the factors 1 and 11."),
Q("Which is the only even prime?",["2","4","6"],0,"Every other even number can be divided by 2."),
Q("The numbers left after sieving are...",["Primes","Squares","Even numbers"],0,"The numbers left uncrossed are the primes.")],tags=["prime","sieve"])

L("maths","pi-the-circle-number","11-13","Pi: The Circle Number","Why every circle has the same secret ratio, about 3.14.","⭕",[
 S("Circles and rulers","Take any circle and measure around its edge, called the circumference. | Now measure across the middle, called the diameter. | Divide the first by the second and you always get a number a little more than 3.",["Circumference and diameter","Their ratio is always the same"],"pi-unroll"),
 S("Meet pi","That number is called pi, written with the Greek letter π. | It is about 3.14159, and its digits go on forever without repeating. | So the circumference of a circle is pi times its diameter.",["π is about 3.14159","Circumference = π × diameter"],"pi-unroll"),
 S("Using pi","The area of a circle is pi times the radius times the radius. | If a circle has a radius of 7 centimetres, its area is about 154 square centimetres. | At school we often use 22 over 7 or 3.14 for pi.",["Area = π × r × r","22/7 or 3.14"]),
 S("A long chase","Ancient people such as the Egyptians and Babylonians found rough values of pi. | Indian mathematician Madhava of Sangamagrama found a series to calculate it in the 1300s. | Today computers have worked out trillions of its digits, and 14 March is celebrated as Pi Day.",["Many cultures worked on pi","Madhava's series","Pi Day: 14 March"]),
],facts=["Because pi has no end, 22/7 is only a close fraction, not exactly pi.","Pi appears in many places in science, not just circles, such as waves and the shape of rivers.","NASA uses only about 15 digits of pi for its space calculations."],
quiz=[Q("Pi is the ratio of the circumference to the...",["Radius","Diameter","Area"],1,"Circumference divided by diameter equals pi."),
Q("About what is the value of pi?",["2.14","3.14","4.14"],1,"Pi is about 3.14."),
Q("What is the area of a circle of radius 7 cm (using 22/7)?",["154 square cm","44 square cm","49 square cm"],0,"22/7 × 7 × 7 = 154.")],tags=["pi","circle"])
