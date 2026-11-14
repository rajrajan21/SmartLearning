export type Lang = "en" | "ta";
export interface Screened { ok: boolean; notice?: "personal" | "unsafe" | "worry"; message?: string }

const T = {
  personal: { en: "Please do not share your name, phone number, address or email here. Ask me about the lesson instead.", ta: "உன் பெயர், தொலைபேசி எண், முகவரி, மின்னஞ்சலை இங்கே எழுத வேண்டாம். பாடத்தைப் பற்றிக் கேள்." },
  unsafe: { en: "I can only help with your lesson. Please ask a question about what you are learning.", ta: "நான் உன் பாடத்திற்கு மட்டுமே உதவ முடியும். நீ கற்கும் பாடத்தைப் பற்றிக் கேள்." },
  worry: { en: "That sounds important. Please tell a parent, teacher or another grown-up you trust right now. In India you can also call Childline on 1098 for free, any time.", ta: "இது முக்கியமானது. உடனே உன் பெற்றோர், ஆசிரியர் அல்லது நம்பும் பெரியவரிடம் சொல். இந்தியாவில் எந்நேரமும் இலவசமாக Childline 1098 எண்ணையும் அழைக்கலாம்." },
};
const PERSONAL = [/[\w.+-]+@[\w-]+\.[\w.]+/, /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/, /https?:\/\/|www\./i, /\b(my|mera|en)\s+(home\s+)?address\b/i, /\bmy (phone|mobile|number|whatsapp)\b/i, /\bi live (at|in|on)\b/i, /\bmy (full )?name is\b/i];
const WORRY = [/\b(kill|hurt|harm)\s+(myself|me)\b/i, /\bwant to die\b/i, /\bsuicide\b/i, /\b(someone|he|she|they)\s+(touched|hit|beats?|hurts?)\s+me\b/i, /\bi am scared of (him|her|them)\b/i, /\bbeing abused\b/i];
const UNSAFE = [/\b(porn|sex|nude|naked|drugs?|weed|alcohol|vodka|beer|gambl\w*|bomb|weapon|gun)\b/i, /\bignore (all |your )?(previous |above )?(instructions|rules)\b/i, /\b(system|developer) prompt\b/i, /\bjailbreak\b/i, /\bpretend (to be|you are)\b/i];

/** Checks what a child typed before anything is sent anywhere. */
export function screenInput(text: string, lang: Lang): Screened {
  if (WORRY.some((r) => r.test(text))) return { ok: false, notice: "worry", message: T.worry[lang] };
  if (PERSONAL.some((r) => r.test(text))) return { ok: false, notice: "personal", message: T.personal[lang] };
  if (UNSAFE.some((r) => r.test(text))) return { ok: false, notice: "unsafe", message: T.unsafe[lang] };
  return { ok: true };
}

/** Keeps a model answer short, link-free and plain text. */
export function cleanOutput(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+|www\.\S+/gi, "")
    .replace(/[*_#`>]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 900);
}
