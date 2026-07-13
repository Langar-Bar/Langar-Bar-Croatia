const CACHE_NAME = 'langar-bar-v531-operational-fixes';
const ASSETS = ['./','./index.html','./admin.html','./styles.css','./manifest.webmanifest','./admin-manifest.webmanifest','./js/menu-data.js','./js/app.js','./js/cloud.js','./js/auth-v500.js','./privacy.html','./terms.html','./js/admin.js','./js/admin-cloud.js','./js/admin-stable-v433.js','./js/order-print-v510.js','./README_V510_START_HERE.md','./assets/logo.jpeg','./assets/icecream_cone.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/admin-icon-192.png','./assets/admin-icon-512.png','js/stabilization-v520.js'
,'js/admin-stabilization-v520.js'
,'js/order-print-v520.js'
,'css/stabilization-v520.css',
'js/order-print-v530.js',
'js/admin-polish-v530.js',
'js/client-polish-v530.js',
'css/production-polish-v530.css',
'js/admin-fixes-v531.js',
'js/client-fixes-v531.js',
'css/production-fixes-v531.css'
];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url=new URL(event.request.url);
  const dynamic = event.request.mode==='navigate' || /\.(?:js|css|html)$/.test(url.pathname);
  if(dynamic){
    event.respondWith(fetch(event.request).then(response=>{ const copy=response.clone(); caches.open(CACHE_NAME).then(c=>c.put(event.request,copy)); return response; }).catch(()=>caches.match(event.request)));
  }else{
    event.respondWith(caches.match(event.request).then(cached=>cached || fetch(event.request)));
  }
});

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