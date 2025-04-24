const CACHE_NAME = "bloom-apps-cache-v1";
const urlsToCache = [
    "./index.html",
    "./calendar.html",
    "./css/common.css",
    "./css/apps.css",
    "./css/calendar.css",
    "./js/common.js",
    "./js/apps.js",
    "./js/calendar.js",
    "./manifest.json",
    "./assets/apps/favicon.ico",
    "./assets/apps/apple-touch-icon.png",
    "./assets/calendar/favicon.ico",
    "./assets/calendar/apple-touch-icon.png",
    "./assets/common/icon-apps.png",
    "./assets/common/icon-calendar.png",
    "./json/onsite_events.json",
    "./json/streaming_events.json",
    "./json/contents.json",
    "./json/locations.json",
    "./json/holidays.json",
    "./json/persons.json"
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
        fetch(event.request)
            .then(networkResponse => {
                // ネットワークから正常に取得できた場合はキャッシュを更新する
                return caches.open(CACHE_NAME).then(cache => {
                    // リクエストが GET のときだけキャッシュ
                    if (event.request.method === "GET") {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // オフライン等でネットから取得できなかった場合はキャッシュから返す
                return caches.match(event.request).then(cachedResponse => {
                    // キャッシュにない場合は index.html（オフライン用）を返す
                    return cachedResponse || caches.match("./index.html");
                });
            })
    );
});
