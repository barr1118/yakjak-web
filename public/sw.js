/* Minimal YakJak service worker (plain JS — no build step).
 *
 * - Offline shell: precaches "/" so the app opens without signal.
 * - Map tiles + local images: cache-first, capped.
 * - Trip Pack cache (managed by lib/trip-pack.ts) is preserved.
 * - Navigations: network first, shell fallback.
 * - Never touches Firebase/API traffic.
 */

const SHELL_CACHE = "yakjak-shell-v2";
const TILE_CACHE = "yakjak-tiles-v2";
const PACK_CACHE = "yakjak-trip-packs-v1";
const MAX_TILES = 300;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add("/"))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, TILE_CACHE, PACK_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })().catch(() => undefined),
  );
});

async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      await trimCache(cacheName, maxItems);
    }
  } catch {
    /* storage may be unavailable — stay silent */
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Map tiles: cache-first (offline trekking).
  if (url.hostname === "tile.openstreetmap.org") {
    event.respondWith(
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

  // Local images: cache-first so downloaded photos survive offline.
  if (url.origin === self.location.origin && req.destination === "image") {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) {
          const cache = await caches.open(SHELL_CACHE);
          cache.put(req, res.clone()).catch(() => undefined);
        }
        return res;
      })().catch(() => caches.match(req)),
    );
    return;
  }

  // Same-origin navigations: network first, shell fallback offline.
  if (url.origin === self.location.origin && req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/")));
  }
});
