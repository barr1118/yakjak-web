"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { usePlaces } from "@/lib/places-context";
import { useOfflineDownloads } from "@/lib/store";

/**
 * Offline tab — on mobile this will download map tiles to local storage.
 * On web we persist the destination snapshot in localStorage instead.
 */
export default function OfflinePage() {
  const { lang } = useLanguage();
  const { allPlaces } = usePlaces();
  const { downloaded, toggleDownload } = useOfflineDownloads();

  const resolved = downloaded
    .map((slug) => allPlaces.find((p) => p.slug === slug))
    .filter((p) => p !== undefined);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t(lang, "offline_title")}</h1>
      <p className="mt-1 text-sm text-[#5D6F61]">
        {downloaded.length} {t(lang, "downloaded").toLowerCase()}
      </p>

      {resolved.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#D9D2BD] p-10 text-center">
          <div className="text-4xl">📦</div>
          <p className="mt-3 text-[#5D6F61]">{t(lang, "offline_empty")}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-[#2F7D4F] px-5 py-2.5 text-sm font-extrabold text-[#FFFFFF]"
          >
            {t(lang, "nav_explore")}
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {resolved.map((p) =>
            p ? (
              <div
                key={p.slug}
                className="flex h-[120px] overflow-hidden rounded-lg border border-[#D9D2BD] bg-[#FFFFFF]"
              >
                <Link href={`/place/${p.slug}`} className="w-[120px] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                </Link>
                <div className="w-px bg-[#D9D2BD]" />
                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/place/${p.slug}`}>
                        <h3 className="truncate text-lg font-extrabold text-[#1F2A21] hover:underline">
                          {p.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#2F7D4F]">✓ {t(lang, "download_saved")}</p>
                    </div>
                    <button
                      onClick={() => toggleDownload(p.slug)}
                      className="shrink-0 rounded-lg border border-[#D9D2BD] px-2.5 py-1.5 text-xs font-bold text-[#5D6F61] hover:text-[#E89B93]"
                    >
                      {t(lang, "remove_download")}
                    </button>
                  </div>
                  <p className="text-xs text-[#66766A]">
                    {p.distance} {t(lang, "unit_km")} · ⭐ {p.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
