// "Contribute to the E-Library" settings (own file so edits to settings.ts never collide with them).
import type { SettingDef } from "./settings.js";

const on = "contrib.enabled";
const b = (key: string, panel: "contrib" | "contribchecks" | "contribreader", section: string, label: string, def: boolean, help?: string, pub = false, dependsOn: string | null = on): SettingDef =>
  ({ key, panel, section, label, public: pub, type: "boolean", default: def, ...(help ? { help } : {}), ...(dependsOn ? { dependsOn } : {}) }) as SettingDef;
const n = (key: string, panel: "contrib" | "contribchecks" | "contribreader", section: string, label: string, def: number, min: number, max: number, unit?: string, help?: string, pub = false): SettingDef =>
  ({ key, panel, section, label, public: pub, type: "number", default: def, min, max, step: 1, ...(unit ? { unit } : {}), ...(help ? { help } : {}), dependsOn: on }) as SettingDef;
const t = (key: string, panel: "contrib" | "contribchecks" | "contribreader", section: string, label: string, def: string, maxLength: number, help?: string, pub = false): SettingDef =>
  ({ key, panel, section, label, public: pub, type: "text", default: def, maxLength, ...(help ? { help } : {}), dependsOn: on }) as SettingDef;

export const CONTRIB_SETTINGS: SettingDef[] = [
  // ---- Who may contribute, limits, anti-abuse
  { key: on, panel: "contrib", section: "Switch", label: "Visitors can contribute books to the E-Library", public: true, type: "boolean", default: false, dependsOn: "feature.library", help: "Adds a Contribute a book page to the E-Library. Every file is checked automatically and, by default, a person (you) approves it before it appears." },
  b("contrib.guests.allowed", "contrib", "Who may contribute", "Allow people who are not signed in", false, "Off (recommended): only signed-in parents can contribute, so every submission has an owner. On: anyone can, limited by the per-address limit below.", true),
  b("contrib.anonymous.allowed", "contrib", "Who may contribute", "Contributors may choose to be shown as Anonymous", true, undefined, true),
  n("contrib.perUserPerDay", "contrib", "Limits", "Submissions per signed-in contributor per day", 3, 1, 50),
  n("contrib.perIpPerDay", "contrib", "Limits", "Submissions per internet address per day", 5, 1, 200, undefined, "Counts every contributor behind one address (a school, an internet cafe) together, so keep it above the per-person limit."),
  n("contrib.openPerUser", "contrib", "Limits", "Most submissions one person may have waiting at a time", 10, 1, 100),
  n("contrib.maxMB", "contrib", "Limits", "Largest file accepted", 60, 1, 500, "MB", undefined, true),
  n("contrib.maxPages", "contrib", "Limits", "Most pages accepted", 600, 2, 5000, undefined, undefined, true),
  n("contrib.minPages", "contrib", "Limits", "Fewest pages accepted", 2, 1, 50),
  n("contrib.requestsPerMinute", "contrib", "Limits", "Requests per minute per address on the contribute pages", 30, 5, 600),
  b("contrib.challenge.enabled", "contrib", "Anti-abuse", "Ask a quick sum before sending (our own challenge, no outside CAPTCHA)", true, "A small sum the server signs and checks. Stops simple bots without sending visitors to another company's website.", true),
  b("contrib.honeypot.enabled", "contrib", "Anti-abuse", "Hidden trap field for bots", true, "A hidden form field that people never fill in; a filled field is dropped silently."),
  n("contrib.minSecondsToSubmit", "contrib", "Anti-abuse", "Fastest a person could fill the form", 8, 0, 120, "seconds", "Forms sent faster than this are treated as a bot."),
  { key: "contrib.rulesText", panel: "contrib", section: "Words shown to contributors", label: "Rules shown above the form", public: true, type: "localized", multiline: true, maxLength: 1200, default: { en: "Share only books you are allowed to share: your own work, public-domain books, openly licensed (Creative Commons) books or government open publications, or books whose owner gave permission. Do not send books that contain personal details (Aadhaar, phone numbers, mark sheets), adult or harmful material, or pirated textbooks. Every file is checked automatically, then a person approves it.", ta: "நீங்கள் பகிர உரிமை உள்ள புத்தகங்களை மட்டும் பகிருங்கள்: உங்கள் சொந்த படைப்பு, பொதுச் சொத்து, திறந்த உரிமம் (Creative Commons) உள்ள நூல்கள், அரசின் திறந்த வெளியீடுகள் அல்லது உரிமையாளர் அனுமதி தந்த நூல்கள். தனிப்பட்ட விவரங்கள் (ஆதார், தொலைபேசி எண், மதிப்பெண் பட்டியல்), பெரியவர்களுக்கான அல்லது தீங்கான உள்ளடக்கம், திருட்டுப் பாடநூல்கள் வேண்டாம். ஒவ்வொரு கோப்பும் தானாகச் சோதிக்கப்பட்டு, பிறகு ஒருவர் ஒப்புதல் அளிப்பார்." }, dependsOn: on },
  t("contrib.licences.allowed", "contrib", "Licences a contributor may declare", "Allowed licence choices (ids)", "own,pd,cc0,by,by-sa,by-nc,by-nc-sa,gov-open,permission", 120, "Comma separated from: own (my own work), pd (public domain), cc0, by, by-sa, by-nc, by-nc-sa, gov-open (government open publication), permission (owner gave permission). No-derivatives (nd) licences are never accepted.", true),
  b("contrib.requireProof", "contrib", "Licences a contributor may declare", "Ask for the source link and licence proof for any work that is not their own", true, "Contributors must paste the page address where the book is published and the licence sentence.", true),
  // ---- Link import
  b("contrib.link.enabled", "contrib", "Add by link", "Allow adding a book by pasting a link to a PDF", true, "The server downloads the PDF itself, with strong protection against links to private networks.", true),
  b("contrib.link.httpsOnly", "contrib", "Add by link", "Secure (https) links only", true),
  n("contrib.link.maxMB", "contrib", "Add by link", "Largest download", 60, 1, 500, "MB"),
  n("contrib.link.timeoutSec", "contrib", "Add by link", "Give up a download after", 30, 5, 300, "seconds"),
  n("contrib.link.maxRedirects", "contrib", "Add by link", "Redirects followed (each one is re-checked)", 3, 0, 8),
  b("contrib.link.respectRobots", "contrib", "Add by link", "Obey the website's robots.txt before downloading", true, "If the site asks robots not to fetch that file, the link is refused and the contributor is asked to upload the file instead."),
  t("contrib.link.allowDomains", "contrib", "Add by link", "Only these websites (blank = any public website)", "", 600, "Comma separated, for example archive.org, wikimedia.org, ncert.nic.in. When filled, links to any other website are refused."),
  t("contrib.link.denyDomains", "contrib", "Add by link", "Never these websites", "scribd.com,pdfdrive.com,z-lib.org,libgen.is,libgen.rs,anna-archive.org,4shared.com,mega.nz,telegram.org,t.me", 800, "Comma separated. Pirate libraries and file lockers are blocked by default."),
  b("contrib.fetch.enabled", "contrib", "Fetch details", "Show a Fetch details button next to the link box", true, "Reads the web page the contributor pasted (title, author, language, cover, licence hints and PDF links) and fills the form. The contributor still checks and edits every field and the normal review is unchanged.", true),
  n("contrib.fetch.timeoutSec", "contrib", "Fetch details", "Give up reading a page after", 10, 3, 60, "seconds"),
  n("contrib.fetch.maxKB", "contrib", "Fetch details", "Largest page read", 800, 100, 4000, "KB", "Pages bigger than this are not read."),
  n("contrib.fetch.perMinute", "contrib", "Fetch details", "Fetches allowed per visitor each minute", 6, 1, 60),
  b("contrib.fetch.cover", "contrib", "Fetch details", "Also suggest the cover picture address", true, "Only the address is suggested (shown as a link). Nothing is downloaded or stored from it. The website's own domain rules above also apply to fetching."),
  // ---- Review checks
  b("contrib.autoApprove.enabled", "contribchecks", "Approval", "Publish automatically when every check passes and the licence is verifiably open", false, "OFF (recommended): a person approves every book. When ON, only books with no warnings AND a detected open licence that matches what the contributor declared are published without you. Unknown licences are never auto-approved."),
  t("contrib.autoApprove.licences", "contribchecks", "Approval", "Licences that may be auto-approved", "cc0,pd,by,by-sa", 60, "Comma separated licence ids."),
  b("contrib.check.duplicates", "contribchecks", "Checks", "Duplicate check (same file, same text, same title and author)", true),
  b("contrib.check.copyright", "contribchecks", "Checks", "Copyright check", true),
  b("contrib.check.pii", "contribchecks", "Checks", "Personal and sensitive data check", true),
  b("contrib.check.content", "contribchecks", "Checks", "Unsafe, adult, hateful or spam content check", true),
  b("contrib.check.quality", "contribchecks", "Checks", "Quality check (readable text, page count, blank pages)", true),
  n("contrib.dup.distance", "contribchecks", "Checks", "How alike two books' text must be to count as a duplicate (0 = identical, 64 = anything)", 6, 0, 24, undefined, "Fingerprint distance. Lower is stricter about being the same."),
  n("contrib.pii.rejectIds", "contribchecks", "Personal data thresholds", "Reject when this many identity or money numbers are found (Aadhaar, PAN, passport, voter ID, card, bank account)", 1, 1, 100, undefined, "1 means a single valid Aadhaar or card number rejects the book."),
  n("contrib.pii.reviewContacts", "contribchecks", "Personal data thresholds", "Send to review when phone numbers and emails together reach", 12, 1, 500),
  n("contrib.pii.rejectContacts", "contribchecks", "Personal data thresholds", "Reject when phone numbers and emails together reach", 60, 2, 2000),
  b("contrib.pii.detectMarksheets", "contribchecks", "Personal data thresholds", "Spot mark sheets, ID cards and answer sheets with names", true),
  n("contrib.content.reviewScore", "contribchecks", "Unsafe content thresholds", "Send to review at this unsafe-content score (0-100)", 25, 1, 100),
  n("contrib.content.rejectScore", "contribchecks", "Unsafe content thresholds", "Reject at this unsafe-content score (0-100)", 55, 1, 100),
  n("contrib.content.urlSpamPerPage", "contribchecks", "Unsafe content thresholds", "Web addresses per page that count as spam", 6, 1, 100),
  b("contrib.copyright.rejectAllRights", "contribchecks", "Copyright thresholds", "Reject books that say All rights reserved and carry no open licence", true, "The contributor must show permission; otherwise the book is rejected with advice."),
  b("contrib.copyright.blockedIsReject", "contribchecks", "Copyright thresholds", "Reject books that match your blocked publishers, titles or phrases", true, "Off sends such books to review instead of rejecting them."),
  n("contrib.quality.minCharsPerPage", "contribchecks", "Quality", "Readable text needed per page, on average", 40, 0, 2000, "characters", "Below this the book is probably scanned pictures; it is flagged 'needs OCR'."),
  n("contrib.quality.maxBlankPercent", "contribchecks", "Quality", "Most blank pages allowed", 40, 0, 100, "%"),
  { key: "contrib.quality.scannedAction", panel: "contribchecks", section: "Quality", label: "A book with no readable text (scanned pictures)", public: false, type: "select", default: "review", options: [{ value: "review", label: "Send to review" }, { value: "reject", label: "Reject" }, { value: "allow", label: "Allow" }], dependsOn: on, help: "Scanned books cannot be searched or read aloud, and the content checks cannot see inside them." },
  // ---- Retention
  n("contrib.retention.rejectedDays", "contribchecks", "What is kept", "Keep a rejected file for", 0, 0, 90, "days", "0 deletes the file straight away (recommended). Files flagged for personal data are always deleted at once."),
  n("contrib.retention.reportDays", "contribchecks", "What is kept", "Keep the short report of a rejected submission for", 180, 7, 3650, "days", "The report holds only counts, kinds and page numbers, never the sensitive values."),
  n("contrib.retention.pendingDays", "contribchecks", "What is kept", "Remove submissions nobody finished or approved after", 30, 3, 365, "days"),
  // ---- Reader and publishing
  b("contrib.reader.searchInBook", "contribreader", "Reader", "Search inside a book", true, undefined, true),
  b("contrib.reader.contents", "contribreader", "Reader", "Contents list (from the book's outline)", true, undefined, true),
  b("contrib.reader.notes", "contribreader", "Reader", "Bookmarks, notes and highlights (saved on that device only)", true, undefined, true),
  b("contrib.reader.themes", "contribreader", "Reader", "Night and sepia reading modes, zoom and fit-to-width", true, undefined, true),
  b("contrib.reader.readAloud", "contribreader", "Reader", "Read aloud with the browser's own voice", true, "Uses the visitor's browser speech. No audio files are made or stored.", true),
  b("contrib.reader.continueReading", "contribreader", "Reader", "Continue-reading shelf on the E-Library page", true, undefined, true),
  b("contrib.reader.reportButton", "contribreader", "Reader", "Report a problem button on every contributed book", true, undefined, true),
  { key: "contrib.publish.download", panel: "contribreader", section: "Publishing", label: "Download button on contributed books", public: true, type: "select", default: "licence", options: [{ value: "licence", label: "Only when the licence allows copies" }, { value: "always", label: "Always" }, { value: "never", label: "Never" }], dependsOn: on },
  b("contrib.publish.showContributor", "contribreader", "Publishing", "Show 'contributed by' under the book", true, undefined, true),
  b("contrib.publish.profiles", "contribreader", "Publishing", "Contributor pages that list a person's published books", true, undefined, true),
  b("contrib.publish.crossLibrarySearch", "contribreader", "Publishing", "Search the words inside every contributed book from the E-Library page", true, undefined, true),
  b("contrib.takedown.enabled", "contribreader", "Publishing", "Show 'request a takedown' for rights holders", true, "Rights holders can ask for a book to be hidden. You see the request in Admin > Contributions > Takedowns; the book is hidden at once when 'Hide at once' is on.", true),
  b("contrib.takedown.hideAtOnce", "contribreader", "Publishing", "Hide a book at once when a takedown is requested (until you decide)", true),
  n("contrib.notifications.keepDays", "contribreader", "Publishing", "Keep in-app notices for", 60, 7, 365, "days"),
];
