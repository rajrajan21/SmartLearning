from aug import *
t=''
for i in range(11):
    x=40+i*64; t+=f'<line x1="{x}" y1="120" x2="{x}" y2="132" stroke="#235" stroke-width="2"/><text x="{x-14}" y="152">{100+i*10}</text>'
svgfile("c3-double-century-line.svg",720,230,'<line x1="40" y1="126" x2="680" y2="126" stroke="#235" stroke-width="3"/>'+t+'<path d="M 360 120 Q 500 40 680 120" fill="none" stroke="#c33" stroke-width="3"/><text x="470" y="62" fill="#c33">+50</text><text x="300" y="195" font-size="15">Start at 150 and jump 50 to reach 200. 140 + 60 = 200 also works.</text>')
aug(3,'maths','double-century',
sections=[
 ('Making 100',[
  "Now we come to a very special number: one hundred. Ten bundles of ten sticks make one hundred sticks.",
  "In cricket, when a batter scores one hundred runs, we say a century. That is why one hundred is a big, happy number.",
  "If you add one to ninety-nine, you get one hundred. So one more than 99 is 100.",
  "We can make 100 in many ways. Seventy and thirty make 100. Sixty and forty make 100. Forty-five and fifty-five make 100.",
  "Look at Bholu on the number line. He jumps to 65 and then jumps 35 more, and he lands on 100. So 65 and 35 make 100.",
  "A good trick is this: if the ones digit is 5, the missing part also has a 5 in the ones place. 45 and 55 make 100."]),
 ('Numbers after 100',[
  "What comes after one hundred? Let us make numbers with a bundle of one hundred and some more.",
  "100 and 1 more is one hundred one, which we write as 101. 100 and 2 more is one hundred two, which is 102.",
  "100 and 3 more is one hundred three, or 103. 100 and 10 more is one hundred ten, or 110.",
  "Now let us use bundles. One hundred is one big bundle. Then we show tens as small bundles and ones as loose sticks.",
  "For 123 we take 1 hundred, 2 bundles of ten and 3 loose sticks. For 104 we take 1 hundred, no tens and 4 loose sticks.",
  "Look at the numbers 100, 101, 102 and so on up to 150. Do you see what is common in all of them? Each one starts with 1 in the hundreds place."]),
 ('Clap, snap and pat',[
  "Let us play a game with our hands. One clap means 100. One snap means 10. One pat means 1.",
  "Two claps mean 200, two snaps mean 20, and two pats mean 2.",
  "Clap, snap snap, pat pat pat means 100 and 20 and 3, which is one hundred twenty-three. Play in two teams. One team makes a number and the other team guesses it."]),
 ('Counting up to 200',[
  "Let us count beyond 150. 150 is one hundred fifty. 151 is one hundred fifty-one, and 152 is one hundred fifty-two.",
  "Keep going like this up to 199. And what is one more than 199? It is 200, which we call two hundred. That is our Double Century.",
  "On the number line, start at 150. A jump of 50 takes you to 200. If you start at 140, a jump of 60 takes you to 200.",
  "We can also jump in fives. Start at 100 and jump 5 each time: 105, 110, 115, 120. Or jump in twenties: 100, 120, 140, 160, 180, 200."]),
 ('One more and one less',[
  "One more than a number is the next number, and one less is the number just before it.",
  "One less than 160 is 159, and one more than 160 is 161. One less than 129 is 128, and one more is 130.",
  "Estimate and count at home. Take a bowl of kidney beans, guess how many seeds are in it, then count. How close were you? How many bowls make about 200?"]),
],
examples=[
 ("What must be added to 65 to make 100?",[("Use a number line. Start at 65 and jump to 70.","That jump is 5."),("From 70 jump to 100.","That jump is 30."),("Add the jumps: 5 + 30 = 35. So 65 and 35 make 100.","Check: 65 + 35 = 100.")]),
 ("Write the number: 1 hundred, 2 tens and 3 ones.",[("1 hundred is 100, 2 tens are 20, and 3 ones are 3.","We write the value of each part."),("100 + 20 + 3 = 123.","We add them together."),("The number is 123, one hundred twenty-three.","We can also say it in words.")]),
 ("A clap is 100, a snap is 10 and a pat is 1. Which number is shown by clap, clap, snap, pat, pat?",[("Two claps are 200.","Each clap is 100."),("One snap is 10 and two pats are 2.","Add 10 and 2."),("200 + 10 + 2 = 212.","The number is two hundred twelve.")]),
],
qs=[
 N("n1",1,"What must be added to 70 to make 100?",30,"70 + 30 = 100.",wrong=[(20,"70 + 20 is only 90."),(40,"70 + 40 is 110, which is more than 100.")]),
 N("n2",1,"What is one more than 199?",200,"After 199 comes 200, the Double Century.",wrong=[(190,"190 is smaller than 199."),(209,"209 comes much later after 200.")]),
 M("n3",2,"How is 123 shown with bundles and sticks?","1 hundred, 2 bundles of ten and 3 loose sticks",[("1 hundred, 3 bundles of ten and 2 loose sticks","This shows 132, not 123."),("X),("2 hundreds, 1 ten and 3 sticks","This shows 213.")],"123 means 1 hundred, 2 tens and 3 ones."),
 N("n4",2,"Clap is 100, snap is 10, pat is 1. What number is shown by one clap, three snaps and two pats?",132,"100 + 30 + 2 = 132.",wrong=[(123,"123 would be two snaps and three pats."),(312,"The clap is the biggest, so it comes first and the number starts with 1.")]),
 M("n5",2,"Which two numbers make 100?","45 and 55",[("45 and 45","45 + 45 = 90, not 100."),("50 and 40","50 + 40 = 90, not 100."),("60 and 50","60 + 50 = 110, which is more than 100.")],"45 + 55 = 100."),
 F("n6",1,"Ten bundles of ten sticks make one hundred sticks.",True,"10 groups of 10 make 100."),
],
svgs=[("c3-double-century-line","A number line from 100 to 200 with a jump of 50 from 150 to 200","Jumping to 200 on the number line")],
summary=["10 tens make 100, and one more than 99 is 100.","Numbers after 100 are written with hundreds, tens and ones, like 123.","One clap is 100, one snap is 10 and one pat is 1.","200 is the Double Century: 150 + 50 = 200 and 140 + 60 = 200."])
