const CACHE_NAME = "alerth-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/script.js",
  "/manifest.json",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
];

// Instalando o Service Worker e armazenando arquivos no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação do Service Worker e remoção de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Interceptação de requisições para servir arquivos do cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
