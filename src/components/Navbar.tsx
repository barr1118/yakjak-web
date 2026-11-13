"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { t, type Lang } from "@/lib/i18n";
import LoginDialog from "./LoginDialog";

const NAV = [
  { href: "/", key: "nav_explore", icon: CompassIcon },
  { href: "/trips", key: "nav_trips", icon: RouteIcon },
  { href: "/providers", key: "nav_local", icon: UsersIcon },
  { href: "/profile", key: "nav_profile", icon: UserIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function roleKey(role: "traveler" | "provider" | "admin") {
  if (role === "provider") return "demo_provider";
  if (role === "admin") return "demo_admin";
  return "demo_traveler";
}

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const { user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E5DDCB] bg-[#FAF7EF]/92 shadow-[0_1px_0_rgba(31,42,33,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14532D] text-lg font-black text-white shadow-sm">
              Y
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-[0.08em] text-[#17251C]">
                YAKJAK
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5B6B5F] sm:block">
                Ekoturisme Aceh
              </span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-extrabold tracking-[0.12em] transition-colors ${
                  isActive(pathname, href)
                    ? "bg-[#E8F0E4] text-[#14532D]"
                    : "text-[#5B6B5F] hover:bg-[#F1EADD] hover:text-[#17251C]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(lang, key)}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <LangSwitch lang={lang} setLang={setLang} />
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#ECE5D6] text-[#17251C] ring-1 ring-[#E2DAC8]"
                  aria-label="Account menu"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-black text-[#14532D]">
                      {(user.displayName ?? "Y").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-[#E5DDCB] bg-white shadow-xl">
                      <div className="border-b border-[#F1EADD] px-4 py-3">
                        <div className="truncate text-sm font-extrabold text-[#17251C]">
                          {user.displayName ?? user.email ?? t(lang, "guest")}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5B6B5F]">
                          <span>{t(lang, roleKey(user.role))}</span>
                          {user.isDemo && (
                            <span className="rounded-full bg-[#F5E2D5] px-2 py-0.5 text-[9px] text-[#C2410C]">
                              {t(lang, "demo_mode")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-bold text-[#17251C] hover:bg-[#F7F3EA]"
                      >
                        {t(lang, "nav_profile")}
                      </Link>
                      {(user.role === "provider" || user.role === "admin") && (
                        <Link
                          href={user.role === "admin" ? "/admin" : "/provider"}
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-3 text-sm font-bold text-[#1B6B3A] hover:bg-[#F7F3EA]"
                        >
                          {user.role === "admin"
                            ? t(lang, "admin_title")
                            : t(lang, "provider_dashboard")}
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 border-t border-[#F1EADD] px-4 py-3 text-left text-sm font-bold text-[#5B6B5F] hover:bg-[#F7F3EA] hover:text-[#17251C]"
                      >
                        {t(lang, "logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLoginOpen(true)}
                  className="hidden rounded-full px-3 py-2 text-[12px] font-extrabold text-[#14532D] hover:bg-[#E8F0E4] sm:block"
                >
                  {t(lang, "demo_login")}
                </button>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="rounded-full bg-[#14532D] px-4 py-2 text-[12px] font-extrabold text-white transition-colors hover:bg-[#1B6B3A]"
                >
                  {t(lang, "login")}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5DDCB] bg-[#FAF7EF]/96 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4">
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[9px] font-extrabold tracking-[0.12em] transition-colors ${
                  active ? "text-[#14532D]" : "text-[#5B6B5F]"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#1B6B3A]" />
                )}
                <Icon className="h-5 w-5" />
                {t(lang, key)}
              </Link>
            );
          })}
        </div>
      </nav>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

export function LangSwitch({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-full border border-[#E5DDCB] text-[10px] font-extrabold">
      {(["en", "id"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1.5 uppercase ${
            lang === l
              ? "bg-[#14532D] text-white"
              : "text-[#5B6B5F] hover:text-[#17251C]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon
        points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function RouteIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path
        d="M8.5 19h3.5a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
    </svg>
  );
}

export function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path d="M9 20l-5.5-2.5v-13L9 7l6-2.5L20.5 7v13L15 17.5 9 20z" strokeLinejoin="round" />
      <path d="M9 7v13M15 4.5v13" />
    </svg>
  );
}

export function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path
        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
