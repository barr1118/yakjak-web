"use client";

import Link from "next/link";
import type { Provider } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { places } from "@/lib/places";
import { providerTypeLabel } from "@/lib/providers";

export default function ProviderCard({
  provider,
  lang,
}: {
  provider: Provider;
  lang: Lang;
}) {
  const destinationNames = provider.destinationSlugs
    .map((slug) => places.find((p) => p.slug === slug)?.name)
    .filter(Boolean)
    .slice(0, 2);

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group flex h-full flex-col rounded-2xl border border-[#DED7C4] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2F7D4F]/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white"
          style={{ backgroundColor: provider.color }}
        >
          {provider.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-extrabold text-[#1F2A21]">
              {provider.name}
            </h3>
            {provider.verified && (
              <span className="shrink-0 rounded-full bg-[#E3ECD9] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.1em] text-[#1F4D3A]">
                ✓ {t(lang, "verified")}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-[#5D6F61]">
            {providerTypeLabel(provider.type, lang)} · {provider.rating.toFixed(1)} ★
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-[#5D6F61]">
        {provider.bio}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {destinationNames.map((name) => (
          <span
            key={name}
            className="rounded-full bg-[#F1EBDA] px-2 py-1 text-[9px] font-bold text-[#5D6F61]"
          >
            {name}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#EDE7D8] pt-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9A8F7B]">
            {lang === "id" ? "Harga" : "Price"}
          </p>
          <p className="text-sm font-extrabold text-[#1F4D3A]">
            {provider.priceRange}
          </p>
        </div>
        <span className="rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[10px] font-extrabold text-white transition-colors group-hover:bg-[#2F7D4F]">
          {t(lang, "view_profile")}
        </span>
      </div>
    </Link>
  );
}
