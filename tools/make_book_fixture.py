#!/usr/bin/env python3
"""Makes the small made-up textbook PDFs used by the automated tests and screenshot checks.
    python3 tools/make_book_fixture.py [out_dir]      (default: apps/api/test/fixtures/books)
Needs reportlab. The output mirrors what tools/download_books.py writes: pdf/class-N/<file>.pdf + manifest.json.
Nothing here is a real textbook."""
import json, os, sys
from reportlab.lib.pagesizes import A5
from reportlab.lib import colors
from reportlab.pdfgen import canvas

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "apps", "api", "test", "fixtures", "books")
W, H = A5

PAGES = [
    ("Counting in tens", ["Meenu sells mangoes at the market. Each crate holds exactly ten mangoes.",
                          "She fills one crate, then another. Three mangoes are left over.",
                          "How many mangoes does Meenu have? Count the crates first."]),
    ("Tens and ones", ["A number like 23 has two digits. The digit on the left tells us how many tens.",
                       "The digit on the right tells us how many ones. Two tens and three ones make 23."]),
    None,  # a page that is only a picture (no text at all), like a scanned page
    ("Try it yourself", ["Draw 4 crates and 6 loose mangoes. What number did you make?",
                         "Ask a friend to check your answer. Well done!"]),
    ("Bigger numbers", ["Ten crates make one hundred mangoes. That is a lot of fruit!",
                        "Mr. Ravi buys 3.5 kg of mangoes for Rs. 120. Is that a fair price?"]),
    ("Remember", ["Tens go on the left. Ones go on the right.", "Zero ones means the crate is full and nothing is left over."]),
]


def wrap(c, text, font, size, width):
    words, line, out = text.split(), "", []
    for w in words:
        t = (line + " " + w).strip()
        if c.stringWidth(t, font, size) > width and line:
            out.append(line); line = w
        else:
            line = t
    if line:
        out.append(line)
    return out


def make(path, title, sub, accent, pages=PAGES):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    c = canvas.Canvas(path, pagesize=A5, pageCompression=1)
    c.setTitle(title)
    # front cover
    c.setFillColor(accent); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(colors.HexColor("#ffe9a8")); c.circle(W / 2, H * 0.42, 70, stroke=0, fill=1)
    c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 26)
    for i, ln in enumerate(wrap(c, title, "Helvetica-Bold", 26, W - 80)):
        c.drawCentredString(W / 2, H - 110 - i * 32, ln)
    c.setFont("Helvetica", 13); c.drawCentredString(W / 2, 70, sub)
    c.showPage()
    n = 2
    for pg in pages:
        c.setFillColor(colors.HexColor("#fffdf6")); c.rect(0, 0, W, H, stroke=0, fill=1)
        if pg is None:
            c.setFillColor(colors.HexColor("#d8ecf7")); c.roundRect(40, 120, W - 80, H - 240, 14, stroke=0, fill=1)
            for k in range(5):
                c.setFillColor(colors.HexColor("#f4a020")); c.circle(90 + k * 60, H / 2, 22, stroke=0, fill=1)
                c.setFillColor(colors.HexColor("#3f7d3a")); c.rect(88 + k * 60, H / 2 + 20, 4, 10, stroke=0, fill=1)
        else:
            head, paras = pg
            c.setFillColor(accent); c.setFont("Helvetica-Bold", 20); c.drawString(44, H - 70, head)
            c.setFillColor(colors.HexColor("#f4a020")); c.rect(44, H - 80, 46, 3, stroke=0, fill=1)
            y = H - 116
            c.setFillColor(colors.HexColor("#222222")); c.setFont("Helvetica", 12)
            for p in paras:
                for ln in wrap(c, p, "Helvetica", 12, W - 88):
                    c.drawString(44, y, ln); y -= 18
                y -= 10
            c.setFillColor(colors.HexColor("#888888")); c.setFont("Helvetica", 9); c.drawCentredString(W / 2, 30, str(n))
        c.showPage(); n += 1
    # back cover
    c.setFillColor(accent); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(colors.white); c.setFont("Helvetica", 12); c.drawCentredString(W / 2, H / 2, "Made-up test book. Not a real textbook.")
    c.showPage(); c.save()
    return n


def row(cls, subject, title, language, rel, pages):
    p = os.path.join(OUT, rel)
    return {"title": title, "class": cls, "subject": subject, "language": language, "tier": "primary", "source": "fixture",
            "status": "ok", "kind": "single", "path": "content/books/" + rel, "pages": pages, "bytes": os.path.getsize(p)}


rows = []
n = make(os.path.join(OUT, "pdf/class-3/maths.pdf"), "Mango Market Maths", "Maths, Class 3 (test book)", colors.HexColor("#12605a"))
rows.append(row(3, "Maths", "Mango Market Maths", "English", "pdf/class-3/maths.pdf", n))
n = make(os.path.join(OUT, "pdf/class-3/tamil.pdf"), "Tamil Reader", "Tamil, Class 3 (test book, English text)", colors.HexColor("#8a2f4a"), PAGES[:3])
rows.append(row(3, "Tamil", "Tamil Reader", "Tamil", "pdf/class-3/tamil.pdf", n))
ch = []
for i in (1, 2):
    make(os.path.join(OUT, "pdf/class-4/_chapters/evs/ch%d.pdf" % i), "Our World, chapter %d" % i, "EVS, Class 4 (test book)", colors.HexColor("#2b5fa8"), PAGES[i:i + 2])
    ch.append("ch%d.pdf" % i)
rows.append({"title": "Our World", "class": 4, "subject": "EVS", "language": "English", "status": "partial", "kind": "chapters",
             "path": "content/books/pdf/class-4/_chapters/evs", "chapterFiles": ch, "bytes": 0})
# a row whose file was never downloaded: must not be listed
rows.append({"title": "Missing Book", "class": 5, "subject": "Science", "language": "English", "status": "ok", "kind": "single",
             "path": "content/books/pdf/class-5/science.pdf", "pages": 10, "bytes": 1})
with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump({"generated": "fixture", "note": "Made-up test books.", "books": rows}, f, indent=2)
print("wrote", OUT)
