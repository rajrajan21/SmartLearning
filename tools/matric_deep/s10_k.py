from lib import *
C=10;S='science'
EM='environmental-management'
def box(x,y,w,h,c,lines,fs=12):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
fw=svg(560,250,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Conserving forests and wildlife</text>'
 +box(10,45,175,100,'#d5f5e3',['Forests','afforestation, Van Mahotsav','social forestry','Forest Act 1980'],12)
 +box(192,45,175,100,'#fdebd0',['Wildlife','Wildlife Act 1972','sanctuaries, national parks','biosphere reserves'],12)
 +box(375,45,175,100,'#d6eaf8',['Projects','Project Tiger 1973','Project Elephant 1992','Sea turtle 1999'],12)
 +'<text x="280" y="180" text-anchor="middle" font-size="13">Chipko movement 1973: villagers hugged trees (Chamoli)</text><text x="280" y="205" text-anchor="middle" font-size="13">Jim Corbett National Park 1936; Nilgiris biosphere reserve in Tamil Nadu</text>')
en=svg(560,250,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Energy resources</text>'
 +box(20,45,250,110,'#fadbd8',['Non-renewable','coal, petroleum, natural gas','nuclear power','formed over millions of years','will be exhausted'],12)
 +box(290,45,250,110,'#d5f5e3',['Renewable','solar, wind, water, tidal','biogas, biomass, geothermal','can be renewed quickly','clean and inexhaustible'],12)
 +'<text x="280" y="190" text-anchor="middle" font-size="13">Fossil fuels give about 90 percent of commercial energy</text><text x="280" y="215" text-anchor="middle" font-size="13">Conserve: save electricity, use pressure cooker, walk or cycle</text>')
rw=svg(560,240,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Rainwater harvesting</text>'
 '<polygon points="60,110 140,60 220,110" fill="#fdebd0" stroke="#333"/><rect x="75" y="110" width="130" height="50" fill="#fcf3cf" stroke="#333"/>'
 '<line x1="100" y1="70" x2="100" y2="105" stroke="#2e86c1" stroke-width="2"/><line x1="140" y1="55" x2="140" y2="95" stroke="#2e86c1" stroke-width="2"/><line x1="180" y1="70" x2="180" y2="105" stroke="#2e86c1" stroke-width="2"/>'
 '<line x1="210" y1="130" x2="300" y2="130" stroke="#2e86c1" stroke-width="3"/><line x1="300" y1="130" x2="300" y2="185" stroke="#2e86c1" stroke-width="3"/>'
 '<rect x="270" y="185" width="70" height="40" fill="#d6eaf8" stroke="#333"/><text x="305" y="210" text-anchor="middle" font-size="11">recharge pit</text>'
 '<text x="420" y="85" text-anchor="middle" font-size="13">Roof top collection</text><text x="420" y="110" text-anchor="middle" font-size="13">Eris, Ooranis (Tamil Nadu)</text><text x="420" y="135" text-anchor="middle" font-size="13">Kallanai (Grand Anicut), Karikala Chola</text><text x="420" y="160" text-anchor="middle" font-size="13">Raises the groundwater level</text><text x="420" y="185" text-anchor="middle" font-size="13">Reduces floods and soil erosion</text>')
ww=svg(560,250,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Waste management: the 4R approach</text>'
 +box(10,55,125,80,'#fadbd8',['Reduce','use less'])+box(145,55,125,80,'#fdebd0',['Reuse','use again'])+box(280,55,125,80,'#fcf3cf',['Recover','extract materials'])+box(415,55,125,80,'#d5f5e3',['Recycle','make new items'])
 +'<text x="280" y="170" text-anchor="middle" font-size="13">Solid waste: segregation, sanitary landfill, incineration, composting</text><text x="280" y="195" text-anchor="middle" font-size="13">Sewage: pre-screening, aeration, sedimentation, disinfection, reuse</text><text x="280" y="220" text-anchor="middle" font-size="13">E-waste has lead, cadmium, mercury; only 5 percent is recycled</text>')

lesson(C,S,EM,'forests-wildlife-and-conservation',"Conservation of forests and wildlife","Villagers who hugged trees",
"In 1973 villagers in Chamoli hugged trees to stop them being cut. Their movement, Chipko, saved forests and inspired the world.",
["Natural resources are renewable (forests, crops, wind, solar) or non-renewable (coal, petroleum, minerals); conservation is their proper use and management. @ conservation",
 "Forests provide wood, food, fodder, fibre and medicine, act as carbon sinks, regulate climate, increase rainfall, prevent floods and landslides. @ importance of forests",
 "Deforestation (agriculture, urbanization, dams, roads, fires) causes floods, drought, soil erosion, species loss and desertification; India loses about 1.5 million hectares a year. @ deforestation",
 "Conservation measures: afforestation (Van Mahotsav), social forestry, National Forest Policy (1952, 1988) and the Forest Conservation Act 1980. @ forest conservation",
 "The Chipko movement of 1973 in Chamoli protected trees and won a 15 year ban on tree felling in Himalayan forests in 1980. @ Chipko",
 "Wildlife Protection Act 1972 prohibits hunting, creates sanctuaries and national parks and regulates trade in wild animal products. @ Wildlife Act",
 "Jim Corbett National Park (1936) was the first in India; there are 15 biosphere reserves, and the Nilgiris is one in Tamil Nadu. @ protected areas",
 "Initiatives: Project Tiger (1973), Project Elephant (1992), Crocodile project (1976) and Sea Turtle project (1999); bodies include IUCN, WWF and BNHS. @ projects"],
("How does deforestation lead to floods and drought?",[("Trees hold soil and slow rainwater.","Roots bind the soil."),("Without trees, rain runs off quickly causing floods and erosion.","Less water soaks in."),("Less transpiration reduces rainfall, and groundwater falls, causing drought.","Climate changes too.")]),
("Differentiate a national park from a sanctuary.",["National park conserves entire wildlife and habitat","Sanctuary protects animals only","Both are protected areas"],["Thinking both allow hunting"]),
["Forests and wildlife are linked and need conservation.","Chipko 1973; Wildlife Act 1972; Forest Act 1980.","Project Tiger 1973.","Nilgiris biosphere reserve is in Tamil Nadu."],
["m|Chipko movement began in|1973|1980~Ban year;1972~Wildlife Act;1992~Project Elephant|Chamoli.",
 "t|Wildlife Protection Act was passed in 1972.|True|It bans hunting.",
 "m|The Biosphere reserve in Tamil Nadu is|Nilgiris|Sundarbans~West Bengal;Nanda Devi~Uttarakhand;Manas~Assam|One of 15.",
 "s|Project Tiger was launched in ____.|1973|India's tiger conservation.",
 "m|First national park in India|Jim Corbett|Kaziranga~Assam;Periyar~Kerala;Gir~Gujarat|1936.",
 "t|Overgrazing prevents soil erosion.|False|It causes erosion.",
 "n|Years of tree felling ban won by Chipko|15|In 1980.",
 "m|Van Mahotsav is related to|afforestation|mining~Not related;fishing~Not related;hunting~Not related|Tree planting.",
 "t|Forests act as carbon sinks.|True|They absorb CO2.",
 "s|Deforestation can cause the spread of ____ (turning land to desert).|desertification|One effect."],
svg=(fw,"Three panels for forest conservation wildlife protection and conservation projects","Forest and wildlife conservation"))

lesson(C,S,EM,'soil-erosion-and-fossil-fuels',"Soil erosion and conservation of fossil fuels","Soil is not forever",
"Soil takes centuries to form but only a few storms to be lost. Coal and petroleum take millions of years to form but we use them in decades.",
["Soil erosion is removal of the fertile top soil, rich in humus and minerals, by wind and water. @ soil erosion",
 "Agents of erosion: high speed wind, flowing water, landslides, deforestation, farming, mining and overgrazing. @ agents",
 "Control: keep vegetation cover, control grazing, crop rotation, store runoff, terracing, contour ploughing, shelter belts of trees. @ control of erosion",
 "Non-renewable energy (coal, petroleum, natural gas, nuclear) supplies about 90 percent of commercial energy and cannot be renewed quickly. @ non-renewable energy",
 "Fossil fuels formed from buried dead organisms over millions of years by heat and pressure into hydrocarbons. @ fossil fuels",
 "Coal produces electricity in thermal power plants; petroleum gives petrol, diesel, kerosene and LPG. @ uses",
 "Conserve fuels by saving electricity, cycling short distances, using pressure cookers and fuel efficient engines. @ conservation of fuels",
 "Case study: the Mathura refinery releases sulphur and nitrogen oxides that yellowed the Taj Mahal marble, so emission standards were set. @ Taj Mahal case study"],
("Suggest three ways a farmer on a slope can prevent soil erosion.",[("Terracing makes level steps that slow runoff.","Holds water and soil."),("Contour ploughing runs furrows across the slope.","Water cannot rush downhill."),("Planting trees as shelter belts reduces wind erosion.","Keeps vegetation cover.")]),
("Why should coal and petroleum be conserved though they are made of biomass?",["They take millions of years to form","Use is far faster than formation","They are exhaustible resources"],["Thinking they are renewable"]),
["Soil erosion removes fertile topsoil.","Prevent by vegetation, terracing, contour ploughing.","Fossil fuels are exhaustible.","Save fuel and electricity."],
["m|Removal of upper soil layer by wind and water|soil erosion|soil formation~Opposite;weathering~Rock breaking;leaching~Washing minerals|Loses humus.",
 "t|Terracing reduces soil erosion.|True|A hill farming method.",
 "m|Which is a fossil fuel?|petroleum|wood~Biomass;biogas~Not fossil;solar~Renewable|From buried organisms.",
 "s|Shelter belts of ____ reduce wind erosion.|trees|They slow wind.",
 "t|Nuclear power is renewable.|False|It is non-renewable.",
 "m|The Taj Mahal marble turned yellow due to|air pollution|ageing~Not cause;flood~Not cause;sunlight~Not cause|Sulphur and nitrogen oxides.",
 "n|Percent of world commercial energy from non-renewables (approx.)|90|Mostly fossil fuels.",
 "m|LPG is obtained from|petroleum|coal~Gives coke;wood~Biomass;biogas~Gobar gas|Used for cooking.",
 "t|Crop rotation improves soil organic matter.|True|Helps control erosion.",
 "s|Natural resources that cannot be renewed quickly are called ____ resources.|non-renewable|E.g. coal."],
svg=(en,"Two panels contrasting renewable and non-renewable energy resources","Energy resources"))

lesson(C,S,EM,'non-conventional-energy-and-rainwater-harvesting',"Non-conventional energy and rainwater harvesting","Tamil Nadu's wise ancestors",
"The Kallanai dam built by Karikala Chola in the 2nd century still waters the Kaveri delta. Our ancestors knew how to manage water and energy.",
["Non-conventional energy sources are renewable and clean: solar, biogas, wind, water, tidal, biomass and geothermal. @ non-conventional energy",
 "Solar cells (silicon photovoltaic devices) convert sunlight directly to electricity; many cells form a solar panel; solar cookers and heaters use sunlight directly. @ solar energy",
 "Biogas (about 75 percent methane) is produced from cow dung and wastes in the absence of oxygen; it burns smokelessly and leaves rich manure. @ biogas",
 "Wind turbines convert the kinetic energy of wind into electricity and pumping; it is free and pollution free. @ wind energy",
 "Hydropower uses falling water, while tidal energy uses the rise and fall of ocean tides to turn turbines. @ water and tidal energy",
 "Shale gas is extracted by hydraulic fracturing, which can contaminate groundwater and uses a lot of water. @ shale gas",
 "Rainwater harvesting stores rain to recharge groundwater, using roof tops, recharge pits, eris and ooranis. @ rainwater harvesting",
 "Eris are interconnected tanks in Tamil Nadu; ooranis are small ponds; the Grand Anicut (Kallanai) was built by Karikala Chola in the 2nd century CE. @ traditional methods",
 "Save electricity with CFL and LED bulbs, switching off unused appliances and using solar water heaters. @ electricity saving"],
("List the advantages and one limitation of solar energy.",[("It is abundant, free, renewable and pollution free.","No fuel needed."),("It is used for electricity or heating.","Solar cells and cookers."),("The limitation is that solar panels are expensive to make and work only in sunlight.","Cost is high.")]),
("How does rooftop rainwater harvesting raise groundwater?",["Roof rain is piped to a filter","Filtered water enters recharge pits","Water percolates to the water table"],["Thinking it only stores water in tanks"]),
["Renewable sources are clean.","Biogas is mostly methane.","Rainwater harvesting recharges groundwater.","Kallanai built by Karikala Chola."],
["m|Solar cells are made of|silicon|copper~Conductor;iron~Metal;carbon~Non-metal|Convert light to electricity.",
 "t|Biogas is a fossil fuel.|False|Renewable.",
 "s|Biogas is also called ____ gas.|gobar|From cow dung.",
 "m|Main constituent of biogas|methane|ethane~Not main;oxygen~Not present;hydrogen~Small amount|About 75 percent.",
 "t|Wind energy is free and eco-friendly.|True|Renewable.",
 "m|Ooranis are|small ponds|dams~Large;canals~Channels;wells~Dug|Used by villages.",
 "n|Century CE in which the Grand Anicut was built|2|By Karikala Chola.",
 "m|Hydraulic fracturing is used for|shale gas|biogas~Not used;tidal energy~Not used;solar~Not used|Risk to groundwater.",
 "t|Eris are interconnected tanks in Tamil Nadu.|True|Overflow flows to the next.",
 "s|Technique of collecting rain for later use is rainwater ____.|harvesting|Recharges groundwater."],
svg=(rw,"A house roof with rain pipes leading to a recharge pit and facts about traditional Tamil Nadu water methods","Rainwater harvesting"))

lesson(C,S,EM,'waste-management-sewage-solid-and-e-waste',"Waste management: sewage, solid waste and e-waste","The 4R habit",
"Every day we throw away plastics, food scraps, old phones and dirty water. Managing this waste decides the health of our soil, rivers and air.",
["Sewage is wastewater from homes and industries (dye, textile, leather, sugar, paper); untreated sewage is the leading polluter of water sources in India. @ sewage",
 "Sewage treatment: pre-screening, aeration, sedimentation and sludge removal, disinfection by chlorine or UV, and reuse. @ sewage treatment",
 "Solid waste (municipal, hospital, industrial, e-waste) is managed by segregation, sanitary landfill, incineration and composting. @ solid waste",
 "Composting turns biodegradable waste into humus using microbes or earthworms; incineration burns non-biodegradable medical waste. @ composting and incineration",
 "The 4R approach is Reduce, Reuse, Recover and Recycle; paper, bagasse, paddy husk and cowdung are recycled or reused. @ 4R approach",
 "E-waste is discarded electronic equipment (computers, phones, appliances, batteries) holding lead, cadmium, chromium and mercury. @ e-waste",
 "Computers make 66 percent of e-waste and only 5 percent of e-waste is recycled. @ e-waste facts",
 "Health effects: lead harms the nervous system, cadmium accumulates in kidney and liver, mercury damages brain and lungs and burning PVC releases dioxin. @ health effects"],
("Why must biodegradable and non-biodegradable wastes be segregated?",[("Biodegradable waste can be composted into manure.","Microbes decompose it."),("Non-biodegradable waste like plastic needs recycling or special disposal.","It stays for centuries."),("Mixing them spoils compost and pollutes soil, so segregation is the first step.","Saves resources.")]),
("Describe the steps in sewage treatment.",["Pre-screening removes solids","Aeration lets microbes degrade matter","Sedimentation separates sludge","Disinfection and reuse"],["Missing the disinfection step"]),
["Sewage treatment: screening, aeration, sedimentation, disinfection.","4R: Reduce, Reuse, Recover, Recycle.","E-waste has toxic metals.","Segregate and compost waste."],
["m|The 4R approach includes|Reduce, Reuse, Recover, Recycle|Reduce, Reject, Reuse, Repair~Wrong set;Reuse, Repair, Reform, Rest~Wrong set;Remove, Reduce, Reuse, Rest~Wrong set|Waste management.",
 "t|Only about 5 percent of e-waste is recycled.|True|Most is dumped.",
 "m|Metal that damages the nervous system in e-waste|lead|iron~Not toxic;gold~Valuable;zinc~Less toxic|Affects children's brains.",
 "s|Burning of non-biodegradable medical waste is called ____.|incineration|At high temperature.",
 "t|Composting changes waste into humus.|True|By microbes or earthworms.",
 "m|Chlorination is used for|disinfection|aeration~Adds air;screening~Removes solids;sedimentation~Settling|Kills microbes.",
 "n|Percent of e-waste made of computer components|66|Biggest share.",
 "m|Burning PVC produces|dioxin|ozone~Gas;oxygen~Gas;nitrogen~Gas|Harms reproduction.",
 "t|Untreated sewage pollutes water sources.|True|India's leading polluter.",
 "s|Settled particles in sewage form ____.|sludge|Removed periodically."],
svg=(ww,"Four boxes showing the 4R approach with notes on solid waste sewage and e-waste","Waste management 4R"))
print('ok')
