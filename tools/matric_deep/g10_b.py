from lib import *
C=10;S='social-science';CH='geography-india-agriculture'
def box(x,y,w,h,c,lines,fs=12):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
def rows(title,data,h=280):
    t=f'<text x="280" y="22" text-anchor="middle" font-weight="bold">{title}</text>'
    for i,(c,a,b,d) in enumerate(data):
        t+=f'<rect x="20" y="{38+i*33}" width="520" height="29" rx="6" fill="{c}" stroke="#333"/><text x="28" y="{57+i*33}" font-size="12" font-weight="bold">{a}</text><text x="160" y="{57+i*33}" font-size="12">{b}</text><text x="330" y="{57+i*33}" font-size="12">{d}</text>'
    return svg(560,h,t)
soil=rows('Eight major soils of India (ICAR, 1953)',[('#fdebd0','Alluvial','Ganga-Brahmaputra plains','rice, wheat, sugarcane'),('#d5dbdb','Black (regur)','Deccan trap, basalt','cotton, millets, tobacco'),('#fadbd8','Red','Deccan east, TN, Karnataka','wheat, cotton, pulses'),('#f5cba7','Laterite','Assam hills, Kerala','coffee, rubber, cashew'),('#d5f5e3','Forest and mountain','Himalayas, Ghats','tea, coffee, spices'),('#fcf3cf','Arid and desert','Rajasthan, Gujarat','millets, barley'),('#ebdef0','Saline, Peaty','Punjab, Kerala, Sundarbans','paddy, jute')],h=290)
irr=svg(560,260,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Sources of irrigation in India</text>'
 +box(10,45,130,90,'#d6eaf8',['Tube wells','46 percent','Gujarat, Punjab, TN'],12)+box(148,45,130,90,'#d5f5e3',['Canals','24 percent','northern plains'],12)+box(286,45,130,90,'#fcf3cf',['Other wells','16 percent','Ganga plains'],12)+box(424,45,126,90,'#fdebd0',['Tanks','3 percent','peninsular India'],12)
 +'<text x="280" y="170" text-anchor="middle" font-size="13">Modern: drip (saves up to 70 percent water), sprinkler, rain gun, central pivot</text><text x="280" y="195" text-anchor="middle" font-size="13">Multipurpose projects: irrigation, hydropower, flood control, drinking water</text><text x="280" y="220" text-anchor="middle" font-size="13">PMKSY: more crop per drop</text>')
farm=svg(560,270,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Types of farming in India</text>'
 +box(10,42,175,80,'#fadbd8',['Subsistence','family labour, low yield'],12)+box(192,42,175,80,'#fdebd0',['Shifting','slash and burn: Jhum, Podu'],12)+box(375,42,175,80,'#fcf3cf',['Intensive','heavy fertilizer, high yield'],12)
 +box(10,135,175,80,'#d5f5e3',['Dry farming','arid areas, one crop'],12)+box(192,135,175,80,'#d6eaf8',['Mixed farming','crops plus livestock'],12)+box(375,135,175,80,'#ebdef0',['Terrace farming','hill slopes, less erosion'],12)
 +'<text x="280" y="245" text-anchor="middle" font-size="13">Seasons: Kharif Jun-Sep, Rabi Oct-Mar, Zaid Apr-Jun</text>')
crop=rows('Major crops of India',[('#d5f5e3','Food crops','rice, wheat, jowar, bajra','pulses, maize, barley'),('#fcf3cf','Cash crops','sugarcane, cotton, jute','tobacco, oilseeds'),('#fdebd0','Plantation','tea, coffee, rubber','spices (Kerala)'),('#d6eaf8','Horticulture','fruits, vegetables','flowers: 2nd in world'),('#fadbd8','Leading states','Assam: tea; W Bengal: jute','Karnataka: coffee; Gujarat: oilseeds'),('#ebdef0','Livestock, fisheries','cattle 37.3 percent of stock','fisheries: 2nd after China')],h=250)

lesson(C,S,CH,'soils-of-india-and-conservation',"Soils of India and soil conservation","The farmer's first resource",
"A farmer in the Ganga plains grows rice and wheat, while a Deccan farmer grows cotton. The difference begins beneath their feet, in the soil.",
["Soil is the uppermost layer of the land, made of minerals, organic matter, living organisms, air and water, formed by weathering of rocks. @ soil",
 "The ICAR (set up in 1953) classifies Indian soils into eight groups: alluvial, black, red, laterite, forest and mountain, arid and desert, saline and alkaline, peaty and marshy. @ eight soils",
 "Alluvial soil is deposited by rivers, rich in potash, phosphoric acid and lime but poor in nitrogen; it suits rice, wheat, sugarcane and oilseeds. @ alluvial soil",
 "Black soil, from Deccan basalt, is rich in lime, iron and potash, holds moisture well and is sticky when wet, ideal for cotton. @ black soil",
 "Red soil forms from granite and gneiss and is rich in iron but deficient in nitrogen, humus and lime; it grows wheat, cotton and pulses. @ red soil",
 "Laterite soil forms by leaching in alternate wet and dry conditions; it is acidic and suits coffee, rubber, cashew and tapioca. @ laterite",
 "Forest soils are rich in humus; desert soils are sandy and saline; saline soils suffer from excess salts; peaty soils occur in humid regions with heavy rain. @ other soils",
 "Soil erosion, degradation, water-logging and salinisation are major problems; IIRS (2015) estimated 147 million hectares affected by erosion. @ soil degradation",
 "Conservation methods: afforestation, dams and barrages, preventing overgrazing, contour bunding, crop rotation, strip cropping, shelter belts and sustainable agriculture. @ conservation"],
("A farmer in Maharashtra grows cotton and a farmer in Assam hills grows coffee. Which soils do they likely have and why?",[("Maharashtra lies on the Deccan lava plateau with black soil.","Formed from basalt."),("Black soil retains moisture and is rich in lime, ideal for cotton.","Called regur soil."),("Assam hills have laterite soil formed by leaching under wet and dry conditions.","Acidic."),("Laterite suits coffee, rubber, cashew and tapioca.","Match soil to crop.")]),
("Suggest three measures to stop erosion on a hill farm.",["Contour bunding and strip cropping","Planting shelter belts and afforestation","Terraces and crop rotation"],["Burning stubble"]),
["Eight soil groups (ICAR 1953).","Alluvial: plains; black: cotton; red; laterite: coffee and rubber.","Erosion, salinity, water-logging are problems.","Conserve by contour bunding, rotation, afforestation."],
["m|Soil best for cotton|black soil|alluvial soil~Rice and wheat;laterite soil~Coffee;desert soil~Millets|Retains moisture.",
 "n|Number of major soil groups of ICAR|8|Alluvial, black, red, laterite and four more.",
 "t|Alluvial soil is poor in nitrogen.|True|But rich in potash and lime.",
 "m|Soil formed by leaching is|laterite|alluvial~Deposited by rivers;black~Basalt;peaty~Humid regions|Acidic and suits coffee.",
 "t|Black soil is also called regur soil.|True|Derived from Deccan basalt.",
 "m|Which is a soil conservation method?|contour bunding|overgrazing~Harmful;deforestation~Harmful;burning forests~Harmful|Reduces runoff.",
 "n|Year ICAR was set up|1953|Indian Council of Agricultural Research.",
 "m|Red soil is rich in|iron|nitrogen~Deficient;humus~Deficient;lime~Deficient|From granite and gneiss.",
 "s|Soil with high salts is called ____ soil.|saline|Also alkaline.",
 "t|Terracing reduces soil erosion on hill slopes.|True|Provides level patches."],
svg=(soil,"Table of the major soils of India with their distribution and crops","Soils of India"))

lesson(C,S,CH,'irrigation-and-multipurpose-projects',"Irrigation and multipurpose river valley projects","Water for the dry months",
"Rain in India is seasonal and irregular, so farmers need artificial watering. Wells, tanks and canals have fed fields for centuries.",
["Irrigation is watering plants by artificial means, needed because rain is seasonal and irregular. @ irrigation",
 "Sources: wells (tube wells about 46 percent, other wells 16 percent), canals (24 percent), tanks (3 percent) and others (11 percent). @ share of sources",
 "Canal irrigation suits low relief, fertile soil and perennial rivers; about 60 percent of canal area lies in the northern plains. @ canals",
 "Tube wells are common in Gujarat, Maharashtra, Punjab, Madhya Pradesh and Tamil Nadu. @ wells",
 "Tank irrigation is popular in peninsular India because of undulating relief, hard rocks, few perennial rivers and natural depressions. @ tanks",
 "Modern methods: drip irrigation (saves up to 70 percent water), sprinkler, rain gun and central pivot. @ modern methods",
 "Multipurpose river valley projects serve irrigation, hydropower, flood control, drinking water, fisheries and navigation. @ multipurpose projects",
 "Examples: Bhakra-Nangal on the Sutlej, Hirakud on the Mahanadi, Damodar Valley, Tungabhadra, Nagarjuna Sagar, Sardar Sarovar on the Narmada and Mettur on the Cauvery. @ examples",
 "Pradhan Mantri Krishi Sinchayee Yojana aims at more production using water saving technologies. @ PMKSY"],
("Why is tank irrigation popular in peninsular India while canal irrigation is popular in the northern plains?",[("The peninsula has hard rock and undulating relief, so canals and wells are difficult to dig.","Rocks are impermeable."),("It lacks perennial rivers but has natural depressions to hold water.","Tanks store monsoon rain."),("The northern plains have flat land, deep soil and perennial rivers.","Ideal for canals.")]),
("Name a multipurpose project with its river and state.",["Mettur Dam on the Cauvery in Tamil Nadu","Bhakra-Nangal on the Sutlej in Punjab","Hirakud on the Mahanadi in Odisha"],["Mixing rivers and states"]),
["Wells, canals, tanks are the main sources.","Tube wells are 46 percent of irrigation.","Drip saves up to 70 percent water.","Multipurpose projects serve many needs."],
["m|Largest source of irrigation in India|tube wells|tanks~Only 3 percent;canals~Second;rain~Not irrigation|46 percent.",
 "n|Water saved by drip irrigation (percent, up to)|70|In the form of drops.",
 "t|Tank irrigation is popular in peninsular India.|True|Due to undulating relief.",
 "m|Mettur Dam is on the river|Cauvery|Krishna~Different;Godavari~Different;Narmada~Different|In Tamil Nadu.",
 "m|Bhakra-Nangal Project is on the|Sutlej|Mahanadi~Hirakud;Kosi~Bihar;Chambal~MP and Rajasthan|Highest gravity dam.",
 "t|Multipurpose projects provide hydropower and flood control.|True|Along with irrigation.",
 "n|Percent of area irrigated by canals|24|Second most important source.",
 "m|Hirakud is the longest dam and is on|Mahanadi|Sutlej~Bhakra;Cauvery~Mettur;Tungabhadra~Different|In Odisha.",
 "s|Rain gun and central pivot are ____ irrigation methods.|modern|Along with drip and sprinkler.",
 "t|Canals are more useful in areas of low relief with perennial rivers.|True|Plains of the north."],
svg=(irr,"Four boxes showing shares of tube wells canals other wells and tanks with modern methods","Sources of irrigation"))

lesson(C,S,CH,'types-of-farming-and-cropping-seasons',"Types of farming and cropping seasons","Jhum, podu and terraces",
"A tribal farmer in Assam clears forest for Jhum cultivation, while a hill farmer cuts terraces. India shows many ways of farming.",
["Agriculture is producing food, fodder and fibre by growing crops and raising livestock. @ agriculture",
 "Agriculture is determined by physical (relief, climate, soil), institutional (land holdings, tenure), infrastructural (irrigation, power, credit) and technological factors. @ determinants",
 "Subsistence farming uses family labour and traditional methods; most produce is consumed by the family. @ subsistence",
 "Shifting agriculture (slash and burn) is called Jhum in Assam, Poonam in Kerala and Podu in Andhra Pradesh and Odisha. @ shifting agriculture",
 "Intensive farming uses heavy pesticides and fertilizers to maximise yield from available land. @ intensive",
 "Dry farming is practised in arid areas without irrigation, with drought-resistant crops and usually one crop a year. @ dry farming",
 "Mixed farming combines crops with livestock, poultry, fisheries and bee keeping. @ mixed farming",
 "Terrace farming is used on hill slopes where flat land is scarce and also checks soil erosion. @ terrace farming",
 "Cropping seasons: Kharif (June to September), Rabi (October to March) and Zaid (April to June). @ cropping seasons"],
("Classify rice, wheat and watermelon by cropping season and justify.",[("Rice is mostly a Kharif crop, sown with the monsoon in June and harvested in autumn.","Needs plenty of water."),("Wheat is a Rabi crop sown in October and harvested by March.","Needs cool weather to grow."),("Vegetables and fruits like watermelon are Zaid crops grown in summer.","April to June.")]),
("Why is shifting cultivation considered harmful?",["Forest is cleared and burnt","Fertility drops after two or three years","Farmers move on, causing deforestation and erosion"],["Calling it intensive farming"]),
["Subsistence, shifting, intensive, dry, mixed, terrace farming.","Jhum = Assam, Podu = Andhra and Odisha.","Kharif June-Sep, Rabi Oct-Mar.","Terraces reduce erosion."],
["m|Jhum is a name for|shifting agriculture|dry farming~Arid areas;terrace farming~Hills;mixed farming~Crops and animals|In Assam.",
 "t|Podu cultivation is practised in Andhra Pradesh and Odisha.|True|A shifting cultivation.",
 "m|Rabi season months|October to March|June to September~Kharif;April to June~Zaid;January only~Not a season|Wheat is a Rabi crop.",
 "m|Farming that combines crops and livestock|mixed farming|dry farming~No irrigation;intensive farming~Heavy chemicals;shifting farming~Slash and burn|Also poultry and bee keeping.",
 "t|Terrace farming reduces soil erosion.|True|Level steps on slopes.",
 "m|Kharif crop|rice|wheat~Rabi;barley~Rabi;mustard~Rabi|June to September.",
 "s|Slash and burn cultivation is also called ____ agriculture.|shifting|Jhum.",
 "m|Intensive farming relies on|heavy fertilisers and pesticides|family labour only~Subsistence;burning forest~Shifting;terraces~Hill farming|To maximise yield.",
 "n|Number of cropping seasons in India (Kharif, Rabi, Zaid)|3|Three seasons.",
 "t|Dry farming crops can withstand dry conditions.|True|Usually one crop a year."],
svg=(farm,"Six boxes showing the types of farming and the cropping seasons","Types of farming"))

lesson(C,S,CH,'major-crops-livestock-and-fisheries',"Major crops, livestock and fisheries","Rice bowl and tea gardens",
"India is the second largest producer of rice, wheat, tea, cotton, sugarcane and fruit in the world. Which crops grow where and why?",
["India's crops fall into four groups: food crops, cash crops, plantation crops and horticultural crops. @ four groups",
 "Rice needs about 24 degrees Celsius, 150 cm of rain and clayey loamy soil; India is the second largest producer after China, and West Bengal is first in India. @ rice",
 "Wheat is the second food crop; Uttar Pradesh, Punjab, Haryana, Rajasthan and Madhya Pradesh give more than 85 percent of it. @ wheat",
 "Jowar and bajra are millets; Maharashtra leads in jowar and Rajasthan in bajra; pulses fix nitrogen and are rotated with other crops. @ millets and pulses",
 "Cash crops include sugarcane, cotton, jute and oilseeds; cotton is the most important cash crop, jute is led by West Bengal and Gujarat leads in oilseeds. @ cash crops",
 "Plantation crops are tea, coffee, rubber and spices; Assam leads in tea, Karnataka in coffee, and Kerala in spices; rubber was first planted in Kerala in 1902. @ plantation crops",
 "Livestock: cattle are 37.3 percent of livestock, Uttar Pradesh has the most buffaloes, and goat is the poor man's cow. @ livestock",
 "Fisheries employ over 14 million people; India produces about 3 percent of world fish and ranks second after China; fishing is marine or inland. @ fisheries",
 "Rainfall, temperature and soil decide which crop is grown where. @ crop conditions"],
("Why is Assam the leading tea state and Karnataka the leading coffee state?",[("Tea needs high rainfall, humid climate and light shade, which Assam's hills offer.","Roots cannot tolerate water-logging."),("Coffee grows in shade at 1000 to 1500 m altitude, as in the hills of Karnataka.","Arabica is high quality."),("So climate and altitude decide plantation locations.","Both are exported.")]),
("Compare food crops with cash crops with two examples each.",["Food crops: rice, wheat feed the people","Cash crops: sugarcane, cotton are sold for industry","Plantation crops are grown on estates for export"],["Thinking only wheat is a food crop"]),
["Food, cash, plantation, horticulture crops.","Assam: tea; Karnataka: coffee; Kerala: spices.","Cotton: most important cash crop.","Fisheries: marine and inland."],
["m|Leading tea producer state|Assam|Karnataka~Coffee;Kerala~Spices;Punjab~Wheat|Hot humid hills.",
 "m|Leading coffee producing state|Karnataka|Assam~Tea;Gujarat~Oilseeds;Bihar~Not coffee|71 percent of India's coffee.",
 "t|Cotton is the most important cash crop of India.|True|Raw material for the largest industry.",
 "n|Year rubber plantation was first established in Kerala|1902|In hot, wet climate.",
 "m|Largest oilseeds producing state|Gujarat|Karnataka~Coffee;Assam~Tea;Punjab~Wheat|Groundnut is a key oilseed.",
 "t|Pulses fix atmospheric nitrogen.|True|So they are rotated.",
 "n|Percent of livestock that is cattle|37.3|India has the second largest cattle population.",
 "s|India ranks second after ____ in rice production.|China|World producers.",
 "m|Leading jute state|West Bengal|Assam~Tea;Bihar~Minor;Meghalaya~Minor|Alluvial soil.",
 "t|India ranks second in world fish production.|True|After China."],
svg=(crop,"A table listing food cash plantation and horticulture crops with leading states","Major crops of India"))
print('ok')
