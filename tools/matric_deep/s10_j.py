from lib import *
C=10;S='science'
H='health-and-diseases'
def box(x,y,w,h,c,lines,fs=12):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
add=svg(560,250,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Drug de-addiction: the path to recovery</text>'
 +box(10,55,100,80,'#fadbd8',['1 Detoxify','drug stopped','gradually'])+box(120,55,100,80,'#fdebd0',['2 Psychotherapy','individual and','group counselling'],11)
 +box(230,55,100,80,'#fcf3cf',['3 Family','counselling','accept addict'])+box(340,55,100,80,'#d5f5e3',['4 Rehabilitation','vocational','training'])+box(450,55,100,80,'#d6eaf8',['5 Follow-up','healthy life'])
 +'<text x="280" y="175" text-anchor="middle" font-size="13">WHO (1984): use the term drug dependence; Child Helpline 1098</text><text x="280" y="200" text-anchor="middle" font-size="13">26 June: International Day against Drug Abuse; 31 May: No Tobacco Day</text>')
dia=svg(560,250,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Type-1 versus Type-2 diabetes mellitus</text>'
 +box(20,45,250,160,'#fadbd8',['Type-1 (IDDM)','10 to 20 percent of cases','juvenile onset, under 20 years','normal or low body weight','beta-cells destroyed: no insulin','treated with insulin'],12)
 +box(290,45,250,160,'#d5f5e3',['Type-2 (NIDDM)','80 to 90 percent of cases','maturity onset, over 30 years','usually obese','cells do not respond to insulin','diet, exercise, drugs'],12)
 +'<text x="280" y="232" text-anchor="middle" font-size="13">Symptoms: polyuria, polydipsia, polyphagia, glycosuria, fatigue</text>')
can=svg(560,250,'<text x="280" y="24" text-anchor="middle" font-weight="bold">Cancer: types, causes and treatment</text>'
 +box(10,45,175,90,'#fadbd8',['Types','carcinoma (epithelium)','sarcoma (connective)','leukaemia (blood)'],12)
 +box(192,45,175,90,'#fdebd0',['Carcinogens','tobacco smoke, X-rays, UV','asbestos, oncogenic viruses'],12)
 +box(375,45,175,90,'#d5f5e3',['Treatment','surgery, radiation','chemotherapy, immunotherapy'],12)
 +'<text x="280" y="170" text-anchor="middle" font-size="13">Metastasis: cancer cells spread to lungs, bones, liver, skin and brain</text><text x="280" y="195" text-anchor="middle" font-size="13">Benign tumours stay confined; malignant tumours invade</text><text x="280" y="220" text-anchor="middle" font-size="13">World Cancer Day 4 February</text>')

lesson(C,S,H,'abuse-addiction-and-de-addiction',"Abuse, drugs, tobacco and alcohol","A safe and healthy life",
"Healthy habits begin with knowing what harms us. In this lesson we learn about abuse, addiction and how a person can recover with support.",
["Abuse means cruel, violent or harmful treatment of another person; types are physical, emotional, verbal, sexual and child abuse. @ abuse",
 "Children are soft targets because they may not realise they are being abused; abusers are often known to the child and may lure with gifts. @ child abuse",
 "Protection: the POCSO Act 2012 protects children from sexual offences and sets up special courts; Child Helpline 1098 offers help; NCPCR was set up in 2007. @ protection",
 "A child should never accept gifts from people without parents' knowledge and should tell a trusted adult about any unsafe touch. @ safety rules",
 "Care of an abused child: helpline, counselling, family support, medical care, legal counsel, rehabilitation and community awareness. @ approaches",
 "Addiction is physical and mental dependency on drugs, alcohol or tobacco; psychotropic drugs alter behaviour and WHO (1984) suggested the term drug dependence. @ addiction",
 "Warning signs: falling grades, loss of interest in hygiene, isolation, change in food and sleep habits and aggressive behaviour. @ behavioural changes",
 "De-addiction has detoxification, psychotherapy, counselling of the family and rehabilitation; the Narcotic Drugs and Psychotropic Substances Act was passed in 1985. @ de-addiction",
 "Tobacco contains nicotine; smoke causes lung cancer, bronchitis, emphysema, hypoxia through carbon monoxide, ulcers and oral cancer; the Anti Tobacco Act is of 2004. @ tobacco",
 "Alcohol depresses the nervous system, damages nerve cells and the liver (fatty liver, cirrhosis) and causes accidents; recovery needs education, activity, family help and medical care. @ alcohol"],
("Why does carbon monoxide in tobacco smoke cause hypoxia?",[("Carbon monoxide binds to haemoglobin in red blood cells.","It binds more strongly than oxygen."),("So haemoglobin carries less oxygen.","Oxygen supply to tissues falls."),("Low oxygen in tissues is hypoxia.","Heart and brain suffer.")]),
("List the steps of drug de-addiction in order.",["Detoxification","Psychotherapy and counselling","Family counselling","Rehabilitation"],["Skipping medical supervision"]),
["Abuse and addiction harm body and mind; help exists: helpline 1098.","POCSO Act 2012 protects children.","De-addiction: detoxification, psychotherapy, family counselling, rehabilitation.","Tobacco and alcohol harm lungs, heart and liver."],
["m|Child Helpline number|1098|100~Police;108~Ambulance;1091~Women helpline|Free service.",
 "t|POCSO Act was passed in 2012.|True|Protects children from sexual offences.",
 "m|Addiction to tobacco is due to|nicotine|caffeine~Another stimulant;morphine~A drug;carbon monoxide~A gas|An alkaloid.",
 "s|WHO suggested the term drug ____ instead of drug addiction.|dependence|In 1984.",
 "m|First phase of de-addiction treatment|detoxification|rehabilitation~Last phase;psychotherapy~Second;surgery~Not used|Drug stopped gradually.",
 "t|Alcohol can cause cirrhosis of the liver.|True|Fatty liver leads to cirrhosis.",
 "m|Which gas binds haemoglobin in smokers?|carbon monoxide|oxygen~Normal carrier;nitrogen~Inert;carbon dioxide~Waste|Causes hypoxia.",
 "n|Day in May observed as No Tobacco Day|31|31 May.",
 "t|Child abusers are often strangers only.|False|Often known to the child.",
 "s|International Day against Drug Abuse falls on 26 ____.|June|Every year."],
svg=(add,"Five box flow of drug de-addiction from detoxification to follow up","De-addiction pathway"))

lesson(C,S,H,'diabetes-obesity-and-heart-disease',"Lifestyle disorders: diabetes, obesity and heart disease","Sweet urine",
"Greek physicians noticed that some patients passed large amounts of sweet urine. Diabetes mellitus means running through, sweet. Today it affects millions.",
["Lifestyle disorders are non-communicable diseases caused by improper ways of living, stress and strain. @ lifestyle disorders",
 "Diabetes mellitus is a chronic metabolic disorder with high blood glucose due to insufficient insulin secretion or action. @ diabetes",
 "Type-1 (IDDM) is juvenile onset, caused by destruction of beta-cells of the pancreas, and needs insulin; Type-2 (NIDDM) is adult onset, the cells do not respond to insulin, and it can be controlled by diet and exercise. @ types",
 "Symptoms: hyperglycaemia, polyuria, polydipsia, glycosuria, polyphagia, fatigue and weight loss; diagnose if fasting glucose is above 140 mg per dl. @ symptoms",
 "Control: diet rich in fibre and whole grains with low refined sugar, exercise, drugs or insulin and education. @ control",
 "Obesity is excess body fat; BMI equals weight in kg divided by height in metres squared; 10 percent above standard weight is overweight and 20 percent is obese. @ obesity",
 "Obesity arises when calorie intake exceeds expenditure and raises the risk of hypertension, diabetes and heart disease; prevention uses low calorie diet, exercise, yoga. @ obesity prevention",
 "Coronary heart disease is deposition of cholesterol in coronary arteries causing atherosclerosis, ischaemia and myocardial infarction. @ heart disease",
 "HDL is good cholesterol and LDL is bad cholesterol; desirable blood cholesterol is less than 200 mg per dl. @ cholesterol",
 "Prevention: low saturated fat and salt, more fibre and PUFA, regular exercise, avoiding smoking and alcohol. @ prevention"],
("A person is 1.6 m tall and weighs 80 kg. Calculate BMI and comment.",[("BMI is weight divided by height squared.","80 / (1.6 x 1.6)."),("1.6 x 1.6 is 2.56, and 80 / 2.56 is 31.25.","About 31."),("This is well above the normal range, so the person is obese and at risk.","Needs diet and exercise.")]),
("Give two differences between Type-1 and Type-2 diabetes.",["Type-1: beta-cells destroyed, needs insulin","Type-2: cells do not respond, controlled by diet","Onset: juvenile versus maturity"],["Mixing hyperglycaemia and hypoglycaemia"]),
["Diabetes: high blood glucose.","BMI = weight / height squared.","LDL is bad, HDL is good cholesterol.","Exercise and diet prevent lifestyle disorders."],
["m|Destruction of beta-cells causes|Type-1 diabetes|Type-2 diabetes~Insulin resistance;obesity~Excess fat;cancer~Cell growth|Insulin deficiency.",
 "t|Type-2 diabetes accounts for 80 to 90 percent of cases.|True|Most common.",
 "s|Excess urine output in diabetes is called ____.|polyuria|Poly means many.",
 "m|Good cholesterol is|HDL|LDL~Bad;VLDL~Not good;TG~Triglyceride|High density lipoprotein.",
 "n|BMI of 90 kg and 1.5 m person (nearest whole)|40|90 / 2.25 = 40.",
 "t|Obesity raises risk of hypertension.|True|And diabetes and heart disease.",
 "m|Blockage of coronary arteries can cause|myocardial infarction|stroke only~Brain;ulcer~Stomach;anaemia~Blood|Heart attack.",
 "m|Diet advised for diabetics|high fibre, low refined sugar|high sugar~Harmful;high fat~Harmful;only rice~Incomplete|Includes millets.",
 "t|Desirable blood cholesterol is less than 200 mg per dl.|True|For Indians.",
 "s|Diabetes mellitus means running through ____.|sweet|Greek: diabetes and mellitus."],
svg=(dia,"Two panels comparing Type 1 and Type 2 diabetes mellitus","Type-1 and Type-2 diabetes"))

lesson(C,S,H,'cancer-and-aids',"Cancer and AIDS","Names that changed medicine",
"Cancer is from the Latin word for crab, because tumours spread like claws. AIDS appeared in the 1980s; Dr Suniti Solomon in Chennai documented India's first case in 1985.",
["Cancer is abnormal, uncontrolled cell division that forms a tumour or neoplasm; spread of cancer cells to distant parts is metastasis. @ cancer",
 "Oncology is the study of cancer; benign tumours remain confined and malignant tumours invade other tissues. @ oncology",
 "Types by tissue: carcinomas (epithelial, about 85 percent), sarcomas (connective and muscle) and leukaemia (blood cancer). @ types of cancer",
 "Carcinogens include tobacco smoke, chewing betel and tobacco, asbestos, X-rays, gamma rays, UV rays and oncogenic viruses. @ carcinogens",
 "Treatment: surgery, radiation therapy, chemotherapy and immunotherapy with interferons. @ treatment",
 "Prevention: avoid tobacco, avoid excess radiation and sunlight, protect against industrial pollutants and detect early. @ prevention",
 "AIDS is caused by HIV, which attacks lymphocytes and makes the immune system fail. @ AIDS",
 "HIV spreads by sexual contact, contaminated needles, infected blood transfusion and from mother to child; it does not spread by touch or ordinary contact. @ transmission",
 "Symptoms: swollen lymph nodes, fever, weight loss, chronic diarrhoea and repeated infections; confirmed by ELISA or Western blot; anti-retroviral drugs prolong life. @ symptoms and treatment",
 "Control: screen blood, use disposable needles, safe sex, awareness, and never isolate people living with HIV. @ prevention of AIDS"],
("A friend says AIDS spreads by shaking hands. Correct this.",[("HIV spreads only through body fluids like blood and sexual fluids.","Needs entry into the bloodstream."),("Touch, shared food or hugging do not spread HIV.","No casual contact risk."),("So people with HIV should not be isolated.","They need love and support.")]),
("Distinguish a benign tumour from a malignant tumour.",["Benign tumour stays in its organ","Malignant tumour invades and shows metastasis","Malignant growth is cancer"],["Thinking all tumours are cancer"]),
["Cancer: uncontrolled division, metastasis.","Carcinogens: tobacco, radiation, viruses.","AIDS: HIV attacks lymphocytes.","HIV spreads only by body fluids; no isolation."],
["m|Spread of cancer to other parts is|metastasis|mitosis~Cell division;meiosis~Gametes;mutation~Change|Via blood and lymph.",
 "t|Leukaemia is a cancer of the blood.|True|Excess white blood cells.",
 "m|Cancer causing agents are|carcinogens|antigens~Immune triggers;antibodies~Defence;enzymes~Catalysts|Include radiation and tobacco.",
 "s|Study of cancer is called ____.|oncology|Oncos means tumour.",
 "m|HIV attacks|lymphocytes|RBCs~Carry oxygen;platelets~Clot blood;neurons~Nerve cells|Immunity fails.",
 "t|HIV spreads by shaking hands.|False|Only by body fluids.",
 "m|Test used to confirm HIV|ELISA|X-ray~Imaging;ECG~Heart;MRI~Scan|Also Western blot.",
 "n|Year India's first HIV case was documented in Chennai|1985|By Dr Suniti Solomon.",
 "t|Chemotherapy uses drugs to kill cancer cells.|True|One treatment method.",
 "s|The date of World Cancer Day is 4 ____.|February|Observed yearly."],
svg=(can,"Three panels showing types causes and treatment of cancer","Cancer overview"))
print('ok')
