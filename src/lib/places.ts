import type { Place } from "./types";

/**
 * Ported 1:1 from yakjak_app/lib/data/mock_data.dart.
 * Image paths point to /public/images (renamed to kebab-case, no spaces).
 * Used as the offline fallback when Firestore is unreachable/empty.
 */
export const places: Place[] = [
  {
    name: "Lhok Mata Ie",
    slug: "lhok-mata-ie",
    image: "/images/lhok-mata-ie.jpeg",
    descriptionKey: "desc_lhok_mata_ie",
    lat: 5.545,
    lng: 95.285,
    track: [
      [5.541, 95.288],
      [5.543, 95.287],
      [5.544, 95.286],
      [5.545, 95.285],
    ],
    difficulty: "Easy",
    category: "Beach",
    distance: 1.38,
    estTime: "0:26 min",
    elevationGain: 132,
    rating: 4.8,
  },
  {
    name: "Goh Leumoe",
    slug: "goh-leumoe",
    image: "/images/goh-leumoe.jpg",
    descriptionKey: "desc_goh_leumoe",
    lat: 5.532,
    lng: 95.334,
    track: [
      [5.529, 95.332],
      [5.53, 95.333],
      [5.531, 95.333],
      [5.532, 95.334],
    ],
    difficulty: "Hard",
    category: "Mountain",
    distance: 15.6,
    estTime: "8:45 hrs",
    elevationGain: 1250,
    rating: 4.5,
  },
  {
    name: "Lhok Keutapang",
    slug: "lhok-keutapang",
    image: "/images/lhok-keutapang.jpg",
    descriptionKey: "desc_lhok_keutapang",
    lat: 5.561,
    lng: 95.317,
    track: [
      [5.558, 95.315],
      [5.559, 95.316],
      [5.56, 95.316],
      [5.561, 95.317],
    ],
    difficulty: "Hard",
    category: "Coastal Trek",
    distance: 12.4,
    estTime: "6:30 hrs",
    elevationGain: 850,
    rating: 4.9,
  },
];

export function getPlaceBySlug(slug: string): Place | undefined {
  return places.find((p) => p.slug === slug);
}

export function getPlaceByName(name: string): Place | undefined {
  return places.find((p) => p.name === name);
}

export function findBySlug(list: Place[], slug: string): Place | undefined {
  return list.find((p) => p.slug === slug);
}

export function findByName(list: Place[], name: string): Place | undefined {
  return list.find((p) => p.name === name);
}

function asDifficulty(v: unknown): Place["difficulty"] {
  return v === "Easy" || v === "Moderate" || v === "Hard" ? v : "Moderate";
}

function asTrack(v: unknown): [number, number][] {
  if (!Array.isArray(v)) return [];
  const out: [number, number][] = [];
  for (const p of v) {
    if (Array.isArray(p) && p.length >= 2) {
      const la = Number(p[0]);
      const ln = Number(p[1]);
      if (Number.isFinite(la) && Number.isFinite(ln)) out.push([la, ln]);
    } else if (p && typeof p === "object") {
      // Firestore shape (nested arrays are not allowed there)
      const rec = p as Record<string, unknown>;
      const la = Number(rec.lat);
      const ln = Number(rec.lng ?? rec.lon);
      if (Number.isFinite(la) && Number.isFinite(ln)) out.push([la, ln]);
    }
  }
  return out;
}

/** Validate + normalize one Firestore `places` document. */
export function placeFromDoc(
  id: string,
  data: Record<string, unknown>,
): Place | null {
  try {
    const name = String(data.name ?? id);
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      name,
      slug: typeof data.slug === "string" && data.slug ? data.slug : id,
      image: String(data.image ?? ""),
      descriptionKey: String(data.descriptionKey ?? data.description ?? ""),
      lat,
      lng,
      track: asTrack(data.track),
      difficulty: asDifficulty(data.difficulty),
      category: String(data.category ?? "Trek"),
      distance: Number(data.distance ?? 0),
      estTime: String(data.estTime ?? "-"),
      elevationGain: Number(data.elevationGain ?? 0),
      rating: Number(data.rating ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * One-shot read of the `places` collection. Returns [] when unreachable or
 * empty — callers fall back to the local list. Firebase is imported lazily
 * so server components (SSG) never initialize Auth in Node.
 */
export async function fetchPlacesFromFirestore(): Promise<Place[]> {
  const { collection, getDocs } = await import("firebase/firestore");
  const { db } = await import("./firebase");
  const snap = await getDocs(collection(db, "places"));
  const list: Place[] = [];
  snap.forEach((d) => {
    const p = placeFromDoc(d.id, d.data() as Record<string, unknown>);
    if (p) list.push(p);
  });
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}
