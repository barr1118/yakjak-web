"use client";

import { useMemo, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { usePlaces } from "@/lib/places-context";
import { useFavorites } from "@/lib/store";
import { FeaturedCard, NearbyCard, useLoginGate } from "@/components/PlaceCards";
import { FilterDialog, SortDialog, type SortKey } from "@/components/FilterSort";
import Scroller from "@/components/Scroller";
import Reveal from "@/components/Reveal";

const CATEGORIES = [
  { key: "Beaches", labelKey: "filter_beaches", icon: "🏖" },
  { key: "Mountains", labelKey: "filter_mountains", icon: "⛰" },
  { key: "Waterfalls", labelKey: "filter_waterfalls", icon: "💧" },
];

function matchesCategory(place: Place, filter: string): boolean {
  const c = place.category.toLowerCase();
  if (filter === "Beaches") return c.includes("coastal") || c.includes("beach");
  if (filter === "Mountains") return c.includes("mountain") || c.includes("hill");
  if (filter === "Waterfalls") return c.includes("waterfall") || c.includes("air terjun");
  return false;
}

function diffRank(d: string): number {
  return d === "Easy" ? 1 : d === "Moderate" ? 2 : 3;
}

/** Mirrors yakjak_app/lib/screens/home_page.dart */
export default function ExplorePage() {
  const { lang } = useLanguage();
  const { allPlaces } = usePlaces();
  const { favorites, toggleFavorite } = useFavorites();
  const gate = useLoginGate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("none");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const featRef = useRef<HTMLDivElement>(null);

  const scrollFeatured = (dir: 1 | -1) => {
    featRef.current?.scrollBy({ left: dir * 264, behavior: "smooth" });
  };

  const isActive =
    searchQuery !== "" ||
    selectedFilters.size > 0 ||
    selectedDifficulty !== null ||
    minRating !== null;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const list = allPlaces.filter((place) => {
      const matchesSearch =
        place.name.toLowerCase().includes(q) ||
        t(lang, place.descriptionKey).toLowerCase().includes(q) ||
        place.category.toLowerCase().includes(q);

      let matchesFilter = true;
      if (selectedFilters.size > 0) {
        matchesFilter = [...selectedFilters].some((f) => matchesCategory(place, f));
      }

      const matchesDifficulty =
        !selectedDifficulty || place.difficulty === selectedDifficulty;
      const matchesRating = minRating == null || place.rating >= minRating;

      return matchesSearch && matchesFilter && matchesDifficulty && matchesRating;
    });

    switch (sortBy) {
      case "rating_asc":
        list.sort((a, b) => a.rating - b.rating);
        break;
      case "rating_desc":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "diff_asc":
        list.sort((a, b) => diffRank(a.difficulty) - diffRank(b.difficulty));
        break;
      case "diff_desc":
        list.sort((a, b) => diffRank(b.difficulty) - diffRank(a.difficulty));
        break;
    }
    return list;
  }, [searchQuery, selectedFilters, selectedDifficulty, minRating, sortBy, lang, allPlaces]);

  const toggleCategory = (key: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filterActive = selectedDifficulty !== null || minRating !== null;
  const sortActive = sortBy !== "none";

  return (
    <div>
      {/* Search + sort + filter row */}
      <div className="flex gap-3">
        <div className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-[#D9D2BD] bg-[#FFFFFF] px-4 shadow-sm">
          <span className="text-[#5D6F61]">🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(lang, "search_hint")}
            className="w-full bg-transparent caret-[#2F7D4F] text-[#1F2A21] placeholder-[#5D6F61] outline-none focus-visible:outline-none"
          />
        </div>
        <button
          onClick={() => setSortOpen(true)}
          aria-label="Sort"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded border border-[#D9D2BD] text-xl ${
            sortActive ? "bg-[#E05F14] text-white" : "bg-[#E7E0CC] text-[#1F2A21]"
          }`}
        >
          ⇅
        </button>
        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Filter"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded border border-[#D9D2BD] text-xl ${
            filterActive ? "bg-[#E05F14] text-white" : "bg-[#E7E0CC] text-[#1F2A21]"
          }`}
        >
          🎚
        </button>
      </div>

      {/* Category chips — swipe / drag to scroll, no scrollbar */}
      <Scroller className="mt-4 flex gap-3 pb-1">
        {CATEGORIES.map((c) => {
          const selected = selectedFilters.has(c.key);
          return (
            <button
              key={c.key}
              onClick={() => toggleCategory(c.key)}
              aria-pressed={selected}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-xs font-extrabold tracking-widest transition-colors ${
                selected
                  ? "border-[#2F7D4F] bg-[#2F7D4F] text-[#FFFFFF]"
                  : "border-[#D9D2BD] bg-[#E7E0CC] text-[#1F2A21] hover:border-[#2F7D4F]/60"
              }`}
            >
              <span className={selected ? "" : "text-[#2F7D4F]"}>{c.icon}</span>
              {t(lang, c.labelKey)}
            </button>
          );
        })}
      </Scroller>

      {/* Active filter chips */}
      {filterActive && (
        <div className="mt-4 flex flex-wrap gap-2">
          {minRating != null && (
            <ActiveChip
              label={`⭐ ${minRating.toFixed(1)}+`}
              onRemove={() => setMinRating(null)}
            />
          )}
          {selectedDifficulty != null && (
            <ActiveChip
              label={`${t(lang, "difficulty")}: ${t(lang, selectedDifficulty)}`}
              onRemove={() => setSelectedDifficulty(null)}
            />
          )}
        </div>
      )}

      {/* Featured */}
      <section className="mt-8" aria-label={t(lang, "featured_gems")}>
        {!isActive ? (
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold tracking-tight">
                {t(lang, "featured_gems")}
              </h2>
              {/* Desktop arrows — discoverability aid next to the hidden scrollbar */}
              <div className="hidden shrink-0 gap-2 md:flex">
                <button
                  onClick={() => scrollFeatured(-1)}
                  aria-label="Previous"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D9D2BD] bg-[#E7E0CC] text-lg text-[#1F2A21] transition-colors hover:border-[#2F7D4F] hover:text-[#2F7D4F]"
                >
                  ‹
                </button>
                <button
                  onClick={() => scrollFeatured(1)}
                  aria-label="Next"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D9D2BD] bg-[#E7E0CC] text-lg text-[#1F2A21] transition-colors hover:border-[#2F7D4F] hover:text-[#2F7D4F]"
                >
                  ›
                </button>
              </div>
            </div>
          </Reveal>
        ) : (
          <p className="text-sm text-[#5D6F61]" role="status">
            {filtered.length} {t(lang, "results")}
          </p>
        )}
        <Scroller ref={featRef} className="mt-4 flex gap-4 pb-2">
          {filtered.map((p) => (
            <FeaturedCard
              key={p.slug}
              place={p}
              lang={lang}
              isFavorite={favorites.has(p.name)}
              onToggle={(name) =>
                toggleFavorite(name, favorites.has(name))
              }
              onRequireLogin={gate.requireLogin}
            />
          ))}
        </Scroller>
      </section>

      {/* Nearby */}
      <section className="mt-8" aria-label={t(lang, "nearby_expeditions")}>
        {!isActive && (
          <Reveal>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {t(lang, "nearby_expeditions")}
            </h2>
          </Reveal>
        )}
        {filtered.length === 0 ? (
          <EmptyState
            onReset={() => {
              setSearchQuery("");
              setSelectedFilters(new Set());
              setSelectedDifficulty(null);
              setMinRating(null);
              setSortBy("none");
            }}
          />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((p, i) => (
              <Reveal key={p.slug} delay={Math.min(i, 5) * 60}>
                <NearbyCard
                  place={p}
                  lang={lang}
                  isFavorite={favorites.has(p.name)}
                  onToggle={(name) =>
                    toggleFavorite(name, favorites.has(name))
                  }
                  onRequireLogin={gate.requireLogin}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <FilterDialog
        open={filterOpen}
        lang={lang}
        initialDifficulty={selectedDifficulty}
        initialRating={minRating}
        onApply={(d, r) => {
          setSelectedDifficulty(d);
          setMinRating(r);
        }}
        onClose={() => setFilterOpen(false)}
      />
      <SortDialog
        open={sortOpen}
        lang={lang}
        initialSort={sortBy}
        onApply={setSortBy}
        onClose={() => setSortOpen(false)}
      />
      {gate.dialog}
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border-[1.5px] border-[#E05F14] bg-[#E05F14]/15 px-3 py-1.5 text-xs font-extrabold text-[#E05F14]">
      {label}
      <button onClick={onRemove} aria-label="Remove filter" className="hover:scale-125">
        ✕
      </button>
    </span>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  const { lang } = useLanguage();
  return (
    <div className="mt-4 rounded-xl border border-dashed border-[#D9D2BD] p-10 text-center">
      <p className="text-[#5D6F61]">{t(lang, "no_results")}</p>
      <button
        onClick={onReset}
        className="mt-4 rounded-lg bg-[#2F7D4F] px-5 py-2.5 text-sm font-extrabold text-[#FFFFFF]"
      >
        {t(lang, "reset_filters")}
      </button>
    </div>
  );
}
