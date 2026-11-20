from lib import *
from bx import *
C=10;S='science';CH='electricity'
vi=svg(560,280,DEF+title(560,"Ohm's law: V = I R")
 +'<line x1="70" y1="230" x2="70" y2="50" stroke="#333" stroke-width="2"/><line x1="70" y1="230" x2="300" y2="230" stroke="#333" stroke-width="2"/>'
 +'<line x1="70" y1="230" x2="280" y2="70" stroke="#c0392b" stroke-width="3"/><text x="285" y="68" font-size="13" fill="#c0392b">straight line</text>'
 +'<text x="40" y="60" font-size="13">V</text><text x="300" y="250" font-size="13">I</text><text x="90" y="262" font-size="12">V-I graph of a conductor at constant temperature</text>'
 +box(340,70,200,50,'#fcf3cf',['V = I R','R = V / I'],14)
 +box(340,140,200,50,'#d5f5e3',['Unit of R: ohm (V/A)','1 ohm = 1 volt per ampere'],12)
 +box(340,210,200,50,'#d6eaf8',['Slope of V-I line = R','Conductance G = 1/R (mho)'],12))
lesson(C,S,CH,'ohms-law-and-circuits',"Ohm's law and resistance","The heater coil",
"Why does the coil of an electric heater glow red hot while the copper wire that brings current to it stays cool? Both carry the same current, so the answer must lie in a property of the material, called resistance.",
["Georg Simon Ohm, a German physicist, found the relation between the potential difference across a conductor and the current through it. @ Georg Simon Ohm",
 "Ohm's law states that at constant temperature, the steady current I through a conductor is directly proportional to the potential difference V across its ends. @ Ohm's law",
 "So V divided by I is a constant for a given conductor, and we write V = I R. @ V = IR",
 "The constant R is the resistance, the property of a material to oppose the flow of charges and hence the passage of current. @ resistance",
 "Resistance is defined as the ratio of the potential difference across the ends of a conductor to the current through it, R = V / I. @ definition of resistance",
 "Its SI unit is the ohm, symbol Omega; a conductor has a resistance of one ohm if one ampere flows through it when one volt is maintained across its ends. @ ohm",
 "Because V is proportional to I, the graph of V against I for a conductor is a straight line, and its slope gives the resistance. @ V-I graph",
 "If you replace a nichrome wire with copper or aluminium in the same circuit, the current changes for the same potential difference, which shows that resistance differs from material to material. @ different materials",
 "Resistance depends on the material, the temperature, the length and the area of cross section of the conductor. @ factors",
 "The reciprocal of resistance is conductance G = 1/R, which measures how easily a material lets charges pass, and its unit is ohm to the power minus one, also called mho. @ conductance",
 "Ohm's law holds only when the temperature stays constant; a heating wire does not give a straight V-I line at all temperatures. @ temperature condition",
 "In every problem you can find any one of V, I or R when the other two are known, by using V = I R in the right form. @ using the formula"],
("Calculate the resistance of a conductor through which a current of 2 A passes when the potential difference between its ends is 30 V.",
 [("Given I = 2 A and V = 30 V.","Write the known values first."),
  ("From Ohm's law R = V / I.","Rearrange V = I R."),
  ("R = 30 / 2 = 15 ohm.","Divide and give the unit ohm."),
  ("Check: I R = 2 x 15 = 30 V, which matches.","Always check by substituting back.")]),
("State Ohm's law, define resistance and describe the V-I graph.",
 ["Current proportional to potential difference at constant temperature","R = V/I, unit ohm","Straight line graph"],
 ["Forgetting the constant temperature condition","Saying resistance depends on the current"]),
["Ohm's law: at constant temperature V is proportional to I, so V = I R.","R = V / I and its SI unit is the ohm; 1 ohm = 1 V per A.","The V-I graph of an ohmic conductor is a straight line.","Conductance G = 1/R, in mho."],
["n|Resistance in ohm when V = 30 V and I = 2 A is|15|R = V / I = 30 / 2.",
 "n|Current in ampere through a 10 ohm resistor with 20 V across it is|2|I = V / R = 20 / 10.",
 "n|Potential difference in volt across a 5 ohm resistor carrying 3 A is|15|V = I R = 3 x 5.",
 "m|Ohm's law holds when|temperature is constant|the current is zero~Then nothing flows and the law is meaningless.;the wire is very long~Length does not decide this.;the voltage is above 1 V~There is no such condition.|Resistance changes with temperature.",
 "t|The V-I graph of a conductor obeying Ohm's law is a straight line.|True|Because V is proportional to I.",
 "m|The SI unit of resistance is|ohm|ampere~Ampere is the unit of current.;volt~Volt is the unit of potential difference.;mho~Mho is the unit of conductance.|1 ohm = 1 V / 1 A.",
 "s|The reciprocal of resistance is called ____.|conductance|G = 1/R.",
 "t|Resistance of a conductor depends on the current flowing through it.|False|It depends on material, length, area and temperature, not on the current.",
 "m|Same V, wire A gives more current than wire B. Then|A has less resistance|A has more resistance~More resistance gives less current.;A and B have equal resistance~Then the currents would be equal.;Nothing can be said~I = V/R shows the resistances differ.|For equal V, current is inversely related to R.",
 "m|The slope of the V-I graph gives|resistance|conductance~Conductance is the reciprocal, 1/R.;power~Power is VI.;charge~Charge is current x time.|V / I = R."],
svg=(vi,"V-I straight line graph with Ohm's law formulae","Ohm's law"))

register(C,S,CH,'resistivity-and-conductivity',"Resistivity and conductivity")
rs=svg(560,270,DEF+title(560,'R = rho L / A')
 +box(20,50,230,60,'#fcf3cf',['R proportional to L','R inversely proportional to A'],13)
 +box(300,50,240,60,'#d5f5e3',['R = rho L / A','rho = R A / L'],14)
 +arrow(250,80,298,80)
 +box(20,140,160,60,'#fadbd8',['Resistivity rho','unit: ohm metre'],13)
 +box(200,140,160,60,'#d6eaf8',['Conductivity 1/rho','unit: mho per metre'],13)
 +box(380,140,160,60,'#e8daef',['Nichrome','rho = 1.5e-6 ohm m'],13)
 +'<text x="280" y="235" text-anchor="middle" font-size="13">Conductors: low resistivity (copper). Insulators: very high (glass, rubber).</text>')
lesson(C,S,CH,'resistivity-and-conductivity',"Resistivity and conductivity","Why heater wires are nichrome",
"A connecting wire is made of copper but the heating element of an iron is made of nichrome. Both are metals, yet the choice is not random; it depends on a number called resistivity.",
["Experiments show that the resistance R of a conductor is directly proportional to its length L and inversely proportional to its area of cross section A. @ R and L, A",
 "Writing this as an equation gives R = rho L / A, where rho is a constant for the material called its electrical resistivity or specific resistance. @ R = rho L / A",
 "Rearranging, rho = R A / L, and if L = 1 m and A = 1 square metre then rho = R. @ rho",
 "So resistivity is the resistance of a conductor of unit length and unit area of cross section, and its unit is ohm metre. @ unit of resistivity",
 "Resistivity measures the resisting power of a specified material to the passage of current and is a constant for a given material, unlike resistance, which also depends on the size of the wire. @ constant of material",
 "The reciprocal of resistivity is the electrical conductivity, with the unit ohm to the minus one metre to the minus one, also called mho per metre. @ conductivity",
 "Conductivity is a measure of the ability of a material to pass current, and the conductance G of a conductor is the reciprocal of its resistance, G = 1/R. @ conductance",
 "Good conductors such as copper and aluminium have low resistivity, for example copper 1.62 x 10 to the minus 8 ohm metre. @ conductors",
 "Insulators such as glass and rubber have enormously high resistivity, from 10 to the 10 up to 10 to the 16 ohm metre. @ insulators",
 "Conductivity is more for conductors than for insulators, but resistivity is less for conductors than for insulators. @ comparison",
 "Nichrome has a high resistivity of about 1.5 x 10 to the minus 6 ohm metre, so it is used for heating elements. @ nichrome",
 "Doubling the length of a wire doubles its resistance, while doubling its cross-sectional area halves the resistance. @ effect of L and A"],
("A wire 10 m long has resistance 2 ohm and cross-section 2 x 10^-7 m2. Find its resistivity, conductance and conductivity.",
 [("Resistivity rho = R A / L = 2 x 2 x 10^-7 / 10 = 4 x 10^-8 ohm m.","Use rho = R A / L."),
  ("Conductance G = 1 / R = 1 / 2 = 0.5 mho.","Reciprocal of resistance."),
  ("Conductivity = 1 / rho = 1 / (4 x 10^-8) = 0.25 x 10^8 = 2.5 x 10^7 mho per metre.","Reciprocal of resistivity.")]),
("Explain how resistance depends on length and area, and how resistivity differs from resistance.",
 ["R = rho L / A","Resistivity is a material constant","Insulators have very high resistivity"],
 ["Thinking resistivity changes with the length of the wire","Mixing up conductance and conductivity"]),
["R = rho L / A; R grows with length and falls with area.","Resistivity (ohm metre) is a property of the material; conductivity is 1/rho.","Conductors have low resistivity; insulators have very high resistivity.","Nichrome is used in heaters because of its high resistivity."],
["n|A wire has R = 4 ohm. If its length is doubled (same area), the new resistance in ohm is|8|R is proportional to L.",
 "n|A wire has R = 6 ohm. If its area is doubled (same length), the new resistance in ohm is|3|R is inversely proportional to A.",
 "m|The unit of resistivity is|ohm metre|ohm~That is the unit of resistance.;mho~That is the unit of conductance.;ohm per metre~Not the unit of resistivity.|rho = R A / L.",
 "t|Resistivity depends on the length of the wire.|False|It is a constant for the material.",
 "s|The reciprocal of resistivity is called ____.|conductivity|Its unit is mho per metre.",
 "m|Which is used for heating elements?|nichrome|copper~Copper has low resistivity.;glass~Glass is an insulator.;rubber~Rubber is an insulator.|Nichrome has high resistivity.",
 "n|Conductance in mho of a 0.5 ohm conductor is|2|G = 1 / R.",
 "m|Which has the highest resistivity?|rubber|copper~Copper is a good conductor.;nickel~Nickel is a metal.;chromium~Chromium is a metal.|Insulators have resistivity up to 10^16 ohm metre.",
 "t|Conductors have more conductivity and less resistivity than insulators.|True|The two are reciprocals.",
 "n|Resistance in ohm of a wire with rho = 4 x 10^-8, L = 10 m, A = 2 x 10^-7 m2 is|2|R = rho L / A = 4e-8 x 10 / 2e-7."],
svg=(rs,"R equals rho L over A with units and nichrome","Resistivity and conductivity"))
