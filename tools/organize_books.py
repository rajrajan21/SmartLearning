#!/usr/bin/env python3
"""
organize_books.py - turn the NCERT zip files you downloaded by hand into one PDF per book.

Looks for zip files in content/books/pdf/class-N/ (names like ceev1dd.zip), works out which book
each one is, joins the front pages and chapters into a single PDF (front pages first, then the
chapters in order), saves it as content/books/pdf/class-N/<subject>.pdf and rewrites
content/books/manifest.json so the website's textbook reader lists the books.

Needs:  pip install pypdf     (Organize-Books.bat does this for you)
Safe to run again: books that already exist are skipped (use --force to rebuild).
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import zipfile
from datetime import datetime, timezone

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:  # pragma: no cover
    sys.exit("pypdf is missing. Run:  pip install pypdf")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_DIR = os.path.join(ROOT, "content", "books", "pdf")
MANIFEST = os.path.join(ROOT, "content", "books", "manifest.json")

# NCERT file-name code (class letter c/d/e/f/g + medium e/t + 2-3 letter book code) -> book.
# Identified from each book's own first page ("Our Wondrous World", "Maths Mela", ...).
# (subject, title, language, file name)
BOOKS = {
    "ev": ("EVS", "Our Wondrous World (The World Around Us)", "English", "evs"),
    "ky": ("Physical Education", "Khel Yoga / Khel Yatra (Physical Education and Well-being)", "English", "physical-education"),
    "mm": ("Maths", "Maths Mela", "English", "maths"),
    "sa": ("English", "Santoor", "English", "english"),
    "bu": ("Arts", "Bansuri (Arts)", "English", "arts"),
    "kr": ("Arts", "Kriti (Arts)", "English", "arts"),
    "cu": ("Science", "Curiosity", "English", "science"),
    "es": ("Social Science", "Exploring Society: India and Beyond", "English", "social-science"),
    "gp": ("Maths", "Ganita Prakash", "English", "maths"),
    "pr": ("English", "Poorvi", "English", "english"),
}
TITLES = {  # class-specific book names
    (3, "ky"): "Khel Yoga (Physical Education and Well-being)",
    (4, "ky"): "Khel Yoga (Physical Education and Well-being)",
    (5, "ky"): "Khel Yoga (Physical Education and Well-being)",
    (6, "ky"): "Khel Yatra (Physical Education and Well-being)",
    (7, "ky"): "Khel Yatra (Physical Education and Well-being)",
    (3, "bu"): "Bansuri (Arts)", (4, "bu"): "Bansuri (Arts)", (5, "bu"): "Bansuri (Arts)",
    (6, "kr"): "Kriti I (Arts)", (7, "kr"): "Kriti (Arts)",
}
CODE = re.compile(r"^([cdefg])([et])([a-z]{2,3}?)(\d)dd(?:\s*\(\d+\))?\.zip$", re.I)
CLASS_OF = {"c": 3, "d": 4, "e": 5, "f": 6, "g": 7}


def say(msg=""):
    print(msg, flush=True)


def book_for(name):
    """Return (class, key, medium, part) for a zip name, or None."""
    m = CODE.match(name)
    if not m:
        return None
    cl, med, key, part = CLASS_OF[m.group(1).lower()], m.group(2).lower(), m.group(3).lower(), int(m.group(4))
    # Tamil-medium arts books are named ctmbu / dtmbu / etmbu / gtmkr: medium "t", code "mbu"/"mkr"
    if med == "t":
        key = {"mbu": "bu", "mkr": "kr"}.get(key, key)
    return cl, key, med, part


def sort_key(n):
    low = n.lower()
    if low.endswith("1ps.pdf") or low.endswith("ps.pdf"):
        return (0, low)  # front pages (title, preface, contents) first
    if low.endswith("an.pdf") or low.endswith("ap.pdf") or low.endswith("gl.pdf") or low.endswith("ans.pdf"):
        return (2, low)  # answers, appendix, glossary last
    return (1, low)


def merge(zip_path, dest):
    tmp = tempfile.mkdtemp(prefix="books_")
    try:
        with zipfile.ZipFile(zip_path) as z:
            names = [n for n in z.namelist() if n.lower().endswith(".pdf") and not n.endswith("/")]
            files = []
            for n in names:
                out = os.path.join(tmp, os.path.basename(n))
                with z.open(n) as src, open(out, "wb") as dst:
                    shutil.copyfileobj(src, dst)
                files.append(out)
        files.sort(key=lambda p: sort_key(os.path.basename(p)))
        w = PdfWriter()
        for f in files:
            try:
                w.append(PdfReader(f))
            except Exception as e:  # a damaged chapter should not lose the whole book
                say("    warning: skipped %s (%s)" % (os.path.basename(f), e))
        part = dest + ".part"
        with open(part, "wb") as fh:
            w.write(fh)
        os.replace(part, dest)
        return len(files), len(w.pages)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="rebuild books that already exist")
    ap.add_argument("--class", dest="classes", type=int, nargs="+", help="only these classes")
    args = ap.parse_args()

    rows, made, skipped, bad = [], 0, 0, []
    for cl in range(3, 8):
        if args.classes and cl not in args.classes:
            continue
        cdir = os.path.join(PDF_DIR, "class-%d" % cl)
        if not os.path.isdir(cdir):
            continue
        zips = sorted(f for f in os.listdir(cdir) if f.lower().endswith(".zip"))
        seen = set()
        for z in zips:
            info = book_for(z)
            if not info:
                say("  ? not recognised, skipped: class-%d/%s" % (cl, z))
                bad.append(z)
                continue
            _, key, med, part = info
            if key not in BOOKS:
                say("  ? unknown book code '%s', skipped: %s" % (key, z))
                bad.append(z)
                continue
            if (key, med, part) in seen:
                continue  # duplicate download such as "fegp1dd (1).zip"
            seen.add((key, med, part))
            subject, title, language, slug = BOOKS[key]
            title = TITLES.get((cl, key), title)
            if med == "t":
                language, slug, title = "Tamil", slug + "-tamil", title + " - Tamil medium"
            # Class 7 has two parts for some books (gees1/gees2, gegp1/gegp2)
            two = any(book_for(o) and book_for(o)[1] == key and book_for(o)[2] == med and book_for(o)[3] == 2 for o in zips)
            if two or part > 1:
                slug += "-part-%d" % part
                title += " - Part %d" % part
            dest = os.path.join(cdir, slug + ".pdf")
            if os.path.isfile(dest) and not args.force:
                say("  skip (already there): class-%d/%s.pdf" % (cl, slug))
                skipped += 1
            else:
                say("  building class-%d/%s.pdf from %s ..." % (cl, slug, z))
                try:
                    nf, npg = merge(os.path.join(cdir, z), dest)
                    say("    done: %d files joined, %d pages" % (nf, npg))
                    made += 1
                except Exception as e:
                    say("    FAILED: %s" % e)
                    bad.append(z)
                    continue
            try:
                pages = len(PdfReader(dest).pages)
            except Exception:
                pages = None
            rows.append({
                "title": title, "class": cl, "subject": subject, "language": language,
                "file": slug + ".pdf", "path": "content/books/pdf/class-%d/%s.pdf" % (cl, slug),
                "kind": "single", "status": "ok", "source": "ncert (downloaded zip)",
                "pages": pages, "bytes": os.path.getsize(dest), "sha256": sha256(dest),
                "downloadedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            })

    # keep rows the other downloader wrote for books we did not just build
    old = []
    try:
        with open(MANIFEST, encoding="utf-8") as f:
            j = json.load(f)
        old = j if isinstance(j, list) else j.get("books", [])
    except Exception:
        pass
    mine = {(r["class"], r["file"]) for r in rows}
    keep = [r for r in old if isinstance(r, dict) and r.get("status") != "failed"
            and (r.get("class") or r.get("classLevel"), r.get("file")) not in mine
            and os.path.exists(os.path.join(ROOT, str(r.get("path", "")).replace("/", os.sep)))]
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump({"books": keep + rows, "updated": datetime.now(timezone.utc).isoformat(timespec="seconds")}, f, indent=1, ensure_ascii=False)
    say("")
    say("Built %d, skipped %d, problems %d. Manifest has %d books." % (made, skipped, len(bad), len(keep) + len(rows)))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
