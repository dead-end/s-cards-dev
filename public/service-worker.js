/**
 * Cache name with a version. Each time the caches resources were changed, the 
 * version has to be increased to ensure that the cache is invalidated.
 */
const staticCacheName = 'site-static-v1';

/**
 * An array of assets the should be cached.
 */
const assets = [
    // TODO: Removed from cache to make dev easier.
    /*
    '/',
    '/index.html',
    '/favicon.ico',
    '/global.css',
    '/build/bundle.css',
    '/build/bundle.js',
    */
    'https://unpkg.com/sanitize.css@12.0.1/sanitize.css',
    'https://unpkg.com/sanitize.css/forms.css'
];

/**
 * Add an event listener for the install event.
 */
self.addEventListener('install', event => {
    console.log('[Service Worker] Install', event);

    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            cache.addAll(assets);
        })
    );
});

/**
 * Add an event listener for the activate event.
 */
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate', event);

    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

/**
 * Add an event listener for the activate event.
 */
self.addEventListener('fetch', event => {
    console.log(`[Service Worker] Fetched resource ${event.request.url}`);

    event.respondWith(
        caches.match(event.request).then(cacheRes => {
            return cacheRes || fetch(event.request);
        })
    );
});