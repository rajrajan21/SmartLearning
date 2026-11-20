"""OCR the Hindi / Tamil textbook PDFs (their text layer uses old font encodings, so normal extraction gives garbage).
Output: <pdf name>.ocr.txt next to each PDF. Needs Tesseract (with tam + hin data) and PyMuPDF."""
import sys, os, glob, io, subprocess, urllib.request
root = sys.argv[1]
tess = os.path.join(root, "tools", "ocr", "tessdata"); os.makedirs(tess, exist_ok=True)
for lang in ("tam", "hin", "eng"):
    f = os.path.join(tess, lang + ".traineddata")
    if not os.path.exists(f) or os.path.getsize(f) < 100000:
        print("Downloading", lang, "language data (about 10-40 MB, one time)...")
        urllib.request.urlretrieve(f"https://github.com/tesseract-ocr/tessdata_fast/raw/main/{lang}.traineddata", f)
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
exe = os.environ.get("TESSERACT_EXE")
if exe: pytesseract.pytesseract.tesseract_cmd = exe
os.environ["TESSDATA_PREFIX"] = tess
books = glob.glob(os.path.join(root, "content", "books", "pdf", "class-*", "hindi*.pdf")) + \
        glob.glob(os.path.join(root, "content", "books", "pdf", "class-*", "arts-tamil*.pdf")) + \
        glob.glob(os.path.join(root, "content", "books", "pdf", "class-*", "Tamil", "*.pdf")) + \
        glob.glob(os.path.join(root, "content", "books", "pdf", "Matric*", "**", "*Tamil*.pdf"), recursive=True)
for pdf in sorted(set(books)):
    out = pdf[:-4] + ".ocr.txt"
    if os.path.exists(out) and os.path.getsize(out) > 500: print("skip (done)", os.path.basename(pdf)); continue
    lang = "hin+eng" if "hindi" in os.path.basename(pdf).lower() else "tam+eng"
    print("OCR", os.path.basename(pdf), lang)
    doc = fitz.open(pdf); parts = []
    for i, page in enumerate(doc, 1):
        pix = page.get_pixmap(dpi=200)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        parts.append(f"\n=== page {i} ===\n" + pytesseract.image_to_string(img, lang=lang))
        if i % 10 == 0: print("  page", i, "of", len(doc))
    open(out, "w", encoding="utf8").write("".join(parts)); print("wrote", out)
print("Done. Tell Claude: OCR text is ready, build Hindi/Tamil lessons.")
