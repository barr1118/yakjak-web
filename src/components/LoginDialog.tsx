"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, authErrorMessage } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";
import type { Role } from "@/lib/types";

const DEMO_ROLES: {
  role: Role;
  labelKey: string;
  icon: string;
  desc: string;
}[] = [
  {
    role: "traveler",
    labelKey: "demo_traveler",
    icon: "🎒",
    desc: "Jelajah, unduh trip pack, dan ajukan pesanan.",
  },
  {
    role: "provider",
    labelKey: "demo_provider",
    icon: "🧭",
    desc: "Lihat permintaan masuk dan konfirmasi booking.",
  },
  {
    role: "admin",
    labelKey: "demo_admin",
    icon: "🛡",
    desc: "Verifikasi penyedia dan moderasi laporan.",
  },
];

export default function LoginDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { lang } = useLanguage();
  const {
    signIn,
    register,
    signInWithGoogle,
    signInDemo,
    authError,
    clearAuthError,
  } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shownError = error ?? authError;

  const handleClose = () => {
    clearAuthError();
    setError(null);
    onClose();
  };

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
      handleClose();
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? String(e);
      setError(authErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? String(e);
      setError(authErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const demo = (role: Role) => {
    signInDemo(role);
    handleClose();
    router.push(
      role === "provider" ? "/provider" : role === "admin" ? "/admin" : "/trips",
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0B1F17]/75 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#DED7C4] bg-[#FBFAF6] p-6 shadow-2xl sm:p-8">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#5D6F61] hover:bg-[#EDE7D8] hover:text-[#1F2A21]"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="pr-8">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#B54708]">
            YakJak Access
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl font-semibold leading-tight text-[#1F2A21]">
            {isLogin ? t(lang, "welcome_back") : t(lang, "create_account")}
          </h2>
          <p className="mt-1 text-sm text-[#5D6F61]">
            {isLogin ? t(lang, "login_to_save") : t(lang, "register_to_save")}
          </p>
        </div>

        {/* Demo is the fastest path for reviewers. */}
        <div className="mt-5 rounded-2xl border border-[#C9D9BE] bg-[#EDF3E5] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1F4D3A]">
                {t(lang, "demo_login")}
              </p>
              <p className="mt-0.5 text-[11px] text-[#5D6F61]">
                Tanpa daftar. Data tersimpan di browser ini.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {DEMO_ROLES.map((d) => (
              <button
                key={d.role}
                onClick={() => demo(d.role)}
                className="group rounded-xl border border-[#C9D9BE] bg-white px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-[#2F7D4F] hover:shadow-sm"
              >
                <span className="text-lg">{d.icon}</span>
                <span className="mt-1 block text-[11px] font-extrabold text-[#1F2A21]">
                  {t(lang, d.labelKey)}
                </span>
                <span className="mt-0.5 block text-[9px] leading-snug text-[#5D6F61]">
                  {d.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A8F7B]">
          <span className="h-px flex-1 bg-[#DED7C4]" />
          atau akun
          <span className="h-px flex-1 bg-[#DED7C4]" />
        </div>

        {shownError && (
          <div className="mb-4 rounded-xl border border-[#E89B93] bg-[#F7D7D3]/40 p-3 text-xs text-[#B42318]">
            {shownError}
          </div>
        )}

        <label className="block text-xs font-bold text-[#5D6F61]">
          {t(lang, "email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[#DED7C4] bg-white px-3.5 py-2.5 text-sm text-[#1F2A21] outline-none focus:border-[#2F7D4F]"
        />
        <label className="mt-4 block text-xs font-bold text-[#5D6F61]">
          {t(lang, "password")}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="mt-1 w-full rounded-xl border border-[#DED7C4] bg-white px-3.5 py-2.5 text-sm text-[#1F2A21] outline-none focus:border-[#2F7D4F]"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-[#1F4D3A] py-3 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {loading ? "…" : isLogin ? t(lang, "login") : t(lang, "register")}
        </button>
        <button
          onClick={google}
          disabled={loading}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#DED7C4] bg-white py-3 text-sm font-bold text-[#1F2A21] hover:bg-[#F4F1E8] disabled:opacity-60"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base font-black text-[#4285F4]">
            G
          </span>
          {t(lang, "sign_in_google")}
        </button>
        <button
          onClick={() => {
            setIsLogin((v) => !v);
            setError(null);
          }}
          className="mt-4 w-full text-center text-xs font-bold text-[#2F7D4F]"
        >
          {isLogin
            ? t(lang, "no_account_register")
            : t(lang, "have_account_login")}
        </button>
      </div>
    </div>
  );
}
