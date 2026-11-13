"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useDemoState } from "@/lib/demo-store";
import {
  effectiveProvider,
  formatRupiah,
  offeringsForProvider,
  providerTypeLabel,
} from "@/lib/providers";
import { places } from "@/lib/places";
import type { Offering } from "@/lib/types";
import BookingDialog from "@/components/BookingDialog";
import LoginDialog from "@/components/LoginDialog";

export default function ProviderProfile({ providerId }: { providerId: string }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const demoState = useDemoState();
  const provider = effectiveProvider(providerId, demoState);
  const offerings = useMemo(() => offeringsForProvider(providerId), [providerId]);
  const [selected, setSelected] = useState<Offering | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  if (!provider) {
    return (
      <div className="rounded-2xl border border-[#E5DDCB] bg-white p-10 text-center">
        <p className="text-sm text-[#5B6B5F]">Provider not found.</p>
        <Link
          href="/providers"
          className="mt-3 inline-block rounded-full bg-[#14532D] px-4 py-2 text-xs font-extrabold text-white"
        >
          ← {t(lang, "nav_local")}
        </Link>
      </div>
    );
  }

  const destinations = provider.destinationSlugs
    .map((slug) => places.find((p) => p.slug === slug))
    .filter(Boolean);

  const book = (offering: Offering) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setSelected(offering);
    setBookingOpen(true);
  };

  return (
    <div>
      <Link
        href="/providers"
        className="text-[11px] font-extrabold text-[#5B6B5F] hover:text-[#14532D]"
      >
        ← {t(lang, "nav_local")}
      </Link>

      <section className="mt-3 overflow-hidden rounded-[28px] bg-[#14532D] text-white">
        <div className="p-6 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl text-2xl font-black"
              style={{ backgroundColor: provider.color }}
            >
              {provider.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold sm:text-4xl">
                  {provider.name}
                </h1>
                {provider.verified ? (
                  <span className="rounded-full bg-[#F0D9A8] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#17251C]">
                    ✓ {t(lang, "provider_verified")}
                  </span>
                ) : (
                  <span className="rounded-full border border-white/25 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white/70">
                    {t(lang, "provider_unverified")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D5E3CC]">
                {providerTypeLabel(provider.type, lang)} · {provider.rating.toFixed(1)} ★ ·{" "}
                {provider.reviewsCount} {lang === "id" ? "ulasan" : "reviews"}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">
                {provider.bio}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-white/60">
                <span>
                  {t(lang, "since")} {provider.since}
                </span>
                <span>
                  {t(lang, "languages")}: {provider.languages.join(", ")}
                </span>
                <span>
                  {lang === "id" ? "Kontak" : "Contact"}: {provider.contact}
                </span>
              </div>
            </div>
            <div className="shrink-0 rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">
                {lang === "id" ? "Kisaran harga" : "Price range"}
              </p>
              <p className="mt-1 text-lg font-extrabold">{provider.priceRange}</p>
              <button
                onClick={() => offerings[0] && book(offerings[0])}
                disabled={offerings.length === 0}
                className="mt-3 w-full rounded-full bg-[#FAF7EF] px-4 py-2.5 text-[11px] font-extrabold text-[#14532D] disabled:opacity-50"
              >
                {t(lang, "book_now")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#17251C]">
            {lang === "id" ? "Layanan" : "Offerings"}
          </h2>
          <div className="mt-3 space-y-3">
            {offerings.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[#E5DDCB] bg-white p-5 text-sm text-[#5B6B5F]">
                {lang === "id"
                  ? "Belum ada layanan yang dipublikasikan."
                  : "No offerings published yet."}
              </p>
            )}
            {offerings.map((o) => {
              const dest = places.find((p) => p.slug === o.destinationSlug);
              return (
                <div
                  key={o.id}
                  className="rounded-2xl border border-[#E5DDCB] bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#17251C]">
                        {o.title}
                      </h3>
                      <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-[#5B6B5F]">
                        {o.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-[#14532D]">
                        {formatRupiah(o.price)}
                      </p>
                      <p className="text-[9px] font-bold text-[#7C6C58]">
                        / {o.unit}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1EADD] pt-3">
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-bold text-[#5B6B5F]">
                      {dest && (
                        <Link
                          href={`/place/${dest.slug}`}
                          className="rounded-full bg-[#F3EEE2] px-2 py-1 hover:text-[#14532D]"
                        >
                          📍 {dest.name}
                        </Link>
                      )}
                      <span className="rounded-full bg-[#F3EEE2] px-2 py-1">
                        {t(lang, "capacity")} {o.capacity}
                      </span>
                    </div>
                    <button
                      onClick={() => book(o)}
                      className="rounded-full bg-[#14532D] px-4 py-2 text-[10px] font-extrabold text-white hover:bg-[#1B6B3A]"
                    >
                      {t(lang, "book_now")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#17251C]">
            {lang === "id" ? "Destinasi yang dilayani" : "Destinations served"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {destinations.map((d) =>
              d ? (
                <Link
                  key={d.slug}
                  href={`/place/${d.slug}`}
                  className="rounded-full border border-[#E5DDCB] bg-white px-3 py-2 text-[10px] font-extrabold text-[#17251C] hover:border-[#1B6B3A]"
                >
                  {d.name}
                </Link>
              ) : null,
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#D5E3CC] bg-[#F1F6EC] p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#14532D]">
              {lang === "id" ? "Kenapa terverifikasi" : "Why verified"}
            </h3>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-[#4F5F54]">
              <li>✓ {lang === "id" ? "Identitas dan layanan dicek tim lapangan" : "Identity and service checked by the field team"}</li>
              <li>✓ {lang === "id" ? "Harga dan kapasitas ditulis transparan" : "Price and capacity stated transparently"}</li>
              <li>✓ {lang === "id" ? "Terhubung dengan aturan gampong/Panglima Laot" : "Connected to gampong/Panglima Laot rules"}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[#E5DDCB] bg-white p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#5B6B5F]">
              {lang === "id" ? "Cara pesan" : "How booking works"}
            </h3>
            <ol className="mt-3 space-y-2 text-[11px] leading-relaxed text-[#5B6B5F]">
              <li>1. {lang === "id" ? "Ajukan tanggal dan jumlah orang." : "Send your date and group size."}</li>
              <li>2. {lang === "id" ? "Penyedia mengonfirmasi via WhatsApp." : "The provider confirms via WhatsApp."}</li>
              <li>3. {lang === "id" ? "Bayar langsung di lokasi." : "Pay directly on site."}</li>
            </ol>
            <p className="mt-3 border-t border-[#F1EADD] pt-3 text-[9px] italic text-[#7C6C58]">
              {t(lang, "booking_pay_note")}
            </p>
          </div>
        </aside>
      </div>

      {bookingOpen && user && (
        <BookingDialog
          open
          onClose={() => setBookingOpen(false)}
          provider={provider}
          offerings={offerings}
          destinationSlug={
            selected?.destinationSlug ?? provider.destinationSlugs[0] ?? ""
          }
          initialOfferingId={selected?.id}
        />
      )}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
