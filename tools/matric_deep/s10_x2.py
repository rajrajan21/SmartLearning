from lib import *
from bx import *
C=10;S='science'
rt=svg(560,290,title(560,'Four types of chemical reactions')
 +box(10,40,265,105,'#d5f5e3',['Combination','A + B -> AB','2Na + Cl2 -> 2NaCl','usually exothermic'],13)
 +box(285,40,265,105,'#fadbd8',['Decomposition','AB -> A + B','2HgO -> 2Hg + O2 (heat)','thermal, electrolytic, photo'],13)
 +box(10,155,265,105,'#d6eaf8',['Single displacement','A + BC -> AC + B','Zn + 2HCl -> ZnCl2 + H2','more active metal displaces'],13)
 +box(285,155,265,105,'#fcf3cf',['Double displacement','AB + CD -> AD + CB','precipitation, neutralization','ions are exchanged'],13)
 +'<text x="280" y="282" text-anchor="middle" font-size="12">Activity series: K Na Li Ca Mg Al Zn Fe Pb H Cu Ag Au Pt (most to least reactive)</text>')
lesson(C,S,'types-of-chemical-reactions','balancing-and-reaction-types',"Types of chemical reactions","The iron nail in blue solution",
"Drop a clean iron nail into blue copper sulphate solution. After a few minutes the nail turns reddish brown and the blue colour fades. Atoms have changed partners, and the way they rearrange decides the type of reaction.",
["Based on how the atoms of the reactants are rearranged, chemical reactions are classified as combination, decomposition, single displacement and double displacement reactions. @ four types",
 "In a combination reaction two or more reactants combine to form one compound, A + B gives AB; it is also called a synthesis reaction. @ A + B -> AB",
 "It can be element plus element, as in 2Na + Cl2 giving 2NaCl, compound plus element, as in PCl3 + Cl2 giving PCl5, or compound plus compound, as in SiO2 + CaO giving CaSiO3. @ three classes",
 "Most combination reactions are exothermic because forming new bonds releases energy as heat. @ exothermic",
 "In a decomposition reaction a single compound splits into two or more simpler substances; it is the opposite of combination, AB gives A + B. @ AB -> A + B",
 "Decomposition needs energy to break bonds, so it is endothermic; it is called thermal if heat is used, as in 2HgO giving 2Hg + O2, or CaCO3 giving CaO + CO2. @ thermal decomposition",
 "In electrolytic decomposition an electric current is used, as when molten or aqueous sodium chloride gives sodium and chlorine; in photo decomposition light is used, as when silver bromide gives silver and bromine. @ electrolytic and photo",
 "In a single displacement reaction a more active element displaces a less active one from its compound, A + BC gives AC + B, as in Zn + 2HCl giving ZnCl2 + H2. @ A + BC -> AC + B",
 "Whether it happens depends on the activity series: iron displaces copper from copper sulphate, Fe + CuSO4 giving FeSO4 + Cu, but silver cannot displace hydrogen from hydrochloric acid. @ activity series",
 "In a double displacement reaction two compounds exchange ions, AB + CD gives AD + CB; it is also called metathesis. @ AB + CD -> AD + CB",
 "If an insoluble solid forms, such as yellow lead iodide when potassium iodide meets lead nitrate, it is a precipitation reaction; an acid reacting with a base to give salt and water is a neutralization reaction. @ precipitation and neutralization",
 "To tell the types apart, count the reactants and products: one product means combination, one reactant means decomposition, an element plus a compound means single displacement, and two compounds swapping ions means double displacement. @ how to identify"],
("Classify each reaction: (a) CaCO3 gives CaO + CO2 on heating, (b) Fe + CuSO4 gives FeSO4 + Cu, (c) 2H2 + O2 gives 2H2O.",
 [("(a) One compound splits into two simpler substances using heat, so it is a thermal decomposition reaction.","Single reactant, more than one product."),
  ("(b) Iron, an element, replaces copper in the compound, so it is a single displacement reaction; iron is above copper in the activity series.","Element plus compound gives compound plus element."),
  ("(c) Two elements join to make one compound, so it is a combination reaction, and it is exothermic.","Several reactants, one product.")]),
("Name the four types of reactions, give one equation for each, and tell how you identify them.",
 ["Combination, decomposition, single and double displacement","Number and kind of reactants and products","Activity series decides single displacement"],
 ["Thinking every reaction between a metal and an acid is double displacement","Ignoring the activity series when predicting displacement"]),
["Combination: A + B gives AB; decomposition: AB gives A + B (thermal, electrolytic, photo).","Single displacement: a more active element displaces a less active one; use the activity series.","Double displacement: exchange of ions, giving a precipitate or salt and water.","Combination is usually exothermic and decomposition is endothermic."],
["m|2Na + Cl2 gives 2NaCl is a|combination reaction|decomposition reaction~Two substances combine into one.;single displacement reaction~Nothing is displaced here.;double displacement reaction~No exchange of ions between two compounds.|Two elements join to form one compound.",
 "m|Heating calcium carbonate to give calcium oxide and carbon dioxide is|thermal decomposition|photo decomposition~Light is not used.;electrolytic decomposition~No electric current is used.;combination~One reactant splits into two products.|Heat breaks the compound, so it is thermal.",
 "t|Silver can displace hydrogen from dilute hydrochloric acid.|False|Silver is below hydrogen in the activity series, so it cannot displace it.",
 "t|Most combination reactions are exothermic.|True|Forming new bonds releases heat.",
 "s|The reaction Fe + CuSO4 gives FeSO4 + Cu is a ____ displacement reaction.|single|An element displaces another from its compound.",
 "m|Zn + 2HCl gives ZnCl2 + H2 happens because|zinc is more reactive than hydrogen|zinc is less reactive than hydrogen~Then no reaction would occur.;zinc is a gas~Zinc is a solid metal.;hydrochloric acid is a metal~It is an acid.|Zinc is above hydrogen in the activity series.",
 "m|The yellow precipitate formed when potassium iodide meets lead nitrate is|lead iodide|potassium nitrate~That stays dissolved.;lead nitrate~That is a reactant.;potassium iodide~That is a reactant.|PbI2 is the yellow insoluble solid.",
 "s|Decomposition caused by light, as in silver bromide, is also called ____.|photolysis|Photo means light and lysis means breaking.",
 "m|An acid reacting with a base to give salt and water is|neutralization, a double displacement reaction|combination reaction~Two compounds exchange ions here.;thermal decomposition~No heat splitting takes place.;single displacement reaction~Two compounds react, not an element and a compound.|Ions are exchanged between the acid and the base.",
 "m|Which pair is arranged from most to least reactive?|Mg, Zn, Fe, Cu|Cu, Fe, Zn, Mg~That is the reverse order.;Zn, Mg, Cu, Fe~Mg is more reactive than Zn, and Cu is the least of these.;Fe, Cu, Mg, Zn~The order is mixed up.|Activity series order is Mg, Zn, Fe, Cu."],
svg=(rt,"Four boxes showing combination, decomposition, single displacement and double displacement reactions","The four types of chemical reactions"))
