"use client";

import { demo, getDemoState } from "./demo-store";
import type { Place } from "./types";

const CACHE_NAME = "yakjak-trip-packs-v1";
const TILE_ZOOM = 13;
const TILE_SPAN = 2;

function tileX(lng: number, z: number): number {
  return Math.floor(((lng + 180) / 360) * 2 ** z);
}

function tileY(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      2 ** z,
  );
}

export function tileUrlsForPlace(place: Place): string[] {
  const max = 2 ** TILE_ZOOM - 1;
  const cx = tileX(place.lng, TILE_ZOOM);
  const cy = tileY(place.lat, TILE_ZOOM);
  const urls: string[] = [];
  for (let dx = -TILE_SPAN; dx <= TILE_SPAN; dx++) {
    for (let dy = -TILE_SPAN; dy <= TILE_SPAN; dy++) {
      const x = Math.min(max, Math.max(0, cx + dx));
      const y = Math.min(max, Math.max(0, cy + dy));
      urls.push(`https://tile.openstreetmap.org/${TILE_ZOOM}/${x}/${y}.png`);
    }
  }
  return [...new Set(urls)];
}

export interface PackProgress {
  done: number;
  total: number;
  label: string;
}

/**
 * Download a destination pack: destination photo(s) + a small block of map
 * tiles around the route. Data itself is already in the local seed, so the
 * pack works even if tile prefetch is blocked by the network.
 *
 * The 5x5 tile block is intentionally tiny; a production build should use a
 * tile provider such as MapTiler or Protomaps (OSM policy discourages bulk
 * downloads).
 */
export async function downloadTripPack(
  place: Place,
  onProgress?: (p: PackProgress) => void,
): Promise<void> {
  const images = [place.image, ...(place.gallery ?? [])].filter(Boolean);
  const tiles = tileUrlsForPlace(place);
  const urls = [...images, ...tiles];
  const total = urls.length;

  if (typeof window !== "undefined" && "caches" in window) {
    const cache = await caches.open(CACHE_NAME);
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]!;
      onProgress?.({
        done: i,
        total,
        label: i < images.length ? "Menyimpan foto…" : "Menyimpan peta…",
      });
      try {
        const isTile = url.includes("tile.openstreetmap.org");
        const res = await fetch(url, isTile ? { mode: "no-cors" } : undefined);
        if (res.ok || res.type === "opaque") await cache.put(url, res);
      } catch {
        // A failed tile should not fail the whole pack.
      }
    }
  }

  onProgress?.({ done: total, total, label: "Selesai" });
  if (!getDemoState().packs.includes(place.slug)) demo.togglePack(place.slug);
}

export async function removeTripPack(place: Place): Promise<void> {
  if (typeof window !== "undefined" && "caches" in window) {
    const cache = await caches.open(CACHE_NAME);
    const urls = [place.image, ...(place.gallery ?? []), ...tileUrlsForPlace(place)];
    await Promise.all(urls.map((u) => cache.delete(u).catch(() => false)));
  }
  if (getDemoState().packs.includes(place.slug)) demo.togglePack(place.slug);
}

export async function hasCachedPack(place: Place): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) return false;
  const cache = await caches.open(CACHE_NAME);
  const hit = await cache.match(place.image);
  return Boolean(hit);
}
