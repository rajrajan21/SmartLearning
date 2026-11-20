from lib import *
C=10;S='social-science';CH='geography-climate-and-natural-vegetation-of-india'
def box(x,y,w,h,c,lines,fs=12):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
fac=svg(560,250,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Six factors controlling the climate of India</text>'
 +box(10,45,175,70,'#fadbd8',['Latitude','8 N to 37 N','Tropic of Cancer'])+box(192,45,175,70,'#fdebd0',['Altitude','6.5 C fall per 1000 m','normal lapse rate'],11)+box(375,45,175,70,'#fcf3cf',['Distance from sea','maritime: equable','interior: extremes'],11)
 +box(10,130,175,70,'#d5f5e3',['Monsoon winds','seasonal reversal','dominant factor'])+box(192,130,175,70,'#d6eaf8',['Relief','Himalayas block cold','Western Ghats rain shadow'],11)+box(375,130,175,70,'#ebdef0',['Jet streams','fast upper winds','onset of monsoon'],11)
 +'<text x="280" y="228" text-anchor="middle" font-size="13">Ooty (2240 m) is much cooler than Chennai (6.7 m) on the same day</text>')
mon=svg(560,260,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Seasons of India</text>'
 +box(10,45,130,100,'#d6eaf8',['Winter','Jan - Feb','clear skies, cold','western disturbances'],12)+box(148,45,130,100,'#fdebd0',['Summer','Mar - May','hot and dry','mango showers, Norwesters'],11)
 +box(286,45,130,100,'#d5f5e3',['SW Monsoon','Jun - Sep','about 75 percent','of rainfall'],12)+box(424,45,126,100,'#fcf3cf',['NE Monsoon','Oct - Dec','retreating wind','rain for Tamil Nadu'],11)
 +'<text x="280" y="178" text-anchor="middle" font-size="13">Monsoon comes from the Arabic word mausim = season</text><text x="280" y="200" text-anchor="middle" font-size="13">SW monsoon splits into Arabian Sea and Bay of Bengal branches</text><text x="280" y="222" text-anchor="middle" font-size="13">Mawsynram (Meghalaya) gets the highest rainfall in the world</text>')
wl=svg(560,250,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Protecting wildlife in India</text>'
 +box(10,45,175,100,'#d5f5e3',['Protected areas','106 National Parks','573 Sanctuaries','18 Biosphere Reserves'],12)
 +box(192,45,175,100,'#fdebd0',['Laws and boards','IBWL 1952','Wildlife Act 1972'],12)
 +box(375,45,175,100,'#d6eaf8',['Projects','Project Tiger 1973','Tiger Reserves'],12)
 +'<text x="280" y="180" text-anchor="middle" font-size="13">Tamil Nadu: Nilgiris, Gulf of Mannar, Agasthiyamalai biosphere reserves</text><text x="280" y="205" text-anchor="middle" font-size="13">Threats: hunting, poaching, loss of habitat</text>')
veg=svg(560,280,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Natural vegetation and rainfall</text>'
 +''.join(f'<rect x="20" y="{38+i*34}" width="520" height="30" rx="6" fill="{c}" stroke="#333"/><text x="30" y="{58+i*34}" font-size="12" font-weight="bold">{a}</text><text x="190" y="{58+i*34}" font-size="12">{b}</text><text x="380" y="{58+i*34}" font-size="12">{d}</text>' for i,(c,a,b,d) in enumerate([('#d5f5e3','Tropical evergreen','above 200 cm','rubber, mahogany, ebony'),('#fcf3cf','Tropical deciduous','100 - 200 cm','teak, sal, sandalwood'),('#fdebd0','Tropical dry','50 - 100 cm','babool, khair, banyan'),('#fadbd8','Desert, thorn','below 50 cm','babul, kikar, wild palm'),('#d6eaf8','Mountain / alpine','altitude based','oak, fir, pine, juniper'),('#ebdef0','Mangrove (tidal)','deltas, estuaries','Sundarbans, Godavari delta')])))

lesson(C,S,CH,'factors-monsoon-and-seasons',"Climate of India: factors, monsoon and seasons","Ooty or Chennai?",
"When Chennai bakes at 35 degrees, Ooty is comfortably cool. Why do places so close in India have such different weather? The answer lies in the factors that shape climate.",
["Weather is the state of the atmosphere of a place at a given time; climate is the accumulation of daily and seasonal weather events over 30 to 35 years. @ weather and climate",
 "India's climate is controlled by latitude, altitude, distance from the sea, monsoon winds, relief and jet streams. @ six factors",
 "India lies between 8 degrees 4 minutes N and 37 degrees 6 minutes N, and the Tropic of Cancer divides it into two halves; the south has an equable climate. @ latitude",
 "Temperature falls 6.5 degrees Celsius for every 1000 metres of ascent, the normal lapse rate, so hill stations are cool. @ altitude",
 "Coastal places like Kochi have equable climate while interior places like Delhi have extremes; Kolkata gets 119 cm of rain but Bikaner only 24 cm. @ distance from the sea",
 "The word monsoon comes from the Arabic mausim, meaning season; monsoon winds reverse their direction with the seasons. @ monsoon",
 "India has four seasons: winter (January-February), summer (March-May), southwest monsoon (June-September) and northeast monsoon (October-December). @ four seasons",
 "Summer brings Mango Showers on the west coast and Norwesters or Kalbaisakhis in the east and northeast. @ summer storms",
 "The southwest monsoon arrives at the southern tip in the first week of June, covers the whole country by 15 July and gives about 75 percent of the rainfall. @ southwest monsoon",
 "Its Arabian Sea branch drenches the windward Western Ghats, while its Bay of Bengal branch gives Mawsynram, the wettest place in the world. @ two branches",
 "The retreating monsoon returns over the Bay of Bengal and, deflected by the Coriolis force, blows from the northeast, giving Tamil Nadu 35 percent of its annual rain. @ northeast monsoon"],
("Why does Mangalore get 280 cm of rain in the southwest monsoon while Bengaluru gets only 50 cm?",[("Mangalore lies on the windward side of the Western Ghats.","Moist winds are forced to rise."),("Rising air cools and drops its moisture as heavy rain.","Relief rainfall."),("Bengaluru is in the rain shadow on the leeward side.","Descending winds are dry."),("So relief explains the difference in rainfall.","Same monsoon, different position.")]),
("Explain how altitude and distance from the sea together make Ooty and Chennai different.",["Ooty is at 2240 m so it is cooler by the lapse rate (about 14 degrees less)","Chennai is on the coast at 6.7 m, so it is warm and humid","Altitude controls temperature, the sea adds humidity"],["Thinking only latitude decides temperature"]),
["Six factors: latitude, altitude, distance from sea, monsoon, relief, jet streams.","Four seasons, SW monsoon gives 75 percent of rain.","Lapse rate: 6.5 C per 1000 m.","NE monsoon brings rain to Tamil Nadu."],
["m|The most dominant factor affecting India's climate is|monsoon winds|latitude~Important but not dominant;altitude~Local effect;jet stream~Helps onset|Seasonal reversal winds.",
 "n|Normal lapse rate in degrees Celsius per 1000 m|6.5|Temperature falls with height.",
 "t|Climate is the average weather over 30 to 35 years.|True|Weather is for a given time.",
 "m|The word monsoon comes from the Arabic word|mausim|mausam~A different spelling;monsun~Not Arabic;masoon~Not a word|It means season.",
 "m|Mango showers help in|ripening of mangoes|growing wheat~Winter rain;ripening paddy~Not related;cooling the sea~Not related|Pre-monsoon showers on the west coast.",
 "t|Tamil Nadu gets about 35 percent of its rain from the northeast monsoon.|True|Retreating monsoon over Bay of Bengal.",
 "m|Place that gets the highest rainfall in the world|Mawsynram|Cherrapunji~Second;Mangalore~West coast;Chennai~Little rain|In Meghalaya.",
 "n|Date by which southwest monsoon covers the country (July date)|15|By 15 July.",
 "s|The sudden arrival of monsoon over South India is called the ____ of monsoon.|burst|With thunder and lightning.",
 "m|Rain-bearing winter system of north India|western disturbances|Norwesters~Summer storms;mango showers~Summer rain;easterly jet~Cyclones|Helpful for winter wheat."],
svg=(fac,"Six boxes for the factors latitude altitude sea monsoon relief and jet streams","Factors of climate"))

lesson(C,S,CH,'rainfall-distribution-and-natural-vegetation',"Rainfall distribution and natural vegetation","Why does the forest change?",
"A traveller from the Western Ghats to Rajasthan sees dense evergreen forest give way to thorn bushes. The reason is rainfall.",
["The average annual rainfall of India is 100 to 118 cm, but it is highly uneven. @ average rainfall",
 "Heavy rainfall (above 200 cm): western coast, Assam, south Meghalaya, Tripura, Nagaland, Arunachal; low rainfall (below 100 cm): Rajasthan, Punjab, Haryana, west UP and the Deccan interior. @ distribution",
 "Natural vegetation is the plant community unaffected by humans; climate, soil and landforms control it. @ natural vegetation",
 "Tropical evergreen forests grow where rain exceeds 200 cm, in the Western Ghats, Andaman-Nicobar and the northeast, with rubber, mahogany, ebony and bamboo. @ evergreen forests",
 "Tropical deciduous forests, called monsoon forests, grow in 100-200 cm rainfall and shed leaves in spring; teak and sal are their key trees. @ deciduous forests",
 "Tropical dry forests grow in 50 to 100 cm rainfall and are transitional, with banyan, babool and khair. @ dry forests",
 "Desert and semi-desert (tropical thorn) vegetation grows where rain is below 50 cm; babul, kikar and wild palms are common. @ thorn forests",
 "Mountain forests change with altitude: oak and chestnut at 1200-2400 m, chir at 900-1800 m, and pine, fir, spruce and juniper above 2400 m. @ mountain forests",
 "Mangroves or tidal forests grow in deltas and estuaries; Sundarbans of the Ganga-Brahmaputra delta is the largest. @ mangroves"],
("Match rainfall with the forest: 250 cm, 150 cm, 75 cm and 30 cm.",[("250 cm: tropical evergreen forest.","Above 200 cm."),("150 cm: tropical deciduous (monsoon) forest.","100 to 200 cm."),("75 cm: tropical dry forest.","50 to 100 cm."),("30 cm: desert or thorn vegetation.","Below 50 cm.")]),
("Why are deciduous forests called monsoon forests and why do they shed leaves?",["They depend on the monsoon rainfall","They drop leaves in spring and early summer to save water","Teak and sal are examples"],["Confusing them with evergreen forests"]),
["Rainfall decides the vegetation type.","Evergreen above 200 cm, deciduous 100-200, dry 50-100, thorn below 50.","Mountain forests vary with altitude.","Sundarbans is the largest mangrove."],
["m|Teak and sal are found in|tropical deciduous forests|tropical evergreen forests~Above 200 cm;mangrove forests~Tidal;alpine forests~High altitude|Monsoon forests.",
 "t|Tropical evergreen forests need more than 200 cm of rainfall.|True|Dense forests.",
 "m|Mangroves are also called|tidal forests|thorn forests~Desert;monsoon forests~Deciduous;alpine forests~Mountain|Swamp or delta forests.",
 "s|The largest tidal forest in India is the ____.|Sundarbans|In the Ganga-Brahmaputra delta.",
 "m|Babul and kikar are common in|desert and thorn forests|evergreen forests~Wet climate;mangroves~Tidal;alpine forests~High altitude|Dry regions.",
 "n|Average annual rainfall lower limit of India in cm|100|100 to 118 cm.",
 "t|Rajasthan receives low rainfall of less than 100 cm.|True|Aravallis are parallel to the wind.",
 "m|Forests above 2400 m altitude are|coniferous alpine forests|mangrove forests~Coastal;thorn forests~Dry;evergreen forests~Warm wet|Pine, fir and juniper.",
 "t|Rubber and mahogany grow in tropical evergreen forests.|True|Wet climate trees.",
 "s|Deciduous forests shed their leaves in ____ and early summer.|spring|To reduce water loss."],
svg=(veg,"A table of forest types with the rainfall they need and their main trees","Forest types and rainfall"))

lesson(C,S,CH,'wildlife-and-biosphere-reserves',"Wildlife and biosphere reserves of India","The tiger and the Sundarbans",
"India shelters about 81,251 species of animals, from the Asian elephant to the Bengal tiger. Many are in danger, so the nation protects them.",
["Wildlife includes all non-domesticated animals, both vertebrates and invertebrates. @ wildlife",
 "India has about 81,251 animal species, out of about 1.5 million in the world. @ species",
 "Hunting, poaching and loss of habitat have driven some species to extinction. @ threats",
 "The Indian Board for Wildlife was set up in 1952 and the Wildlife (Protection) Act was passed in 1972. @ laws",
 "India has 106 National Parks and about 573 Wildlife Sanctuaries. @ protected areas",
 "Project Tiger was launched in April 1973 to conserve tigers in Tiger Reserves. @ Project Tiger",
 "Biosphere reserves protect large areas of natural habitat with buffer zones open to some economic use; India has 18 of them. @ biosphere reserves",
 "Eleven of them, including the Nilgiris, Gulf of Mannar, Agasthiyamalai, Nanda Devi, Sundarbans and Great Nicobar, are in UNESCO's Man and Biosphere programme. @ UNESCO list"],
("How do biosphere reserves differ from national parks?",[("A national park is strictly reserved for wildlife.","Human use is very limited."),("A biosphere reserve has a core, plus a buffer zone open to some economic uses.","People are part of the system."),("So biosphere reserves balance protection with livelihood.","Example: the Nilgiris.")]),
("Name three biosphere reserves in Tamil Nadu and one law protecting wildlife.",["Nilgiris, Gulf of Mannar, Agasthiyamalai","Wildlife (Protection) Act of 1972","Project Tiger and IBWL also help"],["Mixing up the year of Project Tiger"]),
["106 National Parks, 573 sanctuaries.","Project Tiger 1973; Wildlife Act 1972.","18 biosphere reserves; 11 in UNESCO network.","Tamil Nadu: Nilgiris, Gulf of Mannar, Agasthiyamalai."],
["n|Year Wildlife Protection Act was passed|1972|To stop poaching and illegal trade.",
 "n|Year Project Tiger was launched|1973|In April.",
 "t|India has 18 biosphere reserves.|True|Eleven are in the UNESCO list.",
 "m|Biosphere reserve in Tamil Nadu|Gulf of Mannar|Sundarbans~West Bengal;Nokrek~Meghalaya;Pachmarhi~Madhya Pradesh|Marine biosphere reserve.",
 "n|Number of national parks in India (given in the lesson)|106|Along with 573 sanctuaries.",
 "t|Poaching and deforestation are threats to wildlife.|True|Habitat loss and hunting.",
 "m|The Indian Board for Wildlife was constituted in|1952|1972~Act year;1973~Project Tiger;1986~Not correct|To advise government.",
 "m|Biosphere reserves have|buffer zones open to some use|no human presence~That is a strict park;only fishing~Wrong;only farms~Wrong|People are integral.",
 "s|Tigers are conserved in specially created Tiger ____.|Reserves|Under Project Tiger.",
 "t|Nilgiris Biosphere Reserve is in the UNESCO Man and Biosphere list.|True|One of eleven."],
svg=(wl,"Three boxes showing protected areas laws and projects for wildlife in India","Wildlife conservation"))
print('ok')
