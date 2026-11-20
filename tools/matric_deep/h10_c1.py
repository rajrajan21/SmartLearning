from lib import *
C=10;S='social-science';CH='civics-central-government'
def box(x,y,w,h,c,lines,fs=12):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
org=svg(560,290,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Organs of the Central Government</text>'
 +box(190,38,180,40,'#fcf3cf',['Central Government'],13)
 +'<line x1="280" y1="78" x2="280" y2="95" stroke="#333"/><line x1="90" y1="95" x2="470" y2="95" stroke="#333"/><line x1="90" y1="95" x2="90" y2="110" stroke="#333"/><line x1="280" y1="95" x2="280" y2="110" stroke="#333"/><line x1="470" y1="95" x2="470" y2="110" stroke="#333"/>'
 +box(10,110,160,150,'#d6eaf8',['Executive','President','Vice-President','Prime Minister','Council of Ministers'],12)
 +box(200,110,160,150,'#d5f5e3',['Legislature','Parliament','President','Rajya Sabha (250)','Lok Sabha (543)'],12)
 +box(390,110,160,150,'#fadbd8',['Judiciary','Supreme Court','Chief Justice of India','and other judges'],12))
pres=svg(560,300,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Powers of the President of India</text>'
 +box(10,40,170,100,'#d6eaf8',['Executive','appoints PM, Governors,','judges, CAG, CEC'],11)
 +box(195,40,170,100,'#d5f5e3',['Legislative','summons Parliament,','assents to bills, nominates 12'],11)
 +box(380,40,170,100,'#fcf3cf',['Financial','Budget with approval,','Contingency Fund'],11)
 +box(10,155,170,100,'#fadbd8',['Judicial','Article 72: pardon,','reprieve, commute'],11)
 +box(195,155,170,100,'#ebdef0',['Military and Diplomatic','Supreme Commander,','appoints ambassadors'],11)
 +box(380,155,170,100,'#fdebd0',['Emergency','Art 352 National','356 State, 360 Financial'],11)
 +'<text x="280" y="282" text-anchor="middle" font-size="13">Elected for 5 years by an electoral college, minimum age 35</text>')
pm=svg(560,290,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Council of Ministers and Parliament</text>'
 +box(10,40,170,80,'#fadbd8',['Cabinet Ministers','senior ministers,','core decision body'],11)
 +box(195,40,170,80,'#fcf3cf',['Ministers of State','attend cabinet only','if invited'],11)
 +box(380,40,170,80,'#d6eaf8',['Deputy Ministers','lowest rank,','assist others'],11)
 +box(10,140,265,110,'#d5f5e3',['Rajya Sabha (Upper House)','250 members: 238 + 12 nominated','permanent, 6-year term','one third retire every 2 years'],11)
 +box(285,140,265,110,'#ebdef0',['Lok Sabha (Lower House)','543 elected members','5-year term','minimum age 25'],11)
 +'<text x="280" y="272" text-anchor="middle" font-size="13">Council of Ministers limited to 15 percent of Lok Sabha strength</text>')
lesson(C,S,CH,'president-and-vice-president-of-india',"The President and Vice-President of India","The house in Delhi, the retreat in Shimla",
"The President of India lives in Rashtrapati Bhavan in New Delhi, but must also work at least once a year from the Retreat in Shimla in the north and Rashtrapati Nilayam in Hyderabad in the south. The three places symbolise one country with many cultures.",
["The Central Government has three organs, the Union Executive, the Legislature known as Parliament, and the Judiciary headed by the Supreme Court. @ three organs",
 "Articles 52 to 78 in Part V of the Constitution deal with the Union Executive. @ Articles 52 to 78",
 "The President is the nominal executive and the first citizen, as well as Supreme Commander of the armed forces. @ President",
 "He is elected by an electoral college of the elected members of both Houses of Parliament, of the states, and of Delhi and Puducherry, by proportional representation with the single transferable vote. @ electoral college",
 "To stand for President a person must be an Indian citizen aged at least 35, hold no office of profit, and be proposed by 50 electors and seconded by 50 more. @ qualifications",
 "The term is five years, and he may be re-elected, taking his oath before the Chief Justice of India. @ five years",
 "Executive powers: he appoints the Prime Minister, Governors, judges of the Supreme Court and High Courts, the Attorney General, CAG, Chief Election Commissioner and ambassadors. @ executive powers",
 "Legislative powers: he summons Parliament at least twice a year, may dissolve the Lok Sabha, gives assent to bills, and nominates 12 members to the Rajya Sabha. @ legislative powers",
 "A Money Bill cannot be introduced without his approval, and the Contingency Fund of India is at his disposal. @ financial powers",
 "Article 72 gives him the power to grant pardons, reprieves, respites or remissions, or to commute a sentence. @ Article 72",
 "He can proclaim National Emergency under Article 352, State Emergency under Article 356, and Financial Emergency under Article 360. @ emergency powers",
 "He may be removed by impeachment under Article 61 for violating the Constitution. @ impeachment",
 "The Vice-President, elected for five years by indirect election, is the ex-officio Chairman of the Rajya Sabha and acts as President for up to six months when needed. @ Vice-President",
 "He may cast a vote in the Rajya Sabha only to break a tie, and if both posts are vacant, the Chief Justice acts, as M. Hidayatullah did in 1969. @ casting vote"],
("List the powers of the President of India.",[("Executive: he appoints the Prime Minister, Governors and judges.","Every action is taken in his name."),("Legislative: he summons Parliament and assents to bills.","He nominates 12 members to the Rajya Sabha."),("Judicial, military, financial and emergency powers.","Article 72 pardon, Supreme Commander, Contingency Fund, Articles 352, 356 and 360.")]),
("Who elects the President and what is the term?",["Electoral college of elected MPs and MLAs","Proportional representation, single transferable vote","Five years, can be re-elected"],["Saying the people elect the President directly"]),
["President: nominal executive, first citizen, five years.","Powers: executive, legislative, financial, judicial, military, diplomatic, emergency.","Vice-President: Chairman of Rajya Sabha, casting vote.","Impeachment under Article 61."],
["n|Minimum age to be President|35|Along with Indian citizenship.",
 "n|Number of members the President nominates to the Rajya Sabha|12|Eminent in literature, science, sports, art and social service.",
 "m|Who is the Supreme Commander of the armed forces|The President|The Prime Minister~Head of government;The Vice-President~Chairs Rajya Sabha;The Defence Minister~A minister|Article 53(2).",
 "m|National Emergency is proclaimed under Article|352|356~State Emergency;360~Financial Emergency;72~Pardon|By the President.",
 "t|The Vice-President is the ex-officio Chairman of the Rajya Sabha.|True|He can cast a vote only to break a tie.",
 "t|The President is elected directly by the people.|False|He is elected by an electoral college.",
 "m|When the President and Vice-President posts are vacant, the one who acts is|The Chief Justice of India|The Prime Minister~No;The Speaker~No;The Attorney General~No|Hidayatullah in 1969.",
 "m|The power to grant pardon is in Article|72|61~Impeachment;53~Executive power;100~Casting vote|It includes commuting sentences.",
 "s|The President is impeached under Article ____.|61|For violating the Constitution.",
 "s|The first President of India was Dr. Rajendra ____.|Prasad|Elected after the Constitution came into force."],
svg=(pres,"Six boxes showing the powers of the President of India","Powers of the President"))
lesson(C,S,CH,'prime-minister-council-of-ministers-and-parliament',"Prime Minister, Council of Ministers and Parliament","Who really runs the government",
"The President signs, but the real work of governing is done by a team led by the Prime Minister. That team answers to the Lok Sabha, the House elected by the people.",
["The Prime Minister heads the Council of Ministers, which aids and advises the President under Article 74. @ Article 74",
 "India follows the Westminster model, so the leader of the majority party in the Lok Sabha is appointed Prime Minister. @ Westminster model",
 "If no party has a majority, the President may call a leader who can form a ministry. @ no majority",
 "Other ministers are appointed on the PM's advice, and a non-member can be a minister if elected to Parliament within six months. @ six months",
 "Ministers are classified as Cabinet Ministers, Ministers of State and Deputy Ministers. @ three ranks",
 "The Cabinet, the senior ministers, takes key decisions such as defence, finance, external affairs and home. @ Cabinet",
 "The Council of Ministers is limited to 15 percent of the strength of the Lok Sabha. @ 15 percent",
 "Ministers are individually and collectively responsible to the Lok Sabha. @ collective responsibility",
 "The Prime Minister distributes portfolios, presides over Cabinet, supervises ministers and links the President and the Council. @ PM's functions",
 "Parliament has three parts, the President, the Rajya Sabha and the Lok Sabha, so it is bicameral. @ bicameral",
 "The Rajya Sabha has 250 members, 238 representing states and Union Territories and 12 nominated, and is a permanent house with a six-year term. @ Rajya Sabha",
 "One third of its members retire every two years, and its members must be 30 years old. @ one third retire",
 "The Lok Sabha has 543 elected members, 530 from states and 13 from Union Territories, with a five-year term and minimum age 25. @ Lok Sabha",
 "Rajya Sabha members are elected by MLAs by single transferable vote, so the election is indirect. @ indirect election"],
("Explain how the Prime Minister is appointed and what he does.",[("The President appoints the leader of the majority party in Lok Sabha.","India follows the Westminster model."),("He chooses ministers and distributes portfolios.","Ministers are appointed on his advice."),("He presides over the Cabinet and links the Council with the President.","He also represents India at SAARC and Commonwealth meetings.")]),
("Compare Lok Sabha and Rajya Sabha.",["Lok Sabha 543 elected, five-year term, age 25","Rajya Sabha 250, permanent, six-year term, age 30","Rajya Sabha indirectly elected"],["Saying the Rajya Sabha can be dissolved"]),
["PM: leader of the Lok Sabha majority, Westminster model.","Ministers: Cabinet, State, Deputy; limited to 15 percent of Lok Sabha.","Parliament: President, Rajya Sabha, Lok Sabha.","Rajya Sabha permanent, Lok Sabha five years."],
["n|Members of the Rajya Sabha|250|238 representatives and 12 nominated.",
 "n|Elected members of the Lok Sabha|543|530 from states and 13 from Union Territories.",
 "m|The Rajya Sabha is|a permanent house|dissolved every five years~Wrong;directly elected~Indirectly elected;the lower house~It is the upper house|One third retire every two years.",
 "m|The model followed for the Prime Minister's post is the|Westminster model|American model~President's post borrows;French model~No;Swiss model~No|Named after the British Parliament.",
 "t|A person who is not an MP can be appointed minister for six months.|True|He must be elected to Parliament within that period.",
 "t|The Council of Ministers can exceed 15 percent of the Lok Sabha.|False|The limit is 15 percent.",
 "m|Ministers of State attend Cabinet meetings|only if invited|always~Wrong;never~Wrong;only for finance~Wrong|They are the second rank.",
 "m|Minimum age to be a member of the Lok Sabha|25|30~Rajya Sabha;35~President;21~Voting age|Along with citizenship and solvency.",
 "s|The upper house of Parliament is the ____ Sabha.|Rajya|Council of States.",
 "s|Ministers are responsible collectively to the ____ Sabha.|Lok|The House of the People."],
svg=(pm,"Boxes showing ranks of ministers and the two Houses of Parliament","Council of Ministers and Parliament"))
print('ok')
