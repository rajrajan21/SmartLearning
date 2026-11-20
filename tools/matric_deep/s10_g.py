from lib import *
C=10;S='science';CH='reproduction-in-plants-and-animals'
flower=svg(560,320,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Parts of a typical flower (four whorls)</text>'
 '<ellipse cx="210" cy="190" rx="110" ry="100" fill="#fdebd0" stroke="#333"/>'
 '<rect x="195" y="120" width="30" height="130" rx="12" fill="#a9dfbf" stroke="#1e8449"/><ellipse cx="210" cy="115" rx="22" ry="12" fill="#f5b7b1" stroke="#333"/><ellipse cx="210" cy="250" rx="22" ry="22" fill="#d5f5e3" stroke="#333"/>'
 '<line x1="150" y1="150" x2="150" y2="230" stroke="#b9770e" stroke-width="4"/><circle cx="150" cy="145" r="10" fill="#f9e79f" stroke="#333"/><line x1="270" y1="150" x2="270" y2="230" stroke="#b9770e" stroke-width="4"/><circle cx="270" cy="145" r="10" fill="#f9e79f" stroke="#333"/>'
 '<text x="350" y="70" font-size="14">1. Calyx = sepals (outermost)</text><text x="350" y="100" font-size="14">2. Corolla = petals</text><text x="350" y="130" font-size="14">3. Androecium = stamens</text><text x="365" y="150" font-size="12">(filament + anther: male)</text><text x="350" y="185" font-size="14">4. Gynoecium = carpels</text><text x="365" y="205" font-size="12">(stigma, style, ovary: female)</text>'
 '<text x="350" y="245" font-size="13" fill="#a04000">Essential whorls: androecium, gynoecium</text><text x="350" y="265" font-size="13" fill="#555">Accessory whorls: calyx, corolla</text>'
 '<text x="210" y="112" text-anchor="middle" font-size="11">stigma</text><text x="152" y="125" text-anchor="middle" font-size="11">anther</text><text x="210" y="252" text-anchor="middle" font-size="11">ovary</text>')
df=svg(560,300,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Double fertilization in a flowering plant</text>'
 '<rect x="20" y="50" width="150" height="46" rx="8" fill="#fcf3cf" stroke="#333"/><text x="95" y="78" text-anchor="middle" font-size="14">Pollen grain on stigma</text>'
 '<rect x="210" y="50" width="150" height="46" rx="8" fill="#fcf3cf" stroke="#333"/><text x="285" y="78" text-anchor="middle" font-size="14">Pollen tube to ovule</text>'
 '<rect x="400" y="50" width="140" height="46" rx="8" fill="#fcf3cf" stroke="#333"/><text x="470" y="78" text-anchor="middle" font-size="14">2 male gametes</text>'
 '<line x1="170" y1="73" x2="210" y2="73" stroke="#333" stroke-width="2"/><line x1="360" y1="73" x2="400" y2="73" stroke="#333" stroke-width="2"/>'
 '<rect x="60" y="150" width="200" height="60" rx="8" fill="#d5f5e3" stroke="#333"/><text x="160" y="175" text-anchor="middle" font-size="14">Male gamete + egg (n + n)</text><text x="160" y="195" text-anchor="middle" font-size="13">SYNGAMY -> zygote (2n) -> embryo</text>'
 '<rect x="300" y="150" width="200" height="60" rx="8" fill="#fadbd8" stroke="#333"/><text x="400" y="170" text-anchor="middle" font-size="13">Male gamete + 2 polar nuclei</text><text x="400" y="190" text-anchor="middle" font-size="13">TRIPLE FUSION -> endosperm (3n)</text>'
 '<line x1="470" y1="96" x2="420" y2="150" stroke="#333" stroke-width="2"/><line x1="440" y1="96" x2="180" y2="150" stroke="#333" stroke-width="2"/>'
 '<text x="280" y="250" text-anchor="middle" font-size="14">After fertilization: ovule becomes seed, ovary becomes fruit,</text><text x="280" y="272" text-anchor="middle" font-size="14">integuments become seed coat</text>')
men=svg(560,260,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Menstrual cycle (28 days)</text>'
 +''.join(f'<rect x="{x}" y="60" width="{w}" height="46" fill="{c}" stroke="#333"/><text x="{x+w/2}" y="88" text-anchor="middle" font-size="12">{t}</text>' for x,w,c,t in [(20,70,'#f5b7b1','Menstrual 1-5'),(90,190,'#aed6f1','Follicular 6-13'),(280,20,'#f9e79f',''),(300,240,'#d2b4de','Luteal 15-28')])
 +'<text x="290" y="130" text-anchor="middle" font-size="13" fill="#b9770e">Day 14: ovulation (LH peak)</text><line x1="290" y1="106" x2="290" y2="118" stroke="#b9770e" stroke-width="2"/>'
 '<text x="55" y="160" text-anchor="middle" font-size="12">lining breaks</text><text x="185" y="160" text-anchor="middle" font-size="12">lining rebuilt (FSH, oestrogen)</text><text x="420" y="160" text-anchor="middle" font-size="12">corpus luteum: progesterone</text>'
 '<text x="280" y="205" text-anchor="middle" font-size="14">No fertilization: corpus luteum degenerates and menstruation starts</text><text x="280" y="228" text-anchor="middle" font-size="14">Fertilization: corpus luteum persists and pregnancy is maintained</text>')
dev=svg(560,200,'<text x="280" y="24" text-anchor="middle" font-weight="bold">From fertilization to birth</text>'
 +''.join(f'<rect x="{x}" y="60" width="95" height="60" rx="8" fill="{c}" stroke="#333"/><text x="{x+47}" y="86" text-anchor="middle" font-size="13">{a}</text><text x="{x+47}" y="104" text-anchor="middle" font-size="11">{b}</text>' for x,c,a,b in [(10,'#fadbd8','Fertilization','in the oviduct'),(115,'#fdebd0','Cleavage','blastocyst'),(220,'#fcf3cf','Implantation','day 6-7'),(325,'#d5f5e3','Organs form','germ layers'),(430,'#d6eaf8','Birth','about 280 days')])
 +''.join(f'<polygon points="{x},90 {x+10},85 {x+10},95" fill="#333"/>' for x in (112,217,322,427))
 +'<text x="280" y="165" text-anchor="middle" font-size="14">Placenta feeds the foetus; oxytocin causes birth; prolactin makes milk</text>')

lesson(C,S,CH,'modes-of-reproduction-and-flower-structure',"Vegetative, asexual and sexual reproduction in plants, and the flower","Bryophyllum's baby plants",
"Put a Bryophyllum leaf on damp soil and tiny plantlets sprout from its notches. No seeds, no flowers - yet new plants appear. That is one of three ways plants reproduce.",
["Reproduction ensures continuity of the species. Plants reproduce in three ways: vegetative, asexual and sexual. @ three kinds of reproduction",
 "In vegetative reproduction a detached vegetative part (root, stem, leaf or bud) grows into a new plant by mitosis only, so the offspring are genetically similar to the parent. @ vegetative reproduction",
 "Examples: Bryophyllum leaf notches, strawberry runners, tuberous roots of sweet potato and asparagus, and bulbils of Agave. @ examples",
 "Other methods: fragmentation in Spirogyra, fission in Amoeba, budding in yeast and regeneration in Hydra and Planaria. @ fragmentation fission budding regeneration",
 "Asexual reproduction is by a single parent without gametes, as by spores formed in the sporangium of Rhizopus; the offspring are exact copies. @ asexual by spores",
 "Sexual reproduction needs fusion of male and female gametes; a flower is a modified shoot with four whorls: calyx, corolla, androecium and gynoecium. @ flower whorls",
 "Calyx and corolla are accessory whorls, while androecium and gynoecium are essential whorls. @ essential whorls",
 "The stamen has a filament and an anther producing pollen; the pistil has a stigma, style and ovary with ovules. @ stamen and pistil",
 "A pollen grain has an outer hard exine with germ pores and a thin inner intine; it holds a vegetative cell and a generative cell, which divides into two male gametes. @ pollen grain",
 "The ovule has a nucellus covered by two integuments with a micropyle; its embryo sac has seven cells and eight nuclei: egg apparatus of three cells, three antipodal cells and two polar nuclei. @ ovule and embryo sac"],
("Is a plant grown from a potato tuber a result of sexual or vegetative reproduction? Is it identical to the parent?",[("A tuber is a vegetative part of the plant.","No gametes are involved."),("So it is vegetative reproduction by mitosis.","Offspring arise from somatic cells."),("The new plant is genetically similar to the parent.","No new gene combination appears.")]),
("Name the four whorls of a flower from the outside and say which are essential.",["Calyx, corolla, androecium, gynoecium","Androecium and gynoecium are essential","Calyx and corolla are accessory"],["Calling petals the male part"]),
["Vegetative: from roots, stems, leaves or buds; offspring similar to parent.","Asexual: single parent, by spores; sexual: fusion of gametes.","Flower: calyx, corolla, androecium, gynoecium.","Embryo sac has 7 cells and 8 nuclei."],
["m|Bryophyllum reproduces by|leaf notches|runners~Strawberry;bulbils~Agave;spores~Fungi|Plantlets grow at the notches.",
 "t|Offspring of asexual reproduction are exact copies of the parent.|True|Only mitosis, no gametes.",
 "m|Budding is seen in|yeast|Amoeba~Fission;Spirogyra~Fragmentation;Hydra~Regeneration|A bud grows on the parent.",
 "s|The male part of the flower is the ____.|androecium|Made of stamens.",
 "m|The essential whorls of a flower are|androecium and gynoecium|calyx and corolla~Accessory whorls;calyx and androecium~Mixed;corolla and gynoecium~Mixed|They take part directly in reproduction.",
 "t|The generative cell of a pollen grain divides to form two male gametes.|True|Mitotic division.",
 "n|Number of cells in a typical embryo sac|7|With eight nuclei.",
 "s|Fission is a mode of reproduction in ____ (an amoeboid organism).|Amoeba|The parent cell divides into two.",
 "t|The outer layer of the pollen wall is the intine.|False|The outer layer is exine; the inner is intine.",
 "m|The opening in the ovule is the|micropyle|chalaza~The base;funiculus~The stalk;nucellus~Main tissue|The pollen tube enters through it."],
svg=(flower,"A flower diagram labelling stigma anther and ovary with the four whorls described","Parts of a flower"))

lesson(C,S,CH,'pollination-and-fertilization-in-plants',"Pollination and double fertilization","The bee and the flower",
"A bee visits a flower for nectar and leaves with pollen on its legs. Its next visit may start a new seed. Pollination is the first step in making a seed.",
["Pollination is the transfer of pollen from an anther to a stigma; it leads to fertilization, fruits and seeds. @ pollination",
 "Self-pollination (autogamy) happens within the same flower or plant, as in Hibiscus; it needs no agent and wastes no pollen, but gives fewer seeds, weak plants and no new varieties. @ self-pollination",
 "Cross-pollination takes pollen to a flower on another plant of the same species; it gives healthy seeds and new varieties but depends on agents and wastes pollen. @ cross-pollination",
 "Wind pollination (anemophily): flowers produce huge amounts of light, dry pollen and have large feathery stigmas, as in grasses. @ anemophily",
 "Insect pollination (entomophily): flowers are colourful, scented and rich in nectar with sticky, spiny pollen; honey bees do about 80 percent of it. @ entomophily",
 "Water pollination (hydrophily) occurs in aquatic plants such as Hydrilla and Vallisneria; animal pollination is zoophily, for example sunbirds pollinating Canna. @ hydrophily and zoophily",
 "After landing on the stigma the pollen grain forms a pollen tube that grows through the style to the micropyle and releases two male gametes into the embryo sac. @ pollen tube",
 "One male gamete fuses with the egg (syngamy) to form the diploid zygote; the other fuses with the two polar nuclei (triple fusion) to form the triploid primary endosperm nucleus. @ syngamy and triple fusion",
 "Two fusions in one embryo sac are called double fertilization; the endosperm feeds the embryo and the synergids and antipodals degenerate. @ double fertilization",
 "After fertilization the ovule becomes the seed, the integuments become the seed coat and the ovary becomes the fruit. @ after fertilization"],
("Compare self- and cross-pollination in terms of seed quality and variation.",[("Self-pollination gives fewer seeds with minute endosperm, so plants are weaker.","Genes are not mixed."),("Cross-pollination mixes genes of two plants.","It gives more viable seeds."),("So only cross-pollination produces new varieties.","That is why it is more useful for evolution.")]),
("Describe the steps of double fertilization.",["Pollen tube enters the embryo sac","Male gamete + egg = zygote","Male gamete + polar nuclei = endosperm"],["Saying only one fusion occurs"]),
["Self- and cross-pollination; agents: wind, insects, water, animals.","Pollen tube carries two male gametes to the embryo sac.","Syngamy gives the zygote; triple fusion gives the endosperm.","Ovule becomes seed, ovary becomes fruit."],
["m|Pollination by wind is called|anemophily|entomophily~By insects;hydrophily~By water;zoophily~By animals|Grasses are an example.",
 "t|Self-pollination can produce new varieties of plants.|False|Genes are not mixed.",
 "s|Pollination by water is called ____.|hydrophily|Example: Vallisneria.",
 "m|Triple fusion produces|primary endosperm nucleus|zygote~From syngamy;pollen tube~Not a product;embryo sac~The site|It is triploid (3n).",
 "t|Double fertilization involves two fusions.|True|Syngamy and triple fusion.",
 "m|The ovary of the flower develops into the|fruit|seed~From the ovule;seed coat~From integuments;pollen~Male gametophyte|After fertilization.",
 "s|The fusion of a male gamete with the egg is called ____.|syngamy|Forms the zygote.",
 "t|Honey bees account for about 80 percent of insect pollination.|True|Per the textbook.",
 "m|A feature of wind-pollinated flowers is|light, dry pollen in huge amounts|bright petals~For insects;scent and nectar~For insects;sticky pollen~For insects|Pollen may travel over 1,000 km.",
 "n|Ploidy number of the primary endosperm nucleus (n)|3|Triploid."],
svg=(df,"A flow diagram showing the pollen tube bringing two male gametes for syngamy and triple fusion","Double fertilization"))

lesson(C,S,CH,'human-reproductive-system-and-menstrual-cycle',"Human reproductive system, gametes and the menstrual cycle","The monthly rhythm",
"From puberty a woman's body follows a roughly 28-day rhythm controlled by hormones from the pituitary and the ovary. It prepares the uterus every month for a possible pregnancy.",
["The primary reproductive organs are the testes in males and ovaries in females; the accessory organs include the vas deferens, epididymis, prostate and penis in males and the fallopian tubes, uterus, cervix and vagina in females. @ primary and accessory organs",
 "The testes lie in the scrotum; sperms form in the seminiferous tubules, Sertoli cells nourish them and Leydig cells make testosterone. @ testis",
 "The ovary has a cortex and a medulla; granulosa cells surround each ovum to form the primary follicle, which grows into the fluid-filled Graafian follicle. @ ovary",
 "Gametogenesis is the formation of haploid gametes: spermatogenesis in the male and oogenesis in the female. @ gametogenesis",
 "A sperm has a head with a nucleus and acrosome, whose enzyme hyaluronidase helps entry into the ovum, a middle piece with mitochondria for energy and a tail for movement. @ sperm",
 "The ovum is spherical, almost free of yolk and surrounded by plasma membrane, zona pellucida, corona radiata and the vitelline membrane. @ ovum",
 "Puberty begins earlier in girls (11 to 13 years) than boys (13 to 14); LH and FSH from the pituitary control the sex hormones. @ puberty",
 "The menstrual cycle of about 28 days begins at menarche and ends at menopause around 48 to 50 years. @ menarche and menopause",
 "Its four phases: menstrual (days 1-5, lining breaks), follicular (6-13, FSH and oestrogen rise), ovulatory (day 14, LH peak releases the egg) and luteal (15-28, corpus luteum makes progesterone). @ four phases",
 "If fertilization does not occur the corpus luteum degenerates and menstruation begins; if it does, the corpus luteum persists and maintains the pregnancy. @ outcome"],
("On which day does ovulation occur in a 28-day cycle and which hormone triggers it?",[("The ovulatory phase is around day 14.","It is the midpoint of the cycle."),("A peak of LH from the pituitary causes the Graafian follicle to rupture.","The ovum is released."),("The ovum survives about 24 hours, so fertilization must happen then.","Hence the importance of timing.")]),
("Describe the structure of a sperm and the function of each part.",["Head with nucleus and acrosome","Middle piece with mitochondria","Tail for swimming"],["Saying the ovum is formed in the seminiferous tubules"]),
["Testes make sperm and testosterone; ovaries make ova, oestrogen and progesterone.","Sperm: head, middle piece, tail; ovum has three membranes.","Menstrual cycle: 28 days in four phases.","Ovulation on day 14 follows the LH peak."],
["m|Sperm are formed in the|seminiferous tubules|Graafian follicle~Female structure;epididymis~Stores sperm;scrotum~Holds the testes|Spermatogenesis.",
 "s|The first menstrual flow at puberty is called ____.|menarche|It ends at menopause.",
 "t|Ovulation occurs on about the 14th day of a 28-day cycle.|True|After an LH peak.",
 "m|The acrosome of sperm contains|hyaluronidase|haemoglobin~Not there;insulin~A hormone;mitochondria~In the middle piece|It helps the sperm enter the ovum.",
 "n|Average length of the menstrual cycle in days|28|With minor variation.",
 "t|The corpus luteum secretes progesterone.|True|It develops from the emptied Graafian follicle.",
 "m|The Leydig cells secrete|testosterone|oestrogen~From Graafian follicles;LH~From the pituitary;insulin~From the pancreas|They lie between the tubules.",
 "s|The outer membrane of the ovum made of follicle cells is the corona ____.|radiata|Outside the zona pellucida.",
 "t|Menstruation occurs when the ovum is fertilized.|False|It occurs when the ovum is not fertilized.",
 "m|Which phase has the breakdown of uterine lining?|menstrual phase|ovulatory phase~Egg release;luteal phase~Lining prepared;follicular phase~Lining rebuilt|Days 1 to 5."],
svg=(men,"A bar showing the four phases of the 28-day menstrual cycle with ovulation at day 14","Menstrual cycle"))

lesson(C,S,CH,'fertilization-pregnancy-and-reproductive-health',"Fertilization, pregnancy, birth and reproductive health","Nine months",
"A single cell, the zygote, becomes a baby in about 280 days. This lesson follows that journey and then looks at how families can protect reproductive health.",
["Fertilization in humans is internal and takes place in the ampulla of the fallopian tube; the ovum lives about 24 hours, and the fused sperm and ovum form the zygote. @ fertilization",
 "The zygote divides by cleavage, the first division about 30 hours after fertilization, forming a blastocyst of an outer layer and an inner cell mass. @ cleavage and blastocyst",
 "Implantation is the attachment of the blastocyst to the uterine wall about 6 to 7 days after fertilization. @ implantation",
 "Gastrulation forms the three germ layers (ectoderm, mesoderm and endoderm) and organogenesis builds the organs from them. @ germ layers",
 "The placenta is the temporary link between mother and embryo exchanging food, oxygen, wastes and carbon dioxide; the umbilical cord connects it to the foetus. @ placenta",
 "Gestation lasts about 280 days; at birth (parturition) oxytocin makes the uterus contract. @ gestation and parturition",
 "Lactation is milk production, stimulated by prolactin, with milk ejection by oxytocin; the first fluid, colostrum, carries immune substances. @ lactation and colostrum",
 "Fraternal twins come from two eggs fertilised by two sperms; identical twins come from one egg that splits. @ twins",
 "Reproductive health, per the WHO, is total well-being in all aspects of reproduction; India's Family Welfare and RCH programmes support it. @ reproductive health",
 "Contraception includes barrier methods (condom, diaphragm), hormonal pills, IUDs like Copper-T and surgical methods (vasectomy, tubectomy); the red triangle is the family planning symbol. @ contraception"],
("A couple uses a condom. Give two ways it helps.",[("It acts as a barrier, so sperms cannot reach the ovum.","This prevents pregnancy."),("It also protects against sexually transmitted diseases such as syphilis and AIDS.","Barrier methods block infection."),("So it helps both family planning and health.","Hormonal methods and IUDs do not protect against infection.")]),
("Sequence the events from fertilization to birth.",["Fertilization then cleavage","Blastocyst implants in the uterus","Placenta forms and organs develop","Birth after about 280 days with oxytocin"],["Placing implantation before fertilization"]),
["Fertilization occurs in the fallopian tube; implantation about day 6-7.","Placenta exchanges food, oxygen and wastes; gestation lasts 280 days.","Oxytocin causes birth; prolactin makes milk.","Contraceptive methods: barrier, hormonal, IUD, surgical."],
["n|Average gestation period in days|280|About nine months.",
 "m|Fertilization usually occurs in the|fallopian tube (ampulla)|uterus~Implantation site;ovary~Egg release site;vagina~Birth canal|Internal fertilization.",
 "t|Oxytocin stimulates uterine contractions at birth.|True|From the posterior pituitary.",
 "s|The first milk after childbirth is called ____.|colostrum|It has immune substances.",
 "m|Which method is a permanent surgical method in males?|vasectomy|tubectomy~In females;condom~Barrier method;Copper-T~An IUD|Ligation of the vas deferens.",
 "t|The placenta lets the foetus exchange food and gases with the mother.|True|Through the umbilical cord.",
 "n|Days after fertilization when implantation occurs|7|About 6 to 7 days.",
 "m|Which hormone stimulates milk production?|prolactin|oxytocin~Ejects milk;insulin~Pancreas;thymosin~Thymus|From the anterior pituitary.",
 "s|The year India launched the national family planning programme is ____.|1952|One of the first in the world.",
 "t|Identical twins arise from two different eggs.|False|From a single egg that divides."],
svg=(dev,"A five step flow from fertilization to cleavage implantation organ formation and birth","Fertilization to birth"))
print('ok')
