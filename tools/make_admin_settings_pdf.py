"""Make ADMIN_SETTINGS.pdf from a settings dump.
Usage (repo root):
  cd apps/api && npx tsx src/tools/dump-settings.ts > ../../settings.json && cd ../..
  python tools/make_admin_settings_pdf.py settings.json ADMIN_SETTINGS.pdf
Needs: pip install reportlab
"""
import json, sys, collections
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from xml.sax.saxutils import escape

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding="utf-8"))
panels, settings = d["panels"], d["settings"]
ss = getSampleStyleSheet()
H1 = ParagraphStyle("h1", parent=ss["Heading1"], fontSize=20)
H2 = ParagraphStyle("h2", parent=ss["Heading2"], fontSize=14, spaceBefore=10)
H3 = ParagraphStyle("h3", parent=ss["Heading3"], fontSize=11, spaceBefore=6)
B = ParagraphStyle("b", parent=ss["BodyText"], fontSize=9, leading=11.5)
C = ParagraphStyle("c", parent=B, fontSize=7.5, leading=9)

def val(v):
    if isinstance(v, dict): return v.get("en", "")
    if isinstance(v, bool): return "On" if v else "Off"
    if isinstance(v, list): return ", ".join(map(str, v))
    return str(v)

def rng(s):
    t = s["type"]
    if t == "number":
        bits = [f"{k} {s[k]}" for k in ("min", "max", "step") if k in s]
        return "number" + (" (" + ", ".join(bits) + ")" if bits else "")
    if t == "select":
        o = s.get("options", [])
        return "choose: " + ", ".join(str(x.get("value", x)) if isinstance(x, dict) else str(x) for x in o)
    return {"boolean": "on / off", "localized": "text (English + Tamil)", "text": "text", "color": "colour", "numberlist": "list of numbers"}.get(t, t)

doc = SimpleDocTemplate(out, pagesize=landscape(A4), leftMargin=24, rightMargin=24, topMargin=24, bottomMargin=24, title="SharpStudy admin settings")
S = []
S += [Paragraph("SharpStudy - admin settings and setup guide", H1),
      Paragraph(f"{len(settings)} settings in {len(panels)} panels. Generated from <b>packages/shared/src/settings.ts</b> by <b>tools/make_admin_settings_pdf.py</b>. Regenerate after adding or changing any setting.", B), Spacer(1, 8)]
S += [Paragraph("How the admin area works", H2),
      Paragraph("Open <b>/admin</b> on the site (local: http://localhost:3000/admin). Sign in with the user id in the server variable <b>ADMIN_USER_ID</b> and the secret <b>ADMIN_KEY</b>. Eight wrong tries lock the sign-in for 10 minutes. Change a setting, then press Save. The top search finds settings, tools and layouts. Use Layout gallery to preview Home, Subject and Lesson and then save a site-wide layout. Overview links to Site monitor and Jobs. Settings marked <b>public</b> are sent to visitors' browsers (never put secrets in them). A setting with <b>depends on</b> is only active while its parent switch is On. Every new site feature must have its own on/off setting here (owner rule).", B)]
S += [Paragraph("Server setup values (environment, not in the admin screen)", H2)]
env = [["Name", "Meaning"],
 ["NODE_ENV, PORT", "production / port (3100 on Oracle)"], ["DATABASE_URL", "PostgreSQL connection (local dev uses PGlite folder PGLITE_DIR)"],
 ["ADMIN_KEY, ADMIN_USER_ID", "Admin password and user id (owner sets; never share)"], ["WEB_DIR", "Folder of the built website (apps/web/dist)"],
 ["TUTOR_API_URL / KEY / MODEL", "Optional free OpenAI-compatible model for Ask the teacher; empty = lesson text only"], ["ACCESS_COOKIE_SECRET", "Optional secret for the invited cookie"],
 ["AUDIO_DIR, BOOKS_DIR, UPLOADS_DIR, STATS_FILE, REPORTS_FILE, MAIL_STATE_FILE", "Where audio, textbooks, uploads, view counts, reports and mail state are kept"],
 ["MALAR_URL, PARLER_URL, AUDIO_JOBS", "Speech servers (default http://localhost:8080 and :8090) and parallel audio jobs"],
 ["BACKUP_DIR, BACKUP_ROOT, BACKUP_KEEP", "Backup folder and number kept"],
 ["JOB_REPORT_TOKEN, JOB_REPORT_DIR", "Optional job reporter credential and private storage directory. See docs/admin-dashboard.md for setup."]]
t = Table([[Paragraph(escape(a), B), Paragraph(escape(b), B)] for a, b in env], colWidths=[250, 540])
t.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), .3, colors.grey), ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
S += [t, Paragraph("Owner-only setup: create Google/Facebook sign-in keys, SMTP mail details, Oracle server, DNS for sharpstudy.in. See deploy/README-DEPLOY.md.", B), PageBreak()]
for p in panels:
    ps = [s for s in settings if s["panel"] == p["id"]]
    if not ps: continue
    S += [Paragraph(f"{escape(p['label'])} panel  ({len(ps)} settings)", H2), Paragraph(escape(p["help"]), B)]
    secs = collections.OrderedDict()
    for s in ps: secs.setdefault(s["section"], []).append(s)
    for sec, items in secs.items():
        S.append(Paragraph(escape(sec), H3))
        rows = [[Paragraph(x, C) for x in ("Setting", "Key", "Type / range", "Default", "Public", "Depends on", "Help")]]
        for s in items:
            rows.append([Paragraph(escape(s["label"]), C), Paragraph(escape(s["key"]), C), Paragraph(escape(rng(s)), C), Paragraph(escape(val(s.get("default", ""))[:60]), C),
                         Paragraph("yes" if s.get("public") else "", C), Paragraph(escape(s.get("dependsOn", "") or ""), C), Paragraph(escape(s.get("help", "") or ""), C)])
        t = Table(rows, colWidths=[150, 120, 90, 80, 42, 100, 208], repeatRows=1)
        t.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), .25, colors.grey), ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
        S.append(t)
    S.append(PageBreak())
doc.build(S)
print("wrote", out)
