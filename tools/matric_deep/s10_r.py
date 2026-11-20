from lib import *
C=10;S='science';O='optics'
d1=svg(600,260,'<text x="300" y="22" text-anchor="middle" font-weight="bold">Refraction, dispersion and scattering</text>'
 '<rect x="20" y="130" width="260" height="110" fill="#d6eaf8" stroke="#333"/><text x="30" y="228" font-size="13">Denser medium (glass)</text><text x="30" y="150" font-size="13" fill="#555">Rarer medium (air) above</text>'
 '<line x1="150" y1="40" x2="150" y2="240" stroke="#999" stroke-dasharray="5,4"/><text x="156" y="48" font-size="12">normal</text>'
 '<line x1="60" y1="45" x2="150" y2="130" stroke="#c0392b" stroke-width="3"/><line x1="150" y1="130" x2="190" y2="235" stroke="#1f618d" stroke-width="3"/>'
 '<text x="92" y="105" font-size="13">i</text><text x="160" y="190" font-size="13">r</text><text x="150" y="256" font-size="12" text-anchor="middle">sin i / sin r = n2 / n1</text>'
 '<polygon points="340,200 400,100 460,200" fill="#eaf2f8" stroke="#333"/><line x1="300" y1="150" x2="365" y2="150" stroke="#444" stroke-width="3"/>'
 '<line x1="420" y1="165" x2="560" y2="200" stroke="#8e44ad" stroke-width="2"/><line x1="420" y1="165" x2="560" y2="180" stroke="#2980b9" stroke-width="2"/><line x1="420" y1="165" x2="560" y2="160" stroke="#27ae60" stroke-width="2"/><line x1="420" y1="165" x2="560" y2="140" stroke="#f1c40f" stroke-width="2"/><line x1="420" y1="165" x2="560" y2="120" stroke="#e74c3c" stroke-width="2"/>'
 '<text x="565" y="203" font-size="12">Violet</text><text x="565" y="123" font-size="12">Red</text><text x="400" y="228" text-anchor="middle" font-size="13">Prism: white light splits</text>')
lesson(C,S,O,'refraction-dispersion-and-scattering',"Refraction, dispersion and scattering of light","Why is the sky blue?",
"On a clear day the sky is blue but at sunset the Sun turns red. A glass prism turns white light into a rainbow band. All of this is explained by how light bends and scatters when it meets matter.",
["When light travels obliquely from one transparent medium into another it changes direction; this bending is called refraction and it happens because the speed of light is different in the two media. @ refraction",
 "Light is faster in a rarer medium and slower in a denser medium, and when it goes from a denser to a rarer medium it bends away from the normal. @ denser to rarer",
 "The first law of refraction says that the incident ray, the refracted ray and the normal all lie in the same plane. @ first law",
 "The second law, Snell's law, says that sin i divided by sin r is equal to the ratio of the refractive indices of the two media. @ Snell's law",
 "The refractive index of a medium is n = c / v, the speed of light in vacuum divided by its speed in the medium, so a high n means slow light. @ n = c / v",
 "White light is a composite light; when it passes through a prism it splits into the seven colours VIBGYOR, a band called the spectrum, and this is dispersion. @ dispersion",
 "Dispersion happens because each colour has a different refractive index: red bends the least and violet bends the most. @ red least, violet most",
 "Scattering is the redirection of light in all directions by atoms, molecules or particles of the medium called scatterers. @ scattering",
 "Rayleigh's law says the amount of scattering is inversely proportional to the fourth power of the wavelength, so blue scatters much more than red and the sky looks blue. @ S proportional to 1/wavelength^4",
 "At sunrise and sunset the sunlight travels a longer path, most of the blue is scattered away and the red reaches us, so the Sun looks red; large scatterers like dust and water droplets cause Mie scattering, which does not depend on wavelength, so clouds look white. @ red sun and white clouds"],
("The speed of light in vacuum is 3 x 10^8 m/s and in glass it is 2 x 10^8 m/s. Find the refractive index of glass. A ray in air strikes the glass at i = 30 degrees; find the angle of refraction.",[("n = c / v = (3 x 10^8) / (2 x 10^8) = 1.5.","Refractive index has no unit."),("Snell's law from air (n = 1) to glass: sin i / sin r = 1.5 / 1.","Ratio of the indices."),("sin r = sin 30 / 1.5 = 0.5 / 1.5 = 0.333, so r is about 19.5 degrees.","The ray bends towards the normal because glass is denser."),("Since r is smaller than i, the ray moved towards the normal.","Rarer to denser.")]),
("Explain why the sky is blue and the setting Sun is red.",["Rayleigh scattering is inversely proportional to the fourth power of the wavelength","Blue has a shorter wavelength so it is scattered more","At sunset the light travels a longer path, blue is scattered away and red reaches us"],["Blue light is created in the sky","The sky reflects the colour of the sea"]),
["n = c / v; light bends towards the normal entering a denser medium.","Snell's law: sin i / sin r = n2 / n1.","Dispersion gives VIBGYOR: red bends least, violet most.","Rayleigh: scattering is proportional to 1 / wavelength to the power 4, hence the blue sky and red sunset."],
["m|A ray of light travelling from air into glass bends|towards the normal|away from the normal~That happens going from denser to rarer;along the normal~It bends only when it enters obliquely;it does not bend~Obliquely incident light does bend|Glass is denser, so the light slows down and bends towards the normal.",
 "n|Refractive index of a medium in which light travels at 1.5 x 10^8 m/s (c = 3 x 10^8 m/s)|2|n = c / v = 3 / 1.5.",
 "t|Red light bends more than violet light when passing through a prism.|False|Violet has the larger refractive index and bends the most.",
 "m|The sky appears blue because|blue light is scattered the most|red light is absorbed completely~Red reaches us at sunset;the sky reflects the sea~The sea is blue for a similar reason, not the cause;blue light travels faster in air~Speed is not the reason|Shorter wavelength means stronger Rayleigh scattering.",
 "m|Rayleigh scattering is proportional to|1 / wavelength to the power 4|wavelength to the power 4~That would scatter red the most;1 / wavelength~Too weak a dependence;wavelength squared~Wrong direction|Shorter wavelengths scatter far more.",
 "t|Clouds look white because the scatterers are larger than the wavelength (Mie scattering).|True|Mie scattering does not depend on wavelength, so all colours scatter equally.",
 "n|Number of colours in the spectrum VIBGYOR|7|Violet, indigo, blue, green, yellow, orange, red.",
 "m|When a ray goes from a denser to a rarer medium the angle of refraction is|greater than the angle of incidence|less than the angle of incidence~That is rarer to denser;equal to it~Only at normal incidence;always zero~Only at normal incidence|The ray bends away from the normal.",
 "n|Sine of the angle of refraction for i = 30 degrees in glass of n = 1.5 (round to 2 decimals)|0.33|sin r = 0.5 / 1.5.",
 "s|The splitting of white light into its colours is called ____.|dispersion|Each colour has a different refractive index."],
svg=(d1,"A ray bending at a glass surface and a prism splitting white light into a spectrum","Refraction and dispersion"))
d2=svg(620,260,'<text x="310" y="22" text-anchor="middle" font-weight="bold">Human eye and its defects</text>'
 '<ellipse cx="110" cy="130" rx="85" ry="70" fill="#fdfefe" stroke="#333"/><path d="M40,95 Q25,130 40,165" fill="none" stroke="#1f618d" stroke-width="3"/><ellipse cx="62" cy="130" rx="8" ry="22" fill="#aed6f1" stroke="#333"/><path d="M170,80 Q200,130 170,180" fill="none" stroke="#c0392b" stroke-width="3"/><text x="110" y="132" text-anchor="middle" font-size="12">eyeball</text><text x="62" y="210" text-anchor="middle" font-size="12">lens</text><text x="180" y="208" font-size="12" fill="#c0392b">retina</text>'
 '<text x="230" y="60" font-size="14" font-weight="bold">Myopia (short sight)</text><text x="230" y="82" font-size="13">near clear, far blurred</text><text x="230" y="102" font-size="13">image falls in front of retina</text><text x="230" y="122" font-size="13">corrected with a concave lens</text>'
 '<text x="230" y="160" font-size="14" font-weight="bold">Hypermetropia (long sight)</text><text x="230" y="182" font-size="13">far clear, near blurred</text><text x="230" y="202" font-size="13">image falls behind the retina</text><text x="230" y="222" font-size="13">corrected with a convex lens</text>'
 '<text x="470" y="60" font-size="13">Normal eye</text><text x="470" y="80" font-size="13">near point 25 cm</text><text x="470" y="100" font-size="13">far point infinity</text>')
lesson(C,S,O,'human-eye-defects-and-correction',"The human eye, its defects and their correction","The girl who could not read the board",
"A girl in the last bench could read her book easily but could not read the blackboard, while her grandfather could read the board but needed to hold his newspaper far away. Both have a defect of vision, but of opposite kinds.",
["The eyeball is nearly spherical, about 2.3 cm across, and the tough outer membrane is the sclera. @ eyeball",
 "Light enters through the transparent cornea, which is the main refracting surface, then passes through the pupil, whose size is controlled by the coloured iris. @ cornea, iris, pupil",
 "The convex eye lens focuses a real and inverted image on the retina, and the optic nerve carries the signal to the brain, which sees it erect. @ retina and brain",
 "The ability of the eye to focus both near and far objects is the power of accommodation, done by the ciliary muscles changing the focal length of the lens. @ accommodation",
 "To see a distant object the ciliary muscles relax and the lens becomes thinner; for a near object they contract and the lens becomes thicker. @ ciliary muscles",
 "A normal eye sees clearly between the near point at 25 cm and the far point at infinity. @ near point 25 cm",
 "Persistence of vision means that two light pulses less than one second apart cannot be seen separately, which is why a film appears to move. @ persistence of vision",
 "In myopia the eyeball is too long, the far point comes closer and the image of distant objects forms in front of the retina; a concave lens corrects it. @ myopia",
 "In hypermetropia the eyeball is too short, the near point moves farther and the image of near objects forms behind the retina; a convex lens corrects it. @ hypermetropia",
 "The power of a lens in dioptre is 1 divided by its focal length in metre, positive for convex and negative for concave lenses. @ power in dioptre"],
("A hypermetropic person has a near point at 50 cm and wants to read a book kept at 25 cm. Find the focal length and the power of the lens needed.",[("The lens must form a virtual image of the book at the person's near point. So u = -25 cm and v = -50 cm.","Sign convention: both on the object side."),("Use 1/f = 1/v - 1/u = -1/50 + 1/25 = 1/50.","Lens formula."),("So f = +50 cm = +0.5 m, a convex lens.","Positive f means convex."),("Power P = 1 / f = 1 / 0.5 = +2 dioptre.","Power in dioptre.")]),
("Compare myopia and hypermetropia: cause, what is seen clearly, and the lens used.",["Myopia: eyeball too long, near clear, concave lens","Hypermetropia: eyeball too short, far clear, convex lens","Accommodation is done by the ciliary muscles"],["Myopia is corrected by a convex lens","Both defects blur the same distance"]),
["Normal near point 25 cm and far point infinity.","Myopia: concave lens; hypermetropia: convex lens.","Ciliary muscles change the focal length of the lens (accommodation).","P = 1 / f (f in metre) in dioptre."],
["m|Short sightedness (myopia) is corrected using a|concave lens|convex lens~That corrects long sightedness;plane mirror~It does not change the focus;cylindrical lens~That is for astigmatism|A concave lens diverges the rays so the image falls on the retina.",
 "n|Near point in cm of a normal human eye|25|Least distance of distinct vision.",
 "t|In hypermetropia the image of a near object forms behind the retina.|True|The eyeball is too short or the lens is too weak.",
 "m|The part of the eye that controls the amount of light entering is the|iris|cornea~It refracts the light;retina~It receives the image;sclera~It is the outer protective layer|The iris changes the size of the pupil.",
 "n|Power in dioptre of a convex lens of focal length 50 cm|2|P = 1 / 0.5 m.",
 "n|Power in dioptre of a concave lens of focal length -25 cm (give the magnitude)|4|1 / 0.25 = 4 D, negative sign for concave.",
 "m|To see a distant object the ciliary muscles|relax and the lens becomes thinner|contract and the lens becomes thicker~That is for near objects;relax and the lens becomes thicker~Relaxing thins the lens;contract and the lens becomes thinner~Contracting thickens it|A thinner lens has a longer focal length.",
 "t|The image formed on the retina is real and inverted.|True|The brain interprets it as erect.",
 "m|The far point of a normal eye is|infinity|25 cm~That is the near point;2.5 m~Not the standard value;1 m~Not the standard value|A normal eye sees very distant objects clearly.",
 "s|The ability of the eye lens to focus near and distant objects is called power of ____.|accommodation|Ciliary muscles change the focal length."],
svg=(d2,"Diagram of the eye with the lens and retina and a list of myopia and hypermetropia features","The human eye and its defects"))
print('ok')
