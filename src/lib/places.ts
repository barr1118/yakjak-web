import type { Place } from "./types";

/**
 * Pilot catalog for YakJak 2.0.
 *
 * The first three destinations come from the original Flutter mock data and
 * have been field-checked. The rest are real Aceh destinations with
 * approximate coordinates and tracks for the MVP demo — marked
 * `verified: false` until the field team checks them.
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
    region: "Aceh Besar",
    bestSeason: "Apr–Sep",
    verified: true,
    lastFieldCheck: "2026-11-02",
    adat: {
      authority: "Panglima Laot setempat",
      permitRequired: false,
      rules: [
        "Jangan meninggalkan sampah plastik.",
        "Hormati warga gampong dan area yang ditandai.",
        "Dilarang memetik tanaman atau menangkap biota.",
      ],
      calendarNote:
        "Cek kalender Panglima Laot sebelum aktivitas perahu. Aturan resmi menyusul setelah MoU.",
    },
    safety: {
      contacts: [
        { label: "Darurat nasional", phone: "112" },
        { label: "SAR (BASARNAS)", phone: "115" },
        { label: "Layanan kesehatan", phone: "119" },
      ],
      hazards: ["Jalur licin saat hujan", "Sinyal seluler lemah"],
      signal: "Lemah",
    },
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
    region: "Aceh Besar",
    bestSeason: "Jun–Sep",
    verified: true,
    lastFieldCheck: "2026-10-26",
    adat: {
      authority: "Gampong / Mukim setempat",
      permitRequired: true,
      rules: [
        "Lapor ke perangkat gampong sebelum pendakian.",
        "Gunakan pemandu lokal untuk jalur yang belum ditandai.",
        "Bawa kembali seluruh sampah.",
      ],
      calendarNote:
        "Izin dan aturan jalur dapat berubah; konfirmasi ke gampong sebelum berangkat.",
    },
    safety: {
      contacts: [
        { label: "Darurat nasional", phone: "112" },
        { label: "SAR (BASARNAS)", phone: "115" },
        { label: "Layanan kesehatan", phone: "119" },
      ],
      hazards: ["Jalur terjal", "Sinyal sangat terbatas", "Kabut tebal"],
      signal: "Tidak stabil",
    },
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
    region: "Aceh Besar",
    bestSeason: "Mar–Sep",
    verified: true,
    lastFieldCheck: "2026-10-26",
    adat: {
      authority: "Panglima Laot setempat",
      permitRequired: true,
      rules: [
        "Hormati hari pantang dan aturan Panglima Laot.",
        "Jangan merusak terumbu atau mengambil biota laut.",
        "Gunakan jalur yang disepakati warga.",
      ],
      calendarNote:
        "Kalender hari pantang wajib divalidasi dengan Panglima Laot sebelum rilis publik.",
    },
    safety: {
      contacts: [
        { label: "Darurat nasional", phone: "112" },
        { label: "SAR (BASARNAS)", phone: "115" },
        { label: "Layanan kesehatan", phone: "119" },
      ],
      hazards: ["Batu licin", "Arus laut kuat", "Sinyal lemah"],
      signal: "Lemah",
    },
  },
  {
    name: "Pantai Lampuuk",
    slug: "pantai-lampuuk",
    image: "/images/pantai-lampuuk.jpg",
    imageCredit: "Afrizal Saputra / Wikimedia Commons",
    imageLicense: "CC BY-SA 4.0",
    descriptionKey: "desc_pantai_lampuuk",
    lat: 5.4833,
    lng: 95.2333,
    track: [
      [5.481, 95.231],
      [5.482, 95.232],
      [5.483, 95.233],
      [5.4833, 95.2333],
    ],
    difficulty: "Easy",
    category: "Beach",
    distance: 1.2,
    estTime: "0:20 min",
    elevationGain: 15,
    rating: 4.7,
    region: "Aceh Besar",
    bestSeason: "Apr–Sep",
    verified: false,
    adat: {
      authority: "Panglima Laot setempat",
      permitRequired: false,
      rules: [
        "Patuhi batas area berenang.",
        "Jangan meninggalkan sampah.",
        "Hormati warga dan aktivitas nelayan.",
      ],
      calendarNote: "Data adat awal — perlu validasi lapangan.",
    },
    safety: {
      contacts: [
        { label: "Darurat nasional", phone: "112" },
        { label: "SAR (BASARNAS)", phone: "115" },
        { label: "Layanan kesehatan", phone: "119" },
      ],
      hazards: ["Arus balik", "Matahari terik", "Sinyal baik"],
      signal: "Baik",
    },
  },
  {
    name: "Air Terjun Suhom",
    slug: "air-terjun-suhom",
    image: "/images/air-terjun-suhom.jpg",
    imageCredit: "Popularitas.com",
    imageLicense: "Foto editorial",
    descriptionKey: "desc_air_terjun_suhom",
    lat: 5.483,
    lng: 95.283,
    track: [
      [5.479, 95.28],
      [5.48, 95.281],
      [5.482, 95.282],
      [5.483, 95.283],
    ],
    difficulty: "Moderate",
    category: "Waterfall",
    distance: 2.4,
    estTime: "1:10 hrs",
    elevationGain: 180,
    rating: 4.6,
    region: "Aceh Besar",
    bestSeason: "Nov–Mar",
    verified: false,
    adat: {
      authority: "Gampong / Mukim setempat",
      permitRequired: false,
      rules: [
        "Jaga kebersihan area air terjun.",
        "Dilarang memetik tanaman atau menangkap hewan.",
        "Gunakan alas kaki anti-slip.",
      ],
      calendarNote: "Data adat awal — perlu validasi lapangan.",
    },
    safety: {
      contacts: [
        { label: "Darurat nasional", phone: "112" },
        { label: "SAR (BASARNAS)", phone: "115" },
        { label: "Layanan kesehatan", phone: "119" },
      ],
      hazards: ["Batu licin", "Debit air naik saat hujan", "Sinyal terbatas"],
      signal: "Terbatas",
    },
  },
  {
    name: "Danau Laut Tawar",
    slug: "danau-laut-tawar",
    image: "/images/danau-laut-tawar.jpg",
    imageCredit: "MNWAR11 / Wikimedia Commons",
    imageLicense: "CC BY 4.0",
    descriptionKey: "desc_danau_laut_tawar",
    lat: 4.6167,
    lng: 96.8333,
    track: [
      [4.61, 96.83],
      [4.613, 96.831],
      [4.615, 96.832],
      [4.6167, 96.8333],
    ],
    difficulty: "Easy",
    category: "Lake",
    distance: 3.5,
    estTime: "1:30 hrs",
    elevationGain: 60,
    rating: 4.8,
    region: "Aceh Tengah",
    bestSeason: "Apr–Sep",
    verified: false,
    adat: {
      authority: "Gampong / Mukim setempat",
      permitRequired: false,
      rules: [
        "Jangan mencemari danau.",
        "Hormati area nelayan dan kebun warga.",
        "Bawa kembali sampah.",
      ],
      calendarNote: "Data adat awal — perlu validasi lapangan.",
    },
    safety: {
      contacts: [
        { label: "Darurat nasional", phone: "112" },
        { label: "SAR (BASARNAS)", phone: "115" },
        { label: "Layanan kesehatan", phone: "119" },
      ],
      hazards: ["Suhu malam dingin", "Kabut pagi", "Sinyal baik"],
      signal: "Baik",
    },
  },
  {
    name: "Pulau Weh",
    slug: "pulau-weh",
    image: "/images/pulau-weh.jpg",
    imageCredit: "Eunike25 / Wikimedia Commons",
    imageLicense: "CC BY 4.0",
    descriptionKey: "desc_pulau_weh",
    lat: 5.8833,
    lng: 95.3167,
    track: [
      [5.879, 95.313],
      [5.88, 95.314],
      [5.882, 95.315],
      [5.8833, 95.3167],
    ],
    difficulty: "Moderate",
    category: "Island",
    distance: 6.2,
    estTime: "3:00 hrs",
    elevationGain: 320,
    rating: 4.9,
    region: "Sabang",
    bestSeason: "Mar–Sep",
    verified: false,
    adat: {
      authority: "Panglima Laot setempat",
      permitRequired: true,
      rules: [
        "Patuhi aturan kawasan konservasi laut.",
        "Jangan menyentuh terumbu karang.",
        "Gunakan operator perahu yang terdaftar.",
      ],
      calendarNote:
        "Data adat awal — perlu koordinasi dengan Panglima Laot dan pengelola kawasan.",
    },
    safety: {
      contacts: [
        { label: "Darurat nasional", phone: "112" },
        { label: "SAR (BASARNAS)", phone: "115" },
        { label: "Layanan kesehatan", phone: "119" },
      ],
      hazards: ["Arus laut", "Cuaca cepat berubah", "Sinyal tidak stabil di laut"],
      signal: "Tidak stabil",
    },
  },
  {
    name: "Burni Telong",
    slug: "burni-telong",
    image: "/images/burni-telong.jpg",
    imageCredit: "Muklana mustaqim pulungan / Wikimedia Commons",
    imageLicense: "CC BY-SA 4.0",
    descriptionKey: "desc_burni_telong",
    lat: 4.7667,
    lng: 96.8167,
    track: [
      [4.762, 96.813],
      [4.764, 96.814],
      [4.766, 96.815],
      [4.7667, 96.8167],
    ],
    difficulty: "Hard",
    category: "Mountain",
    distance: 11.8,
    estTime: "7:00 hrs",
    elevationGain: 1400,
    rating: 4.7,
    region: "Bener Meriah",
    bestSeason: "Jun–Sep",
    verified: false,
    adat: {
      authority: "Gampong / Mukim setempat",
      permitRequired: true,
      rules: [
        "Lapor ke pengelola jalur sebelum mendaki.",
        "Gunakan pemandu lokal.",
        "Jangan meninggalkan sampah.",
      ],
      calendarNote: "Data adat awal — perlu validasi lapangan.",
    },
    safety: {
      contacts: [
        { label: "Darurat nasional", phone: "112" },
        { label: "SAR (BASARNAS)", phone: "115" },
        { label: "Layanan kesehatan", phone: "119" },
      ],
      hazards: ["Jalur panjang", "Suhu dingin", "Sinyal terbatas"],
      signal: "Terbatas",
    },
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
      region: typeof data.region === "string" ? data.region : undefined,
      bestSeason:
        typeof data.bestSeason === "string" ? data.bestSeason : undefined,
      verified: typeof data.verified === "boolean" ? data.verified : undefined,
      lastFieldCheck:
        typeof data.lastFieldCheck === "string"
          ? data.lastFieldCheck
          : undefined,
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
