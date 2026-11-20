from lib import *
C=10;S='science'
d=svg(620,250,'<text x="310" y="22" text-anchor="middle" font-weight="bold">Molecules and atomicity</text>'
 '<circle cx="60" cy="80" r="16" fill="#aed6f1" stroke="#333"/><circle cx="90" cy="80" r="16" fill="#aed6f1" stroke="#333"/><text x="75" y="125" text-anchor="middle" font-size="13">O2</text><text x="75" y="142" text-anchor="middle" font-size="12">homodiatomic</text>'
 '<circle cx="190" cy="80" r="16" fill="#aed6f1" stroke="#333"/><circle cx="220" cy="80" r="16" fill="#aed6f1" stroke="#333"/><circle cx="205" cy="55" r="16" fill="#aed6f1" stroke="#333"/><text x="205" y="125" text-anchor="middle" font-size="13">O3</text><text x="205" y="142" text-anchor="middle" font-size="12">homotriatomic</text>'
 '<circle cx="330" cy="80" r="16" fill="#f9e79f" stroke="#333"/><circle cx="362" cy="80" r="20" fill="#abebc6" stroke="#333"/><text x="346" y="125" text-anchor="middle" font-size="13">HCl</text><text x="346" y="142" text-anchor="middle" font-size="12">heterodiatomic</text>'
 '<circle cx="470" cy="55" r="12" fill="#f9e79f" stroke="#333"/><circle cx="520" cy="55" r="12" fill="#f9e79f" stroke="#333"/><circle cx="495" cy="85" r="20" fill="#f5b7b1" stroke="#333"/><text x="495" y="125" text-anchor="middle" font-size="13">H2O</text><text x="495" y="142" text-anchor="middle" font-size="12">heterotriatomic</text>'
 '<text x="20" y="185" font-size="14">RMM = sum of relative atomic masses</text><text x="20" y="207" font-size="14">H2O = 2 x 1 + 16 = 18   CO2 = 12 + 2 x 16 = 44</text><text x="20" y="229" font-size="14">% of element = (mass of element in formula / RMM) x 100</text>')
lesson(C,S,'atoms-and-molecules','molecules-atomicity-and-molecular-mass',"Molecules, atomicity and molecular mass","Why oxygen is not simply O",
"The air we breathe contains oxygen, but there is no single free oxygen atom floating about; atoms of oxygen join in pairs. Most elements prefer to exist in combination, and this leads us to molecules.",
["Except noble gases, atoms of most elements exist in combined form; a molecule is a combination of two or more atoms held together by strong chemical bonds. @ molecule",
 "All compounds are molecules, but all molecules are not compounds, because a molecule can also be made of atoms of the same element. @ compounds and molecules",
 "A molecule made of similar atoms is homoatomic, like O2 and O3, and one made of different atoms in a fixed ratio is heteroatomic, like HCl and H2O. @ homoatomic and heteroatomic",
 "The number of atoms in a molecule is its atomicity; one atom is monoatomic, two is diatomic, three is triatomic and more than three is polyatomic. @ atomicity",
 "Hydrogen, nitrogen and the halogens exist as diatomic molecules, while phosphorus P4 and sulphur S8 are polyatomic. @ diatomic elements",
 "The atomic mass of an element is the average of the masses of its isotopes weighted by their abundance; for boron, 20 percent of B-10 and 80 percent of B-11 gives 10.8 amu. @ average atomic mass",
 "The relative molecular mass is the ratio of the mass of one molecule to one twelfth the mass of a carbon-12 atom, so it has no unit. @ relative molecular mass",
 "It is found by adding the relative atomic masses of all the atoms in the molecule, so water is 2 x 1 + 16 = 18 and carbon dioxide is 12 + 32 = 44. @ add atomic masses",
 "When the molecular mass is expressed in grams it is called the gram molecular mass, for example 18 g for water and 36.5 g for HCl. @ gram molecular mass",
 "The percentage composition of an element in a compound is (mass of that element in one formula unit divided by the molecular mass) times 100. @ percentage composition"],
("Find the relative molecular mass of H2SO4 (H = 1, S = 32, O = 16) and the percentage of oxygen in it.",[("H2SO4 has 2 hydrogen, 1 sulphur and 4 oxygen atoms.","Count the atoms."),("RMM = 2 x 1 + 32 + 4 x 16 = 2 + 32 + 64 = 98.","Add the atomic masses."),("Mass of oxygen = 4 x 16 = 64.","Oxygen part."),("Percentage of oxygen = 64 / 98 x 100 = 65.3 percent.","Use the formula.")]),
("Classify O2, O3, HCl, H2O and P4 by atomicity and by kind of atoms.",["O2 homodiatomic, O3 homotriatomic","HCl heterodiatomic, H2O heterotriatomic","P4 is polyatomic and homoatomic"],["O3 is a compound","Every molecule is a compound"]),
["Atomicity is the number of atoms in a molecule.","RMM = sum of relative atomic masses (no unit); gram molecular mass is in grams.","Average atomic mass = sum of (isotope mass x abundance).","% of element = (mass of element / RMM) x 100."],
["n|Relative molecular mass of water (H = 1, O = 16)|18|2 x 1 + 16.",
 "n|Relative molecular mass of carbon dioxide (C = 12, O = 16)|44|12 + 2 x 16.",
 "m|Ozone (O3) is a|homotriatomic molecule|heterotriatomic molecule~It has only one kind of atom;homodiatomic molecule~It has three atoms;monoatomic molecule~It has three atoms|Three atoms of the same element.",
 "t|All molecules are compounds.|False|O2 is a molecule but it is an element, not a compound.",
 "m|HCl is a|heterodiatomic molecule|homodiatomic molecule~It has two different elements;heterotriatomic molecule~It has two atoms;monoatomic molecule~It has two atoms|One H and one Cl atom.",
 "n|Average atomic mass of boron with 20 percent B-10 and 80 percent B-11|10.8|10 x 0.20 + 11 x 0.80.",
 "n|Percentage of oxygen in water, to the nearest whole number|89|16 / 18 x 100 = 88.9.",
 "t|The relative molecular mass has no unit.|True|It is a ratio of masses.",
 "m|The gram molecular mass of ammonia (NH3) is|17 g|14 g~That is only the nitrogen;18 g~That is water;3 g~Only the hydrogen|14 + 3 = 17.",
 "s|A molecule that contains more than three atoms is called ____.|polyatomic|For example P4 and S8."],
svg=(d,"Models of O2, O3, HCl and water with their atomicity and the rule for molecular mass","Molecules and atomicity"))
d2=svg(620,260,'<text x="310" y="22" text-anchor="middle" font-weight="bold">Chromosome, DNA and sex determination</text>'
 '<text x="20" y="55" font-size="14" font-weight="bold">DNA ladder</text><line x1="40" y1="70" x2="40" y2="210" stroke="#1f618d" stroke-width="3"/><line x1="130" y1="70" x2="130" y2="210" stroke="#1f618d" stroke-width="3"/>'
 '<line x1="40" y1="90" x2="130" y2="90" stroke="#c0392b" stroke-width="2"/><text x="85" y="86" text-anchor="middle" font-size="12">A = T</text><line x1="40" y1="125" x2="130" y2="125" stroke="#c0392b" stroke-width="3"/><text x="85" y="121" text-anchor="middle" font-size="12">G = C</text><line x1="40" y1="160" x2="130" y2="160" stroke="#c0392b" stroke-width="2"/><text x="85" y="156" text-anchor="middle" font-size="12">T = A</text><line x1="40" y1="195" x2="130" y2="195" stroke="#c0392b" stroke-width="3"/><text x="85" y="191" text-anchor="middle" font-size="12">C = G</text>'
 '<text x="160" y="95" font-size="13">A-T: 2 hydrogen bonds</text><text x="160" y="118" font-size="13">G-C: 3 hydrogen bonds</text><text x="160" y="141" font-size="13">Nucleotide = sugar + base + phosphate</text><text x="160" y="164" font-size="13">Purines: A, G   Pyrimidines: C, T</text><text x="160" y="187" font-size="13">10 base pairs per turn (3.4 nm)</text>'
 '<text x="420" y="55" font-size="14" font-weight="bold">Human sex determination</text><text x="420" y="85" font-size="13">Mother XX  x  Father XY</text><text x="420" y="110" font-size="13">Eggs: X, X   Sperms: X or Y</text><text x="420" y="135" font-size="13">X + X = girl (XX)</text><text x="420" y="158" font-size="13">X + Y = boy (XY)</text><text x="420" y="190" font-size="13">23 pairs: 22 autosomes + 1 sex pair</text>')
lesson(C,S,'genetics','chromosomes-dna-and-sex-determination',"Chromosomes, DNA and sex determination","The thread of life",
"Every cell of your body holds a nucleus and inside it thread-like chromosomes. These carry a molecule called DNA which holds the instructions for building you, and half of it came from each parent.",
["Chromosomes are thread-like, highly coiled chromatin fibres in the nucleus, packed with DNA, and they carry the hereditary information. @ chromosomes",
 "A gene is a segment of DNA responsible for inheriting a particular character, and each gene lies at a fixed position called its locus. @ gene and locus",
 "A chromosome has two sister chromatids joined at the centromere, where the spindle fibres attach during cell division, and the ends are protected by telomeres. @ centromere and telomere",
 "Based on the position of the centromere, chromosomes are telocentric, acrocentric, submetacentric or metacentric. @ types by centromere",
 "A human cell has 23 pairs of chromosomes; 22 pairs are autosomes that control body characters and the 23rd pair is the sex chromosomes. @ 23 pairs",
 "Body cells are diploid (2n) with chromosomes in pairs, while gametes are haploid (n) with a single set. @ diploid and haploid",
 "A karyotype shows the number, size and shape of the chromosomes of an organism, drawn as an idiogram. @ karyotype",
 "Watson and Crick proposed the double helix model of DNA using X-ray pictures by Rosalind Franklin and Maurice Wilkins. @ Watson and Crick",
 "DNA is a polynucleotide; each nucleotide has deoxyribose sugar, a phosphate and a base, which is a purine (adenine, guanine) or a pyrimidine (cytosine, thymine). @ nucleotide",
 "The two strands are held by hydrogen bonds with adenine pairing with thymine and cytosine with guanine, called complementary base pairing, and in humans the father's sperm carrying X or Y decides the sex of the child. @ base pairing and sex"],
("A DNA strand has the base sequence A T G C C A. Write the complementary strand. Then find the chance of a girl and a boy from the cross XX with XY.",[("Pair A with T, T with A, G with C and C with G.","Complementary base pairing."),("The complementary strand is T A C G G T.","Each base is replaced by its partner."),("The mother gives only X; the father gives X or Y with equal chance.","Eggs are all X."),("Children are XX (girl) or XY (boy), each with probability 1/2.","The father decides the sex.")]),
("Explain how the sex of a child is determined and why the father is responsible.",["The mother has two X chromosomes and so all eggs carry X","The father has X and Y so sperms are X or Y","X from the father gives a girl and Y gives a boy"],["The mother decides the sex","Sex depends on autosomes"]),
["Gene = segment of DNA; chromosome = coiled DNA with proteins.","Humans: 23 pairs, 22 autosomes + XX or XY.","Base pairs: A with T, G with C; Watson and Crick double helix.","The sperm (X or Y) decides the sex of the child."],
["m|Genes are|segments of DNA|proteins in the cytoplasm~Genes are made of DNA, not cytoplasm proteins;the cell membrane~Unrelated;sister chromatids~Chromatids are whole thread halves|Each gene carries one inherited character.",
 "n|Number of pairs of autosomes in a human cell|22|23 pairs in all, one pair is sex chromosomes.",
 "t|The sex of a human baby is decided by the sperm.|True|A sperm carries X or Y; the egg always carries X.",
 "m|In DNA, adenine pairs with|thymine|cytosine~That pairs with guanine;guanine~That pairs with cytosine;uracil~That is found in RNA|A pairs with T by two hydrogen bonds.",
 "m|The DNA double helix model was proposed by|Watson and Crick|Mendel and Darwin~They worked on inheritance and evolution;Waldeyer and Hahn~Waldeyer named chromosomes;Franklin alone~She produced the X-ray pictures|They used Franklin and Wilkins' X-ray data.",
 "n|Number of hydrogen bonds between guanine and cytosine|3|G is joined to C by three bonds and A to T by two.",
 "t|Gametes are diploid.|False|Gametes are haploid (n); body cells are diploid (2n).",
 "m|The region where the two chromatids are joined is the|centromere|telomere~That is the end of the chromosome;satellite~That is a knob-like appendage;locus~That is the position of a gene|Spindle fibres attach here.",
 "m|The complementary strand of A T G is|T A C|T A G~G pairs with C, not G;A T G~That is the same strand;C G T~A pairs with T, not C|A-T, T-A, G-C.",
 "s|The ends of a chromosome are called ____.|telomeres|They prevent chromosomes from joining."],
svg=(d2,"A DNA ladder with base pairs and a cross showing how the father decides the sex of the child","Chromosome, DNA and sex determination"))
print('ok')
