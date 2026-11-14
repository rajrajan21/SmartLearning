# Accounts (Module 6)

Free, built in: no sign-in provider, no e-mail service. A **parent** creates an account (e-mail + password) and adds **children** (nickname, class, picture). Children never have their own passwords or e-mails. Learning without an account still works exactly as before.

## What is stored
- Parent: e-mail and a scrypt password hash (never the password). Child: nickname, class, picture, language. No full names, phone numbers or birth dates.
- Consent: signing up requires the parent's agreement (text editable in Admin > Accounts); stored per child in `consents` with a text version.
- Progress per child (`student_progress`): lesson position/finished and practice round results; merged by one shared rule (`packages/shared/src/sync.ts`): finished stays finished, best score and most stars win, passed stays passed.
- Practice answers get the child's id when someone is signed in (`question_attempts.student_id`).
- Sessions: random token in an HttpOnly, SameSite=Lax cookie (Secure in production); only its SHA-256 is stored. Default 30 days.

## Safety
- Same error for wrong password and unknown e-mail; 20 tries per 15 minutes per IP; JSON-only bodies; account responses are never cached (server and service worker).
- A parent can only see and change their own children. Removing a child or deleting the account removes their progress and consents (password needed to delete the account).
- On a shared device: signing out clears progress from that device; switching child replaces it with the new child's saved progress (never merged), so one child's progress cannot leak into another's.

## Admin settings (Admin > Accounts, and Features)
Accounts on/off, allow new sign-ups, shortest password, most children, stay-signed-in days, header link, parent agreement text.

## Not yet (later modules)
Password reset by e-mail (needs an e-mail service; until then ask the admin), parent dashboard (Module 9), child PIN lock.
