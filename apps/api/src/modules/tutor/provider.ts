export interface ModelConfig { url: string; key: string; model: string }
export type Chat = { role: "system" | "user" | "assistant"; content: string }[];
export type ModelCall = (messages: Chat) => Promise<string | null>;

/** Any OpenAI-compatible chat endpoint (several have free tiers). Returns null on any problem, so the caller falls back to the lesson. */
export function modelFromEnv(env: NodeJS.ProcessEnv): ModelCall | null {
  const url = env.TUTOR_API_URL, key = env.TUTOR_API_KEY, model = env.TUTOR_MODEL;
  if (!url || !key || !model) return null;
  const cfg: ModelConfig = { url: url.replace(/\/+$/, ""), key, model };
  return async (messages) => {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15_000);
    try {
      const r = await fetch(`${cfg.url}/chat/completions`, {
        method: "POST", signal: ctl.signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${cfg.key}` },
        body: JSON.stringify({ model: cfg.model, messages, temperature: 0.3, max_tokens: 350 }),
      });
      if (!r.ok) return null;
      const d = (await r.json()) as { choices?: { message?: { content?: string } }[] };
      const t = d.choices?.[0]?.message?.content;
      return typeof t === "string" && t.trim() ? t : null;
    } catch { return null; } finally { clearTimeout(timer); }
  };
}
