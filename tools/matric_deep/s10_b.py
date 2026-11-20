from lib import *
C=10;S='science';CH='periodic-classification-of-elements'
# ---- SVGs
trend=svg(560,300,'<text x="280" y="26" text-anchor="middle" font-weight="bold">Periodic trends in the modern periodic table</text>'
 '<line x1="60" y1="60" x2="500" y2="60" stroke="#2874a6" stroke-width="3"/><polygon points="500,52 516,60 500,68" fill="#2874a6"/>'
 '<text x="280" y="52" text-anchor="middle" fill="#2874a6">Across a period (left to right)</text>'
 '<line x1="40" y1="75" x2="40" y2="270" stroke="#b9770e" stroke-width="3"/><polygon points="32,270 40,286 48,270" fill="#b9770e"/>'
 '<text x="20" y="180" fill="#b9770e" transform="rotate(-90 20 180)" text-anchor="middle">Down a group</text>'
 '<rect x="70" y="85" width="440" height="30" fill="#d6eaf8" stroke="#555"/><text x="80" y="106" font-size="14">Property</text><text x="300" y="106" font-size="14">Along a period</text><text x="420" y="106" font-size="14">Down a group</text>'
 +''.join(f'<rect x="70" y="{115+i*30}" width="440" height="30" fill="{"#fdfefe" if i%2 else "#f4f6f7"}" stroke="#555"/><text x="80" y="{136+i*30}" font-size="14">{a}</text><text x="300" y="{136+i*30}" font-size="14">{b}</text><text x="420" y="{136+i*30}" font-size="14">{c}</text>' for i,(a,b,c) in enumerate([('Atomic radius','Decreases','Increases'),('Ionic radius','Decreases','Increases'),('Ionisation energy','Increases','Decreases'),('Electron affinity','Increases','Decreases'),('Electronegativity','Increases','Decreases')])))
furn=svg(520,360,'<text x="260" y="24" text-anchor="middle" font-weight="bold">Blast furnace for iron</text>'
 '<polygon points="190,40 330,40 350,200 380,300 140,300 170,200" fill="#f5cba7" stroke="#333" stroke-width="2"/>'
 '<line x1="165" y1="120" x2="355" y2="120" stroke="#333" stroke-dasharray="4"/><line x1="150" y1="210" x2="370" y2="210" stroke="#333" stroke-dasharray="4"/>'
 '<text x="260" y="95" text-anchor="middle" font-size="14">Reduction zone 400 C</text><text x="260" y="115" text-anchor="middle" font-size="13">Fe2O3 + 3CO -> 2Fe + 3CO2</text>'
 '<text x="260" y="165" text-anchor="middle" font-size="14">Fusion zone 1000 C</text><text x="260" y="185" text-anchor="middle" font-size="13">CO2 + C -> 2CO ; CaCO3 -> CaO + CO2</text>'
 '<text x="260" y="245" text-anchor="middle" font-size="14">Combustion zone 1500 C</text><text x="260" y="265" text-anchor="middle" font-size="13">C + O2 -> CO2 (hot air blast)</text>'
 '<text x="110" y="30" font-size="14" fill="#1e8449">Ore + coke + limestone (8:4:1)</text><line x1="150" y1="36" x2="195" y2="46" stroke="#1e8449"/>'
 '<text x="395" y="250" font-size="14" fill="#a04000">Hot air in</text><text x="385" y="330" font-size="14" fill="#7d3c98">Slag out</text><text x="20" y="330" font-size="14" fill="#c0392b">Molten iron out</text>'
 '<text x="260" y="330" text-anchor="middle" font-size="13">CaO + SiO2 -> CaSiO3 (slag)</text>')
rust=svg(520,280,'<text x="260" y="24" text-anchor="middle" font-weight="bold">Rusting: wet (electrochemical) corrosion of iron</text>'
 '<rect x="60" y="190" width="400" height="40" fill="#7f8c8d" stroke="#333"/><text x="260" y="216" text-anchor="middle" fill="#fff" font-size="14">Iron surface</text>'
 '<path d="M150 190 Q260 70 370 190 Z" fill="#aed6f1" stroke="#2874a6"/><text x="260" y="150" text-anchor="middle" font-size="14">Water droplet with dissolved O2</text>'
 '<text x="175" y="180" font-size="13" fill="#c0392b">Anode</text><text x="175" y="262" font-size="13">Fe -> Fe2+ + 2e-</text>'
 '<text x="330" y="180" font-size="13" fill="#1e8449">Cathode</text><text x="290" y="262" font-size="13">O2 + 2H2O + 4e- -> 4OH-</text>'
 '<text x="260" y="60" text-anchor="middle" font-size="14">Result: rust = Fe2O3.xH2O (hydrated ferric oxide)</text>')

lesson(C,S,CH,'modern-periodic-law-and-periodic-trends',"Modern periodic law and periodic trends","Why does argon sit before potassium?",
"Argon is heavier than potassium, yet it is placed before it in the periodic table. Mendeleev's table, which went by atomic mass, could not explain this. The answer came from a deeper property of the atom - the number of protons.",
["In 1912 Henry Moseley showed that atomic number, the number of protons in the nucleus, is the real basis for arranging elements, not atomic mass. @ atomic number",
 "Modern periodic law: the physical and chemical properties of the elements are periodic functions of their atomic numbers. @ modern periodic law",
 "The 118 known elements are arranged in 7 horizontal rows called periods and 18 vertical columns called groups. @ 7 periods, 18 groups",
 "Period 1 has 2 elements, periods 2 and 3 have 8 each, periods 4 and 5 have 18 each, and periods 6 and 7 have 32 each. @ period lengths 2, 8, 8, 18, 18, 32, 32",
 "Elements in a group have the same number of valence electrons, so they have the same valency and similar chemical properties; group 1 are alkali metals, group 2 alkaline earth metals, group 17 halogens and group 18 noble gases. @ groups and families",
 "Atomic radius is the distance from the nucleus to the outermost shell. It decreases along a period because the nuclear charge grows while the number of shells stays the same, and it increases down a group because new shells are added. @ atomic radius",
 "A cation is smaller than its atom and an anion is larger than its atom. Ionic radii follow the same period and group trends. @ cation and anion size",
 "Ionisation energy is the minimum energy needed to remove an electron from an isolated gaseous atom. It increases along a period and decreases down a group. @ ionisation energy",
 "Electron affinity is the energy released when a gaseous atom gains an electron; electronegativity is the tendency to attract the shared pair of electrons in a bond, and both increase along a period and decrease down a group. @ electron affinity and electronegativity",
 "On the Pauling scale the electronegativity difference tells the bond type: a difference above 1.7 means mainly ionic, below 1.7 mainly covalent. @ Pauling scale"],
("Predict the nature of the bond in NaCl using Pauling electronegativities Na = 1.0 and Cl = 3.0.",[("Difference = 3.0 - 1.0 = 2.0.","Subtract the smaller electronegativity from the larger."),("2.0 is greater than 1.7.","Compare with the 1.7 limit."),("So the bond is mainly ionic - sodium gives its electron to chlorine.","Greater than 1.7 means ionic.")]),
("Explain why atomic radius decreases across a period but increases down a group.",["Nuclear charge increases along a period","New shells are added down a group","Valence electrons are pulled closer or held farther"],["Thinking more electrons always means a bigger atom (across a period the shell number is the same)"]),
["Modern periodic law uses atomic number (Moseley, 1912).","7 periods and 18 groups; group members share valence electrons.","Along a period: radius decreases; ionisation energy, electron affinity and electronegativity increase.","Down a group: radius increases; the other three decrease.","Electronegativity difference above 1.7 means an ionic bond."],
["m|Modern periodic law says properties are periodic functions of|atomic number|atomic mass~That was Mendeleev's basis;neutron number~Neutrons do not decide the position|Moseley showed atomic number is the basis.",
 "n|How many elements are in the third period?|8|Sodium to argon is 8 elements.",
 "t|A cation is larger than its parent atom.|False|It loses electrons and the remaining ones are pulled in; a cation is smaller.",
 "m|Which has the highest electronegativity?|Fluorine|Sodium~A metal with low value;Iodine~Lower than fluorine;Hydrogen~Only 2.1|Fluorine is 4.0 on the Pauling scale.",
 "s|Group 17 elements are called the ____ family.|halogen/halogens|Group 17 are halogens.",
 "t|Ionisation energy decreases down a group.|True|Valence electrons are farther and loosely held.",
 "n|Difference in electronegativity of Cl (3.0) and H (2.1), rounded to one decimal|0.9|3.0 - 2.1; below 1.7 so the bond is covalent.",
 "m|Along a period from left to right the atomic radius|decreases|increases~That happens down a group;stays the same~The nuclear charge changes it|The nuclear charge grows and pulls electrons in.",
 "n|Number of elements in the sixth period|32|Periods 6 and 7 are the longest.",
 "t|All elements of a group have the same number of valence electrons (except group 18 helium).|True|Hence the same valency."],
svg=(trend,"A table of five periodic properties with arrows for the direction across a period and down a group","Trends of five periodic properties"))

lesson(C,S,CH,'ores-and-extraction-of-metals',"Ores, concentration and extraction of aluminium, copper and iron","From rock to metal",
"The aluminium in a pressure cooker and the iron in a bridge both began as rock. Metallurgy is the science of getting the metal out of that rock economically.",
["A mineral is a naturally occurring compound of a metal in the Earth; an ore is the mineral from which the metal can be extracted economically. All ores are minerals but not all minerals are ores - bauxite is an ore of aluminium while clay is only a mineral. @ mineral and ore",
 "The rocky impurity in an ore is gangue. A flux such as calcium oxide or silica is added to combine with the gangue and form a fusible slag. @ gangue, flux, slag",
 "Metallurgy has three steps: concentration of the ore, production of the metal, and refining. @ three steps of metallurgy",
 "Concentration uses hydraulic gravity separation for heavy oxide ores like haematite, magnetic separation for ores like tinstone, froth floatation for sulphide ores like zinc blende, and leaching for pure ores like bauxite. @ four ways of concentration",
 "More reactive metals such as Na, K, Ca, Mg and Al are extracted by electrolytic reduction; medium reactive ones such as Zn, Fe, Pb and Cu by chemical reduction with coke; and the least reactive Ag and Hg by heating their oxides. @ reactivity decides the method",
 "Aluminium: bauxite is purified by Baeyer's process (heated with NaOH, filtered, precipitated as Al(OH)3 and ignited to alumina), then alumina in molten cryolite with fluorspar is electrolysed in Hall's process at 900 to 950 degrees C and 5 to 6 V. @ Baeyer and Hall",
 "Copper from copper pyrites: froth floatation, roasting, smelting to matte, Bessemerisation to blister copper (98 percent pure) and electrolytic refining using an impure copper anode, a pure copper cathode and acidified copper sulphate. @ copper extraction",
 "Iron from haematite: gravity separation, roasting, then smelting in a blast furnace with roasted ore, coke and limestone in the ratio 8:4:1; carbon monoxide reduces Fe2O3 in the upper zone at about 400 degrees C. @ iron in the blast furnace",
 "Tamil Nadu has limestone in Coimbatore, Cuddalore and Dindigul, magnetite in Salem and Dharmapuri, and chromite in Salem and Coimbatore. @ ores of Tamil Nadu"],
("In the blast furnace, why is limestone added along with the roasted ore and coke?",[("Iron ore contains acidic gangue, silica (SiO2).","Gangue must be removed."),("Limestone decomposes at about 1000 C: CaCO3 gives CaO + CO2.","CaO is a basic flux."),("CaO + SiO2 gives CaSiO3, a fusible slag that floats on the molten iron and is removed.","Basic flux + acidic gangue = slag.")]),
("Describe how froth floatation concentrates a sulphide ore.",["Crushed ore with pine oil and water agitated with compressed air","Ore particles wetted by oil rise with the froth","Gangue wetted by water stays behind"],["Thinking it works because the ore is heavier (it works because the ore is lighter and wetted by oil)"]),
["Ore: a mineral from which a metal can be extracted profitably; gangue is removed with a flux as slag.","Concentration methods depend on the ore: gravity, magnetic, froth floatation, leaching.","Al: Baeyer's process then Hall's electrolysis; Cu: matte, Bessemerisation, electro-refining; Fe: blast furnace.","Blast furnace charge ratio 8:4:1 of ore, coke and limestone."],
["m|Sulphide ores are concentrated by|froth floatation|magnetic separation~Used when the ore or gangue is magnetic;hydraulic washing~Works for heavy oxide ores|Sulphide ores are wetted by pine oil.",
 "s|The rocky impurity associated with an ore is called ____.|gangue/matrix|Also called matrix.",
 "t|All minerals are ores.|False|Only minerals from which metal can be profitably extracted are ores.",
 "m|Aluminium is extracted from alumina by|Hall's process|Baeyer's process~That purifies bauxite to alumina;Bessemerisation~Used for copper|Electrolysis of fused alumina.",
 "n|Temperature (degrees C) of the combustion zone of the blast furnace|1500|Coke burns in the hot air blast.",
 "t|Blister copper is about 98 percent pure copper.|True|It is then refined electrolytically.",
 "m|The charge in the blast furnace has ore, coke and limestone in the ratio|8:4:1|1:1:1~Not the textbook ratio;4:8:1~Ore is the largest part|8 parts ore, 4 coke, 1 limestone.",
 "m|The function of cryolite in Hall's process is|to dissolve alumina and give a conducting melt|to act as the anode~The anode is graphite;to reduce Al3+~Reduction happens at the cathode|Fluorspar also lowers the fusion temperature.",
 "s|The mixture of flux and gangue is called ____.|slag|Flux + gangue gives slag.",
 "n|Purity (percent) of blister copper|98|98 percent copper and 2 percent impurities."],
svg=(furn,"A blast furnace with three zones and the main reactions","Reactions in the blast furnace"))

lesson(C,S,CH,'alloys-amalgam-and-corrosion',"Alloys, amalgam and corrosion","The Pamban Bridge",
"The Pamban Bridge in Rameswaram stands in salty sea air, the worst place for iron. It survives only because engineers keep renewing its protective coating. That is applied chemistry fighting corrosion.",
["An alloy is a homogeneous mixture of two or more metals, or of metals with non-metals, and it can be thought of as a solid solution with the main metal as solvent. @ alloy as solid solution",
 "We make alloys to change appearance, to alter chemical activity, to lower the melting point, to increase hardness and tensile strength and to raise electrical resistance. @ reasons for alloying",
 "Alloys are made by fusing metals together, like brass from zinc and copper, or by compressing finely divided metals. @ making alloys",
 "Brass is Cu and Zn, bronze is Cu and Sn, duralumin is Al with Mg, Mn and Cu, magnalium is Al and Mg, and stainless steel is Fe with C, Ni and Cr. @ common alloys and uses",
 "An amalgam is an alloy of mercury with another metal; silver-tin amalgam is used for dental fillings. @ amalgam",
 "Pig iron has 2.0 to 4.5 percent carbon, steel 0.25 to 2.0 percent and wrought iron below 0.25 percent. @ carbon content of iron",
 "Corrosion is the gradual destruction of a metal by chemical or electrochemical reaction with its environment. @ corrosion",
 "Dry corrosion is a direct chemical attack by gases at high temperature; wet corrosion needs moisture and is electrochemical. @ dry and wet corrosion",
 "Rust is hydrated ferric oxide, Fe2O3.xH2O, formed when iron meets oxygen and moisture. @ rust",
 "Corrosion is prevented by alloying, by galvanization (zinc coating), electroplating, anodizing (used for aluminium) and cathodic protection with a sacrificial metal. @ preventing corrosion"],
("A student claims a nail kept in dry air will rust quickly. Do you agree?",[("Rusting needs both oxygen and moisture.","Wet corrosion is electrochemical."),("In dry air there is no water to carry ions between anode and cathode.","So rusting is very slow."),("So I do not agree; the nail will not rust quickly unless moisture is present.","Keeping iron dry or coated prevents rust.")]),
("Explain why galvanized iron resists rusting even where the coating is scratched.",["Zinc is more reactive than iron","Zinc acts as the sacrificial anode and corrodes first","Iron is protected cathodically"],["Thinking the zinc only works as a physical barrier"]),
["Alloys improve hardness, strength, appearance and resistance; amalgam contains mercury.","Brass: Cu+Zn; bronze: Cu+Sn; steel: Fe+C; stainless steel adds Ni and Cr.","Rust is Fe2O3.xH2O and needs air and moisture.","Prevent corrosion by alloying, coating, galvanizing, anodizing and sacrificial protection."],
["m|Brass is an alloy of|copper and zinc|copper and tin~That is bronze;iron and carbon~That is steel|Cu + Zn.",
 "s|An alloy of mercury with another metal is an ____.|amalgam|Used for dental filling with silver and tin.",
 "t|Rust is hydrated ferric oxide.|True|Fe2O3.xH2O.",
 "m|Which prevents rusting by coating iron with zinc?|galvanization|anodizing~Used for aluminium;amalgamation~Uses mercury|Zinc coating by electric current.",
 "n|Maximum carbon percentage of wrought iron is below|0.25|Wrought iron has less than 0.25 percent carbon.",
 "t|Wet corrosion needs moisture.|True|It is an electrochemical process.",
 "m|Duralumin is used for|aircraft and pressure cookers|statues and bells~That is bronze;dental filling~That is amalgam|It is light and strong.",
 "m|Aluminium is made corrosion resistant by|anodizing|galvanizing~That uses zinc;roasting~It is an extraction step|An electrochemical thickening of the oxide layer.",
 "s|The easily corroded metal used for cathodic protection is called the ____ metal.|sacrificial|It acts as the anode.",
 "n|Lower limit of carbon percentage in steel|0.25|Steel has 0.25 to 2.0 percent."],
svg=(rust,"A water droplet on iron showing the anode where iron dissolves and the cathode where oxygen is reduced","How iron rusts"))
print('ok')
