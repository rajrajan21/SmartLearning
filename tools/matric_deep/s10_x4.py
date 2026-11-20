from lib import *
from bx import *
C=10;S='science';CH='carbon-and-its-compounds'
hc=svg(560,290,DEF+title(560,'Hydrocarbons and functional groups')
 +box(200,36,160,34,'#fcf3cf',['Hydrocarbons (C and H only)'],12)
 +box(10,110,170,72,'#d5f5e3',['Alkanes','CnH2n+2, C-C single','CH4, C2H6, C3H8','saturated'],12)
 +box(195,110,170,72,'#fadbd8',['Alkenes','CnH2n, C=C double','C2H4, C3H6, C4H8','unsaturated'],12)
 +box(380,110,170,72,'#d6eaf8',['Alkynes','CnH2n-2, C triple C','C2H2, C3H4, C4H6','unsaturated'],12)
 +arrow(250,70,95,108)+arrow(280,70,280,108)+arrow(310,70,465,108)
 +'<text x="280" y="212" text-anchor="middle" font-size="13">Functional groups: -OH alcohol, -CHO aldehyde, C=O ketone</text><text x="280" y="234" text-anchor="middle" font-size="13">-COOH carboxylic acid, -COOR ester, -O- ether</text>'
 +'<text x="280" y="262" text-anchor="middle" font-size="12">Bromine water test: unsaturated compounds decolourise it, alkanes do not</text>')
lesson(C,S,CH,'hydrocarbons-and-functional-groups',"Hydrocarbons and functional groups","The gas in the kitchen",
"The cooking gas in your kitchen, the petrol in a scooter and the wax in a candle are all made mostly of carbon and hydrogen. Such compounds are called hydrocarbons, and adding one more kind of atom changes their behaviour completely.",
["Organic compounds are first classified by the pattern of the carbon chain: open chain or acyclic compounds, and closed chain or cyclic compounds. @ open chain and closed chain",
 "Open chain compounds with only C-C single bonds are saturated, like ethane C2H6; those with double or triple bonds are unsaturated, like ethene and ethyne. @ saturated and unsaturated",
 "Cyclic compounds are carbocyclic, with a ring of carbon only, such as cyclobutane and benzene, or heterocyclic, with a ring that also has another element, such as pyridine and furan. @ carbocyclic and heterocyclic",
 "Hydrocarbons are compounds of carbon and hydrogen only, and all other organic compounds are considered to be derived from them by replacing hydrogen atoms. @ hydrocarbons",
 "Alkanes have only single bonds and the general formula CnH2n+2, for example methane CH4, ethane C2H6, propane C3H8, butane C4H10 and pentane C5H12. @ alkanes: CnH2n+2",
 "Alkenes have one or more C=C bonds and the formula CnH2n, such as ethene C2H4, propene C3H6, butene C4H8 and pentene C5H10. @ alkenes: CnH2n",
 "Alkynes have a C triple bond C and the formula CnH2n-2, such as ethyne or acetylene C2H2, propyne C3H4, butyne C4H6 and pentyne C5H8. @ alkynes: CnH2n-2",
 "Hydrocarbons are colourless and odourless, insoluble in water, their boiling point rises with the number of carbon atoms, and they burn in oxygen to give carbon dioxide and water; the lower ones are gases. @ properties of hydrocarbons",
 "Alkanes are the least reactive and alkynes the most reactive because of the triple bond. @ reactivity",
 "Test for unsaturation: add a few drops of bromine water; an alkene or alkyne decolourises it, but a saturated alkane does not. @ bromine water test",
 "A functional group is an atom or group of atoms that gives a compound its characteristic chemical properties; if one hydrogen of ethane is replaced by -OH, we get the alcohol ethanol, written R-OH. @ functional group",
 "Common classes are alcohol R-OH, aldehyde R-CHO, ketone R-CO-R, carboxylic acid R-COOH, ester R-COOR and ether R-O-R. @ classes of compounds",
 "The chemical properties of a compound depend on its functional group, while its physical properties depend on the rest of the structure. @ chemical and physical properties"],
("Write the formula of the alkane, alkene and alkyne with 3 carbon atoms, and say how you would tell which is saturated.",
 [("Alkane: CnH2n+2 with n = 3 gives C3H8, propane.","Use the general formula."),
  ("Alkene: CnH2n with n = 3 gives C3H6, propene.","One double bond means two hydrogens fewer than the alkane."),
  ("Alkyne: CnH2n-2 with n = 3 gives C3H4, propyne.","A triple bond means four hydrogens fewer."),
  ("Add bromine water to each: propane leaves it brown, so it is saturated; propene and propyne decolourise it.","Unsaturated compounds react with bromine.")]),
("Describe alkanes, alkenes and alkynes with their formulae and explain what a functional group is.",
 ["CnH2n+2, CnH2n, CnH2n-2","Saturated and unsaturated","Functional group decides chemical properties"],
 ["Thinking alkanes are the most reactive","Mixing up the general formulae of alkenes and alkynes"]),
["Alkanes CnH2n+2 are saturated; alkenes CnH2n and alkynes CnH2n-2 are unsaturated.","Unsaturated compounds decolourise bromine water; saturated ones do not.","A functional group (-OH, -CHO, -COOH and so on) decides the chemical properties.","Hydrocarbons burn in oxygen to give CO2 and water and are insoluble in water."],
["m|The general formula of alkanes is|CnH2n+2|CnH2n~That is the formula of alkenes.;CnH2n-2~That is the formula of alkynes.;CnH2n+1~This is not a hydrocarbon formula in the textbook.|Alkanes have only single bonds.",
 "n|Number of hydrogen atoms in butane C4H10 is|10|2 x 4 + 2 = 10.",
 "m|Which decolourises bromine water?|ethene|ethane~Ethane is saturated.;methane~Methane is saturated.;propane~Propane is saturated.|Ethene has a C=C double bond.",
 "t|Alkanes are the most reactive class of hydrocarbons.|False|Alkanes are the least reactive; alkynes are the most reactive.",
 "s|The atom or group of atoms that decides the chemical properties of an organic compound is the ____ group.|functional|Examples are -OH and -COOH.",
 "n|Number of hydrogen atoms in propyne C3H4 is|4|2 x 3 - 2 = 4.",
 "m|The functional group of an alcohol is|-OH|-CHO~That is the aldehyde group.;-COOH~That is the carboxylic acid group.;-O-~That is the ether group.|Ethanol CH3CH2OH has -OH.",
 "t|Hydrocarbons are insoluble in water.|True|They are non-polar, so they do not dissolve in water.",
 "m|A ring containing carbon and another element such as nitrogen is|heterocyclic|acyclic~Acyclic compounds are open chain.;carbocyclic~Carbocyclic rings have only carbon.;saturated~That describes bonds, not the ring type.|Pyridine is a heterocyclic compound.",
 "m|Hydrocarbons burn in air to give|carbon dioxide and water|carbon and hydrogen~That would be decomposition.;ethanol and oxygen~Those are not the products.;methane and water~Methane is a hydrocarbon, not a product here.|Combustion gives CO2 and H2O."],
svg=(hc,"Diagram of alkanes, alkenes and alkynes with formulae and functional groups","Hydrocarbons and functional groups"))

register(C,S,CH,'homologous-series-and-iupac-names',"Homologous series and IUPAC nomenclature")
hs=svg(560,270,DEF+title(560,'A homologous series: alkanes differ by CH2 (14 amu)')
 +box(10,60,100,70,'#d5f5e3',['Methane','CH4'],13)+box(120,60,100,70,'#d5f5e3',['Ethane','CH3CH3'],13)+box(230,60,100,70,'#d5f5e3',['Propane','CH3CH2CH3'],12)+box(340,60,100,70,'#d5f5e3',['Butane','CH3(CH2)2CH3'],11)+box(450,60,100,70,'#d5f5e3',['Pentane','CH3(CH2)3CH3'],11)
 +arrow(110,95,118,95)+arrow(220,95,228,95)+arrow(330,95,338,95)+arrow(440,95,448,95)
 +'<text x="280" y="165" text-anchor="middle" font-size="13">Each step adds one -CH2 group: same functional group, same general formula</text>'
 +'<text x="280" y="195" text-anchor="middle" font-size="13">IUPAC name = Prefix + Root word + Suffix</text>'
 +'<text x="280" y="222" text-anchor="middle" font-size="13">Root words: Meth 1, Eth 2, Prop 3, But 4, Pent 5, Hex 6, Hept 7, Oct 8, Non 9, Dec 10</text>')
lesson(C,S,CH,'homologous-series-and-iupac-names',"Homologous series and IUPAC nomenclature","Formic acid and the red ants",
"Formic acid got its name from Formica, the Latin word for red ants, because it was first obtained from them. As thousands of organic compounds were discovered, such source-based names became impossible to manage, so scientists made a system of naming by structure.",
["A homologous series is a group of organic compounds with the same general formula and similar chemical properties, in which successive members differ by a CH2 group. @ homologous series",
 "Look at the alkanes: methane CH4, ethane CH3CH3, propane CH3CH2CH3, butane CH3(CH2)2CH3 and pentane CH3(CH2)3CH3, each with one more CH2 than the one before. @ alkane series",
 "Each member differs from the next by one methylene group, which means a difference of 14 amu in molecular mass. @ 14 amu",
 "All members of a series contain the same elements and the same functional group, and they are represented by one general formula, such as CnH2n+2 for alkanes. @ same functional group and formula",
 "Their physical properties change regularly with increasing molecular mass, their chemical properties are similar, and they can be prepared by a common method. @ regular gradation",
 "In ancient days names came from natural sources, as formic acid came from red ants, but later compounds were made from other sources, so a systematic method of naming was needed. @ why nomenclature",
 "IUPAC, the International Union of Pure and Applied Chemistry, framed the rules for naming organic compounds by their structure. @ IUPAC",
 "An IUPAC name has three parts, written in this order: prefix, root word and suffix. @ prefix, root word, suffix",
 "The root word tells the number of carbon atoms in the parent chain: Meth 1, Eth 2, Prop 3, But 4, Pent 5, Hex 6, Hept 7, Oct 8, Non 9 and Dec 10. @ root word",
 "The prefix shows the substituents or branches, which are atoms or groups other than hydrogen attached to the parent chain. @ prefix",
 "The suffix shows the type of bonding or the functional group, such as -ane for single bonds, -ene for a double bond, -yne for a triple bond and -ol for the alcohol group. @ suffix",
 "So CH3CH2CH3 has three carbons, root Prop, and single bonds, suffix -ane, giving propane, while CH3CH2OH has two carbons and an -OH group, giving ethanol. @ propane and ethanol"],
("Give the IUPAC name of a straight-chain compound with 4 carbon atoms and a C=C double bond, and write its formula.",
 [("Four carbons give the root word But.","Use the root word table."),
  ("A double bond gives the suffix -ene, so the name is butene.","Suffix tells the bond."),
  ("Alkenes follow CnH2n, so with n = 4 the formula is C4H8.","Use the general formula for the series.")]),
("Explain what a homologous series is and how an IUPAC name is built.",
 ["Same general formula, successive members differ by CH2","Prefix, root word, suffix","Root word gives the number of carbons"],
 ["Thinking members differ by one carbon and two hydrogens in different ways","Mixing up the prefix and the suffix"]),
["Homologous series: same functional group and general formula; successive members differ by CH2 (14 amu).","IUPAC name = prefix + root word + suffix.","Root words: Meth, Eth, Prop, But, Pent, Hex, Hept, Oct, Non, Dec for 1 to 10 carbons.","Physical properties change regularly along the series; chemical properties stay similar."],
["n|The difference in molecular mass between successive members of a homologous series, in amu, is|14|One CH2 group is 12 + 2 = 14 amu.",
 "m|The root word for 3 carbon atoms is|Prop|Eth~Eth means 2 carbons.;But~But means 4 carbons.;Meth~Meth means 1 carbon.|Propane has three carbons.",
 "s|The root word for 5 carbon atoms is ____.|Pent|Pentane has five carbons.",
 "t|All members of a homologous series have the same functional group.|True|That is why their chemical properties are similar.",
 "m|Formic acid was named from the Latin name of|the red ant, Formica|the honey bee~It came from red ants.;the lemon~It is not from lemon.;the marble~It is not from marble.|It was first obtained from red ants.",
 "m|IUPAC stands for|International Union of Pure and Applied Chemistry|Indian Union of Physical and Applied Chemistry~That is not the organisation.;International Union of Physics and Astronomy~That is a different field.;Indian Union of Pure Chemistry~That is not the organisation.|It framed the rules for naming compounds.",
 "m|The three parts of an IUPAC name in order are|prefix, root word, suffix|root word, prefix, suffix~The order is different.;suffix, prefix, root word~The order is different.;prefix, suffix, root word~The order is different.|Prefix, then root word, then suffix.",
 "n|Number of carbon atoms in hexane is|6|Hex means 6.",
 "t|Successive members of a homologous series differ by a CH3 group.|False|They differ by a CH2 group.",
 "m|The name of CH3CH2CH3 is|propane|ethane~Ethane has 2 carbons.;butane~Butane has 4 carbons.;propene~Propene has a double bond.|Three carbons with single bonds."],
svg=(hs,"Ladder of five alkanes each differing by one CH2 with IUPAC name parts","Homologous series and IUPAC naming"))
