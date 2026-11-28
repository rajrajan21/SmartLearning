/** Share validated public reads between mounted pages and keep a short in-memory window for back navigation. */
export function publicResource<T>(freshFor = 30_000) {
  const saved = new Map<string, { data: T; at: number }>();
  const pending = new Map<string, Promise<T>>();
  return {
    peek: (key: string) => saved.get(key)?.data,
    read(key: string, fetchData: () => Promise<T>, retry = false): Promise<T> {
      const inflight = pending.get(key);
      if (inflight) return inflight;
      const cached = saved.get(key);
      if (!retry && cached && Date.now() - cached.at < freshFor) return Promise.resolve(cached.data);
      const request = fetchData().then(data => {
        saved.set(key, { data, at: Date.now() });
        return data;
      }).finally(() => pending.delete(key));
      pending.set(key, request);
      return request;
    },
  };
}
