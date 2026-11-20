from aug import *
def frame(x0,y0,fills):
    s=''
    for i in range(10):
        r,c=divmod(i,5); x=x0+c*44; y=y0+r*44
        s+=f'<rect x="{x}" y="{y}" width="44" height="44" fill="#fff" stroke="#235" stroke-width="2"/>'
        f=fills.get(i)
        if f: s+=f'<circle cx="{x+22}" cy="{y+22}" r="15" fill="{f}"/>'
    return s
a={i:'#e04b4b' for i in range(8)}; a[8]='#3b7dd8'; a[9]='#3b7dd8'
b={i:'#3b7dd8' for i in range(4)}
svgfile("c3-nani-tens-frame.svg",720,260,frame(40,40,a)+frame(360,40,b)+'<text x="40" y="150">First frame: 8 red dots, plus 2 blue dots moved in = a full ten.</text><text x="360" y="150">Second frame: 4 blue dots left over.</text><text x="40" y="200" font-size="20">6 + 8: 8 + 2 = 10, then 10 + 4 = 14</text>')
aug(3,'maths','vacation-with-my-nani-maa',
sections=[
 ('The hidden marbles trick',[
  "Nani Maa has a magic trick for Nandini and Chirag. They hide some marbles under a handkerchief, and Nani Maa tells how many are hidden.",
  "The secret is knowing which number makes a total. If there are 15 seeds in all and 12 are on the table, then 3 are hidden, because 12 and 3 make 15.",
  "Practise like this. Say a number between 1 and 9, and your friend says the number that makes 9. If you say 4, your friend says 5. Then try with 10 and with 20.",
  "Knowing pairs that make 10 helps a lot. 3 and 7 make 10, 6 and 4 make 10, and 8 and 2 make 10."]),
 ('Adding and taking away with the tens frame',[
  "A tens frame has ten boxes, five in each row. It helps us add quickly because we can see a full ten.",
  "To find 6 + 8, put 8 dots in the frame. Two boxes are empty, so we move 2 dots from the 6. Now the frame is full, that is 10, and 4 dots are left. So 6 + 8 = 14.",
  "Use the frame for 5 + 10 and you get 15. For taking away, 9 - 6 = 3, and 18 - 9 = 9.",
  "Chirag got 9 story books for Nani Maa and Nandini got 7 puzzle books. Together that is 9 + 7 = 16 books."]),
 ('The number card game',[
  "Here is a game. Make four sets of cards with numbers from 1 to 10 and put them face down. Take turns to open one card at a time.",
  "If any three open cards make an addition or subtraction fact, you keep all three. For example, 2, 4 and 6 work because 2 + 4 = 6.",
  "When all cards are opened, the player with the most cards wins."]),
 ('More stamp stories',[
  "The children had 22 stamps. Nani Maa's brother gave them 30 more. We add 22 + 30 = 52 stamps now.",
  "Of the 52 stamps, 37 have faces of famous people. The rest have pictures of monuments. To find them, we jump back from 52: 52 - 37 = 15 monuments stamps.",
  "Next time they will have 75 stamps. They have 52 now, so they need 75 - 52 = 23 more. On the number line, jump from 52 to 60 is 8, then from 60 to 75 is 15. 8 + 15 = 23.",
  "Different jumps give the same answer. Choose the jump you like best."]),
 ('Playing on the number grid',[
  "The number grid has numbers from 1 to 100. Moving one box to the right adds 1, and moving one row up adds 10.",
  "In the grid game, you roll two dice to make a two-digit number and move your counter by that much. Nandini is at 23 and gets 11. She can move up one row to 33, then one step right to 34.",
  "If you cannot go forward, you may move backward. The first player to reach a number between 91 and 100 wins."]),
],
examples=[
 ("Nandini and Chirag have 52 stamps. They want 75 stamps in all. How many more do they need?",[("Start at 52 on the number line. Jump 8 to reach 60.","60 is the next ten."),("From 60 jump 15 to reach 75.","This finishes the journey."),("Add the jumps: 8 + 15 = 23. They need 23 more stamps.","Check: 52 + 23 = 75.")]),
 ("Use a tens frame to find 7 + 6.",[("Put 7 dots in the frame. Three boxes are empty.","We want to fill the frame to make 10."),("Move 3 dots from the 6 into the frame. Now it is full, that is 10, and 3 dots are left.","6 is 3 and 3."),("10 + 3 = 13, so 7 + 6 = 13.","We add the full ten and the leftover.")]),
],
qs=[
 N("n1",1,"There are 15 seeds in all. 12 are on the table. How many are hidden?",3,"12 + 3 = 15, so 3 seeds are hidden.",wrong=[(27,"27 is 12 + 15; we need the number that makes 15, not the sum."),(2,"12 + 2 = 14, not 15.")]),
 N("n2",1,"What is 9 + 7?",16,"9 + 7 = 16. Take 1 from 7 to make 10, then add the 6 left.",wrong=[(15,"9 + 6 is 15; there are 7, not 6."),(17,"9 + 8 is 17.")]),
 N("n3",2,"They have 52 stamps and need 75. How many more stamps do they need?",23,"75 - 52 = 23.",wrong=[(127,"127 is 75 + 52, but we need the difference, not the total."),(13,"This would be 65 - 52. Check by adding: 52 + 13 = 65, not 75.")]),
 M("n4",2,"On the number grid, which move adds 10?","Move up one row",[("Move one step to the right","This adds 1."),("Move one step to the left","This takes away 1."),("Move down one row","This takes away 10 in a grid that starts at 1 at the bottom.")],"In the grid, each row has ten numbers, so going up one row adds 10."),
 F("n5",1,"If you say 4, your friend says 5 to make 9.",True,"4 + 5 = 9."),
 N("n6",3,"Using the tens frame, what is 8 + 5?",13,"8 + 2 = 10, and 3 more is 13.",wrong=[(12,"8 + 4 would be 12; we have 5."),(14,"8 + 6 would be 14.")]),
],
svgs=[("c3-nani-tens-frame","Two tens frames showing 6 + 8 as 10 + 4","Using a tens frame to add 6 + 8")],
summary=["Number pairs that make 9, 10 and 20 help us find a hidden number.","A tens frame helps us make a ten: 6 + 8 = 10 + 4 = 14.","To find how many more are needed, take away the smaller number from the bigger one: 75 - 52 = 23.","The number grid helps us add: right is +1 and up is +10."])
