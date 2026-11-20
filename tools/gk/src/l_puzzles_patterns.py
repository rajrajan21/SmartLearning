from gklib import P
P("patterns","puzzle-number-sequence-differences","8-10","What Comes Next? Differences","🔢",
 "Look at this number line: 2, 5, 8, 11, 14. | What number comes next?",
 "Do not stare at the numbers. | Ask how far it is from each number to the next.",
 "Find the difference","Subtract each number from the one after it. | 5 minus 2 is 3, 8 minus 5 is 3, 11 minus 8 is 3, 14 minus 11 is 3. | The step is always 3, so the pattern adds 3.",
 "14 plus 3 is 17. | So the next number is 17. | When the differences are the same, the sequence is called arithmetic.",
 "Write the gaps between numbers and see if the gaps follow a rule.",
 tags=["sequence"],more=[("What comes next: 4, 9, 14, 19, ...?",["22","23","24"],2,"The step is 5, so 19 plus 5 is 24."),("What comes next: 30, 27, 24, 21, ...?",["20","18","19"],1,"The step is minus 3, so 21 minus 3 is 18.")])

P("patterns","puzzle-doubling-pattern","8-10","Doubling Up","✖️",
 "Look: 3, 6, 12, 24, ... | What comes next, and what is the rule?",
 "The gaps are 3, 6, 12, which are not constant. | So try dividing instead of subtracting.",
 "Check the ratio","6 divided by 3 is 2. 12 divided by 6 is 2. 24 divided by 12 is 2. | Each number is double the one before it. | This is a multiplying pattern.",
 "Double 24 to get 48. | So the next number is 48. | If differences do not work, try multiplying or dividing.",
 "If adding does not fit, test multiplying.",
 tags=["sequence","doubling"],more=[("What comes next: 2, 6, 18, 54, ...?",["108","162","72"],1,"Each is times 3, so 54 times 3 is 162.")])

P("patterns","puzzle-square-numbers","11-13","The Square Numbers","🟦",
 "Look at 1, 4, 9, 16, 25. | What comes next?",
 "The gaps are 3, 5, 7, 9, so the gaps themselves grow in a pattern.",
 "Gaps of gaps","The gaps are 3, 5, 7, 9, which go up by 2 each time. | The next gap is 11. | Also these numbers are 1 times 1, 2 times 2, 3 times 3 and so on, called square numbers.",
 "25 plus 11 is 36, which is 6 times 6. | So the next number is 36. | Two different ways agree, which is a good check.",
 "Look at the gaps of the gaps, and try to spot special numbers like squares.",
 tags=["squares"],more=[("What comes next: 1, 8, 27, 64, ...? These are cubes.",["100","125","81"],1,"5 times 5 times 5 is 125.")])

P("patterns","puzzle-alternating-pattern","11-13","Two Patterns in One","🔀",
 "Look at 2, 10, 4, 20, 6, 30, ... | What are the next two numbers?",
 "The numbers do not go up evenly. | Try splitting them into odd places and even places.",
 "Split the sequence","Take every first, third and fifth number: 2, 4, 6. That goes up by 2. | Take every second, fourth and sixth number: 10, 20, 30. That goes up by 10. | Two small patterns are mixed together.",
 "The next first-line number is 8 and the next second-line number is 40. | So the sequence continues 8, 40. | When it looks messy, split it into two.",
 "Separate a mixed sequence into alternate terms.",
 tags=["alternating"],more=[("What comes next: 1, 100, 2, 200, 3, ...?",["4","300","30"],1,"The two lines are 1,2,3 and 100,200,300, so 300 comes next.")])

P("patterns","puzzle-fibonacci-next","11-13","Add the Last Two","➕",
 "Look at 1, 1, 2, 3, 5, 8, ... | What comes next?",
 "The differences are 0, 1, 1, 2, 3, which look like the sequence itself. | Try adding neighbours.",
 "Add the two before","1 plus 1 is 2, 1 plus 2 is 3, 2 plus 3 is 5, 3 plus 5 is 8. | Each number is the sum of the two numbers before it. | This is the Fibonacci sequence.",
 "5 plus 8 is 13, so the next number is 13. | Then 21 and 34 follow. | You can see this pattern in many flowers and shells.",
 "Test whether each term is built from the previous two.",
 tags=["fibonacci"],vis="fibonacci",more=[("What comes next: 2, 3, 5, 8, 13, ...?",["18","21","26"],1,"8 plus 13 is 21.")])

P("patterns","puzzle-odd-one-out-numbers","8-10","Odd One Out","❓",
 "Which does not belong: 2, 3, 5, 9, 11? | Give a reason.",
 "Look for a property most of the numbers share. | Then find the one that breaks it.",
 "Find the shared property","2, 3, 5 and 11 are all prime numbers, which can be divided only by 1 and themselves. | 9 can be divided by 3. | So 9 is the one that is not prime.",
 "The odd one out is 9. | A good answer always includes a reason. | There may sometimes be more than one reason that works.",
 "Name what most items share, then spot the exception.",
 tags=["odd one out","primes"],vis="number-sieve",more=[("Which is the odd one out: 4, 9, 16, 20, 25?",["20","16","9"],0,"Others are square numbers; 20 is not.")])

P("patterns","puzzle-letter-series","11-13","Letter Series","🔤",
 "What comes next: A, C, E, G, ...? | And what comes next: Z, X, V, T, ...?",
 "Convert letters to their positions in the alphabet. | A is 1, B is 2, C is 3, and so on.",
 "Turn letters into numbers","A, C, E, G are 1, 3, 5, 7, going up by 2. | So the next is 9, which is I. | Z, X, V, T are 26, 24, 22, 20, going down by 2.",
 "The first series continues with I. | The second series continues with R, which is number 18. | Turning letters into numbers lets you use number tricks.",
 "Convert letters to numbers to use number patterns.",
 tags=["letters","series"],more=[("What comes next: B, E, H, K, ...?",["N","M","L"],0,"2, 5, 8, 11 then 14, which is N.")])
