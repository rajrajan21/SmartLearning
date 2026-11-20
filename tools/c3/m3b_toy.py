from aug import *
svgfile("c3-toy-joy-solids.svg",720,300,'''
<rect x="30" y="90" width="90" height="90" fill="#bfe3ff" stroke="#235"/><polygon points="30,90 60,65 150,65 120,90" fill="#dff1ff" stroke="#235"/><polygon points="120,90 150,65 150,155 120,180" fill="#9fcdf0" stroke="#235"/><text x="40" y="215">Cube</text>
<rect x="175" y="105" width="120" height="70" fill="#ffd9b3" stroke="#532"/><polygon points="175,105 200,82 320,82 295,105" fill="#ffecd9" stroke="#532"/><polygon points="295,105 320,82 320,152 295,175" fill="#f2c08d" stroke="#532"/><text x="210" y="215">Cuboid</text>
<ellipse cx="400" cy="95" rx="40" ry="14" fill="#d9f2c4" stroke="#252"/><rect x="360" y="95" width="80" height="80" fill="#b9e29a" stroke="none"/><line x1="360" y1="95" x2="360" y2="175" stroke="#252"/><line x1="440" y1="95" x2="440" y2="175" stroke="#252"/><ellipse cx="400" cy="175" rx="40" ry="14" fill="#b9e29a" stroke="#252"/><text x="365" y="215">Cylinder</text>
<polygon points="525,70 485,170 565,170" fill="#f7c6d9" stroke="#523"/><ellipse cx="525" cy="170" rx="40" ry="12" fill="#eaa5c0" stroke="#523"/><text x="505" y="215">Cone</text>
<circle cx="650" cy="125" r="50" fill="#ffe27a" stroke="#541"/><ellipse cx="635" cy="108" rx="14" ry="8" fill="#fff4bf" stroke="none"/><text x="620" y="215">Sphere</text>
<text x="30" y="255" font-size="14">Extra, not in the textbook: cube and cuboid have 6 flat faces, 12 straight edges, 8 corners. Cylinder: 2 flat faces, 1 curved face.</text>
<text x="30" y="278" font-size="14">Cone: 1 flat face, 1 curved face, 1 pointed corner. Sphere: 1 curved face, no edges, no corners.</text>
''')
aug(3,'maths','toy-joy',
sections=[
 ('Making faces with shapes',[
  "Let us start with a craft, just like the children in our book. They are making animal and bird faces on old boxes, cans and paper.",
  "One child made a pig face on a box. A box like that is a cube, and the pig has narrow eyes.",
  "A bottle is a cylinder. On it the child made a puppy face with wide ears.",
  "A cone is pointed at the top, so the child made a bird face on it, and the pointed top became the beak.",
  "A cuboid is a long box. On it the child made a cat face with long whiskers.",
  "Now you try. Bring old boxes and bottles and draw faces on them. Tell us which shape you used for which face."]),
 ('Shapes hunt in our classroom',[
  "Let us go on a shape hunt. Look around the classroom for things that look like a cylinder, a sphere, a cube, a cuboid and a cone.",
  "Make a table and write the names of the things you find. A duster may be a cuboid, a ball is a sphere, and a chalk box may be a cuboid too.",
  "Count each kind. Which shape did you find the most? Which one did you find the least? Tell your friends.",
  "Some things are made up of more than one shape. A toy rocket may have a cone on top of a cylinder, so we say it is made of more than one shape."]),
 ('Talking about faces, edges and corners',[
  "Pick up a solid shape and turn it slowly. A flat part is called a flat face and a rounded part is a curved face.",
  "Which shape has no edges at all? A sphere, like a ball. It has only a curved face.",
  "Which shapes have only flat faces? The cube and the cuboid. Which shape has only a curved face? The sphere.",
  "Which shapes have both flat and curved faces? The cylinder and the cone. A cylinder has two flat circles and one curved side. A cone has one flat circle and one curved side.",
  "Look at a die. It is a cube, so it has six flat faces."]),
 ('The die and its opposite faces',[
  "A die has dots from one to six on its faces. Take a die and find the face that is opposite to the face with one dot.",
  "The face opposite one dot has six dots. Opposite two dots is five dots, and opposite three dots is four dots.",
  "Do you see the pattern? Each pair of opposite faces adds up to seven. One and six make seven, two and five make seven, three and four make seven."]),
 ('Building and joining shapes',[
  "Now let us build. Join shapes to make houses, towers and rockets. Name the shapes you used and say how you arranged them.",
  "If you join three cubes face to face, you can make a long straight shape. You can also make a bent shape that looks like the letter L. Try it with blocks.",
  "With six dice you can make a cuboid. You can make a tower by putting all six one on top of the other. You can make any shape you like, too.",
  "Remember our game. One friend puts three shapes together, tells the order, and the others build it without seeing. For example, the cone is on the cylinder.",
  "Well done! Now you can name solid shapes, talk about their faces, and build with them."]),
],
examples=[
 ("In the die, the face with 4 dots is opposite which face?",[("Think of the pairs that add up to 7.","Opposite faces of a die always add up to seven."),("4 + ? = 7, so ? = 3.","We need the number that makes 7 with 4."),("The face with 3 dots is opposite.","That completes the pair.")]),
 ("Which shapes have both flat and curved faces?",[("Think of a can. The top and bottom are flat, the side is curved.","A can is a cylinder."),("Think of a funnel. The wide round part is flat, and the sloping side is curved.","A cone has one flat and one curved face."),("The cylinder and the cone have both kinds of faces.","A cube has only flat faces and a ball has only a curved face.")]),
],
qs=[
 M("n1",1,"Which shape has no edges?","Sphere",[("Cube","A cube has twelve straight edges."),("Cuboid","A cuboid has twelve straight edges, too."),("Cone","A cone has a curved edge around its flat bottom.")],"A sphere, like a ball, has only a curved face and no edges.","Think of a ball."),
 N("n2",2,"On a die, which number is on the face opposite the face with 1 dot?",6,"Opposite faces add up to 7, and 1 + 6 = 7.",wrong=[(2,"2 is not the opposite of 1: 1 + 2 makes only 3."),(7,"A die has only faces from 1 to 6.")]),
 F("n3",1,"A cylinder has only flat faces.",False,"A cylinder has two flat faces and one curved face."),
 M("n4",2,"Which shapes have both flat and curved faces?","Cylinder and cone",[("Cube and cuboid","These have only flat faces."),("Sphere only","A sphere has one curved face and no flat face."),("Cube and sphere","A cube is all flat and a sphere is all curved, so neither has both.")],"The cylinder and the cone have flat faces as well as a curved face."),
 M("n5",3,"The pair of opposite faces on a die that does NOT add up to 7 is:","2 and 4",[("1 and 6","1 + 6 = 7, so this pair is correct."),("2 and 5","2 + 5 = 7, so this pair is correct."),("3 and 4","3 + 4 = 7, so this pair is correct.")],"Only 2 and 4 make 6, not 7. So 2 and 4 are not opposite faces."),
],
svgs=[("c3-toy-joy-solids","Five solid shapes: cube, cuboid, cylinder, cone and sphere","Solid shapes and their faces, edges and corners (extra counts are not in the textbook)")],
summary=["Cube and cuboid have only flat faces; a sphere has one curved face and no edges.","A cylinder and a cone have both flat and curved faces.","Opposite faces of a die add up to 7.","We can join shapes to build houses, towers and rockets, and describe where each shape is placed."])
