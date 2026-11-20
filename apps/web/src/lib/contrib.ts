import type { Lang } from "./i18n";

export interface ContribConfig {
  enabled: boolean; signedIn?: boolean; child?: boolean; canContribute?: boolean; guestsAllowed?: boolean; anonymousAllowed?: boolean; linkEnabled?: boolean; requireProof?: boolean;
  maxMB?: number; maxPages?: number; minPages?: number; remainingToday?: number; licences?: { id: string; name: string; url: string; needsProof: boolean }[];
  boards?: string[]; languages?: string[]; challenge?: { token: string; question: string } | null; honeypot?: boolean; httpsOnly?: boolean; fetchEnabled?: boolean;
}
export type Conf = "high" | "medium" | "low";
export interface FetchedDetails {
  finalUrl: string; kind: "page" | "pdf"; notes: string[];
  fields: Partial<Record<"title" | "author" | "description" | "language" | "publisher" | "year" | "licence" | "sourceUrl" | "coverUrl" | "classLevel" | "subject" | "licenceProof", string>>;
  confidence: Record<string, Conf>; origin: Record<string, string>; pdfLinks: { url: string; label: string }[];
}
export interface MySub {
  id: string; status: string; createdAt: string; updatedAt: string; title: string; author: string; licence: string; source: string; bookId: string; reasons: string[];
  history: { at: string; status: string; note: string }[]; checks: { id: string; label: string; status: string; detail: string }[]; score: number | null;
}
export interface Notice { id: string; at: string; text: string; link: string; read: boolean }

export class ApiErr extends Error { constructor(message: string, readonly code: string, readonly status: number) { super(message); } }
async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = (data as { error?: { code?: string; message?: string } }).error; throw new ApiErr(e?.message ?? `Request failed (${res.status})`, e?.code ?? "error", res.status); }
  return data as T;
}
const J = (body: unknown): RequestInit => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const B = "/api/v1/library";

export const contribApi = {
  config: () => fetch(`${B}/contribute/config`).then((r) => parse<ContribConfig>(r)),
  upload: (file: File, meta: Record<string, unknown>) => {
    const head = btoa(unescape(encodeURIComponent(JSON.stringify({ ...meta, fileName: file.name })))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return fetch(`${B}/contribute/upload`, { method: "POST", headers: { "content-type": "application/pdf", "x-contrib-meta": head }, body: file }).then((r) => parse<{ id: string; status: string }>(r));
  },
  link: (meta: Record<string, unknown>) => fetch(`${B}/contribute/link`, J(meta)).then((r) => parse<{ id: string; status: string }>(r)),
  fetchDetails: (url: string) => fetch(`${B}/contribute/fetch-details`, J({ url })).then((r) => parse<FetchedDetails>(r)),
  mine: () => fetch(`${B}/contribute/mine`).then((r) => parse<{ submissions: MySub[]; notices: Notice[] }>(r)),
  withdraw: (id: string) => fetch(`${B}/contribute/${id}/withdraw`, J({})).then((r) => parse<MySub>(r)),
  readNotices: () => fetch(`${B}/contribute/notices/read`, J({})).then((r) => parse<unknown>(r)),
  text: (id: string) => fetch(`${B}/${encodeURIComponent(id)}/text`).then((r) => parse<{ pages: string[]; outline: { title: string; page: number }[] }>(r)),
  search: (q: string) => fetch(`${B}/search?q=${encodeURIComponent(q)}`).then((r) => parse<{ hits: { id: string; title: string; page: number; snippet: string }[] }>(r)),
  profile: (h: string) => fetch(`${B}/contributor/${encodeURIComponent(h)}`).then((r) => parse<{ name: string; handle: string; books: { id: string; title: string }[] }>(r)),
  problem: (id: string, kind: string, message: string) => fetch(`${B}/${encodeURIComponent(id)}/problem`, J({ kind, message })).then((r) => parse<unknown>(r)),
  takedown: (id: string, b: { name: string; email: string; relationship: string; message: string }) => fetch(`${B}/${encodeURIComponent(id)}/takedown`, J(b)).then((r) => parse<unknown>(r)),
};

const T = {
  title: { en: "Contribute a book", ta: "நூலைப் பகிருங்கள்" },
  intro: { en: "Share a book that is yours, or one that is free to share. Every file is checked before it joins the library.", ta: "உங்கள் சொந்த நூல் அல்லது பகிர அனுமதிக்கப்பட்ட நூலைப் பகிருங்கள். நூலகத்தில் சேர்வதற்கு முன் ஒவ்வொரு கோப்பும் சரிபார்க்கப்படும்." },
  off: { en: "Contributions are switched off right now.", ta: "பங்களிப்புகள் இப்போது நிறுத்தப்பட்டுள்ளன." },
  signin: { en: "Please sign in to contribute.", ta: "பகிர உள்நுழையுங்கள்." },
  child: { en: "Contributions are for parent and adult accounts.", ta: "பங்களிப்புகள் பெற்றோர் / பெரியவர் கணக்குகளுக்கு மட்டும்." },
  rules: { en: "Rules", ta: "விதிகள்" },
  pdf: { en: "A PDF file", ta: "PDF கோப்பு" },
  link: { en: "A link to a PDF", ta: "PDF இணைப்பு" },
  bTitle: { en: "Book title", ta: "நூலின் தலைப்பு" }, bAuthor: { en: "Author", ta: "ஆசிரியர்" }, board: { en: "Board", ta: "வாரியம்" },
  cls: { en: "Class or age", ta: "வகுப்பு / வயது" }, subject: { en: "Subject", ta: "பாடம்" }, lang: { en: "Language", ta: "மொழி" },
  licence: { en: "Licence", ta: "உரிமம்" }, srcUrl: { en: "Where it came from (web address)", ta: "மூல இணைய முகவரி" }, proof: { en: "Licence proof (web address or short note)", ta: "உரிம ஆதாரம் (முகவரி / குறிப்பு)" },
  attr: { en: "Credit me as", ta: "என்னை இவ்வாறு குறிப்பிடுங்கள்" }, byName: { en: "My name", ta: "என் பெயர்" }, anon: { en: "Anonymous", ta: "பெயர் இல்லாமல்" }, nick: { en: "Name to show", ta: "காட்டும் பெயர்" },
  consent: { en: "I confirm the book is my own work, or I have the right to share it under the licence I chose. I understand it can be removed at any time.", ta: "இந்த நூல் என் சொந்தப் படைப்பு அல்லது நான் தேர்ந்த உரிமத்தின் கீழ் பகிர எனக்கு உரிமை உண்டு என உறுதி செய்கிறேன். எப்போது வேண்டுமானாலும் நீக்கப்படலாம் என்பதை அறிவேன்." },
  send: { en: "Send for checking", ta: "சரிபார்க்க அனுப்பு" }, sending: { en: "Sending…", ta: "அனுப்புகிறது…" },
  thanks: { en: "Received. We are checking it now. Follow it in My contributions.", ta: "பெறப்பட்டது. இப்போது சரிபார்க்கிறோம். என் பங்களிப்புகளில் பாருங்கள்." },
  mine: { en: "My contributions", ta: "என் பங்களிப்புகள்" }, none: { en: "You have not sent anything yet.", ta: "இன்னும் எதுவும் அனுப்பவில்லை." },
  withdraw: { en: "Withdraw", ta: "திரும்பப் பெறு" }, open: { en: "Open in library", ta: "நூலகத்தில் திற" }, left: { en: "left today", ta: "இன்று மீதம்" },
  by: { en: "Contributed by", ta: "பகிர்ந்தவர்" }, contributor: { en: "Contributed books", ta: "பகிர்ந்த நூல்கள்" },
  searchIn: { en: "Search in this book", ta: "இந்த நூலில் தேடு" }, contents: { en: "Contents", ta: "பொருளடக்கம்" }, bookmark: { en: "Bookmark this page", ta: "இந்தப் பக்கத்தைக் குறி" },
  bookmarks: { en: "Bookmarks", ta: "குறிப்புகள்" }, notes: { en: "My notes (kept on this device)", ta: "என் குறிப்புகள் (இந்தச் சாதனத்தில்)" }, day: { en: "Day", ta: "பகல்" }, night: { en: "Night", ta: "இரவு" }, sepia: { en: "Sepia", ta: "செபியா" },
  zoomIn: { en: "Bigger", ta: "பெரிதாக்கு" }, zoomOut: { en: "Smaller", ta: "சிறிதாக்கு" }, read: { en: "Read aloud", ta: "வாசித்துக் காட்டு" }, stop: { en: "Stop", ta: "நிறுத்து" },
  report: { en: "Report a problem", ta: "சிக்கலைத் தெரிவி" }, takedown: { en: "This is my work / remove it", ta: "இது என் படைப்பு / நீக்குங்கள்" },
  continue: { en: "Continue reading", ta: "தொடர்ந்து வாசி" }, found: { en: "Found in other books", ta: "மற்ற நூல்களில் கிடைத்தது" },
  fetch: { en: "Fetch details", ta: "விவரங்களைப் பெறு" }, fetching: { en: "Reading the page…", ta: "பக்கத்தைப் படிக்கிறது…" },
  fetchHelp: { en: "Paste the address of the page where the book is described (or its PDF) and press Fetch details. We fill in what we can find. Please check every box before sending.", ta: "நூல் விவரிக்கப்பட்டுள்ள பக்கத்தின் (அல்லது PDF-இன்) முகவரியை ஒட்டி 'விவரங்களைப் பெறு' அழுத்துங்கள். கிடைப்பதை நிரப்புவோம். அனுப்பும் முன் ஒவ்வொன்றையும் சரிபாருங்கள்." },
  fetched: { en: "Details filled in below. Please check and correct them.", ta: "விவரங்கள் கீழே நிரப்பப்பட்டுள்ளன. சரிபார்த்துத் திருத்துங்கள்." },
  fetchedNone: { en: "We could not find any details on that page. Please type them in.", ta: "அந்தப் பக்கத்தில் விவரங்கள் கிடைக்கவில்லை. நீங்களே உள்ளிடுங்கள்." },
  confHigh: { en: "likely right", ta: "சரியாக இருக்கலாம்" }, confMedium: { en: "check this", ta: "சரிபாருங்கள்" }, confLow: { en: "a guess", ta: "ஊகம்" },
  usePdf: { en: "Use this PDF link", ta: "இந்த PDF இணைப்பைப் பயன்படுத்து" }, pdfFound: { en: "PDF files found on that page", ta: "அந்தப் பக்கத்தில் கிடைத்த PDF கோப்புகள்" },
  foundTitle: { en: "What we found", ta: "கிடைத்தவை" }, cover: { en: "Cover picture", ta: "அட்டைப் படம்" }, about: { en: "About the book", ta: "நூலைப் பற்றி" },
  badge: { en: "Shared by a reader", ta: "வாசகர் பகிர்ந்தது" },
} as const;
export const ct = (k: keyof typeof T, lang: Lang) => (T[k] as Record<string, string>)[lang] ?? T[k].en;
export const STATUS_TEXT: Record<string, string> = { received: "Received", checking: "Being checked", in_review: "With a reviewer", changes_requested: "Changes needed", published: "Published", rejected: "Not accepted", withdrawn: "Withdrawn", failed: "Check failed" };
