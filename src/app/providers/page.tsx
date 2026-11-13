"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useDemoState } from "@/lib/demo-store";
import { effectiveProviders, providerTypeLabel } from "@/lib/providers";
import { places } from "@/lib/places";
import ProviderCard from "@/components/ProviderCard";
import type { ProviderType } from "@/lib/types";

const TYPES: (ProviderType | "all")[] = [
  "all",
  "guide",
  "homestay",
  "culinary",
  "craft",
  "boat",
];

export default function ProvidersPage() {
  const { lang } = useLanguage();
  const demoState = useDemoState();
  const [type, setType] = useState<ProviderType | "all">("all");
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const providers = effectiveProviders(demoState);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return providers.filter((p) => {
      const destinationNames = p.destinationSlugs
        .map((s) => places.find((x) => x.slug === s)?.name ?? "")
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        destinationNames.includes(q);
      const matchesType = type === "all" || p.type === type;
      const matchesVerified = !verifiedOnly || p.verified;
      return matchesQuery && matchesType && matchesVerified;
    });
  }, [providers, query, type, verifiedOnly]);

  const verifiedCount = providers.filter((p) => p.verified).length;

  return (
    <div>
      <section className="rounded-[28px] bg-[#14532D] p-6 text-white sm:p-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#D5E3CC]">
          {t(lang, "nav_local")}
        </p>
        <h1 className="mt-2 max-w-2xl font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-tight sm:text-5xl">
          {lang === "id"
            ? "Uang traveler tinggal di gampong."
            : "Traveler money stays in the village."}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
          {t(lang, "providers_subtitle")}
        </p>
        <div className="mt-6 flex flex-wrap gap-6">
          <div>
            <div className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold">
              {providers.length}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">
              {lang === "id" ? "penyedia pilot" : "pilot providers"}
            </div>
          </div>
          <div>
            <div className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#F0D9A8]">
              {verifiedCount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">
              {t(lang, "verified")}
            </div>
          </div>
          <div>
            <div className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold">
              5
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">
              {lang === "id" ? "jenis layanan" : "service types"}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-[#E5DDCB] bg-white px-4 shadow-sm">
          <span className="text-sm text-[#5B6B5F]">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === "id"
                ? "Cari nama, layanan, atau destinasi…"
                : "Search name, service, or destination…"
            }
            className="w-full bg-transparent text-sm outline-none placeholder-[#7C6C58]"
          />
        </div>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-[#E5DDCB] bg-white px-4 text-[11px] font-extrabold text-[#5B6B5F]">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="h-4 w-4 accent-[#14532D]"
          />
          {t(lang, "verified")} {lang === "id" ? "saja" : "only"}
        </label>
      </div>

      <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {TYPES.map((ty) => (
          <button
            key={ty}
            onClick={() => setType(ty)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
              type === ty
                ? "border-[#14532D] bg-[#14532D] text-white"
                : "border-[#E5DDCB] bg-white text-[#5B6B5F]"
            }`}
          >
            {ty === "all" ? (lang === "id" ? "Semua" : "All") : providerTypeLabel(ty, lang)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#E5DDCB] bg-white p-10 text-center">
          <p className="text-sm text-[#5B6B5F]">
            {lang === "id"
              ? "Tidak ada penyedia yang cocok."
              : "No matching providers."}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProviderCard key={p.id} provider={p} lang={lang} />
          ))}
        </div>
      )}

      <section className="mt-10 rounded-2xl border border-[#D5E3CC] bg-[#F1F6EC] p-6">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#17251C]">
          {lang === "id" ? "Kamu warga lokal?" : "Are you a local host?"}
        </h2>
        <p className="mt-1 max-w-xl text-sm text-[#5B6B5F]">
          {lang === "id"
            ? "Daftarkan pemanduan, homestay, warung, kerajinan, atau perahu. Tim YakJak akan melakukan verifikasi lapangan sebelum listing tampil."
            : "List your guiding, homestay, food, craft, or boat service. YakJak verifies each provider in the field before the listing goes live."}
        </p>
        <Link
          href="/profile"
          className="mt-4 inline-block rounded-full bg-[#14532D] px-5 py-2.5 text-xs font-extrabold text-white"
        >
          {t(lang, "become_provider")} →
        </Link>
      </section>
    </div>
  );
}
