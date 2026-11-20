#!/usr/bin/env python3
"""
Fetches openly licensed pictures for the classroom boards from Wikimedia Commons.

  python tools/pictures/fetch_pictures.py [--only src1,src2] [--retry-failed] [--dry]

Reads tools/pictures/manifest.json (made by `pnpm --filter @studysmart/api visuals:build`), and for every picture that is not
yet in apps/web/public/pictures/credits.json it:
  1. tries the exact Commons file titles, then searches Commons with the query;
  2. checks the licence through the Commons API (extmetadata) and keeps ONLY public domain, CC0, CC BY and CC BY-SA files;
     anything else (NC, ND, fair use, unknown, or with usage restrictions) is skipped;
  3. skips anything that looks like a picture of a person (never a private person's photo);
  4. downloads a thumbnail no wider than the admin's "Widest picture", saves it as WebP no bigger than the admin's "Largest picture file";
  5. writes the credit (title, author, licence, source link) to credits.json, which the board shows as a credit line.
It waits between requests (admin: "Pause between downloads"), backs off on 429, and writes fetch-pictures-report.txt.
Needs Python 3 and Pillow (pip install pillow). Costs nothing: only Wikimedia's free public API is used.
"""
import io, json, os, re, sys, time, html, urllib.parse, urllib.request, urllib.error

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MANIFEST = os.path.join(ROOT, "tools", "pictures", "manifest.json")
CONFIG = os.path.join(ROOT, "tools", "pictures", "config.json")
OUT = os.path.join(ROOT, "apps", "web", "public", "pictures")
CREDITS = os.path.join(OUT, "credits.json")
REPORT = os.path.join(ROOT, "fetch-pictures-report.txt")
API = "https://commons.wikimedia.org/w/api.php"
UA = "SharpStudyPictureFetcher/1.0 (https://sharpstudy.in; educational, non-commercial free learning site)"

ALLOWED = re.compile(r"^(public domain|pd\b|pd-|cc0|cc[ -]by([ -]sa)?[ -]\d|cc[ -]by([ -]sa)?\b)", re.I)
REJECT = re.compile(r"(\bnc\b|-nc|noncommercial|non-commercial|\bnd\b|-nd|noderiv|fair use|all rights reserved|copyrighted|gfdl|unknown|permission only)", re.I)
PERSON = re.compile(r"(portrait|selfie|\bchild(ren)?\b|\bboys?\b|\bgirls?\b|\bwoman\b|\bwomen\b|\bman\b|\bmen\b|\bstudents?\b|\bpeople\b|\bcrowd\b|\bbaby\b|\bfamily\b|\bwedding\b|\bactor\b|\bactress\b|\bminister\b|\bpolitician\b)", re.I)

log_lines = []
def log(*a):
    s = " ".join(str(x) for x in a); log_lines.append(s)
    try: print(s)
    except UnicodeEncodeError: print(s.encode("ascii", "replace").decode("ascii"))

def settings():
    cfg = {"maxKb": 90, "maxWidth": 900, "delayMs": 1500}
    try:
        cfg.update({k: v for k, v in json.load(open(CONFIG)).items() if k in cfg})
    except Exception: pass
    base = os.environ.get("STUDYSMART_API", "http://localhost:3000")
    try:  # the admin's Visuals: pictures page, when the site is running on this PC
        with urllib.request.urlopen(base + "/api/v1/settings", timeout=3) as r:
            data = json.load(r); vals = data.get("values", data) if isinstance(data, dict) else {}
            for k, name in (("maxKb", "visualpics.maxKb"), ("maxWidth", "visualpics.maxWidth"), ("delayMs", "visualpics.delayMs")):
                if isinstance(vals.get(name), (int, float)): cfg[k] = vals[name]
            log("Using the limits from the running site's admin settings.")
    except Exception:
        log("Site not running here; using tools/pictures/config.json (or the defaults).")
    return cfg

def get(url, params=None, binary=False, tries=4):
    if params: url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    for n in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read(); return data if binary else json.loads(data.decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and n < tries - 1:
                wait = 10 * (n + 1); log(f"  server asked us to slow down ({e.code}); waiting {wait}s"); time.sleep(wait); continue
            raise
    return None

def clean(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()

def info(title, width):
    d = get(API, {"action": "query", "format": "json", "titles": title, "prop": "imageinfo|categories", "cllimit": "30",
                  "iiprop": "url|size|mime|extmetadata", "iiurlwidth": width, "iiextmetadatafilter": "LicenseShortName|UsageTerms|License|Restrictions|Artist|Credit|ObjectName|ImageDescription"})
    pages = (d.get("query") or {}).get("pages") or {}
    for p in pages.values():
        if "imageinfo" in p: return p
    return None

def judge(p):
    """returns (ok, reason, credit)"""
    ii = p["imageinfo"][0]; md = ii.get("extmetadata") or {}
    val = lambda k: clean((md.get(k) or {}).get("value", ""))
    lic = val("LicenseShortName") or val("UsageTerms")
    title = p["title"].replace("File:", "")
    cats = " ".join(c["title"] for c in p.get("categories", []))
    if ii.get("mime") not in ("image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"): return False, "not a normal picture file", None
    if not lic: return False, "no licence stated", None
    if REJECT.search(lic) or not ALLOWED.search(lic): return False, f"licence not allowed ({lic})", None
    if val("Restrictions"): return False, f"usage restrictions ({val('Restrictions')})", None
    if PERSON.search(title) or PERSON.search(cats): return False, "looks like a picture of a person", None
    if ii.get("width", 0) < 400: return False, "too small", None
    author = val("Artist") or val("Credit") or "Unknown author"
    return True, "ok", {"title": val("ObjectName") or title, "author": author[:120], "license": lic, "source": ii.get("descriptionurl") or ii.get("url")}

def to_webp(raw, max_kb, max_w):
    from PIL import Image
    im = Image.open(io.BytesIO(raw)); im.load()
    if im.mode not in ("RGB", "RGBA"): im = im.convert("RGBA" if "transparency" in im.info or im.mode in ("P", "LA") else "RGB")
    w = min(max_w, im.width)
    while w >= 320:
        sized = im if im.width <= w else im.resize((w, max(1, round(im.height * w / im.width))), Image.LANCZOS)
        for q in (82, 74, 66, 58, 50, 42, 34):
            buf = io.BytesIO(); sized.save(buf, "WEBP", quality=q, method=6)
            if len(buf.getvalue()) <= max_kb * 1024: return buf.getvalue(), sized.width, q
        w = int(w * 0.8)
    return None, 0, 0

def main():
    args = sys.argv[1:]; dry = "--dry" in args
    only = set(args[args.index("--only") + 1].split(",")) if "--only" in args else None
    cfg = settings(); os.makedirs(OUT, exist_ok=True)
    try: credits = json.load(open(CREDITS))
    except Exception: credits = {}
    manifest = json.load(open(MANIFEST))["pictures"]
    failed_path = os.path.join(ROOT, "tools", "pictures", "failed.json")
    try: failed = json.load(open(failed_path))
    except Exception: failed = {}
    got = skipped = 0
    for pic in manifest:
        src = pic["src"]
        if only and src not in only: continue
        if src in credits and os.path.exists(os.path.join(OUT, src + ".webp")): continue
        if src in failed and "--retry-failed" not in args: log(f"[skip] {src}: failed before ({failed[src]}); use --retry-failed to try again"); continue
        log(f"[{src}] {pic['alt']}")
        titles = list(pic.get("files") or [])
        for qi, qtext in enumerate([pic["query"]] + list(pic.get("altQueries") or [])):
            try:
                r = get(API, {"action": "query", "format": "json", "list": "search", "srsearch": qtext + " filetype:bitmap", "srnamespace": "6", "srlimit": "10"})
                titles += [h["title"] for h in (r.get("query") or {}).get("search", []) if h["title"] not in titles]
            except Exception as e: log("  search failed:", e)
            time.sleep(cfg["delayMs"] / 1000)
        done = False; why = "no suitable free picture found"
        for t in titles:
            try:
                p = info(t, cfg["maxWidth"])
                time.sleep(cfg["delayMs"] / 1000)
                if not p: continue
                ok, reason, credit = judge(p)
                if not ok: log(f"  - {t}: {reason}"); why = reason; continue
                if dry: log(f"  would use {t} ({credit['license']})"); done = True; break
                ii = p["imageinfo"][0]
                raw = get(ii.get("thumburl") or ii["url"], binary=True)
                time.sleep(cfg["delayMs"] / 1000)
                data, w, q = to_webp(raw, cfg["maxKb"], cfg["maxWidth"])
                if not data: log(f"  - {t}: could not shrink under {cfg['maxKb']} KB"); why = "too big"; continue
                open(os.path.join(OUT, src + ".webp"), "wb").write(data)
                credit.update({"file": t, "bytes": len(data), "width": w}); credits[src] = credit
                json.dump(credits, open(CREDITS, "w"), indent=1, ensure_ascii=False)
                log(f"  saved {src}.webp ({len(data)//1024} KB, {w}px, quality {q}) from {t}: {credit['license']} by {credit['author']}")
                done = True; break
            except Exception as e:
                log(f"  - {t}: {e}"); why = str(e)[:80]
        if done: got += 1
        else: skipped += 1; failed[src] = why
    if not dry: json.dump(failed, open(failed_path, "w"), indent=1)
    log(f"Done. Saved {got}, could not find a free picture for {skipped}. Credits are in apps/web/public/pictures/credits.json.")
    open(REPORT, "w", encoding="utf-8").write("\n".join(log_lines) + "\n")

if __name__ == "__main__":
    main()
