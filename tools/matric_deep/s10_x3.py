from lib import *
from bx import *
C=10;S='science';CH='solutions'
def beaker(x,label,fill,note):
    return (f'<path d="M{x} 70 L{x} 170 Q{x} 180 {x+10} 180 L{x+90} 180 Q{x+100} 180 {x+100} 170 L{x+100} 70" fill="none" stroke="#333" stroke-width="2"/>'
      f'<rect x="{x+2}" y="{fill}" width="96" height="{178-fill}" fill="#d6eaf8"/><text x="{x+50}" y="60" text-anchor="middle" font-weight="bold" font-size="13">{label}</text>'
      f'<text x="{x+50}" y="205" text-anchor="middle" font-size="12">{note}</text>')
sat=svg(560,270,title(560,'Solutions with NaCl in 100 g of water at 25 C')
 +beaker(20,'Unsaturated',110,'10 to 30 g dissolved')+beaker(230,'Saturated',110,'36 g: limit reached')+beaker(440,'Supersaturated',110,'40 g: unstable')
 +'<circle cx="270" cy="170" r="3" fill="#555"/><circle cx="290" cy="172" r="3" fill="#555"/><circle cx="480" cy="172" r="3" fill="#555"/>'
 +'<text x="280" y="240" text-anchor="middle" font-size="13">Solubility = mass of solute / mass of solvent x 100 (g per 100 g)</text>'
 +'<text x="280" y="260" text-anchor="middle" font-size="12">Warm water usually dissolves more solid; a disturbed supersaturated solution forms crystals</text>')
lesson(C,S,CH,'concentration-and-solubility',"Solubility and concentration of a solution","A spoon of sugar in hot and cold tea",
"Stir one spoon of sugar into cold tea and some stays at the bottom, but in hot tea it vanishes at once. There is a limit to how much a solvent can dissolve, and chemists measure that limit as solubility.",
["Solubility is the number of grams of a solute that can dissolve in 100 g of a solvent to form a saturated solution at a given temperature and pressure. @ solubility",
 "For example, 36 g of sodium chloride dissolves in 100 g of water at 25 degree C, so the solubility of NaCl in water is 36 g at that temperature. @ NaCl: 36 g at 25 C",
 "Mathematically, solubility = mass of solute divided by mass of solvent, multiplied by 100. @ solubility formula",
 "The nature of solute and solvent matters: like dissolves like, so polar common salt dissolves in polar water, and non-polar fat dissolves in non-polar ether. @ like dissolves like",
 "Temperature matters too: the solubility of a solid in a liquid generally increases with temperature, so more sugar dissolves in warm water than in cold water. @ effect of temperature",
 "A saturated solution cannot dissolve any more solute at that temperature, an unsaturated solution holds less solute than the saturated one, and a supersaturated solution holds more, so it is unstable and crystals appear when it is disturbed. @ saturated, unsaturated, supersaturated",
 "Dilute and concentrated are relative terms: of two solutions with the same solute and solvent, the one with more solute per amount of solvent is concentrated. @ dilute and concentrated",
 "Concentration is the amount of solute present in a given amount of solution, and the textbook uses percentage by mass and percentage by volume. @ concentration",
 "Mass percentage = mass of solute divided by mass of solution, multiplied by 100; it is used when the solute is a solid and the solvent a liquid, and for ointments it is written w/w. @ mass percentage",
 "Volume percentage, v/v = volume of solute divided by volume of solution, multiplied by 100; it is used when both are liquids, as in mouth wash and antiseptics, and it falls when temperature rises because liquids expand. @ volume percentage",
 "Remember that the mass of the solution is the mass of solute plus the mass of solvent, so 10 g of sugar in 90 g of water makes a 10 percent solution, not 11 percent. @ solution = solute + solvent"],
("1.5 g of a solute dissolves in 15 g of water to give a saturated solution at 298 K. Find the solubility. Then find the mass percentage of a solution of 20 g sugar in 180 g water.",
 [("Solubility = mass of solute / mass of solvent x 100 = 1.5 / 15 x 100.","Solubility is always per 100 g of solvent."),
  ("= 10 g per 100 g of water at 298 K.","Do the division first, then multiply by 100."),
  ("For the sugar solution, mass of solution = 20 + 180 = 200 g.","Add solute and solvent to get the solution."),
  ("Mass percentage = 20 / 200 x 100 = 10 percent.","Divide by the solution, not by the solvent.")]),
("Explain solubility, the three kinds of solutions by amount of solute, and how mass percentage is calculated.",
 ["Solubility is grams per 100 g solvent","Saturated, unsaturated, supersaturated","Mass percent uses the mass of the whole solution"],
 ["Dividing by the mass of solvent instead of the solution for percentage","Thinking dilute means unsaturated and concentrated means saturated"]),
["Solubility = mass of solute / mass of solvent x 100, at a given temperature.","Saturated, unsaturated and supersaturated solutions differ in the amount of solute held.","Mass percentage = mass of solute / mass of solution x 100.","Volume percentage is used for liquid in liquid solutions."],
["n|A saturated solution has 3 g of solute in 30 g of water. The solubility in g per 100 g water is|10|3 / 30 x 100 = 10 g.",
 "m|A solution that holds more solute than the saturated solution at the same temperature is|supersaturated|unsaturated~An unsaturated one holds less solute.;dilute~Dilute is a relative term about concentration.;saturated~Saturated holds exactly the maximum amount.|It is unstable and crystals appear when it is disturbed.",
 "n|Mass percentage of a solution made from 10 g salt and 90 g water is|10|10 / (10 + 90) x 100 = 10.",
 "t|The solubility of a solid in a liquid generally increases as the temperature rises.|True|Sugar dissolves more in warm water than in cold water.",
 "s|The rule that polar solutes dissolve in polar solvents is called like dissolves ____.|like|Similar substances dissolve each other.",
 "m|Volume percentage is used mainly when|both solute and solvent are liquids|the solute is a solid and the solvent a liquid~Mass percentage is used then.;both are solids~Neither is a liquid, so v/v is not suitable.;a gas is the solvent~v/v is for liquid in liquid.|Mouth wash and antiseptic solutions use v/v.",
 "m|36 g of NaCl in 100 g of water at 25 degree C makes|a saturated solution|an unsaturated solution~It is the maximum amount at that temperature.;a supersaturated solution~That would need more than 36 g.;a dilute solution~Dilute is about relative concentration.|It is exactly the solubility of NaCl.",
 "n|Mass of the solution when 25 g sugar is dissolved in 75 g water (in g) is|100|25 + 75 = 100 g.",
 "t|Dilute and concentrated describe amounts only in a relative way.|True|They compare two solutions and do not give a number.",
 "n|Mass percentage when 5 g of salt is dissolved in 45 g of water is|10|5 / 50 x 100 = 10 percent."],
svg=(sat,"Three beakers showing unsaturated, saturated and supersaturated NaCl solutions","Saturated, unsaturated and supersaturated solutions"))

register(C,S,CH,'types-of-solutions-hydrated-salts',"Types of solutions, hydrated salts and deliquescence")
ts=svg(560,270,title(560,'Types of binary solutions (solute in solvent)')
 +box(10,40,265,52,'#d5f5e3',['Solid in solid','copper in gold (alloy)'],12)+box(285,40,265,52,'#d6eaf8',['Liquid in solid','mercury in sodium (amalgam)'],12)
 +box(10,100,265,52,'#fcf3cf',['Solid in liquid','salt in water'],12)+box(285,100,265,52,'#fadbd8',['Liquid in liquid','alcohol in water'],12)
 +box(10,160,265,52,'#e8daef',['Gas in liquid','carbon dioxide in water (soda)'],12)+box(285,160,265,52,'#d4efdf',['Gas in gas','helium-oxygen mixture, air'],12)
 +'<text x="280" y="236" text-anchor="middle" font-size="13">Aqueous: water is the solvent. Non-aqueous: sulphur in carbon disulphide</text><text x="280" y="258" text-anchor="middle" font-size="12">Blue CuSO4.5H2O + heat gives colourless CuSO4 + 5 H2O</text>')
lesson(C,S,CH,'types-of-solutions-hydrated-salts',"Types of solutions, hydrated salts and deliquescence","Why sea water is not just water",
"Sea water, the air we breathe and the blood in our body are all solutions. Knowing how solutions are made and classified helps us understand why blue copper sulphate crystals turn white on heating and why caustic soda pellets turn wet in open air.",
["A solution is a homogeneous mixture of two or more substances; the component present in the smaller amount is the solute and the one in the larger amount is the solvent. @ solute and solvent",
 "A binary solution has one solute and one solvent, like copper sulphate in water, and a ternary solution has three components, like salt and sugar both dissolved in water. @ binary and ternary",
 "Based on the physical states, solutions can be solid in solid, such as copper in gold, liquid in solid, such as mercury in sodium, solid in liquid, such as salt in water, liquid in liquid, such as alcohol in water, gas in liquid, such as soda water, and gas in gas, such as air. @ physical states",
 "Based on the solvent, an aqueous solution has water as solvent and is the commonest, because water is called the universal solvent. @ aqueous solution",
 "A non-aqueous solution uses another solvent, such as sulphur in carbon disulphide or iodine in carbon tetrachloride. @ non-aqueous solution",
 "All solutions are mixtures, but not all mixtures are solutions, because a solution must be uniform throughout. @ homogeneous",
 "When ionic substances crystallise from water, their ions attract water molecules which stay in the crystal in a fixed ratio; this is called hydration, and the number of water molecules is the water of crystallisation. @ water of crystallisation",
 "Blue vitriol, CuSO4.5H2O, has five water molecules; on gentle heating it loses them and becomes colourless anhydrous copper sulphate, and adding water brings the blue colour back. @ CuSO4.5H2O",
 "Other hydrated salts are Epsom salt MgSO4.7H2O, gypsum CaSO4.2H2O, green vitriol FeSO4.7H2O and white vitriol ZnSO4.7H2O. @ hydrated salts",
 "Hygroscopic substances absorb moisture from air without changing their state, like concentrated sulphuric acid, phosphorus pentoxide, quicklime and silica gel, so they are used as drying agents. @ hygroscopy",
 "Deliquescent substances absorb so much moisture that they dissolve in it, like caustic soda, caustic potash and ferric chloride; deliquescence is greatest at low temperature and in humid air. @ deliquescence",
 "So hygroscopic substances stay in the same state after absorbing moisture, while deliquescent substances lose their crystal shape and form a saturated solution. @ difference"],
("Blue crystals turn white when heated and become blue again when a few drops of water are added. Explain, and name the substance.",
 [("The blue crystals are copper sulphate pentahydrate, CuSO4.5H2O, a hydrated salt with five molecules of water of crystallisation.","Blue colour comes from the hydrated form."),
  ("On heating it loses the five water molecules and becomes colourless anhydrous copper sulphate.","Heating removes the water of crystallisation."),
  ("Adding water or cooling makes it take the water back and turn blue again, so the change is reversible.","The anhydrous salt rehydrates.")]),
("Describe the types of solutions and explain the difference between hygroscopic and deliquescent substances.",
 ["Solute, solvent, binary, ternary","Aqueous and non-aqueous solvents","Hygroscopic absorb moisture, deliquescent dissolve in it"],
 ["Thinking every mixture is a solution","Thinking hygroscopic substances dissolve in the moisture they take"]),
["A solution is a homogeneous mixture of a solute in a solvent; solutions are binary or ternary.","Water is the universal solvent; sulphur dissolves in carbon disulphide, a non-aqueous solvent.","Hydrated salts have water of crystallisation, such as CuSO4.5H2O.","Hygroscopic substances absorb moisture; deliquescent substances absorb enough to dissolve."],
["m|The component present in the larger amount in a solution is the|solvent|solute~The solute is the smaller amount.;precipitate~That is an insoluble solid that settles.;crystal~That is a solid form.|Solvent is the dissolving medium.",
 "m|Soda water is an example of|gas dissolved in liquid|solid in solid~That is an alloy.;liquid in gas~That is like cloud.;solid in liquid~That is like salt in water.|Carbon dioxide is dissolved in water.",
 "n|Number of water molecules in blue vitriol CuSO4.5H2O is|5|The 5 in the formula is the water of crystallisation.",
 "t|Water is called the universal solvent because most substances dissolve in it.|True|But some substances, like sulphur, are insoluble in water.",
 "m|Which is a deliquescent substance?|caustic soda|silica gel~It is hygroscopic and does not dissolve.;quicklime~It is hygroscopic.;concentrated sulphuric acid~It is hygroscopic.|Caustic soda absorbs moisture and dissolves.",
 "s|Substances used as drying agents, such as silica gel, are called ____ substances.|hygroscopic|They absorb moisture without changing state.",
 "m|Heating blue copper sulphate crystals gives|colourless anhydrous copper sulphate|black copper oxide~That is not the change described in the lesson.;blue crystals with more water~Heating removes water.;copper metal~That needs a different reaction.|It loses its five water molecules.",
 "t|Deliquescence is greatest at low temperature and in a humid atmosphere.|True|More moisture in the air makes the substance dissolve.",
 "m|Sulphur dissolved in carbon disulphide is|a non-aqueous solution|an aqueous solution~Water is not the solvent.;a gas solution~Both are not gases.;a ternary solution~It has two components only.|The solvent is not water.",
 "n|Number of water molecules in Epsom salt MgSO4.7H2O is|7|The 7 shows the water of crystallisation."],
svg=(ts,"Boxes showing six types of binary solutions with examples","Types of solutions"))
