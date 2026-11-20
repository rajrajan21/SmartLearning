from lib import *
C=10;S='science';CH='structural-organisation-of-animals'
segs=''; cols=[('1','5','#f5b7b1','Cephalic 1-5'),('6','8','#fad7a0','Pre-clitellar 6-8'),('9','11','#f9e79f','Clitellar 9-11'),('12','22','#abebc6','Middle 12-22'),('23','26','#a9cce3','Caudal 23-26'),('27','33','#d2b4de','Posterior sucker 27-33')]
x=20
for a,b,c,t in cols:
    w=(int(b)-int(a)+1)*15; segs+=f'<rect x="{x}" y="70" width="{w}" height="50" fill="{c}" stroke="#333"/><text x="{x+w/2}" y="{150 if cols.index((a,b,c,t))%2 else 62}" text-anchor="middle" font-size="12">{t}</text>'; x+=w
leech=svg(540,230,'<text x="270" y="24" text-anchor="middle" font-weight="bold">Body regions of the Indian cattle leech (33 segments)</text>'+segs+
 '<text x="270" y="190" text-anchor="middle" font-size="13">Anterior sucker (mouth) at the left end, posterior sucker at the right end</text><text x="270" y="212" text-anchor="middle" font-size="13">Clitellum on segments 9-11 forms the cocoon in the breeding season</text>')
teeth=svg(520,260,'<text x="260" y="24" text-anchor="middle" font-weight="bold">Rabbit dentition (one side)</text>'
 '<text x="30" y="85" font-size="14">Upper jaw</text><text x="30" y="185" font-size="14">Lower jaw</text>'
 +''.join(f'<rect x="{150+i*22}" y="{60 if i<2 else 60}" width="18" height="36" fill="#fdfefe" stroke="#333"/>' for i in range(2))
 +''.join(f'<rect x="{260+i*28}" y="60" width="24" height="36" fill="#eaf2f8" stroke="#333"/>' for i in range(3))
 +''.join(f'<rect x="{350+i*28}" y="60" width="24" height="36" fill="#d6eaf8" stroke="#333"/>' for i in range(3))
 +'<rect x="150" y="160" width="18" height="36" fill="#fdfefe" stroke="#333"/>'
 +''.join(f'<rect x="{260+i*28}" y="160" width="24" height="36" fill="#eaf2f8" stroke="#333"/>' for i in range(2))
 +''.join(f'<rect x="{350+i*28}" y="160" width="24" height="36" fill="#d6eaf8" stroke="#333"/>' for i in range(3))
 +'<text x="170" y="118" text-anchor="middle" font-size="12">Incisors</text><text x="225" y="125" text-anchor="middle" font-size="12">diastema</text><text x="315" y="118" text-anchor="middle" font-size="12">Premolars</text><text x="405" y="118" text-anchor="middle" font-size="12">Molars</text>'
 '<text x="260" y="235" text-anchor="middle" font-size="15">Dental formula  I 2/1  C 0/0  PM 3/2  M 3/3  = 28 teeth</text>')

lesson(C,S,CH,'leech-structure-and-parasitic-adaptations',"The Indian cattle leech (Hirudinaria granulosa)","The blood-sucking worm",
"A leech clings to a cow's leg in a pond and drinks blood without the animal even feeling the bite. Its body is built perfectly for this parasitic life.",
["The Indian cattle leech, Hirudinaria granulosa, is an annelid of class Hirudinea that lives in freshwater ponds, lakes and slow streams and feeds on the blood of fishes, frogs, cattle and humans. @ habit and habitat",
 "Its body is soft, elongated and metamerically segmented into 33 segments and may reach 35 cm; the back is olive green and the belly orange. @ segments and size",
 "It has an anterior sucker around the mouth (first five segments) and a posterior sucker formed by the last seven segments; the suckers help in attachment and locomotion. @ two suckers",
 "The body is divided into six regions: cephalic 1-5, pre-clitellar 6-8, clitellar 9-11, middle 12-22, caudal 23-26 and the posterior sucker 27-33. @ six body regions",
 "Digestion: three jaws with teeth make a Y-shaped wound, the pharynx sucks blood, the crop with 10 chambers stores it and digestion in the stomach is slow. @ digestive system",
 "Saliva contains hirudin, which prevents blood clotting, and the leech also injects an anaesthetic so the bite is painless. @ hirudin",
 "Respiration is through the moist skin by diffusion; circulation is by haemocoelic channels with four longitudinal channels and the fluid contains haemoglobin. @ respiration and circulation",
 "Excretion is by 17 pairs of nephridia and the nervous system is a nerve ring with a ventral nerve cord; the leech has five pairs of eyes. @ nephridia and nerves",
 "Leech is hermaphrodite with 11 pairs of testes and a single pair of ovaries; fertilization is internal and a cocoon is formed around segments 9 to 11. @ hermaphrodite",
 "Parasitic adaptations include suckers, jaws, hirudin, a blood-storing crop and the absence of parapodia and setae. @ parasitic adaptations"],
("Why does a bleeding bite from a leech take longer to stop?",[("The salivary glands of the leech secrete hirudin.","Hirudin is a protein."),("Hirudin prevents blood from clotting.","Clotting normally stops bleeding."),("So blood keeps flowing and the leech can feed continuously.","It is a parasitic adaptation.")]),
("List four parasitic adaptations of the leech and the benefit of each.",["Suckers for attachment","Jaws making a Y-shaped wound","Hirudin to stop clotting","Crop for storing blood"],["Saying the leech has setae and parapodia (it does not)"]),
["Leech: phylum Annelida, 33 segments, two suckers, hermaphrodite.","Blood is stored in the crop; hirudin stops clotting.","Respiration through skin; excretion by 17 pairs of nephridia.","Clitellum on segments 9-11 forms the cocoon."],
["n|Number of segments in the body of the leech|33|Metamerism.",
 "m|The protein in leech saliva that prevents clotting is|hirudin|haemoglobin~It carries oxygen;pepsin~A digestive enzyme;mucin~Not the anticoagulant|Hirudin.",
 "t|Leech has true blood vessels.|False|Blood channels are haemocoelic canals.",
 "m|Leech respires through its|moist skin|gills~Not present;lungs~Not present;spiracles~Insects|By diffusion.",
 "n|Number of pairs of nephridia in the leech|17|Open by 17 pairs of nephridiopores.",
 "t|Leech is hermaphrodite.|True|Both sexes in one animal.",
 "s|The largest part of the leech alimentary canal where blood is stored is the ____.|crop|It has 10 chambers.",
 "m|The clitellum of the leech is on segments|9 to 11|1 to 5~Cephalic region;12 to 22~Middle region;27 to 33~Posterior sucker|It forms the cocoon.",
 "t|The anterior sucker is formed by the last seven segments.|False|That is the posterior sucker.",
 "n|Number of pairs of testes in the leech|11|One pair in each segment 12 to 22."],
svg=(leech,"A strip diagram of 33 leech segments coloured into six body regions","Regions of the leech body"))

lesson(C,S,CH,'rabbit-structure-and-systems',"The rabbit (Oryctolagus cuniculus)","A mammal up close",
"A rabbit is warm-blooded, covered in fur and feeds its young with milk. Studying its body shows how a typical mammal is organised.",
["The common rabbit, Oryctolagus cuniculus, is a mammal of phylum Chordata; mammals are warm-blooded, have hair and mammary glands. @ mammal features",
 "Its body has head, neck, trunk and tail; whiskers (vibrissae) are tactile hairs, and the skin has hair, claws and sweat, sebaceous and mammary glands. @ external features",
 "A muscular diaphragm separates the thoracic cavity from the abdominal cavity and is a characteristic feature of mammals. @ diaphragm",
 "Rabbit teeth are of different kinds, so dentition is heterodont; it has two sets, milk and permanent teeth, so it is diphyodont. @ heterodont and diphyodont",
 "Dental formula: incisors 2/1, canines 0/0, premolars 3/2, molars 3/3 giving 2033/1023; the gap called the diastema replaces the canines. @ dental formula",
 "The caecum is a thin-walled sac with bacteria that digest cellulose. @ caecum",
 "Respiration is by a pair of lungs; air passes through the nostrils, pharynx, glottis, larynx, trachea, bronchi and bronchioles to the alveoli. @ respiratory path",
 "The heart is four chambered with two auricles and two ventricles, with a tricuspid valve on the right and a bicuspid (mitral) valve on the left. @ four-chambered heart",
 "The right auricle receives deoxygenated blood by the precaval and postcaval veins; the left auricle receives oxygenated blood from the lungs; the systemic arch carries blood to the body. @ blood flow",
 "The nervous system has the brain and spinal cord, 12 pairs of cranial nerves and 37 pairs of spinal nerves. @ nervous system",
 "The kidneys remove nitrogenous waste as urea; sexes are separate and sexual dimorphism is exhibited. @ excretion and reproduction"],
("Find the total number of teeth in the rabbit from its dental formula 2033/1023.",[("Teeth on one side of the upper jaw: 2 + 0 + 3 + 3 = 8.","Add I, C, PM, M."),("Teeth on one side of the lower jaw: 1 + 0 + 2 + 3 = 6.","Same for the lower jaw."),("One side has 14 teeth, so both sides together have 14 x 2 = 28.","Multiply by two sides.")]),
("Describe how the blood flows through the four chambers of the rabbit heart.",["Right auricle gets deoxygenated blood","Right ventricle sends it to the lungs","Left auricle gets oxygenated blood and the left ventricle sends it to the body"],["Mixing up the left and right sides"]),
["Rabbit: warm-blooded, hair, mammary glands, diaphragm.","Dentition is heterodont and diphyodont; 28 teeth with a diastema.","Four-chambered heart; tricuspid valve on the right, bicuspid on the left.","Caecum digests cellulose with the help of bacteria."],
["n|Total number of teeth in an adult rabbit|28|2033/1023 on one side x 2.",
 "t|Canine teeth are absent in the rabbit.|True|A diastema takes their place.",
 "m|The partition between thoracic and abdominal cavity is the|diaphragm|pericardium~Covers the heart;pleura~Covers the lungs;mesentery~Holds the intestine|A mammal feature.",
 "s|The gap between the incisors and the premolars is called the ____.|diastema|It helps in chewing.",
 "m|The valve between the left auricle and left ventricle is|bicuspid|tricuspid~Right side;semilunar~At the aorta;none~There is a valve|Also called mitral valve.",
 "t|The rabbit heart has three chambers.|False|It has four chambers.",
 "n|Number of pairs of spinal nerves in the rabbit|37|Plus 12 pairs of cranial nerves.",
 "m|The caecum helps in the digestion of|cellulose|proteins~Digested in the stomach;fats~Digested by bile and lipase;vitamins~Not digested|Bacteria in the caecum break down cellulose.",
 "t|Rabbits show sexual dimorphism.|True|Sexes are separate and different.",
 "m|Having two sets of teeth in life is called|diphyodont|heterodont~Different kinds of teeth;homodont~Same kind of teeth;thecodont~Teeth in sockets|Milk teeth and permanent teeth."],
svg=(teeth,"The upper and lower jaw of a rabbit showing incisors a diastema premolars molars and the dental formula","Rabbit dentition"))
print('ok')
