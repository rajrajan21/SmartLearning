import { perf } from "./config.js";

/** Runs a cheap "did the files change?" check at most once per `perf().fileCheckSeconds` and remembers the answer in between. */
export function throttled<T>(check: () => T): () => T {
  let last = 0, value: T | undefined, have = false;
  return () => {
    const every = perf().fileCheckSeconds * 1000;
    const now = Date.now();
    if (have && every > 0 && now - last < every) return value as T;
    value = check(); last = now; have = true;
    return value;
  };
}
