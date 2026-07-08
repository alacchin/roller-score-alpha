const CACHE_NAME = "roller-score-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/config.js",
  "/dom.js",
  "/models.js",
  "/navigation.js",
  "/raceController.js",
  "/renderer.js",
  "/scoreController.js",
  "/state.js",
  "/storage.js",
  "/ui.js",
  "/athleteSheet.js",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
