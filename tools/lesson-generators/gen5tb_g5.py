import sys; sys.path.insert(0,"/tmp/ss-build/tools/lesson-generators")
from tb5 import build
A="(additional, not in the textbook)"
def L(ch,kind,**k):
    d=dict(sub="english",key=f"{ch}-{ch}-{kind}"); d.update(k); return d
S=[
L("glass-bangles","speak-and-write",terms=["past perfect","punctuation","word association","design"],
 story=("Ravi and Ananya","In Firozabad, Ravi, a glass artisan, and his daughter Ananya create a Diwali collection of bangles that mixes old and new designs."),
 explain=["Let us Read: Firozabad in Uttar Pradesh is famous for glass bangles. Ravi's family has made them for a long time, and his workshop hums with the clinking of glass.",
 "Making bangles needs great skill. The glass is heated in a furnace, shaped into bangles, given colours and designs and cooled. At Diwali the demand rises and artisans work around the clock.",
 "Ananya, who has finished school, wants to help her father. She has an eye for design and mixes delicate floral patterns and geometric shapes with the traditional ones. Ravi is hesitant at first but then sees the beauty. Their special Diwali collection is a big success.",
 "More demand means more work for local artisans and more jobs in packing and transport.",
 "Let us Think: how bangles were made in the workshop, who Ananya was and how she helped, and how the success helped the community.",
 "Think and discuss: what other modern designs or colours you would add, a time you made something that made you happy (a drawing, writing or project), and a list of things you buy from local markets during festivals.",
 "Word association: list three words for festivals, bangle, factory, friend and school.",
 "Punctuate sentences with capital letters, full stops, commas and question marks, such as: On Diwali night the streets of Firozabad were lit with lamps and lights.",
 "Past perfect tense is used for an action completed before another past action. Example: Ananya had completed her schooling before she joined the factory. Use had with the verb for the first action."],
 ex=("Find the first action: Shivangi had finished the portrait when I called her.",[("Finished is with had.","First."),("Called is the second.","Second.")]),
 tb=("Explain the past perfect with an example.",["Shows the earlier action","Uses had","Past simple for the later action"],["Mixing the order"]),
 summary=["Learn how bangles are made.","Use the past perfect.","Punctuate correctly."]),
L("glass-bangles","theme-and-meaning",terms=["tradition","innovation","community","craft"],
 story=("Old meets new","Ananya adds modern ideas while keeping the traditional craft."),
 explain=["The story is about tradition and innovation working together.",
 "Ravi worried about keeping the craft's truthfulness but accepted his daughter's ideas when he saw their beauty.",
 "Their joint work made the Diwali collection a success, and customers loved the new designs and colours.",
 "The success helped the whole community, bringing work to artisans, packers and transporters.",
 "It also shows pride in craftsmanship and how a family craft can be passed down while changing with the times.",
 f"{A} Buying from local artisans, especially at festivals, supports such communities."],
 ex=("Why did the collection succeed?",[("It mixed old and new.","Blend."),("Customers loved the designs.","Demand.")]),
 tb=("What does the story teach about old and new?",["Tradition has value","New ideas can improve it","Both work together"],["Thinking new always replaces old"]),
 summary=["Tradition and new ideas can combine.","The whole community benefits.","Be proud of crafts."]),
L("glass-bangles","words-and-meanings",terms=["clinking","artisans","furnace","floral patterns","elements"],
 story=("New words","New Words: clinking, artisans, furnace, floral patterns, elements."),
 explain=["Clinking is a light ringing sound made by glass or metal objects hitting each other.",
 "Artisans are skilled people who make things by hand. A furnace is a very hot oven used for heating glass or metal.",
 "Floral patterns are designs of flowers. Elements are parts or features of something, like traditional and modern elements in a design.",
 "Make word webs: for example, festivals leads to sweets, family and joy.",
 "Use each word in a sentence."],
 ex=("Define furnace.",[("A very hot oven.","Meaning."),("Used for glass and metal.","Use.")]),
 tb=("Explain artisans and clinking.",["Artisans are skilled makers","Clinking is a ringing sound"],["Mixing artisans with artists"]),
 summary=["Five words.","Furnaces heat glass.","Artisans craft by hand."]),
]
for s in S: build(s)
