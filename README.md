# YakJak — Ekoturisme Komunitas Aceh

Web MVP untuk tugas **Sektor Unggulan Digital Entrepreneurship (Sektor 9: Pariwisata, Kebudayaan & Ekoturisme)**. YakJak menghubungkan traveler dengan rute terverifikasi, penyedia lokal, aturan adat, dan Trip Pack offline di Aceh.

## Jalankan lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Deploy (Firebase Hosting)

Produksi: **https://yakjak-fc2ca.web.app**

```bash
npm run build:static
npx firebase-tools deploy --only hosting --project yakjak-fc2ca
```

`build:static` memakai `output: "export"` dan `NEXT_PUBLIC_SITE_URL=https://yakjak-fc2ca.web.app`. Untuk server/Vercel gunakan `npm run build` biasa.

## Demo tanpa daftar

Klik **Coba demo** di navbar, lalu pilih salah satu peran:

| Peran | Yang bisa dicoba |
| --- | --- |
| Demo traveler | Favorit, booking request, unduh Trip Pack, isi ulasan & laporan jalur |
| Demo provider | Lihat permintaan masuk, konfirmasi/tolak booking, cek listing |
| Demo admin | Verifikasi penyedia baru, pantau destinasi & laporan jalur |

Data demo disimpan di `localStorage` browser (`yakjak-demo-v2`). Tombol **Reset data demo** ada di halaman Profil.

## Fitur MVP

- 8 destinasi Aceh, 3 di antaranya bertanda **terverifikasi lapangan**; sisanya **data awal**.
- 8 penyedia lokal (guide, homestay, kuliner, kerajinan, perahu) dengan halaman profil dan layanan.
- Booking request tanpa payment gateway — penyedia mengonfirmasi, traveler membayar langsung.
- Trip Pack offline: foto, kontak, aturan adat, dan blok peta 5×5 tile disimpan via Cache API.
- Detail destinasi: tingkat kesulitan, musim terbaik, cuaca Open-Meteo, peta jalur, adat (Panglima Laot/gampong), keselamatan, penyedia, ulasan, laporan jalur.
- Mode ekspedisi GPS dengan filter akurasi dan penyimpanan riwayat.
- Dashboard penyedia dan admin verifikasi.
- Bilingual ID/EN, PWA (manifest + service worker), responsif mobile/desktop.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · Leaflet · Firebase Auth/Firestore (project `yakjak-fc2ca`) · TypeScript.

## Firebase

- Web config: `.env.local` (gitignored; template di `.env.example`).
- Rules: `firebase.json` + `firestore.rules`, deploy dengan `npx firebase-tools deploy --only firestore:rules`.
- Auth aktif: Email/Password dan Google. Domain `yakjak-fc2ca.web.app` sudah ada di **Authentication → Settings → Authorized domains**.
- Katalog destinasi tetap memakai seed lokal di `src/lib/places.ts`; Firestore dipakai untuk favorit, ulasan, dan riwayat pengguna.

## Catatan data

Katalog destinasi, penyedia, dan layanan berada di `src/lib/places.ts` dan `src/lib/seed.ts` sebagai **data pilot**. Angka finansial di PRD adalah asumsi yang perlu divalidasi. Harga dan kontak penyedia adalah contoh untuk demo, bukan penawaran komersial.

## Verifikasi

```bash
npm run check
npm run build:static
```
