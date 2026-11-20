from lib import *
C=10;S='science';CH='plant-anatomy-and-plant-physiology'
def box(x,y,w,h,t,f,t2=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{f}" stroke="#333"/><text x="{x+w/2}" y="{y+h/2+(-4 if t2 else 5)}" text-anchor="middle" font-size="14">{t}</text>'+(f'<text x="{x+w/2}" y="{y+h/2+14}" text-anchor="middle" font-size="12">{t2}</text>' if t2 else '')
def arrow(x1,y1,x2,y2): return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#333" stroke-width="2"/><polygon points="{x2},{y2} {x2-8 if x2>x1 else x2+8},{y2-5} {x2-8 if x2>x1 else x2+8},{y2+5}" fill="#333"/>' if y1==y2 else f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#333" stroke-width="2"/><polygon points="{x2},{y2} {x2-5},{y2-8} {x2+5},{y2-8}" fill="#333"/>'
tissue=svg(560,250,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Plant tissue systems</text>'+box(210,40,140,40,'Plant tissues','#fcf3cf')+arrow(240,80,110,110)+arrow(280,80,280,110)+arrow(320,80,450,110)
 +box(20,110,180,50,'Dermal system','#d6eaf8','epidermis, stomata, root hairs')+box(190,110,180,50,'Ground system','#d5f5e3','cortex, pith, endodermis')+box(380,110,170,50,'Vascular system','#fadbd8','xylem and phloem')
 +'<text x="110" y="190" text-anchor="middle" font-size="13">protection, less water loss</text><text x="280" y="190" text-anchor="middle" font-size="13">storage, photosynthesis, support</text><text x="465" y="190" text-anchor="middle" font-size="13">water up, food down</text>'
 +'<text x="280" y="225" text-anchor="middle" font-size="13">Xylem: water and minerals     Phloem: food</text>')
leaf=svg(560,300,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Dicot (dorsiventral) leaf: section</text>'
 '<rect x="60" y="50" width="440" height="22" fill="#a9dfbf" stroke="#333"/><text x="520" y="66" font-size="13">Upper epidermis (cuticle)</text>'
 '<rect x="60" y="72" width="440" height="60" fill="#58d68d" stroke="#333"/><text x="280" y="108" text-anchor="middle" font-size="14">Palisade parenchyma (many chloroplasts)</text>'
 '<rect x="60" y="132" width="440" height="80" fill="#abebc6" stroke="#333"/><text x="170" y="180" text-anchor="middle" font-size="14">Spongy parenchyma (air spaces)</text>'
 '<circle cx="380" cy="165" r="26" fill="#fdebd0" stroke="#333"/><text x="380" y="162" text-anchor="middle" font-size="12">xylem</text><text x="380" y="176" text-anchor="middle" font-size="12">phloem</text>'
 '<rect x="60" y="212" width="440" height="22" fill="#a9dfbf" stroke="#333"/><rect x="250" y="212" width="40" height="22" fill="#fff" stroke="#333"/><text x="520" y="228" font-size="13">Lower epidermis</text><text x="270" y="262" text-anchor="middle" font-size="13">Stoma (more in the lower epidermis)</text>'
 '<text x="380" y="215" font-size="12" fill="#a04000">vascular bundle</text>')
photo=svg(560,300,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Photosynthesis inside the chloroplast</text>'
 '<ellipse cx="280" cy="160" rx="250" ry="110" fill="#d5f5e3" stroke="#1e8449" stroke-width="2"/>'
 +box(60,110,150,70,'Grana (thylakoids)','#a9dfbf','LIGHT reaction')+box(350,110,150,70,'Stroma','#fcf3cf','DARK reaction (Calvin)')
 +arrow(210,145,350,145)+'<text x="280" y="135" text-anchor="middle" font-size="13">ATP + NADPH</text>'
 '<text x="130" y="95" text-anchor="middle" font-size="13">Sunlight + H2O in, O2 out</text><text x="425" y="95" text-anchor="middle" font-size="13">CO2 in, glucose out</text>'
 '<text x="280" y="250" text-anchor="middle" font-size="14">6CO2 + 12H2O -> C6H12O6 + 6H2O + 6O2 (light, chlorophyll)</text>')
resp=svg(560,260,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Aerobic respiration in three stages</text>'
 +box(20,60,150,70,'Glycolysis','#fdebd0','cytoplasm')+box(205,60,150,70,'Krebs cycle','#fadbd8','mitochondrial matrix')+box(390,60,150,70,'Electron transport','#d6eaf8','inner membrane')
 +arrow(170,95,205,95)+arrow(355,95,390,95)+
 '<text x="95" y="155" text-anchor="middle" font-size="13">glucose (6C) -> 2 pyruvic acid (3C)</text><text x="280" y="155" text-anchor="middle" font-size="13">pyruvic acid -> CO2 + H2O</text><text x="465" y="155" text-anchor="middle" font-size="13">O2 -> water; ATP made</text>'
 '<text x="280" y="215" text-anchor="middle" font-size="14">C6H12O6 + 6O2 -> 6CO2 + 6H2O + ATP</text>')

lesson(C,S,CH,'tissue-systems-and-vascular-bundles',"Tissue systems and vascular bundles of plants","The plant's roads and pipes",
"A tall tree must lift water from its roots to its highest leaf and send sugar from leaves to roots. Inside the plant, special tissues act as pipes and roads to do this.",
["Plant anatomy is the study of the internal structure of plants; Nehemiah Grew is called the Father of Plant Anatomy. @ plant anatomy",
 "Tissues are groups of cells with a common origin that perform similar functions. They are meristematic (dividing) or permanent. @ tissues",
 "Sachs classified plant tissues into three systems: dermal, ground and vascular. @ three tissue systems",
 "The dermal system is the epidermis with stomata and outgrowths like root hairs and trichomes; it protects the plant and reduces water loss through the cuticle. @ dermal system",
 "The ground system is everything except epidermis and vascular tissue - cortex, endodermis, pericycle and pith - made of parenchyma, collenchyma and sclerenchyma for storage, photosynthesis and support. @ ground system",
 "The vascular system has xylem, which conducts water and minerals, and phloem, which conducts food, arranged in vascular bundles. @ xylem and phloem",
 "In a radial bundle xylem and phloem lie on different radii, alternating with each other, as in roots. @ radial bundle",
 "In a conjoint bundle they lie on the same radius. If phloem is outside the xylem and there is cambium, it is collateral and open, as in a dicot stem; without cambium it is closed, as in a monocot stem. @ conjoint collateral open and closed",
 "A bicollateral bundle has phloem on both sides of the xylem, for example Cucurbita. @ bicollateral",
 "In a concentric bundle one tissue surrounds the other: amphivasal if xylem surrounds phloem (Dracaena) and amphicribral if phloem surrounds xylem (ferns). @ concentric bundle"],
("A transverse section shows vascular bundles scattered with no cambium. Which stem is it?",[("Cambium absent means the bundles are closed.","Closed bundles do not add secondary growth."),("Scattered bundles are characteristic of monocots.","Dicot bundles are arranged in a ring."),("So it is a monocot stem like maize.","Dicot stems like sunflower have open bundles in a ring.")]),
("Describe the three tissue systems of a plant and one function of each.",["Dermal: protection","Ground: storage or photosynthesis","Vascular: transport by xylem and phloem"],["Thinking xylem carries food (it carries water and minerals; phloem carries food)"]),
["Three tissue systems: dermal, ground, vascular.","Xylem carries water and minerals; phloem carries food.","Bundle types: radial, conjoint (collateral, bicollateral) and concentric.","Open bundles have cambium (dicot stem); closed ones do not (monocot stem)."],
["m|Which tissue carries food in a plant?|phloem|xylem~Carries water and minerals;epidermis~Protective layer;pith~Stores food|Phloem conducts food.",
 "s|The tissue that carries water and minerals is the ____.|xylem|Xylem.",
 "t|Roots have radial vascular bundles.|True|Xylem and phloem alternate on different radii.",
 "m|A collateral bundle with cambium is called|open|closed~Closed bundles lack cambium;radial~Xylem and phloem on different radii;concentric~One tissue surrounds another|Open bundles have cambium.",
 "m|Phloem on both sides of the xylem is seen in|Cucurbita|Dracaena~Amphivasal;ferns~Amphicribral;maize~Closed collateral|Bicollateral bundle.",
 "t|Epidermis belongs to the vascular tissue system.|False|It belongs to the dermal system.",
 "s|The English physician known as the Father of Plant Anatomy is Nehemiah ____.|Grew|He wrote the first account of plant structure.",
 "n|How many tissue systems did Sachs classify in plants?|3|Dermal, ground, vascular.",
 "m|In an amphivasal bundle the xylem|surrounds the phloem|lies beside the phloem~That is conjoint;is absent~Both are present|Example: Dracaena.",
 "t|Stomata are part of the dermal tissue system.|True|They are minute pores in the epidermis."],
svg=(tissue,"A chart dividing plant tissues into dermal, ground and vascular systems","Three tissue systems of a plant"))

lesson(C,S,CH,'dicot-and-monocot-root-stem-and-leaf',"Internal structure of root, stem and leaf: dicot and monocot","Cutting a stem in two",
"If you slice a thin section of a sunflower stem and a maize stem and look at both under a microscope, the bundles are arranged in two completely different ways. That one clue tells you which is a dicot and which a monocot.",
["The dicot root (bean) has an epiblema with unicellular root hairs, a cortex, an endodermis with Casparian strips and passage cells, a pericycle where lateral roots begin, a tetrarch radial bundle and usually no pith. @ dicot root",
 "The monocot root (maize) is polyarch with a large pith; its conjunctive tissue is sclerenchyma and it does not undergo secondary growth. @ monocot root",
 "The dicot stem (sunflower) has an epidermis, a cortex of collenchyma, chlorenchyma and parenchyma, an endodermis called the starch sheath, and conjoint collateral open endarch bundles in a ring around a pith. @ dicot stem",
 "The monocot stem (maize) has a sclerenchymatous hypodermis, undifferentiated ground tissue and many scattered, skull-shaped conjoint collateral closed bundles, each with a bundle sheath. @ monocot stem",
 "The dicot leaf (mango) is dorsiventral: upper epidermis, mesophyll divided into palisade and spongy parenchyma, and lower epidermis with more stomata. @ dicot leaf",
 "The monocot leaf (grass) is isobilateral: mesophyll is not divided into palisade and spongy tissue, stomata are on both surfaces and bulliform cells are present in the upper epidermis. @ monocot leaf",
 "Remember the contrast: dicot root is tetrarch, monocot root polyarch; dicot stem bundles are in a ring and open, monocot stem bundles are scattered and closed. @ dicot versus monocot"],
("Identify the stem: it has a ring of 8 vascular bundles, cambium between xylem and phloem, and a large pith.",[("Bundles arranged in a ring suggests a dicot.","Monocot bundles are scattered."),("Cambium makes them open bundles.","Open bundles are conjoint, collateral and open."),("So it is a dicot stem such as sunflower.","Secondary growth is possible.")]),
("List four differences between a dicot stem and a monocot stem.",["Hypodermis collenchymatous versus sclerenchymatous","Ring versus scattered bundles","Open versus closed bundles","Pith present versus absent"],["Saying monocot bundles have cambium"]),
["Dicot root: tetrarch; monocot root: polyarch with large pith.","Dicot stem: ring of open bundles, differentiated ground tissue.","Monocot stem: scattered closed bundles with bundle sheath.","Dicot leaf has palisade and spongy tissue; monocot leaf has bulliform cells and stomata on both sides."],
["m|The Casparian strips occur in the|endodermis|epiblema~Outer layer of root;cortex~Stores food;pith~Central tissue|They are band-like suberin thickenings.",
 "t|A dicot root usually has no pith.|True|Pith is small or absent; monocot root has a large pith.",
 "m|Vascular bundles scattered in the ground tissue are typical of|monocot stem|dicot stem~Bundles are in a ring;dicot root~Radial xylem;dicot leaf~Veins|Maize stem.",
 "s|The type of leaf with palisade and spongy parenchyma is called ____ (one word).|dorsiventral|Mango leaf.",
 "t|Bulliform cells are present in the monocot leaf.|True|They are large thin-walled cells in the upper epidermis.",
 "m|The root layer where lateral roots arise is the|pericycle|epiblema~Outermost;endodermis~Innermost cortex;pith~Centre|Pericycle.",
 "n|Number of xylem strands in a tetrarch dicot root|4|Tetra means four.",
 "t|Monocot stems show secondary growth.|False|They lack cambium.",
 "s|The innermost layer of the cortex is the ____.|endodermis|Also called starch sheath in stems.",
 "m|More stomata are present in the lower epidermis of a|dicot leaf|monocot leaf~Stomata on both sides;dicot root~No stomata;monocot stem~Different anatomy|Dorsiventral leaf."],
svg=(leaf,"A cross-section of a dicot leaf showing epidermis layers palisade spongy tissue and a vascular bundle","Structure of a dicot leaf"))

lesson(C,S,CH,'plastids-and-photosynthesis',"Plastids, chloroplast and photosynthesis","How the leaf makes food",
"Every apple and every grain of rice started as sunlight captured by a green leaf. The chloroplast is the tiny kitchen where this happens.",
["Plastids are double-membrane organelles of plants that make and store food; chloroplasts are green, chromoplasts are yellow, red or orange and leucoplasts are colourless. @ three plastids",
 "A chloroplast has an envelope of two membranes, a stroma containing DNA and 70S ribosomes, and thylakoids stacked into grana joined by stroma lamellae. @ chloroplast structure",
 "Photosynthesis is the process in which green plants use sunlight, chlorophyll, carbon dioxide and water to make glucose and release oxygen. @ photosynthesis",
 "6CO2 + 12H2O gives C6H12O6 + 6H2O + 6O2 in the presence of light and chlorophyll. @ equation",
 "Chlorophyll a is the primary pigment at the reaction centre; chlorophyll b and carotenoids are accessory pigments that pass energy on to it. @ pigments",
 "Light reaction (Hill reaction, discovered by Robin Hill in 1939) occurs in the grana and converts light energy into ATP and NADPH + H+. @ light reaction",
 "Dark reaction, the Calvin cycle, occurs in the stroma and uses the ATP and NADPH to reduce CO2 to carbohydrate; Melvin Calvin won the Nobel Prize in 1961. @ Calvin cycle",
 "Internal factors affecting photosynthesis include pigments and leaf age; external factors include light, carbon dioxide, temperature, water and minerals. @ factors"],
("Write the balanced equation of photosynthesis and name the two sites in the chloroplast.",[("Carbon dioxide and water give glucose and oxygen: 6CO2 + 12H2O gives C6H12O6 + 6H2O + 6O2.","The light and chlorophyll are the conditions."),("Light reaction takes place in the grana.","It makes ATP and NADPH."),("Dark reaction takes place in the stroma.","It builds glucose by the Calvin cycle.")]),
("Explain how the structure of the chloroplast suits the two stages of photosynthesis.",["Thylakoid membranes hold pigments for the light reaction","Stroma holds enzymes for the Calvin cycle","The ATP and NADPH pass from grana to stroma"],["Thinking the dark reaction happens only at night"]),
["Chloroplast: grana for the light reaction, stroma for the Calvin cycle.","Light reaction makes ATP, NADPH and O2; dark reaction fixes CO2 into sugar.","Chlorophyll a is the primary pigment.","Light, CO2, water, temperature and minerals affect the rate."],
["m|The light reaction occurs in the|grana|stroma~Site of the Calvin cycle;cytoplasm~Not in the chloroplast;nucleus~No photosynthesis there|Thylakoid membranes.",
 "s|The cycle that fixes carbon dioxide in the stroma is the ____ cycle.|Calvin|Named after Melvin Calvin.",
 "t|Oxygen released in photosynthesis comes from the light reaction.|True|Water is split in the light reaction.",
 "m|Yellow, red or orange plastids are|chromoplasts|chloroplasts~Green;leucoplasts~Colourless;ribosomes~Not plastids|They give flowers and fruits colour.",
 "n|Year in which Robin Hill discovered the light reaction|1939|Hill reaction.",
 "t|Chlorophyll b is the primary pigment of the reaction centre.|False|Chlorophyll a is primary; b is accessory.",
 "m|Products of the light reaction used in the dark reaction are|ATP and NADPH|glucose and O2~Final products;CO2 and water~Inputs;pyruvic acid~Respiration product|They drive the Calvin cycle.",
 "s|Stacks of thylakoids are called ____.|grana|Singular: granum.",
 "t|Chloroplasts have their own DNA.|True|The stroma contains DNA and 70S ribosomes.",
 "m|Which is an external factor of photosynthesis?|light intensity|leaf age~Internal;pigment content~Internal;hormones~Internal|Light, CO2, temperature, water, minerals are external."],
svg=(photo,"A chloroplast with grana for the light reaction and stroma for the dark reaction and the overall equation","Where photosynthesis happens"))

lesson(C,S,CH,'mitochondria-and-respiration',"Mitochondria and respiration","The cell's power house",
"A cell cannot burn glucose directly for energy. It first converts the energy into ATP, the cell's currency, and the mitochondrion is the mint.",
["Mitochondria are double-membrane organelles that make ATP, so they are called the power house of the cell. @ power house",
 "The outer membrane is smooth and freely permeable; the inner membrane is folded into cristae and carries oxysomes (F1 particles) that make ATP. @ cristae and oxysomes",
 "The matrix contains enzymes for the Krebs cycle, 70S ribosomes, tRNA and mitochondrial DNA. @ matrix",
 "External respiration is gas exchange with the environment; cellular respiration is the biochemical oxidation of food to release energy. @ external and cellular respiration",
 "Aerobic respiration oxidises glucose completely with oxygen: C6H12O6 + 6O2 gives 6CO2 + 6H2O + ATP. @ aerobic respiration",
 "Stage 1, glycolysis, occurs in the cytoplasm and splits one glucose (6C) into two pyruvic acid (3C) molecules; it is common to aerobic and anaerobic respiration. @ glycolysis",
 "Stage 2, the Krebs or TCA cycle, occurs in the mitochondrial matrix and oxidises pyruvic acid to carbon dioxide. @ Krebs cycle",
 "Stage 3, the electron transport chain on the inner membrane, oxidises NADH and FADH2; the electrons release energy to make ATP (oxidative phosphorylation) and oxygen is the final electron acceptor, forming water. @ electron transport chain",
 "Anaerobic respiration occurs without oxygen: yeast gives ethanol and carbon dioxide (ethanol fermentation) and bacteria give lactic acid. @ anaerobic respiration",
 "Respiratory quotient RQ = volume of CO2 liberated divided by volume of O2 consumed. @ RQ"],
("Calculate the RQ when 6 volumes of CO2 are released while 6 volumes of O2 are consumed.",[("RQ = volume of CO2 liberated / volume of O2 consumed.","Definition of RQ."),("RQ = 6 / 6 = 1.","Divide."),("RQ = 1, which is typical for oxidation of carbohydrates such as glucose.","C6H12O6 + 6O2 gives 6CO2.")]),
("Name the three stages of aerobic respiration and where each occurs.",["Glycolysis in cytoplasm","Krebs cycle in matrix","Electron transport chain on the inner membrane"],["Saying glycolysis needs oxygen"]),
["Mitochondria make ATP; cristae increase the surface for enzymes.","Aerobic stages: glycolysis, Krebs cycle, ETC.","Anaerobic: ethanol (yeast) or lactic acid (bacteria).","RQ = CO2 liberated / O2 consumed."],
["m|Glycolysis takes place in the|cytoplasm|mitochondrial matrix~Krebs cycle;inner membrane~Electron transport chain;nucleus~Not involved|First step of both types.",
 "t|Glycolysis requires oxygen.|False|It is common to aerobic and anaerobic respiration.",
 "m|The final acceptor of electrons in the ETC is|oxygen|glucose~The starting fuel;carbon dioxide~A product;ATP~An energy carrier|Oxygen is reduced to water.",
 "s|The folds of the inner mitochondrial membrane are called ____.|cristae|They carry the oxysomes.",
 "n|Number of pyruvic acid molecules formed from one glucose|2|Glycolysis.",
 "t|Yeast produces ethanol during fermentation.|True|C6H12O6 gives 2CO2 + 2C2H5OH + energy.",
 "m|Another name for the Krebs cycle is|TCA cycle|Calvin cycle~Photosynthesis;Hill reaction~Light reaction;glycolysis~First stage|Tricarboxylic acid cycle.",
 "n|RQ when 8 volumes of CO2 are released and 8 of O2 consumed|1|8/8.",
 "t|Mitochondria are called the power house of the cell.|True|They produce ATP.",
 "m|The F1 particles of mitochondria are called|oxysomes|ribosomes~Make proteins;lysosomes~Digest;grana~Chloroplast structure|They help in ATP synthesis."],
svg=(resp,"Flow of aerobic respiration through glycolysis the Krebs cycle and electron transport with their locations","Three stages of aerobic respiration"))
print('ok')
