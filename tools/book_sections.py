#!/usr/bin/env python3
"""Lists every numbered section ("1.1 Title") of each downloaded textbook, with its page, so we can check that our lessons
cover the whole chapter. Writes content/coverage/class-N-<book>.json and prints a summary. No AI, no internet.
Usage: python3 tools/book_sections.py [--class 6] [--book maths]"""
import json, re, sys, pathlib
import pypdf
root = pathlib.Path(__file__).resolve().parent.parent
books = json.load(open(root / "content/books/manifest.json"))["books"]
args = sys.argv[1:]
want_class = args[args.index("--class") + 1] if "--class" in args else None
want_book = args[args.index("--book") + 1] if "--book" in args else None
HEAD = re.compile(r"^\s{0,40}(\d{1,2})\.(\d{1,2})\s+([A-Z][^\n]{2,70}?)\s*$")
out_dir = root / "content/coverage"; out_dir.mkdir(exist_ok=True)
for b in books:
    if b.get("status") != "ok" or b.get("kind") != "single": continue
    stem = b["file"].replace(".pdf", "")
    if (want_class and str(b["class"]) != want_class) or (want_book and stem != want_book): continue
    pdf = root / b["path"]
    if not pdf.exists(): continue
    r = pypdf.PdfReader(str(pdf))
    chapters = {}
    for i, page in enumerate(r.pages, 1):
        try: text = page.extract_text() or ""
        except Exception: continue
        for line in text.split("\n"):
            m = HEAD.match(line)
            if not m or int(m.group(1)) > 30 or int(m.group(2)) > 20: continue
            title = re.sub(r"\s+", " ", m.group(3)).strip(" .")
            if len(title) < 4 or title.lower().startswith(("figure", "table", "fig")) or re.search(r"\d{3,}", title): continue
            secs = chapters.setdefault(int(m.group(1)), [])
            if not any(s["n"] == f"{m.group(1)}.{m.group(2)}" for s in secs): secs.append({"n": f"{m.group(1)}.{m.group(2)}", "title": title, "page": i})
    data = {"class": b["class"], "book": stem, "title": b["title"], "chapters": [{"chapter": k, "sections": v} for k, v in sorted(chapters.items())]}
    (out_dir / f"class-{b['class']}-{stem}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    total = sum(len(v) for v in chapters.values())
    print(f"class {b['class']} {stem}: {len(chapters)} chapters, {total} sections")
