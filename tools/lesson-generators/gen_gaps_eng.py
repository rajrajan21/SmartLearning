from gen5_common import *
import mark_add, json
HEDGE=" This summary is based on the well-known story or poem and on public chapter notes. Please read the exact text in the textbook, because the textbook version may differ in details."
def E(cls,ch,slug,en,story,exp,terms,ex,claim,summ,facts,tf,sa):
    S=dict(cls=cls,subj="english",subj_file="english")
    exp=list(exp); exp[-1]+=HEDGE
    L(S,ch,slug,en,story,exp,terms,ex,claim,summ,facts,tf,sa)
# ---- Class 5 Santoor
E(5,"the-rainbow","the-rainbow-the-poem-in-brief","The Rainbow: the poem in brief",
 "Ria watched a rainbow after the rain.\n\"Nothing we build is as lovely as that,\" she whispered.",
 ["The poem compares things people make with the wonders of nature. Boats travel on rivers and ships cross the seas, but clouds drifting across the sky look lovelier still.","Bridges over rivers are attractive too, yet the poet finds the rainbow the most beautiful of all, because it seems to join the earth and the sky.","The big idea is that the beauty of nature can be greater than anything people build."],
 ["rainbow","bridge","beauty"],
 ("What does the poet say is more beautiful than boats, ships and bridges?",["The poet lists boats, ships and bridges.","Then the poet names clouds and the rainbow.","The rainbow is the most beautiful."]),
 ("the poem says bridges are the most beautiful thing.",["The poem likes bridges.","But it calls the rainbow more beautiful."]),
 ["The poem compares human-made things with nature.","The rainbow is called the loveliest.","Nature's beauty can be greater."],
 [("The poem is mainly about","the beauty of nature","a football match","a market"),("The poet finds the most beautiful thing is the","rainbow","bridge","ship"),("A rainbow seems to join","earth and sky","two towns","two rivers"),("Boats travel on","rivers","clouds","roads")],
 ("The poem compares things people make with nature.","The poem says ships are lovelier than rainbows."),("What shape does the rainbow take? One word.","bow;arch;curve"))
E(5,"the-wise-parrot","the-wise-parrot-the-story-in-brief","The Wise Parrot: the story in brief",
 "Anu saw a parrot in a cage at the market.\n\"I wonder how it feels,\" she said.",
 ["A rich merchant keeps a clever parrot in a golden cage. Before a trip, he asks what gift he can bring. The parrot asks to be set free, and when the merchant refuses, it asks him to carry its greetings to its jungle friends.","On the way the merchant gives the message to a flock, and one wild parrot drops to the ground as if it were dead. When he tells his own parrot, it also falls down in its cage. Thinking it has died, he puts it on the windowsill, and it suddenly flies away.","The lesson is that cleverness can help us find a way to freedom, and that every creature loves to be free."],
 ["merchant","cage","freedom"],
 ("How does the parrot escape?",["The wild parrot shows a trick: pretending to be dead.","The pet parrot does the same.","The merchant puts it on the windowsill and it flies away."]),
 ("the merchant let the parrot go happily.",["The merchant refused at first.","The parrot escaped by being clever."]),
 ["A clever parrot wants to be free.","It escapes by a clever trick.","All creatures love freedom."],
 [("The parrot wants to be","free","fed more","sold"),("The parrot escapes by","pretending to be dead","fighting","digging"),("The story teaches that cleverness can lead to","freedom","anger","money"),("The merchant keeps the parrot in a","golden cage","box","tree")],
 ("The parrot asked the merchant to carry a message to its friends.","The merchant happily opened the cage at the start."),("Who was clever, the parrot or the merchant? One word.","parrot"))
E(5,"what-a-tank","what-a-tank-the-story-in-brief","What a Tank!: the story in brief",
 "At home the water tank ran dry one morning.\nAsha said, \"We never think about water until it is gone.\"",
 ["The chapter begins with the old ways Indians stored water, such as the Ooranis of Tamil Nadu, the wells of Kerala and the underground tanks of Rajasthan. Today many homes have tanks on the roof, and in Punjab some of them are built in fun shapes like a football or a tractor.","A girl named Suma spends a day without water and finds out how hard life becomes. She decides never to waste water again, and her school takes part in a Water Conservation Week.","The big idea is that water is precious, and each of us can use it carefully."],
 ["conservation","tank","precious"],
 ("What does Suma learn from a day without water?",["She cannot do everyday things easily.","She understands how precious water is.","She decides not to waste it."]),
 ("water is always easy to get, so we may waste it.",["Suma finds a day without water very hard.","So we must save water."]),
 ["People have stored water in many ways.","Suma learns water is precious.","We should save water."],
 [("The chapter is about","saving and storing water","playing cricket","a market"),("Suma learns that water is","precious","free to waste","only for plants"),("Old ways of storing water include","Ooranis and tanks","telephones","buses"),("Her school holds a","Water Conservation Week","Sports Day","Book Fair")],
 ("Some tanks in Punjab are built in fun shapes.","Suma decides to waste more water."),("What must we do with water? One word starting with s.","save"))
E(5,"gone-with-the-scooter","gone-with-the-scooter-the-story-in-brief","Gone with the Scooter: the story in brief",
 "Meena found a ball in her garden.\n\"Whose can this be?\" she asked.",
 ["On a hot afternoon, Gopi hears a noise in the garden and finds a white hockey ball under some dry leaves. He wants to return it and asks his friends at the playground whether it is theirs.","Several friends claim it, but nobody can prove it, so they decide to play with it. Jay hits it so hard that it flies out of the playground and lands in the basket of a passing scooter, which drives away without the rider noticing.","The story is light and funny. It shows Gopi's honesty, and it also shows that bragging does not prove a claim."],
 ["honest","claim","boast"],
 ("Why does Gopi ask his friends about the ball?",["He finds a ball that is not his.","He wants to find the real owner.","This shows he is honest."]),
 ("Gopi keeps the ball because it is his.",["He found it in his garden.","He tried to return it to its owner."]),
 ["Gopi finds a ball and tries to return it.","Nobody can prove it is theirs.","The ball ends up in a scooter."],
 [("Gopi finds a","hockey ball","kite","book"),("Gopi wants to","find the owner","sell it","hide it"),("The ball finally lands in a","scooter basket","pond","tree"),("The story shows Gopi is","honest","greedy","lazy")],
 ("A passing scooter carries the ball away.","Gopi throws the ball away."),("Who finds the ball? One word.","Gopi"))
E(5,"the-decision-of-the-panchayat","the-decision-of-the-panchayat-the-story-in-brief","The Decision of the Panchayat: the story in brief",
 "Two neighbours argued loudly over a wall.\n\"Let the village elders decide,\" said Ravi's grandfather.",
 ["A hardworking farmer buys a field and a well from a cunning neighbour. The next day the neighbour stops him from drawing water, saying that he sold the well but not the water in it.","The farmer goes to the village chief, and the Panchayat meets under a big banyan tree. The chief rules that if the water belongs to the neighbour, he must take it out of the well or the water will belong to the well's owner. The trickster is outwitted, pays a fine and says sorry.","The lesson is that cheating does not pay, and a wise and fair judgement can see through tricks."],
 ["panchayat","cunning","judgement"],
 ("How does the chief solve the problem?",["The neighbour says he sold only the well.","The chief says he must remove his water from the well.","He cannot, so the water belongs to the farmer."]),
 ("the neighbour wins the argument.",["The chief's judgement is wise.","The neighbour is outwitted and fined."]),
 ["A cunning neighbour tries to cheat a farmer.","The Panchayat gives a wise judgement.","Honesty wins."],
 [("The farmer buys a","field and a well","horse","shop"),("The neighbour is","cunning","helpful","shy"),("The Panchayat meets under a","banyan tree","bridge","tent"),("The story teaches that cheating","does not pay","pays well","is clever")],
 ("The village chief gives a wise judgement.","The farmer is the cheat in the story."),("Who gave the wise judgement, the farmer or the chief? One word.","chief"))
E(5,"vocation","vocation-the-poem-in-brief","Vocation: the poem in brief",
 "On the way to school, Ria saw a bangle seller, a gardener and a watchman.\n\"Their work looks so free,\" she thought.",
 ["This is a poem by Rabindranath Tagore. A boy on his way to school sees a bangle seller who wanders the streets with no fixed time. In the afternoon he sees a gardener digging happily in the earth, and at night he sees a watchman with a lantern walking the lanes.","Each worker seems free from timetables and orders, so the boy wishes he could be in their place.","The poem is about how the work of others can look free and easy from the outside."],
 ["vocation","gardener","watchman"],
 ("Who does the boy see during the day and at night?",["In the morning he sees a bangle seller.","In the afternoon he sees a gardener.","At night he sees a watchman."]),
 ("the boy wants to be a worker because he loves lessons.",["The boy is on his way to school.","He wishes for the freedom the workers seem to have."]),
 ["A boy sees three workers.","Their work seems free to him.","He wishes to be like them."],
 [("The poem is by","Rabindranath Tagore","Premchand","R. K. Narayan"),("The boy sees a bangle seller, a gardener and a","watchman","pilot","teacher"),("The workers seem","free","angry","tired of the sun"),("A vocation is a person's","work","toy","holiday")],
 ("The poem is about three kinds of workers.","The boy dislikes every worker he sees."),("Who walks the lanes at night? One word.","watchman"))
# ---- Class 6 / 7 Poorvi and Class 4 Santoor (well-known source works)
E(6,"the-raven-and-the-fox","the-raven-and-the-fox-the-story-in-brief","The Raven and the Fox: the story in brief",
 "Ravi's friend praised him loudly and then asked for his lunch.\n\"Be careful of sweet talk,\" said his mother.",
 ["This is the old fable of a raven and a fox. The raven sits on a branch holding a piece of food in its beak. A hungry fox sees it and starts to praise the raven's looks and voice.","The raven, pleased, opens its beak to sing, and the food drops to the ground. The fox picks it up and goes away.","The lesson is to be careful of flattery, which is praise that is not sincere."],
 ["flattery","fable","moral"],
 ("Why does the raven lose its food?",["The fox praises the raven.","The raven opens its beak to sing.","The food falls and the fox takes it."]),
 ("the fox was sincere in its praise.",["The fox wanted the food.","The praise was flattery."]),
 ["A fox flatters a raven.","The raven drops its food.","Beware of flattery."],
 [("The fox praises the raven to","get the food","be kind","learn singing"),("Flattery means","praise that is not sincere","a gift","a song"),("The raven loses its food when it","opens its beak","flies away","sleeps"),("The story is a","fable","map","letter")],
 ("A fable ends with a lesson.","The fox is hungry and honest."),("What does the fox want? One word.","food"))
E(7,"three-days-to-see","three-days-to-see-the-essay-in-brief","Three Days to See: the essay in brief",
 "Ravi closed his eyes and tried to walk across the room.\n\"We use our eyes without really seeing,\" he said.",
 ["This essay is by Helen Keller, who was blind and deaf. She imagines what she would do if she could see for just three days. She would want to look at the faces of the people she loves and at the beauty of nature and the world around her.","She says that people with sight often fail to notice the wonders in front of them. She asks every person to use their senses fully, as if they might lose them tomorrow.","The message is to value our senses and notice the world around us."],
 ["sense","grateful","imagine"],
 ("What is the main message of the essay?",["Helen Keller imagines three days of sight.","She notices that people with sight take it for granted.","She asks us to value and use our senses."]),
 ("Helen Keller says seeing people already notice everything.",["She says many seeing people miss the wonders around them.","So we should look and listen with care."]),
 ["Helen Keller imagines three days of sight.","People often take their senses for granted.","Value and use your senses."],
 [("The essay is by","Helen Keller","Anne Frank","Ruskin Bond"),("She imagines having sight for","three days","three years","one hour"),("The essay asks us to","value our senses","stop reading","stay indoors"),("People with sight often","take it for granted","never use it","hate it")],
 ("Helen Keller was blind and deaf.","She says we notice everything we see."),("How many days of sight does she imagine? Number only.","3;three"))
E(7,"try-again","try-again-the-poem-in-brief","Try Again: the poem in brief",
 "Meena fell off her bicycle but climbed back on.\n\"I will try again,\" she said.",
 ["This poem urges us not to give up. If we fail at first, we should try again and again, because the more we practise, the better we do.","It reminds us that nobody becomes good at something at once, and that effort and patience bring success.","The theme is perseverance, which means to keep trying."],
 ["perseverance","practise","patience"],
 ("What should we do if we fail at first?",["The poem says failing is not the end.","We should try again.","Practice leads to success."]),
 ("one failure means we should stop.",["The poem says to keep trying.","Practice brings success."]),
 ["Do not give up.","Try again and again.","Practice and patience bring success."],
 [("The theme of the poem is","perseverance","fear","laziness"),("If we fail at first we should","try again","stop","blame others"),("Success needs","practice and patience","luck only","shortcuts"),("Perseverance means to","keep trying","rest","argue")],
 ("The poem asks us to try again.","The poem says never to try twice."),("What should we do after a failure? Two words: try ___.","again;try again"))
E(7,"paper-boats","paper-boats-the-poem-in-brief","Paper Boats: the poem in brief",
 "On a rainy day Meena made a paper boat and wrote her name on it.\n\"Where will it go?\" she wondered.",
 ["This poem is by Rabindranath Tagore. A child makes paper boats every day and floats them on the flowing water, writing his name and village on each one.","He hopes that someone in a faraway place will read the name and know where the boat has come from. He imagines the boat meeting the night and the dreams of strangers.","The poem shows a child's imagination and wish to reach out to the wider world."],
 ["imagination","stream","faraway"],
 ("Why does the child write his name on the boat?",["The boat goes far away on the water.","He hopes someone will read the name.","They will know where it came from."]),
 ("the child throws the boats away because he hates them.",["The child loves making the boats.","He sends them with hope."]),
 ["A child floats paper boats.","He writes his name on them.","He hopes strangers will find them."],
 [("The poem is by","Rabindranath Tagore","Sarojini Naidu","Premchand"),("The child makes","paper boats","kites","clay pots"),("He writes on each boat his","name","marks","address of the shop"),("The poem shows a child's","imagination","anger","fear")],
 ("The boats float on flowing water.","The child never sends his boats anywhere."),("What does the child make? Two words.","paper boats"))
E(7,"rani-abbakka","rani-abbakka-the-story-in-brief","Rani Abbakka: the story in brief",
 "Anu read about a brave queen in her history book.\n\"A woman ruled and fought,\" she said with pride.",
 ["Rani Abbakka was a brave queen of Ullal, a coastal town in Karnataka. She ruled in the sixteenth century and fought the Portuguese, who wanted to control the coast and its trade.","She is remembered for her courage and for defending her land against a powerful foreign force for many years.","The chapter shows leadership, bravery and love for one's land."],
 ["queen","brave","defend"],
 ("What is Rani Abbakka remembered for?",["She was the queen of Ullal.","She stood against the Portuguese.","She is remembered for courage."]),
 ("Rani Abbakka gave up the land without a fight.",["She fought to defend her land.","She is remembered for her courage."]),
 ["Rani Abbakka ruled Ullal.","She fought the Portuguese.","She is remembered for bravery."],
 [("Rani Abbakka was a","queen","trader","poet"),("She ruled the town of","Ullal","Delhi","Agra"),("She fought against the","Portuguese","Mughals only","Greeks"),("She is remembered for her","courage","wealth","songs")],
 ("Rani Abbakka defended her land.","She was the queen of a mountain village."),("What was she, a queen or a trader? One word.","queen"))
E(4,"the-old-stag","the-old-stag-the-story-in-brief","The Old Stag: the story in brief",
 "Meena liked her new shoes but they hurt her feet.\n\"The thing I liked was not the best,\" she said.",
 ["This is a fable about a stag. He admires his big, beautiful antlers in a pool but is ashamed of his thin legs. When hunters chase him, his legs carry him quickly away, but his antlers get caught in the branches.","He then understands that the part he was proud of caused his trouble, and the part he disliked helped him most.","The lesson is that things that look beautiful are not always the most useful."],
 ["stag","antlers","fable"],
 ("Which part helps the stag escape?",["The stag does not like his legs.","His legs help him run away.","His antlers are caught in the branches."]),
 ("the stag's antlers saved him.",["The antlers got caught.","The legs saved him."]),
 ["The stag loves his antlers.","His legs help him escape.","Beauty is not always usefulness."],
 [("The stag was proud of his","antlers","tail","ears"),("The stag was ashamed of his","legs","eyes","voice"),("The part that helped him run was","his legs","his antlers","his horns only"),("The story is a","fable","poem about rain","letter")],
 ("The story teaches that beauty is not always useful.","The stag was safe because of his antlers."),("What helped the stag run away? One word.","legs"))
E(4,"braille","braille-the-chapter-in-brief","Braille: the chapter in brief",
 "Ria ran her fingers over a card of raised dots.\n\"It feels like a secret code,\" she said.",
 ["Braille is a way of reading and writing for people who cannot see. It uses patterns of raised dots that are read by touching with the fingertips.","It was created by Louis Braille, who lost his sight as a child. Each pattern of dots stands for a letter, a number or a sign.","The chapter shows how a clever idea can open the world of reading to many people."],
 ["Braille","dots","fingertips"],
 ("How do people who cannot see read Braille?",["Braille uses raised dots.","They touch the dots with their fingertips.","Each pattern stands for a letter or a number."]),
 ("Braille is read with the eyes.",["Braille is read by touching.","It is made for people who cannot see."]),
 ["Braille uses raised dots.","It is read by touch.","Louis Braille created it."],
 [("Braille is read by","touching","hearing","smelling"),("Braille uses","raised dots","colours","sounds"),("Braille was created by","Louis Braille","Helen Keller","Newton"),("Braille helps people who","cannot see","cannot walk","cannot sing")],
 ("Braille helps people who cannot see to read.","Braille uses only colours."),("What does Braille use? Two words: raised ___.","dots"))
# ---- Grammar / writing chapters are our own extras (not Santoor/Poorvi chapters): label them
SUF=" (additional, not in the textbook)"
P='/tmp/ss-build/content/curriculum/cbse-2026-27.json'
c=json.load(open(P))
G={3:['nouns-and-verbs','describing-words','sentences-and-punctuation'],4:['nouns-and-pronouns','verbs-and-tenses','adjectives-and-adverbs','writing-and-punctuation'],
   6:['parts-of-speech','tenses','sentences-and-clauses','writing-skills'],7:['parts-of-speech','tenses-and-voice','sentence-structure','writing-skills']}
todo=[]
for cl in c['classes']:
  for s in cl['subjects']:
    if s['slug']!='english': continue
    for ch in s['chapters']:
      if ch['slug'] in G.get(cl['classLevel'],[]):
        if not ch['name']['en'].endswith(SUF): ch['name']['en']+=SUF
        todo.append((cl['classLevel'],ch['slug'],[t['slug'] for t in ch['topics']]))
json.dump(c,open(P,'w'),ensure_ascii=False,indent=2); open(P,'a').write("\n")
for cls,ch,sl in todo:
    if sl: mark_add.mark(cls,'english',ch,sl)
print("labelled",len(todo))
