#!/usr/bin/env python3
"""
download_books.py - polite NCERT textbook downloader (pure standard library).

Reads content/books/sources.json and saves PDFs to
    content/books/pdf/class-N/<file>.pdf
then writes content/books/manifest.json.

Examples (run from the project folder):
    python tools/download_books.py --dry-run
    python tools/download_books.py --class 6
    python tools/download_books.py --class 3 4 --subject maths
    python tools/download_books.py --include-mirror --include-legacy

Tiers in sources.json:
    primary  official ncert.nic.in current books   (always on)
    mirror   Google Drive copies on third-party sites (only with --include-mirror)
    legacy   old-syllabus NCERT zips                  (only with --include-legacy)

Optional: pip install pypdf   -> chapter PDFs are merged into one PDF per book.
Without pypdf the chapters are kept as separate files in class-N/_chapters/<book>/.
"""
import argparse
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
import zipfile
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKS = os.path.join(ROOT, "content", "books")
UA = ("Mozilla/5.0 (compatible; SharpStudyBookFetcher/1.0; personal educational use; "
      "polite, 1 request at a time)")

try:  # optional
    from pypdf import PdfReader, PdfWriter  # type: ignore
except Exception:  # pragma: no cover
    try:
        from PyPDF2 import PdfReader, PdfWriter  # type: ignore
    except Exception:
        PdfReader = PdfWriter = None


def say(msg=""):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode("ascii", "replace").decode("ascii"), flush=True)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "book"


def drive_direct(url):
    m = re.search(r"drive\.google\.com/file/d/([\w-]+)", url) or re.search(r"[?&]id=([\w-]+)", url)
    if "drive.google.com" in url and m:
        return "https://drive.google.com/uc?export=download&confirm=t&id=" + m.group(1)
    return url


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for blk in iter(lambda: f.read(1 << 20), b""):
            h.update(blk)
    return h.hexdigest()


def is_pdf(path):
    try:
        with open(path, "rb") as f:
            return f.read(5) == b"%PDF-"
    except OSError:
        return False


def is_zip(path):
    try:
        return zipfile.is_zipfile(path)
    except OSError:
        return False


def count_pages(path):
    if PdfReader is not None:
        try:
            return len(PdfReader(path).pages)
        except Exception:
            pass
    try:  # crude fallback
        with open(path, "rb") as f:
            data = f.read()
        return len(re.findall(rb"/Type\s*/Page(?![s\w])", data)) or None
    except OSError:
        return None


class Fetcher:
    def __init__(self, delay, retries, timeout=60):
        self.delay, self.retries, self.timeout = delay, retries, timeout
        self._last = 0.0

    def _wait(self):
        gap = time.time() - self._last
        if gap < self.delay:
            time.sleep(self.delay - gap)

    def _curl(self, url, part):
        """Fallback: Windows' own curl.exe uses the Windows certificate store, which
        fetches the missing intermediate certificate that Python's urllib cannot.
        Certificate checking stays ON. Returns None or an error string."""
        exe = shutil.which("curl.exe") or shutil.which("curl")
        if not exe:
            return "curl not found (needed because Python does not trust this site's certificate)"
        try:
            r = subprocess.run([exe, "-L", "-f", "-sS", "-C", "-", "--retry", "2", "-A", UA,
                                "--max-time", "300", "-o", part, url],
                               capture_output=True, text=True)
        except OSError as e:
            return "curl failed: %s" % e
        if r.returncode != 0:
            return "curl exit %d: %s" % (r.returncode, (r.stderr or "").strip()[:200])
        return None

    def get(self, url, dest):
        """Download url to dest (resumes dest+'.part'). Returns None or an error string."""
        url = drive_direct(url)
        part = dest + ".part"
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        err = "unknown error"
        for attempt in range(1, self.retries + 1):
            self._wait()
            have = os.path.getsize(part) if os.path.exists(part) else 0
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            if have:
                req.add_header("Range", "bytes=%d-" % have)
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as r:
                    mode = "ab" if (have and r.status == 206) else "wb"
                    with open(part, mode) as f:
                        shutil.copyfileobj(r, f, 1 << 16)
                self._last = time.time()
                os.replace(part, dest)
                return None
            except urllib.error.HTTPError as e:
                self._last = time.time()
                if e.code == 416 and have:  # already complete
                    os.replace(part, dest)
                    return None
                err = "HTTP %d %s" % (e.code, e.reason)
                if e.code in (401, 403, 404, 410):
                    if os.path.exists(part):
                        os.remove(part)
                    return err  # retrying will not help
            except Exception as e:  # network hiccup
                self._last = time.time()
                if "CERTIFICATE_VERIFY_FAILED" in str(e):
                    cerr = self._curl(url, part)
                    self._last = time.time()
                    if cerr is None and os.path.exists(part):
                        os.replace(part, dest)
                        return None
                    if cerr and "HTTP" not in cerr and "22" in cerr[:12]:
                        if os.path.exists(part):
                            os.remove(part)
                    err = "certificate problem, curl fallback: %s" % cerr
                    return err
                err = "%s: %s" % (type(e).__name__, e)
            time.sleep(2 * attempt)
        return err


def merge_pdfs(paths, dest):
    w = PdfWriter()
    for p in paths:
        for page in PdfReader(p).pages:
            w.add_page(page)
    tmp = dest + ".tmp"
    with open(tmp, "wb") as f:
        w.write(f)
    os.replace(tmp, dest)


def natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]


def finish_chapters(chapter_files, final_pdf, keep_dir, no_merge):
    """chapter_files: ordered list of PDF paths. Returns (path_or_dir, kind)."""
    if PdfReader is not None and not no_merge:
        try:
            merge_pdfs(chapter_files, final_pdf)
            return final_pdf, "merged"
        except Exception as e:
            say("    could not merge (%s); keeping chapters" % e)
    return keep_dir, "chapters"


def process(entry, args, fetcher, outdir):
    cl = entry["classLevel"]
    fname = entry.get("file") or slug(entry["subject"])
    cdir = os.path.join(outdir, "class-%d" % cl)
    final = os.path.join(cdir, fname + ".pdf")
    chdir = os.path.join(cdir, "_chapters", fname)
    res = {"status": "failed", "path": None, "kind": None, "url": None, "error": None}

    minimum = entry.get("minimumPages", 0)
    def complete_pdf(path):
        return is_pdf(path) and (not minimum or (count_pages(path) or 0) >= minimum)

    if os.path.exists(final) and complete_pdf(final) and not args.force:
        res.update(status="skipped", path=final, kind="single", url=entry.get("pdfUrl"))
        return res
    if os.path.isdir(chdir) and not args.force:
        have = sorted([f for f in os.listdir(chdir) if f.lower().endswith(".pdf")], key=natural_key)
        want = len(entry.get("chapterUrls") or [])
        if have and want and len(have) >= want and PdfReader is None:
            res.update(status="skipped", path=chdir, kind="chapters")
            return res

    errors = []
    # --- 1. whole-book file or zip
    url = entry.get("pdfUrl")
    # NCERT's ps.pdf is the cover and front matter, not the complete textbook.
    if url and re.search(r"/[a-z0-9]+ps\.pdf(?:[?#]|$)", url, re.I) and entry.get("chapterUrls"):
        url = None
    if url:
        tmp = os.path.join(cdir, "_tmp", fname + ".download")
        say("    downloading full book: " + url)
        e = fetcher.get(url, tmp)
        if e:
            errors.append("full book: " + e)
        elif complete_pdf(tmp):
            os.makedirs(cdir, exist_ok=True)
            os.replace(tmp, final)
            res.update(status="ok", path=final, kind="single", url=url)
            return res
        elif is_zip(tmp):
            ex = os.path.join(cdir, "_tmp", fname + "_unzipped")
            shutil.rmtree(ex, ignore_errors=True)
            with zipfile.ZipFile(tmp) as z:
                z.extractall(ex)
            pdfs = []
            for dp, _, fs in os.walk(ex):
                pdfs += [os.path.join(dp, f) for f in fs if f.lower().endswith(".pdf")]
            pdfs.sort(key=lambda p: natural_key(os.path.basename(p)))
            # skip front/back-matter-only duplicates? keep all, in name order
            if pdfs:
                os.makedirs(chdir, exist_ok=True)
                kept = []
                for p in pdfs:
                    d = os.path.join(chdir, os.path.basename(p))
                    shutil.copyfile(p, d)
                    kept.append(d)
                path, kind = finish_chapters(kept, final, chdir, args.no_merge)
                shutil.rmtree(ex, ignore_errors=True)
                os.remove(tmp)
                if kind == "merged":
                    shutil.rmtree(chdir, ignore_errors=True)
                res.update(status="ok", path=path, kind=kind, url=url)
                return res
            errors.append("zip contained no PDFs")
        else:
            errors.append("full book: server did not return a PDF (maybe a web page / block)")
        if os.path.exists(tmp):
            os.remove(tmp)

    # --- 2. chapter by chapter
    ch_urls = entry.get("chapterUrls") or []
    if ch_urls:
        say("    trying %d chapter files" % len(ch_urls))
        files, bad = [], 0
        for i, cu in enumerate(ch_urls, 1):
            dest = os.path.join(chdir, "%02d-%s" % (i, os.path.basename(cu)))
            if os.path.exists(dest) and is_pdf(dest) and not args.force:
                files.append(dest)
                continue
            e = fetcher.get(cu, dest)
            if e or not is_pdf(dest):
                bad += 1
                errors.append("chapter %d: %s" % (i, e or "not a PDF"))
                if os.path.exists(dest):
                    os.remove(dest)
            else:
                files.append(dest)
        if files and not bad:
            path, kind = finish_chapters(files, final, chdir, args.no_merge)
            if kind == "merged":
                shutil.rmtree(chdir, ignore_errors=True)
            res.update(status="ok", path=path, kind=kind, url=ch_urls[0])
            return res
        if files:
            res.update(status="partial", path=chdir, kind="chapters")
    res["error"] = "; ".join(errors[:4]) if errors else "no URL"
    return res


def manifest_row(entry, res, outdir):
    row = {
        "title": entry["title"], "class": entry["classLevel"], "subject": entry["subject"],
        "language": entry["language"], "tier": entry.get("tier"), "source": entry.get("source"),
        "sourceUrl": res.get("url") or entry.get("pdfUrl") or (entry.get("chapterUrls") or [None])[0],
        "status": res["status"], "kind": res.get("kind"),
        "downloadedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    p = res.get("path")
    if p:
        rel = os.path.relpath(p, ROOT).replace("\\", "/")
        row["path"] = rel
        if os.path.isfile(p):
            row.update(pages=count_pages(p), bytes=os.path.getsize(p), sha256=sha256_file(p))
        elif os.path.isdir(p):
            fl = sorted(f for f in os.listdir(p) if f.lower().endswith(".pdf"))
            row.update(chapterFiles=fl, bytes=sum(os.path.getsize(os.path.join(p, f)) for f in fl))
    if res.get("error"):
        row["error"] = res["error"]
    return row


def main(argv=None):
    ap = argparse.ArgumentParser(description="Download NCERT textbooks listed in content/books/sources.json")
    ap.add_argument("--class", dest="classes", type=int, nargs="+", help="class numbers, e.g. --class 3 4")
    ap.add_argument("--subject", nargs="+", help="match words in subject/title/file, e.g. maths science")
    ap.add_argument("--language", help="English / Hindi / Urdu / Sanskrit")
    ap.add_argument("--include-mirror", action="store_true", help="also use Google Drive mirror entries")
    ap.add_argument("--include-legacy", action="store_true", help="also fetch old-syllabus books")
    ap.add_argument("--dry-run", action="store_true", help="show what would happen, download nothing")
    ap.add_argument("--force", action="store_true", help="re-download even if the file exists")
    ap.add_argument("--no-merge", action="store_true", help="keep chapters separate")
    ap.add_argument("--delay", type=float, default=1.5, help="seconds between requests (default 1.5)")
    ap.add_argument("--retries", type=int, default=3)
    ap.add_argument("--sources", default=os.path.join(BOOKS, "sources.json"))
    ap.add_argument("--out", default=os.path.join(BOOKS, "pdf"))
    args = ap.parse_args(argv)
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    with open(args.sources, encoding="utf-8") as f:
        entries = json.load(f)
    tiers = {"primary"} | ({"mirror"} if args.include_mirror else set()) | ({"legacy"} if args.include_legacy else set())
    sel = []
    for e in entries:
        if e.get("tier", "primary") not in tiers:
            continue
        if args.classes and e["classLevel"] not in args.classes:
            continue
        if args.language and e["language"].lower() != args.language.lower():
            continue
        if args.subject:
            hay = " ".join([e["subject"], e["title"], e.get("file", "")]).lower()
            if not any(w.lower() in hay for w in args.subject):
                continue
        sel.append(e)

    say("SharpStudy textbook downloader")
    say("  books selected : %d%s" % (len(sel), "   (DRY RUN - nothing will be downloaded)" if args.dry_run else ""))
    say("  merging PDFs   : %s" % ("yes (pypdf found)" if PdfReader else "no (install with: pip install pypdf)"))
    say("  save folder    : " + args.out)
    say("")
    if not sel:
        say("Nothing matched your filters.")
        return 0

    if args.dry_run:
        for e in sel:
            tgt = "class-%d/%s.pdf" % (e["classLevel"], e.get("file") or slug(e["subject"]))
            src = e.get("pdfUrl") or ("%d chapter files" % len(e.get("chapterUrls") or []))
            extra = (" (+ %d chapter files as fallback)" % len(e["chapterUrls"])) if e.get("pdfUrl") and e.get("chapterUrls") else ""
            say("Class %d | %-14s | %s [%s]" % (e["classLevel"], e["subject"], e["title"], e["language"]))
            say("    -> %s" % tgt)
            say("    from %s%s" % (src, extra))
        say("")
        say("Dry run finished: %d books would be fetched, about %d seconds of polite waiting at minimum." % (
            len(sel), int(len(sel) * args.delay)))
        return 0

    fetcher = Fetcher(args.delay, args.retries)
    man_path = os.path.join(BOOKS, "manifest.json")
    manifest = {}
    if os.path.exists(man_path):
        try:
            for r in json.load(open(man_path, encoding="utf-8")).get("books", []):
                manifest[(r["class"], r["title"], r["language"])] = r
        except Exception:
            pass
    counts = {"ok": 0, "skipped": 0, "partial": 0, "failed": 0}
    failed = []
    for i, e in enumerate(sel, 1):
        say("[%d/%d] Class %d - %s (%s)" % (i, len(sel), e["classLevel"], e["title"], e["language"]))
        try:
            res = process(e, args, fetcher, args.out)
        except KeyboardInterrupt:
            say("\nStopped by you. Run again later - finished books are skipped.")
            break
        except Exception as ex:  # keep going
            res = {"status": "failed", "error": "%s: %s" % (type(ex).__name__, ex)}
        counts[res["status"]] += 1
        say("    result: %s%s" % (res["status"].upper(), (" - " + res["error"]) if res.get("error") else ""))
        if res["status"] in ("ok", "skipped", "partial"):
            manifest[(e["classLevel"], e["title"], e["language"])] = manifest_row(e, res, args.out)
        else:
            failed.append(e)
    os.makedirs(BOOKS, exist_ok=True)
    rows = sorted(manifest.values(), key=lambda r: (r["class"], r["subject"], r["title"]))
    with open(man_path, "w", encoding="utf-8") as f:
        json.dump({"generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                   "note": "Personal-use copies of NCERT books; do not commit or redistribute the PDFs.",
                   "books": rows}, f, ensure_ascii=False, indent=2)
    say("")
    say("Done. downloaded: %(ok)d   already there: %(skipped)d   partial: %(partial)d   failed: %(failed)d" % counts)
    say("Manifest: " + man_path)
    if failed:
        say("Failed books (try again later, or use --include-mirror):")
        for e in failed:
            say("   Class %d - %s" % (e["classLevel"], e["title"]))
    return 1 if counts["failed"] or counts["partial"] else 0


if __name__ == "__main__":
    sys.exit(main())
