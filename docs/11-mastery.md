# Mastery and daily revision (Module 7)

## Mastery (how well a topic is known)
Computed from what the child did, never guessed (`packages/shared/src/mastery.ts`, used on the screens):
- Not started: nothing done. Learning: lesson started or finished, no round passed. Practising: some round passed or tried. Strong: every round passed. Mastered: every round passed with 2+ stars (90%+).
- Percentage = lesson 20% + the best score of every available round 80% (practice only, if a topic has no lesson; lesson only, if no questions).
- A chapter shows the average of its topics that have content. Topics with no lesson or questions yet are left out, so nothing looks "failed" because it is not written.
- Shown as a tag on chapter pages, and on **My progress** (`/progress`) for every open class and subject.

## Daily revision (remembering over time)
Leitner boxes, one per question. Every graded answer (practice, lesson checkpoints, revision) updates the schedule:
- Wrong: back to box 1, comes back tomorrow. Right: moves up one box and returns after a longer gap (default 1, 3, 7, 14, 30 days). A question first seen and answered right starts at box 2.
- Repeating a question before it is due does not inflate its box.
- `/revise` serves up to N due questions (default 10), oldest first, with the same cards, hints and teacher voice as practice. The home page shows a card when something is due.
- Stored on the device and synced to the signed-in child's account (`student_progress` kind `revision`, latest review wins). Questions are fetched by id from `POST /api/v1/practice/by-ids` (published only, answers never included).

## Admin settings (Admin > Mastery and revision, and Features)
Mastery and revision on/off, badges on chapter pages, home revision card, My progress page, revision on/off, most questions per revision, the day gaps.

## Later modules use this
The parent dashboard (Module 9) and the AI tutor (Module 8) read the same mastery and revision data.
