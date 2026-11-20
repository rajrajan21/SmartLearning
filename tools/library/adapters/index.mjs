import ia from "./internet-archive.mjs";
import commons from "./wikimedia-commons.mjs";
/** One reader per site that sites.json marks "ready". A new site needs a new file here plus its sites.json row. */
export const ADAPTERS = { [ia.id]: ia, [commons.id]: commons };
