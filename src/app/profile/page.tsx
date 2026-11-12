"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findByName } from "@/lib/places";
import { t, type Lang } from "@/lib/i18n";
import { useLanguage } from "@/lib/language";
import { usePlaces } from "@/lib/places-context";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/store";
import LoginDialog from "@/components/LoginDialog";
import { LangSwitch, UserIcon } from "@/components/Navbar";
import {
  deleteHistory,
  subscribeHistory,
  type HistoryEntry,
} from "@/lib/history";

function formatDate(d: Date | null, lang: Lang): string {
  if (!d) return "";
  return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Mirrors yakjak_app/lib/screens/profile_page.dart */
export default function ProfilePage() {
  const { lang, setLang } = useLanguage();
  const { allPlaces } = usePlaces();
  const { user, authLoading, logout, updateDisplayName, authError } = useAuth();
  const { favorites } = useFavorites();
  const [loginOpen, setLoginOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeHistory(user.uid, setHistory);
    return () => {
      unsub();
      setHistory([]);
    };
  }, [user]);

  if (authLoading) {
    return <div className="py-20 text-center text-[#5D6F61]">…</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <UserIcon className="h-20 w-20 text-[#5D6F61]" />
        <p className="mt-4 text-[#5D6F61]">{t(lang, "login_to_view_profile")}</p>
        {authError && (
          <div className="mt-4 w-full max-w-sm rounded-lg border border-[#E89B93] bg-[#F7D7D3] p-3 text-xs text-[#B42318]">
            {authError}
          </div>
        )}
        <button
          onClick={() => setLoginOpen(true)}
          className="mt-6 rounded-lg bg-[#2F7D4F] px-6 py-2.5 font-extrabold text-[#FFFFFF]"
        >
          {t(lang, "login")}
        </button>
        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  const favoriteList = [...favorites]
    .map((name) => findByName(allPlaces, name))
    .filter((p) => p !== undefined);

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6">
      {/* Header gradient */}
      <div className="border-b border-[#D9D2BD] bg-gradient-to-b from-[#DCEAD8] to-[#F4F1E8] px-6 pb-6 pt-14">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E7E0CC]">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-10 w-10 text-[#1F2A21]" />
            )}
          </div>
          <h1 className="truncate text-3xl font-extrabold tracking-tight text-[#1F2A21]">
            {user.displayName ?? t(lang, "guest")}
          </h1>
        </div>
        <div className="mx-auto mt-6 flex max-w-3xl items-center gap-3">
          <button
            onClick={() => setEditOpen(true)}
            className="rounded-full border border-[#2F7D4F] px-6 py-1.5 font-bold text-[#2F7D4F] transition-colors hover:bg-[#2F7D4F] hover:text-white"
          >
            Edit
          </button>
          <div className="ml-auto">
            <LangSwitch lang={lang} setLang={setLang} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h2 className="text-xl font-extrabold tracking-tight text-[#1F2A21]">{t(lang, "favorite_places")}</h2>
        {favoriteList.length === 0 ? (
          <p className="py-8 text-[#5D6F61]">{t(lang, "no_favorites")}</p>
        ) : (
          <div className="mt-4">
            {favoriteList.map((p) =>
              p ? (
                <Link
                  key={p.name}
                  href={`/place/${p.slug}`}
                  className="mb-4 flex items-center gap-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-base font-extrabold text-[#1F2A21]">
                      {p.name}
                    </div>
                    <div className="truncate text-[13px] text-[#5D6F61]">
                      {t(lang, p.category)}
                    </div>
                  </div>
                </Link>
              ) : null,
            )}
          </div>
        )}

        <h2 className="mt-10 text-xl font-extrabold tracking-tight text-[#1F2A21]">
          {t(lang, "history_title")}
        </h2>
        {history.length === 0 ? (
          <p className="py-4 text-sm text-[#5D6F61]">{t(lang, "history_empty")}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-xl border border-[#D9D2BD] bg-[#FFFFFF] px-4 py-3 shadow-sm"
              >
                <span className="text-xl">🏁</span>
                <Link href={`/place/${h.placeSlug}`} className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold text-[#1F2A21] hover:underline">
                    {h.placeName}
                  </div>
                  <div className="text-xs text-[#5D6F61]">
                    {formatDate(h.completedAt, lang)}
                    {h.distanceKm != null && ` · ${h.distanceKm.toFixed(1)} km`}
                    {h.durationMin != null &&
                      ` · ${Math.round(h.durationMin)} ${t(lang, "unit_min")}`}
                  </div>
                </Link>
                <button
                  onClick={() => user && deleteHistory(user.uid, h.id)}
                  aria-label="Delete"
                  className="text-sm font-bold text-[#5D6F61] hover:text-[#B42318]"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-sm text-[#5D6F61]">{user.email}</div>

        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="font-extrabold text-[#5D6F61] hover:text-[#1F2A21]"
          >
            🚪 {t(lang, "logout")}
          </button>
        </div>
      </div>

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
      <div className="relative w-full max-w-sm rounded-xl border border-[#D9D2BD] bg-[#FFFFFF] p-6">
        <h2 className="text-lg font-extrabold text-[#1F2A21]">{t(lang, "edit_username")}</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-4 w-full border-b border-[#D9D2BD] bg-transparent pb-2 text-[#1F2A21] outline-none focus:border-[#E05F14]"
        />
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="font-bold text-[#5D6F61]">
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
            className="font-extrabold text-[#E05F14] disabled:opacity-50"
          >
            {t(lang, "save")}
          </button>
        </div>
      </div>
    </div>
  );
}
