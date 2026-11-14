# Module 9: Parent dashboard

Page: `/parent` (parents only; needs a signed-in account).

## What a parent sees
- Per child (tabs when there is more than one): days learned in the last 7 days against a weekly goal, day streak, answers given, accuracy, topics due for revision, topics mastered.
- A 14-day activity chart (SVG, with a "Show as a table" fallback for screen readers).
- Progress by chapter with mastery labels.
- "Questions to help with": questions the child often gets wrong (2+ tries and over 40% wrong), so the parent can ask the child to explain them.
- Print report, Download progress (CSV), Download all data (JSON: profiles, progress, attempts, consents; no password data).

## API
- `GET /api/v1/account/dashboard?tz=<minutes>` - `tz` is `Date.getTimezoneOffset()` so days follow the family's own clock. 404 when the feature is off.
- `GET /api/v1/account/export` - needs `feature.parentDashboard` and `parent.export`.

## Admin switches (panel "Parent dashboard")
`feature.parentDashboard`, `parent.showAccuracy`, `parent.showActivity`, `parent.showWeakSpots`, `parent.weakSpotsCount`, `parent.weeklyGoalDays`, `parent.showStreak`, `parent.export`.

## Notes
- Progress shown is what the child has synced while signed in; guests are not visible here.
- Tamil strings are included; wording needs a native review.
