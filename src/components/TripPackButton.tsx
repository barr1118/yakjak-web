"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useOfflineDownloads } from "@/lib/store";
import { downloadTripPack, removeTripPack } from "@/lib/trip-pack";
import type { Place } from "@/lib/types";

export default function TripPackButton({
  place,
  compact = false,
}: {
  place: Place;
  compact?: boolean;
}) {
  const { lang } = useLanguage();
  const { downloaded } = useOfflineDownloads();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const ready = downloaded.includes(place.slug);

  const start = async () => {
    setError(null);
    try {
      await downloadTripPack(place, (p) =>
        setProgress({ done: p.done, total: p.total }),
      );
    } catch {
      setError("Gagal menyimpan paket. Coba lagi saat online.");
    } finally {
      setProgress(null);
    }
  };

  const remove = async () => {
    setProgress(null);
    await removeTripPack(place);
  };

  const pct =
    progress && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0;

  if (progress) {
    return (
      <div className="w-full rounded-xl border border-[#D5E3CC] bg-[#F1F6EC] px-3 py-2">
        <div className="flex items-center justify-between text-[10px] font-extrabold text-[#14532D]">
          <span>{t(lang, "downloading")}</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#D5E3CC]">
          <div
            className="h-full rounded-full bg-[#1B6B3A] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (ready) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 rounded-xl border border-[#D5E3CC] bg-[#F1F6EC] px-3 py-2">
          <span className="text-sm text-[#14532D]">✓</span>
          <span className="flex-1 text-[11px] font-extrabold text-[#14532D]">
            {t(lang, "pack_ready")}
          </span>
          <button
            onClick={remove}
            className="text-[10px] font-bold text-[#5B6B5F] underline decoration-[#D5E3CC] underline-offset-2 hover:text-[#B42318]"
          >
            {t(lang, "remove_pack")}
          </button>
        </div>
        {error && <p className="mt-1 text-[10px] text-[#B42318]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={start}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#14532D] bg-[#14532D] font-extrabold text-white transition-colors hover:bg-[#1B6B3A] ${
          compact ? "px-3 py-2 text-[10px]" : "px-4 py-3 text-xs"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4"
        >
          <path
            d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t(lang, "download_pack")}
      </button>
      {!compact && (
        <p className="mt-1.5 text-center text-[9px] leading-snug text-[#7C6C58]">
          {t(lang, "pack_size")}
        </p>
      )}
      {error && <p className="mt-1 text-[10px] text-[#B42318]">{error}</p>}
    </div>
  );
}
