const CACHE_NAME = 'langar-bar-v4-1-cloud-auth';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './styles.css',
  './js/menu-data.js',
  './js/app.js',
  './js/admin.js',
  './js/cloud.js',
  './js/admin-cloud.js',
  './manifest.webmanifest',
  './assets/logo.jpeg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).catch(()=>cached)));
});
