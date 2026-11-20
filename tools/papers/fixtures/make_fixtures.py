# Makes two small sample PDFs (a paper and its marking scheme) used by the offline tests. Needs: pip install reportlab
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
def pdf(path, pages):
    c = canvas.Canvas(path, pagesize=A4)
    for lines in pages:
        y = 800
        c.setFont("Helvetica", 10); c.drawString(60, 820, "SAMPLE SCHOOL BOARD  -  2025-26")
        for l in lines:
            c.drawString(60, y, l); y -= 16
        c.showPage()
    c.save()
paper = [[
 "CLASS X  SCIENCE  (SAMPLE QUESTION PAPER)",
 "Time Allowed: 3 hours                       Maximum Marks: 40",
 "General Instructions:",
 "1. All questions are compulsory.",
 "2. The question paper has two sections.",
 "SECTION A",
 "Section A has 4 questions of 1 mark each.",
 "1. Which gas is released during photosynthesis?",
 "(a) Carbon dioxide  (b) Oxygen  (c) Nitrogen  (d) Hydrogen",
 "2. The unit of electric current is",
 "(a) Volt",
 "(b) Ohm",
 "(c) Ampere",
 "(d) Watt",
 "3. Acids turn blue litmus red. State whether True or False.",
 "4. The chemical formula of common salt is ______.",
 ], [
 "SECTION B",
 "Section B has 3 questions of 3 marks each.",
 "5. Explain the process of respiration in plants.   [3]",
 "6. Write the balanced equation for the reaction of zinc with dilute",
 "sulphuric acid and name the gas formed.   [3]",
 "7. Describe two uses of a concave mirror with a neat ray diagram.   [3]",
]]
ms = [[
 "MARKING SCHEME  CLASS X  SCIENCE",
 "SECTION A",
 "1. (b) Oxygen   1",
 "2. (c) Ampere   1",
 "3. True   1",
 "4. NaCl (sodium chloride)   1",
 "SECTION B",
 "5. Plants take in oxygen and release carbon dioxide; glucose is",
 "broken down to release energy (ATP).   3",
 "6. Zn + H2SO4 gives ZnSO4 + H2. Hydrogen gas is formed.   3",
 "7. Used in torches and shaving mirrors; ray diagram 1 mark.   3",
]]
pdf("sample-paper.pdf", paper); pdf("sample-marking-scheme.pdf", ms)
