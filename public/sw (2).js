// UNBROKEN Service Worker
//
// v2 – behebt einen Fehler aus v1: dort wurde jede gleich-Origin-GET-Antwort
// cache-first gespeichert. Weil vercel.json fehlende Dateien auf index.html
// umschreibt (Status 200!), landete HTML unter JSON-Adressen im Cache und
// blieb dort, auch nachdem die echten Dateien deployed waren.
//
// Regeln jetzt:
//   - Nur Build-Assets mit Hash im Namen (/assets/...) werden gecacht.
//   - Alles andere laeuft ueber das Netz; nur bei Offline greift der Cache.
//   - Antworten, deren Content-Type nicht zur Anfrage passt, werden
//     nie gespeichert.

const CACHE = "unbroken-v2";           // Name-Wechsel loescht v1 automatisch
const CORE  = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Nur gehashte Build-Dateien sind unveraenderlich und duerfen cache-first laufen.
function istBuildAsset(url) {
  return url.pathname.startsWith("/assets/");
}

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation: immer erst Netz, Cache nur als Offline-Notnagel
  if (request.mode === "navigate") {
    e.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }

  // Unveraenderliche Build-Assets: Cache zuerst
  if (istBuildAsset(url)) {
    e.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        return fetch(request).then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Alles Uebrige (Icons, manifest, spaetere API-Antworten):
  // Netz zuerst, Cache nur wenn offline.
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
