from lib import *
C=10;S='science'
def res(x,y,l): return f'<rect x="{x}" y="{y}" width="46" height="18" fill="#fdebd0" stroke="#333"/><text x="{x+23}" y="{y+13}" text-anchor="middle" font-size="12">{l}</text>'
d=svg(620,270,'<text x="310" y="22" text-anchor="middle" font-weight="bold">Resistors in series and in parallel</text>'
 '<text x="20" y="55" font-size="14" font-weight="bold">Series: same current</text><line x1="20" y1="90" x2="60" y2="90" stroke="#333"/>'+res(60,81,'R1')+'<line x1="106" y1="90" x2="130" y2="90" stroke="#333"/>'+res(130,81,'R2')+'<line x1="176" y1="90" x2="200" y2="90" stroke="#333"/>'+res(200,81,'R3')+'<line x1="246" y1="90" x2="280" y2="90" stroke="#333"/>'
 '<text x="20" y="130" font-size="14">Rs = R1 + R2 + R3</text><text x="20" y="152" font-size="13">Rs is more than the largest R</text><text x="20" y="174" font-size="13">If one fails, all stop</text>'
 '<text x="330" y="55" font-size="14" font-weight="bold">Parallel: same voltage</text><line x1="340" y1="100" x2="380" y2="100" stroke="#333"/><line x1="380" y1="75" x2="380" y2="145" stroke="#333"/><line x1="380" y1="75" x2="410" y2="75" stroke="#333"/>'+res(410,66,'R1')+'<line x1="456" y1="75" x2="486" y2="75" stroke="#333"/><line x1="380" y1="145" x2="410" y2="145" stroke="#333"/>'+res(410,136,'R2')+'<line x1="456" y1="145" x2="486" y2="145" stroke="#333"/><line x1="486" y1="75" x2="486" y2="145" stroke="#333"/><line x1="486" y1="100" x2="520" y2="100" stroke="#333"/>'
 '<text x="330" y="180" font-size="14">1/Rp = 1/R1 + 1/R2</text><text x="330" y="202" font-size="13">Rp is less than the smallest R</text><text x="330" y="224" font-size="13">If one fails, others work (house wiring)</text>'
 '<text x="20" y="250" font-size="13">Resistivity: rho = R A / L (unit ohm metre); conductance G = 1 / R</text>')
lesson(C,S,'electricity','resistors-in-series-and-parallel',"Resistivity and the combination of resistors","Fairy lights and house wiring",
"On a string of old fairy lights, if one bulb fails the whole string goes dark. In your house, if one bulb fails the fan keeps running. The first is a series circuit and the second is a parallel circuit.",
["The resistance of a wire depends on its resistivity, length and area of cross section, so resistivity rho = R A / L, measured in ohm metre. @ resistivity",
 "Conductors such as copper have very small resistivity, about 1.62 times 10 to the power minus 8 ohm metre, while insulators such as glass and rubber have a very large resistivity. @ conductor and insulator",
 "The reciprocal of resistance is conductance, measured in mho, and the reciprocal of resistivity is conductivity. @ conductance",
 "In a series circuit the resistors are joined end to end in a single loop, so the same current flows through each of them. @ series circuit",
 "The potential differences add up, V = V1 + V2 + V3, which gives the effective resistance Rs = R1 + R2 + R3. @ Rs = R1 + R2 + R3",
 "The equivalent resistance of a series combination is greater than the highest individual resistance, and for n equal resistors it is n R. @ more than the highest",
 "In a parallel circuit there are two or more loops, the potential difference across each resistor is the same and the currents add, I = I1 + I2 + I3. @ parallel circuit",
 "The effective resistance is given by 1 / Rp = 1 / R1 + 1 / R2 + 1 / R3, and it is less than the lowest individual resistance. @ 1/Rp",
 "Series-parallel and parallel-series combinations are solved in steps: first replace each group by its effective resistance and then combine the groups. @ combined circuits",
 "In a series circuit if one appliance is disconnected the others stop working, but in a parallel circuit they work independently, which is why house wiring is parallel. @ series versus parallel"],
("Three resistors of 5 ohm, 3 ohm and 2 ohm are connected in series across a 10 V battery. Find the effective resistance and the current. Then find the effective resistance if 6 ohm and 3 ohm are connected in parallel.",[("Series: Rs = R1 + R2 + R3 = 5 + 3 + 2 = 10 ohm.","Resistances add in series."),("Current I = V / Rs = 10 / 10 = 1 A.","Ohm's law."),("Parallel 6 ohm and 3 ohm: 1/Rp = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2.","Add reciprocals."),("So Rp = 2 ohm, which is less than the smaller resistor, 3 ohm.","Check with the rule.")]),
("A wire of length 10 m and area 2 x 10^-7 m2 has a resistance of 2 ohm. Find its resistivity.",["rho = R A / L","rho = 2 x 2 x 10^-7 / 10","rho = 4 x 10^-8 ohm metre"],["Using the length in the numerator","Forgetting that the unit is ohm metre"]),
["Series: Rs = R1 + R2 + R3, same current, Rs is the largest.","Parallel: 1/Rp = sum of reciprocals, same voltage, Rp is the smallest.","rho = R A / L in ohm metre.","House wiring is parallel so appliances work independently."],
["n|Effective resistance in ohm of 4 ohm and 6 ohm in series|10|4 + 6.",
 "n|Effective resistance in ohm of two 6 ohm resistors in parallel|3|1/Rp = 1/6 + 1/6 = 1/3.",
 "t|The effective resistance of resistors in parallel is less than the smallest resistance.|True|Adding a path always lowers the total resistance.",
 "m|In a series circuit the quantity that is the same through every resistor is|the current|the potential difference~That is the same in parallel;the resistance~Each resistor can differ;the power~Power depends on R and I|There is only one loop for the current.",
 "m|House wiring uses parallel connections because|each appliance works independently at full voltage|the total resistance is highest~Parallel gives the lowest resistance;the current is the same in all appliances~Current divides in parallel;fuses are not needed~Fuses are still needed|The same voltage is across each branch.",
 "n|Current in ampere through three 5 ohm resistors in series across 15 V|1|Rs = 15 ohm, I = 15 / 15.",
 "n|Resistivity in units of 10^-8 ohm metre for R = 2 ohm, L = 10 m, A = 2 x 10^-7 m2|4|rho = R A / L = 2 x 2e-7 / 10.",
 "t|If one bulb in a series circuit fuses, the other bulbs continue to glow.|False|The single loop is broken, so the current stops.",
 "m|The unit of conductance is|mho (siemens)|ohm~That is the unit of resistance;volt~Unit of potential difference;ohm metre~Unit of resistivity|G = 1 / R.",
 "s|The effective resistance of n equal resistors R in series is ____.|nR / n R / n x R|Each adds R."],
svg=(d,"A series circuit and a parallel circuit with their formulas and the rule for resistivity","Resistors in series and parallel"))
print('ok')
