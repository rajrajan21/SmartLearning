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
