from lib import *
C=10;S='science'
d=svg(620,260,'<text x="310" y="22" text-anchor="middle" font-weight="bold">Fission, chain reaction and fusion</text>'
 '<circle cx="60" cy="110" r="9" fill="#e67e22"/><text x="60" y="95" text-anchor="middle" font-size="12">n</text><line x1="72" y1="110" x2="105" y2="110" stroke="#333" stroke-width="2"/>'
 '<circle cx="140" cy="110" r="30" fill="#aed6f1" stroke="#333"/><text x="140" y="114" text-anchor="middle" font-size="13">U-235</text>'
 '<circle cx="230" cy="70" r="20" fill="#f9e79f" stroke="#333"/><text x="230" y="74" text-anchor="middle" font-size="11">Ba-141</text><circle cx="230" cy="150" r="20" fill="#f5b7b1" stroke="#333"/><text x="230" y="154" text-anchor="middle" font-size="11">Kr-92</text>'
 '<line x1="170" y1="100" x2="210" y2="76" stroke="#333"/><line x1="170" y1="120" x2="210" y2="144" stroke="#333"/><circle cx="270" cy="110" r="7" fill="#e67e22"/><circle cx="270" cy="95" r="7" fill="#e67e22"/><circle cx="270" cy="125" r="7" fill="#e67e22"/><text x="290" y="114" font-size="12">3 neutrons + about 200 MeV</text>'
 '<text x="20" y="200" font-size="14">Chain reaction: 1 -> 3 -> 9 -> 27 neutrons</text><text x="20" y="222" font-size="13">Controlled (reactor): one neutron left per fission</text><text x="20" y="242" font-size="13">Uncontrolled (atom bomb): neutrons multiply freely</text>'
 '<text x="400" y="190" font-size="14" font-weight="bold">Fusion</text><text x="400" y="212" font-size="13">two light nuclei join to form</text><text x="400" y="232" font-size="13">a heavier nucleus (Sun, H-bomb)</text>')
lesson(C,S,'nuclear-physics','nuclear-fission-chain-reaction-and-fusion',"Nuclear fission, chain reaction and nuclear fusion","The discovery of Hahn and Strassmann",
"In 1939 the German scientists Otto Hahn and Fritz Strassmann bombarded uranium with neutrons and were surprised to find that the nucleus split into two nearly equal parts and released a huge amount of energy. This was the discovery of nuclear fission.",
["Nuclear fission is the splitting of a heavy nucleus into two smaller nuclei of comparable mass, releasing a few neutrons and a large amount of energy. @ nuclear fission",
 "For example, U-235 absorbs a neutron and splits into barium-141 and krypton-92 with three neutrons and about 200 MeV, or 3.2 times 10 to the power minus 11 joule, of energy. @ U-235 + n",
 "A fissile material such as U-235 or plutonium-239 undergoes sustained fission on absorbing a neutron, whereas natural uranium is 99.28 percent U-238, which is not fissile. @ fissile material",
 "The three neutrons from one fission can cause three more fissions, then nine, then twenty-seven, and this self-propagating process is called a chain reaction. @ chain reaction",
 "In a controlled chain reaction extra neutrons are absorbed so that only one neutron causes the next fission, and this is used in a nuclear reactor to produce power steadily. @ controlled reaction",
 "In an uncontrolled chain reaction the neutrons multiply in a geometrical progression and release huge energy in a fraction of a second, which is the principle of the atom bomb. @ uncontrolled reaction",
 "Some neutrons leak out or are absorbed by non-fissionable material, so a minimum quantity called the critical mass is needed to sustain the chain reaction. @ critical mass",
 "A mass below the critical mass is subcritical and above it is supercritical; an atom bomb joins two subcritical pieces to make a supercritical mass. @ subcritical and supercritical",
 "In nuclear fusion two lighter nuclei combine to form a heavier nucleus and release energy, as happens in the Sun and in the hydrogen bomb, but it needs extremely high temperature. @ nuclear fusion",
 "In nuclear physics energy is measured in electron volt, 1 eV = 1.602 times 10 to the power minus 19 joule, and 1 MeV is 10 to the power 6 eV. @ electron volt"],
("Find the energy in joule released in one fission if it is 200 MeV. Also, complete the nuclear reactions of an alpha decay of U-238 and a beta decay of P-32.",[("1 MeV = 10^6 eV = 10^6 x 1.602 x 10^-19 J = 1.602 x 10^-13 J.","Convert MeV to joule."),("200 MeV = 200 x 1.602 x 10^-13 = 3.2 x 10^-11 J.","Matches the book value of 3.2 x 10^-11 J."),("Alpha decay: mass number falls by 4 and atomic number by 2, so U-238 (Z = 92) becomes Th-234 (Z = 90) plus He-4.","Alpha particle is a helium nucleus."),("Beta decay: mass number is unchanged and atomic number rises by 1, so P-32 (Z = 15) becomes S-32 (Z = 16) plus an electron.","Neutron becomes proton.")]),
("Explain the difference between a controlled and an uncontrolled chain reaction with an example of each.",["Controlled: only one neutron per fission continues the reaction, used in a nuclear reactor","Uncontrolled: neutrons multiply rapidly, used in an atom bomb","A critical mass of fissile material is needed"],["Both release energy at the same slow rate","Fusion is a type of chain reaction"]),
["Fission splits a heavy nucleus; fusion joins light nuclei.","Chain reaction: 1, 3, 9, 27 neutrons; controlled in a reactor, uncontrolled in an atom bomb.","Critical mass is the least mass of fissile material that sustains the chain reaction.","1 eV = 1.602 x 10^-19 J; one fission gives about 200 MeV."],
["m|Nuclear fission is|the splitting of a heavy nucleus into smaller nuclei|the joining of two light nuclei~That is nuclear fusion;the emission of a gamma ray~That is only a change in energy level;the loss of an electron from an atom~That is ionisation|Fission releases energy and a few neutrons.",
 "m|A fissile material among the following is|uranium-235|uranium-238~It is not fissionable;thorium-232~It is a fertile material;carbon-12~Not radioactive|U-235 sustains fission on absorbing a neutron.",
 "t|The atom bomb works on an uncontrolled chain reaction.|True|The neutrons multiply in geometrical progression.",
 "n|Number of neutrons in the third stage of a chain reaction that starts with 1 and triples each time (1, 3, 9, ...)|9|1, 3, 9.",
 "m|The minimum mass of fissile material needed to sustain a chain reaction is the|critical mass|subcritical mass~That is below the minimum;supercritical mass~That is more than needed;atomic mass~Unrelated|Below it too many neutrons escape.",
 "t|Nuclear fusion occurs when two lighter nuclei combine to form a heavier nucleus.|True|It is the source of the Sun's energy.",
 "n|Energy in MeV released in one uranium fission (approximate)|200|About 3.2 x 10^-11 J.",
 "m|In beta decay the atomic number of the daughter nucleus|increases by one|decreases by two~That is alpha decay;stays the same~That is gamma decay;decreases by one~Wrong direction|A neutron changes into a proton.",
 "m|A nuclear reactor uses|a controlled chain reaction|an uncontrolled chain reaction~That is the atom bomb;a fusion reaction~Not in present reactors;a chemical reaction~Nuclear energy is not chemical|Extra neutrons are absorbed.",
 "s|The unit used in nuclear physics to measure the energy of small particles is the ____ volt.|electron / eV|1 eV = 1.602 x 10^-19 J."],
svg=(d,"A neutron splitting a uranium nucleus into barium and krypton with three neutrons, the chain reaction and fusion","Nuclear fission and fusion"))
print('ok')
