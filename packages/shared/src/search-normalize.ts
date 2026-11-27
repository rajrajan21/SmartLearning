// Remove Latin accent marks without stripping vowel signs and other marks from Indian scripts.
export const normalizeSearch = (s: string) => s.toLocaleLowerCase("en").normalize("NFD").replace(/(\p{Script=Latin})\p{Mark}+/gu, "$1").normalize("NFC").replace(/[^\p{Letter}\p{Number}\p{Mark}]+/gu, " ").trim();

function sameWord(a: string, b: string): boolean {
  if (!/^[a-z]{4,}$/.test(a) || !/^[a-z]{3,}$/.test(b)) return false;
  const tolerance = a.length >= 7 ? 2 : 1;
  if (Math.abs(a.length - b.length) > tolerance) return false;
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(row[j]! + 1, next[j - 1]! + 1, row[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    row = next;
  }
  return row[b.length]! <= tolerance;
}
export function searchCost(tokens: string[], hay: string): number {
  let cost = 0;
  const words = hay.split(" ");
  for (const token of tokens) {
    if (hay.includes(token)) continue;
    if (!words.some(word => sameWord(token, word))) return Infinity;
    cost++;
  }
  return cost;
}
