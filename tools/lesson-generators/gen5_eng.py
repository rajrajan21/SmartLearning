from gen5_common import *
S=dict(cls=5,subj="english",subj_file="english")
# (chapter, short title, kind, theme, [(word, meaning)x3], writing prompt, unit theme)
C=[("papas-spectacles","Papa's Spectacles","story","Unit 1: Let's Have Fun. This chapter is about a fun family happening at home, with Papa and his spectacles at the centre.",[("spectacles","glasses worn to see clearly"),("search","to look carefully for something"),("amused","finding something funny")],"Write three sentences about a funny thing that happened at your home."),
("gone-with-the-scooter","Gone with the Scooter","story","Unit 1: Let's Have Fun. This chapter is about an adventure or mix-up with a scooter and the fun that follows.",[("scooter","a two-wheeled vehicle with an engine"),("race","to go very fast"),("adventure","an exciting experience")],"Describe a short ride you enjoyed. Say where you went and how you felt."),
("the-rainbow","The Rainbow","poem","Unit 2: My Colourful World. This poem celebrates the wonder of a rainbow and the colours in nature.",[("rainbow","an arch of seven colours seen after rain"),("sparkle","to shine brightly"),("arch","a curved shape")],"Write four lines about a colour you love and where you see it."),
("the-wise-parrot","The Wise Parrot","story","Unit 2: My Colourful World. This story is about a clever, wise parrot and what we learn from its good sense.",[("wise","having good sense and knowledge"),("parrot","a colourful bird that can copy words"),("advice","a suggestion that helps")],"Tell in four sentences how a wise friend once helped you."),
("the-frog","The Frog","poem","Unit 3: Water. This poem is about a frog, a creature that loves water and lives near it.",[("frog","an animal that lives near water and jumps"),("pond","a small area of still water"),("croak","the deep sound a frog makes")],"Write four lines about an animal that lives near water."),
("what-a-tank","What a Tank!","story","Unit 3: Water. This story is about a water tank and why storing and using water carefully matters.",[("tank","a large container for water"),("store","to keep for later use"),("supply","water or things provided regularly")],"List three ways your family stores and saves water."),
("gilli-danda","Gilli Danda","story","Unit 4: Ups and Downs. This story is about the game of gilli danda, childhood, friendship and how life changes over time.",[("friendship","a close bond between friends"),("childhood","the time when we are young"),("memory","something remembered from the past")],"Write about a game you played with a friend and why it was special."),
("the-decision-of-the-panchayat","The Decision of the Panchayat","story","Unit 4: Ups and Downs. This story is about a panchayat, a village council that decides a matter, and about fairness and honesty.",[("panchayat","a village council of elders"),("fair","treating everyone equally and justly"),("decision","a choice after thinking")],"Write what being fair means to you, with one example from school."),
("vocation","Vocation","poem","Unit 5: Work is Worship. This poem is about different kinds of work and the pride people take in what they do.",[("vocation","a job or work a person does"),("proud","feeling pleased about what you have done"),("worker","a person who does a job")],"Write four lines about the work of someone you admire."),
("glass-bangles","Glass Bangles","story","Unit 5: Work is Worship. This story is about people who make and sell glass bangles and the value of honest work.",[("bangle","a ring-shaped bracelet worn on the wrist"),("craft","skilled work done by hand"),("earn","to get money for work")],"Describe a craft or handmade thing you have seen being made.")]
for ch,title,kind,theme,words,prompt in C:
    w=[x[0] for x in words]; m=[x[1] for x in words]
    # 1 theme
    L(S,ch,ch+"-theme-and-meaning",title+": theme and meaning",
      "Ria opened her English book to '%s'.\n\"Let me read slowly and think about it,\" she said."%title,
      [theme,"Read the %s slowly, more than once. Ask: who is in it, what happens or what is described, and how does it make me feel?"%kind,"Retell the %s in your own words in order: beginning, middle and end. Please read the exact text in the Santoor textbook; this lesson gives the theme and activities."%kind],
      w,("What is '%s' about?"%title,["Think of the unit theme.","Say it in one sentence.","Give one detail you remember."]),
      ("we need not read the %s to talk about it."%kind,["Reading carefully helps us understand.","Then we can retell it."]),["Read carefully and retell in order.","Find the theme of the %s."%kind],
      [("'%s' is a"%title,kind,"recipe","map"),("When we retell we go in","order","reverse only","random"),("To understand a %s we should"%kind,"read it carefully","skip it","guess"),("The chapter belongs to the book","Santoor","Maths Mela","an atlas")],
      ("We should read a %s more than once."%kind,"A %s has no theme."%kind),("Write the book name. One word.","Santoor"))
    # 2 vocab
    L(S,ch,ch+"-words-and-meanings",title+": words and meanings",
      "Ria noted new words from '%s' in her notebook.\n\"Now I can use them,\" she said."%title,
      ["New words to learn: %s means %s; %s means %s; %s means %s."%(w[0],m[0],w[1],m[1],w[2],m[2]),"Use each new word in your own sentence. Try one about your day and one about your home.","Look in a dictionary to check the meaning, spelling and how to say the word."],
      w,("Make a sentence using '%s'."%w[0],["Remember the meaning: %s."%m[0],"Put it in a sentence.","Say it aloud."]),
      ("we do not need to know what new words mean.",["Meanings help us understand.","Use a dictionary."]),["Learn new words.","Use them in sentences."],
      [("'%s' means"%w[0],m[0],"a type of food","a number"),("'%s' means"%w[1],m[1],"a colour","a river"),("'%s' means"%w[2],m[2],"a city","a game"),("To check a meaning we use a","dictionary","pencil box","map")],
      ("Using new words in sentences helps us remember them.","We never need a dictionary."),("Write one new word from this lesson.",w[0]))
    # 3 activity
    L(S,ch,ch+"-speak-and-write",title+": speak and write",
      "Ria spoke about '%s' to her class.\n\"Now let me write it too,\" she said."%title,
      ["Speaking: tell your class what you liked in '%s'. Speak clearly and look at your listeners."%title,"Writing task: %s Start with a capital letter and end each sentence with a full stop."%prompt,"After writing, read your work again and fix spelling or missing words."],
      w,(prompt,["Plan your ideas.","Write complete sentences.","Check your work."]),
      ("writing does not need checking.",["Always read it again.","Fix mistakes."]),["Speak clearly.","Write and check."],
      [("A sentence begins with a","capital letter","number","comma"),("A sentence ends with a","full stop","star","tick"),("After writing we should","check our work","throw it away","hide it"),("When we speak we should","speak clearly","whisper always","shout")],
      ("We can check spelling after writing.","A sentence needs no full stop."),("Write the mark at the end of a sentence. One word.","full stop"))
