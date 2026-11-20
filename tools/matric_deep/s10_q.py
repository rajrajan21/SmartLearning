from lib import *
C=10;S='science'
g=svg(600,270,'<text x="300" y="22" text-anchor="middle" font-weight="bold">Gravitation and apparent weight</text>'
 '<circle cx="90" cy="110" r="26" fill="#aed6f1" stroke="#333"/><text x="90" y="115" text-anchor="middle">m1</text>'
 '<circle cx="250" cy="110" r="38" fill="#f9e79f" stroke="#333"/><text x="250" y="115" text-anchor="middle">m2</text>'
 '<line x1="118" y1="110" x2="170" y2="110" stroke="#c0392b" stroke-width="3"/><line x1="212" y1="110" x2="165" y2="110" stroke="#c0392b" stroke-width="3"/>'
 '<text x="170" y="150" text-anchor="middle" font-size="14">distance r</text><text x="170" y="180" text-anchor="middle" font-size="15">F = G m1 m2 / r^2</text>'
 '<text x="170" y="204" text-anchor="middle" font-size="14">g = GM / R^2 = 9.8 m/s^2</text><text x="170" y="228" text-anchor="middle" font-size="13">Moon g = 1.625 m/s^2</text>'
 '<rect x="360" y="45" width="110" height="170" fill="none" stroke="#333"/><text x="415" y="62" text-anchor="middle" font-size="13">Lift</text>'
 '<circle cx="415" cy="125" r="12" fill="#f5b7b1" stroke="#333"/><line x1="415" y1="137" x2="415" y2="175" stroke="#333" stroke-width="3"/>'
 '<line x1="415" y1="150" x2="415" y2="200" stroke="#1f618d" stroke-width="3"/><text x="428" y="196" font-size="12">mg</text><text x="378" y="200" font-size="12" fill="#1f618d">R</text>'
 '<text x="485" y="85" font-size="13">At rest: R = mg</text><text x="485" y="110" font-size="13">Up, accel a: R = m(g+a)</text><text x="485" y="135" font-size="13">Down, accel a: R = m(g-a)</text><text x="485" y="160" font-size="13">Free fall: R = 0</text><text x="485" y="185" font-size="13">(weightless)</text>')
lesson(C,S,'laws-of-motion','gravitation-mass-weight-and-apparent-weight',"Gravitation, mass, weight and apparent weight","The apple and the Moon",
"Newton wondered why an apple falls to the ground but the Moon does not fall onto the Earth. He realised that the same pull, gravitation, acts on both, and that this pull depends on the masses and the distance between them.",
["Newton's universal law of gravitation says that every particle of matter attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between their centres. @ universal law",
 "In symbols F = G m1 m2 / r squared, where G is the universal gravitational constant, 6.674 times 10 to the power minus 11 N m squared per kg squared. @ F = G m1 m2 / r2",
 "The force is always attractive, acts along the line joining the masses and does not depend on the medium between them. @ always attractive",
 "For a body of mass m on the Earth the force is G M m / R squared, and by Newton's second law it is also m g, so g = G M / R squared. @ g = GM / R2",
 "The mean value of g on the Earth is 9.8 metre per second squared, which means a freely falling body gains 9.8 m/s of velocity every second. @ g = 9.8",
 "Since g depends on the radius, it is greatest at the poles, least at the equator, decreases with height and depth and is zero at the centre of the Earth. @ variation of g",
 "From g, R and G we can find the mass of the Earth, M = g R squared / G, which is about 5.972 times 10 to the power 24 kilogram. @ mass of the Earth",
 "Mass is the quantity of matter and never changes; weight is the gravitational force W = m g, a vector pointing towards the centre of the Earth, measured in newton. @ mass and weight",
 "A 60 kg person weighs 588 N on the Earth but only 97.5 N on the Moon, where g is 1.625, while the mass stays 60 kg. @ weight on the Moon",
 "Apparent weight is the reaction force R of the surface: in a lift it is mg at rest, m(g + a) when accelerating upwards, m(g - a) when accelerating downwards and zero in free fall, which we call weightlessness. @ apparent weight"],
("A person of mass 60 kg stands in a lift. Find the apparent weight when the lift accelerates upwards at 2 m/s2 and downwards at 2 m/s2. Take g = 9.8 m/s2.",[("Weight at rest is mg = 60 x 9.8 = 588 N.","This is the true weight."),("Upward acceleration: R = m(g + a) = 60 x (9.8 + 2) = 708 N.","The floor pushes harder, so he feels heavier."),("Downward acceleration: R = m(g - a) = 60 x (9.8 - 2) = 468 N.","The floor pushes less, so he feels lighter."),("If the cable breaks, a = g and R = 60 x (9.8 - 9.8) = 0, so he is weightless.","Free fall.")]),
("Explain the difference between mass and weight and why a person feels lighter when a lift starts to move down.",["Mass is the quantity of matter and is constant, weight is the force mg and changes with g","Apparent weight is the reaction R of the floor","When the lift accelerates down R = m(g - a), which is less than mg"],["Mass and weight are the same thing","Weight is zero on the Moon"]),
["F = G m1 m2 / r squared and g = G M / R squared.","g is 9.8 m/s2 on Earth and 1.625 m/s2 on the Moon.","Mass is constant; weight = mg changes with place.","Apparent weight R = m(g + a) going up and m(g - a) coming down; free fall gives weightlessness."],
["m|If the distance between two masses is doubled, the gravitational force between them becomes|one quarter|double~Force falls when distance grows;half~That would be an inverse law, not inverse square;four times~That would happen if the distance were halved|F is proportional to 1 / r squared, so doubling r divides F by 4.",
 "n|Weight in newton of a 50 kg body on the Earth (take g = 10 m/s2)|500|W = m g = 50 x 10.",
 "t|The mass of a body is different on the Moon than on the Earth.|False|Mass is the quantity of matter and does not change; only the weight changes.",
 "m|The value of g is maximum at the|poles|equator~The Earth bulges there, so g is least;centre of the Earth~g is zero there;top of a mountain~g decreases with height|The radius is smallest at the poles.",
 "n|Weight in newton of a 60 kg person on the Moon (g = 1.625), rounded to the nearest whole number|98|60 x 1.625 = 97.5, which is about 98 N.",
 "n|Apparent weight in newton of a 60 kg person in a lift accelerating upward at 2 m/s2 (g = 9.8)|708|R = m(g + a) = 60 x 11.8.",
 "n|Apparent weight in newton of a 60 kg person in a lift accelerating downward at 2 m/s2 (g = 9.8)|468|R = m(g - a) = 60 x 7.8.",
 "m|A person is weightless in a freely falling lift because|the reaction R becomes zero|gravity disappears~Gravity still acts on the body;the mass becomes zero~Mass never changes;the lift stops~Free fall is accelerated motion|When a = g, R = m(g - g) = 0.",
 "t|The gravitational force between two masses depends on the medium between them.|False|The force is the same in any medium.",
 "s|The SI unit of weight is ____.|newton / N|Weight is a force, so it is measured in newton."],
svg=(g,"Two masses attracting each other with the formula, and a person in a lift with the apparent weight in four cases","Gravitation and apparent weight"))
print('ok')
