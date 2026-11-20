export interface Puzzle { q: { en: string; ta: string }; a: { en: string; ta: string } }

/** Original brain-teasers for the home page. One a day, the same for everyone (chosen by the date). */
export const PUZZLES: Puzzle[] = [
  { q: {"en": "I am a number. Add 5 to me and you get 12. Who am I?", "ta": "நான் ஒரு எண். என்னுடன் 5 கூட்டினால் 12 கிடைக்கும். நான் யார்?"}, a: {"en": "7", "ta": "7"} },
  { q: {"en": "What comes next? 2, 4, 8, 16, ...", "ta": "அடுத்தது என்ன? 2, 4, 8, 16, ..."}, a: {"en": "32 (each number is doubled)", "ta": "32 (ஒவ்வொரு எண்ணும் இரட்டிப்பு)"} },
  { q: {"en": "A farmer has 17 sheep. All but 9 run away. How many are left?", "ta": "ஒரு விவசாயியிடம் 17 ஆடுகள். 9 தவிர மற்றவை ஓடிவிட்டன. எத்தனை மீதம்?"}, a: {"en": "9", "ta": "9"} },
  { q: {"en": "I have 4 sides, all equal, and 4 right angles. What shape am I?", "ta": "எனக்கு 4 சமமான பக்கங்களும் 4 செங்கோணங்களும் உண்டு. நான் எந்த வடிவம்?"}, a: {"en": "A square", "ta": "சதுரம்"} },
  { q: {"en": "How many days are there in 2 weeks?", "ta": "2 வாரங்களில் எத்தனை நாட்கள்?"}, a: {"en": "14", "ta": "14"} },
  { q: {"en": "What has hands but cannot clap?", "ta": "கைகள் உண்டு, ஆனால் கைதட்ட முடியாது. அது என்ன?"}, a: {"en": "A clock", "ta": "கடிகாரம்"} },
  { q: {"en": "Half of a number is 15. What is the number?", "ta": "ஒரு எண்ணின் பாதி 15. அந்த எண் என்ன?"}, a: {"en": "30", "ta": "30"} },
  { q: {"en": "What comes next? 1, 1, 2, 3, 5, 8, ...", "ta": "அடுத்தது என்ன? 1, 1, 2, 3, 5, 8, ..."}, a: {"en": "13 (add the last two numbers)", "ta": "13 (முந்தைய இரு எண்களைக் கூட்டு)"} },
  { q: {"en": "Which is heavier: 1 kg of cotton or 1 kg of iron?", "ta": "எது கனமானது: 1 கிலோ பஞ்சா, 1 கிலோ இரும்பா?"}, a: {"en": "Both weigh the same: 1 kg", "ta": "இரண்டும் சமம்: 1 கிலோ"} },
  { q: {"en": "A triangle has how many corners (vertices)?", "ta": "முக்கோணத்துக்கு எத்தனை மூலைகள்?"}, a: {"en": "3", "ta": "3"} },
  { q: {"en": "I am an odd number. Take away one letter and I become even. Who am I?", "ta": "நான் ஒரு ஒற்றைப்படை எண். ஒரு எழுத்தை நீக்கினால் இரட்டைப்படை ஆவேன். நான் யார்?"}, a: {"en": "Seven (take away the s to get even)", "ta": "Seven (s ஐ நீக்கினால் even)"} },
  { q: {"en": "How many sides do 3 triangles have in all?", "ta": "3 முக்கோணங்களுக்கு மொத்தம் எத்தனை பக்கங்கள்?"}, a: {"en": "9", "ta": "9"} },
];

export const puzzleFor = (d: Date): Puzzle => PUZZLES[Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) % PUZZLES.length]!;
