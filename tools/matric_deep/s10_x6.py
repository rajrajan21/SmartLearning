from lib import *
from bx import *
C=10;S='science';CH='optics'
lf=svg(560,280,DEF+title(560,'Lens formula, magnification and power')
 +box(20,50,250,60,'#fcf3cf',['Lens formula','1/f = 1/v - 1/u'],15)
 +box(290,50,250,60,'#d5f5e3',['Magnification m = h\'/h = v/u','m > 1 enlarged, m < 1 diminished'],12)
 +box(20,135,250,60,'#d6eaf8',['Power P = 1/f (f in metre)','unit dioptre D, 1 D = 1 per metre'],12)
 +box(290,135,250,60,'#fadbd8',['Lens maker: 1/f = (mu-1)(1/R1 - 1/R2)','thin lenses only'],12)
 +'<text x="280" y="225" text-anchor="middle" font-size="13">Convex lens: f and P positive. Concave lens: f and P negative.</text>'
 +'<text x="280" y="250" text-anchor="middle" font-size="13">Object on left; distances along the incident light are positive.</text>')
lesson(C,S,CH,'lens-formula-and-power',"Lens formula, magnification and power","Choosing spectacles",
"An optician says your glasses are +2 D, while your friend's are -1.5 D. Those numbers are the power of the lenses, and they tell the optician at once whether the lens is convex or concave and how strongly it bends light.",
["The lens formula relates the object distance u, the image distance v and the focal length f of a lens: 1/f = 1/v - 1/u. @ lens formula",
 "It is applicable to both convex and concave lenses, but you must take great care with the signs of the quantities. @ signs",
 "Cartesian sign convention: the object is always placed on the left of the lens, and all distances are measured from the optical centre. @ cartesian convention",
 "Distances measured in the direction of the incident light are positive and those against it are negative; heights measured upward and perpendicular to the principal axis are positive, downward negative. @ positive and negative",
 "Magnification m is the ratio of the height of the image to the height of the object, m = h'/h, and it is also equal to v/u. @ magnification",
 "If m is greater than 1 the image is enlarged, and if m is less than 1 the image is diminished. @ meaning of m",
 "The power of a lens is its ability to converge or diverge light rays, and it is the reciprocal of the focal length, P = 1/f. @ power",
 "The SI unit of power is the dioptre, D; when f is in metre, P is in D, so 1 D is the power of a lens of focal length 1 metre. @ dioptre",
 "By convention a convex lens has positive power and a concave lens has negative power. @ sign of power",
 "The lens maker's formula 1/f = (mu - 1)(1/R1 - 1/R2) connects the focal length with the refractive index mu and the radii of curvature R1 and R2 of the two faces. @ lens maker's formula",
 "The lens formula and lens maker's formula hold only for thin lenses; thick lenses need small modifications. @ thin lenses",
 "A convex lens is thicker in the middle, converging, forms mostly real images and corrects hypermetropia; a concave lens is thinner in the middle, diverging, forms virtual images and corrects myopia. @ convex and concave"],
("A convex lens has focal length 20 cm. An object is placed 30 cm in front. Find the image distance and the power.",
 [("Object on the left, so u = -30 cm; f = +20 cm for a convex lens.","Apply the sign convention."),
  ("1/v = 1/f + 1/u = 1/20 - 1/30 = (3 - 2)/60 = 1/60, so v = +60 cm.","Positive v means a real image on the other side."),
  ("m = v/u = 60 / (-30) = -2, so the image is real, inverted and twice as large.","Negative m means inverted."),
  ("Power P = 1/f = 1/0.20 = +5 D.","Use f in metre.")]),
("Explain the sign convention and define the power of a lens with its unit.",
 ["Object on the left, distances from optical centre","P = 1/f in dioptre","Convex positive, concave negative"],
 ["Using f in centimetre when finding power","Forgetting that u is negative"]),
["Lens formula 1/f = 1/v - 1/u; magnification m = v/u = h'/h.","Power P = 1/f in dioptre; convex positive, concave negative.","Object distance u is negative with the Cartesian convention.","Lens maker's formula: 1/f = (mu-1)(1/R1 - 1/R2)."],
["n|Power in dioptre of a lens of focal length 0.5 m is|2|P = 1/0.5.",
 "n|Focal length in cm of a lens of power +4 D is|25|f = 1/4 m = 25 cm.",
 "m|The lens formula is|1/f = 1/v - 1/u|1/f = 1/v + 1/u~That is the mirror formula.;f = u + v~Not a formula in the text.;1/f = u - v~Not correct.|It relates f, u and v.",
 "t|The power of a concave lens is negative.|True|By convention, concave lenses have negative power.",
 "s|The SI unit of power of a lens is the ____.|dioptre|1 D = 1 per metre.",
 "m|Magnification of a lens is|v/u|u/v~That is inverted.;f/v~Not the definition.;h x h'~Not the ratio.|m = h'/h = v/u.",
 "t|The lens formula applies to thick lenses without any change.|False|It holds for thin lenses; thick lenses need modifications.",
 "n|A lens has f = 25 cm. Object at u = -50 cm. Image distance v in cm is|50|1/v = 1/25 - 1/50 = 1/50.",
 "m|Which lens corrects myopia?|concave|convex~That corrects hypermetropia.;plane~A plane lens has no power.;thick convex~That is also converging.|A concave lens diverges rays.",
 "m|If m = -2 the image is|real, inverted and enlarged|virtual and erect~A virtual erect image has positive m.;real and diminished~|m| = 2 is enlarged.;virtual and diminished~|m| = 2 is enlarged.|Negative m means inverted."],
svg=(lf,"Lens formula, magnification, power and lens maker's formula","Lens formula and power"))
