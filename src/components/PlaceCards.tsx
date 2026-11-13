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
  const tone =
    difficulty === "Hard"
      ? "bg-[#B42318] text-white"
      : difficulty === "Moderate"
        ? "bg-[#B54708] text-white"
        : "bg-[#1F4D3A] text-white";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${tone}`}
    >
      {t(lang, difficulty).toUpperCase()}
    </span>
  );
}

export function VerifiedBadge({
  verified,
  lang,
  compact = false,
}: {
  verified?: boolean;
  lang: Lang;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] backdrop-blur-sm ${
        verified
          ? "border-white/30 bg-[#1F4D3A]/85 text-white"
          : "border-[#B54708]/30 bg-[#FDF0E3]/95 text-[#B54708]"
      }`}
    >
      <span className="text-[10px]">{verified ? "✓" : "•"}</span>
      {compact
        ? verified
          ? t(lang, "verified")
          : t(lang, "data_awal")
        : verified
          ? t(lang, "verified")
          : t(lang, "unverified")}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-white/25 bg-black/45 px-2 py-1 text-[10px] font-extrabold text-white backdrop-blur-sm">
      <span className="text-[#F7D27A]">★</span> {rating.toFixed(1)}
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
      className={`flex ${cls} items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur transition-transform hover:scale-110 ${
        isFavorite ? "text-[#C2410C]" : "text-[#1F2A21]"
      }`}
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}

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
      className="group relative block h-[360px] w-[270px] shrink-0 overflow-hidden rounded-3xl border border-[#DED7C4] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-[390px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={place.image}
        alt={place.name}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F17]/90 via-[#0B1F17]/25 to-transparent" />
      <div className="absolute left-3 top-3">
        <VerifiedBadge verified={place.verified} lang={lang} compact />
      </div>
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        <RatingBadge rating={place.rating} />
        <FavoriteButton
          placeName={place.name}
          isFavorite={isFavorite}
          onToggle={onToggle}
          onRequireLogin={onRequireLogin}
          size="sm"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/70">
          <span>{t(lang, place.category)}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-white/50" />
          <span>{place.region}</span>
        </div>
        <h3 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-[26px] font-semibold leading-tight text-white">
          {place.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/75">
          {t(lang, place.descriptionKey)}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-white/15 pt-2.5 text-[10px] font-bold text-white/80">
          <DifficultyBadge difficulty={place.difficulty} lang={lang} />
          <span>{place.distance} km</span>
          <span>{place.estTime}</span>
        </div>
      </div>
    </Link>
  );
}

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
      className="group flex overflow-hidden rounded-2xl border border-[#DED7C4] bg-white shadow-sm transition-all hover:border-[#2F7D4F]/50 hover:shadow-md"
    >
      <div className="relative w-[132px] shrink-0 sm:w-[150px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={place.image}
          alt={place.name}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2">
          <VerifiedBadge verified={place.verified} lang={lang} compact />
        </div>
        <div className="absolute bottom-2 left-2">
          <FavoriteButton
            placeName={place.name}
            isFavorite={isFavorite}
            onToggle={onToggle}
            onRequireLogin={onRequireLogin}
            size="sm"
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-[family-name:var(--font-fraunces)] text-lg font-semibold text-[#1F2A21]">
              {place.name}
            </h3>
            <span className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold text-[#5D6F61]">
              <span className="text-[#F0A11A]">★</span>
              {place.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-[#5D6F61]">
            {place.region} · {t(lang, place.category)}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <DifficultyBadge difficulty={place.difficulty} lang={lang} />
          <span className="rounded-full bg-[#F1EBDA] px-2 py-1 text-[9px] font-bold text-[#5D6F61]">
            {place.distance} km · {place.estTime}
          </span>
          {place.adat?.permitRequired && (
            <span className="rounded-full border border-[#E7C9A0] bg-[#FDF0E3] px-2 py-1 text-[9px] font-bold text-[#B54708]">
              {t(lang, "permit_required")}
            </span>
          )}
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
