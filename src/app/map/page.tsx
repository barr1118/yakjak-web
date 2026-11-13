"use client";

import dynamic from "next/dynamic";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { usePlaces } from "@/lib/places-context";
import { useFavorites } from "@/lib/store";
import { NearbyCard, useLoginGate } from "@/components/PlaceCards";

const TrekMap = dynamic(() => import("@/components/TrekMap"), { ssr: false });

/**
 * Fullscreen map tab — implements roadmap item "Navigasi Tab MAP"
 * (fullscreen map with all route points) which is still "coming soon" in the app.
 */
export default function MapPage() {
  const { lang } = useLanguage();
  const { allPlaces: places } = usePlaces();
  const { favorites, toggleFavorite } = useFavorites();
  const gate = useLoginGate();

  const center: [number, number] = [
    places.reduce((s, p) => s + p.lat, 0) / places.length,
    places.reduce((s, p) => s + p.lng, 0) / places.length,
  ];

  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#C2410C]">
        {t(lang, "nav_map")}
      </p>
      <h1 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight text-[#17251C]">
        {t(lang, "map_title")}
      </h1>
      <p className="mt-1 text-sm text-[#5B6B5F]">{t(lang, "map_subtitle")}</p>

      <div className="mt-4">
        <TrekMap
          places={places}
          center={center}
          zoom={12}
          height={420}
          minZoom={5}
          maxZoom={16}
        />
      </div>

      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#17251C]">
        {t(lang, "all_places")} ({places.length})
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {places.map((p) => (
          <NearbyCard
            key={p.slug}
            place={p}
            lang={lang}
            isFavorite={favorites.has(p.name)}
            onToggle={(name) => toggleFavorite(name, favorites.has(name))}
            onRequireLogin={gate.requireLogin}
          />
        ))}
      </div>
      {gate.dialog}
    </div>
  );
}
