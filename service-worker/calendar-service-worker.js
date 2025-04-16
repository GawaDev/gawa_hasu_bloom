const CACHE_NAME = "bloom-calendar-cache-v1";
const urlsToCache = [
    "/",
    "/calendar.html",
    "/css/common.css",
    "/css/style.css",
    "/js/script.js",
    "/manifest/calendar-manifest.json",
    "/assets/calendar/favicon.ico",
    "/assets/calendar/apple-touch-icon.png",
    "/assets/common/icon-calendar.png",
    "/json/onsite_events.json",
    "/json/streaming_events.json",
    "/json/contents.json",
    "/json/locations.json",
    "/json/holidays.json",
    "/json/persons.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }).catch(() => {
            return caches.match("/calendar.html");
        })
    );
});
