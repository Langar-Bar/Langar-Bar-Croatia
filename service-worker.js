const CACHE_NAME = 'langar-bar-v3.9';
const CORE_ASSETS = [
  './', './index.html', './styles.css', './js/menu-data.js', './js/app.js', './js/admin.js', './admin.html', './assets/logo.jpeg', './manifest.webmanifest'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).catch(()=>cached)));
});
