import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
R=os.path.expanduser('~/mnt/d/Smart Learning Website')
import lib89
lib89.ROOT=R; lib89.CAT=R+'/tools/cbse89/catalog_89.json'
from lib89 import *
def B(tn,*a,**k): build('science',9,tn,*a,**k)

# ---------- Lesson A: laws of chemical combination + Dalton ----------
B('Laws of chemical combination and Dalton\'s atomic theory','Conservation of mass, constant proportions and Dalton\'s atomic theory','Does mass go missing?',
 "Water from a river, a borewell and the sea all look different. Yet when scientists purify each sample and take it apart, they always find hydrogen and oxygen in exactly the same proportion. Why does nature keep such an exact account? Let us weigh things carefully and find out.",
 [("In Chapter 8 you learnt that atoms can lose, gain or share electrons. Now we ask a new question: when substances change, does their total mass change?","mass in changes"),
  ("Activity 9.1: weigh water and salt in a beaker, then let the salt dissolve. The mass of the solution equals the mass of the water plus the salt, so in a physical change there is practically no change in mass.","physical change: mass same"),
  ("Activity 9.2: put baking soda in a balloon beside a flask of vinegar and weigh them. When you mix them, carbon dioxide is formed with brisk fizzing.","vinegar + baking soda"),
  ("In set-up 1, with the flask open, the final reading is lower, because the carbon dioxide gas escapes into the air.","gas escapes"),
  ("In set-up 2, the balloon is tied to the mouth of the flask, so the gas is trapped, inflates the balloon, and the final reading equals the initial reading.","closed system: mass same"),
  ("Activity 9.3: mixing sodium sulfate and barium chloride solutions gives a white precipitate of barium sulfate and sodium chloride. No gas is formed, and the total mass stays the same even in an open flask.","sodium sulfate + barium chloride"),
  ("Antoine Lavoisier stated this in 1789: matter can neither be created nor destroyed in a chemical reaction. This is the Law of Conservation of Mass.","Law of Conservation of Mass"),
  ("Joseph Proust then found that a compound always contains its elements in a fixed ratio by mass, whatever its source. Water is always hydrogen : oxygen = 1 : 8, so 9 g of water gives 1 g of hydrogen and 8 g of oxygen.","Law of Constant Proportions, H : O = 1 : 8"),
  ("Ancient Indian and other civilisations found that heating cinnabar, called hingula in India, gives mercury and sulfur in about 86.22 percent and 13.78 percent, the same ratio every time.","cinnabar: Hg 86.22 %, S 13.78 %"),
  ("John Dalton explained both laws in 1808: all matter is made of tiny atoms, atoms cannot be created or destroyed in a reaction, and atoms of one element are identical in mass and chemical properties.","Dalton's atomic theory"),
  ("Atoms of different elements differ in mass and properties, they combine in simple whole-number ratios to form compounds, and the kinds and numbers of atoms in a given compound are constant.","atoms combine in whole-number ratios"),
  ("So in a reaction atoms only rearrange. When magnesium burns, magnesium atoms join oxygen atoms to give magnesium oxide, and no atom is lost.","atoms rearrange, not destroyed")],
 ("In a group activity, 4.0 g of calcium carbonate reacts with 2.92 g of hydrochloric acid in a closed container. Afterwards there are 1.76 g of carbon dioxide, 0.72 g of water and 4.44 g of calcium chloride. Is the Law of Conservation of Mass obeyed? Then: if sodium and chlorine combine in the mass ratio 23 : 35.5, how much chlorine is needed for 11.5 g of sodium?",
  [("Total mass of reactants = 4.0 g + 2.92 g = 6.92 g.","Add the masses of everything you started with."),
   ("Total mass of products = 1.76 g + 0.72 g + 4.44 g = 6.92 g.","Add the masses of everything formed."),
   ("Reactants = products, so the Law of Conservation of Mass is obeyed.","The totals match."),
   ("For the second part, 23 g of sodium needs 35.5 g of chlorine, so 1 g of sodium needs 35.5 / 23 g.","Use the fixed ratio of the Law of Constant Proportions."),
   ("11.5 g of sodium needs (35.5 / 23) x 11.5 = 17.75 g of chlorine.","Multiply the ratio by the mass of sodium you have.")]),
 ("Explain why the open flask and the balloon set-up gave different readings, and which law the balloon set-up supports.",
  ["Gas carbon dioxide escapes from the open flask so its reading falls","In the balloon set-up the gas is trapped so mass stays the same","This supports the Law of Conservation of Mass"],
  ["Thinking mass was destroyed in the open flask","Thinking the law applies only to reactions that do not make a gas"]),
 ["Mass is neither created nor destroyed in a chemical reaction (Lavoisier, 1789).","A compound has its elements in a fixed ratio by mass, for example water has H : O = 1 : 8 (Proust).","Dalton's atomic theory explains both laws: atoms only rearrange, and combine in simple whole-number ratios.","If a gas escapes, the reading falls, but the total mass of everything is still conserved."],
 [mcq("a-1",1,"Who stated the Law of Conservation of Mass in 1789?","Antoine Lavoisier",[("Joseph Proust","Proust is known for the Law of Definite Proportions."),("John Dalton","Dalton proposed the atomic theory in 1808.")],"Lavoisier is called the Father of Modern Chemistry and proposed this law."),
  mcq("a-2",1,"In set-up 1 of Activity 9.2 the final reading was lower mainly because","carbon dioxide gas escaped from the open flask",[("mass was destroyed in the reaction","Mass is never destroyed in a chemical reaction."),("the balance stopped working","The balance is fine; the gas simply left the flask.")],"Gas escaping into the air explains the lower reading."),
  tf("a-3",1,"The Law of Conservation of Mass applies to every chemical reaction.",True,"Lavoisier's law holds for all chemical reactions."),
  num("a-4",2,"12 g of carbon combines with 32 g of oxygen. How many grams of carbon dioxide are formed?",44,"12 + 32 = 44 g.",[(20,"You subtracted instead of adding."),(384,"You multiplied; masses of reactants are added.")],"g"),
  num("a-5",2,"Water has hydrogen and oxygen in the mass ratio 1 : 8. How many grams of oxygen are in 36 g of water?",32,"36 g splits into 9 parts: 4 g hydrogen and 32 g oxygen.",[(8,"That would be oxygen in 9 g of water."),(4,"That is the hydrogen in 36 g of water.")],"g"),
  mcq("a-6",2,"Which is NOT a postulate of Dalton's atomic theory?","Atoms of the same element can have different chemical properties",[("Atoms cannot be created or destroyed in a chemical reaction","This is a Dalton postulate."),("Atoms combine in the ratio of simple whole numbers to form compounds","This is a Dalton postulate."),("Atoms of different elements have different masses and properties","This is a Dalton postulate.")],"Dalton said atoms of a given element are identical in mass and chemical properties."),
  num("a-7",3,"12 g of carbon gives 44 g of carbon dioxide. How many grams of carbon dioxide come from 2.4 g of carbon?",8.8,"(44 / 12) x 2.4 = 8.8 g.",[(6.4,"That is the mass of oxygen used, not of carbon dioxide formed."),(26.4,"You multiplied 44/12 by 7.2 instead of 2.4.")],"g"),
  short("a-8",3,"Name the scientist who proposed the Law of Definite Proportions (one word).",["proust","joseph proust","louis proust"],"Joseph Louis Proust showed that compounds contain elements in fixed ratios by mass."),
  tf("a-9",3,"Water from a river and water from the sea, once purified, contain hydrogen and oxygen in different mass ratios.",False,"Pure water always has H : O = 1 : 8 by mass.")])
