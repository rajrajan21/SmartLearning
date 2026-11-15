# Redesign notes (14 Nov 2026)

## Perplexity
The new Perplexity tab (https://www.perplexity.ai) would not accept interaction: the browser tool answered "Can't interact with browser-internal or unparseable URLs" for the tab after two navigations (the tab stayed on chrome://newtab). After the one allowed retry I continued on my own judgement using common kids-learning-site practice (large tap targets, bottom tab bar, one clear next action, forgiving streaks, progress shown as bars and rings, user-controlled text size). No Perplexity advice was received. Re-run the question later if wanted; the ranked list below can be compared with it.

## Built (all behind admin settings, new panel "Layout and navigation")
1. Bottom tab bar on phones (Home, Subjects, Revise, Progress, Account), 64px targets, labels optional. ui.bottomNav.enabled / showLabels.
2. A-/A+ text-size buttons, kept on device. ui.textSize.control, ui.textSize.maxPercent (110-200).
3. Home dashboard: "Continue where you stopped" card, streak and stars card, big shortcut tiles, larger class tiles. home.continue.show, home.rewards.show, home.quickLinks.show.
4. Daily streak, device-only, forgiving: rewards.streak.enabled, graceDays (0-3), maxShown.
5. Subject notebooks: picture icon, progress bar; chapter list: progress ring with tick when complete; two-column notebooks on small phones. browse.subjectIcons.show, subjectProgress.show, chapterProgress.show.
6. Parent link in footer. parent.link.show.
7. Mobile: sticky header, hidden margin line, tighter padding, safe-area padding for the tab bar. Reduced-motion rules unchanged (no new animation added).
8. i18n keys in English and Tamil (Tamil still needs native review).
Tests: apps/web/src/redesign.test.tsx (11), shared 34, web 76, API 109 all passing; web build OK.

## Skipped
- Hindi/other-language icons beyond letters, per-child rewards on the server (streak is device-only; sync later).
- Badges/avatars shop and sounds: out of scope for Rs 0 and original-art limits.
- Restyling Classroom/ClassBoard (off limits for this task).
- Dyslexia-friendly font option: needs a licensed font file check first.

## Round 2 (15 Nov 2026) - work log, tier by tier
Rules kept: every feature has a switch in packages/shared/src/settings.ts (panel "Layout and navigation"), English + Tamil strings in apps/web/src/lib/i18n.ts, device-only data, no external services. Off limits files untouched (Classroom.tsx, ClassBoard.tsx, classroom.ts, composeClassroom.ts, illustrate.ts, content/classroom, audio code).

### Round 2a (base brief) - DONE
Lesson page (one reading column, step dots, big "Next step", fixed Listen button, calm no-ruled-lines page), Progress page (10 badges, weekly calendar, "what to learn next"), Parent weekly summary (days, rough minutes, topics finished, topics needing another look; printable), accessibility (strong focus outline, 44px targets, high-contrast toggle, reduced motion respected), 360px polish.
Files: packages/shared/src/settings.ts, packages/shared/src/parent.ts (weeklySummary), packages/shared/test/parent.test.ts, apps/web/src/lib/{i18n.ts,streak.ts,badges.ts,browseStats.ts,theme.ts}, apps/web/src/components/{HighContrast.tsx,StepDots.tsx,RewardsPanel.tsx,LessonPlayer.tsx,Layout.tsx}, apps/web/src/pages/{Progress.tsx,Parent.tsx}, apps/web/src/styles.css, apps/web/src/redesign2.test.tsx.

### Tier 1 - DONE (built, tested, screenshot-reviewed at 360px and 1280px)
- "Try a free lesson now" on Home (first topic that has a lesson; no sign-in). home.tryLesson.show
- Game-board learning path on Home: zig-zag nodes, done / start here / coming up, streak flame. home.path.show, home.path.length
- Five-step mastery bar (Not started, Attempted, Familiar, Proficient, Mastered) on Progress and chapter pages, from existing local data. rewards.masteryBar.show
- Lesson split layout: on screens 1000px and wider the lesson has a side panel (steps outline, Ask the teacher); stacked on phones. Same layout for every lesson. lesson.split.enabled
- "Pick up where you left off" row (up to 5 recent lessons). home.recent.count
- Daily goal chip tied to streak. rewards.dailyGoal.enabled / .lessons
- Fixes found in screenshot review: ruled lines removed behind lesson text, heading focus box removed, lesson Next bar lifted above the phone tab bar, path connectors, high-contrast icon.
Files: apps/web/src/lib/round2.ts, apps/web/src/components/Tier1.tsx, apps/web/src/tier1.test.tsx, plus Home.tsx, Progress.tsx, Browse.tsx, LessonPlayer.tsx, styles.css, i18n.ts, settings.ts.

### Tier 2 - DONE (built, tested, screenshot-reviewed at 360px and 1280px)
- Top menu on wide screens (Home, Subjects, Explore, Revise, My progress, My notebook) replaces the single header Progress button; phones keep the bottom tab bar. components/MainNav.tsx
- Explore page /explore: themed colour galleries (Animals, Plants, Water, Food and health, Numbers and money, Shapes, Our Earth, People and festivals, More) with Class and Subject filters and theme chips. Themes come from keywords in topic/chapter names (lib/tier2.ts). Language filter NOT added: the language switch in the header already changes everything. browse.explore.enabled
- Chapter page: "Mission N" wording, syllabus preview (topics, about N minutes at 6 minutes per topic, what you will do with ticks). browse.syllabus.show, browse.missionWording.show
- Subject page: visual learning path of chapters coloured by progress; subject emoji on chapter rows. browse.path.show
- My notebook /notebook: heart button in the lesson bar saves favourite lessons on the device only (no accounts, uploads or sharing); printable "What I learned" sheet. notebook.enabled
- Progress page: friendly level (10 points per lesson + 5 per star, 50 per level), printable certificate. rewards.level.show, rewards.certificate.show
- Parent view: one card per subject (progress, mastery bar, finished this week, needs another look). parent.subjectCards.show
Files: lib/tier2.ts, pages/Explore.tsx, pages/Notebook.tsx, components/MainNav.tsx, tier2.test.tsx, parent2.test.tsx; edited Browse.tsx, Parent.tsx, Layout.tsx, LessonPlayer.tsx, RewardsPanel.tsx, Tier1.tsx, Home.tsx, Progress.tsx, App.tsx, mastery.test.tsx (chapter page now shows a topic name twice), styles.css, i18n.ts, settings.ts.

### Tier 3 items built (all switchable: explore.tryIt.show, home.didYouKnow.show, ui.pageTransition)
- Did-you-know daily card from a local list of 12 facts (EN+TA): lib/facts.ts, components/AppFeed.tsx (DidYouKnow)
- Try-it "equal groups" puzzle with a right-answer pop (reduced motion respected) and the same component as a free multiplication explorer on the Revise page: components/TryIt.tsx (Groups)
- Scrub-it slider (reusable Scrub) with a water-cycle example on Home: components/TryIt.tsx
- Gentle page slide-in (off when the device asks for less motion)

### Round 2c - Phone app view (own code; the ChennaiDeals source was not available to me, so this follows the brief, not that code)
Settings panel "Phone app view" (app.*). Master switch app.view.enabled; phones get it automatically (app.view.autoPhone); Me has "View the full website", the site shows a "Back to the app view" pill; choice kept in localStorage (ss_view).
- lib/appview.ts (phone detection that rejects tablets, iPadOS-as-Mac and computers; view and Light/Dark/Auto preferences; guarded vibration), lib/useApp.ts
- Home swipe feed (CSS scroll-snap): pick-up-where-you-left-off, today's mission with daily-goal ring, learning path, did-you-know, quick multiplication question, try-it puzzle, "You're all caught up" end card; chips on top (streak, goal, class sheet, subjects). components/AppFeed.tsx
- Bottom tab bar in app view: Home, Learn, big centre Practice, Progress, Me; 48-68px targets, safe-area insets, tap feedback. components/BottomNav.tsx
- App top bar with Back and quick settings; bottom sheets (slide up, drag down / Escape / Close to dismiss) for class picker, quick settings (colours, text size, language, view switch), chapter preview. components/AppBar.tsx, BottomSheet.tsx, MeSettings.tsx
- Light / Dark / Auto in Me; Auto follows the phone live (settings.tsx now watches the media query and the device choice).
- Lesson page: fixed bottom action bar (Back + big Next step), tab bar hidden on lessons, heart for notebook.
- Learn tab: colour/theme tiles, chapter preview sheet (topics, rough minutes), mastery bar on chapter rows, vertical learning path per subject. Me: notebook and parent links, Install SharpStudy (Android install prompt, iPhone 3 Safari steps).
- Installable: public/manifest.webmanifest (id, scope, PNG icons 192/512, shortcuts Practice and Continue lesson), apple-touch-icon.png, icon-192/512.png, iOS meta tags, viewport-fit=cover. Existing service worker (public/sw.js) was kept unchanged: it already caches only the app shell and curriculum data and never account/admin calls.
- 16px form fields on phones (no iOS zoom). Screenshots reviewed at 360px and 390px (Home, Learn, Subject, Lesson, Me, Progress).

### Round 2 - complete list of changed/new files
packages/shared: src/settings.ts, src/parent.ts, test/parent.test.ts
apps/web/index.html; public/manifest.webmanifest, public/apple-touch-icon.png, public/icon-192.png, public/icon-512.png
apps/web/src/lib: i18n.ts, streak.ts, badges.ts (new), browseStats.ts, theme.ts, settings.tsx, round2.ts (new), tier2.ts (new), facts.ts (new), appview.ts (new), useApp.ts (new)
apps/web/src/components: HighContrast.tsx, StepDots.tsx, RewardsPanel.tsx, Tier1.tsx, MainNav.tsx, BottomSheet.tsx, AppBar.tsx, AppFeed.tsx, MeSettings.tsx, TryIt.tsx (all new); LessonPlayer.tsx, Layout.tsx, BottomNav.tsx, QuestionCard.tsx (edited)
apps/web/src/pages: Explore.tsx, Notebook.tsx (new); Home.tsx, Browse.tsx, Progress.tsx, Parent.tsx, Account.tsx, Revise.tsx (edited); App.tsx; styles.css
apps/web/src tests: redesign2.test.tsx, tier1.test.tsx, tier2.test.tsx, parent2.test.tsx, appview.test.tsx (new); mastery.test.tsx (one assertion widened)

### Round 2d - the former "not done" items, now DONE (15 Nov 2026)
- Scroll sections: long explanations (3 or more paragraphs; lesson.scrolly.minParagraphs) become numbered step sections; the picture panel (lesson image blocks spread over the sections, or a drawn star/leaf card when the lesson has none) follows the section in the middle of the screen via IntersectionObserver. No IntersectionObserver = plain paragraphs. Reduced motion (device or site setting) = no fades. lesson.scrolly.enabled. lib/scrolly.ts, components/Scrolly.tsx
- Listen button inside the sticky bottom bar on phones, next to Next step. The slot is always reserved when the lesson has a teacher step (disabled and invisible on other steps), so Next step never moves (checked 360/390: same x and width on all 7 steps). The inline Listen is hidden on phones when this is on. lesson.listen.inBar
- Explore: Filters chip opens a bottom sheet (class, subject, language, clear, "Show topics (n)") on phones; theme chips scroll sideways. Language chip "Has Tamil" keeps topics that have a Tamil name (the site language switch is separate). browse.explore.sheet, browse.explore.langChip
- Pull-to-refresh on the phone Home feed: touch events only, starts only at the top, ignores sideways/multi-touch, rubber-band, no height animation under reduced motion; re-reads local progress and the daily card. app.feed.pullRefresh. lib/pull.ts, progress.ts refreshProgress()
- Layout fixes: Parent page (no ruled lines or margin, subject-style rows for chapter progress, 2-column stat tiles on phones, chart size), ruled lines off in the app view, Explore filter selects can no longer overflow, Home feed chip row fades at the right edge and scrolls, desktop Home hero now two columns (headline left, continue and goal right).
- The three console 404s in the coordinator's run came from a lesson URL (fair-share-halves-and-quarters/halves-and-quarters) that does not exist in content; real lessons load with no console errors.
- Files: packages/shared/src/settings.ts; apps/web/src/lib/{scrolly.ts,pull.ts,progress.ts,tier2.ts,i18n.ts}; components/{Scrolly.tsx,LessonPlayer.tsx,AppFeed.tsx}; pages/{Explore.tsx,Home.tsx}; styles.css; round2d.test.tsx, round2d.keys.ts.

### Still NOT done
- Offline "install" beyond the existing service worker.
- Native-speaker review of the new Tamil strings is still needed.

Final results (round 2d): shared 37, API see report, web 150 tests passing (web 18 files); web build OK.

## SharpStudy rename + access

**Rename.** The product is now **SharpStudy** (sharpstudy.in). One constant, `SITE` in `packages/shared/src/site.ts` (name, Tamil name, domain, url, tagline, invite-code prefix), feeds the settings defaults (`site.name`, privacy/terms/about text, maintenance message, worksheet footer, contact e-mail), the English and Tamil screen text (`lib/i18n.ts`), the admin preview, the invite page, `robots.txt` and `sitemap.xml`. `apps/web/index.html` (title, description, og tags, canonical) and `public/manifest.webmanifest` cannot import code, so a web test checks they match `SITE`. Kept on purpose: `@studysmart/*` package names, env var names, repo name, and server paths/service/database names in `deploy/` (only the visible name and domain were changed there). Deploy guide rewrite (Oracle/Spaceship/Search Console) was deliberately not done.

**Site access (Admin > Site access).** Settings: `access.mode` (`public` default | `invite`), `access.inviteCodeRequired` (pause switch: off keeps invite mode chosen but lets everyone in), `access.cookieDays`, `access.newCode.maxUses` / `access.newCode.expiryDays` (defaults for new codes, 0 = no limit), `access.gate.message` (EN+TA). Codes live in the `invite_codes` table (migration `0005`), stored as `SHARPXXXXXXXX`, shown as `SHARP-XXXX-XXXX`, with label, max uses, expiry and revoke.
- Admin API (ADMIN_KEY): `GET/POST /api/v1/admin/access/codes`, `POST /api/v1/admin/access/codes/:id/revoke`. Mode is switched with the normal settings save.
- Public API: `GET /api/access/status`, `POST /api/access/redeem {code}` (10 tries per IP per 10 minutes; use is counted atomically). Success sets an httpOnly, SameSite=Lax (Secure in production) signed cookie `ss_access` (HMAC; secret = `ACCESS_COOKIE_SECRET` or derived from ADMIN_KEY).
- Door (`accessGate` in `modules/access/routes.ts`): while closed, API calls get 401 `access_required` and page loads get a self-contained bilingual invite page. Let through: `/health`, `/api/access/*`, `/api/v1/admin*`, `/admin`, `/assets/*` (program files, no lessons), manifest, icons, `sw.js`, `robots.txt`, `sitemap.xml`. Cancelling a code locks out people who used it (checked every 10 s). The app also has an `AccessGuard` fallback (`components/AccessGate.tsx`).
- If the owner is ever locked out: open `/admin` (always reachable) and set the mode back to Everyone.
- Enabled only when `createApp` is given `access` (server.ts does this); existing tests are unaffected.


## Textbook reader (15 Nov 2026)

The three approved prototypes (A Hardcover, B Digital, C Library) are now one production reader with three looks. It opens the real textbook PDFs downloaded by `Download-Books.bat` / `tools/download_books.py`.

**Data and API.** PDFs stay out of git (`content/books/pdf/` and `content/books/manifest.json` are in `.gitignore`). `apps/api/src/modules/books/`:
- `GET /api/books` -> `{ books: [...], classes: [{ classLevel, subjects: [{ subject, books }] }] }`, read from `content/books/manifest.json` (rows as the downloader writes them: `class`, `subject`, `title`, `language`, `path`, `pages`, `bytes`, `kind`; `classLevel` / `file` are accepted too). Only books whose PDF is really on disk are listed. No manifest, broken manifest or no PDFs = an empty list, not an error.
- `GET /api/books/file/:class/:name` streams the PDF: `Content-Type: application/pdf`, `Content-Disposition: inline` (`?download=1` = attachment), range requests (206 / 416), `nosniff`. Names must be one plain `*.pdf` file name; the path is resolved inside `content/books/pdf` and checked again after following links, so nothing outside that folder can be read.
- Books the downloader could not merge (kind `chapters`, kept in `class-N/_chapters/<book>/`) are listed with a `chapters` array and served by `GET /api/books/file/:class/:book/:chapter`; the shelf shows them as "Part 1, Part 2 ...".
- Sits behind the invite-code door like every other `/api` route (401 `access_required` without the cookie), answers 404 while `feature.textbooks` is off and 503 in maintenance mode. `BOOKS_DIR` can point the server at another folder. The service worker never copies book PDFs into the offline cache (`sw.js` v4).

**Reader (`apps/web/src/components/reader/`, `apps/web/src/lib/reader/`).**
- `Reader.tsx` is the engine (port of the prototype `engine.js`): two-page spread with the covers alone, Web-Animations page turn, click on page edges / arrows / keyboard (arrows, PageUp/Down, Home, End, + - 0) / swipe, Previous / Next, Go to page, slider, zoom 100-300% with drag to pan, full screen, single page under 760 px, reduced motion (system setting and the site's Animation setting), 44 px targets, last page remembered per book (`ss_reader_page_<book>`). Style C also has the ribbon bookmark and night reading; style B the thumbnail strip (drawn lazily as it scrolls into view).
- `reader.css` is the prototype CSS, converted mechanically: every class prefixed `rd-`, every rule scoped under `.rd-wrap` / `.rd-a` / `.rd-b` / `.rd-c`, and the site's global heading / button / link rules are reset inside the reader. The six prototype fonts are bundled as local woff2 files. The reader is its own lazy-loaded chunk, so the rest of the site does not grow.
- `lib/reader/pdf.ts` is the only file that touches pdf.js (`pdfjs-dist`, free, Apache 2). The worker is bundled by Vite; the character maps, standard fonts, colour profiles and image decoders are copied from the package into `/assets/pdfjs/<version>/` by a small plugin in `vite.config.ts`. No CDN and no outside requests. Pages are drawn to a canvas at the size the screen needs (device pixel ratio up to 2, sharper when zoomed), kept as pictures in a small least-recently-used cache, and the next and previous spread are drawn ahead of time. Big books are fetched a piece at a time (range requests), not all at once.
- `lib/reader/sentences.ts` turns pdf.js text items (position from each item's transform) into sentences with highlight boxes: handles line breaks, headings, hyphenated line ends, abbreviations (Mr., Rs., initials), decimals, closing quotes, Hindi/Tamil sentence ends, long sentences cut at a comma, lone page numbers dropped. A scanned page gives an empty list and read aloud says "This page has no readable text."
- Read aloud uses `window.speechSynthesis` only (nothing is sent anywhere): sentence by sentence, pause / resume / stop, click a sentence in the transcript to read from there, highlight on the page and in the transcript, auto page turn (picture-only pages are skipped; it stops after three in a row). `lib/reader/voices.ts`: English picks the admin's accent, then en-IN, en-GB, any English; Tamil picks ta-IN, then any Tamil, and never borrows a voice of another language. A book whose manifest language (or subject) is Tamil starts in Tamil; the reader can switch the reading language per book. If the device reports no Tamil voice, a help box gives the steps for Android, Windows 11 and iPhone plus the note about Chrome/Edge online voices, with "Check again" and "Test voice"; the voice list then says "No Tamil voice on this device". Voice per language, speed and the auto-turn tick are remembered in localStorage.
- Download PDF is a plain link to the real file. Print opens a choice: "These pages" (prints the page pictures on screen) or "The whole book" (loads the PDF in a hidden frame and opens the browser's print window; if the browser refuses, the PDF opens in a new tab with a message).
- Style switcher: a small A / B / C select in the reader header (remembered in `ss_reader_style`), shown while `reader.allowStylePicker` is on.

**Navigation.** Class page (`/cbse/3`): after the subject tiles there is a last tile "Textbooks / See the textbook" (`TextbookEntry`), also shown at the end of Explore when one class is chosen. It opens `/books?class=N` (covers = first page of each PDF, drawn only when scrolled into view), which opens `/books/:class/:file` in the reader (full screen, outside the normal layout; `Site` in `App.tsx`). Everything is hidden when `feature.textbooks` is off or the class has no downloaded book. `/books` without a class lists every open class.

**Admin (new panel "Textbooks", plus one switch under Features).** `feature.textbooks` (on), `reader.style` a / b / c (default **c**), `reader.allowStylePicker` (on), `reader.readAloud` (on), `reader.voiceLang` (en-IN; en-GB, en-US, ta-IN), `reader.tamilVoiceHelp` (on), `reader.autoTurn` (on), `reader.defaultSpeed` (0.9, 0.5 to 1.5), `reader.showDownload` (on), `reader.showPrint` (on). All public, all with help text.

**Tests.** `packages/shared/test/settings.test.ts` (+3), `apps/api/test/books.test.ts` (11: list, empty cases, unsafe manifest rows, headers, ranges, download, chapters, path traversal, links, feature / maintenance / invite door), `apps/web/src/reader.test.tsx` (33: sentence grouping, voice choice, spreads, class-page entry visibility, shelf, the reader with a made-up book and a made-up speech engine). Test PDFs are made by `tools/make_book_fixture.py` (reportlab) into `apps/api/test/fixtures/books/`; nothing is put in `content/`. Totals: shared 42, API 138, web 190, all passing; web build OK.

**Checked in headless Chrome** (built site served by the API with the fixture books): all three styles at 1280x800, 900x700 and 390x800, English and Tamil interface: no console errors or warnings, no failed or outside requests, no sideways overflow, no overlapping controls, every control at least 44 px; page turn, keyboard, edge click, swipe, go-to, slider, zoom, print choice, night + bookmark, style switch remembered, last page remembered, auto-turn through a picture-only page to the back cover, Tamil book with and without a Tamil voice.

**Not verified / known limits.**
- Real sound: the checks used a made-up speech engine. Real voices, the Tamil voice steps on real phones, and iPhone's rule that speech must start from a tap need a try on real devices.
- Real NCERT PDFs could not be downloaded in the build sandbox; only small made-up PDFs were used. Large or scanned books, unusual fonts and speed on a slow phone are untested. Tamil-medium PDFs that use old non-Unicode fonts will give unreadable text, so read aloud will not work for those.
- "Print the whole book" relies on the browser's own PDF viewer inside a hidden frame; headless Chrome cannot show a print window, so only the fallback logic and the frame URL are tested.
- Sentence boxes are estimated from each text piece's width, so a highlight can be a few letters off in justified text.
- The read-aloud order follows the order of text inside the PDF; pages with several columns or text boxes may be read in an odd order.
- The new Tamil interface strings need the same native-speaker review as the rest.
- Seen while testing, not changed: the Class page on a 390 px phone already scrolls sideways by about 31 px (a long subject name in the two-column tile grid), with or without the new tile.


## Themes, palettes and admin sign-in (15 Nov 2026)

**Two independent choices** in Admin > Look and feel (`theme.preset` and `theme.palette`). A theme is structure (page background, panels, borders, shadows, corner feel, heading style, decoration); a palette is colours (brand, accent, paper, surface, text, muted, success, warning, subject colours, plus a dark version). Any theme works with any palette, in light and dark. Each theme has a recommended palette and mode ("Use the recommended palette for ...").

- Code: `packages/shared/src/look.ts` (THEMES, PALETTES, `resolveLook`, `customColors`), `color.ts` (contrast, mix, fit), `apps/web/src/themes.css` (all theme CSS, driven by hook variables; Notebook stays in `styles.css`), `apps/web/src/lib/theme.ts` (`themeVars` turns settings into CSS variables and `data-theme` / `data-palette`), `apps/web/src/admin/LookPicker.tsx` + `Preview.tsx` (live thumbnails use the real site classes).
- Palettes are written as seed colours; muted text, links, buttons, status colours and subject covers are automatically nudged so text always has at least 4.5:1 contrast (tests check every palette, light and dark: ink, muted, links, button text, success, warning, badge, subject covers).
- **Custom** palette = the old individual colour pickers, passed through exactly (they appear only when Custom is chosen). A site that already had saved colours is migrated on read to Notebook + Custom, so nothing changes until the admin picks a palette. The old one-click "Quick styles" set Notebook + Custom.
- Corner style and Heading font gained "Follow the theme" (new default); explicit choices still win.
- Decorations are pure CSS (gradients, dots, grid, SVG grain data URI); no images or fonts. High contrast mode and forced colours switch every decoration off; reduced motion still applies; the phone app view and tab bar use the same hooks. The textbook reader keeps its own style.
- A few hard-coded `#fff` text colours on success/brand fills now use `--on-success` / `--on-brand` so dark palettes keep AA contrast; classroom side panels follow the palette in dark mode (CSS only).

**Themes (15):** Playful Pop (Duolingo-style), Notebook (original), Calm Classroom (Khan), Code Lab (Codecademy), Friendly Mesh (Code.org), Cinematic Gold (MasterClass), Vivid Clean (Skillshare), Trusted Blue (Coursera), Crisp Utility (Canvas), Aurora Glass, Bold Blocks (neo-brutalist), Quiet Paper (Notion-like), Hardcover Desk, Pastel Digital, Sage Library (the last three from the textbook reader prototypes).
**Palettes (25 + Custom):** Indigo Dawn, Mint Fresh, Sunset Coral, Ocean Teal, Grape Soda, Forest Calm, Berry Pop, Slate & Lime, Warm Sand, Midnight Neon, Rose Quartz, Sky & Sunshine, Notebook Blue, Walnut & Cream, Pastel Digital, Sage Library, Parrot Green, Teal & Navy, Navy & Sun, Teal & Purple, Black & Gold, Vivid Green, Trusted Blue, Classic Red, Soft Ink.

**Recommended default: Playful Pop + Indigo Dawn.** For children 8 to 12 and their parents: chunky rounded buttons that visibly press down are easy to see and tap (48 px), indigo on near-white has strong contrast (AA for all text) and is safe for common colour-blindness (no red/green dependency), the amber accent adds warmth without noise, and the background is only a faint dot pattern, so it is cheap to paint and fast on phones. "Reset to recommended" in the panel restores it (Save to apply).

**Admin sign-in.** `/admin` now asks for a User id (pre-filled `itsme.rajrajan@gmail.com`) and the existing ADMIN_KEY. Env `ADMIN_USER_ID` (default as above; in `.env.example` and `deploy/studysmart.env.example`). The server checks both in constant time (SHA-256 digests, `timingSafeEqual`), the id ignoring upper/lower case; a wrong id or key gives the same message and counts towards the same per-IP lockout (8 tries / 10 minutes). Headers: `x-admin-user` (URL-encoded) and `x-admin-key`. `createApp` only enforces the id when given `adminUserId` (server.ts always does), so older tests that use only the key still pass; new tests cover the id.

**How to preview locally.** Start `Start-StudySmart-Local.bat` (PORT 3000, its own local test key; the key is not repeated here). Students' view: http://localhost:3000/ ; admin: http://localhost:3000/admin (user id is pre-filled, paste the key from the bat). In Look and feel pick a theme and palette, watch the live preview, press Save changes, then refresh the user view (visitors see changes within a minute because of caching).

## Reader v2 and classroom question mode
- Reader: pages prefetch 3 spreads ahead with a quick small picture first, bigger chunk requests; book fills the stage; the centre grey shading was removed in all three styles.
- Classroom: on question steps the board hides all text and keeps solids turning (`quiet`); new animated `flow` object (water); tap scene and question added to the Saving water lesson; irrelevant wrong options replaced in 10 questions.
- Standards for all future lessons: docs/18-lesson-authoring-standards.md.
