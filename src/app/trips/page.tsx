"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import { demo, getProviderById, useDemoState } from "@/lib/demo-store";
import { places } from "@/lib/places";
import { formatRupiah, offeringsForProvider } from "@/lib/providers";
import { removeTripPack } from "@/lib/trip-pack";
import type { Booking, BookingStatus } from "@/lib/types";
import LoginDialog from "@/components/LoginDialog";

const STATUS_STYLE: Record<BookingStatus, string> = {
  requested: "bg-[#FDF0E3] text-[#B54708] border-[#E7C9A0]",
  confirmed: "bg-[#E3ECD9] text-[#1F4D3A] border-[#C9D9BE]",
  declined: "bg-[#F7D7D3] text-[#B42318] border-[#E89B93]",
  completed: "bg-[#E7E0CC] text-[#5D6F61] border-[#D9D2BD]",
  cancelled: "bg-[#F1EBDA] text-[#9A8F7B] border-[#DED7C4]",
};

function statusKey(s: BookingStatus) {
  return `booking_status_${s}`;
}

export default function TripsPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const state = useDemoState();
  const [loginOpen, setLoginOpen] = useState(false);

  if (!user) {
    return (
      <div className="rounded-[28px] border border-[#DED7C4] bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3ECD9] text-2xl">
          🎒
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#1F2A21]">
          {t(lang, "trips_title")}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[#5D6F61]">
          {lang === "id"
            ? "Masuk untuk melihat pesanan, trip pack offline, dan riwayat ekspedisi. Atau coba mode demo tanpa daftar."
            : "Sign in to see bookings, offline trip packs, and expedition history. Or try demo mode without registering."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setLoginOpen(true)}
            className="rounded-full bg-[#1F4D3A] px-5 py-2.5 text-xs font-extrabold text-white"
          >
            {t(lang, "login")}
          </button>
          <button
            onClick={() => {
              demo.signInDemo("traveler");
            }}
            className="rounded-full border border-[#DED7C4] px-5 py-2.5 text-xs font-extrabold text-[#1F4D3A]"
          >
            {t(lang, "demo_traveler")}
          </button>
        </div>
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  const bookings = state.bookings
    .filter((b) => b.travelerUid === user.uid)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const upcoming = bookings.filter(
    (b) => b.status === "requested" || b.status === "confirmed",
  );
  const past = bookings.filter(
    (b) => b.status !== "requested" && b.status !== "confirmed",
  );
  const trips = state.trips
    .filter((tr) => tr.userUid === user.uid)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const packs = state.packs
    .map((slug) => places.find((p) => p.slug === slug))
    .filter(Boolean);

  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#B54708]">
        {t(lang, "nav_trips")}
      </p>
      <h1 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight text-[#1F2A21]">
        {t(lang, "trips_title")}
      </h1>
      <p className="mt-1 max-w-xl text-sm text-[#5D6F61]">
        {t(lang, "trips_subtitle")}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Stat value={`${upcoming.length}`} label={t(lang, "trips_upcoming")} />
        <Stat value={`${packs.length}`} label={t(lang, "trips_offline")} />
        <Stat value={`${trips.length}`} label={t(lang, "trips_history")} />
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
            {t(lang, "trips_upcoming")}
          </h2>
          <Link
            href="/providers"
            className="text-[10px] font-extrabold text-[#1F4D3A] hover:underline"
          >
            + {t(lang, "book_now")}
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <Empty text={t(lang, "booking_empty")} />
        ) : (
          <div className="mt-3 space-y-3">
            {upcoming.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                lang={lang}
                onCancel={() => demo.updateBookingStatus(b.id, "cancelled")}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
          {t(lang, "trips_offline")}
        </h2>
        {packs.length === 0 ? (
          <Empty text={t(lang, "trip_empty")} />
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {packs.map((p) =>
              p ? (
                <div
                  key={p.slug}
                  className="flex overflow-hidden rounded-2xl border border-[#DED7C4] bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-24 w-24 shrink-0 object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                    <div>
                      <h3 className="truncate text-sm font-extrabold text-[#1F2A21]">
                        {p.name}
                      </h3>
                      <p className="text-[10px] text-[#5D6F61]">
                        {p.region} · {p.distance} km
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/place/${p.slug}`}
                        className="text-[10px] font-extrabold text-[#1F4D3A] hover:underline"
                      >
                        {t(lang, "pack_ready")} →
                      </Link>
                      <button
                        onClick={() => removeTripPack(p)}
                        className="text-[9px] font-bold text-[#9A8F7B] hover:text-[#B42318]"
                      >
                        {t(lang, "remove_pack")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
          {t(lang, "trips_history")}
        </h2>
        {trips.length === 0 ? (
          <Empty text={t(lang, "trip_empty")} />
        ) : (
          <div className="mt-3 space-y-2.5">
            {trips.map((tr) => (
              <div
                key={tr.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#DED7C4] bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-extrabold text-[#1F2A21]">
                    {tr.placeName}
                  </p>
                  <p className="text-[10px] text-[#5D6F61]">
                    {new Date(tr.completedAt).toLocaleDateString(
                      lang === "id" ? "id-ID" : "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}{" "}
                    · {tr.distanceKm.toFixed(2)} km · {tr.durationMin} min
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/place/${tr.placeSlug}`}
                    className="text-[10px] font-extrabold text-[#1F4D3A] hover:underline"
                  >
                    {t(lang, "view_profile")}
                  </Link>
                  <button
                    onClick={() => demo.deleteTrip(tr.id)}
                    className="text-[10px] font-bold text-[#9A8F7B] hover:text-[#B42318]"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
            {lang === "id" ? "Pesanan lampau" : "Past bookings"}
          </h2>
          <div className="mt-3 space-y-3">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} lang={lang} muted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#DED7C4] bg-white px-3 py-3 text-center">
      <div className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F4D3A]">
        {value}
      </div>
      <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#9A8F7B]">
        {label}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-[#DED7C4] bg-white p-6 text-center text-xs text-[#9A8F7B]">
      {text}
    </div>
  );
}

function BookingRow({
  booking,
  lang,
  onCancel,
  muted = false,
}: {
  booking: Booking;
  lang: "id" | "en";
  onCancel?: () => void;
  muted?: boolean;
}) {
  const provider = getProviderById(booking.providerId);
  const dest = places.find((p) => p.slug === booking.destinationSlug);
  const offering = provider
    ? offeringsForProvider(provider.id).find((o) => o.id === booking.offeringId)
    : undefined;

  return (
    <div
      className={`rounded-2xl border border-[#DED7C4] bg-white p-4 ${
        muted ? "opacity-75" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-[#1F2A21]">
            {provider?.name ?? booking.providerId}
          </p>
          <p className="mt-0.5 text-[10px] text-[#5D6F61]">
            {offering?.title ?? booking.offeringId} · {dest?.name ?? booking.destinationSlug}
          </p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${STATUS_STYLE[booking.status]}`}
        >
          {t(lang, statusKey(booking.status))}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#5D6F61]">
        <span>
          {t(lang, "booking_date")}:{" "}
          {new Date(booking.date).toLocaleDateString(
            lang === "id" ? "id-ID" : "en-GB",
            { day: "numeric", month: "short", year: "numeric" },
          )}
        </span>
        <span>
          {t(lang, "booking_pax")}: {booking.pax}
        </span>
        <span className="font-extrabold text-[#1F4D3A]">
          {formatRupiah(booking.totalPrice)}
        </span>
      </div>
      {booking.providerNote && (
        <p className="mt-2 rounded-lg bg-[#F1EBDA] px-2.5 py-1.5 text-[10px] text-[#5D6F61]">
          {t(lang, "booking_provider_note")}: {booking.providerNote}
        </p>
      )}
      {onCancel && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onCancel}
            className="rounded-full border border-[#DED7C4] px-3 py-1.5 text-[9px] font-bold text-[#5D6F61] hover:border-[#B42318] hover:text-[#B42318]"
          >
            {lang === "id" ? "Batalkan" : "Cancel"}
          </button>
        </div>
      )}
    </div>
  );
}
