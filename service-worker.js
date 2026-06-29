const CACHE_NAME = 'langar-bar-v4510-mobile-tabs-admin-reviews-hotfix';
const ASSETS = ['./','./index.html','./admin.html','./styles.css','./manifest.webmanifest','./admin-manifest.webmanifest','./js/menu-data.js','./js/app.js','./js/cloud.js','./js/admin.js','./js/admin-cloud.js','./js/admin-stable-v433.js','./assets/logo.jpeg','./assets/icecream_cone.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/admin-icon-192.png','./assets/admin-icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', event => { if(event.request.method !== 'GET') return; event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).catch(()=>cached))); });

self.addEventListener('notificationclick', event => { event.notification.close(); event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(list => { for (const c of list) { if (c.url.includes('/Langar-Bar-Croatia/') && 'focus' in c) return c.focus(); } return clients.openWindow('./'); })); });


self.addEventListener('message', event => {
  const data = event.data || {};
  if(data && data.type === 'langar-show-notification'){
    const title = data.title || 'Langar Bar';
    const options = data.options || { body: data.body || '' };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) { data = { title:'Langar Bar', body: event.data ? event.data.text() : '' }; }
  const title = data.title || data.headings?.en || 'Langar Bar';
  const body = data.body || data.contents?.en || data.message || '';
  const options = { body, icon:'assets/icon-192.png', badge:'assets/icon-192.png', tag:data.tag || 'langar-order-push', data:data.data || {} };
  event.waitUntil(self.registration.showNotification(title, options));
});
