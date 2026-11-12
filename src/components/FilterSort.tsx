"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

/** Mirrors FilterBottomSheet */
export function FilterDialog({
  open,
  lang,
  initialDifficulty,
  initialRating,
  onApply,
  onClose,
}: {
  open: boolean;
  lang: Lang;
  initialDifficulty: string | null;
  initialRating: number | null;
  onApply: (difficulty: string | null, minRating: number | null) => void;
  onClose: () => void;
}) {
  const [tempDiff, setTempDiff] = useState<string | null>(initialDifficulty);
  const [tempRating, setTempRating] = useState<number | null>(initialRating);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl bg-[#FFFFFF] p-6 sm:rounded-2xl">
        <h2 className="text-xl font-extrabold text-[#1F2A21]">{t(lang, "filter")}</h2>

        <p className="mt-6 text-sm text-[#5D6F61]">{t(lang, "difficulty")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Easy", "Moderate", "Hard"].map((d) => {
            const selected = tempDiff === d;
            return (
              <button
                key={d}
                onClick={() => setTempDiff(selected ? null : d)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                  selected
                    ? "bg-[#2F7D4F] text-[#FFFFFF]"
                    : "bg-[#E7E0CC] text-[#1F2A21]"
                }`}
              >
                {t(lang, d)}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-[#5D6F61]">{t(lang, "rating_min")}</p>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={tempRating ?? 1}
            onChange={(e) => setTempRating(parseFloat(e.target.value))}
            className="w-full accent-[#E05F14]"
          />
          <span className="w-10 text-right text-sm font-extrabold text-[#E05F14]">
            {(tempRating ?? 1).toFixed(1)}
          </span>
        </div>

        <div className="mt-6 flex gap-4 pb-2">
          <button
            onClick={() => {
              onApply(null, null);
              onClose();
            }}
            className="flex-1 rounded-lg border border-[#D9D2BD] py-3 font-bold text-[#1F2A21]"
          >
            {t(lang, "clear")}
          </button>
          <button
            onClick={() => {
              onApply(tempDiff, tempRating);
              onClose();
            }}
            className="flex-1 rounded-lg bg-[#2F7D4F] py-3 font-extrabold text-[#FFFFFF]"
          >
            {t(lang, "apply")}
          </button>
        </div>
      </div>
    </div>
  );
}

export type SortKey = "none" | "rating_asc" | "rating_desc" | "diff_asc" | "diff_desc";

/** Mirrors SortBottomSheet */
export function SortDialog({
  open,
  lang,
  initialSort,
  onApply,
  onClose,
}: {
  open: boolean;
  lang: Lang;
  initialSort: SortKey;
  onApply: (sort: SortKey) => void;
  onClose: () => void;
}) {
  const [temp, setTemp] = useState<SortKey>(initialSort);

  if (!open) return null;

  const options: { value: SortKey; label: string }[] = [
    { value: "none", label: "Default" },
    { value: "rating_desc", label: t(lang, "sort_rating_desc") },
    { value: "rating_asc", label: t(lang, "sort_rating_asc") },
    { value: "diff_asc", label: t(lang, "sort_diff_asc") },
    { value: "diff_desc", label: t(lang, "sort_diff_desc") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl bg-[#FFFFFF] p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1F2A21]">{t(lang, "sort_by")}</h2>
          <button onClick={onClose} className="text-[#5D6F61] hover:text-[#1F2A21]">
            ✕
          </button>
        </div>
        <div className="mt-4">
          {options.map((o) => (
            <label
              key={o.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 ${
                temp === o.value ? "font-extrabold text-[#E05F14]" : "text-[#1F2A21]"
              }`}
            >
              <input
                type="radio"
                name="sort"
                checked={temp === o.value}
                onChange={() => setTemp(o.value)}
                className="accent-[#E05F14]"
              />
              {o.label}
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-4 pb-2">
          <button
            onClick={() => {
              onApply("none");
              onClose();
            }}
            className="flex-1 rounded-lg border border-[#D9D2BD] py-3 font-bold text-[#1F2A21]"
          >
            {t(lang, "clear")}
          </button>
          <button
            onClick={() => {
              onApply(temp);
              onClose();
            }}
            className="flex-1 rounded-lg bg-[#E05F14] py-3 font-extrabold text-white"
          >
            {t(lang, "apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
