// Yam7 PWA · service worker: ออนไลน์ = ดึงไฟล์ใหม่เสมอ (network-first) แล้วเก็บสำเนาไว้ · ออฟไลน์ = ใช้สำเนาล่าสุด
// จึงไม่ต้องแก้ไฟล์นี้เมื่ออัปเดต yam7.js (เปลี่ยนเลข CACHE เฉพาะเมื่อเพิ่ม/ลบไฟล์ใน CORE)
const CACHE = "yam7-v1";
const CORE = ["./", "index.html", "loader.js", "shim.js", "yam7.js", "app.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "favicon-32.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => fetch(u, { cache: "no-cache" }).then(r => r.ok && c.put(u, r)).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const q = e.request; if (q.method !== "GET" || new URL(q.url).origin !== self.location.origin) return;
  e.respondWith(fetch(q, { cache: "no-cache" }).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(q, cp)); } return r; })
    .catch(() => caches.match(q, { ignoreSearch: true }).then(m => m || (q.mode === "navigate" ? caches.match("index.html") : undefined))));
});
