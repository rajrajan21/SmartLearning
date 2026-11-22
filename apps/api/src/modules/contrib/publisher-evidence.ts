import type { LicenceId } from "./detectors.js";

// Match exact publisher bytes so a copied source URL cannot license an unrelated upload.
const verifiedBooks = new Map<string, { licence: LicenceId; title: string; author: string; url: string }>([
  ["8ee9e8065dfcc9fb4c72e2578ace0473cd716b549c678b557f00e9bcfdbdfd2f", {
    licence: "by-sa",
    title: "The Fool and The Wise",
    author: "Alexander Hadian",
    url: "https://freekidsbooks.org/the-fool-and-the-wise-a-childrens-philosophical-tale/",
  }],
]);

export function publisherBook(sha256: string) {
  return verifiedBooks.get(sha256);
}
