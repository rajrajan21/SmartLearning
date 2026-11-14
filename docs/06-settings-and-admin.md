# Settings and admin page (Module 2)

Every configurable thing is declared once in `packages/shared/src/settings.ts`. The API validates against it and the admin page at `/admin` is generated from it, so a new module only adds entries to the registry to get switches, limits, colours and text in the admin UI.

## Setting types
boolean (switch), number (slider + box), select, color (picker + hex + WCAG contrast check), text, localized (English + Tamil), numberlist (class picker).
Each has: panel, section, label, help, `public` (sent to visitors or admin-only), `dependsOn` (greyed out when its parent switch is off), `availability: "planned"` (shown but locked until the module ships).

## Panels
Features, Look and feel (mode, 20+ colours, fonts, text size, corners, spacing, notebook rules/margin, animation, 4 presets), Home page (headline, sections, announcement banner, footer), Languages, Classes and boards, Site and performance (maintenance mode, cache time, search limits).

## How it works
- Public: `GET /api/v1/settings/public` (ETag, cached). The web app caches it offline and applies it as CSS variables and feature flags.
- Admin: `/api/v1/admin/*` guarded by `x-admin-key` (env `ADMIN_KEY`, 24+ chars in production; rate limited). Replaced by real roles in Module 6.
- Save is all-or-nothing, every change is written to `settings_audit`. Export/import for backups. Reset per section or everything.
- Admin page: live preview, unsaved-change bar, undo per field, contrast warnings, change log.

## Adding a setting in a later module
Add an entry to `SETTINGS` (and remove `availability: "planned"` when the feature is built). Read it with `useSettings().get("feature.x")` in the web app, or the settings service in the API.
