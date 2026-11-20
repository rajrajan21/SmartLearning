from gklib import P
P("logic","puzzle-who-is-tallest","8-10","Who Is the Tallest?","📏",
 "Asha is taller than Bala. | Bala is taller than Charu. | Who is the tallest, and who is the shortest?",
 "Do not try to hold everything in your head. | Turn each clue into a short chain, and then join the chains.",
 "Draw a line","Write each name as a letter and use a greater-than sign. | A is taller than B gives A > B, and B > C. | Join them into one line: A > B > C.",
 "The line reads A > B > C. | So Asha is the tallest and Charu is the shortest. | Bala is in the middle.",
 "Join clues into one ordered line to compare people or things.",
 facts=["Ordering things from biggest to smallest is called ranking."],tags=["ordering","logic"],
 more=[("Ravi is older than Mani. Mani is older than Sita. Who is the youngest?",["Ravi","Mani","Sita"],2,"R > M > S, so Sita is youngest."),
       ("Tea is hotter than milk. Milk is hotter than water. Which is the coolest?",["Tea","Milk","Water"],2,"Tea > Milk > Water.")])

P("logic","puzzle-liars-and-truth-tellers","11-13","The Truthful Twin","🤥",
 "Two twins stand at a fork in the road. One twin always tells the truth and the other always lies. | You do not know which is which. | You may ask one question to one twin to find the road to the village. What do you ask?",
 "A direct question gets a lie from one twin and the truth from the other, and you cannot tell which. | So make a question that both twins answer in the same way.",
 "Ask about the other one","Ask either twin: what would the other twin say is the road to the village? | The truthful twin honestly reports the liar's wrong answer. | The liar lies about what the truthful twin would say, which also gives the wrong road.",
 "Whichever twin you ask, the road they point to is the wrong one. | So take the other road. | Two lies, or a truth about a lie, both end in the wrong answer, and so you reverse it.",
 "If you must handle a liar, ask a question that makes their lie cancel itself.",
 tags=["liar","truth"],more=[("In the twins puzzle, you ask what the other twin would say. The pointed road is:",["The right road","The wrong road","Always the left road"],1,"Both ways it points to the wrong road, so you take the other.")])

P("logic","puzzle-three-boxes","11-13","The Mislabelled Boxes","📦",
 "Three boxes are labelled Apples, Oranges and Mixed. | Every label is wrong. | You may take out one fruit from one box without looking inside. Which box do you pick to fix all the labels?",
 "Because all labels are wrong, the box labelled Mixed cannot really be mixed. | That is a strong clue. Start where the most is known.",
 "Use the certain one","Pick from the box labelled Mixed. | Suppose you pull out an apple. | Then that box holds only apples, because it cannot be mixed.",
 "Then the box labelled Oranges cannot hold oranges, and it cannot be apples either, so it is Mixed. | The box labelled Apples must be Oranges. | One fruit solved everything.",
 "Start with the box whose label gives you the most certainty.",
 tags=["elimination"],more=[("Why do we pick from the box labelled Mixed?",["Its label is wrong, so it holds only one fruit","It is the heaviest","It is the largest"],0,"A wrong Mixed label means it is a pure box.")])

P("logic","puzzle-handshakes","11-13","Handshakes at the Party","🤝",
 "Five friends meet. Each shakes hands with every other friend exactly once. | How many handshakes happen?",
 "Counting one by one is easy to mess up. | Look for a pattern with smaller groups first.",
 "Try smaller cases","With 2 friends: 1 handshake. With 3 friends: 3. With 4 friends: 6. | Each new friend adds a handshake with everyone already there. | So the totals go 1, 3, 6, 10.",
 "For 5 friends we add 4 more to the 6, which gives 10. | There is also a shortcut: each person shakes 4 hands, so 5 times 4 is 20, and each handshake was counted twice, so divide by 2 to get 10.",
 "Solve smaller versions first and look for the pattern.",
 facts=["For n people the handshakes are n times (n minus 1) divided by 2."],tags=["counting","pattern"],
 more=[("How many handshakes among 6 people?",["12","15","18"],1,"6 times 5 divided by 2 is 15.")])

P("logic","puzzle-river-crossing","8-10","The River Crossing","🛶",
 "A farmer must take a wolf, a goat and a cabbage across a river in a small boat that carries only the farmer and one item. | If left alone, the wolf eats the goat and the goat eats the cabbage. | How does he cross?",
 "List what can never be left together: wolf with goat, and goat with cabbage. | The goat is in both pairs, so it is the key.",
 "Find the troublemaker","Take the goat first, since leaving it with either is the problem. | Return alone and take the wolf across, then bring the goat back. | Leave the goat and take the cabbage across, then go back for the goat.",
 "Trip 1: goat across. Trip 2: farmer back alone. Trip 3: wolf across, goat back. | Trip 4: cabbage across, farmer back alone. Trip 5: goat across. | Everyone is safe.",
 "Find the item in the most conflicts and plan around it.",
 tags=["classic","planning"],more=[("Which item is the key in the river puzzle?",["The goat","The wolf","The cabbage"],0,"The goat is in both unsafe pairs.")])

P("logic","puzzle-whose-fish","8-10","Who Owns the Fish?","🐟",
 "Three friends, Mira, Nila and Omar, each own a different pet: a cat, a dog or a fish. | Nila owns neither the dog nor the fish. | Omar does not own the dog. Who owns the fish?",
 "Make a small table of names and pets. | Cross out what is impossible and see what is left.",
 "Table and elimination","Nila owns neither dog nor fish, so Nila owns the cat. | Now only the dog and the fish are left for Mira and Omar. | Omar does not own the dog, so Omar must own the fish.",
 "Nila has the cat, Mira has the dog and Omar has the fish. | Each clue removed one option until only one was left. | That is elimination.",
 "Cross out impossible options until only one is left.",
 tags=["table","elimination"],more=[("Nila owns the cat and Omar does not own the dog. Who owns the dog?",["Mira","Omar","Nila"],0,"Only Mira is left for the dog.")])

P("logic","puzzle-always-true","14+","If-Then Thinking","🔀",
 "If it rains, the match is cancelled. | The match was not cancelled. | What can you say about the rain?",
 "Turn the rule into: rain leads to cancellation. | Then ask what the missing cancellation tells you.",
 "The contrapositive","If rain, then cancelled. The opposite is: if not cancelled, then no rain. | This reversed version is always true when the original is. | It is called the contrapositive.",
 "Since the match was not cancelled, it did not rain. | Be careful: if the match was cancelled, we could not say it rained, because there may be other reasons. | Only the not-cancelled reading is safe.",
 "If A leads to B, then not B leads to not A, but B does not lead back to A.",
 tags=["if-then","logic"],more=[("If it is a square, it has four sides. A shape does not have four sides. It is:",["A square","Not a square","Cannot say"],1,"No four sides means not a square.")])

P("logic","puzzle-two-doors","8-10","Two Doors, Two Lies","🚪",
 "Two doors, one leads to treasure and one to a trap. | Door 1 has a sign: The treasure is behind this door. Door 2 has a sign: The treasure is behind door 1. | You are told both signs are lies. Which door has the treasure?",
 "If a sign is a lie, the opposite of what it says is true. | Take each sign and flip it.",
 "Flip the lies","Sign 1 lies, so the treasure is not behind door 1. | Sign 2 also lies, so the treasure is not behind door 1, which agrees. | With only two doors and none behind door 1, only door 2 is left.",
 "The treasure is behind door 2. | Both flipped signs fit this answer. | Always check that your answer matches every clue.",
 "A known lie is a clue: flip it to find the truth.",
 tags=["lies","cases"],more=[("A sign says: The treasure is behind this door, and it is a lie. The treasure is:",["Behind this door","Not behind this door","Nowhere"],1,"A lie means the opposite is true.")])
