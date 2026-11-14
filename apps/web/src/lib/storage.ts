/** localStorage can be empty, blocked or full: never let that break the page. */
export const store = {
  get(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string): void { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
  getJson<T>(key: string): T | null { const s = store.get(key); if (!s) return null; try { return JSON.parse(s) as T; } catch { return null; } },
  setJson(key: string, value: unknown): void { store.set(key, JSON.stringify(value)); },
};
