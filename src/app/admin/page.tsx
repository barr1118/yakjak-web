"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import { demo, useDemoState } from "@/lib/demo-store";
import { effectiveProviders, providerTypeLabel } from "@/lib/providers";
import { places } from "@/lib/places";
import LoginDialog from "@/components/LoginDialog";
import type { TrailCondition } from "@/lib/types";

const CONDITION_LABEL: Record<TrailCondition, { id: string; en: string }> = {
  good: { id: "Baik", en: "Good" },
  damaged: { id: "Rusak", en: "Damaged" },
  closed: { id: "Ditutup", en: "Closed" },
};

export default function AdminPage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const state = useDemoState();
  const [loginOpen, setLoginOpen] = useState(false);

  if (!user || user.role !== "admin") {
    return (
      <div className="rounded-[28px] border border-[#DED7C4] bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3ECD9] text-2xl">
          🛡
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-[#1F2A21]">
          {t(lang, "admin_title")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#5D6F61]">
          {lang === "id"
            ? "Area admin untuk memverifikasi penyedia baru dan memantau laporan jalur. Gunakan akun demo admin."
            : "Admin area for verifying new providers and monitoring trail reports. Use the demo admin account."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setLoginOpen(true)}
            className="rounded-full bg-[#1F4D3A] px-5 py-2.5 text-xs font-extrabold text-white"
          >
            {t(lang, "login")}
          </button>
          <button
            onClick={() => demo.signInDemo("admin")}
            className="rounded-full border border-[#DED7C4] px-5 py-2.5 text-xs font-extrabold text-[#1F4D3A]"
          >
            {t(lang, "demo_admin")}
          </button>
        </div>
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  const providers = effectiveProviders(state);
  const pending = providers.filter((p) => !p.verified);
  const verified = providers.filter((p) => p.verified);
  const reports = [...state.trailReports].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#B54708]">
        Admin
      </p>
      <h1 className="mt-1.5 font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight text-[#1F2A21]">
        {t(lang, "admin_title")}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-[#5D6F61]">
        {lang === "id"
          ? "Verifikasi lapangan menentukan apakah penyedia boleh tampil dengan badge terverifikasi. Aksi di sini tersimpan di state demo."
          : "Field verification decides whether a provider can display the verified badge. Actions here are saved in the demo state."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat value={`${pending.length}`} label={t(lang, "admin_pending")} />
        <Stat value={`${verified.length}`} label={t(lang, "admin_verified")} />
        <Stat value={`${places.length}`} label={t(lang, "admin_destinations")} />
        <Stat value={`${reports.length}`} label={t(lang, "admin_reports")} />
      </div>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
          {t(lang, "admin_pending")}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[#DED7C4] bg-white p-6 text-center text-xs text-[#9A8F7B]">
            {t(lang, "status_verified")} ✓
          </p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {pending.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E7C9A0] bg-[#FDF7EC] p-4"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black text-white"
                  style={{ backgroundColor: p.color }}
                >
                  {p.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-[#1F2A21]">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-[#5D6F61]">
                    {providerTypeLabel(p.type, lang)} · {p.destinationSlugs.length}{" "}
                    {lang === "id" ? "destinasi" : "destinations"} ·{" "}
                    {p.priceRange}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/providers/${p.id}`}
                    className="rounded-full border border-[#DED7C4] bg-white px-3 py-1.5 text-[10px] font-bold text-[#5D6F61]"
                  >
                    {t(lang, "view_profile")}
                  </Link>
                  <button
                    onClick={() => demo.verifyProvider(p.id, true)}
                    className="rounded-full bg-[#1F4D3A] px-3 py-1.5 text-[10px] font-extrabold text-white"
                  >
                    {t(lang, "verify")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
          {t(lang, "admin_verified")}
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {verified.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-[#DED7C4] bg-white p-3"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-black text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold text-[#1F2A21]">
                  {p.name}
                </p>
                <p className="text-[9px] text-[#5D6F61]">
                  {providerTypeLabel(p.type, lang)}
                </p>
              </div>
              <span className="text-[9px] font-extrabold text-[#1F4D3A]">✓</span>
              <button
                onClick={() => demo.verifyProvider(p.id, false)}
                className="text-[9px] font-bold text-[#9A8F7B] hover:text-[#B42318]"
              >
                {t(lang, "reject")}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
          {t(lang, "admin_destinations")}
        </h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-[#DED7C4] bg-white">
          <table className="w-full min-w-[540px] text-left text-xs">
            <thead className="bg-[#F7F4EC] text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#5D6F61]">
              <tr>
                <th className="px-4 py-2.5">Destinasi</th>
                <th className="px-4 py-2.5">{t(lang, "region")}</th>
                <th className="px-4 py-2.5">{lang === "id" ? "Status" : "Status"}</th>
                <th className="px-4 py-2.5">{lang === "id" ? "Aksi" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {places.map((p) => (
                <tr key={p.slug} className="border-t border-[#EDE7D8]">
                  <td className="px-4 py-2.5 font-extrabold text-[#1F2A21]">
                    {p.name}
                  </td>
                  <td className="px-4 py-2.5 text-[#5D6F61]">{p.region}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                        p.verified
                          ? "bg-[#E3ECD9] text-[#1F4D3A]"
                          : "bg-[#FDF0E3] text-[#B54708]"
                      }`}
                    >
                      {p.verified ? t(lang, "verified") : t(lang, "data_awal")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/place/${p.slug}`}
                      className="text-[10px] font-extrabold text-[#1F4D3A] hover:underline"
                    >
                      {t(lang, "view_profile")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-[#1F2A21]">
          {t(lang, "admin_reports")}
        </h2>
        <div className="mt-3 space-y-2.5">
          {reports.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[#DED7C4] bg-white p-6 text-center text-xs text-[#9A8F7B]">
              {t(lang, "trail_empty")}
            </p>
          )}
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[#DED7C4] bg-white p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold text-[#1F2A21]">
                  {places.find((p) => p.slug === r.placeSlug)?.name ??
                    r.placeSlug}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                    r.condition === "good"
                      ? "bg-[#E3ECD9] text-[#1F4D3A]"
                      : r.condition === "damaged"
                        ? "bg-[#FDF0E3] text-[#B54708]"
                        : "bg-[#F7D7D3] text-[#B42318]"
                  }`}
                >
                  {CONDITION_LABEL[r.condition][lang]}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#5D6F61]">{r.notes}</p>
              <p className="mt-1 text-[9px] text-[#9A8F7B]">
                — {r.userName}
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
