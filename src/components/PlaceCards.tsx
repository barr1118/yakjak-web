"use client";

import Link from "next/link";
import { useState } from "react";
import type { Place } from "@/lib/types";
import { t, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import LoginDialog from "./LoginDialog";

export function DifficultyBadge({
  difficulty,
  lang,
}: {
  difficulty: Place["difficulty"];
  lang: Lang;
}) {
  const hard = difficulty === "Hard";
  return (
    <span
      className={`rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
        hard ? "bg-[#B42318] text-white" : "bg-[#2F7D4F] text-white"
      }`}
    >
      {t(lang, difficulty).toUpperCase()}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 rounded border border-white/25 bg-black/55 px-2 py-1 text-[10px] font-extrabold text-white backdrop-blur-sm">
      <span className="text-white">★</span> {rating.toFixed(1)}
    </span>
  );
}

export function FavoriteButton({
  placeName,
  isFavorite,
  onToggle,
  onRequireLogin,
  size = "md",
}: {
  placeName: string;
  isFavorite: boolean;
  onToggle: (placeName: string) => void;
  onRequireLogin: () => void;
  size?: "sm" | "md";
}) {
  const { user } = useAuth();
  const cls = size === "sm" ? "h-7 w-7 text-sm" : "h-9 w-9 text-lg";
  return (
    <button
      aria-label={`Favorite ${placeName}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          onRequireLogin();
          return;
        }
        onToggle(placeName);
      }}
      className={`flex ${cls} items-center justify-center rounded-full bg-[#FFFFFF]/60 transition-transform hover:scale-110 ${
        isFavorite ? "text-[#E05F14]" : "text-[#1F2A21]"
      }`}
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}

/** Mirrors FeaturedPlaceCard (horizontal 240px hero card) */
export function FeaturedCard({
  place,
  lang,
  isFavorite,
  onToggle,
  onRequireLogin,
}: {
  place: Place;
  lang: Lang;
  isFavorite: boolean;
  onToggle: (name: string) => void;
  onRequireLogin: () => void;
}) {
  return (
    <Link
      href={`/place/${place.slug}`}
      className="group relative h-80 w-60 shrink-0 overflow-hidden rounded-xl border border-[#D9D2BD] bg-[#FFFFFF] shadow-md sm:h-[320px] sm:w-60"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={place.image}
        alt={place.name}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      <div className="absolute right-2 top-2">
        <FavoriteButton
          placeName={place.name}
          isFavorite={isFavorite}
          onToggle={onToggle}
          onRequireLogin={onRequireLogin}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={place.difficulty} lang={lang} />
          <RatingBadge rating={place.rating} />
        </div>
        <h3 className="mt-2 text-xl font-extrabold text-white">{place.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/80">
          {t(lang, place.descriptionKey)}
        </p>
      </div>
    </Link>
  );
}

/** Mirrors NearbyPlaceCard (horizontal list row) */
export function NearbyCard({
  place,
  lang,
  isFavorite,
  onToggle,
  onRequireLogin,
}: {
  place: Place;
  lang: Lang;
  isFavorite: boolean;
  onToggle: (name: string) => void;
  onRequireLogin: () => void;
}) {
  return (
    <Link
      href={`/place/${place.slug}`}
      className="flex h-[120px] overflow-hidden rounded-xl border border-[#D9D2BD] bg-[#FFFFFF] shadow-sm transition-all hover:border-[#2F7D4F] hover:shadow-md"
    >
      <div className="relative w-[120px] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={place.image}
          alt={place.name}
          draggable={false}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-1 top-1">
          <FavoriteButton
            placeName={place.name}
            isFavorite={isFavorite}
            onToggle={onToggle}
            onRequireLogin={onRequireLogin}
            size="sm"
          />
        </div>
      </div>
      <div className="w-px bg-[#D9D2BD]" />
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-lg font-extrabold text-[#1F2A21]">{place.name}</h3>
            <span className="flex shrink-0 items-center gap-1 rounded border border-[#2F7D4F] bg-[#E2EFE0] px-1.5 py-0.5 text-[10px] font-extrabold text-[#2F7D4F]">
              🗺 {place.distance} {t(lang, "unit_km")}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#66766A]">{t(lang, place.category)}</p>
        </div>
        <div>
          <span className="rounded border border-[#D9D2BD] bg-[#E7E0CC] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#1F2A21]">
            {t(lang, place.difficulty).toUpperCase()}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Wrapper that owns the login dialog for card grids */
export function useLoginGate() {
  const [loginOpen, setLoginOpen] = useState(false);
  const gate = {
    loginOpen,
    requireLogin: () => setLoginOpen(true),
    dialog: <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />,
  };
  return gate;
}
