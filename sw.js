/*
==================================================
SERVICE WORKER
Roller Score — Alpha 0.2
==================================================
*/

const CACHE_NAME = "roller-score-alpha-0.2-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./models.js",
  "./storage.js",
  "./state.js",
  "./renderer.js",
  "./raceController.js",
  "./scoreController.js",
  "./navigation.js",
  "./dom.js",
  "./ui.js",
  "./athleteSheet.js",
  "./app.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

/*
==================================================
INSTALLAZIONE
==================================================
*/

self.addEventListener(
  "install",
  (event) => {
    self.skipWaiting();

    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) =>
          cache.addAll(
            FILES_TO_CACHE
          )
        )
    );
  }
);

/*
==================================================
ATTIVAZIONE E PULIZIA VECCHIE CACHE
==================================================
*/

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      Promise.all([
        caches
          .keys()
          .then((cacheNames) =>
            Promise.all(
              cacheNames
                .filter(
                  (cacheName) =>
                    cacheName !==
                    CACHE_NAME
                )
                .map(
                  (cacheName) =>
                    caches.delete(
                      cacheName
                    )
                )
            )
          ),

        self.clients.claim()
      ])
    );
  }
);

/*
==================================================
GESTIONE RICHIESTE
==================================================

Strategia:
- prova prima la rete;
- se la rete non è disponibile usa la cache;
- aggiorna la cache con i file più recenti.
*/

self.addEventListener(
  "fetch",
  (event) => {
    if (
      event.request.method !==
      "GET"
    ) {
      return;
    }

    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !==
              200
          ) {
            return networkResponse;
          }

          const responseCopy =
            networkResponse.clone();

          caches
            .open(CACHE_NAME)
            .then((cache) => {
              cache.put(
                event.request,
                responseCopy
              );
            });

          return networkResponse;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then(
              (cachedResponse) =>
                cachedResponse ||
                caches.match(
                  "./index.html"
                )
            )
        )
    );
  }
);