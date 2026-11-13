"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import { demo, getProviderForOwner, useDemoState } from "@/lib/demo-store";
import {
  effectiveProvider,
  formatRupiah,
  offeringsForProvider,
} from "@/lib/providers";
import { places } from "@/lib/places";
import type { Booking } from "@/lib/types";
import LoginDialog from "@/components/LoginDialog";

export default function ProviderDashboard() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const state = useDemoState();
  const [loginOpen, setLoginOpen] = useState(false);

  if (!user || (user.role !== "provider" && user.role !== "admin")) {
    return (
      <div className="rounded-[28px] border border-[#DED7C4] bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3ECD9] text-2xl">
          📋
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#1F2A21]">
          {t(lang, "provider_dashboard")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#5D6F61]">
          {lang === "id"
            ? "Halaman ini untuk penyedia terverifikasi. Coba akun demo provider untuk melihat permintaan masuk dan status listing."
            : "This page is for verified providers. Try the demo provider account to see incoming requests and listing status."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setLoginOpen(true)}
            className="rounded-full bg-[#1F4D3A] px-5 py-2.5 text-xs font-extrabold text-white"
          >
            {t(lang, "login")}
          </button>
          <button
            onClick={() => demo.signInDemo("provider")}
            className="rounded-full border border-[#DED7C4] px-5 py-2.5 text-xs font-extrabold text-[#1F4D3A]"
          >
            {t(lang, "demo_provider")}
          </button>
        </div>
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  const base = getProviderForOwner(user.uid);
  const provider = base ? effectiveProvider(base.id, state) : undefined;

  if (!provider) {
    return (
      <div className="rounded-2xl border border-dashed border-[#DED7C4] bg-white p-10 text-center">
        <p className="text-sm text-[#5D6F61]">
          {lang === "id"
            ? "Akun ini belum terhubung ke profil penyedia."
            : "This account is not linked to a provider profile."}
        </p>
        <Link
          href="/providers"
          className="mt-3 inline-block text-xs font-extrabold text-[#1F4D3A] hover:underline"
        >
          {t(lang, "providers_title")} →
        </Link>
      </div>
    );
  }

  const bookings = state.bookings
    .filter((b) => b.providerId === provider.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pending = bookings.filter((b) => b.status === "requested");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const offerings = offeringsForProvider(provider.id);

  const decide = (booking: Booking, status: "confirmed" | "declined") => {
    const note =
      status === "declined"
        ? window.prompt(
            lang === "id" ? "Alasan menolak (opsional):" : "Reason for declining (optional):",
          ) ?? ""
        : "";
    demo.updateBookingStatus(booking.id, status, note || undefined);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#B54708]">
            {t(lang, "provider_dashboard")}
          </p>
          <h1 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight text-[#1F2A21]">
            {provider.name}
          </h1>
          <p className="mt-1 text-xs text-[#5D6F61]">
            {provider.verified
              ? t(lang, "provider_verified")
              : t(lang, "provider_unverified")}{" "}
            · {provider.rating.toFixed(1)} ★ · {provider.priceRange}
          </p>
        </div>
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-full bg-[#1F4D3A] px-4 py-2 text-xs font-extrabold text-white"
          >
            {t(lang, "admin_title")} →
          </Link>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Stat value={`${pending.length}`} label={t(lang, "requests")} />
        <Stat value={`${confirmed.length}`} label={t(lang, "booking_status_confirmed")} />
        <Stat value={`${offerings.length}`} label={t(lang, "listing")} />
      </div>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
          {t(lang, "requests")}
        </h2>
        {bookings.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#DED7C4] bg-white p-6 text-center text-xs text-[#9A8F7B]">
            {t(lang, "no_requests")}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {bookings.map((b) => {
              const dest = places.find((p) => p.slug === b.destinationSlug);
              const offering = offerings.find((o) => o.id === b.offeringId);
              const canAct = b.status === "requested";
              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-[#DED7C4] bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-[#1F2A21]">
                        {b.travelerName}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#5D6F61]">
                        {offering?.title ?? b.offeringId} · {dest?.name ?? b.destinationSlug}
                      </p>
                    </div>
                    <Status status={b.status} lang={lang} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#5D6F61]">
                    <span>{b.date}</span>
                    <span>
                      {t(lang, "booking_pax")}: {b.pax}
                    </span>
                    <span className="font-extrabold text-[#1F4D3A]">
                      {formatRupiah(b.totalPrice)}
                    </span>
                    <span>
                      {b.contact}
                    </span>
                  </div>
                  {b.notes && (
                    <p className="mt-2 rounded-lg bg-[#F7F4EC] px-2.5 py-1.5 text-[10px] text-[#5D6F61]">
                      “{b.notes}”
                    </p>
                  )}
                  {canAct && (
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => decide(b, "declined")}
                        className="rounded-full border border-[#E89B93] px-3 py-1.5 text-[10px] font-extrabold text-[#B42318] hover:bg-[#F7D7D3]/40"
                      >
                        {t(lang, "decline")}
                      </button>
                      <button
                        onClick={() => decide(b, "confirmed")}
                        className="rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[10px] font-extrabold text-white hover:bg-[#2F7D4F]"
                      >
                        {t(lang, "confirm")}
                      </button>
                    </div>
                  )}
                  {b.providerNote && (
                    <p className="mt-2 text-[9px] italic text-[#9A8F7B]">
                      {t(lang, "booking_provider_note")}: {b.providerNote}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
            {t(lang, "listing")}
          </h2>
          <Link
            href={`/providers/${provider.id}`}
            className="text-[10px] font-extrabold text-[#1F4D3A] hover:underline"
          >
            {t(lang, "view_profile")} →
          </Link>
        </div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {offerings.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-[#DED7C4] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold text-[#1F2A21]">
                    {o.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#5D6F61]">
                    {places.find((p) => p.slug === o.destinationSlug)?.name}
                  </p>
                </div>
                <span className="text-sm font-black text-[#1F4D3A]">
                  {formatRupiah(o.price)}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-[#9A8F7B]">
                {t(lang, "capacity")} {o.capacity} · /{o.unit}
              </p>
            </div>
          ))}
        </div>
      </section>
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

function Status({ status, lang }: { status: Booking["status"]; lang: "id" | "en" }) {
  const style =
    status === "requested"
      ? "bg-[#FDF0E3] text-[#B54708] border-[#E7C9A0]"
      : status === "confirmed"
        ? "bg-[#E3ECD9] text-[#1F4D3A] border-[#C9D9BE]"
        : status === "declined"
          ? "bg-[#F7D7D3] text-[#B42318] border-[#E89B93]"
          : "bg-[#F1EBDA] text-[#9A8F7B] border-[#DED7C4]";
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${style}`}
    >
      {t(lang, `booking_status_${status}`)}
    </span>
  );
}
