/** Checks a Google or Facebook sign-in token with the provider and returns the verified e-mail. Fetch is injectable for tests. */
export type Fetcher = (url: string) => Promise<{ ok: boolean; json(): Promise<any> }>;
export interface Identity { id: string; email: string }

export async function verifySocial(provider: "google" | "facebook", token: string, cfg: { googleClientId: string; facebookAppId: string }, f: Fetcher = fetch as unknown as Fetcher): Promise<Identity | null> {
  try {
    if (provider === "google") {
      if (!cfg.googleClientId) return null;
      const r = await f(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
      if (!r.ok) return null;
      const j = await r.json();
      if (j.aud !== cfg.googleClientId || !(j.email_verified === true || j.email_verified === "true") || !j.email || !j.sub) return null;
      return { id: String(j.sub), email: String(j.email).toLowerCase() };
    }
    if (!cfg.facebookAppId) return null;
    const app = await f(`https://graph.facebook.com/app?access_token=${encodeURIComponent(token)}`);
    if (!app.ok || String((await app.json()).id) !== cfg.facebookAppId) return null; // the token must belong to our app
    const me = await f(`https://graph.facebook.com/me?fields=id,email&access_token=${encodeURIComponent(token)}`);
    if (!me.ok) return null;
    const j = await me.json();
    return j.id && j.email ? { id: String(j.id), email: String(j.email).toLowerCase() } : null;
  } catch { return null; }
}
