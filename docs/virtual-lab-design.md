# SharpStudy Virtual Lab pilot

The pilot opens two experiments for student review. The desktop menu places Virtual Lab between Question papers and GK. The site’s mobile navigation and home shortcuts also link to the lab hub.

## Curriculum and teaching

- Transformer Playground explores AC versus steady DC, coil turns, and ideal voltage ratios. It is a senior-secondary concept preview, aligned to the transformer explanation in [NCERT Physics, Alternating Current](https://ncert.nic.in/textbook/pdf/leph107.pdf).
- Colour and pH is a Class 10 practical companion. Its virtual indicator and representative samples build on the [CBSE Class X practical skills guide](https://www.cbseacademic.nic.in/web_material/publication/archive/cbse-st-X.pdf). It teaches prediction and comparison and uses a simplified dilution model.
- Upcoming board-specific work should verify chapter and practical identifiers against the current CBSE and TN Matric curricula, then add class filters. Future Biology, Physics and Chemistry pilots can reuse the same lesson structure. Expand after reviewing student feedback on the two initial labs.

## Architecture

- /virtual-lab lists the registry. /virtual-lab/:id opens one experiment through the normal SharpStudy shell and access gate. The Web Admin feature switch controls both routes and the navigation.
- virtualLabData holds stable slugs, subject and school level, walkthrough cues, captions and pure simulation calculations. Each experiment owns its controls, reset and challenge state. virtualLabScene renders the observed changes with Canvas. Native controls and text readings remain usable with a keyboard, paused motion and reduced-motion settings.
- Two short tips appear on the first visit to each lab and can be reopened with How to use. Dismissal is stored in that browser. Motion and voice are separate. Recording playback is user-triggered, with an identical transcript available on screen.
- The first release uses the built-in English tour’s Malar voice (Kokoro af_heart at the tour speed). The eleven pre-recorded MP3s are served from the site. Generation and decoding are offline build steps, and the lab itself sends no prompts or learner data to third-party services.
- The supplied Gemini prototype informed the control and challenge ideas. The public preview uses SharpStudy components and its own visual system. The [Zperiod reference](https://zperiod.app/virtual-lab/) informed the concise first-use walkthrough.

## Review and expansion

1. Check the two existing experiments on desktop, mobile and with keyboard navigation. Compare AC and DC, change the turns ratio, reset both labs, and listen to the walkthrough and result narration.
2. Verify curriculum and scientific accuracy before adding practical-match labels. For each approved lab, add its route, observable variables, beginner challenges, model limits, walkthrough transcript and recorded clips. Keep generic labs discoverable independently of grade or board.
3. For a future Gemini-assisted design pass, provide the learning objective, age range, verified formula or observation, and validation cases. Ask for parameter bounds, visual cues, accessibility alternatives and caption text for human review. Run any future student-facing AI through the site’s server-side provider controls and verify child privacy and moderation before enabling it.

## Three-pack integration

The Virtual Lab catalogue groups the 30 supplied workbenches by Physics, Chemistry, and Biology. It also supports pack and title filters. Each experiment has a canonical /virtual-lab/:id path. The former transformer and pH URLs are reused, with the compact pilot layouts available from the same page.

The workbench loads exactly one of the original standalone HTML layouts with its starting experiment selected by query string. The integration keeps the original control deck, Canvas, Auto-Solve, concept modal, mode switch, Save HTML, and docked tutor. A same-origin message lets the site open the selected experiment's canonical link and resize the frame to its workspace. The static files also run on their own.

The HTML packs retain the browser-selected English voice and their built-in tutor answers. The standalone Gemini proxy and custom speech endpoints are blank. A restrictive content policy prevents the supplied files from calling network services. Malar recordings remain in the compact pilot views.

To import another supplied pack, review the document's source, then run the prepare-suite.py script in tools/virtual-lab with the supplied HTML path and the new public output path. Register the pack and its experiment identifiers in VirtualLabWorkbench.tsx. Browser-check every direct link, the toolbar, in-pack navigation, mobile layout, and the exported HTML. Keep exact board and class mappings separate until checked against the applicable syllabus.

## Science Pack 4, Maths Playground and faster navigation

The catalogue contains 54 distinct workbenches. Subject tiles, search, science-pack filters and four maths topics provide different ways to find a lab. Heading and control colours use the active theme's foreground and surface. The HTML workbenches retain their own simulation palettes, controls, Save HTML and narration.

Sharp Teacher AI is the common student-facing name in topics, lessons, Classroom, practice and labs. The classroom and practice helper uses SharpStudy lesson material, and the lab panel uses the supplied built-in explanations. SharpStudy does not route student text to standard Gemini API or Google Cloud generative endpoints. Their published age restrictions apply to services directed at under-18s. See https://aistudio.google.com/docs/terms#age-requirements and https://cloud.google.com/terms/service-terms.

The browser coalesces in-flight curriculum tree, lesson availability and Classroom index requests. Reopening a page within 30 seconds reuses the last successful result. Existing retry and offline paths remain available. Account screens, book contribution forms and the step-by-step lesson player are loaded on demand. A local Vite production build reduced the startup JavaScript chunk from 298.61 to 274.28 kB gzip (8.1%). This measures the startup artifact, rather than a site-wide page-load time.
