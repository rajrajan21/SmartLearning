# SharpStudy admin dashboard

Open `/admin` using the existing admin sign-in. Overview shows the API, recent traffic and the two Kani job sources. Use the header search to find settings, admin tools and layout presets. Down Arrow moves into results, Up and Down move between results, Enter opens the focused result, and Escape clears the search. The Site settings dropdown contains availability, branding, language, access and related settings. The existing reports, tools, settings import/export and change log are still available from the navigation.

## Layouts and the sample lesson

Open **Layout gallery** from the sidebar or **Choose a layout** from Overview. Select Classic, Classroom, Study Path, Subject Explorer, Student Dashboard, Activity Hub or Reading Room. **Preview real pages** opens a view of Home, Subject or Lesson with a desktop or phone viewport. The preview uses the current browser session and respects invitation and maintenance settings. **Save … for the site** changes the one site-wide layout setting. Other unsaved settings stay in the draft. Classic is the default for existing installations without a saved layout.

The sample opens the Class 6 CBSE Classroom lesson **Magnetic and non-magnetic things**. It requests Kani on the sample entry, retains the normal voice picker and links to the rest of Exploring Magnets. Home checks the published classroom index and class availability. If the classroom sample is unavailable, the existing available-lesson selection is used. The setting **Showcase the interactive magnets sample** controls this choice. Students keep the normal resume link and the site continues to apply its access policy.

## Monitor readings

- Online indicates that this API process answered. Process and host uptime are separate. CPU is the host average since the previous sample. Windows does not expose load averages through Node.
- Disk figures are for the content volume. Directory sizes are logical file bytes. Scans skip symlinks, stop after five seconds or 180,000 entries per directory scan, and share a two-minute cache. A partial count is a lower bound. The content directory scan excludes the configured audio directory when it is nested there. Database size comes from PostgreSQL.
- On Linux the backup directory defaults to `/var/backups/studysmart`. On Windows it defaults to the repo's `backups` folder. Set `BACKUP_DIR` for a different location. Last backup means the newest matching archive observed in that location. This measurement does not verify restore integrity.
- Recent errors show only time and status for the latest API 5xx responses observed by this process. Reports are available from the separate Reports view. Visitor totals combine per-day estimates over 14 UTC days.
- **Load coverage** uses the existing audio coverage scan. The monitor shows a small summary of its most recent result in this API process. Detailed item-level coverage is under Audio coverage.

## Kani jobs

The Jobs view separates **Oracle server** and **Windows PC**. Each source begins as Unknown. A running job becomes Stale after 15 minutes without a newer log timestamp. A completion applies to the displayed phase. For a running job, the numerator is the number of clip tasks processed in that phase, which may include skipped tasks. A phase summary provides the number recorded or already present.

The optional reporter reads the last 2 MiB of the existing log and sends only its timestamp, source, phase slug, status, numeric progress and an error category. Set a dedicated random `JOB_REPORT_TOKEN` of at least 24 characters in the server environment and provide the same value to each reporting process using a private environment variable. `JOB_REPORT_DIR` optionally sets the private, writable job-state directory. The default is `job-reports` beside the uploads directory. The reporter needs Python 3 and the site over HTTPS.

After deployment, run the reporter from the relevant machine, using the actual Kani log path. It can also be scheduled separately at a five-minute interval using Task Scheduler on Windows or cron on Oracle. It reads the log without invoking the audio workflow.

```text
python tools/report-kani-status.py windows generate-edge-audio-report.txt
python3 tools/report-kani-status.py oracle /path/to/existing-kani-log
```

The server accepts authenticated updates at `POST /api/v1/admin/monitor/jobs/:source`. Browser reads use existing admin authorization. Updates with an equal or older log timestamp leave the displayed snapshot intact.
