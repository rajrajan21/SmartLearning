from lib import *
C=10;S='social-science';CH='civics-india-s-foreign-policy'
def box(x,y,w,h,c,lines,fs=12):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
fp=svg(560,290,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Foundations of India foreign policy</text>'
 +box(10,40,170,100,'#d6eaf8',['Article 51','promote peace and security,','just relations,','settle by arbitration'],11)
 +box(195,40,170,100,'#d5f5e3',['Panchsheel 1954','Nehru and Chou En-lai,','28 April 1954,','Bandung 1955'],11)
 +box(380,40,170,100,'#fcf3cf',['Non-alignment','not joining military blocs,','NAM: Nehru, Tito, Nasser,','Sukarno, Nkrumah'],11)
 +box(10,155,540,90,'#fadbd8',['Objectives','national security, prosperity, friendly nations, world peace, economic development'],12)
 +'<text x="280" y="270" text-anchor="middle" font-size="13">Non-alignment is not neutrality: freedom to decide each issue independently</text>')
tl=svg(560,300,'<text x="280" y="22" text-anchor="middle" font-weight="bold">India foreign policy through time</text>'
 +''.join(f'<rect x="15" y="{36+i*38}" width="530" height="33" rx="6" fill="{c}" stroke="#333"/><text x="23" y="{57+i*38}" font-size="12" font-weight="bold">{a}</text><text x="130" y="{57+i*38}" font-size="12">{b}</text>' for i,(c,a,b) in enumerate([('#d6eaf8','1950s-60s','Idealistic phase: non-alignment and Panchsheel'),('#d5f5e3','1971','Indo-Soviet treaty of peace, friendship and cooperation'),('#fcf3cf','1974','First nuclear test at Pokhran'),('#fadbd8','1985','SAARC formed'),('#ebdef0','1992','Look East Policy'),('#fdebd0','1998','Second Pokhran tests')])))
lesson(C,S,CH,'objectives-panchsheel-and-non-alignment',"Objectives of foreign policy, Panchsheel and Non-alignment","Neither Washington nor Moscow",
"When India became free, the world was splitting into two armed camps led by the USA and the USSR. Nehru decided that the new nation would join neither and would speak with its own voice.",
["Foreign policy is a country's policy to protect and promote its national interests in dealings with other countries, bilaterally and multilaterally. @ foreign policy",
 "Article 51 of the Constitution sets directive principles: promote international peace and security, just relations, respect for international law, and settlement of disputes by arbitration. @ Article 51",
 "The main tools are treaties, ambassadors, foreign aid, trade and armed forces, and the Ministry of External Affairs conducts relations. @ tools",
 "The chief objectives are national security, national prosperity, more friendly nations, world peace and economic development. @ objectives",
 "The determinants include geography, history and traditions, natural resources, economic needs, political stability, military strength and the international milieu. @ determinants",
 "The 1950s and 1960s were the most idealistic phase under Prime Minister Jawaharlal Nehru. @ idealistic phase",
 "Newly independent nations faced economic difficulty and pressure to align with the USA or the USSR. @ superpowers",
 "Nehru chose non-alignment, not tying oneself to military blocs but judging issues independently and keeping friendly relations with all. @ non-alignment",
 "The term non-alignment was coined by V.K. Krishna Menon in his 1953 speech at the United Nations. @ Krishna Menon",
 "Panchsheel, the five principles of peaceful coexistence, was signed by Nehru and Chou En-lai of China on 28 April 1954 (the five principles are listed in a picture in the textbook). @ Panchsheel 1954",
 "These principles were incorporated in the Bandung Declaration of the Afro-Asian Conference in 1955 in Indonesia. @ Bandung 1955",
 "The Non-Aligned Movement was founded by Nehru, Tito of Yugoslavia, Nasser of Egypt, Sukarno of Indonesia and Nkrumah of Ghana. @ founders of NAM",
 "NAM now has 120 member countries, 17 observer states and 10 international organisations, and has become more economic than political. @ NAM members",
 "Non-alignment did not mean neutrality or demilitarisation, but independence of decision, and the policy remains in force. @ not neutrality"],
("What is non-alignment and why did India choose it?",[("It means not joining any military bloc, and judging issues independently.","The Cold War had split the world into US and Soviet camps."),("Nehru wanted to protect India's independence and focus on development.","Newly free nations could not afford military entanglements."),("It did not mean neutrality or isolation.","India still made friends and defended itself.")]),
("List the objectives and determinants of foreign policy.",["National security and prosperity","Friendly nations, world peace, economic development","Geography, history, resources, military strength, international milieu"],["Saying non-alignment meant staying neutral in all disputes"]),
["Foreign policy protects national interests; Article 51 sets principles.","Panchsheel signed on 28 April 1954.","Non-alignment: no military blocs, independent decisions.","NAM founders: Nehru, Tito, Nasser, Sukarno, Nkrumah."],
["n|Year Panchsheel was signed|1954|By Nehru and Chou En-lai.",
 "n|Number of NAM member countries given in the textbook|120|Plus 17 observer states.",
 "m|The term non-alignment was coined by|V.K. Krishna Menon|Jawaharlal Nehru~Practised it;Tito~NAM founder;Nasser~NAM founder|In 1953 at the United Nations.",
 "m|The Bandung Conference of 1955 was held in|Indonesia|Egypt~No;Yugoslavia~No;Ghana~No|The Afro-Asian Conference.",
 "t|Non-alignment means neutrality in every dispute.|False|It means independence of judgement.",
 "t|Article 51 lays down the directive principles of foreign policy.|True|It promotes peace and security.",
 "m|Which leader was NOT a founder of NAM|Winston Churchill|Tito~Founder;Sukarno~Founder;Nkrumah~Founder|The founders were Nehru, Tito, Nasser, Sukarno and Nkrumah.",
 "m|The idealistic phase of India's foreign policy was|the 1950s and 1960s|the 1990s~Liberalisation;the 1970s~Nuclear period;the 2000s~Resurgence|Under Nehru.",
 "s|Panchsheel comes from Sanskrit words meaning five ____.|virtues|Panch means five and sheel means virtue.",
 "s|India's foreign ministry is the Ministry of ____ Affairs.|External|It conducts foreign relations."],
svg=(fp,"Boxes showing Article 51 Panchsheel non-alignment and the objectives of foreign policy","Foundations of foreign policy"))
lesson(C,S,CH,'cold-war-nuclear-policy-saarc-and-new-directions',"Cold War, nuclear policy, SAARC and new directions","From Pokhran to Act East",
"India stayed non-aligned yet signed a treaty with the Soviet Union, tested nuclear devices twice, and today speaks of Neighbourhood First and Act East. How did a policy of principle adapt to a changing world?",
["Non-alignment did not stop India signing the Indo-Soviet treaty of 1971, a 20-year pact of peace, friendship and cooperation. @ Indo-Soviet treaty 1971",
 "India then modernised its military, and in 1974 conducted its first nuclear test at Pokhran in response to China's 1964 test at Lop Nur. @ Pokhran 1974",
 "In the 1990s the Soviet Union fell and a new economic order of liberalisation, privatisation and globalisation emerged. @ 1990s",
 "India's policy shifted, with the Look East Policy of 1992 improving relations with Southeast Asia, and the second Pokhran test in 1998. @ Look East 1992",
 "India's nuclear doctrine has two themes, no first use and credible minimum deterrence, and India will not use nuclear weapons against a non-nuclear state. @ nuclear doctrine",
 "India supports disarmament and global non-proliferation, and the Indo-US civilian nuclear deal marked significant progress. @ disarmament",
 "SAARC was formed in 1985 as an organisation of eight South Asian countries for welfare, collective self-reliance and cultural development. @ SAARC",
 "The members are Afghanistan, Bangladesh, Bhutan, India, Nepal, Maldives, Pakistan and Sri Lanka, and the SAARC Disaster Management Centre is in New Delhi. @ SAARC members",
 "Neighbourhood First gives priority to immediate neighbours, since a peaceful periphery is needed for development. @ Neighbourhood First",
 "The Look East Policy has moved to Act East, stressing connectivity with ASEAN and East Asia, with Myanmar as the land bridge. @ Act East",
 "Economic development is now a primary driver of India's foreign policy, to attract markets, investment and technology. @ economic imperatives",
 "India is a member of G20, BRICS, IBSA and the East Asia Summit, and aspires to a permanent seat on the UN Security Council. @ leading power"],
("Trace the main changes in India's foreign policy after 1950.",[("The 1950s and 1960s were idealistic, with non-alignment and Panchsheel.","Nehru led this phase."),("The 1971 treaty, the 1974 and 1998 nuclear tests marked a more security-minded phase.","Military modernisation followed."),("After 1990 India opened its economy, joined global groups and shifted to Look East, Act East and Neighbourhood First.","Economic development became central.")]),
("What are the two themes of India's nuclear doctrine?",["No first use","Credible minimum deterrence","Not against non-nuclear states"],["Confusing the 1974 and 1998 tests"]),
["1971 Indo-Soviet treaty; 1974 and 1998 Pokhran tests.","Nuclear doctrine: no first use, credible minimum deterrence.","SAARC 1985, eight members, Disaster Management Centre in Delhi.","Look East 1992 to Act East; Neighbourhood First."],
["n|Year SAARC was formed|1985|Eight South Asian countries.",
 "n|Year of the second nuclear test at Pokhran|1998|The first was in 1974.",
 "m|The Look East Policy was launched in|1992|1974~First nuclear test;1971~Indo-Soviet treaty;1985~SAARC|It improved ties with Southeast Asia.",
 "m|Which of these is a SAARC member|Bhutan|China~Not a member;Myanmar~Not a member;Thailand~Not a member|The eight are listed in the lesson.",
 "t|India has a policy of no first use of nuclear weapons.|True|Along with credible minimum deterrence.",
 "t|The Indo-Soviet treaty of 1971 ended India's non-alignment completely.|False|Non-alignment remained in force.",
 "m|India's first nuclear test took place at|Pokhran|Lop Nur~China's site;Kanpur~No;Sriharikota~Launch site|In 1974, in Rajasthan.",
 "m|Myanmar is called India's land bridge to|ASEAN|SAARC~No;BRICS~No;OPEC~No|It links northeast India to Southeast Asia.",
 "s|The policy that has replaced Look East is ____ East.|Act|It stresses connectivity.",
 "s|The second pillar of India's nuclear doctrine is credible ____ deterrence.|minimum|The first is no first use."],
svg=(tl,"A timeline table of India's foreign policy from the 1950s to 1998","India's foreign policy through time"))
print('ok')
