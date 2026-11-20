from gklib import P
P("wordplay","puzzle-anagram-basics","8-10","Anagram Detective","🔡",
 "Rearrange the letters of LISTEN to make another common word. | Then try EARTH.",
 "An anagram uses exactly the same letters in a new order. | Do not guess wildly. Look for common endings and starts.",
 "Chunk and shuffle","Look for chunks such as ING, ER, EST or TION. | Write the letters in a circle and try different starts. | LISTEN contains the chunk TEN, and also IN.",
 "LISTEN can be rearranged into SILENT, and also ENLIST and TINSEL. | EARTH can become HEART or HATER. | Same letters, new words.",
 "Chunk the letters into common word parts and shuffle them.",
 tags=["anagram"],more=[("Which word is an anagram of STOP?",["POTS","POSTS","STEP"],0,"POTS uses S, T, O, P.")])

P("wordplay","puzzle-word-ladder","8-10","Word Ladder","🪜",
 "Change COLD into WARM, changing one letter at a time, and each step must be a real word. | Hint: it takes four steps.",
 "Change one letter at a time and keep the rest. | Think of which letters you must change to reach the end.",
 "Work from both ends","COLD to CORD, CORD to CARD, CARD to WARD, WARD to WARM. | That is four steps, each changing only one letter. | Try also from the other end to check it.",
 "COLD, CORD, CARD, WARD, WARM. | There can be more than one right route. | Planning from both ends saves time.",
 "Plan from both ends and meet in the middle.",
 tags=["word ladder"],more=[("Which is a valid first step from CAT to DOG?",["COT","COG","DOT"],0,"CAT to COT changes one letter. COG changes two.")])

P("wordplay","puzzle-hidden-words","11-13","Hidden Words","🕵️",
 "Find an animal hidden across the words of this sentence: I did not go at all. | Look across word boundaries.",
 "Hidden words often cross the gap between two words. | Remove the spaces and read the letters in a line.",
 "Remove the spaces","Write it as ididnotgoatall. | Look for animals inside it. | Read in small chunks: did, not, goat, all.",
 "The animal is GOAT, hidden across go and at. | Other hidden words are NOT and TALL. | Always try removing the spaces.",
 "Delete spaces and scan for words across boundaries.",
 tags=["hidden words"],more=[("Which fruit is hidden in the words PEA CHIN?",["Peach","Pear","Plum"],0,"peachin contains PEACH.")])

P("wordplay","puzzle-rebus","8-10","Picture Word Puzzles","🖼️",
 "A puzzle shows the word HEAD written above the word HEELS. | Another shows the letter I written below the word STAND. | What do they say?",
 "A rebus uses the way the words are placed to give the clue. | Ask what the layout means.",
 "Read the layout","HEAD above HEELS: head over heels. | I below STAND: I under stand. | Say the position word aloud inside the phrase.",
 "The first says head over heels, a phrase for being very much in love or excited. | The second says I understand. | The position is a part of the clue.",
 "Let the position, size and order of the words be part of the clue.",
 tags=["rebus"],more=[("MAN is written above BOARD. This might say:",["Man overboard","Board man","Manboard"],0,"Man over board.")])

P("wordplay","puzzle-riddle-time","5-7","Riddle Time","🧩",
 "I have hands, but I cannot clap. I have a face, but I cannot smile. What am I?",
 "A riddle describes an object in a funny way. | Think of ordinary things that have parts with the same names as body parts.",
 "List and match","Hands, face, and no clapping or smiling. | Which common thing has hands and a face? | It sits on a wall or on your wrist and tells something.",
 "A clock. | Its hands point to the time and its face shows the numbers. | Riddles use words that have two meanings.",
 "Look for words with double meanings.",
 tags=["riddle"],more=[("I have keys but no locks and a space but no room. What am I?",["A keyboard","A house","A car"],0,"A keyboard has keys and a space bar.")])

P("wordplay","puzzle-palindromes","8-10","Words That Read Both Ways","🔁",
 "A palindrome reads the same forwards and backwards, like MADAM. | Find three more and one whole phrase.",
 "Test a word by reading it from the end. | Short words with repeated letters are good places to start.",
 "Mirror check","Write the word and check the first letter with the last, the second with the second last, and so on. | LEVEL, CIVIC and RADAR pass. | Numbers can be palindromes too, such as 121.",
 "LEVEL, CIVIC, RADAR and NOON are palindromes. | A phrase is A MAN A PLAN A CANAL PANAMA, ignoring spaces. | The mirror check works every time.",
 "Check pairs from the outside in.",
 tags=["palindrome"],more=[("Which is a palindrome?",["KAYAK","BANANA","HELLO"],0,"KAYAK reads the same backwards.")])
