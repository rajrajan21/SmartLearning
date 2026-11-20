from lib import *
C=10;S='science'
d=svg(620,250,'<text x="310" y="22" text-anchor="middle" font-weight="bold">Sound as a longitudinal wave</text>'
 +''.join(f'<line x1="{x}" y1="60" x2="{x}" y2="110" stroke="#1f618d" stroke-width="3"/>' for x in (40,50,60,70,100,115,130,145,150,160,170,180,185,195,205,225,245,265,285,305,325))
 +'<text x="55" y="130" text-anchor="middle" font-size="12">compression</text><text x="120" y="130" text-anchor="middle" font-size="12">rarefaction</text><line x1="40" y1="150" x2="305" y2="150" stroke="#c0392b" stroke-width="2"/><text x="172" y="168" text-anchor="middle" font-size="12">wavelength (one compression + one rarefaction)</text>'
 '<text x="350" y="60" font-size="14" font-weight="bold">v = n x wavelength</text><text x="350" y="84" font-size="13">Infrasonic: below 20 Hz</text><text x="350" y="104" font-size="13">Audible: 20 Hz to 20 kHz</text><text x="350" y="124" font-size="13">Ultrasonic: above 20 kHz</text>'
 '<text x="30" y="200" font-size="13">Solid > Liquid > Gas   (iron 5950, water 1493, air 343 m/s)</text><text x="30" y="222" font-size="13">v at T degrees C = 331 + 0.61 T m/s; humid air is faster; denser gas is slower</text>')
lesson(C,S,'acoustics','sound-waves-speed-and-factors',"Sound waves, their speed and the factors that change it","Lightning first, thunder later",
"In a thunderstorm you see the flash first and hear the thunder a few seconds later. This is because light travels almost a million times faster than sound, and sound also needs a medium to travel.",
["Sound is produced by vibrating bodies and needs a material medium such as air, water or steel to travel; it cannot travel through a vacuum. @ medium needed",
 "Sound waves are longitudinal: the particles of the medium vibrate along the direction of travel, forming compressions and rarefactions. @ longitudinal waves",
 "Waves below 20 Hz are infrasonic, those between 20 Hz and 20 kHz are audible, and those above 20 kHz are ultrasonic, which dogs, bats and dolphins can detect. @ infrasonic and ultrasonic",
 "Light waves need no medium and are transverse, while sound waves need a medium and are longitudinal; sound in air travels at about 340 m/s but light at 3 times 10 to the power 8 m/s. @ sound and light",
 "The wave velocity is the distance travelled per second; with wavelength lambda and frequency n it is v = n lambda. @ v = n lambda",
 "Sound is fastest in solids, slower in liquids and slowest in gases, v solid > v liquid > v gas, because solids are the most elastic. @ solid > liquid > gas",
 "For example sound travels at 5950 m/s in iron, 1493 m/s in water and 343 m/s in air at 20 degrees Celsius. @ speed in media",
 "In a gas the speed is inversely proportional to the square root of the density, so a denser gas carries sound more slowly. @ density effect",
 "The speed increases with temperature, v = 331 + 0.61 T metre per second at T degrees Celsius, so it changes by 0.61 m/s for each degree. @ temperature effect",
 "Sound also travels faster in humid air, which is why we hear distant sounds clearly in the rainy season. @ humidity effect"],
("A sound wave in air has a frequency of 500 Hz and a wavelength of 0.68 m. Find its speed. Find the speed of sound in air at 30 degrees Celsius.",[("v = n x lambda = 500 x 0.68.","Use the wave equation."),("v = 340 m/s.","Close to the speed in air."),("At 30 degrees Celsius, v = 331 + 0.61 x 30 = 331 + 18.3.","Temperature formula."),("v = 349.3 m/s, faster than at 0 degrees Celsius.","Warm air carries sound faster.")]),
("Explain why sound travels fastest in solids and why we hear far-off sounds better on a humid day.",["Solids are more elastic than liquids and gases","Speed of sound increases with elasticity","Moist air allows sound to travel faster"],["Sound travels faster in a vacuum","Sound is a transverse wave"]),
["Sound is a longitudinal wave and needs a medium.","v = n lambda; infrasonic < 20 Hz, ultrasonic > 20 kHz.","v solid > v liquid > v gas.","v = 331 + 0.61 T; humidity raises the speed, density lowers it."],
["n|Speed in m/s of a wave of frequency 200 Hz and wavelength 1.7 m|340|v = n x lambda.",
 "m|Sound cannot travel through|a vacuum|water~Liquids carry sound well;steel~Solids carry sound fastest;air~Gases carry sound|A material medium is essential.",
 "t|Sound waves are transverse waves.|False|They are longitudinal waves of compressions and rarefactions.",
 "m|The speed of sound is greatest in|iron|water~Slower than in solids;air~Slowest;kerosene~Slower than in iron|Solids are the most elastic.",
 "n|Speed of sound in air at 20 degrees Celsius using v = 331 + 0.61 T, to the nearest whole number|343|331 + 12.2 = 343.2.",
 "m|Frequencies above 20 kHz are called|ultrasonic|infrasonic~That is below 20 Hz;audible~That is the human hearing range;subsonic~That describes speed, not frequency|Bats and dolphins can detect them.",
 "t|The speed of sound in a gas increases when the temperature increases.|True|v is proportional to the square root of the temperature.",
 "t|Sound travels faster in a denser gas.|False|The speed is inversely proportional to the square root of the density.",
 "n|Wavelength in metre of a 170 Hz sound travelling at 340 m/s|2|lambda = v / n = 340 / 170.",
 "s|Regions of high pressure in a sound wave are called ____.|compressions|Low pressure regions are rarefactions."],
svg=(d,"A sound wave with compressions and rarefactions and a summary of speeds and frequency ranges","Sound waves and their speed"))
d2=svg(620,250,'<text x="310" y="22" text-anchor="middle" font-weight="bold">Ethanol, ethanoic acid and soap</text>'
 '<text x="20" y="55" font-size="14" font-weight="bold">Ethanol C2H5OH</text><text x="20" y="77" font-size="13">+ Na gives sodium ethoxide + H2</text><text x="20" y="97" font-size="13">+ conc H2SO4 (443 K) gives ethene</text><text x="20" y="117" font-size="13">burns to give CO2 + H2O</text>'
 '<text x="260" y="55" font-size="14" font-weight="bold">Ethanoic acid CH3COOH</text><text x="260" y="77" font-size="13">+ metal gives salt + H2</text><text x="260" y="97" font-size="13">+ carbonate gives salt + CO2 + H2O</text><text x="260" y="117" font-size="13">+ NaOH gives salt + water</text>'
 '<text x="20" y="165" font-size="14" font-weight="bold">Soap = fat + alkali (saponification)</text><text x="20" y="187" font-size="13">NaOH gives hard soap (washing)</text><text x="20" y="207" font-size="13">KOH gives soft soap (body)</text><text x="330" y="187" font-size="13">Detergent: works in hard water</text><text x="330" y="207" font-size="13">(salts of sulphonic acids)</text>')
lesson(C,S,'carbon-and-its-compounds','ethanol-ethanoic-acid-and-soaps',"Ethanol, ethanoic acid, soaps and detergents","Vinegar, sanitiser and soap",
"Vinegar on the kitchen shelf, hand sanitiser in your bag and the soap at the sink all contain carbon compounds. Their properties come from their functional groups, the alcohol group in ethanol and the acid group in ethanoic acid.",
["Ethanol C2H5OH is a colourless, highly inflammable liquid that mixes with water in all proportions. @ ethanol",
 "On heating with concentrated sulphuric acid at 443 K ethanol loses water to form ethene, which is dehydration. @ dehydration to ethene",
 "Ethanol reacts with sodium to give sodium ethoxide and hydrogen gas, and burns in oxygen to give carbon dioxide and water. @ reaction with sodium",
 "Ethanol is used in antiseptics and hand sanitisers, as a solvent, in antifreeze and in methylated spirit, rectified spirit and power alcohol. @ uses of ethanol",
 "Ethanoic acid, or acetic acid, CH3COOH, is a carboxylic acid with a sour taste and higher boiling point than the matching alcohol; on cooling it freezes to ice-like flakes called glacial acetic acid. @ ethanoic acid",
 "It is made by the oxidation of ethanol using alkaline potassium permanganate or acidified potassium dichromate. @ preparation",
 "Ethanoic acid reacts with active metals to liberate hydrogen and with carbonates and bicarbonates to give a salt, carbon dioxide and water with brisk effervescence. @ metals and carbonates",
 "It reacts with sodium hydroxide to give sodium ethanoate and water, and its sodium salt heated with soda lime gives methane. @ with base and soda lime",
 "Soaps are sodium or potassium salts of long chain fatty acids made from a fat and an alkali by saponification; sodium hydroxide gives hard soap and potassium hydroxide gives soft soap. @ soap",
 "Detergents are salts of sulphonic acids or alkyl hydrogen sulphates and, unlike soap, they can be used in hard water and acidic solutions. @ detergents"],
("Write the balanced equations for ethanoic acid reacting with (a) zinc, (b) sodium carbonate and (c) sodium hydroxide.",[("(a) 2CH3COOH + Zn gives (CH3COO)2Zn + H2.","A metal liberates hydrogen."),("(b) 2CH3COOH + Na2CO3 gives 2CH3COONa + CO2 + H2O.","Brisk effervescence of carbon dioxide."),("(c) CH3COOH + NaOH gives CH3COONa + H2O.","A neutralisation reaction giving a salt and water."),("In all three the salt formed is called an ethanoate (acetate).","Named from the acid.")]),
("A student has two colourless liquids, ethanol and ethanoic acid. Suggest a simple test to tell them apart.",["Add sodium bicarbonate","Ethanoic acid gives brisk effervescence of CO2","Ethanol gives no effervescence with bicarbonate"],["Both give carbon dioxide with carbonates","Ethanol is sour"]),
["Ethanol: alcohol, reacts with Na, dehydrates to ethene, burns to CO2 and water.","Ethanoic acid: carboxylic acid, reacts with metals, carbonates and bases.","Soap = fat + alkali (saponification); NaOH gives hard soap, KOH soft soap.","Detergents work in hard water; soaps do not."],
["m|Heating ethanol with concentrated sulphuric acid at 443 K gives|ethene|ethanoic acid~That needs oxidation;methane~Needs decarboxylation of a sodium salt;carbon dioxide~Only on complete burning|Dehydration of ethanol.",
 "m|Ethanoic acid reacts with sodium carbonate to give|CO2, water and a salt|hydrogen and a salt~That is the reaction with a metal;ethene and water~Not a carbonate reaction;methane and soda lime~Different reaction|2CH3COOH + Na2CO3 gives 2CH3COONa + CO2 + H2O.",
 "t|Glacial acetic acid is pure ethanoic acid that freezes into ice-like flakes.|True|It looks like glacier ice.",
 "m|Soaps are|sodium or potassium salts of fatty acids|esters of sulphonic acids~Those describe detergents;pure fats~Fats are raw material;pure alkalis~Alkali is raw material|Fat plus alkali gives soap.",
 "t|Soaps work as well as detergents in hard water.|False|Detergents work in hard water; soaps form scum.",
 "m|Hard soap is made using|sodium hydroxide|potassium hydroxide~That gives soft soap;hydrochloric acid~Soap needs an alkali;ethene~Not a raw material|Caustic soda gives hard soap.",
 "t|Ethanol reacts with sodium to liberate hydrogen.|True|2C2H5OH + 2Na gives 2C2H5ONa + H2.",
 "m|The gas given out when ethanoic acid reacts with sodium bicarbonate is|carbon dioxide|hydrogen~That comes with metals;oxygen~Not produced;methane~Needs soda lime|Brisk effervescence.",
 "n|Number of carbon atoms in one molecule of ethanoic acid|2|CH3COOH.",
 "s|The process of making soap from oils or fats with alkali is called ____.|saponification|Fat plus alkali gives soap and glycerol."],
svg=(d2,"Chemical properties of ethanol and ethanoic acid and how soaps and detergents are made","Ethanol, ethanoic acid and soaps"))
print('ok')
