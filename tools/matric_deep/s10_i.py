from lib import *
C=10;S='science'
BR='breeding-and-biotechnology'
pb=svg(560,240,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Methods of plant breeding</text>'
 +''.join(f'<rect x="{x}" y="50" width="100" height="56" rx="8" fill="{c}" stroke="#333"/><text x="{x+50}" y="76" text-anchor="middle" font-size="12">{a}</text><text x="{x+50}" y="94" text-anchor="middle" font-size="11">{b}</text>' for x,c,a,b in [(10,'#fadbd8','Introduction','exotic varieties'),(115,'#fdebd0','Selection','mass, pureline, clonal'),(220,'#fcf3cf','Polyploidy','colchicine'),(325,'#d5f5e3','Mutation','gamma rays'),(430,'#d6eaf8','Hybridization','crossing plants')])
 +'<text x="280" y="150" text-anchor="middle" font-size="14">Aims: higher yield, better quality, disease resistance, shorter duration</text><text x="280" y="176" text-anchor="middle" font-size="13">Green Revolution: Borlaug (Nobel 1970) and M. S. Swaminathan</text>')
ab=svg(560,220,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Animal breeding</text>'
 '<rect x="20" y="50" width="240" height="110" rx="10" fill="#d6eaf8" stroke="#333"/><text x="140" y="76" text-anchor="middle" font-size="15" font-weight="bold">Inbreeding</text><text x="140" y="100" text-anchor="middle" font-size="12">same breed mated</text><text x="140" y="120" text-anchor="middle" font-size="12">keeps pure line</text><text x="140" y="140" text-anchor="middle" font-size="12">risk: less vigour</text>'
 '<rect x="300" y="50" width="240" height="110" rx="10" fill="#d5f5e3" stroke="#333"/><text x="420" y="76" text-anchor="middle" font-size="15" font-weight="bold">Outbreeding</text><text x="420" y="100" text-anchor="middle" font-size="12">different breeds crossed</text><text x="420" y="120" text-anchor="middle" font-size="12">hybrid vigour (heterosis)</text><text x="420" y="140" text-anchor="middle" font-size="12">example: mule</text>'
 '<text x="280" y="195" text-anchor="middle" font-size="13">Examples: Hissardale sheep, Karan Swiss cattle</text>')
gc=svg(560,250,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Steps of gene cloning</text>'
 +''.join(f'<rect x="{x}" y="60" width="100" height="70" rx="8" fill="{c}" stroke="#333"/><text x="{x+50}" y="88" text-anchor="middle" font-size="11">{a}</text><text x="{x+50}" y="106" text-anchor="middle" font-size="11">{b}</text>' for x,c,a,b in [(10,'#fadbd8','Cut DNA with','restriction enzyme'),(115,'#fdebd0','Join to plasmid','by DNA ligase'),(220,'#fcf3cf','rDNA enters','bacterium'),(325,'#d5f5e3','Bacterium','multiplies'),(430,'#d6eaf8','Gene product','expressed')])
 +''.join(f'<polygon points="{x},95 {x+10},90 {x+10},100" fill="#333"/>' for x in (112,217,322,427))
 +'<text x="280" y="170" text-anchor="middle" font-size="13">Restriction enzymes = molecular scissors; DNA ligase = molecular glue</text><text x="280" y="195" text-anchor="middle" font-size="13">Plasmid: small circular DNA of bacteria that replicates on its own</text><text x="280" y="220" text-anchor="middle" font-size="13">Products: insulin (Eli Lilly, 1979), growth hormone, vaccines</text>')

lesson(C,S,BR,'crop-improvement-and-plant-breeding',"Crop improvement and plant breeding","From hunger to harvest",
"In the 1960s India faced food shortages. High-yielding wheat and rice changed that. This is the story of the Green Revolution and the science behind crop improvement.",
["Crop improvement is developing varieties with higher yield, better quality, resistance to diseases and pests, and shorter duration. @ crop improvement",
 "Norman Borlaug developed semi-dwarf wheat and won the Nobel Peace Prize in 1970; in India M. S. Swaminathan led the Green Revolution. @ Green Revolution",
 "Semi-dwarf wheat such as Sonalika and Kalyan Sona, and the semi-dwarf rice IR-8, gave high yields because of a dwarfing gene. @ high yielding varieties",
 "Introduction means bringing a variety from another place, and selection chooses the best plants: mass selection is simple and suits inexperienced farmers, pureline selection uses the progeny of a single plant, and clonal selection uses vegetatively propagated plants. @ introduction and selection",
 "Polyploidy raises the chromosome sets; colchicine doubles chromosomes and gives larger, vigorous plants. @ polyploidy",
 "Mutation breeding uses gamma rays or chemicals; the gamma garden produces useful mutants such as salt tolerant rice. @ mutation breeding",
 "Hybridization crosses two genetically different plants to combine desirable characters, for example the man-made cereal triticale from wheat and rye. @ hybridization",
 "Disease resistant varieties include Pusa Komal in cowpea and Himgiri in wheat; biofortification breeds crops rich in vitamins, minerals and proteins to fight hidden hunger. @ resistant and biofortified crops"],
("Which method of crop improvement can an inexperienced farmer practise, and why?",[("Mass selection picks plants with the best traits from a mixed population.","Seeds are then mixed and sown."),("It needs no special crossing skill.","Easy to follow."),("So mass selection suits an inexperienced farmer.","Pureline needs careful single-plant records.")]),
("What is biofortification and why does it matter?",["Breeding crops with more vitamins, minerals or protein","Golden rice has beta-carotene","It reduces hidden hunger"],["Confusing it with fertilizers"]),
["Green Revolution: Borlaug and Swaminathan.","Methods: introduction, selection, polyploidy, mutation, hybridization.","Biofortification reduces hidden hunger.","Hybrids show heterosis."],
["m|Semi-dwarf rice variety is|IR-8|Sonalika~Wheat;Pusa Komal~Cowpea;Himgiri~Wheat|Miracle rice.",
 "t|Colchicine is used to double chromosome number.|True|Produces polyploids.",
 "m|Father of the Green Revolution in India|M. S. Swaminathan|Borlaug~Mexico;Libby~Carbon dating;Jeffrey~DNA fingerprint|With Borlaug's wheat.",
 "s|Pusa Komal is a disease resistant variety of ____.|cowpea|Resistant to bacterial blight.",
 "m|A simple method for an inexperienced farmer|mass selection|pureline~Needs expertise;hybridization~Needs skill;mutation~Needs gamma rays|Easy.",
 "t|Triticale is a cross between wheat and rye.|True|A hybrid cereal.",
 "n|Year Borlaug won the Nobel Peace Prize|1970|For wheat work.",
 "m|Gamma garden is used for|mutation breeding|hybridization~Crossing;introduction~Importing;polyploidy~Colchicine|Radiation.",
 "t|Golden rice has beta-carotene.|True|Prevents vitamin A deficiency.",
 "s|Hybrid superiority is called ____.|heterosis|Hybrid vigour."],
svg=(pb,"Five boxes showing methods of plant breeding with the Green Revolution note","Plant breeding methods"))

lesson(C,S,BR,'animal-breeding',"Animal breeding","The mule's secret",
"A mule is stronger and more resistant to disease than its horse and donkey parents, but it is sterile. Why do breeders cross different breeds?",
["Animal breeding improves milk, egg, meat and wool production and resistance to disease. @ animal breeding",
 "Inbreeding is mating of animals of the same breed and keeps pure lines, but continued inbreeding reduces vigour. @ inbreeding",
 "Outbreeding crosses different breeds and gives hybrids with heterosis. @ outbreeding",
 "The mule, a cross of a male donkey and a female horse, is stronger and more intelligent than a horse but is sterile. @ mule",
 "Hissardale is a sheep breed developed in Punjab from Australian Merino rams and Bikaneri ewes. @ Hissardale",
 "Karan Swiss is a cattle breed developed at NDRI, Karnal from Brown Swiss and Sahiwal cattle for high milk yield. @ Karan Swiss",
 "Breeding aims at higher milk by cattle, more eggs from poultry, high quality meat and faster growth in domesticated animals. @ aims"],
("Why is a mule sterile although it is a vigorous hybrid?",[("A mule comes from a horse and a donkey, two different species.","Chromosome numbers differ."),("Its chromosomes cannot pair properly in meiosis.","So gametes are not formed."),("Hence heterosis gives vigour but the mule is sterile.","It cannot produce young.")]),
("Compare inbreeding and outbreeding.",["Inbreeding: same breed, pure line, risk of reduced vigour","Outbreeding: different breeds, heterosis","Mule is an outbreeding example"],["Thinking both are the same"]),
["Inbreeding: same breed; outbreeding: different breeds.","Heterosis: hybrid vigour.","Mule is sterile.","Hissardale and Karan Swiss are improved breeds."],
["m|Cross between different breeds is|outbreeding|inbreeding~Same breed;cloning~Copy;mutation~Change|Gives heterosis.",
 "t|Mule is fertile.|False|Mule is sterile.",
 "s|Karan Swiss is a ____ breed.|cattle|Developed at NDRI Karnal.",
 "m|Hissardale sheep were developed in|Punjab|Tamil Nadu~Different state;Kerala~Different state;Assam~Different state|Hissar.",
 "t|Inbreeding keeps a pure line.|True|But vigour may fall.",
 "m|A mule is a hybrid of|donkey and horse|cow and buffalo~Not a mule;sheep and goat~Not a mule;camel and horse~Not a mule|Sterile.",
 "m|Superiority of the hybrid is called|heterosis|mutation~Change;atavism~Old trait;clone~Copy|Hybrid vigour.",
 "t|Breeding aims to increase milk and egg production.|True|One aim.",
 "s|Breeding between animals of the same breed is ____.|inbreeding|Pure line.",
 "n|Number of sets of aims: higher milk yield, egg yield, meat quality, growth rate (count)|4|Four aims listed."],
svg=(ab,"Two panels comparing inbreeding and outbreeding in animals","Inbreeding and outbreeding"))

lesson(C,S,BR,'genetic-engineering-and-its-applications',"Genetic engineering, stem cells and DNA fingerprinting","Dolly the sheep",
"In 1996 Dolly, a cloned sheep, was born at the Roslin Institute. Her story opens the world of genetic engineering and biotechnology.",
["Genetic engineering is the manipulation and transfer of genes from one organism to another, creating recombinant DNA (rDNA). @ genetic engineering",
 "Tools: plasmid vectors, restriction enzymes that cut DNA at specific sites, and DNA ligases that join the fragments. @ tools",
 "Gene cloning steps: isolate the desired gene, insert into a plasmid vector, transfer into a bacterium, select and multiply, and express the gene. @ gene cloning",
 "Dolly was the first cloned female sheep, developed by Ian Wilmut at Roslin Institute, Scotland in 1996 by somatic cell nuclear transfer; she lived 6.5 years. @ Dolly",
 "Medicine: insulin (first commercial rDNA product by Eli Lilly, 1979), human growth hormone, clotting factors, tissue plasminogen activator and vaccines. @ biotechnology in medicine",
 "Gene therapy replaces a defective gene with a functional one; it is somatic or germ line, and was first implemented in 1990. @ gene therapy",
 "Stem cells are undifferentiated cells that self-renew and differentiate; they may be embryonic or adult stem cells and are used in stem cell therapy. @ stem cells",
 "DNA fingerprinting, developed by Alec Jeffreys, uses VNTRs in satellite DNA to identify individuals, in forensics and paternity tests. @ DNA fingerprinting",
 "Genetically modified organisms: Golden rice carries a beta-carotene gene and Bt crops carry a gene from Bacillus thuringiensis that kills insects. @ GMOs"],
("Explain how DNA fingerprinting can identify a criminal.",[("99 percent of human DNA is the same, but 1 percent differs as satellite DNA with VNTRs.","Repeat numbers differ among people."),("DNA from the crime scene is compared with a suspect's by band patterns.","Matching bands identify the person."),("Only identical twins share the same pattern.","So it is reliable.")]),
("State two differences between somatic and germ line gene therapy.",["Somatic: body cells, not passed to the next generation","Germ line: egg and sperm cells, passed on","Only somatic therapy has been done till date"],["Confusing it with cloning"]),
["rDNA technology uses enzymes and plasmids.","Insulin was the first rDNA drug.","DNA fingerprinting uses VNTRs.","Golden rice and Bt crops are GM plants."],
["m|Molecular scissors are|restriction enzymes|DNA ligases~Joins DNA;plasmid~Vector;RNA~Not an enzyme|Cut at specific sites.",
 "t|DNA ligase joins DNA fragments.|True|Molecular glue.",
 "s|The first cloned sheep was named ____.|Dolly|1996.",
 "m|DNA fingerprinting was developed by|Alec Jeffreys|Libby~C-14;Borlaug~Wheat;Wilmut~Dolly|1984.",
 "t|Golden rice contains beta-carotene.|True|Prevents vitamin A deficiency.",
 "m|Bt toxin comes from|Bacillus thuringiensis|E. coli~Bacterium;Rhizobium~Nitrogen fixer;Yeast~Fungus|Kills insects.",
 "n|Year first commercial human insulin was produced by rDNA|1979|Eli Lilly.",
 "m|Undifferentiated cells with self-renewal are|stem cells|neurons~Specialised;RBCs~Specialised;muscle cells~Specialised|Can differentiate.",
 "t|Germ line gene therapy has been widely done.|False|Only somatic so far.",
 "s|The repeated DNA sequences used in fingerprinting are called ____.|VNTRs|Variable number tandem repeats."],
svg=(gc,"A five step flow of gene cloning from cutting DNA to expression of the gene","Steps of gene cloning"))
print('ok')
