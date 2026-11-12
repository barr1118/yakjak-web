"use client";

import { useState } from "react";
import { useAuth, authErrorMessage } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { t } from "@/lib/i18n";

/** Mirrors yakjak_app/lib/widgets/login_dialog.dart */
export default function LoginDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const { signIn, register, signInWithGoogle, authError, clearAuthError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local submit errors take precedence; otherwise show redirect-flow errors
  // (e.g. returning from Google with a failure).
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[#D9D2BD] bg-[#FFFFFF] p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-[#5D6F61] hover:text-[#1F2A21]"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-center text-2xl font-extrabold text-[#1F2A21]">
          {isLogin ? t(lang, "welcome_back") : t(lang, "create_account")}
        </h2>
        <p className="mt-2 text-center text-sm text-[#66766A]">
          {isLogin ? t(lang, "login_to_save") : t(lang, "register_to_save")}
        </p>

            {shownError && (
              <div className="mt-4 rounded border border-[#E89B93] bg-[#F7D7D3]/20 p-2 text-xs text-[#B42318]">
                {shownError}
              </div>
            )}

        <label className="mt-6 block text-sm text-[#5D6F61]">{t(lang, "email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#D9D2BD] bg-[#F4F1E8] px-3 py-2.5 text-[#1F2A21] outline-none focus:border-[#2F7D4F]"
        />
        <label className="mt-4 block text-sm text-[#5D6F61]">{t(lang, "password")}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="mt-1 w-full rounded-lg border border-[#D9D2BD] bg-[#F4F1E8] px-3 py-2.5 text-[#1F2A21] outline-none focus:border-[#2F7D4F]"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#2F7D4F] py-3 font-extrabold text-[#FFFFFF] disabled:opacity-60"
        >
          {loading ? "…" : isLogin ? t(lang, "login") : t(lang, "register")}
        </button>
        <button
          onClick={google}
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#D9D2BD] py-3 font-bold text-[#1F2A21] hover:bg-[#F4F1E8] disabled:opacity-60"
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
          className="mt-4 w-full text-center text-sm font-bold text-[#2F7D4F]"
        >
          {isLogin ? t(lang, "no_account_register") : t(lang, "have_account_login")}
        </button>
      </div>
    </div>
  );
}
