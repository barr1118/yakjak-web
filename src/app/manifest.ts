import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YakJak — Ekoturisme Komunitas Aceh",
    short_name: "YakJak",
    description:
      "Rute terverifikasi, peta offline, penyedia lokal, dan aturan adat untuk ekoturisme Aceh.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F4EC",
    theme_color: "#1F4D3A",
    lang: "id",
    icons: [
      {
        src: "/icons/Icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/Icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/Icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/Icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
