from lib import *
from bx import *
C=10;S='science'
mole=svg(560,270,DEF+title(560,'The mole links mass, particles and volume')
 +box(210,100,140,60,'#fcf3cf',['1 mole','6.023 x 10^23 particles'],12)
 +box(10,100,140,60,'#d6eaf8',['Mass in grams','= molar mass'],12)
 +box(410,100,140,60,'#d5f5e3',['Gas volume at STP','= 22.4 litre'],12)
 +arrow(210,130,152,130,'mass / molar mass',181,118)+arrow(350,130,408,130,'x 22.4 L',379,118)
 +'<text x="280" y="200" text-anchor="middle" font-size="13">Moles = mass / molar mass = number of particles / 6.023 x 10^23</text>'
 +'<text x="280" y="226" text-anchor="middle" font-size="13">Example: 32 g of O2 = 1 mole = 6.023 x 10^23 molecules = 22.4 L at STP</text>'
 +'<text x="280" y="250" text-anchor="middle" font-size="12">STP = 273.15 K and 1 atm</text>')
lesson(C,S,'atoms-and-molecules','mole-concept',"The mole concept, percent composition and Avogadro's law","Counting by the dozen",
"A shopkeeper sells eggs by the dozen and bangles by the pair, because counting one by one is slow. Atoms are far too tiny to count or weigh one by one, so chemists also count them in a bunch, and that bunch is called a mole.",
["Atoms and molecules are so small that we deal with huge numbers of them, so chemists use a special counting unit called the mole, just as we use a pair or a dozen. @ mole",
 "In the SI system one mole is the amount of a substance that contains as many particles as there are atoms in exactly 12 g of carbon-12. @ 12 g of carbon-12",
 "That number was found by experiment and is called Avogadro's number, N A, named after the Italian scientist Amedeo Avogadro; its value is 6.023 x 10^23. @ 6.023 x 10^23",
 "One mole of atoms has a mass in grams equal to its atomic mass, so 16 g of oxygen atoms contain 6.023 x 10^23 atoms. @ gram atomic mass",
 "One mole of molecules has a mass in grams equal to its molecular mass, so 32 g of oxygen gas holds 6.023 x 10^23 oxygen molecules. @ gram molecular mass",
 "Molar volume: one mole of any gas occupies 22.4 litre, or 22400 ml, at STP, which means 273.15 K and 1 atm pressure. @ 22.4 L at STP",
 "The number of moles is the mass divided by the atomic or molecular mass, and it is also the number of particles divided by 6.023 x 10^23. @ n = m / M",
 "Percent composition tells the mass of each element in 100 g of a compound: mass of the element in one formula unit divided by the molecular mass, multiplied by 100. @ percent composition",
 "For water, H2O has molecular mass 18, so hydrogen is 2/18 x 100 = 11.11 percent and oxygen is 16/18 x 100 = 88.89 percent. @ H2O: 11.11 % and 88.89 %",
 "For methane, CH4 has mass 16, so carbon is 75 percent and hydrogen is 25 percent; such values help to find empirical and molecular formulae. @ CH4: 75 % and 25 %",
 "In 1811 Avogadro stated his law: equal volumes of all gases at the same temperature and pressure contain an equal number of molecules, so volume is proportional to the number of molecules, V = constant x n. @ V = constant x n",
 "Check it with H2 + Cl2 giving 2 HCl: one volume plus one volume gives two volumes, so one molecule of hydrogen chloride contains half a molecule of hydrogen and half of chlorine, which shows that molecules split into atoms, in agreement with Dalton's atomic theory. @ molecules split into atoms",
 "Avogadro's law also explains Gay-Lussac's law and helps us find the atomicity of gases, for example that hydrogen is diatomic. @ atomicity"],
("A sample has 22 g of carbon dioxide, CO2 (C = 12, O = 16). Find the moles, the number of molecules and the volume at STP.",
 [("Molecular mass of CO2 = 12 + 2 x 16 = 44 g per mole.","You need the molar mass before you can count moles."),
  ("Moles = mass / molar mass = 22 / 44 = 0.5 mole.","Use n = m / M."),
  ("Molecules = 0.5 x 6.023 x 10^23 = 3.0115 x 10^23.","Each mole holds 6.023 x 10^23 molecules."),
  ("Volume at STP = 0.5 x 22.4 = 11.2 litre.","One mole of any gas occupies 22.4 L at STP.")]),
("Explain what a mole is and how you convert between mass, particles and volume of a gas.",
 ["Mole is 6.023 x 10^23 particles","Mass divided by molar mass gives moles","One mole of a gas is 22.4 L at STP"],
 ["Thinking molar volume is 22.4 L for liquids and solids as well","Forgetting to find the molar mass first"]),
["One mole contains 6.023 x 10^23 particles (Avogadro's number).","Moles = mass / molar mass = particles / 6.023 x 10^23.","One mole of any gas occupies 22.4 litre at STP.","Percent composition = mass of element / molecular mass x 100; equal volumes of gases at the same T and P hold equal numbers of molecules."],
["n|The number before x 10^23 in Avogadro's number is|6.023|Avogadro's number is 6.023 x 10^23.",
 "m|One mole of any gas at STP occupies|22.4 litre|11.2 litre~That is half a mole, not one mole.;44.8 litre~That is the volume of two moles.;1 litre~Molar volume is much larger than this.|Molar volume is 22.4 litre at STP.",
 "n|Number of moles in 36 g of water (H2O = 18 g per mole) is|2|36 / 18 = 2 moles.",
 "t|The mass of one mole of an element in grams equals its atomic mass.|True|Gram atomic mass is the mass of one mole of atoms.",
 "n|Volume in litres of 2 moles of a gas at STP is|44.8|2 x 22.4 = 44.8 litre.",
 "m|Mass percent of hydrogen in water (H2O) is|11.11 percent|88.89 percent~That is oxygen, not hydrogen.;5.55 percent~Hydrogen has 2 units of 18, which is more than that.;50 percent~Water is mostly oxygen by mass.|Hydrogen is 2/18 x 100 = 11.11 percent.",
 "s|Avogadro's law says equal volumes of gases at the same T and P hold equal numbers of ____.|molecules|Avogadro's hypothesis counts molecules, not atoms.",
 "n|Moles in 3.0115 x 10^23 molecules (give the answer in moles) is|0.5|3.0115 x 10^23 / 6.023 x 10^23 = 0.5.",
 "m|At the same T and P, 1 litre each of H2, O2 and CO2 contain|the same number of molecules|more molecules in H2 because it is lighter~Mass does not change the count, only the volume does.;more molecules in CO2 because it is heavier~Heavier molecules do not mean more molecules.;more molecules in O2~There is no such rule.|Avogadro's law: equal volumes, equal molecules.",
 "n|Mass in grams of 0.25 mole of oxygen gas O2 (O = 16) is|8|0.25 x 32 = 8 g."],
svg=(mole,"Diagram of the mole linking mass, 6.023 x 10^23 particles and 22.4 litre of gas","One mole links mass, particles and volume"))
