/**
 * Push handlers, loaded into the generated service worker (importScripts in
 * next.config.ts). The server (cortex-core-api, PushScheduler) sends
 * { title, body, url, tag }. A plain file: no build step.
 */
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { title: 'Lexica', body: event.data ? event.data.text() : '' };
    }
    event.waitUntil(
        self.registration.showNotification(data.title || 'Lexica', {
            body: data.body || '',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: data.tag || 'lexica',
            data: { url: data.url || '/buddy' },
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/buddy';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
            for (const w of windows) {
                if ('focus' in w) {
                    w.navigate(url).catch(() => undefined);
                    return w.focus();
                }
            }
            return self.clients.openWindow(url);
        }),
    );
});
