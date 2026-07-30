/**
 * Minimal service worker for PWA install eligibility.
 * Network-only fetch handling — no caching of API, auth, map, or live restroom data.
 */
const SHELL_CACHE = 'flushpin-shell-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(['/manifest.json']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
