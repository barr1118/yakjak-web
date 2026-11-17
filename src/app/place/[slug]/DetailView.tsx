"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Place } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { usePlaces } from "@/lib/places-context";
import { findBySlug } from "@/lib/places";
import { useFavorites } from "@/lib/store";
import { useDemoState } from "@/lib/demo-store";
import { providersForPlace } from "@/lib/providers";
import { DifficultyBadge, VerifiedBadge } from "@/components/PlaceCards";
import LoginDialog from "@/components/LoginDialog";
import Reviews from "@/components/Reviews";
import TrailReports from "@/components/TrailReports";
import TripPackButton from "@/components/TripPackButton";
import WeatherCard from "@/components/WeatherCard";
import ProviderCard from "@/components/ProviderCard";
import { useAuth } from "@/lib/auth";

const TrekMap = dynamic(() => import("@/components/TrekMap"), { ssr: false });

function formatEstTime(lang: "en" | "id", est: string): string {
  return est
    .replaceAll("hrs", t(lang, "unit_hrs"))
    .replaceAll("min", t(lang, "unit_min"));
}

export default function DetailView({ place }: { place: Place }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const { allPlaces } = usePlaces();
  const live = findBySlug(allPlaces, place.slug) ?? place;
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const demoState = useDemoState();
  const [loginOpen, setLoginOpen] = useState(false);

  const isFavorite = favorites.has(live.name);
  const providers = providersForPlace(live.slug, demoState);

  const handleFavorite = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    await toggleFavorite(live.name, isFavorite);
  };

  const handleStart = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    router.push(`/expedition/${live.slug}`);
  };

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6">
      {/* Hero */}
      <div className="relative h-[500px] sm:h-[540px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={live.image}
          alt={live.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1C15] via-[#0F1C15]/45 to-[#0F1C15]/10" />

        <div className="absolute left-4 top-4 flex gap-2 sm:left-6">
          <Link
            href="/"
            aria-label={t(lang, "back")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-xl text-white backdrop-blur hover:bg-black/55"
          >
            ←
          </Link>
        </div>
        <div className="absolute right-4 top-4 flex gap-2 sm:right-6">
          <button
            onClick={handleFavorite}
            aria-label="Favorite"
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-xl backdrop-blur hover:bg-black/55 ${
              isFavorite ? "text-[#F08A6A]" : "text-white"
            }`}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <VerifiedBadge verified={live.verified} lang={lang} />
            <DifficultyBadge difficulty={live.difficulty} lang={lang} />
            <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/80 backdrop-blur">
              {t(lang, live.category)}
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-[1.02] text-white sm:text-6xl">
            {live.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-white/80">
            <span>
              {live.region ?? "Aceh"} · {t(lang, "best_season")}{" "}
              {live.bestSeason ?? "—"}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[#F0D9A8]">★</span> {live.rating.toFixed(1)}
            </span>
            <span>
              {live.distance} {t(lang, "unit_km")} ·{" "}
              {formatEstTime(lang, live.estTime)}
            </span>
            <span>
              ↑ {live.elevationGain} {t(lang, "unit_m")}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Main column */}
        <div>
          <SectionTitle
            eyebrow={lang === "id" ? "Tentang rute" : "About the route"}
            title={t(lang, "trail_overview")}
          />
          <p className="mt-3 text-sm leading-relaxed text-[#4F5F54]">
            {t(lang, live.descriptionKey)}
          </p>
          {live.imageCredit && (
            <p className="mt-2 text-[10px] leading-relaxed text-[#7C6C58]">
              Foto: {live.imageCredit}
              {live.imageLicense ? ` · ${live.imageLicense}` : ""}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label={t(lang, "stat_distance")} value={`${live.distance} km`} />
            <Fact label={t(lang, "stat_time")} value={formatEstTime(lang, live.estTime)} />
            <Fact
              label={t(lang, "stat_elevation")}
              value={`${live.elevationGain} m`}
            />
            <Fact label={t(lang, "stat_type")} value={t(lang, live.category)} />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5DDCB]">
            <TrekMap
              places={[live]}
              center={[live.lat, live.lng]}
              zoom={13}
              height={300}
              activeSlug={live.slug}
            />
          </div>

          <div className="mt-8">
            <SectionTitle
              eyebrow={lang === "id" ? "Cuaca" : "Weather"}
              title={t(lang, "weather_title")}
            />
            <div className="mt-3">
              <WeatherCard lat={live.lat} lng={live.lng} lang={lang} />
            </div>
          </div>

          {live.adat && (
            <div className="mt-8 rounded-2xl border border-[#EBD3B4] bg-[#FDF8EF] p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5E2D5] text-sm text-[#C2410C]">
                  ⚑
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-[#17251C]">
                    {t(lang, "adat_title")}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C2410C]">
                    {live.adat.authority}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                    live.adat.permitRequired
                      ? "bg-[#F5E2D5] text-[#C2410C]"
                      : "bg-[#E8F0E4] text-[#14532D]"
                  }`}
                >
                  {live.adat.permitRequired
                    ? t(lang, "permit_required")
                    : t(lang, "permit_not_required")}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#5B6B5F]">
                  {t(lang, "adat_calendar")}: {live.adat.calendarNote}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {live.adat.rules.map((r) => (
                  <li
                    key={r}
                    className="flex gap-2 text-[11px] leading-relaxed text-[#4F5F54]"
                  >
                    <span className="text-[#C2410C]">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {live.safety && (
            <div className="mt-6 rounded-2xl border border-[#E5DDCB] bg-white p-5">
              <h2 className="text-sm font-extrabold text-[#17251C]">
                {t(lang, "safety_title")}
              </h2>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7C6C58]">
                    {t(lang, "safety_signal")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#4F5F54]">
                    {live.safety.signal}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7C6C58]">
                    {t(lang, "safety_contacts")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#4F5F54]">
                    {live.safety.contacts
                      .map((c) => `${c.label}: ${c.phone}`)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {live.safety.hazards.map((h) => (
                  <li
                    key={h}
                    className="rounded-full bg-[#F7D7D3]/60 px-2.5 py-1 text-[10px] font-bold text-[#B42318]"
                  >
                    ! {h}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[9px] italic text-[#7C6C58]">
                {t(lang, "safety_disclaimer")}
              </p>
            </div>
          )}

          {/* Providers */}
          <div className="mt-8">
            <SectionTitle
              eyebrow={lang === "id" ? "Dari warga" : "From the community"}
              title={t(lang, "providers_title")}
            />
            {providers.length > 0 ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-[#E5DDCB] bg-white p-5 text-center">
                <p className="text-xs text-[#5B6B5F]">
                  {lang === "id"
                    ? "Belum ada penyedia terverifikasi di rute ini."
                    : "No verified providers on this route yet."}
                </p>
                <Link
                  href="/providers"
                  className="mt-3 inline-block rounded-full bg-[#14532D] px-4 py-2 text-[10px] font-extrabold text-white"
                >
                  {t(lang, "become_provider")}
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8">
            <TrailReports placeSlug={live.slug} />
          </div>

          <div className="mt-8">
            <Reviews placeSlug={live.slug} lang={lang} />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[#E5DDCB] bg-white p-5 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#C2410C]">
              {t(lang, "download_pack")}
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#17251C]">
              {lang === "id" ? "Bawa rute ini offline" : "Take this route offline"}
            </h2>
            <div className="mt-4">
              <TripPackButton place={live} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#F1EADD] pt-3 text-[10px] text-[#5B6B5F]">
              <div>
                <span className="block font-extrabold text-[#17251C]">
                  {live.lastFieldCheck ?? "—"}
                </span>
                {lang === "id" ? "Cek terakhir" : "Last field check"}
              </div>
              <div>
                <span className="block font-extrabold text-[#17251C]">
                  {live.verified ? t(lang, "verified") : t(lang, "data_awal")}
                </span>
                {lang === "id" ? "Status data" : "Data status"}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#E5DDCB] bg-[#F3EEE2] p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#5B6B5F]">
              {lang === "id" ? "Rencana perjalanan" : "Trip plan"}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#5B6B5F]">{t(lang, "stat_distance")}</span>
              <span className="font-extrabold text-[#17251C]">
                {live.distance} km
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#5B6B5F]">{t(lang, "stat_time")}</span>
              <span className="font-extrabold text-[#17251C]">
                {formatEstTime(lang, live.estTime)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[#5B6B5F]">{t(lang, "need_guide")}</span>
              <span className="font-extrabold text-[#17251C]">
                {live.difficulty === "Easy" ? "—" : "✓"}
              </span>
            </div>
            <button
              onClick={handleStart}
              className="mt-4 w-full rounded-xl bg-[#14532D] py-3 text-xs font-extrabold text-white hover:bg-[#1B6B3A]"
            >
              {t(lang, "start_expedition")} →
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom action bar */}
      <div className="sticky bottom-[57px] z-30 border-t border-[#E5DDCB] bg-[#FCFAF5]/95 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="hidden sm:block">
            <div className="text-base font-extrabold text-[#17251C]">
              ★ {live.rating.toFixed(1)}
            </div>
            <div className="text-[10px] text-[#5B6B5F]">{t(lang, "rating")}</div>
          </div>
          <div className="flex-1">
            <TripPackButton place={live} compact />
          </div>
          <button
            onClick={handleStart}
            className="flex-1 rounded-xl bg-[#14532D] py-3 text-xs font-extrabold text-white hover:bg-[#1B6B3A]"
          >
            {t(lang, "start_expedition")}
          </button>
        </div>
      </div>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C2410C]">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold tracking-tight text-[#17251C]">
        {title}
      </h2>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5DDCB] bg-white px-3 py-3">
      <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7C6C58]">
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-[#17251C]">{value}</div>
    </div>
  );
}
