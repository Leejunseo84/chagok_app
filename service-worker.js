/* 완전 오프라인 동작을 위한 캐시 전략: 앱을 처음 한 번 열면
   아래 파일들을 전부 캐시해두고, 이후에는 인터넷이 없어도
   캐시에서 그대로 불러온다. 데이터(가계부 기록)는 캐시가 아니라
   localStorage에 저장되므로 앱 업데이트와 무관하게 안전하다. */

const CACHE_NAME = "chagok-cache-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./icons.js",
  "./artwork.js",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => cached);
    })
  );
});
