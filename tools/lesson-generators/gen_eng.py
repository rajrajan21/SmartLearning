import json,os,sys
os.chdir('/tmp/ss-build'); sys.path.insert(0,'tools/lesson-generators')
from lessonkit import mk,qs
p='content/curriculum/cbse-2026-27.json'
c=json.load(open(p))
BK={3:("Santoor","அரும்பு"),4:("Santoor",""),6:("Poorvi",""),7:("Poorvi","")}
CH={3:[("nouns-and-verbs","Naming and action words"),("describing-words","Describing words"),("sentences-and-punctuation","Sentences and punctuation")],
4:[("nouns-and-pronouns","Nouns and pronouns"),("verbs-and-tenses","Verbs and tenses"),("adjectives-and-adverbs","Adjectives and adverbs"),("writing-and-punctuation","Writing and punctuation")],
6:[("parts-of-speech","Parts of speech"),("tenses","Tenses"),("sentences-and-clauses","Sentences and clauses"),("writing-skills","Writing skills")],
7:[("parts-of-speech","Parts of speech"),("tenses-and-voice","Tenses and voice"),("sentence-structure","Sentence structure"),("writing-skills","Writing skills")]}
for cl in c['classes']:
    n=cl['classLevel']
    if n in CH and not any(s['slug']=='english' for s in cl['subjects']):
        cl['subjects'].append({"slug":"english","name":{"en":"English","ta":"ஆங்கிலம்"},"textbook":{"title":BK[n][0],"publisher":"NCERT","edition":"2026-27","sourceRef":"https://ncert.nic.in/textbook.php"},
          "chapters":[{"slug":s,"name":{"en":t},"topics":[]} for s,t in CH[n]]})
json.dump(c,open(p,'w'),ensure_ascii=False,indent=2)
def E(cls,ch,topic,en,obj,story,explain,terms,ex,tb,summ,q,ta="ஆங்கிலப் பாடம்"):
    S=dict(cls=cls,subj="english",subj_file="english")
    narr=[(e.split('.')[0]+'.',t) for e,t in zip(explain,terms+terms)]
    mk(S,ch,topic,en,ta,obj,story,explain,terms,[(e,t) for e,t in zip([x.split('. ')[0].rstrip('.')+'.' for x in explain]+[explain[-1]], (terms*3)[:len(explain)+1])][:4],ex,tb,summ,q)
E3="nouns-and-verbs"
E(3,E3,"naming-words-nouns","Naming words (nouns)",["Say what a noun is","Pick out nouns in a sentence"],
 ("Naming things","Ria looked around the garden. She saw a dog, a tree and Mina.\n\"Each of these has a name,\" said her teacher."),
 ["A noun is a naming word. It names a person, an animal, a place or a thing. Mother, cow, school and book are nouns.","The name of one particular person or place begins with a capital letter. Ria, Chennai and India are such names.","In the sentence The dog sat under the tree, the nouns are dog and tree."],
 ["noun","person","place","thing"],
 ("Find the nouns: The cat drank milk.",[("Ask which words name something.","Look for names."),("Cat and milk are names.","Nouns."),("So the nouns are cat and milk.","Answer.")]),
 ("A friend says run is a noun. How will you reply?",["Run tells what someone does.","A noun names something."],["Mixing nouns and actions."]),
 ["A noun names a person, animal, place or thing.","Special names begin with a capital letter."],
 qs("n",[("m","Which word is a noun?","school","run","quickly","It names a place."),("t","A noun is a naming word.",True,"Yes."),("m","The noun in The dog barked is","dog","barked","The","Dog names an animal."),("t","Chennai is a noun.",True,"A place name."),("m","Which is a name of a person?","Ria","table","jump","Ria."),("s","Write one noun from: The bird sang.",["bird"],"Bird."),("m","A noun that names an animal is","cow","sing","blue","Cow."),("t","Run is a noun.",False,"It is an action.")]))
E(3,E3,"action-words-verbs","Action words (verbs)",["Say what a verb is","Pick out the action word in a sentence"],
 ("Busy morning","In the morning Ravi wakes, brushes his teeth and runs to the bus.\n\"Each of these tells what Ravi does,\" said the teacher."),
 ["A verb is an action word. It tells what someone or something does. Run, eat, jump and sleep are verbs.","Every sentence needs a verb. In Birds fly the verb is fly. In Ravi reads a book the verb is reads.","To find the verb ask what is being done."],
 ["verb","action","sentence"],
 ("Find the verb: The girl sings.",[("Ask what the girl does.","What is done?"),("She sings.","Action."),("So the verb is sings.","Answer.")]),
 ("A friend says table is a verb. How will you reply?",["A table is a thing.","Verbs tell what is done."],["Mixing things and actions."]),
 ["A verb is an action word.","Ask what is being done."],
 qs("v",[("m","Which word is a verb?","jump","chair","red","Action."),("t","A verb is an action word.",True,"Yes."),("m","The verb in Birds fly is","fly","Birds","The","What they do."),("t","Table is a verb.",False,"A noun."),("m","Which tells an action?","eat","bag","green","Eat."),("s","Write the verb in: Ravi reads.",["reads"],"Reads."),("m","The verb in The cat sleeps is","sleeps","cat","The","Sleeps."),("t","Every sentence has a verb.",True,"Yes.")]))
E(3,"describing-words","adjectives-describing-words","Describing words",["Say what an adjective tells us","Use describing words in sentences"],
 ("The red balloon","Mina held a big red balloon.\n\"Big and red tell us about the balloon,\" said her teacher."),
 ["An adjective is a describing word. It tells more about a noun. In a tall tree, the word tall describes the tree.","Adjectives tell colour, size, shape and number. Red, small, round and five are adjectives.","They come before the noun. We say a sweet mango."],
 ["adjective","describe"],
 ("Find the adjective: a sweet mango.",[("Sweet tells about the mango.","Describing."),("Mango is the noun.","Naming."),("So sweet is the adjective.","Answer.")]),
 ("A friend says mango is an adjective in a sweet mango. How will you reply?",["Mango names a thing.","Sweet describes it."],["Mixing nouns and adjectives."]),
 ["Adjectives describe nouns.","They tell colour, size, shape and number."],
 qs("a",[("m","Which is an adjective?","tall","run","tree","Describes."),("t","Adjectives describe nouns.",True,"Yes."),("m","In a red ball the adjective is","red","ball","a","Colour."),("t","Five is an adjective.",True,"Number."),("m","Which word tells size?","big","eat","dog","Size."),("s","Write the adjective in: a sweet mango.",["sweet"],"Sweet."),("m","Which tells colour?","green","jump","table","Colour."),("t","Adjectives come after the noun always.",False,"Usually before.")]))
E(3,"sentences-and-punctuation","capital-letters-and-full-stops","Capital letters and full stops",["Start sentences with a capital letter","End sentences with the right mark"],
 ("The letter","Asha wrote a letter to her friend. She forgot the capital letters and stops.\n\"Nobody can read it easily,\" said Amma."),
 ["A sentence starts with a capital letter. Names of people and places also begin with a capital letter, like Asha and Madurai.","A sentence that tells something ends with a full stop. A sentence that asks something ends with a question mark. Where do you live? ends with a question mark.","A sentence that shows strong feeling ends with an exclamation mark. What a lovely day!"],
 ["capital letter","full stop","question mark"],
 ("Correct: where is my bag",[("Start with a capital W.","Capital."),("It is an asking sentence, so add a question mark.","Mark."),("Where is my bag?","Answer.")]),
 ("A friend says no mark is needed at the end. How will you reply?",["Every sentence needs an ending mark.","It tells the reader the sentence is complete."],["Leaving out ending marks."]),
 ["Capital letter at the start.","Full stop, question mark or exclamation mark at the end."],
 qs("p",[("m","A sentence starts with a","capital letter","full stop","comma","Capital."),("t","A question ends with a question mark.",True,"Yes."),("m","Which ends with a question mark?","Where are you","I am here","Run fast","It asks."),("t","Names begin with a small letter.",False,"Capital."),("m","What a lovely day ends with","!","?",",","Feeling."),("s","What mark ends: Do you like tea",["?","question mark"],"Question mark."),("m","A telling sentence ends with a","full stop","question mark","comma","Full stop."),("t","Madurai begins with a capital letter.",True,"Yes.")]))
E(4,"nouns-and-pronouns","common-proper-nouns-and-plurals","Common nouns, proper nouns and plurals",["Tell common nouns from proper nouns","Make plurals of simple nouns"],
 ("Class list","The teacher wrote on the board: girl, Meena, city, Chennai.\n\"Which names are special?\" she asked."),
 ["A common noun names any person, place or thing, like girl, city or book. A proper noun names one particular person or place and begins with a capital letter, like Meena and Chennai.","Singular means one and plural means more than one. We usually add s: book and books. After s, x, ch and sh we add es: box and boxes, bus and buses.","Some nouns change completely. Child becomes children and man becomes men."],
 ["common noun","proper noun","singular","plural"],
 ("Write the plural of box and book.",[("Book takes s: books.","Add s."),("Box ends in x, so add es: boxes.","Add es."),("So the plurals are books and boxes.","Answer.")]),
 ("A friend says city is a proper noun. How will you reply?",["City names any city.","Chennai names one city."],["Mixing common and proper nouns."]),
 ["Proper nouns begin with capitals.","Add s or es for plurals.","Some plurals are irregular."],
 qs("c",[("m","Which is a proper noun?","Chennai","city","river","Particular."),("t","Plural means more than one.",True,"Yes."),("m","Plural of box","boxes","boxs","boxies","Add es."),("t","Child becomes childs.",False,"Children."),("m","Plural of book","books","bookes","bookies","Add s."),("s","Write the plural of bus.",["buses"],"Add es."),("m","A common noun is","girl","Meena","Chennai","Any girl."),("t","Proper nouns begin with capital letters.",True,"Yes.")]))
E(4,"nouns-and-pronouns","pronouns","Pronouns",["Say what a pronoun does","Replace nouns with pronouns"],
 ("The repeated name","Ravi went to the shop. Ravi bought milk. Ravi came home.\n\"Why say Ravi again and again?\" asked Amma. \"Say he.\""),
 ["A pronoun takes the place of a noun. I, you, he, she, it, we and they are pronouns.","We use he for a boy, she for a girl and it for a thing or animal. We and they are for many.","Ravi went to the shop. He bought milk. The pronoun he stops us repeating Ravi."],
 ["pronoun","he","she","they"],
 ("Replace the noun: Meena likes mangoes. Meena eats them daily.",[("The second Meena can be replaced.","Spot the repeat."),("A girl is she.","Choose."),("Meena likes mangoes. She eats them daily.","Answer.")]),
 ("A friend says pronouns name people. How will you reply?",["Pronouns stand in for nouns.","They avoid repeating names."],["Mixing nouns and pronouns."]),
 ["A pronoun replaces a noun.","He, she, it, they, we, I, you."],
 qs("r",[("m","Which is a pronoun?","she","Meena","girl","Replaces."),("t","A pronoun takes the place of a noun.",True,"Yes."),("m","For a boy we use","he","she","it","He."),("t","They is a noun.",False,"A pronoun."),("m","Ravi is hungry. ___ wants food.","He","She","It","Boy."),("s","Fill: Meena is happy. ___ is singing.",["she"],"She."),("m","For many people we use","they","he","it","They."),("t","Pronouns help avoid repeating nouns.",True,"Yes.")]))
E(4,"verbs-and-tenses","past-present-and-future","Past, present and future",["Use present, past and future verbs","Change a verb to the past"],
 ("Yesterday and tomorrow","Gita said, \"I play today. I played yesterday. I will play tomorrow.\"\n\"The verb changes with the time,\" said the teacher."),
 ["The present tense tells what happens now: She plays. The past tense tells what happened before: She played. The future tense tells what will happen: She will play.","Most verbs add ed in the past: walk becomes walked. Some change fully: go becomes went, eat becomes ate and run becomes ran.","For the future we put will before the verb: will go, will eat."],
 ["present","past","future"],
 ("Write the past of walk and go.",[("Walk adds ed.","Regular verb."),("Go becomes went.","Irregular verb."),("So walked and went.","Answer.")]),
 ("A friend says the verb never changes. How will you reply?",["It changes with time.","Played is past, will play is future."],["Ignoring tense."]),
 ["Present is now.","Past is before.","Future uses will."],
 qs("t",[("m","Past of go","went","goed","gone to","Irregular."),("t","The future uses will.",True,"Yes."),("m","Past of walk","walked","walks","will walk","Add ed."),("t","Ate is the past of eat.",True,"Yes."),("m","Yesterday I ___ cricket.","played","play","will play","Past."),("s","Past of run? Write one word.",["ran"],"Ran."),("m","Tomorrow she ___ come.","will","did","was","Future."),("t","Present tense tells what happened before.",False,"It tells now.")]))
E(4,"adjectives-and-adverbs","adverbs-how-an-action-is-done","Adverbs: how an action is done",["Say what an adverb tells us","Use adverbs with verbs"],
 ("The slow tortoise","The tortoise walked slowly. The hare ran quickly.\n\"Slowly and quickly tell how they moved,\" said the teacher."),
 ["An adverb tells more about a verb. It tells how, when or where. In She sings sweetly the word sweetly tells how she sings.","Many adverbs end in ly: slowly, quickly, loudly, happily. Some tell time such as today and soon.","An adjective describes a noun and an adverb describes a verb. A quick runner uses quick for the noun; runs quickly uses quickly for the verb."],
 ["adverb","how","when"],
 ("Find the adverb: The boy spoke softly.",[("Ask how the boy spoke.","How?"),("He spoke softly.","Answer to how."),("So softly is the adverb.","Answer.")]),
 ("A friend says quickly describes a noun. How will you reply?",["It describes how the action is done.","It goes with the verb."],["Mixing adverbs and adjectives."]),
 ["Adverbs describe verbs.","Many end in ly."],
 qs("d",[("m","Which is an adverb?","slowly","slow","snail","How."),("t","An adverb tells more about a verb.",True,"Yes."),("m","She sings ___.","sweetly","sweet","sweeten","How."),("t","Quick is an adverb.",False,"Quickly is."),("m","Soon tells","when","how","where","Time."),("s","Find the adverb: He ran quickly.",["quickly"],"Quickly."),("m","Adverbs often end in","ly","ing","ed","Ly."),("t","An adjective describes a noun.",True,"Yes.")]))
E(4,"writing-and-punctuation","commas-and-paragraphs","Commas, quotation marks and paragraphs",["Use commas in lists","Write speech inside quotation marks"],
 ("The shopping list","Amma wrote: bananas, apples, grapes and milk.\n\"The commas keep each item apart,\" she said."),
 ["A comma separates items in a list: I like mangoes, grapes and apples. No comma is needed before and.","Quotation marks show the exact words someone says: Ravi said, \"I am hungry.\" The spoken words go inside the marks.","A paragraph is a group of sentences about one idea. Start a new paragraph for a new idea."],
 ["comma","quotation marks","paragraph"],
 ("Punctuate: Meena said I like tea",[("Meena said then the spoken words.","Speech."),("Put quotation marks round the words.","Marks."),("Meena said, \"I like tea.\"","Answer.")]),
 ("A friend says a paragraph can have many ideas. How will you reply?",["One paragraph gives one idea.","A new idea starts a new paragraph."],["Mixing ideas."]),
 ["Commas separate list items.","Quotation marks hold spoken words.","One idea per paragraph."],
 qs("w",[("m","A comma separates","list items","paragraphs","names only","List."),("t","Spoken words go inside quotation marks.",True,"Yes."),("m","A paragraph is about","one idea","many ideas","one word","One."),("t","A new idea begins a new paragraph.",True,"Yes."),("m","Which is correct?","I like mangoes, grapes and apples.","I like, mangoes grapes and apples.","I like mangoes grapes, and, apples.","Commas between items."),("s","What marks hold spoken words? Write two words.",["quotation marks","inverted commas"],"Quotation marks."),("m","Quotation marks look like","\" \"","( )","...","Speech marks."),("t","A paragraph is a single word.",False,"Group of sentences.")]))
E(6,"parts-of-speech","nouns-pronouns-and-adjectives","Nouns, pronouns and adjectives",["Identify nouns, pronouns and adjectives","Use them correctly in sentences"],
 ("The new classmate","A new girl, Kavya, joined the class. She wore a bright blue bag.\n\"Spot the noun, pronoun and adjective,\" said the teacher."),
 ["Nouns name people, places, things and ideas: girl, Chennai, bag and kindness. Proper nouns begin with a capital letter, and collective nouns name groups such as a team or a flock.","A pronoun replaces a noun: she, they, it. A possessive pronoun shows ownership: mine, yours, hers and theirs. A reflexive pronoun ends in self or selves: herself.","An adjective describes a noun: a bright blue bag. Adjectives can compare: tall, taller and tallest."],
 ["noun","pronoun","adjective","degrees of comparison"],
 ("Write the comparison of tall.",[("The basic form is tall.","Positive."),("Comparing two things gives taller.","Comparative."),("Comparing many gives tallest.","Superlative.")]),
 ("A friend says herself is a noun. How will you reply?",["Herself replaces a noun.","It is a reflexive pronoun."],["Confusing pronoun types."]),
 ["Nouns name; pronouns replace; adjectives describe.","Compare with er and est."],
 qs("a6",[("m","Which is a collective noun?","team","run","blue","Group."),("t","Hers is a possessive pronoun.",True,"Yes."),("m","Superlative of tall","tallest","taller","tallier","Most."),("t","An adjective replaces a noun.",False,"Describes."),("m","Herself is a ___ pronoun.","reflexive","possessive","plural","Ends in self."),("s","Comparative of small? Write one word.",["smaller"],"Smaller."),("m","In a bright bag the adjective is","bright","bag","a","Describes."),("t","Kindness is a noun.",True,"An idea.")]))
E(6,"parts-of-speech","verbs-adverbs-and-prepositions","Verbs, adverbs and prepositions",["Identify verbs, adverbs and prepositions","Use them in sentences"],
 ("The cat and the box","The cat jumped quickly into the box and slept under the lid.\n\"Find the action, the how and the where,\" said the teacher."),
 ["A verb shows action or state: jumped, slept, is. An adverb tells how, when or where about a verb: quickly. A preposition shows the link between a noun and another word: into, under, on, between.","Main verbs can have helpers called auxiliary verbs: is, are, was, has, will. In She has finished, has helps finished.","A preposition comes before a noun or pronoun: in the box, on the table, between two trees."],
 ["verb","adverb","preposition","auxiliary verb"],
 ("Find the preposition: The book is on the table.",[("Ask where the book is.","Where?"),("On shows the place.","Link."),("So on is the preposition.","Answer.")]),
 ("A friend says into is an adverb. How will you reply?",["Into links to the noun box.","So it is a preposition."],["Mixing adverbs and prepositions."]),
 ["Verb: action.","Adverb: how, when, where.","Preposition: link to a noun."],
 qs("b6",[("m","Which is a preposition?","under","slowly","jumped","Link."),("t","Has is an auxiliary verb.",True,"Yes."),("m","In She sang loudly the adverb is","loudly","sang","She","How."),("t","Prepositions come before a noun or pronoun.",True,"Yes."),("m","Which tells how?","quickly","table","into","Adverb."),("s","Find the preposition: The cat sat on the mat.",["on"],"On."),("m","The verb in Birds fly is","fly","Birds","The","Action."),("t","Between is an adverb.",False,"Preposition.")]))
E(6,"tenses","simple-continuous-and-perfect-tenses","Simple, continuous and perfect tenses",["Form simple present, past and future","Use the continuous and perfect forms"],
 ("A busy day","Anu said, \"I read daily. I am reading now. I have read this book twice.\"\n\"Each sentence shows a different time and stage,\" said the teacher."),
 ["Simple present: she plays. Simple past: she played. Simple future: she will play.","Present continuous shows an action going on now: she is playing. Past continuous: she was playing. It uses is, am, are or was, were with the ing form.","Present perfect shows a finished action linked to now: she has played. It uses has or have with the past participle."],
 ["simple","continuous","perfect"],
 ("Change to present continuous: The boys play.",[("Use are with the ing form.","Rule."),("Play becomes playing.","Verb."),("The boys are playing.","Answer.")]),
 ("A friend says continuous means finished. How will you reply?",["Continuous means going on.","Perfect shows finished."],["Mixing continuous and perfect."]),
 ["Simple: plain time.","Continuous: is, am, are + ing.","Perfect: has, have + participle."],
 qs("t6",[("m","Present continuous of She plays","She is playing","She has played","She played","Is plus ing."),("t","Has and have make the present perfect.",True,"Yes."),("m","Past of eat","ate","eated","eats","Irregular."),("t","Continuous shows a finished action.",False,"Going on."),("m","I ___ reading now.","am","has","did","Am."),("s","Past of go? Write one word.",["went"],"Went."),("m","She ___ finished her work.","has","is","was","Perfect."),("t","Simple future uses will.",True,"Yes.")]))
E(6,"writing-skills","paragraph-and-informal-letter","Writing a paragraph and an informal letter",["Plan a paragraph","Write a letter to a friend"],
 ("A letter to Ravi","Meena wrote to her cousin Ravi about her school trip.\n\"Start with greeting and end with your name,\" said her teacher."),
 ["A good paragraph has a topic sentence, supporting sentences and a closing sentence. All sentences stay on one idea.","An informal letter has the sender address and date, a greeting such as Dear Ravi, the body in short paragraphs, a closing like Yours lovingly and the signature.","Use simple friendly words, and check spelling and punctuation before you finish."],
 ["topic sentence","greeting","closing"],
 ("List the parts of an informal letter in order.",[("Address and date come first.","Top."),("Then the greeting, body and closing.","Middle."),("Last the signature.","End.")]),
 ("A friend says a letter needs no greeting. How will you reply?",["The greeting begins the letter politely.","Dear Ravi shows who it is for."],["Skipping the greeting."]),
 ["Paragraph: topic, support, close.","Letter: address, greeting, body, closing, name."],
 qs("w6",[("m","A paragraph begins with a","topic sentence","signature","date","Main idea."),("t","An informal letter has a greeting.",True,"Yes."),("m","A letter to a friend ends with","Yours lovingly","Dear Sir","Thank you madam","Informal."),("t","A paragraph has many unrelated ideas.",False,"One idea."),("m","Dear Ravi is the","greeting","closing","date","Start."),("s","What comes first in a letter: address or signature?",["address"],"Address."),("m","Informal letters use ___ words.","friendly","very formal","difficult","Simple."),("t","We should check spelling at the end.",True,"Yes.")]))
E(7,"parts-of-speech","conjunctions-interjections-and-determiners","Conjunctions, interjections and determiners",["Join words with conjunctions","Use determiners and interjections"],
 ("Rain or shine","Arun said, \"We will play outside, but if it rains we will stay in. Hurrah! The sun is out!\"\n\"Notice the joining words and the cry of joy,\" said the teacher."),
 ["A conjunction joins words or sentences: and, but, or, because, although. She was tired but she kept walking.","A determiner comes before a noun: a, an, the, this, that, some, many, my. It tells which or how many.","An interjection shows sudden feeling: Hurrah! Oh! Wow! It is followed by an exclamation mark."],
 ["conjunction","determiner","interjection"],
 ("Join with because: He stayed home. He was ill.",[("Use because to give the reason.","Conjunction."),("He stayed home because he was ill.","Joined."),("The reason follows because.","Check.")]),
 ("A friend says but joins reasons. How will you reply?",["But shows contrast.","Because shows reason."],["Mixing conjunctions."]),
 ["Conjunctions join.","Determiners come before nouns.","Interjections show feeling."],
 qs("c7",[("m","Which is a conjunction?","because","quickly","table","Joins."),("t","Wow is an interjection.",True,"Yes."),("m","Which is a determiner?","some","jump","slowly","Before nouns."),("t","But shows contrast.",True,"Yes."),("m","I was tired ___ I walked on.","but","the","oh","Contrast."),("s","Find the interjection: Hurrah! We won.",["hurrah"],"Hurrah."),("m","The words a, an, the are","articles","verbs","nouns","Determiners."),("t","An interjection joins two sentences.",False,"Shows feeling.")]))
E(7,"tenses-and-voice","perfect-continuous-and-the-passive-voice","Perfect continuous tenses and the passive voice",["Form the perfect continuous tenses","Change active voice to passive voice"],
 ("The broken window","The boy broke the window. The window was broken by the boy.\n\"Both sentences say the same thing in different ways,\" said the teacher."),
 ["Present perfect continuous shows an action that began earlier and is still going on: She has been reading for an hour. It uses has been or have been with the ing form.","In active voice the doer comes first: The boy broke the window. In passive voice the receiver comes first: The window was broken by the boy.","To make the passive, use a form of be with the past participle, and put by before the doer."],
 ["perfect continuous","active voice","passive voice"],
 ("Change to passive: The cat drank the milk.",[("The receiver is the milk.","Start with it."),("Use was drunk with by the cat.","Be plus participle."),("The milk was drunk by the cat.","Answer.")]),
 ("A friend says active and passive differ in meaning. How will you reply?",["They give the same fact.","Only the focus changes."],["Thinking meaning changes."]),
 ["Has been + ing for ongoing action.","Passive: be + participle."],
 qs("v7",[("m","Present perfect continuous","has been playing","played","will play","Has been + ing."),("t","In active voice the doer comes first.",True,"Yes."),("m","Passive of The boy broke the window","The window was broken by the boy","The boy was broken","The window broke the boy","Receiver first."),("t","Passive uses be with a past participle.",True,"Yes."),("m","She ___ been reading for an hour.","has","did","will","Perfect continuous."),("s","Past participle of break? Write one word.",["broken"],"Broken."),("m","Passive puts the ___ first.","receiver","doer","verb","Receiver."),("t","Active and passive give different facts.",False,"Same fact.")]))
E(7,"sentence-structure","simple-compound-and-complex-sentences","Simple, compound and complex sentences",["Tell the three sentence types apart","Build a complex sentence with a clause"],
 ("One, two or more ideas","Arun said, \"I play. I play and she reads. I play when she reads.\"\n\"Each sentence is built differently,\" said the teacher."),
 ["A simple sentence has one main clause: I play cricket. A compound sentence joins two main clauses with a conjunction like and, but, or: I play and she reads.","A complex sentence has a main clause and a subordinate clause that cannot stand alone: I play when she reads. When she reads is the subordinate clause.","Common joining words for subordinate clauses are because, when, if, although and while."],
 ["clause","compound","complex"],
 ("Name the type: She sang because she was happy.",[("It has a main clause: she sang.","Main."),("Because she was happy cannot stand alone.","Subordinate."),("So it is a complex sentence.","Answer.")]),
 ("A friend says a clause is always a full sentence. How will you reply?",["A subordinate clause cannot stand alone.","It needs the main clause."],["Mixing clauses."]),
 ["Simple: one clause.","Compound: joined clauses.","Complex: main plus subordinate."],
 qs("s7",[("m","I play and she reads is","compound","simple","complex","Joined with and."),("t","A subordinate clause can stand alone.",False,"It cannot."),("m","Which word starts a subordinate clause?","because","and","but","Reason."),("t","A simple sentence has one main clause.",True,"Yes."),("m","She sang because she was happy is","complex","simple","compound","Because."),("s","Name the type: Birds fly. Write one word.",["simple"],"One clause."),("m","Compound sentences use","and, but, or","because, if, when","only commas","Co-ordinating."),("t","If and although can start subordinate clauses.",True,"Yes.")]))
E(7,"writing-skills","summary-notice-and-formal-letter","Writing a notice and a formal letter",["Write a short notice","Write a formal letter to a headmaster"],
 ("The school notice","The school wanted to tell students about a sports day.\n\"A notice must give the facts in few words,\" said the teacher."),
 ["A notice has a heading, the date, a short message with what, when and where, and the writer's name and post. It uses few words.","A formal letter has the sender address, date, receiver address, subject line, a polite greeting such as Sir or Madam, the body, and closing like Yours faithfully with the signature.","Use polite, correct and brief language in formal writing."],
 ["notice","subject line","formal"],
 ("List what a notice must tell.",[("The heading and date.","Top."),("What, when and where.","Message."),("The name and post of the writer.","End.")]),
 ("A friend says a formal letter can use slang. How will you reply?",["Formal letters need polite language.","Slang is for friends."],["Using slang formally."]),
 ["Notice: heading, date, facts, name.","Formal letter: address, subject, greeting, body, closing."],
 qs("n7",[("m","A notice tells","what, when and where","a long story","only a name","Facts."),("t","A formal letter has a subject line.",True,"Yes."),("m","A formal letter ends with","Yours faithfully","Love","Bye","Formal."),("t","A notice should be very long.",False,"Few words."),("m","The greeting in a formal letter is","Sir or Madam","Hey","Buddy","Polite."),("s","What goes on top of a notice? Write one word.",["heading","title"],"Heading."),("m","Formal letters use ___ language.","polite","slang","rude","Polite."),("t","The writer's name and post come at the end of a notice.",True,"Yes.")]))
