# Question-paper sites: research (2026-11-17)

Nothing was downloaded and nothing was enabled. All entries are in `sites-research.json` (disabled). The harvester reads only `sites.json`.

## Ranked list
| # | Site | Board / classes | Type | Priority | Verdict |
|---|---|---|---|---|---|
| 1 | cbseacademic.nic.in (2026-27 pages, plus 2025-26 already seeded) | CBSE 10, 12 (9, 11 older pages) | Sample paper + marking scheme, PDF | 95 | Harvest first |
| 2 | dge.tn.gov.in (Sample Question papers, Question Bank) | TN SSLC, HSC+1, HSC+2 | PDF | 85 | Harvest first; PDF links need the discovery run |
| 3 | digitallibrary.kvklibrary.in (KV question papers) | CBSE 10, 12 pre-board | Direct PDFs | 70 | Second |
| 4 | KVS regional sites (incl. Chennai region) | CBSE 10, 12 pre-board | PDF | 60 | Discover first (Chennai address unverified) |
| 5 | ncert.nic.in exemplar | NCERT 6-12 Maths/Science | Practice problems | 55 | Third |
| 6 | kalvikavi.com | TN 6-12 term papers | Google Drive PDFs | 50 | Owner decision (copyright unclear) |
| 7 | padasalai.net | TN 1-12 term papers | Drive/other | 45 | Owner decision |
| 8 | educationobserver.com | TN 6-12 | Forum PDFs | 30 | Low |
| 9 | tnscert.org | TN 12 (2019) | PDF | 25 | Skip: robots blocked our fetch |
| - | Careers360, AglaSem, Tiwari, Allen, PW, Vedantu, Oswaal, Surabooks, YaClass, Shaalaa, Sahodaya blogs | various | commercial | 0 | Skip |

## Key findings and honest gaps
- Official free sources exist mainly for CBSE 9-12 and TN SSLC/HSC. Official papers for **CBSE classes 1-8** and **TN classes 1-9 term papers** were not found; those exist only on community blogs (Google Drive links, teacher-made, no licence).
- **Matriculation:** no separate Matric paper site found. Matric schools use the Tamil Nadu State Board (Samacheer) syllabus, so State Board papers are the right match.
- Careers360 blocks PDFs in robots.txt; aggregators are copyrighted or unclear, so skip or owner-approve.
- Our research tool was refused by robots.txt on cbseacademic.nic.in, tnscert.org and ncert.nic.in. The harvester follows its own robots check and will log those as blocked if they apply; then use PC browser mode (Install-Papers-Browser.bat) only where the owner is comfortable.
- cbseacademic Class XII 2026-27 address and the dge.tn.gov.in PDF addresses are unconfirmed.

## Recommended order
1. Run `Discover-Question-Paper-Sites.bat` once (checks robots, reachability, PDFs found).
2. Harvest: cbse-academic (2025-26 then 2026-27), dge-tn, kv-digital-library, then ncert-exemplar.
3. Ask the owner about kalvikavi/padasalai before enabling (copyright unclear, Drive links).

## Proposed schedule (Schedule-Question-Papers.bat)
- 3 runs a day, 10 papers per run (current default): about 06:30, 13:30, 20:30 IST.
- Pause 8 s between requests on government sites (current default 6 s is fine for others); keep max 300 MB until the server move.
- Classes: keep 9-10 for now (add 11, 12 when Class 11-12 lessons exist; no books yet). CBSE 10/12 sample papers are the biggest first-week volume, roughly 5-10 days at 30 papers/day.
- After the official sources are exhausted, raise to 4 runs x 15 only if the owner approves community sites.
