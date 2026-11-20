from lib import *
C=10;S='maths'
fr=svg(560,260,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Frustum of a cone</text>'
 '<polygon points="170,70 330,70 370,190 130,190" fill="#d6eaf8" stroke="#333" stroke-width="2"/>'
 '<ellipse cx="250" cy="70" rx="80" ry="10" fill="#aed6f1" stroke="#333"/><ellipse cx="250" cy="190" rx="120" ry="14" fill="#85c1e9" stroke="#333"/>'
 '<line x1="250" y1="70" x2="330" y2="70" stroke="#c0392b" stroke-dasharray="4"/><text x="290" y="62" font-size="13" fill="#c0392b">r</text>'
 '<line x1="250" y1="190" x2="370" y2="190" stroke="#c0392b" stroke-dasharray="4"/><text x="315" y="208" font-size="13" fill="#c0392b">R</text>'
 '<line x1="250" y1="70" x2="250" y2="190" stroke="#1e8449" stroke-dasharray="4"/><text x="256" y="135" font-size="13" fill="#1e8449">h</text><text x="360" y="130" font-size="13" fill="#6c3483">l</text>'
 '<text x="400" y="90" font-size="13">l = sqrt(h^2 + (R - r)^2)</text><text x="400" y="115" font-size="13">CSA = pi (R + r) l</text><text x="400" y="140" font-size="13">TSA = CSA + pi R^2 + pi r^2</text><text x="400" y="165" font-size="13">V = (pi h / 3)(R^2 + Rr + r^2)</text>')
cs=svg(560,250,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Combined solids: add the visible surfaces</text>'
 '<rect x="40" y="90" width="80" height="90" fill="#d6eaf8" stroke="#333"/><path d="M40 90 A40 40 0 0 1 120 90" fill="#aed6f1" stroke="#333"/><text x="80" y="210" text-anchor="middle" font-size="12">cylinder + hemisphere</text>'
 '<polygon points="230,60 190,150 270,150" fill="#fadbd8" stroke="#333"/><path d="M190 150 A40 40 0 0 0 270 150" fill="#f5b7b1" stroke="#333"/><text x="230" y="210" text-anchor="middle" font-size="12">cone + hemisphere</text>'
 '<rect x="340" y="110" width="90" height="70" fill="#d5f5e3" stroke="#333"/><path d="M340 110 A45 40 0 0 1 430 110" fill="#a9dfbf" stroke="#333"/><text x="385" y="210" text-anchor="middle" font-size="12">cuboid + half cylinder</text>'
 '<text x="280" y="236" text-anchor="middle" font-size="13">Surface: only visible parts. Volume: sum of volumes.</text>')
cv=svg(560,240,'<text x="280" y="22" text-anchor="middle" font-weight="bold">Coefficient of variation compares consistency</text>'
 '<rect x="20" y="45" width="250" height="110" rx="10" fill="#d6eaf8" stroke="#333"/><text x="145" y="72" text-anchor="middle" font-size="14" font-weight="bold">C.V. = (SD / mean) x 100 %</text><text x="145" y="98" text-anchor="middle" font-size="12">no units, so any two data sets can be compared</text><text x="145" y="120" text-anchor="middle" font-size="12">SD of 1.5 kg versus SD of Rs 21.60:</text><text x="145" y="138" text-anchor="middle" font-size="12">compare their C.V.</text>'
 '<rect x="290" y="45" width="250" height="110" rx="10" fill="#d5f5e3" stroke="#333"/><text x="415" y="72" text-anchor="middle" font-size="14" font-weight="bold">Smaller C.V. = more consistent</text><text x="415" y="98" text-anchor="middle" font-size="12">Heights: 5.48 %</text><text x="415" y="118" text-anchor="middle" font-size="12">Weights: 11.40 %</text><text x="415" y="138" text-anchor="middle" font-size="12">Heights are more consistent</text>'
 '<text x="280" y="195" text-anchor="middle" font-size="13">Idea suggested by Karl Pearson</text>')

lesson(C,S,'mensuration','frustum-of-a-cone',"Frustum of a cone: surface area and volume","The fire bucket",
"Glasses, buckets and street cones are not exact cones: their tops are cut off. A cone with its top sliced off by a plane parallel to the base is called a frustum.",
["A frustum is the part of a cone between its base and a plane parallel to the base. @ frustum",
 "Let R be the radius of the larger base, r the radius of the top, h the height and l the slant height of the frustum. @ notation",
 "The slant height is the square root of h squared plus (R minus r) squared. @ slant height",
 "The curved surface area is pi times (R plus r) times l. @ curved surface area",
 "The total surface area adds the two circular ends: pi (R plus r) l plus pi R squared plus pi r squared. @ total surface area",
 "The volume is the difference of two cones; using similar triangles it becomes pi h over 3 times (R squared plus R r plus r squared). @ volume"],
("A bucket in the shape of a frustum has top diameter 10 m, bottom diameter 4 m and height 4 m. Find its curved and total surface areas.",[("R = 5 m, r = 2 m, h = 4 m. Slant height l = sqrt(4^2 + (5-2)^2) = sqrt(25) = 5 m.","The 3-4-5 triangle."),("CSA = pi (R + r) l = 22/7 x 7 x 5 = 110 sq. m.","(5 + 2) = 7."),("TSA = 110 + pi (25 + 4) = 110 + 22/7 x 29 = 110 + 91.14.","Add both circular ends."),("TSA is about 201.14 sq. m.","Rounded to two decimals.")]),
("Find the volume of a frustum of height 45 cm with radii 28 cm and 7 cm.",["V = (pi h / 3)(R^2 + Rr + r^2)","R^2 + Rr + r^2 = 784 + 196 + 49 = 1029","V = 1/3 x 22/7 x 1029 x 45 = 48510 cu. cm"],["Using the cone volume formula directly"]),
["Frustum: cone with the top cut parallel to the base.","l = sqrt(h^2 + (R-r)^2).","CSA = pi (R + r) l.","V = pi h (R^2 + Rr + r^2) / 3."],
["n|Slant height of a frustum with h = 8, R = 10 and r = 4 (cm)|10|sqrt(64 + 36) = 10.",
 "n|CSA (sq. cm) of a frustum with R = 10, r = 4 and l = 10 (use 22/7)|440|22/7 x 14 x 10.",
 "t|The two circular ends are included in the curved surface area of a frustum.|False|They are added only for TSA.",
 "n|Volume (cu. cm) of a frustum with h = 3, R = 4, r = 2 (use 22/7)|88|(22/7 x 3 / 3) x 28.",
 "m|A frustum is obtained when a cone is cut by a plane|parallel to its base|perpendicular to its base~Gives a triangle;through the vertex~Gives a triangle;through the slant height only~Not a frustum|The part between the plane and the base is the frustum.",
 "n|CSA (sq. cm) with slant height 5, radii 4 and 1 (use 22/7, nearest whole)|79|22/7 x 5 x 5 = 78.57.",
 "m|Which everyday object is a frustum?|a bucket|a ball~Sphere;a pencil~Cylinder;a dice~Cube|It has circular ends of different size.",
 "n|Slant height when h = 4, R = 5, r = 2|5|sqrt(16 + 9).",
 "t|The volume of a frustum is the difference of two cone volumes.|True|Big cone minus the small cone removed.",
 "s|The ratio used to derive the frustum volume uses ____ triangles.|similar|Triangles ABC and ADE."],
svg=(fr,"A frustum of a cone with R r h and l labelled and its formulas","Frustum of a cone"))

lesson(C,S,'mensuration','combined-solids',"Combined solids","Toy making",
"Toys, tents, capsules and ice-cream cones are made by joining solids. To find their cost or capacity we split them into basic solids.",
["A combined solid is formed by joining two or more basic solids such as cylinder, cone, hemisphere and cuboid. @ combined solid",
 "For surface area, count only the surfaces visible from outside; joined faces are not counted. @ surface area rule",
 "For volume, add the volumes of the parts. @ volume rule",
 "A cylinder surmounted by a hemisphere has total surface area pi r (2h plus 3r), where h is the cylinder height only. @ cylinder with hemisphere",
 "A tent made of a cylinder surmounted by a cone has volume pi r squared (h1 plus h2 over 3). @ tent",
 "For a funnel, the outer surface is the curved surface of the cylinder plus the curved surface of the frustum. @ funnel",
 "When a hemisphere is cut out of a cube, the new surface area is 6 times the edge squared plus pi r squared. @ cube with a hollow"],
("A toy is a cylinder surmounted by a hemisphere. Total height 25 cm and common diameter 12 cm. Find the total surface area.",[("Radius r = 6 cm. Height of the cylinder h = 25 - 6 = 19 cm.","The hemisphere takes 6 cm of the height."),("TSA = CSA of cylinder + CSA of hemisphere + base of cylinder = 2 pi r h + 2 pi r^2 + pi r^2.","= pi r (2h + 3r)."),("= 22/7 x 6 x (38 + 18) = 22/7 x 336.","2h = 38, 3r = 18."),("TSA = 1056 sq. cm.","The answer.")]),
("A tent for 150 people: each needs 4 sq. m of floor and 40 cu. m of air. The cylindrical part is 8 m high. Find the height of the cone.",["Base area = 150 x 4 = 600 sq. m so pi r^2 = 600","Volume needed = 150 x 40 = 6000 cu. m","pi r^2 (h1 + h2/3) = 6000 so 8 + h2/3 = 10","h2/3 = 2 so the cone height is 6 m"],["Treating the tent as only a cylinder"]),
["Surface: only visible parts.","Volume: sum of volumes.","Cylinder + hemisphere: pi r (2h + 3r).","Read heights carefully: total versus part."],
["n|TSA (sq. cm) of a cylinder (r = 6, h = 19) with a hemisphere on top (22/7)|1056|pi r (2h + 3r).",
 "t|For volume of a combined solid we add the volumes of the parts.|True|Volumes are additive.",
 "n|Volume (cu. cm) of a cylinder (r = 3, h = 5) plus a hemisphere (r = 3), use 22/7, nearest whole|198|45 pi + 18 pi = 63 pi.",
 "m|Which surfaces are counted in a combined solid?|only visible surfaces|all surfaces including joints~Joints are hidden;only the base~Incomplete;only the top~Incomplete|Joined faces are internal.",
 "n|Height of the conical part of the tent in the worked example (m)|6|From 8 + h2/3 = 10.",
 "n|Outer surface area of the funnel with R = 12, r = 6, h2 = 12 and slant height 10 (22/7, nearest whole)|1018|pi (144 + 180) = 1018.29.",
 "m|A capsule is made of|a cylinder with two hemispheres|a cone and a cube~Incorrect;two cones~Incorrect;a cuboid only~Incorrect|Cylindrical middle, hemispherical ends.",
 "t|When a hemisphere is removed from a cube face the TSA changes by pi r squared.|True|2 pi r^2 added and pi r^2 removed.",
 "n|Total volume (cu. cm) of a cube of side 4 joined to nothing else (V = a^3)|64|Sanity check for volume.",
 "s|A cylinder with a cone on top is a ____ shape.|tent|Common real life example."],
svg=(cs,"Three combined solids cylinder with hemisphere cone with hemisphere and cuboid with half cylinder","Combined solids"))

lesson(C,S,'statistics-and-probability','coefficient-of-variation',"Coefficient of variation","Whose marks are steadier?",
"Sathya scored 460 and Vidhya 480 marks in five subjects, with standard deviations 4.6 and 2.4. Who is steadier? The standard deviation alone cannot tell us.",
["Standard deviation has units, so SDs of data with different units, such as kg and rupees, cannot be compared directly. @ need for a relative measure",
 "Coefficient of variation is the standard deviation divided by the mean, multiplied by 100 percent. @ definition",
 "It was suggested by Karl Pearson and has no unit. @ Karl Pearson",
 "The data with the smaller coefficient of variation is more consistent or stable. @ interpretation",
 "The data with the larger coefficient of variation is more variable or less consistent. @ variability",
 "For variance data, take the square root first to get the SD. @ variance to SD"],
("Compare the consistency of Sathya (total 460, SD 4.6) and Vidhya (total 480, SD 2.4) over five subjects.",[("Means: Sathya 460/5 = 92; Vidhya 480/5 = 96.","Divide totals by 5."),("C.V. of Sathya = 4.6/92 x 100 = 5%.","SD over mean."),("C.V. of Vidhya = 2.4/96 x 100 = 2.5%.","SD over mean."),("Vidhya has the smaller C.V., so she is more consistent.","The smaller the C.V., the steadier the data.")]),
("The mean and variance of heights are 155 cm and 72.25 cm^2, and of weights 46.5 kg and 28.09 kg^2. Which varies more?",["SD of heights = 8.5, C.V. = 8.5/155 x 100 = 5.48%","SD of weights = 5.3, C.V. = 5.3/46.5 x 100 = 11.40%","Weights vary more; heights are more consistent"],["Comparing SDs of 8.5 and 5.3 directly"]),
["C.V. = (SD / mean) x 100 percent.","Smaller C.V. means more consistent.","C.V. has no units.","Take square root of variance for SD."],
["n|C.V. (percent) when SD is 6.5 and mean is 12.5|52|6.5/12.5 x 100.",
 "n|Mean when SD is 1.2 and C.V. is 25.6 (two decimals)|4.69|1.2/25.6 x 100.",
 "n|SD when mean is 15 and C.V. is 48|7.2|48 x 15 / 100.",
 "t|The data with the smaller coefficient of variation is more consistent.|True|Less relative spread.",
 "n|C.V. (percent) of 24, 26, 33, 37, 29, 31 (nearest whole)|14|Mean 30, SD 4.32.",
 "m|Coefficient of variation is|a relative measure of dispersion|an absolute measure~SD is absolute;a measure of central tendency~Not that;a measure of skewness~Not that|It has no unit.",
 "n|Mean 25.6 and C.V. 18.75 give SD|4.8|18.75 x 25.6 / 100.",
 "m|Marks: Maths mean 56 SD 12, Science 65 and 14, Social 60 and 10. Most consistent is|Social Science|Mathematics~C.V. 21.43;Science~C.V. 21.54;All equal~They differ|Social C.V. is 16.67.",
 "t|C.V. can be used to compare weights in kg with prices in rupees.|True|It is unit free.",
 "s|Coefficient of variation was suggested by Karl ____.|Pearson|A prominent statistician."],
svg=(cv,"Two panels showing the coefficient of variation formula and the interpretation of smaller values","Coefficient of variation"))
print('ok')
