// Yam7 PWA service worker · เก็บไฟล์ทั้งหมดไว้ในเครื่อง ใช้ได้แบบออฟไลน์ · สร้างโดย tools/build_pwa.py
const CACHE = "yam7-7.9.6-6423e03c";
const ASSETS = ["./", "./app.js", "./apple-touch-icon.png", "./build.js", "./favicon-32.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./index.html", "./manifest.webmanifest", "./shim.js", "./yam7.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" })))));
});
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("yam7-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true }) || (r.mode === "navigate" ? await c.match("./index.html") : null);
    if (hit) return hit;
    try { const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res; }
    catch (err) { return r.mode === "navigate" ? (await c.match("./index.html")) : Response.error(); }
  }));
});
