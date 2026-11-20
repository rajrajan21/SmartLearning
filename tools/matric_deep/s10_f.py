from lib import *
C=10;S='science';CH='plant-and-animal-hormones'
def table(title,rows,heads,w=560,widths=(150,200,200)):
    h=60+30*(len(rows)+1); s=f'<text x="{w/2}" y="24" text-anchor="middle" font-weight="bold">{title}</text>'
    x0=20; xs=[x0]; 
    for a in widths: xs.append(xs[-1]+a)
    for j,t in enumerate(heads): s+=f'<rect x="{xs[j]}" y="40" width="{widths[j]}" height="30" fill="#d6eaf8" stroke="#555"/><text x="{xs[j]+6}" y="60" font-size="13" font-weight="bold">{t}</text>'
    for i,r in enumerate(rows):
        for j,t in enumerate(r): s+=f'<rect x="{xs[j]}" y="{70+i*30}" width="{widths[j]}" height="30" fill="{"#fdfefe" if i%2 else "#f4f6f7"}" stroke="#555"/><text x="{xs[j]+6}" y="{90+i*30}" font-size="12">{t}</text>'
    return svg(w,h,s)
ph=table('Five plant hormones',[('Auxin','promotes stem elongation','apical dominance, seedless fruit'),('Cytokinin','promotes cell division','delays ageing, lateral buds'),('Gibberellin','internode elongation','bolting, breaks dormancy'),('Abscisic acid','growth inhibitor (stress)','abscission, stomatal closure'),('Ethylene','gas; ripens fruits','senescence, abscission zone')],('Hormone','Main role','Other effects'),578,(120,210,230))
gl=table('Endocrine glands: hormones and disorders',[('Pituitary','GH, TSH, ACTH, FSH, LH, PRL','dwarfism, gigantism'),('Thyroid','thyroxine T4, T3','goitre, cretinism, Grave\'s'),('Parathyroid','parathormone','tetany'),('Pancreas','insulin, glucagon','diabetes mellitus'),('Adrenal','cortisol, aldosterone, adrenaline','emergency response'),('Testis / Ovary','testosterone / oestrogen, progesterone','sex characters')],('Gland','Hormones','Disorder / effect'),578,(110,250,218))
bg=svg(560,260,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Insulin and glucagon keep blood glucose steady</text>'
 '<rect x="210" y="100" width="140" height="50" rx="10" fill="#fdebd0" stroke="#333"/><text x="280" y="130" text-anchor="middle" font-size="14">Blood glucose</text>'
 '<rect x="30" y="40" width="160" height="50" rx="10" fill="#aed6f1" stroke="#333"/><text x="110" y="62" text-anchor="middle" font-size="13">Beta cells: INSULIN</text><text x="110" y="80" text-anchor="middle" font-size="12">glucose -> glycogen</text>'
 '<rect x="370" y="40" width="160" height="50" rx="10" fill="#f5b7b1" stroke="#333"/><text x="450" y="62" text-anchor="middle" font-size="13">Alpha cells: GLUCAGON</text><text x="450" y="80" text-anchor="middle" font-size="12">glycogen -> glucose</text>'
 '<text x="110" y="125" text-anchor="middle" font-size="13" fill="#2874a6">lowers glucose</text><text x="450" y="125" text-anchor="middle" font-size="13" fill="#c0392b">raises glucose</text>'
 '<text x="280" y="195" text-anchor="middle" font-size="14">Too little insulin = diabetes mellitus</text><text x="280" y="220" text-anchor="middle" font-size="13">high blood sugar, sugar in urine, thirst, frequent urination</text>')

lesson(C,S,CH,'plant-hormones',"Plant hormones: auxins, cytokinins, gibberellins, abscisic acid and ethylene","The bent seedling",
"A seedling on a windowsill bends toward the light. No nerves or muscles do this - chemical messengers called plant hormones do.",
["Plant hormones (phytohormones) are organic molecules made in very small amounts that control growth, physiological and biochemical responses. @ plant hormones",
 "There are five major classes: auxins, cytokinins, gibberellins, abscisic acid and ethylene; the first three promote growth while abscisic acid and ethylene inhibit it. @ five classes",
 "Went's experiment on Avena coleoptiles showed that a chemical diffusing from the tip, which he named auxin, causes growth; Darwin had earlier seen the tip influence bending. @ Went's experiment",
 "Auxins (IAA is natural, 2,4-D synthetic) elongate stems, give apical dominance, induce roots at low concentration, produce seedless fruit (parthenocarpy) and prevent the abscission layer. @ auxins",
 "Cytokinins promote cell division, delay ageing (Richmond-Lang effect) and encourage lateral buds; they were first isolated from herring sperm and are abundant in coconut milk. @ cytokinins",
 "Gibberellins, found by Kurosawa in the Bakanae disease of rice, cause internode elongation and bolting in rosette plants, break dormancy of potato tubers and give parthenocarpic fruits. @ gibberellins",
 "Abscisic acid is the stress hormone: it causes abscission, closes stomata in drought, promotes leaf senescence and induces bud dormancy. @ abscisic acid",
 "Ethylene is a gas that ripens fruits like banana and mango, hastens senescence and forms the abscission zone. @ ethylene"],
("Why does a ripe banana placed beside unripe tomatoes in a paper bag ripen them?",[("The ripe banana releases ethylene gas.","Ethylene is the ripening hormone."),("The gas stays trapped in the bag.","It reaches the tomatoes."),("Ethylene triggers ripening of the tomatoes, so they ripen faster than tomatoes kept alone.","This is a controlled activity from the textbook.")]),
("Match each hormone to one effect: auxin, cytokinin, gibberellin, abscisic acid, ethylene.",["Auxin: stem elongation or apical dominance","Cytokinin: cell division","Gibberellin: bolting or internode elongation","Abscisic acid: stress or abscission","Ethylene: ripening"],["Thinking ethylene is a liquid (it is a gas)"]),
["Auxin, cytokinin and gibberellin promote growth; abscisic acid and ethylene inhibit it.","Auxin discovered through Went's experiment; IAA natural, 2,4-D synthetic.","Gibberellins: bolting and seedless fruits; cytokinins delay ageing.","ABA is the stress hormone; ethylene ripens fruits."],
["m|The gaseous plant hormone is|ethylene|auxin~Not a gas;cytokinin~Not a gas;gibberellin~Not a gas|It ripens fruits.",
 "s|The hormone that causes apical dominance is ____.|auxin|It suppresses lateral buds.",
 "t|Gibberellins cause bolting in rosette plants.|True|Sudden internode elongation then flowering.",
 "m|The stress hormone is|abscisic acid|auxin~Growth promoter;cytokinin~Cell division;gibberellin~Elongation|It closes stomata during drought.",
 "m|The hormone first isolated from herring fish sperm|cytokinin|auxin~From coleoptile tips;ABA~From plants;ethylene~A gas|Zeatin came later from maize.",
 "t|Abscisic acid promotes plant growth.|False|It is a growth inhibitor.",
 "s|Development of fruit without fertilisation is called ____.|parthenocarpy|Induced by auxins or gibberellins.",
 "m|Who demonstrated the existence of auxin using Avena coleoptiles?|F. W. Went|Charles Darwin~Observed bending only;Kurosawa~Studied rice disease;Landsteiner~Blood groups|Went (1903-1990).",
 "t|2,4-D is a natural auxin.|False|It is synthetic; IAA is natural.",
 "m|Which delays ageing in leaves?|cytokinin|ethylene~Hastens senescence;ABA~Promotes senescence;none~There is a hormone|The Richmond-Lang effect."],
svg=(ph,"A table of five plant hormones with their main roles and other effects","Plant hormones at a glance"))

lesson(C,S,CH,'pituitary-thyroid-and-parathyroid',"Endocrine glands: pituitary, thyroid and parathyroid","The master gland",
"The body has a second control system besides the nerves. Ductless glands pour hormones into the blood and each hormone acts on specific target organs.",
["Hormones are chemical messengers made in minute amounts by ductless endocrine glands and carried by the blood to target organs; exocrine glands such as salivary and sweat glands have ducts. @ endocrine and exocrine",
 "Thomas Addison is the Father of Endocrinology; Bayliss and Starling introduced the term hormone in 1909 after discovering secretin. @ history",
 "The pituitary lies at the base of the midbrain attached to the hypothalamus and is the master gland because it controls other glands. @ master gland",
 "The anterior pituitary secretes growth hormone, TSH, ACTH, gonadotropins FSH and LH, and prolactin. @ anterior pituitary",
 "Too little growth hormone in children causes dwarfism, too much causes gigantism, and too much in adults causes acromegaly. @ growth hormone disorders",
 "The posterior pituitary releases ADH (vasopressin), which increases water reabsorption in the kidney, and oxytocin, which contracts the uterus and ejects milk. @ posterior pituitary",
 "Lack of ADH causes diabetes insipidus with a large urine output. @ diabetes insipidus",
 "The thyroid has two lobes joined by an isthmus and makes T3 and thyroxine T4 using iodine and tyrosine; they regulate basal metabolic rate and body temperature. @ thyroid",
 "Iodine deficiency causes simple goitre; low thyroid hormone causes cretinism in children and myxoedema in adults; excess causes Grave's disease with protruding eyes. @ thyroid disorders",
 "The four parathyroid glands make parathormone, which regulates calcium and phosphorus; low levels cause tetany. @ parathyroid"],
("Why do people in iodine-poor hill regions often develop goitre?",[("The thyroid needs iodine to make thyroxine.","Iodine is part of T3 and T4."),("With too little iodine the thyroid cannot make enough hormone.","The pituitary then stimulates it more."),("The gland enlarges, forming a swelling in the neck called goitre.","Iodised salt prevents it.")]),
("Why is the pituitary called the master gland? Give two examples.",["It controls other endocrine glands","TSH controls the thyroid","ACTH controls the adrenal cortex"],["Thinking the pituitary is in the thyroid or kidney"]),
["Pituitary = master gland: GH, TSH, ACTH, FSH, LH, PRL, ADH, oxytocin.","GH: dwarfism, gigantism, acromegaly.","Thyroid needs iodine: goitre, cretinism, myxoedema, Grave's.","Parathormone controls calcium: low gives tetany."],
["m|The master gland is the|pituitary|thyroid~Controls metabolism;adrenal~Above the kidney;pancreas~Makes insulin|It regulates other glands.",
 "t|Endocrine glands have ducts.|False|They are ductless.",
 "m|Dwarfism is caused by too little|growth hormone|thyroxine~Gives cretinism;insulin~Gives diabetes;ADH~Gives diabetes insipidus|Deficient in childhood.",
 "s|The deficiency of iodine causes ____.|goitre|Enlargement of the thyroid.",
 "m|ADH acts on the|kidney tubules|liver~Not the target;heart~Not the target;thyroid~Not the target|It increases water reabsorption.",
 "t|Parathormone regulates calcium and phosphorus.|True|Its deficiency causes tetany.",
 "s|Excess thyroid hormone causes ____ disease.|Grave's|It causes exophthalmia.",
 "m|Hormone that contracts the uterus during childbirth|oxytocin|prolactin~Milk formation;ACTH~Adrenal control;FSH~Follicle growth|Also milk ejection.",
 "t|Thyroxine contains iodine.|True|Made from tyrosine and iodine.",
 "n|Number of parathyroid glands in humans|4|Small oval bodies behind the thyroid."],
svg=(gl,"A table listing the main endocrine glands with their hormones and disorders","Endocrine glands and hormones"))

lesson(C,S,CH,'pancreas-adrenal-gonads-and-thymus',"Pancreas, adrenal glands, gonads and thymus","Blood sugar balance",
"After a sweet snack your blood sugar rises, and your pancreas responds within minutes to bring it back down. Two hormones work like a thermostat for glucose.",
["The pancreas is both exocrine (pancreatic juice) and endocrine; the islets of Langerhans have alpha cells making glucagon and beta cells making insulin. @ pancreas",
 "Insulin converts glucose to glycogen in the liver and muscles, helps glucose enter cells and lowers blood glucose; glucagon breaks glycogen to glucose and raises it. @ insulin and glucagon",
 "Insulin deficiency causes diabetes mellitus with high blood sugar, glucose in urine, frequent urination, thirst and hunger; Banting, Best and MacLeod discovered insulin in 1921. @ diabetes mellitus",
 "The adrenal glands lie above the kidneys: the cortex makes cortisol, which is anti-inflammatory and called the life-saving hormone, and aldosterone, which retains sodium and excretes potassium. @ adrenal cortex",
 "The adrenal medulla makes adrenaline and noradrenaline, the flight, fright and fight hormones, which raise heart rate, blood pressure and glucose and dilate the pupils. @ adrenal medulla",
 "The testes (Leydig cells) make testosterone, which controls sperm formation and male secondary sexual characters. @ testosterone",
 "The ovaries make oestrogen from Graafian follicles, for puberty, oogenesis and female characters, and progesterone from the corpus luteum, which maintains pregnancy and prepares the uterus. @ oestrogen and progesterone",
 "The thymus in the upper chest makes thymosin, which stimulates lymphocytes and the immune function. @ thymus"],
("Explain what happens to blood glucose after a meal and after a long fast.",[("After a meal glucose rises, so beta cells release insulin.","Insulin lowers blood glucose."),("Glucose is stored as glycogen in the liver and muscles.","It enters body cells."),("After a long fast glucose falls, so alpha cells release glucagon, which turns glycogen into glucose.","Together they keep glucose steady.")]),
("List the symptoms of diabetes mellitus and give its cause.",["Cause: lack of insulin","High blood sugar and sugar in urine","Frequent urination, thirst and hunger"],["Mixing it up with diabetes insipidus (lack of ADH)"]),
["Insulin lowers and glucagon raises blood glucose.","Lack of insulin gives diabetes mellitus.","Adrenal cortex: cortisol and aldosterone; medulla: adrenaline.","Testosterone, oestrogen and progesterone are sex hormones; thymus makes thymosin."],
["m|The hormone that lowers blood glucose is|insulin|glucagon~Raises glucose;adrenaline~Raises glucose;thyroxine~Controls metabolism|It stores glucose as glycogen.",
 "s|The cells of the islets of Langerhans that make insulin are ____ cells.|beta|Alpha cells make glucagon.",
 "t|Adrenaline is the flight, fright and fight hormone.|True|From the adrenal medulla.",
 "m|Diabetes mellitus is caused by deficiency of|insulin|ADH~Gives diabetes insipidus;thyroxine~Gives cretinism;cortisol~Needed in stress|Blood sugar stays high.",
 "t|Glucagon is secreted by beta cells.|False|By alpha cells.",
 "s|The hormone that retains sodium and excretes potassium is ____.|aldosterone|From the adrenal cortex.",
 "m|Hormone secreted by the thymus|thymosin|testosterone~Male sex hormone;progesterone~Corpus luteum;insulin~Pancreas|Stimulates lymphocytes.",
 "t|Progesterone maintains pregnancy.|True|It prepares the uterus for implantation.",
 "m|Testosterone is secreted by the|Leydig cells of the testis|ovary~Female gonad;pancreas~Insulin source;thymus~Thymosin source|Controls male characters.",
 "n|Year in which insulin was discovered by Banting, Best and MacLeod|1921|First used in treatment on 11 January 1922."],
svg=(bg,"A feedback diagram showing insulin lowering blood glucose and glucagon raising it","Insulin and glucagon"))
print('ok')
