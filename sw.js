const CACHE_NAME = "clash-of-timers-v1";
const urlsToCache = [
  "/Clash-of-Timers/",
  "/Clash-of-Timers/index.html",
  "/Clash-of-Timers/style.css",
  "/Clash-of-Timers/app.js",
  "/Clash-of-Timers/manifest.json"
];

// Instalar Service Worker y cachear archivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activar y limpiar caches antiguos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

// Interceptar peticiones y servir desde cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
