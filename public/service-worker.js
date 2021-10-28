/**
 * TODO: initial version of the service worker, which does nothing.
 */

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install', e);
});

self.addEventListener('activate', (e) => {
    console.log('[Service Worker] Activate', e);
});

self.addEventListener('fetch', (e) => {
    console.log(`[Service Worker] Fetched resource ${e.request.url}`);
});