const CACHE_NAME = "finanzas-familia-v4";

const LOCAL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png",

  "./globals.js",

  "./Login.js",
  "./DashboardTab.js",
  "./AnaliticaTab.js",
  "./CuentasTab.js",
  "./IngresosTab.js",
  "./EgresosTab.js",
  "./DeudasTab.js",
  "./InversionesTab.js",
  "./PresupuestosTab.js",
  "./SimuladorTab.js",
  "./SettingsTab.js",
  "./App.js"
];

// ============================================================================
// INSTALACIÓN: cachea archivos locales de la app
// ============================================================================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        LOCAL_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { cache: "reload" });

            if (response && response.ok) {
              await cache.put(asset, response);
            }
          } catch (error) {
            console.warn("[SW] No se pudo precachear:", asset, error);
          }
        })
      );
    })
  );
});

// ============================================================================
// ACTIVACIÓN: elimina cachés viejos
// ============================================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================================================
// HELPERS
// ============================================================================
const isHttpRequest = (request) => {
  return request.url.startsWith("http://") || request.url.startsWith("https://");
};

const isSameOrigin = (request) => {
  return new URL(request.url).origin === self.location.origin;
};

// ============================================================================
// FETCH
// ============================================================================
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !isHttpRequest(request)) {
    return;
  }

  // --------------------------------------------------------------------------
  // Navegación: intenta red, cae a index.html cacheado
  // --------------------------------------------------------------------------
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put("./index.html", copy);
          });

          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match("./index.html");
          return cachedIndex || new Response("App offline: index.html no está cacheado.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
        })
    );

    return;
  }

  // --------------------------------------------------------------------------
  // Archivos locales: cache first, actualiza en segundo plano
  // --------------------------------------------------------------------------
  if (isSameOrigin(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, copy);
              });
            }

            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );

    return;
  }

  // --------------------------------------------------------------------------
  // CDN / externos: network first, cache fallback
  // Firebase, React, Recharts, Tailwind, fuentes, etc.
  // --------------------------------------------------------------------------
  event.respondWith(
    fetch(request)
      .then((response) => {
        const shouldCache = response && (response.ok || response.type === "opaque");

        if (shouldCache) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) return cached;

        return new Response("Recurso externo no disponible offline.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});
