from lib import *
C=10;S='science'
EV='origin-and-evolution-of-life'; BR='breeding-and-biotechnology'
hom=svg(560,260,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Homologous versus analogous organs</text>'
 '<rect x="20" y="45" width="250" height="150" rx="10" fill="#d6eaf8" stroke="#333"/><text x="145" y="70" text-anchor="middle" font-size="15" font-weight="bold">Homologous</text><text x="145" y="95" text-anchor="middle" font-size="13">same origin and bone plan</text><text x="145" y="118" text-anchor="middle" font-size="13">different functions</text><text x="145" y="148" text-anchor="middle" font-size="13">human hand, cat leg,</text><text x="145" y="166" text-anchor="middle" font-size="13">whale flipper, bat wing</text>'
 '<rect x="290" y="45" width="250" height="150" rx="10" fill="#fdebd0" stroke="#333"/><text x="415" y="70" text-anchor="middle" font-size="15" font-weight="bold">Analogous</text><text x="415" y="95" text-anchor="middle" font-size="13">different origin</text><text x="415" y="118" text-anchor="middle" font-size="13">similar function</text><text x="415" y="148" text-anchor="middle" font-size="13">wings of a bat,</text><text x="415" y="166" text-anchor="middle" font-size="13">a bird and an insect</text>'
 '<text x="280" y="228" text-anchor="middle" font-size="14">Homologous organs show common ancestry (divergent evolution)</text>')
dar=svg(560,230,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Darwin: natural selection in five steps</text>'
 +''.join(f'<rect x="{x}" y="60" width="100" height="70" rx="8" fill="{c}" stroke="#333"/><text x="{x+50}" y="90" text-anchor="middle" font-size="12">{a}</text><text x="{x+50}" y="108" text-anchor="middle" font-size="12">{b}</text>' for x,c,a,b in [(10,'#fadbd8','Over-','production'),(115,'#fdebd0','Struggle for','existence'),(220,'#fcf3cf','Variations','appear'),(325,'#d5f5e3','Survival of','the fittest'),(430,'#d6eaf8','Origin of','new species')])
 +''.join(f'<polygon points="{x},95 {x+10},90 {x+10},100" fill="#333"/>' for x in (112,217,322,427))
 +'<text x="280" y="175" text-anchor="middle" font-size="14">Favourable variations accumulate over many generations</text><text x="280" y="198" text-anchor="middle" font-size="13">Book: On the Origin of Species (1859); voyage of H.M.S. Beagle 1831-1835</text>')
fos=svg(560,230,'<text x="280" y="24" text-anchor="middle" font-weight="bold">How fossils form</text>'
 +''.join(f'<rect x="{x}" y="60" width="160" height="70" rx="8" fill="{c}" stroke="#333"/><text x="{x+80}" y="88" text-anchor="middle" font-size="13" font-weight="bold">{a}</text><text x="{x+80}" y="108" text-anchor="middle" font-size="11">{b}</text>' for x,c,a,b in [(10,'#fadbd8','Petrifaction','silica replaces tissue'),(200,'#fdebd0','Mould and cast','hollow then filled'),(390,'#d6eaf8','Preservation','in ice or amber')])
 +'<text x="280" y="170" text-anchor="middle" font-size="14">Also: carbonization, compression, infiltration</text><text x="280" y="196" text-anchor="middle" font-size="13">Age by carbon-14 dating (W. F. Libby) and other radioactive elements</text>')
sel=svg(560,240,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Methods of plant breeding</text>'
 +''.join(f'<rect x="{x}" y="50" width="100" height="56" rx="8" fill="{c}" stroke="#333"/><text x="{x+50}" y="76" text-anchor="middle" font-size="12">{a}</text><text x="{x+50}" y="94" text-anchor="middle" font-size="11">{b}</text>' for x,c,a,b in [(10,'#fadbd8','Introduction','exotic varieties'),(115,'#fdebd0','Selection','mass, pureline, clonal'),(220,'#fcf3cf','Polyploidy','colchicine'),(325,'#d5f5e3','Mutation','gamma rays'),(430,'#d6eaf8','Hybridization','crossing plants')])
 +'<text x="280" y="150" text-anchor="middle" font-size="14">Aims: higher yield, better quality, disease and pest resistance, shorter duration</text><text x="280" y="176" text-anchor="middle" font-size="13">Green Revolution: Borlaug (Nobel 1970) and M. S. Swaminathan; IR-8, Sonalika, Kalyan Sona</text>')

lesson(C,S,EV,'origin-of-life-and-evidences-of-evolution',"Origin of life and evidences of evolution","Four billion years of change",
"The Earth is about 4.5 billion years old, and life appeared roughly 500 million years later. How did life begin, and how do we know that living things have changed?",
["The Big Bang theory says the universe began explosively about 15 billion years ago; the solar system formed from collapsing gas clouds and the Earth about 4.5 billion years ago. @ Big Bang",
 "Theories of origin of life: special creation, spontaneous generation (abiogenesis), biogenesis (Pasteur, 1862), cosmic origin (panspermia) and chemical evolution of Oparin (1922) and Haldane (1929). @ theories of origin of life",
 "Pasteur's flask experiment showed that life comes from pre-existing life; chemical evolution says simple molecules built organic molecules that formed the first life. @ Pasteur and chemical evolution",
 "Homologous organs share an ancestry and bone plan but differ in function, like the forelimbs of a human, cat, whale and bat. @ homologous organs",
 "Analogous organs have similar functions but different origins, like the wings of a bat, a bird and an insect. @ analogous organs",
 "Vestigial organs are degenerate and non-functional, such as the vermiform appendix and coccyx in humans; atavism is the reappearance of an ancestral trait such as a tail in a newborn. @ vestigial organs and atavism",
 "Embryos of fish to mammals look alike in early stages; Haeckel's biogenetic law says ontogeny recapitulates phylogeny. @ embryology",
 "Palaeontology studies fossils; Archaeopteryx, a Jurassic fossil with feathers like a bird and teeth and a tail like a reptile, is a connecting link between reptiles and birds. @ Archaeopteryx"],
("Are the wing of a bat and the wing of an insect homologous or analogous? Why?",[("They do the same job, flying.","Same function."),("But their structure and origin are completely different.","Bat wing has bones; insect wing does not."),("So they are analogous organs.","Homologous organs have the same origin.")]),
("Why is Archaeopteryx called a connecting link?",["It had feathers and wings like a bird","It had a long tail, clawed digits and teeth like a reptile","It links reptiles and birds"],["Saying it is a mammal"]),
["Homologous: same origin, different function; analogous: different origin, same function.","Vestigial organs and atavism show ancestry.","Pasteur proved biogenesis; Oparin and Haldane proposed chemical evolution.","Archaeopteryx links reptiles and birds."],
["m|Forelimbs of human, cat, whale and bat are|homologous organs|analogous organs~Different origin;vestigial organs~Non-functional;atavistic organs~Reappearing traits|Same bone plan.",
 "t|The vermiform appendix is a vestigial organ.|True|Degenerate in humans.",
 "m|Biogenetic law was given by|Ernst Haeckel|Louis Pasteur~Biogenesis;Oparin~Chemical evolution;Lamarck~Use and disuse|Ontogeny recapitulates phylogeny.",
 "s|The reappearance of ancestral characters is called ____.|atavism|Example: a tail in a newborn.",
 "t|Pasteur supported the theory of spontaneous generation.|False|He supported biogenesis.",
 "m|The oldest known fossil bird is|Archaeopteryx|Dodo~Recent extinct bird;Kiwi~Living bird;Peacock~Living bird|Jurassic period.",
 "n|Age of the Earth in billion years (approx.)|4.5|Life appeared 500 million years later.",
 "m|The chemical evolution theory was proposed by|Oparin and Haldane|Darwin and Wallace~Natural selection;Mendel~Genetics;Lamarck~Use and disuse|1922 and 1929.",
 "t|Wings of bird and insect are analogous organs.|True|Same function, different origin.",
 "s|The study of fossils is ____ (one word).|palaeontology|Leonardo da Vinci is called its father."],
svg=(hom,"Two boxes contrasting homologous and analogous organs with examples","Homologous and analogous organs"))

lesson(C,S,EV,'lamarck-darwin-and-variation',"Lamarckism, Darwinism and variation","The giraffe's neck",
"Why does a giraffe have such a long neck? Two great thinkers gave two different answers, and one of them is supported by modern science.",
["Evolution is the gradual change in living organisms over time that produces new species through natural selection. @ evolution",
 "Lamarck (1809, Philosophie Zoologique) proposed inheritance of acquired characters or use and disuse: organs that are used grow stronger and those unused degenerate. @ Lamarckism",
 "His principles: internal vital force, environment and new needs, use and disuse, and inheritance of acquired characters; he explained the giraffe's long neck by constant stretching. @ Lamarck's principles",
 "Charles Darwin voyaged on H.M.S. Beagle (1831-1835), visited the Galapagos, and published On the Origin of Species in 1859. @ Darwin",
 "Darwin's principles: overproduction, struggle for existence, variations, survival of the fittest (natural selection) and origin of species. @ Darwinism",
 "Struggle for existence may be intraspecific, interspecific or environmental. @ three struggles",
 "Variation is the difference among individuals of a species and the raw material of evolution; somatic variations are not inherited, germinal variations are. @ variation",
 "Continuous variations are small and fluctuating, like height and skin colour; discontinuous variations arise suddenly by mutation, for example Ancon sheep, as in De Vries' mutation theory. @ continuous and discontinuous",
 "Mutation (errors in DNA, UV rays, chemicals) causes variation in a single individual. @ mutation"],
("Explain the giraffe's long neck according to Lamarck and according to Darwin.",[("Lamarck: giraffes stretched their necks to reach leaves, and the lengthened neck was passed on to offspring.","Inheritance of acquired characters."),("Darwin: giraffes varied in neck length, and those with longer necks got more food and survived.","Natural selection of a favourable variation."),("Modern genetics supports Darwin because acquired traits are not inherited.","Only germinal variations are passed on.")]),
("List the five principles of Darwinism in order.",["Overproduction","Struggle for existence","Variations","Survival of the fittest","Origin of species"],["Thinking Darwin supported use and disuse"]),
["Lamarck: use and disuse and inheritance of acquired characters.","Darwin: overproduction, struggle, variation, natural selection, new species.","Germinal variations are inherited, somatic ones are not.","Mutation produces variation."],
["m|The theory of use and disuse was proposed by|Lamarck|Darwin~Natural selection;De Vries~Mutation theory;Mendel~Genetics|In Philosophie Zoologique.",
 "n|Year in which Darwin published On the Origin of Species|1859|After 20 years of work.",
 "t|Somatic variations are inherited.|False|Only germinal variations are inherited.",
 "m|Survival of the fittest is also called|natural selection|mutation~DNA change;atavism~Reappearing traits;recapitulation~Haeckel's law|Darwin's term.",
 "s|The ship on which Darwin sailed was H.M.S. ____.|Beagle|1831 to 1835.",
 "t|Height and skin colour show continuous variation.|True|Small fluctuating differences.",
 "m|Discontinuous variations arise by|mutation|use and disuse~Lamarck;overproduction~Darwin;migration~A different factor|Sudden changes.",
 "m|The raw material of evolution is|variation|fossils~Evidence;vestigial organs~Evidence;homology~Evidence|Evolution needs variation.",
 "t|Darwin visited the Galapagos islands.|True|During the Beagle voyage.",
 "s|The scientist who proposed the mutation theory is De ____.|Vries|Hugo de Vries."],
svg=(dar,"A five step flow of Darwin's natural selection from overproduction to the origin of new species","Darwin's natural selection"))

lesson(C,S,EV,'fossils-palaeobotany-and-astrobiology',"Fossils, ethnobotany and astrobiology","A tree turned to stone",
"Near Thiruvakkarai in Villupuram, tree trunks buried 2 million years ago have turned to stone yet still show their rings. They show how fossils give a window into ancient life.",
["A fossil is any preserved remain or impression of an ancient organism; palaeobotany studies fossil plants and helps in the study of phylogeny and classification. @ fossils and palaeobotany",
 "Kaspar Sternberg is the Father of Palaeobotany and Birbal Sahni is the Father of Indian Palaeobotany. @ founders",
 "Fossilization occurs by petrifaction (minerals like silica replace tissue), mould and cast, carbonization, preservation in ice or amber, compression and infiltration. @ fossilization methods",
 "The age of a fossil is found from radioactive elements; carbon-14 dating was discovered by W. F. Libby (1956) and measures the C-14 remaining after death. @ carbon dating",
 "Living fossils such as Ginkgo biloba look like their ancient ancestors. @ living fossils",
 "Thiruvakkarai fossil wood park in Villupuram district preserves tree trunks about 2 million years old that were replaced by silica. @ Thiruvakkarai",
 "Ethnobotany is the study of plants and their uses through traditional knowledge; the term was coined by J. W. Harshberger in 1895. @ ethnobotany",
 "Ethnobotany helps nutrition, healthcare, conservation and gives chemists and pharmacologists leads on herbal medicine. @ importance of ethnobotany",
 "Astrobiology searches for extraterrestrial life; a planet must have the right mass to hold an atmosphere and lie in the habitable or Goldilocks zone where liquid water can exist. @ astrobiology",
 "Extremophiles live in extreme conditions on Earth, so similar life might exist in extreme places in our solar system. @ extremophiles"],
("A fossil bone has 25 percent of its original carbon-14 left. What does this suggest about its age?",[("C-14 decays at a steady rate after death.","The half-life is about 5,730 years."),("25 percent left means two half-lives have passed.","50 percent then 25 percent."),("So the fossil is roughly 11,000 years old.","A rough estimate, not exact.")]),
("Describe two methods of fossilization with an example.",["Petrifaction: silica replaces tissue, as in the Thiruvakkarai fossil wood","Preservation in ice or amber keeps the entire organism","Mould and cast preserves the outer shape"],["Thinking fossils are always real bones"]),
["Fossils show gradual evolution; palaeobotany studies plant fossils.","C-14 dating discovered by Libby (1956).","Ethnobotany: traditional uses of plants; coined by Harshberger.","Astrobiology: habitable zone and extremophiles."],
["m|Father of Indian Palaeobotany|Birbal Sahni|Sternberg~Father of Palaeobotany;Libby~C-14 dating;Harshberger~Ethnobotany|1891-1949.",
 "t|Petrifaction replaces tissue with minerals.|True|Silica is common.",
 "m|C-14 dating was discovered by|W. F. Libby|Darwin~Natural selection;Haldane~Chemical evolution;Pasteur~Biogenesis|In 1956.",
 "s|The study of plants and their traditional uses is ____.|ethnobotany|Coined by Harshberger.",
 "n|Approximate age in million years of the Thiruvakkarai fossil wood|2|Villupuram district.",
 "t|Ginkgo biloba is called a living fossil.|True|It resembles its ancient ancestors.",
 "m|The habitable zone for life is also called the|Goldilocks zone|Twilight zone~Not a term;Dead zone~Low oxygen area;Orbit zone~Not a term|Neither too hot nor too cold.",
 "s|Organisms living in extreme conditions are called ____.|extremophiles|Hints at possible extraterrestrial life.",
 "t|Original remains can be preserved in amber.|True|It protects them from decay.",
 "m|Which is NOT a method of fossilization?|photosynthesis|petrifaction~A method;compression~A method;carbonization~A method|It is a life process."],
svg=(fos,"Three boxes showing petrifaction mould and cast and preservation as ways fossils form","Methods of fossilization"))
print('ok')
