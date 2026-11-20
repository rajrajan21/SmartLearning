from gklib import P
P("shapes","puzzle-count-the-triangles","8-10","How Many Triangles?","🔺",
 "A big triangle has a line drawn from the top corner to the middle of the bottom side. | How many triangles are in the picture?",
 "Count by size. First the small triangles, then bigger ones made from two or more.",
 "Count systematically","The line splits the big triangle into 2 small triangles. | The big triangle itself is a third. | Do not forget to count the whole shape.",
 "There are 3 triangles: 2 small and 1 big. | Counting small, then joined, then whole avoids missing any. | Systematic counting beats random counting.",
 "Count by size: small first, then combinations, then the whole.",
 tags=["counting","triangles"],more=[("A square is cut by both diagonals. How many triangles can you find, counting those made of two small ones?",["4","8","6"],1,"4 small triangles plus 4 larger ones made of two each give 8.")])

P("shapes","puzzle-fold-and-cut","8-10","Fold and Cut","✂️",
 "Fold a square paper in half, then in half again, and cut a small triangle from the folded corner. | How many holes appear when you unfold it?",
 "Each fold doubles the layers. | The cut goes through all the layers at once.",
 "Count the layers","Two folds make 4 layers of paper. | One cut through 4 layers makes 4 holes. | Where the fold lines cross you should be careful which corner you cut.",
 "If the cut is in the free corner away from the folds, you get 4 holes, one in each quarter. | If you cut at the centre corner, the four holes join into one big hole. | Position matters as well as the count.",
 "Layers multiply: count the layers before cutting.",
 tags=["fold"],more=[("A paper is folded in half 3 times and one hole is punched. How many holes?",["3","6","8"],2,"3 folds make 8 layers.")])

P("shapes","puzzle-matchstick-squares","8-10","Matchstick Squares","🔥",
 "Squares are made in a row from matchsticks, with neighbouring squares sharing a side. | How many matchsticks make 3 squares in a row?",
 "Shared sides save sticks. | Count the first square fully and then only the new sides for each next square.",
 "Count only new sides","The first square needs 4 sticks. | Each extra square next to it shares one side and needs only 3 new sticks. | So 3 squares need 4 plus 3 plus 3.",
 "3 squares in a row need 10 matchsticks. | The pattern is 3 times the number of squares plus 1. | For 5 squares it is 16.",
 "Count shared sides once; each new item adds only the new parts.",
 tags=["matchsticks","pattern"],more=[("How many matchsticks for 5 squares in a row?",["16","20","15"],0,"3 times 5 plus 1 is 16.")])

P("shapes","puzzle-chessboard-squares","14+","Squares on a Chessboard","♟️",
 "A chessboard has 8 by 8 small squares. | How many squares of any size can you find?",
 "Do not just count the 64 small ones. Bigger squares made of several small ones count too.",
 "Count by size","1 by 1 squares: 8 times 8 is 64. | 2 by 2 squares: 7 times 7 is 49. | 3 by 3 squares: 6 times 6 is 36, and so on down to 1 big square.",
 "64 plus 49 plus 36 plus 25 plus 16 plus 9 plus 4 plus 1 is 204. | So there are 204 squares. | The pattern is the sum of the squares 1 to 8.",
 "Count each size separately and add them up.",
 tags=["chessboard","counting"],more=[("How many squares of any size are on a 3 by 3 grid?",["9","14","13"],1,"9 plus 4 plus 1 is 14.")])

P("shapes","puzzle-mirror-letters","5-7","Mirror Mirror","🪞",
 "Hold the word MOM up to a mirror. What does it say? | Now try the word TOT.",
 "A mirror flips left and right. | Letters that look the same flipped stay the same.",
 "Flip in your mind","The letters M, O and T look the same when flipped. | In a mirror the word also reads from the other side. | So MOM and TOT stay the same.",
 "MOM and TOT look the same in a mirror. | Letters like B or R flip to look back to front. | The word WOW also works.",
 "Imagine flipping left and right.",
 tags=["mirror"],more=[("Which letter looks the same in a mirror?",["A","R","F"],0,"A is symmetrical.")])

P("shapes","puzzle-nets-of-a-cube","11-13","Which Net Folds into a Cube?","🧊",
 "A cube has 6 faces. | You cut it along some edges and open it flat. | Which flat shapes of 6 squares can fold back into a cube?",
 "Imagine folding. Squares that would overlap cannot be in the same place.",
 "Fold in the mind","A row of 4 squares with one square above and one below, anywhere along the row, folds into a cube. | A row of 5 squares in a line cannot, because the first and the fifth would meet in the same place after wrapping around. | Four in a row is a handy starter.",
 "There are 11 different nets that fold into a cube. | Check by imagining that one square is the bottom and walking around it. | If any two squares land in the same face, it fails.",
 "Pick a base square and fold the rest around it in your mind.",
 tags=["cube","nets"],facts=["There are exactly 11 distinct nets of a cube."],more=[("How many faces does a cube have?",["4","6","8"],1,"A cube has 6 faces.")])

P("brain","puzzle-memory-chunking","8-10","Remember a Long Number","🧠",
 "Try to remember this number after one look: 4 9 2 7 1 8 3 5. | How can you do it?",
 "Eight single digits are hard to hold. | Groups are easier to remember than single items.",
 "Chunking","Split it into 49, 27, 18 and 35. | Link each chunk to something familiar, like an age or a house number. | Say the chunks aloud in rhythm.",
 "Four chunks of two digits are easier than eight single digits. | Phone numbers are written in groups for this reason. | Chunking works for words, dates and lists too.",
 "Group things into small chunks before memorising them.",
 tags=["memory","chunking"],more=[("What is chunking?",["Grouping items to remember","Forgetting","Speeding"],0,"Chunking is grouping.")])

P("brain","puzzle-memory-palace","11-13","The Memory Walk","🏠",
 "How can you remember a list of 5 things: milk, eggs, rice, soap, bananas?",
 "The brain remembers places and pictures better than lists. | Use that.",
 "Place things on a walk","Imagine walking through your home. | Put each item at a spot: milk in the doorway, eggs on the sofa, rice on the table, soap in the sink, bananas on the bed. | Make each picture strange and funny.",
 "Walk through the home in your mind to recall the list. | This method is called the method of loci, used since ancient times. | The sillier the picture, the better it sticks.",
 "Attach each item to a place in a familiar route.",
 tags=["memory"],more=[("The method of loci uses:",["Places","Rhymes","Colours"],0,"It uses familiar places.")])

P("brain","puzzle-estimate-fast","11-13","Estimating Quickly","🎯",
 "About how many steps are in a staircase with 12 floors, if each floor has 18 steps? | Answer without a calculator.",
 "You need only about right, so round to easy numbers.",
 "Round and multiply","Round 18 up to 20. | 12 times 20 is 240. | Since 18 is a bit less than 20, the real answer is a bit less.",
 "The exact answer is 216. | The estimate of 240 was close and took seconds. | Estimating helps you spot big mistakes.",
 "Round to easy numbers and then adjust.",
 tags=["estimate"],more=[("Estimate 49 times 21.",["About 1000","About 100","About 5000"],0,"50 times 20 is 1000.")])

P("brain","puzzle-monty-style-probability","14+","Which Is More Likely?","🎲",
 "You toss a fair coin 3 times. | Is getting 3 heads in a row less likely than getting exactly 1 head in 3 tosses?",
 "List all possible outcomes. | Then count those that match.",
 "List all outcomes","There are 8 outcomes: HHH, HHT, HTH, HTT, THH, THT, TTH, TTT. | HHH happens in only 1 of them. | Exactly 1 head happens in HTT, THT and TTH, which is 3 of them.",
 "Three heads has a chance of 1 in 8. | Exactly one head has a chance of 3 in 8. | So exactly one head is three times as likely.",
 "List every outcome and count the ones you want.",
 tags=["probability"],more=[("A fair coin lands heads 4 times. What is the chance the next toss is heads?",["Still half","Less than half","More than half"],0,"Each toss is independent.")])

P("brain","puzzle-working-backwards","11-13","Work Backwards","⏪",
 "I think of a number, double it, add 6 and get 20. | What was my number?",
 "Forwards is hard because you do not know the start. | Undo each step from the end.",
 "Reverse the steps","The last step was add 6, so subtract 6 from 20 to get 14. | The step before was double, so halve 14 to get 7. | Check: 7 doubled is 14, plus 6 is 20.",
 "The number was 7. | Working backwards undoes each step in the opposite order. | It is a great way to solve many puzzles.",
 "Undo the last step first, and go back to the start.",
 tags=["backwards"],more=[("I think of a number, add 5, then triple it, and get 24. What was the number?",["3","5","8"],0,"24 divided by 3 is 8, minus 5 is 3.")])

P("brain","puzzle-weighing-coins","14+","The Odd Coin","⚖️",
 "Nine coins look the same, but one is slightly heavier. | You have a balance scale. What is the smallest number of weighings needed to find it?",
 "Each weighing has three results: left heavier, right heavier or equal. | So you can split the coins into three groups.",
 "Split into three","Weigh 3 coins against 3 coins. | If one side is heavier, the heavy coin is in that group, and if they balance it is among the 3 left out. | Now you have 3 coins.",
 "Weigh 1 coin against 1 of the 3. | If one is heavier, that is it, and if they balance, it is the third coin. | So 2 weighings are enough.",
 "Split into three groups, since a balance has three outcomes.",
 tags=["weighing","divide"],more=[("The odd coin is among 27. How many weighings are enough?",["3","9","5"],0,"27 to 9 to 3 to 1 needs 3 weighings.")])
