"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { usePlaces } from "@/lib/places-context";
import { useFavorites } from "@/lib/store";
import { useDemoState } from "@/lib/demo-store";
import { effectiveProviders } from "@/lib/providers";
import {
  FeaturedCard,
  NearbyCard,
  useLoginGate,
} from "@/components/PlaceCards";
import ProviderCard from "@/components/ProviderCard";

const CATEGORY_FILTERS = [
  "All",
  "Beach",
  "Mountain",
  "Waterfall",
  "Lake",
  "Island",
] as const;

function categoryLabel(cat: string, lang: "id" | "en"): string {
  if (cat === "All") return lang === "id" ? "Semua" : "All";
  return t(lang, cat);
}

export default function ExplorePage() {
  const { lang } = useLanguage();
  const { allPlaces } = usePlaces();
  const { favorites, toggleFavorite } = useFavorites();
  const demoState = useDemoState();
  const gate = useLoginGate();

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const featRef = useRef<HTMLDivElement>(null);

  const providers = effectiveProviders(demoState);
  const verifiedCount = allPlaces.filter((p) => p.verified).length;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPlaces.filter((place) => {
      const matchesSearch =
        q === "" ||
        place.name.toLowerCase().includes(q) ||
        (place.region ?? "").toLowerCase().includes(q) ||
        t(lang, place.descriptionKey).toLowerCase().includes(q) ||
        t(lang, place.category).toLowerCase().includes(q);
      const matchesCategory =
        category === "All" || place.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [allPlaces, searchQuery, category, lang]);

  const featured = filtered.slice(0, 5);
  const rest = filtered;
  const topProviders = providers
    .filter((p) => p.verified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const scrollFeatured = (dir: 1 | -1) => {
    featRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] bg-[#123B26] text-white shadow-[0_18px_50px_-24px_rgba(18,59,38,0.75)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/lhok-mata-ie.jpeg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover saturate-[.9]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,28,21,0.95)_0%,rgba(15,28,21,0.74)_46%,rgba(15,28,21,0.22)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1C15]/70 via-transparent to-transparent" />
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#D5E3CC]">
              <span className="h-px w-8 bg-[#D5E3CC]" />
              {t(lang, "hero_eyebrow")}
            </p>
            <h1 className="mt-4 max-w-xl font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              {lang === "id" ? (
                <>
                  Hidden gems,
                  <br />
                  <span className="text-[#F2C879]">dampak nyata.</span>
                </>
              ) : (
                <>
                  Hidden gems,
                  <br />
                  <span className="text-[#F2C879]">real impact.</span>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              {t(lang, "hero_subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href="#destinasi"
                className="rounded-full bg-[#FAF7EF] px-5 py-3 text-xs font-extrabold text-[#14532D] transition-transform hover:-translate-y-0.5"
              >
                {t(lang, "hero_cta")} ↓
              </a>
              <Link
                href="/providers"
                className="rounded-full border border-white/60 bg-[#0F1C15]/55 px-5 py-3 text-xs font-extrabold text-white backdrop-blur-md transition-colors hover:bg-[#0F1C15]/70"
              >
                {t(lang, "providers_title")}
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-8 sm:[&>*+*]:border-l sm:[&>*+*]:border-white/15 sm:[&>*+*]:pl-6">
              <HeroStat
                value={`${verifiedCount}`}
                label={
                  lang === "id" ? "destinasi terverifikasi" : "verified destinations"
                }
              />
              <HeroStat value={`${providers.length}`} label={t(lang, "providers_title")} />
              <HeroStat
                value="100%"
                label={lang === "id" ? "milik warga" : "community-owned"}
              />
            </div>
          </div>

          <div className="hidden items-end justify-end lg:flex">
            <div className="w-full max-w-xs rounded-2xl border border-white/20 bg-[#0F1C15]/35 p-4 backdrop-blur-md">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#D5E3CC]">
                {lang === "id" ? "Standar YakJak" : "The YakJak standard"}
              </p>
              <ul className="mt-3 space-y-2.5 text-[11px] leading-snug text-white/85">
                <li className="flex gap-2">
                  <span className="text-[#F0D9A8]">✓</span>
                  {lang === "id"
                    ? "Titik jalur dicek tim lapangan"
                    : "Route points checked by the field team"}
                </li>
                <li className="flex gap-2">
                  <span className="text-[#F0D9A8]">✓</span>
                  {lang === "id"
                    ? "Penyedia lokal terverifikasi"
                    : "Verified local providers"}
                </li>
                <li className="flex gap-2">
                  <span className="text-[#F0D9A8]">✓</span>
                  {lang === "id"
                    ? "Izin & aturan adat ditulis jelas"
                    : "Permits and adat rules stated clearly"}
                </li>
              </ul>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#0F1C15]/40 px-3 py-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/60">
                  {lang === "id" ? "Mitra adat" : "Adat partner"}
                </span>
                <span className="text-[10px] font-extrabold text-[#F0D9A8]">
                  Panglima Laot
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinasi" className="mt-10 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#C2410C]">
              {t(lang, "curated_title")}
            </p>
            <h2 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-[#17251C]">
              {lang === "id" ? "Rute yang sudah dicek" : "Routes we have checked"}
            </h2>
            <p className="mt-1 text-sm text-[#5B6B5F]">
              {t(lang, "curated_sub")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/map"
              className="rounded-full border border-[#E5DDCB] bg-white px-4 py-2 text-[10px] font-extrabold text-[#14532D] hover:border-[#1B6B3A]"
            >
              🗺 {lang === "id" ? "Peta" : "Map"}
            </Link>
            <div className="hidden gap-2 md:flex">
              <button
                onClick={() => scrollFeatured(-1)}
                aria-label="Previous"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DDCB] bg-white text-lg text-[#17251C] transition-colors hover:border-[#1B6B3A]"
              >
                ‹
              </button>
              <button
                onClick={() => scrollFeatured(1)}
                aria-label="Next"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DDCB] bg-white text-lg text-[#17251C] transition-colors hover:border-[#1B6B3A]"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Search + category */}
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-[#E5DDCB] bg-white px-4 shadow-sm">
            <span className="text-sm text-[#5B6B5F]">⌕</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === "id"
                  ? "Cari destinasi, daerah, atau kategori…"
                  : "Search destinations, regions, or categories…"
              }
              className="w-full bg-transparent text-sm text-[#17251C] placeholder-[#7C6C58] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-[#7C6C58] hover:text-[#17251C]"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] transition-colors ${
                  category === c
                    ? "border-[#14532D] bg-[#14532D] text-white"
                    : "border-[#E5DDCB] bg-white text-[#5B6B5F] hover:border-[#1B6B3A]/50"
                }`}
              >
                {categoryLabel(c, lang)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#E5DDCB] bg-white p-10 text-center">
            <p className="text-sm text-[#5B6B5F]">{t(lang, "no_results")}</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCategory("All");
              }}
              className="mt-3 rounded-full bg-[#14532D] px-4 py-2 text-xs font-extrabold text-white"
            >
              {t(lang, "reset_filters")}
            </button>
          </div>
        ) : (
          <>
            <div
              ref={featRef}
              className="mt-5 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {featured.map((p) => (
                <div key={`featured-${p.slug}`} className="snap-start">
                  <FeaturedCard
                    place={p}
                    lang={lang}
                    isFavorite={favorites.has(p.name)}
                    onToggle={(name) => toggleFavorite(name, favorites.has(name))}
                    onRequireLogin={gate.requireLogin}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {rest.map((p) => (
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
          </>
        )}
      </section>

      {/* Providers */}
      <section className="mt-12 rounded-[28px] bg-[#F1F6EC] p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#14532D]">
              {lang === "id" ? "Ekonomi lokal" : "Local economy"}
            </p>
            <h2 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-[#17251C]">
              {t(lang, "providers_title")}
            </h2>
            <p className="mt-1 max-w-lg text-sm text-[#5B6B5F]">
              {t(lang, "providers_subtitle")}
            </p>
          </div>
          <Link
            href="/providers"
            className="rounded-full border border-[#14532D]/20 bg-white px-4 py-2 text-xs font-extrabold text-[#14532D] hover:border-[#14532D]"
          >
            {lang === "id" ? "Lihat semua" : "View all"} →
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topProviders.map((p) => (
            <ProviderCard key={p.id} provider={p} lang={lang} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="cara" className="mt-12 scroll-mt-24">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#C2410C]">
          {lang === "id" ? "Cara kerja" : "How it works"}
        </p>
        <h2 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-[#17251C]">
          {lang === "id"
            ? "Dari layar ke jalur, tanpa ribet"
            : "From screen to trail, without the guesswork"}
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              n: "01",
              title: lang === "id" ? "Pilih rute" : "Pick a route",
              body:
                lang === "id"
                  ? "Lihat tingkat kesulitan, musim terbaik, dan status verifikasi sebelum berangkat."
                  : "Check difficulty, best season, and verification status before you go.",
            },
            {
              n: "02",
              title: lang === "id" ? "Pesan penyedia" : "Book a local",
              body:
                lang === "id"
                  ? "Ajukan permintaan ke pemandu, homestay, atau perahu. Bayar langsung ke penyedia."
                  : "Request a guide, homestay, or boat. Pay the provider directly.",
            },
            {
              n: "03",
              title: lang === "id" ? "Bawa offline" : "Go offline",
              body:
                lang === "id"
                  ? "Unduh Trip Pack: rute, kontak darurat, aturan adat, dan potongan peta."
                  : "Download a Trip Pack: route, emergency contacts, adat rules, and a map block.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-[#E5DDCB] bg-white p-5"
            >
              <span className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#D8C7A0]">
                {s.n}
              </span>
              <h3 className="mt-2 text-sm font-extrabold text-[#17251C]">
                {s.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#5B6B5F]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {gate.dialog}
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-white">
        {value}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">
        {label}
      </div>
    </div>
  );
}
