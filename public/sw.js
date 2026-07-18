// ================================================================
// ORION - Service Worker (FASE 12)
// Cache-first para estáticos, network-first para páginas (navigate),
// com fallback offline simples.
// ================================================================

const CACHE = 'orion-static-v1'
const STATIC_ASSETS = ['/manifest.json', '/icon.svg', '/icon-maskable.svg', '/dashboard']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Network-first para navegação de páginas
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r || caches.match('/dashboard')))
    )
    return
  }

  // Cache-first para demais estáticos
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {})
          return response
        })
        .catch(() => cached)
    })
  )
})
