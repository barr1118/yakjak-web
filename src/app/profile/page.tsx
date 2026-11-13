"use client";

import Link from "next/link";
import { useState } from "react";
import { findByName } from "@/lib/places";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { usePlaces } from "@/lib/places-context";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/store";
import { demo, resetDemo, useDemoState } from "@/lib/demo-store";
import LoginDialog from "@/components/LoginDialog";
import { LangSwitch, UserIcon } from "@/components/Navbar";

function roleKey(role: "traveler" | "provider" | "admin") {
  if (role === "provider") return "demo_provider";
  if (role === "admin") return "demo_admin";
  return "demo_traveler";
}

export default function ProfilePage() {
  const { lang, setLang } = useLanguage();
  const { allPlaces } = usePlaces();
  const { user, authLoading, logout, updateDisplayName, authError } = useAuth();
  const { favorites } = useFavorites();
  const state = useDemoState();
  const [loginOpen, setLoginOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (authLoading) {
    return <div className="py-20 text-center text-[#5D6F61]">…</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E3ECD9]">
          <UserIcon className="h-10 w-10 text-[#1F4D3A]" />
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#1F2A21]">
          {t(lang, "nav_profile")}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-[#5D6F61]">
          {t(lang, "login_to_view_profile")}
        </p>
        {authError && (
          <div className="mt-4 w-full max-w-sm rounded-xl border border-[#E89B93] bg-[#F7D7D3] p-3 text-xs text-[#B42318]">
            {authError}
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setLoginOpen(true)}
            className="rounded-full bg-[#1F4D3A] px-5 py-2.5 text-xs font-extrabold text-white"
          >
            {t(lang, "login")}
          </button>
          <button
            onClick={() => demo.signInDemo("traveler")}
            className="rounded-full border border-[#DED7C4] px-5 py-2.5 text-xs font-extrabold text-[#1F4D3A]"
          >
            {t(lang, "demo_traveler")}
          </button>
        </div>
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  const favoriteList = [...favorites]
    .map((name) => findByName(allPlaces, name))
    .filter((p) => p !== undefined);
  const bookings = state.bookings.filter((b) => b.travelerUid === user.uid);
  const trips = state.trips.filter((tr) => tr.userUid === user.uid);
  const packs = state.packs;

  return (
    <div>
      <section className="overflow-hidden rounded-[28px] bg-[#1F4D3A] text-white">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white/10 text-2xl font-black">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                (user.displayName ?? "Y").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
                  {user.displayName ?? t(lang, "guest")}
                </h1>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#D9C68A]">
                  {t(lang, roleKey(user.role))}
                </span>
                {user.isDemo && (
                  <span className="rounded-full bg-[#F4E2D4] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#B54708]">
                    {t(lang, "demo_mode")}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-white/60">
                {user.email ?? "demo@yakjak.local"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-full border border-white/25 px-4 py-2 text-[10px] font-extrabold text-white hover:bg-white/10"
              >
                {t(lang, "edit_username")}
              </button>
              <button
                onClick={logout}
                className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-extrabold text-white hover:bg-white/15"
              >
                {t(lang, "logout")}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <HeaderStat value={`${favoriteList.length}`} label={t(lang, "favorite_places")} />
            <HeaderStat value={`${bookings.length}`} label={t(lang, "booking_my")} />
            <HeaderStat value={`${trips.length}`} label={t(lang, "trips_history")} />
            <HeaderStat value={`${packs.length}`} label={t(lang, "trips_offline")} />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickLink
          href="/trips"
          icon="🧭"
          title={t(lang, "trips_title")}
          body={lang === "id" ? "Pesanan, trip pack, dan riwayat." : "Bookings, packs, and history."}
        />
        <QuickLink
          href="/providers"
          icon="🤝"
          title={t(lang, "providers_title")}
          body={lang === "id" ? "Guide, homestay, kuliner, perahu." : "Guides, homestays, food, boats."}
        />
        {user.role === "admin" ? (
          <QuickLink
            href="/admin"
            icon="🛡"
            title={t(lang, "admin_title")}
            body={lang === "id" ? "Verifikasi penyedia dan laporan." : "Verify providers and reports."}
          />
        ) : user.role === "provider" ? (
          <QuickLink
            href="/provider"
            icon="📋"
            title={t(lang, "provider_dashboard")}
            body={lang === "id" ? "Permintaan masuk dan status listing." : "Incoming requests and listing status."}
          />
        ) : (
          <QuickLink
            href="/providers"
            icon="🌱"
            title={t(lang, "become_provider")}
            body={lang === "id" ? "Daftarkan layananmu di YakJak." : "List your service on YakJak."}
          />
        )}
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
            {t(lang, "favorite_places")}
          </h2>
          <Link
            href="/"
            className="text-[10px] font-extrabold text-[#1F4D3A] hover:underline"
          >
            + {t(lang, "nav_explore")}
          </Link>
        </div>
        {favoriteList.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#DED7C4] bg-white p-6 text-center text-xs text-[#9A8F7B]">
            {t(lang, "no_favorites")}
          </p>
        ) : (
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {favoriteList.map((p) =>
              p ? (
                <Link
                  key={p.name}
                  href={`/place/${p.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#DED7C4] bg-white p-2.5 hover:border-[#2F7D4F]/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-[#1F2A21]">
                      {p.name}
                    </div>
                    <div className="truncate text-[10px] text-[#5D6F61]">
                      {p.region} · {t(lang, p.category)}
                    </div>
                  </div>
                </Link>
              ) : null,
            )}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-[#DED7C4] bg-white p-5">
        <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#5D6F61]">
          {lang === "id" ? "Pengaturan" : "Settings"}
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-[#1F2A21]">
              {lang === "id" ? "Bahasa aplikasi" : "App language"}
            </p>
            <p className="text-[10px] text-[#9A8F7B]">
              {lang === "id" ? "Indonesia / English" : "Indonesian / English"}
            </p>
          </div>
          <LangSwitch lang={lang} setLang={setLang} />
        </div>
        {user.isDemo && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EDE7D8] pt-4">
            <div>
              <p className="text-sm font-extrabold text-[#1F2A21]">
                {lang === "id" ? "Reset data demo" : "Reset demo data"}
              </p>
              <p className="text-[10px] text-[#9A8F7B]">
                {lang === "id"
                  ? "Kembalikan pesanan dan ulasan ke data awal."
                  : "Restore bookings and reviews to the seed data."}
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Reset data demo?")) resetDemo();
              }}
              className="rounded-full border border-[#DED7C4] px-4 py-2 text-[10px] font-extrabold text-[#5D6F61] hover:border-[#B42318] hover:text-[#B42318]"
            >
              {lang === "id" ? "Reset" : "Reset"}
            </button>
          </div>
        )}
      </section>

      {editOpen && (
        <EditNameDialog
          current={user.displayName ?? ""}
          onClose={() => setEditOpen(false)}
          onSave={async (name) => {
            await updateDisplayName(name);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

function HeaderStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <div className="font-[family-name:var(--font-fraunces)] text-xl font-semibold">
        {value}
      </div>
      <div className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-white/50">
        {label}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#DED7C4] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#2F7D4F]/40 hover:shadow-sm"
    >
      <span className="text-xl">{icon}</span>
      <p className="mt-2 text-sm font-extrabold text-[#1F2A21]">{title}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-[#5D6F61]">{body}</p>
      <span className="mt-2 inline-block text-[10px] font-extrabold text-[#1F4D3A] group-hover:underline">
        →
      </span>
    </Link>
  );
}

function EditNameDialog({
  current,
  onClose,
  onSave,
}: {
  current: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const { lang } = useLanguage();
  const [name, setName] = useState(current);
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-[#DED7C4] bg-white p-6">
        <h2 className="text-lg font-extrabold text-[#1F2A21]">
          {t(lang, "edit_username")}
        </h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-4 w-full rounded-xl border border-[#DED7C4] bg-[#F7F4EC] px-3 py-2.5 text-sm outline-none focus:border-[#2F7D4F]"
        />
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="text-xs font-bold text-[#5D6F61]">
            {t(lang, "cancel")}
          </button>
          <button
            disabled={saving || name.trim() === ""}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(name.trim());
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-full bg-[#1F4D3A] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50"
          >
            {t(lang, "save")}
          </button>
        </div>
      </div>
    </div>
  );
}
