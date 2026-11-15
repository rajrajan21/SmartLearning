/**
 * THE one place that names the product. Change the name here (and run the tests) and every
 * user-visible string that is built from code follows. Static files that cannot import code
 * (apps/web/public/manifest.webmanifest) are checked against this by a test.
 * Internal names (@studysmart/* packages, env vars, repo name, service/folder names) are NOT the product name and stay as they are.
 */
export const SITE = {
  name: "SharpStudy",
  /** the name as a Tamil learner reads it aloud */
  nameTa: "ஷார்ப்ஸ்டடி",
  domain: "sharpstudy.in",
  url: "https://sharpstudy.in",
  tagline: { en: "Free, friendly lessons and practice for school students", ta: "பள்ளி மாணவர்களுக்கான இலவச, இனிய பாடங்களும் பயிற்சியும்" },
  /** short text for search results and link previews */
  description: "SharpStudy – free, friendly lessons and practice for school students, in English and Tamil.",
  /** start of every invite code, e.g. SHARP-7K3M-9QPD */
  inviteCodePrefix: "SHARP",
} as const;

/** "About – SharpStudy"; the bare name when no page title is given. */
export const pageTitle = (page?: string): string => (page ? `${page} – ${SITE.name}` : SITE.name);

/** The name in the learner's language. */
export const siteName = (lang: "en" | "ta"): string => (lang === "ta" ? SITE.nameTa : SITE.name);

/** Pre-filled "User id" on the admin sign-in page; the server accepts the ADMIN_USER_ID environment value, else this one. */
export const DEFAULT_ADMIN_USER_ID = "itsme.rajrajan@gmail.com";
