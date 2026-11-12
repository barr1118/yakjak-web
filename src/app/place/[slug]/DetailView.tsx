"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Place } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { usePlaces } from "@/lib/places-context";
import { findBySlug } from "@/lib/places";
import { addHistory, subscribeHistory } from "@/lib/history";
import { useFavorites, useOfflineDownloads } from "@/lib/store";
import { DifficultyBadge } from "@/components/PlaceCards";
import LoginDialog from "@/components/LoginDialog";
import Reveal from "@/components/Reveal";
import Reviews from "@/components/Reviews";
import WeatherCard from "@/components/WeatherCard";
import { useAuth } from "@/lib/auth";

const TrekMap = dynamic(() => import("@/components/TrekMap"), { ssr: false });

function formatEstTime(lang: "en" | "id", est: string): string {
  return est
    .replaceAll("hrs", t(lang, "unit_hrs"))
    .replaceAll("min", t(lang, "unit_min"));
}

/** Mirrors yakjak_app/lib/screens/detail_page.dart */
export default function DetailView({ place }: { place: Place }) {
  const { lang } = useLanguage();
  const { allPlaces } = usePlaces();
  // Live Firestore data when available, local SSG snapshot as fallback.
  const live = findBySlug(allPlaces, place.slug) ?? place;
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { downloaded, toggleDownload } = useOfflineDownloads();
  const [loginOpen, setLoginOpen] = useState(false);
  const [doneSlugs, setDoneSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeHistory(user.uid, (entries) => {
      setDoneSlugs(new Set(entries.map((e) => e.placeSlug)));
    });
    return () => {
      unsub();
      setDoneSlugs(new Set());
    };
  }, [user]);

  const isFavorite = favorites.has(live.name);
  const isDownloaded = downloaded.includes(live.slug);
  const isDone = doneSlugs.has(live.slug);

  const handleFavorite = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    await toggleFavorite(live.name, isFavorite);
  };

  const handleDone = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!isDone) {
      await addHistory(user.uid, { placeSlug: live.slug, placeName: live.name });
    }
  };

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6">
      {/* Hero */}
      <div className="relative h-[420px] sm:h-[450px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={live.image}
          alt={live.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

        <div className="absolute left-4 top-4 flex gap-2 sm:left-6">
          <Link
            href="/"
            aria-label={t(lang, "back")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl text-white"
          >
            ←
          </Link>
        </div>
        <div className="absolute right-4 top-4 flex gap-2 sm:right-6">
          <button
            onClick={handleDone}
            aria-label={isDone ? t(lang, "history_done") : t(lang, "mark_done")}
            title={isDone ? t(lang, "history_done") : t(lang, "mark_done")}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${
              isDone ? "bg-[#2F7D4F] text-white" : "bg-black/40 text-white"
            }`}
          >
            {isDone ? "✓" : "⛰"}
          </button>
          <button
            onClick={handleFavorite}
            aria-label="Favorite"
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl ${
              isFavorite ? "text-[#E05F14]" : "text-white"
            }`}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:px-8">
          <DifficultyBadge difficulty={live.difficulty} lang={lang} />
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white">
            {live.name}
          </h1>
          <p className="mt-2 flex items-center gap-1 text-sm font-bold text-white/85">
            <span className="text-[#E05F14]">📍</span> {live.lat}, {live.lng}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        {/* Download for offline (PRD 4.2) */}
        <button
          onClick={() => toggleDownload(live.slug)}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-extrabold transition-colors ${
            isDownloaded
              ? "bg-[#E7E0CC] text-[#2F7D4F] ring-1 ring-[#2F7D4F]"
              : "bg-[#2F7D4F] text-[#FFFFFF]"
          }`}
        >
          {isDownloaded ? `✓ ${t(lang, "download_saved")}` : `⬇ ${t(lang, "download_offline")}`}
        </button>

        {/* Bento stats */}
        <Reveal>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Stat label={t(lang, "stat_distance")} value={`${live.distance} ${t(lang, "unit_km")}`} icon="🗺" />
            <Stat label={t(lang, "stat_time")} value={formatEstTime(lang, live.estTime)} icon="⏱" />
            <Stat label={t(lang, "stat_elevation")} value={`${live.elevationGain} ${t(lang, "unit_m")}`} icon="📈" />
            <Stat label={t(lang, "stat_type")} value={t(lang, live.category)} icon="🏷" />
          </div>
        </Reveal>

        {/* Weather */}
        <Reveal>
          <h2 className="mt-10 text-xl font-extrabold tracking-tight">{t(lang, "weather_title")}</h2>
          <div className="mt-4">
            <WeatherCard lat={live.lat} lng={live.lng} lang={lang} />
          </div>
        </Reveal>

        {/* Trail overview */}
        <Reveal>
          <h2 className="mt-10 text-xl font-extrabold tracking-tight">{t(lang, "trail_overview")}</h2>
          <p className="mt-3 leading-relaxed text-[#5D6F61]">
            {t(lang, live.descriptionKey)}
          </p>
        </Reveal>

        {/* Map preview */}
        <Reveal>
          <h2 className="mt-10 text-xl font-extrabold tracking-tight">{t(lang, "preview_trek")}</h2>
          <div className="mt-4">
            <TrekMap
              places={[live]}
              center={[live.lat, live.lng]}
              zoom={13}
              height={250}
              activeSlug={live.slug}
            />
          </div>
        </Reveal>

        {/* Community reviews */}
        <Reveal>
          <div className="mt-10">
            <Reviews placeSlug={live.slug} lang={lang} />
          </div>
        </Reveal>
      </div>

      {/* Bottom action bar */}
      <div className="sticky bottom-[57px] border-t border-[#D9D2BD] bg-[#F1EBDA] md:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4">
          <div>
            <div className="text-lg font-extrabold">⭐ {live.rating.toFixed(1)}</div>
            <div className="text-xs text-[#5D6F61]">{t(lang, "rating")}</div>
          </div>
          <Link
            href={`/expedition/${live.slug}`}
            className="flex-1 rounded-2xl bg-[#E05F14] py-4 text-center font-extrabold text-white transition-colors hover:bg-[#B54F0E]"
          >
            {t(lang, "Start Expedition")}
          </Link>
        </div>
      </div>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-[#D9D2BD] bg-[#FFFFFF] px-3 py-4 text-center shadow-sm">
      <div className="flex items-center justify-center gap-1.5 text-xs text-[#5D6F61]">
        <span>{icon}</span> {label}
      </div>
      <div className="mt-2 text-base font-extrabold text-[#1F2A21]">{value}</div>
    </div>
  );
}
