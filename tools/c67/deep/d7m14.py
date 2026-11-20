import sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'..'))
from lib import *
def d():
    b='<text x="20" y="24" font-weight="bold">An equation is a balanced scale</text>'
    b+='<line x1="60" y1="130" x2="340" y2="130" stroke="#333" stroke-width="4"/><polygon points="200,130 180,190 220,190" fill="#999"/>'
    b+='<rect x="70" y="96" width="100" height="34" fill="#d6eaf8" stroke="#1f618d"/><text x="84" y="119" font-size="16">5x - 4</text>'
    b+='<rect x="230" y="96" width="100" height="34" fill="#d5f5e3" stroke="#1e8449"/><text x="268" y="119" font-size="16">7</text>'
    b+='<text x="60" y="226" font-size="14">Do the same to both pans and it stays balanced.</text>'
    b+='<text x="400" y="52" font-weight="bold" font-size="15">Solve 5x - 4 = 7</text>'
    steps=['5x - 4 = 7','add 4 to both sides: 5x = 11','divide both sides by 5: x = 11/5 = 2.2','check: 5 × 2.2 - 4 = 11 - 4 = 7 ✓']
    for i,s in enumerate(steps): b+=f'<text x="400" y="{82+i*28}" font-size="14">{s}</text>'
    b+='<text x="400" y="214" font-weight="bold" font-size="15">Matchsticks: 2n + 1 = 99</text><text x="400" y="240" font-size="14">2n = 98, so n = 49</text>'
    return b
svgfile('c7-maths-equations-balance.svg',700,260,d())
chapter(7,'maths','finding-the-unknown','Finding the Unknown',
 ('A weighing scale that is balanced','A balanced scale tells us that the two pans weigh the same. If one pan holds two fried eggs and the other three slices of bread of weight 2 each, each egg weighs 3. Finding an unknown weight from a balance is the idea behind equations. In this chapter we write such balances in symbols and solve them step by step.'),
 [('Unknowns on a balance',[
   'On a balanced scale, if we remove equal weights from both pans, the scale stays balanced. We use this to find unknown weights, for example by removing one sack from each pan until the sacks are on one pan only.',
   'The same idea works for any situation in which two quantities are equal. We first write the situation in symbols, with a letter for the unknown, and then find the value of the letter.']),
  ('Equations',[
   'Matchstick arrangements are built in a sequence: position 1 has 2 × 1 + 1 = 3 sticks, position 2 has 5, position 3 has 7. So position n has 2n + 1 sticks.',
   'Jasmine wants an arrangement with exactly 99 sticks. We need n with 2n + 1 = 99.',
   'A statement that two algebraic expressions are equal is called an equation. The expression on the left of the equal sign is the Left Hand Side, the LHS, and the one on the right is the Right Hand Side, the RHS.',
   'To solve an equation is to find the value of the letter-number that makes the LHS equal to the RHS. Weighing problems become equations too: if a fried egg weighs e and a bread slice weighs 2, then 2 + 2 + 2 = e + e, or 6 = 2e.']),
  ('Trial and error',[
   'One way to solve is to try values. For 2n + 1 = 99, try n = 5: LHS is 11. Try n = 10: LHS is 21. Try n = 30: 61. Try n = 40: 81. Try n = 50: 101, which is slightly too much. So the answer lies close to 49, and n = 49 gives 2 × 49 + 1 = 99.',
   'This is called the trial and error method. It works but can take very long. Solving 5x - 4 = 7 this way takes many trials, because the answer is not a whole number.']),
  ('Doing the same thing to both sides',[
   'If we add, subtract, multiply or divide both sides of an equation by the same number, the two sides stay equal, just as a balance stays balanced when equal weights are removed.',
   'If 14593 - 1459 + 145 - 14 + 88 = 13353, then the value of 14593 - 1459 + 145 - 14 is found by subtracting 88 from both sides, with no need to calculate the long expression. Addition and subtraction are inverse operations.',
   'In the same way multiplication and division are inverse operations. If 23 × 41 × 11 × 8 × 7 = 580888, dividing both sides by 7 gives the value of the product 23 × 41 × 11 × 8.']),
  ('Solving equations step by step',[
   'Solve 5x - 4 = 7. To keep only 5x on the left, remove the - 4 by adding 4 to both sides: 5x = 11. To keep only x, divide both sides by 5: x = 11/5. Check by substituting: 5 × 11/5 - 4 = 11 - 4 = 7. The solution is correct.',
   'Solve 11y + (-5) = 61. Subtract (-5), that is add 5, to get 11y = 66. Divide both sides by 11 to get y = 6. Always check: 11 × 6 - 5 = 61.',
   'Notice a shortcut. Removing a term from one side puts its additive inverse on the other side. Removing a factor from one side means dividing the other side by that factor, and removing a divisor means multiplying the other side by it. Look at 28(x + 4) + 300 = 1000: 28(x + 4) = 700, x + 4 = 25 and x = 21.',
   'When unknowns appear on both sides, bring the unknown terms to one side by doing the same thing to both. Always check the solution by substituting it.',
   'Some equations have no solution, such as x + 4 = x + 5, because no number can be 4 more and 5 more than itself at once.']),
  ('Using equations in problems',[
   'Ranjana builds tile arrangements where step k needs 3k + 1 tiles. Can she use exactly 100 tiles? Solve 3k + 1 = 100: 3k = 99, k = 33. Yes, at step 33.',
   'Madhubanti has ₹500 for a party. Each plate of snacks costs ₹25 and delivery adds a fixed ₹50. After the delivery charge ₹450 remains, which buys 450 ÷ 25 = 18 plates. With 5 family members, she can invite 18 - 5 = 13 friends. With letters: if p plates cost 25p + 50 = 500, then p = 18.',
   'Jahnavi has ₹4000 and saves ₹650 a month; Sunita has ₹5050 and saves ₹500 a month. They have equal savings after m months when 4000 + 650m = 5050 + 500m. So 150m = 1050 and m = 7 months.',
   'Riyaz\'s trick: Akash thinks of a number x, subtracts 3 and multiplies by 4, giving 4x - 12, and the answer is 24. Then 4x - 12 = 24, so x = 9. Equations let a magician or a mathematician undo steps.',
   'Ramesh and Suresh have 60 marbles, and Ramesh has 30 more. If Suresh has y, Ramesh has y + 30, so y + y + 30 = 60. So 2y = 30, y = 15, and Ramesh has 45.']),
  ('Making your own equations',[
   'Equations with the solution y = 5 can be made by doing the same operation to both sides of y = 5: for example y + 1 = 6 and 3y = 15.',
   'Going from a simple equation to a complicated one is the reverse of solving. Every step in a chain keeps the same solution, which is why solving works.',
   'Any equation can be given a story. 100x + 75 = 250 can mean that 100 plates cost x each, plus a delivery charge of ₹75, for a total of ₹250.'])],
 [('Solve 5x - 4 = 7 and check the answer.',[('Add 4 to both sides: 5x = 11.','Remove the term -4.'),('Divide both sides by 5: x = 11/5 = 2.2.','Remove the factor 5.'),('Check: 5 × 2.2 - 4 = 11 - 4 = 7.','The solution satisfies the equation.')]),
  ('A matchstick arrangement at position n has 2n + 1 sticks. Which position uses 99 sticks?',[('Frame the equation 2n + 1 = 99.','The number of sticks must equal 99.'),('Subtract 1 from both sides: 2n = 98.','Remove the term +1.'),('Divide by 2: n = 49.','Remove the factor 2.')]),
  ('Madhubanti has ₹500. A plate of snacks costs ₹25 and delivery is ₹50. There are 5 family members. How many friends can she invite?',[('Let p be the number of plates. The cost is 25p + 50 = 500.','Total cost equals the budget.'),('25p = 450, so p = 18.','Subtract 50 and divide by 25.'),('Friends = 18 - 5 = 13.','Her family also eat.')]),
  ('Ramesh and Suresh have 60 marbles. Ramesh has 30 more than Suresh. How many does each have?',[('Let Suresh have y marbles, so Ramesh has y + 30.','Express both in one unknown.'),('y + (y + 30) = 60 gives 2y = 30, so y = 15.','Collect like terms.'),('Suresh has 15 and Ramesh has 45.','Check: 15 + 45 = 60 and 45 - 15 = 30.')])],
 ('Explain to a friend what an equation is, how to solve 2n + 1 = 99 by balancing, and why we check the answer.',['An equation says two expressions are equal; solving means finding the value that makes it true.','Do the same operation on both sides to keep the equality, like removing equal weights from a balance.','Substituting the answer into the original equation confirms it is correct.'],['Doing an operation on one side only.','Forgetting to check by substitution.','Thinking every equation has a whole-number solution.']),
 ['An equation states that two expressions are equal; the solution is the value of the letter that makes the LHS equal to the RHS.','Trial and error works but can be slow.','Doing the same operation on both sides keeps an equation balanced.','Removing a term moves its additive inverse to the other side; removing a factor divides the other side.','Always check the solution by substituting it.','Equations model real situations such as bills, savings and puzzles.'],
 [mcq('1',1,'The solution of x + 7 = 15 is','8',[('22','That is 15 + 7; subtract 7 instead.'),('7','7 + 7 = 14, not 15.')],'x = 15 - 7.'),
  mcq('2',1,'In the equation 3y + 2 = 14 the LHS is','3y + 2',[('14','That is the RHS.'),('y','That is only the unknown.')],'The LHS is the expression to the left of the equal sign.'),
  tf('3',1,'If we add the same number to both sides of an equation, the equality stays true.',True,'It is like adding equal weights to both pans of a balance.'),
  mcq('4',1,'To solve 5x = 20, we','divide both sides by 5',[('subtract 5 from both sides','That would give 5x - 5 = 15, not remove the factor 5.'),('add 5 to both sides','That does not remove the factor 5.')],'Division removes the factor 5.'),
  num('5',2,'Solve 2n + 1 = 99.',49,'2n = 98, so n = 49.',[(98,'That is 2n, not n.'),(50,'2 × 50 + 1 = 101, which is too high.')]),
  num('6',2,'Solve 11y + (-5) = 61.',6,'11y = 66 and y = 6.',[(5,'11 × 5 - 5 = 50, not 61.'),(66,'That is 11y, not y.')]),
  num('7',2,'Solve 3k + 1 = 100.',33,'3k = 99 and k = 33.',[(100,'That is the number of tiles, not k.'),(34,'3 × 34 + 1 = 103.')]),
  num('8',2,'Akash thinks of x, subtracts 3 and multiplies by 4 to get 24. Find x.',9,'4(x - 3) = 24, so x - 3 = 6 and x = 9.',[(6,'That is x - 3, not x.'),(27,'You added 3 to 24 and not 6.')]),
  num('9',3,'Jahnavi has ₹4000 and saves ₹650 a month. Sunita has ₹5050 and saves ₹500 a month. After how many months are their savings equal?',7,'4000 + 650m = 5050 + 500m gives 150m = 1050, so m = 7.',[(10,'Check: 4000 + 6500 = 10500 but 5050 + 5000 = 10050.'),(5,'Check the equation 150m = 1050.')],'months'),
  mcq('10',3,'Which equation has no solution?','x + 4 = x + 5',[('x + 4 = 9','It has the solution x = 5.'),('2x = 10','It has the solution x = 5.')],'No number can be 4 more and 5 more than itself at the same time.')],
 svgs=[('c7-maths-equations-balance','A balanced scale showing 5x - 4 = 7 and its step-by-step solution','Equations as a balance')],
 keep=['equation','LHS','RHS','solution','unknown'])
