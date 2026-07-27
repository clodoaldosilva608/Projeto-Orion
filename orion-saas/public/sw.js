// Orion SaaS — Service Worker SELF-DESTRUCT
// This SW immediately unregisters itself to clear any old cached SW
// that was causing session loss on page navigation.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete ALL caches
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => {
      // Unregister this service worker
      return self.registration.unregister();
    }).then(() => {
      // Tell all clients to reload
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    })
  );
});

// Pass through ALL requests — no interception
self.addEventListener('fetch', (event) => {
  // Do nothing — let the browser handle all requests normally
  return;
});
