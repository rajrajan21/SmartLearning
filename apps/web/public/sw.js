// SharpStudy service worker (never caches admin or account/child data): app shell + curriculum data work offline after the first visit.
const VERSION = "v4";
const SHELL = `ss-shell-${VERSION}`;
const DATA = `ss-data-${VERSION}`;

self.addEventListener("install", (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(["/", "/manifest.webmanifest", "/icon.svg"])).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![SHELL, DATA].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return; // never touch audio range requests
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith("/api/v1/admin") || url.pathname.startsWith("/api/v1/account") || url.pathname.startsWith("/api/books/file/")) return; // textbook PDFs are large: never copied into the offline cache
  if (url.pathname.startsWith("/api/")) {
    // data: network first, fall back to the last good copy
    e.respondWith(fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(DATA).then((c) => c.put(req, copy)); } return r; }).catch(() => caches.match(req).then((m) => m || new Response("{}", { status: 503, headers: { "content-type": "application/json" } }))));
    return;
  }
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }
  // static assets: cache first (filenames are hashed by the build)
  e.respondWith(caches.match(req).then((m) => m || fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(SHELL).then((c) => c.put(req, copy)); } return r; })));
});
