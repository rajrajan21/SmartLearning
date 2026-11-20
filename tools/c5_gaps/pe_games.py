import sys,json; sys.path.insert(0,'/tmp/ss-build/tools/c5_gaps')
from lib import *
S='physical-education'; C='local-and-traditional-games'
# curriculum topics
p='/tmp/ss-build/content/curriculum/cbse-2026-27.json'
d=json.load(open(p,encoding='utf8'))
ch=[x for x in d['classes'] if x['classLevel']==5][0]
sub=[s for s in ch['subjects'] if s['slug']==S][0]
chap=[c for c in sub['chapters'] if c['slug']==C][0]
for slug,name,obj in [('team-and-field-games','Team and field games (OG 1, 6, 7, 11)','Learn the rules of Nadan Panthu Kali, Damru Relay, Aahwan Kabaddi and Chikka-Chikka'),
    ('circle-games','Circle games (OG 2, 3, 10, 12)','Learn the rules of Attakalam, Jodi Baki, Daicholu and Gocho Paari'),
    ('chase-and-sense-games','Chase and sense games (OG 4, 5, 8, 9)','Learn the rules of Nakal Kho, Mai Bhi Maindhak, Bhukha Sher and Ghar Pehchano')]:
    if not any(t['slug']==slug for t in chap['topics']):
        chap['topics'].append({'slug':slug,'name':{'en':name},'objectives':[{'text':{'en':obj}}]})
json.dump(d,open(p,'w',encoding='utf8'),indent=2,ensure_ascii=False)

build(S,C,'team-and-field-games',"Team and field games: Nadan Panthu Kali, Damru Relay, Aahwan Kabaddi, Chikka-Chikka",
 "Games from every corner of India",
 "Every region of our country has games of its own. Playing them with kindness makes us better human beings and connects us with our heritage. Today we learn four team games and the exact rules to play them.",
 [("Nadan Panthu Kali: form two teams of 7 to 8 students. Mark a field 20 metres wide and 30 metres long with a line in the centre. One team throws the ball into the other team's area using Otta (toss and hit with the same hand), Petta (toss and hit with the other hand) or Pidiyan (toss and hit with the other hand held behind the back).","Nadan Panthu Kali"),
  ("The other team returns the ball by kicking it beyond the opponent's finish line. If the first team catches the ball they get one point; if the ball is kicked outside the finish line the kicking team gets a point. The first team to score ten points wins. It builds hand-eye and leg-eye coordination.","10 points wins"),
  ("Damru Relay: two equal teams stand in a straight line facing each other. On the teacher's signal the first runner runs to the opposite line, completes a circle and comes back. As soon as the runner reaches the start, the next student runs. The team whose last student finishes first wins. This builds agility, which is covering distance in different directions in a given time.","Damru Relay"),
  ("Aahwan Kabaddi: two teams face each other 15 to 20 metres apart. Defenders stand with one hand at head level and one at waist level, palms facing. An attacker moves towards them chanting Kabaddi-Kabaddi without taking a breath, claps a defender's palm and sprints back. If defenders tag the attacker before the line, they score 1 point, otherwise the attacker's team does. Everyone takes a turn and the team with most points wins.","Aahwan Kabaddi"),
  ("Chikka-Chikka: two teams of five students and three houses drawn on the ground. One team stands in a house and the other team surrounds it. Students inside must change houses without being touched by the outside team; if touched they are out. It develops spatial sense and agility. Safety first: ensure no pushing.","Chikka-Chikka"),
  ("After each game, talk in the circle: how would you motivate team members who are losing points, and how do you stay calm when you lose or avoid over-celebrating a win?","circle time"),
  ("Remember the teacher's notes: keep a clear running path, mark the field properly and play gently. Games can be varied - change the field size, ball size, or the number of players.","variation")],
 ("Why does a team in Aahwan Kabaddi score a point when the defenders tag the attacker?",[("The attacker must clap a defender's palm and sprint back to their own line.","This is the attacker's task."),("If the defenders tag the attacker before the line the defenders' team scores 1 point; otherwise the attacker's team does.","The race back decides the point.")]),
 ("Pick one of these four games and teach its rules to a friend.",["Teams and field/area of play","How points are scored","How the game ends and who wins"],["Forgetting the safety rules"]),
 ["Nadan Panthu Kali: first team to ten points wins.","Damru Relay: the team whose last runner finishes first wins.","Aahwan Kabaddi: chant Kabaddi without a breath; points for tag or safe return.","Chikka-Chikka: change houses without being touched.","Play fair, play safely and be kind."],
 [mcq("r1-tf1",1,"How many points does a team need to win Nadan Panthu Kali?","10",[("5","The book says ten."),("20","Twenty is the field's width in metres.")],"The first team with ten points wins."),
  mcq("r1-tf2",1,"In Damru Relay who starts running next?","The next student, as soon as the runner reaches the start",[("The whole team at once","They run one by one."),("The teacher","The team members run.")],"It is a relay."),
  tf("r1-tf3",1,"In Aahwan Kabaddi the attacker must chant Kabaddi-Kabaddi without taking a breath.",True,"That is a main rule."),
  num("r1-tf4",1,"How many students are in each team in Chikka-Chikka?",5,"Each team has five students.",[(7,"7 to 8 players is for Nadan Panthu Kali.")]),
  mcq("r2-tf5",2,"In Nadan Panthu Kali, 'Pidiyan' means tossing and hitting the ball","with the other hand held at the back",[("with the same hand","That is Otta."),("with the other hand","That is Petta.")],"Pidiyan adds the hand behind the back."),
  num("r2-tf6",2,"How many houses are drawn in Chikka-Chikka?",3,"Three houses.",[(5,"Five students are in each team.")]),
  mcq("r2-tf7",2,"What skill does Damru Relay build?","agility",[("flexibility","The book says agility."),("memory","Not the main aim.")],"Agility is covering distance in different directions in a given time."),
  tf("r2-tf8",2,"In Aahwan Kabaddi, defenders stand with one hand at head level and one at waist level.",True,"The attacker claps these palms."),
  mcq("r2-tf9",2,"How far apart do Aahwan Kabaddi teams stand?","15 to 20 metres",[("5 metres","Too close."),("50 metres","Too far.")],"The book says 15-20 metres."),
  short("r3-tf10",3,"What happens in Chikka-Chikka when the outside student touches a runner?",["out","the runner is out","he is out"],"The touched student is out.",[("nothing","Touched runners are out.")]),
  tf("r3-tf11",3,"In Nadan Panthu Kali the field is 30 m wide and 20 m long.",False,"It is 20 m wide and 30 m long."),
  mcq("r3-tf12",3,"Which is a safety point for team games?","Keep a clear running path",[("Run as fast as you can into others","Unsafe."),("Push opponents hard","Unsafe.")],"Clear paths avoid collisions.")])

build(S,C,'circle-games',"Circle games: Attakalam, Jodi Baki, Daicholu, Gocho Paari",
 "Inside the circle",
 "In some games the circle is the field. A push, a number call, a crawl or a throw decides who stays in. Let us learn four circle games.",
 [("Attakalam: mark a big circle and form two teams of seven. One team stands inside, the other outside. Outside players go in and try to push inside players out, while the inside players resist. A student who pushes an opponent out within 30 seconds gets one point and the pushed student is out. If the student fails within 30 seconds, the opponent gets a point. The team with the most points or the most students left wins. It builds leg and arm strength and teamwork.","Attakalam"),
  ("Jodi Baki: mark a circle with a radius of 7 metres. A leader stands inside and calls a number from 1 to 9. All the other students run slowly around the circle and, when a number is called, quickly form groups of that size by holding hands. Extra students who cannot join a full group are out. For 20 students and number 3, 6 groups are formed with 18 students and 2 are out.","Jodi Baki"),
  ("The game continues with new numbers until only two or three students remain; they are the winners. If someone is left out, encourage them kindly - it is part of the game.","last students win"),
  ("Daicholu: make a circular path and keep all students inside it. One is the chaser who crawls along the circle and touches others with the feet. A touched student is out. A student who steps outside the circle is disqualified. The first student touched becomes the next chaser. It develops core strength.","Daicholu"),
  ("Gocho Paari: draw a smaller circle in the centre of a larger one. 7-8 students scatter in the bigger circle. A thrower tries to throw the ball into the inner circle while players try to stop it. If the ball gets in, the thrower enters the circle and the last player who tried to stop the ball becomes the thrower. Everyone gets a turn.","Gocho Paari"),
  ("Variations: change the circle size, call numbers faster, use multiple balls, or play with legs only. Core muscles in the abdomen, back, hips and pelvis (about 29 in all) help us stand tall and balance.","variations")],
 ("In Jodi Baki, 20 students are playing and the leader calls 3. How many are out?",[("Groups of 3 from 20: 20 / 3 = 6 groups with 2 left.","6 x 3 = 18 students in groups."),("The 2 students left without a group are out.","20 - 18 = 2.")]),
 ("Teach a friend the rules of Attakalam.",["Two teams of seven, one inside and one outside the circle","Outside team pushes inside players out within 30 seconds","Points for successful pushes; most points or most students left wins"],["Pushing roughly"]),
 ["Attakalam: pushing within 30 seconds earns a point.","Jodi Baki: form groups of the called number; extras are out.","Daicholu: crawl and touch with the feet; stay inside the path.","Gocho Paari: stop the ball from entering the inner circle."],
 [num("r1-cg1",1,"How many students are in each team in Attakalam?",7,"Each team has seven.",[(8,"7-8 players is for Gocho Paari.")]),
  num("r1-cg2",1,"In Attakalam, within how many seconds must a student push an opponent out?",30,"The limit is 30 seconds.",[(20,"The book says 30.")],"seconds"),
  num("r1-cg3",1,"What is the radius of the Jodi Baki circle in metres?",7,"7 metres.",[(20,"20 is the number of students in the example.")],"m"),
  tf("r1-cg4",1,"In Jodi Baki the leader calls a number between 1 and 9.",True,"Players form groups of that number."),
  num("r2-cg5",2,"20 students play Jodi Baki and 3 is called. How many students are out?",2,"6 groups of 3 take 18 students, 2 are left.",[(6,"6 is the number of groups.")]),
  mcq("r2-cg6",2,"In Daicholu, how does the chaser move?","by crawling",[("by running","The chaser crawls."),("by hopping","Not in this game.")],"The chaser crawls and touches with feet."),
  tf("r2-cg7",2,"In Daicholu a student who steps out of the circular path is disqualified.",True,"Everyone must stay inside."),
  mcq("r2-cg8",2,"In Gocho Paari who becomes the next thrower when the ball enters the inner circle?","The last player who tried to stop the ball",[("The first player","Not the first."),("The teacher","The players rotate.")],"Then the thrower enters the circle."),
  mcq("r3-cg9",3,"What does Daicholu mainly develop?","core strength",[("speed","Mainly core strength."),("memory","Not the aim.")],"Crawling uses core muscles."),
  tf("r3-cg10",3,"In Attakalam, if a student fails to push within 30 seconds, the opponent gets a point.",True,"That is the rule."),
  short("r3-cg11",3,"How many core muscles does the book say we have (approximately)?",["29","twenty nine"],"There are approximately 29 core muscles.",[("9","The book says about 29.")]),
  mcq("r3-cg12",3,"Which is a good variation of Jodi Baki?","Announce numbers faster",[("Use no circle","The circle stays."),("Remove the leader","The leader calls numbers.")],"Faster calls raise difficulty.")])

build(S,C,'chase-and-sense-games',"Chase and sense games: Nakal Kho, Mai Bhi Maindhak, Bhukha Sher, Ghar Pehchano",
 "The hungry lion and the frog",
 "Some games make you copy, hop, roar or find soil with closed eyes! These four games sharpen your reflexes, observation and sense of direction.",
 [("Nakal Kho: form a large circle with defenders inside and one attacker. The attacker picks a defender to chase. The defender runs and does any action (jump, spin, crawl, clap, hop) and the attacker must copy it. A tired defender can stand before another defender and say Kho; the new defender runs and the attacker switches. If the attacker tags a defender, that student becomes the new attacker. There is no single winner.","Nakal Kho"),
  ("Mai Bhi Maindhak: one student is the attacker (frog), squatting and hopping while trying to tag defenders with one hand. A tagged defender also becomes a frog. The last defender not tagged wins. Only gentle leg touches, no kicking.","Mai Bhi Maindhak"),
  ("Bhukha Sher: draw 2-foot circles with 7-8 students in each, 3 to 4 feet apart; these are safe areas. One student outside is the hungry lion (denner) who roars on all fours. When the denner names a wild animal, everyone comes out to chase and tap the lion's back; the one who taps becomes Veer. Suddenly the denner roars Bhakshanam (I want to eat) and all run back to their safe circles. Anyone caught becomes the next denner.","Bhukha Sher"),
  ("Ghar Pehchano: a student stands with palms joined holding soil. Another covers their eyes and leads them diagonally, left, right, forward and back, and the soil is dropped suddenly. They are led back with eyes closed to the start and have 5 to 15 seconds to find the soil while others try to hide it. If they fail, they do five sit-ups. It builds spatial sense and love for our soil.","Ghar Pehchano"),
  ("Variations: begin with two or three frogs, change the word Bhakshanam to a word in your local language, or replace sit-ups with squats. Discuss strategies, safety and how it felt to be tagged.","variations")],
 ("In Bhukha Sher what do students do when the denner roars Bhakshanam?",[("Everyone is outside chasing the lion.","The denner suddenly changes the game."),("All students run back to their safe circles; anyone the lion catches becomes the next denner.","Quick return keeps you safe.")]),
 ("Explain the rules of Nakal Kho.",["Defenders inside a circle, one attacker","Attacker copies the defender's action while chasing","A tired defender says Kho to switch; tagged student becomes attacker"],["Thinking there is a single winner"]),
 ["Nakal Kho: imitate actions; switch by saying Kho.","Mai Bhi Maindhak: tagged players become frogs; last defender wins.","Bhukha Sher: run to safe circles on Bhakshanam.","Ghar Pehchano: find the soil within 5 to 15 seconds or do five sit-ups."],
 [mcq("r1-cs1",1,"In Nakal Kho, what must the attacker do while chasing?","Copy the defender's action",[("Close their eyes","Not a rule."),("Shout Kho","That is for defenders to switch.")],"Nakal means to imitate."),
  tf("r1-cs2",1,"In Mai Bhi Maindhak, a tagged defender also becomes a frog.",True,"More frogs make it harder."),
  mcq("r1-cs3",1,"In Bhukha Sher the 'hungry lion' is called the","denner",[("Veer","Veer is the student who taps the lion."),("Kho","Kho is a word in Nakal Kho.")],"Denner is the lion."),
  num("r1-cs4",1,"How many sit-ups must you do if you cannot find the soil in Ghar Pehchano?",5,"Five sit-ups.",[(10,"The book says five.")]),
  mcq("r2-cs5",2,"What does the word Bhakshanam mean?","I want to eat",[("I am safe","Opposite."),("Start running slowly","It means I want to eat.")],"The denner roars it."),
  tf("r2-cs6",2,"In Nakal Kho there is a single winner.",False,"There is no single winner."),
  mcq("r2-cs7",2,"How much time does the player get to find the soil in Ghar Pehchano?","5 to 15 seconds",[("1 minute","Too long."),("30 seconds","The book says 5-15.")],"The time is fixed within this range."),
  mcq("r2-cs8",2,"How do frogs move in Mai Bhi Maindhak?","Squatting and hopping close to the ground",[("Running","Frogs hop."),("Walking tall","Not a frog.")],"Knees bent, hands near the ground."),
  short("r3-cs9",3,"What word does a defender say to hand over to another defender in Nakal Kho?",["kho","Kho"],"The tired defender says Kho.",[("tag","The word is Kho.")]),
  tf("r3-cs10",3,"In Mai Bhi Maindhak, kicking is allowed to tag.",False,"Only gentle leg touches."),
  mcq("r3-cs11",3,"What does Ghar Pehchano develop?","spatial sense",[("throwing","Not a throwing game."),("batting","No.")],"Finding the place by direction."),
  mcq("r3-cs12",3,"What happens to a student the lion catches in Bhukha Sher?","They become the next denner",[("They are out forever","They become the denner."),("They win","They become the lion.")],"The game continues.")])
print('pe built')
