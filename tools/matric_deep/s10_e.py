from lib import *
C=10;S='science';CH='transportation-in-plants-and-circulation-in-animals'
sap=svg(560,300,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Ascent of sap: forces that move water upward</text>'
 '<rect x="240" y="50" width="80" height="150" fill="#d5f5e3" stroke="#1e8449"/><text x="280" y="125" text-anchor="middle" font-size="13">xylem</text>'
 '<polygon points="280,35 250,50 310,50" fill="#1e8449"/><text x="360" y="75" font-size="14" fill="#1e8449">1. Transpiration pull (suction at leaves)</text>'
 '<text x="345" y="125" font-size="14" fill="#2874a6">2. Cohesion and adhesion: unbroken water column</text>'
 '<text x="345" y="165" font-size="14" fill="#b9770e">3. Capillary action in narrow tubes</text>'
 '<rect x="180" y="215" width="200" height="40" fill="#fdebd0" stroke="#333"/><text x="280" y="240" text-anchor="middle" font-size="14">Root hairs: osmosis, root pressure</text>'
 '<text x="395" y="240" font-size="14" fill="#a04000">4. Root pressure pushes water up</text><text x="280" y="285" text-anchor="middle" font-size="13">Water enters root hairs by osmosis, then moves to the xylem</text>')
grp=svg(560,260,'<text x="280" y="24" text-anchor="middle" font-weight="bold">ABO blood groups: who can give to whom</text>'
 +''.join(f'<rect x="{x}" y="{y}" width="100" height="50" rx="10" fill="{c}" stroke="#333"/><text x="{x+50}" y="{y+32}" text-anchor="middle" font-size="20" font-weight="bold">{t}</text>' for x,y,c,t in [(60,60,'#f5b7b1','A'),(200,60,'#aed6f1','B'),(340,60,'#d2b4de','AB'),(480,60,'#f9e79f','O')])
 +'<text x="110" y="135" text-anchor="middle" font-size="12">antigen A, anti-b</text><text x="250" y="135" text-anchor="middle" font-size="12">antigen B, anti-a</text><text x="390" y="135" text-anchor="middle" font-size="12">A and B, no antibody</text><text x="530" y="135" text-anchor="middle" font-size="12">no antigen, both</text>'
 '<text x="280" y="180" text-anchor="middle" font-size="15">O is the universal donor (gives to A, B, AB, O)</text><text x="280" y="205" text-anchor="middle" font-size="15">AB is the universal recipient (receives from A, B, AB, O)</text><text x="280" y="235" text-anchor="middle" font-size="13">A gives to A and AB; B gives to B and AB</text>')
dbl=svg(560,300,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Double circulation in the human heart</text>'
 '<rect x="200" y="100" width="160" height="110" rx="20" fill="#fadbd8" stroke="#c0392b" stroke-width="2"/><line x1="280" y1="100" x2="280" y2="210" stroke="#c0392b"/><line x1="200" y1="150" x2="360" y2="150" stroke="#c0392b"/>'
 '<text x="240" y="130" text-anchor="middle" font-size="13">Right atrium</text><text x="320" y="130" text-anchor="middle" font-size="13">Left atrium</text><text x="240" y="185" text-anchor="middle" font-size="13">Right ventricle</text><text x="320" y="185" text-anchor="middle" font-size="13">Left ventricle</text>'
 '<rect x="20" y="115" width="130" height="40" rx="10" fill="#aed6f1" stroke="#333"/><text x="85" y="140" text-anchor="middle" font-size="14">Body organs</text>'
 '<rect x="410" y="115" width="130" height="40" rx="10" fill="#d5f5e3" stroke="#333"/><text x="475" y="140" text-anchor="middle" font-size="14">Lungs</text>'
 '<text x="280" y="60" text-anchor="middle" font-size="13" fill="#2874a6">Deoxygenated: body -> right atrium -> right ventricle -> pulmonary artery -> lungs</text>'
 '<text x="280" y="82" text-anchor="middle" font-size="13" fill="#c0392b">Oxygenated: lungs -> pulmonary vein -> left atrium -> left ventricle -> aorta -> body</text>'
 '<text x="280" y="250" text-anchor="middle" font-size="14">Cardiac cycle 0.8 s: atrial systole 0.1 + ventricular systole 0.3 + diastole 0.4</text><text x="280" y="275" text-anchor="middle" font-size="13">Heart beat 72-75 per minute; BP 120/80 mm Hg</text>')

lesson(C,S,CH,'transport-in-plants',"Transport in plants: diffusion, osmosis, transpiration and translocation","The tallest tree",
"A giant tree lifts water to a leaf over 50 metres above the ground, with no heart or pump. The plant does it with osmosis, evaporation and the cohesion of water.",
["Diffusion is the movement of molecules from higher to lower concentration without energy; imbibition is the swelling of dry solids such as seeds as they absorb water. @ diffusion and imbibition",
 "Active transport uses energy (ATP) and membrane proteins called pumps to move substances against a concentration gradient. @ active transport",
 "Osmosis is the movement of water from higher to lower water concentration through a semipermeable membrane; in a hypertonic solution a plant cell loses water and its protoplasm shrinks, called plasmolysis. @ osmosis and plasmolysis",
 "Root hairs are thin-walled extensions of epidermal cells that increase the surface area for absorbing water and minerals. @ root hairs",
 "Water moves from the root hair across the cortex to the xylem by the apoplast pathway (through cell walls) or the symplast pathway (through cytoplasm and plasmodesmata); the Casparian strip forces water through the cells at the endodermis. @ apoplast and symplast",
 "Transpiration is evaporation of water from aerial parts, mainly through stomata; guard cells open the stoma when turgid and close it when flaccid. @ transpiration and guard cells",
 "It creates the transpiration pull, supplies water for photosynthesis, cools the leaf and keeps cells turgid. @ significance of transpiration",
 "Water rises in the xylem by root pressure, capillary action, adhesion-cohesion of water molecules and transpiration pull, together called ascent of sap. @ ascent of sap",
 "Minerals enter the root by active absorption using ATP; elements like N, P, S and K are remobilised to young leaves but calcium is not. @ uptake of minerals",
 "Phloem carries sucrose from a source such as a leaf to a sink such as a root or fruit by the pressure flow hypothesis, and the flow can be in both directions. @ phloem transport and pressure flow"],
("A plant cell is placed in a strong salt solution. What happens and why?",[("The solution outside is hypertonic.","It has a lower water concentration than the cell."),("Water leaves the cell by osmosis.","Water moves from higher to lower concentration."),("The protoplasm shrinks away from the cell wall, which is plasmolysis.","The cell becomes flaccid.")]),
("Explain how water reaches the top of a tall tree.",["Root pressure pushes water up a little","Transpiration pull sucks the water column","Cohesion and adhesion keep the column unbroken"],["Thinking the roots pump water to the top like a motor"]),
["Diffusion and osmosis are passive; active transport needs ATP.","Water travels by apoplast or symplast pathways to xylem.","Transpiration pull, root pressure, capillarity and cohesion-adhesion cause the ascent of sap.","Phloem carries sucrose from source to sink by pressure flow."],
["m|Movement of water through a semipermeable membrane is|osmosis|diffusion~Any molecule moves;imbibition~Swelling of solids;active transport~Needs energy|Osmosis.",
 "t|Active transport needs energy.|True|It pumps against the concentration gradient.",
 "m|Water loss from the leaves through stomata is|transpiration|guttation~Liquid water from hydathodes;osmosis~Movement into cells;imbibition~Swelling|Evaporation from aerial parts.",
 "s|When the guard cells are turgid the stoma is ____.|open|Turgid guard cells open the pore.",
 "t|Phloem transport is always upward.|False|It is bidirectional, from source to sink.",
 "m|Shrinkage of protoplasm in a hypertonic solution is|plasmolysis|imbibition~Absorption by dry seeds;transpiration~Water loss from leaves;guttation~Exudation of water|The cell loses water.",
 "s|Specialised cells that release water droplets from leaf edges are ____.|hydathodes|The process is guttation.",
 "t|Calcium is easily remobilised from old leaves to young leaves.|False|N, P, S and K are remobilised, not calcium.",
 "m|Which one is not a force in the ascent of sap?|translocation of sugar|root pressure~It is a force;capillary action~It is a force;transpiration pull~It is a force|Translocation of sugar occurs in the phloem.",
 "t|The source of food in a plant is usually the leaf.|True|The sink is the part that uses or stores it."],
svg=(sap,"A xylem tube with four forces labelled that move water upward in a plant","Forces behind the ascent of sap"))

lesson(C,S,CH,'blood-blood-vessels-and-blood-groups',"Blood, blood vessels, blood groups and lymph","The red river",
"Every minute your blood visits every cell in your body and returns. It carries oxygen and food, takes away waste and fights germs.",
["Blood is a fluid connective tissue made of plasma (about 55 percent) and formed elements: RBCs, WBCs and platelets. @ plasma and formed elements",
 "RBCs (erythrocytes) are biconcave, lack a nucleus in mammals, carry haemoglobin and transport oxygen; they live about 120 days and are made in bone marrow. @ RBC",
 "WBCs (leucocytes) are colourless nucleated cells that defend the body; granulocytes are neutrophils, eosinophils and basophils, and agranulocytes are lymphocytes and monocytes. @ WBC",
 "Platelets (thrombocytes) have no nucleus, number 2.5 to 4 lakh per cubic mm and help in clotting. @ platelets",
 "Functions of blood: transporting gases, food, hormones and wastes, protection, regulating pH and temperature and water balance. @ functions of blood",
 "Arteries are thick, elastic and carry blood away from the heart; veins are thin, have valves and carry blood to the heart; capillaries are one cell thick and join arterioles to venules. @ artery vein capillary",
 "Pulmonary artery carries deoxygenated blood and pulmonary vein carries oxygenated blood, the exceptions to the usual rule. @ exceptions",
 "Blood groups A, B, AB and O depend on antigens on the RBC and antibodies in the plasma; Karl Landsteiner introduced the idea in 1900. @ ABO groups",
 "O is the universal donor and AB the universal recipient; mismatched transfusion causes agglutination. @ universal donor and recipient",
 "Rh factor was discovered by Landsteiner and Wiener in 1940; Rh positive people have the Rh antigen on their RBC. @ Rh factor",
 "Lymph is a colourless fluid with fewer proteins that drains tissue fluid, carries absorbed fats from the intestine and defends against infection through lymphocytes. @ lymph"],
("A patient has blood group B. From whom can she safely receive blood?",[("Group B has antigen B and anti-a antibody.","Antibodies in the recipient attack mismatched antigens."),("She must not receive antigen A, so group A and AB are unsafe.","Anti-a would clump antigen A."),("She can receive from B and O.","O has no antigens.")]),
("List three differences between an artery and a vein.",["Artery is thick-walled and elastic","Vein has valves","Artery carries blood away from the heart and vein towards it"],["Thinking all arteries carry oxygenated blood"]),
["Blood = plasma + RBC, WBC, platelets.","Arteries away from the heart, veins towards it, capillaries exchange materials.","O is the universal donor and AB the universal recipient.","Lymph drains tissue fluid and absorbs fats."],
["m|Which blood cells help in clotting?|platelets|RBCs~Carry oxygen;neutrophils~Fight infection;lymphocytes~Make antibodies|Thrombocytes.",
 "t|Mature mammalian RBCs have a nucleus.|False|They lack a nucleus and organelles.",
 "m|The universal donor is blood group|O|A~Can give only to A and AB;B~Can give only to B and AB;AB~Universal recipient|O has no antigens.",
 "s|The respiratory pigment in RBC is ____.|haemoglobin|It carries oxygen.",
 "n|Lifespan (days) of a red blood cell|120|About four months.",
 "t|Veins have valves.|True|They prevent back flow.",
 "m|The only artery that carries deoxygenated blood is the|pulmonary artery|aorta~Carries oxygenated blood;carotid artery~Oxygenated;coronary artery~Oxygenated|It goes to the lungs.",
 "s|The fluid that flows in the lymphatic system is ____.|lymph|It is colourless.",
 "t|Rh factor was discovered in Rhesus monkeys.|True|By Landsteiner and Wiener in 1940.",
 "m|Group AB blood has|antigens A and B and no antibodies|antigen A and anti-b~That is group A;no antigen and both antibodies~That is group O;antigen B and anti-a~That is group B|Hence the universal recipient."],
svg=(grp,"Four blood groups with their antigens and antibodies and a note on universal donor and recipient","ABO blood groups"))

lesson(C,S,CH,'heart-circulation-and-blood-pressure',"The human heart, circulation and blood pressure","The pump that never rests",
"Your heart is about the size of your fist and beats 72 to 75 times a minute for your whole life. Each beat has a precise sequence.",
["Circulation may be open, with blood in sinuses and no capillaries (arthropods, molluscs), or closed, with blood always inside vessels (vertebrates); William Harvey discovered the closed system in 1628. @ open and closed circulation",
 "The human heart is a four-chambered muscular organ enclosed in the pericardium: two thin-walled atria above and two thick-walled ventricles below; the left ventricle wall is about three times thicker than the right. @ four chambers",
 "The right atrium receives deoxygenated blood from the vena cavae and coronary sinus; the left atrium receives oxygenated blood from the pulmonary veins. @ blood entering the heart",
 "Tricuspid valve lies between the right atrium and ventricle, the bicuspid (mitral) valve between the left atrium and ventricle, and semilunar valves guard the pulmonary artery and aorta. @ valves",
 "Systemic circulation carries oxygenated blood from the left ventricle to the body; pulmonary circulation carries deoxygenated blood from the right ventricle to the lungs; coronary circulation feeds the heart muscle. @ three circulations",
 "Because blood passes twice through the heart in one round, human circulation is double circulation, and oxygenated and deoxygenated blood do not mix. @ double circulation",
 "The SA node in the right atrium is the pacemaker; the impulse goes to the AV node, the bundle of His and the Purkinje fibres, so the heart beat is myogenic. @ pacemaker",
 "The cardiac cycle lasts 0.8 s: atrial systole 0.1 s, ventricular systole 0.3 s and ventricular diastole 0.4 s. @ cardiac cycle",
 "Heart sounds: lubb from closing of tricuspid and bicuspid valves, dupp from closing of semilunar valves. @ lubb dupp",
 "Blood pressure is 120 mm Hg systolic over 80 mm Hg diastolic in a healthy adult; it is measured with a sphygmomanometer and the heart is listened to with a stethoscope. @ blood pressure",
 "Pulse rate is normally 70 to 90 per minute; sustained high pressure is hypertension and low pressure is hypotension. @ pulse and BP"],
("Trace a drop of blood from the right atrium to the lungs and back to the left atrium.",[("Right atrium to right ventricle through the tricuspid valve.","Deoxygenated blood."),("Right ventricle to the lungs through the pulmonary artery.","Gas exchange at the alveoli."),("Lungs to the left atrium through the pulmonary veins.","Now oxygenated blood.")]),
("Explain the cardiac cycle and the origin of the heart sounds.",["Atrial systole 0.1 s, ventricular systole 0.3 s, diastole 0.4 s","Lubb from atrioventricular valves closing","Dupp from semilunar valves closing"],["Confusing systole with diastole"]),
["Four chambers; tricuspid on the right, bicuspid on the left.","Systemic, pulmonary and coronary circulations; double circulation in humans.","SA node is the pacemaker; one cycle lasts 0.8 s.","Normal BP 120/80 mm Hg; sphygmomanometer measures it."],
["n|Duration (in seconds) of one cardiac cycle|0.8|0.1 + 0.3 + 0.4.",
 "m|The pacemaker of the heart is the|SA node|AV node~Passes the impulse on;bundle of His~Conducts to ventricles;Purkinje fibres~Spread the impulse|It starts each beat.",
 "t|The right side of the human heart carries oxygenated blood.|False|The right side carries deoxygenated blood.",
 "m|Valve between the left atrium and left ventricle is|bicuspid|tricuspid~Right side;semilunar~Artery openings;none~A valve is present|Also called mitral valve.",
 "n|Normal systolic pressure (mm Hg) of a healthy adult|120|120 over 80.",
 "t|The first heart sound lubb is caused by the closure of the tricuspid and bicuspid valves.|True|At the start of ventricular systole.",
 "s|Blood supply to the heart muscles is called ____ circulation.|coronary|Through coronary arteries.",
 "m|The instrument used to measure blood pressure is a|sphygmomanometer|stethoscope~Listens to heart sounds;thermometer~Measures temperature;ECG~Records electrical activity|Placed on the brachial artery.",
 "s|The scientist who discovered the closed circulatory system in 1628 is William ____.|Harvey|Father of Modern Physiology.",
 "t|Human heart beat is myogenic.|True|It starts in the SA node, a modified heart muscle."],
svg=(dbl,"A heart with right and left sides showing the pulmonary and systemic circuits and the cardiac cycle timing","Double circulation"))
print('ok')
