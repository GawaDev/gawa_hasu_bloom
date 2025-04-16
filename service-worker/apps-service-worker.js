const CACHE_NAME = "bloom-apps-cache-v1";
const urlsToCache = [
    "./index.html",
    "./css/common.css",
    "./css/apps.css",
    "./js/apps.js",
    "./manifest/apps-manifest.json",
    "./assets/apps/favicon.ico",
    "./assets/apps/apple-touch-icon.png",
    "./assets/common/icon-apps.png",
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            for (const url of urlsToCache) {
                try {
                    await cache.add(url);
                } catch (e) {
                    console.warn("❌ cache failed:", url, e);
                }
            }
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }).catch(() => {
            return caches.match("./index.html");
        })
    );
});
