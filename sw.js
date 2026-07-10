/*
==================================================
SERVICE WORKER
Roller Score
Alpha 0.3.1
==================================================
*/

const CACHE_NAME =
  "roller-score-alpha-0.3.1";

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
INSTALL
==================================================
*/

self.addEventListener(
  "install",
  event => {
    self.skipWaiting();

    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(cache =>
          cache.addAll(
            FILES_TO_CACHE
          )
        )
    );
  }
);

/*
==================================================
ACTIVATE
==================================================
*/

self.addEventListener(
  "activate",
  event => {
    event.waitUntil(
      Promise.all([
        caches.keys().then(keys =>
          Promise.all(
            keys
              .filter(
                key =>
                  key !==
                  CACHE_NAME
              )
              .map(key =>
                caches.delete(
                  key
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
FETCH
==================================================
*/

self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !==
      "GET"
    ) {
      return;
    }

    event.respondWith(

      fetch(event.request)

        .then(response => {

          if (
            !response ||
            response.status !== 200
          ) {
            return response;
          }

          const copy =
            response.clone();

          caches
            .open(CACHE_NAME)
            .then(cache => {
              cache.put(
                event.request,
                copy
              );
            });

          return response;

        })

        .catch(() =>

          caches
            .match(
              event.request
            )
            .then(
              cached =>
                cached ||
                caches.match(
                  "./index.html"
                )
            )

        )

    );

  }
);