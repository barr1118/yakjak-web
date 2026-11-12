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
  { href: "/map", key: "nav_map", icon: MapIcon },
  { href: "/offline", key: "nav_offline", icon: DownloadIcon },
  { href: "/profile", key: "nav_profile", icon: UserIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const { user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Top bar (desktop + mobile header) */}
      <header className="sticky top-0 z-40 border-b border-[#D9D2BD] bg-[#F1EBDA]/95 shadow-[0_1px_10px_rgba(31,42,33,0.08)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2F7D4F] text-lg font-black text-[#FFFFFF]">
              Y
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-wide text-[#1F2A21]">
                YAKJAK.ID
              </span>
              <span className="hidden text-[11px] text-[#5D6F61] sm:block">
                {t(lang, "app_tagline")}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold tracking-widest transition-colors ${
                  isActive(pathname, href)
                    ? "bg-[#E7E0CC] text-[#2F7D4F]"
                    : "text-[#5D6F61] hover:bg-[#E7E0CC]/50 hover:text-[#1F2A21]"
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
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#E7E0CC] text-[#1F2A21] ring-1 ring-[#D9D2BD]"
                  aria-label="Account menu"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#D9D2BD] bg-[#FFFFFF] shadow-xl">
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block max-w-full truncate px-4 py-3 text-sm font-bold text-[#1F2A21] hover:bg-[#E7E0CC]"
                      >
                        {user.displayName ?? user.email ?? t(lang, "guest")}
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-[#5D6F61] hover:bg-[#E7E0CC] hover:text-[#1F2A21]"
                      >
                        {t(lang, "logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="rounded-lg bg-[#2F7D4F] px-4 py-2 text-[13px] font-extrabold text-[#FFFFFF] transition-colors hover:bg-[#3E9B63]"
              >
                {t(lang, "login")}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav (mobile only, mirrors Flutter BottomNavigationBar) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D9D2BD] bg-[#F1EBDA] md:hidden">
        <div className="grid grid-cols-4">
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-extrabold tracking-widest transition-colors ${
                  active ? "text-[#2F7D4F]" : "text-[#5D6F61]"
                }`}
              >
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
    <div className="flex overflow-hidden rounded-lg border border-[#D9D2BD] text-[12px] font-bold">
      {(["en", "id"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1.5 uppercase ${
            lang === l ? "bg-[#2F7D4F] text-[#FFFFFF]" : "text-[#5D6F61] hover:text-[#1F2A21]"
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M9 20l-5.5-2.5v-13L9 7l6-2.5L20.5 7v13L15 17.5 9 20z" strokeLinejoin="round" />
      <path d="M9 7v13M15 4.5v13" />
    </svg>
  );
}

export function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
