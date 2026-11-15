# 17 - Textbooks (NCERT classes 3-7): download, copyright, reader, read-aloud

Plain-language notes. Written 2026-11-15.

## 1. What we have

- `content/books/sources.json` lists every book and where to get it.
- `tools/download_books.py` (run through `Download-Books.bat`) downloads them to
  `content/books/pdf/class-N/<book>.pdf` and writes `content/books/manifest.json`
  (title, class, subject, pages, bytes, sha256, source URL).
- Each entry has a **tier**:
  - `primary` - official ncert.nic.in file (full-book `...1ps.pdf` plus per-chapter fallback). On by default.
  - `mirror` - Google Drive copy on learncbse.in (mostly Hindi-medium and arts/PE/Sanskrit/Urdu, Class 6 only). Use `--include-mirror`.
  - `legacy` - old pre-2023 syllabus zips (Marigold, Math-Magic, Honeysuckle...). Use `--include-legacy`. These are outdated; use only if a school still follows them.
- Examples: `Download-Books.bat --dry-run`, `Download-Books.bat --class 6`, `Download-Books.bat --class 3 4 --subject maths`.
- Install `pypdf` (`pip install pypdf`) to get one merged PDF per book. Without it the chapters are kept separately.

### Honest status of the links

- The research sandbox could not open ncert.nic.in pages (its robots.txt blocks automated fetchers), so most `primary` URLs come from
  third-party listing pages (studywithshradha.in) that link to ncert.nic.in. Two were confirmed by search-result titles
  (Class 6 Curiosity `fecu1ps.pdf`, Poorvi `fepr1ps.pdf`) and one (Class 7 Ganita Prakash Part I `gegp1ps.pdf`) was opened and read.
  Every entry has a `verification` field saying which. The first real run on your laptop is the true test; failures are reported, not hidden.
- NCERT file-name pattern (seen consistently): first letter = class (c=3, d=4, e=5, f=6, g=7), second = medium (e=English, h=Hindi),
  then a 2-letter book code, then `1ps.pdf` (full book) or `NNN.pdf` (chapter). Books in two parts use `1xx` and `2xx` chapter numbers.

### Coverage (current series, English/Hindi books NCERT publishes online)

| Class | Books in sources.json (primary) | Not found / gaps |
|---|---|---|
| 3 | Maths Mela, Santoor (English), Veena (Hindi), Our Wondrous World (EVS) | Arts (Bansuri), Khel Yoga (PE), Urdu (Sitar), Hindi-medium Maths and EVS: only Drive chapter links seen |
| 4 | Maths Mela, Santoor, Veena, Our Wondrous World | Same as class 3 |
| 5 | Maths Mela, Santoor, Veena, Our Wondrous World | Same; Maths chapter 16 possibly missing from listing |
| 6 | Ganita Prakash, Curiosity, Poorvi, Malhar, Exploring Society (Part 1) | Part 2 of Maths and Social Science (if any) not seen; Hindi-medium, Sanskrit, Urdu, Arts, PE, Vocational only as Drive mirrors |
| 7 | Ganita Prakash (Part 1 + Part 2 chapters), Curiosity, Poorvi, Malhar, Exploring Society (Part 1 + Part 2 chapters) | No full-book URL seen for Part 2 books; Hindi medium, Sanskrit, Urdu, Arts, PE not found |

Classes 3-5 have no separate Science / Social Science books (they are inside EVS).

## 2. Copyright and terms - what NCERT says

What I could read:

1. NCERT public notice (official, ncert.nic.in): https://ncert.nic.in/pdf/announcement/notices/NCERT_Press_Release_book_sst.pdf
   - "Such unauthorised printing, reproduction, distribution and digital circulation of NCERT's copyrighted material is illegal" and "constitutes a punishable offence under the Copyright Act, 1957."
   - Textbooks are released "only through the official channels of the Council"; digital copies are "made available free of cost on the official NCERT website" and the e-Pathshala portal.
   - It does not describe any licence for reuse. Questions go to NCERT (the notice gives secy.ncert@nic.in).
2. NCERT copyright policy on its OSRE site: https://osre.ncert.gov.in/copyright-policy
   - "The contents of this website may not be reproduced partially or fully, without due permission." Permission must come from NCERT; if referred to in another publication the source must be acknowledged; no misleading or objectionable use.
   - It does not mention hosting or redistribution explicitly.

What I could NOT read: the copyright / terms pages on ncert.nic.in itself (blocked by robots.txt for my tool), and the copyright page inside the PDFs.
NCERT textbooks normally carry an "All rights reserved ... no part may be reproduced ... without prior permission of the publisher" notice, but I did not verify the wording for these editions.

**Reading of this, not legal advice:** free to download for personal study does not mean free to re-host or redistribute. No open licence (e.g. Creative Commons) was found.

### Recommendations

- Do not host NCERT PDFs (or text/images extracted from them) on studysmart.in until NCERT permission is confirmed in writing.
  Email NCERT (secy.ncert@nic.in) describing the free, non-commercial, school-student use and ask specifically about: hosting copies, text-to-speech of the text, and showing excerpts.
- Until then, **link** to the official ncert.nic.in file for each chapter, or let each user run the downloader on their own device so the file stays on their machine.
- Always show attribution: "Source: NCERT, ncert.nic.in".
- Add to `.gitignore` so the PDFs never reach GitHub:

```
# NCERT textbooks (copyright - personal copies only)
content/books/pdf/
content/books/manifest.json
```
  (`sources.json` is only a list of links, so it is fine to commit. Keep `manifest.json` out if you prefer; it only holds hashes and page counts and is also safe.)

## 3. Plan: reader and read-aloud (not built yet)

**Reader**
- Pick class -> subject -> chapter. For now the reader opens the **official NCERT URL** in an in-page viewer or new tab (no copy of ours).
- Once permission exists (or for the owner's own laptop): render the local PDF with the browser's built-in viewer or PDF.js, page by page, with next/previous, zoom, and "remember where I stopped" in localStorage.
- Keep chapter metadata (title, class, subject, page range) in our own JSON, built from `manifest.json` / `sources.json`.

**Read-aloud**
1. **Default, zero cost, instant:** the browser `speechSynthesis` API. Choose a voice by language tag (`en-IN`, `hi-IN`), rate slider (0.7x-1.2x for young children), highlight the sentence being spoken, pause/resume. No download, works offline on most devices, nothing leaves the device. Voice quality varies by phone/browser.
2. **Optional upgrade:** on-device **Kokoro** TTS (small open-weight model run in the browser via WebAssembly/WebGPU). Offer it as an opt-in "Better voice" download (tens of MB, cached). Check which languages the chosen Kokoro build supports - Hindi support must be confirmed before promising it; fall back to speechSynthesis otherwise.
3. Text source: scanned or image-heavy pages will not read well. Extract text per page (PDF.js `getTextContent`) and read that; skip figures, read captions. Hindi PDFs may use legacy fonts that extract as garbage - test each Hindi book before offering read-aloud for it.
4. Privacy: all speech runs on the child's device; no text is sent to a server.
5. Copyright note: text extraction for reading aloud is a use of NCERT text - include it in the permission request above.
