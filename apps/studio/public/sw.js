// Minimal service worker so Android lets you install Studio (and use it as a
// share target). It caches nothing: Studio always needs the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
