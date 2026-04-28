const CACHE = 'atm-guide-v2026.04.28.1';
const APP_SHELL = './index.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([
      './',
      APP_SHELL,
      './manifest.json?v=2026.04.28.1',
      './icon-192-v2026.04.14.13.png',
      './apple-touch-icon-v2026.04.14.13.png',
      './icon-v2026.04.14.13.svg',
      './logos/xinye.svg',
      './logos/shanghai.svg',
      './logos/changsha.svg',
      './logos/citic.svg',
      './logos/wise-mark.svg',
      './logos/boc.svg',
      './logos/hsbc-symbol.svg',
      './logos/hangseng-symbol.svg',
      './logos/bea.svg',
      './logos/cncb.png'
    ]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.mode === 'navigate'){
    // 主頁面永遠網絡優先，確保拿到最新版
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(async () => {
        return (await caches.match(e.request)) || caches.match(APP_SHELL);
      })
    );
    return;
  }
  // 其他資源：緩存優先
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => Response.error());
    })
  );
});
