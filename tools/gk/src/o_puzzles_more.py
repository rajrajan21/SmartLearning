from gklib import P

P("mental","puzzle-times-eleven","11-13","The Times-Eleven Trick","✨",
 "Multiply 23 by 11 in your head, without writing anything. | Then try 54 times 11. | There is a quick pattern. Can you spot it?",
 "Try a few by hand: 12 times 11 is 132, and 31 times 11 is 341. | Look at the middle digit of each answer and compare it to the two digits you started with.",
 "Look for a pattern","For a two-digit number, write the first digit, then the sum of the two digits, then the last digit. | So 23 becomes 2, then 2 plus 3 equals 5, then 3, which gives 253. | If the sum is 10 or more, carry the 1 to the left.",
 "23 times 11 is 253. | 54 times 11: 5, then 5 plus 4 equals 9, then 4, which gives 594. | For 78 times 11: 7, then 15, then 8. Carry the 1 to get 858. | The trick works because times 11 means times 10 plus times 1, so each digit is added to its neighbour.",
 "Try small cases, spot the pattern, then use it.",
 tags=["mental maths","pattern"],
 more=[("What is 45 times 11?",["495","455","545"],0,"4, then 4 plus 5 equals 9, then 5, which gives 495."),("What is 36 times 11?",["396","366","406"],0,"3, then 3 plus 6 equals 9, then 6, which gives 396.")])

P("mental","puzzle-squares-ending-in-five","14+","Squaring Numbers That End in 5","🧮",
 "What is 35 times 35? | What is 85 times 85? | There is a fast way that needs only one small multiplication.",
 "Split the number into the tens part and the 5 at the end. | Try 15 times 15, which is 225, and 25 times 25, which is 625. Look at how the answers start and end.",
 "Find the rule, then test it","Take the tens digit, and multiply it by the next number up. | Write that, then write 25 after it. | For 35: 3 times 4 is 12, so the answer is 1225.",
 "35 times 35 is 1225. | 85 times 85: 8 times 9 is 72, so the answer is 7225. | It works because (10n plus 5) squared equals 100 times n times (n plus 1), plus 25. | Always test a rule on a case you already know, like 15 times 15 equals 225.",
 "A pattern is only a rule once you can explain why it works.",
 tags=["mental maths","algebra"],
 more=[("What is 65 times 65?",["4225","4025","4325"],0,"6 times 7 is 42, then 25 gives 4225."),("What is 95 times 95?",["9025","8925","9125"],0,"9 times 10 is 90, then 25 gives 9025.")])

P("logic","puzzle-lily-pond","11-13","The Lily Pond","🪷",
 "Lily pads on a pond double in number every day. | On day 30 the pond is completely covered. | On which day was it half covered?",
 "Do not start from day 1. | Start from the end, because the end is the part you know.",
 "Work backwards","If it doubles each day, then one day before it is full, it must be half full. | You do not need any sums. | Just step back one day from the end.",
 "The pond was half covered on day 29. | Many people say day 15, because half of 30 is 15, but doubling is not the same as adding the same amount each day. | When growth keeps doubling, the last few days do almost all the work.",
 "Start from what you know (the end) and step back.",
 tags=["doubling","backwards"],
 more=[("A bacteria colony doubles every hour and fills a dish in 12 hours. When is it a quarter full?",["Hour 10","Hour 6","Hour 3"],0,"Half full at hour 11, a quarter full at hour 10.")])

P("logic","puzzle-party-handshakes","11-13","Handshakes at the Party","🤝",
 "Five friends meet at a party. Each person shakes hands once with every other person. | How many handshakes happen in total?",
 "Do not count people times people, because that counts each handshake twice. | Try a smaller party first: 2 people, then 3, then 4.",
 "Try smaller cases","With 2 people there is 1 handshake. With 3 people there are 3. With 4 people there are 6. | Each new person shakes hands with everyone already there. | So the numbers go 1, 3, 6, 10, which add 2, then 3, then 4.",
 "Five people make 10 handshakes. | A quick rule: each of the 5 people shakes 4 hands, which is 20, but every handshake was counted twice, so divide by 2. | In general, n people make n times (n minus 1) divided by 2 handshakes.",
 "Solve a smaller version first and look for the pattern.",
 tags=["counting","pairs"],
 more=[("How many handshakes among 6 people?",["15","12","18"],0,"6 times 5 is 30, divided by 2 is 15."),("How many handshakes among 4 people?",["6","8","4"],0,"4 times 3 is 12, divided by 2 is 6.")])

P("logic","puzzle-bat-and-ball","11-13","The Bat and the Ball","🏏",
 "A bat and a ball cost 110 rupees together. | The bat costs 100 rupees more than the ball. | How much does the ball cost?",
 "The quick answer that jumps into most heads is 10 rupees. | Slow down and test it: if the ball is 10, what would the bat cost, and what is the total?",
 "Check your first answer","If the ball is 10, the bat is 100 more, which is 110, and the total is 120, not 110. | So 10 is wrong. | Let the ball be b. Then the bat is b plus 100, and the total is 2b plus 100 equals 110.",
 "2b equals 10, so the ball costs 5 rupees and the bat costs 105 rupees. | Check: 105 minus 5 is 100 more, and 105 plus 5 is 110. | The lesson is to test a fast answer before trusting it.",
 "Test the answer against every fact in the puzzle.",
 tags=["algebra","checking"],
 more=[("A pen and a cap cost 11 rupees. The pen costs 10 more than the cap. What does the cap cost?",["50 paise","1 rupee","10 rupees"],0,"Cap c: 2c plus 10 equals 11, so c is 0.50 rupees.")])

P("shapes","puzzle-count-the-squares","8-10","How Many Squares?","🔲",
 "Picture a big square made of a 3 by 3 grid of small squares, like a noughts and crosses board. | How many squares of any size can you find?",
 "Do not count at random. | Count the squares of each size one at a time.",
 "Count by size","Squares of size 1 by 1: there are 9. | Squares of size 2 by 2: there are 4, because a 2 by 2 square can start in 2 places across and 2 places down. | Squares of size 3 by 3: there is just 1.",
 "9 plus 4 plus 1 equals 14 squares. | For a 4 by 4 grid the same method gives 16 plus 9 plus 4 plus 1, which is 30. | Counting in an order stops you missing any or counting twice.",
 "Count in a fixed order, one size at a time.",
 tags=["counting","squares"],
 more=[("How many squares in a 2 by 2 grid?",["5","4","6"],0,"Four small squares and one big one, so 5.")])

P("wordplay","puzzle-shorter-word","8-10","The Word That Gets Shorter","🔤",
 "I am a word. When you add two letters to me, I become shorter. | What word am I?",
 "Think about what the word means, not just how it looks. | Which words describe length?",
 "Read the words literally","The word 'short' describes length. | Add the letters 'er' to the end. | What do you get?",
 "The word is 'short'. Add 'er' and you get 'shorter', which means even less long. | The puzzle plays on the word meaning and the number of letters at the same time. | In word puzzles, check both what a word says and what it is.",
 "Check both the meaning and the spelling.",
 tags=["words","riddle"],
 more=[("What word becomes longer when you add 'er' to it, and is also a describing word?",["long","tall","wide"],0,"'long' plus 'er' makes 'longer'.")])

P("patterns","puzzle-differences-of-differences","11-13","Differences of the Differences","📈",
 "Here is a number pattern: 2, 6, 12, 20, 30, and then what? | Find the next number, and say how you know.",
 "The numbers do not go up by the same amount each time. | Write down how much each step grows.",
 "Look at the differences","The steps are 4, 6, 8, 10. | These steps grow by 2 each time. | So the next step is 12.",
 "30 plus 12 is 42. | The pattern is also n times (n plus 1): 1 times 2, 2 times 3, 3 times 4, 4 times 5, 5 times 6, and next is 6 times 7, which is 42. | When a pattern is not steady, look at the differences between the differences.",
 "If the numbers are not steady, study the gaps between them.",
 tags=["number patterns","differences"],
 more=[("What comes next: 1, 4, 9, 16, 25, ...?",["36","30","35"],0,"These are squares: the next is 6 times 6, which is 36.")])
