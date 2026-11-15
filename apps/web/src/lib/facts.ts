/** A small local list for the 'Did you know?' card. One fact a day, no network. */
export interface Fact { icon: string; en: string; ta: string }
export const FACTS: Fact[] = [
  { icon: "🐘", en: "An elephant's trunk has more than 40,000 tiny muscles. It can pick up a single peanut.", ta: "யானையின் தும்பிக்கையில் 40,000-க்கும் மேற்பட்ட சிறு தசைகள் உள்ளன. அது ஒரு வேர்க்கடலையையும் எடுக்கும்." },
  { icon: "💧", en: "Rain you see today may have been part of the sea many days ago.", ta: "இன்று நீங்கள் காணும் மழை, பல நாட்களுக்கு முன் கடலின் பகுதியாக இருந்திருக்கலாம்." },
  { icon: "🌱", en: "A tiny seed holds a baby plant and its first food inside.", ta: "ஒரு சிறு விதைக்குள் குட்டித் தாவரமும் அதன் முதல் உணவும் இருக்கின்றன." },
  { icon: "🔷", en: "A triangle has 3 sides and 3 corners. Always the same number!", ta: "முக்கோணத்துக்கு 3 பக்கங்களும் 3 மூலைகளும் உண்டு. எப்போதும் ஒரே எண்ணிக்கை!" },
  { icon: "🐝", en: "A honeybee visits hundreds of flowers in one trip.", ta: "ஒரு தேனீ ஒரே பயணத்தில் நூற்றுக்கணக்கான பூக்களைச் சந்திக்கும்." },
  { icon: "🔢", en: "Any number times 1 stays the same: 7 × 1 = 7.", ta: "எந்த எண்ணையும் 1-ஆல் பெருக்கினால் அதே எண் கிடைக்கும்: 7 × 1 = 7." },
  { icon: "🌍", en: "Reusing a bottle saves water, energy and money.", ta: "ஒரு புட்டியை மீண்டும் பயன்படுத்தினால் நீர், ஆற்றல், பணம் மிச்சமாகும்." },
  { icon: "🕐", en: "The short hand of a clock shows the hour. The long hand shows the minutes.", ta: "கடிகாரத்தின் குட்டை முள் மணியையும், நீளமுள் நிமிடத்தையும் காட்டும்." },
  { icon: "🥭", en: "Fruits and vegetables of many colours give your body many different helpers.", ta: "பல நிறப் பழங்களும் காய்கறிகளும் உடலுக்குப் பல நன்மைகளைத் தரும்." },
  { icon: "🧼", en: "Washing hands with soap for 20 seconds washes germs away.", ta: "20 விநாடிகள் சோப்பால் கை கழுவினால் கிருமிகள் நீங்கும்." },
  { icon: "🦜", en: "Some parrots can learn to say words they hear every day.", ta: "சில கிளிகள் தினமும் கேட்கும் சொற்களைச் சொல்லக் கற்றுக்கொள்ளும்." },
  { icon: "➗", en: "Sharing 12 sweets equally between 4 friends gives 3 each.", ta: "12 இனிப்புகளை 4 நண்பர்களுக்குச் சமமாகப் பகிர்ந்தால் ஆளுக்கு 3." },
];
export const factOfDay = (day: number): Fact => FACTS[((day % FACTS.length) + FACTS.length) % FACTS.length]!;

/** A tiny multiplication question for the feed. Same seed, same question (so it does not change on re-render). */
export function quickQuestion(seed: number): { a: number; b: number; answer: number; options: number[] } {
  let x = (seed * 9301 + 49297) % 233280;
  const next = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
  const a = 2 + Math.floor(next() * 5), b = 2 + Math.floor(next() * 5), answer = a * b;
  const wrong = new Set<number>();
  while (wrong.size < 2) { const w = answer + (Math.floor(next() * 7) - 3) * (next() > 0.5 ? 1 : 2); if (w !== answer && w > 0) wrong.add(w); }
  const options = [answer, ...wrong].sort((p, q) => ((p * 7 + seed) % 11) - ((q * 7 + seed) % 11));
  return { a, b, answer, options };
}
