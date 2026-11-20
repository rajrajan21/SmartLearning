from lib import *
C=10;S='social-science';CH='civics-state-government'
def box(x,y,w,h,c,lines,fs=12):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
gv=svg(560,300,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Powers of the Governor</text>'
 +box(10,40,170,100,'#d6eaf8',['Executive','appoints CM on majority,','ministers, SPSC members'],11)
 +box(195,40,170,100,'#d5f5e3',['Legislative','summons, prorogues,','assent or withhold, ordinances'],11)
 +box(380,40,170,100,'#fcf3cf',['Financial','budget, Money Bills only','with his recommendation'],11)
 +box(10,155,170,100,'#fadbd8',['Judicial','appoints district judges,','pardon except death sentence'],11)
 +box(195,155,170,100,'#ebdef0',['Discretionary','reserve bill for President,','invite largest party'],11)
 +box(380,155,170,100,'#fdebd0',['Emergency','Article 356 report,','President Rule'],11)
 +'<text x="280" y="282" text-anchor="middle" font-size="13">Appointed by the President, 5-year term, minimum age 35</text>')
sg=svg(560,300,'<text x="280" y="22" text-anchor="middle" font-weight="bold">State Government at a glance</text>'
 +box(10,40,170,110,'#d6eaf8',['Executive','Governor (nominal)','Chief Minister (real)','Council of Ministers'],12)
 +box(195,40,170,110,'#d5f5e3',['Legislature','Legislative Assembly','Legislative Council','(some states)'],12)
 +box(380,40,170,110,'#fadbd8',['Judiciary','High Court','District Courts','other courts'],12)
 +box(10,165,265,100,'#fcf3cf',['Legislative Assembly','60 to 500 members, 5-year term','Tamil Nadu: 235 (234 + 1 nominated)'],11)
 +box(285,165,265,100,'#ebdef0',['Council of Ministers','at most 15 percent of Assembly','collectively responsible to it'],11)
 +'<text x="280" y="288" text-anchor="middle" font-size="13">Part VI of the Constitution, Articles 152 to 237</text>')
lesson(C,S,CH,'governor-of-a-state',"The Governor of a State","The man who signs but does not rule",
"A state in India has two heads, a Governor who signs the papers and a Chief Minister who leads the government. Understanding who holds which power is the heart of how a state is run.",
["India has 28 states and 8 Union Territories, and Part VI of the Constitution, Articles 152 to 237, gives all states a uniform structure of government. @ Part VI",
 "The State Government has three branches, the Executive, the Legislature and the Judiciary. @ three branches",
 "The Governor is the constitutional head of the state executive, and Article 154 vests the executive power of the state in him. @ Article 154",
 "He is appointed by the President for a usual term of five years, holds office at the pleasure of the President, and generally does not belong to the state. @ appointment",
 "To be Governor one must be an Indian citizen of at least 35 years, not a member of Parliament or any legislature, and not hold any profitable post. @ qualifications",
 "Executive powers: he appoints the Chief Minister, the ministers on the Chief Minister's advice, and members of the State Public Service Commission. @ executive powers",
 "He is chancellor of the state universities and rules the state directly when President's Rule is imposed. @ chancellor",
 "Legislative powers: he summons and prorogues the legislature, dissolves the Assembly, and addresses the first session after each general election. @ legislative powers",
 "A bill becomes law only after his signature, and he may give assent, withhold it, or return the bill for reconsideration. @ assent",
 "When the legislature is not in session he can promulgate ordinances under Article 213, which must be approved within six months. @ ordinances, Article 213",
 "Financial powers: the annual budget is presented in his name, and Money Bills are introduced only with his recommendation. @ financial powers",
 "Judicial powers: he appoints district judges in consultation with the High Court and can pardon or commute, except death sentences. @ judicial powers",
 "Discretionary powers: he may reserve a bill for the President, call the leader of any party when no party has a majority, and dismiss a ministry that cannot prove its majority. @ discretionary powers",
 "Under Article 356 he can recommend President's Rule, and Article 361 protects him from answering to any court for his official acts. @ Article 356, 361"],
("List the legislative powers of the Governor.",[("He summons and prorogues the legislature and dissolves the Assembly.","He addresses the first session after elections."),("He signs bills, and may give assent, withhold or return them.","He can reserve a bill for the President."),("He issues ordinances under Article 213 when the House is not in session.","They must be approved within six months.")]),
("What are the Governor's discretionary powers?",["Reserve bills for the President","Invite a party leader if no majority","Dismiss a ministry that cannot prove majority"],["Saying the Governor is elected by the state legislature"]),
["Governor: appointed by the President, five years, age 35.","Executive, legislative, financial, judicial, discretionary, emergency powers.","Ordinances under Article 213 last six months.","Article 356 President's Rule and Article 361 privileges."],
["n|Minimum age to be a Governor|35|With citizenship and no profit-making post.",
 "n|Months within which an ordinance must be approved|6|By the legislature after it meets.",
 "m|The Governor is appointed by|the President|the Chief Minister~Appoints ministers' advice only;the Prime Minister~No;the Chief Justice~No|His term is five years at the President's pleasure.",
 "m|Ordinances are issued under Article|213|356~President's Rule;361~Privileges;163~Council of Ministers|When the legislature is not in session.",
 "t|The Governor can be removed by the state legislature.|False|The legislature has no role in his removal.",
 "t|A bill passed by the state legislature becomes law only after the Governor signs it.|True|He may also withhold or return it.",
 "m|The Governor recommends President's Rule under Article|356|213~Ordinances;361~Privileges;154~Executive power|The state is then run by the Governor.",
 "m|The Governor acts as the chancellor of|state universities|the High Court~No;the Assembly~No;the Public Service Commission~No|He appoints vice chancellors.",
 "s|Executive power of the state is vested in the Governor by Article ____.|154|Part VI of the Constitution.",
 "s|The Governor cannot pardon a ____ sentence.|death|He can commute other sentences."],
svg=(gv,"Six boxes showing the powers of the Governor","Powers of the Governor"))
lesson(C,S,CH,'chief-minister-council-of-ministers-and-state-legislature',"Chief Minister, Council of Ministers and the State Legislature","The real head of the state",
"In a state, the Governor is the nominal head, but the Chief Minister is the real executive. He leads a Council of Ministers that answers to the Legislative Assembly, the house the people elect.",
["The Governor is the head of the state, and the Chief Minister is the head of the government. @ real executive",
 "The Chief Minister is appointed by the Governor under Article 164(1), usually the leader of the majority party in the Legislative Assembly. @ Article 164",
 "His term is not fixed: he stays as long as he enjoys the support of the majority of the Assembly. @ term not fixed",
 "Article 163 provides a Council of Ministers with the Chief Minister at its head to aid and advise the Governor. @ Article 163",
 "The Council is collectively responsible to the Legislature, and a non-member minister must win a seat within six months. @ collective responsibility",
 "The total number of ministers, including the Chief Minister, cannot exceed fifteen percent of the Assembly's strength. @ 15 percent",
 "The Chief Minister recommends ministers, allocates portfolios, shuffles the ministry, presides over the Council and coordinates ministers. @ Chief Minister's functions",
 "He advises the Governor on summoning and proroguing the legislature, announces policy on the floor, and may recommend dissolution. @ legislative role",
 "The Council formulates state policy, controls financial policy, finalises the Budget, and decides the legislative programme. @ Council functions",
 "The Cabinet, only the cabinet ministers, is the real centre of authority, and works through standing and ad hoc committees. @ Cabinet",
 "Most states have a unicameral legislature, but Bihar, Karnataka, Maharashtra, Uttar Pradesh, Andhra Pradesh and Telangana have a Legislative Council also. @ unicameral, bicameral",
 "The Legislative Assembly is directly elected by adult franchise, has between 60 and 500 members, and has a five-year term, though it can be dissolved earlier. @ Legislative Assembly",
 "The Legislative Council can have at most one-third of the Assembly's members and not fewer than 40. @ Legislative Council",
 "The Tamil Nadu Assembly has 235 members in the textbook, 234 elected and one nominated Anglo-Indian (additional, not in the textbook: this nominated seat was later abolished by amendment). @ Tamil Nadu Assembly"],
("Compare the Governor and the Chief Minister.",[("The Governor is the nominal head of the state, appointed by the President.","He is a constitutional head."),("The Chief Minister is the real executive, with the Council of Ministers.","He holds office while he has the Assembly's majority."),("The Governor acts on the aid and advice of the Council under Article 163.","Except in his discretionary matters.")]),
("Describe the Legislative Assembly and Legislative Council.",["Assembly: elected, 60 to 500 members, five years","Council: at most one-third, at least 40 members","Only some states have a Council"],["Saying every state has a Legislative Council"]),
["CM: real executive, appointed by the Governor.","Ministers: 15 percent limit, collective responsibility.","Assembly: 60 to 500, five years.","Council: one-third of Assembly, minimum 40, only some states."],
["n|Minimum strength of a Legislative Assembly|60|Maximum is 500.",
 "n|Maximum percentage of the Assembly strength for the Council of Ministers|15|Including the Chief Minister.",
 "m|The real head of the state government is the|Chief Minister|Governor~Nominal head;Speaker~Presides over the House;Advocate General~Law officer|He leads the Council of Ministers.",
 "m|Which state has a Legislative Council|Karnataka|Tamil Nadu~Not in the list;Kerala~Not in the list;Punjab~Not in the list|Bihar, Maharashtra and others do too.",
 "t|The Chief Minister has a fixed five year term.|False|He serves while he has majority support.",
 "t|The Council of Ministers is collectively responsible to the Legislative Assembly.|True|Under the parliamentary system.",
 "m|The size of the Legislative Council cannot be less than|40|60~Assembly minimum;15~Wrong;100~Wrong|And not more than one-third of the Assembly.",
 "m|Article 164(1) says the Chief Minister is appointed by the|Governor|President~No;Speaker~No;Chief Justice~No|Usually the majority party leader.",
 "s|The nucleus of the Council of Ministers is the ____.|Cabinet|It works through committees.",
 "s|The strength of the Tamil Nadu Assembly given in the textbook is ____.|235|234 elected and one nominated."],
svg=(sg,"Boxes showing the executive legislature and judiciary of a state government","State Government at a glance"))
print('ok')
