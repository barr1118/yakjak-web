"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "./i18n";

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LanguageCtx>({ lang: "id", setLang: () => {} });

const KEY = "yakjak-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start in Indonesian so the first render matches the SSR HTML. The saved
  // preference (EN/ID) is applied right after mount.
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "en" || saved === "id") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  return useContext(Ctx);
}
