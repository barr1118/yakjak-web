/* Minimal YakJak service worker (no build plugins needed).
 *
 * - Offline shell: precaches "/" so the app opens without signal.
 * - Map tiles + local images: cache-first with a cap, so downloaded areas
 *   and visited photos keep working offline.
 * - Everything else: network first, no interference with Firebase/Google.
 *
 * Defensive by design: only GET, skips cross-origin except OSM tiles,
 * and never caches API/auth traffic.
 */

const SHELL_CACHE = "yakjak-shell-v1";
const TILE_CACHE = "yakjak-tiles-v1";
const MAX_TILES = 300;

self.addEventListener("install", (event) => {
  const e = event as ExtendableEvent;
  e.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add("/"))
      .then(() => (self as unknown as ServiceWorkerGlobalScope).skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  const e = event as ExtendableEvent;
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== TILE_CACHE)
          .map((k) => caches.delete(k)),
      );
      await (
        self as unknown as ServiceWorkerGlobalScope
      ).clients.claim();
    })().catch(() => undefined),
  );
});

async function trimCache(cacheName: string, maxItems: number) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]!);
      await trimCache(cacheName, maxItems);
    }
  } catch {
    /* storage may be unavailable — stay silent */
  }
}

self.addEventListener("fetch", (event) => {
  const e = event as FetchEvent;
  const req = e.request;
  if (req.method !== "GET") return;
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Map tiles: cache-first (offline trekking).
  if (url.hostname === "tile.openstreetmap.org") {
    e.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) {
          const cache = await caches.open(TILE_CACHE);
          cache.put(req, res.clone()).catch(() => undefined);
          void trimCache(TILE_CACHE, MAX_TILES);
        }
        return res;
      })().catch(() => caches.match(req)),
    );
    return;
  }

  // Same-origin navigations: network first, shell fallback offline.
  if (url.origin === self.location.origin && req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("/")),
    );
    return;
  }
});
