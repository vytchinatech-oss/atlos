/* Атлос service worker: the app works offline; a new version downloads in the background
   and is applied when the user taps «Обновить». build.py stamps VERSION on every release. */
const VERSION = "2026.10.31-b4ce32b";
const CACHE = "atlos-" + VERSION;
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon-32.png",
  "./fonts/onest-cyrillic-300-normal.woff2", "./fonts/onest-cyrillic-400-normal.woff2",
  "./fonts/onest-cyrillic-500-normal.woff2", "./fonts/onest-cyrillic-600-normal.woff2",
  "./fonts/onest-latin-300-normal.woff2", "./fonts/onest-latin-400-normal.woff2",
  "./fonts/onest-latin-500-normal.woff2", "./fonts/onest-latin-600-normal.woff2"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("atlos-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(caches.match("./index.html").then((hit) => hit || fetch(req)));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((resp) => {
      if (resp.ok) { const copy = resp.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return resp;
    }))
  );
});
