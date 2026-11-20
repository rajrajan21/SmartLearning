from lib import *
C=10;S='social-science';CH='civics-central-government'
def box(x,y,w,h,c,lines,fs=12):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
ls=svg(560,280,'<text x="280" y="22" text-anchor="middle" font-weight="bold">How the Lok Sabha works</text>'
 +box(10,40,170,95,'#d6eaf8',['Election','direct, adult franchise','all citizens 18+ vote'],11)
 +box(195,40,170,95,'#d5f5e3',['Money Bill','only Lok Sabha introduces','Rajya Sabha has 14 days'],11)
 +box(380,40,170,95,'#fcf3cf',['Speaker','presides, decides','Money Bill or not'],11)
 +box(10,150,170,95,'#fadbd8',['No-confidence motion','only in Lok Sabha','ministry must resign if passed'],11)
 +box(195,150,170,95,'#ebdef0',['Sessions','Budget Feb to May','Monsoon Jul-Sep, Winter Nov-Dec'],11)
 +box(380,150,170,95,'#fdebd0',['Tamil Nadu','39 Lok Sabha seats','18 Rajya Sabha seats'],11)
 +'<text x="280" y="268" text-anchor="middle" font-size="13">Speaker remains in office after dissolution until the new Speaker is elected</text>')
sc=svg(560,290,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Jurisdictions of the Supreme Court</text>'
 +box(10,40,170,100,'#d6eaf8',['Original','Centre vs states,','state vs state, writs for','fundamental rights'],11)
 +box(195,40,170,100,'#d5f5e3',['Appellate','final court of appeal','civil, criminal, constitutional'],11)
 +box(380,40,170,100,'#fcf3cf',['Advisory','President refers questions','of law or fact'],11)
 +box(10,155,265,90,'#fadbd8',['Judicial Review','examines whether a law','is unconstitutional'],11)
 +box(285,155,265,90,'#ebdef0',['Miscellaneous','its law binds all courts,','makes its own rules'],11)
 +'<text x="280" y="270" text-anchor="middle" font-size="13">Inaugurated 28 January 1950, successor of the Federal Court of 1935</text>')
lesson(C,S,CH,'lok-sabha-money-bill-and-speaker',"Lok Sabha, Money Bills and the Speaker","The House of the People",
"Every adult citizen aged 18 and above who is registered can vote for the Lok Sabha. It is the one House directly elected by the people, so it has the last word on money.",
["The members of the Lok Sabha are directly elected from constituencies based on population, and the Election Commission conducts the polls. @ direct election",
 "Universal adult franchise applies, so all registered citizens above 18 years vote. @ universal adult franchise",
 "Only the Lok Sabha can introduce a Money Bill, and Rajya Sabha can neither amend nor reject it. @ Money Bill",
 "If the Rajya Sabha fails to pass it within 14 days, the bill is deemed passed, and the Lok Sabha need not consider the Rajya Sabha's amendments. @ 14 days",
 "The Lok Sabha elects the President and Vice-President along with the Rajya Sabha, and has equal power in constitutional amendments and impeachment. @ equal powers",
 "A no-confidence motion can be introduced only in the Lok Sabha, and if it is passed the Prime Minister and the Council of Ministers must resign. @ no-confidence motion",
 "The Speaker is elected by the members and presides over the House, and also over a joint sitting of both Houses. @ Speaker",
 "He decides whether a bill is a Money Bill, and he continues in office even after dissolution until a new Speaker is elected. @ Speaker's powers",
 "When the Speaker is absent the Deputy Speaker presides, except when a resolution to remove the Speaker is being considered. @ Deputy Speaker",
 "Parliament has three sessions, the Budget Session from February to May, the Monsoon Session from July to September, and the Winter Session from November to December. @ sessions",
 "Parliament makes laws, oversees the administration, passes the Budget, airs public grievances, and can change the boundaries of states. @ functions of Parliament",
 "It can also remove judges of the Supreme Court and High Courts, the Chief Election Commissioner and the CAG by the constitutional procedure. @ removal powers",
 "Tamil Nadu sends 39 members to the Lok Sabha and 18 to the Rajya Sabha. @ Tamil Nadu seats"],
("What is a Money Bill and how is it passed?",[("It deals with taxation and government money, and needs the President's approval to be introduced.","Only the Lok Sabha can introduce it."),("The Rajya Sabha cannot amend or reject it but may take 14 days.","It then goes to the President."),("If it does not pass within 14 days, it is treated as passed.","The Lok Sabha may ignore the Rajya Sabha's suggestions.")]),
("State the powers and role of the Speaker.",["Elected by Lok Sabha members","Presides and decides Money Bills","Continues after dissolution until a new Speaker"],["Saying the Vice-President presides over Lok Sabha"]),
["Lok Sabha: direct election, adult franchise at 18.","Money Bill: only Lok Sabha, Rajya Sabha has 14 days.","No-confidence motion only in Lok Sabha.","Speaker decides Money Bill, presides over joint sittings."],
["n|Days the Rajya Sabha gets for a Money Bill|14|Otherwise the bill is deemed passed.",
 "n|Lok Sabha seats of Tamil Nadu|39|Along with 18 in the Rajya Sabha.",
 "m|A no-confidence motion can be moved only in the|Lok Sabha|Rajya Sabha~Cannot dismiss ministry;Supreme Court~Not a legislature;Election Commission~Not a House|If passed, ministers resign.",
 "m|Who presides over a joint sitting of both Houses|The Speaker|The Vice-President~Chairs only Rajya Sabha;The President~Summons only;The Prime Minister~No|He also decides Money Bills.",
 "t|The Rajya Sabha can reject a Money Bill.|False|It can neither amend nor reject it.",
 "t|The Speaker continues in office after the Lok Sabha is dissolved till a new Speaker is elected.|True|So there is no gap.",
 "m|The Winter Session of Parliament is held in|November to December|February to May~Budget Session;July to September~Monsoon Session;January only~Wrong|Parliament has three sessions.",
 "m|The minimum voting age for the Lok Sabha is|18|21~Old age;25~Candidate age;30~Rajya Sabha age|Universal adult franchise.",
 "s|The Lok Sabha is called the House of the ____.|People|The lower house.",
 "s|The motion that can topple the ministry is the no-____ motion.|confidence|Only in Lok Sabha."],
svg=(ls,"Boxes summarising how the Lok Sabha works","How the Lok Sabha works"))
lesson(C,S,CH,'attorney-general-and-supreme-court',"The Attorney General and the Supreme Court","Guardian of the Constitution",
"On 28 January 1950 a new court was inaugurated in New Delhi. It succeeded the Federal Court of 1935 and was named the Guardian of the Constitution.",
["Article 76 provides for the Attorney General, the highest law officer of India, appointed by the President and removable by him. @ Attorney General",
 "He advises the government on legal matters, has the right to appear in all courts, and may speak in Parliament but cannot vote. @ right of audience",
 "The judiciary is the third organ of government and protects the rights and freedoms of citizens. @ judiciary",
 "India has an integrated judiciary, a single judicial hierarchy for the whole country. @ integrated judiciary",
 "In 1950 the Supreme Court had 8 judges, including the Chief Justice. @ 8 judges",
 "The Chief Justice is appointed by the President, and other judges in consultation with the collegium headed by the Chief Justice. @ appointment",
 "A judge must be a citizen who has served as a High Court judge for five years, or as a High Court advocate for ten years, or be a distinguished jurist. @ qualifications",
 "Judges hold office up to the age of 65, and Parliament can remove them by impeachment. @ age 65",
 "Original jurisdiction covers disputes between the Centre and states, between states, and writs for fundamental rights. @ original jurisdiction",
 "Appellate jurisdiction makes it the final court of appeal in civil, criminal and constitutional cases. @ appellate jurisdiction",
 "Advisory jurisdiction lets the President refer questions of law or fact of public importance. @ advisory jurisdiction",
 "Judicial review is the power to examine whether a law is unconstitutional. @ judicial review",
 "The law declared by the Supreme Court binds all courts in India. @ binding law"],
("Explain the original and appellate jurisdiction of the Supreme Court.",[("Original jurisdiction: cases come directly to the Supreme Court.","Disputes between the Centre and states, or between states."),("It also issues writs for fundamental rights.","Citizens can approach it directly."),("Appellate jurisdiction: it hears appeals from High Courts in civil, criminal and constitutional cases.","It is the final court of appeal.")]),
("What is judicial review?",["Power to examine if a law is constitutional","Exercised by the Supreme Court","Laws against the Constitution are struck down"],["Confusing it with advisory jurisdiction"]),
["Attorney General: Article 76, highest law officer.","Supreme Court inaugurated 28 January 1950.","Judges retire at 65; qualifications.","Jurisdictions: original, appellate, advisory, judicial review."],
["n|Retirement age of Supreme Court judges|65|They can resign in writing to the President.",
 "n|Number of Supreme Court judges in 1950, including the Chief Justice|8|The number has increased since.",
 "m|The highest law officer of India is the|Attorney General|Solicitor General~Deputy;Speaker~Presides over Lok Sabha;Chief Election Commissioner~Conducts elections|Article 76.",
 "m|The Supreme Court succeeded the|Federal Court|High Court of Madras~No;Privy Council~Not named;Council of India~No|Established under the 1935 Act.",
 "t|The Supreme Court is the Guardian of the Constitution.|True|It interprets and protects it.",
 "t|The Attorney General has a vote in Parliament.|False|He may speak but cannot vote.",
 "m|A dispute between two states comes under the Supreme Court's|original jurisdiction|appellate jurisdiction~Appeals;advisory jurisdiction~President's reference;judicial review~Law test|It is heard directly.",
 "m|A distinguished jurist can be appointed as judge on the opinion of the|President|Prime Minister~No;Speaker~No;Attorney General~No|One of the qualifications.",
 "s|The power to declare a law unconstitutional is judicial ____.|review|Held by the Supreme Court.",
 "s|The Supreme Court was inaugurated on 28 ____ 1950.|January|In New Delhi."],
svg=(sc,"Boxes showing the jurisdictions of the Supreme Court","Jurisdictions of the Supreme Court"))
print('ok')
